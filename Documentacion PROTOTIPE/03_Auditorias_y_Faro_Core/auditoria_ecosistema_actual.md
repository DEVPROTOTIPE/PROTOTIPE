# Auditoría de Infraestructura y Automatización del Ecosistema

**Fecha:** 2026-06-28  
**ID de Control:** AUDIT-ECO-2026-06-28  
**Estatus:** Consolidado (Versión 1.1 - Corregido y Verificado)

Este documento contiene el inventario exhaustivo de endpoints de comunicación, componentes del dashboard interactivo, scripts de utilidades físicas y skills de IA operativas en el monorepo **PROTOTIPE**. Sirve como el "ancla de verdad única" para evitar duplicar código, proponer componentes repetidos o reescribir integraciones que ya existen.

---

## 1. Endpoints Activos de la API CLI Bridge (`server.js`)

El servidor CLI corre en `http://localhost:3001` y expone las siguientes rutas portables estructuradas por módulos:

### Aprovisionamiento y Plantillas
* `GET  /api/templates` → Lista las plantillas core disponibles en la carpeta local `/templates`.
* `POST /api/create-project` → Aprovisionamiento de nuevas instancias cliente (corre `worker_create_project.js` en subproceso, reporta progreso en streaming SSE).
* `GET  /api/firebase-config` → Autodetecta la configuración SDK de Firebase a partir de un project ID.

### Biblioteca y Componentes
* `GET  /api/library` → Lee y parsea el `README.md` de la biblioteca para extraer componentes, categorías, y tags.
* `POST /api/library/extract` → Extrae lógica/código de un proyecto para convertirlo en componente y agregarlo a la biblioteca.
* `POST /api/library/inject/preflight` → Analiza las dependencias e implicaciones antes de inyectar.
* `POST /api/library/inject/css-doctor` → Corrige variables de diseño HSL y CSS en caliente.
* `POST /api/library/sandbox/scaffold` → Genera automáticamente el andamiaje del archivo Sandbox.
* `POST /api/library/inject` y `/api/library/inject/stream` → Inyecta el componente en la instancia cliente seleccionada con logs de progreso SSE.

### Archivos y Entorno del Proyecto Activo
* `GET  /api/project/file` → Lee un archivo físico del proyecto activo.
* `POST /api/project/deploy` → Compila y despliega el proyecto activo (hosting Firebase con logs SSE).
* `GET  /api/project/env` → Lee las variables de entorno `.env.local` del proyecto activo.
* `POST /api/project/env` → Escribe/actualiza variables en `.env.local` del proyecto activo.
* `GET  /api/project/audit` → Ejecuta auditorías rápidas sobre estructura física y estado de PWA.

### Servidores de Desarrollo por Instancia Cliente
* `GET  /api/project/dev/status` → Verifica si el servidor `npm run dev` local está activo para un cliente específico.
* `POST /api/project/dev/start` → Inicia el servidor de desarrollo local del cliente seleccionado en segundo plano.
* `POST /api/project/dev/stop` → Apaga el servidor de desarrollo local del cliente seleccionado.
* `GET  /api/project/dev/logs-stream` → Streaming SSE de la consola del servidor de desarrollo (`stdout`/`stderr` de `npm run dev` del cliente).

### Roadmap y Tareas
* `GET  /api/roadmap` → Lee y parsea `tareas_pendientes.md` de forma tolerante (soporta guiones, asteriscos, negritas o tachados).
* `POST /api/roadmap/toggle` → Marca/desmarca tareas en el archivo físico serializado por `WriteQueue` y genera respaldos rotativos en `.tmp/`.

### Integridad y QA
* `GET  /api/integrity/status` → Ejecuta el validador físico `verify_library_integrity.cjs` y expone la salida del diagnóstico en tiempo real.
* `POST /api/e2e/run` → Ejecuta pruebas E2E de Playwright y transmite logs SSE.
* `GET  /api/e2e/last-result` → Recupera el último reporte de ejecución de pruebas E2E.

### Control Git y Ramas (Monorepo)
* `GET  /api/git/targets` → Escanea y autodetecta todos los repositorios Git del ecosistema.
* `GET  /api/git/status` → Obtiene estado (`git status`), rama y discrepancia de commits (ahead/behind) de un repositorio.
* `POST /api/git/discard` → Descarta cambios locales no commiteados de un archivo.
* `GET  /api/git/backup-stream` → Realiza backups Git de forma asíncrona transmitiendo el progreso por SSE.

### Gestión y Sincronización de Cores Base
* `POST /api/register-core` → Registra un nuevo core base inicializando sus carpetas y plantillas de documentación.
* `GET  /api/cores` → Lista todos los cores y su estado activo/inactivo.
* `POST /api/cores/:clave/scaffold` → Copia la estructura documental base de un core activo a otro.
* `POST /api/cores/:clave/activate` → Activa el core en el wizard.
* `POST /api/cores/:clave/deactivate` → Retira el core del wizard.
* `POST /api/cores/:clave/sync` → Sincroniza cambios del Core a la plantilla interna del CLI (`template-*`).
* `GET  /api/cores/:clave/drift` y `/api/cores/:clave/diff` → Compara diferencias físicas locales entre el código del Core y la plantilla CLI.

