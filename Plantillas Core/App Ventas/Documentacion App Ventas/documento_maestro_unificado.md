# 🗺️ Faro de Negocio y Especificación Técnica Core
## Ecosistema Ecosistema Multitenant de Gestión Comercial (App Ventas)

Este documento es el punto de referencia definitivo para el desarrollador y cualquier Inteligencia Asistente sobre el estado real, el alcance y la potencia técnica del proyecto alojado en `D:\Aplicaciones\App Ventas`.

---

## 🚀 1. Potencia y Propósito del Ecosistema

La aplicación no es una simple tienda virtual; es una infraestructura **marca blanca Ecosistema** diseñada para que cualquier comercio minorista o mayorista gestione su operación de forma digital. Su arquitectura permite crear instancias independientes parametrizando visual y funcionalmente la aplicación desde un único panel administrativo.

### Características Core de Alta Ingeniería:
*   **Offline Cache Fallback**: Sincronización en tiempo real con Firebase Firestore (`onSnapshot`) combinada con persistencia en LocalStorage para garantizar que el catálogo cargue de inmediato incluso sin internet.
*   **Transacciones Atómicas de Inventario**: Descuentos de stock concurrentes controlados del lado del servidor (`runTransaction`) para evitar la sobreventa de productos en picos de tráfico.
*   **Monetización Integrada para el Desarrollador**: Panel comisional que calcula regalías mensuales en base a facturación neta, con firma digital e inyección del banner publicitario corporativo en la interfaz de clientes.

---

## 🛠️ 2. Ficha Técnica y Stack Real

La aplicación está construida y operando sobre el siguiente stack tecnológico optimizado:

| Tecnología | Versión | Propósito en el Proyecto |
|---|---|---|
| **Core** | React 19 + Vite 8 | Biblioteca UI reactiva y empaquetador veloz. |
| **Estilado** | Tailwind CSS v4 | Híbrido: Clases utilitarias y variables CSS nativas (`@theme`). |
| **Animaciones** | Framer Motion v12 | Transiciones premium, sliders táctiles y micro-interacciones. |
| **Manejo de Estado** | Zustand v5 | Centraliza autenticación, carrito de compras, favoritos y ayuda guiada. |
| **Capa Asíncrona** | TanStack Query v5 | CRUD de catálogo y caché inteligente. |
| **Backend / DB** | Firebase SDK v12 | Base de datos NoSQL reactiva en tiempo real y Auth. |
| **Validación** | Zod | Esquemas de validación de datos tipados en formularios. |
| **Reportes** | jsPDF + AutoTable | Generación de facturas de venta y reportes de comisiones. |

---

## 📂 3. Inventario del Ecosistema de Datos (Firestore)

### `config/settings`
Documento de configuración global de la tienda activa.
*   `appName` (string): Nombre comercial.
*   `sellerName` (string): Nombre del propietario.
*   `whatsappAdmin` (string): Teléfono de WhatsApp para recibir las órdenes de compra.
*   `faviconUrl` (string): Icono del sitio.
*   `seoDescription` (string): Meta-descripción SEO.
*   `contactEmail` (string): Correo de soporte.
*   `businessAddress` / `businessCity` (string): Dirección y ciudad de facturación.
*   `privacyPolicyUrl` / `termsUrl` (string): Enlaces a políticas legales obligatorias.
*   `theme` / `fontFamily` (string): Identidad visual activa de la marca.

### `products`
Catálogo de productos con soporte de variaciones.
*   `nombre` (string) | `descripcion` (string) | `precioBase` (number)
*   `imageUrl` (string) | `activo` (boolean)
*   `variantes` (array of maps): Atributos `{ id, talla, color, stock, imageUrl }` con stock aislado.

### `orders`
Pedidos realizados por clientes o facturas POS físicas registradas por el administrador.
*   `orderNumber` (string): Consecutivo visual (ej. `PED-1024`).
*   `cliente` (map): Datos `{ nombre, celular, direccion, barrio, ciudad }`.
*   `items` (array): Lista de productos, cantidades y variantes compradas.
*   `total` (number): Monto neto facturado.
*   `estado` (string): `'pendiente' | 'completado' | 'cancelado' | 'credito_aprobado'`.
*   `metodoPago` (string): `'efectivo' | 'transferencia' | 'credito'`.

### `credits`
Cuentas de deudas de clientes (fiado).
*   `clienteCelular` (string) | `clienteNombre` (string) | `saldoPendiente` (number)
*   `limiteCredito` (number) | `estado` (string): `'pendiente' | 'parcial' | 'pagado'`
*   `historialPagos` (subcolección): Registro de abonos con fecha, monto y método de pago.

### `claims`
Peticiones de garantía y reclamos post-venta.
*   `orderId` (string) | `clientPhone` (string) | `clientName` (string)
*   `reason` (string) | `status` (string): `'PENDING' | 'APPROVED' | 'REJECTED'`.

### `coupons`
Cupones de descuento.
*   `codigo` (string) | `tipoDescuento` (string) | `valorDescuento` (number) | `activo` (boolean).

### `clientNotifications`
Notificaciones dirigidas a clientes sobre el estado de sus deudas y pedidos.

---

## 4. Estado de los Componentes de Zustand (Stores)

1.  **`authStore.js`**: Autenticación híbrida. Sesiones de cliente (Zustand locales) y sesiones administrativas (Firebase Auth).
2.  **`appConfigStore.js`**: Carga e hidrata en caliente el tema HSL activo, tipografías del cliente, filtros disponibles (tallas/colores) y datos de marca de la tienda para evitar flashes visuales de carga.
3.  **`cartStore.js`**: Gestión de artículos añadidos y control estricto de topes de stock por variante en tiempo real.
4.  **`favoritesStore.js`**: Lista de productos favoritos persistidos localmente.
5.  **`guidedStore.js`**: Asistente de compra guiada interactiva que asiste a los clientes nuevos y se auto-desactiva en usuarios experimentados.
