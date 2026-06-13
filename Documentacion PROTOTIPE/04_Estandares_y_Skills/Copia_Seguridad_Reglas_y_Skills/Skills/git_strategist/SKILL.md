---
name: git-strategist
description: >-
  Gestiona de forma limpia y estratégica el control de versiones con Git,
  aplicando el estándar de Conventional Commits y asegurando un estado limpio
  antes de modificaciones estructurales mayores. Se activa ante solicitudes
  directas de guardar en Git/GitHub o antes de realizar grandes refactorizaciones.
trigger: "@git-save"
aliases:
  - "@git-save [PROYECTO_ACTIVO?]"
---

# Git Strategist Instructions

## 📁 Variable de Proyecto Dinámica

> **Variable `[PROYECTO_ACTIVO]`:** Ruta raíz del proyecto sobre el que se está trabajando. Se determina en este orden de prioridad:
> 1. Si el usuario la especificó en el trigger (ej. `@git-save "App Reservas"`), usar esa.
> 2. Si hay un proyecto abierto actualmente en el contexto de la sesión, usar ese.
> 3. Si ninguna de las anteriores aplica, preguntar al usuario antes de continuar: "¿En qué proyecto estás trabajando? Indica la ruta o el nombre de la plantilla."

---

## 📁 Rutas del Proyecto

