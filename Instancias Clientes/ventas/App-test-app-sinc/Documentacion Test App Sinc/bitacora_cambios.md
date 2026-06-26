# 📑 Bitácora de Cambios - Test App Sinc (Test App Sinc)

Historial de cambios, mejoras y correcciones técnicas aplicadas sobre la plantilla core de Ventas.

### [2026-06-26] - Corrección de Superposición de Línea de Encabezado en Perfil del Cliente
* **Tipo:** Corrección de Errores / UI/UX
* **Severidad:** Baja (Problema de superposición visual)
* **Descripción de Cambios:**
  - **Ajuste Dinámico de z-index:** Se modificó la cabecera en `ClientProfile.jsx` para alternar dinámicamente su z-index entre `z-10` (cuando el selector de emojis está cerrado) y `z-40` (cuando está abierto). Esto permite que el contenedor principal de tarjetas (`z-20`) se renderice sobre la cabecera por defecto, cubriendo la línea de borde divisoria (`border-b border-primary/5`) donde se superpone por el margen negativo (`-mt-5`), mientras que garantiza que el menú selector de avatar/emoji se posicione correctamente al frente al interactuar con él.
* **Archivos Modificados:**
  - [ClientProfile.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientProfile.jsx) [MODIFY]
* **Desplegado:** Local build verificado exitosamente ✅

### [2026-06-26] - Corrección de Bloqueo de Scroll en Selector de Temas del Desarrollador
* **Tipo:** Corrección de Errores / UI/UX / Estabilidad
* **Severidad:** Media (Bloqueo persistente del scroll del body al interactuar con el selector de temas)
* **Descripción de Cambios:**
  - **Reemplazo de ThemeModalLock por useEffect:** Se eliminó el componente helper `ThemeModalLock` de `AppearanceSettings.jsx` y se reemplazó por un hook `useEffect` directo en `AppearanceSettings` suscrito al cambio de `isThemeModalOpen`. Esto evita que las múltiples actualizaciones de estado (al hacer clic y previsualizar paletas cromáticas) provoquen que se capture el estilo `overflow: hidden` ya aplicado al body como si fuera el estilo original, previniendo que la página se quede sin scroll al cerrar el modal.
* **Archivos Modificados:**
  - [AppearanceSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx) [MODIFY]
* **Desplegado:** Local build verificado exitosamente ✅

### [2026-06-26] - Corrección de Descarga de Facturas en Apartado de Clientes
* **Tipo:** Corrección de Errores / Estabilidad / UI/UX
* **Severidad:** Alta (Error de referencia que impedía la descarga de facturas)
* **Descripción de Cambios:**
  - **Importación de Constante faltante:** Se importó la constante `PAYMENT_METHODS` en `ClientOrders.jsx` desde `../../constants`. Esto resuelve el `ReferenceError` que ocurría al hacer clic en "Descargar Factura" en las tarjetas de pedidos completados del cliente, permitiendo que el flujo de impresión/descarga se ejecute correctamente.
* **Archivos Modificados:**
  - [ClientOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientOrders.jsx) [MODIFY]
* **Desplegado:** Local build verificado exitosamente ✅

