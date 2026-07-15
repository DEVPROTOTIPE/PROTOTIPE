# Asignación de tarea — CORE-356

Este archivo es autocontenido: se pega o adjunta completo en un chat nuevo de
Antigravity apuntando a `D:\PROTOTIPE`.

## 0. Quién eres y bajo qué reglas operas

Trabajas bajo el contrato multiagente `.agents/AI_WORKFLOW.md` — **léelo
completo antes de escribir nada**. `CLAUDE.md` y `AI_WORKFLOW.md` §1-6
siguen aplicando íntegros.

Antes de escribir:
1. `git status --short --branch` en `D:\PROTOTIPE`.
2. Confirma rama `docs/context-packaging`, HEAD `2d98036`. Si no coincide,
   detente.
3. Puede haber OTRAS tareas corriendo en paralelo (`CORE-357`, `CORE-358`,
   asignadas a otras instancias/chats de Antigravity). Esta tarea toca
   **solo** `Prototipe-CLI/templates/template-ventas/`. No toques
   `Plantillas Core/App Ventas/` (ya cerrada, fuente de verdad), ni
   `Central PROTOTIPE/dev-dashboard/`, ni `Instancias Clientes/`.
4. Trata cualquier cambio que no sea tuyo como ajeno.

## 1. Identificación

- ID: `CORE-356`
- Título: Propagar `SEC-012`/`SEC-013`/`SEC-014`/`SEC-015` de Core a `template-ventas`
- Asignada por: Claude Code (terminal), 2026-07-15

## 2. Objetivo y beneficio

`Plantillas Core/App Ventas` (el Core) ya cerró una cadena completa de
seguridad: `SEC-012` (suite de pruebas rojas reales, ahora 16/16 verde),
`SEC-013` (retirar `isFirstStart`), `SEC-014` (identidad real de clientes,
Anonymous Auth + `ownerUid`), `SEC-015` (identidad real de empleados,
Firebase Auth email/password sintético). `Prototipe-CLI/templates/template-ventas`
(la plantilla que se clona para nuevos clientes) **NO tiene nada de esto
todavía** — sigue con las mismas vulnerabilidades ya cerradas en Core.
Confirmado por `diff` que su `firestore.rules` es distinto al de Core.

## 3. Alcance autorizado

**Archivo por archivo, cada uno primero como diff contra su versión actual
en template-ventas, revisando manualmente antes de aplicar (NO copia
ciega — template-ventas puede tener diferencias legítimas de branding/nicho
que no debes pisar):**

1. `firestore.rules` — el cambio más grande. Compara
   `Plantillas Core/App Ventas/firestore.rules` (HEAD `2d98036`) contra
   `Prototipe-CLI/templates/template-ventas/firestore.rules`. Aplica las
   reglas nuevas/modificadas de Core (helpers `isEmployee()`/`employeeId()`,
   colección `employeeAuthLinks`, y los bloques `users`, `favorites`,
   `credits`, `wholesaleOrders`, `orders`, `deliveries`, `stockMovements`,
   `accessLogs`, `notifications`, `claims`, `clientNotifications`,
   `fcmTokens` — todos migrados de `if true`/`request.auth != null`
   genérico a identidad real). **ADVERTENCIA:** existe también
   `Prototipe-CLI/knowledge/firestore/core.rules` +
   `Prototipe-CLI/scripts/distribute_rules.js`, un mecanismo de composición
   de reglas que **está desactualizado** (no refleja nada de SEC-012 a
   SEC-015 — confirmado por fecha de modificación, 2026-07-14, un día
   antes de este trabajo). NO ejecutes `distribute_rules.js` — sobrescribiría
   tu propio trabajo con la versión vieja. Documenta este hallazgo en el
   traspaso como `RIESGO`, no lo arregles (fuera de alcance de esta tarea).
2. `src/hooks/useAuthInit.js` — el fix crítico de ruta (`/admin` guard en
   el forced-signout). Cópialo tal cual desde Core si `template-ventas` no
   tiene el mismo archivo ya modificado de forma distinta.
3. `src/hooks/useAnonAuthInit.js` (NUEVO en Core) — copiar completo.
4. `src/services/employeeAuthService.js` (NUEVO en Core) — copiar completo.
5. `src/services/employeeService.js` — aplicar los mismos cambios
   (`authenticateEmployeeByIdAndPin` vía `signInWithEmailAndPassword`,
   `saveEmployee` provisiona cuenta).
