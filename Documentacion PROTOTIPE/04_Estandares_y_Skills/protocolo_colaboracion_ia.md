# Protocolo de colaboración multi‑IA de PROTOTIPE

**Versión:** 2.0

**Fecha:** 14 de julio de 2026

**Estado:** adoptado y verificado por `CLAUDE-003`

**Contrato superior:** `D:\PROTOTIPE\.agents\AI_WORKFLOW.md`

Este protocolo reemplaza el modelo antiguo en el que Antigravity era la única IA
ejecutora y las demás actuaban solo como consultoras. PROTOTIPE puede ser modificado
por el fundador, Codex, Claude o Antigravity, siempre bajo el mismo contrato y con
evidencia suficiente.

## 1. Autoridad y roles

1. El fundador define objetivo, prioridades, presupuesto y autorizaciones sensibles.
2. Codex, Claude y Antigravity son ejecutores posibles; ninguna IA es dueña exclusiva
   del código, del roadmap ni de la verdad documental.
3. Una IA puede revisar el trabajo de otra, pero no debe asumir que una salida previa
   es correcta: contrasta archivos, configuración, diff y pruebas reales.
4. Las herramientas externas —incluidas otras IAs disponibles— se usan solo cuando
   cubren una necesidad concreta que no resuelve mejor el conjunto local mínimo.

## 2. Fuente operativa común

Toda IA con acceso local debe comenzar por este orden:

1. instrucciones del fundador para la tarea actual;
2. restricciones de seguridad y permisos de su entorno;
3. `.agents/AI_WORKFLOW.md`;
4. estado canónico en `tareas_pendientes.md`, bitácora y baseline aplicable;
5. reglas del área o rutas afectadas;
6. capacidades aprobadas en `.agents/capabilities/registry.json`.

`CLAUDE.md` es la entrada breve para Claude. `.agents/AGENTS.md` conserva referencia
técnica heredada, pero no puede revocar el contrato vigente ni convertir afirmaciones
históricas en decisiones actuales.

## 3. Propiedad del trabajo y concurrencia

La regla base es **un solo escritor por worktree físico**.

- Varias IAs pueden leer y revisar en paralelo.
- Si dos IAs deben escribir simultáneamente, cada una usa un worktree o clon físico
  separado, una tarea identificada y un alcance de archivos no superpuesto.
- Antes de editar, el ejecutor registra rama, `HEAD`, estado del working tree, archivos
  permitidos, evidencia requerida y criterio de cierre.
- Los cambios que ya existían pertenecen a otro trabajo hasta demostrar lo contrario.
- Está prohibido sobrescribir, reformatear, mover, restaurar o descartar cambios ajenos
  para “limpiar” el árbol.
- Al detectar una modificación concurrente en un archivo del alcance, el ejecutor se
  detiene, vuelve a leer el diff y coordina antes de continuar.

## 4. Selección de capacidades

1. Consultar `route-capabilities` con una descripción concreta de la tarea.
2. Elegir el conjunto mínimo que cubra implementación y verificación.
3. Una capacidad `INTERNAL_RESTRICTED` exige revisión y autorización acorde con su
   riesgo; no se activa por coincidencia temática.
4. Un elemento `CANDIDATE`, `DEFERRED`, `OUT_OF_SCOPE` o `REJECTED` no está aprobado.
5. Solo si el enrutador devuelve `DISCOVERY_REVIEW_REQUIRED` puede evaluarse
   `find-skills-governed`.
6. La búsqueda externa requiere autorización del fundador y produce candidatos, no
   una instalación.
7. Están prohibidas la instalación, actualización o ejecución automática/global de
   skills, agentes, plugins, MCP o dependencias.

Popularidad, estrellas o puntuaciones de catálogo sirven como señal de descubrimiento,
no como prueba de seguridad, calidad, mantenimiento, licencia o compatibilidad.

## 5. Ciclo obligatorio de una tarea

### A. Preflight

- objetivo y tarea canónica;
- alcance exacto y archivos permitidos;
- rama, `HEAD` y cambios preexistentes;
- evidencia requerida y criterio de cierre;
- riesgos de secretos, datos, facturación, producción y supply chain;
- capacidades mínimas elegidas.

