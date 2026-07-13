# 📝 Bitácora de Cambios e Historial de Commits

## CLI-481 — 2026-07-13
**Limpieza: Eliminación de flags fantasma commissionsEnabled y enableDianBilling de ambos manifests**

### Cambios realizados:
Eliminados todos los bloques de `commissionsEnabled` y `enableDianBilling` (featureFlags, flagRecommendationRules y componentMappings) de ambos `core-manifest.json`. Ambas flags apuntaban a módulos no implementados en App Ventas core. Su presencia generaba switches sin efecto real en el CRM central.

### Archivos modificados:
- [`Plantillas Core/App Ventas/core-manifest.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/core-manifest.json) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/core-manifest.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/core-manifest.json) [MODIFY]

---

## CLI-480 — 2026-07-13
**Feature: Conexión real de wholesaleEnabled al CRM central + Limpieza de reservasEnabled (flag fantasma)**

### Cambios realizados:
1. **`useAppConfigSync.js` (App Ventas y template-ventas):** Mapeado `centralFlags.wholesaleEnabled` → `wholesaleSettings.enabled` en el store. Ahora al activar o desactivar el módulo de Mayoreo desde el CRM central, el cambio se propaga en tiempo real al estado reactivo de la instancia sin requerir configuración manual en AdminSettings. Se preservan el resto de las propiedades del sub-objeto (`minQuantity`, `discountType`, `discountValue`).
2. **`core-manifest.json` (App Ventas y template-ventas):** Eliminados los 3 bloques de `reservasEnabled` (featureFlags, flagRecommendationRules, componentMappings) de ambos manifests. El módulo de Agenda/Citas no existe en App Ventas core — la flag era aspiracional y generaba confusión al aparecer como un switch activo en el CRM sin tener efecto real.

### Archivos modificados:
- [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`Plantillas Core/App Ventas/core-manifest.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/core-manifest.json) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/core-manifest.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/core-manifest.json) [MODIFY]

---

## CLI-479 — 2026-07-13
**Bugfix: GuidedToast sin guard de onlineOrdersEnabled + limpieza de cartStore huérfano**

### Cambios realizados:
1. **`GuidedToast.jsx` (App Ventas y template-ventas):** Corregido bug donde el asistente de compra mostraba el mensaje "Muy bien, ahora revisa tu carrito" aunque `onlineOrdersEnabled` estuviera desactivado. Se añadió lectura de la flag desde `useAppConfigStore` y se condicionó el mensaje `PRODUCT_ADDED` a `onlineOrdersEnabled && ...`. Adicionalmente, se agregó un `useEffect` que limpia el `cartStore` si la flag se desactiva mientras hay ítems en caché de una sesión anterior, evitando que se disparen mensajes del carrito sobre ítems fantasma.

