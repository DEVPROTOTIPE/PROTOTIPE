# LEEME — Paquete Piloto: Migración Claude Code

Este paquete recopila de forma exacta y estructurada el contexto necesario para transferir el entorno de desarrollo y asistencia de IA desde **Antigravity (Gemini)** hacia **Claude Code**.

## Información General

- **Tema:** Migración del Entorno de Desarrollo a Claude Code
- **Fecha de Generación:** 2026-07-13T19:03:16Z (UTC)
- **Ruta del Manifiesto:** `Documentacion PROTOTIPE/00_Continuidad/selections/migracion-claude-code.selection.json`

## Fuentes Utilizadas

Este paquete compila las secciones críticas de las siguientes fuentes versionadas en Git:
- **Fuentes Canónicas de Continuidad:**
  - `Documentacion PROTOTIPE/00_Continuidad/canonical/00_REANUDAR_PROTOTIPE_CONTINUIDAD_2026-07-13.md`
  - `Documentacion PROTOTIPE/00_Continuidad/canonical/Auditoria_Integral_y_Roadmap_PROTOTIPE_2026-07-13.md`
  - `Documentacion PROTOTIPE/00_Continuidad/canonical/Plan_Maestro_Estabilizacion_y_Migracion_Claude_Code_PROTOTIPE.md`
- **Reglas del Entorno:**
  - `.agents/AGENTS.md` (Gobernanza del monorepo, integridad y protocolos de rollback y no destrucción)
  - `Documentacion PROTOTIPE/04_Estandares_y_Skills/protocolo_colaboracion_ia.md` (Bucle de revisión colaborativa cerrada y prompt maestro)
  - `Documentacion PROTOTIPE/04_Estandares_y_Skills/protocolo_rollback_autonomo_ia.md` (Protocolo de contingencia y rollback seguro)
  - `Documentacion PROTOTIPE/04_Estandares_y_Skills/resumen_reglas_y_estandares_desarrollo.md` (Resumen de reglas de desarrollo)
  - `Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_contribucion_desarrollador_monorepo.md` (Workflow de contribución Git y ramas)
- **Instrucciones Históricas (GEMINI.md):**
  - `Prototipe-CLI/GEMINI.md` (Instrucciones canónicas del CLI)
  - `Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md` (Instrucciones con deltas específicos de bitácoras)

## Declaración de Seguridad y Limitaciones

- **Escaneo de Datos Sensibles:** El paquete ha sido procesado mediante un detector sintáctico estático contra credenciales, tokens y llaves conocidas. Esta validación no garantiza la ausencia total de elementos privados, por lo que es obligatorio realizar una inspección humana final.
- **Sin Código Productivo:** No incluye lógica de negocio del core ni bases de datos de producción de clientes.
- **Propósito Normativo:** Proporciona un marco de decisiones de diseño y continuidad; no ejecuta código en sí mismo.

## Instrucciones de Carga en Claude Code

En una nueva conversación de chat (por ejemplo, al iniciar con Claude Code), cargue únicamente:
1. El archivo único consolidado: `PAQUETE_CONTEXTO_MIGRACION_CLAUDE_CODE.md`
2. El archivo de continuidad mínimo: `01_CONTEXTO_MINIMO.md`

Esto proporcionará al modelo el contexto completo y las reglas del proyecto sin necesidad de procesar los 12 consolidados de documentación completos.
