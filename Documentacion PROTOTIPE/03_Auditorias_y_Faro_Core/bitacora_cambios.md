# 📝 Bitácora de Cambios e Historial de Commits

## CLI-358 — 2026-07-09
**Fix & Feature: Estabilización del Servidor, Whitelist General, Hot-Reload y Salud Clientes en Telegram**

### Cambios realizados:
1. **Estabilización de Notificaciones (Fix 1):** Agregados manejadores globales `uncaughtException` y `unhandledRejection` en `notification_server.js` para capturar errores fuera del ciclo estándar y evitar caídas del proceso hijo (`code 4294967295`).
2. **Aislamiento de Updates (Fix 2):** Envuelto el procesamiento de cada actualización en el polling de Telegram en un bloque `try-catch` propio para asegurar que un fallo al procesar una instrucción específica no interrumpa el polling ni afecte a otros usuarios.
3. **Bypass de execSync (Fix 3):** Reemplazada la llamada síncrona `execSync` por `await execAsync` en el endpoint `/api/project/firebase-rules/deploy` de `server.js` resolviendo el error `execSync is not defined` en producción.
4. **Comando `/telemetria`:** Implementada la consulta interactiva del estado de facturación mensual (`reportesBilling` de Firestore Central) con selector de clientes inline, datos de ventas netas, pedidos, facturas DIAN y modo de cobro.
5. **Comando `/telemetria_check`:** Creado reporte de cobertura general que audita en tiempo real qué clientes han transmitido telemetría el mes actual y quiénes están desactualizados.
6. **Whitelist General de Desarrollo (Fix 4):** Se auditó en red el Chat ID real del grupo general (`-1004435396668`), corrigiendo la whitelist local en `notification_config.json` para permitir la recepción del comando `/ayuda` y restaurar los accesos de administración general.
7. **Recarga en Caliente de Whitelists (Fix 5):** Implementada la función `getSystemConfig()` con caché elástico en memoria de 2 segundos para recargar configuraciones sin requerir reinicios manuales de proceso.
8. **Corregido callback `/health` (Fix 6):** Reemplazado el fetch al endpoint inexistente `/api/clients` en `notification_server.js` por una consulta directa a la colección central `clientes_control` de Firestore Central mediante `queryCollectionREST`. Esto resuelve el error *"no se pudo obtener la lista de clientes del CLI"* y permite hacer pings resilientes e independientes del estado local del Bridge.
9. **Consolidación Documental (Doc 1):** Fusionados el manual técnico del Servidor de Notificaciones y la guía de integración anterior en un único documento consolidado maestro: `Servicios_y_Firebase/Canales_Notificaciones_Telegram/manual_integracion_telegram.md`. Se eliminó el duplicado temporal `manual_consola_telegram.md` y se actualizó su registro y rol semántico en `mapa_documentacion_ia.md`.
10. **Propagación de Reglas de IA (Doc 2):** Propagada la nueva regla de prevención de drifts físico-documentales (control de borrado/renombrado de archivos declarados en Roadmap) tanto en el archivo de personalizaciones `AGENTS.md` como en los dos archivos centrales de reglas de IA `GEMINI.md` de la CLI y de Copia de Seguridad.

### Archivos modificados:
- [`notification_server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/notification_server.js) [MODIFY]
- [`notification_config.json`](file:///d:/PROTOTIPE/Prototipe-CLI/notification_config.json) [MODIFY]
- [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`manual_integracion_telegram.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Servicios_y_Firebase/Canales_Notificaciones_Telegram/manual_integracion_telegram.md) [MODIFY]
- [`mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
- [`AGENTS.md`](file:///d:/PROTOTIPE/.agents/AGENTS.md) [MODIFY]
- [`GEMINI.md`](file:///d:/PROTOTIPE/Prototipe-CLI/GEMINI.md) [MODIFY]
- [`GEMINI.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]

## CLI-355: Fix HTML Escaping en Bot de Telegram (Encoding)
- **Fecha:** 2026-07-09
- **Tipo:** Funcionalidad / Mejora
- **Impacto:** Registro retroactivo auto-generado por el validador de integridad.
- **Descripción:** Implementada función `escapeHtml()` en `notification_server.js`. Aplicada en `getTaskDetailReport`, `searchTasksInRoadmap`, listado `/tasks` y `/tasks_completed`. Añadido fallback automático a texto plano cuando Telegram devuelve error 400 HTML parse. Header `charset=utf-8` en todos los fetch a la API de Telegram.
- **Archivos afectados:** - ``notification_server.js`` [MODIFY]

Este es el log de cambios técnico activo para la sesión de desarrollo vigente del ecosistema PROTOTIPE. Los registros anteriores a esta fecha han sido auto-archivados en históricos compactos para optimizar la compatibilidad de NotebookLM.

---

---

## CLI-357 — 2026-07-09
**Feature: Integración Completa del Sistema de Diagnóstico al Bot de Telegram (3 Niveles)**

### Cambios realizados:
1. **Nivel 1 — `/integrity` enriquecido:** El comando ahora muestra todos los tipos de drift (codeDrifts por tipo MAP_MISSING vs FILE_NOT_FOUND, roadmapDrifts, sandboxDrifts, commitDrifts), advertencias del linter estético y RBAC extraídas del stderr, estado de la biblioteca, y detalle de los primeros ítems por categoría. Botones granulares: [Reparar Todo] [Exportar Reporte] [Re-ejecutar].
2. **Nivel 2 — `/integrity_autofix` con 4 fixers en secuencia:** Ejecuta en orden: (1) autocureLibrary, (2) fix-map-bulk para MAP_MISSING, (3) prune-drifts para FILE_NOT_FOUND, (4) scaffold-sandbox-bulk para sandboxes faltantes. Reporte granular por fixer con emoji de omisión (⏭️) si no hay drifts de ese tipo. Verificación post-fix con re-diagnóstico automático.
3. **Nuevo `/integrity_report`:** Exporta el reporte completo de integridad (stdout + stderr + todos los drifts) como documento `.txt` descargable en Telegram.
4. **Nuevo `/health`:** Hace ping en paralelo a todos los clientes registrados en el CLI via `/api/clients`. Muestra estado 🟢/🟡/🔴, latencia en ms y URL. Botón de re-verificación.
5. **`/start` actualizado:** Nueva sección "Diagnóstico & Salud" en el menú de ayuda. Botón "🩺 Salud Clientes" añadido al teclado inline principal.