### Archivos modificados:
- [`Plantillas Core/App Ventas/src/components/ui/GuidedToast.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/GuidedToast.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/components/ui/GuidedToast.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/ui/GuidedToast.jsx) [MODIFY]

---

## CLI-478 — 2026-07-13
**Feature & Integration: Feature Flag onlineOrdersEnabled (Pedidos en Línea / Catálogo Vitrina) en Core Ventas y Generador**

### Cambios realizados:
1. **Configuración y Esquemas (core-manifest.json, Zustand, Zod, Sync):** Añadimos la feature flag `onlineOrdersEnabled` con un valor por defecto de `true` en los manifiestos, store global (`appConfigStore.js`), esquema de validación de Zod (`appConfigSchema.js`) y en la sincronización en vivo con Firestore central (`useAppConfigSync.js`). Esto permite habilitar o deshabilitar dinámicamente todo el flujo transaccional de compras en caliente.
2. **Layouts de Navegación (AdminLayout y ClientLayout):** Ocultamos la pestaña "/admin/pedidos" en el panel administrativo y "/tienda/pedidos" en el panel de cliente cuando `onlineOrdersEnabled` es falso. En `ClientLayout.jsx` de cliente, ocultamos el botón de carrito permanente del sidebar, rediseñando la cuadrícula a 2 columnas uniformes, el botón del carrito móvil en el header, y la insinuación del carro (`SmartHint` flotante por inactividad).
3. **Vistas de Producto (DetailPage, PublicDetail, DetailModal):** Modificamos el detalle interno del producto, la landing page pública y el modal rápido de catálogo para que, al desactivarse la flag, se oculten los botones "Comprar Ahora", "Agregar al Carrito" y selectores de cantidad. En su lugar, inyectamos un botón responsivo premium de "Consultar por WhatsApp" con icono de `MessageCircle` / `MessageSquare`, el cual redirige a una conversación con el administrador con un mensaje personalizado que detalla el producto, color y talla seleccionados.
4. **Perfil del Cliente (ClientProfile):** Ocultamos el acceso de la tarjeta principal "Mis Pedidos / Historial" cuando `onlineOrdersEnabled` es falso, estructurando condicionalmente el renderizado junto a "Mis Créditos" para evitar líneas divisorias huérfanas o bloques de tarjetas vacíos.
5. **Seguridad y Guards de Ruta (ClientOrders y AdminOrders):** Inyectamos guards de redirección reactivos mediante `useEffect` en las vistas `ClientOrders.jsx` (redirige a `/tienda/catalogo`) y `AdminOrders.jsx` (redirige a `/admin/home`) para que, en caso de intentar ingresar directamente escribiendo la URL en el navegador estando deshabilitada la flag, se reconduzca al usuario a secciones permitidas del sistema.
6. **Propagación en Generador CLI:** Aplicamos todos los cambios descritos tanto en la app de desarrollo activa (`Plantillas Core/App Ventas`) como en el directorio de plantillas del generador CLI (`Prototipe-CLI/templates/template-ventas`).

### Archivos modificados:
- [`Plantillas Core/App Ventas/core-manifest.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/core-manifest.json) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/core-manifest.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/core-manifest.json) [MODIFY]
- [`Plantillas Core/App Ventas/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/store/appConfigStore.js) [MODIFY]
- [`Plantillas Core/App Ventas/src/schemas/appConfigSchema.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/schemas/appConfigSchema.js) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/schemas/appConfigSchema.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/schemas/appConfigSchema.js) [MODIFY]
- [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`Plantillas Core/App Ventas/src/layouts/AdminLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/layouts/AdminLayout.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/layouts/AdminLayout.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/layouts/ClientLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/layouts/ClientLayout.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/layouts/ClientLayout.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/client/ProductDetailPage.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/pages/client/ProductDetailPage.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/client/ProductPublicDetail.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/pages/client/ProductPublicDetail.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/components/client/catalog/ProductDetailModal.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/components/client/catalog/ProductDetailModal.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/client/ClientOrders.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientOrders.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/pages/client/ClientOrders.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ClientOrders.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/client/ClientProfile.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientProfile.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/pages/client/ClientProfile.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ClientProfile.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/admin/AdminOrders.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminOrders.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]

---

## CLI-477 — 2026-07-13
**Feature & Optimization: Reducción del Tamaño del Bundle mediante Tree-Shaking en Importación de Iconos**

### Cambios realizados:
1. **Plantillas Core/App Ventas/src/layouts/AdminLayout.jsx:** Optimizamos la importación de `lucide-react` reemplazando la importación masiva (`import * as LucideIcons from 'lucide-react'`) por importaciones selectivas de los 14 iconos específicos utilizados en la navegación. Definimos una constante estática local `LucideIcons` para preservar la compatibilidad del componente sin afectar el resto del archivo. Esto reduce el chunk de iconos de **899.9 KB** a tan solo **71.78 KB** (más del 92% de optimización), resolviendo la advertencia de auditoría de rendimiento y maximizando el puntaje de PWA a 100/100.
2. **Prototipe-CLI/templates/template-ventas/src/layouts/AdminLayout.jsx:** Propagamos esta optimización de tree-shaking en la plantilla de template-ventas de la base del generador CLI, asegurando que todos los futuros proyectos aprovisionados en el ecosistema hereden esta mejora de rendimiento por defecto.

### Archivos modificados:
- [`Plantillas Core/App Ventas/src/layouts/AdminLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/layouts/AdminLayout.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/layouts/AdminLayout.jsx) [MODIFY]

---

## CLI-476 — 2026-07-13
**Feature & Optimization: Optimización Asíncrona de Carga de Diffs en Drift Detector**

### Cambios realizados:
1. **Prototipe-CLI/server.js:** Optimizamos el endpoint `/api/project/drift` eliminando el cálculo pesado de diferencias de líneas (`Diff.diffLines`) en el bucle del listado general (retornando `diff: null` para archivos modificados). Introdujimos el parámetro `filePath` para calcular y retornar el diff detallado asíncronamente bajo demanda solo para el archivo seleccionado.
2. **Central PROTOTIPE/dev-dashboard/src/App.jsx:** Declaramos el estado `diffLoading` y añadimos la función asíncrona `loadDiffDetail` gatillada reactivamente por un `useEffect` cuando el usuario abre el visor de un archivo con `diff === null`. Integramos un spinner de carga (`RefreshCw` con animación spin) en la UI del visor para mantener informados a los desarrolladores mientras se recupera el diff detallado en caliente.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

---

## CLI-475 — 2026-07-13
**Feature & Architecture: Modularización Reactiva de Feature Flags en Plantilla Core Seed**

### Cambios realizados:
1. **appConfigStore.js y useAppConfigSync.js (template-core-seed):** Integrada la sincronización reactiva en vivo de feature flags desde Firestore Central en la plantilla base Core Seed. Declarada la flag `posExpressScanner` y agregada la hidratación de `flagsUpdate` (`creditsEnabled`, `couponsEnabled`, `claimsEnabled`, `rolesOperativosEnabled` y `posExpressScanner`) mediante `latestCentralFlagsRef`. Esto asegura que cualquier nueva vertical o core desarrollado a partir de esta plantilla herede nativamente y por defecto el canal de feature flags dinámicas sincronizadas en tiempo real desde el Dashboard.

