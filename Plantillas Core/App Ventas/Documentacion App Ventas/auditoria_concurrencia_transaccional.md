# Informe de Auditoría: Concurrencia e Integridad Transaccional (App Ventas)
> **Estado:** Completada (Fase Final de Auditoría)  
> **Áreas de Foco:** Inventario Concurrente · Compras Simultáneas · Transacciones de Firestore  

---

## 📈 1. Matriz de Diagnóstico y Evaluación de Riesgos

| Riesgo Analizado | Nivel de Riesgo | Confirmado | Causa Raíz en Código | Consecuencia Técnica |
| :--- | :--- | :--- | :--- | :--- |
| **Sobreventa (Venta Online)** | 🟢 **Bajo / Nulo** | No | Bloqueado por `runTransaction` en `orderService.js`. | Ninguna en flujo online. |
| **Sobreventa (Venta Offline)** | 🔴 **CRÍTICO** | Sí | IndexedDB local no se comunica entre dispositivos en modo offline. | Varios vendedores entregan físicamente el mismo artículo. Al conectar red, el segundo rebota y su venta se pierde. |
| **Stock Negativo** | 🟢 **Bajo / Nulo** | No | Bloqueado en base de datos en nube por validación de stock dentro de la transacción. | El stock en Firestore nunca es menor a cero, pero en la realidad física sí ocurre. |
| **Pedidos Duplicados** | 🟠 **ALTO** | Sí | `createPhysicalOrder` autogenera un `orderIdRef` aleatorio y no usa el ID original local en la sincronización offline. | Fallos intermitentes de red causan reintentos de `syncOfflineSales`, insertando el mismo pedido múltiples veces. |
| **Pedidos Huérfanos** | 🟢 **Bajo / Nulo** | No | Todas las órdenes creadas se guardan como documentos válidos. | No se detectan registros de órdenes incompletos en Firestore. |
| **Créditos Inconsistentes** | 🔴 **CRÍTICO** | Sí | La creación del documento de deuda en `/credits` (`addDoc`) ocurre de forma desacoplada y fuera de la transacción de stock. | Fallas de red tras actualizar la orden a `CREDIT_APPROVED` abortan la creación del crédito, perdiendo la deuda del cliente. |
| **Abonos Inconsistentes** | 🟢 **Bajo / Nulo** | No | El registro de abonos y actualización a `completado` corre dentro de una transacción atómica. | Operación íntegra y consistente. |
| **Corrupción de Datos por Red** | 🟠 **ALTO** | Sí | Desacoplamiento de llamadas asíncronas consecutivas y falta de idempotencia en reintentos offline. | Registros duplicados y stock sobre-descontado. |

---

## 🛠️ 2. Análisis Técnico Detallado por Tareas

### Tarea 1: Inventario Concurrente
Se analizó el flujo completo de venta del catálogo client-side (`CheckoutModal.jsx`), venta física POS del administrador (`AdminSales.jsx`) y el portal operativo del vendedor (`PortalVendedor.jsx`) junto a los servicios de soporte:

* **¿Se usa `runTransaction()`?**
  * **Sí**, en el flujo online. Las funciones `createOrder` (línea 57) y `createPhysicalOrder` (línea 468) en [`orderService.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) leen los productos, validan el stock de las variantes en caliente y actualizan la colección `/products` y `/orders` dentro de una transacción atómica de Firestore.
  * También se utiliza `runTransaction` al cancelar un pedido (`updateOrderStatus` línea 315) o aprobar un crédito (línea 373) para retornar/descontar stock de variantes.
* **¿Se usa `writeBatch()`?**
  * **No** se utiliza en ningún servicio de pedidos. Se opta por transacciones debido a que se requiere una lectura previa del stock actual para realizar la validación de negocio antes de escribir.
* **¿Existen bloqueos de concurrencia?**
  * **Sí, provistos por Firestore.** Firestore utiliza control de concurrencia optimista. Si una transacción lee un documento de producto y otra transacción lo modifica antes de que la primera haga el commit, Firestore aborta la primera transacción y la reintenta automáticamente con los datos actualizados.
* **¿Existe validación de stock al confirmar la venta?**
  * **Sí, a nivel de base de datos.** Dentro de la transacción se evalúa si `stockActual < item.cantidad`. Si se cumple, se aborta y se lanza un error de stock insuficiente, impidiendo la escritura del pedido.

---

### Tarea 2: Simulación de Compras Simultáneas

#### Escenario A: 2 clientes comprando la última unidad (Stock = 1)
* **Resultado Esperado:** Un cliente se lleva el producto y al otro se le rechaza por stock agotado.
* **Resultado Real:** **Consistente.** La transacción del cliente A se confirma. Al intentar confirmar el cliente B, Firestore detecta el cambio en el documento del producto, aborta la transacción B, la reintenta, lee `stock = 0`, la validación de stock falla y arroja error, impidiendo que el pedido B sea guardado en la nube.
* **Riesgo:** Ninguno.

#### Escenario B: Cliente (Web) y Vendedor (POS) comprando simultáneamente (Stock = 1, Modo Online)
* **Resultado Esperado:** Uno de los dos se queda con el producto; el otro recibe el aviso de stock insuficiente.
* **Resultado Real:** **Consistente.** Al operar ambos online en Firestore, el motor transaccional resuelve el conflicto de la misma manera que en el Escenario A por precesión de confirmación de transacción.
* **Riesgo:** Ninguno.

#### Escenario C: Vendedores registrando ventas físicas simultáneamente (Stock = 1, Modo Offline)
* **Resultado Esperado:** El sistema debe alertar del conflicto de stock antes de permitir entregar el artículo físicamente a dos personas.
* **Resultado Real:** **Inconsistente (Sobreventa Física y Venta Perdida).** 
  - El Vendedor 1 descuenta stock localmente en IndexedDB a `0` y entrega el producto en persona.
  - El Vendedor 2, en su propio dispositivo offline, ve stock = 1 (su IndexedDB no sabe de la venta de Vendedor 1). Descuenta a `0` y entrega el producto.
  - Al recuperar red, el dispositivo 1 sincroniza con éxito en Firestore (stock pasa de 1 a 0 en la nube).
  - El dispositivo 2 sincroniza después. Al ejecutar la transacción en la nube, lee stock = 0. La validación `stockActual < item.cantidad` falla y lanza error.
  - La venta del Vendedor 2 **rebota y se queda bloqueada permanentemente** en su cola offline de IndexedDB.
* **Riesgo:** **Crítico.** Pérdida financiera por entrega física de producto sin registro de orden ni deuda en la base de datos central.

---

### Tarea 3: Integridad Transaccional y Fallas de Red

Se auditó el ciclo de vida de operaciones cruzadas entre pedidos, stock e inserción de deudas en `/credits` y abonos en `creditService.js`:

* **Fallo de Red en Aprobación de Créditos (`CREDIT_APPROVED`)**:
  * **Ubicación Crítica:** [`orderService.js`: L373-L447](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js#L373-L447).
  * **Falla:** La actualización de stock del producto y del estado del pedido a `CREDIT_APPROVED` se realiza dentro de un `runTransaction`. Sin embargo, la creación del documento de crédito (`addDoc(creditsRef, ...)`) ocurre de manera asíncrona **fuera de la transacción** (línea 434).
  * **Impacto:** Si la red se cae o la app se cierra tras finalizar la transacción pero antes del `addDoc`, el pedido quedará aprobado con el stock descontado, pero el cliente **nunca tendrá una deuda registrada**. El cliente se lleva el producto y el administrador nunca podrá cobrarle el dinero por falta de registro.

* **Fallo de Red en Sincronización Offline (`syncOfflineSales`)**:
  * **Ubicación Crítica:** [`orderService.js`: L630](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js#L630).
  * **Falla:** `createPhysicalOrder` genera un `orderIdRef` nuevo en cada llamada con `doc(collection(db, COLLECTIONS.ORDERS))`.
  * **Impacto:** Si una venta offline se sincroniza en Firestore pero la respuesta HTTP de éxito se pierde en el cliente por micro-corte de red, la venta permanece en la cola de IndexedDB. Al reintentar la sincronización, se creará un **segundo pedido duplicado en Firestore**, restando el stock de variantes de nuevo y duplicando el balance de ventas de caja.

---

## 📋 4. Plan de Remediación Técnico Priorizado

### 🚨 Prioridad 1: Integridad de Créditos (Evitar Deudas Perdidas)
* **Severidad:** 🔴 **CRÍTICA**
* **Impacto:** Evita pérdidas financieras por pedidos aprobados a crédito sin deuda generada en Firestore.
* **Solución:** Integrar la creación del crédito **dentro de la transacción** que aprueba el estado del pedido.
* **Archivos Afectados:** [`orderService.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) (funciones `updateOrderStatus` y `createPhysicalOrder`).
* **Código Sugerido de Remediación (Inyectar en Transacción):**
  ```javascript
  // Pre-generar la referencia del documento de crédito antes o dentro de la transacción
  const creditIdRef = doc(collection(db, 'credits'));
  
  await runTransaction(db, async (transaction) => {
    // ... [validaciones y descuentos de stock] ...
    
    // Actualizar estado de la orden
    transaction.update(orderRef, {
      estado: ORDER_STATES.CREDIT_APPROVED,
      stockDescontado: true,
      updatedAt: serverTimestamp()
    });
    
    // Insertar el crédito atómicamente
    transaction.set(creditIdRef, {
      orderId,
      orderNumber: currentOrder.orderNumber,
      cliente: currentOrder.cliente,
      clienteNombre: currentOrder.cliente?.nombre || '',
      clienteCelular: currentOrder.cliente?.celular || '',
      total: currentOrder.total,
      montoTotal: currentOrder.total,
      saldoPendiente: currentOrder.total,
      abonos: [],
      estado: 'activo',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });
  ```

