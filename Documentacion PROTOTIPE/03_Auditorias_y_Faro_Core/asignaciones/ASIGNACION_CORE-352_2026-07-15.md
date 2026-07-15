# Asignación de tarea — CORE-352

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
   preparó esta asignación.
3. **Claude Code está trabajando en paralelo, en este mismo momento, en
   `SEC-015` (identidad de empleados) dentro de `Plantillas Core/App Ventas/`.**
   Esta asignación está deliberadamente acotada a `Central PROTOTIPE/dev-dashboard/`
   para no solaparse. No toques ningún archivo fuera de esa carpeta bajo
   ninguna circunstancia, ni siquiera si parece relacionado o útil.
4. Trata cualquier cambio que encuentres en el working tree que no hayas
   hecho tú (hay commits recientes de Claude Code sin relación a esta tarea)
   como trabajo ajeno: no lo borres, no lo sobrescribas.

## 1. Identificación de la tarea

- ID: `CORE-352` (activa `REP-011` del backlog propuesto)
- Título: Build autónomo del Dashboard Central — opcionalizar la dependencia
  documental de `verify_library_integrity.cjs`
- Asignada por: Claude Code (terminal) el 2026-07-15
- Repositorio / rama / HEAD esperados al momento de asignar:
  `D:\PROTOTIPE`, rama `docs/context-packaging`, HEAD `d247432`

## 2. Objetivo y beneficio

`Central PROTOTIPE/dev-dashboard/package.json` define
`"prebuild": "node scripts/verify_library_integrity.cjs"`. Ese script (981
líneas) exige que `Documentacion PROTOTIPE/` exista como carpeta hermana del
monorepo (confirmado por búsqueda: líneas 66-68 construyen `docsRoot` a
partir de esa ruta relativa; línea 735 lee
`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`). Esto
significa que **el Dashboard no se puede construir hoy fuera de este
monorepo exacto** — si alguien copia `Central PROTOTIPE/dev-dashboard/` a un
repositorio independiente (como ya se hizo con `Plantillas Core/App Ventas`
en `D:\PROTOTIPE_WORKSPACE\dev-dashboard` según `CLAUDE.md`), `npm run
build` falla en el paso `prebuild`. El objetivo es que el build funcione en
ambos escenarios: dentro del monorepo (validación completa, comportamiento
actual sin degradar) y fuera de él (validación se salta con una advertencia
clara, no un error fatal).

## 3. Alcance autorizado

1. Leer `scripts/verify_library_integrity.cjs` completo para entender todos
   los puntos donde depende de `Documentacion PROTOTIPE/` u otras rutas
   fuera de `Central PROTOTIPE/dev-dashboard/`.
2. Modificar el script para que, si `Documentacion PROTOTIPE/` (u otra ruta
   externa de la que dependa) no existe en disco, el script:
   - Emita una advertencia clara por consola (ej. `⚠️ Documentacion
     PROTOTIPE no encontrada — saltando validaciones documentales, build
     autónomo`).
   - Termine con código de salida `0` (éxito) en vez de fallar, saltando
     únicamente las validaciones que dependen de esa carpeta — sin fingir
     que las corrió.
   - Si existe, comportarse exactamente igual que hoy (ninguna regresión en
     el modo monorepo).
3. Puedes crear un flag/variable de entorno explícito si lo consideras más
   claro (ej. `DASHBOARD_STANDALONE_BUILD=1`), pero el comportamiento por
   defecto (sin ninguna variable) debe seguir funcionando igual que hoy
   dentro del monorepo — no lo hagas opt-in obligatorio.
4. Ejecutar los criterios de cierre de la sección 5 y documentar el
   resultado literal de cada uno.

## 4. Exclusiones explícitas (NO HACER bajo ninguna circunstancia)

