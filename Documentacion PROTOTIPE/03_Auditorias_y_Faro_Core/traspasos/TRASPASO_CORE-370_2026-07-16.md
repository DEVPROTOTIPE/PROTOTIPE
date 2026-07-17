# Traspaso de Auditoría de Fase 3 — CORE-370 (Faro Core)

## Handoff — CORE-370

- **Estado anterior → Estado actual:** En Planeación → Completado (Auditoría Finalizada / Awaiting Review)
- **Repositorio / rama / HEAD:** `D:\PROTOTIPE` / `docs/context-packaging` / `docs/context-packaging` (último commit `0b469b6`)
- **Alcance ejecutado:** Auditoría y mapeo de los 8 puntos de Fase 3 definidos en el Roadmap Técnico Canónico (§6).
- **Archivos modificados:**
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-370_2026-07-16.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-370_2026-07-16.md) [NEW]
- **Pruebas ejecutadas y resultado literal:** Ninguna prueba funcional requerida (diagnóstico de lectura). Se corroboró la consistencia estructural usando comandos git, scripts de Node locales y análisis estático de código.
- **Evidencia pendiente:** Ninguna. Toda la evidencia de los 8 puntos ha sido recabada y documentada en este archivo.
- **Riesgos y bloqueos:**
  - `RIESGO R-023`: Posible inconsistencia en la aplicación cliente si el proceso de sincronización física se interrumpe abruptamente durante el copiado o compilación (Fase 3/4).
  - `RIESGO R-024`: Sobrescritura de personalizaciones de marca blanca o lógica del cliente debido a la carencia de un manifest de overrides semántico en el sincronizador.
- **Documentación actualizada:**
  - [TRASPASO_CORE-370_2026-07-16.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-370_2026-07-16.md)
- **Siguiente paso exacto:** Que Claude Code (o el fundador) revise este traspaso para tomar la decisión de monorepo/polyrepo y diseñar el reconciliador definitivo de la Fase 3.
- **Acciones que siguen sin autorización:** Implementar cualquier reconciliador o alterar la lógica del sincronizador o empaquetador del CLI.

---

## 3.1 ADR monorepo/polyrepo

* **Estado:** `EXISTE Y FUNCIONA` (como Monorepo unificado).
* **Evidencia:**
  - `HECHO VERIFICADO`: Al escanear físicamente todo el árbol de directorios de `D:\PROTOTIPE` (excluyendo `node_modules`), la única carpeta física `.git` encontrada es la de la raíz:
    ```powershell
    FullName
    --------
    D:\PROTOTIPE\.git
    ```
  - `HECHO VERIFICADO`: El repositorio raíz cuenta con un remoto configurado en GitHub:
    ```bash
    origin  https://github.com/DEVPROTOTIPE/PROTOTIPE.git (fetch)
    origin  https://github.com/DEVPROTOTIPE/PROTOTIPE.git (push)
    ```
  - `HECHO VERIFICADO`: No existen subrepositorios Git independientes ni submódulos en el árbol de trabajo. Todo comparte la misma línea de tiempo de la raíz.
  - `HECHO VERIFICADO` / `RIESGO`: En `Prototipe-CLI/config.js` y `Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs` existen supuestos fijos de rutas relativas basadas en `GIT_ROOT_CFG = path.resolve(CLI_ROOT, '..')`. El CLI auto-corrige de forma activa las rutas absolutas dentro de `plantillas_registro.json` para que coincidan con la unidad física actual:
    ```javascript
    const normalizedFuente = item.fuente.replace(/^[a-zA-Z]:\/PROTOTIPE/i, gitRootNormalized);
    ```
* **Conclusión:** Migrar a un esquema Polyrepo (repositorios físicos independientes en GitHub) rompería las asunciones del CLI y el dashboard sobre las dependencias de rutas relativas y requeriría una reescritura de la resolución de paths en el Bridge y scripts de paridad.
* **Clasificación:** `DECISIÓN REQUERIDA` (fundador + Claude Code).

---

## 3.2 Una plantilla de ventas única

