# Manual de Integración y Consola Remota de Telegram

Este manual describe la arquitectura técnica, configuración, flujo operativo y catálogo de comandos de la **Consola de Control Remota de Telegram** del ecosistema **PROTOTIPE**. Esta consola permite monitorear y administrar las operaciones críticas de desarrollo y producción (DevOps, Git, Base de Datos, y Mantenimiento) directamente desde un chat o grupo de Telegram.

---

## 1. Arquitectura del Servidor de Notificaciones
La consola de Telegram se implementa en un esquema de **3 Capas** desacoplado de la interfaz gráfica del Dashboard React, comunicándose a través de la API REST del orquestador local.

### Componentes Core
* **Orquestador CLI (`server.js`):** Expone endpoints REST locales blindados (puerto `3001`) para ejecutar las acciones físicas de desarrollo.
* **Servidor de Notificaciones (`notification_server.js`):** Proceso NodeJS hijo levantado mediante `fork()` en el arranque del orquestador. Escucha comandos interactivos de Telegram, administra las sesiones de los usuarios, y consume la API local de `server.js` en el puerto `3001` (Bypass local).
* **Base de Datos (Firestore):** Persiste el estado de telemetría de las instancias clientes (pings de salud PWA).

```mermaid
graph TD
    User[Operador Técnico (Telegram)] <--> |HTTPS Commands / Callbacks| Bot[Bot de Telegram (Port 5050)]
    Bot <--> |REST Local / SSE| API[Orquestador CLI Bridge (Port 3001)]
    API <--> |Scripts PowerShell| Host[Sistema Local (Git, Vite, Playwright)]
    API <--> |SDK / Rules| Firebase[Google Firebase Central]
```

---

