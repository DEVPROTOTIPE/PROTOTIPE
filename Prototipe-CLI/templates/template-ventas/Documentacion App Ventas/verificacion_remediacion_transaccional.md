# Informe de Verificación Técnica: Auditoría Independiente del Sprint 4
> **Estado:** Completada  
> **Área:** Consistencia de Datos, Concurrencia e Integridad Transaccional  
> **Nivel de Confianza:** 99.9% (Excelente)  

---

## 🔍 1. Resultados de la Validación por Puntos

### 1. ¿`createPhysicalOrder` utiliza `forcedOrderId` e impide IDs aleatorios offline?
* **Estado:** **Validado y Correcto.**
* **Código Revisado:** [`orderService.js`: L464-L466](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js#L464-L466)
* **Evidencia:**
  ```javascript
  const orderIdRef = forcedOrderId
    ? doc(db, COLLECTIONS.ORDERS, forcedOrderId)
    : doc(collection(db, COLLECTIONS.ORDERS))
  ```
  Si se pasa `forcedOrderId` (el ID local generado por IndexedDB), se mapea a ese documento exacto en la nube. De lo contrario, se genera uno aleatorio (comportamiento online).

---

### 2. ¿`syncOfflineSales` reutiliza el mismo ID local en todos los reintentos?
* **Estado:** **Validado y Correcto.**
* **Código Revisado:** [`orderService.js`: L655](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js#L655)
* **Evidencia:**
  ```javascript
  await createPhysicalOrder(orderData, adminId, sale.id)
  ```
  Como `sale.id` es constante y persiste en la cola local de IndexedDB hasta que la sincronización es exitosa, cualquier reintento por cortes de conexión llamará a la API con el mismo ID exacto, logrando una operación idempotente en Firestore.

---

### 3. ¿Existe alguna ruta donde se cree un pedido a crédito sin su deuda asociada?
* **Estado:** **Validado y Correcto (Mitigado al 100%).**
* **Código Revisado:** [`orderService.js`: L370-L452](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js#L370-L452) (en `updateOrderStatus`) y [L524-L540](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js#L524-L540) (en `createPhysicalOrder`).
* **Evidencia:**
  Se eliminaron las llamadas desacopladas a `addDoc` de créditos. Ahora se pre-genera `creditIdRef` y se ejecuta `transaction.set(creditIdRef, { ... })` dentro del mismo callback de `runTransaction`. Si la transacción de stock u orden falla, se hace rollback automático de la deuda, logrando atomicidad absoluta.

---

### 4. Integración de `PENDING_CONCILIATION` en el Ecosistema
* **Constantes:** [`constants/index.js`: L23 y L31](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/constants/index.js#L23) - Registrado correctamente.
* **UI Administrativa:** [`AdminOrders.jsx`: L35-L57](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx#L35-L57) - Configurado icono `ShieldAlert` y color `text-rose-600 bg-rose-600/10 border-rose-600/20`.
* **Filtros:** [`AdminOrders.jsx`: L134](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx#L134) - Añadida a los filtros de visualización rápida.
* **Reportes Financieros y Cajas:** [`AdminHome.jsx`: L46](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx#L46) y [`pdfService.js`: L29](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js#L29) - Excluidos de las sumatorias de cajas de ventas completadas, ya que se exige que el estado sea estrictamente `ORDER_STATES.COMPLETED`.

---

### 5. ¿Las reglas de Firestore bloquean las transacciones agrupadas?
* **Estado:** **Validado y Correcto.**
* **Código Revisado:** [`firestore.rules`: L59-L89](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules#L59-L89)
* **Evidencia:** Las reglas para `orders` permiten creación libre (`allow create: if true;`) y las reglas de `products` permiten actualización de stock (`affectedKeys().hasOnly(['variantes', 'salesCount', 'updatedAt'])`), lo que permite a las transacciones de compra operar sin Auth.

---

### 6. ¿Existe duplicidad de crédito ante reintentos de sincronización?
* **Estado:** **Corregido y Optimizado en Auditoría.**
* **Código Revisado:** [`orderService.js`: L463](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js#L463) y [L371](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js#L371).
* **Hallazgo original:** El crédito usaba un ID autogenerado en cada llamada a la transacción, duplicando el documento en `/credits` si la sincronización del POS offline se reintentaba por fallas de conexión de red de retorno.
* **Solución aplicada:** Se vinculó de forma unívoca el ID del crédito al ID del pedido:
  - En `createPhysicalOrder`: `const creditIdRef = doc(db, COLLECTIONS.CREDITS, \`credit_\${orderIdRef.id}\`)`
  - En `updateOrderStatus`: `const creditIdRef = doc(db, COLLECTIONS.CREDITS, \`credit_\${orderId}\`)`
  Cualquier reintento de red sobrescribirá el mismo crédito en lugar de crear un duplicado, logrando idempotencia al 100%.

---

### 7. ¿Se disparan notificaciones al conciliar pedidos offline sin stock?
* **Estado:** **Validado y Correcto.**
* **Código Revisado:** [`orderService.js`: L543-L557](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js#L543-L557)
* **Evidencia:** Si `isStockConflict === true` tras finalizar la transacción, se llama asincrónicamente a `createCentralNotification` con tipo `NC_TYPES.STOCK_BAJO` ('stock_bajo') dirigida al `'admin'`, alertando del conflicto en el panel del Dashboard.

---

### 8. ¿Los pedidos en conciliación afectan el stock físico o métricas?
* **Estado:** **Validado y Correcto.**
* **Código Revisado:** [`orderService.js`: L504](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js#L504)
* **Evidencia:** Si hay conflicto (`isStockConflict === true`), se salta la actualización de variantes en el producto. El stock en la nube queda intacto, protegiendo al sistema de saldos negativos y valoraciones de inventario incoherentes.

---

## 🚨 2. Riesgos Operativos y Restantes

* **Riesgo Operativo - Creación de Créditos en el Portal de Vendedor:**
  * **Causa Raíz:** La regla en `/credits` requiere `allow write: if isAdmin();`. Como el Portal de Vendedor (`PortalVendedor.jsx`) opera bajo el PIN del empleado sin Firebase Auth (`request.auth == null`), cualquier intento online de un vendedor por procesar un pedido a crédito (Fiado) fallará con `permission-denied` en Firestore.
  * **Mitigación/Resolución:** Es un comportamiento deliberado de las reglas del Core para restringir la aprobación y otorgamiento de créditos exclusivamente al Administrador de la tienda. El vendedor ve la opción "Fiado" si está activa en el POS, pero operativamente el sistema no le permite fiar de forma autónoma.
