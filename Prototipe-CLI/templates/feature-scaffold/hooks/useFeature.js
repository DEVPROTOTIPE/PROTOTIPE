import { useState, useEffect, useCallback } from 'react';
import { {{pascalName}}Service } from '../services/{{pascalName}}Service';

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

  return {
    data,
    loading,
    error,
    refetch: fetchRecords,
    addRecord
  };
}
