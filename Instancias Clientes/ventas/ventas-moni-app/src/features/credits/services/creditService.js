import { CreditRepository } from '../api/CreditRepository'
import { createCentralNotification, NC_TYPES, subscribeToAdminNotifications } from '../../../services/notificationCenterService'

function sortByCreatedAtDesc(credits) {
  return credits.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
}

/**
 * Obtener todos los créditos filtrados por estado.
 * @param {string} [estado='activo'] - Estado del crédito ('activo', 'pagado').
 * @returns {Promise<Array<object>>} Listado de créditos ordenados por fecha de creación descendente.
 */
export async function getCredits(estado = 'activo') {
  const credits = await CreditRepository.getAll(estado)
  return sortByCreatedAtDesc(credits)
}

/**
 * Obtener los créditos de un cliente específico por su número celular.
 * @param {string} celular - Número celular del cliente.
 * @returns {Promise<Array<object>>} Listado de créditos del cliente ordenados por fecha.
 */
export async function getClientCredits(celular) {
  if (!celular) return []
  const credits = await CreditRepository.getByClientPhone(celular)
  return sortByCreatedAtDesc(credits)
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
  const creditData = await CreditRepository.runPaymentTransaction(creditId, (current, { serverTimestamp }) => {
    if (current.estado === 'pagado') {
      throw new Error('Esta deuda ya se encuentra totalmente pagada.')
    }

    const nuevoAbono = {
      monto: paymentData.monto,
      nota: paymentData.nota || '',
      fecha: new Date().toISOString(),
    }

    const nuevosAbonos = [...(current.abonos || []), nuevoAbono]
    const currentSaldo = current.saldoPendiente !== undefined ? current.saldoPendiente : (current.saldoPending !== undefined ? current.saldoPending : current.montoTotal)
    const nuevoSaldo = Math.max(0, currentSaldo - paymentData.monto)
    const nuevoEstado = nuevoSaldo === 0 ? 'pagado' : 'activo'

    const updatedCredit = {
      abonos: nuevosAbonos,
      saldoPendiente: nuevoSaldo,
      estado: nuevoEstado,
      updatedAt: serverTimestamp()
    }

    const orderUpdate = (nuevoSaldo === 0 && current.orderId)
      ? { orderId: current.orderId, data: { estado: 'completado', updatedAt: serverTimestamp() } }
      : null

    return { updatedCredit, orderUpdate }
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
  return CreditRepository.subscribeToAll(estado, (credits) => {
    onUpdate(sortByCreatedAtDesc(credits))
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
  return CreditRepository.subscribeToClientCredits(celular, (credits) => {
    onUpdate(sortByCreatedAtDesc(credits))
  }, (error) => {
    console.error('[creditService] Error al escuchar créditos del cliente:', error)
    onUpdate([])
  })
}

/**
 * Obtener créditos paginados para el panel de administración.
 *
 * Nota (comportamiento preservado, no modificado en esta migración): el
 * cursor `startAfterDoc`/`lastDoc` es un `QueryDocumentSnapshot` de Firestore
 * que el llamador (fuera de esta feature) guarda y reenvía tal cual para
 * pedir la siguiente página. Es infraestructura de Firestore cruzando hacia
 * el consumidor; ya era así antes de esta migración y no se rediseña aquí.
 * @param {string} [estado='activo'] - Estado de créditos.
 * @param {number} [limitSize=10] - Cantidad de documentos por página.
 * @param {object} [startAfterDoc=null] - Documento Firestore de corte para paginación.
 * @returns {Promise<{ credits: Array<object>, lastDoc: object|null, hasNextPage: boolean }>}
 */
export async function getCreditsPaged(estado = 'activo', limitSize = 10, startAfterDoc = null) {
  return CreditRepository.getAllPaged(estado, limitSize, startAfterDoc)
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
