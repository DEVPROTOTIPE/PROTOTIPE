# Asignación de tarea — CORE-370

Este archivo es autocontenido: se pega o adjunta completo en un chat nuevo de
Antigravity apuntando a `D:\PROTOTIPE`.

## 0. Quién eres y bajo qué reglas operas

Trabajas bajo el contrato multiagente `.agents/AI_WORKFLOW.md` — **léelo
completo antes de escribir nada**. `CLAUDE.md` y `AI_WORKFLOW.md` §1-6
siguen aplicando íntegros.

Antes de escribir:
1. `git status --short --branch` en `D:\PROTOTIPE`.
2. Trata cualquier cambio que no sea tuyo como ajeno.
3. Esta tarea es de **mapeo/diagnóstico**, no de implementación. No
   construyas el reconciliador, no reescribas el Generator, no tomes la
   decisión monorepo/polyrepo — eso requiere una decisión del fundador y
   síntesis posterior de Claude Code. Tu entregable es un **mapa fiable del
   estado real actual**, con evidencia de comando, no una propuesta de
   solución todavía.
4. **Objetivo explícito del fundador para esta tarea:** que el traspaso sea
   tan preciso y completo que Claude Code pueda confiar en él con una
   reverificación barata (unos pocos comandos dirigidos), no que tenga que
   rehacer el descubrimiento desde cero. Eso significa: evidencia literal
   de comando para CADA afirmación, no resúmenes en prosa sin respaldo, y
   una sección final de "Reverificación rápida" (ver plantilla en
   `AI_WORKFLOW.md` §7.1 y §7.2) con comandos exactos y su resultado
   esperado exacto.

## 1. Identificación

- ID: `CORE-370`
- Título: Auditoría de Fase 3 — Producto canónico (roadmap técnico
  canónico, `Documentacion PROTOTIPE/00_Continuidad/canonical/roadmap_tecnico_por_fases_y_gates_2026-07-14.md`
  §6)
- Asignada por: Claude Code (terminal), 2026-07-16, por instrucción
  explícita del fundador

## 2. Objetivo y beneficio

La Fase 3 busca que una sola cadena de conceptos explique qué es una
*feature*, una *plantilla* y una *instancia de cliente* en PROTOTIPE. Hoy
existe ambigüedad real entre lo que dice el registro de features, lo que
hay físicamente en disco, y lo que cada cliente (Moni, futuras instancias)
realmente tiene instalado. Antes de diseñar o construir nada de la Fase 3,
necesitamos un mapa preciso de dónde está cada uno de los 8 puntos hoy.

## 3. Alcance autorizado — los 8 puntos de Fase 3

Para cada punto: identifica los archivos/mecanismos reales involucrados
(rutas exactas), ejecuta los comandos que hagan falta para verificar el
estado, y clasifica como `EXISTE Y FUNCIONA` / `EXISTE PARCIAL` /
`NO EXISTE` / `NO VERIFICABLE` (con motivo). No inventes que algo existe
si solo lo dedujiste del nombre de un archivo — ábrelo y confírmalo.

### 3.1 ADR monorepo/polyrepo — insumo para la decisión, no la decisión
- Cuenta cuántos `.git` independientes existen realmente dentro del árbol
  de trabajo (usa el mismo patrón `findSubRepos` de
  `Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs`
  sección 7, o equivalente).
- Para cada uno: ¿tiene su propio remoto en GitHub? ¿su propio historial
  de commits independiente, o comparte líneas de tiempo con el repo raíz?
- Reporta cuántas plantillas/instancias dependen de rutas relativas que
  cruzan estos límites de repo (ej. imports o scripts que asumen que todo
  vive bajo `D:\PROTOTIPE`) — eso es lo que hace costoso pasar a polyrepo.
- Esto es solo insumo — no recomiendes monorepo o polyrepo, eso lo decide
  el fundador con Claude Code después de ver tu mapa.

### 3.2 Una plantilla de ventas única
- Compara línea por línea (usa `diff` real, no solo nombres de archivo)
  `Plantillas Core/App Ventas/`, `Prototipe-CLI/templates/template-ventas/`
  y `Prototipe-CLI/templates/template-core-seed/`.
- Reporta: ¿cuántos archivos difieren entre Core y template-ventas
  ahora mismo? ¿Cuáles son diferencias intencionales (branding, config) y
  cuáles son drift real (Core avanzó y el template no, o viceversa)?
- Repite la comparación contra `Instancias Clientes/ventas/ventas-moni-app/`
  — ¿qué tan desincronizada está Moni respecto a Core hoy?

### 3.3 Schema de feature
- Localiza el/los archivo(s) que hoy definen qué es una "feature" en el
  ecosistema (candidatos a verificar, no asumir: `Prototipe-CLI/knowledge/feature-registry.json`,
  `core-manifest.generated.json`, `featureManifestAdapter.js`,
  `prototipe.lock.json` de una instancia real).
- Reporta la forma real de esos datos (qué campos tiene una feature hoy,
  con un ejemplo real pegado, no inventado) y si esa forma está documentada
  en algún lado o solo vive implícita en el código.

### 3.4 Reconciliador Knowledge/registry/físico/manifest/lock
- Para al menos 2 features reales instaladas en Moni (`ventas-moni-app`):
  compara si coinciden entre sí: (a) lo que dice el Knowledge/registro del
  CLI, (b) lo que existe físicamente en `src/features/` de Moni, (c) lo que
  dice `core-manifest.generated.json` de Moni, (d) lo que dice
  `prototipe.lock.json` de Moni.
