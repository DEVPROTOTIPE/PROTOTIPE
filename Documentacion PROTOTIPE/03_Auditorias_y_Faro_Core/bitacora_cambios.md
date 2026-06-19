# Bitácora de Cambios - Prototype CLI & Ecosistema (General)

### [2026-06-19] - Stock Infinito para Productos Preparados / Ilimitados - App Ventas
* **Tipo:** Core / Inventario / Transacciones / Firebase / UI/UX
* **Descripción de Cambios:**
  - **Soporte en Esquemas:** Agregado el campo opcional `stockInfinito` de tipo booleano al esquema de validación Zod `productSchema` en `inventorySchemas.js` para asegurar consistencia e integridad de tipos.
  - **Toggle UI en Formulario:** Añadido un interruptor/checkbox premium en `ProductFormModal.jsx` dentro de `renderVariantsSection` para marcar el producto como ilimitado. Si el producto tiene stock infinito activo, los inputs de stock (tanto en vista de producto simple como en variante múltiple) se ocultan o muestran un indicador de lectura "∞ Ilimitado", y se omite la validación numérica del stock en el modal.
  - **Transformación de Datos al Guardar:** Modificada la preparación de datos del formulario en `ProductFormModal.jsx` para forzar el valor de stock de todas las variantes a `9999` cuando `stockInfinito` sea verdadero. Esto asegura compatibilidad nativa con la lógica existente de stock ilimitado en el resto del front-end.
  - **Listados de Inventario:** Modificado `AdminInventory.jsx` (tabla de escritorio y tarjetas móviles) para detectar el flag `stockInfinito` y mostrar un badge de badge visual color morado con el texto "∞ Ilimitado" en lugar del conteo de unidades y alerta de stock bajo.
  - **Excepción de Alertas:** Actualizadas las funciones de cálculo de stock bajo en `AdminStockAlerts.jsx` y en las métricas de `AdminHome.jsx` para omitir y silenciar alertas de reabastecimiento en productos marcados con stock infinito.
  - **Blindaje Transaccional de Pedidos:** Modificado `orderService.js` en todos sus métodos de alteración de stock (`createOrder`, cancelación de órdenes en `updateOrderStatus`, completado de órdenes en `updateOrderStatus` y flujo de creación offline) para que verifiquen el flag `productInfo.data.stockInfinito` y omitan cualquier validación, decremento o restauración de stock de variantes, manteniendo intacta la contabilidad de ventas `salesCount`.
  - **Visualización en Tienda de Clientes (Pulido):** Modificado `ProductDetailPage.jsx` para que muestre el badge `"Disponible"` en lugar de `"9999 disponibles"`. Modificados también `ProductCard.jsx` y `ProductDetailModal.jsx` para reescribir `isOutOfStock` (fuerza `false`), `stockConsolidado` (fuerza `9999`) y `isUnlimited` para considerar de manera proactiva el flag `stockInfinito` del producto. Se limitó el selector de cantidad máxima a `999` en productos ilimitados.
