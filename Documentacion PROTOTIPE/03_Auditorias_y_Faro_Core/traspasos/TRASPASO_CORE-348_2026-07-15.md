# TRASPASO CORE-348: Reestructurar `.agents/AGENTS.md` en reglas por ruta (`.claude/rules/`)

## Handoff — CORE-348

- **Estado anterior → Estado actual:** `ASSIGNED_TO_ANTIGRAVITY` → `READY_FOR_INDEPENDENT_REVIEW` (en `tareas_pendientes.md` y bitácora, esperando revisión e integración en Git).
- **Repositorio / rama / HEAD:**
  - Repositorio: `D:\PROTOTIPE`
  - Rama: `docs/context-packaging`
  - HEAD observado: `b2d76d4`
- **Alcance ejecutado:**
  - Reducción del monolito `.agents/AGENTS.md` de 475 líneas a un índice ligero de 41 líneas.
  - Creación de la carpeta `.claude/rules/` y distribución de reglas en 6 archivos modulares por ruta/ámbito.
  - Corrección de la contradicción de auto-commits en la sección post-change (ahora exige proponer los commits en Git y esperar confirmación del usuario, respetando `AI_WORKFLOW.md` y `CLAUDE.md`).
  - Validación del estado del endpoint de roadmap (se confirmó que está VIVO e implementado en `Prototipe-CLI/server.js`), y actualización de la regla en `task-tracking.md` con un enfoque híbrido (mecanismo prioritario vía endpoint local del Bridge, y fallback de edición manual en markdown si el Bridge no está activo).
- **Archivos modificados (propios vs. preexistentes preservados):**
  - **Propios (Modificados):**
    - [`.agents/AGENTS.md`](file:///d:/PROTOTIPE/.agents/AGENTS.md) (simplificado a índice).
  - **Propios (Nuevos):**
    - [`.claude/rules/00-prohibiciones-globales.md`](file:///d:/PROTOTIPE/.claude/rules/00-prohibiciones-globales.md) (prohibición de restore + post-change corregido).
    - [`.claude/rules/task-tracking.md`](file:///d:/PROTOTIPE/.claude/rules/task-tracking.md) (protocolo de tareas híbrido).
    - [`.claude/rules/dashboard-ui.md`](file:///d:/PROTOTIPE/.claude/rules/dashboard-ui.md) (estándar de dashboard, tags, sandboxes y layout).
    - [`.claude/rules/component-library.md`](file:///d:/PROTOTIPE/.claude/rules/component-library.md) (useAlertConfirm, targetPath, CSS contraste, responsive móvil y Design Integrity Guard).
    - [`.claude/rules/colaboracion-componentes.md`](file:///d:/PROTOTIPE/.claude/rules/colaboracion-componentes.md) (colaboración @colaborar y toma de decisiones).
    - [`.claude/rules/firebase-architecture.md`](file:///d:/PROTOTIPE/.claude/rules/firebase-architecture.md) (arquitectura de 3 capas, offline, skeletons, seguridad, CORS y RBAC).
  - **Preexistentes preservados:** Ninguno modificado.
- **Pruebas ejecutadas y resultado literal:**
  - `git diff --stat -- .agents/AGENTS.md` (HECHO VERIFICADO): Confirmada la reducción a 41 líneas:
    ```
    warning: in the working copy of '.agents/AGENTS.md', LF will be replaced by CRLF the next time Git touches it
     .agents/AGENTS.md | 497 +++++-------------------------------------------------
     1 file changed, 40 insertions(+), 457 deletions(-)
    ```
  - Búsqueda `grep` de Integridad (HECHO VERIFICADO): Se ejecutaron búsquedas de palabras clave únicas para garantizar que ningún estándar técnico se perdió durante la portabilidad de bloques (todos retornaron `PASS` en sus respectivos archivos de destino).
- **Evidencia pendiente:** Ninguna.
- **Riesgos y bloqueos:** Ninguno.
- **Documentación actualizada:**
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md)
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md)
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-348_2026-07-15.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-348_2026-07-15.md) (este archivo).
- **Siguiente paso exacto:** Revisar y aprobar el traspaso para su posterior confirmación e integración en Git.
- **Acciones que siguen sin autorización:** Realizar commit de los archivos modificados/nuevos o hacer push en Git.

---

## Reverificación rápida para quien retome

Ejecuta exactamente estos comandos antes de confiar en este traspaso y de construir sobre él (no hace falta repetir todo el trabajo de auditoría, solo esto):

1. **Confirmar líneas de AGENTS.md:**
   ```pwsh
   (Get-Content "d:\PROTOTIPE\.agents\AGENTS.md").Length
   ```
   *Se espera:* Un número menor a `60` (actualmente `41` líneas).
2. **Validar existencia de nuevos archivos de reglas:**
   ```pwsh
   Get-ChildItem "d:\PROTOTIPE\.claude\rules\" | Select-Object Name
   ```
   *Se espera:*
   - `00-prohibiciones-globales.md`
   - `colaboracion-componentes.md`
   - `component-library.md`
   - `dashboard-ui.md`
   - `firebase-architecture.md`
   - `task-tracking.md`
3. **Verificar que la prohibición de restore y el post-change modificado están integrados:**
   ```pwsh
   Select-String -Path "d:\PROTOTIPE\.claude\rules\00-prohibiciones-globales.md" -Pattern "PROPUESTA OBLIGATORIA DE COMMIT"
   ```
   *Se espera:* Retornar la coincidencia exacta de la directiva que corrige la contradicción de auto-commits.

Ciclos de autocorrección: 1 intento (las reglas se inyectaron directamente sin errores de linter o compilación, ya que son puramente documentales y las rutas fueron verificadas preventivamente).
Estado final: `VERIFICADO`
