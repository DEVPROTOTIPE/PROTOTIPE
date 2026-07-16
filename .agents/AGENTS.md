# AGENTS.md — Índice de Reglas por Ruta y Gobernanza de Prototype

## 1. Contrato Operativo Principal
* **Precedencia Absoluta:** Para el acuerdo de precedencia, colaboración multiagente, confirmación de cambios en Git y flujo de cierre basado en evidencia, leer de forma obligatoria el contrato central:
  [AI_WORKFLOW.md](file:///d:/PROTOTIPE/.agents/AI_WORKFLOW.md)

---

## 2. Reglas Específicas por Ámbito (.claude/rules/)
Para optimizar el tamaño de contexto de los agentes, las reglas históricas de este archivo se han distribuido en los siguientes archivos modulares por ámbito bajo la carpeta `.claude/rules/`:

### A. Gobernanza y Desarrollo Global
* **[00-prohibiciones-globales.md](file:///d:/PROTOTIPE/.claude/rules/00-prohibiciones-globales.md):**
  - Prohibición absoluta de restaurar/descartar cambios físicos.
  - Protocolo de integridad física y documental post-change (con flujo obligatorio de propuesta y aprobación explícita de commits).
* **[task-tracking.md](file:///d:/PROTOTIPE/.claude/rules/task-tracking.md):**
  - Protocolo obligatorio de pre-registro, formato y cierre de tareas (`tareas_pendientes.md`) mediante edición manual directa — el único mecanismo verificado en la práctica real de esta serie.

### B. Estándares Visuales y de UI
* **[dashboard-ui.md](file:///d:/PROTOTIPE/.claude/rules/dashboard-ui.md):**
  - Estándar de tags, keywords y filtrabilidad en la Biblioteca de Componentes.
  - Estándar de layout (2 columnas), Storybook/Playgrounds (Sandboxes) y modularización de `App.jsx`.
  - Estándar de dropdowns personalizados (`CustomSelect`).
* **[component-library.md](file:///d:/PROTOTIPE/.claude/rules/component-library.md):**
  - Estándar de confirmaciones en eliminación (`useAlertConfirm`).
  - Prohibición de componentes inventados y dependencias huérfanas.
  - targetPath canónico para manifiestos de biblioteca.
  - Estándar responsivo móvil y prevención de desbordamientos (14 sub-reglas).
  - Prebuild de React, linting e importaciones.
  - Restricciones del Design Integrity Guard (sombras, anchos en px, colores HSL).
* **[colaboracion-componentes.md](file:///d:/PROTOTIPE/.claude/rules/colaboracion-componentes.md):**
  - Disparador `@colaborar` y formato de context pack.
  - Protocolo de toma de decisiones (Descubrimiento, Deltas, Extracción).

### C. Persistencia y Backend
* **[firebase-architecture.md](file:///d:/PROTOTIPE/.claude/rules/firebase-architecture.md):**
  - Arquitectura desacoplada por capas (Repository, Service, Hook UI).
  - Gobernanza de listeners en tiempo real (`onSnapshot`) e inactividad temporal del Registry.
  - Offline cache (Zustand, Dexie/IndexedDB) y transacciones en documentos calientes.
  - Skeletons, API pública modular, seguridad de Firebase y restricciones CORS/RBAC/Multitenant.
