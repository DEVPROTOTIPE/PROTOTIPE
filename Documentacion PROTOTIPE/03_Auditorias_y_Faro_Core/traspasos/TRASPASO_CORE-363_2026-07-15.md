# Traspaso — CORE-363

- **Estado anterior → Estado actual**: 
  - La aplicación del cliente `ventas-moni-app` presentaba 3 violaciones a la regla `no-restricted-syntax` debido a llamadas directas a `setDoc()` de Firestore dentro de `src/pages/LoginPage.jsx` (registro del primer admin, backfill de `ownerUid` y alta de cliente nuevo).
  - Se han encapsulado estas escrituras en `src/services/userService.js` mediante la creación de `registerNewClient()` y `registerFirstAdmin()`, y la reutilización de `updateClientProfile()` (función ya existente).
  - El archivo `src/pages/LoginPage.jsx` se encuentra ahora libre de llamadas a `setDoc()` directo (0 incidencias de la regla).

- **Repositorio / rama / HEAD**:
  - Rama: `docs/context-packaging`
  - HEAD: `91175e5` (los cambios quedan locales en el área de trabajo, listos para commit).

- **Alcance ejecutado**:
  - Modificación de `Instancias Clientes/ventas/ventas-moni-app/src/services/userService.js` para añadir las funciones de ayuda de Firestore.
  - Modificación de `Instancias Clientes/ventas/ventas-moni-app/src/pages/LoginPage.jsx` para invocar las funciones del servicio de usuarios, limpiar las importaciones obsoletas de Firestore (`setDoc`, `serverTimestamp`) e importar los métodos del servicio de usuarios.
  - Ejecución de verificaciones locales de ESLint, Vitest y Build.

- **Archivos modificados**:
  - **Modificados**:
    - [`src/services/userService.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/services/userService.js)
    - [`src/pages/LoginPage.jsx`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/pages/LoginPage.jsx)

- **Pruebas ejecutadas y resultado literal**:
  - **Vitest Run (`HECHO VERIFICADO`)**:
    ```text
     Test Files  9 passed (9)
          Tests  85 passed (85)
       Start at  21:06:55
       Duration  5.19s
    ```
  - **Vite Build (`HECHO VERIFICADO`)**:
    ```text
    ✓ built in 9.92s
    precache  97 entries (3998.77 KiB)
    files generated
      dist/sw.js
      dist/workbox-9c191d2f.js
    ```
  - **ESLint (`HECHO VERIFICADO`)**:
    ```text
    npx eslint src/pages/LoginPage.jsx src/services/userService.js
    Cero ocurrencias de "setDoc() directo está prohibido". Se reportan únicamente las 3 violaciones preexistentes y ajenas a esta tarea (ErrorBoundary y DEFAULT_SETTINGS sin usar, y set-state-in-effect).
    ```

- **Evidencia pendiente**:
  - Ninguna.

- **Riesgos y bloqueos**:
  - Ninguno. La funcionalidad de login y registro mantiene la misma lógica operativa exacta y ha sido validada sin regresiones.

- **Documentación actualizada**:
  - Se crearon los artefactos locales de Antigravity `task.md` e `implementation_plan.md` en el brain.

- **Siguiente paso exacto**:
  - El revisor debe proceder con la reverificación rápida.

- **Acciones que siguen sin autorización**:
  - Subir cambios a producción o realizar `git push`.

---

## Reverificación rápida para quien retome

Ejecuta exactamente estos comandos antes de confiar en este traspaso y de construir sobre él:

1. Validar linter en `Instancias Clientes/ventas/ventas-moni-app/`:
   ```bash
   npx eslint src/pages/LoginPage.jsx src/services/userService.js
   ```
   *Se espera:* Cero ocurrencias de `"setDoc() directo está prohibido"` en la salida.

2. En otra terminal ejecutar vitest en `Instancias Clientes/ventas/ventas-moni-app/`:
   ```bash
   npx vitest run
   ```
   *Se espera:* `85 passed` (o la línea base actual).

3. Validar build de Vite en `Instancias Clientes/ventas/ventas-moni-app/`:
   ```bash
   npm run build
   ```
   *Se espera:* Compilación exitosa sin errores de empaquetado.

4. Validar diff en `Instancias Clientes/ventas/ventas-moni-app/`:
   ```bash
   git diff --stat -- src/pages/LoginPage.jsx src/services/userService.js
   ```
   *Se espera:* Solo 2 archivos modificados: `LoginPage.jsx` y `userService.js`.

---

**Ciclos de autocorrección**:
- **Ciclo 1**: Implementación y verificación inicial exitosa en todos los aspectos (Vitest, Build, ESLint y Git Diff) en la primera pasada sin errores adicionales de regresión.

**Estado final**: `VERIFICADO` (AWAITING_REVIEW)
