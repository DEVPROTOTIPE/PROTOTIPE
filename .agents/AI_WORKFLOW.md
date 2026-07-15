# PROTOTIPE — contrato operativo multiagente

**Estado:** `ACTIVE`  
**Versión:** `1.0`  
**Fecha:** 2026-07-14  
**Tarea de adopción:** `CLAUDE-003` (`VERIFIED_COMPLETE`)

Este archivo define la forma común de trabajo para el fundador, Codex, Claude Code
(terminal y Desktop Code), Antigravity y cualquier agente futuro. Ningún agente es
dueño exclusivo del repositorio ni puede asumir que conserva el estado de su
última sesión.

## 1. Autoridad y precedencia

1. Instrucciones explícitas vigentes del fundador para la tarea.
2. Restricciones de seguridad y permisos aplicadas por la herramienta.
3. Este contrato operativo multiagente.
4. Estado y tareas canónicas de continuidad.
5. Reglas específicas de la ruta realmente afectada.
6. Skills o agentes aprobados seleccionados para la tarea.
7. Documentación histórica, propuestas y reglas heredadas, solo como referencia.

Si dos fuentes vigentes se contradicen y la diferencia cambia arquitectura,
seguridad, costo, datos, alcance o estado, detenerse y exponer el conflicto. No
resolver por mayoría de documentos ni elegir la instrucción más conveniente.

`GEMINI.md`, `.agents/AGENTS.md` y manuales históricos contienen reglas útiles,
pero no pueden sustituir esta precedencia ni convertir una propuesta en hecho.

## 2. Modelo de colaboración

- Puede haber cambios del fundador, Codex, Claude, Antigravity u otra sesión.
- Una sola IA escritora puede actuar por worktree físico. Varias IA pueden revisar
  en paralelo, pero las escrituras paralelas requieren worktrees separados.
- Antes de editar, volver a obtener rama, `HEAD` y `git status --short --branch`.
- Tratar todo cambio preexistente como trabajo ajeno hasta demostrar lo contrario.
- No borrar, restaurar, sobrescribir, mover ni reformatear trabajo ajeno.
- Si el alcance se solapa con cambios existentes, inspeccionar el diff y detenerse
  si no es posible preservar ambas intenciones.
- Releer un archivo inmediatamente antes de escribirlo si otra sesión pudo tocarlo.
- Git conserva el cambio físico; la bitácora registra intención, ejecutor y evidencia.

## 3. Inicio obligatorio de cada tarea

Antes de modificar, informar en lenguaje sencillo:

1. ID y estado de la tarea activa.
2. Objetivo y beneficio.
3. Alcance, exclusiones y archivos autorizados.
4. Estado Git inicial y cambios preexistentes que intersectan el alcance.
5. Evidencia disponible y evidencia que falta.
6. Riesgo y permisos necesarios.
7. Criterio de cierre.
8. Siguiente paso exacto.

Si falta una decisión que cambie materialmente el resultado, continuar solo con
inspección segura y solicitarla antes de escribir.

## 4. Selección de capacidades

- Consultar `.agents/capabilities/registry.json` para conocer skills, agentes,
  herramientas y candidatos.
- Usar `route-capabilities` cuando la tarea sea transversal, sensible, ambigua o
  tenga tres o más capacidades plausibles.
- Elegir el conjunto mínimo: una capacidad principal y, si el riesgo lo exige, un
  revisor diferente. No cargar catálogos completos en el contexto.
- Una popularidad, puntuación o recomendación externa no equivale a aprobación.
- `find-skills-governed` solo puede buscar candidatos cuando el registro aprobado
  no cubra la necesidad. No instala, actualiza ni ejecuta skills externas.
- Toda capacidad externa pasa por origen, licencia, versión/commit, contenido,
  permisos, scripts, hooks, red, datos, redundancia y tareas doradas.
- Ninguna skill concede autorización para commit, push, deploy, borrado, secretos,
  restauración, facturación o cambios cloud.

## 5. Ejecución

