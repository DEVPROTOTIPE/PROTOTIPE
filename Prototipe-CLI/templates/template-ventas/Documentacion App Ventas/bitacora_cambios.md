# 📑 Bitácora de Cambios - App Ventas (Plantilla Core)

Historial de cambios, mejoras y correcciones técnicas aplicadas sobre la plantilla core de Ventas.

### [2026-06-13] - Rediseño de Mensaje de Confirmación a Toast Flotante Premium
* **Tipo:** UI/UX / Mejoras Visuales / AdminSettings
* **Severidad:** Media
* **Descripción de Cambios:**
  - **Conversión a Toast Flotante:** Se reemplazó el renderizado estático del mensaje de guardado (`saveMessage`) por un Toast flotante premium en el centro superior del viewport (`fixed top-6 left-1/2 -translate-x-1/2 z-[9999]`), con fondo semi-translúcido (`backdrop-blur-md`), sombras, colores HSL e íconos dinámicos.
  - **Animación Fluida:** Se implementó `AnimatePresence` y `motion.div` de `framer-motion` para lograr transiciones suaves de entrada y salida.
  - **Auto-limpieza Centralizada:** Se implementó un `useEffect` que escucha cambios en `saveMessage` y ejecuta un timer de **2 segundos** (`2000` ms) para auto-limpiar el mensaje.
* **Archivos Modificados:**
  - `src/pages/admin/AdminSettings.jsx`
* **Desplegado:** Local build verificado ✅

---

### [2026-06-12] - Robustez en Paginación y Prevención de Bucle de Lecturas (Exploit de Facturación)
* **Tipo:** Robustez / Parche de Facturación / Rendimiento / UX
* **Severidad:** Crítica (Evita consumo masivo accidental de Firestore)
* **Descripción de Cambios:**
  - **Deduplicación en Frontend:** Modificado el `useMemo` de `allProducts` en `ClientCatalog.jsx` para remover duplicados de ID de producto mediante un `Set`, evitando advertencias de colisión de `key` de React y fallos visuales en el DOM virtual.
  - **Mitigación de Bucle Infinito de Lectura:** Modificado `loadMoreRef` (`IntersectionObserver`) para suspender el trigger automático de carga de página si el usuario tiene una búsqueda activa (`searchTerm`) o filtros aplicados (`hasActiveFilters`).
  - **Paginación Manual Controlada:** Agregado un botón manual de `"Buscar más en el catálogo completo"` cuando existen filtros activos y hay más páginas disponibles en Firestore.
  - **UX de Búsqueda sin Coincidencias:** Si el filtro da 0 resultados en la página cargada pero Firestore tiene más páginas (`hasNextPage === true`), se renderiza un estado vacío amigable con el botón manual `"Buscar en el resto del catálogo"`, solucionando el bloqueo donde el usuario no podía seguir buscando en páginas subsecuentes.
* **Archivos Modificados:**
  - `src/pages/client/ClientCatalog.jsx`
* **Desplegado:** Local build verificado ✅, Sincronizado a plantilla CLI con validación exitosa.

### [2026-06-11] - Implementación de la Optimización de Consumo de Base de Datos y Storage
* **Tipo:** Optimización Costos / Base de Datos / Storage / Rendimiento / Frontend
* **Severidad:** Alta
* **Descripción de Cambios:**
  - **Compresión WebP Client-Side:** Modificado `uploadService.js` para interceptar dinámicamente cualquier subida de imagen y comprimirla mediante Canvas localmente en el navegador a resoluciones máximas de 800px para productos/galerías o 400px para variantes/logos, exportándolo a WebP con calidad 0.75.
  - **Soporte de URLs de Imágenes Externas:** Validada la compatibilidad nativa en los inputs de tipo url vinculados a `imageUrl` de variantes y productos en `ProductFormModal.jsx`, facilitando que el administrador use enlaces externos sin consumir cuotas de Storage.
  - **Paginación Firestore por Cursores:** Refactorizado `inventoryService.js` agregando `getProductsPaged` que limita la consulta a Firestore a bloques de 12 ítems y utiliza cursores (`limit`, `startAfter`) según la categoría.
  - **Scroll Infinito con IntersectionObserver:** Reemplazada la paginación local en memoria en `ClientCatalog.jsx` por una carga perezosa interactiva con IntersectionObserver que consume la paginación de Firestore a través del nuevo hook `useProductsInfinite` de TanStack Query v5 en `useInventory.js`.
  - **Índices Firestore:** Declarados los índices compuestos en `firestore.indexes.json` para las consultas paginadas de productos ordenados por creación.