6. `src/services/userService.js` / `src/config/firebaseConfig.js` — export
   de `firebaseConfig` (necesario para la instancia secundaria de
   `employeeAuthService.js`).
7. `src/constants/index.js` — agregar `EMPLOYEE_AUTH_LINKS: 'employeeAuthLinks'`.
8. `src/pages/LoginPage.jsx` — cambios de `ownerUid` en registro/login.
9. `src/components/portal/RequirePortalAuth.jsx`,
   `src/layouts/PortalLayout.jsx` — `auth.signOut()` en logout + verificación
   de `authUid`.
10. `src/pages/admin/AdminCredits.jsx` — botón "Resetear dispositivo".
11. `scripts/bootstrap-admin.js`, `scripts/reset-employee-pin.js` (NUEVOS) —
    copiar completos (usan la API modular correcta de `firebase-admin`).
12. `firebase.json` — bloque `emulators.auth`.
13. `package.json`/`package-lock.json` — agregar `@firebase/rules-unit-testing`
    y `firebase-admin` como devDependencies si `template-ventas` no las
    tiene ya (`npm install`, no edición manual del lockfile).
14. `eslint.config.js` — agregar `tests/**/*` a los `ignores` del bloque de
    restricción de Firebase-fuera-de-servicios (mismo cambio que en Core).
15. `tests/unit/firestoreRules.spec.js`, `tests/unit/employeePinLogin.spec.js`,
    `tests/unit/employeeAuthEmulator.spec.js` — copiar completos desde Core
    (ya prueban las reglas genéricas; no dependen de datos específicos de
    App Ventas).

## 4. Exclusiones explícitas

- No tocar `Plantillas Core/App Ventas/` (fuente de verdad, ya cerrada).
- No tocar `Central PROTOTIPE/dev-dashboard/` ni `Instancias Clientes/`.
- No ejecutar `distribute_rules.js` ni `publish_core_to_template.js`
  (este último está acotado a `src/features/**` y no cubre nada de esta
  tarea — no lo uses, copia manualmente).
- No hacer commit/push.
- Si `template-ventas` tiene diferencias legítimas de branding/nicho en
  algún archivo de esta lista, preserva esas diferencias — fusiona, no
  sobrescribas ciegamente.

## 5. Criterios de cierre verificables por comando

Todos ejecutados dentro de `Prototipe-CLI/templates/template-ventas/`:
1. `npm install` → sin errores.
2. `npx --yes firebase-tools@latest emulators:start --only firestore,auth --project test-prototipe-rules-template` (nota: usa un `--project` distinto al de Core para no chocar si corren en paralelo) → `All emulators ready!`.
3. En otra terminal: `npx vitest run tests/unit/firestoreRules.spec.js tests/unit/employeePinLogin.spec.js tests/unit/employeeAuthEmulator.spec.js` → se espera `Tests 16 passed | 0 failed` + `1 passed` + `3 passed` (mismo resultado que en Core, ver `Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md` para el resultado exacto de referencia).
4. `npm run build` → éxito.
5. `npx eslint .` → sin errores nuevos respecto a la línea base actual de `template-ventas` (compara con `git show HEAD -- .` antes de tu cambio si necesitas confirmar la línea base).

## 6. Loop de autocorrección (`AI_WORKFLOW.md` §7.2)

Implementa → corre TODOS los criterios de la sección 5 → si algo falla,
corrige y vuelve a correr TODOS → hasta 5 ciclos o `BLOQUEO`.

## 7. Etiquetado de evidencia (`AI_WORKFLOW.md` §7.1)

`HECHO VERIFICADO` / `RESULTADO INFORMADO NO REAUDITADO` / `INFERENCIA` /
`RIESGO` / `PROPUESTA` / `BLOQUEO` / `DECISIÓN REQUERIDA`.

## 8. Artefacto de salida obligatorio

`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-356_2026-07-15.md`
con plantilla de `AI_WORKFLOW.md` §7.1 + sección "Reverificación rápida"
de §7.2. No marques `tareas_pendientes.md`/`bitacora_cambios.md` como
`VERIFIED_COMPLETE` — deja `AWAITING_REVIEW`.

## 9. Si algo no está claro

Etiqueta `DECISIÓN REQUERIDA`, no inventes, detente ahí.