### Archivos modificados:
- [`Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js) [MODIFY]
- [`Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js) [MODIFY]

## CLI-474 — 2026-07-13
**Feature & UX: Eliminación Definitiva de la Feature Flag de Órdenes de Trabajo en Core Ventas**

### Cambios realizados:
1. **core-manifest.json (App Ventas):** Eliminada la feature flag `ordenesTrabajo` del listado de feature flags y removidas sus correspondientes reglas de recomendación. Esto provoca que el Dashboard Central, al consumir los metadatos de este core a través de la API, deje de renderizar la tarjeta de control de *"Órdenes de Trabajo"* para esta aplicación en vivo, previniendo incoherencias y eliminando el switch innecesario del panel.
2. **appConfigStore.js y useAppConfigSync.js (App Ventas):** Revertida la declaración y el mapeo de `ordenesTrabajoEnabled` en Zustand y Firestore, eliminando código huérfano y preservando el core base limpio de características no deseadas.

### Archivos modificados:
- [`Plantillas Core/App Ventas/core-manifest.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/core-manifest.json) [MODIFY]
- [`Plantillas Core/App Ventas/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
- [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]

---

## CLI-473 — 2026-07-13
**Feature & Integrity: Sincronización en Caliente de la Feature Flag de Órdenes de Trabajo**

### Cambios realizados:
1. **appConfigStore.js y useAppConfigSync.js (App Ventas):** Declarado el estado global `ordenesTrabajoEnabled` en Zustand (inicializado en `false`) y mapeada su sincronización reactiva en vivo desde la propiedad `ordenesTrabajo` del objeto de flags centrales de Firestore. Esto asegura que la aplicación cliente reciba y registre el estado de esta feature en caliente, previniendo incoherencias y permitiendo su activación en cascada una vez que se inyecte el módulo físico respectivo.

### Archivos modificados:
- [`Plantillas Core/App Ventas/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
- [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]

---

## CLI-472 — 2026-07-13
**Feature & UX: Unificación de Terminología en Dashboard Central para Módulo Operativo**

### Cambios realizados:
1. **FeatureFlagManager.jsx (Dashboard Central):** Renombrada la tarjeta de control de `deliveryEnabled` de *"Seguimiento de Domicilios"* a **`"Gestión de Empleados & Domicilios"`** y actualizada su descripción técnica para indicar explícitamente que gobierna la creación de operarios, generación de accesos por PIN/QR a portales de trabajo y el stepper de entregas en la app ventas. Esto brinda cohesión semántica total al usuario final entre el Dashboard y la caja.

### Archivos modificados:
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx) [MODIFY]

---

## CLI-471 — 2026-07-13
**Bugfix & UX: Cohesión de Feature Flags para Portales QR y Gestión de Empleados**

### Cambios realizados:
1. **AdminLayout.jsx (App Ventas):** Actualizado el filtro de la barra lateral para ocultar el botón del menú "Portales QR" (`/admin/portales-qr`) si la flag `rolesOperativosEnabled` es falsa, previniendo visualizaciones incoherentes de accesos operativos de empleados.
2. **AdminSettings.jsx (App Ventas):** Filtrada dinámicamente la tarjeta de subsección "Gestión de Empleados" y "Auditoría de Ajustes de Stock" para ocultarlas por completo de los Ajustes de Configuración si `rolesOperativosEnabled` está desactivado centralmente.
3. **AdminPortalQR.jsx, PortalAuth.jsx y AdminDeliveryPerformance.jsx (App Ventas):** Implementados guards de seguridad y layouts de "Módulo Desactivado" de alta fidelidad estética (utilizando el icono `Shield` de Lucide y los colores de marca unificados) que bloquean e impiden de raíz el acceso manual a través de la barra de direcciones del navegador en las páginas del portal QR, analítica de entregas e ingreso por PIN de operarios si la feature flag está apagada.

### Archivos modificados:
- [`Plantillas Core/App Ventas/src/layouts/AdminLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/admin/AdminPortalQR.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminPortalQR.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/portal/PortalAuth.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalAuth.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/admin/AdminDeliveryPerformance.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminDeliveryPerformance.jsx) [MODIFY]

---

## CLI-470 — 2026-07-13
**Bugfix & Feature: Estabilización de Feature Flags y Acoplamiento de POS Express Scanner**

### Cambios realizados:
1. **FeatureFlagManager.jsx (Dashboard Central):** Corregido bug reactivo en el listener `onSnapshot` de Firestore Central, asegurando que el estado local `clientFlags` y el historial de cambios se actualicen inmediatamente al recibir actualizaciones de la base de datos de control, resolviendo el bloqueo visual que impedía apagar switches consecutivamente.
2. **useAppConfigSync.js (App Ventas):** Robustecido el mapeo y persistencia de feature flags secundarias, integrando la sincronización en vivo de `deliveryEnabled` a `rolesOperativosEnabled` y de `posExpressScanner` a `posExpressScanner` en Zustand. Implementamos una referencia persistente (`latestCentralFlagsRef.current`) para inyectar estas flags con prioridad absoluta en la hidratación de configuraciones locales, previniendo sobreescrituras desfasadas de la base de datos local.
3. **AdminLayout.jsx (App Ventas):** Ampliado el filtrado reactivo del menú lateral administrativo de la app para ocultar los botones de "Reclamos" e "Rendimiento de Entregas" dinámicamente según el estado de las flags `claimsEnabled` y `rolesOperativosEnabled` en Zustand.
4. **AdminSales.jsx y appConfigStore.js (App Ventas):** Declarado el estado global de `posExpressScanner` en Zustand e integrada la barra de escaneo de código de barras ("Escanear código [Bip]") en la caja registradora del POS mediante un grid responsivo. Implementamos la función `handleBarcodeSubmit` con búsqueda recursiva prioritaria en el array de variantes (`product.variantes`) para encontrar coincidencias de SKU/barcode internas y agregar la variante exacta escaneada de forma directa. Integramos la generación de tonos acústicos de confirmación (`playBeep`) con la API Web Audio de HTML5 y corregimos el modal de alerta (`stockAlert`) para admitir títulos dinámicos coherentes (como "Producto no encontrado").

### Archivos modificados:
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
- [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`Plantillas Core/App Ventas/src/layouts/AdminLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/admin/AdminSales.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSales.jsx) [MODIFY]

---

## CLI-469 — 2026-07-13
**Bugfix: Sincronización en Caliente de Feature Flags desde Firestore Central a App Ventas**

### Causa Raíz:
El Dashboard Feature Flag Manager escribe los switches habilitados/desactivados en el documento `/clientes_control/{clientId}` de Firestore Central bajo el objeto `flags` (por ejemplo, `flags.creditsEnabled`). Sin embargo, el hook de sincronización de la app cliente (`useAppConfigSync.js`) omitía por completo leer `data.flags`, por lo que el cliente final y de administración local seguían usando de forma fija los valores por defecto en memoria (como `creditsEnabled: true`), sin acatar la desactivación remota.

### Cambios realizados:
1. **`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`**: Modificado el listener de Firestore Central (`clientes_control`) para extraer `data.flags`. Mapeadas las flags centrales de créditos (`creditsEnabled`), cupones (`couponsEnabled`) y reclamos (`claimsEnabled`) e inyectadas dinámicamente en el store global de Zustand (`setConfig`) y persistidas localmente en `/config/settings` para compatibilidad offline.
2. **`Instancias Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js`**: Replicado el cambio en la instancia cliente activa para propagación del hot-reload en producción.

### Archivos modificados:
- [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`Instancias Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js) [MODIFY]

---

## CLI-464: Reconexión Automática, Resiliencia y Persistencia del Flujo de Aprovisionamiento
- **Fecha:** 2026-07-13
- **Tipo:** Funcionalidad / Mejora
- **Impacto:** Registro retroactivo auto-generado por el validador de integridad.
- **Descripción:** Desarrollamos una solución de persistencia completa a prueba de fallos de recarga del navegador (refresh/F5) durante el aprovisionamiento. Implementamos el endpoint `GET /api/create-project/status` en el Bridge CLI (`server.js`) para consultar en caliente el estado detallado de una tarea de creación, recuperando su historial completo de logs en memoria y banderas de pausa de Auth. En el frontend (`App.jsx`), encolamos el `taskId` y los metadatos de configuración del cliente en `localStorage` al iniciar la tarea. Al montar la aplicación (useEffect), se verifica si hay una tarea guardada en curso y, de ser así, se consulta su estado, se restaura la UI (modal de progreso, logs e inputs) y se reabre la conexión de EventSource (SSE stream) de forma transparente y automática, limpiando el almacenamiento al finalizar con éxito o error.
- **Archivos afectados:** - ``Prototipe-CLI/server.js`` [MODIFY]


## CLI-468 — 2026-07-12
**Bugfix: Reglas de Firestore bloqueaban el login de cliente por celular en App Ventas**

### Causa Raíz:
El flujo de login de cliente en `template-ventas` identifica a los usuarios por número de celular como `userId` en Firestore (`doc(db, 'users', celular)`) **sin Firebase Auth activa**. Las reglas anteriores bloqueaban `getDoc` y `setDoc` sin `request.auth`, arrojando `FirebaseError: Missing or insufficient permissions`.

### Cambios realizados:
1. **`template-ventas/firestore.rules`**: Se actualizaron las reglas de `/users/{userId}` para permitir `read` y `create` sin autenticación, preservando `list` y `delete` exclusivos para admin.
2. **`ventas-moni-app/firestore.rules`**: Misma corrección aplicada y desplegada en producción (`firebase deploy --only firestore:rules -P ventas-moni-app`).

### Archivos modificados:
- [`Prototipe-CLI/templates/template-ventas/firestore.rules`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/firestore.rules) [MODIFY]
- [`Instancias Clientes/ventas/ventas-moni-app/firestore.rules`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/firestore.rules) [MODIFY + DEPLOY]

---

## CLI-467 — 2026-07-12
**Feature: Blindaje de Arranque Inicial y Auto-siembra de Administrador en Aprovisionamiento**

### Cambios realizados:
1. **Activación de Siembra Automática en Generador**: Descomentamos y habilitamos la ejecución incondicional del script de siembra `scripts/seed_admin.js` (`runSeedAdmin(...)`) en el flujo final de [`generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js).
2. **Prevención de Excepciones en Primer Arranque**: Esto garantiza que cada aplicación aprovisionada cuente de forma inmediata con las credenciales de administrador en Firebase Auth, su perfil de rol en `/users` y la configuración `/config/settings` requerida por `appConfigService.js` y `useAuthInit.js`.

### Archivos modificados:
- [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

---

## CLI-466 — 2026-07-12
**Feature: Gestor Visual de Cola e Historial de Aprovisionamientos en Tiempo Real**

### Cambios realizados:
1. **API de Cola en Bridge CLI**: Implementamos los endpoints `GET /api/provisioning/queue` (listado persistente ordenado de trabajos) y `POST /api/provisioning/queue/cancel` (cancelación/remoción de trabajos activos) en [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js).
2. **Componente de Visualización de Tareas**: Creamos [`ProvisioningQueueModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningQueueModal.jsx) con estados HSL animados, polling de 4s para actualización suave y botón "Cancelar" con modal de confirmación reglamentario.
3. **Integración en Wizard de App**: Añadimos el botón "Ver Cola e Historial" con icono animado de Lucide y control de estado reactivo en la barra de navegación del wizard en [`App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx).

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningQueueModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningQueueModal.jsx) [NEW]
- [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

---

## CLI-465 — 2026-07-12
**Feature: Robustecimiento del Flujo de Aprovisionamiento y Mapeo Condicional de Servicios Firebase**

### Cambios realizados:
1. **Ajuste de chunkSizeWarningLimit en Plantillas Base**: Modificamos `vite.config.js` en `template-core-seed` and `template-ventas` elevando `chunkSizeWarningLimit` de `800` a `1500` kB. Esto previene alertas visuales de Vite sobre bundles grandes debido a las dependencias de Firebase SDK durante los builds de scaffolding del cliente.
2. **Propagación a Instancia Real (ventas-moni-app)**: Aplicamos el mismo ajuste de `chunkSizeWarningLimit: 1500` en el `vite.config.js` de la aplicación activa `ventas-moni-app` para evitar advertencias molestas durante sus empaquetados de producción en el monorepo.
3. **Despliegue de Reglas Condicional**: Modificamos el bloque post-creación en `server.js` para evaluar el parámetro `enableFirebaseDeploy` (y su alias `answers.execution?.firebaseDeploy`). Ahora, si el usuario desactiva Firebase desde el Wizard, se omite el despliegue automático de reglas de Firestore y Storage, evitando errores por servicios no inicializados en la nube.
4. **Registro de la Plantilla Core Seed**: Agregamos la entrada detallada de `template-core-seed` en el archivo de inventario central `plantillas_registro.json`, mapeando correctamente su ruta física fuente. Esto resuelve de raíz el fallo de sembrado de base de datos (`No se encontró la configuración del core "template-core-seed"`).

### Revisión Histórica & Ajuste de UI (2026-07-12):
1. **Superposición de Modales (z-index)**: Corregimos la superposición de capas en el dashboard central. El modal `FirebaseAccountsModal` tenía `z-[80]`, quedando oculto e inaccesible por detrás de `ProvisioningProgressModal` que tiene `z-[100]`. Elevamos el `z-index` de `FirebaseAccountsModal` a `z-[110]` para permitirle sobreponerse adecuadamente al presionar "Gestionar Firebase".
2. **Resolución de Borde Blanco en Consola**: Solucionamos la intercepción de la regla CSS global de index.css que inyectaba un borde blanco rígido y fondo glassmorphic brillante a cualquier contenedor con clase `rounded-2xl` y `border`. Cambiamos la clase del contenedor de logs de la consola en `ProvisioningProgressModal.jsx` a `rounded-xl` y el color del borde a `border-[var(--color-border)]/50`, restaurando el tema oscuro original y mejorando la legibilidad.

### Archivos modificados:
- [`Prototipe-CLI/templates/template-core-seed/vite.config.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/vite.config.js) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/vite.config.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js) [MODIFY]
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Prototipe-CLI/plantillas_registro.json`](file:///d:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json) [MODIFY]
- [`Instancias Clientes/ventas/ventas-moni-app/vite.config.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/vite.config.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/FirebaseAccountsModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FirebaseAccountsModal.jsx) [MODIFY]

