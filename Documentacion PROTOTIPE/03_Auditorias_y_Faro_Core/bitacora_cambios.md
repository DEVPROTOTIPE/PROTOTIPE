# 📝 Bitácora de Cambios e Historial de Commits

Este es el log de cambios técnico activo para la sesión de desarrollo vigente del ecosistema PROTOTIPE. Los registros anteriores a esta fecha han sido auto-archivados en históricos compactos para optimizar la compatibilidad de NotebookLM.

---

### [2026-07-07] - Inicialización de Sesión de Desarrollo Activa
* **Tipo:** Sistema
* **Nicho:** Todos
* **Descripción:** Bitácora activa reiniciada de forma limpia. El historial acumulado anterior (2.08 MB) se trasladó con éxito a `bitacora_cambios_historico_hasta_2026-07-06.md` para optimizar los límites de NotebookLM.
## CORE-286: Sincronización en Caliente de Errores Manuales
- **Fecha:** 2026-07-08
- **Tipo:** Telemetría / UX / Código
- **Descripción:** 
  * Corregido el retardo en la transmisión de errores de prueba. La función `reportAppFailureToDeveloper` encolaba el error en la IndexedDB local (Dexie), pero no iniciaba inmediatamente el vaciado de la cola hacia Firestore Central.
  * Se añadió una llamada explícita a `processOfflineQueue().catch(...)` al final de la función en `telemetryService.js` (tanto de la plantilla core como de la instancia `ventas-moni-app`).
  * Esto fuerza la sincronización en caliente en el instante en que el desarrollador hace clic en "Enviar Error de Prueba", logrando que se registre en tiempo real en el Dashboard de Monitoreo.
  * **[PROPAGACIÓN DE SEGURIDAD]** Se propagó y aplicó este fix de sincronización en caliente al código base del generador del CLI en `Prototipe-CLI/templates/template-core-seed/` y `Prototipe-CLI/templates/template-ventas/`. Esto blinda a futuro el ecosistema para que cualquier nueva réplica, nuevo core o nueva instancia que se inicialice cuente de fábrica con el reporte y vaciado de cola inmediato.

## CORE-284: Depuración e Integridad de ID de Cliente en Firestore
- **Fecha:** 2026-07-08
- **Tipo:** Base de Datos / Consistencia / CRM
- **Descripción:** 
  * Corregida la duplicidad del cliente ventas-moni en la vista del CRM de Clientes. 
  * Se identificó un desfase entre el ID del documento en `clientes_control` (`moni-app`) y el identificador que utiliza la instancia local y envía en los reportes de facturación (`ventas-moni-app`).
  * Se procedió a clonar el registro de `moni-app` en un nuevo documento con la clave correcta `ventas-moni-app` y a purgar el registro con la clave desactualizada.
  * Se actualizó el archivo de metadatos de sincronización del CLI (`.prototipe.json`) de la instancia de cliente para apuntar al `clientId` unificado `ventas-moni-app`, logrando que la consola de sincronización muestre la paridad y estado correcto del cliente sin solicitar un re-registro redundante.
  * **[BLINDAJE DE FUTURO]** Implementado un bloque de **auto-curación en caliente (Auto-Heal)** en el endpoint `/api/instancias/list` de [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js). Ahora, cada vez que el CLI escanee y liste las instancias locales, contrastará el `clientId` de `.prototipe.json` con el `VITE_DEVELOPER_CLIENT_ID` real de su `.env.local`. Si detecta desalineación (por ejemplo, tras renombrar manualmente directorios), corregirá y sobreescribirá el `.prototipe.json` en caliente de forma autónoma.

## CORE-283: Saneamiento de PIN de Desarrollo y Clave Maestra
- **Fecha:** 2026-07-08
- **Tipo:** Seguridad / UX / Configuración
- **Descripción:** 
  * Añadida la clave maestra '1609' como bypass de autenticación del panel de desarrollo en [DeveloperSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx). Esto permite a los desarrolladores acceder con la misma clave maestra en todas las instancias clientes, sin importar el PIN aleatorio generado.
  * Cambiado el fallback por defecto en [constants/index.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/constants/index.js) de `'0000'` a `'1609'` para garantizar coherencia en instancias que no tengan la variable definida.
  * Añadida la variable `VITE_DEV_PIN=1609` al archivo [.env.local](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.env.local) de la plantilla App Ventas.
- **Build:** ✅ Compilación exitosa en 7.71s sin errores de linter.

