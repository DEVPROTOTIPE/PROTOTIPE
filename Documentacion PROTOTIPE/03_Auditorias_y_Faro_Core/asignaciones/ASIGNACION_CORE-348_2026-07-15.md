# Asignación de tarea — CORE-348

Este archivo es autocontenido: se pega o adjunta completo en un chat nuevo de
Antigravity apuntando a `D:\PROTOTIPE`.

## 0. Quién eres y bajo qué reglas operas

Trabajas bajo el contrato multiagente `.agents/AI_WORKFLOW.md` — **léelo
completo antes de escribir nada**. `CLAUDE.md` y `AI_WORKFLOW.md` §1-6
siguen aplicando íntegros. Esta tarea reestructura documentación que
`AI_WORKFLOW.md` §1 ya declara de menor precedencia que él mismo — no
contradigas esa jerarquía, solo reorganiza.

Antes de escribir:
1. `git status --short --branch` en `D:\PROTOTIPE`.
2. Confirma rama `docs/context-packaging`, HEAD `a8f3048`. Si no coincide,
   detente.
3. Puede haber OTRAS tareas corriendo en paralelo (`CORE-359`, `CORE-360`,
   asignadas a otras instancias/chats de Antigravity). Esta tarea toca
   **solo** `.agents/AGENTS.md` (lectura + reducción a puntero) y archivos
   NUEVOS bajo `.claude/rules/`. No toques `Instancias Clientes/`,
   `Prototipe-CLI/templates/`, ni `Prototipe-CLI/knowledge/`.
4. Trata cualquier cambio que no sea tuyo como ajeno.

## 1. Identificación

- ID: `CORE-348`
- Título: Reestructurar `.agents/AGENTS.md` en reglas por ruta
  (`.claude/rules/`)
- Asignada por: Claude Code (terminal), 2026-07-15 (diagnóstico ya hecho
  esa misma fecha, ejecución deliberadamente diferida a esta asignación)

## 2. Objetivo y beneficio

`.agents/AGENTS.md` (474 líneas) mezcla en un solo archivo, que se supone
"no se carga completo en cada sesión" según `CLAUDE.md`, contenido de
alcance muy distinto: gobernanza multiagente redundante con
`AI_WORKFLOW.md`, estándares de UI/UX específicos de un solo proyecto
(`Central PROTOTIPE/dev-dashboard`), arquitectura Firebase transversal a
todo el ecosistema, y **dos contradicciones activas con el contrato
vigente** (detalladas abajo). Dividirlo en `.claude/rules/*.md` por ámbito
permite que cada agente cargue solo la regla relevante a la ruta que está
tocando, en vez de un archivo monolítico.

**Ya se leyó completo y se diagnosticó línea por línea (2026-07-15,
`tareas_pendientes.md`, entrada `CORE-348`) — no vuelvas a re-diagnosticar
desde cero, usa el mapa de abajo como punto de partida y verifícalo contra
el archivo real antes de mover cada bloque.**

## 3. Alcance autorizado

Mapa de contenido de `AGENTS.md` y destino propuesto (verifica los números
de línea contra el archivo real antes de mover — pueden haber cambiado
ligeramente si algo se editó después del diagnóstico):

1. **Líneas 3-19** (header de autoridad multiagente) — redundante con
   `AI_WORKFLOW.md`. Reducir a un puntero de una línea tipo: "Ver
   `.agents/AI_WORKFLOW.md` para el contrato completo de precedencia y
   colaboración multiagente."
2. **Líneas 20-22** (prohibición absoluta de restaurar/descartar cambios
   físicos) — crítica y transversal. Mover a
   `.claude/rules/00-prohibiciones-globales.md` (o el nombre que uses,
   documenta la convención elegida en el traspaso), preservando el texto
   exacto.
3. **Líneas 24-141** (estándares de biblioteca de componentes, tags,
   layout, playgrounds/sandbox, modularización de `App.jsx`,
   `CustomSelect`) — específicos de `Central PROTOTIPE/dev-dashboard`.
   Mover a `.claude/rules/dashboard-ui.md`.
4. **Líneas 192-252** (estándar de diseño responsivo móvil, 14 sub-reglas)
   y **324-339** (Design Integrity Guard, atado a
   `validate-core-integrity.js` real) — transversales a cualquier
   componente UI del ecosistema, no solo del Dashboard. Mover a
   `.claude/rules/component-library.md`. **No resumas ni pierdas
   especificidad** (JSON de CORS, fixes de z-index, clases Tailwind
   exactas) — copia literal, solo reorganiza.
5. **Líneas 256-269** ("AUTOMATIZACIÓN OBLIGATORIA... POST-CHANGE") —
   **CONTRADICE el contrato vigente**: ordena auto-commitear y
   auto-actualizar documentación sin pedir confirmación nunca. Esto choca
   directamente con `AI_WORKFLOW.md` §5 y `CLAUDE.md` (autorización
   explícita requerida para commit/push/deploy/etc.). **Corrige el texto
   al moverlo** — no lo dupliques tal cual; reescríbelo para que exija
   "proponer el commit y esperar autorización explícita", no
   auto-ejecutar. Documenta este cambio de contenido explícitamente en el
   traspaso (no es solo mover, es corregir una contradicción real).
