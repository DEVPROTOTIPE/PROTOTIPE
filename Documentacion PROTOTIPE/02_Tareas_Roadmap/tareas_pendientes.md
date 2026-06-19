# Control de Tareas y Estado de Implementación (Roadmap de Prototype CLI)

Este documento registra de forma dinámica las tareas del motor **Prototype CLI** y los scripts de soporte y automatización del ecosistema.

---

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