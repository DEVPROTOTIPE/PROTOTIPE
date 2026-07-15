# Asignación de tarea — CORE-357

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
3. Esta tarea toca **solo** `Central PROTOTIPE/dev-dashboard/`. Puede haber
   otras tareas corriendo en paralelo (`CORE-356`, `CORE-358`) en otras
   carpetas — no las toques.
4. Trata cualquier cambio que no sea tuyo como ajeno.

## 1. Identificación

- ID: `CORE-357` (activa `SEC-017` del backlog propuesto)
- Título: Claim/allowlist real de operador del Dashboard Central
- Asignada por: Claude Code (terminal), 2026-07-15

## 2. Objetivo y beneficio

Confirmado leyendo `Central PROTOTIPE/dev-dashboard/firestore.rules`
completo (97 líneas): **toda colección sensible** (`tokens`,
`clientes_control`, `whatsappTemplates`, `configuracion_sistema`,
`briefings`, `cotizaciones`, `dashboard_config`, `health_checks`) exige
únicamente `request.auth != null` — **cualquier sesión de Firebase Auth
real, sin ningún allowlist ni claim de operador**. Confirmado también en
`src/App.jsx` (líneas ~4964-5276): el login solo llama
`signInWithEmailAndPassword` y hace `onAuthStateChanged` → `setUser()`, sin
verificar en ningún punto que ese usuario esté autorizado como operador
del negocio (no hay lectura de ningún doc `operators/` ni chequeo de rol).
Si el proyecto de Firebase permite auto-registro de cuentas (configuración
por defecto en muchos proyectos), **cualquier persona podría crearse una
cuenta y obtener control total del panel central** (tokens de facturación
de todos los clientes, tasas de comisión, plantillas de WhatsApp, etc.).

Mismo patrón ya usado con éxito en `Plantillas Core/App Ventas` para
`isAdmin()` (ver `firestore.rules` de ese proyecto, función `isAdmin()`
líneas 6-10, y `isEmployee()` líneas 12-19 de la sesión de hoy) — replicar
la misma idea aquí con un helper `isOperator()`.

## 3. Alcance autorizado

1. Diseñar e implementar una colección `operators/{uid}` en
   `Central PROTOTIPE/dev-dashboard/firestore.rules`, con al menos un campo
   `activo: boolean`. Agregar un helper:
   ```
   function isOperator() {
     return request.auth != null &&
       exists(/databases/$(database)/documents/operators/$(request.auth.uid)) &&
       get(/databases/$(database)/documents/operators/$(request.auth.uid)).data.activo == true;
   }
   ```
2. Reemplazar **todos** los `request.auth != null` de las colecciones
   sensibles listadas arriba por `isOperator()`. Revisar también
   `tokenValido()` y sus usos — esa función ya valida algo distinto
   (token de instancia cliente), no la toques, solo las reglas que dependen
   de `request.auth != null` puro.
3. Escribir pruebas reales con `@firebase/rules-unit-testing` (mismo
   patrón que `Plantillas Core/App Ventas/tests/unit/firestoreRules.spec.js`
   — cópialo como referencia de estructura, no de contenido) en
   `Central PROTOTIPE/dev-dashboard/tests/unit/firestoreRules.spec.js`
   (verifica primero si ya existe una carpeta `tests/` con configuración de
   Vitest en este proyecto — si no existe, puede que necesites instalar
   `vitest`/`@firebase/rules-unit-testing`/`firebase-tools` como
   devDependencies aquí también, y configurar un bloque `emulators` en
   `firebase.json` de este proyecto si no lo tiene).
4. Pruebas mínimas requeridas: (a) un usuario recién auto-registrado (sin
   doc en `operators/`) NO puede leer `tokens`/`clientes_control` ni ninguna
   otra colección sensible; (b) un operador real (con
   `operators/{uid}.activo == true` sembrado) SÍ puede.
5. **No** crear un mecanismo para que operadores se auto-registren en
   `operators/` — esa colección debe poblarse solo manualmente (consola de
   Firebase o script Admin SDK) por el fundador. Documenta esto como
   `PROPUESTA` en el traspaso si crees que hace falta un script, no lo
   construyas sin que se pida.

## 4. Exclusiones explícitas

- No tocar `Plantillas Core/App Ventas/`, `Prototipe-CLI/`, `Instancias Clientes/`.
- No modificar `tokenValido()` ni la lógica de `reportesBilling`/`app_failures`
  (ya validadas por token de instancia, no por operador).
- No hacer commit/push.
- No crear ningún operador real ni tocar datos de producción — todo el
  trabajo se verifica contra el emulador.
- No introducir MFA (mencionado en el ticket original `SEC-017` pero fuera
  de alcance de esta tarea — sería una tarea separada).

## 5. Criterios de cierre verificables por comando

1. `npx --yes firebase-tools@latest emulators:start --only firestore --project test-dashboard-rules` → `All emulators ready!`.
2. `npx vitest run tests/unit/firestoreRules.spec.js` (dentro de
   `Central PROTOTIPE/dev-dashboard/`) → todas las pruebas nuevas en verde,
   incluyendo el caso negativo (usuario sin `operators/` doc denegado) y
   el positivo (operador real permitido).
3. `npm run build` → éxito, sin regresión.
4. `npx eslint src` (o el comando de lint existente del proyecto) → sin
   errores nuevos respecto a la línea base.

## 6. Loop de autocorrección (`AI_WORKFLOW.md` §7.2)

Implementa → corre TODOS los criterios de la sección 5 → si algo falla,
corrige y vuelve a correr TODOS → hasta 5 ciclos o `BLOQUEO`.

## 7. Etiquetado de evidencia (`AI_WORKFLOW.md` §7.1)

`HECHO VERIFICADO` / `RESULTADO INFORMADO NO REAUDITADO` / `INFERENCIA` /
`RIESGO` / `PROPUESTA` / `BLOQUEO` / `DECISIÓN REQUERIDA`.

## 8. Artefacto de salida obligatorio

`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-357_2026-07-15.md`
con plantilla de `AI_WORKFLOW.md` §7.1 + sección "Reverificación rápida"
de §7.2. No marques `tareas_pendientes.md`/`bitacora_cambios.md` como
`VERIFIED_COMPLETE` — deja `AWAITING_REVIEW`.

## 9. Si algo no está claro

Etiqueta `DECISIÓN REQUERIDA`, no inventes, detente ahí.
