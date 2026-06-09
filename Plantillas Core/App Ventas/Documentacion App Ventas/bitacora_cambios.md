# 📑 Bitácora de Cambios - App Ventas (Plantilla Core)

Historial de cambios, mejoras y correcciones técnicas aplicadas sobre la plantilla core de Ventas.

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
  - `Documentacion App Ventas/bitacora_cambios.md`
  - `Documentacion App Ventas/mapa_aplicacion.md`
  - `Documentacion App Ventas/tareas_pendientes.md`
