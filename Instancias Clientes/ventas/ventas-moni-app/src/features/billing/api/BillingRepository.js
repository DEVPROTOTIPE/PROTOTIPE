import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore'
import { db } from '../../../config/firebaseConfig'
import { COLLECTIONS, ORDER_STATES } from '../../../constants'

function ordersCollection() {
  return collection(db, COLLECTIONS.ORDERS)
}

function settingsDocRef() {
  return doc(db, 'config', 'settings')
}

export class BillingRepository {
  /**
   * Suscribe en tiempo real a los pedidos completados de los últimos 6 meses
   * y a la configuración de facturación (documento `config/settings`).
   * Cada vez que cualquiera de los dos listeners emite, invoca `onData` con
   * el estado combinado más reciente (`{ orders, settingsData }`), tal como
   * hacía el código original — el Repository solo ejecuta la mecánica de
   * Firestore; `settingsData` se entrega tal cual sale de `doc.data()` (sin
   * transformar nombres de campo), y es el Service quien decide cómo
   * mapearlo/completar valores por defecto (ver `calcMetrics` y
   * `subscribeToBillingData` en `billingService.js`).
   *
   * @param {(state: { orders: object[], settingsData: object|undefined }) => void} onData
   * @param {{ onOrdersError?: Function, onSettingsError?: Function }} [errorHandlers]
   * @returns {Function} Función de cancelación de ambas suscripciones.
   */
  static subscribeToBillingData(onData, { onOrdersError, onSettingsError } = {}) {
    let latestOrders = []
    let latestSettingsData

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const qOrders = query(
      ordersCollection(),
      where('estado', '==', ORDER_STATES.COMPLETED),
      where('createdAt', '>=', sixMonthsAgo),
      orderBy('createdAt', 'desc')
    )

    const unsubOrders = onSnapshot(qOrders, (snap) => {
      latestOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      onData({ orders: latestOrders, settingsData: latestSettingsData })
    }, (error) => {
      if (onOrdersError) onOrdersError(error)
    })

    const unsubSettings = onSnapshot(settingsDocRef(), (snap) => {
      if (snap.exists()) {
        latestSettingsData = snap.data()
        onData({ orders: latestOrders, settingsData: latestSettingsData })
      }
    }, (error) => {
      if (onSettingsError) onSettingsError(error)
    })

    return () => {
      unsubOrders()
      unsubSettings()
    }
  }
}
