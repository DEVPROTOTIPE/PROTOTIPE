# 🗺️ Mapa de la Aplicación - Test App Sinc (Test App Sinc)

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
- `src/components/client/cart/CartDrawer.jsx`: Módulo lateral de carrito de compras.
- `src/components/client/checkout/CheckoutModal.jsx`: Modal multipaso para formalizar compras.
- `src/components/admin/inventory/ProductFormModal.jsx`: Modal de carga y edición de productos con soporte para URLs externas de imágenes y compresión automática.

## Servicios e Hooks de Datos
- `src/services/uploadService.js`: Sube y elimina imágenes a Storage con compresión transparente WebP client-side a resoluciones máximas de 800px/400px.
- `src/services/inventoryService.js`: Servicio de inventario que provee la función `getProductsPaged` para paginación eficiente de Firestore mediante cursores.
- `src/hooks/useInventory.js`: Expone el hook `useProductsInfinite` para consultas paginadas con TanStack Query v5.
- `src/utils/imageCompression.js`: Helper utilitario autónomo que procesa imágenes con HTML Canvas a formato WebP optimizado (calidad 0.75).
- `src/services/telemetryService.js`: Emisión de telemetría de facturación y logs al Firestore central.
- `src/services/billingService.js`: Módulo de liquidación y control comisional.
- `src/services/whatsappService.js`: Integración de notificaciones y chats.
- `src/services/creditService.js`: Control de cartera de deudas y abonos con blindaje transaccional contra condiciones de carrera (Módulo 5).
- `src/services/pdfService.js`: Servicio de exportación de reportes PDF de cartera optimizado para créditos activos (Módulo 5).

## Portales Operativos y Servicios Offline
- `src/pages/portal/PortalVendedor.jsx`: POS vendedor con soporte offline 100%, cola de facturación en IndexedDB y sincronización delta de clientes.
- `src/pages/portal/PortalBodega.jsx`: Módulo de bodega para despacho y stock con control de consistencia transaccional.
- `src/pages/portal/PortalMensajero.jsx`: Portal de repartidores para trazabilidad de domicilios, soporte offline (cola en `localStorage`) y alertas de incidencias, saneado con `ModalTemplate`.
- `src/services/offlineDB.js`: Almacenamiento local en IndexedDB para catálogo de productos, categorías, clientes y cola de ventas pendientes.
- `src/services/userService.js`: Gestión de usuarios/clientes con soporte delta incremental a través de `getClientsUpdatedSince`.
- `src/services/notificationCenterService.js`: Distribuidor centralizado de alertas en tiempo real y sonido para vendedores, bodegueros y mensajeros.
