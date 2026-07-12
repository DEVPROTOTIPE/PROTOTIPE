import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import pc from 'picocolors';

async function getFirebaseAccessToken(forceRefresh = false) {
  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  if (!await fs.pathExists(configPath)) {
    throw new Error('No se encontró la sesión activa de Firebase CLI. Ejecuta "firebase login".');
  }
  const config = await fs.readJson(configPath);
  const tokens = config.tokens;
  if (!tokens) {
    throw new Error('No hay tokens guardados en Firebase CLI. Ejecuta "firebase login".');
  }

  if (!forceRefresh && tokens.access_token && tokens.expires_at && tokens.expires_at > Date.now()) {
    return tokens.access_token;
  }

  const clientId = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: tokens.refresh_token
    })
  });
  const data = await res.json();
  if (data.access_token) {
    tokens.access_token = data.access_token;
    tokens.expires_at = Date.now() + (data.expires_in * 1000) - 60000;
    await fs.writeJson(configPath, config, { spaces: 2 });
    return data.access_token;
  }
  if (tokens.access_token) {
    return tokens.access_token;
  }
  throw new Error('No se pudo refrescar el token de Firebase.');
}

async function run() {
  console.log(pc.cyan('🔄 Actualizando metadatos de GitHub para ventas-moni-app en Firestore...'));
  try {
    const token = await getFirebaseAccessToken();
    const url = 'https://firestore.googleapis.com/v1/projects/prototipe-ecosistema-control/databases/(default)/documents/clientes_control/ventas-moni-app?updateMask.fieldPaths=github';
    
    const body = {
      fields: {
        github: {
          mapValue: {
            fields: {
              url: { stringValue: 'https://github.com/DEVPROTOTIPE/prototipe-core-ventas/tree/cliente/ventas-moni-app' },
              branch: { stringValue: 'cliente/ventas-moni-app' },
              repo: { stringValue: 'prototipe-core-ventas' }
            }
          }
        }
      }
    };

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Firestore API error (${res.status}): ${errText}`);
    }

    console.log(pc.green('✅ Metadatos de GitHub actualizados con éxito en Firestore para ventas-moni-app.'));
  } catch (err) {
    console.error(pc.red(`❌ Error al actualizar Firestore: ${err.message}`));
    process.exit(1);
  }
}

run();
