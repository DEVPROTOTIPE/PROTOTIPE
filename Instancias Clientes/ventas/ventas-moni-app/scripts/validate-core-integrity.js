/**
 * validate-core-integrity.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Script de validación AST para PROTOTIPE Core.
 * Detecta modificaciones de campos críticos (stock, caja) fuera de runTransaction.
 *
 * Uso: node scripts/validate-core-integrity.js
 * Se ejecuta en pre-commit y en CI antes del build de producción.
 *
 * Requiere: @babel/parser, @babel/traverse (devDependencies)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';

// Compatibilidad ESM con @babel/traverse
const traverse = _traverse.default ?? _traverse;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '../src');

// Campos de Firestore que solo pueden modificarse dentro de runTransaction
const RISKY_FIELDS = new Set([
  'stock',
  'stockActual',
  'stockMinimo',
  'inventoryQty',
  'cashBalance',
  'saldoCaja',
  'saldoCredito',
  'creditBalance',
  'totalVentas',
  'contadorPedidos',
]);

// --- DESIGN INTEGRITY GUARD REGEXES ---
const FORBIDDEN_FIXED_WIDTH_RE = /\bw-\[(?:[3-9]\d{2})px\]/g;
const FORBIDDEN_HEX_RE = /\b(?:text|bg|border|ring|shadow|from|via|to)-\[#[0-9a-fA-F]{3,8}\]/g;
const STATIC_TAILWIND_COLOR_RE = /\b(?:text|bg|border|ring|shadow|from|via|to)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}(?:\/\d{1,3})?\b/g;
const ALLOWED_ALERT_COLOR_RE = /\b(?:text|bg|border|ring)-(?:red|amber|yellow|green|blue)-(?:50|100|500|600|700)\b/;
const DIRTY_SHADOW_RE = /\b(?:shadow-\[.*(?:rgba?\(0,\s*0,\s*0|#000|black).*]|shadow-black(?:\/\d{1,3})?)\b/g;
const UNSAFE_MOBILE_GRID_RE = /(?<!\b(?:sm|md|lg|xl|2xl):)grid-cols-2\b/g;

const ALLOWED_FILES_FOR_STATIC_COLORS = [
  '/alert/', '/alerts/', '/toast/', '/status/', '/badge/', '/system-feedback/', 'Skeleton'
];

function isAllowedStaticColor(filePath, token) {
  const isSystemFeedbackFile = ALLOWED_FILES_FOR_STATIC_COLORS.some((part) =>
    filePath.replaceAll('\\', '/').includes(part)
  );
  return isSystemFeedbackFile && ALLOWED_ALERT_COLOR_RE.test(token);
}

function validateClassName(filePath, classNameVal, line) {
  const errors = [];
  const warnings = [];
  const relativePath = path.relative(process.cwd(), filePath);

  // 1. Fixed widths
  const fixedWidths = classNameVal.match(FORBIDDEN_FIXED_WIDTH_RE) ?? [];
  for (const token of fixedWidths) {
    errors.push(
      `  ❌ ${relativePath}:${line} — Ancho fijo prohibido "${token}". Usar w-full, max-w-*, minmax(), clamp() o container queries.`
    );
  }

  // 2. Hex colors
  const hexColors = classNameVal.match(FORBIDDEN_HEX_RE) ?? [];
  for (const token of hexColors) {
    errors.push(
      `  ❌ ${relativePath}:${line} — Color hexadecimal hardcodeado "${token}". Usar tokens HSL: var(--color-*).`
    );
  }

  // 3. Static Tailwind colors
  const staticColors = classNameVal.match(STATIC_TAILWIND_COLOR_RE) ?? [];
  for (const token of staticColors) {
    if (!isAllowedStaticColor(filePath, token)) {
      warnings.push(
        `  ⚠️  ${relativePath}:${line} — Color Tailwind estático "${token}". Recomendado usar tokens semánticos: text-[var(--color-on-surface)], bg-[var(--color-surface)], etc.`
      );
    }
  }

  // 4. Dirty shadows
  const dirtyShadows = classNameVal.match(DIRTY_SHADOW_RE) ?? [];
  for (const token of dirtyShadows) {
    errors.push(
      `  ❌ ${relativePath}:${line} — Sombra negra/opaca prohibida "${token}". Usar shadow-soft-sm/md/lg.`
    );
  }

  // 5. Unsafe mobile grids
  const unsafeGrids = classNameVal.match(UNSAFE_MOBILE_GRID_RE) ?? [];
  for (const token of unsafeGrids) {
    warnings.push(
      `  ⚠️  ${relativePath}:${line} — grid-cols-2 sin breakpoint móvil. Recomendado usar grid-responsive-2 o sm:grid-cols-2.`
    );
  }

  return { errors, warnings };
}

// Extensiones a analizar
const EXTENSIONS = new Set(['.js', '.jsx']);

// Directorios a excluir
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', '.firebase', '.git']);

/**
 * Recolecta recursivamente todos los archivos JS/JSX dentro de un directorio.
 */
function collectFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Analiza un archivo JS/JSX con Babel y detecta escrituras de campos críticos
 * fuera de transacciones de Firestore (runTransaction).
 */
function validateFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  const warnings = [];

  let ast;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx'],
      errorRecovery: true,
    });
  } catch {
    // Si el archivo no se puede parsear, lo ignoramos silenciosamente
    return { errors, warnings };
  }

  traverse(ast, {
    CallExpression(nodePath) {
      const callee = nodePath.node.callee;

      // Detectar llamadas a setDoc() o updateDoc()
      const isFirestoreWrite =
        callee.name === 'setDoc' ||
        callee.name === 'updateDoc' ||
        (callee.type === 'MemberExpression' && callee.property.name === 'update');

      if (!isFirestoreWrite) return;

      // Verificar si está dentro de un runTransaction
      const insideTransaction = Boolean(
        nodePath.findParent(
          (parent) =>
            parent.isCallExpression() &&
            (parent.node.callee.name === 'runTransaction' ||
              (parent.node.callee.type === 'MemberExpression' &&
                parent.node.callee.property.name === 'runTransaction'))
        )
      );

      if (insideTransaction) return;

      // Serializar el fragmento de código para buscar campos riesgosos
      const snippet = code.slice(nodePath.node.start, nodePath.node.end);
      const touchedFields = [...RISKY_FIELDS].filter((field) =>
        snippet.includes(field)
      );

      if (touchedFields.length > 0) {
        const { line } = nodePath.node.loc.start;
        const relativePath = path.relative(process.cwd(), filePath);
        errors.push(
          `  ❌ ${relativePath}:${line} — Modificación de [${touchedFields.join(', ')}] fuera de runTransaction(). ` +
          `Los campos de stock, caja y crédito deben actualizarse dentro de una transacción concurrente.`
        );
      }
    },
    JSXAttribute(nodePath) {
      if (nodePath.node.name.name !== 'className') return;
      const valueNode = nodePath.node.value;
      if (!valueNode) return;

      let classNameVal = '';
      if (valueNode.type === 'StringLiteral') {
        classNameVal = valueNode.value;
      } else if (valueNode.type === 'JSXExpressionContainer') {
        const expr = valueNode.expression;
        if (expr.type === 'StringLiteral') {
          classNameVal = expr.value;
        } else if (expr.type === 'TemplateLiteral') {
          classNameVal = expr.quasis.map((q) => q.value.raw).join(' ');
        }
      }

      if (!classNameVal) return;

      const { line } = nodePath.node.loc.start;
      const result = validateClassName(filePath, classNameVal, line);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    },
  });

  return { errors, warnings };
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

console.log('\n🔍 PROTOTIPE — Validador de Integridad del Core\n');

let files = [];
if (process.argv.length > 2) {
  files = process.argv.slice(2)
    .map((f) => path.resolve(f))
    .filter((f) => f.startsWith(SRC_DIR) && fs.existsSync(f) && EXTENSIONS.has(path.extname(f)));
  console.log(`Validando ${files.length} archivo(s) especificado(s) como argumento...`);
} else {
  files = collectFiles(SRC_DIR);
  console.log(`Validando todos los archivos (${files.length}) en el directorio src/...`);
}

const allErrors = [];
const allWarnings = [];

for (const file of files) {
  const result = validateFile(file);
  allErrors.push(...result.errors);
  allWarnings.push(...result.warnings);
}

if (allWarnings.length > 0) {
  console.log(`⚠️  Se detectaron ${allWarnings.length} sugerencias de diseño (No bloqueantes):\n`);
  allWarnings.forEach((warn) => console.warn(warn));
  console.log('');
}

if (allErrors.length === 0) {
  console.log('✅ Sin violaciones críticas de integridad o diseño detectadas.\n');
  process.exit(0);
} else {
  console.error(`❌ Se encontraron ${allErrors.length} violación(es) críticas de integridad o diseño:\n`);
  allErrors.forEach((err) => console.error(err));
  console.error(
    '\n💡 Corrige los errores críticos anteriores (anchos fijos, colores hex hardcodeados, o escrituras sin transacción) para continuar.\n'
  );
  process.exit(1);
}