### 🚨 Prioridad 2: Idempotencia en Sincronización Offline (Evitar Pedidos Duplicados)
* **Severidad:** 🟠 **ALTO**
* **Impacto:** Previene pedidos duplicados y dobles descuentos de stock por inestabilidad de red en reintentos de sincronización.
* **Solución:** Utilizar el ID generado localmente en IndexedDB (`sale.id`) como el ID físico del documento en Firestore.
* **Archivos Afectados:** [`orderService.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) (`createPhysicalOrder` y `syncOfflineSales`).
* **Código Sugerido de Remediación:**
  ```javascript
  // Modificar firma para aceptar un orderId opcional (usado por la sincronización)
  export async function createPhysicalOrder(orderData, adminId, forcedOrderId = null) {
    const orderNumber = orderData.orderNumber || `OR-POS-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderIdRef = forcedOrderId 
      ? doc(db, COLLECTIONS.ORDERS, forcedOrderId) 
      : doc(collection(db, COLLECTIONS.ORDERS));
      
    await runTransaction(db, async (transaction) => {
      // ... [lógica de descuento de stock] ...
      
      transaction.set(orderIdRef, {
        ...orderData,
        orderNumber, // Mantener el número de orden original
        // ...
      });
      
      // Crear el crédito de forma atómica si aplica
      if (orderData.metodoPago === PAYMENT_METHODS.CREDIT) {
        const creditIdRef = doc(collection(db, 'credits'));
        transaction.set(creditIdRef, {
          orderId: orderIdRef.id,
          orderNumber,
          // ...
        });
      }
    });
  }
  ```

### 🚨 Prioridad 3: Resolución de Conflictos de Stock Offline (Evitar Bloqueos Permanente)
* **Severidad:** 🟡 **MEDIO**
* **Impacto:** Evita que las ventas físicas reales de los vendedores se queden atrapadas permanentemente en IndexedDB si el stock se agotó en la nube en el intertanto.
* **Solución:** Permitir sobreventa (stock negativo temporal en Firestore) si el pedido proviene de una sincronización offline (`orderData.offline === true`). Es preferible una alerta de inconsistencia de stock físico en el panel que la pérdida financiera total del registro de la venta.
* **Código Sugerido de Remediación:**
  ```javascript
  // Dentro de la transacción de createPhysicalOrder:
  const stockActual = variantes[variantIndex].stock;
  const isOfflineSync = orderData.offline === true;
  
  if (stockActual < item.cantidad && !isOfflineSync) {
    throw new Error(`Stock insuficiente para "${item.nombre}"`);
  }
  
  // Si es offline, restará stock permitiendo valores negativos temporales
  variantes[variantIndex].stock = stockActual - item.cantidad;
  ```
