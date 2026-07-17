# 🗺️ Mapa de la Aplicación - App Ventas (Plantilla Core)

Estructura física y lógica de los archivos clave en la plantilla base de Ventas.

## Vistas y Páginas Principales
- `src/pages/WelcomePage.jsx`: Pantalla de bienvenida con onboarding e inyección de marca.
- `src/pages/LoginPage.jsx`: Vista de acceso unificada para clientes y administradores.
- `src/pages/client/ClientCatalog.jsx`: Catálogo público de productos para clientes.
- `src/pages/admin/AdminHome.jsx`: Panel de control principal para el administrador.
- `src/pages/admin/AdminInventory.jsx`: CRUD de productos, categorías y stock.
- `src/pages/admin/AdminOrders.jsx`: Gestión de pedidos en tiempo real con asignación de mensajeros, optimizada mediante componente memoizado `OrderCard` (Faro Core).
- `src/pages/admin/AdminCredits.jsx`: Panel de administración de créditos de deudores, abonos e historial, saneado con `ModalTemplate` (Módulo 5).
- `src/pages/client/ClientCredits.jsx`: Portal de visualización de deudas, abonos e historial para clientes, saneado con `ModalTemplate` (Módulo 5).

## Componentes Críticos
- `src/components/client/cart/CartDrawer.jsx`: Módulo lateral de carrito de compras. Delega la lógica de recomendaciones comerciales al hook `useCartRecommendations`.
- `src/components/client/checkout/CheckoutModal.jsx`: Modal multipaso para formalizar compras.
- `src/features/inventory/components/ProductFormModal.jsx`: Modal de carga y edición de productos con soporte para URLs externas de imágenes, compresión automática y asistente Wizard (migrado a features).
- `src/features/inventory/components/CategoryManager.jsx`: Gestor y CRUD de categorías de productos (migrado a features).

## Servicios e Hooks de Datos
- `src/services/uploadService.js`: Sube y elimina imágenes a Storage con compresión transparente WebP client-side a resoluciones máximas de 800px/400px.
- `src/features/inventory/services/inventoryService.js`: Servicio de inventario que provee la función `getProductsPaged` para paginación eficiente de Firestore mediante cursores (migrado a features).
- `src/features/inventory/hooks/useInventory.js`: Expone el hook `useProductsInfinite` para consultas paginadas con TanStack Query v5 (migrado a features).
- `src/utils/imageCompression.js`: Helper utilitario autónomo que procesa imágenes con HTML Canvas a formato WebP optimizado (calidad 0.75).
- `src/services/telemetryService.js`: Emisión de telemetría de facturación y logs al Firestore central.
- `src/features/billing/services/billingService.js`: Módulo de liquidación y control comisional (migrado a features).
- `src/features/billing/hooks/useBilling.js`: Hook para suscripción a métricas de facturación (migrado a features).
- `src/features/orders/services/orderService.js`: Servicio de pedidos con hashing de celular y control transaccional (migrado a features).
- `src/features/orders/hooks/useOrders.js`: Hook para gestión y paginación de pedidos en tiempo real (migrado a features).
- `src/features/orders/components/OrderCard.jsx`: Tarjeta de pedido memoizada responsiva (migrada a features).
- `src/features/sales/services/salesService.js`: Servicio del POS que maneja la creación de pedidos físicos (`createPhysicalOrder`) y sincronización offline (`syncOfflineSales`).
- `src/features/sales/hooks/usePOSCart.js`: Hook reactivo para el estado y lógica del carrito del POS.
- `src/features/sales/hooks/usePOSCheckout.js`: Hook reactivo para orquestar el checkout online y offline del POS.
- `src/features/sales/hooks/useOfflineSaleSync.js`: Hook reactivo para gestionar la sincronización offline.
- `src/features/sales/components/POSVariantModal.jsx`: Modal selector de variante (talla/color) de producto.
- `src/features/sales/components/POSReceiptModal.jsx`: Modal confirmador y de impresión de comprobante del POS.
- `src/features/sales/components/POSCustomItemForm.jsx`: Formulario autónomo para agregar productos personalizados.
- `src/services/whatsappService.js`: Integración de notificaciones y chats.
- `src/features/credits/services/creditService.js`: Control de cartera de deudas y abonos con blindaje transaccional contra condiciones de carrera (migrado a features).
- `src/features/credits/hooks/useCredits.js`: Hooks de React Query y Zustand para abonos y deudores (migrado a features).
- `src/services/pdfService.js`: Servicio de exportación de reportes PDF de cartera optimizado para créditos activos (Módulo 5).
- `src/hooks/useCartRecommendations.js`: Hook dedicado al cálculo y scoring de productos recomendados para el carrito. Usa `isMounted` + `fetchVersionRef` para prevenir race conditions. Check `!== false` para soportar el estado vacío inicial del store antes de la hidratación de Zustand.