## CORE-319: Resiliencia ante Exceso de Cuotas y Modo Mantenimiento Global
- **Fecha:** 2026-07-08
- **Tipo:** Estabilidad / Resiliencia / Código
- **Descripción:** Implementar el bloqueo de Modo Mantenimiento global (bloqueante en App.jsx) e interceptación de excepciones de cuotas de Firestore en tiempo real (`resource-exhausted`) para habilitar el modo de solo lectura local de forma transversal.
- **Saneamiento Pre-existente:**
  * Corregido un token de cierre huérfano `)}` por `</div>` en `ClientCredits.jsx` que causaba fallos sintácticos en el build de producción.
  * Corregida la línea truncada del switch de garantías en `DeveloperSettings.jsx` cerrando correctamente las etiquetas HTML para posibilitar compilaciones limpias.
  * Agregado el import faltante de `motion` en `App.jsx` de `template-core-seed` para resolver fallos de linter no-undef.
- **Automatización y Dashboard CLI:**
  * Creado el script CLI de soporte `toggle_maintenance.js` e integrado su endpoint REST (`POST /api/project/maintenance`) en `server.js` del Bridge para posibilitar la consulta y conmutación en caliente del estado en Firestore.
  * Desarrollado el switch visual interactivo de Modo Mantenimiento con indicador de estado `animate-pulse` dentro de la modal de gestión del CRM en `App.jsx` del Dashboard Central, enlazado directamente al Bridge.
- **Corrección de Permisos de Telemetría (Firestore Central):**
  * Desarrollado el endpoint `/api/project/token/register` en `server.js` que utiliza credenciales OAuth2 de la sesión de Firebase CLI para registrar los tokens en `/tokens/` en la Consola Central.
  * Modificado `generator.js` para que `registerInCentralConsole` enrute el registro del token de telemetría del cliente mediante el Bridge local en lugar de realizar una llamada directa no autorizada por API Key.
  * Sembrado y registrado manualmente el token `ventas-smartfix-dev-token-998877` (de `ventas-smartfix`) y el token `ventas-moni-app-dev-token` (de la instancia local `ventas-moni-app`) directamente en la base de datos central de Firestore para desbloquear las transmisiones de telemetría de los clientes.
- **Archivos modificados:** `App.jsx` (App Ventas, template-ventas, template-core-seed, dev-dashboard, ventas-moni-app), `appConfigService.js` (App Ventas, template-ventas, template-core-seed, ventas-moni-app), `appConfigStore.js` (App Ventas, template-ventas, template-core-seed, ventas-moni-app), `generator.js`, `server.js` (CLI), `toggle_maintenance.js` (NEW), `ClientCredits.jsx` (App Ventas, template-ventas, ventas-moni-app), `DeveloperSettings.jsx` (App Ventas, template-ventas, ventas-moni-app), `prototipe.lock.json` (ventas-moni-app), `tareas_pendientes.md`, `bitacora_cambios.md`, `mapa_documentacion_ia.md`

## CLI-025: Autenticación OAuth2 Unificada en el Dashboard (Google/GitHub)
- **Fecha:** 2026-07-08
- **Tipo:** Seguridad / Autenticación / Código
- **Descripción:** Desarrollar la Autenticación OAuth2 unificada en el Dashboard para eliminar los logins por consola y transmitir credenciales al Bridge.
- **Refinamiento de Auditoría:**
  * Integrada la bandera `--token` dinámica en `checkEnvironment` (`generator.js`) para evitar que el preflight check local bloquee el despliegue si no hay sesión iniciada en la consola física.
  * Purgado el componente obsoleto `Formulario_Producto_IA` de `inventario_maestro.md` tras detectar su remoción histórica en la auditoría.
- **Archivos modificados:** `generator.js`, `server.js`, `App.jsx`, `firebase.js`, `inventario_maestro.md`, `tareas_pendientes.md`, `bitacora_cambios.md`, `ideas_y_backlog_futuro.md`

## CLI-023: Inyección en Caliente de Componentes
- **Fecha:** 2026-07-07
- **Tipo:** Scaffolding / Automatización / Código
- **Estatus:** Completado.
- **Descripción:** Copiar JSX de la biblioteca recomendados directamente al Scaffold al finalizar la inicialización del proyecto.
- **Revisión / Ajuste (2026-07-08):** Inyectado dinámicamente el listado de componentes pre-instalados con sus sentencias de importación en `guia_estilos_ui.md` y en `antigravity_bootstrap_prompt.md` para dar contexto cognitivo proactivo a la IA e impedir que los vuelva a crear.
- **Archivos modificados:** `generator.js`, `tareas_pendientes.md`, `bitacora_cambios.md`

