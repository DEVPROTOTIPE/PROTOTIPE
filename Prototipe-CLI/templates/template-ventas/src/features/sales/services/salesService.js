import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../../config/firebaseConfig'
import { COLLECTIONS, ORDER_STATES, PAYMENT_METHODS } from '../../../constants'
import { createCentralNotification, NC_TYPES } from '../../../services/notificationCenterService'
import { deductInventoryStock } from '../../inventory/services/inventoryInterface'

// Helper utilitario de timeout para transacciones de Firestore
function withTimeout(promise, timeoutMs = 15000, errorMsg = 'La operación ha superado el tiempo de espera de red (Timeout).') {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMsg)), timeoutMs)
    promise
      .then((val) => {
        clearTimeout(timer)
        resolve(val)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

/**
 * Crea un pedido físico directamente en el portal admin (venta POS/Local)
 */
export async function createPhysicalOrder(orderData, adminId, forcedOrderId = null) {
  const orderNumber = orderData.orderNumber || `OR-POS-${Math.floor(100000 + Math.random() * 900000)}`
  const orderIdRef = forcedOrderId
    ? doc(db, COLLECTIONS.ORDERS, forcedOrderId)
    : doc(collection(db, COLLECTIONS.ORDERS))

  const creditIdRef = doc(db, COLLECTIONS.CREDITS, `credit_${orderIdRef.id}`)
  let isStockConflict = false
  let orderAlreadyExists = false
  let existingOrderNumber = null

  await withTimeout(runTransaction(db, async (transaction) => {
    if (forcedOrderId) {
      const existingDoc = await transaction.get(orderIdRef)
      if (existingDoc.exists()) {
        orderAlreadyExists = true
        existingOrderNumber = existingDoc.data()?.orderNumber
        return
      }
    }

    const items = orderData.items || []
    const inventoryItems = items
      .filter(item => item.productId && !item.productId.startsWith('custom-'))
      .map(item => ({
        productId: item.productId,
        varianteId: item.variantId,
        cantidad: item.cantidad,
        nombre: item.nombre
      }))

    try {
      await deductInventoryStock(inventoryItems, transaction)
    } catch (err) {
      if (orderData.offline === true) {
        isStockConflict = true
      } else {
        throw err
      }
    }

    let resolvedStatus
    if (isStockConflict) {
      resolvedStatus = ORDER_STATES.PENDING_CONCILIATION
    } else {
      resolvedStatus = (orderData.metodoPago === PAYMENT_METHODS.CASH || orderData.metodoPago === PAYMENT_METHODS.TRANSFER)
        ? ORDER_STATES.COMPLETED
        : (orderData.metodoPago === PAYMENT_METHODS.CREDIT ? ORDER_STATES.CREDIT_APPROVED : ORDER_STATES.PENDING)
    }

    transaction.set(orderIdRef, {
      ...orderData,
      orderNumber,
      estado: resolvedStatus,
      stockDescontado: !isStockConflict,
      archivado: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    if (orderData.metodoPago === PAYMENT_METHODS.CREDIT) {
      transaction.set(creditIdRef, {
        orderId: orderIdRef.id,
        orderNumber,
        cliente: orderData.cliente,
        clienteNombre: orderData.cliente?.nombre || '',
        clienteCelular: orderData.cliente?.celular || '',
        total: orderData.total,
        montoTotal: orderData.total,
        saldoPendiente: orderData.total,
        abonos: [],
        estado: 'activo',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
  }), 15000, 'Error: No se pudo conectar con el servidor para registrar la venta en caja. Inténtalo de nuevo.')

  if (orderAlreadyExists) {
    return { id: orderIdRef.id, orderNumber: existingOrderNumber || orderNumber }
  }

  if (isStockConflict) {
    try {
      await createCentralNotification({
        recipientId: 'admin',
        recipientRole: 'admin',
        title: 'Conflicto de Stock Offline',
        body: `El pedido ${orderNumber} de ${orderData.cliente?.nombre || 'Cliente'} se sincronizó pero entró en conflicto por stock insuficiente.`,
        type: NC_TYPES.STOCK_BAJO,
        orderId: orderIdRef.id,
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
      orderId: orderIdRef.id,
      orderNumber
    })
  } catch (err) {
    console.error('[salesService] Error al notificar venta física para vendedor:', err)
  }

  return { id: orderIdRef.id, orderNumber }
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
