import { useEffect, useRef } from 'react'
import { subscribeToAppConfig, subscribeToCatalogFilters } from '../services/appConfigService'
import { subscribeToBillingData } from '../services/billingService'
import { reportMonthlyBillingToDeveloper } from '../services/telemetryService'
import useAppConfigStore from '../store/appConfigStore'
import useAuthStore from '../store/authStore'

/**
 * Hook global que sincroniza la configuración de Firestore con Zustand.
 * Debe ser llamado una sola vez en la raíz de la aplicación (App.jsx).
 */
export default function useAppConfigSync() {
  const { setConfig, setCatalogFilters } = useAppConfigStore()
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const lastProcessedTriggerRef = useRef(null)

  useEffect(() => {
    // Suscripción a los ajustes generales (nombre, tema, banco, whatsapp, etc.)
    const unsubscribeSettings = subscribeToAppConfig((settings) => {
      setConfig(settings)
    })

    // Suscripción a los filtros del catálogo activos
    const unsubscribeFilters = subscribeToCatalogFilters((filters) => {
      setCatalogFilters(filters)
    })

    // Suscripción y reporte automático de telemetría en segundo plano (sólo si es admin autenticado)
    let unsubscribeTelemetry = () => {}
    if (user && role === 'admin') {
      unsubscribeTelemetry = subscribeToBillingData((metrics) => {
        if (!metrics || !metrics.totalMes) return
        
        const now = new Date()
        const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

        // 1. Verificar si hay un gatillo manual remoto de telemetría solicitado desde el dashboard
        if (metrics.triggerTelemetryReport) {
          const currentTrigger = String(metrics.triggerTelemetryReport)
          if (currentTrigger !== lastProcessedTriggerRef.current) {
            lastProcessedTriggerRef.current = currentTrigger
            console.log(`[Telemetry Trigger] Solicitud manual remota detectada para el periodo ${periodo}. Reportando...`)
            reportMonthlyBillingToDeveloper(
              metrics.totalMes,
              metrics,
              periodo,
              metrics.pedidosMes
            ).catch((err) => {
              console.debug("[Telemetry Trigger Sync Error]:", err)
            })
            return
          }
        }

        // 2. Regla de negocio estándar: Reportar únicamente el último día de cada mes
        const tomorrow = new Date(now)
        tomorrow.setDate(now.getDate() + 1)
        const isLastDay = tomorrow.getMonth() !== now.getMonth()
        if (!isLastDay) return

        // Dispara la transmisión asíncrona silenciosa
        reportMonthlyBillingToDeveloper(
          metrics.totalMes,
          metrics,
          periodo,
          metrics.pedidosMes
        ).catch((err) => {
          console.debug("[Telemetry Sync Error]:", err)
        })
      })
    }

    // Cleanup: desuscribirse cuando se desmonta
    return () => {
      unsubscribeSettings()
      unsubscribeFilters()
      unsubscribeTelemetry()
    }
  }, [setConfig, setCatalogFilters, user, role])
}

