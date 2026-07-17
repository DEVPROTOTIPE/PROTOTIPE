import { useState, useEffect } from 'react';
import { CustomerLoyaltyService } from '../services/CustomerLoyaltyService';
import { CustomerLoyaltyRepository } from '../api/CustomerLoyaltyRepository';

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
    const unsubAccount = CustomerLoyaltyRepository.subscribeToAccount(
      tenantId,
      customerId,
      (accountData) => {
        if (accountData) {
          setAccount(accountData);
        } else {
          // Inicializar de forma perezosa en background si no existe en BD
          CustomerLoyaltyService.getOrInitializeAccount(tenantId, customerId)
            .catch((err) => setError(err.message));
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    // 2. Suscripción en tiempo real a las transacciones de puntos
    const unsubTransactions = CustomerLoyaltyRepository.subscribeToTransactions(
      tenantId,
      customerId,
      (txs) => setTransactions(txs),
      (err) => console.error('Error cargando historial de puntos:', err)
    );

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
