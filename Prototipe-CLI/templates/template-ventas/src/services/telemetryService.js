import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { getCentralFirestore } from './centralFirebaseService';
import { auth } from '../config/firebaseConfig';

// Variables de entorno para modo Blaze (HTTP)
const CENTRAL_ENDPOINT = import.meta.env.VITE_DEVELOPER_TELEMETRY_ENDPOINT;
const DEV_TOKEN = import.meta.env.VITE_DEVELOPER_TELEMETRY_TOKEN;

// Variables de entorno para modo Spark (Direct Firestore)
const CLIENT_ID = import.meta.env.VITE_DEVELOPER_CLIENT_ID;
const CLIENT_NICHE = import.meta.env.VITE_NICHE || 'general';

// Almacenamiento en memoria para prevenir duplicados de error
const reportedErrorsCache = {};

// Constantes de almacenamiento local
const OFFLINE_QUEUE_KEY = 'telemetry_offline_queue';

/**
 * Genera un hash/firma simple para identificar errores idénticos.
 */
function getErrorHash(errorMsg, stack) {
  const cleanStack = (stack || '').split('\n')[0] || '';
  return `${errorMsg}_${cleanStack}`.replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Agrega un reporte a la cola local en localStorage.
 */
function enqueueOfflineReport(type, payload) {
  try {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    // Limitar la cola a un tamaño máximo para evitar desbordar el localStorage (ej: max 30 elementos)
    if (queue.length > 30) {
      queue.shift();
    }
    queue.push({ type, payload, timestamp: new Date().toISOString() });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.debug(`[Telemetry] Reporte de tipo '${type}' encolado localmente (Offline).`);
  } catch (err) {
    console.error('[Telemetry] Error al encolar reporte localmente:', err);
  }
}

/**
 * Procesa y vacía la cola local de reportes cuando hay internet.
 */
export async function processOfflineQueue() {
  if (!navigator.onLine) return;

  try {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    console.log(`[Telemetry] Procesando cola local de telemetría (${queue.length} pendientes)...`);
    const remainingQueue = [];

    for (const report of queue) {
      try {
        if (report.type === 'billing') {
          await executeBillingReport(report.payload);
        } else if (report.type === 'failure') {
          await executeFailureReport(report.payload);
        }
      } catch (err) {
        console.warn('[Telemetry] Reintento fallido para reporte encolado. Se conservará en la cola.', err);
        remainingQueue.push(report);
      }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
    if (remainingQueue.length === 0) {
      console.log('[Telemetry] Todos los reportes locales pendientes fueron enviados con éxito.');
    }
  } catch (err) {
    console.error('[Telemetry] Error al procesar la cola de telemetría local:', err);
  }
}

// Escuchar cambios en la conexión de red del navegador
if (typeof window !== 'undefined') {
  window.addEventListener('online', processOfflineQueue);
  // Intentar procesar en frío al arrancar
  setTimeout(processOfflineQueue, 3000);
}

/**
 * Lógica pura de envío del reporte mensual de facturación (Billing)
 */
async function executeBillingReport(payload) {
  // 1. MODO BLAZE: HTTP Endpoint (Cloud Function)
  if (CENTRAL_ENDPOINT && DEV_TOKEN) {
    console.log("[Telemetry] Reportando facturación vía Cloud Function...");
    const response = await fetch(CENTRAL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEV_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[Telemetry] Reporte billing HTTP enviado exitosamente:", data);
    return;
  }

  // 2. MODO SPARK: Conexión directa a Firestore Central
  const centralDb = getCentralFirestore();
  if (centralDb && DEV_TOKEN && CLIENT_ID) {
    console.log("[Telemetry] Reportando facturación vía Firestore Directo...");
    const reportId = `${CLIENT_ID}_${payload.periodo}`;
    const reportRef = doc(centralDb, "reportesBilling", reportId);

    await setDoc(reportRef, {
      ...payload,
      token: DEV_TOKEN,
      updatedAt: serverTimestamp()
    });

    console.log("[Telemetry] Reporte billing Firestore directo enviado exitosamente.");
    return;
  }

  throw new Error("No hay conexión central configurada para Billing.");
}

/**
 * Lógica pura de envío de reportes de error/fallo de la App.
 */
async function executeFailureReport(payload) {
  const centralDb = getCentralFirestore();
  if (!centralDb || !DEV_TOKEN || !CLIENT_ID) {
    throw new Error("Credenciales de la consola central no disponibles.");
  }

  const failuresRef = collection(centralDb, 'app_failures');
  await addDoc(failuresRef, {
    ...payload,
    token: DEV_TOKEN
  });
  console.log('[Telemetry] Reporte de fallo enviado con éxito a la Consola Central.');
}

/**
 * Reporta los acumulados mensuales de la tienda al panel central del desarrollador.
 */
export async function reportMonthlyBillingToDeveloper(
  totalVentas,
  billingConfigOrPercent,
  periodo,
  orderCount = 0,
  totalVentasNetas = null,
  totalImpuestos = 0,
  facturasDianCount = 0
) {
  let billingMode = 'percentage';
  let comisionPorcentaje = 1;
  let montoFijoServicio = 0;
  let pagoMensualFijo = 0;
  let comisionValor = 0;
  let enableDianBilling = false;
  let costoPorFacturaDian = 0;

  if (billingConfigOrPercent && typeof billingConfigOrPercent === 'object') {
    billingMode = billingConfigOrPercent.billingMode || 'percentage';
    comisionPorcentaje = billingConfigOrPercent.comisionPorcentaje ?? 1;
    montoFijoServicio = billingConfigOrPercent.montoFijoServicio ?? 0;
    pagoMensualFijo = billingConfigOrPercent.pagoMensualFijo ?? 0;
    enableDianBilling = billingConfigOrPercent.enableDianBilling === true;
    costoPorFacturaDian = billingConfigOrPercent.costoPorFacturaDian ?? 0;

    const baseComisionable = enableDianBilling ? (totalVentasNetas ?? totalVentas) : totalVentas;

    if (billingMode === 'percentage') {
      comisionValor = (baseComisionable * comisionPorcentaje) / 100;
    } else if (billingMode === 'fixed_per_service') {
      comisionValor = orderCount * montoFijoServicio;
    } else if (billingMode === 'flat_monthly') {
      comisionValor = pagoMensualFijo;
    }

    if (enableDianBilling && facturasDianCount > 0) {
      comisionValor += (facturasDianCount * costoPorFacturaDian);
    }
  } else {
    comisionPorcentaje = Number(billingConfigOrPercent) || 1;
    comisionValor = (totalVentas * comisionPorcentaje) / 100;
  }

  const payload = {
    clientId: CLIENT_ID || "desconocido",
    totalVentas,
    totalVentasNetas: totalVentasNetas ?? totalVentas,
    totalImpuestos,
    facturasDianCount,
    costoPorFacturaDian,
    comisionPorcentaje,
    comisionValor,
    billingMode,
    montoFijoServicio,
    pagoMensualFijo,
    periodo,
    orderCount,
    enableDianBilling
  };

  if (!navigator.onLine) {
    enqueueOfflineReport('billing', payload);
    return;
  }

  try {
    await executeBillingReport(payload);
  } catch (error) {
    console.error("[Telemetry] Error en reporte de facturación. Encolando...", error);
    enqueueOfflineReport('billing', payload);
  }
}

/**
 * Reporta un error o excepción de la aplicación a la base de datos central de errores.
 */
export async function reportAppFailureToDeveloper(errorMsg, stack) {
  if (!DEV_TOKEN || !CLIENT_ID) return;

  // Mecanismo Anti-Duplicado (Throttle de 60 segundos por firma de error)
  const errorHash = getErrorHash(errorMsg, stack);
  const now = Date.now();
  if (reportedErrorsCache[errorHash] && (now - reportedErrorsCache[errorHash] < 60000)) {
    console.debug(`[Telemetry] Reporte de error duplicado omitido (Throttled): ${errorMsg}`);
    return;
  }
  reportedErrorsCache[errorHash] = now;

  // Contexto del usuario logueado en Firebase Auth (Seguro sin datos sensibles)
  let userContext = null;
  if (auth && auth.currentUser) {
    userContext = {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email
    };
  }

  // Información extendida del Entorno y Cliente
  const extendedPayload = {
    clientId: CLIENT_ID,
    niche: CLIENT_NICHE,
    timestamp: new Date().toISOString(),
    errorMsg: errorMsg || 'Unknown Error',
    stack: stack || 'No stack trace available',
    resolved: false,
    environment: {
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Node',
      language: typeof navigator !== 'undefined' ? navigator.language : 'N/A',
      screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'N/A',
      viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'
    },
    user: userContext
  };

  if (!navigator.onLine) {
    enqueueOfflineReport('failure', extendedPayload);
    return;
  }

  try {
    await executeFailureReport(extendedPayload);
  } catch (error) {
    console.error('[Telemetry] Falló reporte inmediato de error. Encolando...', error);
    enqueueOfflineReport('failure', extendedPayload);
  }
}
