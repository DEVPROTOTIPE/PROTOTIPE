# Control de Tareas y Estado de ImplementaciÃ³n (Roadmap de Prototype CLI)

* **[x] ~~Tarea CLI-025: AutenticaciÃ³n OAuth2 Unificada en el Dashboard (Google/GitHub) (2026-07-08)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-08
  - DescripciÃ³n: Desarrollar la AutenticaciÃ³n OAuth2 unificada en el Dashboard para eliminar los logins por consola y transmitir credenciales al Bridge.
  - Refinamiento / Ajuste (2026-07-08):
    * Integrado el token de acceso dinÃ¡mico OAuth2 (`--token`) en la fase de preflight check de `generator.js` (`checkEnvironment`), permitiendo aprovisionamientos no interactivos.
    * Saneada la biblioteca eliminando referencias huÃ©rfanas al componente purgado `Formulario_Producto_IA` en `inventario_maestro.md`.
  - Archivos:
    - [generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [firebase.js](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/firebase.js) [MODIFY]
    - [inventario_maestro.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/inventario_maestro.md) [MODIFY]
    - [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
    - [bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
    - [ideas_y_backlog_futuro.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/ideas_y_backlog_futuro.md) [MODIFY]

* **[x] ~~Tarea CLI-023: InyecciÃ³n en Caliente de Componentes (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Copiar fÃ­sicamente los archivos JSX de la biblioteca recomendados al Scaffold al finalizar la inicializaciÃ³n del proyecto.
  - RevisiÃ³n / Ajuste (2026-07-08): InyecciÃ³n del listado de componentes pre-instalados con sus sentencias de importaciÃ³n en `guia_estilos_ui.md` y en `antigravity_bootstrap_prompt.md` para proveer contexto cognitivo proactivo a la IA.
  - Archivos:
    - [generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
    - [bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CLI-024: AutomatizaciÃ³n de Cuenta de Servicio IAM (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Solicitar y descargar la cuenta de servicio de Firebase de forma programÃ¡tica a travÃ©s de la API IAM y guardarla en /scratch.
  - Archivos:
    - [generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
    - [bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea DOC-003: DocumentaciÃ³n de Aislamiento Multitenant de Clientes Control (DEC-004) (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Detallar de forma explÃ­cita en seguridad_firestore_ecosistema.md la regla de aislamiento multitenant y el filtro estricto por clientId y token para clientes_control, eliminando el helper de administrador permisivo por defecto.
  - Archivos:
    - [seguridad_firestore_ecosistema.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/seguridad_firestore_ecosistema.md) [MODIFY]
    - [verify_library_integrity.cjs](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY]
    - [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
    - [bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
    - [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CLI-022: AuditorÃ­a EstÃ¡tica de Rol Admin y RBAC (Linter) (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Desarrollar e integrar la validaciÃ³n de seguridad de roles (RBAC Guard) en verify_library_integrity.cjs para comprobar que todas las vistas administrativas del dashboard o plantillas verifiquen el rol 'admin'.
  - Archivos:
    - [verify_library_integrity.cjs](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY]
    - [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
    - [bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
    - [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CLI-021: Endurecimiento FÃ­sico de Reglas de Seguridad (DEC-004) (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Modificar las plantillas de reglas de Firestore y Storage en generator.js y server.js del CLI para restringir por rol admin (/users/{uid}) y matching de clientId, aplicando las decisiones tÃ©cnicas de seguridad y gobernanza.
  - Archivos:
    - [generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
    - [bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea DOC-002: DocumentaciÃ³n de EspecificaciÃ³n CORS en Storage (DEC-005) (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Documentar el payload JSON y el flujo de fallback/cachÃ© de la polÃ­tica CORS en Storage (DEC-005) en el manual de configuraciÃ³n de marca.
  - Archivos:
    - [manual_brand_config.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_brand_config.md) [MODIFY]
    - [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
    - [bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
    - [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea DOC-001: DocumentaciÃ³n de Storage Preflight Check (DEC-003) (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Agregar la secciÃ³n de explicaciÃ³n tÃ©cnica del Storage Preflight Check automÃ¡tico (DEC-003) en el manual de inicializaciÃ³n de nuevos proyectos.
  - Archivos:
    - [inicializacion_nuevos_proyectos.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/inicializacion_nuevos_proyectos.md) [MODIFY]
    - [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
    - [bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
    - [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CLI-020: ImplementaciÃ³n de Storage Preflight Check (DEC-003) (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Desarrollar e integrar la funciÃ³n validateFirebaseStorageBucket en checkEnvironment de generator.js para validar por llamada REST HEAD/GET que el bucket del cliente estÃ© activo antes de iniciar el scaffolding.
  - Archivos:
    - [generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
    - [bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-318: AlineaciÃ³n de Reglas de IA (GEMINI.md) (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Replicar la secciÃ³n de directivas de seguridad y gobernanza de Firebase (DEC-003 a DEC-006) en el archivo central de resguardo GEMINI.md para mantener la alineaciÃ³n de todas las IAs en el monorepo.
  - Archivos:
    - [GEMINI.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
    - [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
    - [bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-317: Endurecimiento de Seguridad y Gobernanza (AGENTS.md) (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Inyectar la secciÃ³n obligatoria de directivas de seguridad y gobernanza Firebase (DEC-003 a DEC-006) en AGENTS.md, cubriendo la prohibiciÃ³n de Cloud Functions, chequeo preflight de Storage, polÃ­ticas CORS y RBAC estricto.
  - Archivos:
    - [AGENTS.md](file:///d:/PROTOTIPE/.agents/AGENTS.md) [MODIFY]
    - [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
    - [bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-313: CreaciÃ³n de Manual de Onboarding para Desarrolladores Junior (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se redacta e integra el manual_onboarding_desarrollador_junior.md en la carpeta de manuales para formalizar la inducciÃ³n tÃ©cnica rÃ¡pida al ecosistema y reglas de AGENTS.md.
  - Archivos:
    - [manual_onboarding_desarrollador_junior.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/manual_onboarding_desarrollador_junior.md) [NEW]
    - [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-316: MitigaciÃ³n de Riesgos y Disaster Recovery (NotebookLM Audit) (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se redacta el manual_gestion_riesgos_y_disaster_recovery.md cubriendo los 6 puntos crÃ­ticos identificados por NotebookLM (Spark limits, backups Firestore, offboarding, circuit breaker, etc.) y se implementa batching/rate-limiting en telemetryService.js.
  - Archivos:
    - [manual_gestion_riesgos_y_disaster_recovery.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/manual_gestion_riesgos_y_disaster_recovery.md) [NEW]
    - [telemetryService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/telemetryService.js) [MODIFY]
    - [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [backup_db.js](file:///d:/PROTOTIPE/Prototipe-CLI/scripts/backup_db.js) [NEW]
    - [offboard_client.js](file:///d:/PROTOTIPE/Prototipe-CLI/scripts/offboard_client.js) [NEW]
    - [SparkQuotaBanner.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/common/SparkQuotaBanner.jsx) [NEW]
    - [App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [CobrosPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CobrosPanel.jsx) [MODIFY]
    - [telemetryService.js (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js) [MODIFY]
    - [SparkQuotaBanner.jsx (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/common/SparkQuotaBanner.jsx) [NEW]
    - [App.jsx (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/App.jsx) [MODIFY]
    - [telemetryService.js (template-core-seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/telemetryService.js) [MODIFY]
    - [SparkQuotaBanner.jsx (template-core-seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/common/SparkQuotaBanner.jsx) [NEW]
    - [App.jsx (template-core-seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-315: CreaciÃ³n de BuzÃ³n de Ideas y Notas del Backlog (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se crea el archivo ideas_y_backlog_futuro.md en la carpeta del Roadmap para centralizar notas, ideas innovadoras y propuestas de optimizaciÃ³n a evaluar en futuros sprints.
  - Archivos:
    - [ideas_y_backlog_futuro.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/ideas_y_backlog_futuro.md) [NEW]
    - [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-314: CreaciÃ³n de Cuestionario de CertificaciÃ³n TÃ©cnica para Desarrolladores (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se documenta el cuestionario_certificacion_desarrollo_2026.md conteniendo 20 preguntas avanzadas y clave de respuestas estructuradas por mÃ³dulos para evaluar el entendimiento tÃ©cnico del ecosistema.
  - Archivos:
    - [cuestionario_certificacion_desarrollo_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/cuestionario_certificacion_desarrollo_2026.md) [NEW]
    - [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-319: Resiliencia ante Exceso de Cuotas y Modo Mantenimiento Global (2026-07-08)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-08
  - DescripciÃ³n: Integrado el soporte para Modo Mantenimiento global bloqueante e interceptaciÃ³n de cuota de Firestore en caliente (`resource-exhausted`) para forzar la conmutaciÃ³n visual al modo de solo lectura local en el Scaffold de ventas y Core Seed.
  - Archivos:
    - [App.jsx (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY]
    - [appConfigService.js (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/appConfigService.js) [MODIFY]
    - [appConfigStore.js (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
    - [App.jsx (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/App.jsx) [MODIFY]
    - [appConfigService.js (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/appConfigService.js) [MODIFY]
    - [appConfigStore.js (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/store/appConfigStore.js) [MODIFY]
    - [App.jsx (template-core-seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/App.jsx) [MODIFY]
    - [appConfigService.js (template-core-seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/appConfigService.js) [MODIFY]
    - [appConfigStore.js (template-core-seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js) [MODIFY]
    - [generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [toggle_maintenance.js](file:///d:/PROTOTIPE/Prototipe-CLI/scripts/toggle_maintenance.js) [NEW]
    - [ClientCredits.jsx (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY] (Saneamiento de sintaxis)
    - [ClientCredits.jsx (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ClientCredits.jsx) [MODIFY] (Saneamiento de sintaxis)
    - [DeveloperSettings.jsx (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY] (Saneamiento de sintaxis)
    - [DeveloperSettings.jsx (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY] (Saneamiento de sintaxis)
    - [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
    - [bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
    - [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [ventas-moni-app/prototipe.lock.json](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/prototipe.lock.json) [MODIFY]
    - [ventas-moni-app/src/App.jsx](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/App.jsx) [MODIFY]
    - [ventas-moni-app/src/pages/admin/settings/sections/DeveloperSettings.jsx](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
    - [ventas-moni-app/src/pages/client/ClientCredits.jsx](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/pages/client/ClientCredits.jsx) [MODIFY]
    - [ventas-moni-app/src/services/appConfigService.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/services/appConfigService.js) [MODIFY]
    - [ventas-moni-app/src/store/appConfigStore.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/store/appConfigStore.js) [MODIFY]

* **[ ] Tarea CORE-312: IntegraciÃ³n de Portal B2C - ConsolidaciÃ³n de Abonos de CrÃ©ditos en Firestore (2026-07-07)**
  - Estatus: Pendiente.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Conectar la pasarela de pagos simulada del portal de clientes (ClientCredits.jsx) con el registro transaccional real de abonos en Firestore bajo la colecciÃ³n de auditorÃ­a fÃ­sica /credits/{id}/pagos.
  - Archivos:
    - [ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/credits/components/ClientCredits.jsx) [MODIFY]
    - [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-311: Saneamiento Documental de Contradicciones (NotebookLM Alignment) (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se resuelven las discrepancias de Cloud Functions en registro_decisiones_estrategicas.md y estandar_arquitectonico_ecosistema.md, y se alinea la regla de LocalStorage en changelog_general.md.
  - Archivos:
    - [registro_decisiones_estrategicas.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/registro_decisiones_estrategicas.md) [MODIFY]
    - [estandar_arquitectonico_ecosistema.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md) [MODIFY]
    - [changelog_general.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/01_Control_Versiones/changelog_general.md) [MODIFY]

* **[x] ~~Tarea CORE-310: IndexaciÃ³n de Mapa de AplicaciÃ³n y Plan de ReducciÃ³n de Verbosidad (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se inyecta el Header YAML en mapa_aplicacion.md para optimizar la indexaciÃ³n fÃ­sica y se planifica la modularizaciÃ³n futura de manual_y_auditoria_completa_prototipe_2026.md.
  - Archivos:
    - [mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-309: Protocolo de Rollback para IA e IndexaciÃ³n SemÃ¡ntica (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se diseÃ±a el protocolo_rollback_autonomo_ia.md como manual de rescate cognitivo y se inyecta el Header YAML de indexaciÃ³n rÃ¡pida en mapa_documentacion_ia.md para optimizar tokens.
  - Archivos:
    - [protocolo_rollback_autonomo_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/protocolo_rollback_autonomo_ia.md) [NEW]
    - [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-308: PotenciaciÃ³n del Diagrama de Flujo de Arquitectura y Mermaid (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se actualiza y expande diagrama_flujo_ecosistema.md inyectando 4 diagramas Mermaid interactivos para documentar los nuevos flujos de inyecciÃ³n, telemetrÃ­a dual-channel, preventa y resiliencia git.
  - Archivos:
    - [diagrama_flujo_ecosistema.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/diagrama_flujo_ecosistema.md) [MODIFY]

* **[x] ~~Tarea CORE-307: UnificaciÃ³n LÃ©xica y EstandarizaciÃ³n de Glosario en Manuales (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se realiza la bÃºsqueda y reemplazo masivo del glosario obsoleto por terminologÃ­a unificada en los manuales de desarrollo y archivos de reglas (AGENTS.md, diccionario_tecnico, manual_contribucion, diagrama_flujo, manual_y_auditoria).
  - Archivos:
    - [AGENTS.md](file:///d:/PROTOTIPE/.agents/AGENTS.md) [MODIFY]
    - [manual_contribucion_desarrollador_monorepo.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/manual_contribucion_desarrollador_monorepo.md) [MODIFY]
    - [diagrama_flujo_ecosistema.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/diagrama_flujo_ecosistema.md) [MODIFY]
    - [diccionario_tecnico_completo.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/diccionario_tecnico_completo.md) [MODIFY]
    - [manual_y_auditoria_completa_prototipe_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/manual_y_auditoria_completa_prototipe_2026.md) [MODIFY]

* **[x] ~~Tarea CORE-306: SincronizaciÃ³n Desatendida de Recursos Firebase en el CLI (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se estabilizaron y securizaron las llamadas a firebase deploy en generator.js y server.js del CLI inyectando la bandera --token a partir de variables de entorno del sistema.
  - Archivos: [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-305: IntegraciÃ³n de ConfiguraciÃ³n de Pasarela en Ajustes de Desarrollador (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se agregaron los switches de activaciÃ³n de la pasarela online y selectores de procesador (Bold/Wompi/MP) en el formulario de configuraciÃ³n de mÃ³dulos de la pestaÃ±a Developer de ajustes del administrador.
  - Archivos: [Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]

* **[x] ~~Tarea CORE-304: ImplementaciÃ³n de MÃ³dulo B2C de CrÃ©ditos, Abonos Online y Extractos PDF (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se completÃ³ el Portal de CrÃ©ditos del Cliente Final (B2C) en ClientCredits.jsx en App Ventas, integrando abonos online simulados por Bold/PSE y descargas de extractos de cuenta en PDF.
  - Archivos: [Plantillas Core/App Ventas/src/pages/client/ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY]

* **[x] ~~Tarea CORE-303: IntegraciÃ³n ElÃ¡stica de Pasarelas de Pago Online en CatÃ¡logo Base (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se integrÃ³ el soporte de pagos en lÃ­nea en el catÃ¡logo base de App Ventas con constantes de pago online y simulador interactivo de pasarela Bold/PSE para cobros en lÃ­nea.
  - Archivos: [Plantillas Core/App Ventas/src/constants/index.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/constants/index.js) [MODIFY], [Plantillas Core/App Ventas/src/components/client/checkout/CheckoutModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]

* **[x] ~~Tarea CORE-302: Consistencia Documental â€” DeclaraciÃ³n del PatrÃ³n de Core Ãšnico Flexible (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se actualizÃ³ `ESTADO_REAL_PROTOTIPE_2.md` para justificar el Core Ãšnico Flexible y descartar la brecha de carpetas de plantillas vacÃ­as ausentes para restaurante, taller y servicios.
  - Archivos: [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/ESTADO_REAL_PROTOTIPE_2.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/ESTADO_REAL_PROTOTIPE_2.md) [MODIFY]

* **[x] ~~Tarea CORE-301: HabilitaciÃ³n Interactiva de Sandbox de Programador de Rutas (Delivery) (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se actualizÃ³ `ProgramadorRutasDomicilioSandbox.jsx` moviendo los controles interactivos al panel lateral y renderizando a la derecha un stepper de progreso lineal y radar en trÃ¡nsito para deliveryService.
  - Archivos: [Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ProgramadorRutasDomicilioSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ProgramadorRutasDomicilioSandbox.jsx) [MODIFY]

* **[x] ~~Tarea CORE-300: HabilitaciÃ³n Interactiva de Sandbox de Selector de Mapa (Leaflet) (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se transformÃ³ el sandbox estÃ¡tico `LeafletMapPickerSandbox.jsx` en una simulaciÃ³n cartogrÃ¡fica interactiva con geocodificaciÃ³n y marcadores dinÃ¡micos.
  - Archivos: [Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/LeafletMapPickerSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/LeafletMapPickerSandbox.jsx) [MODIFY]

* **[x] ~~Tarea CORE-299: HabilitaciÃ³n Interactiva de Sandbox de GeneraciÃ³n PDF (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se transformÃ³ el sandbox estÃ¡tico `generacion_pdfSandbox.jsx` en un playground funcional e interactivo con controles de configuraciÃ³n conectados al servicio real de exportaciÃ³n pdfService.js.
  - Archivos: [Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/generacion_pdfSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/generacion_pdfSandbox.jsx) [MODIFY]

* **[x] ~~Tarea CORE-298: Endurecimiento de Reglas de Seguridad en Caliente para Nichos Transaccionales (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se implementÃ³ la inyecciÃ³n dinÃ¡mica de reglas de seguridad estrictas en `firestore.rules` al aprovisionar nuevos proyectos con nichos transaccionales, restringiendo el acceso de escritura de `/products/`, `/cajas/` y `/config/settings` a administradores.
  - Archivos: [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CORE-297: InyecciÃ³n de Componentes AtÃ³micos UI en Semilla Base (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se crearon y agregaron los componentes atÃ³micos comunes `Button.jsx` y `Modal.jsx` dentro del directorio `src/components/ui/` de `template-core-seed`, resolviendo la brecha de controles bÃ¡sicos parametrizados adaptados al sistema de diseÃ±o HSL.
  - Archivos: [Prototipe-CLI/templates/template-core-seed/src/components/ui/Button.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/ui/Button.jsx) [NEW], [Prototipe-CLI/templates/template-core-seed/src/components/ui/Modal.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/ui/Modal.jsx) [NEW]

* **[x] ~~Tarea CORE-296: ResoluciÃ³n de Brecha de AutonomÃ­a - UI Shell Base en Semilla Base (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se actualizÃ³ `MainLayout.jsx` en la plantilla de creaciÃ³n de proyectos (`template-core-seed`) agregando LayoutDashboard, un enrutador estructurado por defecto con Dashboard y Ajustes, e instrucciones comentadas en el cÃ³digo.
  - Archivos: [Prototipe-CLI/templates/template-core-seed/src/layouts/MainLayout.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/layouts/MainLayout.jsx) [MODIFY]

* **[x] ~~Tarea CORE-295: Saneamiento de Placeholders - GuÃ­a de Estilos de UI Reales de App Ventas (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se reemplazÃ³ la plantilla vacÃ­a autogenerada de `guia_estilos_ui.md` en el Core de App Ventas por las directivas de diseÃ±o fÃ­sico reales (paleta HSL, componentes atÃ³micos y convenciones estÃ©ticas).
  - Archivos: [Plantillas Core/App Ventas/Documentacion App Ventas/guia_estilos_ui.md](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/guia_estilos_ui.md) [MODIFY]

* **[x] ~~Tarea CORE-294: Saneamiento de Placeholders - Restricciones TÃ©cnicas Reales de App Ventas (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se reemplazÃ³ la plantilla vacÃ­a autogenerada de `restricciones_tecnicas.md` en el Core de App Ventas por las limitaciones reales de Firestore y directivas de diseÃ±o fÃ­sico.
  - Archivos: [Plantillas Core/App Ventas/Documentacion App Ventas/restricciones_tecnicas.md](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/restricciones_tecnicas.md) [MODIFY]

* **[x] ~~Tarea CORE-293: Saneamiento de Placeholders - Contexto de Negocio Real de App Ventas (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se reemplazÃ³ la plantilla vacÃ­a autogenerada de `contexto_negocio.md` en el directorio de documentaciÃ³n del Core de App Ventas por las directivas de negocio reales (crÃ©dito, caja, stock y KPIs).
  - Archivos: [Plantillas Core/App Ventas/Documentacion App Ventas/contexto_negocio.md](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/contexto_negocio.md) [MODIFY]

* **[x] ~~Tarea CORE-292: SincronizaciÃ³n del Mapa SemÃ¡ntico de DocumentaciÃ³n de la IA (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se actualizÃ³ `mapa_documentacion_ia.md` (SecciÃ³n 5) para reflejar la unificaciÃ³n del sistema de precios con los campos de base de datos de Firestore (`billingMode`), garantizando la alineaciÃ³n semÃ¡ntica en el mapa de documentaciÃ³n.
  - Archivos: [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-291: UnificaciÃ³n de TerminologÃ­a de Cobros con ParÃ¡metros de Base de Datos (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se integraron las equivalencias tÃ©cnicas exactas de Firestore (`billingMode: percentage`, `fixed_per_service` y `flat_monthly`) al lado de cada modalidad comercial de la Fase 2 en la matriz oficial de precios, alineando la terminologÃ­a del ecosistema.
  - Archivos: [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/sistema_precios_licenciamiento.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/sistema_precios_licenciamiento.md) [MODIFY]

* **[x] ~~Tarea CORE-290: DocumentaciÃ³n del Soporte de Entorno Dual en TelemetrÃ­a del Core (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se actualizÃ³ la SecciÃ³n 7.2 del manual completo para documentar el rol de la variable `VITE_DEVELOPER_CENTRAL_API_KEY` y las credenciales centrales, aclarando el comportamiento del entorno dual de telemetrÃ­a (soporte local standalone con fallback automÃ¡tico de Firebase SDK) para resolver la discrepancia de inyecciÃ³n del generador.
  - Archivos: [Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_y_auditoria_completa_prototipe_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/manual_y_auditoria_completa_prototipe_2026.md) [MODIFY]

* **[x] ~~Tarea CORE-289: RemociÃ³n de Cloud Function Legacy de TelemetrÃ­a (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se desviÃ³ la variable `VITE_DEVELOPER_TELEMETRY_ENDPOINT` que apuntaba a una Cloud Function externa en producciÃ³n (`reporttelemetry`) para redirigirla hacia el Bridge local (`http://localhost:3001`), cumpliendo con la prohibiciÃ³n de Cloud Functions en producciÃ³n (`DEC-006`) sin romper el validador del modal de diagnÃ³stico de los clientes.
  - Archivos: [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-288: UnificaciÃ³n de AutenticaciÃ³n de Administradores en AuditorÃ­a CrÃ­tica (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se corrigiÃ³ la discrepancia de autenticaciÃ³n de roles de administrador en la auditorÃ­a crÃ­tica, reemplazando la referencia a la colecciÃ³n obsoleta `/admins/` por la validaciÃ³n real en la colecciÃ³n `/users/{uid}` con `role == 'admin'` tal y como establecen las reglas del Core.
  - Archivos: [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_critica_ecosistema_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_critica_ecosistema_2026.md) [MODIFY]

* **[x] ~~Tarea CORE-287: UnificaciÃ³n de Tasas Comisionales en Informe de InvestigaciÃ³n (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se unificÃ³ el rango de comisiones de venta de PROTOTIPE en la tabla comparativa de competidores del informe de investigaciÃ³n, sustituyendo la tasa desactualizada de 0.5% - 2% por el rango oficial del 1% al 5% para alinear la estrategia de precios en todos los manuales comerciales.
  - Archivos: [Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/informe_investigacion_ecosistema_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/informe_investigacion_ecosistema_2026.md) [MODIFY]

* **[x] ~~Tarea CORE-286: CorrecciÃ³n de Vulnerabilidad CORS en Bridge CLI (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se corrigiÃ³ la vulnerabilidad de acceso cruzado inseguro (CORS) en el Bridge CLI reemplazando `app.use(cors())` sin restricciones por una whitelist selectiva de orÃ­genes (`CORS_ALLOWED_ORIGINS`). Ahora el servidor solo acepta peticiones browser de `localhost:5174` y `localhost:5173` (dev-dashboard), manteniendo el acceso libre de cabecera Origin para scripts locales, PowerShell y automatizaciones del linter.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-285: Saneamiento y Auto-archivado de BitÃ¡coras con CompactaciÃ³n de Inventario (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se implementÃ³ la optimizaciÃ³n de los consolidados documentales y de bitÃ¡coras del monorepo: (1) **Soporte MultibitÃ¡cora**: Modificado el endpoint de consistencia `/api/integrity/status` en `server.js` para leer de forma agregada todos los archivos `bitacora_cambios*.md` de la carpeta de auditorÃ­as, resolviendo alertas de consistencia. (2) **Auto-archivado automÃ¡tico**: Implementada la comprobaciÃ³n de tamaÃ±o (>150 KB) en las escrituras del backend CLI en `server.js` para mover automÃ¡ticamente la bitÃ¡cora activa a un histÃ³rico y crear una nueva limpia, auto-sincronizando la entrada en `mapa_documentacion_ia.md`. (3) **Consolidador de Inventario**: Modificado `consolidar_para_notebook.py` para ignorar los histÃ³ricos de bitÃ¡coras en el consolidado general, y para listar Ãºnicamente el Nombre, UbicaciÃ³n fÃ­sica y Estado en la Biblioteca de Componentes y MÃ³dulos Completos, reduciendo el peso consolidado en un 91% (de 2.37 MB a 214 KB). (4) **Fix de Metadatos Calientes**: Modificado `verify_library_integrity.cjs` para evitar la escritura redundante en caliente de `sync_manifest.json` si no hay cambios reales en las skills, congelando el archivo en Git. (5) **Saneamiento de AuditorÃ­a**: DepuraciÃ³n de 8 inconsistencias reales de la documentaciÃ³n: WhatsApp Outbox en `changelog_general.md`, eliminaciÃ³n de duplicados de telemetrÃ­a y seguimiento en `09_Modulos_Completos` y `Formularios_y_UI`, renombrado de `manual_creacion_desde_cero.md` y desindexaciÃ³n de enlaces rotos en `README.md` de la biblioteca y `mapa_documentacion_ia.md`. Adicionalmente, tras la auditorÃ­a selectiva de NotebookLM, se depuraron archivos redundantes u obsoletos eliminando `auditoria_tecnica_completa_maestra_2026.md` y `briefing_cliente.md` por duplicaciÃ³n comercial, y se fusionÃ³ `matriz_precios_oficial.md` en el documento maestro unificado `sistema_precios_licenciamiento.md`.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/Scripts_Auxiliares/consolidar_para_notebook.py](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/Scripts_Auxiliares/consolidar_para_notebook.py) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY], [Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY], [Documentacion PROTOTIPE/01_Control_Versiones/changelog_general.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/01_Control_Versiones/changelog_general.md) [MODIFY], [Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY], [Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_creacion_desde_cero.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_creacion_desde_cero.md) [NEW], [Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/propuesta_creacion_desde_cero.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/propuesta_creacion_desde_cero.md) [DELETE], [Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Seguimiento_Pedido/seguimiento_pedido.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Seguimiento_Pedido/seguimiento_pedido.md) [DELETE], [Documentacion PROTOTIPE/09_Modulos_Completos/Telemetria_Centralizada/telemetria_centralizada.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/Telemetria_Centralizada/telemetria_centralizada.md) [DELETE], [Documentacion PROTOTIPE/09_Modulos_Completos/Modulo_Commits_Despliegues/propuesta_commits_despliegues.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/Modulo_Commits_Despliegues/propuesta_commits_despliegues.md) [DELETE], [Documentacion PROTOTIPE/09_Modulos_Completos/propuesta_dashboard_interactivo.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/propuesta_dashboard_interactivo.md) [DELETE], [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/Plantillas_de_Levantamiento/briefing_cliente.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/Plantillas_de_Levantamiento/briefing_cliente.md) [DELETE], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_tecnica_completa_maestra_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_tecnica_completa_maestra_2026.md) [DELETE], [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/matriz_precios_oficial.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/matriz_precios_oficial.md) [DELETE], [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/sistema_precios_licenciamiento.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/sistema_precios_licenciamiento.md) [MODIFY]


* **[x] ~~Tarea CORE-284: AutodetecciÃ³n Inteligente de Tareas en el BotÃ³n Auto de Commits (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se hizo asÃ­ncrona la funciÃ³n handleAutoMessage en el dev-dashboard. Si no hay drifts de Git, se realiza una consulta rÃ¡pida a /api/roadmap para extraer el ID de la tarea activa o en progreso, y en su defecto la primera tarea del Roadmap (la mÃ¡s nueva de la sesiÃ³n), asegurando que el commit siempre tenga prefijo de tarea.
  - Archivos: [Central PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-283: Saneamiento Documental, SincronizaciÃ³n y ValidaciÃ³n de Integridad (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Ronda final de sincronizaciÃ³n e integridad cruzada del ecosistema. Se verificÃ³ la coherencia entre `tareas_pendientes.md`, `mapa_aplicacion.md` y `mapa_documentacion_ia.md`. Se validaron los archivos fÃ­sicos de bitÃ¡cora y se confirmÃ³ la existencia de `prueba-integridad.txt` como punto de control de la sesiÃ³n. Se reconstruyeron los bloques de detalle de las tareas CORE-275 a CORE-283 que quedaron sin descripciÃ³n tras el incidente de pÃ©rdida de `.env.local`.
  - Archivos: [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-282: Saneamiento y Hardening de DocumentaciÃ³n Basada en DiagnÃ³sticos (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se ejecutÃ³ una auditorÃ­a de hardening documental cruzando los diagnÃ³sticos del Drift Analyzer (CORE-267) contra los archivos fÃ­sicos del directorio `Documentacion PROTOTIPE/`. Se sanaron entradas huÃ©rfanas en el `mapa_documentacion_ia.md`, se actualizÃ³ la `bitacora_cambios.md` (14.385 lÃ­neas registradas) y se eliminaron referencias a archivos inexistentes en el mapa semÃ¡ntico. Se garantizÃ³ que todos los criterios de decisiÃ³n de documentos crÃ­ticos estuviesen correctamente descritos para su localizaciÃ³n por la IA.
  - Archivos: [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-281: ImplementaciÃ³n del Consolidador Documental de un Clic para NotebookLM (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se implementÃ³ el sistema de consolidaciÃ³n documental en dos capas: (1) el script Python `consolidar_para_notebook.py` que recorre el directorio `Documentacion PROTOTIPE/` de forma recursiva, concatena todos los archivos `.md` con separadores de secciÃ³n y genera un Ãºnico archivo de texto optimizado para ingestiÃ³n en NotebookLM; (2) el archivo `consolidar_notebook.bat` en la raÃ­z del monorepo como disparador de un clic sin abrir terminal. Permite a la IA o al desarrollador generar en segundos un snapshot documental completo del ecosistema.
  - Archivos: [consolidar_notebook.bat](file:///d:/PROTOTIPE/consolidar_notebook.bat) [NEW], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/Scripts_Auxiliares/consolidar_para_notebook.py](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/Scripts_Auxiliares/consolidar_para_notebook.py) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-280: Cierre y SincronizaciÃ³n del Checklist de Componentes (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se cerrÃ³ el ciclo de sincronizaciÃ³n entre el `README.md` de la Biblioteca de Componentes (291 entradas / 103k bytes) y la vista `ComponentLibraryView.jsx` del dashboard. Se verificÃ³ que los 276 sandboxes registrados en el directorio `sandboxes/` del dev-dashboard tuviesen correspondencia con los componentes del catÃ¡logo. Se actualizÃ³ el checklist de auditorÃ­a de cores `checklist_auditoria_core.md` con el estado real de implementaciÃ³n y se sincronizÃ³ el mapa documental.
  - Archivos: [Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/checklist_auditoria_core.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/checklist_auditoria_core.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-279: AuditorÃ­a TÃ©cnica Documental Completa del Ecosistema (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se realizÃ³ una auditorÃ­a tÃ©cnica documental exhaustiva del ecosistema PROTOTIPE. Se generaron y/o actualizaron tres documentos maestros de diagnÃ³stico: `auditoria_tecnica_completa_maestra_2026.md` (anÃ¡lisis integral de arquitectura, deuda tÃ©cnica y estado de mÃ³dulos), `estado_actual_ecosistema.md` (snapshot del estado operativo actual de todos los sub-proyectos) y `checklist_auditoria_core.md` (lista verificable de componentes, endpoints y configuraciones crÃ­ticas). Se verificÃ³ coherencia entre la documentaciÃ³n y el cÃ³digo fuente real.
  - Archivos: [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/estado_actual_ecosistema.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/estado_actual_ecosistema.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/checklist_auditoria_core.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/checklist_auditoria_core.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-278: ImplementaciÃ³n de DeshidrataciÃ³n de Plantillas y Logo Upload de Marca (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se implementaron dos funcionalidades de aprovisionamiento en el backend CLI: (1) **Motor de DeshidrataciÃ³n**: endpoint que genera una versiÃ³n "limpia" de la plantilla core eliminando datos de marca especÃ­ficos (colores HSL, logo, nombre de cliente, tokens de Firebase) para producir un artefacto base reutilizable para nuevos clientes; (2) **Logo Upload de Marca**: endpoint `POST /api/upload-logo` (lÃ­neas 509â€“551 de `server.js`) que recibe un archivo de imagen, lo procesa con `jimp` para optimizar dimensiones y formato, y lo deposita en el directorio `public/` de la instancia cliente correspondiente. Ambos flujos integrados en el panel de aprovisionamiento del dashboard.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-277: ImplementaciÃ³n y Completado de la Plantilla Core Seed (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se completÃ³ la plantilla base `template-core-seed` del generador CLI con todos los activos necesarios para el aprovisionamiento de nuevos proyectos: (1) `BackgroundCanvas.jsx` con motor de partÃ­culas premium con wrapping perimetral en 4 direcciones y soporte de opacidad/glow; (2) `particlesIcons.js` con biblioteca de 110+ iconos vectoriales Lucide organizados en 11 categorÃ­as temÃ¡ticas para las 23 verticales de negocio; (3) `seed.json` con la estructura inicial de colecciones Firestore, configuraciÃ³n HSL base y datos de catÃ¡logo de ejemplo para el sembrado automÃ¡tico en la creaciÃ³n de instancias.
  - Archivos: [Prototipe-CLI/templates/template-core-seed/src/components/ui/BackgroundCanvas.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/ui/BackgroundCanvas.jsx) [MODIFY], [Prototipe-CLI/templates/template-core-seed/src/components/ui/particlesIcons.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/ui/particlesIcons.js) [NEW], [Prototipe-CLI/templates/template-core-seed/seed.json](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/seed.json) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-276: DocumentaciÃ³n TÃ©cnica de la Zona de Desarrollador, DiagnÃ³sticos y Welcome Page (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se documentaron tÃ©cnicamente tres mÃ³dulos crÃ­ticos del dashboard central: (1) **Zona de Desarrollador**: manual de los 94 endpoints del bridge CLI con descripciÃ³n, mÃ©todo HTTP, parÃ¡metros y respuestas esperadas, documentado en `manual_y_auditoria_completa_prototipe_2026.md` (418k bytes); (2) **GuÃ­a de Flujo Cliente-Entrega**: documento `guia_flujo_completo_cliente_entrega.md` detallando el ciclo completo de preventa â†’ briefing â†’ aprovisionamiento â†’ QA â†’ deploy de un cliente en el ecosistema; (3) **Manual de ContribuciÃ³n al Monorepo**: `manual_contribucion_desarrollador_monorepo.md` con instrucciones para levantar entorno local, convenciones de commits y protocolo de validaciÃ³n.
  - Archivos: [Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_y_auditoria_completa_prototipe_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/manual_y_auditoria_completa_prototipe_2026.md) [MODIFY], [Documentacion PROTOTIPE/07_Manuales_Desarrollo/guia_flujo_completo_cliente_entrega.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/guia_flujo_completo_cliente_entrega.md) [NEW], [Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_contribucion_desarrollador_monorepo.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/manual_contribucion_desarrollador_monorepo.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-275: AuditorÃ­a TÃ©cnica Exhaustiva de Plantillas Core (2026-07-07)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: Se realizÃ³ una auditorÃ­a tÃ©cnica completa de las dos plantillas core del generador CLI. Se inspeccionÃ³ la paridad entre `Plantillas Core/App Ventas/` (plantilla de producciÃ³n activa) y `Prototipe-CLI/templates/template-ventas/` (plantilla de generaciÃ³n). Se verificÃ³ consistencia en: `vite.config.js` (code splitting de Firebase en chunks independientes), `firestore.rules` (sin bypass `|| true`, restricciones de lectura por rol), `package.json` (alineaciÃ³n de versiones de dependencias), `src/index.css` (variables HSL y efectos de branding), y presencia de scripts de validaciÃ³n de integridad. Se documentaron las desviaciones encontradas y su correcciÃ³n en `auditoria_sincronizacion_plantillas_2026.md`.
  - Archivos: [Plantillas Core/App Ventas/vite.config.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/vite.config.js) [VERIFY], [Plantillas Core/App Ventas/firestore.rules](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [VERIFY], [Prototipe-CLI/templates/template-ventas/vite.config.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js) [VERIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_sincronizacion_plantillas_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_sincronizacion_plantillas_2026.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-274: CreaciÃ³n de GuÃ­a de Flujo Completo: De Preventa a Entrega~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: CreaciÃ³n de la guÃ­a guia_flujo_completo_cliente_entrega.md que detalla todos los pasos de interacciÃ³n comercial, preventa, aprovisionamiento local/nube, inyecciÃ³n, QA y deploy de un cliente, copiÃ¡ndolo al Escritorio del usuario.
  - Archivos: [Documentacion PROTOTIPE/07_Manuales_Desarrollo/guia_flujo_completo_cliente_entrega.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/guia_flujo_completo_cliente_entrega.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]


* **[x] ~~Tarea CORE-273: CreaciÃ³n de GuÃ­a de ContribuciÃ³n al Monorepo y Entorno Local~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: CreaciÃ³n del manual manual_contribucion_desarrollador_monorepo.md que detalla los pasos para levantar el backend bridge CLI (puerto 3001), el central dev-dashboard (puerto 5173), ciclo de validaciÃ³n de compilaciÃ³n, convenciones de Conventional Commits y acoplamiento con tareas fÃ­sicas, copiÃ¡ndolo al Escritorio del usuario.
  - Archivos: [Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_contribucion_desarrollador_monorepo.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/manual_contribucion_desarrollador_monorepo.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-272: CreaciÃ³n de GuÃ­a RÃ¡pida de EstÃ¡ndares e Interfaz (Cheat Sheet)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: CreaciÃ³n del manual resumen_reglas_y_estandares_desarrollo.md que extrae y consolida en espaÃ±ol las reglas de contraste, diseÃ±o responsivo y UX de AGENTS.md, copiÃ¡ndolo al Escritorio del usuario junto con la guia_maestra_desarrollo.md.
  - Archivos: [Documentacion PROTOTIPE/04_Estandares_y_Skills/resumen_reglas_y_estandares_desarrollo.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/resumen_reglas_y_estandares_desarrollo.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-271: CreaciÃ³n de Manuales y EstÃ¡ndares de Arquitectura Multi-Core General~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: DiseÃ±o y creaciÃ³n de 5 manuales y estÃ¡ndares de arquitectura multi-core para regular la paridad de dependencias NPM, conectores de bases de datos agnÃ³sticas, playgrounds en Storybook, marca blanca y scaffolding del CLI.
  - Archivos: [Documentacion PROTOTIPE/04_Estandares_y_Skills/especificacion_nuevos_cores_oro.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/especificacion_nuevos_cores_oro.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_repositorios_infraestructura_agnostica.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/estandar_repositorios_infraestructura_agnostica.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_playgrounds_storybook_multicore.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/estandar_playgrounds_storybook_multicore.md) [NEW], [Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/gobernanza_dependencias_npm_multicore.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/gobernanza_dependencias_npm_multicore.md) [NEW], [Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/contrato_aprovisionamiento_dinamico_assets.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/contrato_aprovisionamiento_dinamico_assets.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-270: Reporte de Comparativa y AlineaciÃ³n de DocumentaciÃ³n Heredada~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: LocalizaciÃ³n y auditorÃ­a comparativa de los 29 archivos de documentaciÃ³n heredada frente a la realidad activa de React 19, base de datos local Dexie y la desactivaciÃ³n absoluta de Cloud Functions. PublicaciÃ³n del reporte de paridad.
  - Archivos: [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/comparativa_y_alineacion_documental_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/comparativa_y_alineacion_documental_2026.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-269: Manual de OperaciÃ³n y AuditorÃ­a TÃ©cnica Absoluta del Ecosistema~~**
  - Estatus: Completado.
  - Fecha: 2026-07-07
  - DescripciÃ³n: GeneraciÃ³n del documento maestro consolidado con el 100% de la arquitectura, endpoints, manuales de herramientas y control de deuda tÃ©cnica del monorepo PROTOTIPE, listando y analizando 1,648 archivos fÃ­sicos y 94 endpoints backend.
  - Archivos: [Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_y_auditoria_completa_prototipe_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/manual_y_auditoria_completa_prototipe_2026.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-268: Herramientas Avanzadas de Control de Versiones (Drift Map, Auditor Commits, Enmendador)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-06
  - DescripciÃ³n: ImplementaciÃ³n de 3 herramientas avanzadas para el panel Control de Versiones del dev-dashboard.
    1. **Drift Map Core-Cliente** (GET /api/git/compare-drift): Compara la rama base del Core con una rama de cliente, calculando commits de desfase (aheadCount/behindCount), detectando archivos con cambios en ambas ramas (colisiones) y asignando nivel de riesgo (none/low/medium/critical).
    2. **Auditor de Commits No Pusheados** (GET /api/git/unpushed-commits): Lista commits locales pendientes de push con anÃ¡lisis de formato Conventional Commits y presencia de ID de tarea. Detecta rama upstream automÃ¡ticamente.
    3. **Enmendador Seguro** (POST /api/git/amend-commit): Enmenda el mensaje de cualquier commit seleccionado en la lista de no pusheados. Si es el HEAD ejecuta amend nativo, y si es un commit anterior ejecuta un commit-tree y rebase --onto para reescribir el historial local de forma 100% libre de conflictos.
    4. **GitBackupPanel.jsx**: Panel Auditor de Commits con editor inline, badge de alerta animado y lÃ³gica de estado compartida. Panel Drift Map con selector de ramas cliente dinÃ¡mico (cargado desde /api/git/cores-and-clients), semÃ¡foro visual de riesgo y lista de archivos en colisiÃ³n.
    5. Whitelist de subcomandos de execGitCommand expandida con 'commit' para habilitar el amend.
    6. Build validado exitosamente: vite 1.48s sin errores de compilaciÃ³n ni de importaciones React.
    7. **EstabilizaciÃ³n de Flujos, Blindaje de Upstream y AlineaciÃ³n de Roadmap:** AlineaciÃ³n de historiales de producciÃ³n (`master`/`main`) con desarrollo (`develop`) en los 4 repositorios del ecosistema para resolver los rechazos `non-fast-forward` en backups. ModificaciÃ³n de los scripts `subproject_backup.ps1` y `git_backup.ps1` para usar `git push -u origin` de forma obligatoria, asegurando la restauraciÃ³n automÃ¡tica del tracking upstream y eliminando el estado "Sin upstream". AlineaciÃ³n de fechas de 20 tareas histÃ³ricas en `tareas_pendientes.md` para limpiar los drifts de commits de la sesiÃ³n activa de 24h.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY], [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-267: Sistema de ValidaciÃ³n Tridimensional de Desviaciones en Caliente (Drift Analyzer)~~**
  - Estatus: Completado.
  - Fecha: 2026-07-06
  - DescripciÃ³n: DiseÃ±o e implementaciÃ³n del motor de validaciÃ³n tridimensional en caliente para consistencia documental y fÃ­sica del ecosistema.
    1. Backend (server.js): Expandido el endpoint /api/integrity/status para auditar desviaciones fÃ­sicas de archivos (Capa 1), playgrounds/sandboxes faltantes (Capa 2), e historial de Git con enlace de tareas (Capa 3).
    2. Frontend (SkillsRoadmapPanel.jsx): DiseÃ±ada una interfaz interactiva de reporte de desviaciones en la pestaÃ±a Roadmap, estructurada con sub-pestaÃ±as con badges para BitÃ¡cora, Archivos/Mapa, Sandboxes y Git.
    3. Posicionamiento CSS: AÃ±adida la propiedad relative z-30 al creador de tareas para evitar recortes del selector de dominio.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-266: SincronizaciÃ³n FÃ­sica de Estatus, Fix de PÃ©rdida de Detalle en Toggle/Add e InyecciÃ³n de Editor de Tareas Interactivo~~**
  - Estatus: Completado.
  - Fecha: 2026-07-06
  - DescripciÃ³n: SoluciÃ³n al bug de consistencia de estatus, fix a la desapariciÃ³n de detalles en listados y desarrollo del Editor de Tareas en caliente.
    1. Fix en server.js (/api/roadmap/toggle y /api/roadmap/add): Se reemplazÃ³ el parser secundario simplificado por la funciÃ³n helper comÃºn parseRoadmapContent(content), resolviendo la pÃ©rdida de detalles y descripciones en el cliente al alternar estados.
    2. Endpoint POST /api/roadmap/update (server.js): Permite reescribir de forma atÃ³mica y en caliente la descripciÃ³n y lista de archivos modificados de una tarea seleccionada en el archivo fÃ­sico Markdown.
    3. Editor de Detalles Interactivo (SkillsRoadmapPanel.jsx): Se inyectÃ³ un formulario editable con Ã¡rea de texto y gestor dinÃ¡mico de archivos que permite actualizar los detalles del Roadmap directamente desde el dashboard.
    4. Limpieza de tareas duplicadas CORE-266, CORE-267, CORE-268, CORE-269, CORE-270 con tÃ­tulo "073" creadas accidentalmente en el input incorrecto.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-265: Sistema de Rastreo de Tareas Inteligente â€” IDs por Dominio, Parser Tolerante y Protocolo Obligatorio~~**
  - Estatus: Completado.
  - Fecha: 2026-07-06
  - DescripciÃ³n: AuditorÃ­a y correcciÃ³n completa del sistema de rastreo de tareas del ecosistema.
    1. Hotfix: CORE-264 insertado retroactivamente en tareas_pendientes.md.
    2. Fix 3 bugs del parser GET /api/roadmap: acento en DescripciÃ³n, formatos de fecha antiguos, archivos inline sin backticks.
    3. Sistema de IDs por dominio en POST /api/roadmap/add: CORE/CLI/DASH/TPL/PLT/INST/DOC con contadores independientes.
    4. Campo domain expuesto en cada tarea del parser GET /api/roadmap.
    5. UI con selector de dominio y badges de color por prefijo en SkillsRoadmapPanel.jsx.
    6. Protocolo obligatorio de pre-creaciÃ³n de tareas escrito en AGENTS.md con tabla de dominios, pasos obligatorios y penalizaciÃ³n por omisiÃ³n.
  - Archivos:
    - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [MODIFY]
    - [`.agents/AGENTS.md`](file:///d:/PROTOTIPE/.agents/AGENTS.md) [MODIFY]

* **[x] ~~Tarea CORE-264: Roadmap FÃ­sico â€” Panel de Detalles, Buscador, Creador de Tareas y MÃ©tricas de Sprint~~**
  - Estatus: Completado.
  - Fecha: 2026-07-06
  - DescripciÃ³n: Se implementaron 4 funcionalidades en la pestaÃ±a Roadmap del dashboard central.
    1. Parser `/api/roadmap` extendido para extraer bloque `detail` completo por tarea (estatus, fecha, descripciÃ³n, archivos con acciÃ³n).
    2. Nuevo endpoint `POST /api/roadmap/add` con auto-ID CORE autoincrementado, backup rotativo x5 y serializaciÃ³n segura via WriteQueue.
    3. Panel de detalles interactivo 2 columnas: descripciÃ³n expandida, archivos con badges de acciÃ³n codificados por color (MODIFY/NEW/DELETE/DEPLOY).
    4. Buscador en tiempo real (atajo `/`), 3 filtros pill excluyentes, formulario de creaciÃ³n inline y barra de mÃ©tricas de sprint con progreso animado.
  - Archivos:
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-263: AutomatizaciÃ³n de Sembrado en CreaciÃ³n de Clientes y Limpiador con Escaneo Pre-Purgado~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se integrÃ³ el sembrado de base de datos de forma automÃ¡tica en la creaciÃ³n de instancias locales (`executeCreationTaskInBackground`) y la purga de temporales como paso previo en la compilaciÃ³n de hosting (`/api/project/deploy`). AdemÃ¡s, se inyectÃ³ el botÃ³n de "Escanear Directorios" y visualizador pre-purgado en el panel de limpieza.
  - Archivos:
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-262: CorrecciÃ³n de Listado de Instancias e IntegraciÃ³n de Smart Seeding en el Dashboard~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se corrigiÃ³ la lectura y parseo de la lista de instancias locales para el Limpiador CachÃ©, integrando un panel de "Smart Seeding" que lee y procesa de forma dinÃ¡mica el archivo `seed.json` de la plantilla de origen, inyectando colores HSL e inicializando las colecciones requeridas sin lÃ³gica rÃ­gida.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [MODIFY]
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/seed.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/seed.json) [NEW]
    - [`Prototipe-CLI/templates/template-ventas/seed.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/seed.json) [NEW]

* **[x] ~~Tarea CORE-261: AuditorÃ­a Exhaustiva de Efectos de Fondo y EstabilizaciÃ³n de Desplegables~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se realizÃ³ una revisiÃ³n exhaustiva para garantizar estabilidad absoluta y cero regresiones en la personalizaciÃ³n de fondos y desplegables. Se blindÃ³ el componente CustomSelect contra valores indefinidos y se sincronizÃ³ el prop de direcciÃ³n con la plantilla core, validando todo con builds exitosos.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/components/ui/CustomSelect.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/ui/CustomSelect.jsx) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/src/components/ui/CustomSelect.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/ui/CustomSelect.jsx) [MODIFY]

* **[x] ~~Tarea CORE-260: PersonalizaciÃ³n Global de Fondos y ParÃ¡metros Escalados del Mesh~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se integrÃ³ el soporte para controlar y escalar dinÃ¡micamente la difuminaciÃ³n, velocidad y tamaÃ±o de los orbes del mesh dinÃ¡mico de fondo, asÃ­ como un panel de configuraciÃ³n de apariencia global (temas de color, selectores hexadecimales, sliders y cursor spotlight) integrado en el mÃ³dulo de salud del dashboard.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-259: Fondo Global Animado e InteracciÃ³n Spotlight RaÃ­z~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se globalizÃ³ la animaciÃ³n del fondo tecnolÃ³gico y el cursor tracking (Spotlight) a nivel raÃ­z del dashboard, permitiendo un movimiento continuo sin recortes de borde en cualquier secciÃ³n y extendiendo la interactividad del puntero a toda la ventana (`window`).
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-258: Consistencia FÃ­sica y AutocuraciÃ³n Inteligente del CatÃ¡logo~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se actualizÃ³ y completÃ³ el mÃ³dulo de integridad del catÃ¡logo robusteciendo linters de expresiones regulares (colores HEX con opacidades/hovers, localhost y puertos genÃ©ricos, paths multiplataforma), implementando el motor POST `/api/integrity/autofix` con respaldos preventivos (`autocure-backups/`) y embelleciendo semÃ¡nticamente la consola de diagnÃ³stico en el dashboard.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY]
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-257: Refinamiento de la Consola de Logs del Bridge en el Dashboard~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se mejorÃ³ la consola de visualizaciÃ³n de logs en vivo en el dev-dashboard eliminando ruido y agregando estilos de color interactivos.
    1. **Limpieza de ANSI:** Se agregÃ³ la limpieza de todos los cÃ³digos de escape ANSI usando expresiones regulares.
    2. **Formateo de Timestamp:** Se convirtiÃ³ el timestamp ISO del log a la hora local corta (`HH:mm:ss`) para facilitar el escaneo visual.
    3. **Coloreado SemÃ¡ntico:** Se implementÃ³ un renderizador inteligente que pinta niveles de log (warn/error), mÃ©todos HTTP (GET/POST/PUT/DELETE) y marcas especiales (`[Backup]`, `[lock]`, `âœ…`, `âš ï¸`) con clases de color Tailwind CSS.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-256: Robustecimiento de SincronizaciÃ³n Segura y Paridad de Dependencias~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se implementaron salvaguardas operativas de respaldos preventivos y paridad semÃ¡ntica de dependencias en el CLI.
    1. **Safe-Sync Backup:** Antes de realizar escrituras en el cliente, se crea una copia de seguridad fÃ­sica fechada en `.prototipe-backup/sync-backups/` para evitar pÃ©rdidas accidentales.
    2. **Paridad SemÃ¡ntica de package.json:** Habilitada la comparaciÃ³n lÃ³gica de dependencias y scripts, reportando drift Ãºnicamente ante elementos core faltantes o desactualizados.
  - Archivos:
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-255: RegulaciÃ³n Estricta y ProhibiciÃ³n de Descarte de Cambios FÃ­sicos~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se implementÃ³ un estricto protocolo de seguridad documental y de configuraciÃ³n para prohibir a la IA el descarte autÃ³nomo de cambios y restauraciones de cÃ³digo.
    1. **EdiciÃ³n de AGENTS.md:** Se agregÃ³ una regla en la primera secciÃ³n del archivo de reglas central prohibiendo operaciones destructivas (`git restore`, `git checkout --`, `git reset --hard`) sin consentimiento previo por escrito.
    2. **PropagaciÃ³n en GEMINI.md:** Se integrÃ³ la misma directiva de seguridad en la cabecera de todos los archivos de configuraciÃ³n e instrucciones de IA (`GEMINI.md`) en el ecosistema (consola central, instancias de clientes, plantillas core y el CLI).
    - [`.agents/AGENTS.md`](file:///d:/PROTOTIPE/.agents/AGENTS.md) [MODIFY]
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/GEMINI.md`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/GEMINI.md) [MODIFY]
    - [`Plantillas Core/App Ventas/GEMINI.md`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/GEMINI.md) [MODIFY]
    - [`Prototipe-CLI/GEMINI.md`](file:///d:/PROTOTIPE/Prototipe-CLI/GEMINI.md) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/GEMINI.md`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/GEMINI.md) [MODIFY]
    - [`Prototipe-CLI/templates/template-ventas/GEMINI.md`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/GEMINI.md) [MODIFY]
    - [`Instancias Clientes/ventas/ventas-moni-app/GEMINI.md`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/GEMINI.md) [MODIFY]

* **[x] ~~Tarea CORE-254: SincronizaciÃ³n Defensiva, Blindaje de Empaquetado y AlineaciÃ³n de Instancias~~**
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se garantizÃ³ la estabilidad del empaquetado y se alinearon las dependencias del cliente.
    1. **AuditorÃ­a EstÃ¡tica de Vite:** Se incorporÃ³ el validador `auditarViteConfig` en `test_templates.js` para asegurar de forma permanente la presencia de manualChunks y el fraccionamiento correcto del SDK de Firebase, bloqueando registros incorrectos.
    2. **Instalador Robusto:** Se aÃ±adiÃ³ la opciÃ³n `--legacy-peer-deps` al comando `npm install` ejecutado desde el backend en `server.js`.
    3. **AlineaciÃ³n de Cliente:** Se optimizÃ³ `package.json` y `vite.config.js` de la instancia `MONI-APP` de manera sÃ­ncrona, eliminando `dotenv` y reduciendo el tiempo de compilaciÃ³n a 7.32 segundos.
    4. **Limpieza de Core:** Se removiÃ³ la carpeta `node_modules_old` para evitar desviaciones falsas.
  - Archivos:
    - [`Prototipe-CLI/test_templates.js`](file:///d:/PROTOTIPE/Prototipe-CLI/test_templates.js) [MODIFY]
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`Instancias Clientes/ventas/ventas-moni-app/package.json`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/package.json) [MODIFY]
    - [`Instancias Clientes/ventas/ventas-moni-app/vite.config.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/vite.config.js) [MODIFY]

* **[x] ~~Tarea CORE-253: Fortalecimiento y Seguridad del Motor de Aprovisionamiento~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: AuditorÃ­a completa de seguridad, compilaciÃ³n y marca sobre el motor y plantillas core.
    1. **Seguridad en Firestore:** Se parcharon las vulnerabilidades lÃ³gicas en `firestore.rules` del template y core (eliminaciÃ³n del bypass `|| true` en notificaciones, bloqueo del get pÃºblico de PINs de empleados, y restricciÃ³n de listados en Ã³rdenes, reclamos y crÃ©ditos a celular del token autenticado).
    2. **Seguridad en Storage:** Se configuraron reglas de Storage cruzadas con Firestore para restringir la escritura a usuarios con rol `admin`.
    3. **Directory Traversal:** Se sanitizÃ³ `projectName` y se validÃ³ con `isPathContained` la creaciÃ³n de directorios de documentaciÃ³n en `generator.js`.
    4. **Dependencias y CompilaciÃ³n:** Se alineÃ³ Vite a la versiÃ³n estable `"vite": "^6.0.1"` y el plugin de React a `"@vitejs/plugin-react": "^5.1.1"` para Vite 6, removiendo la dependencia huÃ©rfana de `dotenv`.
    5. **CSS, PWA y Code Splitting (OptimizaciÃ³n):** Se unificÃ³ la inyecciÃ³n de HSL y efectos en un bloque branding Ãºnico, se mapeÃ³ la tipografÃ­a a `var(--font-body)` y se dinamizÃ³ la lectura del manifest en `vite.config.js`. Adicionalmente, fragmentamos el monolito de Firebase y `vendor-utils` en sub-chunks especÃ­ficos (`firebase-firestore`, `firebase-auth`, `dexie`, `qrcode`, etc.) en `vite.config.js`, logrando reducir el tiempo de compilaciÃ³n de 18.47s a 9.90s y recortando a la mitad el tamaÃ±o de los mÃ³dulos iniciales obligatorios.
  - Archivos:
    - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [`Prototipe-CLI/templates/template-ventas/firestore.rules`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/firestore.rules) [MODIFY]
    - [`Prototipe-CLI/templates/template-ventas/storage.rules`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/storage.rules) [MODIFY]
    - [`Prototipe-CLI/templates/template-ventas/package.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/package.json) [MODIFY]
    - [`Prototipe-CLI/templates/template-ventas/src/index.css`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/index.css) [MODIFY]
    - [`Prototipe-CLI/templates/template-ventas/vite.config.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js) [MODIFY]
    - [`Plantillas Core/App Ventas/firestore.rules`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [MODIFY/DEPLOYED]
    - [`Plantillas Core/App Ventas/storage.rules`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/storage.rules) [MODIFY/DEPLOYED]
    - [`Plantillas Core/App Ventas/package.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/package.json) [MODIFY]
    - [`Plantillas Core/App Ventas/src/index.css`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/index.css) [MODIFY]
    - [`Plantillas Core/App Ventas/vite.config.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/vite.config.js) [MODIFY]

* **[x] ~~Tarea CORE-252: SincronizaciÃ³n de Matrices de Precios y ConexiÃ³n Unificada del Ecosistema~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se resolviÃ³ la brecha/drift entre el anÃ¡lisis de cotizaciÃ³n del Briefing Studio y la Matriz de Precios Oficial administrada en el CotizadorView.
    1. **SincronizaciÃ³n y CachÃ© en Backend:** Se adaptÃ³ el endpoint `/api/briefing/analyze` en `server.js` para leer la matriz directamente de Firestore (`dashboard_config/pricing_matrix`) e implementar fallbacks seguros en local. Se diseÃ±Ã³ una cachÃ© en memoria de 3 minutos para prevenir consultas Firebase repetitivas. Se alinearon las fÃ³rmulas de cÃ¡lculo de puntos para PersonalizaciÃ³n, Riesgos y Valor con las de `CotizadorView.jsx` (escala hasta 108 puntos).
    2. **AlineaciÃ³n de Estado y Formularios:** Se inyectaron las variables de estado `setupFee` y `editSetupFee` en `App.jsx`, agregando inputs interactivos en los formularios de Onboarding y EdiciÃ³n de Cliente en el CRM, renderizando el Costo de Setup en la tabla principal y tarjeta expandida de clientes de salud SaaS, y pasÃ¡ndolas en el payload del aprovisionador (`cliPayload`) e insertÃ¡ndolas en `clientes_control` de Firestore.
    3. **IntegraciÃ³n Bidireccional en Cotizador:** Se conectÃ³ la propiedad `onImportToOnboarding` en `CotizadorView.jsx` para que el botÃ³n "Importar a Aprovisionamiento" pre-cargue setup fee, mensualidad, comisiÃ³n y nombre del proyecto en el wizard del Onboarding de manera sÃ­ncrona en un clic.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-251: Robustecimiento E2E del Flujo de Aprovisionamiento y ProtecciÃ³n de Sobreescritura~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se aplicÃ³ una auditorÃ­a de robustez al flujo de aprovisionamiento end-to-end.
    1. **Validaciones en UI:** En `App.jsx`, se agregaron validaciones y fallbacks nulos para desestructurar `analysisResult` sin riesgo de `TypeError`, y se limitÃ³ la consulta de `loadBriefingSessions` a 50 documentos ordenados descendientemente.
    2. **ProtecciÃ³n de Sobreescritura en InyecciÃ³n:** En `server.js`, se modificÃ³ el endpoint `/api/library/inject` para verificar si un archivo de componente ya existe: si es idÃ©ntico, reporta `already_present`; si tiene cambios, omite la escritura devolviendo `skipped_exists` para proteger el cÃ³digo personalizado, a menos que se envÃ­e `{ overwrite: true }`. AdemÃ¡s, se modificÃ³ el endpoint para respetar el path canÃ³nico (`manifest.targetPath`) definido por la biblioteca sobre los fallbacks genÃ©ricos calculados por el front.
    3. **InyecciÃ³n de Fuentes DinÃ¡micas:** En `generator.js`, se corrigiÃ³ la inyecciÃ³n de tipografÃ­as: si el cliente selecciona una Google Font personalizada (ej. Poppins, Montserrat), el CLI inyecta dinÃ¡micamente el tag `<link>` correspondiente en el `<head>` de `index.html` para evitar la degradaciÃ³n a la fuente del sistema.
    4. **Copiado de Clipboard Resiliente:** En `BriefingStudioView.jsx`, se implementÃ³ la funciÃ³n helper `copyTextToClipboard` con fallback automÃ¡tico mediante textarea temporal si el navegador carece de permisos seguros de Clipboard en entornos locales no-HTTPS.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx) [MODIFY]
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CORE-250: CorrecciÃ³n de Seguridad y ConversiÃ³n a Arrays en la API de Git~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se detectÃ³ que las llamadas a la API `/api/git/log` y otros comandos de sincronizaciÃ³n de Git usando strings fallaban en el validador de seguridad `execGitCommand` debido a la presencia de comillas (`"`) u otros caracteres restringidos del regex sanitizador. Se convirtieron todas las llamadas inseguras en string a llamadas de array de argumentos estructurados (`['log', '-n', '5', '--pretty=format:...']`, `['checkout', branch]`, `['merge', branch]`, `['push', ...]`, `['stash', 'pop']`), eliminando la posibilidad de inyecciÃ³n de comandos en el shell y permitiendo que spawn/execGitCommand se ejecute sin levantar falsos positivos de seguridad.
  - Archivos:
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-249: IntegraciÃ³n SÃ­ncrona y Bidireccional de Briefing Studio y Asistente de Aprovisionamiento~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se implementÃ³ una conexiÃ³n bidireccional y sÃ­ncrona de datos entre el Briefing Studio y el Asistente de Aprovisionamiento. En `BriefingStudioView.jsx`, la funciÃ³n `handleAnalyzeBriefing` ahora persiste el objeto `analysisResult` completo en Firestore al momento del diagnÃ³stico y el callback de exportaciÃ³n transmite todo el payload de la sesiÃ³n. En `App.jsx`, se implementÃ³ la funciÃ³n de mapeo centralizado `handleImportBriefingData` para cargar: nombre comercial, requerimientos traducidos a notas custom, branding de colores HSL, tipografÃ­a, autoselecciÃ³n de feature flags del core y de componentes recomendados de la biblioteca (utilizando normalizaciÃ³n tolerante a fallos), tarifas comerciales y detecciÃ³n automÃ¡tica de nichos basada en keywords del sector. Adicionalmente, se integrÃ³ el botÃ³n `"ðŸ“¥ Cargar desde Briefing"` y su correspondiente modal filtrable con buscador de sesiones de Firestore, soportando badges y alertas para sesiones pendientes de anÃ¡lisis.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx) [MODIFY]
    - [`.agents/skills/sync_manifest.json`](file:///d:/PROTOTIPE/.agents/skills/sync_manifest.json) [MODIFY]

* **[x] ~~Tarea CORE-248: Sistema de SincronizaciÃ³n DinÃ¡mica del CatÃ¡logo de Componentes en el Prompt Maestro~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Se creÃ³ un script en Node.js (`sync-discovery-prompt.cjs`) que lee dinÃ¡micamente el `README.md` del catÃ¡logo de la biblioteca de componentes en `06_Biblioteca_Componentes` y actualiza automÃ¡ticamente los marcadores de anclaje de comentarios en el `prompt_maestro_descubrimiento.md`. Esto asegura que el prompt de descubrimiento siempre cuente con el catÃ¡logo real del disco sin ediciÃ³n manual. Se integrÃ³ este script como el paso 4.5 en la skill `integrity-compiler` (@postchange) para su ejecuciÃ³n automatizada y transparente.
  - Archivos:
    - [`Prototipe-CLI/scripts/sync-discovery-prompt.cjs`](file:///d:/PROTOTIPE/Prototipe-CLI/scripts/sync-discovery-prompt.cjs) [NEW]
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/prompt_maestro_descubrimiento.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/prompt_maestro_descubrimiento.md) [MODIFY]
    - [`.agents/skills/integrity-compiler/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/integrity-compiler/SKILL.md) [MODIFY]

* **[x] ~~Tarea CORE-247: Blindaje del Schema JSON del Prompt Maestro de Descubrimiento~~**
  - Estatus: Completado.
  - Fecha: 2026-07-04
  - DescripciÃ³n: Prueba end-to-end revelÃ³ que LLMs externos inventaban campos, tipos y estructuras no reconocidas por el CLI. Se reescribiÃ³ la secciÃ³n 6 del prompt como contrato estricto: campos permitidos y sus tipos, nombres vÃ¡lidos de componentes, estructura exacta de customDeltasToBuild y ejemplos de referencia con datos reales. Se aÃ±adieron reglas globales de estructura (solo Aâ†’M) y de contrato JSON (schema no negociable).
  - Archivos: [`prompt_maestro_descubrimiento.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/prompt_maestro_descubrimiento.md) [MODIFY]

* **[x] ~~Tarea CORE-246: ImplementaciÃ³n del Importador de Manifiesto JSON de Aprovisionamiento~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-04
  - Fecha de finalizaciÃ³n: 2026-07-04
  - DescripciÃ³n: Se implementÃ³ un asistente de importaciÃ³n visual de manifiestos de aprovisionamiento JSON (Estrategia B) en el Dashboard Central (`dev-dashboard`). Se aÃ±adiÃ³ un botÃ³n de acceso directo "ðŸ”Œ Importar Manifiesto" que levanta una modal interactiva premium. El sistema parsea el JSON, valida la estructura y auto-configura en un solo clic: el nicho (soporta inyecciÃ³n dinÃ¡mica de nuevos nichos a la lista local de `niches`), el template de origen, las feature flags lÃ³gicas del core (CrÃ©ditos/Billing y DIAN) y selecciona en lote los componentes correspondientes del catÃ¡logo de la biblioteca en `selectedRecomendations`. Adicionalmente, mapea e inyecta en caliente el 100% de las variables estÃ©ticas de branding y lienzo visual del cliente (paleta de colores HSL primaria/secundaria/fondo/textos, fuentes Google Fonts, radio de bordes, modo de sombras, velocidad de animaciÃ³n, efectos de border beam/tilt y el bloque completo de personalizaciÃ³n del canvas de partÃ­culas: tipo, tamaÃ±o, cantidad, opacidad, color, direcciÃ³n y forma), permitiendo que el Design Studio se actualice visualmente en tiempo real. Concatena la especificaciÃ³n detallada de los deltas personalizados a construir (`customDeltasToBuild`) directamente en el campo de texto de requerimientos del cliente en un formato estructurado y legible, y rellena los metadatos SEO sugeridos.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-245: ActualizaciÃ³n del Motor de PartÃ­culas y SincronizaciÃ³n del Generador CLI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-04
  - Fecha de finalizaciÃ³n: 2026-  - DescripciÃ³n: Se actualizÃ³ el motor de partÃ­culas (`BackgroundCanvas.jsx`) en el dev-dashboard y en la plantilla core del generador, incorporando fÃ­sica de envoltura perimetral continua en 4 direcciones de flujo (arriba, abajo, izquierda, derecha) y soporte de opacidad de partÃ­culas, luces glow difusas, chispas de 4 puntas procedimentales y partÃ­culas vectoriales SVG personalizadas para las 23 verticales de negocio oficiales. Se estructurÃ³ una biblioteca premium de mÃ¡s de 100 iconos vectorizados limpios de Lucide (110 iconos en total) distribuidos en 11 categorÃ­as lÃ³gicas (GeometrÃ­a, Cosmos y Clima, E-commerce, Moda y Estilo, Naturaleza, Alimentos, TecnologÃ­a, Salud y Bienestar, Deporte y Arte, EducaciÃ³n, Estilo de Vida), encapsulados en un mÃ³dulo reusable `particlesIcons.js` tanto en la app de simulaciÃ³n como en la plantilla semilla. Se corrigiÃ³ un fallo crÃ­tico en la renderizaciÃ³n de la biblioteca de iconos eliminando la llamada a `ctx.fill()` en el bloque de dibujo de iconos (niche) y estableciendo un grosor de trazo (`ctx.stroke()`) unificado de `1.6` con extremos redondeados (`lineCap = 'round'`); esto previene que las siluetas vectoriales diseÃ±adas para contornos de Lucide se rellenen y se muestren como formas toscas, ciegas y deformadas, logrando en su lugar marcas de agua vectoriales de contorno sumamente nÃ­tidas, legibles y premium. Asimismo, se corrigiÃ³ el renderizado de la biblioteca de selecciÃ³n de iconos en la cuadrÃ­cula del panel lateral ([`BrandingEffectsPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/BrandingEffectsPanel.jsx)) eliminando el relleno sÃ³lido `fill-current` y configurÃ¡ndolo como contorno transparente (`fill="none" stroke="currentColor" strokeWidth="2"`) para que coincidan perfectamente con la apariencia fina y elegante que se renderiza en la vista previa del canvas. Para garantizar la inyecciÃ³n en cualquier plantilla core (multicore), se adaptÃ³ [`generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) para que, en la fase de generaciÃ³n del proyecto, copie de forma proactiva `BackgroundCanvas.jsx` y `particlesIcons.js` a la carpeta `src/components/ui/` de la nueva app de destino. Se optimizÃ³ la inyecciÃ³n en `src/App.jsx` envolviÃ©ndola con comentarios de bloque administrado (`PROTOTIPE_BACKGROUND_CANVAS_START/END`) para lograr una inyecciÃ³n 100% idempotente que previene duplicados en regeneraciones sucesivas, inyectÃ¡ndose bajo 3 niveles de prioridad (slot explÃ­cito, BrowserRouter con props/basename y primer tag de apertura JSX tras return). Adicionalmente, se robusteciÃ³ la inyecciÃ³n de estilos CSS reemplazando de forma selectiva y exclusiva el bloque delimitado por `BRANDING_EFFECTS_START/END` dentro de `:root`, impidiendo la pÃ©rdida de variables u overrides manuales del diseÃ±ador en el `:root` original de la plantilla. Tras el bucle de peer review con la IA externa, se implementÃ³ una optimizaciÃ³n avanzada de rasterizado a demanda (`imageCache` con canvas en memoria temporal) para pre-renderizar los vectores complejos de Lucide a 60 FPS sin Garbage Collector overhead, y se garantizÃ³ la directriz WCAG 2.2 de contraste 3:1 inyectando un lÃ­mite mÃ­nimo de opacidad en pantalla (`minAlpha` adaptado por luminosidad de fondo) combinada con un grosor de trazo dinÃ¡mico (`lineWidth = 1.9` en tamaÃ±os menores a 14px). Se implementÃ³ un panel lateral avanzado de selecciÃ³n en `BrandingEffectsPanel.jsx` que expone un buscador textual en tiempo real y pestaÃ±as horizontales de scroll para clasificar y ubicar Ã¡gilmente cualquier figura. Se implementÃ³ el estado `bgParticlesIcon` (con fallback a `'default'` para respetar el nicho del cliente actual) en `App.jsx`, guardÃ¡ndose dinÃ¡micamente en el borrador (draft) del `localStorage` del Design Studio. Asimismo, se adaptÃ³ `generator.js` para compilar esta nueva variable y emitirla como `--bg-particles-icon` en el index.css del cliente final, y se sincronizÃ³ en el canvas del seed para su lectura en caliente a la primera tras la generaciÃ³n del proyecto. Se rediseÃ±Ã³ el panel del Design Studio (`BrandingEffectsPanel.jsx`) integrando CustomSelect para direcciÃ³n y forma, aumentando el lÃ­mite de tamaÃ±o de partÃ­culas hasta 100px. Se corrigiÃ³ un bug de superposiciÃ³n (apilamiento z-index) de `CustomSelect` inyectando capas dinÃ¡micas cuando estÃ¡ abierto y asignando `relative z-20` al contenedor principal del bloque de Lienzo & Fondos para sobreponerse a las transformaciones (`scale-105`) de botones hermanos. Se enlazaron las propiedades de callback faltantes en `App.jsx` para permitir la reactividad y actualizaciÃ³n en tiempo real del canvas al interactuar. TambiÃ©n se modificÃ³ `generator.js` para asegurar que el CLI aprovisione las nuevas variables y las inyecte de manera exacta en el CSS `:root` de la app cliente.
  - Archivos:de manera exacta en el CSS `:root` de la app cliente.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/BrandingEffectsPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/BrandingEffectsPanel.jsx) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/particlesIcons.js`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/particlesIcons.js) [NEW]
    - [`Central PROTOTIPE/dev-dashboard/src/components/ui/CustomSelect.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/ui/CustomSelect.jsx) [MODIFY]
    - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/src/components/ui/BackgroundCanvas.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/ui/BackgroundCanvas.jsx) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/src/components/ui/particlesIcons.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/ui/particlesIcons.js) [NEW]

* **[x] ~~Tarea CORE-244: RediseÃ±o ErgonÃ³mico de la PestaÃ±a Branding y Selector de Paletas en Modal Dedicado~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-04
  - Fecha de finalizaciÃ³n: 2026-07-04
  - DescripciÃ³n: Se implementÃ³ un rediseÃ±o ergonÃ³mico de la pestaÃ±a Branding para reducir el scroll vertical del formulario. Se removieron los acordeones de los 23 nichos del flujo de la pÃ¡gina y se reemplazaron por un disparador compacto. Se diseÃ±Ã³ un modal dedicado de vidrio/glassmorphism con buscador integrado que filtra los nichos en tiempo real, abre de forma automÃ¡tica acordeones que coinciden con la bÃºsqueda, y permite seleccionar y aplicar la paleta cerrÃ¡ndose de manera inmediata.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-243: SincronizaciÃ³n en Caliente del Mockup Smartphone e InyecciÃ³n de Componentes de Efectos Premium en la Plantilla Core~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-04
  - Fecha de finalizaciÃ³n: 2026-07-04
  - DescripciÃ³n: Se enlazaron bidireccionalmente todos los nuevos efectos avanzados de branding (`shadowStyle`, `glassmorphism`, `animationSpeed`, `radiusMode`, `borderBeam`, `tilt3d`, y fondo interactivo `BackgroundCanvas`) dentro de la vista previa del Smartphone (modo mÃ³vil) y Laptop (modo PC/Web) en el panel de control. Se crearon y agregaron los componentes BackgroundCanvas e InteractiveTiltCard a la plantilla core template-core-seed, y se inyectaron los estilos de enmascaramiento perimetral para el efecto lÃ¡ser en index.css de la plantilla core. En revisiÃ³n (CORE-243.1) se implementÃ³ el spotlight interactivo. En revisiÃ³n (CORE-243.2) se reestructurÃ³ fÃ­sicamente la jerarquÃ­a de 4 capas de InteractiveTiltCard (fx-card-shell -> fx-card-tilt-plane -> fx-card-clip -> fx-card-content / glare) evitando clipping Ã³ptico, se implementÃ³ haz de luz lÃ¡ser XOR perimetral con mask-composite exclude y @property angle, se optimizÃ³ el spotlight interactivo a 60 FPS moviendo pointermove/pointerleave nativo a canvas (removiendo React States por frame), se agregaron las variables CSS inline al mockup del simulador, y se actualizÃ³ generator.js para aprovisionar las variables cromÃ¡ticas HSL/RGB (neonLightness y neonSaturation calculados con clamp semÃ¡ntico). En revisiÃ³n (CORE-243.3) se refactorizÃ³ por completo el motor de BackgroundCanvas.jsx (en plantilla y app) migrÃ¡ndolo de CSS estÃ¡tico a Canvas 2D animado de alto rendimiento: (1) Malla Mesh con orbes dinÃ¡micas flotantes cuya fÃ­sica y opacidad respetan bgOrbsCount y bgOrbsOpacity; (2) Spotlight cursor tracing 100% interactivo capturando coordenadas locales del viewport con escalado del mockup y uniendo el cursor en el centro si sale; (3) Aurora boreal gaseosa real fluida mediante interpolaciones y deformaciÃ³n sinusoidal; (4) Rejilla 3D tecnolÃ³gica con perspectiva proyectada en GPU y scroll animado infinito; y (5) SincronizaciÃ³n automÃ¡tica de mockTheme con el brillo del fondo de la marca. En revisiÃ³n (CORE-243.4) se corrigiÃ³ el corte abrupto y el fondo oscuro del desvanecimiento del horizonte de la rejilla 3D (cuando la paleta de colores cromÃ¡tica es clara) inyectando la funciÃ³n ultra-resiliente `parseColorToRgb` en BackgroundCanvas (tanto en dev-dashboard como en la plantilla core) para interpretar dinÃ¡micamente formatos HEX, HSL y RGB del color de fondo (`bgColor`/`--color-bg`), adaptando la mÃ¡scara de gradiente de manera invisible y suave en cualquier tema de color. En revisiÃ³n (CORE-243.5) se corrigiÃ³ el parpadeo del spotlight interactivo (desacoplando `spotlightPos` del `useEffect` principal a travÃ©s de un `useRef` persistente sincronizado sÃ­ncronamente), se unificÃ³ la velocidad de las partÃ­culas a un factor flotante continuo eliminando strings estÃ¡ticos, se inyectÃ³ el blending adaptativo de la malla mesh (`source-over` en Modo Claro y `screen` en Modo Oscuro) y se ampliaron los lÃ­mites de esferas (max: 12) y opacidad (max: 0.8) en `generator.js` para asegurar que las opciones elegidas en el dashboard se reflejen al 100% en la app aprovisionada.
  - Archivos:
    - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/src/components/ui/BackgroundCanvas.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/ui/BackgroundCanvas.jsx) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/src/components/ui/InteractiveTiltCard.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/ui/InteractiveTiltCard.jsx) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/src/index.css`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/index.css) [MODIFY]

* **[x] ~~Tarea CORE-242: ImplementaciÃ³n de Design Studio con Tokens de Efectos Avanzados y PrevisualizaciÃ³n en Vivo~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-04
  - Fecha de finalizaciÃ³n: 2026-07-04
  - DescripciÃ³n: Se implementÃ³ un panel de diseÃ±o avanzado (Design Effects Studio) con 4 nuevos tokens de efectos visuales interactivos: shadowStyle (shadows), glassmorphism, animationSpeed y radiusMode (radius). El componente modular BrandingEffectsPanel elimina los selectores nativos y ofrece previsualizaciones HSL de sombras y bordes en vivo. Se integraron en el payload de aprovisionamiento de generator.js y se mapearon dentro de la directiva @theme inline de la plantilla core para permitir utilidades nativas de Tailwind v4.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/BrandingEffectsPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/BrandingEffectsPanel.jsx) [NEW]
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/src/index.css`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/index.css) [MODIFY]

* **[x] ~~Tarea CORE-241: AmpliaciÃ³n y VariaciÃ³n de Paletas de Colores (Claro/Pastel y DuplicaciÃ³n)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-04
  - Fecha de finalizaciÃ³n: 2026-07-04
  - DescripciÃ³n: Se duplicÃ³ la cantidad de combinaciones cromÃ¡ticas recomendadas en `PALETTE_CATEGORIES` para cada uno de los 23 nichos del ecosistema (de 10 a 20 paletas por categorÃ­a), agregando 10 variantes de Modo Claro / Tonos Pastel con fondos claros/blancos y textos oscuros por nicho para evitar la dominancia de fondos oscuros en el aprovisionamiento.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-240: RediseÃ±o Premium de TelemetrÃ­a (Health Radar)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-04
  - Fecha de finalizaciÃ³n: 2026-07-04
  - DescripciÃ³n: Reemplazado el radar circular por un cockpit vertical de recursos responsivo y sparkline de histÃ³rico de CPU. Adaptados contrastes para Modo Claro en listado y ficha.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/HealthRadar.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/HealthRadar.jsx) [MODIFY]

* **[x] ~~Tarea CORE-239: AdaptaciÃ³n de Elementos del Cotizador de Proyectos al Modo Oscuro/Claro~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-04
  - Fecha de finalizaciÃ³n: 2026-07-04
  - DescripciÃ³n: RefactorizaciÃ³n y adaptaciÃ³n estÃ©tica de las tarjetas de complejidad en el cotizador de proyectos (`CotizadorView.jsx`) para integrarse de forma armoniosa tanto en el modo oscuro por defecto de la aplicaciÃ³n como en el modo claro.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/CotizadorView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CotizadorView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-238: AdaptaciÃ³n de Elementos del Feature Flag Manager al Modo Oscuro/Claro~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-04
  - Fecha de finalizaciÃ³n: 2026-07-04
  - DescripciÃ³n: RefactorizaciÃ³n y adaptaciÃ³n estÃ©tica de la barra lateral de clientes y botones de acciÃ³n masiva en el gestor de feature flags (`FeatureFlagManager.jsx`) para integrarse de forma armoniosa tanto en el modo oscuro por defecto de la aplicaciÃ³n como en el modo claro.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx) [MODIFY]

* **[x] ~~Tarea CORE-237: AdaptaciÃ³n de Botones del Briefing Studio al Modo Oscuro/Claro~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-04
  - Fecha de finalizaciÃ³n: 2026-07-04
  - DescripciÃ³n: RefactorizaciÃ³n y adaptaciÃ³n estÃ©tica de los botones de control de la cabecera en el Briefing Studio (`BriefingStudioView.jsx`) para integrarse de forma armoniosa tanto en el modo oscuro por defecto de la aplicaciÃ³n como en el modo claro.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-236: AuditorÃ­a TÃ©cnica Completa del Ecosistema (Pasiva)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-04
  - Fecha de finalizaciÃ³n: 2026-07-04
  - DescripciÃ³n: EjecuciÃ³n de la auditorÃ­a tÃ©cnica completa solicitada en el prompt maestro de manera pasiva. Se analizaron los vectores de Scaffolding y Bridge del CLI (encontrando el fallo crÃ­tico de exfiltraciÃ³n de env vars vÃ­a pathspecs en cmd.exe y posibles fugas locales de CORS), el ciclo de vida de los listeners de Firestore en el Dashboard (App.jsx), la persistencia offline vÃ­a Dexie.js (App Ventas), y el cumplimiento de tokens de diseÃ±o y seeds de verticals.
  - Archivos:
    - [`Documentacion PROTOTIPE/reporte_auditoria_ecosistema_completo.md`](file:///C:/Users/Sergio/.gemini/antigravity/brain/2384f55b-7e9d-4a85-8d9d-5b3de0516db9/reporte_auditoria_ecosistema_completo.md) [NEW]
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-235: RediseÃ±o Premium de Matriz de Paridad (Drift Heatmap) y RestauraciÃ³n de Cambios~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-03
  - Fecha de finalizaciÃ³n: 2026-07-03
  - DescripciÃ³n: Refactorizada la cuadrÃ­cula de paridad de cÃ³digo en el CRM de Clientes, pasando de un diseÃ±o plano de 3 columnas a un diseÃ±o premium responsivo de 2 columnas. AÃ±adidas tarjetas con efecto de profundidad, gradiente de fondo dinÃ¡mico interactivo en hover, badges semÃ¡nticos con contorno para estados de paridad y paneles informativos dedicados para "Modificados" y "Faltantes" (eliminando los antiguos botones planos grises en favor de layouts estructurados de alta legibilidad). Reintegrada la funcionalidad reactiva de los botones "Alinear package.json" e "Instalar NPM" en la tarjeta de NPM Drift.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
    - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-234: CorrecciÃ³n de Sembrado (Seeding) y AlineaciÃ³n de NPM Drift en CRM~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-03
  - Fecha de finalizaciÃ³n: 2026-07-03
  - DescripciÃ³n: Desactivado el sembrado automÃ¡tico del administrador durante la creaciÃ³n de instancias de clientes en el CLI para mantener bases de datos limpias. Corregido el esquema de datos de demostraciÃ³n en `seed_data.json` y el endpoint de sembrado `/api/project/db/seed` en `server.js` (redireccionando a `/products` and `/categories` e inyectando variantes y metadatos correctos para evitar crashes). Implementados botones de acciÃ³n rÃ¡pida ("Alinear package.json" e "Instalar NPM") directamente en la tarjeta de NPM Drift del CRM modal de gestiÃ³n en el dev-dashboard.
  - Archivos:
    - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-233: Despliegue de Reglas de Seguridad de Firestore en ProducciÃ³n~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-03
  - Fecha de finalizaciÃ³n: 2026-07-03
  - DescripciÃ³n: Desplegadas las reglas locales de Firestore (`firestore.rules`) al proyecto de producciÃ³n de Firebase (`ventas-smartfix`), resolviendo de forma definitiva los errores de consola de `Missing or insufficient permissions` y permitiendo al cliente el inicio de sesiÃ³n y la carga inicial del catÃ¡logo.
  - Archivos:
    - [`Plantillas Core/App Ventas/firestore.rules`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [DEPLOYED]

* **[x] ~~Tarea CORE-232: Layout a Pantalla Completa (Full Width) en Dashboard Admin~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-03
  - Fecha de finalizaciÃ³n: 2026-07-03
  - DescripciÃ³n: Migradas las 9 pantallas administrativas (`AdminClaims`, `AdminCredits`, `AdminHome`, `AdminInventory`, `AdminOrders`, `AdminQRPerformance`, `AdminSalesDetail`, `AdminSettings` y `AdminStockAlerts`) de un ancho fijo centrado `max-w-7xl mx-auto` a un diseÃ±o elÃ¡stico responsivo a pantalla completa `w-full`, eliminando el espacio muerto en el lateral derecho de pantallas de escritorio mayores a 1280px.
  - Archivos:
    - [`Plantillas Core/App Ventas/src/pages/admin/AdminClaims.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminClaims.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/pages/admin/AdminCredits.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/pages/admin/AdminHome.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/pages/admin/AdminInventory.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/pages/admin/AdminOrders.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/pages/admin/AdminQRPerformance.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminQRPerformance.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/pages/admin/AdminSalesDetail.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/pages/admin/AdminStockAlerts.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminStockAlerts.jsx) [MODIFY]

* **[x] ~~Tarea CORE-231: ResoluciÃ³n de Errores CrÃ­ticos y Hardening en App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-03
  - Fecha de finalizaciÃ³n: 2026-07-03
  - DescripciÃ³n: CorrecciÃ³n del error de runtime de variantes (`TypeError: reduce`) en `AdminInventory.jsx` mediante safe fallbacks en desktop y mobile. Remediados los 17 fallos crÃ­ticos del Design Integrity Guard (colores hexadecimales hardcodeados, anchos fijos y sombras duras) en 9 archivos principales de la plantilla core, y ajustada la configuraciÃ³n plana de ESLint en `eslint.config.js` para ignorar falsos positivos de Firebase en la capa legÃ­tima de `src/services/` y `src/repositories/`.
  - Archivos:
    - [`Plantillas Core/App Ventas/src/pages/admin/AdminInventory.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/eslint.config.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/eslint.config.js) [MODIFY]
    - [`Plantillas Core/App Ventas/src/App.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/components/client/catalog/CatalogBanner.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/CatalogBanner.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/components/client/catalog/ProductDetailModal.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/components/client/checkout/CheckoutModal.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/components/ui/PWAInstallBanner.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/PWAInstallBanner.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/layouts/ClientLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/pages/client/ClientCredits.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/pages/client/ProductDetailPage.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/pages/client/ProductPublicDetail.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/pages/WelcomePage.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/WelcomePage.jsx) [MODIFY]
    - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-230: AuditorÃ­a Completa de Calidad TÃ©cnica y DiseÃ±o en Biblioteca de Componentes y MÃ³dulos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-03
  - Fecha de finalizaciÃ³n: 2026-07-03
  - DescripciÃ³n: EjecuciÃ³n de una auditorÃ­a profunda de calidad visual, de accesibilidad responsiva y de paridad arquitectÃ³nica (Design Integrity Guard y Feature-Sliced Design) en todos los 260 archivos fÃ­sicos de la biblioteca de componentes y mÃ³dulos. Se capturaron las salidas de stderr/stdout, se sanearon problemas de codificaciÃ³n y se compilÃ³ un reporte detallado agrupado por archivo con un plan de acciÃ³n concreto.
  - Archivos:
    - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/reporte_auditoria_biblioteca_completa.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/reporte_auditoria_biblioteca_completa.md) [NEW]
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-229: Protocolo de ColaboraciÃ³n IA Downstream-Upstream (Antigravity â†” LLM-Agnostic Consultant)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-03
  - Fecha de finalizaciÃ³n: 2026-07-03
  - DescripciÃ³n: DiseÃ±o y creaciÃ³n del manual del protocolo de colaboraciÃ³n en bucle cerrado (`protocolo_colaboracion_ia.md`) para operar de forma agnÃ³stica con cualquier IA externa (GPT, Claude, DeepSeek, Gemini). Se integrÃ³ el hardening de auditorÃ­a de GPT (Context Packs estructurados con ID/Hashes, tags de hechos locales vs hipÃ³tesis, validaciones baseline previas y posteriores obligatorias, control de blast radius, tabla de ClasificaciÃ³n de Decisiones TÃ©cnicas y modo de rollback seguro ante fallas de build). Incluye el "Bootstrap Prompt" universal de inicializaciÃ³n.
  - Archivos:
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/protocolo_colaboracion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/protocolo_colaboracion_ia.md) [NEW]
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
    - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-228: Endurecimiento de SincronizaciÃ³n de Habilidades de IA y Control de Conflictos (Sync Manifest)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-03
  - Fecha de finalizaciÃ³n: 2026-07-03
  - DescripciÃ³n: ImplementaciÃ³n completa del motor de sincronizaciÃ³n de tres vÃ­as con control de conflictos y borrado en `verify_library_integrity.cjs`. Las habilidades activas y respaldadas son validadas contra `sync_manifest.json` en `.agents/skills/` por medio de hashes SHA-256 y mtimes. Se bloquea la ejecuciÃ³n de forma segura (build error) ante conflictos cruzados (`THREE_WAY_CONFLICT`) y eliminaciones unilaterales (`DELETE_REVIEW`). Las escrituras del manifiesto se ejecutan atÃ³micamente con archivos `.tmp` y renombrado por kernel.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY]
    - [`.agents/skills/sync_manifest.json`](file:///d:/PROTOTIPE/.agents/skills/sync_manifest.json) [NEW]
    - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
    - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-227: Hardening de Biblioteca, Linter de CÃ³digo en Markdown y AlineaciÃ³n Avanzada de Skills~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-03
  - Fecha de finalizaciÃ³n: 2026-07-03
  - DescripciÃ³n: Modificado el validador central `verify_library_integrity.cjs` para parsear bloques de cÃ³digo `jsx` en la biblioteca y correr las regex del Design Integrity Guard, validando tambiÃ©n llaves obligatorias en los manifiestos JSON. Se corrigieron incoherencias de imports y colores estÃ¡ticos en `sandbox-integrator`, `component-creator` y se inyectaron pautas estrictas de persistencia offline (IndexedDB/Dexie.js), desacoplamiento Firebase en 3 capas y validaciones de build pre-commit.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY]
    - [`d:\PROTOTIPE\.agents\AGENTS.md`](file:///d:/PROTOTIPE/.agents/AGENTS.md) [MODIFY]
    - [`.agents/skills/sandbox-integrator/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/sandbox-integrator/SKILL.md) [MODIFY]
    - [`.agents/skills/component-creator/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/component-creator/SKILL.md) [MODIFY]
    - [`.agents/skills/portar-componente/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/portar-componente/SKILL.md) [MODIFY]
    - [`.agents/skills/database-seeder/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/database-seeder/SKILL.md) [MODIFY]
    - [`.agents/skills/onboarder-marcas/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/onboarder-marcas/SKILL.md) [MODIFY]
    - [`.agents/skills/post-discovery-analyzer/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/post-discovery-analyzer/SKILL.md) [MODIFY]
    - [`.agents/skills/git-strategist/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/git-strategist/SKILL.md) [MODIFY]
    - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
    - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-226: Escalabilidad, Resiliencia y Hardening ArquitectÃ³nico del Ecosistema~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-03
  - Fecha de finalizaciÃ³n: 2026-07-03
  - DescripciÃ³n: ImplementaciÃ³n completa del plan CORE-226: inyecciÃ³n de reglas ESLint arquitectÃ³nicas (select nativo, className dinÃ¡mico, imports profundos, Firestore writes), validador AST por scripts para runTransaction de documentos calientes, blindaje del payload de telemetrÃ­a de comisiones eliminando comisionValor del navegador, migraciÃ³n de cola offline de localStorage a IndexedDB con Dexie.js incluyendo migraciÃ³n legacy y backoff exponencial, generaciÃ³n y validaciÃ³n de prototipe.lock.json con SHA-256 en generator.js, y el **Design Integrity Guard** que audita anchos fijos, colores hexadecimales y sombras de diseÃ±o mediante AST con Babel y aÃ±ade soporte para fuentes asÃ­ncronas, sombras HSL y rejillas responsivas en Tailwind v4.
    - [`Plantillas Core/App Ventas/eslint.config.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/eslint.config.js) [MODIFY]
    - [`Plantillas Core/App Ventas/package.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/package.json) [MODIFY]
    - [`Plantillas Core/App Ventas/scripts/validate-core-integrity.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/scripts/validate-core-integrity.js) [MODIFY]
    - [`Plantillas Core/App Ventas/index.html`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/index.html) [MODIFY]
    - [`Plantillas Core/App Ventas/src/index.css`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/index.css) [MODIFY]
    - [`Plantillas Core/App Ventas/src/services/telemetryService.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/telemetryService.js) [MODIFY]
    - [`Plantillas Core/App Ventas/src/services/telemetryOutboxDb.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/telemetryOutboxDb.js) [NEW]
    - [`Prototipe-CLI/templates/template-core-seed/eslint.config.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/eslint.config.js) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/package.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/package.json) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/index.html`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/index.html) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/src/index.css`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/index.css) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/scripts/validate-core-integrity.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/scripts/validate-core-integrity.js) [NEW]
    - [`Prototipe-CLI/templates/template-core-seed/src/services/telemetryService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/telemetryService.js) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/src/services/telemetryOutboxDb.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/telemetryOutboxDb.js) [NEW]
    - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`Documentacion PROTOTIPE/09_Modulos_Completos/Telemetria_Centralizada/telemetria_centralizada.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/Telemetria_Centralizada/telemetria_centralizada.md) [DELETE]
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-225: IntegraciÃ³n de EstÃ¡ndares de Arquitectura Desacoplada y AlineaciÃ³n de Skills en el Ecosistema~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-03
  - Fecha de finalizaciÃ³n: 2026-07-03
  - DescripciÃ³n: FormalizaciÃ³n e inyecciÃ³n del estÃ¡ndar obligatorio de arquitectura desacoplada y Firebase (3 capas: Repository-Service-Hook, control de listeners onSnapshot y shimmer skeletons de carga) en el archivo de reglas global AGENTS.md. Se auditaron y adaptaron las skills operativas crear-skill-prototipe, onboarder-marcas y sandbox-integrator para guiar a futuros agentes a cumplir con estas prÃ¡cticas y validaciones cromÃ¡ticas WCAG 2.1.
  - Archivos:
    - [`d:\PROTOTIPE\.agents\AGENTS.md`](file:///d:/PROTOTIPE/.agents/AGENTS.md) [MODIFY]
    - [`.agents/skills/crear-skill-prototipe/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/crear-skill-prototipe/SKILL.md) [MODIFY]
    - [`.agents/skills/onboarder-marcas/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/onboarder-marcas/SKILL.md) [MODIFY]
    - [`.agents/skills/sandbox-integrator/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/sandbox-integrator/SKILL.md) [MODIFY]
    - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
    - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-224: SolidificaciÃ³n Responsiva, Shimmer Skeletons, Resiliencia de Siembra y Prettier~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-03
  - Fecha de finalizaciÃ³n: 2026-07-03
  - DescripciÃ³n: ImplementaciÃ³n del plan de solidificaciÃ³n visual responsiva: creaciÃ³n de componentes ProductCardSkeleton y OrderTrackingSkeleton, reemplazo de loadings inline, adiciÃ³n de safe-area-bottom para barra de navegaciÃ³n en PWA, inyecciÃ³n de directivas responsivas (Directiva 10) y modularidad de 3 capas (Directiva 11) en generator.js, resiliencia del script seed_admin.js ante fallas de login usando UID determinista, y formateo nativo con Prettier.
  - Archivos:
    - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/package.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/package.json) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/.prettierrc`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/.prettierrc) [NEW]
    - [`Prototipe-CLI/templates/template-core-seed/src/index.css`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/index.css) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/src/components/ui/ProductCardSkeleton.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/ui/ProductCardSkeleton.jsx) [NEW]
    - [`Plantillas Core/App Ventas/package.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/package.json) [MODIFY]
    - [`Plantillas Core/App Ventas/.prettierrc`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.prettierrc) [NEW]
    - [`Plantillas Core/App Ventas/src/index.css`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/index.css) [MODIFY]
    - [`Plantillas Core/App Ventas/src/components/ui/ProductCardSkeleton.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/ProductCardSkeleton.jsx) [NEW]
    - [`Plantillas Core/App Ventas/src/components/ui/OrderTrackingSkeleton.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/OrderTrackingSkeleton.jsx) [NEW]
    - [`Plantillas Core/App Ventas/src/pages/client/ClientCatalog.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/pages/client/OrderTracking.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/OrderTracking.jsx) [MODIFY]
    - [`Plantillas Core/App Ventas/src/layouts/ClientLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
    - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
    - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-223: CreaciÃ³n de EstÃ¡ndar ArquitectÃ³nico Modular para React + Firebase + Tailwind CSS v4~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-03
  - Fecha de finalizaciÃ³n: 2026-07-03
  - DescripciÃ³n: CreaciÃ³n de un estÃ¡ndar arquitectÃ³nico para el ecosistema PROTOTIPE enfocado en aplicaciones React, Firebase y Tailwind CSS v4. El documento define guÃ­as de FDD/DDD en React, modularizaciÃ³n UI/UX, desacoplamiento de Firebase mediante API Wrappers y Custom Hooks, maquetaciÃ³n adaptativa, estados de carga y resiliencia con Suspense, y prompt engineering para IA.
  - Archivos:
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectura_limpia_react_firebase.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectura_limpia_react_firebase.md) [NEW]
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
    - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-222: Hardening y SolidificaciÃ³n CrÃ­tica del Motor de Aprovisionamiento del CLI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-03
  - Fecha de finalizaciÃ³n: 2026-07-03
  - DescripciÃ³n: ImplementaciÃ³n completa del plan de hardening: normalizaciÃ³n automÃ¡tica cromÃ¡tica Hex/HSL para Tailwind CSS v4, alias custom en palettes.js, propagaciÃ³n de errores y retry con backoff exponencial para firebase deploy, validaciÃ³n post-generaciÃ³n rigurosa de .env.local y package.json, generaciÃ³n de VITE_DEV_PIN aleatorio de 4 dÃ­gitos por instancia, seed data dedicado para los 9 nichos del ecosistema, inyecciÃ³n portable del pre-commit Git Hook usando getWorkspaceRoot() y soporte de resolve aliases en template-core-seed.
  - Archivos:
    - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [`Prototipe-CLI/config/niches.json`](file:///d:/PROTOTIPE/Prototipe-CLI/config/niches.json) [MODIFY]
    - [`Prototipe-CLI/scripts/test_provision.js`](file:///d:/PROTOTIPE/Prototipe-CLI/scripts/test_provision.js) [MODIFY]
    - [`Prototipe-CLI/templates/template-core-seed/jsconfig.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/jsconfig.json) [NEW]
    - [`Prototipe-CLI/templates/template-core-seed/vite.config.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/vite.config.js) [MODIFY]
    - [`Plantillas Core/App Ventas/src/constants/index.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/constants/index.js) [MODIFY]
    - [`Plantillas Core/App Ventas/src/constants/palettes.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/constants/palettes.js) [MODIFY]

* **[x] ~~Tarea CORE-221: Persistencia de Borrador y RestauraciÃ³n AutomÃ¡tica del Asistente~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Auto-guardado transparente en LocalStorage de todos los campos del asistente de aprovisionamiento en cada tecla/evento, restauraciÃ³n automÃ¡tica del borrador al recargar o entrar en la sesiÃ³n, botÃ³n de limpieza explÃ­cita de borrador y remociÃ³n automÃ¡tica al completar con Ã©xito.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-220: Consola de Aprovisionamiento en Tiempo Real (Live Log Stream Console)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: CreaciÃ³n de una terminal/consola de logs en tiempo real integrada en el overlay de carga de aprovisionamiento, conectada al stream de eventos SSE del CLI Bridge. Cuenta con ancho de ventana adaptativo, colores semÃ¡nticos reactivos y autoscroll automÃ¡tico.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-219: NormalizaciÃ³n de Colores Hex a HSL y Transaccionalidad de Registro en Firestore~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: ImplementaciÃ³n de conversores automÃ¡ticos de Hexadecimal a HSL en el API Bridge (`server.js`) para todos los tokens de color del cliente, y reestructuraciÃ³n transaccional en el frontend del wizard (`App.jsx`) para que las escrituras a Firestore central ocurran Ãºnicamente tras completar fÃ­sicamente la creaciÃ³n local, evitando registros fantasma en la base de datos ante errores tempranos.
  - Archivos:
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-218: Buscador Interactivo y Ordenamiento por Relevancia en Recomendaciones de Biblioteca~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: IncorporaciÃ³n de una barra de bÃºsqueda para las recomendaciones de componentes de la biblioteca en el wizard de aprovisionamiento de clientes. Cuenta con algoritmo de ponderaciÃ³n por relevancia (coincidencias en nombre, nombre tÃ©cnico y categorÃ­a) y rejilla plana de resultados ordenada.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-217: SolidificaciÃ³n del Sistema de Aprovisionamiento y Cierre de Brechas de Datos/Contexto para la IA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: SolidificaciÃ³n del sistema de aprovisionamiento. Pre-relleno de `contexto_negocio.md` con briefing, inyecciÃ³n de paleta de colores completa en `guia_estilos_ui.md` y prompt de arranque, coerciÃ³n y validaciÃ³n defensiva de payloads en el API Bridge, aumento del timeout a 20 min, campos SEO integrados en wizard, pre-validaciÃ³n sÃ­ncrona en cliente y barra de progreso por etapas real.
  - Archivos:
    - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-213: Aprovisionador con Carpetas Colapsables y Blindaje de AdaptaciÃ³n IA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: ImplementaciÃ³n de la UI colapsable de acordeÃ³n exclusivo para los componentes recomendados en el BriefingStudio y en el Wizard de creaciÃ³n de clientes, integraciÃ³n de pistas de adaptaciÃ³n y payload `appContext` enriquecido en el backend CLI, botÃ³n de copia de prompt de inyecciÃ³n estructurado, y traducciÃ³n de etiquetas en la vista de aprovisionamiento.
  - Archivos:
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-215: RefactorizaciÃ³n y Limpieza de la Barra de NavegaciÃ³n Inferior en MÃ³vil~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: SimplificaciÃ³n del bottom nav mÃ³vil a una sola fila de 5 botones (4 principales + BotÃ³n de MenÃº) para erradicar el desbordamiento multilÃ­nea de iconos, enlazando el botÃ³n MenÃº con la barra lateral flotante tipo Drawer.
  - Archivos: [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-214: MenÃº Lateral en AcordeÃ³n Colapsable para Dashboard Central~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Modificado el estado de navegaciÃ³n lateral para cargar todas las categorÃ­as colapsadas por defecto, aplicando comportamiento exclusivo de acordeÃ³n (un solo grupo abierto a la vez).
  - Archivos: [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-212: SincronizaciÃ³n de Versiones SemVer y Bump de VersiÃ³n de Plantillas Core~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se corrigiÃ³ la falta de sincronÃ­a de versiÃ³n en el CLI marcando clientes como desactualizados si su versiÃ³n es inferior al core. Se aÃ±adiÃ³ endpoint `bump-version` para incrementar versiÃ³n en plantillas_registro.json y package.json del core fuente. Se integrÃ³ detector de drift y botÃ³n "Actualizar versiÃ³n" en el dashboard.
  - Archivos: [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY], [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-211: Cabecera TranslÃºcida Transparente DinÃ¡mica y SoluciÃ³n de LÃ­nea de Anti-aliasing (App Ventas)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Reemplazo de clip-path CSS por cenefa vectorial SVG absoluta para eliminar lÃ­nea de anti-aliasing mÃ³vil. Ajuste de clearance vertical en layouts y rediseÃ±o de cabecera translÃºcida en AdminHome.jsx.
  - Archivos: [`Plantillas Core/App Ventas/src/layouts/ClientLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY], [`Plantillas Core/App Ventas/src/pages/admin/AdminHome.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]

* **[x] ~~Tarea CORE-210: RediseÃ±o Premium del Encabezado del Dashboard Admin (App Ventas)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se transformÃ³ el encabezado de bienvenida del dashboard administrativo (`AdminHome.jsx`) en una cabecera asimÃ©trica premium, agregando orbes decorativos, dot verde de estado activo y resumen en tiempo real de caja diaria y pedidos pendientes. Adicionalmente, se configurÃ³ la tarjeta de Ventas principal para reflejar por defecto el total del dÃ­a de hoy y se integraron botones preset (Hoy, Semana, Mes, AÃ±o) en la vista de detalle (`AdminSalesDetail.jsx`).
  - Archivos: [`Plantillas Core/App Ventas/src/pages/admin/AdminHome.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY], [`Plantillas Core/App Ventas/src/pages/admin/AdminSalesDetail.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]

* **[x] ~~Tarea CORE-208: CorrecciÃ³n de Discrepancia de Componentes AtÃ³micos y Blindaje de Linter~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: DiagnÃ³stico exhaustivo de la brecha entre el README (70 Ã¡tomos), el API CLI (61) y el conteo del dashboard. Causa raÃ­z: 10 componentes de la Fase 4 (loaders/skeletons/spinners) en `Componentes_Atomicos/` tenÃ­an `"type": "component"` en lugar de `"type": "atom"`. Se corrigieron los 10 manifiestos. Se inyectÃ³ regla anti-regresiÃ³n en `verify_library_integrity.cjs` que falla el linter si un componente dentro de `Componentes_Atomicos/` no declara `"type": "atom"`. Build 100% limpio.
  - Archivos:
    - `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/` [MODIFY 10 manifests: typeâ†’atom]
    - [`Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY]

* **[x] ~~Tarea CORE-206: Correcciones de CreditCardInteractiveFlip, FloatingMenuTrigger y targetPath en Manifiestos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se corrigiÃ³ la rotaciÃ³n 3D de `CreditCardInteractiveFlip` removiendo la clase `duration-500` e de interpolaciÃ³n con Framer Motion e incorporando compatibilidad Webkit para backface-visibility y perspectivas. Se rediseÃ±Ã³ `FloatingMenuTrigger` para soportar mÃºltiples direcciones ('up', 'down', 'left', 'right', 'radial'), tooltips acrÃ­licos premium, iconos de Lucide-React y posicionamiento dinÃ¡mico preventivo contra recortado en el sandbox. Se saneÃ³ el manifiesto JSON de los 10 componentes atÃ³micos de la Fase 1 cambiando su `"targetPath"` de la ruta sandbox a `"src/components/ui/[NombreTÃ©cnico].jsx"`, corrigiendo las importaciones recomendadas del dashboard. Se agregÃ³ validaciÃ³n anti-sandbox en el linter `verify_library_integrity.cjs` y se actualizaron las reglas del agente en `AGENTS.md` y `component-creator/SKILL.md`.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CreditCardInteractiveFlipSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CreditCardInteractiveFlipSandbox.jsx) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/FloatingMenuTriggerSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/FloatingMenuTriggerSandbox.jsx) [MODIFY]
    - Fichas tÃ©cnicas de los 10 componentes de la Fase 1 en `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/` [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY]
    - [`d:/PROTOTIPE/.agents/AGENTS.md`](file:///d:/PROTOTIPE/.agents/AGENTS.md) [MODIFY]
    - [`d:/PROTOTIPE/.agents/skills/component-creator/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/component-creator/SKILL.md) [MODIFY]

* **[x] ~~Tarea CORE-205: InyecciÃ³n de 20 Nuevos Componentes AtÃ³micos (Fase 1: Comp. 1-10)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: CreaciÃ³n fÃ­sica de las 10 primeras fichas tÃ©cnicas `.md` y sus respectivos sandboxes interactivos `.jsx` en el dev-dashboard (incluyendo buscadores con marcas en caliente, inputs de auto-redimensiÃ³n, inputs de contraseÃ±a interactivos con HSL, inputs telefÃ³nicos con CustomSelect, desplegables con buscador interno, barra de progreso en forma de probeta de vidrio, tarjetas rascables Canvas, tarjetas de crÃ©dito 3D flips, zonas de arrastre de archivos y relojes de reenvÃ­o OTP). Se mapearon en ComponentSandbox.jsx, se actualizaron en el mapa semÃ¡ntico y se regenerÃ³ el catÃ¡logo completo README.md. El build de producciÃ³n compila al 100% de forma limpia.
  - Archivos:
    - `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/` [CREATE 10 carpetas/fichas md]
    - `Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/` [CREATE 10 archivos jsx]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]

* **[x] ~~Tarea CORE-204: InyecciÃ³n Fase 5 Completa (Comp. 40-50) de Tarjetas, Contenedores y Micro-Efectos Decorativos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: CreaciÃ³n de fichas tÃ©cnicas `.md` y sandboxes interactivos `.jsx` individuales en el dev-dashboard para los 11 componentes atÃ³micos finales de la Fase 5 (incluyendo tarjetas 3D tilt, contenedores con halos luminosos, canvas de partÃ­culas, confeti dinÃ¡mico, texto tipogrÃ¡fico wave y estrellas interactivas). Se corrigieron los paths de imports de SandboxLayout a rutas relativas directas, se mapearon en ComponentSandbox.jsx y se actualizÃ³ el catÃ¡logo README.md. El build de producciÃ³n se compilÃ³ al 100% de manera perfecta y sin errores.
  - Archivos:
    - `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/` [CREATE 11 carpetas/fichas md]
    - `Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/` [CREATE 11 archivos jsx]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-203: InyecciÃ³n Fase 4 Completa (Comp. 31-40) de Animaciones de Carga y Skeletons~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: CreaciÃ³n de fichas tÃ©cnicas `.md` y sandboxes interactivos `.jsx` individuales en el dev-dashboard para los 10 componentes atÃ³micos de la Fase 4 (cargadores, loaders, spinners y skeletons progresivos). Se indexaron dinÃ¡micamente en el catÃ¡logo del README.md, se mapearon en ComponentSandbox.jsx y se actualizaron el GPS semÃ¡ntico y las bitÃ¡coras. El build de producciÃ³n se compilÃ³ de forma exitosa y sin warnings.
  - Archivos:
    - `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/` [CREATE 10 carpetas/fichas md]
    - `Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/` [CREATE 10 archivos jsx]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-202: InyecciÃ³n de Fase 3 (Comp. 21-30) y Ajustes de Solapamiento en SlideToUnlockButton~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: ImplementaciÃ³n e inyecciÃ³n exitosa de la Fase 3 completa (Componentes 21-30) de indicadores, badges y progreso en la biblioteca de componentes y sus respectivos sandboxes interactivos en el dev-dashboard. Se corrigiÃ³ el error de solapamiento del texto guÃ­a con el tirador tÃ¡ctil del componente `SlideToUnlockButton` confinando el texto a un contenedor absolute con mÃ¡rgenes horizontales de holgura (`left-14 right-4`).
  - Archivos:
    - `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/` [CREATE 10 carpetas/fichas md]
    - `Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/` [CREATE 10 archivos jsx]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
    - [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/Slide_To_Unlock_Button/slide_to_unlock_button.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/Slide_To_Unlock_Button/slide_to_unlock_button.md) [MODIFY]

* **[x] ~~Tarea CORE-200: CatÃ¡logo de 50 Componentes AtÃ³micos Premium Interactivos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: FormulaciÃ³n, redacciÃ³n y almacenamiento fÃ­sico de la propuesta de 50 componentes atÃ³micos premium en React + Tailwind + Framer Motion. Registro semÃ¡ntico y fÃ­sico del archivo en el mapa de documentaciÃ³n de la IA y en el mapa fÃ­sico del proyecto.
  - Archivos:
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/propuesta_50_componentes_atomicos.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/propuesta_50_componentes_atomicos.md) [CREATE]
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-199: ReestructuraciÃ³n FÃ­sica Definitiva de Componentes AtÃ³micos y UnificaciÃ³n de Modales~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se movieron fÃ­sicamente las carpetas de documentaciÃ³n de los 7 componentes atÃ³micos a `Componentes_Atomicos/`. Se resolviÃ³ la duplicidad unificando `ModalBase` y `ModalTemplate` en `Componentes_Atomicos/Modal_Base_Premium/modal_base_premium.md` con `"type": "atom"` y `"technicalName": "ModalTemplate"`. Se eliminÃ³ la carpeta duplicada `Modales/Plantilla_Modal/`. Se ejecutÃ³ un script de saneamiento masivo sobre las dependencias internas de 33 archivos `.md` de documentaciÃ³n para corregir las rutas rotas. Se regenerÃ³ el `README.md` del catÃ¡logo de la biblioteca y se validÃ³ la compilaciÃ³n de producciÃ³n de Vite exitosamente.
  - Archivos:
    - [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
    - [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/Modal_Base_Premium/modal_base_premium.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/Modal_Base_Premium/modal_base_premium.md) [MODIFY]
    - [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/Modales/Plantilla_Modal/`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Modales/Plantilla_Modal/) [DELETE]
    - `Componentes_Atomicos/` (7 carpetas reubicadas) [MOVE]

* **[x] ~~Tarea CORE-198: SincronizaciÃ³n y Registro Completo de Componentes AtÃ³micos e Integridad de Biblioteca~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Regresados los directorios fÃ­sicos de componentes atÃ³micos a sus ubicaciones originales para evitar la ruptura de dependencias en 33 manifiestos cruzados en disco. Ajustados los encabezados de cÃ³digo de `modal_base_premium.md` y `toast_notification.md` al estÃ¡ndar del linter. Regenerado dinÃ¡micamente el Ã­ndice `README.md` de la biblioteca mediante script automÃ¡tico para enlazar todas las fichas del monorepo, y registrado `Toast_Notification` y `Modal_Base_Premium` en la constante `COMPONENT_META` de `ComponentSandbox.jsx` para pasar exitosamente la compilaciÃ³n y validaciÃ³n de producciÃ³n.
  - Archivos:
    - [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
    - [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/Modal_Base_Premium/modal_base_premium.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/Modal_Base_Premium/modal_base_premium.md) [MODIFY]
    - [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/Toast_Notification/toast_notification.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/Toast_Notification/toast_notification.md) [MODIFY]

* **[x] ~~Tarea CORE-197: IntegraciÃ³n y Filtro de Componentes AtÃ³micos (Ãtomos) en Biblioteca del Dashboard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se incorporÃ³ soporte a la nueva categorÃ­a de Componentes AtÃ³micos ("Ãtomos", tipo `atom`) en la interfaz del Dashboard. Se importÃ³ el Ã­cono `Atom` de lucide-react y se inyectÃ³ una pestaÃ±a en el layout horizontal de filtros rÃ¡pidos. Se inyectÃ³ el color del badge y el estilo de la secciÃ³n lateral en el Ã¡rbol de categorÃ­as de componentes. Se reiniciÃ³ el daemon Node de `server.js` para servir la categorÃ­a en el API y se blindÃ³ la nube de etiquetas filtrando el tag `atom` para evitar duplicaciÃ³n.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]
    - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [RESTART]

* **[x] ~~Tarea CORE-196: AcordeÃ³n Exclusivo y Colapso Interactivo en Biblioteca de Componentes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: ImplementaciÃ³n de acordeÃ³n exclusivo y colapso interactivo en el Ã¡rbol de categorÃ­as de la Biblioteca de Componentes en el panel izquierdo (CORE-196). Al abrir una categorÃ­a se colapsan las demÃ¡s, y al hacer clic en una categorÃ­a abierta, esta se contrae.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-195: Algoritmo de Relevancia de BÃºsqueda y Ordenamiento DinÃ¡mico de Resultados~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: ImplementaciÃ³n de la puntuaciÃ³n de relevancia matemÃ¡tica `getRelevanceScore` para la bÃºsqueda en la biblioteca de componentes y optimizaciÃ³n del ordenamiento dinÃ¡mico de componentes y categorÃ­as segÃºn la exactitud y coincidencia de bÃºsqueda (CORE-195).
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-194: CorrecciÃ³n de Renderizado en Runtime de SelectorCalibreAlambre en Sandbox~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Corregido el bug de renderizado en runtime del Sandbox de SelectorCalibreAlambre, sustituyendo las opciones de objetos por strings simples en la configuraciÃ³n del control select `currencySymbol`, adaptÃ¡ndolo a la firma esperada por `ControlPanel`.
  - Archivos:
    - [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SelectorCalibreAlambreSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SelectorCalibreAlambreSandbox.jsx) [MODIFY]

* **[x] ~~Tarea CORE-192: AutomatizaciÃ³n Silenciosa del Protocolo de Integridad (Post-Change)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: AÃ±adida una nueva secciÃ³n al reglamento del agente (`AGENTS.md`) que establece la ejecuciÃ³n automÃ¡tica, autÃ³noma y transparente en segundo plano de la compilaciÃ³n de prueba y la sincronizaciÃ³n de archivos de control (`bitacora_cambios.md`, `mapa_aplicacion.md` y `tareas_pendientes.md`) tras toda ediciÃ³n de cÃ³digo o inyecciÃ³n.
  - Archivos:
    - [`.agents/AGENTS.md`](file:///d:/PROTOTIPE/.agents/AGENTS.md) [MODIFY]

* **[x] ~~Tarea CORE-191: PreselecciÃ³n y ReordenaciÃ³n de la pestaÃ±a Sandbox~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Movido el botÃ³n de Sandbox a la primera opciÃ³n en la fila de pestaÃ±as de detalles del componente e inicializado por defecto como la vista preseleccionada al tocar cualquier tarjeta de componente.
  - Archivos:
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-190: BÃºsqueda Difusa Tolerante y Correcciones del Ãrbol de NavegaciÃ³n~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: ImplementaciÃ³n de coincidencia de bÃºsqueda difusa y normalizada mediante normalizaciÃ³n de tildes (normalizeText), distancia de ediciÃ³n Levenshtein (getLevenshteinDistance) y divisiÃ³n por tokens. CorrecciÃ³n de bug visual del borde negro e inyecciÃ³n de soporte para colapsar los grupos fijos individualmente en el Ã¡rbol de navegaciÃ³n.
  - Archivos:
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-189: ReestructuraciÃ³n de la CategorizaciÃ³n de Componentes por Tipo~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: MigraciÃ³n de la organizaciÃ³n fÃ­sica basada en nichos por una estructura unificada basada en tipos principales (Componentes UI, MÃ³dulos, Hooks, Servicios). Se actualizÃ³ el endpoint del CLI backend `/api/library` y se refactorizÃ³ el menÃº de navegaciÃ³n lateral en el frontend para reflejar la categorizaciÃ³n por tipos fijos y delegar los nichos a chips/tags clicables.
  - Archivos:
    - [`d:\PROTOTIPE\Prototipe-CLI\server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-188: ImplementaciÃ³n, Registro y Saneamiento Responsivo de los 39 Componentes Simplificados (Verticales 11 a 23)~~**
  - Estatus: En progreso. (7 de 39 componentes completados - Verticales 11 y 12 finalizadas, Vertical 13 iniciada).
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: Pendiente
  - DescripciÃ³n: CreaciÃ³n de fichas tÃ©cnicas markdown, sandboxes interactivos y catalogaciÃ³n en README.md para los 39 componentes seleccionados bajo el estÃ¡ndar de responsividad mÃ³vil y prevenciÃ³n de desbordamientos. Abarca desde la vertical 11 (Insumos y Repuestos AgrÃ­colas) hasta la vertical 23 (Insumos Horeca B2B).
  - Archivos:
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/) [NEW 39 subfolders & files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/) [NEW 39 files]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\02_Tareas_Roadmap\control_creacion_componentes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/control_creacion_componentes.md) [MODIFY]

* **[x] ~~Tarea CORE-187: ImplementaciÃ³n, Registro y Saneamiento Responsivo de los 10 Componentes de Minimarkets y Alimentos (Vertical 10)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: CreaciÃ³n de fichas tÃ©cnicas markdown, sandboxes interactivos y registro en catÃ¡logo/README para la vertical `grocery_food`. Componentes: `SelectorCantidadGranel`, `AlertaVencimientoLotes`, `BuscadorCodigoPLU`, `CalculadoraCombosOfertas`, `FormularioAbastecimientoGondolas`, `SelectorHorariosRetiro`, `AdvertenciaNutricionalAlergenos`, `FormularioMermasDesperdicios`, `PlantillaComprasRecurrentes`, `CuadriculaOfertasDia`. Adicionalmente se realizaron correcciones de layout adaptativo, alineaciÃ³n horizontal y control de desbordamiento en viewports de portÃ¡tiles.
  - Archivos:
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Grocery_Food\`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Grocery_Food/) [NEW 10 subfolders & files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/) [NEW 10 files]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\02_Tareas_Roadmap\control_creacion_componentes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/control_creacion_componentes.md) [MODIFY]


* **[x] ~~Tarea CORE-186: CorrecciÃ³n de Filtrado e IndexaciÃ³n en Dashboard de la Vertical 9 (Wellness & Podology)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: ModificaciÃ³n de los manifiestos JSON de las fichas tÃ©cnicas markdown de Wellness, RefrigeraciÃ³n y Servicios TÃ©cnicos para estandarizar `targetPath`, `type` y `niches`. InyecciÃ³n de validaciÃ³n estricta y blindaje a futuro en el linter `verify_library_integrity.cjs` y en las instrucciones de las skills `component-creator` y `component-extractor`.
  - Archivos:
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Wellness_Podology\`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Wellness_Podology/) [MODIFY 10 manifest files]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Refrigeration_AC\`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Refrigeration_AC/) [MODIFY 10 manifest files]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Technical_Services\`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Technical_Services/) [MODIFY 10 manifest files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\scripts\verify_library_integrity.cjs`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY]
    - [`d:\PROTOTIPE\.agents\skills\component-creator\SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/component-creator/SKILL.md) [MODIFY]
    - [`d:\PROTOTIPE\.agents\skills\component-extractor\SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/component-extractor/SKILL.md) [MODIFY]

* **[x] ~~Tarea CORE-184: Saneamiento de Permisos Globales Obsoletos en config.json y Ajuste de Reglas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Saneamiento de las 11 rutas absolutas obsoletas (`D:\Aplicaciones`) en el bloque de permisos globales del archivo `config.json` para reflejar la ruta real del espacio de trabajo `D:\PROTOTIPE`, y adiciÃ³n de reglas de control de contraste y z-index en `AGENTS.md` y `SKILL.md`.
  - Archivos:
    - [`C:\Users\Sergio\.gemini\config\config.json`](file:///C:/Users/Sergio/.gemini/config/config.json) [MODIFY]
    - [`d:\PROTOTIPE\.agents\AGENTS.md`](file:///d:/PROTOTIPE/.agents/AGENTS.md) [MODIFY]
    - [`d:\PROTOTIPE\.agents\skills\component-creator\SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/component-creator/SKILL.md) [MODIFY]

* **[x] ~~Tarea CORE-185: InyecciÃ³n y Registro de los 10 Componentes de EstÃ©tica, PodologÃ­a y Bienestar (Vertical 9)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: CreaciÃ³n de fichas tÃ©cnicas markdown, sandboxes interactivos y registro en catÃ¡logo/README para la vertical `wellness_podology`. Componentes: `HistorialClinicoPodologia`, `MapaAnatomicoPie`, `SelectorServicioCabina`, `SelectorProfesionalStaff`, `ConsentimientoFirmaDigital`, `SelectorAceitesEsenciales`, `RegistroEsterilizacionAutoclave`, `ProgramadorSesionesPaquete`, `TarjetasProductosPostCuidado`, `VisorAnalisisPisada`.
  - Archivos:
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Wellness_Podology\`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Wellness_Podology/) [NEW 10 subfolders & files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/) [NEW 10 files]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\02_Tareas_Roadmap\control_creacion_componentes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/control_creacion_componentes.md) [MODIFY]

* **[x] ~~Tarea CORE-183: InyecciÃ³n y Registro de los 10 Componentes de TapicerÃ­a y RestauraciÃ³n de Muebles (Vertical 8)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: CreaciÃ³n de fichas tÃ©cnicas markdown, sandboxes interactivos y registro en catÃ¡logo/README para la vertical `furniture_repair`. Componentes: `SelectorTelasTexturas`, `CalculadoraMetrajeTela`, `SelectorDensidadEspuma`, `CargadorFotosRestauracion`, `SelectorAcabadoPatas`, `SeguimientoFasesRestauracion`, `SelectorEstiloCosturas`, `CalculadoraFleteMuebles`, `ManualCuidadoTapiceria`, `ToggleImpermeabilizacion`.
  - Archivos:
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Furniture_Repair\`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Furniture_Repair/) [NEW 10 subfolders & files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/) [NEW 10 files]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-182: InyecciÃ³n y Registro de los 10 Componentes de LavanderÃ­as y TintorerÃ­as (Vertical 7)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: CreaciÃ³n de fichas tÃ©cnicas markdown, sandboxes interactivos y registro en catÃ¡logo/README para la vertical `laundry`. Componentes: `SelectorTipoPrendaLavado`, `CalculadoraLavadoKilos`, `ProgramadorRutasDomicilio`, `FichaReporteManchas`, `SelectorFraganciaSuavizante`, `TarjetaSesionAutoservicio`, `BuscadorPercherosRopa`, `SelectorVelocidadServicio`, `SaldoPuntosFidelizacion`, `CuadriculaPrendasOlvidadas`.
  - Archivos:
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Laundry\`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Laundry/) [NEW 10 subfolders & files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/) [NEW 10 files]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-179: Blindaje de Sandboxes y SincronizaciÃ³n de Metadatos de Nicho~~**

  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se corrigiÃ³ la clasificaciÃ³n de nicho de los 10 componentes de Contratistas y ConstrucciÃ³n agregando las propiedades "type" y "niches" en sus manifiestos markdown para garantizar el filtrado por vertical. Se realizÃ³ una auditorÃ­a completa del monorepo eliminando los Ãºltimos rastros de alerts, prompts y confirms nativos del navegador en los playgrounds, reemplazÃ¡ndolos con el hook de confirmaciÃ³n context-promesificado unificado (`useAlertConfirm`). Se optimizÃ³ el backend del proveedor de alertas para permitir llamadas directas (`confirm(...)`) mediante patrÃ³n de objeto ejecutable. Adicionalmente, se eliminÃ³ la definiciÃ³n local obsoleta e inconsistente de `CustomSelect` de `App.jsx`, reemplazÃ¡ndola con la importaciÃ³n oficial del componente premium reusable `CustomSelect.jsx`.
  - Archivos:
    - [App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
    - [CalculadoraPresupuestoObra](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Contractors/Calculadora_Presupuesto_Obra/calculadora_presupuesto_obra.md) [MODIFY]
    - [SelectorEspecialidadContratistas](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Contractors/Selector_Especialidad_Contratistas/selector_especialidad_contratistas.md) [MODIFY]
    - [BitacoraDiariaObra](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Contractors/Bitacora_Diaria_Obra/bitacora_diaria_obra.md) [MODIFY]
    - [CalculadoraDosificacionConcreto](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Contractors/Calculadora_Dosificacion_Concreto/calculadora_dosificacion_concreto.md) [MODIFY]
    - [CronogramaHitosProyecto](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Contractors/Cronograma_Hitos_Proyecto/cronograma_hitos_proyecto.md) [MODIFY]
    - [SelectorAlquilerAndamios](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Contractors/Selector_Alquiler_Andamios/selector_alquiler_andamios.md) [MODIFY]
    - [VisorPlanosDiseno](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Contractors/Visor_Planos_Diseno/visor_planos_diseno.md) [MODIFY]
    - [SolicitudPedidoMateriales](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Contractors/Solicitud_Pedido_Materiales/solicitud_pedido_materiales.md) [MODIFY]
    - [GraficoPresupuestoVsGasto](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Contractors/Grafico_Presupuesto_Vs_Gasto/grafico_presupuesto_vs_gasto.md) [MODIFY]
    - [ChecklistSeguridadEPP](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Contractors/Checklist_Seguridad_EPP/checklist_seguridad_epp.md) [MODIFY]
    - [AlertConfirmContext.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/common/AlertConfirmContext.jsx) [MODIFY]
    - [ReservasAgendaCitasSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ReservasAgendaCitasSandbox.jsx) [MODIFY]
    - [SelectorBoletasRifasSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SelectorBoletasRifasSandbox.jsx) [MODIFY]
    - [CajaDiariaPOSSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CajaDiariaPOSSandbox.jsx) [MODIFY]
    - [CreditosSaldosSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CreditosSaldosSandbox.jsx) [MODIFY]
    - [FacturacionComisionalSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/FacturacionComisionalSandbox.jsx) [MODIFY]
    - [OmnicanalidadWhatsAppSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/OmnicanalidadWhatsAppSandbox.jsx) [MODIFY]
    - [OrdenesTrabajoEquiposSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/OrdenesTrabajoEquiposSandbox.jsx) [MODIFY]
    - [POSExpressScannerSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/POSExpressScannerSandbox.jsx) [MODIFY]
    - [ReservasAgendaSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ReservasAgendaSandbox.jsx) [MODIFY]

* **[x] ~~Tarea CORE-181: InyecciÃ³n y Registro de los 10 Componentes de CarpinterÃ­a y Muebles (Vertical 6)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se diseÃ±aron, implementaron, catalogaron y documentaron los 10 componentes de la vertical `carpentry` en una subcarpeta dedicada fÃ­sica `Carpentry` para mantener organizada la biblioteca de componentes. Los componentes son: `OptimizadorCorteTableros`, `SelectorMaderaAcabado`, `CalculadoraMueblesMedida`, `SelectorHerrajesAccesorios`, `TablaDespieceMateriales`, `AgendamientoTomaMedidas`, `SelectorModulosCocina`, `GaleriaRendersMuebles`, `SelectorAperturaPuertas` y `CalculadorTarifaInstalacion`. Todos los componentes cumplen con los estÃ¡ndares de HSL adaptativo, exclusiÃ³n de selectores nativos, confirmaciÃ³n con `useAlertConfirm` en acciones crÃ­ticas, y sandboxes interactivos individuales en el dashboard.
  - Archivos: 
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Carpentry\`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Carpentry/) [NEW 10 subfolders & files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/) [NEW 10 files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\02_Tareas_Roadmap\control_creacion_componentes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/control_creacion_componentes.md) [MODIFY]

* **[x] ~~Tarea CORE-180: InyecciÃ³n y Registro de los 10 Componentes de Alquiler de Maquinaria y Equipos (Vertical 5)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se diseÃ±aron, implementaron, catalogaron y documentaron los 10 componentes de la vertical `machinery_rental` en una subcarpeta dedicada fÃ­sica `Machinery_Rental` para mantener organizada la biblioteca de componentes. Los componentes son: `CalendarioRangoAlquiler`, `CalculadoraTarifasAlquiler`, `ChecklistInspeccionMaquinaria`, `TarjetasOperadoresAutorizados`, `CalculadoraFletesTransporte`, `SelectorAccesoriosMaquinaria`, `MonitorHorasAlertas`, `SelectorSeguroDanos`, `DeslizadorCapacidadTonelaje` y `TarjetaLogisticaDespacho`. Todos los componentes cumplen con los estÃ¡ndares de HSL adaptativo, uso de `CustomSelect` para dropdowns, `useAlertConfirm` en acciones crÃ­ticas, y sandboxes interactivos en el dashboard.
  - Archivos: 
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Machinery_Rental\`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Machinery_Rental/) [NEW 10 subfolders & files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/) [NEW 10 files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\02_Tareas_Roadmap\control_creacion_componentes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/control_creacion_componentes.md) [MODIFY]

* **[x] ~~Tarea CORE-178: InyecciÃ³n y Registro de los 10 Componentes de Contratistas y ConstrucciÃ³n (Vertical 4)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se diseÃ±aron, implementaron, catalogaron y documentaron los 10 componentes de la vertical `contractors` en una subcarpeta dedicada fÃ­sica `Contractors` para mantener organizada la biblioteca de componentes. Los componentes son: `CalculadoraPresupuestoObra`, `SelectorEspecialidadContratistas`, `BitacoraDiariaObra`, `CalculadoraDosificacionConcreto`, `CronogramaHitosProyecto`, `SelectorAlquilerAndamios`, `VisorPlanosDiseno`, `SolicitudPedidoMateriales`, `GraficoPresupuestoVsGasto` y `ChecklistSeguridadEPP`. Todos los componentes cumplen con los estÃ¡ndares de HSL adaptativo, exclusiÃ³n de selectores nativos, confirmaciÃ³n con `useAlertConfirm` en acciones crÃ­ticas, y sandboxes interactivos individuales en el dashboard.
  - Archivos: 
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Contractors\`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Contractors/) [NEW 10 subfolders & files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/) [NEW 10 files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\02_Tareas_Roadmap\control_creacion_componentes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/control_creacion_componentes.md) [MODIFY]


* **[x] ~~Tarea CORE-176: InyecciÃ³n y Registro de los 10 Componentes de ClimatizaciÃ³n e HVAC (RefrigeraciÃ³n y ClimatizaciÃ³n)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se diseÃ±aron, implementaron, catalogaron y documentaron los 10 componentes de la vertical `refrigeration_ac` en una subcarpeta dedicada fÃ­sica `Refrigeration_AC` para mantener organizada la biblioteca de componentes. Los componentes son: `CalculadoraCargaBTU`, `SelectorTipoAireAcondicionado`, `ProgramadorMantenimientoPreventivo`, `EstimadorAhorroEnergetico`, `SelectorRefrigeranteRepuestos`, `ListaDiagnosticoFallas`, `TablaEspecificacionesHVAC`, `SelectorTramosTuberia`, `TarjetaGarantiaContratos` y `SelectorTermostatosSensores`. Todos los componentes cumplen con los estÃ¡ndares de HSL adaptativo, uso de `CustomSelect` para dropdowns, `useAlertConfirm` en acciones crÃ­ticas, y protecciÃ³n de clipping visual (py-4 inyectado en el carrusel horizontal). Se crearon sus 10 sandboxes interactivos correspondientes en el dashboard.
  - Archivos: 
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Refrigeration_AC\`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Refrigeration_AC/) [NEW 10 subfolders & files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/) [NEW 5 files + 5 files previously created]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\02_Tareas_Roadmap\control_creacion_componentes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/control_creacion_componentes.md) [MODIFY]

* **[x] ~~Tarea CORE-175: InyecciÃ³n y Registro de los 5 Componentes Restantes de Mecanizado (Servicios TÃ©cnicos)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se diseÃ±aron, implementaron, catalogaron y documentaron los 5 componentes restantes de la vertical `technical_services`: `SelectorEspecificacionRosca`, `SeguimientoOrdenesProduccion`, `CalculadoraPesoMateriales`, `SelectorLotesVolumen` y `FormularioSolicitudRectificacion`. Los componentes implementan el linter estÃ©tico al 100% sin selectores HTML nativos y con confirmaciones mediante `useAlertConfirm` en el formulario. Se inyectaron sus playgrounds sandboxes correspondientes en el dashboard.
  - Archivos: 
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Technical_Services\`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Technical_Services/) [NEW 5 files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/) [NEW 5 files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\02_Tareas_Roadmap\control_creacion_componentes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/control_creacion_componentes.md) [MODIFY]

* **[x] ~~Tarea CORE-174: InyecciÃ³n y Registro de 5 Componentes de Mecanizado de PrecisiÃ³n (Servicios TÃ©cnicos)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se diseÃ±aron, implementaron, catalogaron y documentaron los primeros 5 componentes de la vertical `technical_services`: `CargadorPlanosCAD`, `CalculadoraCotizacionMecanizado`, `SelectorProcesosMecanizado`, `SelectorTratamientoAcabado` y `ReporteControlCalidad`. Todos los componentes cumplen con los estÃ¡ndares de HSL adaptativo, exclusiÃ³n de selectores nativos (uso de CustomSelect) y prevenciÃ³n de clipping en scroll (py-4 inyectado en el carrusel horizontal). Asimismo, se crearon sus respectivos sandboxes interactivos y se indexaron en el dashboard.
  - Archivos: 
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Technical_Services\`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Technical_Services/) [NEW 5 files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/) [NEW 5 files]
    - [`d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
    - [`d:\PROTOTIPE\Documentacion PROTOTIPE\02_Tareas_Roadmap\control_creacion_componentes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/control_creacion_componentes.md) [MODIFY]

* **[x] ~~Tarea CORE-173: AlineaciÃ³n de Meta-Skill de CreaciÃ³n de Automatizaciones (crear-skill-prototipe)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se actualizÃ³ la meta-skill `crear-skill-prototipe` inyectando las directivas obligatorias de calidad premium (ausencia de placeholders, HSL adaptativo de marca blanca, anti-clipping en contenedores de scroll, y nomenclatura estructurada). Esto garantiza que cualquier nueva automatizaciÃ³n creada en el futuro obligue a la IA a seguir las mismas pautas de calidad de interfaz y robustez tÃ©cnica.
  - Archivos: [`d:\PROTOTIPE\.agents\skills\crear-skill-prototipe\SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/crear-skill-prototipe/SKILL.md) [MODIFY]

* **[x] ~~Tarea CORE-172: IntegraciÃ³n de Linter Visual, EstÃ©tico y de Robustez Automatizado en Prebuild~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se expandiÃ³ el script de prebuild `verify_library_integrity.cjs` para actuar como un linter automatizado. Analiza de forma estricta los archivos markdown de biblioteca y los playgrounds sandboxes `.jsx` del dashboard buscando: colores estÃ¡ticos oscuros quemados (`bg-slate-900`/`950`, `border-slate-800`/`850`/`900`), contenedores con scroll (`overflow-x-auto`/`overflow-y-auto`) carentes de paddings de holgura, selectores nativos `<select>`, placeholders en cÃ³digo (`// ...`) y tÃ­tulos de cÃ³digo incompatibles con el parseador del dashboard.
  - Archivos: [`Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY]

* **[x] ~~Tarea CORE-171: SincronizaciÃ³n y Blindaje de Skills de Componentes y Sandboxes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se actualizaron y alinearon las 4 skills centrales del ecosistema de componentes (`component-creator`, `component-extractor`, `portar-componente` y `sandbox-integrator`) inyectando las directivas estrictas de adaptaciÃ³n de color con variables HSL de marca blanca y prevenciÃ³n de truncamiento/clipping visual de elementos y sombras de elevaciÃ³n en contenedores y carruseles con scroll.
  - Archivos: [`d:\PROTOTIPE\.agents\skills\component-creator\SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/component-creator/SKILL.md) [MODIFY], [`d:\PROTOTIPE\.agents\skills\component-extractor\SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/component-extractor/SKILL.md) [MODIFY], [`d:\PROTOTIPE\.agents\skills\portar-componente\SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/portar-componente/SKILL.md) [MODIFY], [`d:\PROTOTIPE\.agents\skills\sandbox-integrator\SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/sandbox-integrator/SKILL.md) [MODIFY]

* **[x] ~~Tarea CORE-170: CreaciÃ³n e InyecciÃ³n de los 4 Componentes Restantes de Retail de Moda y Sandboxes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se diseÃ±aron, implementaron, catalogaron y documentaron los 4 componentes restantes del nicho `retail_clothing`: `DeslizadorProductosSimilares`, `IconosCuidadoPrendas`, `PestanasFiltroTemporada` e `InsigniasDescuentoVolumen` utilizando variables de diseÃ±o adaptativo HSL de marca blanca. Asimismo, se inyectaron sus respectivos playgrounds interactivos en el dashboard de desarrollo central y se registraron en el mapa de componentes y el GPS de documentaciÃ³n semÃ¡ntica.
  - Archivos: [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/) [NEW 4 files], [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/) [NEW 4 files], [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]

* **[x] ~~Tarea CORE-169: CreaciÃ³n del Componente SelectorTallasColores y Sandbox en Dashboard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se diseÃ±Ã³, implementÃ³ y catalogÃ³ el componente `SelectorTallasColores` para selecciÃ³n de variantes premium con validaciÃ³n de stock en tiempo real. Se inyectÃ³ su sandbox interactivo `SelectorTallasColoresSandbox.jsx` en el dashboard y se mapearon los alias y documentaciÃ³n correspondientes.
  - Archivos: [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Selector_Tallas_Colores/selector_tallas_colores.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Selector_Tallas_Colores/selector_tallas_colores.md) [NEW], [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SelectorTallasColoresSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SelectorTallasColoresSandbox.jsx) [NEW], [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]

* **[x] ~~Tarea CORE-168: ClasificaciÃ³n y ReorganizaciÃ³n de Manifiestos de Componentes por Nicho~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se creÃ³ y ejecutÃ³ el script `classify_existing_library.js` para inyectar en lote las propiedades de metadatos `"niches"` y `"type"` en los manifiestos JSON embebidos de las fichas markdown de los 51 componentes interactivos existentes en el monorepo. Se garantizÃ³ la consistencia de los manifiestos a travÃ©s del linter de integridad y compilaciones del dashboard exitosas.
  - Archivos: [`Prototipe-CLI/scripts/classify_existing_library.js`](file:///d:/PROTOTIPE/Prototipe-CLI/scripts/classify_existing_library.js) [NEW], Fichas `.md` de componentes en [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/) y [`Documentacion PROTOTIPE/09_Modulos_Completos/`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/) [MODIFY 51 files]

* **[x] ~~Tarea CORE-167: Dashboard de Biblioteca Multi-Dimensional Blindado y Futuro-Proof~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se refactorizÃ³ la carga de la biblioteca de componentes en `server.js` (`/api/library`) para extraer y parsear en tiempo real los manifiestos JSON de las fichas markdown. Para garantizar la eficiencia, se implementÃ³ una cachÃ© en memoria basada en la fecha de modificaciÃ³n fÃ­sica de cada archivo (`mtime`). En el frontend (`ComponentLibraryView.jsx`), se integrÃ³ el filtrado dinÃ¡mico multi-dimensional conectando el selector dropdown de nicho comercial con la API `/api/niches` (blindando la biblioteca ante futuras adiciones) y expandiendo los tabs de filtrado por tipo a 5 segmentos: Todos, UI, MÃ³dulos, Hooks y Servicios.
  - Archivos: [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-166: Robustecimiento y GestiÃ³n del Ciclo de Vida del Servidor CLI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se implementÃ³ un sistema de almacenamiento en cachÃ© en memoria (`cachedNiches`) con invalidaciÃ³n reactiva para el catÃ¡logo de nichos comerciales en `server.js` (`/api/niches`), eliminando lecturas repetitivas al disco. Se inyectÃ³ control de aborto ante desconexiÃ³n de sockets SSE (`req.on('close')`) en el endpoint de sincronizaciÃ³n y despliegue global de cores (`/api/git/sync-core-to-clients-stream`), deteniendo subprocesos en curso y revirtiendo de forma segura el estado fÃ­sico del repositorio git a su rama de origen y stashes correspondientes. De igual modo, se integrÃ³ el control de abortos y liberaciÃ³n de locks concurrentes en el inyector de componentes (`/api/library/inject/stream`) y se blindÃ³ el listado dinÃ¡mico coloreado de endpoints de Express a la inicializaciÃ³n del servidor.
  - Archivos: [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-165: Sistema de AdministraciÃ³n y GestiÃ³n DinÃ¡mica de Nichos Comerciales~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se diseÃ±Ã³ e implementÃ³ un sistema completo (Full Stack) para la gestiÃ³n, modificaciÃ³n y creaciÃ³n de verticales de negocio (nichos). En el backend, se creÃ³ `config/niches_metadata.json` para almacenar metadatos visuales (emojis y nombres formateados) de forma segura y se expandieron los endpoints de `server.js` con un juego CRUD completo (GET, POST, PUT, DELETE). En el frontend del `dev-dashboard`, se creÃ³ el componente modular e independiente `NichesManagerPanel.jsx` que permite buscar, ver, crear, editar y eliminar nichos con atributos dinÃ¡micos (de tipo texto o dropdown con opciones delimitadas por comas) y confirmaciÃ³n de borrado asÃ­ncrona segura.
  - Archivos: [`Prototipe-CLI/config/niches_metadata.json`](file:///d:/PROTOTIPE/Prototipe-CLI/config/niches_metadata.json) [NEW], [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/components/admin/NichesManagerPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/NichesManagerPanel.jsx) [NEW], [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-164: RediseÃ±o Unificado de Logos y Nombres en Marquesina de Marcas Infinita~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se rediseÃ±Ã³ el componente `InfiniteLogoMarquee` en la biblioteca (`marquesina_marcas.md`) para mostrar Ãºnicamente los logos de las marcas, incrementando su tamaÃ±o a tarjetas de `w-44 h-20` con logos de `max-w-[110px] max-h-[40px]`. Se implementÃ³ una micro-animaciÃ³n interactiva de rebote y destello de sombra resplandeciente (`clickPop`) que se dispara temporalmente al hacer clic o tap sobre cada tarjeta. Se inyectÃ³ este comportamiento y las URLs SVG estables de marcas deportivas en `InfiniteLogoMarqueeSandbox.jsx`.
  - Archivos: [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Marquesina_Marcas/marquesina_marcas.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Marquesina_Marcas/marquesina_marcas.md) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/InfiniteLogoMarqueeSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/InfiniteLogoMarqueeSandbox.jsx) [MODIFY]

* **[x] ~~Tarea CORE-163: CreaciÃ³n y CatalogaciÃ³n de Componente CarrucelProductos y Sandbox~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se creÃ³ la ficha tÃ©cnica y cÃ³digo JSX portable del componente `CarrucelProductos` en la biblioteca (`carrusel_productos.md`). Se implementÃ³ e inyectÃ³ un playground de simulaciÃ³n interactivo (`CarrucelProductosSandbox.jsx`) en el dashboard central (`dev-dashboard`) con controles de autoplay, dots y flechas, y un registro de actividad de carrito. Se indexÃ³ el componente en el catÃ¡logo `README.md` de la biblioteca y en el mapa semÃ¡ntico `mapa_documentacion_ia.md`. Posteriormente se realizÃ³ un rediseÃ±o estÃ©tico premium de las tarjetas, dotÃ¡ndolas de esquinas mÃ¡s redondeadas (`rounded-[24px]` y `rounded-[20px]` en imÃ¡genes), elevaciones y transiciones hover dinÃ¡micas de borde, y soporte dinÃ¡mico para imÃ¡genes reales (poblando el playground con fotos de prueba de alta resoluciÃ³n de Unsplash).
  - Archivos: [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Carrucel_Productos/carrusel_productos.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Carrucel_Productos/carrusel_productos.md) [NEW], [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CarrucelProductosSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CarrucelProductosSandbox.jsx) [NEW], [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY], [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-162: AuditorÃ­a, Saneamiento e IntegraciÃ³n de MÃ³dulo Agendamiento BarberÃ­a en el Sandbox~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se auditÃ³ a detalle la documentaciÃ³n del MÃ³dulo de Agendamiento de Citas para BarberÃ­a (modulo_agendamiento_barberia.md y README.md) para alineaciÃ³n con las directivas de marca blanca. Se implementÃ³ e integrÃ³ un playground de simulaciÃ³n interactivo (`ModuloAgendamientoBarberiaSandbox.jsx`) en el dashboard de desarrollo central (`dev-dashboard`), implementando vistas de dÃ­a, semana y mes, cronograma lateral, indicador de ocupaciÃ³n en base a slots libres, formulario de citas con validaciÃ³n semÃ¡ntica e inyecciÃ³n de mÃ¡scara HSL adaptativa. Se registraron los mapeos y metadatos correspondientes en `ComponentSandbox.jsx` y se indexÃ³ en el catÃ¡logo y mapa semÃ¡ntico.
  - Archivos: [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ModuloAgendamientoBarberiaSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ModuloAgendamientoBarberiaSandbox.jsx) [NEW], [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY], [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-161: ConversiÃ³n de Modal de Comisiones Acumuladas a PÃ¡gina Independiente~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se convirtiÃ³ el antiguo modal de comisiones acumuladas en una pÃ¡gina/pestaÃ±a completa independiente (`ComisionesPanel.jsx`) registrada en el menÃº de Finanzas del Dashboard. El nuevo panel integra mÃ©tricas de efectividad de cobro, desglose de aportes acumulados por cliente (con barras de progreso interactivas), tabla paginada y ordenable de transacciones con buscador por cliente/periodo, filtros de estado, y exportador consolidado a PDF. Adicionalmente, se corrigiÃ³ el posicionamiento y comportamiento del Side Drawer lateral de clientes, dotÃ¡ndolo de un overlay con backdrop blur y un cierre por clic exterior que se extiende de forma fluida a toda la altura de la pantalla, resolviendo bugs lÃ³gicos y de renderizado en `tab-content-enter`.
  - Archivos: [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComisionesPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComisionesPanel.jsx) [NEW], [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]


* **[x] ~~Tarea CORE-160: Aislamiento LÃ³gico de Cores y TelemetrÃ­a de Desarrollo en el Dashboard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-02
  - Fecha de finalizaciÃ³n: 2026-07-02
  - DescripciÃ³n: Se separaron los Cores de desarrollo de los listados de Clientes SaaS en el CRM y facturaciÃ³n para purificar las vistas del dashboard central. Se implementÃ³ en "Plantillas Core" una secciÃ³n de Monitoreo & TelemetrÃ­a de Desarrollo en tiempo real asociada al ID del Core en Firestore (`ventas-smartfix`), mostrando estado de pings, Ãºltima actividad y fallos especÃ­ficos de desarrollo local sin afectar las bases de datos de producciÃ³n. Asimismo, se inyectaron controles locales (Desplegar en Local, Detener, Ir a Local) y el modal de gestiÃ³n/drift directo en la tarjeta, y se implementÃ³ un sistema de asignaciÃ³n de puertos dinÃ¡micos y deterministas en `server.js` (`5100 + hash(clientId)`) para prevenir colisiones en localhost.
  - Archivos: [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [MODIFY], [`Plantillas Core/App Ventas/vite.config.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/vite.config.js) [MODIFY], [`Instancias Clientes/ventas/ventas-moni-app/vite.config.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/vite.config.js) [MODIFY]

* **[x] ~~Tarea CORE-159: CreaciÃ³n del Componente Reutilizable CircularDishMenu y Sandbox~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: Se desarrollÃ³ el componente gastronÃ³mico `CircularDishMenu` e integrÃ³ su playground de forma consolidada en `CircularDishMenuSandbox.jsx`. Se documentÃ³ en la biblioteca (`circular_dish_menu.md`) y se registrÃ³ en los Ã­ndices de catÃ¡logo y mapas.
  - Archivos: [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/Menus/CircularDishMenu/circular_dish_menu.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Menus/CircularDishMenu/circular_dish_menu.md) [NEW], [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CircularDishMenuSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CircularDishMenuSandbox.jsx) [NEW]

* **[x] ~~Tarea CORE-158: AlineaciÃ³n y SincronizaciÃ³n Completa de la DocumentaciÃ³n del Ecosistema~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: Se alinearon y sincronizaron los 29 archivos principales de la carpeta `Documentacion PROTOTIPE` (que incluyen guÃ­as visuales, manuales, decisiones de arquitectura, glosarios y diagramas Mermaid) con las nuevas capacidades del ecosistema multicore, auto-aprovisionamiento y telemetrÃ­a de facturaciÃ³n.
  - Archivos: [`Documentacion PROTOTIPE/`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/) [MODIFY 29 files]

* **[x] ~~Tarea CORE-157: ImplementaciÃ³n de Alternador de Modo Oscuro en Perfil de Cliente (App Ventas)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: Se agregÃ³ una tarjeta interactiva con un switch/toggle animado en Framer Motion dentro de la vista de ajustes del perfil del cliente (`ClientProfile.jsx`) conectada con `useAppConfigStore` para alternar entre el modo claro y oscuro en caliente en toda la aplicaciÃ³n.
  - Archivos: [`Plantillas Core/App Ventas/src/pages/client/ClientProfile.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientProfile.jsx) [MODIFY]

* **[x] ~~Tarea CORE-156: AuditorÃ­a TÃ©cnico Documental y Saneamiento General de los Mapas y BitÃ¡coras~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: AuditorÃ­a y saneamiento completo de `mapa_documentacion_ia.md`, `mapa_aplicacion.md` y `bitacora_cambios.md`. Se eliminaron bloques duplicados de cabecera y filas duplicadas de Levantamiento en la SecciÃ³n 5. Se reestructuraron las descripciones de `server.js` y `generator.js` en listas legibles y concisas, removiendo la narrativa densa. Se incorporaron referencias explÃ­citas a los nuevos endpoints (`cors-setup`), auditorÃ­as crÃ­ticas, `consistencyScore`, variables de NPM Drift, y el componente `HealthRadar.jsx`. Se corrigiÃ³ el encabezado de `CORE-148` en la bitÃ¡cora de cambios.
  - Archivos: [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY], [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-155: ImplementaciÃ³n de AuditorÃ­a de CompilaciÃ³n Vite, Consistencia del Core y ConfiguraciÃ³n CORS de Storage~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: ImplementaciÃ³n de la auditorÃ­a de compilaciÃ³n Vite asÃ­ncrona, desalineamiento y drift de dependencias NPM, score de consistencia matemÃ¡tica del Core, y automatizaciÃ³n de setup de CORS Storage. Se rediseÃ±Ã³ el panel de Drift en la UI con KPI de consistencia, lista de dependencias y visores de logs.
  - Archivos: [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-154: AuditorÃ­a TÃ©cnica CrÃ­tica, Blindaje y ExpansiÃ³n de server.js~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: SoluciÃ³n de 5 vulnerabilidades de seguridad y fugas de descriptores, inyecciÃ³n de locks concurrentes y keep-alives en SSE. ImplementaciÃ³n de la OpciÃ³n A: adiciÃ³n de endpoint `firebase/cors-setup` y refactorizaciÃ³n de `project/drift` con anÃ¡lisis de dependencias agregadas y compilaciÃ³n Vite dry-run.
  - Archivos: [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-153: Plan de Robustez y Blindaje TÃ©cnico del Generador de Instancias~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: RefactorizaciÃ³n y blindaje de `generator.js` para desacoplar metadatos comerciales acoplados de nichos, dinamizar la siembra inicial basada en archivos JSON de plantillas, corregir la doble escritura destructiva de `.firebaserc`, robustecer la inyecciÃ³n SEO y el procesamiento HSL/hex, aÃ±adir control de fallos en el procesador de imÃ¡genes Jimp con fallback a imagen por defecto y agregar un rollback automÃ¡tico fÃ­sico de directorios en caso de error durante el aprovisionamiento.
  - Archivos: [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CORE-152: DiseÃ±o y AuditorÃ­a Profunda del Wizard de Aprovisionamiento e IntegraciÃ³n Avanzada~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: AsignaciÃ³n de 3 subagentes paralelos y generaciÃ³n de 3 informes oficiales documentando la auditorÃ­a de seguridad del backend, la auditorÃ­a de rendimiento y E/S bloqueantes, y la propuesta funcional de UI/UX para el wizard de excelencia. Se indexaron en el mapa de documentaciÃ³n semÃ¡ntico y se registraron en la bitÃ¡cora de cambios.
  - Archivos: [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_seguridad_aprovisionamiento_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_seguridad_aprovisionamiento_2026.md) [NEW], [`Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/propuesta_wizard_aprovisionamiento_excelencia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/propuesta_wizard_aprovisionamiento_excelencia.md) [NEW], [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_rendimiento_aprovisionamiento_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_rendimiento_aprovisionamiento_2026.md) [NEW]

* **[x] ~~Tarea CORE-150: AutomatizaciÃ³n y Mejoras de Onboarding en el Asistente de Aprovisionamiento~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: ImplementaciÃ³n de cuatro mejoras de alto valor para agilizar el onboarding de clientes: (1) Campos opcionales para Email y ContraseÃ±a del administrador inicial. Si se especifican, el generador ejecuta de forma automatizada `scripts/seed_admin.js` en el servidor CLI para escribir directamente en Firebase Auth y Firestore sin necesidad de intervenciÃ³n manual posterior. (2) Campo opcional para Puerto Local de Vite personalizado, modificando `vite.config.js` dinÃ¡micamente y evitando colisiones de IndexedDB/Cookies en desarrollo local. (3) Campos rÃ¡pidos para WhatsApp del negocio y direcciÃ³n fÃ­sica de la sucursal inyectados directo en `config/settings` (incluyendo estructura pre-configurada de `deliverySettings.pickup`). (4) InyecciÃ³n de un botÃ³n interactivo "Generar Paleta AAA" en la pestaÃ±a de Branding del wizard, el cual realiza cÃ¡lculos matemÃ¡ticos iterativos de luminancia relativa basados en la especificaciÃ³n W3C WCAG 2.1, encontrando y aplicando de forma aleatoria paletas de colores premium (tanto en modo oscuro como claro) que aseguran un contraste Ã³ptimo `>= 7.0:1` tanto en el BotÃ³n Primario como en la relaciÃ³n Fondo vs Texto (garantizando un puntaje verde del 100% / AAA Excelente en ambos medidores). (5) ImplementaciÃ³n de una vista previa multidispositivo interactiva (MÃ³vil vs PC/Web) con selector en la cabecera del panel lateral, adaptando el renderizado a una interfaz de navegador web con barra de direcciÃ³n y sidebar lateral.
  - Archivos: [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-149: EliminaciÃ³n de Race Conditions en Login y Panel de Administrador~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: CorrecciÃ³n de tres race conditions asÃ­ncronas independientes que disparaban errores `Permission Denied` (403) falsos en la consola web de los clientes al intentar ingresar con usuarios no autorizados: (1) EliminaciÃ³n de `getDocFromServer` en `LoginPage.jsx` (competÃ­a con el flujo de des-autenticaciÃ³n). (2) AdiciÃ³n de un guard de renderizado `isAuthLoading` en `AdminHome.jsx` para evitar que se disparen peticiones analÃ­ticas y subscripciones de crÃ©ditos y productos a Firestore mientras se valida la sesiÃ³n. (3) Saneamiento en Firestore Rules mediante el helper `isFirstStart()` para permitir que la base de datos se autoconfigure en su primer inicio sin desatar deadlocks de permisos.
  - Archivos: [`Plantillas Core/App Ventas/src/pages/LoginPage.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY], [`Plantillas Core/App Ventas/src/pages/admin/AdminHome.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY], [`Plantillas Core/App Ventas/firestore.rules`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [MODIFY], [`Instancias Clientes/ventas/ventas-moni-app/src/pages/LoginPage.jsx`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/pages/LoginPage.jsx) [MODIFY], [`Instancias Clientes/ventas/ventas-moni-app/src/pages/admin/AdminHome.jsx`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/pages/admin/AdminHome.jsx) [MODIFY], [`Instancias Clientes/ventas/ventas-moni-app/firestore.rules`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/firestore.rules) [MODIFY]

* **[x] ~~Tarea CORE-148: CorrecciÃ³n de Vulnerabilidad CrÃ­tica de AutenticaciÃ³n de Administrador (Bypass de Registro)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: CorrecciÃ³n de una vulnerabilidad crÃ­tica en la autenticaciÃ³n del administrador en `LoginPage.jsx` (Core App Ventas, template-ventas e instancia activa ventas-moni-app) donde se utilizaba un operador OR (`isUserNotFound || !adminRegistered`) que permitÃ­a registrar cualquier email inexistente como administrador aunque ya hubiera uno registrado en el sistema. Se cambiÃ³ a operador AND (`isUserNotFound && !adminRegistered`) para deshabilitar registros posteriores al setup inicial. Adicionalmente, se corrigiÃ³ la lÃ³gica en `useAuthInit.js` que promovÃ­a automÃ¡ticamente y re-creaba la cuenta de administrador en Firestore para cualquier `firebaseUser` autenticado que no tuviera registro, convirtiÃ©ndose ahora en una comprobaciÃ³n estricta de base de datos que cierra sesiÃ³n y limpia el estado local ante usuarios sin privilegios.
  - Archivos: [`Plantillas Core/App Ventas/src/pages/LoginPage.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY], [`Plantillas Core/App Ventas/src/hooks/useAuthInit.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js) [MODIFY], [`Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY], [`Prototipe-CLI/templates/template-ventas/src/hooks/useAuthInit.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAuthInit.js) [MODIFY], [`Instancias Clientes/ventas/ventas-moni-app/src/pages/LoginPage.jsx`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/pages/LoginPage.jsx) [MODIFY], [`Instancias Clientes/ventas/ventas-moni-app/src/hooks/useAuthInit.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/hooks/useAuthInit.js) [MODIFY]

* **[x] ~~Tarea CORE-147: ImplementaciÃ³n AsÃ­ncrona SSE y Saneamiento del Asistente de Aprovisionamiento~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: Saneamiento del layout visual de Branding (remociÃ³n del mockup redundante e integraciÃ³n de mÃ©tricas WCAG 2.1 debajo del smartphone interactivo principal de forma condicional). IntegraciÃ³n de Server-Sent Events (SSE) para logs de stdout asÃ­ncronos y consola retro-futurista de tiempo real dentro del panel del asistente en `App.jsx`. AdiciÃ³n del input del costo unitario DIAN (`costoPorFacturaDian`) en la pestaÃ±a de MÃ³dulos, y bucle de auto-inyecciÃ³n fÃ­sica en lote de componentes y mÃ³dulos de biblioteca pos-creaciÃ³n.
  - Archivos: [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-146: AuditorÃ­a Detallada del Asistente de Aprovisionamiento~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: AuditorÃ­a integral de las pestaÃ±as Servidor, Branding y MÃ³dulos del Asistente de Aprovisionamiento. Se identificaron bugs de lÃ³gica en la comprobaciÃ³n de conexiÃ³n de Firebase (bypasseo del projectId), doble mockup renderizado, omisiÃ³n del input para costo DIAN y cuellos de botella por peticiones HTTP sÃ­ncronas de larga duraciÃ³n.
  - Archivos: [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_asistente_aprovisionamiento.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_asistente_aprovisionamiento.md) [MODIFY]

* **[x] ~~Tarea CORE-145: Blindaje de Seguridad en SincronizaciÃ³n, Concurrencia y Purgado del CLI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: IncorporaciÃ³n de locks de concurrencia para evitar race conditions, validaciones de contenciÃ³n de ruta (isPathContained) para mitigar Directory Traversal en borrado/copiado, saneamiento de case-sensitivity en Windows y uso de React Portals en modales para corregir posiciÃ³n vertical.
  - Archivos: [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [MODIFY]

* **[x] ~~Tarea CORE-144: Poda de Archivos Obsoletos de DocumentaciÃ³n en performCoreSync~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: CorrecciÃ³n de un fallo en el motor de sincronizaciÃ³n de plantillas del CLI (`Prototipe-CLI/server.js`) por el cual los archivos obsoletos/eliminados en la carpeta de documentaciÃ³n del Core de desarrollo (`Documentacion App [NombreCore]`) no eran podados (`pruned`) en la carpeta del CLI. Se aÃ±adiÃ³ la recolecciÃ³n de estos archivos en la funciÃ³n `performCoreSync` para emparejar la lÃ³gica con la API de cÃ¡lculo de drift.
  - Archivos: [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-143: SincronizaciÃ³n del Canal de TelemetrÃ­a de FacturaciÃ³n (Dual-Channel Telemetry)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: SoluciÃ³n a la falla de enrutamiento y CORS/fetch al reportar telemetrÃ­a simulada o manual desde el cliente. Se implementÃ³ una arquitectura de canal dual en `telemetryService.js` (Core App Ventas, template-ventas e instancia ventas-moni-app), que intenta escribir primero el reporte de facturaciÃ³n comisional (`reportesBilling`) e incidentes (`app_failures`) de forma directa a la base de datos de Firestore Central utilizando el SDK y las credenciales secundarias de `centralFirebaseService.js`, ofreciendo un fallback elÃ¡stico por HTTPS (Cloud Function) si falla. Esto permite que las pruebas de telemetrÃ­a lanzadas desde el Dashboard actualicen de inmediato los valores del cliente real sin colisiones de red.
  - Archivos: [`Plantillas Core/App Ventas/src/services/telemetryService.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/telemetryService.js) [MODIFY], [`Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js) [MODIFY], [`Instancias Clientes/ventas/ventas-moni-app/src/services/telemetryService.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/services/telemetryService.js) [MODIFY]

* **[x] ~~Tarea CORE-142: RediseÃ±o Interactivo y Modular del Radar de Salud (HealthRadar)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: ReconstrucciÃ³n del antiguo widget estÃ¡tico de salud en un componente independiente interactivo tipo sonar (HealthRadar.jsx). Implementa retÃ­cula circular con cÃ­rculos concÃ©ntricos y cuadrantes, barrido giratorio conic-gradient (con animaciÃ³n GPU), graficaciÃ³n de instancias como blips mediante coordenadas polares deterministas, filtrado dinÃ¡mico por Core, ficha de telemetrÃ­a individual de pings e incidentes, y atajo de navegaciÃ³n a la Consola de Errores.
  - Archivos: [`Central PROTOTIPE/dev-dashboard/src/components/admin/HealthRadar.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/HealthRadar.jsx) [NEW], [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

* **[x] ~~Tarea CORE-141: MÃ³dulo de Historial de Cobros y Cuentas Liquidadas (CobrosPanel)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: ConversiÃ³n del antiguo modal simple de comisiones cobradas en una pestaÃ±a/pÃ¡gina interactiva completa a pantalla completa (CobrosPanel.jsx). Se implementaron KPI cards con comisiones totales cobradas, promedio y collection rate, toggle de agrupaciÃ³n para consolidar el historial por cliente o detallado por periodo, buscador reactivo, filtros por aÃ±o, paginaciÃ³n e interacciÃ³n de reversiÃ³n de pagos con animaciones de carga. Adicionalmente, se rediseÃ±Ã³ la barra lateral lateral del Dashboard central en 5 categorÃ­as lÃ³gicas colapsables mediante transiciones de acordeÃ³n fluidas y menÃºs Popover flotantes de tipo glassmorphism a la derecha en modo colapsado para resolver de raÃ­z el desbordamiento vertical de elementos.
  - Archivos: [`Central PROTOTIPE/dev-dashboard/src/components/admin/CobrosPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CobrosPanel.jsx) [NEW], [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

* **[x] ~~Tarea CORE-140: MÃ³dulo de Recaudaciones y Cuentas por Cobrar (RecaudoPanel)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: ConversiÃ³n del antiguo modal simple de comisiones pendientes en una pestaÃ±a/pÃ¡gina interactiva completa a pantalla completa (RecaudoPanel.jsx). Se implementaron KPI cards con comisiones totales, deudas y efectividad de cobro, toggle de agrupaciÃ³n para consolidar la deuda por cliente (evitando overflows visuales) o por periodos individuales, paginaciÃ³n, filtros de vencimiento, Side Drawer de detalle del cliente con HSL dinÃ¡mico, generador dinÃ¡mico de plantillas de WhatsApp para cobranza rÃ¡pida y registro de pagos.
  - Archivos: [`Central PROTOTIPE/dev-dashboard/src/components/admin/RecaudoPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/RecaudoPanel.jsx) [NEW], [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-139: Saneamiento, Seguridad y Escalabilidad del Ecosistema~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-07-01
  - Fecha de finalizaciÃ³n: 2026-07-01
  - DescripciÃ³n: Corregir vulnerabilidad de lectura en firestore.rules (get/list), instalar html2canvas en package.json, reubicar jimp a dependencias en CLI, centralizar dinÃ¡micamente CLI_URL con variables de entorno, admitir puerto de entorno en CLI, habilitar auto-correcciÃ³n de rutas y portabilidad de disco para el validador de consistencia y registro de plantillas, e integrar el panel CoreSyncPanel para la SincronizaciÃ³n Masiva en Lote. Corregir falsos positivos del Drift Detector en el CLI ignorando diferencias de formato y nombres especÃ­ficos de package.json y enfocÃ¡ndose en cambios estructurales y dependencias lÃ³gicas. Se rediseÃ±Ã³ la UI del Sincronizador Masiva implementando buscador de texto interactivo por cliente/carpeta, filtros por estado ("Todos", "Desactualizados", "Sin Registrar") y controles de selecciÃ³n avanzada.
  - Archivos: [`Central PROTOTIPE/dev-dashboard/firestore.rules`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firestore.rules) [MODIFY], [`Central PROTOTIPE/dev-dashboard/package.json`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/package.json) [MODIFY], [`Prototipe-CLI/package.json`](file:///d:/PROTOTIPE/Prototipe-CLI/package.json) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/config.js`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/config.js) [NEW], [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`Prototipe-CLI/config.js`](file:///d:/PROTOTIPE/Prototipe-CLI/config.js) [MODIFY], [`Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-138: Desacoplamiento Multi-Core basado en Metadatos (Briefing & Flags)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-30
  - Fecha de finalizaciÃ³n: 2026-06-30
  - DescripciÃ³n: Implementar arquitectura guiada por metadatos (core-manifest.json) para que el Wizard del Briefing Studio y el Feature Flag Manager se autoconfiguren dinÃ¡micamente segÃºn el Core seleccionado.
  - Archivos: [`Plantillas Core/App Ventas/core-manifest.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/core-manifest.json) [NEW], [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx) [MODIFY]

* **[x] ~~Tarea CORE-137: InyecciÃ³n, Limpieza de Datos Demo, Borrado y ExportaciÃ³n por Cliente en Briefing Studio~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-29
  - Fecha de finalizaciÃ³n: 2026-06-29
  - DescripciÃ³n: Agregar botones interactivos premium para la inyecciÃ³n y limpieza rÃ¡pida de datos de prueba, la eliminaciÃ³n de sesiones guardadas en Firestore, y refactorizar el endpoint de exportaciÃ³n en el backend para almacenar briefings por subcarpeta de cliente.
  - Archivos: [`Central PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx) [MODIFY], [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-136: Ajuste de Granularidad del Eje X en GrÃ¡ficos por Scroll del Mouse (Zoom de Tiempo)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-29
  - Fecha de finalizaciÃ³n: 2026-06-29
  - DescripciÃ³n: Implementado soporte interactivo de mousewheel/trackpad scroll sobre el grÃ¡fico consolidado general de comisiones en `App.jsx`. El listener no pasivo previene el scroll vertical de pÃ¡gina cuando el cursor estÃ¡ en el grÃ¡fico y ajusta dinÃ¡micamente `chartViewMode` (Zoom-in: AÃ±os -> Meses -> DÃ­as; Zoom-out: DÃ­as -> Meses -> AÃ±os). Adicionalmente, se renderizaron controles de botones inline premium en la cabecera del grÃ¡fico para alternar granularidades con un clic y se resolviÃ³ el bug de inicializaciÃ³n de `addLog` en `App.jsx`.
  - Archivos: [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-135: Autocompletado y Relleno Temporal de GrÃ¡ficos de Tendencias~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-29
  - Fecha de finalizaciÃ³n: 2026-06-29
  - DescripciÃ³n: Creado helper `padPeriodData` en `App.jsx` para autocompletar consecutivamente los Ãºltimos 6 meses proyectando registros en `$0` para comisiones y ventas de meses anteriores. Esto evita puntos flotantes sin tendencia en series temporales cortas (como en el inicio de `2026-06`).
  - Archivos: [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-134: ErradicaciÃ³n Completa de Selectores Nativos y ResoluciÃ³n de Errores de Renderizado~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-29
  - Fecha de finalizaciÃ³n: 2026-06-29
  - DescripciÃ³n: Reemplazados todos los selectores nativos `<select>` remanentes en `App.jsx` por el componente premium animado `<CustomSelect>`. Corregido el error crÃ­tico de Lucide icons `Sliders` reemplazado por `Layers` en `ComponentLibraryView.jsx` que bloqueaba el renderizado de la UI de inyecciÃ³n y la carga de clientes Git.
  - Archivos: [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [`ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-133: Suite Comercial y de Control de Instancias (Briefing, Cotizador, Flags y Health Monitor)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-28
  - Fecha de finalizaciÃ³n: 2026-06-28
  - DescripciÃ³n: ImplementaciÃ³n e integraciÃ³n de los 4 nuevos mÃ³dulos comerciales y de control en el dashboard central (`App.jsx`). **Briefing Studio:** Wizard interactivo de 20 pasos de preventa con auto-guardado en Firestore y Modo 2 cognitivo con el CLI. **Cotizador:** Calculadora de 5 pasos basada en matriz de precios persistida en Firestore y generaciÃ³n/descarga de PDF de propuesta formal. **Feature Flags:** Panel de 10 variables del Core vinculadas en tiempo real. **Health Monitor:** Grid semafÃ³rico de disponibilidad HTTP y manifests de las instancias con grÃ¡ficos histÃ³ricos de respuesta. **Onboarding:** callback de inyecciÃ³n rÃ¡pida de datos de preventa en el formulario de creaciÃ³n. SincronizaciÃ³n y despliegue de reglas de seguridad de Firestore (`firestore.rules`) locales e inyecciÃ³n en caliente. CorrecciÃ³n del bug de escaneo recursivo en `sync_rules.js` para excluir la carpeta contenedor `Instancias Clientes`.
  - Archivos: [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [`Central PROTOTIPE/dev-dashboard/firestore.rules`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firestore.rules) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/services/pdfService.js`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/services/pdfService.js) [MODIFY], [`Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY], y 4 componentes React creados en `components/admin/`.

* **[x] ~~Tarea CORE-132: Suite de 5 Nuevas Habilidades y Salud Extendida del Ecosistema~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-28
  - Fecha de finalizaciÃ³n: 2026-06-28
  - DescripciÃ³n: ImplementaciÃ³n completa de las 5 nuevas skills en Express (`server.js`) y React (`SkillsRoadmapPanel.jsx`). **Logs en Vivo:** Stream SSE restringido a localhost con terminal glassmorphic, auto-scroll y reproducciÃ³n/pausa. **Database Seeder:** Sembrado seguro a travÃ©s de privilegios Firebase CLI validados contra `esquema_colecciones.md`. **Rules Sync:** SincronizaciÃ³n portable con 3 niveles dinÃ¡micos de ruta en `sync_rules.js`. **Manual Builder:** Generador de manuales tÃ©cnicos en `07_Manuales_Desarrollo/` con auto-indexaciÃ³n en el GPS semÃ¡ntico. **Limpiador Seguro:** Purga segura de cachÃ©s y temporales en base a una lista blanca para evitar Directory Traversal. RestauraciÃ³n de las 7 skills en `.agents/skills/` con todo su nivel de detalle original y portabilidad absoluta. Build de Vite verificado con Ã©xito en 1.35s âœ….
  - Archivos: [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY], [`Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [MODIFY], y 5 nuevas skills creadas en `.agents/skills/`.

* **[x] ~~Tarea CORE-129: Suite de GestiÃ³n Avanzada de Biblioteca de Componentes (CSS Doctor, Scaffold Sandbox, Import Copy)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-28
  - Fecha de finalizaciÃ³n: 2026-06-28
  - DescripciÃ³n: ImplementaciÃ³n de la suite de gestiÃ³n avanzada. **Backend:** Endpoint `/preflight` mejorado para anÃ¡lisis de variables CSS; endpoint `/inject/css-doctor` rediseÃ±ado con delimitadores de bloque para fusiÃ³n atÃ³mica no destructiva en `index.css`; endpoint `/sandbox/scaffold` para generaciÃ³n en caliente de playgrounds en blanco. CorrecciÃ³n de robustez en la regex de `extractCodeFromMarkdown` para dar soporte cross-platform a CRLF (`\r\n`) de Windows. **Frontend (dev-dashboard):** VisualizaciÃ³n en cascada (Ã¡rbol interactivo) de dependencias fÃ­sicas y NPM en Paso 2; botÃ³n "CSS Doctor" para autocuraciÃ³n; inputs para variables de entorno. Refactor de `ComponentSandbox.jsx` para carga dinÃ¡mica mediante `import.meta.glob('./sandboxes/*.jsx')`. **EstandarizaciÃ³n y Calidad:** Procesamiento en masa de las 87 fichas de la biblioteca para inyectar bloques JSON manifest en cabeceras y validaciÃ³n estricta en el compilador prebuild `verify_library_integrity.cjs`. CorrecciÃ³n de cierres de bloques de cÃ³digo JSX mal formados en `facturacion_y_firma_digital.md` y `pantalla_cocina_kds.md`. Integrado en la compilaciÃ³n prebuild la verificaciÃ³n de existencia de enlaces a archivos locales (`dependencies.internal[].link`). **DiseÃ±o de IntegraciÃ³n de Skills:** DiseÃ±ada y registrada la `propuesta_panel_skills_dashboard.md` con un enfoque hÃ­brido no redundante: monitor de salud local, roadmap de Markdown atÃ³mico, y asistentes de creaciÃ³n y extracciÃ³n visuales que generan comandos rÃ¡pidos para el chat de Antigravity, eliminando la necesidad de APIs de IA costosas en el servidor local.
  - Archivos: [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY], [`ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY], [`verify_library_integrity.cjs`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY], [`propuesta_panel_skills_dashboard.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/propuesta_panel_skills_dashboard.md) [NEW], [`mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-128: Reemplazo de Selectores Nativos por Componente CustomSelect Premium~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-28
  - Fecha de finalizaciÃ³n: 2026-06-28
  - DescripciÃ³n: Se refactorizaron por completo los selectores y listas desplegables nativas del Dashboard Central, los cuales presentaban un aspecto inconsistente y tosco debido a la renderizaciÃ³n por defecto del sistema operativo/navegador. Se diseÃ±Ã³ el componente local premium `CustomSelect` utilizando Framer Motion para animaciones de escala, opacidad y deslizamiento, incorporando soporte para Ã­conos descriptivos, subetiquetas (subLabel) para mostrar ramas de Git activas en los clientes locales, control de tamaÃ±o (`sm`/`md`) y un hook de efecto para detecciÃ³n y cierre al hacer clic fuera del elemento (click-outside). Se reemplazaron exitosamente las 4 listas desplegables nativas: CategorÃ­a del CatÃ¡logo (Extractor de Componentes), Proyecto Destino del Cliente (Wizard de InstalaciÃ³n), y los filtros de OperaciÃ³n y Estado de la pestaÃ±a Historial.
  - Archivos: [`ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-127: Sistema de AuditorÃ­a Inmutable e Historial de Inyecciones~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-28
  - Fecha de finalizaciÃ³n: 2026-06-28
  - DescripciÃ³n: ImplementaciÃ³n completa del sistema de trazabilidad inmutable para todas las operaciones del motor de inyecciÃ³n. **Backend:** Clase `WriteQueue` para serializar escrituras sin race conditions, helpers `appendAuditTrailEntry` y `writeAuditMarkdown` con escritura atÃ³mica (tmpâ†’rename) al archivo `.prototipe-audit-trail.jsonl` (append-only) y a `Documentacion PROTOTIPE/10_Historial_Inyecciones/historial_<clientId>.md`. Hooks integrados en `/inject/stream` (Ã©xito + auto-rollback) y `/inject/rollback`. 2 endpoints nuevos: `GET /audit-trail` (paginado, con filtros por operaciÃ³n/estado/texto) y `GET /audit-diff` (diff unified patch backup vs. actual). **Frontend:** Nueva pestaÃ±a "Historial" en `ComponentLibraryView.jsx` con timeline interactivo, visor de diffs con coloreado por lÃ­nea (+/-/@@), filtros en tiempo real, paginaciÃ³n, info de stack, NPM packages, env vars, dependencias y mensaje de error. **DocumentaciÃ³n:** CreaciÃ³n de `10_Historial_Inyecciones/` con `INDEX.md` actualizado automÃ¡ticamente por el CLI.
  - Archivos: [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY], [`10_Historial_Inyecciones/INDEX.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/10_Historial_Inyecciones/INDEX.md) [NEW]

* **[x] ~~Tarea CORE-126: InyecciÃ³n DinÃ¡mica e Interactiva de Variables de Entorno en Caliente~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-28
  - Fecha de finalizaciÃ³n: 2026-06-28
  - DescripciÃ³n: ImplementaciÃ³n de la configuraciÃ³n de variables de entorno de forma dinÃ¡mica e interactiva directamente desde el dashboard. Se diseÃ±aron e implementaron dos nuevos helpers en el backend (`extractAllEnvVarsRecursively` y `writeEnvVarsToClient`) para realizar la detecciÃ³n recursiva en todo el Ã¡rbol de dependencias del componente y escribir los valores reales en el archivo `.env.local` del cliente de forma no destructiva, evitando duplicados y formateando los strings con comillas dobles. En el frontend, se inyectÃ³ una secciÃ³n estilizada `"ðŸ”‘ Configurar Variables de Entorno"` en el Paso 2 (DiagnÃ³stico) del wizard de inyecciÃ³n, enlazÃ¡ndola asÃ­ncronamente con el payload del endpoint de stream en el Paso 3.
  - Archivos: [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-125: Blindaje y Robustecimiento del Sistema de Rollback en Cascada~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-28
  - Fecha de finalizaciÃ³n: 2026-06-28
  - DescripciÃ³n: Robustecimiento integral del sistema de restauraciÃ³n (rollback) e inyecciÃ³n en cascada. Se implementÃ³ una sesiÃ³n de backup basada en timestamp Ãºnico para agrupar copias de seguridad de primario y dependencias relativas portables al espacio de trabajo. Se integrÃ³ un podador de backups (`pruneBackups`) que limita automÃ¡ticamente a un mÃ¡ximo de 5 versiones el historial por componente. Y se modificÃ³ el endpoint de rollback para que sea 100% reversible: en caso de dependencias o archivos primarios inyectados nuevos que no existÃ­an previamente, el sistema los **borra fÃ­sicamente** del disco del cliente, garantizando la consistencia exacta de su estado original. Cuenta con validaciones estrictas `isPathContained` contra ataques de Path Traversal.
  - Archivos: [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-124: EstandarizaciÃ³n de Rutas de Destino en Ciclo de Componentes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-28
  - Fecha de finalizaciÃ³n: 2026-06-28
  - DescripciÃ³n: EstandarizaciÃ³n de la ruta de destino (targetPath) a travÃ©s de todo el ciclo de vida de los componentes. Se modificÃ³ la firma de `getDefaultRelativePath` para leer la propiedad `targetPath` declarativa de los manifiestos JSON. Se expuso `suggestedPath` en el response del endpoint `/preflight`. Se creÃ³ el helper `updateSuggestedPath(clientId)` en el dashboard para autocompletar la ruta en el wizard de forma silenciosa. Y se actualizaron las plantillas de manifest en las skills del ecosistema (`component_creator`, `component_extractor`, `portar_componente`) para exigir el campo `targetPath` en futuros componentes.
  - Archivos: [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-123: Sistema de InstalaciÃ³n Inteligente de Componentes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-28
  - Fecha de finalizaciÃ³n: 2026-06-28
  - DescripciÃ³n: ImplementaciÃ³n del Sistema de InstalaciÃ³n Inteligente. 6 helpers nuevos en server.js: `analyzeCodeDependencies`, `probeTargetStack`, `rewriteImports`, `createBackupBeforeWrite`, `updateComponentRegistry`, `generateIntegrationSnippet`. Refactor de `/inject/stream` con detecciÃ³n de stack, reescritura de imports, backup automÃ¡tico, registro JSON con checksum SHA256, placeholders de env vars en `.env.local`, y build automÃ¡tico post-inyecciÃ³n via SSE. 2 nuevos endpoints: `GET /registry` (inventario live con checksum diff) y `POST /rollback` (restauraciÃ³n segura). Frontend: 6 estados nuevos, badges de stack en Step 1, snippet copiable + indicador de build en Step 3, clasificaciÃ³n visual por fase en log SSE. Build verificado âœ… 1.28s, `node --check` limpio.
  - Archivos: [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-122: Blindaje del Sistema de InyecciÃ³n de Componentes en Cliente~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: AuditorÃ­a exhaustiva y blindaje completo del flujo "Instalar en Cliente". Se corrigieron 5 bugs crÃ­ticos (regex frÃ¡gil, sin feedback, NPM bloqueante, sobrescritura ciega, manifest ausente silencioso). Se implementaron 2 nuevos endpoints aditivos (`/preflight` y `/stream` SSE) que no modifican el endpoint original `/api/library/inject`. Se reemplazÃ³ el panel inline por un modal wizard de 3 pasos guiados con validaciÃ³n previa, diagnÃ³stico de dependencias y progreso en vivo. Build verificado en âœ… 1.22s.
  - Archivos: [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [`ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-120: RediseÃ±o Visual y de Experiencia de Usuario de la Biblioteca~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: Se rediseÃ±Ã³ por completo la interfaz del panel de la biblioteca. Se migrÃ³ a una estructura responsiva de 3 columnas (BÃºsqueda/Filtros, Cards Premium y Workspace Inspector), integrando tarjetas estilo glassmorphism con badges de tags/estados, atajo `/` para bÃºsqueda global, y un Toggler de AmpliaciÃ³n en la barra de pestaÃ±as que expande el inspector a ancho completo (`xl:col-span-12`) colapsando las columnas laterales para dar una cÃ³moda visualizaciÃ³n a mÃ³dulos completos y cÃ³digo extenso.
  - Archivos: [Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-119: InyecciÃ³n Inteligente y ResoluciÃ³n de Dependencias~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: ImplementaciÃ³n tÃ©cnica completa del sistema de inyecciÃ³n de cÃ³digo autogestionado con resoluciÃ³n inteligente de dependencias. Se estandarizÃ³ el uso del path alias `@/` y archivos `jsconfig.json` en los 4 proyectos principales del ecosistema para dar portabilidad universal a los imports. Se desarrollaron endpoints en la CLI para realizar pre-diagnÃ³sticos de dependencias e inyecciones en cascada con instalaciones NPM asÃ­ncronas seguras, e integrÃ³ un visor interactivo de checklist de requisitos y progreso en la interfaz web del dashboard.
  - Archivos: [Central PROTOTIPE/dev-dashboard/vite.config.js](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/vite.config.js) [MODIFY], [Plantillas Core/App Ventas/vite.config.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/vite.config.js) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/vite.config.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/vite.config.js) [MODIFY], [Prototipe-CLI/templates/template-ventas/vite.config.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js) [MODIFY], [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY], [Central PROTOTIPE/dev-dashboard/jsconfig.json](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/jsconfig.json) [NEW], [Plantillas Core/App Ventas/jsconfig.json](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/jsconfig.json) [NEW], [Instancias Clientes/ventas/ventas-moni-app/jsconfig.json](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/jsconfig.json) [NEW], [Prototipe-CLI/templates/template-ventas/jsconfig.json](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/jsconfig.json) [NEW]

* **[x] ~~Tarea CORE-118: RepotenciaciÃ³n de la Biblioteca de Componentes y MÃ³dulos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: RepotenciaciÃ³n e integraciÃ³n del catÃ¡logo de componentes y la biblioteca de mÃ³dulos completos (`09_Modulos_Completos`). Se implementÃ³ un sistema de auto-inyecciÃ³n automatizado en un clic hacia instancias locales de clientes, una pestaÃ±a dedicada de visualizaciÃ³n de cÃ³digo JSX limpio y aislado mediante regex robustas tolerantes a fichas incompletas, una nube de etiquetas (Tag Cloud) lateral interactiva para filtrado rÃ¡pido de taxonomÃ­as y la sincronizaciÃ³n y actualizaciÃ³n del repositorio de habilidades del ecosistema.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

* **[x] ~~Tarea CORE-117: RestricciÃ³n de Estrategia Auto-Merge para Instancias Cliente~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: Se inhabilitÃ³ y ocultÃ³ de forma dinÃ¡mica el interruptor de "Auto-Merge a producciÃ³n" en la UI del Dashboard (`GitBackupPanel.jsx`) al seleccionar repositorios de tipo cliente/instancia (`Instancias Clientes`), ya que estos operan bajo una Ãºnica rama dedicada y carecen de rama principal de producciÃ³n/main.
  - Archivos: [Central PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-115: Respaldos No Disruptivos y EliminaciÃ³n de Detenciones de Servidores~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: Se eliminÃ³ la detenciÃ³n de procesos dev de Vite/Node (`Stop-Process`) de los scripts de PowerShell (`git_backup.ps1`, `subproject_backup.ps1`, `menu_backup.ps1`) y se configurÃ³ `watch.ignored: ['**/.git-backup-temp**']` en `vite.config.js` en todos los proyectos del ecosistema. Esto resuelve de raÃ­z tanto las recargas/parpadeos indeseados en el navegador como los fallos de bloqueo ("Acceso denegado") al renombrar las carpetas de Git a su estado original.
  - Archivos: [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY], [menu_backup.ps1](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY], [Central PROTOTIPE/dev-dashboard/vite.config.js](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/vite.config.js) [MODIFY], [Plantillas Core/App Ventas/vite.config.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/vite.config.js) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/vite.config.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/vite.config.js) [MODIFY]

* **[x] ~~Tarea CORE-116: Auto-Merge a ProducciÃ³n Activado por Defecto~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: Se configurÃ³ el estado `doAutoMerge` como `true` por defecto en el panel de control de versiones del Dashboard Central (`GitBackupPanel.jsx`) y se implementÃ³ una estrategia de fusiÃ³n Zero-Checkout (`git branch -f`) en los scripts de respaldo de PowerShell (`git_backup.ps1` y `subproject_backup.ps1`). Esto garantiza que los cambios se fusionen y empujen a master/main de forma inmediata sin alterar los archivos del directorio de trabajo activo, erradicando por completo las recargas de Vite HMR en el navegador.
  - Archivos: [Central PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) [MODIFY], [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

* **[x] ~~Tarea CORE-114: Robustecimiento de InicializaciÃ³n de Firebase (Resguardo HMR)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: Se robusteciÃ³ la inicializaciÃ³n del SDK cliente de Firebase (`firebaseConfig.js`) tanto en las plantillas core como en las instancias cliente (`ventas-moni-app`) para soportar recargas en caliente de Vite (HMR) sin provocar caÃ­das del sistema. Se implementÃ³ una inicializaciÃ³n condicional para la app de Firebase utilizando `getApps()` y un bloque `try/catch` de contingencia sobre `initializeFirestore` para recuperar la conexiÃ³n activa con `getFirestore(app)` en re-evaluaciones de mÃ³dulos locales.
  - Archivos: [Plantillas Core/App Ventas/src/config/firebaseConfig.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/config/firebaseConfig.js) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js) [MODIFY], [Prototipe-CLI/templates/template-ventas/src/config/firebaseConfig.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/config/firebaseConfig.js) [MODIFY]

* **[x] ~~Tarea CORE-113: Ajustes Visuales, CorrecciÃ³n de Enlaces y OptimizaciÃ³n CRO en Landing~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: RefactorizaciÃ³n y afinaciÃ³n CRO de la Landing Page. Ajuste de los Lead Magnets de nicho para ofrecer soporte tÃ©cnico y actualizaciones reales, correcciÃ³n de interpolaciÃ³n de telÃ©fono de WhatsApp, remociÃ³n del efecto magnÃ©tico en CTA secundario, rediseÃ±o claro e integrado del card de pÃ©rdida financiera, cambio de border-radius en la pÃ­ldora de regalo a 10px y scroll automÃ¡tico al tope en carga de pÃ¡gina. CorrecciÃ³n de error de HMR en App Ventas Core.
  - Archivos: [LandingPage/js/app.js](file:///d:/PROTOTIPE/LandingPage/js/app.js) [MODIFY], [LandingPage/css/styles.css](file:///d:/PROTOTIPE/LandingPage/css/styles.css) [MODIFY], [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [LandingPage/sw.js](file:///d:/PROTOTIPE/LandingPage/sw.js) [MODIFY], [Plantillas Core/App Ventas/src/App.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-112: FormulaciÃ³n de Propuestas Avanzadas de PersuasiÃ³n y CaptaciÃ³n~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: FormulaciÃ³n de propuestas avanzadas de persuasiÃ³n psicolÃ³gica y captaciÃ³n para la landing page de PROTOTIPE. Se detallaron estrategias conductuales como la reciprocidad a travÃ©s de lead magnets personalizados por nicho, el efecto de anclaje de precios comparando costos de ineficiencia vs inversiÃ³n, storytelling basado en el alivio del dolor y el sesgo de progreso dotado en la calculadora.
  - Archivos: [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/propuestas_persuasion_captacion_avanzada_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/propuestas_persuasion_captacion_avanzada_2026.md) [NEW], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-111: ElaboraciÃ³n de Propuesta de ConversiÃ³n PsicolÃ³gica y CRO para Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: ElaboraciÃ³n de una propuesta tÃ©cnica y estratÃ©gica de conversiÃ³n psicolÃ³gica de alto nivel para la landing page de PROTOTIPE, inyectando disparadores conductuales como aversiÃ³n a la pÃ©rdida en la propuesta de valor, humanizaciÃ³n y credibilidad en prueba social, simulador interactivo de dolor financiero y personalizaciÃ³n dinÃ¡mica contextual de nichos para optimizar la captaciÃ³n de leads.
  - Archivos: [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/propuesta_conversion_psicologica_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/propuesta_conversion_psicologica_2026.md) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-110: AuditorÃ­a TÃ©cnica, SEO, CRO y Accesibilidad de la Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: RealizaciÃ³n de una auditorÃ­a profunda y rigurosa de la landing page (Index.html de 7000 lÃ­neas y sw.js), identificando cuellos de botella de rendimiento, accesibilidad crÃ­tica (bloqueo de selecciÃ³n de texto y anulaciÃ³n de foco de teclado), fricciones de conversiÃ³n (modal interceptor de leads de WhatsApp) y discrepancias de cachÃ© en el Service Worker. Se generÃ³ un informe tÃ©cnico detallado con un plan de acciÃ³n ordenado por prioridad en el directorio de auditorÃ­as del proyecto.
  - Archivos: [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_landing_page_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_landing_page_2026.md) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-109: IntegraciÃ³n de la Landing Page en el Dev-Dashboard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: Se integrÃ³ la landing page estÃ¡tica del ecosistema (`d:/PROTOTIPE/LandingPage/Index.html` y `sw.js`) en `public/landing/` del `dev-dashboard` y se solventÃ³ el enrutamiento y la persistencia de tema. Se enrutÃ³ el enlace de cabecera a `/landing/index.html` para evadir el fallback de la SPA. AdemÃ¡s, se aislÃ³ el estado de tema del dashboard en localStorage bajo la clave `prototipe_dev_dashboard_theme` para evitar colisiones con la landing page (que usa `theme` sobre el mismo origen), y se inyectÃ³ una rutina que desregistra Service Workers obsoletos en la raÃ­z `/` del origen.
  - Archivos: [Central PROTOTIPE/dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [Central PROTOTIPE/dev-dashboard/public/landing/index.html](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/public/landing/index.html) [NEW], [Central PROTOTIPE/dev-dashboard/public/landing/sw.js](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/public/landing/sw.js) [NEW]

* **[x] ~~Tarea CORE-108: Robustez Concurrente en Test de Humo y Filtro de Comentarios en SanitizaciÃ³n~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: Se mejorÃ³ la robustez de concurrencia y seguridad en el CLI mediante dos acciones clave: (1) En `worker_create_project.js`, se reemplazÃ³ el puerto estÃ¡tico de pruebas de humo `5190` por un resolvedor de puertos dinÃ¡micos libres (`getFreePort` a travÃ©s del mÃ³dulo `net`), evitando colisiones y fallas si se inician mÃºltiples creaciones de proyectos en paralelo. AdemÃ¡s, se aÃ±adiÃ³ un guardiÃ¡n de existencia para `node_modules` para omitir el test de humo si no estÃ¡n instaladas las dependencias, previniendo procesos zombie. (2) En `sync_templates.js`, se ajustÃ³ la expresiÃ³n regular del extractor de variables para ignorar caracteres de comentarios (`#`) al leer `.env.local`, evitando que comentarios de lÃ­nea contaminen los tokens dinÃ¡micos e impidan la sanitizaciÃ³n correcta de las plantillas (mitigaciÃ³n de fugas de secretos).
  - Archivos: [Prototipe-CLI/worker_create_project.js](file:///d:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY], [Prototipe-CLI/sync_templates.js](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY]

* **[x] ~~Tarea CORE-107: Robustez HÃ­brida de Triggers y ValidaciÃ³n Preventiva en Aprovisionador~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: Se robustecieron los triggers de comunicaciÃ³n en tiempo real (`triggerPing` y `triggerTelemetryReport`) en `useAppConfigSync.js` para parsear los datos de forma hÃ­brida y tolerante a fallos, aceptando tanto objetos `Timestamp` de Firestore (mediante `.toMillis()`) como enteros primitivos de milisegundos (`Number`), evitando asÃ­ fallas silenciosas de telemetrÃ­a si cambia el tipo de serializaciÃ³n central. Adicionalmente, se inyectÃ³ una validaciÃ³n estricta de preflight en `generator.js` que verifica que la clave central de control (`VITE_DEVELOPER_CENTRAL_API_KEY`) y las variables de telemetrÃ­a estÃ©n configuradas correctamente, deteniendo la creaciÃ³n de nuevas instancias si falta alguna para evitar deploys en estado inconsistente.
  - Archivos: [Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY], [Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY], [Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js) [MODIFY], [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [Prototipe-CLI/sync_templates.js](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY], [Prototipe-CLI/test_templates.js](file:///d:/PROTOTIPE/Prototipe-CLI/test_templates.js) [MODIFY]

* **[x] ~~Tarea CORE-106: Blindaje Automatizado y Guardianes EstÃ¡ticos de TelemetrÃ­a en el CLI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: Se diseÃ±Ã³ e implementÃ³ un sistema de guardianes estÃ¡ticos y validaciÃ³n de integridad para blindar el canal de telemetrÃ­a del ecosistema contra regresiones de cÃ³digo (tales como el bug de cero ventas mensuales). Se aÃ±adiÃ³ una funciÃ³n de anÃ¡lisis estÃ¡tico `auditarIntegridadHook` en `sync_templates.js` (bloqueando la sincronizaciÃ³n downstream si el core origen tiene vulnerabilidades en el hook) y en `test_templates.js` (como un paso formal del runner de pruebas de integraciÃ³n de plantillas, haciendo fallar el build si el hook vulnera los estÃ¡ndares). Adicionalmente, se documentÃ³ este estÃ¡ndar de comprobaciÃ³n estricta de tipos de datos en la normativa arquitectÃ³nica global.
  - Archivos: [Prototipe-CLI/sync_templates.js](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY], [Prototipe-CLI/test_templates.js](file:///d:/PROTOTIPE/Prototipe-CLI/test_templates.js) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md) [MODIFY]

* **[x] ~~Tarea CORE-105: Auto-Respuesta Silenciosa de TelemetrÃ­a y RestauraciÃ³n de Valores Reales en Test de TelemetrÃ­a~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: Se corrigiÃ³ la desincronizaciÃ³n en el canal de telemetrÃ­a de facturaciÃ³n remota. Anteriormente, el dashboard emitÃ­a `triggerTelemetryReport: timestamp` al documento central `clientes_control/{clientId}` en de-facto telemetrÃ­a global, pero el hook cliente `useAppConfigSync.js` no lo propagaba localmente. Adicionalmente, el botÃ³n individual "Test de TelemetrÃ­a" creaba un registro con valores simulados/mock en `reportesBilling` pero no enviaba el trigger al cliente para que reportara sus valores reales. Se modificÃ³ `handleCreateTestReport` en el Dashboard para que actualice `triggerTelemetryReport` en `clientes_control/{clientId}`, y se actualizÃ³ `useAppConfigSync.js` para interceptar este trigger directamente en memoria desde el snapshot central, validando que no estÃ© expirado (antigÃ¼edad < 60s) e invocando de inmediato a `reportMonthlyBillingToDeveloper` con las mÃ©tricas reales del cliente en cachÃ© de Zustand. Se corrigiÃ³ un bug crÃ­tico donde las tiendas con cero ventas mensuales (como `moni-app` con base de datos limpia) abortaban el envÃ­o por una validaciÃ³n estricta de verdad (`if (metrics.totalMes)`); ahora se evalÃºa por tipo de dato (`typeof metrics.totalMes === 'number'`), garantizando que se reporten facturaciones de $0 con Ã©xito y se sobrescriban correctamente los reportes de prueba.
  - Archivos: [Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY], [Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY], [Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-104: PotenciaciÃ³n y Siembra AutomÃ¡tica del Generador~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: PotenciaciÃ³n integral del aprovisionador para lograr generaciÃ³n 100% libre de errores. Se implementÃ³ la validaciÃ³n preventiva de integridad para `firestore.indexes.json` con reescritura de fallback mÃ­nimo, la asignaciÃ³n determinÃ­stica y dinÃ¡mica de puertos de desarrollo en `vite.config.js` basada en un hash de `clientId` para evadir colisiones en ejecuciones multi-instancia, y la generaciÃ³n nativa de `scripts/seed_admin.js` el cual ejecuta una siembra REST de Firestore con el token administrativo extraÃ­do dinÃ¡micamente de `firebase-tools.json` (Firebase CLI) del desarrollador, registrando el usuario administrador en Firebase Auth y creando los documentos obligatorios en la colecciÃ³n `/users` y `/config/settings` para prevenir bloqueos por reglas de seguridad y errores `PERMISSION_DENIED`.
  - Archivos: [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CORE-103: Blindaje de Seguridad y Robustez en generator.js (Round 2)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: Se robusteciÃ³ la lÃ³gica del generador implementando la generaciÃ³n de `adminPassword` Ãºnica e impredecible por instancia, timeouts de seguridad de 10-15 segundos en ejecuciones secundarias de mapeo, inyecciÃ³n y balanceo de llaves para variables de estilos en CSS global, y fallbacks reactivos seguros en el retorno de aprovisionamiento. Adicionalmente se migrÃ³ el registro de la Consola Central a `Promise.allSettled` para blindaje contra cortes de red intermitentes, se asignaron puertos Playwright dinÃ¡micos derivados y se refinÃ³ la validaciÃ³n e inyecciÃ³n SEO en `index.html` con regex tolerantes a mayÃºsculas y atributos, previniendo tambiÃ©n el aprovisionamiento de nombres de proyecto invÃ¡lidos.
  - Archivos: [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [Prototipe-CLI/cli.js](file:///d:/PROTOTIPE/Prototipe-CLI/cli.js) [MODIFY]

* **[x] ~~Tarea CORE-102: EliminaciÃ³n de Selector Interactivo de Ramas y Robustecimiento del Backup~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: Se removiÃ³ por completo el dropdown interactivo del selector de ramas locales/remotas del Dashboard y sus endpoints CLI correspondientes para evitar regresiones de Git. Asimismo, se corrigiÃ³ la lÃ³gica de retorno del script de PowerShell (`git_backup.ps1` y `subproject_backup.ps1`) reemplazando las llamadas `exit` por retorno simple en el bloque de excepciones del control de flujo para garantizar el merge a producciÃ³n y retorno final del HEAD a `develop`.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-101: AuditorÃ­a, Saneamiento y Robustecimiento del MÃ³dulo de FacturaciÃ³n y Cobros~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-27
  - Fecha de finalizaciÃ³n: 2026-06-27
  - DescripciÃ³n: AuditorÃ­a y saneamiento tÃ©cnico del flujo financiero de cobranzas. Se corrigiÃ³ el cÃ¡lculo del preview de WhatsApp para cobros mensuales basÃ¡ndose estrictamente en el perÃ­odo consultado, se implementÃ³ control de concurrencia en la confirmaciÃ³n de pagos de la tabla (deshabilitaciÃ³n y spinner reactivo), y se desacoplÃ³ el selector de clientes de WhatsApp para resolver desde la base unificada histÃ³rica en lugar de perÃ­odos activos. Se integrÃ³ la autocuraciÃ³n de plantillas, persistencia del timestamp de envÃ­o y rediseÃ±o visual del PDF y la tabla del Dashboard. Asimismo, se solucionaron los emoji corruptos en Windows mediante codificaciÃ³n unicode nativa evasiva a Vite (`String.fromCodePoint`) y bypass de redirecciÃ³n wa.me, inyectando tambiÃ©n semÃ¡foros de concurrencia y soporte TypeScript y de estilos dinÃ¡micos al CLI.
  - Archivos: [Central PROTOTIPE/dev-dashboard/src/App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [MODIFY], [Central PROTOTIPE/dev-dashboard/firestore.rules](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firestore.rules) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/services/pdfService.js](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/services/pdfService.js) [MODIFY], [Prototipe-CLI/server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Prototipe-CLI/worker_create_project.js](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY], [Prototipe-CLI/generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CORE-100: Selector Interactivo y Cambio de Ramas DinÃ¡mico en Control Git~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: ImplementaciÃ³n de la funcionalidad para cambiar dinÃ¡micamente de rama Git desde el panel del Dashboard. Se crearon los endpoints `GET /api/git/branches` y `POST /api/git/checkout` en el servidor CLI (`server.js`), integrando soporte completo y transparente para repositorios inactivos renombrados como `.git-backup-temp`. Se optimizÃ³ la lectura de la rama activa en la CLI (`getGitBranch`) para que acceda de forma directa al archivo `HEAD` en disco (evitando comandos de Git lentos o colisiones ascendentes en directorios anidados). En el frontend del Dashboard (`GitBackupPanel.jsx`), se reemplazÃ³ el componente estÃ¡tico `BranchBadge` por el componente interactivo `BranchSelector`, que proporciona un dropdown con estilo de vidrio difuminado (glassmorphism) para elegir entre las ramas locales disponibles, protegido con diÃ¡logos de confirmaciÃ³n y feedback de loading con spinner durante el proceso de checkout.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-099: Desacoplamiento de Repositorios Git y CorrecciÃ³n de Fugas de Archivos en Control Git~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: SoluciÃ³n definitiva del conflicto de control de versiones raÃ­z vs subproyectos y prevenciÃ³n de reloads en caliente de Vite. Se desindexaron las carpetas `Plantillas Core/`, `Instancias Clientes/`, `Central PROTOTIPE/` y las plantillas de `Prototipe-CLI/templates/` del repositorio raÃ­z Git de `D:\PROTOTIPE` para que el `checkout` de la CLI no pise o revierta los archivos locales de la Consola Central ni de otros subproyectos. Se actualizaron los archivos `.gitignore` del raÃ­z y de cada subproyecto para excluir de forma hermÃ©tica la carpeta de Git renombrada `.git-backup-temp/`. Se restauraron los archivos fÃ­sicos perdidos durante los checkouts y merges de Git desde el commit `911f5b0` (como `.prototipe.json` y `.gitignore` en la instancia del cliente `ventas-moni-app`). Se saneÃ³ la lÃ³gica de detecciÃ³n en `isInsideGitRepo` de `server.js` para reconocer repositorios inactivos renombrados como `.git-backup-temp`. Adicionalmente, se robustecieron los scripts de respaldo de PowerShell (`git_backup.ps1` y `subproject_backup.ps1`) implementando la estrategia de resoluciÃ³n de conflictos automÃ¡tica `-X theirs` a favor de la rama de desarrollo durante el Auto-Merge a producciÃ³n (`main`/`master`), asegurando que las fusiones automÃ¡ticas se completen con Ã©xito sin necesidad de resoluciÃ³n manual de conflictos.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [.gitignore](file:///d:/PROTOTIPE/.gitignore) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/.gitignore](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/.gitignore) [MODIFY], [Plantillas Core/App Ventas/.gitignore](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.gitignore) [MODIFY], [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

* **[x] ~~Tarea CORE-098: Poda Limpia de Firebase Cloud Messaging (FCM) e Inactividad Push~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: RemociÃ³n completa y segura de la funcionalidad inactiva de notificaciones push de Firebase en todo el ecosistema para suprimir costos innecesarios y optimizar el tamaÃ±o del bundle de las aplicaciones. Se eliminaron fÃ­sicamente `src/hooks/useFCMPermission.js` y `src/components/client/SoftPushPrompt.jsx`. Se depuraron sus importaciones y llamadas del hook de solicitudes de permisos en los layouts clave: `AdminLayout.jsx` (administraciÃ³n), `PortalLayout.jsx` (portal empleados) y `ClientLayout.jsx` (tienda del cliente). Se limpiÃ³ el componente de seguimiento de pedidos `OrderTracking.jsx` de referencias a `SoftPushPrompt`. Los cambios se aplicaron de forma sincronizada con paridad al Core original (`Plantillas Core/App Ventas`), al generador de la CLI (`Prototipe-CLI/templates/template-ventas`) y a la instancia del cliente activa (`Instancias Clientes/ventas/ventas-moni-app`), validando una compilaciÃ³n de Vite al 100% exitosa tras la remociÃ³n.
  - Archivos: [Plantillas Core/App Ventas/](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/) [MODIFY], [Prototipe-CLI/templates/template-ventas/](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/) [MODIFY]

* **[x] ~~Tarea CORE-097: Robustecimiento y ExpansiÃ³n del MÃ³dulo de Control Git~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: AuditorÃ­a integral del mÃ³dulo "Control de Versiones" del dashboard y la CLI. Se unificaron los endpoints de descarte (`discard`) y diferencias (`diff-file`) para recibir el parÃ¡metro universal `path` (ruta absoluta del repositorio) con validaciones de Path Traversal para independizarlos de `clientId`. Se inyectÃ³ soporte transparente para repositorios inactivos (`.git-backup-temp`) utilizando el direccionamiento de entorno `GIT_DIR`/`GIT_WORK_TREE` de Git en Node.js, erradicando bloqueos de archivos fÃ­sicos en Windows. En el frontend se inyectÃ³ la visualizaciÃ³n de los 5 commits locales mÃ¡s recientes (`GET /api/git/log`), controles de sincronizaciÃ³n dinÃ¡mica con GitHub (Ahead/Behind/Sync) con fetch remoto opcional bajo demanda, y botones para descartar cambios locales selectiva o masivamente desde la UI con popups de confirmaciÃ³n. Adicionalmente, se robustecieron los scripts de respaldo de PowerShell (`git_backup.ps1` y `subproject_backup.ps1`) para que, ante conflictos en la estrategia secundaria de auto-merge a producciÃ³n (`main`), el script aborte de forma segura la fusiÃ³n pero finalice con Ã©xito (cÃ³digo 0) y un aviso de advertencia ("warning"), asegurando que la subida del respaldo en la rama de desarrollo ya completada sea notificada de forma exitosa en la terminal de la UI.
  - Archivos: [Central PROTOTIPE/dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) [MODIFY], [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY], [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY]

* **[x] ~~Tarea CORE-096: Robustecimiento y AuditorÃ­a del MÃ³dulo Consola de Errores y DiagnÃ³sticos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: AuditorÃ­a integral del mÃ³dulo "Consola de Errores" en `App.jsx`. Se corrigieron 4 bugs crÃ­ticos: `onSnapshot` sin `limit()`, spam de logs en carga inicial, falta de `resolvedAt` al resolver en bulk, y uso de `deleteDoc` sin `writeBatch` (lÃ­mite de 500 operaciones Firestore). Se inyectaron mejoras funcionales crÃ­ticas (F1, F2, F3): soporte de filtrado por rango de fechas (con el componente premium `DatePickerCustom` de diseÃ±o glassmorphic de la central); exportaciÃ³n segura de fallos filtrados en formato CSV (`handleExportFailuresCSV`); y renderizado de la versiÃ³n de la aplicaciÃ³n (`appVersion`) en las tarjetas de incidentes y en el modal de diagnÃ³stico. Todo el layout de filtros se unificÃ³ a una altura exacta de `h-9` (`36px`) para consistencia perfecta y visual premium en PC y mÃ³viles. El selector de fecha (`DatePickerCustom`) se adaptÃ³ para mostrar el calendario centrado en pantalla en un modal con backdrop blur (`backdrop-blur-sm`), previniendo desbordamientos en resoluciones de laptops, PCs y telÃ©fonos mÃ³viles.
  - Archivos: [Central PROTOTIPE/dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-095: CorrecciÃ³n de Cierre de Servidor Dev-Dashboard en Backups de Git~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: Se corrigiÃ³ el cierre accidental del Dashboard Central (`dev-dashboard`) y la CLI Bridge (`server.js`) durante los backups de Git. Se implementÃ³ un algoritmo dinÃ¡mico en PowerShell que obtiene y propaga de forma ascendente los PIDs a proteger (relaciÃ³n `ParentProcessId` cubriendo npm -> cmd/powershell -> node/vite), protegiendo la cadena completa de ejecuciÃ³n. Adicionalmente, en `subproject_backup.ps1` se aislÃ³ la detenciÃ³n de servidores dev de modo que solo afecte al subproyecto de interÃ©s y se inyectÃ³ la restauraciÃ³n automÃ¡tica en el bloque `finally` para reactivar el servidor tras el respaldo.
  - Archivos: [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY], [menu_backup.ps1](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY]

* **[x] ~~Tarea CORE-094: OptimizaciÃ³n de Drift y Paridad de Cores (NormalizaciÃ³n LF, HuÃ©rfanos, Poda y Diffs Lazy)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: Se implementÃ³ un detector de desvÃ­os (drift) optimizado y paridad inteligente. Se inyectÃ³ la normalizaciÃ³n LF (`\n`) en la comparaciÃ³n en memoria para eliminar falsos desvÃ­os invisibles (CRLF) en entornos Windows. Se incorporÃ³ detecciÃ³n bidireccional de archivos obsoletos (huÃ©rfanos en la plantilla CLI). Se actualizÃ³ el endpoint de sincronizaciÃ³n fÃ­sica para soportar poda (`prune: true`), eliminando de forma segura archivos huÃ©rfanos. Se implementÃ³ la llamada diferida (lazy loading) bajo demanda para cÃ¡lculo y renderizado de diffs por archivo en el acordeÃ³n del modal en `CoreCard.jsx` en lugar de cargarlos en el payload inicial.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [MODIFY]

* **[x] ~~Tarea CORE-093: OptimizaciÃ³n, SanitizaciÃ³n y VisualizaciÃ³n de Diferencias en SincronizaciÃ³n de Cores (CORE-093)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: Se optimizÃ³ y refactorizÃ³ el motor de sincronizaciÃ³n de plantillas Core (`performCoreSync`) en la CLI para realizar E/S de forma concurrente con `Promise.all` al sanitizar archivos. Se restringiÃ³ la sustituciÃ³n del token `packageName` a `package.json`, protegiendo componentes de React y estilos CSS de sobreescrituras codiciosas. Se habilitÃ³ la sanitizaciÃ³n nativa de archivos de reglas Firebase (`.rules`) y se inyectaron exclusiones recursivas. Adicionalmente, se corrigieron bugs crÃ­ticos en `generator.js` (preflight check con error de anÃ¡lisis HTML 404 de Google) y `worker_create_project.js` (import dinÃ¡mico ESM de Playwright en Windows y timeouts causados por telemetrÃ­a). Finalmente, se implementÃ³ el endpoint `GET /api/cores/:clave/drift` para comparar semÃ¡nticamente en memoria el Core con la plantilla y se integrÃ³ en `CoreCard.jsx` del Dashboard un modal interactivo premium que muestra la tasa de paridad (0-100%), listado de archivos faltantes y acordeones dinÃ¡micos con el diff de lÃ­neas coloreadas. Asimismo, se corrigiÃ³ el error de "Acceso denegado" de Windows en las rutinas de respaldo al renombrar carpetas Git ocultas, modificando `git_backup.ps1`, `menu_backup.ps1` y `subproject_backup.ps1` para remover y reaplicar proactivamente atributos de sistema y oculto (`attrib -h -r -s`) al vuelo.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [Prototipe-CLI/worker_create_project.js](file:///d:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [MODIFY], [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY], [menu_backup.ps1](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

* **[x] ~~Tarea CORE-092: Blindaje a Futuro de Cores e Instancias (Firebase Rules & Config Integrity)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: Se implementÃ³ un blindaje de paridad y autocuraciÃ³n para las reglas de Firebase y configuraciones crÃ­ticas en el CLI Server y generador. Modificado `/api/register-core` para provisionar archivos Firebase base completos (`firebase.json`, `firestore.rules`, `storage.rules`, `firestore.indexes.json`) al crear nuevos Cores. Modificado `/api/project/firebase-rules/drift-global` para autocurar archivos faltantes en el Core local (descargando las reglas de la nube o usando plantillas restrictivas por defecto). Se dinamizÃ³ completamente `/api/project/fix/rules` leyendo `.prototipe.json` para resolver el Core dinÃ¡micamente en lugar del acoplamiento rÃ­gido con "App Ventas", extendiendo la restauraciÃ³n a reglas de almacenamiento y de Ã­ndices. Finalmente, se actualizaron las reglas por defecto en `generator.js` con esquemas restrictivos seguros por defecto. Asimismo, se corrigiÃ³ un error crÃ­tico `ReferenceError: dir is not defined` en el endpoint `/api/project/drift/global` que causaba que el cÃ¡lculo de drift global fallara al intentar evaluar instancias.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CORE-091: AlineaciÃ³n e Integridad de TelemetrÃ­a Central y Ping-Pong en Cores e Instancias~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: Se solucionÃ³ una desincronizaciÃ³n fÃ­sica (drift) que degradaba la conexiÃ³n en tiempo real entre las instancias cliente y el Dashboard Central. Se inyectÃ³ `centralFirebaseService.js` en el Core `App Ventas/` y se actualizÃ³ `useAppConfigSync.js` con el listener de instantÃ¡neas de 176 lÃ­neas en el Core y la instancia cliente `ventas-moni-app`, restaurando el canal de ping-pong y sistemaAlerta. Validado localmente con sincronizaciÃ³n y build completo.
  - Archivos: [Plantillas Core/App Ventas/src/services/centralFirebaseService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/centralFirebaseService.js) [NEW], [Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js) [MODIFY]

* **[x] ~~Tarea CORE-090: Blindaje a Futuro contra CachÃ© Persistente en Despliegues de Hosting PWA (CORE-090)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: Se implementÃ³ un blindaje integral a nivel de todo el ecosistema para solucionar la persistencia de cachÃ© en Firebase Hosting. Se inyectaron reglas de cabeceras HTTP (`Cache-Control`) para servir sin cachÃ© los archivos de control (`index.html`, `sw.js`, `firebase-messaging-sw.js`, manifiestos) y con cachÃ© inmutable de larga duraciÃ³n los assets estÃ¡ticos con hash (`/assets/**`), tanto en `firebase.json` del Core de Ventas como en la instancia del cliente. Se estandarizÃ³ el registro del Service Worker en `main.jsx` de todas las plantillas (`App Ventas`, `template-ventas`, `template-core-seed`) y de la instancia cliente con un callback y un listener de `controllerchange` en el cliente para forzar una recarga suave automÃ¡tica, protegido contra recargas en primera carga. Finalmente, se inyectaron rutinas automÃ¡ticas de auto-curaciÃ³n de estas cabeceras tanto en el aprovisionador del CLI (`generator.js`) como en el pipeline de pre-flight del servidor CLI (`server.js`).
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [Plantillas Core/App Ventas/firebase.json](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firebase.json) [MODIFY], [Plantillas Core/App Ventas/src/main.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/main.jsx) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/firebase.json](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/firebase.json) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/src/main.jsx](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/main.jsx) [MODIFY]

* **[x] ~~Tarea CORE-089: Pre-flight Validation Pipeline y Blindaje de Integridad de SincronizaciÃ³n en CLI Server (CORE-089)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: Se implementÃ³ un robusto pipeline de validaciÃ³n e integridad pre-flight (`validateClientIntegrityBeforeSync`) en el motor de sincronizaciÃ³n fÃ­sica del Bridge CLI. El sistema extrae el `clientId` de `.prototipe.json` y resuelve el `projectId` de Firebase; consulta en Firestore central la facturaciÃ³n y el token de telemetrÃ­a; lee y auto-cura `.env.local` agregando credenciales reales vÃ­a Firebase CLI `apps:sdkconfig`; inyecta el service worker FCM (`firebase-messaging-sw.js`) ausente parcheÃ¡ndolo con credenciales estÃ¡ticas de la marca al vuelo; audita la interfaz de `firebaseConfig.js` inyectando exports ausentes (`messaging`); y copia scripts NPM requeridos. Validado localmente con compilaciÃ³n completa y exitosa de Vite.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-088: CorrecciÃ³n de Prioridad de DetecciÃ³n de Firebase Project ID en CLI Server (CORE-088)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: Se corrigiÃ³ un error en el helper `resolveFirebaseProjectId` del servidor CLI en el que la variable `meta.clientId` (ej. `moni-app`) enmascaraba el project ID correcto de Firebase al leer `.prototipe.json`, saltÃ¡ndose la consulta a `.firebaserc` y `.env.local` e intentando desplegar en un proyecto inexistente. Ahora se consulta primero `.firebaserc` y `.env.local` (el ID real `ventas-moni-app`) antes de recurrir a metadatos.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]


* **[x] ~~Tarea CORE-087: InicializaciÃ³n de Firebase, ExportaciÃ³n de Messaging y Saneamiento de CompilaciÃ³n en ventas-moni-app (CORE-087)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: Se solucionÃ³ el error fatal de pantalla en blanco provocado por credenciales vacÃ­as (`auth/invalid-api-key`) inyectando las claves de Firebase y de telemetrÃ­a correctas de la marca en `.env.local`. Asimismo, se actualizÃ³ `firebaseConfig.js` del cliente para exportar la mensajerÃ­a asÃ­ncrona (`messaging`) requerida por los hooks del core y se creÃ³ la carpeta `/scripts` con el generador de mapa semÃ¡ntico `generate_ia_map.js` para corregir y habilitar el proceso de compilaciÃ³n local (`npm run build`).
  - Archivos: [Instancias Clientes/ventas/ventas-moni-app/.env.local](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/.env.local) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/scripts/generate_ia_map.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/scripts/generate_ia_map.js) [NEW]

* **[x] ~~Tarea CORE-086: Propuesta TÃ©cnica y Visual para Mini-Dashboard Interactivo Inline en Hero (CORE-086)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: Se redactÃ³ y estructurÃ³ la propuesta de diseÃ±o UX y desarrollo tÃ©cnico para dotar de interactividad directa a las tres sub-tarjetas (Ventas del Mes, Lista de Control, Ãšltimos Pedidos) de la ilustraciÃ³n del Hero SVG. La propuesta define visual cues de descubrimiento (Floating badge "PruÃ©bame ðŸ‘†", micro-animaciÃ³n onboarding de atracciÃ³n, cursores e iluminaciones selectivas) y mecÃ¡nicas de interacciÃ³n en el DOM del SVG (tooltips dinÃ¡micos con hover de puntos en el grÃ¡fico, toggle interactivo de checkboxes con tachado de texto en vivo y ciclos de estado con explosiÃ³n de confeti en el badge de pedidos).
  - Archivos: [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-085: ExpansiÃ³n de Nichos Comerciales y Consistencia de ConfiguraciÃ³n Operativa (CORE-085) [RevisiÃ³n y Refinamiento]~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: Se expandieron las verticales comerciales a 13 nuevos nichos especÃ­ficos con 10 paletas HSL de contraste verificado (130 combinaciones completas light/dark en total) adaptadas estratÃ©gicamente a la identidad visual de cada vertical. Se inyectaron de forma consistente en `dev-dashboard` y en los archivos `palettes.js` de las plantillas (`template-ventas`, `template-core-seed`, `App Ventas`) y en la instancia del cliente activo (`ventas-moni-app`). Se incluyeron catÃ¡logos de prueba y la inyecciÃ³n de atributos dinÃ¡micos en `niche.json` desde la CLI. Adicionalmente, se implementÃ³ el endpoint de fusiÃ³n en la CLI y el fallback en `billingService.js`. Finalmente, se resolviÃ³ la integridad del prebuild registrando e indexando la propuesta tÃ©cnica `propuesta_dashboard_interactivo.md` del Hero en el `README.md` de la biblioteca y en `ComponentSandbox.jsx` (`COMPONENT_META`).
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [App Ventas/src/services/billingService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/billingService.js) [MODIFY], [dev-dashboard/src/components/admin/ComponentSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY], [Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY], [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/analisis_nichos_mercado_saas.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/analisis_nichos_mercado_saas.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY], [Prototipe-CLI/templates/template-ventas/src/constants/palettes.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/constants/palettes.js) [MODIFY], [Prototipe-CLI/templates/template-core-seed/src/constants/palettes.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/constants/palettes.js) [MODIFY], [Plantillas Core/App Ventas/src/constants/palettes.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/constants/palettes.js) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/src/constants/palettes.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/constants/palettes.js) [MODIFY]

* **[x] ~~Tarea CORE-084: Matriz de Paridad Inteligente, Blindaje de SincronizaciÃ³n y FusiÃ³n de index/package en CLI Server~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: Se unificÃ³ y blindÃ³ el motor de paridad y sincronizaciÃ³n fÃ­sica del CLI. Se inyectÃ³ el helper unificado `isPathExcludedFromSync()` con soporte de expresiones regex para excluir archivos crÃ­ticos de base de datos (`.firebaserc`, `firebase.json`), variables de entorno (`.env.*`), logotipos (`logo.*`), favicons, y carpetas temporales (`scratch/`, `scripts/`, `playwright-report/`, `test-results/`) en cualquier Core o cliente. Se implementÃ³ fusiÃ³n inteligente de `index.html` (preservando el tÃ­tulo, metatags SEO y scripts de analÃ­ticas de terceros del cliente en la zona segura de marcado) y mezcla lÃ³gica de dependencias y scripts en `package.json` sin alterar la identidad de la marca. Finalmente, se auditÃ³ exhaustivamente el listado de 17 archivos del directorio `src/` marcados por el Drift Detector, validando que corresponden a lÃ³gica pura de software sin parÃ¡metros fijos ni credenciales de marca.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_paridad_y_exclusiones_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_paridad_y_exclusiones_2026.md) [NEW], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_archivos_sincronizables_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_archivos_sincronizables_2026.md) [NEW], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-083: ValidaciÃ³n de package.json en ResoluciÃ³n de Proyectos de Clientes en CLI Server~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: Se soluciona el error ENOENT al intentar compilar y desplegar cores (como 'ventas') desde el Dashboard. La funciÃ³n `findProjectDir` en `server.js` coincidÃ­a de forma codiciosa con carpetas vacÃ­as de nicho (ej. `Instancias Clientes\ventas`) basÃ¡ndose Ãºnicamente en el nombre de la carpeta, omitiendo el fallback a cores conocidos. Se inyectÃ³ una validaciÃ³n para exigir que la carpeta contenga obligatoriamente un archivo `package.json` antes de validar el nombre de la carpeta, garantizando que solo se resuelvan proyectos Node estructurados vÃ¡lidos.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-082: AlineaciÃ³n, Icono de WhatsApp, Ajuste de Desbordamiento y CorrecciÃ³n de VibraciÃ³n de Botones MagnÃ©ticos en Calculadora CRO~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalizaciÃ³n: 2026-06-26
  - DescripciÃ³n: Se corrigen 4 fallos de UI/UX en la Calculadora de DiagnÃ³stico Express y los Botones MagnÃ©ticos: (1) Desbordamiento: Se inyecta `overflow-wrap: break-word` y afines en el contenedor de recomendaciones para evitar que textos continuos sin espacios rompan el layout. (2) AlineaciÃ³n: Se extrae el toggle de tipo de reto para colocarlo como un switcher superior de tipo "pill", alineando horizontalmente los inputs de ambas columnas a la misma altura. (3) Icono de WhatsApp: Se cambia el SVG del botÃ³n de resultados por el oficial completo (burbuja + telÃ©fono). (4) VibraciÃ³n de Botones: Se desactivan los pointer-events en los botones interactivos dentro del wrapper magnÃ©tico para estabilizar la atracciÃ³n, gestionando el click y hover desde el propio wrapper.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-081: Flexibilidad de Entrada de Dolor y PrevenciÃ³n de Desplazamiento en Calculadora CRO~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-25
  - Fecha de finalizaciÃ³n: 2026-06-25
  - DescripciÃ³n: Se aplicaron dos mejoras crÃ­ticas a la Calculadora de DiagnÃ³stico Express (CRO) en la landing page: (1) Flexibilidad de Entrada: Se implementÃ³ un control de tipo radio toggle en el segundo paso ("Â¿CuÃ¡l es tu mayor reto hoy?") que permite al usuario alternar entre seleccionar un reto preconfigurado de la lista dinÃ¡mica ("Seleccionar de la lista") o redactar su propia necesidad a travÃ©s de un campo de Ã¡rea de texto de tamaÃ±o responsivo ("Prefiero escribirlo"). Al escribir en la entrada personalizada, la propuesta recomendada y el mensaje/URL de WhatsApp se actualizan automÃ¡ticamente en tiempo real para reflejar el texto exacto redactado por el usuario. (2) PrevenciÃ³n de Desplazamiento (Scroll Chaining): Se implementaron controladores de eventos JavaScript para capturar eventos de scroll (\`wheel\` y \`touchmove\`) en las listas de opciones del Custom Select (\`#custom-options-nicho\` y \`#custom-options-dolor\`). Esto evita que el scroll continÃºe y mueva toda la landing page al llegar a los lÃ­mites (superior o inferior) de las listas desplegables, confinando la navegaciÃ³n dentro del dropdown.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-080: Forzado de la Rama de Desarrollo (develop) en Herramienta de Respaldos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-25
  - Fecha de finalizaciÃ³n: 2026-06-25
  - DescripciÃ³n: Se modificaron los scripts de respaldo de PowerShell (`git_backup.ps1` y `subproject_backup.ps1`) para garantizar que al finalizar el proceso de guardado/push, el desarrollador quede posicionado de forma automÃ¡tica en la rama de desarrollo `develop`. En `git_backup.ps1` (respaldo maestro) se aÃ±adiÃ³ un bloque en `finally` que realiza el checkout a `develop`. En `subproject_backup.ps1` (respaldo de subproyectos) se adaptÃ³ la lÃ³gica final del bloque `finally` para cambiar la rama activa a `develop` de forma automÃ¡tica al guardar componentes base (Cores, Dashboard, etc.), mientras que las ramas de instancias cliente (`cliente/*`) se respetan y regresan a su rama correspondiente de forma segura.
  - Archivos: [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-079: OptimizaciÃ³n de Rendimiento de Scroll y Consistencia de Interlineado de TÃ­tulos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-25
  - DescripciÃ³n: Se aplicaron tres optimizaciones core a la landing page: (1) Rendimiento de Scroll: Se eliminÃ³ el lag de scroll y los cuellos de botella de renderizado en GPU al erradicar la transiciÃ³n universal `*` (que forzaba al navegador a calcular transiciones de color, fondo, bordes y sombras para todo el DOM). Se sustituyÃ³ por una clase de transiciÃ³n temporal `.theme-transition` gestionada dinÃ¡micamente en JS que se aÃ±ade y remueve en un lapso de 300ms durante la alternancia de tema, combinada con transiciones explÃ­citas y eficientes en hover para elementos interactivos como `.btn`, `.glass-card` y `.nav-links a`. (2) Consistencia de TÃ­tulos: Se creÃ³ un selector CSS global para encabezados `h1, h2, h3, h4, h5, h6` que unifica la tipografÃ­a `Outfit` y establece un interlineado compacto y adecuado de `line-height: 1.25` para tipografÃ­as grandes, eliminando declaraciones de interlineado redundantes en los bloques de estilos especÃ­ficos y manteniendo ajustes finos individuales donde se requerÃ­a. (3) ReducciÃ³n de SeparaciÃ³n en SoluciÃ³n: Se corrigiÃ³ el espaciado vertical excesivo entre el tÃ­tulo y el copy en la tarjeta de la secciÃ³n SoluciÃ³n. Se achicaron los paddings laterales de la tarjeta en mÃ³viles (max-width: 768px y 480px) de 3rem a 1.5rem y 1.2rem respectivamente, ampliando el ancho Ãºtil del texto. Esto estabiliza el morphing en solo 2 lÃ­neas en pantallas pequeÃ±as, permitiendo disminuir el min-height del h3 a 2.5em en tablets y 2.6em en mÃ³viles (antes 3.2em y 4.2em), reduciendo la separaciÃ³n de forma compacta y simÃ©trica sin causar layout shifts.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-078: CorrecciÃ³n de InterceptaciÃ³n de WhatsApp Leads y Layout Shifts~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Se solucionaron fallos crÃ­ticos y advertencias en la landing page: (1) Apertura del Modal de Leads de WhatsApp y Botones MagnÃ©ticos: Se reparÃ³ un bug de sintaxis/anidaciÃ³n en la estructura de las IIFEs de los scripts al final de la pÃ¡gina, donde la IIFE de los Botones MagnÃ©ticos estaba anidada incorrectamente dentro de la IIFE de Leads Express, e impedÃ­a la invocaciÃ³n de esta Ãºltima al estar declarada como expresiÃ³n evaluada no ejecutada `(function() { ... });` debido a un cierre errÃ³neo con `});` en lugar de `})();`. Al separar limpiamente ambas IIFEs en mÃ³dulos autÃ³nomos y re-establecer el listener global en `document`, se recuperÃ³ la visualizaciÃ³n del Modal de Leads Express de forma exitosa y el efecto magnÃ©tico en los botones de WhatsApp. AdemÃ¡s, se removiÃ³ la exclusiÃ³n `.btn-navbar` para que el botÃ³n "AsesorÃ­a Gratis" del encabezado tambiÃ©n reciba el efecto magnÃ©tico en desktop. (2) Layout Shifts en SoluciÃ³n y Beneficios: Se inyectÃ³ un `min-height: 7.3em;` en `.solution-box h3` bajo la media query mÃ³vil para frase de 3 lÃ­neas y evitar brincos dinÃ¡micos. Para el typewriter de `#beneficios .section-header h2`, se implementÃ³ la tÃ©cnica avanzada de pre-renderizado con opacidad de spans individuales (letra por letra), de modo que el tÃ­tulo reserve su altura fÃ­sica final exacta (46px) desde la carga de la pÃ¡gina, y se vayan revelando visualmente con opacidad sin alterar el flujo del DOM (layout shift = 0px). (3) Advertencia de Seguridad Local (file://): Se erradicÃ³ la advertencia de Chrome sobre "Unsafe attempt to load URL..." que aparecÃ­a en consola al hacer clic en enlaces de anclaje internos (#solucion, #problema, etc.) al abrir el archivo HTML directamente desde el explorador local. Se implementÃ³ un interceptor de eventos en JS que ejecuta un desplazamiento suave de precisiÃ³n compensando la altura de la navbar fija y previene la navegaciÃ³n nativa por defecto en entornos locales.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-077: OptimizaciÃ³n y RediseÃ±o de MenÃº Hamburguesa MÃ³vil~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Se mejorÃ³ la visualizaciÃ³n y rendimiento del menÃº mÃ³vil desplegable (`.nav-links` en `@media (max-width: 968px)`): (1) Ancho Completo: Se ampliÃ³ el ancho del menÃº al 100% de la pantalla (`width: 100%; max-width: 100%;`), eliminando la franja blanca lateral y dando espacio completo para evitar que los enlaces largos se rompan de forma apretada. (2) Color SÃ³lido: Se inhabilitÃ³ la opacidad y los filtros `backdrop-filter` que ralentizaban la renderizaciÃ³n, definiendo un fondo 100% sÃ³lido adaptado a cada tema (`var(--color-surface)` en claro y `var(--color-bg)` en oscuro). (3) AceleraciÃ³n de TransiciÃ³n: Se redujo el tiempo de la transiciÃ³n a `0.28s` con una curva `cubic-bezier(0.25, 1, 0.5, 1)`, logrando una salida e ingreso del menÃº sumamente responsivos, veloces y fluidos.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-076: MitigaciÃ³n de Layout Shift en Texto Cambiante de SoluciÃ³n~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Se aplicÃ³ un blindaje de estabilidad visual en la tarjeta de la secciÃ³n **La SoluciÃ³n**: (1) En desktop, se inyectÃ³ un `min-height: 2.8em` en `.solution-box h3`. (2) En la versiÃ³n responsiva mÃ³vil (`@media (max-width: 768px)`), se redujo la tipografÃ­a a `clamp(1.3rem, 4.5vw, 1.8rem)` y se inyectÃ³ un `min-height: 3.2em` para albergar hasta 3 lÃ­neas estables. (3) En mÃ³viles ultra-estrechos (`@media (max-width: 480px)`), se ajustÃ³ la tipografÃ­a a `clamp(1.15rem, 5vw, 1.4rem)` y se estableciÃ³ un `min-height: 4.2em`. Esto reserva el espacio fÃ­sico exacto para albergar frases largas (como "tu emprendimiento") sin deformar la tarjeta ni empujar el texto inferior, logrando un Cumulative Layout Shift de exactamente 0.00 en todos los dispositivos.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-075: Centrado de Tarjetas de Dolor, DescompactaciÃ³n de CRO y CorrecciÃ³n de Recortes 3D/Errores de Consola~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Se aplicaron mÃºltiples mejoras estÃ©ticas, lÃ³gicas y correctivas: (1) Tarjetas de Dolor: Se reestructuraron las tarjetas `.pain-card` de la secciÃ³n El Problema a un diseÃ±o de columna centrada (`flex-direction: column; align-items: center; text-align: center`), lo que mejora drÃ¡sticamente el espacio de lectura en mÃ³viles y proporciona una simetrÃ­a premium. (2) Tarjeta de ComparaciÃ³n de Tiempo: Se descompactÃ³ el layout aumentando paddings y gaps de la tarjeta y las filas. AdemÃ¡s, se redefiniÃ³ `.time-label` a `display: block` y se le inyectÃ³ un margen derecho al `strong`, solucionando de raÃ­z el pegado y traslape de palabras tras los dos puntos (`Antes:Procesos` y `PROTOTIPE:registrado`). (3) Testimonios: Se inyectÃ³ padding vertical extra (`padding-top: 1.5rem; padding-bottom: 2.5rem; margin-top: -1.5rem;`) y `overflow-y: visible !important;` en el carrusel de testimonios en mÃ³viles para dar un espacio fÃ­sico de proyecciÃ³n en el eje Z a las tarjetas y evitar que se recorten sus esquinas al rotar en 3D. (4) Preguntas Frecuentes: Se removiÃ³ el buscador de FAQs (HTML, CSS y el script de filtro de bÃºsqueda JS) segÃºn la solicitud del usuario. (5) Registro de Service Worker: Se aÃ±adiÃ³ una validaciÃ³n `window.location.protocol !== 'file:'` y control de excepciones en JS para evitar fallas y silenciar el TypeError del Service Worker al abrir el archivo HTML localmente desde el explorador.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-074: Escalado de IlustraciÃ³n Hero, RemociÃ³n de Focus Rings y Bloqueo Global de SelecciÃ³n~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Se ampliaron las dimensiones de la ilustraciÃ³n del Hero en escritorio y mÃ³vil, aumentando su `max-width` global a `560px` y reduciendo el padding horizontal de `.container` en mÃ³viles a `1.25rem`. Se implementaron reseteos CSS globales inyectando `outline: none !important` y `-webkit-tap-highlight-color: transparent !important` de forma universal (`*`) para anular cualquier rastro de halo de enfoque azul o sombra del navegador. Por Ãºltimo, se bloqueÃ³ la selecciÃ³n de texto en todo el sitio de manera general con `user-select: none !important` excluyendo exclusivamente los campos `<input>` y `<textarea>` del formulario del modal de leads para preservar la usabilidad del CRO.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-073: ReducciÃ³n de TamaÃ±o de Texto del Hero en VersiÃ³n MÃ³vil~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Se redujo el tamaÃ±o de fuente del pÃ¡rrafo principal del Hero (`.hero-content p`) en la versiÃ³n mÃ³vil (`@media (max-width: 576px)`) a `1rem`. Esto soluciona la falta de jerarquÃ­a visual y contraste de tamaÃ±o entre el tÃ­tulo H1 (`2.1rem` en mÃ³viles) y el pÃ¡rrafo descriptivo en pantallas pequeÃ±as.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-072: OptimizaciÃ³n de Botones MagnÃ©ticos, RemociÃ³n de LÃ­neas de Flujo y RediseÃ±o de Theme Toggle~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Se mejorÃ³ el efecto magnÃ©tico en los botones primarios, secundarios, de WhatsApp y en el botÃ³n del encabezado "AsesorÃ­a Gratis", inyectando una zona de interacciÃ³n extendida (padding virtual de 16px y margen de -16px) en el wrapper para prevenir el jittering. Se corrigiÃ³ un bug de persistencia de la sombra (glow) de fondo de los botones magnÃ©ticos obligando al JS a restablecer explÃ­citamente la opacidad del glow a 0 en el evento `mouseleave`. Se rediseÃ±Ã³ el botÃ³n de modo oscuro (theme-toggle-btn) con SVGs premium en lÃ­nea de Sol y Luna que giran y se escalan de forma cruzada usando transiciones CSS. Finalmente, se eliminaron las lÃ­neas de flujo SVG verticales animadas inter-secciones por solicitud visual del usuario.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-071: Enriquecimiento EstÃ©tico de Fondo, Glow Blobs y Visibilidad de PartÃ­culas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Incremento de la visibilidad de los nodos y lÃ­neas de la red de partÃ­culas del Hero (triplicando la opacidad base de `0.12` a `0.28` para nodos y de `0.06` a `0.18` para lÃ­neas), permitiendo que la interacciÃ³n del mouse y del fondo sea apreciable. AdemÃ¡s, se inyectaron dos elementos glow blobs de color adaptativo (`.glow-blob glow-blob-primary` y `.glow-blob glow-blob-secondary`) en el fondo del Hero. Estos generan un efecto aurora moderno difuminado en base al color azul primario de la marca y un color violeta complementario, que pulsa orgÃ¡nicamente en tamaÃ±o y opacidad (efecto respiraciÃ³n mediante la animaciÃ³n CSS `blob-pulse` de 12s) usando variables de opacidad de CSS que se adaptan automÃ¡ticamente a los temas claro y oscuro, eliminando negros absolutos.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]


* **[x] ~~Tarea CORE-070: Robustecimiento de WhatsApp FAB/Botones e IntegraciÃ³n de Formulario Lead Express~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: ImplementaciÃ³n de un Modal de Captura de Leads Express amigable y premium (glassmorphic y responsivo en mÃ³viles) que intercepta de forma global los redireccionamientos a WhatsApp (enlaces que contienen `wa.me`). El modal solicita el Nombre completo (obligatorio), NÃºmero de contacto (obligatorio) y Correo electrÃ³nico (totalmente opcional, informando que puede dejarse vacÃ­o). Al enviar el formulario, el sistema decodifica el mensaje predeterminado contextual del botÃ³n cliqueado, construye un mensaje enriquecido con la etiqueta `ðŸ“¢ [Prototype Web]` para identificar la procedencia (para no confundirlos con otros emprendimientos del usuario), e inicia la conversaciÃ³n en una nueva pestaÃ±a. Se inyectÃ³ el HTML del modal `#lead-modal`, los estilos responsivos adaptados a mÃ³viles (botones apilados verticalmente y padding compacto en viewports pequeÃ±os), y la lÃ³gica con listener global mediante delegaciÃ³n de eventos y compatibilidad con botones modificados dinÃ¡micamente como el de la calculadora CRO. **Ajustes de Calidad y Refinamiento (Bugfix):** Se transformÃ³ la etiqueta `<form>` en el propio contenedor del modal (`modal-container lead-modal-container`) para contener adecuadamente los elementos bajo la estructura flexbox de la landing page, eliminando el desbordamiento de los botones por debajo del marco del modal. Adicionalmente, se configurÃ³ una altura mÃ¡xima de `90vh !important` y se redujeron los paddings y mÃ¡rgenes del formulario para disminuir la altura total del modal a 420px, erradicando por completo cualquier scrollbar vertical residual y permitiendo visualizar todo el contenido de forma 100% visible en celulares y escritorio sin necesidad de scroll. **CorrecciÃ³n de CodificaciÃ³n de Emojis (Bugfix Emojis):** Se reemplazaron los caracteres de emojis literales en el script JS por sus respectivas secuencias de escape Unicode de ES6 (`\u{1F4E2}`, `\u{1F464}`, `\u{2709}\u{FE0F}` y `\u{1F4DE}`). Esto previene que navegadores o servidores que carguen el archivo con fallas de codificaciÃ³n de caracteres (ANSI/Windows-1252) compilen los emojis como caracteres corruptos. **Bypass del Acortador wa.me:** Tras detectar que el servidor de redireccionamientos de WhatsApp (`wa.me`) corrompe la codificaciÃ³n de los emojis transformÃ¡ndolos en caracteres rombo con signo de interrogaciÃ³n () en el chat de destino, se migraron todas las redirecciones y enlaces de la landing page directamente a `api.whatsapp.com/send`, lo cual garantiza que WhatsApp interprete el texto decodificado como UTF-8 puro y renderice los emojis correctos en cualquier plataforma. **Mejoras Adicionales de Excelencia (Accesibilidad, Caching y RedirecciÃ³n):** Se implementÃ³ soporte completo de navegaciÃ³n por teclado (Space, Enter, Escape, ArrowUp y ArrowDown) para los selectores customizados de la calculadora, inyectando los atributos de accesibilidad correspondientes (`role="listbox"`, `role="option"`, `aria-selected` y `tabindex="0"`). Se configurÃ³ el almacenamiento automÃ¡tico en LocalStorage de los datos del lead tras su primer envÃ­o, permitiendo auto-completar los campos de Nombre, Celular y Correo en futuras aperturas del modal para evitar redundancias y potenciar la tasa de conversiÃ³n (CRO). Finalmente, se aÃ±adiÃ³ una micro-animaciÃ³n de carga (spinner giratorio SVG) y desactivaciÃ³n del formulario durante 800ms tras presionar enviar, previniendo dobles envÃ­os y optimizando la fluidez de redirecciÃ³n.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]


* **[x] ~~Tarea CORE-069: CorrecciÃ³n de Icono Calculadora, EstabilizaciÃ³n de Beneficios y AlineaciÃ³n SimÃ©trica de KPIs~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Ajustes visuales, correctivos y de scroll en la Landing Page: (1) Icono y Trigger: Se sustituyÃ³ el SVG del trigger colapsable de la calculadora por el SVG oficial de calculadora de Lucide, eliminando la lÃ­nea base que parecÃ­a una papelera, e inyectando media queries responsivas para evitar la compresiÃ³n del texto del trigger en mÃ³viles. (2) Estabilidad de Scroll: Se removiÃ³ la expansiÃ³n y colapso dinÃ¡micos por scroll de `.benefit-card`, restaurando el copy del beneficio como estÃ¡tico en CSS y removiendo su IntersectionObserver, eliminando por completo los saltos bruscos y el layout shift al desplazarse. (3) AlineaciÃ³n SimÃ©trica de KPIs: En la secciÃ³n Organizado, se fijaron alturas mÃ­nimas a los tÃ­tulos (`h3` con min-height de 2.8rem en desktop / 2rem en mÃ³vil) y a los valores (`.organizado-value` con min-height de 3.5rem en desktop / 1.8rem en mÃ³vil), y se aplicÃ³ `margin-top: auto` en `.organizado-status-badge`, logrando una perfecta alineaciÃ³n horizontal simÃ©trica de todos los elementos en escritorio y en el mini-dashboard de mÃ³viles.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]


* **[x] ~~Tarea CORE-068: OptimizaciÃ³n de UX de Beneficios, Dashboard de KPIs MÃ³vil y Ajuste de Testimonios~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Refinamiento responsivo profundo de la Landing Page en tres secciones crÃ­ticas: (1) SecciÃ³n Beneficios: Se inyectaron transiciones CSS de colapso y expansiÃ³n en `.benefit-card p` controladas mediante un IntersectionObserver en JS, mostrando inicialmente solo los tÃ­tulos y expandiendo/retrayendo el texto descriptivo dinÃ¡micamente segÃºn la visibilidad en el scroll para optimizar el espacio vertical. (2) SecciÃ³n Organizado: En viewports mÃ³viles (â‰¤ 768px), se reestructurÃ³ la cuadrÃ­cula vertical en una fila horizontal compacta de 3 columnas (`grid-template-columns: repeat(3, 1fr)`) con paddings de 1rem, reduciendo tipografÃ­as e iconos SVG para crear un dashboard analÃ­tico de mini-KPIs compacto de una sola fila. (3) SecciÃ³n Testimonios: Se ajustÃ³ el alto de las tarjetas de testimonios (`.flip-inner`) a 350px en mÃ³viles, achicando paddings, gaps y tipografÃ­as para erradicar el desbordamiento de contenido y el scroll interno vertical secundario.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]


* **[x] ~~Tarea CORE-067: CorrecciÃ³n de Scroll Dropdown, Responsividad en BotÃ³n WhatsApp y AutocalibraciÃ³n de Giroscopio MÃ³vil~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: SoluciÃ³n de problemas responsivos y de experiencia en mÃ³viles en la calculadora y en la interactividad 3D. Se aplicÃ³ `overscroll-behavior: contain` y `-webkit-overflow-scrolling: touch` en `.custom-options` de la calculadora para contener el scroll tÃ¡ctil e impedir que arrastre la pÃ¡gina de fondo. Se agregaron media queries especÃ­ficas (`@media (max-width: 576px)`) para reducir el padding del contenedor de resultados `.configurador-result` y optimizar la tipografÃ­a y padding de `#config-cta-btn` en mÃ³viles, evitando la fragmentaciÃ³n tosca del texto. Finalmente, se reemplazÃ³ la calibraciÃ³n estÃ¡tica del giroscopio por un algoritmo de **AutocalibraciÃ³n DinÃ¡mica de LÃ­nea Base (Dynamic Baseline Calibration)** con un factor de suavizado (`lerp` de `0.04`) en el evento `deviceorientation`, permitiendo que las tarjetas se auto-centren fluidamente en 1.5s sin importar en quÃ© Ã¡ngulo el usuario sostenga el mÃ³vil (ej. acostado horizontalmente), y reaccionando exclusivamente ante movimientos rÃ¡pidos de rotaciÃ³n.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]


* **[x] ~~Tarea CORE-066: OptimizaciÃ³n de Rendimiento General de Animaciones y AceleraciÃ³n por GPU~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: ImplementaciÃ³n de aceleraciÃ³n de hardware (GPU) en las tarjetas de rubros (`.rubro-card`) y en las tarjetas de testimonios (`.flip-inner`) mediante la inyecciÃ³n de `will-change: transform`, `backface-visibility: hidden` y `transform-style: preserve-3d` en CSS para mitigar DOM repaints provocados por el efecto 3D Tilt y rotaciones interactivas. Asimismo, se integrÃ³ optimizaciÃ³n inteligente del loop de renderizado de partÃ­culas en el `<canvas id="hero-canvas">` mediante la API de IntersectionObserver, pausando el loop y cancelando los frames (`cancelAnimationFrame`) cuando la secciÃ³n del Hero ya no es visible en pantalla para evitar consumo innecesario de GPU/CPU y lag al hacer scroll vertical.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]


* **[x] ~~Tarea CORE-065: RediseÃ±o de la Calculadora CRO, Retos DinÃ¡micos por Nicho y Colapso por Trigger~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: ModificaciÃ³n profunda y optimizaciÃ³n UX de la Calculadora de DiagnÃ³stico Express en `Index.html`. Se retirÃ³ el emoji de cohete del encabezado. Se implementaron Custom Selects de HTML/CSS/JS (desplegables personalizados con glassmorphic design, bordes redondeados y flechas de rotaciÃ³n reactiva) sincronizados con los selects nativos de fondo. Se investigaron en internet y estructuraron 32 retos operacionales especÃ­ficos y soluciones recomendadas profesionales detalladas para los 8 rubros de negocio. Adicionalmente, se configurÃ³ el colapso del configurador ocultÃ¡ndolo por defecto bajo una tarjeta trigger interactiva con animaciÃ³n de pulso y glow en hover, agregando un botÃ³n de cierre en la calculadora para volver a colapsarla y optimizar el espacio vertical de la pÃ¡gina. Asimismo, se optimizÃ³ el rendimiento del efecto de InclinaciÃ³n 3D (3D Tilt) en desktop desactivando la propiedad `transition` de CSS en `mouseenter` para lograr un seguimiento inmediato al cursor sin lag, y reactivando la transiciÃ³n al salir (`mouseleave`). En mÃ³viles, se implementÃ³ el Efecto de InclinaciÃ³n 3D GiroscÃ³pico (Paralaje FÃ­sico 3D) mediante la Device Orientation API (inclinando suavemente las tarjetas al mover fÃ­sicamente el telÃ©fono) con filtrado de viewport mediante IntersectionObserver para procesar solo tarjetas visibles (ahorro de baterÃ­a), lÃ­mites de Ã¡ngulo de inclinaciÃ³n para preservar legibilidad, limitaciÃ³n de frecuencia a ~30Hz, y refresco suavizado mediante requestAnimationFrame.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]


* **[x] ~~Tarea CORE-064: Refinamiento de Animaciones y Efecto Tilt 3D Selectivo~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Refinamiento de interactividad en la Landing Page en `Index.html` mediante la expansiÃ³n selectiva del Efecto Tilt 3D (InclinaciÃ³n 3D de perspectiva). Se expandiÃ³ el efecto a las tarjetas de rubro/negocios (`.rubro-card`) en la vista desktop utilizando una escala adaptativa coordinada con el CSS de hover (1.03) para evitar saltos tipogrÃ¡ficos y visuales. Asimismo, se excluyeron explÃ­citamente las tarjetas del acordeÃ³n colapsable de preguntas frecuentes (`.faq-item`) para prevenir interferencias de UX en la lectura de las respuestas.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]


* **[x] ~~Tarea CORE-063: OptimizaciÃ³n SEO y Tasa de ConversiÃ³n (CRO) en Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: ImplementaciÃ³n de mejoras de posicionamiento SEO y optimizaciones de tasa de conversiÃ³n (CRO) en la Landing Page de PROTOTIPE en `Index.html`. **Mejoras SEO:** Se inyectaron metadatos estructurados en formato JSON-LD (`ProfessionalService` schema markup) para indexaciÃ³n enriquecida en Google, tag de URL canÃ³nica (`canonical`), y metadatos complementarios Open Graph; ademÃ¡s se inyectÃ³ accesibilidad semÃ¡ntica (`role="img"`, `aria-labelledby`, `<title>` y `<desc>`) al SVG interactivo del Hero. **Mejoras de ConversiÃ³n (CRO):** Se desarrollÃ³ la "Calculadora de DiagnÃ³stico Express", un widget interactivo con 32 combinaciones de nichos/dolores de negocio que actualiza dinÃ¡micamente una recomendaciÃ³n personalizada y autogenera un enlace pre-formateado directo a WhatsApp en base a la selecciÃ³n. Adicionalmente, se maquetÃ³ la secciÃ³n `#faq` de Preguntas Frecuentes mediante un acordeÃ³n premium responsivo con auto-cierre exclusivo de Ã­tems activos y estilos adaptados al modo claro/oscuro.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-062: Interactividad MÃ¡xima y 10 Animaciones Profesionales en Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: ImplementaciÃ³n de 10 animaciones profesionales premium en todas las secciones de la Landing Page en `Index.html` para maximizar la interactividad de forma limpia, amigable y responsiva. **Ajuste UI/UX (RevisiÃ³n v2):** Se eliminaron los cÃ­rculos de carga (SVG gauges) en las tarjetas de `#negocio-organizado` por considerarse innecesarios para el estilo limpio de la pÃ¡gina (manteniendo la animaciÃ³n de confeti). Se aumentÃ³ la altura mÃ­nima de las tarjetas flip-inner de testimonios (`min-height: 350px` en desktop y `380px` en mÃ³viles) para solucionar de raÃ­z el desbordamiento inferior del autor en textos largos. En `#como-funciona` se removiÃ³ por completo la lÃ­nea divisoria vertical del timeline por ser irrelevante en el diseÃ±o horizontal, y se rediseÃ±Ã³ la numeraciÃ³n de los pasos (`.step-num`) eliminando su fondo azul rectangular tosco para dejar un nÃºmero grande elegante que se ilumina con el IntersectionObserver de scroll. **Ajuste UI/UX (RevisiÃ³n v3 - Mobile Tap Hints):** Se inyectÃ³ en cada tarjeta de rubro el elemento `.rubro-tap-hint` ("Toca para ver ðŸ‘†") con sus respectivos estilos CSS responsivos y animaciÃ³n de pulso infinito para incitar y guiar el toque en mÃ³viles, ademÃ¡s de perfeccionar la visibilidad ocultando al 100% el contenido frontal al desplegar el overlay.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-061: Escala Premium Landing Page â€” 13 Mejoras de ConversiÃ³n, NavegaciÃ³n, UX y Mobile~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: ImplementaciÃ³n de 13 mejoras premium agrupadas en 4 bloques: **Bloque A** (conversiÃ³n) â€” WhatsApp FAB flotante con anillo de pulso, micro-copy de confianza bajo el CTA del Hero, secciÃ³n `#testimonios` con 3 fichas de rubros reales (ferreterÃ­a/restaurante/taller) y secciÃ³n `#rubros` con grid de 8 tipos de negocio interactivos. **Bloque B** (navegaciÃ³n) â€” Scroll Progress Bar de 3px con gradiente animado y Navbar Active con indicador underline animado que resalta el enlace de la secciÃ³n visible. **Bloque C** (micro-UX) â€” AnimaciÃ³n word-by-word en el H1 del Hero y efecto tilt 3D perspectiva en cards solo en desktop. **Bloque D** (mobile) â€” TipografÃ­a responsive con `clamp()`, padding de secciones reducido en mÃ³vil, botones CTA 100% de ancho en pantallas pequeÃ±as.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-060: HumanizaciÃ³n de Landing Page y Tarjetas Visuales de Confianza~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: RediseÃ±o visual de confianza y humanizaciÃ³n de la landing page corporativa de PROTOTIPE en `Index.html` para pequeÃ±os y medianos negocios. Se integrÃ³ una tarjeta de comparaciÃ³n interactiva "Antes y DespuÃ©s" en la secciÃ³n de Problema que describe visualmente la fricciÃ³n de procesos manuales frente al orden digital. Se aÃ±adieron dos tarjetas ilustrativas al final de Beneficios: "Tu negocio hoy, bajo control" (con checks elÃ¡sticos progresivos) y "Menos tiempo organizando, mÃ¡s tiempo atendiendo" (con barras comparativas de tiempos animados que ilustran el ahorro diario de 3 horas a 30 minutos). Se implementÃ³ la nueva secciÃ³n intermedia "AsÃ­ se siente un negocio organizado" con una grilla de tres tarjetas interactivas (Ventas del dÃ­a, Inventario, Clientes atendidos) y animaciones fluidas de conteo dinÃ¡mico (Count-Up) a 60 FPS con suavizado cuadrÃ¡tico. Finalmente, se inyectÃ³ la tarjeta de estado del dÃ­a en la secciÃ³n de Soporte.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-059: Enriquecimiento DinÃ¡mico y Animaciones del Ecosistema de Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: IncorporaciÃ³n de animaciones dinÃ¡micas interactivas de alta gama en la landing page. Se implementÃ³ una animaciÃ³n de flotaciÃ³n vertical lenta en la ilustraciÃ³n SVG del Hero. Se envolvieron los widgets del SVG ("Ventas del Mes", "Lista de Control" y "Ãšltimos Pedidos") en etiquetas de grupo interactivas con curvas Bezier elÃ¡sticas de escalado en hover (`scale(1.06)`) y drop-shadow azul de marca para incentivar la interacciÃ³n visual. Se inyectÃ³ un efecto de trazado dinÃ¡mico automÃ¡tico de la lÃ­nea del grÃ¡fico en el render inicial y cÃ­rculos pulsantes continuos en los nodos de datos. Adicionalmente, se integrÃ³ un efecto de brillo metÃ¡lico (`shimmer` de gradiente mÃ³vil) en los botones primarios para incitar la pulsaciÃ³n y se agregaron efectos de elevaciÃ³n elÃ¡stica (`translateY(-6px) scale(1.025)`) y realce de contorno en las tarjetas de la pÃ¡gina (`.glass-card`).
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-058: ImplementaciÃ³n de Secciones Legales e Integridad de Contacto en Footer de Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Limpieza de la secciÃ³n de contacto en el footer de `Index.html` removiendo la ubicaciÃ³n fÃ­sica de BogotÃ¡ y redefiniendo el correo como canal de soporte tÃ©cnico. ImplementaciÃ³n de modales interactivos y accesibles para "TÃ©rminos de Servicio" y "PolÃ­tica de Privacidad" con soporte de cierre por botÃ³n, click en backdrop, y tecla Escape. El contenido de las secciones legales fue adaptado al modelo de negocio real de PROTOTIPE (software a medida de marca blanca para negocios locales, protecciÃ³n y propiedad absoluta de los datos por parte del cliente, licencia no exclusiva de uso del core base y soporte prioritario).
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-051: RediseÃ±o Corporativo, Limpio y Humano de la Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: RediseÃ±o radical completo de Index.html basado en el nuevo brief de marca. Se transformÃ³ el portal de un estilo neÃ³n/cyberpunk tecnolÃ³gico a un diseÃ±o limpio, profesional e institucional de consultorÃ­a con enfoque en el usuario tradicional. Se implementÃ³ el Modo Claro por defecto (#F8FAFC) y modo oscuro persistente en localStorage libre de negros absolutos, se purgaron animaciones distractoras, destellos y la calculadora de ROI. Se estructuraron las secciones de Hero (con ilustraciÃ³n SVG inline del flujo de negocio), Problema, SoluciÃ³n personalizada, Beneficios claros, Flujo de 4 pasos, Soporte con tiempos de respuesta (24h/urgente), Confianza y el CTA final para WhatsApp.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-056: Preflight Check de Firebase, GestiÃ³n de Drift de Reglas y Purgado de Seeding/IA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Se implementÃ³ la verificaciÃ³n de credenciales de Firebase en el aprovisionador (Preflight Check), la gestiÃ³n del drift de reglas (Firestore/Storage) y despliegue directo desde el Dashboard central, y la purga absoluta del sistema de seeding y de cualquier rastro o script de Inteligencia Artificial (Gemini/Vertex) en el ecosistema.
  - Archivos: [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Prototipe-CLI/cli.js](file:///d:/PROTOTIPE/Prototipe-CLI/cli.js) [MODIFY], [dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-055: AuditorÃ­a, Robustecimiento y Marca Blanca en Motor de Aprovisionamiento~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Se auditÃ³ e implementÃ³ la resoluciÃ³n a las fugas y fallas del aprovisionador en `sync_templates.js` y `generator.js`. Se aÃ±adiÃ³ la carpeta `scratch/` (que incluye el script de siembra `seed_brand.js`) y `storage.rules` a las copias de las plantillas. Se modificÃ³ el generador para heredar el `firebase.json` del Core si estÃ¡ presente, y para personalizar dinÃ¡micamente el campo `"name"` de `package.json` con el `clientId` de la nueva marca.
  - Archivos: [Prototipe-CLI/sync_templates.js](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY], [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_motor_aprovisionamiento_marca_blanca.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_motor_aprovisionamiento_marca_blanca.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-054: DepuraciÃ³n de Redundancias y Enriquecimiento del Sandbox de Componentes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: DepuraciÃ³n fÃ­sica de la biblioteca de componentes y mÃ³dulos eliminando fichas duplicadas y archivos temporales de desecho, actualizaciÃ³n del README.md, creaciÃ³n de 5 nuevos playgrounds interactivos con simulaciÃ³n mock de flujos lÃ³gicos complejos y mapeo en ComponentSandbox.jsx.
  - Archivos: [Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY], [dev-dashboard/src/components/admin/ComponentSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY], [dev-dashboard/src/components/admin/sandboxes/FormularioProductoIASandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/FormularioProductoIASandbox.jsx) [NEW], [dev-dashboard/src/components/admin/sandboxes/LoginPageSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/LoginPageSandbox.jsx) [NEW], [dev-dashboard/src/components/admin/sandboxes/OrderTrackingSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/OrderTrackingSandbox.jsx) [NEW], [dev-dashboard/src/components/admin/sandboxes/CatalogFiltersSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CatalogFiltersSandbox.jsx) [NEW], [dev-dashboard/src/components/admin/sandboxes/PWAInstallBannerSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/PWAInstallBannerSandbox.jsx) [NEW], [dev-dashboard/src/components/admin/sandboxes/SandboxLayout.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SandboxLayout.jsx) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-052: Robustecimiento y Blindaje de la Biblioteca de Componentes y Sandbox~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: ImplementaciÃ³n del script de validaciÃ³n pre-build `verify_library_integrity.cjs` en el package.json del dashboard para auditar consistencia fÃ­sica/lÃ³gica de la biblioteca (README.md, enlaces, mapeos), inyecciÃ³n de SandboxErrorBoundary en playgrounds y tipado estructurado JSDoc con validaciones en desarrollo en BackButton y QuantitySelector.
  - Archivos: [dev-dashboard/scripts/verify_library_integrity.cjs](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [NEW], [dev-dashboard/package.json](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/package.json) [MODIFY], [dev-dashboard/src/components/admin/ComponentSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY], [App Ventas/src/components/ui/BackButton.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/BackButton.jsx) [MODIFY], [App Ventas/src/components/ui/QuantitySelector.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/QuantitySelector.jsx) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-053: SincronizaciÃ³n Estructural AutomÃ¡tica de Firebase en el Ecosistema~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Se removiÃ³ `firebase.json` de las listas de exclusiones de la CLI (en `sync_clients.js` y `server.js`). Esto permite que los cambios estructurales en los servicios de Firebase (como la habilitaciÃ³n de Storage, Functions o Hosting) hechos en el Core se propaguen automÃ¡ticamente downstream a todas las marcas clientes en la sincronizaciÃ³n diferencial. Las identidades y credenciales de bases de datos individuales permanecen resguardadas en `.env.local` y `.firebaserc`.
  - Archivos: [Prototipe-CLI/sync_clients.js](file:///d:/PROTOTIPE/Prototipe-CLI/sync_clients.js) [MODIFY], [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea HOTFIX-TELEMETRIA-002: DesactivaciÃ³n de Alerta Residual de Enlace y Panel de GestiÃ³n en Dashboard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: Se detectÃ³ que el modal de telemetrÃ­a de enlace ("Prueba de Enlace de TelemetrÃ­a") se mostraba persistentemente al abrir la app debido a un registro activo en Firestore Central (`sistemaAlerta.active = true`) en los documentos `moni-app` y `ventas-smartfix`. Se desactivÃ³ esta alerta directamente en la base de datos central a nivel de Firestore. Asimismo, se implementÃ³ en `dev-dashboard` la interfaz de Alerta Remota del Sistema dentro de la configuraciÃ³n del CRM de Clientes, para permitir al desarrollador habilitar, deshabilitar y personalizar notificaciones globales desde la UI del panel central de forma limpia.
  - Archivos: [dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], Firestore Central [DATABASE]

* **[x] ~~Tarea CLIENTE-MONI-001: CorrecciÃ³n de Firebase Storage y Carga de ImÃ¡genes en Ventas MoNI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalizaciÃ³n: 2026-06-24
  - DescripciÃ³n: CorrecciÃ³n en la configuraciÃ³n de la instancia `ventas-moni-app` aÃ±adiendo la secciÃ³n `"storage"` en `firebase.json` y desplegando con Ã©xito las reglas de seguridad de Storage (`storage.rules`) a la nube. Esto resolviÃ³ el bloqueo en la subida de imÃ¡genes desde la cÃ¡mara y la galerÃ­a.
  - Archivos: [Instancias Clientes/ventas/ventas-moni-app/firebase.json](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/firebase.json) [MODIFY]

* **[x] ~~Tarea CORE-051: AlineaciÃ³n e IntegraciÃ³n de la Biblioteca y el Sandbox del Dashboard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: Saneamiento integral de 29 enlaces rotos en el README.md de la biblioteca, mapeo de playgrounds del Sandbox para componentes huÃ©rfanos, y creaciÃ³n del archivo de documentaciÃ³n de KDS para completar la paridad de componentes.
  - Archivos: [Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY], [Documentacion PROTOTIPE/09_Modulos_Completos/Pantalla_Cocina_KDS/pantalla_cocina_kds.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/Pantalla_Cocina_KDS/pantalla_cocina_kds.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-050: NormalizaciÃ³n de IconografÃ­a en la Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: NormalizaciÃ³n al 100% de todos los iconos SVG de la landing page (Index.html) a la biblioteca de Lucide. Se corrigiÃ³ el path del favicon, logotipo principal (Navbar y Footer), los iconos de la secciÃ³n El Problema (Reloj, DÃ³lar, Clientes, Puntos Ciegos), el icono principal de bombilla en La SoluciÃ³n (aÃ±adiendo espaciado explÃ­cito para decimales y comandos BÃ©zier para evitar que Chrome lo renderizara de forma asimÃ©trica), los iconos de la grilla de Beneficios, los checks de caracterÃ­sticas de la tabla de precios y los iconos de mÃ¡s/menos del FAQ.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-049: AlineaciÃ³n y SincronizaciÃ³n Completa del Mapa SemÃ¡ntico de DocumentaciÃ³n IA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: AnÃ¡lisis sistemÃ¡tico de toda la documentaciÃ³n de PROTOTIPE y sincronizaciÃ³n del mapa semÃ¡ntico `mapa_documentacion_ia.md` indexando las 12 referencias faltantes (reglas GEMINI.md, verify_ecosystem_integrity.js, boveda_obsidian_index.md, mapa_ecosistema.canvas, telemetria_ecosistema_global.md, catalogo_componentes_atomicos.md, formulario_producto_ia.md, imagen_lazy.md, diagrama_flujo_ecosistema.md, diccionario_tecnico_completo.md, etc.) con sus correspondientes roles tÃ©cnicos, criterios de decisiÃ³n IA y enlaces directos con protocolo file:///.
  - Archivos: [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-048: AnÃ¡lisis y RediseÃ±o Premium Profesional de Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: AuditorÃ­a y rediseÃ±o completo de Index.html para convertir la landing page actual en un sitio premium que implemente variables HSL, fuentes de Google Fonts, navbar animado, glows radiales en CSS, secciones estructuradas con iconos SVG y optimizaciones de SEO/SemÃ¡ntica.
  - RevisiÃ³n v1.1 - v2.0 (Completado): CorrecciÃ³n de contraste en el botÃ³n de navegaciÃ³n, estandarizaciÃ³n de alturas mÃ­nimas en todas las tarjetas y purga completa de emojis. CorrecciÃ³n del bug de brillo estÃ¡tico sobre "Preguntas" en el navbar mediante la inyecciÃ³n de `display: inline-block` en el botÃ³n cta. Reemplazo y rediseÃ±o de todos los iconos de la cuadrÃ­cula de Casos de Ã‰xito (RevisiÃ³n v1.5) escalÃ¡ndolos a 24x24px con trazo stroke-width="2" y formas inequÃ­vocas y representativas (martillo, utensilios, automÃ³vil, tienda fÃ­sica, tijeras, cohete) para evitar el empastamiento y los artefactos visuales deformes. SoluciÃ³n definitiva al recorte horizontal de los cÃ­rculos numerados 1, 2 y 3 en la secciÃ³n de pasos simples inyectando `overflow: visible !important;` en la clase de estilos de `.step-card` (RevisiÃ³n v1.6), homologando tambiÃ©n todos los grosores de trazo de flechas interactivas e icono de bombilla a `stroke-width="2"`, y robusteciendo el logotipo del footer con gradiente local. CorrecciÃ³n del bug visual del destello de esquinas en Ã¡ngulo recto (bordes rectos grises) en tarjetas con overflow visible mediante la inyecciÃ³n de `border-radius: inherit;` en el pseudo-elemento `.glass-card::before` (RevisiÃ³n v1.7) para que herede la curvatura de 18px del contenedor padre. DiseÃ±o e implementaciÃ³n de la calculadora interactiva glassmorphic de fugas de dinero/tiempo y retorno de inversiÃ³n en tiempo real para maximizar la cotizaciÃ³n activa de clientes, incluyendo el pulido responsivo final (RevisiÃ³n v1.8) de la visualizaciÃ³n de la cifra monetaria anual en viewports estrechos mediante clamp() adaptativo y white-space: nowrap, el rediseÃ±o tipogrÃ¡fico de alta jerarquÃ­a del Hero H1 (RevisiÃ³n v1.9) reduciendo el peso de Outfit a 800 y el tracking a -0.05em, y el efecto de resorte elÃ¡stico (RevisiÃ³n v2.0) al pasar el cursor (scale 1.06) y hacer clic (scale 0.94) en el botÃ³n de DiagnÃ³stico Gratis del navbar aplicando curvas Bezier cÃºbicas.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_landing_page_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_landing_page_2026.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-047: SincronizaciÃ³n y NormalizaciÃ³n de la Matriz de Precios Oficial~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: NormalizaciÃ³n del formato, viÃ±etas de guiones, estructura de cobros y ejemplos de la Matriz de Precios Oficial de PROTOTIPE en alineaciÃ³n exacta con las especificaciones del negocio.

* **[x] ~~Tarea CORE-046: IntegraciÃ³n Documental de Procesos Comerciales y de Escalabilidad~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: CreaciÃ³n del manual de marca (`manual_marca.md`), manual de contrataciÃ³n (`manual_contratacion_clientes.md`) y organigrama futuro (`organigrama_futuro.md`) distribuyÃ©ndolos en las subcarpetas temÃ¡ticas estratÃ©gicas del ecosistema.
  - Archivos: [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_contratacion_clientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_contratacion_clientes.md) [NEW], [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_marca.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_marca.md) [NEW], [Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/organigrama_futuro.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/organigrama_futuro.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-045: IntegraciÃ³n Documental del Roadmap de Negocio 2026-2029~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: CreaciÃ³n y distribuciÃ³n estratÃ©gica del plan maestro empresarial (`roadmap_empresarial_2026_2029.md`) bajo `/08_Plan_Escalabilidad_Negocio/`. Detalla la visiÃ³n estratÃ©gica de escalabilidad en 4 fases operativas para alcanzar metas incrementales de clientes activos.
  - Archivos: [Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/roadmap_empresarial_2026_2029.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/roadmap_empresarial_2026_2029.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-044: IntegraciÃ³n Documental de la Oferta Comercial Oficial~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: CreaciÃ³n y distribuciÃ³n estratÃ©gica del documento oficial de oferta comercial (`oferta_comercial_oficial.md`) bajo `/05_Estrategia_Comercial_Ecosistema/`. Registra la propuesta de valor, problemas operativos resueltos, entregables del software y filosofÃ­a de servicio de PROTOTIPE.
  - Archivos: [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/oferta_comercial_oficial.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/oferta_comercial_oficial.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-043: DocumentaciÃ³n del Modelo Operativo y de Negocio Comercial~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: CreaciÃ³n del documento conceptual y operativo de la empresa PROTOTIPE. Se describen el modelo de negocio SaaS de marca blanca, onboarding comercial, flujo de ventas PWA, desarrollo de plantillas core, telemetrÃ­a de soporte de fallas, mantenimiento local con PowerShell y flujos de actualizaciÃ³n downstream downstream con rollback automatizado.
  - Archivos: [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/modelo_operativo_y_negocio.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/modelo_operativo_y_negocio.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-042: ConstrucciÃ³n del Mapa de Dependencias y Matriz de Impacto~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: CreaciÃ³n del documento de mapa de dependencias y riesgos del ecosistema. Se describe el flujo de dependencias fÃ­sicas y de infraestructura en diagramas Mermaid, se incluye una matriz de impacto y criticidad, y se auditan los puntos Ãºnicos de falla (SPOF) y riesgos potenciales en producciÃ³n de cada componente.
  - Archivos: [Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/mapa_dependencias_y_riesgos.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/mapa_dependencias_y_riesgos.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-041: ConstrucciÃ³n de Registro de Decisiones ArquitectÃ³nicas (ADR)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: CreaciÃ³n del registro oficial de decisiones arquitectÃ³nicas (ADR) del ecosistema. Se documentan 5 decisiones crÃ­ticas (sharding por cliente de Firebase, branding HSL, sincronizador downstream, workers asÃ­ncronos y telemetrÃ­a desacoplada) justificando el contexto tÃ©cnico, la decisiÃ³n, las alternativas descartadas, ventajas y riesgos.
  - Archivos: [Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/registro_decisiones_arquitectura.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/registro_decisiones_arquitectura.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-040: ConstrucciÃ³n del Documento Maestro de Reglas ArquitectÃ³nicas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: GeneraciÃ³n del estÃ¡ndar general y documento de reglas arquitectÃ³nicas de PROTOTIPE. Se describen principios arquitectÃ³nicos, carpetas nÃºcleo, dependencias obligatorias, tecnologÃ­as aprobadas/prohibidas, convenciones de cÃ³digo, patrones de diseÃ±o, reglas de sincronizaciÃ³n, reglas de seguridad, reglas de escalabilidad, directivas obligatorias para IA, lista de acciones prohibidas y checklist de auditorÃ­a del ecosistema.
  - Archivos: [Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-039: DistribuciÃ³n EstratÃ©gica de Informes de AuditorÃ­a TÃ©cnica y Diagrama del Ecosistema~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: ReubicaciÃ³n fÃ­sica y correcciÃ³n del error de tipeo en la ruta del archivo de auditorÃ­a, eliminando la carpeta obsoleta `03_Audiorias_y_Faro_Core` y el archivo `Sin tÃ­tulo.canvas`. DistribuciÃ³n estratÃ©gica de `auditoria_final_prototipe.md` bajo `03_Auditorias_y_Faro_Core/` y del `diagrama_flujo_ecosistema.md` en `07_Manuales_Desarrollo/`. Registro y sincronizaciÃ³n en el mapa fÃ­sico de la aplicaciÃ³n (`mapa_aplicacion.md`) y en el mapa semÃ¡ntico de documentaciÃ³n de la IA (`mapa_documentacion_ia.md`).
  - Archivos: [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_final_prototipe.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_final_prototipe.md) [NEW], [Documentacion PROTOTIPE/07_Manuales_Desarrollo/diagrama_flujo_ecosistema.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/diagrama_flujo_ecosistema.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-038: Mapeo Completo del Ecosistema y Diccionario TÃ©cnico Detallado~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: Mapeo de granularidad estricta al 100% de la lÃ³gica de los archivos de la raÃ­z (backup, scripts), motor CLI (config, logger, cli, worker, generator, sync_templates, sync_clients, test_templates, server) y subpaneles/servicios/hooks de la Consola Central (ComponentLibraryView, ComponentSandbox, CoreCard, CoreManagerPanel, CoreSyncPanel, E2EPanel, GitBackupPanel, useCopyToClipboard, useToast, pdfService, App) excluyendo estrictamente la lÃ³gica de 'app ventas core' y 'clientes moni'. Sincronizado en el diccionario tÃ©cnico maestro.
  - Archivos: [Documentacion PROTOTIPE/07_Manuales_Desarrollo/diccionario_tecnico_completo.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/diccionario_tecnico_completo.md) [MODIFY]

* **[x] ~~Tarea CORE-037: AuditorÃ­a TÃ©cnica Completa, Mapeo General y Plan de Limpieza~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalizaciÃ³n: 2026-06-23
  - DescripciÃ³n: Se realizÃ³ una investigaciÃ³n y lectura secuencial profunda de todos los archivos del CLI (cli.js, config.js, logger.js, worker_create_project.js, generator.js, sync_templates.js, sync_clients.js, test_templates.js, server.js), dev-dashboard y scripts PowerShell del ecosistema. Se redactÃ³ y publicÃ³ el informe tÃ©cnico maestro `auditoria_tecnica_completa_maestra_2026.md` bajo `Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/`, consolidando la explicaciÃ³n de quÃ© hace el proyecto, flujos de trabajo en diagramas de secuencia/flujo de Mermaid, mapeo de comportamiento y funciones de cada archivo, diagnÃ³stico de bugs crÃ­ticos de inyecciÃ³n de comandos, vulnerabilidades de reglas Firestore, CORS abierto e I/O bloqueantes con soluciones de cÃ³digo concretas, y un plan de limpieza de archivos basura y hoja de ruta para escalabilidad.

* **[x] ~~Tarea CORE-036: AuditorÃ­a, Robustecimiento y Blindaje de Seguridad del Servidor CLI Bridge~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-22
  - Fecha de finalizaciÃ³n: 2026-06-22
  - DescripciÃ³n: Se ejecutÃ³ auditorÃ­a y robustecimiento integral de seguridad y rendimiento en `server.js`. Se implementÃ³ la funciÃ³n helper `isPathContained` case-insensitive para prevenir Directory Traversal de forma agnÃ³stica a la plataforma, aplicÃ¡ndose en `/api/library/file`, `/api/library/extract`, `/api/project/file`, `/api/git/status` y `/api/git/backup-stream`. Se mitigÃ³ la creaciÃ³n de procesos zombies en Windows reemplazando `ps.kill()` por la llamada recursiva `killProcessTree(ps.pid)`. Se optimizÃ³ el Event Loop del servidor refactorizando el escaneo de paridad MD5 a sus variantes asÃ­ncronas no bloqueantes (`getSyncFilesRecursiveAsync` y `getSyncFileHashAsync`) mediante promesas en `/api/instancias/list` y `/api/instancias/sync-and-deploy-stream` y su rollback. Se blindÃ³ la base de datos contra inyecciÃ³n indirecta sanitizando el `firebaseProjectId` bajo la expresiÃ³n regular `^[a-z0-9\-]+$`. Por Ãºltimo, se configurÃ³ la auditorÃ­a de logs interceptando de manera global los mÃ©todos de `console` para volcarlos en `cli_bridge.log` y se evitÃ³ la duplicaciÃ³n de los preflight checks moviendo `runPreflightChecks()` al arranque del script.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-035: RefactorizaciÃ³n Arquitectura Git â€” UnificaciÃ³n de Ramas, Nomenclatura `cliente/*`, `--no-verify` y Deploy por Instancia~~**
  - Estatus: Completado.
  - DescripciÃ³n: Se fusionÃ³ la rama `produccion` en `main` y se eliminÃ³ la primera (local y remota) en el repositorio `prototipe-core-ventas`. `main` es ahora la Ãºnica rama de producciÃ³n del Core. El remote de la instancia `ventas-moni-app` fue reconfigurado para apuntar al Core en lugar de a un repositorio propio. La rama local fue renombrada de `master` â†’ `cliente/ventas-moni-app` y publicada en el Core. Se aÃ±adiÃ³ `--no-verify` a todos los comandos `git push` de `git_backup.ps1` y `subproject_backup.ps1`, eliminando el bloqueo por hooks E2E de Playwright en los respaldos. Se eliminÃ³ el prompt interactivo de bypass. Se aÃ±adiÃ³ un guard explÃ­cito para excluir ramas `cliente/*` del auto-merge a `main`. Se robustecieron `findProjectDir` (3 niveles: `.prototipe.json` â†’ `package.json` â†’ nombre de carpeta), `defaultBase` (prioriza `main`), y el deploy de instancias (lee `.env.local` de la instancia fÃ­sica, no del Core).
  - Archivos: [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY], [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-034: Saneamiento y Robustecimiento Integral del Sistema de Backup (10 Puntos de AuditorÃ­a)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-22
  - Fecha de finalizaciÃ³n: 2026-06-22
  - DescripciÃ³n: Resueltos y robustecidos los 10 hallazgos de seguridad y calidad del motor de respaldos (`git_backup.ps1`, `subproject_backup.ps1`, `menu_backup.ps1`). Se moviÃ³ la validaciÃ³n de fugas de credenciales en variables de entorno `.env` a una etapa previa (`pre-add`) en el snapshot del maestro para evitar staging de secretos, y se refinÃ³ el detector para excluir del check los archivos en estado `D` (staged delete). Se implementaron validaciones estrictas del cÃ³digo de salida `$LASTEXITCODE` tanto al indexar (`git add .`) como al empujar cambios a GitHub (`git push`), previniendo falsos positivos de Ã©xito. Se creÃ³ la funciÃ³n unificada de logging Write-BackupLog para registrar el historial con marca de tiempo en `backup.log`. AdemÃ¡s, se optimizÃ³ el mensaje de commit automÃ¡tico filtrando subcarpetas de compilaciÃ³n o dependencias y agrupando con `Format-CommitMessageList` si exceden de 5 elementos. Por Ãºltimo, en `menu_backup.ps1`, se implementÃ³ una bÃºsqueda recursiva flexible de instancias mediante firmas de proyectos (`package.json`, `.git`, `.git-backup-temp`) superando el lÃ­mite rÃ­gido de profundidad 2, se integrÃ³ una inicializaciÃ³n remota interactiva tras `git init` para configurar la URL remota del origin, y se aÃ±adiÃ³ la visualizaciÃ³n en tiempo real del conteo de cambios pendientes de Git (`Get-GitChangesCount`) para todos los subproyectos del menÃº utilizando consultas directas sin alterar el estado local. Adicionalmente, se corrigiÃ³ la codificaciÃ³n de caracteres en consola reemplazando el punto Unicode problemÃ¡tico (`â€¢`) por un carÃ¡cter de barra seguro (`|`), se solucionÃ³ el bug de salida en el menÃº del script (`Salir` no rompÃ­a el bucle do-while exterior debido al comportamiento del switch en PowerShell, lo cual se corrigiÃ³ con una variable de control `$keepRunning`), y se corrigiÃ³ el filtro del escaneo de instancias para aplicar el filtro de exclusiÃ³n de `node_modules` sobre la ruta completa (`$path`) en lugar de sobre el nombre del directorio (`$name`), previniendo la apariciÃ³n de dependencias locales de Node en el menÃº de clientes.
  - Archivos: [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY], [menu_backup.ps1](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY], [backup.log](file:///d:/PROTOTIPE/backup.log) [NEW]

* **[x] ~~Tarea CORE-033: CorrecciÃ³n del Sistema de Backup para Instancias de Cliente~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-22
  - Fecha de finalizaciÃ³n: 2026-06-22
  - DescripciÃ³n: Corregido el flujo de backup de instancias de cliente que abortaba por el guardiÃ¡n de seguridad del script `subproject_backup.ps1`. El problema raÃ­z era que `.env.local`, `dist/` y `.firebase/` estaban indexados en el repositorio Git de la instancia `ventas-moni-app`. Se ejecutÃ³ `git rm --cached` para desindexarlos, se actualizaron los `.gitignore` de la instancia y de la plantilla core con reglas explÃ­citas y comentadas, y se corrigiÃ³ el template del `.gitignore` generado en `generator.js` para que todas las instancias futuras nazcan correctamente configuradas. AdemÃ¡s, se refinÃ³ el guardiÃ¡n de seguridad en `subproject_backup.ps1` para distinguir entre archivos `.env` que estÃ¡n siendo aÃ±adidos/modificados (peligroso) vs. eliminados del Ã­ndice (operaciÃ³n correcta), previniendo falsos positivos en el commit de limpieza.
  - Archivos: [ventas-moni-app/.gitignore](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/.gitignore) [MODIFY], [App Ventas/.gitignore](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.gitignore) [MODIFY], [generator.js (Prototipe-CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

* **[x] ~~Tarea CORE-032: AdaptaciÃ³n de Pantalla de Login a Temas y OptimizaciÃ³n del Contraste del Fondo TecnolÃ³gico~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-22
  - Fecha de finalizaciÃ³n: 2026-06-22
  - DescripciÃ³n: Modificada la pantalla de login en `App.jsx` para reemplazar la maquetaciÃ³n estÃ¡tica oscura por variables CSS HSL adaptativas. Ahora, tanto la tarjeta con glassmorphism, el tÃ­tulo, los labels y los inputs de email/contraseÃ±a responden de manera reactiva e instantÃ¡nea al tema claro y oscuro del sistema. AdemÃ¡s, se incrementÃ³ la visibilidad y el contraste de la cuadrÃ­cula de puntos y los orbs decorativos de fondo en ambos temas, suavizando tambiÃ©n la viÃ±eta perimetral del modo claro en `index.css` para evitar el lavado de los orbs en los bordes de la pantalla. Se incluyÃ³ el soporte para inputs tipo `email` en la regla de overrides de contraste de entrada en modo claro. TambiÃ©n se corrigiÃ³ el borde oscuro inconsistente del botÃ³n de cambio de tema (`DarkModeToggle.jsx`) en modo claro vinculando sus propiedades de borde y color de icono a variables HSL.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY], [DarkModeToggle.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/ui/DarkModeToggle.jsx) [MODIFY]

* **[x] ~~Tarea CORE-031: Robustecimiento, Preflight Checks y DetecciÃ³n DinÃ¡mica de Colisiones de Puerto en CLI Bridge~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalizaciÃ³n: 2026-06-21
  - DescripciÃ³n: Implementados diagnÃ³sticos y salvaguardas de seguridad en el backend del bridge (`server.js`). AÃ±adido `runPreflightChecks()` al iniciar el servidor para diagnosticar la disponibilidad de Git y Firebase CLI en el PATH. Integrado el esquema y validador `validatePrototipeMetadata()` para los metadatos `.prototipe.json` de los clientes, previniendo de forma proactiva comportamientos inconsistentes si faltan campos o el archivo se corrompe. Se securizÃ³ la ejecuciÃ³n de comandos de git (`execGitCommand`) controlando las cadenas de entrada contra inyecciones y accesos no autorizados. Adicionalmente, se configurÃ³ la detecciÃ³n y redirecciÃ³n dinÃ¡mica de puertos en el inicio del servidor, buscando de manera secuencial puertos incrementales si el puerto inicial `3001` estÃ¡ ocupado (error `EADDRINUSE`). AdemÃ¡s, se corrigiÃ³ la discrepancia de ancho de las tarjetas de clientes en la barra lateral del dashboard (`App.jsx`) aplicando mÃ¡rgenes negativos y padding reactivo para alinearlas simÃ©tricamente sin truncar los efectos hover ni sombras.
  - Archivos: [server.js (Prototipe-CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-030: OptimizaciÃ³n y Blindaje de Dashboard de Desarrollador y CLI Bridge~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalizaciÃ³n: 2026-06-21
  - DescripciÃ³n: Realizada auditorÃ­a tÃ©cnica completa del dashboard de desarrollador (`dev-dashboard`) y el puente local (`Prototipe-CLI`). Se unificaron las URLs de conexiÃ³n de API en frontend centralizando el dominio en `CLI_URL`, codificando dinÃ¡micamente parÃ¡metros con `encodeURIComponent` para evitar roturas de URL. En el backend (`server.js`), se optimizÃ³ el buscador recursivo de instancias a 2 niveles para soportar directorios de clientes anidados por Core en sincronizaciÃ³n, despliegues y git targets, y se previno el diff lÃ­nea a lÃ­nea de archivos binarios (imÃ¡genes, logos, zip, etc.) en el detector de desviaciÃ³n (drift) a fin de mitigar fugas de memoria y sobrecarga de CPU.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [ComponentLibraryView.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY], [server.js (Prototipe-CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-029: CorrecciÃ³n de Contornos de Enfoque, Sombras Cortadas en Instancias y Curvatura de Tarjetas Global~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalizaciÃ³n: 2026-06-21
  - DescripciÃ³n: Corregido el problema de contornos (outlines) negros/blancos y anillos de enfoque de Tailwind al hacer clic en los botones interactivos (como el toggle de modo oscuro). Se ampliÃ³ el padding horizontal y vertical inferior en el contenedor de scroll de la lista de instancias activas (App.jsx) para permitir que la sombra lateral y la micro-interacciÃ³n en hover se rendericen sin recortarse. Adicionalmente, se estandarizÃ³ globalmente el radio de curvatura de todas las tarjetas y modales a 1.25rem (20px) en index.css de forma centralizada mediante overrides en los selectores globales de clase.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

* **[x] ~~E2E-Hotfix: Control de Modal de TelemetrÃ­a en Tests de Checkout~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalizaciÃ³n: 2026-06-21
  - DescripciÃ³n: Modificado el helper de navegaciÃ³n inicial `passWelcomePage` en `checkout.helpers.js`. Ahora, si al iniciar el test se presenta el modal interactivo de "Prueba de Enlace de TelemetrÃ­a" (el cual puede estar activo por pings recientes en la base de datos central), Playwright hace clic automÃ¡ticamente en "Entendido / Aceptar" utilizando un timeout de 3000ms. Esto previene que el modal intercepte e invalide el clic del botÃ³n principal "Comencemos", asegurando la ejecuciÃ³n exitosa de la suite E2E y destrabando el flujo de push del script de backup sin modificar la lÃ³gica ni los listeners de telemetrÃ­a de la aplicaciÃ³n.
  - Archivos: [checkout.helpers.js (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/helpers/checkout.helpers.js) [MODIFY]

* **[x] ~~Tarea CORE-028: Fondo TecnolÃ³gico Premium Animado â€” Capas de Grid y Orbs GPU-Accelerated~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalizaciÃ³n: 2026-06-21
  - DescripciÃ³n: RediseÃ±ado el fondo decorativo central para el login y el panel del dashboard. Se implementÃ³ una capa de puntos sutiles que deriva continuamente (`grid-drift` a 60s) usando exclusivamente `transform` en un Ã¡rea de viewport sobredimensionada, garantizando 100% de rendimiento por GPU. Se agregaron dos orbs con gradientes radiales elÃ­pticos de colores de marca (violeta, cian, Ã­ndigo) animados independientemente con drift muy lento y suave. Se actualizÃ³ la viÃ±eta perimetral de sombreado y se configuraron variables HSL translÃºcidas `--color-surface-glass` y `backdrop-filter: blur(14px)` en las tarjetas para que el fondo tecnolÃ³gico sea legible y fluya armÃ³nicamente tras las tarjetas en modo oscuro y claro.
  - Archivos: [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

* **[x] ~~Tarea CORE-027: Efecto Flotante Global de Tarjetas â€” CSS Attribute Selector Override~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalizaciÃ³n: 2026-06-21
  - DescripciÃ³n: Definidos tokens `--card-shadow` y `--card-shadow-hover` adaptativos por tema. Se aplicÃ³ un selector CSS de atributo global para divs rounded-2xl y rounded-3xl con bordes, con exclusiones estratÃ©gicas. Se generalizÃ³ el efecto flotante con sombras de alta calidad y suavidad en hovers y transiciones sin alterar el JSX, y se adaptÃ³ con glassmorphism translÃºcido.
  - Archivos: [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

* **[x] ~~Tarea CORE-026: CorrecciÃ³n de Contraste y Colores InvÃ¡lidos en Consola de TelemetrÃ­a y Global~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalizaciÃ³n: 2026-06-21
  - DescripciÃ³n: Corregido el problema de invisibilidad de texto e iconos en los botones interactivos (tabs), buscador y terminal de la Consola de TelemetrÃ­a en Modo Claro. Definidos y mapeados de forma centralizada en `index.css` los colores de marca e interactivos no estÃ¡ndar (como `-650`, `-550` y `-755`) tanto para `:root.light` (manteniendo alto contraste) como para `:root`. Se reestructuraron las clases de los contenedores de tabs, buscador y la pantalla de la terminal en `App.jsx` para utilizar variables semÃ¡nticas HSL en lugar de fondos oscuros fijos (como `bg-[#0b0f19]`). Se tradujeron todos los textos y estados de conexiÃ³n de la consola al espaÃ±ol (ej: "Live System Telemetry Console" a "Consola de TelemetrÃ­a del Sistema en Vivo") y se incrementÃ³ el contraste en las etiquetas de estado de los logs.
  - Archivos: [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-025: InversiÃ³n CromÃ¡tica Global y AdaptaciÃ³n Completa de Modo Claro~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalizaciÃ³n: 2026-06-21
  - DescripciÃ³n: Resuelto el problema generalizado de visualizaciÃ³n y contraste deficiente al alternar al Modo Claro. Redefinida la escala completa de colores de Tailwind slate (slate-50 a slate-955) como variables CSS custom configurables. En el tema oscuro se aplican los valores tradicionales oscuros, y en el tema claro (`:root.light`) se invierten y mapean de manera adaptativa (bg-slate-900 a fondo blanco puro, text-slate-200 a texto oscuro legible, etc.). Adicionalmente, se implementaron reglas y overrides CSS para remapear de forma transparente los bordes y fondos blancos translÃºcidos hardcodeados (`border-white/[0.08]`, `bg-white/5`) a sus equivalentes oscuros con opacidad en modo claro. TambiÃ©n se introdujeron selectores especÃ­ficos para invertir de manera inteligente textos y hovers en blanco (`text-white`, `hover:text-white`) dentro de contenedores de fondo claro excluyendo de forma segura a los botones con fondos de color (como `bg-indigo-650`), logrando un contraste perfecto en toda la interfaz sin necesidad de modificar el cÃ³digo de los componentes.
  - Archivos: [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-024: IntegraciÃ³n de Selector de Periodo por Calendario Premium y GrÃ¡fico Consolidado~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalizaciÃ³n: 2026-06-21
  - DescripciÃ³n: Renombrado el grÃ¡fico consolidado del Dashboard General a "Comisiones Generales" para reflejar el acumulado histÃ³rico. DiseÃ±ado e integrado un selector de periodo (Mes/AÃ±o) estilo calendario interactivo premium con estÃ©tica glassmorphic en la cabecera. El DatePicker incluye navegaciÃ³n por aÃ±os, cuadrÃ­cula de meses en espaÃ±ol y visualizaciÃ³n de un punto indicador de datos reales por mes. Al seleccionar un periodo, se filtran de forma reactiva las tarjetas de mÃ©tricas principales, el desglose de clientes en el acordeÃ³n, la distribuciÃ³n por nichos, los costos Dian, y las tablas y sub-tablas de transacciones en los modales de detalle. El grÃ¡fico principal permanece histÃ³rico y dibuja una lÃ­nea de referencia (ReferenceLine) discontinua para marcar el mes seleccionado en la tendencia general. CompilaciÃ³n local e integridad verificadas.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-023: RediseÃ±o Premium del Dashboard General con GrÃ¡ficos Interactivos Recharts, BI Avanzado y Reportes PDF~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalizaciÃ³n: 2026-06-21
  - DescripciÃ³n: RediseÃ±ado el Dashboard General en `App.jsx` reemplazando barras de progreso por grÃ¡ficos interactivos Recharts (AreaChart general y acordeones con AreaCharts por cliente de Framer Motion). Agregado el widget de Radar de Salud de Instancias en tiempo real con semÃ¡foros, latencias en ms y redireccionamiento condicional a la Consola de Errores. DiseÃ±ado el submÃ³dulo de BI y Eficiencia Financiera en el Simulador de Proyecciones con grÃ¡fico PieChart por nicho y desglose de margen neto descontando costos DIAN. Implementados modales funcionales de detalle para ComisiÃ³n Acumulada, Cobrado y Por Recaudar con tablas dinÃ¡micas de transacciones e integraciÃ³n bidireccional con facturaciÃ³n y CRM. Integrada la exportaciÃ³n de PDFs en cascada (ConciliaciÃ³n, MÃ©tricas Generales, Directorio de Clientes y Ficha de Cliente).
  - RevisiÃ³n (2026-06-21 - Hotfix/Ajustes):
    1. Se corrigiÃ³ el error `React Hook Order Mismatch` moviendo todas las declaraciones de `useMemo` de proyecciones y BI arriba del condicional `if (!user)` para que se ejecuten de forma incondicional en cada renderizado.
    2. Se resolvieron los warnings y fallos de dimensiones de Recharts en mobile (`width(-1) and height(-1)`) especificando alturas numÃ©ricas fijas (`height={220}`, `height={112}`, `height={160}`) y `minWidth={0}` en todos los `ResponsiveContainer`.
    3. Se reorganizaron los botones de acciÃ³n del panel en una cuadrÃ­cula responsiva flexible (`grid grid-cols-1 sm:flex`), y el botÃ³n/estado de base de datos "Conectado" se integrÃ³ como un badge interactivo junto al tÃ­tulo principal, logrando una interfaz limpia y despejada en celulares.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [pdfService.js (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/services/pdfService.js) [MODIFY]

* **[x] ~~Tarea CORE-022: AuditorÃ­a y Fortalecimiento de la GestiÃ³n de Plantillas Core~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalizaciÃ³n: 2026-06-21
  - DescripciÃ³n: Realizada auditorÃ­a tÃ©cnica completa del mÃ³dulo de plantillas core. Se implementÃ³ una funciÃ³n helper comÃºn `performCoreSync` en `server.js` para desacoplar y optimizar la sincronizaciÃ³n y sanitizaciÃ³n de archivos. Se creÃ³ el endpoint `POST /api/cores/:clave/sync` y se redirigiÃ³ el botÃ³n "Sync â†’ CLI" en `CoreCard.jsx` a este endpoint, resolviendo la inconsistencia por la cual se auto-activaban los cores en el wizard e incrementaban de versiÃ³n sin permiso del desarrollador. Se robusteciÃ³ la seguridad del endpoint de scaffold validando el core base y se implementÃ³ una verificaciÃ³n estricta de nombres de variables de entorno `.env.local` mediante expresiones regulares en backend y frontend (con feedback visual al aÃ±adir variables invÃ¡lidas).
  - Archivos: [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [CoreCard.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [MODIFY]

* **[x] ~~Tarea CORE-021: Fortalecimiento de la Consola de Errores e Incidentes del Dashboard Central~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalizaciÃ³n: 2026-06-20
  - DescripciÃ³n: Robustecida la consola de incidentes en vivo del dashboard central sin remover funcionalidad existente. Se agregaron filtros dinÃ¡micos avanzados por estado de resoluciÃ³n (Activos / Resueltos / Todos) y severidad (Cualquier Severidad / Errores / Advertencias / InformaciÃ³n). Se implementÃ³ un algoritmo premium de de-duplicaciÃ³n (agrupaciÃ³n) de errores repetidos por mensaje y cliente con contador animado de impactos. Se integrÃ³ un sistema de notas de resoluciÃ³n inline que permite al desarrollador documentar la causa raÃ­z y la soluciÃ³n en Firestore Central al marcar incidentes como resueltos, persistiendo el historial. Las tarjetas mÃ©tricas de cabecera ahora actÃºan como filtros dinÃ¡micos al hacer clic sobre ellas. Se expandieron las heurÃ­sticas de diagnÃ³stico automÃ¡tico en el modal para soportar errores de CORS, fallos de JSON.parse, permisos de Firebase Storage y Firestore en modo offline. Corregida ademÃ¡s la omisiÃ³n de la declaraciÃ³n de los estados de React para filtros de errores (`groupErrorsByMessage`, `selectedErrorStatusFilter`, `selectedErrorTypeFilter`, `resolutionNoteInputId`, `resolutionNoteText`) que causaba un crash `ReferenceError` al renderizar el componente principal.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-020: Arquitectura Multi-Core Escalable en template-core-seed y CLI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalizaciÃ³n: 2026-06-20
  - DescripciÃ³n: RefactorizaciÃ³n y desacoplamiento de `template-core-seed` para soportar mÃºltiples cores (billing configurable con adaptador, limpieza de campos e-commerce, hook useBilling). ReestructuraciÃ³n de `Instancias Clientes/` por core, actualizaciÃ³n de scripts de backup y actualizaciÃ³n del CLI (`generator.js` y `config.js`) para soportar la resoluciÃ³n dinÃ¡mica de rutas por `coreType` y su sincronizaciÃ³n central. AdemÃ¡s, se validÃ³ la compilaciÃ³n local (`npm run build`) en todos los proyectos del ecosistema y se solucionÃ³ el bug de compilaciÃ³n de `template-core-seed` copiando el script autogenerador de mapa semÃ¡ntico para IA.
  - Archivos: [index.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/constants/index.js) [MODIFY], [billingService.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/billingService.js) [MODIFY], [useBilling.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useBilling.js) [MODIFY], [appConfigStore.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js) [MODIFY], [appConfigService.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/appConfigService.js) [MODIFY], [DeveloperDiagnosticsModal.jsx (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/admin/settings/DeveloperDiagnosticsModal.jsx) [MODIFY], [centralFirebaseService.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/centralFirebaseService.js) [MODIFY], [config.js (CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/config.js) [MODIFY], [generator.js (CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [plantillas_registro.json (CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json) [MODIFY]


* **[x] ~~Tarea CORE-019: EstandarizaciÃ³n Total del Sistema de TelemetrÃ­a e Interactividad en ventas-moni-app y CorrecciÃ³n de Dropdowns en Central~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalizaciÃ³n: 2026-06-20
  - DescripciÃ³n: SincronizaciÃ³n manual de la instancia activa `ventas-moni-app` con el Core para eliminar el drift crÃ­tico detectado tras la implementaciÃ³n de CORE-018. Se reemplazÃ³ la lÃ³gica de descarte de alertas basada en texto (`title-message-type`) por la clave Ãºnica `alertId` en `App.jsx`, se agregÃ³ el estado `activePingRequest` con autocierre a 30s y el handler del evento `'ping-test-requested'`, y se insertÃ³ el modal interactivo de "Prueba de ConexiÃ³n" idÃ©ntico al del Core. En `useAppConfigSync.js`, se reemplazÃ³ la auto-respuesta silenciosa al ping por el despacho del evento interactivo con validaciÃ³n de expiraciÃ³n (>60s) y comparaciÃ³n de timestamps `triggerPing > lastPingResponse`. Adicionalmente, se resolvieron 2 bugs activos de la interfaz central (`dev-dashboard`): cierre por clic fuera (click-outside) usando `useRef` + `mousedown` en los dropdowns de `CoreSyncPanel.jsx` y `App.jsx`, y refactorizaciÃ³n a estado puro de React en el selector de tipo de alerta de `App.jsx` eliminando referencias frÃ¡giles y duplicados de ID de DOM. Builds de integridad aprobados en ambos proyectos.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [CoreSyncPanel.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-018: Ping Test Interactivo con Alerta de Prueba Personalizada, Autocierre y Descarte~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalizaciÃ³n: 2026-06-20
  - DescripciÃ³n: RediseÃ±ado el flujo de Ping Test de telemetrÃ­a para hacerlo interactivo. El Dashboard escribe `triggerPing` y el timeout se aumenta a 30s. En el cliente se muestra un modal de prueba de conexiÃ³n reutilizando exactamente el diseÃ±o de la alerta remota (backdrop blur, Framer Motion, estilos theme-aware) pero con temÃ¡tica de telemetrÃ­a y botones de confirmaciÃ³n y descarte. Al confirmar, el cliente escribe `lastPingResponse` y el test finaliza con Ã©xito. Si el administrador estÃ¡ ocupado o ignora la solicitud, el modal se cierra automÃ¡ticamente tras 30 segundos (o puede cerrarse manualmente haciendo clic en "Descartar prueba" o en el backdrop) sin interrumpir el flujo ni arrojar errores. Propagado a plantillas CLI (`template-ventas` y `template-core-seed`).
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [useAppConfigSync.js (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY], [App.jsx (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY], [useAppConfigSync.js (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY], [App.jsx (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/App.jsx) [MODIFY], [useAppConfigSync.js (template-core-seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js) [MODIFY], [App.jsx (template-core-seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-017: DetecciÃ³n por Hash MD5 de Drift de Instancias, ExclusiÃ³n de Mapas de Arquitectura, Consola DinÃ¡mica y Perfil Theme-Aware~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalizaciÃ³n: 2026-06-20
  - DescripciÃ³n: Implementado el control real de drift por hash MD5 en el listado de instancias locales. Se corrigiÃ³ la terminal de sincronizaciÃ³n de cores para responder de forma premium y adaptativa al tema claro/oscuro. Se excluyeron los mapas de arquitectura auto-generados dinÃ¡micamente de la validaciÃ³n del drift. Se separÃ³ el Canal de TelemetrÃ­a (Ping Test) en dos botones separados ("Enviar Alerta de Prueba" y "Verificar ConexiÃ³n") y se previno en la app cliente la reapertura de la alerta mediante el uso de `useRef` comparativos sobre el snapshot de telemetrÃ­a. AdemÃ¡s, se solucionÃ³ el destello/parpadeo de la alerta remota al recargar la app cliente resolviendo sÃ­ncronamente el estado de localStorage en el render, y se adaptaron al modo oscuro/claro el Perfil de Administrador y la Consola de TelemetrÃ­a en el Dashboard Central, traduciendo sus textos del inglÃ©s al espaÃ±ol.
  - Archivos: [CoreSyncPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [App.jsx (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY], [App.jsx (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-016: Ping-Pong Real, Alertas Remotas Funcionales y CorrecciÃ³n de Token Vinculado~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalizaciÃ³n: 2026-06-20
  - DescripciÃ³n: Implementado el ciclo **Ping-Pong real via Firestore** sin Cloud Functions. El Dashboard escribe `triggerPing` en `clientes_control/{clientId}`, la app cliente lo detecta via `onSnapshot` y responde con `lastPingResponse`. El Dashboard calcula la latencia real; si no hay respuesta en 5s muestra Timeout. Las **Alertas Remotas** ahora son 100% funcionales: creado `centralFirebaseService.js` como segunda app de Firebase y modificado `useAppConfigSync.js` para escuchar `sistemaAlerta` en tiempo real desde la BD central. El **Token Vinculado** se muestra correctamente resolviendo desde `cfg.telemetryToken` (ahora persistido en Firestore en el aprovisionamiento) o fallback en `tokens`. Reglas de Firestore actualizadas con `affectedKeys().hasOnly(['lastPingResponse'])`. Propagado a templates CLI `template-ventas` y `template-core-seed`.
  - Archivos: [centralFirebaseService.js (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/centralFirebaseService.js) [NEW], [useAppConfigSync.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [firestore.rules](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firestore.rules) [MODIFY]

* **[x] ~~Tarea CORE-015: RediseÃ±o Premium de la Interfaz de DiagnÃ³sticos del Dashboard Central~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalizaciÃ³n: 2026-06-20
  - DescripciÃ³n: RediseÃ±ado a fondo el modal de diagnÃ³stico por cliente en el Dashboard Central. Se eliminaron por completo los bordes toscos de color claro/gris sÃ³lido, implementando un diseÃ±o de tipo glassmorphism premium con degradados de fondo HSL, bordes translÃºcidos (`border-white/[0.04]`), sombras profundas (`shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]`), micro-animaciones en hover y cabeceras elÃ¡sticas, alineado al estÃ¡ndar de excelencia visual del proyecto.
  - Archivos: [dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CLI-019: AutomatizaciÃ³n de Alertas Remotas, Reinicio Mensual y SincronizaciÃ³n CLI de Plantillas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalizaciÃ³n: 2026-06-20
  - DescripciÃ³n: Integrado el soporte de reinicio automÃ¡tico mensual, alerta bloqueante remota por pago (sistemaAlerta) y visor mensual exitoso en la plantilla de CLI `template-ventas` ejecutando el script `sync_templates.js` para asegurar que absolutamente todas las futuras aplicaciones de ventas creadas por el motor CLI hereden esta funcionalidad de forma nativa e integrada.
  - Archivos: [Prototipe-CLI/templates/template-ventas/](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/) [MODIFY]

* **[x] ~~Tarea CORE-014: CorrecciÃ³n de Visibilidad de Nuevas Instancias y Auto-configuraciÃ³n de TelemetrÃ­a~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalizaciÃ³n: 2026-06-19
  - DescripciÃ³n: Resuelto el problema por el cual las nuevas instancias registradas (como `moni-app`) no aparecÃ­an en el CRM de Clientes ni en la cuenta general de Clientes Activos. Se cambiÃ³ el contador de clientes activos para leer de `clientesSaas` y se reestructurÃ³ `clientAggregated` para inicializarse con todos los clientes de `clientesSaas`. AdemÃ¡s, se implementÃ³ el auto-enlace de telemetrÃ­a (blindaje) al momento del registro: la Consola Central inyecta automÃ¡ticamente el token de telemetrÃ­a autogenerado y el endpoint HTTPS de Cloud Run directamente en el archivo `.env.local` de la instancia usando la API del puente local, previniendo errores de reporte de facturaciÃ³n. Se corrigiÃ³ manualmente el `.env.local` de la app Moni con su token registrado (`moni-app-token-1781921496178`).
  - Archivos: [App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-013: Sincronizador Core a Clientes y Despliegue en Lote Aislado~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalizaciÃ³n: 2026-06-19
  - DescripciÃ³n: Diagnosticado y corregido el problema arquitectural donde `CoreSyncPanel.jsx` usaba un endpoint de ramas Git que no coincidÃ­a con la arquitectura real de directorios fÃ­sicos. Implementados dos nuevos endpoints en `server.js`: `GET /api/instancias/list` (lista instancias fÃ­sicas con delta de versiÃ³n core vs cliente) y `GET /api/instancias/sync-and-deploy-stream` (SSE de sincronizaciÃ³n fÃ­sica diferencial por hash MD5 con 6 fases: detecciÃ³n, backup, copia, build, actualizaciÃ³n de metadata y deploy opcional). Reescrito `CoreSyncPanel.jsx` con nueva fuente de datos, badges de versiÃ³n por cliente, toggle de deploy y estados por fase (syncing/building/deploying/success/error).
  - Archivos: [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [CoreSyncPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-012: InicializaciÃ³n, Aprovisionamiento y Despliegue de Instancia (Moni)~~**

  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalizaciÃ³n: 2026-06-19
  - DescripciÃ³n: Creada y configurada la primera carpeta fÃ­sica de cliente independiente en `D:\PROTOTIPE\Instancias Clientes\ventas-moni-app` utilizando la plantilla limpia. Configurado el entorno Git de la instancia desindexando `node_modules` de forma definitiva y agregando el Git Hook de pre-commit. Conectada la aplicaciÃ³n con el proyecto Firebase `ventas-moni-app` y vaciada toda la base de datos de Firestore para habilitar el asistente de onboarding nativo directamente en la primera carga. Compilado y desplegado de forma local (`localhost:5173`) y a producciÃ³n en Firebase Hosting (`https://ventas-moni-app.web.app`).

* **[x] ~~Tarea CORE-011: RediseÃ±o Premium de la Interfaz del CatÃ¡logo (Laboratorio Visual Fase 3) - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalizaciÃ³n: 2026-06-19
  - DescripciÃ³n: Completado el rediseÃ±o premium de la secciÃ³n del catÃ¡logo de clientes para adoptar un estilo Apple Store y Shopify. Implementada la cabecera buscador sticky translÃºcida con HSL, blur de fondo y sin lÃ­neas de borde rÃ­gidas; rediseÃ±ados los chips de categorÃ­as a pastillas flotantes con transiciones de fondo deslizante elÃ¡stico animado (layoutId); reestructurado el banner promocional para que la imagen abarque la totalidad de forma uniforme con object-cover, inyectando un degradado lateral asimÃ©trico que evita oscurecer el producto, un sello flotante interactivo (sticker) con micro-animaciÃ³n de rotaciÃ³n en hover, un resplandor ambiental dinÃ¡mico de marca en hover, y destellos de luz de barrido metÃ¡lico en los badges de oferta; y reestructurado ProductCard con curvaturas de 20px, sombras multicapa finas en hover y microinteracciones de rotaciÃ³n/escala en el botÃ³n de agregar.
  - Archivos: [ClientCatalog.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY], [CatalogBanner.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/CatalogBanner.jsx) [MODIFY], [ProductCard.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]

* **[x] ~~Tarea CORE-010: Stock Infinito para Productos Preparados / Ilimitados - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalizaciÃ³n: 2026-06-19
  - DescripciÃ³n: Implementada la funcionalidad de "stock infinito" (productos preparados) que permite omitir el control de inventario de manera estratÃ©gica y dinÃ¡mica. AÃ±adido el toggle en ProductFormModal (Inventario y Stock), modificada la validaciÃ³n Zod en inventorySchemas para aceptar el flag stockInfinito, actualizados los listados (AdminInventory) en desktop y mobile con indicador visual "âˆž Ilimitado", y ajustadas las transacciones y decrementos en orderService para omitir reducciones de stock si el producto es ilimitado. Se actualizaron los tableros de mÃ©tricas en AdminHome y alertas en AdminStockAlerts para no emitir advertencias de stock bajo sobre estos productos. Adicionalmente, se puliÃ³ la tienda de cara al cliente (ProductDetailPage, ProductCard, ProductDetailModal) para ocultar la cantidad de stock tÃ©cnico (9999) reemplazÃ¡ndola por una elegante etiqueta de "Disponible" y limitando el selector de cantidad mÃ¡xima a 999 en productos de stock ilimitado.
  - Archivos: [inventorySchemas.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/schemas/inventorySchemas.js) [MODIFY], [ProductFormModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY], [AdminInventory.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY], [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY], [AdminStockAlerts.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminStockAlerts.jsx) [MODIFY], [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY], [ProductDetailPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY], [ProductCard.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY], [ProductDetailModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]

* **[x] ~~Tarea CORE-009: RediseÃ±o Premium de la GestiÃ³n de Pedidos (Laboratorio Visual Fase 2) - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalizaciÃ³n: 2026-06-19
  - DescripciÃ³n: Completado el rediseÃ±o premium de la secciÃ³n de administraciÃ³n de pedidos (AdminOrders.jsx) adaptando las tarjetas resumen al estilo "Comanda AsimÃ©trica" responsivo (ordenando cabeceras, estado, tipo de entrega, empaquetado de items en contenedor interno y alineaciones en mÃ³vil y desktop sin eliminar elementos), optimizando el grid de mÃ©tricas con el estilo wallet animado elÃ¡stico de la marca (caja y crÃ©ditos) e implementando un carrusel de filtros de estado planos con contadores dinÃ¡micos que se expanden de borde a borde en dispositivos mÃ³viles sin recortes de sombras ni overflows.
  - Archivos: [AdminOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]

* **[x] ~~Tarea CORE-008: Correcciones del Panel de Inicio del Administrador y CatÃ¡logo de Estilos UI/UX - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalizaciÃ³n: 2026-06-19
  - DescripciÃ³n: Corregido el recorte de tarjetas wallet y sombras en hover en computadoras (aÃ±adido overflow-visible responsivo), adaptada la paleta de colores de la cabecera y tarjeta de caja principal al tema HSL activo para evitar choques visuales de marca, resuelto el bug de scroll de fondo bloqueado al cerrar el modal de selecciÃ³n de temas e implementada la expansiÃ³n edge-to-edge del carrusel en celulares. Creado ademÃ¡s el catÃ¡logo de estilos visuales unificados del ecosistema.
  - Archivos: [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY], [AppearanceSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx) [MODIFY], [catalogo_estilos_ui.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Estilos/catalogo_estilos_ui.md) [NEW], [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-007: RediseÃ±o Premium de Inicio del Administrador (Laboratorio Visual Fase 1) - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalizaciÃ³n: 2026-06-19
  - DescripciÃ³n: Implementada una interfaz financiera premium de tipo "wallet" elÃ¡stica y responsiva para el inicio administrativo. Se diseÃ±Ã³ una cabecera curvada superior con degradado elÃ¡stico, un carrusel de tarjetas "wallet" responsivo con balances y desgloses de caja que soporta arrastre por snap en mÃ³vil, una lista interactiva de transacciones con iconos Lucide y fondos en colores pastel dinÃ¡micos, y accesos directos minimalistas. Todo esto sin suprimir ninguna funciÃ³n lÃ³gica ni mÃ©tricas previas.
  - Archivos: [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]

* **[x] ~~Tarea CORE-006: AuditorÃ­a, Saneamiento y EstabilizaciÃ³n del Sistema de Notificaciones - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalizaciÃ³n: 2026-06-19
  - DescripciÃ³n: Refactorizado useNotificationCenter con un listener dedicado en tiempo real para conteo exacto de no leÃ­dos de Firestore (solucionando el bug de paginaciÃ³n), optimizada la bandeja de notificaciones en NotificationHistoryTray inyectando iconos de Lucide dinÃ¡micos y clases de color del sistema de diseÃ±o (evitando el purgado), robustecido el useEffect de Toasts en AdminLayout, ClientLayout y PortalLayout para encolar mÃºltiples alertas flotantes simultÃ¡neas, y saneado imports sin uso en PortalMensajero.
  - Archivos: [notificationCenterService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/notificationCenterService.js) [MODIFY], [useNotificationCenter.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useNotificationCenter.js) [MODIFY], [NotificationHistoryTray.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/common/NotificationHistoryTray.jsx) [MODIFY], [AdminLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY], [ClientLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY], [PortalLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/PortalLayout.jsx) [MODIFY], [PortalMensajero.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalMensajero.jsx) [MODIFY]

* **[x] ~~Tarea CORE-005: AuditorÃ­a y OptimizaciÃ³n del MÃ³dulo 5 (CrÃ©ditos y Saldos) - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalizaciÃ³n: 2026-06-19
  - DescripciÃ³n: Estandarizados los modales de abonos con ModalTemplate en AdminCredits y ClientCredits, optimizadas las consultas del PDF de cartera limitÃ¡ndolo a crÃ©ditos activos, removido useOrders en la vista de crÃ©ditos, y asegurada consistencia transaccional en abonos concurrentes.
  - Archivos: [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY], [ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY], [pdfService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) [MODIFY], [creditService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) [MODIFY]

* **[x] ~~Tarea CORE-001: ElaboraciÃ³n de Checklist de AuditorÃ­a del Core (App Ventas)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-18
  - Fecha de finalizaciÃ³n: 2026-06-18
  - DescripciÃ³n: Elaborado un checklist detallado para auditar y corregir inconsistencias y cuellos de botella de los 5 mÃ³dulos core (Ventas, Bodega, AutenticaciÃ³n, Reparto y CrÃ©ditos), saneando referencias obsoletas a Gastrobar.
  - Archivos: [checklist_auditoria_core.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/checklist_auditoria_core.md) [NEW], [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CLI-018: Registro ExplÃ­cito de Rol 'client' en ColecciÃ³n de Usuarios (Ecosistema)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: Modificado `LoginPage.jsx` tanto en la plantilla base `App Ventas` como en las plantillas del CLI para registrar explÃ­citamente el campo `role: 'client'` en los nuevos perfiles de usuario cliente.
  - Archivos: [LoginPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY], [LoginPage.jsx](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]

* **[x] ~~Tarea CLI-017: Fix de SesiÃ³n HuÃ©rfana de Administrador en App Ventas (Ecosistema)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: Modificado `useAuthInit.js` de la plantilla base de Ventas para validar y recrear el documento del admin en Firestore en caso de que su sesiÃ³n de Auth local estÃ© activa pero sus datos de Firestore hayan sido borrados.
  - Archivos: [useAuthInit.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js) [MODIFY]

* **[x] ~~Tarea CLI-016: RemociÃ³n Completa de FunciÃ³n de GestiÃ³n de Base de Datos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: Removida en su totalidad la funcionalidad de gestiÃ³n, conteo y purga de colecciones de bases de datos de clientes, eliminando endpoints en el servidor y todos los estados, manejadores, botones y maquetaciÃ³n JSX de modal en el panel de control.
  - Archivos: [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-015: CorrecciÃ³n de Estructura y Responsividad MÃ³vil del CRM de Clientes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: Corregida la estructura y responsividad de los botones en la versiÃ³n mÃ³vil del CRM de Clientes. Se rediseÃ±Ã³ el contenedor global a una cuadrÃ­cula de 2 columnas en mobile (`grid-cols-2`) y se aplicaron flexibidad de crecimiento y anchos mÃ­nimos (`min-w`) en los botones de directorio de clientes para evitar truncamientos y desbordamientos. Adicionalmente, se corrigiÃ³ el bug en la funciÃ³n de resoluciÃ³n de rutas de proyectos `findProjectDir` en `server.js` que causaba errores 500 al no encontrar proyectos en directorios de plantillas core si el directorio de instancias no existÃ­a en disco.
  - Archivos: [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-014: Arquitectura General y AgnÃ³stica de Skills de IA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: Reescritas las 7 skills del ecosistema para ser agnÃ³sticas al proyecto usando la variable dinÃ¡mica `[PROYECTO_ACTIVO]`, triggers conscientes de proyectos, y rutas dinÃ¡micas estructuradas. Integrados ademÃ¡s los cambios especÃ­ficos de cada skill (categorÃ­as, colisiones, tabla canÃ³nica de simulabilidad y resoluciÃ³n de conflictos git).
  - Archivos: Carpetas en [Skills](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/) [MODIFY]

* **[x] ~~Tarea CLI-013: DepuraciÃ³n de Rutas Obsoletas (D:\Aplicaciones)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: RemociÃ³n del fallback obsoleto `D:\Aplicaciones` en `server.js` y actualizaciÃ³n de 5 referencias de rutas obsoletas a `D:\PROTOTIPE` en los manuales, mapas de arquitectura y especificaciones del ecosistema de documentaciÃ³n.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [mapa_arquitectura.md](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/mapa_arquitectura.md) [MODIFY], [SKILL.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component-extractor/SKILL.md) [MODIFY], [manual_brand_config.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_brand_config.md) [MODIFY], [resumen_ejecutivo_proyecto.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/resumen_ejecutivo_proyecto.md) [MODIFY], [sincronizacion_templates_universal.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/sincronizacion_templates_universal.md) [MODIFY]

* **[x] ~~Tarea CLI-012: Saneamiento y EstandarizaciÃ³n de Nomenclatura en Biblioteca~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: RemociÃ³n de componentes duplicados (`ConnectivityToast` y `DatePicker`), eliminaciÃ³n del roadmap obsoleto (`tareas_pendientes_prioritarias.md`), y renombrado de 6 carpetas/archivos en la biblioteca al estÃ¡ndar de espaÃ±ol claro.
  - Archivos: `06_Biblioteca_Componentes` [MODIFY], `02_Tareas_Roadmap/tareas_pendientes_prioritarias.md` [DELETE], [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CLI-011: ActualizaciÃ³n a System Prompt v2.0 (GEMINI.md)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: Implementado el nuevo SYSTEM PROMPT v2.0 en GEMINI.md con la matriz de severidad, jerarquÃ­a de prioridades, control de secreto de Firebase, y adaptado `sync_rules.js` para mantener la compatibilidad con las secciones numeradas de la v2.0. Propagado a los 5 proyectos.
  - Archivos: [GEMINI.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY], [sync_rules.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY]

* **[x] ~~Tarea CLI-010: SincronizaciÃ³n del Ecosistema a Plan Blaze y TelemetrÃ­a Centralizada~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: Modificado `generator.js` en `Prototipe-CLI` para no inyectar variables de entorno centralizadas secundarias en `.env.local`, inyectando por defecto el endpoint unificado `VITE_DEVELOPER_TELEMETRY_ENDPOINT` que apunta a la Cloud Function HTTPS en producciÃ³n.
  - Archivos: [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CLI-009: HabilitaciÃ³n de Scaffold Limpio (Core Seed) en GestiÃ³n de Cores~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: Implementado el soporte para realizar scaffolding de nuevos Cores utilizando una plantilla limpia del sistema (`template-core-seed`). Modificado el endpoint `/api/cores/:clave/scaffold` en `server.js` (CLI).
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-008: Saneamiento de DetecciÃ³n Git en Ecosistema (CLI & Dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalizaciÃ³n: 2026-06-11
  - DescripciÃ³n: Refactorizada la detecciÃ³n de Git en el bridge server (`server.js`) para utilizar `git rev-parse --git-dir` en lugar del chequeo fÃ­sico estÃ¡tico de la carpeta `.git`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-007: Robustez en Respaldo de Subproyectos con .git-backup-temp~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalizaciÃ³n: 2026-06-11
  - DescripciÃ³n: Refactorizado `subproject_backup.ps1` para detectar de forma autÃ³noma si un subproyecto estÃ¡ en estado inactivo con la carpeta `.git-backup-temp` y renombrarlo temporalmente a `.git` para realizar la indexaciÃ³n de cambios.
  - Archivos: [subproject_backup.ps1](file:///D:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

* **[x] ~~Tarea CLI-006: CorrecciÃ³n de Bugs de Referencia, Git y Bloqueo de SSE en AutomatizaciÃ³n~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalizaciÃ³n: 2026-06-11
  - DescripciÃ³n: Corregido en `generator.js` el ReferenceError de `initials` y `storageRulesContent`. Refactorizado `/api/create-project` en `server.js` regresando a una respuesta HTTP JSON estÃ¡ndar y limpia sin SSE.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CLI-005: Saneamiento de Carpetas Git Temporales y Robustez de Vite en Backups~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalizaciÃ³n: 2026-06-11
  - DescripciÃ³n: Corregido el bug de bloqueo y permanencia de carpetas temporales `.git-backup-temp`. Se mejorÃ³ la detenciÃ³n de procesos de desarrollo en `git_backup.ps1` y `menu_backup.ps1`.
  - Archivos: [git_backup.ps1](file:///D:/PROTOTIPE/git_backup.ps1) [MODIFY], [menu_backup.ps1](file:///D:/PROTOTIPE/menu_backup.ps1) [MODIFY]

* **[x] ~~Tarea CLI-004: Tres Mejoras de Robustez y Carga de Logo en Onboarding Wizard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalizaciÃ³n: 2026-06-10
  - DescripciÃ³n: Agregado el endpoint `/api/firebase/validate` y el optimizador y compresor de logo mediante Jimp en el endpoint `/api/upload-logo`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-003: GuardiÃ¡n de Calidad y PWA en Deploy con Auto-ResoluciÃ³n y Drift Detector CRM~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalizaciÃ³n: 2026-06-10
  - DescripciÃ³n: Modificado el endpoint de deploy en `server.js` para ejecutar de forma sÃ­ncrona el auditor fÃ­sico antes de realizar el deploy. Implementados los endpoints `/api/project/drift` y `/api/project/sync-file`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-002: OptimizaciÃ³n de Chunks de Bundle y Refinamiento de Auditor PWA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalizaciÃ³n: 2026-06-10
  - DescripciÃ³n: Refinamiento de la API `/api/project/audit` en `server.js` para leer el manifest de Vite y omitir las penalizaciones por tamaÃ±o de chunks cargados dinÃ¡micamente.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-001: IntegraciÃ³n de Herramientas de AutomatizaciÃ³n en CLI Bridge Server~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalizaciÃ³n: 2026-06-10
  - DescripciÃ³n: Redireccionados logs en `worker_create_project.js` por IPC y agregadas APIs `/api/library/extract`, `/api/project/deploy` y getters/setters de variables de entorno en `/api/project/env`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [worker_create_project.js](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]

* **[x] ~~Tarea CLI-015: CorrecciÃ³n de Estructura y Responsividad MÃ³vil del CRM de Clientes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: Corregida la estructura y responsividad de los botones en la versiÃ³n mÃ³vil del CRM de Clientes. Se rediseÃ±Ã³ el contenedor global a una cuadrÃ­cula de 2 columnas en mobile (`grid-cols-2`) y se aplicaron flexibidad de crecimiento y anchos mÃ­nimos (`min-w`) en los botones de directorio de clientes para evitar truncamientos y desbordamientos. Adicionalmente, se corrigiÃ³ el bug en la funciÃ³n de resoluciÃ³n de rutas de proyectos `findProjectDir` en `server.js` que causaba errores 500 al no encontrar proyectos en directorios de plantillas core si el directorio de instancias no existÃ­a en disco.
  - Archivos: [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-014: Arquitectura General y AgnÃ³stica de Skills de IA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: Reescritas las 7 skills del ecosistema para ser agnÃ³sticas al proyecto usando la variable dinÃ¡mica `[PROYECTO_ACTIVO]`, triggers conscientes de proyectos, y rutas dinÃ¡micas estructuradas. Integrados ademÃ¡s los cambios especÃ­ficos de cada skill (categorÃ­as, colisiones, tabla canÃ³nica de simulabilidad y resoluciÃ³n de conflictos git).
  - Archivos: Carpetas en [Skills](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/) [MODIFY]

* **[x] ~~Tarea CLI-012: Saneamiento y EstandarizaciÃ³n de Nomenclatura en Biblioteca~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: RemociÃ³n de componentes duplicados (`ConnectivityToast` y `DatePicker`), eliminaciÃ³n del roadmap obsoleto (`tareas_pendientes_prioritarias.md`), y renombrado de 6 carpetas/archivos en la biblioteca al estÃ¡ndar de espaÃ±ol claro.
  - Archivos: `06_Biblioteca_Componentes` [MODIFY], `02_Tareas_Roadmap/tareas_pendientes_prioritarias.md` [DELETE], [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CLI-011: ActualizaciÃ³n a System Prompt v2.0 (GEMINI.md)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: Implementado el nuevo SYSTEM PROMPT v2.0 en GEMINI.md con la matriz de severidad, jerarquÃ­a de prioridades, control de secreto de Firebase, y adaptado `sync_rules.js` para mantener la compatibilidad con las secciones numeradas de la v2.0. Propagado a los 5 proyectos.
  - Archivos: [GEMINI.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY], [sync_rules.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY]

* **[x] ~~Tarea CLI-010: SincronizaciÃ³n del Ecosistema a Plan Blaze y TelemetrÃ­a Centralizada~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: Modificado `generator.js` en `Prototipe-CLI` para no inyectar variables de entorno centralizadas secundarias en `.env.local`, inyectando por defecto el endpoint unificado `VITE_DEVELOPER_TELEMETRY_ENDPOINT` que apunta a la Cloud Function HTTPS en producciÃ³n.
  - Archivos: [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CLI-009: HabilitaciÃ³n de Scaffold Limpio (Core Seed) en GestiÃ³n de Cores~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalizaciÃ³n: 2026-06-12
  - DescripciÃ³n: Implementado el soporte para realizar scaffolding de nuevos Cores utilizando una plantilla limpia del sistema (`template-core-seed`). Modificado el endpoint `/api/cores/:clave/scaffold` en `server.js` (CLI).
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-008: Saneamiento de DetecciÃ³n Git en Ecosistema (CLI & Dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalizaciÃ³n: 2026-06-11
  - DescripciÃ³n: Refactorizada la detecciÃ³n de Git en el bridge server (`server.js`) para utilizar `git rev-parse --git-dir` en lugar del chequeo fÃ­sico estÃ¡tico de la carpeta `.git`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-007: Robustez en Respaldo de Subproyectos con .git-backup-temp~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalizaciÃ³n: 2026-06-11
  - DescripciÃ³n: Refactorizado `subproject_backup.ps1` para detectar de forma autÃ³noma si un subproyecto estÃ¡ en estado inactivo con la carpeta `.git-backup-temp` y renombrarlo temporalmente a `.git` para realizar la indexaciÃ³n de cambios.
  - Archivos: [subproject_backup.ps1](file:///D:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

* **[x] ~~Tarea CLI-006: CorrecciÃ³n de Bugs de Referencia, Git y Bloqueo de SSE en AutomatizaciÃ³n~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalizaciÃ³n: 2026-06-11
  - DescripciÃ³n: Corregido en `generator.js` el ReferenceError de `initials` y `storageRulesContent`. Refactorizado `/api/create-project` en `server.js` regresando a una respuesta HTTP JSON estÃ¡ndar y limpia sin SSE.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CLI-005: Saneamiento de Carpetas Git Temporales y Robustez de Vite en Backups~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalizaciÃ³n: 2026-06-11
  - DescripciÃ³n: Corregido el bug de bloqueo y permanencia de carpetas temporales `.git-backup-temp`. Se mejorÃ³ la detenciÃ³n de procesos de desarrollo en `git_backup.ps1` y `menu_backup.ps1`.
  - Archivos: [git_backup.ps1](file:///D:/PROTOTIPE/git_backup.ps1) [MODIFY], [menu_backup.ps1](file:///D:/PROTOTIPE/menu_backup.ps1) [MODIFY]

* **[x] ~~Tarea CLI-004: Tres Mejoras de Robustez y Carga de Logo en Onboarding Wizard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalizaciÃ³n: 2026-06-10
  - DescripciÃ³n: Agregado el endpoint `/api/firebase/validate` y el optimizador y compresor de logo mediante Jimp en el endpoint `/api/upload-logo`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-003: GuardiÃ¡n de Calidad y PWA en Deploy con Auto-ResoluciÃ³n y Drift Detector CRM~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalizaciÃ³n: 2026-06-10
  - DescripciÃ³n: Modificado el endpoint de deploy en `server.js` para ejecutar de forma sÃ­ncrona el auditor fÃ­sico antes de realizar el deploy. Implementados los endpoints `/api/project/drift` y `/api/project/sync-file`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-002: OptimizaciÃ³n de Chunks de Bundle y Refinamiento de Auditor PWA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalizaciÃ³n: 2026-06-10
  - DescripciÃ³n: Refinamiento de la API `/api/project/audit` en `server.js` para leer el manifest de Vite y omitir las penalizaciones por tamaÃ±o de chunks cargados dinÃ¡micamente.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-001: IntegraciÃ³n de Herramientas de AutomatizaciÃ³n en CLI Bridge Server~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalizaciÃ³n: 2026-06-10
  - DescripciÃ³n: Redireccionados logs en `worker_create_project.js` por IPC y agregadas APIs `/api/library/extract`, `/api/project/deploy` y getters/setters de variables de entorno en `/api/project/env`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [worker_create_project.js](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]

* **[x] ~~Tarea CORE-103: Saneamiento de Codificacion y BOM de Scripts de PowerShell (menu_backup.ps1)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-28
  - Fecha de finalizaciÃ³n: 2026-06-28
  - Descripcion: Correccion al error de parseo en menu_backup.ps1 al iniciarse. Los emojis de caja (ðŸ“¦) y lineas de separacion (â”€) guardados en UTF-8 sin BOM se interpretaban como caracteres ANSI rotos por el interprete de PowerShell 5.1 en Windows, rompiendo la sintaxis y arrojando errores inesperados. Se escribio un script automatizado para forzar el guardado en codificacion UTF-8 con BOM en todos los scripts de soporte de PowerShell (menu_backup.ps1, git_backup.ps1 y subproject_backup.ps1).
  - Archivos: [menu_backup.ps1](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY], [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]


