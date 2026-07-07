# 🗺️ DIAGRAMA DE FLUJO GENERAL Y ARQUITECTURA DEL ECOSISTEMA PROTOTIPE

Este documento presenta la interconexión técnica y flujo de datos de todos los componentes mapeados y documentados en el Ecosistema PROTOTIPE (excluyendo la lógica específica de negocio de las aplicaciones cliente).

```mermaid
flowchart TB
    %% Estilos de Nodos
    classDef script fill:#1e1b4b,stroke:#818cf8,stroke-width:1px,color:#e0e7ff;
    classDef cli fill:#0f172a,stroke:#38bdf8,stroke-width:1px,color:#f0f9ff;
    classDef ui fill:#1e293b,stroke:#a78bfa,stroke-width:1px,color:#f5f3ff;
    classDef db fill:#14532d,stroke:#34d399,stroke-width:1px,color:#ecfdf5;
    classDef folder fill:#581c87,stroke:#c084fc,stroke-width:1px,color:#faf5ff;

    %% 📂 CARPETAS FÍSICAS (Windows)
    subgraph Carpetas ["📁 Carpetas y Disco Físico (Windows D:/PROTOTIPE)"]
        FCores["📂 Plantillas Core<br>(App Ventas, etc.)"]:::folder
        FInstancias["📂 Instancias Clientes<br>(Shards de marcas)"]:::folder
        FDocs["📂 Documentacion PROTOTIPE<br>(Roadmaps, Estándares, Diccionario)"]:::folder
    end

    %% 💻 SCRIPTS DE SOPORTE (Raíz)
    subgraph ScriptsRaiz ["💻 Scripts de Soporte y Backup"]
        SBackupBat["backup.bat<br>(Entrada Windows)"]:::script
        SMenuBackup["menu_backup.ps1<br>(Menú interactivo)"]:::script
        SGitBackup["git_backup.ps1<br>(Snapshot maestro)"]:::script
        SSubprojectBackup["subproject_backup.ps1<br>(Snapshot individual)"]:::script
        
        SBackupBat -->|Ejecuta bypass| SMenuBackup
        SMenuBackup -->|Orquesta| SGitBackup
        SMenuBackup -->|Orquesta| SSubprojectBackup
    end

    %% ⚙️ MOTOR CLI (Prototipe-CLI)
    subgraph MotorCLI ["⚙️ Motor CLI & API Bridge (Puerto 3001)"]
        CLServer["server.js<br>(Express Server & SSE Streams)"]:::cli
        CLGenerator["generator.js<br>(Aprovisionador Físico)"]:::cli
        CLWorker["worker_create_project.js<br>(Subproceso de Aprovisionamiento)"]:::cli
        CLSyncTemplates["sync_templates.js<br>(Sincronizador Universal)"]:::cli
        CLSyncClients["sync_clients.js<br>(Downstream Patching)"]:::cli
        CLTestTemplates["test_templates.js<br>(Certificación de Compilación)"]:::cli
        CLConfig["config.js<br>(Rutas y Esquemas)"]:::cli
        CLLogger["logger.js<br>(cli_bridge.log)"]:::cli
        
        CLServer -->|Invoca IPC Fork| CLWorker
        CLWorker -->|Consume| CLGenerator
        CLServer -->|Invoca| CLSyncTemplates
        CLServer -->|Invoca| CLSyncClients
        CLSyncClients -->|Rollback temporal| CLWorker
        CLSyncTemplates -->|Valida| CLTestTemplates
        CLGenerator -->|Genera| FInstancias
        CLSyncClients -->|Parche diferencial| FInstancias
    end

    %% 📊 CONSOLA CENTRAL (dev-dashboard React UI)
    subgraph DashboardUI ["📊 Consola de Administración (dev-dashboard)"]
        AppJSX["App.jsx<br>(Monolito Central)"]:::ui
        
        %% Componentes de Admin
        CCard["CoreCard.jsx<br>(Deploy individual / Fixes)"]:::ui
        CManager["CoreManagerPanel.jsx<br>(Gestión Plantillas)"]:::ui
        CSync["CoreSyncPanel.jsx<br>(Sync & Deploy SSE en Lote)"]:::ui
        CE2E["E2EPanel.jsx<br>(Tests Playwright SSE)"]:::ui
        CGit["GitBackupPanel.jsx<br>(Control Versiones SSE)"]:::ui
        CLibrary["ComponentLibraryView.jsx<br>(Catálogo de Componentes)"]:::ui
        CSandbox["ComponentSandbox.jsx<br>(Playgrounds dinámicos)"]:::ui
        CRecaudo["RecaudoPanel.jsx<br>(Cartera & WhatsApp Alerts)"]:::ui
        CCobros["CobrosPanel.jsx<br>(Cobros & Reversiones Drawers)"]:::ui
        CHealth["HealthRadar.jsx<br>(Live Sonar Monitor)"]:::ui
        
        %% Hooks y Servicios
        HPdf["pdfService.js<br>(Generador PDFs)"]:::ui
        HToast["useToast.js"]:::ui
        HClipboard["useCopyToClipboard.js"]:::ui

        AppJSX --> CManager
        AppJSX --> CSync
        AppJSX --> CE2E
        AppJSX --> CGit
        AppJSX --> CLibrary
        AppJSX --> CSandbox
        AppJSX --> CRecaudo
        AppJSX --> CCobros
        AppJSX --> CHealth
        CManager --> CCard
        
        AppJSX --> HPdf
        AppJSX --> HToast
        AppJSX --> HClipboard
    end

    %% ☁️ SERVICIOS EXTERNOS & APIS
    subgraph ServiciosExternos ["☁️ Conexiones y APIs Externas"]
        FirebaseCentral["🔥 Firebase Central (Control SaaS)<br>· Auth (Desarrollador)<br>· Firestore (Telemetría / Comisiones)<br>· Hosting (Publicación)"]:::db
        GitHub["🐈 GitHub Remoto<br>(Origin / Branches)"]:::db
        PlaywrightTech["🎭 Playwright Headless<br>(Smoke Tests)"]:::db
        GeminiAPI["🧠 Gemini 2.5 Flash API<br>(Personalización de Requisitos)"]:::db
    end

    %% Conexiones Cruzadas de Datos
    AppJSX <-->|Autenticación y Pings| FirebaseCentral
    AppJSX <-->|API REST / EventSource SSE| CLServer
    CSync <-->|Streaming de compilación/despliegue| CLServer
    CGit <-->|Streaming de snapshots Git| CLServer
    CE2E <-->|Streaming de logs de testing| CLServer
    CLGenerator <-->|REST API Register / SDK config| FirebaseCentral
    CLGenerator <-->|Jimp Logo Resize| FInstancias
    CLWorker <-->|smoke tests headles| PlaywrightTech
    CLServer <-->|Auto-detección y Web Apps| FirebaseCentral
    CLServer <-->|Análisis cognitivo de briefing| GeminiAPI
    CLServer <-->|Git CLI operations| GitHub
    SSubprojectBackup & SGitBackup <-->|Push de snapshots| GitHub
    CCard -->|Firebase Hosting deploy| FirebaseCentral
    CSync -->|Firebase Hosting deploy batch| FirebaseCentral

    %% Flujos físicos
    SSubprojectBackup -->|Lee/escribe| FInstancias
    SGitBackup -->|Respalda maestro| Carpetas
    FDocs -->|Guarda informes y logs| FDocs
```

