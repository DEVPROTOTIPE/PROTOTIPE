# Control de Tareas y Estado de Implementación (Roadmap de Prototype CLI)

Este documento registra de forma dinámica las tareas del motor **Prototype CLI** y los scripts de soporte y automatización del ecosistema.

---

* **[x] ~~Tarea CLI-031: Rediseño de Toast de Confirmación en Ajustes del Administrador (UI/UX)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-13
  - Fecha de finalización: 2026-06-13
  - Descripción: Se corrigió la UX de los mensajes de confirmación de guardado en los Ajustes del Administrador. Anteriormente aparecían estáticos en la parte superior del menú, obligando al usuario a desplazarse hacia arriba para verificar el guardado. Se reemplazó por un Toast flotante premium en la parte superior central de la pantalla utilizando `AnimatePresence` y `motion.div` de `framer-motion`, configurado con auto-limpieza mediante un `useEffect` central a los 2 segundos exactos de duración.
  - Archivos: [AdminSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY], [AdminSettings.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]

* **[x] ~~Tarea CLI-030: Fortalecimiento y Dinamización de Tests E2E (Bugfix y Mejora)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-13
  - Fecha de finalización: 2026-06-13
  - Descripción: Corregida y dinamizada la suite de pruebas E2E de Playwright. (1) Se cambió `nameInputPlaceholder` de `'María Pérez'` a `'nombre y apellido'` para coincidir con el input real de `LoginPage.jsx` ("Ingresa tu nombre y apellido"). (2) Se refactorizó la selección del producto en el catálogo (`selectProductFromCatalog` en `checkout.helpers.js`) para usar un localizador genérico `h3[title]` en lugar de depender de un texto estático de producto (`targetProductText`). Esto evita fallas en las pruebas y bloqueos de push a GitHub si se eliminan o alteran los productos de la base de datos de Firebase.
  - Archivos: [app-ventas.config.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/config/app-ventas.config.js) [MODIFY], [app-ventas.config.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/tests/config/app-ventas.config.js) [MODIFY], [checkout.helpers.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/helpers/checkout.helpers.js) [MODIFY], [checkout.helpers.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/tests/helpers/checkout.helpers.js) [MODIFY]

* **[x] ~~Tarea CLI-029: Reubicación del Módulo de Apariencia y Colores a Ajustes de Desarrollador~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-13
  - Fecha de finalización: 2026-06-13
  - Descripción: Mover la sección "Apariencia y Colores" del menú principal de ajustes del administrador para que se encuentre únicamente dentro de la Zona de Desarrollador, protegiéndola bajo el PIN maestro. Actualizada la documentación correspondiente de Estructura de Ajustes (`estructura_ajustes.md`).
  - Archivos: [AdminSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY], [AdminSettings.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx) [MODIFY], [DeveloperSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY], [DeveloperSettings.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY], [estructura_ajustes.md](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/estructura_ajustes.md) [MODIFY], [estructura_ajustes.md](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/Documentacion%20App%20Ventas/estructura_ajustes.md) [MODIFY]

* **[x] ~~Tarea CLI-028: Rediseño de Tarjeta de Perfil de Administrador en Ajustes (UI/UX)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-13
  - Fecha de finalización: 2026-06-13
  - Descripción: Reubicado el botón "Cerrar Sesión" del encabezado superior derecho (donde colisionaba con las notificaciones) a una nueva tarjeta de perfil de administrador antes de la lista de cupones. La tarjeta muestra el avatar emoji (`👑`), nombre, negocio y correo de acceso del administrador.
  - Archivos: [AdminSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY], [AdminSettings.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]

* **[x] ~~Tarea CLI-027: Integración de Accesos Rápidos de Reportes en Inventario y Créditos (UI/UX)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-13
  - Fecha de finalización: 2026-06-13
  - Descripción: Implementados accesos rápidos para facilitar la exportación de PDFs estratégicos. Añadido el botón de "Exportar Rotación" en `AdminInventory.jsx` al lado de 'Nuevo Producto', y el botón "Exportar Cartera" en `AdminCredits.jsx` al lado de la barra de búsqueda de créditos.
  - Archivos: [AdminInventory.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminInventory.jsx) [MODIFY], [AdminCredits.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]

* **[x] ~~Tarea CLI-026: Corrección de Cuentas por Cobrar en Reporte y Creación de Reporte de Deudas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-13
  - Fecha de finalización: 2026-06-13
  - Descripción: Corregida la acumulación de créditos pagados en el reporte financiero de Ventas y Caja, segregando los saldos pendientes reales y sumando la porción abonada/liquidada a la caja líquida real. Implementada además la nueva herramienta de exportación en PDF de "Cuentas por cobrar y deudas" (`exportCreditsReportPDF`) y añadido su correspondiente botón en `AdminSalesDetail.jsx`.
  - Archivos: [pdfService.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/pdfService.js) [MODIFY], [AdminSalesDetail.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]

