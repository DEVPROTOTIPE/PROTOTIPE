import { useState, useEffect, useCallback } from 'react';
import { {{pascalName}}Service } from '../services/{{pascalName}}Service';
// Si activas el ejemplo de suscripción de abajo, añade también:
// import { {{pascalName}}Repository } from '../api/{{pascalName}}Repository';

export function use{{pascalName}}(tenantId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const records = await {{pascalName}}Service.getRecords(tenantId);
      setData(records);
    } catch (err) {
      setError(err.message || 'Error al obtener registros');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const addRecord = useCallback(async (recordData) => {
    if (!tenantId) return null;
    setLoading(true);
    setError(null);
    try {
      const id = await {{pascalName}}Service.createRecord(tenantId, recordData);
      await fetchRecords();
      return id;
    } catch (err) {
      setError(err.message || 'Error al guardar el registro');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tenantId, fetchRecords]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ─── EJEMPLO (ADR-0001 §13): consumir una suscripción en tiempo real ───
  // Descomenta si esta feature necesita datos en vivo de un registro
  // puntual. El Hook consume la suscripción expuesta por el Repository
  // directamente (no construye queries ni referencias Firestore él mismo) y
  // se encarga de cancelarla en el cleanup del efecto. Patrón real:
  // features/customer-loyalty/hooks/useCustomerLoyalty.js.
  //
  // useEffect(() => {
  //   if (!tenantId || !recordId) return;
  //   const unsubscribe = {{pascalName}}Repository.subscribeToRecord(
  //     tenantId,
  //     recordId,
  //     (record) => setData(record),
  //     (err) => setError(err.message)
  //   );
  //   return () => unsubscribe();
  // }, [tenantId, recordId]);

  return {
    data,
    loading,
    error,
    refetch: fetchRecords,
    addRecord
  };
}
