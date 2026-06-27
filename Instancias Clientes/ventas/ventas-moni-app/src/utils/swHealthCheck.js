/**
 * swHealthCheck.js
 * ─────────────────────────────────────────────────────────────────
 * Detecta y repara automáticamente el conflicto de versión de
 * IndexedDB causado por el Service Worker de FCM (Firebase Messaging).
 *
 * PROBLEMA:
 *   El SW de FCM crea una IndexedDB "firebase-messaging-database" en versión X.
 *   Si el SW se actualiza y la versión sube, pero el browser aún tiene la DB
 *   vieja, el intento de abrir la versión antigua falla con:
 *   "The requested version (1) is less than the existing version (2)"
 *
 * SOLUCIÓN:
 *   Detectar el conflicto antes de inicializar FCM, eliminar las bases
 *   de datos obsoletas conocidas, y re-registrar el SW limpio.
 *
 * USO (en main.jsx o App.jsx, antes de inicializar Firebase Messaging):
 *   import { repairFCMStorage } from './utils/swHealthCheck'
 *   await repairFCMStorage()   // llamar una sola vez al arrancar la app
 * ─────────────────────────────────────────────────────────────────
 */

// Bases de datos IndexedDB que FCM/Firebase crea internamente
const FCM_INDEXED_DBS = [
  'firebase-messaging-database',
  'firebase-installations-database',
]

/**
 * Verifica si una IndexedDB específica tiene un conflicto de versión.
 * @param {string} dbName
 * @returns {Promise<boolean>}
 */
async function hasVersionConflict(dbName) {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(dbName)
      req.onsuccess = () => {
        req.result.close()
        resolve(false)
      }
      req.onerror = (e) => {
        // Error code 8 = VersionError en algunos navegadores
        const isVersionError = e.target?.error?.name === 'VersionError' ||
          e.target?.error?.message?.includes('less than the existing version')
        resolve(isVersionError)
      }
      req.onupgradeneeded = () => {
        req.result.close()
        resolve(false)
      }
    } catch {
      resolve(false)
    }
  })
}

/**
 * Elimina una IndexedDB del navegador.
 * @param {string} dbName
 * @returns {Promise<void>}
 */
function deleteDB(dbName) {
  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(dbName)
    req.onsuccess = () => resolve()
    req.onerror = () => resolve() // silencioso — si falla, el siguiente arranque lo reintenta
    req.onblocked = () => resolve()
  })
}

/**
 * Des-registra todos los Service Workers activos del origen actual.
 * Necesario para que el SW de FCM se re-registre limpio.
 * @returns {Promise<void>}
 */
async function unregisterStaleServiceWorkers() {
  if (!('serviceWorker' in navigator)) return
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map(reg => reg.unregister()))
  } catch {
    // No critical — si falla, el SW simplemente coexistirá
  }
}

/**
 * Punto de entrada principal. Detecta y repara el conflicto de versión
 * de IndexedDB del SW de FCM. Es idempotente y seguro ejecutar en cada arranque.
 *
 * @param {{ verbose?: boolean }} options
 *   - verbose: Si true, imprime logs en consola (útil en desarrollo).
 * @returns {Promise<{ repaired: boolean, details: string[] }>}
 */
export async function repairFCMStorage({ verbose = false } = {}) {
  const log = verbose ? console.log.bind(console, '[swHealthCheck]') : () => {}
  const details = []
  let repaired = false

  for (const dbName of FCM_INDEXED_DBS) {
    const hasConflict = await hasVersionConflict(dbName)
    if (hasConflict) {
      log(`Conflicto de versión detectado en "${dbName}". Eliminando...`)
      await deleteDB(dbName)
      details.push(`Eliminada DB: ${dbName}`)
      repaired = true
    }
  }

  if (repaired) {
    log('Des-registrando Service Workers obsoletos...')
    await unregisterStaleServiceWorkers()
    details.push('Service Workers des-registrados')
    log('Reparación completada. La app re-registrará el SW en el próximo ciclo.')
  } else {
    log('Sin conflictos de IndexedDB detectados.')
  }

  return { repaired, details }
}

/**
 * Wrapper para usar en el catch del FCM hook.
 * Detecta si un error es un conflicto de versión de IndexedDB y lo repara.
 *
 * @param {Error} error
 * @returns {boolean} true si era un conflicto de versión y se intentó reparar
 */
export async function handleFCMIndexedDBError(error) {
  const msg = error?.message || String(error)
  const isVersionConflict = msg.includes('less than the existing version') ||
    msg.includes('IDBOpenDBRequest') ||
    error?.name === 'VersionError'

  if (!isVersionConflict) return false

  console.warn('[swHealthCheck] Conflicto de versión de IndexedDB detectado en FCM. Reparando automáticamente...')
  const { repaired, details } = await repairFCMStorage({ verbose: true })
  if (repaired) {
    console.info('[swHealthCheck] Reparación exitosa:', details.join(', '), '— Recarga la página para activar FCM.')
  }
  return true
}