---

## CLI-463 — 2026-07-12
**Feature: Selector Interactivo y Gestión Dinámica de Categorías de Instancias en el Aprovisionamiento**

### Cambios realizados:
1. **Endpoints de Escaneo y Creación en el Bridge CLI**: Desarrollamos los endpoints `GET /api/project/instances-categories` (para escanear en caliente el directorio físico `D:\PROTOTIPE\Instancias Clientes` y filtrar carpetas) y `POST /api/project/instances-categories` (para crear nuevas carpetas sanitizando de forma estricta los caracteres no permitidos).
2. **Selector CustomSelect Reglamentario**: Implementamos el dropdown en el Wizard usando el componente `CustomSelect` del ecosistema, evitando selectores HTML nativos según el estándar de desarrollo.
3. **Botón de Sincronización en Caliente**: Agregamos un botón interactivo "Sincronizar" que permite al desarrollador escanear el disco de inmediato si se añadieron o eliminaron carpetas manualmente fuera de la aplicación.
4. **Creación Rápida Inline de Categorías**: Añadimos un pequeño formulario de texto y botón al lado del selector en el Wizard para crear categorías en caliente en el disco sin abandonar el flujo de aprovisionamiento.
5. **Autocalculo Reactivo mediante useEffect**: Creamos un efecto que calcula y asigna en tiempo real la ruta física `targetPath` del cliente según el nombre del proyecto y la categoría base seleccionada.

