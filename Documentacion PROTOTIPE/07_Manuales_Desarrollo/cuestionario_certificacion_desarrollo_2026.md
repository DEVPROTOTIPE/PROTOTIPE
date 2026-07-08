# 📝 Cuestionario de Certificación Técnica PROTOTIPE 2026

Este cuestionario de 20 preguntas está diseñado para evaluar y certificar el conocimiento técnico de desarrolladores humanos y agentes de Inteligencia Artificial antes de otorgarles permisos de escritura sobre el código del monorepo.

Las preguntas se basan estrictamente en la arquitectura de marca blanca, el CLI, las directivas de persistencia offline y las reglas inquebrantables de `AGENTS.md`.

---

## 🔀 Módulo 1: Arquitectura Multi-instancia y CLI (Bootstrap y Sincronización)

### 1. Durante el ciclo de vida de aprovisionamiento de un nuevo cliente, ¿qué herramienta utiliza el motor `generator.js` para redimensionar y optimizar automáticamente el logotipo comercial proporcionado?
*   [ ] A) Sharp CLI
*   [ ] B) Jimp
*   [ ] C) ImageMagick
*   [ ] D) Canvas nativo del navegador

### 2. Al finalizar el orquestamiento de creación de una instancia, ¿cuál es el propósito principal del subproceso `worker_create_project.js`?
*   [ ] A) Subir los cambios a GitHub inmediatamente.
*   [ ] B) Ejecutar la suite de pruebas Smoke Tests locales en un servidor temporal con Playwright para certificar que el bundle no arroja excepciones de React.
*   [ ] C) Sembrar la base de datos de producción con datos reales del cliente.
*   [ ] D) Sincronizar las reglas de CORS del Storage.

### 3. En el flujo de sincronización del Core hacia los shards de clientes (`sync_clients.js`), ¿cómo detecta el sistema las desviaciones o "drifts" en los archivos físicos?
*   [ ] A) Comparando la fecha de última modificación (mtime) de los archivos.
*   [ ] B) Usando `git diff` entre la rama del core y la rama del cliente.
*   [ ] C) Comparando los hashes MD5 del contenido de los archivos del cliente contra los de la plantilla.
*   [ ] D) Leyendo el archivo `core-manifest.json` del cliente.

### 4. ¿Qué ocurre de forma automatizada si el comando `npm run build` falla inmediatamente después de que `sync_clients.js` sobrescribe físicamente los archivos en la carpeta de un cliente?
*   [ ] A) El sistema lanza una alerta y deja los archivos rotos para corrección manual.
*   [ ] B) El sistema invoca automáticamente `rollbackBackup` para restaurar el estado original del cliente desde la carpeta temporal `.temp_backup_sync`.
*   [ ] C) El proceso ignora el error y procede a desplegar a Firebase Hosting.
*   [ ] D) El sistema reescribe automáticamente los imports usando expresiones regulares.

### 5. ¿En qué archivo inyecta dinámicamente el CLI Bridge las credenciales de Firebase del cliente y el token único de telemetría durante la inicialización?
*   [ ] A) En `firebase.json`
*   [ ] B) En `src/config/firebaseConfig.js`
*   [ ] C) En `config/settings` de Firestore
*   [ ] D) En `.env.local`

---

## 🎨 Módulo 2: Estándares de Diseño y UI Premium (AGENTS.md)

### 6. Según el "Design Integrity Guard", ¿qué elemento HTML está estrictamente prohibido para la creación de menús desplegables y por qué debe reemplazarse?
*   [ ] A) El elemento `<ul>`, debe reemplazarse por `<div>`.
*   [ ] B) El elemento `<select>` nativo, debe emplearse obligatoriamente `CustomSelect.jsx`.
*   [ ] C) El elemento `<datalist>`, debe reemplazarse por `<input type="search">`.
*   [ ] D) El elemento `<nav>`, debe reemplazarse por `Menu_Radial`.

