import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_APP_ID'
]

const missingVars = REQUIRED_VARS.filter(key => !import.meta.env[key])
if (missingVars.length > 0) {
  console.error(
    `❌ [Firebase Config ERROR] Falta configurar las siguientes variables de entorno obligatorias en .env.local:\n` +
    missingVars.map(v => `   - ${v}`).join('\n') +
    `\nLa aplicación no funcionará correctamente hasta que se agreguen.`
  )
}

/**
 * Configuración oficial de Firebase para la aplicación.
 * Las credenciales se obtienen desde variables de entorno (.env.local)
 * para no exponerlas en el código fuente.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Inicializar Firebase con resguardo para HMR en desarrollo
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Exportar servicios con cache persistente local de Firestore (resguardo HMR)
let db
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  })
} catch (e) {
  db = getFirestore(app)
}

export { db }
export const auth = getAuth(app)
export const storage = getStorage(app)

// Exportar mensajería nula de forma segura para compatibilidad de diagnósticos (excluyendo el bundle del SDK)
export const messaging = null
export default app
