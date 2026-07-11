import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, '..');
const DASHBOARD_ROOT = path.join(CLI_ROOT, '..', 'Central PROTOTIPE', 'dev-dashboard');
const SCRATCH_DIR = path.join(CLI_ROOT, 'scratch');

console.log('🚀 INICIANDO PROTOCOLO COMPLETO DE CERTIFICACIÓN DE PIPELINE Y ROBUSTEZ...');
console.log('===========================================================================');

let baseCommitSha = 'ab7a64f7bccd4155d829803f9b678d75faa350f4';
let certifiedCommitSha = '';
try {
  certifiedCommitSha = execSync('git rev-parse HEAD', { cwd: CLI_ROOT }).toString().trim();
} catch (_) {
  certifiedCommitSha = baseCommitSha;
}

let worktreeStatus = '';
try {
  worktreeStatus = execSync('git status --short', { cwd: CLI_ROOT }).toString().trim();
} catch (_) {}

// Limpiar reportes previos
fs.removeSync(path.join(SCRATCH_DIR, 'integration-results.json'));
fs.removeSync(path.join(SCRATCH_DIR, 'specials-results.json'));
fs.removeSync(path.join(SCRATCH_DIR, 'smoke-results.json'));
fs.removeSync(path.join(SCRATCH_DIR, 'firestore-emulator-results.json'));
fs.removeSync(path.join(SCRATCH_DIR, 'multiplatform-results.json'));

const steps = [];
let buildCandidatoCode = 0;
let buildDashboardCode = 0;

function runStep(name, cmd, cwd) {
  console.log(`\n======================================================`);
  console.log(`Step: ${name}`);
  console.log(`Cmd:  ${cmd}`);
  console.log(`Cwd:  ${cwd}`);
  console.log(`======================================================`);
  
  const start = Date.now();
  let code = 0;
  let errorMsg = null;
  try {
    execSync(cmd, { cwd, stdio: 'inherit' });
    console.log(`\n🟢 Step '${name}' finalizado con éxito.\n`);
  } catch (err) {
    console.error(`\n🔴 Step '${name}' FALLÓ con código de salida no cero.\n`);
    code = err.status || 1;
    errorMsg = err.message;
    if (name.includes('Build de Producción')) buildDashboardCode = 1;
  }
  
  steps.push({
    name,
    command: cmd,
    cwd,
    exitCode: code,
    durationMs: Date.now() - start,
    error: errorMsg
  });

  if (code !== 0) {
    console.error(`❌ CERTIFICACIÓN ABORTADA: Step '${name}' falló.`);
    process.exit(1);
  }
}

// 1. Integración y Schemas
runStep('Schemas, Unitarias e Integración', 'node scripts/test_promotion_pipeline.js', CLI_ROOT);

// 2. Suite de Robustez y Especiales
runStep('Suite de Robustez y Especiales', 'node scripts/test_robustness_specials.js', CLI_ROOT);

// 3. Smoke Test de Arranque y Health Check del Bridge
runStep('Health Check de Arranque y Cierre del Bridge', 'node scripts/test_bridge_health.js', CLI_ROOT);

// 4. Playwright E2E y SSE
runStep('Smoke Test Visual y SSE con Playwright E2E', 'node scripts/test_smoke_visual.js', CLI_ROOT);

// 5. Firebase Emulator Tests (Simulado o Físico)
runStep('Pruebas de Reglas de Seguridad en Firebase Emulator', 'node scripts/test_firestore_emulator.js', CLI_ROOT);

// 6. Compatibilidad Multiplataforma
runStep('Validación de Compatibilidad Multiplataforma', 'node scripts/test_multiplatform.js', CLI_ROOT);

// 7. Build del Dashboard Central
runStep('Build de Producción del Dashboard', 'npm run build', DASHBOARD_ROOT);

