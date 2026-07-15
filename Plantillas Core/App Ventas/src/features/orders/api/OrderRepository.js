import {
  collection,
  doc,
  getDocs,
  updateDoc,
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
import { COLLECTIONS, ORDER_STATES } from '../../../constants'
import { deductInventoryStock } from '../../inventory/services/inventoryInterface'

const ORDER_TRACKING_COLLECTION = 'order_tracking'

function ordersCollection() {
  return collection(db, COLLECTIONS.ORDERS)
}

/**
 * Calcula un hash SHA-256 del celular del cliente para indexar pedidos
 * de forma privada y sin almacenar el celular en texto plano.
 * No toca Firebase — utilidad pura colocada aquí porque la usan los métodos
 * transaccionales de este Repository; el Service la reexporta.
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
 * NO incluye datos sensibles: sin celular, sin datos bancarios. Utilidad
 * pura; el Service la reexporta (usada también en pruebas).
 */
export function buildTrackingDoc(trackingToken, orderNumber, estado, orderData) {
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
    clienteNombre: orderData.cliente?.nombre || '',
    clienteDireccion: orderData.cliente?.direccion || null,
    clienteBarrio: orderData.cliente?.barrio || null,
    clienteCiudad: orderData.cliente?.ciudad || null,
  }
}

