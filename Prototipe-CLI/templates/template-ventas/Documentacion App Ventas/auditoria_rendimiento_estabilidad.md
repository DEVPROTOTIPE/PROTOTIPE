# Auditoría Técnica de Rendimiento, Estabilidad y Costos (App Ventas)

Esta auditoría analiza críticamente el estado actual del código de la aplicación de ventas para identificar cuellos de botella reales en rendimiento, posibles fugas de memoria, escalabilidad de consultas y consumos excesivos de base de datos (Firestore).

---

## 📌 Hallazgos de Severidad Crítica

### 1. Descarga Masiva e Ilimitada de Pedidos Históricos en Segundo Plano (Telemetría de Facturación)
* **Tipo:** Rendimiento / Costo de Firebase (Lecturas) / Consumo de Datos Móviles.
* **Severidad:** 🔴 **Crítico**
* **Ubicación Exacta:** [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/services/billingService.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/billingService.js#L197-L209) (y en la inicialización global en [`useAppConfigSync.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js#L30-L47)).
* **Causa Raíz:** Cada vez que el administrador inicia sesión en la aplicación, se activa un listener global en segundo plano (`subscribeToBillingData`) que escucha **todos** los pedidos en estado `COMPLETED` creados en la historia de la tienda. 
  Si la tienda ha operado por meses y tiene miles de pedidos completados:
  1. Se descargan miles de documentos innecesariamente cada vez que el administrador abre la app.
  2. Consume el ancho de banda del dispositivo móvil del administrador de forma O(N).
  3. Dispara exponencialmente las facturas de lectura de Firestore.
  4. Realiza cálculos de agregación (`calcMetrics`) pesados en el hilo principal de JS sobre miles de registros.
* **Solución Concreta:** Modificar la query `qOrders` en `billingService.js` para filtrar con un límite de tiempo. Dado que la UI del panel de facturación solo muestra el desglose de los **últimos 6 meses**, la query debe incluir una condición de fecha inicializada en los últimos 6 meses (180 días) en lugar de descargar todo el historial.

---

## 📌 Hallazgos de Severidad Alta

### 2. Carga Ilimitada de Pedidos en la Consola del Administrador
* **Tipo:** Escalabilidad / Rendimiento de Renderizado en DOM.
* **Severidad:** 🟠 **Alto**
* **Ubicación Exacta:** [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/services/orderService.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js#L177-L187)
* **Causa Raíz:** La función `subscribeToOrders` escucha la colección completa de pedidos sin límites (`limit` o filtros por estado activo). Con el crecimiento comercial del negocio, el panel de administración intentará renderizar miles de tarjetas de pedidos, ralentizando el navegador hasta congelarlo.
* **Solución Concreta:** Limitar la query activa por defecto a los pedidos de los últimos 30 días, o restringirla usando un límite de seguridad (ej. `limit(100)`). Los pedidos históricos más antiguos deben cargarse bajo demanda mediante un botón o scroll paginado en la UI.

---

## 📌 Hallazgos de Severidad Media

### 3. Ausencia de Virtualización o Renderizado Perezoso (Lazy Loading) en el Catálogo de Productos
* **Tipo:** UX / Fluidez / Rendimiento Móvil.
* **Severidad:** 🟡 **Medio**
* **Ubicación Exacta:** [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ClientCatalog.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx)
* **Causa Raíz:** El listado de productos procesa todos los elementos filtrados y los renderiza en un Grid de golpe. Si un comercio tiene más de 150 productos (con imágenes de alta definición y variantes), la primera carga o la interacción de filtros causará caídas notables de frames (lag) en dispositivos móviles de gama media y baja.
* **Solución Concreta:** Implementar un renderizado perezoso (Lazy Loading) utilizando un componente centinela con `IntersectionObserver` para cargar y mostrar los productos en lotes de 12 a 24 elementos conforme el usuario hace scroll hacia abajo.
