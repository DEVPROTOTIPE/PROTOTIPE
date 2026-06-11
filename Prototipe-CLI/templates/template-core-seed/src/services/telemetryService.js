import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { getCentralFirestore } from './centralFirebaseService';

// Variables de entorno para modo Blaze (HTTP)
const CENTRAL_ENDPOINT = import.meta.env.VITE_DEVELOPER_TELEMETRY_ENDPOINT;
const DEV_TOKEN = import.meta.env.VITE_DEVELOPER_TELEMETRY_TOKEN;
const CLIENT_ID = import.meta.env.VITE_DEVELOPER_CLIENT_ID;


/**
 * Reporta los acumulados mensuales de la tienda al panel central del desarrollador.
 * Soporta de forma híbrida e inteligente:
 * - Modo Blaze (HTTP POST) si VITE_DEVELOPER_TELEMETRY_ENDPOINT está definido.
 * - Modo Spark (Conexión Directa Firestore) si no está el endpoint pero hay credenciales de base de datos.
 * 
 * @param {number} totalVentas - Monto total acumulado facturado en el mes.
 * @param {object|number} billingConfigOrPercent - Configuración de facturación (o porcentaje legado).
 * @param {string} periodo - Periodo formateado en año-mes (ej: "2026-05").
 * @param {number} orderCount - Cantidad de pedidos en el periodo.
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

    // Si la DIAN está activa, la base comisionable es el subtotal/ventas netas (antes de IVA/impuestos).
    // Si no está activa, la base comisionable es el total bruto de ventas.
    const baseComisionable = enableDianBilling ? (totalVentasNetas ?? totalVentas) : totalVentas;

    if (billingMode === 'percentage') {
      comisionValor = (baseComisionable * comisionPorcentaje) / 100;
    } else if (billingMode === 'fixed_per_service') {
      comisionValor = orderCount * montoFijoServicio;
    } else if (billingMode === 'flat_monthly') {
      comisionValor = pagoMensualFijo;
    }

    // Agregar el cobro fijo por amortización de emisión de facturas DIAN
    if (enableDianBilling && facturasDianCount > 0) {
      comisionValor += (facturasDianCount * costoPorFacturaDian);
    }
  } else {
    comisionPorcentaje = Number(billingConfigOrPercent) || 1;
    comisionValor = (totalVentas * comisionPorcentaje) / 100;
  }

  // 1. MODO BLAZE: HTTP Endpoint (Cloud Function)
  if (CENTRAL_ENDPOINT && DEV_TOKEN) {
    try {
      console.log("[Telemetry] Reportando vía Cloud Function...");
      const response = await fetch(CENTRAL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEV_TOKEN}`
        },
        body: JSON.stringify({
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
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("[Telemetry] Reporte HTTP enviado exitosamente:", data);
      return;
    } catch (error) {
      console.error("[Telemetry] Error en reporte HTTP:", error);
    }
  }

  // 2. MODO SPARK: Conexión directa a Firestore Central (Escritura segura)
  const centralDb = getCentralFirestore();
  if (centralDb && DEV_TOKEN && CLIENT_ID) {
    try {
      console.log("[Telemetry] Reportando vía Firestore Directo...");
      const reportId = `${CLIENT_ID}_${periodo}`;
      const reportRef = doc(centralDb, "reportesBilling", reportId);

      await setDoc(reportRef, {
        clientId: CLIENT_ID,
        token: DEV_TOKEN, // Enviamos el token para validación por reglas de seguridad
        periodo,
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
        orderCount,
        enableDianBilling,
        updatedAt: serverTimestamp(),
      });

      console.log("[Telemetry] Reporte Firestore directo enviado exitosamente.");
    } catch (error) {
      console.error("[Telemetry] Error en reporte Firestore directo:", error);
    }
    return;
  }

  console.debug("[Telemetry] Modo local: sin conexión central configurada.");
}

// Almacenamiento en memoria para prevenir duplicados de error
const reportedErrorsCache = {};
const NOISE_TO_IGNORE = [
  'failed to fetch',
  'load failed',
  'networkerror',
  'script error',
  'extension',
  'cors',
  'canceled'
];

/**
 * Reporta un error o excepción de la aplicación a la base de datos central de errores.
 *
 * @param {string} errorMsg - Mensaje del error.
 * @param {string} stack - Stack trace completo del error.
 * @param {string} source - Origen del error ('automatic' o 'manual').
 */
export async function reportAppFailureToDeveloper(errorMsg, stack, source = 'automatic') {
  const centralDb = getCentralFirestore();
  if (!centralDb) return;

  const msgLower = (errorMsg || '').toLowerCase();

  // 1. Filtrar en frío errores automáticos de red/extensiones no críticos
  if (source === 'automatic') {
    const isNoise = NOISE_TO_IGNORE.some(patron => msgLower.includes(patron));
    if (isNoise) {
      console.debug(`[Telemetry] Filtro de ruido activo. Omitiendo reporte automático: ${errorMsg}`);
      return;
    }
  }

  // 2. Mecanismo Anti-Duplicado (Throttle de 5 minutos / 300 segundos por firma de error)
  const cleanStack = (stack || '').split('\n')[0] || '';
  const errorHash = `${errorMsg}_${cleanStack}`.replace(/[^a-zA-Z0-9_]/g, '_');
  const now = Date.now();
  if (reportedErrorsCache[errorHash] && (now - reportedErrorsCache[errorHash] < 300000)) {
    console.debug(`[Telemetry] Reporte de error duplicado omitido (Throttled): ${errorMsg}`);
    return;
  }
  reportedErrorsCache[errorHash] = now;

  try {
    const newFailure = {
      clientId: CLIENT_ID || "desconocido",
      niche: "General", // Se puede adaptar al nicho de la instancia generada
      timestamp: new Date().toISOString(),
      errorMsg: errorMsg || "Unknown Error",
      stack: stack || "No stack trace available",
      deviceInfo: navigator.userAgent || "Unknown Device",
      resolved: false,
      source
    };

    const failuresRef = collection(centralDb, "app_failures");
    await addDoc(failuresRef, newFailure);
    console.log(`[Telemetry] Fallo reportado con éxito a la Consola Central.`);
  } catch (error) {
    console.error("[Telemetry] Error al enviar reporte de fallo a la Consola Central:", error);
  }
}