### 7. ¿Cuál de las siguientes declaraciones de clases en Tailwind causará que el linter del pre-build (`verify_library_integrity.cjs`) falle la compilación por violar las reglas de marca blanca?
*   [ ] A) `bg-[var(--color-primary)]`
*   [ ] B) `text-[var(--color-text-muted)]`
*   [ ] C) `bg-emerald-500` o `bg-[#22c55e]`
*   [ ] D) `border-[var(--color-border)]`

### 8. Para prevenir el truncamiento visual (anti-clipping) en contenedores con desplazamiento (`overflow-x-auto` o `overflow-y-auto`) que albergan tarjetas con sombras de elevación o escalas en hover, ¿cuál es la regla obligatoria?
*   [ ] A) Aplicar `overflow: visible !important`.
*   [ ] B) Usar `z-index: 50` en cada tarjeta.
*   [ ] C) Aplicar paddings de holgura (mínimo `py-4` o `px-4`) dentro del contenedor de scroll.
*   [ ] D) Reducir el tamaño de la sombra (`shadow-sm`).

### 9. Bajo el estándar de responsividad Mobile-First, ¿cómo deben estructurarse por defecto los formularios y grupos de botones en PROTOTIPE?
*   [ ] A) En fila (`flex-row`) y hacer wrap en móviles.
*   [ ] B) Apilarse verticalmente en móviles (`flex-col`) y alinearse en fila (`sm:flex-row`) únicamente en pantallas más grandes.
*   [ ] C) Usar `grid-cols-2` en todas las resoluciones.
*   [ ] D) Usar anchos fijos de `w-[400px]` para garantizar la consistencia.

### 10. ¿Cuál es la forma obligatoria de solicitar confirmación al usuario ante una acción destructiva (ej. borrado de datos)?
*   [ ] A) Usar la función nativa `window.confirm()`.
*   [ ] B) Renderizar un div oculto con la advertencia.
*   [ ] C) Usar `alert()` seguido de la eliminación.
*   [ ] D) Requerir confirmación asíncrona mediante el hook `useAlertConfirm()`.

---

## 💾 Módulo 3: Base de Datos y Persistencia Offline (Firebase 3 capas y Dexie)

### 11. La arquitectura desacoplada obligatoria para funciones que interactúan con Firebase en PROTOTIPE se divide en tres capas lógicas. ¿Cuáles son?
*   [ ] A) Actions -> Reducers -> Components.
*   [ ] B) Repository (SDK Firebase) -> Service (Validación/Negocio) -> Hook (Estado UI).
*   [ ] C) Controller -> Model -> View.
*   [ ] D) API -> Middleware -> Template.

### 12. ¿En qué capa arquitectónica está estrictamente prohibido instanciar o invocar operaciones CRUD directas de Firebase (como `getDocs` o `onSnapshot`)?
*   [ ] A) En la capa Repository.
*   [ ] B) En los scripts de testing E2E.
*   [ ] C) En componentes de las carpetas `pages/` o `components/` (deben delegarse a Custom Hooks).
*   [ ] D) En los archivos `firebaseConfig.js`.

### 13. Frente a la necesidad de gestionar colas de outbox, registros de auditoría offline o sincronización de ventas, ¿qué tecnología es la única autorizada en lugar de localStorage?
*   [ ] A) SessionStorage.
*   [ ] B) Dexie.js / IndexedDB.
*   [ ] C) Cookies del navegador.
*   [ ] D) Archivos JSON estáticos locales.

### 14. Para prevenir fugas de memoria y asegurar la idempotencia contra el Strict Mode de React, ¿cómo deben gobernarse los listeners de tiempo real (`onSnapshot`)?
*   [ ] A) Suscribiéndolos en la raíz `index.html`.
*   [ ] B) Ejecutándolos sin dependencias en un `useEffect` vacío.
*   [ ] C) Controlándolos por `RealtimeQueryRegistry` condicionados a sesión activa y ejecutando su desmonte (`unsubscribe()`) al desmontar el componente o gancho.
*   [ ] D) Configurando un intervalo (`setInterval`) que reinicie la suscripción cada minuto.

