import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { updateAppConfig } from './appConfigService'
import { getCentralFirestore } from './centralFirebaseService'

// Variables de entorno para conectar al Firebase Central de Control (Spark mode)
const CLIENT_ID = import.meta.env.VITE_DEVELOPER_CLIENT_ID;
const SETTINGS_REF = doc(db, 'config', 'settings')

// Adaptador de facturación activo registrado en tiempo de ejecución
let registeredAdapter = null

/**
 * Registra un adaptador de facturación específico de la vertical.
 * Permite al Core SaaS monitorear consumos específicos.
 * @param {object} adapter - { subscribe: (callback) => unsubscribeFn, calculate: (data, config) => metrics }
 */
export function registerBillingAdapter(adapter) {
  registeredAdapter = adapter
}

/**
 * Adaptador por defecto. Retorna transacciones vacías si no hay feature transaccional activa.
 */
const defaultAdapter = (callback) => {
  if (registeredAdapter && typeof registeredAdapter.subscribe === 'function') {
    return registeredAdapter.subscribe(callback)
  }
  callback([])
  return () => {}
}

/**
 * Guarda el nuevo porcentaje de comisión del desarrollador en Firestore (Retrocompatible).
 * @param {number} percent - Porcentaje (ej: 1, 2.5)
 */
export async function updateCommissionPercent(percent) {
  await updateAppConfig({ developerCommissionPercent: percent })
}

/**
 * Guarda la configuración de facturación local en Firestore (Soporte 4 modelos).
 * @param {object} config - Configuración de facturación
 */
export async function updateBillingSettings(config) {
  await updateAppConfig({
    developerBillingMode: config.billingMode || 'percentage',
    developerCommissionPercent: config.comisionPorcentaje ?? 1,
    developerFixedServiceFee: config.montoFijoServicio ?? 0,
    developerFlatMonthlyFee: config.pagoMensualFijo ?? 0,
    enableDianBilling: config.enableDianBilling === true,
    costoPorFacturaDian: config.costoPorFacturaDian ?? 0
  })
}

/**
 * Agrupa transacciones o consumos y calcula las métricas según el modo de facturación SaaS.
 */
function calcMetrics(transactions, billingConfig) {
  if (registeredAdapter && typeof registeredAdapter.calculate === 'function') {
    return registeredAdapter.calculate(transactions, billingConfig)
  }

  // Lógica genérica de SaaS Billing basada en suscripción mensual fija
  const {
    billingMode = 'flat_monthly',
    pagoMensualFijo = 0
  } = billingConfig || {}

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const desgloseMap = {}
  const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    desgloseMap[key] = {
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
      ventas: 0,
      pedidos: 0,
      comision: billingMode === 'flat_monthly' ? pagoMensualFijo : 0,
    }
  }

  return {
    totalHistorico: 0,
    comisionHistorica: billingMode === 'flat_monthly' ? (6 * pagoMensualFijo) : 0,
    totalMes: 0,
    comisionMes: billingMode === 'flat_monthly' ? pagoMensualFijo : 0,
    pedidosMes: 0,
    desgloseMensual: Object.values(desgloseMap),
    pagoBreakdown: { efectivo: 0, transferencia: 0, credito: 0 },
    billingMode,
    comisionPorcentaje: 0,
    montoFijoServicio: 0,
    pagoMensualFijo,
    enableDianBilling: false,
    costoPorFacturaDian: 0
  }
}

/**
 * Suscripción en tiempo real a las métricas de facturación SaaS.
 * Escucha consumos y la configuración de facturación simultáneamente.
 * @param {function} onUpdate - Callback con las métricas calculadas
 * @param {function} [dataAdapter] - Adaptador opcional para sobreescribir en test
 * @returns {function} Función para cancelar las suscripciones
 */
export function subscribeToBillingData(onUpdate, dataAdapter = null) {
  let latestTransactions = []
  let latestConfig = {
    billingMode: 'percentage',
    comisionPorcentaje: 1,
    montoFijoServicio: 0,
    pagoMensualFijo: 0,
    enableDianBilling: false,
    costoPorFacturaDian: 0
  }

  const resolveAdapter = dataAdapter || defaultAdapter

  const unsubOrders = resolveAdapter((transactions) => {
    latestTransactions = transactions
    onUpdate(calcMetrics(latestTransactions, latestConfig))
  })

  const centralDb = getCentralFirestore()
  let unsubSettings = () => {}

  if (centralDb && CLIENT_ID) {
    const centralClientRef = doc(centralDb, 'clientes_control', CLIENT_ID)
    unsubSettings = onSnapshot(centralClientRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        latestConfig = {
          billingMode: data.billingMode || 'percentage',
          comisionPorcentaje: data.comisionPorcentaje ?? 1,
          montoFijoServicio: data.montoFijoServicio ?? 0,
          pagoMensualFijo: data.pagoMensualFijo ?? 0,
          enableDianBilling: data.enableDianBilling === true,
          costoPorFacturaDian: data.costoPorFacturaDian ?? 0
        }
      } else {
        latestConfig = {
          billingMode: 'percentage',
          comisionPorcentaje: 1,
          montoFijoServicio: 0,
          pagoMensualFijo: 0,
          enableDianBilling: false,
          costoPorFacturaDian: 0
        }
      }
      onUpdate(calcMetrics(latestTransactions, latestConfig))
    }, (err) => {
      console.warn("[Billing] Fallo al leer configuración central, usando fallback local:", err)
      onSnapshot(SETTINGS_REF, (localSnap) => {
        if (localSnap.exists()) {
          const data = localSnap.data()
          latestConfig = {
            billingMode: data.developerBillingMode || 'percentage',
            comisionPorcentaje: data.developerCommissionPercent ?? 1,
            montoFijoServicio: data.developerFixedServiceFee ?? 0,
            pagoMensualFijo: data.developerFlatMonthlyFee ?? 0,
            enableDianBilling: data.enableDianBilling === true,
            costoPorFacturaDian: data.costoPorFacturaDian ?? 0
          }
          onUpdate(calcMetrics(latestTransactions, latestConfig))
        }
      })
    })
  } else {
    unsubSettings = onSnapshot(SETTINGS_REF, (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        latestConfig = {
          billingMode: data.developerBillingMode || 'percentage',
          comisionPorcentaje: data.developerCommissionPercent ?? 1,
          montoFijoServicio: data.developerFixedServiceFee ?? 0,
          pagoMensualFijo: data.developerFlatMonthlyFee ?? 0,
          enableDianBilling: data.enableDianBilling === true,
          costoPorFacturaDian: data.costoPorFacturaDian ?? 0
        }
        onUpdate(calcMetrics(latestTransactions, latestConfig))
      }
    })
  }

  return () => {
    unsubOrders()
    unsubSettings()
  }
}
