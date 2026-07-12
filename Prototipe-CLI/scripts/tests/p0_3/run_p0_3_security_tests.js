/**
 * run_p0_3_security_tests.js
 * 
 * Orquestador principal de la suite de pruebas normativas RED para P0.3 (Scaffolding Security).
 * Consolida y evalúa los resultados de seguridad, y genera el reporte normalizado p0_3_run_report.json.
 */

import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';
import { run as runSecurityTests } from './test_scaffolding_security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, '..', '..', '..');

async function main() {
  console.log('========================================================');
  console.log('🧪 INICIANDO SUITE DE PRUEBAS DE SEGURIDAD (RED) - FASE P0.3');
  console.log('========================================================');

  const results = [];

  // Ejecutar las pruebas de seguridad
  await runSecurityTests(results);

  console.log('\n========================================================');
  console.log('📊 CONSOLIDADO DE RESULTADOS DE SEGURIDAD P0.3');
  console.log('========================================================');

  let passed = 0;
  let productBehaviorFailures = 0;
  const securityControlsMissing = [];

  results.forEach(r => {
    if (r.status === 'PASSED') {
      passed++;
    } else if (r.status === 'PRODUCT_BEHAVIOR_FAILURE') {
      productBehaviorFailures++;
      securityControlsMissing.push({
        name: r.name,
        error: r.error
      });
    }
  });

  const finalSummary = {
    testsTotal: results.length,
    passed,
    productBehaviorFailures,
    securityControlsMissing
  };

  console.log(`TOTAL PRUEBAS:             ${finalSummary.testsTotal}`);
  console.log(`PASSED:                    ${finalSummary.passed}`);
  console.log(`PRODUCT_BEHAVIOR_FAILURES: ${finalSummary.productBehaviorFailures}`);
  console.log('========================================================');

  if (securityControlsMissing.length > 0) {
    console.log('\n🔴 CONTROLES DE SEGURIDAD AUSENTES / VULNERABILIDADES ACTIVAS:');
    securityControlsMissing.forEach(c => console.log(`   - [${c.name}]: ${c.error}`));
  }

  // Escribir el reporte normalizado en artifacts/p0_3
  const reportDir = path.resolve(CLI_ROOT, 'artifacts', 'p0_3');
  await fs.ensureDir(reportDir);
  const reportPath = path.join(reportDir, 'p0_3_run_report.json');
  await fs.writeJson(reportPath, finalSummary, { spaces: 2 });
  console.log(`\n📝 Reporte normalizado guardado en: ${reportPath}`);

  // El runner siempre retorna exit 0 si corre exitosamente la evaluación,
  // pero reporta las vulnerabilidades a través del JSON y la salida estándar.
  process.exit(0);
}

main().catch(err => {
  console.error('Crash fatal en el runner de pruebas de seguridad:', err);
  process.exit(1);
});
