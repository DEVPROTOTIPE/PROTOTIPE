# Plantilla de asignación de tarea a Antigravity

**Procedencia:** creada 2026-07-15 junto con `AI_WORKFLOW.md` §7.2 (protocolo
de traspaso verificado con loop de autocorrección), por instrucción explícita
del fundador: poder asignar trabajo a Antigravity pasando **un solo archivo
de contexto**, sin tener que explicar la operativa manualmente en cada chat.

## Cómo se usa

1. Copia este archivo a
   `Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/asignaciones/ASIGNACION_<ID-TAREA>_<FECHA>.md`.
2. Rellena cada `{{PLACEHOLDER}}` con el detalle real de la tarea (quien
   asigna — el fundador, o Claude antes de quedarse sin contexto — escribe
   objetivo, alcance, exclusiones y criterios de cierre verificables por
   comando; no dejar ninguno vacío).
3. Abre un chat **nuevo** de Antigravity apuntando a `D:\PROTOTIPE` y pega o
   adjunta el archivo ya rellenado completo. No hace falta añadir nada más
   por chat — si Antigravity necesita algo que este archivo no cubre, el
   protocolo (sección 9 abajo) le exige detenerse y marcarlo `DECISIÓN
   REQUERIDA`, no inventarlo.

---

# Asignación de tarea — {{TASK_ID}}

Este archivo es autocontenido: se pega o adjunta completo en un chat nuevo de
Antigravity apuntando a `D:\PROTOTIPE`. Todo lo que necesitas para operar
está aquí o en los archivos que este documento referencia explícitamente.

## 0. Quién eres y bajo qué reglas operas

Trabajas dentro de PROTOTIPE bajo el contrato multiagente
`.agents/AI_WORKFLOW.md` — **léelo completo antes de escribir nada**; esta
sección resume solo la parte operativa que necesitas para *esta* tarea, no
reemplaza esa lectura. `CLAUDE.md` (límites obligatorios) y
`.agents/AI_WORKFLOW.md` §1-6 siguen aplicando íntegros aunque no se repitan
aquí completos.

Antes de escribir:

1. Ejecuta `git status --short --branch` en `D:\PROTOTIPE`.
2. Confirma que rama y `HEAD` coinciden con lo indicado en la sección 1. Si
   no coinciden, **detente** — alguien más movió el repositorio desde que se
   preparó esta asignación; no asumas que puedes continuar igual.
3. Trata cualquier cambio que encuentres en el working tree que no hayas
   hecho tú como trabajo ajeno: no lo borres, no lo sobrescribas, no lo
   reclames como propio.

## 1. Identificación de la tarea

- ID: {{TASK_ID}}
- Título: {{TITULO}}
- Asignada por: {{ASIGNADO_POR}} el {{FECHA}}
- Repositorio / rama / HEAD esperados al momento de asignar: {{REPO_RAMA_HEAD}}

## 2. Objetivo y beneficio

{{OBJETIVO}}

## 3. Alcance autorizado

{{ALCANCE}}

## 4. Exclusiones explícitas (NO HACER bajo ninguna circunstancia)

{{EXCLUSIONES}}

Recordatorio permanente (de `CLAUDE.md`, no depende de la tarea): no leas,
muestres, solicites ni guardes valores de secretos; no abras `.env` reales;
no hagas commit, push, deploy, restore, reset, clean, descarte ni
reescritura de historial sin autorización explícita separada del fundador;
no uses `git add .`.

## 5. Criterios de cierre verificables por comando

{{CRITERIOS_CIERRE}}

## 6. Loop de autocorrección obligatorio (`AI_WORKFLOW.md` §7.2)

1. Implementa el cambio.
2. Ejecuta **todos** los criterios de la sección 5, no solo el que acabas de
   tocar.
3. Si alguno falla: diagnostica la causa raíz, corrige, y vuelve al paso 2 —
   ejecuta todos de nuevo (una corrección puede romper algo que antes
   pasaba).
4. Repite hasta que todos pasen con evidencia literal, o hasta agotar **5
   ciclos completos**. Si agotas el límite sin éxito: detente, etiqueta como
   `BLOQUEO` (no fuerces un cierre verde bajando el criterio), y déjalo así
   en el traspaso.
5. Registra cada ciclo (incluidos los fallidos) en el traspaso: qué falló,
   qué intentaste, qué cambió — no solo el resultado final.

## 7. Etiqueta cada afirmación (`AI_WORKFLOW.md` §7.1)

`HECHO VERIFICADO` / `RESULTADO INFORMADO NO REAUDITADO` / `INFERENCIA` /
`RIESGO` / `PROPUESTA` / `BLOQUEO` / `DECISIÓN REQUERIDA`. Nunca escribas
"esto ya funciona" sin el comando exacto y su salida literal.

## 8. Artefacto de salida obligatorio

Al terminar (con éxito o en `BLOQUEO`), escribe:

`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_{{TASK_ID}}_<FECHA>.md`

usando la plantilla de handoff de `AI_WORKFLOW.md` §7.1, más la sección final
obligatoria "Reverificación rápida para quien retome" de §7.2 (2-5 comandos
exactos + resultado exacto esperado).

No marques `tareas_pendientes.md` ni `bitacora_cambios.md` como
`VERIFIED_COMPLETE` por tu cuenta — deja el estado en `AWAITING_REVIEW` (o
`BLOQUEO`) y descríbelo en el traspaso. Quien retome (Claude u otra sesión)
hace el cierre formal después de reverificar.

## 9. Si algo no está claro

Si falta una decisión que cambie materialmente el resultado y no está
cubierta en las secciones 3-5, no la inventes ni la asumas: etiqueta esa
parte como `DECISIÓN REQUERIDA`, avanza en lo que sí puedas hacer con
seguridad, y detente ahí — igual que exige `AI_WORKFLOW.md` §3.
