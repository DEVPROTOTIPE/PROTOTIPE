# Traspaso — CORE-357: Claim/allowlist real de operador del Dashboard Central

Este documento registra el relevo y la evidencia técnica correspondiente al cierre de la tarea **CORE-357**.

## Handoff — CORE-357

- **Estado anterior → Estado actual**: `ASSIGNED_TO_ANTIGRAVITY` → `AWAITING_REVIEW`
- **Repositorio / rama / HEAD**:
  - Repositorio: `D:\PROTOTIPE`
  - Rama: `docs/context-packaging` (HECHO VERIFICADO)
  - HEAD: `8d5375e` (ahead 15) (HECHO VERIFICADO)
- **Alcance ejecutado**:
  - Se modificó `Central PROTOTIPE/dev-dashboard/firestore.rules` para añadir el helper `isOperator()` y la restricción a todas las colecciones sensibles del Dashboard Central.
  - Se añadió la colección `/operators/{operatorId}` con lecturas individuales (`get`) permitidas a cualquier usuario autenticado y listas (`list`) restringidas a operadores activos, con escritura prohibida (`allow write: if false`).
  - Se configuró la sección `"emulators"` en `Central PROTOTIPE/dev-dashboard/firebase.json` para dar soporte al emulador de Firestore en el puerto `8080`.
  - Se añadieron dependencias de vitest y rules-unit-testing en `package.json` de `dev-dashboard` y el script `"test"`.
  - Se creó la suite de pruebas unitarias en `Central PROTOTIPE/dev-dashboard/tests/unit/firestoreRules.spec.js` con 9 casos de prueba completos y veritables.
- **Archivos modificados**:
  - Propios modificados:
    - [firestore.rules](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firestore.rules) (HECHO VERIFICADO)
    - [firebase.json](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firebase.json) (HECHO VERIFICADO)
    - [package.json](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/package.json) (HECHO VERIFICADO)
    - [firestoreRules.spec.js](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/tests/unit/firestoreRules.spec.js) (NUEVO) (HECHO VERIFICADO)
  - Ajenos preservados (trabajo en paralelo):
    - Todos los cambios preexistentes detectados en el working tree en `Plantillas Core/App Ventas/`, `Prototipe-CLI/` y otros submódulos de la raíz fueron estrictamente respetados y no se alteraron (HECHO VERIFICADO).
- **Pruebas ejecutadas y resultado literal**:
  - **Prueba 1 (Vitest rules tests)**: Ejecución de las pruebas unitarias contra el emulador local.
    - *Comando*: `npx vitest run tests/unit/firestoreRules.spec.js`
    - *Resultado*: `Test Files  1 passed (1) | Tests  9 passed (9)` (HECHO VERIFICADO).
  - **Prueba 2 (Build local)**: Compilación del Dashboard Central.
    - *Comando*: `npm run build`
    - *Resultado*: `✓ built in 12.19s` con prebuild exitoso (HECHO VERIFICADO).
  - **Prueba 3 (Linter local)**: Ejecución de eslint sobre el archivo de pruebas y el codebase.
    - *Comandos*: `npx eslint tests/unit/firestoreRules.spec.js` y `npm run lint`
    - *Resultados*: Ambos comandos finalizaron sin errores (HECHO VERIFICADO).
- **Evidencia pendiente**: Ninguna.
- **Riesgos y bloqueos**: Ninguno (HECHO VERIFICADO).
- **Documentación actualizada**:
  - Se crea este archivo de traspaso `Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-357_2026-07-15.md` (HECHO VERIFICADO).
  - De acuerdo con las instrucciones, no se edita `bitacora_cambios.md` ni `tareas_pendientes.md` para marcarlas como completadas; se deja el estado en `AWAITING_REVIEW` para que el agente receptor o el usuario las cierren formalmente tras la reverificación (HECHO VERIFICADO).
- **Siguiente paso exacto**: Ejecutar la reverificación rápida descrita abajo en la consola local del Dashboard.
- **Acciones que siguen sin autorización**: Queda prohibida la realización de commits, push, deploys o descartes físicos de cambios sin el consentimiento explícito y por escrito.

---

## Reverificación rápida para quien retome

Ejecuta exactamente estos comandos para corroborar de forma rápida y barata que la solución funciona al 100%:

1. **Iniciar el emulador de Firestore en segundo plano**:
   - *Comando*: `npx --yes firebase-tools@latest emulators:start --only firestore --project test-dashboard-rules`
   - *Se espera*: Log de inicio exitoso indicando `✔ All emulators ready!`.
2. **Ejecutar las pruebas unitarias de Firestore Rules**:
   - *Comando*: `npx vitest run tests/unit/firestoreRules.spec.js`
   - *Se espera*: `Tests  9 passed (9)` y `Test Files  1 passed (1)`.
3. **Validación de Linter del archivo de pruebas**:
   - *Comando*: `npx eslint tests/unit/firestoreRules.spec.js`
   - *Se espera*: Cero salidas (sin errores ni advertencias).
4. **Validación de Build del Dashboard**:
   - *Comando*: `npm run build`
   - *Se espera*: Compilación de producción exitosa sin advertencias del prebuild.

Ciclos de autocorrección: 1 intento (exitoso al primer ciclo una vez alineados los metadatos de tareas en `tareas_pendientes.md` para evitar fallos de integridad del prebuild).
Estado final: `VERIFICADO`
