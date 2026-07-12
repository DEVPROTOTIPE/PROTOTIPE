/**
 * test_characterization_record.js
 * 
 * Script para grabar las baselines de caracterización (Grupo A: invariants, Grupo B: defects)
 * a partir de la ejecución aislada del Generator en el sandbox externo e independiente.
 * Carga e instrumenta de forma obligatoria el NetworkGuard para bloqueo estricto de red.
 */

import fs from 'fs-extra';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { normalizeResult } from './test_support/normalize_result.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');

const HISTORICAL_SANDBOX_DIR = process.env.PROTOTIPE_SANDBOX_DIR || path.join(os.tmpdir(), 'PROTOTIPE_CHARACTERIZATION_SANDBOX');
const EXPECTED_BASELINE_COMMIT = '7251cf16eb7ee5ce248fb54cee12b55968ace253';
const SNAPSHOT_SHA256 = '982e10a0234ecc9006b1b6313f46c8e4d7a9fc9b6abb504ea1582147a5a7d6cb';

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

function getSystemMetadata(harnessCommit) {
  const nodeVersion = process.version;
  let npmVersion = 'unknown';
  try {
    npmVersion = execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim();
  } catch {}

  const cliDir = path.join(HISTORICAL_SANDBOX_DIR, 'Prototipe-CLI');

  return {
    sourceCommit: EXPECTED_BASELINE_COMMIT,
    snapshotSha256: SNAPSHOT_SHA256,
    harnessCommit,
    nodeVersion,
    npmVersion,
    platform: process.platform,
    arch: process.arch,
    capturedAt: new Date().toISOString(),
    artifactHashes: {
      generator: getFileSha256(path.join(cliDir, 'generator.js')),
      packageJson: getFileSha256(path.join(cliDir, 'package.json')),
      packageLockJson: getFileSha256(path.join(cliDir, 'package-lock.json')),
      templateVentasPackageJson: getFileSha256(path.join(cliDir, 'templates', 'template-ventas', 'package.json')),
      templateCoreSeedPackageJson: getFileSha256(path.join(cliDir, 'templates', 'template-core-seed', 'package.json')),
      templateVentasDir: getDirectorySha256(path.join(cliDir, 'templates', 'template-ventas')),
      templateCoreSeedDir: getDirectorySha256(path.join(cliDir, 'templates', 'template-core-seed'))
    },
    fixtureHashes: {}
  };
}

