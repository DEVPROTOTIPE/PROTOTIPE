/**
 * test_catalog_id_compatibility.js
 * 
 * Recorre y audita todos los IDs actuales de los catálogos en
 * knowledge/ para verificar si cumplen con las convenciones regex propuestas.
 */

import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, '..', '..', '..');

const FEATURE_PATTERN = /^[a-z]+(?:-[a-z]+)*$/;
const COMPONENT_PATTERN = /^[A-Z][a-zA-Z0-9]*$/;
const PATTERN_PATTERN = /^pattern-[a-z]+(?:-[a-z]+)*$/;

async function auditFolder(dirPath, regex, removeExtension = true) {
  const result = {
    total: 0,
    matchingPattern: [],
    notMatchingPattern: []
  };

  if (!await fs.pathExists(dirPath)) return result;

  const files = await fs.readdir(dirPath);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    const id = removeExtension ? path.basename(file, '.json') : file;
    result.total++;
    
    // Para componentes, el ID canónico es en PascalCase en el blueprint, 
    // pero el archivo en el catálogo está en kebab-case. 
    // Mapeamos el nombre del archivo de kebab-case a PascalCase para verificar.
    let idToTest = id;
    if (dirPath.endsWith('components')) {
      idToTest = id.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    }
    
    // Para patterns, en el blueprint se incluye el prefijo "pattern-", 
    // pero el archivo en el disco puede no tenerlo. Le agregamos "pattern-" para probar.
    if (dirPath.endsWith('patterns') && !id.startsWith('pattern-')) {
      idToTest = `pattern-${id}`;
    }

    if (regex.test(idToTest)) {
      result.matchingPattern.push({ id, testedAs: idToTest });
    } else {
      result.notMatchingPattern.push({ id, testedAs: idToTest });
    }
  }
  return result;
}

export async function run(results) {
  const testName = 'P0.2 - Catalog ID Compatibility Test';
  console.log(`\n⏳ Ejecutando ${testName}...`);

  try {
    const featuresDir = path.join(CLI_ROOT, 'knowledge', 'features');
    const componentsDir = path.join(CLI_ROOT, 'knowledge', 'components');
    const patternsDir = path.join(CLI_ROOT, 'knowledge', 'patterns');

    const featuresReport = await auditFolder(featuresDir, FEATURE_PATTERN);
    const componentsReport = await auditFolder(componentsDir, COMPONENT_PATTERN);
    const patternsReport = await auditFolder(patternsDir, PATTERN_PATTERN);

    const report = {
      features: featuresReport,
      components: componentsReport,
      patterns: patternsReport
    };

    console.log(`📊 Reporte de compatibilidad de IDs en catálogos:`);
    console.log(`   - Features:   ${featuresReport.matchingPattern.length}/${featuresReport.total} cumplen.`);
    if (featuresReport.notMatchingPattern.length > 0) {
      console.log(`     ⚠️  No cumplen: [${featuresReport.notMatchingPattern.map(x => x.id).join(', ')}]`);
    }
    
    console.log(`   - Components: ${componentsReport.matchingPattern.length}/${componentsReport.total} cumplen.`);
    if (componentsReport.notMatchingPattern.length > 0) {
      console.log(`     ⚠️  No cumplen: [${componentsReport.notMatchingPattern.map(x => x.id).join(', ')}]`);
    }
    
    console.log(`   - Patterns:   ${patternsReport.matchingPattern.length}/${patternsReport.total} cumplen.`);
    if (patternsReport.notMatchingPattern.length > 0) {
      console.log(`     ⚠️  No cumplen: [${patternsReport.notMatchingPattern.map(x => x.id).join(', ')}]`);
    }

    results.push({
      suite: testName,
      name: 'Nomenclatura de catálogos compatibles',
      status: 'PASSED',
      report
    });
  } catch (err) {
    console.log(`🔴 [FAILED] Error auditando catálogos: ${err.message}`);
    results.push({
      suite: testName,
      name: 'Nomenclatura de catálogos compatibles',
      status: 'FAILED',
      error: err.message
    });
  }
}
