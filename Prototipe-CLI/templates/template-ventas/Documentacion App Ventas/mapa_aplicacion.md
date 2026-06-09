# 🗺️ Mapa de la Aplicación - App Ventas (Plantilla Core)

Estructura física y lógica de los archivos clave en la plantilla base de Ventas.

## Vistas y Páginas Principales
- `src/pages/WelcomePage.jsx`: Pantalla de bienvenida con onboarding e inyección de marca.
- `src/pages/LoginPage.jsx`: Vista de acceso unificada para clientes y administradores.
- `src/pages/client/ClientCatalog.jsx`: Catálogo público de productos para clientes.
- `src/pages/admin/AdminHome.jsx`: Panel de control principal para el administrador.
- `src/pages/admin/AdminInventory.jsx`: CRUD de productos, categorías y stock.
- `src/pages/admin/AdminOrders.jsx`: Gestión de pedidos en tiempo real con asignación de mensajeros.

## Componentes Críticos
- `src/components/client/cart/CartDrawer.jsx`: Módulo lateral de carrito de compras.
- `src/components/client/checkout/CheckoutModal.jsx`: Modal multipaso para formalizar compras.
- `src/components/admin/inventory/ProductFormModal.jsx`: Modal de carga y edición de productos.

## Servicios
- `src/services/telemetryService.js`: Emisión de telemetría de facturación y logs al Firestore central.
- `src/services/billingService.js`: Módulo de liquidación y control comisional.
- `src/services/whatsappService.js`: Integración de notificaciones y chats.