- No tocar ningún archivo fuera de `Central PROTOTIPE/dev-dashboard/` —
  en particular, no tocar nada en `Plantillas Core/App Ventas/` (Claude Code
  trabaja ahí en paralelo ahora mismo).
- No modificar ni borrar nada dentro de `Documentacion PROTOTIPE/` — esta
  tarea es sobre que el Dashboard tolere su ausencia, no sobre cambiar esa
  carpeta.
- No degradar ni saltar la validación cuando `Documentacion PROTOTIPE/` SÍ
  está presente — el modo monorepo debe seguir siendo tan estricto como hoy.
- No hacer `git commit`, `git push` ni ningún deploy.
- No instalar dependencias nuevas sin necesidad clara; si hace falta alguna,
  documenta por qué en el traspaso.

Recordatorio permanente (de `CLAUDE.md`, no depende de la tarea): no leas,
muestres, solicites ni guardes valores de secretos; no abras `.env` reales;
no hagas commit, push, deploy, restore, reset, clean, descarte ni
reescritura de historial sin autorización explícita separada del fundador;
no uses `git add .`.

## 5. Criterios de cierre verificables por comando

1. **Build dentro del monorepo (comportamiento actual, sin regresión):**
   `cd "Central PROTOTIPE/dev-dashboard" && npm run build` → se espera:
   termina en éxito, igual que hoy, con las validaciones documentales
   corriendo normalmente (verificar que el log muestra que sí las ejecutó,
   no que las saltó).
2. **Build autónomo (el objetivo real de la tarea):** copia
   `Central PROTOTIPE/dev-dashboard/` completa a una carpeta temporal FUERA
   de `D:\PROTOTIPE` (ej. `C:\temp\dashboard-standalone-test\`, o usa
   `D:\PROTOTIPE_WORKSPACE\dev-dashboard` si ya existe una copia limpia
   equivalente — confirmar primero que esa copia no tiene ya
   `Documentacion PROTOTIPE` como hermana), instala dependencias (`npm
   install`) y corre `npm run build` ahí → se espera: termina en éxito, con
   una advertencia clara de que se saltó la validación documental (no un
   error fatal, no un `prebuild` que rompe el build).
3. `npm run lint` en `Central PROTOTIPE/dev-dashboard` → se espera: sin
   errores nuevos respecto a la línea base actual (compara contra
   `git show HEAD:"Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs"`
   con el mismo lint si quieres confirmar la línea base exacta antes de tu
   cambio).

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

`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-352_2026-07-15.md`
(o la fecha real de cierre si es distinta)

usando la plantilla de handoff de `AI_WORKFLOW.md` §7.1, más la sección final
obligatoria "Reverificación rápida para quien retome" de §7.2.

No marques `tareas_pendientes.md` ni `bitacora_cambios.md` como
`VERIFIED_COMPLETE` por tu cuenta — deja el estado en `AWAITING_REVIEW` (o
`BLOQUEO`) y descríbelo en el traspaso. Quien retome (Claude u otra sesión)
hace el cierre formal después de reverificar.

## 9. Si algo no está claro

Si falta una decisión que cambie materialmente el resultado y no está
cubierta en las secciones 3-5, no la inventes ni la asumas: etiqueta esa
parte como `DECISIÓN REQUERIDA`, avanza en lo que sí puedas hacer con
seguridad, y detente ahí.

## 10. Alcance NO cubierto por esta tarea (no lo intentes de más)

Esta tarea es específicamente sobre `verify_library_integrity.cjs` y el
`prebuild` del Dashboard. NO incluye:
- Configurar CI real (`REP-014`/`REP-015`) — eso es una tarea separada.
- Tocar `Prototipe-CLI` o cualquier otro módulo.
- Cualquier trabajo relacionado con el backlog SEC-* — eso lo maneja Claude
  Code en paralelo.

Si durante la investigación encuentras algo interesante fuera de este
alcance, documéntalo como `PROPUESTA` en el traspaso — no lo implementes.
