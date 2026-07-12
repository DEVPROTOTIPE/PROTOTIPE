/**
 * run_p0_2_contract_tests.js
 * 
 * Orquestador principal de la suite de pruebas normativas RED para P0.2.
 * Consolida y evalúa los resultados, emitiendo exit code 1 si hay fallos o vacíos de implementación.
 */

import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';
import { run as runAdapter } from './test_blueprint_adapter.js';
import { run as runSchema } from './test_blueprint_schema.js';
import { run as runKnowledge } from './test_blueprint_knowledge.js';
import { run as runNoWrite } from './test_blueprint_no_write.js';
import { run as runCatalog } from './test_catalog_id_compatibility.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('========================================================');
  console.log('🧪 INICIANDO SUITE DE PRUEBAS NORMATIVAS (RED) - FASE P0.2');
  console.log('========================================================');

  const results = [];

  // Ejecución secuencial de suites
  await runAdapter(results);
  await runSchema(results);
  await runKnowledge(results);
  await runNoWrite(results);
  await runCatalog(results);

  console.log('\n========================================================');
  console.log('📊 CONSOLIDADO DE RESULTADOS DE PRUEBAS P0.2');
  console.log('========================================================');

  let passed = 0;
  let failed = 0;
  let missing = 0;
  let productBehaviorFailed = 0;
  let testInfraFailed = 0;
  const failedTests = [];
  const missingTests = [];
  const productBehaviorFailedTests = [];
  const testInfraFailedTests = [];
  let catalogReport = null;
  let noWriteResult = null;

  results.forEach(r => {
    if (r.status === 'PASSED') {
      passed++;
      if (r.name === 'Nomenclatura de catálogos compatibles') {
        catalogReport = r.report;
      }
    } else if (r.status === 'FAILED') {
      failed++;
      failedTests.push(`${r.suite} -> ${r.name}: ${r.error || 'Fallo de aserción'}`);
    } else if (r.status === 'PRODUCT_BEHAVIOR_FAILURE') {
      productBehaviorFailed++;
      productBehaviorFailedTests.push(`${r.suite} -> ${r.name}: ${r.error || 'Comportamiento de producto no conforme'}`);
      if (r.name === 'Cero escrituras físicas') {
        noWriteResult = r.extra || { validationFailed: true, filesBefore: 0, filesAfter: 1, directoryHashUnchanged: false };
      }
    } else if (r.status === 'TEST_INFRASTRUCTURE_FAILURE') {
      testInfraFailed++;
      testInfraFailedTests.push(`${r.suite} -> ${r.name}: ${r.error || 'Fallo de infraestructura'}`);
    } else if (r.status === 'MISSING_IMPLEMENTATION') {
      missing++;
      missingTests.push(`${r.suite} -> ${r.name}: ${r.error || 'No implementado'}`);
    }
  });

  console.log(`PASSED:                      ${passed}`);
  console.log(`FAILED:                      ${failed}`);
  console.log(`PRODUCT_BEHAVIOR_FAILURE:    ${productBehaviorFailed}`);
  console.log(`TEST_INFRASTRUCTURE_FAILURE: ${testInfraFailed}`);
  console.log(`MISSING_IMPLEMENTATION:      ${missing}`);
  console.log(`TOTAL ASERCIONES:            ${results.length}`);

  if (missingTests.length > 0) {
    console.log('\n🔴 INTERFACES NO IMPLEMENTADAS:');
    missingTests.forEach(t => console.log(`   - ${t}`));
  }

  if (productBehaviorFailedTests.length > 0) {
    console.log('\n🔴 FALLOS DE COMPORTAMIENTO DE PRODUCTO (PENDIENTE INTEGRACIÓN):');
    productBehaviorFailedTests.forEach(t => console.log(`   - ${t}`));
  }

  if (testInfraFailedTests.length > 0) {
    console.log('\n🔴 FALLOS DE INFRAESTRUCTURA DE PRUEBAS:');
    testInfraFailedTests.forEach(t => console.log(`   - ${t}`));
  }

  if (failedTests.length > 0) {
    console.log('\n🔴 PRUEBAS FALLIDAS (ASERCIONES DE CÓDIGO PRODUCTIVO):');
    failedTests.forEach(t => console.log(`   - ${t}`));
  }

  // Generar reporte de salida JSON estructurado para el chatbot
  const hasErrors = failed > 0 || missing > 0 || productBehaviorFailed > 0 || testInfraFailed > 0;
  const finalSummary = {
    passed,
    failed,
    productBehaviorFailed,
    testInfraFailed,
    missing,
    exitCode: hasErrors ? 1 : 0,
    failedTests,
    missingTests,
    productBehaviorFailedTests,
    testInfraFailedTests,
    catalogReport,
    noWriteResult
  };

  console.log('\n========================================================');
  console.log(`Exit code final recomendado: ${finalSummary.exitCode}`);
  console.log('========================================================');

  // Guardar reporte en scratch para lectura del chatbot
  const reportPath = path.join(__dirname, 'p0_2_run_report.json');
  
  await fs.writeJson(reportPath, finalSummary, { spaces: 2 });
  
  process.exit(finalSummary.exitCode);
}

main().catch(err => {
  console.error('Crash fatal en el runner de pruebas:', err);
  process.exit(1);
});
