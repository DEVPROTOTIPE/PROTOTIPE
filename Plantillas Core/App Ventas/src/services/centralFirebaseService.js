import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

/**
 * centralFirebaseService.js
 * ─────────────────────────────────────────────────────────────────
 * Singleton perezoso para la conexión secundaria a la base de datos
 * central del desarrollador (prototipe-ecosistema-control).
 *
 * Permite que la app cliente escuche en tiempo real:
 *  - sistemaAlerta: Alertas remotas enviadas desde el Dashboard.
 *  - triggerPing: Señal de diagnóstico para responder al Ping Test.
 *
 * Retorna null silenciosamente si las variables de entorno no están
 * configuradas (modo standalone, sin conexión central).
 */

const CENTRAL_API_KEY            = import.meta.env.VITE_DEVELOPER_CENTRAL_API_KEY || 'AIzaSyCBkdokIpGqWlfFiU_i83o7GmV1ZTqXYJE'
const CENTRAL_AUTH_DOMAIN        = import.meta.env.VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN || 'prototipe-ecosistema-control.firebaseapp.com'
const CENTRAL_PROJECT_ID         = import.meta.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID || 'prototipe-ecosistema-control'
const CENTRAL_STORAGE_BUCKET     = import.meta.env.VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET || 'prototipe-ecosistema-control.firebasestorage.app'
const CENTRAL_MESSAGING_SENDER_ID = import.meta.env.VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID || '703542009613'
const CENTRAL_APP_ID             = import.meta.env.VITE_DEVELOPER_CENTRAL_APP_ID || '1:703542009613:web:00f9363de11a908c991a44'

const APP_NAME = 'centralDevApp'
let centralDbInstance = null

/**
 * Devuelve la instancia de Firestore central (base de datos del desarrollador).
 * @returns {import('firebase/firestore').Firestore|null}
 */
export function getCentralFirestore() {
  if (!CENTRAL_API_KEY || !CENTRAL_PROJECT_ID) return null
  if (centralDbInstance) return centralDbInstance

  try {
    let app
    if (getApps().some(a => a.name === APP_NAME)) {
      app = getApp(APP_NAME)
    } else {
      app = initializeApp(
        {
          apiKey:            CENTRAL_API_KEY,
          authDomain:        CENTRAL_AUTH_DOMAIN,
          projectId:         CENTRAL_PROJECT_ID,
          storageBucket:     CENTRAL_STORAGE_BUCKET,
          messagingSenderId: CENTRAL_MESSAGING_SENDER_ID,
          appId:             CENTRAL_APP_ID,
        },
        APP_NAME
      )
    }
    centralDbInstance = getFirestore(app)
    return centralDbInstance
  } catch (err) {
    console.error('[CentralFirebase] Error inicializando la conexión central:', err)
    return null
  }
}