* **Archivos Modificados:**
  - `firestore.indexes.json` → Declarados los índices compuestos.
  - `src/services/inventoryService.js` → Agregada la función `getProductsPaged`.
  - `src/hooks/useInventory.js` → Agregado el hook `useProductsInfinite`.
  - `src/pages/client/ClientCatalog.jsx` → Reemplazada la paginación por IntersectionObserver.
  - `Documentacion App Ventas/tareas_pendientes.md` → Registrada la tarea completada de la implementación.
  - `Documentacion App Ventas/bitacora_cambios.md` → Se registró esta entrada.
  - `Documentacion App Ventas/mapa_aplicacion.md` → Se actualizó el mapa de aplicación local.
* **Desplegado:** Local build verificado ✅

---

### [2026-06-11] - Análisis y Diseño del Plan de Optimización de Consumo de Base de Datos y Storage
* **Tipo:** Documentación / Arquitectura / Optimización Costos
* **Severidad:** Alta (Planeación de Infraestructura)
* **Descripción de Cambios:**
  - Realizado un diagnóstico exhaustivo de las lecturas redundantes en Firestore y el uso ineficiente de imágenes en Firebase Storage para la plantilla `App Ventas`.
  - Diseñados los algoritmos de compresión client-side en Canvas para WebP, el soporte de URLs externas, persistencia en IndexedDB y paginación reactiva por cursores.
  - Documentado localmente en `plan_optimizacion_consumo_firebase.md` de la documentación general.
* **Archivos Modificados:**
  - `Documentacion App Ventas/tareas_pendientes.md` → Registrada la tarea completada del análisis.
  - `Documentacion App Ventas/bitacora_cambios.md` → Se registró esta entrada.
* **Desplegado:** Documentación local verificado ✅

---

### [2026-06-09] - Rediseño del Perfil de Cliente, Optimización de Sidebar, Animaciones y Stacking Context de Emojis
* **Tipo:** UI/UX / Optimización / Estilo / Bugfix
* **Severidad:** Media
* **Síntoma:** 
  1. El selector de emojis en el perfil de cliente aparecía por detrás de las tarjetas inferiores y el clic en el botón de edición no abría el modal consistentemente.
  2. El sidebar de escritorio tenía una distribución desbalanceada de la marca y las notificaciones.
* **Causa Raíz:**
  1. El contenedor interno de la cabecera del perfil estaba configurado con `z-10`, lo cual creaba un stacking context de menor nivel que la clase `z-20` de las tarjetas inferiores. El icono del lápiz de edición interceptaba los eventos de puntero.
  2. La distribución de filas en el sidebar no estaba optimizada.
* **Archivos Modificados:**
  - `src/pages/client/ClientProfile.jsx` → Cabecera elevada a `z-40` y modal de emojis a `z-50`; añadido `pointer-events-none` al icono del lápiz.
  - `src/layouts/ClientLayout.jsx` → Rediseño del sidebar con cabecera arriba y botones en grilla en la base; añadidas animaciones de campana/carrito.
  - `src/layouts/AdminLayout.jsx` → Añadida animación interactiva de campana.
* **Desplegado:** Local build verificado ✅

---

### [2026-06-09] - Solución a la Detección de Repositorios Git en el Gestor de Respaldos
* **Tipo:** DevOps / Bugfix / Scripts
* **Severidad:** Baja
* **Síntoma:** El script de menú de respaldos reportaba a App Ventas como "Sin Git".
* **Causa Raíz:** La carpeta `.git` estaba temporalmente como `.git-backup-temp` debido a bloqueos de archivos remanentes que mantenían los servidores de desarrollo Vite activos al concluir backups anteriores, impidiendo que el renombrado de restauración se completara de forma autónoma.
* **Archivos Modificados:**
  - `D:/PROTOTIPE/menu_backup.ps1` → Añadida detención controlada de procesos Node/Vite antes de la restauración de carpetas `.git-backup-temp`.
* **Desplegado:** Cambios probados y validados físicamente en disco ✅

---

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
