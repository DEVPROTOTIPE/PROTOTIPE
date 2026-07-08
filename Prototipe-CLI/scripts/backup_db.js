/**
 * backup_db.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Script CLI de PROTOTIPE para respaldar de forma gratuita la base de datos
 * Firestore de un inquilino a su respectivo bucket de GCP y descargarlo en local.
 *
 * Uso:
 *   node scripts/backup_db.js --client=[clientId]
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs-extra';
import minimist from 'minimist';

const execAsync = promisify(exec);
const argv = minimist(process.argv.slice(2));

const CLI_ROOT = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([a-zA-Z]:)/, '$1');
const MONOREPO_ROOT = path.resolve(CLI_ROOT, '../..');

async function run() {
  const clientId = argv.client;
  if (!clientId) {
    console.error('❌ Error: Debes especificar el cliente. Ejemplo: node backup_db.js --client=ventas-moni-app');
    process.exit(1);
  }

  console.log(`🔍 Iniciando respaldo de base de datos para el cliente: ${clientId}...`);

  try {
    // 1. Resolver ruta del proyecto del cliente
    // El CLI mapea el cliente a su directorio en 'Plantillas Core' o 'Instancias Clientes'
    let projectDir = path.join(MONOREPO_ROOT, 'Plantillas Core/App Ventas');
    const customDir = path.join(MONOREPO_ROOT, 'Instancias Clientes/ventas', clientId);
    
    if (await fs.pathExists(customDir)) {
      projectDir = customDir;
    }

    const envPath = path.join(projectDir, '.env.local');
    if (!await fs.pathExists(envPath)) {
      throw new Error(`No se encontró el archivo de entorno .env.local del cliente en ${projectDir}`);
    }

    // 2. Extraer el Project ID de Firebase del cliente
    const envContent = await fs.readFile(envPath, 'utf-8');
    const projectIdMatch = envContent.match(/VITE_DEVELOPER_FIREBASE_PROJECT_ID\s*=\s*(.*)/);
    const projectId = projectIdMatch ? projectIdMatch[1].trim().replace(/['"]/g, '') : null;

    if (!projectId) {
      throw new Error('No se pudo determinar el VITE_DEVELOPER_FIREBASE_PROJECT_ID en .env.local');
    }

    console.log(`[Backup] Identificado Firebase Project ID: ${projectId}`);

    // 3. Definir bucket de resguardo y directorio local
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const bucketUri = `gs://${projectId}-backups-ecosistema`;
    const localBackupDir = path.join(MONOREPO_ROOT, 'Backups_Ecosistema', `Firestore_${clientId}`, timestamp);
    
    await fs.ensureDir(localBackupDir);

    console.log(`[Backup] Ejecutando comando de exportación en Google Cloud (Firestore -> Storage)...`);
    
    // Ejecuta la exportación nativa de Firestore al bucket de Storage
    const exportCmd = `gcloud firestore export ${bucketUri}/firestore-backup-${timestamp} --project=${projectId}`;
    console.log(`> Run: ${exportCmd}`);
    
    try {
      const { stdout, stderr } = await execAsync(exportCmd);
      if (stdout) console.log(stdout);
      if (stderr) console.warn(stderr);
    } catch (gcloudErr) {
      console.warn(`[Advertencia] Falló 'gcloud firestore export'. Asegúrate de estar autenticado con 'gcloud auth login'.`);
      console.log(`[Información] Intentando fallback mediante firebase-tools CLI...`);
      
      const fallbackCmd = `npx firebase firestore:export ${bucketUri}/firestore-backup-${timestamp} --project=${projectId}`;
      console.log(`> Run: ${fallbackCmd}`);
      const { stdout, stderr } = await execAsync(fallbackCmd);
      if (stdout) console.log(stdout);
      if (stderr) console.warn(stderr);
    }

    // 4. Copiar los archivos resultantes del bucket de Storage al almacenamiento local del monorepo
    console.log(`[Backup] Descargando archivos de respaldo desde Storage al almacenamiento local...`);
    const copyCmd = `gsutil -m cp -r ${bucketUri}/firestore-backup-${timestamp}/* "${localBackupDir}"`;
    console.log(`> Run: ${copyCmd}`);
    
    try {
      const { stdout, stderr } = await execAsync(copyCmd);
      if (stdout) console.log(stdout);
      if (stderr) console.warn(stderr);
      console.log(`✅ Respaldo descargado y guardado en local en: ${localBackupDir}`);
    } catch (copyErr) {
      console.warn(`[Advertencia] No se pudo descargar los archivos a local automáticamente mediante 'gsutil cp'.`);
      console.log(`[Información] El respaldo ha quedado almacenado de forma segura en la nube en: ${bucketUri}/firestore-backup-${timestamp}`);
    }

  } catch (err) {
    console.error(`❌ Error en el proceso de respaldo: ${err.message}`);
    process.exit(1);
  }
}

run();
