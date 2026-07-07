# 📖 Manual de Operación y Auditoría Técnica Absoluta del Ecosistema PROTOTIPE 2026

Este documento constituye la documentación maestra y consolidada de auditoría técnica y manual de operación del ecosistema PROTOTIPE, analizado a nivel de archivos, componentes, botones, APIs, lógica de negocio y automatizaciones en caliente de todo el monorepo.

---

## 📂 Sección 1 — Reconocimiento General e Inicialización

### Tecnologías y Frameworks del Ecosistema
- **Consola Central (dev-dashboard):** React 19, Vite, Tailwind CSS v4 para diseño dinámico, Recharts/ApexCharts para visualización de KPIs y comisiones de desarrollador.
- **Motor CLI (Prototipe-CLI):** Node.js (ESM), Express, Server-Sent Events (SSE) para logs en vivo de terminal, y empaquetadores de templates Core.
- **Plantillas Core (App Ventas):** React 19, Vite 6, Tailwind CSS v4, arquitectura desacoplada en 3 capas de base de datos Firebase (Repository → Service → Hook → UI) y persistencia offline con Zustand / IndexedDB (Dexie).
- **Scripts de Automatización:** PowerShell Core (versión 7+ compatible) y scripts por lotes (.bat) para empaquetamiento, respaldos Zero-Checkout y balanceadores de upstream.

---

## 💻 Sección 2 — Auditoría de la Consola Central (dev-dashboard)

El análisis del frontend revela la siguiente estructura y comportamiento del dashboard de desarrollo:

### 2.1. Ficha Técnica de Dependencias (package.json)
*   **Vite:** ^8.0.12 (Vite 8, entorno ultra rápido de empaquetado ESM).
*   **React & React-DOM:** ^19.2.6 (React 19, concurrencia nativa).
*   **Tailwind CSS y @tailwindcss/vite:** ^4.3.0 (Tailwind CSS v4.0 con integración nativa para Vite).
*   **Firebase SDK:** ^12.13.0 (Conexión central en tiempo real con Firestore y Auth).
*   **Framer Motion:** ^12.40.0 (Controlador de microinteracciones).
*   **Recharts:** ^3.8.1 (Métricas de ventas y comisiones).
*   **JsPDF & JsPDF Autotable:** Generación de facturas, cotizaciones y estados de paridad en cliente.

### 2.2. Variables de Estado (useState) en src/App.jsx
*   **Sesión:** `user` (perfil de Firebase Auth), `authLoading`, `authError`.
*   **Enrutamiento:** `activeTab` (pestaña activa de la interfaz), `theme` (light/dark persistido en LocalStorage).
*   **Telemetría y Data:** `allClientesControl` (instancias SaaS configuradas), `reports` (reportes de ventas y comisiones), `failures` (logs de incidentes en caliente), `isSimulated` (alterna entre base de datos real y mock local).
*   **Wizard de Aprovisionamiento:** `isOnboardingActive` (pantalla completa), `newClientName`, `targetPath`, `customPort`, `billingMode`, `logoFilename`, `logoBase64`, `seoDescription`, `seoKeywords`, `provisioningLogs` (logs SSE).
*   **Tokens de Diseño (Branding):** Colores HSL (`primaryColor`, `secondaryColor`, `bgColor`, etc.), `radiusMode`, `shadowStyle`, `glassmorphism`, `borderBeam`, `tilt3d`, y parámetros de partículas de fondo.

### 2.3. Efectos de Ciclo de Vida (useEffect)
*   **Tema Global:** Agrega o remueve la clase `.light` en el elemento raíz del HTML.
*   **Listener Auth & Firestore Central:** Configura 5 listeners en tiempo real al autenticarse: `reportesBilling`, `clientes_control`, `tokens`, `app_failures`, `wa_templates`.
*   **Visor de Código de Errores:** Llama a `/api/project/file` para cargar la línea de código exacta del crash de cliente.

### 2.4. Modales Globales en App.jsx
*   `isImportModalOpen`: Importación de manifiesto JSON para onboarding.
*   `isBriefingSelectModalOpen`: Carga de briefing desde Firestore.
*   `livePreviewComponent`: Drawer de previsualización lateral de componentes.
*   `activeRulesDiff`: Comparación diff línea por línea de reglas de Firebase locales vs Cloud.

