/**
 * test_characterization.js
 * 
 * Script para verificar las baselines de caracterización (Grupo A: invariants, Grupo B: defects)
 * contra la ejecución del Generator actual.
 * Carga e instrumenta de forma obligatoria el NetworkGuard para bloqueo estricto de red.
 */

import fs from 'fs-extra';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { normalizeResult } from './test_support/normalize_result.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');

const HISTORICAL_SANDBOX_DIR = process.env.PROTOTIPE_SANDBOX_DIR || path.join(os.tmpdir(), 'PROTOTIPE_CHARACTERIZATION_SANDBOX');
const EXPECTED_BASELINE_COMMIT = '7251cf16eb7ee5ce248fb54cee12b55968ace253';

async function getGitCommit(dir) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function getFileSha256(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getDirectorySha256(dirPath) {
  if (!fs.existsSync(dirPath)) return null;
  const files = [];
  const walk = (dir) => {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      const fullPath = path.join(dir, item.name);
      if (item.name === 'node_modules' || item.name === '.git') continue;
      if (item.isDirectory()) {
        walk(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  };
  walk(dirPath);
  files.sort();
  const hash = crypto.createHash('sha256');
  for (const file of files) {
    const relative = path.relative(dirPath, file);
    const content = fs.readFileSync(file);
    hash.update(relative);
    hash.update(content);
  }
  return hash.digest('hex');
}

async function run() {
  console.log('Iniciando verificación de caracterización...');

  // 1. Validar existencia del sandbox
  if (!fs.existsSync(HISTORICAL_SANDBOX_DIR)) {
    console.error(`❌ El directorio del sandbox histórico ${HISTORICAL_SANDBOX_DIR} no existe.`);
    process.exit(1);
  }

  // 2. Cargar baselines grabadas
  const fixtureDir = path.join(__dirname, 'fixtures');
  const invariantsBaselinePath = path.join(fixtureDir, 'invariants-baseline.json');
  const defectsBaselinePath = path.join(fixtureDir, 'defect-baseline.json');
  const defectStatusPath = path.join(fixtureDir, 'defect-status.json');

  if (!fs.existsSync(invariantsBaselinePath) || !fs.existsSync(defectsBaselinePath) || !fs.existsSync(defectStatusPath)) {
    console.error('❌ Falta algún archivo de baseline en scripts/fixtures/. Ejecuta primero la grabación.');
    process.exit(1);
  }

  const invariantsBaseline = fs.readJsonSync(invariantsBaselinePath);
  const defectsBaseline = fs.readJsonSync(defectsBaselinePath);
  const defectStatus = fs.readJsonSync(defectStatusPath);

  // 3. Preparar mocks y variables de entorno aisladas
  const mockLogPath = path.join(HISTORICAL_SANDBOX_DIR, 'mock_calls.log');
  await fs.writeFile(mockLogPath, '');

  const isolatedEnv = {
    ...process.env,
    PROTOTIPE_WORKSPACE_ROOT: path.join(HISTORICAL_SANDBOX_DIR, 'Instancias Clientes'),
    APPLICATIONS_DIR: path.join(HISTORICAL_SANDBOX_DIR, 'Instancias Clientes'),
    VITE_DEVELOPER_CENTRAL_API_KEY: 'AIzaSyCBkdokIpGqWlfFiU_i83o7GmV1ZTqXYJE',
    MOCK_LOG_PATH: mockLogPath,
    NODE_ENV: 'test',
    ALLOW_CMD_COMPAT_FALLBACK: 'true'
  };

  if (process.platform === 'win32') {
    const sysRoot = process.env.SystemRoot || process.env.SYSTEMROOT || 'C:\\Windows';
    isolatedEnv.SystemRoot = sysRoot;
    isolatedEnv.SYSTEMROOT = sysRoot;
  }

  // Usar el generator del monorepo actual (HEAD remediado)
  const generatorUrl = new URL('file:///' + path.join(WORKSPACE_ROOT, 'Prototipe-CLI', 'generator.js').replace(/\\/g, '/')).href;

  const runnerScript = `
    import fsNative from 'node:fs';
    import fsExtra from 'fs-extra';
    import path from 'node:path';

    const originalReadJson = fsExtra.readJson;
    fsExtra.readJson = async function(filePath, ...args) {
      if (typeof filePath === 'string' && filePath.endsWith('plantillas_registro.json')) {
        return {
          plantillas: {
            ventas: {
              coreType: 'ventas',
              fuente: '${path.join(WORKSPACE_ROOT, 'Prototipe-CLI', 'templates', 'template-ventas').replace(/\\/g, '/')}',
              destino: '${path.join(WORKSPACE_ROOT, 'Prototipe-CLI', 'templates', 'template-ventas').replace(/\\/g, '/')}'
            }
          }
        };
      }
      return originalReadJson.call(fsExtra, filePath, ...args);
    };

    const originalReadJsonSync = fsExtra.readJsonSync;
    fsExtra.readJsonSync = function(filePath, ...args) {
      if (typeof filePath === 'string' && filePath.endsWith('plantillas_registro.json')) {
        return {
          plantillas: {
            ventas: {
              coreType: 'ventas',
              fuente: '${path.join(WORKSPACE_ROOT, 'Prototipe-CLI', 'templates', 'template-ventas').replace(/\\/g, '/')}',
              destino: '${path.join(WORKSPACE_ROOT, 'Prototipe-CLI', 'templates', 'template-ventas').replace(/\\/g, '/')}'
            }
          }
        };
      }
      return originalReadJsonSync.call(fsExtra, filePath, ...args);
    };

    const originalExistsSync = fsNative.existsSync;
    fsNative.existsSync = function(filePath, ...args) {
      if (typeof filePath === 'string' && filePath.endsWith('plantillas_registro.json')) {
        return true;
      }
      return originalExistsSync.call(fsNative, filePath, ...args);
    };

    const originalPathExists = fsExtra.pathExists;
    fsExtra.pathExists = async function(filePath, ...args) {
      if (typeof filePath === 'string' && filePath.endsWith('plantillas_registro.json')) {
        return true;
      }
      return originalPathExists.call(fsExtra, filePath, ...args);
    };

    import { createProject } from '${generatorUrl}';
    
    createProject(JSON.parse(process.argv[3]))
      .then(res => {
        console.log('SUCCESS::' + JSON.stringify(res));
      })
      .catch(err => {
        console.error('ERROR::' + err.message);
        process.exit(1);
      });
  `;

  const runnerPath = path.join(HISTORICAL_SANDBOX_DIR, 'Prototipe-CLI', 'runner.js');
  await fs.writeFile(runnerPath, runnerScript);

  // --- ESCENARIO 1: Generación feliz ---
  const targetDir1 = path.join(HISTORICAL_SANDBOX_DIR, 'Instancias Clientes', 'ventas', 'App-happy-path-client');
  await fs.remove(targetDir1);

  const answers1 = {
    projectName: 'happy-path-client',
    template: 'template-ventas',
    version: '1.0.0',
    targetPath: targetDir1,
    features: ['appointments'],
    enableBillingPlan: 'blaze',
    firebaseProjectId: 'ventas-moni-app'
  };

  const guardUrl = new URL('file:///' + path.join(WORKSPACE_ROOT, 'Prototipe-CLI', 'scripts', 'test_support', 'network_guard.mjs').replace(/\\/g, '/')).href;

  try {
    execFileSync(process.execPath, [
      '--import',
      guardUrl,
      runnerPath,
      '--',
      JSON.stringify(answers1)
    ], {
      env: isolatedEnv,
      cwd: path.join(HISTORICAL_SANDBOX_DIR, 'Prototipe-CLI'),
      encoding: 'utf8',
      shell: false
    });
  } catch (err) {
    console.warn('La generación falló o arrojó advertencias en subproceso:', err.stderr || err.message);
  }

  // --- Validación de Invariantes Actuales ---
  const currentInvariants = {
    packageJsonExists: fs.existsSync(path.join(targetDir1, 'package.json')),
    viteConfigExists: fs.existsSync(path.join(targetDir1, 'vite.config.js')),
    srcExists: fs.existsSync(path.join(targetDir1, 'src')),
    publicExists: fs.existsSync(path.join(targetDir1, 'public'))
  };

  // Comparar con invariantes del baseline
  let invariantsFailed = false;
  for (const [key, expected] of Object.entries(invariantsBaseline.invariants?.core_files_copied || {})) {
    const actual = currentInvariants[key];
    if (actual !== expected) {
      console.error(`❌ Invariante "${key}" cambió. Esperado: ${expected}, obtenido: ${actual}`);
      invariantsFailed = true;
    }
  }

  if (invariantsFailed) {
    console.error('❌ Fallaron las aserciones de invariantes del scaffolding (Grupo A).');
    process.exit(1);
  }
  console.log('✅ Grupo A (Invariantes) verificado con éxito.');

  // --- Validación de Defectos Actuales ---
  const constantsPath = path.join(targetDir1, 'src', 'constants', 'index.js');
  let hasHardcodedPin = false;
  if (fs.existsSync(constantsPath)) {
    const content = fs.readFileSync(constantsPath, 'utf8');
    hasHardcodedPin = content.includes("DEV_PIN = '1609'") || content.includes('DEV_PIN = "1609"');
  }

  const manifestPath = path.join(targetDir1, 'core-manifest.json');
  let featuresInstalledInManifest = [];
  if (fs.existsSync(manifestPath)) {
    const manifest = fs.readJsonSync(manifestPath);
    featuresInstalledInManifest = manifest.featuresInstalled || [];
  }

  // --- ESCENARIO 2: Blueprint vacío ---
  const targetDir2 = path.join(HISTORICAL_SANDBOX_DIR, 'Instancias Clientes', 'ventas', 'App-malformed-client');
  await fs.remove(targetDir2);

  const answers2 = { projectName: '', targetPath: targetDir2 };
  let malformedError = null;
  try {
    execFileSync(process.execPath, [
      '--import',
      guardUrl,
      runnerPath,
      '--',
      JSON.stringify(answers2)
    ], {
      env: isolatedEnv,
      cwd: path.join(HISTORICAL_SANDBOX_DIR, 'Prototipe-CLI'),
      encoding: 'utf8',
      shell: false
    });
  } catch (err) {
    malformedError = err.stderr || err.message;
  }

  const currentDefects = {
    'vite_dev_pin_exposure': hasHardcodedPin,
    'scaffolded_features_installed': featuresInstalledInManifest.includes('appointments'),
    'malformed_blueprint_validation': malformedError === null
  };

  // Comparar con baseline
  let testFailed = false;
  for (const [key, status] of Object.entries(defectStatus.statuses)) {
    const baselineDefectState = defectsBaseline.defects[key]?.hasHardcodedPin || 
                                (defectsBaseline.defects[key]?.featuresInstalledInManifest?.includes('appointments')) ||
                                (defectsBaseline.defects[key]?.success);

    const currentDefectState = currentDefects[key];

    if (status === 'OBSERVED') {
      if (currentDefectState !== baselineDefectState) {
        console.warn(`⚠️ Comportamiento de defecto "${key}" difiere del histórico. Posible corrección en progreso.`);
        testFailed = true;
      }
    }
  }

  // Comprobación de seguridad: fallar si hubo red no simulada/proceso no permitido
  const stats = global.__network_guard_stats__ || {};
  if (stats.unexpectedNetworkCalls > 0 || stats.unexpectedExternalProcesses > 0) {
    console.error('❌ [CRITICAL] Violación de aislamiento detectada en la suite:', stats);
    process.exit(1);
  }

  // Guardar archivo temporal normalizado del run remediado
  const tempOutDir = path.join(WORKSPACE_ROOT, 'Prototipe-CLI', 'scripts', 'temp_runs');
  await fs.ensureDir(tempOutDir);
  const normalizedRunOutput = normalizeResult({
    invariants: currentInvariants,
    defects: currentDefects,
    guardStats: stats
  });
  await fs.writeJson(path.join(tempOutDir, 'remediated-run.normalized.json'), normalizedRunOutput, { spaces: 2 });

  // Limpiar sandbox
  await fs.remove(targetDir1);
  await fs.remove(targetDir2);
  await fs.remove(mockLogPath);
  await fs.remove(runnerPath).catch(() => {});

  if (testFailed) {
    process.exit(1);
  }

  console.log('✅ Grupo B (Defectos) verificado con éxito.');
  console.log('✅ Caracterización de baseline e invariants exitosa.');
}

run().catch(err => {
  console.error('Error durante la verificación:', err);
  process.exit(1);
});
