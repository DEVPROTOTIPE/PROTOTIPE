# 📝 Bitácora de Cambios e Historial de Commits

Este es el log de cambios técnico activo para la sesión de desarrollo vigente del ecosistema PROTOTIPE. Los registros anteriores a esta fecha han sido auto-archivados en históricos compactos para optimizar la compatibilidad de NotebookLM.

---

### [2026-07-07] - Inicialización de Sesión de Desarrollo Activa
* **Tipo:** Sistema
* **Nicho:** Todos
* **Descripción:** Bitácora activa reiniciada de forma limpia. El historial acumulado anterior (2.08 MB) se trasladó con éxito a `bitacora_cambios_historico_hasta_2026-07-06.md` para optimizar los límites de NotebookLM.

## CORE-308: Potenciación del Diagrama de Flujo de Arquitectura y Mermaid
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Diseño Visual
- **Estatus:** Completado.
- **Descripción:** Se expandió la documentación de arquitectura de diagrama_flujo_ecosistema.md. Se agregaron 6 diagramas de flujo interactivos en formato Mermaid para documentar en detalle el aprovisionamiento de clientes, la sincronización downstream, la inyección dinámica de componentes, la transmisión dual-channel de telemetría, preventa inteligente con briefing e IA y scripts preventivos de Git, alineando la nomenclatura técnica al glosario unificado.
- **Archivo modificado:** `diagrama_flujo_ecosistema.md`

## CORE-307: Unificación Léxica y Estandarización de Glosario en Manuales
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Consistencia
- **Estatus:** Completado.
- **Descripción:** Se ejecutó la búsqueda y reemplazo masivo del glosario obsoleto en manuales del programador y archivos de reglas centrales del monorepo, unificando términos inconsistentes (Consola Central, Developer Cockpit, servior CLI, playgrounds) por la nomenclatura estandarizada (Dashboard Central, API Bridge, Sandbox de Componentes, Instancias de Clientes).
- **Archivos modificados:** `AGENTS.md`, `manual_contribucion...`, `diagrama_flujo...`, `diccionario_tecnico...`, `manual_y_auditoria...`


## CORE-306: Sincronización Desatendida de Recursos Firebase en el CLI
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Automatización
- **Descripción:** Se estabilizaron y securizaron las llamadas al Firebase CLI en `generator.js` y `server.js` del CLI de Prototype. Se inyectó el parámetro `--token` leyendo automáticamente de la variable de entorno `process.env.FIREBASE_TOKEN` para permitir que el despliegue automático de hosting, reglas e índices se ejecute de forma desatendida y segura sin requerir interacción humana en la terminal del servidor o entornos de despliegue continuo.
- **Archivos modificados:** `Prototipe-CLI/generator.js`, `Prototipe-CLI/server.js`


## CORE-305: Integración de Configuración de Pasarela en Ajustes de Desarrollador
- **Fecha:** 2026-07-07
- **Tipo:** Implementación / Panel de Control
- **Descripción:** Se agregaron los controles interactivos para activar/desactivar la pasarela de pagos en línea e indexar el procesador de pago local (Bold, Wompi, Mercado Pago) en el formulario de configuración de módulos de la pestaña Developer (`DeveloperSettings.jsx`) en App Ventas, sincronizando los cambios en la base de datos de configuración del cliente de Firebase.
- **Archivo modificado:** `Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`


## CORE-304: Implementación de Módulo B2C de Créditos, Abonos Online y Extractos PDF
- **Fecha:** 2026-07-07
- **Tipo:** Implementación / B2C
- **Descripción:** Se completó el Portal de Créditos del Cliente Final (B2C) en `ClientCredits.jsx` en App Ventas. Se integró la opción de abonos en línea seguros por tarjeta/PSE vinculándola al simulador interactivo de pasarelas, se inyectó el recálculo dinámico de saldos locales y se habilitó la descarga en caliente de extractos financieros en formato PDF compilados dinámicamente con jsPDF.
- **Archivo modificado:** `Plantillas Core/App Ventas/src/pages/client/ClientCredits.jsx`


## CORE-303: Integración Elástica de Pasarelas de Pago Online en Catálogo Base
- **Fecha:** 2026-07-07
- **Tipo:** Implementación / E-Commerce
- **Descripción:** Se integró el soporte de pagos en línea (Bold, Wompi, Mercado Pago) en el catálogo E-Commerce de App Ventas. Se agregó `PAYMENT_METHODS.ONLINE` ('online') a las constantes base y se modificó `CheckoutModal.jsx` para mostrar condicionalmente la opción si está activa en ajustes, agregando un flujo de confirmación final con un simulador interactivo de pasarela Bold/PSE y condicionando el aviso de WhatsApp a la confirmación de la transacción.
- **Archivos modificados:** `Plantillas Core/App Ventas/src/constants/index.js`, `Plantillas Core/App Ventas/src/components/client/checkout/CheckoutModal.jsx`


