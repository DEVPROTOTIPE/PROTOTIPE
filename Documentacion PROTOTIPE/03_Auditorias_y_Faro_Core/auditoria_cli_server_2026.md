# Reporte de Auditoría Técnica: Prototipe CLI & Bridge Server

Este documento presenta una auditoría técnica detallada sobre la seguridad, robustez, rendimiento y usabilidad de la suite de herramientas del desarrollador de Prototipe, enfocándose en el backend del CLI Bridge (`server.js`, `generator.js`) y la interfaz administrativa local del Dashboard.

---

## Hallazgos de Seguridad y Robustez

### 1. Inyección de Comandos Shell en Aprovisionamiento Automatizado
* **Tipo:** Seguridad (Inyección de Comandos)
* **Severidad:** 🔴 Crítica
* **Ubicación exacta:** `server.js` (Línea 373, 386, 405, 416 y 115)
* **Causa raíz:** Las variables como `answers.projectName` provienen del cliente y se interpolan directamente en cadenas ejecutadas por `execAsync` (ej: `` `firebase projects:create ${finalProjectId} --display-name "${answers.projectName}"` ``). Si el nombre del proyecto contiene comillas dobles y caracteres de control de consola (como `&`, `|` o `;`), un atacante podría ejecutar comandos arbitrarios en el servidor local del desarrollador.
* **Solución concreta:** Sanitizar y escapar adecuadamente `answers.projectName` eliminando comillas dobles, comillas simples, caracteres especiales de redirección y limitando el string a caracteres alfanuméricos básicos, espacios y guiones antes de pasarlo a cualquier ejecución de consola.

### 2. Path Traversal en el Extractor de Componentes
* **Tipo:** Seguridad (Acceso Deficiente a Archivos)
* **Severidad:** 🟠 Alta
* **Ubicación exacta:** `server.js` (Líneas 714-726)
* **Causa raíz:** El parámetro `sourceFilePath` se resuelve directamente usando `path.resolve(cleanSourcePath)`. No existe ninguna validación que restrinja esta ruta a la raíz del espacio de trabajo de Prototipe. Un cliente malicioso podría solicitar la lectura de cualquier archivo confidencial del sistema operativo (ej: claves ssh, archivos del sistema) subiendo la ruta relativa de escape.
* **Solución concreta:** Validar mediante `path.relative` que la ruta absoluta del archivo de origen esté contenida estrictamente dentro de la carpeta raíz de trabajo `getWorkspaceRoot()`.

### 3. Exclusiones de Git y Fuga de Secretos en Aprovisionamiento
* **Tipo:** Robustez / Seguridad de Datos
* **Severidad:** 🟠 Alta
* **Ubicación exacta:** `generator.js` (Creación de `.env.local` y vinculación git)
* **Causa raíz:** Cuando se crea una nueva instancia de cliente, se copian las credenciales reales de Firebase en el archivo `.env.local`. Si la inicialización del repositorio git del cliente no configura un archivo `.gitignore` robusto que excluya explícitamente `.env.local` y `.firebaserc`, estas credenciales sensibles podrían ser subidas accidentalmente a repositorios públicos de GitHub mediante comandos automatizados de subida.
* **Solución concreta:** Asegurar que el generador cree o valide la existencia de un `.gitignore` en la raíz del proyecto recién creado que contenga de forma mandatoria `.env.local`, `.firebase/`, `node_modules/` y `.firebaserc`.

---

## Hallazgos de Rendimiento y Código

### 4. Re-renders Masivos en el Panel de Administración de Cores
* **Tipo:** Rendimiento (React Rendering)
* **Severidad:** 🟡 Media
* **Ubicación exacta:** `CoreManagerPanel.jsx` (Dashboard)
* **Causa raíz:** Toda la lógica de control del estado dinámico (auditData, envVars, deployLogs, variables de polling, etc.) se encuentra centralizada a nivel de padre (`CoreManagerPanel`). Al actualizar las logs de despliegue en tiempo real a través de EventSource (SSE), el flujo continuo de mensajes desencadena re-renders continuos de la lista entera de cores y sus subcomponentes, ralentizando la UI.
* **Solución concreta:** Factorizar las filas/tarjetas de cada Core en un componente independiente `CoreCard.jsx` que encapsule sus propios estados locales de polling, logs, auditoría y carga. De esta forma, el streaming de logs de un core solo redibuja el panel interior del componente específico de ese core.

### 5. Bloqueo de Conexiones por Falta de Timeout en Auditoría E2E
* **Tipo:** Robustez / Rendimiento
* **Severidad:** 🟡 Media
* **Ubicación exacta:** `server.js` (Ejecución de test suites dinámicas)
* **Causa raíz:** El endpoint `/api/e2e/run` inicia procesos de ejecución de Playwright en segundo plano y realiza streaming de logs a través de SSE. Si el proceso de pruebas se congela o entra en un loop por un error en el código de la plantilla, no existe un mecanismo de "Hard Timeout" en el backend para matar el proceso de Playwright de forma imperativa, dejando el proceso colgado en memoria.
* **Solución concreta:** Añadir un parámetro de timeout configurativo en la ejecución de `spawn/exec` de las suites de pruebas para matar forzosamente el proceso hijo si supera los 3 minutos de ejecución.

---

## Hallazgos de UI/UX y Funcionalidad

### 6. Ausencia de Confirmación en Operaciones Destructivas de Variables de Entorno
* **Tipo:** UX (Prevención de Errores)
* **Severidad:** 🟢 Baja
* **Ubicación exacta:** `CoreManagerPanel.jsx` (Editor de variables `.env.local`)
* **Causa raíz:** Al hacer clic en el botón rojo de eliminación (`X`) junto a una variable de entorno, la fila se elimina del estado local de inmediato sin confirmación alguna. Un clic accidental obligaría al usuario a recargar la página perdiendo otros cambios sin guardar.
* **Solución concreta:** Mostrar un modal de confirmación rápida o exigir doble clic/confirmación visual antes de eliminar la fila del estado activo del editor.

### 7. Auditoría PWA Basada únicamente en Presencia Estructural
* **Tipo:** Funcionalidad / Completitud
* **Severidad:** 🟡 Media
* **Ubicación exacta:** `server.js` (Función `runAuditInternal`)
* **Causa raíz:** La auditoría marca el Service Worker y el Manifest como "exitosos" simplemente validando que el archivo físico exista en la carpeta `dist`. No valida si el archivo `manifest.json` contiene la estructura JSON válida requerida, ni si el Service Worker puede compilarse correctamente.
* **Solución concreta:** Leer y parsear el archivo `manifest.json` para validar que contenga propiedades requeridas como `start_url` y `icons` válidos. Validar que la compilación de `sw.js` no tenga errores de sintaxis críticos.
