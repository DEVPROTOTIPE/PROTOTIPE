import { useEffect, useRef } from 'react'
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore'
import { subscribeToAppConfig, subscribeToCatalogFilters, updateAppConfig } from '../services/appConfigService'
import { subscribeToBillingData } from '../services/billingService'
import { reportMonthlyBillingToDeveloper } from '../services/telemetryService'
import { getCentralFirestore } from '../services/centralFirebaseService'
import useAppConfigStore from '../store/appConfigStore'
import useAuthStore from '../store/authStore'

// Variables de entorno del cliente
const CLIENT_ID = import.meta.env.VITE_DEVELOPER_CLIENT_ID

/**
 * Hook global que sincroniza la configuración de Firestore con Zustand.
 * Debe ser llamado una sola vez en la raíz de la aplicación (App.jsx).
 *
 * Además de sincronizar la config local, mantiene dos listeners centrales:
 *  1. sistemaAlerta → Alertas remotas enviadas desde el Dashboard Central.
 *  2. triggerPing   → Responde al Ping Test del desarrollador en tiempo real.
 */
export default function useAppConfigSync() {
  const { setConfig, setCatalogFilters } = useAppConfigStore()
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const lastProcessedTriggerRef = useRef(null)
  const lastPingTimestampRef = useRef(null)

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
            ).then(() => {
              window.dispatchEvent(new CustomEvent('telemetry-billing-reported', { detail: { period: periodo } }))
            }).catch((err) => {
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
        ).then(() => {
          window.dispatchEvent(new CustomEvent('telemetry-billing-reported', { detail: { period: periodo } }))
        }).catch((err) => {
          console.debug("[Telemetry Sync Error]:", err)
        })
      })
    }

    // ─── Listener Central: Alertas Remotas + Ping-Pong ────────────────────────
    // Escucha en tiempo real el documento del cliente en la BD central del desarrollador.
    // No requiere autenticación gracias a las reglas de Firestore Central (read: true).
    let unsubscribeCentral = () => {}

    if (CLIENT_ID) {
      const centralDb = getCentralFirestore()
      if (centralDb) {
        const clientDocRef = doc(centralDb, 'clientes_control', CLIENT_ID)

        unsubscribeCentral = onSnapshot(
          clientDocRef,
          (snapshot) => {
            if (!snapshot.exists()) return
            const data = snapshot.data()

            // 1. Sincronizar sistemaAlerta → Zustand (activa el bloqueo visual)
            const alerta = data.sistemaAlerta || null
            setConfig({ sistemaAlerta: alerta })

            // 2. Sincronización silenciosa de tarifas de cobro desde el CRM central
            // Si el desarrollador actualizó los parámetros de billing, se propagan
            // automáticamente al config/settings local de la instancia.
            const billingFieldsFromCentral = {
              ...(data.billingMode !== undefined && { developerBillingMode: data.billingMode }),
              ...(data.comisionPorcentaje !== undefined && { developerCommissionPercent: parseFloat(data.comisionPorcentaje) }),
              ...(data.montoFijoServicio !== undefined && { developerFixedServiceAmount: parseFloat(data.montoFijoServicio) }),
              ...(data.pagoMensualFijo !== undefined && { developerFlatMonthlyPayment: parseFloat(data.pagoMensualFijo) }),
              ...(data.enableDianBilling !== undefined && { developerEnableDianBilling: Boolean(data.enableDianBilling) }),
              ...(data.costoPorFacturaDian !== undefined && { developerDianInvoiceCost: parseFloat(data.costoPorFacturaDian) }),
            }

            if (Object.keys(billingFieldsFromCentral).length > 0) {
              // Actualizar Zustand inmediatamente para que subscribeToBillingData use valores frescos
              setConfig(billingFieldsFromCentral)

              // Propagar al documento config/settings local (async, sin bloquear UI)
              if (typeof updateAppConfig === 'function') {
                updateAppConfig(billingFieldsFromCentral).catch((err) => {
                  console.warn('[BillingSync] No se pudo propagar tarifa al config local:', err.message)
                })
              }
            }

            // 3. Responder al triggerPing → Despachar evento para confirmación del usuario (Ping-Pong interactivo)
            const triggerPing = data.triggerPing
            if (triggerPing) {
              const pingTs = triggerPing.toMillis ? triggerPing.toMillis() : 0
              
              // Obtener timestamp de la última respuesta
              const lastPingResponse = data.lastPingResponse
              const responseTs = lastPingResponse && lastPingResponse.toMillis ? lastPingResponse.toMillis() : 0
              
              // Evitar procesar solicitudes viejas o expiradas (más de 60 segundos) tras recargar
              const triggerAgeMs = Date.now() - pingTs
              const isExpired = triggerAgeMs > 60000
              
              // Solo disparar si es un ping nuevo, no procesado y no expirado
              if (pingTs > responseTs && pingTs !== lastPingTimestampRef.current && !isExpired) {
                lastPingTimestampRef.current = pingTs
                
                // Disparar evento para que la UI maneje la confirmación de la alerta de forma interactiva
                window.dispatchEvent(new CustomEvent('ping-test-requested', {
                  detail: {
                    respond: () => {
                      return updateDoc(clientDocRef, { lastPingResponse: serverTimestamp() })
                    }
                  }
                }))
              }
            }
          },
          (err) => {
            console.warn('[CentralListener] Error al escuchar documento central:', err.message)
          }
        )
      }
    }

    // Cleanup: desuscribirse cuando se desmonta
    return () => {
      unsubscribeSettings()
      unsubscribeFilters()
      unsubscribeTelemetry()
      unsubscribeCentral()
    }
  }, [setConfig, setCatalogFilters, user, role])
}
