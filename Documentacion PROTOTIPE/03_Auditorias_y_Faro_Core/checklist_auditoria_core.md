# Checklist de Auditoría Técnica y Optimización del Core (App Ventas)

Este checklist detalla los puntos de control exactos para auditar, corregir y optimizar los 5 módulos principales de la aplicación en cuanto a rendimiento, control de excepciones, bugs lógicos, cuellos de botella e inconsistencias de UI en pantallas PC vs. Móvil.

---

## 🔐 MÓDULO 1: Autenticación, Acceso y Seguridad
* **Ubicación principal:** 
  - [LoginPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx)
  - [PortalAuth.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalAuth.jsx)
  - [useAuthInit.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js)

### Puntos a Auditar y Corregir:
- [ ] **Persistencia del Lockout de PIN (Seguridad - Crítico):** 
  - *Causa raíz:* El contador de intentos fallidos (`failedAttempts`) y el estado de bloqueo temporal (`lockouts`) en `PortalAuth.jsx` son puramente locales en memoria reactiva (`useState`). Al refrescar la pantalla (F5), se limpian.
  - *Solución:* Persistir la marca de tiempo del bloqueo y el número de intentos fallidos en `localStorage` o base de datos local asociada al ID del empleado.
- [ ] **Sanitización del Formulario de Registro de Clientes (Bugs - Medio):**
  - *Causa raíz:* En `LoginPage.jsx`, al registrar un cliente por primera vez, es necesario sanitizar los caracteres especiales del número telefónico y asegurar formato regular robusto antes del envío a Firebase.
  - *Solución:* Aplicar regex de limpieza `replace(/\D/g, '')` de forma consistente y validar la longitud de manera uniforme antes de realizar llamadas de Firebase.
- [ ] **Prevención de Sesión Huérfana (Rendimiento - Medio):**
  - *Causa raíz:* Asegurar que el listener en `useAuthInit.js` controle y limpie correctamente estados de carga y pre-vuelo ante cancelaciones de red rápidas.

---

## 🛒 MÓDULO 2: Cliente (E-Commerce PWA) y Visualización de Catálogo
* **Ubicación principal:**
  - [ClientCatalog.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx)
  - [CheckoutModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx)
  - [CartDrawer.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx)
  - [OrderTracking.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/OrderTracking.jsx)
  - [ModalTemplate.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/common/ModalTemplate.jsx)

### Puntos a Auditar y Corregir:
- [ ] **Ajuste de Viewport e Inserción de Teclado Móvil (UI - Alto):**
  - *Causa raíz:* En `ModalTemplate.jsx` y `CheckoutModal.jsx`, el uso de la clase `max-h-[90vh]` combinada con pantallas táctiles compactas y la apertura del teclado móvil bloquea o recorta los inputs de texto interactivos de captura de datos del cliente (nombre, dirección, notas).
  - *Solución:* Redefinir la altura máxima del modal dinámicamente con unidades de viewport de soporte interactivo (`max-h-[85dvh]` / `max-h-[90dvh]`) y asegurar que el foco del input active el scroll hacia el elemento.
- [ ] **Pre-vuelo de Suscripción en Catálogo (Rendimiento - Medio):**
  - *Causa raíz:* En `ClientCatalog.jsx`, las suscripciones de Firestore para catálogo y variantes no controlan eficientemente la reconstrucción de layouts asimétricos o skeletons rápidos, causando Cumulative Layout Shift (CLS) en móviles.
  - *Solución:* Implementar pre-loading shimmer skeleton con tamaños rígidos definidos que mitiguen CLS.
- [ ] **Flujo de Abandono de Checkout (UI/UX - Bajo):**
  - *Causa raíz:* Si el usuario cierra el checkout accidentalmente a la mitad, no hay retención del paso completado en local o confirmación previa.
  - *Solución:* Preguntar por confirmación o persistir temporalmente el estado del formulario de checkout en memoria local.

---

## 🏪 MÓDULO 3: POS Vendedor y Bodega
* **Ubicación principal:**
  - [PortalVendedor.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalVendedor.jsx)
  - [PortalBodega.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalBodega.jsx)

### Puntos a Auditar y Corregir:
- [ ] **Consistencia de Transacción de Stock (Bugs - Crítico):**
  - *Causa raíz:* En `PortalBodega.jsx`, en la función `handleRegister`, se llama de forma asíncrona a `registerStockMovement` de forma externa e independiente al inicio de `runTransaction`. Si la transacción de Firestore para el stock del producto falla o se interrumpe (ej. por límites o colisiones), el log de movimiento ya se habrá registrado, generando logs huérfanos e inconsistencia física de datos.
  - *Solución:* Unificar ambas escrituras dentro de la transacción de Firebase o asegurar que el registro del movimiento ocurra en una cola de promesas consecutivas controladas tras la confirmación exitosa de la transacción.
