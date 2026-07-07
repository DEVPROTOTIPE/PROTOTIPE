# 🛡️ Informe de Auditoría de Seguridad y Robustez de Aprovisionamiento (CLI Backend)

**Fecha:** 2026-07-01  
**Auditor:** Especialista en Seguridad Informática & Auditor Senior de Código  
**Estado:** Diagnóstico Técnico de Vulnerabilidades Críticas de Seguridad y Concurrencia en `Prototipe-CLI`

---

## 📋 Resumen Ejecutivo

Este informe documenta las vulnerabilidades de seguridad, condiciones de carrera y fallas de robustez identificadas durante la inspección del backend de aprovisionamiento en `Prototipe-CLI/server.js`, `Prototipe-CLI/worker_create_project.js` y `Prototipe-CLI/generator.js`.
Se detectaron **6 vulnerabilidades de severidad Crítica** (3 inyecciones de comandos, 3 path traversals) y varios riesgos de concurrencia y caídas del servidor que comprometen la integridad de la infraestructura multitenant de PROTOTIPE.

---

## 🔍 Hallazgos de Seguridad (Vulnerabilidades)

### 1. Inyección de Comandos Shell en `/api/firebase-config` (projectName)
* **Tipo:** Command Injection (Inyección de Comandos)
* **Severidad:** 🚨 Crítico
* **Ubicación exacta:** [server.js:L256-261](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L256-L261)
* **Causa raíz:** El endpoint `/api/firebase-config` acepta el parámetro de query `projectName` del usuario. Solo aplica un reemplazo ineficaz de comillas dobles y diagonales invertidas (`.replace(/["\\]/g, '')`), dejando operadores lógicos de shell (`&`, `|`, `;`, `$`, etc.) intactos. Luego, concatena esta variable directamente dentro del comando ejecutado por `execAsync` en una shell:
  ```javascript
  const appDisplayName = (projectName || safeProjectId).replace(/["\\]/g, '');
  await execAsync(
    `firebase apps:create web "${appDisplayName}" --project ${safeProjectId}`,
    { timeout: 60000 }
  );
  ```
  Si se pasa `projectName` como `& calc.exe`, la shell en Windows ejecutará `calc.exe` bajo el contexto del servidor Node.js.
* **Solución concreta:** Usar `spawn` o `execFile` con argumentos separados en un array (que inhabilita la interpretación de comandos shell), o validar de manera restrictiva el input mediante una expresión regular estricta:
  ```javascript
  const safeProjectName = (projectName || '').trim();
  if (safeProjectName && !/^[a-zA-Z0-9\s\-_]+$/.test(safeProjectName)) {
    return res.status(400).json({ error: 'El nombre del proyecto contiene caracteres no permitidos.' });
  }
  ```

---

### 2. Inyección de Comandos Shell en `deployFirebase` (firebaseProjectId)
* **Tipo:** Command Injection (Inyección de Comandos)
* **Severidad:** 🚨 Crítico
* **Ubicación exacta:** [generator.js:L1689-1695](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L1689-L1695)
* **Causa raíz:** En la fase de despliegue (`deployFirebase`), se inyecta directamente `answers.firebaseProjectId` en la string enviada a `execSync`:
  ```javascript
  execSync(
    `firebase deploy --only firestore:rules,firestore:indexes,storage,hosting -P ${answers.firebaseProjectId}`,
    { ... }
  );
  ```
  Dado que el endpoint `/api/create-project` no realiza ninguna validación de inyección para el campo `answers.firebaseProjectId` si `answers.autoProvisionFirebase === false` (aprovisionamiento manual), un atacante puede enviar un ID malicioso como `mi-proyecto & calc.exe` que se ejecutará en la consola del servidor.
* **Solución concreta:** Usar `spawnSync` en lugar de `execSync` pasando los argumentos ordenados como array:
  ```javascript
  const args = ['deploy', '--only', 'firestore:rules,firestore:indexes,storage,hosting', '-P', answers.firebaseProjectId];
  execSync('firebase', args, { cwd: targetDir, stdio: ['ignore', 'ignore', 'pipe'], timeout: 180000 });
  ```
  O alternativamente, sanitizar de forma estricta el ID de Firebase para permitir únicamente caracteres alfanuméricos y guiones:
  ```javascript
  if (!/^[a-z0-9\-]+$/.test(answers.firebaseProjectId)) {
    throw new Error('Project ID de Firebase inválido.');
  }
  ```

