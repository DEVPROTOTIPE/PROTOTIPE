import { db } from '@/config/firebaseConfig'; // Ajustar ruta de importación del core
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
// Si activas los ejemplos de transacción/listener de abajo, añade también:
// doc, runTransaction, onSnapshot

export const {{pascalName}}Repository = {
  /**
   * Agrega un nuevo registro en Firestore.
   * @param {string} tenantId
   * @param {Object} data
   * @returns {Promise<string>} ID del documento creado
   */
  async create(tenantId, data) {
    const collRef = collection(db, 'tenants', tenantId, '{{featureId}}');
    const docRef = await addDoc(collRef, {
      ...data,
      tenantId,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  },

  /**
   * Recupera todos los registros ordenados por creación.
   * @param {string} tenantId
   * @returns {Promise<Object[]>}
   */
  async getAll(tenantId) {
    const collRef = collection(db, 'tenants', tenantId, '{{featureId}}');
    const q = query(collRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // ─── EJEMPLO (ADR-0001 §14): transacción atómica con reducer puro ──────
  // Descomenta y adapta si esta feature necesita actualizar un documento de
  // forma atómica (saldos, contadores, cambios de estado — "documentos
  // calientes"). El Repository posee la mecánica de Firestore; el `reducer`
  // recibe el estado actual como objeto plano (o `null` si no existe) y
  // decide el nuevo estado, sin conocer la API de transacciones del SDK.
  // El Service (no el Repository) es quien pone las reglas de negocio dentro
  // del reducer que le pasa. Patrón real:
  // features/customer-loyalty/api/CustomerLoyaltyRepository.js → runAccountTransaction.
  //
  // async runRecordTransaction(tenantId, recordId, reducer) {
  //   const recordRef = doc(db, 'tenants', tenantId, '{{featureId}}', recordId);
  //   return runTransaction(db, async (transaction) => {
  //     const snap = await transaction.get(recordRef);
  //     const current = snap.exists() ? snap.data() : null;
  //     const updated = reducer(current);
  //     transaction.set(recordRef, updated);
  //     return updated;
  //   });
  // },

  // ─── EJEMPLO (ADR-0001 §13): suscripción en tiempo real con cancelación ─
  // Descomenta y adapta si esta feature necesita datos en vivo. Devuelve la
  // función de cancelación (`unsubscribe`); el Hook la consume directamente
  // desde el Repository — nunca construye la referencia/query él mismo.
  // Nota: `RealtimeQueryRegistry` (registro compartido anti-duplicados) está
  // `DEFERRED_UNTIL_MEASURED_NEED` (ver AGENTS.md §22.2) — no lo esperes aquí
  // todavía. Patrón real:
  // features/customer-loyalty/api/CustomerLoyaltyRepository.js → subscribeToAccount.
  //
  // subscribeToRecord(tenantId, recordId, onData, onError) {
  //   const recordRef = doc(db, 'tenants', tenantId, '{{featureId}}', recordId);
  //   return onSnapshot(
  //     recordRef,
  //     (snap) => onData(snap.exists() ? snap.data() : null),
  //     onError
  //   );
  // },
};