### Archivos:
- [`notification_server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/notification_server.js) [MODIFY]

## CLI-356 — 2026-07-09

### Causa raíz:
El export `/tasks_export_run` y la vista de detalle `getTaskDetailReport` accedían a `t.fecha`, `t.fechaFin`, `t.descripcion`, `t.archivos` en el nivel raíz del objeto tarea, pero la API `/api/roadmap` anida todos esos campos dentro de `t.detail`. Resultado: exportación solo con títulos, sin fechas, descripciones ni archivos afectados.

### Correcciones:
1. **`/tasks_export_run`**: Extrae `d = t.detail || {}` y lee `d.fecha`, `d.fechaFin`, `d.descripcion`, `d.archivos` con fallback a nivel raíz.
2. **`getTaskDetailReport`**: Misma corrección. Ahora la vista de detalle por `/task_detail [ID]` en Telegram muestra fechas, descripción y archivos correctamente.
3. **Título limpio**: Se elimina el prefijo `"Tarea ID: "` del título en el export para mayor legibilidad del documento Markdown.
4. **Fallback de descripción**: Si `t.detail.descripcion` está vacío, se muestra el texto del título limpio como descripción de referencia.

### Archivos:
- [`notification_server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/notification_server.js) [MODIFY]


**Fix: HTML Escaping en Mensajes de Telegram + Fallback a Texto Plano**

### Cambios realizados:
1. **`escapeHtml()`**: Nueva función utilitaria en `notification_server.js` que escapa `&`, `<`, `>`, `"` para prevenir fallos de parseo HTML en la API de Telegram cuando el texto de una tarea contiene esos caracteres.
2. **Fallback en `sendTelegramMessage`**: Si Telegram devuelve un error 400 con descripción de parseo HTML, el bot reintenta automáticamente en modo texto plano (sin `parse_mode: 'HTML'`), eliminando etiquetas del texto antes de reenviar.
3. **Header `charset=utf-8`**: Todos los `fetch` a la API de Telegram ahora incluyen `Content-Type: application/json; charset=utf-8`.
4. **Puntos de aplicación de `escapeHtml`**: Aplicado en `getTaskDetailReport` (id, descripción, texto, archivos), `searchTasksInRoadmap` (texto de resultados), y el handler `/tasks` y `/tasks_completed` (texto de cada tarea listada).

### Archivos:
- [`notification_server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/notification_server.js) [MODIFY]

### CLI-352 — Revisión Histórica:
Esta corrección complementa la feature CLI-352 (Potencialización de Roadmap en Telegram). El bug se manifestaba cuando el texto de tareas contenía caracteres como `<`, `>`, o `&`, causando que Telegram rechazara el mensaje con error 400 HTML parse.


## CLI-352 — 2026-07-09
**Feature: Potencialización de la Gestión de Roadmap en Telegram**

### Cambios realizados:
1. **Formateadores de Roadmap:**
   - Creada la función `getTaskDetailReport(taskId)` para formatear la descripción de la tarea, fechas de ciclo de vida y listado de archivos modificados.
   - Creada la función `searchTasksInRoadmap(query)` para realizar búsquedas textuales de tareas e IDs.
2. **Handlers en Telegram:**
   - Modificado `/tasks` para incorporar filtrado dinámico por dominio (CORE, CLI, DASH, etc.) y una botonera interactiva.
   - Implementado `/tasks_completed` para ver el historial de tareas hechas y dar soporte de reapertura de tareas completadas.
   - Implementado `/tasks_filter` para desplegar el selector de dominios.
   - Implementado `/tasks_search` y `/start searchtasks_` para desviar la búsqueda conversacional a chat privado y eludir el Privacy Mode de grupos.
   - Implementado `/task_detail [id]` para ver la ficha ampliada e interactuar con el estado de la tarea.

## CORE-341 — 2026-07-09
**Bugfix: Descarga Nativa de Facturas PDF de Pedidos Completados (Revertida)**

### Cambios realizados:
1. **Reversión del cambio:**
   - Se descartaron por completo los cambios de generación nativa de PDF con `jsPDF` y se retornó al flujo de impresión nativo del navegador basado en iframe oculto (`window.print()`).
   - Se restauraron a su estado original de Git los archivos `AdminOrders.jsx` y `pdfService.js` en Moni y la plantilla Core.

## CLI-351 — 2026-07-09
**Documentation: Creación de Manual Consolidado de la Consola de Telegram**

### Cambios realizados:
1. **Manual Técnico:**
   - Creado y estructurado el archivo [`manual_consola_telegram.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/manual_consola_telegram.md) bajo el directorio temático de manuales.
   - Describe la arquitectura de 3 capas, la configuración de seguridad (`auth whitelist`), la mitigación de Privacy Mode de grupos mediante deep-links, el catálogo completo de comandos informativos y DevOps, y la lógica de auto-commit y Auto-Merge condicional a main.
