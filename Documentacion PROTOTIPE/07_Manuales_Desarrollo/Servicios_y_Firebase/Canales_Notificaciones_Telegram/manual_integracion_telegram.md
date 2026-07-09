# 📡 Manual Técnico e Integración de la Consola de Telegram y Servidor de Notificaciones (PROTOTIPE)

Este manual documenta de forma unificada la arquitectura, endpoints de la API REST, motor de comandos interactivos, guías de configuración, whitelists de seguridad y herramientas de depuración asociadas a la **Consola de Control de Telegram y Servidor de Notificaciones** (`notification_server.js`) del ecosistema **PROTOTIPE**. 

Permite a los desarrolladores y operadores técnicos supervisar la salud de instancias SaaS, recibir alertas inteligentes de fallos en tiempo real y ejecutar tareas críticas de DevOps y control de versiones directamente desde chats corporativos de Telegram y Discord.

---

## 1. Arquitectura y Funcionamiento
El sistema de notificaciones omnicanal está diseñado bajo una arquitectura desacoplada de la interfaz gráfica y tolerante a fallos de red:

* **Orquestador CLI Bridge (`server.js`):** Expone endpoints REST locales blindados (puerto `3001`) para ejecutar las acciones físicas de desarrollo y Git.
* **Servidor de Notificaciones (`notification_server.js`):** Proceso NodeJS hijo levantado mediante `fork()` en el arranque del orquestador. Expone su API Express local en el puerto `5050`, escucha comandos interactivos de Telegram, administra las sesiones de los usuarios y consume la API local de `server.js` en el puerto `3001` (Bypass local).
* **Base de Datos (Firestore Central):** Persiste el estado de telemetría de las instancias clientes (reportes de facturación, pings de salud y logs de crashes).

```mermaid
graph TD
    User[Operador Técnico (Telegram)] <--> |HTTPS Commands / Callbacks| Bot[Bot de Telegram (Port 5050)]
    Bot <--> |REST Local / SSE| API[Orquestador CLI Bridge (Port 3001)]
    API <--> |Scripts PowerShell| Host[Sistema Local (Git, Vite, Playwright)]
    API <--> |SDK / Rules| Firebase[Google Firebase Central]
    Bot <--> |REST API / Pings| FS[Firestore Central]
```

### 1.1 Resiliencia contra Caídas y StrictMode
El proceso hijo de notificaciones se ejecuta de forma independiente. Si el subproceso finaliza inesperadamente por errores fuera de ciclo, el servidor padre detecta la salida y lo reinicia automáticamente en 5 segundos. Al apagarse el servidor CLI, este se encarga de matar limpiamente el proceso hijo enviándole una señal `SIGTERM`.

### 1.2 Bypass de Reglas y Autenticación Resiliente
En lugar de usar SDKs cliente tradicionales que requieren autenticación anónima insegura, el servicio lee la sesión activa del **Firebase CLI local** (`firebase-tools.json`). Utiliza el token de acceso de administrador OAuth2 para comunicarse directamente con la **Firestore REST API**, permitiendo consultar y actualizar las colecciones sin exponer credenciales en el cliente final.

---

## 2. Servidor Express (REST API) — Puerto `5050`
El servidor Express expone endpoints para la integración y enrutamiento inteligente de notificaciones:

### 📥 `POST /api/notify/telegram`
Envía mensajes planos o enriquecidos con HTML parse mode a un chat de Telegram.
- **Payload:** `{ text, chatId, token, channel }`
- **Comportamiento:** Si no se suministra token o chatId, los resuelve en caliente usando la configuración del canal especificado (`channel` de `notification_config.json`).

### 📥 `POST /api/notify/discord`
Envía mensajes enriquecidos con Markdown a un canal de Discord.
- **Payload:** `{ content, webhookUrl, channel }`

### 📥 `POST /api/notify/error` (Enrutamiento Inteligente de Fallos)
Recibe la traza detallada de un error desde cualquier aplicación del ecosistema y la despacha estructurada a los canales de crashes de Telegram y Discord con prioridad inmediata.
- **Payload:** `{ clientId, componentName, errorMessage, stackTrace, severity, errorLine }`
- **Formato de Alerta:**
  - **Emoji de Severidad:** 🔴 Crítico, 🟡 Medio, 🔵 Bajo.
  - Muestra el nombre comercial del cliente, componente visual fallido, línea del error e imprime la pila de llamadas (stacktrace) dentro de un bloque preformateado (`<code>` / `codeblock`).

### 📥 `POST /api/notify/job-complete` (Callback de Tareas Asíncronas)
Permite al Bridge notificar que una operación asíncrona (como compilación o despliegue) ha finalizado. El bot busca el mensaje interactivo original en `activeJobs` y lo edita en caliente in-place en Telegram con el resultado final.
- **Payload:** `{ jobId, status, message }`

