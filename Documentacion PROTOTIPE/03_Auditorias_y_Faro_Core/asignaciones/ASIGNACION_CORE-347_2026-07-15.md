# Asignación de tarea — CORE-347

Este archivo es autocontenido: se pega o adjunta completo en un chat nuevo de
Antigravity apuntando a `D:\PROTOTIPE`. Todo lo que necesitas para operar
está aquí o en los archivos que este documento referencia explícitamente.
Generado desde `Documentacion PROTOTIPE/00_Continuidad/templates/PLANTILLA_ASIGNACION_ANTIGRAVITY.md`.

## 0. Quién eres y bajo qué reglas operas

Trabajas dentro de PROTOTIPE bajo el contrato multiagente
`.agents/AI_WORKFLOW.md` — **léelo completo antes de escribir nada**; esta
sección resume solo la parte operativa que necesitas para *esta* tarea, no
reemplaza esa lectura. `CLAUDE.md` (límites obligatorios) y
`.agents/AI_WORKFLOW.md` §1-6 siguen aplicando íntegros aunque no se repitan
aquí completos.

Antes de escribir:

1. Ejecuta `git status --short --branch` en `D:\PROTOTIPE`.
2. Confirma que rama y `HEAD` coinciden con lo indicado abajo. Si no
   coinciden, **detente** — alguien más movió el repositorio desde que se
   preparó esta asignación; no asumas que puedes continuar igual.
3. Trata cualquier cambio que encuentres en el working tree que no hayas
   hecho tú (hay trabajo sustancial sin commitear de `CORE-345`, `CORE-346`
   y un addendum de gobernanza — ninguno es tuyo) como trabajo ajeno: no lo
   borres, no lo sobrescribas, no lo reclames como propio.

## 1. Identificación de la tarea

- ID: `CORE-347`
- Título: Dejar de rastrear en Git `Prototipe-CLI/notification_config.json` y
  `Prototipe-CLI/auth_users.json` (parte segura de `SEC-010`/`SEC-011`)
- Asignada por: Claude Code (terminal) el 2026-07-15
- Repositorio / rama / HEAD esperados al momento de asignar:
  `D:\PROTOTIPE`, rama `docs/context-packaging`, HEAD `98b3304`

## 2. Objetivo y beneficio

`registro_riesgos_deuda_tecnica_2026-07-14.md` (hallazgo P0-E, reverificado
el 2026-07-15 con `git ls-files`, contenido nunca abierto) confirma que
`Prototipe-CLI/notification_config.json` y `Prototipe-CLI/auth_users.json`
siguen rastreados en el índice de Git hoy. Si contienen valores reales (token
de Telegram, credenciales de usuarios), cualquiera con acceso de lectura al
repositorio los ve. El beneficio de esta tarea es cerrar la parte de ese
riesgo que **no** requiere que una IA toque el valor real de un secreto ni
reescriba historial: dejar de rastrear los archivos hacia adelante y
asegurar que exista una plantilla saneada equivalente para que el CLI siga
siendo instalable sin esos archivos reales.

## 3. Alcance autorizado

1. Verificar, **sin abrir ni citar su contenido interno**, únicamente si
   `Prototipe-CLI/notification_config.json` y `Prototipe-CLI/auth_users.json`
   ya son plantillas/fixtures inertes o si contienen datos que parecen
   reales. Puedes usar señales indirectas y seguras (tamaño de archivo,
   fecha de modificación, `git log --follow -p -- <archivo>` **solo si te
   detienes en cuanto un valor se vea real** — en ese caso no sigas leyendo
   ese diff, regístralo como `RIESGO` sin citar el valor).
2. Confirmar si ya existen plantillas saneadas equivalentes en
   `Prototipe-CLI/` (ejemplo: `*.example.json`, `*.template.json`); si no
   existen, crear `Prototipe-CLI/notification_config.example.json` y
   `Prototipe-CLI/auth_users.example.json` con la misma forma/claves que los
   reales pero con valores de ejemplo evidentemente falsos
   (`"REPLACE_ME"`, `"00000000"`, etc.).
3. Añadir ambas rutas reales a `.gitignore` en la raíz del repo si no están
   ya cubiertas por un patrón existente.
4. Ejecutar `git rm --cached Prototipe-CLI/notification_config.json
   Prototipe-CLI/auth_users.json` — esto detiene el rastreo hacia adelante
   dejando el archivo intacto en el working tree local; **no es un commit**.
5. Documentar en el traspaso, sin citar valores, qué claves de nivel
   superior tenía cada archivo (para que el registro de riesgos se pueda
   actualizar con precisión sobre qué tipo de dato quedó expuesto).
6. Dejar el cambio del índice (`git rm --cached`) sin commitear, listo para
   que el fundador o Claude lo revise y decida cuándo commitear.