---

### 3. Inyección de Comandos Shell en `executeCreationTaskInBackground` (finalProjectId)
* **Tipo:** Command Injection (Inyección de Comandos)
* **Severidad:** 🚨 Crítico
* **Ubicación exacta:** [server.js:L455](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L455)
* **Causa raíz:** El script concatena directamente la variable `finalProjectId` en la ejecución de comandos:
  ```javascript
  await execAsync(`firebase projects:create ${finalProjectId} --display-name "${answers.projectName}"`, { timeout: 180000 });
  ```
  `finalProjectId` deriva de `answers.firebaseProjectId` (que no es sanitizado si se recibe en el payload inicial en la API `/api/create-project`). Un atacante puede colar código shell.
* **Solución concreta:** Sanitizar `answers.firebaseProjectId` en el controlador de la petición en `server.js`:
  ```javascript
  if (answers.firebaseProjectId) {
    answers.firebaseProjectId = answers.firebaseProjectId.trim().replace(/[^a-z0-9\-]/gi, '');
  }
  ```

---

### 4. Local File Inclusion (LFI) y Fuga de Secretos vía `answers.logoPath`
* **Tipo:** Directory Traversal / Fuga de Archivos Confidenciales
* **Severidad:** 🚨 Crítico
* **Ubicación exacta:** [generator.js:L947-957](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L947-L957)
* **Causa raíz:** El generador acepta una ruta de archivo local en `answers.logoPath` para copiarla a los assets de la instancia. El backend comprueba si el archivo existe y si la extensión es válida (ej. `.svg`), y luego lo copia al directorio público del proyecto (`fs.copy`).
  Si un atacante envía una ruta absoluta como `C:\Users\Sergio\.ssh\id_rsa.svg` (cambiándole la extensión o aprovechando que es una clave SSH), el backend copiará esa clave SSH privada a los assets del cliente. Dado que el proyecto es comiteado en GitHub o subido al Hosting público, esto expone credenciales críticas del servidor.
* **Solución concreta:** Validar que la ruta de origen `answers.logoPath` resida estrictamente dentro de la carpeta temporal de cargas permitidas (`temp_uploads`), impidiendo lecturas en otras partes del disco duro:
  ```javascript
  const uploadDir = path.resolve(CLI_ROOT, 'temp_uploads');
  const resolvedLogoPath = path.resolve(answers.logoPath);
  if (!isPathContained(uploadDir, resolvedLogoPath)) {
    throw new Error('Acceso denegado: El logo debe estar almacenado en la carpeta temporal del servidor.');
  }
  ```

---

### 5. Directory Traversal en Carga de Plantillas (answers.template)
* **Tipo:** Path Traversal (Lectura Arbitraria de Carpetas)
* **Severidad:** 🚨 Crítico
* **Ubicación exacta:** [generator.js:L216](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L216) y [server.js:L208](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L208)
* **Causa raíz:** Se concatena `answers.template` (proveniente del request) para resolver la ruta origen:
  ```javascript
  const srcTemplateDir = path.join(TEMPLATES_DIR, answers.template);
  ```
  Un atacante puede pasar `template` como `../../../../secrets` y copiar directorios enteros fuera de la carpeta de plantillas a la instancia del cliente.
* **Solución concreta:** Añadir validación de contención física mediante `isPathContained` antes de proceder con la copia:
  ```javascript
  const srcTemplateDir = path.join(TEMPLATES_DIR, answers.template);
  if (!isPathContained(TEMPLATES_DIR, srcTemplateDir)) {
    throw new Error('Acceso denegado: Plantilla fuera de la ruta autorizada.');
  }
  ```

---

### 6. Path Traversal de Escritura Arbitraria en `/api/upload-logo` (filename)
* **Tipo:** Arbitrary File Write / Path Traversal
* **Severidad:** 🚨 Crítico
* **Ubicación exacta:** [server.js:L385-390](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L385-L390)
* **Causa raíz:** El endpoint recibe el nombre de archivo `filename` provisto por el usuario y lo junta con `uploadDir`:
  ```javascript
  const targetPath = path.join(uploadDir, filename);
  await fs.writeFile(targetPath, buffer);
  ```
  Si se pasa `filename` as `../../server.js`, sobreescribirá el código del servidor backend, provocando la destrucción del mismo o inyecciones maliciosas persistentes.
