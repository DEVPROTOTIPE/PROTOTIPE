import { collection, addDoc, serverTimestamp, query, getDocs } from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { withAuth, withAuthSilent, AuthGuardError } from '../utils/firestoreAuthGuard'

const COLLECTION_NAME = 'trackingAnalytics'

const EMPTY_METRICS = {
  qrGenerados: 0,
  accesosQR: 0,
  accesosEnlace: 0,
  sharesWa: 0,
  clicsTienda: 0,
  clicsApp: 0
}

/**
 * Registra un evento de analítica / telemetría de seguimiento de un pedido.
 * Blindado con withAuth: no escribe si no hay sesión activa.
 *
 * @param {string} orderId - ID interno del pedido
 * @param {string} orderNumber - Número del pedido (Ej. PED-1001)
 * @param {'qr_generate' | 'scan' | 'link_open' | 'whatsapp_share' | 'catalog_click' | 'app_download_click' | 'recompra_click'} eventType - Tipo de interacción
 * @param {object} [extraData] - Datos adicionales útiles para marketing
 */
export async function trackTrackingEvent(orderId, orderNumber, eventType, extraData = {}) {
  try {
    const payload = {
      orderId,
      orderNumber,
      eventType,
      extraData,
      userAgent: navigator.userAgent || 'unknown',
      createdAt: serverTimestamp()
    }

    // withAuth: lanza AuthGuardError si no hay sesión — no genera "Missing or insufficient permissions"
    await withAuth(() => addDoc(collection(db, COLLECTION_NAME), payload))
  } catch (error) {
    if (error instanceof AuthGuardError) return // Silencioso: usuario no autenticado aún
    console.error('[trackTrackingEvent] Error al guardar telemetría:', error)
  }
}

/**
 * Obtiene todas las métricas agregadas de conversión y telemetría de seguimiento.
 * Exclusivo para administradores. Blindado con withAuthSilent: retorna métricas vacías
 * si no hay sesión activa en lugar de lanzar "Missing or insufficient permissions".
 *
 * @returns {Promise<{
 *   qrGenerados: number,
 *   accesosQR: number,
 *   accesosEnlace: number,
 *   sharesWa: number,
 *   clicsTienda: number,
 *   clicsApp: number
 * }>}
 */
export async function getTrackingMetrics() {
  try {
    // withAuthSilent: retorna EMPTY_METRICS sin error si no hay sesión
    const snap = await withAuthSilent(() => getDocs(query(collection(db, COLLECTION_NAME))), null)

    if (!snap) return { ...EMPTY_METRICS }

    const metrics = { ...EMPTY_METRICS }
    snap.docs.forEach(doc => {
      const data = doc.data()
      if (data.eventType === 'qr_generate') metrics.qrGenerados++
      else if (data.eventType === 'scan') metrics.accesosQR++
      else if (data.eventType === 'link_open') metrics.accesosEnlace++
      else if (data.eventType === 'whatsapp_share') metrics.sharesWa++
      else if (data.eventType === 'catalog_click') metrics.clicsTienda++
      else if (data.eventType === 'app_download_click') metrics.clicsApp++
    })

    return metrics
  } catch (error) {
    console.error('[getTrackingMetrics] Error:', error)
    return { ...EMPTY_METRICS }
  }
}
