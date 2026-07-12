# Revisión Arquitectónica: Manejo de Conflictos de Inventario Offline (App Ventas)
> **Estado:** Completada  
> **Área:** Arquitectura y Consistencia de Base de Datos (Firestore)  
> **Autor:** Antigravity (Socio Tecnológico Prototipe)  

---

## 📈 1. Evaluación Crítica de la Propuesta Actual (Stock Negativo)

La propuesta actual plantea permitir que las ventas offline se sincronicen en la nube aunque no haya stock disponible, restando el inventario y generando valores de stock negativos temporales en Firestore.

### 🟢 Ventajas
* **Máxima Simplicidad de Flujo:** No requiere cambiar la estructura de estados de los pedidos ni implementar interfaces de conciliación dedicadas en el panel administrativo.
* **Sincronización Garantizada:** El dispositivo del vendedor se vacía de inmediato de la cola local de IndexedDB, registrándose la transacción de dinero/deuda de inmediato en la nube.

### 🔴 Desventajas e Impactos Críticos
* **Corrupción de Reportes y Valoración:** La contabilidad financiera multiplica `cantidad * costo` para estimar el valor del activo. Los valores negativos corrompen la estimación del inventario total de la tienda en el Dashboard.
* **Impacto en Ventas Futuras:** Si un stock queda en `-3`, cuando el administrador compre existencias físicas e ingrese `3` unidades en el inventario, el stock lógico quedará en `0`. Esto obligará al administrador a calcular e ingresar existencias excedentes de forma manual para compensar el saldo negativo, provocando errores operativos.
* **Ruptura de Validaciones y Lógica:** El código frontend asume que el stock es un entero positivo (`number >= 0`). Valores negativos pueden corromper renders de barras de progreso, alertas de stock bajo y selectores de variantes.
* **Ocultamiento del Conflicto:** El desfase entre el inventario lógico y físico se arrastra de forma silenciosa en la base de datos sin generar una acción o alerta explícita para que el administrador regularice sus existencias físicas en bodega.

---

## 🛠️ 2. Diseño de Alternativas de Solución

---

### Alternativa 1: Estado `PENDIENTE_CONCILIACION` con Registro de Orden y Alerta en Dashboard
Al sincronizar una venta offline, si la transacción de base de datos determina que no hay stock suficiente, en lugar de abortar con un error, la orden se guarda en Firestore con el estado `PENDIENTE_CONCILIACION` (`ORDER_STATES.PENDING_CONCILIATION`), **sin descontar stock de las variantes** (ya que está en 0). Se inserta una notificación en el Notification Center y se muestra en una cola de revisión del Administrador.

* **Complejidad:** Media.
* **Riesgo:** Bajo.
* **Escalabilidad:** Alta.
* **Impacto para el Vendedor:** Excelente. Su venta se sincroniza, limpia su IndexedDB y no se queda bloqueado.
* **Impacto para el Administrador:** Moderado. Debe revisar y resolver el conflicto en el panel (ej. regularizar el inventario físico en bodega, forzar la venta, o cancelarla).
* **Compatibilidad con Arquitectura Actual:** Alta. Extiende la colección `/orders` y `/credits` de forma limpia usando el flujo de estados de pedidos existente.

---

### Alternativa 2: Registro en Colección Paralela de Discrepancias (`inventory_discrepancies`)
La orden se guarda como completada y el stock se deja en `0` en Firestore. Sin embargo, se inserta una bitácora en una colección paralela `/inventory_discrepancies` registrando el desfase detectado (Ej: "Pedido OR-POS-1002, Variante M/Rojo, Desfase: -1 unidad en sincronización offline").

* **Complejidad:** Media / Alta.
* **Riesgo:** Medio.
* **Escalabilidad:** Media.
* **Impacto para el Vendedor:** Excelente. Su venta se procesa sin contratiempos.
* **Impacto para el Administrador:** Complejo. Debe cruzar la colección de discrepancias con el inventario actual para cuadrar su inventario real, teniendo datos dispersos en dos colecciones independientes.
* **Compatibilidad con Arquitectura Actual:** Media. Requiere crear un nuevo servicio y colección Firestore en la app.

---

### Alternativa 3: Reserva Diferida de Stock (Esquema de Inventario Físico vs. Virtual)
Se rediseña el esquema de los productos para manejar dos variables por variante: `stockFisico` (artículos en bodega) y `stockVirtual` (disponibles para venta online). Al sincronizar ventas offline, se afecta el físico directo y se alerta si hay inconsistencia virtual.

* **Complejidad:** Alta.
* **Riesgo:** Bajo.
* **Escalabilidad:** Alta.
* **Impacto para el Vendedor:** Ninguno.
* **Impacto para el Administrador:** Alto. Debe capacitarse para entender el manejo y cuadre de una doble contabilidad de inventario (físico vs. virtual).
* **Compatibilidad con Arquitectura Actual:** Baja. Exige una refactorización estructural y masiva de la estructura de variantes en todos los componentes del catálogo, carrito, POS y servicios CRUD del inventario.

---

## 🎯 3. Recomendación Final y Justificación Técnica

La estrategia recomendada para **App Ventas** es la **Alternativa 1: Estado `PENDIENTE_CONCILIACION` con Alerta de Panel**.

### Justificación Técnica de la Elección
1. **Protección Financiera del Negocio:** A diferencia del error de stock que bloquea y deja la venta offline atascada en el dispositivo móvil del vendedor (con riesgo de pérdida total si limpia caché), el pedido se sube a Firestore de forma segura. El dinero cobrado y las deudas de créditos en `/credits` quedan registrados de forma atómica en el servidor.
2. **Preservación de la Integridad del Inventario:** El inventario de variantes en `/products` nunca cae por debajo de `0`, evitando corromper la valoración de activos de la tienda, gráficos de Dashboard y validaciones matemáticas del frontend.
3. **Visibilidad y Auditoría Directa:** Obliga a una acción administrativa. La sobreventa offline no se esconde en saldos negativos infinitos; se expone al administrador como un conflicto físico real que requiere conciliarse (ingreso de nueva mercancía, ajuste por pérdida o error de ingreso).
4. **Viabilidad de Implementación:** Es 100% compatible con los hooks de Zustand y TanStack Query actuales. No requiere migraciones destructivas de esquemas de datos en Firestore como la Alternativa 3, ni dispersión de datos relacionales en múltiples colecciones como la Alternativa 2.
