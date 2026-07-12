# Informe de Certificación — Fase P0.3: Scaffolding Security

**Estado:** `CERTIFIED`
**Fecha de cierre:** 2026-07-12
**Branch:** `refactor/generator-p0-2-blueprint-contract`

---

## 1. Objetivo de la Fase

Auditar, reproducir y corregir las vulnerabilidades de seguridad en el proceso de generación física de proyectos del CLI (`generator.js`, `worker_create_project.js`, `server.js`), siguiendo la metodología Red-Green:

1. **Commit A** — Caracterizar vulnerabilidades y crear suite de pruebas RED.
2. **Commit B** — Implementar defensas de filesystem (directory traversal + TOCTOU).
3. **Commit C** — Implementar protección de secretos en subprocesos e IPC.
4. **Fix** — Corrección de regresión de case-sensitivity en Windows.

---

## 2. Vulnerabilidades Encontradas (Auditoría Inicial)

| ID | Descripción | Archivo | Severidad |
|---|---|---|---|
| P03-01 | Directory Traversal en `targetPath` — se puede escribir fuera de `Instancias Clientes` | `generator.js` | **CRÍTICO** |
| P03-02 | Validación insuficiente de `logoPath` — se puede referenciar cualquier archivo del sistema | `ProvisioningEnvelopeAdapter.js` | **ALTO** |
| P03-03 | Ventana TOCTOU — validación y escritura separadas sin `realpath` post-`ensureDir` | `generator.js` | **ALTO** |
| P03-04 | Fuga de secretos por canal IPC — `console.log` enviaba raw `answers` al padre sin redactar | `worker_create_project.js` | **ALTO** |
| P03-05 | `redactSecrets` solo escaneaba `process.env` — no recibía objeto `answers` | `generator.js` / `server.js` | **MEDIO** |

---

## 3. Controles Implementados

### Commit A — Suite de Pruebas RED
- **Archivo:** `scripts/tests/p0_3/test_scaffolding_security.js`
- **Archivo:** `scripts/tests/p0_3/run_p0_3_security_tests.js`
- **Comando:** `npm run test:p0.3`
- **Estado en Commit A:** 1/6 PASSED (5 PRODUCT_BEHAVIOR_FAILURE documentados)

### Commit B — Hardening de Filesystem
- **[NEW] `lib/PathSecurity.js`** — Clase estática con `validateContainedPath()` e `isPathContained()`. Bloquea null bytes, traversals relativos y absolutos. Comparación case-insensitive en letra de unidad Windows.
- **[MODIFY] `lib/ProvisioningEnvelopeAdapter.js`** — Barrera temprana de `logoPath` contra `temp_uploads` y `execution.targetPath` contra `getWorkspaceRoot()` en ambas ramas (isNested y legacy).
- **[MODIFY] `generator.js`** — `validateContainedPath` al inicio de `createProject` + validación TOCTOU post-`ensureDir` con `fs.realpath` + `isPathContained`.

### Commit C — Protección de Secretos IPC
- **[NEW] `lib/SecretRedactor.js`** — Módulo centralizado con:
  - `buildSecretMap(answers)` — Mapa recursivo de `process.env` + `answers` anidados
  - `redactSecrets(value, answers)` — Censura strings, serializa y limpia objetos
  - `containsSecret(text, answers)` — Utilidad de verificación para tests
- **[MODIFY] `worker_create_project.js`** — `_activeAnswers` mutable, overrides de `console.log/error` pasan por `redactSecrets`, errores `IPC:ERROR` sanitizados.

### Fix — Regresión Windows Case-Sensitivity
- **[MODIFY] `lib/PathSecurity.js`** — `path.resolve()` en Windows preserva la case del drive letter del input (`d:` vs `D:`). Se normaliza a `toLowerCase()` en `validateContainedPath` e `isPathContained` antes de la comparación `startsWith`.

---

## 4. Matriz Antes / Después

