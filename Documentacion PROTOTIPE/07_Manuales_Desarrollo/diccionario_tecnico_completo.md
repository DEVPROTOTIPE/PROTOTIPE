# 📖 DICCIONARIO TÉCNICO COMPLETO — ECOSISTEMA PROTOTIPE
> **Fecha:** 2026-06-23  
> **Alcance:** Mapeo al 100% de la lógica de `D:\PROTOTIPE` (excluyendo 'app ventas core' y 'clientes moni').  
> **Nivel de detalle:** Granularidad estricta (Flujos de usuario, lógica de funciones y conexiones).

---

## 📂 PARTE 1 — SCRIPTS DE LA RAÍZ DEL PROYECTO (`D:\PROTOTIPE\`)

### 1.1 [backup.bat](file:///d:/PROTOTIPE/backup.bat)
*   **Propósito:** Punto de entrada ejecutable en Windows para abrir de forma rápida el menú de respaldos.
*   **Flujo de Usuario/Acciones:** Al hacer doble clic en el archivo, se configura la consola en UTF-8 y se dispara la ejecución de `menu_backup.ps1` con permisos de bypass. Si el script de PowerShell falla, el script bat captura el error y detiene la terminal mostrando el mensaje "[ERROR] Hubo un problema al ejecutar el script de PowerShell." y esperando a que el usuario presione cualquier tecla para cerrarse (`pause`).
*   **Lógica de Funciones:** No posee funciones lógicas internas, es un script secuencial de lotes (`cmd`).
*   **Conexiones:** Ninguna.

### 1.2 [menu_backup.ps1](file:///d:/PROTOTIPE/menu_backup.ps1)
*   **Propósito:** Interfaz de usuario interactiva por terminal para seleccionar qué módulo o repositorio respaldar y empujar a GitHub.
*   **Flujo de Usuario/Acciones:**
    *   **Navegación:** Permite presionar las teclas de flecha ARRIBA y ABAJO para cambiar el elemento seleccionado del menú (resaltado con color cian y el prefijo `>`).
    *   **Selección:** Al presionar ENTER en una opción, dispara la función respectiva del menú.
    *   **Salida:** Presionar la tecla `Q` o `ESC` aborta el menú interactivo y cierra el script.
    *   **Inicialización Remota:** Si el usuario selecciona un subproyecto/instancia que no posee Git, le pregunta interactivamente `¿Desea inicializarlo ahora? (S/N)`. Si responde "S", le pregunta `¿Desea asociar un repositorio remoto de GitHub (origin) ahora? (S/N)`. Si acepta, solicita la URL y ejecuta los comandos correspondientes.
*   **Lógica de Funciones:**
    1.  `Test-IsGitRepository`:
        *   *Parámetros:* `$Path` (string - ruta absoluta).
        *   *Qué hace:* Comprueba si existe la carpeta `.git` o `.git-backup-temp` en la ruta especificada. Si no, navega con `Set-Location` temporalmente y corre `git rev-parse --git-dir` silenciando errores para validar si la carpeta forma parte de un subdirectorio Git existente.
        *   *Retorna:* Booleano (`$true` o `$false`).
    2.  `Get-GitChangesCount`:
        *   *Parámetros:* `$Path` (string - ruta absoluta).
        *   *Qué hace:* Valida si es un repositorio Git válido. Si es así, ejecuta de forma no destructiva en consola: `git --git-dir="..." --work-tree="..." status --porcelain`. Cuenta cuántas líneas de cambios pendientes de commit se reportan.
        *   *Retorna:* Entero (número de cambios, o `-1` si no es repositorio Git).
    3.  `Show-Header`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Limpia la consola y dibuja la cabecera visual azul del Ecosistema.
        *   *Retorna:* Nada (imprime en pantalla).
    4.  `Get-MenuSelection`:
        *   *Parámetros:* `$Title` (string - título del panel), `$Options` (array de strings - opciones del menú).
        *   *Qué hace:* Oculta el cursor físico en la terminal de Windows mediante secuencias de escape ANSI (`$([char]27)[?25l`). Entra en un bucle infinito que captura la entrada física del teclado (`$Host.UI.RawUI.ReadKey`). Si el código de tecla es 38 (Arriba) o 40 (Abajo), decrementa o incrementa el índice activo y vuelve a dibujar el menú. Si es 13 (Enter), retorna el índice. Si es 81 o 27 (Q / ESC), retorna `-1`. En el bloque `finally`, restaura la visibilidad del cursor.
        *   *Retorna:* Entero (índice seleccionado o `-1`).
    5.  `Run-Master-Backup`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Invoca el script `git_backup.ps1` en modo interactivo.
        *   *Retorna:* Nada.
    6.  `Run-Subproject-Backup`:
        *   *Parámetros:* `$Path` (string - ruta del subproyecto).
        *   *Qué hace:* Invoca `subproject_backup.ps1` pasándole la ruta del subproyecto en modo interactivo.
        *   *Retorna:* Nada.
    7.  `Manage-Cores` / `Manage-Instances`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Escanea las subcarpetas de plantillas core (`D:\PROTOTIPE\Plantillas Core`) o instancias (`D:\PROTOTIPE\Instancias Clientes`), calcula de forma asíncrona sus cambios locales de Git con `Get-GitChangesCount` para mostrarlos en el menú, y ejecuta la inicialización de Git o el backup del proyecto seleccionado.
        *   *Retorna:* Nada.
*   **Conexiones:**
    *   Llama al CLI local de `git`.
    *   Ejecuta mediante subprocesos los scripts `git_backup.ps1` y `subproject_backup.ps1`.

### 1.3 [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1)
*   **Propósito:** Motor orquestador encargado de realizar snapshots Git locales y remotos (GitHub) de todo el ecosistema maestro.
*   **Flujo de Usuario/Acciones (Modo Interactivo):**
    *   Si no se puede acceder a internet (fallo al conectar a GitHub), le pregunta al usuario: `¿Desea realizar un respaldo local (Commit local en tu disco) únicamente? (S/N): `. Si responde que no, revierte el commit local (`git reset --soft HEAD~1`) para proteger el estado de la rama.
    *   Si el commit se hace sobre una rama de desarrollo (diferente de main/master), le pregunta: `¿Desea fusionar y subir estos cambios también a la rama de producción 'main'? (S/N): `. Si acepta, ejecuta el auto-merge en caliente.
*   **Lógica de Funciones:**
    1.  `Write-BackupLog`:
        *   *Parámetros:* `$Status` (string - SUCCESS/FAILED/WARN), `$Target` (string - nombre de la carpeta), `$Message` (string - descripción).
        *   *Qué hace:* Añade una línea codificada en UTF-8 en `backup.log` con el timestamp exacto del sistema.
        *   *Retorna:* Nada.
    2.  `Format-CommitMessageList`:
        *   *Parámetros:* `$files` (array de strings - lista de archivos).
        *   *Qué hace:* Si hay 5 o menos archivos, los concatena separados por comas. Si hay más, toma los primeros 3 y añade `(y N mas)` para mantener el commit limpio.
        *   *Retorna:* String formateado.
*   **Lógica Secuencial (Algoritmo Clave):**
    1.  **Detección de Servidores Dev:** Busca procesos de Node activos (`npm run dev`/`vite`) y los mata con `Stop-Process` para evitar bloqueos del sistema de archivos al renombrar carpetas de Git.
    2.  **Ocultación de Repositorios Hijos:** Escanea repositorios `.git` anidados y los renombra recursivamente a `.git-backup-temp`. Esto evita que Git los detecte como submódulos vacíos (gitlinks) en el repositorio raíz.
    3.  **Detección de Fugas (Leak Checking):** Analiza el output de `git status --porcelain` para verificar si algún archivo `.env` está en cola para agregarse, deteniendo la ejecución antes de correr `git add .` en caso de peligro.
    4.  **Sincronización Remota:** Valida con `git ls-remote` si el repositorio de GitHub está en línea. Si es así, realiza un `git pull origin [rama] --no-edit` preventivo. Si se detectan conflictos, ejecuta rollback del commit local (`git reset --soft HEAD~1`) y aborta.
    5.  **Auto-Merge:** Si está activo, cambia a `main` (`git checkout main`), hace pull, ejecuta `git merge [rama]`, hace push de producción, y regresa de forma segura a la rama original.
    6.  **Bloque finally:** Restaura todas las carpetas `.git-backup-temp` a `.git` y relanza en segundo plano las consolas de Vite que fueron detenidas al principio.