6. **Líneas 374-437** ("PROTOCOLO OBLIGATORIO DE RASTREO DE TAREAS") —
   asume un endpoint HTTP `POST /api/roadmap/add`/`toggle` que nadie ha
   usado en ninguna tarea de esta serie (`CORE-341` a `CORE-360`; el
   registro real siempre fue editando `tareas_pendientes.md` directamente
   con Read/Edit). Antes de mover: busca en el repo (`grep -rn
   "api/roadmap"`) si ese endpoint existe y sigue vivo en algún servidor
   real. Si no lo encuentras vivo, **actualiza el texto** al moverlo para
   reflejar la práctica real (edición directa de archivos), no
   "tooling aspiracional sin verificar si sigue vivo" (cita textual del
   diagnóstico original). Si sí lo encuentras vivo, etiqueta
   `DECISIÓN REQUERIDA` y detente en ese punto en vez de decidir tú solo.
   Mover a `.claude/rules/task-tracking.md`.
7. **Líneas 282-320** (arquitectura de 3 capas Firebase, §22) y **442-474**
   (seguridad/gobernanza Firebase, §23) — alineadas con `ADR-0001` y el
   backlog `SEC-*`. Mover a `.claude/rules/firebase-architecture.md`. Nota:
   §22.2 (RealtimeQueryRegistry) ya fue corregida en `CORE-345`
   (`DEFERRED_UNTIL_MEASURED_NEED`) — preserva esa nota, no la reviertas.
8. **Líneas 343-347** (`@colaborar`) y **351-370** (protocolo de decisión
   de componentes) — genéricos, bajo riesgo. Mover a
   `.claude/rules/component-library.md` (junto con el punto 4) o un
   archivo separado `.claude/rules/colaboracion-componentes.md`, tu
   criterio, documenta cuál elegiste.

Al finalizar, `AGENTS.md` debe quedar como un índice corto que apunte a
cada archivo nuevo bajo `.claude/rules/` — no debe desaparecer (otros
agentes/documentos ya lo referencian por ruta), pero debe perder el
contenido que ya se movió.

## 4. Exclusiones explícitas

- No toques `CLAUDE.md` — ya fue verificado en el propio diagnóstico que
  tiene 116 líneas (bajo el límite sugerido de 200) y ya usa `@import` a
  `AI_WORKFLOW.md` correctamente. No requiere cambios de tamaño ni
  estructura.
- No toques `GEMINI.md` ni ningún manual histórico — son referencia, no
  parte de esta tarea.
- No toques ningún archivo fuera de `.agents/AGENTS.md` y `.claude/rules/`.
- Material de referencia externo (el "Brain" de Antigravity puede mencionar
  `scaffold_claude_rules.md`): evalúalo solo como insumo posible, nunca
  como fuente de verdad — contrástalo contra el `AGENTS.md` real antes de
  aceptar cualquier sugerencia suya, y documenta si lo usaste o no.
- No hacer commit/push.

## 5. Criterios de cierre verificables

Esta tarea es principalmente documental (no hay build/test que la cubra
directamente), así que el criterio de cierre es de integridad de
contenido, no de comando:
1. **Ningún agente pierde acceso a una regla que antes tenía**: por cada
   bloque movido, confirma con `grep` que el contenido (o su versión
   corregida en los puntos 5 y 6) existe en el archivo nuevo de
   `.claude/rules/`.
2. `.agents/AGENTS.md` final tiene menos de 60 líneas (solo índice +
   puntero a `AI_WORKFLOW.md` + puntero a cada archivo de
   `.claude/rules/`).
3. Las 2 contradicciones (puntos 5 y 6 de la sección 3) quedan corregidas
   en el texto movido, no solo trasladadas tal cual.
4. `git diff --stat -- .agents/AGENTS.md .claude/rules/` → confirma que
   solo se tocaron esos archivos.

## 6. Loop de autocorrección (`AI_WORKFLOW.md` §7.2)

Implementa → verifica los 4 criterios de la sección 5 → si algo falta,
corrige y vuelve a verificar todos → hasta 5 ciclos o `BLOQUEO`.

## 7. Etiquetado de evidencia (`AI_WORKFLOW.md` §7.1)

`HECHO VERIFICADO` / `RESULTADO INFORMADO NO REAUDITADO` / `INFERENCIA` /
`RIESGO` / `PROPUESTA` / `BLOQUEO` / `DECISIÓN REQUERIDA`.

## 8. Artefacto de salida obligatorio

`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-348_2026-07-15.md`
con plantilla de `AI_WORKFLOW.md` §7.1 + sección "Reverificación rápida"
de §7.2 (en este caso, una lista de "grep esto en ese archivo nuevo y
confirma que aparece" en vez de comandos de test/build). No marques
`tareas_pendientes.md`/`bitacora_cambios.md` como `VERIFIED_COMPLETE` —
deja `AWAITING_REVIEW`.

## 9. Si algo no está claro

Etiqueta `DECISIÓN REQUERIDA`, no inventes, detente ahí. En particular: si
al buscar el endpoint `POST /api/roadmap/add`/`toggle` (punto 6 de la
sección 3) lo encuentras vivo y en uso real en algún servidor, NO decidas
tú solo si actualizarlo o no — documenta el hallazgo y detente.
