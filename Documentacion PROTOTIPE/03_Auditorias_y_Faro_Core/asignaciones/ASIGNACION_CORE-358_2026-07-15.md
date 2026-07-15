# Asignación de tarea — CORE-358

Este archivo es autocontenido: se pega o adjunta completo en un chat nuevo de
Antigravity apuntando a `D:\PROTOTIPE`.

## 0. Quién eres y bajo qué reglas operas

Trabajas bajo el contrato multiagente `.agents/AI_WORKFLOW.md` — **léelo
completo antes de escribir nada**. `CLAUDE.md` y `AI_WORKFLOW.md` §1-6
siguen aplicando íntegros.

Antes de escribir:
1. `git status --short --branch` en `D:\PROTOTIPE`.
2. Confirma rama `docs/context-packaging`, HEAD `2d98036`. Si no coincide,
   detente.
3. Esta tarea toca **solo** `Prototipe-CLI/` (no `templates/`, no
   `Plantillas Core`, no `Central PROTOTIPE`, no `Instancias Clientes`).
   Puede haber otras tareas corriendo en paralelo (`CORE-356`, `CORE-357`)
   en otras carpetas — no las toques.
4. Trata cualquier cambio que no sea tuyo como ajeno.

## 1. Identificación

- ID: `CORE-358` (activa `REP-012` del backlog propuesto)
- Título: Corregir falsos verdes del CLI (paths relativos, fixtures
  propios, exit codes)
- Asignada por: Claude Code (terminal), 2026-07-15

## 2. Objetivo y beneficio

`Prototipe-CLI` tiene múltiples scripts de prueba (`test_bridge_health.js`,
`test_characterization.js`, `test_firestore_emulator.js`,
`test_multiplatform.js`, `test_promotion_pipeline.js`, `test_provision.js`,
`test_robustness_specials.js`, `test_smoke_visual.js`, además de
`test_templates.js` que es el único que corre `npm test`) — pero no está
confirmado que todos fallen de verdad cuando algo está roto. El ticket
`REP-012` del backlog los describe como sospechosos de "falsos verdes":
puede que dependan de rutas absolutas del entorno de un desarrollador
específico (rompiéndose silenciosamente o dando falso positivo en otra
máquina), que reutilicen fixtures/datos que ya no reflejan el estado real,
o que el proceso termine con exit code 0 aunque una aserción interna haya
fallado (solo logueada, no propagada como fallo real). **Esta tarea es de
diagnóstico primero, corrección después — no asumas cuál es el problema
exacto en cada script hasta haberlo confirmado.**

## 3. Alcance autorizado

1. Para cada script `test_*.js` en `Prototipe-CLI/` (los 8 listados arriba,
   más cualquier otro `test_*.js` que encuentres):
   - Léelo completo.
   - Identifica: (a) ¿usa rutas absolutas o dependientes de la máquina
     actual (`D:\...` hardcodeado, `os.homedir()`, variables de entorno
     sin fallback)? (b) ¿usa fixtures compartidas con otros scripts o con
     datos de producción, en vez de fixtures propias autocontenidas? (c)
     ¿el script SIEMPRE termina con `process.exit(0)` o código de salida 0
     al final, sin importar si alguna aserción interna falló (busca
     patrones como `console.error` seguido de continuar ejecución, o
     bloques `try/catch` que solo loguean sin marcar el proceso como
     fallido)?
   - Prueba esto de forma concreta: modifica temporalmente el código bajo
     prueba para que algo falle a propósito (ej. rompe una función que el
     script verifica), corre el script, confirma si el exit code refleja
     el fallo (`echo $?` después de correrlo) — si no lo refleja, ahí está
     un falso verde real, no solo sospechado. Revierte el cambio temporal
     después de confirmar.
2. Para cada falso verde CONFIRMADO (no solo sospechado):
   - Corrige el path relativo/absoluto (usa `path.resolve(__dirname, ...)`
     o similar, nunca rutas hardcodeadas de una máquina).
   - Si depende de fixtures compartidas, créale fixtures propias en una
     carpeta `fixtures/` junto al script (ver
     `Prototipe-CLI/scripts/fixtures/` si ya existe una convención — úsala).
   - Corrige el exit code: el script debe terminar con código distinto de
     0 (`process.exitCode = 1` o `process.exit(1)`) si alguna aserción
     interna falla.
3. Documenta en el traspaso, script por script: cuál tenía el problema
   (con la prueba concreta que lo confirmó), cuál no tenía ninguno de los
   3 problemas (no lo toques, no arregles lo que no está roto).

## 4. Exclusiones explícitas

- No tocar nada fuera de `Prototipe-CLI/` (ni `templates/` dentro de
  `Prototipe-CLI/`, que sí pertenece potencialmente a `CORE-356`).
- No cambiar la lógica de negocio de lo que cada script prueba — solo cómo
  detecta y reporta fallos (paths, fixtures, exit codes).
- No hacer commit/push.
- No tocar credenciales, tokens ni archivos `.env` reales.
- Si un script requiere infraestructura que no está disponible en este
  entorno (ej. un emulador específico, una instancia real de Firebase) para
  poder probarlo de verdad, decláralo como `BLOQUEO` para ESE script
  puntual y sigue con los demás — no fuerces una verificación que no
  puedes hacer honestamente.

## 5. Criterios de cierre verificables por comando

Para cada script corregido, el comando exacto que lo demuestra (documentar
literal en el traspaso, por ejemplo):
```bash
cd Prototipe-CLI
node scripts/test_XXX.js; echo "exit code: $?"
```
Antes de la corrección: exit code 0 con un fallo inyectado a propósito
(falso verde confirmado). Después de la corrección: exit code distinto de
0 con el mismo fallo inyectado, y exit code 0 en el caso normal sin
fallos inyectados (no rompiste el caso feliz).

## 6. Loop de autocorrección (`AI_WORKFLOW.md` §7.2)

Implementa → corre TODOS los criterios de la sección 5 (todos los scripts
tocados, no solo el último) → si algo falla, corrige y vuelve a correr
TODOS → hasta 5 ciclos o `BLOQUEO`.

## 7. Etiquetado de evidencia (`AI_WORKFLOW.md` §7.1)

`HECHO VERIFICADO` / `RESULTADO INFORMADO NO REAUDITADO` / `INFERENCIA` /
`RIESGO` / `PROPUESTA` / `BLOQUEO` / `DECISIÓN REQUERIDA`. Especialmente
importante aquí: no reportes "arreglé el script X" sin la prueba de
inyección de fallo que lo confirma — de lo contrario, solo asumiste que
estaba roto en vez de confirmarlo.

## 8. Artefacto de salida obligatorio

`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-358_2026-07-15.md`
con plantilla de `AI_WORKFLOW.md` §7.1 + sección "Reverificación rápida"
de §7.2 (2-5 comandos exactos, uno por cada script corregido si son pocos,
o una muestra representativa si son muchos). No marques
`tareas_pendientes.md`/`bitacora_cambios.md` como `VERIFIED_COMPLETE` —
deja `AWAITING_REVIEW`.

## 9. Si algo no está claro

Etiqueta `DECISIÓN REQUERIDA`, no inventes, detente ahí.