*   **Conexiones:**
    *   Ejecuta llamadas al CLI de `git`.
    *   Escribe datos físicos en el archivo local [`D:\PROTOTIPE\backup.log`](file:///d:/PROTOTIPE/backup.log).

### 1.4 [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1)
*   **Propósito:** Motor de respaldo individualizado para un subproyecto o instancia cliente.
*   **Lógica Secuencial (Algoritmo Clave):**
    *   *Auto-Vínculo Remoto de Clientes:* Si detecta que el subproyecto está bajo `Instancias Clientes/`, extrae el nicho del directorio padre (ej: `ventas`), busca la plantilla Core correspondiente en `Plantillas Core/App Ventas`, lee su remote origin en Git, y se lo inyecta como `origin` de la instancia. Además, si la rama activa no coincide, renombra y fuerza la rama local a la convención estándar `cliente/[nombre-proyecto]`.
    *   Mismo flujo de detección de fugas de variables de entorno `.env` (excluyendo estado `D`), renombrado temporal de repositorios, rollback seguro y push con `--no-verify`.
*   **Conexiones:**
    *   Llamadas al CLI local de `git`.
    *   Llama al CLI remoto de GitHub.

---

## 📂 PARTE 2 — ARCHIVOS DEL MOTOR CLI (`D:\PROTOTIPE\Prototipe-CLI\`)

### 2.1 [config.js](file:///d:/PROTOTIPE/Prototipe-CLI/config.js)
*   **Propósito:** Carga del entorno de desarrollo y centralización de rutas de carpetas físicas para garantizar sharding y portabilidad en discos.
*   **Flujo de Trabajo:** Lee sincrónicamente el archivo `.env` del CLI (separando claves/valores con expresiones regulares y sanitizando comillas), inyecta los resultados en `process.env` y exporta métodos para ubicar plantillas, registros y directorios de salida.
*   **Lógica de Funciones:**
    1.  `getWorkspaceRoot`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Retorna el workspace root desde `process.env.PROTOTIPE_WORKSPACE_ROOT` o `process.env.APPLICATIONS_DIR`. Posee un fallback estático a la ruta de Windows: `'D:\PROTOTIPE\Instancias Clientes'`.
        *   *Retorna:* String (ruta absoluta).
    2.  `getDocumentationRoot`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Retorna la ruta física del repositorio de documentación del proyecto.
        *   *Retorna:* String (ruta de la documentación).
    3.  `getTemplatesDir` / `getRegistroPath`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Resuelven las rutas absolutas a la carpeta `/templates/` y al archivo `plantillas_registro.json`.
        *   *Retorna:* String.
    4.  `getInstancePath`:
        *   *Parámetros:* `$coreType` (string - tipo de vertical/nicho), `$projectName` (string - nombre de la instancia).
        *   *Qué hace:* Resuelve la ruta destino estructurada para el sharding físico. Si se pasa un `coreType`, anida el proyecto bajo la carpeta correspondiente de su Core (ej: `/Instancias Clientes/ventas/App-Husky`), de lo contrario lo guarda en la raíz de instancias.
        *   *Retorna:* String (ruta física final).
    5.  `validateRegistroSchema`:
        *   *Parámetros:* `$registro` (objeto JSON).
        *   *Qué hace:* Validador estricto del archivo de base de datos de plantillas. Verifica la presencia de la clave principal `"plantillas"`. Recorre las sub-claves validando la existencia e integridad del tipo de datos para: `fuente` (string), `destino` (string), `nicho` (string), `activo` (booleano), `version` (SemVer válido `^\d+\.\d+\.\d+$`) y `coreType` (string).
        *   *Retorna:* Array de strings conteniendo los errores sintácticos de la validación (vacío si cumple).
*   **Conexiones:** Ninguna.

### 2.2 [logger.js](file:///d:/PROTOTIPE/Prototipe-CLI/logger.js)
*   **Propósito:** Interceptador de salida estándar de logs.
*   **Flujo de Trabajo:** Al invocar los logs, genera un timestamp ISO, formatea el mensaje y lo escribe en el log local `cli_bridge.log` de forma síncrona. Posteriormente imprime el mensaje en consola aplicando colores (picocolors) e íconos de estado.
*   **Lógica de Funciones:**
    *   `logMessage`:
        *   *Parámetros:* `$category` (INFO/SUCCESS/WARNING/ERROR), `$message` (string).
        *   *Qué hace:* Abre, escribe (`appendFileSync`) y guarda en [`D:\PROTOTIPE\Prototipe-CLI\cli_bridge.log`](file:///d:/PROTOTIPE/Prototipe-CLI/cli_bridge.log) el log en formato plano. Imprime en consola según la categoría: color verde con check `✓` para `SUCCESS`, amarillo con `⚠️` para `WARNING`, rojo con `❌` para `ERROR`, y cian con `i` para `INFO`.
        *   *Retorna:* Nada.
*   **Conexiones:** Escribe datos físicos en `cli_bridge.log`.

### 2.3 [cli.js](file:///d:/PROTOTIPE/Prototipe-CLI/cli.js)
*   **Propósito:** Interfaz de línea de comandos (CLI) interactiva para el bootstrap manual de clientes.
*   **Flujo de Usuario/Wizard interactivo:**
    1.  Pregunta el Core/plantilla a usar (choices leídas recursivamente de `templates`).
    2.  Pide el nombre comercial de la marca (`projectName`).
    3.  Pide la ruta de destino (sugiere automáticamente una ruta estructurada de sharding usando `getInstancePath`).
    4.  Pide la paleta de color (emerald, ruby, violet, amber, HEX personalizado o HSL manual).
    5.  Si es HEX, pide el código de color y calcula la conversión. Si es HSL, pide el primario y acento de forma manual.
    6.  Pide las variables de Firebase (.env.local) del cliente: API Key, Auth Domain, Project ID, Storage Bucket y App ID.
    7.  Pide las credenciales de Firebase del Dashboard Central.
    8.  Pregunta si desea desplegar reglas/índices en este paso y si desea sembrar datos iniciales (`seed_brand.js`).
    9.  Llama al generator e imprime en pantalla el token generado y el checklist final.
*   **Lógica de Funciones:**
    1.  `hexToHsl`:
        *   *Parámetros:* `$hex` (string - ej: `#7c4dff`).
        *   *Qué hace:* Sanitiza quitando `#`, calcula los componentes de color RGB (red, green, blue) mapeándolos en escala de 0 a 1. Encuentra el máximo y mínimo de los canales, calcula la luminosidad (L), la saturación (S) y el matiz (H) con desfases trigonométricos.
        *   *Retorna:* String formateado como `hsl(H, S%, L%)`.
    2.  `shiftHslLightness`:
        *   *Parámetros:* `$hslStr` (string - ej: `hsl(210, 100%, 50%)`), `$amount` (entero - ej: `-10`).
        *   *Qué hace:* Parsea la cadena HSL con expresiones regulares, extrae los componentes numéricos, le suma o resta el `$amount` a la luminosidad limitándolo entre 0% y 100%, y reconstruye el string.
        *   *Retorna:* String HSL modificado.
    3.  `main`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Dispara el flujo secuencial interactivo con `inquirer.prompt`. Si el usuario selecciona paleta HEX, la convierte llamando a `hexToHsl` y calcula el color de acento restando 10% de luminosidad con `shiftHslLightness`. Posteriormente llama a `createProject(answers)` de `generator.js`.
        *   *Retorna:* Nada.
### 2.4 [worker_create_project.js](file:///d:/PROTOTIPE/Prototipe-CLI/worker_create_project.js)
*   **Propósito:** Proceso secundario (`child_process.fork`) asíncrono e independiente que corre las tareas de compilación, testing y deploys de aprovisionamiento de un cliente sin bloquear el event loop principal de la API.
*   **Flujo de Datos (IPC):**
    *   Al iniciarse, notifica al padre: `process.send({ type: 'READY' })`.
    *   Escucha el mensaje `process.on('message', ...)` de tipo `START`.
    *   Intercepta de forma global los métodos `console.log` y `console.error` para capturar la salida en texto y transmitirla de forma transparente a través de IPC: `process.send({ type: 'LOG', line: text })`.
    *   Si finaliza con éxito, devuelve `process.send({ type: 'SUCCESS', data: result })` y se cierra con `process.exit(0)`.
    *   Si falla, devuelve `process.send({ type: 'ERROR', message: error })` y se cierra.
*   **Lógica de Funciones:**
    1.  `killProcessTree`:
        *   *Parámetros:* `$pid` (entero - id del proceso).
        *   *Qué hace:* Ejecuta el comando de Windows: `taskkill /PID [pid] /T /F` para asegurar la eliminación recursiva y forzada de subprocesos huérfanos de Node.
        *   *Retorna:* Promesa.
    2.  `waitPort`:
        *   *Parámetros:* `$port` (entero), `$timeoutMs` (entero).
        *   *Qué hace:* Bucle asíncrono con `setInterval` (cada 500ms). Dispara peticiones `fetch` contra `http://localhost:[port]` hasta recibir un estado HTTP menor a 500 (lo que confirma que Vite arrancó con éxito). Si supera el timeout, aborta lanzando una excepción.
        *   *Retorna:* Promesa.
    3.  `runSmokeTest`:
        *   *Parámetros:* `$targetDir` (string - ruta absoluta del proyecto generado).
        *   *Qué hace:* Algoritmo de certificación de calidad en 5 pasos:
            1.  Comprueba si el proyecto contiene Playwright.
            2.  Lanza el servidor Vite en background con `spawn` en el puerto 5190 (`npm run dev -- --port 5190`).
            3.  Ejecuta `waitPort(5190)` esperando la inicialización del puerto.
            4.  Usa `createRequire` para ubicar e importar de forma local la librería `playwright` dentro del `node_modules` del cliente generado.
            5.  Lanza un navegador Chromium headless, navega a la raíz (`http://localhost:5190`), y suscribe un listener al evento de error de página (`page.on('pageerror')`). Si la página renderiza un título y no emite excepciones de React en consola, certifica el proyecto. Apaga el servidor Vite matando el árbol de procesos con `killProcessTree`.
        *   *Retorna:* Promesa.
*   **Conexiones:**
    *   Envía mensajes IPC a `server.js`.
    *   Consume la librería local de Playwright y levanta subprocesos de consola de Node en localhost.

### 2.5 [generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js)
*   **Propósito:** Motor de aprovisionamiento de código. Copia y personaliza el template base del core según los parámetros de marca del cliente.
*   **Lógica de Funciones:**
    1.  `parseHSL`:
        *   *Parámetros:* `$hslStr` (string).
        *   *Qué hace:* Extrae los componentes de Hue (0-360), Saturation (0-100) y Lightness (0-100) usando expresiones regulares.
        *   *Retorna:* Objeto conteniendo `{ h, s, l }` o `null`.
    2.  `hslToRgbaHex`:
        *   *Parámetros:* `$hslStr` (string), `$alpha` (entero - default 255).
        *   *Qué hace:* Parsea la cadena HSL. Si falla, retorna blanco. Convierte los rangos de Hue, Saturation y Lightness a decimal. Si la saturación es cero, asigna gris. Si no, aplica el algoritmo trigonométrico de conversión de matiz a RGB. Calcula los canales de color, los multiplica por 255, y genera el entero binario de color.
        *   *Retorna:* Entero binario de 32 bits representativo del color.
    3.  `checkEnvironment`:
        *   *Parámetros:* `$answers` (objeto).
        *   *Qué hace:* Corre diagnósticos en caliente antes de escribir en disco. Verifica si `firebase` está en el PATH de Windows y si tiene sesión iniciada (`firebase projects:list`). Si está activa la opción de GitHub, comprueba que `gh` esté instalado y autenticado (`gh auth status`).
        *   *Retorna:* Nada (lanza excepción si falla).
    4.  `createProject`:
        *   *Parámetros:* `$answers` (objeto conteniendo parámetros del cliente).
        *   *Qué hace:* Algoritmo maestro en 12 pasos físicos:
            1.  **Copiar base:** Lee el template y lo clona en la carpeta destino con `fs-extra.copy`.
            2.  **Documentar:** Crea una subcarpeta `Documentacion [Nombre-Proyecto]` y escribe **12 archivos de documentación canónicos**, inyectando el nombre del proyecto en cada título Markdown.
            3.  **Inyección HSL:** Parsea `src/index.css` e inyecta o reemplaza el bloque `:root` con las variables de marca del cliente (primary, secondary, accent, bg, surface, text, border, radius, font).
            4.  **Generar .env.local:** Escribe el archivo con credenciales de Firebase, telemetría y facturación, de forma sanitizada.
            5.  **Gitignore:** Escribe un `.gitignore` robusto que protege secretos (.env, .firebase, dist, node_modules).
            6.  **Firebase Config:** Escribe `.firebaserc` (viculando el projectId), `firebase.json` (rutas de hosting y base de datos) y reglas iniciales de Firebase Storage (`storage.rules`) y Firestore (`firestore.rules`).
            7.  **Meta de Nicho:** Escribe `src/config/niche.json` con los feature flags y array de atributos dinámicos según el tipo de nicho (ej: tallas para ropa, peso para lavanderías, etc.).
            8.  **Meta de Sincronización:** Escribe `.prototipe.json` con la metadata de la versión inicial (1.0.0).
            9.  **Manifest PWA:** Lee `manifest.json` y actualiza el nombre comercial, iniciales del launcher y convierte los colores HSL a Hex para inyectarlos en `theme_color` y `background_color`.
            10. **SEO index.html:** Abre `index.html` y reemplaza el título, etiquetas open graph (`og:title`), twitter y apple touch title.
            11. **Logotipo SVG / Jimp:** Si no se le suministra logo, escribe un SVG combinando las iniciales del proyecto con el color primario de fondo. Si se le provee un logo en PNG/JPG, importa la librería `Jimp`, redimensiona el logo y exporta los iconos PWA rasterizados (`pwa-192x192.png`, `pwa-512x512.png` y `apple-touch-icon.png`).
            12. **Mapeador de IA:** Copia en la carpeta `scratch/` el script `generate_ia_map.js` y lo corre para generar el primer mapa semántico del código.
        *   *Retorna:* Objeto con metadata del proyecto (`clientId`, `uniqueToken`, `targetDir`, `themeName`, `primaryColor`, `prompt`).
*   **Conexiones:**
    *   Llama y ejecuta comandos del sistema mediante `execSync`.
    *   Realiza peticiones REST directas HTTPS a la API de Firestore del Dashboard Central para guardar el cliente y los tokens de telemetría.

### 2.6 [sync_templates.js](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js)
*   **Propósito:** Sincroniza y actualiza los directorios de plantillas base (`Plantillas Core`) a partir de sus proyectos de desarrollo de referencia. Realiza copias físicas selectivas, higieniza (sanitiza) datos sensibles de clientes, y valida el build resultante de la plantilla.
*   **Flujo de Usuario/Acciones (CLI):**
    *   Si se llama sin el nombre de la plantilla, lista en consola todas las plantillas registradas y su estado.
    *   Si se incluye el flag `--dry-run` o `-d`, realiza una simulación completa en consola de los archivos a copiar, modificar, ignorar o sanitizar sin tocar el disco.
    *   Si no se incluye `--yes` o `-y`, y la consola es TTY, pregunta de forma interactiva: `¿Deseas proceder con la escritura física en el disco? (s/N): `.
    *   Si se incluye el flag `--run-tests` o `-T`, lanza al final del proceso una batería de pruebas de integración llamando a `test_templates.js`.
*   **Lógica de Funciones:**
    1.  `extractSanitizationTokens`:
        *   *Parámetros:* `fuente` (string - ruta absoluta del proyecto de desarrollo fuente).
        *   *Qué hace:*
            1. Lee sincrónicamente `package.json` de la fuente y extrae el nombre del paquete en `tokens.packageName`.
            2. Lee `.env.local` en la fuente usando expresiones regulares específicas para aislar y retornar las variables `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_MEASUREMENT_ID`, `VITE_FIREBASE_APP_ID`, y `VITE_DEVELOPER_TELEMETRY_TOKEN`.
        *   *Retorna:* Promesa que resuelve a un objeto `{ projectId, apiKey, measurementId, packageName, appId, telemetryToken }`.
    2.  `filesDiffer`:
        *   *Parámetros:* `fileA` (string - ruta absoluta), `fileB` (string - ruta absoluta).
        *   *Qué hace:* Comprueba si el archivo B no existe (retorna `true`). De lo contrario, compara los metadatos de tamaño de ambos archivos con `fs.stat`. Si el tamaño difiere, retorna `true`. Si coinciden en tamaño, lee ambos contenidos codificados en UTF-8 y evalúa su igualdad textual (`contentA !== contentB`).
        *   *Retorna:* Promesa que resuelve a un booleano.
    3.  `validarRegistro`:
        *   *Parámetros:* `registro` (objeto JSON cargado de `plantillas_registro.json`).
        *   *Qué hace:* Validación rigurosa de esquema del registro de plantillas:
            1. Comprueba que el registro sea un objeto y contenga la clave central `plantillas`.
            2. Itera sobre cada plantilla validando la existencia de los campos `fuente`, `destino`, `nicho`, `activo`, `version`, `coreType`.
            3. Verifica que `fuente` y `destino` sean rutas absolutas del sistema de archivos.
            4. Valida que el campo `version` cumpla con el formato de expresión regular SemVer `^\d+\.\d+\.\d+$`.
        *   *Retorna:* Array de strings con los mensajes de error detectados (vacío si es válido).
    4.  `main`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:*
            1. Procesa los argumentos de consola (`process.argv`) para determinar flags (`--dry-run`, `--yes`, `--run-tests`) y la plantilla objetivo.
            2. Carga y valida el archivo `plantillas_registro.json` con `validarRegistro`.
            3. Escanea recursivamente el directorio `fuente` para todos los directorios que forman parte del estándar `SYNC_PATHS` (excluyendo patrones de `EXCLUDE_PATTERNS`).
            4. Clasifica cada archivo en `CREATE`, `UPDATE` o `EQUAL` llamando a `filesDiffer`.
            5. Analiza el código buscando credenciales expuestas (API Keys, App IDs, IDs de analítica, etc.) y prepara la cola de sanitización `sanitizationsToApply`.
            6. Muestra un resumen del estado y solicita confirmación al usuario si no se inyectó `-y`.
            7. Copia físicamente los archivos a actualizar/crear y reescribe de forma sanitizada los archivos correspondientes inyectando variables genéricas en lugar de claves privadas.
            8. Ejecuta un `npm install` y un `npm run build` en el destino para validar que la plantilla resultante compile perfectamente.
            9. Si se especificó `-T`, lanza `test_templates.js` para certificar la plantilla en caliente.
        *   *Retorna:* Nada.
*   **Conexiones:**
    *   Lector y escritor del sistema de archivos mediante `fs-extra` y `path`.
    *   Invoca `npm install` y `npm run build` en subprocesos con `execSync`.
    *   Invoca `node test_templates.js` en subprocesos si se requiere validación post-sincronización.

### 2.7 [sync_clients.js](file:///d:/PROTOTIPE/Prototipe-CLI/sync_clients.js)
*   **Propósito:** Sincronizador de clientes ("Downstream Patching") responsable de propagar actualizaciones y correcciones desde las plantillas core (`Plantillas Core`) hacia los proyectos de clientes específicos instalados en `Instancias Clientes`. Incluye backups preventivos en caliente, comparadores de diffs interactivos y rollback automático si la compilación falla.
*   **Flujo de Usuario/Acciones (Wizard de terminal CLI):**
    1.  **Detección y Curación:** Escanea todas las carpetas del directorio de instancias y autodetecta aquellas que no tengan metadatos `.prototipe.json`. Le pregunta al usuario de manera interactiva: `¿Cuál es el template de origen para la instancia [nombre]?` si no logra deducirlo de manera automática.
    2.  **Selección de Instancias:** Presenta un checklist (`inquirer.prompt` de tipo checkbox) donde el usuario selecciona las instancias que desea actualizar.
    3.  **Visualización y Decisión:** Para cada instancia con cambios detectados, pregunta recursivamente mediante menú de terminal:
        *   `Aplicar Cambios (Sincronización Física)`: Inicia el proceso de actualización física.
        *   `Ver Diffs de Cambios (Simulación/Dry Run)`: Muestra en consola las diferencias línea a línea (verde para adiciones, rojo para eliminaciones, gris para contexto) usando la librería `diff`.
        *   `Omitir Cliente / Siguiente`: Ignora la instancia y salta a la siguiente.
*   **Lógica de Funciones:**
    1.  `getFileHash`:
        *   *Parámetros:* `filePath` (string - ruta absoluta del archivo).
        *   *Qué hace:* Abre sincrónicamente el archivo como buffer con `fs.readFileSync`, inicializa el algoritmo hash MD5 mediante la librería nativa de Node `crypto` (`crypto.createHash('md5')`), procesa el buffer y genera el digest hexadecimal.
        *   *Retorna:* String hexadecimal de 32 caracteres conteniendo el hash del archivo (o `null` en caso de error/no existencia).
    2.  `getFilesRecursive`:
        *   *Parámetros:* `dir` (string - ruta del subdirectorio a escanear), `baseDir` (string - ruta base para calcular relativas, por defecto `dir`).
        *   *Qué hace:*
            1. Lee sincrónicamente todos los elementos del directorio.
            2. Filtra basándose en `EXCLUDED_PATHS` o si el nombre del archivo empieza con `Documentacion ` para proteger las personalizaciones del cliente.
            3. Si el elemento es un directorio, realiza una llamada recursiva a `getFilesRecursive`. Si es un archivo, añade la ruta relativa calculada a la cola.
        *   *Retorna:* Array de strings conteniendo las rutas relativas de todos los archivos válidos a sincronizar.
    3.  `main`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:*
            1. Escanea las subcarpetas del workspace raíz (`Instancias Clientes`) filtrando carpetas de cores y localizando subproyectos con `package.json`.
            2. Lee y cura si es necesario `.prototipe.json` de cada cliente para identificar su template origen y versión actual.
            3. Presenta el menú interactivo para seleccionar clientes.
            4. Para cada cliente seleccionado, localiza su plantilla correspondiente y obtiene la lista de archivos con `getFilesRecursive`.
            5. Compara los hashes MD5 de los archivos del cliente con los del template mediante `getFileHash`.
            6. Clasifica las diferencias en `NUEVO` o `MODIFICADO`.
            7. Lanza el bucle interactivo de selección de acción (Aplicar, Diff u Omitir).
            8. Si se aprueba la sincronización, copia los archivos originales en `.temp_backup_sync` (rollback seguro).
            9. Sobrescribe físicamente los archivos del cliente con los del template core.
            10. Ejecuta de forma síncrona `npm run build` en el cliente. Si tiene éxito, borra la carpeta de backup actualizando `.prototipe.json` con la nueva versión. Si falla, invoca automáticamente `rollbackBackup` para restaurar el estado original del cliente.
        *   *Retorna:* Nada.
    4.  `rollbackBackup`:
        *   *Parámetros:* `clientPath` (string - ruta absoluta del cliente), `backupDir` (string - ruta absoluta del backup temporal), `changes` (array de objetos con los cambios).
        *   *Qué hace:*
            1. Itera sobre la lista de cambios.
            2. Si el archivo existía originalmente (está en `backupDir`), lo copia de vuelta al cliente con `overwrite: true`.
            3. Si el archivo era nuevo (no está en `backupDir`), lo borra del directorio del cliente con `fs.removeSync`.
            4. Finalmente, elimina la carpeta temporal de backup `backupDir`.
        *   *Retorna:* Nada.
    5.  `showDiffs`:
        *   *Parámetros:* `templatePath` (string - ruta de la plantilla), `clientPath` (string - ruta del cliente), `changes` (array de objetos con los cambios).
        *   *Qué hace:*
            1. Para cada archivo nuevo, lee su contenido y lo imprime en consola prefijado con un símbolo verde `+`.
            2. Para archivos modificados, lee ambos archivos, invoca `Diff.diffLines` para calcular la diferencia secuencial.
            3. Imprime las líneas añadidas en verde (`+ `), eliminadas en rojo (`- `) y de contexto en gris, omitiendo bloques idénticos mayores a 8 líneas para evitar saturación de la terminal.
        *   *Retorna:* Nada.
*   **Conexiones:**
    *   Lector y escritor del sistema de archivos local (`fs-extra`, `path`).
    *   Usa la librería externa de Diff (`diff`) para comparar textos.
    *   Utiliza `inquirer` para los menús y diálogos de selección.
    *   Lanza compilaciones locales en los clientes utilizando `execSync`.

### 2.8 [test_templates.js](file:///d:/PROTOTIPE/Prototipe-CLI/test_templates.js)
*   **Propósito:** Runner de pruebas de integración que valida de manera aislada que las plantillas del ecosistema (`Plantillas Core`) compilen sin errores en un directorio temporal (`os.tmpdir()`), garantizando que ningún cambio en la plantilla rompa el bundle de producción de Vite ni introduzca incompatibilidades de dependencias.
*   **Flujo de Usuario/Acciones (CLI):**
    *   `node test_templates.js`: Ejecuta las pruebas en todas las plantillas marcadas como activas en el archivo de registro.
    *   `--all` / `-a`: Fuerza la validación de plantillas marcadas como inactivas.
    *   `--template [nombre]` / `-t [nombre]`: Aísla y prueba únicamente la plantilla especificada.
    *   `--keep-temp` / `-k`: Conserva las carpetas de pruebas temporales creadas en el disco duro del sistema operativo para permitir inspección manual e investigación de errores.
    *   `--no-install`: Omite la ejecución de `npm install` (requiere que el temporal ya posea dependencias).
    *   `--verbose` / `-v`: Expone el standard output y error completo del build de Node/Vite en la consola para depuración.
*   **Lógica de Funciones:**
    1.  `validarRegistro`:
        *   *Parámetros:* `registro` (objeto JSON).
        *   *Qué hace:* Comprueba que exista la clave `plantillas` en el JSON y que cada entrada contenga los campos requeridos (`fuente`, `destino`, `nicho`, `activo`, `version`). Valida que `version` sea un string SemVer válido.
        *   *Retorna:* Array de strings conteniendo errores de esquema (vacío si es válido).
    2.  `auditarDependencias`:
        *   *Parámetros:* `pkg` (objeto package.json del template), `name` (string - nombre de la plantilla).
        *   *Qué hace:* Compara las dependencias instaladas en el template (`dependencies` y `devDependencies`) contra el estándar de oro de la versión de desarrollo (`react`, `react-dom`, `firebase`, `zustand`, `framer-motion`, `tailwindcss`, `vite`). Valida que las versiones major de cada paquete coincidan entre la plantilla y el Core.
        *   *Retorna:* Array de advertencias en formato string.
    3.  `copiarPlantillaATemporal`:
        *   *Parámetros:* `templateDir` (string - ruta origen de la plantilla), `tempDir` (string - ruta de destino temporal).
        *   *Qué hace:* Copia recursivamente la plantilla a la ruta temporal usando `fs.copy` e implementa un filtro dinámico para ignorar subcarpetas pesadas como `node_modules`, `dist` y `.vite`, optimizando tiempos de copiado en disco.
        *   *Retorna:* Promesa.
    4.  `runCmd`:
        *   *Parámetros:* `cmd` (string - comando a ejecutar), `cwd` (string - ruta de ejecución), `verbose` (booleano - exponer salida).
        *   *Qué hace:* Lanza de forma síncrona el comando con `execSync` en una shell con un límite de tiempo por proceso (`TIMEOUT_MS`). Captura excepciones del subproceso y mide el tiempo exacto transcurrido de la llamada.
        *   *Retorna:* Objeto con propiedades `{ success, stdout, stderr, duration }`.
    5.  `testPlantilla`:
        *   *Parámetros:* `name` (string - nombre de la plantilla), `config` (objeto de configuración de la plantilla), `opts` (objeto con opciones de consola).
        *   *Qué hace:*
            1. Inicializa un objeto de resultado y genera una ruta temporal aleatoria prefijada.
            2. Valida la existencia del directorio destino (`destino`) y del archivo `package.json` de la plantilla.
            3. Corre `auditarDependencias` para reportar posibles desfases de paquetes.
            4. Copia el código a la carpeta temporal llamando a `copiarPlantillaATemporal`.
            5. Lanza `npm install` (a menos que se active `--no-install`). Si falla, interrumpe el test y devuelve error.
            6. Corre `npm run build` en el temporal. Si la compilación de Vite falla, recupera las últimas 12 líneas de error de consola y las muestra formateadas.
            7. Verifica físicamente si existe la carpeta `dist/` resultante, y comprueba que contenga `index.html` y la carpeta de `assets/`.
            8. Llama a `cleanupTemp` para eliminar la basura del disco.
        *   *Retorna:* Promesa que resuelve a un objeto de resultado de test.
    6.  `cleanupTemp`:
        *   *Parámetros:* `tempDir` (string), `keepTemp` (booleano).
        *   *Qué hace:* Borra de forma asíncrona la ruta del directorio temporal si `keepTemp` es falso.
        *   *Retorna:* Promesa.
    7.  `main`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Parsea los argumentos de línea de comandos, carga y valida el registro central de plantillas, filtra la lista según la plantilla solicitada o el flag `--all`, ejecuta secuencialmente `testPlantilla` para cada plantilla, y finalmente genera una tabla y reporte en consola con los contadores de pasados, fallados, omitidos y la duración total en milisegundos. Lanza un código de salida `process.exit(1)` si alguna plantilla activa falló la compilación para evitar integraciones continuas dañadas.
        *   *Retorna:* Nada.
*   **Conexiones:**
    *   Llama a la biblioteca del sistema de archivos `fs-extra` and `path`.
    *   Utiliza utilidades de sistema operativo nativas (`os.tmpdir()`).
    *   Ejecuta comandos NPM de instalación y build locales mediante `execSync`.

### 2.9 [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js)
*   **Propósito:** Servidor backend central API y bridge orquestador del Ecosistema PROTOTIPE. Provee la API REST para el control y telemetría de instancias de clientes, y streams Server-Sent Events (SSE) para retroalimentación visual en tiempo real de compilaciones, tests de Playwright, despliegues y backups Git.
*   **Lógica de Funciones Auxiliares:**
    1.  `sanitizeShellArgument`:
        *   *Parámetros:* `arg` (string).
        *   *Qué hace:* Higieniza cadenas eliminando caracteres de redirección shell, comillas dobles, comillas simples, operadores lógicos y tuberías (`" ' < > | ; & $`) para evitar vulnerabilidades de inyección de comandos de consola.
        *   *Retorna:* String sanitizado.
    2.  `isPathContained`:
        *   *Parámetros:* `parentPath` (string), `childPath` (string).
        *   *Qué hace:* Valida la contención física de rutas resolviéndolas a rutas absolutas y verificando que el directorio secundario empiece con el prefijo del padre. Sirve como guardián contra Directory Traversal.
        *   *Retorna:* Booleano.
    3.  `setupConsoleLogger`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Intercepta y sobrescribe globalmente `console.log`, `console.warn` y `console.error` de la terminal de Node para redirigir toda salida hacia `logger.js` para persistencia en logs locales, previniendo bucles recursivos con una bandera de control interna (`inConsoleLogger`).
        *   *Retorna:* Nada.
    4.  `validatePrototipeMetadata`:
        *   *Parámetros:* `meta` (objeto), `folderName` (string).
        *   *Qué hace:* Valida e inyecta propiedades por defecto en los metadatos de configuración en memoria (`template`, `version`, `clientId`, `projectName`) si no están definidos.
        *   *Retorna:* Objeto sanitizado.
    5.  `runPreflightChecks`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Lanza validaciones diagnósticas no destructivas al arranque del servidor para comprobar si `git` y `firebase-tools` están instalados y en el PATH del sistema operativo Windows, reportando advertencias visuales en caso negativo.
        *   *Retorna:* Promesa.
    6.  `killProcessTree`:
        *   *Parámetros:* `pid` (entero).
        *   *Qué hace:* Lanza recursivamente `taskkill /PID [pid] /T /F` en Windows para detener subprocesos Node/Vite huérfanos.
        *   *Retorna:* Promesa.
    7.  `parseHSL`:
        *   *Parámetros:* `hslStr` (string).
        *   *Qué hace:* Utiliza expresiones regulares para extraer los valores numéricos correspondientes a Hue, Saturation y Lightness de una cadena formateada en HSL.
        *   *Retorna:* Objeto `{ h, s, l }` o `null`.
    8.  `validateHSLColors`:
        *   *Parámetros:* `primaryHslStr` (string), `bgHslStr` (string).
        *   *Qué hace:* Valida el formato HSL de ambos colores y calcula la diferencia absoluta de su luminosidad (Lightness). Si la diferencia de contraste es inferior al 30%, retorna un error visual.
        *   *Retorna:* Objeto `{ valid, error }`.
    9.  `expandRequirementsWithAI`:
        *   *Parámetros:* `customRequirements` (string), `projectName` (string), `libraryReadme` (string).
        *   *Qué hace:* Se conecta a la API de Gemini 2.5 Flash de Google inyectando las directivas del Ecosistema y el README de la biblioteca para estructurar un blueprint de desarrollo en Markdown con componentes sugeridos e integraciones.
        *   *Retorna:* Promesa que resuelve a string Markdown.
    10. `runCreateProjectWorker`:
        *   *Parámetros:* `answers` (objeto), `onLog` (función callback).
        *   *Qué hace:* Levanta de forma asíncrona un subproceso IPC (`fork`) del script `worker_create_project.js` para aislar el proceso síncrono pesado de creación de carpetas y descargas de dependencias. Controla un timer de timeout de 10 minutos.
        *   *Retorna:* Promesa con metadata del proyecto.
    11. `buildTags`:
        *   *Parámetros:* `name` (string), `technicalName` (string), `description` (string), `category` (string).
        *   *Qué hace:* Analiza cadenas de texto para autogenerar tags de taxonomía (`firebase`, `zustand`, `modal`, `pwa`, etc.) basados en coincidencia de subcadenas.
        *   *Retorna:* Array de strings.
    12. `resolveFirebaseProjectId`:
        *   *Parámetros:* `projectDir` (string), `clientId` (string).
        *   *Qué hace:* Resuelve el ID del proyecto Firebase de una instancia. Si no existe localmente, interroga a la CLI de Firebase en línea. Si no hay coincidencia, **crea automáticamente un nuevo proyecto de Firebase y su base de datos Firestore en nam5** escribiendo el archivo de configuración local `.firebaserc`.
        *   *Retorna:* Promesa con el ID final.
    13. `findProjectDir`:
        *   *Parámetros:* `clientId` (string).
        *   *Qué hace:* Localiza físicamente el directorio de una instancia recorriendo `Instancias Clientes` y buscando coincidencia por `.prototipe.json`, `package.json` o nombre de carpeta en dos niveles.
        *   *Retorna:* Promesa que resuelve a string ruta absoluta.
    14. `runAuditInternal`:
        *   *Parámetros:* `projectDir` (string), `clientId` (string).
        *   *Qué hace:* Audita de forma estática y física la carpeta `dist/` resultante del build local del cliente, midiendo tamaños de assets, buscando manifest PWA e icons de instalación, y verificando el Service Worker, calculando un score final de 30 a 100.
        *   *Retorna:* Promesa con estadísticas y score.
    15. `getFilesRecursively`:
        *   *Parámetros:* `dir` (string), `ignorePaths` (array), `baseDir` (string).
        *   *Qué hace:* Escaneo recursivo físico del sistema de archivos de un proyecto ignorando temporales y node_modules.
        *   *Retorna:* Promesa que resuelve a array de archivos `{ absolutePath, relativePath, size }`.
    16. `isBinaryFile`:
        *   *Parámetros:* `filename` (string).
        *   *Qué hace:* Valida si la extensión del archivo es de tipo binario (imágenes, audios, zips, etc.).
        *   *Retorna:* Booleano.
    17. `getGitDirName` / `hasGitFolder` / `isInsideGitRepo` / `hasGitChanges` / `getGitBranch`:
        *   *Parámetros:* `dir` (string).
        *   *Qué hace:* Colección de helpers que encapsulan la interacción local de Git (verificación de carpetas `.git`/`.git-backup-temp`, ramas activas, cambios sin subir, etc.).
        *   *Retorna:* Promesas con la metadata Git.
    18. `execGitCommand`:
        *   *Parámetros:* `cmd` (string), `dir` (string).
        *   *Qué hace:* Ejecuta comandos Git inyectando de forma temporal variables de entorno `GIT_DIR` y `GIT_WORK_TREE` en base a si la carpeta Git ha sido renombrada por el motor de backups.
        *   *Retorna:* Promesa de ejecución.
    19. `getSyncFilesRecursiveAsync` / `getSyncFileHashAsync`:
        *   *Parámetros:* Rutas físicas.
        *   *Qué hace:* Escaneo asíncrono no bloqueante y cálculo de hash MD5 de archivos de clientes, omitiendo carpetas de documentación e identidad del cliente.
        *   *Retorna:* Promesas.
*   **Endpoints de la API Express:**
    1.  `GET /api/templates`: Retorna la lista de carpetas disponibles en la carpeta de plantillas.
    2.  `GET /api/firebase-config`: Auto-detecta y crea si es necesario el SDK Web App de un ID de proyecto Firebase mediante la CLI local.
    3.  `POST /api/firebase/validate`: Envía credenciales Firebase a Identity Toolkit de Google para validar en caliente la API Key.
    4.  `GET /api/vapid/generate`: Genera dinámicamente un par de claves criptográficas VAPID para notificaciones push web.
    5.  `POST /api/upload-logo`: Permite subir logos comerciales en base64 y auto-optimiza/redimensiona la imagen si supera los 2 MB.
    6.  `POST /api/create-project`: Endpoint principal de aprovisionamiento. Automatiza Firebase (proyectos, hosting, web apps, bases de datos), expande requerimientos cognitivos con Gemini, y orquesta el worker IPC.
    7.  `GET /api/library`: Retorna el catálogo estructurado de componentes reutilizables parseado directamente del README.md de la biblioteca.
    8.  `GET /api/library/file`: Devuelve el código o Markdown crudo de un archivo de la biblioteca de componentes verificando contención.
    9.  `POST /api/library/extract`: Extrae código react, crea su documentación técnica Markdown (especificaciones, código, Mermaid), y la inyecta de forma automatizada en el README del catálogo y en el mapa de documentación.
    10. `GET /api/project/file`: Obtiene el contenido de un archivo de una instancia del cliente verificando Directory Traversal y buscando coincidencias por alias.
    11. `GET /api/e2e/projects`: Devuelve todos los proyectos del workspace que tienen configs de pruebas Playwright.
    12. `POST /api/e2e/run` (SSE): Ejecuta la suite de pruebas Playwright (`npm run test:ci`) y retransmite logs en vivo al dashboard con control de timeouts.
    13. `GET /api/e2e/last-result`: Retorna el caché del último test E2E.
    14. `POST /api/register-core`: Registra una nueva plantilla Core. Inicializa sus carpetas de código y aprovisiona **12 archivos de documentación estándar de manera física**.
    15. `GET /api/cores`: Lista todas las plantillas cores con sus versiones y documentación.
    16. `POST /api/cores/:clave/scaffold`: Inicia el scaffolding de código para un nuevo Core copiando componentes React base y reemplazando referencias textuales.
    17. `POST /api/cores/:clave/activate`: Sincroniza y sanitiza el Core al templates/ del CLI, aumenta versión patch y la marca como disponible para el wizard.
    18. `POST /api/cores/:clave/sync`: Realiza la sincronización de archivos pero sin alterar la versión del wizard.
    19. `POST /api/cores/:clave/deactivate`: Retira temporalmente la plantilla core del wizard.
    20. `DELETE /api/cores/:clave`: Remueve físicamente el core de desarrollo, su template y su registro.
    21. `POST /api/project/sync-database`: Audita y sincroniza reglas/índices locales (`firestore.rules`, `firestore.indexes.json`, `storage.rules`) del cliente y despliega en caliente a Google Cloud.
    22. `ALL /api/project/deploy` (SSE): Compila con Vite localmente, corre auditoría PWA del build (rechazando builds con score < 90 a menos que sea forzado) y sube a Hosting en caliente.
    23. `GET /api/project/env` / `POST /api/project/env`: Obtiene y actualiza variables del archivo `.env.local` con validaciones sintácticas.
    24. `GET /api/project/drift`: Calcula desviaciones del cliente contra el Core, haciendo diffs de texto línea por línea y auditando dependencias package.json.
    25. `POST /api/project/sync-file` / `/api/project/sync-files`: Sincroniza archivos específicos o por lote desviados del Core al Cliente.
    26. `GET /api/project/dev/status` / `/api/project/dev/logs-stream` (SSE) / `/api/project/dev/start` / `/api/project/dev/stop`: Orquestador y logs de servidores de desarrollo Vite locales (`npm run dev`) en background.
    27. `GET /api/project/drift/global`: Matriz global de paridad y mapa de calor de diferencias de todos los clientes.
    28. `POST /api/git/discard` / `/api/git/diff-file`: Orquestador Git para diffs y descartes de archivos.
    29. `GET /api/project/dependencies/install` (SSE): Orquesta y transmite en vivo un `npm install` local en el cliente.
    30. `GET /api/git/targets`: Escanea repositorios del ecosistema local reportando ramas y cambios de forma recursiva.
    31. `GET /api/git/status`: Reporta estado Git consolidado para el Ecosistema Maestro o individual.
    32. `GET /api/git/backup-stream` (SSE): Dispara `git_backup.ps1`/`subproject_backup.ps1` y transmite salida en tiempo real.
    33. `GET /api/git/cores-and-clients`: Analiza ramas Git del core determinando desfases (commits behind/ahead) para cada cliente.
    34. `GET /api/git/sync-core-to-clients-stream` (SSE): Mergea en caliente y de manera asíncrona la rama core contra ramas cliente, resolviendo conflictos y ejecutando builds/deploys.
    35. `GET /api/instancias/list`: Matriz de visualización con estados de versiones e indicando delta real de archivos en caliente.
    36. `GET /api/instancias/sync-and-deploy-stream` (SSE): Copia física masiva diferencial (sanitizada), valida build de integridad y despliega a Firebase Hosting (con rollback automático si compila con errores).
*   **Conexiones:**
    *   Ejecuta procesos del sistema en background (`child_process.fork`, `child_process.spawn`, `child_process.exec`).
    *   Llamadas HTTPS externas a la API REST de Google Gemini y de Google Firebase Identity Toolkit.
    *   Utiliza la biblioteca de procesamiento de imágenes `Jimp`.
    *   Interacciona con Web-Push para criptografía VAPID.
    *   Se conecta con el sistema operativo Windows y el CLI local de `git` y `firebase`.

---

## 📂 PARTE 3 — DASHBOARD CENTRAL (`D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\`)

### 3.1 [ComponentLibraryView.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx)
*   **Propósito:** Interfaz de usuario del dashboard para explorar, buscar, documentar, simular en sandbox y extraer componentes de código del Ecosistema.
*   **Flujos de Usuario y Acciones (UI):**
    1.  **Buscador:** El campo de búsqueda filtra de manera asíncrona la lista lateral por nombre, nombre técnico, descripción y categoría. Si el usuario escribe, limpia el filtro de sandbox. Al presionar el botón `X`, limpia el término de búsqueda.
    2.  **Filtros de Tipo:** Botones para alternar el filtro `resourceFilter` entre:
        *   `Todos`: Muestra componentes y módulos completos.
        *   `Componentes`: Muestra solo componentes atómicos.
        *   `Módulos`: Muestra solo módulos de negocio completos.
    3.  **Filtros de Sandbox:** Botones para alternar el filtro `sandboxFilter` entre:
        *   `Todos`: Muestra todos los elementos.
        *   `Sandbox`: Muestra solo componentes con Sandbox de Componentes interactivo simulable.
        *   `Solo Docs`: Muestra solo componentes sin Sandbox de Componentes interactivo.
        *   `Ambos`: Muestra todos los componentes de la biblioteca.

    4.  **Menú lateral (Árbol de Componentes):**
        *   Hacer clic en una categoría colapsa/expande su lista de componentes mediante transiciones animadas de `framer-motion`.
        *   Hacer clic en un componente lo selecciona (`setSelectedComponent`), lo que a su vez dispara una petición GET para traer su documentación y código Markdown.
    5.  **Buscador Integrado:** Caja de texto reactiva que filtra en caliente la lista de componentes indexando nombre, nombre técnico, descripción y tags en minúsculas.
    6.  **Nube de Tags:** Fila scrollable horizontal de tags funcionales que permite filtrar la lista por dominios y verticales de negocio.
    7.  **Extractor de Componentes:**
        *   El botón `Extraer Componente` muestra u oculta el formulario de extracción.
        *   El botón `Extraer a Biblioteca` valida y envía los datos del formulario (Ruta origen, Nombre, Categoría y Descripción) en un request POST hacia el backend API `/api/library/extract`.
    8.  **Sincronizar:** El botón `Sincronizar` vuelve a interrogar a la API `/api/library` para reconstruir la lista local y limpia estados de carga.
    9.  **Pestañas de Detalle:** Alterna entre `Documentación` (renderiza el Markdown parseado) y `Sandbox` (inicializa el Sandbox de Componentes interactivo cargando el componente `ComponentSandbox`).
    10. **Botón Copiar todo el código:** Copia al portapapeles todos los bloques de código JavaScript/React que se encuentren dentro de la ficha de documentación Markdown.
*   **Lógica de Funciones:**
    1.  `HighlightText`:
        *   *Parámetros:* `text` (string - texto original), `term` (string - término a buscar).
        *   *Qué hace:* Si hay término, busca coincidencias usando una expresión regular insensible a mayúsculas/minúsculas y divide el texto original. Las partes coincidentes las envuelve en una etiqueta `<mark>` con estilos HSL y las no coincidentes en `<span>`.
        *   *Retorna:* Fragmento JSX.
    2.  `CopyButton`:
        *   *Parámetros:* `text` (string - texto a copiar), `label` (string - texto del botón), `size` (string - tamaño), `className` (string - clases CSS adicionales).
        *   *Qué hace:* Componente que escribe en el portapapeles del navegador mediante `navigator.clipboard.writeText` y activa una bandera visual de éxito (`copied`) por 2 segundos.
        *   *Retorna:* Botón interactivo JSX.
    3.  `MarkdownRenderer`:
        *   *Parámetros:* `content` (string - Markdown crudo), `searchTerm` (string - término de búsqueda).
        *   *Qué hace:* Parsea rudimentariamente pero de forma efectiva bloques Markdown en JSX:
            *   Bloques de código (` ``` `): los aísla en contenedores con un botón de copia individual.
            *   Tablas (`|`): las convierte en tablas HTML con estilos.
            *   Headers (`#`, `##`, `###`, `####`): los mapea en `<h1>` a `<h4>` con iconos.
            *   Listas (`-`, `*`): las agrupa en listas desordenadas `<ul>`.
            *   Negritas (`**`) y código inline (` ` `): los reemplaza usando expresiones regulares.
        *   *Retorna:* Elemento div JSX.
    4.  `extractAllCodeBlocks`:
        *   *Parámetros:* `md` (string - contenido Markdown).
        *   *Qué hace:* Escanea con una expresión regular global todos los bloques delimitados por triple tilde (` ``` `) de tipo js/jsx/ts/tsx y concatena sus contenidos.
        *   *Retorna:* String con los códigos de los bloques o `null` si no hay.
    5.  `handleExtract`:
        *   *Parámetros:* Ninguno (lee estados `extSourcePath`, `extTargetName`, `extCategory`, `extDescription`).
        *   *Qué hace:* Lanza una petición POST hacia `/api/library/extract` enviando los parámetros del formulario de extracción. Si tiene éxito, muestra toast, oculta el formulario, limpia campos y refresca el árbol.
        *   *Retorna:* Promesa.
    6.  `fetchLibrary`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Lanza una petición GET hacia `/api/library` con un query param dummy anti-caché. Parsea las categorías resultantes y selecciona por defecto el primer componente de la primera categoría disponible.
        *   *Retorna:* Promesa.
    7.  `useEffect (Carga de documentación)`:
        *   *Parámetros:* Se ejecuta cuando cambia `selectedComponent`.
        *   *Qué hace:* Lanza un GET hacia `/api/library/file` pasándole el URI del link del componente. Guarda el Markdown resultante en el estado `componentContent` y reinicia la pestaña activa a `docs`.
        *   *Retorna:* Nada.
*   **Conexiones:**
    *   Llama al API local del backend:
        *   `GET http://localhost:3001/api/library`
        *   `GET http://localhost:3001/api/library/file`
        *   `POST http://localhost:3001/api/library/extract`

### 3.2 [ComponentSandbox.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx)
*   **Propósito:** Contenedor de simulación en vivo (Sandbox de Componentes) para probar componentes interactivos del Ecosistema de forma aislada. Carga bajo demanda (`React.lazy`) el sandbox correspondiente al componente seleccionado y expone un panel de controles de parámetros si están habilitados.
*   **Flujo de Trabajo:**
    1.  **Cargador Dinámico:** Al abrirse, detecta el nombre del componente e intenta mapearlo a un sandbox activo de su lista (`SANDBOXES`). Si existe, carga y renderiza de manera asíncrona la vista interactiva con un spinner de carga (`LoaderSpinner`).
    2.  **Panel de Controles (ControlPanel):** Si el sandbox activo expone controles configurables:
        *   Sincroniza y almacena sus valores en un estado de tipo clave-valor (`values`).
        *   Dibuja inputs adaptados según el tipo de control (toggle, select, text, number).
        *   Inyecta dinámicamente los valores en las propiedades del componente inyectado.
    3.  **Manejador de Excepciones (Error Boundary):** Captura cualquier error o excepción disparada durante la renderización del componente inyectado. En lugar de crashear la consola, detiene el componente, limpia los timers y listeners activos y renderiza una pantalla informativa con el Stack Trace del error.
    4.  **Lista de Sandbox de Componentes:** Muestra al final de la vista de error una lista en cuadrícula con los 53 Sandbox de Componentes interactivos disponibles en el Ecosistema para que el usuario pueda identificarlos rápidamente.
*   **Componentes Clave Declarados:**
    *   `LoaderSpinner` (L12-25):
        *   *Qué hace:* Componente atómico que dibuja un loader animado de carga para los sandboxes que son cargados con `React.lazy`.
    *   `ControlPanel` (L30-80):
        *   *Qué hace:* Dibuja el formulario de configuración dinámico a la izquierda de la pantalla.
        *   *Parámetros:* `controls` (array de objetos control definidos por cada sandbox).
    *   `SandboxLayout` (L85-130):
        *   *Qué hace:* Maquetación base para sandboxes que agrupa el panel de descripción, el lienzo físico de pruebas y el panel de controles.
    *   `useSandboxResolver` (L140-190):
        *   *Qué hace:* Recibe el nombre y nombre técnico de un componente, los normaliza en minúsculas y busca coincidencias exactas en la matriz `COMPONENT_SANDBOX_MAP`. Si no encuentra, realiza búsquedas parciales por subcadenas (`currency`, `modal`, `toast`, `skeleton`, etc.) para deducir de forma reactiva el sandbox.
        *   *Parámetros:* `componentName` (string), `technicalName` (string).
        *   *Retorna:* Sandbox de Componentes interactivo o tarjeta informativa en JSX.

### 3.3 [CoreCard.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx)
*   **Propósito:** Componente de interfaz de usuario que representa de forma visual e interactiva una plantilla Core en el dashboard. Ofrece control completo de su ciclo de vida (activación, desactivación, scaffold, borrado total), además de gestionar su compilación/despliegue SSE, variables `.env.local` y auditoría física/PWA.
*   **Flujos de Usuario y Acciones (UI):**
    1.  **Expandir/Colapsar:** Al hacer clic en el encabezado de la tarjeta, conmuta el estado de expansión (`isExpanded`). Si se expande, dispara de forma automática la carga de auditoría (`runAudit`) y variables de entorno (`loadEnv`).
    2.  **Activar/Desactivar:** Al hacer clic en los botones correspondientes (`Activar`/`Desactivar`), lanza una petición POST hacia `/api/cores/:clave/activate` o `/api/cores/:clave/deactivate` para habilitar/retirar la plantilla del wizard de creación.
    3.  **Eliminar:** Botón de borrado (`Trash2`) que activa un panel interactivo de doble confirmación (`¿Eliminar?`). Al confirmar, lanza una petición DELETE hacia `/api/cores/:clave` para borrar el core físicamente del disco.
    4.  **Scaffold:** Selector desplegable de cores base. Al seleccionar una base (o semilla limpia) y hacer clic en `Aplicar Scaffold`, realiza un request POST a `/api/cores/:clave/scaffold` para poblar el core.
    5.  **Sincronizar CLI:** Al hacer clic en `Sync -> CLI`, lanza una petición POST hacia `/api/cores/:clave/sync` para sincronizar los archivos locales del core a la carpeta interna de plantillas del CLI.
    6.  **Recalcular Auditoría:** Botón que refresca los resultados del análisis físico llamando a `runAudit`.
    7.  **Guardar Variables .env.local:** Permite modificar, eliminar variables existentes o añadir nuevas variables ingresando clave (en mayúsculas) y valor, y guardarlas en disco en el archivo físico llamando a `saveEnv`.
    8.  **Compilar y Desplegar:** Botón que inicia el canal SSE de compilación y despliegue a hosting llamando a `handleRunDeploy`. Si la auditoría da un score < 90, aborta y muestra botones interactivos de corrección rápida (`manualChunks`, `recursos PWA` o `rules`) y un botón para `Forzar Despliegue` (iniciando el request con el query parameter `force=true`).
    9.  **Descargar Log:** Genera y descarga de forma dinámica un archivo de texto en local conteniendo los logs del despliegue acumulados en el buffer.
*   **Lógica de Funciones:**
    1.  `Badge`:
        *   *Parámetros:* `activo` (booleano).
        *   *Qué hace:* Dibuja un pill de estado con el color HSL y texto ("Activo"/"Inactivo") correspondiente.
        *   *Retorna:* Fragmento JSX.
    2.  `LogLine`:
        *   *Parámetros:* `line` (string).
        *   *Qué hace:* Resalta y colorea (rojo para errores, verde para éxitos) líneas de log en base a prefijos.
        *   *Retorna:* Párrafo JSX.
    3.  `runAudit`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Lanza una petición GET hacia `/api/project/audit` pasándole la clave del core para obtener el reporte físico y PWA de la carpeta `dist/`.
        *   *Retorna:* Promesa.
    4.  `loadEnv` / `saveEnv`:
        *   *Parámetros:* Ninguno (lee estados).
        *   *Qué hace:* Interroga a `/api/project/env` (GET) para cargar variables locales y a `/api/project/env` (POST) pasándole el JSON modificado para persistir cambios en disco.
        *   *Retorna:* Promesa.
    5.  `handleRunDeploy`:
        *   *Parámetros:* `force` (booleano - por defecto false).
        *   *Qué hace:*
            1. Realiza una petición POST hacia `/api/project/deploy` pasándole la clave y opcionalmente `force=true`.
            2. Obtiene el `reader` del stream de respuesta e implementa un bucle de lectura asíncrona decodificando los chunks del Server-Sent Events.
            3. Parsea eventos de tipo `log` (acumula líneas de build), `audit_failed` (detiene deploy y carga opciones de quick-fixes) y `result` (concluye con éxito o error).
        *   *Retorna:* Promesa.
    6.  `handleApplyFix`:
        *   *Parámetros:* `type` (string - chunks, pwa o rules).
        *   *Qué hace:* Lanza un POST hacia `/api/project/fix/[type]` para aplicar reparaciones rápidas a archivos de configuración de Vite o Firebase de la plantilla.
        *   *Retorna:* Promesa.
    7.  `runAction`:
        *   *Parámetros:* `endpoint` (string), `body` (objeto).
        *   *Qué hace:* Helper genérico para lanzar requests POST a endpoints de control de cores, recopila los archivos copiados/sincronizados de la respuesta y los expone en la caja de logs de ejecución.
        *   *Retorna:* Promesa.
*   **Conexiones:**
    *   Llama al API local del backend:
        *   `GET /api/project/audit`
        *   `GET/POST /api/project/env`
        *   `POST /api/project/deploy`
        *   `POST /api/project/fix/[type]`
        *   `POST /api/cores/:clave/deactivate`
        *   `POST /api/cores/:clave/activate`
        *   `POST /api/cores/:clave/scaffold`
        *   `POST /api/cores/:clave/sync`
        *   `DELETE /api/cores/:clave`

### 3.4 [CoreManagerPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx)
*   **Propósito:** Panel de administración de UI para la visualización, actualización y registro de nuevas plantillas Core en el Ecosistema.
*   **Flujo de Usuario / Acciones:**
    *   **Actualizar:** Al pulsar el botón "Actualizar", invoca `loadCores` para refrescar la lista de plantillas desde el backend del CLI.
    *   **Nueva Plantilla:** Alterna el estado `showRegisterForm` para mostrar u ocultar el panel de creación.
    *   **Formulario de Registro:**
        *   *Nombre:* El usuario escribe el nombre comercial (ej: "Inventario"). Actualiza `formNombre` y autocompleta la clave CLI.
        *   *Clave CLI:* Escribe la clave en minúsculas y guiones (ej: "inventario").
        *   *Nicho:* Escribe la descripción o rubro comercial de la plantilla.
        *   *Cancelar:* Oculta el formulario sin guardar.
        *   *Registrar Plantilla:* Llama a `handleRegister` para enviar los datos al servidor.
*   **Lógica de Funciones:**
    1.  `InputField`:
        *   *Parámetros:* `label` (string), `value` (string), `onChange` (función callback), `placeholder` (string), `required` (booleano), `hint` (string).
        *   *Qué hace:* Renderiza un campo de entrada estilizado con etiquetas uppercase y un mensaje de ayuda o ayuda rápida en la parte inferior.
        *   *Retorna:* Componente JSX.
    2.  `loadCores`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Pone `loading` en true. Llama al endpoint `GET /api/cores` en el CLI local. Si es exitoso, actualiza el estado `cores` con el listado recibido. En caso de error de red, emite un toast de error.
        *   *Retorna:* Promesa.
    3.  `handleRegister`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Valida que los tres campos obligatorios no estén vacíos. Pone `registering` en true. Envía por POST a `/api/register-core` un objeto JSON con `nombre`, `clave` y `nicho`. Si es exitoso, notifica con toast, limpia los inputs, oculta el formulario y refresca la lista llamando a `loadCores`.
        *   *Retorna:* Promesa.
*   **Conexiones:**
    *   Llama al API local de Express (`http://localhost:3001`):
        *   `GET /api/cores`
        *   `POST /api/register-core`

### 3.5 [CoreSyncPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx)
*   **Propósito:** Panel de control visual de UI que permite orquestar la sincronización física del código del core hacia las múltiples instancias de clientes en el disco local (`D:/PROTOTIPE/Instancias Clientes`), permitiendo además la compilación local (`npm run build`) y el despliegue automático a Firebase Hosting en caliente. Preserva intactas las variables de entorno locales y la identidad visual del cliente.
*   **Flujo de Usuario / Acciones:**
    *   **Refrescar:** Llama a `fetchInstancias` para volver a escanear el disco y detectar instancias actualizadas y desactualizadas.
    *   **Dropdown de Plantilla Core (Selección de origen):**
        *   Al hacer clic en el botón del dropdown, se despliega el menú con la lista de plantillas disponibles.
        *   Al seleccionar una plantilla del dropdown, se invoca `handleTemplateChange`, actualizando el core origen activo y seleccionando por defecto a todos sus clientes asociados.
    *   **Toggle Deploy a Firebase Hosting:** Alterna el boolean `doDeploy` al hacer clic sobre el card interactivo. Si está activo, añade un query parameter `deploy=true` al endpoint SSE para realizar la publicación final en Hosting.
    *   **Checkboxes de Instancias:**
        *   "Todas" / "Ninguna": Selecciona o deselecciona todas las instancias del core actual en lote actualizando `selectedClients`.
        *   Click en card del cliente: Alterna la selección individual (`toggleClient`).
    *   **Botón Registrar en Central (por cliente):**
        *   Si la instancia del cliente no está registrada en Firestore Central, muestra un badge rojo interactivo "Registrar en Central". Al pulsarlo, llama a `handleRegister` (que a su vez dispara `onRegisterClient`) para aprovisionarlo en la consola central sin interrumpir el flujo.
    *   **Botón de Acción Sincronizar (Iniciar / Cancelar):**
        *   Si está en estado inactivo (`syncState !== 'running'`), pulsa para llamar a `startSync`.
        *   Si está corriendo (`syncState === 'running'`), pulsa para cancelar la sincronización llamando a `stopSync` y cerrando la conexión SSE.
*   **Lógica de Funciones:**
    1.  `ClientStatusBadge`:
        *   *Parámetros:* `status` (string).
        *   *Qué hace:* Mapea el estado actual de sincronización del cliente a los colores y etiquetas predefinidos en `STATUS_META` para dibujar un tag dinámico y pulsante en progreso.
        *   *Retorna:* Componente JSX.
    2.  `VersionBadge`:
        *   *Parámetros:* `clientVersion` (string), `coreVersion` (string), `isOutdated` (booleano), `driftCount` (entero).
        *   *Qué hace:* Dibuja la versión actual del cliente. Si está desactualizado (`isOutdated`), dibuja un tag de advertencia indicando la brecha de versión y el número de archivos modificados/desviados (`driftCount`).
        *   *Retorna:* Componente JSX.
    3.  `getLogStyle`:
        *   *Parámetros:* `type` (string).
        *   *Qué hace:* Retorna las clases Tailwind específicas para colorear líneas en la terminal del logger en base a categorías como `header`, `command`, `stdout`, `stderr`, `info`, `success`, `warn`, `error`.
        *   *Retorna:* String (nombres de clases).
    4.  `fetchInstancias`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Lanza una petición GET hacia `/api/instancias/list`. Al recibir los datos, los formatea e inyecta en el estado `templates`. Inicializa el primer template como seleccionado por defecto y activa todos sus clientes en el checklist. Muestra un toast de error si la conexión con el servidor falla.
        *   *Retorna:* Promesa.
    5.  `handleRegister`:
        *   *Parámetros:* `client` (objeto).
        *   *Qué hace:* Pone el estado de carga para ese cliente (`registeringClients`). Invoca `onRegisterClient` pasándole el cliente. Si es exitoso, añade el ID del cliente al set `localRegistered`.
        *   *Retorna:* Promesa.
    6.  `handleTemplateChange`:
        *   *Parámetros:* `e` (evento de cambio).
        *   *Qué hace:* Busca la plantilla en el listado por su clave y la establece en `selectedTemplate`. Selecciona por defecto todos los clientes de esa plantilla en `selectedClients` y vacía los estados de sincronización previos.
        *   *Retorna:* Nada.
    7.  `toggleClient`:
        *   *Parámetros:* `folderName` (string).
        *   *Qué hace:* Añade o remueve el cliente de la cola de selección `selectedClients`.
        *   *Retorna:* Nada.
    8.  `startSync`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:*
            1. Valida que haya un origen y clientes seleccionados.
            2. Configura el estado `syncState` a `'running'`, limpia los logs anteriores e inicializa a todos los clientes seleccionados en estado `'pending'`.
            3. Resuelve los parámetros URL y cierra conexiones SSE activas anteriores.
            4. Crea una instancia `EventSource` apuntando a `/api/instancias/sync-and-deploy-stream` pasándole los parámetros.
            5. Suscribe listeners SSE: `log` (acumula líneas en la terminal), `client-status` (actualiza el badge individual del cliente en caliente) y `complete` (actualiza `syncState` final, recarga instancias y emite toast de cierre).
            6. Define el manejador de error `es.onerror` para capturar fallos de red.
        *   *Retorna:* Nada.
    9.  `stopSync`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Cierra la conexión SSE del lector de streams activa (`eventSourceRef.current.close()`), devuelve el estado de sincronización a `idle` e inyecta un log de advertencia.
        *   *Retorna:* Nada.
*   **Conexiones:**
    *   Llama al API local de Express (`http://localhost:3001`):
        *   `GET /api/instancias/list`
        *   `GET /api/instancias/sync-and-deploy-stream` (SSE Stream de larga duración)

### 3.6 [E2EPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/E2EPanel.jsx)
*   **Propósito:** Panel de administración visual de UI encargado del lanzamiento y monitoreo en tiempo real de la suite de pruebas automatizadas de integración de extremo a extremo (E2E) con Playwright en modo headless para los proyectos e instancias del ecosistema.
*   **Flujo de Usuario / Acciones:**
    *   **Selector de Proyecto (Dropdown):**
        *   Al hacer clic en el dropdown (si no está corriendo un test), se despliega el listado de proyectos que disponen de pruebas Playwright.
        *   Al seleccionar uno, actualiza `e2eSelectedProject`, cierra el dropdown y realiza una consulta GET para traer el último resultado almacenado de ese proyecto.
    *   **Botón Ejecutar Tests (btn-run-e2e):**
        *   Dispara la función `handleRunE2E`. Deshabilita interacciones de UI, limpia la consola y realiza un request POST a `/api/e2e/run` para levantar Playwright.
    *   **Botón Limpiar:**
        *   Si hay líneas de logs acumuladas, vacía el estado `e2eLogs`.
*   **Lógica de Funciones:**
    1.  `handleRunE2E`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:*
            1. Valida que no haya pruebas activas.
            2. Pone `e2eRunning` en true, limpia logs y resultados.
            3. Lanza petición POST a `/api/e2e/run` enviando el `projectId` y `projectPath`.
            4. Obtiene el lector de response stream (`Reader`) y decodifica el buffer SSE fragmentando por `\n\n` y sanitizando.
            5. Escucha eventos: `log` (acumula líneas de salida del test en `e2eLogs`) y `result` (con el reporte final de pasados, duración y resumen).
            6. En caso de error, añade líneas con el reporte del fallo y advertencias.
            7. Al finalizar la lectura, restablece `e2eRunning` en false.
        *   *Retorna:* Promesa.
*   **Conexiones:**
    *   Llama al API local de Express (`http://localhost:3001`):
        *   `GET /api/e2e/projects`
        *   `GET /api/e2e/last-result`
        *   `POST /api/e2e/run` (SSE Stream)

### 3.7 [GitBackupPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx)
*   **Propósito:** Panel de administración visual de UI que permite orquestar de forma integral la creación de snapshots (commits) locales de Git y su sincronización remota (push a GitHub) para todos los subproyectos y el proyecto maestro del ecosistema PROTOTIPE. Permite además gestionar estrategias de integración (push y auto-merge a main) y auditar en caliente riesgos de seguridad por archivos `.env` expuestos.
*   **Flujo de Usuario / Acciones:**
    *   **Actualizar (Cabecera):** Llama a `fetchTargets` para volver a escanear los repositorios y recargar los estados de Git.
    *   **Selector de Repositorios (Panel Izquierdo):**
        *   Al hacer clic en un repositorio con Git inicializado (`handleSelectTarget`), se selecciona como repositorio activo, limpia logs de backup previos y realiza una llamada GET para leer su estado.
        *   Si se hace clic en un repositorio sin Git, emite un toast de error.
    *   **Recargar Estado (Panel Derecho):** Al pulsar el botón de recarga al lado de la información del repo seleccionado, invoca `fetchStatus` para actualizar en vivo el estado local de cambios y ramas.
    *   **Checkboxes de Estrategia Git:**
        *   *Sincronizar a GitHub (Push):* Alterna el estado `doPush`. Si se apaga, fuerza también el apagado del auto-merge.
        *   *Auto-Merge a Producción (AutoMerge):* Alterna el estado `doAutoMerge` (solo visible si `doPush` está activo y la rama actual es distinta de `main`/`master`).
    *   **Mensaje de Commit:**
        *   Permite escribir una descripción libre de los cambios en el input de texto.
        *   *Botón Auto:* Llama a `handleAutoMessage` para redactar de forma automatizada un mensaje estandarizado a partir del parseo de archivos añadidos, modificados y eliminados.
    *   **Botón de Acción "Respaldar en Git":** Llama a `handleRunBackup`. Deshabilita la interacción de UI y lanza la conexión SSE al motor de backups.
    *   **Botón Detener (StopCircle):** Llama a `handleAbort`, interrumpiendo la conexión SSE de backup en curso de manera forzada.
    *   **Botón Limpiar Terminal (Papelera):** Borra las líneas del log de la terminal llamando a `clearLogs`.
*   **Lógica de Funciones:**
    1.  `fileTypeIcon`:
        *   *Parámetros:* `type` (string).
        *   *Qué hace:* Retorna un badge de color distintivo con el tipo de cambio de Git (Añadido, Eliminado, Renombrado, Modificado).
        *   *Retorna:* Fragmento JSX.
    2.  `BranchBadge`:
        *   *Parámetros:* `branch` (string).
        *   *Qué hace:* Dibuja un tag con la rama activa (verde para main/master, morado para desarrollo).
        *   *Retorna:* Fragmento JSX.
    3.  `ChangeBadge`:
        *   *Parámetros:* `hasChanges` (booleano), `count` (entero).
        *   *Qué hace:* Dibuja un tag de estado limpio (verde) o con la cuenta de cambios pendientes (amarillo pulsante).
        *   *Retorna:* Componente JSX.
    4.  `TargetItem`:
        *   *Parámetros:* `target` (objeto), `isSelected` (booleano), `onClick` (función callback), `categoryLabel` (string).
        *   *Qué hace:* Dibuja el card interactivo en la lista de repositorios con su nombre, ruta resumida, rama y cantidad de cambios.
        *   *Retorna:* Componente JSX.
    5.  `fetchTargets`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Lanza una petición GET a `/api/git/targets`. Al recibir la respuesta, actualiza el estado `targets`. Emite toast en caso de error.
        *   *Retorna:* Promesa.
    6.  `fetchStatus`:
        *   *Parámetros:* `target` (objeto).
        *   *Qué hace:* Lanza una petición GET a `/api/git/status` pasándole la ruta absoluta del repositorio. Si tiene éxito, inyecta la información en `gitStatus` (con variables expuestas de fugas `.env` y cambios). Emite toast en caso de error.
        *   *Retorna:* Promesa.
    7.  `handleSelectTarget`:
        *   *Parámetros:* `target` (objeto).
        *   *Qué hace:* Restablece los estados internos, selecciona el target activo y llama a `fetchStatus` para cargar su información.
        *   *Retorna:* Nada.
    8.  `handleAutoMessage`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Analiza los cambios en `gitStatus.changes`, los agrupa por tipo de acción (`M`, `A`, `D`), extrae los nombres de archivos e inyecta en el campo de texto de commit un mensaje con formato `[rama] AAAA-MM-DD — Mod: ... | Add: ...`.
        *   *Retorna:* Nada.
    9.  `handleRunBackup`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:*
            1. Valida que haya un repo seleccionado, que no haya fugas `.env` en curso, que haya cambios y que el mensaje de commit no esté vacío.
            2. Cierra conexiones SSE anteriores, pone `streamState` en `'running'` y limpia logs.
            3. Abre una conexión SSE apuntando a `/api/git/backup-stream` pasándole los parámetros por query string (`path`, `message`, `isMaster`, `push`, `autoMerge`).
            4. Escucha eventos SSE:
                *   `log`: Agrega la línea al terminal local con su timestamp.
                *   `metadata`: En caso de ser una instancia cliente, registra de forma asíncrona la trazabilidad del respaldo directamente en la colección `historial_respaldos` de la base de datos Firestore Central.
                *   `complete`: Cierra el stream, recarga estados locales con `fetchStatus` y emite toast de éxito.
                *   `error`: Registra el error en la terminal, cierra la conexión y emite toast de fallo.
        *   *Retorna:* Nada.
    10. `handleAbort`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Pone `abortRef.current` en true, cierra la conexión SSE, restablece el estado de ejecución y escribe una alerta en el log.
        *   *Retorna:* Nada.
*   **Conexiones:**
    *   Llama al API local de Express (`http://localhost:3001`):
        *   `GET /api/git/targets`
        *   `GET /api/git/status`
        *   `GET /api/git/backup-stream` (SSE Stream de larga duración)
    *   Base de Datos Externa (Firebase Firestore):
        *   Inserta documentos (`addDoc`) en la colección `historial_respaldos` para auditar la trazabilidad de backups de clientes.

### 3.8 [pdfService.js](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/services/pdfService.js)
*   **Propósito:** Biblioteca de servicios y utilidades del lado del cliente encargada de la generación, maquetación y descarga física de documentos PDF estructurados para el control financiero, conciliaciones de cobros SaaS, directorios de clientes y analíticas de rendimiento del ecosistema. Utiliza las librerías `jspdf` y `jspdf-autotable`.
*   **Lógica de Funciones:**
    1.  `exportCommissionReceiptPDF`:
        *   *Parámetros:* `report` (objeto de reporte comisional individual de una instancia).
        *   *Qué hace:*
            1. Instancia `jsPDF` en modo retrato.
            2. Dibuja un banner superior con el color primario índigo de la marca.
            3. Escribe títulos, metadatos y un badge de pago dinámico (verde para "PAGADO / LIBERADO", amarillo para "COBRO PENDIENTE").
            4. Renderiza los bloques de información contable ("VENTAS DECLARADAS DEL PERIODO" y "TOTAL COMISIÓN POR RECAUDAR") en cards de color gris.
            5. Estructura una tabla con desglose detallado del concepto de licenciamiento usando `jspdf-autotable`.
            6. Dibuja una línea de firma autorizada digital y un sello descriptivo.
            7. Guarda el archivo con el patrón de nombre `Recibo_Comision_[clientId]_[periodo].pdf`.
        *   *Retorna:* Nada (desencadena la descarga del navegador).
    2.  `exportConsolidatedReconciliationPDF`:
        *   *Parámetros:* `period` (string de periodo contable), `clients` (array de objetos de configuración de clientes), `reports` (array de reportes financieros históricos).
        *   *Qué hace:*
            1. Filtra los reportes que coinciden con el periodo solicitado.
            2. Agrupa los datos acumulando de manera agregada para cada cliente: ventas totales, comisiones, montos cobrados y montos pendientes.
            3. Suma los consolidados generales del periodo (totales brutos).
            4. Dibuja el banner superior del PDF y un panel gris de resumen consolidado ("RESUMEN GENERAL DEL PERIODO").
            5. Genera la tabla consolidada de múltiples filas conteniendo: Cliente, Nicho, Esquema Cobro (porcentaje, fijo mensual, o fijo por servicio), Ventas, Comisión, Cobrado, Pendiente.
            6. Guarda el archivo como `Conciliacion_Consolidada_[periodo].pdf`.
        *   *Retorna:* Nada (descarga el documento).
    3.  `exportClientsDirectoryPDF`:
        *   *Parámetros:* `clients` (array de objetos clientes).
        *   *Qué hace:*
            1. Inicializa un PDF con un encabezado detallando la fecha y total de registros activos.
            2. Genera y dibuja una tabla listando cada cliente con su identificador, nicho comercial, esquema de facturación (tarifa de porcentaje o valor fijo) y si tiene habilitada la facturación electrónica DIAN.
            3. Descarga el archivo como `Directorio_Clientes_Saas.pdf`.
        *   *Retorna:* Nada.
    4.  `exportGeneralMetricsPDF`:
        *   *Parámetros:* `metrics` (objeto de métricas agregadas), `chartData` (array de rendimiento de top clientes), `projections` (objeto con variables de simulación de crecimiento a futuro).
        *   *Qué hace:*
            1. Crea un PDF corporativo con banner y un panel horizontal de KPIs clave (comisión acumulada, total cobrado, pendiente y clientes activos).
            2. Genera una primera tabla detallando el top de clientes ordenados por mayor comisión generada y ventas.
            3. Genera una segunda tabla que plasma la simulación de proyecciones a 12 meses basándose en el promedio mensual y las tasas de crecimiento proyectadas por el usuario.
            4. Guarda el archivo como `Reporte_General_Metricas.pdf`.
        *   *Retorna:* Nada.
    5.  `exportClientDetailPDF`:
        *   *Parámetros:* `clientName` (string), `clientConfig` (objeto de configuración del cliente), `clientReports` (array de reportes históricos de esa instancia), `clientFailures` (array de incidentes de telemetría).
        *   *Qué hace:*
            1. Instancia el documento PDF agregando el identificador del cliente en la cabecera.
            2. Renderiza la primera tabla con la configuración de facturación actual (método de cobro, tokens de telemetría y estado de la facturación DIAN).
            3. Genera una segunda tabla con el desglose histórico de ventas declaradas y comisiones por periodo.
            4. Analiza si existen fallos de telemetría registrados. Si no, inyecta un texto indicándolo; en caso contrario, dibuja una tercera tabla con la fecha, mensaje de error, severidad y estado del incidente. Si supera el límite de página, invoca `doc.addPage()`.
            5. Guarda el archivo como `Reporte_Detail_[clientName].pdf`.
        *   *Retorna:* Nada.
*   **Conexiones:**
    *   Llama al módulo JS local `jsPDF` y `jspdf-autotable` para generación de documentos vectoriales en memoria. No realiza peticiones de red.

### 3.9 [sync_rules.js](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js)
*   **Propósito:** Script utilitario de Node.js encargado de la propagación y sincronización de reglas de IA (`GEMINI.md`) a lo largo de todos los repositorios y plantillas del ecosistema, aplicando fusión inteligente de contenido para preservar las secciones de configuración específicas del core de cada proyecto (rutas físicas, URLs locales, etc.) sin sobrescribirlas.
*   **Lógica de Funciones:**
    1.  `extractPerCoreSection`:
        *   *Parámetros:* `content` (string - contenido textual de un archivo).
        *   *Qué hace:* Localiza los índices de inicio del marcador `SECTION_START` ("## SECCIÓN 10") y del marcador `SECTION_END` ("## SECCIÓN 13"). Si ambos marcadores existen en orden correcto, extrae y retorna el fragmento intermedio.
        *   *Retorna:* String con la sección extraída o `null` si no se encuentran los marcadores.
    2.  `mergeContent`:
        *   *Parámetros:* `source` (string - contenido del archivo fuente maestro), `target` (string - contenido del archivo de destino existente).
        *   *Qué hace:*
            1. Extrae el bloque per-core del archivo de destino con `extractPerCoreSection`. Si no tiene, retorna el contenido del archivo fuente sin fusionar.
            2. Localiza las posiciones de los marcadores de sección en el archivo fuente.
            3. Reemplaza el bloque delimitador del archivo fuente con la sección extraída del destino para preservar la configuración local de rutas de ese proyecto.
        *   *Retorna:* String con el contenido final fusionado.
    3.  `scanDirectory`:
        *   *Parámetros:* `baseDir` (string - ruta física de carpeta).
        *   *Qué hace:* Lee el directorio de forma síncrona. Itera por sus hijos. Si son directorios y no corresponden a la carpeta global de documentación (`Documentacion PROTOTIPE`) ni a `node_modules`, y además contienen un repositorio `.git` o un `package.json`, añade la ruta de destino `${dirPath}/GEMINI.md` al array `targets`.
        *   *Retorna:* Nada.
*   **Lógica Secuencial Principal:**
    1.  Valida la existencia del archivo de origen `GEMINI.md` en su ruta local.
    2.  Llama a `scanDirectory` para buscar proyectos en el workspace raíz (`D:\PROTOTIPE`), en `Plantillas Core`, en `Central PROTOTIPE` y en las plantillas del CLI (`Prototipe-CLI/templates`).
    3.  Itera sobre cada ruta destino en `targets`. Si el archivo no existe, escribe el contenido maestro tal cual (`created`). Si existe, extrae la sección per-core, realiza la combinación (`mergeContent`) y compara con el archivo existente normalizando retornos de carro (`\r\n`). Si son idénticos lo omite (`skipped`), de lo contrario escribe los cambios manteniendo las rutas preservadas (`preserved` o `updated`).
    4.  Imprime en consola un reporte con el balance final.
*   **Conexiones:**
    *   Lector y escritor del sistema de archivos local (`fs` y `path`).

### 3.10 [verify_ecosystem_integrity.js](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/verify_ecosystem_integrity.js)
*   **Propósito:** Script utilitario principal de Node.js encargado de garantizar la integridad y coherencia documental del ecosistema. Ejecuta de forma coordinada tres validaciones críticas: (1) Sincroniza las reglas globales de IA (`GEMINI.md`) en todos los repositorios activos y plantillas. (2) Garantiza la presencia física y estructura de los 12 archivos de documentación obligatorios de cada Core tanto en `Plantillas Core` como en `Prototipe-CLI/templates`, auto-inicializándolos si faltan. (3) Indexa de forma dinámica las rutas de estos archivos en los mapas globales de documentación (`mapa_documentacion_ia.md`) y de aplicación (`mapa_aplicacion.md`) mediante etiquetas delimitadoras HTML.
*   **Lógica de Funciones:**
    1.  `scanForGeminiTargets`:
        *   *Parámetros:* `baseDir` (string - ruta física de escaneo).
        *   *Qué hace:* Escanea de forma síncrona el directorio buscando subcarpetas que contengan repositorios `.git` o archivos `package.json` (evitando la carpeta global de documentación `Documentacion PROTOTIPE`), y añade la ruta absoluta `${dirPath}/GEMINI.md` al array global `geminiTargets`.
        *   *Retorna:* Nada.
*   **Lógica Secuencial Principal:**
    1.  **Autosincronización de GEMINI.md:**
        *   Lee el contenido maestro de `GEMINI.md`.
        *   Llama a `scanForGeminiTargets` en el workspace raíz (`D:\PROTOTIPE`), `Plantillas Core`, `Central PROTOTIPE` y las plantillas del CLI (`Prototipe-CLI/templates`).
        *   Itera sobre cada destino en `geminiTargets`, y si su contenido difiere o el archivo no existe, lo sobrescribe de forma síncrona.
    2.  **Estandarización de Documentación de Cores y CLI:**
        *   Escanea los cores activos en `Plantillas Core/`. Para cada carpeta, verifica si existe el directorio de documentación local `Documentacion [Nombre-Core]`. Si no existe, lo crea.
        *   Itera sobre los 12 archivos obligatorios del ecosistema (estándar v2: tareas, bitácora, mapa app, esquemas base de datos, plan IA, manual migración, flujos, mapa arquitectura, mapa arquitectura IA, contexto de negocio, restricciones técnicas y guía estilos UI). Si alguno falta, lo inicializa con un contenido por defecto estructurado con su título, propósito y fecha.
        *   Aplica el mismo proceso de escaneo y creación para los templates de plantillas del CLI en `Prototipe-CLI/templates` adaptando los nombres del core y de los archivos de documentación correspondientes.
    3.  **Autoindexación en Mapa de Documentación:**
        *   Lee `mapa_documentacion_ia.md`. Localiza las etiquetas `<!-- START_AUTO_CORES_DOCS -->` y `<!-- END_AUTO_CORES_DOCS -->`.
        *   Genera una tabla comparativa Markdown detallando cada core con sus 12 archivos obligatorios, el rol técnico de cada archivo, criterios de decisión de cuándo usarlo por la IA y su enlace absoluto `file:///` en Windows. Reemplaza la sección del mapa usando expresiones regulares.
    4.  **Autoindexación en Mapa de Aplicación:**
        *   Lee `mapa_aplicacion.md`. Localiza las etiquetas `<!-- START_AUTO_CORES_APP -->` y `<!-- END_AUTO_CORES_APP -->`.
        *   Genera un listado de las carpetas y archivos de documentación obligatorios de cada Core e inyecta la lista mediante expresiones regulares entre los tags.
*   **Conexiones:**
    *   Lector y escritor del sistema de archivos local (`fs` y `path`).

### 3.11 [useCopyToClipboard.js](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/hooks/useCopyToClipboard.js)
*   **Propósito:** Hook personalizado de React para interactuar con la API del portapapeles (`navigator.clipboard`) e implementar un estado temporal de "copiado" con restablecimiento automático de estado tras un intervalo de tiempo.
*   **Lógica de Funciones:**
    1.  `useCopyToClipboard`:
        *   *Parámetros:* `resetInterval` (entero - milisegundos para reset, por defecto 2000).
        *   *Qué hace:* Maneja estados `copiedValue` (valor copiado) y `isCopied` (booleano). Declara la función `copy` con `useCallback` que valida si el tipo de valor es string o number, escribe en el portapapeles del navegador del usuario con `navigator.clipboard.writeText`, y activa los estados. Un `useEffect` define el temporizador que desactiva el estado `isCopied` tras cumplirse el intervalo, y limpia el timer al desmontarse.
        *   *Retorna:* Array estructurado conteniendo `[isCopied, copy, copiedValue]`.
*   **Conexiones:**
    *   Consume la API web nativa `navigator.clipboard`.

### 3.12 [useToast.js](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/hooks/useToast.js)
*   **Propósito:** Hook personalizado de React que maneja el ciclo de vida de los mensajes de alerta (toasts) emergentes globales del dashboard, soportando auto-ocultado y botones de acción secundaria con callbacks de retorno.
*   **Lógica de Funciones:**
    1.  `useToast`:
        *   *Parámetros:* Ninguno.
        *   *Qué hace:* Declara el estado `toast` estructurando sus propiedades: `isVisible`, `message`, `type` (info, success, warning o error), `actionText` y `onActionClick`. Controla mediante `timerRef` la referencia al temporizador del hilo de ejecución.
        *   `hideToast`:
            *   *Parámetros:* Ninguno.
            *   *Qué hace:* Pone `isVisible` en false y limpia el timer si existe.
            *   *Retorna:* Nada.
        *   `showToast`:
            *   *Parámetros:* `message` (string), `{ type, actionText, onActionClick, duration }` (objeto opcional).
            *   *Qué hace:* Limpia temporizadores previos. Pone `isVisible` en true inyectando el tipo, mensaje y acciones secundarias correspondientes. Lanza un temporizador que al expirar invoca `hideToast`.
            *   *Retorna:* Nada.
        *   *Retorna:* Objeto conteniendo `{ toast, showToast, hideToast }`.
*   **Conexiones:** Ninguna.

### 3.13 [App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx)
*   **Propósito:** Monolito principal y punto de orquestación de la Consola Central (Developer Cockpit). Maneja el estado global, navegación, autenticación de desarrolladores, el wizard de aprovisionamiento de clientes, visualización de métricas SaaS, trazabilidad de logs SSE, control de servidores de desarrollo locales y el centro de incidentes y paridad.
*   **Flujo de Usuario / Acciones:**
    *   **Login / Logout:** Formulario de acceso que autentica contra Firebase Auth o realiza un bypass si se selecciona el modo simulado (Sandbox).
    *   **Aprovisionamiento de nuevos clientes (Wizard de Creación):**
        *   Inputs para configurar el nombre, la plantilla core origen (`selectedTemplate`), color primario/secundario/fondo/fuente, token de telemetría, Firebase Config (.env.local), facturación DIAN electrónica y requisitos de personalización de IA.
        *   *Auto-detección:* Botón que llama a `handleAutoDetectConfig` para traer la config de Firebase en base al ID del proyecto.
        *   *Subida de Logo:* Carga una imagen local y la optimiza en el CLI.
        *   *Acciones de Error:* Botón de reintento de aprovisionamiento físico (`handleRetryCliProvisioning`) y de descarte de registro central (`handleDiscardPendingProvisioning`).
    *   **Control de Servidores Locales de Clientes (CRM):**
        *   Botones de encendido (`handleStartLocalServer`) y apagado (`handleStopLocalServer`) de subprocesos Vite (`npm run dev`) por cliente.
        *   Caja de logs y terminal drawer (`terminalLogs`) que expone logs en vivo conectando un stream SSE.
    *   **Detección de Cambios de Código (Drift / Paridad):**
        *   Visualización de la matriz de desvíos y drift global.
        *   Botones para ver Diff de cambios en archivos Git (`handleGitDiff`) y descartar cambios locales (`handleGitDiscard`).
    *   **Telemetría e Incidentes:**
        *   Solicitar telemetría manual a clientes específicos o a todos.
        *   Historial de incidentes de los clientes con diagnósticos detallados, trazabilidad del stack trace y visualización en vivo del código del error.
    *   **Cobros y Conciliaciones Contables:**
        *   Cambiar el estado de pago de las comisiones del periodo (`handleTogglePayment`).
        *   Modales y formularios de configuración de WhatsApp para enviar recordatorios y confirmaciones basados en plantillas customizables.
        *   Generación y descarga física de PDFs de soporte (recibos comisionales, conciliaciones consolidadas, directorio, métricas) llamando a `pdfService.js`.
*   **Lógica de Funciones:**
    1.  `App`: Componente maestro que contiene el estado global y renderiza la barra lateral y los diferentes paneles de contenido.
    2.  `InteractiveAmbientGlow`: Componente presentacional del fondo interactivo con físicas de mouse/giroscopio.
    3.  `toggleTheme`: Alterna entre temas claro/oscuro.
    4.  `handleLogoChange`: Lee el logo, lo codifica en Base64 y lo sube llamando a `/api/upload-logo`.
    5.  `validateFirebaseCreds`: Llama a `/api/firebase/validate` para certificar la validez del API key del cliente.
    6.  `handleAutoDetectConfig`: Interroga a `/api/firebase-config` para autocompletar credenciales del SDK de Firebase.
    7.  `handleRetryCliProvisioning`: Reintenta invocar `/api/create-project` para aprovisionar el disco si Firestore se creó pero el CLI falló.
    8.  `handleDiscardPendingProvisioning`: Borra el registro huérfano de Firebase.
    9.  `handleLogin` / `handleLogout`: Maneja autenticación del desarrollador.
    10. `handleTogglePayment`: Cambia el estado de pago del periodo de facturación en Firestore central (`reportesBilling`).
    11. `handleStartLocalServer` / `handleStopLocalServer`: Lanza peticiones HTTP POST para arrancar o detener el daemon de desarrollo Vite de una instancia.
    12. `fetchGlobalDrift`: Llama a `/api/project/drift/global` para mapear los desvíos del código.
    13. `handleGitDiscard`: Pide confirmación al usuario y llama por POST a `/api/git/discard` para descartar los cambios.
    14. `handleGitDiff`: Consulta GET a `/api/git/diff-file` para obtener la salida en crudo de Git.
    15. `handleRequestClientTelemetry`: Envía un documento de telemetría a Firestore central para gatillar el listener de recolección en los clientes.
*   **Conexiones:**
    *   API local de Express (`http://localhost:3001`):
        *   `GET /api/templates`
        *   `GET /api/library`
        *   `POST /api/upload-logo`
        *   `POST /api/firebase/validate`
        *   `GET /api/firebase-config`
        *   `POST /api/create-project`
        *   `GET /api/project/dev/status`
        *   `POST /api/project/dev/start`
        *   `POST /api/project/dev/stop`
        *   `GET /api/project/drift/global`
        *   `GET /api/project/drift` (Auditoría de drift downstream de un cliente con `buildAudit=true`)
        *   `POST /api/project/firebase/cors-setup` (Configurador automático de reglas CORS con caché de Storage)
        *   `GET /api/project/dev/logs-stream` (SSE)
        *   `GET /api/project/dependencies/install` (SSE)
        *   `POST /api/git/discard`
        *   `GET /api/git/diff-file`
        *   `GET /api/project/file`
    *   Firebase Services (Central de Control):
        *   Firebase Auth: Para autenticar el acceso del desarrollador.
        *   Firebase Firestore:
            *   `clientes_control`: Registra el estado de aprovisionamiento, nicho, versión instalada, banderas de suspensión, y métricas de drift (`consistencyScore`, `mismatchDeps`, `missingDeps`, `addedDeps`).
            *   `reportesBilling` / `cobros`: Consolidado mensual de ventas, comisiones facturadas y estado de pago de cada cliente.
            *   `app_failures`: Reportes automáticos de excepciones React en producción.
            *   `briefings`: Respuestas del Briefing Studio de preventa.
            *   `tokens` y `historial_respaldos`: Claves de comunicación de telemetría y logs de backups del sistema.












