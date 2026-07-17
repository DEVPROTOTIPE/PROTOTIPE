import { OrderRepository, hashCelular, buildTrackingDoc } from '../api/OrderRepository'
import { ORDER_STATES } from '../../../constants'
import { createCentralNotification, NC_TYPES } from '../../../services/notificationCenterService'
import { reportAppFailureToDeveloper } from '../../../services/telemetryService'
import { queueDelivery } from '../../../services/deliveryService'

export { hashCelular, buildTrackingDoc }

/**
 * Crea un nuevo pedido desde el cliente.
 * Descuenta el stock INMEDIATAMENTE de forma atómica (reserva temporal, vía
 * OrderRepository.createOrderTransaction). Si no hay stock suficiente lanza
 * un error con el detalle del producto. El pedido se guarda con
 * stockDescontado: true para evitar doble descuento al completar.
 */
export async function createOrder(orderData) {
  const { id, orderNumber, trackingToken } = await OrderRepository.createOrderTransaction(orderData)

  // Emitir Notificación Central de Pedido Recibido para el Administrador y Vendedor
  try {
    const isWholesale = orderData.tipo === 'wholesale' || orderData.items?.some(item => item.wholesale)
    const isCustomOrder = orderData.tipo === 'custom_order' || orderData.customOrder || orderData.items?.some(item => item.custom)
    const typeLabel = isWholesale ? 'Al por mayor' : isCustomOrder ? 'Por encargo' : 'Normal'

    await createCentralNotification({
      recipientId: 'admin',
      recipientRole: 'admin',
      title: 'Nuevo Pedido Recibido',
      body: `Pedido ${typeLabel} de ${orderData.cliente?.nombre || 'Cliente'} (${orderData.cliente?.celular || ''}) por valor de $${orderData.total || 0}.`,
      type: NC_TYPES.PEDIDO_RECIBIDO,
      orderId: id,
      orderNumber
    })

    await createCentralNotification({
      recipientId: 'vendedor',
      recipientRole: 'vendedor',
      title: 'Nuevo Pedido PWA Recibido',
      body: `Pedido ${typeLabel} de ${orderData.cliente?.nombre || 'Cliente'} (${orderData.cliente?.celular || ''}) por valor de $${orderData.total || 0}.`,
      type: NC_TYPES.PEDIDO_RECIBIDO,
      orderId: id,
      orderNumber
    })
  } catch (err) {
    console.error('[orderService] Error al notificar creación de pedido:', err)
  }

  // Encolar en deliveries — TODOS los pedidos tipo domicilio, sin condiciones
  try {
    if (orderData.tipoEntrega === 'domicilio') {
      await queueDelivery({
        orderId: id,
        orderNumber,
        address: orderData.cliente?.direccion || '',
        clientName: orderData.cliente?.nombre || '',
        phone: orderData.cliente?.celular || '',
        items: (orderData.items || []).map(i => ({ nombre: i.nombre, cantidad: i.cantidad })),
        notas: orderData.notas || '',
        paymentMethod: orderData.metodoPago || '',
        total: orderData.total || 0,
      })
      console.log('[orderService] Pedido a domicilio encolado en deliveries')
    }
  } catch (err) {
    console.warn('[orderService] Error al encolar domicilio:', err.message)
  }

  return { id, trackingToken }
}

/**
 * Obtiene todos los pedidos activos (no archivados) para el Administrador
 */
export async function getOrders() {
  return OrderRepository.getAll()
}

/**
 * Se suscribe a los pedidos activos (no archivados) en tiempo real
 */
export function subscribeToOrders(callback) {
  return OrderRepository.subscribeToAll(callback, (error) => {
    console.error('[orderService] Error al escuchar pedidos activos:', error)
    reportAppFailureToDeveloper(`[orderService] subscribeToOrders: ${error?.message}`, error?.stack)
    callback([])
  })
}

/**
 * Obtiene pedidos archivados filtrados opcionalmente por fecha o paginados por cursor.
 */
export async function getArchivedOrders(filterDate = '', lastVisibleDoc = null, pageSize = 50) {
  try {
    return await OrderRepository.getArchived(filterDate, lastVisibleDoc, pageSize)
  } catch (err) {
    console.error('[orderService] Error al obtener pedidos archivados:', err.message)
    return []
  }
}

/**
 * Obtiene los pedidos asociados a un cliente mediante su número celular
 */
export async function getClientOrders(celular) {
  const hashedCelular = await hashCelular(celular)
  if (hashedCelular === 'unknown') return []

  const list = await OrderRepository.getByClientPhoneHash(hashedCelular)
  return list.sort((a, b) => {
    const tA = a.createdAt?.toMillis?.() || 0
    const tB = b.createdAt?.toMillis?.() || 0
    return tB - tA
  })
}

/**
 * Se suscribe a los pedidos de un cliente específico en tiempo real
 */
