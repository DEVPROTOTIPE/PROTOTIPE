# Asignación de tarea — CORE-367

Este archivo es autocontenido: se pega o adjunta completo en un chat nuevo de
Antigravity apuntando a `D:\PROTOTIPE`.

## 0. Quién eres y bajo qué reglas operas

Trabajas bajo el contrato multiagente `.agents/AI_WORKFLOW.md` — **léelo
completo antes de escribir nada**. `CLAUDE.md` y `AI_WORKFLOW.md` §1-6
siguen aplicando íntegros.

Antes de escribir:
1. `git status --short --branch` en `D:\PROTOTIPE`.
2. Trata cualquier cambio que no sea tuyo como ajeno — hay trabajo en curso
   de Claude Code (CORE-366) y tuyo propio (CORE-365) en el mismo working
   tree. No lo toques, no lo reviertas.
3. Esta tarea es de **auditoría/diagnóstico**, no de arreglo masivo. Donde
   el fix sea trivial y de bajísimo riesgo (ej. regenerar un lockfile sin
   cambiar versiones de dependencias) puedes aplicarlo y decirlo. Donde el
   fix implique una decisión de arquitectura, proveedor de CI, o cambio de
   alcance grande, **no lo implementes** — repórtalo como `PROPUESTA` o
   `DECISIÓN REQUERIDA`.

## 1. Identificación

