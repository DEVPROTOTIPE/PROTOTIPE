const fs = require('fs');
const path = require('path');

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const SOURCE_FILE = path.join(__dirname, 'GEMINI.md');
const WORKSPACE_DIR = 'D:\\PROTOTIPE';
const CLI_TEMPLATES_DIR = path.join(WORKSPACE_DIR, 'Prototipe-CLI', 'templates');

// Delimitadores de la sección POR-CORE (rutas específicas de cada proyecto).
// Compatibles con GEMINI.md v2.0 (formato ## SECCIÓN NN)
// Todo lo que esté entre estos dos marcadores se PRESERVA en el destino durante el sync.
const SECTION_START = '## SECCIÓN 10';
const SECTION_END   = '## SECCIÓN 13';

console.log('🔄 Iniciando sincronización inteligente de reglas de IA (GEMINI.md)...');
console.log(`   Fuente de verdad: ${SOURCE_FILE}\n`);

if (!fs.existsSync(SOURCE_FILE)) {
  console.error(`❌ Error: El archivo fuente no existe en: ${SOURCE_FILE}`);
  process.exit(1);
}

const sourceContent = fs.readFileSync(SOURCE_FILE, 'utf8');

// Verifica que la fuente tenga los marcadores correctos
if (!sourceContent.includes(SECTION_START) || !sourceContent.includes(SECTION_END)) {
  console.error('❌ Error: El archivo fuente no contiene los marcadores de sección esperados.');
  console.error(`   Busca: "${SECTION_START}" y "${SECTION_END}"`);
  process.exit(1);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Extrae el bloque entre SECTION_START y SECTION_END (excluye SECTION_END).
 * Retorna null si algún marcador no existe.
 */
function extractPerCoreSection(content) {
  const startIdx = content.indexOf(SECTION_START);
  const endIdx   = content.indexOf(SECTION_END);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;
  return content.substring(startIdx, endIdx);
}

/**
 * Combina: toma la estructura de `source`, pero reemplaza su sección per-core
 * con la sección per-core del `target` (preservando sus rutas propias).
 * Si el target no tiene la sección, usa la fuente sin cambios.
 */
function mergeContent(source, target) {
  const targetSection = extractPerCoreSection(target);
  if (!targetSection) {
    // Target nuevo o sin sección → usar fuente tal cual
    return source;
  }

  const srcStart = source.indexOf(SECTION_START);
  const srcEnd   = source.indexOf(SECTION_END);
  if (srcStart === -1 || srcEnd === -1) return source;

  return (
    source.substring(0, srcStart) +
    targetSection +
    source.substring(srcEnd)
  );
}

// ─── DESCUBRIMIENTO DE DESTINOS ───────────────────────────────────────────────
const targets = [];

function scanDirectory(baseDir) {
  if (!fs.existsSync(baseDir)) return;
  try {
    fs.readdirSync(baseDir, { withFileTypes: true }).forEach(dirent => {
      if (!dirent.isDirectory()) return;
      const dirPath = path.join(baseDir, dirent.name);
      // Subproyectos válidos: tienen .git o package.json pero no son la carpeta de documentación
      if (
        dirent.name !== 'Documentacion PROTOTIPE' &&
        dirent.name !== 'node_modules' &&
        (fs.existsSync(path.join(dirPath, '.git')) ||
         fs.existsSync(path.join(dirPath, 'package.json')))
      ) {
        targets.push(path.join(dirPath, 'GEMINI.md'));
      }
    });
  } catch (err) {
    console.error(`⚠️  Advertencia al escanear ${baseDir}:`, err.message);
  }
}

// Escanear raíces
scanDirectory(WORKSPACE_DIR);

// Escanear subcarpetas clave
scanDirectory(path.join(WORKSPACE_DIR, 'Plantillas Core'));
scanDirectory(path.join(WORKSPACE_DIR, 'Central PROTOTIPE'));

// Escanear templates del CLI
if (fs.existsSync(CLI_TEMPLATES_DIR)) {
  try {
    fs.readdirSync(CLI_TEMPLATES_DIR, { withFileTypes: true }).forEach(dirent => {
      if (dirent.isDirectory()) {
        targets.push(path.join(CLI_TEMPLATES_DIR, dirent.name, 'GEMINI.md'));
      }
    });
  } catch (err) {
    console.error('⚠️  Advertencia al escanear plantillas CLI:', err.message);
  }
}

// ─── SINCRONIZACIÓN ───────────────────────────────────────────────────────────
let updated = 0;
let created = 0;
let preserved = 0;
let skipped = 0;

targets.forEach(targetPath => {
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) return;

  let finalContent;
  let isNew = false;
  let hadPerCoreSection = false;

  if (fs.existsSync(targetPath)) {
    const targetContent = fs.readFileSync(targetPath, 'utf8');
    hadPerCoreSection = extractPerCoreSection(targetContent) !== null;
    finalContent = mergeContent(sourceContent, targetContent);

    // Normalizar line endings para comparar
    const normalizedFinal  = finalContent.replace(/\r\n/g, '\n');
    const normalizedTarget = targetContent.replace(/\r\n/g, '\n');

    if (normalizedFinal === normalizedTarget) {
      skipped++;
      return; // Sin cambios necesarios
    }
  } else {
    finalContent = sourceContent;
    isNew = true;
  }

  try {
    fs.writeFileSync(targetPath, finalContent, 'utf8');
    if (isNew) {
      console.log(`🆕 Creado:    ${targetPath}`);
      created++;
    } else if (hadPerCoreSection) {
      console.log(`🔒 Actualizado (rutas per-core preservadas): ${targetPath}`);
      preserved++;
    } else {
      console.log(`✅ Actualizado: ${targetPath}`);
      updated++;
    }
  } catch (err) {
    console.error(`❌ Error al escribir ${targetPath}:`, err.message);
  }
});

// ─── RESUMEN ──────────────────────────────────────────────────────────────────
console.log(`\n🎉 Sincronización finalizada.`);
console.log(`   Destinos escaneados : ${targets.length}`);
console.log(`   Sin cambios (ok)    : ${skipped}`);
console.log(`   Creados nuevos      : ${created}`);
console.log(`   Actualizados        : ${updated}`);
console.log(`   Actualizados (sección 10-12 preservada): ${preserved}`);
console.log(`\n💡 La sección "${SECTION_START}" fue preservada en cada destino existente.`);
