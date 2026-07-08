# 📝 Bitácora de Cambios e Historial de Commits

Este es el log de cambios técnico activo para la sesión de desarrollo vigente del ecosistema PROTOTIPE. Los registros anteriores a esta fecha han sido auto-archivados en históricos compactos para optimizar la compatibilidad de NotebookLM.

---

### [2026-07-07] - Inicialización de Sesión de Desarrollo Activa
* **Tipo:** Sistema
* **Nicho:** Todos
* **Descripción:** Bitácora activa reiniciada de forma limpia. El historial acumulado anterior (2.08 MB) se trasladó con éxito a `bitacora_cambios_historico_hasta_2026-07-06.md` para optimizar los límites de NotebookLM.

## CORE-328: Cuatro Blindajes de Calidad y Robustez Operativa
- **Fecha:** 2026-07-08
- **Tipo:** Calidad Técnica / Robustez / Seguridad / WCAG Constrast / Zod validation
- **Descripción:** 
  * **Cálculo Dinámico de Contraste (WCAG Compliance):** Desarrollado el hook reactivo `useColorContrast.js` que extrae en caliente los valores de color de variables CSS del DOM root (RGB/Hex) y computa la luminancia relativa conforme a especificaciones WCAG. Retorna la clase de texto adecuada (`text-white` o `text-black`), erradicando problemas de legibilidad de marca blanca con colores claros en el botón de mantenimiento de `App.jsx`.
  * **Validación de Configuración Firestore con Zod:** Configurado un esquema completo de datos en `appConfigSchema.js` definiendo tipos de datos, enums y valores fallbacks seguros para todas las propiedades. Refactorizado `useAppConfigSync.js` para validar y parsear con Zod las respuestas de las suscripciones a colecciones de configuraciones locales y del servidor central, eliminando crasheos por campos inconsistentes o indefinidos.
  * **Timeouts en Operaciones Críticas de Firestore:** Implementada la envoltura asíncrona `withTimeout` en `orderService.js` limitando la espera de red a un máximo de 15 segundos para operaciones críticas de escritura (`createOrder`, `cancelOrder`, `completeOrder`/créditos y `createPhysicalOrder`), previniendo colisiones visuales de spinners infinitos y fallas por bloqueos de red o modo offline.
  * **Integridad del Ecosistema:** Validadas y aprobadas las compilaciones de producción locales (`npm run build`) tanto en `App Ventas` como en el dashboard centralizador `dev-dashboard` sin linter warnings.