* **Solución concreta:** Extraer únicamente el nombre base del archivo ignorando rutas relativas:
  ```javascript
  const safeFilename = path.basename(filename);
  const targetPath = path.join(uploadDir, safeFilename);
  ```

---

### 7. Path Traversal en `/api/library/extract` (targetName)
* **Tipo:** Arbitrary File Write / Path Traversal
* **Severidad:** ⚠️ Medio
* **Ubicación exacta:** [server.js:L873-874](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L873-L874)
* **Causa raíz:** Se concatena `targetName` directamente para escribir el archivo markdown de documentación:
  ```javascript
  const componentFolder = path.join(categoryFolder, targetName);
  ```
  Si contiene `..`, puede escribir el markdown en rutas inesperadas del sistema.
* **Solución concreta:** Validar que `targetName` contenga exclusivamente caracteres alfanuméricos y guiones bajos:
  ```javascript
  if (!/^[a-zA-Z0-9_]+$/.test(targetName)) {
    return res.status(400).json({ error: 'Nombre de componente inválido.' });
  }
  ```

---

## 🔄 Concurrencia y Fallos Lógicos

### 1. Condiciones de Carrera al Aprovisionar Proyectos Simultáneos
* **Tipo:** Race Condition (Condición de Carrera)
* **Severidad:** ⚠️ Medio
* **Ubicación exacta:** [server.js:L540-616](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L540-L616) (/api/create-project)
* **Causa raíz:** No existe un mecanismo de encolado o exclusión mutua (`Lock`) cuando se inicia el aprovisionamiento de un proyecto en `/api/create-project`. Si se reciben múltiples peticiones HTTP concurrentes para el mismo `projectName`/`clientId`, se levantarán múltiples procesos hijos worker en paralelo que intentarán escribir simultáneamente en el mismo directorio de destino (`targetDir`). Esto provocará bloqueos de archivo (`EBUSY` / `EPERM` en Windows) o corrupción de datos en archivos críticos como `.env.local` o `package.json`.
* **Solución concreta:** Implementar exclusión mutua para cada `clientId` usando el objeto de sincronización existente `projectSyncLocks`:
  ```javascript
  if (projectSyncLocks[clientId]) {
    return res.status(409).json({ error: 'Ya existe una tarea de aprovisionamiento en curso para este cliente.' });
  }
  projectSyncLocks[clientId] = true;
  // Liberar el lock al terminar en executeCreationTaskInBackground (tanto en éxito como en fallo)
  // delete projectSyncLocks[clientId];
  ```

### 2. Riesgo de Caída del Servidor (TypeError) en SSE Listener Cleanup
* **Tipo:** Falla lógica / Error de referencia en tiempo de ejecución
* **Severidad:** ⚠️ Medio
* **Ubicación exacta:** [server.js:L651-653](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L651-L653)
* **Causa raíz:** Cuando un cliente cierra el streaming SSE, el handler intenta eliminar el objeto de respuesta del array de listeners:
  ```javascript
  req.on('close', () => {
    task.listeners = task.listeners.filter(l => l !== res);
  });
  ```
  Si por algún motivo la tarea es eliminada del mapa global de memoria a los 30 minutos por el timeout `registerTaskCleanup(taskId)` antes de que la conexión de red finalice por completo o si se invoca sobre una tarea ya expirada, la propiedad `task` podría no tener listeners instanciados o causar errores de referencia.
* **Solución concreta:** Validar que el objeto `task` y su propiedad `listeners` existan y correspondan a un array válido antes de proceder:
  ```javascript
  req.on('close', () => {
    if (task && Array.isArray(task.listeners)) {
      task.listeners = task.listeners.filter(l => l !== res);
    }
  });
  ```

---

## 🛠️ Recomendaciones de Robustez y Conclusión

1. **Migración a Spawn / Argumentos Seguros:** Evitar al máximo el uso de `exec` and `execSync` pasados por string en favor de funciones que no usen una shell implícita (`spawn` / `spawnSync`) para todas las llamadas a herramientas externas (Firebase CLI, NPM, Git CLI).
2. **Implementar Validación Defensiva de Inputs:** Aplicar filtros estrictos de lista blanca (`White-listing`) en todos los campos que interactúan con rutas físicas (`template`, `logoPath`, `filename`) o que se usan para derivar directorios del sistema.
3. **Mecanismo de Bloqueo de E/S por Cliente:** Proteger el motor de aprovisionamiento contra peticiones duplicadas e inconsistencias del sistema de archivos a través de un semáforo lógico en memoria.