---

## 3. Canales de Alertas y Alcance
El sistema soporta **5 canales independientes** para separar el tráfico de notificaciones. Si un subcanal no tiene credenciales configuradas, el microservicio utiliza de forma transparente los datos del **Canal General (Fallback)**.

| Canal | Propósito Técnico | Disparador Físico |
| :--- | :--- | :--- |
| **Canal General** | Notificaciones misceláneas y fallback general del sistema. | Eventos del sistema no clasificados. |
| **Crashes e Incidentes** | Telemetría de excepciones y estado de pings de salud. | Caídas de ping (Up/Down) y logs de error en `/api/notify/error`. |
| **Preventas y Leads** | Registro de preventa en el Briefing Studio. | Cuestionario completado y análisis de propuesta IA finalizado. |
| **Billing y Comisiones** | Facturación, mora de pago y reportes comisionales. | Sincronización de comisiones de Firebase y vencimiento de plazos. |
| **DevOps y Despliegues** | Integración continua, compilación y hosting. | Ejecución de `npm run build` y comandos de despliegue a Firebase. |

---

## 4. Guía de Configuración en Telegram

Para implementar la **Opción de Bots Dedicados**, sigue estos pasos estructurados:

### 4.1 Creación de los Bots en BotFather
Abre Telegram, busca al bot verificado **`@BotFather`** y crea los bots enviando el comando `/newbot`.
Asigna un nombre descriptivo y un username único terminado en `bot` para cada uno:
* **Bot General:** `@PrototipeSystemBot`
* **Bot de Crashes:** `@PrototipeCrashMonitorBot`
* **Bot de Preventas:** `@PrototipeBriefingBot`
* **Bot de Billing:** `@PrototipeBillingBot`
* **Bot de DevOps:** `@PrototipeDevOpsBot`

### 4.2 Obtención de los Chat IDs de Destino
* **Para Chats Privados (Solo tú):** Abre una conversación con el bot que creaste, pulsa **Iniciar** y luego consulta tu ID de usuario enviando un mensaje al bot auxiliar **`@userinfobot`** (ej: `882566128`).
* **Para Grupos Corporativos (Recomendado):** Crea tu grupo (ej: `[DevOps] Crashes e Incidentes`), añade a tu bot como miembro y añade temporalmente al bot **`@ShowJsonBot`** o realiza una consulta al endpoint de getUpdates del bot:
  ```text
  https://api.telegram.org/bot<TU_BOT_TOKEN>/getUpdates
  ```
  Busca el número de ID que empieza con un signo negativo (ej: `-1004435396668`).

---

## 5. Configuración de Seguridad (notification_config.json)
La configuración de acceso, whitelists y credenciales se encuentra en `Prototipe-CLI/notification_config.json`:

```json
{
  "telegramToken": "TU_TELEGRAM_BOT_TOKEN",
  "defaultChatId": "-123456789",
  "channels": {
    "sysadmin": "-100222333444",
    "crashes": "-100222333444",
    "billing": "-100555666777",
    "leads": "-100888999000"
  },
  "auth": {
    "allowedChatIds": ["-1004435396668", "-5276731536"],
    "adminChatIds": ["-1004435396668"]
  }
}
```

### 🛡️ Whitelist y Control de Acceso (RBAC)
Para proteger la infraestructura de ejecuciones no autorizadas, el bot consulta la configuración en caliente antes de procesar cualquier interacción mediante la función `isAuthorized(chatId, command)`:
1. **Filtro de Recepción General (`allowedChatIds`):** Si el Chat ID de donde proviene el mensaje no está en esta lista, el bot lo **ignora completamente** (silencio total). Esto evita spam en canales externos y protege el Privacy Mode.
2. **Filtro de Administración (`adminChatIds`):** Comandos que ejecutan procesos de sistema o alteraciones físicas en disco (despliegues, sandboxes, reinicio de servidores, diagnósticos) requieren que el remitente pertenezca a la whitelist de administradores. Si no pertenece, el bot responde con un log de error y deniega el acceso (`not_allowed`).
3. **Hot-Reload en Caliente (`getSystemConfig`):** La configuración local se lee y cachea del disco con una tolerancia de 2 segundos. Cualquier cambio en `notification_config.json` (nuevos administradores o tokens) es aplicado en caliente por el bot de inmediato sin requerir reinicios.

---

## 6. Catálogo de Comandos y Menús Interactivos

El bot dispone de botones inline para toda la navegación táctil, asegurando una **compresión circular de menús** (el usuario siempre dispone de un botón `🏠 Menú Principal` o `↩️ Volver` al menú anterior).

