# Asignación de tarea — CORE-360

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
3. Puede haber OTRAS tareas corriendo en paralelo (`CORE-359`, `CORE-348`,
   asignadas a otras instancias/chats de Antigravity). Esta tarea toca
   **solo** `Prototipe-CLI/knowledge/firestore/` (el archivo `core.rules` y
   los fragmentos en `features/*.rules`). **NO toques ningún otro archivo,
   y en particular JAMÁS ejecutes `node scripts/distribute_rules.js --write`**
   (ver §3 y §4 — la bandera `--write` sobrescribiría físicamente los
   `firestore.rules` reales de `App Ventas`, `template-ventas` y
   `ventas-moni-app`, incluyendo el trabajo que `CORE-359` puede estar
   escribiendo en paralelo en ese mismo momento sobre `ventas-moni-app`).
4. Trata cualquier cambio que no sea tuyo como ajeno.

## 1. Identificación

- ID: `CORE-360`
- Título: Sincronizar `knowledge/firestore/core.rules` con el estado real
  de seguridad de Core (`SEC-012`–`SEC-017`), sin tocar ningún
  `firestore.rules` desplegado
- Asignada por: Claude Code (terminal), 2026-07-15

## 2. Objetivo y beneficio

`Prototipe-CLI/scripts/distribute_rules.js` es el mecanismo de composición
de reglas: toma `knowledge/firestore/core.rules` + fragmentos de
`knowledge/firestore/features/*.rules` y compone el `firestore.rules` que
"debería" tener cada destino (`App Ventas` = Core, `template-ventas`,
`ventas-moni-app`, `template-core-seed`). Sin la bandera `--write`, el
script es **completamente seguro**: solo calcula un hash SHA-256 del
resultado compuesto y lo compara contra el archivo físico real de cada
destino, reportando `🟢 Paridad certificada` o `🔴 FAIL: Desviación de
paridad` — nunca escribe nada a menos que el destino no exista o se pase
`--write` explícitamente (confirmado leyendo el código, líneas 88-93).

Hoy `core.rules` está desactualizado: fue modificado por última vez el
2026-07-14, un día antes de que `SEC-012` a `SEC-017` (identidad real de
clientes/empleados, retiro de `isFirstStart`, `isOperator`, etc.)
modificaran a mano el `firestore.rules` real de `Plantillas Core/App
Ventas`. Esto significa que **hoy mismo, ejecutando el script sin
`--write`, reportaría `FAIL` contra el propio Core** — la herramienta de
detección de drift está ciega justo para el trabajo de seguridad más
importante de esta serie. Esto ya fue señalado como `RIESGO` (no corregido)
en `CORE-356` y `CORE-358`. Esta tarea lo cierra.

## 3. Alcance autorizado

1. Ejecuta primero, para ver el estado real de partida (esto NO escribe
   nada, es de solo lectura/diagnóstico):
   ```bash
   cd "D:\PROTOTIPE\Prototipe-CLI"
   node scripts/distribute_rules.js
   ```
   Espera ver `🔴 FAIL` para `App Ventas (Core Plantilla)` como mínimo.
   Documenta el resultado literal completo en el traspaso antes de tocar
   nada (evidencia de la línea base).
2. Compara `knowledge/firestore/core.rules` contra
   `Plantillas Core/App Ventas/firestore.rules` (HEAD `a8f3048`, la fuente
   de verdad real) línea por línea. Identifica qué helpers/colecciones son
   genéricos (van en `core.rules`) y cuáles son específicos de las
   features declaradas para ese destino (`orders`, `credits`, `inventory`,
   `notifications` — van en el fragmento correspondiente de
   `knowledge/firestore/features/`).
3. Actualiza `core.rules` y los 4 archivos de `features/` (`orders.rules`,
   `credits.rules`, `inventory.rules`, `notifications.rules`) para que,
   compuestos, reproduzcan el contenido real y actual de
   `Plantillas Core/App Ventas/firestore.rules` (semánticamente — no hace
   falta que el hash SHA-256 coincida byte a byte con espacios/comentarios,
   pero si puedes lograr coincidencia exacta, mejor: el criterio de cierre
   de la sección 5 sí exige paridad de hash).
