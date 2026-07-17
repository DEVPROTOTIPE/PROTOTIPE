# Asignación de tarea — CORE-359

Este archivo es autocontenido: se pega o adjunta completo en un chat nuevo de
Antigravity apuntando a `D:\PROTOTIPE`.

## 0. Quién eres y bajo qué reglas operas

Trabajas bajo el contrato multiagente `.agents/AI_WORKFLOW.md` — **léelo
completo antes de escribir nada**. `CLAUDE.md` y `AI_WORKFLOW.md` §1-6
siguen aplicando íntegros.

Antes de escribir:
1. `git status --short --branch` en `D:\PROTOTIPE`.
2. Confirma rama `docs/context-packaging`, HEAD `a8f3048`. Si no coincide,
   detente.
3. Puede haber OTRAS tareas corriendo en paralelo (`CORE-360`, `CORE-348`,
   asignadas a otras instancias/chats de Antigravity). Esta tarea toca
   **solo** `Instancias Clientes/ventas/ventas-moni-app/`. No toques
   `Plantillas Core/App Ventas/` (fuente de verdad, ya cerrada), ni
   `Prototipe-CLI/templates/` (`CORE-360` corre ahí), ni `.agents/`/
   `.claude/` (`CORE-348` corre ahí), ni `Central PROTOTIPE/dev-dashboard/`.
4. Trata cualquier cambio que no sea tuyo como ajeno.

## 1. Identificación

- ID: `CORE-359`
- Título: Propagar `SEC-012`/`SEC-013`/`SEC-014`/`SEC-015` de Core a
  `ventas-moni-app` (cliente real)
- Asignada por: Claude Code (terminal), 2026-07-15

## 2. Objetivo y beneficio

`Plantillas Core/App Ventas` (el Core) ya cerró una cadena completa de
seguridad: `SEC-012` (suite de pruebas rojas reales contra el emulador,
16/16 verde), `SEC-013` (retirar `isFirstStart`, bootstrap server-side),
`SEC-014` (identidad real de clientes, Anonymous Auth + `ownerUid`),
`SEC-015` (identidad real de empleados, Firebase Auth email/password
sintético). `CORE-356` ya propagó esta cadena a `Prototipe-CLI/templates/template-ventas/`
(la plantilla que se clona para clientes nuevos). **Falta propagarla a
`Instancias Clientes/ventas/ventas-moni-app/`, que es un cliente real, no
una plantilla** — confirmado por grep que su `firestore.rules` todavía
tiene `isFirstStart()` (la vulnerabilidad de escalada a admin que `SEC-013`
ya cerró en Core) y no tiene `isEmployee()` ni cross-reference de
`ownerUid` en ningún lado. Este es el gap de seguridad más importante de
los tres asignados hoy: es la única de las tres carpetas con datos reales
de un cliente, no un molde para clientes futuros.

## 3. Alcance autorizado

**Archivo por archivo, cada uno primero como diff contra su versión actual
en `ventas-moni-app`, revisando manualmente antes de aplicar (NO copia
ciega — `ventas-moni-app` puede tener diferencias legítimas de branding/
configuración de cliente que no debes pisar):**

1. `firestore.rules` — compara `Plantillas Core/App Ventas/firestore.rules`
   (HEAD `a8f3048`) contra `Instancias Clientes/ventas/ventas-moni-app/firestore.rules`.
   Aplica los helpers `isEmployee()`/`employeeId()`, la colección
   `employeeAuthLinks`, y los bloques `users`, `favorites`, `credits`,
   `wholesaleOrders`, `orders`, `deliveries`, `stockMovements`,
   `accessLogs`, `notifications`, `claims`, `clientNotifications`,
   `fcmTokens` migrados a identidad real. **ADVERTENCIA:** no ejecutes
   `Prototipe-CLI/scripts/distribute_rules.js` — está desactualizado
   (confirmado en `CORE-356`) y sobrescribiría tu trabajo con reglas viejas.
2. `src/hooks/useAuthInit.js` — fix crítico del guard `/admin` en el
   forced-signout (copiar tal cual desde Core si `ventas-moni-app` no lo
   tiene ya modificado de forma distinta).
3. `src/hooks/useAnonAuthInit.js` (NUEVO en Core) — copiar completo.
4. `src/services/employeeAuthService.js` (NUEVO en Core) — copiar completo.
5. `src/services/employeeService.js` — aplicar los mismos cambios
   (`authenticateEmployeeByIdAndPin` vía `signInWithEmailAndPassword`,
   `saveEmployee` provisiona cuenta).
6. `src/config/firebaseConfig.js` — exportar `firebaseConfig` crudo
   (necesario para la instancia secundaria de `employeeAuthService.js`) —
   usar el `firebaseConfig` propio de `ventas-moni-app` (su propio proyecto
   Firebase), NO el de Core.
