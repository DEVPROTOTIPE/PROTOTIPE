# Control de Tareas y Estado de Implementación (Roadmap de Prototype CLI)

Este documento registra de forma dinámica las tareas del motor **Prototype CLI** y los scripts de soporte y automatización del ecosistema.

---

* **[x] ~~E2E-Hotfix: Control de Modal de Telemetría en Tests de Checkout~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Modificado el helper de navegación inicial `passWelcomePage` en `checkout.helpers.js`. Ahora, si al iniciar el test se presenta el modal interactivo de "Prueba de Enlace de Telemetría" (el cual puede estar activo por pings recientes en la base de datos central), Playwright hace clic automáticamente en "Entendido / Aceptar" utilizando un timeout de 3000ms. Esto previene que el modal intercepte e invalide el clic del botón principal "Comencemos", asegurando la ejecución exitosa de la suite E2E y destrabando el flujo de push del script de backup sin modificar la lógica ni los listeners de telemetría de la aplicación.
  - Archivos: [checkout.helpers.js (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/helpers/checkout.helpers.js) [MODIFY]

* **[x] ~~Tarea CORE-028: Fondo Tecnológico Premium Animado — Capas de Grid y Orbs GPU-Accelerated~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Rediseñado el fondo decorativo central para el login y el panel del dashboard. Se implementó una capa de puntos sutiles que deriva continuamente (`grid-drift` a 60s) usando exclusivamente `transform` en un área de viewport sobredimensionada, garantizando 100% de rendimiento por GPU. Se agregaron dos orbs con gradientes radiales elípticos de colores de marca (violeta, cian, índigo) animados independientemente con drift muy lento y suave. Se actualizó la viñeta perimetral de sombreado y se configuraron variables HSL translúcidas `--color-surface-glass` y `backdrop-filter: blur(14px)` en las tarjetas para que el fondo tecnológico sea legible y fluya armónicamente tras las tarjetas en modo oscuro y claro.
  - Archivos: [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

* **[x] ~~Tarea CORE-027: Efecto Flotante Global de Tarjetas — CSS Attribute Selector Override~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Definidos tokens `--card-shadow` y `--card-shadow-hover` adaptativos por tema. Se aplicó un selector CSS de atributo global para divs rounded-2xl y rounded-3xl con bordes, con exclusiones estratégicas. Se generalizó el efecto flotante con sombras de alta calidad y suavidad en hovers y transiciones sin alterar el JSX, y se adaptó con glassmorphism translúcido.
  - Archivos: [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

* **[x] ~~Tarea CORE-026: Corrección de Contraste y Colores Inválidos en Consola de Telemetría y Global~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Corregido el problema de invisibilidad de texto e iconos en los botones interactivos (tabs), buscador y terminal de la Consola de Telemetría en Modo Claro. Definidos y mapeados de forma centralizada en `index.css` los colores de marca e interactivos no estándar (como `-650`, `-550` y `-755`) tanto para `:root.light` (manteniendo alto contraste) como para `:root`. Se reestructuraron las clases de los contenedores de tabs, buscador y la pantalla de la terminal en `App.jsx` para utilizar variables semánticas HSL en lugar de fondos oscuros fijos (como `bg-[#0b0f19]`). Se tradujeron todos los textos y estados de conexión de la consola al español (ej: "Live System Telemetry Console" a "Consola de Telemetría del Sistema en Vivo") y se incrementó el contraste en las etiquetas de estado de los logs.
  - Archivos: [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-025: Inversión Cromática Global y Adaptación Completa de Modo Claro~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Resuelto el problema generalizado de visualización y contraste deficiente al alternar al Modo Claro. Redefinida la escala completa de colores de Tailwind slate (slate-50 a slate-955) como variables CSS custom configurables. En el tema oscuro se aplican los valores tradicionales oscuros, y en el tema claro (`:root.light`) se invierten y mapean de manera adaptativa (bg-slate-900 a fondo blanco puro, text-slate-200 a texto oscuro legible, etc.). Adicionalmente, se implementaron reglas y overrides CSS para remapear de forma transparente los bordes y fondos blancos translúcidos hardcodeados (`border-white/[0.08]`, `bg-white/5`) a sus equivalentes oscuros con opacidad en modo claro. También se introdujeron selectores específicos para invertir de manera inteligente textos y hovers en blanco (`text-white`, `hover:text-white`) dentro de contenedores de fondo claro excluyendo de forma segura a los botones con fondos de color (como `bg-indigo-650`), logrando un contraste perfecto en toda la interfaz sin necesidad de modificar el código de los componentes.
  - Archivos: [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-024: Integración de Selector de Periodo por Calendario Premium y Gráfico Consolidado~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Renombrado el gráfico consolidado del Dashboard General a "Comisiones Generales" para reflejar el acumulado histórico. Diseñado e integrado un selector de periodo (Mes/Año) estilo calendario interactivo premium con estética glassmorphic en la cabecera. El DatePicker incluye navegación por años, cuadrícula de meses en español y visualización de un punto indicador de datos reales por mes. Al seleccionar un periodo, se filtran de forma reactiva las tarjetas de métricas principales, el desglose de clientes en el acordeón, la distribución por nichos, los costos Dian, y las tablas y sub-tablas de transacciones en los modales de detalle. El gráfico principal permanece histórico y dibuja una línea de referencia (ReferenceLine) discontinua para marcar el mes seleccionado en la tendencia general. Compilación local e integridad verificadas.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-023: Rediseño Premium del Dashboard General con Gráficos Interactivos Recharts, BI Avanzado y Reportes PDF~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Rediseñado el Dashboard General en `App.jsx` reemplazando barras de progreso por gráficos interactivos Recharts (AreaChart general y acordeones con AreaCharts por cliente de Framer Motion). Agregado el widget de Radar de Salud de Instancias en tiempo real con semáforos, latencias en ms y redireccionamiento condicional a la Consola de Errores. Diseñado el submódulo de BI y Eficiencia Financiera en el Simulador de Proyecciones con gráfico PieChart por nicho y desglose de margen neto descontando costos DIAN. Implementados modales funcionales de detalle para Comisión Acumulada, Cobrado y Por Recaudar con tablas dinámicas de transacciones e integración bidireccional con facturación y CRM. Integrada la exportación de PDFs en cascada (Conciliación, Métricas Generales, Directorio de Clientes y Ficha de Cliente).
  - Revisión (2026-06-21 - Hotfix/Ajustes):
    1. Se corrigió el error `React Hook Order Mismatch` moviendo todas las declaraciones de `useMemo` de proyecciones y BI arriba del condicional `if (!user)` para que se ejecuten de forma incondicional en cada renderizado.
    2. Se resolvieron los warnings y fallos de dimensiones de Recharts en mobile (`width(-1) and height(-1)`) especificando alturas numéricas fijas (`height={220}`, `height={112}`, `height={160}`) y `minWidth={0}` en todos los `ResponsiveContainer`.
    3. Se reorganizaron los botones de acción del panel en una cuadrícula responsiva flexible (`grid grid-cols-1 sm:flex`), y el botón/estado de base de datos "Conectado" se integró como un badge interactivo junto al título principal, logrando una interfaz limpia y despejada en celulares.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [pdfService.js (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/services/pdfService.js) [MODIFY]

* **[x] ~~Tarea CORE-022: Auditoría y Fortalecimiento de la Gestión de Plantillas Core~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Realizada auditoría técnica completa del módulo de plantillas core. Se implementó una función helper común `performCoreSync` en `server.js` para desacoplar y optimizar la sincronización y sanitización de archivos. Se creó el endpoint `POST /api/cores/:clave/sync` y se redirigió el botón "Sync → CLI" en `CoreCard.jsx` a este endpoint, resolviendo la inconsistencia por la cual se auto-activaban los cores en el wizard e incrementaban de versión sin permiso del desarrollador. Se robusteció la seguridad del endpoint de scaffold validando el core base y se implementó una verificación estricta de nombres de variables de entorno `.env.local` mediante expresiones regulares en backend y frontend (con feedback visual al añadir variables inválidas).
  - Archivos: [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [CoreCard.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [MODIFY]

* **[x] ~~Tarea CORE-021: Fortalecimiento de la Consola de Errores e Incidentes del Dashboard Central~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Robustecida la consola de incidentes en vivo del dashboard central sin remover funcionalidad existente. Se agregaron filtros dinámicos avanzados por estado de resolución (Activos / Resueltos / Todos) y severidad (Cualquier Severidad / Errores / Advertencias / Información). Se implementó un algoritmo premium de de-duplicación (agrupación) de errores repetidos por mensaje y cliente con contador animado de impactos. Se integró un sistema de notas de resolución inline que permite al desarrollador documentar la causa raíz y la solución en Firestore Central al marcar incidentes como resueltos, persistiendo el historial. Las tarjetas métricas de cabecera ahora actúan como filtros dinámicos al hacer clic sobre ellas. Se expandieron las heurísticas de diagnóstico automático en el modal para soportar errores de CORS, fallos de JSON.parse, permisos de Firebase Storage y Firestore en modo offline. Corregida además la omisión de la declaración de los estados de React para filtros de errores (`groupErrorsByMessage`, `selectedErrorStatusFilter`, `selectedErrorTypeFilter`, `resolutionNoteInputId`, `resolutionNoteText`) que causaba un crash `ReferenceError` al renderizar el componente principal.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-020: Arquitectura Multi-Core Escalable en template-core-seed y CLI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Refactorización y desacoplamiento de `template-core-seed` para soportar múltiples cores (billing configurable con adaptador, limpieza de campos e-commerce, hook useBilling). Reestructuración de `Instancias Clientes/` por core, actualización de scripts de backup y actualización del CLI (`generator.js` y `config.js`) para soportar la resolución dinámica de rutas por `coreType` y su sincronización central. Además, se validó la compilación local (`npm run build`) en todos los proyectos del ecosistema y se solucionó el bug de compilación de `template-core-seed` copiando el script autogenerador de mapa semántico para IA.
  - Archivos: [index.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/constants/index.js) [MODIFY], [billingService.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/billingService.js) [MODIFY], [useBilling.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useBilling.js) [MODIFY], [appConfigStore.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js) [MODIFY], [appConfigService.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/appConfigService.js) [MODIFY], [DeveloperDiagnosticsModal.jsx (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/admin/settings/DeveloperDiagnosticsModal.jsx) [MODIFY], [centralFirebaseService.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/centralFirebaseService.js) [MODIFY], [config.js (CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/config.js) [MODIFY], [generator.js (CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [plantillas_registro.json (CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json) [MODIFY], [generate_ia_map.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/scratch/generate_ia_map.js) [NEW]


* **[x] ~~Tarea CORE-019: Estandarización Total del Sistema de Telemetría e Interactividad en ventas-moni-app y Corrección de Dropdowns en Central~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Sincronización manual de la instancia activa `ventas-moni-app` con el Core para eliminar el drift crítico detectado tras la implementación de CORE-018. Se reemplazó la lógica de descarte de alertas basada en texto (`title-message-type`) por la clave única `alertId` en `App.jsx`, se agregó el estado `activePingRequest` con autocierre a 30s y el handler del evento `'ping-test-requested'`, y se insertó el modal interactivo de "Prueba de Conexión" idéntico al del Core. En `useAppConfigSync.js`, se reemplazó la auto-respuesta silenciosa al ping por el despacho del evento interactivo con validación de expiración (>60s) y comparación de timestamps `triggerPing > lastPingResponse`. Adicionalmente, se resolvieron 2 bugs activos de la interfaz central (`dev-dashboard`): cierre por clic fuera (click-outside) usando `useRef` + `mousedown` en los dropdowns de `CoreSyncPanel.jsx` y `App.jsx`, y refactorización a estado puro de React en el selector de tipo de alerta de `App.jsx` eliminando referencias frágiles y duplicados de ID de DOM. Builds de integridad aprobados en ambos proyectos.
  - Archivos: [App.jsx (ventas-moni-app)](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/src/App.jsx) [MODIFY], [useAppConfigSync.js (ventas-moni-app)](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/src/hooks/useAppConfigSync.js) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [CoreSyncPanel.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-018: Ping Test Interactivo con Alerta de Prueba Personalizada, Autocierre y Descarte~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Rediseñado el flujo de Ping Test de telemetría para hacerlo interactivo. El Dashboard escribe `triggerPing` y el timeout se aumenta a 30s. En el cliente se muestra un modal de prueba de conexión reutilizando exactamente el diseño de la alerta remota (backdrop blur, Framer Motion, estilos theme-aware) pero con temática de telemetría y botones de confirmación y descarte. Al confirmar, el cliente escribe `lastPingResponse` y el test finaliza con éxito. Si el administrador está ocupado o ignora la solicitud, el modal se cierra automáticamente tras 30 segundos (o puede cerrarse manualmente haciendo clic en "Descartar prueba" o en el backdrop) sin interrumpir el flujo ni arrojar errores. Propagado a plantillas CLI (`template-ventas` y `template-core-seed`).
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [useAppConfigSync.js (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY], [App.jsx (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY], [useAppConfigSync.js (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY], [App.jsx (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/App.jsx) [MODIFY], [useAppConfigSync.js (template-core-seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js) [MODIFY], [App.jsx (template-core-seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-017: Detección por Hash MD5 de Drift de Instancias, Exclusión de Mapas de Arquitectura, Consola Dinámica y Perfil Theme-Aware~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Implementado el control real de drift por hash MD5 en el listado de instancias locales. Se corrigió la terminal de sincronización de cores para responder de forma premium y adaptativa al tema claro/oscuro. Se excluyeron los mapas de arquitectura auto-generados dinámicamente de la validación del drift. Se separó el Canal de Telemetría (Ping Test) en dos botones separados ("Enviar Alerta de Prueba" y "Verificar Conexión") y se previno en la app cliente la reapertura de la alerta mediante el uso de `useRef` comparativos sobre el snapshot de telemetría. Además, se solucionó el destello/parpadeo de la alerta remota al recargar la app cliente resolviendo síncronamente el estado de localStorage en el render, y se adaptaron al modo oscuro/claro el Perfil de Administrador y la Consola de Telemetría en el Dashboard Central, traduciendo sus textos del inglés al español.
  - Archivos: [CoreSyncPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [App.jsx (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY], [App.jsx (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-016: Ping-Pong Real, Alertas Remotas Funcionales y Corrección de Token Vinculado~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Implementado el ciclo **Ping-Pong real via Firestore** sin Cloud Functions. El Dashboard escribe `triggerPing` en `clientes_control/{clientId}`, la app cliente lo detecta via `onSnapshot` y responde con `lastPingResponse`. El Dashboard calcula la latencia real; si no hay respuesta en 5s muestra Timeout. Las **Alertas Remotas** ahora son 100% funcionales: creado `centralFirebaseService.js` como segunda app de Firebase y modificado `useAppConfigSync.js` para escuchar `sistemaAlerta` en tiempo real desde la BD central. El **Token Vinculado** se muestra correctamente resolviendo desde `cfg.telemetryToken` (ahora persistido en Firestore en el aprovisionamiento) o fallback en `tokens`. Reglas de Firestore actualizadas con `affectedKeys().hasOnly(['lastPingResponse'])`. Propagado a templates CLI `template-ventas` y `template-core-seed`.
  - Archivos: [centralFirebaseService.js (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/centralFirebaseService.js) [NEW], [useAppConfigSync.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [firestore.rules](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firestore.rules) [MODIFY]

* **[x] ~~Tarea CORE-015: Rediseño Premium de la Interfaz de Diagnósticos del Dashboard Central~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Rediseñado a fondo el modal de diagnóstico por cliente en el Dashboard Central. Se eliminaron por completo los bordes toscos de color claro/gris sólido, implementando un diseño de tipo glassmorphism premium con degradados de fondo HSL, bordes translúcidos (`border-white/[0.04]`), sombras profundas (`shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]`), micro-animaciones en hover y cabeceras elásticas, alineado al estándar de excelencia visual del proyecto.
  - Archivos: [dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CLI-019: Automatización de Alertas Remotas, Reinicio Mensual y Sincronización CLI de Plantillas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Integrado el soporte de reinicio automático mensual, alerta bloqueante remota por pago (sistemaAlerta) y visor mensual exitoso en la plantilla de CLI `template-ventas` ejecutando el script `sync_templates.js` para asegurar que absolutamente todas las futuras aplicaciones de ventas creadas por el motor CLI hereden esta funcionalidad de forma nativa e integrada.
  - Archivos: [Prototipe-CLI/templates/template-ventas/](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/) [MODIFY]

* **[x] ~~Tarea CORE-014: Corrección de Visibilidad de Nuevas Instancias y Auto-configuración de Telemetría~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Resuelto el problema por el cual las nuevas instancias registradas (como `moni-app`) no aparecían en el CRM de Clientes ni en la cuenta general de Clientes Activos. Se cambió el contador de clientes activos para leer de `clientesSaas` y se reestructuró `clientAggregated` para inicializarse con todos los clientes de `clientesSaas`. Además, se implementó el auto-enlace de telemetría (blindaje) al momento del registro: la Consola Central inyecta automáticamente el token de telemetría autogenerado y el endpoint HTTPS de Cloud Run directamente en el archivo `.env.local` de la instancia usando la API del puente local, previniendo errores de reporte de facturación. Se corrigió manualmente el `.env.local` de la app Moni con su token registrado (`moni-app-token-1781921496178`).
  - Archivos: [App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [ventas-moni-app/.env.local](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/.env.local) [MODIFY]

* **[x] ~~Tarea CORE-013: Sincronizador Core a Clientes y Despliegue en Lote Aislado~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Diagnosticado y corregido el problema arquitectural donde `CoreSyncPanel.jsx` usaba un endpoint de ramas Git que no coincidía con la arquitectura real de directorios físicos. Implementados dos nuevos endpoints en `server.js`: `GET /api/instancias/list` (lista instancias físicas con delta de versión core vs cliente) y `GET /api/instancias/sync-and-deploy-stream` (SSE de sincronización física diferencial por hash MD5 con 6 fases: detección, backup, copia, build, actualización de metadata y deploy opcional). Reescrito `CoreSyncPanel.jsx` con nueva fuente de datos, badges de versión por cliente, toggle de deploy y estados por fase (syncing/building/deploying/success/error).
  - Archivos: [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [CoreSyncPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-012: Inicialización, Aprovisionamiento y Despliegue de Instancia (Moni)~~**

  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Creada y configurada la primera carpeta física de cliente independiente en `D:\PROTOTIPE\Instancias Clientes\ventas-moni-app` utilizando la plantilla limpia. Configurado el entorno Git de la instancia desindexando `node_modules` de forma definitiva y agregando el Git Hook de pre-commit. Conectada la aplicación con el proyecto Firebase `ventas-moni-app` y vaciada toda la base de datos de Firestore para habilitar el asistente de onboarding nativo directamente en la primera carga. Compilado y desplegado de forma local (`localhost:5173`) y a producción en Firebase Hosting (`https://ventas-moni-app.web.app`).
  - Archivos: [Instancias Clientes/ventas-moni-app/](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/) [NEW]

* **[x] ~~Tarea CORE-011: Rediseño Premium de la Interfaz del Catálogo (Laboratorio Visual Fase 3) - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Completado el rediseño premium de la sección del catálogo de clientes para adoptar un estilo Apple Store y Shopify. Implementada la cabecera buscador sticky translúcida con HSL, blur de fondo y sin líneas de borde rígidas; rediseñados los chips de categorías a pastillas flotantes con transiciones de fondo deslizante elástico animado (layoutId); reestructurado el banner promocional para que la imagen abarque la totalidad de forma uniforme con object-cover, inyectando un degradado lateral asimétrico que evita oscurecer el producto, un sello flotante interactivo (sticker) con micro-animación de rotación en hover, un resplandor ambiental dinámico de marca en hover, y destellos de luz de barrido metálico en los badges de oferta; y reestructurado ProductCard con curvaturas de 20px, sombras multicapa finas en hover y microinteracciones de rotación/escala en el botón de agregar.
  - Archivos: [ClientCatalog.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY], [CatalogBanner.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/CatalogBanner.jsx) [MODIFY], [ProductCard.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]

* **[x] ~~Tarea CORE-010: Stock Infinito para Productos Preparados / Ilimitados - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Implementada la funcionalidad de "stock infinito" (productos preparados) que permite omitir el control de inventario de manera estratégica y dinámica. Añadido el toggle en ProductFormModal (Inventario y Stock), modificada la validación Zod en inventorySchemas para aceptar el flag stockInfinito, actualizados los listados (AdminInventory) en desktop y mobile con indicador visual "∞ Ilimitado", y ajustadas las transacciones y decrementos en orderService para omitir reducciones de stock si el producto es ilimitado. Se actualizaron los tableros de métricas en AdminHome y alertas en AdminStockAlerts para no emitir advertencias de stock bajo sobre estos productos. Adicionalmente, se pulió la tienda de cara al cliente (ProductDetailPage, ProductCard, ProductDetailModal) para ocultar la cantidad de stock técnico (9999) reemplazándola por una elegante etiqueta de "Disponible" y limitando el selector de cantidad máxima a 999 en productos de stock ilimitado.
  - Archivos: [inventorySchemas.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/schemas/inventorySchemas.js) [MODIFY], [ProductFormModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY], [AdminInventory.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY], [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY], [AdminStockAlerts.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminStockAlerts.jsx) [MODIFY], [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY], [ProductDetailPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY], [ProductCard.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY], [ProductDetailModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]

* **[x] ~~Tarea CORE-009: Rediseño Premium de la Gestión de Pedidos (Laboratorio Visual Fase 2) - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Completado el rediseño premium de la sección de administración de pedidos (AdminOrders.jsx) adaptando las tarjetas resumen al estilo "Comanda Asimétrica" responsivo (ordenando cabeceras, estado, tipo de entrega, empaquetado de items en contenedor interno y alineaciones en móvil y desktop sin eliminar elementos), optimizando el grid de métricas con el estilo wallet animado elástico de la marca (caja y créditos) e implementando un carrusel de filtros de estado planos con contadores dinámicos que se expanden de borde a borde en dispositivos móviles sin recortes de sombras ni overflows.
  - Archivos: [AdminOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]

* **[x] ~~Tarea CORE-008: Correcciones del Panel de Inicio del Administrador y Catálogo de Estilos UI/UX - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Corregido el recorte de tarjetas wallet y sombras en hover en computadoras (añadido overflow-visible responsivo), adaptada la paleta de colores de la cabecera y tarjeta de caja principal al tema HSL activo para evitar choques visuales de marca, resuelto el bug de scroll de fondo bloqueado al cerrar el modal de selección de temas e implementada la expansión edge-to-edge del carrusel en celulares. Creado además el catálogo de estilos visuales unificados del ecosistema.
  - Archivos: [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY], [AppearanceSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx) [MODIFY], [catalogo_estilos_ui.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Estilos/catalogo_estilos_ui.md) [NEW], [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-007: Rediseño Premium de Inicio del Administrador (Laboratorio Visual Fase 1) - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Implementada una interfaz financiera premium de tipo "wallet" elástica y responsiva para el inicio administrativo. Se diseñó una cabecera curvada superior con degradado elástico, un carrusel de tarjetas "wallet" responsivo con balances y desgloses de caja que soporta arrastre por snap en móvil, una lista interactiva de transacciones con iconos Lucide y fondos en colores pastel dinámicos, y accesos directos minimalistas. Todo esto sin suprimir ninguna función lógica ni métricas previas.
  - Archivos: [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]

* **[x] ~~Tarea CORE-006: Auditoría, Saneamiento y Estabilización del Sistema de Notificaciones - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Refactorizado useNotificationCenter con un listener dedicado en tiempo real para conteo exacto de no leídos de Firestore (solucionando el bug de paginación), optimizada la bandeja de notificaciones en NotificationHistoryTray inyectando iconos de Lucide dinámicos y clases de color del sistema de diseño (evitando el purgado), robustecido el useEffect de Toasts en AdminLayout, ClientLayout y PortalLayout para encolar múltiples alertas flotantes simultáneas, y saneado imports sin uso en PortalMensajero.
  - Archivos: [notificationCenterService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/notificationCenterService.js) [MODIFY], [useNotificationCenter.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useNotificationCenter.js) [MODIFY], [NotificationHistoryTray.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/common/NotificationHistoryTray.jsx) [MODIFY], [AdminLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY], [ClientLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY], [PortalLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/PortalLayout.jsx) [MODIFY], [PortalMensajero.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalMensajero.jsx) [MODIFY]

* **[x] ~~Tarea CORE-005: Auditoría y Optimización del Módulo 5 (Créditos y Saldos) - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Estandarizados los modales de abonos con ModalTemplate en AdminCredits y ClientCredits, optimizadas las consultas del PDF de cartera limitándolo a créditos activos, removido useOrders en la vista de créditos, y asegurada consistencia transaccional en abonos concurrentes.
  - Archivos: [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY], [ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY], [pdfService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) [MODIFY], [creditService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) [MODIFY]

* **[x] ~~Tarea CORE-001: Elaboración de Checklist de Auditoría del Core (App Ventas)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-18
  - Fecha de finalización: 2026-06-18
  - Descripción: Elaborado un checklist detallado para auditar y corregir inconsistencias y cuellos de botella de los 5 módulos core (Ventas, Bodega, Autenticación, Reparto y Créditos), saneando referencias obsoletas a Gastrobar.
  - Archivos: [checklist_auditoria_core.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/checklist_auditoria_core.md) [NEW], [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CLI-018: Registro Explícito de Rol 'client' en Colección de Usuarios (Ecosistema)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Modificado `LoginPage.jsx` tanto en la plantilla base `App Ventas` como en las plantillas del CLI para registrar explícitamente el campo `role: 'client'` en los nuevos perfiles de usuario cliente.
  - Archivos: [LoginPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY], [LoginPage.jsx](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]

* **[x] ~~Tarea CLI-017: Fix de Sesión Huérfana de Administrador en App Ventas (Ecosistema)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Modificado `useAuthInit.js` de la plantilla base de Ventas para validar y recrear el documento del admin en Firestore en caso de que su sesión de Auth local esté activa pero sus datos de Firestore hayan sido borrados.
  - Archivos: [useAuthInit.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js) [MODIFY]

* **[x] ~~Tarea CLI-016: Remoción Completa de Función de Gestión de Base de Datos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Removida en su totalidad la funcionalidad de gestión, conteo y purga de colecciones de bases de datos de clientes, eliminando endpoints en el servidor y todos los estados, manejadores, botones y maquetación JSX de modal en el panel de control.
  - Archivos: [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-015: Corrección de Estructura y Responsividad Móvil del CRM de Clientes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Corregida la estructura y responsividad de los botones en la versión móvil del CRM de Clientes. Se rediseñó el contenedor global a una cuadrícula de 2 columnas en mobile (`grid-cols-2`) y se aplicaron flexibidad de crecimiento y anchos mínimos (`min-w`) en los botones de directorio de clientes para evitar truncamientos y desbordamientos. Adicionalmente, se corrigió el bug en la función de resolución de rutas de proyectos `findProjectDir` en `server.js` que causaba errores 500 al no encontrar proyectos en directorios de plantillas core si el directorio de instancias no existía en disco.
  - Archivos: [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-014: Arquitectura General y Agnóstica de Skills de IA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Reescritas las 7 skills del ecosistema para ser agnósticas al proyecto usando la variable dinámica `[PROYECTO_ACTIVO]`, triggers conscientes de proyectos, y rutas dinámicas estructuradas. Integrados además los cambios específicos de cada skill (categorías, colisiones, tabla canónica de simulabilidad y resolución de conflictos git).
  - Archivos: Carpetas en [Skills](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/) [MODIFY]

* **[x] ~~Tarea CLI-013: Depuración de Rutas Obsoletas (D:\Aplicaciones)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Remoción del fallback obsoleto `D:\Aplicaciones` en `server.js` y actualización de 5 referencias de rutas obsoletas a `D:\PROTOTIPE` en los manuales, mapas de arquitectura y especificaciones del ecosistema de documentación.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [mapa_arquitectura.md](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/mapa_arquitectura.md) [MODIFY], [SKILL.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_extractor/SKILL.md) [MODIFY], [manual_brand_config.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_brand_config.md) [MODIFY], [resumen_ejecutivo_proyecto.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/resumen_ejecutivo_proyecto.md) [MODIFY], [sincronizacion_templates_universal.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/sincronizacion_templates_universal.md) [MODIFY]

* **[x] ~~Tarea CLI-012: Saneamiento y Estandarización de Nomenclatura en Biblioteca~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Remoción de componentes duplicados (`ConnectivityToast` y `DatePicker`), eliminación del roadmap obsoleto (`tareas_pendientes_prioritarias.md`), y renombrado de 6 carpetas/archivos en la biblioteca al estándar de español claro.
  - Archivos: `06_Biblioteca_Componentes` [MODIFY], `02_Tareas_Roadmap/tareas_pendientes_prioritarias.md` [DELETE], [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CLI-011: Actualización a System Prompt v2.0 (GEMINI.md)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Implementado el nuevo SYSTEM PROMPT v2.0 en GEMINI.md con la matriz de severidad, jerarquía de prioridades, control de secreto de Firebase, y adaptado `sync_rules.js` para mantener la compatibilidad con las secciones numeradas de la v2.0. Propagado a los 5 proyectos.
  - Archivos: [GEMINI.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY], [sync_rules.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY]

* **[x] ~~Tarea CLI-010: Sincronización del Ecosistema a Plan Blaze y Telemetría Centralizada~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Modificado `generator.js` en `Prototipe-CLI` para no inyectar variables de entorno centralizadas secundarias en `.env.local`, inyectando por defecto el endpoint unificado `VITE_DEVELOPER_TELEMETRY_ENDPOINT` que apunta a la Cloud Function HTTPS en producción.
  - Archivos: [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CLI-009: Habilitación de Scaffold Limpio (Core Seed) en Gestión de Cores~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Implementado el soporte para realizar scaffolding de nuevos Cores utilizando una plantilla limpia del sistema (`template-core-seed`). Modificado el endpoint `/api/cores/:clave/scaffold` en `server.js` (CLI).
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-008: Saneamiento de Detección Git en Ecosistema (CLI & Dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Refactorizada la detección de Git en el bridge server (`server.js`) para utilizar `git rev-parse --git-dir` en lugar del chequeo físico estático de la carpeta `.git`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-007: Robustez en Respaldo de Subproyectos con .git-backup-temp~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Refactorizado `subproject_backup.ps1` para detectar de forma autónoma si un subproyecto está en estado inactivo con la carpeta `.git-backup-temp` y renombrarlo temporalmente a `.git` para realizar la indexación de cambios.
  - Archivos: [subproject_backup.ps1](file:///D:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

* **[x] ~~Tarea CLI-006: Corrección de Bugs de Referencia, Git y Bloqueo de SSE en Automatización~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Corregido en `generator.js` el ReferenceError de `initials` y `storageRulesContent`. Refactorizado `/api/create-project` en `server.js` regresando a una respuesta HTTP JSON estándar y limpia sin SSE.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CLI-005: Saneamiento de Carpetas Git Temporales y Robustez de Vite en Backups~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Corregido el bug de bloqueo y permanencia de carpetas temporales `.git-backup-temp`. Se mejoró la detención de procesos de desarrollo en `git_backup.ps1` y `menu_backup.ps1`.
  - Archivos: [git_backup.ps1](file:///D:/PROTOTIPE/git_backup.ps1) [MODIFY], [menu_backup.ps1](file:///D:/PROTOTIPE/menu_backup.ps1) [MODIFY]

* **[x] ~~Tarea CLI-004: Tres Mejoras de Robustez y Carga de Logo en Onboarding Wizard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Agregado el endpoint `/api/firebase/validate` y el optimizador y compresor de logo mediante Jimp en el endpoint `/api/upload-logo`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-003: Guardián de Calidad y PWA en Deploy con Auto-Resolución y Drift Detector CRM~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Modificado el endpoint de deploy en `server.js` para ejecutar de forma síncrona el auditor físico antes de realizar el deploy. Implementados los endpoints `/api/project/drift` y `/api/project/sync-file`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-002: Optimización de Chunks de Bundle y Refinamiento de Auditor PWA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Refinamiento de la API `/api/project/audit` en `server.js` para leer el manifest de Vite y omitir las penalizaciones por tamaño de chunks cargados dinámicamente.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-001: Integración de Herramientas de Automatización en CLI Bridge Server~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Redireccionados logs en `worker_create_project.js` por IPC y agregadas APIs `/api/library/extract`, `/api/project/deploy` y getters/setters de variables de entorno en `/api/project/env`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [worker_create_project.js](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]

* **[x] ~~Tarea CLI-015: Corrección de Estructura y Responsividad Móvil del CRM de Clientes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Corregida la estructura y responsividad de los botones en la versión móvil del CRM de Clientes. Se rediseñó el contenedor global a una cuadrícula de 2 columnas en mobile (`grid-cols-2`) y se aplicaron flexibidad de crecimiento y anchos mínimos (`min-w`) en los botones de directorio de clientes para evitar truncamientos y desbordamientos. Adicionalmente, se corrigió el bug en la función de resolución de rutas de proyectos `findProjectDir` en `server.js` que causaba errores 500 al no encontrar proyectos en directorios de plantillas core si el directorio de instancias no existía en disco.
  - Archivos: [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-014: Arquitectura General y Agnóstica de Skills de IA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Reescritas las 7 skills del ecosistema para ser agnósticas al proyecto usando la variable dinámica `[PROYECTO_ACTIVO]`, triggers conscientes de proyectos, y rutas dinámicas estructuradas. Integrados además los cambios específicos de cada skill (categorías, colisiones, tabla canónica de simulabilidad y resolución de conflictos git).
  - Archivos: Carpetas en [Skills](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/) [MODIFY]

* **[x] ~~Tarea CLI-013: Depuración de Rutas Obsoletas (D:\Aplicaciones)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Remoción del fallback obsoleto `D:\Aplicaciones` en `server.js` y actualización de 5 referencias de rutas obsoletas a `D:\PROTOTIPE` en los manuales, mapas de arquitectura y especificaciones del ecosistema de documentación.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [mapa_arquitectura.md](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/mapa_arquitectura.md) [MODIFY], [SKILL.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_extractor/SKILL.md) [MODIFY], [manual_brand_config.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_brand_config.md) [MODIFY], [resumen_ejecutivo_proyecto.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/resumen_ejecutivo_proyecto.md) [MODIFY], [sincronizacion_templates_universal.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/sincronizacion_templates_universal.md) [MODIFY]

* **[x] ~~Tarea CLI-012: Saneamiento y Estandarización de Nomenclatura en Biblioteca~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Remoción de componentes duplicados (`ConnectivityToast` y `DatePicker`), eliminación del roadmap obsoleto (`tareas_pendientes_prioritarias.md`), y renombrado de 6 carpetas/archivos en la biblioteca al estándar de español claro.
  - Archivos: `06_Biblioteca_Componentes` [MODIFY], `02_Tareas_Roadmap/tareas_pendientes_prioritarias.md` [DELETE], [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CLI-011: Actualización a System Prompt v2.0 (GEMINI.md)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Implementado el nuevo SYSTEM PROMPT v2.0 en GEMINI.md con la matriz de severidad, jerarquía de prioridades, control de secreto de Firebase, y adaptado `sync_rules.js` para mantener la compatibilidad con las secciones numeradas de la v2.0. Propagado a los 5 proyectos.
  - Archivos: [GEMINI.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY], [sync_rules.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY]

* **[x] ~~Tarea CLI-010: Sincronización del Ecosistema a Plan Blaze y Telemetría Centralizada~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Modificado `generator.js` en `Prototipe-CLI` para no inyectar variables de entorno centralizadas secundarias en `.env.local`, inyectando por defecto el endpoint unificado `VITE_DEVELOPER_TELEMETRY_ENDPOINT` que apunta a la Cloud Function HTTPS en producción.
  - Archivos: [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CLI-009: Habilitación de Scaffold Limpio (Core Seed) en Gestión de Cores~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Implementado el soporte para realizar scaffolding de nuevos Cores utilizando una plantilla limpia del sistema (`template-core-seed`). Modificado el endpoint `/api/cores/:clave/scaffold` en `server.js` (CLI).
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-008: Saneamiento de Detección Git en Ecosistema (CLI & Dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Refactorizada la detección de Git en el bridge server (`server.js`) para utilizar `git rev-parse --git-dir` en lugar del chequeo físico estático de la carpeta `.git`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-007: Robustez en Respaldo de Subproyectos con .git-backup-temp~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Refactorizado `subproject_backup.ps1` para detectar de forma autónoma si un subproyecto está en estado inactivo con la carpeta `.git-backup-temp` y renombrarlo temporalmente a `.git` para realizar la indexación de cambios.
  - Archivos: [subproject_backup.ps1](file:///D:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

* **[x] ~~Tarea CLI-006: Corrección de Bugs de Referencia, Git y Bloqueo de SSE en Automatización~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Corregido en `generator.js` el ReferenceError de `initials` y `storageRulesContent`. Refactorizado `/api/create-project` en `server.js` regresando a una respuesta HTTP JSON estándar y limpia sin SSE.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CLI-005: Saneamiento de Carpetas Git Temporales y Robustez de Vite en Backups~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Corregido el bug de bloqueo y permanencia de carpetas temporales `.git-backup-temp`. Se mejoró la detención de procesos de desarrollo en `git_backup.ps1` y `menu_backup.ps1`.
  - Archivos: [git_backup.ps1](file:///D:/PROTOTIPE/git_backup.ps1) [MODIFY], [menu_backup.ps1](file:///D:/PROTOTIPE/menu_backup.ps1) [MODIFY]

* **[x] ~~Tarea CLI-004: Tres Mejoras de Robustez y Carga de Logo en Onboarding Wizard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Agregado el endpoint `/api/firebase/validate` y el optimizador y compresor de logo mediante Jimp en el endpoint `/api/upload-logo`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-003: Guardián de Calidad y PWA en Deploy con Auto-Resolución y Drift Detector CRM~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Modificado el endpoint de deploy en `server.js` para ejecutar de forma síncrona el auditor físico antes de realizar el deploy. Implementados los endpoints `/api/project/drift` y `/api/project/sync-file`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-002: Optimización de Chunks de Bundle y Refinamiento de Auditor PWA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Refinamiento de la API `/api/project/audit` en `server.js` para leer el manifest de Vite y omitir las penalizaciones por tamaño de chunks cargados dinámicamente.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-001: Integración de Herramientas de Automatización en CLI Bridge Server~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Redireccionados logs en `worker_create_project.js` por IPC y agregadas APIs `/api/library/extract`, `/api/project/deploy` y getters/setters de variables de entorno en `/api/project/env`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [worker_create_project.js](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]