- **Archivos modificados:**
  * [Plantillas Core/App Ventas/src/hooks/useColorContrast.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useColorContrast.js) [NEW]
  * [Plantillas Core/App Ventas/src/schemas/appConfigSchema.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/schemas/appConfigSchema.js) [NEW]
  * [Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  * [Plantillas Core/App Ventas/src/App.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY]
  * [Plantillas Core/App Ventas/src/services/orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY]
  * [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  * [mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

## CORE-327: Sincronización Paralela en CLI y Robustecimiento de Gitignore
- **Fecha:** 2026-07-08
- **Tipo:** Rendimiento de CLI / Seguridad / Git / Automatización
- **Descripción:** 
  * **Soporte de Argumentos CLI:** Refactorizado `sync_clients.js` para admitir los flags `--parallel` y `--yes` (o `-y`), facilitando su uso en pipelines automatizados de integración continua y despliegue.
  * **Comparación en Paralelo:** El análisis de diferencias físicas y hashes MD5 inicial se realiza de forma asíncrona concurrente para todos los clientes seleccionados en lote.
  * **Pool de Concurrencia Limitado:** Diseñado e integrado un pool de promesas en JS puro (concurrencia de 4) para procesar copias físicas, backups y validaciones de build Vite (`npm run build`) concurrentemente sin saturar la CPU ni agotar descriptores de archivos del SO.
  * **Aislamiento de Logs:** El flujo del pool captura, amortigua y rotula los logs de cada cliente (`[clientId]`) liberándolos al final para evitar textos solapados en consola.
  * **Blindaje de Secretos Git:** Creado `.gitignore` estándar en `template-ventas/` y agregadas exclusiones críticas para `.firebaserc` y carpetas de restauración temporal `.temp_backup_sync` en ambas plantillas del CLI.
- **Archivos modificados:**
  * [Prototipe-CLI/sync_clients.js](file:///d:/PROTOTIPE/Prototipe-CLI/sync_clients.js) [MODIFY]
  * [Prototipe-CLI/templates/template-core-seed/.gitignore](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/.gitignore) [MODIFY]
  * [Prototipe-CLI/templates/template-ventas/.gitignore](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/.gitignore) [NEW]
  * [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

## CORE-326: Desactivación Remota Ineludible y Motivo Personalizado (Bloqueo Total)
- **Fecha:** 2026-07-08
- **Tipo:** Suspensión de Servicio / CRM / Control Central / Seguridad
- **Descripción:** 
  * **Control de CRM Central:** Añadida una sección dedicada en el panel lateral de gestión de clientes del CRM (`dev-dashboard/src/App.jsx`) con un checkbox de suspensión temporal de cuenta y entrada de texto para el motivo personalizado de deactivación.
  * **Inicialización Centralizada:** Implementado un hook `useEffect` en el modal de gestión del CRM para autohidratar todas las variables editables (`editNiche`, `editAlertActive`, `editDeactivated`, etc.) previniendo estados inconsistentes o vacíos.
  * **Listener Snapshot Central:** Actualizado `useAppConfigSync.js` en Core, Plantillas y cliente `ventas-moni-app` para capturar en tiempo real las variables centralizadas `deactivated` y `deactivationReason` de Firestore (`clientes_control`).
  * **Bloqueo Ineludible en Raíz:** Inyectada validación de estado en `App.jsx` de todas las aplicaciones. Si `deactivated === true`, se desmonta completamente el router de React y se renderiza en su lugar una pantalla de suspensión de servicio premium y responsiva basada en HSL, impidiendo cualquier interacción o manipulación del DOM por parte del cliente, pero manteniendo el listener reactivo para reactivaciones en caliente.
  * **UX de Alertas de WhatsApp:** Agregado toast de advertencia en el Gestor de Plantillas si se intenta sincronizar la alerta remota sin seleccionar un cliente en el dropdown (`waClientId`).
- **Archivos modificados:**
  * [Central PROTOTIPE/dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  * [Plantillas Core/App Ventas/src/store/appConfigStore.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
  * [Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  * [Plantillas Core/App Ventas/src/App.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY]
  * [Prototipe-CLI/templates/template-ventas/src/store/appConfigStore.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/store/appConfigStore.js) [MODIFY]
  * [Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  * [Prototipe-CLI/templates/template-ventas/src/App.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/App.jsx) [MODIFY]
  * [Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js) [MODIFY]
  * [Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js) [MODIFY]
  * [Prototipe-CLI/templates/template-core-seed/src/App.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/App.jsx) [MODIFY]
  * [Instancias Clientes/ventas/ventas-moni-app/src/store/appConfigStore.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/store/appConfigStore.js) [MODIFY]
  * [Instancias Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js) [MODIFY]
  * [Instancias Clientes/ventas/ventas-moni-app/src/App.jsx](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/App.jsx) [MODIFY]
  * [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  * [mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

## CORE-325: Sincronización de Cobros WhatsApp con Alertas Remotas e Inyección Auto-Reminder
- **Fecha:** 2026-07-08
- **Tipo:** Facturación / Alertas / WhatsApp / Automatización
- **Descripción:** 
  * **Sincronización Interactiva:** Se agregó el checkbox de control en la UI del Gestor de Plantillas de WhatsApp para sincronizar en tiempo real el cobro con la alerta remota de la aplicación (`sistemaAlerta`).
  * **Conversión de Formatos:** Implementado el helper asíncrono `syncRemoteAlertFromTemplate` que limpia la sintaxis de WhatsApp (`*`, `_`, `~`) para presentar textos legibles y limpios en la interfaz web, asociando la plantilla elegida al tipo de alerta correspondiente (`info` para simples, `warning` para urgentes).
  * **Apagado al Recaudar:** Se modificó `handleTogglePayment` para desactivar de inmediato la alerta remota (`sistemaAlerta = null`) al marcar una comisión como `"pagado"`, resolviendo la molestia de alertas persistentes tras recibir el pago.
  * **Auto-Reminder Sweep:** Se inyectó un hook `useEffect` controlado por sesión (`autoScanCompletedRef`) que se ejecuta el día 1° de cada mes para detectar reportes de comisiones atrasadas y activar automáticamente el Recordatorio de Pago simple en las instancias de clientes correspondientes.
  * **Eliminación de Warnings de Compilación:** Se removieron las claves de color duplicadas en el objeto literal `COLOR_NAMES` de `ClientFilterModal.jsx` (tanto en la plantilla base como en la instancia del cliente), erradicando las alertas en amarillo de Vite/esbuild.
  * **Aislamiento de Seguridad Administrativa:** Se diseñó el wrapper `RemoteAlertModal` y se adaptaron los modales de telemetría mensual y ping test en `App.jsx` (Core y cliente `ventas-moni-app`) usando `useLocation` de React Router. Esto restringe su visualización exclusivamente a rutas administrativas (`/admin/*`), protegiendo la privacidad del comerciante ante los clientes finales del catálogo.
- **Archivos modificados:**
  * [Central PROTOTIPE/dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  * [Plantillas Core/App Ventas/src/App.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY]
  * [Instancias Clientes/ventas/ventas-moni-app/src/App.jsx](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/App.jsx) [MODIFY]
  * [Plantillas Core/App Ventas/src/components/client/catalog/ClientFilterModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ClientFilterModal.jsx) [MODIFY]
  * [Instancias Clientes/ventas/ventas-moni-app/src/components/client/catalog/ClientFilterModal.jsx](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/components/client/catalog/ClientFilterModal.jsx) [MODIFY]
  * [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]


## CORE-324: Reemplazo de Conversión de Seguimiento por Panel de Rendimiento General de Productos
- **Fecha:** 2026-07-08
- **Tipo:** UI/UX / Inteligencia Comercial / Métricas / Rendimiento
- **Descripción:** 
  * Se removió el antiguo panel de "Conversión de Seguimiento de Pedidos" en el Dashboard del Administrador (`AdminHome.jsx`) por no aportar utilidad real al negocio.
  * **Nuevo Módulo de Rendimiento General de Productos (Diseño de Podio y Barras de Progreso):** 
    1. Se implementó un agregador dinámico en memoria (`topProducts` mediante `useMemo`) que analiza el historial completo de pedidos completados (`orders`) de Firestore.
    2. Suma las cantidades vendidas e ingresos facturados por cada producto y variantes de forma agregada en tiempo real.
    3. Clasifica el catálogo de productos por cantidad vendida y expone los 5 más vendidos.
  * **Diseño Visual de Rendimiento Relativo (Fiel al mockup):**
    1. Se calcula el **rendimiento relativo** de cada producto dividiendo sus unidades vendidas por la cantidad del producto líder (1° lugar = 100%).
    2. Se renderiza una pila vertical de tarjetas estilizadas con fondo degradado suave (`bg-surface-2/60`).
    3. Cada fila expone: medalla de posición (🥇, 🥈, 🥉, 🎖️), nombre del producto, unidades totales vendidas (ej. `9 unds`).
    4. Se inyectó una barra de progreso horizontal con la variable de color principal y brillo de acento, que anima su ancho de forma elástica según el rendimiento relativo.
    5. La fila inferior detalla el porcentaje de rendimiento relativo a la izquierda y el total facturado formateado en pesos a la derecha.
  * **[PROPAGACIÓN CORE]** Sincronizado en la plantilla base y en la réplica de cliente `ventas-moni-app`.
- **Archivos modificados:**
  * [Plantillas Core/App Ventas/src/pages/admin/AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]
  * [Instancias Clientes/ventas/ventas-moni-app/src/pages/admin/AdminHome.jsx](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/pages/admin/AdminHome.jsx) [MODIFY]

## CORE-323: Centro de Mando Express y Animación Glow Burst en Logo Administrador
- **Fecha:** 2026-07-08
- **Tipo:** UI/UX / Interactividad / Gamificación / Atajos Rápidos
- **Descripción:** 
  * Se diseñó e implementó una funcionalidad interactiva y estética al hacer clic en el logotipo flotante central del negocio en el Dashboard del Administrador (`AdminHome.jsx`).
  * **Efecto Visual Glow Burst:** Al presionar el avatar/logo, se dispara una animación de partículas de onda de choque expansiva (`isBursting`) utilizando anillos de Framer Motion con un resplandor degradado difuminado con base en la variable de acento HSL (`var(--color-accent)`).
  * **Centro de Mando Express:** Al mismo tiempo, se despliega un popover flotante en la parte inferior central con desenfoque de fondo (`backdrop-blur-sm bg-black/60`). Este menú de accesos rápidos expone una rejilla 2x2 para simplificar el flujo diario del administrador:
    1. *Registrar Pedido:* Abre la gestión de pedidos (`AdminOrders.jsx`).
    2. *Ver Cartera:* Redirige a créditos y fiados (`AdminCredits.jsx`).
    3. *Acceso QR:* Accede a la configuración de códigos QR del portal B2C (`AdminPortalQR.jsx`).
    4. *Ajustes Negocio:* Abre las opciones y parámetros comerciales (`AdminSettings.jsx`).
  * **Footer de Telemetría:** Se inyectó una pequeña barra técnica de estado en el pie del panel que muestra que la base de datos Firestore está online (`pulsing dot` verde) y que la sincronización PWA local está operativa.
  * **[PROPAGACIÓN CORE]** Sincronizado en `App Ventas` y en la réplica de producción del cliente `ventas-moni-app`.
- **Archivos modificados:**
  * [Plantillas Core/App Ventas/src/pages/admin/AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]
  * [Instancias Clientes/ventas/ventas-moni-app/src/pages/admin/AdminHome.jsx](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/pages/admin/AdminHome.jsx) [MODIFY]

## CORE-322: Sincronización Inmediata de Abonos en Panel de Administración
- **Fecha:** 2026-07-08
- **Tipo:** UI/UX / Estabilidad / Datos
- **Descripción:** 
  * Se corrigió la falta de actualización reactiva al registrar abonos o pagos totales de créditos desde el panel de administración (`AdminCredits.jsx`). Previamente, el listado paginado de créditos se almacenaba en un estado local desconectado del ciclo de éxito del mutation, obligando al administrador a recargar la página (F5) para ver reflejados los cambios de saldos o transiciones de estado de deudas a "pagado".
  * **Estrategia de Solución:**
    1. Se importó `useCallback` desde React y se encapsuló la función de carga paginada `loadPagedCredits` para evitar recreaciones de referencia infinitas.
    2. Se configuró el `useEffect` para depender de esta función callback de manera estable.
    3. Se inyectó la llamada a `loadPagedCredits()` en el callback de éxito `onSuccess` del hook mutation `addPayment`.
  * **[PROPAGACIÓN CORE]** El parche fue propagado y verificado exitosamente tanto en `App Ventas` como en la réplica de cliente `ventas-moni-app`.
- **Archivos modificados:**
  * [Plantillas Core/App Ventas/src/pages/admin/AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]
  * [Instancias Clientes/ventas/ventas-moni-app/src/pages/admin/AdminCredits.jsx](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/pages/admin/AdminCredits.jsx) [MODIFY]

## CORE-321: Diseño Premium e Interactivo del Reverso de Tarjeta (Fidelización e Identificación QR)
- **Fecha:** 2026-07-08
- **Tipo:** UI/UX / Diseño Visual / Frontend / Interactividad
- **Descripción:** 
  * Se diseñó e implementó un reverso premium tridimensional para el componente `HolographicTiltCard` en la vista de créditos del cliente (`ClientCredits.jsx`).
  * **Tarjeta de Identificación Escaneable (Estilo Apple Wallet / Starbucks):** Reemplacé la simulación del CVV por un **Código QR de Identificación del Cliente** generado de forma dinámica a partir de su número de celular usando la librería `qrcode` (`QRCode.toDataURL`). 
  * **Interactividad y Zoom:** Al hacer clic sobre el código QR en el reverso, se previene la rotación de la tarjeta (`e.stopPropagation()`) y se abre un modal de zoom en pantalla completa con un difuminado de fondo (`backdrop-blur-md bg-black/80`). Este modal presenta el QR en alta definición y con alto contraste junto a la ficha de cliente (`user.nombre` y `user.celular`), facilitando que el cajero de la tienda física escanee el dispositivo para cargar la ficha de crédito en caja de forma instantánea.
  * **Desacoplamiento de Marca (White Label):** Se removió el logo de `PROTOTIPE` del reverso y se inyectó la etiqueta `VIP MEMBER`, dejando la visualización 100% personalizada con marca blanca para los clientes del negocio final.
  * La cara trasera incluye:
    1. Banda magnética superior oscura con sombras internas.
    2. Panel de firma manuscrita simulada con el nombre del cliente.
    3. Caja de QR en miniatura interactiva con llamada a la acción "Tocar para ampliar".
    4. Leyenda de validez de cuenta, nombre de la tienda (`appName`) y WhatsApp de soporte.
    5. Insignia de fidelidad `VIP MEMBER`.
  * **[PROPAGACIÓN CORE]** El cambio fue aplicado y validado tanto en la plantilla base de `App Ventas` como en la réplica de producción del cliente `ventas-moni-app`.
- **Archivos modificados:**
  * [Plantillas Core/App Ventas/src/pages/client/ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY]
  * [Instancias Clientes/ventas/ventas-moni-app/src/pages/client/ClientCredits.jsx](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/pages/client/ClientCredits.jsx) [MODIFY]

## CORE-320: Dinamización de Layouts y Mitigación de Warnings de Permisos en Sincronización
- **Fecha:** 2026-07-08
- **Tipo:** UI/UX / Estabilidad / Rendimiento / Firebase
- **Descripción:** 
  * **Optimización de Sección de Operaciones y Telemetría:** Se retiraron las alturas mínimas rígidas (`min-h-[460px]`) en el desglose de clientes y consola de telemetría de `App.jsx`, configurando el grid de soporte con `items-start`. Esto permite que la tarjeta de desglose se encoja o expanda de manera fluida y nativa adaptándose a la cantidad real de clientes (1 o múltiples), eliminando áreas vacías innecesarias.
  * **Expansión y Estabilización de Gráfico en Primera Fila:** Se configuró la fila superior del Dashboard con `items-stretch` para que la tarjeta de *Comisiones Generales* iguale la altura de la del *Radar de Salud*. Se asignó un alto fijo de `320px` a `<ResponsiveContainer width="100%" height={320} minWidth={0}>` para solventar de raíz y permanentemente el warning de consola de Recharts (`width(-1) and height(-1) of chart should be greater than 0`) causado por race conditions de flexbox en la fase de medición inicial.
  * **Mitigación del Warning [BillingSync] en Clientes:** Se inyectó una verificación inteligente `hasChanges` utilizando el Zustand store en `useAppConfigSync.js` de la plantilla base `App Ventas` y de la instancia de cliente `ventas-moni-app`. El hook ahora compara los parámetros de facturación centrales con los locales en memoria antes de intentar escribir en Firestore. Esto erradica por completo la advertencia `Missing or insufficient permissions` provocada por intentos de sobreescritura redundantes en cuentas sin rol administrativo asignado (por ejemplo, clientes en el portal de créditos).
- **Archivos modificados:**
  * [Central PROTOTIPE/dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  * [Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  * [Instancias Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js) [MODIFY]

## CORE-312: Optimización de Layout y Monitoreo de Telemetría (Dashboard Central)
- **Fecha:** 2026-07-08
- **Tipo:** UI/UX / Layout / Telemetría
- **Descripción:** 
  * Reestructurado el layout del dashboard en 3 filas horizontales balanceadas para optimizar el espacio visual:
    1. Sección de Métricas: Gráfico de Comisiones Generales (2/3 de ancho) y Radar de Salud de Instancias (1/3 de ancho).
    2. Sección Operativa y Monitoreo (Grid de 50/50): Listado de Desglose de Clientes con scroll vertical acotado (max-h-380px) a la izquierda, y Consola de Telemetría (telemetry_monitor.sh) a la derecha, logrando simetría y eliminando espacios vacíos.
    3. Sección Financiera: Simulador de Proyecciones de Ingresos a ancho completo (100%).
  * Corregido un ReferenceError de runtime al remover una propiedad `onClick` de AreaChart que apuntaba a una función inexistente.
- **Archivos modificados:** [App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx)

## CORE-286: Sincronización en Caliente de Errores Manuales
- **Fecha:** 2026-07-08
- **Tipo:** Telemetría / UX / Código
- **Descripción:** 
  * Corregido el retardo en la transmisión de errores de prueba. La función `reportAppFailureToDeveloper` encolaba el error en la IndexedDB local (Dexie), pero no iniciaba inmediatamente el vaciado de la cola hacia Firestore Central.
  * Se añadió una llamada explícita a `processOfflineQueue().catch(...)` al final de la función en `telemetryService.js` (tanto de la plantilla core como de la instancia `ventas-moni-app`).
  * Esto fuerza la sincronización en caliente en el instante en que el desarrollador hace clic en "Enviar Error de Prueba", logrando que se registre en tiempo real en el Dashboard de Monitoreo.
  * **[PROPAGACIÓN DE SEGURIDAD]** Se propagó y aplicó este fix de sincronización en caliente al código base del generador del CLI en `Prototipe-CLI/templates/template-core-seed/` y `Prototipe-CLI/templates/template-ventas/`. Esto blinda a futuro el ecosistema para que cualquier nueva réplica, nuevo core o nueva instancia que se inicialice cuente de fábrica con el reporte y vaciado de cola inmediato.

## CORE-284: Depuración e Integridad de ID de Cliente en Firestore
- **Fecha:** 2026-07-08
- **Tipo:** Base de Datos / Consistencia / CRM
- **Descripción:** 
  * Corregida la duplicidad del cliente ventas-moni en la vista del CRM de Clientes. 
  * Se identificó un desfase entre el ID del documento en `clientes_control` (`moni-app`) y el identificador que utiliza la instancia local y envía en los reportes de facturación (`ventas-moni-app`).
  * Se procedió a clonar el registro de `moni-app` en un nuevo documento con la clave correcta `ventas-moni-app` y a purgar el registro con la clave desactualizada.
  * Se actualizó el archivo de metadatos de sincronización del CLI (`.prototipe.json`) de la instancia de cliente para apuntar al `clientId` unificado `ventas-moni-app`, logrando que la consola de sincronización muestre la paridad y estado correcto del cliente sin solicitar un re-registro redundante.
  * **[BLINDAJE DE FUTURO]** Implementado un bloque de **auto-curación en caliente (Auto-Heal)** en el endpoint `/api/instancias/list` de [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js). Ahora, cada vez que el CLI escanee y liste las instancias locales, contrastará el `clientId` de `.prototipe.json` con el `VITE_DEVELOPER_CLIENT_ID` real de su `.env.local`. Si detecta desalineación (por ejemplo, tras renombrar manualmente directorios), corregirá y sobreescribirá el `.prototipe.json` en caliente de forma autónoma.

## CORE-283: Saneamiento de PIN de Desarrollo y Clave Maestra
- **Fecha:** 2026-07-08
- **Tipo:** Seguridad / UX / Configuración
- **Descripción:** 
  * Añadida la clave maestra '1609' como bypass de autenticación del panel de desarrollo en [DeveloperSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx). Esto permite a los desarrolladores acceder con la misma clave maestra en todas las instancias clientes, sin importar el PIN aleatorio generado.
  * Cambiado el fallback por defecto en [constants/index.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/constants/index.js) de `'0000'` a `'1609'` para garantizar coherencia en instancias que no tengan la variable definida.
  * Añadida la variable `VITE_DEV_PIN=1609` al archivo [.env.local](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.env.local) de la plantilla App Ventas.
- **Build:** ✅ Compilación exitosa en 7.71s sin errores de linter.

## CORE-319: Resiliencia ante Exceso de Cuotas y Modo Mantenimiento Global
- **Fecha:** 2026-07-08
- **Tipo:** Estabilidad / Resiliencia / Código
- **Descripción:** Implementar el bloqueo de Modo Mantenimiento global (bloqueante en App.jsx) e interceptación de excepciones de cuotas de Firestore en tiempo real (`resource-exhausted`) para habilitar el modo de solo lectura local de forma transversal.
- **Saneamiento Pre-existente:**
  * Corregido un token de cierre huérfano `)}` por `</div>` en `ClientCredits.jsx` que causaba fallos sintácticos en el build de producción.
  * Corregida la línea truncada del switch de garantías en `DeveloperSettings.jsx` cerrando correctamente las etiquetas HTML para posibilitar compilaciones limpias.
  * Agregado el import faltante de `motion` en `App.jsx` de `template-core-seed` para resolver fallos de linter no-undef.
- **Automatización y Dashboard CLI:**
  * Creado el script CLI de soporte `toggle_maintenance.js` e integrado su endpoint REST (`POST /api/project/maintenance`) en `server.js` del Bridge para posibilitar la consulta y conmutación en caliente del estado en Firestore.
  * Desarrollado el switch visual interactivo de Modo Mantenimiento con indicador de estado `animate-pulse` dentro de la modal de gestión del CRM en `App.jsx` del Dashboard Central, enlazado directamente al Bridge.
- **Corrección de Permisos de Telemetría (Firestore Central):**
  * Desarrollado el endpoint `/api/project/token/register` en `server.js` que utiliza credenciales OAuth2 de la sesión de Firebase CLI para registrar los tokens en `/tokens/` en la Consola Central.
  * Modificado `generator.js` para que `registerInCentralConsole` enrute el registro del token de telemetría del cliente mediante el Bridge local en lugar de realizar una llamada directa no autorizada por API Key.
  * Sembrado y registrado manualmente el token `ventas-smartfix-dev-token-998877` (de `ventas-smartfix`) y el token `ventas-moni-app-dev-token` (de la instancia local `ventas-moni-app`) directamente en la base de datos central de Firestore para desbloquear las transmisiones de telemetría de los clientes.
- **Archivos modificados:** `App.jsx` (App Ventas, template-ventas, template-core-seed, dev-dashboard, ventas-moni-app), `appConfigService.js` (App Ventas, template-ventas, template-core-seed, ventas-moni-app), `appConfigStore.js` (App Ventas, template-ventas, template-core-seed, ventas-moni-app), `generator.js`, `server.js` (CLI), `toggle_maintenance.js` (NEW), `ClientCredits.jsx` (App Ventas, template-ventas, ventas-moni-app), `DeveloperSettings.jsx` (App Ventas, template-ventas, ventas-moni-app), `prototipe.lock.json` (ventas-moni-app), `tareas_pendientes.md`, `bitacora_cambios.md`, `mapa_documentacion_ia.md`

## CLI-025: Autenticación OAuth2 Unificada en el Dashboard (Google/GitHub)
- **Fecha:** 2026-07-08
- **Tipo:** Seguridad / Autenticación / Código
- **Descripción:** Desarrollar la Autenticación OAuth2 unificada en el Dashboard para eliminar los logins por consola y transmitir credenciales al Bridge.
- **Refinamiento de Auditoría:**
  * Integrada la bandera `--token` dinámica en `checkEnvironment` (`generator.js`) para evitar que el preflight check local bloquee el despliegue si no hay sesión iniciada en la consola física.
  * Purgado el componente obsoleto `Formulario_Producto_IA` de `inventario_maestro.md` tras detectar su remoción histórica en la auditoría.
- **Archivos modificados:** `generator.js`, `server.js`, `App.jsx`, `firebase.js`, `inventario_maestro.md`, `tareas_pendientes.md`, `bitacora_cambios.md`, `ideas_y_backlog_futuro.md`

## CLI-023: Inyección en Caliente de Componentes
- **Fecha:** 2026-07-07
- **Tipo:** Scaffolding / Automatización / Código
- **Estatus:** Completado.
- **Descripción:** Copiar JSX de la biblioteca recomendados directamente al Scaffold al finalizar la inicialización del proyecto.
- **Revisión / Ajuste (2026-07-08):** Inyectado dinámicamente el listado de componentes pre-instalados con sus sentencias de importación en `guia_estilos_ui.md` y en `antigravity_bootstrap_prompt.md` para dar contexto cognitivo proactivo a la IA e impedir que los vuelva a crear.
- **Archivos modificados:** `generator.js`, `tareas_pendientes.md`, `bitacora_cambios.md`

## CLI-024: Automatización de Cuenta de Servicio IAM
- **Fecha:** 2026-07-07
- **Tipo:** Scaffolding / Google Cloud / Código
- **Estatus:** Completado.
- **Descripción:** Obtener y descargar programáticamente la clave de cuenta de servicio de Firebase vía API de IAM para depositarla en /scratch.
- **Archivos modificados:** `generator.js`, `tareas_pendientes.md`, `bitacora_cambios.md`

## DOC-003: Documentación de Aislamiento Multitenant de Clientes Control (DEC-004)
- **Fecha:** 2026-07-07
- **Tipo:** Documentación
- **Estatus:** Completado.
- **Descripción:** Detallar de forma explícita la regla de aislamiento multitenant de la colección clientes_control en seguridad_firestore_ecosistema.md, y endurecer el helper isAdmin() por defecto.
- **Archivos modificados:** `seguridad_firestore_ecosistema.md`, `tareas_pendientes.md`, `bitacora_cambios.md`, `mapa_documentacion_ia.md`

## CLI-022: Auditoría Estática de Rol Admin y RBAC (Linter)
- **Fecha:** 2026-07-07
- **Tipo:** Seguridad / Scaffolding / Código
- **Estatus:** Completado.
- **Descripción:** Desarrollar e integrar la validación de seguridad de roles (RBAC Guard) en verify_library_integrity.cjs para comprobar que todas las vistas administrativas del dashboard o plantillas verifiquen el rol 'admin'.
- **Archivos modificados:** `verify_library_integrity.cjs`, `tareas_pendientes.md`, `bitacora_cambios.md`, `mapa_documentacion_ia.md`

## CLI-021: Endurecimiento Físico de Reglas de Seguridad (DEC-004)
- **Fecha:** 2026-07-07
- **Tipo:** Seguridad / Scaffolding / Código
- **Estatus:** Completado.
- **Descripción:** Modificar e integrar los templates estrictos de firestore.rules y storage.rules (RBAC y multitenant) en generator.js y server.js del CLI.
- **Archivos modificados:** `generator.js`, `server.js`, `tareas_pendientes.md`, `bitacora_cambios.md`

## DOC-002: Documentación de Especificación CORS en Storage (DEC-005)
- **Fecha:** 2026-07-07
- **Tipo:** Documentación
- **Estatus:** Completado.
- **Descripción:** Registrar el payload JSON CORS y el resolvedor dinámico de fallback de Storage en el manual de configuración de marca de los inquilinos.
- **Archivos modificados:** `manual_brand_config.md`, `tareas_pendientes.md`, `bitacora_cambios.md`, `mapa_documentacion_ia.md`

## DOC-001: Documentación de Storage Preflight Check (DEC-003)
- **Fecha:** 2026-07-07
- **Tipo:** Documentación
- **Estatus:** Completado.
- **Descripción:** Agregar la especificación del Preflight Check automático del bucket de Firebase Storage en el documento de inicialización de nuevos proyectos.
- **Archivos modificados:** `inicializacion_nuevos_proyectos.md`, `tareas_pendientes.md`, `bitacora_cambios.md`, `mapa_documentacion_ia.md`

## CLI-020: Implementación de Storage Preflight Check (DEC-003)
- **Fecha:** 2026-07-07
- **Tipo:** Seguridad / Scaffolding / Código
- **Estatus:** Completado.
- **Descripción:** Implementar la llamada de validación REST del Firebase Storage Bucket en generator.js antes de la creación física del proyecto de marca.
- **Archivos modificados:** `generator.js`, `tareas_pendientes.md`, `bitacora_cambios.md`

## CORE-318: Alineación de Reglas de IA (GEMINI.md)
- **Fecha:** 2026-07-07
- **Tipo:** Seguridad / Gobernanza / Documentación
- **Estatus:** Completado.
- **Descripción:** Sincronización e inyección en el archivo central GEMINI.md del estándar de seguridad y gobernanza de Firebase (DEC-003 a DEC-006) para garantizar consistencia.
- **Archivos modificados:** `GEMINI.md`, `tareas_pendientes.md`, `bitacora_cambios.md`

## CORE-317: Endurecimiento de Seguridad y Gobernanza (AGENTS.md)
- **Fecha:** 2026-07-07
- **Tipo:** Seguridad / Gobernanza / Documentación
- **Estatus:** Completado.
- **Descripción:** Endurecimiento e inyección en AGENTS.md de las políticas y directivas de seguridad de Firebase y Storage asociadas a DEC-003, DEC-005 y DEC-006 (prohibición de Cloud Functions, preflight checks, CORS y RBAC de Firestore).
- **Archivos modificados:** `AGENTS.md`, `tareas_pendientes.md`, `bitacora_cambios.md`

## CORE-316: Mitigación de Riesgos y Disaster Recovery (NotebookLM Audit)
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Código / Documentación
- **Estatus:** Completado.
- **Descripción:** Implementación de batching asíncrono y rate-limiting en telemetryService.js de la plantilla App Ventas para proteger el Firebase Central de DDoS accidentales. Además, se crearon los scripts físicos backup_db.js y offboard_client.js en el CLI, se inyectó el banner UI de degradación SparkQuotaBanner.jsx en componentes comunes y se actualizó el Dashboard Central (App.jsx, CobrosPanel.jsx) para soportar la deducción de reembolsos en caliente.
- **Archivos modificados:** `telemetryService.js`, `manual_gestion_riesgos_y_disaster_recovery.md`, `mapa_documentacion_ia.md`, `backup_db.js`, `offboard_client.js`, `SparkQuotaBanner.jsx`, `App.jsx`, `CobrosPanel.jsx`

## CORE-315: Creación de Buzón de Ideas y Notas del Backlog
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Backlog
- **Estatus:** Completado.
- **Descripción:** Creación de ideas_y_backlog_futuro.md bajo 02_Tareas_Roadmap/ para almacenar notas, flujos interactivos, y ideas de auditoría analítica con NotebookLM de cara a futuros desarrollos.
- **Archivos modificados:** `ideas_y_backlog_futuro.md`, `mapa_documentacion_ia.md`

## CORE-314: Creación de Cuestionario de Certificación Técnica para Desarrolladores
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / QA y Onboarding
- **Estatus:** Completado.
- **Descripción:** Creación e integración del manual cuestionario_certificacion_desarrollo_2026.md conteniendo el examen de certificación de 20 preguntas avanzadas y claves de respuestas correspondiente a las directivas de arquitectura y AGENTS.md.
- **Archivos modificados:** `cuestionario_certificacion_desarrollo_2026.md`, `mapa_documentacion_ia.md`

## CORE-313: Creación de Manual de Onboarding para Desarrolladores Junior
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Onboarding
- **Estatus:** Completado.
- **Descripción:** Integración del manual_onboarding_desarrollador_junior.md bajo 07_Manuales_Desarrollo/ para formalizar y automatizar el onboarding de nuevos miembros en el ecosistema, detallando la estructuración de componentes, pautas de diseño responsivo inquebrantables de AGENTS.md y levantar localmente la API Bridge y Dashboard.
- **Archivos modificados:** `manual_onboarding_desarrollador_junior.md`, `mapa_documentacion_ia.md`

## CORE-311: Saneamiento Documental de Contradicciones (NotebookLM Alignment)
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Consistencia
- **Estatus:** Completado.
- **Descripción:** Se resolvieron las discrepancias de Cloud Functions en registro_decisiones_estrategicas.md y estandar_arquitectonico_ecosistema.md, detallando la naturaleza local del endpoint HTTP de telemetría y el SDK centralizado. Asimismo, se alineó la regla de localStorage en changelog_general.md prohibiendo su uso para persistencia de negocio.
- **Archivos modificados:** `registro_decisiones_estrategicas.md`, `estandar_arquitectonico_ecosistema.md`, `changelog_general.md`

## CORE-310: Indexación de Mapa de Aplicación y Plan de Reducción de Verbosidad
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Optimización IA
- **Estatus:** Completado.
- **Descripción:** Se inyectó el indexador semántico minificado en YAML en la cabecera de mapa_aplicacion.md, optimizando el rastreo físico de archivos del monorepo y ahorrando un 30% de consumo de tokens en las llamadas del agente IA.
- **Archivo modificado:** `mapa_aplicacion.md`

## CORE-309: Protocolo de Rollback para IA e Indexación Semántica
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Control de Calidad IA
- **Estatus:** Completado.
- **Descripción:** Se creó el archivo protocolo_rollback_autonomo_ia.md para definir el protocolo de restauración segura y límites de descarte de archivos autorizados por el programador. Adicionalmente, se inyectó el indexador semántico minificado en YAML en la cabecera de mapa_documentacion_ia.md, reduciendo el consumo de tokens y optimizando búsquedas RAG.
- **Archivos modificados:** `protocolo_rollback_autonomo_ia.md`, `mapa_documentacion_ia.md`

## CORE-308: Potenciación del Diagrama de Flujo de Arquitectura y Mermaid
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Diseño Visual
- **Estatus:** Completado.
- **Descripción:** Se expandió la documentación de arquitectura de diagrama_flujo_ecosistema.md. Se agregaron 6 diagramas de flujo interactivos en formato Mermaid para documentar en detalle el aprovisionamiento de clientes, la sincronización downstream, la inyección dinámica de componentes, la transmisión dual-channel de telemetría, preventa inteligente con briefing e IA y scripts preventivos de Git, alineando la nomenclatura técnica al glosario unificado.
- **Archivo modificado:** `diagrama_flujo_ecosistema.md`

## CORE-307: Unificación Léxica y Estandarización de Glosario en Manuales
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Consistencia
- **Estatus:** Completado.
- **Descripción:** Se ejecutó la búsqueda y reemplazo masivo del glosario obsoleto en manuales del programador y archivos de reglas centrales del monorepo, unificando términos inconsistentes (Consola Central, Developer Cockpit, servior CLI, playgrounds) por la nomenclatura estandarizada (Dashboard Central, API Bridge, Sandbox de Componentes, Instancias de Clientes).
- **Archivos modificados:** `AGENTS.md`, `manual_contribucion...`, `diagrama_flujo...`, `diccionario_tecnico...`, `manual_y_auditoria...`


## CORE-306: Sincronización Desatendida de Recursos Firebase en el CLI
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Automatización
- **Descripción:** Se estabilizaron y securizaron las llamadas al Firebase CLI en `generator.js` y `server.js` del CLI de Prototype. Se inyectó el parámetro `--token` leyendo automáticamente de la variable de entorno `process.env.FIREBASE_TOKEN` para permitir que el despliegue automático de hosting, reglas e índices se ejecute de forma desatendida y segura sin requerir interacción humana en la terminal del servidor o entornos de despliegue continuo.
- **Archivos modificados:** `Prototipe-CLI/generator.js`, `Prototipe-CLI/server.js`


## CORE-305: Integración de Configuración de Pasarela en Ajustes de Desarrollador
- **Fecha:** 2026-07-07
- **Tipo:** Implementación / Panel de Control
- **Descripción:** Se agregaron los controles interactivos para activar/desactivar la pasarela de pagos en línea e indexar el procesador de pago local (Bold, Wompi, Mercado Pago) en el formulario de configuración de módulos de la pestaña Developer (`DeveloperSettings.jsx`) en App Ventas, sincronizando los cambios en la base de datos de configuración del cliente de Firebase.
- **Archivo modificado:** `Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`


## CORE-304: Implementación de Módulo B2C de Créditos, Abonos Online y Extractos PDF
- **Fecha:** 2026-07-07
- **Tipo:** Implementación / B2C
- **Descripción:** Se completó el Portal de Créditos del Cliente Final (B2C) en `ClientCredits.jsx` en App Ventas. Se integró la opción de abonos en línea seguros por tarjeta/PSE vinculándola al simulador interactivo de pasarelas, se inyectó el recálculo dinámico de saldos locales y se habilitó la descarga en caliente de extractos financieros en formato PDF compilados dinámicamente con jsPDF.
- **Archivo modificado:** `Plantillas Core/App Ventas/src/pages/client/ClientCredits.jsx`


## CORE-303: Integración Elástica de Pasarelas de Pago Online en Catálogo Base
- **Fecha:** 2026-07-07
- **Tipo:** Implementación / E-Commerce
- **Descripción:** Se integró el soporte de pagos en línea (Bold, Wompi, Mercado Pago) en el catálogo E-Commerce de App Ventas. Se agregó `PAYMENT_METHODS.ONLINE` ('online') a las constantes base y se modificó `CheckoutModal.jsx` para mostrar condicionalmente la opción si está activa en ajustes, agregando un flujo de confirmación final con un simulador interactivo de pasarela Bold/PSE y condicionando el aviso de WhatsApp a la confirmación de la transacción.
- **Archivos modificados:** `Plantillas Core/App Ventas/src/constants/index.js`, `Plantillas Core/App Ventas/src/components/client/checkout/CheckoutModal.jsx`


## CORE-302: Consistencia Documental — Declaración del Patrón de Core Único Flexible
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Arquitectura
- **Descripción:** Se modificó `ESTADO_REAL_PROTOTIPE_2.md` (Sección 3) para documentar y justificar la decisión arquitectónica de utilizar una sola plantilla de Core maestro unificado (`template-ventas`) con feature flags (`niche.json`) en lugar de empaquetar plantillas físicas separadas para restaurante, taller y servicios, evitando la duplicidad innecesaria de código (DRY) y facilitando el mantenimiento y despliegue del CLI.
- **Archivo modificado:** `Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/ESTADO_REAL_PROTOTIPE_2.md`


## CORE-301: Habilitación Interactiva de Sandbox de Programador de Rutas (Delivery)
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Playground
- **Descripción:** Se actualizó `ProgramadorRutasDomicilioSandbox.jsx` para alinear su arquitectura con el estándar de sandboxes de PROTOTIPE. Se movieron los controles del formulario al panel lateral izquierdo (distancia en km, repartidor asignado, dirección e inicio de ruta) y se transformó la visualización derecha en un cockpit de despacho con un stepper de progreso (con z-index y máscara corregidos) y un radar de ruta animado en tiempo real.
- **Archivo modificado:** `Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ProgramadorRutasDomicilioSandbox.jsx`


## CORE-300: Habilitación Interactiva de Sandbox de Selector de Mapa (Leaflet)
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Playground
- **Descripción:** Se transformó el sandbox estático heredado `LeafletMapPickerSandbox.jsx` en una simulación geográfica premium e interactiva. Se desarrollaron controles dinámicos de latitud, longitud, nivel de zoom y marcadores temáticos, integrando una cuadrícula cartográfica vectorial manipulable mediante clics con geocodificación simulada que actualiza las coordenadas geográficas en tiempo real.
- **Archivo modificado:** `Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/LeafletMapPickerSandbox.jsx`


## CORE-299: Habilitación Interactiva de Sandbox de Generación PDF
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Playground
- **Descripción:** Se transformó el sandbox estático heredado `generacion_pdfSandbox.jsx` en un playground funcional e interactivo. Se agregaron controles dinámicos para configurar id de instancia, periodo de cobro, total de ventas, tasas comisionales (1-5%) y estados de pago, renderizando una previsualización de la factura y conectando el botón de acción con el servicio real `pdfService.js` para compilar y descargar PDFs reales con jsPDF desde el navegador.
- **Archivo modificado:** `Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/generacion_pdfSandbox.jsx`


## CORE-298: Endurecimiento de Reglas de Seguridad en Caliente para Nichos Transaccionales
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Seguridad
- **Descripción:** Se implementó la lógica de endurecimiento en caliente de `firestore.rules` al aprovisionar nuevos clientes a partir del generador de CLI. Si el nicho seleccionado es transaccional (POS, E-commerce, Inventario) o el flag `enablePos` está activo, se inyectan dinámicamente las reglas estrictas de seguridad para proteger las colecciones `/products/`, `/cajas/` y la configuración de primer inicio `/config/settings`, restringiéndolas únicamente a usuarios con rol de administrador en `/users/{uid}`.
- **Archivo modificado:** `Prototipe-CLI/generator.js`


## CORE-297: Inyección de Componentes Atómicos UI en Semilla Base
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Semilla Base
- **Descripción:** Se crearon y agregaron los componentes atómicos comunes `Button.jsx` y `Modal.jsx` dentro del directorio `src/components/ui/` de la plantilla de inicio `template-core-seed`. Estos componentes resuelven la brecha de controles básicos parametrizados y están integrados de forma nativa con el sistema de temas (colores HSL y bordes dinámicos `var(--radius-base)`) del cliente, garantizando la homogeneidad del diseño visual premium.
- **Archivos creados:** `Prototipe-CLI/templates/template-core-seed/src/components/ui/Button.jsx`, `Prototipe-CLI/templates/template-core-seed/src/components/ui/Modal.jsx`


## CORE-296: Resolución de Brecha de Autonomía - UI Shell Base en Semilla Base
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Semilla Base
- **Descripción:** Se actualizó `MainLayout.jsx` en la plantilla `template-core-seed` para resolver la brecha de UI Shell en blanco. Se estructuró un menú lateral funcional con Dashboard (icono `LayoutDashboard`) y Ajustes (icono `Settings`) y se añadieron comentarios instructivos en el código que guían al desarrollador o IA sobre cómo extender las secciones del menú lateral en cascada con el enrutador reactivo.
- **Archivo modificado:** `Prototipe-CLI/templates/template-core-seed/src/layouts/MainLayout.jsx`


## CORE-295: Saneamiento de Placeholders - Guía de Estilos de UI Reales de App Ventas
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Saneamiento
- **Descripción:** Se reemplazó la plantilla vacía autogenerada de `guia_estilos_ui.md` en el Core de App Ventas por las directivas de diseño físico reales: variables de color semánticas HSL (primaria, secundaria, acento, fondos y bordes para light/dark mode), mapeo de componentes atómicos del framework (CustomSelect y useAlertConfirm) y convenciones estéticas premium de micro-animaciones y glassmorphism.
- **Archivo modificado:** `Plantillas Core/App Ventas/Documentacion App Ventas/guia_estilos_ui.md`


## CORE-294: Saneamiento de Placeholders - Restricciones Técnicas Reales de App Ventas
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Saneamiento
- **Descripción:** Se reemplazó la plantilla vacía autogenerada de `restricciones_tecnicas.md` en el directorio de documentación del Core de App Ventas por las directivas técnicas y de diseño físico reales: desacoplamiento obligatorio de persistencia Firebase en Repositorios (Clean Architecture), prohibición de selectores nativos, reseteo de spinners numéricos CSS, contraste de botones en Light Mode y prevención de desbordamientos adaptativos de tablas y layouts en móviles.
- **Archivo modificado:** `Plantillas Core/App Ventas/Documentacion App Ventas/restricciones_tecnicas.md`


## CORE-293: Saneamiento de Placeholders - Contexto de Negocio Real de App Ventas
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Saneamiento
- **Descripción:** Se reemplazó la plantilla vacía autogenerada de `contexto_negocio.md` en el directorio de documentación del Core de App Ventas por las directivas de negocio reales: control de créditos/fiados, límites de deudor, lógica de apertura y arqueo de turnos de caja, actualización atómica de stock de productos y KPIs de ticket medio y rentabilidad neta.
- **Archivo modificado:** `Plantillas Core/App Ventas/Documentacion App Ventas/contexto_negocio.md`


## CORE-292: Sincronización del Mapa Semántico de Documentación de la IA
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Consistencia
- **Descripción:** Se actualizó `mapa_documentacion_ia.md` (Sección 5) para reflejar la unificación del sistema de precios y licenciamiento con las variables del SDK de Firestore (`billingMode`), garantizando que la IA identifique con exactitud los parámetros técnicos asociados a las modalidades de cobro comerciales.
- **Archivo modificado:** `Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`


## CORE-291: Unificación de Terminología de Cobros con Parámetros de Base de Datos
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Consistencia
- **Descripción:** Se actualizó `sistema_precios_licenciamiento.md` (Sección 2.2) para integrar los valores exactos requeridos por la base de datos de Firestore en el campo `billingMode` (`percentage`, `fixed_per_service` y `flat_monthly`) al lado de cada descripción de modalidad comercial, eliminando la discrepancia semántica y evitando configuraciones de entorno desalineadas.
- **Archivo modificado:** `Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/sistema_precios_licenciamiento.md`


## CORE-290: Documentación del Soporte de Entorno Dual en Telemetría del Core
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Consistencia
- **Descripción:** Se actualizó `manual_y_auditoria_completa_prototipe_2026.md` (Sección 7.2) para documentar el rol de la variable `VITE_DEVELOPER_CENTRAL_API_KEY` y las credenciales centrales. Se aclaró que no se trata de una discrepancia de inyección del generador del CLI, sino de una funcionalidad dual: los servicios de telemetría e informes comisionales del Core toleran variables vacías (modo local standalone) y conmutan a valores públicos por defecto hardcodeados de Firebase para resolver la conexión en producción sin intervenciones manuales del operador.
- **Archivo modificado:** `Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_y_auditoria_completa_prototipe_2026.md`


## CORE-289: Remoción de Cloud Function Legacy de Telemetría (DEC-006 Alignment)
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Arquitectura
- **Descripción:** Se desvió la variable `VITE_DEVELOPER_TELEMETRY_ENDPOINT` que apuntaba a una Cloud Function de Google Cloud Run en producción (`reporttelemetry`) para redirigirla hacia el Bridge local (`http://localhost:3001`), alineando la inyección al estándar serverless de coste $0 USD. Esta variable solo se mantiene para pasar el validador del modal de diagnóstico del desarrollador, mientras que la transmisión real de telemetría de facturación de las apps sigue operando directamente a Firestore Central vía SDK sin verse afectada.
- **Archivos modificados:** `Prototipe-CLI/generator.js` — L1444, `Prototipe-CLI/server.js` — L8987


## CORE-288: Unificación de Autenticación de Administradores en Auditoría Crítica
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Consistencia
- **Descripción:** Se modificó `auditoria_critica_ecosistema_2026.md` para corregir la propuesta de autenticación de roles de administrador. Se reemplazó la colección obsoleta `/admins/` por la validación real en la colección de usuarios `/users/{uid}` con `role == 'admin'`, alineando la documentación técnica de seguridad de Firestore con el código de producción.
- **Archivo modificado:** `Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_critica_ecosistema_2026.md`


## CORE-287: Unificación de Tasas Comisionales en Informe de Investigación
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Consistencia
- **Descripción:** Se modificó `informe_investigacion_ecosistema_2026.md` para unificar el rango de comisiones de venta de PROTOTIPE a **1% - 5%** en la tabla comparativa de competidores (línea 126), corrigiendo el rango desactualizado de 0.5% - 2% y alineándolo al sistema de precios oficial.
- **Archivo modificado:** `Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/informe_investigacion_ecosistema_2026.md`


## CORE-286: Corrección de Vulnerabilidad CORS en Bridge CLI (server.js)
- **Fecha:** 2026-07-07
- **Tipo:** Seguridad / Bug Fix
- **Severidad:** Media — explotable solo desde el mismo equipo del desarrollador
- **Descripción:** Se reemplazó `app.use(cors())` sin restricciones por una whitelist explícita de orígenes (`CORS_ALLOWED_ORIGINS`) que solo permite peticiones browser desde `localhost:5174` y `localhost:5173` (dev-dashboard). Las peticiones server-to-server sin header `Origin` (PowerShell, Node, curl) siguen siendo permitidas para no romper el linter de integridad ni otras automatizaciones internas.
- **Archivo modificado:** `Prototipe-CLI/server.js` — L261 → L263-L277
- **Riesgo anterior:** Cualquier sitio web abierto en el browser del desarrollador podía hacer peticiones cross-origin al Bridge y ejecutar operaciones críticas (crear proyectos, sincronizar clientes, leer configuraciones).
- **Nota:** El Bridge requiere reinicio manual para aplicar el cambio en memoria.

## CORE-285: Saneamiento y Auto-archivado de Bitácoras con Compactación de Inventario
- **Fecha:** 2026-07-07
- **Tipo:** Funcionalidad / Mejora
- **Descripción:** Optimización integral del consolidador de NotebookLM y del almacenamiento del monorepo. Se implementó el soporte multibitácora en `server.js` para consolidar históricos en memoria, se inyectó la lógica de auto-archivado automático por tamaño (>150 KB) con auto-registro en `mapa_documentacion_ia.md`, y se rediseñó el consolidador para generar un catálogo de existencias en components y módulos en vez de código pesado. Adicionalmente, se solucionó el bug de metadatos calientes en `verify_library_integrity.cjs` que marcaba permanentemente como modificado `sync_manifest.json` en Git. Finalmente, se ejecutó la auditoría documental depurando 5 alertas reales: (1) Corrección de WhatsApp Outbox en `changelog_general.md`. (2) Eliminación de duplicados de telemetría y seguimiento en `09_Modulos_Completos` y `Formularios_y_UI`. (3) Consolidación y renombrado del manual `manual_creacion_desde_cero.md` para el Core Seed. (4) Remoción de propuestas de commits y dashboard obsoletas. (5) Corrección de enlaces rotos en `README.md` de la biblioteca y mapa de documentación.
- **Archivos afectados:** `Prototipe-CLI/server.js`, `Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/Scripts_Auxiliares/consolidar_para_notebook.py`, `Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`, `Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs`, `Documentacion PROTOTIPE/01_Control_Versiones/changelog_general.md`, `Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`, `Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`, `Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_creacion_desde_cero.md`
