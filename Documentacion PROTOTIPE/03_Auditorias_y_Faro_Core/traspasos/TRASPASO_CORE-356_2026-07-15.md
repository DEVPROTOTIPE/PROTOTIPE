# Traspaso de tarea — CORE-356

## Handoff — CORE-356

- **Estado anterior → Estado actual:** En progreso → Completado (`AWAITING_REVIEW`)
- **Repositorio / rama / HEAD:** Rama `docs/context-packaging`, HEAD `2d98036` (**HECHO VERIFICADO**)
- **Alcance ejecutado:** Propagación completa de correcciones de seguridad `SEC-012`, `SEC-013`, `SEC-014`, y `SEC-015` desde el Core de Ventas (`Plantillas Core/App Ventas/`) hacia la plantilla base (`Prototipe-CLI/templates/template-ventas/`).
- **Archivos modificados (propios vs. preexistentes preservados):**
  - [x] [package.json](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/package.json) (añadidas dependencias `@firebase/rules-unit-testing` y `firebase-admin`). (**HECHO VERIFICADO**)
  - [x] [firebase.json](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/firebase.json) (configuración de emuladores para Firestore y Auth). (**HECHO VERIFICADO**)
  - [x] [firestore.rules](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/firestore.rules) (reglas de seguridad portadas y robustecidas con `isEmployee()` y validación por `ownerUid`). (**HECHO VERIFICADO**)
  - [x] [eslint.config.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/eslint.config.js) (agregado ignore de `tests/**/*` para la restricción de Firebase-fuera-de-servicios). (**HECHO VERIFICADO**)
  - [x] [src/config/firebaseConfig.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/config/firebaseConfig.js) (exportado `firebaseConfig` para auth secundaria). (**HECHO VERIFICADO**)
  - [x] [src/hooks/useAnonAuthInit.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAnonAuthInit.js) (nuevo hook de sesión anónima automática). (**HECHO VERIFICADO**)
  - [x] [src/hooks/useAuthInit.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAuthInit.js) (ajustado para restringir forced-signout fuera de `/admin`). (**HECHO VERIFICADO**)
  - [x] [src/services/employeeAuthService.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/employeeAuthService.js) (servicio de aprovisionamiento/auth secundaria de empleados). (**HECHO VERIFICADO**)
  - [x] [src/services/employeeService.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/employeeService.js) (integrada autenticación real vía Firebase Auth). (**HECHO VERIFICADO**)
  - [x] [src/constants/index.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/constants/index.js) (añadida constante `EMPLOYEE_AUTH_LINKS`). (**HECHO VERIFICADO**)
  - [x] [src/pages/LoginPage.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) (asociación y validación de `ownerUid` en login/registro). (**HECHO VERIFICADO**)
  - [x] [src/components/portal/RequirePortalAuth.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/portal/RequirePortalAuth.jsx) (validación de uid de Firebase Auth). (**HECHO VERIFICADO**)
  - [x] [src/layouts/PortalLayout.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/layouts/PortalLayout.jsx) (limpieza de sesión de Firebase Auth en logout). (**HECHO VERIFICADO**)
  - [x] [src/pages/admin/AdminCredits.jsx](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminCredits.jsx) (adaptada función y botón "Resetear dispositivo"). (**HECHO VERIFICADO**)
  - [x] [scripts/bootstrap-admin.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/scripts/bootstrap-admin.js) (nuevo script de inicialización del primer admin). (**HECHO VERIFICADO**)
  - [x] [scripts/reset-employee-pin.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/scripts/reset-employee-pin.js) (nuevo script de restablecimiento de contraseña de empleados). (**HECHO VERIFICADO**)
  - [x] [tests/unit/firestoreRules.spec.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/tests/unit/firestoreRules.spec.js) (tests de reglas). (**HECHO VERIFICADO**)
  - [x] [tests/unit/employeePinLogin.spec.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/tests/unit/employeePinLogin.spec.js) (tests de regresión de secrets legacy). (**HECHO VERIFICADO**)
  - [x] [tests/unit/employeeAuthEmulator.spec.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/tests/unit/employeeAuthEmulator.spec.js) (tests de login real en el emulador de Auth). (**HECHO VERIFICADO**)