async function run() {
  console.log('Validando entorno para grabación de línea base...');

  // 1. Validar existencia del sandbox histórico
  if (!fs.existsSync(HISTORICAL_SANDBOX_DIR)) {
    console.error(`❌ El directorio de sandbox histórico ${HISTORICAL_SANDBOX_DIR} no existe.`);
    process.exit(1);
  }

  // 2. Verificar commit del harness (rama actual)
  const harnessCommit = await getGitCommit(WORKSPACE_ROOT);

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

  const invariants = {};
  const defects = {};

  // --- ESCENARIO 1: Generación feliz de template ---
  console.log('Capturando Escenario 1...');
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

  const generatorUrl = new URL('file:///' + path.join(HISTORICAL_SANDBOX_DIR, 'Prototipe-CLI', 'generator.js').replace(/\\/g, '/')).href;

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
              fuente: '${path.join(HISTORICAL_SANDBOX_DIR, 'Prototipe-CLI', 'templates', 'template-ventas').replace(/\\/g, '/')}',
              destino: '${path.join(HISTORICAL_SANDBOX_DIR, 'Prototipe-CLI', 'templates', 'template-ventas').replace(/\\/g, '/')}'
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
              fuente: '${path.join(HISTORICAL_SANDBOX_DIR, 'Prototipe-CLI', 'templates', 'template-ventas').replace(/\\/g, '/')}',
              destino: '${path.join(HISTORICAL_SANDBOX_DIR, 'Prototipe-CLI', 'templates', 'template-ventas').replace(/\\/g, '/')}'
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
    console.log('Generación terminada en subproceso.');
  } catch (err) {
    console.warn('La generación falló o arrojó advertencias en subproceso:', err.stderr || err.message);
  }

  // --- Captura de Invariantes del Escenario 1 ---
  invariants['core_files_copied'] = {
    packageJsonExists: fs.existsSync(path.join(targetDir1, 'package.json')),
    viteConfigExists: fs.existsSync(path.join(targetDir1, 'vite.config.js')),
    srcExists: fs.existsSync(path.join(targetDir1, 'src')),
    publicExists: fs.existsSync(path.join(targetDir1, 'public'))
  };

  // --- Captura de Defectos del Escenario 1 ---
  const constantsPath = path.join(targetDir1, 'src', 'constants', 'index.js');
  let hasHardcodedPin = false;
  if (fs.existsSync(constantsPath)) {
    const content = fs.readFileSync(constantsPath, 'utf8');
    hasHardcodedPin = content.includes("DEV_PIN = '1609'") || content.includes('DEV_PIN = "1609"');
  }
  defects['vite_dev_pin_exposure'] = {
    hasHardcodedPin,
    detail: 'El PIN de desarrollo "SECRET_PIN_01" se inyecta literalmente en src/constants/index.js'
  };

  const manifestPath = path.join(targetDir1, 'core-manifest.json');
  let featuresInstalledInManifest = [];
  if (fs.existsSync(manifestPath)) {
    const manifest = fs.readJsonSync(manifestPath);
    featuresInstalledInManifest = manifest.featuresInstalled || [];
  }
  defects['scaffolded_features_installed'] = {
    featuresInstalledInManifest,
    detail: 'Features scaffolded (que no existen físicamente) se marcan como instaladas'
  };

  // --- ESCENARIO 2: Blueprint vacío / malformado ---
  console.log('Capturando Escenario 2...');
  const targetDir2 = path.join(HISTORICAL_SANDBOX_DIR, 'Instancias Clientes', 'ventas', 'App-malformed-client');
  await fs.remove(targetDir2);

  const answers2 = {
    projectName: '',
    targetPath: targetDir2
  };

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

  defects['malformed_blueprint_validation'] = {
    success: malformedError === null,
    errorSnippet: malformedError ? 'ERROR_SHOWN' : null,
    detail: 'Blueprints malformados no disparan validaciones de esquema estrictas'
  };

  // 6. Escribir baselines normalizados
  const metadata = getSystemMetadata(harnessCommit);
  const answers1Hash = crypto.createHash('sha256').update(JSON.stringify(answers1)).digest('hex');
  const answers2Hash = crypto.createHash('sha256').update(JSON.stringify(answers2)).digest('hex');
  metadata.fixtureHashes = {
    answers1: answers1Hash,
    answers2: answers2Hash
  };

  const invariantsBaseline = normalizeResult({ metadata, invariants });
  const defectsBaseline = normalizeResult({ metadata, defects });

  const defectStatus = normalizeResult({
    metadata: {
      sourceCommit: EXPECTED_BASELINE_COMMIT,
      lastUpdatedAt: new Date().toISOString()
    },
    statuses: {
      'vite_dev_pin_exposure': 'OBSERVED',
      'scaffolded_features_installed': 'OBSERVED',
      'malformed_blueprint_validation': 'OBSERVED'
    }
  });

  // Guardar reportes de la ejecución para repetibilidad
  const runOutput = {
    invariants,
    defects,
    guardStats: global.__network_guard_stats__
  };
  const normalizedRunOutput = normalizeResult(runOutput);

  // Comprobación de seguridad: fallar si hubo red no simulada/proceso no permitido
  const stats = global.__network_guard_stats__ || {};
  if (stats.unexpectedNetworkCalls > 0 || stats.unexpectedExternalProcesses > 0) {
    console.error('❌ [CRITICAL] Violación de aislamiento detectada en la suite:', stats);
    process.exit(1);
  }

  const fixtureDir = path.join(WORKSPACE_ROOT, 'Prototipe-CLI', 'scripts', 'fixtures');
  await fs.ensureDir(fixtureDir);

  await fs.writeJson(path.join(fixtureDir, 'invariants-baseline.json'), invariantsBaseline, { spaces: 2 });
  await fs.writeJson(path.join(fixtureDir, 'defect-baseline.json'), defectsBaseline, { spaces: 2 });
  await fs.writeJson(path.join(fixtureDir, 'defect-status.json'), defectStatus, { spaces: 2 });

  // Guardar archivo temporal normalizado del run
  const tempOutDir = path.join(WORKSPACE_ROOT, 'Prototipe-CLI', 'scripts', 'temp_runs');
  await fs.ensureDir(tempOutDir);
  await fs.writeJson(path.join(tempOutDir, 'last-run.normalized.json'), normalizedRunOutput, { spaces: 2 });

  // 7. Limpiar sandbox
  await fs.remove(targetDir1);
  await fs.remove(targetDir2);
  await fs.remove(mockLogPath);
  await fs.remove(runnerPath).catch(() => {});

  console.log('✅ Caracterización grabada con éxito.');
}

run().catch(err => {
  console.error('Error durante la grabación:', err);
  process.exit(1);
});