> Las rutas de este flujo se construyen dinámicamente usando `[PROYECTO_ACTIVO]`. Las rutas de documentación y biblioteca son siempre fijas (pertenecen al ecosistema, no a un proyecto específico):
>
> **Rutas fijas del ecosistema (siempre iguales):**
> - Biblioteca: `D:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\`
> - Bitácora: `D:\PROTOTIPE\Documentacion PROTOTIPE\03_Auditorias_y_Faro_Core\bitacora_cambios.md`
> - Mapas: `D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\`
> - Dev-dashboard: `D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\`
>
> **Rutas dinámicas del proyecto (dependen de `[PROYECTO_ACTIVO]`):**
> - Código fuente: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\src\`
> - Componentes: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\src\components\`
> - Hooks: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\src\hooks\`
> - Servicios: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\src\services\`
> - Variables de entorno: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\.env.local`
> - Package: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\package.json`

---

Actúas como un Ingeniero de Integración Continua y DevOps (Release Engineer). Cuando esta skill esté activa, debes seguir estrictamente los siguientes pasos secuenciales y pautas de la arquitectura del ecosistema:

## 1. Reglas del Flujo de Ramas (Git Flow Ecosistema)
*   **Rama `develop` (Desarrollo Activo):** Todos los desarrollos, nuevas funcionalidades y refactorizaciones deben realizarse e integrarse primero aquí. Es la rama de pruebas activa.
*   **Rama `main` (Plantilla de Oro / Final):** Solo recibe fusiones consolidadas y estables desde `develop`. Representa la versión estable del molde base.
*   **Rama `cliente/[nombre-cliente]` (Instancias):** Se derivan exclusivamente desde `main`. Almacenan las configuraciones específicas del cliente.
*   **Flujo Unidireccional Estricto:** Los cambios se propagan de `develop` ➔ `main` ➔ `cliente/[nombre-cliente]`. Nunca se debe fusionar código de un cliente hacia `develop` o `main`.

## 2. Estándar de Repositorios y Nomenclatura
Cada plantilla base del ecosistema reside en un repositorio GitHub independiente. Reglas:
- **Nombre del repositorio:** `prototipe-core-[nicho-o-contexto]`
  Ejemplos válidos: `prototipe-core-ventas`, `prototipe-core-servicios`, `prototipe-core-restaurante`.
- **Ramas por repositorio:** siempre `main` (producción estable), `develop` (desarrollo activo) y `cliente/[nombre]` (instancias).
- **Apps a la medida:** si el proyecto no es una plantilla replicable sino una app única para un cliente, el repositorio se nombra `prototipe-custom-[nombre-cliente-o-contexto]`.
- **Nunca** crear repositorios sin este estándar de nomenclatura — afecta la trazabilidad del ecosistema.

## 3. Diagnóstico del Repositorio (Relevancia y Estado)
*   **Comprobar Estado:** Ejecuta `git status` para verificar qué archivos han sido modificados, creados o eliminados.
*   **Evitar Acción Redundante:** Si no hay cambios pendientes, informa al usuario y detén la ejecución.
*   **Validación de Compilación:** Antes de realizar fusiones a `main` o un `git push` de versión estable, ejecuta siempre `npm run build` en el proyecto activo para asegurar la integridad de la compilación.

## 4. Preparación del Commit (Conventional Commits)
*   **Filtro de seguridad — Detección de credenciales:**
    Antes de ejecutar `git add`, revisar la lista de archivos a indexar. Si algún archivo coincide con el patrón `.env*` (excluyendo `.env.example` y `.env.example.*`):
    1. Detener el proceso inmediatamente.
    2. Alertar al usuario: "🚨 Archivo sensible detectado: [nombre del archivo]. No se puede continuar el commit para evitar exponer credenciales en el repositorio remoto."
    3. Sugerir: "Verifica que `.env.local` esté en tu `.gitignore` y vuelve a intentarlo."
    4. No ejecutar ningún `git add` ni `git commit` hasta que el usuario confirme que el archivo fue removido del staging o ignorado.
*   **Agrupamiento Lógico:** Agrega los archivos modificados de forma selectiva (`git add <archivos>`) o todos si forman parte del mismo cambio lógico (`git add .`).
*   **Redacción del Mensaje:** Redacta el mensaje en español utilizando Conventional Commits:
    *   `feat: ...` para nuevas funcionalidades.
    *   `fix: ...` para corrección de errores.
    *   `refactor: ...` para refactorizaciones internas sin cambios funcionales.
    *   `docs: ...` para actualizaciones de documentación.
    *   `chore: ...` para tareas de mantenimiento, dependencias o builds.
*   **Si el usuario no provee mensaje de commit:**
    No abortar ni preguntar de nuevo. En cambio, leer el output de `git status --porcelain` e inferir el mensaje automáticamente con el formato:
    `Auto-Snapshot [rama_activa]: Mod: [archivos modificados] | Add: [archivos nuevos] | Del: [archivos eliminados]`
    Ejemplo: `Auto-Snapshot [develop]: Mod: ComponentSandbox.jsx | Add: BotonWhatsappSandbox.jsx`
    Confirmar el mensaje autogenerado al usuario antes de ejecutar el commit.

## 5. Ejecución Segura
*   **Commit Local:** Ejecuta `git commit -m "<mensaje>"` para guardar el estado del código.
*   **Pull defensivo previo (obligatorio):**
    Antes de ejecutar el push, correr `git pull origin [rama_activa]`.
    - Si no hay conflictos: continuar con el push normalmente.
    - Si hay conflictos: aplicar el protocolo del Paso 6 (rebase + resolución por tipo de archivo).
    - Si no hay conexión a internet: ofrecer al usuario guardar solo el commit local sin push, indicando que el push queda pendiente para cuando se restaure la conexión.
*   **Envío Remoto (Push):** Realiza el envío de los cambios utilizando `git push origin <rama_activa>` de forma segura.
*   **Consolidación opcional a `main`:**
    Tras el push a `develop`, preguntar al usuario: "¿Deseas consolidar estos cambios en `main` (rama de producción estable)?"
    - Si confirma:
      1. `git checkout main`
      2. `git pull origin main`
      3. `git merge develop -m "merge: consolidar [descripción del cambio] en producción"`
      4. Si hay conflictos: ejecutar `git merge --abort`, regresar a `develop` y alertar al usuario. No dejar `main` en estado de conflicto.
      5. Si no hay conflictos: `git push origin main`
      6. `git checkout develop` (regresar siempre a develop al finalizar)
    - Si no confirma: finalizar en develop sin tocar main.
*   **Modo offline:**
    Si el push falla por ausencia de conexión o fallo de autenticación remota, no reportar error como fallo crítico. En cambio:
    1. Confirmar que el commit local fue creado exitosamente.
    2. Informar al usuario: "✅ Cambios guardados localmente. El push queda pendiente — ejecútalo manualmente con `git push origin [rama]` cuando tengas conexión."
    3. Registrar en bitácora el commit como "pendiente de push remoto".
*   **Confirmación:** Reporta el Hash corto del commit generado y los archivos afectados de manera resumida y profesional.

## 6. Resolución de Conflictos Remotos
Si el `git push` es rechazado por cambios remotos pendientes:
1. Ejecutar `git pull --rebase origin <rama_activa>`.
2. Si hay conflictos en archivos críticos (`firestore.rules`, `package.json`, `package-lock.json`): pausar, mostrar el diff al usuario y pedir instrucción explícita sobre qué versión conservar.
3. Si los conflictos son en archivos de código (`.jsx`, `.js`, `.css`): intentar resolución automática conservando la versión local (develop tiene prioridad sobre remoto en el flujo del ecosistema).
4. Tras resolver, completar el rebase: `git rebase --continue`.
5. Ejecutar el push nuevamente y confirmar con el hash del commit.

### 7. Reglas Anti-Conflicto para el Modelo Multi-Cliente
Estas reglas deben verificarse antes de aprobar cualquier merge de `main` hacia una rama `cliente/*`. Si alguna se viola, alertar al usuario antes de continuar:

**Regla 1 — Configuración de marca centralizada:**
El nombre del cliente, logo y datos comerciales nunca deben estar hardcodeados en componentes (Footer, Header, correos). Deben leerse de `src/config/brand.js`. Si durante una extracción o creación de componente se detecta hardcoding de datos de marca, reportarlo como deuda técnica antes de hacer el merge.

**Regla 2 — Colores como variables CSS:**
Los colores corporativos deben estar definidos como custom properties en `src/index.css` (ej. `--color-primary`, `--color-secondary`). Nunca editar el color directamente en el estilo de un componente si ese color corresponde a la identidad de marca del cliente.

**Regla 3 — `.env.local` fuera del repositorio base:**
Verificar que `.env.local` esté en el `.gitignore` del repositorio antes de cualquier push. Esta verificación ya está cubierta por el filtro del Paso 4, pero debe confirmarse también antes de merges a `main`.
