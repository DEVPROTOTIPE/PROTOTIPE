import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

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

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Exportar servicios con cache persistente local de Firestore
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
})

export { db }
export const auth = getAuth(app)
export const storage = getStorage(app)

// Exportar mensajería nula de forma segura para compatibilidad de diagnósticos (excluyendo el bundle del SDK)
export const messaging = null
export default app
