import {
  collection,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy,
  runTransaction,
  onSnapshot,
  limit,
  startAfter
} from 'firebase/firestore'
import { db } from '../../../config/firebaseConfig'
import { COLLECTIONS } from '../../../constants'
import { createCentralNotification, NC_TYPES, subscribeToAdminNotifications } from '../../../services/notificationCenterService'

const creditsRef = collection(db, COLLECTIONS.CREDITS)

/**
 * Obtener todos los créditos filtrados por estado.
 * @param {string} [estado='activo'] - Estado del crédito ('activo', 'pagado').
 * @returns {Promise<Array<object>>} Listado de créditos ordenados por fecha de creación descendente.
 */
export async function getCredits(estado = 'activo') {
  const q = query(creditsRef, where('estado', '==', estado))
  const snap = await getDocs(q)
  
  const credits = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  return credits.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
}

/**
 * Obtener los créditos de un cliente específico por su número celular.
 * @param {string} celular - Número celular del cliente.
 * @returns {Promise<Array<object>>} Listado de créditos del cliente ordenados por fecha.
 */
export async function getClientCredits(celular) {
  if (!celular) return []
  const q = query(creditsRef, where('cliente.celular', '==', celular))
  const snap = await getDocs(q)
  
  const credits = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  return credits.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
}

/**
 * Agregar un abono a una deuda.
 * Se usa una transacción para asegurar consistencia concurrente. Si el saldo restante llega a cero,
 * se liquida la deuda y se marca el pedido original asociado como 'completado'.
 * @param {string} creditId - Identificador del crédito.
 * @param {object} paymentData - Datos del abono.
 * @param {number} paymentData.monto - Monto a abonar.
 * @param {string} [paymentData.nota] - Nota u observación opcional del abono.
 * @returns {Promise<void>}
 */
export async function addPaymentToCredit(creditId, paymentData) {
  const creditRef = doc(db, COLLECTIONS.CREDITS, creditId)
  let creditData = null

  await runTransaction(db, async (transaction) => {
    const creditDoc = await transaction.get(creditRef)
    if (!creditDoc.exists()) throw new Error('Crédito no encontrado')
    
    const data = creditDoc.data()
    creditData = data
    
    if (data.estado === 'pagado') {
      throw new Error('Esta deuda ya se encuentra totalmente pagada.')
    }
    
    const nuevoAbono = {
      monto: paymentData.monto,
      nota: paymentData.nota || '',
      fecha: new Date().toISOString(),
    }

    const nuevosAbonos = [...(data.abonos || []), nuevoAbono]
    const currentSaldo = data.saldoPendiente !== undefined ? data.saldoPendiente : (data.saldoPending !== undefined ? data.saldoPending : data.montoTotal)
    const nuevoSaldo = Math.max(0, currentSaldo - paymentData.monto)
    const nuevoEstado = nuevoSaldo === 0 ? 'pagado' : 'activo'

    transaction.update(creditRef, {
      abonos: nuevosAbonos,
      saldoPendiente: nuevoSaldo,
      estado: nuevoEstado,
      updatedAt: serverTimestamp()
    })

    if (nuevoSaldo === 0 && data.orderId) {
      const orderRef = doc(db, COLLECTIONS.ORDERS, data.orderId)
      transaction.update(orderRef, {
        estado: 'completado',
        updatedAt: serverTimestamp()
      })
    }
  })

  // Notificaciones
  if (creditData && creditData.cliente?.celular) {
    await createCentralNotification({
      recipientId: creditData.cliente.celular,
      recipientRole: 'client',
      title: 'Abono Registrado',
      body: `Se aplicó un abono de $${paymentData.monto.toLocaleString()} a tu crédito para el pedido #${creditData.orderNumber || ''}.`,
      type: NC_TYPES.ABONO_RECIBIDO,
      orderId: creditData.orderId,
      orderNumber: creditData.orderNumber
    })
  }

  if (creditData) {
    await createCentralNotification({
      recipientId: 'admin',
      recipientRole: 'admin',
      title: 'Abono Recibido',
      body: `Se ha registrado un abono de $${paymentData.monto.toLocaleString()} por parte de ${creditData.cliente?.nombre || 'Cliente'} para el pedido #${creditData.orderNumber || ''}.`,
      type: NC_TYPES.ABONO_RECIBIDO,
      orderId: creditData.orderId,
      orderNumber: creditData.orderNumber
    })
  }
}

