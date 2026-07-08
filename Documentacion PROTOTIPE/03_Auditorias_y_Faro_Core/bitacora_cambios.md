# 📝 Bitácora de Cambios e Historial de Commits

Este es el log de cambios técnico activo para la sesión de desarrollo vigente del ecosistema PROTOTIPE. Los registros anteriores a esta fecha han sido auto-archivados en históricos compactos para optimizar la compatibilidad de NotebookLM.

---

### [2026-07-07] - Inicialización de Sesión de Desarrollo Activa
* **Tipo:** Sistema
* **Nicho:** Todos
* **Descripción:** Bitácora activa reiniciada de forma limpia. El historial acumulado anterior (2.08 MB) se trasladó con éxito a `bitacora_cambios_historico_hasta_2026-07-06.md` para optimizar los límites de NotebookLM.

## CORE-295: Saneamiento de Placeholders - Guía de Estilos de UI Reales de App Ventas
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Saneamiento
- **Descripción:** Se reemplazó la plantilla vacía autogenerada de `guia_estilos_ui.md` en el Core de App Ventas por las directivas de diseño físico reales: variables de color semánticas HSL (primaria, secundaria, acento, fondos y bordes para light/dark mode), mapeo de componentes atómicos del framework (CustomSelect y useAlertConfirm) y convenciones estéticas premium de micro-animaciones y glassmorphism.
- **Archivo modificado:** `Plantillas Core/App Ventas/Documentacion App Ventas/guia_estilos_ui.md`


## CORE-294: Saneamiento de Placeholders - Restricciones Técnicas Reales de App Ventas
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Saneamiento
- **Descripción:** Se reemplazó la plantilla vacía autogenerada de `restricciones_tecnicas.md` en el directorio de documentación del Core de App Ventas por las directivas técnicas y de diseño físico reales: desacoplamiento obligatorio de persistencia Firebase en Repositorios (Clean Architecture), prohibición de selectores nativos, reseteo de spinners numéricos CSS, contraste de botones en Light Mode y prevención de desbordamientos adaptativos de tablas y layouts en móviles.
- **Archivo modificado:** `Plantillas Core/App Ventas/Documentacion App Ventas/restricciones_tecnicas.md`


## CORE-293: Saneamiento de Placeholders - Contexto de Negocio Real de App Ventas
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Saneamiento
- **Descripción:** Se reemplazó la plantilla vacía autogenerada de `contexto_negocio.md` en el directorio de documentación del Core de App Ventas por las directivas de negocio reales: control de créditos/fiados, límites de deudor, lógica de apertura y arqueo de turnos de caja, actualización atómica de stock de productos y KPIs de ticket medio y rentabilidad neta.
- **Archivo modificado:** `Plantillas Core/App Ventas/Documentacion App Ventas/contexto_negocio.md`


## CORE-292: Sincronización del Mapa Semántico de Documentación de la IA
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Consistencia
- **Descripción:** Se actualizó `mapa_documentacion_ia.md` (Sección 5) para reflejar la unificación del sistema de precios y licenciamiento con las variables del SDK de Firestore (`billingMode`), garantizando que la IA identifique con exactitud los parámetros técnicos asociados a las modalidades de cobro comerciales.
- **Archivo modificado:** `Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`


## CORE-291: Unificación de Terminología de Cobros con Parámetros de Base de Datos
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Consistencia
- **Descripción:** Se actualizó `sistema_precios_licenciamiento.md` (Sección 2.2) para integrar los valores exactos requeridos por la base de datos de Firestore en el campo `billingMode` (`percentage`, `fixed_per_service` y `flat_monthly`) al lado de cada descripción de modalidad comercial, eliminando la discrepancia semántica y evitando configuraciones de entorno desalineadas.
- **Archivo modificado:** `Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/sistema_precios_licenciamiento.md`


## CORE-290: Documentación del Soporte de Entorno Dual en Telemetría del Core
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Consistencia
- **Descripción:** Se actualizó `manual_y_auditoria_completa_prototipe_2026.md` (Sección 7.2) para documentar el rol de la variable `VITE_DEVELOPER_CENTRAL_API_KEY` y las credenciales centrales. Se aclaró que no se trata de una discrepancia de inyección del generador del CLI, sino de una funcionalidad dual: los servicios de telemetría e informes comisionales del Core toleran variables vacías (modo local standalone) y conmutan a valores públicos por defecto hardcodeados de Firebase para resolver la conexión en producción sin intervenciones manuales del operador.
- **Archivo modificado:** `Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_y_auditoria_completa_prototipe_2026.md`


## CORE-289: Remoción de Cloud Function Legacy de Telemetría (DEC-006 Alignment)
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Arquitectura
- **Descripción:** Se desvió la variable `VITE_DEVELOPER_TELEMETRY_ENDPOINT` que apuntaba a una Cloud Function de Google Cloud Run en producción (`reporttelemetry`) para redirigirla hacia el Bridge local (`http://localhost:3001`), alineando la inyección al estándar serverless de coste $0 USD. Esta variable solo se mantiene para pasar el validador del modal de diagnóstico del desarrollador, mientras que la transmisión real de telemetría de facturación de las apps sigue operando directamente a Firestore Central vía SDK sin verse afectada.
- **Archivos modificados:** `Prototipe-CLI/generator.js` — L1444, `Prototipe-CLI/server.js` — L8987


## CORE-288: Unificación de Autenticación de Administradores en Auditoría Crítica
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Consistencia
- **Descripción:** Se modificó `auditoria_critica_ecosistema_2026.md` para corregir la propuesta de autenticación de roles de administrador. Se reemplazó la colección obsoleta `/admins/` por la validación real en la colección de usuarios `/users/{uid}` con `role == 'admin'`, alineando la documentación técnica de seguridad de Firestore con el código de producción.
- **Archivo modificado:** `Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_critica_ecosistema_2026.md`


## CORE-287: Unificación de Tasas Comisionales en Informe de Investigación
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Consistencia
- **Descripción:** Se modificó `informe_investigacion_ecosistema_2026.md` para unificar el rango de comisiones de venta de PROTOTIPE a **1% - 5%** en la tabla comparativa de competidores (línea 126), corrigiendo el rango desactualizado de 0.5% - 2% y alineándolo al sistema de precios oficial.
- **Archivo modificado:** `Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/informe_investigacion_ecosistema_2026.md`


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