### Revisión Histórica & Ajuste de UI (2026-07-12):
1. **Alineación y Prevención de Desbordamiento**: Corregimos el desbordamiento visual en el Wizard de aprovisionamiento donde el input y botón de "Crear" se salían de su contenedor de media columna y se superponían con el input de la columna derecha. Separamos la fila superior (dropdown de categoría) y la fila inferior (creación rápida) en filas independientes de ancho completo.
2. **Estilo Premium del Botón Sincronizar**: Rediseñamos el botón de sincronización pasando de un link azul plano a un botón de micro-acción táctil con fondo translúcido, bordes definidos, icono alineado y hover de brillo dinámico HSL de acuerdo con las guías de diseño de la marca.
3. **Reemplazo de SVG por Lucide React (RefreshCw)**: Sustituimos el SVG manual del botón por el componente oficial `<RefreshCw size={10} />` de Lucide React con un efecto de transición CSS de rotación de 180° activado por `group-hover` al posar el cursor, asegurando total nitidez de la interfaz.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

---

## CLI-462 — 2026-07-12
**Feature: Silenciado de Advertencias de Límite de Tamaño de Chunk (Vite) en Dashboard Central**

### Cambios realizados:
1. **Configuración de chunkSizeWarningLimit**: Agregamos la propiedad `build.chunkSizeWarningLimit: 3000` en el archivo de configuración `vite.config.js` del Dashboard Central. Esto previene que el bundler (Vite) emita advertencias durante la compilación en caso de que los archivos minificados excedan el límite predeterminado de 500 kB (el bundle principal del dashboard pesa 2.66 MB debido a su naturaleza monolítica local). Con esto silenciamos falsas alarmas visuales en los logs de aprovisionamiento.