### B. Ejecución

- leer solo el contexto necesario;
- aplicar cambios pequeños y revisables;
- no ampliar el alcance sin volver al preflight;
- no incluir secretos en prompts, logs, documentación o respuestas;
- mantener compatible la versión estable más reciente elegida por el proyecto; una
  actualización mayor necesita migración y pruebas propias, no solo el número mayor.

### C. Verificación proporcional

- validar sintaxis y formatos de configuración;
- revisar el diff del alcance;
- ejecutar lint, pruebas o build que correspondan al riesgo real;
- para seguridad, arquitectura, datos, facturación o release, obtener revisión
  independiente adicional;
- distinguir claramente `RESULTADO INFORMADO` de `HECHO VERIFICADO`.

### D. Registro y handoff

La bitácora debe registrar:

- ejecutor o ejecutores;
- tarea, objetivo y estado;
- rama y `HEAD` observados;
- archivos propios y cambios preexistentes preservados;
- decisiones aceptadas, adaptadas o rechazadas;
- comandos o inspecciones usados como evidencia y su resultado;
- riesgos, bloqueos y siguiente paso exacto.

El estado solo se marca `VERIFIED_COMPLETE` cuando el criterio de cierre está
demostrado. `READY` o `IN_PROGRESS` no equivalen a completado.

## 6. Fallos y recuperación segura

Un fallo de lint, prueba o build no autoriza rollback, reset, restore, checkout, clean
ni descarte automático. El ejecutor:

1. preserva el estado y captura la evidencia no sensible;
2. identifica si el fallo es preexistente o causado por la tarea;
3. intenta una corrección limitada si sigue dentro del alcance;
4. si requiere borrar, restaurar, reescribir historial o tocar cambios ajenos, se
   detiene y solicita autorización explícita;
5. registra `BLOCKED` o el estado canónico aplicable, sin declarar un cierre falso.

Commit, push, merge, deploy, migraciones de datos, restauraciones y REC-002 requieren
autorización separada aunque las pruebas estén verdes.

## 7. Superficies de Claude y otras IAs

- Claude Code en terminal y la superficie Code de escritorio deben abrirse desde
  `D:\PROTOTIPE` y usar `CLAUDE.md` más la configuración local del proyecto.
- Un chat de escritorio que no tenga acceso confirmado a los archivos no debe asumir
  que cargó la configuración del repositorio; recibe un Context Pack limitado.
- Codex y Antigravity leen el contrato común directamente cuando tengan acceso local.
- Google Antigravity, ChatGPT Pro, Claude Pro u otras cuentas disponibles no se invocan
  por rutina; se seleccionan por necesidad, costo, privacidad y capacidad real.

## 8. Context Pack para una IA sin acceso local

El paquete mínimo contiene:

1. objetivo y pregunta concreta;
2. tarea, rama y `HEAD`;
3. fragmentos estrictamente necesarios y sin secretos;
4. restricciones y dependencias verificadas;
5. error literal no sensible o evidencia disponible;
6. supuestos pendientes;
7. formato de respuesta esperado: veredicto, riesgos, propuesta y supuestos.

La respuesta externa se clasifica como `ACEPTADA`, `ADAPTADA` o `RECHAZADA`, con
justificación. Nunca se copia a ciegas.

## 9. Criterio de cierre de `CLAUDE-003`

**Resultado al 14 de julio de 2026:** `VERIFIED_COMPLETE`; los seis criterios
fueron demostrados localmente mediante validaciones y dos handoffs independientes.

El cierre de `CLAUDE-003` exigió demostrar:

1. configuración, registro y skills válidos;
2. sincronización activa/respaldo sin conflictos;
3. golden tasks del enrutador aprobadas;
4. dos ciclos reales donde distintas IAs puedan retomar el trabajo mediante la
   documentación sin perder contexto ni sobrescribir cambios;
5. revisión final del diff y de la bitácora;
6. ninguna instalación automática, secreto expuesto, commit, push o deploy no
   autorizado.