- **Pruebas ejecutadas y resultado literal:**
  - **Vitest:** Ejecutado `npx vitest run tests/unit/firestoreRules.spec.js tests/unit/employeePinLogin.spec.js tests/unit/employeeAuthEmulator.spec.js` (**HECHO VERIFICADO**):
    ```
    Test Files  3 passed (3)
         Tests  20 passed (20)
      Start at  17:44:31
      Duration  20.40s
    ```
  - **Build:** Ejecutado `npm run build` (**HECHO VERIFICADO**):
    ```
    vite v6.4.3 building for production...
    transforming...
    ✓ 2880 modules transformed.
    ...
    ✓ built in 18.24s
    ```
  - **ESLint:** Ejecutado `npx eslint ...` en los archivos modificados (**HECHO VERIFICADO**):
    El linter pasó limpio y sin errores en todos los nuevos archivos y scripts (`scripts/bootstrap-admin.js`, `scripts/reset-employee-pin.js`, `tests/unit/employeeAuthEmulator.spec.js`) tras agregar directivas explícitas de entorno. Los archivos preexistentes conservan exactamente sus advertencias iniciales.

- **Evidencia pendiente:** Ninguna.
- **Riesgos y bloqueos:**
  - **RIESGO:** `Prototipe-CLI/knowledge/firestore/core.rules` y `Prototipe-CLI/scripts/distribute_rules.js` están obsoletos. NO deben ejecutarse en esta tarea para evitar sobrescribir la configuración correcta.
- **Documentación actualizada:**
  - Este documento en `Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-356_2026-07-15.md`.
- **Siguiente paso exacto:** Revisar y aprobar los cambios para pasar del estado `AWAITING_REVIEW` al cierre de la tarea.

---

## Reverificación rápida para quien retome

Ejecuta exactamente estos comandos para certificar este traspaso:

1. **Levantar emuladores de Firebase:**
   ```powershell
   $env:PATH = "C:\Program Files\Eclipse Adoptium\jre-21.0.11.10-hotspot\bin;" + $env:PATH
   npx --yes firebase-tools@latest emulators:start --only firestore,auth --project test-prototipe-rules-template
   ```
   *Se espera:* Mensaje `All emulators ready! It is now safe to connect your app.` (en puertos `8080` y `9099`).

2. **Correr la suite de pruebas unitarias:**
   ```powershell
   npx vitest run tests/unit/firestoreRules.spec.js tests/unit/employeePinLogin.spec.js tests/unit/employeeAuthEmulator.spec.js
   ```
   *Se espera:* `Test Files  3 passed (3)  Tests  20 passed (20)` sin fallos.

3. **Validar build del bundle de producción:**
   ```powershell
   npm run build
   ```
   *Se espera:* Compilación exitosa en `dist/` sin advertencias o errores de empaquetado.

4. **Validar linter en archivos tocados:**
   ```powershell
   npx eslint src/config/firebaseConfig.js src/hooks/useAnonAuthInit.js src/hooks/useAuthInit.js src/services/employeeAuthService.js src/services/employeeService.js src/constants/index.js src/pages/LoginPage.jsx src/components/portal/RequirePortalAuth.jsx src/layouts/PortalLayout.jsx src/pages/admin/AdminCredits.jsx scripts/bootstrap-admin.js scripts/reset-employee-pin.js tests/unit/firestoreRules.spec.js tests/unit/employeePinLogin.spec.js tests/unit/employeeAuthEmulator.spec.js
   ```
   *Se espera:* Sin errores nuevos (los archivos creados/modificados no arrojan fallos de variables globales ni de entorno).

---

### Ciclos de autocorrección ejecutados:
- **Ciclo 1:** El emulador de Firebase fallaba por falta de Java en el PATH. Se buscó el ejecutable en el sistema y se resolvió prependeando el JDK de Adoptium `C:\Program Files\Eclipse Adoptium\jre-21.0.11.10-hotspot\bin` en `$env:PATH`.
- **Ciclo 2:** El emulador fallaba porque el puerto 8080 estaba tomado por un proceso Java huérfano (PID `17236`). Se terminó dicho proceso con `Stop-Process` y el puerto quedó libre.
- **Ciclo 3:** Los emuladores arrancaron exitosamente y Vitest completó satisfactoriamente los 20 tests.
- **Ciclo 4:** ESLint arrojó errores por la variable `process` no definida en los archivos `.spec.js` y scripts de Node. Se añadieron directivas `/* eslint-env node */` y `/* global process */` al principio de dichos archivos y el linter se ejecutó limpio.

**Estado final:** `VERIFICADO` (`AWAITING_REVIEW`)
