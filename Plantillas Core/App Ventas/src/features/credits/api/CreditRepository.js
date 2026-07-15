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

function creditsCollection() {
  return collection(db, COLLECTIONS.CREDITS)
}

export class CreditRepository {
  /**
   * Obtiene todos los créditos filtrados por estado.
   */
  static async getAll(estado = 'activo') {
    const q = query(creditsCollection(), where('estado', '==', estado))
    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  /**
   * Obtiene los créditos de un cliente por su número celular.
   */
  static async getByClientPhone(celular) {
    if (!celular) return []
    const q = query(creditsCollection(), where('cliente.celular', '==', celular))
    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  /**
   * Obtiene créditos paginados (cursor de Firestore, ver nota en Service).
   */
  static async getAllPaged(estado = 'activo', limitSize = 10, startAfterDoc = null) {
    const constraints = [
      where('estado', '==', estado),
      orderBy('createdAt', 'desc'),
      limit(limitSize + 1)
    ]
    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc))
    }
    const q = query(creditsCollection(), ...constraints)
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
   * Ejecuta una transacción atómica de abono sobre un crédito y,
   * condicionalmente, sobre el pedido asociado. El Repository posee la
   * mecánica de Firestore (lectura transaccional y escritura); el `reducer`
   * recibe el crédito actual como objeto plano y decide el nuevo estado, sin
   * conocer la API de transacciones del SDK. Recibe `serverTimestamp` como
   * ayudante inyectado para poder sellar `updatedAt` con hora de servidor
   * (comportamiento preservado del código original) sin que el Service
   * importe el SDK de Firebase.
   *
   * @param {string} creditId
   * @param {(currentCredit: object, helpers: { serverTimestamp: Function }) => { updatedCredit: object, orderUpdate: { orderId: string, data: object } | null }} reducer
   * @returns {Promise<object>} El crédito tal como estaba antes de aplicar el abono.
   */
  static async runPaymentTransaction(creditId, reducer) {
    const creditRef = doc(db, COLLECTIONS.CREDITS, creditId)

    return runTransaction(db, async (transaction) => {
      const creditDoc = await transaction.get(creditRef)
      if (!creditDoc.exists()) throw new Error('Crédito no encontrado')

      const currentCredit = creditDoc.data()
      const { updatedCredit, orderUpdate } = reducer(currentCredit, { serverTimestamp })

      transaction.update(creditRef, updatedCredit)

      if (orderUpdate) {
        const orderRef = doc(db, COLLECTIONS.ORDERS, orderUpdate.orderId)
        transaction.update(orderRef, orderUpdate.data)
      }

      return currentCredit
    })
  }

  /**
   * Suscribe en tiempo real a los créditos de un estado. Devuelve la función
   * de cancelación (`unsubscribe`).
   */
  static subscribeToAll(estado, onUpdate, onError) {
    const q = query(creditsCollection(), where('estado', '==', estado))
    return onSnapshot(q, (snap) => {
      onUpdate(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, onError)
  }

  /**
   * Suscribe en tiempo real a los créditos de un cliente. Devuelve la
   * función de cancelación (`unsubscribe`).
   */
  static subscribeToClientCredits(celular, onUpdate, onError) {
    const q = query(creditsCollection(), where('cliente.celular', '==', celular))
    return onSnapshot(q, (snap) => {
      onUpdate(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, onError)
  }
}
