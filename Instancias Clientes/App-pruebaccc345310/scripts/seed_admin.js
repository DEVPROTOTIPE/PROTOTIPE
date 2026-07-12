import fs from 'fs';
import path from 'path';
import os from 'os';

// 1. Leer .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("❌ Error: No se encontró .env.local en la raíz.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1]] = match[2].replace(/['"\\\x60]/g, '').trim();
  }
});

const apiKey = env.VITE_FIREBASE_API_KEY;
const projectId = env.VITE_FIREBASE_PROJECT_ID;
const adminEmail = env.VITE_DEVELOPER_ADMIN_EMAIL;
const adminPassword = env.VITE_DEVELOPER_ADMIN_PASSWORD;
const clientId = env.VITE_DEVELOPER_CLIENT_ID;
const theme = env.VITE_INITIAL_THEME || 'emerald';
const whatsappAdmin = env.VITE_DEVELOPER_WHATSAPP_ADMIN || '';
const storeAddress = env.VITE_DEVELOPER_STORE_ADDRESS || '';

if (!apiKey || !projectId || !adminEmail || !adminPassword) {
  console.error("❌ Error: Faltan variables de Firebase en .env.local");
  process.exit(1);
}

// 2. Obtener Token del Desarrollador (Firebase CLI)
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

const devToken = getDeveloperAccessToken();
if (!devToken) {
  console.error("❌ Error: No se pudo obtener la sesión de Firebase CLI. Ejecuta: firebase login");
  process.exit(1);
}