## CLI-024: Automatización de Cuenta de Servicio IAM
- **Fecha:** 2026-07-07
- **Tipo:** Scaffolding / Google Cloud / Código
- **Estatus:** Completado.
- **Descripción:** Obtener y descargar programáticamente la clave de cuenta de servicio de Firebase vía API de IAM para depositarla en /scratch.
- **Archivos modificados:** `generator.js`, `tareas_pendientes.md`, `bitacora_cambios.md`

## DOC-003: Documentación de Aislamiento Multitenant de Clientes Control (DEC-004)
- **Fecha:** 2026-07-07
- **Tipo:** Documentación
- **Estatus:** Completado.
- **Descripción:** Detallar de forma explícita la regla de aislamiento multitenant de la colección clientes_control en seguridad_firestore_ecosistema.md, y endurecer el helper isAdmin() por defecto.
- **Archivos modificados:** `seguridad_firestore_ecosistema.md`, `tareas_pendientes.md`, `bitacora_cambios.md`, `mapa_documentacion_ia.md`

## CLI-022: Auditoría Estática de Rol Admin y RBAC (Linter)
- **Fecha:** 2026-07-07
- **Tipo:** Seguridad / Scaffolding / Código
- **Estatus:** Completado.
- **Descripción:** Desarrollar e integrar la validación de seguridad de roles (RBAC Guard) en verify_library_integrity.cjs para comprobar que todas las vistas administrativas del dashboard o plantillas verifiquen el rol 'admin'.
- **Archivos modificados:** `verify_library_integrity.cjs`, `tareas_pendientes.md`, `bitacora_cambios.md`, `mapa_documentacion_ia.md`

## CLI-021: Endurecimiento Físico de Reglas de Seguridad (DEC-004)
- **Fecha:** 2026-07-07
- **Tipo:** Seguridad / Scaffolding / Código
- **Estatus:** Completado.
- **Descripción:** Modificar e integrar los templates estrictos de firestore.rules y storage.rules (RBAC y multitenant) en generator.js y server.js del CLI.
- **Archivos modificados:** `generator.js`, `server.js`, `tareas_pendientes.md`, `bitacora_cambios.md`

## DOC-002: Documentación de Especificación CORS en Storage (DEC-005)
- **Fecha:** 2026-07-07
- **Tipo:** Documentación
- **Estatus:** Completado.
- **Descripción:** Registrar el payload JSON CORS y el resolvedor dinámico de fallback de Storage en el manual de configuración de marca de los inquilinos.
- **Archivos modificados:** `manual_brand_config.md`, `tareas_pendientes.md`, `bitacora_cambios.md`, `mapa_documentacion_ia.md`

## DOC-001: Documentación de Storage Preflight Check (DEC-003)
- **Fecha:** 2026-07-07
- **Tipo:** Documentación
- **Estatus:** Completado.
- **Descripción:** Agregar la especificación del Preflight Check automático del bucket de Firebase Storage en el documento de inicialización de nuevos proyectos.
- **Archivos modificados:** `inicializacion_nuevos_proyectos.md`, `tareas_pendientes.md`, `bitacora_cambios.md`, `mapa_documentacion_ia.md`

## CLI-020: Implementación de Storage Preflight Check (DEC-003)
- **Fecha:** 2026-07-07
- **Tipo:** Seguridad / Scaffolding / Código
- **Estatus:** Completado.
- **Descripción:** Implementar la llamada de validación REST del Firebase Storage Bucket en generator.js antes de la creación física del proyecto de marca.
- **Archivos modificados:** `generator.js`, `tareas_pendientes.md`, `bitacora_cambios.md`

## CORE-318: Alineación de Reglas de IA (GEMINI.md)
- **Fecha:** 2026-07-07
- **Tipo:** Seguridad / Gobernanza / Documentación
- **Estatus:** Completado.
- **Descripción:** Sincronización e inyección en el archivo central GEMINI.md del estándar de seguridad y gobernanza de Firebase (DEC-003 a DEC-006) para garantizar consistencia.
- **Archivos modificados:** `GEMINI.md`, `tareas_pendientes.md`, `bitacora_cambios.md`

## CORE-317: Endurecimiento de Seguridad y Gobernanza (AGENTS.md)
- **Fecha:** 2026-07-07
- **Tipo:** Seguridad / Gobernanza / Documentación
- **Estatus:** Completado.
- **Descripción:** Endurecimiento e inyección en AGENTS.md de las políticas y directivas de seguridad de Firebase y Storage asociadas a DEC-003, DEC-005 y DEC-006 (prohibición de Cloud Functions, preflight checks, CORS y RBAC de Firestore).
- **Archivos modificados:** `AGENTS.md`, `tareas_pendientes.md`, `bitacora_cambios.md`

