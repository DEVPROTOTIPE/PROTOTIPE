<!--
{
  "technicalName": "TelemetriaCentralizada",
  "targetPath": "src/components/modules/TelemetriaCentralizada.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "module",
  "niches": []
}
-->

# Telemetría Centralizada (Ecosistema Telemetry & Billing Sync)

> [!NOTE]
> **Arquitectura SDK Directa (CORE-143 & CORE-226):** Este servicio realiza escrituras directas vía Firebase Web SDK a Firestore Central (proyecto `prototipe-ecosistema-control`). En la versión CORE-226, se eliminó el cálculo de comisiones del lado del cliente (`comisionValor`) para mitigar manipulaciones maliciosas de facturación desde el DevTools.

Este servicio encapsula la lógica para reportar acumulados financieros mensuales e históricos de una tienda cliente hacia la Consola Central del Desarrollador (`dev-dashboard` / Firestore Central) de forma directa.

---

## 1. Propósito y Casos de Uso
- **Consolidación Multi-tenant**: Unificar en una única base de datos central de telemetría las métricas de todos los clientes (Ventas, Pedidos, Comisiones, Cobros DIAN).
- **Seguridad Robusta (Zero Trust Client-side — CORE-226)**: El navegador del cliente nunca calcula ni envía la `comisionValor`. Solo reporta hechos observables brutos. Las reglas de seguridad de Firestore Central (`firestore.rules`) bloquean cualquier documento que intente inyectar comisiones.
- **Resiliencia de Red (IndexedDB + Dexie.js — CORE-226)**: Los reportes de errores y de facturación se encolan automáticamente en un Outbox en IndexedDB si se pierde la conexión a internet. Soporta transaccionalidad, capacidad ilimitada y backoff exponencial (1s → 2s → 4s → ... max 60s) para reintentos.

---

## 2. Reglas de Seguridad en Firestore Central (`firestore.rules`)

