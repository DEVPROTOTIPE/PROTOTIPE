---
name: gemini-rules-sync
description: Propagación en lote del archivo central de reglas de IA GEMINI.md / AGENTS.md preservando secciones personalizadas por Core.
trigger: "@sincronizar-reglas-ia"
aliases:
  - "@sync-rules"
---

# Skill de Sincronización de Reglas de IA (`gemini-rules-sync`)

Esta skill ejecuta la propagación inteligente de las reglas globales y pautas del agente de desarrollo (`GEMINI.md` / `AGENTS.md`) a todas las plantillas y repositorios de cores del monorepo, conservando la configuración de rutas locales.

## 📁 Rutas de Acceso

- **Script físico:** `[GIT_ROOT]/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js`
- **Endpoint API:** `POST http://localhost:3001/api/git/sync-rules`

## 🛠️ Procedimiento de Uso

1. **Trigger de IA:** `@sincronizar-reglas-ia` o `@sync-rules`.
2. **Propagación Inteligente:**
   - Lee el archivo fuente central `GEMINI.md`.
   - Ejecuta `sync_rules.js` de forma portable (resolviendo 3 niveles hacia arriba la raíz `[GIT_ROOT]`).
   - Conserva los bloques delimitadores `## SECCIÓN 10` a `## SECCIÓN 13` (rutas propias del subproyecto de destino) para que no pierda sus configuraciones locales.
3. **Consolidación:** Notifica el resumen de archivos actualizados, creados y omitidos.