## 4. Exclusiones explícitas (NO HACER bajo ninguna circunstancia)

- No rotar, generar ni reemplazar el valor real del token de Telegram ni de
  ningún hash/salt de `auth_users.json` — eso requiere acceso del fundador al
  panel de Telegram y es una decisión operativa suya, no de una IA. Queda
  como `DECISIÓN REQUERIDA` en el traspaso, no como algo que se resuelve
  aquí.
- No hacer `git commit`, `git push` ni ningún deploy.
- No reescribir historial de Git (`filter-repo`, BFG, `rebase` sobre commits
  ya existentes) bajo ninguna circunstancia — permanece exclusivamente
  autorizable por el fundador, y no es parte de esta tarea aunque el ticket
  origen (`SEC-010`) lo mencione ("escanear HEAD/historial" queda fuera de
  alcance de `CORE-347`, es trabajo de una tarea posterior con autorización
  explícita).
- No citar, imprimir ni pegar el contenido real de los valores en el
  traspaso, en un commit, ni en ningún archivo nuevo.
- No tocar `SEC-012` a `SEC-020` ni ningún otro ticket del backlog — alcance
  limitado a la parte seguibilidad-únicamente de `SEC-010`/`SEC-011`.
- No usar `git add .`; si necesitas mover el archivo al índice, referencia
  las rutas exactas.

Recordatorio permanente (de `CLAUDE.md`, no depende de la tarea): no leas,
muestres, solicites ni guardes valores de secretos; no abras `.env` reales;
no hagas commit, push, deploy, restore, reset, clean, descarte ni
reescritura de historial sin autorización explícita separada del fundador;
no uses `git add .`.

## 5. Criterios de cierre verificables por comando

1. `git status --short -- Prototipe-CLI/notification_config.json
   Prototipe-CLI/auth_users.json` → se espera: ambos archivos aparecen como
   `D ` (deleted del índice) o equivalente tras `git rm --cached`, sin haber
   sido borrados del disco (siguen existiendo con `ls Prototipe-CLI/`).
2. `git check-ignore -v Prototipe-CLI/notification_config.json
   Prototipe-CLI/auth_users.json` → se espera: ambas rutas coinciden con una
   regla en `.gitignore` (salida no vacía para las dos).
3. `ls Prototipe-CLI/*.example.json` (o el nombre real que uses) → se espera:
   existen equivalentes saneados, con estructura de claves visible y ningún
   valor que parezca real.
4. `git diff --cached --stat` → se espera: solo aparecen los dos archivos
   removidos del índice y, si los creaste, los nuevos `*.example.json` como
   añadidos — ningún otro archivo del working tree pendiente de `CORE-345`/
   `CORE-346` aparece tocado.

## 6. Loop de autocorrección obligatorio (`AI_WORKFLOW.md` §7.2)

1. Implementa el cambio.
2. Ejecuta **todos** los criterios de la sección 5, no solo el que acabas de
   tocar.
3. Si alguno falla: diagnostica la causa raíz, corrige, y vuelve al paso 2 —
   ejecuta todos de nuevo.
4. Repite hasta que todos pasen con evidencia literal, o hasta agotar **5
   ciclos completos**. Si agotas el límite sin éxito: detente, etiqueta como
   `BLOQUEO`, y déjalo así en el traspaso.
5. Registra cada ciclo (incluidos los fallidos) en el traspaso.

## 7. Etiqueta cada afirmación (`AI_WORKFLOW.md` §7.1)

`HECHO VERIFICADO` / `RESULTADO INFORMADO NO REAUDITADO` / `INFERENCIA` /
`RIESGO` / `PROPUESTA` / `BLOQUEO` / `DECISIÓN REQUERIDA`. Nunca escribas
"esto ya funciona" sin el comando exacto y su salida literal.

## 8. Artefacto de salida obligatorio

Al terminar (con éxito o en `BLOQUEO`), escribe:

`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-347_2026-07-15.md`
(o la fecha real de cierre si es distinta)

usando la plantilla de handoff de `AI_WORKFLOW.md` §7.1, más la sección final
obligatoria "Reverificación rápida para quien retome" de §7.2.

No marques `tareas_pendientes.md` ni `bitacora_cambios.md` como
`VERIFIED_COMPLETE` por tu cuenta — deja el estado en `AWAITING_REVIEW` (o
`BLOQUEO`) y descríbelo en el traspaso. Quien retome (Claude u otra sesión)
hace el cierre formal después de reverificar, incluyendo la decisión
pendiente de rotación real del token/credenciales.

## 9. Si algo no está claro

Si falta una decisión que cambie materialmente el resultado y no está
cubierta en las secciones 3-5, no la inventes ni la asumas: etiqueta esa
parte como `DECISIÓN REQUERIDA`, avanza en lo que sí puedas hacer con
seguridad, y detente ahí.