2. **Sincronización del Mapa:**
   - Registrado e indexado el manual en [`mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) con sus metadatos y criterio de decisión.

## CLI-350 — 2026-07-09
**Architecture: Eliminación de Ramas Master Obsoletas en GitHub**

### Cambios realizados:
1. **Eliminación Remota:**
   - Se eliminaron con éxito las ramas remotas `master` obsoletas en el Maestro (`PROTOTIPE`) y Dashboard (`prototipe-dev-dashboard`) mediante `git push origin --delete master`.
2. **Purgación Local:**
   - Ejecutado `git fetch --prune` para purgar referencias huérfanas en los repositorios locales, dejando la arquitectura limpia en `main` y `develop`.

## CLI-349 — 2026-07-09
**Architecture: Alineación de Arquitectura de Ramas Git a main/develop**

### Cambios realizados:
1. **Unificación de scripts de Respaldo a main:**
   - Modificados los scripts locales `git_backup.ps1` y `subproject_backup.ps1` para eliminar la validación dinámica `$hasMaster = (git branch --list "master")` que forzaba el Auto-Merge hacia `master` si la rama existía localmente.
   - Forzada la variable `$mainBranch = "main"` en ambos scripts. Todos los procesos automáticos de fusión (Auto-Merge) consolidados ahora apuntan a la rama estándar de producción `main`.
2. **Re-estructuración Física de dev-dashboard:**
   - Realizado checkout de `master` y renombrado local a `main` en `Central PROTOTIPE/dev-dashboard`.
   - Subida y vinculada la rama a GitHub (`git push -u origin main`).
3. **Control Remoto en GitHub (Pendiente):**
   - Intentada la eliminación de `master` en origin, la cual requiere que el administrador modifique en la interfaz web de GitHub la rama por defecto (Default Branch) de `master` a `main` tanto en `PROTOTIPE` como en `prototipe-dev-dashboard`.

## CLI-348 — 2026-07-09
**Fix: Sincronización Completa de Auto-Merge y Push en Telegram**

### Cambios realizados:
1. **Paso Explícito de Parámetros Git:**
   - Corregido el flujo en `executeGitPush` donde la omisión de los parámetros query string en la llamada local hacía que la API de backup usara fallbacks de red pasivos.
   - Forzado el parámetro `&push=true` para garantizar el empuje a GitHub en cada invocación remota.
2. **Estrategia de Auto-Merge Condicional:**
   - Implementado el parámetro dinámico `&autoMerge=[true/false]` basado en el repositorio. Si la ruta pertenece al Core del sistema (maestro, dev-dashboard o plantillas) y no es una instancia de cliente, se activa la consolidación automática a la rama de producción (`main`/`master`) en el repositorio remoto, garantizando la paridad al 100% con la lógica del dashboard.

## CLI-347 — 2026-07-09
**Feature: Reporte Interactivo de Pre-flight para Publicación de Git en Telegram**

### Cambios realizados:
1. **Reporte Pre-flight Detallado:**
   - Rediseñado el comando `/git_push_confirm` para que antes de solicitar la confirmación final, genere un informe de pre-flight enriquecido.
   - Muestra el nombre del repositorio, la rama Git activa, el mensaje de commit previsto generado automáticamente.
   - Detalla la tarea del Roadmap a la que se asociará (incluyendo su ID, descripción textual y estado actual).
   - Lista de manera visual los primeros 10 archivos que se subirán con iconos semánticos (`📝`, `➕`, `🗑️`, `🔄`).
2. **Alertas de Seguridad en Tiempo Real:**
   - Verifica la propiedad `envLeak` en vivo. Si se detectan archivos `.env` expuestos, muestra una advertencia destacada en el chat y detalla cuáles archivos están comprometidos antes de la confirmación.

## CLI-346 — 2026-07-09
**Feature: Paridad de Auto-Commit y Mensaje de Commit Inteligente en Telegram**

### Cambios realizados:
1. **Generación Automática de Commit Message:**
   - Desarrollada la función `generateAutoCommitMessage(repoPath)` en `notification_server.js` que replica con precisión la lógica visual de "Auto" del dashboard React.
   - Analiza el estado del repo (`GET /api/git/status`) agrupando archivos agregados, modificados y eliminados.
   - Mapea y enlaza de forma dinámica el ID de la tarea activa no completada en el Roadmap del CLI (`GET /api/roadmap`) y formatea la fecha ISO junto al branch activo.
2. **Respaldo Inteligente (/git_push_confirm):**
   - Modificado el handler `executeGitPush` del bot de Telegram para autogenerar e inyectar el mensaje del commit en la petición del stream del backup de Git (`/api/git/backup-stream?message=...`).
   - El mensaje final del push en Telegram ahora detalla con precisión el commit message aplicado para la tranquilidad del operador técnico.

## CLI-345 — 2026-07-09
**Feature: Diagnóstico de Pruebas Playwright e Inventario de Cores (Sprint 3)**

### Cambios realizados:
1. **Módulo de Pruebas (/tests):**
   - Desarrollada función `getE2EProjectsList()` que interactúa con `/api/e2e/projects` para listar todos los proyectos con Playwright configurado.
   - Creado `/tests [projectId]` que interactúa con `/api/e2e/last-result` para reportar el resultado de la última ejecución de pruebas Playwright en formato legible, mostrando si pasó/falló, duración de ejecución y cantidad de tests aprobados/reprobados.
2. **Inventario de Cores (/cores):**
   - Implementado `getCoresReport()` que consulta `/api/cores` para mapear los cores registrados en el archivo local de plantillas, mostrando su clave, nicho de mercado, estado de actividad, y ruta absoluta.
3. **Ayuda Integrada (/help):**
   - Incorporados comandos `/tests` y `/cores` con inline buttons correspondientes.

### Archivos modificados:
- `Prototipe-CLI/notification_server.js` (Formatters y handlers de tests/cores)

---

## CLI-344 — 2026-07-09
**Feature: Autocuración y Desviación de Reglas de Firebase vía Telegram (Sprint 2)**

### Cambios realizados:
1. **Módulo de Reparación (/fix):**
   - Implementado flujo interactivo con selector de cliente para fix.
   - Añadido `/fix_chunks_action` que solicita confirmación `AWAITING_CONFIRM` antes de invocar `POST /api/project/fix/chunks` para optimizar bundles y dividir dependencias pesadas de Vite.
   - Añadido `/fix_pwa_action` que solicita confirmación `AWAITING_CONFIRM` antes de invocar `POST /api/project/fix/pwa` para restablecer íconos y favicon faltantes desde la plantilla base.
2. **Matriz de Reglas de Firebase (/rules):**
   - Creado `getFirebaseRulesDriftReport()` que consulta `GET /api/project/firebase-rules/drift-global` y genera un reporte en vivo del estado de consistencia local vs nube para las reglas de Firestore y Storage de todos los clientes.
   - Incorporada botonera interactiva que detecta qué instancias tienen desviación (drift: true) y genera botones táctiles específicos `🩹 Desplegar: [cliente]` para aplicar reglas actualizadas en caliente vía `POST /api/project/firebase-rules/deploy`.
3. **Menú de Ayuda (/help):**
   - Actualizado con comandos explicativos `/fix` y `/rules` e inline buttons rápidos.

### Archivos modificados:
- `Prototipe-CLI/notification_server.js` (Formatters, interceptor y handlers de fix/rules)

---

## CLI-343 — 2026-07-09
**Feature: Módulos Git y DevServer remotos en Bot de Telegram (Sprint 1)**

### Cambios realizados:
1. **Módulo Git (/git):**
   - Implementado flujo interactivo con `getGitTargetsList()` consultando `/api/git/targets`. Genera un selector inline de repositorios con indicador visual de cambios (🔴/🟢).
   - Implementados comandos secundarios `/git_repo [id]` que expone un submenú táctil para cada repositorio (Ver Cambios, Commits, Sin Publicar, Publicar).
   - Implementados formateadores y handlers detallados: `/git_status` (consulta `/api/git/status` y muestra el estado y alertando de archivos `.env`), `/git_log` (commits recientes), `/git_unpushed` (commits sin push validando el task ID y Conventional Commits).
   - Integrado `/git_push_confirm` para solicitar confirmación táctil (`AWAITING_CONFIRM`) antes de invocar `/api/git/backup-stream` para publicar cambios de manera asíncrona.
2. **Módulo DevServer (/devserver):**
   - Desarrollada vista táctil del estado del servidor de desarrollo Vite (`/api/project/dev/status`) con botones dinámicos según el estado (Arrancar o Detener/Reiniciar).
   - Integrados comandos `/devserver_start`, `/devserver_stop_confirm` y `/devserver_restart` para el control de procesos npm dev asíncronos mediante confirmación manual.
3. **Ayuda Integrada (/help):**
   - Actualizada la interfaz de ayuda `/help` con descripciones de comandos claras y botones táctiles rápidos en un layout inline balanceado y mobile-friendly.

### Archivos modificados:
- `Prototipe-CLI/notification_server.js` (Formatters, interceptor de confirmación, y nuevos comandos)

---

## CLI-342 — 2026-07-09
**Fix: 3 Correcciones Estructurales del Bot de Telegram**

### Cambios realizados:
1. **Auth Whitelist (Fix 1):** Implementada función `isAuthorized(chatId, command)` en `notification_server.js`. Verifica `systemConfig.auth.allowedChatIds` y `adminChatIds`. Comandos destructivos requieren nivel admin. Silencio total para IDs desconocidos. Config en `notification_config.json` con sección `auth`.
2. **Job Tracker (Fix 2):** Implementados helpers `sendJobMessage()` y `editJobMessage()` + Map `activeJobs`. Los comandos `/deploy` e `/integrity_autofix` ahora envían mensaje "⏳ En progreso" y lo editan con el resultado final usando background IIFE + `AbortSignal.timeout(600000)`. Nuevo endpoint `POST /api/notify/job-complete` para callbacks externos.
3. **AWAITING_TEXT fix (Fix 3):** Resuelto Privacy Mode de Telegram en grupos. Handler `/addtask_cat CUSTOM` ahora genera botón deep-link `t.me/BOT?start=addtask_{chatId}_{domain}`. `/start` intercepta payload, activa `AWAITING_TEXT` en DM privado con campo `groupChatId` para confirmar de vuelta al grupo. `botUsername` se resuelve en startup vía `getMe`.

### Archivos modificados:
- `Prototipe-CLI/notification_server.js` (3 fixes: isAuthorized, sendJobMessage/editJobMessage, deep-link /start)
- `Prototipe-CLI/notification_config.json` (sección auth con allowedChatIds/adminChatIds)

---

## CLI-341: Asistente Interactivo de Creación de Tareas por Telegram + Fix Roadmap Integrity
- **Fecha:** 2026-07-09
- **Tipo:** Feature / Telegram UX / Bugfix Prebuild / Linter Mejoras
- **Archivos modificados:**
  - `Prototipe-CLI/notification_server.js` [NEW]
  - `Prototipe-CLI/server.js` [MODIFY]
  - `Prototipe-CLI/notification_config.json` [NEW]
  - `Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs` [MODIFY]
  - `Central PROTOTIPE/dev-dashboard/src/App.jsx` [MODIFY]
  - `Central PROTOTIPE/dev-dashboard/src/components/admin/HealthMonitorView.jsx` [MODIFY]
  - `Documentacion PROTOTIPE/07_Manuales_Desarrollo/Servicios_y_Firebase/Canales_Notificaciones_Telegram/manual_integracion_telegram.md` [NEW]

### Feature: Wizard de /addtask en Telegram
- Implementado asistente conversacional step-by-step (State Machine con `userStates`) en `notification_server.js`.
- Flujo interactivo: selección de **Dominio** → **Categoría** → **Plantilla predefinida o Texto Libre**.
- Botoneras táctiles (Inline Keyboards de Telegram) en cada paso, sin escritura manual.
- Captura de texto libre via intercepción de mensajes en estado `AWAITING_TEXT`.
- Fallback directo: `/addtask [DOM] [Texto]` para tareas exprés.
- Las tareas creadas se persisten en `tareas_pendientes.md` via `POST /api/roadmap/add` del CLI Bridge.

### Bugfix: Desalineación del Roadmap en Prebuild
- **Causa raíz:** La tarea generada automáticamente (`DOC-4`) era un stub vacío sin lista de `- Archivos:`. El linter `verify_library_integrity.cjs` la tomaba como la tarea activa y fallaba al no encontrar ningún archivo git-modificado registrado.
- **Corrección 1 — Roadmap:** Reemplazada `DOC-4` por `CLI-341` con la lista completa de todos los archivos modificados y nuevos del workspace.
- **Corrección 2 — Exclusiones del Linter:** Añadidos filtros para artefactos auto-generados que nunca deben chequearse: `notification_config.json`, rutas `.tmp/`, archivos `.firebase/*.cache`.
- **Corrección 3 — Matching de Directorios:** El algoritmo `isRegistered` fue mejorado para manejar el caso donde `git status --porcelain` reporta un directorio completo untracked con `/` al final. Ahora hace **prefix-match inverso**: si un archivo registrado empieza con el prefijo del directorio reportado, se considera registrado.

### Resultado
- `verify_library_integrity.cjs` pasa al 100% con `✅ INTEGRIDAD DE LA BIBLIOTECA AL 100% OK.`
- Cero falsos positivos por archivos de configuración local o cachés de Firebase.
- Las advertencias restantes (`LeafletMapPickerSandbox`, `OrderDeliveryPanel`) son preexistentes y no bloqueantes.

## CORE-340: Comandos Interactivos, Botones de Telegram, Corrección de Token OAuth2 y Depuración de Reportes
- **Fecha:** 2026-07-09
- **Tipo:** Ajustes / DevOps / Telegram Commands / Documentación / Polling / UX / Bugfix
- **Descripción:** 
  * Diseñado e implementado el ciclo de Polling de Comandos en tiempo real (cada 3 segundos) en `notification_server.js` para procesar comandos interactivos de Telegram.
  * Corregido el flujo de refresco de tokens OAuth2 de Firebase CLI en `notification_server.js` integrando el `client_secret` oficial de Google Cloud (`j9iVZfS8kkCEFUPaAeJV0sAi`) para resolver errores `401 Unauthorized/ACCESS_TOKEN_TYPE_UNSUPPORTED` al consultar Firestore REST.
  * Añadida compatibilidad con **Callback Queries e Inline Keyboards** de Telegram para permitir ejecutar comandos mediante botones táctiles interactivos en los chats (`🩺 Salud`, `🚨 Errores`, `📝 Preventas`, `💰 Facturación`, `📦 Clientes CLI`).
  * **Corrección de Duplicados en Salud (`/status`):** Se modificó la consulta para cruzar la colección `health_checks` con los clientes activos en `clientes_control`, eliminando registros obsoletos/duplicados como `moni-app` y corrigiendo el color del emoji a verde `🟢` cuando el estado es `green`.
  * **Filtro de Preventas Incompletas (`/leads`):** Se añadió un filtro que descarta preventas borradores/incompletas, mostrando solo briefings finalizados (`finalizado === true`, `status === 'completed'` o `progreso === 100`).
  * **Corrección de Fecha Inválida (`/billing`):** Creado el helper `formatFirestoreDate()` para parsear correctamente objetos de tipo Firestore Timestamp (con métodos `toDate` y `toMillis`), resolviendo el error de "invalid date".
  * **Corrección de Listado de Clientes CLI (`/clientes`):** Reescrita la función `getClientInstancesList()` para procesar adecuadamente la estructura de datos agrupada por plantillas devuelta por el API local `/api/instancias/list`.
  * **Corrección de Llamada DevOps (`/deploy`):** Se corrigió la petición de red del bot hacia el endpoint del Bridge local `/api/project/deploy` enviando el `clientId` dentro del cuerpo de la petición (`POST body`) en formato JSON en lugar de pasarlo en la URL (query string). Esto satisface la validación estricta de parámetros del Bridge que exige cuerpo de petición para solicitudes POST, habilitando la compilación y despliegue automáticos.
  * **Asistente de Creación de Tareas Interactivo (`/addtask`):** Diseñado e implementado un asistente conversacional estructurado por pasos (Wizard State-Machine) en `notification_server.js` que se gestiona mediante botones táctiles. El flujo guía al usuario en la selección del dominio (Paso 1), selección de categoría (Paso 2) y elección de plantilla predefinida o entrada manual en texto libre (Paso 3) capturada a través de un interceptor de estados en memoria.
  * Creado el manual definitivo `manual_integracion_telegram.md` detallando la arquitectura del fork, ruteo por canal, guía de creación de bots y catálogo completo de comandos.
- **Archivos afectados:**
  - [Prototipe-CLI/notification_server.js](file:///d:/PROTOTIPE/Prototipe-CLI/notification_server.js) [MODIFY]
  - [Documentacion PROTOTIPE/07_Manuales_Desarrollo/Servicios_y_Firebase/Canales_Notificaciones_Telegram/manual_integracion_telegram.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Servicios_y_Firebase/Canales_Notificaciones_Telegram/manual_integracion_telegram.md) [NEW]
  - [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

## CORE-339: Ruteo de Alertas por Canal Específico y Guía de Creación de Bots
- **Fecha:** 2026-07-09
- **Tipo:** Ajustes / UX / Omnichannel Alerts / Ruteo / Documentación
- **Descripción:** 
  * Implementado el ruteo de alertas por canal específico (`crashes`, `briefings`, `billing`, y `devops`) en `notification_server.js` con fallback inteligente al Canal General (si no se configuran credenciales locales).
  * Diseñado y renderizado un selector de subpestañas interactivo en la tarjeta "Canales de Alertas Omnicanal" de la sección Ajustes de `App.jsx` para conmutar entre la configuración general y la de cada subcanal.
  * Añadida una guía interactiva y colapsable que describe detalladamente los pasos para crear bots en Telegram con `@BotFather` y obtener IDs de chats y grupos con bots de soporte.
  * Actualizado el endpoint de prueba del microservicio para enrutar el despacho a través de las credenciales del canal seleccionado en tiempo real.
- **Archivos afectados:**
  - [Prototipe-CLI/notification_server.js](file:///d:/PROTOTIPE/Prototipe-CLI/notification_server.js) [MODIFY]
  - [dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

## CORE-338: Relocalización y Consolidación de Configuración de Alertas Omnicanal
- **Fecha:** 2026-07-09
- **Tipo:** Ajustes / UX / Omnichannel Alerts / Refactorización / Firestore
- **Descripción:** 
  * Reubicado el panel de configuración de Telegram Bot y Discord Webhook desde el monitor de salud (`HealthMonitorView.jsx`) hacia la pestaña de Ajustes globales (`activeTab === 'settings'`) en `App.jsx`, presentándolo en formato de tarjeta premium.
  * Eliminado el modal redundante y el botón de engranaje de configuración en `HealthMonitorView.jsx` para centralizar toda la administración del sistema.
  * Corregidos y mapeados los campos de las colecciones de Firestore central (`app_failures`, `briefings` y `reportesBilling`) en `pollCollections` de `notification_server.js` para asegurar paridad con los esquemas reales (ej. `timestamp` en fallos, `fecha` en preventas, `updatedAt` en facturación), resolviendo de raíz el problema por el cual no se despachaban las alertas a Telegram/Discord.
- **Archivos afectados:**
  - [Prototipe-CLI/notification_server.js](file:///d:/PROTOTIPE/Prototipe-CLI/notification_server.js) [MODIFY]
  - [dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [dev-dashboard/src/components/admin/HealthMonitorView.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/HealthMonitorView.jsx) [MODIFY]

## CORE-337: DevOps y SaaS Business Alerts Integration
- **Fecha:** 2026-07-09
- **Tipo:** DevOps / SaaS Alerts / REST API / OAuth2 / Firebase CLI Integration
- **Descripción:** 
  * Reescrito el motor de listeners de `notification_server.js` para migrar del SDK cliente de Firebase (el cual fallaba por restricciones de autenticación anónima) a un sistema resiliente de polling activo cada 15 segundos sobre la **Firestore REST API**.
  * Implementada la obtención y refresco automático de tokens OAuth2 leyendo directamente la sesión activa de **Firebase CLI** (`firebase-tools.json`), permitiendo acceso completo de lectura/escritura como administrador sin credenciales estáticas ni exposición de contraseñas.
  * Añadida lógica de parseo recursivo (`parseFirestoreDocument`) para convertir respuestas crudas tipadas de Firestore REST a objetos JavaScript puros.
  * Integrada la lógica autónoma del **Health Monitor (pings y disponibilidad de clientes)** directamente en el microservicio en segundo plano:
    - Realiza pings HTTP y validaciones de PWA manifest a todas las instancias activas de `clientes_control` cada 5 minutos de forma 100% independiente del navegador.
    - Compara el estado con el último registro de Firestore y despacha de forma autónoma alertas **SaaS Down (🔴)** y **SaaS Up (🟢)** ante caídas y recuperaciones.
    - Escribe los resultados actualizados e historial de latencia directamente en la colección Firestore `health_checks`, sincronizando el semáforo visual del dashboard central en caliente.
  * Integrada alerta DevOps de despliegue exitoso o fallido directamente en el flujo de `/api/project/deploy` de `server.js` (con disparadores automáticos a los canales correspondientes).
  * Integrada alerta DevOps de pre-compilación fallida en el script de linter y calidad `verify_library_integrity.cjs` antes de forzar la salida del proceso.
  * Corregido y optimizado el regex parser del linter de Git para dar soporte a espacios en nombres de carpetas (`Documentacion PROTOTIPE`), eliminando fallos falsos positivos en compilación.
- **Archivos afectados:**
  - [Prototipe-CLI/notification_server.js](file:///d:/PROTOTIPE/Prototipe-CLI/notification_server.js) [MODIFY]
  - [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [dev-dashboard/scripts/verify_library_integrity.cjs](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY]
  - [dev-dashboard/src/components/admin/HealthMonitorView.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/HealthMonitorView.jsx) [MODIFY]
  - [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

## CORE-336: Microservicio de Notificaciones y Acoplamiento de Proceso Hijo
- **Fecha:** 2026-07-09
- **Tipo:** CLI / Microservicios / Express / Proceso Hijo IPC
- **Descripción:** 
  * Se diseñó y creó el microservicio independiente `notification_server.js` en el puerto `5050` para centralizar el envío de alertas a Telegram y Discord, evitando la inicialización de Firebase Client SDK en el CLI (eliminando fallos por falta de permisos/sesión activa).
  * Implementado sistema de caché local con persistencia en `notification_config.json` para almacenamiento local tolerante a fallos y sin conexión a red.
  * Acoplado arranque 100% automático del microservicio mediante `child_process.fork()` desde `server.js` en el arranque del CLI, incluyendo auto-reinicios resilientes y limpieza de proceso zombie al apagar la terminal.
  * Integrada comunicación bidireccional IPC (`parent.send()`) para propagar cambios de configuración desde el dashboard central en tiempo real.
  * Modificada la interfaz de `HealthMonitorView.jsx` y endpoints de `server.js` para canalizar las alertas de prueba y configuración del monitor de salud a través del nuevo microservicio.
- **Archivos afectados:**
  - [Prototipe-CLI/notification_server.js](file:///d:/PROTOTIPE/Prototipe-CLI/notification_server.js) [NEW]
  - [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [Central PROTOTIPE/dev-dashboard/src/components/admin/HealthMonitorView.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/HealthMonitorView.jsx) [MODIFY]
  - [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

## CORE-335: Sistema de Alertas Activas Omnicanal (Telegram/Discord Webhooks)
- **Fecha:** 2026-07-09
- **Tipo:** Dashboard / Notificaciones / Firebase / Integración API
- **Descripción:** 
  * Se diseñó e implementó la integración de alertas activas a Telegram y Discord en el Health Monitor.
  * Creado un modal de configuración con diseño premium y HSL tokens para administrar credenciales y habilitar/deshabilitar el canal global de alertas.
  * Persistida la configuración en Firestore (`configuracion_sistema/monitoreo`) con sincronización en tiempo real vía `onSnapshot`.
  * Programado el envío de alertas en caliente al pulsar "Probar Conexión" y lógica de control de transiciones de salud (Up/Down) para prevenir notificaciones duplicadas (spam).
  * **Archivos afectados:**
    - [Central PROTOTIPE/dev-dashboard/src/components/admin/HealthMonitorView.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/HealthMonitorView.jsx) [MODIFY]
    - [Central PROTOTIPE/dev-dashboard/firestore.rules](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firestore.rules) [MODIFY]
    - [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

## CORE-334: Registro de Componente AnimatedNavbarMobile (Bottom Nav PWA)
- **Fecha:** 2026-07-09
- **Tipo:** Biblioteca de Componentes / UX / Mobile UI
- **Descripción:** 
  * Se creó e integró el componente premium `AnimatedNavbarMobile` (barra de navegación inferior elástica) para móviles y PWA.
  * Se generó la documentación técnica `.md` en la categoría `Ecommerce_y_Ventas` con la firma de props, especificaciones visuales y diagrama de interacción Mermaid.
  * Se implementó el archivo de sandbox interactivo independiente `AnimatedNavbarMobileSandbox.jsx` en el dashboard de administración con controles de preset (3, 4, 5 botones) y simulación de pantalla de teléfono inteligente en tiempo real.
  * Se registró el componente en los mapas semánticos de documentación y en el `README.md` del catálogo.
  * **Archivos afectados:**
    - [Documentacion PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Barra_Navegacion_Animada_Movil/barra_navegacion_animada_movil.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Barra_Navegacion_Animada_Movil/barra_navegacion_animada_movil.md) [NEW]
    - [Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/AnimatedNavbarMobileSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/AnimatedNavbarMobileSandbox.jsx) [NEW]
    - [Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
    - [Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
    - [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

## CORE-333: Consistencia y Trazabilidad de Git Automática desde el Dashboard
- **Fecha:** 2026-07-09
- **Tipo:** CLI / Dashboard / Git Automation / DX
- **Descripción:** 
  * **Problema:** En el panel de control de consistencia multidimensional, las tareas marcadas como completadas recientemente carecían de commits inmediatos si eran pushed fuera de los últimos 15 commits por commits de mantenimiento posteriores o si se realizaban en lotes, arrojando advertencias en la pestaña de historial Git.
  * **Endpoint del Servidor CLI:** Se implementó la ruta `POST /api/git/link-tasks` en `server.js` que recibe un listado de IDs de tareas y ejecuta de forma segura un commit vacío en el repositorio con un mensaje estructurado: `chore(git): link tasks [IDs] to Git history to satisfy traceability`.
  * **Acción en el Frontend:** Se agregó el botón reactivo **"🔗 Vincular Todo"** en la pestaña de Commits de `SkillsRoadmapPanel.jsx`. Al presionarlo, realiza la petición asíncrona al CLI, vinculando al instante las tareas sueltas al historial de Git y refrescando el diagnóstico para re-establecer el estatus de Consistencia Multidimensional al 100% OK de manera automática.
  * **Archivos afectados:**
    - [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
    - [dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [MODIFY]

## CORE-332: Optimización de Bundles de Producción y Resolución de Alerta PWA
- **Fecha:** 2026-07-09
- **Tipo:** Performance / Config / Build / Quality Audit
- **Descripción:** 
  * Se identificó que la consolidación de librerías en un único bundle `vendor` elevó el peso de este archivo a 858 KB, arrojando una advertencia de auditoría de rendimiento en el panel de calidad PWA.
  * Solución y Code Splitting Final: Se optimizó el proceso de empaquetado en `vite.config.js` extrayendo las librerías a sus propios chunks independientes:
    - `react-core` (~191 KB): Agrupa `react`, `react-dom` y `react-error-boundary` (eliminando cualquier error de inicialización en Windows).
    - `react-router` (~38 KB): Agrupa `react-router`, `react-router-dom` y `@react-router/`.
    - `react-query` (~42 KB): Mapea `@tanstack/react-query` y `@tanstack/query-core`.
    - `zod` (~72 KB): Mapea `zod`.
    - Con este split premium, el peso del bundle `vendor` descendió de 858 KB a **509 KB**, eliminando de raíz las advertencias del auditor de calidad PWA y blindando todas las futuras instancias del CLI.
  * Archivos afectados:
    - [Plantillas Core/App Ventas/vite.config.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/vite.config.js) [MODIFY]
    - [Prototipe-CLI/templates/template-ventas/vite.config.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js) [MODIFY]
    - [Prototipe-CLI/templates/template-core-seed/vite.config.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/vite.config.js) [MODIFY]
    - [Instancias Clientes/ventas/ventas-moni-app/vite.config.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/vite.config.js) [MODIFY]

## CORE-331: Lupa de Zoom Interactivo y Animado para Versión Móvil
- **Fecha:** 2026-07-09
- **Tipo:** UI/UX / Mobile Optimization / Gestures / Framer Motion
- **Descripción:** 
  * Para evitar acercamientos o movimientos de zoom accidentales en móviles al arrastrar o hacer scroll por la página, se creó un botón interactivo de lupa animada (pulsante) en la parte inferior izquierda de la imagen del producto.
  * Al presionar este botón, se activa el modo lupa en móviles, deshabilitando de forma segura el scroll de la pantalla (`touch-none` en el contenedor) y bloqueando el deslizamiento del carrusel de imágenes de Framer Motion (`drag={false}` en la imagen).
  * Con el modo activo, el usuario puede explorar e inspeccionar a detalle la textura de la imagen arrastrando su dedo de forma inmersiva y fluida directamente en el contenedor del producto. Al presionar el botón de nuevo, se desactiva y se restaura el control de navegación estándar de la app.
  * Archivos afectados: `ProductDetailPage.jsx`, `ProductPublicDetail.jsx` en plantillas core y réplicas de clientes.

## CORE-330: Remoción de Bordes Negros en Detalle de Producto
- **Fecha:** 2026-07-09
- **Tipo:** UI/UX / Brand Customization
- **Descripción:** 
  * Se suavizaron los bordes rígidos y oscuros alrededor de los elementos clave de la página de detalle de producto y la vista pública QR. Se eliminaron los contornos toscos y se reemplazaron por sombras sutiles y bordes muy atenuados adaptados al tema de color (HSL) activo, puliendo la interfaz de marca blanca.
  * Archivos afectados: `ProductDetailPage.jsx`, `ProductPublicDetail.jsx` en plantillas core y réplicas de clientes.

## CORE-329: Lupa Zoom en Detalle de Producto y QR Público
- **Fecha:** 2026-07-08
- **Tipo:** UI/UX / Feature Premium / Mobile Optimization / Gestures
- **Descripción:** 
  * **Integración de Zoom Lente Magnificador:** Se inyectó la lógica de la biblioteca `GaleriaZoomHover` directamente en las dos principales vistas de producto: la vista interna del cliente (`ProductDetailPage.jsx`) y la vista pública QR (`ProductPublicDetail.jsx`).
  * **Interacción Dual Hover & Touch:** El lente calcula las coordenadas porcentuales del evento de movimiento (con `containerRef.current.getBoundingClientRect()`) y actualiza dinámicamente la posición del visor de zoom. Soporta hover en computadores y `onTouchMove` en dispositivos móviles sin bloquear el swipe/drag de Framer Motion.
  * **Corrección de Relación de Aspecto (Squashing Fix):** Se reemplazó el uso de `backgroundImage` con `backgroundSize` calculado en pixeles por una etiqueta duplicada `<img />` posicionada de forma absoluta (`w-[200%] h-[200%] object-cover`). Al replicar exactamente el estilo y clase `object-cover` del visor principal, se elimina por completo el aplastamiento y alargamiento en imágenes no cuadradas, garantizando una fidelidad visual del 100%.
  * **Refinamiento de Bordes y Esquinas (Double Border & Radius Fix):**
    - Se eliminó la clase de borde púrpura rígido (`border-2 border-indigo-500/20`) del overlay de zoom para evitar el efecto de "doble borde" discordante con el contenedor externo.
    - Se suavizó el contorno del contenedor principal reemplazando el borde genérico `border-app` por una línea fina y elegante compatible con temas oscuros y claros: `border-neutral-200/80 dark:border-neutral-800/80`.
    - Se alineó el radio de esquina (`border-radius`) del visor de zoom a `rounded-3xl` en `ProductPublicDetail.jsx` para coincidir exactamente con el contenedor del carrusel, erradicando filtraciones visuales en las esquinas.
  * **Efectos Premium de Reflexión y Elevación (Glass Parallax & Shadow Elevation):**
    - Se añadió un gradiente diagonal de luz (`linear-gradient(135deg, ...)`) con mezcla `overlay` (`z-16`) que se desplaza en paralaje en base a las coordenadas del cursor/touch, simulando un cristal protector físico sobre el producto.
    - Se implementó una elevación de sombra Spring (`hover:shadow-[0_20px_50px_...]`) con transición acelerada por hardware de 500ms en el contenedor externo, transmitiendo volumen tridimensional al hacer zoom.
  * **Leyenda Adaptativa:** Añadido un badge flotante con z-index seguro indicando *"Toca o pasa el cursor para ampliar detalles"* para guiar al usuario móvil.
  * **Corrección de Segmentación de Chunks (Windows Backslash & React Context Bug):**
    - Se identificó que la división manual de bundles (`manualChunks` en `vite.config.js`) utilizaba filtros de rutas con barras inclinadas hacia adelante (ej. `id.includes('react/')`). En entornos Windows, las rutas resueltas por Rollup contienen barras invertidas (`\`), lo que provocaba que `react` cayera por defecto en el chunk `vendor-utils` mientras que `react-dom` se empaquetaba en `react-core`, rompiendo la inicialización en producción con el error `Cannot read properties of undefined (reading 'createContext')`.
    - Solución: Se introdujo la normalización de rutas a nivel de Rollup (`id.replace(/\\/g, '/')`) antes de evaluar las agrupaciones.
    - Se simplificó la segmentación manual consolidando todos los módulos de dependencias generales core (React, React DOM, React Router, Zustand, TanStack Query, Zod, react-error-boundary, cookie, set-cookie-parser, etc.) en un único bundle consolidado denominado `vendor`. Esto elimina de raíz las alertas y fallas por dependencias circulares cruzadas (`Circular chunk: vendor-utils -> react-core -> vendor-utils`) y garantiza el orden de inicialización seguro y estable en servidores de hosting de producción.
- **Archivos modificados:**
  * [Plantillas Core/App Ventas/vite.config.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/vite.config.js) [MODIFY]
  * [Plantillas Core/App Ventas/src/pages/client/ProductDetailPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  * [Plantillas Core/App Ventas/src/pages/client/ProductPublicDetail.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
  * [tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

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
