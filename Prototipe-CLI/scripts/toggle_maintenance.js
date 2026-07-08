/**
 * toggle_maintenance.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Script CLI de PROTOTIPE para consultar y alternar el Modo Mantenimiento 
 * de una instancia de cliente directamente desde la consola.
 *
 * Uso:
 *   Consultar estado:
 *     node scripts/toggle_maintenance.js --client=[clientId]
 *
 *   Activar Modo Mantenimiento:
 *     node scripts/toggle_maintenance.js --client=[clientId] --status=true
 *
 *   Desactivar Modo Mantenimiento:
 *     node scripts/toggle_maintenance.js --client=[clientId] --status=false
 * ─────────────────────────────────────────────────────────────────────────────
 */

import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

const CLI_ROOT = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([a-zA-Z]:)/, '$1');
const MONOREPO_ROOT = path.resolve(CLI_ROOT, '../..');

function getDeveloperAccessToken() {
  const possiblePaths = [
    path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json'),
    path.join(process.env.APPDATA || '', 'configstore', 'firebase-tools.json')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        if (data.tokens && data.tokens.access_token) {
          return data.tokens.access_token;
        }
      } catch (_) {}
    }
  }
  return null;
}

async function run() {
  const clientId = argv.client;
  const statusStr = argv.status; // 'true' | 'false' | undefined

  if (!clientId) {
    console.error('❌ Error: Debes especificar el cliente. Ejemplo: node scripts/toggle_maintenance.js --client=ventas-moni-app');
    console.log('Opciones:');
    console.log('  --client=[clientId]   Identificador del cliente');
    console.log('  --status=[true|false] Activar o desactivar mantenimiento (opcional)');
    process.exit(1);
  }

  try {
    // 1. Resolver ruta del proyecto del cliente
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

    // 3. Obtener token de Firebase CLI
    const token = getDeveloperAccessToken();
    if (!token) {
      throw new Error('No se pudo obtener el token de sesión de Firebase CLI. Por favor ejecuta "firebase login" en tu terminal antes de usar este script.');
    }

    const settingsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/config/settings`;

    if (statusStr === undefined) {
      // --- CONSULTAR ESTADO ACTUAL ---
      console.log(`🔍 Consultando estado de mantenimiento para: ${clientId} (${projectId})...`);
      const response = await fetch(settingsUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Fallo en la llamada REST a Firestore: ${response.statusText}`);
      }

      const data = await response.json();
      const currentMode = data.fields?.maintenanceMode?.booleanValue ?? false;

      console.log('\n=============================================');
      console.log(` Cliente:   ${clientId}`);
      console.log(` Proyecto:  ${projectId}`);
      console.log(` Estado:    ${currentMode ? '⚠️  MODO MANTENIMIENTO ACTIVO' : '✅ FUNCIONANDO NORMALMENTE'}`);
      console.log('=============================================');
      console.log('\nPara cambiar el estado ejecuta:');
      console.log(`  node scripts/toggle_maintenance.js --client=${clientId} --status=${!currentMode}`);
    } else {
      // --- ACTUALIZAR ESTADO ---
      const nextStatus = statusStr === 'true' || statusStr === true;
      console.log(`⚙️  Estableciendo Modo Mantenimiento en: ${nextStatus} para ${clientId}...`);

      const patchUrl = `${settingsUrl}?updateMask.fieldPaths=maintenanceMode`;
      const payload = {
        fields: {
          maintenanceMode: { booleanValue: nextStatus }
        }
      };

      const response = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `Fallo al actualizar Firestore: ${response.statusText}`);
      }

      console.log(`\n=============================================`);
      console.log(`✅ ¡Cambio aplicado correctamente!`);
      console.log(` Cliente:   ${clientId}`);
      console.log(` Estado:    ${nextStatus ? '⚠️  MODO MANTENIMIENTO ACTIVO (App Bloqueada)' : '✅ FUNCIONANDO NORMALMENTE (App Disponible)'}`);
      console.log(`=============================================`);
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

run();
