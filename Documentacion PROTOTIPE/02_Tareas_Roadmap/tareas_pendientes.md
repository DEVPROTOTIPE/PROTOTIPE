# Control de Tareas y Estado de Implementación (Roadmap de Prototype CLI)

Este documento registra de forma dinámica las tareas del motor **Prototype CLI** y los scripts de soporte y automatización del ecosistema.

---

* **[x] ~~Tarea CORE-093: Optimización, Sanitización y Visualización de Diferencias en Sincronización de Cores (CORE-093)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalización: 2026-06-26
  - Descripción: Se optimizó y refactorizó el motor de sincronización de plantillas Core (`performCoreSync`) en la CLI para realizar E/S de forma concurrente con `Promise.all` al sanitizar archivos. Se restringió la sustitución del token `packageName` a `package.json`, protegiendo componentes de React y estilos CSS de sobreescrituras codiciosas. Se habilitó la sanitización nativa de archivos de reglas Firebase (`.rules`) y se inyectaron exclusiones recursivas. Adicionalmente, se corrigieron bugs críticos en `generator.js` (preflight check con error de análisis HTML 404 de Google) y `worker_create_project.js` (import dinámico ESM de Playwright en Windows y timeouts causados por telemetría). Finalmente, se implementó el endpoint `GET /api/cores/:clave/drift` para comparar semánticamente en memoria el Core con la plantilla y se integró en `CoreCard.jsx` del Dashboard un modal interactivo premium que muestra la tasa de paridad (0-100%), listado de archivos faltantes y acordeones dinámicos con el diff de líneas coloreadas.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [Prototipe-CLI/worker_create_project.js](file:///d:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [MODIFY]

* **[x] ~~Tarea CORE-092: Blindaje a Futuro de Cores e Instancias (Firebase Rules & Config Integrity)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalización: 2026-06-26
  - Descripción: Se implementó un blindaje de paridad y autocuración para las reglas de Firebase y configuraciones críticas en el CLI Server y generador. Modificado `/api/register-core` para provisionar archivos Firebase base completos (`firebase.json`, `firestore.rules`, `storage.rules`, `firestore.indexes.json`) al crear nuevos Cores. Modificado `/api/project/firebase-rules/drift-global` para autocurar archivos faltantes en el Core local (descargando las reglas de la nube o usando plantillas restrictivas por defecto). Se dinamizó completamente `/api/project/fix/rules` leyendo `.prototipe.json` para resolver el Core dinámicamente en lugar del acoplamiento rígido con "App Ventas", extendiendo la restauración a reglas de almacenamiento y de índices. Finalmente, se actualizaron las reglas por defecto en `generator.js` con esquemas restrictivos seguros por defecto. Asimismo, se corrigió un error crítico `ReferenceError: dir is not defined` en el endpoint `/api/project/drift/global` que causaba que el cálculo de drift global fallara al intentar evaluar instancias.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CORE-091: Alineación e Integridad de Telemetría Central y Ping-Pong en Cores e Instancias~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalización: 2026-06-26
  - Descripción: Se solucionó una desincronización física (drift) que degradaba la conexión en tiempo real entre las instancias cliente y el Dashboard Central. Se inyectó `centralFirebaseService.js` en el Core `App Ventas/` y se actualizó `useAppConfigSync.js` con el listener de instantáneas de 176 líneas en el Core y la instancia cliente `ventas-moni-app`, restaurando el canal de ping-pong y sistemaAlerta. Validado localmente con sincronización y build completo.
  - Archivos: [Plantillas Core/App Ventas/src/services/centralFirebaseService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/centralFirebaseService.js) [NEW], [Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js) [MODIFY]

* **[x] ~~Tarea CORE-090: Blindaje a Futuro contra Caché Persistente en Despliegues de Hosting PWA (CORE-090)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalización: 2026-06-26
  - Descripción: Se implementó un blindaje integral a nivel de todo el ecosistema para solucionar la persistencia de caché en Firebase Hosting. Se inyectaron reglas de cabeceras HTTP (`Cache-Control`) para servir sin caché los archivos de control (`index.html`, `sw.js`, `firebase-messaging-sw.js`, manifiestos) y con caché inmutable de larga duración los assets estáticos con hash (`/assets/**`), tanto en `firebase.json` del Core de Ventas como en la instancia del cliente. Se estandarizó el registro del Service Worker en `main.jsx` de todas las plantillas (`App Ventas`, `template-ventas`, `template-core-seed`) y de la instancia cliente con un callback y un listener de `controllerchange` en el cliente para forzar una recarga suave automática, protegido contra recargas en primera carga. Finalmente, se inyectaron rutinas automáticas de auto-curación de estas cabeceras tanto en el aprovisionador del CLI (`generator.js`) como en el pipeline de pre-flight del servidor CLI (`server.js`).
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [Plantillas Core/App Ventas/firebase.json](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firebase.json) [MODIFY], [Plantillas Core/App Ventas/src/main.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/main.jsx) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/firebase.json](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/firebase.json) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/src/main.jsx](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/main.jsx) [MODIFY]

* **[x] ~~Tarea CORE-089: Pre-flight Validation Pipeline y Blindaje de Integridad de Sincronización en CLI Server (CORE-089)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalización: 2026-06-26
  - Descripción: Se implementó un robusto pipeline de validación e integridad pre-flight (`validateClientIntegrityBeforeSync`) en el motor de sincronización física del Bridge CLI. El sistema extrae el `clientId` de `.prototipe.json` y resuelve el `projectId` de Firebase; consulta en Firestore central la facturación y el token de telemetría; lee y auto-cura `.env.local` agregando credenciales reales vía Firebase CLI `apps:sdkconfig`; inyecta el service worker FCM (`firebase-messaging-sw.js`) ausente parcheándolo con credenciales estáticas de la marca al vuelo; audita la interfaz de `firebaseConfig.js` inyectando exports ausentes (`messaging`); y copia scripts NPM requeridos. Validado localmente con compilación completa y exitosa de Vite.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-088: Corrección de Prioridad de Detección de Firebase Project ID en CLI Server (CORE-088)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalización: 2026-06-26
  - Descripción: Se corrigió un error en el helper `resolveFirebaseProjectId` del servidor CLI en el que la variable `meta.clientId` (ej. `moni-app`) enmascaraba el project ID correcto de Firebase al leer `.prototipe.json`, saltándose la consulta a `.firebaserc` y `.env.local` e intentando desplegar en un proyecto inexistente. Ahora se consulta primero `.firebaserc` y `.env.local` (el ID real `ventas-moni-app`) antes de recurrir a metadatos.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]


* **[x] ~~Tarea CORE-087: Inicialización de Firebase, Exportación de Messaging y Saneamiento de Compilación en ventas-moni-app (CORE-087)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalización: 2026-06-26
  - Descripción: Se solucionó el error fatal de pantalla en blanco provocado por credenciales vacías (`auth/invalid-api-key`) inyectando las claves de Firebase y de telemetría correctas de la marca en `.env.local`. Asimismo, se actualizó `firebaseConfig.js` del cliente para exportar la mensajería asíncrona (`messaging`) requerida por los hooks del core y se creó la carpeta `/scripts` con el generador de mapa semántico `generate_ia_map.js` para corregir y habilitar el proceso de compilación local (`npm run build`).
  - Archivos: [Instancias Clientes/ventas/ventas-moni-app/.env.local](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/.env.local) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/scripts/generate_ia_map.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/scripts/generate_ia_map.js) [NEW]