export function subscribeToClientOrders(celular, callback) {
  // Nota (comportamiento preservado del original, no corregido aquí): si el
  // llamador cancela antes de que `hashCelular` resuelva, `unsubscribeReal`
  // todavía apunta al no-op y el listener que se arma después queda sin
  // cancelar — es el mismo comportamiento que tenía `unsubscribeIndex` en el
  // código original (variable reasignada tras una promesa, sin bandera de
  // cancelación).
  let unsubscribeReal = () => {}

  hashCelular(celular).then(hashedCelular => {
    if (hashedCelular === 'unknown') {
      callback([])
      return
    }

    unsubscribeReal = OrderRepository.subscribeToClientOrdersByPhoneHash(hashedCelular, (list) => {
      const sorted = list.sort((a, b) => {
        const tA = a.createdAt?.toMillis?.() || 0
        const tB = b.createdAt?.toMillis?.() || 0
        return tB - tA
      })
      callback(sorted)
    }, (error) => {
      console.error('[orderService] Error al escuchar índice de pedidos del cliente:', error)
      callback([])
    })
  }).catch(err => {
    console.error('[orderService] Error al obtener hash en subscribeToClientOrders:', err)
    callback([])
  })

  return () => {
    unsubscribeReal()
  }
}

/**
 * Se suscribe a los pedidos registrados por un vendedor específico en tiempo real
 */
export function subscribeToVendedorOrders(vendedorId, callback) {
  return OrderRepository.subscribeToVendedor(vendedorId, (list) => {
    const sorted = list.sort((a, b) => {
      const tA = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
      const tB = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
      return tB - tA
    })
    callback(sorted)
  }, (error) => {
    console.error('[orderService] Error al escuchar pedidos del vendedor:', error)
    callback([])
  })
}

/**
 * Elimina lógicamente (o limpia del cliente) un historial de pedidos en lote
 */
export async function clearClientOrderHistory(orders) {
  await OrderRepository.clearClientOrderHistory(orders)
}

/**
 * Archiva los pedidos completados o cancelados del administrador
 */
export async function archiveOrders(orders) {
  await OrderRepository.archiveOrders(orders)
}

/**
 * Actualiza el estado de un pedido.
 * REGLA CRÍTICA: Si pasa a COMPLETADO, descuenta el stock de las variantes si no estaba descontado.
 * Si pasa a CRÉDITO_APROBADO, descuenta el stock Y genera el documento de deuda en 'credits'.
 */
export async function updateOrderStatus(orderId, newStatus, currentOrder) {
  await OrderRepository.updateOrderStatusTransaction(orderId, newStatus, currentOrder, ORDER_STATES)

  const notifyClient = async () => {
    if (currentOrder?.cliente?.celular && currentOrder.cliente.celular !== 'Desconocido') {
      let resolvedType = NC_TYPES.PEDIDO_ESTADO
      let title = 'Actualización de Pedido'
      let body = `Tu pedido #${currentOrder.orderNumber || ''} cambió a ${newStatus.toUpperCase()}`

      if (newStatus === ORDER_STATES.COMPLETED) {
        resolvedType = NC_TYPES.PEDIDO_ENTREGADO
        title = 'Pedido Completado'
        body = `Tu pedido #${currentOrder.orderNumber || ''} ha sido completado con éxito. ¡Gracias por tu compra!`
      } else if (newStatus === ORDER_STATES.DELIVERING) {
        resolvedType = NC_TYPES.PEDIDO_EN_CAMINO
        title = 'Pedido en Camino'
        body = `Tu pedido #${currentOrder.orderNumber || ''} está en camino a tu dirección con nuestro mensajero.`
      } else if (newStatus === ORDER_STATES.READY) {
        resolvedType = NC_TYPES.PEDIDO_LISTO
        title = 'Pedido Listo'
        body = `Tu pedido #${currentOrder.orderNumber || ''} ya está listo y empacado.`
      }

      await createCentralNotification({
        recipientId: currentOrder.cliente.celular,
        recipientRole: 'client',
        title,
        body,
        type: resolvedType,
        orderId: orderId,
        orderNumber: currentOrder.orderNumber,
        clickAction: currentOrder.trackingToken ? `/pedido/status?t=${currentOrder.trackingToken}` : null
      })
    }
  }

  if (newStatus === ORDER_STATES.CANCELLED || newStatus === ORDER_STATES.CREDIT_APPROVED) {
    await notifyClient()
    return
  }

  if (newStatus === ORDER_STATES.PREPARING || newStatus === 'preparing') {
    try {
      await createCentralNotification({
        recipientId: 'bodeguero',
        recipientRole: 'bodeguero',
        title: 'Pedido para Empacar',
        body: `El pedido #${currentOrder?.orderNumber || orderId?.slice(-4)} ha cambiado a preparación y está listo para ser empacado.`,
        type: NC_TYPES.PEDIDO_PREPARANDO,
        orderId: orderId,
        orderNumber: currentOrder?.orderNumber
      })
    } catch (err) {
      console.error('[orderService] Error al notificar al bodeguero:', err)
    }
  }

  await notifyClient()
}

/**
 * Actualiza el costo de envío de un pedido y recalcula el total.
 */
export async function updateOrderDeliveryCost(orderId, newCost, currentTotal, currentDeliveryCost) {
  await OrderRepository.updateDeliveryCost(orderId, newCost, currentTotal, currentDeliveryCost)
}

/**
 * Se suscribe al documento público de seguimiento de un pedido en tiempo real.
 */
export function subscribeToOrderByToken(token, onUpdate, onError) {
  return OrderRepository.subscribeByTrackingToken(token, onUpdate, onError)
}

/**
 * Migra pedidos existentes que no tienen documento en `order_tracking`.
 * Ejecutar desde el panel de administración una sola vez después del despliegue.
 */
export async function migrateOrdersToTracking() {
  return OrderRepository.migrateOrdersToTracking()
}