### 15. En la arquitectura de 3 capas, ¿cuál es la responsabilidad exclusiva de la capa Service?
*   [ ] A) Conectarse físicamente con el SDK de Firebase.
*   [ ] B) Renderizar la interfaz visual de carga.
*   [ ] C) Validar los inputs con esquemas (ej. Zod/JS), orquestar y aplicar reglas de negocio antes de tocar la base de datos.
*   [ ] D) Retornar variables de estado a la vista.

---

## 🐈 Módulo 4: Resiliencia y Operaciones Git (Respaldos y Rollbacks)

### 16. Según el SYSTEM PROMPT (GEMINI.md), ¿qué regla aplica de forma absoluta a los comandos de descarte de código como `git restore`, `git checkout --` o `git reset --hard` ejecutados por la IA?
*   [ ] A) Están permitidos solo en ramas de desarrollo (`develop`).
*   [ ] B) Queda estrictamente prohibido ejecutarlos sin la confirmación explícita previa y por escrito del usuario.
*   [ ] C) Se pueden ejecutar libremente si la compilación de Vite falla.
*   [ ] D) Deben ejecutarse al inicio de cada sesión para asegurar un estado limpio.

### 17. Cuando el agente de IA experimenta fallos de compilación (`npm run build`) después de modificar archivos, ¿qué dicta el "Protocolo de Rollback Autónomo" como requisito de salida bloqueante?
*   [ ] A) Informar al usuario del error y esperar instrucciones.
*   [ ] B) Revertir automáticamente todos los archivos modificados en la sesión a su estado del día anterior.
*   [ ] C) Detener el protocolo, auto-corregir proactivamente los fallos en el mismo turno, y registrar la acción en la bitácora antes de dar por completada la tarea.
*   [ ] D) Forzar el despliegue ignorando la alerta de compilación.

### 18. En el script de respaldos de PowerShell, ¿cómo evita el sistema que Git trackee submódulos vacíos o bloquee repositorios inactivos sin eliminarlos del disco?
*   [ ] A) Agregándolos al `.gitignore` global de Windows.
*   [ ] B) Ejecutando `git rm --cached` recursivamente.
*   [ ] C) Renombrando temporal o recursivamente las carpetas `.git` anidadas a `.git-backup-temp`.
*   [ ] D) Moviéndolas a una unidad extraíble de forma temporal.

### 19. Si ocurre un conflicto durante la estrategia de Auto-Merge a producción (`main`) en el script `subproject_backup.ps1`, ¿cómo reacciona el sistema preventivamente?
*   [ ] A) Aborta de forma segura la fusión, finalizando con código de éxito (0) y una advertencia ("warning") para garantizar que el respaldo en la rama de desarrollo sí se complete de forma no disruptiva.
*   [ ] B) Lanza un error fatal, cierra la consola y revierte el commit de la rama de desarrollo.
*   [ ] C) Fuerza la resolución de conflictos borrando la versión de producción (`-X theirs`).
*   [ ] D) Detiene el servidor Vite y lanza una ventana interactiva de resolución de conflictos.

### 20. Para evitar que las recargas automáticas de Vite (HMR) fallen o causen bloqueos de "Acceso denegado" en Windows mientras el script de respaldos manipula directorios de Git, ¿qué configuración específica se integró globalmente?
*   [ ] A) `server.hmr.overlay = false`
*   [ ] B) `watch.ignored: ['**/.git-backup-temp**']` en todos los archivos `vite.config.js`.
*   [ ] C) `optimizeDeps.exclude = ['.git']`
*   [ ] D) Se detiene y reinicia el servicio Vite manualmente en cada archivo.

---

## 🗝️ Clave de Respuestas