### 2.5. Componentes Administrativos (src/components/admin/)
*   **BrandingEffectsPanel.jsx:** Modificación de tokens de diseño e HSL en caliente.
*   **BriefingStudioView.jsx:** Formulario interactivo del briefing de preventa con exportación en Markdown.
*   **CobrosPanel.jsx:** Conciliación de comisiones cobradas y marcadas como pagadas.
*   **ComisionesPanel.jsx:** Generador de gráficos de ingresos y exportación de reportes PDF.
*   **ComponentLibraryView.jsx:** Visor de biblioteca de 2 columnas con buscador Levenshtein tolerante a errores de escritura.
*   **ComponentSandbox.jsx:** Playground interactivo que carga sandboxes ESM de forma diferida mediante `import.meta.glob`.
*   **GitBackupPanel.jsx:** Interfaz del Drift Map, Auditor de Commits no pusheados y Enmendador seguro.
*   **SkillsRoadmapPanel.jsx:** Panel de control de roadmap con validador de consistencia documental y de sandboxes.

### 2.6. Detalle por Sección del Dashboard (activeTab)
*   **Dashboard General (`activeTab === 'dashboard'`):** KPIs, gráfico Recharts de ganancias, selector de periodos, exportador PDF y simulador de telemetría.
*   **CRM Clientes (`activeTab === 'crm'`):** Detalles de clientes, sub-paneles de reglas de seguridad Firebase y paridad de código, inicio/parada de servidores locales Vite y deploys locales en un clic.
*   **Onboarding (`activeTab === 'onboarding'`):** Formulario de aprovisionamiento de 11 pasos, generación de VAPID keys, logotipos autogenerados y logs SSE de creación del proyecto.
*   **Consola de Errores (`activeTab === 'errors'`):** Listado y filtros de la telemetría de fallos (`app_failures`) enlazado al visor de archivos de código en disco.

---

## 🔌 Sección 3 — Motor de Backend (Prototipe-CLI)

El Bridge local corre en el puerto 3001 y controla los subprocesos Git y el sistema de aprovisionamiento físico:

### 3.1. Ficha Técnica de Dependencias (package.json)
*   **Express & CORS:** Servidor API local.
*   **fs-extra:** Operaciones de archivos asíncronas con promesas.
*   **inquirer & picocolors:** Formulario guiado por terminal y estilos ANSI.
*   **firebase:** SDK de Node para reglas e índices de Cloud Storage.
*   **web-push & jimp:** Generación VAPID e íconos PWA en caliente.

### 3.2. Orquestación del Entorno (config.js y cli.js)
*   **config.js:** Inicializador de rutas de disco. Cuenta con un **Auto-Healer de Registro** que reescribe de forma automática las rutas en `plantillas_registro.json` si cambia la unidad de disco local.
*   **cli.js:** Asistente interactivo en consola para aprovisionamiento, inyectando paletas HSL mediante conversiones matemáticas `hexToHsl` y compensación de luminosidad.

### 3.3. Algoritmo de Sincronización Diferencial
*   **sync_templates.js (Core a CLI):** Copia cambios sanitizando credenciales de desarrollo. Ejecuta `auditarIntegridadHook` que detiene la sincronización si el hook del Core tiene fallas (como omisión de ping de telemetría en facturación $0, falta de protección contra bucles o mala conversión de timestamps).
*   **sync_clients.js (CLI a Cliente):** Sincroniza selectivamente excluyendo archivos de cliente (.env.local, firebase configs, index.html). Genera copias de respaldo en `.temp_backup_sync/` para realizar un rollback automático si el build de validación falla.

### 3.4. Aprovisionamiento y Marca Blanca (generator.js)
*   Calcula el ratio de contraste de colores para inyectar variables CSS AAA conformes en `index.css`.
*   Realiza el rewrite de `index.html` inyectando metadatos SEO y scripts de analíticas personalizados.
*   Genera el service worker, manifiestos PWA y logotipos SVG temporales con iniciales del cliente.