/**
 * Genera un token hash único y seguro SHA-256 basado en ID del pedido y celular.
 * No toca Firebase — utilidad pura.
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
 * Envoltura para forzar un límite de tiempo de espera (timeout) en promesas
 * de Firestore. No toca Firebase directamente; colocada aquí porque solo la
 * usan las transacciones de este Repository.
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
 * Sincroniza el estado de order_tracking cuando cambia el estado de un pedido.
 * Operación best-effort (no bloquea el flujo principal si falla).
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
    console.warn('[OrderRepository] No se pudo sincronizar order_tracking:', err.message)
  }
}

export class OrderRepository {
  /**
   * Crea un nuevo pedido de forma transaccional: descuenta stock (vía la
   * interfaz del contrato de inventario, DDD boundaries), crea el pedido,
   * el documento público de tracking y el índice del cliente. Devuelve
   * `{ id, trackingToken }`, igual que el `createOrder` original — el
   * cuerpo completo de la transacción se mueve tal cual desde el Service
   * (mecánica de Firestore + orquestación de inventario), sin cambiar su
   * comportamiento.
   */
  static async createOrderTransaction(orderData) {
    const orderNumber = `OR-${Math.floor(10000000 + Math.random() * 90000000)}`
    const orderIdRef = doc(collection(db, COLLECTIONS.ORDERS))

    const trackingToken = await generateTrackingToken(orderIdRef.id, orderData.cliente?.celular)
    const hashedCelular = await hashCelular(orderData.cliente?.celular)

    await withTimeout(runTransaction(db, async (transaction) => {
      const items = orderData.items || []

      const inventoryItems = items
        .filter(item => item.productId && !item.productId.startsWith('custom-'))
        .map(item => ({
          productId: item.productId,
          varianteId: item.variantId,
          cantidad: item.cantidad,
          nombre: item.nombre
        }))

      await deductInventoryStock(inventoryItems, transaction)

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

      const trackingRef = doc(db, ORDER_TRACKING_COLLECTION, trackingToken)
      const trackingDoc = buildTrackingDoc(trackingToken, orderNumber, ORDER_STATES.PENDING, orderData)
      transaction.set(trackingRef, {
        ...trackingDoc,
        orderId: orderIdRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

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

    return { id: orderIdRef.id, orderNumber, trackingToken }
  }

  static async getAll() {
    const q = query(ordersCollection(), where('archivado', '==', false), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  static subscribeToAll(onData, onError) {
    const q = query(ordersCollection(), where('archivado', '==', false), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      onData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, onError)
  }

  static async getArchived(filterDate = '', lastVisibleDoc = null, pageSize = 50) {
    let q = query(ordersCollection(), where('archivado', '==', true))

    if (filterDate) {
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
  }

  /**
   * Resuelve los pedidos de un cliente a partir del índice
   * `user_order_index/{hashedCelular}/orders`, con fallback a búsqueda
   * legacy por `trackingToken` en `orders/`.
   */
  static async getByClientPhoneHash(hashedCelular) {
    const userOrdersRef = collection(db, 'user_order_index', hashedCelular, 'orders')
    const indexSnap = await getDocs(userOrdersRef)
    const tokens = indexSnap.docs.map(doc => doc.id)

    if (tokens.length === 0) return []

    const promises = tokens.map(async (token) => {
      try {
        const trackingRef = doc(db, ORDER_TRACKING_COLLECTION, token)
        const trackingSnap = await getDoc(trackingRef)
        if (trackingSnap.exists()) {
          const trackingData = trackingSnap.data()
          return { id: trackingData.orderId || trackingSnap.id, ...trackingData }
        }
        const q = query(ordersCollection(), where('trackingToken', '==', token), limit(1))
        const legacySnap = await getDocs(q)
        if (!legacySnap.empty) {
          return { id: legacySnap.docs[0].id, ...legacySnap.docs[0].data() }
        }
      } catch (err) {
        console.warn('[OrderRepository] Error al obtener pedido del cliente por token:', token, err.message)
      }
      return null
    })

    const results = await Promise.all(promises)
    return results.filter(Boolean)
  }

  /**
   * Suscribe en tiempo real a los pedidos de un cliente vía el índice de
   * tokens, con listeners individuales por token de tracking (y fallback
   * legacy). Devuelve la función de cancelación de todos los listeners.
   */
  static subscribeToClientOrdersByPhoneHash(hashedCelular, onData, onError) {
    let unsubscribeIndex = () => {}
    let activeUnsubscribes = {}

    const userOrdersRef = collection(db, 'user_order_index', hashedCelular, 'orders')
    unsubscribeIndex = onSnapshot(userOrdersRef, (indexSnap) => {
      const tokens = indexSnap.docs.map(doc => doc.id)

      Object.keys(activeUnsubscribes).forEach(token => {
        if (!tokens.includes(token)) {
          activeUnsubscribes[token]()
          delete activeUnsubscribes[token]
        }
      })

      if (tokens.length === 0) {
        onData([])
        return
      }

      const trackingData = {}

      const checkAndTrigger = () => {
        onData(Object.values(trackingData))
      }

      tokens.forEach(token => {
        if (!activeUnsubscribes[token]) {
          const trackingRef = doc(db, ORDER_TRACKING_COLLECTION, token)
          activeUnsubscribes[token] = onSnapshot(trackingRef, async (trackingSnap) => {
            if (trackingSnap.exists()) {
              const trackingDataVal = trackingSnap.data()
              trackingData[token] = { id: trackingDataVal.orderId || trackingSnap.id, ...trackingDataVal }
              checkAndTrigger()
            } else {
              try {
                const q = query(ordersCollection(), where('trackingToken', '==', token), limit(1))
                const legacySnap = await getDocs(q)
                if (!legacySnap.empty) {
                  trackingData[token] = { id: legacySnap.docs[0].id, ...legacySnap.docs[0].data() }
                } else {
                  delete trackingData[token]
                }
              } catch (err) {
                console.warn('[OrderRepository] Fallback legacy tracking falló:', err.message)
                delete trackingData[token]
              }
              checkAndTrigger()
            }
          }, (err) => {
            console.error(`[OrderRepository] Error al suscribirse a tracking doc ${token}:`, err)
          })
        }
      })
    }, (error) => {
      if (onError) onError(error)
    })

    return () => {
      unsubscribeIndex()
      Object.values(activeUnsubscribes).forEach(unsub => unsub())
    }
  }

  static subscribeToVendedor(vendedorId, onData, onError) {
    const q = query(ordersCollection(), where('vendedorId', '==', vendedorId))
    return onSnapshot(q, (snap) => {
      onData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, onError)
  }

  static async clearClientOrderHistory(orders) {
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
          console.warn('[OrderRepository] No se pudo ocultar order_tracking:', err.message)
        })
      ])
    })
    await Promise.all(promises)
  }

  static async archiveOrders(orders) {
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
   * Ejecuta la transacción de cambio de estado de un pedido, incluyendo la
   * lógica de reversión/descuento de stock para CANCELLED/CREDIT_APPROVED.
   * Cuerpo movido tal cual desde el Service (mecánica de Firestore +
   * decisiones de qué escribir, que dependían de leer productos dentro de
   * la misma transacción — no separable en un reducer puro sin rediseñar
   * la operación). `states` recibe los valores de `ORDER_STATES` que el
   * Service ya conoce, para no importarlos aquí de forma redundante.
   */
  static async updateOrderStatusTransaction(orderId, newStatus, currentOrder, states) {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId)
    const stockYaDescontado = currentOrder?.stockDescontado === true

    if (newStatus === states.CANCELLED) {
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
                updatedProducts[item.productId] = { ...productInfo, data: { ...productInfo.data } }
                continue
              }
              variantes[variantIndex].stock = variantes[variantIndex].stock + item.cantidad
              updatedProducts[item.productId] = { ...productInfo, data: { ...productInfo.data, variantes } }
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
      return
    }

    if (newStatus === states.CREDIT_APPROVED) {
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
                updatedProducts[item.productId] = { ...productInfo, data: { ...productInfo.data } }
                continue
              }
              const stockActual = variantes[variantIndex].stock
              if (stockActual < item.cantidad) {
                throw new Error(`Stock insuficiente para variante de ${item.nombre}`)
              }
              variantes[variantIndex].stock = stockActual - item.cantidad
              updatedProducts[item.productId] = { ...productInfo, data: { ...productInfo.data, variantes } }
            }
          }

          Object.values(updatedProducts).forEach(productInfo => {
            transaction.update(productInfo.ref, {
              variantes: productInfo.data.variantes,
              updatedAt: serverTimestamp()
            })
          })
        }

        transaction.update(orderRef, {
          estado: newStatus,
          stockDescontado: true,
          updatedAt: serverTimestamp()
        })

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
      return
    }

    await updateDoc(orderRef, {
      estado: newStatus,
      updatedAt: serverTimestamp()
    })
    await syncTrackingStatus(currentOrder?.trackingToken, newStatus)
  }

  static async updateDeliveryCost(orderId, newCost, currentTotal, currentDeliveryCost) {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId)
    const diff = newCost - (currentDeliveryCost || 0)
    const newTotal = Math.max(0, (currentTotal || 0) + diff)

    await updateDoc(orderRef, {
      costoEnvio: newCost,
      total: newTotal,
      updatedAt: serverTimestamp()
    })

    let updatedCredit = null
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
        updatedCredit = { id: creditDoc.id, total: newCreditTotal, saldoPendiente: newSaldo }
      }
    } catch (error) {
      console.error('[OrderRepository] Error al sincronizar el costo de envío con el crédito:', error)
    }

    return { newTotal, updatedCredit }
  }

  static subscribeByTrackingToken(token, onData, onError) {
    const trackingRef = doc(db, ORDER_TRACKING_COLLECTION, token)

    return onSnapshot(trackingRef, async (snap) => {
      if (snap.exists()) {
        const trackingData = snap.data()
        onData({ id: trackingData.orderId || snap.id, ...trackingData })
      } else {
        try {
          const q = query(ordersCollection(), where('trackingToken', '==', token), limit(1))
          const legacySnap = await getDocs(q)
          if (legacySnap.empty) {
            onData(null)
          } else {
            const orderDoc = legacySnap.docs[0]
            onData({ id: orderDoc.id, ...orderDoc.data() })
          }
        } catch (fallbackErr) {
          console.warn('[OrderRepository] Fallback legacy tracking falló:', fallbackErr.message)
          onData(null)
        }
      }
    }, onError)
  }

  /**
   * Migra pedidos existentes que no tienen documento en `order_tracking`.
   * Procesa en lotes de 400 para respetar los límites de Firestore (500/batch).
   */
  static async migrateOrdersToTracking() {
    const allOrdersSnap = await getDocs(query(ordersCollection(), orderBy('createdAt', 'desc')))
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
}
