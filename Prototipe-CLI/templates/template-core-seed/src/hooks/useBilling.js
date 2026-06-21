import { useState, useEffect, useCallback } from 'react'
import {
  subscribeToBillingData,
  updateCommissionPercent,
  updateBillingSettings
} from '../services/billingService'

/**
 * Hook para el módulo de Facturación del Desarrollador.
 * Se suscribe en tiempo real a métricas de comisión calculadas
 * sobre las transacciones del core y la configuración.
 *
 * @returns {{
 *   metrics: object|null,
 *   isLoading: boolean,
 *   savePercent: (percent: number) => Promise<void>,
 *   saveBillingConfig: (config: object) => Promise<void>,
 *   isSaving: boolean,
 * }}
 */
export function useBilling() {
  const [metrics, setMetrics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToBillingData((data) => {
      setMetrics(data)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const savePercent = useCallback(async (percent) => {
    setIsSaving(true)
    try {
      await updateCommissionPercent(Number(percent))
    } finally {
      setIsSaving(false)
    }
  }, [])

  const saveBillingConfig = useCallback(async (config) => {
    setIsSaving(true)
    try {
      await updateBillingSettings(config)
    } finally {
      setIsSaving(false)
    }
  }, [])

  return { metrics, isLoading, savePercent, saveBillingConfig, isSaving }
}
