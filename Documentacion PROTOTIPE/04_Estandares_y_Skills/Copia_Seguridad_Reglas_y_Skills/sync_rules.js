const fs = require('fs');
const path = require('path');

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const SOURCE_FILE = path.join(__dirname, 'GEMINI.md');
const WORKSPACE_DIR = path.resolve(__dirname, '..', '..', '..');
const CLI_TEMPLATES_DIR = path.join(WORKSPACE_DIR, 'Prototipe-CLI', 'templates');

// Delimitadores de la sección POR-CORE (rutas específicas de cada proyecto).
// Compatibles con GEMINI.md v2.0 (formato ## SECCIÓN NN)
// Todo lo que esté entre estos dos marcadores se PRESERVA en el destino durante el sync.
const SECTION_START_REGEX = /## SECCI[^N]*N\s*10\b/i;
const SECTION_END_REGEX   = /## SECCI[^N]*N\s*13\b/i;

console.log('🔄 Iniciando sincronización inteligente de reglas de IA (GEMINI.md)...');
console.log(`   Fuente de verdad: ${SOURCE_FILE}\n`);

if (!fs.existsSync(SOURCE_FILE)) {
  console.error(`❌ Error: El archivo fuente no existe en: ${SOURCE_FILE}`);
  process.exit(1);
}

const sourceContent = fs.readFileSync(SOURCE_FILE, 'utf8');

// Verifica que la fuente tenga los marcadores correctos (usando regex resilientes)
const startMatch = sourceContent.match(SECTION_START_REGEX);
const endMatch   = sourceContent.match(SECTION_END_REGEX);
if (!startMatch || !endMatch) {
  console.error('❌ Error: El archivo fuente no contiene los marcadores de sección esperados.');
  console.error('   Se requiere un marcador para la Sección 10 y otro para la Sección 13 (independiente de acentos/código).');
  process.exit(1);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Extrae el bloque entre la Sección 10 y la Sección 13 (excluyendo esta última).
 * Retorna null si algún marcador no existe.
 */
function extractPerCoreSection(content) {
  const startMatch = content.match(SECTION_START_REGEX);
  const endMatch   = content.match(SECTION_END_REGEX);
  if (!startMatch || !endMatch || endMatch.index <= startMatch.index) return null;
  return content.substring(startMatch.index, endMatch.index);
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

  const srcStartMatch = source.match(SECTION_START_REGEX);
  const srcEndMatch   = source.match(SECTION_END_REGEX);
  if (!srcStartMatch || !srcEndMatch) return source;

  return (
    source.substring(0, srcStartMatch.index) +
    targetSection +
    source.substring(srcEndMatch.index)
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
      // Subproyectos válidos: tienen .git o package.json pero no son la carpeta de documentación o contenedores
      if (
        dirent.name !== 'Documentacion PROTOTIPE' &&
        dirent.name !== 'node_modules' &&
        dirent.name !== 'Instancias Clientes' &&
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

// Escanear subproyectos reales dentro de Instancias Clientes (2 niveles)
const instanciasClientesDir = path.join(WORKSPACE_DIR, 'Instancias Clientes');
if (fs.existsSync(instanciasClientesDir)) {
  try {
    fs.readdirSync(instanciasClientesDir, { withFileTypes: true }).forEach(catDirent => {
      if (!catDirent.isDirectory() || catDirent.name.startsWith('.')) return;
      const catPath = path.join(instanciasClientesDir, catDirent.name);
      
      fs.readdirSync(catPath, { withFileTypes: true }).forEach(clientDirent => {
        if (!clientDirent.isDirectory()) return;
        const clientPath = path.join(catPath, clientDirent.name);
        
        if (
          fs.existsSync(path.join(clientPath, '.git')) ||
          fs.existsSync(path.join(clientPath, 'package.json'))
        ) {
          targets.push(path.join(clientPath, 'GEMINI.md'));
        }
      });
    });
  } catch (err) {
    console.error('⚠️  Advertencia al escanear Instancias Clientes:', err.message);
  }
}

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
console.log(`\n💡 La sección "## SECCIÓN 10" fue preservada en cada destino existente.`);