- Hacer el cambio mínimo que satisfaga el criterio de cierre.
- No ampliar el alcance para “aprovechar” la sesión.
- No leer, mostrar, solicitar ni guardar valores de secretos.
- No abrir `.env` reales; usar contratos y `.env.example` saneados.
- No usar `git add .`.
- No hacer commit, push, deploy, restore, reset, clean, descarte ni reescritura de
  historial sin autorización explícita separada.
- No introducir dependencias por moda. Usar la versión estable compatible,
  revisada y fijada; actualizar mediante diff, pruebas y un plan de reversión que
  no se ejecuta sin la autorización correspondiente.
- Las recomendaciones de otra IA se clasifican como aceptadas, adaptadas o
  rechazadas después de contrastarlas con archivos locales.

## 6. Verificación y cierre

1. Releer los archivos modificados y revisar únicamente su diff.
2. Ejecutar la matriz proporcional: sintaxis, formato, lint, tipos, unitarias,
   integración, reglas, build, E2E o seguridad según el riesgo.
3. Distinguir `PASS`, `FAIL`, `BLOCKED` y `NOT_RUN`.
4. No declarar completado lo que no tenga evidencia suficiente.
5. Actualizar tarea, bitácora y mapas aplicables sin alterar estados ajenos.
6. Registrar ejecutor(es), base (`rama` y `HEAD`), alcance, archivos, pruebas,
   resultados, limitaciones y siguiente paso.
7. Volver a ejecutar `git status --short --branch` y confirmar que no aparecieron
   archivos inesperados fuera del alcance.

Para seguridad, arquitectura, datos, billing y releases, quien implementa no
aprueba en solitario: se requiere revisión independiente o aprobación humana.

## 7. Handoff entre agentes

Un relevo debe incluir:

- tarea y estado real;
- objetivo y decisiones vigentes;
- rama y `HEAD` observados;
- archivos modificados y cambios preexistentes preservados;
- pruebas ejecutadas con resultado literal;
- evidencia pendiente, riesgos y bloqueos;
- documentación actualizada;
- siguiente paso exacto y acciones que siguen sin autorización.

El agente receptor vuelve a verificar el estado local. Nunca confía únicamente en
el resumen del agente anterior.

### 7.1 Taxonomía de evidencia y plantilla de handoff

Addendum incorporado 2026-07-15 (tarea `CORE-346`), curado desde
`D:\RESPALDO_PROTOTIPE\Continuidad\2026-07-14\02_DOCUMENTOS_CENTRALES\17_PROTOCOLO_REANUDACION_PARA_CUALQUIER_IA.md`
(el resto de ese documento quedó superado por este contrato; solo estos dos
artefactos no tenían equivalente aquí).

Toda afirmación en una tarea, bitácora o handoff debe etiquetarse con una de
estas siete categorías — no dejar ambigüedad entre lo que se verificó y lo
que se infirió:

- **HECHO VERIFICADO** — comprobado directamente en esta sesión (comando
  ejecutado, archivo leído, prueba corrida).
- **RESULTADO INFORMADO NO REAUDITADO** — proviene de otra sesión, documento
  o persona; no se volvió a comprobar en esta tarea.
- **INFERENCIA** — deducción razonable a partir de evidencia parcial, no
  confirmada directamente.
- **RIESGO** — algo que podría fallar o ya está mal, con evidencia parcial o
  ninguna todavía.
- **PROPUESTA** — una recomendación de acción, no una decisión tomada.
- **BLOQUEO** — impide continuar hasta que se resuelva una condición externa.
- **DECISIÓN REQUERIDA** — necesita una elección del fundador que ninguna IA
  puede tomar por su cuenta.

Plantilla de cierre de sesión (rellenar al entregar un handoff):

```markdown
## Handoff — [tarea]

- Estado anterior → Estado actual:
- Repositorio / rama / HEAD:
- Alcance ejecutado:
- Archivos modificados (propios vs. preexistentes preservados):
- Pruebas ejecutadas y resultado literal:
- Evidencia pendiente:
- Riesgos y bloqueos:
- Documentación actualizada:
- Siguiente paso exacto:
- Acciones que siguen sin autorización:
```

### 7.2 Traspaso verificado con loop de autocorrección (IA ejecutora distinta de quien retoma)

