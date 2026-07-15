import { db } from '../../../config/firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  runTransaction,
  onSnapshot
} from 'firebase/firestore';
import {
  LoyaltyAccountSchema,
  LoyaltyTransactionSchema,
  LoyaltyTokenSchema
} from '../schemas/CustomerLoyaltySchemas';

export class CustomerLoyaltyRepository {
  /**
   * Obtiene la cuenta de fidelidad de un cliente.
   */
  static async getAccount(tenantId, customerId) {
    const docRef = doc(db, `tenants/${tenantId}/loyaltyAccounts`, customerId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return docSnap.data();
  }

  /**
   * Crea una nueva cuenta de fidelidad para un cliente.
   */
  static async createAccount(tenantId, customerId) {
    const docRef = doc(db, `tenants/${tenantId}/loyaltyAccounts`, customerId);
    const now = new Date().toISOString();
    const accountData = {
      customerId,
      pointsBalance: 0,
      level: 'BRONZE',
      createdAt: now,
      updatedAt: now
    };
    
    // Validación por contrato
    LoyaltyAccountSchema.parse(accountData);
    
    await setDoc(docRef, accountData);
    return accountData;
  }

  /**
   * Consulta las transacciones de puntos de un cliente.
   */
  static async getTransactions(tenantId, customerId) {
    const colRef = collection(db, `tenants/${tenantId}/loyaltyTransactions`);
    const q = query(
      colRef, 
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ transactionId: doc.id, ...doc.data() }));
  }

  /**
   * Registra un token de QR en la base de datos.
   */
  static async saveToken(tenantId, tokenData) {
    LoyaltyTokenSchema.parse(tokenData);
    const docRef = doc(db, `tenants/${tenantId}/loyaltyTokens`, tokenData.tokenId);
    await setDoc(docRef, tokenData);
  }

  /**
   * Lee un token de QR para validar su existencia y vigencia.
   */
  static async getToken(tenantId, tokenId) {
    const docRef = doc(db, `tenants/${tenantId}/loyaltyTokens`, tokenId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data();
  }

  /**
   * Invalida (borra) un token de QR usado o expirado.
   */
  static async deleteToken(tenantId, tokenId) {
    const docRef = doc(db, `tenants/${tenantId}/loyaltyTokens`, tokenId);
    await updateDoc(docRef, { expiresAt: new Date(0).toISOString() }); // O borrar del todo
  }

  /**
   * Ejecuta una transacción atómica sobre la cuenta y el historial de puntos.
   * El Repository posee la mecánica de Firestore (lectura transaccional,
   * validación de esquema y escritura); el `reducer` recibe la cuenta actual
   * en forma de objeto plano (o `null` si no existe) y decide el nuevo estado
   * del dominio, sin conocer la API de transacciones de Firebase.
   *
   * @param {string} tenantId
   * @param {string} customerId
   * @param {(currentAccount: object|null) => { updatedAccount: object, newTx: object }} reducer
   * @returns {Promise<object>} La cuenta actualizada.
   */
  static async runAccountTransaction(tenantId, customerId, reducer) {
    const accountRef = doc(db, `tenants/${tenantId}/loyaltyAccounts`, customerId);
    const transactionRef = doc(
      db,
      `tenants/${tenantId}/loyaltyTransactions`,
      `txn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    );

    return runTransaction(db, async (transaction) => {
      const accountDoc = await transaction.get(accountRef);
      const currentAccount = accountDoc.exists() ? accountDoc.data() : null;

      const { updatedAccount, newTx } = reducer(currentAccount);

      LoyaltyAccountSchema.parse(updatedAccount);
      LoyaltyTransactionSchema.parse(newTx);

      transaction.set(accountRef, updatedAccount);
      transaction.set(transactionRef, newTx);

      return updatedAccount;
    });
  }

  /**
   * Suscribe en tiempo real a la cuenta de fidelización de un cliente.
   * Devuelve la función de cancelación (`unsubscribe`).
   */
  static subscribeToAccount(tenantId, customerId, onData, onError) {
    const accountRef = doc(db, `tenants/${tenantId}/loyaltyAccounts`, customerId);
    return onSnapshot(
      accountRef,
      (docSnap) => onData(docSnap.exists() ? docSnap.data() : null),
      onError
    );
  }

  /**
   * Suscribe en tiempo real al historial de transacciones de puntos de un cliente.
   * Devuelve la función de cancelación (`unsubscribe`).
   */
  static subscribeToTransactions(tenantId, customerId, onData, onError) {
    const transactionsCol = collection(db, `tenants/${tenantId}/loyaltyTransactions`);
    const q = query(
      transactionsCol,
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(
      q,
      (snap) => onData(snap.docs.map((docSnap) => ({ transactionId: docSnap.id, ...docSnap.data() }))),
      onError
    );
  }

  /**
   * Intenta leer la configuración de fidelización persistida del tenant.
   *
   * DEUDA TÉCNICA PRE-EXISTENTE (ver ADR-0001 §20 y bitácora CORE-344): esta
   * lectura nunca se completa porque `docRef.firestore._getDoc` no es una API
   * real del SDK de Firestore. Se preserva sin modificar para no ampliar el
   * alcance del piloto de CORE-344; el Service ignora el resultado y usa su
   * configuración por defecto.
   */
  static async getConfigDoc(tenantId) {
    const docRef = doc(db, `tenants/${tenantId}/loyaltyConfig`, 'settings');
    try {
      return docRef.firestore._getDoc ? await docRef.firestore._getDoc(docRef) : null;
    } catch {
      return null;
    }
  }
}