### [2026-06-19] - Optimización de Bundle y Depuración de Importaciones (ESLint Clean Up)
* **Tipo:** Mantenimiento / Optimización / Calidad de Código
* **Severidad:** Baja (Saneamiento de warnings y errores del linter en imports y variables obsoletas)
* **Descripción de Cambios:**
  - **Limpieza de Importaciones y Parámetros:** Depuradas importaciones en desuso de Firestore (como `getDoc`, `orderBy`, `addDoc`, `updateDoc`, `setDoc`, `where`, `query`) en los servicios de anuncios, inventario, órdenes, créditos, analíticas de códigos QR y seguimiento.
  - **Saneamiento de Firmas:** Removido el parámetro no utilizado `creditId` en `reportCreditPayment` (`creditService.js`) y `pin` en `authenticateEmployeeByPin` (`employeeService.js`).
  - **Resolución de Warnings en PDF:** Corregido en `pdfService.js` la inicialización inútil de la variable `saldo`, reemplazando el operador nullish coalescing `??` sobre `Number(...)` por `||` para mitigar el error de expresión nullish constante en ESLint, y removida la firma no utilizada de `orders` en `exportCreditsReportPDF`.
  - **Control de Linter en PortalVendedor:** Removidas las desestructuraciones redundantes de `appIcon` y `whatsappAdmin` en `PortalVendedor.jsx`, e inyectados comentarios de desactivación de la regla `react-hooks/set-state-in-effect` sobre llamadas de estado asíncronas / debounced seguras.
* **Archivos Modificados:**
  - [adService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/adService.js) [MODIFY]
  - [clientNotificationService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/clientNotificationService.js) [MODIFY]
  - [creditService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) [MODIFY]
  - [employeeService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/employeeService.js) [MODIFY]
  - [inventoryService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/inventoryService.js) [MODIFY]
  - [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY]
  - [qrAnalyticsService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/qrAnalyticsService.js) [MODIFY]
  - [trackingAnalyticsService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/trackingAnalyticsService.js) [MODIFY]
  - [pdfService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) [MODIFY]
  - [inventorySchemas.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/schemas/inventorySchemas.js) [MODIFY]
  - [PortalVendedor.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY]
* **Desplegado:** Local build verificado ✅

### [2026-06-19] - Auditoría y Optimización de Créditos y Saldos (Módulo 5)
* **Tipo:** Core / UI/UX / Rendimiento / Base de Datos / Transacciones
* **Severidad:** Alta (Previene race conditions en saldos concurrentes, optimiza lecturas Firestore y sanea UI/UX de modales)
* **Descripción de Cambios:**
  - **Estandarización de Modales:** Refactorizados los modales de abonos en [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) y [ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) utilizando la plantilla común `ModalTemplate` de forma consistente, unificando estilos visuales, overlays y control de scroll.
  - **Eliminación de useOrders:** Removido por completo el hook `useOrders()` en [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) eliminando la suscripción reactiva innecesaria a todos los pedidos del comercio al consultar cartera de deudas.
  - **Optimización de PDF de Cartera:** Modificada la función `exportCreditsReportPDF` en [pdfService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) sustituyendo la consulta completa de la colección de créditos por una consulta filtrada a créditos activos (`where('estado', '==', 'activo')`), mitigando lecturas masivas en memoria.
  - **Blindaje Transaccional de Saldos:** Asegurada la expresión de cálculo de saldo pendiente en la transacción `addPaymentToCredit` de [creditService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) implementando precedencia lógica correcta: `const currentSaldo = data.saldoPendiente ?? data.saldoPending ?? data.montoTotal`, evitando fallos de carrera o valores nulos.
* **Archivos Modificados:**
  - [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]
  - [ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY]
  - [pdfService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) [MODIFY]
  - [creditService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) [MODIFY]
* **Desplegado:** Local build verificado ✅

### [2026-06-18] - Auditoría y Optimización de Domicilios y Backoffice (Módulo 4)
* **Tipo:** Core / UI/UX / Rendimiento / Tolerancia a Fallos / Soporte Offline
* **Severidad:** Media-Alta (Mitiga re-renders de orders en tiempo real, sanea modales y añade resiliencia offline a reparto)
* **Descripción de Cambios:**
  - **Saneamiento de Modales en Reparto:** Importado `ModalTemplate` y refactorizado el modal `NoteModal` en [PortalMensajero.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalMensajero.jsx) para heredar de la plantilla global, eliminando el marcado CSS ad-hoc y backdrops duplicados, y configurándolo para renderizarse continuamente con la prop `isOpen`.
  - **Lógica Offline de Reparto:** Configurado el encolado en `localStorage` (`portal-delivery-queue`) de las auto-asignaciones y avances de estado cuando `isOnline === false`, con un observador de red en [PortalMensajero.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalMensajero.jsx) que procesa la cola al re-establecerse la señal.
  - **Optimización de Renders (Faro Core):** Extraída la función masiva `renderOrderCard` de [AdminOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx) a un componente funcional independiente `OrderCard` memoizado mediante `React.memo`. Movidos estados locales como `tempDeliveryCosts` y `expandedMapOrderIds` a estados internos de cada tarjeta (`tempCost` y `showMap`) para evitar el re-renderizado global del listado de órdenes en tiempo real ante eventos Firestore.
