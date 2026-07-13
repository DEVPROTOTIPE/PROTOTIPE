import { useState, useEffect } from 'react';
import { db } from '../../../config/firebaseConfig';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { CustomerLoyaltyService } from '../services/CustomerLoyaltyService';

/**
 * Hook para interactuar reactivamente con la cuenta de fidelización y transacciones del cliente.
 */
export function useCustomerLoyalty(tenantId, customerId) {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tenantId || !customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Suscripción en tiempo real a la cuenta de puntos
    const accountRef = doc(db, `tenants/${tenantId}/loyaltyAccounts`, customerId);
    const unsubAccount = onSnapshot(accountRef, (docSnap) => {
      if (docSnap.exists()) {
        setAccount(docSnap.data());
      } else {
        // Inicializar de forma perezosa en background si no existe en BD
        CustomerLoyaltyService.getOrInitializeAccount(tenantId, customerId)
          .catch((err) => setError(err.message));
      }
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    // 2. Suscripción en tiempo real a las transacciones de puntos
    const transactionsCol = collection(db, `tenants/${tenantId}/loyaltyTransactions`);
    const q = query(
      transactionsCol,
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );

    const unsubTransactions = onSnapshot(q, (snap) => {
      const txs = snap.docs.map(doc => ({
        transactionId: doc.id,
        ...doc.data()
      }));
      setTransactions(txs);
    }, (err) => {
      console.error("Error cargando historial de puntos:", err);
    });

    return () => {
      unsubAccount();
      unsubTransactions();
    };
  }, [tenantId, customerId]);

  /**
   * Acumula puntos por una venta.
   */
  const earnPoints = async (points, saleId) => {
    try {
      setError(null);
      await CustomerLoyaltyService.earnPoints(tenantId, customerId, points, saleId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Canjea puntos por una compra.
   */
  const redeemPoints = async (points, referenceId) => {
    try {
      setError(null);
      await CustomerLoyaltyService.redeemPoints(tenantId, customerId, points, referenceId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Genera un token QR temporal opaco.
   */
  const generateQRToken = async () => {
    try {
      setError(null);
      return await CustomerLoyaltyService.generateLoyaltyToken(tenantId, customerId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    account,
    transactions,
    loading,
    error,
    earnPoints,
    redeemPoints,
    generateQRToken
  };
}
