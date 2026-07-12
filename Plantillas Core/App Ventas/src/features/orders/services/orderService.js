import {
  collection,
  doc,
  getDocs,
  updateDoc,
  setDoc,
  getDoc,
  query,
  where,
  limit,
  startAfter,
  serverTimestamp,
  orderBy,
  runTransaction,
  onSnapshot,
  writeBatch
} from 'firebase/firestore'
import { db } from '../../../config/firebaseConfig'
import { COLLECTIONS, ORDER_STATES, PAYMENT_METHODS } from '../../../constants'
import { createCentralNotification, NC_TYPES } from '../../../services/notificationCenterService'
import { deductInventoryStock } from '../../inventory/services/inventoryInterface'
import { reportAppFailureToDeveloper } from '../../../services/telemetryService'
import { queueDelivery } from '../../../services/deliveryService'

const ordersRef = collection(db, COLLECTIONS.ORDERS)
const ORDER_TRACKING_COLLECTION = 'order_tracking'

/**
 * Calcula un hash SHA-256 del celular del cliente para indexar pedidos
 * de forma privada y sin almacenar el celular en texto plano.
 * @param {string} celular
 */
export async function hashCelular(celular) {
  const clean = (celular || '').replace(/\D/g, '')
  if (!clean) return 'unknown'
  try {
    const msgBuffer = new TextEncoder().encode(clean)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch (error) {
    // Fallback simple si crypto no está disponible
    let hash = 0
    for (let i = 0; i < clean.length; i++) {
      hash = (hash << 5) - hash + clean.charCodeAt(i)
      hash |= 0
    }
    return 'h_' + Math.abs(hash)
  }
}

/**
 * Construye el documento público de seguimiento a partir de un pedido.
 * NO incluye datos sensibles: sin celular, sin datos bancarios.
 * @param {string} trackingToken
 * @param {string} orderNumber
 * @param {string} estado
 * @param {object} orderData - Datos completos del pedido
 */
function buildTrackingDoc(trackingToken, orderNumber, estado, orderData) {
  const items = (orderData.items || orderData.productos || []).map(item => ({
    nombre: item.nombre || '',
    cantidad: item.cantidad || 1,
    precio: item.precio || 0,
    imagen: item.imagen || item.imageUrl || null,
    atributos: item.atributos || null,
    talla: item.talla || null,
    color: item.color || null,
  }))

  return {
    trackingToken,
    orderNumber,
    estado,
    tipoEntrega: orderData.tipoEntrega || 'retiro',
    metodoPago: orderData.metodoPago || '',
    total: orderData.total || 0,
    subtotal: orderData.subtotal ?? ((orderData.total || 0) - (orderData.costoEnvio || 0)),
    costoEnvio: orderData.costoEnvio || 0,
    descuento: orderData.descuento || 0,
    notas: orderData.notas || null,
    items,
    // Datos de destinatario: nombre y dirección para domicilio (sin teléfono)
    clienteNombre: orderData.cliente?.nombre || '',
    clienteDireccion: orderData.cliente?.direccion || null,
    clienteBarrio: orderData.cliente?.barrio || null,
    clienteCiudad: orderData.cliente?.ciudad || null,
  }
}

/**
 * Sincroniza el estado de order_tracking cuando cambia el estado de un pedido.
 * Operación best-effort (no bloquea el flujo principal si falla).
 * @param {string} trackingToken
 * @param {string} newStatus
 */
async function syncTrackingStatus(trackingToken, newStatus) {
  if (!trackingToken) return
  try {
    const trackingRef = doc(db, ORDER_TRACKING_COLLECTION, trackingToken)
    await updateDoc(trackingRef, {
      estado: newStatus,
      updatedAt: serverTimestamp(),
    })
  } catch (err) {
    // Non-critical: el doc de tracking puede no existir en pedidos legacy
    console.warn('[orderService] No se pudo sincronizar order_tracking:', err.message)
  }
}

/**
 * Envoltura para forzar un límite de tiempo de espera (timeout) en promesas de Firestore.
 */
function withTimeout(promise, timeoutMs = 15000, errorMsg = 'La operación ha superado el tiempo de espera de red (Timeout).') {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(errorMsg));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

/**
 * Genera un token hash único y seguro SHA-256 basado en ID del pedido y celular.
 */
async function generateTrackingToken(orderId, celular) {
  const cleanCelular = (celular || '').replace(/\D/g, '')
  const data = `${orderId}_${cleanCelular}`
  try {
    const msgBuffer = new TextEncoder().encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch (error) {
    console.error('Crypto error, fallback used:', error)
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i)
      hash |= 0
    }
    return 'fallback_' + Math.abs(hash) + '_' + Date.now()
  }
}

