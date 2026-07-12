import { useState, useCallback } from 'react'
import { syncOfflineSales } from '../services/salesService'

/**
 * Hook para la sincronización manual o automática de ventas offline de IndexedDB.
 */
export function useOfflineSaleSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)

  const syncSales = useCallback(async () => {
    setIsSyncing(true)
    try {
      const res = await syncOfflineSales()
      setSyncResult(res)
      return res
    } catch (error) {
      console.error('[useOfflineSaleSync] Sincronización fallida:', error)
      return { success: false, error: error.message }
    } finally {
      setIsSyncing(false)
    }
  }, [])

  return {
    isSyncing,
    syncResult,
    syncSales,
  }
}
