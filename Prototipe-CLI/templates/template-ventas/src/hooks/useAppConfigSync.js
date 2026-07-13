import { useEffect, useRef } from 'react'
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore'
import { subscribeToAppConfig, subscribeToCatalogFilters, updateAppConfig } from '../services/appConfigService'
import { subscribeToBillingData } from '../features/billing'
import { reportMonthlyBillingToDeveloper } from '../services/telemetryService'
import { getCentralFirestore } from '../services/centralFirebaseService'
import useAppConfigStore from '../store/appConfigStore'
import useAuthStore from '../store/authStore'
import { appConfigSchema } from '../schemas/appConfigSchema'
import manifest from '../core/generated/core-manifest.generated.json'

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
  const latestMetricsRef = useRef(null)
  const pendingBillingUpdateRef = useRef(null)
  const latestCentralFlagsRef = useRef({})

  useEffect(() => {
    if (user && role === 'admin' && pendingBillingUpdateRef.current && typeof updateAppConfig === 'function') {
      const data = pendingBillingUpdateRef.current
      pendingBillingUpdateRef.current = null
      updateAppConfig(data).catch((err) => {
        console.warn('[BillingSync] Error propagando tarifa diferida:', err.message)
      })
    }
  }, [user, role])

  useEffect(() => {
    // Suscripción a los ajustes generales (nombre, tema, banco, whatsapp, etc.)
    const unsubscribeSettings = subscribeToAppConfig((settings) => {
      try {
        const validated = appConfigSchema.parse(settings || {})
        // Mezclar con prioridad de las flags del CRM central para evitar sobreescrituras locales
        setConfig({ ...validated, ...latestCentralFlagsRef.current })
      } catch (err) {
        console.warn('[ZodSync] Error al validar config local settings, aplicando fallbacks:', err.message)
        // Fallback parcial de recuperación
        try {
          const partialValidated = appConfigSchema.partial().parse(settings || {})
          setConfig({ ...settings, ...partialValidated, ...latestCentralFlagsRef.current })
        } catch (_) {
          setConfig({ ...settings, ...latestCentralFlagsRef.current })
        }
      }
    })

    // Suscripción a los filtros del catálogo activos
    const unsubscribeFilters = subscribeToCatalogFilters((filters) => {
      setCatalogFilters(filters)
    })

    // Suscripción y reporte automático de telemetría en segundo plano (sólo si es admin autenticado)
    let unsubscribeTelemetry = () => {}
    if (user && role === 'admin') {
      unsubscribeTelemetry = subscribeToBillingData((metrics) => {
        latestMetricsRef.current = metrics
        if (!metrics || !metrics.totalMes) return
        
        const now = new Date()
        const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        
        // Regla de negocio estándar: Reportar únicamente el último día de cada mes
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

    console.log('[CentralSync] Inicializando hook de sincronización con CLIENT_ID:', CLIENT_ID)

    if (CLIENT_ID) {
      const centralDb = getCentralFirestore()
      if (centralDb) {
        const clientDocRef = doc(centralDb, 'clientes_control', CLIENT_ID)

        unsubscribeCentral = onSnapshot(
          clientDocRef,
          (snapshot) => {
            if (!snapshot.exists()) {
              console.warn('[CentralSync] El documento de control del cliente no existe en la BD central:', CLIENT_ID)
              return
            }
            const data = snapshot.data()
            console.log('[CentralSync] Snapshot recibido de la BD Central. Data:', data)

            // 1. Sincronizar sistemaAlerta y desactivación → Zustand (activa el bloqueo visual)
            const alerta = data.sistemaAlerta || null
            const deactivated = data.deactivated || false
            const deactivationReason = data.deactivationReason || ''
            
            try {
              const validatedCentral = appConfigSchema.pick({
                sistemaAlerta: true,
                deactivated: true,
                deactivationReason: true
              }).parse({
                sistemaAlerta: alerta,
                deactivated,
                deactivationReason
              })
              setConfig(validatedCentral)
            } catch (err) {
              console.warn('[ZodSync] Error al validar config central settings:', err.message)
              setConfig({ 
                sistemaAlerta: alerta,
                deactivated,
                deactivationReason
              })
            }

            // 2. Sincronización silenciosa de tarifas de cobro y Feature Flags desde el CRM central
            // Si el desarrollador actualizó los parámetros de billing o las flags, se propagan
            // automáticamente al config/settings local de la instancia.
            const centralFlags = data.flags || {}
            
            const flagsUpdate = {
              featureFlags: {
                ...useAppConfigStore.getState().featureFlags
              }
            }

            manifest.featureFlags.forEach(flag => {
              const primaryKey = flag.remoteKey || flag.id
              let value = centralFlags[primaryKey]

              if (value === undefined && flag.legacyRemoteKeys) {
                for (const legacyKey of flag.legacyRemoteKeys) {
                  if (centralFlags[legacyKey] !== undefined) {
                    value = centralFlags[legacyKey]
                    break
                  }
                }
              }

              if (value !== undefined) {
                const boolValue = Boolean(value)
                flagsUpdate.featureFlags[flag.id] = boolValue
                flagsUpdate[flag.id] = boolValue
              }
            })

            if (centralFlags.wholesaleEnabled !== undefined) {
              flagsUpdate.wholesaleSettings = {
                ...useAppConfigStore.getState().wholesaleSettings,
                enabled: Boolean(centralFlags.wholesaleEnabled)
              }
            }
            
            // Almacenar en la referencia
            latestCentralFlagsRef.current = flagsUpdate

            const billingFieldsFromCentral = {
              ...(data.billingMode !== undefined && { developerBillingMode: data.billingMode }),
              ...(data.comisionPorcentaje !== undefined && { developerCommissionPercent: parseFloat(data.comisionPorcentaje) }),
              ...(data.montoFijoServicio !== undefined && { developerFixedServiceAmount: parseFloat(data.montoFijoServicio) }),
              ...(data.pagoMensualFijo !== undefined && { developerFlatMonthlyPayment: parseFloat(data.pagoMensualFijo) }),
              ...(data.enableDianBilling !== undefined && { developerEnableDianBilling: Boolean(data.enableDianBilling) }),
              ...(data.costoPorFacturaDian !== undefined && { developerDianInvoiceCost: parseFloat(data.costoPorFacturaDian) }),
              ...flagsUpdate
            }

            if (Object.keys(billingFieldsFromCentral).length > 0) {
              // Comparar con los valores actuales en Zustand para evitar escrituras redundantes o advertencias de permisos
              const currentStore = useAppConfigStore.getState()
              const hasChanges = Object.keys(billingFieldsFromCentral).some(
                (key) => currentStore[key] !== billingFieldsFromCentral[key]
              )

              if (hasChanges) {
                // Actualizar Zustand inmediatamente para que subscribeToBillingData use valores frescos
                setConfig(billingFieldsFromCentral)

                // Propagar al documento config/settings local solo si hay un admin autenticado.
                // Sin sesión activa, Firestore Rules rechaza la escritura (Missing or insufficient permissions).
                if (typeof updateAppConfig === 'function') {
                  if (user && role === 'admin') {
                    updateAppConfig(billingFieldsFromCentral).catch((err) => {
                      console.warn('[ConfigSync] No se pudo propagar tarifa/flags al config local:', err.message)
                    })
                  } else {
                    // Guardar para propagación diferida cuando la sesión esté lista
                    pendingBillingUpdateRef.current = billingFieldsFromCentral
                  }
                }
              }
            }

            // 3. Responder al triggerPing → Despachar evento para confirmación del usuario (Ping-Pong interactivo)
            const triggerPing = data.triggerPing
            if (triggerPing) {
              const pingTs = triggerPing.toMillis ? triggerPing.toMillis() : (Number(triggerPing) || 0)
              
              // Obtener timestamp de la última respuesta
              const lastPingResponse = data.lastPingResponse
              const responseTs = lastPingResponse && lastPingResponse.toMillis ? lastPingResponse.toMillis() : (Number(lastPingResponse) || 0)
              
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

            // 4. Responder al triggerTelemetryReport (reporte automático remoto)
            const triggerTelemetry = data.triggerTelemetryReport
            if (triggerTelemetry && user && role === 'admin') {
              const triggerTs = triggerTelemetry.toMillis ? triggerTelemetry.toMillis() : (Number(triggerTelemetry) || 0)
              const currentTrigger = String(triggerTs)
              const ageMs = Date.now() - triggerTs
              const isExpired = ageMs > 60000 // Expirado después de 60s
              
              if (currentTrigger !== lastProcessedTriggerRef.current && !isExpired) {
                lastProcessedTriggerRef.current = currentTrigger
                const metrics = latestMetricsRef.current
                if (metrics && typeof metrics.totalMes === 'number') {
                  const now = new Date()
                  const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
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
                }
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
