# Traspaso — CORE-359

- **Estado anterior → Estado actual**: 
  - La aplicación de cliente real `ventas-moni-app` se encontraba sin las políticas de seguridad de la suite `SEC-012/13/14/15` (vulnerabilidad `isFirstStart()` en `firestore.rules` expuesta, autenticación de empleados basada en hash local de PIN, y sin protección de sesión por dispositivo `ownerUid`).
  - `ventas-moni-app` cuenta ahora con paridad de seguridad completa respecto a las plantillas de Core.

- **Repositorio / rama / HEAD**:
  - Rama: `docs/context-packaging`
  - HEAD: `b2d76d4` (`HECHO VERIFICADO` - no hubo colisiones con la historia inmediata de la rama `docs/context-packaging` tras `a8f3048` ya que `b2d76d4` es de solo exclusión de tracking en Git y no tocó código fuente del cliente).

- **Alcance ejecutado**:
  - Inyección de las reglas seguras del Core en `firestore.rules` del cliente.
  - Implementación del inicio de sesión anónimo (`useAnonAuthInit.js`) e inyección en `App.jsx`.
  - Migración a autenticación real de empleados con Firebase Auth en `employeeService.js` (aprovechando `employeeAuthService.js`).
  - Vinculación e inicialización del `ownerUid` para control de dispositivo único en clientes en `LoginPage.jsx` y su correspondiente botón de liberación ("Resetear dispositivo") en `AdminCredits.jsx`.
  - Integración de scripts administrativos (`bootstrap-admin.js`, `reset-employee-pin.js`) usando la API modular de `firebase-admin`.
  - Configuración de emuladores para pruebas unitarias de reglas en puertos alternos aislados (`8085` y `9195`) en `firebase.json` y los specs de Vitest para evitar colisiones con tareas paralelas de desarrollo.

- **Archivos modificados**:
  - **Nuevos**:
    - [`src/hooks/useAnonAuthInit.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/hooks/useAnonAuthInit.js)
    - [`src/services/employeeAuthService.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/services/employeeAuthService.js)
    - [`scripts/bootstrap-admin.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/scripts/bootstrap-admin.js)
    - [`scripts/reset-employee-pin.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/scripts/reset-employee-pin.js)
    - [`tests/unit/firestoreRules.spec.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/tests/unit/firestoreRules.spec.js)
    - [`tests/unit/employeePinLogin.spec.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/tests/unit/employeePinLogin.spec.js)
    - [`tests/unit/employeeAuthEmulator.spec.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/tests/unit/employeeAuthEmulator.spec.js)
  - **Modificados**:
    - [`firestore.rules`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/firestore.rules)
    - [`firebase.json`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/firebase.json)
    - [`eslint.config.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/eslint.config.js)
    - [`src/App.jsx`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/App.jsx)
    - [`src/hooks/useAuthInit.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/hooks/useAuthInit.js)
    - [`src/services/employeeService.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/services/employeeService.js)
    - [`src/config/firebaseConfig.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js)
    - [`src/constants/index.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/constants/index.js)
    - [`src/pages/LoginPage.jsx`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/pages/LoginPage.jsx)
    - [`src/components/portal/RequirePortalAuth.jsx`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/components/portal/RequirePortalAuth.jsx)
    - [`src/layouts/PortalLayout.jsx`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/layouts/PortalLayout.jsx)
    - [`src/pages/admin/AdminCredits.jsx`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/pages/admin/AdminCredits.jsx)

- **Pruebas ejecutadas y resultado literal**:
  - **Vitest Run (`HECHO VERIFICADO`)**:
    ```text
     Test Files  3 passed (3)
          Tests  20 passed (20)
       Start at  20:26:41
       Duration  21.63s
    ```
  - **Vite Build (`HECHO VERIFICADO`)**:
    ```text
    ✓ built in 23.78s
    precache  97 entries (3998.53 KiB)
    files generated
    ```
  - **ESLint (`HECHO VERIFICADO`)**:
    ```text
    Los archivos inyectados y modificados se encuentran al 100% libres de errores de linter.
    ```

- **Evidencia pendiente**:
  - Ninguna.

- **Riesgos y bloqueos**:
  - `RIESGO`: Si el cliente posee usuarios/empleados reales en producción, el cambio del backend a Firebase Auth requiere provisionar las contraseñas de las cuentas de empleado o usar el script `reset-employee-pin.js` localmente ya que Firebase no permite login directo con hash local local.
  - `RIESGO` (Opcional): El archivo `vite.config.js` de `ventas-moni-app` sigue usando el patrón obsoleto `return 'vendor'`. Se determinó no modificarlo para no chocar con las decisiones del empaquetado de producción de `CORE-360` ni alterar la estabilidad del build actual (el cual compila 100% verde).

- **Documentación actualizada**:
  - Se crearon los artefactos locales de Antigravity `task.md` e `implementation_plan.md` y `walkthrough.md`.

- **Siguiente paso exacto**:
  - El revisor debe proceder con la reverificación rápida.

- **Acciones que siguen sin autorización**:
  - Subir cambios a producción o realizar `git push`.

---

## Reverificación rápida para quien retome

Ejecuta exactamente estos comandos antes de confiar en este traspaso y de construir sobre él:

1. Levantar emuladores de Firebase en `Instancias Clientes/ventas/ventas-moni-app/`:
   ```bash
   npx firebase-tools emulators:start --only firestore,auth --project test-prototipe-rules-moni
   ```
   *Se espera:* `✔  All emulators ready! It is now safe to connect your app.` (en puertos `8085` y `9195`).

2. En otra terminal ejecutar vitest en `Instancias Clientes/ventas/ventas-moni-app/`:
   ```bash
   npx vitest run tests/unit/firestoreRules.spec.js tests/unit/employeePinLogin.spec.js tests/unit/employeeAuthEmulator.spec.js
   ```
   *Se espera:* `Tests  20 passed | 0 failed`.

3. Validar build de Vite en `Instancias Clientes/ventas/ventas-moni-app/`:
   ```bash
   npm run build
   ```
   *Se espera:* Compilación en éxito sin errores de empaquetado.

4. Validar linter en `Instancias Clientes/ventas/ventas-moni-app/`:
   ```bash
   npx eslint .
   ```
   *Se espera:* Ningún error nuevo de linter en los archivos modificados o creados.

---

**Ciclos de autocorrección**:
- **Ciclo 1**: Falla al levantar emuladores de Firebase en puertos `8080` y `9099`. *Diagnóstico:* Colisión de puertos con otras tareas concurrentes en la máquina local. *Acción:* Reconfigurar puertos alternos aislados (`8085` para firestore, `9195` para auth) en `firebase.json` y en los 3 specs de pruebas unitarias.
- **Ciclo 2**: Falla en Vitest y ESLint debido a importación duplicada/redundante de `pathModule` en `firestoreRules.spec.js` y error `no-undef` para la variable `process` en `employeeAuthEmulator.spec.js`. *Acción:* Limpiar imports de path a import estándar de Node.js y agregar la directiva `/* global process */` en `employeeAuthEmulator.spec.js`.
- **Ciclo 3**: Todas las pruebas unitarias pasan (20/20), linter se encuentra libre de fallas en archivos inyectados y la build de producción compila correctamente.

**Estado final**: `VERIFICADO`