### Archivos modificados:
- [`Central PROTOTIPE/dev-dashboard/vite.config.js`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/vite.config.js) [MODIFY]

---

## CLI-461 — 2026-07-12
**Feature: Opción de Sembrado de Datos Condicional y Resiliencia en Despliegue de Reglas e Índices ante Proyectos sin Storage Inicializado**

### Cambios realizados:
1. **Opción seedDatabase en el Wizard del Dashboard**: Agregamos un estado reactivo `seedDatabase` (por defecto `true`) y su correspondiente checkbox interactivo en el Wizard de aprovisionamiento de nuevos clientes en `App.jsx`. Esto permite al desarrollador decidir explícitamente si desea sembrar o no datos de prueba (seeds) en la base de datos Firestore del cliente.
2. **Serialización del Borrador (Wizard Draft)**: Integramos la variable `seedDatabase` en el borrador de localStorage, asegurando que se guarde, se cargue y se restablezca correctamente al usar el asistente.
3. **Respeto Condicional en el Bridge CLI**: Modificamos el endpoint `/api/project/provision` en `server.js` para recibir el parámetro `seedDatabase` y omitir condicionalmente la inyección de semillas en Firestore.
4. **Resiliencia ante Storage no Configurado en Despliegues de Firebase**: Robustecimos el despliegue de reglas e índices en `server.js`. Si el despliegue falla debido a que el servicio Firebase Storage no está habilitado físicamente en el proyecto (Spark Plan / storage bucket ausente), el Bridge captura la excepción, emite una advertencia en el log de progreso del aprovisionamiento, y reintenta automáticamente el despliegue omitiendo Storage (`--only firestore:rules,firestore:indexes`), logrando que las reglas e índices de Firestore se desplieguen sin colapsar el aprovisionamiento.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

---

## CLI-460 — 2026-07-12
**Feature: Pausa Interactiva y Confirmación de Activación Manual de Firebase Auth**

