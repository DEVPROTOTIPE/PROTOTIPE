/**
 * offboard_client.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Script CLI de PROTOTIPE para realizar la extracción y baja técnica (Offboarding)
 * de un cliente, volcando todas sus colecciones de Firestore a JSON estructurado.
 *
 * Uso:
 *   node scripts/offboard_client.js --client=[clientId]
 * ─────────────────────────────────────────────────────────────────────────────
 */

import path from 'path';
import fs from 'fs-extra';
import minimist from 'minimist';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const argv = minimist(process.argv.slice(2));

const CLI_ROOT = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([a-zA-Z]:)/, '$1');
const MONOREPO_ROOT = path.resolve(CLI_ROOT, '../..');

// Lista de colecciones estándar del ecosistema App Ventas a extraer
const COLECCIONES_STANDARDS = [
  'ventas',
  'inventario',
  'clientes',
  'configuracion',
  'usuarios',
  'credits',
  'reportesBilling',
  'gastos',
  'cajas_diarias'
];

async function run() {
  const clientId = argv.client;
  if (!clientId) {
    console.error('❌ Error: Debes especificar el cliente. Ejemplo: node offboard_client.js --client=ventas-moni-app');
    process.exit(1);
  }

  console.log(`⚠️  Iniciando proceso de offboarding técnico para: ${clientId}...`);

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

    // 2. Extraer llaves de configuración de Firebase de .env.local
    const envContent = await fs.readFileSync(envPath, 'utf-8');
    const config = {};
    
    const keys = [
      'VITE_DEVELOPER_FIREBASE_API_KEY',
      'VITE_DEVELOPER_FIREBASE_AUTH_DOMAIN',
      'VITE_DEVELOPER_FIREBASE_PROJECT_ID',
      'VITE_DEVELOPER_FIREBASE_STORAGE_BUCKET',
      'VITE_DEVELOPER_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_DEVELOPER_FIREBASE_APP_ID'
    ];

    keys.forEach(key => {
      const regex = new RegExp(`${key}\\s*=\\s*(.*)`);
      const match = envContent.match(regex);
      if (match) {
        config[key] = match[1].trim().replace(/['"]/g, '');
      }
    });

    if (!config.VITE_DEVELOPER_FIREBASE_API_KEY || !config.VITE_DEVELOPER_FIREBASE_PROJECT_ID) {
      throw new Error('No se pudieron extraer los parámetros de Firebase del .env.local del cliente.');
    }

    // 3. Inicializar App Firebase del cliente
    const firebaseConfig = {
      apiKey: config.VITE_DEVELOPER_FIREBASE_API_KEY,
      authDomain: config.VITE_DEVELOPER_FIREBASE_AUTH_DOMAIN,
      projectId: config.VITE_DEVELOPER_FIREBASE_PROJECT_ID,
      storageBucket: config.VITE_DEVELOPER_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.VITE_DEVELOPER_FIREBASE_MESSAGING_SENDER_ID,
      appId: config.VITE_DEVELOPER_FIREBASE_APP_ID
    };

    const clientApp = initializeApp(firebaseConfig, `offboard_${clientId}_${Date.now()}`);
    const db = getFirestore(clientApp);

    console.log(`[Offboarding] Conectado exitosamente al proyecto Firestore: ${firebaseConfig.projectId}`);

    // 4. Volcar colecciones
    const outputDir = path.join(MONOREPO_ROOT, 'Backups_Ecosistema', `Offboarding_${clientId}`);
    await fs.ensureDir(outputDir);

    const dumpData = {};

    for (const colName of COLECCIONES_STANDARDS) {
      try {
        console.log(`[Offboarding] Volcando colección: ${colName}...`);
        const querySnapshot = await getDocs(collection(db, colName));
        const docs = [];
        
        querySnapshot.forEach(doc => {
          docs.push({
            id: doc.id,
            ...doc.data()
          });
        });

        dumpData[colName] = docs;
        const colPath = path.join(outputDir, `${colName}.json`);
        await fs.writeJson(colPath, docs, { spaces: 2 });
        console.log(`  - Guardados ${docs.length} documentos en ${colName}.json`);
      } catch (colErr) {
        console.warn(`  - [Aviso] Colección '${colName}' omitida o vacía en el proyecto cliente.`);
      }
    }

    // 5. Escribir metadatos de offboarding
    const metaPath = path.join(outputDir, 'metadata_offboarding.json');
    const metadata = {
      clientId,
      projectId: firebaseConfig.projectId,
      timestamp: new Date().toISOString(),
      collectionsDumped: Object.keys(dumpData),
      status: 'completed',
      policy: 'PROTOTIPE retendrá el proyecto de GCP/Firebase durante 30 días antes de su purga definitiva.'
    };
    await fs.writeJson(metaPath, metadata, { spaces: 2 });

    console.log(`\n✅ Proceso de volcado de datos completado.`);
    console.log(`📂 Todos los datos en formato JSON se guardaron en: ${outputDir}`);
    console.log(`📌 Entrega esta carpeta comprimida al cliente para finalizar su offboarding.`);

  } catch (err) {
    console.error(`❌ Error en el proceso de offboarding técnico: ${err.message}`);
    process.exit(1);
  }
}

run();
