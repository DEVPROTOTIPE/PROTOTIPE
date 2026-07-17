# Propuesta de Arquitectura Git para PROTOTIPE

**Estado:** `PROPUESTA FINAL (v4)` — Fases A, C (decisión) y E ejecutadas
(`CORE-371`, `CORE-373`, `CORE-375`); Fase C pendiente solo del primer
commit/push de puesta al día en los 3 repos re-inicializados. Fases B y D
siguen pendientes de ejecución (no son de git, son del motor de
sincronización por copia — R-023 y el reconciliador de 4 fuentes).
**Fecha:** 2026-07-16 (revisado el mismo día tras pedido explícito del
fundador de la "mejor estrategia posible", sin atarse a la primera idea).
**Autor:** Claude Code, a petición explícita del fundador ("necesito que
analices el panorama completo y que me des una propuesta de la mejor
estrategia... algo serio", y después: "dime si consideras que no usar esas
ramas... es lo correcto... crea una estrategia perfecta").
**Regla seguida:** esta tarea es de análisis y propuesta únicamente — por
instrucción explícita del fundador, no se modificó ningún repositorio,
rama, ni configuración real durante esta investigación.

**Cambio respecto a la v1 de este documento:** la primera versión
recomendaba pilotar el modelo de rama-por-cliente (lo que el fundador
propuso inicialmente). Tras profundizar más — específicamente, releer con
detenimiento lo que la Fase 3 del roadmap técnico canónico ya planeaba
construir antes de esta conversación — la recomendación final **cambia**:
las ramas de git no deberían ser el mecanismo principal de reconciliación.
La sección 3 explica por qué, con la misma honestidad que pidió el
fundador.

---

## 1. Resumen ejecutivo

El problema real **no es "monorepo vs. polyrepo"** en abstracto — es que
el modelo de "copia de respaldo separada por componente" que el fundador
ya había planteado antes **se abandonó en silencio** en cuanto se creó el
monorepo consolidado, y el sistema actual de sincronización de clientes
(copiado por comparación de hash) no distingue una personalización
intencional de un cliente de un simple atraso de sincronización.

**Recomendación:** revivir y formalizar el modelo que el fundador ya tenía
pensado — un repositorio de Core con una rama por cliente derivado — pero
esta vez automatizado (nunca dependiendo de que alguien se acuerde de
sincronizar a mano), empezando con un piloto de bajo riesgo en Moni antes
de decidir una migración completa de las herramientas del CLI/Dashboard.

---

## 2. Evidencia recopilada (hechos verificados, no inferencias)

### 2.1 Inventario real de repositorios en GitHub (`DEVPROTOTIPE`)

| Repositorio | Visibilidad | Creado | Último commit | Estado |
|---|---|---|---|---|
| `PROTOTIPE` (monorepo activo) | público | 14 jul 2026 | Hoy (activo) | Fuente única de todo el trabajo reciente. Descripción propia del repo: *"Repositorio de respaldo maestro y snapshot histórico del universo PROTOTIPE... todo el ecosistema"* |
| `prototipe-dev-dashboard` | público | 13 jul 2026 | 13 jul 2026, 19:03:11Z | **Congelado hace 3 días** |
| `prototipe-core-ventas` (rama `main`) | privado | 13 jul 2026 | 13 jul 2026, 19:02:54Z | **Congelado hace 3 días** |
| `prototipe-core-ventas` (rama `develop`) | — | — | 13 jul 2026 | **Congelado hace 3 días** |
| `prototipe-core-ventas` (rama `cliente/ventas-moni-app`) | — | — | 13 jul 2026, 19:02:44Z | **Congelado hace 3 días** |

**El hallazgo central:** los 3 repos separados quedaron congelados **un día
antes** de que se creara el repositorio `PROTOTIPE` consolidado. Ese
repositorio de Moni por rama (`cliente/ventas-moni-app`) coincide
exactamente con el modelo que el fundador describió: *"la arquitectura git
que teníamos planteada antes era para poder tener copia de todo por
separado"*. Es decir: el modelo SÍ se implementó una vez, pero se dejó de
alimentar el mismo día que se consolidó todo en el monorepo — y desde
entonces no ha recibido ni uno solo de los cambios hechos en los últimos 3
días, incluidos los arreglos de seguridad críticos de hoy (2026-07-16).

**Consecuencia práctica:** si hoy hiciera falta restaurar desde ese
respaldo separado, se obtendría una versión de Moni sin ningún fix de los
últimos 3 días — el respaldo, tal como está, no cumple su propósito.

### 2.2 Código huérfano relacionado (`Prototipe-CLI/server.js`)

Existe un mecanismo (visto durante la auditoría de CI de hoy, CORE-368)
que implementa *parcialmente* este mismo modelo de rama-por-cliente: hace
`git checkout` de la rama del cliente, `git merge` desde una rama de
origen, y `git push origin <clientBranch>`. Este código asume que el
remoto de push es el repositorio del Core con ramas de cliente — pero tal
como está configurado hoy el monorepo local (remoto único:
`DEVPROTOTIPE/PROTOTIPE`), ese `push` iría al lugar equivocado si se
ejecutara. Es código construido para el modelo viejo, desconectado de la
configuración actual.

### 2.3 Hallazgos de la auditoría de Fase 3 (CORE-370, mismo día)

- **`R-023`** (apply no atómico): si el sincronizador actual (copiado por
  hash) se interrumpe a mitad de copia, no hay rollback automático — el
  cliente queda en un estado mezclado.
- **`R-024`** (sin manifiesto de overrides): no existe ningún mecanismo
  que distinga "esto es una personalización intencional del cliente" de
  "esto simplemente no se ha sincronizado" — solo una lista estática de
  archivos excluidos (`isPathExcludedFromSync`). Cualquier personalización
  fuera de esa lista se trata como desviación y se sobreescribiría en el
  siguiente sync.
- Ambos hallazgos son precisamente los problemas que un modelo de
  ramas + `git merge` resuelve por diseño: git ya sabe distinguir "el Core
  cambió una línea que el cliente no tocó" (se aplica sola) de "el cliente
  sí cambió esa línea" (marca conflicto real, no borra en silencio), y un
  merge fallido a mitad de camino dejaría el repositorio en un estado de
  conflicto claramente señalado por git — no en un híbrido silencioso de
  archivos a medio copiar.

### 2.4 Restricción real que encarece la migración completa

También confirmado hoy (CORE-370, punto 3.1): el CLI (`Prototipe-CLI/config.js`,
`GIT_ROOT_CFG`) y el Dashboard (`verify_library_integrity.cjs`) tienen
supuestos de rutas relativas fijas asumiendo que todo el ecosistema vive
bajo una sola carpeta física (`D:\PROTOTIPE`). El CLI incluso normaliza
activamente rutas absolutas quemadas en `plantillas_registro.json` para
que coincidan con la unidad de disco actual. Migrar a que las ramas de
cliente sean la fuente real (en vez de carpetas físicas) exigiría
reescribir esta capa de resolución de rutas — no es un ajuste menor.

---

## 3. Respuesta directa: ¿ramas de git, o retirar ese sistema?

El fundador preguntó explícitamente si dejar de usar ese modelo de ramas
es lo correcto. Respuesta honesta: **sí, no debería ser el mecanismo
principal de reconciliación** — aunque sí tiene un papel secundario útil
(sección 3.2). La razón no es que el modelo de ramas esté "mal" en
abstracto — es que **la Fase 3 del roadmap técnico canónico de PROTOTIPE
ya define, desde antes de esta conversación, un mecanismo distinto y más
adecuado para este problema exacto**, y construir ambos a la vez sería
mantener dos sistemas de reconciliación compitiendo entre sí.

### 3.1 Lo que la Fase 3 ya planeaba (releído con cuidado)

El roadmap técnico canónico (`00_Continuidad/canonical/roadmap_tecnico_por_fases_y_gates_2026-07-14.md`
§6, "Fase 3 — Producto canónico") ya define como trabajo pendiente: un
**schema de feature** formal, un **reconciliador** entre el Knowledge, el
registro, el filesystem físico, el manifest y el lockfile de cada cliente,
un **Generator puro** (mismo input → mismo resultado siempre), aplicación
en **staging/atómica**, y un **manifest de overrides** que registre qué
personalizaciones tiene cada cliente. La auditoría de hoy (CORE-370)
confirmó que varias piezas de esto **ya existen parcialmente**:
`Prototipe-CLI/knowledge/feature-registry.json` (schema de feature real),
`core-manifest.generated.json` y `prototipe.lock.json` con hashes
`coreHash`/`appliedHash` por archivo (el embrión del reconciliador).

Es decir: **el camino ya elegido para este problema, antes de que el
fundador preguntara por git, es un generador + manifest de overrides
explícito — no fusión de ramas de git.**

### 3.2 Por qué el manifest de overrides es objetivamente mejor que `git merge` para este caso concreto

- **`git merge` requiere que alguien (persona o IA) resuelva cada
  conflicto real, cada vez que se propaga un cambio.** Un manifest de
  overrides explícito (`"este archivo es una personalización intencional
  del cliente, no lo toques"` declarado una vez) permite que el Generator
  decida automáticamente sin necesitar intervención humana en el caso más
  común: archivo sin override → se actualiza solo; archivo con override
  declarado → se salta automáticamente, sin conflicto que resolver. Menos
  trabajo manual recurrente que un modelo de ramas, no más.
- **Ya hay un lockfile con hashes por archivo (`prototipe.lock.json`)** —
  es decir, ya existe la infraestructura de datos para saber qué cambió;
  falta la capa que decida semánticamente qué hacer con eso (el
  reconciliador), no una capa de control de versiones nueva.
- **Construir ambos sistemas a la vez (ramas de git Y manifest/generador)
  sería redundante y confuso**: dos fuentes de verdad compitiendo sobre
  "qué es una personalización del cliente" — una en el historial de git,
  otra en el manifest — es exactamente el tipo de ambigüedad que la Fase 3
  busca eliminar, no crear una nueva.

### 3.3 El papel correcto de git en esta arquitectura (no descartarlo del todo)

Git sigue siendo valioso, pero como **capa de despliegue e historial, no
como motor de decisión**:
- Cada cliente puede seguir teniendo una rama (o repo) propia — pero como
  el lugar donde el Generator **deposita su resultado ya reconciliado**
  (para tener historial real y un respaldo verdadero), no como el
  mecanismo que decide qué cambios aplicar.
- Esto sí resuelve el objetivo real del fundador (tener copias de respaldo
  separadas, con historial) — solo que la lógica de "qué actualizar y qué
  no" vive en el manifest/Generator, no en la resolución manual de
  conflictos de merge.

---

## 4. Análisis honesto del modelo propuesto originalmente por el fundador

**Modelo:** un repositorio por Core de producto (hoy solo existe uno real,
Ventas). Dentro de ese repositorio: rama `develop` y `main` del Core, y una
rama por cliente derivado de ese Core (ej. `cliente/ventas-moni-app`).
Para propagar una mejora del Core a todos los clientes: se hace merge de
`main`/`develop` hacia cada rama de cliente.

### Ventajas reales (no genéricas)

1. **`git merge` resuelve el problema central encontrado hoy (`R-024`)**
   por diseño: distingue cambios del Core que no chocan con nada (se
   aplican solos) de cambios que sí chocan con una personalización del
   cliente (conflicto explícito, nunca una sobreescritura silenciosa).
2. **Historial real por cliente.** Hoy no existe ninguna forma de ver,
   para un cliente dado, qué vino del Core y qué es una decisión propia de
   ese cliente — solo un lockfile con hashes del estado actual, sin
   historia. Con ramas, `git log`/`git blame` lo responden directamente.
3. **Rollback nativo.** `git revert`/`git reset` sobre la rama del cliente
   son primitivas de git probadas, en vez del mecanismo actual
   (`.temp_backup_sync` + restauración manual) que hoy mismo se confirmó
   con una brecha real (`R-023`).

### Costos y riesgos reales (para que no sea sorpresa después)

1. **Los conflictos de merge no son gratis.** Si el Core y un cliente
   cambian la misma línea, alguien (persona o IA) tiene que resolver el
   conflicto cada vez que se propaga un cambio — es mejor que perder la
   personalización en silencio, pero sigue siendo trabajo real, no
   automático al 100%.
2. **El costo más grande: reescribir el CLI y el Dashboard.** Hoy asumen
   "cliente = carpeta física en el monorepo". Migrar a "cliente = rama de
   git" exige que el aprovisionamiento, el build, el dev-server y el
   deploy hagan `git checkout` de la rama correspondiente antes de operar,
   en vez de simplemente leer una ruta de carpeta. Es una migración de
   arquitectura, no una configuración.
3. **El modelo solo funciona si de verdad se automatiza.** El repositorio
   `prototipe-core-ventas` ya demostró que, sin automatización, el modelo
   de "ramas/repos separados" se congela en silencio (pasó una vez, 3
   días). Si se revive sin un mecanismo que fuerce la sincronización
   periódica, va a repetirse el mismo problema.

### Aclaración de alcance importante

Las **23 verticales de negocio** documentadas (`niches.json`:
`retail_clothing`, `technical_services`, etc.) son **variaciones de
configuración** (marca, textos, features activadas) de la **misma**
aplicación de Ventas — no son productos de Core distintos. Bajo este
modelo, las 23 seguirían viviendo en **un solo repositorio de Core**
(`core-ventas`, el que ya existe), con una rama por **cliente real** (Moni,
y los que vengan), no una rama por vertical. Un repositorio nuevo de
"Core" solo tendría sentido el día que se construya un producto
genuinamente distinto de Ventas — no una configuración distinta del mismo
producto.

---

## 4.5 Addendum `CORE-372` (2026-07-16, mismo día): lo que esta propuesta se saltó

El fundador señaló correctamente, tras leer la v2, que esta propuesta se
escribió **sin revisar primero el sistema de respaldo Git que ya existía**
en el disco (`menu_backup.ps1`, `git_backup.ps1`, `subproject_backup.ps1`,
y el panel "Control de Versiones" del Dashboard,
`GitBackupPanel.jsx`) ni `Documentacion PROTOTIPE/01_Control_Versiones/arquitectura_git.md`
(que ya documentaba, aunque desactualizado, ese mismo sistema). Se hizo esa
revisión completa y cambia dos cosas concretas de las fases 3.2/5 de abajo:

1. **La Fase C ("automatizar el respaldo real vía CI") no necesita
   construirse desde cero — ya existe, manual.** `subproject_backup.ps1`
   ya hace exactamente lo que la Fase C pedía: push del estado físico ya
   reconciliado de un cliente a una rama `cliente/<id>` dedicada, con
   detección automática del remoto del Core correspondiente. Tiene además
   una segunda interfaz ya construida: el panel "Control de Versiones" del
   Dashboard llama a este mismo script vía `POST /api/git/backup-stream`
   (`server.js`) y transmite su salida en vivo por SSE — no hay que
   construir ni la lógica de push ni la UI, ya están ahí. Lo único que
   falta para que sea "automático" de verdad (no dependa de que alguien
   recuerde hacer clic) es disparar ese mismo flujo al final de un sync
   exitoso, en vez de dejarlo 100% manual.
2. **Hallazgo que endurece la recomendación de la Fase E (limpieza):**
   además del código huérfano genérico de `execGitCommand` ya mencionado en
   §2.2, existe un endpoint específico y completo,
   `GET /api/git/sync-core-to-clients-stream` (construido en `CORE-166`,
   2026-07-02) que implementa el modelo de `git merge` Core→Cliente
   descrito en la sección 4 original de este documento — checkout de la
   rama cliente **dentro del propio repo del Core**, merge, push, y
   además build + `firebase deploy --only hosting` automático por
   cliente. Confirmado por búsqueda exhaustiva: **ningún componente del
   Dashboard lo invoca** — lleva completo y sin usar desde esa fecha.
3. **Hallazgo más importante de los tres:** se verificó (no se infirió)
   que **ningún subproyecto tiene hoy repositorio Git local** — ni activo
   (`.git`) ni disfrazado (`.git-backup-temp`) — en
   `Plantillas Core/App Ventas`, `Instancias Clientes/ventas/ventas-moni-app`
   ni `Central PROTOTIPE/dev-dashboard`. Solo la raíz `D:\PROTOTIPE` tiene
   `.git` activo. Esto significa que **tanto la suite de respaldo
   (`git_backup.ps1`/`subproject_backup.ps1`/el panel del Dashboard) como
   el endpoint huérfano de merge están hoy inoperables** — no por un bug
   en su lógica, sino porque no hay ningún repositorio físico sobre el que
   operar. La causa más probable es la recuperación de disco del
   2026-07-14 (`CLAUDE.md`), que no preservó estas carpetas `.git` ni su
   forma disfrazada.

**Esto no invalida la recomendación central de la sección 3** (el
manifest de overrides + Generator sigue siendo el mecanismo correcto de
*decisión* sobre qué propagar) — la refina: el rol de git como "capa de
respaldo con historial" que la sección 3.3 ya le asignaba **ya existe
construido**, dos veces (backup suite + endpoint huérfano), y la decisión
real pendiente no es "construir Fase C" sino **cuál de los dos
mecanismos de git conservar, y si vale la pena re-inicializar los
repositorios físicos de subproyecto para volver a usarlos**. Ver la
decisión cerrada en la sección 5.

---

## 5. Estrategia final recomendada — plan por fases

Esta es la versión definitiva (reemplaza la v1, que proponía pilotar
ramas primero). El orden ataca primero lo que ya está semi-construido y
de menor riesgo, dejando git como capa de respaldo, no como motor.

### Fase A — Formalizar el manifest de overrides (el hueco más barato de cerrar)
Definir el schema real de "override" (ej. un array
`"overrides": ["src/index.css", "src/features/credits/services/creditService.js"]`
dentro de `.prototipe.json` o `prototipe.lock.json` de cada cliente) y
hacer que el sincronizador actual (`server.js`, `sync_templates.js`) lo
respete: si un archivo está declarado como override, se salta
automáticamente en vez de sobreescribirlo ciegamente. Esto **cierra
`R-024` sin tocar el modelo de carpetas físicas actual ni requerir
ninguna migración de herramientas** — es el cambio de menor riesgo y
mayor impacto inmediato.

### Fase B — Hacer atómica la fase de copia (cierra `R-023`)
Antes de escribir cualquier archivo al cliente, copiar primero TODO el
conjunto de cambios a un área de staging temporal, validar que compile
ahí, y solo entonces mover/reemplazar de forma atómica — en vez de
escribir directo al destino final como hoy. Complementa (no reemplaza) el
backup `.temp_backup_sync` que ya existe.

### Fase C — Revivir la suite de respaldo existente como destino automático (no construir una nueva)
`CORE-372` confirmó que esto **ya existe, manual**: `subproject_backup.ps1`
+ el panel "Control de Versiones" del Dashboard. Ya hacen exactamente lo
que esta fase pedía — push del resultado reconciliado de un cliente a una
rama `cliente/<id>` dedicada, con historial real. Lo que falta, en orden:
1. **Decisión del fundador:** ¿re-inicializar los repositorios físicos por
   subproyecto (Core, Dashboard, cada instancia) que hoy no existen? Sin
   esto, ni la suite de respaldo ni el panel del Dashboard tienen nada
   sobre qué operar.
2. Si se re-inicializan: decidir si el disparo sigue siendo manual (clic
   en el panel / menú interactivo, como hoy) o si se agrega un disparo
   automático al final de un sync exitoso (`/api/instancias/sync-and-deploy-stream`
   podría invocar `subproject_backup.ps1` para esa instancia al terminar).
   Esto es lo único que realmente falta por construir — no la lógica de
   push, que ya existe y funciona.

### Fase D — Formalizar el schema de feature y el reconciliador completo
Documentar oficialmente el schema ya real de `feature-registry.json`, y
construir el reconciliador que compare activamente las 4 fuentes
(Knowledge, filesystem, `core-manifest.generated.json`, `prototipe.lock.json`)
y alerte ante discrepancias — hoy ese cruce se hace manualmente cuando se
audita (como se hizo en CORE-370), no de forma automática.

### Fase E — Limpieza (decisión cerrada tras `CORE-372`)
**Retirar `GET /api/git/sync-core-to-clients-stream`** (`server.js`,
`CORE-166`) y su código asociado. Motivo: es redundante con el mecanismo
que ya está en producción y probado (sync por copia de archivos +
manifest de overrides, `CORE-371`), no tiene ninguna interfaz que lo
dispare desde hace dos semanas, y su modelo (ramas `cliente/<id>` **dentro
del propio repo del Core**) es incompatible con el modelo que la suite de
respaldo ya usa (la rama la puebla la instancia física por su cuenta) —
mantener ambos sería exactamente la ambigüedad de "dos fuentes de verdad"
que la sección 3.2 ya advertía evitar. Esta retirada es una acción de
código real (borrar un endpoint) y requiere autorización explícita antes
de ejecutarse, igual que cualquier otra eliminación.

**Conservar** la suite de respaldo (`git_backup.ps1`/`subproject_backup.ps1`/
`GitBackupPanel.jsx`/`menu_backup.ps1`) — cumple el objetivo original del
fundador (copias separadas con historial real) y no compite con el
manifest de overrides porque no decide *qué* propagar, solo *deposita* el
resultado ya reconciliado. Depende de la decisión de la Fase C sobre
re-inicializar los repositorios físicos.

Además: decidir formalmente el ADR monorepo/polyrepo (documentado en
`CORE-370`) con esta arquitectura ya en mente — la respuesta probablemente
sea "monorepo se queda", ya que la Fase C le da al fundador el respaldo
separado que buscaba, sin pagar el costo de reescribir el CLI/Dashboard
para ser polyrepo de verdad.

---

## 6. Recomendación final

**No revivir el modelo de `git merge` como mecanismo de reconciliación.**
El manifest de overrides + Generator (Fase A, ya implementada en
`CORE-371`) sigue siendo el cerebro que decide qué propagar. Git conserva
un papel real, pero solo como destino de respaldo con historial —
y ese destino **ya existe construido** (la suite `git_backup.ps1`/
`subproject_backup.ps1`/`GitBackupPanel.jsx`), no hay que construir nada
nuevo para tenerlo.

**Estado de cierre por fase (actualizado 2026-07-16 tras `CORE-373`/`CORE-374`/`CORE-375`):**
- **Fase A:** `COMPLETADA` (`CORE-371`).
- **Fase B** (copia atómica, cierra `R-023`): pendiente de ejecución. No
  es parte de la arquitectura Git — es del motor de sincronización por
  copia de archivos.
- **Fase C:** `COMPLETADA` en lo que dependía de una decisión de diseño y
  del fundador. El fundador autorizó re-inicializar los 3 repositorios
  físicos de subproyecto (`CORE-373`) — Dashboard y Core en `develop`,
  instancia Moni en `cliente/ventas-moni-app`, todos sincronizados con su
  historial remoto sin tocar ningún archivo físico. Además, se cerró la
  simetría entre las dos rutas de creación de Core (`CORE-374`): el flujo
  de "convertir app en Core" ahora también crea su repositorio de GitHub
  automáticamente (`gh repo create prototipe-core-<key> --private
  --source=. --push` + rama `develop`), igual que ya hacía el flujo de
  Core desde semilla. **Única pieza pendiente:** ningún commit ni push se
  ha hecho todavía sobre los 3 repos re-inicializados — siguen reflejando
  el estado remoto de hace 3 días hasta que se autorice y ejecute la
  puesta al día.
- **Fase D** (reconciliador de 4 fuentes): pendiente de ejecución.
- **Fase E:** `COMPLETADA` (`CORE-375`) — `sync-core-to-clients-stream`
  eliminado de `server.js` (verificado: arranque limpio, health check
  200, cero referencias residuales). Se conserva la suite de respaldo.
  Adicionalmente, se robusteció `subproject_backup.ps1` para resolver el
  Core de una instancia vía `plantillas_registro.json` (igual que
  `generator.js`) en vez de adivinar por nombre de carpeta — cierra el
  riesgo de que un Core futuro rompa la detección automática en silencio.
  El ADR formal monorepo/polyrepo (`CORE-370`) sigue sin decisión
  explícita, aunque esta arquitectura ya deja clara la respuesta
  implícita: monorepo se queda.

## 7. Qué NO se hizo (cumpliendo la instrucción explícita del fundador)

Ningún repositorio, rama, remoto ni configuración real fue modificado
durante esta investigación — todo lo de este documento es lectura y
análisis vía la API de GitHub (`gh api`, de solo lectura) y del código
local ya existente. Este documento es una propuesta a decidir, no un
cambio ya aplicado.