- ID: `CORE-367`
- Título: Auditoría de Fase 2 — Reproducibilidad (roadmap técnico canónico)
- Asignada por: Claude Code (terminal), 2026-07-16, por instrucción
  explícita del fundador ("pídele tareas a Antigravity para reducir tu
  trabajo lo mayor posible")

## 2. Objetivo y beneficio

El documento canónico
`Documentacion PROTOTIPE/00_Continuidad/canonical/roadmap_tecnico_por_fases_y_gates_2026-07-14.md`
define una **Fase 2 — Reproducibilidad** (objetivo: "cada repo se construye
igual en máquina limpia y CI") con 8 puntos de trabajo y un Gate 2 binario.
El documento mismo advierte que sus fechas están desactualizadas y que
`CORE-341` a `CORE-347` ya adelantaron parte de esta fase — pero **nadie ha
verificado línea por línea, con evidencia de comando, cuáles de los 8 puntos
ya están resueltos, cuáles parcialmente, y cuáles ni siquiera empezaron**.
El fundador quiere ese diagnóstico antes de decidir qué atacar después, y
pidió explícitamente delegarlo a ti en vez de que Claude Code lo audite
manualmente.

## 3. Alcance autorizado — los 8 puntos de Fase 2

Para cada punto: ejecuta el/los comando(s) relevante(s), pega la salida
literal, y clasifica el estado como `RESUELTO` / `PARCIAL` / `PENDIENTE` /
`NO VERIFICABLE` (con motivo). No avances al siguiente punto sin cerrar el
anterior con evidencia real — no infieras desde el nombre de un archivo.

### 3.1 Reparar lockfile de Moni
- Repo: `Instancias Clientes/ventas/ventas-moni-app/` (y si existe copia en
  `D:\PROTOTIPE_WORKSPACE\ventas-moni-app`, verifica ambas por separado —
  **no asumas que son idénticas**, compáralas).
- Comando: `npm ci` en un directorio limpio (o `rm -rf node_modules && npm ci`
  si tienes autorización para reinstalar — si no la tienes, dilo y usa
  `npm ls` para detectar inconsistencias sin reinstalar).
- Reporta: ¿el lockfile es consistente con `package.json`? ¿`npm ci` corre
  sin warnings de conflicto de versiones?

### 3.2 Dashboard autónomo
- Repo: `Central PROTOTIPE/dev-dashboard/`.
- Ya existe un flag parcial: `scripts/verify_library_integrity.cjs` soporta
  `DASHBOARD_STANDALONE_BUILD=1` (o detecta automáticamente si
  `Documentacion PROTOTIPE` no existe) para saltar validaciones
  documentales. Verifica si esto es suficiente para que el dashboard
  **realmente** compile y corra sin ningún archivo fuera de su propia
  carpeta — prueba moviendo temporalmente `Documentacion PROTOTIPE` fuera
  del alcance (ej. con la variable de entorno, no borrando nada) y corre
  `npm run build`. Reporta si hay OTRAS dependencias implícitas a rutas
  fuera de `dev-dashboard/` que el flag no cubre (busca `path.resolve(...,
  '..', '..')` y rutas absolutas a `D:\PROTOTIPE` en el código del
  dashboard, no solo en el script de integridad).

### 3.3 Rutas portables
- Alcance: `Plantillas Core/App Ventas/src/`, `Central PROTOTIPE/dev-dashboard/src/`,
  `Prototipe-CLI/` (código, no docs — la documentación ya tiene su propio
  linter de rutas absolutas en `verify_library_integrity.cjs`).
- Busca rutas absolutas hardcodeadas tipo `D:\`, `D:/`, `C:\Users`,
  `/Users/`, `localhost:PUERTO` quemado fuera de variables de entorno.
- Reporta cada hallazgo con archivo:línea.

### 3.4 Runtime único
- Compara la versión de Node/npm declarada en: `.nvmrc`/`.node-version`
  raíz de `D:\PROTOTIPE`, y el campo `engines` (si existe) de cada
  `package.json` en: `Plantillas Core/App Ventas`, `Central PROTOTIPE/dev-dashboard`,
  `Central PROTOTIPE/dev-dashboard/functions`, `Prototipe-CLI`,
  `Instancias Clientes/ventas/ventas-moni-app`,
  `Prototipe-CLI/templates/template-ventas`.
- Reporta discrepancias exactas (versión declarada vs. la raíz).

### 3.5 CI de Core, Moni, Dashboard, Functions y CLI
- Busca `.github/workflows/*.yml` en la raíz de `D:\PROTOTIPE` y en cada
  subrepo con `.git` propio (usa el mismo patrón de detección de subrepos
  que ya usa `verify_library_integrity.cjs` — `findSubRepos`, sección 7 del
  script, para no perderte ninguno).
- Reporta: ¿existe CI para alguno de los 5? ¿Qué corre cada pipeline
  encontrado (lint/test/build) y qué le falta respecto al Gate 2
  (`npm ci → lint/validate → test → rules → build`)?

### 3.6 Línea base de lint
- Corre `npx eslint .` (o el comando de lint que declare cada
  `package.json`) en: App Ventas, Dashboard, CLI (si aplica), Moni.
- Reporta el conteo EXACTO de errores/warnings actual por proyecto — esto
  es la línea base real, no tiene que ser cero. El objetivo de este punto
  es solo que la línea base esté *documentada y sea reproducible*, no
  limpiarla toda (eso sería una tarea aparte, mucho más grande).

### 3.7 Cobertura de pruebas por riesgo
- Identifica qué áreas de alto riesgo (pagos/créditos, autenticación,
  reglas de seguridad Firestore, transacciones de inventario) tienen
  pruebas automatizadas hoy (`tests/unit/*.spec.js` en cada repo) y cuáles
  no. No pidas cobertura total — reporta específicamente los huecos en las
  áreas de mayor riesgo real (dinero, datos, seguridad).

### 3.8 Builds que no mutan la fuente
- Para cada repo relevante (App Ventas, Dashboard, CLI si aplica): corre
  `git status --short` antes de un build limpio, corre `npm run build`,
  corre `git status --short` después. Reporta si el build modificó algún
  archivo fuera de `dist/`/`.cache`/artefactos ya ignorados por
  `.gitignore` (eso sería un build que muta la fuente, prohibido por el
  Gate 2).

## 4. Método

1. Ejecuta cada subsección de la 3 en orden, con el comando real y su
   salida literal pegada (no resumida, no "funcionó bien").
2. Clasifica cada punto: `RESUELTO` / `PARCIAL` / `PENDIENTE` / `NO
   VERIFICABLE`.
3. Si un punto requiere una decisión que no puedes tomar (ej. "¿qué
   proveedor de CI usamos, GitHub Actions o algo self-hosted?"), etiqueta
   `DECISIÓN REQUERIDA` con las opciones concretas, no elijas por tu
   cuenta.
4. No implementes CI real todavía (crear workflows) sin que el fundador
   decida primero el proveedor y el alcance — esto es explícitamente fuera
   del alcance de esta tarea de auditoría.

## 5. Exclusiones explícitas

- No toques lógica de negocio ni UI.
- No hagas commit/push.
- No instales dependencias nuevas de forma permanente (si necesitas probar
  algo con una dependencia temporal, usa `npx` sin persistirla en
  `package.json`).
- No configures CI real (workflows de GitHub Actions u otro proveedor) —
  eso requiere una decisión previa del fundador sobre §4.3.
- No toques `template-ventas` fuera de la comparación de solo lectura del
  punto 3.4 — el fundador sincroniza esas copias él mismo.

## 6. Criterios de cierre verificables

Los 8 puntos de la sección 3 quedan clasificados con evidencia de comando
real (no inferencia), y cualquier punto que requiera decisión del fundador
queda etiquetado `DECISIÓN REQUERIDA` con opciones concretas, no resuelto
unilateralmente.

## 7. Etiquetado de evidencia (`AI_WORKFLOW.md` §7.1)

`HECHO VERIFICADO` / `RESULTADO INFORMADO NO REAUDITADO` / `INFERENCIA` /
`RIESGO` / `PROPUESTA` / `BLOQUEO` / `DECISIÓN REQUERIDA`.

## 8. Artefacto de salida obligatorio

`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-367_2026-07-16.md`
con la plantilla de `AI_WORKFLOW.md` §7.1 + sección "Reverificación rápida"
de §7.2. Estructura el cuerpo con un encabezado `##` por cada uno de los 8
puntos de la sección 3, cada uno con su clasificación y evidencia. No
marques `tareas_pendientes.md`/`bitacora_cambios.md` como
`VERIFIED_COMPLETE` — deja `AWAITING_REVIEW`; Claude Code reverificará con
comandos dirigidos antes de cerrar `CORE-367`.

## 9. Si algo no está claro

Etiqueta `DECISIÓN REQUERIDA`, no inventes, detente ahí.