* **[x] ~~Tarea CORE-086: Propuesta Técnica y Visual para Mini-Dashboard Interactivo Inline en Hero (CORE-086)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalización: 2026-06-26
  - Descripción: Se redactó y estructuró la propuesta de diseño UX y desarrollo técnico para dotar de interactividad directa a las tres sub-tarjetas (Ventas del Mes, Lista de Control, Últimos Pedidos) de la ilustración del Hero SVG. La propuesta define visual cues de descubrimiento (Floating badge "Pruébame 👆", micro-animación onboarding de atracción, cursores e iluminaciones selectivas) y mecánicas de interacción en el DOM del SVG (tooltips dinámicos con hover de puntos en el gráfico, toggle interactivo de checkboxes con tachado de texto en vivo y ciclos de estado con explosión de confeti en el badge de pedidos).
  - Archivos: [Documentacion PROTOTIPE/09_Modulos_Completos/propuesta_dashboard_interactivo.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/propuesta_dashboard_interactivo.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-085: Expansión de Nichos Comerciales y Consistencia de Configuración Operativa (CORE-085) [Revisión y Refinamiento]~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalización: 2026-06-26
  - Descripción: Se expandieron las verticales comerciales a 13 nuevos nichos específicos con 10 paletas HSL de contraste verificado (130 combinaciones completas light/dark en total) adaptadas estratégicamente a la identidad visual de cada vertical. Se inyectaron de forma consistente en `dev-dashboard` y en los archivos `palettes.js` de las plantillas (`template-ventas`, `template-core-seed`, `App Ventas`) y en la instancia del cliente activo (`ventas-moni-app`). Se incluyeron catálogos de prueba y la inyección de atributos dinámicos en `niche.json` desde la CLI. Adicionalmente, se implementó el endpoint de fusión en la CLI y el fallback en `billingService.js`. Finalmente, se resolvió la integridad del prebuild registrando e indexando la propuesta técnica `propuesta_dashboard_interactivo.md` del Hero en el `README.md` de la biblioteca y en `ComponentSandbox.jsx` (`COMPONENT_META`).
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [App Ventas/src/services/billingService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/billingService.js) [MODIFY], [dev-dashboard/src/components/admin/ComponentSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY], [Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY], [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/analisis_nichos_mercado_saas.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/analisis_nichos_mercado_saas.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY], [Prototipe-CLI/templates/template-ventas/src/constants/palettes.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/constants/palettes.js) [MODIFY], [Prototipe-CLI/templates/template-core-seed/src/constants/palettes.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/constants/palettes.js) [MODIFY], [Plantillas Core/App Ventas/src/constants/palettes.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/constants/palettes.js) [MODIFY], [Instancias Clientes/ventas/ventas-moni-app/src/constants/palettes.js](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/constants/palettes.js) [MODIFY]

* **[x] ~~Tarea CORE-084: Matriz de Paridad Inteligente, Blindaje de Sincronización y Fusión de index/package en CLI Server~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalización: 2026-06-26
  - Descripción: Se unificó y blindó el motor de paridad y sincronización física del CLI. Se inyectó el helper unificado `isPathExcludedFromSync()` con soporte de expresiones regex para excluir archivos críticos de base de datos (`.firebaserc`, `firebase.json`), variables de entorno (`.env.*`), logotipos (`logo.*`), favicons, y carpetas temporales (`scratch/`, `scripts/`, `playwright-report/`, `test-results/`) en cualquier Core o cliente. Se implementó fusión inteligente de `index.html` (preservando el título, metatags SEO y scripts de analíticas de terceros del cliente en la zona segura de marcado) y mezcla lógica de dependencias y scripts en `package.json` sin alterar la identidad de la marca. Finalmente, se auditó exhaustivamente el listado de 17 archivos del directorio `src/` marcados por el Drift Detector, validando que corresponden a lógica pura de software sin parámetros fijos ni credenciales de marca.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_paridad_y_exclusiones_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_paridad_y_exclusiones_2026.md) [NEW], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_archivos_sincronizables_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_archivos_sincronizables_2026.md) [NEW], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-083: Validación de package.json en Resolución de Proyectos de Clientes en CLI Server~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalización: 2026-06-26
  - Descripción: Se soluciona el error ENOENT al intentar compilar y desplegar cores (como 'ventas') desde el Dashboard. La función `findProjectDir` en `server.js` coincidía de forma codiciosa con carpetas vacías de nicho (ej. `Instancias Clientes\ventas`) basándose únicamente en el nombre de la carpeta, omitiendo el fallback a cores conocidos. Se inyectó una validación para exigir que la carpeta contenga obligatoriamente un archivo `package.json` antes de validar el nombre de la carpeta, garantizando que solo se resuelvan proyectos Node estructurados válidos.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-082: Alineación, Icono de WhatsApp, Ajuste de Desbordamiento y Corrección de Vibración de Botones Magnéticos en Calculadora CRO~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-26
  - Fecha de finalización: 2026-06-26
  - Descripción: Se corrigen 4 fallos de UI/UX en la Calculadora de Diagnóstico Express y los Botones Magnéticos: (1) Desbordamiento: Se inyecta `overflow-wrap: break-word` y afines en el contenedor de recomendaciones para evitar que textos continuos sin espacios rompan el layout. (2) Alineación: Se extrae el toggle de tipo de reto para colocarlo como un switcher superior de tipo "pill", alineando horizontalmente los inputs de ambas columnas a la misma altura. (3) Icono de WhatsApp: Se cambia el SVG del botón de resultados por el oficial completo (burbuja + teléfono). (4) Vibración de Botones: Se desactivan los pointer-events en los botones interactivos dentro del wrapper magnético para estabilizar la atracción, gestionando el click y hover desde el propio wrapper.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-081: Flexibilidad de Entrada de Dolor y Prevención de Desplazamiento en Calculadora CRO~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-25
  - Fecha de finalización: 2026-06-25
  - Descripción: Se aplicaron dos mejoras críticas a la Calculadora de Diagnóstico Express (CRO) en la landing page: (1) Flexibilidad de Entrada: Se implementó un control de tipo radio toggle en el segundo paso ("¿Cuál es tu mayor reto hoy?") que permite al usuario alternar entre seleccionar un reto preconfigurado de la lista dinámica ("Seleccionar de la lista") o redactar su propia necesidad a través de un campo de área de texto de tamaño responsivo ("Prefiero escribirlo"). Al escribir en la entrada personalizada, la propuesta recomendada y el mensaje/URL de WhatsApp se actualizan automáticamente en tiempo real para reflejar el texto exacto redactado por el usuario. (2) Prevención de Desplazamiento (Scroll Chaining): Se implementaron controladores de eventos JavaScript para capturar eventos de scroll (\`wheel\` y \`touchmove\`) en las listas de opciones del Custom Select (\`#custom-options-nicho\` y \`#custom-options-dolor\`). Esto evita que el scroll continúe y mueva toda la landing page al llegar a los límites (superior o inferior) de las listas desplegables, confinando la navegación dentro del dropdown.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-080: Forzado de la Rama de Desarrollo (develop) en Herramienta de Respaldos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-25
  - Fecha de finalización: 2026-06-25
  - Descripción: Se modificaron los scripts de respaldo de PowerShell (`git_backup.ps1` y `subproject_backup.ps1`) para garantizar que al finalizar el proceso de guardado/push, el desarrollador quede posicionado de forma automática en la rama de desarrollo `develop`. En `git_backup.ps1` (respaldo maestro) se añadió un bloque en `finally` que realiza el checkout a `develop`. En `subproject_backup.ps1` (respaldo de subproyectos) se adaptó la lógica final del bloque `finally` para cambiar la rama activa a `develop` de forma automática al guardar componentes base (Cores, Dashboard, etc.), mientras que las ramas de instancias cliente (`cliente/*`) se respetan y regresan a su rama correspondiente de forma segura.
  - Archivos: [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-079: Optimización de Rendimiento de Scroll y Consistencia de Interlineado de Títulos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-25
  - Descripción: Se aplicaron tres optimizaciones core a la landing page: (1) Rendimiento de Scroll: Se eliminó el lag de scroll y los cuellos de botella de renderizado en GPU al erradicar la transición universal `*` (que forzaba al navegador a calcular transiciones de color, fondo, bordes y sombras para todo el DOM). Se sustituyó por una clase de transición temporal `.theme-transition` gestionada dinámicamente en JS que se añade y remueve en un lapso de 300ms durante la alternancia de tema, combinada con transiciones explícitas y eficientes en hover para elementos interactivos como `.btn`, `.glass-card` y `.nav-links a`. (2) Consistencia de Títulos: Se creó un selector CSS global para encabezados `h1, h2, h3, h4, h5, h6` que unifica la tipografía `Outfit` y establece un interlineado compacto y adecuado de `line-height: 1.25` para tipografías grandes, eliminando declaraciones de interlineado redundantes en los bloques de estilos específicos y manteniendo ajustes finos individuales donde se requería. (3) Reducción de Separación en Solución: Se corrigió el espaciado vertical excesivo entre el título y el copy en la tarjeta de la sección Solución. Se achicaron los paddings laterales de la tarjeta en móviles (max-width: 768px y 480px) de 3rem a 1.5rem y 1.2rem respectivamente, ampliando el ancho útil del texto. Esto estabiliza el morphing en solo 2 líneas en pantallas pequeñas, permitiendo disminuir el min-height del h3 a 2.5em en tablets y 2.6em en móviles (antes 3.2em y 4.2em), reduciendo la separación de forma compacta y simétrica sin causar layout shifts.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-078: Corrección de Interceptación de WhatsApp Leads y Layout Shifts~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Se solucionaron fallos críticos y advertencias en la landing page: (1) Apertura del Modal de Leads de WhatsApp y Botones Magnéticos: Se reparó un bug de sintaxis/anidación en la estructura de las IIFEs de los scripts al final de la página, donde la IIFE de los Botones Magnéticos estaba anidada incorrectamente dentro de la IIFE de Leads Express, e impedía la invocación de esta última al estar declarada como expresión evaluada no ejecutada `(function() { ... });` debido a un cierre erróneo con `});` en lugar de `})();`. Al separar limpiamente ambas IIFEs en módulos autónomos y re-establecer el listener global en `document`, se recuperó la visualización del Modal de Leads Express de forma exitosa y el efecto magnético en los botones de WhatsApp. Además, se removió la exclusión `.btn-navbar` para que el botón "Asesoría Gratis" del encabezado también reciba el efecto magnético en desktop. (2) Layout Shifts en Solución y Beneficios: Se inyectó un `min-height: 7.3em;` en `.solution-box h3` bajo la media query móvil para frase de 3 líneas y evitar brincos dinámicos. Para el typewriter de `#beneficios .section-header h2`, se implementó la técnica avanzada de pre-renderizado con opacidad de spans individuales (letra por letra), de modo que el título reserve su altura física final exacta (46px) desde la carga de la página, y se vayan revelando visualmente con opacidad sin alterar el flujo del DOM (layout shift = 0px). (3) Advertencia de Seguridad Local (file://): Se erradicó la advertencia de Chrome sobre "Unsafe attempt to load URL..." que aparecía en consola al hacer clic en enlaces de anclaje internos (#solucion, #problema, etc.) al abrir el archivo HTML directamente desde el explorador local. Se implementó un interceptor de eventos en JS que ejecuta un desplazamiento suave de precisión compensando la altura de la navbar fija y previene la navegación nativa por defecto en entornos locales.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-077: Optimización y Rediseño de Menú Hamburguesa Móvil~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Se mejoró la visualización y rendimiento del menú móvil desplegable (`.nav-links` en `@media (max-width: 968px)`): (1) Ancho Completo: Se amplió el ancho del menú al 100% de la pantalla (`width: 100%; max-width: 100%;`), eliminando la franja blanca lateral y dando espacio completo para evitar que los enlaces largos se rompan de forma apretada. (2) Color Sólido: Se inhabilitó la opacidad y los filtros `backdrop-filter` que ralentizaban la renderización, definiendo un fondo 100% sólido adaptado a cada tema (`var(--color-surface)` en claro y `var(--color-bg)` en oscuro). (3) Aceleración de Transición: Se redujo el tiempo de la transición a `0.28s` con una curva `cubic-bezier(0.25, 1, 0.5, 1)`, logrando una salida e ingreso del menú sumamente responsivos, veloces y fluidos.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-076: Mitigación de Layout Shift en Texto Cambiante de Solución~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Se aplicó un blindaje de estabilidad visual en la tarjeta de la sección **La Solución**: (1) En desktop, se inyectó un `min-height: 2.8em` en `.solution-box h3`. (2) En la versión responsiva móvil (`@media (max-width: 768px)`), se redujo la tipografía a `clamp(1.3rem, 4.5vw, 1.8rem)` y se inyectó un `min-height: 3.2em` para albergar hasta 3 líneas estables. (3) En móviles ultra-estrechos (`@media (max-width: 480px)`), se ajustó la tipografía a `clamp(1.15rem, 5vw, 1.4rem)` y se estableció un `min-height: 4.2em`. Esto reserva el espacio físico exacto para albergar frases largas (como "tu emprendimiento") sin deformar la tarjeta ni empujar el texto inferior, logrando un Cumulative Layout Shift de exactamente 0.00 en todos los dispositivos.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-075: Centrado de Tarjetas de Dolor, Descompactación de CRO y Corrección de Recortes 3D/Errores de Consola~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Se aplicaron múltiples mejoras estéticas, lógicas y correctivas: (1) Tarjetas de Dolor: Se reestructuraron las tarjetas `.pain-card` de la sección El Problema a un diseño de columna centrada (`flex-direction: column; align-items: center; text-align: center`), lo que mejora drásticamente el espacio de lectura en móviles y proporciona una simetría premium. (2) Tarjeta de Comparación de Tiempo: Se descompactó el layout aumentando paddings y gaps de la tarjeta y las filas. Además, se redefinió `.time-label` a `display: block` y se le inyectó un margen derecho al `strong`, solucionando de raíz el pegado y traslape de palabras tras los dos puntos (`Antes:Procesos` y `PROTOTIPE:registrado`). (3) Testimonios: Se inyectó padding vertical extra (`padding-top: 1.5rem; padding-bottom: 2.5rem; margin-top: -1.5rem;`) y `overflow-y: visible !important;` en el carrusel de testimonios en móviles para dar un espacio físico de proyección en el eje Z a las tarjetas y evitar que se recorten sus esquinas al rotar en 3D. (4) Preguntas Frecuentes: Se removió el buscador de FAQs (HTML, CSS y el script de filtro de búsqueda JS) según la solicitud del usuario. (5) Registro de Service Worker: Se añadió una validación `window.location.protocol !== 'file:'` y control de excepciones en JS para evitar fallas y silenciar el TypeError del Service Worker al abrir el archivo HTML localmente desde el explorador.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-074: Escalado de Ilustración Hero, Remoción de Focus Rings y Bloqueo Global de Selección~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Se ampliaron las dimensiones de la ilustración del Hero en escritorio y móvil, aumentando su `max-width` global a `560px` y reduciendo el padding horizontal de `.container` en móviles a `1.25rem`. Se implementaron reseteos CSS globales inyectando `outline: none !important` y `-webkit-tap-highlight-color: transparent !important` de forma universal (`*`) para anular cualquier rastro de halo de enfoque azul o sombra del navegador. Por último, se bloqueó la selección de texto en todo el sitio de manera general con `user-select: none !important` excluyendo exclusivamente los campos `<input>` y `<textarea>` del formulario del modal de leads para preservar la usabilidad del CRO.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-073: Reducción de Tamaño de Texto del Hero en Versión Móvil~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Se redujo el tamaño de fuente del párrafo principal del Hero (`.hero-content p`) en la versión móvil (`@media (max-width: 576px)`) a `1rem`. Esto soluciona la falta de jerarquía visual y contraste de tamaño entre el título H1 (`2.1rem` en móviles) y el párrafo descriptivo en pantallas pequeñas.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-072: Optimización de Botones Magnéticos, Remoción de Líneas de Flujo y Rediseño de Theme Toggle~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Se mejoró el efecto magnético en los botones primarios, secundarios, de WhatsApp y en el botón del encabezado "Asesoría Gratis", inyectando una zona de interacción extendida (padding virtual de 16px y margen de -16px) en el wrapper para prevenir el jittering. Se corrigió un bug de persistencia de la sombra (glow) de fondo de los botones magnéticos obligando al JS a restablecer explícitamente la opacidad del glow a 0 en el evento `mouseleave`. Se rediseñó el botón de modo oscuro (theme-toggle-btn) con SVGs premium en línea de Sol y Luna que giran y se escalan de forma cruzada usando transiciones CSS. Finalmente, se eliminaron las líneas de flujo SVG verticales animadas inter-secciones por solicitud visual del usuario.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-071: Enriquecimiento Estético de Fondo, Glow Blobs y Visibilidad de Partículas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Incremento de la visibilidad de los nodos y líneas de la red de partículas del Hero (triplicando la opacidad base de `0.12` a `0.28` para nodos y de `0.06` a `0.18` para líneas), permitiendo que la interacción del mouse y del fondo sea apreciable. Además, se inyectaron dos elementos glow blobs de color adaptativo (`.glow-blob glow-blob-primary` y `.glow-blob glow-blob-secondary`) en el fondo del Hero. Estos generan un efecto aurora moderno difuminado en base al color azul primario de la marca y un color violeta complementario, que pulsa orgánicamente en tamaño y opacidad (efecto respiración mediante la animación CSS `blob-pulse` de 12s) usando variables de opacidad de CSS que se adaptan automáticamente a los temas claro y oscuro, eliminando negros absolutos.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]


* **[x] ~~Tarea CORE-070: Robustecimiento de WhatsApp FAB/Botones e Integración de Formulario Lead Express~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Implementación de un Modal de Captura de Leads Express amigable y premium (glassmorphic y responsivo en móviles) que intercepta de forma global los redireccionamientos a WhatsApp (enlaces que contienen `wa.me`). El modal solicita el Nombre completo (obligatorio), Número de contacto (obligatorio) y Correo electrónico (totalmente opcional, informando que puede dejarse vacío). Al enviar el formulario, el sistema decodifica el mensaje predeterminado contextual del botón cliqueado, construye un mensaje enriquecido con la etiqueta `📢 [Prototype Web]` para identificar la procedencia (para no confundirlos con otros emprendimientos del usuario), e inicia la conversación en una nueva pestaña. Se inyectó el HTML del modal `#lead-modal`, los estilos responsivos adaptados a móviles (botones apilados verticalmente y padding compacto en viewports pequeños), y la lógica con listener global mediante delegación de eventos y compatibilidad con botones modificados dinámicamente como el de la calculadora CRO. **Ajustes de Calidad y Refinamiento (Bugfix):** Se transformó la etiqueta `<form>` en el propio contenedor del modal (`modal-container lead-modal-container`) para contener adecuadamente los elementos bajo la estructura flexbox de la landing page, eliminando el desbordamiento de los botones por debajo del marco del modal. Adicionalmente, se configuró una altura máxima de `90vh !important` y se redujeron los paddings y márgenes del formulario para disminuir la altura total del modal a 420px, erradicando por completo cualquier scrollbar vertical residual y permitiendo visualizar todo el contenido de forma 100% visible en celulares y escritorio sin necesidad de scroll. **Corrección de Codificación de Emojis (Bugfix Emojis):** Se reemplazaron los caracteres de emojis literales en el script JS por sus respectivas secuencias de escape Unicode de ES6 (`\u{1F4E2}`, `\u{1F464}`, `\u{2709}\u{FE0F}` y `\u{1F4DE}`). Esto previene que navegadores o servidores que carguen el archivo con fallas de codificación de caracteres (ANSI/Windows-1252) compilen los emojis como caracteres corruptos. **Bypass del Acortador wa.me:** Tras detectar que el servidor de redireccionamientos de WhatsApp (`wa.me`) corrompe la codificación de los emojis transformándolos en caracteres rombo con signo de interrogación () en el chat de destino, se migraron todas las redirecciones y enlaces de la landing page directamente a `api.whatsapp.com/send`, lo cual garantiza que WhatsApp interprete el texto decodificado como UTF-8 puro y renderice los emojis correctos en cualquier plataforma. **Mejoras Adicionales de Excelencia (Accesibilidad, Caching y Redirección):** Se implementó soporte completo de navegación por teclado (Space, Enter, Escape, ArrowUp y ArrowDown) para los selectores customizados de la calculadora, inyectando los atributos de accesibilidad correspondientes (`role="listbox"`, `role="option"`, `aria-selected` y `tabindex="0"`). Se configuró el almacenamiento automático en LocalStorage de los datos del lead tras su primer envío, permitiendo auto-completar los campos de Nombre, Celular y Correo en futuras aperturas del modal para evitar redundancias y potenciar la tasa de conversión (CRO). Finalmente, se añadió una micro-animación de carga (spinner giratorio SVG) y desactivación del formulario durante 800ms tras presionar enviar, previniendo dobles envíos y optimizando la fluidez de redirección.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]


* **[x] ~~Tarea CORE-069: Corrección de Icono Calculadora, Estabilización de Beneficios y Alineación Simétrica de KPIs~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Ajustes visuales, correctivos y de scroll en la Landing Page: (1) Icono y Trigger: Se sustituyó el SVG del trigger colapsable de la calculadora por el SVG oficial de calculadora de Lucide, eliminando la línea base que parecía una papelera, e inyectando media queries responsivas para evitar la compresión del texto del trigger en móviles. (2) Estabilidad de Scroll: Se removió la expansión y colapso dinámicos por scroll de `.benefit-card`, restaurando el copy del beneficio como estático en CSS y removiendo su IntersectionObserver, eliminando por completo los saltos bruscos y el layout shift al desplazarse. (3) Alineación Simétrica de KPIs: En la sección Organizado, se fijaron alturas mínimas a los títulos (`h3` con min-height de 2.8rem en desktop / 2rem en móvil) y a los valores (`.organizado-value` con min-height de 3.5rem en desktop / 1.8rem en móvil), y se aplicó `margin-top: auto` en `.organizado-status-badge`, logrando una perfecta alineación horizontal simétrica de todos los elementos en escritorio y en el mini-dashboard de móviles.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]


* **[x] ~~Tarea CORE-068: Optimización de UX de Beneficios, Dashboard de KPIs Móvil y Ajuste de Testimonios~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Refinamiento responsivo profundo de la Landing Page en tres secciones críticas: (1) Sección Beneficios: Se inyectaron transiciones CSS de colapso y expansión en `.benefit-card p` controladas mediante un IntersectionObserver en JS, mostrando inicialmente solo los títulos y expandiendo/retrayendo el texto descriptivo dinámicamente según la visibilidad en el scroll para optimizar el espacio vertical. (2) Sección Organizado: En viewports móviles (≤ 768px), se reestructuró la cuadrícula vertical en una fila horizontal compacta de 3 columnas (`grid-template-columns: repeat(3, 1fr)`) con paddings de 1rem, reduciendo tipografías e iconos SVG para crear un dashboard analítico de mini-KPIs compacto de una sola fila. (3) Sección Testimonios: Se ajustó el alto de las tarjetas de testimonios (`.flip-inner`) a 350px en móviles, achicando paddings, gaps y tipografías para erradicar el desbordamiento de contenido y el scroll interno vertical secundario.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]


* **[x] ~~Tarea CORE-067: Corrección de Scroll Dropdown, Responsividad en Botón WhatsApp y Autocalibración de Giroscopio Móvil~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Solución de problemas responsivos y de experiencia en móviles en la calculadora y en la interactividad 3D. Se aplicó `overscroll-behavior: contain` y `-webkit-overflow-scrolling: touch` en `.custom-options` de la calculadora para contener el scroll táctil e impedir que arrastre la página de fondo. Se agregaron media queries específicas (`@media (max-width: 576px)`) para reducir el padding del contenedor de resultados `.configurador-result` y optimizar la tipografía y padding de `#config-cta-btn` en móviles, evitando la fragmentación tosca del texto. Finalmente, se reemplazó la calibración estática del giroscopio por un algoritmo de **Autocalibración Dinámica de Línea Base (Dynamic Baseline Calibration)** con un factor de suavizado (`lerp` de `0.04`) en el evento `deviceorientation`, permitiendo que las tarjetas se auto-centren fluidamente en 1.5s sin importar en qué ángulo el usuario sostenga el móvil (ej. acostado horizontalmente), y reaccionando exclusivamente ante movimientos rápidos de rotación.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]


* **[x] ~~Tarea CORE-066: Optimización de Rendimiento General de Animaciones y Aceleración por GPU~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Implementación de aceleración de hardware (GPU) en las tarjetas de rubros (`.rubro-card`) y en las tarjetas de testimonios (`.flip-inner`) mediante la inyección de `will-change: transform`, `backface-visibility: hidden` y `transform-style: preserve-3d` en CSS para mitigar DOM repaints provocados por el efecto 3D Tilt y rotaciones interactivas. Asimismo, se integró optimización inteligente del loop de renderizado de partículas en el `<canvas id="hero-canvas">` mediante la API de IntersectionObserver, pausando el loop y cancelando los frames (`cancelAnimationFrame`) cuando la sección del Hero ya no es visible en pantalla para evitar consumo innecesario de GPU/CPU y lag al hacer scroll vertical.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]


* **[x] ~~Tarea CORE-065: Rediseño de la Calculadora CRO, Retos Dinámicos por Nicho y Colapso por Trigger~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Modificación profunda y optimización UX de la Calculadora de Diagnóstico Express en `Index.html`. Se retiró el emoji de cohete del encabezado. Se implementaron Custom Selects de HTML/CSS/JS (desplegables personalizados con glassmorphic design, bordes redondeados y flechas de rotación reactiva) sincronizados con los selects nativos de fondo. Se investigaron en internet y estructuraron 32 retos operacionales específicos y soluciones recomendadas profesionales detalladas para los 8 rubros de negocio. Adicionalmente, se configuró el colapso del configurador ocultándolo por defecto bajo una tarjeta trigger interactiva con animación de pulso y glow en hover, agregando un botón de cierre en la calculadora para volver a colapsarla y optimizar el espacio vertical de la página. Asimismo, se optimizó el rendimiento del efecto de Inclinación 3D (3D Tilt) en desktop desactivando la propiedad `transition` de CSS en `mouseenter` para lograr un seguimiento inmediato al cursor sin lag, y reactivando la transición al salir (`mouseleave`). En móviles, se implementó el Efecto de Inclinación 3D Giroscópico (Paralaje Físico 3D) mediante la Device Orientation API (inclinando suavemente las tarjetas al mover físicamente el teléfono) con filtrado de viewport mediante IntersectionObserver para procesar solo tarjetas visibles (ahorro de batería), límites de ángulo de inclinación para preservar legibilidad, limitación de frecuencia a ~30Hz, y refresco suavizado mediante requestAnimationFrame.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]


* **[x] ~~Tarea CORE-064: Refinamiento de Animaciones y Efecto Tilt 3D Selectivo~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Refinamiento de interactividad en la Landing Page en `Index.html` mediante la expansión selectiva del Efecto Tilt 3D (Inclinación 3D de perspectiva). Se expandió el efecto a las tarjetas de rubro/negocios (`.rubro-card`) en la vista desktop utilizando una escala adaptativa coordinada con el CSS de hover (1.03) para evitar saltos tipográficos y visuales. Asimismo, se excluyeron explícitamente las tarjetas del acordeón colapsable de preguntas frecuentes (`.faq-item`) para prevenir interferencias de UX en la lectura de las respuestas.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]


* **[x] ~~Tarea CORE-063: Optimización SEO y Tasa de Conversión (CRO) en Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Implementación de mejoras de posicionamiento SEO y optimizaciones de tasa de conversión (CRO) en la Landing Page de PROTOTIPE en `Index.html`. **Mejoras SEO:** Se inyectaron metadatos estructurados en formato JSON-LD (`ProfessionalService` schema markup) para indexación enriquecida en Google, tag de URL canónica (`canonical`), y metadatos complementarios Open Graph; además se inyectó accesibilidad semántica (`role="img"`, `aria-labelledby`, `<title>` y `<desc>`) al SVG interactivo del Hero. **Mejoras de Conversión (CRO):** Se desarrolló la "Calculadora de Diagnóstico Express", un widget interactivo con 32 combinaciones de nichos/dolores de negocio que actualiza dinámicamente una recomendación personalizada y autogenera un enlace pre-formateado directo a WhatsApp en base a la selección. Adicionalmente, se maquetó la sección `#faq` de Preguntas Frecuentes mediante un acordeón premium responsivo con auto-cierre exclusivo de ítems activos y estilos adaptados al modo claro/oscuro.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-062: Interactividad Máxima y 10 Animaciones Profesionales en Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Implementación de 10 animaciones profesionales premium en todas las secciones de la Landing Page en `Index.html` para maximizar la interactividad de forma limpia, amigable y responsiva. **Ajuste UI/UX (Revisión v2):** Se eliminaron los círculos de carga (SVG gauges) en las tarjetas de `#negocio-organizado` por considerarse innecesarios para el estilo limpio de la página (manteniendo la animación de confeti). Se aumentó la altura mínima de las tarjetas flip-inner de testimonios (`min-height: 350px` en desktop y `380px` en móviles) para solucionar de raíz el desbordamiento inferior del autor en textos largos. En `#como-funciona` se removió por completo la línea divisoria vertical del timeline por ser irrelevante en el diseño horizontal, y se rediseñó la numeración de los pasos (`.step-num`) eliminando su fondo azul rectangular tosco para dejar un número grande elegante que se ilumina con el IntersectionObserver de scroll. **Ajuste UI/UX (Revisión v3 - Mobile Tap Hints):** Se inyectó en cada tarjeta de rubro el elemento `.rubro-tap-hint` ("Toca para ver 👆") con sus respectivos estilos CSS responsivos y animación de pulso infinito para incitar y guiar el toque en móviles, además de perfeccionar la visibilidad ocultando al 100% el contenido frontal al desplegar el overlay.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-061: Escala Premium Landing Page — 13 Mejoras de Conversión, Navegación, UX y Mobile~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Implementación de 13 mejoras premium agrupadas en 4 bloques: **Bloque A** (conversión) — WhatsApp FAB flotante con anillo de pulso, micro-copy de confianza bajo el CTA del Hero, sección `#testimonios` con 3 fichas de rubros reales (ferretería/restaurante/taller) y sección `#rubros` con grid de 8 tipos de negocio interactivos. **Bloque B** (navegación) — Scroll Progress Bar de 3px con gradiente animado y Navbar Active con indicador underline animado que resalta el enlace de la sección visible. **Bloque C** (micro-UX) — Animación word-by-word en el H1 del Hero y efecto tilt 3D perspectiva en cards solo en desktop. **Bloque D** (mobile) — Tipografía responsive con `clamp()`, padding de secciones reducido en móvil, botones CTA 100% de ancho en pantallas pequeñas.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-060: Humanización de Landing Page y Tarjetas Visuales de Confianza~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Rediseño visual de confianza y humanización de la landing page corporativa de PROTOTIPE en `Index.html` para pequeños y medianos negocios. Se integró una tarjeta de comparación interactiva "Antes y Después" en la sección de Problema que describe visualmente la fricción de procesos manuales frente al orden digital. Se añadieron dos tarjetas ilustrativas al final de Beneficios: "Tu negocio hoy, bajo control" (con checks elásticos progresivos) y "Menos tiempo organizando, más tiempo atendiendo" (con barras comparativas de tiempos animados que ilustran el ahorro diario de 3 horas a 30 minutos). Se implementó la nueva sección intermedia "Así se siente un negocio organizado" con una grilla de tres tarjetas interactivas (Ventas del día, Inventario, Clientes atendidos) y animaciones fluidas de conteo dinámico (Count-Up) a 60 FPS con suavizado cuadrático. Finalmente, se inyectó la tarjeta de estado del día en la sección de Soporte.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-059: Enriquecimiento Dinámico y Animaciones del Ecosistema de Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Incorporación de animaciones dinámicas interactivas de alta gama en la landing page. Se implementó una animación de flotación vertical lenta en la ilustración SVG del Hero. Se envolvieron los widgets del SVG ("Ventas del Mes", "Lista de Control" y "Últimos Pedidos") en etiquetas de grupo interactivas con curvas Bezier elásticas de escalado en hover (`scale(1.06)`) y drop-shadow azul de marca para incentivar la interacción visual. Se inyectó un efecto de trazado dinámico automático de la línea del gráfico en el render inicial y círculos pulsantes continuos en los nodos de datos. Adicionalmente, se integró un efecto de brillo metálico (`shimmer` de gradiente móvil) en los botones primarios para incitar la pulsación y se agregaron efectos de elevación elástica (`translateY(-6px) scale(1.025)`) y realce de contorno en las tarjetas de la página (`.glass-card`).
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-058: Implementación de Secciones Legales e Integridad de Contacto en Footer de Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Limpieza de la sección de contacto en el footer de `Index.html` removiendo la ubicación física de Bogotá y redefiniendo el correo como canal de soporte técnico. Implementación de modales interactivos y accesibles para "Términos de Servicio" y "Política de Privacidad" con soporte de cierre por botón, click en backdrop, y tecla Escape. El contenido de las secciones legales fue adaptado al modelo de negocio real de PROTOTIPE (software a medida de marca blanca para negocios locales, protección y propiedad absoluta de los datos por parte del cliente, licencia no exclusiva de uso del core base y soporte prioritario).
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

* **[x] ~~Tarea CORE-051: Rediseño Corporativo, Limpio y Humano de la Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Rediseño radical completo de Index.html basado en el nuevo brief de marca. Se transformó el portal de un estilo neón/cyberpunk tecnológico a un diseño limpio, profesional e institucional de consultoría con enfoque en el usuario tradicional. Se implementó el Modo Claro por defecto (#F8FAFC) y modo oscuro persistente en localStorage libre de negros absolutos, se purgaron animaciones distractoras, destellos y la calculadora de ROI. Se estructuraron las secciones de Hero (con ilustración SVG inline del flujo de negocio), Problema, Solución personalizada, Beneficios claros, Flujo de 4 pasos, Soporte con tiempos de respuesta (24h/urgente), Confianza y el CTA final para WhatsApp.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-056: Preflight Check de Firebase, Gestión de Drift de Reglas y Purgado de Seeding/IA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Se implementó la verificación de credenciales de Firebase en el aprovisionador (Preflight Check), la gestión del drift de reglas (Firestore/Storage) y despliegue directo desde el Dashboard central, y la purga absoluta del sistema de seeding y de cualquier rastro o script de Inteligencia Artificial (Gemini/Vertex) en el ecosistema.
  - Archivos: [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [Prototipe-CLI/cli.js](file:///d:/PROTOTIPE/Prototipe-CLI/cli.js) [MODIFY], [dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-055: Auditoría, Robustecimiento y Marca Blanca en Motor de Aprovisionamiento~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Se auditó e implementó la resolución a las fugas y fallas del aprovisionador en `sync_templates.js` y `generator.js`. Se añadió la carpeta `scratch/` (que incluye el script de siembra `seed_brand.js`) y `storage.rules` a las copias de las plantillas. Se modificó el generador para heredar el `firebase.json` del Core si está presente, y para personalizar dinámicamente el campo `"name"` de `package.json` con el `clientId` de la nueva marca.
  - Archivos: [Prototipe-CLI/sync_templates.js](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY], [Prototipe-CLI/generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_motor_aprovisionamiento_marca_blanca.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_motor_aprovisionamiento_marca_blanca.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-054: Depuración de Redundancias y Enriquecimiento del Sandbox de Componentes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Depuración física de la biblioteca de componentes y módulos eliminando fichas duplicadas y archivos temporales de desecho, actualización del README.md, creación de 5 nuevos playgrounds interactivos con simulación mock de flujos lógicos complejos y mapeo en ComponentSandbox.jsx.
  - Archivos: [Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY], [dev-dashboard/src/components/admin/ComponentSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY], [dev-dashboard/src/components/admin/sandboxes/FormularioProductoIASandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/FormularioProductoIASandbox.jsx) [NEW], [dev-dashboard/src/components/admin/sandboxes/LoginPageSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/LoginPageSandbox.jsx) [NEW], [dev-dashboard/src/components/admin/sandboxes/OrderTrackingSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/OrderTrackingSandbox.jsx) [NEW], [dev-dashboard/src/components/admin/sandboxes/CatalogFiltersSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CatalogFiltersSandbox.jsx) [NEW], [dev-dashboard/src/components/admin/sandboxes/PWAInstallBannerSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/PWAInstallBannerSandbox.jsx) [NEW], [dev-dashboard/src/components/admin/sandboxes/SandboxLayout.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SandboxLayout.jsx) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-052: Robustecimiento y Blindaje de la Biblioteca de Componentes y Sandbox~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Implementación del script de validación pre-build `verify_library_integrity.cjs` en el package.json del dashboard para auditar consistencia física/lógica de la biblioteca (README.md, enlaces, mapeos), inyección de SandboxErrorBoundary en playgrounds y tipado estructurado JSDoc con validaciones en desarrollo en BackButton y QuantitySelector.
  - Archivos: [dev-dashboard/scripts/verify_library_integrity.cjs](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [NEW], [dev-dashboard/package.json](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/package.json) [MODIFY], [dev-dashboard/src/components/admin/ComponentSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY], [App Ventas/src/components/ui/BackButton.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/BackButton.jsx) [MODIFY], [App Ventas/src/components/ui/QuantitySelector.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/QuantitySelector.jsx) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-053: Sincronización Estructural Automática de Firebase en el Ecosistema~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Se removió `firebase.json` de las listas de exclusiones de la CLI (en `sync_clients.js` y `server.js`). Esto permite que los cambios estructurales en los servicios de Firebase (como la habilitación de Storage, Functions o Hosting) hechos en el Core se propaguen automáticamente downstream a todas las marcas clientes en la sincronización diferencial. Las identidades y credenciales de bases de datos individuales permanecen resguardadas en `.env.local` y `.firebaserc`.
  - Archivos: [Prototipe-CLI/sync_clients.js](file:///d:/PROTOTIPE/Prototipe-CLI/sync_clients.js) [MODIFY], [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea HOTFIX-TELEMETRIA-002: Desactivación de Alerta Residual de Enlace y Panel de Gestión en Dashboard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Se detectó que el modal de telemetría de enlace ("Prueba de Enlace de Telemetría") se mostraba persistentemente al abrir la app debido a un registro activo en Firestore Central (`sistemaAlerta.active = true`) en los documentos `moni-app` y `ventas-smartfix`. Se desactivó esta alerta directamente en la base de datos central a nivel de Firestore. Asimismo, se implementó en `dev-dashboard` la interfaz de Alerta Remota del Sistema dentro de la configuración del CRM de Clientes, para permitir al desarrollador habilitar, deshabilitar y personalizar notificaciones globales desde la UI del panel central de forma limpia.
  - Archivos: [dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], Firestore Central [DATABASE]

* **[x] ~~Tarea CLIENTE-MONI-001: Corrección de Firebase Storage y Carga de Imágenes en Ventas MoNI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-24
  - Fecha de finalización: 2026-06-24
  - Descripción: Corrección en la configuración de la instancia `ventas-moni-app` añadiendo la sección `"storage"` en `firebase.json` y desplegando con éxito las reglas de seguridad de Storage (`storage.rules`) a la nube. Esto resolvió el bloqueo en la subida de imágenes desde la cámara y la galería.
  - Archivos: [Instancias Clientes/ventas/ventas-moni-app/firebase.json](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/firebase.json) [MODIFY]

* **[x] ~~Tarea CORE-051: Alineación e Integración de la Biblioteca y el Sandbox del Dashboard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Saneamiento integral de 29 enlaces rotos en el README.md de la biblioteca, mapeo de playgrounds del Sandbox para componentes huérfanos, y creación del archivo de documentación de KDS para completar la paridad de componentes.
  - Archivos: [Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY], [Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY], [Documentacion PROTOTIPE/09_Modulos_Completos/Pantalla_Cocina_KDS/pantalla_cocina_kds.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/Pantalla_Cocina_KDS/pantalla_cocina_kds.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

* **[x] ~~Tarea CORE-050: Normalización de Iconografía en la Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Normalización al 100% de todos los iconos SVG de la landing page (Index.html) a la biblioteca de Lucide. Se corrigió el path del favicon, logotipo principal (Navbar y Footer), los iconos de la sección El Problema (Reloj, Dólar, Clientes, Puntos Ciegos), el icono principal de bombilla en La Solución (añadiendo espaciado explícito para decimales y comandos Bézier para evitar que Chrome lo renderizara de forma asimétrica), los iconos de la grilla de Beneficios, los checks de características de la tabla de precios y los iconos de más/menos del FAQ.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-049: Alineación y Sincronización Completa del Mapa Semántico de Documentación IA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Análisis sistemático de toda la documentación de PROTOTIPE y sincronización del mapa semántico `mapa_documentacion_ia.md` indexando las 12 referencias faltantes (reglas GEMINI.md, verify_ecosystem_integrity.js, boveda_obsidian_index.md, mapa_ecosistema.canvas, telemetria_ecosistema_global.md, catalogo_componentes_atomicos.md, formulario_producto_ia.md, imagen_lazy.md, diagrama_flujo_ecosistema.md, diccionario_tecnico_completo.md, etc.) con sus correspondientes roles técnicos, criterios de decisión IA y enlaces directos con protocolo file:///.
  - Archivos: [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-048: Análisis y Rediseño Premium Profesional de Landing Page~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Auditoría y rediseño completo de Index.html para convertir la landing page actual en un sitio premium que implemente variables HSL, fuentes de Google Fonts, navbar animado, glows radiales en CSS, secciones estructuradas con iconos SVG y optimizaciones de SEO/Semántica.
  - Revisión v1.1 - v2.0 (Completado): Corrección de contraste en el botón de navegación, estandarización de alturas mínimas en todas las tarjetas y purga completa de emojis. Corrección del bug de brillo estático sobre "Preguntas" en el navbar mediante la inyección de `display: inline-block` en el botón cta. Reemplazo y rediseño de todos los iconos de la cuadrícula de Casos de Éxito (Revisión v1.5) escalándolos a 24x24px con trazo stroke-width="2" y formas inequívocas y representativas (martillo, utensilios, automóvil, tienda física, tijeras, cohete) para evitar el empastamiento y los artefactos visuales deformes. Solución definitiva al recorte horizontal de los círculos numerados 1, 2 y 3 en la sección de pasos simples inyectando `overflow: visible !important;` en la clase de estilos de `.step-card` (Revisión v1.6), homologando también todos los grosores de trazo de flechas interactivas e icono de bombilla a `stroke-width="2"`, y robusteciendo el logotipo del footer con gradiente local. Corrección del bug visual del destello de esquinas en ángulo recto (bordes rectos grises) en tarjetas con overflow visible mediante la inyección de `border-radius: inherit;` en el pseudo-elemento `.glass-card::before` (Revisión v1.7) para que herede la curvatura de 18px del contenedor padre. Diseño e implementación de la calculadora interactiva glassmorphic de fugas de dinero/tiempo y retorno de inversión en tiempo real para maximizar la cotización activa de clientes, incluyendo el pulido responsivo final (Revisión v1.8) de la visualización de la cifra monetaria anual en viewports estrechos mediante clamp() adaptativo y white-space: nowrap, el rediseño tipográfico de alta jerarquía del Hero H1 (Revisión v1.9) reduciendo el peso de Outfit a 800 y el tracking a -0.05em, y el efecto de resorte elástico (Revisión v2.0) al pasar el cursor (scale 1.06) y hacer clic (scale 0.94) en el botón de Diagnóstico Gratis del navbar aplicando curvas Bezier cúbicas.
  - Archivos: [LandingPage/Index.html](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY], [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_landing_page_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_landing_page_2026.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY], [Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

* **[x] ~~Tarea CORE-047: Sincronización y Normalización de la Matriz de Precios Oficial~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Normalización del formato, viñetas de guiones, estructura de cobros y ejemplos de la Matriz de Precios Oficial de PROTOTIPE en alineación exacta con las especificaciones del negocio.
  - Archivos: [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/matriz_precios_oficial.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/matriz_precios_oficial.md) [MODIFY]

* **[x] ~~Tarea CORE-046: Integración Documental de Procesos Comerciales y de Escalabilidad~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Creación del manual de marca (`manual_marca.md`), manual de contratación (`manual_contratacion_clientes.md`) y organigrama futuro (`organigrama_futuro.md`) distribuyéndolos en las subcarpetas temáticas estratégicas del ecosistema.
  - Archivos: [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_contratacion_clientes.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_contratacion_clientes.md) [NEW], [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_marca.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_marca.md) [NEW], [Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/organigrama_futuro.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/organigrama_futuro.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-045: Integración Documental del Roadmap de Negocio 2026-2029~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Creación y distribución estratégica del plan maestro empresarial (`roadmap_empresarial_2026_2029.md`) bajo `/08_Plan_Escalabilidad_Negocio/`. Detalla la visión estratégica de escalabilidad en 4 fases operativas para alcanzar metas incrementales de clientes activos.
  - Archivos: [Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/roadmap_empresarial_2026_2029.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/roadmap_empresarial_2026_2029.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-044: Integración Documental de la Oferta Comercial Oficial~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Creación y distribución estratégica del documento oficial de oferta comercial (`oferta_comercial_oficial.md`) bajo `/05_Estrategia_Comercial_Ecosistema/`. Registra la propuesta de valor, problemas operativos resueltos, entregables del software y filosofía de servicio de PROTOTIPE.
  - Archivos: [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/oferta_comercial_oficial.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/oferta_comercial_oficial.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-043: Documentación del Modelo Operativo y de Negocio Comercial~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Creación del documento conceptual y operativo de la empresa PROTOTIPE. Se describen el modelo de negocio SaaS de marca blanca, onboarding comercial, flujo de ventas PWA, desarrollo de plantillas core, telemetría de soporte de fallas, mantenimiento local con PowerShell y flujos de actualización downstream downstream con rollback automatizado.
  - Archivos: [Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/modelo_operativo_y_negocio.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/modelo_operativo_y_negocio.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-042: Construcción del Mapa de Dependencias y Matriz de Impacto~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Creación del documento de mapa de dependencias y riesgos del ecosistema. Se describe el flujo de dependencias físicas y de infraestructura en diagramas Mermaid, se incluye una matriz de impacto y criticidad, y se auditan los puntos únicos de falla (SPOF) y riesgos potenciales en producción de cada componente.
  - Archivos: [Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/mapa_dependencias_y_riesgos.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/mapa_dependencias_y_riesgos.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-041: Construcción de Registro de Decisiones Arquitectónicas (ADR)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Creación del registro oficial de decisiones arquitectónicas (ADR) del ecosistema. Se documentan 5 decisiones críticas (sharding por cliente de Firebase, branding HSL, sincronizador downstream, workers asíncronos y telemetría desacoplada) justificando el contexto técnico, la decisión, las alternativas descartadas, ventajas y riesgos.
  - Archivos: [Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/registro_decisiones_arquitectura.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/registro_decisiones_arquitectura.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-040: Construcción del Documento Maestro de Reglas Arquitectónicas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Generación del estándar general y documento de reglas arquitectónicas de PROTOTIPE. Se describen principios arquitectónicos, carpetas núcleo, dependencias obligatorias, tecnologías aprobadas/prohibidas, convenciones de código, patrones de diseño, reglas de sincronización, reglas de seguridad, reglas de escalabilidad, directivas obligatorias para IA, lista de acciones prohibidas y checklist de auditoría del ecosistema.
  - Archivos: [Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-039: Distribución Estratégica de Informes de Auditoría Técnica y Diagrama del Ecosistema~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Reubicación física y corrección del error de tipeo en la ruta del archivo de auditoría, eliminando la carpeta obsoleta `03_Audiorias_y_Faro_Core` y el archivo `Sin título.canvas`. Distribución estratégica de `auditoria_final_prototipe.md` bajo `03_Auditorias_y_Faro_Core/` y del `diagrama_flujo_ecosistema.md` en `07_Manuales_Desarrollo/`. Registro y sincronización en el mapa físico de la aplicación (`mapa_aplicacion.md`) y en el mapa semántico de documentación de la IA (`mapa_documentacion_ia.md`).
  - Archivos: [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_final_prototipe.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_final_prototipe.md) [NEW], [Documentacion PROTOTIPE/07_Manuales_Desarrollo/diagrama_flujo_ecosistema.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/diagrama_flujo_ecosistema.md) [NEW], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY], [Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-038: Mapeo Completo del Ecosistema y Diccionario Técnico Detallado~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Mapeo de granularidad estricta al 100% de la lógica de los archivos de la raíz (backup, scripts), motor CLI (config, logger, cli, worker, generator, sync_templates, sync_clients, test_templates, server) y subpaneles/servicios/hooks de la Consola Central (ComponentLibraryView, ComponentSandbox, CoreCard, CoreManagerPanel, CoreSyncPanel, E2EPanel, GitBackupPanel, useCopyToClipboard, useToast, pdfService, App) excluyendo estrictamente la lógica de 'app ventas core' y 'clientes moni'. Sincronizado en el diccionario técnico maestro.
  - Archivos: [Documentacion PROTOTIPE/07_Manuales_Desarrollo/diccionario_tecnico_completo.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/diccionario_tecnico_completo.md) [MODIFY]

* **[x] ~~Tarea CORE-037: Auditoría Técnica Completa, Mapeo General y Plan de Limpieza~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-23
  - Fecha de finalización: 2026-06-23
  - Descripción: Se realizó una investigación y lectura secuencial profunda de todos los archivos del CLI (cli.js, config.js, logger.js, worker_create_project.js, generator.js, sync_templates.js, sync_clients.js, test_templates.js, server.js), dev-dashboard y scripts PowerShell del ecosistema. Se redactó y publicó el informe técnico maestro `auditoria_tecnica_completa_maestra_2026.md` bajo `Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/`, consolidando la explicación de qué hace el proyecto, flujos de trabajo en diagramas de secuencia/flujo de Mermaid, mapeo de comportamiento y funciones de cada archivo, diagnóstico de bugs críticos de inyección de comandos, vulnerabilidades de reglas Firestore, CORS abierto e I/O bloqueantes con soluciones de código concretas, y un plan de limpieza de archivos basura y hoja de ruta para escalabilidad.
  - Archivos: [Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_tecnica_completa_maestra_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_tecnica_completa_maestra_2026.md) [NEW]

* **[x] ~~Tarea CORE-036: Auditoría, Robustecimiento y Blindaje de Seguridad del Servidor CLI Bridge~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-22
  - Fecha de finalización: 2026-06-22
  - Descripción: Se ejecutó auditoría y robustecimiento integral de seguridad y rendimiento en `server.js`. Se implementó la función helper `isPathContained` case-insensitive para prevenir Directory Traversal de forma agnóstica a la plataforma, aplicándose en `/api/library/file`, `/api/library/extract`, `/api/project/file`, `/api/git/status` y `/api/git/backup-stream`. Se mitigó la creación de procesos zombies en Windows reemplazando `ps.kill()` por la llamada recursiva `killProcessTree(ps.pid)`. Se optimizó el Event Loop del servidor refactorizando el escaneo de paridad MD5 a sus variantes asíncronas no bloqueantes (`getSyncFilesRecursiveAsync` y `getSyncFileHashAsync`) mediante promesas en `/api/instancias/list` y `/api/instancias/sync-and-deploy-stream` y su rollback. Se blindó la base de datos contra inyección indirecta sanitizando el `firebaseProjectId` bajo la expresión regular `^[a-z0-9\-]+$`. Por último, se configuró la auditoría de logs interceptando de manera global los métodos de `console` para volcarlos en `cli_bridge.log` y se evitó la duplicación de los preflight checks moviendo `runPreflightChecks()` al arranque del script.
  - Archivos: [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-035: Refactorización Arquitectura Git — Unificación de Ramas, Nomenclatura `cliente/*`, `--no-verify` y Deploy por Instancia~~**
  - Estatus: Completado.
  - Descripción: Se fusionó la rama `produccion` en `main` y se eliminó la primera (local y remota) en el repositorio `prototipe-core-ventas`. `main` es ahora la única rama de producción del Core. El remote de la instancia `ventas-moni-app` fue reconfigurado para apuntar al Core en lugar de a un repositorio propio. La rama local fue renombrada de `master` → `cliente/ventas-moni-app` y publicada en el Core. Se añadió `--no-verify` a todos los comandos `git push` de `git_backup.ps1` y `subproject_backup.ps1`, eliminando el bloqueo por hooks E2E de Playwright en los respaldos. Se eliminó el prompt interactivo de bypass. Se añadió un guard explícito para excluir ramas `cliente/*` del auto-merge a `main`. Se robustecieron `findProjectDir` (3 niveles: `.prototipe.json` → `package.json` → nombre de carpeta), `defaultBase` (prioriza `main`), y el deploy de instancias (lee `.env.local` de la instancia física, no del Core).
  - Archivos: [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY], [Prototipe-CLI/server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-034: Saneamiento y Robustecimiento Integral del Sistema de Backup (10 Puntos de Auditoría)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-22
  - Fecha de finalización: 2026-06-22
  - Descripción: Resueltos y robustecidos los 10 hallazgos de seguridad y calidad del motor de respaldos (`git_backup.ps1`, `subproject_backup.ps1`, `menu_backup.ps1`). Se movió la validación de fugas de credenciales en variables de entorno `.env` a una etapa previa (`pre-add`) en el snapshot del maestro para evitar staging de secretos, y se refinó el detector para excluir del check los archivos en estado `D` (staged delete). Se implementaron validaciones estrictas del código de salida `$LASTEXITCODE` tanto al indexar (`git add .`) como al empujar cambios a GitHub (`git push`), previniendo falsos positivos de éxito. Se creó la función unificada de logging Write-BackupLog para registrar el historial con marca de tiempo en `backup.log`. Además, se optimizó el mensaje de commit automático filtrando subcarpetas de compilación o dependencias y agrupando con `Format-CommitMessageList` si exceden de 5 elementos. Por último, en `menu_backup.ps1`, se implementó una búsqueda recursiva flexible de instancias mediante firmas de proyectos (`package.json`, `.git`, `.git-backup-temp`) superando el límite rígido de profundidad 2, se integró una inicialización remota interactiva tras `git init` para configurar la URL remota del origin, y se añadió la visualización en tiempo real del conteo de cambios pendientes de Git (`Get-GitChangesCount`) para todos los subproyectos del menú utilizando consultas directas sin alterar el estado local. Adicionalmente, se corrigió la codificación de caracteres en consola reemplazando el punto Unicode problemático (`•`) por un carácter de barra seguro (`|`), se solucionó el bug de salida en el menú del script (`Salir` no rompía el bucle do-while exterior debido al comportamiento del switch en PowerShell, lo cual se corrigió con una variable de control `$keepRunning`), y se corrigió el filtro del escaneo de instancias para aplicar el filtro de exclusión de `node_modules` sobre la ruta completa (`$path`) en lugar de sobre el nombre del directorio (`$name`), previniendo la aparición de dependencias locales de Node en el menú de clientes.
  - Archivos: [git_backup.ps1](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY], [menu_backup.ps1](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY], [backup.log](file:///d:/PROTOTIPE/backup.log) [NEW]

* **[x] ~~Tarea CORE-033: Corrección del Sistema de Backup para Instancias de Cliente~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-22
  - Fecha de finalización: 2026-06-22
  - Descripción: Corregido el flujo de backup de instancias de cliente que abortaba por el guardián de seguridad del script `subproject_backup.ps1`. El problema raíz era que `.env.local`, `dist/` y `.firebase/` estaban indexados en el repositorio Git de la instancia `ventas-moni-app`. Se ejecutó `git rm --cached` para desindexarlos, se actualizaron los `.gitignore` de la instancia y de la plantilla core con reglas explícitas y comentadas, y se corrigió el template del `.gitignore` generado en `generator.js` para que todas las instancias futuras nazcan correctamente configuradas. Además, se refinó el guardián de seguridad en `subproject_backup.ps1` para distinguir entre archivos `.env` que están siendo añadidos/modificados (peligroso) vs. eliminados del índice (operación correcta), previniendo falsos positivos en el commit de limpieza.
  - Archivos: [ventas-moni-app/.gitignore](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/.gitignore) [MODIFY], [App Ventas/.gitignore](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.gitignore) [MODIFY], [generator.js (Prototipe-CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [subproject_backup.ps1](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

* **[x] ~~Tarea CORE-032: Adaptación de Pantalla de Login a Temas y Optimización del Contraste del Fondo Tecnológico~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-22
  - Fecha de finalización: 2026-06-22
  - Descripción: Modificada la pantalla de login en `App.jsx` para reemplazar la maquetación estática oscura por variables CSS HSL adaptativas. Ahora, tanto la tarjeta con glassmorphism, el título, los labels y los inputs de email/contraseña responden de manera reactiva e instantánea al tema claro y oscuro del sistema. Además, se incrementó la visibilidad y el contraste de la cuadrícula de puntos y los orbs decorativos de fondo en ambos temas, suavizando también la viñeta perimetral del modo claro en `index.css` para evitar el lavado de los orbs en los bordes de la pantalla. Se incluyó el soporte para inputs tipo `email` en la regla de overrides de contraste de entrada en modo claro. También se corrigió el borde oscuro inconsistente del botón de cambio de tema (`DarkModeToggle.jsx`) en modo claro vinculando sus propiedades de borde y color de icono a variables HSL.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY], [DarkModeToggle.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/ui/DarkModeToggle.jsx) [MODIFY]

* **[x] ~~Tarea CORE-031: Robustecimiento, Preflight Checks y Detección Dinámica de Colisiones de Puerto en CLI Bridge~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Implementados diagnósticos y salvaguardas de seguridad en el backend del bridge (`server.js`). Añadido `runPreflightChecks()` al iniciar el servidor para diagnosticar la disponibilidad de Git y Firebase CLI en el PATH. Integrado el esquema y validador `validatePrototipeMetadata()` para los metadatos `.prototipe.json` de los clientes, previniendo de forma proactiva comportamientos inconsistentes si faltan campos o el archivo se corrompe. Se securizó la ejecución de comandos de git (`execGitCommand`) controlando las cadenas de entrada contra inyecciones y accesos no autorizados. Adicionalmente, se configuró la detección y redirección dinámica de puertos en el inicio del servidor, buscando de manera secuencial puertos incrementales si el puerto inicial `3001` está ocupado (error `EADDRINUSE`). Además, se corrigió la discrepancia de ancho de las tarjetas de clientes en la barra lateral del dashboard (`App.jsx`) aplicando márgenes negativos y padding reactivo para alinearlas simétricamente sin truncar los efectos hover ni sombras.
  - Archivos: [server.js (Prototipe-CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-030: Optimización y Blindaje de Dashboard de Desarrollador y CLI Bridge~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Realizada auditoría técnica completa del dashboard de desarrollador (`dev-dashboard`) y el puente local (`Prototipe-CLI`). Se unificaron las URLs de conexión de API en frontend centralizando el dominio en `CLI_URL`, codificando dinámicamente parámetros con `encodeURIComponent` para evitar roturas de URL. En el backend (`server.js`), se optimizó el buscador recursivo de instancias a 2 niveles para soportar directorios de clientes anidados por Core en sincronización, despliegues y git targets, y se previno el diff línea a línea de archivos binarios (imágenes, logos, zip, etc.) en el detector de desviación (drift) a fin de mitigar fugas de memoria y sobrecarga de CPU.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [ComponentLibraryView.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY], [server.js (Prototipe-CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CORE-029: Corrección de Contornos de Enfoque, Sombras Cortadas en Instancias y Curvatura de Tarjetas Global~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Corregido el problema de contornos (outlines) negros/blancos y anillos de enfoque de Tailwind al hacer clic en los botones interactivos (como el toggle de modo oscuro). Se amplió el padding horizontal y vertical inferior en el contenedor de scroll de la lista de instancias activas (App.jsx) para permitir que la sombra lateral y la micro-interacción en hover se rendericen sin recortarse. Adicionalmente, se estandarizó globalmente el radio de curvatura de todas las tarjetas y modales a 1.25rem (20px) en index.css de forma centralizada mediante overrides en los selectores globales de clase.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

* **[x] ~~E2E-Hotfix: Control de Modal de Telemetría en Tests de Checkout~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Modificado el helper de navegación inicial `passWelcomePage` en `checkout.helpers.js`. Ahora, si al iniciar el test se presenta el modal interactivo de "Prueba de Enlace de Telemetría" (el cual puede estar activo por pings recientes en la base de datos central), Playwright hace clic automáticamente en "Entendido / Aceptar" utilizando un timeout de 3000ms. Esto previene que el modal intercepte e invalide el clic del botón principal "Comencemos", asegurando la ejecución exitosa de la suite E2E y destrabando el flujo de push del script de backup sin modificar la lógica ni los listeners de telemetría de la aplicación.
  - Archivos: [checkout.helpers.js (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/helpers/checkout.helpers.js) [MODIFY]

* **[x] ~~Tarea CORE-028: Fondo Tecnológico Premium Animado — Capas de Grid y Orbs GPU-Accelerated~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Rediseñado el fondo decorativo central para el login y el panel del dashboard. Se implementó una capa de puntos sutiles que deriva continuamente (`grid-drift` a 60s) usando exclusivamente `transform` en un área de viewport sobredimensionada, garantizando 100% de rendimiento por GPU. Se agregaron dos orbs con gradientes radiales elípticos de colores de marca (violeta, cian, índigo) animados independientemente con drift muy lento y suave. Se actualizó la viñeta perimetral de sombreado y se configuraron variables HSL translúcidas `--color-surface-glass` y `backdrop-filter: blur(14px)` en las tarjetas para que el fondo tecnológico sea legible y fluya armónicamente tras las tarjetas en modo oscuro y claro.
  - Archivos: [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

* **[x] ~~Tarea CORE-027: Efecto Flotante Global de Tarjetas — CSS Attribute Selector Override~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Definidos tokens `--card-shadow` y `--card-shadow-hover` adaptativos por tema. Se aplicó un selector CSS de atributo global para divs rounded-2xl y rounded-3xl con bordes, con exclusiones estratégicas. Se generalizó el efecto flotante con sombras de alta calidad y suavidad en hovers y transiciones sin alterar el JSX, y se adaptó con glassmorphism translúcido.
  - Archivos: [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

* **[x] ~~Tarea CORE-026: Corrección de Contraste y Colores Inválidos en Consola de Telemetría y Global~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Corregido el problema de invisibilidad de texto e iconos en los botones interactivos (tabs), buscador y terminal de la Consola de Telemetría en Modo Claro. Definidos y mapeados de forma centralizada en `index.css` los colores de marca e interactivos no estándar (como `-650`, `-550` y `-755`) tanto para `:root.light` (manteniendo alto contraste) como para `:root`. Se reestructuraron las clases de los contenedores de tabs, buscador y la pantalla de la terminal en `App.jsx` para utilizar variables semánticas HSL en lugar de fondos oscuros fijos (como `bg-[#0b0f19]`). Se tradujeron todos los textos y estados de conexión de la consola al español (ej: "Live System Telemetry Console" a "Consola de Telemetría del Sistema en Vivo") y se incrementó el contraste en las etiquetas de estado de los logs.
  - Archivos: [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-025: Inversión Cromática Global y Adaptación Completa de Modo Claro~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Resuelto el problema generalizado de visualización y contraste deficiente al alternar al Modo Claro. Redefinida la escala completa de colores de Tailwind slate (slate-50 a slate-955) como variables CSS custom configurables. En el tema oscuro se aplican los valores tradicionales oscuros, y en el tema claro (`:root.light`) se invierten y mapean de manera adaptativa (bg-slate-900 a fondo blanco puro, text-slate-200 a texto oscuro legible, etc.). Adicionalmente, se implementaron reglas y overrides CSS para remapear de forma transparente los bordes y fondos blancos translúcidos hardcodeados (`border-white/[0.08]`, `bg-white/5`) a sus equivalentes oscuros con opacidad en modo claro. También se introdujeron selectores específicos para invertir de manera inteligente textos y hovers en blanco (`text-white`, `hover:text-white`) dentro de contenedores de fondo claro excluyendo de forma segura a los botones con fondos de color (como `bg-indigo-650`), logrando un contraste perfecto en toda la interfaz sin necesidad de modificar el código de los componentes.
  - Archivos: [index.css (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-024: Integración de Selector de Periodo por Calendario Premium y Gráfico Consolidado~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Renombrado el gráfico consolidado del Dashboard General a "Comisiones Generales" para reflejar el acumulado histórico. Diseñado e integrado un selector de periodo (Mes/Año) estilo calendario interactivo premium con estética glassmorphic en la cabecera. El DatePicker incluye navegación por años, cuadrícula de meses en español y visualización de un punto indicador de datos reales por mes. Al seleccionar un periodo, se filtran de forma reactiva las tarjetas de métricas principales, el desglose de clientes en el acordeón, la distribución por nichos, los costos Dian, y las tablas y sub-tablas de transacciones en los modales de detalle. El gráfico principal permanece histórico y dibuja una línea de referencia (ReferenceLine) discontinua para marcar el mes seleccionado en la tendencia general. Compilación local e integridad verificadas.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-023: Rediseño Premium del Dashboard General con Gráficos Interactivos Recharts, BI Avanzado y Reportes PDF~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Rediseñado el Dashboard General en `App.jsx` reemplazando barras de progreso por gráficos interactivos Recharts (AreaChart general y acordeones con AreaCharts por cliente de Framer Motion). Agregado el widget de Radar de Salud de Instancias en tiempo real con semáforos, latencias en ms y redireccionamiento condicional a la Consola de Errores. Diseñado el submódulo de BI y Eficiencia Financiera en el Simulador de Proyecciones con gráfico PieChart por nicho y desglose de margen neto descontando costos DIAN. Implementados modales funcionales de detalle para Comisión Acumulada, Cobrado y Por Recaudar con tablas dinámicas de transacciones e integración bidireccional con facturación y CRM. Integrada la exportación de PDFs en cascada (Conciliación, Métricas Generales, Directorio de Clientes y Ficha de Cliente).
  - Revisión (2026-06-21 - Hotfix/Ajustes):
    1. Se corrigió el error `React Hook Order Mismatch` moviendo todas las declaraciones de `useMemo` de proyecciones y BI arriba del condicional `if (!user)` para que se ejecuten de forma incondicional en cada renderizado.
    2. Se resolvieron los warnings y fallos de dimensiones de Recharts en mobile (`width(-1) and height(-1)`) especificando alturas numéricas fijas (`height={220}`, `height={112}`, `height={160}`) y `minWidth={0}` en todos los `ResponsiveContainer`.
    3. Se reorganizaron los botones de acción del panel en una cuadrícula responsiva flexible (`grid grid-cols-1 sm:flex`), y el botón/estado de base de datos "Conectado" se integró como un badge interactivo junto al título principal, logrando una interfaz limpia y despejada en celulares.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [pdfService.js (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/services/pdfService.js) [MODIFY]

* **[x] ~~Tarea CORE-022: Auditoría y Fortalecimiento de la Gestión de Plantillas Core~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-21
  - Fecha de finalización: 2026-06-21
  - Descripción: Realizada auditoría técnica completa del módulo de plantillas core. Se implementó una función helper común `performCoreSync` en `server.js` para desacoplar y optimizar la sincronización y sanitización de archivos. Se creó el endpoint `POST /api/cores/:clave/sync` y se redirigió el botón "Sync → CLI" en `CoreCard.jsx` a este endpoint, resolviendo la inconsistencia por la cual se auto-activaban los cores en el wizard e incrementaban de versión sin permiso del desarrollador. Se robusteció la seguridad del endpoint de scaffold validando el core base y se implementó una verificación estricta de nombres de variables de entorno `.env.local` mediante expresiones regulares en backend y frontend (con feedback visual al añadir variables inválidas).
  - Archivos: [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [CoreCard.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [MODIFY]

* **[x] ~~Tarea CORE-021: Fortalecimiento de la Consola de Errores e Incidentes del Dashboard Central~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Robustecida la consola de incidentes en vivo del dashboard central sin remover funcionalidad existente. Se agregaron filtros dinámicos avanzados por estado de resolución (Activos / Resueltos / Todos) y severidad (Cualquier Severidad / Errores / Advertencias / Información). Se implementó un algoritmo premium de de-duplicación (agrupación) de errores repetidos por mensaje y cliente con contador animado de impactos. Se integró un sistema de notas de resolución inline que permite al desarrollador documentar la causa raíz y la solución en Firestore Central al marcar incidentes como resueltos, persistiendo el historial. Las tarjetas métricas de cabecera ahora actúan como filtros dinámicos al hacer clic sobre ellas. Se expandieron las heurísticas de diagnóstico automático en el modal para soportar errores de CORS, fallos de JSON.parse, permisos de Firebase Storage y Firestore en modo offline. Corregida además la omisión de la declaración de los estados de React para filtros de errores (`groupErrorsByMessage`, `selectedErrorStatusFilter`, `selectedErrorTypeFilter`, `resolutionNoteInputId`, `resolutionNoteText`) que causaba un crash `ReferenceError` al renderizar el componente principal.
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-020: Arquitectura Multi-Core Escalable en template-core-seed y CLI~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Refactorización y desacoplamiento de `template-core-seed` para soportar múltiples cores (billing configurable con adaptador, limpieza de campos e-commerce, hook useBilling). Reestructuración de `Instancias Clientes/` por core, actualización de scripts de backup y actualización del CLI (`generator.js` y `config.js`) para soportar la resolución dinámica de rutas por `coreType` y su sincronización central. Además, se validó la compilación local (`npm run build`) en todos los proyectos del ecosistema y se solucionó el bug de compilación de `template-core-seed` copiando el script autogenerador de mapa semántico para IA.
  - Archivos: [index.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/constants/index.js) [MODIFY], [billingService.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/billingService.js) [MODIFY], [useBilling.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useBilling.js) [MODIFY], [appConfigStore.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js) [MODIFY], [appConfigService.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/appConfigService.js) [MODIFY], [DeveloperDiagnosticsModal.jsx (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/admin/settings/DeveloperDiagnosticsModal.jsx) [MODIFY], [centralFirebaseService.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/centralFirebaseService.js) [MODIFY], [config.js (CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/config.js) [MODIFY], [generator.js (CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY], [plantillas_registro.json (CLI)](file:///d:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json) [MODIFY], [generate_ia_map.js (seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/scratch/generate_ia_map.js) [NEW]


* **[x] ~~Tarea CORE-019: Estandarización Total del Sistema de Telemetría e Interactividad en ventas-moni-app y Corrección de Dropdowns en Central~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Sincronización manual de la instancia activa `ventas-moni-app` con el Core para eliminar el drift crítico detectado tras la implementación de CORE-018. Se reemplazó la lógica de descarte de alertas basada en texto (`title-message-type`) por la clave única `alertId` en `App.jsx`, se agregó el estado `activePingRequest` con autocierre a 30s y el handler del evento `'ping-test-requested'`, y se insertó el modal interactivo de "Prueba de Conexión" idéntico al del Core. En `useAppConfigSync.js`, se reemplazó la auto-respuesta silenciosa al ping por el despacho del evento interactivo con validación de expiración (>60s) y comparación de timestamps `triggerPing > lastPingResponse`. Adicionalmente, se resolvieron 2 bugs activos de la interfaz central (`dev-dashboard`): cierre por clic fuera (click-outside) usando `useRef` + `mousedown` en los dropdowns de `CoreSyncPanel.jsx` y `App.jsx`, y refactorización a estado puro de React en el selector de tipo de alerta de `App.jsx` eliminando referencias frágiles y duplicados de ID de DOM. Builds de integridad aprobados en ambos proyectos.
  - Archivos: [App.jsx (ventas-moni-app)](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/src/App.jsx) [MODIFY], [useAppConfigSync.js (ventas-moni-app)](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/src/hooks/useAppConfigSync.js) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [CoreSyncPanel.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-018: Ping Test Interactivo con Alerta de Prueba Personalizada, Autocierre y Descarte~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Rediseñado el flujo de Ping Test de telemetría para hacerlo interactivo. El Dashboard escribe `triggerPing` y el timeout se aumenta a 30s. En el cliente se muestra un modal de prueba de conexión reutilizando exactamente el diseño de la alerta remota (backdrop blur, Framer Motion, estilos theme-aware) pero con temática de telemetría y botones de confirmación y descarte. Al confirmar, el cliente escribe `lastPingResponse` y el test finaliza con éxito. Si el administrador está ocupado o ignora la solicitud, el modal se cierra automáticamente tras 30 segundos (o puede cerrarse manualmente haciendo clic en "Descartar prueba" o en el backdrop) sin interrumpir el flujo ni arrojar errores. Propagado a plantillas CLI (`template-ventas` y `template-core-seed`).
  - Archivos: [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [useAppConfigSync.js (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY], [App.jsx (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY], [useAppConfigSync.js (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY], [App.jsx (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/App.jsx) [MODIFY], [useAppConfigSync.js (template-core-seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js) [MODIFY], [App.jsx (template-core-seed)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-017: Detección por Hash MD5 de Drift de Instancias, Exclusión de Mapas de Arquitectura, Consola Dinámica y Perfil Theme-Aware~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Implementado el control real de drift por hash MD5 en el listado de instancias locales. Se corrigió la terminal de sincronización de cores para responder de forma premium y adaptativa al tema claro/oscuro. Se excluyeron los mapas de arquitectura auto-generados dinámicamente de la validación del drift. Se separó el Canal de Telemetría (Ping Test) en dos botones separados ("Enviar Alerta de Prueba" y "Verificar Conexión") y se previno en la app cliente la reapertura de la alerta mediante el uso de `useRef` comparativos sobre el snapshot de telemetría. Además, se solucionó el destello/parpadeo de la alerta remota al recargar la app cliente resolviendo síncronamente el estado de localStorage en el render, y se adaptaron al modo oscuro/claro el Perfil de Administrador y la Consola de Telemetría en el Dashboard Central, traduciendo sus textos del inglés al español.
  - Archivos: [CoreSyncPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [App.jsx (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY], [App.jsx (template-ventas)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CORE-016: Ping-Pong Real, Alertas Remotas Funcionales y Corrección de Token Vinculado~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Implementado el ciclo **Ping-Pong real via Firestore** sin Cloud Functions. El Dashboard escribe `triggerPing` en `clientes_control/{clientId}`, la app cliente lo detecta via `onSnapshot` y responde con `lastPingResponse`. El Dashboard calcula la latencia real; si no hay respuesta en 5s muestra Timeout. Las **Alertas Remotas** ahora son 100% funcionales: creado `centralFirebaseService.js` como segunda app de Firebase y modificado `useAppConfigSync.js` para escuchar `sistemaAlerta` en tiempo real desde la BD central. El **Token Vinculado** se muestra correctamente resolviendo desde `cfg.telemetryToken` (ahora persistido en Firestore en el aprovisionamiento) o fallback en `tokens`. Reglas de Firestore actualizadas con `affectedKeys().hasOnly(['lastPingResponse'])`. Propagado a templates CLI `template-ventas` y `template-core-seed`.
  - Archivos: [centralFirebaseService.js (App Ventas)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/centralFirebaseService.js) [NEW], [useAppConfigSync.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY], [App.jsx (dev-dashboard)](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [firestore.rules](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firestore.rules) [MODIFY]

* **[x] ~~Tarea CORE-015: Rediseño Premium de la Interfaz de Diagnósticos del Dashboard Central~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Rediseñado a fondo el modal de diagnóstico por cliente en el Dashboard Central. Se eliminaron por completo los bordes toscos de color claro/gris sólido, implementando un diseño de tipo glassmorphism premium con degradados de fondo HSL, bordes translúcidos (`border-white/[0.04]`), sombras profundas (`shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]`), micro-animaciones en hover y cabeceras elásticas, alineado al estándar de excelencia visual del proyecto.
  - Archivos: [dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

* **[x] ~~Tarea CLI-019: Automatización de Alertas Remotas, Reinicio Mensual y Sincronización CLI de Plantillas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-20
  - Fecha de finalización: 2026-06-20
  - Descripción: Integrado el soporte de reinicio automático mensual, alerta bloqueante remota por pago (sistemaAlerta) y visor mensual exitoso en la plantilla de CLI `template-ventas` ejecutando el script `sync_templates.js` para asegurar que absolutamente todas las futuras aplicaciones de ventas creadas por el motor CLI hereden esta funcionalidad de forma nativa e integrada.
  - Archivos: [Prototipe-CLI/templates/template-ventas/](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/) [MODIFY]

* **[x] ~~Tarea CORE-014: Corrección de Visibilidad de Nuevas Instancias y Auto-configuración de Telemetría~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Resuelto el problema por el cual las nuevas instancias registradas (como `moni-app`) no aparecían en el CRM de Clientes ni en la cuenta general de Clientes Activos. Se cambió el contador de clientes activos para leer de `clientesSaas` y se reestructuró `clientAggregated` para inicializarse con todos los clientes de `clientesSaas`. Además, se implementó el auto-enlace de telemetría (blindaje) al momento del registro: la Consola Central inyecta automáticamente el token de telemetría autogenerado y el endpoint HTTPS de Cloud Run directamente en el archivo `.env.local` de la instancia usando la API del puente local, previniendo errores de reporte de facturación. Se corrigió manualmente el `.env.local` de la app Moni con su token registrado (`moni-app-token-1781921496178`).
  - Archivos: [App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [ventas-moni-app/.env.local](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/.env.local) [MODIFY]

* **[x] ~~Tarea CORE-013: Sincronizador Core a Clientes y Despliegue en Lote Aislado~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Diagnosticado y corregido el problema arquitectural donde `CoreSyncPanel.jsx` usaba un endpoint de ramas Git que no coincidía con la arquitectura real de directorios físicos. Implementados dos nuevos endpoints en `server.js`: `GET /api/instancias/list` (lista instancias físicas con delta de versión core vs cliente) y `GET /api/instancias/sync-and-deploy-stream` (SSE de sincronización física diferencial por hash MD5 con 6 fases: detección, backup, copia, build, actualización de metadata y deploy opcional). Reescrito `CoreSyncPanel.jsx` con nueva fuente de datos, badges de versión por cliente, toggle de deploy y estados por fase (syncing/building/deploying/success/error).
  - Archivos: [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [CoreSyncPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY]

* **[x] ~~Tarea CORE-012: Inicialización, Aprovisionamiento y Despliegue de Instancia (Moni)~~**

  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Creada y configurada la primera carpeta física de cliente independiente en `D:\PROTOTIPE\Instancias Clientes\ventas-moni-app` utilizando la plantilla limpia. Configurado el entorno Git de la instancia desindexando `node_modules` de forma definitiva y agregando el Git Hook de pre-commit. Conectada la aplicación con el proyecto Firebase `ventas-moni-app` y vaciada toda la base de datos de Firestore para habilitar el asistente de onboarding nativo directamente en la primera carga. Compilado y desplegado de forma local (`localhost:5173`) y a producción en Firebase Hosting (`https://ventas-moni-app.web.app`).
  - Archivos: [Instancias Clientes/ventas-moni-app/](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/) [NEW]

* **[x] ~~Tarea CORE-011: Rediseño Premium de la Interfaz del Catálogo (Laboratorio Visual Fase 3) - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Completado el rediseño premium de la sección del catálogo de clientes para adoptar un estilo Apple Store y Shopify. Implementada la cabecera buscador sticky translúcida con HSL, blur de fondo y sin líneas de borde rígidas; rediseñados los chips de categorías a pastillas flotantes con transiciones de fondo deslizante elástico animado (layoutId); reestructurado el banner promocional para que la imagen abarque la totalidad de forma uniforme con object-cover, inyectando un degradado lateral asimétrico que evita oscurecer el producto, un sello flotante interactivo (sticker) con micro-animación de rotación en hover, un resplandor ambiental dinámico de marca en hover, y destellos de luz de barrido metálico en los badges de oferta; y reestructurado ProductCard con curvaturas de 20px, sombras multicapa finas en hover y microinteracciones de rotación/escala en el botón de agregar.
  - Archivos: [ClientCatalog.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY], [CatalogBanner.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/CatalogBanner.jsx) [MODIFY], [ProductCard.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]

* **[x] ~~Tarea CORE-010: Stock Infinito para Productos Preparados / Ilimitados - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Implementada la funcionalidad de "stock infinito" (productos preparados) que permite omitir el control de inventario de manera estratégica y dinámica. Añadido el toggle en ProductFormModal (Inventario y Stock), modificada la validación Zod en inventorySchemas para aceptar el flag stockInfinito, actualizados los listados (AdminInventory) en desktop y mobile con indicador visual "∞ Ilimitado", y ajustadas las transacciones y decrementos en orderService para omitir reducciones de stock si el producto es ilimitado. Se actualizaron los tableros de métricas en AdminHome y alertas en AdminStockAlerts para no emitir advertencias de stock bajo sobre estos productos. Adicionalmente, se pulió la tienda de cara al cliente (ProductDetailPage, ProductCard, ProductDetailModal) para ocultar la cantidad de stock técnico (9999) reemplazándola por una elegante etiqueta de "Disponible" y limitando el selector de cantidad máxima a 999 en productos de stock ilimitado.
  - Archivos: [inventorySchemas.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/schemas/inventorySchemas.js) [MODIFY], [ProductFormModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY], [AdminInventory.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY], [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY], [AdminStockAlerts.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminStockAlerts.jsx) [MODIFY], [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY], [ProductDetailPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY], [ProductCard.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY], [ProductDetailModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]

* **[x] ~~Tarea CORE-009: Rediseño Premium de la Gestión de Pedidos (Laboratorio Visual Fase 2) - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Completado el rediseño premium de la sección de administración de pedidos (AdminOrders.jsx) adaptando las tarjetas resumen al estilo "Comanda Asimétrica" responsivo (ordenando cabeceras, estado, tipo de entrega, empaquetado de items en contenedor interno y alineaciones en móvil y desktop sin eliminar elementos), optimizando el grid de métricas con el estilo wallet animado elástico de la marca (caja y créditos) e implementando un carrusel de filtros de estado planos con contadores dinámicos que se expanden de borde a borde en dispositivos móviles sin recortes de sombras ni overflows.
  - Archivos: [AdminOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]

* **[x] ~~Tarea CORE-008: Correcciones del Panel de Inicio del Administrador y Catálogo de Estilos UI/UX - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Corregido el recorte de tarjetas wallet y sombras en hover en computadoras (añadido overflow-visible responsivo), adaptada la paleta de colores de la cabecera y tarjeta de caja principal al tema HSL activo para evitar choques visuales de marca, resuelto el bug de scroll de fondo bloqueado al cerrar el modal de selección de temas e implementada la expansión edge-to-edge del carrusel en celulares. Creado además el catálogo de estilos visuales unificados del ecosistema.
  - Archivos: [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY], [AppearanceSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx) [MODIFY], [catalogo_estilos_ui.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Estilos/catalogo_estilos_ui.md) [NEW], [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CORE-007: Rediseño Premium de Inicio del Administrador (Laboratorio Visual Fase 1) - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Implementada una interfaz financiera premium de tipo "wallet" elástica y responsiva para el inicio administrativo. Se diseñó una cabecera curvada superior con degradado elástico, un carrusel de tarjetas "wallet" responsivo con balances y desgloses de caja que soporta arrastre por snap en móvil, una lista interactiva de transacciones con iconos Lucide y fondos en colores pastel dinámicos, y accesos directos minimalistas. Todo esto sin suprimir ninguna función lógica ni métricas previas.
  - Archivos: [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]

* **[x] ~~Tarea CORE-006: Auditoría, Saneamiento y Estabilización del Sistema de Notificaciones - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Refactorizado useNotificationCenter con un listener dedicado en tiempo real para conteo exacto de no leídos de Firestore (solucionando el bug de paginación), optimizada la bandeja de notificaciones en NotificationHistoryTray inyectando iconos de Lucide dinámicos y clases de color del sistema de diseño (evitando el purgado), robustecido el useEffect de Toasts en AdminLayout, ClientLayout y PortalLayout para encolar múltiples alertas flotantes simultáneas, y saneado imports sin uso en PortalMensajero.
  - Archivos: [notificationCenterService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/notificationCenterService.js) [MODIFY], [useNotificationCenter.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useNotificationCenter.js) [MODIFY], [NotificationHistoryTray.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/common/NotificationHistoryTray.jsx) [MODIFY], [AdminLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY], [ClientLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY], [PortalLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/PortalLayout.jsx) [MODIFY], [PortalMensajero.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/portal/PortalMensajero.jsx) [MODIFY]

* **[x] ~~Tarea CORE-005: Auditoría y Optimización del Módulo 5 (Créditos y Saldos) - App Ventas~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-19
  - Fecha de finalización: 2026-06-19
  - Descripción: Estandarizados los modales de abonos con ModalTemplate en AdminCredits y ClientCredits, optimizadas las consultas del PDF de cartera limitándolo a créditos activos, removido useOrders en la vista de créditos, y asegurada consistencia transaccional en abonos concurrentes.
  - Archivos: [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY], [ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY], [pdfService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) [MODIFY], [creditService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) [MODIFY]

* **[x] ~~Tarea CORE-001: Elaboración de Checklist de Auditoría del Core (App Ventas)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-18
  - Fecha de finalización: 2026-06-18
  - Descripción: Elaborado un checklist detallado para auditar y corregir inconsistencias y cuellos de botella de los 5 módulos core (Ventas, Bodega, Autenticación, Reparto y Créditos), saneando referencias obsoletas a Gastrobar.
  - Archivos: [checklist_auditoria_core.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/checklist_auditoria_core.md) [NEW], [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CLI-018: Registro Explícito de Rol 'client' en Colección de Usuarios (Ecosistema)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Modificado `LoginPage.jsx` tanto en la plantilla base `App Ventas` como en las plantillas del CLI para registrar explícitamente el campo `role: 'client'` en los nuevos perfiles de usuario cliente.
  - Archivos: [LoginPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY], [LoginPage.jsx](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]

* **[x] ~~Tarea CLI-017: Fix de Sesión Huérfana de Administrador en App Ventas (Ecosistema)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Modificado `useAuthInit.js` de la plantilla base de Ventas para validar y recrear el documento del admin en Firestore en caso de que su sesión de Auth local esté activa pero sus datos de Firestore hayan sido borrados.
  - Archivos: [useAuthInit.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js) [MODIFY]

* **[x] ~~Tarea CLI-016: Remoción Completa de Función de Gestión de Base de Datos~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Removida en su totalidad la funcionalidad de gestión, conteo y purga de colecciones de bases de datos de clientes, eliminando endpoints en el servidor y todos los estados, manejadores, botones y maquetación JSX de modal en el panel de control.
  - Archivos: [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-015: Corrección de Estructura y Responsividad Móvil del CRM de Clientes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Corregida la estructura y responsividad de los botones en la versión móvil del CRM de Clientes. Se rediseñó el contenedor global a una cuadrícula de 2 columnas en mobile (`grid-cols-2`) y se aplicaron flexibidad de crecimiento y anchos mínimos (`min-w`) en los botones de directorio de clientes para evitar truncamientos y desbordamientos. Adicionalmente, se corrigió el bug en la función de resolución de rutas de proyectos `findProjectDir` en `server.js` que causaba errores 500 al no encontrar proyectos en directorios de plantillas core si el directorio de instancias no existía en disco.
  - Archivos: [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-014: Arquitectura General y Agnóstica de Skills de IA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Reescritas las 7 skills del ecosistema para ser agnósticas al proyecto usando la variable dinámica `[PROYECTO_ACTIVO]`, triggers conscientes de proyectos, y rutas dinámicas estructuradas. Integrados además los cambios específicos de cada skill (categorías, colisiones, tabla canónica de simulabilidad y resolución de conflictos git).
  - Archivos: Carpetas en [Skills](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/) [MODIFY]

* **[x] ~~Tarea CLI-013: Depuración de Rutas Obsoletas (D:\Aplicaciones)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Remoción del fallback obsoleto `D:\Aplicaciones` en `server.js` y actualización de 5 referencias de rutas obsoletas a `D:\PROTOTIPE` en los manuales, mapas de arquitectura y especificaciones del ecosistema de documentación.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [mapa_arquitectura.md](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/mapa_arquitectura.md) [MODIFY], [SKILL.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_extractor/SKILL.md) [MODIFY], [manual_brand_config.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_brand_config.md) [MODIFY], [resumen_ejecutivo_proyecto.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/resumen_ejecutivo_proyecto.md) [MODIFY], [sincronizacion_templates_universal.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/sincronizacion_templates_universal.md) [MODIFY]

* **[x] ~~Tarea CLI-012: Saneamiento y Estandarización de Nomenclatura en Biblioteca~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Remoción de componentes duplicados (`ConnectivityToast` y `DatePicker`), eliminación del roadmap obsoleto (`tareas_pendientes_prioritarias.md`), y renombrado de 6 carpetas/archivos en la biblioteca al estándar de español claro.
  - Archivos: `06_Biblioteca_Componentes` [MODIFY], `02_Tareas_Roadmap/tareas_pendientes_prioritarias.md` [DELETE], [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CLI-011: Actualización a System Prompt v2.0 (GEMINI.md)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Implementado el nuevo SYSTEM PROMPT v2.0 en GEMINI.md con la matriz de severidad, jerarquía de prioridades, control de secreto de Firebase, y adaptado `sync_rules.js` para mantener la compatibilidad con las secciones numeradas de la v2.0. Propagado a los 5 proyectos.
  - Archivos: [GEMINI.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY], [sync_rules.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY]

* **[x] ~~Tarea CLI-010: Sincronización del Ecosistema a Plan Blaze y Telemetría Centralizada~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Modificado `generator.js` en `Prototipe-CLI` para no inyectar variables de entorno centralizadas secundarias en `.env.local`, inyectando por defecto el endpoint unificado `VITE_DEVELOPER_TELEMETRY_ENDPOINT` que apunta a la Cloud Function HTTPS en producción.
  - Archivos: [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CLI-009: Habilitación de Scaffold Limpio (Core Seed) en Gestión de Cores~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Implementado el soporte para realizar scaffolding de nuevos Cores utilizando una plantilla limpia del sistema (`template-core-seed`). Modificado el endpoint `/api/cores/:clave/scaffold` en `server.js` (CLI).
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-008: Saneamiento de Detección Git en Ecosistema (CLI & Dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Refactorizada la detección de Git en el bridge server (`server.js`) para utilizar `git rev-parse --git-dir` en lugar del chequeo físico estático de la carpeta `.git`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-007: Robustez en Respaldo de Subproyectos con .git-backup-temp~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Refactorizado `subproject_backup.ps1` para detectar de forma autónoma si un subproyecto está en estado inactivo con la carpeta `.git-backup-temp` y renombrarlo temporalmente a `.git` para realizar la indexación de cambios.
  - Archivos: [subproject_backup.ps1](file:///D:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

* **[x] ~~Tarea CLI-006: Corrección de Bugs de Referencia, Git y Bloqueo de SSE en Automatización~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Corregido en `generator.js` el ReferenceError de `initials` y `storageRulesContent`. Refactorizado `/api/create-project` en `server.js` regresando a una respuesta HTTP JSON estándar y limpia sin SSE.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CLI-005: Saneamiento de Carpetas Git Temporales y Robustez de Vite en Backups~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Corregido el bug de bloqueo y permanencia de carpetas temporales `.git-backup-temp`. Se mejoró la detención de procesos de desarrollo en `git_backup.ps1` y `menu_backup.ps1`.
  - Archivos: [git_backup.ps1](file:///D:/PROTOTIPE/git_backup.ps1) [MODIFY], [menu_backup.ps1](file:///D:/PROTOTIPE/menu_backup.ps1) [MODIFY]

* **[x] ~~Tarea CLI-004: Tres Mejoras de Robustez y Carga de Logo en Onboarding Wizard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Agregado el endpoint `/api/firebase/validate` y el optimizador y compresor de logo mediante Jimp en el endpoint `/api/upload-logo`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-003: Guardián de Calidad y PWA en Deploy con Auto-Resolución y Drift Detector CRM~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Modificado el endpoint de deploy en `server.js` para ejecutar de forma síncrona el auditor físico antes de realizar el deploy. Implementados los endpoints `/api/project/drift` y `/api/project/sync-file`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-002: Optimización de Chunks de Bundle y Refinamiento de Auditor PWA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Refinamiento de la API `/api/project/audit` en `server.js` para leer el manifest de Vite y omitir las penalizaciones por tamaño de chunks cargados dinámicamente.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-001: Integración de Herramientas de Automatización en CLI Bridge Server~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Redireccionados logs en `worker_create_project.js` por IPC y agregadas APIs `/api/library/extract`, `/api/project/deploy` y getters/setters de variables de entorno en `/api/project/env`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [worker_create_project.js](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]

* **[x] ~~Tarea CLI-015: Corrección de Estructura y Responsividad Móvil del CRM de Clientes~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Corregida la estructura y responsividad de los botones en la versión móvil del CRM de Clientes. Se rediseñó el contenedor global a una cuadrícula de 2 columnas en mobile (`grid-cols-2`) y se aplicaron flexibidad de crecimiento y anchos mínimos (`min-w`) en los botones de directorio de clientes para evitar truncamientos y desbordamientos. Adicionalmente, se corrigió el bug en la función de resolución de rutas de proyectos `findProjectDir` en `server.js` que causaba errores 500 al no encontrar proyectos en directorios de plantillas core si el directorio de instancias no existía en disco.
  - Archivos: [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY], [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-014: Arquitectura General y Agnóstica de Skills de IA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Reescritas las 7 skills del ecosistema para ser agnósticas al proyecto usando la variable dinámica `[PROYECTO_ACTIVO]`, triggers conscientes de proyectos, y rutas dinámicas estructuradas. Integrados además los cambios específicos de cada skill (categorías, colisiones, tabla canónica de simulabilidad y resolución de conflictos git).
  - Archivos: Carpetas en [Skills](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/) [MODIFY]

* **[x] ~~Tarea CLI-013: Depuración de Rutas Obsoletas (D:\Aplicaciones)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Remoción del fallback obsoleto `D:\Aplicaciones` en `server.js` y actualización de 5 referencias de rutas obsoletas a `D:\PROTOTIPE` en los manuales, mapas de arquitectura y especificaciones del ecosistema de documentación.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [mapa_arquitectura.md](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/mapa_arquitectura.md) [MODIFY], [SKILL.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_extractor/SKILL.md) [MODIFY], [manual_brand_config.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_brand_config.md) [MODIFY], [resumen_ejecutivo_proyecto.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/resumen_ejecutivo_proyecto.md) [MODIFY], [sincronizacion_templates_universal.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/sincronizacion_templates_universal.md) [MODIFY]

* **[x] ~~Tarea CLI-012: Saneamiento y Estandarización de Nomenclatura en Biblioteca~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Remoción de componentes duplicados (`ConnectivityToast` y `DatePicker`), eliminación del roadmap obsoleto (`tareas_pendientes_prioritarias.md`), y renombrado de 6 carpetas/archivos en la biblioteca al estándar de español claro.
  - Archivos: `06_Biblioteca_Componentes` [MODIFY], `02_Tareas_Roadmap/tareas_pendientes_prioritarias.md` [DELETE], [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

* **[x] ~~Tarea CLI-011: Actualización a System Prompt v2.0 (GEMINI.md)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Implementado el nuevo SYSTEM PROMPT v2.0 en GEMINI.md con la matriz de severidad, jerarquía de prioridades, control de secreto de Firebase, y adaptado `sync_rules.js` para mantener la compatibilidad con las secciones numeradas de la v2.0. Propagado a los 5 proyectos.
  - Archivos: [GEMINI.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY], [sync_rules.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY]

* **[x] ~~Tarea CLI-010: Sincronización del Ecosistema a Plan Blaze y Telemetría Centralizada~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Modificado `generator.js` en `Prototipe-CLI` para no inyectar variables de entorno centralizadas secundarias en `.env.local`, inyectando por defecto el endpoint unificado `VITE_DEVELOPER_TELEMETRY_ENDPOINT` que apunta a la Cloud Function HTTPS en producción.
  - Archivos: [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CLI-009: Habilitación de Scaffold Limpio (Core Seed) en Gestión de Cores~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-12
  - Fecha de finalización: 2026-06-12
  - Descripción: Implementado el soporte para realizar scaffolding de nuevos Cores utilizando una plantilla limpia del sistema (`template-core-seed`). Modificado el endpoint `/api/cores/:clave/scaffold` en `server.js` (CLI).
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-008: Saneamiento de Detección Git en Ecosistema (CLI & Dashboard)~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Refactorizada la detección de Git en el bridge server (`server.js`) para utilizar `git rev-parse --git-dir` en lugar del chequeo físico estático de la carpeta `.git`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-007: Robustez en Respaldo de Subproyectos con .git-backup-temp~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Refactorizado `subproject_backup.ps1` para detectar de forma autónoma si un subproyecto está en estado inactivo con la carpeta `.git-backup-temp` y renombrarlo temporalmente a `.git` para realizar la indexación de cambios.
  - Archivos: [subproject_backup.ps1](file:///D:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

* **[x] ~~Tarea CLI-006: Corrección de Bugs de Referencia, Git y Bloqueo de SSE en Automatización~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Corregido en `generator.js` el ReferenceError de `initials` y `storageRulesContent`. Refactorizado `/api/create-project` en `server.js` regresando a una respuesta HTTP JSON estándar y limpia sin SSE.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

* **[x] ~~Tarea CLI-005: Saneamiento de Carpetas Git Temporales y Robustez de Vite en Backups~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-11
  - Fecha de finalización: 2026-06-11
  - Descripción: Corregido el bug de bloqueo y permanencia de carpetas temporales `.git-backup-temp`. Se mejoró la detención de procesos de desarrollo en `git_backup.ps1` y `menu_backup.ps1`.
  - Archivos: [git_backup.ps1](file:///D:/PROTOTIPE/git_backup.ps1) [MODIFY], [menu_backup.ps1](file:///D:/PROTOTIPE/menu_backup.ps1) [MODIFY]

* **[x] ~~Tarea CLI-004: Tres Mejoras de Robustez y Carga de Logo en Onboarding Wizard~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Agregado el endpoint `/api/firebase/validate` y el optimizador y compresor de logo mediante Jimp en el endpoint `/api/upload-logo`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-003: Guardián de Calidad y PWA en Deploy con Auto-Resolución y Drift Detector CRM~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Modificado el endpoint de deploy en `server.js` para ejecutar de forma síncrona el auditor físico antes de realizar el deploy. Implementados los endpoints `/api/project/drift` y `/api/project/sync-file`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-002: Optimización de Chunks de Bundle y Refinamiento de Auditor PWA~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Refinamiento de la API `/api/project/audit` en `server.js` para leer el manifest de Vite y omitir las penalizaciones por tamaño de chunks cargados dinámicamente.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

* **[x] ~~Tarea CLI-001: Integración de Herramientas de Automatización en CLI Bridge Server~~**
  - Estatus: Completado.
  - Fecha de registro: 2026-06-10
  - Fecha de finalización: 2026-06-10
  - Descripción: Redireccionados logs en `worker_create_project.js` por IPC y agregadas APIs `/api/library/extract`, `/api/project/deploy` y getters/setters de variables de entorno en `/api/project/env`.
  - Archivos: [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY], [worker_create_project.js](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]