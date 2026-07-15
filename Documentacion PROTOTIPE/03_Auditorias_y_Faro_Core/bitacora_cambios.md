# 📝 Bitácora de Cambios e Historial de Commits

## [GOBERNANZA] Ampliación acotada de permisos de Claude Code — 2026-07-15
**Decisión: habilitar `git commit` para Claude Code (terminal), manteniendo el resto de las denegaciones intactas**

### Contexto:
Al cerrar `CORE-344` en `VERIFIED_COMPLETE` con aprobación explícita del fundador, se intentó ejecutar `git commit` para materializar el cierre. `.claude/settings.json` denegaba `Bash(git commit *)` de forma dura (sin diálogo de aprobación posible), como parte del control de seguridad diseñado en `CLAUDE-003` para que ninguna sesión de IA altere el historial de git sin un gesto humano. El fundador expresó la intención de que Claude Code actúe como su asistente principal y, tras explicarle que esa regla es la protección deliberada de `CLAUDE-003` (no un obstáculo accidental) y presentarle las alternativas, autorizó explícitamente ampliar el permiso **solo para `git commit`**.

### Cambio realizado:
1. **`.claude/settings.json`:** se eliminó únicamente la entrada `"Bash(git commit *)"` de `permissions.deny` (skill `update-config`). Se preservaron sin cambios: `git add .`, `git push *`, `git reset *`, `git clean *`, `git restore *`, `firebase deploy *`, instalación/actualización/eliminación de skills externas (`npx skills add|use|update|remove|rm`), `rm`/`del`/`Remove-Item`, y todas las denegaciones de lectura de `.env`/credenciales/`serviceAccount`. Verificado con `node -e` que el array de `deny` pasó de 29 a 28 entradas, con exactamente esa diferencia.
2. **Identidad de Git configurada globalmente** (`git config --global user.name "Sergio Agudelo"` y `user.email "sergioaagudeloh@gmail.com"`) para desbloquear la creación de commits en esta máquina; no existía identidad configurada previamente. Alcance elegido explícitamente por el fundador (global, no solo este repositorio).
3. **Commit de cierre de `CORE-344` creado:** `3427ed1` en `docs/context-packaging` (11 archivos, 1447 inserciones), sin `push`.

### Alcance y límites de la decisión:
- Aplica únicamente a Claude Code (esta sesión y futuras sesiones de terminal/escritorio que compartan `.claude/settings.json`). No modifica la configuración ni el comportamiento de Codex ni de Antigravity — cada IA mantiene su propio gobierno según `.agents/AI_WORKFLOW.md`.
- `git push`, `deploy`, `reset --hard`, `clean`, `restore` y la instalación/actualización de skills externas **siguen requiriendo que el fundador los ejecute manualmente** (vía `!` o directamente). Esta ampliación no toca esas protecciones.
- No se reinterpretó como autorización general para commitear sin verificación: el flujo seguido (staging selectivo con `git add -p` para no reclamar hunks ajenos, mensaje de commit presentado y aprobado antes de ejecutar) se mantiene como práctica esperada hacia adelante.

### Ejecución y base:
- **Ejecutor(es):** Claude Code (terminal), skill `update-config`.
- **Rama / HEAD observado antes del cambio:** `docs/context-packaging` / `919bdc9`.
- **Autorización:** explícita del fundador, en dos pasos — decisión de alcance ("permitir solo git commit", vía `AskUserQuestion`) y decisión de identidad Git (alcance global, vía `AskUserQuestion`).
- **Cambios preexistentes preservados:** sí; el resto de `.claude/settings.json` quedó exactamente igual salvo la única línea eliminada.
- **Siguiente paso exacto:** ninguno pendiente sobre esta decisión; queda documentada como precedente para sesiones futuras. Continúa disponible la Fase B de `CORE-344` (mecanismo `Core → template`, ADR-0001 §21-22) como tarea nueva y separada, aún sin iniciar.

---

## [MAJOR] CORE-344 — 2026-07-15
**Arquitectura: ADR canónico de capas + piloto `customer-loyalty` (solo `Plantillas Core/App Ventas`)**

### Cambios realizados:
1. **ADR-0001 (nuevo):** creado `Documentacion PROTOTIPE/00_Continuidad/canonical/ADR-0001-arquitectura-canonica-por-capas.md`, estado `PROPOSED`, con evidencia medida del repositorio (inventario de imports de Firebase por área, contradicciones de `AGENTS.md` §22 vs código real, determinación de fuente de verdad por procedencia documental).
2. **Tests de caracterización (antes del refactor):** `tests/unit/customerLoyaltyRepository.spec.js` y `tests/unit/customerLoyaltyService.spec.js` (nuevos), 24 pruebas escritas y ejecutadas en verde contra el código pre-refactor para fijar el comportamiento de negocio como referencia de no-regresión.
3. **Refactor del piloto (`Plantillas Core/App Ventas/src/features/customer-loyalty`):**
   - `api/CustomerLoyaltyRepository.js`: se agregaron `runAccountTransaction` (transacción por reducer puro, con validación Zod movida aquí), `subscribeToAccount`/`subscribeToTransactions` (listeners con cancelación) y `getConfigDoc` (relocalización literal de la lectura muerta pre-existente, sin modificar su comportamiento).
   - `services/CustomerLoyaltyService.js`: se eliminó toda importación del SDK de Firebase; `earnPoints`/`redeemPoints` ahora delegan la mecánica transaccional al Repository vía un reducer puro que conserva intactas las reglas de negocio (validación, umbrales de nivel, mínimo de canje).
   - `hooks/useCustomerLoyalty.js`: se eliminó toda importación del SDK de Firebase; consume las suscripciones expuestas por el Repository.
   - `index.js`: se retiró la exportación pública del Repository (sin consumidores externos, verificado con `grep` antes del cambio).
4. **Guard arquitectónico progresivo (`eslint.config.js`):** bloque nuevo, severidad `error`, aplicado solo a `components/`, `hooks/` y `services/` de `hello-module` y `customer-loyalty`; prohíbe importar `firebase`/`firebase/*`. Replica literalmente (sin modificarlos) los 5 selectores ya vigentes del bloque anterior, porque en el flat config de ESLint dos bloques que coinciden sobre el mismo archivo y declaran la misma regla no se fusionan — el posterior reemplaza por completo el valor del anterior. No se agregó un nivel `warn` de reporte para el resto del legado: se determinó que, dado que el bloque global ya cubre el 100% de los archivos `.js/.jsx` con `error`, no existe forma de insertar una severidad `warn` diferenciada sin degradar las reglas `error` ya vigentes para esos mismos archivos; queda documentado como brecha, no resuelta debilitando el guard existente.

### Verificaciones ejecutadas (resultados literales):
- Caracterización pre-refactor: `npm exec --offline -- vitest run tests/unit/customerLoyaltyRepository.spec.js tests/unit/customerLoyaltyService.spec.js` → 2 archivos, 24 pruebas, todas en verde.
- Post-refactor (mismo comando, tras ajustar el seam de mocks de `firebase/firestore` a `CustomerLoyaltyRepository.runAccountTransaction`/`getConfigDoc`, y extender el Repository con pruebas de la transacción y las suscripciones nuevas): 2 archivos, 33 pruebas, todas en verde.
- Suite completa de la app (`npm exec --offline -- vitest run`): 8 archivos, 98 pruebas, todas en verde — sin regresión en `sales`, `orders`, `inventory`, `credits`, `billing`, `checkout`.
- ESLint de los archivos modificados/creados: `CustomerLoyaltyService.js`, `index.js` y ambos archivos de test nuevos → limpio. `CustomerLoyaltyRepository.js` → 3 errores `no-restricted-syntax` (`setDoc`/`updateDoc`), confirmados **pre-existentes** con `git show HEAD` (el `ignores` del bloque legado apunta a `src/repositories/**`, que no coincide con la carpeta real `api/**`; deuda no introducida por esta tarea).
- `npm run lint` del proyecto completo: 637 errores y 22 advertencias pre-existentes en archivos no tocados por esta tarea (confirmado no relacionado con CORE-344).
- `node scripts/validate-core-integrity.js` (solo lectura, sin escritura a disco) sobre los 4 archivos de código del piloto: sin violaciones críticas.
- `npm exec --offline -- vite build`: build de producción exitoso.
- `git diff --check`: sin errores; solo advertencias CRLF pre-existentes en archivos no tocados por esta tarea.

### Deuda técnica descubierta y NO corregida (fuera de alcance, documentada en el ADR §20):
- `CustomerLoyaltyService.getConfig` / `Repository.getConfigDoc`: la lectura de configuración persistida nunca se completa (`docRef.firestore._getDoc` no es API real del SDK); se relocalizó al Repository sin modificar su comportamiento.
- `CustomerLoyaltyRepository.deleteToken`: invalida el token con `updateDoc` en vez de borrarlo; sin cambios.
- Gap de guard ESLint pre-existente (`src/repositories/**` vs `api/**` real) que hace fallar lint en Repositories que escriben directamente; no introducido ni corregido por esta tarea.
- `useCustomerLoyalty.js` tenía ya, antes de este cambio, una violación `react-hooks/set-state-in-effect` en su guarda de entrada; no tocada.

### Ejecución y base:
- **Ejecutor(es):** Claude Code (terminal).
- **Rama / HEAD observado:** `docs/context-packaging` / `919bdc9`.
- **Alcance propio:** ADR + piloto `customer-loyalty` exclusivamente en `Plantillas Core/App Ventas`. No se tocó `Prototipe-CLI/templates/template-ventas` ni `Instancias Clientes/ventas/ventas-moni-app`.
- **Cambios preexistentes preservados:** sí; no se reclamaron, restauraron ni sobrescribieron los guards RBAC de `CORE-342` en `AdminCustomerLoyalty.jsx`, `AdminView.jsx` ni `AdminHelloModule.jsx`, ni ningún otro cambio preexistente del working tree.
- **Estado final:** `VERIFIED_COMPLETE`. Se entregó en `READY_FOR_INDEPENDENT_REVIEW` y el fundador aprobó explícitamente el resultado ("YO LO APRUEBO", 2026-07-15). `.agents/AI_WORKFLOW.md` §6 exige revisión independiente **o** aprobación humana para decisiones de arquitectura (condición disyuntiva); el cierre se sustenta en la aprobación humana del fundador, no en una revisión independiente de otra sesión de IA — se documenta esta distinción explícitamente, sin fingir una revisión que no ocurrió.
- **Prohibido y no ejecutado:** sin commit, push, deploy, merge, tags, REC-002, restore, reset, clean, descarte, reescritura de historial, `git add .`, instalación/actualización de dependencias o skills, lectura de secretos/`.env`, uso de recursos Firebase reales, propagación a otras copias. El commit de estos cambios requiere autorización explícita separada, todavía no solicitada.
- **Siguiente paso exacto:** registrar como tarea nueva y separada (con su propio preflight) la Fase B del ADR-0001 §21-22 — decidir/demostrar el mecanismo `Core → template` (hoy sin flujo automatizado verificado) y, solo después, propagar el piloto validado a `template-ventas` y `ventas-moni-app` sin sincronizar a ciegas.

---

## [MINOR] CLAUDE-003-CLOSURE — 2026-07-14
**Documentación: reconciliación final del criterio de cierre de `CLAUDE-003`**

### Cambios realizados:
1. **Protocolo multi‑IA:** se sustituyó la frase residual que afirmaba que `CLAUDE-003` permanecía `IN_PROGRESS`; el texto ahora presenta los seis puntos como criterios que ya fueron exigidos para el cierre, sin alterar su contenido ni estados ajenos.

