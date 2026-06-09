const fs = require('fs');
const path = require('path');

// Fuentes de Verdad y Rutas Base
const SOURCE_FILE = path.join(__dirname, 'GEMINI.md');
// Fuentes de Verdad y Rutas Base
const WORKSPACE_DIR = 'D:\\PROTOTIPE';
const LEGACY_DIR = 'D:\\Aplicaciones';
const CLI_TEMPLATES_DIR = path.join(WORKSPACE_DIR, 'Prototipe-CLI', 'templates');

console.log('🔄 Iniciando sincronización y validación de reglas de IA (GEMINI.md)...');

if (!fs.existsSync(SOURCE_FILE)) {
  console.error(`❌ Error: El archivo fuente de verdad no existe en: ${SOURCE_FILE}`);
  process.exit(1);
}

const sourceContent = fs.readFileSync(SOURCE_FILE, 'utf8');

// Listado de destinos de sincronización
const targets = [];

function scanDirectory(baseDir) {
  if (!fs.existsSync(baseDir)) return;
  try {
    const dirs = fs.readdirSync(baseDir, { withFileTypes: true });
    dirs.forEach(dirent => {
      if (dirent.isDirectory()) {
        const dirPath = path.join(baseDir, dirent.name);
        
        // Consideramos subproyectos los que tienen .git o package.json
        if (dirent.name !== 'Documentacion PROTOTIPE' && 
            dirent.name !== 'Documentacion PROTOTIPE' && 
            (fs.existsSync(path.join(dirPath, '.git')) || fs.existsSync(path.join(dirPath, 'package.json')))) {
          targets.push(path.join(dirPath, 'GEMINI.md'));
        }
      }
    });
  } catch (err) {
    console.error(`⚠️ Advertencia al escanear ${baseDir}:`, err.message);
  }
}

// 1. Escanear dinámicamente subproyectos
scanDirectory(WORKSPACE_DIR);
scanDirectory(LEGACY_DIR);
// Escanear también subdirectorios de Plantillas Core si existen
scanDirectory(path.join(WORKSPACE_DIR, 'Plantillas Core'));
scanDirectory(path.join(WORKSPACE_DIR, 'Central PROTOTIPE'));

// 2. Escanear dinámicamente plantillas en Prototipe-CLI/templates
if (fs.existsSync(CLI_TEMPLATES_DIR)) {
  try {
    const templates = fs.readdirSync(CLI_TEMPLATES_DIR, { withFileTypes: true });
    templates.forEach(dirent => {
      if (dirent.isDirectory()) {
        const templatePath = path.join(CLI_TEMPLATES_DIR, dirent.name);
        targets.push(path.join(templatePath, 'GEMINI.md'));
      }
    });
  } catch (err) {
    console.error('⚠️ Advertencia al escanear plantillas CLI:', err.message);
  }
}

// 3. Ejecutar Sincronización y Validación de Integridad
let updatedCount = 0;
let createdCount = 0;

targets.forEach(targetPath => {
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) return;

  let shouldWrite = false;
  let isNew = false;

  if (fs.existsSync(targetPath)) {
    const targetContent = fs.readFileSync(targetPath, 'utf8');
    if (targetContent !== sourceContent) {
      shouldWrite = true;
    }
  } else {
    shouldWrite = true;
    isNew = true;
  }

  if (shouldWrite) {
    try {
      fs.writeFileSync(targetPath, sourceContent, 'utf8');
      if (isNew) {
        console.log(`🆕 Creado GEMINI.md en: ${targetPath}`);
        createdCount++;
      } else {
        console.log(`✅ Actualizado GEMINI.md en: ${targetPath}`);
        updatedCount++;
      }
    } catch (err) {
      console.error(`❌ Error al escribir en ${targetPath}:`, err.message);
    }
  }
});

console.log(`\n🎉 Sincronización finalizada con éxito.`);
console.log(`- Reglas validadas en total: ${targets.length} destinos.`);
console.log(`- Creados nuevos: ${createdCount}`);
console.log(`- Actualizados por desalineación: ${updatedCount}`);
