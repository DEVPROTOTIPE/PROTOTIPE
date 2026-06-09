# Telemetría Centralizada (Ecosistema Telemetry & Billing Sync)

Este servicio encapsula la lógica para reportar acumulados financieros mensuales e históricos de una tienda cliente hacia la Consola Central del Desarrollador (`dev-dashboard` / Firestore Central). Soporta un flujo híbrido adaptable según los recursos del servidor (Spark o Blaze).

---

## 1. Propósito y Casos de Uso
- **Consolidación Multi-tenant**: Unificar en una única base de datos central de telemetría las métricas de todos los clientes (Ventas, Pedidos, Comisiones, Cobros DIAN).
- **Adaptación de Infraestructura**:
  - **Modo Spark (Direct Firestore)**: Escribe de forma directa en el Firestore Central del desarrollador usando credenciales y reglas de seguridad compuestas basadas en tokens.
  - **Modo Blaze (Cloud Functions / API HTTP)**: Realiza llamadas HTTP POST seguras a un endpoint REST si la plataforma se encuentra alojada en un plan pago y dispone de funciones cloud.
- **Prevención de Reworks**: Unificar las variables de entorno y lógica para que la IA los inyecte automáticamente en cualquier bootstrapped app.

---

## 2. Código JS Completo y 100% Funcional

### A. Inicializador Secundario de Firebase (`centralFirebaseService.js`)
Este archivo debe colocarse en `src/services/centralFirebaseService.js`. Implementa inicialización perezosa (lazy load) para evitar colisiones de Hot Reload.

```javascript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Variables de entorno para conectar al Firebase Central de Control
const CENTRAL_API_KEY = import.meta.env.VITE_DEVELOPER_CENTRAL_API_KEY;
const CENTRAL_AUTH_DOMAIN = import.meta.env.VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN;
const CENTRAL_PROJECT_ID = import.meta.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID;
const CENTRAL_STORAGE_BUCKET = import.meta.env.VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET;
const CENTRAL_MESSAGING_SENDER_ID = import.meta.env.VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID;
const CENTRAL_APP_ID = import.meta.env.VITE_DEVELOPER_CENTRAL_APP_ID;

const appName = "centralDevApp";
let centralDbInstance = null;

/**
 * Inicializa y retorna la instancia del Firestore Central de forma segura y unificada.
 * @returns {object|null} Instancia de Firestore Central o null si falta configuración.
 */
export function getCentralFirestore() {
  if (!CENTRAL_API_KEY || !CENTRAL_PROJECT_ID) {
    console.warn("[CentralFirebase] Falta configuración de Firebase Central de Control.");
    return null;
  }

  if (centralDbInstance) {
    return centralDbInstance;
  }

  try {
    let app;
    if (getApps().some(a => a.name === appName)) {
      app = getApp(appName);
    } else {
      app = initializeApp({
        apiKey: CENTRAL_API_KEY,
        authDomain: CENTRAL_AUTH_DOMAIN,
        projectId: CENTRAL_PROJECT_ID,
        storageBucket: CENTRAL_STORAGE_BUCKET,
        messagingSenderId: CENTRAL_MESSAGING_SENDER_ID,
        appId: CENTRAL_APP_ID,
      }, appName);
      console.log("[CentralFirebase] App secundaria centralDevApp inicializada con éxito.");
    }
    centralDbInstance = getFirestore(app);
    return centralDbInstance;
  } catch (err) {
    console.error("[CentralFirebase] Error al inicializar Firebase Central:", err);
    return null;
  }
}
```

### B. Servicio de Telemetría Contable (`telemetryService.js`)
Este archivo debe colocarse en `src/services/telemetryService.js`.