### Sincronización Downstream (CRM Clientes)
* `GET  /api/instancias/list` → Lista todos los clientes y calcula en vivo el porcentaje de paridad (MD5 hash drift) respecto a sus cores de referencia.
* `GET  /api/instancias/sync-and-deploy-stream` → Corre la sincronización del core seleccionado hacia la instancia del cliente y realiza el despliegue del host con streaming SSE.
* `GET  /api/project/firebase-rules/drift-global` → Calcula si hay diferencias entre el archivo `firestore.rules` del core y los de los clientes locales.
* `POST /api/project/firebase-rules/deploy` → Despliega las reglas locales de Firestore/Storage de un cliente seleccionado directamente a Firebase Cloud Console.

---

## 2. Pestañas y Componentes del Dashboard Central (`App.jsx`)

La consola de desarrollo del dashboard central (`dev-dashboard`) expone los siguientes paneles modulares bajo `src/components/admin/`:

1. **Pestaña `dashboard` (Inicio)**: Panel de control inicial con métricas, accesos rápidos y estado del CLI.
2. **Pestaña `billing` (Facturación)**: Renders interactivos de cobros comisionales, firmas de conformidad y descargas de PDF.
3. **Pestaña `onboarding` (Nuevo Cliente)**: Asistente visual (wizard) para crear y configurar marcas a partir de cores base (Firebase, colores HSL, SEO).
4. **Pestaña `library` (`ComponentLibraryView.jsx`)**: Visor interactivo del catálogo de componentes de marca blanca, barra de búsqueda, asistente híbrido de IA y wizard de auto-inyección.
5. **Pestaña `skills` (`SkillsRoadmapPanel.jsx`)**: Panel de Salud y Roadmap que integra el control interactivo de tareas físicas de `tareas_pendientes.md` y el disparador de integridad de biblioteca.
6. **Pestaña `errors` (`ErrorDiagnosticConsole`)**: Monitorización de fallas en vivo con drawer contextual y prompts automáticos para parches.
7. **Pestaña `e2e` (`E2EPanel.jsx`)**: Suite interactiva para correr y monitorear tests E2E.
8. **Pestaña `cores` (`CoreManagerPanel.jsx` / `CoreCard.jsx`)**: Administrador visual para registrar, andamiar y activar plantillas de cores comerciales. Incluye el control de paridad y sincronización Core ➔ CLI (`Sync` y `Diferencias`).
9. **Pestaña `git` (`GitBackupPanel.jsx`)**: Panel de versionamiento con detección de targets, commits rápidos por interfaz y control de diferencias (diff) locales.
10. **Pestaña `crm` (CRM de Clientes)**: Directorio de clientes con paridad en vivo (MD5 hash drift). Al abrir un cliente, se gestiona su paridad individual, limpieza de Git, y despliegue del hosting. Incluye la sub-pestaña **"Reglas Firebase (Drift & Deploy)"** para comparar y desplegar reglas locales directamente a Firebase.

---

## 3. Scripts Físicos de Utilidades en Consola

Lógica por consola disponible en el monorepo que sirve de base para automatizar:
* **Sincronización:** `sync_clients.js` y `sync_templates.js` en `Prototipe-CLI/` (mueven cambios de componentes de cores a clientes y viceversa).
* **Integridad:** `verify_library_integrity.cjs` en `dev-dashboard/scripts/` (valida playgrounds y README.md).
* **Respaldos de Sistema:** `git_backup.ps1` y `subproject_backup.ps1` en la raíz del monorepo (control de backups y copias redundantes en Git).

---

## 4. Skills de Agente IA Operativas (`.agents/skills/`)

Ubicadas físicamente en `.agents/skills/` (exclusivo para ejecución automatizada del Agente IA):
1. **`crear-skill-prototipe`**: Meta-skill reguladora con la receta exacta de diseño de nuevas skills.
2. **`component-creator`**: Instrucciones para documentar y simular componentes atómicos.
3. **`component-extractor`**: Paso a paso para empaquetar lógica cliente y llevarla a la biblioteca.
4. **`git-strategist`**: Flujos defensivos e inteligentes de Git Flow y Conventional Commits.
5. **`integrity-compiler`**: Pipeline de build, bitácora y mapas post-cambio (`@postchange`).
6. **`onboarder-marcas`**: Scaffolding y personalización cromática y SEO de nuevos clientes.
7. **`portar-componente`**: Extracción del catálogo e inyección en el código fuente de clientes.
8. **`sandbox-integrator`**: Registro automático en caliente de playgrounds interactivos.
