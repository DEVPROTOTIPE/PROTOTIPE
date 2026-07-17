import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../../config/firebaseConfig'
import { COLLECTIONS, ORDER_STATES, PAYMENT_METHODS } from '../../../constants'
import { deductInventoryStock } from '../../inventory/services/inventoryInterface'

/**
 * Envoltura para forzar un límite de tiempo de espera (timeout) en promesas
 * de Firestore. No toca Firebase directamente; colocada aquí porque solo la
 * usa la transacción de este Repository.
 */
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

export class SalesRepository {
  /**
   * Ejecuta la transacción completa de registro de una venta física (POS):
   * descuenta stock (vía la interfaz del contrato de inventario), crea el
   * pedido con el estado resuelto según el método de pago y, si aplica,
   * crea el crédito asociado. Cuerpo movido tal cual desde el Service
   * (mecánica de Firestore + decisiones de qué escribir, ya que dependían
   * del resultado del descuento de inventario dentro de la misma
   * transacción).
   *
   * @returns {Promise<{ id: string, orderNumber: string, orderAlreadyExists: boolean, existingOrderNumber: string|null, isStockConflict: boolean }>}
   */
  static async createPhysicalOrderTransaction(orderData, forcedOrderId = null) {
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

    return {
      id: orderIdRef.id,
      orderNumber,
      orderAlreadyExists,
      existingOrderNumber,
      isStockConflict,
    }
  }
}