### 🩺 Módulo 1: Salud & Diagnóstico
* **`/status`** o **`/salud`**: Mapea en vivo el ping y latencia de carga PWA de los clientes activos hidratados en Firestore, cruzando datos con `clientes_control` para evitar duplicaciones obsoletas.
* **`/health`**: Monitoreo en caliente de instancias SaaS. Hace ping HTTP en paralelo a todas las URLs registradas en Firestore Central.
* **`/crashes`** o **`/errores`**: Muestra los últimos 5 fallos graves registrados en Firestore (`app_failures` / `error_logs`), indicando cliente, componente fallido, mensaje de excepción y fecha del incidente formateada localmente en español.
* **`/integrity`**: Realiza un diagnóstico de consistencia física (`Pre-flight`). Detecta desvíos de código en archivos compartidos (`codeDrifts`), tareas sin registrar en la hoja de ruta (`roadmapDrifts`) o playgrounds faltantes en el sandbox.
* **`/integrity_autofix`**: Inicia el pipeline de auto-curación en 4 etapas (autocure, fix-map-bulk, prune-drifts, scaffold-sandbox-bulk) para registrar automáticamente componentes faltantes y reparar la consistencia física del ecosistema.
* **`/logs`**: Lee las últimas 20 líneas del log de depuración `notification_server.log` en el host local.

### ⚙️ Módulo 2: DevOps, Hosting & Servidores
* **`/clientes`**: Lista todas las carpetas físicas de clientes registradas en el host CLI.
* **`/deploy`**: Presenta un menú táctil de clientes. Al seleccionar uno, compila localmente (`npm run build`) y ejecuta el despliegue de hosting a Firebase (`firebase deploy --only hosting`). Reporta el log en vivo mediante edición asíncrona de mensaje (`editJobMessage`).
* **`/devserver`**: Lista los proyectos y permite consultar si el servidor de desarrollo Vite local está activo, arrancar un servidor (`npm run dev`) o detenerlo remotamente.

### 🛠️ Módulo 3: Git & Versiones
* **`/git`**: Lista los repositorios core y clientes con un badge visual (`🔴` o `🟢`) si tienen cambios pendientes.
* **`/git_repo`**: Dashboard de control del repositorio seleccionado. Permite navegar a cambios, logs, commits locales sin push o publicar.
* **`/git_status`**: Detalle de archivos modificados con iconos de tipo de cambio (`📝`, `➕`, `🗑️`) y alerta crítica de fuga de secretos en archivos `.env`.
* **`/git_log`**: Muestra los últimos 5 commits locales y remotos.
* **`/git_unpushed`**: Muestra la lista de commits locales pendientes de subir a GitHub, validando si tienen el formato correcto (`isValid`) y el tag de roadmap.
* **`/git_push_confirm` (Pre-flight Enriched):**
  * Genera el mensaje de commit previsto (`generateAutoCommitMessage`) en base al Roadmap (`/api/roadmap`) y cambios físicos locales.
  * Muestra la rama de destino, la lista de archivos a subir, alertas de secretos `.env`, y confirma si se aplicará **Auto-Merge a main**.

### 📋 Módulo 4: Roadmap & Tareas
* **`/tasks`**: Muestra las tareas en desarrollo del roadmap local (`tareas_pendientes.md`) con botones rápidos para marcarlas como completadas.
* **`/tasks_completed`**: Historial de tareas finalizadas en el roadmap de desarrollo.
* **`/tasks_filter`**: Filtrado en caliente por dominio de negocio (Maestro, Clientes, Core).
* **`/tasks_search`**: Motor de búsqueda asíncrona en el roadmap.
* **`/addtask`**: Asistente interactivo de tres pasos para crear una tarea de roadmap en caliente desde Telegram.

### 🔌 Módulo 5: Configuración General & Telemetría
* **`/leads`** o **`/briefings`**: Lee los últimos 5 cuestionarios del Briefing Studio filtrando borradores incompletos (`progreso === 100` o `status === 'completed'`) y mostrando nombre de la empresa, cotización sugerida e ID de lead.
* **`/maintenance`**: Permite activar o desactivar el **Modo Mantenimiento** (página de pausa de servicio) en caliente para cualquiera de las instancias clientes individuales del ecosistema.
* **`/telemetria`**: Consulta interactiva del estado de facturación mensual y telemetría de cobros en Firestore Central.
* **`/telemetria_check`**: Reporte rápido de cobertura para validar qué clientes han transmitido telemetría el mes vigente.

---

## 7. Monitoreo Automatizado de Salud (Health Monitor Engine)
El bot cuenta con un monitor de pings automatizado que se ejecuta en segundo plano cada **5 minutos** (y de forma manual con `/health`):

