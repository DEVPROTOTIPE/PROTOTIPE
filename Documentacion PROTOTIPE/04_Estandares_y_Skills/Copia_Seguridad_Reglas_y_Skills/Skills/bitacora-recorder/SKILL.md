---
name: bitacora-recorder
description: >
  Fuerza el registro correcto y atómico de UN solo cambio técnico en bitacora_cambios.md.
  Activar obligatoriamente cada vez que se registre cualquier cambio en la bitácora —
  sea un nuevo CLI, una corrección, un [MINOR] o un [BUILD_FAILED].
  Garantiza que: (1) cada entrada es atómica (un solo cambio por ID),
  (2) incluye la sección "Archivos modificados" con rutas absolutas,
  (3) identifica ejecutor, rama/HEAD y evidencia,
  (4) no mezcla archivos de tareas distintas ni atribuye cambios preexistentes.
---

# Skill: bitacora-recorder

## REGLA ABSOLUTA

> Cada entrada de bitácora representa **exactamente un cambio técnico**.
> Está **PROHIBIDO** registrar archivos de tareas distintas en una misma entrada.

---

## Template Obligatorio

Toda entrada en `bitacora_cambios.md` DEBE seguir esta estructura exacta.
No omitir ninguna sección. No mezclar archivos de otras tareas.

```markdown
## [ID] — [YYYY-MM-DD]
**[Tipo]: [Descripción concisa en una línea]**

### Cambios realizados:
1. **[Componente o área]:** [Qué se hizo y por qué.]
2. **[Componente o área]:** [Qué se hizo y por qué.]
<!-- Mínimo 1 ítem. Máximo lo que aplique para ESA tarea únicamente. -->

### Ejecución y base:
- **Ejecutor(es):** [Fundador|Codex|Claude|Antigravity|otro identificado]
- **Rama / HEAD observado:** `[rama]` / `[commit corto]`
- **Alcance propio:** [Qué archivos o áreas asumió este ejecutor.]
- **Cambios preexistentes preservados:** [Sí; resumen sin reasignarlos a esta tarea.]

### Evidencia:
- [Comando, prueba, diff o inspección y su resultado verificable.]
- **Estado:** `[READY|IN_PROGRESS|BLOCKED|VERIFIED_COMPLETE|otro estado canónico]`

### Archivos modificados:
- [`nombre_archivo.ext`](file:///ruta/absoluta/nombre_archivo.ext) [NEW|MODIFY|DELETE|DEPLOY]
<!-- Mínimo 1 archivo. Solo archivos de ESTA tarea. -->
```

### Prefijos de ID válidos

| Prefijo | Cuándo usarlo |
|---|---|
| `CLI-NNN` | Cambio en cualquier Core, CLI o instancia de cliente |
| `COMP-NNN` | Creación o actualización de componente en la Biblioteca |
| `BUG-NNN` | Corrección de bug |
| `SYNC-NNN` | Sincronización de templates o reglas |

### Tags especiales (en lugar de tipo)

- `[MINOR]` — fix tipográfico, renombrar variable, ajuste CSS de 1 línea. Solo actualiza bitácora, no mapa ni tareas.
- `[BUILD_FAILED]` — build roto. Formato: `## CLI-NNN — fecha [BUILD_FAILED]` + error exacto de consola.
- `[SYNC_FAILED]` — fallo en sync_rules.js.

---

## Protocolo de Registro

### Paso 1 — Determinar el ID
- Leer el último ID en la bitácora (`head -n 5 bitacora_cambios.md`).
- Incrementar en 1 para la nueva entrada.
- **NUNCA reutilizar un ID existente.**

### Paso 2 — Listar solo los archivos de ESTA tarea
- Consultar `git status` y el diff de alcance; no depender solo de memoria.
- Registrar el ejecutor real y distinguir sus cambios de modificaciones preexistentes o concurrentes.
- Si editaste 10 archivos para 3 tareas distintas, cada tarea tiene su propia entrada con sus 3-4 archivos.
- **Test de sanidad:** ¿El archivo que estoy listando existe porque implementé ESTA funcionalidad?
  - SÍ → incluirlo.
  - NO → pertenece a otra entrada.

### Paso 3 — Insertar al tope del archivo
- La entrada más reciente siempre va **primero** (arriba del todo).
- Separar de la entrada anterior con `---`.

### Paso 4 — Validar antes de guardar
Checklist mental:

```
[ ] El ID es único y correlativo al anterior
[ ] El título describe UNA sola tarea
[ ] "Cambios realizados" tiene ≥1 ítem
[ ] Se identifican ejecutor, rama/HEAD y alcance propio
[ ] La evidencia distingue inspección de resultado informado
[ ] Los cambios preexistentes están preservados y no se atribuyen a esta tarea
[ ] "Archivos modificados" tiene ≥1 archivo con ruta absoluta
[ ] Ningún archivo listado pertenece a una tarea distinta
[ ] Las etiquetas [NEW|MODIFY|DELETE|DEPLOY] son correctas
```

---

## Ejemplos Correctos vs Incorrectos

### ✅ CORRECTO — 1 tarea, sus propios archivos
```markdown
## CLI-370 — 2026-07-10
**Feature: Corrección del filtro de recipientRole en markAllAsRead**

### Cambios realizados:
1. **notificationCenterService.js:** Añadido `where('recipientRole', '==', 'client')` para alinear la consulta con las reglas de seguridad de Firestore.
2. **firestore.rules:** Reescrita la regla `allow delete` para roles `client`, `vendedor`, `bodeguero`, `mensajero`.

### Archivos modificados:
- [`notificationCenterService.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/notificationCenterService.js) [MODIFY]
- [`firestore.rules`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [MODIFY + DEPLOY]
```

### ❌ INCORRECTO — mezcla de tareas en una entrada
```markdown
## CLI-366 — 2026-07-09
**Feature: ScratchCard + WelcomePage + NotificationCenter + LoginPage + FortuneWheel**

### Archivos modificados:
- ScratchCardReward.jsx [NEW]           ← ✅ pertenece
- PremiumWelcomeSplash.jsx [NEW]        ← ❌ es otra tarea (CLI-365)
- HybridLoginPage.jsx [NEW]             ← ❌ es otra tarea (CLI-362)
- InteractiveFortuneWheel.jsx [NEW]     ← ❌ es otra tarea (CLI-361)
- server.js [MODIFY]                    ← ❌ nunca fue parte del ScratchCard
```

---

## Regla de Corrección Retroactiva

Si se detecta una entrada malformada o mezclada:
1. Corregir la entrada existente dejando solo los archivos de esa tarea.
2. Agregar nota `> ⚠️ Nota de auditoría:` explicando qué se corrigió y por qué.
3. Si los archivos extra pertenecen a tareas no documentadas, crear entradas retroactivas con el ID que les corresponde.
4. Registrar la corrección como `[MINOR]` en la bitácora.

---

## Bitácoras aplicables

Esta skill aplica a TODAS las bitácoras del ecosistema:

| Archivo | Proyecto |
|---|---|
| `d:\PROTOTIPE\Documentacion PROTOTIPE\03_Auditorias_y_Faro_Core\bitacora_cambios.md` | Global (CLI) |
| `[Plantilla]\Documentacion App [Nombre]\bitacora_cambios.md` | Plantillas Core |
| `[Instancia]\Documentacion App [Nombre]\bitacora_cambios.md` | Instancias de cliente |
| `d:\PROTOTIPE\Central PROTOTIPE\Documentacion dev-dashboard\bitacora_cambios.md` | Dev Dashboard |
