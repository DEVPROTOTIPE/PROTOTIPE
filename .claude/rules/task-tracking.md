# Protocolo de Rastreo de Tareas (Task Tracking)

Este protocolo se aplica a **TODO cambio de código o documentación** en el ecosistema PROTOTIPE, sin excepción. Aplica al CLI, al dashboard, a plantillas, a instancias de clientes, a documentación y a cualquier otro componente del proyecto.

## Paso 1 — ANTES de escribir código: Pre-registrar la tarea

Antes de modificar cualquier archivo, la IA DEBE:

1. Determinar el **dominio** del cambio según esta tabla:

| Prefijo | Dominio | Archivos principales |
|---|---|---|
| `CORE` | Cambios transversales, arquitectura, proceso global | Múltiples dominios simultáneos |
| `CLI` | API Bridge / Motor de Aprovisionamiento (server.js, generator.js, workers) | `d:\PROTOTIPE\Prototipe-CLI\` |
| `DASH` | Dashboard Central (components, views, hooks) | `d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\` |
| `TPL` | Plantillas Core inyectables (template-ventas, template-core-seed) | `d:\PROTOTIPE\Prototipe-CLI\templates\` |
| `PLT` | Instancias de Clientes base (App Ventas, etc.) | `d:\PROTOTIPE\Plantillas Core\` |
| `INST` | Instancias de clientes específicas | `d:\PROTOTIPE\Instancias Clientes\` |
| `DOC` | Documentación exclusivamente (sin cambios de código) | `d:\PROTOTIPE\Documentacion PROTOTIPE\` |
| `LND` | Landing Page pública, embudos de venta y marketing | `d:\PROTOTIPE\Landing Page\`, `public/`, `marketing/` |
| `BIZ` | Estrategia de negocio, decisiones comerciales y de marca corporativa | `Documentacion PROTOTIPE/05_Estrategia_.../`, `08_Plan_.../` |

2. **Registro de la Tarea (edición manual — mecanismo único verificado en la
   práctica real):** insertar manualmente el bloque de tarea al inicio de
   `tareas_pendientes.md` respetando estrictamente el formato estándar antes
   de modificar cualquier archivo. **Este es el mecanismo que se ha usado
   para registrar y cerrar todas las tareas `CORE-341` a `CORE-360`** de la
   serie de continuidad post-reinstalación — es la práctica probada, no una
   alternativa de respaldo.
   * **Nota (`DECISIÓN REQUERIDA`, no promovida automáticamente a práctica
     activa):** existe un endpoint `POST /api/roadmap/add`/`toggle`/`update`
     implementado en `Prototipe-CLI/server.js` (confirmado vivo por
     `grep`), pero **ninguna tarea de esta serie lo ha usado ni verificado
     en la práctica**. `AI_WORKFLOW.md` §8 exige que una práctica nueva
     pase por validación en tareas doradas antes de promoverse a `ACTIVE` —
     usar este endpoint como mecanismo de registro requiere esa validación
     y una decisión explícita del fundador primero, no debe asumirse como
     disponible ni preferido solo porque el código existe.

3. Usar el ID generado (ej: `DASH-015`) en todos los registros de la sesión (bitácora, mapa, propuesta de commits).

## Paso 2 — AL FINALIZAR el cambio: Cerrar la tarea

Una vez completado y verificado el cambio (build limpio, sin errores):

1. **Cierre de la Tarea (edición manual):** editar físicamente
   `tareas_pendientes.md` para marcar la viñeta de la tarea como completada
   (`* **[x] ~~Tarea...~~**`) — mismo mecanismo único que el registro (ver
   Paso 1, incluida la nota sobre el endpoint de `/api/roadmap` como
   práctica no validada todavía).
2. Actualizar el campo `Estatus` de la tarea a `Completado.` (o similar según corresponda) y añadir la `Fecha de finalización` si aplica.
3. Registrar en `bitacora_cambios.md` usando el mismo ID de tarea como encabezado.
4. Actualizar `mapa_aplicacion.md` si el cambio altera la estructura física o lógica.

## Paso 3 — Formato estándar del bloque de tarea

Todo bloque de tarea registrado en `tareas_pendientes.md` DEBE seguir este formato:

```markdown
* **[ ] Tarea PREFIJO-XXX: Título conciso del cambio**
  - Estatus: Pendiente.
  - Fecha: YYYY-MM-DD
  - Descripción: Resumen técnico de qué se va a implementar y por qué.
  - Archivos:
    - [`ruta/archivo.ext`](file:///ruta/completa) [MODIFY|NEW|DELETE]
```

Al completar:

```markdown
* **[x] ~~Tarea PREFIJO-XXX: Título conciso del cambio~~**
  - Estatus: Completado.
  - Fecha: YYYY-MM-DD
  - Descripción: Lo que se implementó, correcciones incluidas.
  - Archivos:
    - [`ruta/archivo.ext`](file:///ruta/completa) [MODIFY|NEW|DELETE]
```

## Penalización

Omitir el pre-registro de tarea antes de modificar código es una **violación crítica de consistencia** equivalente a omitir la actualización de bitácora. Se penaliza con la misma severidad que el estándar de documentación ya vigente.
