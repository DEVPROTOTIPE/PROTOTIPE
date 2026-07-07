# Guía Técnica de Implementación: Centralización de Comisiones Ecosistema Multi-modo

Este manual proporciona el paso a paso y el código fuente necesario para implementar la consolidación de comisiones de múltiples clientes independientes en un panel central del desarrollador, soportando múltiples esquemas de cobro (`percentage`, `fixed_per_service`, `flat_monthly`) tanto en modo **Blaze (Cloud Functions)** como en modo **Spark (Conexión Directa a Firestore)**.

---

## 🛠️ Esquema de Datos y Modos de Facturación

El sistema soporta tres modalidades configurables desde el Dashboard Dev para cada cliente en la colección `clientes_control`:

1. **Porcentaje por Venta (`percentage`):**
   * **Parámetros:** `comisionPorcentaje` (ej. `1.5` para 1.5%).
   * **Fórmula:** `(totalVentas * comisionPorcentaje) / 100`.
2. **Valor Fijo por Servicio (`fixed_per_service`):**
   * **Parámetros:** `montoFijoServicio` (ej. `500` para 500 COP por pedido).
   * **Fórmula:** `orderCount * montoFijoServicio`.
3. **Pago Mensual Fijo (`flat_monthly`):**
   * **Parámetros:** `pagoMensualFijo` (ej. `50000` para 50000 COP al mes).
   * **Fórmula:** `pagoMensualFijo` fijo por mes con actividad.

---

## ⚖️ Estándar Impositivo DIAN (Colombia) y Base Imponible

Para cumplir con la legislación fiscal y evitar sobrecobros indebidos de comisiones al comercio, se define una **Regla de Oro Financiera**:

* **Módulo DIAN Activo (`enableDianBilling: true` - Régimen Común):** La comisión de la plataforma se debe calcular de forma obligatoria **exclusivamente sobre la base imponible** (`subtotal` antes de impuestos/IVA), excluyendo el recaudo impositivo estatal de la fórmula.
* **Módulo DIAN Inactivo (Régimen Simplificado):** La comisión se liquida sobre el `total` de la transacción.

### Estructura de Datos en el Checkout
Al guardar el pedido en Firestore en modo DIAN activo, si el cliente final marca `"¿Requieres Factura Electrónica?"`, se deben capturar obligatoriamente los datos adquirentes en la colección `/orders`:
```json
{
  "subtotal": 100000,
  "impuestosTotal": 19000,
  "total": 119000,
  "requiereFacturaElectronica": true,
  "adquirente": {
    "tipoDocumento": "NIT",
    "documento": "901234567-1",
    "razonSocial": "Empresa de Ejemplo S.A.S.",
    "email": "factura@ejemplo.com"
  }
}
```

Al calcular la telemetría, se debe determinar el monto base condicionalmente:
```javascript
const montoBase = config.enableDianBilling ? order.subtotal : order.total;
```

---

## 📡 Integración Centralizada Híbrida (Spark / Blaze)

Para garantizar la máxima compatibilidad y evitar dependencias de planes de pago (Blaze) para Cloud Functions en fases iniciales, la telemetría está diseñada con una arquitectura híbrida:

1. **Modo Blaze (HTTP):** Consume una Cloud Function si se define `VITE_DEVELOPER_TELEMETRY_ENDPOINT`.
2. **Modo Spark (Direct Firestore):** Realiza escrituras seguras directamente a la base de datos central de control del desarrollador (`prototipe-multi-instancia-control`) si no hay endpoint pero existen las credenciales secundarias.

---

## 🔒 Paso 1: Reglas de Seguridad de Firestore Central (`prototipe-multi-instancia-control`)