- Reporta cualquier discrepancia real encontrada (con las 4 fuentes citadas
  lado a lado) — esto es exactamente lo que un reconciliador futuro
  tendría que detectar. Si no encuentras ninguna discrepancia, dilo
  explícitamente (no asumas que "no encontré nada" significa "no busqué
  bien" — muestra qué comparaste).

### 3.5 Plan Generator puro (sin efectos secundarios ocultos)
- Localiza el código que genera/aplica una plantilla a un cliente
  (candidato: `Prototipe-CLI/sync_templates.js`, `sync_clients.js`, o el
  motor detrás de `/api/instancias/sync-and-deploy-stream` en `server.js`,
  ya visto hoy en CORE-368/369).
- Reporta: ¿el mismo input (misma plantilla, mismo cliente, sin cambios de
  por medio) genera siempre el mismo resultado? Busca específicamente:
  timestamps embebidos en el output, orden de iteración de archivos no
  determinista, llamadas de red o de IA dentro del propio proceso de
  generación (no de build), o escritura directa a Firestore/disco del
  cliente ANTES de que termine de "planear" el cambio completo.

### 3.6 Apply staging/atomic
- ¿El proceso de sincronización actual (mismo código de 3.5) escribe
  directo al destino final, o prepara todo en un área temporal primero y
  solo al final mueve/confirma? (Pista: ya viste hoy en CORE-368 que
  `sync-and-deploy-stream` sí hace un backup temporal — `.temp_backup_sync`
  — antes de sobreescribir; confirma si eso cuenta como "atómico" de
  verdad o solo como respaldo de reversión manual).
- Si el proceso se interrumpe a la mitad (simula matando el proceso o
  revisando qué pasaría con un error a mitad de copia), ¿el cliente queda
  en un estado consistente o a medias?

### 3.7 Manifest de overrides (personalizaciones del cliente)
- ¿Existe hoy algún mecanismo que registre qué archivos/configuraciones de
  un cliente son personalizaciones suyas (no deben sobreescribirse en un
  sync) vs. cuáles son copia fiel del Core? Revisa
  `prototipe.lock.json` de Moni y el mecanismo de "drift" ya visto en
  `CoreSyncPanel.jsx`/`server.js` (`getSyncFilesRecursiveAsync`,
  `getSyncFileHashAsync`).
- Reporta si ese mecanismo de detección de drift por hash es suficiente
  para distinguir "personalización intencional que no se debe perder" de
  "el cliente simplemente no se ha sincronizado" — hoy no lo distingue,
  confírmalo con evidencia (lee el código, no asumas).

### 3.8 Upgrade y rollback de Moni
- ¿Se ha hecho alguna vez un upgrade real de Moni de una versión de Core a
  otra, documentado con evidencia (bitácora, traspaso)? Busca en
  `Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/` y en
  `git log` de `Instancias Clientes/ventas/ventas-moni-app/`.
- ¿Existe algún mecanismo de rollback real (no solo `git revert` manual)?
  Si no existe, dilo explícitamente como `NO EXISTE` — no lo inventes ni lo
  propongas todavía, esta tarea es de mapeo.

## 4. Método

1. Ejecuta cada subsección de la sección 3 en orden, con comando real y
   salida literal pegada.
2. Clasifica cada punto: `EXISTE Y FUNCIONA` / `EXISTE PARCIAL` /
   `NO EXISTE` / `NO VERIFICABLE`.
3. Si algo requiere una decisión de arquitectura que no puedes tomar,
   etiqueta `DECISIÓN REQUERIDA` con las opciones concretas que ves, sin
   elegir por tu cuenta.
4. No implementes nada de la Fase 3 en esta tarea — ni el reconciliador, ni
   cambios al Generator, ni un manifest de overrides nuevo. Solo mapeo.

## 5. Exclusiones explícitas

- No toques lógica de negocio ni UI.
- No hagas commit/push.
- No instales dependencias nuevas de forma permanente.
- No tomes la decisión monorepo/polyrepo ni ninguna decisión de diseño del
  reconciliador — repórtalas como `DECISIÓN REQUERIDA`.
- No toques `template-ventas`/`ventas-moni-app` más allá de leerlos y
  compararlos — el fundador sincroniza esas copias él mismo.

## 6. Criterios de cierre verificables

Los 8 puntos de la sección 3 quedan clasificados con evidencia de comando
real (no inferencia), cada discrepancia encontrada está citada con las
fuentes exactas comparadas, y cualquier punto que requiera decisión del
fundador queda etiquetado `DECISIÓN REQUERIDA` con opciones concretas.

## 7. Etiquetado de evidencia (`AI_WORKFLOW.md` §7.1)

`HECHO VERIFICADO` / `RESULTADO INFORMADO NO REAUDITADO` / `INFERENCIA` /
`RIESGO` / `PROPUESTA` / `BLOQUEO` / `DECISIÓN REQUERIDA`.

## 8. Artefacto de salida obligatorio

`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-370_2026-07-16.md`
con la plantilla de `AI_WORKFLOW.md` §7.1 + sección "Reverificación rápida"
de §7.2 — esta sección es la parte más importante del entregable para
esta tarea en particular: debe traer comandos exactos y copiables, cada
uno con su resultado esperado exacto, para que Claude Code pueda confiar
en el traspaso con un puñado de verificaciones dirigidas en vez de repetir
todo el descubrimiento. Estructura el cuerpo con un encabezado `##` por
cada uno de los 8 puntos de la sección 3. No marques
`tareas_pendientes.md`/`bitacora_cambios.md` como `VERIFIED_COMPLETE` —
deja `AWAITING_REVIEW`; Claude Code reverificará antes de cerrar `CORE-370`
y decidir con el fundador el plan de implementación real de la Fase 3.

## 9. Si algo no está claro

Etiqueta `DECISIÓN REQUERIDA`, no inventes, detente ahí.