## 2. Configuración y Seguridad
La configuración de acceso y credenciales se encuentra en `Prototipe-CLI/notification_config.json`:

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
    "allowedChatIds": ["12345678", "-100222333444"],
    "adminChatIds": ["12345678"]
  }
}
```

### Directivas de Hardening y Whitelist
1. **Filtro de IP y Chat ID (`isAuthorized`):** El bot verifica que el `chatId` del remitente esté declarado en `allowedChatIds`. Si no está registrado, el bot permanece en absoluto silencio.
2. **Acciones Administrativas Requeridas:** Los comandos destructivos o de despliegue a producción (como `/deploy`, `/integrity_autofix`, `/maintenance`) validan que el `chatId` del operador esté en `adminChatIds`. Si no tiene permisos, aborta con `❌ Permisos insuficientes`.
3. **Resiliencia contra StrictMode y Caídas:** El proceso hijo se levanta con observabilidad de fallos. Si `notification_server.js` arroja una excepción fatal, el orquestador padre captura el evento y lo re-levanta en 5 segundos automáticamente.

---

## 3. Catálogo de Comandos y Menús Interactivos

El bot dispone de botones inline para toda la navegación táctil, asegurando una **navegación circular perfecta** (el usuario siempre dispone de un botón `↩️ Volver` al menú anterior o `🏠 Menú` principal).

### 🩺 Módulo 1: Salud & Diagnóstico
* `/status`: Mapea en vivo el ping y latencia de carga PWA de los clientes activos hidratados en Firestore, reportando promedios y caídas en caliente.
* `/crashes`: Muestra los últimos 5 fallos de telemetría o excepciones capturados por los clientes, indicando fecha, cliente afectado y traza de error resumida.
* `/integrity`: Realiza un diagnóstico de consistencia física (`Pre-flight`). Detecta desvíos de código en archivos compartidos (`codeDrifts`), tareas sin registrar en la hoja de ruta (`roadmapDrifts`) o playgrounds faltantes en el sandbox.
* `/integrity_autofix`: Inicia el pipeline de auto-curación para registrar automáticamente componentes faltantes y reparar la consistencia. Al finalizar, ofrece accesos inline para volver al diagnóstico.

### ⚙️ Módulo 2: DevOps, Hosting & Servidores
* `/clientes`: Lista todas las carpetas físicas de clientes registradas en el host CLI.
* `/deploy`: Presenta un menú táctil de clientes. Al seleccionar uno, compila localmente (`npm run build`) y ejecuta el despliegue de hosting a Firebase (`firebase deploy --only hosting`). Reporta el log en vivo mediante edición asíncrona de mensaje (`editJobMessage`).
* `/devserver`: Lista los proyectos y permite consultar si el servidor de desarrollo Vite local está activo, arrancar un servidor (`npm run dev`) o detenerlo remotamente.
* `/logs`: Lee las últimas 20 líneas del log del servidor activo en disco para auditorías rápidas sin ssh.

### 🛠️ Módulo 3: Git & Versiones (Paridad al 100%)
* `/git`: Lista los repositorios core y clientes con un badge visual (`🔴` o `🟢`) si tienen cambios pendientes.
* `/git_repo`: Dashboard de control del repositorio seleccionado. Permite navegar a cambios, logs, commits locales sin push o publicar.
* `/git_status`: Detalle de archivos modificados con iconos de tipo de cambio (`📝`, `➕`, `🗑️`) y alerta crítica de fuga de secretos en archivos `.env`.
* `/git_log`: Muestra los últimos 5 commits locales y remotos.
* `/git_unpushed`: Muestra la lista de commits locales pendientes de subir a GitHub, validando si tienen el formato correcto (`isValid`) y el tag de roadmap.
* `/git_push_confirm` **(Pre-flight Enriched):** 
  * Genera el mensaje de commit previsto (`generateAutoCommitMessage`) en base al Roadmap (`/api/roadmap`) y cambios físicos locales (ej. `CLI-350: [develop] 2026-07-09 — Mod: tareas_pendientes.md`).
  * Muestra la rama de destino, la lista de archivos a subir, alertas de secretos `.env`, y confirma si se aplicará **Auto-Merge a main** (fusión automática a producción remota en GitHub).

### 📋 Módulo 4: Roadmap & Tareas
* `/tasks`: Muestra las tareas en desarrollo del roadmap local (`tareas_pendientes.md`) con botones rápidos para marcarlas como completadas.
* `/addtask`: Wizard de tres pasos interactivos para crear una tarea de roadmap en caliente desde Telegram:
  1. Selección de dominio (Maestro, Dashboard, Clientes).
  2. Selección de categoría.
  3. Selección de plantilla predefinida de desarrollo o redacción libre.

### 🔧 Módulo 5: Configuración General
* `/maintenance`: Permite activar o desactivar el **Modo Mantenimiento** (página de pausa de servicio) en caliente para cualquiera de las instancias clientes individuales del ecosistema.

---

## 4. Mitigación de Privacy Mode de Telegram en Grupos
Debido a las políticas de seguridad de la API de Telegram, un bot no puede recibir texto plano libre enviado por un usuario dentro de un grupo (Privacy Mode activo).

Para recolectar descripciones de texto libre (por ejemplo, al crear tareas personalizadas con `/addtask` o realizar búsquedas):
1. **Redirección Deep-Link:** El bot genera un enlace privado con token de sesión en la botonera del grupo: `t.me/BotName?start=addtask_chatId_domain`.
2. **Activación de Chat Privado:** Al hacer clic, Telegram abre un chat privado con el bot y envía el comando de arranque `/start addtask_chatId_domain`.
3. **Flujo Interactivo (DM):** El bot intercepta el token, activa el estado de escucha `AWAITING_TEXT` en el chat privado y solicita al usuario escribir la descripción.
4. **Retorno al Grupo:** Una vez escrita, el bot confirma la creación de la tarea y envía el reporte de éxito de vuelta al grupo original.

---

## 5. Saneamiento de Ramas en Arquitectura Git
Para cumplir estrictamente con los estándares de control de versiones y evitar desvíos colaterales (como ramas `master` redundantes), se aplica la siguiente directiva unificada:

1. **Ramas Base Oficiales:** Todo repositorio del monorepo (`Maestro`, `dev-dashboard` y `App Ventas`) opera bajo:
   * **`main`:** Producción consolidada (anteriormente `master`).
   * **`develop`:** Desarrollo y desarrollo activo.
2. **Auto-Merge Condicional:** Los scripts de respaldo (`git_backup.ps1` y `subproject_backup.ps1`) tienen hardcodeado `$mainBranch = "main"`. Al pulsar **Publicar** desde Telegram, si el repositorio es del Core (no de cliente), los cambios se fusionan automáticamente a la rama `main` en GitHub tras el push.