Para blindar la base de datos central de telemetría (`prototipe-ecosistema-control`) sin costos de Cloud Functions, se aplican las siguientes reglas de seguridad:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Reglas para reportes de facturación de marcas
    match /reportesBilling/{reportId} {
      // Solo permite crear reportes si está autenticado
      // y NO intenta escribir el campo calculado comisionValor
      allow create: if request.auth != null
        && !('comisionValor' in request.resource.data)
        && !('comisionPorcentaje' in request.resource.data);
      
      // Solo lectura para desarrolladores/admins autenticados
      allow read: if request.auth != null;
      
      // Prohibido actualizar o eliminar reportes consolidados desde el cliente
      allow update, delete: if false;
    }

    // Reglas para telemetría de fallos y logs
    match /app_failures/{failureId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

---

## 3. Modelo de Cálculo Reactivo (Developer Cockpit)

Como la `comisionValor` ya no reside en el documento de Firestore Central, la Consola Central de Control (`dev-dashboard`) calcula dinámicamente la comisión al leer la colección `reportesBilling`.

1. **Lectura de Reporte**: El Dashboard obtiene `totalVentas`, `orderCount`, `billingMode` y `enableDianBilling`.
2. **Cruzar con CRM Central**: Busca las tarifas acordadas para el `clientId` (almacenadas en `clientes_control` o CRM central).
3. **Cálculo en Caliente**:
   - `billingMode === 'percentage'`: `(totalVentasNetas * comisionPorcentaje) / 100`
   - `billingMode === 'fixed_per_service'`: `orderCount * montoFijoServicio`
   - `billingMode === 'flat_monthly'`: `pagoMensualFijo`
   - Adición de DIAN si aplica: `facturasDianCount * costoPorFacturaDian`.

---

## 4. Código del Cliente (`telemetryService.js`)

Este archivo se ubica en `src/services/telemetryService.js` en las instancias y en el template del CLI:

```javascript
import { auth } from '../config/firebaseConfig';
import { getCentralFirestore } from './centralFirebaseService';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { telemetryDb, migrateLegacyTelemetryQueue } from './telemetryOutboxDb';

const DEV_TOKEN = import.meta.env.VITE_DEVELOPER_TELEMETRY_TOKEN;
const CLIENT_ID = import.meta.env.VITE_DEVELOPER_CLIENT_ID;
const CLIENT_NICHE = import.meta.env.VITE_NICHE || 'general';

const reportedErrorsCache = {};
const MAX_ATTEMPTS = 5;

function getErrorHash(errorMsg, stack) {
  const cleanStack = (stack || '').split('\n')[0] || '';
  return `${errorMsg}_${cleanStack}`.replace(/[^a-zA-Z0-9_]/g, '_');
}

function generateEventId(type, suffix = '') {
  return `${type}-${CLIENT_ID || 'anon'}-${Date.now()}-${suffix || Math.random().toString(36).slice(2)}`;
}

async function enqueueOfflineReport(type, payload) {
  try {
    const eventId = payload.eventId || generateEventId(type);
    await telemetryDb.outbox.put({
      eventId,
      type,
      payload: { ...payload, eventId },
      status: 'pending',
      attempts: 0,
      createdAt: Date.now(),
      nextAttemptAt: Date.now(),
    });
  } catch (err) {
    console.error('[Telemetry] Error encolando en IndexedDB:', err);
  }
}

export async function processOfflineQueue() {
  if (!navigator.onLine) return;
  try {
    const now = Date.now();
    const pending = await telemetryDb.outbox
      .where('nextAttemptAt').belowOrEqual(now)
      .and(item => item.status === 'pending')
      .sortBy('createdAt');

    if (pending.length === 0) return;

    for (const item of pending) {
      try {
        if (item.type === 'billing') {
          await executeBillingReport(item.payload);
        } else if (item.type === 'failure') {
          await executeFailureReport(item.payload);
        }
        await telemetryDb.outbox.delete(item.eventId);
      } catch (err) {
        const attempts = (item.attempts || 0) + 1;
        if (attempts >= MAX_ATTEMPTS) {
          await telemetryDb.outbox.update(item.eventId, {
            status: 'failed',
            attempts,
            lastError: String(err?.message ?? err),
          });
          continue;
        }
        const backoffMs = Math.min(60000, 1000 * Math.pow(2, attempts));
        await telemetryDb.outbox.update(item.eventId, {
          attempts,
          nextAttemptAt: Date.now() + backoffMs,
          lastError: String(err?.message ?? err),
        });
      }
    }
  } catch (err) {
    console.error('[Telemetry] Error procesando cola offline:', err);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', processOfflineQueue);
  setTimeout(async () => {
    await migrateLegacyTelemetryQueue();
    await processOfflineQueue();
  }, 3000);
}

async function executeBillingReport(payload) {
  const centralDb = getCentralFirestore();
  if (!centralDb) throw new Error("Sin conexión a Firestore Central.");
  const reportId = `${payload.clientId}_${payload.periodo}`;
  await setDoc(doc(centralDb, 'reportesBilling', reportId), {
    ...payload,
    updatedAt: serverTimestamp()
  });
}

async function executeFailureReport(payload) {
  const centralDb = getCentralFirestore();
  if (!centralDb) throw new Error("Sin conexión a Firestore Central.");
  await addDoc(collection(centralDb, 'app_failures'), {
    ...payload,
    createdAt: serverTimestamp()
  });
}

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
    token: DEV_TOKEN || 'desconocido',
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
```

---

## 5. Configuración de Variables de Entorno del Cliente (.env.local)

Las únicas variables necesarias en la instancia del cliente para telemetría son:

```ini
# Identificador y token único del cliente (Autogenerados por la CLI)
VITE_DEVELOPER_CLIENT_ID="mi-cliente-slug"
VITE_DEVELOPER_TELEMETRY_TOKEN="token-seguro-del-cliente"
```