Para permitir la escritura directa desde clientes no autenticados en el proyecto central, el Firestore del desarrollador debe tener las siguientes reglas de seguridad configuradas en `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper: verifica que un token es válido y pertenece al clientId dado
    function tokenValido(token, clientId) {
      return exists(/databases/$(database)/documents/tokens/$(token))
        && get(/databases/$(database)/documents/tokens/$(token)).data.clientId == clientId
        && get(/databases/$(database)/documents/tokens/$(token)).data.active == true;
    }

    // Reportes de facturación comisional
    match /reportesBilling/{reportId} {
      // La app cliente escribe su reporte si su token es válido
      allow create, update: if tokenValido(
        request.resource.data.token,
        request.resource.data.clientId
      );
      // Solo el desarrollador autenticado en el Dashboard puede leer y eliminar
      allow read, delete: if request.auth != null;
    }
    
    // Tokens de autenticación de clientes
    match /tokens/{tokenId} {
      allow read, write: if request.auth != null;
    }

    // Configuración de tasas comisionales por cliente Ecosistema
    match /clientes_control/{clientId} {
      allow read: if true; // Lectura pública de tasas de comisión no sensibles
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📡 Paso 2: Configuración del Emisor en las Apps Clientes

Para evitar colisiones de inicializaciones de Firebase en Hot Reload durante el desarrollo, las aplicaciones independientes consumen un singleton de conexión centralizada:

### 📄 src/services/centralFirebaseService.js
```javascript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const CENTRAL_API_KEY = import.meta.env.VITE_DEVELOPER_CENTRAL_API_KEY;
const CENTRAL_AUTH_DOMAIN = import.meta.env.VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN;
const CENTRAL_PROJECT_ID = import.meta.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID;
const CENTRAL_STORAGE_BUCKET = import.meta.env.VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET;
const CENTRAL_MESSAGING_SENDER_ID = import.meta.env.VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID;
const CENTRAL_APP_ID = import.meta.env.VITE_DEVELOPER_CENTRAL_APP_ID;

const appName = "centralDevApp";
let centralDbInstance = null;

export function getCentralFirestore() {
  if (!CENTRAL_API_KEY || !CENTRAL_PROJECT_ID) return null;
  if (centralDbInstance) return centralDbInstance;

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
    }
    centralDbInstance = getFirestore(app);
    return centralDbInstance;
  } catch (err) {
    console.error("Error inicializando Firebase Central:", err);
    return null;
  }
}
```

Tanto `telemetryService.js` como `billingService.js` consumen `getCentralFirestore` importándolo desde este archivo.

### 📄 src/services/telemetryService.js (Emisor)
```javascript
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getCentralFirestore } from './centralFirebaseService';

const CLIENT_ID = import.meta.env.VITE_DEVELOPER_CLIENT_ID;
const DEV_TOKEN = import.meta.env.VITE_DEVELOPER_TELEMETRY_TOKEN;

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

  // MODO SPARK: Escritura segura directa a Firestore Central
  const centralDb = getCentralFirestore();
  if (centralDb && DEV_TOKEN && CLIENT_ID) {
    try {
      const reportId = `${CLIENT_ID}_${periodo}`;
      const reportRef = doc(centralDb, "reportesBilling", reportId);

      await setDoc(reportRef, {
        clientId: CLIENT_ID,
        token: DEV_TOKEN, // Se envía el token para la validación por la función helper de seguridad
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
  }
}
```

---

## 🔑 Paso 3: Aprovisionamiento de Tokens en la Base de Datos Central

Para que cualquier cliente nuevo pueda reportar, el Dashboard Dev (o tú manualmente) debe crear un documento en la colección `/tokens` del Firestore central:

* **ID del Documento:** El token único asignado al cliente (Ej: `ventas-smartfix-dev-token-998877`).
* **Campos del Documento:**
  ```json
  {
    "active": true,
    "clientId": "ventas-smartfix",
    "creadoEn": "[ServerTimestamp]"
  }
  ```

---

## 📋 Checklist de Diagnóstico: ¿Por qué falla la Telemetría?

Si en consola observas el error `Missing or insufficient permissions` al reportar la telemetría, comprueba:
1. **Reglas de Firestore Central:** Asegúrate de que las reglas de `prototipe-multi-instancia-control` no fueron sobreescritas con las reglas normales del cliente.
2. **Existencia del Token:** Verifica que el token configurado en el `.env.local` del cliente (`VITE_DEVELOPER_TELEMETRY_TOKEN`) existe como ID de documento exacto en la colección `/tokens/` de la base de datos central y tiene `"active": true`.
3. **Coincidencia de Client ID:** El `clientId` en el documento del token debe ser idéntico al `VITE_DEVELOPER_CLIENT_ID` del cliente que intenta reportar.