### 3.5. Catálogo de Endpoints de la API (server.js)
1.  `GET /api/niches`: Atributos y metadatos de las 23 verticales de negocio.
2.  `POST /api/niches`: Registra una nueva vertical en disco.
3.  `GET /api/templates`: Listado físico de plantillas en disco.
4.  `GET /api/cores`: Cores configurados en el Bridge.
5.  `POST /api/register-core`: Registra una plantilla Core y aprovisiona 12 archivos de documentación estándar.
6.  `POST /api/cores/:clave/activate`: Sincroniza Core, incrementa SemVer y marca como activa.
7.  `GET /api/cores/:clave/drift`: Mide consistencia de código e higieniza credenciales para evitar falsos drifts.
8.  `POST /api/create-project`: Inicializa worker de creación del proyecto.
9.  `GET /api/create-project/stream`: SSE Logs en vivo del proceso de creación (npm install, deploy inicial).
10. `POST /api/library/inject/stream`: SSE de inyección de componentes con rollback automático si falla el build.
11. `GET /api/library/inject/registry`: Valida integridad de componentes inyectados con hashes SHA256.
12. `POST /api/project/dev/start`: Levanta Vite local en un puerto dinámico determinista (rango 3100-3199).
13. `POST /api/e2e/run`: SSE logs en vivo de ejecución de Playwright con timeout de seguridad de 180s.
14. `POST /api/project/db/seed`: Sembrado inteligente Firestore desde la plantilla.
15. `GET /api/git/compare-drift`: Compara commits ahead/behind y detecta colisiones de archivos.
16. `POST /api/git/amend-commit`: Enmienda commits. Si no es HEAD, realiza rebases automáticos sin conflictos mediante `commit-tree`.

---

## 🛠️ Sección 4 — Manual de Operación de Scripts de Consola

A continuación se detalla el flujo de cada herramienta de automatización del ecosistema:

### 4.1. git_backup.ps1 (Engine de Respaldo Maestro)
*   **Propósito:** Snapshot físico y sincronización con GitHub para el repositorio maestro.
*   **Parámetros:** `$CommitMessage` (string), `$Push` (switch, default $true), `$AutoMerge` (switch).
*   **Flujo Paso a Paso:**
    1.  *Escaneo de Git Locales:* Busca directorios ocultos `.git` excluyendo la raíz.
    2.  *Ocultamiento Temporal:* Renombra carpetas `.git` internas a `.git-backup-temp` para evitar Git Links accidentales en el repositorio raíz.
    3.  *Auditoría de Seguridad:* Analiza status. Si hay archivos `.env` modificados, cancela el proceso para evitar fugas.
    4.  *Snapshot local:* Ejecuta `git commit -m "Auto-Snapshot [rama]"`.
    5.  *Sincronización:* Realiza pull preventivo, resuelve conflictos y ejecuta `git push -u origin [rama] --no-verify` preservando el upstream.
    6.  *Restauración:* Devuelve `.git-backup-temp` a `.git` y restaura la rama de trabajo develop.

### 4.2. subproject_backup.ps1 (Respaldo de Subproyectos)
*   **Propósito:** Sincronizar de forma aislada una carpeta de desarrollo específica con su respectiva rama remota.
*   **Flujo:** Renombra temporalmente `.git-backup-temp` a `.git`. Si es una instancia cliente, lee el remoto de su Core correspondiente e inyecta el mismo remoto en la instancia local, renombrándolo a `cliente/[projectName]` para su resguardo.

### 4.3. menu_backup.ps1 (Gestor Maestro Interactivo)
*   **Propósito:** Consola interactiva PowerShell para gestionar backups del monorepo.
*   **Flujo:** Escanea y recupera carpetas dañadas en el arranque, cuenta cambios locales de forma silenciosa usando `--git-dir`, y muestra una UI en terminal con navegación por teclado físico (flechas y Enter).

### 4.4. verify_library_integrity.cjs (Validador de Storybook y Consistencia)
*   **Propósito:** Asegurar la consistencia técnica de la biblioteca y playgrounds antes de compilar.
*   **Flujo de Verificaciones:**
    *   Verifica que cada componente tenga su archivo Markdown en el catálogo y su registro en `ComponentSandbox.jsx`.
    *   Valida el manifiesto JSON exigiendo targetPath con arquitectura desacoplada.
    *   Falla ante selectores nativos, anchos fijos en px, colores hexadecimales fijos, o rutas absolutas locales en los archivos de código o playgrounds.
    *   Sincroniza en tres vías las habilidades de IA de `.agents/skills` con `04_Estandares_y_Skills` usando checksums SHA-256 de control.

---

## 📄 Sección 5 — Inventario y Auditoría de la Documentación Completa

