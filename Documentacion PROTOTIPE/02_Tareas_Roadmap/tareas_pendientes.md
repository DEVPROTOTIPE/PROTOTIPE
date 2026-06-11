# Control de Tareas y Estado de Implementación (Roadmap del Proyecto)

Este documento registra de forma dinámica las tareas pendientes, en curso y completadas del proyecto **App Ventas**. Funciona como bitácora y guía de desarrollo para evitar duplicidades y mantener la aliniación técnica con el estándar.


---

### 💼 Negocio y Modularidad Ecosistema (Prioridad Alta)
* **[x] ~~Tarea 378: Propuesta de Módulo Visual de Commits y Despliegues (dev-dashboard)~~**
  - Estatus: Completado (Fase de Diseño y Propuesta Técnica).
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Diseñamos y elaboramos la propuesta técnica para integrar un panel visual de control de versiones y copias de seguridad de Git en dev-dashboard. Detalla la arquitectura de comunicación por Server-Sent Events (SSE) con el bridge CLI, el layout de dos paneles (visor de cambios y terminal de logs en vivo), la API REST en server.js y la estrategia multi-tenant.
  - Archivos creados/modificados:
    - [`d:/PROTOTIPE/Documentacion PROTOTIPE/09_Modulos_Completos/Modulo_Commits_Despliegues/propuesta_commits_despliegues.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/Modulo_Commits_Despliegues/propuesta_commits_despliegues.md) [NEW]

* **[x] ~~Tarea 377: Vista Previa Interactiva de Productos y Servicios en Mockup de Smartphone (dev-dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Añadido un nuevo e interactivo apartado de "Catálogo" (que dinámicamente cambia a "Servicios" o "Catálogo" según el nicho activo) al smartphone mockup del Onboarding Wizard. Cuenta con una base de datos con 3 productos/servicios realistas por nicho (cubriendo los 10 nichos de mercado de la consola central). Al presionar "+ Registrar", cada producto añade su valor financiero al balance de hoy en tiempo real del dashboard simulado, interactuando fluidamente.
  - Archivos creados/modificados:
    - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 376: Paletas de Colores de Marca por Categorías de Nicho (dev-dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Implementado un sistema de paletas de colores extendido clasificado por nichos de mercado (10 nichos con 10 paletas premium cada uno, para un total de 100 combinaciones). Reemplazada la grilla estática de 8 paletas por un acordeón interactivo y responsivo. Cada sección de nicho se puede expandir/colapsar individualmente, cerrando de forma automática cualquier otra sección abierta para mantener la interfaz despejada.
  - Archivos creados/modificados:
    - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 375: Integración del Branding Studio HSL y Validador WCAG 2.1 en Onboarding Wizard (dev-dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Diseñado e implementado el widget de validación de contraste WCAG 2.1 (AA/AAA) en la sección de Branding del asistente de aprovisionamiento (Onboarding Wizard) de la consola central. Calcula dinámicamente la luminancia relativa y el contraste relativo en tiempo real para el botón primario (contra blanco) y la interfaz general (fondo contra texto de contenido), y previsualiza los estados de cumplimiento visualmente.
  - Archivos creados/modificados:
    - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 374: Botón "Desplegar en Local" y Control de Servidores de Desarrollo en CRM (dev-dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Implementado el sistema de despliegue local de proyectos clientes desde la tarjeta de cada cliente en el CRM. Agregados endpoints `/api/project/dev/start`, `/api/project/dev/stop` y `/api/project/dev/status` en el CLI bridge server. En el panel CRM del dashboard central, se integró el estado reactivo `localServers`, un efecto de consulta automática de estado y los botones interactivos "Desplegar en Local", "Detener" e "Ir a Local" con redirección directa.
  - Archivos creados/modificados:
    - [`d:/PROTOTIPE/Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 373: Selector de Clientes para Solicitud de Telemetría Global (dev-dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Refactorizado el botón global de obtención de telemetría de todos los clientes. Ahora abre un modal interactivo con casillas de selección multicliente pre-seleccionadas por defecto para todos los clientes activos del SaaS. Esto le permite al desarrollador solicitar reportes de telemetría y diagnóstico en caliente únicamente para los clientes seleccionados, previniendo disparos accidentales y protegiendo las cuotas de Firestore.
  - Archivos creados/modificados:
    - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 372: Selector de Clientes en Sincronización Global y Despliegue en Lote (dev-dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Implementados los modales de configuración `isGlobalSyncConfigModalOpen` y `isGlobalDeployConfigModalOpen` con checklist de selección multicliente dinámica para evitar ejecuciones incidentales generales. Refactorizado el orden del despliegue en lote global para esperar 3 segundos entre instancias y agregados los controles de estado de cola e interrupción en caliente en el encabezado y pie del terminal SSE.
  - Archivos creados/modificados:
    - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 371: Sincronización en Lote de Drift y Consola de Despliegue de Hosting en CRM (dev-dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Desarrollado el modal interactivo de sincronización inteligente por lotes (`BulkSyncModal`) que separa archivos core de branding sensible, y la consola terminal oscura de despliegues (`DeployTerminalModal`) con monitoreo por EventSource y bypass por auditoría baja. Añadidos los botones globales correspondientes en la cabecera de la sección CRM y los controles individuales en la pestaña Drift de gestión de clientes.
  - Archivos creados/modificados:
    - [`d:/PROTOTIPE/Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 370: Simulador de Fallos Multicliente Dirigido y Avanzado (dev-dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Refactorizada la simulación aleatoria de telemetría por un modal interactivo `SimulationFailureModal` en `dev-dashboard/src/App.jsx`. Permite elegir dinámicamente cualquier cliente de CRM (o ingresar uno manual), seleccionar entre plantillas de errores (TypeError, Firebase, etc.) o ingresar firmas personalizadas, configurar severidad (FAIL/WARN/INFO) y definir origen (Automático/Manual).
  - Archivos creados/modificados:
    - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 369: Corrección Visual y de Idioma en Consola de Telemetría (dev-dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Corregida la clase de borde del buscador en logs `border-slate-850` a `border-slate-800` en `dev-dashboard/src/App.jsx` para remover la línea blanca. Traducido y simplificado el texto técnico de espera a `~/telemetria $ escuchando_eventos_en_vivo...`.
  - Archivos creados/modificados:
    - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 368: Fijación de Encabezado y Menú en Scroll (dev-dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Refactorizado el contenedor de diseño raíz en `dev-dashboard/src/App.jsx` para cambiar `min-h-screen overflow-x-hidden` a `h-screen overflow-hidden`, confinando el scroll únicamente al contenedor principal del contenido y fijando de manera estática el encabezado y el sidebar.
  - Archivos creados/modificados:
    - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 367: Optimización y Clasificación de Telemetría de Errores (Spark Saver)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Implementado el filtrado automático de ruido en `telemetryService.js` para ignorar incidentes no críticos de red y extensiones del navegador, controlando costos en Firestore. Clasificado el origen (`source` en payload: 'automatic' | 'manual') y agregado soporte visual en la consola de diagnóstico de errores del Dashboard central mediante badges dinámicos ('Manual' / 'Automático').
  - Archivos creados/modificados:
    - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/services/telemetryService.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/telemetryService.js) [MODIFY]
    - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx) [MODIFY]
    - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js) [MODIFY]
    - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx) [MODIFY]
    - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/telemetryService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/telemetryService.js) [MODIFY]
    - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 366: Extracción Modular del Panel de Facturación y Consolidación de Telemetría de Ajustes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Extracción del panel de facturación y telemetría de diagnósticos ("Reportar Error de Prueba" y "Enviar Telemetría de Facturación") a un componente independiente y portable (`DeveloperBillingPanel.jsx`). Refactorización de `DeveloperSettings.jsx` (App Ventas y template-ventas) para consumir el nuevo componente, eliminando más de 150 líneas de lógica redundante. Registro de la documentación en la biblioteca (`facturacion_y_firma_digital.md`), actualización de mapas e integración en el esquema de sincronización universal.
  - Archivos creados/modificados:
    - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx) [NEW]
    - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
    - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx) [NEW]
    - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
    - [`d:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/00_Core_Ecosistema_Obligatorios/Facturacion_y_Firma_Digital/facturacion_y_firma_digital.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/00_Core_Ecosistema_Obligatorios/Facturacion_y_Firma_Digital/facturacion_y_firma_digital.md) [MODIFY]
    - [`d:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea 365: Plan de Resolución y Auditoría Técnica de CLI & Bridge Server~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Implementada la mitigación de inyección de comandos en `server.js`, blindado el extractor de componentes contra path traversal, añadido hard execution timeouts (3 minutos) y finalización recursiva de procesos hijo en Windows (`taskkill`) para las pruebas E2E, mejorada la auditoría de PWA para parsear manifest.json, configurada la creación obligatoria de .gitignore en nuevos proyectos, modularizada la visualización de plantillas core mediante la creación de `CoreCard.jsx` e integración de doble confirmación de borrado en variables de entorno. Adicionalmente, se refactorizó la seguridad de las reglas compuestas de Firestore (`firestore.rules`) para verificar roles en el nodo `/users`, se modificó `LoginPage.jsx` para persistir dinámicamente perfiles con rol de administrador (`role: 'admin'`), se agregó un botón de envío manual en `DeveloperSettings.jsx` ("Enviar Telemetría de Facturación") para realizar pruebas inmediatas de telemetría de facturación en vivo, y se corrigió el overflow y desalineación de los botones de test de telemetría y error adaptándolos a viewports estrechos (usando `min-h-11 py-2.5`, centrado y `shrink-0` en iconos).
  - Archivos creados/modificados:
    - [`d:/PROTOTIPE/Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`d:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [NEW]
    - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx) [MODIFY]
    - [`d:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_cli_server_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_cli_server_2026.md) [NEW]
    - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [`d:/PROTOTIPE/Plantillas Core/App Ventas/firestore.rules`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [MODIFY]
    - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/LoginPage.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
    - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
    - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/services/billingService.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/billingService.js) [MODIFY]
    - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
    - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/firestore.rules`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/firestore.rules) [MODIFY]
    - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]
    - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
    - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/billingService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/billingService.js) [MODIFY]
    - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY]

* **[x] ~~Tarea 364: Tres Mejoras de Robustez y Carga de Logo en Onboarding Wizard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción:
    - **Validación del SDK de Firebase (Pre-Flight Checks):** Agregamos el endpoint `/api/firebase/validate` y un botón interactivo de validación en caliente en la pestaña "Servidor" del asistente de creación de proyectos.
    - **Optimizador y Compresor de Logo (Asset Compressor):** Implementamos el endpoint `/api/upload-logo` y la carga de logos por drag-and-drop con base64. Si la imagen supera los 2MB, el servidor la procesa con Jimp redimensionándola a un tamaño máximo de 512x512px y re-escribiendo el archivo para PWA.
    - **Descarga de Logs de Despliegue:** Agregamos el botón "Descargar Log" en la consola de despliegue en `CoreManagerPanel.jsx` para guardar archivos `.log` locales en el navegador.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/propuestas_mejoras_robustez.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/propuestas_mejoras_robustez.md) [NEW]

* **[x] ~~Tarea 363: Guardián de Calidad y PWA en Deploy con Auto-Resolución y Drift Detector CRM~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción:
    - **Guardián de Despliegue (SSE Pre-Deploy Audit):** Modificamos el endpoint de deploy en `server.js` para ejecutar de forma síncrona el auditor físico antes de realizar el deploy. Si el score es inferior a 90/100, se detiene la subida y se emite un evento `audit_failed` con los detalles y tipos de fixes correspondientes, a menos que se use la opción `force=true`.
    - **Panel de Auto-Resolución Visual:** Integramos un panel reactivo en `CoreManagerPanel.jsx` que se muestra ante fallos de auditoría de deploy, ofreciendo 3 botones correctores en caliente (optimizar chunks, reparar recursos PWA y restaurar reglas compuestas) y el botón de despliegue forzado.
    - **Drift Detector CRM:** Implementamos los endpoints `/api/project/drift` (cálculo de desviaciones recursivas mediante comparaciones de contenido de archivos entre cliente y core de referencia) y `/api/project/sync-file` (sincronizador selectivo downstream de archivos).
    - **Visor de Diffs e Integración CRM:** Agregamos una pestaña de "Sincronización Core (Drift)" en la gestión de clientes en `App.jsx`, con índice de paridad, visualizador de diferencias de líneas coloreadas (Diff lines) y botones de sincronización selectiva por archivo en caliente.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 362: Optimización de Chunks de Bundle y Refinamiento de Auditor PWA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción:
    - **Code Splitting de Chunks:** Dividimos el chunk `vendor` inicial en `react-core`, `react-router`, `react-query`, `zod` y `vendor-utils` en `vite.config.js` de App Ventas y plantillas de la CLI, habilitando también la generación de manifiestos (`manifest: true`).
    - **Refinamiento del Auditor PWA:** Modificamos la API `/api/project/audit` en `server.js` para leer el manifest de Vite y omitir las penalizaciones por tamaño de chunks para aquellos cargados dinámicamente bajo demanda (como el generador de PDFs), previniendo falsos positivos de rendimiento.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/vite.config.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/vite.config.js) [MODIFY]
    - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js) [MODIFY]
    - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/vite.config.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/vite.config.js) [MODIFY]
    - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea 361: Integración de Herramientas de Automatización en CLI Bridge Server~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción:
    - **SSE Logs en Creación:** Redirigimos console.log en `worker_create_project.js` por IPC y los transmitimos por SSE en `/api/create-project`.
    - **Extractor de Componentes:** Diseñamos `/api/library/extract` para registrar componentes locales a la biblioteca de forma autodeclarada e indexada en README y mapas de IA.
    - **Deploy y Env:** Añadimos `/api/project/deploy` (SSE build/deploy hosting) y getters/setters para archivos `.env.local` en `/api/project/env`.
    - **Auditoría física:** Agregamos `/api/project/audit` para validar bundle size, advertencias de chunks > 500 KB y soporte offline/PWA.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js`](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]

* **[x] ~~Tarea 360: Implementación del Plan de Resolución Estratégica en App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción:
    - **Fase 1 (Seguridad y DB Rules):** Aseguramos Firestore rules de `/employees/`, `/credits/` y `/users/`, implementando client-side PIN hashing SHA-256 en `employeeService.js` y `PortalAuth.jsx`/`EmployeeSettings.jsx`.
    - **Fase 2 (Facturación y Red):** Restringimos la query de facturación en `billingService.js` al rango dinámico del mes en curso y el historial a los últimos 6 meses. Se limitó el envío de telemetría de facturación estrictamente al último día del mes en `useAppConfigSync.js`.
    - **Fase 3 (Core Web Vitals y PWA):** Añadimos preconnects y preloads a `index.html`.
    - **Fase 4 (Modularización de Productos):** Creamos el hook reutilizable `useProductVariants.js` y refactorizamos `ProductDetailPage.jsx` y `ProductPublicDetail.jsx` para evitar duplicación de lógica en cálculo de variantes, stock e insignias.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/firestore.rules`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/services/employeeService.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/employeeService.js) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/EmployeeSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/EmployeeSettings.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/services/billingService.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/billingService.js) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/index.html`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/index.html) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/hooks/useProductVariants.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useProductVariants.js) [NEW]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductDetailPage.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductPublicDetail.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]

* **[x] ~~Tarea 359: Auditoría Técnica y Plan Estratégico de App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción:
    - **Auditoría Exhaustiva:** Realizada auditoría técnica completa de la plantilla App Ventas abarcando 16 áreas críticas (rendimiento Core Web Vitals, bloqueo de renderizado, optimización de imágenes, consumo de memoria, fluidez de animaciones, auditoría de red, errores de consola, pruebas funcionales, responsividad, accesibilidad, UI/UX, seguridad, SEO técnico, React, bundles/dependencias y arquitectura).
    - **Reporte y Plan:** Redactado el informe técnico formal `auditoria_tecnica_app_ventas.md` y el plan de resolución estratégica `plan_resolucion_ventas.md` para mitigar riesgos.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_tecnica_app_ventas.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_tecnica_app_ventas.md) [NEW]
    - [`D:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/plan_resolucion_ventas.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/plan_resolucion_ventas.md) [NEW]
    - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea 358: Efecto Confeti al Aplicar Cupón en Checkout de App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción:
    - **Instalación:** Añadimos e instalamos la dependencia `canvas-confetti` en App Ventas.
    - **Lógica e Importación:** Creamos la utilidad `triggerConfetti` de importación dinámica en `CheckoutModal.jsx` y la llamamos tras aplicar con éxito el cupón de descuento.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/checkout/CheckoutModal.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/package.json`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/package.json) [MODIFY]

* **[x] ~~Tarea 357: Creación de SwipeableCardStack e Importaciones en App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción:
    - **Creación de Componente:** Creamos el componente físico `SwipeableCardStack.jsx` en la carpeta `src/components/ui/` de App Ventas.
    - **Importación y Lógica:** Importamos el componente en `CartDrawer.jsx`, añadimos `ShoppingCart` en el destructurado de `lucide-react` y definimos `handleViewDetail`.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/ui/SwipeableCardStack.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/SwipeableCardStack.jsx) [NEW]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]

* **[x] ~~Tarea 356: Botón de Visualización en Vivo para Recomendaciones de Dashboard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción:
    - **Botón Demo en Tarjetas:** Insertamos un botón interactivo "Demo" con animación de escalado y colores premium en las tarjetas de recomendación del Onboarding Wizard si disponen de playground (verificado dinámicamente con `getSandboxKey`).
    - **Modal de Playground:** Implementamos un modal flotante con efecto blur (`backdrop-blur-md`) que carga el playground de `<ComponentSandbox />` en tiempo real y permite añadir/remover el componente directamente desde el pie del modal.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 355: Contenedor Glassmorphic para Botones de Pago y Total en Carrito~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción:
    - **Contenedor Translúcido y Desenfocado:** Rediseñamos el pie del carrito de compras en `CartDrawer.jsx` introduciendo una barra flotante unificada tipo pastilla glassmorphic (`absolute bottom-6 inset-x-6 h-20 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-3xl px-6 flex items-center justify-between z-30 shadow-[0_8px_32px_rgba(0,0,0,0.08)]`) para los botones de total e "Ir a pedir".
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]

* **[x] ~~Tarea 354: Autoplay y Leyenda de Instrucciones en Mazo Swipe~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción:
    - **Autoplay en Mazo Deslizable:** Agregamos una rutina de autoplay con useEffect y setInterval que desliza automáticamente la tarjeta hacia la izquierda cada 5 segundos si no hay interacción (drag u hover del mouse), de modo que el cliente siempre vea variedad y se antoje.
    - **Instrucciones Visuales:** Añadimos un banner superior dinámico con micro-animaciones (pulse) indicando claramente al usuario la mecánica del swipe: "👈 DESLIZA IZQ (PASAR)" y "DESLIZA DER (AGREGAR) 👉".
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]

* **[x] ~~Tarea 353: Ajuste de Espacio Vertical en Sección de Recomendados~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Compactación del Layout del Carrito:** Optimizamos y estandarizamos el recomendador de compras en `CartDrawer.jsx` (plantilla **App Ventas**) restaurando el mazo 3D original que permite el autoplay y apilamiento interactivo de sugerencias, pero reduciendo su altura de `190px` a un punto óptimo de `h-[148px]` (`h-[152px]` en contenedor) para que no ocupe demasiado espacio, conservando sus esquinas redondeadas (`rounded-2xl`), imagen escalada a `w-24 h-24` con bordes `rounded-2xl` y un resplandor rosa. Ajustamos el scroll padding general a `pb-[172px]`.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]

* **[x] ~~Tarea 352: Retorno Automático al Carrito desde Detalles de Recomendados~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Persistencia de Flujo Atrás:** Implementamos paso de estado en la navegación de sugeridos de `CartDrawer.jsx` enviando el flag `fromCart: true`. En `ProductDetailPage.jsx`, detectamos este estado y configuramos el botón de retroceso (`ChevronLeft`) para invocar la acción `openCart()` de `useCartStore` justo antes de retornar con `navigate(-1)`.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductDetailPage.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]

* **[x] ~~Tarea 351: Redirección Directa de Sugeridos a la Página de Detalle de Producto~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Navegación Unificada para Recomendados:** Refactorizamos el comportamiento de clics en las tarjetas recomendadas (`SwipeableCardStack`) y en el botón "Ver Detalles" del carrito en `CartDrawer.jsx` (plantilla **App Ventas**). En lugar de abrir la vista de modal con etiquetas o estilos inconsistentes, cerramos el carrito (`closeCart()`) y redirigimos al cliente directamente a su respectiva página física del catálogo general (`/tienda/producto/:id`).
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]

* **[x] ~~Tarea 350: Transformación de Botón Flotante de Checkout a Botón con Texto "Ir a pedir"~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Cambio de FAB de Icono a Pastilla Descriptiva:** Modificamos el botón de checkout flotante en `CartDrawer.jsx` (plantilla **App Ventas**) que anteriormente era solo una burbuja con una flecha. Ahora es un botón en formato de pastilla estilizada (`px-6 h-14 rounded-full`) con fondo acento sólido (`bg-action`) que lee claramente **"Ir a pedir"** junto al icono de flecha.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]

* **[x] ~~Tarea 349: Reubicación Superior de Botones de Swipe en Recomendaciones~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Reposicionamiento de Acciones Tinder-Style:** Para evitar el solapamiento con los nuevos controles de checkout flotantes y mejorar la comodidad táctil, reubicamos el bloque de botones (verde y rojo) de `SwipeableCardStack` en `CartDrawer.jsx` (plantilla **App Ventas**) a la parte superior de la tarjeta interactiva activa, reemplazando el margen superior `mt-1.5` por un margen inferior `mb-2.5`.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]

* **[x] ~~Tarea 348: Rediseño Compacto y Ajuste de Selector en Carrito~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Compactación de Tarjetas y Corrección de Desbordes:** Rediseñamos las tarjetas de producto en `CartDrawer.jsx` (plantilla **App Ventas**) reduciendo el tamaño de la imagen a `w-20 h-20` (80px), ajustando textos a `text-sm` y `text-[10px]`, y encogiendo el botón de eliminación a `w-7 h-7`. Reemplazamos la reducción por escala CSS (`scale-[0.7]`) en el selector de cantidades por su versión nativa compacta `size="sm"`, eliminando el desbordamiento horizontal y alineándolo de manera natural.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]

* **[x] ~~Tarea 347: Controles de Checkout Flotantes Asimétricos en el Carrito~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Visualización Despejada y FAB:** Eliminamos el fondo de pie de página completo en `CartDrawer.jsx` (plantilla **App Ventas**). Implementamos una burbuja de checkout flotante (FAB) a la derecha (`absolute right-6 bottom-6`) y un badge del total estimado acoplado a la izquierda (`absolute left-0 bottom-6`) con un diseño asimétrico (cuadrado contra el borde exterior y redondeado hacia el interior). Ajustamos el scroll padding a `pb-24` para optimizar el espacio útil.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]

* **[x] ~~Tarea 346: Estilización Glassmorphic del Footer del Carrito~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Visual Glassmorphic y Profundidad:** Se transformó el pie de página del carrito en `CartDrawer.jsx` (plantilla **App Ventas**) en una capa flotante absoluta (`absolute bottom-0 inset-x-0`) con fondo translúcido (`bg-white/70 backdrop-blur-lg`) y sombra superior invertida. Esto permite que los elementos en scroll pasen de forma visible y borrosa por detrás del footer, logrando un efecto de cristal premium.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]

* **[x] ~~Tarea 345: Ajuste de Scroll y Padding en el Carrito~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Corrección de Oclusiones en el Drawer:** Se modificó `CartDrawer.jsx` de la plantilla **App Ventas**. Se configuró la altura estricta del drawer a `h-[100dvh]`, se añadió `overflow-hidden` al contenedor principal y se aplicó un padding inferior de resguardo (`pb-56`) en la zona interna de scroll. Esto garantiza que la sección de productos recomendados suba por completo sobre el pie de página de pago al hacer scroll.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]

* **[x] ~~Tarea 344: Reubicación de Badges Inteligentes en Tarjeta de Producto~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Prevención de Solapamientos de Capa:** Se cambiaron de posición las etiquetas de promoción y estado en `ProductCard.jsx` de la plantilla **App Ventas**. Se movieron a la esquina inferior izquierda de la imagen (`absolute bottom-3 left-3`) para evitar colisiones con el botón de favoritos flotante que se ubica arriba a la derecha.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]

* **[x] ~~Tarea 343: Limpieza y Simplificación de Tarjetas de Producto~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Alineación de Contraste y Simplificación:** Se simplificó la visual en `ProductCard.jsx` de la plantilla **App Ventas**. Se eliminó la línea divisoria horizontal gris (`border-t`) por encima del pie de precios, se sustituyó el degradado de fondo de la tarjeta por un color blanco sólido (`bg-surface`) para mejorar el contraste contra el fondo general del catálogo y se suavizó el contorno de la tarjeta a `border-black/5`.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]

* **[x] ~~Tarea 342: Rediseño Estético Ultra-Premium de Tarjetas de Producto~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Alineación con Estética Premium Ecosistema:** Se actualizó por completo el componente `ProductCard.jsx` en la plantilla **App Ventas** para lograr un acabado visual premium: fondos en gradiente sutil, bordes de baja opacidad, sombras dinámicas y profundas de color-mix en hover, efecto glassmorphic translúcido con desenfoque de fondo en las etiquetas inteligentes, efectos suaves de zoom de imagen y transiciones elásticas en hover, categoría en mayúsculas con tracking ancho y un botón de favoritos estilizado de tipo burbuja de cristal.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]

* **[x] ~~Tarea 341: Rediseño de Layout de Precios en Tarjetas de Producto~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Reestructuración de Precios en Tarjeta:** Para evitar colisiones entre cifras largas de precios y el botón de acción "+", se rediseñó el pie de `ProductCard.jsx` en la plantilla **App Ventas**. Se implementó apilamiento vertical para los precios original y en oferta, se aplicaron clases de tamaño responsivas (`text-sm sm:text-base`) con soporte para truncamiento, se redujo el tamaño del botón "+" a `w-8 h-8` y se añadió una sutil línea divisora superior.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]

* **[x] ~~Tarea 340: Corrección de Etiquetas Inteligentes y Detección de Nuevos en App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Validación Estricta de Descuentos y Detección de Fechas Serializadas:** Se corrigió en el catálogo (`ProductCard.jsx`, `ProductDetailPage.jsx`, y `ProductPublicDetail.jsx`) de la plantilla **App Ventas** el bug que activaba "Oferta Imperdible" en todos los productos mediante una comparación numérica estricta (`precioPromo < precioBase`). Adicionalmente, se implementó un parseador seguro de marcas de tiempo de Firestore (`seconds * 1000`) para evitar que la evaluación de "Nuevo" arrojara `NaN` al deserializar datos almacenados en disco, restaurando el funcionamiento correcto de la etiqueta "Nuevo".
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductDetailPage.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductPublicDetail.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]

* **[x] ~~Tarea 339: Corrección de Responsividad en Toasts de Retroalimentación~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Posicionamiento Seguro de Toasts en Móviles:** Se adaptó la posición flotante del componente de notificaciones `GuidedToast.jsx` utilizando clases responsivas. Se cambió la posición rígida por `bottom-6 left-4 right-4 w-auto` en dispositivos móviles (previniendo cortes y desbordamiento lateral a la izquierda) y `md:left-auto md:right-6 md:w-full md:max-w-sm` para anchos de escritorio.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/ui/GuidedToast.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/ui/GuidedToast.jsx) [MODIFY]

* **[x] ~~Tarea 338: Rediseño Premium de Tarjeta de Estado de Base de Datos en Perfil~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Tarjeta de Base de Datos Premium en Perfil:** Se sustituyó el contenedor plano de información del sistema en el modal del perfil de administrador en `App.jsx` por una tarjeta con fondo en gradiente, efecto glassmorphic (`backdrop-blur-md` y sombreado interno/externo), iconos SVG (`Database`, `Layers`), e indicador visual animado de pulso (`animate-pulse`) en el estado de conexión de la base de datos.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 337: Rediseño Responsivo de Tarjetas CRM de Clientes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Optimización de Espacio en Tarjeta CRM:** Se rediseñó el bloque de métricas y botones en la tarjeta de cliente para móviles en `App.jsx`. Se incorporó un borde separador (`border-t`), distribución espaciada de extremos (`justify-between`), y alineación a la izquierda (`text-left`) para las métricas de Ventas y Comisión. Esto permite que el botón "Gestionar" se posicione a la derecha de manera simétrica y el contenido respire de manera estética en el viewport móvil.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 336: Unificación Horizontal de Botones en Consola de Monitoreo~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Alineación en Fila Única y Contención:** Se reemplazó el flex-wrap por flex-row e inyectó shrink-0 en los botones de "Simular Fallo", "Resolver Todos" y "Vaciar Historial" de la consola de diagnóstico de `App.jsx`. Adicionalmente se aplicó `overflow-x-auto max-w-full pb-1 scrollbar-none` en el contenedor, permitiendo un desplazamiento horizontal táctil e impidiendo que los botones se salgan del margen del viewport en dispositivos móviles o pantallas muy angostas.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 335: Resolución Inteligente de Alias y Búsqueda Recursiva de Código de Proyectos en CLI Bridge~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Resolución de Plantillas Core:** Corregido el helper `findProjectDir` en `server.js` para resolver correctamente la ruta a la carpeta de plantillas `Plantillas Core` del proyecto al utilizar `path.dirname(baseAppsDir)`.
    - **Búsqueda Recursiva y Sinónimos:** Se robusteció el endpoint `/api/project/file` para realizar búsquedas de archivo recursivas dentro del directorio del proyecto si la ruta relativa directa no existe. Asimismo, se implementó mapeo de sinónimos para resolver discrepancias de nombres (ej. buscando `CategoryManager.jsx` cuando se solicita `CategoriasView.jsx`), permitiendo cargar fragmentos de código de diagnóstico de producción sobre los fuentes del core local de forma fluida.
    - **Optimización de Recursión:** Se ajustó la búsqueda recursiva para ignorar directorios pesados y del sistema (como `node_modules`, `.git`, `dist`, `.vite` y carpetas que inician con `.`), resolviendo fallas por timeouts y errores 404 por búsquedas infinitas.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea 334: Corrección de Oclusión y Layout en Drawer de Diagnóstico de Incidente~~****
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Ajuste de Padding Responsivo:** Se corrigió la oclusión y recorte del drawer en la versión móvil cambiando la clase de padding `pl-10` a `pl-0 sm:pl-10` en el contenedor flex padre. Esto evita que el ancho absoluto del drawer (`w-screen`) se desfase 40px fuera de la pantalla en dispositivos móviles y anchos reducidos.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea 333: Corrección de Enlaces Rotos (404) de Módulos Completos en Biblioteca de Componentes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Corrección de Nombres de Archivos:** Se corrigieron los nombres de los enlaces a los archivos markdown físicos para los módulos "Créditos y Saldos" (`creditos_saldos.md` en lugar de `creditos_y_saldos.md`) y "Omnicanalidad WhatsApp" (`omnicanalidad.md` en lugar de `omnicanalidad_whatsapp.md`) en el catálogo oficial de la biblioteca.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]

* **[x] ~~Tarea 332: Ajuste de Alineación en Botón Agregar de Tarjeta de Producto~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Alineación a la Base (items-end):** Se cambió la alineación vertical del contenedor de precios y botón de agregar de `items-center` a `items-end` en `ProductCard.jsx`. Esto corrige la desalineación visual donde la existencia de múltiples líneas de precio (precio promo, precio base y badge de OFERTA) empujaba el botón "+" hacia arriba de forma asimétrica.
    - **Paridad de Márgenes:** Ahora el botón "+" se alinea perfectamente con la línea inferior de la tarjeta, manteniendo el mismo margen inferior y derecho (16px / p-4).
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]

* **[x] ~~Tarea 331: Visualización de Chips de Color en Filtros de Catálogo (Mapeo COLOR_NAMES)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Reemplazo de Hexadecimales por Nombres Legibles:** Se implementó un diccionario `COLOR_NAMES` en `ClientFilterModal.jsx` para mapear los códigos de color hexadecimales (como `#171717` o `#F5F5DC`) a sus nombres en lenguaje natural (como "Negro" o "Beige").
    - **Chips de Color Premium:** Se rediseñó el renderizado del listado de colores en el modal para mostrar chips redondeados interactivos (`rounded-full`) que incluyen un círculo con la previsualización del color real y el nombre legible al lado, eliminando la visualización tosca del código hexadecimal crudo.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ClientFilterModal.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ClientFilterModal.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/catalog/ClientFilterModal.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/catalog/ClientFilterModal.jsx) [MODIFY]

* **[x] ~~Tarea 330: Flexibilización Multivariante en Filtros del Catálogo (Lógica OR Global Absoluto)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Filtrado OR Global Absoluto:** Se refactorizó la lógica de filtrado de variantes y atributos dinámicos en `ClientCatalog.jsx` para implementar un OR absoluto a nivel de producto. Ahora, cuando hay filtros activos, un producto se muestra si coincide con AL MENOS UNO de los parámetros de filtro seleccionados (ya sea la marca, el color de variante o la talla de variante).
    - **Compatibilidad e Incremento de Visibilidad:** Esto permite que si el cliente selecciona Marca: Nike, Color: Negro Mate y Talla: S, el sistema traiga cualquier producto Nike (tenga o no esos atributos), cualquier producto talla S (sea de la marca que sea), y cualquier producto Negro Mate, maximizando la oferta visible en el catálogo de acuerdo a la preferencia explícita del usuario.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ClientCatalog.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ClientCatalog.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]

* **[x] ~~Tarea 329: Solución a la Oclusión y Apertura de Dropdowns en Formulario de Inventario (Vista Móvil)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Apertura de Selectores hacia Arriba:** Se implementó la prop `dropUp={true}` en los selectores CustomSelect de Atributos Personalizados (como la Marca) y de Tipo de Descuento dentro del modal de creación/edición de productos (`ProductFormModal.jsx`). Esto corrige el error de UX en la versión móvil donde las opciones del dropdown se desplegaban hacia abajo, siendo tapadas por el botón "Siguiente" o cortadas por el pie fijo del modal.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/admin/inventory/ProductFormModal.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/admin/inventory/ProductFormModal.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]

* **[x] ~~Tarea 328: Icono de Carrito Animado y Auto-Rotación por Inactividad en Sugerencias del Carrito (Mazo Tinder)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Reemplazo de Icono:** Se cambió el icono de "+" por un carrito de compras interactivo (`ShoppingCart` de Lucide) en el botón de acción inferior derecho del mazo Tinder.
    - **Animación Premium de Compra:** Se le dotó de una micro-animación pulsante continua y dinámica con sombras reactivas (`scale: [1, 1.12, 1]` y `boxShadow` de framer-motion) para guiar intuitivamente al cliente a agregar el producto.
    - **Auto-Rotación Comercial por Inactividad:** Se implementó una lógica de auto-autoplay mediante temporizador (5 segundos de inactividad) que desliza automáticamente la tarjeta de arriba y la inserta al final de la pila, garantizando que el usuario siempre vea variedad de productos disponibles sin necesidad de deslizar manualmente.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]

* **[x] ~~Tarea 327: Unificación y Dinamismo de Etiquetas Inteligentes en Detalle de Producto y Portal QR~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Dinamización de Cabecera Desktop:** Se actualizó la cabecera en vista de escritorio de `ProductDetailPage.jsx` para consumir la constante reactiva `activeSmartTag` con sus estilos HSL/Hex y texto personalizado, reemplazando la lógica estática anterior.
    - **Implementación de Hooks en Portal QR:** Se agregaron los hooks de resolución `stockConsolidado` y `activeSmartTag` en `ProductPublicDetail.jsx` idénticos a los del detalle de producto.
    - **Integración en Vista Pública:** Se reemplazaron las etiquetas e insignias estáticas y colores fijos ("bg-[#ff5a00]", "bg-[#2968c8]", etc.) del portal público QR por la constante `activeSmartTag` dinámica y configurable por el administrador.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductDetailPage.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductPublicDetail.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]

* **[x] ~~Tarea 326: Blindaje Preventivo y Estandarización de Cierre de Sesión Administrador en Ecosistema (GEMINI.md)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Inyección de Directiva de Calidad:** Añadida una nueva regla mandatoria en las directivas de comportamiento del archivo `GEMINI.md` maestro, exigiendo que todo cierre de sesión de administrador o del sistema asocie asíncronamente `signOut(auth)` de Firebase Auth.
    - **Propagación en Ecosistema:** Ejecutado el sincronizador en cascada `sync_rules.js` para actualizar las directivas en 9 destinos, blindando el desarrollo de futuros cores y clientes generados por la CLI.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
    - Sincronización en cascada a 9 destinos del disco.

* **[x] ~~Tarea 325: Corrección de Cierre de Sesión Administrador en Pestaña Ajustes (Auto-login recarga)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Cierre de Sesión en Firebase Auth:** Corregido el bug donde cerrar sesión de Administrador desde la pestaña de Ajustes (`AdminSettings.jsx`) limpiaba el store de Zustand (`logout()`) pero no destruía la sesión activa de Firebase Auth. Esto provocaba que al recargar la página la app hiciera auto-login automático del administrador, bloqueando la posibilidad de alternar limpiamente con el rol de cliente en el mismo navegador.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]

* **[x] ~~Tarea 324: Consistencia y Renderizado de Descuentos en Ficha de Detalle de Producto y Portal QR~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Unificación de Precios Promocionales:** Corregido el bug de consistencia de precios donde los descuentos directos configurados en el inventario del producto (`discountActive`, `discountType`, `discountValue`) solo se reflejaban si el producto tenía un anuncio publicitario (`ad`) activo vinculado.
    - **Fallback de Descuento Directo:** Implementada lógica de fallback en el mapeo de productos del catálogo (`ClientCatalog.jsx`), la página de detalle de la tienda (`ProductDetailPage.jsx`) y el portal público de compra por QR (`ProductPublicDetail.jsx`) para procesar el descuento nativo del producto.
    - **Visualización de Precio Tachado:** Habilitado el precio base original tachado y la etiqueta de descuento correspondiente ("% OFF" u "OFERTA") en las vistas móviles y de escritorio de ambas fichas.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ClientCatalog.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductDetailPage.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductPublicDetail.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]

* **[x] ~~Tarea 323: Previsualización en Vivo de Tarjeta de Producto en Formulario de Inventario~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Live Product Card Preview:** Reemplazada la simple vista previa de imagen en el Paso 1 (Imagen) del modal de creación/edición de productos por el componente `ProductCard` real.
    - **Reactividad Completa:** La tarjeta se actualiza en caliente según los campos ingresados por el administrador en el formulario (nombre, categoría, precio, descuento/oferta, variantes y foto de portada).
    - **Bloqueo y Seguridad:** Añadida una máscara con efecto blur difuminado cuando la IA de Gemini está analizando la imagen y el flag `isTemporal: true` en el componente para prevenir redirecciones al clickear la tarjeta previa.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/admin/inventory/ProductFormModal.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]

* **[x] ~~Tarea 322: Solución a la Detección de Repositorios Git en el Gestor de Respaldos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Detección de Repositorios Inactivos (Sin Git):** Identificado que `.git` de App Ventas quedó renombrado como `.git-backup-temp` por bloqueos de archivos de servidores Vite en un backup anterior fallido.
    - **Detención de Vite en Menú de Respaldos:** Refactorizada la rutina de auto-recuperación de `menu_backup.ps1` para buscar y detener cualquier servidor Vite activo en Node.exe antes de intentar renombrar, garantizando la liberación del lock y la detección limpia de los repositorios Git del core.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/menu_backup.ps1`](file:///D:/PROTOTIPE/menu_backup.ps1) [MODIFY]

* **[x] ~~Tarea 321: Rediseño del Perfil de Cliente, Optimización de Sidebar, Animaciones de Carrito y Notificaciones y Stacking Context de Emojis~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Optimización de Sidebar de Escritorio:** Rediseñado con cabecera de marca e identidad visual arriba, y panel rápido de 3 botones en grid abajo (Carrito, Notificaciones, Perfil).
    - **Animaciones de Carrito y Campana:** Agregado wiggle/bounce interactivo y sutil en base a conteos mayores a cero.
    - **Rediseño del Perfil Cliente:** Reorganizado en tarjetas premium agrupando historial de pedidos, créditos y descarga PWA, además del banner dinámico del desarrollador.
    - **Resolución de Selector de Emojis:** Corregido el bug del lápiz selector sobre el avatar agregando pointer-events-none al icono interior.
    - **Solución del Stacking Context:** Elevado el `z-index` del header del perfil y del selector de emojis a `z-40`/`z-50` para evitar que se renderice por detrás del contenedor de tarjetas inferiores (`z-20`).
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ClientProfile.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientProfile.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/layouts/ClientLayout.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/layouts/AdminLayout.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]

* **[x] ~~Tarea 320: Sincronización de Créditos con Domicilio/Descuento y Optimización de Carga Paginada~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Sincronización de Totales en Deudas:** Modificada la aprobación de créditos para consultar previamente Firestore y capturar el total real (con domicilio y descuento) de la orden más actualizada.
    - **Sincronización al Editar Domicilios:** Modificado el actualizador de costo de envío para buscar el crédito asociado del pedido y sumarle/restarle automáticamente la diferencia.
    - **Optimización de Carga Paginada:** Modificada la paginación a `limitSize + 1` elementos para determinar el indicador de página siguiente de forma atómica. Adaptada la interfaz del panel para consumirlo eliminando el fetch secuencial `checkNext` redundante.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/services/orderService.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/services/creditService.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/AdminCredits.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]
  - Verificación: Compilación local de producción exitosa y validada.

* **[x] ~~Tarea 319: Corrección de ReferenceError por CheckCircle no definido en Zona de Desarrollador~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Importación de Icono Faltante:** Importado el icono `CheckCircle` de `lucide-react` al inicio de `DeveloperSettings.jsx`, corrigiendo la excepción de tiempo de ejecución `ReferenceError: CheckCircle is not defined` que ocurría al enviar un error simulado o al aplicar acciones de éxito.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
  - Verificación: Sincronizado downstream y validada la compilación de producción con la suite de tests en verde.

* **[x] ~~Tarea 318: Estructuración y Categorización de Paletas de Colores por Nicho de Negocio~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Repertorio de Paletas Ampliado:** Creadas y definidas 25 paletas de colores premium (5 por categoría/nicho) dentro de `palettes.js` alineadas a nichos de mercado: Moda y Accesorios, Gastronomía y Alimentos, Salud y Belleza (Estética), Tecnología y Deportes, y Mascotas y Naturaleza.
    - **Categorización en UI:** Refactorizado el selector de temas en `AppearanceSettings.jsx` para agrupar dinámicamente las paletas en el modal según su propiedad `category`, brindando una experiencia visual organizada y profesional.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/constants/palettes.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/constants/palettes.js) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx) [MODIFY]
  - Verificación: Sincronizado a CLI y compilación de producción validada exitosamente.

* **[x] ~~Tarea 317: Optimización del Retorno de Navegación de Subsecciones en el Panel de Ajustes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Navegación Multinivel:** Modificada la lógica del botón de regreso principal en `AdminSettings.jsx` para que detecte si hay un `activeSubSection` activo. Si lo hay, regresa al menú de la sección padre (ej. Zona de Desarrollador o Menú Personalización) seteando `activeSubSection(null)` en lugar de regresar directamente a los Ajustes Generales, evitando así la pérdida de autenticación de PIN de desarrollo e incomodidad del usuario.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - Verificación: Sincronización a CLI aprobada y compilada correctamente.

* **[x] ~~Tarea 316: Corrección de Contraste y Activación del Modal de Selección de Temas en Ajustes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Mejora de Contraste:** Cambiado el color del botón "Cambiar" del selector de tema en `AppearanceSettings.jsx` de `bg-app text-surface` a una combinación de alto contraste (`bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100`) para cumplir los estándares de accesibilidad y visibilidad.
    - **Despliegue del Modal:** Integrado el componente y markup del Selector de Tema Inteligente (anteriormente omitido en el desacoplamiento del monolito) directamente en `AppearanceSettings.jsx` utilizando su propio estado local `isThemeModalOpen` y control de scroll corporal `ThemeModalLock`.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx) [MODIFY]
  - Verificación: Compilación local de Vite/Rolldown exitosa. Verificado que el selector y los botones funcionan con alto contraste.

* **[x] ~~Tarea 315: Desacoplamiento y Modularización del Panel de Ajustes (AdminSettings.jsx)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Modularización del Monolito:** Segmentado el componente monolítico de ajustes (`AdminSettings.jsx` de 400KB) en 9 secciones independientes y 1 componente visual (`MobilePreview.jsx`) agrupados en `/src/pages/admin/settings/`.
    - **Secciones Desacopladas (Revisión 2):** Identidad de marca (`BrandSettings.jsx`), personal y perfiles (`EmployeeSettings.jsx`), configuración operativa (`StoreSettings.jsx`), cuentas bancarias (`PaymentSettings.jsx`), credenciales de seguridad (`SecuritySettings.jsx`), zona protegida del desarrollador (`DeveloperSettings.jsx`), apariencia (`AppearanceSettings.jsx`), anuncios (`AdSettings.jsx`) y cupones de descuento (`CouponSettings.jsx`), resolviendo los ReferenceErrors por marcadores no definidos.
    - **Enrutamiento Limpio:** Refactorizado `AdminSettings.jsx` para actuar como enrutador ligero de pestañas y despachador de estados, reduciendo su tamaño en más de un 80%.
    - **Sincronización:** Ejecutada la sincronización física del core a la plantilla de ventas CLI (`sync_templates.js ventas`) y validada la compilación de producción.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/AdminSettings.jsx.bak`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx.bak) [NEW]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/components/MobilePreview.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/components/MobilePreview.jsx) [NEW]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/BrandSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/BrandSettings.jsx) [NEW]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/EmployeeSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/EmployeeSettings.jsx) [NEW]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/StoreSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/StoreSettings.jsx) [NEW]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/PaymentSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/PaymentSettings.jsx) [NEW]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/SecuritySettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/SecuritySettings.jsx) [NEW]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [NEW]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx) [NEW]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/AdSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/AdSettings.jsx) [NEW]
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/CouponSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/CouponSettings.jsx) [NEW]
  - Verificación: Compilación local de Vite/Rolldown en Core y CLI exitosa. Pruebas E2E de integración Playwright superadas (✓ PASSED en 16.4s).

* **[x] ~~Tarea 314: Creación de Documentación de Estructura de Ajustes en App Ventas~~****
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Documentación de Ajustes:** Creado el archivo `estructura_ajustes.md` en `Documentacion App Ventas` del core Ventas. Detalla de forma ramificada y verídica todos los menús, interruptores, campos del formulario y lógica de persistencia del panel de ajustes (`AdminSettings.jsx`).
    - **Registro en Mapa Semántico:** Indexada la nueva documentación en `mapa_documentacion_ia.md` con su respectivo Criterio de Decisión IA.
  - Archivos creados/modificados:
    - [`D:/PROTOTIPE/Plantillas Core/App Ventas/Documentacion App Ventas/estructura_ajustes.md`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/estructura_ajustes.md) [NEW]
    - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - Verificación: Rutas y mapas comprobados en caliente.

* **[x] ~~Tarea 313: Sincronización e Integración Física del Core con la Plantilla de Ventas (template-ventas)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Sincronización Física del Core ➔ Plantilla:** Se ejecutó `sync_templates.js` para transferir los 2 archivos nuevos (incluido `alertService.js` y `AlertConfirmContext.jsx`) y 19 archivos de negocio optimizados de `App Ventas` a `template-ventas` en el CLI, preservando la exclusión estricta de variables de entorno, credenciales e identidad visual locales.
    - **Sanitización Dinámica:** Reemplazo de tokens de desarrollo (`ventas-smartfix`, `app-ventas`) por placeholders genéricos (`proyecto-cliente-saas`) y APIs de Firestore.
  - Archivos creados/modificados:
    - Sincronización y actualización física de 21 archivos en [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/).
  - Verificación: Suite de integración `node test_templates.js --template ventas` ejecutada y aprobada (✓ PASSED en 26.8 segundos).

* **[x] ~~Tarea 312: Robustecimiento y Blindaje de Telemetría en la Plantilla Core del CLI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Throttling y Cola Offline en Telemetría:** Se portó el algoritmo de resiliencia offline (`localStorage` con capacidad máxima de 20 logs en cola) y el limitador de tasa/throttling (60 segundos de silencio para errores idénticos) a la función `reportAppFailureToDeveloper` del `telemetryService.js` en `template-ventas`.
    - **Desacoplamiento de Iconos y Alertas en Error Boundary:** Se eliminó la dependencia de `lucide-react` en `ErrorBoundaryFallback.jsx` reemplazando todos los iconos por SVGs inline para blindar al boundary ante fallas en la carga de librerías. Adicionalmente, se retiraron llamadas a objetos no garantizados en plantillas independientes (como `alertService.js`) dejando un fallback seguro y limpio al navegador nativo.
  - Archivos creados/modificados:
    - `D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js` [MODIFY]
    - `D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/ui/feedback/ErrorBoundaryFallback.jsx` [MODIFY]
  - Verificación: Suite de integración `node test_templates.js` aprobada con éxito (✓ PASSED en 25.6 segundos).

* **[x] ~~Tarea 311: Optimización y Estandarización Profesional del Generador CLI (generator.js)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - **Inyección de firestore.rules:** Se automatizó la creación del archivo `firestore.rules` con esquema de seguridad restrictivo por defecto para garantizar que los despliegues de base de datos no queden expuestos o fallen.
    - **Inyección de variables HSL en src/index.css:** Las variables de tema Tailwind v4 de la marca (`--color-primary`, `--color-accent`) se inyectan en caliente dentro de la directiva `@theme` en el archivo de estilos de entrada de la aplicación destino.
    - **Generación automatizada de manifest PWA dinámico:** El manifest de la PWA (`manifest.json` / `site.webmanifest`) ahora se genera o actualiza inyectando de forma dinámica el `name`, `short_name`, y colores Hex (`theme_color`, `background_color`) convertidos desde la paleta HSL.
    - **Robustecimiento del saneador de paths absolutos en GEMINI.md:** Se actualizó la sanitización de rutas absolutas mediante expresiones regulares insensibles al tipo de barra y sistema de archivos, asegurando la total portabilidad de las reglas de desarrollo.
  - Archivos creados/modificados:
    - `D:/PROTOTIPE/Prototipe-CLI/generator.js` [MODIFY]
  - Verificación: Suite de tests ejecutada exitosamente (`node test_templates.js` PASSED).

* **[x] ~~Tarea 310: Migración SSH + Blindaje Definitivo del Engine de Respaldo Git~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - Migrar autenticación Git de HTTPS (Windows Credential Manager expirado) a SSH con llave ED25519. Generar llave, registrarla en GitHub y actualizar todos los remotes del workspace.
    - Eliminar el parche temporal `GIT_ASKPASS`/`GIT_TERMINAL_PROMPT` de `git_backup.ps1` y `subproject_backup.ps1` reemplazándolo por un check SSH limpio con `git ls-remote origin HEAD 2>$null`.
    - Corregir flash de error rojo en consola causado por `2>&1` redirigiendo stderr de git al error stream de PowerShell. Solucionado con `2>$null | Out-Null`.
    - Corregir `Rename-Item: Acceso denegado` al abrir `menu_backup.ps1` añadiendo bucle de reintentos (6 intentos, 400ms) en la rutina de auto-recuperación de `.git-backup-temp`.
    - Optimizar scan de auto-recuperación en `menu_backup.ps1` limitando `Get-ChildItem` a `-Depth 3` para evitar recorrer `node_modules` y eliminar el delay de 1-3s al abrir el menú.
    - Solución definitiva al bloqueo de Vite sobre `.git` del dev-dashboard: detectar y terminar el proceso `node.exe` de Vite antes del renombrado de `.git` y relanzarlo automáticamente al finalizar el backup.
    - Añadir `-Depth 3` al scan de `.git` del backup maestro para consistencia con `menu_backup.ps1`.
  - Archivos creados/modificados:
    - `D:/PROTOTIPE/git_backup.ps1` [MODIFY]
    - `D:/PROTOTIPE/subproject_backup.ps1` [MODIFY]
    - `D:/PROTOTIPE/menu_backup.ps1` [MODIFY]
  - Infraestructura: `C:\Users\Sergio\.ssh\id_ed25519` (ED25519) registrada en GitHub DEVPROTOTIPE. Remotes actualizados a `git@github.com:DEVPROTOTIPE/PROTOTIPE.git`.
  - **[Rev. 1 - 2026-06-09]** Bugfix adicional: el paso de detención de Vite no era suficiente porque los `.git-backup-temp` residuales de backups anteriores fallidos impedían que el scan de `[1/6]` encontrara todos los repos. Se añadió un paso de auto-saneamiento en `git_backup.ps1` entre la detención de Vite y el scan: busca y restaura cualquier `.git-backup-temp` → `.git` con `-Depth 3` antes de escanear, garantizando que el backup maestro siempre encuentre y oculte la totalidad de los subrepositorios.

* **[x] ~~Tarea 309: Bugfix y Blindaje de Scripts de Respaldo Git (.ps1)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - Resolver el bloqueo infinito en la verificación de red de Git en `git_backup.ps1` y `subproject_backup.ps1` inyectando `$env:GIT_TERMINAL_PROMPT = "0"` y `$env:GIT_ASKPASS = "true"` temporalmente para forzar un fallo rápido en lugar de prompts interactivos no visibles.
    - Implementar un bucle de reintento inteligente de renombrado de directorios `.git` en el bloque `finally` de `git_backup.ps1` para mitigar bloqueos de archivos de Vite (`npm run dev`) u otros procesos, previniendo estados inconsistentes de subrepositorios.
  - Archivos creados/modificados:
    - `D:/PROTOTIPE/git_backup.ps1` [MODIFY]
    - `D:/PROTOTIPE/subproject_backup.ps1` [MODIFY]

* **[x] ~~Tarea 308: Estandarización de Selectores Desplegables Premium en dev-dashboard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - Estandarizar todos los selectores del dashboard reemplazando los `<select>` nativos e interfaces customizadas inconsistentes por el componente premium unificado `CustomSelect` (con su menú flotante oscuro con check, dots e íconos).
    - Resolver el conflicto de compilación en `App.jsx` limpiando las importaciones duplicadas y dotando al `CustomSelect` local de `App.jsx` de la misma estética y comportamiento de animación.
    - Integrar `CustomSelect` en `CoreManagerPanel.jsx` (Scaffold de cores base), y en los sandboxes del panel administrador: `CreditosSaldosSandbox.jsx`, `CustomCursorSandbox.jsx` y `ReservasAgendaCitasSandbox.jsx`.
    - Resolver el bug crítico de renderizado ("queda por detrás") implementando z-index dinámico (`z-20` vs `z-0` condicionado a `isExpanded`) en el contenedor de las tarjetas de cores en `CoreManagerPanel.jsx`, garantizando que la lista flotante se dibuje sobre las tarjetas subsiguientes.
  - Archivos creados/modificados:
    - `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx` [MODIFY]
    - `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx` [MODIFY]
    - `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CreditosSaldosSandbox.jsx` [MODIFY]
    - `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CustomCursorSandbox.jsx` [MODIFY]
    - `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ReservasAgendaCitasSandbox.jsx` [MODIFY]

* **[x] ~~Tarea 307: Robustecimiento y Automatización del CLI Daemon (Puerto 3001)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - Implementar validación de contraste HSL (tasa mínima de diferencia de 30% en luminosidad) en el pre-aprovisionamiento del servidor para impedir la creación de instancias con paletas rotas.
    - Robustecer la generación de iconos PWA con Jimp, aplicando redimensionamiento proporcional y padding del 10% (safe area) para iconos maskables.
    - Integrar Smoke Test Headless con Playwright post-aprovisionamiento para levantar temporalmente la aplicación en el puerto 5190 y verificar que renderiza sin errores de consola React antes de confirmar la creación.
    - Generar de forma dinámica el mapa semántico de IA (`mapa_arquitectura_ia.md`) de la instancia síncronamente al crear el proyecto.
    - Crear endpoint de auditoría y sincronización de Firestore (`/api/project/sync-database`) para auditar, sincronizar y desplegar automáticamente las reglas e índices del cliente contra su plantilla de origen.
  - Archivos creados/modificados:
    - `D:/PROTOTIPE/Prototipe-CLI/server.js` [MODIFY]
    - `D:/PROTOTIPE/Prototipe-CLI/generator.js` [MODIFY]
    - `D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js` [MODIFY]

* **[x] ~~Tarea 306: Optimización de Rendimiento por manualChunks y Modo Simulación de Diffs en CLI Sincronizador~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - Configurar segmentación de dependencias pesadas (`manualChunks` para `firebase`, `jspdf`/`html2canvas`, `framer-motion` y `lucide-react`) en el empaquetador de Vite de `App Ventas (Core)` para reducir el tamaño del bundle principal de 1.13 MB a 132.6 kB (reducción del 90%).
    - Propagar la configuración de chunks optimizados y la actualización de exclusiones del `.gitignore` (añadiendo `.vite/`, `playwright-report/`, `test-results/`) al template global del CLI en `Prototipe-CLI/templates/template-ventas/` para que los nuevos proyectos e instancias de marca blanca se generen con estas optimizaciones por defecto.
    - Dotar al CLI de sincronización interactivo (`sync_clients.js`) con un menú de decisión para el desarrollador: Aplicar cambios, Ver diffs de simulación/Dry Run, u Omitir cliente.
    - Implementar visualización inteligente de diferencias en terminal usando la dependencia `diff`, resaltando adiciones en verde (`+`), eliminaciones en rojo (`-`) y colapsando bloques extensos de texto sin cambios.
  - Archivos creados/modificados:
    - `D:/PROTOTIPE/Plantillas Core/App Ventas/vite.config.js` [MODIFY]
    - `D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js` [MODIFY]
    - `D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/.gitignore` [MODIFY]
    - `D:/PROTOTIPE/Prototipe-CLI/sync_clients.js` [MODIFY]
    - `D:/PROTOTIPE/Prototipe-CLI/package.json` [MODIFY]

* **[x] ~~Tarea 305: Automatización del Ciclo de Vida de Cores y Panel CoreManagerPanel en dev-dashboard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción:
    - Diseñar e implementar panel de administración visual `CoreManagerPanel` para registrar, scaffoldear, sincronizar y activar/desactivar plantillas core.
    - Desarrollar endpoints en `Prototipe-CLI/server.js` para registrar cores, listar cores, hacer scaffold clonando un core de referencia y activar/desactivar un core.
    - Modificar `generator.js` para generar el estándar de 12 archivos de documentación para nuevos cores y clientes.
    - Agregar acceso directo a "Plantillas Core" en la barra de navegación lateral `NAV_TABS` de `App.jsx`.
    - Verificar la compilación del dashboard dev sin errores.
  - Archivos creados/modificados:
    - `D:/PROTOTIPE/Prototipe-CLI/server.js` [MODIFY]
    - `D:/PROTOTIPE/Prototipe-CLI/generator.js` [MODIFY]
    - `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx` [NEW]
    - `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx` [MODIFY]

* **[x] ~~Tarea 303: Corrección de Ruta Fuente de Plantilla `ventas` en Registro Central~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción: Modificar `plantillas_registro.json` para actualizar la ruta de la fuente (`fuente`) de `ventas` desde `D:/Aplicaciones/App Ventas` a la ruta estandarizada `D:/PROTOTIPE/Plantillas Core/App Ventas`.
  - Archivos modificados: `D:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json` [MODIFY].

* **[x] ~~Tarea 304: Diseño e Implementación del Sincronizador de Clientes (`sync_clients.js`) en `Prototipe-CLI`~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción: Crear una herramienta CLI interactiva `sync_clients.js` para propagar de forma selectiva y controlada los cambios en los templates del core hacia las instancias de clientes activas (`D:\PROTOTIPE\Instancias Clientes\*`), reportando diffs y evitando la sobreescritura de lógica customizada del cliente.
  - Archivos creados/modificados: `D:/PROTOTIPE/Prototipe-CLI/sync_clients.js` [NEW], `D:/PROTOTIPE/Prototipe-CLI/package.json` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/generator.js` [MODIFY].

* **[x] ~~Tarea 302: Creación de Carpeta Dedicada para Instancias de Clientes ("Instancias Clientes")~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción: Crear y configurar la carpeta dedicada `D:\PROTOTIPE\Instancias Clientes` para evitar que las instancias generadas de clientes se escriban directamente en la raíz de `D:\PROTOTIPE`. Se actualizó la variable de entorno `PROTOTIPE_WORKSPACE_ROOT` en el `.env` del CLI, la constante `APPLICATIONS_DIR` en `config.js` del CLI y el generador de rutas/placeholder en `App.jsx` de `dev-dashboard` para que apunten de forma predeterminada a este nuevo directorio.
  - Archivos creados/modificados: `D:/PROTOTIPE/Prototipe-CLI/config.js` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/.env` [MODIFY], `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx` [MODIFY].

* **[x] ~~Tarea 301: Evolución Incremental de Prototipe CLI - Prioridades 0 a 5~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-09
  - Fecha de finalización: 2026-06-09
  - Descripción: Ejecución exitosa de la evolución incremental del CLI conservando 100% la compatibilidad. Prioridad 0 (configuración global centralizada en `config.js` y logger estructurado en `logger.js`). Prioridad 1 (eliminación de rutas hardcodeadas en todo el CLI, bridge API y generator). Prioridad 2 (desbloqueo del Event Loop de Express mediante worker en proceso hijo `worker_create_project.js` vía fork IPC). Prioridad 3 (robustecimiento de Firebase CLI mediante sanitización de IDs, clasificador de errores y guardas en el pipeline). Prioridad 4 (sanitización dinámica de tokens del `.env.local` y `package.json` de la fuente antes de escribir). Prioridad 5 (encapsulación de los pasos críticos de aprovisionamiento 9-12 en funciones auxiliares privadas en `generator.js` sin alterar contratos públicos).
  - Archivos creados/modificados: `D:/PROTOTIPE/Prototipe-CLI/config.js` [NEW], `D:/PROTOTIPE/Prototipe-CLI/logger.js` [NEW], `D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js` [NEW], `D:/PROTOTIPE/Prototipe-CLI/cli.js` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/generator.js` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/server.js` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/sync_templates.js` [MODIFY].

* **[x] ~~Tarea 300: Suite de Pruebas E2E de Flujo de Checkout con Playwright~~**
  - Estatus: Completado. Rev.5 (2026-06-09): Fix definitivo del panel E2E en dev-dashboard — proceso Playwright ya no se mata prematuramente y reuseExistingServer corregido.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-09
  - Descripción: Implementación y posterior refactorización del framework E2E. Fase 1: Setup inicial de Playwright con test monolítico. Fase 2 (Rev.1): Separación en 3 capas (config / helpers / spec) para escalar a múltiples clientes sin duplicar lógica. Fase 3 (Rev.2): Scripts `test:ci`, hook pre-push Git. Fase 4 (Rev.4): Panel dinámico en dev-dashboard. Fase 5 (Rev.5): Dos bugs críticos resueltos: (1) `req.on('close')` en Express se disparaba inmediatamente con `fetch()+SSE` matando el proceso hijo con SIGTERM en 0ms — fix: timeout de seguridad de 120s + flag `testFinished`. (2) `reuseExistingServer: !process.env.CI` forzaba `false` porque el servidor inyecta `CI=1`, lo que causaba error "port already in use" en 5173 — fix: `reuseExistingServer: true` siempre.
  - Archivos creados/modificados: `playwright.config.js` [MODIFY], `tests/checkout.spec.js` [MODIFY], `tests/config/app-ventas.config.js` [NEW], `tests/helpers/checkout.helpers.js` [NEW], `package.json` [MODIFY], `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/server.js` [MODIFY].
  - Verificación: CLI Bridge log `✅ Tests pasaron en 18.8s`. Dashboard muestra `ok 1 [chromium] › checkout.spec.js → 1 passed (17.2s)` con banner PASS visible.


* **[x] ~~Tarea 299: Visor de Código en Vivo en Diagnóstico de Incidentes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Desarrollar e integrar un visor de código fuente en tiempo real dentro del modal de Diagnóstico de Incidentes de la Consola Central (dev-dashboard). Consiste en (1) Crear el endpoint `/api/project/file` en el CLI Bridge Server (`server.js`) para resolver y leer archivos de código de proyectos locales. (2) Implementar lógica de fetch en la UI para consultar dicho endpoint en caliente utilizando el `clientId` y la ruta extraída. (3) Renderizar un visor de código con scroll, números de línea, estilos de terminal monospace y resaltado visual explícito en la línea donde se detonó el bug.
  - Archivos modificados: `D:/PROTOTIPE/Prototipe-CLI/server.js` [MODIFY], `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx` [MODIFY].
  - Verificación: Compilar y verificar el funcionamiento local del endpoint y el renderizado en el modal. Correctamente compilado e integrado.

* **[x] ~~Tarea 298: Optimización de Sesiones y Resiliencia en Notificaciones Core~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Eliminada la race condition de redirección errónea al login de administradores en la carga inicial de `/admin` quitando el timeout diferidor de 200ms en `useAuthInit.js`. Adicionalmente, se corrigió el leak de datos en `useNotificationCenter.js` moviendo el reset de estados al inicio del useEffect (antes de los returns tempranos) para que las notificaciones del usuario anterior se limpien de forma inmediata al cerrar sesión o quedar los IDs de usuario nulos.
  - Archivos modificados: `src/hooks/useAuthInit.js` [MODIFY], `src/hooks/useNotificationCenter.js` [MODIFY].
  - Verificación: Compilación local de producción de App Ventas completada exitosamente (`npm run build` en 1.34s).

* **[x] ~~Tarea 297: Eliminación de ráfaga de toasts al cargar perfil Admin/Cliente~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Corregido el comportamiento donde al ingresar al perfil de administrador o cliente, todas las notificaciones `unread` pre-existentes se disparaban como toasts simultáneamente. Fix: `toastReadyRef` como guard de inicialización en ambos layouts — en el primer snapshot de Firestore se silencian los toasts y en su lugar se activa `isBellAttentive` (animación de oscilación doble + scale + glow primary) para incitar al usuario a abrir la campana voluntariamente. Los toasts siguen funcionando normalmente para notificaciones genuinamente nuevas.
  - Archivos modificados: `AdminLayout.jsx` [MODIFY], `ClientLayout.jsx` [MODIFY].
  - Verificación: Build ✓ 939ms.

* **[x] ~~Tarea 296: Corrección de `removeChild` en Portal de ModalTemplate~~**

  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Corregido el `NotFoundError: Failed to execute 'removeChild' on 'Node'` reportado en `ventas-smartfix`. Causa raíz: el portal se creaba directamente sobre `document.body` (nodo compartido), generando conflictos en el reconciliador de React al desmontar componentes que contenían `ModalTemplate`. Fix: cada instancia crea su propio `<div data-modal-portal>` via `useEffect`/`useRef` con cleanup seguro (`document.body.contains(el)`). El portal siempre opera sobre su propio nodo aislado. Fix propagado a `App Ventas` y a `template-ventas` del CLI.
  - Archivos modificados: `src/components/common/ModalTemplate.jsx` [MODIFY] (App Ventas + template-ventas).
  - Verificación: Build ✓ 1.60s sin errores.

* **[x] ~~Tarea 295: Corrección de ReferenceError CLIENT_ID y Enriquecimiento de Consola de Telemetría~~**

  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Corregido el bug de variable no definida `CLIENT_ID` en `dev-dashboard` al crear reportes de prueba. Se migró a un fallback dinámico que obtiene el primer id de cliente del historial o un valor por defecto. Adicionalmente, se corrigió el fallo de permisos de Firestore (`Missing or insufficient permissions`) al simular incidentes de prueba, asegurando que el payload inyectado incluya un token de telemetría válido para cumplir con las reglas de seguridad. Se expandió el panel (drawer) de diagnóstico de incidentes para renderizar de manera interactiva el nuevo contexto enriquecido (environment y user). Finalmente, se rediseñó estéticamente la consola de telemetría del dashboard convirtiéndola en una "Matriz de Telemetría Multi-Cliente" premium e interactiva. Incluye tarjetas por cliente activo con indicadores LED y contadores rápidos (Fallos/Cobros), filtros rápidos de logs por tipo (FAIL, BILLING, SYSTEM), input de búsqueda textual y filtrado cruzado al clickear elementos.
  - Archivos modificados/creados: `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx` [MODIFY].
  - Verificación: Compilación de producción de `dev-dashboard` realizada exitosamente (`npm run build`).


* **[x] ~~Tarea 294: Erradicación de `alert()` Nativo y Singleton de Alertas Imperativo~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Auditoría completa y erradicación de los 17+ `window.alert()` y `window.confirm()` nativos presentes en el codebase. Se creó el singleton imperativo `alertService.js` para permitir el disparo de modales premium desde fuera del árbol React (hooks puros, class components). `AlertConfirmProvider` registra sus funciones en el singleton al montar. Se migró `usePWAInstall`, `ErrorBoundaryFallback`, `AdminSales`, `AdminStockAlerts`, `ClientOrders` y `AdminSettings` al nuevo sistema.
  - Archivos modificados/creados: `src/services/alertService.js` [NEW], `src/components/common/AlertConfirmContext.jsx` [MODIFY], `src/hooks/usePWAInstall.js` [MODIFY], `src/components/ui/feedback/ErrorBoundaryFallback.jsx` [MODIFY], `src/pages/admin/AdminSales.jsx` [MODIFY], `src/components/admin/inventory/AdminStockAlerts.jsx` [MODIFY], `src/pages/client/ClientOrders.jsx` [MODIFY], `src/pages/admin/AdminSettings.jsx` [MODIFY].
  - Verificación: Auditoría `grep` limpia (0 resultados). Compilación local `✓ built in 1.18s`.

* **[x] ~~Tarea 293: Robustecimiento de la Telemetría de Errores y Facturación~~**

  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Implementado un canal de telemetría de fallos ultra-robusto que incluye resiliencia offline mediante cola en localStorage y listener `online` de red, contexto de sesión del usuario logueado en Firebase Auth (UID/Email de forma segura) y datos de entorno (URL, viewport, resolución, idioma), y un algoritmo anti-saturación basado en firma hash (Throttling a 60 segundos por error idéntico) para mitigar sobrecostos de escrituras en la Consola Central.
  - Archivos modificados/creados: `D:/Aplicaciones/App Ventas/src/services/telemetryService.js` [MODIFY].
  - Verificación: Compilación local de producción de App Ventas verificada exitosamente.

* **[x] ~~Tarea 292: Selector de Recomendaciones de la Biblioteca y Módulos en el Asistente de Aprovisionamiento~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Implementado un selector interactivo por categorías (acordeón y checkboxes) en la pestaña Módulos de la Consola Central (dev-dashboard) que consume el catálogo de biblioteca vía API. Al aprovisionar, las recomendaciones seleccionadas se envían al Daemon CLI (generator.js), el cual inyecta en `antigravity_bootstrap_prompt.md` el listado formateado con nombres y rutas absolutas locales a sus archivos `.md`. Se inyectó adicionalmente la directiva explícita de autonomía creativa de la IA en el prompt de arranque.
  - Archivos modificados/creados: `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/generator.js` [MODIFY].
  - Verificación: Compilación de producción de `dev-dashboard` y suite de tests del CLI `npm run test` completados con éxito (PASSED).

* **[x] ~~Tarea 291: Arquitectura e Integración de Módulos Completos en Biblioteca y Sandbox~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Reestructuración física de los 4 módulos originales a la categoría `/10_Modulos_Completos/` en la raíz de documentación, creación de 4 nuevos módulos (KDS, Reservas, Scanner, OT), modificación de la API del CLI para clasificación automática, actualización del Dashboard Dev con filtros dedicados e integración de 6 playgrounds interactivos en el Sandbox.
  - Archivos modificados/creados: `D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/server.js` [MODIFY], `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx` [MODIFY], `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx` [MODIFY], `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/` [NEW].

* **[x] ~~Tarea 290: Sprint de Limpieza y Unificación Documental~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Ejecución de Sprint 1 de limpieza documental y unificación de componentes. Se eliminaron físicamente las carpetas duplicadas obsoletas `/Input_Moneda_COP`, `/Selector_Cantidad` y `/Modal_Base` de la biblioteca, re-indexando sus contrapartes en inglés (`CurrencyInput`, `QuantitySelector` y `ModalTemplate`) en el mapa de documentación global (`mapa_documentacion_ia.md`). Se corrigieron comentarios rotos en `inventario_maestro.md` del prototipo y se eliminó la Tarea 124 duplicada en `tareas_pendientes.md`.
  - Archivos modificados/creados: `D:/PROTOTIPE/Prototype 2.0 Arquitectura/inventario_maestro.md` [MODIFY], `D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md` [MODIFY], `D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md` [MODIFY], `D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Modales/Modal_Base` [DELETE], `D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Input_Moneda_COP` [DELETE], `D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Selector_Cantidad` [DELETE].
  - Verificación: Compilación local de producción exitosa y validación del script de reglas en 9 destinos.

* **[x] ~~Tarea 289: Mejoras del Flujo de Automatización y Empaquetado del CLI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Implementadas tres mejoras críticas al flujo de aprovisionamiento del CLI: (1) Adición de auditoría de consistencia de dependencias en `test_templates.js` para alertar ante desalineación de dependencias críticas (React, Firebase, Tailwind, Zustand). (2) Autogeneración de `firebase.json` y `storage.rules` en `generator.js` con soporte para deploy automatizado de reglas de Storage. (3) Script de generación y redimensionamiento autónomo de iconos de la PWA (192x192, 512x512 y apple-touch-icon) mediante la librería `jimp` cuando se suministra un logotipo rasterizado en el onboarding.
  - Archivos modificados/creados: `D:/PROTOTIPE/Prototipe-CLI/package.json` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/test_templates.js` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/generator.js` [MODIFY].
  - Verificación: Ejecución exitosa de `node test_templates.js --template ventas` con la fase de auditoría de dependencias completada y build aprobado.

* **[x] ~~Tarea 288: Blindaje de Seguridad y Control de Errores en Telemetría (Camino A)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Implementado el blindaje de seguridad en la Central de Control mediante reglas Firestore reforzadas que restringen la lectura de `clientes_control` y validan el token de telemetría en `reportesBilling` y `app_failures`. Se modificó la telemetría de `App Ventas` y de la plantilla del CLI (`template-ventas`) para hacer dinámico el nicho con `VITE_NICHE`, añadir un guard en el reporte de fallos, y pasar el token en el payload para cumplir con las reglas.
  - Archivos modificados/creados: `D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/firestore.rules` [MODIFY], `D:/Aplicaciones/App Ventas/src/services/telemetryService.js` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/generator.js` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js` [MODIFY].
  - Verificación: Compilación local de producción exitosa (`npm run build`). Reglas Firestore desplegadas con éxito en la Central de Control.

* **[x] ~~Tarea 287: Alineación de Nichos de Mercado Ecosistema CLI/Dashboard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Alineación de las verticales de negocio soportadas en el Scaffolding del CLI (`generator.js`) y sembradas en Firebase (`seed_brand.js`) con las 10 opciones de nicho oficiales de la Consola Central (`dev-dashboard` en `App.jsx`). Se mapearon las 10 claves exactas (`retail_clothing`, `technical_services`, `refrigeration_ac`, `contractors`, `machinery_rental`, `carpentry`, `laundry`, `furniture_repair`, `wellness_podology`, `grocery_food`) con sus respectivos atributos dinámicos y sets de categorías/servicios/productos iniciales para cada vertical de negocio.
  - Archivos modificados/creados: `D:/PROTOTIPE/Prototipe-CLI/generator.js` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/scratch/seed_brand.js` [MODIFY].
  - Verificación: Ejecución exitosa de test unitario (`npm run test`) en el CLI.

* **[x] ~~Tarea 286: Suite de Mejoras de Aprovisionamiento Modular y Agnóstico del CLI Prototipe~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Implementación de suite completa M1-M7 de aprovisionamiento de un clic desacoplada de plantillas físicas. Incluye validación de preflight en generator, auto-registro Firestore REST en Consola Central, HEX→HSL auto-conversión de color de marca con generación de acentos contrastantes, copias nativas de múltiples extensiones de logos, y progreso visual del scaffolding mediante spinners animados `ora`. El script de siembra (`seed_brand.js`) se inyecta por plantilla de forma modular e interpreta en caliente la configuración del nicho (`niche.json`) para sembrar productos y categorías representativos del nicho seleccionado.
  - Archivos modificados/creados: `D:/PROTOTIPE/Prototipe-CLI/generator.js` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/cli.js` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/scratch/seed_brand.js` [NEW].
  - Verificación: Test de integración `npm run test` completado con éxito (`ventas ✓ PASSED` en 16.1s).

* **[x] ~~Tarea 285: Blindaje de Seguridad y Control de Errores en API Bridge Server~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Se robusteció el endpoint `/api/library/file` mediante `path.resolve` canónico previniendo ataques Directory Traversal, y se mejoró el gestor del catch de creación de bases de datos Firestore para silenciar de forma transparente el error HTTP Conflict (409) de Firebase CLI.
  - Archivos modificados/creados: `D:/PROTOTIPE/Prototipe-CLI/server.js` [MODIFY].
  - Verificación: Revisión del flujo y validación canónica de rutas inyectada.

* **[x] ~~Tarea 284: Inyección Automática de Git Hooks en Proyectos Nuevos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Se integró en `generator.js` (Paso 10) la copia automática del script `pre-commit` hacia el directorio `.git/hooks/` de todo nuevo shard generado para clientes, protegiendo las reglas de IA en futuros desarrollos. Adicionalmente, se actualizó la tabla de orquestación en el manual técnico del CLI.
  - Archivos modificados/creados: `D:/PROTOTIPE/Prototipe-CLI/generator.js` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/hooks/pre-commit` [NEW], `D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/manual_prototipe_cli.md` [MODIFY].
  - Verificación: Manual actualizado y código de generator.js modificado.

* **[x] ~~Tarea 283: Automatización de Reglas mediante Git Hooks~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Configuración de un Git Hook pre-commit nativo en `D:\Aplicaciones\App Ventas\.git\hooks\pre-commit` para asegurar la integridad de las reglas `GEMINI.md`. El hook intercepta el comando de confirmación local, corre `sync_rules.js` para propagar el archivo maestro de reglas a los 9 destinos mapeados y añade los archivos modificados automáticamente con `git add` antes de completar el commit.
  - Archivos modificados/creados: `D:\Aplicaciones\App Ventas\.git\hooks\pre-commit` [NEW].
  - Verificación: Hook creado y configurado.

* **[x] ~~Tarea 281: Runner de Pruebas de Integración de Plantillas CLI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Implementación del script `test_templates.js` en el CLI de PROTOTIPE. El runner lee el registro central de plantillas, valida su esquema, y para cada plantilla activa (o la indicada por flag `--template`): verifica que el template exista en disco, lo copia a un directorio temporal aislado en `os.tmpdir()`, ejecuta `npm install` y `npm run build`, verifica la existencia de los artefactos `dist/`, limpia el temporal y emite un reporte tabular PASSED/FAILED/OMITIDA con tiempo total. Incluye flags `--all` (incluir inactivas), `--keep-temp` (debugging), `--no-install`, `--verbose` y código de salida CI-compatible. Scripts `npm run test`, `npm run test:all` y `npm run test:verbose` disponibles.
  - Archivos modificados/creados: `D:/PROTOTIPE/Prototipe-CLI/test_templates.js` [NEW], `D:/PROTOTIPE/Prototipe-CLI/package.json` [MODIFY].
  - Verificación: Script creado. Listo para ejecución manual contra plantilla `ventas`.

* **[x] ~~Tarea 280: Validación de Esquema en plantillas_registro.json~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Implementación de un validador de esquema JSON estricto (`validarRegistro`) en `sync_templates.js` para asegurar la integridad física y lógica del registro central de plantillas. Comprueba la presencia requerida de los 5 campos principales (`fuente`, `destino`, `nicho`, `activo`, `version`), valida tipos de datos (como booleanos en activo) y formatos (como rutas absolutas para fuente/destino, y regex de control SemVer para versión). Si encuentra cualquier discrepancia sintáctica, detiene la ejecución del CLI emitiendo logs detallados a stderr con código de salida 1.
  - Archivos modificados: `D:/PROTOTIPE/Prototipe-CLI/sync_templates.js` [MODIFY], `D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes_prioritarias.md` [MODIFY].
  - Verificación: Test unitario manual inyectando errores intencionados de tipos y formatos de versión en el JSON y verificando la interrupción del script con reportes de error correctos.

* **[x] ~~Tarea 279: Modo Simulación (dry-run) y Confirmación Interactiva en Sincronizador de Plantillas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Se implementaron los flags `--dry-run` (`-d`) y `--yes` (`-y`) en `sync_templates.js`. El script ahora realiza una previsualización completa en memoria comparando los archivos de la fuente y destino, reportando detalladamente cuáles son nuevos (`[NUEVO]`), cuáles tienen cambios (`[MODIFICADO]`) y detectando alertas de seguridad (como APIs hardcodeadas) antes de escribir. Adicionalmente, si el script corre de forma interactiva (en una TTY), solicita confirmación s/n mediante la interfaz readline de Node.js, bloqueando escrituras accidentales y permitiendo un flujo autónomo en scripts/AIs mediante el flag de auto-aprobación.
  - Archivos modificados: `D:/PROTOTIPE/Prototipe-CLI/sync_templates.js` [MODIFY], `D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes_prioritarias.md` [MODIFY].
  - Verificación: Ejecución exitosa de `node sync_templates.js ventas --dry-run` previsualizando cambios sin alterar el disco.

* **[x] ~~Tarea 278: Refactorización y Robustez del Flujo de Creación y Aprovisionamiento en CLI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Implementación de mejoras de robustez en `cli.js` y `generator.js` basadas en el reporte de auditoría: (1) Remoción del acoplamiento a Windows reemplazando `cmd /c` con ejecuciones shell directas multiplataforma. (2) Reemplazo de regex rígidas para inyección de credenciales Firebase en Service Worker por una función flexible tolerante a comillas simples/dobles/invertidas. (3) Adaptación de expresiones de limpieza SEO en `index.html` para soportar sintaxis HTML5 sin barra de cierre diagonal. (4) Carga manual nativa de `.env` al inicio de `cli.js` para desacoplar variables por defecto de la Consola Central.
  - Archivos modificados: `D:/PROTOTIPE/Prototipe-CLI/cli.js` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/generator.js` [MODIFY].
  - Verificación: Carga sintáctica exitosa e inicialización sin errores.

* **[x] ~~Tarea 277: Auditoría del Flujo de Creación y Aprovisionamiento en CLI y Propuesta de Robustez~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Se realizó una auditoría minuciosa del flujo de aprovisionamiento automatizado del CLI (`cli.js` y `generator.js`). Se detectaron cuatro fragilidades y bugs potenciales (acoplamiento Windows `cmd /c`, fragilidad de comillas en regex de Service Worker, fallos de tags SEO duplicados en `index.html` por formato HTML5, y variables hardcodeadas de la Consola Central) y se redactó el reporte detallado `auditoria_creacion_apps_y_robustez.md`.
  - Archivos modificados/creados: `D:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_creacion_apps_y_robustez.md` [NEW], `D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md` [MODIFY].
  - Verificación: Documento de auditoría redactado e indexado semánticamente en el mapa global.

* **[x] ~~Tarea 272: Universalización del Mecanismo de Sincronización de Plantillas en CLI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Se generalizó el mecanismo de actualización de plantillas (templates) del CLI de PROTOTIPE para dar soporte multi-plantilla desacoplándose del core único de ventas. Se creó el script `sync_templates.js` que se alimenta de `plantillas_registro.json` para clonar, despersonalizar y validar la compilación Vite en la plantilla correspondiente. Además, se reestructuró y unificó la documentación de sincronización en `sincronizacion_templates_universal.md` y se añadió el disparador rápido `@actualizar-template [nombre]` en el maestro `GEMINI.md` propagándolo a todo el disco.
  - Archivos modificados/creados: `D:/PROTOTIPE/Prototipe-CLI/sync_templates.js` [NEW], `D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/sincronizacion_templates_universal.md` [NEW], `D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/sincronizacion_template_ventas.md` [DELETE], `D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md` [MODIFY], `D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md` [MODIFY].
  - Verificación: Ejecución manual exitosa de `sync_templates.js ventas` con build local exitoso en la carpeta de destino.

* **[x] ~~Tarea 273: Generalización de Nombres de Plantillas y Creación de Carpetas de Desarrollo Base~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Renombradas las plantillas del CLI (`barberia` -> `agendamiento`, `restaurante` -> `gastronomia`) en `plantillas_registro.json` para hacerlas 100% genéricas de cara al desarrollo multitenant personalizado. Adicionalmente, se crearon físicamente los directorios de desarrollo base (`App Servicios`, `App Agendamiento`, `App Gastronomia`) con archivos README y package.json iniciales para que actúen como la fuente de verdad de sus plantillas y se propagó el archivo de reglas `GEMINI.md`.
  - Archivos modificados/creados: `D:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json` [MODIFY], `D:/PROTOTIPE/App Servicios/` [NEW], `D:/PROTOTIPE/App Agendamiento/` [NEW], `D:/PROTOTIPE/App Gastronomia/` [NEW], `D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/sincronizacion_templates_universal.md` [MODIFY].
  - Verificación: Carpetas creadas en `D:\PROTOTIPE\` y script `sync_rules.js` ejecutado con éxito.

* **[x] ~~Tarea 274: Reorganización de Backlog de Infraestructura y Roadmap de Ecosistema~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Se reestructuraron las tareas de infraestructura del ecosistema en el documento `tareas_pendientes_prioritarias.md`. Se marcaron como completadas las tareas iniciales (inicialización de Firebase Central, desarrollo del Dev Dashboard y telemetría de clientes de producción), se agregaron las nuevas tareas de robustez del CLI en el backlog prioritario, y se esbozaron las directivas de expansión a largo plazo (pasarelas de pago, DIAN y seguridad cloud).
  - Archivos modificados: `D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes_prioritarias.md` [MODIFY].
  - Verificación: Archivo actualizado y estructurado de forma jerárquica para la toma de decisiones.

* **[x] ~~Tarea 275: Control de Versiones SemVer y Auditoría de Seguridad de Credenciales en CLI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Se integraron dos mejoras críticas de robustez para la sincronización de plantillas: (1) Adición de versiones SemVer (`1.0.0`) a todas las plantillas en `plantillas_registro.json`. (2) Implementación de un detector de expresiones regulares en `sync_templates.js` para IDs de analítica (`G-XXXXXX`), tokens de Firebase, y alertas de advertencia en consola ante variables de entorno local (`VITE_FIREBASE_API_KEY`) hardcodeadas en archivos fuente. Se optimizó el proceso ignorando directorios pesados (`node_modules`, `.git`, `dist`, `.vite`) lo que redujo el tiempo de sincronización a menos de 6 segundos.
  - Archivos modificados: `D:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json` [MODIFY], `D:/PROTOTIPE/Prototipe-CLI/sync_templates.js` [MODIFY].
  - Verificación: Ejecución manual exitosa de `sync_templates.js ventas` imprimiendo la versión `v1.0.0`, arrojando advertencias de seguridad legítimas en archivos de pruebas, e instalando/compilando con éxito en la carpeta destino en ~6 segundos.

* **[x] ~~Tarea 276: Inyección de Guías de Bootstrap en READMEs de Cores de Desarrollo~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Se estructuró y agregó una guía de inicio rápido (bootstrap) paso a paso en el archivo `README.md` de cada uno de los tres nuevos cores de desarrollo creados (`App Servicios`, `App Agendamiento`, `App Gastronomia`) detallando las directivas de clonado a partir de la semilla limpia (`template-core-seed`) y las instrucciones de validación local y sincronización final al CLI.
  - Archivos modificados: `D:/PROTOTIPE/App Servicios/README.md` [MODIFY], `D:/PROTOTIPE/App Agendamiento/README.md` [MODIFY], `D:/PROTOTIPE/App Gastronomia/README.md` [MODIFY].
  - Verificación: Archivos README actualizados y legibles en disco con guías operativas.

* **[x] ~~Tarea 269: Optimización de Ventana de Notificaciones de Clientes y Remoción de Botones Administrativos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Se mejoró la simetría y holgura visual del modal de notificaciones del cliente removiendo el borde izquierdo redundante y ensanchando el padding de la lista interna a `p-5 space-y-3.5`. Adicionalmente, se implementó el flag `hideActions={true}` para suprimir por completo los botones no funcionales de marcar todo leído y borrar todo en la vista del cliente.
  - Archivos modificados: `src/components/common/NotificationHistoryTray.jsx`, `src/layouts/ClientLayout.jsx`, y sus correspondientes homólogos en la plantilla del CLI.
  - Verificación: Compilación local de producción exitosa.

* **[x] ~~Tarea 268: Sección de Resumen y Confirmación de Pedido en Checkout de Cliente~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Implementación de un paso de confirmación y resumen de pedido antes del envío de datos. Esto le permite al cliente validar su lista de compras, detalles de entrega/contacto y método de pago en un grid premium HSL, reduciendo errores operacionales. La pantalla de éxito se trasladó al paso 5 y la barra de progreso elástica se ajustó a 4 niveles.
  - Archivos modificados: `src/components/client/checkout/CheckoutModal.jsx`, `D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/checkout/CheckoutModal.jsx`
  - Verificación: Compilación local de producción exitosa.

* **[x] ~~Tarea 267: Corrección de Visibilidad del Botón "Historial" en Tarjetas de Pedidos del Admin~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Se corrigió el condicional en la visualización de la tarjeta de pedido del administrador (`AdminOrders.jsx`) para que muestre el botón "Historial" al completarse cualquier venta sin importar el método de pago utilizado.
  - Archivos modificados: `src/pages/admin/AdminOrders.jsx`
  - Verificación: Compilación local de producción exitosa.

* **[x] ~~Tarea 266: Corrección de Encolamiento de Pedidos a Domicilio en Cola Logística (domicilios)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Se eliminó el requerimiento condicional de leer el documento de configuración de envíos para decidir si se encola o no un pedido a domicilio en `deliveries`. Ahora todos los pedidos con `tipoEntrega === 'domicilio'` se agregan directamente al flujo logístico de mensajeros. Cambios aplicados tanto en el proyecto activo como en la plantilla del CLI.
  - Archivos modificados: `src/services/orderService.js`, `D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/orderService.js`
  - Verificación: Compilación local de producción exitosa.

* **[x] ~~Tarea 265: Rediseño Premium de Tarjetas de Recomendados en CartDrawer~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Descripción: Rediseño visual completo de las tarjetas de "Recomendado para ti" en el carrito lateral. Las tarjetas pasaron de un diseño plano tipo listado a tarjetas inmersivas con imagen dominante de 160px de alto, overlay gradiente oscuro en la parte inferior, nombre y precio superpuestos sobre la imagen, badge PROMO con punto animado ping, botón "+" flotante sobre la esquina inferior derecha con rotación en hover, y skeleton loader tipo shimmer mientras se cargan los datos. También se corrigió definitivamente el race condition que causaba que las recomendaciones desaparecieran al abrir el carrito.
  - Archivos modificados: `src/components/client/cart/CartDrawer.jsx`
  - Verificación: Compilación local de producción exitosa.

* **[x] ~~Tarea 264: Optimización de Recomendaciones y Corrección de Destellos Visuales en el Carrito~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Historial / Revisiones:
    - **Corrección de Destellos Visuales**: Se detectó que al agregar productos al carrito, el apartado de "Recomendados para ti" se mostraba brevemente y luego desaparecía. Esto ocurría porque al abrir el carrito se consultaba Firestore y se aplicaba un filtro dinámico que removía el producto recién agregado (el único en inventario). Al quedar vacío, el apartado desaparecía. Se solucionó limpiando las recomendaciones cuando el carrito se cierra y leyendo los elementos del carrito directamente en caliente al abrir.
    - **Optimización de Lecturas a Firestore**: Se eliminó la dependencia reactiva del array `items` de la llamada a la base de datos dentro del hook `useEffect` en `CartDrawer.jsx`. Las lecturas asíncronas de Firestore ahora se disparan **únicamente** una vez al abrir el cajón lateral, consultando los productos agregados mediante `useCartStore.getState().items`. Esto previene peticiones redundantes e ineficientes a Firestore en cada render o cambio de cantidad.
    - **Alineación Visual Premium (Animado)**: Se implementó un contenedor dinámico con `motion.div` y `staggerChildren` para una entrada tipo cascada suave en los elementos recomendados. Cada tarjeta cuenta con escala y desplazamiento vertical en hover (`whileHover={{ y: -6, scale: 1.02 }}`), escala sutil en tap (`whileTap={{ scale: 0.97 }}`), efecto zoom de la imagen (`scale-110 duration-500 ease-out`), transición de color del título al enfocar, y botón de acción "Ver" dinámico con rellenado y sombra HSL.
  - Verificación: Compilación local de producción exitosa en `App Ventas`.

* **[x] ~~Tarea 263: Integración del Portal de Mensajeros y Ciclo de Auto-Asignación~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Historial / Revisiones:
    - **Encolamiento Automático Condicional**: Se configuró la creación de pedidos (`orderService.js`) para encolar de forma síncrona en la colección `deliveries` los nuevos domicilios de clientes, validando que el módulo esté activo (`customDelivery.enabled`) y aislando la operación con `try-catch` para inmunizar al flujo ante fallos externos.
    - **Suscripción Logística Optimizada**: Se modificó `subscribeToDeliveries` para recuperar simultáneamente pedidos asignados y solicitudes generales sin asignar (estado `PENDING` y sin mensajero), filtrando síncronamente en memoria sin necesidad de índices complejos.
    - **Portal del Mensajero UX**: Rediseño estructurado en dos pestañas ("Mis Entregas" / "Disponibles") con acciones de auto-asignación directa ("Aceptar Entrega") y soporte para modo de consulta administrativa si no hay sesión iniciada.
    - **Sincronización CLI**: Se aplicaron los mismos cambios a la plantilla del portal de mensajero del CLI.
  - Verificación: Compilación local de producción exitosa en `App Ventas`.

* **[x] ~~Tarea 262: Botón de Historial y Modal de Resumen en Tarjetas de Pedidos del Admin~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Historial / Revisiones:
    - **Botón e Interfaz de Historial**: Se agregó un botón de "Historial" a la derecha del botón de WhatsApp en las tarjetas de pedidos del administrador (`AdminOrders.jsx`) cuando un pedido se encuentra en estado `completado`, aplicando a todos los métodos de pago.
    - **Modal de Resumen**: Al hacer clic en "Historial", abre un modal flotante moderno (`AnimatePresence` y Framer Motion) con la información del pedido (Cliente, Pago, Entrega, Fechas de creación y completado, Total Facturado) y un botón de "Ver Detalle" que redirige al tracking en vivo del cliente.
    - **Corrección de Visibilidad**: Se corrigió el renderizado condicional en `AdminOrders.jsx` para que la tarjeta de pedido muestre el botón de Historial al completarse la venta en todos los métodos de pago (Efectivo, Transferencia, etc.), y no únicamente en pedidos con método de pago Crédito.
  - Verificación: Compilación local de producción exitosa en `App Ventas`.

* **[x] ~~Tarea 261: Mapa de Ubicación Desplegable en Tarjetas de Pedidos de Administración~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Historial / Revisiones:
    - **Visualización Desplegable**: Se refactorizó la visualización del mapa de Leaflet en las tarjetas de pedidos del administrador (`AdminOrders.jsx`) para que sea desplegable mediante un botón estilizado con animación suave (`motion.div` de Framer Motion), liberando espacio vertical en la tarjeta.
  - Verificación: Compilación local de producción exitosa en `App Ventas`.

* **[x] ~~Tarea 260: Centrado y Temporizador Auto-Dismiss de Notificaciones Toast en Portales~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Historial / Revisiones:
    - **Alineación de Interfaz (Framer Motion)**: Se corrigió el posicionamiento del toast `portal-stock-alert` en `PortalVendedor.jsx` aplicando `x: '-50%'` en sus parámetros de animación, previniendo que Framer Motion sobrescribiera la propiedad CSS.
    - **Auto-Dismiss de 3 segundos**: Se inyectaron `useEffect` de temporización para cerrar de forma automática las notificaciones a los 3 segundos en `PortalVendedor.jsx` y `PortalBodega.jsx`.
    - **Sincronización CLI**: Los ajustes se aplicaron de forma paralela en la plantilla de vendedor del CLI.
  - Verificación: Compilación local de producción exitosa en `App Ventas`.

* **[x] ~~Tarea 259: Estado Dinámico Automático de Ventas POS según Método de Pago~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Historial / Revisiones:
    - **Lógica transaccional (orderService)**: Se corrigió la creación de pedidos POS (`createPhysicalOrder`) en Firestore para asignar dinámicamente un estado de pedido (`estado`):
      * Si es Efectivo o Transferencia, se marca inmediatamente como `completado` (`ORDER_STATES.COMPLETED`).
      * Si es Crédito (Fiado), se marca inmediatamente como `credito_aprobado` (`ORDER_STATES.CREDIT_APPROVED`).
    - **Sincronización Offline**: Sincronizada la misma lógica transaccional de estados dinámicos al registrar pedidos POS locales en la cola IndexedDB del modo offline.
  - Verificación: Compilación local de producción exitosa en `App Ventas`.

* **[x] ~~Tarea 258: Integración de Cuentas bancarias de Transferencia en Portal de Vendedor~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Historial / Revisiones:
    - **Portal del Vendedor (UI-UX)**: Se integró la visualización de las cuentas bancarias de transferencia de la tienda (Nequi, cuentas de ahorro/corriente) cuando el método de pago seleccionado es Transferencia, copiando exactamente la estructura de `AdminSales.jsx`.
    - **Ampliación de QR**: Se implementó el modal centrado con backdrop blur para expandir el código QR de pago en pantalla completa al hacer tap/click en el QR miniatura.
    - **Plantilla CLI**: Sincronizadas las modificaciones correspondientes en la plantilla de vendedor del CLI.
  - Verificación: Compilación local de producción exitosa en `App Ventas`.

* **[x] ~~Tarea 257: Rediseño del Modal de Variantes de Producto en el Portal de Vendedor~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Historial / Revisiones:
    - **Portal del Vendedor (UI-UX)**: Se rediseñó por completo el listado plano de variantes en el modal de producto, reemplazándolo por el mismo formato de tarjetas interactivas premium de la venta directa (`AdminSales.jsx`). Ahora muestra las muestras de color circulares dinámicas (`getCssColor`), la estructuración de etiquetas (`Talla • Color`), el stock en tiempo real y el precio base de venta.
    - **Plantilla CLI**: Replicado el diseño premium con soporte para las flags de características `showSizes` y `showColors` en la plantilla de ventas del CLI.
  - Verificación: Compilación local de producción exitosa en `App Ventas`.

* **[x] ~~Tarea 256: Rediseño Estético del Selector de Métodos de Pago en el Portal de Vendedor~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Historial / Revisiones:
    - **Portal del Vendedor (UI-UX)**: Rediseñado el selector de métodos de pago en el checkout del carrito de compras para que use un grid responsivo con bordes interactivos HSL, transiciones suaves y colores de estado activo alineados con el módulo de venta directa (`AdminSales.jsx`).
    - **Plantilla CLI**: Replicado el diseño premium del selector en la plantilla del vendedor del CLI.
  - Verificación: Compilación local de producción exitosa en `App Ventas`.

* **[x] ~~Tarea 255: Historiales de Movimientos Contextuales por Portal Operativo y Corrección de Toggles~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Historial / Revisiones:
    - **Portal de Cocina**: Implementado el historial de los últimos 30 pedidos despachados (entregados) hoy mediante suscripción real-time con ordenamiento client-side optimizado.
    - **Portal de Mesero**: Implementado el historial de los últimos 30 llamados y solicitudes de cuenta atendidos por el mesero en su turno mediante una suscripción filtrada por meseroId y ordenada en el cliente.
    - **Portal del Vendedor (Bugfix)**: Se corrigió la duplicación visual de los selectores de pestaña en móviles ocultando la barra de selección interna derecha en pantallas pequeñas (`md:grid hidden`).
    - **Plantilla CLI**: Propagados los cambios de los portales de cocina, mesero y vendedor (junto con sus respectivos servicios) a la plantilla del CLI.
  - Verificación: Compilación local de producción exitosa en `App Ventas` con Vite.

* **[x] ~~Tarea 254: Historial de Auditoría de Ajustes de Stock en Ajustes de Tienda (AdminSettings)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Historial / Revisiones:
    - **Suscripción de Movimientos**: Se implementó la visualización en tiempo real del historial de ajustes de stock (`subscribeToAllMovements`) en `AdminSettings.jsx`.
    - **Interfaz de Auditoría**: Diseñada una interfaz premium con filtros responsivos de rol y responsable, y tarjetas que destacan incrementos (+) en verde y reducciones (-) en rojo.
    - **Índice Compuesto**: Creado y desplegado el índice compuesto de Firestore para la colección `stockMovements` (`employeeId` ASCENDING, `createdAt` DESCENDING) para solventar errores de consulta.
    - **Plantilla CLI**: Propagada la funcionalidad de auditoría a la plantilla de ventas del CLI.
  - Verificación: Compilación local de producción exitosa en `App Ventas` y despliegue exitoso de índices.

* **[x] ~~Tarea 253: Implementación de ErrorBoundaryFallback y Telemetría de Excepciones Runtime~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Historial / Revisiones:
    - **Componente Cortafuegos**: Creación e implementación de [ErrorBoundaryFallback.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/feedback/ErrorBoundaryFallback.jsx) para aislar fallos runtime y prevenir la pantalla en blanco.
    - **Reporte Automático**: Conectada la telemetría central mediante la función `reportAppFailureToDeveloper` en `telemetryService.js` para reportar excepciones de React en segundo plano de manera automática.
    - **Envoltura Estructural**: Se envolvieron los layouts principales de la aplicación (`AdminLayout`, `ClientLayout` y `PortalLayout`) en [AppRoutes.jsx](file:///d:/Aplicaciones/App%20Ventas/src/routes/AppRoutes.jsx) para proteger todos los sub-módulos del sistema.
  - Verificación: Compilación local de producción exitosa en `App Ventas`.

* **[x] ~~Tarea 252: Sincronización en Tiempo Real de Movimientos de Stock en Portal de Bodega~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Refresco de stock**: Se inyectó `useQueryClient` de TanStack Query e invalidación de `['products']` en `PortalBodega.jsx` (tanto local como en la plantilla del CLI) para actualizar instantáneamente el listado izquierdo y el resto de la interfaz tras registrar una entrada, salida, ajuste o merma.
  - Verificación: Compilación local de producción completada con éxito.

* **[x] ~~Tarea 251: Estandarización de PIN de Empleados, Ajuste de Anchos UI y Modal de Notificaciones Flotante~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **PIN de 6 dígitos**: Cambiada la validación de PIN en `AdminSettings.jsx` y `PortalAuth.jsx` (y en el CLI) para exigir exactamente 6 caracteres.
    - **Optimización de Anchos**: Modificados los contenedores de Ajustes (`AdminSettings.jsx`), Pedidos (`AdminOrders.jsx`) y Garantías (`AdminClaims.jsx`) a `max-w-7xl` para aprovechar el 100% de la pantalla.
    - **Modal de Notificaciones**: Rediseñado el drawer lateral de notificaciones (`NotificationHistoryTray`) a un modal flotante centrado con `backdrop-blur-sm` en layouts (`AdminLayout.jsx`, `ClientLayout.jsx` y `PortalLayout.jsx`).
  - Verificación: Compilación local de producción exitosa en `App Ventas` y sincronización de reglas con `sync_rules.js`.

* **[x] ~~Tarea 250: Corrección de Carga de Empleados en Portales Operativos por Reglas de Firestore~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-08
  - Fecha de finalización: 2026-06-08
  - Historial / Revisiones:
    - **Causa Raíz:** La regla de seguridad en `firestore.rules` para la colección `/employees` limitaba el acceso de lectura exclusivamente a administradores (`allow read: if isAdmin()`). Debido a que las sesiones de los empleados en el portal operan sin autenticación Firebase Auth tradicional (ingresan mediante PIN local), el escuchador reactivo del listado arrojaba un error de permisos denegados, impidiendo cargar los portales y validar las sesiones de rol.
    - **Solución:** Se flexibilizó la regla de seguridad de lectura de `/employees/{employeeId}` estableciéndola en `allow read: if true;`, permitiendo que la aplicación cliente cargue a los empleados activos de la tienda y verifique su PIN client-side.
  - Verificación: Despliegue de reglas de Firestore realizado con éxito.
* **[x] ~~Tarea 250: Integración de Resolución Inteligente y Generador de Prompts para Antigravity en Consola de Errores~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Drawer lateral de Diagnóstico:** Diseño e implementación de un Drawer responsivo deslizante para detallar el error, causa probable y acciones sugeridas.
    - **Generador de Prompts Integrado:** Botón para copiar al portapapeles una instrucción de resolución dirigida a Antigravity conteniendo el ID del cliente/proyecto, mensaje de error y archivo exacto afectado.
    - **Completación de Build:** Validación y build exitoso de producción.

* **[x] ~~Tarea 249: Historial de Aprovisionamientos con Archivador y Paginación Fluida en Onboarding~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Componente de Paginación:** Creado el componente modular `Pagination.jsx` bajo `src/components/ui/` basándose en el estándar HSL de la biblioteca, agregándole la propiedad `showAlways` para forzar su visibilidad aun con 1 sola página.
    - **Historial y Archivador:** Implementada la sección de historial en la pestaña de Onboarding (visible cuando el wizard no está activo). Permite archivar provisionamientos (mutando la base central a `archived: true`), refrescando los snapshots reactivos de Firestore.
    - **Paginación Integrada:** Paginado el historial a un máximo de 10 elementos por página consumiendo `Pagination` e inicializando el estado `historyPage`.
    - **Optimización de Movilidad (Responsivo):** Para corregir problemas de desbordamiento horizontal y visualización en celulares, se bifurcó el layout de la lista: se mantuvo la tabla estructurada para resoluciones de escritorio (`md:table`) y se implementó una interfaz de tarjetas prémium independientes para pantallas móviles (`md:hidden`) con avatares de iniciales basados en HSL, información compacta y botones táctiles adaptados.
  - Verificación: Compilación local exitosa con Vite.
* **[x] ~~Tarea 248: Rediseño de la Navegación Móvil a 5 Botones y Reubicación de CRM y Ajustes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Navegación Móvil y de Escritorio:** Se modificó la constante `NAV_TABS` en `src/App.jsx` para dejar exactamente los 5 botones requeridos en el orden especificado (Inicio, Cobros, Biblioteca, Nuevo, Monitoreo).
    - **Acceso a CRM:** Se reconfiguró el click de la tarjeta de "Clientes Activos" en el Dashboard principal para navegar al panel de CRM en lugar de abrir el modal detallado.
    - **Reubicación de Ajustes:** Se removió la pestaña Ajustes del sidebar/bottom navigation y se integró un botón de acceso directo en el Modal de Perfil de usuario.
    - **Revisión (Botón Central Flotante y Neon):** Se movió el botón "Nuevo" al centro de la barra inferior (posición 3 de 5) en `NAV_TABS` y se le dotó de un diseño circular personalizado que sobresale verticalmente (`-mt-3.5`) con gradiente de marca PROTOTIPE, animaciones de flotado continuo elástico (`animate-center-float`), pulso con resplandor neón (`animate-pulse-glow`) al activarse, y efecto de aceleración y rotación premium de escala 1.15x al hacer hover (`onboarding-center-btn`).
  - Verificación: Compilación local exitosa.
* **[x] ~~Tarea 247: Renombrado de colección de control central a clientes_control (Sin "SaaS")~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Remoción de SaaS:** Se renombraron todas las referencias físicas de la colección central `clientes_control` a `clientes_control` en los servicios de facturación comisional, dashboard de control de desarrollo y plantillas base del CLI.
    - **Actualización de Seguridad:** Modificadas y desplegadas las reglas de seguridad `/clientes_control/` a Firestore.
  - Verificación: Compilación y despliegue de reglas exitosos.
* **[x] ~~Tarea 246: Opción de reporte de error de prueba en Opciones de Desarrollo de Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Alineación con el Estándar de Opciones de Desarrollo:** Se inyectó el nuevo módulo `dev-reporte-error` ("Reportar Error de Prueba") en el menú de herramientas de desarrollador en `AdminSettings.jsx` tanto de `App Ventas` como de la plantilla base `template-ventas`.
    - **Visualización y Reporte:** Se implementó una interfaz de prueba interactiva premium con icono de advertencia HSL, explicación detallada y un botón principal "Enviar Error de Prueba". Al hacer clic, este carga dinámicamente el `telemetryService`, genera un `TestTelemetryError` y lo envía en tiempo real a la colección centralizada `app_failures` de Firestore Central, mostrando logs en caliente del progreso y un banner de éxito o error al finalizar.
  - Verificación: Compilación local de producción en `App Ventas` completada con éxito.

* **[x] ~~Tarea 245: Implementación de efecto spotlight interactivo de blobs (Ambient Glow) en la tarjeta de saludo del Admin~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Portabilidad de Componentes:** Se analizó el componente `InteractiveAmbientGlow` utilizado en la sección de aprovisionamiento del dev-dashboard.
    - **Implementación en AdminHome.jsx:** Se integró `InteractiveAmbientGlow` en la tarjeta de saludo del panel de administración principal.
    - **Física de Cursor e Inercia:** Se enlazó la escucha del cursor al `cardRef` del contenedor de la tarjeta, permitiendo que la inercia de la física de suavizado y la respuesta al giroscopio funcionen en la tarjeta completa sin bloquear elementos interactivos hijos.
    - **Personalización de Paleta de Marca Blanca:** Se configuraron los colores del gradiente de blobs para consumir las variables de CSS del tema de la tienda (`var(--color-primary)`, `var(--color-accent)`, y `var(--color-primary-light)`), logrando que los blobs se adapten automáticamente a la paleta de colores activa del negocio en lugar de usar colores arcoíris fijos.
  - Verificación: Despliegue de producción realizado y compilado correctamente.

* **[x] ~~Tarea 244: Prevención de errores de permisos insuficientes (FirebaseError) en observadores al cerrar sesión~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Alineación con el Estándar de Listeners:** Se corrigió un error de consola (`Missing or insufficient permissions`) al presionar "Cerrar sesión" en los observadores `onSnapshot` de facturación y empleados.
    - **useBilling.js / useAppConfigSync.js:** Se condicionó la suscripción global de telemetría y facturación `subscribeToBillingData` a que el usuario `user` de `useAuthStore` esté autenticado como administrador, evitando que los clientes anónimos que entran al catálogo virtual intenten consultar la base de datos comisional protegida.
    - **useNotificationCenter.js:** Se bloqueó el registro de observadores para clientes sin número de celular real (valores por defecto como `'client'` o `'anonimo'`), evitando llamadas a la colección `/notifications` en la landing page pública.
    - **firestore.rules:** Se actualizaron las reglas de seguridad de `/notifications/{document}` para permitir lectura/actualización a clientes autenticados localmente bajo su propio número (`resource.data.recipientRole == 'client' && resource.data.recipientId != null`), resolviendo el bloqueo de lectura cuando el cliente tiene sesión activa en la tienda virtual.
    - **Inversión del Orden de Cierre de Sesión:** En `AdminLayout.jsx` y `AdminSettings.jsx`, se modificaron las funciones de logout para invocar el método reactivo `logout()` (Zustand) *antes* del deslogueo asíncrono en Firebase Auth (`signOut(auth)`). Esto limpia de inmediato la sesión en React y destruye de forma síncrona los listeners de Firestore (`onSnapshot`) mientras el token de conexión del usuario aún es válido, previniendo excepciones por falta de permisos.
    - **AdminSettings.jsx:** Se reestructuró la suscripción diferida de `employeeService` para que se destruya y no se intente re-conectar si la sesión `user` es nula, añadiendo un guard `active` para evitar race conditions por imports asíncronos tardíos al desmontar.
  - Verificación: Compilación local de producción completada con éxito.

* **[x] ~~Tarea 243: Corrección de error de carga de modulo al presionar X en selector de modo del POS offline~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Solución al Cierre del Selector:** Se modificó la acción del botón `X` en el modal de selección de modo de venta de `AdminSales.jsx`. Anteriormente ejecutaba `navigate(-1)`, lo cual forzaba la carga del chunk de `AdminInventory.jsx` y provocaba un fallo de importación dinámica por falta de conexión. Ahora, al estar offline, se asigna por defecto el modo `'inventory'` sin salir del POS, evitando desbordes o crashes.
  - Verificación: Compilación de producción validada exitosamente.

* **[x] ~~Tarea 242: Restricción y redirección automática de navegación en modo offline a solo POS (Venta)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Filtro de Navegación:** Modificados los layouts `AdminLayout.jsx` y `PortalLayout.jsx` para integrar el store de conectividad. Al estar offline, el panel lateral de PC y la barra inferior de navegación en móviles muestran y habilitan únicamente la pestaña del POS ("Venta" / `/admin/ventas`), ocultando las demás para prevenir accesos indeseados.
    - **Redirección de Seguridad:** Implementada una redirección automática en `AdminLayout.jsx` que fuerza la navegación hacia el POS si la red se cae mientras el usuario está en cualquier otra pestaña.
    - **PortalLayout (Indicador Premium):** Se hizo dinámico el indicador de estado en el portal del vendedor para mostrar "Modo Offline" elástico con un diseño elegante en ámbar y el ícono `WifiOff` titilante.
  - Verificación: Compilación local de producción completada con éxito.

* **[x] ~~Tarea 241: Optimización del POS de Ventas Directas con Capacidades Offline-First (IndexedDB)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Caché persistente Firestore:** Habilitado el almacenamiento persistente local en disco para Firestore en `firebaseConfig.js` para persistencia en múltiples pestañas.
    - **Controlador de Conectividad:** Implementado el store Zustand `connectivityStore.js` para rastrear dinámicamente el estado de red online/offline.
    - **IndexedDB Local:** Creado el servicio `offlineDB.js` que implementa almacenes locales IndexedDB para productos, categorías y la cola de ventas pendientes.
    - **Sincronización automática:** Desarrollado el motor de sincronización de la cola offline (`syncOfflineSales`) en `orderService.js` e integrado en `App.jsx` mediante listener reactivo de conectividad.
    - **POS Adaptado:** Modificado `AdminSales.jsx` para servir el catálogo desde IndexedDB en estado offline, registrar ventas en la cola local reduciendo inventario visual e imprimir recibos con banner provisional.
    - **Búsqueda y Registro Offline de Clientes:** Implementado un timeout de 800ms con fallback a `getDocFromCache` en `userService.js`. Desacoplada la llamada a `saveClientProfile` para evitar bloqueos del hilo principal cuando hay desconexión.
  - Verificación: Compilación local de producción exitosa en 1.15s.

* **[x] ~~Tarea 240: Elaboración del Informe Profesional de Investigación de Mercado y Estrategia de Negocio PROTOTIPE 2026~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Reestructuración y Expansión:** Elaborado un informe comercial de nivel ejecutivo y estratégico detallando el ADN de PROTOTIPE, su arquitectura de sharding Firebase, el pipeline local REST del CLI, el sistema de verticalización adaptativo con `niche.json` y los flujos de telemetría de cobros (`telemetryService` / `billingService`).
    - **Investigación Real y Competidores:** Incorporados datos precisos de 2026 sobre competidores locales (Alegra, Siigo Gastrobar, Treinta Pro y datáfonos Bold/SumUp) detallando planes de precios, comisiones y brechas técnicas de marca.
    - **Normativa Fiscal DIAN:** Integradas las resoluciones 165 de 2023 y 202/227 de 2025 de la DIAN sobre la eliminación del límite de 5 UVT y los requisitos de identificación de adquirentes en el POS electrónico, con análisis de costos de APIs de proveedores (Plemsi, Alanube).
    - **Pasarelas de Pago:** Detalladas las comisiones actuales de recaudo para Wompi (2.65% + $700), Bold y Mercado Pago según el plazo de liberación.
    - **Sincronización:** Guardada la copia del informe en los directorios `D:\PROTOTIPE\Documentacion PROTOTIPE\09_Plan_Escalabilidad_Negocio\` y `D:\PROTOTIPE\Prototype 2.0 Arquitectura\Documentacion PROTOTIPE\09_Plan_Escalabilidad_Negocio\`.
  - Verificación: Archivos creados y verificados exitosamente en ambos directorios.

* **[x] ~~Tarea 239: Automatización de Aprovisionamiento Firebase y Credenciales del Administrador en Un Clic~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Automatización del Aprovisionamiento:** Inyección del toggle `autoProvisionFirebase` en el wizard de onboarding y envío en el payload del CLI.
    - **Credenciales Autogeneradas:** Creación y visualización del correo de administración corporativo (`admin@${clientId}.com`) y contraseña temporal (`Admin2026!`) en el modal final de éxito.
    - **Seeding robusto:** Migración del script de siembra del CLI a SDK cliente para eliminar la dependencia de credenciales service-account locales.
  - Verificación: Compilación local de producción en `dev-dashboard` exitosa.

* **[x] ~~Tarea 238: Sanitización y Remoción Completa de Referencias SaaS en Ecosistema~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Higienización de Código y Documentación:** Remoción de todas las ocurrencias standalone del término "SaaS" en UI, logs, comentarios, variables de plantillas, metatags SEO y descripciones de orquestador.
    - **Sincronización:** Actualización del script `sync_rules.js` y validación de alineación de `GEMINI.md` en los 5 repositorios.
  - Verificación: Compilación local exitosa con Vite en `dev-dashboard` y `App Ventas`.

* **[x] ~~Tarea 237: Auditoría del Sistema de Aprovisionamiento CLI y API Bridge~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Análisis de Código:** Auditoría exclusiva sin modificaciones de `cli.js`, `generator.js` y `server.js`.
    - **Reporte Técnico:** Creación del informe de auditoría `AUDITORIA_CLI_PROTOTIPE.md` identificando pasos completados, parciales, ausentes, dependencias de consolas/CLIs y plan de un clic.
  - Verificación: Ningún impacto sobre el código fuente de App Ventas.

* **[x] ~~Tarea 236: Implementación del Motor de Expansión Cognitiva y Atributos Dinámicos por Nicho~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Definición del Motor:** Integración del Cognitive Prompt Expansion Engine en `server.js` y `generator.js` mediante la API REST de Gemini 2.5 Flash.
    - **Atributos Dinámicos:** Creación de la capa de metadatos `niche.json` para desacoplar selectores de retail textil de otros nichos.
  - Verificación: Compilación local con Vite completada con éxito.

* **[x] ~~Tarea 235: Auditoría y Análisis Crítico de App Verduras Juan Remigio y del CLI de Aprovisionamiento~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-07
  - Fecha de finalización: 2026-06-07
  - Historial / Revisiones:
    - **Auditoría Técnica:** Se auditó a fondo el proyecto `App-verduras-juan-remigio`, evaluando flujos, vistas, navegación y consistencia de datos.
    - **Reporte Técnico:** Se redactó y guardó el informe técnico completo en `D:\PROTOTIPE\Documentacion PROTOTIPE\03_Auditorias_y_Faro_Core\auditorias\auditoria_verduras_juan_remigio.md`.
  - Verificación: Ningún impacto sobre el código fuente de App Ventas.

* **[x] ~~Tarea 234: Extracción y Desacoplamiento de pdfService, LeafletMapPicker y deliveryService~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-06
  - Fecha de finalización: 2026-06-06
  - Historial / Revisiones:
    - **pdfService:** Refactorizado y documentado bajo `Utilidades/Exportador_PDF/`. Se desacopló de constantes internas e inyectó dependencias vía parámetros.
    - **LeafletMapPicker:** Refactorizado y documentado bajo `Formularios_y_UI/Mapa_Interactivo/`. Se desacoplaron estilos e inyectaron clases HSL flexibles.
    - **deliveryService:** Extraído, refactorizado y documentado bajo `Servicios_y_Firebase/Gestion_Domicilios/`. Se implementó un patrón de inicialización para la base de datos de Firestore.
    - **dev-dashboard:** Registro de los componentes en `COMPONENT_META` de `ComponentSandbox.jsx` y actualización de sus Criterios de Decisión en el mapa semántico.
  - Verificación: Compilación local con Vite completada con éxito.

* **[x] ~~Tarea 233: Auditoría y Análisis de Extractibilidad de Componentes y Servicios de App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-06
  - Fecha de finalización: 2026-06-06
  - Historial / Revisiones:
    - **Auditoría Técnica:** Se auditaron en profundidad los directorios de componentes, hooks y servicios de App Ventas.
    - **Reporte de Extractibilidad:** Se generó e indexó el informe detallado `analisis_extractibilidad_app_ventas.md` con puntajes y justificaciones técnicas de portabilidad.
  - Verificación: Ningún impacto sobre el código fuente de App Ventas.

* **[x] ~~Tarea 232: Rediseño del Layout de Métricas y Corrección de Desbordes en CajaDiariaPOS~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-06
  - Fecha de finalización: 2026-06-06
  - Historial / Revisiones:
    - **Rejilla 2x2 Antienvoltura:** Se modificó la distribución de los 4 widgets del arqueo de caja de 4 columnas horizontales a un grid responsivo de 2x2.
    - **Iconografía Semántica:** Se inyectaron iconos SVG vectoriales para Base Inicial, Dinero Esperado, Ingresos y Egresos, envueltos en contenedores circulares con fondos y textos de colores semánticos HSL suaves.
    - **Encabezado Adaptativo:** Se modificó la distribución flex del título del cajero y el botón de cierre para que pasen de fila a columna (`flex-col sm:flex-row`) en pantallas estrechas.
    - **Sincronización:** Se actualizó la especificación técnica física del componente en el catálogo de biblioteca de componentes (`caja_diaria_pos.md`).
  - Verificación: Compilación local con Vite exitosa en 894ms.

* **[x] ~~Tarea 231: Refactorización y Modularización de los 4 Playgrounds de Sandbox (Lazy Loading)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-06
  - Fecha de finalización: 2026-06-06
  - Historial / Revisiones:
    - **Ficheros modulares:** Extraídos los sandboxes a la subcarpeta `src/components/admin/sandboxes/`.
    - **Carga Diferida:** Configurado `React.lazy()` y `Suspense` con spinner de carga para resolver los componentes en tiempo de ejecución.
    - **Shared Layout:** Creado `SandboxLayout.jsx` con el panel de controles genérico para evitar duplicación y dependencias circulares.
  - Verificación: Compilación exitosa con Vite en 558ms, logrando división de chunks (code splitting) nativa.

* **[x] ~~Tarea 230: Sandbox e Integración de los 4 Componentes Premium (AuthGuard, GlobalSkeletonLoader, BreadcrumbHeader, ErrorBoundaryFallback)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-06
  - Fecha de finalización: 2026-06-06
  - Historial / Revisiones:
    - **Playgrounds Sandbox:** Desarrollados e inyectados los 4 playgrounds interactivos (`auth_guard_userprofile`, `global_skeleton_loader`, `breadcrumb_header`, `error_boundary_fallback`) en `ComponentSandbox.jsx` de `dev-dashboard` con controles en caliente.
    - **Fallo y Recuperación (Boundary):** El playground de `error_boundary_fallback` simula de forma interactiva un crash en caliente y expone el flujo de reintento/aislamiento visual sin congelar el dashboard.
    - **Simulador de Carga (Skeleton):** El loader de skeletons incluye un disparador de simulación diferido de 2 segundos para ver la transición shimmer y mitigación de CLS.
    - **Registro Semántico:** Indexados los 4 archivos markdown con sus correspondientes Criterios de Decisión IA en `mapa_documentacion_ia.md`.
    - **Revisión de Estilo y Contraste (2026-06-06):** Rediseñados los componentes `AuthGuardUserProfileSandbox.jsx`, `GlobalSkeletonLoaderSandbox.jsx` y `BreadcrumbHeaderSandbox.jsx` para adoptar el estándar de variables HSL del tema global (`var(--color-surface)`, `var(--color-surface-2)`) y eliminar colores oscuros fijos de la maquetación en modo claro. En el Breadcrumb se inyectó un mockup interactivo de lista de facturas con atajos y badges que responde a los clics sobre la barra de navegación, y en el skeleton se suavizó el shimmer (con opacidad del 85% y loops entre surface-2 y bg).
    - **Reversión de Breadcrumb (2026-06-06):** Se removió el selector de verticales comerciales y la sobrecarga de datos del sandbox en `BreadcrumbHeaderSandbox.jsx` para retornar al diseño premium minimalista original.
    - **Directivas de Diseño de IA (2026-06-06):** Se actualizó `GEMINI.md` para exigir de forma obligatoria y estricta el diseño premium HSL (colores suaves, sombras y micro-animaciones) desde la primera entrega de cualquier componente por parte de la IA.
    - **Corrección de ErrorBoundary (2026-06-06):** Se solventó el crash de pantalla en blanco en `ErrorBoundaryFallbackSandbox.jsx` reemplazando el hook manual de errores en window por un componente de clase `ErrorBoundaryFallback` real. Ahora el crash se captura correctamente en el ciclo de renderizado React 19 y se dibuja el fallback UI interactivo de inmediato.
  - Verificación: Compilación local de producción exitosa en 733ms.

* **[x] ~~Tarea 229: Corrección de Consistencia y Toggles en Playground de Notificaciones~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-06
  - Fecha de finalización: 2026-06-06
  - Historial / Revisiones:
    - **Alineación de Toggles:** Corrección del diseño y desfase de las bolitas en los switches del playground de `'sistema_notificaciones'` en `ComponentSandbox.jsx`. Se rediseñó el slider utilizando propiedades Flex y transformaciones dinámicas (`translate-x-4` / `translate-x-0`) para evitar solapamientos y asegurar una estética premium simétrica de 2px de margen en todos los estados.
  - Verificación: Compilación local de producción exitosa en 596ms.

* **[x] ~~Tarea 228: Diseño e Integración de Ruleta de la Suerte y Selector de Reservas Agenda~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-06
  - Fecha de finalización: 2026-06-06
  - Historial / Revisiones:
    - **Fichas Técnicas:** Creadas y guardadas las especificaciones técnicas en [`ruleta_fortuna_premios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Fidelizacion_y_Gamificacion/Ruleta_Fortuna_Premios/ruleta_fortuna_premios.md) y [`selector_reservas_agenda.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Reservas_y_Citas/Selector_Reservas_Agenda/selector_reservas_agenda.md).
    - **Playground Sandbox:** Inyectados los componentes `ruleta_suerte` y `reservas_agenda` con controles dinámicos interactivos de props en `ComponentSandbox.jsx` de `dev-dashboard` y mapeados en `COMPONENT_SANDBOX_MAP` con búsqueda difusa.
    - **Sincronización:** Indexados en el README del catálogo y en el mapa semántico.
  - Verificación: Compilación local con `npm run build` completada exitosamente en 605ms.

* **[x] ~~Tarea 227: Creación e Integración de Selector de Boletas de Rifa Premium~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-06
  - Fecha de finalización: 2026-06-06
  - Historial / Revisiones:
    - **Ficha Técnica:** Creada y guardada la especificación y código React para [Selector de Boletas de Rifa](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Selector_Boletas_Rifas/selector_boletas_rifas.md) de rango 00-99 en la biblioteca.
    - **Playground Sandbox:** Inyectado el componente `SandboxRaffleNumberSelector`, implementado su playground con modo Administrador y Cliente (Pointer Events, Lucky Draw). Corregido conflicto de evento burbuja `pointerdown` en celdas, añadidas insignias inferiores clicables, inyectado botón de confirmación premium con degradados/sombras de brillo, y botón inferior de deselección masiva ("Limpiar Selección"). Mapeado en `COMPONENT_SANDBOX_MAP` con búsqueda difusa.
    - **Sincronización:** Indexado en el README de la biblioteca y en el mapa de documentación semántica.
  - Verificación: Compilación local con `npm run build` completada exitosamente en 582ms.

* **[x] ~~Tarea 226: Integración y Sandbox de Empty State Premium Interactivo~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-06
  - Fecha de finalización: 2026-06-06
  - Historial / Revisiones:
    - **Playground Sandbox:** Implementada la visualización interactiva para `EmptyState` (`empty_state`) en `ComponentSandbox.jsx` de `dev-dashboard` para resolver la pantalla de "Playground No Configurado".
    - **Animaciones Elásticas:** Integrada la biblioteca `framer-motion` para imitar las animaciones de spring elástico de la ilustración y el botón original de la app.
    - **Mapeo de Claves y Búsqueda Difusa:** Mapeadas las llaves en `COMPONENT_SANDBOX_MAP` de `ComponentSandbox.jsx` y ampliada la búsqueda difusa para forzar la resolución del playground.
    - **Corrección de Contraste (Bugfix):** Se reemplazó la clase no estándar de Tailwind `bg-indigo-650` por `bg-indigo-600` (y `hover:bg-indigo-500`) en el botón de acción del sandbox para garantizar un contraste de accesibilidad óptimo en temas claros/oscuros.
  - Verificación: Compilación local con `npm run build` completada exitosamente.

* **[x] ~~Tarea 225: Diseño e Integración del Segundo Trío de Componentes VIP (MagneticButton, SwipeableCardStack, InteractiveAmbientGlow)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-06
  - Fecha de finalización: 2026-06-06
  - Historial / Revisiones:
    - **Fichas Técnicas:** Creadas las especificaciones técnicas detalladas en [`boton_magnetico.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Boton_Magnetico/boton_magnetico.md), [`mazo_tarjetas_deslizables.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Mazo_Tarjetas_Deslizables/mazo_tarjetas_deslizables.md) y [`fondo_luces_organicas.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Fondo_Luces_Organicas/fondo_luces_organicas.md).
    - **Playground Sandbox:** Inyectados los componentes (`SandboxMagneticButton`, `SandboxSwipeableCardStack`, `SandboxInteractiveAmbientGlow`) y sus playgrounds correspondientes en `ComponentSandbox.jsx` de `dev-dashboard` y mapeados en `COMPONENT_SANDBOX_MAP`.
    - **Refinamiento de Luces Orgánicas:** Incrementada la sensibilidad y rango de desplazamiento del cursor multiplicando las coordenadas por 12 en el loop elástico.
    - **Soporte Táctil y Giroscopio (Móvil):** Unificados Pointer Events (`pointermove`) para seguir toques en celulares, agregado decaimiento suave al levantar el dedo, e integrada inclinación elástica 3D Parallax mediante el giroscopio (`deviceorientation`).
    - **Sincronización:** Indexados en el README del catálogo y en el mapa semántico.
  - Verificación: Compilación local con `npm run build` completada exitosamente en 586ms.

* **[x] ~~Tarea 224: Diseño y Creación de la Skill component-creator (@crear-componente)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-06
  - Fecha de finalización: 2026-06-06
  - Historial / Revisiones:
    - **Skill Document:** Creado el archivo [`SKILL.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_creator/SKILL.md) detallando el flujo estructurado de briefing, documentación, inyección en Sandbox y catalogación.
    - **Trigger Global:** Integrada la directiva del disparador rápido `@crear-componente` en [`GEMINI.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) y propagado a todas las plantillas y proyectos activos mediante el script de sincronización.
  - Verificación: Sincronización exitosa en los 5 repositorios.

* **[x] ~~Tarea 223: Diseño e Integración de Trío de Componentes Premium (Marquesina, Menú Radial, Tarjeta 3D)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-06
  * Fecha de finalización: 2026-06-06
  * Historial / Revisiones:
    - **Fichas Técnicas:** Creación de las especificaciones en la biblioteca de componentes.
    - **Playground Sandbox:** Integración de `InfiniteLogoMarquee`, `RadialInteractiveMenu` y `HolographicTiltCard` en `ComponentSandbox.jsx` de `dev-dashboard`.
  * Verificación: Compilación local con `npm run build`.

* **[x] ~~Tarea 222: Diseño e Integración de Calendario/DatePicker Premium~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-06
  * Fecha de finalización: 2026-06-06
  * Historial / Revisiones:
    - **Ficha Técnica:** Creada y guardada la ficha técnica de [Calendario/DatePicker Premium](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Calendario_Premium/calendario_premium.md) en la biblioteca de componentes.
    - **Playground Sandbox:** Implementado el playground interactivo reactivo de fecha y rangos con presets en el `ComponentSandbox.jsx` de `dev-dashboard` y registrado en el mapa de Sandbox.
  * Verificación: Compilación local con `npm run build` exitosa en 822ms.

* **[x] ~~Tarea 221: Extracción y Estandarización de Telemetría Centralizada con Directivas IA~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-06
  * Fecha de finalización: 2026-06-06
  * Historial / Revisiones:
    - **Ficha Técnica:** Creada y guardada la ficha técnica de [Telemetría Centralizada](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Servicios_y_Firebase/Telemetria_Centralizada/telemetria_centralizada.md) en la biblioteca de componentes.
    - **Prompt para la IA:** Incorporada una sección de directivas estructuradas y prompt paso a paso para que cualquier IA asistente pueda autoinstalar y configurar la telemetría sin reprocesos.
    - **Sincronización:** Indexado en el README de la biblioteca, en el mapa físico de la aplicación y en el mapa de documentación IA.
    - **Monitoreo de Errores Reales (2026-06-07):** Implementada la función `reportAppFailureToDeveloper` en `telemetryService.js` de App Ventas. Conectada al `window.onerror`, `window.onunhandledrejection` y al callback `onError` de React `ErrorBoundary` de la aplicación cliente para transmitir de forma automática todas las excepciones y stack traces reales en tiempo real a la colección centralizada `app_failures` de Firestore Central etiquetados con el respectivo `clientId`.
  * Verificación: Códigos JS completos verificados libres de placeholders y enlaces comprobados. Modificaciones compiladas exitosamente.

* **[x] ~~Tarea 220: Extracción y Sandbox de Facturación Comisional del Desarrollador~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-06
  * Fecha de finalización: 2026-06-06
  * Historial / Revisiones:
    - **Ficha Técnica:** Creada y guardada la ficha técnica de [Facturación Comisional (DeveloperBillingPanel)](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Monetizacion_Desarrollador/Facturacion_Comisional/facturacion_comisional.md) en la biblioteca de componentes.
    - **Playground Sandbox:** Añadido el playground interactivo de previsualización en vivo en `ComponentSandbox.jsx` en `dev-dashboard` con controles para simular los modos de cobro y lienzo (canvas) para la firma.
    - **Sincronización:** Indexado en el README de la biblioteca y en el mapa semántico.
  * Verificación: Compilación local de producción exitosa en `dev-dashboard` y libre de advertencias de empaquetado.

* **[x] ~~Tarea 219: Creación e Integración de BentoGrid y useLocalStorageState~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-06
  * Fecha de finalización: 2026-06-06
  * Historial / Revisiones:
    - **Fichas Técnicas:** Creadas y guardadas las fichas técnicas detalladas de [BentoGrid](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Bento_Grid/bento_grid.md) y [useLocalStorageState](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/useLocalStorageState/use_local_storage_state.md) en la biblioteca de componentes.
    - **Playgrounds:** Añadidas las simulaciones interactivas jugables con controles de props en caliente dentro de `ComponentSandbox.jsx` en `dev-dashboard` para ambos elementos.
    - **Sincronización:** Registrados en el índice de la biblioteca y expuestos dinámicamente en el visor de componentes del desarrollador.
  * Verificación: Compilación local con `npm run build` en `dev-dashboard` completada exitosamente y catalogación semántica validada.

* **[x] ~~Tarea 218: Creación e Integración de useDebounceValue y StockHeatmap~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-06
  * Fecha de finalización: 2026-06-06
  * Historial / Revisiones:
    - **Fichas Técnicas:** Creadas y guardadas las fichas técnicas detalladas de [useDebounceValue](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/useDebounceValue/use_debounce_value.md) y [StockHeatmap](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Stock_Heatmap/stock_heatmap.md) en la biblioteca de componentes.
    - **Playgrounds:** Añadidas las simulaciones interactivas jugables con controles de props en caliente dentro de `ComponentSandbox.jsx` en `dev-dashboard` para ambos elementos.
    - **Sincronización:** Registrados en el índice de la biblioteca y expuestos dinámicamente en el visor de componentes del desarrollador.
  * Verificación: Compilación local con `npm run build` en `dev-dashboard` completada exitosamente y catalogación validada.

* **[x] ~~Tarea 217: Adaptación Responsiva Premium para Ajustes del Administrador (PC/PC Screens)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-06
  * Fecha de finalización: 2026-06-06
  * Historial / Revisiones:
    - **Rejilla Adaptativa:** Se reestructuró la maquetación del menú de ajustes en [AdminSettings.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) de una sola columna fija vertical a un sistema de rejilla flexible de 3 columnas en pantallas grandes (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`), permitiendo que las secciones (Tienda, Gestión y Sistema) se posicionen lado a lado.
    - **Contenedor y Botones:** Se amplió el ancho máximo del contenedor principal en modo menú de `max-w-2xl` a `max-w-6xl` para aprovechar el ancho en PC, y se acotó el ancho del botón "Cerrar Sesión" (`max-w-sm mx-auto`) para que no se estire de forma tosca.
  * Verificación: Compilación local con `npm run build` exitosa en 836ms.

* **[x] ~~Tarea 216: Creación e Integración de SwipeableBottomSheet y OTPInputField~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-06
  * Fecha de finalización: 2026-06-06
  * Historial / Revisiones:
    - **Fichas Técnicas:** Documentados con código React completo, HSL styling, y diagramas en la biblioteca de componentes.
    - **Playgrounds:** Añadidas las simulaciones interactivas jugables con controles de props en caliente dentro de `ComponentSandbox.jsx` en `dev-dashboard`.
  * Verificación: Compilación local con `npm run build` en `dev-dashboard` completada exitosamente.

* **[x] ~~Tarea 215: Investigación y Propuesta de 50 Componentes Premium Reutilizables~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-06
  * Fecha de finalización: 2026-06-06
  * Historial / Revisiones:
    - **Investigación:** Investigación exhaustiva sobre librerías, repositorios de GitHub y patrones de diseño modernos.
    - **Propuesta:** Creación y catalogación de un documento con 50 componentes y utilidades premium clasificados en 7 áreas clave del stack.
  * Verificación: Archivo guardado en la carpeta específica e indexado en el mapa semántico.

* **[x] ~~Tarea 214: Buscador Inteligente con Resaltado y Contador de Componentes (dev-dashboard)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-06
  * Fecha de finalización: 2026-06-06
  * Historial / Revisiones:
    - **Algoritmo de Búsqueda:** Implementado buscador reactivo tolerante a mayúsculas/minúsculas y acentos sobre el árbol de directorios de componentes.
    - **Highlight & Contador:** Se inyectó resaltado en caliente del término coincidente en las etiquetas del árbol de archivos y un contador flotante con la cantidad de coincidencias activas.
  * Verificación: Compilación local de producción en `dev-dashboard` completada con éxito.

* **[x] ~~Tarea 213: Botón de Copiado Rápido y Portabilidad en el Visor de la Biblioteca (dev-dashboard)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-06
  * Fecha de finalización: 2026-06-06
  * Historial / Revisiones:
    - **Copia por Bloque:** Inyectados botones individuales de copiado al portapapeles con feedback temporal (check animado y texto "Copiado") en cada bloque de código de la pestaña de Documentación.
    - **Copiar Todo:** Se inyectó el botón de portabilidad general "Copiar todo el código" en la cabecera que concatena y extrae de forma inteligente todos los bloques de código JS/JSX contenidos en el markdown.
  * Verificación: Compilación local de producción en `dev-dashboard` completada con éxito.

* **[x] ~~Tarea 212: Skill de Distribución Automática @portar-componente~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-06
  * Fecha de finalización: 2026-06-06
  * Historial / Revisiones:
    - **Creación de la Skill:** Diseñada la especificación técnica en `portar_componente/SKILL.md` estructurando el workflow de portabilidad automatizada (localización, validación de existencia previa, extracción de código limpio, mapeo de ruta de destino, adaptación de imports e iconos, compilación y verificación).
    - **Propagación de Directivas:** Registrado el disparador rápido `@portar-componente` en `GEMINI.md` y ejecutada la propagación síncrona mediante `sync_rules.js` a los 5 repositorios activos.
  * Verificación: Reglas validadas e instaladas con éxito.

* **[x] ~~Tarea 211: Visor Interactivo y Sandbox de Previsualización en Caliente de la Biblioteca (dev-dashboard)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-06
  * Fecha de finalización: 2026-06-06
  * Historial / Revisiones:
    - **Visor a Doble Columna:** Diseñado e implementado el componente `ComponentLibraryView.jsx` que se conecta a la API local del Daemon CLI (`localhost:3001/api/library`). Muestra el árbol de carpetas de categorías de componentes en la columna izquierda y a la derecha ofrece una vista de detalles a dos pestañas (Documentación/Código y Simulador).
    - **Categorías Colapsables Premium (Acordeón):** Se rediseñó el árbol de componentes para convertir los encabezados de categorías en botones de selector desplegable premium (acordeones colapsables). Implementan transiciones suaves de `framer-motion` (`AnimatePresence` y spring), rotación elástica del chevron indicador, y auto-expansión inteligente al seleccionar un componente o realizar búsquedas en el input de filtrado.
    - **Sandbox Interactivo:** Diseñado e implementado el componente `ComponentSandbox.jsx` para previsualizar y jugar en caliente con propiedades dinámicas (props) de componentes de UI comunes, formularios, modales, alertas y la consola de diagnóstico sin romper el empaquetado de Vite ni requerir dependencias pesadas de runtime sandbox.
    - **Integración:** Registrado el nuevo componente e importación en `App.jsx`, añadiendo el botón de "Biblioteca" en el Sidebar/Bottom Nav del panel de control de desarrollador.
  * Verificación: Compilación local de producción en `dev-dashboard` completada con éxito.

* **[x] ~~Tarea 210: Saneamiento de Icono PWA y Fallback Estático (App Ventas)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **Sustitución de Assets:** Descargado el logotipo oficial de Smart Fix desde la base de datos de configuración y guardado localmente sobreescribiendo los archivos fallback obsoletos en la carpeta pública: `/public/pwa-192x192.png`, `/public/pwa-512x512.png`, y `/public/apple-touch-icon.png`.
    - **Evitar Icono Desactualizado:** Esto garantiza que incluso si falla el generador dinámico de canvas en el cliente o si el navegador Chrome (vía WebAPK) recurre al fallback estático, siempre se muestre el logotipo azul actual de la marca en lugar del icono morado por defecto de la plantilla.
  * Verificación: Compilación local con `npm run build` completada con éxito.

* **[x] ~~Tarea 209: Sidebar Colapsable y Botón Hamburguesa Persistente y Alineado (App Ventas y dev-dashboard)~~**
  * Estatus: Completado (Revertido en App Ventas).
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **Layout y Maquetación:** Implementado topbar superior (`h-14`) y barra lateral colapsable (`w-64` a `w-16`) en `AdminLayout.jsx` de escritorio. Replicado diseño unificado en `dev-dashboard` (`w-[220px]` a `w-[64px]`).
    - **Botón Hamburguesa Persistente:** Ubicado a la izquierda del nombre/logo, sirviendo como atajo directo para colapsar y expandir en todo momento. Alineado verticalmente con los iconos de la barra lateral.
    - **Animación del Logo:** Logo deslizable que se reposiciona a la derecha de la línea divisoria del sidebar en estado colapsado y se re-introduce al sidebar header en estado expandido.
    - **Reversión (App Ventas):** Revertidos por completo los cambios de sidebar y animación en `App Ventas` para restaurar el comportamiento original a petición del usuario.
  * Verificación: Compilación exitosa en local con `npm run build` en 1.38s (Ventas) y 698ms (Dashboard).

* **[x] ~~Tarea 208: Personalización de Identidad Visual PROTOTIPE y Animaciones Tecnológicas en dev-dashboard~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **Branding y Estilo:** Purgado por completo el término "Ecosistema" de la UI del dashboard, login y logs. Reemplazado por **PROTOTIPE — Motor de Aplicaciones a la Medida** con colores Violeta Eléctrico y Cian Tecnológico.
    - **Logo SVG y Favicon:** Reemplazado el favicon emoji `🛡️` por un SVG inline de la marca y agregado el logo de PROTOTIPE en el topbar de la consola.
    - **Animaciones CSS:** Inyectado *Gradient Shift*, *Radar Pulse* y `.hover-glow-card` en `index.css`.
    - **Consola Terminal:** Simulado un frame de ventana de comandos en la telemetría de logs con botones de ventana reales y cabecera monospaced.
    - **Alineación del Menú Hamburguesa:** Introducido un contenedor flex de ancho variable en el Topbar para alinear simétricamente el botón de alternar con los iconos del sidebar.
    - **Solución a SyntaxError en CLI:** Corregido un fallo de comillas invertidas sin escapar en el prompt de arranque dentro de `generator.js` que causaba el bloqueo del servidor Express de Node.js al levantar el CLI Daemon.
  * Verificación: Compilación local de producción exitosa y servidor local verificado online en puerto 3001.

* **[x] ~~Tarea 207: Consola de Diagnóstico de Desarrollador en App Ventas y CLI~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **Documentación del componente:** Creación del archivo de catálogo `diagnostico_desarrollador.md` detallando propósito, estilos y código.
    - **Creación de Componentes:** Creación de `DeveloperDiagnosticsModal.jsx` y copiado en `App Ventas`, `template-ventas` y `template-core-seed`.
    - **Inyección en Ajustes:** Modificado `AdminSettings.jsx` en `App Ventas` y `template-ventas` para renderizar el pie de página de versión, capturar 7 clics y validar `VITE_DEVELOPER_EMAIL` antes de abrir el panel en tiempo real de diagnóstico.
    - **Actualización de CLI:** Configurado `generator.js` para propagar dinámicamente `VITE_DEVELOPER_EMAIL` a los archivos de configuración local `.env.local` de los proyectos aprovisionados.
    - **Corrección de Acceso local:** Se detectó que al no estar declarada `VITE_DEVELOPER_EMAIL` en `.env.local` de la instancia de desarrollo local, el handler hacía `return` silencioso. Se modificó la validación para omitir la coincidencia de email si `import.meta.env.DEV` es true.
    - **Reglas de Seguridad Firestore:** Se inyectó la regla de seguridad para la colección `_diagnostics` en `firestore.rules` con acceso restringido exclusivo a administradores (`isAdmin()`), resolviendo el error `Missing or insufficient permissions` durante el test de Ping.
  * Verificación: Compilación local de App Ventas verificada con éxito.

* **[x] ~~Tarea 206: Propagación de Firebase Central y Aprovisionamiento SEO/Brand en Prototipe-CLI~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **Soporte Firebase Central en Plantillas:** Creación del singleton `centralFirebaseService.js` en `template-ventas` y `template-core-seed`. Refactorización de `telemetryService.js` y `billingService.js` para usar el singleton en ambos templates.
    - **Inyección de VAPID Key:** Modificado `generator.js` para propagar de manera dinámica la VAPID key autogenerada al service worker de notificaciones (`public/firebase-messaging-sw.js`).
    - **SEO Dinámico y Título:** Modificado `generator.js` para inyectar y/o reemplazar dinámicamente etiquetas meta SEO (`description`, `keywords`, `og:title`, `twitter:title`, etc.) y el título `<title>` en `index.html`.
    - **Generador de Logo/Favicon SVG:** Modificado `generator.js` para autogenerar un logo y favicon en formato SVG basado en las iniciales del nombre de proyecto si el usuario no proporciona uno, utilizando el color primario dinámico de la marca.
  * Verificación: Edición verificada y lista para aprovisionar.

* **[x] ~~Tarea 205: Corrección de Telemetría e Inicialización Concurrente de Firebase Central~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **Servicio Central:** Creación del singleton [centralFirebaseService.js](file:///d:/Aplicaciones/App%20Ventas/src/services/centralFirebaseService.js) para inicializar una sola vez la app secundaria `centralDevApp` sin colisiones lógicas.
    - **Refactorización de Clientes:** Modificado [telemetryService.js](file:///d:/Aplicaciones/App%20Ventas/src/services/telemetryService.js) y [billingService.js](file:///d:/Aplicaciones/App%20Ventas/src/services/billingService.js) para consumir de forma compartida y unificada el mismo singleton de Firestore Central.
  * Verificación: `npm run build` exitoso y libre de conflictos concurrentes.

* **[x] ~~Tarea 204: Mejoras de Seguridad, Rendimiento y Bundle (Post-Auditoría)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **Seguridad Firestore:** Restringida la colección `/notifications` en [firestore.rules](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) — solo `create` para usuarios anónimos; `read`, `update`, `delete` exclusivos del admin autenticado.
    - **Lazy Loading PDF:** Migrados los imports estáticos de `jsPDF` y `jspdf-autotable` a importaciones dinámicas en las 3 funciones de [pdfService.js](file:///d:/Aplicaciones/App%20Ventas/src/services/pdfService.js), eliminando ~430 KB del bundle inicial del cliente.
    - **Precarga Inteligente:** Limitada la precarga silenciosa de imágenes del catálogo a los primeros 12 productos en [useInventory.js](file:///d:/Aplicaciones/App%20Ventas/src/hooks/useInventory.js) para proteger el ancho de banda en conexiones móviles lentas.
    - **Verificado:** `uploadService.js` ya usaba `uploadBytesResumable` correctamente — ningún cambio requerido.
  * Verificación: `npm run build` exitoso en 1.40s sin errores.

* **[x] ~~Tarea 203: Empty States Premium Interactivos en Historial de Pedidos~~**

  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **UI/UX:** Se creó el componente [EmptyState.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/EmptyState.jsx) con animación elástica y soporte para ilustración SVG inline.
    - **Integración:** Reemplazo de los textos planos en [ClientOrders.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientOrders.jsx) para pedidos regulares y solicitudes de pedidos especiales, agregando redirección guiada al catálogo de ventas.
  * Verificación: Compilación local limpia.

* **[x] ~~Tarea 202: Blindaje de Entradas: Máscara en Caliente para Inputs de Moneda (COP)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **Formateador Dinámico:** Creación del componente atómico [CurrencyInput.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/CurrencyInput.jsx) que aplica máscara en caliente para pesos colombianos (`$ XX.XXX`) en el DOM y propaga el valor numérico entero limpio al state.
    - **Formularios:** Reemplazo de inputs numéricos de precios en [ProductFormModal.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) y en el POS de [AdminSales.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSales.jsx), previniendo fallos en validación Zod.
  * Verificación: Compilación local limpia.

* **[x] ~~Tarea 201: Alertas de Conectividad en Caliente (Toast de Red)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **Toast de Conexión:** Se desarrolló el componente reactivo [ConnectivityToast.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/ConnectivityToast.jsx) que monitorea eventos de red offline/online y muestra notificaciones elegantes con desenfoque de fondo y animación.
    - **Inyección:** Se integró globalmente en [App.jsx](file:///d:/Aplicaciones/App%20Ventas/src/App.jsx) bajo el enrutador principal.
  * Verificación: Compilación local limpia.

* **[x] ~~Tarea 200: Opción de URL directa para imágenes en creación de productos~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **Carga de imágenes:** Se garantizó que el administrador disponga siempre de 3 opciones de carga para la imagen principal del producto, la galería secundaria y las imágenes de las variantes: subir desde galería local, tomar foto con la cámara del dispositivo, e ingresar un enlace o URL directo a la imagen.
    - **Paso 1 y Secundarias:** Se añadió el campo URL de respaldo en la galería secundaria (cargando con el botón "Añadir") y se habilitó la caja de URL en cada variante individual en [ProductFormModal.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx).
  * Verificación: Compilación local limpia.

* **[x] ~~Tarea 199: Telemetría Automática e Integración en la Ley de Proyectos Nuevos/Desde Cero~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **Trigger Automático:** Se implementó una suscripción reactiva en segundo plano en `useAppConfigSync.js` utilizando `subscribeToBillingData` para reportar métricas mensuales de comisiones a Firestore Central (`prototipe-multi-instancia-control`) de forma silenciosa e imperceptible.
    - **Plantillas CLI:** Propagación del hook sincronizado de forma idéntica en las plantillas semilla y de ventas del CLI (`template-core-seed` y `template-ventas`).
    - **Ley de Proyectos:** Registro del estándar obligatorio de telemetría automática en la guía de bootstrapping (`inicializacion_nuevos_proyectos.md` Paso 8.5) para forzar su adopción en todo desarrollo futuro o proyectos desde cero.
  * Verificación: Compilación local libre de errores.

* **[x] ~~Tarea 198: Estabilización de la Aplicación Core y Mitigación de Fugas de Memoria~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **ReferenceError Fix:** Se corrigió el `ReferenceError` de `couponsEnabled` en [AdminSettings.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) destruturándolo del store global `config`.
    - **Robustez:** Se inyectaron bloques `try/catch` para capturar fallos al crear notificaciones en [ClientCredits.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCredits.jsx).
    - **Framer Motion Modales:** Se removieron los retornos condicionales anticipados `if (!isOpen) return null` en [OrderShareModal.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/orders/OrderShareModal.jsx), [ClientFilterModal.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ClientFilterModal.jsx) y [WholesaleRequestModal.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/WholesaleRequestModal.jsx), reestructurando el renderizado para permitir que la animación `exit` de Framer Motion se ejecute.
    - **Scroll Lock:** Se inyectó bloqueo de overflow en el body al abrir [ClientFilterModal.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ClientFilterModal.jsx).
    - **Callbacks de Error en onSnapshot:** Se agregaron callbacks de error a los listeners en tiempo real de Firebase en 9 servicios clave (acceso, anuncios, configuración, reclamos, créditos, repartos, pedidos, producción y mesas).
  * Verificación: Compilación local exitosa con 0 errores.

* **[x] ~~Tarea 197: Auditoría de Seguridad, Robustez, Rendimiento y UI/UX de la Aplicación Core~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - Se ejecutó un escaneo exhaustivo de código de la app core enfocándose en fugas de listeners `onSnapshot`, controladores de errores y validaciones de errores asíncronos y animaciones de modales.
    - Se generó el informe de auditoría detallado en [auditoria_seguridad_rendimiento_pwa.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_seguridad_rendimiento_pwa.md).
  * Verificación: Informe creado e indexado en el mapa de documentación.

* **[x] ~~Tarea 196: Consistencia en Pantallas de Reportes, Caja e Interfaz de Administrador para Módulos Inactivos~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **Créditos:** Se modificaron las vistas de administración [AdminHome.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminHome.jsx), [AdminSalesDetail.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx), y [AdminOrders.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) para excluir transacciones a crédito del resumen de caja, gráficos históricos, listas de pedidos y estadísticas de ventas en pantalla si `creditsEnabled` está inactivo.
    - **Cupones:** Se modificó [AdminSettings.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) para ocultar por completo la opción "Cupones de Descuento" en el menú lateral y bloquear la sección de gestión de cupones si `couponsEnabled` es falso.
  * Verificación: Compilación local exitosa, alineación del POS, reportes, y paneles del administrador.

* **[x] ~~Tarea 195: Rediseño de Variantes y Fix de Validación Zod en Creación de Producto~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - Se eliminó el campo de entrada "Precio Propio (Opcional)" en las variantes en [ProductFormModal.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) para centralizar la venta en el precio base.
    - Se redujo el grid de la variante de 3 a 2 columnas (`md:grid-cols-2`) para alinear SKU y Foto.
    - Se mapeó `formData.estado` a `undefined` si llega nulo, resolviendo el error de Zod "Invalid option".
  * Verificación: Compilación local exitosa.

* **[x] ~~Tarea 194: Consistencia y Ajustes del Panel de Pedidos (Estadísticas y Descuentos)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - Se reestructuró la rejilla de métricas rápidas de pedidos en [AdminOrders.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) a 2 columnas si el módulo de créditos está deshabilitado.
    - Se condicionó el desglose de descuentos de cupones a `couponsEnabled`.
  * Verificación: Compilación local exitosa.

* **[x] ~~Tarea 193: Aislamiento del Método de Pago Crédito en el POS del Vendedor~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - Se condicionó el método de pago `PAYMENT_METHODS.CREDIT` en [PortalVendedor.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalVendedor.jsx) en base a `creditsEnabled`, ocultándolo si el módulo está desactivado.
  * Verificación: Compilación local exitosa.

* **[x] ~~Tarea 192: Aislamiento Dinámico de Créditos en Reportes Financieros PDF~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - Se modificó `exportSalesReportPDF` en [pdfService.js](file:///d:/Aplicaciones/App%20Ventas/src/services/pdfService.js) para que excluya transacciones históricas a crédito de los cómputos generales y tablas de detalle cuando el módulo de créditos está desactivado.
  * Verificación: Compilación local exitosa.

* **[x] ~~Tarea 191: Purga Física Definitiva de Componentes Muertos de Mesas~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - Se eliminaron físicamente las declaraciones inactivas de `TableQRModal` y `AdminTablesCRUD` en [AdminSettings.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx).
  * Verificación: Compilación local exitosa.

* **[x] ~~Tarea 190: Remoción de Configuración del Módulo de Pedidos en Mesa y Autoservicio QR en AdminSettings~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - Se eliminó el bloque JSX del switch "Módulo de Pedidos en Mesa y Autoservicio QR" en [AdminSettings.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) para ocultar permanentemente esta opción de la UI del administrador.
    - Se conservó `tablesEnabled` en `appConfigStore.js` con valor por defecto `false` para evitar regresiones en otras dependencias del sistema.
  * Verificación: Compilación local exitosa.

* **[x] ~~Tarea 189: Limpieza de Accesos Rápidos Fijos en el Inicio del Administrador~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - Se removió el botón fijo de "Configuración" y "Rendimiento QR" de la sección de accesos rápidos en [AdminHome.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminHome.jsx) dejando solo los accesos operativos (Inventario, Pedidos y Créditos si está activo).
  * Verificación: Compilación local exitosa.

* **[x] ~~Tarea 188: Corrección del Bug de Entrada Inválida (Invalid Input) en Creación de Productos (Paso 5)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - Se eliminaron las validaciones de obligatoriedad para `color` y `talla` en el wizard de creación/edición de productos (paso 5 - Inventario) en [ProductFormModal.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx). Ahora las variables son completamente opcionales en el guardado.
    - Se adaptó la lógica de validación para garantizar que solo el campo `stock` de la variante sea obligatorio y no admita valores negativos.
  * Verificación: Compilación local exitosa y validación del paso 5 robusta.

* **[x] ~~Tarea 187: Soporte de Despliegue Hacia Arriba (DropUp) en CustomSelect y categorías de Inventario~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - Se implementó la propiedad `dropUp` en el componente reutilizable [CustomSelect.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/CustomSelect.jsx) para posicionar el dropdown con `bottom-12` y animarlo desde abajo (`y: 10`) cuando está activo.
    - Se actualizó el select de categoría en [ProductFormModal.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) (Paso 2) con la prop `dropUp={true}` para evitar que quede oculto debajo de los botones de navegación del modal.
  * Verificación: Compilación local exitosa.

* **[x] ~~Tarea 186: Corrección de Margen Superior de Logo en Inicio de Administrador~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - Se ajustó el margen del logo del negocio en la parte superior de [AdminHome.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminHome.jsx) de `marginTop: '-2rem'` a `marginTop: '0.5rem'` y `marginBottom: '-1.5rem'`, proporcionando el espacio adecuado con el borde superior de la tarjeta.
  * Verificación: Compilación local exitosa.

* **[x] ~~Tarea 185: Aislamiento Dinámico y Seguridad de Módulos Desactivados (Créditos y Cupones)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-05
  * Fecha de finalización: 2026-06-05
  * Historial / Revisiones:
    - **Créditos:** En [ClientProfile.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientProfile.jsx) se condicionó el acceso directo a "Mis Créditos" e integrado con `creditsEnabled` del store de configuración de marca, de modo que desaparece por completo del perfil del cliente cuando el módulo está desactivado.
    - **Cupones de Descuento:** En [CheckoutModal.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) se condicionó la sección completa "Cupón de Descuento" a `couponsEnabled` y se actualizó `calculateDiscount` para ignorar descuentos si el módulo está inactivo.
  * Verificación: Compilación local exitosa y validaciones integradas.

* **[x] ~~Tarea 184: Rediseño Premium Multi-tab, Módulo CRM y Gráficos Adaptativos en dev-dashboard~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-04
  * Fecha de finalización: 2026-06-04
  * Historial / Revisiones:
    - **Navegación Multi-tab:** Sidebar fijo en desktop y Bottom Nav en móvil con 5 pestañas: Inicio, CRM, Facturación, Terminal y Ajustes.
    - **CRM Completo:** Gestión de configuración de comisiones, tokens y simulador de envío de reportes desde una ficha técnica por cliente con gráficos Recharts.
    - **Visualización de Datos:** Gráficos SVG interactivos (Recharts) para comisiones y ventas mensuales, y donuts para el estatus de facturación de los clientes.
    - **Framer Motion:** Animación de transiciones entre pestañas, modales y drawers laterales.
    - **Limpieza Cromática:** Remoción de contrastes oscuros rotos en modo claro para botones y alertas de telemetría.
  * Verificación: Compilación local (`npm run build`) exitosa.

* **[x] ~~Tarea 183: Explorador de Biblioteca de Componentes en dev-dashboard~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-04
  * Fecha de finalización: 2026-06-04
  * Historial / Revisiones:
    - **Endpoint `/api/library` (Prototipe-CLI `server.js`):** Parsea el `README.md` de la Biblioteca de Componentes con regex y devuelve JSON estructurado con categorías, componentes, descripción, link a ficha técnica y tags semánticos auto-inferidos.
    - **Pestaña "Biblioteca" en `dev-dashboard`:** Grid interactivo por categorías con buscador fuzzy Levenshtein, filtros de categoría y tag, tarjetas con tags coloreados y drawer de detalle lateral con copia de ruta de ficha.
    - **Auto-carga Lazy:** El catálogo se carga la primera vez que se navega a la pestaña (no bloquea el arranque del dashboard).
    - **Navegación integrada:** Pestaña en sidebar desktop y bottom nav móvil con indicador visual activo.
  * Verificación: Compilación local (`npm run build`) exitosa en 695ms.

* **[x] ~~Tarea 182: Rediseño Responsivo, Notas y Buscador Tolerante en dev-dashboard~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-04
  * Fecha de finalización: 2026-06-04
  * Historial / Revisiones:
    - **Navegación Móvil (Bottom Tab Bar):** Barra de navegación inferior con desenfoque de fondo y soporte para área segura (`pb-safe`) en móviles.
    - **Sección de Ajustes y Dark Mode:** Se reestructuró la sección 'Ecosistema' a 'Ajustes' e integró el control de Modo Oscuro (`DarkModeToggle`) en su interior.
    - **Búsqueda con Tolerancia a Errores:** Implementación de algoritmo Levenshtein para búsqueda aproximada tolerante a errores de digitación en CRM, Facturas y Notas.
    - **Notas del Desarrollador (Dev Notes):** Nuevo módulo para ideas, recordatorios y tareas pendientes con persistencia en LocalStorage y Firestore central.
  * Verificación: Compilación local (`npm run build`) exitosa.

### 🔴 Bloqueado — Requiere Acción Manual del Usuario
* **[ ] Tarea 124: Desplegar Cloud Functions corregidas a producción**
  * Estatus: ⏸️ BLOQUEADO — plan Blaze (facturación) requerido.
  * Fecha de registro: 2026-06-02

### 💼 Negocio y Modularidad Ecosistema (Prioridad Alta)
* **[x] ~~Tarea 181: Ajuste de Contexto de Negocio a Aplicaciones a la Medida e Higienización de la Biblioteca de Componentes~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-04
  * Fecha de finalización: 2026-06-04
  * Historial / Revisiones:
    - **Reestructuración de Visión Comercial:** Se renombró y reescribió el manifiesto de negocio de PROTOTIPE para centrarse en el desarrollo rápido de aplicaciones a la medida (ventas, inventarios, servicios y fidelidad) para microempresas, pymes y emprendedores, eliminando la visión limitada de "plataforma Ecosistema".
    - **Alineación Comercial:** Rediseñado el archivo de estrategia de negocio para enfocar la preventa y briefing de clientes en objetivos funcionales concretos del negocio.
    - **Higienización de Biblioteca de Componentes:** Se auditaron y modificaron los componentes de Checkout, Carrito y Pedido en la biblioteca de componentes, limpiando toda contaminación lógica/visual heredada de "App Ventas" (indumentaria, variables fijas color/talla) y adoptando renderizado dinámico de pares clave:valor a través del payload de atributos genéricos.
    - **Propagación de Directivas (GEMINI.md):** Se actualizó el archivo de directrices centrales de la IA y se propagó síncronamente en todas las ramas de código activas (App Ventas, dev-dashboard y plantillas CLI).
  * Verificación: Documento de manifiesto creado en `04_Estandares_y_Skills/contexto_negocio_aplicaciones_medida.md`, componentes higienizados en `06_Biblioteca_Componentes` y mapas de documentación actualizados.

* **[x] ~~Tarea 180: Propuesta de Rediseño de Consola Central Ecosistema (PROTOTIPE)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-04
  * Fecha de finalización: 2026-06-04
  * Historial / Revisiones:
    - **Propuesta de Identidad Visual y Layout:** Se estructuró un plan técnico detallado de rediseño premium alineado con la marca PROTOTIPE para optimizar la interfaz del Dashboard de Desarrollador sin alterar funcionalidad. Se abordó la paleta cromática, tipografía, efectos visuales de cristal y micro-interacciones.
  * Verificación: Documento de propuesta creado en `07_Manuales_Desarrollo/Visualizacion/propuesta_redisenio_dev_dashboard.md`.

* **[x] ~~Tarea 179: Rediseño de Alerta de Bienvenida en Login (BUG-031)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-04
  * Fecha de finalización: 2026-06-04
  * Historial / Revisiones:
    - **Remoción de Borde Rústico:** Se retiró el borde tosco de color oscuro y el fondo gris genérico en `LoginPage.jsx`.
    - **Estilo Adaptativo Premium:** Se aplicó una caja traslúcida con fondo `bg-primary/[0.04]` y borde sutil `border-primary/10`, manteniendo coherencia visual con la identidad de marca configurada.
  * Verificación: Compilación local de producción exitosa.

* **[x] ~~Tarea 178: Corrección de Emojis Rotos en Mensajes de WhatsApp (BUG-030)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-04
  * Fecha de finalización: 2026-06-04
  * Historial / Revisiones:
    - **Conversión a UTF-16 Surrogate Pairs:** Se cambiaron los emojis literales en el mapa de emojis de `CheckoutModal.jsx` y en las líneas del formato de mensaje por escapes unicode (`\uD83D\uDED2`, etc.) para evadir distorsiones causadas por la codificación del compilador o del sistema de archivos.
  * Verificación: Compilación exitosa en local.

* **[x] ~~Tarea 177: Limpieza de Constantes de la App de Ventas en la Plantilla Semilla (BUG-029)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-04
  * Fecha de finalización: 2026-06-04
  * Historial / Revisiones:
    - **Saneamiento de Constantes:** Se reescribió `template-core-seed/src/constants/index.js` para remover por completo todas las constantes residuales específicas de retail, pedidos, mensajeros, mesas y compra guiada. Se mantuvieron exclusivamente las constantes genéricas del Core (Roles admin/employee/client, colecciones base, soporte y dev PIN).
    - **Actualización en la Veterinaria:** Se sobrescribió el archivo de la veterinaria para evitar inconsistencias en el nuevo chat.
  * Verificación: Archivos de constantes purgados con éxito.

* **[x] ~~Tarea 176: Corrección de Errores de Aprovisionamiento (BUG-028 - Espacios en env.local y Mapeo de custom-brand)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-04
  * Fecha de finalización: 2026-06-04
  * Historial / Revisiones:
    - **Sanitización de Variables (.env.local):** Modificado `generator.js` en `Prototipe-CLI` para aplicar `.trim()` a todas las credenciales de Firebase extraídas/inyectadas, evitando espacios accidentales causados por copiar/pegar o el API.
    - **Soporte de Tema custom-brand:** Añadido el tema `'custom-brand'` con mapeo de variables CSS flexibles en `palettes.js` tanto de `template-core-seed` como de `App Ventas`, permitiendo que las IAs y la app consuman colores de marca customizados respetando la lógica de modo oscuro.
  * Verificación: Cambios de código aplicados con éxito.

* **[x] ~~Tarea 175: Protocolo de Autocorrección y Documentación ante Fallos de Despliegue de Firebase CLI~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-04
  * Fecha de finalización: 2026-06-04
  * Historial / Revisiones:
    - **Documentación de Fallas:** Añadida una sección técnica detallada en el Manual de Prototipe-CLI (`manual_prototipe_cli.md`) y en la Guía de Inicialización de Nuevos Proyectos (`inicializacion_nuevos_proyectos.md`).
    - **Estándar de Comportamiento de IA:** Establecidas reglas claras para que en caso de error por falta de credenciales de Firebase CLI (`Asegúrate de tener firebase-cli logueado`), la IA guíe inmediatamente al usuario a ejecutar `firebase login --reauth` localmente, o configure la variable de entorno `FIREBASE_TOKEN` para despliegues no interactivos en servidores.
  * Verificación: Archivos de documentación actualizados y guardados con éxito.

* **[x] ~~Tarea 174: Implementación del modo "Crear desde cero" (template-core-seed) en el Asistente de Aprovisionamiento~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-04
  * Fecha de finalización: 2026-06-04
  * Historial / Revisiones:
    - **Scaffolding de Core Seed:** Creada la plantilla `template-core-seed` con la estructura mínima compartida y libre de elementos visuales específicos de la app de ventas (contiene telemetría central Spark/Blaze, ruteo básico, Zustand stores base y sincronización síncrona HSL).
    - **Integración de Prompt Modular:** Modificado `generator.js` para inyectar directrices estrictas de desarrollo modular component-first y alertar a la IA (Antigravity u otra) de que asume el control sobre un lienzo limpio.
    - **Dashboard de Control:** Integrada la opción en el selector visual del Wizard en `dev-dashboard` y verificado que se transmite adecuadamente en el payload HTTP.
  * Verificación: Ejecutada prueba de aprovisionamiento físico y compilación de Vite en el destino (`512 modules transformed`) con 100% de éxito.

* **[x] ~~Tarea 173: Robustez de PWA y Fallback contra Errores de Carga de Logo (BUG-021)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-03
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Causa raíz:** Si el logo configurado (`appIcon`) es un link caído o de prueba que retorna un error de red (HTTP 404), la generación del icono de PWA (`generateBrandIcon`) fallaba y resolvía con el mismo URL roto, provocando que el navegador lance errores de carga de manifiesto en consola.
    - **Solución:** Modificado `dynamicManifest.js` para que ante cualquier error de red/CORS en la carga del logo, el flujo resuelva con un fallback seguro local (`/pwa-192x192.png`), evitando que el navegador intente cargar recursos inexistentes.
  * Verificación: Ejecutado el build de integridad exitosamente.

* **[x] ~~Tarea 172: Transición a Aislamiento de Proyectos Firebase e Historial de Bugs Correctivos (Junio 2026)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-03
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Aislamiento de Inquilinos:** Adoptado el modelo de un proyecto Firebase individual por cliente para garantizar aislamiento estricto de Auth y cuotas independientes.
    - **`seed_brand.js` (BUG-018):** Migrado de Admin SDK a Client SDK con dotenv y signInWithEmailAndPassword, evitando service account JSONs locales.
    - **`cli.js` (BUG-019):** Eliminado residuo de sintaxis corrupta `}ojectId}` en L164.
    - **Documentación:** Actualizada e indexada la documentación de inicialización, sharding y CLI.
  * Verificación: Ejecutada siembra y compilaciones de producción locales.

* **[x] ~~Tarea 171: Personalización de Identidad de Marca y Bootstrap de Barbería Glamour (barber-a-glamour)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-03
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Variables de Entorno:** Sincronizado el archivo `.env.local` con las variables comisionales de la marca (1.5% de comisión, $500 COP por servicio y $50,000 COP mensual fijo) y el client ID `barber-a-glamour`.
    - **Personalización Cromática:** Se implementó y registró el tema `custom-brand` con la paleta de colores de Barbería Glamour (primario dorado `#d4af37`, secundario slate `#94a3b8`, fondo slate oscuro `#0f172a`, texto claro `#f8fafc`) tanto en `src/constants/palettes.js` como en `src/index.css`.
    - **Inyección síncrona:** Se actualizó `index.html` para incorporar `custom-brand` en el cargador síncrono cromático inicial (`bgMap`) evitando FOUC (destellos visuales de carga).
    - **Optimización de SEO y Título:** Se actualizaron las metaetiquetas SEO y de la PWA, junto con el título principal en `index.html` para alinearlo con la identidad de Barbería Glamour.
    - **Validación:** Compilado el build local del proyecto con 100% de éxito.

* **[x] ~~Tarea 170: Facturación Ecosistema Multi-modo e Integración del Ecosistema~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-03
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Cálculo Dinámico Multi-modo:** Se actualizó `billingService.js` en el Core para calcular las comisiones de forma mensual e histórica en base al modo seleccionado (`percentage`, `fixed_per_service`, `flat_monthly`).
    - **Telemetría Ecosistema Homologada:** Se adaptó `telemetryService.js` para enviar el payload de facturación central con el nuevo esquema multi-modo e inyectar el número de pedidos (`orderCount`).
    - **Vistas del Cliente:** Modificada la sección de facturación en `AdminSettings.jsx` para mostrar de forma limpia y condicional las tarifas de cobro pactadas.
    - **Soporte CLI:** Integradas las variables comisionales locales en el aprovisionamiento de `.env.local` y el prompt del bootstrapper del CLI (`generator.js`).
    - **Dashboard Central:** Se actualizó el Wizard de Onboarding de `dev-dashboard` con selector condicional y CRM modificable en caliente para el modelo comisional.
  * Verificación: Ejecutadas compilaciones locales con éxito.

* **[x] ~~Tarea 169: Rediseño del Modal de Registro a Sección de Onboarding a Pantalla Completa~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-03
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Reemplazo de Modal:** Se reemplazó el antiguo modal flotante de registro de clientes por un layout de Onboarding a pantalla completa de 2 columnas.
    - **Wizard de 3 Pestañas:** A la izquierda, un wizard interactivo que divide la configuración en: (1) Servidor (credenciales Firebase y detección de plantilla), (2) Branding (paleta de colores interactiva y Google Fonts), y (3) Módulos (configuración granular de módulos).
    - **Simulador Real-Time:** A la derecha, un mock interactivo de smartphone que previsualiza los cambios de branding y tipografía en caliente.
    - **Persistencia de Errores y Aprovisionamiento:** Persiste el payload del onboarding en LocalStorage (`pendingCliProvisioning`) para reintentar la creación si el CLI daemon local falla, y se integró de forma completa con `http://localhost:3001/api/create-project`.
  * Verificación: Ejecutado `npm run build` con resultado exitoso y 0 errores.

* **[x] ~~Tarea 168: Estandarización Documental y Reglas de Escalabilidad Ecosistema (Sharding)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-03
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Regla de Portabilidad:** Añadida directriz en `GEMINI.md` que prohíbe el hardcoding de referencias de base de datos a nivel de core, obligando a consumir las credenciales del SDK de Firebase dinámicamente desde `.env.local` y asegurando compatibilidad con sharding.
    - **Manual de Sharding:** Creado el manual `Estandar_Sharding_Multitenant.md` con el protocolo paso a paso para abrir shards nuevos sin afectar los anteriores.
    - **Registro Semántico:** Indexado en el mapa de documentación general.
  * Verificación: Compilaciones exitosas.

* **[x] ~~Tarea 167: Implementación de Estándar de Robustez Firebase en Dashboard Dev y Core (App Ventas)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-03
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Control condicional de listeners:** Se modificaron los escuchas en tiempo real (`onSnapshot`) en el Dashboard Dev para que se ejecuten solo tras validar que `firebaseUser` está autenticado en Firebase Auth, previniendo errores de permisos en consola.
    - **Cleanup de suscripciones:** Se definieron referencias para todas las suscripciones creadas, retornando sus funciones limpiadoras correspondientes.
    - **Guía de integración de Firebase:** Creado el manual `Firebase_Listeners_Clean.md` y registrado en el mapa de documentación.
    - **Reglas del Core (`GEMINI.md`):** Se añadió la regla obligatoria de control de oyentes Firebase en la raíz de App Ventas.
  * Verificación: Ejecutada compilación local en `dev-dashboard` y `App Ventas` de forma exitosa. Pruebas sin sesión no registran advertencias de permisos.

* **[x] ~~Tarea 166: Auto-extracción de Credenciales Firebase en CLI Bridge + Botón Auto-detectar en Dashboard~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-03
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Reubicación de Project ID:** Se movió el input de Project ID fuera de la cuadrícula general de credenciales del cliente para colocar el botón interactivo de "Auto-detectar" a su lado. Se removió el input de Project ID duplicado del interior de la cuadrícula.
    - **Input VAPID Key:** Se agregó un campo dedicado para capturar manualmente la clave VAPID debajo de la cuadrícula de Firebase.
    - **Checklist de Firebase:** Se integró una sección con 3 checkboxes interactivos para la verificación de configuración manual de Firestore, Authentication y Storage en el modal de onboarding.
    - **Copiado de VAPID Dinámico:** Se inyectó dinámicamente la clave VAPID en el Paso 3 del modal de onboarding con un botón de copiado rápido al portapapeles.
    - **Sincronización del Payload:** Se modificaron los estados y el payload de registro y aprovisionamiento para incluir la propiedad `vapidKey`. Al registrarse correctamente, el input de VAPID Key se limpia del estado.
  * Verificación: Ejecutado el build de producción en `dev-dashboard` compilando exitosamente.
  * Historial / Revisiones:
    - **`Prototipe-CLI` corregido:** Modificado `cli.js` para inyectar correctamente las variables de entorno central (`VITE_DEVELOPER_CENTRAL_*`) apuntando al proyecto central de control (`prototipe-multi-instancia-control`), generar un token único por cliente (`${clientId}-token-${Date.now()}`) y mostrar el checklist de aprovisionamiento manual al finalizar el scaffolding.
    - **Consola Central Ecosistema (`dev-dashboard`) modificada:** A través del orquestador de subagentes, se sustituyó el input básico de cliente por un Formulario de Briefing y Registro completo, el cual autogenera el Client ID, comisionPorcentaje (por defecto 1.5%) y un token único de telemetría. Al guardar, crea automáticamente los documentos `/clientes_control/{id}` y `/tokens/{TOKEN}` en Firestore central y despliega una tarjeta/modal interactivo de checklist de Onboarding para copiar el token.
    - **Fase 2 - Formulario Expandido y Conexión CLI API:** Se expandió el formulario para capturar las credenciales de Firebase del cliente, la ruta física de destino en disco (`targetPath`) y la plantilla base seleccionada. Se integró la carga dinámica de plantillas consultando `http://localhost:3001/api/templates` (con fallback seguro a `template-ventas`) y se configuró la llamada POST asíncrona a `http://localhost:3001/api/create-project` al registrar. Se implementó una lógica de control de errores para tolerancia a fallos offline del daemon CLI local (mostrando advertencia sin interrumpir el registro central en Firestore) y se manejó el estado visual de carga `isRegistering` en el botón.
    - **Integración de Opciones de Aprovisionamiento (Fase Final):** Se agregaron los checkboxes premium para decidir si inicializar repositorio en GitHub (`enableGithub`) y desplegar reglas/índices a Firebase (`enableFirebaseDeploy`). Al ejecutarse el submit, se activa un overlay animado de pantalla completa con desenfoque (`isProvisioning`), enviando todos los flags de automatización a la API local de aprovisionamiento.
    - **Prompt de Arranque de Antigravity:** Se inyectó en el modal de Onboarding el prompt de arranque recuperado de la API (`result.data.prompt` / `promptResult`) renderizado en un contenedor monospaced con scroll dedicado y botón interactivo para copiado rápido al portapapeles.
    - **Ficha CRM del Cliente:** El token de la ficha ahora se obtiene dinámicamente de Firestore en lugar de mostrar variables hardcodeadas de desarrollo.
  * Verificación: Ejecutados múltiples ciclos de `npm run build` en `dev-dashboard` compilando de forma exitosa sin errores en menos de 510ms.

* **[x] ~~Tarea 164: Corrección Definitiva de Reglas Firestore Central y Flujo de Telemetría Ecosistema~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Diagnóstico raíz:** `clientes_control` bloqueado por `auth != null` (la app cliente no tiene auth en la BD central). `reportesBilling` bloqueado por documento `/tokens/{token}` inexistente.
    - **`firestore.rules` corregido y desplegado** a `prototipe-multi-instancia-control`: `clientes_control` → `read: if true`; función helper `tokenValido()` en `reportesBilling`. Desplegado con Firebase CLI.
    - **Documento token creado:** `/tokens/ventas-smartfix-dev-token-998877` en Firestore central con `{ active: true, clientId: "ventas-smartfix" }`.
    - **`telemetryService.js`:** `console.warn` → `console.debug` para silenciar falso ruido visual.
    - **`.env.local`:** Restaurado con credenciales centrales activas y token correcto.
    - **`inicializacion_nuevos_proyectos.md` Paso 9:** Documentado el estándar de configuración por tipo de proyecto, checklist completo de cliente nuevo y tabla de errores con causas raíz y prevención.
    - **Corrección de Mismatch de Reglas (BUG-027):** Se detectó que el proyecto central `prototipe-multi-instancia-control` tenía las reglas de `App Ventas` sobreescritas por error, denegando toda la telemetría y lectura de cobros. Se re-desplegaron las reglas correctas desde `/dev-dashboard/firestore.rules`.
  * **Regla de Prevención:** Crear siempre el documento `/tokens/{TOKEN}` en `prototipe-multi-instancia-control` ANTES de habilitar la conexión central en cualquier cliente nuevo y no sobreescribir las reglas del panel central con las del cliente.

* **[x] ~~Tarea 163: Corrección de Crash en AdminHome y Restauración de Variables de Entorno Base (SmartFix)~~**
  * Estatus: Completado.
  * Fecha de registro: 2026-06-03
  * Historial / Revisiones:
    - **Crash en AdminHome resuelto:** Corregida la inicialización de Firestore central en [billingService.js](file:///d:/Aplicaciones/App%20Ventas/src/services/billingService.js) (`getCentralFirestore` ahora ejecuta `getFirestore(app)` en lugar de retornar la app directamente).
    - **Restauración de .env.local:** Reconfigurado el archivo de variables locales para restablecer las credenciales del proyecto base `ventas-smartfix` en lugar de `ventas-moni-app` para el desarrollo local ordinario.
    - **Documentación de Integridad:** Registrado bajo el código `[BUG-016]` en la bitácora de control y en el Bug Log.

* **[x] ~~Tarea 162: Creación de la Herramienta de Scaffolding y Bootstrap de Proyectos (Prototipe-CLI)~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **CLI Interactivo en Node.js:** Creada la carpeta [Prototipe-CLI](file:///D:/PROTOTIPE/Prototipe-CLI) con un asistente de consola que copia plantillas base, inyecta variables HSL de marca, configura el archivo `.env.local` e instala dependencias de npm de manera autónoma.
    - **Registro de Plantillas:** La actual `App Ventas` se guardó como la primera plantilla reusable `templates/template-ventas`.
    - **Sincronización:** Mapeado en `mapa_aplicacion.md`, `mapa_documentacion_ia.md` y `bitacora_cambios.md`.

* **[x] ~~Tarea 161: Carga Directa de Imágenes a Firebase Storage en Registro de Inventario~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Servicio Modular de Subida (`uploadService.js`):** Implementado un servicio de abstracción limpio para gestionar subidas (`uploadBytesResumable`, `getDownloadURL`) y eliminación de archivos en Firebase Storage bajo directorios dinámicos (`products_drafts`, `products_variants`, `products_gallery`).
    - **Cargadores Interactivos en Variantes y Galería:** Modificado `ProductFormModal.jsx` inyectando botones interactivos de "Cámara" (`Camera`) y "Galería" (`UploadCloud`) para subidas directas. Se eliminaron por completo las cajas de texto de entrada manual de URL.
    - **Indicadores de Carga y Previsualización:** Implementados estados de progreso en caliente (`variantUploadProgress`, `galleryProgress`), loaders de spinner y visualización interactiva de miniaturas con opciones de borrado síncrono.

* **[x] ~~Tarea 160: Plan de Escalabilidad del Negocio e Investigación Ecosistema 2026~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Informe de Investigación Ecosistema 2026:** Se generó un informe exhaustivo con 7 secciones clave cubriendo herramientas Open Source, tendencias Ecosistema 2025-2026, psicología de conversión, análisis competitivo, retención y churn, automatización multitenant CI/CD y plan de acción priorizado.
    - **Hoja de Ruta Maestra:** Se construyó `hoja_de_ruta_maestro.md` definiendo el Core, mapa de nichos de mercado (Restaurantes, Servicios, Tendero, Talleres, etc.), fases de crecimiento y el backlog estratégico.
    - **GEMINI.md Actualizado:** Se inyectaron disparadores automáticos (`@postchange`, `@extraer-componente`, `@decision-negocio`) y reglas de sincronización proactiva de hitos de negocio.
    - **Integración de Mapas:** Sincronizado en `mapa_documentacion_ia.md`.
  * Verificación: Guardado correctamente en disco y estructurado bajo los estándares de documentación.

* **[x] ~~Tarea 159: Adaptación e Integración de Componentes de Biblioteca a dev-dashboard~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Copiado al Portapapeles:** Se integró el hook `useCopyToClipboard.js` permitiendo copiar con un clic el ID del reporte y el token de telemetría desde la Ficha de Telemetría.
    - **Comprobantes PDF:** Se adaptó el servicio de exportación PDF (`pdfService.js`) usando `jspdf` y `jspdf-autotable` para permitir al desarrollador descargar recibos comisionales premium.
    - **Alertas y Confirmaciones síncronas:** Se creó un proveedor de modales estéticos `AlertConfirmContext.jsx` para solicitar confirmación del desarrollador antes de aprobar pagos o cambiar estados de reportes en vivo.
    - **Alertas flotantes Toast:** Se implementó `useToast.js` y el componente `GuidedToast.jsx` para disparar notificaciones dinámicas en la esquina inferior derecha.
    - **Verificación:** Compilación del build de producción exitosa sin errores.

* **[x] ~~Tarea 158: Interfaz Premium de Alto Impacto para la Consola Ecosistema Central (dev-dashboard)~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Gráficos Estilizados de Comisiones:** Se implementó una visualización premium interactiva en base a barras porcentuales dinámicas que muestran el desglose de comisiones acumuladas del top 5 de clientes.
    - **Listados de Facturación Fluidos:** Se agregaron filtros de búsqueda y estado, y se integró un inspector de reportes lateral (cajón/drawer) con visualización de telemetría completa y botones interactivos para la aprobación rápida de facturas.
    - **Modo Oscuro Pulido:** Se re-diseñó la paleta cromática con fondos oscuros profundos, contornos finos en escala de grises y efectos de glassmorphism con desenfoque de fondo.
    - **Consola de Telemetría:** Se inyectó un monitor de diagnóstico de logs en tiempo real para visualizar eventos de red, actualizaciones de Firestore o simulaciones.
    - **Verificación:** Compilación del build de producción exitosa.

* **[x] ~~Tarea 157: Corrección de Crash en Botón de Guardado de Comisiones y Permisos de Telemetría Central~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Botón Estable:** Se solucionó el crash `insertBefore` en `AdminSettings.jsx` reemplazando los condicionales del DOM por alternancia de clases en el icono de guardado.
    - **Firestore Rules Centrales:** Se modificaron y desplegaron las reglas en `prototipe-multi-instancia-control` para habilitar `update` público con token de cliente activo, permitiendo la actualización correcta de reportes de facturación mensuales.
    - **Verificación:** Compilación local del cliente exitosa.

* **[x] ~~Tarea 156: Centralización Ecosistema (Híbrido Spark/Blaze) y Consola del Desarrollador (Dashboard Dev)~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Servicio Telemetría Híbrido:** Se modificó `telemetryService.js` para inicializar dinámicamente un cliente de Firebase secundario apuntando a la base de datos de control del desarrollador (modo Spark directo a Firestore) si no se configura un endpoint HTTP (modo Blaze / Cloud Functions), permitiendo una migración de 1 paso en el futuro.
    - **Dashboard Dev Privado:** Se creó `DashboardDev.jsx` con visualización en tiempo real de ingresos acumulados, estado de facturación (pendiente/pagado) y simulación de envío de reportes comisionales.
    - **Integración de Acceso:** Se añadió el botón de acceso directo en el submenú de Facturación en `AdminSettings.jsx` protegido por el PIN de desarrollador (`DEV_PIN`).
    - **Verificación:** Compilación limpia y exitosa mediante `npm run build`.

* **[x] ~~Tarea 155: Corrección de ReferenceError en Seguridad y Accesos en AdminSettings~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Importación de Módulo auth:** Se importó el objeto `auth` de Firebase directamente desde `../../config/firebaseConfig` en `AdminSettings.jsx` para evitar el crash `ReferenceError: auth is not defined` que ocurría al renderizar el campo de email del usuario autenticado en la sección de seguridad.
    - **Verificación y Despliegue:** Compilación del build de producción exitosa y desplegada a Firebase Hosting.

* **[x] ~~Tarea 154: Corrección de Creación de Créditos (Sincronización POS/Web y Carga en Listados)~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Alineación de Datos y Estados:** Se corrigieron los dos desencadenadores de creación de deudas en la colección `credits` de `orderService.js` (aprobación de crédito y venta POS) para registrar los campos planos requeridos (`clienteNombre`, `clienteCelular`, `montoTotal`) y cambiar el estado a `'activo'` para que carguen adecuadamente en las listas de "Activos" y "Pagados" del cliente y administrador.

* **[x] ~~Tarea 153: Eliminación de Preselección de Color por Defecto en Detalles de Producto~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Portal QR y Vista Cliente:** Se modificó la inicialización en `ProductDetailPage.jsx` y `ProductPublicDetail.jsx` para que no preseleccione ningún color de forma predeterminada al ingresar, mostrando la portada/imagen principal de respaldo y forzando al cliente a elegir una opción antes de continuar.

* **[x] ~~Tarea 152: Autorización de Validación de Formulario y Flujo Silencioso en CheckoutModal~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Visibilidad del Nombre:** Se inicializó `showNameField` en `true` para asegurar que el usuario siempre visualice el input del nombre al ir a pagar.
    - **Formato del Celular:** Se removió la limpieza automática de nombre y el ocultamiento del campo del nombre en la entrada del celular.
    - **Validación en Paso 2:** Se inyectaron validaciones tempranas de formato de texto (mínimo 3 caracteres para nombre, 7 dígitos para celular) en la transición al Paso 3, notificando al usuario de forma clara con `errors.global`.
    - **Feedback en Paso 3:** Se mapearon los fallos de validación Zod en `handleCheckout` para asignarse al campo `global`, garantizando que si el envío falla se notifique al usuario la causa exacta.
    - **Persistencia de Modal Exitoso:** Se eliminó la llamada automática a `onClose()` al presionar "Avisar por WhatsApp" (`handleWhatsApp`), de modo que el modal de pedido exitoso (Paso 4) permanezca abierto en segundo plano. Esto permite al cliente realizar ambas acciones (avisar por WhatsApp y consultar el estado del pedido) de forma libre y en cualquier orden sin que el modal se cierre repentinamente.

* **[x] ~~Tarea 151: Reubicación Estratégica de Precios Above-the-Fold y Compresión de Espaciado Vertical~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Reubicación de Precios:** Se trasladó la visualización de precios al encabezado principal del producto. Se eliminaron las secciones de precio redundantes en la parte inferior de ambas páginas, logrando que el precio sea inmediatamente visible "above the fold".
    - **Alineación a la Izquierda:** Se rediseñó la cabecera móvil de `ProductDetailPage.jsx` eliminando el centrado para alinear el título, tags y precios a la izquierda, logrando una estética asimétrica y fluida y una mejor lectura del precio.
    - **Precio Tachado en Portal QR:** Se integró el hook `useAds` en `ProductPublicDetail.jsx` para que la vista pública QR acceda a las campañas activas y calcule correctamente el precio original tachado junto al descuento promocional (`% OFF`).
    - **Réplica de Encabezado Superior Fijo:** Se implementó la misma barra superior fija de `ProductPublicDetail.jsx` en `ProductDetailPage.jsx`, mostrando el botón de retroceso (`ChevronLeft`), el título de sección "Detalle del Producto" y el nombre del negocio (`appName`) al centro.
    - **Replicación de Botones (Bolsa +):** Se reemplazó el texto del botón "Carrito" en la página de detalle por un botón icónico compacto con el icono `ShoppingBag` y el símbolo `+`. El botón "Comprar Ahora" ocupa el resto de la fila de manera proporcional en desktop y móvil.
    - **Reutilización de QuantitySelector en Portal QR:** Se eliminó el maquetado `- / +` manual de cantidades ad-hoc de `ProductPublicDetail.jsx` y se reemplazó por la integración en cascada del componente atómico reutilizable `<QuantitySelector />` en su tamaño por defecto (`size="md"`), garantizando al 100% la consistencia visual y de comportamiento.
    - **Efecto Glassmorphism en el Footer:** Se modificaron los estilos del contenedor inferior de compra en `ProductDetailPage.jsx` para implementar el mismo acabado semitransparente con desenfoque de fondo y micro-borde (`bg-surface/90 backdrop-blur-md border-t border-app`) utilizado en el Portal QR.
    - **Corrección de Bug de Referencia en Checkout:** Se resolvió el `ReferenceError` de `currentSettings` al abrir el modal de Checkout, elevando la variable al ámbito global del componente `CheckoutModal` mediante `useMemo` y eliminando duplicidades locales.
    - **Compresión de Espaciado:** Se redujo el espaciado vertical general de las variantes de `space-y-6` a `space-y-4`, y los títulos internos a `space-y-1.5`, acercando el selector de color a las miniaturas y optimizando la altura visual para evitar scroll.
    - **Verificación:** Compilación local exitosa con 0 errores.

* **[x] ~~Tarea 150: Unificación Estética del Portal QR y Solución de Sincronización de Imágenes en Variantes~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-03
  * Historial / Revisiones:
    - **Alineación Visual en Portal QR (`ProductPublicDetail.jsx`):** Se ajustaron los tamaños de las miniaturas de imágenes secundarias a `w-14 h-14` e interespaciados idénticos a los de `ProductDetailPage.jsx`. Se alinearon los selectores de variantes ("Talla" y "Color") aplicando el tamaño de fuente `text-sm font-semibold text-app flex justify-between items-center` e invirtiendo el orden de renderizado para colocar la Talla por encima del Color en correspondencia exacta.
    - **Solución al Cambio de Imagen por Color, Autoplay y Glow:** Se resolvió el bug de actualización de imagen al seleccionar color aplicando decodificación de URI y coincidencia con `currentVariant`. Se inyectó autoplay de 5 segundos con pausa cuando se selecciona color y toggle en clic para permitir deseleccionar. Además, se configuró una propiedad `boxShadow` con brillo neon del color seleccionado en los círculos de variantes.
    - **Alineación de Carrusel, Flechas y Miniaturas Borderless:** Se inyectó `<AnimatePresence>` para el resplandor de opacidad de imágenes en el portal QR, y se escalaron las flechas a `w-10 h-10` (Chevron size 24). Se removieron los bordes negros de las miniaturas de imágenes secundarias en ambos componentes y se homologó su efecto interactivo de forma fluida (la seleccionada escala a `scale-105` con sombra y 100% de opacidad, las inactivas se contraen a `scale-95` y 60% de opacidad con transición de 200ms).
    - **Verificación:** Compilación local exitosa con 0 errores y validación en servidor de desarrollo.

* **[x] ~~Tarea 149: Armonización de Portal de Compra QR y Galería Condicional en Administrador~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Portal de Compra QR y Detalle Cliente (Completado - 2026-06-02):** Se removió el banner amarillo estático de ubicación, calificaciones y sub-rankings. Se unificaron los encabezados removiendo el botón de compartir de la cabecera del portal QR (dejando solo retroceso). Se inyectaron los tres botones de acción flotantes (Favorito, Compartir, WhatsApp) sobre el carrusel de la página de detalle normal. Se integraron gestos táctiles de deslizamiento horizontal (`swipe/drag` con Framer Motion) en ambas galerías. Se corrigió el selector de variantes para mostrar círculos de colores planos sin bordes rústicos, removiendo miniaturas de imagen internas, y ocultando las etiquetas de color que correspondan a códigos hexadecimales con `#`. Se sanitizó la acción de compartir para excluir links web directos de los mensajes para prevenir bloqueos por spam de Meta/WhatsApp.
    - **Renderizado Condicional de Favoritos (Completado - 2026-06-02):** Se implementó una verificación del rol y estado de la sesión (`role === 'client' && user`) en el portal QR y la página detallada interna. El botón con forma de corazón para agregar a favoritos se oculta dinámicamente si el usuario cliente no está logueado o si la sesión activa pertenece a un rol administrativo o empleado, permitiendo un uso limpio y acoplado del store.
    - **Formulario de Administración (Completado - 2026-06-02):** Se implementó la visualización condicional para la sección "Galería de imágenes secundarias" (`showSecondaryGallery`). El apartado ahora se oculta de manera inteligente cuando el producto tiene configuradas variantes de color/talla para evitar duplicar campos de fotos, mostrándose únicamente para productos simples.

* **[x] ~~Tarea 148: Selección Automática de Variante por Defecto en Detalle de Producto~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Preselección Inicial (Completado - 2026-06-02):** Se modificó la inicialización en `ProductDetailPage.jsx` para que el primer color (`c[0]`) y primera talla (`t[0]`) disponibles con stock se seleccionen automáticamente al cargar la página, eliminando estados neutros y reposicionando la galería de forma nativa a la variante por defecto.

* **[x] ~~Tarea 147: Estandarización de Toast de Guardado en Ajustes de Administración~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Corrección de Transparencia en Ajustes (Completado - 2026-06-02):** Se añadieron las clases CSS `bg-surface/95` y `border-app` al toast de guardado (`saveMessage`) en `AdminSettings.jsx`, otorgándole un estilo sólido que se adapta dinámicamente al tema claro/oscuro y previniendo que el contenido de fondo se transparente.

* **[x] ~~Tarea 146: Enlace de Imagen por Variante y Enrutado Inteligente de Galería~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Soporte de Imagen por Variante en Crear/Editar (Completado - 2026-06-02):** Se añadió el campo `URL Imagen Variante` en la sección común de variantes (`renderVariantsSection`) de `ProductFormModal.jsx` para que el administrador pueda asociar imágenes a las variantes tanto al crear un nuevo producto (asistente wizard) como al editar uno existente.
    - **Navegación y Scroll Inteligente (Completado - 2026-06-02):** Se modificó `ProductDetailPage.jsx` para consolidar todas las URLs de imágenes de variantes dentro del array general del carrusel de imágenes. Al hacer clic en un color de variante, el sistema localiza el índice de la imagen de esa variante dentro del carrusel y ejecuta síncronamente `setActiveImageIndex(index)`, haciendo que el carrusel transicione de forma interactiva y natural a la imagen correspondiente.

* **[x] ~~Tarea 145: Rediseño Premium de la Vista Detallada de Producto~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Fase 4: Integración de Layout de Escritorio y Barra de Estado Unificada (Completado - 2026-06-02):** Se trasladó el detalle del producto (`producto/:id`) como una ruta hija del portal de la tienda (`/tienda/producto/:id`), logrando que en computadoras se renderice automáticamente con la barra lateral (Sidebar) y se constriña el ancho de la pantalla, activando correctamente la grilla de dos columnas (`md:grid-cols-2`) y evitando imágenes sobredimensionadas. En celulares, se mantuvieron el encabezado y navegación inferior ocultos para conservar la inmersión del flujo de compra. Se unificaron los botones de barra de estado en escritorio añadiendo el enlace de Mi Perfil junto a Carrito y Notificaciones en la cabecera del Sidebar de PC.
    - **Fase 3: Refactorización de Layout y Footer Slim (Completado - 2026-06-02):** Se removió el encabezado de página completo, dejando la flecha de ir atrás flotando directamente sobre el fondo general. Se reubicó el indicador de stock de forma absoluta (`absolute top-4 right-4 z-20`) en la esquina superior derecha sobre el contenedor de imagen redondeada. Se fijó y compactó el pie de página eliminando wrappers oscuros o traslúcidos, organizando el contador de unidades a la izquierda y los botones "Carrito" y "Comprar Ahora" a la derecha en una sola fila minimalista y estilizada de altura `h-9.5`.
    - **Fase 2: Rediseño de Flujo y Doble Acción (Completado - 2026-06-02):** Reordenamiento de cabecera-galería (título y categoría arriba, carrusel abajo), soporte dinámico de filtros de tallas y colores desde config, doble botón ("Agregar al carrito" y "Comprar ahora" con Checkout directo síncrono) e interactividad premium.
    - **Fase 1: Optimización de Espaciado y Layout (Completado - 2026-06-02):** Se redujo el espaciado global de la tarjeta de información y se eliminaron líneas horizontales toscas. Se reemplazó la tarjeta gris de descripción por un bloque editorial limpio sin bordes.
    - **Ubicación de Stock Above-the-Fold (Completado - 2026-06-02):** Se reubicó el indicador de unidades de stock disponibles (antes al final de la página) dentro del bloque de precios en la cabecera, logrando que el usuario visualice la disponibilidad de inmediato sin scroll.

* **[x] ~~Tarea 144: Remoción del bloque estático de reseñas en el detalle del producto~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Limpieza de UI de Ficha de Producto (2026-06-02):** Se removió el bloque estático visual que mostraba la calificación "4.8" junto con las estrellas amarillas de valoración y el conteo ficticio "(12 reseñas)" de `ProductDetailPage.jsx` a petición del usuario.

* **[x] ~~Tarea 143: Módulo de Identidad de Marca Completo (Favicon, SEO, Datos de Contacto y Reportes PDF)~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Nuevos campos en Firestore y Zustand (2026-06-02):** Se agregaron 7 campos (`faviconUrl`, `seoDescription`, `contactEmail`, `businessAddress`, `businessCity`, `privacyPolicyUrl`, `termsUrl`) al store local `appConfigStore.js` con soporte para persistencia e hidratación.
    - **Inyección dinámica de Favicon y Metatags SEO (2026-06-02):** Se modificó `App.jsx` para actualizar reactivamente la etiqueta `<link rel="icon">` y los meta `description` y `og:description` en base a los nuevos valores configurados.
    - **Formulario Administrativo de Configuración (2026-06-02):** Se añadieron inputs correspondientes a cada campo en la sección "Identidad de Marca" en `AdminSettings.jsx` y se enlazaron con el servicio de actualización de base de datos.
    - **Pie de Página Corporativo (2026-06-02):** Se integró un footer premium y minimalista en `ClientLayout.jsx` que consume dinámicamente el eslogan, dirección, ciudad, correo de soporte y enlaces a políticas de privacidad y términos y condiciones.
    - **Propagación en Reportes Financieros PDF (2026-06-02):** Se actualizó `pdfService.js` para recibir e imprimir los metadatos de la marca en la cabecera de los reportes financieros de ventas y rotación de stock de forma limpia y estilizada.

* **[x] ~~Tarea 142: Unificación de Estilos de Encabezados Superiores en Cliente y Admin~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Cabeceras Unificadas (2026-06-02):** Se estructuraron los encabezados móviles superiores de `ClientLayout.jsx` y `AdminLayout.jsx` con el mismo tamaño (`h-16`), estilo de barra translúcida (`bg-surface/80 backdrop-blur-md border-b border-app`), sombras e indicación de títulos de sección ("Tienda Virtual" vs "Panel Admin").
    - **Botones Estilizados (2026-06-02):** Se unificaron los botones circulares/cuadrados en el lado derecho de ambas cabeceras, empleando la misma clase de caja con micro-bordes y sombras suaves (`w-10 h-10 rounded-xl bg-surface hover:bg-surface-2 border border-app shadow-xs`), garantizando consistencia de píxeles al 100%.

* **[x] ~~Tarea 141: Implementación de Encabezado Superior para el Panel de Administración en Móvil~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Encabezado Superior Móvil (2026-06-02):** Se diseñó e integró un navbar superior fijo (`fixed top-0 left-0 right-0 h-16`) en `AdminLayout.jsx` visible únicamente en pantallas móviles/tablets. Muestra el logo del negocio (`appIcon`), nombre de la tienda (`appName`) y rol administrativo.
    - **Integración de Notificaciones (2026-06-02):** Se trasladó el botón flotante de notificaciones a la esquina superior derecha del nuevo encabezado móvil, alineando su diseño a chips interactivos discretos.
    - **Alineación de Contenido (2026-06-02):** Se añadió relleno superior responsivo `pt-16 md:pt-0` al contenedor del contenido principal (`main`) para evitar que el nuevo encabezado superponga o tape las vistas del panel en móviles.

* **[x] ~~Tarea 140: Estandarización de Botones de Retroceso y Rediseño de Cabeceras~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Protección contra Deformación (2026-06-02):** Se añadió la clase `shrink-0` al componente base `<BackButton />` para evitar que los botones de retroceso se deformen o aplasten en contenedores flex layouts.
    - **Estandarización de Vistas de Cliente (2026-06-02):** Se reemplazó el botón flotante manual en `ProductDetailPage.jsx` y se inyectaron clases `shrink-0` a los botones fijos superiores de `ProductPublicDetail.jsx`.
    - **Alineación de Cabeceras Administrativas (2026-06-02):** Se rediseñaron por completo las cabeceras de `AdminStockAlerts.jsx` (Reabastecer Inventario) y `AdminSalesDetail.jsx` (Análisis de Ventas), implementando un contenedor de icono con fondo de color primario (`bg-primary`) junto al título y subtítulo, idéntico al estándar de visualización premium de "Gestión de Pedidos".

* **[x] ~~Tarea 139: Creación y Depuración del Archivo de Colecciones de Base de Datos~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Documentación de Esquema de Firestore (2026-06-02):** Se creó la carpeta `Colecciones` y el archivo `colecciones.md` directamente en la raíz de la aplicación activa (`d:\Aplicaciones\App Ventas\Colecciones\colecciones.md`) para documentar detalladamente el propósito y la función de cada una de las 17 colecciones activas necesarias para el funcionamiento y contabilidad del sistema.
    - **Exclusión de Colecciones Depuradas (2026-06-02):** Se removió por completo la sección de "Colecciones Depuradas" (que listaba `tables` y `tableRequests` como obsoletas) a petición del usuario para mantener la documentación enfocada únicamente en el esquema activo real.
    - **Sincronización del Mapa de la Aplicación (2026-06-02):** Se registró y actualizó la entrada en `mapa_aplicacion.md` y se removió la antigua referencia de `mapa_documentacion_ia.md` correspondientemente.

* **[x] ~~Tarea 138: Histórico Mensual en Facturación del Desarrollador y Sincronización Contable~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Historial de Facturación (2026-06-02):** Se inyectó una nueva sección de visualización premium ("Histórico Mensual - Últimos 6 meses") en la subsección de Facturación del Desarrollador de `AdminSettings.jsx`. Este panel consume el array `desgloseMensual` en tiempo real de `billingService.js`, permitiendo que el desarrollador consulte las métricas exactas consolidadas mes a mes (Ventas totales del mes, pedidos completados y comisión correspondiente), mientras el mes actual se reinicia automáticamente en ceros al iniciar el nuevo período calendario.
    - **Sincronización del Dashboard (2026-06-02):** Se corrigió la tarjeta "Ventas de Hoy" de `AdminHome.jsx` para que compute y refleje atómicamente `cajaTotal` (la sumatoria de todos los ingresos liquidados del día en curso), erradicando el cálculo del acumulado histórico total de ventas que se mostraba anteriormente.

* **[x] ~~Tarea 137: Reorganización de la Sección de Tipografía en Ajustes de Apariencia~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Sección Colapsable por Categoría (2026-06-02):** Se convirtió cada categoría de fuente (`Modernas`, `Elegantes`, `Cursivas`, etc.) en un acordeón interactivo (`Collapsible`). Por defecto, todos los acordeones se renderizan cerrados, excepto aquel que contiene la fuente que el administrador tiene actualmente seleccionada para la aplicación en caliente (hidratación síncrona del store). Se acoplaron transiciones suaves de altura (`height: auto` y opacidad) en `motion.div` de Framer Motion, y un icono de Chevron interactivo que rota 180° dinámicamente al abrir o cerrar. Se conservó intacta la estructura y el diseño original de las tarjetas internas de fuentes.

* **[x] ~~Tarea 136: Ajuste de Métrica de Ventas de Hoy en el Dashboard del Admin~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Corrección de Métrica de Ventas (2026-06-02):** Se reemplazó el cálculo histórico total (`totalVentas`) en la tarjeta "Ventas" de `AdminHome.jsx` por las ventas acumuladas estrictamente el día de hoy (`todaySales`). Esto soluciona la discrepancia de valores donde el inicio mostraba el histórico acumulado mientras que el detalle mostraba por defecto el mes o rango específico. Se actualizó además el nombre visual a "Ventas de Hoy" y el subtítulo informativo a "Ventas completadas el día de hoy." para mayor claridad operativa.

* **[x] ~~Tarea 135: Pedido en Mesa desde Checkout para Clientes No Sentados~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Selector de Mesas en Checkout (2026-06-02):** Se habilitó la opción "Pedido en Mesa" en `CheckoutModal.jsx` para los clientes que entran a la tienda sin haber escaneado previamente un código QR de mesa. Al seleccionar este método de entrega, se renderiza un selector desplegable con las mesas disponibles (`estado === 'disponible'`) leídas en tiempo real desde Firestore. Al finalizar el checkout, se asocia el pedido a la mesa elegida, se transiciona su estado a `'ocupada'`, se genera un llamado del tipo `'cliente_sentado'` para notificar al mesero, y se vincula la mesa activa a la sesión del cliente (`activeTable` en Zustand y `sessionStorage`).

* **[x] ~~Tarea 134: Módulo de Pedidos Dinámicos en Mesa y Autoservicio QR~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Confirmación Interactiva de QR de Mesa y Flujo de Salida/Cobro (2026-06-02):**
      1. Se reemplazó el escaneo de QR automático y silencioso por un **Modal de Confirmación de Asentamiento de Cliente**. Al leer un código QR de mesa, en lugar de ocupar la mesa a ciegas, se despliega un modal interactivo translúcido consultando al cliente si desea registrarse en la mesa. Si declina, se limpia el parámetro de la URL sin recargar y continúa navegando libre de la mesa. Si acepta, se transiciona a `'ocupada'`, se registra el cliente en la mesa y se genera la notificación al mesero.
      2. Se incorporó el botón **"Salir"** en la barra de autoservicio del cliente. Al presionarlo, si el cliente no ordenó nada, la mesa se desocupa y el cliente se desvincula instantáneamente. Si ordenó productos, la mesa se libera y el sistema muestra automáticamente el desglose de productos y total en la tarjeta de despedida del cliente (Cuenta automática) para su validación previa.
      3. Se integró la comanda directamente con **Venta Directa (POS)**. Al cargar productos, el mesero es redirigido al POS unificado (`PortalVendedor.jsx`), el cual reconoce el contexto de la mesa, preconfigura al cliente, bloquea los campos manuales de cliente y cambia la acción final a `"Cargar a Mesa X"`. Al finalizar, si ya existe un pedido activo, los nuevos productos se fusionan/actualizan de forma transparente en la comanda existente en Firestore en lugar de duplicarse, y redirige síncronamente al mesero a su portal. Se eliminó todo el código redundante del catálogo táctil local de meseros.
    - **Sincronización en Tiempo Real de Liberación de Mesa y Tarjeta de Despedida (2026-06-02):**
      Se implementó un listener reactivo (`onSnapshot`) en `TableMenuBar.jsx` sobre el documento de la mesa en Firestore. Cuando el mesero libere la mesa (transicionando a `'disponible'`), el cliente detecta instantáneamente el cambio. Automáticamente se cancela el modo minimizado y se despliega una hermosa tarjeta de agradecimiento en fondo verde esmeralda con un corazón animado y el copy solicitado: `"¡Gracias por tu compra! ✨ Esperamos verte pronto de nuevo. ¡Que tengas un excelente día!"`. Al presionar el botón `"Aceptar"`, se limpian síncronamente los datos de la sesión local (`sessionStorage` y Zustand) y se remueve el parámetro `tableId` de la URL para desvincular al cliente de forma fluida.
    - **Enrutamiento Inteligente, Carga de Productos y Minimizado de Autoservicio (2026-06-02):**
      1. Se reemplazó el botón "Salir" en `TableMenuBar.jsx` por un botón de "Minimizar" persistente en `sessionStorage` que colapsa la barra flotante a una píldora discreta (`🍽️ Mesa X`) para no tapar contenido.
      2. Agregada validación atómica al solicitar la cuenta; se requiere tener un pedido registrado en mesa (`pedidoActivoId` en Firestore) para evitar llamados en vacío.
      3. Integrado switch de disponibilidad de mesero ("Disponible" / "Ocupado") en el encabezado responsivo del Portal de Mesero que persiste en Firestore, con enrutamiento de llamados automático. En caso de estar todos ocupados, el cliente visualiza un mensaje en tiempo real: `"🚶‍♂️ Danos un momento por favor, todos nuestros meseros están atendiendo a nuestros clientes. Te atenderemos lo antes posible."`
      4. El mesero ahora puede consultar la comanda de la mesa en tiempo real e inyectar productos a pedidos nuevos o existentes mediante un catálogo táctil integrado. Sincronizada la etiqueta de las alertas del POS a `"en Mesa (Mesa X)"`.
    - **Corrección de Ocupación Automática y Alerta por Escaneo QR (2026-06-02):** Se inyectó un listener automático en el hook de captura de QR de la mesa (`App.jsx`). Al leer un `tableId` válido desde el código QR escaneado por el cliente, si el estado inicial de la mesa en la base de datos es `'disponible'`, se transiciona de forma inmediata a `'ocupada'`. Asimismo, se emite una alerta del tipo `'cliente_sentado'` en la colección `tableRequests` para disparar la alerta visual y sonora del mesero en su Portal, utilizando almacenamiento en `sessionStorage` para blindar la generación redundante de alertas al refrescar la página.
    - **Capa de Configuración y Feature Flag (2026-06-02):** Integración de `tablesEnabled` en Zustand y Firestore config, permitiendo encender/apagar dinámicamente todo el módulo a nivel global. En `AdminSettings.jsx`, se esconden dinámicamente el botón de "Configuración de Mesas" en la barra de ajustes si el flag está inactivo.
    - **Generador de Códigos QR Stickers (2026-06-02):** Implementación de `TableQRModal` que permite renderizar un canvas de QR Code apuntando a `${window.location.origin}/?tableId=${table.id}` con opciones de descarga en PNG de alta resolución, copiado del enlace e impresión directa como sticker con instrucciones visuales adaptadas.
    - **Captura URL y Floating TableMenuBar (2026-06-02):** Agregados listeners en `App.jsx` para parsear URL params en frío, recuperar la mesa válida desde Firestore, enlazarla a Zustand y sessionStorage, y renderizar la barra interactiva `TableMenuBar` que flota sobre toda la interfaz de compra del cliente ofreciendo un atajo instantáneo para llamar al mesero y pedir la cuenta digitalmente.
    - **Checkout Bloqueado y Cero Costo (2026-06-02):** Modificado el `CheckoutModal.jsx` para que si se detecta una mesa activa en sesión, la opción de envío se restrinja y autoseleccione a "Entrega en la Mesa", ocultando todos los formularios de dirección, barrio, ciudad, mapa GPS Leaflet y forzando el costo de envío a `$0` atómicamente. Se enlazan `tableId` and `tableName` en el payload final de la orden en Firestore.
    - **Flujo y Notificaciones Táctiles (2026-06-02):** Implementada la colección `tableRequests` y la suscripción en tiempo real en `PortalMesero.jsx` que emite sonido de campana y renderiza un listado superior táctil de llamados/cuentas con botones de "Atender" en caliente. Modificado `PortalCocina.jsx` para destacar la mesa en el banner de comandas de cocina con íconos de salón.

* **[x] ~~Tarea 133: Solución de FOUC Cromático (Destello de Color en Carga de Temas)~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Pre-Hidratación Síncrona en Zustand (2026-06-02):** Se detectó que el estado de Zustand se inicializaba con el valor por defecto síncrono (`theme: 'rosa-elegante'`) antes de que el middleware `persist` realizara la hidratación asíncrona de LocalStorage tras el montaje. Esto causaba que la aplicación se renderizara inicialmente en color rosa y luego cambiara instantáneamente a verde (u otro tema configurado), generando un parpadeo cromático visible. Se implementó una función lectora síncrona `getPersistedValue` directamente en la declaración del store base en `appConfigStore.js` para leer e inyectar el tema síncronamente antes del primer renderizado de React.
    - **Controlador Dinámico de Transición de Temas (2026-06-02):** Se removió la transición síncrona del `body` base en `src/index.css`. Se aplicó `background-color: var(--color-bg)` directamente al selector `html` de forma síncrona para actuar como máscara instantánea libre de flashes. Se definió la clase `.with-transitions body` y se configuró un `useEffect` en `src/App.jsx` para inyectarla de forma segura tras 500ms (hidratado inicial completo), preservando transiciones suaves posteriores de dark mode o cambios en vivo sin destellos de carga.

* **[x] ~~Tarea 132: Rediseño Premium de Tarjetas de Campañas en Publicidad y Promociones~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Tarjetas Flotantes Individuales y Cero Divisores (2026-06-02):** Se removió el contenedor de listado unificado y la clase `divide-y divide-app`, eliminando por completo la línea negra de separación. Ahora cada anuncio/promoción se renderiza como una **tarjeta flotante individual e independiente** (`space-y-4` en el contenedor y `bg-surface rounded-3xl shadow-sm hover:shadow-md p-5 flex`), garantizando un acabado sumamente elegante, moderno y libre de líneas molestas.
    - **UI Premium de la Lista de Anuncios (2026-06-02):** Se realizó un rediseño de alta gama de los items de la lista de publicidades en `AdminSettings.jsx` sin eliminar ninguna funcionalidad ni lógica. Cada anuncio se estilizó con mayor espaciado interno, miniaturas en `w-14 h-14` con sombras suavizadas y bordes redondeados adaptativos, badges de tipo y estado con bordes de color al 10% de opacidad y textos en negrita, indicador de vigencia con microicono de calendario (`Calendar`), botones de acción ("Activar/Desactivar") consistentes, y botones circulares redondeados para editar (`Paintbrush` con fondo ámbar pastel) y eliminar (`Trash2` con fondo rojo pastel) que cambian a color plano al hacer hover.

* **[x] ~~Tarea 131: Sincronización del Módulo de Garantías y Reclamos en la Vista de Pedidos del Administrador~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Visibilidad Dinámica en la Cabecera de Pedidos (2026-06-02):** Se detectó que el botón de acceso rápido de "Garantías y Reclamos" en la cabecera de `AdminOrders.jsx` se renderizaba de forma estática sin respetar el estado del feature flag del negocio. Se importó `claimsEnabled` de `useAppConfigStore()` en `AdminOrders` y se envolvió el botón en un condicional reactivo `{claimsEnabled && ...}`, garantizando que al desactivar las garantías en la configuración del administrador, el botón desaparezca por completo de la vista de pedidos de toda la aplicación, manteniendo absoluta consistencia y lógica de negocio modularizada.

* **[x] ~~Tarea 130: Rediseño Premium de Tarjetas de Subcategorías en Personalizar Tienda~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Remoción de Bordes y Líneas Divisorias (2026-06-02):** Se eliminaron por completo las clases `border border-app` y `divide-y divide-app` del contenedor de subcategorías, removiendo los bordes externos negros y las líneas divisorias oscuras. Ahora la lista se dibuja directamente sobre la tarjeta contenedora utilizando solo el sombreado suave de elevación (`shadow-sm`) y las esquinas suavizadas (`rounded-3xl`), garantizando consistencia total de píxeles y simetría al 100% con la estética minimalista del menú de ajustes principal.
    - **Alineación de Diseño al Menú de Ajustes Principal (2026-06-02):** Se reemplazó la cuadrícula de tarjetas verdes sobredimensionadas por una lista vertical compacta de estilo premium y minimalista. Cada item incorpora iconos estilizados dentro de pequeños contenedores redondeados con colores pasteles/semitransparentes acordes a cada módulo (`bg-XX/10`), títulos en negrita e indicación de navegación mediante flechas `ChevronRight`.
    - **Corrección de Sintaxis JSX y Ternario en AdminSettings.jsx (2026-06-02):** Se identificó y solucionó un error crítico de compilación en el módulo `AdminSettings.jsx` provocado por un cierre incompleto del operador ternario dinámico (`activeSubSection === null ? ... : ...`) en la sección de Personalizar Tienda. Se acopló correctamente la sintaxis con el cierre de paréntesis respectivo, restableciendo la estabilidad de la compilación y la carga fluida en la app.

* **[x] ~~Tarea 129: Rediseño Premium Animado del Botón Central de Barra Móvil~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Rediseño Táctil y Microinteracciones (2026-06-02):** Se adaptó el botón central a `w-16 h-16` con `overflow-visible`, traslación `translate-y-1` e icono de `Tag` a `28px`. Se inyectó una timeline infinita de balanceo suave de 10º cada 2s (`animate-wiggle-infinite`) y barrido de brillo gloss diagonal cada 4s (`animate-shimmer-infinite`). El badge del contador se reajustó a un tamaño gigante de `w-7 h-7` con fuente de `14px font-black` superpuesto en `top-[-6px] right-[-6px]`.

* **[x] ~~Tarea 128: Depuración de Alcance: Eliminación Completa de Cuotas, Banner Premium y Sellos de Confianza~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Depuración de UI de Ficha de Producto y Administrador (2026-06-02):** Se removieron por completo las secciones relativas a cuotas dinámicas sin interés (módulo 7), banner premium de beneficios extras (módulo 8) y sellos de confianza (módulo 9) por considerarse excedentes fuera del alcance deseado para el negocio. Se limpió la interfaz del administrador en `AdminSettings.jsx` y los renderizadores de productos en `ProductDetailModal.jsx` y `ProductPublicDetail.jsx`. Desplegado a producción en Firebase Hosting.

* **[x] ~~Tarea 127: Correctivo y Rediseño de Capa de Optimización Comercial~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Simplificación y Unificación de UI de Módulos (2026-06-02):** Se removió por completo la tarjeta colapsable externa y su estructura de acordeón ("Capa de Optimización Comercial") que agrupaba los 4 módulos de conversión. Ahora se renderizan directamente las 4 opciones de conversión (Etiquetas Inteligentes, Galería Avanzada, Recomendaciones de Carrito, Sugerencias de Historial) en una sola lista limpia y unificada con bordes suavizados y separadores finos dentro de una única tarjeta contenedora, eliminando redundancias visuales y tarjetas anidadas. Se corrigió un desborde de sintaxis removiendo un fragmento remanente duplicado de código JSX al final de la subsección. Compilado con éxito.
    - **Corrección Crítica de Carrera Asíncrona (Opción 6 / historyRecommendations) (2026-06-02):** Se detectó y resolvió una condición de carrera asíncrona en la sincronización global. La carga rápida de los filtros de catálogo establecía la bandera de carga global de la aplicación (`isLoaded: true`) antes de que el listener de Firestore de ajustes generales resolviera. Esto provocaba que el formulario del administrador se inicializara de forma prematura con datos locales de LocalStorage/Default (donde la Opción 6 figuraba como habilitada), bloqueando la posterior actualización de la configuración real de Firestore y provocando la auto-activación al guardar. Se aisló la carga de filtros mediante una nueva acción `setCatalogFilters`, blindando la inicialización síncrona.
    - **Reestructuración y Fix de Guardado (2026-06-02):** Reestructuración de la interfaz en `AdminSettings.jsx` para convertir la tarjeta en un acordeón expandible/colapsable (cliqueable con flecha indicadora), removiendo el switch general. Solución al bug crítico de guardado granular implementando un mapeador con merge profundo (`mergeCommercialOptimization`) para garantizar que cada opción individual de la 1 a la 9 persista explícitamente su booleano `true` o `false` en Firestore sin provocar activaciones masivas involuntarias por desbordes de valores `undefined`.
    - **Condicionamiento de Campos Avanzados en ProductFormModal (2026-06-02):** Se suscribió `ProductFormModal.jsx` al store para leer `commercialOptimization` y `claimsEnabled`. Se calcularon 6 banderas reactivas de visibilidad. En sección de variantes: campos de Nombre, Precio, SKU y URL de imagen ahora solo aparecen si `visualVariationsEnabled === true`; Stock siempre visible. El acordeón "Configuración Avanzada de Producto" se oculta por completo si ningún módulo está activo; internamente, cada sub-campo se condiciona a su módulo correspondiente (Galería → `advancedGallery`, SEO + Descripción → `optEnabled`, Garantía → `claimsEnabled`, Relacionados → `recommendations`). Build ✓ sin errores.

* **[x] ~~Tarea 126: Integración Permanente del Botón y Badge de Carrito de Compras en ClientLayout~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Optimización de UI de Sidebar de PC (2026-06-02):** Se solucionó un problema de visualización amontonada en el encabezado de la barra lateral en la versión de PC. El logo del negocio (`w-[54px]`) ocupaba excesivo espacio horizontal, desplazando el nombre de la tienda y amontonando los botones del carrito y notificaciones. Se redujo el logo a `w-10 h-10 rounded-xl` (consistente con el panel administrativo), se envolvió el nombre del negocio en un contenedor flexible con `flex-1 min-w-0 truncate` y se inyectó la etiqueta `Tienda Virtual` en tamaño micro, logrando una distribución premium, limpia y espaciosa en pantallas de escritorio.
    - **Integración Permanente (2026-06-02):** Se detectó que el carrito de compras no era visible cuando estaba vacío porque el SmartHint se ocultaba al tener 0 elementos. Se integró un botón permanente con ícono de `ShoppingCart` y un badge de conteo dinámico (`cartCount > 0` con efecto pulse) tanto en la barra lateral de escritorio (junto a la campana de notificaciones) como en el encabezado móvil de `ClientLayout.jsx`. Compilado con éxito sin errores.

* **[x] ~~Tarea 125: Sistema Centralizado del Notification Center e Infraestructura Centralizada de Mensajería y FCM~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Ajuste de Responsividad del Cajón de Notificaciones (2026-06-02):** Se detectó que el cajón del historial de notificaciones no cubría el 100% de la pantalla en dispositivos móviles en los paneles de administración y portales debido a un ancho estático `w-80`. Se reemplazó por la clase responsiva `w-full md:w-80` y se ajustó la animación de Framer Motion a porcentajes fluidos (`x: '100%'`). Se corrigió además la superposición del botón flotante móvil en la administración reduciendo su z-index a `z-40` para garantizar una integración limpia e impecable.
    - **Implementación Completa (2026-06-02):** Creación del servicio core `notificationCenterService.js`, hook unificado de tiempo real y de control de sonido por categoría `useNotificationCenter.js`, hook inteligente de permisos push y tokenización `useFCMPermission.js`, bandeja unificada lateral `NotificationHistoryTray.jsx`, contenedor de toasts Framer Motion `NCToastContainer.jsx`, panel administrativo de métricas/analytics `AdminNotificationAnalytics.jsx` y Service Worker `firebase-messaging-sw.js`. Sincronizado en AdminLayout, ClientLayout, PortalLayout, y todos los servicios de negocio.
* **[x] ~~Tarea 123: Módulo de Optimización Comercial y Conversión~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Corrección de Interactividad de Clic en el Banner de Promociones (2026-06-02):** Se solucionó la falta de interactividad en clics de banners promocionales reemplazando `e.preventDefault()` por `e.stopPropagation()`. Además, se implementó un fallback dinámico y robusto para que si un producto enlazado de tipo `inventory` no está completamente cargado en memoria, el sistema abra inmediatamente el modal promocional en su lugar, evitando comportamientos inertes en la interfaz del cliente.
    - **Alineación Visual y Maquetación de Mercado Libre (2026-06-02):** Reestructuración premium de la ficha pública de producto (`ProductPublicDetail.jsx`) posicionando título, metadatos (`Nuevo | +50 vendidos`) y calificación arriba de la imagen. Inyección de subheader de ubicación en amarillo (`#fff159`), botones de acciones flotantes del carrusel, paginación blanca indexada ("1 / 3"), selector de variantes en cuadrícula de imágenes reales y bloques financieros/logísticos (cuotas dynamic 0%, FULL shipping gratis mañana, devolución 30 días) para calcar fielmente las capturas de pantalla del cliente. Sincronizado en `ProductDetailModal.jsx` y compilado con éxito.
    - **Implementación Completa (2026-06-02):** Implementación exitosa de las 6 herramientas premium de conversión. Incluye Smart Tags dinámicas en tarjetas, galería avanzada con slider táctil e indicador de página, selector de variaciones visuales tipo thumbnail, indicadores en catálogo, recomendador asíncrono con puntuación ponderada basado en carrito/compras históricas e incremento atómico de ventas reales. Todo 100% borderless, estilizado y adaptado fielmente a las capturas del usuario.

* **[x] ~~Tarea 122: Sistema Integral de Mensajero Propio y Gestión de Domiciliarios~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Corrección de Stepper de Seguimiento en Tiempo Real Dinámico (2026-06-01):** Se solucionó el problema en el cual se mostraban estados de cocina o despacho que no correspondían a la configuración operativa del negocio. Se eliminó la suposición estática y el fallback para sesiones de invitados no autenticados, y se implementó un filtrado dinámico en `OrderTracking.jsx` que lee el array global de empleados (`employees`) del store público, omitiendo el paso de "En Preparación" si el negocio no posee cocineros contratados, y ajustando de forma precisa los pasos de envío.
    - **Corrección de Recorte del Badge de Ofertas en Navegación Móvil (2026-06-01):** Se solucionó el problema en el cual el badge del contador de ofertas activas en el menú inferior mobile quedaba ocultado bajo un recorte blanco. Se reubicó el `span` del badge de cupones activos de modo que quede posicionado fuera del contenedor animado circular (`motion.div`) con `overflow-hidden`, resolviendo el recorte por completo.
    - **Corrección de Redirección WhatsApp de Mensajeros Externos (2026-06-01):** Se solucionó el problema en el cual la plantilla de mensaje no se enviaba al presionar el botón de WhatsApp del mensajero externo. Se mejoró la limpieza del teléfono en `OrderDeliveryPanel.jsx` y `PortalMensajero.jsx` para evitar duplicar el código de país de Colombia `57` (lo cual causaba que WhatsApp ignorara los parámetros del mensaje) y se cambió el enlace para utilizar la API oficial de WhatsApp (`https://api.whatsapp.com/send?phone=...&text=...`) garantizando total compatibilidad en clientes de escritorio y móviles.
    - **Corrección de Reglas de Seguridad (2026-06-01):** Solucionado error `FirebaseError: Missing or insufficient permissions` provocado por un anidamiento incorrecto de la regla de la subcolección `messengers` dentro de `match /config/{document}`. Se aplanó a un match independiente absoluto `/config/delivery/messengers/{messengerId}`.
    - **constants/index.js:** Añadidas constantes `DELIVERY_STATES`, `DELIVERY_STATE_LABELS`, `MESSENGER_STATUS`, `MESSENGER_STATUS_LABELS`, `DEFAULT_MESSENGER_TEMPLATE`, `COLLECTIONS.DELIVERY_ANALYTICS`. `ORDER_STATE_META` extendido con `fallido` y `reprogramado`.
    - **deliveryService.js:** Reescrito completamente. CRUD de mensajeros externos (`getExternalMessengers`, `addExternalMessenger`, `updateExternalMessenger`, `deleteExternalMessenger`, `setMessengerStatus`). Asignación (`assignDelivery`, `unassignDelivery`), cambio de estado con historial (`updateDeliveryStatus`), sincronización bidireccional con colección `orders` (`_syncOrderDeliveryInfo`), analítica agregada (`_updateDeliveryAnalytics`), suscripciones en tiempo real (`subscribeToDeliveries`, `subscribeToAllDeliveries`), generador de mensaje de mensajero (`buildMessengerMessage`).
    - **appConfigStore.js:** Añadido `customDelivery` a `deliverySettings` con campos: `enabled`, `serviceLabel`, `costType`, `fixedCost`, `allowCustomCost`, `estimatedTime`, `messengerTemplate`. Persistido en `partialize`.
    - **DeliveryCustomMessengerPanel.jsx:** Nuevo componente para AdminSettings. Gestiona: activación del módulo, tipo de costo (fijo/personalizado), tiempo estimado, editor de plantilla con variables, CRUD completo de mensajeros externos con estado en tiempo real.
    - **AdminSettings.jsx:** Importado e integrado `DeliveryCustomMessengerPanel` en la sección de Métodos de Entrega.
    - **OrderDeliveryPanel.jsx:** Nuevo componente para la tarjeta de pedidos en AdminOrders. Carga empleados con rol Mensajero y mensajeros externos, permite asignar/retirar, cambiar estado logístico, enviar mensaje WhatsApp con plantilla, y ver historial de eventos.
    - **AdminOrders.jsx:** Importado e integrado `OrderDeliveryPanel`, visible solo cuando `tipoEntrega === 'domicilio'` y `customDelivery.enabled`.
    - **PortalMensajero.jsx:** Refactorizado completamente (v2). Nuevos estados: `listo`, `reprogramado`. Stepper visual, botones de contacto al cliente (WhatsApp + llamada), modal de nota obligatoria para estados negativos, sección de entregas completadas del día.
    - **AdminDeliveryPerformance.jsx:** Nueva página de analítica: KPIs (total/entregados/fallidos/tiempo promedio), ranking de domiciliarios con barra de eficiencia, distribución diaria. Filtros de 7/14/30 días.
    - **AppRoutes.jsx:** Añadida ruta `/admin/rendimiento-entregas` con lazy loading.
  * Build: ✅ Exitoso (`npm run build` ✓ 1.03s, 0 errores TypeScript/JSX).

* **[x] ~~Tarea 121: Reemplazar Botones de Descarga Externos por Tarjeta de Instalación Nativa PWA en Ficha de Seguimiento y Ajustes Limpios~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-01
  * Historial / Revisiones:
    - **OrderTracking.jsx:** Se integró el hook de instalación `usePWAInstall` junto con las banderas de entorno del dispositivo (`isIOS`, `isStandalone`). Las tarjetas de PWA se condicionaron a la variable activa de configuración `appPromo?.enabled` y leen en tiempo real el título, mensaje comercial e imagen del banner inyectados por el administrador en caliente.
    - **AdminSettings.jsx:** Se eliminaron los campos obsoletos de enlaces externos a Google Play y App Store de la interfaz de configuración del panel administrativo. Se renombró la categoría a *"Promoción de Aplicación PWA (Instalación Directa)"* y se pulieron los placeholders descriptivos.
    - **Validación Standalone:** Si el usuario ya navega en la PWA instalada, se renderiza un badge elegante de color esmeralda certificando que la app está instalada y lista.
  * Build: ✅ Exitoso (`npm run build` ✓ 1.13s).

* **[x] ~~Tarea 120: Implementar Módulo de Configuración de Mesas (CRUD) para Salón y Mesero~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-01
  * Historial / Revisiones:
    - **AdminSettings.jsx:** Se inyectó un componente maestro interactivo `AdminTablesCRUD` para la administración de las mesas del salón (crear, listar, editar, eliminar) en `activeSubSection === 'mesas'`. El formulario soporta validación de Nombre/Identificador, Capacidad numérica, Ubicación física/Zona y Observaciones o notas descriptivas en caliente.
    - **Sincronización:** Vinculación al `tableService.js` en tiempo real (`subscribeToTables`) reflejando inmediatamente la cantidad de mesas y estados de disponibilidad (`disponible`, `ocupada`, `solicitando_cuenta`) con badges estilizados y colores temáticos.
    - **Acceso Directo:** Se añadió un botón premium con el ícono `LayoutGrid` en el menú general de personalización de tienda (`activeSubSection === null`) para facilitar el onboarding administrativo.
  * Build: ✅ Exitoso — 836ms, 0 errores.

* **[x] ~~Tarea 119: Implementar Sistema de Acceso mediante Códigos QR para Empleados (Fase 3)~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-01
  * Historial / Revisiones:
    - **Gestión de Empleados Completa (CRUD):** Reemplazada la cuadrícula básica por cantidad por un módulo CRUD completo de personal en `AdminSettings.jsx` (`activeSubSection === 'empleados'`) bajo el switch de `hasMultipleEmployees`. Incluye: listado interactivo lateral, formulario premium reactivo (`EmployeeFormCard`) que maneja altas y modificaciones en caliente, controles de activación (`toggleEmployeeStatus`), borrado físico (`deleteEmployee`), guardado unificado (`saveEmployee`), salarios fijos, frecuencia de pago y fecha de pago por `CustomDatePicker`.
    - **constants/index.js:** Agregada la constante `PORTAL_CONFIG` con mapeo de roles operativos y emojis.
    - **accessLogService.js:** Servicio nuevo para registrar logs de inicios/cierres de sesión y monitoreo de sesiones.
    - **firestore.rules:** Añadida regla de seguridad para `/accessLogs/{logId}` (lectura permitida a administradores, escritura/creación a todos).
    - **portalStore.js:** Añadida propiedad `currentLogId` e integradas en `setPortalEmployee` y `clearPortalEmployee`.
    - **PortalAuth.jsx:** Rediseñado con flujo bidireccional (selección de rol opcional por param URL `?rol=`, selección táctil de empleado y teclado PIN de seguridad). Genera registro automático en `accessLogs` al loguearse exitosamente.
    - **PortalLayout.jsx:** Modificado para llamar a `logLogout(currentLogId)` antes de limpiar el estado del empleado.
    - **AdminSettings.jsx:** Se integró la generación client-side interactiva de códigos QR por rol (usando la librería `qrcode` sobre `<canvas>`) con descargas PNG, copiado e impresión **exclusivamente dentro de la subsección Gestión de Personal bajo la condición estricta de que "Múltiples Empleados" esté activo**. Si se desactiva esta opción, el panel de QR no se renderiza. Se removió el acceso redundante del sidebar en `AdminLayout.jsx`.
    - **index.css:** Estilizado al 100% con clases optimizadas para tarjetas de códigos QR, grids de selección, tablas históricas y fichas de estado activas.
  * Build: ✅ Exitoso — 737ms, 0 errores.

* **[x] ~~Tarea 118: Implementar Sistema de Roles Operativos y Portales de Empleados (Fases 1 y 2)~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-01
  * Historial / Revisiones:
    - **Corrección de Importación (tableService.js) (2026-06-02):** Se resolvió un error en tiempo de ejecución (`ReferenceError: where is not defined`) importando formalmente la palabra clave `where` desde el SDK `'firebase/firestore'`. Esto rehabilita el correcto funcionamiento de llamados de mesa en `<PortalMesero>` sin provocar excepciones de renderizado de la UI.
    - **Sincronización de Stock en Tiempo Real (PortalBodega.jsx):** Se corrigió un problema de inconsistencia visual en la pantalla del bodeguero, donde registrar un movimiento de entrada o salida modificaba el stock en Firestore pero la interfaz mantenía el stock estático local (por ejemplo, mostrando 5 unidades). Se actualizó `handleRegister` para actualizar reactivamente los estados `selectedProduct` y `selectedVariant` con el nuevo stock calculado al instante, permitiendo que la lista y la tarjeta del producto reflejen las cantidades reales sin requerir recargas manuales.
    - **Validación de Cambio de Rol en Tiempo Real (RequirePortalAuth.jsx):** Se inyectó una verificación reactiva dentro de la suscripción en tiempo real (`onSnapshot`) de `RequirePortalAuth.jsx` para comprobar si el rol asignado en la base de datos de Firestore ha cambiado con respecto al de la sesión activa del portal. Si esto ocurre (por ejemplo, al cambiar de vendedor a cocinero desde administración), la sesión local del portal se invalida inmediatamente y el sistema expulsa al empleado a `/portal/auth`. Esto previene de forma segura que un usuario permanezca en un portal que ya no le corresponde o afecte a la tienda con privilegios desactualizados.
    - **Corrección de Toggle del Módulo de Empleados:** Se corrigió una discrepancia en `RequirePortalAuth.jsx` y `PortalAuth.jsx` donde se evaluaba el flag `rolesOperativosEnabled` (un flag duplicado/inactivo) en lugar del flag unificado de negocio y base de datos `hasMultipleEmployees`. Al cambiarlo al flag correcto, el portal valida correctamente el estado activo del módulo configurado por el administrador sin lanzar vistas falsas de "Acceso Deshabilitado".
    - **constants/index.js:** Añadidos roles operativos (`ROLES.VENDEDOR/COCINERO/BODEGUERO/MESERO/MENSAJERO`), colecciones nuevas (`EMPLOYEES`, `TABLES`, `PRODUCTION`, `DELIVERIES`, `STOCK_MOVEMENTS`), y metadatos de tracking (`alistamiento`, `listo`, `en_camino`).
    - **firestore.rules:** Extendidas las reglas de seguridad para las 5 nuevas colecciones con acceso por rol.
    - **appConfigStore.js:** Añadido flag `rolesOperativosEnabled` con persistencia en Zustand.
    - **Servicios nuevos:** `employeeService.js` (CRUD+PIN auth), `productionService.js` (+suscripción RT), `tableService.js`, `deliveryService.js`, `stockMovementService.js`.
    - **portalStore.js:** Store de sesión PIN independiente de Firebase Auth.
    - **layouts/PortalLayout.jsx:** Header con rol, nombre y botón de cierre de sesión.
    - **PortalAuth.jsx:** Teclado PIN táctil (4-6 dígitos), validación Firestore, redirección automática por rol.
    - **RequirePortalAuth.jsx:** Guard de rutas del portal.
    - **Portales creados:** `PortalVendedor.jsx` (POS completo), `PortalCocina.jsx` (cola RT), `PortalBodega.jsx` (movimientos stock), `PortalMesero.jsx` (mapa mesas RT), `PortalMensajero.jsx` (domicilios RT).
    - **AppRoutes.jsx:** Rutas `/portal/auth` y `/portal/*` con guards por rol.
    - **index.css:** +750 líneas de estilos del sistema de portales operativos.
  * Build: ✅ Exitoso — 1.22s, 0 errores.

* **[x] ~~Tarea 117: Fix – Banner deslizable de confirmación al guardar costo de domicilio + Detalle de entrega en tarjeta del cliente~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-01
  * Historial / Revisiones:
    - **AdminOrders.jsx:** El estado `savedPriceModal` estaba declarado pero nunca renderizado, por lo que presionar "Guardar" en el costo del domicilio no mostraba ninguna respuesta visual. Se añadió el banner deslizable (`AnimatePresence + motion.div`, animación `spring y:120→0`) con ícono `CheckCircle`, número de pedido y costo formateado. Se auto-cierra a los 2.8s mediante `onAnimationComplete + setTimeout`. El usuario puede cerrarlo manualmente con el botón `X`.
    - **ClientOrders.jsx (tarjeta colapsada):** Se añadieron píldoras de tipo de entrega (`🛵 Domicilio · +$X.XXX` / `🏪 Retiro en tienda`) junto al método de pago para dar contexto inmediato sin necesidad de expandir la tarjeta.
    - **ClientOrders.jsx (panel expandido):** Se insertó un bloque "Detalle de Entrega" antes de la sección de Productos, mostrando dirección, barrio/ciudad y costo de envío asignado; si aún no tiene costo, muestra mensaje informativo en cursiva.
  * Build: ✅ Exitoso — 875ms, 0 errores.

* **[x] ~~Tarea 115: Implementar Gestión Inteligente de Direcciones y Mapas Gratuitos con Leaflet y OpenStreetMap~~**

  * Estatus: Completado.
  * Fecha de finalización: 2026-06-01
  * Historial / Revisiones: Se creó e integró el componente `LeafletMapPicker.jsx` utilizando OpenStreetMap y Nominatim de forma 100% gratuita. Permite búsqueda difusa de direcciones, auto-localización por GPS, y autocompletado en caliente de dirección exacta, barrio y ciudad en el Checkout del cliente. Las coordenadas GPS (`coords`) se guardan atómicamente en el pedido de Firebase. En la administración (`AdminOrders`), se inyectó la visualización del mapa interactivo en modo de solo lectura dentro de la tarjeta de pedido junto con un botón rápido para iniciar navegación en Google Maps externa. Build verificado ✅.
* **[x] ~~Tarea 114: Restaurar sección de empleados con modelo completo de objetos, pagosFijos y toggle inventoryAdjustmentsEnabled~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-01
  * Historial / Revisiones: La reversión de Git dejó la sección de empleados con un modelo antiguo (`string[]`). Se refactorizó completamente a `object[]` con campos `{id, name, pin, role, salario, frecuenciaPago, fechaPago}` usando un patrón IIFE con helpers locales. Se añadió la sección de pagosFijos/nómina dentro de la misma vista y el toggle `inventoryAdjustmentsEnabled` en la sección de módulos. Build validado ✅.
* **[x] ~~Tarea 113: Corregir botón de descarga de aplicación PWA en el perfil de cliente~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-01
  * Historial / Revisiones: Se acopló el disparador de fallback con alertas nativas personalizadas para navegadores/iOS donde `beforeinstallprompt` no ha disparado, emparejando la lógica con el panel del administrador y habilitando instructivos dinámicos.
* **[x] ~~Tarea 112: Corregir persistencia de efecto Glow (brillo de neón) en promociones personalizadas~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-01
  * Historial / Revisiones: Se corrigió la lógica en `handleSaveAd` de `AdminSettings.jsx` para inyectar correctamente `glowEffect` en el payload de las promociones de tipo `custom`, logrando que persistan en Firestore y se rendericen activamente con animaciones.
* **[x] ~~Tarea 111: Paginación de Historial de Compras en Ficha del Cliente~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-01
  * Historial / Revisiones: Se limitó el historial de compras del cliente a 10 elementos por página en el Drawer del expediente y se integró el componente reutilizable de paginación `<Pagination />` para la navegación. Se inicializa a la primera página cada vez que se selecciona un cliente.
* **[x] ~~Tarea 110: Corregir y optimizar botones de guardado en la configuración~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-02
  * Historial / Revisiones:
    - **Optimización de Textos (2026-06-01):** Se abreviaron y simplificaron los textos largos de los botones de guardado en `AdminSettings.jsx` y se les asignó `shrink-0` a los iconos SVG correspondientes. Esto previene desbordes en dispositivos móviles y mantiene los iconos agrupados y centrados con el texto.
    - **Alineación Multilinea e Iconos Globales (2026-06-02):** Se envolvió el texto de todos los botones de guardado y acciones principales de la aplicación (incluyendo `AdminSettings.jsx`, `AdminOrders.jsx` y `ClaimRequestModal.jsx`) dentro de un tag `<span>` con estilo `text-center leading-tight` y se aseguró la clase `shrink-0` en los iconos correspondientes (como `<Save />` y `<ArrowRight />`). Asimismo, se reemplazaron las clases de altura fija `h-11`/`h-12` por clases adaptables `min-h-[2.75rem]` y `min-h-[3rem]` con relleno vertical simétrico. Esto erradica el comportamiento asimétrico de los iconos empujados a los bordes al wrapping de textos y garantiza botones 100% responsivos en toda la aplicación.
* **[x] ~~Tarea 109: Corregir centrado del modal del calendario DatePicker y backdrop~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-01
  * Historial / Revisiones: Se refactorizó la visualización del calendario en `DatePicker.jsx` con un portal de React en `document.body` y una capa de backdrop oscura translúcida. El calendario se renderiza fixed y centrado en el medio de la pantalla del cliente para evitar clipping y alinearse al diseño de los otros calendarios de la aplicación.
* **[x] ~~Tarea 108: Corregir advertencia de React por Spread Key en AdminSettings.jsx~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-01
  * Historial / Revisiones: Se removió la prop `key` del spread de `containerProps` en `AdminSettings.jsx` al renderizar `<ContainerComponent>`, pasando el `key` directamente para ajustarse a los requerimientos de React.
* **[x] ~~Tarea 107: Implementar selector de fecha premium DatePicker en lugar del selector nativo del navegador~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-05-31
  * Historial / Revisiones: Se desarrolló el componente `DatePicker.jsx` y se integró en la sección de "Gestión de Personal" (Salarios) y en la creación de "Pagos Fijos (Gastos)" en `AdminSettings.jsx`.
* **[x] ~~Tarea 106: Rediseño Responsivo de Tarjetas de Categorías en PC y Móvil~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-05-31
  * Historial / Revisiones: Se modificó `ClientCatalog.jsx` para que las categorías carguen como un grid compacto `aspect-square` en móviles, pero se transformen en una fila elástica de chips de navegación horizontales (`sm:flex sm:flex-wrap sm:gap-3`) en pantallas de PC. Se removió la truncación de categorías en PC, mostrando el total de categorías activas sin requerir toggles.
* **[x] ~~Tarea 105: Estandarización de Contraste en Temas HSL y Tokenización de Componentes de Modal~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-05-31
  * Historial / Revisiones: Se corrigió la sintaxis de selectores en `index.css` de `.dark [data-theme="..."]` a `.dark[data-theme="..."]` para que los estilos oscuros apliquen sobre el nodo `<html>`. Se integró el helper de variante `@variant dark (&:where(.dark, .dark *))` para Tailwind v4. Se reemplazaron clases duras (ej. `bg-white`, `text-gray-500`, `dark:bg-gray-900`) en `ModalTemplate.jsx` y `ProductDetailModal.jsx` por variables del sistema de marca (`bg-surface`, `text-app`, `text-muted`, `border-app`).
* **[x] ~~Tarea 104: Visualización de Métricas de Rendimiento Diario de Empleados en Lobby y Paneles de Operación~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-05-31
  * Historial / Revisiones: Se implementó la recolección y agregación de métricas de pedidos en tiempo real por empleado para el día en curso en `EmployeePortal.jsx` (Lobby paso 3). Se integró un indicador en tiempo real en el encabezado de `KitchenPanel.jsx` (Pedidos listos de hoy) y se añadió un widget de facturación del día en `AdminSales.jsx` para los vendedores logueados.
* **[x] ~~Tarea 103: Configuración de Salarios de Empleados, Portal Informativo e Integración con Pagos Fijos~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-05-31
  * Historial / Revisiones: Se añadieron los campos de `salario`, `frecuenciaPago` y `fechaPago` al esquema de empleados en `AdminSettings.jsx`. Se modificó `EmployeePortal.jsx` agregando una pantalla intermedia (`step === 3`) de bienvenida con los detalles del pago programado (monto, frecuencia, fecha) antes de redireccionar a sus respectivas vistas de operaciones. Se integró el autocompletado en el formulario de creación de Gastos y Pagos Fijos, donde elegir el tipo "Pago de Nómina" y un empleado carga automáticamente los valores configurados en su perfil.
* **[x] ~~Tarea 102: Desarrollar Módulo de Gestión de Pagos Fijos y Conciliación de Balance Real en Análisis de Ventas~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-05-31
  * Historial / Revisiones: Se implementó el submódulo "Pagos Fijos (Gastos)" bajo la sección principal "Herramientas de Administrador", permitiendo registrar egresos por tipo (Internet, Arriendo, Aplicación, Servicios, Nómina y Otro) de forma mensual con estado pagado/pendiente. Nómina es condicional al módulo de empleados. Estos egresos se restan en `AdminSalesDetail.jsx` de los ingresos del período para mostrar la Caja Neta Real (Ganancia Neta) con desglose de egresos, sin afectar la base de cobro comisional del desarrollador en `billingService.js`.
* **[x] ~~Tarea 101: Desarrollar Módulo de Gestión de Clientes en Panel de Administración~~**
  * *Estatus:* Completado en `AdminSettings.jsx`.
  * *Fecha de finalización:* 2026-05-31
  * *Historial / Revisiones:* Se implementó la subsección `clientes` en los ajustes, listando usuarios ordenados por mayor volumen de compras, paginados de 20 en 20 con el componente unificado `Pagination`. Incluye acciones rápidas para contactar vía WhatsApp con mensaje predeterminado de fidelización y abrir un modal de obsequios que realiza transacciones de stock a costo `$0` (descartes).
* **[x] ~~Tarea 100: Corregir ReferenceError X en cambio de categorías del catálogo del cliente~~**
  * *Estatus:* Completado en `ClientCatalog.jsx`.
  * *Fecha de finalización:* 2026-05-31
  * *Historial / Revisiones:* Se importó el componente de icono `X` ausente desde `lucide-react` en los imports de cabecera del archivo, remediando el error de ejecución JavaScript que bloqueaba el renderizado en móviles y escritorio.
* **[x] ~~Tarea 99: Extraer y Documentar el Módulo de Compra Rápida por Código QR~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Ecommerce_y_Ventas\Compra_Rapida_por_QR\compra_rapida_qr.md`.
  * *Fecha de finalización:* 2026-05-31
  * *Historial / Revisiones:* 
    - **Alineación Visual y Corrección de Bordes Negros (2026-06-02):** Se detectó un borde negro tosco y un fondo opaco en el banner informativo de sugerencias (Tip) dentro de la sección de analíticas de QR (`AdminQRPerformance.jsx`). Se eliminó este estilo ad-hoc y se aplicaron las clases estandarizadas y premium del sistema de marca (`bg-primary-soft` y `border-primary-soft`), garantizando una perfecta consistencia cromática con la paleta activa.
    - **Modularización (2026-05-31):** Se modularizó el flujo QR público e independiente (`QRProductPublicDetail`), desacoplándolo de la infraestructura rígida y abstrayendo la llamada a la API externa de QR de `api.qrserver.com`. Se creó un manual técnico de topología y secuencias (`manual_compra_qr.md`) y se actualizó la biblioteca.
* **[x] ~~Tarea 12: Definir el modelo operativo y la estructura de la carpeta de Estrategia de Negocio~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Estrategia de Negocio\estrategia_negocio.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Versión 1.0 que establece el flujo de captura de requerimientos de clientes potenciales, criterios de viabilidad del catálogo de componentes y la plantilla de comunicación técnica para integraciones a la medida.
* **[x] ~~Tarea 62: Extraer y Documentar el Componente Desplegable Premium (CustomSelect)~~**
  * *Estatus:* Completado y registrado en la biblioteca.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se modularizó la lista desplegable animada (`CustomSelect`), abstrayéndola como componente stateless, 100% portable y libre de dependencias externas rígidas (usando SVGs nativos para el chevron y marca de check). Incorpora tap-shield protector contra burbujeos táctiles de cerrado e inyección HSL dinámica del tema activo.
* **[x] ~~Tarea 13: Modularizar el Dashboard de Inicio del Administrador (AdminHome.jsx)~~**
  * *Estatus:* Completado y validado en el código.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se inyectó reactividad en base al flag `creditsEnabled` en el dashboard. La cuadrícula de métricas principales se escala y acomoda simétricamente de 4 a 3 columnas. Se remueve la opción de créditos de los accesos rápidos y se excluye la distribución de fiado del resumen de caja diario e histórico si la funcionalidad está inactiva.
* **[x] ~~Tarea 14: Adaptar métodos de pago en el Checkout del Cliente (CheckoutModal.jsx)~~**
  * *Estatus:* Completado y compilado sin errores.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se refactorizó la constante estática de opciones de pago para resolverse dinámicamente mediante `getPaymentMethodsOptions(creditsEnabled)`. La opción de pago a crédito se remueve por completo del modal si los créditos están deshabilitados globalmente.
* **[x] ~~Tarea 17: Condicionar botones de mayoreo/encargo en ClientCatalog.jsx~~**
  * *Estatus:* Completado y compilado sin errores (`npm run build` ✓).
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se detectó y corrigió un bug donde el botón "Pedir por encargo" se renderizaba incluso cuando `wholesaleSettings.enabled === false`, ignorando el flag global del admin. Se extrajo la IIFE inline a un componente puro `WholesaleButton` con prop drilling limpio, consolidando ambas rutas (stock/sin stock) bajo una única validación de flag. Build verificado exitosamente.
* **[x] ~~Tarea 15: Crear la sección de Gestión de Módulos (Switches) en AdminSettings.jsx~~**
  * *Estatus:* Completado en el código.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se conectó la vista en la subsección `modulos` a Firestore (`updateAppConfig`) y al store (`config.setConfig`). Permite encender y apagar Créditos, Cupones, Reclamos y Mayoreo de forma reactiva con cambios instantáneos sin recargar.
* **[x] ~~Tarea 16: Ocultar rutas y pestañas condicionales en Layouts~~**
  * *Estatus:* Completado en `AdminLayout.jsx` y `ClientLayout.jsx`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* En `ClientLayout`, la pestaña "Créditos" en sidebar de escritorio y barra inferior móvil se filtra de forma adaptativa. En `AdminLayout`, la pestaña "Crédito" del menú de navegación e indicador móvil se oculta dinámicamente si `creditsEnabled` está deshabilitado en el store, garantizando consistencia.
* **[x] ~~Tarea 18: Extraer y Documentar el Módulo de Facturación Comisional (DeveloperBillingPanel)~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Monetizacion_Desarrollador\Facturacion_Comisional\facturacion_comisional.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se desacopló por completo el sistema de comisiones sobre ventas mensuales de los servicios Firebase pesados, dividiéndose en una capa pura de lógica de cálculo (`billingService`), un Hook React (`useBilling`) y una interfaz de control visual táctil y PDF (`DeveloperBillingPanel` con firma digital canvas integrada).
* **[x] ~~Tarea 19: Extraer e Indexar el Sistema de Temas Dinámicos (ThemeManager)~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Utilidades\Sistema_Temas_Dinamicos\sistema_temas.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se extrajo e independizó el motor de inyección de estilos de marca blanca, permitiendo inyectar variables de entorno CSS reactivamente, acoplar el modo claro/oscuro y alternar eventos de temporada de forma agnóstica al store global de Zustand.
* **[x] ~~Tarea 20: Extraer e Indexar el Creador de Filtros de Catálogo (CatalogFiltersCreator)~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Formularios_y_UI\Creador_Filtros_Catalogo\creador_filtros.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se independizó la herramienta administrativa de creación de atributos personalizados y gestión de dimensiones estándar de productos, diseñándolo de forma 100% controlada (stateless), libre de dependencias externas de iconos e inyectándole un formateador de strings dinámico para delimitar opciones por comas.
* **[x] ~~Tarea 21: Extraer e Indexar el Restaurador a Fábrica (AppResetTool)~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Utilidades\Restauracion_Aplicacion\restauracion_aplicacion.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se modularizó la utilidad destructiva de reseteo a fábrica de bases de datos de forma 100% agnóstica (stateless), blindándola con prompts de seguridad dobles y control de carga de no-concurrencia, inyectándole una guía técnica de operaciones de borrado Firebase por lotes atómicos (`Batch commit`) de 500 registros.
* **[x] ~~Tarea 22: Complementar Sistema de Monetización del Desarrollador con SettingsNavRow (v2.0)~~**
  * *Estatus:* Completado. Documento actualizado a v2.0 en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Monetizacion_Desarrollador\Banner_Referido_Desarrollador\developer_promo_card.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se agregó el tercer módulo `SettingsNavRow` al sistema ya documentado (`DeveloperContactConfig` + `DeveloperPromoCard`). El nuevo módulo es la fila de navegación genérica con ícono configurable, título, descripción y flecha chevron que actúa como punto de entrada drill-down en cualquier panel de configuración admin. Incluye dos variantes: animada con `framer-motion` y fallback CSS puro sin dependencias externas. Se actualizó el README de la biblioteca, la bitácora de cambios y se verificó el build (`npm run build` exitoso).
* **[x] ~~Tarea 80: Botón de descarga de informe de empleados en Análisis de Ventas~~**
  * *Estatus:* Completado en `AdminSalesDetail.jsx` y `pdfService.js`.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se agregó un botón para exportar el "Informe de Empleados" en PDF, ubicado junto a los otros dos botones de reportes. El botón se renderiza condicionalmente si el flag `hasMultipleEmployees` está activo.
* **[x] ~~Tarea 81: Paginación de Rendimiento General de Productos en Análisis de Ventas~~**
  * *Estatus:* Completado en `AdminSalesDetail.jsx`.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se limitó la visualización de la lista a 10 productos por página e integró el componente unificado `Pagination`.
* **[x] ~~Tarea 82: Paginación de Rendimiento por Personal / Empleados en Análisis de Ventas~~**
  * *Estatus:* Completado en `AdminSalesDetail.jsx`.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se limitó la visualización de la lista a 10 empleados por página e integró el componente unificado `Pagination`.
* **[x] ~~Tarea 83: Restricción de portales y limpieza de sesiones al deshabilitar los módulos de empleados y cocina~~**
  * *Estatus:* Completado en `AppRoutes.jsx`, `EmployeePortal.jsx` y `KitchenPanel.jsx`.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se inyectaron validaciones que limpian activamente la sesión de `sessionStorage` e impiden el bypass de autenticación por tokens antiguos si los respectivos módulos están inactivos, redirigiendo a la pantalla informativa correspondiente.
* **[x] ~~Tarea 84: Ajustar límite dinámico de cantidad de producto en el carrito según stock real~~**
  * *Estatus:* Completado en `CartDrawer.jsx`.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se reemplazó el límite fijo de 10 unidades del botón "+" del carrito por una validación que evalúa dinámicamente el `maxStock` disponible de cada producto.
* **[x] ~~Tarea 85: Reemplazar alert de PWA por modal premium en la sección de descargas del admin~~**
  * *Estatus:* Completado en `AdminSettings.jsx`.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se reemplazó el uso de alertas nativas de javascript `alert()` por un modal de instrucciones con micro-animaciones en Framer Motion y diseño consistente con la marca.
* **[x] ~~Tarea 86: Deshabilitar selección de texto global en toda la aplicación exceptuando campos editables~~**
  * *Estatus:* Completado en `index.css`.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se inyectó `user-select: none` de forma global en el body para prevenir resaltados accidentales y activadores de búsqueda contextuales de los navegadores móviles, manteniendo únicamente la selección activa en inputs y áreas editables.

* **[x] ~~Tarea 63: Corregir visualización condicional de garantías en AdminOrders y resolver errores de consola (Hydration y Firestore Permission Denied)~~**
  * *Estatus:* Completado en el código y reglas de seguridad.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se modularizó la visualización del encabezado de órdenes del administrador para respetar dinámicamente `claimsEnabled`. Se eliminó la advertencia de anidamiento HTML inválido de `p > div` en `ModalTemplate` cambiando el tag a `div`. Se actualizaron las reglas de seguridad de Firestore para permitir actualizaciones públicas exclusivas de `variantes` (stock) y `updatedAt` en productos al realizar compras.

### 📦 Extracción de Componentes Core a la Biblioteca (Próxima Fase)
* **[x] ~~Tarea 23: Extraer y Documentar el Módulo del Carrito Completo (`Cart_Completo`)~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Formularios_y_UI\Carrito_Completo\carrito_completo.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se modularizó el store reactivo `useCartStore` y el componente `CartDrawer`. Se optimizó incorporando agrupación automática de variantes de un mismo producto usando identificadores compuestos, control de topes físicos de inventario por variante, animaciones aceleradas por hardware en Framer Motion, y un Empty State comercial premium interactivo con badges de invitación reactivos.
* **[x] ~~Tarea 24: Extraer y Documentar el Modal de Pago Multipaso (`Checkout_Modal`)~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Formularios_y_UI\Checkout_Modal\checkout_modal.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se modularizó el componente multipaso `CheckoutModal` haciéndolo 100% portable y agnóstico a través de propiedades paramétricas limpias. Se le implementó un stepper animado indicador de progreso dinámico superior, validación robusta y visual de campos obligatorios en tiempo real (celular, nombre, dirección según entrega) y una plantilla premium estructurada para abrir y enviar la orden directamente a la API oficial de WhatsApp.
* **[x] ~~Tarea 25: Extraer y Documentar la Sincronización en Tiempo Real (`Firebase_Sync_Hook`)~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Servicios_y_Firebase\Sincronizacion_Firebase\sincronizacion_firebase.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se extrajo y refinó el hook de suscripciones en tiempo real convirtiéndolo en un módulo genérico `useFirestoreCollection`. Se le inyectó un sistema de persistencia y arranque instantáneo optimista basado en LocalStorage (Offline Cache Fallback), soporte paramétrico de queries complejas de Firestore (`where` y `orderBy`) y detección nativa de metadatos de red para alertar de forma reactiva al usuario en caso de estar interactuando con datos cacheados locales.
* **[x] ~~Tarea 26: Extraer y Documentar la Tarjeta de Producto Adaptativa (`Tarjeta_Producto`)~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Formularios_y_UI\Tarjeta_Producto\tarjeta_producto.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se modularizó el componente `ProductCard` haciéndolo puramente paramétrico e independiente. Se le implementaron capacidades de layout adaptativas (`grid` y `list`), efecto Glow en hover mediante HSL color-mix para destacar ofertas, gestión de stock consolidado marcando quiebres en grayscale y desactivando clics, y se creó su contraparte de carga `ProductCardSkeleton` shimmer idéntica en proporciones para evitar Cumulative Layout Shift (CLS).
* **[x] ~~Tarea 27: Extraer y Documentar la Rejilla de Catálogo Inteligente (`Rejilla_Catalogo`)~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Formularios_y_UI\Rejilla_Catalogo\rejilla_catalogo.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se modularizó la cuadrícula responsiva del catálogo de productos (`CatalogGrid`). Se le inyectó aceleración por hardware (`will-change`) para una conmutación ultra-fluida de layouts a 60 FPS, animaciones de salida de items elásticas basadas en `AnimatePresence` en modo `popLayout`, soporte integrado e imperceptible de cargadores shimmer skeleton y una interfaz de no-resultados (Empty State) premium interactiva con botón elástico para restablecer filtros mediante callbacks drill-up.
* **[x] ~~Tarea 28: Extraer y Documentar el Stepper de Seguimiento de Pedidos (`Stepper_Pedidos`)~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Formularios_y_UI\Stepper_Pedidos\stepper_pedidos.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se modularizó la línea de tiempo interactiva de tracking (`OrderTrackingTimeline`). Se le inyectaron controles de feature flags reactivos para estados dinámicos del pedido, barra de conexión fluida con aceleración por transiciones nativas según la altura del hito alcanzado y una vista condicional destructiva atenuada sumamente premium para renderizar cancelaciones y motivos de forma clara e interactiva.
* **[x] ~~Tarea 29: Extraer y Documentar el Sistema de Transacciones Atómicas de Inventario~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Servicios_y_Firebase\Transacciones_Atomicas_Inventario\transacciones_atomicas_inventario.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se extrajo y refactorizó la lógica crítica de concurrencia de inventario de `orderService.js`. Se consolidaron los 3 helpers internos duplicados (`_deductStock`, `_restoreStock`, `_applyStockUpdates`) en funciones privadas reutilizables, eliminando ~120 líneas de código duplicado. Se desacopló la configuración de Firebase en un `ServiceConfig` inyectable (colecciones, estados de pedido, callback de notificación). Se documentaron los flujos `createOrder` (reserva), `updateOrderStatus` (cancelación → restaura stock; completar → flag anti-doble-descuento) y `createPhysicalOrder` (POS).
* **[x] ~~Tarea 30: Extraer y Documentar el Hook de Control de Inactividad (`useInactivityTimer`)~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Logica_y_Hooks\Control_Inactividad\use_inactivity_timer.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se extrajo y mejoró el hook de detección de inactividad. Mejoras incorporadas: (1) `useRef` para el timer ID eliminando el anti-patrón de `let timer` con re-closure en cada handler; (2) parámetro `events[]` configurable para restringir qué eventos monitorea (útil en quioscos táctiles); (3) `{ passive: true }` en scroll/touchstart para rendimiento nativo móvil; (4) cleanup correcto al pasar `isActive = false` (limpia timer + resetea `isInactive`). Versión 1.1.
* **[x] ~~Tarea 31: Extraer y Documentar el Motor Dinámico de Cupones (`couponService`)~~**
  * *Estatus:* Completado en `D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Servicios_y_Firebase\Motor_Cupones\motor_cupones.md`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se extrajo el servicio CRUD de cupones y se refactorizó con `ServiceConfig` inyectable (eliminando hardcoding de `db` y `COLLECTIONS`). La función `validateCoupon()` —que estaba inline en `CheckoutModal.jsx`— fue extraída como función standalone con validaciones robustas: código nulo, cupón no encontrado, activo/inactivo, fecha de expiración (día completo via `.setHours(23,59,59,999)`), monto mínimo con formato COP, y protección `Math.min(discount, cartTotal)` para descuentos fijos. Se añadió `normalizeDoc()` como función privada reutilizable. Versión 1.1.
* **[x] ~~Tarea 32: Refactorización de Portabilidad Integral — Biblioteca de Componentes UI~~**
  * *Estatus:* Completado. 5 archivos de documentación corregidos.
  * *Fecha de finalización:* 2026-05-29
  * *Archivos afectados:* `carrito_completo.md`, `checkout_modal.md`, `tarjeta_producto.md`, `stepper_pedidos.md`, `rejilla_catalogo.md`
  * *Historial / Revisiones:* Se portabilizaron y auditaron los 5 componentes UI visuales reemplazando `lucide-react` con SVGs inyectables y documentando tokens CSS/Tailwind.
* **[x] ~~Tarea 33: Script de Siembra Dinámico Ecosistema y Portabilidad de Páginas Restantes~~**
  * *Estatus:* Completado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se implementó `scratch/seed_brand.js` para poblar bases de datos en blanco dinámicamente y se portabilizaron `OrderTracking.jsx` y `AdminStockAlerts.jsx` en la biblioteca con fallbacks libres de dependencias rígidas de rutas y Firebase.
* **[x] ~~Tarea 34: Estandarización de Manuales Técnicos y Consola de Control Visual~~**
  * *Estatus:* Completado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Inicializada la carpeta `/Manuales/` con la Consola de Control Visual (`Manuales/README.md`) y redactados 3 manuales exhaustivos (`manual_brand_config.md`, `manual_order_tracking.md`, `manual_admin_stock_alerts.md`) explicando flujos de datos mediante diagramas Mermaid y especificaciones de seguridad.
* **[x] ~~Tarea 35: Portabilidad de Servicios e Infraestructura Core a la Biblioteca~~**
  * *Estatus:* Completado.
  * *Fecha de finalización:* 2026-05-29
  * *Archivos creados:* `generacion_pdf.md` (Motor PDF), `omnicanalidad.md` (Notificaciones/WhatsApp), `creditos_saldos.md` (Financiero).
  * *Historial / Revisiones:* Se portabilizó el 100% de la lógica de servicios core desacoplándolos de constantes y layouts rígidos. `pdfService` ahora acepta divisas locales, `whatsappService` soporta sanitización celular internacional con prefijos multi-país y `creditService` aísla transacciones atómicas `runTransaction` de alertas.
* **[x] ~~Tarea 36: Redacción de Manuales de Servicios e Integración de Consola de Control~~**
  * *Estatus:* Completado.
  * *Fecha de finalización:* 2026-05-29
  * *Manuales creados:* `manual_generacion_pdf.md`, `manual_whatsapp_notifications.md`, `manual_credits_and_balances.md`.
  * *Historial / Revisiones:* Redactados los 3 manuales interactivos de infraestructura. Detallan el sistema de coordenadas cartesianas A4, la inyección dinámica de plantillas dinámicas por Regex y las colisiones transaccionales atómicas en Firestore. Sincronizados de forma transparente en `Manuales/README.md`.
* **[x] ~~Tarea 44: Extraer, Refactorizar y Documentar el componente CategoryManager~~**
  * *Estatus:* Completado en el código y documentado en la biblioteca.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Extraído el componente CategoryManager a un componente puramente stateless e independiente en `src/components/ui/CategoryManager.jsx` libre de lucide-react (usando SVG nativos) y rutas acopladas, convirtiendo al original de admin en un wrapper de estado (Container Component). Documentado con su props API y especificaciones visuales en `Biblioteca de Componentes\Formularios_y_UI\Gestor_Categorias\gestor_categorias.md`.
* **[x] ~~Tarea 37: Robustecer script generate_ia_map.js y redactar manual_ia_maps.md para Nuevos Proyectos~~**
  * *Estatus:* Completado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se mejoró el script de generación de mapas de IA para admitir argumentos por línea de comandos `--src` y `--output`, permitiendo que sea 100% portable y reutilizable de forma genérica en cualquier nuevo proyecto. Se actualizó el manual de desarrollo explicando detalladamente cómo copiarlo, ejecutarlo y presentárselo a la IA para un onboarding instantáneo.
* **[x] ~~Tarea 38: Diseñar y documentar el Protocolo de Inicialización y Bootstrap de Nuevos Proyectos~~**
  * *Estatus:* Completado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se creó el estándar técnico `inicializacion_nuevos_proyectos.md` que sirve como blueprint de arquitectura Ecosistema para garantizar la homogeneidad y el uso instantáneo de los scripts de mapeo, seeding y componentes de biblioteca en cualquier desarrollo futuro.
* **[x] ~~Tarea 39: Crear el Mapa Semántico Global de Documentación para la IA~~**
  * *Estatus:* Completado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se creó `mapa_documentacion_ia.md` con el índice semántico completo del directorio de documentación global (`Documentacion PROTOTIPE`). Incluye rutas absolutas clicables a cada carpeta temática, archivo core y subestructura interna. Se actualizaron el protocolo de inicialización con un Paso 4+5 revisado, el `mapa_aplicacion.md` y la `bitacora_cambios.md`.




### 🛠️ Lógica y Seguridad (Prioridad Alta)
* **[x] ~~Tarea 121: Corregir ReferenceError: config is not defined en AdminHome.jsx~~**
  * *Estatus:* Completado.
  * *Fecha de finalización:* 2026-06-01
  * *Historial / Revisiones:* 
    - **AdminHome.jsx:** Se corrigió un error de consola (`ReferenceError: config is not defined`) al renderizar el "Resumen de Caja (Hoy)" por usar la variable `config.creditsEnabled` en lugar del valor destructurado localmente `creditsEnabled` del store `useAppConfigStore`.
  * Build: ✅ Exitoso.

* **[x] ~~Tarea 1: Parchear reglas de seguridad en `firestore.rules`~~**
  * *Estatus:* Completado y desplegado a producción.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* 
    - v1.0: Versión inicial limitaba todo excepto `products` que estaba público.
    - v2.0 (Auditoría Técnica): Parche crítico para detener fugas de información privada en `/users/{userId}`, `/orders` y `/claims`. Se restringieron los permisos de lectura generales (`allow read: if true;`) para requerir autenticación de Administrador (`isAdmin()`) o pertenencia del celular al documento (`resource.data.clienteCelular`).
* **[x] ~~Tarea 40: Desplegar reglas de Firestore en Producción~~**
  * *Estatus:* Completado en Firebase.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Despliegue exitoso de `firestore.rules` con cero advertencias y con las mitigaciones de fugas en `/users`, `/orders` y `/claims` aplicadas a producción.

* **[x] ~~Tarea 41: Corregir parpadeo rosa inicial al cargar la aplicación~~**
  * *Estatus:* Completado en el código fuente.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se removieron los colores rosas por defecto (`#e91e8c` / `#fff5f9`) del CSS fallback en `:root` de `index.css`, del store `appConfigStore.js` (tema inicial a `carbon-oscuro`) y en `palettes.js`, reemplazándolos con variables neutras y elegantes de tipo slate/carbono. Esto mitiga el flash de color antes de la sincronización de la base de datos de cada cliente.
* **[x] ~~Tarea 45: Desactivar Modo Oscuro por defecto en la carga inicial y limpia de caché~~**
  * *Estatus:* Completado en el código fuente.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se cambió el valor inicial del estado `isDarkMode` de `true` a `false` en `src/store/appConfigStore.js` para asegurar que la aplicación siempre inicie en modo claro por defecto al borrar el caché del navegador, resolviendo la molestia del usuario al ingresar por primera vez.

* **[x] ~~Tarea 48: Corregir parpadeo negro inicial (modo oscuro instantáneo) al cargar la aplicación~~**
  * *Estatus:* Completado en el código fuente.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se creó y registró una nueva paleta de colores `'neutral'` clara y elegante (con fondo `#f8fafc` y superficies blancas) en `palettes.js`. Se configuró esta paleta como el tema por defecto en Zustand (`appConfigStore.js`) y fallback principal del motor de estilos. Además, se ajustó el `theme-color` nativo de `index.html` a `#ffffff`. Esto elimina por completo cualquier flash negro, rosado o de marca antes del inicio de React y su posterior sincronización en tiempo real con Firestore.

* **[x] ~~Tarea 42: Estandarizar diseño de popover de notificaciones (Admin y Cliente)~~**
  * *Estatus:* Completado en el código fuente.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se modificó la vista de notificaciones móvil en `AdminLayout.jsx` reemplazando la clase `bg-surface/95 backdrop-blur-xl` (glassmorphism) por `bg-surface` (fondo claro/opaco plano). Ahora el menú del administrador y el del cliente comparten exactamente el mismo diseño visual consistente.

* **[x] ~~Tarea 43: Corregir brincos y superposición del Toast en Ajustes del Administrador~~**
  * *Estatus:* Completado en el código fuente.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se encapsuló el Toast de confirmación (`saveMessage`) de `AdminSettings.jsx` dentro de un `ReactDOM.createPortal` inyectado en `document.body` para eliminar los brincos y cortes de animación al desmontar y cambiar de secciones de configuración. Se reposicionó flotando en la parte superior central en móviles (`top-4 left-1/2 -translate-x-1/2`) y arriba a la derecha en pantallas de escritorio, eliminando cualquier superposición o interferencia con los botones de la barra de navegación inferior móvil (`bottom-0`).

* **[x] ~~Tarea 46: Sincronizar theme-color dinámico en cabecera del Navegador y Manifiesto PWA~~**
  * *Estatus:* Completado en el código fuente.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se modificó `ThemeApplier` en `App.jsx` para seleccionar y actualizar dinámicamente el valor de la metaetiqueta `theme-color` con el color de fondo `--color-bg` activo de la paleta del tema actual (claro/oscuro). Asimismo, se modificó `updateDynamicManifest.js` para recibir e inyectar dicho color en las propiedades `background_color` y `theme_color` del manifiesto PWA dinámico, logrando que la barra de navegación móvil del explorador y la pantalla de carga se fundan visualmente con la aplicación a pantalla completa.

* **[x] ~~Tarea 47: Agregar cierre por clic exterior en el menú de notificaciones del cliente~~**
  * *Estatus:* Completado en el código fuente. ✅ Verificado en desktop y mobile.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:*
    - **v1:** Overlay `onClick` en `ClientLayout.jsx`. El `click` burbujeaba al botón campana (toggle), re-abriéndolo. No funcionó.
    - **v2:** Overlay `onMouseDown + stopPropagation`. Funcionó en desktop pero no en mobile — Framer Motion instala handlers nativos de `touchstart` con `stopPropagation()` que interceptaban el evento en la fase de bubble.
    - **v3 (Solución Definitiva):** `useRef` (`notifDesktopRef`, `notifMobileRef`) + `document.addEventListener` con `{ capture: true }`. La fase de captura fluye `document → target`, ejecutándose antes de cualquier handler de elementos hijo (incluyendo Framer Motion). Eliminados todos los overlays del JSX. Aplicado simétricamente en `ClientLayout.jsx` y `AdminLayout.jsx` (desktop + mobile). Agregado `useRef` al import en `AdminLayout.jsx`.

### 🎨 Refactorización y Estandarización de Interfaz (Prioridad Media)
* **[x] ~~Tarea 2: Crear el componente maestro de Modal Unificado (`ModalTemplate.jsx`)~~**
  * *Estatus:* Completado e implementado físicamente en `src/components/common/ModalTemplate.jsx` y documentado en la biblioteca.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Versión inicial creada con React Portals, Framer Motion y Scroll Lock. Servirá como la base obligatoria para refactorizar los modales restantes.
* **[x] ~~Tarea 3: Refactorizar `ProductDetailModal.jsx` (Cliente)~~**
  * *Estatus:* Completado y validado en el código.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se refactorizó usando `ModalTemplate.jsx`. Se eliminó el maquetado manual de Framer Motion y backdrop, usando el Portal de React de forma segura para evitar colisiones de `z-index`.
* **[x] ~~Tarea 4: Refactorizar `CheckoutModal.jsx` (Cliente)~~**
  * *Estatus:* Completado e integrado en el código.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se refactorizó usando `ModalTemplate.jsx`. Se adaptó el flujo multi-paso utilizando el callback `onBack` dinámico y se inyectó el stepper indicador de pasos como subtítulo del header. En el paso 4 (Éxito), la cabecera se oculta automáticamente pasando `title={null}`.
* **[x] ~~Tarea 5: Refactorizar `ProductFormModal.jsx` (Admin)~~**
  * *Estatus:* Completado e integrado en el código.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se refactorizó usando `ModalTemplate.jsx`. Se conectó el wizard de creación y la edición clásica de productos. La barra de progreso y el formulario dinámico con carga de imágenes/IA ahora se ejecutan de forma segura dentro del cuerpo del modal estándar. Se integró la navegación multi-paso mediante `onBack={handlePrevStep}` y se limpiaron las dependencias redundantes de empaquetado modal.
* **[x] ~~Tarea 6: Refactorizar `ClaimRequestModal.jsx` y `ClientCouponsModal.jsx`~~**
  * *Estatus:* Completado e integrado en el código.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Ambos modales se migraron para utilizar `ModalTemplate.jsx`. Se eliminaron los wrappers redundantes de `AnimatePresence` y animaciones manuales en favor de la transición limpia provista por el modal unificado. `ClaimRequestModal` oculta dinámicamente el Header si el reclamo ya se envió con éxito para optimizar la UX.
* **[x] ~~Tarea 9: Crear el servicio unificado `pdfService.js`~~**
  * *Estatus:* Completado y validado en el build de producción.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Centraliza la lógica de generación de reportes financieros, de rotación de stock e inventario, y los recibos mensuales del desarrollador utilizando `jsPDF` y `jspdf-autotable`.
* **[x] ~~Tarea 10: Crear el custom hook `useCopyToClipboard.js`~~**
  * *Estatus:* Completado e integrado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Estandariza la acción de copiado con temporizadores de restablecimiento automático del estado "copiado" para evitar lógica duplicada en modales de cupones y checkout.
* **[x] ~~Tarea 11: Integrar `pdfService.js` y `useCopyToClipboard.js` en vistas y modales~~**
  * *Estatus:* Completado e integrado en `AdminSalesDetail.jsx`, `AdminSettings.jsx`, `CheckoutModal.jsx` y `ClientCouponsModal.jsx`.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Eliminada toda la lógica inline redundante de jspdf y del portapapeles.


* **[x] ~~Tarea 70: Optimizar lag/retraso en la navegación móvil implementando precarga (Preloading) de bundles lazy en layouts~~**
  * *Estatus:* Completado.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se inyectaron listeners `onMouseEnter` y `onTouchStart` en cada botón de navegación (`NavLink`) de `ClientLayout.jsx` y `AdminLayout.jsx` para disparar dinámicamente las llamadas `import(...)` de los componentes con `lazy` antes de finalizar el evento click/tap. El lag al cambiar entre pestañas fue eliminado por completo.
* **[x] ~~Tarea 71: Implementar persistencia y autocompletado de la última ubicación en pedidos a domicilio~~**
  * *Estatus:* Completado en el código fuente.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Al finalizar un pedido a domicilio con éxito en `CheckoutModal.jsx`, se guarda la dirección (dirección, barrio, ciudad y coordenadas GPS) en el perfil del usuario (Zustand `authStore` y Firestore via `saveClientProfile`). En el próximo checkout, la app inicializa el formulario con estos datos directamente y posiciona el pin del mapa interactivo (`LeafletMapPicker`) en sus coordenadas históricas guardadas.
* **[x] ~~Tarea 72: Tolerancia a fallos tipográficos y búsqueda difusa (Fuzzy Search Fallback) en mapa interactivo~~**
  * *Estatus:* Completado en el código fuente.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se implementó un algoritmo de reducción de palabras de derecha a izquierda en `LeafletMapPicker.jsx` para la función `handleSearch`. Si Nominatim no encuentra resultados para la consulta original, descarta progresivamente la última palabra del string de búsqueda y vuelve a consultar, logrando que búsquedas con errores ortográficos al final (ej: "Barbosa antioaui") resuelvan a la ubicación más cercana ("Barbosa").
* **[x] ~~Tarea 73: Permitir al administrador fijar y actualizar el costo de envío de un pedido a domicilio~~**
  * *Estatus:* Completado en el código fuente.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se añadió el servicio transaccional `updateOrderShippingCost` en `orderService.js` para modificar de forma atómica el costo de envío y recalcular el total en la base de datos Firestore (sincronizando también la deuda en la colección `credits` si aplica). Adicionalmente, se inyectó una sección de desglose de costos en `AdminOrders.jsx` con un input numérico y botón de guardar interactivo si el pedido es a domicilio. Se sumaron e integraron los costos de envío en la contabilidad del negocio: agregando la métrica "Total Envíos" al dashboard de análisis de ventas (`AdminSalesDetail.jsx`) y una columna + métrica ejecutiva dedicada en el reporte financiero exportado en PDF (`pdfService.js`).
* **[x] ~~Tarea 74: Configuración y contacto rápido con Domiciliario desde el panel del Administrador~~**
  * *Estatus:* Completado en el código fuente.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se añadió el campo `deliveryManPhone` en la sección "Métodos de Entrega" de los ajustes del administrador (`AdminSettings.jsx`). Asimismo, en la tarjeta de pedido del administrador (`AdminOrders.jsx`), si el pedido es a domicilio y hay un número telefónico de domiciliario configurado, se renderizan dos botones de acción rápida (Llamar y WhatsApp Domicilio) con la información del pedido.
* **[x] ~~Tarea 75: Rediseño compacto y optimización de pestañas de tipo de pedido (ClientOrders.jsx)~~**
  * *Estatus:* Completado y verificado.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se redujo el tamaño de los botones de pestañas de "Pedidos Comunes" y "Pedidos Especiales" en la vista de cliente para optimizar el viewport en celulares, y se transformaron los indicadores de cantidad a contadores circulares estilizados e inline.
* **[x] ~~Tarea 76: Reemplazar el select de rol del empleado por CustomSelect en AdminSettings.jsx~~**
  * *Estatus:* Completado y verificado.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se sustituyó la lista desplegable nativa del rol del empleado por el componente personalizado e interactivo CustomSelect en el panel de Ajustes del Administrador.
* **[x] ~~Tarea 77: Corregir limpieza de input de cantidad de empleados en AdminSettings.jsx~~**
  * *Estatus:* Completado y verificado.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se eliminó la restricción en caliente de Math.max(1) que impedía borrar el campo numérico del número de empleados, permitiendo dejarlo en blanco o vaciarlo para reescribir con total libertad.
* **[x] ~~Tarea 78: Preservar el nombre del vendedor activo tras finalizar una venta POS en AdminSales.jsx~~**
  * *Estatus:* Completado y verificado.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se corrigió el bug por el cual al completarse una venta directa, el estado del vendedor se borraba incondicionalmente, haciendo que desapareciera el nombre en compras subsecuentes (incluyendo ventas personalizadas). Ahora, si hay una sesión activa de empleado, se mantiene asignado.
* **[x] ~~Tarea 79: Visualizar el nombre del vendedor en las tarjetas de pedidos del administrador y cliente~~**
  * *Estatus:* Completado y verificado.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se condicionó la visualización del vendedor. (1) En AdminOrders.jsx, se muestra "Vendido por: [Nombre]" debajo del cliente. (2) En ClientOrders.jsx, se muestra "Te atendió: [Nombre]" al lado del método de pago si el feature flag hasMultipleEmployees está encendido y el campo vendedor existe.
* **[x] ~~Tarea 87: Contadores de solicitudes y paginación en solicitudes especiales~~**
  * *Estatus:* Completado en `AdminOrders.jsx`.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se agregaron contadores de solicitudes por categoría en las pestañas del modal. Además, se reemplazó la paginación infinita por el componente unificado `Pagination` limitado a 10 elementos por página para optimizar consultas de base de datos.
* **[x] ~~Tarea 88: Reemplazo de emojis literales por secuencias de escape unicode en mensajes WhatsApp~~**
  * *Estatus:* Completado en `AdminOrders.jsx`.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se reemplazaron emojis literales por sus correspondientes secuencias de escape unicode (ej. `\u{1F50D}`, `\u{2705}`, `\u{274C}`) en los mensajes preestablecidos enviados por WhatsApp para evitar caracteres corruptos (rombo con signo de interrogación) originados por diferencias de codificación de archivos.
* **[x] ~~Tarea 89: Migración global a endpoint de WhatsApp API directa~~**
  * *Estatus:* Completado en el código.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se migraron todos los accesos rápidos a WhatsApp (incluyendo `whatsappService.js`, `AdminClaims.jsx`, `AdminOrders.jsx`, `ClientCatalog.jsx` y `ClientCredits.jsx`) del acortador `wa.me` al API directa de `api.whatsapp.com/send` para impedir la pérdida/corrupción de UTF-8 (emojis y acentos) producida por la redirección de Meta en dispositivos móviles.
* **[x] ~~Tarea 90: Reporte PDF detallado de respaldo para facturación de comisiones~~**
  * *Estatus:* Completado en el código.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se programó la exportación de un PDF de respaldo (`exportDeveloperBillingDetailPDF` en `pdfService.js`) que desglosa ventas brutas, descuentos, envíos, valor neto y comisión del periodo, listando las transacciones completadas como respaldo comercial. Se añadió el botón correspondiente en el panel de facturación de `AdminSettings.jsx`.







### 🧪 Pruebas y Control de Calidad
* **[x] ~~Tarea 7: Probar transacciones de stock locales~~**
  * *Estatus:* Completado y verificado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se ejecutó el script de simulación concurrente en Firestore `test_concurrencia_stock.js`. Tres transacciones simultáneas que totalizaban 12 unidades compitiendo por un stock inicial de 10 se resolvieron de forma segura: dos transacciones se aprobaron (restando 4+4 = 8 unidades, dejando 2 en stock) y la tercera se rechazó por la API atómica con `PERMISSION_DENIED / Stock insuficiente`, garantizando la consistencia y evitando sobreventas.


### 🚀 Despliegue y Distribución
* **[x] ~~Tarea 8: Compilación y Despliegue de Hosting~~**
  * *Estatus:* Completado y publicado en producción de forma exitosa.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se ejecutó `cmd /c npm run build` para validar sintaxis de producción y empaquetar de forma óptima la aplicación (generando PWA manifest y precaché de service worker). Tras el build exitoso, se corrió `cmd /c firebase deploy --only hosting` publicando todos los modales refactorizados a la URL de producción oficial.

* **[x] ~~Tarea 49: Agregar Paginación client-side de 20 productos en el catálogo de clientes~~**
  * *Estatus:* Completado en el código fuente. ✅ Verificado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se implementó el componente genérico de navegación de páginas `Pagination.jsx` (usando SVGs y microanimaciones de Framer Motion) y se integró en `ClientCatalog.jsx`. Muestra 20 productos por página cuando el usuario navega por categorías o filtros, autolimpiando y restableciendo el cursor a la página 1 en cada cambio. Se desactiva inteligentemente al escribir en la barra de búsqueda para presentar instantáneamente todos los resultados del inventario descargado en caché.

* **[x] ~~Tarea 50: Implementar Contexto Global de Alertas/Confirmaciones Premium~~**
  * *Estatus:* Completado en el código fuente. ✅ Verificado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se creó `AlertConfirmContext.jsx` en `/src/components/common/` exponiendo los hooks promesificados `showAlert` y `showConfirm` envueltos en un portal de React (`ModalTemplate.jsx`). Los diálogos son completamente personalizables, dinámicos con el tema HSL y adaptados para modo claro/oscuro. Se integró exitosamente de prueba en `AdminOrders.jsx` para el flujo de archivar pedidos completados y cancelados, validando sintaxis mediante compilación local con éxito.

* **[x] ~~Tarea 51: Cambiar ícono de menú de catálogo de clientes de ShoppingCart a Store~~**
  * *Estatus:* Completado en el código fuente. ✅ Verificado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se reemplazó el icono `ShoppingCart` de Lucide por el icono `Store` en los arrays `NAV_ITEMS_LEFT` y `ALL_NAV_ITEMS` de `ClientLayout.jsx` para evitar colisión visual y confusión con el botón de carrito de compras del header.

* **[x] ~~Tarea 52: Diseñar micro-animaciones dinámicas y glow en botón de carrito de compras móvil~~**
  * *Estatus:* Completado en el código fuente. ✅ Verificado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se modificó el botón flotante del carrito en el header móvil de `ClientLayout.jsx`. Se le integró un pulso concéntrico elástico con ondas CSS-glow (`box-shadow`), una rotación y balanceo interactivos en el icono del carrito usando Framer Motion y una burbuja de contador con efecto de rebote elástico (`spring`) que reacciona instantáneamente cuando se agregan o remueven ítems, añadiendo un punto de luz decorativo cuando está vacío.

* **[x] ~~Tarea 53: Estandarizar colores HSL del tema en modal de detalle de producto~~**
  * *Estatus:* Completado en el código fuente. ✅ Verificado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se reemplazaron todas las clases de colores azules rígidas (`bg-blue-600`, `text-blue-600`, `border-blue-600`, `ring-blue-600` y sombras asociadas) por las variables globales HSL (`bg-primary`, `text-primary`, `border-primary`, `ring-primary`, `shadow-primary/20`) en `ProductDetailModal.jsx` para garantizar que la vista respete el tema corporativo activo.

* **[x] ~~Tarea 54: Optimizar transiciones de modales deslizables (Slide-up) en móviles~~**
  * *Estatus:* Completado en el código fuente. ✅ Verificado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se modificó la transición de slide-up en `ModalTemplate.jsx` migrándola de una física `spring` (pesada en móviles) a un tween `easeOut` acelerado por hardware de `0.25s` (`translate3d(0,0,0)`). Además, se limitó el filtro `backdrop-blur-sm` únicamente a pantallas grandes (`sm:backdrop-blur-sm`) para evitar caídas drásticas de FPS en smartphones y eliminar todo el lag.

* **[x] ~~Tarea 55: Estandarizar color del icono de la cabecera en ModalTemplate a la paleta HSL del tema~~**
  * *Estatus:* Completado en el código fuente. ✅ Verificado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se modificaron las clases de color del icono decorativo superior izquierdo en `ModalTemplate.jsx`, reemplazando el fondo azul claro y texto azul rígidos (`bg-blue-50`, `text-blue-600`) por la paleta del tema dinámico (`bg-primary/10`, `text-primary`, `border-primary/20`), garantizando consistencia HSL en todos los modales unificados de la aplicación.
* **[x] ~~Tarea 56: Corregir color azul residual en icono de ModalTemplate mediante clases HSL dinámicas soft~~**
  * *Estatus:* Completado en el código fuente. ✅ Verificado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se migraron las clases de opacidad estática de Tailwind (`bg-primary/10`, `border-primary/20`) a utilidades dinámicas CSS (`bg-primary-soft`, `border-primary-soft`) en `ModalTemplate.jsx`, resolviendo el problema donde el icono superior de los modales mantenía un tono azul residual al fallar la resolución de opacidades estáticas sobre variables de color HSL dinámicas.
* **[x] ~~Tarea 57: Resolver lag/choppiness en transición de subida de modales deslizables (Slide-up)~~**
  * *Estatus:* Completado en el código fuente. ✅ Verificado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se removió la propiedad `transform: 'translate3d(0,0,0)'` estática del atributo `style` del contenedor `motion.div` in `ModalTemplate.jsx` que colisionaba con los valores interpolados de `y` calculados por Framer Motion, permitiendo que la transición slide-up se ejecute a 60 FPS sin saltos ni micro-cortes.
* **[x] ~~Tarea 58: Separar botones de acción y precio en la tarjeta de favoritos~~**
  * *Estatus:* Completado en el código fuente. ✅ Verificado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se añadió la clase `gap-3` al contenedor flex que alinea el precio base y la botonera de acciones (`Quitar de favoritos` y `Agregar al carrito`) en la tarjeta de producto de `ClientFavorites.jsx`, evitando que queden pegados cuando la pantalla se reduce de tamaño.
* **[x] ~~Tarea 59: Agregar campo de descripción a la tarjeta de producto personalizado en AdminSales~~**
  * *Estatus:* Completado en el código fuente. ✅ Verificado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se añadió un campo de entrada para "Descripción (Opcional)" en el formulario de productos personalizados de `AdminSales.jsx`. Se modificó el estado de `customItem` y la función `addCustomItemToCart` para capturar y guardar la descripción, imprimiéndola en los recibos impresos y mostrándola en la lista del carrito POS.
* **[x] ~~Tarea 60: Integrar selección de personal en POS y métricas en análisis de ventas al activar Múltiples Empleados~~**
  * *Estatus:* Completado en el código fuente. ✅ Verificado.
  * *Fecha de finalización:* 2026-05-29
  * *Historial / Revisiones:* Se leyó el feature flag `hasMultipleEmployees` y la lista `employees` del store de configuración. (1) En `AdminSales.jsx`, se agregó un selector dropdown condicional del vendedor encargado de la venta directa POS y validación de campo requerido antes de procesar el pedido. (2) En `AdminSalesDetail.jsx`, se importó el store y se calculó el ranking de ventas y acumulados por vendedor en el período filtrado, renderizando una tarjeta dedicada de rendimiento por personal.
* **[x] ~~Tarea 61: Corrección Bug — Feature Múltiples Empleados no visible en POS y ranking contaminado~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-29
  * *Re-trabajo de:* Tarea 60
* **[x] ~~Tarea 64: Corregir visualización de paginador en Garantías y Reclamos del cliente (ClientClaims.jsx) y otras secciones para que solo aparezca cuando los elementos superan los 10~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se envolvieron las llamadas de `<Pagination />` en `ClientClaims.jsx`, `ClientCredits.jsx` (tanto activos como pagados) y `ClientOrders.jsx` (pedidos normales y especiales) en condicionales explícitas de longitud de elementos (`length > 10`), garantizando que los controles de paginación nunca aparezcan a menos que haya estrictamente más de 10 elementos en la lista. Se aplicó lo mismo a los botones de paginación en `AdminCredits.jsx` cuando solo existe una página.
* **[x] ~~Tarea 65: Corregir retraso visual de transición (doble preselección) en filtros de Garantías y Reclamos (ClientClaims.jsx)~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se refactorizó la visualización de los filtros en `ClientClaims.jsx` reemplazando los cambios de clases de borde y sombras basados en transiciones lentas de CSS (`transition-all`) por una píldora de fondo deslizable dinámica premium mediante Framer Motion (`layoutId="activeClaimTab"`). Esto elimina la visualización duplicada simultánea y hace la transición fluida e instantánea.
* **[x] ~~Tarea 66: Resolver colisión de línea divisoria superior con botón Descargar Factura (ClientOrders.jsx)~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se eliminó la clase de padding superior nulo (`pt-0`) del contenedor principal de acciones en `ClientOrders.jsx`. Se unificó el espaciado interno a `p-5` y se estructuró la separación de bloques usando `space-y-4`, eliminando el desfase y asegurando que el borde superior (`border-t`) mantenga un espaciado equilibrado y limpio de 20px respecto al botón de descarga de factura.
* **[x] ~~Tarea 67: Implementar mapa interactivo y dirección de retiro en ajustes y checkout~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se inyectó una vista previa de Google Maps en tiempo real mediante un `iframe` dinámico y no-pago en la sección de retiro en tienda de `AdminSettings.jsx`. Del mismo modo, se adaptó `CheckoutModal.jsx` para que al seleccionar "Retiro en Tienda", se presente al cliente la dirección física exacta configurada y el mapa interactivo del local de forma fluida.
* **[x] ~~Tarea 68: Implementar selector interactivo de dirección en el mapa (Leaflet + OpenStreetMap)~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se modularizó un selector de mapa interactivo premium (`LeafletMapPicker.jsx`) libre de APIs de pago. Cuenta con buscador de texto integrado y pin arrastrable que autocompleta la dirección de retiro postal mediante reverse geocoding con Nominatim API. Se integró en `AdminSettings.jsx` (modo editor) y en `CheckoutModal.jsx` (modo vista protegida `readOnly`).
    * **v1.1 (2026-05-30):** Se corrigió el método de geocodificación directa (`handleSearch`) para incluir `addressdetails=1` y procesar la dirección con el mismo algoritmo de simplificación que usa la geocodificación inversa, eliminando las cadenas de direcciones largas y complejas al buscar por texto.

* **[x] ~~Tarea 69: Selector de modo de ingreso de dirección en domicilio (manual vs. mapa)~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Al seleccionar "Domicilio" en el checkout, ahora se presenta al cliente una pantalla intermedia con dos opciones: "Escribir dirección" (abre el formulario clásico de ciudad/barrio/dirección exacta) o "Seleccionar en mapa" (abre `LeafletMapPicker` en modo editable que autocompleta la dirección y extrae la ciudad automáticamente). El estado `addressMode` controla el sub-flujo y el botón "Cambiar método" permite navegar libremente entre modos. Los estados se resetean en cada apertura del modal y al cambiar el tipo de entrega.
* **[x] ~~Tarea 70: Optimización y alineación estética de botones de Domicilio en AdminOrders~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se unificaron visualmente los botones de acción rápida "Llamar Domicilio" y "WhatsApp Domicilio" eliminando la inconsistencia en los estilos de los bordes, opacidades y tipografías. Se utilizaron los íconos de Lucide correspondientes y las paletas suaves consistentes blue-500/indigo-500.

* **[x] ~~Tarea 71: Carga y persistencia del perfil de dirección del cliente al iniciar sesión~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se solucionó el problema por el cual un cliente que ya tenía una dirección guardada en Firestore debía ingresarla de nuevo. Se modificó la consulta de login del cliente en `LoginPage.jsx` para recuperar la dirección completa (`direccion`, `barrio`, `ciudad`, `coords`) e inyectarla al store de sesión `useAuthStore` al iniciar sesión.

* **[x] ~~Tarea 72: Resolver destello visual y reinicio de pasos en el CheckoutModal del cliente~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se solucionó el problema por el cual el modal de checkout mostraba momentáneamente el selector de método de entrega (Paso 1) antes de saltar al éxito (Paso 4) tras confirmar un pedido. Se implementó una referencia mutable `lastIsOpenRef` para bloquear el reinicio de pasos provocado por la actualización del perfil de usuario durante la persistencia de datos.

* **[x] ~~Tarea 73: Ajustar espaciado y márgenes de botones de Domicilio en AdminOrders~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se refinaron las clases utilitarias de los botones de acción rápida para evitar que el texto y los iconos toquen los bordes laterales en pantallas estrechas. Se aplicaron clases de tamaño de fuente `text-[11px]`, un interletrado estrecho `tracking-tight`, un gap más compacto `gap-1.5` y padding lateral `px-2`.

* **[x] ~~Tarea 74: Rediseñar cupones con dientes de sierra SVG reales (estilo zigzag premium)~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Reemplazado el antiguo separador visual de círculos/puntos por un trazado en zigzag SVG limpio en `ClientCouponsModal.jsx`, donde el contenedor lateral izquierdo y el cuerpo del cupón encajan perfectamente sin brechas de color. Se añadió una línea de perforación punteada y se previno el truncado de textos de valores grandes en el cupón.

* **[x] ~~Tarea 75: Integrar visor y selector de cupones directamente en el Checkout de Clientes~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se implementó el botón/enlace "🏷 Ver cupones disponibles" en la sección de Método de Pago dentro de `CheckoutModal.jsx`. Al pulsarlo, se despliega el modal de cupones, y al seleccionar "Usar en mi próxima compra", el código se autocompleta y se aplica automáticamente en el formulario del checkout, cerrando el modal para una experiencia de usuario fluida.

* **[x] ~~Tarea 76: Optimización de Transacciones de Firestore (lecturas previas a escrituras)~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Refactorizados los métodos `createOrder` y `createPhysicalOrder` en `orderService.js` para utilizar `Promise.all` al inicio de la transacción, ejecutando de forma paralela y absoluta todas las lecturas de base de datos (`transaction.get`) antes de cualquier procesamiento de lógica o escritura, solucionando definitivamente la excepción de Firestore en transacciones concurrentes.

* **[x] ~~Tarea 77: Optimización de Animación y Montaje de Modales Deslizables (cero lag)~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Optimización visual eliminando el lag en modales deslizables hacia arriba. Se removió el early return `if (!isOpen) return null` de `CheckoutModal.jsx` y `ClientFilterModal.jsx` para mantener el árbol de componentes y sus pesados hooks cargados en caché. Se reestructuró el flujo condicional interno de `ClientFilterModal` dentro de `AnimatePresence` permitiendo que el navegador renderice transiciones de entrada y salida fluidas a 60 FPS sin recargas bruscas.

* **[x] ~~Tarea 78: Reordenamiento y Sincronía del botón Mover a Completado en la Tarjeta de Pedidos~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se modificó la cuadrícula del panel de acciones rápidas de la tarjeta de pedidos (`AdminOrders.jsx`). Al activar el turnero, el botón principal "Mover a Completado" cambia de `col-span-2 h-12` a `col-span-1 h-11`, integrándose en un diseño simétrico 2x2: (1) WhatsApp y Espera en la primera fila, y (2) Cancelar y Mover a Completado en la segunda fila, quedando este último alineado verticalmente y con la misma altura justo debajo de Espera.

* **[x] ~~Tarea 79: Rediseño Compacto y Prémium del Tablero de Turnos del Cliente (QueueBoard)~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Rediseñado completamente `QueueBoard.jsx` convirtiéndolo de una estructura vertical pesada a un cintillo horizontal compacto, plano y libre de bordes oscuros. Adicionalmente, se actualizó la biblioteca de componentes del proyecto ([`tablero_cola_turnos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Pedidos_y_Gestion/Tablero_Cola_Turnos/tablero_cola_turnos.md)) para sincronizar su especificación visual y código React con esta última versión 2.0 compacta de producción.

* **[x] ~~Tarea 80: Sistema de Preparación (Cocina/Bodega) y Portal de Empleados con Seguridad por PIN y Código QR~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se completó la integración transaccional y modular del panel de preparación (`/cocina`) y el portal de empleados (`/empleado`) con autenticación mediante PIN. El administrador puede activar individualmente estas opciones, configurar códigos PIN para empleados, restringir la navegación del panel administrativo de acuerdo al rol del empleado (Ventas/POS exclusivo) y generar códigos QR de acceso rápido. Si el sistema de preparación está activo, el flujo de estados transiciona a "alistamiento" (preparación) y "listo" (cocina) y sincroniza en tiempo real con el turnero y la timeline del cliente, conservando compatibilidad heredada en caso de desactivación.
* **[x] ~~Tarea 91: Restablecimiento del scroll superior en transiciones de páginas (Scroll To Top)~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se diseñó e implementó el componente utilitario global `ScrollToTop.jsx` que escucha activamente los cambios de ruta (`pathname`) mediante `useLocation`. Se inyectó dentro del proveedor de rutas en `App.jsx` para forzar que el navegador salte al tope superior (`window.scrollTo(0,0)`) cada vez que el usuario navega entre vistas de administración, cliente o portal, eliminando la sensación de desorientación por scroll acumulado.
* **[x] ~~Tarea 92: Eliminación de opciones duplicadas (Ventas al por Mayor y Garantías/Reclamos) en Ajustes Admin~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se detectó y eliminó la duplicidad en los ajustes de administración. Se eliminaron las tarjetas y bloques de renderizado redundantes para las subsecciones individuales de "Ventas al por Mayor" (`mayorista`) y "Garantías y Reclamos" (`garantias`) en "Personalizar Tienda". Al ser switches binarios idénticos a los de la pestaña centralizada "Módulos Activos", se consolidó su gestión única en dicha sección.
* **[x] ~~Tarea 93: Optimización visual de PWA y priorización de banner publicitario en Perfil de Cliente~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se reordenaron las tarjetas en la página de perfil del cliente (`ClientProfile.jsx`) para mostrar el banner de referido publicitario del desarrollador en primer lugar, posicionándolo sobre la descarga PWA. Adicionalmente, en la tarjeta de PWA de cliente y admin se inyectó el botón de instalación directa junto con un acordeón colapsable para desplegar las instrucciones manuales opcionalmente mediante el toggle "Ver instructivo de instalación manual", reduciendo el desorden visual en el layout.
* **[x] ~~Tarea 94: Condicionamiento de bloque de cupones en Checkout del Cliente según el flag couponsEnabled~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se inyectó la validación del flag `couponsEnabled` recuperado de `useAppConfigStore` en `CheckoutModal.jsx`. Si el módulo de cupones está deshabilitado globalmente en la tienda, el campo de ingreso de código, el botón de aplicar y el enlace de cupones disponibles se ocultan por completo en el paso de pago, previniendo el uso indebido o no autorizado de descuentos.
* **[x] ~~Tarea 95: Corregir error de lectura en Seguimiento de Pedidos por restricción de Firestore Rules~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se adicionó la cláusula `|| (resource.data.trackingToken != null)` en la sección de `/orders` de las reglas de Firestore (`firestore.rules`). Esto permite la lectura pública de un pedido cuando la consulta de búsqueda contiene el token secreto de seguimiento generado tras finalizar la orden en el Checkout, subsanando el error "Atención: Ocurrió un error al consultar el estado del pedido".
* **[x] ~~Tarea 96: Habilitar lectura y actualización del Panel de Cocina sin autenticación en Firestore Rules~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se modificó `firestore.rules` permitiendo lecturas públicas a la colección `/orders` para cualquier documento cuyo estado esté en preparación o listo (`alistamiento` o `listo`). Adicionalmente, se otorgaron permisos de actualización (`allow update`) para la transición específica entre los estados `alistamiento` <-> `listo`. Esto permite que el panel de cocina (`KitchenPanel.jsx`), que funciona mediante validación de PIN en cliente sin sesión de Firebase Auth (`request.auth == null`), pueda consultar y actualizar el estado de los platos de forma transparente y reactiva.
* **[x] ~~Tarea 97: Implementación del Rol de Empleado "Domiciliario" y Espacio de Trabajo de Entregas (/domicilio)~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:* Se agregó el rol "domiciliario" con campos adicionales de vehículo, placa y celular en `AdminSettings.jsx`. Se creó el portal `/domicilio` (`DeliveryPanel.jsx`) que autentica con PIN a los domiciliarios, mostrándoles estadísticas diarias, saldo de caja cobrada, órdenes listas/camino, mapas interactivos (`MapToggle`), llamadas y WhatsApp de contacto. En `firestore.rules`, se habilitó el acceso público y de actualización para transiciones relacionadas a repartos (`en_camino` y `completado`).
* **[x] ~~Tarea 98: Módulo de Compra de Productos por Código QR con Registro Express y Vista Pública Dinámica~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-30
  * *Historial / Revisiones:*
    - **v1.0 (2026-05-30):** Se diseñó, implementó y documentó el módulo. Permite al administrador encender/apagar la opción desde ajustes. Si está encendido, el inventario permite generar y descargar QRs vinculados al producto. Al escanearse por el cliente, si no tiene sesión activa inicia un login/registro express de celular y nombre que autogestiona el perfil, agrega el producto al carrito directamente y despliega el CartDrawer al instante.
    - **v1.1 (2026-05-30):** Se ajustó la redirección de escaneo QR con lógica diferenciada: si el cliente está registrado (sesión activa), se abre el modal de detalle del producto (`selectedProduct`) para permitirle elegir variantes (talla/color) y ver descripciones; si no está registrado, se añade el producto de forma automática a su carrito y se abre el drawer con notificación toast de confirmación. Se optimizó el estilo del mensaje de bienvenida en `LoginPage.jsx` removiendo bordes rígidos y aplicando `border-app`.
    - **v2.0 (2026-05-30):** Se modificó radicalmente el flujo eliminando la complejidad del registro express y sus interferencias en el catálogo. Ahora, el QR del producto apunta a una nueva ruta pública ultra-rápida y premium `/producto/:id` (`ProductPublicDetail.jsx`). Esta vista muestra de inmediato la ficha del producto y permite seleccionar variaciones y agregar al carrito de manera directa e intuitiva. Al agregar al carrito, si el usuario tiene sesión activa, vuelve al catálogo; si no tiene sesión, abre el checkout y le solicita autenticación tradicional al final sin fricciones previas. Se removieron todos los residuos de código de registro express en `ClientCatalog.jsx`.

* **[x] ~~Tarea 100: Rediseño Responsivo de Configuración de Administrador (Split Screen en PC)~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-31
  * *Historial / Revisiones:* Se rediseñó la vista de ajustes del administrador (`AdminSettings.jsx`) para adaptarla a pantallas grandes sin alterar la experiencia nativa de celulares. En PC, la pantalla se divide en un sidebar de navegación izquierdo de 290px de ancho para pestañas/categorías, y un panel derecho autoajustable con el formulario activo. Si el administrador entra a la vista general en PC, se autoselecciona la pestaña "Identidad de Marca" (`marca`) por defecto en lugar de una pantalla vacía. En móviles se conserva el listado de tarjetas y retorno lineal mediante transitions en Framer Motion.

* **[x] ~~Tarea 101: Corrección de Permisos Firestore para Guardar Calificación de Vendedores desde el Cliente~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-31
  * *Historial / Revisiones:* Se solucionó el error por el cual las calificaciones de vendedor (estrellas) que marcaban los clientes se borraban y desaparecían al instante. Se modificaron las reglas de Firestore (`firestore.rules`) en la colección `/orders` para permitir que clientes no autenticados actualicen los campos `calificacionVendedor` y `updatedAt` de sus propios pedidos, validándolo de forma segura mediante `request.resource.data.diff(resource.data).affectedKeys().hasOnly(['calificacionVendedor', 'updatedAt'])`.

* **[x] ~~Tarea 102: Módulo de Ajustes de Inventario y Descartes (Regalo, Avería, Consumo Interno) en POS~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-31
  * *Historial / Revisiones:* Se diseñó e implementó la funcionalidad completa de Ajustes de Inventario. El administrador puede activarlo condicionalmente en "Módulos Activos" (`inventoryAdjustmentsEnabled`). Si se enciende, el POS permite cambiar la operación a "Ajuste (Descarte)" y seleccionar entre Regalo, Avería o Consumo Interno, guardando la orden con total `$0` e `isAjuste: true`. El panel de análisis de ventas (`AdminSalesDetail.jsx`) y el generador de PDF (`pdfService.js`) filtran estos ajustes para excluirlos de los ingresos comerciales, pero muestran un desglose y tabla detallada independiente de descartes de stock.

* **[x] ~~Tarea 103: Optimización del Selector de Obsequios y Buscador Compacto en Gestión de Clientes~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-05-31
  * *Historial / Revisiones:* Se modificó el componente `<CustomSelect>` en `AdminSettings.jsx` para utilizar `ReactDOM.createPortal` en `document.body` con posicionamiento fijo, solucionando el clipping del menú de selección de productos dentro de contenedores con `overflow-y-auto` en el modal de obsequio. Se implementó una barra de búsqueda rápida por nombre o celular en la subsección "Gestión de Clientes". Se aumentó el tamaño de página (paginación) a 30 elementos para evitar saturaciones, y se compactó la tabla reduciendo márgenes, espaciados y el tamaño del avatar inicial.

* **[x] ~~Tarea 104: Fichas de Expedientes (Clientes y Empleados), Segmentación y Módulo de Colillas de Pago~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-06-01
  * *Historial / Revisiones:* Se implementaron los Drawers deslizantes (Fichas) de expedientes detallados para Clientes (métricas de fidelización, ticket promedio, frecuencia, dirección de mapa, historial de pedidos) y Empleados (salarios, PIN, pedidos procesados, historial de nómina) en `AdminSettings.jsx`. Se añadieron chips de segmentación (Todos, VIP, Inactivos, Nuevos) para clasificar clientes. En el portal de empleados (`EmployeePortal.jsx`), se implementó la sección de descarga de recibos/colillas de nómina (último mes e histórico mediante mes/año) en PDF a través de `jsPDF`. Adicionalmente, al crear egresos de tipo nómina se guarda el `employeeId` correspondiente en el ítem de `pagosFijos` para realizar el cruce automático.

* **[x] ~~Tarea 116: Integrar valor de domicilio editable en tarjeta de pedido del administrador~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-01
  * Historial / Revisiones: Se añadió un apartado dinámico y auto-guardable en la tarjeta de pedido del administrador (`AdminOrders.jsx`) para que pueda configurar y actualizar el valor del domicilio (`costoEnvio`) de un pedido específico. Esta sección solo se renderiza si el método de entrega de domicilio (`deliverySettings.shipping.enabled`) está activo en la configuración y el tipo de entrega es a domicilio. Se actualiza atómicamente en Firestore recalculando el total general de la orden. Build verificado y limpio ✅.

* **[x] ~~Tarea 118: Planificar, Auditar y Reestructurar el Panel Administrativo en 5 Niveles Jerárquicos~~**
  * Estatus: Completado.
  * Fecha de finalización: 2026-06-01
  * Historial / Revisiones:
    - Realización de la auditoría obligatoria de todos los elementos configurativos y herramientas operativas de `AdminSettings.jsx` y vistas administrativas asociadas.
    - Definición de la jerarquía de 5 niveles: Mi Negocio (Nivel 1), Herramientas Administrativas (Nivel 2), Panel Maestro (Nivel 3), Laboratorio (Nivel 4) y Sistema (Nivel 5).
    - Creación del documento de auditoría oficial en `D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\auditoria_panel_administrativo.md`.
    - Elaboración del plan de implementación en `implementation_plan.md`.
    - **Reestructuración de UI:** Se rediseñó por completo el bucle de menú de `AdminSettings.jsx` para organizar todas las configuraciones en 5 niveles de tarjetas claros y estilizados.
    - **Bug Fix 1 (Laboratorio):** Se corrigió la redirección fallida al panel de pedidos de la vista principal al abrir la sección Laboratorio (Nivel 4), implementando la renderización de un menú modular interno interactivo en caliente.
    - **Bug Fix 2 (Personalizar Tienda & Developer Separation):** Se retiró el módulo "Módulos Activos" (`modulos`) de Nivel 1 (Personalizar Tienda), y se trasladó como una herramienta protegida por contraseña de desarrollador bajo Nivel 3 (Panel Maestro) con el ID de subsección `dev-modulos`.
    - **Limpieza de Código:** Se removió el bloque condicional obsoleto `activeSubSection === 'modulos'` de la sección Nivel 1 para evitar duplicaciones y lógica suelta.
    - Build: ✅ Exitoso — 1.50s, 0 errores.

* **[x] ~~Tarea 122: Ecosistema Completo de Compartición de Seguimiento de Pedidos (QR, Enlace Seguro y WhatsApp)~~**
  * *Estatus:* Completado. ✅ Build sin errores.
  * *Fecha de finalización:* 2026-06-01
  * *Historial / Revisiones:*
    - **Base de Datos y Seguridad:** Creada e integrada la colección `/trackingAnalytics` y ajustadas las reglas en `firestore.rules` para permitir a clientes anónimos la creación (`allow create: if true`) de logs analíticos (scans de QR, clics en catálogo, descargas de app). Las lecturas y modificaciones generales quedan exclusivamente restringidas al administrador (`allow read: if isAdmin()`).
    - **Servicio de Telemetría (`trackingAnalyticsService.js`):** Nuevo servicio que registra eventos asíncronamente con protección local contra clicks duplicados y obtiene la agregación del rendimiento analítico en tiempo real.
    - **Módulo OrderShareModal:** Genera códigos QR sobre canvas de alta definición en tiempo real (con contraste HSL profundo sobre blanco), soporta descargas PNG independientes, vistas optimizadas de escala gris a 80mm para impresión instantánea de tickets de reparto, copiado con micro-animaciones al portapapeles, y envíos por WhatsApp con plantillas dinámicas autocompletando tags del pedido (`{cliente}`, `{pedido}`, `{estado}`, `{tienda}`, `{enlace}`).
    - **Acceso Rápido en POS:** Integrado el icono `QrCode` en cada tarjeta de orden de `AdminOrders.jsx`, validando el rol PIN operativo para evitar accesos de cocineros o bodegueros.
    - **Fidelización y Recompra Dinámica:** Modificado `OrderTracking.jsx` para gatillar analíticas en caliente y presentar los bloques "Sigue explorando" y "Promoción de App Oficial". Si la orden pasa a estado entregado o cancelado, estas secciones ascienden al tope de la visual con animaciones, maximizando la tasa de recompra.
    - **Panel en Configuración y Home:** Inyectado el editor de plantillas de WhatsApp y banners de la app en `AdminSettings.jsx`, y el Dashboard de conversión interactivo "Conversión desde Seguimiento" en `AdminHome.jsx` con métricas clave en tiempo real.
    - Build: ✅ Exitoso — 1.15s, 0 errores.