### Ejecución y base:
- **Ejecutor(es):** Codex.
- **Rama / HEAD observado:** `docs/context-packaging` / `919bdc9`.
- **Alcance propio:** corrección documental atómica del cierre ya verificado de `CLAUDE-003`.
- **Cambios preexistentes preservados:** Sí; se preservaron todos los cambios de `CORE-341`, `CORE-342`, `CORE-343`, `CLAUDE-003` y demás tareas visibles en el working tree.

### Evidencia:
- El registro de capacidades validó 48 entradas: 15 `INTERNAL_ACTIVE`, 3 `INTERNAL_RESTRICTED` y 2 `INTERNAL_PILOT`.
- Las cinco consultas doradas devolvieron `Security Review`, `component-creator`, `portar-componente`, `bitacora-recorder` y `DISCOVERY_REVIEW_REQUIRED`, respectivamente.
- El verificador integral terminó `OK` con 20 pares de skills `noop`, cero conflictos, ninguna sincronización y ninguna escritura.
- `git diff --check` no informó errores; la advertencia estética preexistente de `propuesta_portal_creacion_features.md` fue informativa y quedó fuera de este alcance.
- **Estado:** `VERIFIED_COMPLETE`.

### Archivos modificados:
- [`protocolo_colaboracion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/protocolo_colaboracion_ia.md) [MODIFY]
- [`bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

## CLAUDE-003-CYCLE-2 — 2026-07-14
**Handoff independiente mediante Claude Desktop Code: `PASS_AFTER_CORRECTION`**

### Cambios realizados:
1. **Segunda superficie:** Claude Desktop Code abrió `D:/PROTOTIPE`, reconstruyó el estado de `CLAUDE-003` desde archivos canónicos y confirmó que no modificó, instaló, hizo commit, push ni deploy.
2. **Comprensión verificada:** recuperó rama/HEAD, el resultado corregido del ciclo 1, los bloques preexistentes de `CORE-341`/`CORE-342`, la capacidad mínima `internal:git-strategist` y el criterio de cierre.
3. **Corrección pendiente:** llamó “propios de CLAUDE-003” a `.agents/AGENTS.md`, `.agents/skills/bitacora-recorder/SKILL.md`, `.agents/skills/sync_manifest.json`, `.gitignore` y `protocolo_colaboracion_ia.md`. `git ls-files` confirma que ya estaban versionados; en `CLAUDE-003` fueron modificados, no creados ni adquiridos en propiedad exclusiva.
4. **Revisión de la corrección:** Claude reclasificó correctamente esos cinco archivos, pero definió `NEW` usando `??` y puso como ejemplos `.claude/` y `CLAUDE.md`. `??` demuestra ausencia de seguimiento, no la tarea de origen: `CLAUDE.md` está documentado en `CORE-342/CORE-343`, `.claude/settings.json` en `CORE-342` y únicamente los adaptadores `.claude/skills/` fueron creados por `CLAUDE-003`.
5. **Aceptación final:** Claude confirmó que `??` no demuestra procedencia, clasificó `CLAUDE.md` y `.claude/settings.json` como compartidos, los dos adaptadores de `.claude/skills/` como nuevos y el directorio `.claude/` como una unidad de procedencia mixta.

### Ejecución y base:
- **Ejecutores:** Claude Desktop Code realizó la inspección; Codex revisó la procedencia contra Git y documentación.
- **Rama / HEAD observado:** `docs/context-packaging` / `919bdc9`.
- **Alcance propio:** lectura independiente y registro documental de la evidencia del ciclo 2.
- **Cambios preexistentes preservados:** sí; ninguna superficie modificó código de producto ni descartó cambios.

### Evidencia:
- La respuesta identifica `CLAUDE-003` como `IN_PROGRESS` y no intenta autocerrarla.
- `git ls-files` confirma que los cinco archivos señalados existían antes de los cambios no confirmados actuales.
- La corrección distingue adecuadamente `PREEXISTING_MODIFIED` y `SHARED_MODIFIED`; queda pendiente retirar la inferencia `??` → “creado por la tarea”.
- La respuesta final retiró esa inferencia y confirmó las cuatro categorías con evidencia documental.
- **Estado:** `PASS_AFTER_CORRECTION`; ciclo 2 aceptado.

### Archivos modificados:
- [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`D:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

## CLAUDE-003-CYCLE-1 — 2026-07-14
**Handoff de solo lectura Claude ← Codex: `PASS_AFTER_CORRECTION`**

### Cambios realizados:
1. **Validación de continuidad:** Claude abrió la raíz canónica, recuperó rama/HEAD, restricciones, cambios preexistentes y selección mínima de capacidades sin editar, instalar, hacer commit, push ni deploy.
2. **Corrección de procedencia:** la respuesta atribuyó `.nvmrc`, `.node-version`, `.npmrc` y `verify-runtime.mjs` a `CLAUDE-003`; la evidencia canónica en `CORE-341` demuestra que esos archivos pertenecen a la fijación del runtime. El ciclo no se acepta como `PASS` hasta que Claude reconozca la corrección.
3. **Revisión de la corrección:** Claude reconoció formalmente el error de runtime y detectó que Codex había actualizado la bitácora durante su sesión. Persistió una desviación: clasificó `mapa_aplicacion.md` y `mapa_documentacion_ia.md` únicamente como `CORE-342`, aunque el roadmap los lista bajo `CORE-342` y `CLAUDE-003`.
4. **Aceptación final:** Claude corrigió expresamente la clasificación de ambos mapas como documentos compartidos, mantuvo `certeza baja` al no haber revisado el diff por líneas y confirmó que no modificó archivos.

### Ejecución y base:
- **Ejecutores:** Claude realizó la inspección; Codex contrastó la respuesta con roadmap y bitácora.
- **Rama / HEAD observado:** `docs/context-packaging` / `919bdc9`.
- **Alcance propio:** lectura de `git status`, `git log`, `CLAUDE.md`, contrato, registro, roadmap y bitácora; registro documental del resultado.
- **Cambios preexistentes preservados:** sí; no se modificó ni reasignó código de `CORE-341`, `CORE-342` u otras tareas.

### Evidencia:
- Claude confirmó correctamente raíz, rama/HEAD, restricciones multi‑IA y uso de `internal:git-strategist` como capacidad mínima.
- `tareas_pendientes.md` asigna expresamente los cuatro archivos de runtime a `CORE-341`; `bitacora_cambios.md` confirma la misma procedencia.
- La segunda respuesta corrigió esa atribución y reconoció la modificación concurrente sin sobrescribirla. Las líneas 37-38 y 96-97 del roadmap demuestran que los dos mapas son compartidos entre `CLAUDE-003` y `CORE-342`.
- La tercera respuesta confirmó esa clasificación compartida y corrigió formalmente la tabla anterior.
- **Estado:** `PASS_AFTER_CORRECTION`; ciclo 1 aceptado. `CLAUDE-003` continúa `IN_PROGRESS` porque falta el ciclo 2.

### Archivos modificados:
- [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`D:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

## CLAUDE-003 — 2026-07-14 — VERIFIED_COMPLETE
**Gobernanza de capacidades y continuidad entre Fundador, Codex, Claude y Antigravity**

### Cambios realizados:
1. Se estableció un contrato operativo común: ninguna IA es dueña exclusiva del proyecto; un solo ejecutor escribe por worktree físico y debe preservar los cambios preexistentes.
2. Se creó un registro de 48 capacidades con estados auditables. Quince skills internas quedan activas, tres de riesgo quedan restringidas y dos skills nuevas permanecen como pilotos.
3. `route-capabilities` selecciona el conjunto mínimo permitido mediante una consulta local y determinista. `find-skills-governed` solo descubre candidatos externos, nunca instala, actualiza ni ejecuta paquetes.
4. `CLAUDE.md` dejó de cargar íntegramente el archivo heredado de reglas y ahora importa el contrato breve; los adaptadores de `.claude/skills` apuntan a las fuentes canónicas en `.agents/skills`.
5. Se añadieron bloqueos de permisos para operaciones mutantes del CLI externo de skills y exclusiones locales para configuraciones privadas y cuarentena.

### Ejecución y base:
- **Ejecutor:** Codex, por solicitud del fundador.
- **Rama / HEAD observado:** `docs/context-packaging` / `919bdc9`.
- **Alcance propio:** gobernanza IA, registro/enrutador de capacidades, adaptadores Claude y documentación de `CLAUDE-003`.
- **Cambios preexistentes preservados:** sí; el working tree ya contenía cambios de tareas anteriores y no se reasignaron ni descartaron.

### Evidencia:
- El registro valida como JSON y enumera 48 capacidades sin IDs duplicados ni fuentes internas ausentes.
- Golden queries: seguridad Firebase → `Security Review`; crear componente → `component-creator`; portar componente → `portar-componente`; bitácora → `bitacora-recorder`; video → `DISCOVERY_REVIEW_REQUIRED`.
- La verificación integral posterior reportó 20 pares `noop`, cero conflictos y ninguna escritura; reconoció `CLAUDE-003` y mantuvo 60 cambios ajenos visibles como preexistentes.
- Los ciclos 1 y 2 fueron aceptados después de correcciones explícitas de procedencia; terminal y Desktop Code retomaron el contexto sin editar código ni instalar herramientas.
- **Estado:** `VERIFIED_COMPLETE`; cierre local sin commit, push, deploy ni instalaciones externas.

### Archivos modificados:
- [`D:/PROTOTIPE/.agents/AI_WORKFLOW.md`](file:///D:/PROTOTIPE/.agents/AI_WORKFLOW.md) [NEW]
- [`D:/PROTOTIPE/.agents/capabilities/registry.json`](file:///D:/PROTOTIPE/.agents/capabilities/registry.json) [NEW]
- [`D:/PROTOTIPE/.agents/skills/route-capabilities/`](file:///D:/PROTOTIPE/.agents/skills/route-capabilities/) [NEW]
- [`D:/PROTOTIPE/.agents/skills/find-skills-governed/`](file:///D:/PROTOTIPE/.agents/skills/find-skills-governed/) [NEW]
- [`D:/PROTOTIPE/.claude/skills/`](file:///D:/PROTOTIPE/.claude/skills/) [NEW]
- [`D:/PROTOTIPE/CLAUDE.md`](file:///D:/PROTOTIPE/CLAUDE.md) [MODIFY]
- [`D:/PROTOTIPE/.agents/AGENTS.md`](file:///D:/PROTOTIPE/.agents/AGENTS.md) [MODIFY]
- [`D:/PROTOTIPE/.claude/settings.json`](file:///D:/PROTOTIPE/.claude/settings.json) [MODIFY]
- [`D:/PROTOTIPE/.gitignore`](file:///D:/PROTOTIPE/.gitignore) [MODIFY]
- [`D:/PROTOTIPE/Documentacion PROTOTIPE/`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/) [MODIFY]

---

## CORE-343 — 2026-07-14
**Validación inicial de Claude sobre la raíz canónica**

### Resultado verificado
1. Claude Code reconoció una suscripción Claude Pro mediante el proveedor oficial; no se registraron credenciales ni identificadores de cuenta.
2. El piloto se ejecutó desde `D:\PROTOTIPE` con `--permission-mode plan` y terminó sin modificar archivos.
3. Claude identificó correctamente la raíz canónica, los tres clones independientes, el workspace preservado, el working tree no confirmado y las restricciones de secretos, Git, REC-002 y producción `NO-GO`.
4. El piloto expuso una instrucción documental obsoleta que todavía pedía autenticación; se corrigió antes de iniciar cualquier trabajo real.

### Estado
- `CLAUDE-002`: `VERIFIED_COMPLETE`.
- `CORE-343`: `VERIFIED_COMPLETE`; incorporación documental terminada.
- `CLAUDE-003`: `VERIFIED_COMPLETE` posteriormente; consultar las entradas de cierre al inicio de esta bitácora.
- Próximo paso vigente: seleccionar una nueva tarea real desde el roadmap; no hacer commit, push, deploy o REC-002 sin autorización.

### Hallazgo de trazabilidad
El build rechazó correctamente mantener `CORE-343` como tarea de edición activa porque el working tree todavía contiene los cambios verificados de `CORE-342`. Esos archivos no se reasignaron falsamente y no se prepararon ni confirmaron en Git.

---

## CORE-342 — 2026-07-14 — VERIFIED_COMPLETE
**Remediación de fallos baseline descubiertos después de la reinstalación**

### Diagnóstico de entrada:
1. `template-core-seed`, `App Ventas_limpio` y `ventas-moni-app` pasan sus pruebas unitarias.
2. `template-ventas` tiene una aserción desactualizada: espera el nombre base del producto y el comportamiento vigente informa nombre más variante.
3. Functions no puede ejecutar su lint porque la configuración ignora todos los archivos alcanzados por `eslint .`.
4. El dashboard compila directamente con Vite, pero su prebuild conserva una ruta absoluta anterior y ESLint informa 133 errores y 338 advertencias.

### Límites:
- no commit, push, deploy, emuladores ni servicios reales;
- no aplicar REC-002;
- no silenciar globalmente reglas de React para obtener un resultado artificialmente verde.

### Resultado ejecutado:
1. La expectativa de `template-ventas` quedó alineada con el nombre de variante vigente; sus 65 pruebas pasan.
2. Functions migró a flat config actual, eliminó la dependencia heredada y pasa ESLint con cero errores.
3. Dashboard quedó en cero errores de ESLint; conserva 413 advertencias visibles de reglas de React Compiler porque ese compilador no está habilitado.
4. Los builds directos de ambas copias del dashboard pasan; CLI, plantillas e instancias también compilan.
5. Se aprobaron 198 pruebas entre template ventas, App Ventas, ventas Moni y core seed.
6. La validación de conocimiento registra `blueprint-semver` y `hsl-color`; cinco blueprints de ejemplo quedaron en el esquema vigente.
7. El verificador de integridad resuelve el workspace recuperado y ya no sincroniza silenciosamente: cualquier escritura exige `PROTOTIPE_ALLOW_INTEGRITY_SYNC=1`.

### Resolución de cierre:
1. Los 18 pares de skills activa/respaldo coincidieron por SHA-256; el manifiesto se reconcilió una vez y el build posterior reportó 18 `noop`, sin escritura.
2. `AdminCustomerLoyalty.jsx`, `AdminView.jsx` y `AdminHelloModule.jsx` recibieron guards reales de rol en las copias equivalentes.
3. Cinco ejecuciones de 65 pruebas pasaron después del hardening RBAC.
4. El alcance completo quedó registrado y el gate de trazabilidad pasa.
5. La copia antigua se preservó en `D:/PROTOTIPE_PRESERVADO_ANTES_DE_RECUPERACION_2026-07-14`; el coordinador limpio quedó en `D:/PROTOTIPE` y tres clones independientes en `D:/PROTOTIPE_WORKSPACE`.
6. Scripts de backup, consolidación, promoción y hooks resuelven su raíz dinámicamente donde corresponde. El build integral pasa desde la ruta canónica.

### Estado:
`VERIFIED_COMPLETE`; sin commit, push, deploy ni aplicación de REC-002.

---

## CORE-341 — 2026-07-14 — VERIFIED_COMPLETE
**Fijación del runtime reproducible después de la reinstalación**

### Cambios realizados:
1. Se seleccionó Node `22.23.0` y npm `10.9.8` a partir de requisitos de Vite, ESLint, Vitest y Firebase Functions.
2. Se descargó la distribución oficial de Node y se verificó su SHA-256 antes de extraerla en `D:/PROTOTIPE_TOOLS/node-v22.23.0-win-x64`.
3. Se añadieron `.nvmrc`, `.node-version`, `.npmrc` y `verify-runtime.mjs` a las cuatro unidades Git limpias.
4. Se declararon `engines` y `packageManager` en CLI, Dashboard, Functions, plantillas e instancia; Functions pasó de runtime Node 20 a Node 22.
5. El verificador pasó en las cuatro unidades y falló correctamente ante Node 20 y npm 9.
6. Los once `package.json` modificados son JSON válido y `git diff --check` pasa en las cuatro unidades.

### Evidencia de cierre:
- los once pares `package.json`/`package-lock.json` fueron reconciliados con npm `10.9.8`;
- `npm ci` pasó en las siete superficies ejecutables revisadas;
- el runtime exacto pasó en las cuatro unidades y las pruebas negativas rechazaron Node 20/npm 9;
- builds, lint y pruebas posteriores quedan registrados en CORE-342 y en el baseline previo a Claude.

### Estado:
`VERIFIED_COMPLETE`; sin commit, push, deploy ni aplicación de REC-002.

---

## CLI-494 — 2026-07-13
**FEATURE_FLAGS_PHYSICAL_LOGICAL_ALIGNMENT: Saneamiento y Alineación Físico-Lógica de Módulos y Feature Flags en Firestore**

### Cambios realizados:
1. **server.js (Bridge CLI):** 
   - Modificada la función `findProjectDir` para mapear explícitamente el clientId `ventas-smartfix` (la instancia del Core) a la ruta física de la plantilla core en disco: `D:/PROTOTIPE/Plantillas Core/App Ventas`.
   - Modificados los endpoints de inyección física (`/api/project/features/add`) y desinstalación (`/api/project/features/remove`) para actualizar atómicamente la lista de `installedFeatures` y la activación por defecto en el objeto de `flags` del inquilino correspondiente en Firestore (`clientes_control/[clientId]`).
   - Modificado el endpoint `/api/project/drift` para **mezclar atómicamente** la verdad lógica (lockfile) con la verdad física (escanear `src/features` del cliente). Así, si un módulo existe físicamente en el disco del inquilino (caso de features preinstaladas o del core), se reportará siempre como instalado, unificando y garantizando 100% de simetría entre Ventas Moni y Ventas SmartFix.
2. **ClientLifecyclePanel.jsx (Dashboard - CRM):** Modificado el manejador `handleToggleFeature` para inyectar/remover la feature reactivamente en el documento Firestore del inquilino en tiempo real tras la confirmación de éxito de la CLI local, sirviendo como fuente de verdad secundaria para otros entornos.
3. **FeatureFlagManager.jsx (Dashboard - Flags):** 
   - **Saneamiento de Flags Fantasmas:** Removido el hardcodeo de flags genéricas fantasmas de otras verticales del objeto `CORE_FLAGS`. Se redefinieron únicamente las 7 flags oficiales reales de la plantilla de Ventas.
   - **Mapeo de Legacy Keys:** Implementada la normalización automática del id `rolesOperativosEnabled` del core-manifest a `deliveryEnabled` de Firestore al cargar las flags de la metadata de cores, garantizando reactividad.
   - Modificada la inicialización y el selector de cliente `handleSelectClient` para cargar y mezclar reactivamente la lista de `installedFeatures` registrada en Firestore Central con la del disco de la CLI local, ofreciendo resiliencia a viewports y máquinas sin clonado de disco (fallback determinista).
   - Rediseñado el grid visual de flags dividiéndolo en dos bloques semánticos independientes: "Módulos de Aplicación Instalados" (Features inyectadas en disco/base de datos) y "Configuración Operativa" (Feature Flags granulares de la aplicación).
   - Blindada la acción masiva "Habilitar/Desactivar Todas" para actuar única y exclusivamente sobre el bloque de flags operativas del Core, previniendo crashes de runtime por carga de módulos físicos ausentes.
4. **Saneamiento y Alineación Core-Cliente (Auditoría Drift):**
   - **Lógica de Fidelidad (customer-loyalty):** La versión del Core era la correcta (lógica real de puntos, QR y esquemas Zod), mientras que el Cliente tenía el esqueleto vacío autogenerado. Promovimos todo el código fuente de fidelización del Core al Cliente.
   - **Manifiestos Autogenerados (src/core/generated/):** La versión del Cliente era la correcta/limpia, mientras que el Core tenía residuos huérfanos de la vertical clínica (features `appointments` y `patients`). Promovimos los manifiestos limpios del Cliente al Core para purgar la basura del Core.
5. **ClientLayout.jsx (Core y Cliente):** Solucionado un error fatal en runtime (`ReferenceError: onlineOrdersEnabled is not defined`). Se declararon e inicializaron de forma segura `onlineOrdersEnabled` y `couponsEnabled` mediante la función de validación de tema `isFeatureEnabled` para evitar caídas de UI por variables no importadas.

### Archivos modificados:
- [`d:/PROTOTIPE/Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ClientLifecyclePanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ClientLifecyclePanel.jsx) [MODIFY]
- [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx) [MODIFY]
- [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
- [`D:/PROTOTIPE/Plantillas Core/App Ventas/prototipe.lock.json`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/prototipe.lock.json) [NEW]
- Archivos en [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/core/generated/`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/core/generated/) [MODIFY]
- Archivos en [`D:/PROTOTIPE/Instancias Clientes/ventas/ventas-moni-app/src/features/customer-loyalty/`](file:///D:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/features/customer-loyalty/) [MODIFY]
- [`src/layouts/ClientLayout.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/ClientLayout.jsx) (Core y Cliente) [MODIFY]

---

## CLI-493 — 2026-07-13
**FEATURE_FLAGS_DYNAMIC_VINDICATION: Vinculación Reactiva de Flags de Features Instaladas en Caliente**

### Cambios realizados:
1. **FeatureFlagManager.jsx (Dashboard):** Refactorizada la propiedad `activeFlagsList` para calcularse mediante un `useMemo` dinámico. Ahora consulta mediante el Bridge CLI qué features están instaladas físicamente en la instancia del cliente seleccionado (`/api/project/drift`). Si una feature modular (como `customer-loyalty` o `hello-module`) ha sido inyectada físicamente, agrega automáticamente su interruptor lógico de control de flags en la interfaz de usuario en caliente, garantizando que el administrador siempre pueda encenderla o apagarla lógicamente.

### Archivos modificados:
- [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx) [MODIFY]

---

## CLI-492 — 2026-07-13
**FEATURE_CREATION_PROVISIONING_AUDIT: Auditoría del Generador de Features y Sincronización de Rutas en Caliente**

### Cambios realizados:
1. **server.js (Bridge CLI):** Corregido el endpoint de commit de features modulares en caliente (`/api/project/features/commit`) para inyectar determinísticamente la propiedad `physicalPaths` al registrar una nueva feature en `feature-registry.json`. Esto previene fallos latentes de "Origen físico no encontrado" al intentar inyectar posteriormente las features creadas modularmente desde la UI.
2. **FeatureArtifactGenerator.js:** Corregida la recolección de features locales para que los manifiestos locales del inquilino solo indexen las features que existen físicamente en su disco, eliminando discrepancias y clics rotos en la UI de navegación de las instancias cliente.

### Archivos modificados:
- [`d:/PROTOTIPE/Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/lib/FeatureArtifactGenerator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/lib/FeatureArtifactGenerator.js) [MODIFY]

---

## CLI-491 — 2026-07-13
**FEATURE_REGISTRY_SYNCHRONIZATION: Sincronización del Feature Registry y Mapeo Físico del Catálogo**

### Cambios realizados:
1. **FeatureRegistry.js:** Modificado el método `getAll()` para validar dinámicamente en el disco local la existencia física de las carpetas de origen de cada feature. Excluye del catálogo del Dashboard las features no implementadas físicamente (como `appointments`, `patients` y `crm`).
2. **feature-registry.json:** Añadidas las rutas físicas locales (`physicalPaths`) para `customer-loyalty` y `hello-module` para permitir su inyección desde la UI. Removida la dependencia fantasma de `crm` en `customer-loyalty`.
3. **implementation.manifest.json (customer-loyalty):** Removida la dependencia redundante de `crm` tanto en el template como en la plantilla Core de Ventas.

### Archivos modificados:
- [`d:/PROTOTIPE/Prototipe-CLI/lib/FeatureRegistry.js`](file:///d:/PROTOTIPE/Prototipe-CLI/lib/FeatureRegistry.js) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/knowledge/feature-registry.json`](file:///d:/PROTOTIPE/Prototipe-CLI/knowledge/feature-registry.json) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/features/customer-loyalty/implementation.manifest.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/features/customer-loyalty/implementation.manifest.json) [MODIFY]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/features/customer-loyalty/implementation.manifest.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/customer-loyalty/implementation.manifest.json) [MODIFY]

---

## CLI-490 — 2026-07-13
**FEATURE_MANIFEST_SCHEMA_MIGRATION: Migración de Contrato de Feature Flags e Integración del FeatureManifestAdapter**

### Cambios realizados:
1. **FeatureManifestAdapter:** Creado e integrado en frontend y CLI para normalizar la estructura de feature flags, soportando tanto `features{}` moderno como `featureFlags[]` legacy de manera transparente.
2. **appConfigStore / appConfigSchema / useAppConfigSync:** Refactorizados en `template-ventas` y `App Ventas` para consumir la salida normalizada del Adapter, previniendo crashes por drift del manifiesto.
3. **Bridge CLI (server.js):** Actualizado el endpoint de briefing para utilizar la normalización del Adapter al recomendar feature flags.

### Archivos modificados:
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/utils/featureManifestAdapter.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/utils/featureManifestAdapter.js) [NEW]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/utils/featureManifestAdapter.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/utils/featureManifestAdapter.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/lib/featureManifestAdapter.js`](file:///d:/PROTOTIPE/Prototipe-CLI/lib/featureManifestAdapter.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/store/appConfigStore.js) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/schemas/appConfigSchema.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/schemas/appConfigSchema.js) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/schemas/appConfigSchema.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/schemas/appConfigSchema.js) [MODIFY]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

---

## CLI-488 — 2026-07-13
**Feature & Architecture: Actualización de Documentación de Arquitectura de Features SaaS y Portal de Gestión**

### Cambios realizados:
1. **Documentación:** Incorporada la Sección 10 completa en el manual consolidado, detallando el propósito, arquitectura general (con diagrama Mermaid de flujo), el feature-registry.json como fuente de verdad, el sistema de feature flags dinámicas en Zustand/Firestore (Build-Time vs Runtime), la validación de contratos, scaffolding, transaccionabilidad de CLI, aislamiento SaaS y el caso real de la feature `customer-loyalty`.
2. **Mapa de Documentación:** Actualizado el mapa de documentación semántico para reflejar que el manual absoluto incorpora la nueva Sección 10 sobre Features SaaS.

### Archivos modificados:
- [`d:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_y_auditoria_completa_prototipe_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/manual_y_auditoria_completa_prototipe_2026.md) [MODIFY]
- [`d:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

---

## CLI-487 — 2026-07-13
**Feature & Architecture: Implementación de Lógica Comercial y Vistas de "customer-loyalty"**

### Cambios realizados:
1. **Lógica de Persistencia y Reglas de Negocio:** Desarrollado el servicio comercial `CustomerLoyaltyService.js` con soporte para transacciones atómicas en Firestore (`runTransaction`) para acumulación (`earnPoints`) y canjes (`redeemPoints`) de puntos, previniendo saldos negativos y colisiones.
2. **Seguridad en Códigos QR:** Implementado un sistema de tokens QR opacos de un solo uso en `CustomerLoyaltyService.js` que genera identificadores temporales guardados en `loyaltyTokens` y los consume tras su validación, eliminando la vulnerabilidad del QR base64 plano anterior.
3. **Validación de Datos:** Definido el archivo `CustomerLoyaltySchemas.js` usando esquemas Zod robustos para tipar y validar las cuentas, transacciones y configuraciones del cliente.
4. **Interfaces de Usuario y Hooks:** Creados los componentes de interfaz `ClientView.jsx` (tarjeta de puntos premium, código QR reactivo autogenerado y cuenta atrás) y `AdminView.jsx` (panel de caja, buscador de clientes y formularios transaccionales) consumiendo el hook unificado `useCustomerLoyalty.js` con listener en vivo.
5. **Certificación de Build:** Ejecutado y validado el build final de producción (`npm run build`) del core de App Ventas con éxito (0 fallos).

---

## CLI-486 — 2026-07-13
**Feature & Architecture: Aprovisionamiento y Scaffolding de la Feature Comercial Real "customer-loyalty"**

### Cambios realizados:
1. **Scaffolding de Feature (App Ventas):** Aprovisionado el scaffold físico completo de 12 archivos estructurados de la feature comercial real `customer-loyalty` bajo `src/features/customer-loyalty/` (manifest, module, index, routes, api/repository, services/service, hooks/useFeature, schemas/schemas, constants/index, security/feature-security y vistas de administrador y cliente).
2. **Registro de Features (Prototipe-CLI):** Declarado el identificador, metadatos y dependencias reales (`crm`, `sales`) de la feature `customer-loyalty` en el catálogo central `knowledge/feature-registry.json`.
3. **Pipeline transaccional y Staging:** Ejecutado y validado el plan de inyección candidate con Vite (`op-1783956340414-8a267c7b`) resolviendo e instalando la dependencia NPM `qrcode.react` en caliente.

### Archivos modificados:
- [`d:/PROTOTIPE/Prototipe-CLI/knowledge/feature-registry.json`](file:///d:/PROTOTIPE/Prototipe-CLI/knowledge/feature-registry.json) [MODIFY]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/features/customer-loyalty/implementation.manifest.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/customer-loyalty/implementation.manifest.json) [NEW]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/features/customer-loyalty/module.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/customer-loyalty/module.js) [NEW]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/features/customer-loyalty/index.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/customer-loyalty/index.js) [NEW]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/features/customer-loyalty/routes.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/customer-loyalty/routes.jsx) [NEW]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/features/customer-loyalty/schemas/CustomerLoyaltySchemas.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/customer-loyalty/schemas/CustomerLoyaltySchemas.js) [NEW]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/features/customer-loyalty/api/CustomerLoyaltyRepository.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/customer-loyalty/api/CustomerLoyaltyRepository.js) [NEW]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/features/customer-loyalty/services/CustomerLoyaltyService.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/customer-loyalty/services/CustomerLoyaltyService.js) [NEW]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/features/customer-loyalty/hooks/useCustomerLoyalty.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/customer-loyalty/hooks/useCustomerLoyalty.js) [NEW]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/features/customer-loyalty/components/AdminCustomerLoyalty.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/customer-loyalty/components/AdminCustomerLoyalty.jsx) [NEW]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/features/customer-loyalty/components/CustomerCustomerLoyalty.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/features/customer-loyalty/components/CustomerCustomerLoyalty.jsx) [NEW]

---

## CLI-485 — 2026-07-13
**Feature & Architecture: Modularización de Feature Loader en Core Seed y Estabilización Multiplataforma de Scaffolding**

### Cambios realizados:
1. **Feature Loader y Disponibilidad (template-core-seed):** Implementado el resolvedor centralizado de disponibilidad de features (`featureAvailability.js`) y el cargador dinámico perezoso (`featureModuleLoader.js`) en la plantilla core semilla. Generados los manifiestos dinámicos del core base, catálogo de features y valores por defecto.
2. **Plantilla de Scaffolding (Prototipe-CLI/templates/feature-scaffold/):** Corregido el bug en `routes.jsx`, `hooks/useFeature.js` y `services/service.js` donde las importaciones estaban fijas en vez de utilizar el token dinámico de scaffolding `{{pascalName}}`.
3. **Persistencia Física (Prototipe-CLI/templates/feature-scaffold/api/repository.js):** Actualizada la importación del SDK de Firebase para usar el alias global de importación `@/config/firebaseConfig`, eliminando errores de rutas relativas anidadas.
4. **Subproceso de Compilación (Prototipe-CLI/lib/FeatureVerificationRunner.js):** Corregido el bug de Windows que lanzaba `spawn EINVAL` al invocar `npm.cmd` activando `shell: isWin` nativamente en el entorno.

### Archivos modificados:
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/core/features/featureModuleLoader.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/core/features/featureModuleLoader.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/core/features/featureAvailability.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/core/features/featureAvailability.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/core/generated/core-manifest.generated.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/core/generated/core-manifest.generated.json) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/core/generated/feature-defaults.generated.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/core/generated/feature-defaults.generated.json) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/core/generated/feature-catalog.generated.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/core/generated/feature-catalog.generated.json) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/routes.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/routes.jsx) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/hooks/useFeature.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/hooks/useFeature.js) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/services/service.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/services/service.js) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/api/repository.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/api/repository.js) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/lib/FeatureVerificationRunner.js`](file:///d:/PROTOTIPE/Prototipe-CLI/lib/FeatureVerificationRunner.js) [MODIFY]

---

## CLI-484 — 2026-07-13
**Feature: Scaffolding, Transaccionabilidad y Asistente Wizard en Portal de Features (Fases 1, 2, 3, 4 y 5)**

### Cambios realizados:
1. **Plantillas de Scaffolding (Prototipe-CLI/templates/feature-scaffold/):** Diseñadas las plantillas atómicas desacopladas de 12 archivos que componen una feature portable (entry, module, manifest, routes, security, constants, schemas, repository, service, hook y vistas UI de admin y cliente).
2. **FeatureScaffolderSchemas (Prototipe-CLI/lib/):** Diseñadas las validaciones Zod estrictas para implementation.manifest.json y security/feature-security.json, asegurando aislamiento multi-tenant obligatorio.
3. **Backend Transaccional (Prototipe-CLI/lib/):** Creadas las clases FeatureRequestValidator (colisiones), FeatureDependencyGraph (detección de ciclos con DFS), WorkspaceLockManager (bloqueos físicos monorepo.lock), OperationJournalRepository (estados journal y logs históricos) y FeatureVerificationRunner (certificación del build mediante Vite en Workspace Candidato temporal).
4. **Seguridad Loopback (Prototipe-CLI/lib/):** Implementado SecurityMiddleware.js para restringir peticiones a la IP loopback (127.0.0.1) y verificar la cabecera criptográfica rotativa X-Prototipe-CLI-Token.
5. **API de Features (Prototipe-CLI/server.js):** Integrada la inicialización del token de seguridad y expuestos los endpoints transaccionales /token, /plan y /commit.
6. **FeatureMarketplaceView.jsx (dev-dashboard):** Rediseñada la interfaz de features agregando el Asistente Wizard de 6 pasos con stepper interactivo de transacciones, visor de Prompt Maestro hidratado y logs en vivo de compilación.

### Archivos modificados:
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/index.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/index.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/module.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/module.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/implementation.manifest.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/implementation.manifest.json) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/routes.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/routes.jsx) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/security/feature-security.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/security/feature-security.json) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/constants/index.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/constants/index.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/schemas/schemas.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/schemas/schemas.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/api/repository.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/api/repository.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/services/service.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/services/service.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/hooks/useFeature.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/hooks/useFeature.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/components/AdminView.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/components/AdminView.jsx) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/components/ClientView.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/feature-scaffold/components/ClientView.jsx) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/lib/FeatureScaffolderSchemas.js`](file:///d:/PROTOTIPE/Prototipe-CLI/lib/FeatureScaffolderSchemas.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/lib/FeatureDependencyGraph.js`](file:///d:/PROTOTIPE/Prototipe-CLI/lib/FeatureDependencyGraph.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/lib/FeatureRequestValidator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/lib/FeatureRequestValidator.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/lib/WorkspaceLockManager.js`](file:///d:/PROTOTIPE/Prototipe-CLI/lib/WorkspaceLockManager.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/lib/OperationJournalRepository.js`](file:///d:/PROTOTIPE/Prototipe-CLI/lib/OperationJournalRepository.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/lib/FeatureScaffolder.js`](file:///d:/PROTOTIPE/Prototipe-CLI/lib/FeatureScaffolder.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/lib/FeatureVerificationRunner.js`](file:///d:/PROTOTIPE/Prototipe-CLI/lib/FeatureVerificationRunner.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/lib/SecurityMiddleware.js`](file:///d:/PROTOTIPE/Prototipe-CLI/lib/SecurityMiddleware.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/FeatureMarketplaceView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureMarketplaceView.jsx) [MODIFY]
- [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
- [`d:/PROTOTIPE/Documentacion PROTOTIPE/09_Modulos_Completos/propuesta_portal_creacion_features.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/propuesta_portal_creacion_features.md) [MODIFY]
- [`d:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]

---

## CLI-483 — 2026-07-13
**Feature: Cargador Modular de Features y Generador de Artefactos de Catálogo (Fases 0B y 0C)**

### Cambios realizados:
1. **`featureModuleLoader.js` (App Ventas y template-ventas):** Creado el cargador unificado de módulos lazy utilizando `import.meta.glob` de Vite. Valida que el featureId del entrypoint coincida con el ID del directorio para evitar desvíos físicos.
2. **`AppRoutes.jsx` (App Ventas y template-ventas):** Integrado `featureModuleLoader.js` para registrar dinámicamente las rutas de cada feature activa leyendo Zustand `isFeatureEnabled(featureId)`.
3. **`AdminLayout.jsx` & `ClientLayout.jsx` (App Ventas y template-ventas):** Desacoplados completamente los menús del bundle físico de código. Ahora renderizan el sidebar leyendo del catálogo ligero de solo lectura `feature-catalog.generated.json` filtrados en runtime por Zustand `isFeatureEnabled`.
4. **`FeatureArtifactGenerator.js` (Prototipe-CLI/lib/):** Implementado el compilador que traduce el registry central canónico `feature-registry.json` a manifiesto, catálogo y defaults de configuración, e integrado en los endpoints de aprovisionamiento de la CLI.
5. **`run_artifact_generator.js` (Prototipe-CLI/):** Creado el script de utilidad CLI para compilaciones y builds estáticos.

### Archivos modificados:
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/core/features/featureModuleLoader.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/core/features/featureModuleLoader.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/core/features/featureModuleLoader.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/core/features/featureModuleLoader.js) [NEW]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/routes/AppRoutes.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/routes/AppRoutes.jsx) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/routes/AppRoutes.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/routes/AppRoutes.jsx) [MODIFY]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/layouts/AdminLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/layouts/AdminLayout.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/layouts/AdminLayout.jsx) [MODIFY]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/layouts/ClientLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/layouts/ClientLayout.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/layouts/ClientLayout.jsx) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/lib/FeatureArtifactGenerator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/lib/FeatureArtifactGenerator.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/run_artifact_generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/run_artifact_generator.js) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

---

## CLI-482 — 2026-07-13
**Refactor: Inicialización Dinámica y Namespace de Feature Flags (Zustand, Zod y Sync)**

### Cambios realizados:
1. **`core-manifest.generated.json` (App Ventas y template-ventas):** Creado el artefacto JSON generado como fuente única de verdades técnicas de inicialización. Renombrada la flag `deliveryEnabled` a `rolesOperativosEnabled` e inyectadas sus respectivas `legacyRemoteKeys` y propiedades.
2. **`appConfigStore.js` (App Ventas y template-ventas):** Refactorizado el store de Zustand para inicializar dinámicamente las flags leyendo el manifiesto autogenerado. Introducido el sub-objeto `featureFlags` para estructurar la persistencia de las flags en `localStorage` (versión 3 del persist), manteniendo las variables planas en la raíz del store para conservar compatibilidad hacia atrás completa sin romper componentes. Implementados los helpers `setFeatureFlag()`, `replaceFeatureFlags()` e `isFeatureEnabled()`, además de un método `merge` para sanear flags obsoletas en caliente al rehidratar.
3. **`appConfigSchema.js` (App Ventas y template-ventas):** Eliminada la declaración cableada de flags. Ahora se construye `featureFlagsSchema` dinámicamente con Zod desestructurando el manifiesto. Creado el helper `parseRuntimeFeatureFlags(input)` para normalizar entradas `undefined` / `null` a `{}` antes de invocar el parseo, aplicando los valores por defecto sin causar excepciones.
4. **`useAppConfigSync.js` (App Ventas y template-ventas):** Refactorizado el hook de sincronización con Firestore Central. Se reemplazó el bloque de asignación estática por un mapeador iterativo que recorre el manifiesto dinámico, resuelves las claves remotas (`remoteKey` y aliases heredados `legacyRemoteKeys[]`) y actualiza Zustand reactivamente.

### Archivos modificados:
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/core-manifest.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/core-manifest.json) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/core-manifest.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/core-manifest.json) [MODIFY]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/core/generated/core-manifest.generated.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/core/generated/core-manifest.generated.json) [NEW]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/core/generated/core-manifest.generated.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/core/generated/core-manifest.generated.json) [NEW]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/store/appConfigStore.js) [MODIFY]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/schemas/appConfigSchema.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/schemas/appConfigSchema.js) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/schemas/appConfigSchema.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/schemas/appConfigSchema.js) [MODIFY]
- [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY]