* **Estado:** `EXISTE PARCIAL`
* **Evidencia:**
  - `HECHO VERIFICADO`: Al comparar la plantilla de producción (`Plantillas Core/App Ventas/`) contra el template del CLI (`Prototipe-CLI/templates/template-ventas/`), se identificaron 303 archivos idénticos, 8 archivos exclusivos en Core (como tests unitarios de fidelización y variables `.env.local`), 2 archivos exclusivos en template-ventas (scripts de IA y datos dummy `seed.json`), y **20 archivos que difieren en contenido**.
  - `HECHO VERIFICADO` / `RIESGO`: Entre las diferencias de contenido destaca un **drift de seguridad** en `firestore.rules`. El Core fue corregido hoy (2026-07-16) para mitigar fallas en Firestore mediante el uso seguro de `.get('ownerUid', null)` al evaluar usuarios antiguos sin ownerUid:
    ```javascript
    // Plantillas Core:
    get(/databases/$(database)/documents/users/$(userId)).data.get('ownerUid', null) == request.auth.uid
    
    // Prototipe-CLI/templates/template-ventas:
    get(/databases/$(database)/documents/users/$(userId)).data.ownerUid == request.auth.uid
    ```
    Esta corrección crítica no se ha propagado al template de ventas del CLI, por lo que cualquier proyecto nuevo aprovisionado heredará la vulnerabilidad/error de evaluación.
  - `HECHO VERIFICADO`: Al comparar `Plantillas Core/App Ventas/` contra `Instancias Clientes/ventas/ventas-moni-app/` se encontraron **16 archivos que difieren en contenido** (tales como `eslint.config.js`, `package.json` y `LoginPage.jsx`) y **55 archivos que existen únicamente en Moni**.
  - `HECHO VERIFICADO`: La gran mayoría de los 55 archivos exclusivos de Moni son backups del sincronizador en `.prototipe-backup/`, archivos de pruebas debug en `scratch/` y, de forma crítica, **los hooks y servicios migrados a la arquitectura por capas** (ej: `src/hooks/useInventory.js`, `src/services/inventoryService.js`) que no están presentes en la plantilla del Core ni en el template-ventas de CLI.

---

## 3.3 Schema de feature

* **Estado:** `EXISTE Y FUNCIONA`
* **Evidencia:**
  - `HECHO VERIFICADO`: La definición física de las features oficiales del ecosistema reside en `Prototipe-CLI/knowledge/feature-registry.json` con una estructura tipada en JSON:
    ```json
    {
      "id": "credits",
      "displayName": "Crédito y Fiados",
      "version": "1.0.0",
      "category": "finance",
      "dependencies": ["sales"],
      "physicalPaths": [
        "templates/template-ventas/src/features/credits",
        "templates/template-core-seed/src/features/credits"
      ],
      "npmDependencies": {
        "lucide-react": "^0.344.0"
      }
    }
    ```
  - `HECHO VERIFICADO`: En la aplicación cliente (`ventas-moni-app`), el archivo `src/utils/featureManifestAdapter.js` normaliza la lectura de feature flags soportando tanto el formato moderno (`manifest.features` como objeto) como el legacy (`manifest.featureFlags` como array):
    ```javascript
    export function getNormalizedFeatures(manifest) {
      if (manifest.features && typeof manifest.features === 'object') { ... }
      if (Array.isArray(manifest.featureFlags)) { ... }
    }
    ```
  - `HECHO VERIFICADO`: La especificación de metadatos de Cores y feature flags está documentada en `Documentacion PROTOTIPE/04_Estandares_y_Skills/propuesta_arquitectura_multicore.md` y `especificacion_nuevos_cores_oro.md`.

---

## 3.4 Reconciliador Knowledge/registry/físico/manifest/lock

* **Estado:** `EXISTE PARCIAL`
* **Evidencia:**
  - `HECHO VERIFICADO`: Al contrastar las features de `credits` y `customer-loyalty` instaladas en Moni (`ventas-moni-app`):
    1. **Knowledge/registry del CLI (`feature-registry.json`):** Ambos módulos están registrados como features funcionales del ecosistema.
    2. **Filesystem de Moni (`src/features/`):** Ambas features existen físicamente y respetan la arquitectura por capas (ADR-0001).
    3. **Lockfile (`prototipe.lock.json`):** Registra con total precisión los hashes `coreHash` y `appliedHash` de cada archivo de ambos módulos.
    4. **Manifest de features de Moni (`core-manifest.generated.json`):** Ambos están declarados con sus correspondientes equivalencias de flags.
  - `HECHO VERIFICADO`: Se identificó una discrepancia de diseño significativa: la feature `customer-loyalty` incluye un manifiesto local de inyección `implementation.manifest.json` para acoplar de manera dinámica sus menús de navegación (`adminMenu` y `clientMenu`) e iconos en tiempo de ejecución. Por el contrario, la feature `credits` no contiene este archivo y delega su inyección de rutas en configuraciones estáticas del Core.
* **Conclusión:** El lockfile y el catalogador del CLI registran la paridad de hashes correctamente, pero no existe un "reconciliador unificado" automático que alerte al analista sobre la discrepancia de manifiestos locales de inyección.

---

## 3.5 Plan Generator puro (sin efectos secundarios ocultos)

* **Estado:** `EXISTE PARCIAL`
* **Evidencia:**
  - `HECHO VERIFICADO`: El código que realiza la sincronización se encuentra en `Prototipe-CLI/sync_clients.js` (CLI local) y en `server.js` (endpoint `/api/instancias/sync-and-deploy-stream` vía SSE).
  - `HECHO VERIFICADO`: El cálculo de diferencias físicas es determinista y puro. Se realiza en memoria mapeando los archivos de la plantilla contra el cliente y calculando sus hashes MD5 (`getSyncFileHashAsync`). No contiene llamadas de red ni solicitudes de IA durante el planeamiento del sync.
  - `HECHO VERIFICADO` / `RIESGO`: Sin embargo, la aplicación de los cambios **NO es pura**. Una vez calculadas las diferencias, el sincronizador escribe directamente sobre el directorio destino del cliente (sobrescribiendo archivos) **antes** de ejecutar la validación de compilación (`npm run build`).

