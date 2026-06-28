<!--
{
  "technicalName": "TelemetriaCentralizada",
  "targetPath": "src/components/modules/TelemetriaCentralizada.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  }
}
-->

# Telemetría Centralizada (Ecosistema Telemetry & Billing Sync - Plan Blaze HTTPS)

Este servicio encapsula la lógica para reportar acumulados financieros mensuales e históricos de una tienda cliente hacia la Cloud Function de la Consola Central del Desarrollador (`dev-dashboard` / Firestore Central). Opera de forma 100% segura mediante peticiones HTTPS (Camino B), eliminando la exposición de credenciales y API keys de la base de datos central en el frontend del cliente.

---

## 1. Propósito y Casos de Uso
- **Consolidación Multi-tenant**: Unificar en una única base de datos central de telemetría las métricas de todos los clientes (Ventas, Pedidos, Comisiones, Cobros DIAN).
- **Seguridad Robusta (Zero Trust Client-side)**: No inyecta ni compila credenciales secundarias de Firebase en el código del cliente. Toda la comunicación se realiza vía HTTPS enviando un Bearer Token secreto que es validado en el servidor por Cloud Functions.
- **Resiliencia de Red (Offline Support)**: Los reportes de errores y de facturación se encolan automáticamente en el `localStorage` del navegador si se pierde la conexión a internet, procesándose en lote tan pronto se detecta el estado en línea (`navigator.onLine`).

---

## 2. Lógica del Servidor (Cloud Functions - Central Control)

La Cloud Function se aloja en el proyecto central (`prototipe-ecosistema-control`) en `functions/index.js` y expone un endpoint HTTPS:

```javascript
const functions = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

exports.reportTelemetry = functions.runWith({ maxInstances: 10 }).https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send({ error: "Only POST requests are allowed" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).send({ error: "Unauthorized: Missing Authorization header" });
    return;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const tokenDoc = await db.collection("tokens").doc(token).get();
    if (!tokenDoc.exists) {
      res.status(401).send({ error: "Unauthorized: Invalid developer token" });
      return;
    }

    const tokenData = tokenDoc.data();
    const clientId = tokenData.clientId;
    if (!clientId) {
      res.status(400).send({ error: "Bad Request: Token has no associated Client ID" });
      return;
    }

    const { type, ...payload } = req.body;
    const now = FieldValue.serverTimestamp();

    if (type === "billing") {
      const { periodo, totalVentas, totalVentasNetas, totalImpuestos, facturasDianCount, comisionValor } = payload;
      
      const reportId = `${clientId}_${periodo}`;
      await db.collection("reportesBilling").doc(reportId).set({
        ...payload,
        clientId,
        token,
        updatedAt: now
      }, { merge: true });

      await db.collection("clientes_control").doc(clientId).set({
        billingTelemetry: {
          lastPeriod: periodo,
          lastSales: totalVentas ?? 0,
          lastCommission: comisionValor ?? 0,
          lastUpdate: now
        }
      }, { merge: true });

      res.status(200).send({ success: true, message: "Billing telemetry processed" });
      return;

    } else if (type === "failure") {
      await db.collection("app_failures").add({
        ...payload,
        clientId,
        token,
        createdAt: now
      });

      res.status(200).send({ success: true, message: "Failure telemetry processed" });
      return;
    }

  } catch (error) {
    res.status(500).send({ error: "Internal Server Error", details: error.message });
  }
});
```

---

## 3. Código del Cliente (`telemetryService.js`)

Este archivo debe colocarse en `src/services/telemetryService.js`:

```javascript
import { auth } from '../config/firebaseConfig';

const CENTRAL_ENDPOINT = import.meta.env.VITE_DEVELOPER_TELEMETRY_ENDPOINT;
const DEV_TOKEN = import.meta.env.VITE_DEVELOPER_TELEMETRY_TOKEN;
const CLIENT_ID = import.meta.env.VITE_DEVELOPER_CLIENT_ID;
const CLIENT_NICHE = import.meta.env.VITE_NICHE || 'general';

const reportedErrorsCache = {};
const OFFLINE_QUEUE_KEY = 'telemetry_offline_queue';

function getErrorHash(errorMsg, stack) {
  const cleanStack = (stack || '').split('\n')[0] || '';
  return `${errorMsg}_${cleanStack}`.replace(/[^a-zA-Z0-9_]/g, '_');
}

function enqueueOfflineReport(type, payload) {
  try {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    if (queue.length > 30) queue.shift();
    queue.push({ type, payload, timestamp: new Date().toISOString() });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('[Telemetry] Error al encolar offline:', err);
  }
}

export async function processOfflineQueue() {
  if (!navigator.onLine) return;
  try {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    const remainingQueue = [];
    for (const report of queue) {
      try {
        if (report.type === 'billing') {
          await executeBillingReport(report.payload);
        } else if (report.type === 'failure') {
          await executeFailureReport(report.payload);
        }
      } catch (err) {
        remainingQueue.push(report);
      }
    }
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
  } catch (err) {
    console.error('[Telemetry] Error procesando cola offline:', err);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', processOfflineQueue);
  setTimeout(processOfflineQueue, 3000);
}

async function postTelemetry(payload) {
  if (!CENTRAL_ENDPOINT || !DEV_TOKEN) {
    throw new Error("Credenciales HTTPS de telemetría no configuradas.");
  }
  const response = await fetch(CENTRAL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEV_TOKEN}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

async function executeBillingReport(payload) {
  await postTelemetry({ type: "billing", ...payload });
}

async function executeFailureReport(payload) {
  await postTelemetry({ type: "failure", ...payload });
}

export async function reportMonthlyBillingToDeveloper(totalVentas, billingConfig, periodo, orderCount = 0) {
  // Cálculo de comisiones según config...
  const payload = {
    clientId: CLIENT_ID,
    totalVentas,
    periodo,
    orderCount,
    // ...resto de comisiones
  };
  
  if (!navigator.onLine) {
    enqueueOfflineReport('billing', payload);
    return;
  }
  try {
    await executeBillingReport(payload);
  } catch (e) {
    enqueueOfflineReport('billing', payload);
  }
}

export async function reportAppFailureToDeveloper(errorMsg, stack, source = 'automatic') {
  // Lógica de throttling y exclusión de ruido...
  const extendedPayload = {
    clientId: CLIENT_ID,
    niche: CLIENT_NICHE,
    errorMsg,
    stack,
    source,
    environment: { url: window.location.href, userAgent: navigator.userAgent }
  };
  
  if (!navigator.onLine) {
    enqueueOfflineReport('failure', extendedPayload);
    return;
  }
  try {
    await executeFailureReport(extendedPayload);
  } catch (e) {
    enqueueOfflineReport('failure', extendedPayload);
  }
}
```

---

## 4. Configuración de Variables de Entorno del Cliente (.env.local)

Las únicas variables necesarias en la instancia del cliente para telemetría son:

```ini
# Identificador y token único del cliente (Autogenerados por la CLI)
VITE_DEVELOPER_CLIENT_ID="mi-cliente-slug"
VITE_DEVELOPER_TELEMETRY_TOKEN="token-seguro-del-cliente"

# Endpoint oficial de la Cloud Function de Control Central
VITE_DEVELOPER_TELEMETRY_ENDPOINT="https://us-central1-prototipe-ecosistema-control.cloudfunctions.net/reportTelemetry"
```