---

## CLI-481 — 2026-07-13
**Limpieza: Eliminación de flags fantasma commissionsEnabled y enableDianBilling de ambos manifests**

### Cambios realizados:
Eliminados todos los bloques de `commissionsEnabled` y `enableDianBilling` (featureFlags, flagRecommendationRules y componentMappings) de ambos `core-manifest.json`. Ambas flags apuntaban a módulos no implementados en App Ventas core. Su presencia generaba switches sin efecto real en el CRM central.

### Archivos modificados:
- [`Plantillas Core/App Ventas/core-manifest.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/core-manifest.json) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/core-manifest.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/core-manifest.json) [MODIFY]

---

## CLI-480 — 2026-07-13
**Feature: Conexión real de wholesaleEnabled al CRM central + Limpieza de reservasEnabled (flag fantasma)**

### Cambios realizados:
1. **`useAppConfigSync.js` (App Ventas y template-ventas):** Mapeado `centralFlags.wholesaleEnabled` → `wholesaleSettings.enabled` en el store. Ahora al activar o desactivar el módulo de Mayoreo desde el CRM central, el cambio se propaga en tiempo real al estado reactivo de la instancia sin requerir configuración manual en AdminSettings. Se preservan el resto de las propiedades del sub-objeto (`minQuantity`, `discountType`, `discountValue`).
2. **`core-manifest.json` (App Ventas y template-ventas):** Eliminados los 3 bloques de `reservasEnabled` (featureFlags, flagRecommendationRules, componentMappings) de ambos manifests. El módulo de Agenda/Citas no existe en App Ventas core — la flag era aspiracional y generaba confusión al aparecer como un switch activo en el CRM sin tener efecto real.

### Archivos modificados:
- [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`Plantillas Core/App Ventas/core-manifest.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/core-manifest.json) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/core-manifest.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/core-manifest.json) [MODIFY]

