# 🏗️ Arquitectura de Features - Core Ventas v2.0

El Core Ventas v2.0 está estructurado en base a **Domain-Driven Design (DDD)** y módulos de funcionalidad desacoplados denominados **Features**. Cada feature es autocontenida y encapsula su propia lógica de presentación (componentes), estado (hooks/Zustand) y persistencia (servicios de Firestore).

---

## 📂 Directorio de Features (`src/features/`)

Cada feature dentro del directorio `src/features/` sigue la siguiente estructura estándar:
```
src/features/[feature_name]/
├── components/          # Componentes de UI específicos de la feature (OrderCard, etc.)
├── hooks/               # Custom hooks y gestores de estado (Zustand stores)
├── services/            # Lógica de persistencia, integración con Firebase y APIs de negocio
└── index.js             # Punto de exportación (Barrel export)
```

---

## 🛡️ Dominios Críticos del Sistema

### 1. Pedidos (`orders/`)
* **Propósito:** Gestionar el ciclo de vida completo de una orden (creación, preparación, entrega, cancelación, etc.).
* **Lógica Transaccional:** Implementa reservas de inventario concurrentes y transacciones atómicas de Firestore.
* **Componentes Clave:** `OrderCard.jsx` para el panel de administración, visor de tracking público.
* **Estado:** `useOrders` hooks que encapsulan operaciones de Firebase.

### 2. Inventario (`inventory/`)
* **Propósito:** Controlar los productos, variantes (talla/color), stock y persistencia física de imágenes.
* **Características:** Soporte para stock infinito (`stockInfinito: true`) y validación robusta pre-compra.
* **Servicio:** `inventoryService.js` expone métodos para actualización de inventario por transacción y eliminación limpia de imágenes en Firebase Storage.

### 3. Ventas (`sales/`)
* **Propósito:** Registrar e historizar las transacciones comerciales completadas en el POS o checkout.
* **Características:** Consolidación mensual, registros con firma de vendedor (`vendedorId`) y totales detallados.
* **Servicio:** `salesService.js` maneja reportes de caja y listados paginados.

### 4. Créditos (`credits/`)
* **Propósito:** Controlar el financiamiento y deudas de clientes ("fiar").
* **Flujo Transaccional:** Al cambiar un pedido a `CREDIT_APPROVED`, se crea un registro en `credits/`. Los abonos posteriores se restan del saldo pendiente usando transacciones atómicas. Al llegar a $0 de saldo, la orden original asociada se completa automáticamente.
* **Servicio:** `creditService.js`.

### 5. Facturación (`billing/`)
* **Propósito:** Integración de métodos de pago, costos de delivery y cálculo de montos totales del pedido.
* **Servicio:** `billingService.js`.

---

## 🤝 Reglas de Dependencia e Integración

1. **Desacoplamiento de UI:** Los componentes de presentación no deben interactuar directamente con Firestore. Deben consumir hooks o servicios dedicados.
2. **Dirección de Dependencias:** Las Features pueden importar elementos de `src/components/ui` o `src/services/` (servicios globales como `telemetryService` o `notificationCenterService`), pero **nunca** deben importar utilidades o componentes privados de otra Feature. Si hay lógica compartida, debe extraerse a la capa común (`src/common/` o `src/services/`).
3. **Persistencia Atómica:** Todo cambio que afecte a múltiples colecciones (ej. cambiar estado de pedido + descontar/restaurar stock + actualizar crédito) **debe** realizarse mediante una transacción (`runTransaction`) o batch de Firestore para garantizar la consistencia.