* **[x] ~~Tarea CLI-025: Optimización de Motores de Exportación en PDF y Sincronización de Plantillas Core~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-13
  - Fecha de finalización: 2026-06-13
  - Descripción: Sincronización de cambios y corrección de lógica de exportación en pdfService.js para soportar desgloses, tipos de pedidos y conciliación de caja en la CLI.
  - Archivos: [pdfService.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/pdfService.js) [MODIFY]

* **[x] ~~Tarea CLI-024: Corrección de Reglas de Seguridad de Firestore para Consultas del Cliente (Missing or insufficient permissions)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-13
  - Fecha de finalización: 2026-06-13
  - Descripción: Se corrigió el error de permisos en tiempo de ejecución ("Missing or insufficient permissions") al listar pedidos e historial de créditos en el perfil del cliente. La regla de seguridad anterior evaluaba `request.query.filters` para condicionar las consultas de listado en las colecciones `/orders` y `/credits`, pero dicho objeto no existe en las reglas de producción de Firestore (provocando errores críticos). Se reemplazó por la validación estándar basada en `resource.data` (`resource.data.cliente.celular != null`), permitiendo a los clientes recuperar de forma segura su información en base al filtro de número celular aplicado desde la consulta de la app.
  - Archivos: [firestore.rules](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [MODIFY], [firestore.rules](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/firestore.rules) [MODIFY]

* **[x] ~~Tarea CLI-023: Bloqueo Centralizado y Global de Scroll de Fondo en Modales (Scroll Lock)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-13
  - Fecha de finalización: 2026-06-13
  - Descripción: Implementado un bloqueo centralizado de scroll de fondo (body scroll lock) para todos los modales de la aplicación de manera declarativa y reactiva mediante una regla CSS global en `index.css` que aprovecha el selector moderno `:has` para interceptar la presencia de cualquier overlay `fixed inset-0` de pantalla completa. Esto previene el scroll indeseado en la página de fondo al navegar o interactuar con modales personalizados o del core.
  - Archivos: [index.css](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/index.css) [MODIFY]

* **[x] ~~Tarea CLI-022: Rediseño Visual de Modal de Producto y Ajuste de Ancho en Sub-páginas Administrativas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-13
  - Fecha de finalización: 2026-06-13
  - Descripción: Rediseño de inputs, spacings y previsualizaciones del modal de edición de producto (`ProductFormModal.jsx`), aumentando dimensiones, corrigiendo truncamiento de placeholders en mobile/PC y mejorando el área de cliqueo en variantes. Adicionalmente, se cambió el ancho máximo (`max-w-4xl`/`max-w-6xl` a `max-w-7xl`) en las vistas de Detalle de Ventas (`AdminSalesDetail.jsx`), Alertas de Stock (`AdminStockAlerts.jsx`) y Créditos (`AdminCredits.jsx`) para que ocupen la pantalla de forma consistente.
  - Archivos: [ProductFormModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY], [AdminSalesDetail.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY], [AdminStockAlerts.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminStockAlerts.jsx) [MODIFY], [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]

* **[x] ~~Tarea CLI-021: Corrección Visual del Modal de Punto de Venta QR y Rediseño de Layout~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-13
  - Fecha de finalización: 2026-06-13
  - Descripción: Corrección de overflow y scrollbars del modal de Punto de Venta QR en AdminInventory.jsx. Se compacta el layout del modal reduciendo espaciados verticales y el tamaño del QR por defecto, y se extrae el zoom del QR a un overlay modal independiente de pantalla completa para evitar el aumento de tamaño de la tarjeta principal. Adicionalmente se implementó bloqueo de scroll sobre el body cuando el modal está abierto para evitar el scroll del background.
  - Archivos: [AdminInventory.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]

* **[x] ~~Tarea CLI-020: Habilitación de Telemetría Real en Local y Migración a Cloud Functions Gen 2~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-13
  - Fecha de finalización: 2026-06-13
  - Descripción: Se migró la Cloud Function `reportTelemetry` a Gen 2 (`onRequest` con `cors: true`), se solucionaron los problemas de permisos de GCP y se configuraron las políticas de IAM para permitir llamadas públicas (`roles/run.invoker`). Asimismo, se deshabilitó el bypass de telemetría local de la App de Ventas y se sanitizaron comillas redundantes en `.env.local` y el generador CLI.
  - Archivos: [telemetryService.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/telemetryService.js) [MODIFY], [index.js](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/functions/index.js) [MODIFY], [.env.local](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.env.local) [MODIFY], [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CLI-019: Simplificación de Login de Administrador (Remoción de Campos de Registro)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Eliminados los campos redundantes de registro del Administrador (Nombre del Vendedor y WhatsApp) de la página de Login. Se simplificó el flujo de autenticación administrativa para requerir únicamente correo y contraseña, sincronizando los datos del administrador con los valores predeterminados de la configuración global si se registra por primera vez, y permitiendo su posterior personalización desde el panel de Ajustes.
  - Archivos: [LoginPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY], [LoginPage.jsx](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]

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
