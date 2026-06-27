import { useEffect, useRef } from 'react'
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore'
import { subscribeToAppConfig, subscribeToCatalogFilters, updateAppConfig } from '../services/appConfigService'
import { subscribeToBillingData } from '../services/billingService'
import { reportMonthlyBillingToDeveloper } from '../services/telemetryService'
import { getCentralFirestore } from '../services/centralFirebaseService'
import { isAuthenticated } from '../utils/firestoreAuthGuard'
import useAppConfigStore from '../store/appConfigStore'

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

    // Suscripción y reporte automático de telemetría en segundo plano
    const unsubscribeTelemetry = subscribeToBillingData((metrics) => {
      if (!metrics || !metrics.totalMes) return
      
      const now = new Date()
      const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

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
            const billingFieldsFromCentral = {
              ...(data.billingMode !== undefined && { developerBillingMode: data.billingMode }),
              ...(data.comisionPorcentaje !== undefined && { developerCommissionPercent: parseFloat(data.comisionPorcentaje) }),
              ...(data.montoFijoServicio !== undefined && { developerFixedServiceAmount: parseFloat(data.montoFijoServicio) }),
              ...(data.pagoMensualFijo !== undefined && { developerFlatMonthlyPayment: parseFloat(data.pagoMensualFijo) }),
              ...(data.enableDianBilling !== undefined && { developerEnableDianBilling: Boolean(data.enableDianBilling) }),
              ...(data.costoPorFacturaDian !== undefined && { developerDianInvoiceCost: parseFloat(data.costoPorFacturaDian) }),
            }
            if (Object.keys(billingFieldsFromCentral).length > 0) {
              setConfig(billingFieldsFromCentral)
              // Guard: solo propagar al config local si hay sesión activa.
              // Sin auth, Firestore Rules rechaza la escritura con "Missing or insufficient permissions".
              if (typeof updateAppConfig === 'function' && isAuthenticated()) {
                updateAppConfig(billingFieldsFromCentral).catch((err) => {
                  console.warn('[BillingSync] No se pudo propagar tarifa al config local:', err.message)
                })
              }
            }

            // 3. Responder al triggerPing → Despachar evento para confirmación del usuario (Ping-Pong interactivo)
            const triggerPing = data.triggerPing
            if (triggerPing) {
              const pingTs = triggerPing.toMillis ? triggerPing.toMillis() : 0
              const lastPingResponse = data.lastPingResponse
              const responseTs = lastPingResponse && lastPingResponse.toMillis ? lastPingResponse.toMillis() : 0
              const triggerAgeMs = Date.now() - pingTs
              const isExpired = triggerAgeMs > 60000
              if (pingTs > responseTs && pingTs !== lastPingTimestampRef.current && !isExpired) {
                lastPingTimestampRef.current = pingTs
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

    // Cleanup: desuscribirse cuando se desmonta (idealmente nunca en la raíz)
    return () => {
      unsubscribeSettings()
      unsubscribeFilters()
      unsubscribeTelemetry()
      unsubscribeCentral()
    }
  }, [setConfig, setCatalogFilters])
}