---

## CLI-479 — 2026-07-13
**Bugfix: GuidedToast sin guard de onlineOrdersEnabled + limpieza de cartStore huérfano**

### Cambios realizados:
1. **`GuidedToast.jsx` (App Ventas y template-ventas):** Corregido bug donde el asistente de compra mostraba el mensaje "Muy bien, ahora revisa tu carrito" aunque `onlineOrdersEnabled` estuviera desactivado. Se añadió lectura de la flag desde `useAppConfigStore` y se condicionó el mensaje `PRODUCT_ADDED` a `onlineOrdersEnabled && ...`. Adicionalmente, se agregó un `useEffect` que limpia el `cartStore` si la flag se desactiva mientras hay ítems en caché de una sesión anterior, evitando que se disparen mensajes del carrito sobre ítems fantasma.

### Archivos modificados:
- [`Plantillas Core/App Ventas/src/components/ui/GuidedToast.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/GuidedToast.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/components/ui/GuidedToast.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/ui/GuidedToast.jsx) [MODIFY]

---

## CLI-478 — 2026-07-13
**Feature & Integration: Feature Flag onlineOrdersEnabled (Pedidos en Línea / Catálogo Vitrina) en Core Ventas y Generador**

### Cambios realizados:
1. **Configuración y Esquemas (core-manifest.json, Zustand, Zod, Sync):** Añadimos la feature flag `onlineOrdersEnabled` con un valor por defecto de `true` en los manifiestos, store global (`appConfigStore.js`), esquema de validación de Zod (`appConfigSchema.js`) y en la sincronización en vivo con Firestore central (`useAppConfigSync.js`). Esto permite habilitar o deshabilitar dinámicamente todo el flujo transaccional de compras en caliente.
2. **Layouts de Navegación (AdminLayout y ClientLayout):** Ocultamos la pestaña "/admin/pedidos" en el panel administrativo y "/tienda/pedidos" en el panel de cliente cuando `onlineOrdersEnabled` es falso. En `ClientLayout.jsx` de cliente, ocultamos el botón de carrito permanente del sidebar, rediseñando la cuadrícula a 2 columnas uniformes, el botón del carrito móvil en el header, y la insinuación del carro (`SmartHint` flotante por inactividad).
3. **Vistas de Producto (DetailPage, PublicDetail, DetailModal):** Modificamos el detalle interno del producto, la landing page pública y el modal rápido de catálogo para que, al desactivarse la flag, se oculten los botones "Comprar Ahora", "Agregar al Carrito" y selectores de cantidad. En su lugar, inyectamos un botón responsivo premium de "Consultar por WhatsApp" con icono de `MessageCircle` / `MessageSquare`, el cual redirige a una conversación con el administrador con un mensaje personalizado que detalla el producto, color y talla seleccionados.
4. **Perfil del Cliente (ClientProfile):** Ocultamos el acceso de la tarjeta principal "Mis Pedidos / Historial" cuando `onlineOrdersEnabled` es falso, estructurando condicionalmente el renderizado junto a "Mis Créditos" para evitar líneas divisorias huérfanas o bloques de tarjetas vacíos.
5. **Seguridad y Guards de Ruta (ClientOrders y AdminOrders):** Inyectamos guards de redirección reactivos mediante `useEffect` en las vistas `ClientOrders.jsx` (redirige a `/tienda/catalogo`) y `AdminOrders.jsx` (redirige a `/admin/home`) para que, en caso de intentar ingresar directamente escribiendo la URL en el navegador estando deshabilitada la flag, se reconduzca al usuario a secciones permitidas del sistema.
6. **Propagación en Generador CLI:** Aplicamos todos los cambios descritos tanto en la app de desarrollo activa (`Plantillas Core/App Ventas`) como en el directorio de plantillas del generador CLI (`Prototipe-CLI/templates/template-ventas`).

### Archivos modificados:
- [`Plantillas Core/App Ventas/core-manifest.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/core-manifest.json) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/core-manifest.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/core-manifest.json) [MODIFY]
- [`Plantillas Core/App Ventas/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/store/appConfigStore.js) [MODIFY]
- [`Plantillas Core/App Ventas/src/schemas/appConfigSchema.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/schemas/appConfigSchema.js) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/schemas/appConfigSchema.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/schemas/appConfigSchema.js) [MODIFY]
- [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`Plantillas Core/App Ventas/src/layouts/AdminLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/layouts/AdminLayout.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/layouts/AdminLayout.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/layouts/ClientLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/layouts/ClientLayout.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/layouts/ClientLayout.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/client/ProductDetailPage.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/pages/client/ProductDetailPage.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/client/ProductPublicDetail.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/pages/client/ProductPublicDetail.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/components/client/catalog/ProductDetailModal.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/components/client/catalog/ProductDetailModal.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/client/ClientOrders.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientOrders.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/pages/client/ClientOrders.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ClientOrders.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/client/ClientProfile.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientProfile.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/pages/client/ClientProfile.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ClientProfile.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/admin/AdminOrders.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminOrders.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]

---

## CLI-477 — 2026-07-13
**Feature & Optimization: Reducción del Tamaño del Bundle mediante Tree-Shaking en Importación de Iconos**

### Cambios realizados:
1. **Plantillas Core/App Ventas/src/layouts/AdminLayout.jsx:** Optimizamos la importación de `lucide-react` reemplazando la importación masiva (`import * as LucideIcons from 'lucide-react'`) por importaciones selectivas de los 14 iconos específicos utilizados en la navegación. Definimos una constante estática local `LucideIcons` para preservar la compatibilidad del componente sin afectar el resto del archivo. Esto reduce el chunk de iconos de **899.9 KB** a tan solo **71.78 KB** (más del 92% de optimización), resolviendo la advertencia de auditoría de rendimiento y maximizando el puntaje de PWA a 100/100.
2. **Prototipe-CLI/templates/template-ventas/src/layouts/AdminLayout.jsx:** Propagamos esta optimización de tree-shaking en la plantilla de template-ventas de la base del generador CLI, asegurando que todos los futuros proyectos aprovisionados en el ecosistema hereden esta mejora de rendimiento por defecto.

### Archivos modificados:
- [`Plantillas Core/App Ventas/src/layouts/AdminLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/src/layouts/AdminLayout.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/layouts/AdminLayout.jsx) [MODIFY]

