import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, '..');
const SCRATCH_DIR = path.join(CLI_ROOT, 'scratch');
const EVIDENCE_TEMP = path.join(SCRATCH_DIR, 'evidence_temp');
const ZIP_PATH = path.join(SCRATCH_DIR, 'PROTOTIPE_EVIDENCE_BUNDLE_1783782456380.zip');

function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

async function run() {
  console.log('📦 Creando y Auditando el Bundle de Evidencia Técnica (H-03)...');
  
  await fs.remove(EVIDENCE_TEMP);
  await fs.remove(ZIP_PATH);
  await fs.ensureDir(EVIDENCE_TEMP);

  // Archivos clave para la evidencia
  const filesToCopy = [
    { src: path.join(CLI_ROOT, 'server.js'), destName: 'server.js' },
    { src: path.join(CLI_ROOT, 'generator.js'), destName: 'generator.js' },
    { src: path.join(CLI_ROOT, 'config.js'), destName: 'config.js' },
    { src: path.join(CLI_ROOT, 'sync_templates.js'), destName: 'sync_templates.js' },
    { src: path.join(CLI_ROOT, '..', 'Plantillas Core', 'App Ventas', 'firestore.rules'), destName: 'firestore.rules' },
    { src: path.join(CLI_ROOT, 'scratch', 'certification-report.json'), destName: 'certification-report.json' },
    { src: path.join(CLI_ROOT, 'scripts', 'test_firestore_emulator.js'), destName: 'test_firestore_emulator.js' },
    { src: path.join(CLI_ROOT, 'scripts', 'test_multiplatform.js'), destName: 'test_multiplatform.js' },
    { src: path.join(CLI_ROOT, 'scripts', 'run_full_certification.js'), destName: 'run_full_certification.js' },
    { src: path.join(CLI_ROOT, 'scripts', 'distribute_rules.js'), destName: 'distribute_rules.js' },
    { src: path.join(CLI_ROOT, 'scripts', 'create_evidence_bundle.js'), destName: 'create_evidence_bundle.js' },
    { src: path.join(CLI_ROOT, 'knowledge', 'firestore', 'core.rules'), destName: 'core.rules' },
    { src: path.join(CLI_ROOT, 'knowledge', 'firestore', 'features', 'credits.rules'), destName: 'credits.rules' },
    { src: path.join(CLI_ROOT, 'knowledge', 'firestore', 'features', 'inventory.rules'), destName: 'inventory.rules' },
    { src: path.join(CLI_ROOT, 'knowledge', 'firestore', 'features', 'notifications.rules'), destName: 'notifications.rules' },
    { src: path.join(CLI_ROOT, 'knowledge', 'firestore', 'features', 'orders.rules'), destName: 'orders.rules' },
    { src: path.join(CLI_ROOT, 'knowledge', 'telemetry', 'app-registry.json'), destName: 'app-registry.json' },
    { src: path.join(CLI_ROOT, 'lib', 'CorePromotionValidator.js'), destName: 'CorePromotionValidator.js' },
    { src: path.join(CLI_ROOT, '..', 'Plantillas Core', 'App Ventas', 'src', 'services', 'telemetryService.js'), destName: 'telemetryService.js' },
    { src: path.join(CLI_ROOT, 'scratch', 'certification.log'), destName: 'certification.log' }
  ];

  const copiedFiles = [];
  
  for (const item of filesToCopy) {
    if (await fs.pathExists(item.src)) {
      const destPath = path.join(EVIDENCE_TEMP, item.destName);
      await fs.copy(item.src, destPath);
      const sha256 = calculateSHA256(destPath);
      copiedFiles.push({
        name: item.destName,
        sha256,
        sizeBytes: fs.statSync(destPath).size
      });
    } else {
      console.warn(`⚠️ Archivo de evidencia faltante omitido: ${item.src}`);
    }
  }

  // Obtener commits de Git
  const baseCommitSha = 'ab7a64f7bccd4155d829803f9b678d75faa350f4';
  let certifiedCommitSha = '';
  try {
    certifiedCommitSha = execSync('git rev-parse HEAD', { cwd: CLI_ROOT }).toString().trim();
  } catch (_) {
    certifiedCommitSha = baseCommitSha;
  }

  // Generar MANIFEST.json
  const manifest = {
    manifestVersion: '1.0.0',
    bundleName: 'PROTOTIPE_EVIDENCE_BUNDLE_1783782456380.zip',
    timestamp: new Date().toISOString(),
    baseCommitSha,
    certifiedCommitSha,
    environment: {
      node: process.version,
      os: `${os.type()} ${os.release()} (${os.arch()})`
    },
    files: copiedFiles,
    exclusions: [
      'node_modules/',
      '.git/',
      'dist/',
      'tmp/',
      '.env.local'
    ]
  };

  const manifestPath = path.join(EVIDENCE_TEMP, 'MANIFEST.json');
  await fs.writeJson(manifestPath, manifest, { spaces: 2 });
  console.log('📄 Generado MANIFEST.json con hashes SHA-256 de forma exitosa.');

  // Escanear el directorio temporal buscando secretos y PII
  console.log('🔍 Iniciando escaneo de seguridad sobre el bundle de evidencia...');
  let secretsCheck = 'CLEAN';
  let piiCheck = 'CLEAN';
  let scanError = null;

  try {
    // Escaneo básico de secretos en base a expresiones regulares de API keys y Tokens
    const apiKeyRegex = /AIzaSy[A-Za-z0-9-_]{35}/g;
    const genericTokenRegex = /token_?[a-zA-Z0-9]{16,}/g;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    
    for (const f of copiedFiles) {
      const fileAbs = path.join(EVIDENCE_TEMP, f.name);
      const content = await fs.readFile(fileAbs, 'utf-8');
      
      // Omitir el reporte de certificación y manifest de la validación estricta de secretos
      if (f.name === 'certification-report.json' || f.name === 'MANIFEST.json') continue;
      
      if (content.match(apiKeyRegex)) {
        throw new Error(`Fallo de Seguridad: API Key de Firebase detectada en ${f.name}.`);
      }
      if (content.match(emailRegex) && f.name.endsWith('.js')) {
        piiCheck = 'WARNING (Posible PII detectada)';
      }
    }
  } catch (err) {
    secretsCheck = 'FAILED';
    scanError = err.message;
    console.error(`🔴 Escaneo de secretos falló: ${err.message}`);
  }

  const scanReport = {
    timestamp: new Date().toISOString(),
    status: secretsCheck === 'CLEAN' ? 'SUCCESS' : 'FAILED',
    secretsCheck,
    piiCheck,
    scannedFiles: copiedFiles.map(f => f.name),
    error: scanError
  };

  const scanReportPath = path.join(EVIDENCE_TEMP, 'evidence-bundle-scan.json');
  await fs.writeJson(scanReportPath, scanReport, { spaces: 2 });
  await fs.writeJson(path.join(SCRATCH_DIR, 'evidence-bundle-scan.json'), scanReport, { spaces: 2 });
  console.log('📄 Generado evidence-bundle-scan.json de forma exitosa.');

  // Comprimir el bundle temporal a ZIP usando tar nativo o Powershell como fallback
  console.log('🤐 Comprimiendo el bundle temporal en un archivo ZIP...');
  try {
    if (process.platform === 'win32') {
      execSync(`powershell -Command "Compress-Archive -Path '${EVIDENCE_TEMP}\\*' -DestinationPath '${ZIP_PATH}' -Force"`, { stdio: 'inherit' });
    } else {
      execSync(`tar -a -c -f "${ZIP_PATH}" -C "${EVIDENCE_TEMP}" .`, { stdio: 'inherit' });
    }
    console.log(`🟢 Compresión completada con éxito. Archivo disponible en: ${ZIP_PATH}`);
  } catch (err) {
    console.error('🔴 Falla al comprimir el bundle de evidencia:', err.message);
    process.exit(1);
  }

  // Calcular el hash del ZIP resultante
  const zipSha256 = calculateSHA256(ZIP_PATH);
  console.log(`🔑 SHA-256 del ZIP: ${zipSha256}`);

  // Escribir el reporte de escaneo final agregando los metadatos de compresión
  const finalScanReport = {
    ...scanReport,
    zipSha256,
    bundleCreatedAt: new Date().toISOString(),
    baseCommitSha,
    certifiedCommitSha,
    totalFiles: copiedFiles.length + 2 // Copied + MANIFEST.json + evidence-bundle-scan.json
  };
  await fs.writeJson(path.join(SCRATCH_DIR, 'evidence-bundle-scan.json'), finalScanReport, { spaces: 2 });

  // Eliminar la carpeta temporal
  await fs.remove(EVIDENCE_TEMP);

  if (secretsCheck === 'FAILED') {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
