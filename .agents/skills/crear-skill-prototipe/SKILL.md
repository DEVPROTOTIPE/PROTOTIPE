---
name: crear-skill-prototipe
description: "Crea una nueva skill del ecosistema PROTOTIPE correctamente. ACTIVA esta skill cuando el usuario pida crear una nueva skill, automatización, o comando reutilizable para el proyecto. Garantiza que la skill tenga dos capas: archivo SKILL.md para uso manual con IA y, si aplica, integración funcional en el dashboard."
---

# Crear Skill del Ecosistema PROTOTIPE

## Contexto del Ecosistema

PROTOTIPE es un monorepo en `d:/PROTOTIPE/` con esta estructura clave:
- `Prototipe-CLI/server.js` — CLI Bridge Express (~8300 líneas). **Motor de todas las operaciones de archivo y sistema.**
- `Central PROTOTIPE/dev-dashboard/src/` — Dashboard React (App.jsx + componentes admin).
- `Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx` — Panel "Salud y Roadmap" donde viven las skills del dashboard.
- `.agents/skills/` — Skills manuales del workspace (este directorio).
- `Documentacion PROTOTIPE/` — Documentación del proyecto (bitácora, roadmap, biblioteca).

---

## Arquitectura de Dos Planos (OBLIGATORIO entender esto antes de crear)

Toda skill en PROTOTIPE vive en **dos planos simultáneos**:

### Plano 1 — Skill Manual de Agente IA
Archivo `SKILL.md` en `d:/PROTOTIPE/.agents/skills/[nombre-skill]/SKILL.md`.  
Propósito: el usuario puede pasar esta skill al agente IA manualmente para que la ejecute sin contexto previo.  
Debe ser **100% autocontenida**: incluir rutas, patrones de código, reglas de negocio y ejemplos.

### Plano 2 — Integración en Dashboard (solo si la skill tiene UI)
Sub-pestaña o botón en `SkillsRoadmapPanel.jsx` que llama a un endpoint nuevo en `server.js`.  
Patrón invariable: **React UI → `fetch(http://localhost:3001/api/...)` → Endpoint Express → Operación en disco**.

---

## Reglas Críticas (NO negociables)

### ❌ PROHIBIDO: Skills Teóricas
Una skill SOLO puede crearse si su lógica ya existe en el código real del proyecto o si el usuario la solicitó explícitamente para un flujo que ya hace manualmente.  
**Antes de crear cualquier skill: auditar el código fuente para confirmar que la operación que describe ya existe o tiene base real.**

### ❌ PROHIBIDO: Código en App.jsx
Toda integración en el dashboard debe ser un componente React independiente en `src/components/admin/`.  
`App.jsx` solo recibe: import + condición de activación (`activeTab === '...'` si es pestaña nueva) o nada si es sub-pestaña de un panel existente.

### ❌ PROHIBIDO: Rutas Hardcodeadas
Todos los endpoints nuevos en `server.js` deben usar `GIT_ROOT` (ya definido dinámicamente) en lugar de `'D:\\PROTOTIPE'`.

### ❌ PROHIBIDO: Race Conditions en endpoints de escritura
Todo endpoint POST que lea → modifique → escriba un archivo DEBE usar `_roadmapQueue.push()` o crear su propia `WriteQueue` local. Ver patrón en línea ~8128 de `server.js`.

### ✅ OBLIGATORIO: Escritura resiliente
Todo `fs.writeFile` en endpoints de servidor debe usar `writeFileWithRetry()` (definida en línea ~130 de `server.js`) en lugar de `fs.writeFile` directo.

### ✅ OBLIGATORIO: Sin `require()` en endpoints
`server.js` usa módulos ES. Usar exclusivamente los imports declarados al inicio del archivo (`exec`, `spawn`, `fs`, `path`, etc.).

### ✅ OBLIGATORIO: Alineación de Calidad Premium y Completitud Lógica
Cualquier skill creada o modificada que genere, extraiga, migre o integre código (sea React, HTML, JS o CSS) debe obligar de forma explícita al agente a cumplir con:
1. **Cero Placeholders:** El código de componentes y lógica debe ser 100% completo, portable y funcional. Queda prohibida la elipsis (`// ...`).
2. **Estética HSL y Cero select nativos:** Todo el color debe consumirse de las variables HSL (`var(--color-bg)`, `var(--color-border)`). Se prohíbe el uso de selectores nativos `<select>` (se debe guiar al uso de `CustomSelect`) y eliminaciones directas sin `useAlertConfirm`.
3. **Paddings de Holgura en Scroll (Anti-Clipping):** Todo contenedor deslizable (`overflow-x-auto`, `overflow-y-auto`) con animaciones de escala/traslación debe llevar paddings internos (ej. `py-4`) para evitar truncamientos de render.
4. **Nomenclatura Estructurada:** Las secciones de código React en documentación markdown deben titularse estrictamente como `## [Número]. Código React Completo` para que el parser del dashboard los indexe sin errores.
5. **Arquitectura Desacoplada de 3 Capas:** Todo componente o módulo de negocio de cliente o administrador debe modularizarse en *Repository*, *Service*, y *Custom Hook/Zustand Store*.
6. **Resiliencia Firebase y Skeletons:** Los listeners de tiempo real (`onSnapshot`) deben estar condicionados a la autenticación activa y desregistrados (`unsubscribe()`) en el desmontaje. Los estados de carga deben usar shimmer skeletons (`ProductCardSkeleton`, `OrderTrackingSkeleton`) para evitar layout shifts.