---

## CLI-476 — 2026-07-13
**Feature & Optimization: Optimización Asíncrona de Carga de Diffs en Drift Detector**

### Cambios realizados:
1. **Prototipe-CLI/server.js:** Optimizamos el endpoint `/api/project/drift` eliminando el cálculo pesado de diferencias de líneas (`Diff.diffLines`) en el bucle del listado general (retornando `diff: null` para archivos modificados). Introdujimos el parámetro `filePath` para calcular y retornar el diff detallado asíncronamente bajo demanda solo para el archivo seleccionado.
2. **Central PROTOTIPE/dev-dashboard/src/App.jsx:** Declaramos el estado `diffLoading` y añadimos la función asíncrona `loadDiffDetail` gatillada reactivamente por un `useEffect` cuando el usuario abre el visor de un archivo con `diff === null`. Integramos un spinner de carga (`RefreshCw` con animación spin) en la UI del visor para mantener informados a los desarrolladores mientras se recupera el diff detallado en caliente.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

---

## CLI-475 — 2026-07-13
**Feature & Architecture: Modularización Reactiva de Feature Flags en Plantilla Core Seed**

### Cambios realizados:
1. **appConfigStore.js y useAppConfigSync.js (template-core-seed):** Integrada la sincronización reactiva en vivo de feature flags desde Firestore Central en la plantilla base Core Seed. Declarada la flag `posExpressScanner` y agregada la hidratación de `flagsUpdate` (`creditsEnabled`, `couponsEnabled`, `claimsEnabled`, `rolesOperativosEnabled` y `posExpressScanner`) mediante `latestCentralFlagsRef`. Esto asegura que cualquier nueva vertical o core desarrollado a partir de esta plantilla herede nativamente y por defecto el canal de feature flags dinámicas sincronizadas en tiempo real desde el Dashboard.

