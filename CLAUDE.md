# PROTOTIPE — entrada operativa para Claude Code

@.agents/AI_WORKFLOW.md

## Propósito

Este archivo es la entrada breve para Claude Code. El contrato multiagente
importado arriba es obligatorio y común a Claude, Codex, Antigravity y el
fundador. `.agents/AGENTS.md` se conserva como referencia técnica heredada y se
consulta por sección/ruta; no se carga completo en cada sesión. El baseline
técnico y la comparación con el Plan Maestro están en
`Documentacion PROTOTIPE/00_Continuidad/BASELINE_ANTES_DE_CLAUDE_2026-07-14.md`.

## Workspace autorizado

Usa estas unidades recuperadas:

- coordinador oficial: `D:\PROTOTIPE`
- dashboard independiente de validación: `D:\PROTOTIPE_WORKSPACE\dev-dashboard`
- plantilla ventas independiente: `D:\PROTOTIPE_WORKSPACE\App Ventas_limpio`
- cliente Moni independiente: `D:\PROTOTIPE_WORKSPACE\ventas-moni-app`

La copia anterior a la recuperación está preservada en
`D:\PROTOTIPE_PRESERVADO_ANTES_DE_RECUPERACION_2026-07-14`; no la uses como
workspace ni apliques sus cambios automáticamente. No uses la clonación incompleta
en `D:\PROTOTIPE_RECUPERACION_INCOMPLETA_2026-07-14`.
`D:\RESPALDO_PROTOTIPE\Continuidad` es un archivo histórico fuera de Git, ya
superado como fuente de arranque (ver nota de vigencia en
`00_REANUDAR_PROTOTIPE_CONTINUIDAD_2026-07-13.md`). Consúltalo solo cuando la
tarea lo exija, en modo lectura. Está permitido traer contenido puntual y
curado hacia `Documentacion PROTOTIPE` cuando aporte algo que el repo no tenga
todavía (así se hizo en `CORE-346`) — verificando primero por búsqueda que no
duplica algo ya canónico y dejando constancia de la procedencia. No está
permitido sincronizarlo de forma masiva o automática, ni escribir nada dentro
de `D:\RESPALDO_PROTOTIPE` en ningún caso.

## Estado verificado al 14 de julio de 2026

- `ENV-010` y `ENV-011` están técnicamente verificados.
- Node.js `22.23.0`, npm `10.9.8`, Git `2.53.0.windows.3`.
- Comprueba el runtime con `node verify-runtime.mjs`.
- Claude Code nativo `2.1.210` está instalado, con autoactualizaciones en canal
  `latest`; `claude doctor` no informó fallos. La autenticación con una suscripción
  Claude Pro fue verificada el 14 de julio de 2026 sin registrar credenciales.
- El baseline inicial aprobó 198 pruebas. Después del hardening de RBAC se
  aprobaron cinco ejecuciones de 65 pruebas cada una (325 ejecuciones).
- El build integral pasa desde `D:\PROTOTIPE` en modo normal de solo lectura: 20
  skills `noop` (18 heredadas y 2 pilotos), cero conflictos, guards RBAC aprobados y trazabilidad
  completa. `CLAUDE-003` quedó `VERIFIED_COMPLETE` después de dos handoffs
  independientes. `route-capabilities` y `find-skills-governed` conservan estado
  `INTERNAL_PILOT`; ese estado no autoriza instalaciones externas.
- REC-002 continúa sin aplicarse. Producción continúa en `NO-GO`.

## Runtime y dependencias

Respeta `.nvmrc`, `.node-version`, `.npmrc`, `packageManager` y `engines`. Usa la
versión estable más reciente que sea compatible con Node, el framework y las demás
dependencias. Fija cambios en el lockfile y exige instalación limpia, build, lint y
pruebas. No fuerces saltos mayores ni ocultes incompatibilidades; regístralos como
migraciones separadas.

## Límites obligatorios

- No leas, muestres, solicites ni guardes valores de secretos.
- No abras archivos `.env` reales; usa únicamente `.env.example`.
- No hagas commit, push, deploy, restore, reset, clean, descarte ni reescritura de
  historial sin autorización explícita del fundador.
- No uses `git add .`.
- No apliques patches, stashes ni cambios de la copia preservada sin tarea y
  revisión específicas.
- Antes de editar, registra la tarea como exige `.agents/AI_WORKFLOW.md`; al cerrar, actualiza
  roadmap, bitácora y mapas aplicables.
- Trata los cambios actuales como trabajo en curso: inspecciónalos, no los borres.
- Asume que Codex, Antigravity, el fundador u otra sesión pueden modificar el
  proyecto. Una sola IA escribe por worktree físico; para trabajo paralelo usa
  worktrees separados y registra el handoff.
- No instales, actualices ni elimines skills, agentes, plugins o MCP de forma
  automática. `Find Skills` solo descubre candidatos.

## Inicio de cada sesión

1. Ejecuta `git status --short --branch` en el repositorio que vas a trabajar.
2. Lee este archivo, el baseline y la tarea activa; abre documentación adicional
   solo cuando sea pertinente.
3. Explica al fundador en lenguaje sencillo el objetivo, el beneficio, la evidencia
   requerida, el criterio de cierre y el siguiente paso.
4. Trabaja en un solo objetivo verificable y detente antes de cualquier operación
   externa o irreversible.

## Estado del piloto y siguiente trabajo recomendado

El piloto de comprensión en solo lectura fue ejecutado el 14 de julio de 2026 y
`CORE-342` y `CLAUDE-003` quedaron documentados como `VERIFIED_COMPLETE` local,
sin commit, push ni deploy. La fundación multiagente aprobó golden queries y dos
handoffs independientes después de corregir atribuciones de procedencia. No hay
otra tarea activa seleccionada: consulta el roadmap antes de editar. No repitas
`REP-013` ni el hardening RBAC ya verificado.

## Capacidades

- Registro: `.agents/capabilities/registry.json`.
- Enrutamiento: usa `route-capabilities` solo para tareas ambiguas, transversales,
  sensibles o con varias alternativas.
- Descubrimiento: usa `find-skills-governed` únicamente si el registro no cubre la
  necesidad y el fundador autoriza red. Buscar no autoriza instalar.
- Las 18 skills heredadas permanecen en `.agents/skills`; lee solo la seleccionada.

## Terminal y aplicación de escritorio

- Terminal: abre este coordinador y comienza con `claude --permission-mode plan`
  para el preflight. Cambia a un modo de edición solo cuando el fundador autorice
  la implementación y el alcance esté registrado. La autenticación ya fue
  verificada; no solicitar claves API ni cambiar a Console/PAYG.
- Escritorio: abre una sesión de Claude Code seleccionando esta misma carpeta y
  confirma la ruta cuando la aplicación la muestre. Terminal y escritorio deben
  compartir este `CLAUDE.md`; no mantengas instrucciones divergentes.