---

## 🔀 Secuencias Operativas Clave del Ecosistema

### 1. Flujo de Aprovisionamiento de Clientes (Bootstrap)
1. El usuario interactúa con el Wizard de Creación en [`App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx).
2. Sube el logo comercial, el cual es procesado y optimizado por el servidor [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) vía Jimp y guardado físicamente.
3. El desarrollador ingresa las credenciales de Firebase. Se llama a `/api/firebase/validate` para certificar la clave en caliente.
4. Se pulsa "Crear Proyecto", lo cual dispara una petición POST a `/api/create-project`.
5. El servidor Express levanta un subproceso asíncrono (`child_process.fork`) de [`worker_create_project.js`](file:///d:/PROTOTIPE/Prototipe-CLI/worker_create_project.js).
6. El worker ejecuta [`generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js), el cual clona el Core Seed en [`Instancias Clientes`](file:///d:/PROTOTIPE/Instancias%20Clientes), inyecta los colores HSL en `src/index.css`, actualiza los metadatos de nicho, PWA y SEO e inicializa 12 archivos obligatorios de documentación local.
7. El worker ejecuta la suite de Smoke Tests locales (`Playwright`) en un servidor Vite temporal para certificar que el bundle no arroja excepciones de React.
8. Una vez certificado, registra la telemetría en Firestore Central de Control y retorna el token único.

### 2. Flujo de Sincronización Downstream (Core → Clientes)
1. [`CoreSyncPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) consulta las instancias instaladas en el disco local y las contrasta contra sus plantillas Core.
2. El usuario selecciona los clientes a parchar e inicia la sincronización.
3. Se conecta al canal SSE `/api/instancias/sync-and-deploy-stream`.
4. El servidor Express realiza backups temporales preventivos de los archivos modificados.
5. Copia físicamente las actualizaciones del core a las instancias de clientes respetando sus archivos locales de identidad de marca (.env, logos, etc.) usando [`sync_clients.js`](file:///d:/PROTOTIPE/Prototipe-CLI/sync_clients.js).
6. Ejecuta `npm run build` local en cada instancia. Si el build falla, realiza un rollback automático restaurando el backup temporal. Si tiene éxito, actualiza `.prototipe.json` y ejecuta el deploy automático a Firebase Hosting.

### 3. Flujo de Snapshot Seguro y Respaldo Git
1. El programador interactúa con [`GitBackupPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx).
2. Se consulta `/api/git/status` para auditar el repositorio local seleccionado. El servidor bloquea el avance si se detectan archivos `.env` expuestos (fugas de credenciales).
3. El usuario escribe o autogenera el mensaje de commit e inicia el backup vía `/api/git/backup-stream`.
4. El servidor mata consolas de desarrollo Vite activas para liberar archivos, renombra temporalmente repositorios `.git` anidados a `.git-backup-temp` para no generar gitlinks huérfanos, y corre `git add .` y `git commit` inyectando `--no-verify` en el push para evitar bloqueos de tests Playwright durante el respaldo.
5. Al finalizar con éxito, se restablece el estado de los repositorios y consolas y se guarda la trazabilidad en Firestore Central.