Incorporado 2026-07-15 (tarea posterior a `CORE-346`), por instrucción
explícita del fundador: cuando una IA (típicamente Antigravity, mientras
Claude Code no está disponible) ejecuta una tarea completa por su cuenta, el
objetivo es que quien retome después (Claude u otra IA) pueda confiar en el
resultado con una verificación **barata y dirigida**, no con una auditoría
completa desde cero. Esto no reemplaza la regla de §7 ("el agente receptor
vuelve a verificar el estado local; nunca confía únicamente en el resumen
del agente anterior") — la hace más barata haciendo que la IA ejecutora deje
un rastro de evidencia preciso y ya autocorregido.

**Motivo:** el riesgo R-022 (`registro_riesgos_deuda_tecnica_2026-07-14.md`)
— "CI verde sin pruebas reales" / falsos positivos de cierre — es exactamente
lo que este protocolo busca prevenir en el punto de origen, no solo detectar
después.

#### Antes de asignar la tarea

Quien asigna (fundador, o Claude antes de quedarse sin contexto) escribe
**criterios de cierre objetivos y verificables por comando** — no "que quede
bien", sino algo como "`npm run test` pasa con N casos", "`eslint .` no
agrega errores nuevos respecto a la línea base actual", "`vite build` termina
en éxito". Mismo principio que la matriz de pruebas proporcional ya usada en
`CORE-344`/`CORE-345`.

#### Loop de autocorrección obligatorio (para la IA ejecutora)

1. Implementar el cambio.
2. Ejecutar **todos** los criterios de cierre, no solo el que se acaba de
   tocar.
3. Si alguno falla: diagnosticar la causa raíz, corregir, y volver al paso 2
   — ejecutar **todos** de nuevo (una corrección puede romper algo que antes
   pasaba; solo re-correr el que falló no lo detecta).
4. Repetir hasta que todos los criterios pasen con evidencia literal, o hasta
   agotar **5 ciclos completos**. Al agotar el límite sin éxito: detenerse,
   etiquetar como `BLOQUEO` (no fingir cierre ni bajar el criterio para
   forzar verde), y dejarlo así en el traspaso.
5. Cada ciclo (incluidos los fallidos) queda registrado brevemente en el
   traspaso: qué falló, qué se intentó, qué cambió — no solo el resultado
   final. Si algo se rompe después, ese rastro dice qué ya se probó.

#### Evidencia, no narrativa

Cada afirmación de "esto ya pasa" se etiqueta `HECHO VERIFICADO` (§7.1) y va
acompañada del comando exacto y su salida literal — no un resumen en
prosa tipo "todo funcionó correctamente".

#### Artefacto de traspaso compacto

Al terminar (con éxito o en `BLOQUEO`), la IA ejecutora escribe un archivo en
`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_<ID-TAREA>_<FECHA>.md`
usando la plantilla de §7.1, **más esta sección adicional obligatoria al
final**:

```markdown
## Reverificación rápida para quien retome

Ejecuta exactamente estos comandos antes de confiar en este traspaso y de
construir sobre él (no hace falta repetir todo el trabajo de auditoría, solo
esto):

1. `<comando exacto>` → se espera: `<resultado exacto esperado>`
2. `<comando exacto>` → se espera: `<resultado exacto esperado>`
3. ...

Ciclos de autocorrección: <N intentos, resumen de qué falló en cada uno>
Estado final: `VERIFICADO` | `BLOQUEO` (con motivo exacto)
```

#### Regla que no cambia

Quien retoma **siempre** re-ejecuta al menos los comandos señalados en
"Reverificación rápida" antes de seguir construyendo sobre ese trabajo. La
diferencia con una auditoría completa es que aquí son 2-5 comandos dirigidos
en vez de redescubrir todo el alcance desde cero — eso es lo que ahorra
tokens en la sesión que retoma, no la ausencia de verificación.

## 8. Cambio de este método

Una nueva práctica empieza como `EXPERIMENTAL`. Debe probarse en tareas doradas y
compararse por calidad, tiempo, tokens, permisos y retrabajo. Solo se promueve a
`ACTIVE` mediante una decisión documentada. Las actualizaciones automáticas de
reglas, skills, agentes o plugins están prohibidas.