Análisis de la carpeta temática `D:\PROTOTIPE\Documentacion PROTOTIPE\`:

### 5.1. Carpeta 01: Control de Versiones
*   **arquitectura_git.md:** Define políticas de ramas y backups upstream. (Consistente).
*   **changelog_general.md:** Hitos de lanzamientos SemVer. (Consistente).

### 5.2. Carpeta 02: Tareas y Roadmap
*   **control_creacion_componentes.md:** Checklist de cobertura de componentes por vertical. (Consistente).
*   **plan_extraccion_componentes.md:** Desacoplamiento de componentes de la App Ventas a la biblioteca. (Consistente).
*   **tareas_pendientes.md:** Roadmap del Sprint con control de IDs por dominio. (Consistente).

### 5.3. Carpeta 03: Auditorías y Faro Core
*   **auditoria_cli_server_2026.md:** Parches de seguridad de inyección y directory traversal. (Consistente).
*   **auditoria_estabilizacion_git_2026.md:** Certificación final del upstream tracking. (Consistente).
*   **auditoria_ecosistema_actual.md:** Inventario obligatorio antes de crear nuevas utilidades. (Consistente).
*   **registro_errores_bugs.md:** Bug log del ecosistema para evitar regresiones. (Consistente).
*   **reporte_auditoria_biblioteca_completa.md:** Lista targetPaths y estilos obsoletos en las fichas del catálogo. (Consistente).

### 5.4. Carpeta 04: Estándares y Skills
*   **Firebase_Listeners_Clean.md:** Buenas prácticas de manejo de subscripciones Firebase. (Consistente).
*   **estandar_disenio_premium.md:** Pautas de color HSL y microinteracciones. (Consistente).
*   **estandar_arquitectura_limpia_react_firebase.md:** Estructura de 3 capas para desacoplar el frontend del SDK de Firebase. (Consistente).
*   **mapa_aplicacion.md / mapa_documentacion_ia.md:** Índices de código y GPS semántico de documentación. (Consistente).

### 5.5. Carpeta 05: Estrategia Comercial
*   **matriz_precios_oficial.md:** Parámetros de cotización. (Consistente).
*   **manejo_objeciones_cierre_ventas.md:** Disparador de la skill `objection-handler`. (Consistente).

### 5.6. Carpeta 07: Manuales de Desarrollo
*   **manual_credits_and_balances.md:** Transacciones de abonos y saldos de créditos. (Consistente).
*   **manual_generacion_pdf.md:** Renderización vectorial de balances y rotación de stock. (Consistente).
*   **manual_prototipe_cli.md:** Arquitectura interna del CLI, Bridge y aprovisionador. (Consistente).
*   **manual_efectos_premium.md:** Fórmulas de inclinación 3D, proximity glows y optimización GPU. (Consistente).

---

## 🏗️ Sección 6 — Arquitectura de la App Ventas (Plantilla Core)

El análisis del núcleo de la aplicación cliente revela la siguiente arquitectura física y lógica:

### 6.1. package.json y Construcción (Vite 6)
*   **React 19 & Firebase SDK v12:** Configuración avanzada de runtime.
*   **Zustand:** Gestión de estado de UI y sesión del portal.
*   **Dexie (IndexedDB):** Base de datos local para telemetría offline y colas de sincronización asíncrona.
*   **Vite 6 Optimization:** Fragmentación de Rollup para separar librerías (Firebase, Zustand, Dexie) en chunks independientes. Se excluye jsPDF del bundle inicial para realizar *lazy loading* dinámico únicamente al exportar reportes.

### 6.2. Componentes UI y Comunes
*   **CustomSelect.jsx:** Selector responsivo con animaciones Framer Motion y overlay transparente para clics externos.
*   **AlertConfirmContext.jsx:** Modal de confirmación promesificada de eliminación que permite invocaciones imperativas desde scripts puros JS sin contexto de React.
*   **NumberInput & CurrencyInput:** Inputs con formateo en tiempo de ejecución, sanitización de caracteres no numéricos y soporte de miles colombianos (`$ 12.000`).

### 6.3. Arquitectura de Dominio (3 Capas)
*   **UI/Vista:** Consume hooks de negocio, desacoplada por completo del SDK de Firebase.
*   **Capa de Estado (Hooks & Stores):** Orquestación de red mediante TanStack Query y sincronización en tiempo real abriendo un único listener `onSnapshot` mapeado en la caché del QueryClient para evitar cobros de lectura redundantes.
*   **Capa de Servicios (Infraestructura):** Conectores físicos al SDK de Firebase y transacciones atómicas (`runTransaction`) para descontar stock e inventario en una única llamada de base de datos.
*   **Telemetría Offline:** Cola local de Dexie que transmite errores acumulados con políticas de backoff exponencial y reintentos automáticos al recuperar conexión (`online`).

### 6.4. Reglas e Índices de Firestore
*   **affectedKeys:** Validación estricta que deniega cambios en el catálogo de productos a los clientes de la PWA, excepto para descontar stock e incrementar ventas.
*   **isAdmin():** Validación robusta cruzando perfiles de usuario.
*   **Índices Compuestos:** Optimización de queries complejas para las colecciones de `orders`, `credits` y `notifications` (RT updates).

---

## 📊 Sección 7 — Tabla Cruzada de Botones e Interacciones

| Sección | Botón/Acción | Archivo/Componente | Función/API que llama | Comportamiento Esperado | Observación Técnica |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Dashboard | Test Telemetría | App.jsx | `handleCreateTestReport` | Inserta telemetría ficticia en Firestore central | Valida el visor en caliente de errores |
| Dashboard | Conciliación PDF | App.jsx | `exportConsolidatedReconciliationPDF` | Descarga estado mensual de cobros y saldos | Vectorial de jsPDF en el cliente |
| CRM Clientes | Sincronización Global | App.jsx | `handleGlobalSyncSafeFiles` | Copia archivos del core a todas las instancias locales | Llama a `POST /api/project/sync-files` |
| CRM Clientes | Desplegar en Local | App.jsx | `/api/project/dev/start` | Levanta servidor Vite en puerto dinámico (3100-3199) | Puerto determinista por hash del cliente |
| Onboarding | Importar Manifiesto | App.jsx | `isImportModalOpen` | Abre modal para pegar manifiesto JSON | Evita el rellenado manual de credenciales |
| Onboarding | Generar AAA | App.jsx | `shiftHslLightness` | Genera colores legibles conformes a contraste | Ajusta la accesibilidad web en caliente |
| Onboarding | Iniciar Onboarding | App.jsx | `/api/create-project` | Inicia worker Express y canal SSE de logs | Transmite logs mediante Server-Sent Events |
| Biblioteca | Sandbox Scaffolder | ComponentSandbox.jsx | `/api/library/sandbox/scaffold` | Crea archivo Sandbox React en la carpeta admin | Evita la creación manual de playgrounds |
| Consola Errores | Diagnosticar | App.jsx | `/api/project/file` | Abre el visor de código con la línea del crash | Lee los archivos físicos del cliente local |
| Git | Enmendar Commit | GitBackupPanel.jsx | `/api/git/amend-commit` | Re-escribe commits no pusheados sin conflictos | Llama a `commit-tree` y `rebase` automático |
| Roadmap | Sincronizar Reglas | SkillsRoadmapPanel.jsx | `/api/git/sync-rules` | Propaga GEMINI.md/AGENTS.md en lote | Sincroniza mediante scripts del CLI |

---

## ⚠️ Sección 8 — Registro de Deuda Técnica y Vulnerabilidades

### 1. Inyección de Path Traversal en Endpoints del CLI (Severidad: Alta)
*   **Ubicación:** [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js)
*   **Causa Raíz:** Lectura directa de archivos locales en base a parámetros query de la petición HTTP.
*   **Mitigación:** Inyectar validación estricta utilizando la función `isPathContained(GIT_ROOT, targetPath)` en todos los endpoints de manipulación de archivos.

### 2. Bloqueo de Git en Caliente por Vite en Windows (Severidad: Media)
*   **Ubicación:** Scripts de backup y sincronizadores locales.
*   **Causa Raíz:** Bloqueos de descriptores de archivos de node_modules y caches por el HMR de Vite en terminales Windows.
*   **Mitigación:** Aplicar reintentos con delays de 400ms en el renombrado de carpetas y detener servidores Vite antes de fusionar.

### 3. Fuga de Credenciales y Env Leak (Severidad: Alta)
*   **Ubicación:** [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1)
*   **Causa Raíz:** Subidas accidentales de archivos de variables locales `.env` a GitHub.
*   **Mitigación:** Escaneo estricto de `git status --porcelain` abortando el push si detecta archivos de variables de entorno en staging.