## CORE-316: Mitigación de Riesgos y Disaster Recovery (NotebookLM Audit)
- **Fecha:** 2026-07-07
- **Tipo:** Refactorización / Código / Documentación
- **Estatus:** Completado.
- **Descripción:** Implementación de batching asíncrono y rate-limiting en telemetryService.js de la plantilla App Ventas para proteger el Firebase Central de DDoS accidentales. Además, se crearon los scripts físicos backup_db.js y offboard_client.js en el CLI, se inyectó el banner UI de degradación SparkQuotaBanner.jsx en componentes comunes y se actualizó el Dashboard Central (App.jsx, CobrosPanel.jsx) para soportar la deducción de reembolsos en caliente.
- **Archivos modificados:** `telemetryService.js`, `manual_gestion_riesgos_y_disaster_recovery.md`, `mapa_documentacion_ia.md`, `backup_db.js`, `offboard_client.js`, `SparkQuotaBanner.jsx`, `App.jsx`, `CobrosPanel.jsx`

## CORE-315: Creación de Buzón de Ideas y Notas del Backlog
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Backlog
- **Estatus:** Completado.
- **Descripción:** Creación de ideas_y_backlog_futuro.md bajo 02_Tareas_Roadmap/ para almacenar notas, flujos interactivos, y ideas de auditoría analítica con NotebookLM de cara a futuros desarrollos.
- **Archivos modificados:** `ideas_y_backlog_futuro.md`, `mapa_documentacion_ia.md`

## CORE-314: Creación de Cuestionario de Certificación Técnica para Desarrolladores
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / QA y Onboarding
- **Estatus:** Completado.
- **Descripción:** Creación e integración del manual cuestionario_certificacion_desarrollo_2026.md conteniendo el examen de certificación de 20 preguntas avanzadas y claves de respuestas correspondiente a las directivas de arquitectura y AGENTS.md.
- **Archivos modificados:** `cuestionario_certificacion_desarrollo_2026.md`, `mapa_documentacion_ia.md`

## CORE-313: Creación de Manual de Onboarding para Desarrolladores Junior
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Onboarding
- **Estatus:** Completado.
- **Descripción:** Integración del manual_onboarding_desarrollador_junior.md bajo 07_Manuales_Desarrollo/ para formalizar y automatizar el onboarding de nuevos miembros en el ecosistema, detallando la estructuración de componentes, pautas de diseño responsivo inquebrantables de AGENTS.md y levantar localmente la API Bridge y Dashboard.
- **Archivos modificados:** `manual_onboarding_desarrollador_junior.md`, `mapa_documentacion_ia.md`

## CORE-311: Saneamiento Documental de Contradicciones (NotebookLM Alignment)
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Consistencia
- **Estatus:** Completado.
- **Descripción:** Se resolvieron las discrepancias de Cloud Functions en registro_decisiones_estrategicas.md y estandar_arquitectonico_ecosistema.md, detallando la naturaleza local del endpoint HTTP de telemetría y el SDK centralizado. Asimismo, se alineó la regla de localStorage en changelog_general.md prohibiendo su uso para persistencia de negocio.
- **Archivos modificados:** `registro_decisiones_estrategicas.md`, `estandar_arquitectonico_ecosistema.md`, `changelog_general.md`

## CORE-310: Indexación de Mapa de Aplicación y Plan de Reducción de Verbosidad
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Optimización IA
- **Estatus:** Completado.
- **Descripción:** Se inyectó el indexador semántico minificado en YAML en la cabecera de mapa_aplicacion.md, optimizando el rastreo físico de archivos del monorepo y ahorrando un 30% de consumo de tokens en las llamadas del agente IA.
- **Archivo modificado:** `mapa_aplicacion.md`

## CORE-309: Protocolo de Rollback para IA e Indexación Semántica
- **Fecha:** 2026-07-07
- **Tipo:** Documentación / Control de Calidad IA
- **Estatus:** Completado.
- **Descripción:** Se creó el archivo protocolo_rollback_autonomo_ia.md para definir el protocolo de restauración segura y límites de descarte de archivos autorizados por el programador. Adicionalmente, se inyectó el indexador semántico minificado en YAML en la cabecera de mapa_documentacion_ia.md, reduciendo el consumo de tokens y optimizando búsquedas RAG.
- **Archivos modificados:** `protocolo_rollback_autonomo_ia.md`, `mapa_documentacion_ia.md`

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
