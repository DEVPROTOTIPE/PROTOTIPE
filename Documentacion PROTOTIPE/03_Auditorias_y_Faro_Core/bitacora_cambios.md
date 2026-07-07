# 📝 Bitácora de Cambios e Historial de Commits

Este es el log de cambios técnico activo para la sesión de desarrollo vigente del ecosistema PROTOTIPE. Los registros anteriores a esta fecha han sido auto-archivados en históricos compactos para optimizar la compatibilidad de NotebookLM.

---

### [2026-07-07] - Inicialización de Sesión de Desarrollo Activa
* **Tipo:** Sistema
* **Nicho:** Todos
* **Descripción:** Bitácora activa reiniciada de forma limpia. El historial acumulado anterior (2.08 MB) se trasladó con éxito a `bitacora_cambios_historico_hasta_2026-07-06.md` para optimizar los límites de NotebookLM.

## CORE-286: Corrección de Vulnerabilidad CORS en Bridge CLI (server.js)
- **Fecha:** 2026-07-07
- **Tipo:** Seguridad / Bug Fix
- **Severidad:** Media — explotable solo desde el mismo equipo del desarrollador
- **Descripción:** Se reemplazó `app.use(cors())` sin restricciones por una whitelist explícita de orígenes (`CORS_ALLOWED_ORIGINS`) que solo permite peticiones browser desde `localhost:5174` y `localhost:5173` (dev-dashboard). Las peticiones server-to-server sin header `Origin` (PowerShell, Node, curl) siguen siendo permitidas para no romper el linter de integridad ni otras automatizaciones internas.
- **Archivo modificado:** `Prototipe-CLI/server.js` — L261 → L263-L277
- **Riesgo anterior:** Cualquier sitio web abierto en el browser del desarrollador podía hacer peticiones cross-origin al Bridge y ejecutar operaciones críticas (crear proyectos, sincronizar clientes, leer configuraciones).
- **Nota:** El Bridge requiere reinicio manual para aplicar el cambio en memoria.

## CORE-285: Saneamiento y Auto-archivado de Bitácoras con Compactación de Inventario
- **Fecha:** 2026-07-07
- **Tipo:** Funcionalidad / Mejora
- **Descripción:** Optimización integral del consolidador de NotebookLM y del almacenamiento del monorepo. Se implementó el soporte multibitácora en `server.js` para consolidar históricos en memoria, se inyectó la lógica de auto-archivado automático por tamaño (>150 KB) con auto-registro en `mapa_documentacion_ia.md`, y se rediseñó el consolidador para generar un catálogo de existencias en components y módulos en vez de código pesado. Adicionalmente, se solucionó el bug de metadatos calientes en `verify_library_integrity.cjs` que marcaba permanentemente como modificado `sync_manifest.json` en Git. Finalmente, se ejecutó la auditoría documental depurando 5 alertas reales: (1) Corrección de WhatsApp Outbox en `changelog_general.md`. (2) Eliminación de duplicados de telemetría y seguimiento en `09_Modulos_Completos` y `Formularios_y_UI`. (3) Consolidación y renombrado del manual `manual_creacion_desde_cero.md` para el Core Seed. (4) Remoción de propuestas de commits y dashboard obsoletas. (5) Corrección de enlaces rotos en `README.md` de la biblioteca y mapa de documentación.
- **Archivos afectados:** `Prototipe-CLI/server.js`, `Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/Scripts_Auxiliares/consolidar_para_notebook.py`, `Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`, `Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs`, `Documentacion PROTOTIPE/01_Control_Versiones/changelog_general.md`, `Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`, `Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`, `Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_creacion_desde_cero.md`
