import { auth } from '../config/firebaseConfig';
import { telemetryDb, migrateLegacyTelemetryQueue } from './telemetryOutboxDb';

// Variables de entorno para identificación del cliente y telemetría
const CENTRAL_ENDPOINT = import.meta.env.VITE_DEVELOPER_TELEMETRY_ENDPOINT || 'http://localhost:3001';
const CLIENT_ID = import.meta.env.VITE_DEVELOPER_CLIENT_ID;
const CLIENT_NICHE = import.meta.env.VITE_NICHE || 'general';

// Cache en memoria para throttle anti-duplicado de errores (5 min por firma)
const reportedErrorsCache = {};

// Rate limiting variables para la telemetría local (Circuit Breaker)
let reportsThisMinute = 0;
let minuteResetTimestamp = Date.now();
const MAX_REPORTS_PER_MINUTE = 20;
let circuitBreakerTripped = false;
let circuitBreakerResetAt = 0;

// Configuración de límites y expiración del Outbox local (Spark-first)
const MAX_OUTBOX_SIZE = 100;
const OUTBOX_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

/**
 * Obtiene de forma segura el token de Firebase App Check si está disponible.
 * Soporta el bypass de pruebas en entorno de test.
 */
async function getAppCheckTokenSafe() {
  try {
    // Si la aplicación cliente configuró e inicializó App Check
    const { getAppCheck, getToken } = await import('firebase/app-check');
    const appCheck = getAppCheck();
    if (appCheck) {
      const res = await getToken(appCheck, false);
      return res.token;
    }
  } catch (_) {
    // Fallback silencioso: en modo desarrollo local o tests, retornar token de bypass si se cuenta con él
    if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
      return import.meta.env.VITE_TEST_AUTH_BYPASS_TOKEN || '';
    }
  }
  return '';
}

/**
 * Genera un hash/firma simple para identificar errores idénticos.
 */