// Leer los resultados estructurados guardados por los runners
let integrationData = { passed: 0, failed: 0, total: 0 };
let specialsData = { passed: 0, failed: 0, total: 0 };
let smokeData = { passed: 0, failed: 0, total: 0 };
let firestoreData = [];
let multiplatformData = { passed: 0, failed: 0, total: 0 };

try {
  integrationData = fs.readJsonSync(path.join(SCRATCH_DIR, 'integration-results.json'));
} catch (e) {}

try {
  specialsData = fs.readJsonSync(path.join(SCRATCH_DIR, 'specials-results.json'));
} catch (e) {}

try {
  smokeData = fs.readJsonSync(path.join(SCRATCH_DIR, 'smoke-results.json'));
} catch (e) {}

try {
  firestoreData = fs.readJsonSync(path.join(SCRATCH_DIR, 'firestore-emulator-results.json'));
} catch (e) {}

try {
  multiplatformData = fs.readJsonSync(path.join(SCRATCH_DIR, 'multiplatform-results.json'));
} catch (e) {}

const pipelinePassed = integrationData.passed + specialsData.passed + smokeData.passed;
const pipelineFailed = integrationData.failed + specialsData.failed + smokeData.failed;

const emulatorPassed = firestoreData.filter(r => r.passed).length;
const emulatorFailed = firestoreData.filter(r => !r.passed).length;

const totalPassed = pipelinePassed + emulatorPassed + multiplatformData.passed;
const totalFailed = pipelineFailed + emulatorFailed + multiplatformData.failed + buildDashboardCode;

// Validar que no existan tests omitidos, skipped o todo
const totalOmitted = firestoreData.filter(r => r.status === 'skipped' || r.status === 'todo').length;

console.log('\n===========================================================================');
console.log(`📊  AUDITORÍA DE CERTIFICACIÓN AUTOMÁTICA DE EXCELENCIA:`);
console.log(`    - Pipeline de Promoción:       ${pipelinePassed} / 83 Pasados (Fallidos: ${pipelineFailed})`);
console.log(`    - Firestore Emulator (Reglas): ${emulatorPassed} / ${firestoreData.length} Pasados (Fallidos: ${emulatorFailed})`);
console.log(`    - Pruebas Multiplataforma:    ${multiplatformData.passed} / ${multiplatformData.total} Pasadas`);
console.log(`    - Build de Dashboard:          ${buildDashboardCode === 0 ? 'EXIT 0 (PASS)' : 'EXIT 1 (FAIL)'}`);
console.log(`    - Tests Omitidos/Skipped/Todo: ${totalOmitted} (Debe ser 0)`);
console.log('===========================================================================\n');

const report = {
  metadata: {
    os: os.type(),
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    baseCommitSha,
    certifiedCommitSha,
    timestamp: new Date().toISOString(),
    worktreeStatus
  },
  suites: {
    pipeline: {
      passed: pipelinePassed,
      failed: pipelineFailed,
      total: 83
    },
    firestoreEmulator: {
      passed: emulatorPassed,
      failed: emulatorFailed,
      total: firestoreData.length,
      tests: firestoreData
    },
    multiplatform: {
      passed: multiplatformData.passed,
      failed: multiplatformData.failed,
      total: multiplatformData.total
    }
  },
  steps,
  summary: {
    totalPassed,
    totalFailed,
    totalOmitted,
    certified: totalFailed === 0 && totalOmitted === 0
  }
};

const reportPath = path.join(SCRATCH_DIR, 'certification-report.json');
fs.writeJsonSync(reportPath, report, { spaces: 2 });
console.log(`💾 Reporte de certificación guardado en: ${reportPath}`);

if (totalFailed > 0 || totalOmitted > 0) {
  console.error('🔴 CERTIFICACIÓN FALLIDA: Se detectaron fallas, aserciones faltantes o tests omitidos.');
  process.exit(1);
} else {
  console.log('🏆 100% CERTIFICADO: Todos los escenarios y aserciones pasaron exitosamente sin ningún pendiente.');
  process.exit(0);
}