/**
 * Suscribirse en tiempo real a todos los créditos de un estado específico.
 * @param {string} [estado='activo'] - Estado de los créditos a monitorear.
 * @param {function} onUpdate - Callback llamado con los créditos actualizados.
 * @returns {function} Función para cancelar la suscripción.
 */
export function subscribeToCredits(estado = 'activo', onUpdate) {
  const q = query(creditsRef, where('estado', '==', estado))
  return onSnapshot(q, (snap) => {
    const credits = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const sorted = credits.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
    onUpdate(sorted)
  }, (error) => {
    console.error('[creditService] Error al escuchar créditos activos:', error)
    onUpdate([])
  })
}

/**
 * Suscribirse en tiempo real a los créditos de un cliente.
 * @param {string} celular - Celular del cliente.
 * @param {function} onUpdate - Callback llamado con los créditos actualizados.
 * @returns {function} Función para cancelar la suscripción.
 */
export function subscribeToClientCredits(celular, onUpdate) {
  if (!celular) {
    onUpdate([])
    return () => {}
  }
  const q = query(creditsRef, where('cliente.celular', '==', celular))
  return onSnapshot(q, (snap) => {
    const credits = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const sorted = credits.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
    onUpdate(sorted)
  }, (error) => {
    console.error('[creditService] Error al escuchar créditos del cliente:', error)
    onUpdate([])
  })
}

/**
 * Obtener créditos paginados para el panel de administración.
 * @param {string} [estado='activo'] - Estado de créditos.
 * @param {number} [limitSize=10] - Cantidad de documentos por página.
 * @param {object} [startAfterDoc=null] - Documento Firestore de corte para paginación.
 * @returns {Promise<{ credits: Array<object>, lastDoc: object|null, hasNextPage: boolean }>}
 */
export async function getCreditsPaged(estado = 'activo', limitSize = 10, startAfterDoc = null) {
  const constraints = [
    where('estado', '==', estado),
    orderBy('createdAt', 'desc'),
    limit(limitSize + 1)
  ]
  
  if (startAfterDoc) {
    constraints.push(startAfter(startAfterDoc))
  }
  
  const q = query(creditsRef, ...constraints)
  const snap = await getDocs(q)
  
  const docs = snap.docs
  const hasNextPage = docs.length > limitSize
  const creditsToShow = hasNextPage ? docs.slice(0, limitSize) : docs
  
  return {
    credits: creditsToShow.map(doc => ({ id: doc.id, ...doc.data() })),
    lastDoc: creditsToShow[creditsToShow.length - 1] || null,
    hasNextPage
  }
}

/**
 * Reportar abono de crédito al administrador.
 * @param {object} params - Parámetros del reporte.
 * @param {number} params.monto - Monto pagado.
 * @param {string} params.clienteNombre - Nombre del cliente.
 * @param {string} params.clienteCelular - Celular del cliente.
 * @param {string} params.orderNumber - Número del pedido.
 * @param {string} params.orderId - ID del pedido.
 * @returns {Promise<void>}
 */
export async function reportCreditPayment({ monto, clienteNombre, clienteCelular, orderNumber, orderId }) {
  await createCentralNotification({
    recipientId: 'admin',
    recipientRole: 'admin',
    title: 'Reporte de Pago Recibido',
    body: `${clienteNombre} (${clienteCelular}) reportó un abono de $${monto.toLocaleString()} para el pedido #${orderNumber}.`,
    type: NC_TYPES.ABONO_RECIBIDO,
    orderId,
    orderNumber
  })
}

/**
 * Crear notificación de crédito (compatibilidad legacy).
 * @param {object} notificationData - Datos de la notificación.
 * @returns {Promise<void>}
 */
export async function createCreditNotification(notificationData) {
  await createCentralNotification({
    recipientId: 'admin',
    recipientRole: 'admin',
    title: 'Abono de Crédito',
    body: `${notificationData.clienteNombre || 'Cliente'} abonó $${(notificationData.monto || 0).toLocaleString()}`,
    type: NC_TYPES.ABONO_RECIBIDO,
    orderId: notificationData.orderId || null,
    orderNumber: notificationData.orderNumber || null
  })
}

/**
 * Suscripción a notificaciones de crédito (compatibilidad legacy).
 * @param {function} onUpdate - Callback de actualización.
 * @returns {function} Función para cancelar suscripción.
 */
export function subscribeToNotifications(onUpdate) {
  return subscribeToAdminNotifications(onUpdate)
}
