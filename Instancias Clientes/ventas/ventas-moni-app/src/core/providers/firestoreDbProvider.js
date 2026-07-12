import { doc, getDoc, setDoc, updateDoc, deleteDoc, runTransaction } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

export const firestoreDbProvider = {
  /**
   * Obtiene un documento de una colección Firestore.
   */
  async get(featureId, collection, id) {
    const docRef = doc(db, collection, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  /**
   * Guarda o sobrescribe un documento en Firestore.
   */
  async save(featureId, collection, id, data) {
    const docRef = doc(db, collection, id);
    await setDoc(docRef, data, { merge: true });
    return { id, ...data };
  },

  /**
   * Modifica campos específicos de un documento en Firestore.
   */
  async update(featureId, collection, id, data) {
    const docRef = doc(db, collection, id);
    await updateDoc(docRef, data);
    return { id, ...data };
  },

  /**
   * Elimina un documento de Firestore.
   */
  async delete(featureId, collection, id) {
    const docRef = doc(db, collection, id);
    await deleteDoc(docRef);
    return id;
  },

  /**
   * Ejecuta un callback aislado dentro de una transacción Firestore.
   */
  async runTransaction(featureId, callback) {
    return runTransaction(db, async (transaction) => {
      // Exponer una versión transaccional del dbContract a la feature
      const transactionalDb = {
        get: async (coll, id) => {
          const docRef = doc(db, coll, id);
          const snap = await transaction.get(docRef);
          return snap.exists() ? { id: snap.id, ...snap.data() } : null;
        },
        update: (coll, id, data) => {
          const docRef = doc(db, coll, id);
          transaction.update(docRef, data);
        },
        save: (coll, id, data) => {
          const docRef = doc(db, coll, id);
          transaction.set(docRef, data, { merge: true });
        },
        delete: (coll, id) => {
          const docRef = doc(db, coll, id);
          transaction.delete(docRef);
        }
      };
      return callback(transactionalDb);
    });
  }
};