4. Si alguna regla/colección de Core no encaja claramente en ninguna
   feature existente (por ejemplo `employeeAuthLinks`, `stockMovements`,
   `accessLogs`, que son del dominio de empleados, no listados como
   feature separada hoy), decide si:
   - (a) pertenecen a `core.rules` directamente (si son transversales a
     cualquier instancia con empleados), o
   - (b) requieren una feature nueva `employees.rules` + agregar
     `'employees'` a la lista de `features` de los 3 destinos que ya la
     necesitan (`App Ventas`, `template-ventas`, `ventas-moni-app`) dentro
     de `DEPLOYMENTS` en `distribute_rules.js`.
   Ambas son válidas; documenta cuál elegiste y por qué en el traspaso
   (etiqueta `PROPUESTA` si dudas, no inventes sin dejar rastro).
5. Vuelve a ejecutar `node scripts/distribute_rules.js` (sin `--write`,
   nunca) y confirma `🟢 Paridad certificada` para `App Ventas (Core
   Plantilla)`.

## 4. Exclusiones explícitas — leer dos veces

- **JAMÁS ejecutes `node scripts/distribute_rules.js --write`** bajo
  ninguna circunstancia, ni siquiera "para probar". Esa bandera escribe
  físicamente sobre los 4 archivos `firestore.rules` reales de
  `DEPLOYMENTS`, incluyendo `Instancias Clientes/ventas/ventas-moni-app/firestore.rules`
  que `CORE-359` puede estar editando a mano en paralelo en este momento —
  sobrescribirlo destruiría ese trabajo sin ningún aviso.
- No edites directamente ningún `firestore.rules` de ningún destino
  (`App Ventas`, `template-ventas`, `ventas-moni-app`, `template-core-seed`)
  — todos esos archivos son de solo lectura para esta tarea, únicamente
  los lees para comparar.
- No toques `Instancias Clientes/`, `Prototipe-CLI/templates/`, `.agents/`
  ni `.claude/` (otras tareas corren ahí en paralelo).
- No hacer commit/push.
- Es **esperado y correcto** que `ventas-moni-app` y `template-core-seed`
  sigan reportando `FAIL` al final de esta tarea (el primero depende de
  `CORE-359`, que puede no estar terminado todavía; el segundo es
  intencionalmente agnóstico de features, no necesita este cambio).
  Documenta esto explícitamente para que no se lea como un fallo tuyo.

## 5. Criterios de cierre verificables por comando

Todos ejecutados dentro de `Prototipe-CLI/` (nunca con `--write`):
1. `node scripts/distribute_rules.js` → se espera `🟢 Paridad certificada`
   para `App Ventas (Core Plantilla)` como mínimo.
2. Si además logras paridad para `template-ventas`, repórtalo, pero no es
   obligatorio (puede haber diferencias legítimas de formato de la
   propagación manual de `CORE-356`).
3. `git diff --stat -- Prototipe-CLI/knowledge/firestore/` → confirma que
   solo se modificaron archivos dentro de esa carpeta, nada más.

## 6. Loop de autocorrección (`AI_WORKFLOW.md` §7.2)

Implementa → corre el criterio de la sección 5 → si falla, corrige y
vuelve a correr → hasta 5 ciclos o `BLOQUEO`.

## 7. Etiquetado de evidencia (`AI_WORKFLOW.md` §7.1)

`HECHO VERIFICADO` / `RESULTADO INFORMADO NO REAUDITADO` / `INFERENCIA` /
`RIESGO` / `PROPUESTA` / `BLOQUEO` / `DECISIÓN REQUERIDA`.

## 8. Artefacto de salida obligatorio

`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-360_2026-07-15.md`
con plantilla de `AI_WORKFLOW.md` §7.1 + sección "Reverificación rápida"
de §7.2 (debe incluir el comando exacto `node scripts/distribute_rules.js`
sin `--write` y la salida literal esperada). No marques
`tareas_pendientes.md`/`bitacora_cambios.md` como `VERIFIED_COMPLETE` —
deja `AWAITING_REVIEW`.

## 9. Si algo no está claro

Etiqueta `DECISIÓN REQUERIDA`, no inventes, detente ahí. En particular: si
en algún momento dudas si un comando podría disparar `--write` o modificar
un `firestore.rules` real, detente y pregunta antes de ejecutar — es
preferible un `BLOQUEO` documentado que arriesgar el trabajo de `CORE-359`.