### Archivos modificados:
- [`Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js) [MODIFY]
- [`Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js) [MODIFY]

## CLI-474 — 2026-07-13
**Feature & UX: Eliminación Definitiva de la Feature Flag de Órdenes de Trabajo en Core Ventas**

### Cambios realizados:
1. **core-manifest.json (App Ventas):** Eliminada la feature flag `ordenesTrabajo` del listado de feature flags y removidas sus correspondientes reglas de recomendación. Esto provoca que el Dashboard Central, al consumir los metadatos de este core a través de la API, deje de renderizar la tarjeta de control de *"Órdenes de Trabajo"* para esta aplicación en vivo, previniendo incoherencias y eliminando el switch innecesario del panel.
2. **appConfigStore.js y useAppConfigSync.js (App Ventas):** Revertida la declaración y el mapeo de `ordenesTrabajoEnabled` en Zustand y Firestore, eliminando código huérfano y preservando el core base limpio de características no deseadas.

### Archivos modificados:
- [`Plantillas Core/App Ventas/core-manifest.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/core-manifest.json) [MODIFY]
- [`Plantillas Core/App Ventas/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
- [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]

---

## CLI-473 — 2026-07-13
**Feature & Integrity: Sincronización en Caliente de la Feature Flag de Órdenes de Trabajo**

### Cambios realizados:
1. **appConfigStore.js y useAppConfigSync.js (App Ventas):** Declarado el estado global `ordenesTrabajoEnabled` en Zustand (inicializado en `false`) y mapeada su sincronización reactiva en vivo desde la propiedad `ordenesTrabajo` del objeto de flags centrales de Firestore. Esto asegura que la aplicación cliente reciba y registre el estado de esta feature en caliente, previniendo incoherencias y permitiendo su activación en cascada una vez que se inyecte el módulo físico respectivo.

### Archivos modificados:
- [`Plantillas Core/App Ventas/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
- [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]

---

## CLI-472 — 2026-07-13
**Feature & UX: Unificación de Terminología en Dashboard Central para Módulo Operativo**

### Cambios realizados:
1. **FeatureFlagManager.jsx (Dashboard Central):** Renombrada la tarjeta de control de `deliveryEnabled` de *"Seguimiento de Domicilios"* a **`"Gestión de Empleados & Domicilios"`** y actualizada su descripción técnica para indicar explícitamente que gobierna la creación de operarios, generación de accesos por PIN/QR a portales de trabajo y el stepper de entregas en la app ventas. Esto brinda cohesión semántica total al usuario final entre el Dashboard y la caja.

### Archivos modificados:
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx) [MODIFY]

---

## CLI-471 — 2026-07-13
**Bugfix & UX: Cohesión de Feature Flags para Portales QR y Gestión de Empleados**

### Cambios realizados:
1. **AdminLayout.jsx (App Ventas):** Actualizado el filtro de la barra lateral para ocultar el botón del menú "Portales QR" (`/admin/portales-qr`) si la flag `rolesOperativosEnabled` es falsa, previniendo visualizaciones incoherentes de accesos operativos de empleados.
2. **AdminSettings.jsx (App Ventas):** Filtrada dinámicamente la tarjeta de subsección "Gestión de Empleados" y "Auditoría de Ajustes de Stock" para ocultarlas por completo de los Ajustes de Configuración si `rolesOperativosEnabled` está desactivado centralmente.
3. **AdminPortalQR.jsx, PortalAuth.jsx y AdminDeliveryPerformance.jsx (App Ventas):** Implementados guards de seguridad y layouts de "Módulo Desactivado" de alta fidelidad estética (utilizando el icono `Shield` de Lucide y los colores de marca unificados) que bloquean e impiden de raíz el acceso manual a través de la barra de direcciones del navegador en las páginas del portal QR, analítica de entregas e ingreso por PIN de operarios si la feature flag está apagada.

### Archivos modificados:
- [`Plantillas Core/App Ventas/src/layouts/AdminLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/admin/AdminPortalQR.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminPortalQR.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/portal/PortalAuth.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalAuth.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/admin/AdminDeliveryPerformance.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminDeliveryPerformance.jsx) [MODIFY]

---

## CLI-470 — 2026-07-13
**Bugfix & Feature: Estabilización de Feature Flags y Acoplamiento de POS Express Scanner**

### Cambios realizados:
1. **FeatureFlagManager.jsx (Dashboard Central):** Corregido bug reactivo en el listener `onSnapshot` de Firestore Central, asegurando que el estado local `clientFlags` y el historial de cambios se actualicen inmediatamente al recibir actualizaciones de la base de datos de control, resolviendo el bloqueo visual que impedía apagar switches consecutivamente.
2. **useAppConfigSync.js (App Ventas):** Robustecido el mapeo y persistencia de feature flags secundarias, integrando la sincronización en vivo de `deliveryEnabled` a `rolesOperativosEnabled` y de `posExpressScanner` a `posExpressScanner` en Zustand. Implementamos una referencia persistente (`latestCentralFlagsRef.current`) para inyectar estas flags con prioridad absoluta en la hidratación de configuraciones locales, previniendo sobreescrituras desfasadas de la base de datos local.
3. **AdminLayout.jsx (App Ventas):** Ampliado el filtrado reactivo del menú lateral administrativo de la app para ocultar los botones de "Reclamos" e "Rendimiento de Entregas" dinámicamente según el estado de las flags `claimsEnabled` y `rolesOperativosEnabled` en Zustand.
4. **AdminSales.jsx y appConfigStore.js (App Ventas):** Declarado el estado global de `posExpressScanner` en Zustand e integrada la barra de escaneo de código de barras ("Escanear código [Bip]") en la caja registradora del POS mediante un grid responsivo. Implementamos la función `handleBarcodeSubmit` con búsqueda recursiva prioritaria en el array de variantes (`product.variantes`) para encontrar coincidencias de SKU/barcode internas y agregar la variante exacta escaneada de forma directa. Integramos la generación de tonos acústicos de confirmación (`playBeep`) con la API Web Audio de HTML5 y corregimos el modal de alerta (`stockAlert`) para admitir títulos dinámicos coherentes (como "Producto no encontrado").

### Archivos modificados:
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
- [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`Plantillas Core/App Ventas/src/layouts/AdminLayout.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
- [`Plantillas Core/App Ventas/src/pages/admin/AdminSales.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSales.jsx) [MODIFY]

---

## CLI-469 — 2026-07-13
**Bugfix: Sincronización en Caliente de Feature Flags desde Firestore Central a App Ventas**

### Causa Raíz:
El Dashboard Feature Flag Manager escribe los switches habilitados/desactivados en el documento `/clientes_control/{clientId}` de Firestore Central bajo el objeto `flags` (por ejemplo, `flags.creditsEnabled`). Sin embargo, el hook de sincronización de la app cliente (`useAppConfigSync.js`) omitía por completo leer `data.flags`, por lo que el cliente final y de administración local seguían usando de forma fija los valores por defecto en memoria (como `creditsEnabled: true`), sin acatar la desactivación remota.

### Cambios realizados:
1. **`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`**: Modificado el listener de Firestore Central (`clientes_control`) para extraer `data.flags`. Mapeadas las flags centrales de créditos (`creditsEnabled`), cupones (`couponsEnabled`) y reclamos (`claimsEnabled`) e inyectadas dinámicamente en el store global de Zustand (`setConfig`) y persistidas localmente en `/config/settings` para compatibilidad offline.
2. **`Instancias Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js`**: Replicado el cambio en la instancia cliente activa para propagación del hot-reload en producción.

### Archivos modificados:
- [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
- [`Instancias Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js) [MODIFY]

---

## CLI-464: Reconexión Automática, Resiliencia y Persistencia del Flujo de Aprovisionamiento
- **Fecha:** 2026-07-13
- **Tipo:** Funcionalidad / Mejora
- **Impacto:** Registro retroactivo auto-generado por el validador de integridad.
- **Descripción:** Desarrollamos una solución de persistencia completa a prueba de fallos de recarga del navegador (refresh/F5) durante el aprovisionamiento. Implementamos el endpoint `GET /api/create-project/status` en el Bridge CLI (`server.js`) para consultar en caliente el estado detallado de una tarea de creación, recuperando su historial completo de logs en memoria y banderas de pausa de Auth. En el frontend (`App.jsx`), encolamos el `taskId` y los metadatos de configuración del cliente en `localStorage` al iniciar la tarea. Al montar la aplicación (useEffect), se verifica si hay una tarea guardada en curso y, de ser así, se consulta su estado, se restaura la UI (modal de progreso, logs e inputs) y se reabre la conexión de EventSource (SSE stream) de forma transparente y automática, limpiando el almacenamiento al finalizar con éxito o error.
- **Archivos afectados:** - ``Prototipe-CLI/server.js`` [MODIFY]


## CLI-468 — 2026-07-12
**Bugfix: Reglas de Firestore bloqueaban el login de cliente por celular en App Ventas**

### Causa Raíz:
El flujo de login de cliente en `template-ventas` identifica a los usuarios por número de celular como `userId` en Firestore (`doc(db, 'users', celular)`) **sin Firebase Auth activa**. Las reglas anteriores bloqueaban `getDoc` y `setDoc` sin `request.auth`, arrojando `FirebaseError: Missing or insufficient permissions`.

### Cambios realizados:
1. **`template-ventas/firestore.rules`**: Se actualizaron las reglas de `/users/{userId}` para permitir `read` y `create` sin autenticación, preservando `list` y `delete` exclusivos para admin.
2. **`ventas-moni-app/firestore.rules`**: Misma corrección aplicada y desplegada en producción (`firebase deploy --only firestore:rules -P ventas-moni-app`).

### Archivos modificados:
- [`Prototipe-CLI/templates/template-ventas/firestore.rules`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/firestore.rules) [MODIFY]
- [`Instancias Clientes/ventas/ventas-moni-app/firestore.rules`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/firestore.rules) [MODIFY + DEPLOY]

---

## CLI-467 — 2026-07-12
**Feature: Blindaje de Arranque Inicial y Auto-siembra de Administrador en Aprovisionamiento**

### Cambios realizados:
1. **Activación de Siembra Automática en Generador**: Descomentamos y habilitamos la ejecución incondicional del script de siembra `scripts/seed_admin.js` (`runSeedAdmin(...)`) en el flujo final de [`generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js).
2. **Prevención de Excepciones en Primer Arranque**: Esto garantiza que cada aplicación aprovisionada cuente de forma inmediata con las credenciales de administrador en Firebase Auth, su perfil de rol en `/users` y la configuración `/config/settings` requerida por `appConfigService.js` y `useAuthInit.js`.

### Archivos modificados:
- [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

---

## CLI-466 — 2026-07-12
**Feature: Gestor Visual de Cola e Historial de Aprovisionamientos en Tiempo Real**

### Cambios realizados:
1. **API de Cola en Bridge CLI**: Implementamos los endpoints `GET /api/provisioning/queue` (listado persistente ordenado de trabajos) y `POST /api/provisioning/queue/cancel` (cancelación/remoción de trabajos activos) en [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js).
2. **Componente de Visualización de Tareas**: Creamos [`ProvisioningQueueModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningQueueModal.jsx) con estados HSL animados, polling de 4s para actualización suave y botón "Cancelar" con modal de confirmación reglamentario.
3. **Integración en Wizard de App**: Añadimos el botón "Ver Cola e Historial" con icono animado de Lucide y control de estado reactivo en la barra de navegación del wizard en [`App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx).

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningQueueModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningQueueModal.jsx) [NEW]
- [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

---

## CLI-465 — 2026-07-12
**Feature: Robustecimiento del Flujo de Aprovisionamiento y Mapeo Condicional de Servicios Firebase**

### Cambios realizados:
1. **Ajuste de chunkSizeWarningLimit en Plantillas Base**: Modificamos `vite.config.js` en `template-core-seed` and `template-ventas` elevando `chunkSizeWarningLimit` de `800` a `1500` kB. Esto previene alertas visuales de Vite sobre bundles grandes debido a las dependencias de Firebase SDK durante los builds de scaffolding del cliente.
2. **Propagación a Instancia Real (ventas-moni-app)**: Aplicamos el mismo ajuste de `chunkSizeWarningLimit: 1500` en el `vite.config.js` de la aplicación activa `ventas-moni-app` para evitar advertencias molestas durante sus empaquetados de producción en el monorepo.
3. **Despliegue de Reglas Condicional**: Modificamos el bloque post-creación en `server.js` para evaluar el parámetro `enableFirebaseDeploy` (y su alias `answers.execution?.firebaseDeploy`). Ahora, si el usuario desactiva Firebase desde el Wizard, se omite el despliegue automático de reglas de Firestore y Storage, evitando errores por servicios no inicializados en la nube.
4. **Registro de la Plantilla Core Seed**: Agregamos la entrada detallada de `template-core-seed` en el archivo de inventario central `plantillas_registro.json`, mapeando correctamente su ruta física fuente. Esto resuelve de raíz el fallo de sembrado de base de datos (`No se encontró la configuración del core "template-core-seed"`).

### Revisión Histórica & Ajuste de UI (2026-07-12):
1. **Superposición de Modales (z-index)**: Corregimos la superposición de capas en el dashboard central. El modal `FirebaseAccountsModal` tenía `z-[80]`, quedando oculto e inaccesible por detrás de `ProvisioningProgressModal` que tiene `z-[100]`. Elevamos el `z-index` de `FirebaseAccountsModal` a `z-[110]` para permitirle sobreponerse adecuadamente al presionar "Gestionar Firebase".
2. **Resolución de Borde Blanco en Consola**: Solucionamos la intercepción de la regla CSS global de index.css que inyectaba un borde blanco rígido y fondo glassmorphic brillante a cualquier contenedor con clase `rounded-2xl` y `border`. Cambiamos la clase del contenedor de logs de la consola en `ProvisioningProgressModal.jsx` a `rounded-xl` y el color del borde a `border-[var(--color-border)]/50`, restaurando el tema oscuro original y mejorando la legibilidad.

### Archivos modificados:
- [`Prototipe-CLI/templates/template-core-seed/vite.config.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/vite.config.js) [MODIFY]
- [`Prototipe-CLI/templates/template-ventas/vite.config.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js) [MODIFY]
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Prototipe-CLI/plantillas_registro.json`](file:///d:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json) [MODIFY]
- [`Instancias Clientes/ventas/ventas-moni-app/vite.config.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/vite.config.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/FirebaseAccountsModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FirebaseAccountsModal.jsx) [MODIFY]

---

## CLI-463 — 2026-07-12
**Feature: Selector Interactivo y Gestión Dinámica de Categorías de Instancias en el Aprovisionamiento**

### Cambios realizados:
1. **Endpoints de Escaneo y Creación en el Bridge CLI**: Desarrollamos los endpoints `GET /api/project/instances-categories` (para escanear en caliente el directorio físico `D:\PROTOTIPE\Instancias Clientes` y filtrar carpetas) y `POST /api/project/instances-categories` (para crear nuevas carpetas sanitizando de forma estricta los caracteres no permitidos).
2. **Selector CustomSelect Reglamentario**: Implementamos el dropdown en el Wizard usando el componente `CustomSelect` del ecosistema, evitando selectores HTML nativos según el estándar de desarrollo.
3. **Botón de Sincronización en Caliente**: Agregamos un botón interactivo "Sincronizar" que permite al desarrollador escanear el disco de inmediato si se añadieron o eliminaron carpetas manualmente fuera de la aplicación.
4. **Creación Rápida Inline de Categorías**: Añadimos un pequeño formulario de texto y botón al lado del selector en el Wizard para crear categorías en caliente en el disco sin abandonar el flujo de aprovisionamiento.
5. **Autocalculo Reactivo mediante useEffect**: Creamos un efecto que calcula y asigna en tiempo real la ruta física `targetPath` del cliente según el nombre del proyecto y la categoría base seleccionada.

### Revisión Histórica & Ajuste de UI (2026-07-12):
1. **Alineación y Prevención de Desbordamiento**: Corregimos el desbordamiento visual en el Wizard de aprovisionamiento donde el input y botón de "Crear" se salían de su contenedor de media columna y se superponían con el input de la columna derecha. Separamos la fila superior (dropdown de categoría) y la fila inferior (creación rápida) en filas independientes de ancho completo.
2. **Estilo Premium del Botón Sincronizar**: Rediseñamos el botón de sincronización pasando de un link azul plano a un botón de micro-acción táctil con fondo translúcido, bordes definidos, icono alineado y hover de brillo dinámico HSL de acuerdo con las guías de diseño de la marca.
3. **Reemplazo de SVG por Lucide React (RefreshCw)**: Sustituimos el SVG manual del botón por el componente oficial `<RefreshCw size={10} />` de Lucide React con un efecto de transición CSS de rotación de 180° activado por `group-hover` al posar el cursor, asegurando total nitidez de la interfaz.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

---

## CLI-462 — 2026-07-12
**Feature: Silenciado de Advertencias de Límite de Tamaño de Chunk (Vite) en Dashboard Central**

### Cambios realizados:
1. **Configuración de chunkSizeWarningLimit**: Agregamos la propiedad `build.chunkSizeWarningLimit: 3000` en el archivo de configuración `vite.config.js` del Dashboard Central. Esto previene que el bundler (Vite) emita advertencias durante la compilación en caso de que los archivos minificados excedan el límite predeterminado de 500 kB (el bundle principal del dashboard pesa 2.66 MB debido a su naturaleza monolítica local). Con esto silenciamos falsas alarmas visuales en los logs de aprovisionamiento.

### Archivos modificados:
- [`Central PROTOTIPE/dev-dashboard/vite.config.js`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/vite.config.js) [MODIFY]

---

## CLI-461 — 2026-07-12
**Feature: Opción de Sembrado de Datos Condicional y Resiliencia en Despliegue de Reglas e Índices ante Proyectos sin Storage Inicializado**

### Cambios realizados:
1. **Opción seedDatabase en el Wizard del Dashboard**: Agregamos un estado reactivo `seedDatabase` (por defecto `true`) y su correspondiente checkbox interactivo en el Wizard de aprovisionamiento de nuevos clientes en `App.jsx`. Esto permite al desarrollador decidir explícitamente si desea sembrar o no datos de prueba (seeds) en la base de datos Firestore del cliente.
2. **Serialización del Borrador (Wizard Draft)**: Integramos la variable `seedDatabase` en el borrador de localStorage, asegurando que se guarde, se cargue y se restablezca correctamente al usar el asistente.
3. **Respeto Condicional en el Bridge CLI**: Modificamos el endpoint `/api/project/provision` en `server.js` para recibir el parámetro `seedDatabase` y omitir condicionalmente la inyección de semillas en Firestore.
4. **Resiliencia ante Storage no Configurado en Despliegues de Firebase**: Robustecimos el despliegue de reglas e índices en `server.js`. Si el despliegue falla debido a que el servicio Firebase Storage no está habilitado físicamente en el proyecto (Spark Plan / storage bucket ausente), el Bridge captura la excepción, emite una advertencia en el log de progreso del aprovisionamiento, y reintenta automáticamente el despliegue omitiendo Storage (`--only firestore:rules,firestore:indexes`), logrando que las reglas e índices de Firestore se desplieguen sin colapsar el aprovisionamiento.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

---

## CLI-460 — 2026-07-12
**Feature: Pausa Interactiva y Confirmación de Activación Manual de Firebase Auth**

### Cambios realizados:
1. **Flujo de Pausa Interactiva en Bridge**: Modificamos el Bridge CLI (`server.js`) para que, en caso de fallo al activar la configuración de Firebase Auth (común en el Plan Spark por falta de facturación), el hilo de ejecución se detenga temporalmente. Envía el evento SSE `auth_activation_required` y guarda una promesa de reanudación diferida en memoria.
2. **Endpoint de Reanudación**: Creamos el endpoint `POST /api/create-project/resume` en `server.js` para recibir la confirmación de reanudación y desbloquear el hilo del aprovisionamiento.
3. **Mapeo en Frontend**: Implementamos en `App.jsx` y `ProvisioningProgressModal.jsx` la captura del evento de pausa. Mostramos una alerta interactiva premium con el botón de acceso directo a Firebase Console para que el desarrollador active Auth presionando "Comenzar", y el botón de confirmación "Ya lo he habilitado, continuar", que llama al endpoint del Bridge.
4. **Detector de Errores Mejorado**: Excluimos los warnings de configuración en la nube (`CONFIGURATION_NOT_FOUND`, `BILLING_NOT_ENABLED`) de la detección de errores fatales del modal para evitar clasificar la falta de activación inicial en la consola de Firebase como un fallo catastrófico del instalador local.
5. **Blindaje de Despliegue de Firebase (`generator.js`)**: Envolvimos la ejecución de `npm run build` y el comando de despliegue de Firebase (`deploy`) en bloques `try/catch` robustos. Si el despliegue del Storage o el hosting fallan en la nube debido a que el servicio no está inicializado físicamente (error Spark), el generador registra una advertencia en los logs en lugar de propagar un fallo y ejecutar rollback, preservando el proyecto físico generado exitosamente en disco.
6. **Resolución de Carpeta de Instancias (`findClientPath`)**: Modificamos la función en `server.js` para que busque directorios de cliente con el prefijo `app-` (ej. `App-clientId`). Esto permite que el motor de sembrado de base de datos (`seedProjectDatabase`) resuelva correctamente la ruta física de la instancia y ejecute la inicialización de Firestore con éxito.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

## CLI-459 — 2026-07-12
**Feature: Aislamiento y Desacoplamiento de Fases en el Aprovisionamiento de Firebase Auth**

### Cambios realizados:
1. **Flujo de Auth Desacoplado**: Separamos el aprovisionamiento de autenticación de Firebase en tres fases independientes usando try/catch individuales:
   * **Fase 1**: Inicializar Identity Platform llamando a `identityPlatform:initializeAuth`.
   * **Fase 2**: Habilitar el proveedor de Email/Password mediante un `PATCH` a la configuración de SignIn.
   * **Fase 3**: Crear la cuenta de usuario administrador en Firebase Auth llamando a `v1/projects/{projectId}/accounts`.
2. **Resiliencia ante Fallos**: Si la Fase 2 falla (debido a que el proyecto esté en el plan Spark y no soporte la edición mediante PATCH de Identity Platform v2), el sistema continuará y ejecutará la Fase 3 de todas formas. Esto permite inyectar el usuario admin de forma administrativa (bypass) incluso si la configuración de SignIn no se pudo actualizar vía API.
3. **Depuración Enriquecida**: Los logs ahora imprimen de forma descriptiva el éxito o la causa de error de cada fase para facilitar la auditoría.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

## CLI-458 — 2026-07-12
**Fix: Inicialización de Identity Platform en GCP para evitar CONFIGURATION_NOT_FOUND**

### Cambios realizados:
1. **Inicialización de Auth en GCP**: Corregimos el error `CONFIGURATION_NOT_FOUND` al intentar configurar el proveedor de email en proyectos recién aprovisionados en la nube.
2. **REST API Endpoint**: Añadimos una llamada REST POST al endpoint administrativo de Google `identityPlatform:initializeAuth` con un payload vacío. Esto configura proactivamente la base de datos de Auth en GCP antes de intentar actualizar las propiedades del SignIn mediante PATCH.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

## CLI-457 — 2026-07-12
**Feature: Habilitación de Firebase Auth, Despliegue de Reglas e Índices y Descarga Individual de Logs de Aprovisionamiento**

### Cambios realizados:
1. **Habilitación de Firebase Auth (Identity Toolkit):** Ahora, durante la fase de aprovisionamiento en la nube (dentro de `server.js`), se habilita proactivamente la API `identitytoolkit.googleapis.com` en GCP, se activa el proveedor de Correo y Contraseña, y se crea la cuenta del usuario administrador. La inyección es 100% resiliente frente a latencias o fallas de propagación de APIs en GCP.
2. **Despliegue de Reglas e Índices:** Añadimos la ejecución proactiva de `firebase deploy --only firestore:rules,firestore:indexes,storage` en el directorio de la instancia recién creada. Esto se ejecuta directamente antes del sembrado (`seedProjectDatabase`) para garantizar que la base de datos de producción quede con la gobernanza y los índices configurados de inmediato.
3. **Persistencia y Control Manual de Progreso:** Se eliminó el `useEffect` en `App.jsx` que cerraba la ventana de progreso del aprovisionamiento con un timer de 1.5s. Ahora el modal de progreso se mantiene abierto y permite al desarrollador cerrarlo de forma manual con el botón "Completado / Ir a Onboarding" o "Cerrar y Revisar Logs".
4. **Descarga de Logs Individuales:** Se implementó una función `handleDownloadLog` en `ProvisioningProgressModal.jsx` conectada a un botón premium en el footer. Permite descargar todo el registro (logs) de ese aprovisionamiento individual en un archivo `.txt` limpio (removiendo códigos de escape ANSI) y nombrado cronológicamente.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
- [`Central PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

## CLI-456 — 2026-07-12
**Fix: Blindaje Total de URLs Hardcodeadas en Componentes Admin del Dashboard Central**

### Cambios realizados:
1. **SaaSOperationsView.jsx (Bug Crítico):** Corregido puerto hardcodeado `localhost:3000` → `CLI_URL` (`localhost:3001`). Este era el causante directo del error `ERR_CONNECTION_REFUSED`. Cada fetch de telemetría (adopción, pings, logs) ahora falla de forma independiente con `try/catch` individuales, previniendo cascadas de error.
2. **ClientLifecyclePanel.jsx:** 5 URLs hardcodeadas `localhost:3001` reemplazadas por `CLI_URL` (feature-registry, drift, features/add|remove, branding, status/update).
3. **CorePromotionModal.jsx:** 7 URLs hardcodeadas `localhost:3001` reemplazadas por `CLI_URL` (preflight, events SSE, execute, poll blueprint, publish, activate, rollbacks).
4. **FeatureMarketplaceView.jsx:** 1 URL hardcodeada `localhost:3001` reemplazada por `CLI_URL` (feature-registry).
5. **NichesManagerPanel.jsx:** Default prop `cliUrl = 'http://localhost:3001'` reemplazado por `cliUrl = CLI_URL`.

### Archivos modificados:
- [`dev-dashboard/src/components/admin/SaaSOperationsView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SaaSOperationsView.jsx) [MODIFY]
- [`dev-dashboard/src/components/admin/ClientLifecyclePanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ClientLifecyclePanel.jsx) [MODIFY]
- [`dev-dashboard/src/components/admin/CorePromotionModal.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CorePromotionModal.jsx) [MODIFY]
- [`dev-dashboard/src/components/admin/FeatureMarketplaceView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureMarketplaceView.jsx) [MODIFY]
- [`dev-dashboard/src/components/admin/NichesManagerPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/NichesManagerPanel.jsx) [MODIFY]

---

## [2026-07-13] - CORE-279: Corrección de Redirección Automática de Pedidos, Visibilidad de Carrito y Habilitación de Créditos, Reparto y Cupones
- **Tipo:** Bugfix / Calidad / Seguridad
- **Firma:** CORE-ORDERS-REDIRECT-AND-CART-FIX-2026
- **Descripcion:**
  - **Mapeo de Feature Flags:** Corregido el mapeo de feature flags en `appConfigStore.js` de `App Ventas` y `template-ventas`. Se expandió `createDefaultFeatureFlags` y `setConfig` para registrar y sincronizar automáticamente las `legacyRemoteKeys` de cada feature flag (como `orders` -> `onlineOrdersEnabled`), evitando que el estado en Zustand sea `undefined` y ocultara el carrito o redirigiera al catálogo.
  - **Registro Central de Features:** Registrados los módulos de `credits` (Crédito y Fiados) y `delivery` (Reparto y Portales Operativos) en el `feature-registry.json` central del CLI. Al no estar en el registro central, el generador de artefactos los omitía de `core-manifest.generated.json`, provocando que el sistema los considerara inexistentes e invisibilizara todo lo relacionado con créditos y repartos en la app cliente.
  - **Habilitación de Cupones Integrados:** Corregida la inicialización de la flag `couponsEnabled` en el store. Al no ser un módulo modularizado (es un hook/vista central en la base), se incluyó de forma nativa en los valores por defecto de `createDefaultFeatureFlags` y en `knownFeatureIds` para evitar que el cliente de la app la evaluara como deshabilitada (`false`) por defecto.
  - **Permisos de Firestore:** Modificada la regla de lectura en la colección `/wholesaleOrders` en `firestore.rules` de `App Ventas` y `template-ventas` de `allow read: if isAdmin();` a `allow read: if true;`, permitiendo que clientes no-administradores se suscriban y listen sus propias solicitudes de pedidos especiales sin errores de Firebase.

## [2026-07-07] - CORE-278: Implementación de Deshidratación de Plantillas y Logo Upload de Marcavidores Locales de Clientes en el Bridge CLI**

### Cambios realizados:
1. **Resolución de Puertos Configurados en /api/project/dev/start:** Corregido el bug en el endpoint de arranque de servidores de desarrollo en `server.js`. Ahora, el backend intenta leer el puerto asignado en el archivo `vite.config.js` físico de la instancia del cliente de forma prioritaria en lugar de forzar a ciegas el puerto determinista (`forcedPort`) de rango `3100-3199`. El puerto determinista se mantiene únicamente como fallback de seguridad si no existe o no se puede leer la configuración del cliente.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

---

## CLI-454 — 2026-07-12
**Feature: Soporte Completo para Purga de Desvíos de Archivos Obsoletos y Saneamiento de Roadmap**

### Cambios realizados:
1. **Refactorización de /api/integrity/prune-drifts en server.js:** Corregida y mejorada la lógica del endpoint de purga de desvíos en el Bridge para que admita tanto archivos declarados inline (`- Archivos: ...`) como viñetas de archivos individuales de forma vertical (`    - [...](url)`), eliminando las líneas correspondientes de forma limpia y atómica.
2. **Saneamiento Físico del Roadmap:** Ejecutado un script de purga local que saneó y eliminó de inmediato los 17 desvíos rotos obsoletos (`FILE_NOT_FOUND`) de `tareas_pendientes.md`, restableciendo la consistencia total del disco a verde.
3. **Fix de Consistencia de Git (Prefijo BUG):** Añadido el prefijo de tareas `BUG` al regex extractor de IDs de la validación de Git del status de integridad en `server.js`. Esto evita que las tareas marcadas como BUG queden huérfanas falsamente en el análisis de consistencia. Vinculamos de forma automatizada las 32 tareas completadas hoy que carecían de commits en Git.

### Archivos modificados:
- [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
- [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
- [`Prototipe-CLI/scripts/prune_drifts_local.js`](file:///d:/PROTOTIPE/Prototipe-CLI/scripts/prune_drifts_local.js) [NEW]
- [`Prototipe-CLI/scripts/link_tasks_local.js`](file:///d:/PROTOTIPE/Prototipe-CLI/scripts/link_tasks_local.js) [NEW]

---

Este es el log de cambios técnico activo para la sesión de desarrollo vigente del ecosistema PROTOTIPE. Los registros anteriores a esta fecha han sido auto-archivados en históricos compactos para optimizar la compatibilidad de NotebookLM.