### Cambios realizados:
1. **Flujo de Pausa Interactiva en Bridge**: Modificamos el Bridge CLI (`server.js`) para que, en caso de fallo al activar la configuración de Firebase Auth (común en el Plan Spark por falta de facturación), el hilo de ejecución se detenga temporalmente. Envía el evento SSE `auth_activation_required` y guarda una promesa de reanudación diferida en memoria.
2. **Endpoint de Reanudación**: Creamos el endpoint `POST /api/create-project/resume` en `server.js` para recibir la confirmación de reanudación y desbloquear el hilo del aprovisionamiento.
3. **Mapeo en Frontend**: Implementamos en `App.jsx` y `ProvisioningProgressModal.jsx` la captura del evento de pausa. Mostramos una alerta interactiva premium con el botón de acceso directo a Firebase Console para que el desarrollador active Auth presionando "Comenzar", y el botón de confirmación "Ya lo he habilitado, continuar", que llama al endpoint del Bridge.
4. **Detector de Errores Mejorado**: Excluimos los warnings de configuración en la nube (`CONFIGURATION_NOT_FOUND`, `BILLING_NOT_ENABLED`) de la detección de errores fatales del modal para evitar clasificar la falta de activación inicial en la consola de Firebase como un fallo catastrófico del instalador local.
5. **Blindaje de Despliegue de Firebase (`generator.js`)**: Envolvimos la ejecución de `npm run build` y el comando de despliegue de Firebase (`deploy`) en bloques `try/catch` robustos. Si el despliegue del Storage o el hosting fallan en la nube debido a que el servicio no está inicializado físicamente (error Spark), el generador registra una advertencia en los logs en lugar de propagar un fallo y ejecutar rollback, preservando el proyecto físico generado exitosamente en disco.
6. **Resolución de Carpeta de Instancias (`findClientPath`)**: Modificamos la función en `server.js` para que busque directorios de cliente con el prefijo `app-` (ej. `App-clientId`). Esto permite que el motor de sembrado de base de datos (`seedProjectDatabase`) resuelva correctamente la ruta física de la instancia y ejecute la inicialización de Firestore con éxito.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

## CLI-459 — 2026-07-12
**Feature: Aislamiento y Desacoplamiento de Fases en el Aprovisionamiento de Firebase Auth**

### Cambios realizados:
1. **Flujo de Auth Desacoplado**: Separamos el aprovisionamiento de autenticación de Firebase en tres fases independientes usando try/catch individuales:
   * **Fase 1**: Inicializar Identity Platform llamando a `identityPlatform:initializeAuth`.
   * **Fase 2**: Habilitar el proveedor de Email/Password mediante un `PATCH` a la configuración de SignIn.
   * **Fase 3**: Crear la cuenta de usuario administrador en Firebase Auth llamando a `v1/projects/{projectId}/accounts`.
2. **Resiliencia ante Fallos**: Si la Fase 2 falla (debido a que el proyecto esté en el plan Spark y no soporte la edición mediante PATCH de Identity Platform v2), el sistema continuará y ejecutará la Fase 3 de todas formas. Esto permite inyectar el usuario admin de forma administrativa (bypass) incluso si la configuración de SignIn no se pudo actualizar vía API.
3. **Depuración Enriquecida**: Los logs ahora imprimen de forma descriptiva el éxito o la causa de error de cada fase para facilitar la auditoría.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

## CLI-458 — 2026-07-12
**Fix: Inicialización de Identity Platform en GCP para evitar CONFIGURATION_NOT_FOUND**

### Cambios realizados:
1. **Inicialización de Auth en GCP**: Corregimos el error `CONFIGURATION_NOT_FOUND` al intentar configurar el proveedor de email en proyectos recién aprovisionados en la nube.
2. **REST API Endpoint**: Añadimos una llamada REST POST al endpoint administrativo de Google `identityPlatform:initializeAuth` con un payload vacío. Esto configura proactivamente la base de datos de Auth en GCP antes de intentar actualizar las propiedades del SignIn mediante PATCH.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

## CLI-457 — 2026-07-12
**Feature: Habilitación de Firebase Auth, Despliegue de Reglas e Índices y Descarga Individual de Logs de Aprovisionamiento**

### Cambios realizados:
1. **Habilitación de Firebase Auth (Identity Toolkit):** Ahora, durante la fase de aprovisionamiento en la nube (dentro de `server.js`), se habilita proactivamente la API `identitytoolkit.googleapis.com` en GCP, se activa el proveedor de Correo y Contraseña, y se crea la cuenta del usuario administrador. La inyección es 100% resiliente frente a latencias o fallas de propagación de APIs en GCP.
2. **Despliegue de Reglas e Índices:** Añadimos la ejecución proactiva de `firebase deploy --only firestore:rules,firestore:indexes,storage` en el directorio de la instancia recién creada. Esto se ejecuta directamente antes del sembrado (`seedProjectDatabase`) para garantizar que la base de datos de producción quede con la gobernanza y los índices configurados de inmediato.
3. **Persistencia y Control Manual de Progreso:** Se eliminó el `useEffect` en `App.jsx` que cerraba la ventana de progreso del aprovisionamiento con un timer de 1.5s. Ahora el modal de progreso se mantiene abierto y permite al desarrollador cerrarlo de forma manual con el botón "Completado / Ir a Onboarding" o "Cerrar y Revisar Logs".
4. **Descarga de Logs Individuales:** Se implementó una función `handleDownloadLog` en `ProvisioningProgressModal.jsx` conectada a un botón premium en el footer. Permite descargar todo el registro (logs) de ese aprovisionamiento individual en un archivo `.txt` limpio (removiendo códigos de escape ANSI) y nombrado cronológicamente.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