---

## Proceso de Creación — Pasos en Orden

### Paso 1: Auditoría de Viabilidad
Antes de escribir cualquier línea:
1. Leer el código fuente relevante del proyecto para confirmar que la operación existe o tiene base.
2. Verificar que no existe ya una skill similar en `.agents/skills/`.
3. Identificar si necesita: solo SKILL.md, solo endpoint CLI, o ambos + UI.

### Paso 2: Crear el Endpoint en `server.js` (si aplica)
- Ubicar al final del archivo, antes de `async function startServer(port)`.
- Usar `GIT_ROOT` para todas las rutas.
- Si es POST de escritura: envolver en `WriteQueue`.
- Si ejecuta un proceso hijo: usar `exec` o `execAsync` (ya importados), jamás `require('child_process')`.
- Siempre envolver en `try/catch` y devolver `{ success, ...datos }` o `{ error: mensaje }`.

### Paso 3: Crear el Componente React (si aplica)
- Archivo en: `Central PROTOTIPE/dev-dashboard/src/components/admin/[NombreSkill]Panel.jsx`
- Importar solo de `react`, `lucide-react` y `fetch`.
- Constante `CLI_URL = 'http://localhost:3001'` al inicio del componente.
- Estados mínimos: `loading`, `result`, `error`.
- UI: seguir el estilo visual del panel existente (`SkillsRoadmapPanel.jsx`): bordes `border-[var(--color-border)]`, superficies `bg-[var(--color-surface)]`, textos `text-[var(--color-text)]`, botones con gradiente `from-indigo-600 to-purple-600`.

### Paso 4: Integrar en `SkillsRoadmapPanel.jsx` o `App.jsx`
- **Sub-pestaña nueva dentro del panel existente**: agregar botón al selector de pastillas y condición `{activeSubTab === 'nombre' && <NombrePanel />}`.
- **Pestaña nueva en navegación principal**: agregar entrada al array de tabs en `App.jsx` línea ~6378, import del componente, y condición `{activeTab === 'nombre' && <.../>}` en el cuerpo.
- La decisión depende del alcance: skills operativas del ecosistema → sub-pestaña. Skills de módulo completo → pestaña propia.

### Paso 5: Crear el archivo SKILL.md
Ruta: `d:/PROTOTIPE/.agents/skills/[nombre-kebab-case]/SKILL.md`

Estructura obligatoria del SKILL.md:
```markdown
---
name: nombre-skill
description: "Descripción precisa de cuándo activar. Incluir verbos de acción y casos de uso."
---

# Título de la Skill

## Propósito
Qué hace exactamente y por qué existe en el proyecto.

## Archivos Involucrados
- Ruta exacta de cada archivo que toca esta skill.

## Endpoint CLI (si aplica)
- Método y ruta: `POST /api/nombre`
- Payload esperado: `{ campo: tipo }`
- Respuesta: `{ success: bool, ... }`

## Componente Dashboard (si aplica)
- Ruta del componente: `src/components/admin/NombrePanel.jsx`
- Sub-pestaña en: `SkillsRoadmapPanel.jsx` o pestaña en `App.jsx`

## Instrucciones de Ejecución (para uso manual con IA)
Pasos exactos y ordenados que el agente debe ejecutar.
Incluir fragmentos de código de referencia si son necesarios para no ambigüedad.

## Reglas de Negocio
Restricciones, validaciones y comportamientos esperados específicos de esta skill.

## Verificación Post-Ejecución
Cómo confirmar que la skill funcionó correctamente.
```

### Paso 6: Registro de Documentación
- Registrar en `bitacora_cambios.md`.
- Si modifica la estructura de archivos: actualizar `mapa_aplicacion.md`.
- Si crea documentación nueva: actualizar `mapa_documentacion_ia.md`.

### Paso 7: Verificación Técnica
```powershell
# Verificar sintaxis del servidor
node --check server.js

# Build de control del dashboard
cmd /c npm run build
```
Ambos deben pasar sin errores antes de considerar la skill completa.

---

## Estructura de Directorios de Skills

```
d:/PROTOTIPE/.agents/
├── AGENTS.md                    # Reglas del workspace
└── skills/
    ├── crear-skill-prototipe/   # Esta misma skill (meta-skill)
    │   └── SKILL.md
    ├── [nombre-skill-2]/
    │   └── SKILL.md
    └── [nombre-skill-N]/
        └── SKILL.md
```

---

## Ejemplo de Flujo Completo

**Solicitud del usuario:** "Quiero poder ver el log del CLI desde el dashboard"

1. **Auditoría:** `cli_bridge.log` existe en `Prototipe-CLI/`. El CLI ya escribe logs ahí. Base real confirmada ✅
2. **Endpoint:** `GET /api/cli/log?lines=100` → lee las últimas N líneas de `cli_bridge.log` con `fs.readFile`.
3. **Componente:** `CLILogPanel.jsx` con auto-refresh cada 5 segundos, visor de consola estilo terminal.
4. **Integración:** Sub-pestaña "Log CLI" en `SkillsRoadmapPanel.jsx`.
5. **SKILL.md:** Documentar en `.agents/skills/cli-log-viewer/SKILL.md`.
6. **Verificación:** `node --check` + `npm run build`.