## CORE-302: Consistencia Documental — Declaración del Patrón de Core Único Flexible
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Arquitectura
- **Descripción:** Se modificó `ESTADO_REAL_PROTOTIPE_2.md` (Sección 3) para documentar y justificar la decisión arquitectónica de utilizar una sola plantilla de Core maestro unificado (`template-ventas`) con feature flags (`niche.json`) en lugar de empaquetar plantillas físicas separadas para restaurante, taller y servicios, evitando la duplicidad innecesaria de código (DRY) y facilitando el mantenimiento y despliegue del CLI.
- **Archivo modificado:** `Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/ESTADO_REAL_PROTOTIPE_2.md`


## CORE-301: Habilitación Interactiva de Sandbox de Programador de Rutas (Delivery)
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Playground
- **Descripción:** Se actualizó `ProgramadorRutasDomicilioSandbox.jsx` para alinear su arquitectura con el estándar de sandboxes de PROTOTIPE. Se movieron los controles del formulario al panel lateral izquierdo (distancia en km, repartidor asignado, dirección e inicio de ruta) y se transformó la visualización derecha en un cockpit de despacho con un stepper de progreso (con z-index y máscara corregidos) y un radar de ruta animado en tiempo real.
- **Archivo modificado:** `Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ProgramadorRutasDomicilioSandbox.jsx`


## CORE-300: Habilitación Interactiva de Sandbox de Selector de Mapa (Leaflet)
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Playground
- **Descripción:** Se transformó el sandbox estático heredado `LeafletMapPickerSandbox.jsx` en una simulación geográfica premium e interactiva. Se desarrollaron controles dinámicos de latitud, longitud, nivel de zoom y marcadores temáticos, integrando una cuadrícula cartográfica vectorial manipulable mediante clics con geocodificación simulada que actualiza las coordenadas geográficas en tiempo real.
- **Archivo modificado:** `Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/LeafletMapPickerSandbox.jsx`


## CORE-299: Habilitación Interactiva de Sandbox de Generación PDF
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Playground
- **Descripción:** Se transformó el sandbox estático heredado `generacion_pdfSandbox.jsx` en un playground funcional e interactivo. Se agregaron controles dinámicos para configurar id de instancia, periodo de cobro, total de ventas, tasas comisionales (1-5%) y estados de pago, renderizando una previsualización de la factura y conectando el botón de acción con el servicio real `pdfService.js` para compilar y descargar PDFs reales con jsPDF desde el navegador.
- **Archivo modificado:** `Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/generacion_pdfSandbox.jsx`


## CORE-298: Endurecimiento de Reglas de Seguridad en Caliente para Nichos Transaccionales
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Seguridad
- **Descripción:** Se implementó la lógica de endurecimiento en caliente de `firestore.rules` al aprovisionar nuevos clientes a partir del generador de CLI. Si el nicho seleccionado es transaccional (POS, E-commerce, Inventario) o el flag `enablePos` está activo, se inyectan dinámicamente las reglas estrictas de seguridad para proteger las colecciones `/products/`, `/cajas/` y la configuración de primer inicio `/config/settings`, restringiéndolas únicamente a usuarios con rol de administrador en `/users/{uid}`.
- **Archivo modificado:** `Prototipe-CLI/generator.js`


## CORE-297: Inyección de Componentes Atómicos UI en Semilla Base
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Semilla Base
- **Descripción:** Se crearon y agregaron los componentes atómicos comunes `Button.jsx` y `Modal.jsx` dentro del directorio `src/components/ui/` de la plantilla de inicio `template-core-seed`. Estos componentes resuelven la brecha de controles básicos parametrizados y están integrados de forma nativa con el sistema de temas (colores HSL y bordes dinámicos `var(--radius-base)`) del cliente, garantizando la homogeneidad del diseño visual premium.
- **Archivos creados:** `Prototipe-CLI/templates/template-core-seed/src/components/ui/Button.jsx`, `Prototipe-CLI/templates/template-core-seed/src/components/ui/Modal.jsx`


## CORE-296: Resolución de Brecha de Autonomía - UI Shell Base en Semilla Base
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Semilla Base
- **Descripción:** Se actualizó `MainLayout.jsx` en la plantilla `template-core-seed` para resolver la brecha de UI Shell en blanco. Se estructuró un menú lateral funcional con Dashboard (icono `LayoutDashboard`) y Ajustes (icono `Settings`) y se añadieron comentarios instructivos en el código que guían al desarrollador o IA sobre cómo extender las secciones del menú lateral en cascada con el enrutador reactivo.
- **Archivo modificado:** `Prototipe-CLI/templates/template-core-seed/src/layouts/MainLayout.jsx`


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