async function run() {
  console.log(`🤖 Iniciando siembra para la instancia [${clientId}]...`);
  
  // A. Registrar el Admin en Firebase Auth (REST)
  let uid = '';
  try {
    console.log(`🔑 Creando cuenta de administrador en Firebase Auth (${adminEmail})...`);
    const signupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        returnSecureToken: true
      })
    });
    
    const signupData = await signupRes.json();
    if (!signupRes.ok) {
      if (signupData.error && signupData.error.message === 'EMAIL_EXISTS') {
        console.log(`ℹ️  El correo ${adminEmail} ya existe en Firebase Auth. Intentando obtener UID...`);
        const signinRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: adminEmail,
            password: adminPassword,
            returnSecureToken: true
          })
        });
        const signinData = await signinRes.json();
        if (!signinRes.ok) {
          console.warn(`⚠️  [Firebase Auth] El correo ya existe pero no se pudo iniciar sesión para recuperar el UID (${signinData.error?.message}).`);
          console.warn(`👉 Se usará un UID determinista basado en el correo para la siembra de Firestore.`);
          uid = 'uid_' + Buffer.from(adminEmail).toString('base64').replace(/=/g, '').substring(0, 20);
        } else {
          uid = signinData.localId;
        }
      } else if (signupData.error && signupData.error.message === 'CONFIGURATION_NOT_FOUND') {
        console.warn(`⚠️  [Firebase Auth] El proveedor de correo y contraseña está deshabilitado en Firebase Console.`);
        console.warn(`👉 Actívalo en: https://console.firebase.google.com/project/${projectId}/authentication/providers`);
        console.warn(`⏳ Omitiendo creación de credenciales en Auth, pero continuando con el sembrado de Firestore...`);
        uid = 'fallback-admin';
      } else {
        throw new Error(signupData.error?.message || 'Error desconocido al registrar usuario.');
      }
    } else {
      uid = signupData.localId;
      console.log(`✅ Administrador creado en Firebase Auth con UID: ${uid}`);
    }
  } catch (err) {
    console.error(`❌ Error en Firebase Auth: ${err.message}`);
    process.exit(1);
  }

  // B. Crear perfil de Admin en Firestore (Solo si uid es válido y no es fallback)
  if (uid && uid !== 'fallback-admin') {
    try {
      console.log(`👤 Configurando perfil de administrador en Firestore (users/${uid})...`);
      const userUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;
      const userPayload = {
        fields: {
          email: { stringValue: adminEmail },
          role: { stringValue: 'admin' },
          createdAt: { stringValue: new Date().toISOString() },
          activo: { booleanValue: true }
        }
      };
      
      const userRes = await fetch(userUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${devToken}` },
        body: JSON.stringify(userPayload)
      });
      
      if (!userRes.ok) {
        const errData = await userRes.json();
        throw new Error(errData.error?.message || 'Error al guardar perfil.');
      }
      console.log(`✅ Perfil de administrador guardado en Firestore.`);
    } catch (err) {
      console.error(`❌ Error al guardar perfil en Firestore: ${err.message}`);
      process.exit(1);
    }
  } else {
    console.log(`ℹ️  Omitiendo creación de perfil users/fallback-admin debido a proveedor Auth deshabilitado.`);
  }

  // C. Crear configuración global config/settings en Firestore
  try {
    console.log(`⚙️  Inicializando configuración global del negocio (config/settings)... `);
    const settingsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/config/settings`;
    
    const settingsPayload = {
      fields: {
        storeName: { stringValue: clientId.toUpperCase() },
        theme: { stringValue: theme },
        whatsapp: { stringValue: whatsappAdmin },
        address: { stringValue: storeAddress },
        whatsappEnabled: { booleanValue: true },
        dianEnabled: { booleanValue: false },
        maintenanceMode: { booleanValue: false },
        deliverySettings: {
          mapValue: {
            fields: {
              pickup: {
                mapValue: {
                  fields: {
                    enabled: { booleanValue: true },
                    instructions: { stringValue: `Recoger en tienda: ${storeAddress || 'Dirección de la sucursal'}` }
                  }
                }
              }
            }
          }
        },
        updatedAt: { stringValue: new Date().toISOString() }
      }
    };

    const settingsRes = await fetch(settingsUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${devToken}` },
      body: JSON.stringify(settingsPayload)
    });
    
    if (!settingsRes.ok) {
      const errData = await settingsRes.json();
      throw new Error(errData.error?.message || 'Error al inicializar settings.');
    }
    console.log(`✅ Configuración config/settings inicializada.`);
  } catch (err) {
    console.error(`❌ Error al escribir config/settings: ${err.message}`);
    process.exit(1);
  }

  // D. Sembrado de catálogo dinámico y agnóstico de nicho comercial
  try {
    const seedDataPath = path.join(process.cwd(), 'scripts', 'seed_data.json');
    if (!fs.existsSync(seedDataPath)) {
      console.log("ℹ️  No se encontró scripts/seed_data.json. Omitiendo sembrado de catálogo.");
    } else {
      const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));
      const collections = seedData.collections || {};
      
      console.log(`📦 Sembrando catálogo inicial dinámico y agnóstico...`);
      for (const [colName, docs] of Object.entries(collections)) {
        console.log(`📁 Sembrando colección "${colName}"...`);
        for (const doc of docs) {
          const docUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${colName}/${doc.id}`;
          
          // Reemplazar marcadores de tiempo
          const fields = { ...doc.fields };
          for (const [fName, fVal] of Object.entries(fields)) {
            if (fVal.stringValue === 'TIMESTAMP_PLACEHOLDER') {
              fields[fName] = { stringValue: new Date().toISOString() };
            }
          }
          
          const payload = { fields };
          const res = await fetch(docUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${devToken}` },
            body: JSON.stringify(payload)
          });
          
          if (res.ok) {
            console.log(`   - Documento sembrado en ${colName}: ${doc.id}`);
          } else {
            const errData = await res.json().catch(() => ({}));
            console.warn(`   - Error al sembrar ${doc.id} en ${colName}: ${errData.error?.message || 'Error desconocido'}`);
          }
        }
      }
      console.log(`✅ Catálogo comercial inicial sembrado en Firestore.`);
    }
  } catch (seedErr) {
    console.warn(`⚠️  [Smart Seeding] No se pudo sembrar el catálogo de nicho: ${seedErr.message}`);
  }

  console.log(`\n🎉 ¡Siembra completada con éxito!`);
  console.log(`   - Usuario: ${adminEmail}`);
  console.log(`   - Contraseña: ${adminPassword}`);
  console.log(`   - Configuración base del negocio inicializada.`);
}

run();