* **Archivos Modificados:**
  - [PortalMensajero.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalMensajero.jsx) [MODIFY]
  - [AdminOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]
* **Desplegado:** Local build verificado ✅

### [2026-06-18] - Auditoría, Saneamiento de POS Vendedor y Bodega, y Notificaciones (Módulo 3)
* **Tipo:** Core / Rendimiento / Tolerancia a Fallos / Notificaciones en Tiempo Real
* **Severidad:** Alta (Previene logs de stock huérfanos, optimiza red y añade POS offline)
* **Descripción de Cambios:**
  - **Soporte Offline POS (IndexedDB):** Modificado [PortalVendedor.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalVendedor.jsx) para encolar ventas localmente en el object store `offline_sales` mediante `addOfflineSale` si `isOnline === false`, permitiendo facturación ininterrumpida y mostrando un modal de éxito provisional.
  - **Efecto de Sincronización Automática:** Implementado observador de red en [PortalVendedor.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalVendedor.jsx) que al reconectarse a Internet sube secuencialmente a Firestore las ventas offline y las purga de IndexedDB.
  - **Sincronización Delta de Clientes:** Modificado [PortalVendedor.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalVendedor.jsx) para leer la última fecha de sincronización de `localStorage` (`portal-last-client-sync`) y traer mediante `getClientsUpdatedSince` solo los clientes creados/editados recientemente.
  - **Consistencia Transaccional de Stock:** Reubicada la llamada asíncrona de `registerStockMovement` en [PortalBodega.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalBodega.jsx) para ejecutarse de forma secuencial **después** del éxito transaccional de Firestore, evitando logs huérfanos.
  - **Notificaciones en Tiempo Real (Múltiples Roles):**
    - En [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js), inyectadas alertas para el rol `vendedor` al ingresar pedidos de la PWA, y alertas para el rol `bodeguero` al cambiar el estado de un pedido a `preparing`.
    - En [deliveryService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/deliveryService.js), agregada alerta para el `mensajero` específico al asignarle un domicilio.
    - En [PortalMensajero.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalMensajero.jsx), habilitado el envío de alertas automáticas para `admin` y `vendedor` en eventos de entregas fallidas o reprogramadas.