function getErrorHash(errorMsg, stack) {
  const cleanStack = (stack || '').split('\n')[0] || '';
  return `${errorMsg}_${cleanStack}`.replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Genera un eventId único para idempotencia de reportes.
 */
function generateEventId(type, suffix = '') {
  return `${type}-${CLIENT_ID || 'anon'}-${Date.now()}-${suffix || Math.random().toString(36).slice(2)}`;
}

/**
 * Encola un reporte offline en IndexedDB (Dexie).
 * Limita el tamaño de la cola a 100 elementos y aplica purga de expirados.
 */
async function enqueueOfflineReport(type, payload) {
  try {
    // 1. Limpieza de expirados
    const now = Date.now();
    await telemetryDb.outbox
      .where('createdAt')
      .below(now - OUTBOX_EXPIRATION_MS)
      .delete();

    // 2. Limpieza si se excede el límite máximo
    const count = await telemetryDb.outbox.count();
    if (count >= MAX_OUTBOX_SIZE) {
      const oldest = await telemetryDb.outbox.orderBy('createdAt').limit(count - MAX_OUTBOX_SIZE + 1).toArray();
      for (const item of oldest) {
        await telemetryDb.outbox.delete(item.eventId);
      }
      console.warn(`[Telemetry] Outbox excedió límite de ${MAX_OUTBOX_SIZE}. Elementos antiguos purgados.`);
    }

    const eventId = payload.eventId || generateEventId(type);
    await telemetryDb.outbox.put({
      eventId,
      type,
      payload: { ...payload, eventId },
      status: 'pending',
      attempts: 0,
      createdAt: now,
      nextAttemptAt: now,
    });
  } catch (err) {
    console.error('[Telemetry] Error al encolar reporte en IndexedDB:', err);
  }
}

/**
 * Procesa y vacía la cola de reportes offline cuando hay internet.
 * Transmite los reportes de telemetría a través del Bridge local o los retiene localmente en producción.
 */
export async function processOfflineQueue() {
  if (!navigator.onLine) return;

  // Si estamos en producción y el endpoint no está configurado oficialmente, no transmitir
  const isProduction = import.meta.env.PROD;
  const isEndpointLocal = CENTRAL_ENDPOINT.includes('localhost') || CENTRAL_ENDPOINT.includes('127.0.0.1');
  if (isProduction && isEndpointLocal) {
    console.debug('[Telemetry] Producción activa: telemetría en cola retenida localmente (DISEÑADO / NO HABILITADO EN PRODUCCIÓN).');
    return;
  }

  // Si estamos en desarrollo y el endpoint es remoto (producción), omitir transmisión
  const isDevelopment = import.meta.env.DEV;
  const isEndpointRemote = !isEndpointLocal;
  if (isDevelopment && isEndpointRemote) {
    console.debug('[Telemetry] Desarrollo activo: telemetría local omitida para endpoints remotos de producción.');
    return;
  }

  try {
    const now = Date.now();
    const pending = await telemetryDb.outbox
      .where('nextAttemptAt').belowOrEqual(now)
      .and(item => item.status === 'pending')
      .sortBy('createdAt');

    if (pending.length === 0) return;

    console.log(`[Telemetry] Procesando ${pending.length} reporte(s) offline en cola...`);

    const appCheckToken = await getAppCheckTokenSafe();

    for (const item of pending) {
      try {
        const payload = item.payload;
        // Construir cuerpo del reporte
        const reportBody = {
          clientId: payload.clientId || CLIENT_ID,
          type: item.type,
          source: payload.source || 'automatic',
          environment: payload.environment ? payload.environment.url : window.location.href,
          severity: item.type === 'billing' ? 'info' : 'error',
          message: payload.errorMsg || `Reporte de facturación periodo ${payload.periodo || 'N/A'}`,
          details: payload
        };

        const response = await fetch(`${CENTRAL_ENDPOINT}/api/project/telemetry/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Firebase-AppCheck': appCheckToken
          },
          body: JSON.stringify(reportBody)
        });

        if (response.ok) {
          await telemetryDb.outbox.delete(item.eventId);
        } else if (response.status === 401 || response.status === 403) {
          // Descartar si el token de App Check o API Key es inválido/no autorizado
          console.warn(`[Telemetry] Reporte descartado debido a error de autorización (${response.status}) en el servidor.`);
          await telemetryDb.outbox.delete(item.eventId);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        const attempts = (item.attempts || 0) + 1;
        const backoffMs = Math.min(300000, 1000 * Math.pow(2, attempts));
        await telemetryDb.outbox.update(item.eventId, {
          attempts,
          nextAttemptAt: Date.now() + backoffMs,
          lastError: String(err.message || err),
        });
        console.warn(`[Telemetry] Error transmitiendo evento ${item.eventId} (intento ${attempts}). Reintento en ${backoffMs / 1000}s.`);
      }
    }
  } catch (err) {
    console.error('[Telemetry] Error al procesar la cola de telemetría:', err);
  }
}

// Escuchar cambios en la conexión de red del navegador
if (typeof window !== 'undefined') {
  window.addEventListener('online', processOfflineQueue);
  setTimeout(async () => {
    await migrateLegacyTelemetryQueue();
    await processOfflineQueue();
  }, 3000);

  setInterval(async () => {
    if (navigator.onLine) {
      await processOfflineQueue().catch(e => console.debug('[Telemetry] Interval process queue error:', e.message));
    }
  }, 30000);
}

/**
 * Reporta los acumulados mensuales de la tienda.
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
  let enableDianBilling = false;

  if (billingConfigOrPercent && typeof billingConfigOrPercent === 'object') {
    billingMode = billingConfigOrPercent.billingMode || 'percentage';
    enableDianBilling = billingConfigOrPercent.enableDianBilling === true;
  }

  const payload = {
    clientId: CLIENT_ID || 'desconocido',
    totalVentas,
    totalVentasNetas: totalVentasNetas ?? totalVentas,
    totalImpuestos,
    facturasDianCount,
    orderCount,
    periodo,
    billingMode,
    enableDianBilling,
    schemaVersion: 2
  };

  await enqueueOfflineReport('billing', payload);
  processOfflineQueue().catch(e => console.debug('[Telemetry] Flush error:', e.message));
}

/**
 * Reporta un error o excepción de la aplicación.
 */
export async function reportAppFailureToDeveloper(errorMsg, stack, source = 'automatic') {
  if (!CLIENT_ID) return;

  const nowTime = Date.now();

  if (nowTime - minuteResetTimestamp >= 60000) {
    reportsThisMinute = 0;
    minuteResetTimestamp = nowTime;
  }

  if (circuitBreakerTripped) {
    if (nowTime < circuitBreakerResetAt) {
      console.warn(`[Telemetry] Circuit Breaker activo. Omitiendo reporte de error.`);
      return;
    } else {
      circuitBreakerTripped = false;
    }
  }

  const msgLower = (errorMsg || '').toLowerCase();

  if (source === 'automatic') {
    const NOISE_TO_IGNORE = ['failed to fetch', 'load failed', 'networkerror', 'script error', 'extension', 'cors', 'canceled'];
    const isNoise = NOISE_TO_IGNORE.some(patron => msgLower.includes(patron));
    if (isNoise) return;
  }

  const errorHash = getErrorHash(errorMsg, stack);
  if (reportedErrorsCache[errorHash] && (nowTime - reportedErrorsCache[errorHash] < 300000)) return;
  reportedErrorsCache[errorHash] = nowTime;

  if (reportsThisMinute >= MAX_REPORTS_PER_MINUTE) {
    circuitBreakerTripped = true;
    circuitBreakerResetAt = nowTime + 300000;
    console.error(`[Telemetry] Límite de ${MAX_REPORTS_PER_MINUTE} reportes/minuto alcanzado. Circuit Breaker saltado.`);
    
    await enqueueOfflineReport('failure', {
      clientId: CLIENT_ID,
      niche: CLIENT_NICHE,
      timestamp: new Date().toISOString(),
      errorMsg: `Circuit Breaker Tripped: Excedido el límite de ${MAX_REPORTS_PER_MINUTE} reportes/minuto`,
      stack: 'Circuit breaker local activado por rate-limiting.',
      source: 'telemetry_system',
      environment: {
        url: typeof window !== 'undefined' ? window.location.href : 'N/A',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Node'
      }
    });
    return;
  }

  reportsThisMinute++;

  let userContext = null;
  if (auth && auth.currentUser) {
    userContext = {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email
    };
  }

  const extendedPayload = {
    clientId: CLIENT_ID,
    niche: CLIENT_NICHE,
    timestamp: new Date().toISOString(),
    errorMsg: errorMsg || 'Unknown Error',
    stack: stack || 'No stack trace available',
    resolved: false,
    source,
    environment: {
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Node',
      language: typeof navigator !== 'undefined' ? navigator.language : 'N/A',
      screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'N/A',
      viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'
    },
    user: userContext
  };

  await enqueueOfflineReport('failure', extendedPayload);
  processOfflineQueue().catch(e => console.debug('[Telemetry] Flush error:', e.message));
}