```javascript
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getCentralFirestore } from './centralFirebaseService';

// Variables de entorno para modo Blaze (HTTP)
const CENTRAL_ENDPOINT = import.meta.env.VITE_DEVELOPER_TELEMETRY_ENDPOINT;
const DEV_TOKEN = import.meta.env.VITE_DEVELOPER_TELEMETRY_TOKEN;

// Variables de entorno para modo Spark (Direct Firestore)
const CLIENT_ID = import.meta.env.VITE_DEVELOPER_CLIENT_ID;

/**
 * Reporta los acumulados mensuales de la tienda al panel central del desarrollador.
 *
 * @param {number} totalVentas - Monto total acumulado facturado en el mes (bruto).
 * @param {object} billingConfig - Configuración de facturación del cliente (billingMode, comisiones, etc.).
 * @param {string} periodo - Periodo formateado en año-mes (ej: "2026-06").
 * @param {number} orderCount - Cantidad de pedidos en el periodo.
 * @param {number|null} totalVentasNetas - Ventas sin impuestos/IVA.
 * @param {number} totalImpuestos - Impuestos del periodo.
 * @param {number} facturasDianCount - Cantidad de documentos DIAN procesados.
 */
export async function reportMonthlyBillingToDeveloper(
  totalVentas,
  billingConfig,
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

  if (billingConfig && typeof billingConfig === 'object') {
    billingMode = billingConfig.billingMode || 'percentage';
    comisionPorcentaje = billingConfig.comisionPorcentaje ?? 1;
    montoFijoServicio = billingConfig.montoFijoServicio ?? 0;
    pagoMensualFijo = billingConfig.pagoMensualFijo ?? 0;
    enableDianBilling = billingConfig.enableDianBilling === true;
    costoPorFacturaDian = billingConfig.costoPorFacturaDian ?? 0;

    // Base comisionable según configuración de DIAN (neto vs bruto)
    const baseComisionable = enableDianBilling ? (totalVentasNetas ?? totalVentas) : totalVentas;

    if (billingMode === 'percentage') {
      comisionValor = (baseComisionable * comisionPorcentaje) / 100;
    } else if (billingMode === 'fixed_per_service') {
      comisionValor = orderCount * montoFijoServicio;
    } else if (billingMode === 'flat_monthly') {
      comisionValor = pagoMensualFijo;
    }

    // Sumar tasa por documentos DIAN
    if (enableDianBilling && facturasDianCount > 0) {
      comisionValor += (facturasDianCount * costoPorFacturaDian);
    }
  } else {
    comisionPorcentaje = Number(billingConfig) || 1;
    comisionValor = (totalVentas * comisionPorcentaje) / 100;
  }

  const payload = {
    clientId: CLIENT_ID || "desconocido",
    token: DEV_TOKEN || "",
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
    enableDianBilling
  };

  // 1. MODO BLAZE: Envío vía endpoint HTTP
  if (CENTRAL_ENDPOINT && DEV_TOKEN) {
    try {
      console.log("[Telemetry] Reportando vía Cloud Function...");
      const response = await fetch(CENTRAL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEV_TOKEN}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log("[Telemetry] Reporte HTTP enviado exitosamente.");
        return;
      }
      throw new Error(`HTTP error: ${response.status}`);
    } catch (error) {
      console.error("[Telemetry] Error en reporte HTTP:", error);
    }
  }

  // 2. MODO SPARK: Conexión directa a base de datos central
  const centralDb = getCentralFirestore();
  if (centralDb && DEV_TOKEN && CLIENT_ID) {
    try {
      console.log("[Telemetry] Reportando vía Firestore Directo...");
      const reportId = `${CLIENT_ID}_${periodo}`;
      const reportRef = doc(centralDb, "reportesBilling", reportId);

      await setDoc(reportRef, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      console.log("[Telemetry] Reporte Firestore directo enviado exitosamente.");
    } catch (error) {
      console.error("[Telemetry] Error en reporte Firestore directo:", error);
    }
  }
}
```

---

## 3. Instrucciones y Prompt de Integración para la IA

> [!IMPORTANT]
> **REGLAS DE AUTO-PORTABILIDAD PARA LA IA:**
> Lee este bloque completo antes de comenzar a portar el servicio. Debe ejecutarse con absoluta precisión para evitar reprocesos o dependencias rotas en producción.

### Paso 1: Configurar Variables de Entorno
1. Abre el archivo `.env.local` en la raíz del proyecto destino.
2. Inyecta obligatoriamente las siguientes variables del Desarrollador (solicita los valores reales al usuario o consúltalas de la base de datos central de aprovisionamiento):
   ```ini
   VITE_DEVELOPER_CLIENT_ID="nombre-del-cliente-slug"
   VITE_DEVELOPER_TELEMETRY_TOKEN="token-seguro-del-cliente"
   
   # Conectividad Central (Modo Spark/Blaze)
   VITE_DEVELOPER_CENTRAL_API_KEY="AIzaSy..."
   VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN="prototipe-multi-instancia-control.firebaseapp.com"
   VITE_DEVELOPER_CENTRAL_PROJECT_ID="prototipe-multi-instancia-control"
   VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET="prototipe-multi-instancia-control.appspot.com"
   VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID="xxxxxxxx"
   VITE_DEVELOPER_CENTRAL_APP_ID="1:xxxx:web:xxxx"
   ```

### Paso 2: Crear los Archivos de Servicio
1. Escribe el inicializador en `src/services/centralFirebaseService.js` copiando íntegramente la sección **A** de esta ficha.
2. Escribe el servicio de envío en `src/services/telemetryService.js` copiando íntegramente la sección **B** de esta ficha.

### Paso 3: Configurar Listener de Telemetría Automática
Para automatizar el reporte silencioso sin obligar al administrador a abrir el panel de facturación:
1. Crea o modifica un hook de sincronización global en el arranque de la app (por ejemplo, `useAppConfigSync.js` o `App.jsx`).
2. Implementa una escucha reactiva de los pedidos completados y la configuración en vivo del cliente:
   ```javascript
   import { useEffect } from 'react';
   import { useBilling } from '../hooks/useBilling';
   import { reportMonthlyBillingToDeveloper } from '../services/telemetryService';

   export function useTelemetryAutomation() {
     const { metrics, isLoading } = useBilling();

     useEffect(() => {
       if (!isLoading && metrics) {
         const now = new Date();
         const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
         
         reportMonthlyBillingToDeveloper(
           metrics.totalMes || 0,
           metrics,
           periodo,
           metrics.pedidosMes || 0
         );
       }
     }, [isLoading, metrics]);
   }
   ```
3. Ejecuta `useTelemetryAutomation()` en el nivel raíz del panel administrativo (`AdminLayout.jsx` o `AdminDashboard.jsx`).

### Paso 4: Verificación
1. Ejecuta la compilación local `npm run build` en el proyecto destino para verificar que no haya fallos de empaquetado ni imports perdidos.