### ⚙️ Flujo de Verificación:
1. Consulta la colección `clientes_control` de Firestore Central para obtener las instancias SaaS registradas.
2. Resuelve el nombre comercial y la URL física de producción de cada cliente usando la función `resolveClientInfo(c)`:
   - Prioriza `c.url` o `c.appUrl`.
   - Si no existen, verifica si existe el ID de Firebase en `c.firebaseConfig.projectId` para apuntar a `https://${projectId}.web.app`.
   - Si no, usa el document ID (clientId) por defecto: `https://${clientId}.web.app`.
3. Realiza solicitudes HTTP en paralelo utilizando `fetch` con un `AbortSignal.timeout(6000)` de 6 segundos.
4. Si la instancia responde correctamente, evalúa la latencia de red:
   - `< 2000ms`: **🟢 Online (Estable)**
   - `> 2000ms`: **🟡 Alerta (Latencia Elevada)**
5. Si responde OK, intenta descargar el manifiesto de la PWA (`manifest.webmanifest` o `manifest.json`) para certificar que la aplicación puede instalarse sin conexión.
6. Si la instancia no responde o devuelve un código de error HTTP, se marca como **🔴 Down (Caída)**.
7. **Control de Flap (Alertas Inteligentes):** Compara el estado actual con el estado anterior guardado en la colección central `health_checks`. Solo despacha alertas a los canales de crashes en Telegram/Discord cuando ocurre un cambio real de estado (transiciones de `up -> down` o `down -> up`), previniendo spam de alertas repetitivas.

---

## 8. Mitigación de Privacy Mode de Telegram en Grupos (Deep-Linking)
Debido a las políticas de seguridad de la API de Telegram, un bot no puede recibir texto plano libre enviado por un usuario dentro de un grupo (Privacy Mode activo).

Para recolectar descripciones de texto libre (por ejemplo, al crear tareas personalizadas con `/addtask` o realizar búsquedas):
1. **Redirección Deep-Link:** El bot genera un enlace privado con token de sesión en la botonera del grupo: `t.me/BotName?start=addtask_chatId_domain`.
2. **Activación de Chat Privado:** Al hacer clic, Telegram abre un chat privado con el bot y envía el comando de arranque `/start addtask_chatId_domain`.
3. **Flujo Interactivo (DM):** El bot intercepta el token, activa el estado de escucha `AWAITING_TEXT` en el chat privado y solicita al usuario escribir la descripción.
4. **Retorno al Grupo:** Una vez escrita, el bot confirma la creación de la tarea y envía el reporte de éxito de vuelta al grupo original.

---

## 9. Saneamiento de Ramas en Arquitectura Git
Para cumplir estrictamente con los estándares de control de versiones y evitar desvíos colaterales (como ramas `master` redundantes), se aplica la siguiente directiva unificada:

1. **Ramas Base Oficiales:** Todo repositorio del monorepo (`Maestro`, `dev-dashboard` y `App Ventas`) opera bajo:
   * **`main`:** Producción consolidada (anteriormente `master`).
   * **`develop`:** Desarrollo y desarrollo activo.
2. **Auto-Merge Condicional:** Los scripts de respaldo (`git_backup.ps1` y `subproject_backup.ps1`) tienen hardcodeado `$mainBranch = "main"`. Al pulsar **Publicar** desde Telegram, si el repositorio es del Core (no de cliente), los cambios se fusionan automáticamente a la rama `main` en GitHub tras el push.

---

## 10. Herramientas de Depuración y Diagnóstico Rápido
Para dar soporte y verificar la integridad del servidor de notificaciones, se disponen de las siguientes herramientas de terminal en la carpeta `scratch/`:

- **`node scratch/test_notify.js`:** Realiza un envío de prueba directo a través de los endpoints de la API REST local para certificar que la API Express en el puerto 5050 está levantada y respondiendo.
- **`node scratch/test_group_send.js`:** Fuerza una transmisión directa al grupo general de desarrollo (`-1004435396668`) utilizando el token de depuración para probar la conectividad de red con los servidores de Telegram.
- **`node scratch/test_all_bots_send.js`:** Audita en lote el estado de los bots del ecosistema enviándoles peticiones simultáneas.
- **`node scratch/list_procs.js`:** Lista los procesos Node activos en el sistema operativo local, facilitando la identificación del PID de `notification_server.js` ante bloqueos de puerto.
- **Diagnóstico de Puerto Ocupado (`EADDRINUSE`):** Si los logs muestran `listen EADDRINUSE: address already in use :::5050`, significa que hay otra instancia del bot huérfana. Ejecuta `node scratch/list_procs.js` para encontrar su PID y termínalo con `taskkill /F /PID [Id]`.