7. `src/constants/index.js` — agregar `EMPLOYEE_AUTH_LINKS: 'employeeAuthLinks'`.
8. `src/pages/LoginPage.jsx` — cambios de `ownerUid` en registro/login.
9. `src/components/portal/RequirePortalAuth.jsx`,
   `src/layouts/PortalLayout.jsx` — `auth.signOut()` en logout + verificación
   de `authUid`.
10. `src/pages/admin/AdminCredits.jsx` — botón "Resetear dispositivo".
11. `scripts/bootstrap-admin.js`, `scripts/reset-employee-pin.js` (NUEVOS) —
    copiar completos (API modular correcta de `firebase-admin`).
12. `firebase.json` — bloque `emulators.auth`.
13. `package.json`/`package-lock.json` — agregar `@firebase/rules-unit-testing`
    y `firebase-admin` como devDependencies si no las tiene ya (`npm install`,
    no edición manual del lockfile).
14. `eslint.config.js` — agregar `tests/**/*` a los `ignores` del bloque de
    restricción de Firebase-fuera-de-servicios.
15. `tests/unit/firestoreRules.spec.js`, `tests/unit/employeePinLogin.spec.js`,
    `tests/unit/employeeAuthEmulator.spec.js` — copiar completos desde Core.

### 3.1 Bono opcional, mismo alcance/carpeta (no bloquea el cierre)

`vite.config.js` de `ventas-moni-app` (línea ~150) tiene el mismo patrón
`return 'vendor'` en `manualChunks` que se corrigió en `CORE-360` para
`template-ventas` (confirmado por grep, ambos archivos lo tienen). Como
está en tu misma carpeta exclusiva, puedes corregirlo aquí también con la
misma técnica que uses en `CORE-360` — pero si no alcanzas el tiempo,
documéntalo como `RIESGO` pendiente y no bloquea el cierre de esta tarea
(el criterio de cierre principal es la cadena de seguridad, no el bundling).

## 4. Exclusiones explícitas

- No tocar `Plantillas Core/App Ventas/` (fuente de verdad, ya cerrada).
- No tocar `Prototipe-CLI/templates/` ni `.agents/`/`.claude/` (otras tareas
  corren ahí en paralelo).
- No ejecutar `distribute_rules.js` ni `publish_core_to_template.js` (este
  último está acotado a `src/features/**`, no cubre nada de esta tarea).
- No hacer commit/push.
- Si `ventas-moni-app` tiene diferencias legítimas de branding/configuración
  de cliente en algún archivo de esta lista (nombre de negocio, colores,
  proyecto Firebase propio), preserva esas diferencias — fusiona, no
  sobrescribas ciegamente. Su `firebaseConfig` es de un proyecto Firebase
  real y distinto al de Core — nunca lo reemplaces por el de Core.

## 5. Criterios de cierre verificables por comando

Todos ejecutados dentro de `Instancias Clientes/ventas/ventas-moni-app/`:
1. `npm install` → sin errores.
2. `npx --yes firebase-tools@latest emulators:start --only firestore,auth --project test-prototipe-rules-moni` (proyecto distinto para no chocar con otras tareas en paralelo) → `All emulators ready!`.
3. En otra terminal: `npx vitest run tests/unit/firestoreRules.spec.js tests/unit/employeePinLogin.spec.js tests/unit/employeeAuthEmulator.spec.js` → se espera `Tests 20 passed | 0 failed` (mismo tally que `CORE-356` logró en `template-ventas`; ver `bitacora_cambios.md` para el resultado de referencia exacto).
4. `npm run build` → éxito.
5. `npx eslint .` → sin errores nuevos respecto a la línea base actual de `ventas-moni-app`.

## 6. Loop de autocorrección (`AI_WORKFLOW.md` §7.2)

Implementa → corre TODOS los criterios de la sección 5 → si algo falla,
corrige y vuelve a correr TODOS → hasta 5 ciclos o `BLOQUEO`.

## 7. Etiquetado de evidencia (`AI_WORKFLOW.md` §7.1)

`HECHO VERIFICADO` / `RESULTADO INFORMADO NO REAUDITADO` / `INFERENCIA` /
`RIESGO` / `PROPUESTA` / `BLOQUEO` / `DECISIÓN REQUERIDA`.

## 8. Artefacto de salida obligatorio

`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-359_2026-07-15.md`
con plantilla de `AI_WORKFLOW.md` §7.1 + sección "Reverificación rápida"
de §7.2. No marques `tareas_pendientes.md`/`bitacora_cambios.md` como
`VERIFIED_COMPLETE` — deja `AWAITING_REVIEW`.

## 9. Si algo no está claro

Etiqueta `DECISIÓN REQUERIDA`, no inventes, detente ahí. En particular: si
`ventas-moni-app` ya tiene empleados/clientes reales con datos en
producción (no solo en desarrollo), el paso de migración de PINs
existentes (recrear cuenta Auth por empleado) es una **decisión del
fundador**, no tuya — documenta el estado encontrado y detente ahí si hay
dudas sobre si el proyecto Firebase de `ventas-moni-app` es productivo real
o de pruebas.
