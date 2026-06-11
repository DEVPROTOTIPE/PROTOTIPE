# 🔍 Reporte de Auditoría Técnica: Flujo de Automatización, CLI y Scripts de Respaldo

> **Documento de Diagnóstico Activo**
> **Fecha:** 2026-06-11
> **Severidad General:** 🔴 CRÍTICA (Bloqueos de aprovisionamiento y fallos de git)

Este informe presenta los hallazgos de la auditoría técnica realizada sobre el flujo completo de automatización del ecosistema PROTOTIPE (CLI Bridge Server, Generador, Scripts de Respaldo y Flujo de Aprovisionamiento). Se identificaron **3 bugs críticos** de ejecución y **1 cuello de botella arquitectónico** que impiden la correcto funcionamiento del sistema.

---

## 🚨 Hallazgos Críticos Detectados

### 1. Variables Indefinidas en la Generación de Reglas de Storage (ReferenceError)
* **Tipo:** Bug de Ejecución (Crash)
* **Severidad:** 🔴 CRÍTICO
* **Ubicación:** [generator.js:L411-L412](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L411-L412)
* **Causa Raíz:** El generador intenta escribir las reglas físicas de Firebase Storage y marcar el éxito del spinner (`step5_2`), pero las variables `storageRulesContent` y `step5_2` **no están definidas en ningún punto del script**. Al ejecutar la inicialización de cualquier proyecto, Node.js lanza un `ReferenceError` y aborta el flujo de aprovisionamiento a la mitad.
* **Solución Propuesta:** 
  Definir e inicializar correctamente el spinner y el contenido de las reglas de Storage:
  ```javascript
  const step5_2 = ora('Generar reglas de Storage storage.rules').start();
  const storageRulesContent = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
`;
  ```

### 2. Uso de Variable `initials` Antes de su Definición (ReferenceError)
* **Tipo:** Bug de Ejecución (Crash)
* **Severidad:** 🔴 CRÍTICO
* **Ubicación:** [generator.js:L555](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L555) y [L565](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L565)
* **Causa Raíz:** Se asigna `manifest.short_name = initials` al configurar el PWA manifest en la línea 555, pero la variable `initials` se declara mucho más tarde en la línea 638. Esto genera un fallo de referencia en tiempo de ejecución al inicializar la PWA.
* **Solución Propuesta:** Mover la extracción de iniciales al inicio del método `createProject` (alrededor de la línea 120):
  ```javascript
  const initials = (answers.projectName || 'P')
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3) || 'P';
  ```

### 3. Falso Conflicto de Git al Respaldar Ramas Nuevas (Fallo de Backup)
* **Tipo:** Bug de Lógica / Control de Versiones
* **Severidad:** 🔴 CRÍTICO
* **Ubicación:** [subproject_backup.ps1:L161-171](file:///d:/PROTOTIPE/subproject_backup.ps1#L161-L171) y [git_backup.ps1:L234-L245](file:///d:/PROTOTIPE/git_backup.ps1#L234-L245)
* **Causa Raíz:** Los scripts de PowerShell ejecutan `git pull origin $branchName` de forma preventiva. Sin embargo, para repositorios recién creados o ramas nuevas locales que no existen en GitHub (origin), el comando `git pull` falla de forma natural. El script interpreta cualquier código de salida no-cero como un conflicto de merge, deshace el commit local con `git reset --soft HEAD~1` y aborta todo el proceso, impidiendo que la rama sea creada/subida al repositorio remoto.
* **Solución Propuesta:** Validar si la rama existe en el servidor remoto antes de intentar el pull:
  ```powershell
  $branchExistsOnRemote = $false
  $remoteCheck = git ls-remote origin $branchName 2>$null
  if ($remoteCheck) {
      $branchExistsOnRemote = $true
  }
  
  if ($branchExistsOnRemote) {
      Write-Host "    -> Trayendo posibles actualizaciones previas del servidor..." -ForegroundColor DarkGray
      $pullResult = git pull origin $branchName --no-edit 2>&1
      # Validar conflictos...
  } else {
      Write-Host "    -> La rama no existe en el servidor remoto. Omitiendo pull preventivo." -ForegroundColor Gray
  }
  ```

---

## ⚡ Cuellos de Botella de Rendimiento y Arquitectura

### 4. Bloqueo de Cabeceras SSE en Aprovisionamiento Firebase Automático
* **Tipo:** Bloqueo de Red / UX / Timeout
* **Severidad:** 🟡 MEDIO - ALTO
* **Ubicación:** [server.js:L349-L529](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L349-L529)
* **Causa Raíz:** Si el desarrollador selecciona "auto-aprovisionamiento de Firebase", el servidor ejecuta síncronamente múltiples comandos CLI pesados (`firebase projects:create`, `firestore:databases:create`, `apps:create web`, etc.) que tardan entre 2 y 6 minutos en total. Durante este tiempo, la respuesta HTTP permanece bloqueada y no se envía ninguna cabecera ni log. Los proxies intermedios o el propio navegador cortan la conexión por timeout (504 Gateway Timeout). Además, los logs intermedios solo se imprimen en la terminal del backend, dejando al frontend en blanco.
* **Solución Propuesta:** Establecer y enviar las cabeceras SSE (`text/event-stream`) al principio de la ruta `/api/create-project`. Definir la función `send` de inmediato y ejecutar las tareas de aprovisionamiento de Firebase enviando los logs correspondientes en tiempo real por el stream antes de arrancar el worker local de scaffold.

---

## 🛠️ Plan de Acción Recomendado

1. **Corrección de Bugs Críticos:** Modificar `generator.js`, `subproject_backup.ps1` y `git_backup.ps1` para resolver las referencias no definidas y el chequeo de ramas Git remotas.
2. **Refactorización de Aprovisionamiento SSE:** Modificar `/api/create-project` en `server.js` para inicializar el stream SSE al inicio de la petición y canalizar los logs de la API de Firebase.
3. **Verificación Física:** Realizar una prueba de creación completa y un respaldo de prueba para certificar el funcionamiento de todo el ecosistema.
