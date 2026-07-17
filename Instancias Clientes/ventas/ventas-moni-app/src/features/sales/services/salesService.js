import { SalesRepository } from '../api/SalesRepository'
import { createCentralNotification, NC_TYPES } from '../../../services/notificationCenterService'

/**
 * Crea un pedido físico directamente en el portal admin (venta POS/Local)
 */
export async function createPhysicalOrder(orderData, adminId, forcedOrderId = null) {
  const { id, orderNumber, orderAlreadyExists, existingOrderNumber, isStockConflict } =
    await SalesRepository.createPhysicalOrderTransaction(orderData, forcedOrderId)

  if (orderAlreadyExists) {
    return { id, orderNumber: existingOrderNumber || orderNumber }
  }

  if (isStockConflict) {
    try {
      await createCentralNotification({
        recipientId: 'admin',
        recipientRole: 'admin',
        title: 'Conflicto de Stock Offline',
        body: `El pedido ${orderNumber} de ${orderData.cliente?.nombre || 'Cliente'} se sincronizó pero entró en conflicto por stock insuficiente.`,
        type: NC_TYPES.STOCK_BAJO,
        orderId: id,
        orderNumber
      })
    } catch (err) {
      console.error('[salesService] Error al notificar conflicto:', err)
    }
  }

  try {
    await createCentralNotification({
      recipientId: 'vendedor',
      recipientRole: 'vendedor',
      title: 'Venta POS Registrada',
      body: `Venta POS #${orderNumber} por valor de $${orderData.total || 0} registrada con éxito.`,
      type: NC_TYPES.PEDIDO_RECIBIDO,
      orderId: id,
      orderNumber
    })
  } catch (err) {
    console.error('[salesService] Error al notificar venta física para vendedor:', err)
  }

  return { id, orderNumber }
}

/**
 * Sincroniza las ventas físicas que fueron realizadas offline y guardadas en IndexedDB.
 */
export async function syncOfflineSales(retryCount = 0) {
  const { getOfflineSales, removeOfflineSale } = await import('../../../services/offlineDB')
  const pendingSales = await getOfflineSales()

  if (pendingSales.length === 0) return { success: true, count: 0 }

  let syncedCount = 0
  let conflicts = []

  for (const sale of pendingSales) {
    try {
      // Re-crear el pedido en el servidor
      const orderData = { ...sale.orderData }
      const adminId = sale.adminId || 'admin'

      await createPhysicalOrder(orderData, adminId, sale.id)

      // Si tiene éxito, remover del IndexedDB local
      await removeOfflineSale(sale.id)
      syncedCount++
    } catch (error) {
      console.error(`[syncOfflineSales] Error al sincronizar venta offline ${sale.id}:`, error)
      conflicts.push({ sale, error: error.message })
    }
  }

  if (syncedCount > 0 && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('offline-sales-synced', { detail: { count: syncedCount } }))
  }

  // Si hay fallas de sincronización (por lag en reconexión de Firestore), reintentar automáticamente
  if (conflicts.length > 0 && retryCount < 4) {
    console.log(`[syncOfflineSales] Sincronización incompleta, programando reintento #${retryCount + 1} en 5s...`)
    setTimeout(() => {
      syncOfflineSales(retryCount + 1).catch(console.error)
    }, 5000)
  }

  return {
    success: conflicts.length === 0,
    count: syncedCount,
    conflicts
  }
}