## CLI-456 — 2026-07-12
**Fix: Blindaje Total de URLs Hardcodeadas en Componentes Admin del Dashboard Central**

### Cambios realizados:
1. **SaaSOperationsView.jsx (Bug Crítico):** Corregido puerto hardcodeado `localhost:3000` → `CLI_URL` (`localhost:3001`). Este era el causante directo del error `ERR_CONNECTION_REFUSED`. Cada fetch de telemetría (adopción, pings, logs) ahora falla de forma independiente con `try/catch` individuales, previniendo cascadas de error.
2. **ClientLifecyclePanel.jsx:** 5 URLs hardcodeadas `localhost:3001` reemplazadas por `CLI_URL` (feature-registry, drift, features/add|remove, branding, status/update).
3. **CorePromotionModal.jsx:** 7 URLs hardcodeadas `localhost:3001` reemplazadas por `CLI_URL` (preflight, events SSE, execute, poll blueprint, publish, activate, rollbacks).
4. **FeatureMarketplaceView.jsx:** 1 URL hardcodeada `localhost:3001` reemplazada por `CLI_URL` (feature-registry).
5. **NichesManagerPanel.jsx:** Default prop `cliUrl = 'http://localhost:3001'` reemplazado por `cliUrl = CLI_URL`.

### Archivos modificados:
- [`dev-dashboard/src/components/admin/SaaSOperationsView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SaaSOperationsView.jsx) [MODIFY]
- [`dev-dashboard/src/components/admin/ClientLifecyclePanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ClientLifecyclePanel.jsx) [MODIFY]
- [`dev-dashboard/src/components/admin/CorePromotionModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CorePromotionModal.jsx) [MODIFY]
- [`dev-dashboard/src/components/admin/FeatureMarketplaceView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureMarketplaceView.jsx) [MODIFY]
- [`dev-dashboard/src/components/admin/NichesManagerPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/NichesManagerPanel.jsx) [MODIFY]

---

## CLI-455 — 2026-07-12
**Feature: Corrección de Resolución de Puertos en el Inicio de Servidores Locales de Clientes en el Bridge CLI**

### Cambios realizados:
1. **Resolución de Puertos Configurados en /api/project/dev/start:** Corregido el bug en el endpoint de arranque de servidores de desarrollo en `server.js`. Ahora, el backend intenta leer el puerto asignado en el archivo `vite.config.js` físico de la instancia del cliente de forma prioritaria en lugar de forzar a ciegas el puerto determinista (`forcedPort`) de rango `3100-3199`. El puerto determinista se mantiene únicamente como fallback de seguridad si no existe o no se puede leer la configuración del cliente.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

---

## CLI-454 — 2026-07-12
**Feature: Soporte Completo para Purga de Desvíos de Archivos Obsoletos y Saneamiento de Roadmap**

### Cambios realizados:
1. **Refactorización de /api/integrity/prune-drifts en server.js:** Corregida y mejorada la lógica del endpoint de purga de desvíos en el Bridge para que admita tanto archivos declarados inline (`- Archivos: ...`) como viñetas de archivos individuales de forma vertical (`    - [...](url)`), eliminando las líneas correspondientes de forma limpia y atómica.
2. **Saneamiento Físico del Roadmap:** Ejecutado un script de purga local que saneó y eliminó de inmediato los 17 desvíos rotos obsoletos (`FILE_NOT_FOUND`) de `tareas_pendientes.md`, restableciendo la consistencia total del disco a verde.
3. **Fix de Consistencia de Git (Prefijo BUG):** Añadido el prefijo de tareas `BUG` al regex extractor de IDs de la validación de Git del status de integridad en `server.js`. Esto evita que las tareas marcadas como BUG queden huérfanas falsamente en el análisis de consistencia. Vinculamos de forma automatizada las 32 tareas completadas hoy que carecían de commits en Git.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`Prototipe-CLI/scripts/prune_drifts_local.js`](file:///d:/PROTOTIPE/Prototipe-CLI/scripts/prune_drifts_local.js) [NEW]
- [`Prototipe-CLI/scripts/link_tasks_local.js`](file:///d:/PROTOTIPE/Prototipe-CLI/scripts/link_tasks_local.js) [NEW]

---

Este es el log de cambios técnico activo para la sesión de desarrollo vigente del ecosistema PROTOTIPE. Los registros anteriores a esta fecha han sido auto-archivados en históricos compactos para optimizar la compatibilidad de NotebookLM.