---

## 3.6 Apply staging/atomic

* **Estado:** `EXISTE PARCIAL`
* **Evidencia:**
  - `HECHO VERIFICADO` / `RIESGO`: El sincronizador **escribe directamente sobre la carpeta final del cliente**. No realiza la copia ni la validación en un área temporal (staging) fuera de la aplicación.
  - `HECHO VERIFICADO`: En su lugar, el sistema crea un directorio local `.temp_backup_sync` en el cliente con copias de los archivos modificados. Si la compilación `npm run build` falla, el script atrapa la excepción y ejecuta la función `rollbackBackupLocal` para restaurar los archivos del backup.
  - `RIESGO R-023`: Si el proceso se interrumpe abruptamente (Ctrl+C, crash de Node o corte de energía) antes de finalizar la validación del build, la función de rollback no se ejecutará. El cliente quedará en un estado **inconsistente y roto (drift parcial)** con archivos de la plantilla core mezclados y la carpeta `.temp_backup_sync` huérfana.

---

## 3.7 Manifest de overrides (personalizaciones del cliente)

* **Estado:** `EXISTE PARCIAL`
* **Evidencia:**
  - `HECHO VERIFICADO`: El Bridge de la CLI utiliza un helper de exclusión de sincronización centralizado llamado `isPathExcludedFromSync(relativePath)` en `server.js`:
    ```javascript
    function isPathExcludedFromSync(relativePath) { ... }
    ```
    Esta función excluye de forma estática archivos sensibles como `.env`, `firebase.json`, `.prototipe.json` y `prototipe.lock.json`.
  - `HECHO VERIFICADO` / `RIESGO`: Este mecanismo es estrictamente estático. **No existe ningún mecanismo semántico** (ej: un array de `"overrides": ["src/index.css"]` en `.prototipe.json`) que permita al analista registrar personalizaciones de UI o de negocio específicas del cliente. 
* **Conclusión:** Cualquier modificación manual del cliente sobre archivos que no estén en la lista blanca estática global será detectada ciegamente como "desviación física" (`drifted`) por la API `/api/project/drift` y el sincronizador intentará sobrescribirla ciegamente en la próxima actualización.

---

## 3.8 Upgrade y rollback de Moni

* **Estado:** `EXISTE PARCIAL`
* **Evidencia:**
  - `RESULTADO INFORMADO NO REAUDITADO` / `INFERENCIA`: No existe evidencia documental en bitácoras o historiales de que la aplicación de cliente real `ventas-moni-app` haya completado un upgrade de versión de Core completo y automatizado en caliente. Las actualizaciones y correcciones de paridad (como en `CORE-359` y `CORE-363`) se han aplicado propagando archivos individuales a mano y validando con el CLI de forma secuencial.
  - `HECHO VERIFICADO` / `RIESGO`: **No existe ningún comando ni soporte nativo de rollback** en el CLI posterior a una sincronización finalizada. Si la sincronización se completa con éxito (el build pasa) pero la aplicación presenta errores lógicos en producción, el analista no puede hacer rollback desde la CLI y debe depender de revertir los cambios manualmente en Git o restaurar copias de seguridad de disco.

---

## Reverificación rápida para quien retome

Ejecuta exactamente estos comandos antes de confiar en este traspaso y de construir sobre él:

1. `git status --short --branch` en `D:\PROTOTIPE`
   → se espera: La rama actual es `docs/context-packaging` y los únicos archivos sin commit/nuevos son de documentación (como este traspaso). Las modificaciones preexistentes ajenas en templates de ventas y scripts de backup deben estar intactas.
2. `node -e "const fs = require('fs'); console.log(fs.existsSync('D:/PROTOTIPE/Instancias Clientes/ventas/ventas-moni-app/src/core/generated/core-manifest.generated.json'))"`
   → se espera: `true` (confirma la existencia del core-manifest generado en la ruta interna de Moni).
3. `node -e "const fs = require('fs'); const lock = fs.readFileSync('D:/PROTOTIPE/Instancias Clientes/ventas/ventas-moni-app/prototipe.lock.json', 'utf8'); console.log(lock.includes('src/features/customer-loyalty/implementation.manifest.json'))"`
   → se espera: `true` (confirma el registro del manifiesto local de fidelización en el lockfile de Moni).

* **Ciclos de autocorrección:** 0 intentos (sólo documentación/mapeo ligero sin fallas de compilación ni lint).
* **Estado final:** `VERIFICADO`
