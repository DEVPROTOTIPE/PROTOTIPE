import { db } from '../config/firebaseConfig'; // Ajustar ruta de importación del core
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

export const HelloModuleRepository = {
  /**
   * Agrega un nuevo registro en Firestore.
   * @param {string} tenantId 
   * @param {Object} data 
   * @returns {Promise<string>} ID del documento creado
   */
  async create(tenantId, data) {
    const collRef = collection(db, 'tenants', tenantId, 'hello-module');
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
    const collRef = collection(db, 'tenants', tenantId, 'hello-module');
    const q = query(collRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};