## Portales Operativos y Servicios Offline
- `src/pages/portal/PortalVendedor.jsx`: POS vendedor con soporte offline 100%, cola de facturación en IndexedDB y sincronización delta de clientes.
- `src/pages/portal/PortalBodega.jsx`: Módulo de bodega para despacho y stock con control de consistencia transaccional.
- `src/pages/portal/PortalMensajero.jsx`: Portal de repartidores para trazabilidad de domicilios, soporte offline (cola en `localStorage`) y alertas de incidencias, saneado con `ModalTemplate`.
- `src/services/offlineDB.js`: Almacenamiento local en IndexedDB para catálogo de productos, categorías, clientes y cola de ventas pendientes.
- `src/services/userService.js`: Gestión de usuarios/clientes con soporte delta incremental a través de `getClientsUpdatedSince`.
- `src/services/notificationCenterService.js`: Distribuidor centralizado de alertas en tiempo real y sonido para vendedores, bodegueros y mensajeros.

## Apariencia (Paleta/Temporada) y Control Remoto desde el CRM
- `src/store/appConfigStore.js`: campo `appearanceLockedByDashboard` (persistido) — indica si el CRM central es la fuente de verdad de `theme`/`activeSeasonalEvent` para esta instancia.
- `src/hooks/useAppConfigSync.js`: el listener central (`clientes_control/{clientId}` en Firestore Central) propaga `appearanceControlledByDashboard` / `dashboardTheme` / `dashboardSeasonalEvent` hacia `theme` / `activeSeasonalEvent` / `appearanceLockedByDashboard` locales, reutilizando el mismo mecanismo de sincronización de billing/flags. `dashboardTheme` puede ser un ID de paleta (string) o un objeto plano `{primary, secondary, accent}` (colores HSL convertidos a hex desde el CRM).
- `src/pages/admin/settings/sections/AppearanceSettings.jsx` / `StoreSettings.jsx`: cuando `appearanceLockedByDashboard` es `true`, la selección local de tema/temporada queda deshabilitada con aviso "Configurado desde el dashboard".
- `src/services/appConfigService.js`: `subscribeToAppConfig` ya no resetea la configuración a `DEFAULT_SETTINGS` ante un error transitorio del listener (solo cuando Firestore confirma que el documento no existe).
- Contraparte en el Dashboard: `Central PROTOTIPE/dev-dashboard/src/components/admin/ClientLifecyclePanel.jsx` (sección "Paleta y Temporada" + sliders HSL de Branding) y `Central PROTOTIPE/dev-dashboard/src/constants/paletteCatalog.js` (catálogo espejo de 100 paletas + 10 eventos de temporada, IDs deben coincidir con `constants/palettes.js`).

## Colecciones de Base de Datos y Modelo de Seguridad (FASE 1)
- `orders`: Almacenamiento privado de pedidos completos con PII (nombres, teléfonos, direcciones completas). Restringido únicamente a administradores.
- `order_tracking`: Colección pública de seguimiento de pedidos (sin PII sensible). Indexada por `trackingToken` (SHA-256 hash). Accesible de forma pública mediante get directo para `/pedido/status`.
- `user_order_index`: Índice privado de referencias de pedidos por cliente. Organizado bajo la ruta `user_order_index/{hash(celular)}/orders/{trackingToken}`. Permite al cliente listar su historial de pedidos en tiempo real de forma segura y sin necesidad de autenticación Firebase Auth.