| Control de Seguridad | Antes (P0.3 Inicio) | Después (P0.3 Cerrado) |
|---|---|---|
| Directory Traversal en `targetPath` | ❌ No protegido | ✅ Bloqueado vía `PathSecurity.validateContainedPath` |
| `logoPath` fuera de `temp_uploads` | ❌ No protegido | ✅ Bloqueado en Adapter (ambas ramas) |
| Ventana TOCTOU / symlinks | ❌ Abierta | ✅ Mitigada con `fs.realpath` post-`ensureDir` |
| Fuga de secretos en logs IPC | ❌ Raw `answers` enviado | ✅ `redactSecrets(line, _activeAnswers)` pre-IPC |
| Secretos anidados en `answers` | ❌ No detectados | ✅ `collectSecretsFromObject()` recursivo |
| Secretos en `process.env` | ⚠️ Parcial (solo env) | ✅ Combinado env + answers |
| Errores Firebase con secretos | ❌ Propagados raw | ✅ `redactSecrets(err.message, _activeAnswers)` |
| Case-sensitivity en Windows | ❌ Falso negativo `d:` vs `D:` | ✅ Normalización `toLowerCase()` en comparación |

---

## 5. Pruebas Ejecutadas

### Suite P0.3 — `npm run test:p0.3` (9 controles)

| # | Nombre del Control | Estado |
|---|---|---|
| 1 | Directory Traversal: `../../outside-target` | 🟢 PASSED |
| 2 | Directory Traversal: `C:\Windows\System32` | 🟢 PASSED |
| 3 | Directory Traversal: `/etc/malicious-config` | 🟢 PASSED |
| 4 | logoPath fuera de `temp_uploads` bloqueado | 🟢 PASSED |
| 5 | TOCTOU / `fs.realpath` hardening | 🟢 PASSED |
| 6 | `firebaseApiKey` en `answers` correctamente redactado | 🟢 PASSED |
| 7 | `adminPassword` en objeto anidado correctamente redactado | 🟢 PASSED |
| 8 | Token en `process.env` correctamente redactado | 🟢 PASSED |
| 9 | Error de Firebase con secreto correctamente censurado | 🟢 PASSED |

**Total: 9/9 PASSED — 0 PRODUCT_BEHAVIOR_FAILURES**

### Regresión P0.2 — `npm run test:p0.2` (70 controles)

**Total: 70/70 PASSED — 0 FAILED — 0 PRODUCT_BEHAVIOR_FAILURES**

---

## 6. Hashes de Commits

| Commit | Hash | Mensaje |
|---|---|---|
| A | `4ecb155` | `test(p0.3): add scaffolding security RED tests` |
| A-docs | `dd1bacf` | `docs(p0.3): update roadmap and changelog for scaffolding security RED tests` |
| B | `df76567` | `fix(p0.3): harden scaffolding paths against traversal and TOCTOU` |
| B-docs | `fe04938` | `docs(p0.3): update roadmap and changelog for scaffolding path hardening (Commit B)` |
| C | `9cacd7d` | `fix(p0.3): redact secrets from worker IPC and provisioning logs` |
| C-fix | `e5d4a8f` | `fix(p0.3): normalize drive letter case in PathSecurity for Windows compatibility` |

---

## 7. Estado Final

```
P0.3 STATUS: CERTIFIED

npm run test:p0.2  →  70/70 PASSED  ✅
npm run test:p0.3  →   9/9 PASSED  ✅

git status: working tree clean ✅
```

---

## 8. Archivos Clave del Cierre

| Archivo | Operación | Descripción |
|---|---|---|
| `lib/PathSecurity.js` | NEW | Validación centralizada de contención de paths |
| `lib/SecretRedactor.js` | NEW | Redacción recursiva de secretos env + answers |
| `lib/ProvisioningEnvelopeAdapter.js` | MODIFY | Barrera temprana logoPath + targetPath |
| `generator.js` | MODIFY | TOCTOU post-ensureDir + validateContainedPath |
| `worker_create_project.js` | MODIFY | IPC sanitizado mediante SecretRedactor |
| `scripts/tests/p0_3/test_scaffolding_security.js` | NEW | Suite de 9 controles de seguridad |
| `scripts/tests/p0_3/run_p0_3_security_tests.js` | NEW | Orquestador y reporte JSON |