| Pregunta | Respuesta Correcta | Justificación (Documentación PROTOTIPE) |
| :--- | :--- | :--- |
| **1** | B) Jimp | El motor `generator.js` utiliza la biblioteca Jimp para redimensionar, optimizar en Base64 y enmascarar los logotipos proporcionados por el cliente antes del scaffold. |
| **2** | B) Ejecutar la suite de pruebas Smoke Tests locales... | `worker_create_project.js` aísla los procesos pesados, entre ellos lanzar Chrome Headless vía Playwright para detectar errores de React en la PWA recién creada. |
| **3** | C) Comparando los hashes MD5... | `sync_clients.js` lee los archivos físicos de la plantilla y del cliente calculando su hash MD5 (`getFileHash`) para realizar copias diferenciales de máxima precisión. |
| **4** | B) El sistema invoca automáticamente `rollbackBackup`... | Si el build falla tras copiar los archivos downstream, la API lanza `rollbackBackup()` que restaura íntegramente los archivos físicos borrando los nuevos y recuperando desde la carpeta temporal de seguridad. |
| **5** | D) En `.env.local` | Las llaves de Firebase y el `VITE_DEVELOPER_TELEMETRY_TOKEN` se sanitizan e inyectan dinámicamente de forma exclusiva en el archivo de entorno `.env.local`. |
| **6** | B) El elemento `<select>` nativo... | Queda estrictamente prohibido usar elementos `<select>` nativos, forzando en su lugar el uso de componentes `CustomSelect.jsx` premium. |
| **7** | C) `bg-emerald-500` o `bg-[#22c55e]` | El Design Integrity Guard prohíbe explícitamente colores hardcodeados. Se deben consumir las variables CSS de marca HSL (ej: `bg-[var(--color-primary)]`). |
| **8** | C) Aplicar paddings de holgura... | Para evitar clipping en sombras o animaciones hover, todo contenedor de scroll debe incluir paddings internos de holgura (como `px-4` o `py-4`). |
| **9** | B) Apilarse verticalmente en móviles... | La regla de responsividad obliga al uso de `flex-col` para viewports pequeños y su escalado a `sm:flex-row` en pantallas amplias. |
| **10** | D) Requerir confirmación asíncrona mediante el hook `useAlertConfirm()` | Los métodos `alert()` y `confirm()` nativos están censurados; toda eliminación debe pasar por la interfaz del modal promesificado. |
| **11** | B) Repository -> Service -> Hook | Es el estándar de arquitectura en 3 capas del ecosistema: Repository (SDK Firebase), Service (Dominio/Lógica de negocio), y Hook (Estado reactivo). |
| **12** | C) En componentes de las carpetas `pages/` o `components/` | Las vistas presentacionales no pueden contener lógica de datos base; deben delegar esas consultas de Firebase al Custom Hook de la feature. |
| **13** | B) Dexie.js / IndexedDB | El uso de `localStorage` para transacciones o colas offline está vetado, destinándose únicamente Dexie.js o IndexedDB por su carácter asíncrono y soporte transaccional. |
| **14** | C) Controlándolos por `RealtimeQueryRegistry`... | Los observadores `onSnapshot` deben cancelarse limpiamente vía `unsubscribe()` al desmontarse, controlando la concurrencia que inyecta React en modo estricto. |
| **15** | C) Validar los inputs con esquemas... | El Service es la capa de dominio pura que contiene reglas de validación (usando Zod), pre-cálculo y transformación independiente de la vista y la conexión. |
| **16** | B) Queda estrictamente prohibido ejecutarlos sin la confirmación... | `AGENTS.md` impone que ninguna operación destructiva del árbol de trabajo (`git restore`, `git reset`) ocurra desatendida, es un mandato crítico. |
| **17** | C) Detener el protocolo, auto-corregir proactivamente... | La IA no debe ceder el turno al usuario pasivamente ante compilaciones fallidas; debe aplicar correcciones y linter proactivamente hasta lograr un build limpio como bloqueante de salida. |
| **18** | C) Renombrando temporal o recursivamente las carpetas `.git`... | Al invocar `subproject_backup.ps1`, el motor renombra temporalmente la carpeta `.git` anidada a `.git-backup-temp` para que el `git add` no falle tratando las carpetas como submódulos muertos. |
| **19** | A) Aborta de forma segura la fusión, finalizando con código de éxito... | Previene que fallos de Auto-Merge tiren la persistencia del script completo, lanzando warning de colisión remota pero asegurando que la rama local suba su respaldo a GitHub. |
| **20** | B) `watch.ignored: ['**/.git-backup-temp**']` | Esta regla en Vite evita reloads y el fatal error de EPERM en Windows ("Acceso denegado") al momento de renombrar las carpetas Git por debajo del hilo de Node.js. |