/**
 * Crea un nuevo pedido desde el cliente.
 * Descuenta el stock INMEDIATAMENTE de forma atómica (reserva temporal).
 * Si no hay stock suficiente lanza un error con el detalle del producto.
 * El pedido se guarda con stockDescontado: true para evitar doble descuento al completar.
 */
export async function createOrder(orderData) {
  const orderNumber = `OR-${Math.floor(10000000 + Math.random() * 90000000)}`
  const orderIdRef = doc(collection(db, COLLECTIONS.ORDERS))

  const trackingToken = await generateTrackingToken(orderIdRef.id, orderData.cliente?.celular)
  const hashedCelular = await hashCelular(orderData.cliente?.celular)

  await withTimeout(runTransaction(db, async (transaction) => {
    const items = orderData.items || []

    // 1. Descontar stock a través de la interfaz del contrato de inventario (DDD boundaries)
    const inventoryItems = items
      .filter(item => item.productId && !item.productId.startsWith('custom-'))
      .map(item => ({
        productId: item.productId,
        varianteId: item.variantId,
        cantidad: item.cantidad,
        nombre: item.nombre
      }))

    await deductInventoryStock(inventoryItems, transaction)

    // 4. Crear el pedido con flag de stock ya descontado
    transaction.set(orderIdRef, {
      ...orderData,
      orderNumber,
      estado: ORDER_STATES.PENDING,
      stockDescontado: true,
      trackingToken,
      archivado: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // 5. Crear documento público de seguimiento (sin PII sensible)
    const trackingRef = doc(db, ORDER_TRACKING_COLLECTION, trackingToken)
    const trackingDoc = buildTrackingDoc(trackingToken, orderNumber, ORDER_STATES.PENDING, orderData)
    transaction.set(trackingRef, {
      ...trackingDoc,
      orderId: orderIdRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // 6. Crear documento de índice del cliente (solo referencia/token y metadatos mínimos)
    if (hashedCelular && hashedCelular !== 'unknown') {
      const userIndexRef = doc(db, 'user_order_index', hashedCelular, 'orders', trackingToken)
      transaction.set(userIndexRef, {
        trackingToken,
        orderId: orderIdRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  }), 15000, 'El servidor de pedidos está tardando demasiado en responder. Por favor, verifica tu conexión a Internet e inténtalo de nuevo.')

  // 5. Emitir Notificación Central de Pedido Recibido para el Administrador y Vendedor
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
      orderId: orderIdRef.id,
      orderNumber
    })

    await createCentralNotification({
      recipientId: 'vendedor',
      recipientRole: 'vendedor',
      title: 'Nuevo Pedido PWA Recibido',
      body: `Pedido ${typeLabel} de ${orderData.cliente?.nombre || 'Cliente'} (${orderData.cliente?.celular || ''}) por valor de $${orderData.total || 0}.`,
      type: NC_TYPES.PEDIDO_RECIBIDO,
      orderId: orderIdRef.id,
      orderNumber
    })
  } catch (err) {
    console.error('[orderService] Error al notificar creación de pedido:', err)
  }

  // 6. Encolar en deliveries — TODOS los pedidos tipo domicilio, sin condiciones
  try {
    if (orderData.tipoEntrega === 'domicilio') {
      await queueDelivery({
        orderId: orderIdRef.id,
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

  return { id: orderIdRef.id, trackingToken }
}

/**
 * Obtiene todos los pedidos activos (no archivados) para el Administrador
 */
export async function getOrders() {
  const q = query(ordersRef, where('archivado', '==', false), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Se suscribe a los pedidos activos (no archivados) en tiempo real
 */
export function subscribeToOrders(callback) {
  const q = query(ordersRef, where('archivado', '==', false), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(list)
  }, (error) => {
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
    let q = query(ordersRef, where('archivado', '==', true))

    if (filterDate) {
      // filterDate viene en formato YYYY-MM-DD
      const start = new Date(filterDate + 'T00:00:00')
      const end = new Date(filterDate + 'T23:59:59')
      q = query(q, where('createdAt', '>=', start), where('createdAt', '<=', end))
    }

    q = query(q, orderBy('createdAt', 'desc'))

    if (lastVisibleDoc) {
      q = query(q, startAfter(lastVisibleDoc))
    }

    q = query(q, limit(pageSize))

    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
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
  const userOrdersRef = collection(db, 'user_order_index', hashedCelular, 'orders')
  const indexSnap = await getDocs(userOrdersRef)
  const tokens = indexSnap.docs.map(doc => doc.id)

  if (tokens.length === 0) return []

  const promises = tokens.map(async (token) => {
    try {
      const trackingRef = doc(db, 'order_tracking', token)
      const trackingSnap = await getDoc(trackingRef)
      if (trackingSnap.exists()) {
        const trackingData = trackingSnap.data()
        return { id: trackingData.orderId || trackingSnap.id, ...trackingData }
      }
      // Fallback legacy orders
      const q = query(ordersRef, where('trackingToken', '==', token), limit(1))
      const legacySnap = await getDocs(q)
      if (!legacySnap.empty) {
        return { id: legacySnap.docs[0].id, ...legacySnap.docs[0].data() }
      }
    } catch (err) {
      console.warn('[orderService] Error al obtener pedido del cliente por token:', token, err.message)
    }
    return null
  })

  const results = await Promise.all(promises)
  const list = results.filter(Boolean)
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
  let unsubscribeIndex = () => {}
  let activeUnsubscribes = {}

  hashCelular(celular).then(hashedCelular => {
    if (hashedCelular === 'unknown') {
      callback([])
      return
    }

    const userOrdersRef = collection(db, 'user_order_index', hashedCelular, 'orders')
    unsubscribeIndex = onSnapshot(userOrdersRef, (indexSnap) => {
      const tokens = indexSnap.docs.map(doc => doc.id)

      // Limpiar listeners obsoletos
      Object.keys(activeUnsubscribes).forEach(token => {
        if (!tokens.includes(token)) {
          activeUnsubscribes[token]()
          delete activeUnsubscribes[token]
        }
      })

      if (tokens.length === 0) {
        callback([])
        return
      }

      const trackingData = {}
      let emitsCount = 0

      const checkAndTrigger = () => {
        const list = Object.values(trackingData)
        const sorted = list.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() || 0
          const tB = b.createdAt?.toMillis?.() || 0
          return tB - tA
        })
        callback(sorted)
      }

      tokens.forEach(token => {
        if (!activeUnsubscribes[token]) {
          const trackingRef = doc(db, 'order_tracking', token)
          activeUnsubscribes[token] = onSnapshot(trackingRef, async (trackingSnap) => {
            if (trackingSnap.exists()) {
              const trackingDataVal = trackingSnap.data()
              trackingData[token] = { id: trackingDataVal.orderId || trackingSnap.id, ...trackingDataVal }
              checkAndTrigger()
            } else {
              // Fallback legacy orders
              try {
                const q = query(ordersRef, where('trackingToken', '==', token), limit(1))
                const legacySnap = await getDocs(q)
                if (!legacySnap.empty) {
                  trackingData[token] = { id: legacySnap.docs[0].id, ...legacySnap.docs[0].data() }
                } else {
                  delete trackingData[token]
                }
              } catch (err) {
                console.warn('[orderService] Fallback legacy tracking falló:', err.message)
                delete trackingData[token]
              }
              checkAndTrigger()
            }
          }, (err) => {
            console.error(`[orderService] Error al suscribirse a tracking doc ${token}:`, err)
          })
        }
      })
    }, (error) => {
      console.error('[orderService] Error al escuchar índice de pedidos del cliente:', error)
      callback([])
    })
  }).catch(err => {
    console.error('[orderService] Error al obtener hash en subscribeToClientOrders:', err)
    callback([])
  })

  return () => {
    unsubscribeIndex()
    Object.values(activeUnsubscribes).forEach(unsub => unsub())
  }
}

/**
 * Se suscribe a los pedidos registrados por un vendedor específico en tiempo real
 */
export function subscribeToVendedorOrders(vendedorId, callback) {
  const q = query(ordersRef, where('vendedorId', '==', vendedorId))
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
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
  const promises = orders.map(o => {
    const docRef = doc(db, COLLECTIONS.ORDERS, o.id)
    const trackingRef = doc(db, ORDER_TRACKING_COLLECTION, o.trackingToken)
    
    return Promise.all([
      updateDoc(docRef, {
        ocultoCliente: true,
        updatedAt: serverTimestamp()
      }),
      updateDoc(trackingRef, {
        ocultoCliente: true,
        updatedAt: serverTimestamp()
      }).catch(err => {
        // Non-critical
        console.warn('[orderService] No se pudo ocultar order_tracking:', err.message)
      })
    ])
  })
  await Promise.all(promises)
}

/**
 * Archiva los pedidos completados o cancelados del administrador
 */
export async function archiveOrders(orders) {
  const promises = orders.map(o => {
    const docRef = doc(db, COLLECTIONS.ORDERS, o.id)
    return updateDoc(docRef, {
      archivado: true,
      updatedAt: serverTimestamp()
    })
  })
  await Promise.all(promises)
}

/**
 * Actualiza el estado de un pedido.
 * REGLA CRÍTICA: Si pasa a COMPLETADO, descuenta el stock de las variantes si no estaba descontado.
 * Si pasa a CRÉDITO_APROBADO, descuenta el stock Y genera el documento de deuda en 'credits'.
 */
export async function updateOrderStatus(orderId, newStatus, currentOrder) {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId)
  const stockYaDescontado = currentOrder?.stockDescontado === true

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

  // ─── CANCELAR ─────────────────────────────────────────────────────────────
  if (newStatus === ORDER_STATES.CANCELLED) {
    if (stockYaDescontado) {
      const items = currentOrder?.items || []
      await withTimeout(runTransaction(db, async (transaction) => {
        const productsCache = {}
        for (const item of items) {
          if (item.productId?.startsWith('custom-')) continue
          if (!productsCache[item.productId]) {
            const pRef = doc(db, COLLECTIONS.PRODUCTS, item.productId)
            const pDoc = await transaction.get(pRef)
            if (pDoc.exists()) {
              productsCache[item.productId] = { ref: pRef, data: pDoc.data() }
            }
          }
        }

        const updatedProducts = {}
        for (const item of items) {
          if (item.productId?.startsWith('custom-')) continue
          const productInfo = updatedProducts[item.productId] || productsCache[item.productId]
          if (!productInfo) continue

          const variantes = [...productInfo.data.variantes]
          const variantIndex = variantes.findIndex(v => v.id === item.variantId)

          if (variantIndex !== -1) {
            if (productInfo.data.stockInfinito === true) {
              updatedProducts[item.productId] = {
                ...productInfo,
                data: { ...productInfo.data }
              }
              continue
            }
            variantes[variantIndex].stock = variantes[variantIndex].stock + item.cantidad
            updatedProducts[item.productId] = {
              ...productInfo,
              data: { ...productInfo.data, variantes }
            }
          }
        }

        Object.values(updatedProducts).forEach(productInfo => {
          transaction.update(productInfo.ref, {
            variantes: productInfo.data.variantes,
            updatedAt: serverTimestamp()
          })
        })

        transaction.update(orderRef, {
          estado: newStatus,
          stockDescontado: false,
          updatedAt: serverTimestamp()
        })
      }), 15000, 'Error: No se pudo conectar con el servidor para cancelar el pedido. Inténtalo de nuevo.')
    } else {
      await updateDoc(orderRef, {
        estado: newStatus,
        updatedAt: serverTimestamp()
      })
    }
    await syncTrackingStatus(currentOrder?.trackingToken, newStatus)
    await notifyClient()
    return
  }

  // ─── CRÉDITO APROBADO ──────────────────────────────────────────────────────
  if (newStatus === ORDER_STATES.CREDIT_APPROVED) {
    const creditIdRef = doc(db, COLLECTIONS.CREDITS, `credit_${orderId}`)

    await withTimeout(runTransaction(db, async (transaction) => {
      if (!stockYaDescontado) {
        const items = currentOrder?.items || []
        const productsCache = {}
        for (const item of items) {
          if (item.productId?.startsWith('custom-')) continue
          if (!productsCache[item.productId]) {
            const pRef = doc(db, COLLECTIONS.PRODUCTS, item.productId)
            const pDoc = await transaction.get(pRef)
            if (pDoc.exists()) {
              productsCache[item.productId] = { ref: pRef, data: pDoc.data() }
            }
          }
        }

        const updatedProducts = {}
        for (const item of items) {
          if (item.productId?.startsWith('custom-')) continue
          const productInfo = updatedProducts[item.productId] || productsCache[item.productId]
          if (!productInfo) continue

          const variantes = [...productInfo.data.variantes]
          const variantIndex = variantes.findIndex(v => v.id === item.variantId)

          if (variantIndex !== -1) {
            if (productInfo.data.stockInfinito === true) {
              updatedProducts[item.productId] = {
                ...productInfo,
                data: { ...productInfo.data }
              }
              continue
            }
            const stockActual = variantes[variantIndex].stock
            if (stockActual < item.cantidad) {
              throw new Error(`Stock insuficiente para variante de ${item.nombre}`)
            }
            variantes[variantIndex].stock = stockActual - item.cantidad
            updatedProducts[item.productId] = {
              ...productInfo,
              data: { ...productInfo.data, variantes }
            }
          }
        }

        Object.values(updatedProducts).forEach(productInfo => {
          transaction.update(productInfo.ref, {
            variantes: productInfo.data.variantes,
            updatedAt: serverTimestamp()
          })
        })
      }

      // Actualizar estado del pedido
      transaction.update(orderRef, {
        estado: newStatus,
        stockDescontado: true,
        updatedAt: serverTimestamp()
      })

      // Crear el crédito atómicamente
      transaction.set(creditIdRef, {
        orderId,
        orderNumber: currentOrder.orderNumber || '—',
        cliente: currentOrder.cliente,
        clienteNombre: currentOrder.cliente?.nombre || '',
        clienteCelular: currentOrder.cliente?.celular || '',
        total: currentOrder.total,
        montoTotal: currentOrder.total,
        saldoPendiente: currentOrder.total,
        abonos: [],
        estado: 'activo',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }), 15000, 'Error: No se pudo conectar con el servidor para procesar la aprobación de crédito. Inténtalo de nuevo.')

    await syncTrackingStatus(currentOrder?.trackingToken, newStatus)
    await notifyClient()
    return
  }

  // ─── OTROS ESTADOS (PENDING, PREPARING, DELIVERING, COMPLETED, READY) ───────
  await updateDoc(orderRef, {
    estado: newStatus,
    updatedAt: serverTimestamp()
  })

  // Sincronizar estado en colección pública de tracking
  await syncTrackingStatus(currentOrder?.trackingToken, newStatus)

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
 * @param {string} orderId - ID del pedido
 * @param {number} newCost - Nuevo costo de envío
 * @param {number} currentTotal - Total actual del pedido (para calcular la diferencia)
 * @param {number} currentDeliveryCost - Costo de envío actual (para calcular la diferencia)
 */
export async function updateOrderDeliveryCost(orderId, newCost, currentTotal, currentDeliveryCost) {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId)
  const diff = newCost - (currentDeliveryCost || 0)
  
  // 1. Actualizar el pedido en la colección orders
  const newTotal = Math.max(0, (currentTotal || 0) + diff)
  await updateDoc(orderRef, {
    costoEnvio: newCost,
    total: newTotal,
    updatedAt: serverTimestamp()
  })

  // 2. Buscar si existe un crédito asociado para este pedido y actualizarlo
  try {
    const creditsRef = collection(db, 'credits')
    const q = query(creditsRef, where('orderId', '==', orderId))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const creditDoc = querySnapshot.docs[0]
      const creditData = creditDoc.data()
      const newCreditTotal = Math.max(0, (creditData.total || 0) + diff)
      const newSaldo = Math.max(0, (creditData.saldoPendiente || 0) + diff)
      
      await updateDoc(doc(db, 'credits', creditDoc.id), {
        total: newCreditTotal,
        montoTotal: newCreditTotal,
        saldoPendiente: newSaldo,
        updatedAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('[orderService] Error al sincronizar el costo de envío con el crédito:', error)
  }
}

/**
 * Se suscribe al documento público de seguimiento de un pedido en tiempo real.
 * Lee desde `order_tracking/{token}` — sin PII, acceso público.
 * Fallback a `orders/` por compatibilidad con pedidos legacy sin documento de tracking.
 * @param {string} token - Token de seguimiento del pedido
 * @param {function} onUpdate - Callback con el pedido actualizado
 * @param {function} onError - Callback de error
 * @returns {function} Función para cancelar la suscripción
 */
export function subscribeToOrderByToken(token, onUpdate, onError) {
  const trackingRef = doc(db, ORDER_TRACKING_COLLECTION, token)

  return onSnapshot(trackingRef, async (snap) => {
    if (snap.exists()) {
      // Caso normal: documento de tracking público existe
      const trackingData = snap.data()
      onUpdate({ id: trackingData.orderId || snap.id, ...trackingData })
    } else {
      // Fallback legacy: buscar en orders/ para pedidos anteriores a la migración
      try {
        const q = query(ordersRef, where('trackingToken', '==', token), limit(1))
        const legacySnap = await getDocs(q)
        if (legacySnap.empty) {
          onUpdate(null)
        } else {
          const orderDoc = legacySnap.docs[0]
          onUpdate({ id: orderDoc.id, ...orderDoc.data() })
        }
      } catch (fallbackErr) {
        console.warn('[orderService] Fallback legacy tracking falló:', fallbackErr.message)
        onUpdate(null)
      }
    }
  }, onError)
}

/**
 * Migra pedidos existentes que no tienen documento en `order_tracking`.
 * Ejecutar desde el panel de administración una sola vez después del despliegue.
 * Procesa en lotes de 400 para respetar los límites de Firestore (500/batch).
 * @returns {Promise<{migrated: number, skipped: number, errors: number}>}
 */
export async function migrateOrdersToTracking() {
  const allOrdersSnap = await getDocs(query(ordersRef, orderBy('createdAt', 'desc')))
  const orders = allOrdersSnap.docs

  let migrated = 0
  let skipped = 0
  let errors = 0
  const BATCH_SIZE = 400

  for (let i = 0; i < orders.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    const chunk = orders.slice(i, i + BATCH_SIZE)

    for (const orderDoc of chunk) {
      const data = orderDoc.data()
      const token = data.trackingToken

      if (!token) {
        skipped++
        continue
      }

      try {
        const trackingRef = doc(db, ORDER_TRACKING_COLLECTION, token)
        const existingTracking = await getDoc(trackingRef)

        if (!existingTracking.exists()) {
          const trackingDoc = buildTrackingDoc(token, data.orderNumber || '', data.estado || 'pendiente', data)
          batch.set(trackingRef, {
            ...trackingDoc,
            orderId: orderDoc.id,
            createdAt: data.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp(),
          })

          const hashedCelular = await hashCelular(data.cliente?.celular)
          if (hashedCelular && hashedCelular !== 'unknown') {
            const userIndexRef = doc(db, 'user_order_index', hashedCelular, 'orders', token)
            batch.set(userIndexRef, {
              trackingToken: token,
              orderId: orderDoc.id,
              createdAt: data.createdAt || serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
          }
          migrated++
        } else {
          skipped++
        }
      } catch (err) {
        console.error(`[migrateOrdersToTracking] Error en pedido ${orderDoc.id}:`, err.message)
        errors++
      }
    }

    await batch.commit()
  }

  console.log(`[migrateOrdersToTracking] Completado — Migrados: ${migrated}, Omitidos: ${skipped}, Errores: ${errors}`)
  return { migrated, skipped, errors }
}



// Exportado exclusivamente para pruebas de unidad
export { buildTrackingDoc }
