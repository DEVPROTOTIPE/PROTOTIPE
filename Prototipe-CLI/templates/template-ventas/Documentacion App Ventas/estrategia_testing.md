# 🧪 Estrategia de Testing - Core Ventas v2.0

La robustez del Core Ventas v2.0 se asegura mediante una estrategia de pruebas en dos niveles: **Pruebas Unitarias de Lógica de Dominio** y **Pruebas de Integración/E2E del Proceso de Compra**.

---

## 🛠️ 1. Pruebas Unitarias (Vitest)

Las pruebas unitarias se enfocan al 100% en los servicios lógicos de dominio (no UI). El objetivo es verificar la corrección del flujo de negocio sin depender de servicios externos reales (se usa mock extensivo de Firestore y Storage).

### Áreas de Cobertura
* **`orderService.js` (≥60%):** Validación de creación de pedidos, cálculo y actualización de costos de delivery, transiciones de estado, cancelación con/sin restauración de stock, y migración a tokens de tracking.
* **`inventoryService.js` (≥50%):** CRUD de productos, manejo de stock infinito, transacciones seguras de stock, y eliminación limpia de imágenes asociadas en Storage.
* **`salesService.js` (≥50%):** Registro de transacciones de caja, listados paginados y reportes contables.
* **`creditService.js` (≥60%):** Aprobación de créditos, aplicación de abonos con transacciones atómicas, validación de saldos y autocompletado de órdenes.
* **`billingService.js` (≥50%):** Lógica de cálculo de impuestos y costos de facturación.

### Ejecución
```bash
# Ejecutar todas las pruebas unitarias
npm run test:unit

# Ejecutar y generar reporte de cobertura de código (V8)
npm run test:coverage
```

---

## 🎭 2. Pruebas de Extremo a Extremo (Playwright E2E)

Las pruebas E2E validan que el flujo de compra desde el punto de vista del cliente final funcione correctamente de principio a fin, independientemente de la configuración regional de entrega o pago del tenant.

### Foco de Prueba: `checkout.spec.js`
* **Navegación Dinámica:** Valida los pasos del checkout dinámicamente detectando qué botones e inputs están visibles en lugar de usar selectores fijos o esperar un número fijo de transiciones.
* **Manejo de Delivery:** Se adapta automáticamente a métodos como `delivery` (solicita dirección y mapa) o `pickup` (recogida en tienda) según la configuración activa.
* **Métodos de Pago:** Funciona de forma resiliente tanto para `transferencia` (efectivo/banco) como para `credito` (fiar).

### Ejecución
```bash
# Iniciar servidor local
npm run dev

# Ejecutar pruebas E2E en paralelo con Playwright
npx playwright test
```
> [!IMPORTANT]
> **Consistencia E2E:** Asegura que los emuladores de Firebase estén ejecutándose antes de iniciar las pruebas de extremo a extremo, o que las llamadas a Firebase se realicen sobre un entorno sandbox configurado específicamente para pruebas.