* **Archivos Modificados:**
  - [inventorySchemas.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/schemas/inventorySchemas.js) [MODIFY]
  - [ProductFormModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]
  - [AdminInventory.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]
  - [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY]
  - [AdminStockAlerts.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminStockAlerts.jsx) [MODIFY]
  - [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]
  - [ProductDetailPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [ProductCard.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
  - [ProductDetailModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]

### [2026-06-19] - Rediseño Premium de la Gestión de Pedidos (Laboratorio Visual Fase 2) - App Ventas
* **Tipo:** Core / UI/UX / Rediseño / Responsividad
* **Descripción de Cambios:**
  - **Tarjeta Comanda Asimétrica:** Refactorizado el maquetado de `OrderCard` en `AdminOrders.jsx` para adoptar la estructura responsiva asimétrica de 12 columnas en desktop, elástico y adaptado al tema. En móviles, se reordenaron los elementos estructurando una cabecera con el número de pedido y badges, un contenedor interno para agrupar los artículos con icono de paquete y un pie de página limpio con el monto y los botones interactivos (QR y Chevron) de forma simétrica sin eliminar ninguna variable ni funcionalidad.
  - **Grid de Métricas Rápidas Estilo Wallet:** Rediseñado el grid de tarjetas de métricas rápidas (Pendientes, Completados, Créditos) usando bordes finos responsivos, curvatura amplia `rounded-3xl` y hover de escala suave. La tarjeta de Créditos cuenta con una animación de brillo elástica que utiliza la variable CSS `--color-primary-light` dinámica para adaptarse a cualquier tema activo (ej. SmartFix) sin colores rígidos hardcoded.
  - **Carrusel de Filtros Planos con Contadores:** Rediseñado el carrusel de filtros de estado para mostrar tarjetas wallet compactas con contadores dinámicos alimentados por `filterCounts`. Se incorporó el espaciado `-mx-4 px-4` en móviles para que fluya hasta el borde físico de la pantalla de forma impecable sin recortes de sombras.
* **Archivos Modificados:**
  - [AdminOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]

### [2026-06-19] - Estabilización de UI, Correcciones y Catálogo de Estilos - App Ventas
* **Tipo:** Core / UI/UX / Bugfix / Documentación / Estilos
* **Descripción de Cambios:**
  - **Adaptabilidad de Temas HSL:** Modificada la cabecera curvada superior y la tarjeta wallet de "Caja de Hoy" en `AdminHome.jsx` para usar el degradado dinámico de marca (`from-primary to-primary-dark`) en lugar de tonos estáticos.
  - **Diseño Sobrio y Coherente:** Rediseñadas las tarjetas secundarias de balances (`Ventas Totales`, `Por Cobrar`, `Pedidos`) a un estilo de superficie neutral (`bg-surface border border-app text-app`) con badges e iconos vectoriales Lucide en colores pastel translúcidos, eliminando colisiones visuales cromáticas de marca.
  - **Soporte de Hover sin Recortes:** Añadida la propiedad `md:overflow-visible` al contenedor de tarjetas, previniendo que en computadoras se corten los bordes y las sombras en el hover.
  - **Carrusel edge-to-edge en Celulares:** Integrado el margen negativo y el padding responsivo (`-mx-4 px-4`) en móviles, permitiendo que el carrusel se desplace libremente hasta los bordes físicos de la pantalla.
  - **Fijación de Bug de Scroll:** Modificado el componente helper `ThemeModalLock` en `AppearanceSettings.jsx` para restablecer la propiedad `overflow` del body a vacío (`''`) al desmontarse, solventando el bug de congelamiento de scroll al cerrar el modal de paleta de colores.
  - **Catálogo de Estilos Visuales:** Creado y catalogado el archivo de estándares de estilos del ecosistema en `catalogo_estilos_ui.md`.
* **Archivos Modificados:**
  - [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY], [AppearanceSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx) [MODIFY], [catalogo_estilos_ui.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Estilos/catalogo_estilos_ui.md) [NEW], [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

### [2026-06-19] - Rediseño Premium de Inicio del Administrador (Laboratorio Visual Fase 1) - App Ventas
* **Tipo:** Core / UI/UX / Rediseño / Responsividad
* **Descripción de Cambios:**
  - **Cabecera Curva con Degradado:** Implementada una cabecera superior curvada (`rounded-b-[40px]`) con degradado elástico de color primario a índigo. Muestra un saludo contextual dinámico basado en la hora, la fecha actual formateada en español y el logo de la tienda o fallback adaptativo sin deformaciones.
  - **Carrusel de Tarjetas Financieras (Wallet Cards):** Diseñado un grid-carrusel responsivo de tarjetas financieras con solape negativo (`-mt-12`). En móviles se desplaza de forma horizontal con comportamiento snap y ocultación de scrollbars. En computadoras se adapta a una rejilla.
  - **Maquetación Premium de Tarjetas:** Las 4 tarjetas de balance (`Caja de Hoy`, `Ventas Totales`, `Por Cobrar / Cartera`, `Pedidos y Alertas`) cuentan con degradados vibrantes, sombras de elevación premium y desgloses de ingresos (efectivo, transferencia y crédito).
  - **Transacciones Recientes:** Implementado un listado interactivo con los 5 pedidos más recientes. Cada ítem incluye el nombre del cliente (o "Venta POS"), identificador del pedido, fecha relativa e iconos vectoriales Lucide dinámicos rodeados por círculos en colores pastel translúcidos según su estado, con redirección inteligente.
  - **Accesos Rápidos:** Diseñados botones minimalistas de accesos directos con animaciones framer-motion de escala e interacción fluida.
* **Archivos Modificados:**
  - [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx)

### [2026-06-19] - Auditoría y Estabilización del Sistema de Notificaciones - App Ventas
* **Tipo:** Core / UI/UX / Robustez / Notificaciones / Bugfix
* **Descripción de Cambios:**
  - **Suscripción de Conteo en Tiempo Real:** Creada la función `subscribeToUnreadCount` en `notificationCenterService.js` para escuchar los documentos con `status == 'unread'` reactivamente desde Firestore. Refactorizado el hook `useNotificationCenter.js` para consumir esta suscripción en lugar del filtrado local en memoria del primer lote paginado, solucionando el bug de desajuste del contador de no leídos.
  - **Diseño Visual Dinámico y Premium:** Actualizado `NotificationHistoryTray.jsx` para importar de manera selectiva y renderizar dinámicamente iconos premium de `lucide-react` en base a `meta.icon` (en lugar de la campana `🔔` estática), mapeados con clases literales de color del sistema de diseño Tailwind para evitar la depuración del linter y optimizar la UX.
  - **Pipeline de Toasts Robustecida:** Refactorizado el useEffect generador de Toasts en `AdminLayout.jsx`, `ClientLayout.jsx` y `PortalLayout.jsx`. Ahora itera sobre todas las notificaciones no leídas recientes (edad < 20 segundos) que no estén ya encoladas localmente, asegurando que múltiples notificaciones concurrentes (por ejemplo, pedidos y abonos que llegan juntos) muestren su respectiva ventana flotante sin omitir avisos.
  - **Limpieza de Linter:** Removida la importación no utilizada `AlertTriangle` en `PortalMensajero.jsx` para garantizar un bundle libre de variables huérfanas.
* **Archivos Modificados:**
  - `notificationCenterService.js`, `useNotificationCenter.js`, `NotificationHistoryTray.jsx`, `AdminLayout.jsx`, `ClientLayout.jsx`, `PortalLayout.jsx`, `PortalMensajero.jsx`

### [2026-06-19] - Optimización de Bundle y Depuración de Importaciones (ESLint Clean Up) - App Ventas
* **Tipo:** Mantenimiento / Optimización / Calidad de Código
* **Descripción de Cambios:**
  - **Limpieza de Importaciones y Parámetros:** Depuradas importaciones en desuso de Firestore (como `getDoc`, `orderBy`, `addDoc`, `updateDoc`, `setDoc`, `where`, `query`) en los servicios de anuncios, inventario, órdenes, créditos, analíticas de códigos QR y seguimiento.
  - **Saneamiento de Firmas:** Removido el parámetro no utilizado `creditId` en `reportCreditPayment` (`creditService.js`) y `pin` en `authenticateEmployeeByPin` (`employeeService.js`).
  - **Resolución de Warnings en PDF:** Corregido en `pdfService.js` la inicialización inútil de la variable `saldo`, reemplazando el operador nullish coalescing `??` sobre `Number(...)` por `||` para mitigar el error de expresión nullish constante en ESLint, y removida la firma no utilizada de `orders` en `exportCreditsReportPDF`.
  - **Control de Linter en PortalVendedor:** Removidas las desestructuraciones redundantes de `appIcon` y `whatsappAdmin` en `PortalVendedor.jsx`, e inyectados comentarios de desactivación de la regla `react-hooks/set-state-in-effect` sobre llamadas de estado asíncronas / debounced seguras.
* **Archivos Modificados:**
  - `adService.js`, `clientNotificationService.js`, `creditService.js`, `employeeService.js`, `inventoryService.js`, `orderService.js`, `qrAnalyticsService.js`, `trackingAnalyticsService.js`, `pdfService.js`, `inventorySchemas.js`, `PortalVendedor.jsx`

### [2026-06-19] - Auditoría y Optimización de Créditos y Saldos (Módulo 5) - App Ventas
* **Tipo:** Core / UI/UX / Rendimiento / Base de Datos / Transacciones
* **Descripción de Cambios:**
  - **Estandarización de Modales:** Refactorizados los modales de abonos en `AdminCredits.jsx` y `ClientCredits.jsx` utilizando la plantilla común `ModalTemplate` de forma consistente, unificando estilos visuales, overlays y control de scroll.
  - **Eliminación de useOrders:** Removido por completo el hook `useOrders()` en `AdminCredits.jsx` eliminando la suscripción reactiva innecesaria a todos los pedidos del comercio al consultar cartera de deudas.
  - **Optimización de PDF de Cartera:** Modificada la función `exportCreditsReportPDF` en `pdfService.js` sustituyendo la consulta completa de la colección de créditos por una consulta filtrada a créditos activos (`where('estado', '==', 'activo')`), mitigando lecturas masivas en memoria.
  - **Blindaje Transaccional de Saldos:** Asegurada la expresión de cálculo de saldo pendiente en la transacción `addPaymentToCredit` de `creditService.js` implementando precedencia lógica correcta: `const currentSaldo = data.saldoPendiente ?? data.saldoPending ?? data.montoTotal`, evitando fallos de carrera o valores nulos.
* **Archivos Modificados:**
  - [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]
  - [ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY]
  - [pdfService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) [MODIFY]
  - [creditService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) [MODIFY]

### [2026-06-18] - Elaboración de Checklist de Auditoría del Core (App Ventas)
* **Tipo:** Mantenimiento / Auditoría / Documentación
* **Descripción de Cambios:**
  - **Creación de Checklist Técnico:** Diseñado y estructurado un checklist específico de control de calidad y blindaje técnico para la plantilla core `App Ventas`. Cubre auditoría de fugas de sesión, persistencia de lockout PIN, viewport en móvil para modales, inconsistencias de transacciones Firebase en Bodega, cuellos de botella por sincronización masiva IndexedDB en POS y condiciones de carrera en abonos de créditos.
  - **Sincronización de Mapas:** Registrada la entrada en `mapa_documentacion_ia.md` con su respectivo Criterio de Decisión y control en `tareas_pendientes.md`.
* **Archivos Modificados:**
  - [checklist_auditoria_core.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/checklist_auditoria_core.md) [NEW]
  - [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [tareas_pendientes.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

### [2026-06-12] - Registro Explícito de Rol 'client' en Nuevos Clientes (Ecosistema)
* **Tipo:** Consistencia de Base de Datos / Seguridad
* **Descripción de Cambios:**
  - **Inyección de Rol en Registro:** Se corrigió la discrepancia en la colección `/users` agregando de forma explícita el campo `role: 'client'` cuando se registra un cliente nuevo. Esto garantiza consistencia de esquema (ya que los administradores guardan `role: 'admin'`) y facilita validaciones en las reglas de seguridad.
* **Archivos Modificados:**
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]

### [2026-06-12] - Fix de Sesión Huérfana de Administrador en App Ventas (Ecosistema)
* **Tipo:** Bugfix / Autenticación / Base de Datos
* **Descripción de Cambios:**
  - **Auto-recreación de Perfil Admin:** Se corrigió un bug en la plantilla `App Ventas` donde, al limpiar la base de datos Firestore, un administrador logueado previamente mediante Firebase Auth era redirigido directamente al dashboard debido al listener de sesión en cache, sin recrear su documento en la colección `/users` (ya que el login manual era el único que ejecutaba la escritura).
  - **Implementación en Hook:** Modificado `src/hooks/useAuthInit.js` en la plantilla base de Ventas para que compruebe la existencia del documento en Firestore cuando el listener de Auth detecte una sesión activa y la cree si falta.
* **Archivos Modificados:**
  - [useAuthInit.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js) [MODIFY]

### [2026-06-12] - Remoción de Función de Gestión de Base de Datos
* **Tipo:** Refactorización / Remoción de código
* **Descripción de Cambios:**
  - **Eliminación en server.js:** Se eliminaron los endpoints `/api/project/database/collections` y `/api/project/database/cleanup` junto a los imports del SDK cliente de Firebase y helpers relacionados.
  - **Eliminación en App.jsx:** Se removió el botón "Base de Datos", los estados de React para control de colecciones (`dbManageModal`, `dbCollections`, etc.), los manejadores `handleLoadDbCollections`/`handleExecuteDbCleanup` y la maquetación del modal de confirmación de borrado.
* **Archivos Modificados:**
  - [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-12] - Corrección de Responsividad Móvil y Estructura en CRM de Clientes
* **Tipo:** UI/UX / Responsividad / Bugfix
* **Descripción de Cambios:**
  - **Grid de Cabecera:** Se rediseñó el contenedor de botones de acción global del CRM (`Sincronización Global`, `Despliegue Global`, `Telemetría Global`, `Nuevo Cliente`) para usar una cuadrícula responsiva de 2 columnas en mobile (`grid grid-cols-2 md:flex md:flex-wrap`) con botones de ancho completo, evitando desbordamientos de texto.
  - **Flexibilidad de Directorio:** Se reestructuraron los botones de acción del directorio de cada cliente (`Desplegar en Local`, `Base de Datos`, `Instalar Deps`, `Obtener Telemetría`, `Gestionar`) con propiedades flex-wrap, anchos mínimos (`min-w`) y alineación central, permitiendo que se acomoden simétricamente en pantallas estrechas sin truncarse.
  - **Resolución de Error de Sintaxis:** Se restauró la etiqueta contenedora de visualización de proyecciones que fue eliminada por error.
  - **Resolución de Bug de Búsqueda de Proyectos:** Se corrigió una falla lógica en la función `findProjectDir` de `server.js` que impedía resolver las rutas de proyectos de plantillas core (`Plantillas Core`) si la carpeta de instancias de clientes (`Instancias Clientes`) no estaba creada físicamente en el disco.
* **Archivos Modificados:**
  - [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-12] - Arquitectura General y Agnóstica de Skills de IA
* **Tipo:** Refactorización / IA Configuración
* **Descripción de Cambios:**
  - **Agnosticismo de Proyecto:** Actualizadas las 7 skills del ecosistema (`component_creator`, `component_extractor`, `git_strategist`, `integrity_compiler`, `onboarder_marcas`, `portar_componente`, `sandbox_integrator`) para remover referencias hardcodeadas a la plantilla `App Ventas`. Se introdujo la variable dinámica `[PROYECTO_ACTIVO]` con su orden de prioridades de resolución y la sección de "Rutas del Proyecto".
  - **Triggers Dinámicos:** Configurado el soporte para que los triggers acepten el parámetro opcional de proyecto (ej: `@crear-componente [PROYECTO_ACTIVO?]`).
  - **Mejoras Específicas por Skill:**
    * `component_creator`: Mapeo fuzzy en `getSandboxKey` en Paso 3, inyección de categorías válidas de biblioteca, y build bloqueante en Paso 5.
    * `component_extractor`: Actualizada la tabla de simulabilidad, criterio objetivo para manuales, protocolo de rollback y variantes.
    * `git_strategist`: Completada la descripción y agregado Paso 6 para resolución de conflictos.
    * `integrity_compiler`: Completada la descripción y unificadas rutas.
    * `onboarder_marcas`: Agregada plantilla para `.env.local` y reglas multi-vertical de onboarding.
    * `portar_componente`: Agregado control de dependencias npm faltantes y validación de versión de `lucide-react`.
    * `sandbox_integrator`: Establecida la tabla como fuente canónica de verdad y añadidas filas de simulabilidad.
* **Archivos Modificados:**
  - Archivos `SKILL.md` bajo `D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\Copia_Seguridad_Reglas_y_Skills\Skills\` [MODIFY]

### [2026-06-12] - Depuración de Rutas Obsoletas (D:\Aplicaciones)
* **Tipo:** Refactorización / Mantenimiento
* **Descripción de Cambios:**
  - **Eliminación en server.js:** Removido el fallback redundante y obsoleto `D:\Aplicaciones` de la rutina de resolución de proyectos `findProjectDir` en el servidor del CLI (`server.js`).
  - **Drift Detector CRM:** Implementados los endpoints `/api/project/drift` y `/api/project/sync-file` para evaluar diferencias downstream entre Cores y clientes.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Optimización de Chunks de Bundle y Refinamiento de Auditor PWA
* **Tipo:** Rendimiento / Optimización / Bundles
* **Descripción de Cambios:**
  - **Falsos positivos de auditoría:** Refinamiento de la API `/api/project/audit` en `server.js` para leer el manifest de Vite y omitir las penalizaciones por tamaño de chunks cargados dinámicamente.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Integración de Herramientas de Automatización en CLI Bridge Server
* **Tipo:** Nueva Característica / Automatización / CLI Bridge
* **Descripción de Cambios:**
  - **APIs de Automatización:** Redireccionados logs en `worker_create_project.js` por IPC y agregadas APIs `/api/library/extract`, `/api/project/deploy` y getters/setters de variables de entorno en `/api/project/env`.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [worker_create_project.js](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]


### [2026-06-13] - Reubicación de Apariencia y Colores a Ajustes de Desarrollador
* **Tipo:** Reubicación de Módulos / UI/UX / AdminSettings
* **Descripción de Cambios:**
  - **Reubicación de Módulo:** Movida la opción "Apariencia y Colores" (`apariencia`) del listado principal de ajustes del administrador al menú de herramientas internas de la "Zona de Desarrollador" (`dev-apariencia`), protegiéndola bajo el PIN maestro `DEV_PIN`.
  - **Prevención de Conflictos de Declaración:** Se renombró la propiedad del prop `handleSaveConfig` a `handleSaveThemeConfig` en la firma de `DeveloperSettings.jsx` y su correspondiente paso en `AdminSettings.jsx` para evitar la colisión de variables con la función local de guardado de configuraciones de desarrollo.
  - **Sincronización en Espejo:** Aplicada la reubicación de forma consistente tanto en el Core de la aplicación como en las plantillas empaquetadas de la CLI (`template-ventas`).
* **Archivos Modificados:**
  - [AdminSettings.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [AdminSettings.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [DeveloperSettings.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
  - [DeveloperSettings.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]

### [2026-06-13] - Rediseño de Cabecera y Tarjeta de Perfil de Administrador en Ajustes (UI/UX)
* **Tipo:** UI/UX / AdminSettings / Rediseño Perfil
* **Descripción de Cambios:**
  - **Eliminación de Traslape de Botones:** Removido el botón "Cerrar Sesión" del encabezado superior derecho para evitar la colisión visual y el traslape con la campana de notificaciones flotante del sistema.
  - **Tarjeta de Perfil de Administrador (Standout Style Dinámico):** Implementado un contenedor de perfil interactivo (`Admin Profile Card`) antes del listado de ajustes diseñado con una estética dinámica basada en el tema activo (`bg-primary/8`, borde izquierdo acentuado `border-l-4 border-l-primary` y bordes sutiles `border-primary/15`) para diferenciarlo visualmente y adaptar su color automáticamente al tema de marca actual.
  - **Identidad de Marca Adaptativa:** El avatar renderiza dinámicamente el logo de la tienda (`appIcon`) configurado por el administrador. En caso de no existir logo cargado, muestra de manera elegante el icono de un escudo de seguridad (`Shield`) centrado en color primario, montado sobre una caja plana clara (`bg-surface` y borde `border-primary/15`).
  - **Nombre Personalizado del Administrador:** El título principal de la tarjeta se vincula a `config.sellerName` (el nombre del administrador/vendedor configurable en Identidad de Marca) con fallbacks a `user.displayName` (cuenta de autenticación) y "Administrador".
  - **Ubicación del Botón de Cierre:** Integrado de manera adaptativa el botón "Cerrar Sesión" en la esquina de la tarjeta de perfil, con colores de advertencia suaves (`text-red-500` y botón `bg-red-500/10` con hover `bg-red-500/20`), optimizando el espaciado en PC y mobile.
* **Archivos Modificados:**
  - [AdminSettings.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [AdminSettings.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]

### [2026-06-13] - Accesos Rápidos de Reportes en Inventario y Créditos (UI/UX)
* **Tipo:** UI/UX / Navegación / AdminInventory / AdminCredits
* **Descripción de Cambios:**
  - **Acceso Rápido a Rotación de Stock:** Integrado un nuevo botón "Exportar Rotación" en `AdminInventory.jsx` (Tanto en Core como en la plantilla CLI) posicionado al lado del botón "Nuevo Producto". Utiliza de forma automática el rango del mes actual como valor predeterminado para el análisis y consume el hook `useOrders` para calcular la tasa de Sell-Through.
  - **Acceso Rápido a Cartera de Deudas:** Integrado un botón "Exportar Cartera" en `AdminCredits.jsx` al lado de la barra de búsqueda para emitir el PDF de cuentas por cobrar directamente desde la vista del módulo.
  - **Consistencia Responsiva y Priorización Móvil:** Estilizado mediante clases Tailwind `flex-col-reverse sm:flex-row` en el inventario para asegurar que en dispositivos móviles el botón de "Nuevo Producto" aparezca de forma prioritaria arriba de "Exportar Rotación", mientras que en PC se mantengan alineados horizontalmente sin desbordamiento.
* **Archivos Modificados:**
  - [AdminInventory.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]
  - [AdminInventory.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]
  - [AdminCredits.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]
  - [AdminCredits.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]

### [2026-06-13] - Corrección de Caja y Nuevo Reporte de Cuentas por Cobrar
* **Tipo:** Caja y Reportes / Cuentas por Cobrar / pdfService / AdminSalesDetail
* **Descripción de Cambios:**
  - **Corrección de Conciliación de Caja:** Se modificó `exportSalesReportPDF` en `pdfService.js` (Tanto en Core como en la plantilla CLI) para realizar una consulta dinámica a la colección `/credits`. Los créditos pagados (cuya orden es `'completado'` pero el método de pago original es `'credito'`) ya no se sumarán a la cartera por cobrar, sino que su saldo remanente real se reportará en "Por cobrar" (0 en caso de estar pagado) y la parte abonada/liquidada sumará a la caja líquida real.
  - **Reporte de Cuentas por Cobrar y Deudas:** Se creó la función `exportCreditsReportPDF` en `pdfService.js` para generar un reporte PDF exhaustivo de cartera activa, deudores, abonos históricos y efectividad de recaudo.
  - **Botón en Interfaz de Detalle de Ventas:** Se integró un nuevo botón en la interfaz de `AdminSalesDetail.jsx` bajo la sección "Reportes y Exportación" para permitir la exportación directa del reporte de cartera si la funcionalidad de créditos está activa.
* **Archivos Modificados:**
  - [pdfService.js (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/pdfService.js) [MODIFY]
  - [pdfService.js (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) [MODIFY]
  - [AdminSalesDetail.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]
  - [AdminSalesDetail.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]

### [2026-06-13] - Sincronización downstream de pdfService en la CLI de Prototype
* **Tipo:** CLI / Estructura / pdfService
* **Descripción de Cambios:**
  - Sincronización downstream de la función de exportación de PDF de ventas y rotación para la consistencia del bundle y soporte de empaquetado en caliente.
* **Archivos Modificados:**
  - [pdfService.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/pdfService.js) [MODIFY]

### [2026-06-13] - Corrección de Permisos de Firestore (Missing or insufficient permissions en listado de pedidos)
* **Tipo:** Seguridad / Base de Datos / Reglas de Firestore
* **Descripción de Cambios:**
  - **Corrección de Regla de Listado:** Se corrigió el error de permisos en tiempo de ejecución (`FirebaseError: Missing or insufficient permissions`) al ingresar a la vista de "Mis Pedidos" o cargar el historial de créditos como cliente público (no administrador).
  - **Causa Raíz:** Las reglas de seguridad de Firestore en las colecciones `/orders` y `/credits` verificaban la existencia del campo `cliente.celular` en los filtros de consulta mediante `request.query.filters['cliente.celular'] != null`. Sin embargo, `request.query.filters` es una propiedad inexistente en las reglas de producción de Firestore (las cuales solo admiten `limit`, `offset` y `orderBy` en `request.query`), lo que causaba un fallo de evaluación y el rechazo inmediato de la consulta.
  - **Solución Aplicada:** Se reemplazó la validación por la sintaxis estándar basada en `resource.data` (`resource.data.cliente.celular != null`), permitiendo a los clientes recuperar sus propios pedidos mediante el filtro `where('cliente.celular', '==', celular)` inyectado en la consulta.
* **Archivos Modificados:**
  - [firestore.rules](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [MODIFY]
  - [firestore.rules](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/firestore.rules) [MODIFY]

### [2026-06-13] - Rediseño Visual de Modal de Producto y Ancho Completo en Reportes
* **Tipo:** UI/UX / Modal / Maquetación / Core App Ventas
* **Descripción de Cambios:**
  - **Rediseño de Modal de Producto:** En `ProductFormModal.jsx` se optimizaron las proporciones y márgenes de los campos. Los inputs se elevaron de `text-xs` a `text-sm` (evitando auto-zoom en iOS Safari), se ampliaron las dimensiones de los botones de carga a `h-11`/`h-12` para un área de contacto idónea en pantallas táctiles y se inyectó la previsualización del producto al lado de los botones de carga en la edición clásica (antes oculta).
  - **Alineación de Placeholders:** Se simplificaron los textos placeholder del panel avanzado (SEO y recomendaciones) para que no se corten en vistas de 2 columnas o móviles.
  - **Homologación de Ancho en Sub-paneles:** Se ajustó la clase contenedora en `AdminSalesDetail.jsx` (detalle de ventas), `AdminStockAlerts.jsx` (alertas de stock) y `AdminCredits.jsx` (créditos) reemplazando los contenedores estrechos (`max-w-4xl` y `max-w-6xl`) por `max-w-7xl`, logrando que todas las sub-páginas utilicen el ancho total de pantalla del panel administrativo de forma consistente.
* **Archivos Modificados:**
  - [ProductFormModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]
  - [AdminSalesDetail.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]
  - [AdminStockAlerts.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminStockAlerts.jsx) [MODIFY]
  - [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]

### [2026-06-13] - Incorporación de Regla de Seguridad de Git (Evitar Pérdida de Datos Locales)
* **Tipo:** Reglas de Comportamiento de IA (GEMINI.md) / Seguridad
* **Descripción de Cambios:**
  - **Regla contra Restauraciones de Git Automáticas:** Se añadió una regla mandatoria de alta prioridad en la Sección 4 de `GEMINI.md` que prohíbe de forma estricta a la IA ejecutar comandos de descarte o restauración destructivos en Git (`git checkout --`, `git restore`, `git reset`) sobre archivos locales modificados sin la confirmación y autorización explícita del usuario en el chat. Esto protege el trabajo en desarrollo y los cambios no guardados.
  - **Propagación del Prompt:** Se corrió el script de sincronización `sync_rules.js` para propagar de forma inmediata el cambio de reglas a los 5 subproyectos del ecosistema.
* **Archivos Modificados:**
  - [GEMINI.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]

### [2026-06-13] - Rediseño Compacto y Corrección de Scroll en Modal Punto de Venta QR
* **Tipo:** UI/UX / Modal / Core App Ventas / Bugfix
* **Descripción de Cambios:**
  - **Remoción de Scroll y Overflow:** Se cambió el contenedor del modal en `AdminInventory.jsx` para usar `overflow-hidden` y se compactó la tarjeta reduciendo los paddings a `p-4`, los anchos a `max-w-sm` y los espaciados verticales (`mb-x`) para asegurar que quepa 100% en pantallas pequeñas sin forzar scroll interno.
  - **Bloqueo de Scroll de Fondo (Body Scroll Lock):** Se inyectó un hook `useEffect` en `ProductQRModal` que asigna `document.body.style.overflow = 'hidden'` cuando se monta el modal y lo restablece al desmontar para evitar que la página de fondo se desplace.
  - **Refactorización de Zoom a Overlay Independiente:** Se removió el reajuste de tamaño dinámico en caliente del canvas dentro de la misma tarjeta del modal. Ahora, al hacer clic en el QR para ampliarlo, se renderiza un overlay modal independiente de pantalla completa con un backdrop oscuro (`bg-black/80`), un canvas optimizado de 260px, y controles para cerrar (`X` o clic exterior), manteniendo la consistencia de la tarjeta principal intacta.
* **Archivos Modificados:**
  - [AdminInventory.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]

### [2026-06-13] - Bugfix: Carga de Imagen en Detalle de Producto y Reubicación de generate_ia_map.js
* **Tipo:** Bugfix / Rendimiento / Estructura / Build
* **Descripción de Cambios:**
  - **Carga de Imagen en Caché:** Se corrigió un bug clásico en `ProductDetailPage.jsx` donde las imágenes cacheadas por el navegador disparaban el evento de carga del DOM antes de que React registrara `onLoad`, causando un shimmer gris infinito (bloqueando la visualización). Se implementó un `useRef` sobre el elemento de la imagen y se evalúa la propiedad `.complete` en el `useEffect` para resolver la carga de forma instantánea.
  - **Corrección de Inicialización Temporal:** Se movió la inicialización del `useEffect` de imagen debajo de la declaración `useMemo` de `activeImages` para resolver el error de referencia en JS.
  - **Reubicación de generate_ia_map.js:** Se movió el script generador de mapas semánticos de la IA fuera de la carpeta temporal `scratch/` a una carpeta de scripts oficial `scripts/` y se actualizó `package.json` para evitar fallos de compilación (`MODULE_NOT_FOUND`) en las plantillas de la CLI tras la limpieza de la carpeta de debug.
  - **Sincronización:** Actualizado `sync_templates.js` para propagar automáticamente `package.json` y la carpeta `scripts` en el motor de scaffolding.
* **Archivos Modificados:**
  - [ProductDetailPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [package.json](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/package.json) [MODIFY]
  - [generate_ia_map.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/scripts/generate_ia_map.js) [NEW]
  - [sync_templates.js](file:///D:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY]

### [2026-06-13] - Habilitación de Telemetría Real en Local y Migración a Cloud Functions Gen 2
* **Tipo:** Telemetría / Firebase / Cloud Functions / IAM / CORS
* **Descripción de Cambios:**
  - **Migración a Gen 2:** Se migró la Cloud Function `reportTelemetry` a Firebase Functions Gen 2 (`onRequest` con `cors: true`) para desplegar sobre Cloud Run y solucionar el preflight de CORS de manera nativa.
  - **Resolución de Permisos en GCP:** Se concedieron los roles de lector y escritor de Artifact Registry (`roles/artifactregistry.reader` y `roles/artifactregistry.writer`) a la cuenta de servicio de Cloud Functions y al agente de Compute Engine, solucionando los errores de compilación de contenedores en Cloud Build.
  - **Acceso Público:** Se configuró la política de IAM del servicio Cloud Run para permitir invocaciones públicas (`allUsers` -> `roles/run.invoker`), lo que previene rechazos por 403 Forbidden antes de evaluar las reglas de CORS.
  - **Habilitación de Localhost:** Se removió la interceptación de simulación en `telemetryService.js` de la App de Ventas para permitir que el cliente emita telemetría real en local.
  - **Saneamiento de Variables:** Se eliminaron las comillas dobles redundantes en `.env.local` de la aplicación de ventas y en la plantilla del generador CLI (`generator.js`) para evitar que el token de Authorization sea enviado con comillas literales y devuelva un error 401.
* **Archivos Modificados:**
  - [telemetryService.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/telemetryService.js) [MODIFY]
  - [index.js](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/functions/index.js) [MODIFY]
  - [.env.local](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.env.local) [MODIFY]
  - [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

### [2026-06-12] - Simplificación de Login de Administrador (Remoción de Campos de Registro)
* **Tipo:** UI/UX / Autenticación / Configuración
* **Descripción de Cambios:**
  - **Remoción de campos redundantes:** Se eliminaron los campos de configuración inicial de nombre y WhatsApp del formulario de inicio de sesión del administrador. Esto previene confusión y errores de visualización/registro en caliente.
  - **Sincronización por defecto:** El proceso de registro del primer administrador ahora inyecta automáticamente los fallbacks de configuración global (`sellerName` y `whatsappAdmin`). Los administradores podrán ajustar sus datos en cualquier momento desde la sección de Ajustes de Identidad de Marca en el Panel de Control.
* **Archivos Modificados:**
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]

### [2026-06-12] - Registro Explícito de Rol 'client' en Nuevos Clientes (Ecosistema)
* **Tipo:** Consistencia de Base de Datos / Seguridad
* **Descripción de Cambios:**
  - **Inyección de Rol en Registro:** Se corrigió la discrepancia en la colección `/users` agregando de forma explícita el campo `role: 'client'` cuando se registra un cliente nuevo. Esto garantiza consistencia de esquema (ya que los administradores guardan `role: 'admin'`) y facilita validaciones en las reglas de seguridad.
* **Archivos Modificados:**
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]

### [2026-06-12] - Fix de Sesión Huérfana de Administrador en App Ventas (Ecosistema)
* **Tipo:** Bugfix / Autenticación / Base de Datos
* **Descripción de Cambios:**
  - **Auto-recreación de Perfil Admin:** Se corrigió un bug en la plantilla `App Ventas` donde, al limpiar la base de datos Firestore, un administrador logueado previamente mediante Firebase Auth era redirigido directamente al dashboard debido al listener de sesión en cache, sin recrear su documento en la colección `/users` (ya que el login manual era el único que ejecutaba la escritura).
  - **Implementación en Hook:** Modificado `src/hooks/useAuthInit.js` en la plantilla base de Ventas para que compruebe la existencia del documento en Firestore cuando el listener de Auth detecte una sesión activa y la cree si falta.
* **Archivos Modificados:**
  - [useAuthInit.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js) [MODIFY]

### [2026-06-12] - Remoción de Función de Gestión de Base de Datos
* **Tipo:** Refactorización / Remoción de código
* **Descripción de Cambios:**
  - **Eliminación en server.js:** Se eliminaron los endpoints `/api/project/database/collections` y `/api/project/database/cleanup` junto a los imports del SDK cliente de Firebase y helpers relacionados.
  - **Eliminación en App.jsx:** Se removió el botón "Base de Datos", los estados de React para control de colecciones (`dbManageModal`, `dbCollections`, etc.), los manejadores `handleLoadDbCollections`/`handleExecuteDbCleanup` y la maquetación del modal de confirmación de borrado.
* **Archivos Modificados:**
  - [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-12] - Corrección de Responsividad Móvil y Estructura en CRM de Clientes
* **Tipo:** UI/UX / Responsividad / Bugfix
* **Descripción de Cambios:**
  - **Grid de Cabecera:** Se rediseñó el contenedor de botones de acción global del CRM (`Sincronización Global`, `Despliegue Global`, `Telemetría Global`, `Nuevo Cliente`) para usar una cuadrícula responsiva de 2 columnas en mobile (`grid grid-cols-2 md:flex md:flex-wrap`) con botones de ancho completo, evitando desbordamientos de texto.
  - **Flexibilidad de Directorio:** Se reestructuraron los botones de acción del directorio de cada cliente (`Desplegar en Local`, `Base de Datos`, `Instalar Deps`, `Obtener Telemetría`, `Gestionar`) con propiedades flex-wrap, anchos mínimos (`min-w`) y alineación central, permitiendo que se acomoden simétricamente en pantallas estrechas sin truncarse.
  - **Resolución de Error de Sintaxis:** Se restauró la etiqueta contenedora de visualización de proyecciones que fue eliminada por error.
  - **Resolución de Bug de Búsqueda de Proyectos:** Se corrigió una falla lógica en la función `findProjectDir` de `server.js` que impedía resolver las rutas de proyectos de plantillas core (`Plantillas Core`) si la carpeta de instancias de clientes (`Instancias Clientes`) no estaba creada físicamente en el disco.
* **Archivos Modificados:**
  - [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-12] - Arquitectura General y Agnóstica de Skills de IA
* **Tipo:** Refactorización / IA Configuración
* **Descripción de Cambios:**
  - **Agnosticismo de Proyecto:** Actualizadas las 7 skills del ecosistema (`component_creator`, `component_extractor`, `git_strategist`, `integrity_compiler`, `onboarder_marcas`, `portar_componente`, `sandbox_integrator`) para remover referencias hardcodeadas a la plantilla `App Ventas`. Se introdujo la variable dinámica `[PROYECTO_ACTIVO]` con su orden de prioridades de resolución y la sección de "Rutas del Proyecto".
  - **Triggers Dinámicos:** Configurado el soporte para que los triggers acepten el parámetro opcional de proyecto (ej: `@crear-componente [PROYECTO_ACTIVO?]`).
  - **Mejoras Específicas por Skill:**
    * `component_creator`: Mapeo fuzzy en `getSandboxKey` en Paso 3, inyección de categorías válidas de biblioteca, y build bloqueante en Paso 5.
    * `component_extractor`: Actualizada la tabla de simulabilidad, criterio objetivo para manuales, protocolo de rollback y variantes.
    * `git_strategist`: Completada la descripción y agregado Paso 6 para resolución de conflictos.
    * `integrity_compiler`: Completada la descripción y unificadas rutas.
    * `onboarder_marcas`: Agregada plantilla para `.env.local` y reglas multi-vertical de onboarding.
    * `portar_componente`: Agregado control de dependencias npm faltantes y validación de versión de `lucide-react`.
    * `sandbox_integrator`: Establecida la tabla como fuente canónica de verdad y añadidas filas de simulabilidad.
* **Archivos Modificados:**
  - Archivos `SKILL.md` bajo `D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\Copia_Seguridad_Reglas_y_Skills\Skills\` [MODIFY]

### [2026-06-12] - Depuración de Rutas Obsoletas (D:\Aplicaciones)
* **Tipo:** Refactorización / Mantenimiento
* **Descripción de Cambios:**
  - **Eliminación en server.js:** Removido el fallback redundante y obsoleto `D:\Aplicaciones` de la rutina de resolución de proyectos `findProjectDir` en el servidor del CLI (`server.js`).
  - **Limpieza de Manuales y Mapas:** Corregidas las referencias hardcodeadas de `D:\Aplicaciones` a `D:\PROTOTIPE` en `mapa_arquitectura.md` de la plantilla ventas y de la plantilla activa, en la especificación visual de marca, en el resumen ejecutivo del negocio, y en las guías técnicas del extractor de componentes.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [mapa_arquitectura.md](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/mapa_arquitectura.md) [MODIFY]
  - `Prototipe-CLI/templates/template-ventas/Documentacion App Ventas/mapa_arquitectura.md` [MODIFY]
  - `Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_extractor/SKILL.md` [MODIFY]
  - `Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_brand_config.md` [MODIFY]
  - `Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/resumen_ejecutivo_proyecto.md` [MODIFY]
  - `Documentacion PROTOTIPE/04_Estandares_y_Skills/sincronizacion_templates_universal.md` [MODIFY]

### [2026-06-12] - Saneamiento y Estandarización de Documentación PROTOTIPE
* **Tipo:** Limpieza / Documentación / Estandarización
* **Descripción de Cambios:**
  - **Eliminación de duplicados:** Se removieron los componentes duplicados y obsoletos `ConnectivityToast` y `DatePicker` del directorio `06_Biblioteca_Componentes` para favorecer sus versiones unificadas y descriptivas en español (`Alerta_Conectividad_Red` y `Selector_Fecha`).
  - **Estandarización de Nomenclatura:** Se renombraron 6 subcarpetas y archivos en la biblioteca de inglés a español descriptivo (`CurrencyInput` -> `Entrada_Moneda`, `QuantitySelector` -> `Selector_Cantidad`, `useDebounceValue` -> `Hook_Filtro_Debounce`, `useLocalStorageState` -> `Hook_Estado_LocalStorage`, `useSavedLocation` -> `Hook_Ubicacion_Guardada`, `ModalTemplate` -> `Plantilla_Modal`).
  - **Remoción de Obsoletos:** Se eliminó el archivo de roadmap histórico `tareas_pendientes_prioritarias.md` ya completado.
  - **Integridad:** Ejecutado `verify_ecosystem_integrity.js` actualizando exitosamente `mapa_documentacion_ia.md` y `mapa_aplicacion.md`.
* **Archivos Modificados:**
  - `06_Biblioteca_Componentes/Formularios_y_UI/ConnectivityToast/` [DELETE]
  - `06_Biblioteca_Componentes/Formularios_y_UI/DatePicker/` [DELETE]
  - `02_Tareas_Roadmap/tareas_pendientes_prioritarias.md` [DELETE]
  - `06_Biblioteca_Componentes/` (6 subcarpetas renombradas) [MODIFY]
  - [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [mapa_aplicacion.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

### [2026-06-12] - Actualización a SYSTEM PROMPT — PROTOTIPE DEV AI v2.0
* **Tipo:** Configuración / Reglas de IA / Robustez
* **Descripción de Cambios:**
  - **SYSTEM PROMPT v2.0:** Aplicado el nuevo system prompt unificado en `GEMINI.md`. Define con precisión la matriz de severidades para auditoría técnica, la jerarquía estricta de prioridades ante conflictos de reglas, normas de protección de secretos Firebase/ENV, y protocolos claros ante fallos de build y sincronización.
  - **Sincronización:** Modificados los delimitadores de sección por-core en `sync_rules.js` para usar `## SECCIÓN 10` y `## SECCIÓN 13`. Ejecutado el script de propagación con éxito en todos los proyectos del ecosistema.
* **Archivos Modificados:**
  - [GEMINI.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
  - [sync_rules.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY]

### [2026-06-12] - Reorganización Integral del Ecosistema de Documentación PROTOTIPE
* **Tipo:** Refactorización / Documentación / CLI / Integridad
* **Descripción de Cambios:**
  - **Fase 1 — Críticos:** Eliminados 3 archivos binarios residuales de `03_Auditorias_y_Faro_Core/` (trace.json 26MB, desktop_landing.png, PDF). Corregida descripción de `03_Auditorias_y_Faro_Core` en GEMINI.md para dejar claro su alcance exclusivo del CLI. Eliminadas referencias a la ruta `D:\Aplicaciones` (obsoleta) de `sync_rules.js` y `verify_ecosystem_integrity.js`. Eliminada fila de ruta rota `manual_acceso_qr_portales.md` del mapa. Eliminados archivos huérfanos: `plan_skills_desarrollador.md` y `propuesta_redisenio_dev_dashboard.md`.
  - **Fase 2 — Reorganización 07_Manuales_Desarrollo:** Movidos 5 archivos sueltos de la raíz de `07_Manuales_Desarrollo/` a `Arquitectura_Multi_Instancia/Prototipe_CLI/` (analisis_automatizacion_dashboard, auditoria_flujo_onboarding, manual_aprovisionamiento_optimo, propuestas_mejoras_robustez, propuesta_robustez_y_nuevas_funciones). Eliminado directorio duplicado `Paginas/Compra_por_QR/` (manual único en Ecommerce_y_QR).
  - **Fase 3 — Limpieza template-ventas:** Eliminado `scratch/` completo (38 archivos ~10MB de debug). Eliminadas carpetas con espacios en nombre (tareas pendientes, instrucciones de migración, instrucciones/). Eliminados 3 archivos md duplicados en raíz del template (mapa_arquitectura_ia.md, mapa_arquitectura.md, flujos_aplicacion.md). Eliminado manual_aprovisionamiento_optimo.md duplicado.
  - **Fase 4 — Mapa de documentación:** Actualizadas rutas de los 5 archivos movidos. Eliminada fila duplicada de caja_diaria_pos.md de sección Utilidades.
  - **Fase 5 — verify_ecosystem_integrity.js:** Extendido para inicializar los 12 archivos de documentación estándar también en los templates del CLI. El script creó automáticamente `template-core-seed/Documentacion App Core Seed/` con los 12 archivos.
  - **Propagación:** Ejecutados `sync_rules.js` (5 destinos actualizados) y `verify_ecosystem_integrity.js` (mapas globales sincronizados sin errores).
* **Archivos Modificados:**
  - [GEMINI.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
  - [sync_rules.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY]
  - [verify_ecosystem_integrity.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/verify_ecosystem_integrity.js) [MODIFY]
  - [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - `03_Auditorias_y_Faro_Core/trace.json` [DELETE]
  - `03_Auditorias_y_Faro_Core/desktop_landing.png` [DELETE]
  - `03_Auditorias_y_Faro_Core/Informe Completo y Definitivo App Reusable.pdf` [DELETE]
  - `04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/plan_skills_desarrollador.md` [DELETE]
  - `07_Manuales_Desarrollo/Visualizacion/propuesta_redisenio_dev_dashboard.md` [DELETE]
  - `07_Manuales_Desarrollo/Paginas/Compra_por_QR/` [DELETE — duplicado]
  - `07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/` ← 5 archivos [MOVIDOS desde raíz 07]
  - `Prototipe-CLI/templates/template-ventas/scratch/` [DELETE — 38 archivos debug]
  - `Prototipe-CLI/templates/template-ventas/` ← carpetas con espacios y md duplicados raíz [DELETE]
  - `Prototipe-CLI/templates/template-core-seed/Documentacion App Core Seed/` [NEW — 12 archivos inicializados]

### [2026-06-12] - Corrección de Rutas del Mapa de Documentación

* **Tipo:** Documentación / Sincronización
* **Descripción de Cambios:**
  - **Corrección de Rutas de Auditoría:** Modificado `mapa_documentacion_ia.md` para actualizar las rutas absolutas de los documentos de auditoría de App Ventas (que fueron movidos desde `03_Auditorias_y_Faro_Core` hacia la carpeta local `D:\PROTOTIPE\Plantillas Core\App Ventas\Documentacion App Ventas`), evitando enlaces rotos e instruyendo correctamente a la IA.
* **Archivos Modificados:**
  - [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

### [2026-06-12] - Sincronización del Ecosistema a Plan Blaze y Telemetría Centralizada
* **Tipo:** Refactorización / Seguridad / Cloud Functions / Firebase / Plan Blaze
* **Descripción de Cambios:**
  - **Limpieza de Generador CLI:** Modificado `generator.js` en `Prototipe-CLI` para no inyectar variables de entorno centralizadas secundarias en `.env.local`, inyectando por defecto el endpoint unificado `VITE_DEVELOPER_TELEMETRY_ENDPOINT` que apunta a la Cloud Function HTTPS en producción.
* **Archivos Modificados:**
  - [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

### [2026-06-12] - Habilitación de Scaffold Limpio (Core Seed) en Gestión de Cores
* **Tipo:** Nueva Característica / CLI / Dashboard
* **Descripción de Cambios:**
  - **Soporte de Scaffold Limpio:** Implementado el soporte para realizar scaffolding de nuevos Cores utilizando una plantilla limpia del sistema (`template-core-seed`). Modificado el endpoint `/api/cores/:clave/scaffold` en `server.js` (CLI).
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - `06_Biblioteca_Componentes/Formularios_y_UI/ConnectivityToast/` [DEL
### [2026-06-11] - Saneamiento de Detección Git en Ecosistema (CLI & Dashboard)
* **Tipo:** DevOps / Bugfix / Scripts
* **Descripción de Cambios:**
  - **Detección de Git por rev-parse:** Refactorizada la detección de Git en el bridge server (`server.js`) para utilizar `git rev-parse --git-dir` en lugar del chequeo físico estático de la carpeta `.git`.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-11] - Robustez en Respaldo de Subproyectos con .git-backup-temp
* **Tipo:** DevOps / Automatización
* **Descripción de Cambios:**
  - **Aislamiento de comandos de Git:** Refactorizado `subproject_backup.ps1` para detectar de forma autónoma si un subproyecto está en estado inactivo con la carpeta `.git-backup-temp` y renombrarlo temporalmente a `.git` para realizar la indexación de cambios.
  - **Fase 1 — Críticos:** Eliminados 3 archivos binarios residuales de `03_Auditorias_y_Faro_Core/` (trace.json 26MB, desktop_landing.png, PDF). Corregida descripción de `03_Auditorias_y_Faro_Core` en GEMINI.m
  - [subproject_backup.ps1](file:///D:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

### [2026-06-11] - Corrección de Bugs de Referencia, Git y Bloqueo de SSE en Automatización
* **Tipo:** Corrección de Bugs / Estabilidad
* **Descripción de Cambios:**
  - **Saneamiento en generador:** Corregido en `generator.js` el ReferenceError de `initials` y `storageRulesContent`. Refactorizado `/api/create-project` en `server.js` regresando a una respuesta HTTP JSON estándar y limpia sin SSE.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

### [2026-06-11] - Saneamiento de Carpetas Git Temporales y Robustez de Vite en Backups
* **Tipo:** DevOps / Estabilidad / Scripts
* **Descripción de Cambios:**
  - **Remoción de bloqueos Vite:** Corregido el bug de bloqueo y permanencia de carpetas temporales `.git-backup-temp`. Se mejoró la detención de procesos de desarrollo en `git_backup.ps1` y `menu_backup.ps1`.
* **Archivos Modificados:**
  - [git_backup.ps1](file:///D:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [menu_backup.ps1](file:///D:/PROTOTIPE/menu_backup.ps1) [MODIFY]

### [2026-06-10] - Tres Mejoras de Robustez y Carga de Logo en Onboarding Wizard
* **Tipo:** Robustez / Aprovisionamiento / Frontend / Backend
* **Descripción de Cambios:**
  - **Validación del SDK de Firebase:** Agregado el endpoint `/api/firebase/validate` para comprobar la correctitud de credenciales del cliente antes del aprovisionamiento.
  - **Compresor de Logos Jimp:** Endpoint `/api/upload-logo` para comprimir y procesar logos de marca transparentes con Jimp.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Guardián de Calidad y PWA en Deploy con Auto-Resolución y Drift Detector CRM
* **Tipo:** DevOps / Feature / Calidad
* **Descripción de Cambios:**
  - **SSE Pre-Deploy Audit:** Modificado el endpoint de deploy en `server.js` para ejecutar de forma síncrona el auditor físico antes de realizar el deploy.
  - **Drift Detector CRM:** Implementados los endpoints `/api/project/drift` y `/api/project/sync-file` para evaluar diferencias downstream entre Cores y clientes.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Optimización de Chunks de Bundle y Refinamiento de Auditor PWA
* **Tipo:** Rendimiento / Optimización / Bundles
* **Descripción de Cambios:**
  - **Falsos positivos de auditoría:** Refinamiento de la API `/api/project/audit` en `server.js` para leer el manifest de Vite y omitir las penalizaciones por tamaño de chunks cargados dinámicamente.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Integración de Herramientas de Automatización en CLI Bridge Server
* **Tipo:** Nueva Característica / Automatización / CLI Bridge
* **Descripción de Cambios:**
  - **APIs de Automatización:** Redireccionados logs en `worker_create_project.js` por IPC y agregadas APIs `/api/library/extract`, `/api/project/deploy` y getters/setters de variables de entorno en `/api/project/env`.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [worker_create_project.js](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]