- [ ] **Sincronización Masiva en Carga de Clientes (Cuello de Botella - Alto):**
  - *Causa raíz:* En `PortalVendedor.jsx`, el efecto de carga inicial invoca `getAllClients()` de Firestore y escribe la lista completa a IndexedDB en frío. Con miles de clientes creados, esto genera lecturas masivas y cuellos de botella severos de base de datos Firestore en cada inicio de sesión del POS.
  - *Solución:* Migrar la sincronización a consultas delta (consultando únicamente clientes con `updatedAt` superior a la última fecha de sincronización guardada localmente) y aplicar paginación.
- [ ] **Cola de Facturación Offline (Bugs/Rendimiento - Alto):**
  - *Causa raíz:* Si el POS del vendedor pierde conexión móvil intermedia, el intento de creación del pedido (`finalizeSale` -> `createPhysicalOrder`) falla sin una cola local de reintentos automáticos estructurada en IndexedDB.
  - *Solución:* Guardar pedidos pendientes de sincronización en una cola IndexedDB y disparar sincronización en background en cuanto la telemetría offline de red retorne a `isOnline = true`.

---

## 🛵 MÓDULO 4: Domicilios y Backoffice (Administrador)
* **Ubicación principal:**
  - [PortalMensajero.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalMensajero.jsx)
  - [AdminOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx)
  - [AdminSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx)

### Puntos a Auditar y Corregir:
- [ ] **Desacoplamiento Estructural de Modales en Mensajero (UI/Atomicidad - Medio):**
  - *Causa raíz:* En `PortalMensajero.jsx`, el componente de visualización `NoteModal` se implementa de manera manual y ad-hoc, duplicando la lógica de backdrop, transiciones y estilos de modal en lugar de heredar de la plantilla global común.
  - *Solución:* Refactorizar `NoteModal` para utilizar `ModalTemplate` de forma consistente.
- [ ] **Estado Offline en el Portal de Reparto (Bugs - Alto):**
  - *Causa raíz:* El mensajero en ruta cambia estados de pedido en zonas con cobertura móvil deficiente. Si la llamada de red falla, el estado visual en el dispositivo no se concilia con Firestore ni se encola de forma local.
  - *Solución:* Almacenar las transiciones de estado de entrega de forma local si la conexión falla, sincronizando cuando vuelva la señal.
- [ ] **Optimización del Panel de Domicilios en Backoffice (Rendimiento - Medio):**
  - *Causa raíz:* `AdminOrders.jsx` maneja listas densas de pedidos activos. Los renders concurrentes al recibir actualizaciones en tiempo real pueden ralentizar la interfaz si no se aplican memorizaciones (`useMemo`, `useCallback`) y layouts ligeros.

---

## 💳 MÓDULO 5: Créditos y Saldos (Fiados)
* **Ubicación principal:**
  - [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx)
  - [ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx)

### Puntos a Auditar y Corregir:
- [x] ~~**Estandarización de Modales de Abonos (UI/Atomicidad - Medio):**~~ 
  - *Causa raíz:* Tanto en `AdminCredits.jsx` como en `ClientCredits.jsx`, los modales interactivos para registrar abonos se codifican manualmente, duplicando estilos e interacciones en lugar de reutilizar `ModalTemplate`.
  - *Solución:* Sustituir los layouts manuales por `ModalTemplate` inyectando los componentes del formulario como hijos.
- [x] ~~**Eficiencia en Reportes Financieros en PDF (Rendimiento/Memoria - Alto):**~~
  - *Causa raíz:* En `AdminCredits.jsx`, `handleExportCreditsReportPDF` requiere la lista completa de órdenes. A gran escala, procesar miles de registros en el hilo principal del cliente mediante jsPDF puede congelar la interfaz del navegador.
  - *Solución:* Aplicar filtros estrictos de fechas o segmentar la generación del reporte, ejecutando en background o limitando los datos leídos.
- [x] ~~**Prevención de Condiciones de Carrera en Abonos Concurrentes (Bugs - Crítico):**~~
  - *Causa raíz:* Al registrar un abono a un crédito, se calcula el nuevo saldo. Si el administrador y el cliente realizan operaciones al mismo tiempo o hay reintentos rápidos, se puede generar una inconsistencia de saldos.
  - *Solución:* Asegurar que la función del abono en el servicio de Firebase utilice transacciones atómicas (`runTransaction`) para recalcular el saldo pendiente a partir del último valor real en la base de datos Firestore.