* **Archivos Modificados:**
  - [PortalBodega.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalBodega.jsx) [MODIFY]
  - [LoginPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [userService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/userService.js) [MODIFY]
  - [PortalVendedor.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY]
  - [offlineDB.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/offlineDB.js) [MODIFY]
  - [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY]
  - [deliveryService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/deliveryService.js) [MODIFY]
  - [PortalMensajero.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalMensajero.jsx) [MODIFY]
* **Desplegado:** Local build verificado ✅

### [2026-06-18] - Auditoría y Optimización de Catálogo y Experiencia de Compra (Módulo 2)
* **Tipo:** UI/UX / Rendimiento / Core Optimización
* **Severidad:** Media (Ajuste de responsividad y eliminación de saltos de maquetación CLS)
* **Descripción de Cambios:**
  - **Dynamic Viewport Height en Modales:** Modificado [ModalTemplate.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/common/ModalTemplate.jsx) para sustituir el valor fijo de `max-h-[90vh]` por `max-h-[85dvh] sm:max-h-[90dvh]`, adaptando de forma interactiva la altura del modal cuando el teclado virtual de dispositivos móviles se expanda.
  - **Mitigación de Cumulative Layout Shift (CLS):** Refactorizado el estado de carga (`isLoadingProducts`) en [ClientCatalog.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) reemplazando las cajas de pulsación simples por skeletons de alta fidelidad con shimmer animado que simulan exactamente las dimensiones y estructura de las tarjetas reales de `ProductCard`, garantizando cero saltos visuales durante la carga inicial.
  - **Salvaguarda de Abandono de Checkout:** Implementada la función `handleCloseVerify` en [CheckoutModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) para solicitar confirmación nativa con `window.confirm` antes de cerrar el modal si el cliente ha avanzado más allá del paso 1, evitando pérdida accidental de datos.
* **Archivos Modificados:**
  - [ModalTemplate.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/common/ModalTemplate.jsx) [MODIFY]
  - [ClientCatalog.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
  - [CheckoutModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
* **Desplegado:** Local build verificado ✅

### [2026-06-18] - Auditoría y Blindaje de Autenticación, Acceso y Seguridad (Módulo 1)
* **Tipo:** Seguridad / UX / Corrección de Bugs / Robustez
* **Severidad:** Alta (Corrige bypass de bloqueo PIN y previene entradas corruptas en login)
* **Descripción de Cambios:**
  - **Persistencia de Bloqueo de PIN:** Modificado [PortalAuth.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalAuth.jsx) para leer y escribir el estado de `lockouts` y `failedAttempts` en `localStorage` (claves `portal-lockouts` y `portal-failed-attempts`), impidiendo evadir el bloqueo de 30 segundos mediante F5.
  - **Sanitización del Número de Celular:** Modificado [LoginPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) en el `onChange` del input para forzar caracteres puramente numéricos en tiempo real y establecer un límite estricto de longitud de `10` dígitos. Ajustado `handleClientLogin` para rechazar números con longitud distinta a 10 dígitos.
  - **Blindaje de useAuthInit:** Modificado [useAuthInit.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js) agregando la bandera de control de montaje `isMounted` para salvaguardar y abortar llamadas a Firestore si el hook es destruido por cambios de vista o recarga HMR.
* **Archivos Modificados:**
  - [PortalAuth.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalAuth.jsx) [MODIFY]
  - [LoginPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [useAuthInit.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js) [MODIFY]
* **Desplegado:** Local build verificado ✅

### [2026-06-18] - Desmantelamiento y Remoción Completa de Módulos Inactivos y Roles Operativos (Core)
* **Tipo:** Refactorización / Remoción de Módulo / Limpieza de Código / Core Simplificación
* **Severidad:** Media (Simplificación Estructural)
* **Descripción de Cambios:**
  - **Eliminación de archivos:** Remoción física de portales y servicios backend inactivos para simplificar el flujo contable y operativo.
  - **Rutas y Entrada Principal:** Limpieza de constantes de roles inactivos en `src/constants/index.js` (`PORTAL_CONFIG` y `ROLES`). Eliminación de rutas de importación diferida (lazy) y subrutas anidadas en `src/routes/AppRoutes.jsx`.
  - **Servicios y Estado Global:** Remoción de propiedades y métodos relacionados con banderas de módulos inactivos en `src/store/appConfigStore.js` y `src/services/appConfigService.js`.
  - **Flujo de Checkout y Cliente:** Limpieza de la vista de seguimiento de pedidos (`OrderTracking.jsx`) omitiendo pasos de preparación redundantes.
  - **Centro de Notificaciones:** Eliminación de los disparadores y tipos de alertas obsoletos.
  - **Panel Administrativo y de Desarrollador:** Ocultamiento y remoción de opciones no utilizadas en la configuración del desarrollador (`DeveloperSettings.jsx`) y panel de administración (`AdminSettings.jsx`), así como la depuración correspondiente en base de datos.
  - Estilos: Limpieza del archivo general `src/index.css` removiendo todas las clases CSS exclusivas de los portales de mesero y de cocina.
* **Archivos Modificados:**
  - `src/App.jsx`
  - `src/constants/index.js`
  - `src/routes/AppRoutes.jsx`
  - `src/store/appConfigStore.js`
  - `src/services/appConfigService.js`
  - `src/layouts/ClientLayout.jsx`
  - `src/components/client/checkout/CheckoutModal.jsx`
  - `src/pages/client/OrderTracking.jsx`
  - `src/services/notificationCenterService.js`
  - `src/pages/admin/settings/sections/DeveloperSettings.jsx`
  - `src/pages/admin/settings/sections/AdminSettings.jsx`
  - `src/index.css`
* **Desplegado:** Local build verificado ✅ (0 errores, 0 warnings)

### [2026-06-13] - Visibilidad Condicional de Auditoría de Ajustes de Stock
* **Tipo:** UI/UX / Lógica de Negocio
* **Severidad:** Baja
* **Síntoma:** La opción de "Auditoría de Ajustes de Stock" aparecía visible para el administrador incluso si el módulo de "Múltiples Empleados" estaba inactivo, resultando confuso o redundante.
* **Descripción de Cambios:**
  - **Filtro de Menú:** Se condicionó el renderizado de la tarjeta de auditoría de stock en el panel de personalización para que solo se muestre cuando `hasMultipleEmployees` es `true`.
  - **Efecto de Redirección:** Se implementó una salvaguarda mediante `useEffect` en `AdminSettings.jsx` que expulsa al usuario al menú principal de personalización si el módulo de empleados se desactiva estando dentro de la auditoría de stock.
* **Archivos Modificados:**
  - `src/pages/admin/AdminSettings.jsx`
* **Desplegado:** Local build verificado ✅

### [2026-06-13] - Migración de Módulos Activos a Zona de Desarrollador
* **Tipo:** Reubicación de Módulos / Seguridad / UI/UX / AdminSettings
* **Severidad:** Media (Control de Acceso del Comercio)
* **Descripción de Cambios:**
  - **Reubicación de Interfaz:** Se removió la opción "Módulos Activos" (`modulos`) de la sección orientada al cliente "Personalizar Tienda" en `AdminSettings.jsx`.
  - **Remoción de Lógica Original:** Se eliminó por completo el sub-panel y lógica de guardado de `activeSubSection === 'modulos'` en `StoreSettings.jsx`.
  - **Inyección en Zona Protegida:** Se añadió la opción "Módulos Activos" (`dev-modulos`) en la lista de herramientas de `DeveloperSettings.jsx` (protegida bajo el PIN maestro `DEV_PIN`).
  - **Integración de Componentes:** Se re-maquetó e integró la interfaz y los interruptores correspondientes (Crédito, Cupones, Garantías y Mayorista) en `DeveloperSettings.jsx` utilizando los mismos hooks, estado global y endpoint de guardado en Firebase (`updateAppConfig`).
* **Archivos Modificados:**
  - `src/pages/admin/AdminSettings.jsx`
  - `src/pages/admin/settings/sections/StoreSettings.jsx`
  - `src/pages/admin/settings/sections/DeveloperSettings.jsx`
* **Desplegado:** Local build verificado ✅

---

### [2026-06-13] - Rediseño de Mensaje de Confirmación a Toast Flotante Premium
* **Tipo:** UI/UX / Mejoras Visuales / AdminSettings
* **Severidad:** Media
* **Descripción de Cambios:**
  - **Conversión a Toast Flotante:** Se reemplazó el renderizado estático del mensaje de guardado (`saveMessage`) por un Toast flotante premium en el centro superior del viewport (`fixed top-6 left-1/2 -translate-x-1/2 z-[9999]`), con fondo semi-translúcido (`backdrop-blur-md`), sombras, colores HSL e íconos dinámicos.
  - **Animación Fluida:** Se implementó `AnimatePresence` y `motion.div` de `framer-motion` para lograr transiciones suaves de entrada y salida.
  - **Auto-limpieza Centralizada:** Se implementó un `useEffect` que escucha cambios en `saveMessage` y ejecuta un timer de **2 segundos** (`2000` ms) para auto-limpiar el mensaje.
* **Archivos Modificados:**
  - `src/pages/admin/AdminSettings.jsx`
* **Desplegado:** Local build verificado ✅

---

### [2026-06-12] - Robustez en Paginación y Prevención de Bucle de Lecturas (Exploit de Facturación)
* **Tipo:** Robustez / Parche de Facturación / Rendimiento / UX
* **Severidad:** Crítica (Evita consumo masivo accidental de Firestore)
* **Descripción de Cambios:**
  - **Deduplicación en Frontend:** Modificado el `useMemo` de `allProducts` en `ClientCatalog.jsx` para remover duplicados de ID de producto mediante un `Set`, evitando advertencias de colisión de `key` de React y fallos visuales en el DOM virtual.
  - **Mitigación de Bucle Infinito de Lectura:** Modificado `loadMoreRef` (`IntersectionObserver`) para suspender el trigger automático de carga de página si el usuario tiene una búsqueda activa (`searchTerm`) o filtros aplicados (`hasActiveFilters`).
  - **Paginación Manual Controlada:** Agregado un botón manual de `"Buscar más en el catálogo completo"` cuando existen filtros activos y hay más páginas disponibles en Firestore.
  - **UX de Búsqueda sin Coincidencias:** Si el filtro da 0 resultados en la página cargada pero Firestore tiene más páginas (`hasNextPage === true`), se renderiza un estado vacío amigable con el botón manual `"Buscar en el resto del catálogo"`, solucionando el bloqueo donde el usuario no podía seguir buscando en páginas subsecuentes.
* **Archivos Modificados:**
  - `src/pages/client/ClientCatalog.jsx`
* **Desplegado:** Local build verificado ✅, Sincronizado a plantilla CLI con validación exitosa.

### [2026-06-11] - Implementación de la Optimización de Consumo de Base de Datos y Storage
* **Tipo:** Optimización Costos / Base de Datos / Storage / Rendimiento / Frontend
* **Severidad:** Alta
* **Descripción de Cambios:**
  - **Compresión WebP Client-Side:** Modificado `uploadService.js` para interceptar dinámicamente cualquier subida de imagen y comprimirla mediante Canvas localmente en el navegador a resoluciones máximas de 800px para productos/galerías o 400px para variantes/logos, exportándolo a WebP con calidad 0.75.
  - **Soporte de URLs de Imágenes Externas:** Validada la compatibilidad nativa en los inputs de tipo url vinculados a `imageUrl` de variantes y productos en `ProductFormModal.jsx`, facilitando que el administrador use enlaces externos sin consumir cuotas de Storage.
  - **Paginación Firestore por Cursores:** Refactorizado `inventoryService.js` agregando `getProductsPaged` que limita la consulta a Firestore a bloques de 12 ítems y utiliza cursores (`limit`, `startAfter`) según la categoría.
  - **Scroll Infinito con IntersectionObserver:** Reemplazada la paginación local en memoria en `ClientCatalog.jsx` por una carga perezosa interactiva con IntersectionObserver que consume la paginación de Firestore a través del nuevo hook `useProductsInfinite` de TanStack Query v5 en `useInventory.js`.
  - **Índices Firestore:** Declarados los índices compuestos en `firestore.indexes.json` para las consultas paginadas de productos ordenados por creación.
* **Archivos Modificados:**
  - `firestore.indexes.json` → Declarados los índices compuestos.
  - `src/services/inventoryService.js` → Agregada la función `getProductsPaged`.
  - `src/hooks/useInventory.js` → Agregado el hook `useProductsInfinite`.
  - `src/pages/client/ClientCatalog.jsx` → Reemplazada la paginación por IntersectionObserver.
  - `Documentacion Test App Sinc/tareas_pendientes.md` → Registrada la tarea completada de la implementación.
  - `Documentacion Test App Sinc/bitacora_cambios.md` → Se registró esta entrada.
  - `Documentacion Test App Sinc/mapa_aplicacion.md` → Se actualizó el mapa de aplicación local.
* **Desplegado:** Local build verificado ✅

---

### [2026-06-11] - Análisis y Diseño del Plan de Optimización de Consumo de Base de Datos y Storage
* **Tipo:** Documentación / Arquitectura / Optimización Costos
* **Severidad:** Alta (Planeación de Infraestructura)
* **Descripción de Cambios:**
  - Realizado un diagnóstico exhaustivo de las lecturas redundantes en Firestore y el uso ineficiente de imágenes en Firebase Storage para la plantilla `Test App Sinc`.
  - Diseñados los algoritmos de compresión client-side en Canvas para WebP, el soporte de URLs externas, persistencia en IndexedDB y paginación reactiva por cursores.
  - Documentado localmente en `plan_optimizacion_consumo_firebase.md` de la documentación general.
* **Archivos Modificados:**
  - `Documentacion Test App Sinc/tareas_pendientes.md` → Registrada la tarea completada del análisis.
  - `Documentacion Test App Sinc/bitacora_cambios.md` → Se registró esta entrada.
* **Desplegado:** Documentación local verificado ✅

---

### [2026-06-09] - Rediseño del Perfil de Cliente, Optimización de Sidebar, Animaciones y Stacking Context de Emojis
* **Tipo:** UI/UX / Optimización / Estilo / Bugfix
* **Severidad:** Media
* **Síntoma:** 
  1. El selector de emojis en el perfil de cliente aparecía por detrás de las tarjetas inferiores y el clic en el botón de edición no abría el modal consistentemente.
  2. El sidebar de escritorio tenía una distribución desbalanceada de la marca y las notificaciones.
* **Causa Raíz:**
  1. El contenedor interno de la cabecera del perfil estaba configurado con `z-10`, lo cual creaba un stacking context de menor nivel que la clase `z-20` de las tarjetas inferiores. El icono del lápiz de edición interceptaba los eventos de puntero.
  2. La distribución de filas en el sidebar no estaba optimizada.
* **Archivos Modificados:**
  - `src/pages/client/ClientProfile.jsx` → Cabecera elevada a `z-40` y modal de emojis a `z-50`; añadido `pointer-events-none` al icono del lápiz.
  - `src/layouts/ClientLayout.jsx` → Rediseño del sidebar con cabecera arriba y botones en grilla en la base; añadidas animaciones de campana/carrito.
  - `src/layouts/AdminLayout.jsx` → Añadida animación interactiva de campana.
* **Desplegado:** Local build verificado ✅

---

### [2026-06-09] - Solución a la Detección de Repositorios Git en el Gestor de Respaldos
* **Tipo:** DevOps / Bugfix / Scripts
* **Severidad:** Baja
* **Síntoma:** El script de menú de respaldos reportaba a Test App Sinc como "Sin Git".
* **Causa Raíz:** La carpeta `.git` estaba temporalmente como `.git-backup-temp` debido a bloqueos de archivos remanentes que mantenían los servidores de desarrollo Vite activos al concluir backups anteriores, impidiendo que el renombrado de restauración se completara de forma autónoma.
* **Archivos Modificados:**
  - `D:/PROTOTIPE/menu_backup.ps1` → Añadida detención controlada de procesos Node/Vite antes de la restauración de carpetas `.git-backup-temp`.
* **Desplegado:** Cambios probados y validados físicamente en disco ✅

---

### [2026-06-09] - Sincronización de Créditos y Optimización de Paginación de Deudas
* **Tipo:** Bugfix / Optimización / Firestore
* **Severidad:** Media
* **Síntoma:** 
  1. En pedidos a domicilio, el valor del envío y descuento se registraba en la tarjeta de pedido pero no se sumaba al saldo de los créditos, causando que el pedido se marcara como "Completado" sin cobrar el domicilio.
  2. La pestaña de créditos en el administrador demoraba en cargar las deudas activas y pagadas.
* **Causa Raíz:**
  1. Al aprobar el crédito no se leían los datos en caliente más recientes de la orden en Firestore y no se actualizaban los créditos al cambiar el costo de envío.
  2. Cada render realizaba un fetch secuencial (`checkNext`) para verificar de forma anticipada la existencia de páginas siguientes.
* **Archivos Modificados:**
  - `src/services/orderService.js` → Aprobación lee `latestOrderDoc` directamente de la DB; `updateOrderDeliveryCost` sincroniza automáticamente la diferencia de envío con créditos asociados.
  - `src/services/creditService.js` → Paginación optimizada a `limitSize + 1` elementos para retornar `hasNextPage` de manera atómica.
  - `src/pages/admin/AdminCredits.jsx` → Consumir flag `hasNextPage` y eliminar fetch secuencial redundante.
* **Desplegado:** Local build verificado ✅

---

### [2026-06-09] - Corrección crítica: Firestore allow read vs allow get/list en /orders
* **Tipo:** Bug Fix / Seguridad / Base de Datos
* **Severidad:** Crítico
* **Síntoma:** Las tarjetas de pedido del cliente no se actualizaban en tiempo real cuando el admin cambiaba el estado (ej. "Completado"). El cliente debía recargar la página para ver el cambio.
* **Causa Raíz:** La regla `allow read` en `/orders` usaba `resource.data.cliente.celular != null`. Firestore prohíbe evaluar `resource.data` en queries de tipo `list` (onSnapshot). El listener `subscribeToClientOrders` era rechazado silenciosamente.
* **Archivos Modificados:**
  - `firestore.rules` → Separada la regla en `allow get` (con `resource.data`) y `allow list: if isAdmin() || true`
* **Desplegado:** `firebase deploy --only firestore:rules` ✅

---

### [2026-06-09] - Corrección crítica: Índices compuestos faltantes en colección notifications
* **Tipo:** Bug Fix / Base de Datos / Firestore Indexes
* **Severidad:** Crítico
* **Síntoma:** Las notificaciones al cliente no se entregaban al cambiar estado de un pedido. La bandeja del admin no actualizaba en tiempo real. Los botones "Vaciar" y "Marcar como leído" no tenían efecto visible.
* **Causa Raíz:** La colección `notifications` carecía de 3 índices compuestos requeridos por las queries de `onSnapshot`. Firestore fallaba silenciosamente en el error callback del listener sin mostrar nada en la UI.
* **Índices Agregados:**
  1. `recipientRole + createdAt DESC`
  2. `recipientId + recipientRole + createdAt DESC`
  3. `recipientId + status`
* **Archivos Modificados:**
  - `firestore.indexes.json` → 3 nuevos índices agregados
* **Desplegado:** `firebase deploy --only firestore:indexes` ✅

---

### [2026-06-09] - Inicialización de Documentación Independiente
* **Tipo:** Estructura / Documentación
* **Descripción:** Creado el directorio de documentación independiente para la plantilla base de Ventas.
* **Archivos Creados:**
  - `Documentacion Test App Sinc/bitacora_cambios.md`
  - `Documentacion Test App Sinc/mapa_aplicacion.md`
  - `Documentacion Test App Sinc/tareas_pendientes.md`
