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
  runTransaction
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
}
