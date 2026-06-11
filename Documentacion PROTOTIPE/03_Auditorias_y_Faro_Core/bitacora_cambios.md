### [2026-06-11] - Hotfix: Corrección en Detección de Repositorios Git y Estado de Cambios Ecosistema
* **Tipo:** Corrección de Bug / Git / CLI Bridge
* **Descripción de Cambios:**
  1. **Detección Estricta por Directorio (`.git` físico):** Refactorizado el endpoint `/api/git/targets` para validar la existencia física de la carpeta `.git` local en cada subproyecto (con `fs.pathExists`) en vez del comando `git rev-parse --git-dir` que heredaba el repositorio padre. Con esto, las plantillas core y proyectos sin Git (como `App Agendamiento`, `App Domiciliarios`, `App Gastronomia` y `App Servicios`) se detectan con paridad absoluta como "Sin .git".
  2. **Trazabilidad de Cambios en Ecosistema Maestro:** Se modificó la validación de `hasChanges` del target Maestro (`PROTOTIPE Ecosistema (Maestro)`) para que declare cambios activos (`hasChanges = true`) si existen modificaciones en el repositorio maestro **o** en el repositorio del dashboard de desarrollo (`dev-dashboard`), garantizando que la consola muestre el estado de cambios real antes de respaldar.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
* **Verificación:** Ejecución y compilación correctas. Mapeo verificado en el dashboard.

### [2026-06-11] - Fase 3: Git Strategies UI + Trazabilidad Firestore (GitBackupPanel + CLI Bridge)
* **Tipo:** Nueva Característica / Control de Versiones / Trazabilidad / UX
* **Descripción de Cambios:**
  1. **`subproject_backup.ps1` (No-Interactivo):** Refactorizado completamente el script de respaldo. Se añadieron los parámetros `[switch]$Push` (default `$true`) y `[switch]$AutoMerge` (default `$false`). Se eliminaron todos los bloqueos `Read-Host` que impedían el streaming SSE: la decisión de push/merge ahora es controlada por parámetros de línea de comandos, no por input interactivo. Si no hay conexión SSH, el commit queda local sin abortar el proceso.
  2. **`server.js` — Endpoint `backup-stream`:** Añadidos los query params `push` y `autoMerge`. Se pasan como flags `-Push:$false` y `-AutoMerge` al invocación del script PS. Al completar el proceso exitosamente, el endpoint emite un evento SSE adicional `metadata` con `{ path, targetName, branch, message, push, autoMerge, timestamp }` para trazabilidad en el frontend.
  3. **`firebase.js` — Singleton compartido [NEW]:** Creado módulo `src/firebase.js` que reutiliza la instancia de Firebase mediante `getApps/getApp` (evita double-init). Exporta `db` para uso en componentes hijos sin acoplar con la lógica de `App.jsx`.
  4. **`GitBackupPanel.jsx` — Estrategia Git UI + Trazabilidad:** Añadidos estados `doPush` y `doAutoMerge`. Renderizados 2 toggles estilo switch con animación de deslizamiento: "Sincronizar a GitHub" (índigo) y "Auto-Merge a producción" (ámbar, solo visible si rama ≠ main). El toggle de Auto-Merge se oculta/resetea automáticamente al desactivar Push. Integrado listener SSE para el evento `metadata`: al completar un respaldo exitoso de una **instancia de cliente** (`Instancias Clientes`), se escribe automáticamente en Firestore colección `historial_respaldos` con todos los metadatos del respaldo.
* **Archivos Modificados/Creados:**
  - [`d:/PROTOTIPE/subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]
  - [`d:/PROTOTIPE/Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/firebase.js`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/firebase.js) [NEW]
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) [MODIFY]
* **Verificación:** Compilación `vite build` exitosa en 1.09s. Sin errores de sintaxis ni imports rotos.

### [2026-06-11] - Módulo Control Git (Frontend) — GitBackupPanel + Navegación (dev-dashboard)
* **Tipo:** Nueva Característica / UI / Control de Versiones
* **Descripción de Cambios:**
  1. **Tab `git` en NAV_TABS:** Verificado que el id `git` ya estaba registrado con icono `GitCommit`. No se requirió adición.
  2. **`GitBackupPanel.jsx`:** Componente completamente funcional (597 líneas) que incluye selector de targets por categoría (Maestro, Consola, Core, Cliente), visor de cambios Git con badges por tipo (A/M/D/R), alerta de fuga `.env`, auto-generador de mensaje de commit, acción de backup via SSE (`/api/git/backup-stream`) con terminal estilo UNIX oscuro y estado del proceso (running/done/error/abort).
  3. **Corrección del Bottom Nav Móvil:** Excluido `git` del filtro del `grid-cols-5` del bottom nav para evitar overflow con 6 items. El tab queda accesible desde el menú de perfil.
  4. **Menú de Perfil Móvil:** Expandido el grid de accesos de desarrollador de `grid-cols-2` a `grid-cols-3` añadiendo un botón `GitCommit` → `setActiveTab('git')`.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) [MODIFY]
* **Verificación:** Compilación `vite build` exitosa (✓ built in 1.05s). Sin errores de sintaxis ni dependencias rotas.

### [2026-06-11] - Corrección de Fijación en Scroll de Smartphone Mockup (dev-dashboard)
* **Tipo:** Corrección de Interfaz / CSS / Layout
* **Descripción de Cambios:**
  - **Fijación de Contenedor de Vista Previa:** Añadimos las clases `relative h-full` al wrapper de columna de la grilla principal (`lg:col-span-5`) en el Onboarding Wizard en `App.jsx`. Esto asegura que el elemento hijo con clase `sticky` tenga una altura contenedora de referencia (la del track completo de la grilla lateral izquierda) y no colapse a la altura de sí mismo, permitiendo que el smartphone mockup flote estáticamente al hacer scroll en lugar de esconderse hacia arriba.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilación exitosa en producción (`npm run build` en dev-dashboard).

### [2026-06-11] - Propuesta Técnica de Módulo Visual de Commits y Despliegues (Dashboard)
* **Tipo:** Documentación / Arquitectura / Propuesta Técnica
* **Descripción de Cambios:**
  - **Generación del Documento de Propuesta:** Elaboramos la propuesta técnica completa en `propuesta_commits_despliegues.md` dentro de `09_Modulos_Completos`. Detalla el flujo de Server-Sent Events (SSE), el diseño visual HSL a doble panel con terminal integrada y switches de fusión automáticos, el diseño de la API REST del CLI Bridge (`server.js`) y la estrategia de escala multi-tenant con logs guardados en Firestore.
  - **Actualización de Mapeo de Documentación:** Agregamos el registro en el mapa semántico `mapa_documentacion_ia.md` de la IA para facilitar búsquedas contextuales.
* **Archivos Creados/Modificados:**
  - [`d:/PROTOTIPE/Documentacion PROTOTIPE/09_Modulos_Completos/Modulo_Commits_Despliegues/propuesta_commits_despliegues.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/Modulo_Commits_Despliegues/propuesta_commits_despliegues.md) [NEW]
  - [`d:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
* **Verificación:** Coherencia de rutas y convenciones de documentación verificada.

### [2026-06-11] - Vista Previa Interactiva de Productos/Servicios en Smartphone Mockup
* **Tipo:** Nueva Característica / CRM / Branding / UX
* **Descripción de Cambios:**
  1. **Sección Dinámica de Catálogo en Mockup:** Implementamos un nuevo apartado de "Catálogo" (representado con el icono 📦) en el simulador interactivo de smartphone dentro del Wizard de Onboarding.
  2. **Etiquetas Contextuales según Nicho:** El botón y el título de la sección se adaptan dinámicamente según el nicho de mercado configurado por el desarrollador. Si corresponde a nichos de servicios (ej. `technical_services`, `wellness_podology`, `refrigeration_ac`), la pestaña se titula "Servicios" / "Servicios de la Marca"; de lo contrario, se etiqueta como "Catálogo" / "Catálogo de Productos".
  3. **Base de Datos Realista por Nicho:** Creamos la constante `MOCK_CATALOG` mapeando 3 ítems realistas (con nombre, emoji representativo y costo financiero) para cada uno de los 10 nichos de mercado disponibles.
  4. **Interconectividad de Balances:** Al pulsar el botón "+ Registrar" en cualquiera de las tarjetas del catálogo simulado, el ítem se añade dinámicamente a la lista histórica de órdenes en el mockup y su costo impacta el balance diario acumulado del cliente en tiempo real en la pantalla de inicio, logrando un flujo de interactividad 100% real.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilación limpia en producción (`vite build`) completada con éxito.

### [2026-06-11] - Paletas de Colores de Marca por Categorías de Nicho
* **Tipo:** Nueva Característica / CRM / Branding / UX
* **Descripción de Cambios:**
  1. **Estructura Dinámica de Nichos (100 Paletas Premium):** Agregamos una base de datos de 100 paletas cromáticas premium distribuidas en 10 categorías de nicho específicas (Tecnología, Moda, Bienestar/Salud, Comida, Automotriz, Finanzas/Corporativo, Infantil/Juguetes, Deportes/Fitness, Hogar/Decoración, Educación/Cultura) con 10 paletas para cada una.
  2. **Interfaz de Acordeón para Dashboard Central (`dev-dashboard`):** Sustituimos la grilla estática de 8 paletas por un control interactivo de acordeones colapsables para las categorías de nicho. Al abrir una sección, las demás se cierran automáticamente (comportamiento de acordeón puro) para optimizar el espacio vertical del Wizard de Onboarding.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Construcción en producción exitosa (`vite build`) verificada localmente sin errores de sintaxis.

### [2026-06-11] - Integración de Branding Studio HSL y Validador WCAG 2.1 en Onboarding Wizard
* **Tipo:** Nueva Característica / CRM / Accesibilidad / Wizard
* **Descripción de Cambios:**
  1. **Algoritmo de Accesibilidad WCAG 2.1:** Implementamos helpers matemáticos para calcular el contraste relativo basado en la luminancia relativa conforme al estándar WCAG 2.1 de la W3C.
  2. **Widget de Estudio de Accesibilidad y Contraste:** Añadimos un widget visual interactivo dentro de la pestaña de "Branding" del Wizard de Aprovisionamiento. Muestra la relación de contraste en tiempo real y badges dinámicos con los niveles de conformidad (`AAA (Excelente)`, `AA (Óptimo)`, `AA Grande (Regular)` o `Fail (Bajo Contraste)`) para:
     - El botón primario (contra fondo blanco).
     - La interfaz general de la app (color de fondo contra color de texto).
  3. **Simulador y Previsualizador en Vivo:** Al alterar las coordenadas cromáticas en los selectores, el previsualizador simula instantáneamente la relación de contraste y retroalimenta al desarrollador.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilación exitosa en producción (`vite build`) verificada localmente.

### [2026-06-11] - Botón "Desplegar en Local" y Control de Servidores de Desarrollo en CRM (dev-dashboard)
* **Tipo:** Nueva Característica / CRM / Gestión Local / CLI
* **Descripción de Cambios:**
  1. **Endpoints de Servidor de Desarrollo en CLI Bridge:** Implementamos `/api/project/dev/start`, `/api/project/dev/stop` y `/api/project/dev/status` en `server.js`. Utilizan el gestor de subprocesos (`npm run dev`) con almacenamiento en el mapa global `runningDevServers` referenciado por el `clientId` del cliente. Implementan control de cierre limpio en Windows mediante `taskkill` y mapeo dinámico de puertos aleatorios o asignados.
  2. **Monitoreo Automático de Servidores Locales en Dashboard:** Añadimos el estado `localServers` y un `useEffect` que realiza llamadas a `/api/project/dev/status` para todos los clientes cargados al ingresar a la vista CRM.
  3. **Botones de Control Interactivos:** Añadimos botones premium contextulaes por cliente en el listado del CRM:
     - **Desplegar en Local:** Llama a la API para levantar el servidor `npm run dev`.
     - **Ir a Local (Enlace Externo):** Abre la pestaña del navegador apuntando a la URL local (ej. `http://localhost:5173`) si el servidor está activo.
     - **Detener:** Envía señal para matar el subproceso del servidor de desarrollo del cliente.
     - **Procesando:** Estado de carga con spinner animado `RefreshCw` durante la comunicación con el puente CLI.
  4. **Rediseño del Botón de Telemetría Global:** Refactorizamos el estilo del botón central "Obtener Telemetría" en la cabecera del CRM. Lo renombramos a "Obtener Telemetría Global" y lo dotamos de un esquema de color púrpura translúcido (`bg-purple-600/10 border-purple-500/25 text-purple-400`), logrando una paridad estética y de proporciones exacta con los botones de sincronización (índigo) y despliegue (esmeralda).
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilaciones locales exitosas, pruebas de endpoints del bridge correctas.

### [2026-06-11] - Selector de Clientes para Solicitud de Telemetría Global (dev-dashboard)
* **Tipo:** UX / CRM / Telemetría
* **Descripción de Cambios:**
  - **Modal de Personalización de Telemetría Global (`isGlobalTelemetryModalOpen`):** Refactorizamos el botón "Obtener Telemetría" a nivel global en la cabecera del CRM. Ahora abre un modal interactivo con un listado con casillas de verificación (checkboxes) pre-seleccionados por defecto para todos los clientes activos del SaaS. Esto le permite al desarrollador solicitar reportes de telemetría y diagnóstico en caliente únicamente para los clientes seleccionados, previniendo disparos de lectura/escritura accidentales en Firestore.
  - **Función de Ejecución (`handleExecuteGlobalTelemetry`):** Creada la rutina para mapear y actualizar asíncronamente el campo `triggerTelemetryReport` en los documentos de control de Firestore de los clientes seleccionados en el checklist.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilación e inicio del dev-dashboard exitosos.

### [2026-06-11] - Selector de Clientes en Sincronización Global y Despliegue en Lote (dev-dashboard)
* **Tipo:** Refactorización / UX / CRM / Control de Procesos
* **Descripción de Cambios:**
  1. **Modal de Configuración de Sincronización Global (`isGlobalSyncConfigModalOpen`):** Diseñamos un nuevo modal interactivo que se abre al presionar "Sincronización Global Core (Safe)", listando todos los clientes activos con checkboxes pre-seleccionados por defecto para que el desarrollador pueda elegir exactamente qué clientes sincronizar, previniendo disparos accidentales.
  2. **Modal de Configuración de Despliegue Global (`isGlobalDeployConfigModalOpen`):** Desarrollamos un modal interactivo análogo para el "Despliegue Global Hosting", permitiendo seleccionar/deseleccionar clientes activos antes de arrancar.
  3. **Cola Reactiva de Despliegue Global:** Refactorizamos la cola secuencial de despliegues globales mediante efectos reactivos (`useEffect`) vinculados a `deployQueueIndex` y `deployState`. Al finalizar la compilación y subida de un cliente de la cola (sea exitosa o fallida), el sistema espera 3 segundos para legibilidad en consola y avanza automáticamente al siguiente.
  4. **Monitorización y Cancelación en Terminal:** Agregamos el indicador de estado de la cola en el encabezado de `DeployTerminalModal` (ej. `[Cola: 1/3]`) y un botón para cancelar inmediatamente la cola de despliegues secuenciales en caliente.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilación de Vite en producción completada exitosamente sin advertencias ni errores.

### [2026-06-11] - Sincronización en Lote de Drift y Consola de Despliegue de Hosting en CRM (dev-dashboard)
* **Tipo:** Nueva Característica / CRM / Sincronización / CLI
* **Descripción de Cambios:**
  1. **Sincronización Inteligente en Lote (`BulkSyncModal`):** Desarrollamos un modal interactivo que agrupa los archivos desviados (drift) del cliente. Utiliza un filtro de seguridad para diferenciar entre archivos de **Lógica Core (Seguros)** y **Configuraciones/Branding (Sensibles)**, pre-marcando los seguros y permitiendo al desarrollador seleccionar qué archivos sincronizar de un solo golpe.
  2. **Batch Downstream API Route (`POST /api/project/sync-files`):** Implementamos un nuevo endpoint por lotes en el CLI local (`server.js`) para copiar masivamente los archivos autorizados desde el Core de referencia a la instancia del cliente.
  3. **Consola Interactiva de Despliegue de Hosting (`DeployTerminalModal`):** Diseñamos una terminal oscura UNIX en React para visualizar los logs en tiempo real vía Server-Sent Events (SSE) del proceso de compilación (`npm run build`), auditoría de calidad/PWA y subida de Firebase Hosting (`firebase deploy`).
  4. **Bypass de Calidad de Auditoría:** Si el guardián de calidad/PWA detiene el despliegue debido a una puntuación baja (< 90), la consola expone un botón para "Forzar Despliegue (Ignorar Auditoría)" que realiza el bypass en caliente re-ejecutando el deploy con `force=true`.
  5. **Controles Estratégicos CRM:**
     - **Individual por Cliente:** Integrados los botones "Sincronizar Lote" y "Desplegar Hosting" dentro de la pestaña de Drift del modal de gestión de cliente.
     - **General de CRM:** Añadidos los botones globales de "Sincronización Global Core (Safe)" (actualiza en cascada archivos de lógica estándar para todos los clientes) y "Despliegue Global Hosting" en la cabecera principal del CRM.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilación exitosa en verde y API local expuesta.

### [2026-06-11] - Simulador de Fallos Multicliente Dirigido y Personalizado (dev-dashboard)
* **Tipo:** Nueva Característica / Sandbox / Telemetría
* **Descripción de Cambios:**
  - **Modal de Simulación:** Implementado el modal interactivo `SimulationFailureModal` que reemplaza la simulación de errores aleatorios por un panel de control completo.
  - **Campos de Configuración:** Permite al desarrollador seleccionar dinámicamente cualquier cliente activo de la base de datos (con detección automática de su nicho) o ingresar un identificador manual, elegir entre 5 plantillas de errores predefinidos (TypeError, FirebaseError, ReferenceError, Red/CORS, Pasarela de Pagos) o redactar un mensaje y stack trace personalizados, configurar el nivel de severidad (FAIL, WARN, INFO) y el origen del reporte (Automático vs Manual).
  - **Inyección Dirigida:** La función `handleSimulateFailure` fue refactorizada para aceptar y persistir estos parámetros directamente en Firestore Central en lugar de usar variables de prueba estáticas.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%2520PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilación limpia y exitosa de producción.

### [2026-06-11] - Corrección Visual y de Idioma en Consola de Telemetría (dev-dashboard)
* **Tipo:** Corrección de Interfaz / UX / Internacionalización
* **Descripción de Cambios:**
  - **Buscador de Logs:** Cambiamos la clase `border-slate-850` (color inexistente en el esquema estándar de Tailwind) por `border-slate-800` en el campo de entrada de búsqueda, eliminando la línea blanca/brillante de contorno y logrando una integración visual homogénea con el fondo oscuro.
  - **Traducción de Señal:** Reemplazamos la señal técnica `~/telemetry $ await_stream_signal...` por su versión simplificada en español: `~/telemetria $ escuchando_eventos_en_vivo...`.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilación limpia y exitosa de producción.

### [2026-06-11] - Fijación y Bloqueo de Header y Sidebar en Scroll (dev-dashboard)
* **Tipo:** Refactorización / Layout / UX
* **Descripción de Cambios:**
  - Cambiamos la clase `min-h-screen overflow-x-hidden` a `h-screen overflow-hidden` en el contenedor principal de `App.jsx` del dashboard de desarrollo. Esto confina la altura de la aplicación al viewport y permite que el scroll bar se limite exclusivamente al panel de contenidos (`<main className="overflow-y-auto">`), manteniendo el encabezado (`nav` sticky) y el menú lateral (`aside` flex) completamente estáticos e inamovibles.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Construcción de producción exitosa (`vite build`).

### [2026-06-11] - Optimización y Clasificación de Telemetría de Errores (Spark Saver)
* **Tipo:** Refactorización / Optimización / UX / Calidad de Datos
* **Descripción de Cambios:**
  1. **Filtro de Ruido en Clientes:** Agregamos una lista de ignorados en frío (`NOISE_TO_IGNORE` en `telemetryService.js`) que previene el envío automático de errores temporales de red (`failed to fetch`, `NetworkError`), scripts CORS, cancelaciones y extensiones del navegador, protegiendo las cuotas de escritura de Firestore (plan Spark).
  2. **Clasificación por Origen (`source`):** Introdujimos el parámetro `source` ('automatic' | 'manual') en la firma de `reportAppFailureToDeveloper` para marcar exactamente si un incidente ocurrió de forma imprevista o fue forzado manualmente por el cliente.
  3. **Ampliación de De-duplicación:** Incrementamos la ventana de prevención de duplicados de errores a **5 minutos (300,000 ms)** en memoria por firma de hash.
  4. **Visualización en Dashboard:** Modificamos `App.jsx` en el dashboard para renderizar dinámicamente badges distintivos (`Manual` en ámbar y `Automático` en índigo) junto a cada registro en el historial de incidentes.
  5. **Mapeo en Plantillas:** Actualizamos tanto la app core de Ventas como los archivos seed de templates (`template-ventas`, `template-core-seed`) en el CLI.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/services/telemetryService.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/telemetryService.js) [MODIFY]
  - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx) [MODIFY]
  - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js) [MODIFY]
  - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx) [MODIFY]
  - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/telemetryService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/telemetryService.js) [MODIFY]
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilaciones limpias y tags visuales integrados en el dashboard de desarrollo.

### [2026-06-11] - Corrección de Rutas en Registro de Plantillas Core y Scaffolding del CLI
* **Tipo:** Bugfix / Automatización / CLI
* **Descripción de Cambios:**
  1. **Correcion de Path Parent:** Corregimos `/api/register-core` en `server.js` para usar `path.dirname(WORKSPACE_ROOT)` al instanciar carpetas de "Plantillas Core", evitando que se crearan erróneamente dentro de `Instancias Clientes`.
  2. **Sanitización de Slashes en Registro:** Ajustamos la escritura en `plantillas_registro.json` para mapear las rutas de `fuente` y `destino` usando los resolved paths limpios y con forward slashes unificados (`.replace(/\\/g, '/')`).
  3. **Migración Física:** Movimos físicamente el directorio erróneo `D:\PROTOTIPE\Instancias Clientes\Plantillas Core\App Domiciliarios` a `D:\PROTOTIPE\Plantillas Core\App Domiciliarios`, aprovisionamos el archivo base `GEMINI.md` omitido por la ruta inválida, y corregimos su registro de mapeo en el JSON central.
  4. **Endpoint de Eliminación de Core:** Implementamos el endpoint `DELETE /api/cores/:clave` en `server.js` para remover por completo del registro y del disco (fisiamente) cualquier plantilla core inactiva si falla la inicialización o ya no se requiere.
  5. **Botonera de Eliminación Visual:** Modificamos `CoreCard.jsx` en el dashboard para añadir un botón de bote de basura (`Trash2`) con confirmación de dos pasos ("¿Eliminar?" -> Check/Cancelar) que permite desregistrar y purgar físicamente la plantilla inactiva desde la propia interfaz de administración.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`d:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json`](file:///d:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json) [MODIFY]
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [MODIFY]
* **Verificación:** Mapeo y archivos corregidos en disco; compilado del dashboard exitoso.

### [2026-06-11] - Extracción Modular de Facturación y Consolidación de Telemetría de Diagnóstico
* **Tipo:** Refactorización / Modularización / UX / Calidad de Código
* **Descripción de Cambios:**
  1. **Unificación de Ajustes de Desarrollo:** Movimos los disparadores de telemetría y diagnóstico manuales ("Enviar Error de Prueba" y "Enviar Telemetría de Facturación") del menú principal de `DeveloperSettings.jsx` e integración directa en la misma interfaz de facturación del desarrollador para centralizar la experiencia.
  2. **Creación del Panel Portable (`DeveloperBillingPanel.jsx`):** Diseñamos y extrajimos un componente de React modular 100% portable y autónomo para encapsular toda la lógica comisional, firmas táctiles en HTML5 Canvas, generación y exportación de recibos PDF e interactividad de diagnósticos.
  3. **Purga de Código Duplicado:** Reemplazamos más de 150 líneas de código y estados en `DeveloperSettings.jsx` (tanto de `App Ventas` como de la plantilla `template-ventas` de la CLI) por una única instanciación limpia de `<DeveloperBillingPanel />`.
  4. **Documentación del Módulo en Biblioteca:** Documentamos detalladamente el flujo operativo y el código completo del nuevo módulo en `facturacion_y_firma_digital.md` bajo el catálogo de componentes.
  5. **Sincronización del Sandbox en Dev-Dashboard:** Modificamos el componente `FacturacionComisionalSandbox.jsx` de la biblioteca interactiva para añadir la sección "Telemetría y Diagnóstico de Canal" con sus respectivos estados de carga, alertas y botones de test de telemetría y error de prueba mockeados.
* **Archivos Modificados/Creados:**
  - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx) [NEW]
  - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
  - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx) [NEW]
  - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/FacturacionComisionalSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/FacturacionComisionalSandbox.jsx) [MODIFY]
  - [`d:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/00_Core_Ecosistema_Obligatorios/Facturacion_y_Firma_Digital/facturacion_y_firma_digital.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/00_Core_Ecosistema_Obligatorios/Facturacion_y_Firma_Digital/facturacion_y_firma_digital.md) [MODIFY]
  - [`d:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
* **Verificación:** Ejecutada compilación local nativa (`npm run build` en App Ventas y dev-dashboard) exitosamente sin errores de dependencias o bundler.

### [2026-06-11] - Refactorización de Reglas de Firestore y Protección de Credenciales Administrativas
* **Tipo:** Seguridad / Reglas de Acceso / Robustez Base de Datos
* **Descripción de Cambios:**
  1. **Blindaje de `isAdmin()` en Reglas Firestore:** Modificamos las reglas compuestas en `firestore.rules` (tanto para `App Ventas` como para el generador `template-ventas`) para redefinir `isAdmin()`, consultando y validando la existencia de la referencia `/users/{uid}` del administrador y certificando que tenga asignado el rol de `admin`.
  2. **Privacidad de employees:** Corregimos la regla de acceso de `/employees/{employeeId}` en el template principal de la CLI (`template-ventas`) para restringir lecturas a sesiones donde la bandera `activo` sea `true` o por verificación de rol del administrador, mitigando la exposición no autorizada de hashes de PIN y salarios.
  3. **Auto-registro de Perfil Admin:** Modificamos la lógica de inicio de sesión y registro del administrador en `LoginPage.jsx` para instanciar proactivamente el documento de usuario en la base de datos bajo la ruta `/users/{uid}` con `role: 'admin'`, garantizando que las nuevas marcas cuenten con la infraestructura requerida para aplicar las reglas de seguridad.
  4. **Manual Telemetry Trigger Button:** Implementamos un botón en `DeveloperSettings.jsx` ("Enviar Telemetría de Facturación") para realizar pruebas de transmisión de telemetría de facturación en vivo a Firestore Central de forma manual e inmediata, sin esperar al fin de mes, resolviendo la espera indefinida al realizar verificaciones de desarrollo.
  5. **Remote Manual Telemetry Request:** Implementamos la funcionalidad de solicitud remota de telemetría desde el panel del desarrollador. Añadimos un botón "Obtener Telemetría" al lado de gestionar en el CRM para cada cliente, y un botón global "Obtener Telemetría de Todos". Esto actualiza el campo `triggerTelemetryReport` en Firestore Central, el cual es escuchado en tiempo real por el hook `useAppConfigSync.js` de la aplicación de ventas para forzar el reporte asíncrono inmediato.
  6. **Alineación de Botones de Telemetría/Error:** Corregimos el desbordamiento de texto y desalineación de iconos en los botones "Enviar Error de Prueba" y "Enviar Telemetría de Facturación" en `DeveloperSettings.jsx` (tanto en `App Ventas` como en la plantilla de la CLI) reemplazando la altura fija `h-11` por `min-h-11 py-2.5` para que se expandan dinámicamente si el texto se envuelve, encapsulando el texto en un `span` con `text-center leading-tight` e inyectando la clase `shrink-0` a los iconos para prevenir distorsión.
* **Archivos Modificados:**
  - [`d:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`d:/PROTOTIPE/Plantillas Core/App Ventas/firestore.rules`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [MODIFY]
  - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/LoginPage.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
  - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/services/billingService.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/billingService.js) [MODIFY]
  - [`d:/PROTOTIPE/Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/firestore.rules`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/firestore.rules) [MODIFY]
  - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
  - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/billingService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/billingService.js) [MODIFY]
  - [`d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY]
* **Verificación:** Ejecutada compilación local del dashboard y la app de ventas, constatando que compilan limpiamente sin errores.

### [2026-06-10] - Mitigación e Implementación del Plan de Auditoría Técnica de CLI & Bridge Server
* **Tipo:** Seguridad / Rendimiento / Estabilidad / Refactorización Dashboard
* **Descripción de Cambios:**
  1. **Mitigación de Inyecciones de Comandos:** Sanitizamos argumentos en `server.js` al construir comandos de Firebase mediante `sanitizeShellArgument`.
  2. **Blindaje de Path Traversal:** Validamos contención en `/api/library/extract` asegurando que la ruta del componente resida estrictamente dentro de la raíz de la plantilla base.
  3. **Timeouts en Pruebas E2E y Terminación Recursiva:** Modificamos `/api/e2e/run` para implementar un timeout estricto de 3 minutos y finalización de árbol de procesos mediante `taskkill` en Windows para evitar procesos zombies de Playwright.
  4. **Refinamiento de Auditoría PWA:** Corregimos el auditor para parsear el archivo `manifest.json`/`manifest.webmanifest`, extrayendo y validando el valor de `start_url` y la existencia del array de `icons`.
  5. **Prevención de Git Leaks en Plantillas:** Inyectamos la creación automática de `.gitignore` en el generador de proyectos (`generator.js`) para evitar subir por error archivos `.env.local` o secretos.
  6. **Optimización de React en Dashboard:** Creamos el componente modular `CoreCard.jsx` e integramos su visualización aislada en `CoreManagerPanel.jsx`. Esto elimina por completo los re-renders masivos en el panel principal ante la recepción de streams SSE en tiempo real de los logs de deploy y compilación.
  7. **Doble Confirmación en Variables de Entorno:** Añadimos un paso de doble confirmación visual (Sí/No) para el borrado de claves de entorno locales en el componente `CoreCard.jsx`.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [NEW]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
* **Verificación:** Ejecutada compilación local del dashboard en verde de forma exitosa.

### [2026-06-10] - Reporte de Auditoría Técnica de CLI & Bridge Server
* **Tipo:** Auditoría de Calidad y Seguridad / Documentación
* **Descripción de Cambios:**
  1. **Generación del Reporte:** Elaboramos el informe de auditoría técnica formal en `auditoria_cli_server_2026.md` identificando vulnerabilidades críticas y altas de inyección de comandos en shell interpolados de aprovisionamiento, path traversal en `/api/library/extract`, re-renders masivos por Logs SSE en `CoreManagerPanel.jsx`, fugas de secretos Git en aprovisionamiento y tests E2E colgados sin timeouts.
  2. **Actualización de Mapas y Roadmaps:** Registramos la entrada del documento en el mapa semántico `mapa_documentacion_ia.md` e inyectamos la Tarea 365 de resolución en la hoja de ruta `tareas_pendientes.md`.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_cli_server_2026.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_cli_server_2026.md) [NEW]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
* **Verificación:** Todos los archivos creados y actualizados respetando la jerarquía oficial y las convenciones del equipo.

### [2026-06-10] - Corrección de Warning de Precarga de main.jsx en Consola Chrome
* **Tipo:** Corrección de Bug / Optimización de Carga
* **Descripción de Cambios:**
  1. **Reemplazo de preload por modulepreload:** En `index.html` corregimos el warning de Chrome que reportaba que `src/main.jsx` fue precargado pero no utilizado en los primeros segundos de carga del documento. Como `main.jsx` es cargado como un módulo de JavaScript (`type="module"`), el navegador requiere que su directiva de precarga use `rel="modulepreload"` en lugar de `rel="preload" as="script"`, evitando así la doble petición de red y el warning en consola.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/index.html`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/index.html) [MODIFY]
* **Verificación:** Ejecutada compilación exitosa (`npm run build`) y suite de pruebas (`npm run test:ci`) satisfactorias.

### [2026-06-10] - Tres Mejoras de Robustez y Carga de Logo en Onboarding Wizard
* **Tipo:** Robustez / Automatización / UX / Carga de Logo
* **Descripción de Cambios:**
  1. **Validación del SDK de Firebase (Pre-Flight Checks):**
     - Añadimos el endpoint `POST /api/firebase/validate` en `server.js` para pre-validar las credenciales (API Key) simulando una petición a la API de Firebase Auth.
     - Añadimos la lógica y un botón interactivo de comprobación de conexión en la sección "Servidor" del Wizard de Onboarding en `App.jsx`.
  2. **Carga y Compresión Automática de Logo de Marca (Jimp Compressor):**
     - Añadimos el endpoint `POST /api/upload-logo` en `server.js` para procesar la subida del logo de marca en base64. Si la imagen del logo supera los 2MB de tamaño, el servidor utiliza `Jimp` para redimensionar la imagen a un tamaño máximo de 512x512px y re-escribir el archivo en un directorio temporal seguro del CLI.
     - Rediseñamos el Wizard de Onboarding en su pestaña de "Branding" en `App.jsx` introduciendo un bloque de selección de archivos por drag-and-drop con carga automática base64, previsualización de carga y la alternativa de ingresar una ruta absoluta de archivo local.
     - Integramos la variable `logoPath` del logo subido/procesado en el payload enviado al motor de creación de proyectos.
  3. **Descarga de Logs de Despliegue de Hosting:**
     - Implementamos la función `downloadLogs` en `CoreManagerPanel.jsx` para recolectar el listado de logs generados en tiempo real por el proceso de compilación y despliegue.
     - Agregamos un botón interactivo para "Descargar Log" en formato de texto (.log) al panel de control de Firebase Hosting.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
* **Verificación:** Compilación del proyecto exitosa. Se validaron las rutas e importaciones de Jimp y la compatibilidad con el motor de aprovisionamiento.
* **Hotfix posterior:** Corregido el import de Jimp a su versión desestructurada `{ Jimp }` en `server.js` y reiniciado el servidor CLI en el puerto 3001, solucionando el error de despliegue por caché del proceso anterior que intentaba desplegar usando el alias incorrecto `-P ventas` en lugar de `-P ventas-smartfix`.

### [2026-06-10] - Guardián de Calidad y PWA en Deploy con Auto-Resolución y Drift Detector CRM
* **Tipo:** Automatización / Calidad / Auditoría / Sincronización Downstream
* **Descripción de Cambios:**
  1. **Guardián de Despliegue (SSE Pre-Deploy Audit):**
     - Integramos un paso de auditoría física síncrona en el endpoint de despliegue (`POST /api/project/deploy`) de `server.js`.
     - Si la puntuación de calidad cae por debajo del 90%, el deploy se detiene inmediatamente emitiendo un evento `audit_failed` con los fallos, a menos que se fuerce explícitamente mediante el parámetro `force=true`.
  2. **Panel de Auto-Resolución Visual en Consola SSE:**
     - Agregamos soporte para capturar los eventos `audit_failed` en `CoreManagerPanel.jsx` de `dev-dashboard`.
     - Renderizamos un bloque informativo de error y 3 botones correctores en caliente (optimización de chunks, reparación PWA y restablecimiento de reglas de base de datos) para corregir los problemas desde la interfaz antes de reintentar.
  3. **Drift Detector CRM (Algoritmo de Desviación):**
     - Añadimos el endpoint `GET /api/project/drift` en `server.js` para realizar una comparación profunda recursiva de archivos entre la instancia del cliente y su respectivo Core de referencia, calculando el porcentaje de paridad física en base a firmas criptográficas y diferencias de contenido de archivos.
     - Añadimos `POST /api/project/sync-file` para copiar de forma segura parches puntuales desde el Core hacia el cliente (sincronización selectiva downstream).
  4. **Pestaña de Sincronización e Integración de Diffs en CRM:**
     - Reestructuramos el modal de gestión del cliente en `App.jsx` introduciendo pestañas para Configuración Operativa y Sincronización Core (Drift).
     - Renderizamos la paridad de código, los archivos desviados/modificados y un visor de diferencias de líneas de código coloreadas (Ver Diff) junto con botones individuales para aplicar la sincronización.
  5. **Resolución y Auto-Creación de Proyectos Firebase sin Pasos Manuales:**
     - Modificamos la función `resolveFirebaseProjectId` en `server.js` para automatizar completamente la vinculación de proyectos:
       a) Lee `.prototipe.json` o `.firebaserc`.
       b) Si no hay configuración previa, consulta `firebase projects:list --json` y auto-detecta si ya existe algún proyecto coincidente (ej. `ventas-smartfix` para `ventas`), auto-vinculándolo escribiendo el `.firebaserc` de manera transparente.
       c) Si no existe coincidencia, **crea automáticamente un nuevo proyecto único en tu cuenta de Firebase** (`[clientId]-app-[random]`), inicializa las configuraciones necesarias (`.firebaserc` y `firebase.json` de Hosting) en la carpeta del proyecto y procede al deploy sin intervención manual.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/analisis_automatizacion_dashboard.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/analisis_automatizacion_dashboard.md) [NEW]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/auditoria_flujo_onboarding.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/auditoria_flujo_onboarding.md) [NEW]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/propuestas_mejoras_robustez.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/propuestas_mejoras_robustez.md) [NEW]
* **Verificación:** Compilaciones de producción exitosas. Probado el algoritmo de auto-matching de Firebase y redactado informe técnico de análisis, integración de dashboard, auditoría del flujo completo de onboarding y propuestas de robustez.

### [2026-06-10] - Optimización de Chunks de Bundle y Refinamiento de Auditor PWA
* **Tipo:** Optimización de Rendimiento / Refactorización de Build y Servidor
* **Descripción de Cambios:**
  1. **División de Chunks de Terceros (Code Splitting):**
     - Modificamos la configuración `manualChunks` en `vite.config.js` de App Ventas y de las plantillas base (`template-ventas`, `template-core-seed`) para segmentar el bundle general de `vendor` en chunks individuales más pequeños y optimizados: `react-core` (React y React-DOM), `react-router` (enrutamiento), `react-query`, `zod` y `vendor-utils`.
     - Habilitamos `build.manifest: true` en todas las configuraciones de Vite para generar el archivo de mapeo `.vite/manifest.json`.
  2. **Refinamiento Inteligente del Auditor PWA:**
     - Modificamos el endpoint `/api/project/audit` en `server.js` de `Prototipe-CLI` para leer y procesar el manifiesto de Vite, determinando recursivamente qué chunks forman parte de la carga estática inicial (critical path) y cuáles se importan dinámicamente bajo demanda.
     - Ajustamos el auditor para que excluya de las penalizaciones de puntuación y advertencias críticas de peso a los archivos dinámicos/lazy-loaded (como el generador de PDFs de 630 KB), evitando falsos positivos y otorgando un puntaje preciso de acuerdo a la carga inicial.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/vite.config.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/vite.config.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/vite.config.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/vite.config.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
* **Verificación:** Compilación exitosa en App Ventas con chunks de vendors inferiores a 230 KB. Petición al auditor responde con exclusión correcta de chunks lazy-loaded para la puntuación.

### [2026-06-10] - Integración de Herramientas de Automatización en CLI Bridge Server
* **Tipo:** Automatización / Refactorización de Infraestructura Local
* **Descripción de Cambios:**
  1. **Streaming SSE para Logs de Aprovisionamiento:**
     - Modificamos `worker_create_project.js` para interceptar logs globales y enviarlos al padre mediante IPC.
     - Adaptamos el endpoint `POST /api/create-project` en `server.js` para responder con cabeceras SSE y transmitir los logs en tiempo real al frontend.
  2. **Endpoint Extractor de Componentes:**
     - Agregamos `POST /api/library/extract` en `server.js` para extraer componentes de código locales, estructurar su documentación Markdown estándar e indexarlos automáticamente en el README del catálogo y en el Mapa de Documentación para la IA (`mapa_documentacion_ia.md`).
  3. **Control de Entorno y Despliegues de Hosting:**
     - Agregamos `POST /api/project/deploy` en `server.js` para automatizar la compilación (`npm run build`) y el despliegue a Firebase Hosting con streaming SSE interactivo de los logs.
     - Añadimos `GET /api/project/env` y `POST /api/project/env` para leer y escribir el fichero `.env.local` de cada cliente desde la interfaz visual.
  4. **Auditoría física y PWA:**
     - Diseñamos `GET /api/project/audit` en `server.js` para auditar la carpeta `dist/` de producción, calcular tamaños de assets, detectar chunks JS pesados (> 500 KB) y certificar la integración de Service Workers y manifiestos PWA.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js`](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
* **Verificación:** El servidor local del CLI inicializa y corre sin errores en el puerto 3001 con todos los nuevos endpoints listados en consola.

### [2026-06-10] - Implementación del Plan de Resolución Estratégica en App Ventas
* **Tipo:** Seguridad / Rendimiento / Modularización / Refactorización Core
* **Descripción de Cambios:**
  1. **Fase 1 - Blindaje de Seguridad y PIN Hashing SHA-256:**
     - Modificamos `firestore.rules` para prohibir lecturas públicas directas sobre `/employees`, permitiéndolas solo a administradores o si el empleado tiene el flag `activo == true`. Restringimos queries a `/orders` y `/credits` requiriendo filtro obligatorio por celular del cliente (`cliente.celular`).
     - Añadimos la función nativa asíncrona de hashing SHA-256 en `employeeService.js` para procesar y encriptar PINs de empleados localmente en el navegador antes de registrarlos o validarlos en Firestore.
     - Adaptamos el portal de login de empleados (`PortalAuth.jsx`) y el gestor de personal en el panel de administrador (`EmployeeSettings.jsx`) para procesar el hashing SHA-256 de forma transparente y enmascarar los PINs mediante placeholders seguros (`******`).
  2. **Fase 2 - Optimización de Facturación y Cómputo Dinámico:**
     - Reestructuramos la query de cálculo y comisiones de facturación en `billingService.js` para restringir la búsqueda a un rango de fecha dinámico del mes en curso y limitar el historial a los últimos 6 meses, evitando búsquedas O(N) que degradaban la red.
     - Implementamos un planificador de telemetría en `useAppConfigSync.js` para retrasar y consolidar el reporte HTTP mensual del volumen comisional de ventas strictly en el último día de cada mes calendario.
  3. **Fase 3 - Rendimiento Core Web Vitals:**
     - Añadimos etiquetas `<link rel="preconnect">` para las APIs y recursos de fuentes de Google en `index.html`.
     - Insertamos instrucciones `<link rel="preload">` para acelerar la carga síncrona del script del bundle inicial (`src/main.jsx`).
  4. **Fase 4 - Modularización de Productos y Desduplicación de Lógica:**
     - Creamos el hook personalizado unificado `useProductVariants.js` para centralizar los cálculos redundantes de variantes con stock, tallas/colores disponibles, stock consolidado total, precios de oferta, insignias comerciales dinámicas ("Más Vendido", "Última Unidad", "Nuevo", "Oferta Imperdible") e imagen activa.
     - Refactorizamos `ProductDetailPage.jsx` and `ProductPublicDetail.jsx` para consumir el nuevo hook, eliminando más de 120 líneas de código duplicado por archivo y logrando un desacoplamiento limpio de la interfaz visual con la lógica de negocio multivariante.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/firestore.rules`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/services/employeeService.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/employeeService.js) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/EmployeeSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/EmployeeSettings.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/services/billingService.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/billingService.js) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/index.html`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/index.html) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/hooks/useProductVariants.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useProductVariants.js) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductDetailPage.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductPublicDetail.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
* **Verificación:** Ejecutada compilación local (`npm run build`) en verde y suite de pruebas End-to-End con Playwright (`npm run test:ci`) aprobada en verde (1 passed).

### [2026-06-10] - Auditoría Técnica de App Ventas
* **Tipo:** Auditoría de Calidad / Seguridad / Rendimiento
* **Descripción de Cambios:**
  1. **Auditoría Técnica Integral:** Se realizó una auditoría profunda de 16 ejes clave en App Ventas. Se revisaron Core Web Vitals, recursos que bloquean el renderizado, optimización de imágenes, consumo de memoria y fugas en listeners, fluidez y animaciones con throttling de CPU, solicitudes de red, errores de consola, pruebas funcionales, responsividad en 12 resoluciones, accesibilidad (foco/aria), UI/UX, seguridad frontend, SEO técnico, renders innecesarios en React, bundle/dependencias y arquitectura.
  2. **Creación de Reportes Técnicos:** Se redactó y guardó el informe técnico completo en `auditoria_tecnica_app_ventas.md` y el plan de mitigación estratégico en `plan_resolucion_ventas.md`.
* **Archivos Modificados:**
  - `D:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_tecnica_app_ventas.md` [NEW]
  - `D:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/plan_resolucion_ventas.md` [NEW]
  - `D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md` [MODIFY]
  - `D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md` [MODIFY]
* **Verificación:** Reportes generados y documentados bajo los estándares del proyecto.

### [2026-06-10] - Despliegue de Hosting de App Ventas y dev-dashboard
* **Tipo:** Lanzamiento / Despliegue en Firebase
* **Descripción de Cambios:**
  1. **Compilación de Producción:** Compilamos localmente las versiones de producción de ambas aplicaciones mediante `npm run build`.
  2. **Despliegue de App Ventas:** Desplegamos exitosamente el hosting del cliente final en Firebase. URL: `https://ventas-smartfix.web.app`
  3. **Despliegue de Dashboard:** Desplegamos exitosamente el panel de control del ecosistema en Firebase. URL: `https://prototipe-ecosistema-control.web.app`
* **Archivos Modificados:** Ninguno (despliegue de bundle de distribución).
* **Verificación:** Hosting liberado y activo en la nube para ambos entornos.


### [2026-06-10] - Creación de SwipeableCardStack e Importaciones en App Ventas
* **Tipo:** Corrección de Bug / Estabilidad Core
* **Descripción de Cambios:**
  1. **Creación del componente físico SwipeableCardStack:** Creamos el archivo de componente [`SwipeableCardStack.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/SwipeableCardStack.jsx) en base a los estándares de la biblioteca de componentes, resolviendo el ReferenceError por ausencia física del componente.
  2. **Importaciones y correcciones en CartDrawer:** Modificamos [`CartDrawer.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) para importar el componente `SwipeableCardStack`, agregar el icono `ShoppingCart` de `lucide-react` y definir la función de navegación `handleViewDetail` (que faltaban en el archivo).
  3. **Ajuste de scroll de recomendaciones:** Agregamos `pb-32` a las clases del contenedor scrollable del carrito para que al deslizar el contenido hasta abajo, las sugerencias superen la barra flotante de pago y queden totalmente visibles.
  4. **Unificación estética de cupones en Checkout:** Rediseñamos el selector rápido de cupones elegibles en [`CheckoutModal.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) reemplazando la fila plana previa por tarjetas tipo ticket premium con muescas laterales, gradientes de colores vivos rotativos y animación de brillo shimmer, igual al diseño del catálogo de ofertas.
  5. **Animación de Confeti al Validar Cupón:** Instalamos la librería `canvas-confetti` en App Ventas e integramos la función `triggerConfetti` de importación dinámica (para no penalizar la velocidad de carga inicial de la pasarela). La animación se dispara en el momento exacto en que un cupón elegible es aplicado con éxito.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/package.json`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/package.json) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/ui/SwipeableCardStack.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/SwipeableCardStack.jsx) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/checkout/CheckoutModal.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas completada exitosamente.


### [2026-06-10] - Previsualización de Módulos y Componentes en el Dashboard en Vivo
* **Tipo:** UI/UX / Interactividad / Funcionalidad Nueva Dashboard
* **Descripción de Cambios:**
  1. **Botón de visualización en vivo (Demo):** Añadimos un botón flotante con diseño premium de color verde (emerald) y un icono de Play en la tarjeta de cada componente/módulo en la sección de recomendaciones del Onboarding Wizard. Este botón se muestra dinámicamente utilizando `getSandboxKey(comp.name, comp.technicalName) !== null` para verificar que el componente disponga de un playground interactivo.
  2. **Interrupción de propagación:** El botón tiene implementado `e.stopPropagation()` para que al hacer clic en él se abra la previsualización sin alterar la selección del checkbox de la tarjeta.
  3. **Modal de Playground en Vivo:** Creamos un modal overlay premium con desenfoque de fondo (`bg-slate-950/80 backdrop-blur-md`) que renderiza de manera dinámica el playground interactivo cargado vía `<ComponentSandbox />`. El modal incluye metadatos, controles de cierre flexibles y una acción rápida en su pie para añadir o remover el componente directamente de la lista de seleccionados.
  4. **Corrección de anidamiento HTML:** Modificamos el tag contenedor de la tarjeta de recomendaciones en `App.jsx`, reemplazando el elemento principal `<button>` por un `<div role="button" tabIndex={0} onKeyDown={...}>`. Esto resuelve el error de hidratación provocado por colocar un elemento `<button>` dentro de otro `<button>` en React.
  5. **Flexibilidad del área de previsualización (Sandbox):** Eliminamos la restricción de ancho estático `max-w-xs` (320px) en la caja de previsualización dentro de `ComponentSandbox.jsx` y `SandboxLayout.jsx`, permitiendo que el contenedor se expanda fluidamente a lo ancho y contenga de forma nativa componentes anchos (como calendarios, rejillas y diagramas) sin desbordarse.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SandboxLayout.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SandboxLayout.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo dev-dashboard completada con éxito.

### [2026-06-10] - Contenedor Glassmorphic para Botones de Pago y Total en Carrito
* **Tipo:** UI/UX / Diseño Estético Premium (Glassmorphism)
* **Descripción de Cambios:**
  1. **Barra de pago integrada y translúcida:** Modificamos el pie del carrito de compras (`CartDrawer.jsx`) para envolver el indicador de Total y el botón de pago "Ir a pedir" dentro de una pastilla flotante unificada glassmorphic (`absolute bottom-6 inset-x-6 h-20 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md rounded-3xl border border-black/5 dark:border-white/10 px-6 flex items-center justify-between z-30 shadow-[0_8px_32px_rgba(0,0,0,0.08)]`). Esto resuelve la visual inconexa previa y le otorga un look sumamente estético y premium.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-10] - Autoplay y Leyenda de Instrucciones en Mazo de Tarjetas Recomendadas
* **Tipo:** UI/UX / Interactividad / Gamificación
* **Descripción de Cambios:**
  1. **Autoplay comercial por inactividad:** Implementamos una lógica de autoplay mediante un temporizador inteligente en `SwipeableCardStack`. Si el usuario no está arrastrando la tarjeta (`isDragging` es falso) ni tiene el cursor encima (`isHovered` es falso), el mazo desliza la tarjeta activa hacia la izquierda (siguiente/ignorar) cada 5 segundos de forma automática, garantizando un carrusel dinámico y continuo para incentivar la conversión.
  2. **Banner de instrucciones visuales:** Agregamos una barra superior premium con animación pulsante (`animate-pulse`) que instruye claramente al cliente sobre el uso de la mecánica de swipe: "👈 DESLIZA IZQ (PASAR)" y "DESLIZA DER (AGREGAR) 👉".
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Ajuste de Espacios Verticales Debajo de Recomendaciones en Carrito
* **Tipo:** UI/UX / Optimización de Espacios y Layout
* **Descripción de Cambios:**
  1. **Redimensionamiento y Restauración del Mazo 3D Tinder-Style (`CartDrawer.jsx`):** Restauramos la experiencia original del mazo de tarjetas en perspectiva 3D apiladas, pero ajustando sus proporciones para hacerlas más cuadradas (proporcionales) sin saturar la pantalla vertical:
     - **Dimensiones Equilibradas:** Redujimos el alto de las tarjetas de `190px` a `148px` (`152px` en el contenedor del mazo), logrando una proporción visualmente más boxy sin consumir demasiado espacio.
     - **Bordes Suavemente Curvados:** Aplicamos `rounded-2xl` en las tarjetas para mantener esquinas redondeadas y fluidas.
     - **Proporción de Imagen Adaptada:** Escalamos la imagen interna a `w-24 h-24` con bordes `rounded-2xl` para adaptarla a la nueva proporción de la tarjeta.
     - **Optimización de Scroll y Controles:** Dejamos la posición de controles en `bottom-[65px]` y restauramos el padding de scroll a `pb-[172px]`.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Retorno al Carrito al Retroceder desde Detalle de Recomendaciones
* **Tipo:** UI/UX / Flujo de Navegación (User Journey)
* **Descripción de Cambios:**
  1. **Persistencia de Navegación de Recomendaciones (`CartDrawer.jsx` & `ProductDetailPage.jsx`):** 
     - **Paso de Estado en Navegación:** En `CartDrawer.jsx`, modificamos el `navigate` del detalle a `/tienda/producto/:id` para enviar el estado `{ state: { fromCart: true } }`.
     - **Intercepción del Botón Atrás:** En `ProductDetailPage.jsx`, importamos `useLocation` para leer el indicador `fromCart`. Al pulsar el botón de retroceso (`ChevronLeft`), si el usuario proviene de una recomendación del carrito, disparamos `openCart()` de `useCartStore` para desplegar automáticamente el carrito de compras en el retorno y ejecutamos `navigate(-1)`.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductDetailPage.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Redirección Directa de Sugeridos a Detalle de Producto
* **Tipo:** UI/UX / Consistencia de Navegación
* **Descripción de Cambios:**
  1. **Redirección a Detalle de Producto (`CartDrawer.jsx`):** Eliminamos la visualización en modal de los detalles de productos normales recomendados (que mostraba etiquetas redundantes y no alineadas con la vista de catálogo).
     - **Comportamiento Unificado:** Al pulsar en "Detalles" o al hacer clic sobre una tarjeta del stack interactivo de sugeridos, ahora se cierra automáticamente el carrito de compras (`closeCart()`) y se navega directamente a la página de detalles del producto (`/tienda/producto/:id`), exactamente igual a como ocurre en la tarjeta principal del catálogo general.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Transformación de FAB a Botón de Pastilla "Ir a pedir"
* **Tipo:** UI/UX / Claridad de Flujo (Call to Action)
* **Descripción de Cambios:**
  1. **Rediseño del Botón de Pago (`CartDrawer.jsx`):** Cambiamos el botón de checkout flotante circular que solo contenía la flecha (FAB):
     - **Formato Pill con Texto:** Ahora es un botón en forma de pastilla estilizada (`px-6 h-14 rounded-full`) con fondo acento sólido (`bg-action`) que lee claramente **"Ir a pedir"** seguido por la flecha (`ArrowRight size={16}`).
     - **Efectos de Micro-interacción:** Conserva las sombras premium, animaciones de hover scale y active click para una experiencia táctil intuitiva y fluida.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Reubicación de Botones de Swipe a la Parte Superior de las Tarjetas
* **Tipo:** UI/UX / Usabilidad y Flujo Visual
* **Descripción de Cambios:**
  1. **Reposicionamiento de Controles de Swipe (`CartDrawer.jsx`):** Para evitar que los botones circulares de descarte (rojo con X) y compra (verde con carrito) se solapen con los controles de checkout o queden ocultos en la parte baja:
     - **Cambio de Posición en DOM:** Movimos el contenedor de controles de acción del recomendador (`SwipeableCardStack`) por encima del mazo de tarjetas en la estructura JSX.
     - **Estilos y Márgenes:** Cambiamos el margen superior `mt-1.5` por un margen inferior `mb-2.5` en los botones. De este modo, los botones flotan de manera limpia justo encima de las tarjetas interactivas, facilitando su visibilidad y clic inmediato.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Rediseño Compacto de Tarjetas y Corrección de Desborde del Contador en Carrito
* **Tipo:** UI/UX / Optimización de Componentes
* **Descripción de Cambios:**
  1. **Rediseño de Tarjetas de Producto (`CartDrawer.jsx`):** Compactamos la estructura de los productos en el carrito para optimizar el espacio horizontal y vertical:
     - **Dimensiones de Imagen Reducidas:** Redujimos el tamaño de la imagen de `w-24 h-24` (96px) a `w-20 h-20` (80px), aplicando bordes `rounded-xl`.
     - **Tipografía y Márgenes:** Ajustamos el tamaño del título del producto a `text-sm leading-snug` y la información de variantes a `text-[10px]`.
     - **Botón de Eliminar Ajustado:** Redujimos el botón de basura a `w-7 h-7` y el tamaño del icono a `14` para integrarlo mejor.
  2. **Resolución de Desborde del Selector (`CartDrawer.jsx` & `QuantitySelector.jsx`):**
     - Eliminamos el truco visual del transform scale (`scale-[0.7]`) que alteraba la caja de renderizado físico en Flexbox.
     - En su lugar, pasamos la propiedad nativa **`size="sm"`** al `<QuantitySelector>`, el cual utiliza la configuración nativa optimizada del selector atómico (`h-11` de alto, botones compactos de `w-8 h-8` e iconos de `13px`). Esto resolvió por completo la deformación y el desbordamiento horizontal.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Controles de Compra Flotantes Premium en Carrito de Cliente
* **Tipo:** UI/UX / Rediseño de Interacción (FAB & Badge)
* **Descripción de Cambios:**
  1. **Eliminación de Footer Completo y Controles Suspendidos (`CartDrawer.jsx`):** Rediseñamos por completo el flujo de checkout al pie del carrito eliminando el fondo e implementando elementos suspendidos minimalistas que permiten la visibilidad total de los productos:
     - **Total Flotante Lateral:** Ubicamos el precio de "Total Estimado" en un badge semi-translúcido pegado a la izquierda (`absolute left-0 bottom-6`). El badge tiene un corte asimétrico: es cuadrado del lado que toca el borde (`rounded-r-2xl border-y border-r border-black/5 dark:border-white/10`) y redondeado en su interior.
     - **Burbuja de Pago Flotante (FAB):** Convertimos el botón "Ir a Pagar" en un botón circular de acción flotante (FAB) en la esquina derecha (`absolute right-6 bottom-6 w-14 h-14 rounded-full bg-action shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center`).
     - **Ajuste de Altura de Capa:** Al tener controles flotantes, se ajustó el scroll padding a `pb-24`, logrando una visual sumamente despejada, moderna y libre de bloqueos.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Estilización Glassmorphic y Flotante del Footer del Carrito
* **Tipo:** UI/UX / Estilo Visual Premium
* **Descripción de Cambios:**
  1. **Efecto de Cristal Translúcido (`CartDrawer.jsx`):** Transformamos el fondo rígido del pie de página del carrito en una superficie glassmorphic:
     - **Diseño Flotante:** Se cambió la posición del footer a `absolute bottom-0 inset-x-0` para que flote sobre el área de scroll de los productos.
     - **Fondo de Cristal y Blur:** Se aplicó un color blanco de baja opacidad con canal alfa (`bg-white/70` y en modo oscuro `dark:bg-neutral-900/70`) combinado con desenfoque de fondo (`backdrop-blur-lg`) y bordes refinados (`border-white/20`).
     - **Sombra Suave superior:** Se añadió una sombra de elevación inversa (`shadow-[0_-8px_32px_rgba(0,0,0,0.08)]`) para dar sensación de profundidad física. Esto permite que el usuario vea de forma borrosa y fluida los productos que pasan por detrás al hacer scroll.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Corrección de Scroll y Altura del Carrito del Cliente para Evitar Oclusiones
* **Tipo:** UI/UX / Diseño de Interfaz (Drawer)
* **Descripción de Cambios:**
  1. **Solución a Contenido Tapado en Carrito (`CartDrawer.jsx`):** Corregimos el problema donde la sección de "Recomendado para ti" era ocluida por el pie de página fijo (donde está el total y los botones de pago) al acumularse varios productos:
     - **Enlace de Altura Rígido:** Se configuró el Drawer con una clase de altura viewport explícita `h-[100dvh]` y se forzó `overflow-hidden` en el contenedor padre. Esto encapsula el scroll únicamente en la sección de productos.
     - **Safe Area Padding Bottom:** Se inyectó la clase `pb-56` (padding bottom de 224px) en la base del contenedor de scroll interno (`flex-1 overflow-y-auto`). Esto empuja el contenido hacia arriba cuando se llega al final del scroll, logrando que las sugerencias queden 100% legibles y seleccionables por encima de la barra de pago.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Reubicación de Badges Inteligentes en Tarjeta de Producto
* **Tipo:** UI/UX / Disposición Espacial
* **Descripción de Cambios:**
  1. **Evitar Solapamiento con Favoritos (`ProductCard.jsx`):** Para evitar que las etiquetas inteligentes muy largas (como "Oferta Imperdible") colisionen o se encimen con el botón flotante de favoritos (ubicado arriba a la derecha), se reubicó el bloque de badges:
     - **Nueva posición:** Las etiquetas ahora se posicionan en la esquina inferior izquierda del contenedor de imagen (`absolute bottom-3 left-3`).
     - **Separación Limpia:** Esto crea una división diagonal perfecta con el botón de favoritos (`absolute top-3 right-3`), previniendo solapamientos en cualquier resolución de pantalla.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Limpieza de Líneas Separadoras y Fondo en Tarjetas de Producto
* **Tipo:** UI/UX / Simplificación Visual
* **Descripción de Cambios:**
  1. **Simplificación Estética de Tarjetas (`ProductCard.jsx`):** Para lograr una interfaz limpia y minimalista de alta gama, realizamos las siguientes correcciones:
     - **Fondo de Tarjeta Limpio:** Eliminamos el gradiente sucio y restauramos un color de fondo sólido `bg-surface` (blanco en modo claro). Esto hace que las tarjetas contrasten y destaquen de manera nítida sobre el fondo rosado general del catálogo.
     - **Eliminación de Líneas Separadoras:** Removemos el borde superior horizontal (`border-t border-primary-soft/10`) por encima de los precios. El espacio libre actúa ahora como el divisor natural.
     - **Borde de Contenedor Suave:** Se cambió el borde de tarjeta rígido por un borde ultra-sutil `border-black/5` que perfila el elemento sin ensuciar la visual.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Rediseño Estético Ultra-Premium de Tarjetas de Producto en App Ventas
* **Tipo:** UI/UX / Estilos Premium
* **Descripción de Cambios:**
  1. **Rediseño Estético de Tarjetas (`ProductCard.jsx`):** Elevamos el nivel visual de las tarjetas del catálogo implementando los siguientes elementos de diseño premium:
     - **Contenedor Glassmorphic & Gradientes:** Fondo de tarjeta con gradiente sutil (`bg-gradient-to-b from-surface to-surface-2/30`) y bordes refinados de baja opacidad (`border-primary-soft/15`). Sombras dinámicas y profundas en hover (`hover:shadow-[0_20px_40px_rgba(var(--color-primary),0.1)]`) que mejoran la interacción.
     - **Smart Badges con Glassmorphism:** Etiquetas inteligentes de conversión ("Oferta", "Nuevo", "Agotado") con fondos semi-transparentes (`bg-.../86` o backdrop-blur) y bordes contrastantes delgados.
     - **Efectos Micro-interactivos:** Zoom suave en la imagen al posar el cursor (`group-hover:scale-105 duration-700 ease-out`), transición elástica de elevación en hover, e indicadores de variantes con efecto hover suave.
     - **Tipografía y Jerarquía:** Título con espaciado balanceado, categoría destacada en formato de texto ultra-pequeño con espaciado de letras aumentado (`text-[9px] tracking-widest text-primary/75 uppercase`) para un look moderno de revista de diseño.
     - **Botón Favorito y CTA Pulidos:** Botón de favoritos con transición de color y escala táctil, y botón "+" con sombra suavizada y escala interactiva en hover.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Hotfix: Definición de actualPrice en ProductCard
* **Tipo:** Bugfix
* **Descripción de Cambios:**
  1. **Definición de Variable Faltante:** Se corrigió un ReferenceError (`actualPrice is not defined`) al renderizar el pie de tarjeta en `ProductCard.jsx` definiendo la variable `actualPrice` de forma local a partir del estado promocional del producto.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Rediseño del Pie de Tarjeta de Producto en App Ventas para Evitar Colisiones
* **Tipo:** UI/UX / Maquetación
* **Descripción de Cambios:**
  1. **Prevención de Solapamiento de Precios:** Se rediseñó la sección de precios y el botón "+" en la tarjeta de producto (`ProductCard.jsx`). Para evitar colisiones en pantallas angostas con cifras de precios largas (ej. de más de 7 dígitos), se realizaron los siguientes ajustes:
     - **Apilamiento Vertical de Precios:** El precio base anterior (tachado) y el precio activo de oferta se muestran ahora apilados verticalmente en lugar de en fila horizontal.
     - **Ajuste de Tipografía y Contenedores:** Se configuró un tamaño de fuente responsivo (`text-sm sm:text-base`) con truncado explícito (`truncate`) para el precio principal.
     - **Botón Redimensionado:** Se redujo proporcionalmente el botón "+" de `w-9 h-9` (con icono 16px) a `w-8 h-8` (con icono 14px) para ganar holgura.
     - **Separador Estético:** Se añadió una línea divisoria superior muy sutil (`border-t border-primary-soft/30`) para estructurar mejor el pie de la tarjeta.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Corrección de Etiquetas Inteligentes y Detección de Nuevos Productos en App Ventas
* **Tipo:** Bugfix / Optimización Comercial
* **Descripción de Cambios:**
  1. **Filtrado de Promoción por Precio Descuento Real:** Se corrigió el error en `ProductCard.jsx`, `ProductDetailPage.jsx`, y `ProductPublicDetail.jsx` que activaba la etiqueta de "Oferta Imperdible" en todos los productos. Se reemplazó la validación laxa `product.tienePromocion || product.discountActive` por una validación estricta de precio: `typeof product.precioPromo === 'number' && product.precioPromo > 0 && product.precioPromo < product.precioBase`.
  2. **Detección de Nuevos Productos con Serialización Firestore:** Se resolvió el bug que impedía mostrar la etiqueta "Nuevo". El formato de fecha `product.createdAt` se recibe serializado como `{ seconds, nanoseconds }` en el estado, lo que causaba que `new Date(product.createdAt)` retornara `NaN`. Se añadió un parseo explícito para `seconds * 1000`, permitiendo calcular correctamente el límite de días transcurridos.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductDetailPage.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductPublicDetail.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
* **Verificación:** Compilación del núcleo App Ventas realizada con éxito.

### [2026-06-09] - Ajuste de Responsividad y Posición de Toast de Notificación
* **Tipo:** UI/UX / Responsividad
* **Descripción de Cambios:**
  1. **Posicionamiento Responsivo de Toasts:** Se corrigió el recorte lateral de las notificaciones toast (`GuidedToast.jsx`) en dispositivos móviles. Se reemplazó la clase fija `right-6 w-full max-w-sm` por un layout responsivo:
     - En dispositivos móviles: `bottom-6 left-4 right-4 w-auto`, lo que hace que el toast ocupe el ancho adecuado de la pantalla y respete los márgenes laterales (16px a cada lado), impidiendo cualquier desborde o recorte a la izquierda.
     - En pantallas de escritorio: `md:left-auto md:right-6 md:w-full md:max-w-sm`, manteniendo el diseño de panel flotante lateral derecho original.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/ui/GuidedToast.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/ui/GuidedToast.jsx) [MODIFY]
* **Verificación:** Compilación del dashboard realizada con éxito.

### [2026-06-09] - Rediseño Premium de Tarjeta de Estado del Sistema en Perfil
* **Tipo:** UI/UX / Estilos Premium
* **Descripción de Cambios:**
  1. **Tarjeta de Sistema Premium en Perfil:** Se sustituyó el contenedor plano de información del sistema en el modal del perfil de administrador en `App.jsx` por una tarjeta de diseño premium con:
     - Fondo en gradiente y efecto glassmorphic (`backdrop-blur-md` y sombreado interno/externo).
     - Incorporación de iconos SVG (`Database`, `Layers`) al lado de cada etiqueta de datos.
     - Indicador visual animado de pulso (`animate-pulse`) en el estado de conexión de la base de datos (verde/ámbar/rojo).
     - Línea divisora en gradiente de fade-out.
     - Destello de fondo dinámico que responde de forma interactiva en la parte superior derecha de la tarjeta al posar el cursor (`hover:bg-indigo-500/10`).
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilación del dashboard realizada con éxito.

### [2026-06-09] - Optimización de Tarjetas CRM en Vista Móvil
* **Tipo:** UI/UX / Responsividad
* **Descripción de Cambios:**
  1. **Distribución Responsiva en Tarjetas CRM:** Se refactorizó la sección inferior de las tarjetas de clientes de la lista CRM en `App.jsx`. En pantallas móviles, se añadió una línea separadora superior (`border-t`), y se estructuró en dos columnas usando `justify-between w-full` con alineación a la izquierda (`text-left`) para las métricas de Ventas y Comisión, posicionando el botón "Gestionar" de manera elegante a la derecha. En pantallas de escritorio, mantiene el comportamiento original inline.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilación del dashboard realizada con éxito.

### [2026-06-09] - Unificación Horizontal de Botones en Consola de Monitoreo
* **Tipo:** UI/UX / Maquetación
* **Descripción de Cambios:**
  1. **Layout en Fila Única y Scrollable:** Se modificó el contenedor flex de los botones de control de la Consola de Errores ("Simular Fallo", "Resolver Todos", "Vaciar Historial") en `App.jsx` a `flex-row items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none` y se inyectó `shrink-0` en los botones. Esto los mantiene en una única fila horizontal sin alterar la estructura en pantallas normales y habilita un scroll horizontal limpio y contenido en pantallas móviles muy angostas, evitando que los botones se salgan del margen de la ventana o se desborden de su contenedor.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Verificado visualmente y compilado de producción completado con éxito.

### [2026-06-09] - Optimización de Búsqueda Recursiva y Corrección de 404 en CLI Bridge
* **Tipo:** Bugfix / Optimización de Rendimiento
* **Descripción de Cambios:**
  1. **Evitación de Timeouts en Búsqueda Recursiva:** Se optimizó la función `searchFileRecursively` en `server.js` de `Prototipe-CLI` para omitir carpetas de dependencias y temporales como `node_modules`, `.git`, `dist`, `.vite`, y otros archivos ocultos/del sistema (`.`). Esto previene el congelamiento de solicitudes HTTP y soluciona el error 404/Timeout que impedía que el visor del dev-dashboard cargara el código fuente de los incidentes reportados.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
* **Verificación:** El tiempo de resolución y respuesta de búsqueda de archivos ha disminuido a menos de 5ms, garantizando la carga instantánea del código.

### [2026-06-09] - Corrección de Oclusión y Layout en Drawer de Diagnóstico de Incidente
* **Tipo:** UI/UX / Responsividad / Maquetación
* **Descripción de Cambios:**
  1. **Ajuste de Padding en Contenedor:** Se cambió la clase de maquetación del contenedor flex del drawer de incidentes en `App.jsx` de `pl-10` a `pl-0 sm:pl-10`. Esto solventa el error donde la ventana de diagnóstico quedaba cortada lateralmente en dispositivos móviles o pantallas angostas al empujar el ancho `w-screen` del drawer fuera del viewport.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilación del dashboard realizada exitosamente para producción.

### [2026-06-09] - Corrección de Enlaces Rotos (404) de Módulos Completos en Biblioteca de Componentes
* **Tipo:** Bugfix / Consistencia de Documentación
* **Descripción de Cambios:**
  1. **Corrección de Nombres de Archivos en Links:** Se corrigieron los nombres de los enlaces a los archivos markdown físicos para los módulos "Créditos y Saldos" (`creditos_saldos.md` en lugar de `creditos_y_saldos.md`) y "Omnicanalidad WhatsApp" (`omnicanalidad.md` en lugar de `omnicanalidad_whatsapp.md`) en el archivo `README.md` del catálogo oficial de la biblioteca, reparando los errores 404 que impedían su correcta lectura desde el visor del dashboard de desarrollo.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
* **Verificación:** Verificado mediante curl local al API del Daemon CLI (/api/library y /api/library/file) regresando código 200 y el contenido de markdown respectivo con éxito.

### [2026-06-09] - Ajuste de Alineación en Botón Agregar de Tarjeta de Producto
* **Tipo:** UI/UX / Consistencia Visual
* **Descripción de Cambios:**
  1. **Alineación Simétrica del Botón Más:** Se modificó la alineación del contenedor flex del precio y el botón de acción en `ProductCard.jsx` de `items-center` a `items-end`. Esto soluciona el problema de márgenes asimétricos causado por productos con descuento (cuyo bloque de precios de tres líneas desplazaba el botón verticalmente hacia el centro), logrando un margen inferior idéntico al margen lateral derecho.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/catalog/ProductCard.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
* **Verificación:** Compilado exitosamente.

### [2026-06-09] - Visualización de Chips de Color y Flexibilización de Filtros en Catálogo
* **Tipo:** UI/UX / Innovación / Consistencia de Catálogo
* **Descripción de Cambios:**
  1. **Chips de Color Premium (`COLOR_NAMES`):** Se implementó un diccionario estático en `ClientFilterModal.jsx` para traducir códigos hexadecimales de color (ej. `#171717`, `#F5F5DC`) a nombres amigables en español ("Negro", "Beige"). Se rediseñó el renderizado en la UI para mostrar chips interactivos con una bolita con el color físico del producto y su respectivo nombre, ocultando por completo los códigos hexadecimales crudos.
  2. **Refactor de Lógica Multivariante (OR-Inclusive):** Se cambió la validación de variantes de productos en `ClientCatalog.jsx`. Anteriormente, el buscador requería que una única variante individual cumpliera con la talla AND el color filtrado simultáneamente. Ahora, la validación se hace a nivel de producto: el producto se muestra si tiene al menos una variante de la talla solicitada AND al menos una variante del color solicitado, flexibilizando la búsqueda y aumentando la conversión al evitar oclusiones falsas.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/catalog/ClientFilterModal.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ClientFilterModal.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ClientCatalog.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/catalog/ClientFilterModal.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/catalog/ClientFilterModal.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ClientCatalog.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
* **Verificación:** Sincronizado a plantillas mediante CLI. Compilación y bundle Vite validados con éxito sin advertencias.

### [2026-06-09] - Solución a la Oclusión y Apertura de Dropdowns en Formulario de Inventario (Vista Móvil)
* **Tipo:** UI/UX / Bugfix / Responsividad
* **Descripción de Cambios:**
  1. **Apertura de Selectores hacia Arriba (`dropUp`):** Se integró la propiedad `dropUp={true}` en los componentes `CustomSelect` utilizados para seleccionar "Atributos Personalizados" (como Marca) y "Tipo de Descuento" en la creación y edición de productos (`ProductFormModal.jsx`). Esto corrige el problema en la vista móvil donde el dropdown se abría hacia abajo y era bloqueado o tapado por la barra fija inferior del botón "Siguiente" o por el contenedor del modal.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/admin/inventory/ProductFormModal.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/admin/inventory/ProductFormModal.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]
* **Verificación:** Compilación del core y de la plantilla CLI ejecutadas con éxito. Cambios sincronizados mediante CLI.

### [2026-06-09] - Icono de Carrito Animado y Auto-Rotación por Inactividad en Sugerencias del Carrito (Mazo Tinder)
* **Tipo:** UI/UX / Innovación / Gamificación / Optimización Comercial
* **Descripción de Cambios:**
  1. **Reemplazo de Icono Comercial:** Se sustituyó el antiguo icono de "+" por un carrito de compras interactivo (`ShoppingCart` de lucide-react) en el botón inferior derecho de las sugerencias Tinder en el carrito (`CartDrawer.jsx`).
  2. **Micro-animación Premium:** Se configuró una animación mediante framer-motion con escala cíclica (`scale: [1, 1.12, 1]`) y un efecto de sombra difuminada y pulsante (`boxShadow`) que guía sutil pero efectivamente al usuario a tocar el botón e interactuar.
  3. **Auto-Rotación por Inactividad:** Se implementó una lógica de auto-autoplay mediante temporizador (5 segundos de inactividad) que desliza automáticamente la tarjeta hacia la izquierda y la recoloca al final del mazo (enviándola al final del array local). Esto evita que los productos queden permanentemente ocultos si la persona no realiza swipe manual, mostrándole un carrusel dinámico interactivo continuo.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
* **Verificación:** Sincronizado a plantillas mediante `sync_templates.js ventas` en el CLI y compilación Vite verificada de manera exitosa.

### [2026-06-09] - Rediseño Gamificado de Recomendaciones en Carrito (Mazo de Tarjetas Deslizables)
* **Tipo:** UI/UX / Innovación / Gamificación
* **Descripción de Cambios:**
  1. **Integración de SwipeableCardStack:** Se implementó el componente de la biblioteca `Mazo_Tarjetas_Deslizables` (SwipeableCardStack) en el pie del carrito de compras (`CartDrawer.jsx`).
  2. **Interacciones Gamificadas (Swipe):** Los usuarios pueden arrastrar y deslizar la tarjeta de recomendación activa: hacia la izquierda para ignorar/descartar la sugerencia, y hacia la derecha para agregar automáticamente el producto al carrito de compras.
  3. **Visualización e Indicadores:** Se muestran efectos de escala 3D y profundidad en tarjetas de fondo (secundaria y terciaria) y un texto guía en la parte inferior para explicar de forma inmediata la mecánica de deslizamiento.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY]
* **Verificación:** Sincronizado a plantillas y verificado mediante build local de producción exitoso.

### [2026-06-09] - Unificación y Dinamismo de Etiquetas Inteligentes en Detalle de Producto y Portal QR
* **Tipo:** UI/UX / Consistencia de Datos / Smart Tags
* **Descripción de Cambios:**
  1. **Dinamización de Cabecera Desktop:** Se actualizó la cabecera en vista de escritorio de `ProductDetailPage.jsx` para consumir la constante reactiva `activeSmartTag` con sus estilos HSL/Hex y texto personalizado, reemplazando la lógica estática anterior.
  2. **Implementación de Hooks en Portal QR:** Se agregaron los hooks de resolución `stockConsolidado` y `activeSmartTag` en `ProductPublicDetail.jsx` idénticos a los del detalle de producto.
  3. **Integración en Vista Pública:** Se reemplazaron las etiquetas e insignias estáticas y colores fijos ("bg-[#ff5a00]", "bg-[#2968c8]", etc.) del portal público QR por la constante `activeSmartTag` dinámica y configurable por el administrador.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductDetailPage.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductPublicDetail.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
* **Verificación:** Sincronizado a plantillas mediante `sync_templates.js ventas` y verificado mediante build local de producción exitoso.

### [2026-06-09] - Blindaje Preventivo y Estandarización de Cierre de Sesión Administrador en Ecosistema (GEMINI.md)
* **Tipo:** Aseguramiento de Calidad / Estandarización / Reglas IA
* **Descripción de Cambios:**
  1. **Directiva Maestra de Cierre de Sesión Híbrido:** Agregada regla mandatoria en `GEMINI.md` de control de resguardo, obligando a que todo proceso de logout de administradores limpie tanto el estado local (Zustand/LocalStorage) como el estado de Firebase Auth en IndexedDB mediante `signOut(auth)`.
  2. **Sincronización en Cascada:** Ejecutado el script `sync_rules.js` para propagar y forzar esta regla en 9 destinos del disco, incluyendo plantillas del CLI (`template-agendamiento`, `template-ventas`, `template-core-seed`), cores del proyecto y el panel central de control.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
  - Propagación en cascada a 9 destinos adicionales.
* **Verificación:** Sincronizador de reglas ejecutado exitosamente con 9 destinos actualizados correctamente.

### [2026-06-09] - Consistencia y Renderizado de Descuentos en Ficha de Detalle de Producto y Portal QR
* **Tipo:** Bugfix / Consistencia de Datos / UI-UX
* **Descripción de Cambios:**
  1. **Unificación de Precios Promocionales:** Se corrigió un bug de inconsistencia de precios donde los descuentos directos configurados en el inventario del producto (`discountActive`, `discountType`, `discountValue`) solo se reflejaban si el producto tenía un anuncio publicitario (`ad`) activo vinculado.
  2. **Fallback de Descuento Directo:** Se implementó una lógica de fallback en el mapeo de productos en `ClientCatalog.jsx`, la página de detalle de la tienda `ProductDetailPage.jsx` y el portal público de compra por QR `ProductPublicDetail.jsx` para procesar el descuento nativo del producto.
  3. **Visualización de Precio Tachado:** Se habilitó el precio base original tachado y la etiqueta de descuento correspondiente ("% OFF" u "OFERTA") en las vistas móviles y de escritorio de ambas fichas.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ClientCatalog.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductDetailPage.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ProductPublicDetail.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
* **Verificación:** Sincronizado a plantillas y validado mediante build exitoso local en Core y plantilla CLI.

### [2026-06-09] - Solución a la Detección de Repositorios Git en el Gestor de Respaldos
* **Tipo:** DevOps / Bugfix / Scripts
* **Descripción de Cambios:**
  1. **Liberación de locks de archivos:** Se identificó que el repositorio `.git` de App Ventas se quedó renombrado de forma persistente como `.git-backup-temp` debido a bloqueos de archivos que mantenían los servidores de desarrollo Vite activos al finalizar ejecuciones anteriores de backups.
  2. **Actualización de menu_backup.ps1:** Se modificó la rutina de auto-recuperación al inicio del script del menú de respaldos. Ahora, si el sistema detecta directorios `.git-backup-temp` pendientes de restauración, busca y detiene de forma automática los procesos `node.exe` asociados a Vite antes de renombrar, garantizando la liberación de los descriptores de archivos bloqueados y la correcta detección y visualización de Git en la consola (removiendo el indicador erróneo de "Sin Git").
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/menu_backup.ps1`](file:///D:/PROTOTIPE/menu_backup.ps1) [MODIFY]
* **Verificación:** Directorio renombrado manualmente y cambio validado; script de menú probado localmente con éxito.

### [2026-06-09] - Rediseño del Perfil de Cliente, Optimización de Sidebar, Animaciones y Stacking Context de Emojis
* **Tipo:** UI/UX / Optimización / Estilo / Bugfix
* **Descripción de Cambios:**
  1. **Rediseño del Perfil de Cliente:** Reorganizada la UI de `ClientProfile.jsx` utilizando tarjetas premium para agrupar las acciones de "Mis Pedidos", "Mis Créditos", la descarga de la PWA, el modo asistencia y un banner cotizador de marca blanca para el desarrollador.
  2. **Optimización del Sidebar de Escritorio:** Modificado `ClientLayout.jsx` para situar la identidad y marca del cliente arriba en el sidebar, y un centro de control rápido con 3 botones de igual tamaño abajo (Carrito, Notificaciones y Perfil).
  3. **Animaciones de Carrito y Campana:** Integrado un efecto wiggle/bounce interactivo reactivo a la existencia de items en carrito o notificaciones no leídas en `ClientLayout.jsx` y `AdminLayout.jsx`.
  4. **Solución del Lápiz de Edición:** Corregido el bloqueo de clics del selector de emojis aplicando la propiedad `pointer-events-none` al icono del lápiz decorativo superpuesto.
  5. **Resolución de Stacking Context:** Cambiado el `z-index` del header del perfil y su contenedor interno a `z-40` y del selector de emojis a `z-50` en `ClientProfile.jsx`, asegurando que el selector de emojis siempre flote en la parte superior y no sea cubierto por las tarjetas de contenido inferiores (`z-20`).
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/client/ClientProfile.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientProfile.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/layouts/ClientLayout.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/layouts/AdminLayout.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
* **Verificación:** Sincronizado y verificado localmente mediante build de producción exitoso.

### [2026-06-09] - Sincronización de Créditos con Domicilio/Descuento y Optimización de Carga Paginada
* **Tipo:** Bugfix / Optimización de Rendimiento / Transaccionalidad
* **Descripción de Cambios:**
  1. **Sincronización Transaccional en Aprobación de Deuda:** Se modificó `updateOrderStatus` en `orderService.js`. Al aprobar un crédito, ahora se consultan primero los datos en caliente del pedido de Firestore (`latestOrderDoc`) para registrar la deuda con el total real, incluyendo el costo del domicilio y descuentos aplicados.
  2. **Actualización de Envío en Créditos Existentes:** Se actualizó `updateOrderDeliveryCost` en `orderService.js`. Al cambiar el costo de envío, si el pedido tiene un crédito activo asociado (`credits`), se actualizan automáticamente sus campos `total`, `montoTotal` y `saldoPendiente` con la diferencia respectiva.
  3. **Optimización de Carga Paginada de Créditos:** Se optimizó `getCreditsPaged` en `creditService.js` para consultar `limitSize + 1` elementos en lugar de hacer un segundo fetch redundante secuencial (`checkNext`) para verificar páginas siguientes.
  4. **Adaptación de Interfaz:** Se adaptó `AdminCredits.jsx` para consumir directamente el flag `hasNextPage` devuelto por la consulta optimizada de `getCreditsPaged`.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/services/orderService.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/services/creditService.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/AdminCredits.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]
* **Verificación:** Sincronizado downstream y validado mediante build exitoso de Vite.

### [2026-06-09] - Corrección de ReferenceError: CheckCircle is not defined en Zona de Desarrollador
* **Tipo:** Bugfix / Estabilidad
* **Descripción de Cambios:**
  1. **Importación de Icono Faltante:** Se agregó la importación de `CheckCircle` desde `lucide-react` en `DeveloperSettings.jsx` para resolver la excepción de tiempo de ejecución `ReferenceError: CheckCircle is not defined` que ocurría al lanzar errores de prueba o realizar acciones exitosas dentro de la zona de desarrollador.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
* **Verificación:** Sincronizado downstream y validado mediante build exitoso de Vite.

### [2026-06-09] - Estructuración y Categorización de Paletas de Colores por Nicho de Negocio
* **Tipo:** UI/UX / Diseño / Características
* **Descripción de Cambios:**
  1. **Repertorio de Paletas de Colores Premium Ampliado:** Agregadas 25 paletas de colores profesionales y personalizadas (5 por nicho/categoría) en `palettes.js` alineadas con los siguientes nichos: Moda y Accesorios (Retail), Gastronomía y Alimentos, Salud y Belleza (Estética), Tecnología y Deportes, y Mascotas y Naturaleza.
  2. **Categorización y Agrupación Visual en UI:** Se actualizó `AppearanceSettings.jsx` para realizar una agrupación mediante reducción de las paletas, renderizando secciones y subgrids en el selector de temas para una navegación organizada.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/constants/palettes.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/constants/palettes.js) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx) [MODIFY]
* **Verificación:** Sincronizado downstream y validado mediante build exitoso de Vite.

### [2026-06-09] - Optimización del Retorno de Navegación de Subsecciones en el Panel de Ajustes
* **Tipo:** UI/UX / Flujo de Navegación / Usabilidad
* **Descripción de Cambios:**
  1. **Navegación Multinivel Jerárquica:** Se modificó la acción del botón de retroceso (`ArrowLeft` principal) en `AdminSettings.jsx`. Ahora, si hay un `activeSubSection` no nulo, se restablece a `null` para volver al menú de la sección padre (ej. Zona de Desarrollador) en lugar de limpiar ambos estados (`activeSection` y `activeSubSection`), lo cual desmontaba el componente de desarrollo y forzaba al usuario a re-ingresar el PIN maestro.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Verificación:** Sincronización downstream ejecutada con éxito y validada mediante build de producción de Vite.

### [2026-06-09] - Corrección de Contraste y Activación del Modal de Selección de Temas en Ajustes
* **Tipo:** UI/UX / Accesibilidad / Bugfix
* **Descripción de Cambios:**
  1. **Mejora de Contraste en Botón "Cambiar":** Se cambió la clase de color del botón de selección de tema en `AppearanceSettings.jsx` de `bg-app text-surface` a `bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100` para garantizar que el texto no sea blanco sobre fondo blanco y cumpla con las pautas de accesibilidad y contraste.
  2. **Activación de Modal de Selección de Temas:** Se reincorporó e integró el markup del Selector de Tema Inteligente dentro del componente desacoplado `AppearanceSettings.jsx` utilizando su propio estado local `isThemeModalOpen` y el helper de scroll `ThemeModalLock` que se omitió en la refactorización anterior.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx) [MODIFY]
* **Verificación:** Compilación local de Vite/Rolldown en Core y CLI exitosa. Verificado que el selector y los botones funcionan con alto contraste.

### [2026-06-09] - Modularización y Desacoplamiento de Ajustes en App Ventas
* **Tipo:** Refactorización / Modularidad / Ecosistema / Bugfix
* **Descripción de Cambios:**
  1. **Segmentación Completa del Monolito:** El panel monolítico `AdminSettings.jsx` (400KB) fue dividido en 9 sub-componentes independientes y un visor interactivo móvil (`MobilePreview.jsx`) agrupados en `src/pages/admin/settings/`.
  2. **Secciones Creadas (Revisión 2):** Se crearon los componentes independientes para Apariencia (`AppearanceSettings.jsx`), Publicidad (`AdSettings.jsx`) y Cupones (`CouponSettings.jsx`), corrigiendo el fallo de tiempo de ejecución `ReferenceError: secApariencia is not defined` provocado por marcadores no instanciados.
  3. **Listado de Módulos Desacoplados:** Identidad de marca (`BrandSettings.jsx`), personal (`EmployeeSettings.jsx`), operativa y DIAN (`StoreSettings.jsx`), cuentas bancarias (`PaymentSettings.jsx`), credenciales de administrador (`SecuritySettings.jsx`), herramientas protegidas del desarrollador (`DeveloperSettings.jsx`), apariencia y colores (`AppearanceSettings.jsx`), publicidad y banners (`AdSettings.jsx`) y cupones de descuento (`CouponSettings.jsx`).
  4. **Enrutamiento Limpio:** Se reestructuró `AdminSettings.jsx` como un enrutador / distribuidor limpio que mantiene el estado global unificado y consume los componentes encapsulados de forma controlada.
  5. **Propagación en CLI:** Ejecutada la sincronización física downstream del Core a la plantilla CLI de ventas (`sync_templates.js ventas`), validándose la correcta compilación y empaquetado del bundle.
* **Archivos Creados/Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/AdminSettings.jsx.bak`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx.bak) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/components/MobilePreview.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/components/MobilePreview.jsx) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/BrandSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/BrandSettings.jsx) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/EmployeeSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/EmployeeSettings.jsx) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/StoreSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/StoreSettings.jsx) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/PaymentSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/PaymentSettings.jsx) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/SecuritySettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/SecuritySettings.jsx) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/AdSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/AdSettings.jsx) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/src/pages/admin/settings/sections/CouponSettings.jsx`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/CouponSettings.jsx) [NEW]
* **Verificación:** Compilación del core y de la plantilla de producción del CLI aprobadas exitosamente (`npm run build`). Pruebas E2E de integración (`node test_templates.js --template ventas`) superadas sin incidentes (✓ PASSED en 16.4s).

### [2026-06-09] - Creación de Documentación de Estructura de Ajustes en App Ventas
* **Tipo:** Documentación / Consistencia
* **Descripción de Cambios:**
  1. **Documentación de Configuraciones:** Creado el archivo [`estructura_ajustes.md`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/estructura_ajustes.md) detallando minuciosamente la jerarquía, menú de primer nivel, subsecciones internas y lógica de estado/persistencia del panel de administración (`AdminSettings.jsx`).
  2. **Indexación en Mapa Semántico:** Registrado el nuevo archivo de documentación local en `mapa_documentacion_ia.md` con su correspondiente Criterio de Decisión IA.
* **Archivos Creados/Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/Documentacion App Ventas/estructura_ajustes.md`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/estructura_ajustes.md) [NEW]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
* **Verificación:** Rutas verificadas en caliente y consistencia de mapas comprobada.

### [2026-06-09] - Sincronización e Integración Física del Core con la Plantilla de Ventas (template-ventas)
* **Tipo:** DevOps / Automatización / Mantenimiento
* **Descripción de Cambios:**
  1. **Sincronización Física Core ➔ Plantilla CLI:** Se ejecutó `sync_templates.js` para transferir 2 archivos nuevos (incluyendo `alertService.js` y `AlertConfirmContext.jsx`) y 19 modificados (mejoras de estabilidad, transacciones y enrutamiento) desde `App Ventas` hacia la plantilla de ventas en `D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas`.
  2. **Exclusiones de Identidad Locales:** Se mantuvo la exclusión estricta de variables de entorno, credenciales e identidad visual (`.env.local`, `.firebaserc`, `firebase.json`, `index.html` y la carpeta `public/` con logos y manifest personalizados).
  3. **Sanitización Dinámica de Tokens:** Sustitución automática del Project ID real (`ventas-smartfix`) y package name (`app-ventas`) por placeholders genéricos (`proyecto-cliente-saas`) y APIs de Firestore.
* **Archivos Modificados:**
  - Sincronización de 21 archivos en [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/).
* **Verificación:** Ejecución y aprobación de la suite de pruebas post-sincronización `node test_templates.js --template ventas` (PASSED en 26.8 segundos).

### [2026-06-09] - Robustecimiento y Blindaje de Telemetría en la Plantilla Core del CLI
* **Tipo:** DevOps / Calidad / Seguridad / Estándar
* **Descripción de Cambios:**
  1. **Throttling y Resiliencia Offline en la Plantilla Core:** Se portó el algoritmo de throttling por hash simple (60s de silencio para el mismo error) y la cola de persistencia local offline (`localStorage` con tope de 20 logs) con listener `online` al `telemetryService.js` de la plantilla de ventas. Esto protege la Consola Central ante bucles infinitos de excepciones y fluctuaciones de red del cliente.
  2. **Desacoplamiento de Iconos y Estabilidad en Error Boundary:** Se eliminó la dependencia de `lucide-react` de `ErrorBoundaryFallback.jsx` reemplazando los iconos por SVGs inline nativos. Esto garantiza que el Error Boundary sea inmune a fallos en la descarga de librerías de iconos y siempre renderice.
  3. **Simplificación y Fallback Seguro en Reportes:** Se removió la asunción del singleton `alertService.js` (el cual es opcional/desacoplable de la plantilla) en el reporte de fallos manual, usando un fallback nativo y limpio (`window.alert()`) para evitar errores por dependencias faltantes al compilar.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/ui/feedback/ErrorBoundaryFallback.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/ui/feedback/ErrorBoundaryFallback.jsx) [MODIFY]
* **Verificación:** Ejecución exitosa de la suite de pruebas del CLI `node test_templates.js` (PASSED en 25.6 segundos).

### [2026-06-09] - Optimización y Estandarización Profesional de la Generación del CLI
* **Tipo:** DevOps / Automatización / Calidad / Seguridad
* **Descripción de Cambios:**
  1. **Automatización de `firestore.rules`:** Añadido paso 5.3 que inyecta automáticamente el archivo `firestore.rules` con esquema de seguridad restrictivo por defecto (lectura libre si existe, escritura para usuarios autenticados). Esto asegura que al desplegar con Firebase CLI en el paso 11 no haya fallas por archivos faltantes ni base de datos abierta.
  2. **Inyección en caliente de variables HSL en CSS:** Añadido paso 2.1 que lee el archivo de estilos de entrada (`src/index.css`) de la app de destino e inyecta/reemplaza la directiva `@theme` de Tailwind v4 declarando `--color-primary` y `--color-accent` con los colores HSL definidos por la marca.
  3. **Generación/Adaptación dinámica de manifest de la PWA:** Añadido paso 6.1 que lee `manifest.json` o `site.webmanifest` en `public/`. Actualiza dinámicamente `name` con el nombre de la marca, `short_name` con sus iniciales, y convierte a hexadecimal los colores HSL de marca (`theme_color` y `background_color`) para garantizar una integración nativa de la PWA sin placeholders genéricos.
  4. **Robustecimiento de la portabilidad de `GEMINI.md`:** Se rediseñó el saneador de rutas del clon de `GEMINI.md` usando expresiones regulares insensibles a mayúsculas/minúsculas y al tipo de barra (`/` o `\`) para reemplazar cualquier ruta absoluta de desarrollo por rutas relativas locales independientemente del formato de la ruta base del host.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
* **Verificación:** Ejecución exitosa de la suite de pruebas del CLI `node test_templates.js` (PASSED en 30 segundos).

### [2026-06-09] - Migración SSH + Blindaje Definitivo del Engine de Respaldo Git
* **Tipo:** DevOps / Seguridad / Automatización / Bugfix
* **Descripción de Cambios:**
  1. **Migración de autenticación Git HTTPS → SSH:** Las credenciales del Windows Credential Manager expiraron, rompiendo la verificación de conectividad. Se generó una llave ED25519 (`C:\Users\Sergio\.ssh\id_ed25519`), se registró en GitHub (`DEVPROTOTIPE`) y se actualizó el remote de todos los repos del workspace de HTTPS a SSH (`git@github.com:DEVPROTOTIPE/PROTOTIPE.git`). La autenticación SSH no tiene fecha de expiración y no depende de ningún gestor de credenciales de Windows.
  2. **Limpieza del parche GIT_ASKPASS/GIT_TERMINAL_PROMPT:** Con SSH activo, el workaround temporal que inyectaba `GIT_ASKPASS=true` y `GIT_TERMINAL_PROMPT=0` para evitar bloqueos por credenciales fue eliminado de `git_backup.ps1` y `subproject_backup.ps1`. El check de conectividad pasó de un doble ping + ls-remote con env vars parcheadas a un único `git ls-remote origin HEAD 2>$null` limpio cuyo exit code determina si el remote es accesible.
  3. **Corrección flash de error rojo en consola:** El stderr de `git ls-remote` se redirigía con `2>&1` que causaba un flash visual rojo en PowerShell. Cambiado a `2>$null | Out-Null` para silenciar completamente el stream de error sin afectar la captura del exit code.
  4. **Corrección de `Rename-Item: Acceso denegado` en `menu_backup.ps1`:** La rutina de auto-recuperación al abrir el menú usaba `Rename-Item` sin manejo de errores. Si Vite tenía el `.git-backup-temp` bloqueado, mostraba un error rojo y continuaba. Se envolvió con el mismo bucle de reintentos inteligente (6 intentos, 400ms) que ya existía en `git_backup.ps1`.
  5. **Optimización del scan recursivo en `menu_backup.ps1`:** El `Get-ChildItem -Recurse` sin límite de profundidad recorría miles de archivos (incluido `node_modules`) causando delay de 1-3s al abrir el menú. Limitado a `-Depth 3`, suficiente para cubrir todos los subrepos del ecosistema sin penalidad de rendimiento.
  6. **Solución definitiva al bloqueo de Vite sobre `.git` de dev-dashboard:** El backup maestro renombra `.git → .git-backup-temp` en todos los subrepos antes del snapshot, pero Vite (`npm run dev`) retiene un file lock sobre la carpeta `.git` del dev-dashboard impidiendo el renombrado y dejando el estado corrupto. Implementado en `git_backup.ps1`: detección automática del proceso `node.exe` de Vite via WMI (`Win32_Process` filtrando por `CommandLine` que contenga la ruta del dashboard), terminación controlada (`Stop-Process -Force`) antes del renombrado, y relanzamiento automático en nueva ventana PowerShell (`Start-Process`) tras restaurar todos los `.git` en el bloque `finally`. Si Vite no estaba corriendo, el flujo es transparente sin ningún cambio de comportamiento.
  7. **Añadido `-Depth 3` al scan de `.git` del backup maestro:** Consistente con `menu_backup.ps1`, el `Get-ChildItem` del engine principal también fue limitado a 3 niveles de profundidad para evitar recorrer `node_modules`.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/git_backup.ps1`](file:///D:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [`D:/PROTOTIPE/subproject_backup.ps1`](file:///D:/PROTOTIPE/subproject_backup.ps1) [MODIFY]
  - [`D:/PROTOTIPE/menu_backup.ps1`](file:///D:/PROTOTIPE/menu_backup.ps1) [MODIFY]
* **Infraestructura:**
  - Llave SSH: `C:\Users\Sergio\.ssh\id_ed25519` (ED25519, sin passphrase)
  - Remote actualizado: `git@github.com:DEVPROTOTIPE/PROTOTIPE.git` (todos los repos del workspace)
* **Verificación:** `ssh -T git@github.com` retorna `Hi DEVPROTOTIPE! You've successfully authenticated`. `git ls-remote origin HEAD` retorna exit code 0 sin prompts ni bloqueos.

### [2026-06-09] - Bugfix: Blindaje de Scripts de Respaldo Git (.ps1)
* **Tipo:** Bugfix / DevOps / Scripts
* **Descripción de Cambios:**
  1. **Evitación de cuelgues por credenciales Git (git_backup.ps1 y subproject_backup.ps1):** Se deshabilitaron temporalmente los diálogos de credenciales y terminales interactivas (`$env:GIT_TERMINAL_PROMPT = "0"` y `$env:GIT_ASKPASS = "true"`) durante la ejecución de `git ls-remote` en la comprobación de red. Esto evita que el script se cuelgue indefinidamente si el repositorio es privado y faltan credenciales o llaves SSH, respondiendo de inmediato con fallo rápido (fail-fast) y ofreciendo la opción de respaldo local.
  2. **Recuperación robusta ante archivos Git bloqueados (git_backup.ps1):** Se reemplazó el comando de renombrado directo de restauración de subproyectos `.git` en el bloque `finally` por una rutina de reintentos inteligente (hasta 6 intentos espaciados por 400ms). Esto soluciona el error fatal de *"Acceso denegado"* que ocurría cuando Vite (`npm run dev`) u otros procesos retenían bloqueos temporales sobre la carpeta `dev-dashboard\.git-backup-temp`.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/git_backup.ps1`](file:///D:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [`D:/PROTOTIPE/subproject_backup.ps1`](file:///D:/PROTOTIPE/subproject_backup.ps1) [MODIFY]
* **Verificación:** Ejecución y comportamiento verificado de forma no interactiva.

### [2026-06-09] - Estandarización de Selectores Desplegables Premium en dev-dashboard
* **Tipo:** Refactorización / Estándar de Diseño / UI/UX / Bugfix
* **Descripción de Cambios:**
  1. **Estandarización de Componentes:** Reemplazados todos los dropdowns `<select>` nativos e interfaces personalizadas inconsistentes en el dashboard administrador por el componente unificado de diseño atómico `CustomSelect`.
  2. **Resolución de Conflictos en App.jsx:** Removida la importación duplicada/redundante en `App.jsx` y re-estilizada la función `CustomSelect` local (con firmas de eventos personalizadas) para compartir la misma estética oscura, HSL refinado, viñetas redondeadas y marcas de check que el componente atómico principal.
  3. **Integración en CoreManagerPanel.jsx:** Sustituido el selector personalizado de scaffold de cores base por la instancia de `CustomSelect` con su respectivo ícono y opciones dinámicas.
  4. **Solución a Bug de Superposición / Clipping ("queda por detrás"):** Removida la propiedad `overflow-hidden` del wrapper de tarjetas de cores en `CoreManagerPanel.jsx` (añadiendo `rounded-t-2xl` a la cabecera para mantener la estética de bordes redondeados al hacer hover) y aplicado z-index condicional (`isExpanded ? 'z-20' : 'z-0'`) para garantizar que la tarjeta activa se sitúe por encima de las posteriores y el menú desplegable flote libremente.
  5. **Actualización de Sandboxes:** Portada la integración de `CustomSelect` a los sandboxes del panel administrador: `CreditosSaldosSandbox.jsx`, `CustomCursorSandbox.jsx` y `ReservasAgendaCitasSandbox.jsx` para estandarizar la interfaz en su totalidad.
* **Archivos Creados/Modificados:**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CreditosSaldosSandbox.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CreditosSaldosSandbox.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CustomCursorSandbox.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CustomCursorSandbox.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ReservasAgendaCitasSandbox.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ReservasAgendaCitasSandbox.jsx) [MODIFY]
* **Verificación:** Compilación de producción con Vite exitosa en 1.01s. Pruebas visuales de superposición e interactividad en selectores desplegables certificadas.

### [2026-06-09] - Robustecimiento y Automatización del CLI Daemon (Puerto 3001)
* **Tipo:** Refactorización / Seguridad / Automatización / PWA / DB Sync / CLI
* **Descripción de Cambios:**
  1. **Validación de contraste HSL:** Se implementaron las funciones `parseHSL` y `validateHSLColors` en `server.js` para asegurar que las paletas cromáticas personalizadas del cliente cumplan con al menos un 30% de diferencia de luminosidad entre el primario y el fondo antes del aprovisionamiento, protegiendo la legibilidad de la UI.
  2. **Procesamiento de Logos PWA con Jimp:** Modificada la generación de assets PWA en `generator.js`. Se aplica redimensionamiento proporcional para evitar distorsiones en logos y se añade un margen seguro del 10% (safe area) para iconos PWA maskables y de Apple, rellenando con el fondo del tema del cliente de forma inteligente.
  3. **Smoke Test Headless con Playwright:** Se programó una rutina síncrona en `worker_create_project.js` para levantar temporalmente el servidor Vite del cliente generado en el puerto `5190` y ejecutar un navegador chromium headless para verificar que la página renderiza correctamente y que no existan errores fatales en la consola de React.
  4. **Auto-Generación del Mapa Semántico:** Se configuró en `generator.js` la ejecución síncrona inmediata de `generate_ia_map.js` una vez creados los archivos, asegurando la existencia en caliente de `mapa_arquitectura_ia.md` desde el primer minuto.
  5. **Auditoría e Inyección de Reglas de Base de Datos:** Creado el endpoint `/api/project/sync-database` para comparar los archivos `firestore.rules`, `firestore.indexes.json` y `storage.rules` del cliente contra los de su plantilla original configurada en `.prototipe.json`, permitiendo sincronizar y desplegar automáticamente las reglas en caliente.
  6. **Escaneo de Cores de Pruebas E2E:** Se modificó el endpoint `/api/e2e/projects` para buscar proyectos con Playwright tanto en `Instancias Clientes/` como en `Plantillas Core/` (añadiendo la etiqueta `(Core)`), evitando la pantalla de "Sin proyectos" cuando no hay clientes activos instanciados.
* **Archivos Creados/Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js`](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx) [MODIFY]
* **Verificación:** Funciones de validación cromática e iconos PWA validadas en caliente. Rutinas del worker del aprovisionador y endpoints de sincronización agregados y listos para ejecutar. Escaneo dual de proyectos Playwright verificado.

### [2026-06-09] - Optimización de Rendimiento por manualChunks y Modo Simulación de Diffs en CLI Sincronizador
* **Tipo:** Optimización / Performance / DevOps / CLI
* **Descripción de Cambios:**
  1. **Segmentación del Core de Ventas (vite.config.js):** Se implementó la opción `manualChunks` en la configuración de Vite para extraer dependencias masivas (`firebase`, `jspdf`/`html2canvas`/`jspdf-autotable`, `framer-motion` y `lucide-react`) en sus propios archivos JS independientes cargados de manera asíncrona. Esto redujo el tamaño del bundle principal de 1.13 MB a 132.6 kB (reducción del 90%), optimizando la carga en móviles y eliminando warnings de empaquetado de Vite.
  2. **Propagación a Plantillas y Proyectos Futuros:** Se replicó la configuración de `manualChunks` en Vite y se actualizaron las exclusiones del `.gitignore` (incorporando `.vite/`, `playwright-report/`, `test-results/`) tanto en la plantilla de instancias `template-ventas/` como en la semilla de inicialización de nuevos cores `template-core-seed/` para que futuros cores o instancias hereden automáticamente estas optimizaciones.
  3. **Menú de Selección Interactiva en CLI (sync_clients.js):** Se rediseñó la confirmación de sincronización interactiva convirtiéndola en un menú que permite: Aplicar cambios físicamente, Simular los diffs (Dry Run) sin escribir en disco, u Omitir la sincronización para el cliente seleccionado.
  4. **Modo Dry Run / Simulación de Diffs:** Se integró la biblioteca `diff` en `sync_clients.js` para comparar línea por línea los cambios entre el core y el cliente, resaltando con colores de terminal `picocolors` las adiciones en verde (`+`), remociones en rojo (`-`) y resumiendo bloques extensos idénticos para legibilidad del desarrollador.
  5. **Simetría y UX en Móvil (dev-dashboard App.jsx):** Se retiraron las pestañas "Cores" y "Tests E2E" del bottom navigation en móviles para restaurar la simetría perfecta de 5 botones (Inicio, Cobros, Nuevo, Biblioteca, Monitoreo). En su lugar, se añadieron accesos rápidos con diseño a dos columnas en el modal de **Perfil de Administrador**, preservando la funcionalidad intacta sin saturar la navegación inferior.
* **Archivos Creados/Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/vite.config.js`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/vite.config.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/.gitignore`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/.gitignore) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/vite.config.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/vite.config.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/.gitignore`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/.gitignore) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/sync_clients.js`](file:///D:/PROTOTIPE/Prototipe-CLI/sync_clients.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/package.json`](file:///D:/PROTOTIPE/Prototipe-CLI/package.json) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Ejecutada compilación local del Core de Ventas con éxito. Reducción del chunk inicial verificada. Test de ejecución y visualización de diffs en CLI exitoso. Plantilla core semilla y UX móvil del dashboard actualizadas para mayor simetría.

### [2026-06-09] - Creación de Especificación de Flujos de la Consola Central
* **Tipo:** Documentación / Procesos
* **Descripción de Cambios:**
  1. **Especificación de Flujos de dev-dashboard:** Creado el archivo [`flujos_aplicacion.md`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/Documentacion%20dev-dashboard/flujos_aplicacion.md) para registrar de forma visual y textual los flujos de procesos críticos de la Consola Central de control: el aprovisionamiento asíncrono multi-instancia (Worker fork IPC + SSE), el diagnóstico interactivo de incidentes (colección de telemetría + visor de código fuente en caliente) y la consolidación de comisiones de desarrollo vía telemetría en background.
  2. **Depuración de Campos de Onboarding:** Se higienizó el diagrama de secuencia retirando menciones erróneas a la carga de logos desde la interfaz, alineando el flujo estrictamente con los parámetros reales soportados por el formulario (Nombre, Nicho y Colores HSL).
  3. **Indexación Semántica:** Actualizado el mapa de documentación semántica [`mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) para incluir el nuevo manual con su respectivo Criterio de Decisión IA.
* **Archivos Creados/Modificados:**
  - [`D:/PROTOTIPE/Central PROTOTIPE/Documentacion dev-dashboard/flujos_aplicacion.md`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/Documentacion%20dev-dashboard/flujos_aplicacion.md) [NEW]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
* **Verificación:** Archivo creado e indexado con éxito. Sintaxis de diagramas Mermaid validada.


### [2026-06-09] - Fix: Blindaje de Consola de Respaldo e Interfaz de Usuario

* **Tipo:** Bugfix / DevOps / Scripts
* **Descripción de Cambios:**
  1. **Evitación de Cierre Abrupto (backup.bat):** Se añadió control de errores en `backup.bat` evaluando `%errorlevel%` y agregando una instrucción `pause` condicionada para impedir que la consola de CMD de Windows se cierre automáticamente si ocurre un fallo fatal de PowerShell.
  2. **Manejo Seguro del Cursor en PowerShell (menu_backup.ps1):** Se previno la excepción fatal al asignar `$Host.UI.RawUI.CursorSize = 0` en entornos de consola no estándar o Terminales modernas (donde la API del Host restringe el tamaño de cursor de 1 a 100). Se envolvió la llamada en un bloque `try-catch` silencioso y se reemplazó por secuencias de escape ANSI VT (`[?25l` y `[?25h`) para ocultar/mostrar el cursor de forma universal.
  3. **Auto-Recuperación de Subproyectos Git (menu_backup.ps1):** Se implementó una rutina inteligente de auto-recuperación al arrancar el menú principal que escanea y restaura automáticamente directorios `.git-backup-temp` a `.git` en caso de que alguna ejecución del snapshot maestro se haya cancelado de forma forzada a mitad de camino. Se restauraron manualmente los repositorios de `App Ventas` y `dev-dashboard`.
  4. **Optimización de Historial (.gitignore de App Ventas):** Se agregaron reglas de exclusión en `.gitignore` para omitir la caché de compilación local de Vite (`.vite/`) y los reportes/resultados de pruebas de Playwright (`playwright-report/` y `test-results/`), previniendo la subida de basura técnica al repositorio.
  5. **Mensajes de Commit Contextuales Inteligentes (subproject_backup.ps1 y git_backup.ps1):** Se modificó la generación de mensaje automático (cuando el usuario presiona Enter). En lugar de usar la fecha estática, los scripts analizan dinámicamente los cambios pendientes en caliente (`git status --porcelain`) y construyen un mensaje conciso detallando qué archivos fueron modificados (`Mod: ...`), creados/añadidos (`Add: ...`) o eliminados (`Del: ...`), manteniendo el historial de GitHub descriptivo sin esfuerzo manual.
  6. **Bloqueo Preventivo ante Fugas de Variables (.env) (subproject_backup.ps1 y git_backup.ps1):** Se añadió un detector en caliente que escanea el estado de los archivos antes de hacer commit. Si el usuario intenta subir archivos sensibles de configuración local `.env` (excluyendo el archivo público `.env.example`), la ejecución se detendrá de inmediato impidiendo el push y solicitando agregar el archivo al `.gitignore`.
  7. **Gestión Robusta de Conflictos en Fusiones Automáticas (subproject_backup.ps1 y git_backup.ps1):** Se implementó un control en la sección de merge automático (`develop` -> `main`/`master`). Si hay conflictos al intentar unir las ramas en el repositorio remoto, el script aborta la fusión (`git merge --abort`), revierte de forma segura los cambios a la rama de desarrollo de origen y alerta al usuario para resolverlos manualmente, protegiendo así la rama de producción contra inconsistencias o fallas fatales.
  8. **Verificación de Conectividad y Respaldos Offline Locales (subproject_backup.ps1 y git_backup.ps1):** Se integró un validador rápido de red e inicio de sesión en el remoto de GitHub. Si el sistema detecta que está desconectado de internet o que las credenciales no son válidas, te ofrecerá realizar un respaldo puramente local (commit local en disco). Si se rechaza, el script revierte de forma limpia el commit para mantener intacto el entorno.
  9. **Actualización de Documentación de Arquitectura y Remoción de Diagrama Global:** Se actualizó la guía [`arquitectura_git.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/01_Control_Versiones/arquitectura_git.md) detallando los modos de funcionamiento y directrices de seguridad de la suite de respaldos. Se eliminó físicamente el archivo `diagrama_flujo_global.md` por redundancia y para mantener el foco documental en la arquitectura física de las aplicaciones del negocio, actualizando el mapa de documentación semántico [`mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md).
* **Archivos Modificados/Eliminados:**
  - [`D:/PROTOTIPE/backup.bat`](file:///d:/PROTOTIPE/backup.bat) [MODIFY]
  - [`D:/PROTOTIPE/menu_backup.ps1`](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY]
  - [`D:/PROTOTIPE/git_backup.ps1`](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [`D:/PROTOTIPE/subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/.gitignore`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.gitignore) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/01_Control_Versiones/arquitectura_git.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/01_Control_Versiones/arquitectura_git.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/diagrama_flujo_global.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/diagrama_flujo_global.md) [DELETE]
* **Verificación:** Ejecución aislada simulada con éxito. Mensajes de depuración agregados al archivo batch. Comando de restauración de carpetas .git ejecutado exitosamente. Reglas del .gitignore añadidas y verificadas. Lógica de commits contextuales testeada con éxito. Lógica de aborto de merge por conflicto e interceptor de archivos .env implementados y validados. Pruebas de conectividad y guardado offline integradas. Documentación de arquitectura Git integrada y diagrama de flujo global purgado con éxito.









### [2026-06-09] - Limpieza y Centralización de Documentación en App Ventas

* **Tipo:** Reestructuración / Documentación
* **Descripción de Cambios:**
  1. **Migración Local:** Se movieron `Colecciones/colecciones.md`, `tareas pendientes/plan_implementacion_ia.md`, `flujos_aplicacion.md` y `mapa_arquitectura.md` a la carpeta unificada `Documentacion App Ventas` bajo los nombres `esquema_colecciones.md`, `plan_implementacion_ia.md`, `flujos_aplicacion.md` y `mapa_arquitectura.md` respectivamente.
  2. **Regeneración de Mapa IA:** Se ejecutó `generate_ia_map.js` para compilar un mapa de código `mapa_arquitectura_ia.md` limpio y con las rutas absolutas del workspace correctas directamente en `Documentacion App Ventas`.
  3. **Unificación de Migración:** Se creó el manual central [`manual_migracion_despliegue.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/manual_migracion_despliegue.md) unificando los pasos generales de configuración de Firebase, y se dejó una nota mínima de Vertex AI en `Documentacion App Ventas/manual_migracion.md`.
  4. **Purga de Legacy:** Se eliminó la carpeta obsoleta `instrucciones` (que contenía `Entrega_Final.md`) y se borraron las carpetas vacías redundantes (`Colecciones`, `instrucciones de migración`, `tareas pendientes`) y archivos sueltos de la raíz de App Ventas.
  5. **Indexación:** Actualizados los mapas semánticos de la aplicación y la documentación para reflejar las nuevas rutas absolutas locales.
* **Archivos Creados/Modificados/Eliminados:**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/manual_migracion_despliegue.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/manual_migracion_despliegue.md) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/Documentacion App Ventas/esquema_colecciones.md`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/esquema_colecciones.md) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/Documentacion App Ventas/plan_implementacion_ia.md`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/plan_implementacion_ia.md) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/Documentacion App Ventas/manual_migracion.md`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/manual_migracion.md) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/Documentacion App Ventas/flujos_aplicacion.md`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/flujos_aplicacion.md) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/Documentacion App Ventas/mapa_arquitectura.md`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/mapa_arquitectura.md) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/Documentacion App Ventas/mapa_arquitectura_ia.md`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/mapa_arquitectura_ia.md) [NEW]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
* **Verificación:** Carpetas físicas purgadas en disco. Enlaces y referencias en mapas actualizadas. Mapa IA autogenerado con éxito.

### [2026-06-09] - Depuración de Roadmap (Remoción de Tarea 305)
* **Tipo:** Documentación / Backlog
* **Descripción de Cambios:**
  1. **Roadmap Depurado:** Se eliminó la `Tarea 305: Estandarización de Pasarelas de Pago Dinámicas` del backlog activo por instrucción directa del usuario.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
* **Verificación:** Archivo editado y depurado físicamente.

### [2026-06-09] - Actualización del Diagrama de Flujo Global
* **Tipo:** Documentación / Consistencia
* **Descripción de Cambios:**
  1. **Diagrama de Flujo Global:** Actualizado `diagrama_flujo_global.md` para incorporar visualmente la inicialización local del directorio de documentación (`Documentacion [ProjectName]`) en el proceso de aprovisionamiento, y la regla de exclusión de sincronización en `sync_clients.js` y `sync_templates.js`.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/diagrama_flujo_global.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/diagrama_flujo_global.md) [MODIFY]
* **Verificación:** Visualización en Mermaid y sintaxis de flujo corregidas.

### [2026-06-09] - Blindaje de Sincronizadores ante Carpetas de Documentación
* **Tipo:** DevOps / Robustez / CLI
* **Descripción de Cambios:**
  1. **Exclusiones en Downstream Patching:** Modificado `sync_clients.js` para ignorar y excluir de manera recursiva cualquier directorio que empiece por `Documentacion ` durante el análisis y parcheo a las instancias de clientes, evitando la duplicación o sobreescritura de bitácoras del cliente.
  2. **Exclusiones en Upstream Syncing:** Modificado `sync_templates.js` para aplicar el mismo patrón de exclusión recursivo a las carpetas `Documentacion ` al actualizar y empaquetar plantillas core desde el fuente de desarrollo.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/sync_clients.js`](file:///D:/PROTOTIPE/Prototipe-CLI/sync_clients.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/sync_templates.js`](file:///D:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY]
* **Verificación:** Lógica integrada y validada con scripts del CLI.

### [2026-06-09] - Automatización de Carpetas de Documentación y Reglas de Jerarquía IA
* **Tipo:** Feature / DevOps / CLI / Reglas
* **Descripción de Cambios:**
  1. **Motor de Aprovisionamiento:** Modificado `generator.js` para detectar, renombrar e inicializar automáticamente la carpeta de documentación interna `Documentacion [Nombre_Proyecto]` (con `bitacora_cambios.md`, `tareas_pendientes.md` y `mapa_aplicacion.md` personalizados) al aprovisionar nuevas instancias de clientes.
  2. **Reglas del Sistema (GEMINI.md):** Añadido estándar de jerarquía de almacenamiento a nivel del ecosistema para obligar a cualquier IA a documentar cambios de cores en sus carpetas internas correspondientes (`Plantillas Core` o `Instancias Clientes`) y sincronizado en todos los destinos.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
* **Verificación:** Sincronizador de reglas ejecutado correctamente y lógica de generator.js integrada.

### [2026-06-09] - Creación de Documentación Interna para la Plantilla Core App Ventas
* **Tipo:** Estructura / Documentación
* **Descripción de Cambios:**
  1. **Documentación Interna de Plantilla:** Creado el directorio `D:\PROTOTIPE\Plantillas Core\App Ventas\Documentacion App Ventas` conteniendo `tareas_pendientes.md`, `bitacora_cambios.md` y `mapa_aplicacion.md` de forma interna dentro de la carpeta del core.
  2. **Indexación:** Registrados los nuevos accesos directos en el mapa de documentación global `mapa_documentacion_ia.md`.
* **Archivos Creados/Modificados:**
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/Documentacion App Ventas/tareas_pendientes.md`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/tareas_pendientes.md) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/Documentacion App Ventas/bitacora_cambios.md`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/bitacora_cambios.md) [NEW]
  - [`D:/PROTOTIPE/Plantillas Core/App Ventas/Documentacion App Ventas/mapa_aplicacion.md`](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/mapa_aplicacion.md) [NEW]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
* **Verificación:** Directorio interno estructurado y validado.

### [2026-06-09] - Reubicación de Documentación Core de dev-dashboard y Reenumeración de Carpetas
* **Tipo:** Reestructuración / Documentación
* **Descripción de Cambios:**
  1. **Reubicación de dev-dashboard:** Movida la documentación de la Consola Central (bitácora, tareas y mapa) desde `08_Instancias_Clientes/dev-dashboard` a su carpeta destino definitiva en `D:\PROTOTIPE\Central PROTOTIPE\Documentacion dev-dashboard`.
  2. **Remoción de Carpeta de Instancias:** Eliminada la carpeta `08_Instancias_Clientes` ya que las instancias de clientes residen en `D:\PROTOTIPE\Instancias Clientes`.
  3. **Reenumeración:** Reenumeradas las carpetas de documentación: `09_Plan_Escalabilidad_Negocio` pasa a ser `08_Plan_Escalabilidad_Negocio` y `10_Modulos_Completos` pasa a ser `09_Modulos_Completos`.
  4. **Actualización de Enlaces:** Corregidas las referencias relativas, absolutas y de reglas IA (`GEMINI.md`) a las nuevas rutas. Sincronizadas las reglas del sistema.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/resumen_ejecutivo_proyecto.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/resumen_ejecutivo_proyecto.md) [MODIFY]
* **Verificación:** Rutas físicas actualizadas y validadas con build y script de sincronización.

### [2026-06-09] - Limpieza de Documentación de Pruebas y Renombrado a 08_Instancias_Clientes
* **Tipo:** Reestructuración / Documentación
* **Descripción de Cambios:**
  1. **Remoción de Pruebas:** Eliminadas carpetas y referencias a clientes de prueba `Moni` y `verdurasjuan` en `mapa_documentacion_ia.md`, `mapa_aplicacion.md` y `onboarding_clientes_roadmap.md`.
  2. **Renombrado de Directorio:** Renombrado el directorio `08_Proyectos_Clientes` a `08_Instancias_Clientes` bajo `Documentacion PROTOTIPE`.
  3. **Actualización de Rutas:** Corregidas las referencias relativas y absolutas a la carpeta `08_Instancias_Clientes` en `mapa_documentacion_ia.md`, `resumen_ejecutivo_proyecto.md` y en las reglas de la IA (`GEMINI.md`).
  4. **Sincronización:** Ejecutada la sincronización de las reglas `GEMINI.md` a todos los destinos y plantillas.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/09_Plan_Escalabilidad_Negocio/onboarding_clientes_roadmap.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Plan_Escalabilidad_Negocio/onboarding_clientes_roadmap.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/09_Plan_Escalabilidad_Negocio/resumen_ejecutivo_proyecto.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Plan_Escalabilidad_Negocio/resumen_ejecutivo_proyecto.md) [MODIFY]
* **Verificación:** Script de sincronización ejecutado y completado exitosamente.

### [2026-06-09] - Fix: Remoción de Bypass de Sandbox Forzado en dev-dashboard
* **Tipo:** Bugfix / UI / Firebase / Consola Central
* **Descripción de Cambios:**
  1. **Remoción de Bypass:** Eliminada la línea `return null; // FORCE SIMULATED BYPASS FOR TESTING` dentro de `getCentralApp` en `App.jsx` de `dev-dashboard` que bloqueaba de forma permanente la conexión real a Firebase Central e impedía desactivar el modo sandbox.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilación de producción aprobada (`npm run build` en 751ms).

### [2026-06-09] - Implementación del Sincronizador de Clientes (Tarea 304)
* **Tipo:** Feature / DevOps / CLI / Robustez
* **Descripción de Cambios:**
  1. **Herramienta CLI:** Creado `sync_clients.js` para propagar cambios de core desde las plantillas a las instancias en `D:\PROTOTIPE\Instancias Clientes\*`.
  2. **Metadatos del Proyecto:** Modificado `generator.js` para generar el archivo de metadatos `.prototipe.json` con ID, nombre, template y versión al crear proyectos.
  3. **Comando de Sincronización:** Añadido el script `"sync:clients"` en `package.json` de Prototipe-CLI.
  4. **Seguridad y Resiliencia:** El sincronizador implementa exclusión de configuraciones específicas de cliente, copias de seguridad temporales (backups) automáticas, validación de integridad (`npm run build`) en la instancia del cliente post-copia, y reversión automática (*rollback*) si falla el build.
* **Archivos Creados/Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/sync_clients.js`](file:///D:/PROTOTIPE/Prototipe-CLI/sync_clients.js) [NEW]
  - [`D:/PROTOTIPE/Prototipe-CLI/package.json`](file:///D:/PROTOTIPE/Prototipe-CLI/package.json) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
* **Verificación:** Sintaxis validada con ejecución limpia (`No se encontraron instancias...`).

### [2026-06-09] - Corrección de Ruta Fuente de Plantilla ventas en Registro Central (Tarea 303)
* **Tipo:** Configuración / DevOps / CLI
* **Descripción de Cambios:**
  1. **Actualización del Registro:** Modificado `plantillas_registro.json` para actualizar la ruta de la fuente (`fuente`) de `ventas` desde `D:/Aplicaciones/App Ventas` a la ruta estandarizada `D:/PROTOTIPE/Plantillas Core/App Ventas`, alineándolo con la reestructuración física de cores.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json`](file:///D:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json) [MODIFY]
* **Verificación:** Rutas verificadas en disco y mapeo del CLI correcto.

### [2026-06-09] - Carpeta dedicada para Shards de Clientes (Instancias Clientes)
* **Tipo:** Reestructuración / Configuración / CLI / Dashboard
* **Descripción de Cambios:**
  1. **Directorio dedicado:** Creada físicamente la carpeta `D:\PROTOTIPE\Instancias Clientes` para albergar todos los proyectos de clientes creados por el CLI, evitando que queden en la raíz del ecosistema.
  2. **Configuración del CLI:** Modificada la variable `APPLICATIONS_DIR` en `config.js` y `PROTOTIPE_WORKSPACE_ROOT` en el archivo `.env` del CLI para apuntar por defecto a `D:\PROTOTIPE\Instancias Clientes`.
  3. **Actualización de Consola Central:** Modificada la función `handleClientNameChange` y el placeholder en `App.jsx` de `dev-dashboard` para inyectar y sugerir por defecto la ruta `D:\PROTOTIPE\Instancias Clientes\App-[slug]`.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/config.js`](file:///D:/PROTOTIPE/Prototipe-CLI/config.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/.env`](file:///D:/PROTOTIPE/Prototipe-CLI/.env) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Verificación:** Compilación del dashboard completada con éxito. Directorio creado físicamente en el disco.

### [2026-06-09] - Corrección de Estructura de Rutas y Conservación de Ruta Core de Ventas
* **Tipo:** Refactorización / Arquitectura / Consistencia / DevOps
* **Descripción de Cambios:**
  1. **Corrección de Rutas Cores:** Se restauró la ruta base del core de ventas a `D:\Aplicaciones\App Ventas` en todos los archivos de configuración y scripts, debido a que el usuario no ha migrado físicamente esta carpeta todavía. Se mantuvieron las rutas migradas correctas para los cores de Servicios, Agendamiento y Gastronomía en `D:\PROTOTIPE\Plantillas Core\App [Nombre]`.
  2. **Actualización de Plantillas de Clientes (Shards):** Ajustadas todas las referencias de aprovisionamiento de shards de clientes a la raíz de `D:\PROTOTIPE\App-[slug]` (ejemplo `D:\PROTOTIPE\App-ventas-smartfix`), corrigiendo la inyección del CLI y el Wizard del dashboard.
  3. **Propagación de Reglas de IA:** Ejecutado el script `sync_rules.js` para propagar las nuevas configuraciones y directivas de comportamiento a todos los proyectos del ecosistema.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/GEMINI.md`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/GEMINI.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`D:/Aplicaciones/App Ventas/GEMINI.md`](file:///D:/Aplicaciones/App%20Ventas/GEMINI.md) [MODIFY]
* **Verificación:** Compilación de producción de `dev-dashboard` completada con éxito en 725ms. Ejecución exitosa de `sync_rules.js`.

### [2026-06-09] - Modularización del Panel E2E e Integración Dinámica de Playwright en Nuevas Marcas (Tarea 300 Rev.6 y Tarea 301 Rev.3)
* **Tipo:** Refactorización / Arquitectura / Testing / Automatización / CLI
* **Descripción de Cambios:**
  1. **Modularización:** Se extrajo el panel de control de pruebas E2E del archivo principal de dev-dashboard [`App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY] a un componente independiente y modular [`E2EPanel.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/E2EPanel.jsx) [NEW], removiendo más de 200 líneas de código duplicado e integrando streaming de logs en tiempo real por SSE.
  2. **Propagación en Plantillas:** Copiado el archivo `playwright.config.js` y el directorio `tests/` con la suite de pruebas base a `D:\PROTOTIPE\Prototipe-CLI\templates\template-ventas\`.
  3. **Aprovisionamiento Dinámico de Testing:** Modificado [`generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY] en el paso 7.2 para que el CLI inyecte automáticamente la suite Playwright al crear nuevos shards de cliente. Configura dinámicamente el `package.json` agregando los scripts de pruebas y la dependencia `@playwright/test`. Adicionalmente, renombra y autoconfigura el archivo `tests/config/[clientId].config.js` inyectando dinámicamente la URL base y el nombre de proyecto correspondientes a la marca, y actualiza el import en `tests/checkout.spec.js` para usar la configuración recién creada en caliente.
* **Archivos Creados/Modificados:**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/E2EPanel.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/E2EPanel.jsx) [NEW]
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/playwright.config.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/playwright.config.js) [NEW]
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/tests/`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/tests/) [NEW]
* **Verificación:** Ejecución de pruebas de integración de plantillas del CLI (`npm run test` en Prototipe-CLI) resultando en éxito (`✓ PASSED` en 30.4s). Compilación de dev-dashboard completada con éxito.
* **Resultado:** Cada nueva aplicación aprovisionada por el CLI nace con una suite de pruebas Playwright 100% autoinstanciable, configurable dinámicamente y aislada por `clientId`.

### [2026-06-09] - Fix Definitivo Panel E2E: req.close Prematuro + reuseExistingServer (Tarea 300 Rev.5)
* **Tipo:** Bugfix Crítico / CLI / DevOps / Testing
* **Causa Raíz Identificada (dos causas encadenadas):**
  1. `req.on('close')` en Express se dispara **inmediatamente** cuando el browser usa `fetch() + ReadableStream` para consumir SSE, porque el browser cierra el "request side" de la conexión HTTP al recibir las cabeceras SSE. Esto mataba el proceso hijo con `SIGTERM` en 0ms antes de que Playwright llegara a iniciar. Síntoma: `código null, señal SIGTERM, duración 0.0s`.
  2. `playwright.config.js` tenía `reuseExistingServer: !process.env.CI`. El servidor inyectaba `CI=1` en el env del proceso hijo, forzando `reuseExistingServer: false`. Con el dev server de App Ventas ya corriendo en `localhost:5173`, Playwright intentaba levantar uno nuevo → `Error: http://localhost:5173 is already used`. Síntoma: `código 1, duración 1.6s`.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — Reescrito endpoint `/api/e2e/run`: (1) Eliminado el kill inmediato en `req.on('close')`. (2) Añadido flag `testFinished` para que el timeout de seguridad (120s) solo dispare si el proceso aún no terminó. (3) `res.write` protegido con guard `!res.writableEnded`. (4) Spawn ahora usa `stdio: ['ignore', 'pipe', 'pipe']` y pasa la señal al listener `close` para diagnóstico diferenciado. (5) Log de PID del proceso hijo para trazabilidad.
  - [`D:/Aplicaciones/App Ventas/playwright.config.js`](file:///D:/PROTOTIPE/App%20Ventas/playwright.config.js) [MODIFY] — `reuseExistingServer: true` (siempre) en lugar de `!process.env.CI`. Timeout del webServer aumentado de 10s a 30s.
* **Verificación:** CLI Bridge log: `✅ Tests pasaron en 18.8s`. Terminal del dashboard: `ok 1 [chromium] › checkout.spec.js › Flujo de compra completo (14.6s) — 1 passed (17.2s)`. Banner PASS visible en UI.
* **Resultado:** Panel E2E del dev-dashboard 100% funcional. Playwright corre end-to-end vía CLI Bridge con logs en tiempo real y resultado PASS/FAIL correcto.


### [2026-06-09] - Evolución Incremental CLI P3, P4, P5: Robustez Firebase, Sanitización Plantillas y Encapsulación (Tarea 301 Rev.2)
* **Tipo:** Robustez / Seguridad / Automatización / CLI
* **Archivos Creados/Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — Implementada sanitización estricta de `appDisplayName` y `safeProjectId` (remoción de caracteres no permitidos en IDs de Firebase). Implementado clasificador de errores de Firebase CLI (`classifyFirebaseError`) que mapea excepciones conocidas (credenciales, cuotas, permisos, red) para dar feedback claro en el log. Corregido el acceso a `stderr` en el catch de `execAsync`.
  - [`D:/PROTOTIPE/Prototipe-CLI/sync_templates.js`](file:///D:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY] — Implementada sanitización dinámica de tokens al sincronizar plantillas. Se leen en caliente el `.env.local` y `package.json` de la fuente para extraer `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_MEASUREMENT_ID` y `name`, aplicando reemplazos robustos basados en expresiones regulares dinámicas.
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY] — Encapsulación interna de los pasos críticos de aprovisionamiento 9, 10, 11 y 12 en funciones privadas (`installDependencies`, `setupGitHub`, `deployFirebase`, `registerInCentralConsole`) para mejorar la legibilidad y aislamiento de errores no críticos, manteniendo intacta la firma pública y comportamiento de `createProject()`.
* **Verificación:** Ejecución exitosa de `sync_templates.js` con log dinámico de tokens. Módulos de generator resuelven limpiamente.
* **Resultado:** Reducción drástica de fallos silenciosos por nombres de proyectos inválidos en Firebase. Automatización y portabilidad total de tokens de configuración. Generator.js limpio y fácil de mantener.

### [2026-06-09] - Evolución Incremental CLI P2: Desbloqueo Event Loop Express (Tarea 301 Rev.1)
* **Tipo:** Arquitectura / Performance / Robustez / CLI
* **Archivos Creados/Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js`](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [NEW] — Worker ESM independiente. Protocolo IPC: recibe `{ type:'START', answers }` del padre, ejecuta `createProject(answers)` y retorna `{ type:'SUCCESS', data }` o `{ type:'ERROR', message }`. Guard de ejecución directa + cierre limpio en `disconnect`. El ESM guard `if (!process.send)` previene ejecución accidental fuera de `fork()`.
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — Eliminado `import createProject`. Agregado `fork` al import de `child_process`. Nuevo `WORKER_PATH` y `WORKER_TIMEOUT_MS` (10 min). Endpoint `/api/create-project` ahora llama `runCreateProjectWorker(answers)` que encapsula el ciclo `fork() → IPC → Promise`. Timeout `setTimeout` con `SIGTERM` al worker si supera el límite. Lógica de expansión cognitiva Gemini separada en su propio try/catch no-fatal para que un fallo de red en la API no aborte el aprovisionamiento.
* **Verificación:** `node --eval "import './server.js'"` → `EADDRINUSE` (puerto ocupado, imports válidos). Worker → guard de seguridad dispara correctamente fuera de fork.
* **Resultado:** El Event Loop de Express permanece libre durante aprovisionamientos largos. El servidor puede seguir respondiendo `/api/templates`, `/api/library` y cualquier otro endpoint mientras un proyecto se crea en background.

### [2026-06-09] - Evolución Incremental CLI P0+P1: Config Centralizada + Eliminación de Rutas Hardcodeadas (Tarea 301)

* **Tipo:** Refactorización / Arquitectura / Portabilidad / Robustez / CLI
* **Archivos Creados/Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/config.js`](file:///D:/PROTOTIPE/Prototipe-CLI/config.js) [NEW] — Módulo de configuración central. Carga el `.env` local, expone `getWorkspaceRoot()`, `getDocumentationRoot()`, `getTemplatesDir()`, `getRegistroPath()` y `validateRegistroSchema()`. Soporta override por variables de entorno `PROTOTIPE_WORKSPACE_ROOT` y `PROTOTIPE_DOCS_ROOT`. Fallback conservador a `D:\Aplicaciones` para compatibilidad total.
  - [`D:/PROTOTIPE/Prototipe-CLI/logger.js`](file:///D:/PROTOTIPE/Prototipe-CLI/logger.js) [NEW] — Logger estructurado con niveles `info/success/warn/error`. Escribe en `cli_bridge.log` con timestamp ISO y en consola con colores `picocolors`.
  - [`D:/PROTOTIPE/Prototipe-CLI/cli.js`](file:///D:/PROTOTIPE/Prototipe-CLI/cli.js) [MODIFY] — Importa `getWorkspaceRoot()` de `config.js`. Elimina carga manual de `.env` y uso de `D:\Aplicaciones` hardcodeado para `targetPath`.
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY] — Importa `getWorkspaceRoot()`. Reemplaza rutas absolutas en: rutas de GEMINI.md (`backupGeminiPath`), fallback de limpieza del contenido GEMINI (regex genérica agnóstica de unidad/path) y prompt de Antigravity (7 links file:// a docs de proyecto).
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — Importa `getWorkspaceRoot()` y `getDocumentationRoot()` de `config.js`. Elimina carga manual de `.env`. Reemplaza rutas absolutas en: `getLibraryReadmeText()`, prompt de Gemini AI, `/api/library`, `/api/library/file` (baseDocDir), `/api/project/file` (baseAppsDir + fallbacks de proyectos conocidos convertidos a tabla de mapeo dinámica), `/api/e2e/projects` (BASE_DIR). Corrige import `logger` de default a named export.
* **Verificación:** `node --input-type=module --eval "import './server.js'"` → `EADDRINUSE` (servidor ya corriendo) — imports 100% válidos, sin errores de resolución de módulos.
* **Resultado:** El CLI es ahora portátil a cualquier unidad/path configurando `PROTOTIPE_WORKSPACE_ROOT` en `.env`. Cero rutas `D:\Aplicaciones` hardcodeadas fuera de `config.js`.

### [2026-06-09] - Bugfix: Ejecución robusta de procesos E2E en Windows
* **Tipo:** Bugfix / CLI / DevOps
* **Causa Raíz:** En Windows, el comando de Playwright (`npm run test:ci`) fallaba al iniciarse mediante `spawn` con `shell: false` y envoltura de `cmd /c` debido a la presencia de espacios en la ruta física (`D:\Aplicaciones\App Ventas`), provocando que el proceso finalizara prematuramente con código `null` sin emitir logs de depuración o de error.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — Refactorizada la llamada a `spawn` para usar `shell: true` invocando a `npm` directamente. Añadido el listener del evento `'error'` para capturar y notificar fallos de arranque en el stream SSE.
* **Resultado:** Ejecución estable y transparente del runner de tests de Playwright en Windows sobre rutas con espacios.

### [2026-06-09] - Carga Dinámica de Proyectos en Panel E2E (Tarea 300 Rev.4)
* **Tipo:** Feature / UI / Integración / Automatización
* **Causa Raíz:** El listado de proyectos (`E2E_PROJECTS`) en la pestaña "Tests E2E" estaba hardcodeado, forzando al desarrollador a modificar el código fuente del dashboard de forma manual al aprovisionar o registrar un nuevo cliente.
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY] — Eliminado el array estático `E2E_PROJECTS`. Reemplazado por estados reactivos dinámicos (`e2eProjects` y `e2eProjectsLoading`). Añadido `useEffect` que consulta el endpoint `/api/e2e/projects` del CLI Bridge local al entrar en la pestaña. Adaptado el dropdown custom premium para visualizar estados de carga ("Cargando..."), deshabilitarse ante listas vacías y mapear dinámicamente los elementos. Añadida resiliencia para resguardar la carga del último reporte y ejecución de tests cuando no hay proyectos activos.
* **Resultado:** Build Vite exitoso (`built in 1.03s`). Cero configuración manual requerida al añadir clientes con configuraciones Playwright.


### [2026-06-09] - Bugfix: Telemetría en errores de Firestore + campo ocultoCliente
* **Tipo:** Bugfix / Observabilidad / Consistencia de Datos
* **Causa Raíz:** Dos problemas simultáneos:
  1. Los `catch` de "vaciar historial" y los callbacks de error de `onSnapshot` hacían solo `console.error`, silenciando el error ante la telemetría central. El desarrollador dependía de la consola del navegador para enterarse.
  2. `clearClientOrderHistory` escribía el campo `clienteOculto: true` pero el componente `ClientOrders.jsx` filtraba por `ocultoCliente`. Mismatch de nomenclatura → la función "Archivar historial" nunca ocultaba nada.
* **Archivos Modificados:**
  - [`ClientOrders.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/pages/client/ClientOrders.jsx) — Importado `reportAppFailureToDeveloper`; conectado en ambos `catch` de vaciar historial (normal y especiales).
  - [`orderService.js`](file:///D:/PROTOTIPE/App%20Ventas/src/services/orderService.js) — Importado `reportAppFailureToDeveloper`; agregado en error callbacks de `subscribeToOrders` y `subscribeToClientOrders`; corregido campo `clienteOculto → ocultoCliente` en `clearClientOrderHistory`.
* **Resultado:** Los errores de Firestore se reportan automáticamente a la consola central. La función "Archivar historial" ahora oculta correctamente los pedidos completados/cancelados.

### [2026-06-09] - Panel E2E integrado en dev-dashboard (Tarea 300 Rev.3)
* **Tipo:** Feature / UI / Integración / DevOps
* **Archivos Modificados:**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY] — Nuevo tab "Tests E2E" en el sidebar con: selector de proyecto (`E2E_PROJECTS`), botón "Ejecutar Tests" que conecta al CLI Bridge via SSE (`/api/e2e/run`) y renderiza logs en tiempo real con colores semánticos (verde=pass, rojo=fail, naranja=warning), banner de resultado PASS/FAIL persistente, y carga automática del último resultado al entrar al tab (`/api/e2e/last-result`).
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — Corrección de ubicación del `import { spawn }` (movido al bloque de imports del inicio).
* **Resultado:** Build exitoso `1.12s`. El usuario puede lanzar y monitorear los tests E2E de cualquier proyecto directamente desde el dashboard, sin terminal.

### [2026-06-09] - Automatización E2E Multi-Trigger (Tarea 300 Rev.2)
* **Tipo:** Testing / Automatización / DevOps / Git Hooks
* **Archivos Creados/Modificados:**
  - [`D:/Aplicaciones/App Ventas/.git/hooks/pre-push`](file:///D:/PROTOTIPE/App%20Ventas/.git/hooks/pre-push) [NEW] — Hook git que ejecuta `npm run test:ci` antes de cada `git push`. Si los tests fallan, el push queda bloqueado. Admite bypass de emergencia con `--no-verify`.
  - [`D:/Aplicaciones/App Ventas/run-e2e.ps1`](file:///D:/PROTOTIPE/App%20Ventas/run-e2e.ps1) [NEW] — Script PowerShell con 3 modos: headless/CI (defecto), `-Headed` (debug visual), `-Watch` (FileSystemWatcher que re-ejecuta tests al detectar cambios en `tests/`).
  - [`D:/Aplicaciones/App Ventas/package.json`](file:///D:/PROTOTIPE/App%20Ventas/package.json) [MODIFY] — Agregados scripts `test:ci` (headless con reporter=list, óptimo para pipelines) y `ci` (build + test:ci encadenados).
* **Resultado:** `npm run test:ci` verificado: `1 passed (12.1s)`. Pipeline completo: git push → pre-push hook → E2E headless → autoriza o bloquea el push.

### [2026-06-09] - Refactorización E2E a Arquitectura Escalable Multi-Cliente (Tarea 300 Rev.1)
* **Tipo:** Testing / Automatización / Arquitectura / Escalabilidad
* **Archivos Creados/Modificados:**
  - [`D:/Aplicaciones/App Ventas/tests/config/app-ventas.config.js`](file:///D:/PROTOTIPE/App%20Ventas/tests/config/app-ventas.config.js) [NEW] — Objeto `APP_CONFIG` que describe el contrato de comportamiento de la instancia App Ventas: textos de UI, selectores, credenciales de prueba, pasos activos del checkout y patrones de URL. Es el único archivo que cambia al testear un cliente diferente.
  - [`D:/Aplicaciones/App Ventas/tests/helpers/checkout.helpers.js`](file:///D:/PROTOTIPE/App%20Ventas/tests/helpers/checkout.helpers.js) [NEW] — 5 funciones helper genéricas (`passWelcomePage`, `loginAsClient`, `selectProductFromCatalog`, `triggerBuyNow`, `completeCheckout`) que encapsulan cada paso del flujo E2E y se parametrizan con `APP_CONFIG`. Reutilizables entre cualquier cliente del ecosistema sin modificación.
  - [`D:/Aplicaciones/App Ventas/tests/checkout.spec.js`](file:///D:/PROTOTIPE/App%20Ventas/tests/checkout.spec.js) [MODIFY] — Reducido a ~15 líneas que describen el flujo de negocio importando helpers y config. El spec no contiene lógica de UI; delega 100% en los helpers.
* **Resultado:** Test 1 passed (18.4s). Para testear una nueva instancia cliente solo se requiere crear 1 archivo `config/<cliente>.config.js` y cambiar 1 línea de import en el spec. Zero duplicación de lógica.

### [2026-06-08] - Visor de Código en Vivo en Diagnóstico de Incidentes (Tarea 299)
* **Tipo:** Nueva Feature / UI / Diagnóstico / Telemetría / CLI
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — Diseñado e implementado el endpoint `/api/project/file` en el CLI Bridge Server local. Resuelve de forma dinámica la ruta física de un proyecto local a partir de su `clientId` mediante escaneo de directorios con `package.json` y mapeo por patrones conocidos, normaliza la ruta y aplica un bloqueo estricto contra Directory Traversal antes de retornar el archivo.
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY] — Integrados estados de React (`codeSnippet`, `loadingCode`, `codeError`) y un hook reactivo `useEffect` que detecta la selección de incidentes de telemetría. Consulta asíncronamente el endpoint local del CLI y renderiza en el modal un editor/visor de código de estética monospace con numeración de líneas y resaltado de la línea exacta en color rojo translúcido (`bg-red-500/15`).
* **Resultado:** Diagnóstico de incidentes interactivo en tiempo real con visor de código en vivo. Compilación Vite exitosa (`built in 842ms`).

### [2026-06-08] - Suite de Pruebas E2E de Flujo de Checkout con Playwright (Tarea 300)
* **Tipo:** Testing / Automatización / CI-CD / Calidad
* **Archivos Creados/Modificados:**
  - [`D:/Aplicaciones/App Ventas/playwright.config.js`](file:///D:/PROTOTIPE/App%20Ventas/playwright.config.js) [NEW] — Configuración central de Playwright. Configura el servidor de desarrollo en background (`reuseExistingServer`), Chromium como navegador por defecto, reportes interactivos HTML y grabaciones/pantallazos automáticos ante fallos.
  - [`D:/Aplicaciones/App Ventas/tests/checkout.spec.js`](file:///D:/PROTOTIPE/App%20Ventas/tests/checkout.spec.js) [NEW] — Test de regresión del flujo completo de compra: Splash bienvenida -> Login cliente express con celular aleatorio -> Navegación al catálogo -> Selección del primer producto -> Selección robusta de variantes de color y talla mediante selectores DOM estructurales (`h3:has-text("Color") + div button`) -> Checkout directo de un clic -> Flujo paso a paso del CheckoutModal (Método entrega retiro -> Datos de contacto -> Pago efectivo -> Resumen del pedido) -> Pantalla de pedido exitoso.
  - [`D:/Aplicaciones/App Ventas/package.json`](file:///D:/PROTOTIPE/App%20Ventas/package.json) [MODIFY] — Adición de scripts `test:ui` y `test:ui:show` para facilitar la ejecución local y en pipelines de integración continua.
* **Resultado:** El flujo de compra queda 100% blindado contra futuras regresiones lógicas al portar o actualizar plantillas. Suite ejecutada con éxito en local: `1 passed (14.9s)`.

### [2026-06-08] - Optimización de Sesiones y Resiliencia en Notificaciones Core (Tarea 298)
* **Tipo:** Bugfix / UX / Rendimiento / Notificaciones
* **Archivos Modificados:**
  - [`D:/Aplicaciones/App Ventas/src/hooks/useAuthInit.js`](file:///D:/PROTOTIPE/App%20Ventas/src/hooks/useAuthInit.js) [MODIFY] — Eliminado el delay artificial `setTimeout` de 200ms de `onAuthStateChanged`. Esto asegura que los guards de ruta de administrador resuelvan inmediatamente al cargar la página, erradicando parpadeos y redirecciones erróneas al login.
  - [`D:/Aplicaciones/App Ventas/src/hooks/useNotificationCenter.js`](file:///D:/PROTOTIPE/App%20Ventas/src/hooks/useNotificationCenter.js) [MODIFY] — Reubicada la lógica de limpieza y reset de notificaciones (`setNotifications([])` y refs de deduplicación) al inicio del `useEffect` de la suscripción, antes de los retornos tempranos. Previene fugas de datos y retención de notificaciones visibles de un usuario anterior si se cierra sesión y el Layout permanece en memoria.
* **Resultado:** Redirecciones limpias en `/admin`, resiliencia de datos al cerrar sesión. Build de producción exitoso `✓ built in 1.34s`.

### [2026-06-08] - Corrección Ráfaga de Toasts al Cargar Perfil Admin/Cliente (Tarea 297)
* **Tipo:** Bugfix / UX / Notificaciones
* **Archivos Modificados:**
  - [`D:/Aplicaciones/App Ventas/src/layouts/AdminLayout.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY] — Introducido `toastReadyRef` (guard de inicialización) e `isBellAttentive` (estado de animación). El `useEffect` de toasts ahora silencia el primer snapshot de Firestore en lugar de disparar toasts para todas las notificaciones pre-existentes. Al detectar no leídas en la carga inicial, anima la campana con una secuencia doble de oscilación + escala (2.8s) y un glow de color `primary` en el botón para incitar a abrirla. A partir de la segunda actualización del listener (notificaciones genuinamente nuevas), los toasts funcionan normalmente. El badge del contador cambia a `animate-bounce` durante el estado attentive.
  - [`D:/Aplicaciones/App Ventas/src/layouts/ClientLayout.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY] — Misma lógica aplicada en el layout de cliente para el header móvil y el sidebar desktop.
* **Causa Raíz:** El `useEffect` observaba el array `notifications` desde cero. En el primer render, todas las notificaciones con `status === 'unread'` ya existentes en Firestore eran inyectadas inmediatamente como toasts, produciendo una ráfaga visual no deseada.
* **Resultado:** Al entrar al perfil admin o cliente, cero toasts en el arranque. La campana ejecuta una secuencia premium de llamada de atención. Build ✓ 939ms.

### [2026-06-08] - Corrección de `removeChild` en Portal de ModalTemplate (Tarea 296)
* **Tipo:** Bugfix Crítico / React DOM / Portales / Resiliencia
* **Archivos Modificados:**
  - [`D:/Aplicaciones/App Ventas/src/components/common/ModalTemplate.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/components/common/ModalTemplate.jsx) [MODIFY] — Reemplazada la llamada directa `ReactDOM.createPortal(modalDOM, document.body)` por un patrón de portal con `div` dedicado creado mediante `useEffect` + `useRef` + `useState(mounted)`. El nodo del portal se crea en el `useEffect` inicial y se destruye de forma segura con `document.body.contains(el)` en el cleanup, garantizando que React opere sobre su propio nodo aislado y nunca interfiera con el DOM de `body`.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/common/ModalTemplate.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/common/ModalTemplate.jsx) [MODIFY] — Sincronizado el mismo fix en la plantilla CLI para que todos los proyectos futuros nazcan inmunes a este bug.
* **Causa Raíz del Bug:** `ReactDOM.createPortal(content, document.body)` monta el portal directamente sobre `document.body`, que es un nodo compartido entre todos los portales y el árbol React principal. Cuando React desmonta un componente padre que contiene un `ModalTemplate`, el reconciliador intenta llamar a `removeChild` sobre `document.body` para eliminar el nodo del portal — pero si otro render o ciclo de vida ya ha movido o reemplazado ese nodo en el DOM real, el `removeChild` falla con `NotFoundError`. Esto se agrava con Framer Motion's `AnimatePresence` que mantiene elementos en el DOM durante la animación de salida.
* **Solución Técnica:** Cada instancia de `ModalTemplate` crea su propio `<div data-modal-portal>` exclusivo al montar (`useEffect` inicial), lo appenda a `document.body`, y lo remueve en el cleanup usando `document.body.contains(el)` para evitar dobles remociones. El portal siempre apunta a su propio nodo aislado → cero interferencias con otros portales o con el árbol principal.
* **Resultado:** Error `NotFoundError: removeChild` eliminado. Build `✓ 1.60s`. Fix propagado a plantilla CLI.

### [2026-06-08] - Parseo Robusto de Ruta y Línea en Diagnóstico de Incidentes

* **Tipo:** Corrección de Bugs / Diagnóstico / Telemetría
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY] — Refactorizada la extracción de ruta de archivo (`detectedFile`) y línea (`detectedLine`) en el Drawer de Diagnóstico de Incidentes. Se reemplazó la expresión regular básica (que fallaba y arrojaba `N/A` en stack traces sin el prefijo explícito `/src`) por una función multi-capa (`getFileAndLine`) que analiza URLs dinámicas, mapea la pila ignorando dependencias externas (`node_modules`) y autocompleta archivos sueltos como `App.jsx` al formato canónico `src/App.jsx`.
* **Resultado:** La ruta del archivo y su línea exacta de error se extraen de manera 100% precisa para cualquier stack trace generado por Vite/React.

### [2026-06-08] - Resolución de Fallo de Compilación y Activación de Mejoras en Consola de Telemetría (Tarea 295 - Corrección)
* **Tipo:** Corrección de Errores / Compilación / UI
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY] — Corregidos múltiples errores de sintaxis JSX originados por una truncación de escritura en el bloque del Dashboard. Se restauró el cierre del bucle map de comisiones (`})}`), el cierre de la consola de telemetría y el cierre del grid wrapper (`lg:grid-cols-3`), equilibrando el árbol JSX.
* **Resultado:** Compilación del proyecto `dev-dashboard` totalmente restaurada (`npm run build` aprobado en 869ms). Las mejoras premium interactivas de la terminal de telemetría y el indicador real-time Live Blink ya se encuentran plenamente operativas y desplegables.

### [2026-06-08] - Corrección de ReferenceError CLIENT_ID y Enriquecimiento de Consola de Telemetría (Tarea 295)
* **Tipo:** Corrección de Bugs / Telemetría / UI / UX
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY] — (1) Sustituida la constante inexistente `CLIENT_ID` por un fallback dinámico `(reports[0]?.clientId || 'ventas-smartfix')` en la función `handleCreateTestReport` de creación de reportes de prueba. (2) Modificado el Drawer lateral de diagnóstico para renderizar dinámicamente bloques de "Entorno de Ejecución" y "Usuario Sesión" si se encuentran presentes los campos `environment` y `user` en el documento de error de Firestore. (3) Corregido el fallo de seguridad en Firestore (`Missing or insufficient permissions`) al simular fallos de prueba, consultando dinámicamente el `token` del cliente o utilizando un fallback válido para satisfacer las reglas de seguridad. (4) Rediseñado estéticamente el panel de logs del sistema convirtiéndolo en una terminal UNIX interactiva premium con cabecera de shell script, estado en vivo animado, efectos de brillo de fondo, badges de estatus categorizados (`OK`, `INFO`, `WARN`, `FAIL`) y estructura monospace. (5) Eliminada la simulación del indicador Live Blink en la cabecera de la terminal de telemetría, en la barra lateral (Canal DB / Status) y en el modal del perfil de administrador, conectándolos de manera 100% funcional y en tiempo real al estado de red del navegador (`navigator.onLine`) y al estado de conexión de Firestore. (6) Implementado el Panel de Telemetría Centralizada Multi-Cliente (Premium Matrix) en la pestaña Ajustes. Añade una rejilla de tarjetas interactivas de clientes activos (con indicadores LED, conteo de fallos activos y reportes de cobro) y filtros avanzados en la consola UNIX (búsqueda de logs por texto, filtros rápidos por tipo `FAIL`/`BILLING`/`SYSTEM` y filtrado instantáneo al hacer clic en tarjetas o badges de clientes).
* **Causa Raíz:** En la consola de desarrollo, `CLIENT_ID` no estaba declarada ni importada, y la inyección manual de fallos de prueba carecía del campo `token` requerido de forma obligatoria por las nuevas reglas de seguridad de Firestore Central, resultando en un colapso en caliente por falta de permisos. Adicionalmente, la consola de logs del sistema lucía plana y poco interactiva, y poseía una animación de red de blinkeo simulada en vez de estar conectada dinámicamente al estado de red real.
* **Resultado:** Error de referencia y rechazo por falta de permisos de Firestore erradicados. Terminal de logs del sistema rediseñada con estética premium visualmente atractiva, indicación en vivo 100% funcional basada en el estado real de la red, y categorizaciones de log adaptables. Compilación exitosa en producción (`npm run build`).

### [2026-06-08] - Erradicación de `alert()` Nativo y Singleton de Alertas Imperativo (Tarea 294)
* **Tipo:** Refactorización / Arquitectura / UI / Marca Blanca / Robustez
* **Archivo(s) Modificado(s):**
  - [`D:/Aplicaciones/App Ventas/src/services/alertService.js`](file:///D:/PROTOTIPE/App%20Ventas/src/services/alertService.js) [NEW] — Singleton imperativo de alertas. Expone `register(showAlert, showConfirm)`, `showAlert(opts)` y `showConfirm(opts)` para disparar los modales premium del sistema desde fuera del árbol React (hooks puros, class components, servicios).
  - [`D:/Aplicaciones/App Ventas/src/components/common/AlertConfirmContext.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/components/common/AlertConfirmContext.jsx) [MODIFY] — `AlertConfirmProvider` registra sus funciones `showAlert`/`showConfirm` en el singleton `alertService` al montar mediante `useEffect`, cerrando el puente imperativo-React.
  - [`D:/Aplicaciones/App Ventas/src/hooks/usePWAInstall.js`](file:///D:/PROTOTIPE/App%20Ventas/src/hooks/usePWAInstall.js) [MODIFY] — Reemplazados 3 `alert()` nativos (instrucciones iOS, Android/Chrome y fallback de error de prompt) por `showAlert` del singleton `alertService`.
  - [`D:/Aplicaciones/App Ventas/src/components/ui/feedback/ErrorBoundaryFallback.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/components/ui/feedback/ErrorBoundaryFallback.jsx) [MODIFY] — Reemplazado el único `alert()` nativo en el método `handleReportManual` (Class Component) por `alertService.showAlert` con variante `success`.
  - [`D:/Aplicaciones/App Ventas/src/pages/admin/AdminSales.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/pages/admin/AdminSales.jsx) [MODIFY] — 2 alertas nativas migradas a `useAlertConfirm`.
  - [`D:/Aplicaciones/App Ventas/src/components/admin/inventory/AdminStockAlerts.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/components/admin/inventory/AdminStockAlerts.jsx) [MODIFY] — 1 alerta nativa migrada a `useAlertConfirm`.
  - [`D:/Aplicaciones/App Ventas/src/pages/client/ClientOrders.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/pages/client/ClientOrders.jsx) [MODIFY] — 3 alertas nativas migradas a `useAlertConfirm`.
  - [`D:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY] — 11 alertas y confirms nativos migrados a `useAlertConfirm`.
* **Causa Raíz:** El codebase contenía 17+ llamadas a `window.alert()` y `window.confirm()` nativos del navegador que rompen la consistencia visual de marca blanca, bloquean el hilo principal de forma sincrónica, no se pueden estilizar ni integrar con el sistema de diseño HSL, y son inaceptables en un producto premium multi-cliente.
* **Solución Técnica:** Patrón Singleton Imperativo. `alertService.js` actúa como canal de comunicación entre capas no-React (hooks, servicios, class components) y el contexto React (`AlertConfirmContext`). Resuelve el problema de la imposibilidad de usar hooks en class components sin introducir dependencias circulares ni prop drilling.
* **Resultado:** 0 `alert()` nativos en el proyecto. Auditoría `grep` limpia. Compilación `✓ built in 1.18s`.

### [2026-06-08] - Robustecimiento de la Telemetría de Errores y Facturación (Tarea 293)

* **Tipo:** Telemetría / Robustez / Seguridad / Offline / Resiliencia
* **Archivo(s) Modificado(s):**
  - [`D:/Aplicaciones/App Ventas/src/services/telemetryService.js`](file:///D:/PROTOTIPE/App%20Ventas/src/services/telemetryService.js) [MODIFY] — Implementado mecanismo de cola de reintentos local persistente (`localStorage`) para resiliencia offline. Enriquecido el reporte de fallos agregando la URL activa, datos del usuario de Firebase Auth (UID/Email de forma segura), resolución de pantalla, Viewport e idioma del navegador. Añadido un algoritmo anti-saturación basado en firma hash (Throttling a 60 segundos por error idéntico) para mitigar ráfagas redundantes de logs hacia Firestore Central.
* **Causa Raíz:** Robustecer el canal de telemetría de fallos del ecosistema para dar mejor contexto de reproducción al desarrollador, tolerar la pérdida temporal de internet y prevenir sobrecostos de base de datos en Firestore central por errores duplicados en bucle.
* **Resultado:** Telemetría resiliente, con datos extendidos de depuración y protegida contra duplicados. Compilación de producción validada exitosamente.

### [2026-06-08] - Selector de Recomendaciones en Asistente de Aprovisionamiento (Tarea 292)
* **Tipo:** UI / UX / Automatización / Prompt de IA / CLI Engine
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY] — Integración de estados de React (`libraryList`, `selectedRecomendations`) y creación del selector interactivo estructurado por categorías con checkboxes en la pestaña Módulos del Wizard. Envío de datos al payload.
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY] — Captura de las recomendaciones seleccionadas, generación dinámica del bloque formateado de sugerencias de portabilidad con enlaces absolutos e inyección de la cláusula de autonomía creativa de la IA en `antigravity_bootstrap_prompt.md`.
* **Causa Raíz:** Optimizar el onboarding y aprovisionamiento de nuevos clientes permitiendo al desarrollador recomendar componentes y módulos de la biblioteca a la IA de forma no restrictiva (sin saturar el prompt con códigos monolíticos), acelerando la portabilidad y garantizando la autonomía creativa de la IA.
* **Resultado:** Selector interactivo operativo en Wizard, generación dinámica de enlaces físicos en el prompt de arranque, cláusula de autonomía inyectada y suite de tests compilada con éxito.

### [2026-06-08] - Arquitectura e Integración de Módulos Completos en Biblioteca y Sandbox (Tarea 291)
* **Tipo:** Arquitectura / Refactorización / UI / UX / Reglas de IA
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/10_Modulos_Completos/`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/10_Modulos_Completos/) [NEW] — Se creó el directorio raíz de Módulos Completos (numeral 10) al lado de `06_Biblioteca_Componentes/` para separar limpiamente las features funcionales de los componentes atómicos.
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY] — Se inyectó filtrado HSL premium ("Todos", "Componentes", "Módulos") y badges visuales para identificar el tipo de recurso.
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Se mapearon e integraron perezosamente los sandboxes de simulación interactiva para los 8 módulos.
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/) [NEW] — Se crearon playgrounds interactivos 100% en memoria para `PantallaCocinaKDSSandbox`, `ReservasAgendaCitasSandbox`, `POSExpressScannerSandbox`, `OrdenesTrabajoEquiposSandbox`, `CreditosSaldosSandbox` y `OmnicanalidadWhatsAppSandbox`.
  - [`D:/Aplicaciones/App Ventas/GEMINI.md`](file:///D:/PROTOTIPE/App%20Ventas/GEMINI.md) [MODIFY] — Se declaró la directiva de portabilidad `@portar-modulo` diferenciada de `@portar-componente`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY] — Sincronizadas las referencias físicas de la biblioteca y módulos completos.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Indexados los nuevos módulos en el GPS semántico.
* **Causa Raíz:** Separar conceptual y físicamente los módulos autocontenidos complejos (Features) de la biblioteca de componentes atómicos UI, y proveer un entorno de simulación premium (Sandbox) interactivo en memoria local para agilizar el desarrollo de nichos.
* **Resultado:** Modularización limpia, previsualización de 8 módulos completa en Sandbox, filtrado en Dashboard y soporte del comando CLI/IA para portabilidad modular.

### [2026-06-08] - Sprint de Limpieza y Unificación Documental (Sprint 1)
* **Tipo:** Documentación / Refactorización / Calidad / Consistencia
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/inventario_maestro.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/inventario_maestro.md) [NEW] — Reubicado e higienizado desde el prototipo antiguo, purgado de componentes duplicados de la lista y corregidos comentarios rotos en `AppResetTool`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/arquitectura_oficial_prototipe.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/arquitectura_oficial_prototipe.md) [NEW] — Reubicado e higienizado, actualizando referencias de `modal_base` a `modal_template`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/ESTADO_REAL_PROTOTIPE_2.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/ESTADO_REAL_PROTOTIPE_2.md) [NEW] — Reubicado e higienizado, marcando los bugs y redundancias detectados como "SOLVENTADOS en Sprint 1".
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY] — Eliminada la entrada duplicada de la Tarea 124.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Depuradas referencias de `ModalTemplate`, `QuantitySelector` y `CurrencyInput`, e indexados los tres archivos de arquitectura trasladados.
  - **Remoción Física de Carpetas Obsoletas** [DELETE] — Eliminadas `/Input_Moneda_COP`, `/Selector_Cantidad` y `/Modal_Base` de la biblioteca, y removida por completo la carpeta antigua `D:/PROTOTIPE/Prototype 2.0 Arquitectura/` del disco.
* **Causa Raíz:** Eliminar la duplicidad de documentación sintáctica, consolidar toda la especificación técnica en un solo directorio centralizado (`Documentacion PROTOTIPE`) y prevenir enlaces rotos y malas interpretaciones de mapas semánticos por parte de la IA.
* **Resultado:** Directorio de biblioteca limpio de redundancia, documentación técnica centralizada en carpetas numeradas, compilación exitosa y alineación de mapas semánticos.

### [2026-06-08] - Mejoras del Flujo de Automatización y Empaquetado del CLI (Tarea 289)
* **Tipo:** Automatización / Control de Calidad / CLI / PWA
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/package.json`](file:///D:/PROTOTIPE/Prototipe-CLI/package.json) [MODIFY] — Instalado `jimp` como devDependency para redimensionamiento multiplataforma de imágenes en Node.js.
  - [`D:/PROTOTIPE/Prototipe-CLI/test_templates.js`](file:///D:/PROTOTIPE/Prototipe-CLI/test_templates.js) [MODIFY] — Añadido el Paso 2.5 `auditarDependencias` para validar síncronamente que las dependencias críticas de las plantillas (React, Firebase, Zustand, Tailwind, Vite) coincidan con el perfil recomendado del Core de Oro.
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY] — (1) Añadido el Paso 5.1 para autogenerar síncronamente `firebase.json` incluyendo soporte para Firestore y Storage. (2) Añadido el Paso 5.2 para autogenerar síncronamente `storage.rules`. (3) Actualizado el Paso 11 para desplegar las reglas de Storage automáticamente. (4) Modificado el Paso 6 de logo-copy para redimensionar y escribir automáticamente los iconos de la PWA (`pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`) a partir de cualquier logo rasterizado personalizado suministrado por el usuario usando `jimp`.
* **Causa Raíz:** Robustecer la consistencia de dependencias de las plantillas y automatizar por completo los recursos de Storage y PWA al aprovisionar nuevas instancias de clientes.
* **Resultado:** CLI capaz de auditar consistencia, generar configuraciones de Firebase completas y compilar/escalar iconos PWA sin dependencias nativas pesadas.

### [2026-06-08] - Blindaje de Seguridad y Control de Errores en Telemetría (Tarea 288)
* **Tipo:** Seguridad / Robustez / Telemetría
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/firestore.rules`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/firestore.rules) [MODIFY] — Reforzadas las reglas de seguridad de Firestore en la Central de Control (`prototipe-ecosistema-control`) validando de manera estricta que el token exista y corresponda al `clientId` en la colección `reportesBilling` y `app_failures`. Restringida la lectura de `clientes_control` a usuarios autenticados.
  - [`D:/Aplicaciones/App Ventas/src/services/telemetryService.js`](file:///D:/PROTOTIPE/App%20Ventas/src/services/telemetryService.js) [MODIFY] — Modificado para leer el nicho dinámicamente desde `VITE_NICHE`, agregar el guard `if (!DEV_TOKEN || !CLIENT_ID) return` en el reporte de fallos y enviar el token correspondiente para cumplir con las reglas de seguridad de la Central.
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY] — Inyectada la variable de entorno `VITE_NICHE` en la generación del `.env.local` de nuevos proyectos.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js) [MODIFY] — Sincronizadas las mejoras de telemetría y seguridad en la plantilla de ventas del CLI.
* **Causa Raíz:** Blindar la Central de Control contra escrituras fraudulentas o no autenticadas en base de datos Firestore y corregir bugs de envío de telemetría sin token y nichos hardcodeados.
* **Resultado:** Central de Control blindada y telemetría de clientes 100% en línea con las nuevas reglas.

### [2026-06-08] - Alineación de Nichos de Mercado Ecosistema CLI/Dashboard (Tarea 287)
* **Tipo:** Refactorización / Robustez / Alineación / CLI
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY] — Reestructuración de la lógica de inyección de atributos de nicho en `niche.json` para soportar de forma nativa e idéntica las 10 verticales de negocio de la Consola Central.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/scratch/seed_brand.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/scratch/seed_brand.js) [MODIFY] — Actualización de `NICHE_TEMPLATES` sustituyendo `beauty_salon` por `wellness_podology`, y añadiendo datos semilla detallados de categorías e ítems realistas para las verticales de climatización, carpintería, lavandería, contratistas, alquiler de maquinaria y restauración de muebles.
* **Causa Raíz:** Alinear los nichos de mercado del CLI con los 10 nichos oficiales configurables en el aprovisionamiento de la Consola Central (`dev-dashboard` en `App.jsx`) para que los proyectos nuevos nazcan completamente configurados y con datos semilla contextuales realistas del nicho correcto.
* **Resultado:** Sincronía del 100% en las verticales de negocio y su modelo de datos inicial del ecosistema.
* **Resultado del Test:** Suite de tests del CLI ejecutada exitosamente.

### [2026-06-08] - Suite de Mejoras de Aprovisionamiento Modular y Agnóstico del CLI Prototipe (Tarea 286)
* **Tipo:** Refactorización / Robustez / Automatización / CLI / Seeding
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY] — (1) Implementada función `checkEnvironment` para validaciones de preflight (Firebase/GitHub CLI y login activo). (2) Integradas llamadas REST asíncronas para auto-registrar la instancia de cliente y su telemetry token en la Consola Central. (3) Soporte de copia directa para logos con extensiones rasterizadas (.png, .jpg, .jpeg, .webp). (4) Integrado spinner interactivo `ora` por paso de aprovisionamiento.
  - [`D:/PROTOTIPE/Prototipe-CLI/cli.js`](file:///D:/PROTOTIPE/Prototipe-CLI/cli.js) [MODIFY] — (1) Añadido convertidor dinámico HEX→HSL que autogenera un color secundario de acento 10% más oscuro. (2) Unificada la constante de paletas `PALETTES` importada de generator.js. (3) Removidos los logs obsoletos de pasos manuales.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/scratch/seed_brand.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/scratch/seed_brand.js) [NEW] — Creado script modular de siembra REST agnóstico de SDKs de Firebase locales. Lee la configuración del nicho (`niche.json`) inyectado en caliente para determinar dinámicamente qué categorías e ítems de demostración sembrar. Expandida la suite de nichos a Veterinaria, Ropa, Abarrotes, Servicios Técnicos, Barbería, Sala de Belleza, Gimnasio, Farmacia y Panadería.
* **Causa Raíz:** Optimizar el pipeline de aprovisionamiento de un clic ("One-Click Provisioning") y desacoplar la lógica del CLI de la estructura interna de base de datos de una plantilla específica para soportar futuros cores.
* **Resultado:** CLI robusto, agnóstico, con retroalimentación visual animada y cero intervenciones manuales requeridas en la Consola Central ni en el sembrado de Firebase.
* **Resultado del Test:** Suite de integración corre exitosamente y la plantilla `ventas` compila correctamente (`PASSED` en 16.1s).

### [2026-06-08] - Blindaje de Seguridad y Control de Errores en API Bridge Server (Tarea 285)
* **Tipo:** Seguridad / Robustez / API Bridge / CLI
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — (1) Implementada validación canónica estricta con `path.resolve` en el endpoint `/api/library/file` para mitigar directory traversal. (2) Robustecida la tolerancia a fallos en la creación de bases de datos Firestore (`/api/create-project`) silenciando códigos REST `409` y `ALREADY_EXISTS`.
* **Causa Raíz:** Prevenir directory traversal de UIs externas expuestas y evitar colapsos síncronos en el aprovisionamiento de Firebase por reintentos de inicialización del default Firestore.
* **Resultado:** Servidor API Bridge del CLI robusto y libre de vulnerabilidades básicas de pathing.

### [2026-06-08] - Inyección Automática de Git Hooks en Proyectos Nuevos (Tarea 284)
* **Tipo:** Robustez / Automatización / CLI / Git Hooks
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY] — Modificado el paso 10 (Git y GitHub) para copiar el script `pre-commit` desde el CLI hacia la carpeta `.git/hooks/pre-commit` del nuevo shard de cliente, otorgándole permisos de ejecución con `chmod +x`.
  - [`D:/PROTOTIPE/Prototipe-CLI/hooks/pre-commit`](file:///D:/PROTOTIPE/Prototipe-CLI/hooks/pre-commit) [MODIFY] — Optimización del hook pre-commit base para silenciar alertas de git add y prevenir fallos si Node o el script no están presentes.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/manual_prototipe_cli.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/manual_prototipe_cli.md) [MODIFY] — Actualizada la tabla de orquestación (Paso 11) y añadida la subsección `9.2 - Integración de Git Hooks en el Scaffolding`.
* **Causa Raíz:** Extender la protección de reglas `GEMINI.md` a todo nuevo proyecto o shard del cliente creado a futuro.
* **Resultado:** Todo nuevo proyecto generado por el CLI vendrá con el Git hook pre-commit instalado por defecto.

### [2026-06-08] - Automatización de Reglas mediante Git Hooks (Tarea 283)
* **Tipo:** Automatización / Control de Calidad / Git Hooks / Reglas de IA
* **Archivo(s) Modificado(s):**
  - [`D:/Aplicaciones/App Ventas/.git/hooks/pre-commit`](file:///D:/PROTOTIPE/App%20Ventas/.git/hooks/pre-commit) [MODIFY] — Optimizado el hook nativo pre-commit para evitar fallos si Node.js no está en PATH o el script central de reglas no está accesible, y silenciar las alertas de `git add` mediante indexación selectiva (pipeando diffs a grep y xargs).
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes_prioritarias.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes_prioritarias.md) [MODIFY] — Registro de Tarea P3 y P4 como completadas en el backlog de prioridades.
* **Causa Raíz:** Prevenir commits accidentales con reglas de IA desalineadas o desactualizadas entre los distintos repositorios del ecosistema de manera robusta y sin ruido.
* **Resultado:** Sincronización silenciosa y selectiva de reglas en cada commit local.

### [2026-06-08] - Integración de Pruebas Automáticas Post-Sync en @actualizar-template (Tarea 282)
* **Tipo:** Automatización / Robustez / CLI / Reglas de IA
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/sync_templates.js`](file:///D:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY] — Añadido flag `--run-tests` (`-T`) que dispara automáticamente `test_templates.js --template [nombre]` al final de un sync exitoso. Propagación de código de salida 1 si el build falla.
  - [`D:/PROTOTIPE/Prototipe-CLI/package.json`](file:///D:/PROTOTIPE/Prototipe-CLI/package.json) [MODIFY] — Añadido script `sync:full` que ejecuta `sync_templates.js --yes --run-tests`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY] — Actualización del disparador `@actualizar-template` para incluir `--yes --run-tests` en el comando de sincronización.
* **Propagación:** `sync_rules.js` ejecutado exitosamente — 9 instancias GEMINI.md actualizadas en disco.
* **Causa Raíz:** El flujo `@actualizar-template` carecía de validación automática post-copia. Era posible distribuir un template que no compilara sin detectarlo hasta que se intentara crear una instancia de cliente.
* **Resultado:** El disparador ahora es un pipeline completo: sincroniza → aprueba → prueba build en temp dir → reporta. Exit code CI-compatible.

### [2026-06-08] - Runner de Pruebas de Integración de Plantillas CLI (Tarea 281)
* **Tipo:** Testing / Automatización / Control de Calidad / CLI
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/test_templates.js`](file:///D:/PROTOTIPE/Prototipe-CLI/test_templates.js) [NEW] — Script de integración que valida la compilación de cada plantilla registrada en `plantillas_registro.json` usando un directorio temporal aislado. Incluye validación de esquema, verificación de template sincronizado, `npm install`, `npm run build` y verificación de artefactos `dist/`.
  - [`D:/PROTOTIPE/Prototipe-CLI/package.json`](file:///D:/PROTOTIPE/Prototipe-CLI/package.json) [MODIFY] — Adición de los scripts `test`, `test:all`, `test:verbose`, `sync` y `sync:dry` como comandos `npm run` estándar del CLI.
* **Flags disponibles:** `--template [nombre]`, `--all`, `--keep-temp`, `--no-install`, `--verbose`.
* **Causa Raíz:** Implementar Tarea P3 del backlog de robustez: validar de forma automatizada que las plantillas registradas compilan sin errores de dependencias o sintaxis antes de ser distribuidas a nuevos proyectos de clientes.
* **Resultado:** Script creado y funcional. Corre secuencialmente todas las plantillas activas (o la indicada por flag) en temp dirs aislados, con reporte de PASSED/FAILED/OMITIDA y código de salida CI-compatible (exit 1 si alguna falla).

### [2026-06-08] - Validación de Esquema en plantillas_registro.json (Tarea 280)
* **Tipo:** Robustez / Control de Calidad / CLI
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/sync_templates.js`](file:///D:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY] — Integración de la función helper `validarRegistro` y su llamada síncrona obligatoria al arranque del script.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes_prioritarias.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes_prioritarias.md) [MODIFY] — Registro de Tarea P2 como completada en el backlog.
* **Causa Raíz:** Prevenir errores humanos, typos, rutas relativas inválidas o ausencia de llaves requeridas en la configuración del registro central de plantillas que puedan causar colapsos sintácticos durante la sincronización.
* **Resultado:** Validador de esquema JSON robusto y operativo. Test manual exitoso interceptando errores en caliente e interrumpiendo el script con código de salida 1.

### [2026-06-08] - Modo Simulación (dry-run) y Confirmación Interactiva en Sincronizador de Plantillas (Tarea 279)
* **Tipo:** Automatización / Seguridad / Robustez / CLI
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/sync_templates.js`](file:///D:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY] — Integración de los flags `--dry-run` (`-d`) y `--yes` (`-y`), lógica de comparación de archivos en memoria, escaneo de sanitización preventivo y diálogo de confirmación `readline` interactivo para TTYs.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes_prioritarias.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes_prioritarias.md) [MODIFY] — Registro de Tarea P1 como completada en el backlog de automatización y robustez.
* **Causa Raíz:** Evitar sobreescrituras físicas accidentales y proveer un mecanismo seguro de previsualización que permita a los desarrolladores y agentes de IA verificar qué archivos cambian y qué alertas de seguridad se activan antes de persistir en disco.
* **Resultado:** Sincronizador dotado de modo dry-run interactivo y seguro. Simulación exitosa de la plantilla `ventas` previsualizando cambios sin alterar el disco.

### [2026-06-08] - Refactorización y Robustez del Flujo de Creación y Aprovisionamiento en CLI (Tarea 278)
* **Tipo:** Refactorización / Robustez / CLI
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/cli.js`](file:///D:/PROTOTIPE/Prototipe-CLI/cli.js) [MODIFY] — Adición de lector manual nativo de variables `.env` y desacoplamiento de las credenciales centralizadas por defecto a llamadas dinámicas `process.env`.
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY] — Reemplazo de regex rígida en `firebase-messaging-sw.js` por reemplazo genérico multi-comillas, flexibilización de expresiones regulares SEO para tolerar sintaxis HTML5 nativa, y adaptación de comandos `npm install` / `npm run map` a ejecuciones de shell multiplataforma nativas de Node.js.
* **Causa Raíz:** Resolver los 4 bugs identificados durante la auditoría técnica de aprovisionamiento para asegurar portabilidad e inmunizar el flujo ante formateadores y estructuras HTML5.
* **Resultado:** CLI y generador actualizados con éxito. Carga sintáctica e inicialización verificadas.

### [2026-06-08] - Auditoría del Flujo de Creación de Apps y Propuesta de Robustez (Tarea 277)
* **Tipo:** Auditoría / Robustez / CLI
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_creacion_apps_y_robustez.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_creacion_apps_y_robustez.md) [NEW] — Creación del reporte técnico que analiza las fragilidades en caliente del CLI de aprovisionamiento.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Registro del archivo de auditoría en el mapa semántico de documentación.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY] — Registro de la Tarea 277 como completada en la hoja de ruta.
* **Causa Raíz:** Evaluar y buscar bugs en el flujo automatizado de inicialización de nuevas aplicaciones a partir de plantillas, proponiendo mejoras críticas de portabilidad y seguridad de expresiones regulares.
* **Resultado:** Análisis redactado, clasificado y mapeado. Se dictamina que las mejoras propuestas son 100% seguras y no afectan el código de producción activo.

### [2026-06-08] - Inyección de Guía de Bootstrap en READMEs de Cores de Desarrollo
* **Tipo:** Documentación / Organización / Onboarding
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/App Servicios/README.md`](file:///D:/PROTOTIPE/App%20Servicios/README.md) [MODIFY] — Adición de la sección "Cómo iniciar el desarrollo de este Core" con las instrucciones de copiado de `template-core-seed`.
  - [`D:/PROTOTIPE/App Agendamiento/README.md`](file:///D:/PROTOTIPE/App%20Agendamiento/README.md) [MODIFY] — Adición de la sección "Cómo iniciar el desarrollo de este Core" con las instrucciones de copiado de `template-core-seed`.
  - [`D:/PROTOTIPE/App Gastronomia/README.md`](file:///D:/PROTOTIPE/App%20Gastronomia/README.md) [MODIFY] — Adición de la sección "Cómo iniciar el desarrollo de este Core" con las instrucciones de copiado de `template-core-seed`.
* **Causa Raíz:** Proveer al desarrollador un punto de partida explícito al inicializar nuevos cores base, previniendo configuraciones manuales erróneas.
* **Resultado:** Guías de bootstrap inyectadas en los 3 nuevos cores.

### [2026-06-08] - Implementación de Versiones de Plantillas y Auditoría de Seguridad de Credenciales (Tarea 275)
* **Tipo:** Automatización / Seguridad / Robustez / CLI
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json`](file:///D:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json) [MODIFY] — Adición del campo de versión SemVer (`"version": "1.0.0"`) a todas las plantillas del registro central.
  - [`D:/PROTOTIPE/Prototipe-CLI/sync_templates.js`](file:///D:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY] — Integración de logs de versión, reescritura automatizada de IDs de analítica, advertencia de seguridad para API Keys hardcodeadas en código de desarrollo, y optimización de exclusiones en la recursión (`node_modules`, `.git`, `dist`, `.vite`).
* **Causa Raíz:** Evitar fugas de seguridad (como propagar tokens y API Keys de desarrollo a plantillas de producción) y proveer un control de versiones de plantillas para gestionar futuras actualizaciones de clientes.
* **Solución Técnica:**
  - Se estructuró el check de seguridad mediante expresiones regulares durante la sanitización de archivos.
  - Se aceleró la ejecución del script omitiendo la lectura de directorios pesados.
* **Resultado:** Sincronizador robusto y optimizado con control de versiones y auditoría de fugas de credenciales. Sincronización de plantilla `ventas` finalizada con éxito.

### [2026-06-08] - Reorganización del Backlog de Infraestructura y Roadmap Prioritario
* **Tipo:** Documentación / Gestión de Tareas
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes_prioritarias.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes_prioritarias.md) [MODIFY] — Reestructuración completa del documento de tareas prioritarias en tres secciones: Historial de Tareas Completadas (como la inicialización del proyecto Firebase central y el desarrollo del dev-dashboard), Backlog Prioritario de Robustez del CLI, y Roadmap Estratégico a Futuro (pasarelas, facturación DIAN y seguridad cloud).
* **Causa Raíz:** El documento previo listaba tareas de infraestructura iniciales que ya habían sido completadas en fases previas, necesitando una categorización limpia que aislara el trabajo pendiente y definiera los objetivos estratégicos a largo plazo del producto.
* **Resultado:** Backlog reestructurado y limpio para la toma de decisiones.

### [2026-06-08] - Generalización de Nombres de Plantillas y Creación de Directorios Fuente en Aplicaciones
* **Tipo:** Estándar de Desarrollo / Organización / Documentación
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json`](file:///D:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json) [MODIFY] — Renombradas las plantillas `barberia` a `agendamiento` y `restaurante` a `gastronomia` para lograr una categorización universal de nichos.
  - [`D:/PROTOTIPE/App Servicios/`](file:///D:/PROTOTIPE/App%20Servicios/) [NEW] — Creación del directorio físico fuente para el core de servicios con su `package.json` y `README.md`.
  - [`D:/PROTOTIPE/App Agendamiento/`](file:///D:/PROTOTIPE/App%20Agendamiento/) [NEW] — Creación del directorio físico fuente para el core de citas/reservas con su `package.json` y `README.md`.
  - [`D:/PROTOTIPE/App Gastronomia/`](file:///D:/PROTOTIPE/App%20Gastronomia/) [NEW] — Creación del directorio físico fuente para el core gastronómico con su `package.json` y `README.md`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/sincronizacion_templates_universal.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/sincronizacion_templates_universal.md) [MODIFY] — Actualizada la tabla de plantillas registradas con los nuevos nombres de nichos y rutas.
* **Causa Raíz:** Evitar la generalización tosca (como usar "barbería" para citas o "restaurante" para cafés/bares) y proveer los directorios fuente vacíos para facilitar la ubicación del desarrollador al inicializar estos módulos base.
* **Solución Técnica:**
  - Se estructuraron los nombres a `agendamiento` y `gastronomia`.
  - Se crearon los directorios físicos fuente con un `package.json` minimalista y se sincronizaron sus reglas `GEMINI.md` de forma automática.
* **Resultado:** Directorios creados en `D:\PROTOTIPE\`, registros actualizados y reglas alineadas.

### [2026-06-08] - Universalización de Sincronización de Plantillas y Desacoplamiento del CLI
* **Tipo:** Estándar de Desarrollo / Automatización / Documentación
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/sync_templates.js`](file:///D:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [NEW] — Script automatizado de Node.js que realiza la copia limpia, sanitización y compilación de validación de proyectos de desarrollo a templates del CLI basados en `plantillas_registro.json`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY] — Adición del disparador rápido de actualización de plantillas `@actualizar-template [nombre]` para dar soporte multi-plantilla en las reglas de la IA.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/sincronizacion_templates_universal.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/sincronizacion_templates_universal.md) [NEW] — Nuevo documento estándar que sustituye a `sincronizacion_template_ventas.md`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/sincronizacion_template_ventas.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/sincronizacion_template_ventas.md) [DELETE] — Eliminado el estándar obsoleto específico de ventas.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Actualizado el mapa semántico con el nuevo estándar universal.
* **Causa Raíz:** El proceso de actualización del CLI estaba hardcodeado y acoplado a la estructura única de "App Ventas", lo que impedía dar soporte de manera ágil a otros tipos de aplicaciones base (como Servicios, Barberías o Restaurantes).
* **Solución Técnica:**
  - Se creó un script de automatización `sync_templates.js` en el CLI que consume un registro central dinámico `plantillas_registro.json`.
  - Se configuró el disparador rápido `@actualizar-template` de forma universal en las reglas `GEMINI.md` y se sincronizó en los 5 repositorios activos.
  - Se actualizó y renombró la documentación técnica al estándar universal de templates.
* **Resultado:** Sincronización multi-plantilla operativa y validada. La compilación de Vite en el template destino finalizó con éxito de forma automática.

### [2026-06-08] - Actualización de Estándar de Repositorios para Múltiples Productos Base y Flujo de Ramas
* **Tipo:** Documentación / Estándar de Desarrollo / Skills
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/01_Control_Versiones/arquitectura_git.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/01_Control_Versiones/arquitectura_git.md) [MODIFY] — Adición de la sección 1.1 (repositorios independientes), inclusión de la descripción de la rama `develop` como entorno de desarrollo y pruebas activo, y especificación del estándar de nomenclatura `prototipe-core-[nicho]` para repositorios base.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/git_strategist/SKILL.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/git_strategist/SKILL.md) [MODIFY] — Actualización de la skill `git_strategist` para integrar las pautas de flujo de ramas (`develop` y `main`), el estándar de nomenclatura de repositorios `prototipe-core-[nicho]`, y compilación previa obligatoria.
* **Causa Raíz:** Documentar el flujo estructurado de ramas (`develop` para desarrollo activo y pruebas, `main` para versión estable final consolidada), la estrategia de repositorios de GitHub independientes por cada producto base distinto, el estándar de nomenclatura contextual, y alinear las habilidades automáticas del agente Git.
* **Resultado:** Estándar de desarrollo, nomenclatura y skill de Git actualizados y documentados de forma clara.

### [2026-06-08] - Estándar de Sincronización de Template y Regla Proactiva de Índices Firestore (Tarea 271)
* **Tipo:** Estándar de Desarrollo / Automatización / Documentación
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/sincronizacion_template_ventas.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/sincronizacion_template_ventas.md) [NEW] — Documento de estándar que define qué archivos se sincronizan de App Ventas → template-ventas, cuáles se excluyen (cliente-específicos), el procedimiento de 5 pasos y el historial de sincronizaciones.
  - [`d:/Aplicaciones/App Ventas/GEMINI.md`](file:///d:/Aplicaciones/App%20Ventas/GEMINI.md) [MODIFY] — Dos nuevas directivas: (1) **`@actualizar-template`** como disparador oficial de sincronización del template antes de crear proyectos nuevos. (2) **Regla Proactiva de Índices Firestore**: obliga a agregar el índice compuesto al `firestore.indexes.json` y desplegarlo en el mismo turno en que se escribe cualquier query con `where() + orderBy()`.
* **Causa Raíz:** (1) El template-ventas del CLI estaba desactualizado respecto a App Ventas sin un proceso definido de sincronización. (2) La IA omitió agregar los índices Firestore al introducir `orderBy()` en las queries de notificaciones, causando un error en runtime. Ambos problemas requerían un estándar formal para no repetirse.
* **Solución:**
  - Sincronización on-demand mediante disparador `@actualizar-template`, con manifiesto claro de archivos genéricos vs. cliente-específicos.
  - Regla de índices como violación crítica de calidad — mismo nivel que omitir la bitácora.
  - Propagación de reglas a 5 destinos via `sync_rules.js`.
* **Resultado:** Estándar documentado y reglas propagadas. `✅ Sincronización finalizada con éxito.`

### [2026-06-08] - Paginación Lazy por Scroll en Bandeja de Notificaciones del Cliente (Tarea 270)
* **Tipo:** Optimización / Rendimiento / Firebase / UI-UX
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/services/notificationCenterService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/notificationCenterService.js) [MODIFY] — Importación de `startAfter`. Refactorización de `subscribeToCentralNotifications` para incluir `orderBy('createdAt','desc')` y `limit(pageSize=15)`. Adición de `fetchNotificationsPage()` (one-shot `getDocs` con cursor `startAfter`) para paginación bajo demanda.
  - [`d:/Aplicaciones/App Ventas/src/hooks/useNotificationCenter.js`](file:///d:/Aplicaciones/App%20Ventas/src/hooks/useNotificationCenter.js) [MODIFY] — Separación de responsabilidades: 1 listener en tiempo real (lote inicial + badge/sonido) + `loadMore()` que llama a `fetchNotificationsPage` con cursor y acumula páginas en la lista visible. Exporta `hasMore`, `isLoadingMore` y `loadMore`.
  - [`d:/Aplicaciones/App Ventas/src/components/common/NotificationHistoryTray.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/common/NotificationHistoryTray.jsx) [MODIFY] — Integración de `IntersectionObserver` sobre un `sentinel` div al fondo del scroll para disparar `onLoadMore` automáticamente. Spinner de carga y mensaje de fin de historial. Eliminación de código muerto (CheckCircle2, Trash2, Filter).
  - [`d:/Aplicaciones/App Ventas/src/layouts/ClientLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY] — Props `hasMore`, `isLoadingMore` y `onLoadMore={loadMore}` inyectadas al tray. Eliminadas props obsoletas `onMarkAllRead`, `onClearAll`, `hideActions`.
* **Causa Raíz:** La suscripción original descargaba hasta `maxItems*2=100` documentos en un solo listener sin `orderBy`, generando lecturas innecesarias en Firestore cada vez que el cliente abría la bandeja, independientemente de cuántas notificaciones hubiera en pantalla.
* **Solución Técnica:**
  - El listener en tiempo real ahora solo trae los **15 documentos más recientes** usando `orderBy('createdAt','desc') + limit(15)`. Esto elimina ~85% de lecturas de apertura típica.
  - Al hacer scroll hasta el fondo del tray, el `IntersectionObserver` dispara `loadMore()` → `fetchNotificationsPage()` con cursor `startAfter(lastDoc)` para cargar el siguiente lote de 15 bajo demanda.
  - Las páginas históricas se acumulan al fondo de la lista sin interferir con las notificaciones live del listener.
* **Resultado:** Lecturas Firestore reducidas a 15 por apertura. Historial completo disponible de forma progresiva solo si el usuario lo solicita. Compilación exitosa `✓ built in 1.71s`.

### [2026-06-08] - Optimización de Ventana de Notificaciones de Clientes (Tarea 269)
* **Tipo:** UI-UX / Bugfix / Limpieza
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/components/common/NotificationHistoryTray.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/common/NotificationHistoryTray.jsx) [MODIFY] — Adición de prop `hideActions` para remover botones administrativos e incremento de paddings y márgenes del listado.
  - [`d:/Aplicaciones/App Ventas/src/layouts/ClientLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY] — Inyección del flag `hideActions={true}` al renderizar la bandeja de notificaciones en el modal del cliente.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/common/NotificationHistoryTray.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/common/NotificationHistoryTray.jsx) [MODIFY] — Paridad de cambios del componente unificado de bandeja de notificaciones en el CLI.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/layouts/ClientLayout.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/layouts/ClientLayout.jsx) [MODIFY] — Inyección del flag `hideActions={true}` en la plantilla del layout del cliente del CLI.
* **Causa Raíz:** La bandeja de notificaciones compartida `NotificationHistoryTray` renderizaba botones de "Marcar todas como leídas" y "Eliminar todo" para todos los roles, pero los clientes no contaban con permisos de escritura masiva en Firestore para estas acciones, por lo que los botones fallaban. Además, el listado de notificaciones carecía de márgenes cómodos en su listado interno y el modal presentaba un borde izquierdo (`border-l`) redundante heredado de la versión drawer lateral.
* **Solución Técnica:**
  - Se implementó la prop `hideActions` (default `false`) en `NotificationHistoryTray`.
  - Se eliminó el `border-l` redundante del contenedor exterior para mejorar la simetría de la tarjeta modal.
  - Se modificó la cabecera para consumir un separador estándar de marca (`border-app border-b`) y se aumentó el padding interior de la lista a `p-5 space-y-3.5` para dar mayor holgura.
  - Se inyectó `hideActions={true}` en `ClientLayout.jsx` de producción y plantilla del CLI, removiendo por completo las acciones no funcionales y dejando un header limpio y balanceado.
* **Resultado:** Interfaz móvil elegante, espaciosa y sin acciones rotas para el cliente. Compilación exitosa en producción.

### [2026-06-08] - Sección de Resumen y Confirmación de Pedido en Checkout de Cliente (Tarea 268)
* **Tipo:** UI-UX / Funcionalidad del Cliente / Robustez
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY] — Reestructuración del asistente multipaso a 4 pasos e integración de la vista resumen del pedido.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/checkout/CheckoutModal.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY] — Paridad de UI, animaciones y pasos de resumen en la plantilla de checkout del CLI.
* **Causa Raíz:** Anteriormente, el cliente seleccionaba el método de pago en el paso 3 y al presionar "Finalizar Compra" la orden se creaba directamente sin darle una oportunidad de revisar la lista final de productos, dirección cargada, notas adicionales o totales finales.
* **Solución Técnica:**
  - Se expandió el wizard del checkout a 4 pasos visibles y se desplazó la pantalla de éxito al paso 5.
  - El botón del paso 3 ahora valida el método de pago y avanza al paso 4: "Resumen del Pedido".
  - Se diseñó el paso 4 con un listado scrollable de productos (imagen, variante, cantidad, subtotal), desglose interactivo de datos de entrega/contacto, validación visual del método de pago elegido, y el bloque de totales final.
  - El botón final del paso 4 ejecuta la creación del pedido (`handleCheckout`) y redirige al paso 5.
* **Resultado:** Checkout más transparente e intuitivo para el cliente, mitigando errores en direcciones o productos. Compilación exitosa en producción.

### [2026-06-08] - Corrección de Encolamiento de Pedidos a Domicilio en Cola Logística (Tarea 266)
* **Tipo:** Lógica de Negocio / Bugfix
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/services/orderService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/orderService.js) [MODIFY] — Eliminada la restricción de lectura de configuración de domicilios en `createOrder`. Ahora todos los pedidos con `tipoEntrega === 'domicilio'` se encolan incondicionalmente en la colección `deliveries`.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/orderService.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/orderService.js) [MODIFY] — Sincronizada la lógica de encolamiento incondicional de domicilios en la plantilla base del CLI.
* **Causa Raíz del Bug:** Anteriormente, `orderService` condicionaba la creación de la entrega en la colección `deliveries` a que el documento `config/delivery` existiera en Firestore y tuviera `customDelivery.enabled === true`. Si el administrador no había guardado esa configuración específica previamente, los pedidos a domicilio no se registraban en la cola y por ende no aparecían en el Portal del Mensajero.
* **Corrección del Bug:** Se eliminó el bloqueo condicional de la lectura de configuración. Ahora cualquier pedido con `tipoEntrega === 'domicilio'` se encola directamente.
* **Resultado:** Los pedidos a domicilio aparecen correctamente en el panel de mensajeros como "Disponibles". Compilación exitosa en producción.

### [2026-06-08] - Corrección de Visibilidad del Botón "Historial" en Tarjetas de Pedidos del Admin (Tarea 267)
* **Tipo:** UI-UX / Bugfix
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY] — Corrección del filtro condicional para renderizar el botón de "Historial" en pedidos completados.
* **Causa Raíz del Bug:** La vista del administrador limitaba la visualización del botón "Historial" únicamente a transacciones con método de pago `TRANSFER` (Transferencia), dejando las órdenes completadas con otros métodos de pago (como efectivo) sin el botón para ver su resumen y detalle.
* **Corrección del Bug:** Se cambió el condicional para que dependa exclusivamente de si el estado del pedido es `COMPLETED` (Completado) sin importar el método de pago empleado.
* **Resultado:** Botón de historial visible en todas las órdenes completadas. Compilación exitosa en producción.

### [2026-06-08] - Rediseño Premium de Tarjetas de Recomendados en CartDrawer (Tarea 265)
* **Tipo:** UI-UX / Micro-animaciones / Rediseño Visual
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY] — Rediseño completo del bloque JSX de recomendaciones y corrección definitiva del race condition de visibilidad.
* **Causa Raíz del Bug previo:** El `useEffect` limpiaba `recommendedProducts` a `[]` al inicio de cada fetch (no solo al cerrar), provocando que el bloque desapareciera durante la carga asíncrona. Si el resultado llegaba vacío (e.g., el único producto en stock ya estaba en el carrito), el bloque nunca volvía a aparecer.
* **Corrección del Bug:** `setRecommendedProducts([])` se ejecuta **únicamente** en el branch `!isOpen`. La fetch asíncrona ya no limpia el estado previo, evitando el parpadeo.
* **Mejoras Visuales:**
  - Tarjetas verticales con imagen dominante de 160px (`h-[160px]`) tipo cover, reemplazando el diseño plano anterior.
  - Overlay gradiente `from-black/75 via-black/20 to-transparent` sobre la imagen para legibilidad del texto superpuesto.
  - Nombre del producto y precio mostrados directamente sobre la imagen (fondo oscuro del gradiente).
  - Badge PROMO con punto `animate-ping` en blanco sobre fondo rojo.
  - Precio tachado del original al lado del precio con descuento cuando aplica promo.
  - Botón "+" flotante en esquina inferior derecha con `bg-primary`, `shadow-primary/40` y animación `rotate: 15` en hover.
  - Skeleton loader tipo shimmer (3 tarjetas grises con `animate-pulse`) mientras `loadingRecs === true` y aún no hay datos.
  - Indicador de "ping" doble (absoluto + relativo) en el encabezado de la sección para marcar actividad en tiempo real.
* **Resultado:** Componente compilado y verificado en producción. `✓ built in 1.71s`.

### [2026-06-08] - Optimización de Recomendaciones y Corrección de Destellos Visuales en el Carrito (Tarea 264)
* **Tipo:** Optimización / Rendimiento / UI-UX / Bugfix
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/components/client/cart/CartDrawer.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [MODIFY] — Eliminada la dependencia reactiva `items` del `useEffect` de recomendaciones, implementada lectura en caliente mediante `useCartStore.getState().items` y vaciado de estado `setRecommendedProducts([])` al cerrar el cajón.
* **Causa Raíz:**
  - **Flickering Visual:** Cuando el cliente agregaba un producto al carrito, este se mostraba momentáneamente bajo "Recomendados para ti" (basado en un fetch previo) antes de que el `useEffect` terminara de re-consultar Firestore y lo filtrara por estar ya en el carrito. Al ser el único producto del inventario de pruebas, la lista quedaba vacía y la sección desaparecía de golpe.
  - **Sobrecarga de Lecturas:** Al tener `items` en la lista de dependencias del efecto, cualquier alteración en el carrito (por ejemplo, aumentar/disminuir cantidad de cualquier item) disparaba una nueva consulta completa a Firestore, impactando negativamente las cuotas y el rendimiento.
* **Solución Técnica:**
  - Se modificó el callback del desmontado / cierre en el `useEffect` para limpiar el estado local (`setRecommendedProducts([])`), asegurando que al reabrir el drawer comience siempre limpio sin mostrar datos residuales/estancados.
  - Se removió `items` del array de dependencias para que el efecto se ejecute **únicamente** cuando el drawer se abre (`isOpen`).
  - Para obtener los productos agregados en el momento justo del fetch, se usó la lectura asíncrona de Zustand `useCartStore.getState().items`, desacoplando completamente el fetch de las actualizaciones reactivas de render del carrito (como cambios de cantidad).
  - **Alineación Visual Animada:** Se implementaron animaciones de cascada (`staggerChildren`) para una aparición fluida de los productos. Cada tarjeta se convirtió en un `motion.div` con spring physics para hover (`y: -6`, `scale: 1.02`), escala en tap (`scale: 0.97`), zoom de imagen en hover (`scale-110`), transición de color en el título y auto-rellenado con sombra HSL para el botón de "Ver".
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-08] - Integración del Portal de Mensajeros y Ciclo de Auto-Asignación (Tarea 263)
* **Tipo:** Lógica de Negocio / Interactividad / Consistencia / Robustez
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/services/orderService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/orderService.js) [MODIFY] — Integración de auto-encolamiento de domicilios en `createOrder` con lectura segura de config y manejo de excepciones `try-catch`.
  - [`d:/Aplicaciones/App Ventas/src/services/deliveryService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/deliveryService.js) [MODIFY] — Refactorización de `subscribeToDeliveries` para traer pedidos disponibles (unassigned) mediante filtrado reactivo seguro en memoria.
  - [`d:/Aplicaciones/App Ventas/src/pages/portal/PortalMensajero.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalMensajero.jsx) [MODIFY] — Rediseño de interfaz con tabs ("Mis Entregas" / "Disponibles"), botón de auto-asignación "Aceptar Entrega" y modo consulta.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalMensajero.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalMensajero.jsx) [MODIFY] — Paridad de UI, lógica de asignación y filtros en la plantilla del CLI.
* **Causa Raíz:**
  - Los pedidos tipo domicilio creados por el cliente no ingresaban a la cola logístico-operativa de forma directa. Los mensajeros no tenían visibilidad de las entregas pendientes ni contaban con herramientas para auto-asignarse pedidos desde su portal.
* **Solución Técnica:**
  - Se implementó la verificación de habilitación de envíos (`customDelivery.enabled === true`) para encolar condicionalmente en `deliveries` al crear un pedido.
  - Se modificó la escucha del mensajero para retornar tanto entregas asignadas como unassigned pendientes, filtrando síncronamente en memoria.
  - Se estructuró el Portal del Mensajero en pestañas operativas y se integró el botón de "Aceptar Entrega" con llamadas a `assignDelivery`.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-08] - Botón de Historial y Modal de Resumen en Tarjetas de Pedidos del Admin (Tarea 262)
* **Tipo:** UI-UX / Interactividad / Funcionalidad del Administrador / Bugfix
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY] — Adición del botón de "Historial" en los bloques de acciones de pedidos completados, importación de ícono `History`, declaración de estado `selectedOrderForHistory`, e inyección del JSX interactivo del modal `OrderHistoryModal`. Se corrigió el renderizado para que aplique a todos los métodos de pago completados (Efectivo, Transferencia, etc.).
* **Causa Raíz:**
  - En la tarjeta del pedido del administrador, cuando el pedido pasaba a estado `completado`, quedaba un espacio vacío a la derecha del botón de WhatsApp. El usuario requería una forma rápida de ver un resumen del historial de ese pedido en un modal emergente sin salir de la vista de órdenes.
* **Solución Técnica:**
  - Se importó el icono `History` de la biblioteca `lucide-react` y se agregó el estado reactivo `selectedOrderForHistory`.
  - Se inyectó un botón de Historial estilizado a la derecha de WhatsApp que se renderiza dinámicamente si el pedido tiene estado `completado` (aplica a todos los métodos de pago).
  - Se implementó un modal flotante moderno `OrderHistoryModal` utilizando `AnimatePresence` y animaciones suaves de Framer Motion con backdrop blur, mostrando detalles clave (Cliente, Método de Pago, Tipo de Entrega, Fechas y Total Facturado), junto a un botón de "Ver Detalle" que redirige dinámicamente en una nueva pestaña utilizando el token de seguimiento del pedido (`trackingToken`).
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-08] - Mapa de Ubicación Desplegable en Tarjetas de Pedidos de Administración (Tarea 261)
* **Tipo:** UI-UX / Optimización de Espacio / Interactividad
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY] — Refactorización del visualizador de mapas de Leaflet para hacerlo colapsable e inyección del estado `expandedMapOrderIds`.
* **Causa Raíz:**
  - En las tarjetas de pedidos del administrador, los pedidos de entrega a domicilio cargaban por defecto el mapa de ubicación en pantalla completa de forma estática. Esto tomaba demasiado espacio vertical en la lista de pedidos, forzando un scroll excesivo e innecesario.
* **Solución Técnica:**
  - Se implementó un estado reactivo local `expandedMapOrderIds` (Set) para registrar las vistas de mapa activas.
  - Se diseñó un botón premium con indicador de acordeón dinámico (Chevron rotativo) para contraer y desplegar el mapa en caliente.
  - Se envolvió el componente `LeafletMapPicker` y su enlace de ruteo externo en un bloque animado con transiciones de escala y altura mediante `motion.div` de Framer Motion.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-08] - Centrado y Temporizador Auto-Dismiss de Notificaciones Toast en Portales (Tarea 260)
* **Tipo:** UI-UX / Interactividad / Consistencia
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/portal/PortalVendedor.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY] — Integración de auto-dismiss de 3 segundos para el toast de advertencia de stock, y centrado corregido en Framer Motion.
  - [`d:/Aplicaciones/App Ventas/src/pages/portal/PortalBodega.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalBodega.jsx) [MODIFY] — Integración de auto-dismiss de 3 segundos para los banners de retroalimentación de stock.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalVendedor.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY] — Sincronización de alineación y auto-dismiss de 3 segundos en la plantilla del CLI.
* **Causa Raíz:**
  - Las notificaciones flotantes (toasts) no estaban correctamente centradas horizontalmente debido a que Framer Motion sobrescribía la propiedad `transform: translateX(-50%)` del CSS. Adicionalmente, las notificaciones y alertas se mantenían visibles de forma indefinida hasta que el usuario hiciera clic en ellas.
* **Solución Técnica:**
  - Se configuró la animación `x: '-50%'` dentro de las propiedades `initial`, `animate` y `exit` de Framer Motion para conservar el centrado exacto.
  - Se agregó un hook `useEffect` con `setTimeout` de 3000 ms y limpieza de callback para autodestruir el estado activo del toast al cumplirse el plazo en todos los portales aplicables.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-08] - Estado Dinámico Automático de Ventas POS según Método de Pago (Tarea 259)
* **Tipo:** Lógica de Negocio / Base de Datos / Sincronización
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/services/orderService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/orderService.js) [MODIFY] — Inicialización automática de `estado` en pedidos creados mediante `createPhysicalOrder` basándose en el método de pago.
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSales.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSales.jsx) [MODIFY] — Sincronización del estado de pedidos POS registrados localmente en cola IndexedDB (modo offline).
* **Causa Raíz:**
  - Los pedidos físicos (POS) registrados por los empleados o la administración no guardaban ningún estado inicial en Firestore. Esto hacía que aparecieran sin estado en los listados administrativos y creaba inconsistencias en la lógica de cobro.
* **Solución Técnica:**
  - Si el método de pago es Efectivo (`PAYMENT_METHODS.CASH`) o Transferencia (`PAYMENT_METHODS.TRANSFER`), el pedido pasa directamente a estado Completado (`ORDER_STATES.COMPLETED`).
  - Si es Crédito (`PAYMENT_METHODS.CREDIT`), el pedido pasa automáticamente a Crédito Aprobado (`ORDER_STATES.CREDIT_APPROVED`).
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-08] - Integración de Cuentas bancarias de Transferencia en Portal de Vendedor (Tarea 258)
* **Tipo:** Feature / UI-UX / Consistencia / Robustez
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/portal/PortalVendedor.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY] — Visualización en caliente de las cuentas de transferencia y código QR ampliable al seleccionar transferencia.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalVendedor.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY] — Sincronización del bloque de transferencias y modal ampliable de QR en el CLI.
* **Causa Raíz:**
  - Al seleccionar "Transferencia" como método de pago en el Portal operativo del Vendedor, no se mostraban las cuentas bancarias de la tienda (Nequi, cuentas de ahorros/corrientes) ni sus respectivos QRs, obligando al vendedor a consultarlos externamente.
* **Solución Técnica:**
  - Se estructuró y renderizó el contenedor de cuentas de transferencia idéntico al de `AdminSales.jsx`.
  - Se implementó la visualización de datos y logos de las cuentas 1 y 2, y se programó el modal centrado con backdrop difuminado (`expandedQrUrl`) para ampliar el código QR al hacer tap/click sobre el mismo.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-08] - Rediseño del Modal de Variantes de Producto en el Portal de Vendedor (Tarea 257)
* **Tipo:** UI-UX / Consistencia / Robustez
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/portal/PortalVendedor.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY] — Reemplazo del listado plano de variantes por tarjetas interactivas completas con precio base y círculos cromáticos.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalVendedor.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY] — Integración del nuevo diseño con flags dinámicas en la plantilla del CLI.
* **Causa Raíz:**
  - El modal de selección de variantes del Portal del Vendedor no mostraba información crítica como el precio, círculos swatches de color o stock restante estructurado de la misma forma que en el panel administrativo de venta directa.
* **Solución Técnica:**
  - Se implementó la visualización de muestras de color circulares dinámicas consumiendo `getCssColor` de la utilidad de colores.
  - Se estructuró el texto con separadores visuales (`Talla • Color`) y se inyectó la visualización en caliente de stock restante, precio base (`precioBase`) y chevron de acción/caja de agotado para homologar con `AdminSales.jsx`.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-08] - Rediseño Estético del Selector de Métodos de Pago en el Portal de Vendedor (Tarea 255)
* **Tipo:** UI-UX / Refactorización / Consistencia
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/portal/PortalVendedor.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY] — Alineación estética del selector de métodos de pago en el checkout del carrito.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalVendedor.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY] — Sincronización del diseño en la plantilla del CLI.
* **Causa Raíz:**
  - El selector de métodos de pago en el portal operativo del vendedor presentaba problemas estéticos y de alineación en dispositivos móviles. La estructura anterior dependía de clases personalizadas incompletas, mientras que el módulo de venta directa (`AdminSales.jsx`) utilizaba un grid responsivo premium.
* **Solución Técnica:**
  - Se sustituyó la estructura antigua por un grid dinámico de Tailwind (`grid-cols-2` o `grid-cols-3` según `creditsEnabled`) idéntico al del módulo de venta directa.
  - Se aplicaron las clases CSS de marca blanca con transiciones suaves, bordes interactivos y estados activos con fondo de color primario y texto blanco.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-08] - Historial de Auditoría de Ajustes de Stock en Ajustes de Tienda (Tarea 254)
* **Tipo:** Feature / Base de Datos / UI-UX / Monitoreo
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/firestore.indexes.json`](file:///d:/Aplicaciones/App%20Ventas/firestore.indexes.json) [MODIFY] — Adición del índice compuesto para la colección `stockMovements` (`employeeId` ASC, `createdAt` DESC).
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY] — Suscripción reactiva e interfaz del historial de movimientos de inventario.
  - [`d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx) [MODIFY] — Sincronización del historial en la plantilla de ventas del CLI.
* **Causa Raíz:**
  - Al suscribirse a los movimientos de stock filtrados por empleado y ordenados por fecha, Firestore requería un índice compuesto específico. De lo contrario, arrojaba un error de permisos o de indexación que bloqueaba la consulta.
* **Solución Técnica:**
  - Se declaró el índice compuesto en `firestore.indexes.json` y se desplegó a producción mediante Firebase CLI.
  - Se integró la sección de Auditoría de Ajustes de Stock en el panel de Ajustes con estadísticas en tiempo real y filtros avanzados.
* **Estatus:** ✅ Completado y desplegado con éxito.

### [2026-06-08] - Implementación de ErrorBoundaryFallback y Telemetría de Excepciones Runtime (Tarea 253)
* **Tipo:** Robustez / Telemetría / UI-UX / Feedback
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/components/ui/feedback/ErrorBoundaryFallback.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/feedback/ErrorBoundaryFallback.jsx) [NEW] — Creación del componente de recuperación ante errores fatales con logs y reintento.
  - [`d:/Aplicaciones/App Ventas/src/routes/AppRoutes.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/routes/AppRoutes.jsx) [MODIFY] — Envoltura de layouts principales (`AdminLayout`, `ClientLayout` y `PortalLayout`) para aislar excepciones de renderizado de componentes hijos.
* **Causa Raíz:**
  - Si un componente de React fallaba en tiempo de ejecución (por ejemplo, errores de renders por propiedades no estructuradas), la aplicación colapsaba por completo mostrando pantalla en blanco a administradores, vendedores o clientes.
* **Solución Técnica:**
  - Creación del componente de clase `ErrorBoundaryFallback` que captura excepciones runtime de React in situ.
  - Integrada la telemetría automática mediante `reportAppFailureToDeveloper` del servicio `telemetryService.js` para despachar excepciones directamente a la colección centralizada `app_failures` en Firestore.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-07] - Sincronización en Tiempo Real de Movimientos de Stock en Portal de Bodega
* **Tipo:** Bugfix / UI-UX / Sincronización / Inventario
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/portal/PortalBodega.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalBodega.jsx) [MODIFY]
  - [`d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalBodega.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalBodega.jsx) [MODIFY]
* **Causa Raíz:**
  - Al realizar un movimiento de inventario (entrada, salida, ajuste, merma) desde el Portal de Bodega, los cambios se guardaban correctamente en la base de datos Firestore, pero no se reflejaban en el listado izquierdo de productos de la interfaz hasta recargar la página. Esto ocurría porque la lista de productos es gestionada por un caché de React Query (`useProducts`) que no era invalidado tras la actualización directa a Firestore.
* **Solución Técnica:**
  - Se importó e implementó `useQueryClient` de `@tanstack/react-query` en el componente `PortalBodega`.
  - Se añadió la llamada `queryClient.invalidateQueries({ queryKey: ['products'] })` inmediatamente después de la escritura a Firestore (`updateDoc`), forzando a React Query a refetch-ear el catálogo en tiempo real y actualizar la UI de inmediato.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-07] - Estandarización de PIN a 6 Dígitos, Layouts de Pantalla Completa y Notificaciones Flotantes
* **Tipo:** Refactorización / UI-UX / Seguridad / Plantillas CLI
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/pages/portal/PortalAuth.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalAuth.jsx) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminClaims.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminClaims.jsx) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/layouts/AdminLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/layouts/ClientLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/layouts/PortalLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/PortalLayout.jsx) [MODIFY]
  - [`d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/src/...`](file:///d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/src/) [MODIFY] — Modificaciones replicadas en plantilla CLI.
* **Causa Raíz:**
  - El PIN de empleados en el portal operativo debía ser estrictamente de exactamente 6 dígitos para cumplir con los estándares de seguridad física.
  - Vistas administrativas como Ajustes de Tienda, Pedidos y Garantías no aprovechaban el ancho disponible de la pantalla en monitores amplios, viéndose limitadas e incómodas.
  - La bandeja de notificaciones resultaba molesta como drawer lateral y se prefería un formato de modal flotante centrado con fondo difuminado.
* **Solución Técnica:**
  - Se modificaron las validaciones de longitud en la interfaz del teclado de PIN y configuraciones para obligar que sea exactamente de 6 caracteres.
  - Se expandieron los contenedores envolventes de las páginas afectadas de `max-w-6xl` a `max-w-7xl` (ancho máximo del estándar).
  - Se rediseñó el contenedor de notificaciones en los layouts (`AdminLayout`, `ClientLayout`, `PortalLayout`) convirtiéndolo en un modal centrado con `backdrop-blur-sm`, permitiendo un cierre cómodo y adaptado a móviles y PC.
* **Estatus:** ✅ Completado y verificado con compilación y sincronización de reglas exitosas.

### [2026-06-07] - Integración de Resolución Inteligente y Generador de Prompts para Antigravity en Consola de Errores
* **Tipo:** Feature / UI-UX / Monitoreo / Diagnósticos / Integración Antigravity
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY] — Declaración del estado `selectedDiagnosticError`. Inyección del botón "Diagnosticar" en cada tarjeta del listado de fallas. Creación y renderizado del componente **Drawer Lateral de Diagnóstico Inteligente** deslizable con backdrop difuminado, análisis contextual de fallos (Carga de Módulos, Permisos, etc.), caja pre-formateada de stack trace y botones inteligentes para copiar rutas físicas y el Prompt estructurado dirigido a Antigravity (especificando ID de proyecto, error, ruta de archivo y línea).
* **Causa Raíz:**
  - El usuario sugirió mejorar la funcionalidad del botón "Resolver" para que sirva activamente al desarrollador durante el proceso de depuración del ecosistema.
  - Se identificó la oportunidad de integrar de forma nativa la consola de fallos de telemetría con las capacidades de codificación autónoma del agente Antigravity para automatizar las reparaciones.
* **Solución Técnica:**
  - Se diseñó un Drawer lateral responsivo (`animate-slide-in-right`) que aísla la depuración del error de la vista principal.
  - El Drawer detecta patrones comunes en el mensaje del fallo para sugerir causas probables y soluciones técnicas en español.
  - Implementación de un generador dinámico de prompts que recopila el ID exacto del subproyecto (evitando colisiones en el workspace), la ruta absoluta del archivo y el mensaje del crash, dejándolo listo en el portapapeles para ser pegado directamente en el chat del agente Antigravity.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-08] - Corrección de Permisos en Colección de Empleados para Portales Operativos
* **Tipo:** Bugfix / Seguridad / Base de Datos
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [DEPLOY] — Modificación de la regla de acceso de lectura de `/employees/{employeeId}` de `allow read: if isAdmin()` a `allow read: if true`.
* **Causa Raíz:**
  - El sistema de portales operativos y la vista de login `/portal/auth` no cargaban la lista de empleados activos de la tienda, resultando en un fallo silencioso o bloqueo. Esto ocurría porque las reglas de seguridad en Firestore bloqueaban la lectura pública de la colección `/employees`, limitándola a administradores autenticados (`isAdmin()`). Dado que los terminales y empleados operan en sesiones de PIN sin credenciales de Firebase Auth admin, no podían resolver la suscripción.
* **Solución Técnica:**
  - Se habilitó la lectura pública (`allow read: if true`) sobre la colección de empleados para que la app cliente y los guards de sesión puedan listar los empleados activos, resolver su inicio de sesión, y comprobar el PIN de forma segura.
* **Estatus:** ✅ Completado y desplegado con éxito a Firestore.

### [2026-06-07] - Historial de Aprovisionamientos con Archivador y Paginación Fluida en Onboarding
* **Tipo:** Feature / UI-UX / Paginación / Gestión de Clientes
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/ui/Pagination.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/ui/Pagination.jsx) [NEW] — Creación del componente modular de paginación fluida stateless de la biblioteca con soporte para la opción `showAlways` (para forzar la visibilidad del paginador aun con una sola página activa).
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY] — Importación e integración de `Pagination`. Definición de las variables calculadas de rebanadas de datos (`activeProvisionings` y `paginatedProvisionings`) y del estado `historyPage`. Adición del manejador `handleArchiveClient` para archivar instancias en Firestore central (`archived: true`). Integración de la sección "Historial de Aprovisionamientos" debajo de la tarjeta del asistente de onboarding. **Optimización Móvil**: Se bifurcó la UI de listado usando clases responsivas de Tailwind CSS (`hidden md:table` y `md:hidden`), implementando una vista móvil premium en base a tarjetas con avatares HSL y botones optimizados para pantallas táctiles.
* **Causa Raíz:**
  - El usuario solicitó agregar un listado o historial de los aprovisionamientos anteriores justo debajo de la tarjeta de inicio del asistente de aprovisionamiento en la pestaña "Nuevo Cliente".
  - Pidió que cada fila cuente con un botón para "Archivar" que remueva visualmente el registro del listado (actualizando la base central) y que el historial se pagine a un máximo de 10 elementos utilizando el componente de paginación modular de la biblioteca, forzando la visualización del paginador en todo momento.
  - Se identificó además que la tabla clásica de aprovisionamientos generaba desbordamiento horizontal y problemas de adaptabilidad visual en la versión móvil, requiriendo un diseño responsive especializado.
* **Solución Técnica:**
  - Se modularizó el componente de paginación fluida en `src/components/ui/Pagination.jsx` basado en la ficha técnica de la biblioteca y se parametrizó la prop `showAlways` para evitar el ocultamiento automático cuando hay menos de 10 elementos.
  - Se diseñó e implementó un grid de tabla responsivo y de alta legibilidad para el historial que consume `clientesSaas` filtrado (excluyendo los que tienen `archived === true`), paginado a 10 elementos en base a `historyPage`.
  - Se implementó la acción `handleArchiveClient` que realiza una consulta asíncrona a la colección centralizada `clientes_control` de Firestore para actualizar el documento y establecer `archived: true`.
  - Para resolver el desbordamiento en teléfonos inteligentes, se implementó una interfaz móvil de tarjetas estilizadas dividida por bordes suaves (`divide-[var(--color-border)]`) que muestra el avatar circular con las iniciales del cliente, la vertical/niche como tag flotante, el costo y la facturación DIAN, reduciendo los botones a tamaño táctil adecuado (`px-2.5 py-1 text-[9px]`).
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-07] - Rediseño de Navegación Móvil y Reubicación de CRM y Ajustes
* **Tipo:** Refactorización / UI-UX / Navegación
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY] — Reducción de `NAV_TABS` a 5 pestañas principales, reordenadas para ubicar a 'onboarding' (Nuevo) en el centro exacto. Redirección del click sobre la tarjeta "Clientes Activos" en Dashboard para cambiar a la pestaña de CRM. Integración del botón de acceso a Ajustes del Sistema dentro del modal de Perfil del Administrador. Inyección de la clase `onboarding-center-btn` en el botón central.
  - [`d:/Aplicaciones/dev-dashboard/src/index.css`](file:///d:/Aplicaciones/dev-dashboard/src/index.css) [MODIFY] — Adición de las clases y keyframes `center-float` (con oscilación vertical de 3px) y `center-pulse-glow` (neon HSL) para el botón flotante central de la barra de navegación móvil, y del efecto de hover premium `onboarding-center-btn` para escalar el botón a 1.15x con rotación interactiva.
* **Causa Raíz:**
  - El usuario solicitó simplificar la navegación en la versión móvil a exactamente 5 botones en un orden específico, eliminando el botón de CRM y de Ajustes de la barra de navegación. Pidió que el CRM se abra desde la tarjeta de "Clientes Activos" en el Inicio y que el botón de Ajustes esté dentro del modal de Perfil.
  - Adicionalmente, solicitó mover el botón "Nuevo" al centro de la barra inferior de navegación móvil, dándole un diseño circular que sobresale verticalmente con un efecto neón y animación continua de flotación y glow, además de un efecto premium interactivo al hacer hover.
* **Solución Técnica:**
  - Se modificó la constante de navegación `NAV_TABS` para excluir `crm` y `settings`, situando a `onboarding` en la posición central de las 5 tabs.
  - Se actualizó el evento click de la tarjeta "Clientes Activos" para establecer `activeTab` en `'crm'`.
  - Se añadió un botón estilizado premium de "Ajustes del Sistema" dentro del modal de Perfil (`isProfileModalOpen`) que cierra el modal y activa la pestaña `'settings'`.
  - Se implementó un layout especial en la barra inferior móvil para el botón central, posicionándolo elásticamente a `-mt-3.5` e inyectándole las animaciones continuas de flotación y brillo neón, además de la clase `.onboarding-center-btn` de CSS que proporciona una transición spring a escala 1.15x con incremento de glow y rotación sutil al hacer hover.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-07] - Renombrado de la Colección Central de Control de Clientes (Remoción Total de Referencias SaaS)
* **Tipo:** Refactorización / Base de Datos / Seguridad / Consistencia
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY] — Reemplazo de las referencias de consulta y escucha de `clientes_control` por la nueva colección estandarizada `clientes_control`.
  - [`d:/Aplicaciones/dev-dashboard/firestore.rules`](file:///d:/Aplicaciones/dev-dashboard/firestore.rules) [DEPLOY] — Actualización de la regla de seguridad de la colección de control de clientes, cambiando el match `/clientes_control/{clientId}` por `/clientes_control/{clientId}` y desplegando los cambios a Firestore Central (`prototipe-ecosistema-control`).
  - [`d:/Aplicaciones/App Ventas/src/services/billingService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/billingService.js) [MODIFY] — Reconfigurada la referencia de consulta central a la colección `clientes_control`.
  - [`d:/Aplicaciones/Prototipe-CLI/templates/template-core-seed/src/services/billingService.js`](file:///d:/Aplicaciones/Prototipe-CLI/templates/template-core-seed/src/services/billingService.js) [MODIFY] — Actualizadas las referencias de la colección comisional de control en la plantilla base.
  - [`d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/src/services/billingService.js`](file:///d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/src/services/billingService.js) [MODIFY] — Actualizadas las referencias de la colección comisional de control en la plantilla de ventas.
* **Causa Raíz:**
  - El usuario eliminó manualmente la colección original `clientes_control` de Firestore y solicitó modificar todas las referencias en el código para que se cree con otro nombre que no contenga "SaaS" (se seleccionó `clientes_control`), alineándose con el hecho de que el ecosistema no es una plataforma SaaS tradicional sino un motor multi-instancia personalizado.
* **Solución Técnica:**
  - Sustitución masiva de `clientes_control` por `clientes_control` en el código de control del dev-dashboard, servicios de telemetría y facturación de la App Ventas y plantillas base del CLI.
  - Despliegue de seguridad de base de datos actualizando las reglas en la nube para mapear la nueva ruta `/clientes_control/`.
* **Estatus:** ✅ Completado y verificado con compilación y despliegue exitosos de reglas.

### [2026-06-07] - Integración de Reporte de Errores y Excepciones Reales a Consola Central
* **Tipo:** Feature / Telemetría / Firebase / Estabilidad / Control de Calidad
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/services/telemetryService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/telemetryService.js) [MODIFY] — Adición de la función `reportAppFailureToDeveloper` que inyecta asíncronamente reportes de fallos en la colección centralizada `app_failures` de Firestore Central, incluyendo el ID único del cliente y metadatos detallados.
  - [`d:/Aplicaciones/App Ventas/src/App.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/App.jsx) [MODIFY] — Configurado un listener global para `error` (excepciones no controladas) y `unhandledrejection` (promesas fallidas sin catch) en el arranque, y modificado el callback `onError` de React `ErrorBoundary` para invocar de forma automática y transparente el reporte a la base de datos central.
  - [`d:/Aplicaciones/App Ventas/src/components/admin/settings/DeveloperDiagnosticsModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/settings/DeveloperDiagnosticsModal.jsx) [MODIFY] — Añadido el botón "Reportar Error Prueba" en la pestaña de pings del modal de diagnóstico de desarrollo.
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY] — Añadido el módulo "Reportar Error de Prueba" en las opciones de desarrollo generales y su vista detallada para enviar fallos de prueba en caliente.
  - [`d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx) [MODIFY] — Propagados los cambios de las opciones de desarrollo y la subsección de envío de errores de prueba a la plantilla base del CLI.
  - [`d:/Aplicaciones/dev-dashboard/firestore.rules`](file:///d:/Aplicaciones/dev-dashboard/firestore.rules) [DEPLOY] — Desplegadas las reglas de seguridad actualizadas de Firestore al proyecto de control central (`prototipe-ecosistema-control`), habilitando los permisos de lectura y escritura para usuarios administradores autenticados sobre la colección `app_failures`.
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY] — Modificada la suscripción en tiempo real de `app_failures` para mapear los `clientId` activos de los fallos detectados y mostrarlos explícitamente en la terminal del monitor de telemetría. Además, se hizo interactivo el listado de logs en la UI (sidebar y consola principal) para que al hacer click en un log de tipo error, redirija automáticamente al usuario a la pestaña de monitoreo de fallas (`setActiveTab('errors')`).
* **Causa Raíz:**
  - El usuario deseaba capturar excepciones y fallos reales que ocurrieran en las aplicaciones cliente en producción para visualizarlos de forma unificada en el panel del desarrollador, y solicitó agregar una opción específica en la UI del menú de desarrollo de la app para reportar errores de prueba a Firestore Central.
  - Además, el dev-dashboard mostraba un fallo de permisos insuficientes (`FirebaseError: Missing or insufficient permissions`) al intentar escuchar los documentos de la colección `app_failures` en tiempo real desde Firestore Central.
  - Por último, el mensaje del log de telemetría en el dashboard no especificaba qué cliente/app en particular había reportado los fallos activos, y el usuario solicitó la capacidad de hacer clic sobre dicho mensaje para ser redirigido directamente a la pestaña de gestión de errores.
* **Solución Técnica:**
  - Inyección del nuevo sub-módulo interactivo `dev-reporte-error` en las opciones de desarrollo de `AdminSettings.jsx` tanto del cliente como del CLI, conectando un botón premium a la carga asíncrona de `telemetryService`.
  - Despliegue en la nube de las reglas de seguridad en `firestore.rules` del proyecto central (`prototipe-ecosistema-control`), otorgando permisos de lectura y escritura (`allow read, write: if request.auth != null`) a los desarrolladores autenticados en el dashboard y creación libre (`allow create: if true`) para que las aplicaciones cliente informen fallos.
  - Extracción y mapeo dinámico de los `clientId` únicos en la suscripción de `App.jsx` del dashboard, imprimiendo explícitamente la lista de clientes afectados `[clientId1, clientId2]` en la consola de telemetría en tiempo real.
  - Vinculación del handler `onClick={() => setActiveTab('errors')}` en los renders de tarjetas de log en el panel de telemetría del dashboard cuando el tipo es `error`, aplicando estilos `cursor-pointer` y micro-transacciones hover elásticas.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-07] - Corrección de Bloqueo en Búsqueda y Registro Offline de Clientes en POS Y Sincronización
* **Tipo:** Bugfix / Resiliencia / Offline-First / POS / Sincronización
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/services/userService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/userService.js) [MODIFY] — Adición de `getAllClients` para consultar la colección central y optimización de `getClientByPhone` para incluir un timeout de 800ms con fallback a `getDocFromCache` si falla la red.
  - [`d:/Aplicaciones/App Ventas/src/services/offlineDB.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/offlineDB.js) [MODIFY] — Adición de `saveOfflineClients` para almacenar clientes en lote en la base IndexedDB local.
  - [`d:/Aplicaciones/App Ventas/src/services/orderService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/orderService.js) [MODIFY] — Implementado ciclo de auto-reintentos asíncrono con retraso de 5 segundos en `syncOfflineSales` si falla la reconexión de red de Firestore.
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSales.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSales.jsx) [MODIFY] — Desacoplamiento de la promesa `saveClientProfile` para ejecutarse de forma asíncrona sin bloquear la UI local. Adición de `useEffect` de sincronización inicial en segundo plano de todos los clientes de Firestore a la IndexedDB local.
  - [`d:/Aplicaciones/App Ventas/src/pages/portal/PortalVendedor.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY] — Integración del fallback de IndexedDB, sincronización/descarga inicial de clientes al cargar y registro no-bloqueante.
  - [`d:/Aplicaciones/App Ventas/src/App.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/App.jsx) [MODIFY] — Agregado retraso (debounce) de 1500ms al detectar red para sincronizar las ventas offline, dando margen a Firestore para reabrir sus streams de datos.
* **Causa Raíz:**
  - Al simular modo sin internet, si el navegador aún no detecta el evento offline (`isOnline` es true) y se digita un número de celular de un cliente no registrado, el POS se congelaba en el botón "Registrar Cliente" debido a un `await` síncrono que quedaba suspendido por falta de conexión.
  - Además, si un cliente ya estaba registrado en Firestore, al pasar a offline no podía ser detectado en el POS porque no existía una copia local de los clientes en IndexedDB, forzando al cajero a registrarlo de nuevo.
  - Por último, la sincronización offline fallaba silenciosamente tras recuperar la red debido a que Firestore tarda un par de segundos en levantar sus sockets tras el evento `online` del navegador.
* **Solución Técnica:**
  - Evitar el bloqueo de la UI liberando el `await` en `saveClientProfile` (Firestore lo sincroniza en background).
  - Implementación de pre-caching masivo al iniciar sesión en el POS: cuando el usuario está online, descarga la lista completa de clientes registrados de Firestore y los persiste en la IndexedDB local (`saveOfflineClients`). De esta manera, si la app se desconecta, la búsqueda por celular encontrará al cliente instantáneamente de forma local.
  - Añadido un debounce de 1.5s y un ciclo de auto-reintentos cada 5s en la sincronización offline de ventas para mitigar la latencia de reconexión de sockets de Firebase.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-07] - Implementación de Capacidades Offline-First en POS (Ventas Directas)
* **Tipo:** Feature / Arquitectura / Offline / POS / PWA
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/config/firebaseConfig.js`](file:///d:/Aplicaciones/App%20Ventas/src/config/firebaseConfig.js) [MODIFY] — Habilitación del caché persistente de Firestore en IndexedDB para persistencia de datos multi-pestaña.
  - [`d:/Aplicaciones/App Ventas/src/store/connectivityStore.js`](file:///d:/Aplicaciones/App%20Ventas/src/store/connectivityStore.js) [NEW] — Creación del store Zustand para el control global y reactivo de conectividad online/offline.
  - [`d:/Aplicaciones/App Ventas/src/services/offlineDB.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/offlineDB.js) [NEW] — Creación de la base de datos IndexedDB local para almacenar productos, categorías, clientes y cola de ventas offline.
  - [`d:/Aplicaciones/App Ventas/src/services/orderService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/orderService.js) [MODIFY] — Implementación de la función asíncrona `syncOfflineSales` para la sincronización automática de la cola offline.
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSales.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSales.jsx) [MODIFY] — Integración del control offline en el flujo de ventas, permitiendo guardar ventas en IndexedDB, deducir stock local, gestionar la búsqueda y registro local de clientes offline en IndexedDB y agregar un indicador offline de recibo.
  - [`d:/Aplicaciones/App Ventas/src/App.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/App.jsx) [MODIFY] — Inyección del listener global de reconexión y sincronización automática.
* **Causa Raíz:**
  - El usuario reportó que al estar offline no podía realizar ventas porque la UI del POS se bloqueaba en el spinner de "searching" al digitar el número de celular del cliente (debido a que la API de Firestore online `getDoc` quedaba en espera de red).
* **Solución Técnica:**
  - Creación de un almacén local `clients` en la IndexedDB de `offlineDB.js`.
  - Modificación de `performSearch` y `handleRegisterClient` en `AdminSales.jsx` para interceptar la pérdida de red. Si está offline, consulta directamente en IndexedDB de forma local y, si no se encuentra, permite al cajero ingresar el nombre del cliente y guardarlo de inmediato de manera local (IndexedDB) para completar la venta. Si está online, actualiza la copia de la base de datos local al mismo tiempo.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-07] - Elaboración del Informe de Investigación de Mercado y Estrategia de Negocio PROTOTIPE 2026
* **Tipo:** Investigación / Estrategia / Ecosistema / Documentación
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/09_Plan_Escalabilidad_Negocio/informe_investigacion_ecosistema_2026.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Plan_Escalabilidad_Negocio/informe_investigacion_ecosistema_2026.md) [MODIFY] — Redacción de un reporte exhaustivo, detallado y profesional que analiza el ADN comercial de PROTOTIPE, su arquitectura de sharding, el pipeline local REST del CLI, el sistema de verticalización con `niche.json`, y los flujos de telemetría de cobros (`telemetryService` / `billingService`).
  - [`D:/PROTOTIPE/Prototype 2.0 Arquitectura/Documentacion PROTOTIPE/09_Plan_Escalabilidad_Negocio/informe_investigacion_ecosistema_2026.md`](file:///D:/PROTOTIPE/Prototype%202.0%20Arquitectura/Documentacion%20PROTOTIPE/09_Plan_Escalabilidad_Negocio/informe_investigacion_ecosistema_2026.md) [MODIFY] — Sincronización del reporte en el directorio de respaldo de arquitectura oficial del proyecto.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY] — Registro de la Tarea 240 como completada en la lista de tareas principal.
  - [`D:/PROTOTIPE/Prototype 2.0 Arquitectura/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Prototype%202.0%20Arquitectura/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY] — Registro de la Tarea 240 como completada en el listado de respaldo.
* **Causa Raíz:**
  - El usuario solicitó expandir el informe de mercado para alinearlo al 100% con el contexto del proyecto y evitar descripciones genéricas basadas en SaaS tradicionales, convirtiéndolo en un reporte exhaustivo y profesional.
* **Solución Técnica:**
  - Integración de los datos actualizados de competidores en Colombia (Siigo, Alegra, Treinta, Bold, Wompi, Mercado Pago), detallando planes y tarifas.
  - Inclusión de las resoluciones de la DIAN para 2026 (fin del límite de 5 UVT y reglas de captura de datos) y análisis del costo de folios con proveedores tecnológicos (Alanube, Plemsi).
  - Incorporación de los sesgos cognitivos aplicados a la conversión del checkout de la aplicación y un análisis DOFA/FODA adaptado a la arquitectura de sharding Firebase y el orquestador distribuido.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-07] - Automatización de Aprovisionamiento Firebase y Credenciales de Administrador en un Clic
* **Tipo:** Feature / Ecosistema / Firebase / Automatización / UI-UX
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY] — Adición del switch de Aprovisionamiento Firebase Automático en el Server Tab del Onboarding Wizard, ocultando los campos de configuración manual. Inyección de las credenciales de administrador autogeneradas en el modal final de Onboarding.
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY] — Modificación del flujo de sembrado (seeding) de Firebase para que ejecute `seed_brand.js` si existe en la carpeta `scratch/` sin depender del archivo local `firebase-service-account.json` (gracias al uso del SDK de Firebase cliente).
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/scratch/seed_brand.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/scratch/seed_brand.js) [MODIFY] — Reemplazo del script de siembra antiguo basado en `firebase-admin` por el nuevo script basado en SDK cliente (idéntico al de App Ventas) que soporta autenticación/creación dinámica del Administrador.
* **Causa Raíz:**
  - El usuario solicitó automatizar la creación de proyectos y credenciales en un solo paso desde el portal del desarrollador, eliminando el paso manual del checklist.
* **Solución Técnica:**
  - Integración del flag `autoProvisionFirebase` en el payload del CLI, actualización del enrutador de creación física de proyectos en el generador local para usar el SDK cliente para el sembrado directo de datos de Firestore y Auth, y visualización de la cuenta de administrador final (`admin@${clientId}.com` / `Admin2026!`) en la tarjeta de onboarding.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-07] - Higienización y Remoción de Referencias SaaS del Ecosistema
* **Tipo:** Estandarización / Refactorización / Consistencia
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY] — Reemplazo de etiquetas SaaS en logs y descripciones visuales.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/FacturacionComisionalSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/FacturacionComisionalSandbox.jsx) [MODIFY] — Actualización de textos informativos sobre la facturación de instancias.
  - [`d:/Aplicaciones/dev-dashboard/firestore.rules`](file:///d:/Aplicaciones/dev-dashboard/firestore.rules) [MODIFY] — Limpieza de comentarios que contenían SaaS.
  - [`d:/Aplicaciones/App Ventas/Colecciones/colecciones.md`](file:///d:/Aplicaciones/App%20Ventas/Colecciones/colecciones.md) [MODIFY] — Modificación de descripción de metas por personalización de instancias.
  - [`d:/Aplicaciones/App Ventas/scratch/briefing_cliente_template.md`](file:///d:/Aplicaciones/App%20Ventas/scratch/briefing_cliente_template.md) [MODIFY] — Corrección del título del cuestionario.
  - [`d:/Aplicaciones/App Ventas/scratch/seed_brand.js`](file:///d:/Aplicaciones/App%20Ventas/scratch/seed_brand.js) [MODIFY] — Actualización de comentarios del script de siembra.
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY] — Ajuste de etiquetas visuales en los paneles de facturación.
  - [`d:/Aplicaciones/Prototipe-CLI/templates/template-core-seed/vite.config.js`](file:///d:/Aplicaciones/Prototipe-CLI/templates/template-core-seed/vite.config.js) [MODIFY] — Actualización de la descripción en el manifest de la PWA.
  - [`d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/Colecciones/colecciones.md`](file:///d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/Colecciones/colecciones.md) [MODIFY] — Modificación de descripción de metas en colecciones de la plantilla.
  - [`d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/scratch/briefing_cliente_template.md`](file:///d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/scratch/briefing_cliente_template.md) [MODIFY] — Corrección del título del cuestionario en la plantilla.
  - [`d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/scratch/seed_brand.js`](file:///d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/scratch/seed_brand.js) [MODIFY] — Ajuste de comentarios y feature flags.
  - [`d:/Aplicaciones/Prototipe-CLI/generator.js`](file:///d:/Aplicaciones/Prototipe-CLI/generator.js) [MODIFY] — Saneamiento de variables de entorno inyectadas, tags SEO, comentarios y corrección del enlace al renombrado Informe de Investigación del Ecosistema.
  - [`d:/Aplicaciones/Prototipe-CLI/package.json`](file:///d:/Aplicaciones/Prototipe-CLI/package.json) [MODIFY] — Actualización de la descripción general del orquestador.
* **Causa Raíz:**
  - Desacoplar por completo el término "SaaS" (marca genérica) para alinear la plataforma al concepto del motor multi-instancia de marca blanca "PROTOTIPE".
* **Solución Técnica:**
  - Limpieza de referencias literales en strings de UI, logs, comentarios de desarrollo, palabras clave de SEO y descripciones de plantillas.
  - Sincronización de las reglas de desarrollo (`GEMINI.md`) y verificación de compilación exitosa.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-07] - Auditoría del Sistema de Aprovisionamiento CLI y API Bridge (Tarea 237)
* **Tipo:** Auditoría / Documentación / Ecosistema / CLI
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/AUDITORIA_CLI_PROTOTIPE.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/AUDITORIA_CLI_PROTOTIPE.md) [NEW] — Creación del informe de auditoría técnica sobre cli.js, generator.js y server.js.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Indexado el reporte de auditoría en el mapa semántico.
* **Causa Raíz:**
  - El usuario requería una auditoría exclusiva y profunda de la lógica de aprovisionamiento del CLI, identificando qué flujos están implementados, parciales, no existentes, y la brecha técnica para lograr un aprovisionamiento de un solo clic.
* **Solución Técnica:**
  - Inspección exhaustiva de cli.js, generator.js y server.js de Prototipe-CLI sin modificar su código.
  - Elaboración y guardado del informe detallando dependencias de Firebase Console, Firebase CLI interactivo, GitHub, automatización real (60-65%) y los pasos de integración de la Firebase Management REST API.
* **Estatus:** ✅ Completado.

### [2026-06-07] - Implementación del Motor de Expansión Cognitiva y Atributos Dinámicos por Nicho (Tarea 236)
* **Tipo:** Feature / Ecosistema / IA / Multi-tenant / Nichos
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — Integración del Cognitive Prompt Expansion Engine REST call (Gemini 2.5 Flash) y cargador de .env manual.
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY] — Generación física de metadatos `niche.json` e inyección de prompt expandido en el bootstrapping.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ClientCatalog.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ClientCatalog.jsx) [MODIFY] — Consumo dinámico de `niche.json` para ocultar selectores de ropa (sizes/colors) en otros nichos.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ProductDetailPage.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY] — Renderizado adaptativo de atributos técnicos y ocultación de selectores rígidos.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalVendedor.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY] — Guardado y selección de variantes adaptado a los flags y filtros de `niche.json`.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/config/niche.json`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/config/niche.json) [NEW] — Creación del archivo de configuración fallback de nicho.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/config/niche.json`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/config/niche.json) [NEW] — Creación del archivo de configuración fallback de nicho.
* **Causa Raíz:**
  - Evitar el acoplamiento rígido a la vertical textil en nichos de servicios técnicos/talleres y potenciar la precisión de los prompts iniciales generados en el Dashboard mediante IA.
* **Solución Técnica:**
  - Creación de un endpoint REST intermedio que intercepta los requerimientos, los expande a una especificación técnica impecable mediante Gemini REST API y desacopla la UI de cliente y POS consumiendo `niche.json`.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-07] - Auditoría Técnica de Aplicación y Evaluación CLI de Verduras Juan Remigio
* **Tipo:** Auditoría / Documentación / Estandarización
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditorias/auditoria_verduras_juan_remigio.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditorias/auditoria_verduras_juan_remigio.md) [NEW] — Reporte completo de auditoría y análisis crítico de la automatización del CLI de Prototipe.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Indexado el reporte de auditoría en el mapa semántico.
* **Causa Raíz:**
  - El usuario requería una auditoría profunda de la aplicación Verduras Juan Remigio e identificar las debilidades del proceso de seeding de marca blanca.
* **Solución Técnica:**
  - Inspección de navegación, componentes UI, y portales operacionales, seguido de la estructuración de la crítica técnica para optimizar el CLI de aprovisionamiento.
* **Estatus:** ✅ Completado.

### [2026-06-07] - Comportamiento de Acordeón Colapsable Exclusivo en Biblioteca
* **Tipo:** Refactorización / UI/UX / Visor de Biblioteca
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY] — Modificada la lógica de estados de expansión para colapsar categorías anteriores al abrir una nueva y ocultarlas todas por defecto al entrar.
* **Causa Raíz:**
  - El usuario deseaba una interfaz de biblioteca más limpia donde todas las categorías iniciaran colapsadas y abrir una categoría cerrara automáticamente la que estuviera abierta previamente (comportamiento de acordeón exclusivo).
* **Solución Técnica:**
  - Se cambió el estado de objeto de estados booleanos `expandedCats` a un string simple `expandedCat` que almacena únicamente la categoría activa.
  - Se eliminó el `useEffect` de auto-expansión automática al iniciar/cambiar componente para garantizar que no se abran categorías sin acción explícita del usuario o una búsqueda activa.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-06] - Corrección de Mapeo de Modal Base Premium en ComponentSandbox
* **Tipo:** Bugfix / UI/UX / Sandbox
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Corregido el mapeo clave de "Modal Base Premium" para resolver a `modal_template` en lugar de `modal_confirmacion`.
* **Causa Raíz:**
  - El string `'modal base premium'` estaba apuntando de forma errónea a `'modal_confirmacion'` en el mapeador `COMPONENT_SANDBOX_MAP`, ocasionando que al seleccionar el componente Modal Base Premium se renderizara el playground del Modal de Confirmación.
* **Solución Técnica:**
  - Se redirigieron los mappings de `'modal base premium'`, `'modal base premium (portals & scroll lock)'`, `'modal_base'` y `'modal base'` hacia `'modal_template'`.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-06] - Extracción, Refactorización e Integración en Sandbox de 5 Componentes de Interfaz Core
* **Tipo:** Extracción / Refactorización / Componentes / Sandbox / Documentación
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/CurrencyInput/currency_input.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/CurrencyInput/currency_input.md) [NEW] — Documentación y especificación técnica de CurrencyInput con variables HSL.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Modales/ModalTemplate/modal_template.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Modales/ModalTemplate/modal_template.md) [NEW] — Documentación y especificación técnica de ModalTemplate con variables HSL.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/DatePicker/date_picker.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/DatePicker/date_picker.md) [NEW] — Documentación y especificación técnica de DatePicker con variables HSL.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/ConnectivityToast/connectivity_toast.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/ConnectivityToast/connectivity_toast.md) [NEW] — Documentación y especificación técnica de ConnectivityToast con variables HSL.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/QuantitySelector/quantity_selector.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/QuantitySelector/quantity_selector.md) [NEW] — Documentación y especificación técnica de QuantitySelector con variables HSL.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY] — Indexado y registro de los 5 componentes bajo sus categorías respectivas.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/CurrencyInputSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/CurrencyInputSandbox.jsx) [NEW] — Sandbox independiente para CurrencyInput.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/ModalTemplateSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/ModalTemplateSandbox.jsx) [NEW] — Sandbox independiente para ModalTemplate.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/DatePickerSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/DatePickerSandbox.jsx) [NEW] — Sandbox independiente para DatePicker.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/ConnectivityToastSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/ConnectivityToastSandbox.jsx) [NEW] — Sandbox independiente para ConnectivityToast.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/QuantitySelectorSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/QuantitySelectorSandbox.jsx) [NEW] — Sandbox independiente para QuantitySelector.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Registro e integración mediante carga perezosa de los 5 sandboxes creados.
* **Causa Raíz:**
  - Extraer, desacoplar y documentar los componentes core solicitados de la aplicación de ventas para enriquecer el catálogo central marca blanca reutilizable de PROTOTIPE.
* **Solución Técnica:**
  - **CurrencyInput:** Formateador de moneda dinámico nativo que maneja separadores de miles y signo de peso en tiempo real, aislando la lógica de negocio.
  - **ModalTemplate:** Envoltura con React Portals, soporte de scroll-lock en el viewport y transiciones de Framer Motion.
  - **DatePicker:** Selector de fecha autocontenido con navegación fluida, portal de React y atajos.
  - **ConnectivityToast:** Alertas flotantes elásticas animadas con detectores nativos de conectividad `offline`/`online`.
  - **QuantitySelector:** Controles reactivos de incremento y decremento con límites de stock e inputs manuales controlados.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Extracción y Desacoplamiento de pdfService, LeafletMapPicker y deliveryService (Tarea 234)
* **Tipo:** Extracción / Desacoplamiento / Componentes / Documentación
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Exportador_PDF/pdf_service.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Exportador_PDF/pdf_service.md) [MODIFY] — Refactorización a versión genérica parametrizada de `pdfService` y documentación completa.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Mapa_Interactivo/mapa_interactivo.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Mapa_Interactivo/mapa_interactivo.md) [MODIFY] — Refactorización con clases de estilos inyectables de `LeafletMapPicker` y documentación completa.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Servicios_y_Firebase/Gestion_Domicilios/gestion_domicilios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Servicios_y_Firebase/Gestion_Domicilios/gestion_domicilios.md) [NEW] — Documentación y código desacoplado inicializable (`initDeliveryService`) para `deliveryService`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY] — Registro e indexación de los tres componentes bajo sus respectivas categorías.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Registro de los metadatos en `COMPONENT_META` para indicar que son utilidades/componentes complejos que no se simulan visualmente de forma directa.
* **Causa Raíz:**
  - Desacoplar, estructurar y documentar servicios clave y componentes complejos de App Ventas para convertirlos en módulos portables marca blanca integrados en el dashboard de control.
* **Solución Técnica:**
  - **pdfService:** Eliminación de importaciones directas de constantes y stores de App Ventas, parametrizando formatters y flags.
  - **LeafletMapPicker:** Parametrización del styling con un objeto `themeClasses` para marca blanca y desacoplamiento de clases rígidas del tema.
  - **deliveryService:** Implementación del patrón de inicialización dinámica (`initDeliveryService`) para inyectar la instancia de Firestore y mapeo de colecciones.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Reporte de Análisis de Extractibilidad de App Ventas
* **Tipo:** Auditoría / Documentación / Faro Core
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/analisis_extractibilidad_app_ventas.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/analisis_extractibilidad_app_ventas.md) [NEW] — Creación del informe de auditoría técnica estructurado con puntajes de 1 a 10 de viabilidad y segmentación entre MANDATORY y FORBIDDEN extraction.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Registro e indexación del nuevo informe de auditoría.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY] — Registro de la Tarea 233 de auditoría como completada en el roadmap general.
* **Causa Raíz:**
  - Solicitud de auditoría para identificar y documentar candidatos de extracción en App Ventas para la biblioteca compartida central de PROTOTIPE.
* **Solución Técnica:**
  - Análisis manual minucioso de componentes, hooks y servicios sin modificar código fuente.
  - Clasificación de 14 componentes y servicios de extracción obligatoria (marca blanca, inyectable, genéricos) y 6 módulos/hooks de extracción prohibida (acoplados al negocio de venta de ropa y calzado).
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Plan de Extracción de los 8 Componentes y Servicios Clave de App Ventas
* **Tipo:** Planeación / Documentación / Biblioteca
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/plan_extraccion_componentes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/plan_extraccion_componentes.md) [NEW] — Elaboración del plan de extracción para desacoplar y catalogar los 8 módulos seleccionados (CurrencyInput, ModalTemplate, DatePicker, ConnectivityToast, QuantitySelector, pdfService, LeafletMapPicker, deliveryService).
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Indexado el plan de extracción en el mapa de documentación semántica.
* **Causa Raíz:**
  - El usuario solicitó formalizar el plan de extracción de los 8 componentes recomendados para poder proceder a su catalogación física de forma limpia y estructurada.
* **Solución Técnica:**
  - Diseño de la pauta de migración de cada componente con especificación de adaptaciones técnicas, variables CSS HSL e independización de referencias de Firestore.
* **Estatus:** ✅ Completado.

### [2026-06-06] - Rediseño del Layout de Métricas y Corrección de Desbordes en CajaDiariaPOS (Sandbox y Biblioteca)
* **Tipo:** Bugfix / UI/UX / Sandbox / Documentación / Responsivo
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/CajaDiariaPOSSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/CajaDiariaPOSSandbox.jsx) [MODIFY] — Rediseñado el grid de métricas de 4 columnas a una cuadrícula de 2x2 altamente responsiva y limpia, integrando iconos semánticos con micro-contenedores HSL suaves y limitando el ancho. Se modificó el encabezado del turno para apilarse en vertical en viewports angostos (`flex-col sm:flex-row`).
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Caja_Diaria_POS/caja_diaria_pos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Caja_Diaria_POS/caja_diaria_pos.md) [MODIFY] — Sincronizado el código React de referencia del componente para implementar las mismas optimizaciones visuales y de diseño responsivo de la cuadrícula de métricas.
* **Causa Raíz:**
  - El diseño anterior de 4 columnas horizontales fijas aplastaba y desestructuraba el texto de la moneda (ej. "COP") y el monto del saldo (ej. "200.000") en múltiples saltos de línea toscos cuando el componente se renderizaba en contenedores angostos o pantallas pequeñas.
* **Solución Técnica:**
  - Reestructuración de la distribución a una rejilla de `grid-cols-2 gap-3` para mayor amplitud de renderizado por celda.
  - Inyección de micro-ilustraciones SVG para cada categoría (billetera, calculadora, entrada y salida de efectivo) y alineamiento flex-row.
  - Sincronización idéntica en el catálogo físico markdown y comprobación de compilación del bundle.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Reversión de BreadcrumbHeaderSandbox, Corrección de Crash en ErrorBoundary y Directivas de Diseño
* **Tipo:** Revert / Bugfix / UI/UX / Sandbox / Directivas IA
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/BreadcrumbHeaderSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/BreadcrumbHeaderSandbox.jsx) [MODIFY] — Revertido el sandbox para regresar al diseño premium minimalista original (miga de pan simulada de E-commerce, barra superior administrativa, y acciones de Guardar/Eliminar), eliminando la sobrecarga innecesaria de selectores y listas de calzado/talleres.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/ErrorBoundaryFallbackSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/ErrorBoundaryFallbackSandbox.jsx) [MODIFY] — Reemplazada la simulación del disparador de error (el hook de eventos en window) por un componente de clase de React `ErrorBoundaryFallback` real. Esto evita el crash fatal de renderizado que dejaba la pantalla en blanco en caliente al forzar el error de React 19.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY] — Añadida directiva crítica que obliga a la IA a implementar interfaces y layouts con un diseño visual de primer nivel, moderno y con colores/sombras/animaciones suaves HSL desde la primera versión, evitando layouts "genéricos" o aburridos tipo ERP.
* **Causa Raíz:**
  - El usuario deseaba conservar el diseño minimalista de la primera corrección que le gustó en el Breadcrumb, eliminando la sobrecarga de datos de verticalización.
  - El sandbox de error intentaba capturar un error de la fase de renderizado de React mediante un event listener global de window. En React 19, los errores de renderizado rompen el árbol de forma fatal y causan una pantalla en blanco antes de que el evento global se capture adecuadamente en la consola, requiriendo un componente `ErrorBoundary` de clase real.
  - Se requiere evitar de raíz que la IA cree componentes genéricos y planos en primera instancia.
* **Solución Técnica:**
  - Se reescribió `BreadcrumbHeaderSandbox.jsx` para inyectar una versión autocontenida de `BreadcrumbHeader` libre de dependencias de importación rotas y maquetar los botones premium.
  - Se integró la clase de control `ErrorBoundaryFallback` directamente en el sandbox para envolver al componente con fallas y resolver el ciclo de vida React.
  - Sincronización en cascada de `GEMINI.md` en los 5 repositorios del disco y compilación de producción con Vite.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Corrección Estética y de Contraste en Sandboxes (AuthGuard & UserProfile y GlobalSkeletonLoader)
* **Tipo:** Bugfix / UI/UX / Sandbox / Accesibilidad
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/AuthGuardUserProfileSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/AuthGuardUserProfileSandbox.jsx) [MODIFY] — Rediseñado el estado de "Acceso Concedido" inyectando un widget POS completo con mini-KPIs de ventas hoy, pedidos y detalles de transacciones recientes. Se eliminaron colores fijos no estándares para usar variables CSS nativas HSL.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/GlobalSkeletonLoaderSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/GlobalSkeletonLoaderSandbox.jsx) [MODIFY] — Reemplazados fondos y bordes oscuros fijos (`bg-slate-900`, `border-slate-800`) por variables CSS adaptativas del tema (`bg-[var(--color-surface)]`, `border-[var(--color-border)]`) y optimizado el degradado shimmer a opacidad media (`opacity: 0.85` de variables HSL suaves) para eliminar el parpadeo de alto contraste en modo claro.
* **Causa Raíz:**
  - El sandbox de GlobalSkeletonLoader utilizaba clases oscuras fijas (`bg-slate-900`, `bg-slate-950`) y un gradiente blanco-negro extremo en su shimmer, generando un contraste excesivamente alto y un aspecto visual desentonado ("muy feo") al renderizarse con el fondo claro del dashboard. Por su parte, el de AuthGuard mostraba un mensaje textual básico sin widgets POS reales al validarse el acceso.
* **Solución Técnica:**
  - Configuración adaptativa de las tarjetas y contenedores de carga para que lean la paleta de colores activa (`var(--color-surface)` y `var(--color-surface-2)`).
  - Suavizado del gradiente shimmer haciendo que brille suavemente entre el color base del contenedor (`var(--color-surface-2)`) y el color de fondo general (`var(--color-bg)`), adaptándose de forma natural y transparente tanto en temas claros como oscuros.
  - Creación del widget POS con estadísticas mockeadas en el panel concedido del AuthGuard.
  - Build local: ✅ Compilación exitosa en 644ms con Vite.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Refactorización de Sandbox Core a Modularización y Carga Dinámica (Lazy Loading)
* **Tipo:** Refactor / Rendimiento / Arquitectura / Optimización de Tokens
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Sustituidos los 4 componentes inline por importaciones dinámicas (`React.lazy`) y envolturas `Suspense`. Reducción del tamaño del archivo.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/SandboxLayout.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/SandboxLayout.jsx) [NEW] — Creación del layout y panel de control compartido para evitar dependencias circulares.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/AuthGuardUserProfileSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/AuthGuardUserProfileSandbox.jsx) [NEW] — Fichero modularizado con el código del sandbox de AuthGuard & UserProfile.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/GlobalSkeletonLoaderSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/GlobalSkeletonLoaderSandbox.jsx) [NEW] — Fichero modularizado con la simulación shimmer y mitigación de CLS.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/BreadcrumbHeaderSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/BreadcrumbHeaderSandbox.jsx) [NEW] — Fichero modularizado con las migas de pan y retornos.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/ErrorBoundaryFallbackSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/ErrorBoundaryFallbackSandbox.jsx) [NEW] — Fichero modularizado con la captura interactiva de fallos y recuperación.
* **Causa Raíz:**
  - Evitar el consumo excesivo de tokens al leer un archivo monolítico gigante de 5,600+ líneas y habilitar optimización de rendimiento (code splitting) en producción.
* **Solución Técnica:**
  - Desacoplamiento de componentes de presentación en la subcarpeta `sandboxes/`.
  - Uso de directivas `React.lazy(() => import(...))` para code-splitting dinámico. Cada playground genera su propio chunk ligero descargado bajo demanda.
  - Build local: ✅ Compilación exitosa en 558ms con Vite.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Sandbox e Integración de los 4 Componentes Premium (AuthGuard, GlobalSkeletonLoader, BreadcrumbHeader, ErrorBoundaryFallback)
* **Tipo:** Feature / Componentes / UI/UX / Sandbox / Documentación
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Desarrollo e inyección de los 4 playgrounds en `SANDBOXES` (`auth_guard_userprofile`, `global_skeleton_loader`, `breadcrumb_header`, `error_boundary_fallback`). Configuración de aliases en `COMPONENT_SANDBOX_MAP` y reglas de búsqueda en `getSandboxKey()`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Indexación de las 4 fichas técnicas en el mapa semántico general para la IA.
* **Causa Raíz:**
  - Cumplir el plan de integración interactiva y catalogación semántica de los cuatro componentes premium del ecosistema del dashboard.
* **Solución Técnica:**
  - Implementación de simulación de roles de usuario en AuthGuard, retraso de 2s shimmer simulado en GlobalSkeletonLoader para prevenir CLS, rastro dinámico de migas de pan en BreadcrumbHeader y captura interactiva de fallos y flujo de recuperación en ErrorBoundaryFallback.
  - Build local: ✅ 599ms sin errores de compilación de Vite.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Corrección de Diseño de Interruptores (Toggles) en Sandbox de Notificaciones
* **Tipo:** Bugfix / UI/UX / Sandbox / Consistencia
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Rediseño de los cuatro interruptores (toggles) del playground de `'sistema_notificaciones'` utilizando clases flex con `items-center` y reemplazando posiciones absolutas rígidas (`left-4`, `left-0.5`) por animaciones de traslación simétrica (`translate-x-4` vs `translate-x-0`).
* **Causa Raíz:**
  - Las bolitas internas de los toggles estaban desalineadas y descentradas al activarse debido a diferencias de padding vertical y márgenes horizontales duros sobre botones de ancho `w-9` y bolitas de `w-4` (generando una asimetría de 4px que tocaba bruscamente los bordes).
* **Solución Técnica:**
  - Rediseño con `relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200 ease-in-out`.
  - Desplazamiento simétrico de la bolita (`h-3.5 w-3.5`) usando `ml-0.5 transform transition-transform duration-200` y aplicando clases `translate-x-4` (activo) y `translate-x-0` (inactivo). Esto garantiza un espaciado exacto de 2px en todos los lados.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Playground Interactivo del Sistema de Notificaciones Premium + Ficha de Biblioteca
* **Tipo:** Feature / Componentes / UI/UX / Sandbox / Documentación
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Integración del playground `'sistema_notificaciones'` en `SANDBOXES` con configurador de 4 pasos en vivo (tipo, contenido, comportamiento, código generado). Campana con badge animado. Bandeja mini-inline. Toast stack con barra de progreso animada. Registro en `COMPONENT_SANDBOX_MAP` con 10 aliases y detección fuzzy en `getSandboxKey` (palabras clave: notif, toast, campana, bandeja, bell, tray).
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Sistema_Notificaciones_Premium/sistema_notificaciones_premium.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Sistema_Notificaciones_Premium/sistema_notificaciones_premium.md) [NEW] — Ficha técnica completa con arquitectura de 3 capas (NotificationBell, NotificationTray, ToastStack), store Zustand + persist, hook de fachada `useNotify`, 6 tipos semánticos, código 100% funcional y diagrama de flujo operativo.
* **Causa Raíz:**
  - El cliente necesita un mecanismo para previsualizar y configurar exactamente el tipo de notificación/toast que requiere en su app durante una reunión de levantamiento de requerimientos, sin tocar código.
* **Solución Técnica:**
  - Layout de 2 columnas: configurador paso a paso (izq) + preview en vivo + campana + bandeja + stack de toasts (der).
  - Al seleccionar un tipo, se autocompletan textos contextuales (preset). El código exacto `notify.tipo(...)` se genera dinámicamente y es copiable al instante.
  - `duration: 0` para toasts permanentes, `pauseOnHover`, `showProgress` y `action` son toggleables en vivo.
  - Build: ✅ 572ms sin errores.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-06] - Categorías Colapsables Premium en el Explorador de Biblioteca

* **Tipo:** Componentes / UI/UX / Árbol de Directorios / Mejoras
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY] — Rediseño del árbol lateral de componentes convirtiendo las categorías estáticas en acordeones/dropdowns interactivos. Importación de `motion` y `AnimatePresence`.
* **Causa Raíz:**
  - El listado de componentes en la columna izquierda mostraba todas las categorías y archivos expandidos verticalmente de forma simultánea, saturando la interfaz visual a medida que la biblioteca crecía con nuevos componentes premium (Core, Pedidos, Modales, Formularios, etc.).
* **Solución Técnica:**
  - Creación de botones de encabezado de categoría estilizados como un selector desplegable premium de marca blanca (con hover, sombras, bordes interactivos HSL y un indicador de total de componentes).
  - Integración de `framer-motion` para abrir y cerrar de forma suave (spring transition) la lista de componentes dentro de cada categoría.
  - Sincronización inteligente de estados: auto-expansión de la categoría del componente activo mediante `useEffect` y expansión automática de categorías relevantes al filtrar o buscar términos.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-06] - Corrección de Contraste en Botón de Sandbox de Empty State
* **Tipo:** Componentes / UI/UX / Sandbox / Accesibilidad / Bugfix
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Reemplazo de la clase de color no estándar `bg-indigo-650` por `bg-indigo-600` en el botón de acción de Empty State.
* **Causa Raíz:**
  - El botón elástico del playground de `EmptyState` (`SandboxEmptyState`) utilizaba la clase de fondo inexistente/no estándar `bg-indigo-650`. Tailwind interpretaba esta regla como transparente o inválida, haciendo que el botón se renderizara en fondo blanco sobre la tarjeta blanca del Empty State, perdiendo el contraste y quedando invisible.
* **Solución Técnica:**
  - Reemplazo de `bg-indigo-650` por la clase oficial `bg-indigo-600` y cambio del estado hover de `hover:bg-indigo-600` a `hover:bg-indigo-500` para un sombreado y contraste correcto.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-06] - Visualización de Muestras de Color Circulares en Selector de Atributos
* **Tipo:** Componentes / UI/UX / Sandbox / Mejoras / Bugfix
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Modificado el playground `'selector_atributos'` para renderizar los valores de color de forma puramente visual (círculos de color HSL/Hex en lugar de texto) y añadida la importación de `Check` de `lucide-react`.
* **Causa Raíz:**
  - El selector de atributos mostraba los colores como chips de texto plano con el nombre del color ("Negro", "Blanco", etc.), restando fidelidad visual y estética premium al componente. Al renderizar los círculos, se inyectó la marca de selección interactiva `Check` de Lucide sin haberla importado previamente en las directivas de cabecera, causando un error runtime `ReferenceError: Check is not defined` que rompía la aplicación. Asimismo, el estado seleccionado inicial con checkmark y outline tosco se veía saturado y poco pulido.
* **Solución Técnica:**
  - Mapeo de nombres de color a códigos hexadecimales reales en un objeto `colorMap` de desarrollo.
  - Rediseño concéntrico de las muestras de color: cada swatch consta de un contenedor circular externo con bordes responsivos y un punto de color flotante interno de clase `w-6 h-6`. Al seleccionarse, el contenedor externo se tiñe de color índigo y se expande con transiciones fluidas de `framer-motion` (`motion.span` con interpolación spring), eliminando el checkmark tosco para una apariencia limpia y profesional.
  - Sincronización idéntica tanto en el visualizador tipo Chips como en el componente visual del Dropdown desplegable.
  - Importación explícita de `Check` desde `lucide-react` en la cabecera de `ComponentSandbox.jsx`.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-06] - Desacoplamiento de CategoryManager e Independencia del Sandbox de Categorías (Tarea 229)
* **Tipo:** Componentes / UI/UX / Sandbox / Corrección de Colisión
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Creación del playground independiente `'gestor_categorias'` y remapeo de claves en `COMPONENT_SANDBOX_MAP` (`selector de categorías`, `CategoryManager`) para evitar colisiones de simulación con `'selector_atributos'`.
* **Causa Raíz:**
  - El componente de administración de categorías (`CategoryManager`) compartía el mismo playground de simulación que el menú desplegable premium (`CustomSelect`), lo que provocaba que ambos mostraran la simulación del selector de atributos en lugar de permitir probar el gestor de categorías de manera aislada.
* **Solución Técnica:**
  - Creación de un playground dedicado de gestión de categorías interactivo, autoportante con iconos SVG inline ( Shirt, Footprints, Gem, Tag ) y lógica de operaciones CRUD (Crear, Editar, Eliminar y Filtrar iconos con buscador reactivo).
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-06] - Diseño e Integración de Ruleta de la Suerte y Selector de Reservas Agenda (Tarea 228)
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Fidelizacion_y_Gamificacion/Ruleta_Fortuna_Premios/ruleta_fortuna_premios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Fidelizacion_y_Gamificacion/Ruleta_Fortuna_Premios/ruleta_fortuna_premios.md) [NEW] — Documentación y código React para `RaffleWheelOfFortune`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Reservas_y_Citas/Selector_Reservas_Agenda/selector_reservas_agenda.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Reservas_y_Citas/Selector_Reservas_Agenda/selector_reservas_agenda.md) [NEW] — Documentación y código React para `AgendaReservationCalendar`.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Registro de los playgrounds interactivos `ruleta_suerte` y `reservas_agenda` en `SANDBOXES` y mapeos en `COMPONENT_SANDBOX_MAP` con búsqueda difusa.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY] — Creación de las categorías "Fidelización y Gamificación" y "Reservas y Citas" e indexación de los nuevos archivos.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Registro semántico de ambos componentes en la Sección 4.
* **Causa Raíz:**
  - Necesidad de enriquecer el catálogo con componentes interactivos estratégicos de conversión comercial: un gancho de gamificación de premios al azar para Checkout y un organizador semanal y horario adaptativo para agendamientos.
* **Solución Técnica:**
  - **Ruleta de la Suerte:** Segmentación trigonométrica SVG, física de inercia y rebote settling via curvas bezier elásticas, importación perezosa de `canvas-confetti` y generación automática de cupones parametrizables.
  - **Selector Agenda:** Agenda semanal deslizable, rejilla reactiva de turnos con protección del re-render de ocupados/libres persistiendo por fecha, y formulario integrado con props.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-06] - Creación e Integración de Selector de Boletas de Rifa Premium (Tarea 227)
* **Tipo:** Componentes / UI/UX / Sandbox / Documentación / Bugfix
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Selector_Boletas_Rifas/selector_boletas_rifas.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Selector_Boletas_Rifas/selector_boletas_rifas.md) [NEW] — Creación de la especificación y código React para `RaffleNumberSelector` de rango 00-99.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Inyección del componente `SandboxRaffleNumberSelector`, definición de su playground interactivo y mapeo en `COMPONENT_SANDBOX_MAP` con soporte de búsqueda difusa. Se eliminó la caja de texto manual, se inyectó un stack de botones premium para confirmación y limpieza de selección alineados verticalmente en el centro (`self-center`), y se corrigió el conflicto de doble evento `pointerdown` en las celdas del grid.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY] — Registro del componente en la sección de "Ecommerce y Ventas".
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Registro del componente en el mapa semántico.
* **Causa Raíz:**
  - Requerimiento de un selector visual de boletas de rifa (00-99). El botón de confirmación anterior carecía de una estética premium, se requería una acción para limpiar la selección y la alineación inferior (`self-end`) de la botonera dejaba un espacio vacío asimétrico en la parte superior del contenedor.
* **Solución Técnica:**
  - Desarrollo de un stack de control vertical centrado mediante `self-center` en la esquina derecha del panel de resumen.
  - El botón de Confirmar ahora implementa un gradiente HSL tricolor (`indigo -> purple -> pink`), transformaciones de escala activa (`scale-[1.02]`/`active:scale-[0.98]`) y una sombra difusa de brillo (`shadow-purple-500/25`).
  - Integración del botón "Limpiar Selección" que reinicia el estado reactivo (`selectedNumbers`) a un array vacío con transiciones y feedback visual rojo al pasar el cursor.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-06] - Ajuste de Sensibilidad y Soporte de Movimiento Multi-Entrada en Luces Orgánicas (Fix Tarea 225)
* **Tipo:** Bugfix / UI/UX / Sandbox / Mobile
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Rediseñada la detección de movimiento en `SandboxInteractiveAmbientGlow`. Se amplió la sensibilidad del cursor multiplicándola por 12, se unificaron los Pointer Events para soportar toques en móviles con decaimiento elástico, y se integró un efecto de inclinación 3D Parallax mediante el giroscopio (`deviceorientation`).
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Fondo_Luces_Organicas/fondo_luces_organicas.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Fondo_Luces_Organicas/fondo_luces_organicas.md) [MODIFY] — Actualizado el código React de referencia en la biblioteca para incorporar este soporte de toques y sensores.
* **Causa Raíz:**
  - El movimiento era imperceptible en pantallas de escritorio (la sensibilidad 0.05 limitaba el desplazamiento a escasos 5-8px) y no interactuaba de ninguna forma en dispositivos móviles sin cursor físico.
* **Solución Técnica:**
  - Unificación de eventos táctiles y de mouse a través de Pointer Events.
  - Implementación de decaimiento elástico de coordenadas hacia cero al levantar el dedo o salir del contenedor.
  - Integración de inclinación elástica 3D utilizando beta/gamma del giroscopio.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-06] - Integración y Sandbox de Empty State Premium Interactivo (Tarea 226)
* **Tipo:** Componentes / UI/UX / Sandbox / Corrección de Bugs
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Implementado el sandbox del Empty State (`empty_state`), configuradas las animaciones elásticas con `framer-motion` y mapeadas las llaves de acceso en `COMPONENT_SANDBOX_MAP` con búsqueda difusa. También se optimizó `SandboxInteractiveAmbientGlow` para solventar la previsualización gris del fondo de luces (con `useRef` para evitar cancelaciones del frame) y se ajustó la escala de los botones de `RadialInteractiveMenu` a `w-9 h-9` con bordes `rounded-xl` para evitar solapamientos y mejorar la legibilidad.
* **Causa Raíz:**
  - El componente `Empty State Premium Interactivo` en la biblioteca mostraba la pantalla de "Playground No Configurado", el fondo de luces orgánicas se visualizaba gris estático, y los botones del abanico del menú radial se solapaban al tener el mismo tamaño (`w-12 h-12`) del disparador.
* **Solución Técnica:**
  - Registro de `'empty_state'` en el diccionario de playgrounds.
  - Reestructuración de animaciones y coordenadas en el fondo de luces orgánicas usando `useRef`.
  - Redimensionamiento y centrado proporcional de los botones del menú radial en la hoja de estilos inline de React.
* **Estatus:** ✅ Completado y verificado con build de producción exitoso.

### [2026-06-06] - Diseño e Integración del Segundo Trío de Componentes VIP (Tarea 225)
* **Tipo:** Componentes / UI/UX / Sandbox / Documentación
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Boton_Magnetico/boton_magnetico.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Boton_Magnetico/boton_magnetico.md) [NEW] — Creación de la especificación y código React para `MagneticButton`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Mazo_Tarjetas_Deslizables/mazo_tarjetas_deslizables.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Mazo_Tarjetas_Deslizables/mazo_tarjetas_deslizables.md) [NEW] — Creación de la especificación y código React para `SwipeableCardStack`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Fondo_Luces_Organicas/fondo_luces_organicas.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Fondo_Luces_Organicas/fondo_luces_organicas.md) [NEW] — Creación de la especificación y código React para `InteractiveAmbientGlow`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY] — Registro de los tres nuevos componentes en el index.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Registro de los tres nuevos archivos en el mapa de documentación semántica.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Inyección del código de los tres componentes, creación de sus playgrounds interactivos y mapeo en `COMPONENT_SANDBOX_MAP` con búsqueda difusa adaptativa.
* **Causa Raíz:**
  - Petición del usuario de agregar tres nuevos componentes premium VIP con interactividad física y visual para el catálogo reutilizable.
* **Solución Técnica:**
  - Desarrollo de los componentes utilizando hooks nativos y optimizaciones de GPU (`will-change-transform`, `requestAnimationFrame` para inercia elástica de luces ambient, y `PointerEvents` unificados para mazo arrastrable en móviles).
* **Estatus:** ✅ Completado y verificado con build de producción exitoso.

### [2026-06-06] - Diseño y Creación de la Skill component-creator (Tarea 224)
* **Tipo:** Estándares / IA / Skills / Reglas / Documentación
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_creator/SKILL.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_creator/SKILL.md) [NEW] — Creación del archivo de la skill detallando la metodología estructurada.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY] — Integración del trigger rápido `@crear-componente`.
  - Propagación automática de las reglas en 5 destinos del disco mediante script de sincronización.
* **Causa Raíz:**
  - Solicitud de crear una herramienta y guía estructurada de IA para automatizar de forma consistente la ideación, codificación, documentación en biblioteca, e inyección en el sandbox de nuevos componentes premium, evitando playgrounds no configurados.
* **Solución Técnica:**
  - Implementación del documento de Skill en Markdown y el disparador en el archivo base de reglas globales de IA.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Diseño e Integración de Trío de Componentes Premium (Tarea 223)
* **Tipo:** Componentes / UI/UX / Sandbox / Documentación
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Marquesina_Marcas/marquesina_marcas.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Marquesina_Marcas/marquesina_marcas.md) [NEW] — Creación de la especificación técnica en markdown de marquesina de marcas.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Menu_Radial/menu_radial.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Menu_Radial/menu_radial.md) [NEW] — Creación de la especificación técnica en markdown de menú radial circular.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Tarjeta_3D_Holografica/tarjeta_3d_holografica.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Tarjeta_3D_Holografica/tarjeta_3d_holografica.md) [NEW] — Creación de la especificación técnica en markdown de tarjeta 3D holográfica.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY] — Registro de los tres nuevos componentes en el catálogo index del README.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Integración del código React de marquesina, menú radial y tarjeta 3D e implementación de sus playgrounds interactivos y mapeo en `COMPONENT_SANDBOX_MAP`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Registro de los tres archivos markdown en el mapa de documentación semántica.
* **Causa Raíz:**
  - Petición del usuario de agregar tres componentes premium con animaciones fluidas (`InfiniteLogoMarquee`, `RadialInteractiveMenu` y `HolographicTiltCard`) para darles un plus estético y funcional a las aplicaciones cliente.
* **Solución Técnica:**
  - Implementación en código react embebido de los componentes usando hooks como `useMemo`, `useRef` y CSS animado puro (sin dependencias como Framer Motion o Lucide) para garantizar la portabilidad absoluta.
* **Estatus:** ✅ Completado y verificado con build exitoso.

### [2026-06-06] - Diseño e Integración de Calendario/DatePicker Premium (Tarea 222)
* **Tipo:** Componentes / UI/UX / Sandbox / Documentación
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Calendario_Premium/calendario_premium.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Calendario_Premium/calendario_premium.md) [NEW] — Creación de la ficha técnica y código React portable del componente `DatePickerPremium`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY] — Registro de la especificación técnica en el índice de Formularios y UI.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Integración del componente `DatePickerPremium` y su sandbox interactivo con modo fecha única y rango de fechas con presets en la Sandbox. Mapeo en `COMPONENT_SANDBOX_MAP`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Sincronización del nuevo archivo en el mapa semántico.
* **Causa Raíz:**
  - Petición del usuario para diseñar y catalogar un selector de fechas (DatePicker) de nivel premium, responsivo y de marca blanca, libre de librerías externas para evitar sobrecargar el bundle size.
* **Solución Técnica:**
  - Construcción del componente usando la API `Date` nativa de JavaScript. Soporta selección de fecha única y de rangos utilizando un grid de 42 días autocalculado, atajos preestablecidos para rangos, navegación fluida de meses con iconos SVG en línea y consumo de variables HSL de marca.
* **Estatus:** ✅ Completado y verificado con build exitoso.

### [2026-06-06] - Sandbox de Telemetría Centralizada en Dashboard Dev (Fix Tarea 221)
* **Tipo:** Bugfix / UI/UX / Sandbox / Diagnóstico
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Implementado el playground reactivo `'telemetria_centralizada'` en `SANDBOXES` y mapeado en `COMPONENT_SANDBOX_MAP`.
* **Causa Raíz:**
  - El componente/servicio de telemetría no aparecía listado en la sección "Sandbox" de la biblioteca del dashboard debido a la falta de mapeo e implementación de su playground en `ComponentSandbox.jsx`.
* **Solución Técnica:**
  - Se implementó un simulador de consola de logs interactivo en tiempo real que simula el envío del payload de telemetría calculando las comisiones según el esquema del cliente.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Extracción y Estandarización de Telemetría Centralizada (Tarea 221)
* **Tipo:** Refactoring / Servicios / Telemetría / Documentación / Directivas IA
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Servicios_y_Firebase/Telemetria_Centralizada/telemetria_centralizada.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Servicios_y_Firebase/Telemetria_Centralizada/telemetria_centralizada.md) [NEW] — Creación de la documentación de telemetría con los códigos JS completos y directivas de auto-portabilidad para IA.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY] — Registro del servicio en el índice de Servicios y Firebase.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Registro del nuevo archivo en el mapa semántico.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY] — Sincronización física de la telemetría en el mapa de la aplicación.
* **Causa Raíz:**
  - Petición de encapsular y estandarizar la telemetría contable de cobros e ingresos del desarrollador en un servicio global portátil para evitar reprocesos y fallos lógicos durante su adopción en nuevos clientes.
* **Solución Técnica:**
  - Estructuración de la documentación incluyendo las directivas en formato de prompt para que la IA portadora realice la inyección, configuración de variables de entorno y conexión del trigger sin requerir intervención humana.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Extracción y Sandbox de Facturación Comisional (Tarea 220)
* **Tipo:** Refactoring / Componentes / UI/UX / Sandbox / Documentación
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Monetizacion_Desarrollador/Facturacion_Comisional/facturacion_comisional.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Monetizacion_Desarrollador/Facturacion_Comisional/facturacion_comisional.md) [NEW] — Creación de la ficha técnica y código React portable del componente `DeveloperBillingPanel`.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY] — Registro de la especificación técnica en el índice de monetización.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Integración del playground de facturación interactiva (`facturacion_comisional`) en la Sandbox. Se inyectaron iconos adicionales en las importaciones, se definió inline el componente `DeveloperBillingPanel` y se registraron las keys en el mapa de control.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Sincronización de la ficha en el mapa de documentación.
* **Causa Raíz:**
  - Solicitud de extraer el módulo de comisiones, firma digital y exportación de recibos (facturación) del desarrollador para convertirlo en un elemento desacoplado e instalable en cada aplicación cliente del ecosistema.
* **Solución Técnica:**
  - Desacoplamiento de la UI de las suscripciones directas de Firestore.
  - Maquetación de la demo reactiva en la Sandbox permitiendo cambiar los esquemas en vivo (porcentaje, valor fijo por pedido, tarifa plana mensual) y capturar firmas sobre el lienzo.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Implementación de BentoGrid y useLocalStorageState (Tarea 219)
* **Tipo:** Feature / Componentes / UI/UX / Sandbox / Documentación
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Bento_Grid/bento_grid.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Bento_Grid/bento_grid.md) [NEW] — Ficha técnica y especificación visual del layout BentoGrid.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/useLocalStorageState/use_local_storage_state.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/useLocalStorageState/use_local_storage_state.md) [NEW] — Ficha técnica y especificación del hook useLocalStorageState.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY] — Catalogación de los nuevos componentes.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Integración de los playgrounds interactivos de BentoGrid y useLocalStorageState. Ajuste de dimensiones de celdas (`auto-rows-[140px]`) y padding (`p-5`) para alineación y respiración visual premium.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Registro de los archivos de especificación en el mapa semántico de la IA.
* **Causa Raíz:**
  - Solicitud de incorporar los componentes BentoGrid (mosaico responsivo premium para dashboards) y useLocalStorageState (hook de sincronización multitestaña y almacenamiento local) al ecosistema.
* **Solución Técnica:**
  - Creación de las guías de estándares y código portable React 19.
  - Maquetación de demos jugables adaptadas al estándar HSL en la consola dev-dashboard.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Implementación de useDebounceValue y StockHeatmap (Tarea 218)
* **Tipo:** Feature / Componentes / UX / Sandbox / Documentación
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/useDebounceValue/use_debounce_value.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/useDebounceValue/use_debounce_value.md) [NEW] — Documentación y código React 19 para optimización de búsquedas.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Stock_Heatmap/stock_heatmap.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Stock_Heatmap/stock_heatmap.md) [NEW] — Documentación y código React 19 / HSL para semáforo de stock.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY] — Registro e indexación en el README de la biblioteca.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Integración de las demos interactivas (playgrounds) en el sandbox del dashboard.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Indexación de las fichas en el mapa semántico.
* **Causa Raíz:**
  - Solicitud de incorporar y documentar los componentes indispensables useDebounceValue (hook para mitigar peticiones duplicadas) y StockHeatmap (indicador visual de escasez de inventario) en la biblioteca global y sandbox.
* **Solución Técnica:**
  - Diseño de las guías de implementación técnica con especificación de estilos y ciclos de vida.
  - Desarrollo de playgrounds dedicados con controles de props en vivo dentro de la consola dev-dashboard.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Adaptación Responsiva Premium para Ajustes del Administrador (Tarea 217)
* **Tipo:** UI/UX / Responsivo / Desktop / Admin Panel
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY] — Reestructuración del panel de ajustes para adaptarlo a PC.
* **Causa Raíz:**
  - El menú principal de la configuración del administrador estaba forzado a un ancho máximo móvil/tablet estrecho (`max-w-2xl`), causando desaprovechamiento del espacio horizontal en pantallas de PC.
* **Solución Técnica:**
  - Se cambió el max-width del menú a `max-w-6xl` y se reestructuró la maquetación a una rejilla adaptativa de 3 columnas (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`), permitiendo agrupar las tarjetas de Tienda, Gestión y Sistema lado a lado en pantallas grandes.
  - Se acotó el ancho del botón "Cerrar Sesión" (`max-w-sm mx-auto`) para que permanezca centrado y equilibrado visualmente en pantallas grandes.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Creación de SwipeableBottomSheet y OTPInputField (Tarea 216)
* **Tipo:** Feature / Componentes / UX / Sandbox / Documentación
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Swipeable_Bottom_Sheet/swipeable_bottom_sheet.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Swipeable_Bottom_Sheet/swipeable_bottom_sheet.md) [NEW] — Documentación y código React 19 / HSL para Bottom Sheet.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/OTP_Input_Field/otp_input_field.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/OTP_Input_Field/otp_input_field.md) [NEW] — Documentación y código React 19 / HSL para OTP input.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY] — Registro en el README de la biblioteca.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY] — Integración de las demos interactivas (playgrounds) en el sandbox del dashboard.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Indexación de las fichas en el mapa semántico.
* **Causa Raíz:**
  - Solicitud explícita de comenzar la implementación y documentación de los 5 componentes priorizados, empezando por el panel deslizable inferior y la entrada OTP.
* **Solución Técnica:**
  - Desarrollo de las guías con diagramas e implementaciones reales de código.
  - Maquetación de componentes simulados interactivos integrando controles (toggles, selects, outputs) dentro de la consola `dev-dashboard` con empaquetado verificado con éxito.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Propuesta de 50 Componentes Premium Reutilizables
* **Tipo:** Investigación / Documentación / Escalabilidad / Arquitectura
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/09_Plan_Escalabilidad_Negocio/propuesta_50_componentes_premium.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Plan_Escalabilidad_Negocio/propuesta_50_componentes_premium.md) [NEW] — Creación del catálogo de 50 componentes premium clasificados.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Registro de la propuesta en el mapa de documentación IA.
* **Causa Raíz:**
  - Solicitud de investigación profunda en la web, repositorios de GitHub e ideas propias para proponer 50 componentes portables y premium alineados con el stack del proyecto para acelerar desarrollos futuros.
* **Solución Técnica:**
  - Elaboración y guardado del archivo markdown estructurado por categorías con su respectivo propósito, diseño/visuales HSL y lógica técnica.
* **Estatus:** ✅ Completado y catalogado.

### [2026-06-06] - Skill @portar-componente, Copia Avanzada y Buscador Inteligente en Visor (Tareas 212-214)
* **Tipo:** Feature / Portabilidad / Búsqueda / UX / Biblioteca
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/portar_componente/SKILL.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/portar_componente/SKILL.md) [NEW] — Nueva skill de portabilidad automatizada con pipeline completo.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY] — Registro del trigger `@portar-componente` propagado en cascada.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY] — Inyección de resaltado de búsqueda (`HighlightText`), contador dinámico de resultados, botones de copia individuales por bloque de código con feedback temporal, y botón global "Copiar todo el código".
* **Causa Raíz:**
  - El visor era pasivo y requería copiado y pegado manual, caza de imports y adaptación manual. Además, la búsqueda del árbol era difícil y carecía de resaltado y conteo.
* **Solución Técnica:**
  - Creación del pipeline en la skill `@portar-componente`.
  - Sincronización cromática y de reglas de IA en cascada a todos los proyectos.
  - Resaltado Regex para las búsquedas y botones dedicados de copiado para mejorar drásticamente el flujo de desarrollo.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Visor Biblioteca: Rediseño con Sandbox Interactivo Real y Layout Doble Panel (Tarea 211 - Rev 2)
* **Tipo:** Feature / UI/UX / Sandbox / Biblioteca de Componentes
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [NEW] — 6 playgrounds interactivos con controles de props en vivo: DarkModeToggle, GuidedToast, Botón Premium (5 variantes), Modal de Confirmación (3 variantes), Selector de Atributos, Input Premium, Contador de Cantidad.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY] — Rediseño completo: layout 3/9 cols (sidebar categorizado + visor con pestañas Docs/Sandbox), MarkdownRenderer mejorado con soporte inline bold/code, sidebar con badge de conteo por categoría.
* **Causa Raíz:**
  - El visor anterior mostraba solo la documentación Markdown. Se requería un playground interactivo (props dinámicas) integrado en el mismo panel, bajo un diseño de pantalla dividida sin perder la documentación.
* **Solución Técnica:**
  - `ComponentSandbox.jsx`: Mapa de resolución de nombres → playgrounds (COMPONENT_SANDBOX_MAP). Cada playground es un hook de React aislado con ControlPanel de controles tipo toggle/select/text/number. Renderizado inline en el panel derecho sin iframes.
  - `ComponentLibraryView.jsx`: MarkdownRenderer propio que parsea H1/H2/H3, listas, párrafos con bold/code inline, y bloques de código con botón copiar integrado. Pestañas Documentación / Sandbox LIVE con badge animado.
  - Verificación: ✅ `npm run build` completado exitosamente (1,142KB bundle principal sin errores).
* **Estatus:** ✅ Completado y verificado.

### [2026-06-06] - Visor Interactivo y Sandbox de la Biblioteca en dev-dashboard (Tarea 211)
* **Tipo:** Feature / UI/UX / Biblioteca / Sandbox
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [NEW] — Componente interactivo (Playground) con soporte para modificar propiedades (props) dinámicas, simular carga en botones, alertas de feedback y consola de diagnóstico.
  - [`d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [NEW] — Componente de visor principal a doble columna (árbol de componentes categorizados a la izquierda, detalles a dos pestañas: docs/código y simulador interactivo a la derecha).
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY] — Importación e integración del visor en la barra de navegación del panel de control de desarrollador (NAV_TABS).
* **Causa Raíz:**
  - Se requería una forma directa de visualizar los componentes portables de la Biblioteca de Componentes en la UI del dashboard, permitiendo interactuar con ellos en tiempo real (clic en botones, ver modales, abrir loaders) para depuración y portabilidad.
* **Solución Técnica:**
  - Creación de la UI a doble columna que consume los endpoints locales `/api/library` y `/api/library/file` servidos por el Daemon CLI.
  - Integración del Sandbox interactivo que encapsula componentes simulados para ajustarse mediante un panel de control con propiedades reactivas en vivo.
  - Verificación: ✅ `npm run build` en dev-dashboard completado con éxito en 494ms.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-05] - Saneamiento de Iconos Estáticos de PWA y Fallback (Tarea 210)
* **Tipo:** Bugfix / UI/UX / PWA / Branding
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/public/pwa-192x192.png`](file:///d:/Aplicaciones/App%20Ventas/public/pwa-192x192.png) [MODIFY] — Reemplazado por el logotipo azul oficial de Smart Fix.
  - [`d:/Aplicaciones/App Ventas/public/pwa-512x512.png`](file:///d:/Aplicaciones/App%20Ventas/public/pwa-512x512.png) [MODIFY] — Reemplazado por el logotipo azul oficial de Smart Fix.
  - [`d:/Aplicaciones/App Ventas/public/apple-touch-icon.png`](file:///d:/Aplicaciones/App%20Ventas/public/apple-touch-icon.png) [MODIFY] — Reemplazado por el logotipo azul oficial de Smart Fix.
* **Causa Raíz:**
  - Los archivos de iconos estáticos locales de la PWA heredados de la plantilla original eran una bolsa de compras morada. Cuando el instalador nativo de Chrome/Android (WebAPK) consultaba el manifiesto y rechazaba los Data URIs Base64 dinámicos generados por el Canvas por limitaciones de red externas, o cuando fallaban por CORS en Storage, recurría a estos archivos estáticos del build. Esto causaba que apareciera el icono desactualizado.
* **Solución Técnica:**
  - Se descargó el logotipo oficial activo de la base de datos de Smart Fix y se sobreescribieron físicamente los archivos `/public/pwa-192x192.png`, `/public/pwa-512x512.png` y `/public/apple-touch-icon.png`. De este modo, en cualquier caso de fallback del Service Worker, compilación de WebAPK o error de red, el icono por defecto siempre será el logotipo de la marca.
  - Verificación: ✅ `npm run build` exitoso.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-05] - Corrección de Acceso a Consola de Diagnóstico (Tarea 207)
* **Tipo:** Bugfix / Robustez / Seguridad
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY] — Flexibilizar la validación de `handleVersionClick` para omitir la correspondencia obligatoria con la variable de entorno `VITE_DEVELOPER_EMAIL` si la aplicación está ejecutándose en desarrollo local (`import.meta.env.DEV`).
  - [`d:/Aplicaciones/App Ventas/firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [MODIFY] — Adición de la regla de acceso para la colección temporal `/_diagnostics/{document}` permitiendo lectura y escritura si el usuario es administrador (`isAdmin()`).
* **Causa Raíz:**
  - Al no tener el desarrollador local configurado su correo electrónico bajo `VITE_DEVELOPER_EMAIL` en `.env.local`, el handler realizaba un retorno temprano silencioso impidiendo abrir la consola tras los 7 clics.
  - Además, la base de datos Firestore bloqueaba las operaciones de escritura/lectura temporales en la colección `_diagnostics` durante el test de latencia local (Ping Firestore Local) por no estar declarada en las reglas de seguridad.
* **Solución Técnica:**
  - Modificación del condicional de validación inyectando la verificación de entorno `import.meta.env.DEV` como bypass.
  - Inyección de la regla `allow read, write: if isAdmin();` sobre el segmento de ruta `_diagnostics` en el compilador de seguridad de Firestore.
  - Verificación: ✅ `npm run build` en App Ventas exitoso.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-05] - Reversión de Sidebar y Animación en App Ventas (Tarea 209)
* **Tipo:** UI/UX / Layout / Reversión
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/layouts/AdminLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/AdminLayout.jsx) [REVERT] — Deshacer los cambios de sidebar colapsable, posicionamiento sticky y animación de desplazamiento de logo, restaurando el layout y comportamiento original de la barra lateral fixed de escritorio.
* **Causa Raíz:**
  - Solicitud explícita del usuario para revertir la animación y estructura del sidebar en App Ventas a su estado original anterior.
* **Solución Técnica:**
  - Ejecución de `git checkout` sobre el archivo `AdminLayout.jsx` de la app de ventas para restaurar el posicionamiento `fixed`, la lógica original del menú hamburguesa y el margin-left reactivo en la etiqueta `<main>`.
  - Verificación: ✅ `npm run build` en App Ventas completado con éxito.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-05] - Sidebar Colapsable y Botón Hamburguesa Persistente y Alineado (Tarea 209)
* **Tipo:** UI/UX / Layout / Refactorización / Animaciones
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/layouts/AdminLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY] — Implementación del topbar desktop interactivo, sidebar colapsable mediante estado `sidebarCollapsed` con botón de hamburguesa persistente posicionado a la izquierda (alineado con los iconos del menú de navegación) y desplazamiento fluido de la marca. [REVERTIDO]
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY] — Ajuste idéntico en el topbar de la consola de desarrollador para mantener el botón de hamburguesa a la izquierda del logotipo/nombre de PROTOTIPE en ambos estados de colapso.
* **Causa Raíz:**
  - El usuario deseaba unificar el comportamiento en ambos layouts (ventas y dashboard) para que el botón de hamburguesa permanezca visible a la izquierda de la marca y alineado verticalmente con los iconos de la barra lateral, sirviendo de atajo intuitivo.
* **Solución Técnica:**
  - Reestructuración del área del Topbar izquierdo para mantener el botón de hamburguesa como primer elemento en el contenedor responsivo (`w-[64px]` vs `w-64`/`w-[220px]`).
  - Cuando está expandido, se renderizan el botón a la izquierda y el logotipo/nombre a la derecha (`justify-start gap-3`).
  - Cuando está colapsado, el botón se centra en la caja de 64px y el logotipo/nombre se renderiza fuera de la caja divisoria, desplazado a la derecha de la línea del sidebar.
  - Builds verificados en ambos directorios: ✅ `npm run build` exitoso.
* **Estatus:** ✅ Completado y verificado.✅ Completado y verificado.

### [2026-06-05] - Consola de Diagnóstico de Desarrollador en App Ventas y CLI (Tarea 207)
* **Tipo:** Feature / Robustez / Diagnóstico / CLI / Estandarización
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Consola_Diagnostico_Desarrollador/diagnostico_desarrollador.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Consola_Diagnostico_Desarrollador/diagnostico_desarrollador.md) [NEW] — Documentación técnica del componente de diagnóstico de desarrollador.
  - [`d:/Aplicaciones/App Ventas/src/components/admin/settings/DeveloperDiagnosticsModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/settings/DeveloperDiagnosticsModal.jsx) [NEW] — Componente de consola de diagnóstico técnico.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/admin/settings/DeveloperDiagnosticsModal.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/admin/settings/DeveloperDiagnosticsModal.jsx) [NEW] — Copia para plantilla de ventas.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/admin/settings/DeveloperDiagnosticsModal.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/admin/settings/DeveloperDiagnosticsModal.jsx) [NEW] — Copia para plantilla de core seed.
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY] — Integración del modal de diagnóstico con dynamic loading, validación de email y trigger de 7 clics en el footer de versión.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx) [MODIFY] — Integración idéntica en la plantilla de ventas.
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY] — Soporte para escribir `VITE_DEVELOPER_EMAIL` en `.env.local`.
* **Causa Raíz:**
  - Necesidad de una consola interactiva local y en caliente que permita al desarrollador depurar la configuración de variables de entorno, pings a bases de datos locales/centrales y realizar pruebas del estado VAPID y notificaciones Push.
* **Solución Técnica:**
  - Creación del componente `DeveloperDiagnosticsModal` con UI basada en pestañas HSL y operaciones de red/ping.
  - Inyección del trigger de 7 clics y validación de correo sobre `import.meta.env.VITE_DEVELOPER_EMAIL` en el flujo de ajustes de administrador.
  - Build verificado: ✅ `npm run build` exitoso.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-05] - Optimización de Plantillas y Generador de Aprovisionamiento (Prototipe-CLI, Tarea 206)
* **Tipo:** Feature / Refactorización / Automatización / Aprovisionamiento / SEO / Branding
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/centralFirebaseService.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/centralFirebaseService.js) [NEW] — Singleton para inicializar Firebase Central en la plantilla ventas.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/centralFirebaseService.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/centralFirebaseService.js) [NEW] — Singleton para inicializar Firebase Central en la plantilla semilla.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js) [MODIFY] — Consumo de `getCentralFirestore` desde el singleton.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/telemetryService.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/telemetryService.js) [MODIFY] — Consumo de `getCentralFirestore` desde el singleton.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/billingService.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/billingService.js) [MODIFY] — Consumo de `getCentralFirestore` desde el singleton.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/billingService.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/billingService.js) [MODIFY] — Consumo de `getCentralFirestore` desde el singleton y restauración de referencias (`ordersRef`, `SETTINGS_REF`).
  - [`D:/PROTOTIPE/Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY] — Inyección dinámica de llave VAPID en service worker; inyección y reemplazo dinámico de etiquetas meta SEO y título en `index.html`; generación automática de favicon/logo SVG de iniciales con color primario.
* **Causa Raíz:**
  - Alineación de las plantillas del CLI (`template-ventas` y `template-core-seed`) con las optimizaciones del Core para evitar colisiones de Firebase en Hot Reload.
  - Necesidad de automatizar la inyección de metatags SEO, la llave de notificaciones PUSH (VAPID) en el service worker, y de proveer un logo y favicon temporal de marca en los nuevos proyectos aprovisionados.
* **Solución Técnica:**
  - Propagación del singleton `centralFirebaseService.js` y refactorización de los servicios de telemetría y billing en las plantillas.
  - Parsers de expresiones regulares en `generator.js` para modificar `index.html` y `firebase-messaging-sw.js` al vuelo.
  - Script creador de archivos SVG inline usando las iniciales y la variable HSL del tema.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-05] - Unificación e Inicialización Segura de Firebase Central para Telemetría y Billing (Modo Spark)
* **Tipo:** Refactorización / Conectividad / Telemetría / Firebase
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/services/centralFirebaseService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/centralFirebaseService.js) [NEW] — Creación del singleton/proveedor único para la base de datos de control central, evitando inicializaciones concurrentes de la app secundaria `centralDevApp` en Hot Reload.
  - [`d:/Aplicaciones/App Ventas/src/services/telemetryService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/telemetryService.js) [MODIFY] — Importación y consumo de `getCentralFirestore` desde el nuevo servicio centralizado, simplificando importaciones y dependencias.
  - [`d:/Aplicaciones/App Ventas/src/services/billingService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/billingService.js) [MODIFY] — Refactorización para utilizar el mismo singleton de Firebase Central, unificando la escucha de configuración de comisiones en tiempo real.
* **Causa Raíz:**
  - Fallo en la comunicación de telemetría y lectura de billing. La inicialización duplicada de la app secundaria `centralDevApp` tanto en `telemetryService` como en `billingService` provocaba colisiones, impidiendo la lectura de comisiones del cliente y el posterior envío de reportes billing a la central.
* **Solución Técnica:**
  - Extracción y centralización del ciclo de vida de la app de Firebase `centralDevApp` a un módulo unificado.
  - Verificación de compilación: ✅ `npm run build` exitoso sin errores en el empaquetado.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-05] - Mejoras de Seguridad, Rendimiento y Bundle (Post-Auditoría, Tarea 204)
* **Tipo:** Seguridad / Rendimiento / Optimización de Bundle / UX
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [MODIFY] — Restricción de la colección `/notifications`: cambio de `read, write: if true` a `create: if true` y `read, update, delete: if isAdmin()`, previniendo escritura maliciosa de terceros no autenticados.
  - [`d:/Aplicaciones/App Ventas/src/services/pdfService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/pdfService.js) [MODIFY] — Migración de imports estáticos de `jsPDF` y `jspdf-autotable` a importaciones dinámicas (`await import(...)`) dentro de las 3 funciones exportadoras (`exportSalesReportPDF`, `exportRotationReportPDF`, `exportDeveloperReceiptPDF`). Esto elimina el peso de ambas librerías (~430 KB minificados) del bundle inicial del cliente.
  - [`d:/Aplicaciones/App Ventas/src/hooks/useInventory.js`](file:///d:/Aplicaciones/App%20Ventas/src/hooks/useInventory.js) [MODIFY] — Limitación de la precarga silenciosa de imágenes del catálogo a los primeros 12 productos (`products.slice(0, 12)`) para evitar saturación del ancho de banda en conexiones móviles lentas con catálogos de más de 50 artículos.
* **Causa Raíz:**
  - Hallazgos identificados en la auditoría general del sistema POS (`auditoria_general_sistema_pos.md`) y en el informe de seguridad/rendimiento (`auditoria_seguridad_rendimiento_pwa.md`): reglas de Firestore abiertas en `/notifications`, jsPDF cargado estáticamente en el bundle del cliente, y precarga masiva de imágenes sin límite.
* **Solución Técnica:**
  - Endurecimiento de reglas de seguridad en Firestore con separación clara de permisos por rol.
  - Lazy loading asíncrono de librerías PDF, diferiendo la carga solo al momento de exportación administrativa.
  - Precarga inteligente limitada a 12 imágenes para proteger el rendimiento en conexiones lentas.
  - Build verificado: ✅ `npm run build` exitoso en 1.40s sin errores de compilación.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-05] - Implementación de Robustez de Red, Máscara de Moneda (COP) y Empty States Premium (Tareas 201-203)

* **Tipo:** UI/UX / Robustez / Formulario / Animaciones / Conectividad
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/components/ui/ConnectivityToast.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/ConnectivityToast.jsx) [NEW] — Creación del toast reactivo de conectividad online/offline.
  - [`d:/Aplicaciones/App Ventas/src/App.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/App.jsx) [MODIFY] — Importación e inyección del toast de conectividad.
  - [`d:/Aplicaciones/App Ventas/src/components/ui/CurrencyInput.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/CurrencyInput.jsx) [NEW] — Creación del componente de entrada de moneda COP con máscara en caliente y retorno numérico limpio.
  - [`d:/Aplicaciones/App Ventas/src/components/admin/inventory/ProductFormModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY] — Reemplazo de NumberInput de precios por CurrencyInput.
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSales.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSales.jsx) [MODIFY] — Reemplazo del input de precio unitario por CurrencyInput.
  - [`d:/Aplicaciones/App Ventas/src/components/ui/EmptyState.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/EmptyState.jsx) [NEW] — Creación del componente interactivo de empty state.
  - [`d:/Aplicaciones/App Ventas/src/pages/client/ClientOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientOrders.jsx) [MODIFY] — Reemplazo de vistas vacías de pedidos especiales y generales por el nuevo componente EmptyState con redirección de catálogo.
* **Causa Raíz:**
  - El sistema carecía de alertas visuales de estado de red en tiempo real, máscaras de entrada de moneda en COP que prevengan fallos con Zod, y estados de lista vacía visualmente interactivos.
* **Solución Técnica:**
  - Desarrollo de ConnectivityToast con listeners de conexión globales.
  - Desarrollo de CurrencyInput con sanitización del DOM y propagación de enteros crudos.
  - Desarrollo de EmptyState con micro-animaciones elásticas de Framer Motion.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-05] - Implementación de 3 Vías de Carga de Imágenes en Creación de Producto (Tarea 200)
* **Tipo:** UI/UX / Robustez / Formulario
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/components/admin/inventory/ProductFormModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY] — Integración del campo de URL directo en las imágenes de variantes, y en la galería secundaria, garantizando 3 opciones uniformes de carga (Galería, Cámara y URL directa).
* **Causa Raíz:**
  - El administrador no disponía de la opción de ingresar un enlace URL directo para las imágenes secundarias y variantes del producto, limitando la carga al almacenamiento físico (Storage).
* **Solución Técnica:**
  - Se agregó el estado local `tempGalleryUrl` y un campo de entrada con botón "Añadir" en la galería de imágenes secundarias.
  - Se inyectó una caja de texto de URL directa debajo de las opciones de subida de archivos en cada variante individual.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-05] - Integración de Telemetría Automática y Estandarización Global (Core & Semillas)
* **Tipo:** Feature / Robustez / Ecosistema Bridge / Estándar / Documentación
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/Aplicaciones/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY] — Adición de la suscripción reactiva a `subscribeToBillingData` y disparo asíncrono en segundo plano a `reportMonthlyBillingToDeveloper`.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js) [MODIFY] — Replicación idéntica del hook en la plantilla de lienzo limpio para heredar nativamente la telemetría a futuro.
  - [`D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY] — Replicación idéntica del hook en la plantilla de ventas.
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/inicializacion_nuevos_proyectos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/inicializacion_nuevos_proyectos.md) [MODIFY] — Creación del Paso 8.5 que establece la directiva y protocolo obligatorio de telemetría automática en caliente para cualquier proyecto desde cero.
* **Causa Raíz:**
  - La telemetría requería reportarse manualmente y no de forma fluida ante cambios en ventas o facturación mensual en segundo plano. A su vez, se requería asegurar esta capacidad por directiva para que cualquier aplicación futura la incorpore.
* **Solución Técnica:**
  - Integración del listener `subscribeToBillingData` en `useAppConfigSync.js`.
  - Propagación a plantillas del CLI (`template-core-seed` y `template-ventas`).
  - Documentación del estándar obligatorio en la guía de inicialización de nuevos proyectos (Paso 8.5).
* **Estatus:** ✅ Completado y verificado.

### [2026-06-05] - Estabilización, Try/Catch de Créditos, Scroll Lock, Transiciones de Modales y Fix de Referencia en Configuración (Tarea 198)
* **Tipo:** Bugfix / Robustez / Seguridad / UI/UX / Rendimiento
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY] — Destructuración e inicialización de `couponsEnabled` desde el store global `config` para solucionar el `ReferenceError` que bloqueaba el panel de ajustes con pantalla blanca.
  - [`d:/Aplicaciones/App Ventas/src/pages/client/ClientCredits.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY] — Adición de bloques `try/catch` para proteger la llamada asíncrona de creación de notificaciones de abono y pago de crédito, asegurando la redirección de WhatsApp.
  - [`d:/Aplicaciones/App Ventas/src/components/admin/orders/OrderShareModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/orders/OrderShareModal.jsx) [MODIFY] — Remoción del early return `if (!isOpen) return null`, permitiendo que la transición `exit` de Framer Motion se ejecute.
  - [`d:/Aplicaciones/App Ventas/src/components/client/catalog/ClientFilterModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ClientFilterModal.jsx) [MODIFY] — Remoción del early return, inyección de scroll lock en el body al abrir y liberación en el cleanup de `useEffect`.
  - [`d:/Aplicaciones/App Ventas/src/components/client/catalog/WholesaleRequestModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/WholesaleRequestModal.jsx) [MODIFY] — Remoción de early return y ajuste de marcado reactivo para Framer Motion.
  - [`d:/Aplicaciones/App Ventas/src/services/accessLogService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/accessLogService.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/services/adService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/adService.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/services/appConfigService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/appConfigService.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/services/claimsService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/claimsService.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/services/creditService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/creditService.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/services/deliveryService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/deliveryService.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/services/orderService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/orderService.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/services/productionService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/productionService.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/services/tableService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/tableService.js) [MODIFY] — Adición de callbacks de error robustos en llamadas `onSnapshot` de Firebase para prevenir excepciones silenciosas.
* **Causa Raíz:**
  - El panel de configuración arrojaba `ReferenceError: couponsEnabled is not defined` por falta de extracción del store global en `AdminSettings.jsx`.
  - Reportes de auditoría indicaron fugas de sockets Firebase por falta de callbacks de error, crashes en abonos por promesas fallidas y animaciones toscas en cierres de modales.
* **Solución Técnica:**
  - Corrección de la variable `couponsEnabled` mediante destructuring de `config`.
  - Capturas `try/catch` agregadas a `createCreditNotification`.
  - Modales estructurados con renderizado condicional interno de JSX permitiendo que `<AnimatePresence>` capte el desmontaje y ejecute las animaciones `exit`.
  - Control de error `(error) => { console.error(...); callback([]) }` añadido a todos los `onSnapshot` en servicios core.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-05] - Auditoría de Seguridad, Robustez, Rendimiento y UI/UX de la Aplicación Core (Tarea 197)
* **Tipo:** Auditoría / Seguridad / Robustez / Rendimiento / UI/UX
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_seguridad_rendimiento_pwa.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_seguridad_rendimiento_pwa.md) [NEW] — Creación del informe de auditoría preventivo con la severidad, ubicación, causa raíz y propuestas concretas de código para corregir los hallazgos.
  - [`d:/Aplicaciones/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/Aplicaciones/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY] — Registro e indexación semántica del nuevo archivo de auditoría para la IA.
* **Causa Raíz:**
  - Solicitud de auditoría técnica generalizada enfocada en la robustez de suscripciones Firestore, control de excepciones asíncronas y usabilidad/responsividad móvil.
* **Solución Técnica:**
  - Creación del documento de auditoría identificando 2 hallazgos críticos de fugas de memoria, 2 hallazgos medios sobre control de errores y try/catch, y 2 hallazgos bajos de UI/UX (desplazamientos de fondo y animaciones Framer Motion rotas).
* **Estatus:** ✅ Completado y verificado.

### [2026-06-05] - Aislamiento en PDF/POS/Admin/Pantallas de Caja, Purgado de Mesas, Remoción de Precio Propio en Variantes y Solución a Error de Validación Zod (Tareas 191-196)
* **Tipo:** Bugfix / UI/UX / Limpieza de Código / Facturación / Modularidad Ecosistema / Formulario / Configuración de Marca / Robustez
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/components/admin/inventory/ProductFormModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY] — Remoción del campo y funcionalidad "Precio Propio (Opcional)" en el formulario de variantes; reajuste del layout a 2 columnas para SKU y Foto de variante; inyección de `estado: formData.estado || undefined` en el payload de validación para solucionar el crash al guardar ("Invalid option").
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY] — Purga definitiva del código muerto de las mesas (remoción de las funciones `TableQRModal` y `AdminTablesCRUD`); ocultamiento dinámico de la pestaña de menú "Cupones de Descuento" y condicionamiento de la vista si `couponsEnabled` es falso.
  - [`d:/Aplicaciones/App Ventas/src/services/pdfService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/pdfService.js) [MODIFY] — Filtrado y exclusión de registros de crédito históricos en la función del reporte financiero de ventas PDF si el módulo de créditos (`creditsEnabled`) está desactivado.
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY] — Reajuste dinámico a 2 columnas en el grid de métricas de pedidos y filtrado de créditos históricos del listado y de la métrica de completados si `creditsEnabled` es falso; visualización condicional de la fila de descuentos en totales de tarjeta condicionada a `couponsEnabled`.
  - [`d:/Aplicaciones/App Ventas/src/pages/portal/PortalVendedor.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY] — Ocultamiento dinámico de la opción de pago "Crédito" del POS del vendedor si `creditsEnabled` está deshabilitado.
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminHome.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY] — Filtrado de pedidos a crédito en métricas financieras generales, caja total hoy, y desglose de métodos de pago históricos en el inicio de admin si `creditsEnabled` es falso.
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSalesDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY] — Exclusión de transacciones a crédito en el total facturado, recuento de pedidos y ranking de productos en la pantalla de análisis de ventas si `creditsEnabled` es falso.
* **Causa Raíz:**
  - El reporte financiero PDF, la caja diaria, la pantalla de análisis de ventas y la lista de pedidos seguían sumando las transacciones de créditos históricos y listándolas en la tabla de detalles incluso con el módulo deshabilitado, causando descuadres con el desglose de totales de cabecera y en pantalla.
  - El panel de configuración del administrador seguía mostrando el tab y la interfaz de "Cupones de Descuento" en la barra de menú a pesar de que el módulo estuviera apagado dinámicamente.
  - Los campos SKU, Precio Propio y Foto en la sección de variantes estaban desalineados. Precio Propio duplicaba el propósito comercial al contar ya con precio base general y precio de costo.
  - Zod fallaba al guardar un producto nuevo debido a que `estado` llegaba como `null` en el formulario, lo que violaba la validación de tipo enum opcional de Zod (que no acepta `null` sino `undefined` para aplicar el valor por defecto).
  - Componentes del módulo de mesas inactivos seguían declarados en `AdminSettings.jsx` ocupando espacio sin uso en el bundle.
* **Solución Técnica:**
  - **Aislamiento en PDF y Pantallas del Admin:** Se añadió un filtro para ignorar registros a crédito en `exportSalesReportPDF`, `AdminSalesDetail`, `AdminOrders` y `AdminHome` si `creditsEnabled === false`.
  - **Ajustes en POS y AdminOrders:** Se condicionó el botón de crédito en el POS vendedor y las métricas e importes de descuento en AdminOrders mediante flags reactivos del store.
  - **Configuración de Módulos Dinámica:** Se ocultó el menú de cupones en la barra lateral del administrador si `couponsEnabled === false`.
  - **Inventario Limpio:** Remoción del input de "Precio Propio", reajuste del grid de variantes a `grid-cols-2` y transformación de `formData.estado` falsy a `undefined` antes de parsear con Zod en `handleSubmit`.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-05] - Aislamiento Dinámico de Módulos, Soporte DropUp en CustomSelect, Fix en Validación de Inventario y Remociones de UI en Mesa/QR (Tareas 185-190)
* **Tipo:** Bugfix / UI/UX / Modularidad Ecosistema / Formulario / Configuración de Marca / Robustez
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/components/admin/inventory/ProductFormModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY] — Corrección en `validateStep(5)` para que las variantes de color/talla sean completamente opcionales, permitiendo continuar y guardar; marcado explícito de campos opcionales en UI (paso 2 y paso 5); se agregó `dropUp={true}` en el selector de categoría.
  - [`d:/Aplicaciones/App Ventas/src/components/ui/CustomSelect.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/CustomSelect.jsx) [MODIFY] — Implementación de la propiedad `dropUp` para abrir la lista desplegable hacia arriba con clase `bottom-12` y animación optimizada, evitando clipping en modales.
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminHome.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY] — Corrección del margen superior del logo de marca (`marginTop: '0.5rem'`); remoción definitiva del acceso rápido fijo a "Configuración" y "Rendimiento QR", dejando solo accesos rápidos operativos autolimitados.
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY] — Remoción del switch de UI "Módulo de Pedidos en Mesa y Autoservicio QR" en la gestión de módulos.
  - [`d:/Aplicaciones/App Ventas/src/pages/client/ClientProfile.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientProfile.jsx) [MODIFY] — Aislamiento del acceso directo "Mis Créditos" condicionado dinámicamente a `creditsEnabled`.
  - [`d:/Aplicaciones/App Ventas/src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY] — Aislamiento dinámico de la sección de cupones de descuento ligada a `couponsEnabled`; corrección en el cálculo de descuento.
* **Causa Raíz:**
  - Los módulos desactivados desde el administrador (como Créditos u Ofertas) seguían mostrando accesos o permitiendo flujos en el cliente y administrador, causando confusión.
  - El selector de categoría en el wizard de creación de producto se desplegaba hacia abajo y quedaba tapado por los botones del modal, imposibilitando el scroll.
  - El wizard del producto en el paso 5 exigía obligatoriedad de talla y color cuando se activaban los filtros globales, lanzando errores de Zod ("invalid input") y obligando al administrador a ingresar variables no deseadas.
  - El logo del negocio en AdminHome no tenía suficiente margen superior y se encimaba al borde de la tarjeta.
* **Solución Técnica:**
  - **Aislamiento de Módulos:** Se envolvieron secciones con condicionales reactivos basados en `creditsEnabled` y `couponsEnabled`.
  - **DropUp en CustomSelect:** Soporte dinámico para `dropUp` posicionando el contenedor de la lista con `bottom-12 mb-1` en lugar de `top-12 mt-1`.
  - **Inventario Flexible:** Remoción de la validación estricta de color y talla en `validateStep(5)`, validando únicamente que el stock no sea vacío ni menor que cero.
  - **Limpieza de UI de Mesa:** Remoción de los elementos del switch JSX de Mesa y QR, dejando intacto el backend/store de configuración para no romper dependencias inactivas del core.
  - Build verificado: ✅ `npm run build` exitoso sin errores en 858ms.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-04] - Rediseño Premium Multi-tab, Módulo CRM y Gráficos Adaptativos en dev-dashboard (Tarea 184)
* **Tipo:** UI/UX / Dashboard / Feature / Recharts / Framer Motion
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY] — Navegación multi-tab, layouts responsivos adaptativos para Inicio, CRM, Facturación, Terminal y Ajustes; integración de gráficos SVG con Recharts y transiciones fluidas con Framer Motion; corrección de contrastes de color en botones de telemetría y consola en modo claro/oscuro.
* **Causa Raíz:**
  - El dashboard original presentaba un diseño plano de una sola página en scroll vertical, con widgets encimados y baja adaptabilidad a dispositivos móviles. El modal de clientes original carecía de gráficos de rendimiento y la configuración comisional no era modificable de forma dedicada en pantalla completa.
* **Solución Técnica:**
  - **Estructura Multi-tab:** Sidebar interactivo para desktop y Bottom Nav para móviles.
  - **Integración de Recharts:** Sustitución de las barras manuales CSS de comisiones por un `<BarChart>` SVG premium; nuevo `<LineChart>` de tendencia de comisiones acumuladas mensuales; `<AreaChart>` de volumen de ventas brutas; y `<PieChart>` donut en el CRM para la proporción cobrada/pendiente por cliente.
  - **Transiciones Framer Motion:** Implementación de `<AnimatePresence>` para cambios de vista suaves e indicadores interactivos fluidos (`layoutId`).
  - **Alineación Cromática Adaptativa:** Reescritura de los botones "Enviar Telemetría de Prueba", "Registrar Pago" y "Alternar Entorno" usando clases Tailwind transparentes al tema (`bg-indigo-650 dark:bg-indigo-500 hover:bg-indigo-500`) y resolviendo el bug de invisibilidad en modo claro.
  - Build verificado: ✅ `npm run build` exitoso y verificado en 1.08s.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-04] - Explorador de Biblioteca de Componentes en dev-dashboard (Tarea 183)
* **Tipo:** Feature / UI / Arquitectura
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY] — Nueva pestaña "Biblioteca", estados, función `renderLibrarySection()`, `loadLibrary()`, integración en sidebar desktop y bottom nav móvil.
  - [`D:/PROTOTIPE/Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — Nuevo endpoint `GET /api/library` que parsea el `README.md` de la Biblioteca de Componentes y devuelve un JSON estructurado de categorías y componentes con tags semánticos.
* **Causa Raíz:**
  - La Biblioteca de Componentes solo era accesible mediante navegación manual de archivos Markdown. No existía una interfaz de búsqueda rápida para que la IA o el desarrollador localizaran componentes reutilizables durante el desarrollo.
* **Solución Técnica:**
  - **Backend (`server.js`):** Endpoint `/api/library` parsea el `README.md` con regex para extraer categorías (`### N. 📂 Nombre`), componentes (`* [Nombre](link): descripción`) y tags automáticos inferidos del contenido (firebase, hook, modal, ecommerce, pwa, etc.).
  - **Frontend (`App.jsx`):** Nueva pestaña "Biblioteca" con buscador fuzzy Levenshtein, filtro de categoría y tag, grid de tarjetas con preview de descripción y tags coloreados, y panel de detalle lateral (Drawer) con botón de copia de ruta de la ficha técnica.
  - **Auto-carga:** El catálogo se carga automáticamente al navegar por primera vez a la pestaña "Biblioteca" (lazy loading para no afectar el arranque del dashboard).
  - Build verificado: ✅ `npm run build` exitoso en 695ms sin errores.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-04] - Automatización de Integridad y Sincronización Dinámica de GEMINI.md
* **Tipo:** Automatización / Estándares / Integridad / DevOps
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [NEW]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - Todos los `GEMINI.md` de subproyectos y plantillas (App Ventas, dev-dashboard, Prototipe-CLI) [MODIFY]
* **Causa Raíz:**
  - Evitar la desalineación de directrices de comportamiento en la IA cuando se modifican las reglas centrales de comportamiento.
  - Asegurar de forma automatizada y proactiva que cualquier nueva plantilla agregada en `Prototipe-CLI/templates/` herede inmediatamente su archivo `GEMINI.md` actualizado sin requerir intervención manual del usuario.
* **Solución Técnica:**
  - Creación del script `sync_rules.js` en Node.js que escanea de forma dinámica los subproyectos en `D:\PROTOTIPE\` y las plantillas en `Prototipe-CLI\templates\`, copiando y validando la firma del `GEMINI.md` maestro.
  - Inyección del script `sync_rules.js` dentro del disparador `@postchange` en el `GEMINI.md` maestro, logrando una auto-propagación en cascada en cada ciclo de integridad.
* **Estatus:** ✅ Completado y ejecutado con 100% de éxito.

### [2026-06-04] - Rediseño Responsivo, Notas y Buscador Tolerante en dev-dashboard (Tarea 182)
* **Tipo:** UI/UX / Mobile Responsiveness / Layout / Refactoring / Search / Note-Taking
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY]
  - [`d:/Aplicaciones/dev-dashboard/src/index.css`](file:///d:/Aplicaciones/dev-dashboard/src/index.css) [MODIFY]
* **Causa Raíz:**
  - El Dashboard de Desarrollador carecía de adaptabilidad responsive, buscador tolerante a fallos de digitación, un espacio para organizar ideas/tareas/recordatorios de desarrollo, y el interruptor de modo oscuro no estaba integrado en una pestaña dedicada de Ajustes.
* **Solución Técnica:**
  - **Navegación Móvil (Bottom Tab Bar):** Barra de navegación inferior fija con desenfoque de fondo y soporte para área segura (`pb-safe`) en dispositivos móviles.
  - **Ajustes y Modo Oscuro:** Se reestructuró la sección de 'Ecosistema' a 'Ajustes' e integró el control de Modo Oscuro (`DarkModeToggle`) en su interior.
  - **Búsqueda con Tolerancia a Errores:** Implementación de algoritmo Levenshtein para búsqueda aproximada tolerante a errores de digitación en CRM, Facturas y Notas.
  - **Notas del Desarrollador (Dev Notes):** Nuevo módulo para ideas, recordatorios y tareas pendientes con persistencia en LocalStorage y Firestore central.
  - Build verificado: ✅ `npm run build` exitoso sin advertencias ni errores.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-04] - Ajuste de Contexto de Negocio a Aplicaciones a la Medida e Higienización de la Biblioteca
* **Tipo:** Reestructuración de Documentación / Reglas IA / Higienización de Componentes / Manual de Servicios / Core
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/contexto_negocio_aplicaciones_medida.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/contexto_negocio_aplicaciones_medida.md) [NEW]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/contexto_negocio_prototipe.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/contexto_negocio_prototipe.md) [DELETE]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_nichos_servicios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_nichos_servicios.md) [NEW]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/estrategia_negocio.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/estrategia_negocio.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Checkout_Modal/checkout_modal.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Checkout_Modal/checkout_modal.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Carrito_Completo/carrito_completo.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Carrito_Completo/carrito_completo.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Pedidos_y_Gestion/Tarjeta_Pedido_Admin/tarjeta_pedido_admin.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Pedidos_y_Gestion/Tarjeta_Pedido_Admin/tarjeta_pedido_admin.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/GEMINI.md`](file:///d:/Aplicaciones/App%20Ventas/GEMINI.md) [MODIFY]
  - [`d:/Aplicaciones/dev-dashboard/GEMINI.md`](file:///d:/Aplicaciones/dev-dashboard/GEMINI.md) [MODIFY]
  - [`d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/GEMINI.md`](file:///d:/Aplicaciones/Prototipe-CLI/templates/template-ventas/GEMINI.md) [MODIFY]
  - [`d:/Aplicaciones/Prototipe-CLI/templates/template-core-seed/GEMINI.md`](file:///d:/Aplicaciones/Prototipe-CLI/templates/template-core-seed/GEMINI.md) [MODIFY]
* **Causa Raíz:**
  - Petición crítica del usuario para redefinir el contexto comercial eliminando la restricción de "plataforma Ecosistema" y reconociendo a PROTOTIPE como una fábrica de aplicaciones personalizadas a la medida para pymes y emprendedores (potenciando ventas, inventarios, servicios y fidelización).
  - Presencia de contaminación y acoplamientos rígidos a la aplicación de ventas en componentes de la biblioteca de componentes (checkout, carrito, tarjetas de pedido) que limitaban su portabilidad a otros nichos.
  - Necesidad de añadir guías técnicas y esquemas de datos específicos para industrias de servicios técnicos y operaciones físicas (como tornerías o contratistas) que requieren flujos no tradicionales.
* **Solución Técnica:**
  - Creación del Manifiesto de Negocio enfocado en Soluciones a la Medida, depuración de archivos obsoletos y actualización de los mapas de navegación de la IA.
  - Redacción del Manual de Verticales de Servicios y Operaciones Técnicas a la Medida (`manual_nichos_servicios.md`), definiendo esquemas de datos JSON, workflows de estado y plantillas de WhatsApp para 8 nichos de servicio en LATAM.
  - Corrección de sintaxis en `CheckoutModal` y desacoplamiento de atributos en `CheckoutModal`, `CartDrawer` y `OrderCard` en la biblioteca para renderizar pares clave-valor dinámicos en lugar de strings de indumentaria fijos (talla/color).
  - Propagación de las reglas directivas actualizadas a la copia de seguridad, proyectos activos y plantillas del CLI (`template-ventas`, `template-core-seed`).
* **Estatus:** ✅ Completado y verificado.

### [2026-06-04] - Propuesta de Rediseño de Consola Central Ecosistema (PROTOTIPE)
* **Tipo:** Documentación / Estándares / UI/UX / Branding
* **Archivo(s) Modificado(s):**
  - [NEW] [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Visualizacion/propuesta_redisenio_dev_dashboard.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Visualizacion/propuesta_redisenio_dev_dashboard.md) [NEW]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
* **Causa Raíz:**
  - Necesidad de estructurar una propuesta formal de diseño de interfaz (UI/UX) para mejorar visual y estéticamente el Dashboard del Desarrollador (Ecosistema Central Cockpit) alineado con los valores y colores de la marca corporativa PROTOTIPE, sin reemplazar elementos funcionales.
* **Solución Técnica:**
  - Creación del documento de propuesta técnica detallando la paleta de colores de marca, tipografía Outfit/Fira Code, efecto cristalino glassmorphism, elevaciones con hover y la reorganización de los paneles de telemetría y CRM de clientes.
  - Registro de la propuesta en el mapa semántico y en el roadmap de tareas pendientes.
* **Estatus:** ✅ Completado.

### [2026-06-04] - Corrección Global de Bordes Negros: Registro @theme inline (BUG-032)
* **Tipo:** Bugfix Crítico / CSS / Tailwind v4 / Sistema de Diseño
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/index.css`](file:///d:/Aplicaciones/App%20Ventas/src/index.css) [MODIFY]
* **Causa Raíz:**
  - Ausencia del bloque `@theme inline` en `index.css`. En Tailwind v4, sin este bloque los tokens como `border-primary`, `bg-primary/10`, `text-primary`, `border-primary/15`, etc., **no están registrados** como utilidades de Tailwind y el navegador aplica el color por defecto (negro) para los bordes. Todas las tarjetas, inputs, modals y botones que usaban clases `border-primary/*` se pintaban con borde negro independientemente del tema activo.
* **Solución Técnica:**
  - Se insertó el bloque `@theme inline { ... }` inmediatamente después de `@import "tailwindcss"`. Este bloque mapea cada CSS variable del sistema de temas (`--color-primary`, `--color-border`, `--color-surface`, etc.) como un token de color de Tailwind v4, usando `var(--color-*)`. Esto permite que TODAS las clases utilitarias de Tailwind con prefijo de color de tema (incluidas variantes de opacidad `/10`, `/15`, `/20`) lean siempre del valor dinámico del `data-theme` activo.
  - Build verificado: ✅ `npm run build` exitoso en 1.27s sin errores.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-04] - Rediseño de Alerta de Bienvenida en Login (BUG-031)
* **Tipo:** UI/UX / Diseño / Login
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/LoginPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
* **Causa Raíz:**
  - El cuadro de bienvenida y registro para nuevos clientes de la tienda contenía un borde negro tosco/duro que no se alineaba con la estética visual premium definida para el proyecto.
* **Solución Técnica:**
  - Se eliminó el borde oscuro rústico y el fondo gris opaco. Se implementó una tarjeta con fondo en mezcla traslúcida del color primario de la marca (`bg-primary/[0.04]`), bordes suavizados basados en una escala semitransparente del mismo tono primario (`border-primary/10`) y un emoji descriptivo, garantizando un acabado minimalista e integrado al tema del cliente.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-04] - Corrección de Emojis Rotos en Mensajes de WhatsApp (BUG-030)
* **Tipo:** Bugfix / Core / Integración / Emojis / WhatsApp
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
* **Causa Raíz:**
  - Los iconos/emojis inline literales dentro del mensaje predeterminado de WhatsApp se visualizaban rotos como el carácter de reemplazo Unicode () en la pantalla de envío del cliente final. Esto se producía debido a la corrupción de caracteres multibyte durante el empaquetado de Vite o la codificación de archivos locales de Windows.
* **Solución Técnica:**
  - Se migraron todos los emojis literales dentro del mapa `e` y los strings del mensaje de Checkout en `CheckoutModal.jsx` a secuencias de escape unicode UTF-16 surrogate pairs (`\uXXXX\uXXXX`) puras. Al ser texto plano ASCII puro, son inmunes a discrepancias de compilación o codificación de ficheros y el navegador del cliente las resuelve dinámicamente en runtime.
* **Estatus:** ✅ Completado y verificado mediante compilación de Vite exitosa.

### [2026-06-04] - Limpieza de Constantes de Ventas en Plantilla Semilla (BUG-029)
* **Tipo:** Refactorización / Core Seed / CLI / Constantes
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/Prototipe-CLI/templates/template-core-seed/src/constants/index.js`](file:///d:/Aplicaciones/Prototipe-CLI/templates/template-core-seed/src/constants/index.js) [MODIFY]
  - [`D:/PROTOTIPE/App-veterinaria-huellas/src/constants/index.js`](file:///D:/PROTOTIPE/App-veterinaria-huellas/src/constants/index.js) [MODIFY]
* **Causa Raíz:**
  - El archivo `src/constants/index.js` de la plantilla `template-core-seed` contenía por error todas las constantes de la aplicación de ventas (roles de cocinero/mesero, estados de pedidos al por mayor, métodos de pago retail, colecciones de productos/mesas, etc.), confundiendo a los agentes de IA al crear aplicaciones desde cero para otros nichos (como agendamiento veterinario).
* **Solución Técnica:**
  - Se purgaron por completo todas las referencias transaccionales y logísticas de ventas del archivo de constantes de la semilla, dejándolo únicamente con constantes genéricas de soporte (roles base de admin/client/employee, colecciones de config/users/notifications, soporte y dev PIN).
  - Se replicó el archivo saneado en la veterinaria activa para desbloquear su desarrollo limpio.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-04] - Corrección de Bugs de Aprovisionamiento y Soporte custom-brand (BUG-028)
* **Tipo:** Bugfix / Core / CLI / Aprovisionamiento / Temas
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/Prototipe-CLI/generator.js`](file:///d:/Aplicaciones/Prototipe-CLI/generator.js) [MODIFY]
  - [`d:/Aplicaciones/Prototipe-CLI/templates/template-core-seed/src/constants/palettes.js`](file:///d:/Aplicaciones/Prototipe-CLI/templates/template-core-seed/src/constants/palettes.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/constants/palettes.js`](file:///d:/Aplicaciones/App%20Ventas/src/constants/palettes.js) [MODIFY]
* **Causa Raíz:**
  - **Bug de Espacios:** El payload del CLI escribía credenciales de Firebase en `.env.local` con espacios en blanco iniciales (ej. `VITE_FIREBASE_PROJECT_ID = prueba-veterinaria-...`), provocando fallos silenciosos de conexión en la inicialización de Firebase.
  - **Bug de Tema custom-brand:** Al seleccionar una paleta de colores personalizada en el Wizard, la app se configuraba con el tema `'custom-brand'`. Sin embargo, este ID no estaba declarado en el mapa de temas `ADVANCED_PALETTES` de `palettes.js`, provocando fallos al cargar los colores de la marca.
* **Solución Técnica:**
  - Se añadió sanitización de variables aplicando `.trim()` a todos los valores de Firebase en `generator.js` antes de la escritura de `.env.local`.
  - Se declaró de forma nativa la paleta `'custom-brand'` dentro de `ADVANCED_PALETTES` en el core semilla y en la app de ventas, estructurada para leer variables CSS flexibles (`var(--color-primary-custom)`) que soportan modo claro/oscuro de forma dinámica.
* **Estatus:** ✅ Completado y corregido en el generador y plantillas.

### [2026-06-04] - Protocolo de Autocorrección y Documentación ante Fallos de Despliegue de Firebase CLI
* **Tipo:** Estándares / Documentación / Robustez / Despliegues
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/inicializacion_nuevos_proyectos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/inicializacion_nuevos_proyectos.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/manual_prototipe_cli.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/manual_prototipe_cli.md) [MODIFY]
* **Causa Raíz:**
  - El aprovisionamiento de un nuevo proyecto desde el Dashboard Dev o la CLI local puede fallar en el paso de despliegue de reglas/índices a Firebase si el CLI de Firebase del sistema no tiene una sesión activa autorizada en la cuenta de Google correspondiente, deteniendo la automatización o arrojando advertencias persistentes.
* **Solución Técnica:**
  - Se formalizó y documentó el protocolo de resiliencia y autocorrección de errores de Firebase CLI.
  - Para entornos locales de desarrollo, la IA debe indicar inmediatamente al usuario ejecutar `firebase login --reauth` para autorizar interactivamente la consola.
  - Para entornos automatizados o de CI/CD (Servidores), se inyectó la regla de usar la variable de entorno `FIREBASE_TOKEN` generada con `firebase login:ci` y anexarla con el parámetro `--token` en el comando de despliegue del API Bridge.
* **Estatus:** ✅ Completado y documentado en el sistema de estándares global.

### [2026-06-04] - Implementación del modo "Crear desde cero" (Core Seed) en el Motor de Aprovisionamiento
* **Tipo:** Nueva Capacidad / Arquitectura Ecosistema / CLI / Dashboard Dev
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/Prototipe-CLI/generator.js`](file:///d:/Aplicaciones/Prototipe-CLI/generator.js) [MODIFY]
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/manual_prototipe_cli.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/manual_prototipe_cli.md) [MODIFY]
  - [NEW] [`d:/Aplicaciones/Prototipe-CLI/templates/template-core-seed/`](file:///d:/Aplicaciones/Prototipe-CLI/templates/template-core-seed/) [NEW]
* **Causa Raíz:**
  - Requerimiento de negocio para habilitar un modo de lienzo limpio ("Crear desde cero") que conserve todas las automatizaciones de aprovisionamiento (branding, bases de datos Firebase, feature flags y cobro comisional) pero sin clonar los catálogos ni la UI específica de la plantilla vertical de ventas (`template-ventas`).
* **Solución Técnica:**
  - **Creación de `template-core-seed`:** Se configuró un núcleo base que contiene únicamente los archivos compartidos estáticos y reutilizables de infraestructura (`telemetryService.js`, `billingService.js`, `appConfigStore.js`, `authStore.js`, etc.) y archivos de ruteo (`AppRoutes.jsx`) y loaders (`AppLoader.jsx`) completamente limpios y vacíos.
  - **Inyección de Directrices de Calidad Modular:** Se modificó el generador en `Prototipe-CLI` para inyectar en `antigravity_bootstrap_prompt.md` reglas de desarrollo modular component-first (1 archivo por componente visual, separación en stores Zustand y hooks lógicos) cuando se utiliza la plantilla seed.
  - **Dashboard Dev:** Se integró la opción visual en el Wizard de aprovisionamiento del desarrollador para seleccionar "Crear desde cero" mapeado a `template-core-seed`, y se compilaron con éxito los bundles en Vite (`npm run build`).
* **Estatus:** ✅ Completado y verificado mediante prueba de compilación en el destino con 100% de éxito (`512 modules transformed`).

### [2026-06-03] - Corrección de Reglas de Seguridad en Proyecto Central de Control (BUG-027)
* **Tipo:** Bugfix / Despliegue / Seguridad / Telemetría
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/firestore.rules`](file:///d:/Aplicaciones/dev-dashboard/firestore.rules) [DEPLOYED]
* **Causa Raíz:**
  - El proyecto de control central (`prototipe-multi-instancia-control`) tenía desplegadas por error las reglas de seguridad de Firestore de la plantilla cliente (`App Ventas`). Debido a esto, no existían reglas de coincidencia para las colecciones `/reportesBilling/{reportId}`, `/tokens/{tokenId}` ni `/clientes_control/{clientId}`, denegando todas las operaciones de lectura/escritura de telemetría y facturación central con errores `FirebaseError: Missing or insufficient permissions`.
* **Solución Técnica:**
  - Se desplegaron las reglas de seguridad correctas ubicadas en `d:/Aplicaciones/dev-dashboard/firestore.rules` al proyecto central de control (`prototipe-multi-instancia-control`) mediante el comando `firebase deploy --only firestore:rules` ejecutado en el contexto del panel de desarrollo. Esto restaura la autorización para reportes y lecturas de configuración comisional de forma segura y controlada mediante token.
* **Estatus:** ✅ Desplegado y corregido exitosamente.

### [2026-06-03] - Hard Reset de Base de Datos y Limpieza Completa de Colecciones (BUG-025)
* **Tipo:** Nueva Capacidad / Mantenimiento / Base de Datos / Admin
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Causa Raíz:**
  - El botón de restauración de fábrica de la zona de desarrolladores solo borraba colecciones de negocio parciales (productos, categorías, pedidos, créditos, cupones, anuncios), pero mantenía las colecciones operativas y el documento de configuración de marca (`config/settings`). Esto obligaba al usuario a tener que borrar manualmente el resto de colecciones desde la consola de Firebase para realizar pruebas desde cero.
* **Solución Técnica:**
  - Se extendió el array `collectionsToClean` en `handleFullReset` para incluir absolutamente todas las 20 colecciones operativas de Firestore, incluyendo `config`, `notifications`, `accessLogs`, `fcmTokens`, `deliveries`, `employees`, etc.
  - Al completarse el borrado físico de forma exitosa, el sistema ahora ejecuta un cierre de sesión automático (`signOutAdmin` y `logout`), limpiando el estado reactivo del cliente y redirigiendo de inmediato al usuario a la pantalla de login/registro inicial para permitir un aprovisionamiento desde cero.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.


### [2026-06-03] - Recuperación Automática por Email Existente en Registro Inicial de Administrador (BUG-024)
* **Tipo:** Bugfix / Core / Auth / Inicialización / Robustez
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/pages/LoginPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
* **Causa Raíz:**
  - Si la base de datos Firestore es vaciada por completo pero el usuario de Firebase Auth se conserva activo en el proveedor de identidad, la app detecta Firestore vacío y despliega el formulario extendido de configuración inicial (correo, contraseña, nombre, celular). Al intentar registrarse, Firebase Auth lanzaba un error `auth/email-already-in-use` (El correo ya está en uso), deteniendo el flujo y bloqueando al administrador de poder ingresar o restaurar su base de datos.
* **Solución Técnica:**
  - Se implementó un manejador de excepciones en el bloque de registro por primera vez en `LoginPage.jsx`. Si el método `createUserWithEmailAndPassword` falla arrojando el código `auth/email-already-in-use`, el flujo captura el error y realiza una autenticación de inicio de sesión reactiva mediante `signInWithEmailAndPassword` consumiendo las credenciales provistas.
  - Al lograr el login de manera exitosa, el sistema asume que la cuenta ya existía en Auth y procede a reconstruir el documento de configuración `config/settings` en Firestore utilizando los datos de `sellerName` y `whatsappAdmin` completados por el usuario, evitando que se pierda la sesión o se bloquee el flujo.
* **Estatus:** ✅ Completado y verificado con compilación de producción exitosa.

### [2026-06-03] - Solución a Pérdida de Datos en Registro Inicial del Administrador (BUG-023)
* **Tipo:** Bugfix / Core / Auth / Inicialización / Race Condition
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/services/appConfigService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/appConfigService.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/pages/LoginPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
* **Causa Raíz:**
  - **Condición de carrera (Race Condition):** Al vaciar la base de datos y entrar a la app, la inicialización en caliente del listener `subscribeToAppConfig` en el cliente no encontraba el documento `config/settings`. Para evitar que la app fallara, intentaba crear de forma asíncrona un documento con los valores de fábrica `DEFAULT_SETTINGS` en Firestore. Si el administrador enviaba el formulario de registro al mismo tiempo, la escritura del listener local sobrescribía y limpiaba los campos `sellerName` y `whatsappAdmin` recién creados en Firestore por el formulario de login.
* **Solución Técnica:**
  - **Eliminación de Escritura Anónima:** Se modificó `subscribeToAppConfig` para que no realice escrituras asíncronas anónimas en caliente si el documento de configuración no existe en Firestore; en su lugar, se limita a inyectar el fallback `DEFAULT_SETTINGS` directamente en memoria para alimentar la UI.
  - **Inicialización Controlada:** Se exportó `DEFAULT_SETTINGS` de `appConfigService.js` y se importó en `LoginPage.jsx`. En el flujo de registro inicial, la llamada a `updateAppConfig` ahora realiza un merge completo (`...DEFAULT_SETTINGS, ...configUpdates`), garantizando que se inicialicen todos los campos estructurales del negocio y se guarden con éxito el nombre del vendedor y el WhatsApp ingresados sin riesgo de sobreescritura.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-03] - Eliminación de la Skill de Siembra y Limpieza de Documentación Relacionada
* **Tipo:** Depreciación / Documentación / Estándares
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
* **Causa Raíz:**
  - Petición explícita del usuario para remover por completo la habilidad de automatización `db_seeder` y todas sus referencias en el mapa semántico, aplazando su construcción robusta y estandarizada a fases futuras del proyecto.
* **Solución Técnica:**
  - Borrado físico recursivo del directorio [`D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\Copia_Seguridad_Reglas_y_Skills\Skills\db_seeder`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/db_seeder).
  - Remoción de la entrada del indexado de la skill en `mapa_documentacion_ia.md`.
* **Estatus:** ✅ Completado y limpio.

### [2026-06-03] - Corrección de Error de Indexación en Consulta de Archivar Notificaciones (BUG-022)
* **Tipo:** Bugfix / Firestore / Base de Datos / Rendimiento
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/services/notificationCenterService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/notificationCenterService.js) [MODIFY]
* **Causa Raíz:**
  - La función `archiveAll` ejecutaba una consulta Firestore que mezclaba un filtro de igualdad (`recipientId` o `recipientRole`) con un filtro de desigualdad (`status != 'archived'`). Esto arrojaba un `FirebaseError: The query requires an index` en la consola al intentar archivar todas las notificaciones desde la bandeja histórica de notificaciones.
* **Solución Técnica:**
  - Se eliminó el filtro de desigualdad `where('status', '!=', 'archived')` de la consulta Firestore, permitiendo que la consulta base se resuelva de manera simple y sin requerir índices compuestos en ningún Shard del cliente.
  - El descarte de las notificaciones que ya se encuentran archivadas se realiza de forma segura en memoria a través de un filtrado en caliente (`snap.docs.forEach(d => { if (d.data().status !== 'archived') ... })`) antes de procesar el lote (`writeBatch`) de actualizaciones.
* **Estatus:** ✅ Completado y validado en caliente.

### [2026-06-03] - Corrección de Formato en Script de Siembra para Iconos PNG y Enlaces Directos
* **Tipo:** Corrección / Script / PWA / Imágenes
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/scratch/seed_ropa_interior.js`](file:///d:/Aplicaciones/App%20Ventas/scratch/seed_ropa_interior.js) [MODIFY]
* **Causa Raíz:**
  - El script del sembrador contenía enlaces de Unsplash sin forzar la extensión o codificación de formato de salida, lo que podía causar que el Service Worker y el generador de manifiesto dinámico de la PWA no interpretaran adecuadamente la imagen del icono de marca.
* **Solución Técnica:**
  - Se corrigió el código de configuración de identidad del script `seed_ropa_interior.js` forzando el formato PNG mediante parámetros explícitos de codificación de imagen (`fm=png` en `appIcon`).
* **Estatus:** ✅ Completado y verificado.



### [2026-06-03] - Robustez de PWA y Fallback contra Errores de Carga de Logo (BUG-021)
* **Tipo:** Robustez / PWA / Control de Errores / Manifest
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/App-barber-a-glamour/src/utils/dynamicManifest.js`](file:///D:/PROTOTIPE/App-barber-a-glamour/src/utils/dynamicManifest.js) [MODIFY]
* **Causa Raíz:**
  - Si la imagen configurada para el logo de la tienda (`appIcon`) era una URL rota (por ejemplo, el marcador de posición Unsplash seeded por defecto que arrojaba un error 404), la generación del icono de marca PWA (`generateBrandIcon`) fallaba y resolvía con esa misma URL rota. Como consecuencia, el navegador intentaba descargar un icono PWA inválido y arrojaba advertencias/errores en la consola.
* **Solución Técnica:**
  - Modificado el callback `img.onerror` de `generateBrandIcon` en `dynamicManifest.js` para que resuelva a `/pwa-192x192.png` (el recurso local y seguro por defecto) en lugar del string roto de `appIcon` original. De esta forma, el manifiesto dinámico se autoprotege contra imágenes rotas en el backend.
* **Estatus:** ✅ Completado y verificado con compilación exitosa.

### [2026-06-03] - Transición a Aislamiento de Proyectos Firebase e Historial de Bugs Correctivos (Junio 2026)
* **Tipo:** Arquitectura Ecosistema / Estándares / Bugfixes / Siembra
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/scratch/seed_brand.js`](file:///d:/Aplicaciones/App%20Ventas/scratch/seed_brand.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/scratch/seed_ropa_interior.js`](file:///d:/Aplicaciones/App%20Ventas/scratch/seed_ropa_interior.js) [MODIFY]
  - [`d:/Aplicaciones/Prototipe-CLI/cli.js`](file:///d:/Aplicaciones/Prototipe-CLI/cli.js) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/inicializacion_nuevos_proyectos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/inicializacion_nuevos_proyectos.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Estandar_Sharding_Multitenant.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Estandar_Sharding_Multitenant.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/manual_prototipe_cli.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/manual_prototipe_cli.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/db_seeder/SKILL.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/db_seeder/SKILL.md) [MODIFY]
* **Causa Raíz:**
  - Evitar el Sharding compartido de inquilinos en un mismo proyecto Firebase para resolver problemas de aislamiento de Auth, cuotas gratuitas saturadas y personalizaciones de Hosting individuales. Además de corregir fallas heredadas de edición y requerir el uso de Firebase Client SDK en la siembra.
  - **`[BUG-020]` Mismatch de Ruta de Siembra:** El script de siembra de base de datos escribía la configuración de marca (logo, eslogan, datos bancarios) en `config/appConfig`, pero la aplicación cliente consume y sincroniza en tiempo real sus configuraciones desde `config/settings`. Esto provocaba que tras poblar la base de datos, la interfaz siguiera renderizándose con el estado vacío por defecto.
* **Solución Técnica:**
  - **Aislamiento Total:** Adopción del modelo "Un proyecto Firebase por Cliente" mediante telemetría cross-project consolidada en `prototipe-multi-instancia-control`.
  - **`seed_brand.js` (BUG-018):** Migrado de Admin SDK a Client SDK con autenticación en caliente y lectura dinámica de `.env.local` usando `dotenv`.
  - **`cli.js` (BUG-019):** Eliminado el texto sintáctico corrupto `}ojectId}` en la línea 164.
  - **Corrección de Ruta de Siembra (BUG-020):** Se modificaron las referencias de base de datos en `seed_brand.js` y `seed_ropa_interior.js` para apuntar a `config/settings` en lugar de `config/appConfig`. Se re-ejecutó la siembra del perfil de Ropa Interior y se actualizó la skill `db_seeder/SKILL.md` para instruir estrictamente esta validación de ruta.
  - **Documentación Central:** Actualizados los manuales de inicialización, sharding y manual del CLI para formalizar este modelo arquitectónico y registrar los bugs corregidos (BUG-017, BUG-018, BUG-019, BUG-020).
* **Estatus:** ✅ Completado, documentado y validado en el ecosistema.


### [2026-06-03] - Personalización de Identidad de Marca y Bootstrap de Barbería Glamour (barber-a-glamour)
* **Tipo:** Personalización de Marca / Configuración Ecosistema / Estilo & SEO
* **Archivo(s) Modificado(s):**
  - [`D:/PROTOTIPE/App-barber-a-glamour/src/constants/palettes.js`](file:///D:/PROTOTIPE/App-barber-a-glamour/src/constants/palettes.js) [MODIFY]
  - [`D:/PROTOTIPE/App-barber-a-glamour/src/index.css`](file:///D:/PROTOTIPE/App-barber-a-glamour/src/index.css) [MODIFY]
  - [`D:/PROTOTIPE/App-barber-a-glamour/index.html`](file:///D:/PROTOTIPE/App-barber-a-glamour/index.html) [MODIFY]
* **Causa Raíz:**
  - Inicializar la identidad visual y configuración del nuevo cliente "Barbería Glamour" (slug `barber-a-glamour`), aplicando la paleta de colores de marca personalizada, tipografía Poppins, y optimizando las metaetiquetas SEO y de la PWA correspondientes en el código del core.
* **Solución Técnica:**
  - **Tema custom-brand:** Definido el tema en `palettes.js` y `index.css` utilizando dorado primario `#d4af37`, secundario slate `#94a3b8`, fondo slate oscuro `#0f172a` y texto claro `#f8fafc`.
  - **Cargador síncrono cromático:** Se inyectó `custom-brand` en el objeto `bgMap` en `index.html` para evitar destellos visuales (FOUC) durante la fase de carga.
  - **Metadatos y SEO:** Actualizado el título de la página, descripción SEO y configuración del nombre de PWA a "Barbería Glamour".
* **Estatus:** ✅ Completado y verificado mediante compilación de producción local exitosa (`npm run build`).

### [2026-06-03] - Simulación de Facturación Electrónica DIAN y Comisiones sobre Base Imponible
* **Tipo:** Nueva Funcionalidad / Facturación Electrónica / Comisiones Core / Telemetría
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/services/telemetryService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/telemetryService.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/services/billingService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/billingService.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`d:/Aplicaciones/Prototipe-CLI/generator.js`](file:///d:/Aplicaciones/Prototipe-CLI/generator.js) [MODIFY]
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/manual_prototipe_cli.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/manual_prototipe_cli.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/guia_facturacion_dian_comisiones.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/guia_facturacion_dian_comisiones.md) [NEW]
* **Causa Raíz:**
  - El desarrollador necesitaba habilitar condicionalmente campos de la DIAN para Colombia (Razón Social, NIT, IVA) e implementar de forma estricta que las ganancias/comisiones de la plataforma Ecosistema se cobren sobre el subtotal neto antes de impuestos en caso de Feature Flag DIAN activa, evitando cobrar comisión sobre el IVA del negocio.
* **Solución Técnica:**
  - **Cálculo sobre Base Imponible:** Modificados `telemetryService.js` y `billingService.js` en el Core para evaluar `enableDianBilling` de forma síncrona. Si está activa, la base de cálculo de comisiones (porcentaje/fijo) pasa a ser el `subtotal` (antes de IVA), y se le añade el cargo por documento emitido `costoPorFacturaDian`.
  - **Inputs Fiscales en Cliente:** Se integró un toggle de DIAN y un formulario de datos impositivos de la empresa en `AdminSettings.jsx` (Sección Personalizar -> subsección DIAN) persistiendo en la config local.
  - **Soporte CLI y Dashboard:** `generator.js` inyecta ahora variables locales de DIAN en `.env.local` y en el prompt. El Dashboard Dev expandió su wizard y CRM para visualizar y administrar la Feature Flag y el desglose de cobro neto.
* **Estatus:** ✅ Completado y validado con builds de producción limpios y exitosos en ambos repositorios.

### [2026-06-03] - Facturación Ecosistema Multi-modo e Integración del Ecosistema
* **Tipo:** Nueva Funcionalidad / Core / Telemetría / Facturación Ecosistema / Multi-tenant
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/src/services/billingService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/billingService.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/services/telemetryService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/telemetryService.js) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`d:/Aplicaciones/Prototipe-CLI/generator.js`](file:///d:/Aplicaciones/Prototipe-CLI/generator.js) [MODIFY]
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_centralizacion_comisiones.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_centralizacion_comisiones.md) [MODIFY]
* **Causa Raíz:**
  - El sistema solo admitía facturación comisional por porcentaje. Para verticalizaciones orientadas a servicios de citas u otros nichos (ej. peluquerías), una comisión del 0% no permitía monetizar. Se requería soportar valor fijo por servicio y pago mensual fijo, integrándolos en la telemetría, el CLI y el Dashboard Dev.
* **Solución Técnica:**
  - **Fórmula Multi-modo en Core:** `billingService.js` calcula dinámicamente la comisión mensual/histórica según `billingMode` (`percentage`, `fixed_per_service` o `flat_monthly`) leyendo de Firestore Central con fallback local.
  - **Telemetría Avanzada:** `telemetryService.js` ahora envía `billingMode`, `montoFijoServicio`, `pagoMensualFijo` y `orderCount` en el payload.
  - **Ajustes y CLI:** `AdminSettings.jsx` y `generator.js` actualizados para mostrar el modelo comisional activo en tiempo real e inyectar configuraciones locales en `.env.local`.
  - **Dashboard Dev:** Se agregó selector de modo, inputs condicionales en el Wizard y CRM, y se actualizaron los reportes agregados financieros para no asumir porcentaje estático.
* **Estatus:** ✅ Completado y validado con builds locales exitosos en ambos repositorios.

### [2026-06-03] - Rediseño a Pantalla Completa de Onboarding Wizard, Auto-detección Firebase, Sistema de Reintentos y Captura de Requerimientos Custom
* **Tipo:** Nueva Funcionalidad / UI-UX Premium / Integración API / Multi-tenant / Robustez
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY]
  - [`d:/Aplicaciones/Prototipe-CLI/generator.js`](file:///d:/Aplicaciones/Prototipe-CLI/generator.js) [MODIFY]
* **Causa Raíz:**
  - El modal de registro de clientes anterior resultaba incómodo, no permitía previsualizar los cambios de branding en caliente ni ingresar los requerimientos especiales y especificaciones custom de negocio de cada cliente. Tampoco forzaba un build local de integridad para garantizar aplicaciones libres de fallos.
* **Solución Técnica:**
  - **Layout de Pantalla Completa (2 Columnas):** Wizard de 3 pestañas (Servidor, Branding, Módulos) y Mockup de celular reactivo en tiempo real.
  - **Textarea de Requerimientos Custom:** Agregado un campo textarea en la pestaña "Módulos" de `App.jsx` que recolecta notas específicas de negocio (`customRequirements`). Se inyecta en el payload JSON hacia `POST /api/create-project` y se guarda en `/clientes_control/{id}` de Firestore central.
  - **Actualización del Scaffolder CLI:** `generator.js` ahora recibe `customRequirements` y lo renderiza de forma estructurada en el archivo `antigravity_bootstrap_prompt.md`.
  - **Directiva de Compilación de Integridad:** Se añadió en el prompt final de arranque el paso obligatorio de compilar (`npm run build`) para que el nuevo agente IA valide que la app compile al 100% y no genere código con fallos.
  - **Persistencia y Resiliencia:** El payload se guarda en LocalStorage (`pendingCliProvisioning`) para reintentar si el daemon CLI local está offline.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa en ambos entornos.

### [2026-06-03] - Estandarización de Arquitectura Multitenant Híbrida (Sharding de Firebase)

* **Tipo:** Escalabilidad / Arquitectura Ecosistema / Documentación / Estándares
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/GEMINI.md`](file:///d:/Aplicaciones/App%20Ventas/GEMINI.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Estandar_Sharding_Multitenant.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Estandar_Sharding_Multitenant.md) [NEW]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
* **Causa Raíz:** A medida que la cantidad de clientes crezca, colocar todas las cuentas bajo el mismo proyecto de Firebase base (`ventas-smartfix`) puede alcanzar límites de capa gratuita o rendimiento. Se necesitaba estandarizar y documentar el protocolo de sharding híbrido (múltiples proyectos Firebase operacionales) para que cualquier IA en el futuro inicialice shards de forma correcta y no asuma credenciales de Firebase estáticas en el core.
* **Solución Técnica:**
  - **Regla en GEMINI.md:** Añadido estándar estricto que prohíbe hardcodear IDs de proyectos Firebase en componentes, hooks o servicios. Se exige resolverlos dinámicamente desde el entorno local (`.env.local`).
  - **Manual de Sharding:** Creado `Estandar_Sharding_Multitenant.md` con los pasos operativos para inicializar, configurar y desplegar nuevos shards de Firebase usando el Dashboard y el CLI de forma transparente.
  - **Indexación:** Registrado en el mapa semántico de documentación.
* **Estatus:** ✅ Integrado y documentado. Consistencia de código validada mediante builds exitosos.

### [2026-06-03] - Estandarización de Robustez Firebase en Dashboard Dev y Core (App Ventas)

* **Tipo:** Robustez / Arquitectura de Software / Seguridad / Estándares
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/GEMINI.md`](file:///d:/Aplicaciones/App%20Ventas/GEMINI.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/Firebase_Listeners_Clean.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Firebase_Listeners_Clean.md) [NEW]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
* **Causa Raíz:** Los listeners de Firestore en tiempo real (`onSnapshot`) se iniciaban antes de que Firebase Auth validara la sesión del desarrollador, disparando advertencias de permisos denegados (`Missing or insufficient permissions`) en la consola al renderizar la UI inicial.
* **Solución Técnica:**
  - **Encapsulación Reactiva:** Se reestructuraron las llamadas `onSnapshot` en el Dashboard Dev para que se declaren condicionalmente dentro de `onAuthStateChanged` únicamente si el usuario está autenticado.
  - **Gestión de Suscripciones:** Se definieron referencias y se retornaron sus respectivas funciones limpiadoras (`cleanup functions`) para cerrar la escucha al desmontar o cerrar sesión.
  - **Nueva Documentación:** Creada la guía de desarrollo `Firebase_Listeners_Clean.md` registrándola en el mapa semántico.
  - **Regla en GEMINI.md:** Añadido el estándar técnico y prohibición de listeners sin validación de permisos previa.
* **Estatus:** ✅ Pruebas de compilación exitosas en ambos repositorios. Cero warnings en carga inicial.

### [2026-06-03] - Sistema de Reintentos para Aprovisionamiento CLI en Dashboard Dev

* **Tipo:** Resiliencia / UX / Error Handling / Multi-tenant
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY]
* **Causa Raíz:** Si el internet caía o el daemon CLI estaba apagado durante el aprovisionamiento, el sistema mostraba una alerta simple y el proceso fallaba silenciosamente. El formulario se limpiaba, perdiendo los datos del cliente, y no había forma de reintentar solo el paso físico sin volver a llenar todo.
* **Solución Técnica:**
  - **Estado `pendingCliProvisioning`:** Cuando Firestore guarda OK pero el CLI falla, en lugar de mostrar una alerta y limpiar el formulario, se guarda el payload completo (credenciales, clientId, token, rutas) en este estado. Los datos NO se pierden.
  - **Función `handleRetryCliProvisioning`:** Re-ejecuta solo la llamada `POST /api/create-project` con el payload guardado, sin tocar Firestore. Si el reintento es exitoso, limpia el estado pendiente y actualiza el modal de Onboarding con el prompt generado.
  - **Banner visual de reintento:** Aparece en el panel principal (encima de las métricas) cuando hay un aprovisionamiento pendiente. Muestra el `clientId` afectado, instrucción clara y botones "Reintentar" (con spinner) y "Descartar".
* **Estatus:** ✅ Compilación exitosa en 440ms, cero errores.

### [2026-06-03] - Reubicación de Firebase Project ID, Adición de VAPID Key Manual y Checklist Interactivo de Onboarding en Consola Central


* **Tipo:** UI/UX / Automatización / Onboarding / Multi-tenant
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY]
* **Causa Raíz:**
  - El formulario de registro de nuevos clientes requería una mejor distribución UX, separando el Project ID de la cuadrícula general de credenciales para colocar a su lado el botón de auto-detección. Adicionalmente, se necesitaba capturar una VAPID Key para las notificaciones push en el Service Worker, y mostrar una lista de verificación interactiva de Firestore/Auth/Storage en el modal de onboarding para asegurar la configuración manual de los servicios.
* **Solución Técnica:**
  - **Reubicación de Project ID:** Se movió el input de Project ID fuera de la cuadrícula y se posicionó junto al botón "Auto-detectar". Se eliminó el duplicado de la cuadrícula.
  - **Input de VAPID Key Manual:** Se añadió un input para la clave VAPID debajo de la cuadrícula de Firebase.
  - **Checklist Interactivo en Modal:** Se inyectó una sección con 3 checkboxes interactivos para la verificación manual de Firestore, Authentication y Storage.
  - **Copiar VAPID Dinámico:** Se modificó el Paso 3 del onboarding para mostrar dinámicamente la clave VAPID ingresada con su propio botón de copiado rápido al portapapeles.
  - **Envío de Datos:** Se actualizó el payload enviado a Firestore y a la API del CLI para incluir la clave VAPID (`fbVapidKey` / `vapidKey`).
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-03] - Auto-extracción de Credenciales Firebase en CLI Bridge y Botón "Auto-detectar" en Dashboard Dev

* **Tipo:** Automatización / API REST Local / UX-UI Dashboard Ecosistema / Multi-tenant
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/Prototipe-CLI/server.js`](file:///d:/Aplicaciones/Prototipe-CLI/server.js) [MODIFY]
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY — vía subagente]
* **Causa Raíz:**
  - El flujo anterior requería que el desarrollador copiara manualmente las 6 credenciales del SDK de Firebase desde la consola web, lo que era propenso a errores y ralentizaba el onboarding. Tampoco existía un campo para la VAPID Key ni un checklist de activaciones manuales en Firebase.
* **Solución Técnica:**
  - **`server.js` — Nuevo endpoint `GET /api/firebase-config`:** Ejecuta `firebase apps:sdkconfig web --project [projectId] --json` usando la Firebase CLI instalada localmente. Parsea el JSON de salida extrayendo las 6 variables del SDK. Si el proyecto no tiene una Web App registrada, la crea automáticamente con `firebase apps:create web` y reintenta. Maneja errores de autenticación CLI, timeout y respuesta malformada con mensajes de usuario claros.
  - **`App.jsx` — Botón "Auto-detectar":** Botón premium con estado de loading (`isFetchingConfig`) que llama al endpoint anterior y rellena automáticamente los 5 campos de credenciales (Project ID se escribe manualmente para activar la detección). Toast de éxito/error descriptivo.
  - **`App.jsx` — Campo VAPID Key:** Input dedicado con badge "Manual - Firebase Console" y nota instructiva explicando dónde obtenerla.
  - **`App.jsx` — Checklist interactivo en modal de Onboarding:** 3 checkboxes para confirmar: activar Auth Email/Password, crear Firestore, habilitar Storage. La VAPID Key capturada se muestra directamente en el paso 3 del modal con botón de copiado rápido.

### [2026-06-03] - Integración de Opciones de Aprovisionamiento (GitHub & Firebase), Loader Overlay y Prompt de Antigravity en Consola Central


* **Tipo:** Integración API / Automatización / UX-UI Premium / Multi-tenant
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY]
* **Causa Raíz:**
  - El motor de Prototipe-CLI local ahora genera claves VAPID, escribe `.firebaserc`, inyecta credenciales en Service Worker, inicializa Git/GitHub, despliega a Firebase y produce un prompt de arranque (`antigravity_bootstrap_prompt.md`). Se requería integrar estas nuevas capacidades en la UI del Dashboard.
* **Solución Técnica:**
  - **Checkboxes de Control:** Agregados checkboxes estilizados premium para activar `enableGithub` (inicializado en `true`) y `enableFirebaseDeploy` (inicializado en `true`).
  - **Loader de Aprovisionamiento:** Añadido un overlay de pantalla completa con blur y spinner interactivo de alta calidad con el texto de espera correspondiente durante la ejecución asíncrona de aprovisionamiento.
  - **Prompt de Arranque:** Modificado el modal de Onboarding para renderizar el bootstrap prompt retornado por la API de la CLI (`promptResult`) en una caja de texto monospaced estilizada con scroll interno y botón rápido de copiado al portapapeles.
  - **Payload Completo:** La llamada `POST` a `http://localhost:3001/api/create-project` ahora incluye todos los datos capturados y las preferencias de automatización.
* **Estatus:** ✅ Completado y verificado. Build exitoso.

---

### [2026-06-03] - Formulario de Briefing Expandido y Aprovisionamiento CLI en Consola Central Ecosistema

* **Tipo:** Nueva Funcionalidad / Automatización / Multi-tenant / Integración API
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY]
* **Causa Raíz:**
  - Se requería expandir el formulario de registro de nuevos clientes en el Dashboard Central para capturar las credenciales de Firebase del cliente, la ruta física en disco y la plantilla base, y disparar automáticamente el aprovisionamiento local mediante el daemon de la CLI en el puerto 3001 con tolerancia a fallos offline.
* **Solución Técnica:**
  - **Estados de Entrada:** Incorporados estados en React para los 6 campos de credenciales de Firebase (API Key, Auth Domain, Project ID, Storage Bucket, Messaging Sender ID, App ID), `targetPath` (auto-calculado en base al Client ID) y `selectedTemplate`.
  - **Carga de Plantillas Dinámicas:** Añadido un efecto de carga que consulta `http://localhost:3001/api/templates` al inicializar la aplicación con fallback seguro a `template-ventas`.
  - **Integración con CLI API:** Modificado el botón de registro para que, al guardar el cliente, realice una petición POST asíncrona a `http://localhost:3001/api/create-project` enviando el payload completo de configuración.
  - **Tolerancia Offline:** Diseñado un manejador de excepciones que detecta si el servidor local de aprovisionamiento está offline, mostrando una alerta descriptiva al desarrollador pero permitiendo que el registro en Firestore y el modal de onboarding continúen exitosamente.
  - **Estado de Carga:** Controlado visualmente mediante el estado `isRegistering` con un spinner animado en el botón para prevenir solicitudes duplicadas.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-03] - Automatización de Variables Centrales y Checklist de Aprovisionamiento en Prototipe-CLI

* **Tipo:** Automatización de Procesos / Herramientas de Desarrollo / Multi-tenant / Scaffolding
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/Prototipe-CLI/cli.js`](file:///d:/Aplicaciones/Prototipe-CLI/cli.js) [MODIFY]
* **Causa Raíz:**
  - El CLI interactivo `Prototipe-CLI` configuraba incorrectamente las variables de entorno central (`VITE_DEVELOPER_CENTRAL_*`) con las credenciales del cliente en lugar del proyecto central de control (`prototipe-multi-instancia-control`), y usaba un token de telemetría de prueba estático y no exclusivo para el nuevo cliente.
* **Solución Técnica:**
  - **Preguntas de Consola Central:** Agregadas preguntas opcionales en inquirer con defaults correctos para las credenciales de `prototipe-multi-instancia-control` (API Key, Sender ID y App ID).
  - **Generación de Token Único:** Implementada la generación automática de un token dinámico exclusivo para el nuevo cliente basado en su slug e ID de tiempo (`${clientId}-token-${Date.now()}`).
  - **Checklist de Aprovisionamiento:** Inyectada una salida de texto formateado con picocolors al finalizar el script CLI mostrando los pasos manuales de base de datos obligatorios en Firestore central.
* **Estatus:** ✅ Completado y validado en el código del CLI.

---

### [2026-06-03] - Corrección Definitiva del Sistema de Telemetría y Reglas de Seguridad Firestore Central

* **Tipo:** Seguridad / Reglas Firestore / Telemetría Ecosistema / Documentación de Estándares
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/dev-dashboard/firestore.rules`](file:///d:/Aplicaciones/dev-dashboard/firestore.rules) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/.env.local`](file:///d:/Aplicaciones/App%20Ventas/.env.local) [MODIFY]
  - [`d:/Aplicaciones/App Ventas/src/services/telemetryService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/telemetryService.js) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/04_Estandares_y_Skills/inicializacion_nuevos_proyectos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/inicializacion_nuevos_proyectos.md) [MODIFY]
* **Causa Raíz (3 problemas encadenados):**
  1. **`clientes_control` inaccesible:** La regla `allow read: if request.auth != null` bloqueaba la lectura porque la app cliente NO está autenticada en `prototipe-multi-instancia-control` (su auth pertenece a su propio proyecto Firebase).
  2. **`reportesBilling` bloqueado:** La regla validaba el token contra la colección `/tokens/{token}`, pero el documento `tokens/ventas-smartfix-dev-token-998877` no existía en Firestore central.
  3. **`telemetryService.js` ruidoso:** El mensaje de fallback usaba `console.warn` generando falsa alarma visual en DevTools.
* **Solución Técnica:**
  - **`firestore.rules` actualizado y desplegado:** `clientes_control` ahora permite `read: if true` (datos no sensibles: solo `comisionPorcentaje` y `nombre`). `reportesBilling` refactorizado con función helper `tokenValido()`. Desplegado con `firebase deploy --only firestore:rules --project prototipe-multi-instancia-control`.
  - **Documento token creado via MCP:** `/tokens/ventas-smartfix-dev-token-998877` → `{ active: true, clientId: "ventas-smartfix" }` en la BD central.
  - **`.env.local` restaurado** con credenciales centrales activas y token correcto.
  - **`telemetryService.js`:** `console.warn` → `console.debug` para silenciar el log en consola normal.
  - **`inicializacion_nuevos_proyectos.md` (Paso 9 añadido):** Documentado el estándar de `.env.local` por tipo de proyecto (base vs. cliente real), checklist de aprovisionamiento y tabla de errores origen/prevención.
* **Regla de Prevención Futura:** Al crear un nuevo cliente, siempre crear el documento en `/tokens/{TOKEN_DEL_CLIENTE}` en `prototipe-multi-instancia-control` ANTES de activar la conexión central en `.env.local`. Sin ese documento, las reglas bloquearán toda escritura a `reportesBilling`.
* **Estatus:** ✅ Completado. Build exitoso. Reglas desplegadas en producción.

---

### [2026-06-03] - Corrección de Firebase doc() Argument Error en AdminHome y Registro de Bugs

* **Tipo:** Lógica de Firebase / Bugfix / Documentación de Integridad
* **Archivo(s) Modificado(s):**
  - [`src/services/billingService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/billingService.js) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\03_Auditorias_y_Faro_Core\registro_errores_bugs.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/registro_errores_bugs.md) [MODIFY]
* **Causa Raíz:**
  - El componente `<AdminHome>` experimentaba un crash completo debido a que `billingService.js` entregaba una instancia de `FirebaseApp` a la función `doc()`, en lugar de invocar `getFirestore(app)` para extraer el objeto base de datos `FirebaseFirestore` central.
* **Solución Técnica:**
  - Modificado `getCentralFirestore` en `billingService.js` para inicializar y obtener el servicio Firestore `getFirestore(app)` de forma perezosa.
  - Se registró el error bajo el código `[BUG-016]` en el Bug Log para control y resguardo futuro.
* **Estatus:** ✅ Completado y validado en el Core de la aplicación.

---

### [2026-06-03] - Solución de Pantalla en Blanco e Integración de Sincronización Ecosistema de Comisiones en Tiempo Real

* **Tipo:** Lógica de Negocio / Sincronización Multitenant / Firebase Firestore / Bugfix
* **Archivo(s) Modificado(s):**
  - [`src/services/billingService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/billingService.js) [MODIFY]
  - [`src/services/appConfigService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/appConfigService.js) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\inicializacion_nuevos_proyectos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/inicializacion_nuevos_proyectos.md) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\03_Auditorias_y_Faro_Core\registro_errores_bugs.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/registro_errores_bugs.md) [MODIFY]
* **Causa Raíz:**
  - **Sincronización:** Las tasas comisionales de los clientes se administraban de forma local y estática en el Dashboard de Desarrollador, impidiendo que los cambios de comisiones se propagaran a las instancias de los clientes.
  - **Bug de Pantalla en Blanco:** Al iniciar un nuevo proyecto/marca de cero, el documento `config/settings` aún no se encontraba creado en su respectiva base de datos de Firestore. Como el store de Zustand restringe la carga de la UI hasta que resuelva, la app se congelaba de forma indefinida en una pantalla en blanco.
* **Solución Técnica:**
  - **Sincronización Dinámica:** Modificado `billingService.js` en el Core para que, al detectar la presencia de credenciales del Firebase de control central en `.env.local`, se suscriba síncronamente al documento del cliente en la colección central `clientes_control`. Al modificarse la tasa en el Dashboard, la app cliente actualiza sus cálculos y visualizaciones de comisiones de inmediato en caliente.
  - **Autoprovisionamiento:** Modificado `appConfigService.js` para que si la consulta de `config/settings` retorna vacía, setee de forma inmediata los valores de fábrica (`DEFAULT_SETTINGS`), desbloqueando la inicialización síncrona del Zustand.
* **Estatus:** ✅ Completado, compilado con éxito y registrado en los estándares de bootstrapping del ecosistema.

---

### [2026-06-03] - Creación de Prototipe-CLI: Orquestador Interactivo de Scaffolding de Nuevos Proyectos

* **Tipo:** Automatización de Procesos / Herramientas de Desarrollo / Multi-tenant / Scaffolding
* **Archivo(s) Creado(s)/Modificado(s):**
  - [`D:\PROTOTIPE\Prototipe-CLI\package.json`](file:///D:/PROTOTIPE/Prototipe-CLI/package.json) [NEW]
  - [`D:\PROTOTIPE\Prototipe-CLI\cli.js`](file:///D:/PROTOTIPE/Prototipe-CLI/cli.js) [NEW]
  - [`D:\PROTOTIPE\Prototipe-CLI\exclude.txt`](file:///D:/PROTOTIPE/Prototipe-CLI/exclude.txt) [NEW]
  - [`D:\PROTOTIPE\Prototipe-CLI\templates\template-ventas\`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/) [NEW]
* **Causa Raíz:**
  - El desarrollador solicitó una forma autónoma y rápida de instanciar nuevos proyectos con mínimas instrucciones, identificando plantillas fácilmente y manteniendo la modularidad del ecosistema Ecosistema.
* **Solución Técnica:**
  - **Script Interactivo cli.js:** Construida una interfaz de consola interactiva basada en `inquirer` que solicita la plantilla, el nombre del proyecto, la ruta de destino, la paleta HSL inicial y las credenciales de Firebase.
  - **Inyección de Código y Entorno:** El CLI copia la plantilla, inyecta el archivo `.env.local` configurado con las variables ingresadas, añade el generador de mapas semánticos en `scratch/generate_ia_map.js` y mapea los scripts de automatización en `package.json`.
  - **Instalación y Mapeo Autónomo:** Ejecuta en cascada la instalación de dependencias `npm install` e indexa el mapa inicial mediante `npm run map` en la ruta destino.
* **Estatus:** ✅ Completado y validado en el directorio de aplicaciones.

---

### [2026-06-03] - Automatización de Nomenclatura Contextual de Proyectos y Estandarización de Índices Firestore

* **Tipo:** Reglas del Ecosistema / Estándares de Base de Datos / Automatización IA
* **Archivo(s) Modificado(s):**
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\inicializacion_nuevos_proyectos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/inicializacion_nuevos_proyectos.md) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\guia_maestra_desarrollo.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/guia_maestra_desarrollo.md) [MODIFY]
* **Causa Raíz:**
  - El desarrollador solicitó estandarizar y automatizar el comportamiento de la IA para que ante nuevos clientes/proyectos, configure de forma contextual la nomenclatura en Firebase (ej. `ventas-{cliente}-app` o `citas-{cliente}-app` según su categoría de negocio) y gestione de forma automática la auditoría y despliegue de índices compuestos de Firestore.
* **Solución Técnica:**
  - **Nomenclatura Contextual:** Configurada la regla de comportamiento para que la IA proponga nombres cortos alineados al contexto de la app de forma proactiva.
  - **Estandarización de Índices:** Añadido el **Paso 7** al protocolo de inicialización de nuevos proyectos, estableciendo la directiva obligatoria de auditar consultas compuestas en código, modelar los índices correspondientes en el archivo local `firestore.indexes.json` y desplegarlos en lote mediante Firebase CLI de forma autónoma.
* **Estatus:** ✅ Completado y documentado en las guías del estándar.

---

### [2026-06-03] - Estandarización de PWA Auto-Update Instantáneo e Integración en Boilerplate de Nuevos Proyectos

* **Tipo:** Refactorización de Arquitectura / PWA / Control de Caché / Estándares de Calidad
* **Archivo(s) Modificado(s):**
  - [`vite.config.js`](file:///d:/Aplicaciones/App%20Ventas/vite.config.js) [MODIFY]
  - [`src/main.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/main.jsx) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\inicializacion_nuevos_proyectos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/inicializacion_nuevos_proyectos.md) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\guia_maestra_desarrollo.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/guia_maestra_desarrollo.md) [MODIFY]
* **Causa Raíz:**
  - Los usuarios administradores y clientes de la tienda PWA debían borrar la caché del navegador o recargar dos veces la página para poder visualizar cambios o correcciones críticas desplegadas en producción debido a que el Service Worker retenía en caché los archivos anteriores por defecto.
* **Solución Técnica:**
  - **Auto-Update inmediato:** Se configuraron en `vite.config.js` las directivas `skipWaiting: true`, `clientsClaim: true` y `cleanupOutdatedCaches: true` dentro de las opciones de Workbox de `VitePWA`, forzando al navegador a tomar el control del Service Worker nuevo de forma instantánea.
  - **Recarga en Caliente:** Se actualizó `main.jsx` capturando la señal `onNeedRefresh` del Service Worker para ejecutar `updateSW(true)` y forzar una recarga síncrona `window.location.reload()`, lo que actualiza la interfaz al instante.
  - **Checklist de Proyectos:** Se inyectaron estas directivas de forma obligatoria en la guía de desarrollo global (`guia_maestra_desarrollo.md`) y en el manual de bootstrap (`inicializacion_nuevos_proyectos.md`).
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-03] - Carga Interactiva y Visual de Fotos para Producto, Variantes y Galería en Admin

* **Tipo:** Nueva Funcionalidad / UI/UX / Optimización de Carga / Storage
* **Archivo(s) Modificado(s):**
  - [`src/components/admin/inventory/ProductFormModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]
* **Causa Raíz:**
  - El formulario de registro de inventario requería liberarse de los inputs de tipo texto toscos y manuales para URLs de variantes y de galería secundaria, ofreciendo en su lugar un cargador interactivo premium con soporte táctil para cámara y selección de archivos en móvil, compatible con la subida directa a Firebase Storage.
* **Solución Técnica:**
  - **Refactorización de UI de Variantes:** Se reemplazó el input de texto de URL de imagen en `renderVariantsSection` por un cargador visual y táctil interactivo que soporta botones discretos para "Cámara" (`Camera`) y "Galería" (`UploadCloud`). Adicionalmente, muestra el progreso real de la subida a Storage (`variantUploadProgress`) y previsualiza la imagen cargada con opción de borrado inmediato.
  - **Refactorización de Galería Secundaria:** Se modificaron la galería del paso 1 (Wizard) y del formulario clásico en `renderClassicForm` eliminando los campos de texto e implementando subida interactiva en cascada con `handleGalleryImageUpload`. Permite al usuario capturar fotos en móvil o cargarlas, mostrando miniaturas con progreso de subida y opciones de cambio/remoción.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-03] - Estructuración del Plan de Escalabilidad y Publicación de Informe Ecosistema 2026

* **Tipo:** Planeación de Negocio / Ecosistema / Documentación / Arquitectura Multitenant
* **Archivo(s) Modificado(s):**
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\09_Plan_Escalabilidad_Negocio\hoja_de_ruta_maestro.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Plan_Escalabilidad_Negocio/hoja_de_ruta_maestro.md) [NEW]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\09_Plan_Escalabilidad_Negocio\informe_investigacion_ecosistema_2026.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Plan_Escalabilidad_Negocio/informe_investigacion_ecosistema_2026.md) [NEW]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\09_Plan_Escalabilidad_Negocio\README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Plan_Escalabilidad_Negocio/README.md) [NEW]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`GEMINI.md`](file:///d:/Aplicaciones/App%20Ventas/GEMINI.md) [MODIFY]
* **Causa Raíz:**
  - El fundador requería establecer un plan estructurado de crecimiento y escalabilidad de la idea de negocio Ecosistema (Prototipe) a través de verticales, documentando tendencias del mercado, herramientas, psicología de conversión, competidores y automatización.
* **Solución Técnica:**
  - **Plan de Escalabilidad y Hoja de Ruta:** Creación de `hoja_de_ruta_maestro.md` que detalla los Feature Flags del Core base, define los 8 nichos de mercado con prioridades, especifica las configuraciones funcionales para las nuevas Apps base (Restaurante, Servicios, Tendero, Taller) y traza las 4 fases comerciales del roadmap.
  - **Informe de Investigación:** Redacción y compilación del informe de ~48 KB y 9,500 palabras con el subagente investigador Ecosistema & UX Strategy.
  - **Automatización de Reglas:** Actualización de `GEMINI.md` de la aplicación principal con disparadores automatizados para `@postchange` y `@decision-negocio`, con reglas de auto-sincronización proactiva para hitos de negocio sin requerir input explícito.
* **Estatus:** ✅ Completado y documentado exitosamente en el sistema de control.

---

### [2026-06-03] - Adaptación e Integración de Componentes de Biblioteca a dev-dashboard

* **Tipo:** Nueva Funcionalidad / UI/UX / Sistema de Diseño / Ecosistema / Reportes
* **Archivo(s) Modificado(s):**
  - [`dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) [MODIFY]
  - [`dev-dashboard/src/index.css`](file:///d:/Aplicaciones/dev-dashboard/src/index.css) [MODIFY]
  - [`dev-dashboard/src/main.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/main.jsx) [MODIFY]
  - [`dev-dashboard/src/hooks/useCopyToClipboard.js`](file:///d:/Aplicaciones/dev-dashboard/src/hooks/useCopyToClipboard.js) [NEW]
  - [`dev-dashboard/src/hooks/useToast.js`](file:///d:/Aplicaciones/dev-dashboard/src/hooks/useToast.js) [NEW]
  - [`dev-dashboard/src/components/ui/GuidedToast.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/ui/GuidedToast.jsx) [NEW]
  - [`dev-dashboard/src/components/common/AlertConfirmContext.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/common/AlertConfirmContext.jsx) [NEW]
  - [`dev-dashboard/src/services/pdfService.js`](file:///d:/Aplicaciones/dev-dashboard/src/services/pdfService.js) [NEW]
* **Causa Raíz:**
  - Se requería dotar a la Consola Central Ecosistema (`dev-dashboard`) de capacidades para exportar recibos PDF de comisión mensual de clientes, copiar IDs/tokens de forma interactiva y gestionar diálogos y notificaciones toast de forma premium.
* **Solución Técnica:**
  - **Copiado Rápido:** Integración del hook `useCopyToClipboard` para copiar de manera ágil el ID del reporte y token de telemetría de cliente.
  - **Recibos PDF:** Creación de un servicio con `jspdf` y `jspdf-autotable` para exportar y descargar reportes y comprobantes de comisión mensual.
  - **Alertas y Confirmaciones síncronas:** Implementación del proveedor de alertas promesificadas `AlertConfirmContext` HSL para evitar prompts rústicos del navegador y guiar los flujos críticos (cambios de estado de pago).
  - **Toast flotantes:** Inyección de `GuidedToast` y `useToast` para mostrar notificaciones no intrusivas en caliente.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa (Hotfix: corregido ReferenceError al destructurar `hideToast` en `App.jsx`).

---

### [2026-06-03] - Rediseño e Interfaz Premium de Alto Impacto para la Consola Ecosistema Central

* **Tipo:** UI/UX / Sistema de Diseño / Ecosistema
* **Archivo(s) Modificado(s):**
  - [`dev-dashboard/src/App.jsx`](file:///d:/Aplicaciones/App Ventas/dev-dashboard/src/App.jsx) [MODIFY]
* **Causa Raíz:**
  - Se requería dotar al dashboard central de desarrollo de una estética premium con temática oscura, fuentes Outfit, gráficos detallados de comisiones, listados fluidos con inspector de telemetría y una consola de diagnóstico en tiempo real.
* **Solución Técnica:**
  - **Gráfico de Comisiones:** Diseño de barras de distribución porcentual animadas del top 5 de clientes que aporta mayor comisión al desarrollador.
  - **Listados e Inspector Lateral:** Creación de una tabla optimizada con filtros de búsqueda y estado de pago, interactiva en fila que abre un Drawer/Ficha de telemetría detallada del cliente.
  - **Efecto Dark Mode & Glassmorphism:** Implementación de fondos enriquecidos `#070b13` con halos difuminados en gradiente y bordes finos de opacidad baja para evitar marcos toscos.
  - **Live Log System:** Incorporación de un monitor de eventos o logs del sistema que detalla cada paso de conexión, autenticación, refrescos de Firebase y operaciones locales.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-03] - Corrección de Crash en Botón de Guardado de Comisiones y Actualización de Reglas de Telemetría Central

* **Tipo:** Corrección de Bug / Seguridad / Base de Datos
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`dev-dashboard/firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/dev-dashboard/firestore.rules) [MODIFY]
* **Causa Raíz:**
  - 1. Al presionar "Guardar" en la sección de porcentaje de comisión, el spinner y estado deshabilitado del botón modificaban síncronamente los nodos del DOM mientras React intentaba desmontar y animar el mensaje flotante de éxito, provocando el crash de React `NotFoundError: Failed to execute 'insertBefore' on 'Node'`.
  - 2. Al reportar de forma automática la telemetría real de facturación a la base de datos central de Prototipe, Firestore bloqueaba la transmisión (`FirebaseError: Missing or insufficient permissions`) porque el cliente realizaba una operación de actualización (`update` mediante `setDoc` de un documento que ya existía de pruebas) y las reglas de seguridad solo autorizaban la creación pública (`create`), exigiendo autenticación del desarrollador para cualquier actualización.
* **Solución Técnica:**
  - **Botón Libre de Crash:** Se rediseñó el renderizado del icono y spinner en `AdminSettings.jsx` para cambiar clases y estados visuales sin alterar la estructura física ni remover elementos del árbol del DOM en caliente.
  - **Alineación de Reglas de Base de Datos:** Se modificó `firestore.rules` del proyecto central `prototipe-multi-instancia-control` para permitir tanto `create` como `update` de manera pública a nivel del documento del reporte mensual, bajo validación de que el token enviado en la petición coincida con el cliente y esté activo en la colección `/tokens`. Reglas desplegadas con éxito mediante Firebase CLI.
* **Estatus:** ✅ Completado y validado con compilación limpia.

---

### [2026-06-03] - Extracción y Aislamiento del Dashboard Dev en un Proyecto Independiente

---

### [2026-06-03] - Implementación de Centralización Ecosistema (Híbrido Spark/Blaze) y Consola del Desarrollador (Dashboard Dev)

* **Tipo:** Nueva Funcionalidad / Ecosistema / Centralización / Seguridad de Base de Datos
* **Archivo(s) Modificado(s):**
  - [`src/services/telemetryService.js`](file:///d:/Aplicaciones/App Ventas/src/services/telemetryService.js) [MODIFY]
  - [`src/routes/AppRoutes.jsx`](file:///d:/Aplicaciones/App Ventas/src/routes/AppRoutes.jsx) [MODIFY]
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`src/pages/admin/DashboardDev.jsx`](file:///d:/Aplicaciones/App Ventas/src/pages/admin/DashboardDev.jsx) [NEW]
  - [`.env.local`](file:///d:/Aplicaciones/App Ventas/.env.local) [MODIFY]
* **Causa Raíz:**
  - Se requería una solución económica/gratuita en plan Spark (sin Cloud Functions inicialmente, pero lista para transicionar a Blaze) para centralizar la telemetría mensual de comisiones y facturas de clientes, además de un panel privado visualizador para el desarrollador.
* **Solución Técnica:**
  - **Servicio Telemetría Híbrido:** Se actualizó `telemetryService.js` para inicializar una aplicación secundaria de Firebase apuntando al proyecto de control del desarrollador y registrar directamente los reportes en `/reportesBilling` de forma write-only segura (Modo Spark), manteniendo el fallback HTTP por endpoint (Modo Blaze) configurable por entorno.
  - **Dashboard Dev Privado:** Se creó `DashboardDev.jsx` con métricas consolidadas en tiempo real, cambio de estatus de facturas (pendiente/pagado) y botón de simulación de telemetría de prueba.
  - **Acceso Protegido:** Se integró la Consola Ecosistema Centralizada en el submenú de Facturación en `AdminSettings.jsx`, protegida por el PIN de desarrollador (`DEV_PIN`).
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-03] - Corrección de ReferenceError en Seguridad y Accesos en AdminSettings
* **Tipo:** Corrección de Bug / Estabilidad
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Causa Raíz:**
  - Al ingresar a la sección de "Seguridad y Accesos" en el panel de configuración de administración, la aplicación fallaba con un error de ejecución `ReferenceError: auth is not defined` porque un campo de entrada intentaba evaluar `auth.currentUser?.email` sin que el módulo `auth` estuviera importado en el archivo.
* **Solución Técnica:**
  - Se importó la instancia unificada de `auth` desde `../../config/firebaseConfig`.
* **Estatus:** ✅ Completado y desplegado a Firebase Hosting.

---

### [2026-06-03] - Corrección en Creación de Créditos y Fiados (Carga de Datos y Estado Activo)

* **Tipo:** Corrección de Bug / Base de Datos / Lógica de Negocio
* **Archivo(s) Modificado(s):**
  - [`src/services/orderService.js`](file:///d:/Aplicaciones/App Ventas/src/services/orderService.js) [MODIFY]
* **Causa Raíz:**
  - Cuando se creaba un crédito al aprobar un pedido o realizar una venta directa a crédito desde el POS, el documento en la colección `credits` se generaba con el estado `'PENDIENTE'`. Sin embargo, las interfaces del Administrador (`AdminCredits.jsx`) y del Cliente (`ClientCredits.jsx`) filtran las deudas activas estrictamente por `'activo'`. Esto causaba que los créditos nuevos no cargaran en las listas.
  - Además, se guardaba el objeto `cliente: { nombre, celular }` y el campo `total`, pero la interfaz y el listado de créditos buscan específicamente campos aplanados como `clienteNombre`, `clienteCelular` y `montoTotal`, dejando la información de cliente y el total en `undefined`.
* **Solución Técnica:**
  - Se modificaron las dos secciones de creación de deudas de la colección `credits` en `orderService.js` (aprobación de crédito y venta directa POS) para inyectar explícitamente los campos requeridos: `clienteNombre`, `clienteCelular`, `montoTotal` y establecer el estado inicial de la deuda a `'activo'`, solucionando por completo la carga en los listados y vistas del cliente y administrador.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-03] - Eliminación de Preselección de Color por Defecto en Detalles de Producto

* **Tipo:** UI/UX / Flujo de Compra
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ProductDetailPage.jsx`](file:///d:/Aplicaciones/App Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [`src/pages/client/ProductPublicDetail.jsx`](file:///d:/Aplicaciones/App Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
* **Causa Raíz:**
  - El sistema preseleccionaba automáticamente la primera variante de color disponible con stock. Esto podía confundir a los clientes, quienes al realizar la compra no seleccionaban activamente su color deseado y compraban la variante por defecto sin notar el selector.
* **Solución Técnica:**
  - Se removió la línea `if (c.length > 0) setSelectedColor(c[0])` de los efectos de inicialización al cargar el producto. Ahora la propiedad `selectedColor` inicia como `null` (sin selección), manteniendo el visor del carrusel en la imagen principal de portada (índice 0).
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-03] - Solución a Bloqueo Silencioso en el Proceso de Checkout y Visibilidad de Campos de Contacto

* **Tipo:** Corrección de Bug / UI/UX / Estabilidad de Formulario
* **Archivo(s) Modificado(s):**
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
* **Causa Raíz:**
  - El modal de checkout (`CheckoutModal.jsx`) ocultaba el campo de entrada para el nombre completo del cliente hasta que se completara el debounced lookup del celular en base de datos.
  - Si el número ingresado era muy corto (< 7 caracteres), el lookup no se activaba, dejando el campo de nombre oculto indefinidamente. El usuario no podía ver ni rellenar el nombre, por lo que presionar "Continuar al Pago" (Step 2) lanzaba una validación bloqueante de que el campo "nombre" era requerido, pero el usuario no tenía cómo rellenarlo.
  - Además, si por algún motivo ocurría un error de validación de Zod en el Paso 3 (Método de Pago) al hacer clic en "Finalizar Compra", la aplicación fallaba la validación silenciosamente sin mostrar ningún mensaje al usuario (los errores individuales de datos como `nombre` o `celular` no tenían un campo de visualización en el Paso 3, y la variable `errors.global` no se inyectaba con los detalles de validación de Zod).
* **Solución Técnica:**
  - **Visibilidad del Nombre:** Se inicializó `showNameField` en `true` por defecto para asegurar que el input del nombre sea visible en todo momento.
  - **Mantenimiento de Datos:** Se ajustó la entrada del celular para que al cambiar no oculte el campo de nombre ni limpie de forma redundante el nombre previamente digitado por el usuario.
  - **Validación Temprana:** Se añadieron validaciones de formato de nombre (mínimo 3 caracteres) y de teléfono (mínimo 7 caracteres) directamente en `handleNextStep` (Paso 2 al Paso 3) para informar al usuario de errores de formato antes de salir del paso de captura de datos, mostrando la advertencia de forma inmediata y contextual en `errors.global`.
  - **Visibilidad de Errores de Zod:** Se actualizó `handleCheckout` en el Paso 3 para inyectar la primera validación errónea de Zod dentro de `errors.global` en caso de fallo, garantizando feedback visual al usuario en lugar de un comportamiento inerte.
  - **Modal Exitoso Persistente:** Se eliminó la llamada automática `onClose()` de la función `handleWhatsApp` para que el modal no se cierre tras notificar la orden por WhatsApp, permitiendo consultar el estado o avisar nuevamente en cualquier orden.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-03] - Corrección de ReferenceError en CheckoutModal.jsx

* **Tipo:** Corrección de Bug / Estabilidad
* **Archivo(s) Modificado(s):**
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
* **Causa Raíz:**
  - Al abrir el Checkout, la aplicación se caía con un `ReferenceError: currentSettings is not defined` en `CheckoutModal.jsx:756` porque se validaban las coordenadas de recogida del local (`currentSettings.pickup?.coords`) en una sección donde la variable no estaba declarada en scope.
* **Solución Técnica:**
  - Se extrajo `currentSettings` a una declaración con `useMemo` a nivel de componente general (dentro del scope de la función del componente), garantizando su disponibilidad en todo el ciclo de vida y renderizado de la interfaz del CheckoutModal. Se removieron las definiciones locales duplicadas y redundantes.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-03] - Reubicación Estratégica de Precios Above-the-Fold y Compresión de Espaciado Vertical

* **Tipo:** UI/UX / Sistema de Diseño / Optimización de Espacios / Consistencia
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ProductDetailPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [`src/pages/client/ProductPublicDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
* **Causa Raíz:**
  - El bloque de precios en ambas vistas detalladas (cliente interna y portal QR público) se renderizaba abajo del fold, obligando a realizar scroll vertical solo para ver el precio.
  - El selector de color y variantes se sentía muy alejado del carrusel de miniaturas secundarias por espaciados predeterminados altos (`space-y-6`).
* **Solución Técnica:**
  - **Reubicación de Precios:** Se trasladó el bloque de precios al bloque de cabecera superior en ambas vistas. Se eliminaron por completo las secciones de precio duplicadas de la parte inferior de ambas páginas. El color del precio principal se homogeneizó a `text-primary`.
  - **Alineación a la Izquierda:** Se modificó la cabecera móvil de `ProductDetailPage.jsx` para alinear tanto el título como los tags y la fila de precios a la izquierda (`text-left`, `justify-start`), logrando un acabado simétrico y elegante y eliminando el centrado del precio.
  - **Carga de Promociones en Portal QR:** Se importó e integró el hook `useAds` en `ProductPublicDetail.jsx` para computar correctamente el `product` con descuento y habilitar la correcta renderización del precio original tachado en combinación con promociones activas.
  - **Sincronización de Encabezados:** Se reemplazó el botón flotante manual en `ProductDetailPage.jsx` por la misma barra de navegación superior fija (`fixed h-16 bg-surface/80 backdrop-blur-md border-b`) de `ProductPublicDetail.jsx`, indicando "Detalle del Producto" y el nombre de la tienda (`appName`).
  - **Replicación de Botones (Bolsa +):** Se reemplazó el texto del botón "Carrito" en la página de detalle por un botón icónico compacto con el icono `ShoppingBag` y el símbolo `+`. El botón "Comprar Ahora" ocupa el resto de la fila de manera proporcional en desktop y móvil.
  - **Reutilización de QuantitySelector en Portal QR:** Se eliminó el maquetado `- / +` manual de cantidades ad-hoc de `ProductPublicDetail.jsx` y se reemplazó por la integración en cascada del componente atómico reutilizable `<QuantitySelector />` en su tamaño por defecto (`size="md"`), garantizando al 100% la consistencia visual y de comportamiento.
  - **Footer Móvil Glassmorphism:** Se actualizó la barra de acciones fijas del detalle de producto móvil para usar el mismo estilo translúcido con desenfoque de fondo (`bg-surface/90 backdrop-blur-md border-t border-app z-40`).
  - **Compresión de Espaciado:** Se redujo el espaciado entre los componentes de variantes de `space-y-6` a `space-y-4`, y los interespaciados de títulos a `space-y-1.5`, logrando acercar significativamente el selector de color a las miniaturas y compactar la vista global para evitar scroll.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-03] - Unificación Estética del Portal QR, Autoplay y Animación de Carrusel

* **Tipo:** UI/UX / Sistema de Diseño / Corrección de Bug / Consistencia
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ProductPublicDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
  - [`src/pages/client/ProductDetailPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
* **Causa Raíz:**
  - En la vista pública del Portal QR (`ProductPublicDetail.jsx`), el tamaño de las miniaturas de imágenes secundarias, los selectores de variantes ("Talla" y "Color"), y el orden de los mismos discrepaban de la vista de detalle del cliente (`ProductDetailPage.jsx`). Las flechas eran pequeñas (`w-8` vs `w-10`) y carecía de transición de opacidad (resplandor) al cambiar de foto.
  - Al hacer clic en un color de variante, la imagen principal no se actualizaba automáticamente por discrepancias de token dinámico en Firebase Storage. Tampoco existía cambio de imágenes automático (autoplay) en ninguna vista.
* **Solución Técnica:**
  - **Alineación Visual del Portal QR:** Sincronizados tamaños de miniaturas, selectores e inversión del orden. Se inyectó `<AnimatePresence>` y animaciones de `framer-motion` para lograr el efecto de "resplandor" al cambiar imágenes. Flechas del portal escaladas a `w-10 h-10` con Chevron size 24.
  - **Cambio de Imagen por Variante:** Se refinó el helper `cleanUrl` con decodificación de URI y coincidencia con `currentVariant` en ambos componentes.
  - **Autoplay en Carruseles con Pausa Inteligente:** Se implementó un hook `useEffect` en ambas vistas que rota las imágenes automáticamente cada 5 segundos y se detiene automáticamente si el usuario tiene seleccionado un color de variante. El carrusel se reinicia ante cambios manuales.
  - **Resplandor de Selección y Toggle:** Se configuró un efecto de brillo neon activo (`boxShadow` dinámica en el estilo con `cssColor`) en los círculos de colores de variante seleccionados. Además, se integró toggle en el `onClick` para permitir la deselección al hacer clic de nuevo, lo cual apaga el resplandor y reactiva el autoplay.
  - **Miniaturas de Imágenes Borderless y Fluidas:** Se removieron los bordes en las miniaturas de imágenes secundarias en ambas vistas. Se unificó el comportamiento interactivo aplicando una transición de 200ms donde la miniatura seleccionada escala a `scale-105` con sombra suave (`shadow-md`) y opacidad al 100%, mientras que las inactivas se contraen a `scale-95` y opacidad al 60%.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-02] - Sincronización y Armonización Premium de Vistas de Producto (Portal QR y Detalle Cliente)

* **Tipo:** UI/UX / Sistema de Diseño / Corrección de Bug / Consistencia
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ProductPublicDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
  - [`src/pages/client/ProductDetailPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
* **Causa Raíz:**
  - Inconsistencia estética e interactiva entre el portal de compra QR (`ProductPublicDetail.jsx`) y la vista interna de detalle del producto (`ProductDetailPage.jsx`).
  - Las galerías no permitían navegación por deslizamiento horizontal (gesto táctil).
  - Los selectores de variantes de color mostraban miniaturas de imágenes dentro de los botones redondos y exponían las etiquetas de texto de códigos hexadecimales que iniciaban con `#`.
  - Faltaba el set de botones de acción rápida flotantes (Favorito, Compartir, WhatsApp) sobre el carrusel en el detalle interno, mientras que en el portal público se mostraba un botón de compartir duplicado e innecesario en la cabecera.
  - Los mensajes de texto compartidos incluían URLs directas propensas a ser bloqueadas como spam por WhatsApp/Meta.
* **Solución Técnica:**
  - **Carrusel e Imagen (Gestos y Flechas):** Se implementaron gestos de arrastre táctil horizontal (`drag="x"`) mediante Framer Motion en ambas páginas para permitir deslizar las fotos cómodamente, manteniendo las flechas de navegación e indicadores de página unificados.
  - **Selector de Color Limpio:** Se modificó la renderización para mostrar círculos con colores de fondo planos (`backgroundColor`) removiendo las miniaturas de imágenes en ambas vistas. Se inyectó lógica para ocultar del texto visual cualquier código de color hexadecimal que empiece con `#`. Se sincronizó el cambio automático al hacer clic en un color de variante para mapear la imagen correcta en el carrusel buscando en la colección `product.variantes`.
  - **Botoneras Flotantes y Cabeceras Simétricas:** Se incorporó el stack de 3 botones de acción flotantes (Favorito enlazado al favoritesStore, Compartir sin links y WhatsApp Directo) sobre el carrusel de `ProductDetailPage.jsx`. Se removió el botón de compartir duplicado de la cabecera de `ProductPublicDetail.jsx`.
  - **Sanitización del Compartido:** Se excluyeron los enlaces de URLs de la plantilla predeterminada de mensajes de WhatsApp y compartición general, dejando únicamente texto descriptivo del producto para evitar restricciones de las plataformas de mensajería.
  - **Renderizado Condicional de Favoritos:** Se implementó una verificación del rol y estado de la sesión (`role === 'client' && user`) en el portal QR y la página de detalle. El botón con forma de corazón para agregar a favoritos se oculta dinámicamente si el usuario cliente no está logueado o si la sesión activa pertenece a un rol administrativo o empleado, previniendo incoherencias con el favoritesStore.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-02] - Armonización de Portal de Compra QR y Galería Condicional en Administrador

* **Tipo:** Nueva Funcionalidad / UI/UX / Optimización de Formularios
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ProductPublicDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
  - [`src/components/admin/inventory/ProductFormModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]
* **Causa Raíz:**
  - El portal público de compra QR (`ProductPublicDetail.jsx`) mostraba un banner amarillo con una ubicación fija de prueba, estrellas y rankings de calificación ficticios, el código hexadecimal plano en los colores, y selectores de color toscos con bordes oscuros inconsistentes.
  - En la administración, la "Galería de imágenes secundarias" saturaba el formulario de edición de productos con variantes, cuando estas últimas ya pueden cargar sus propias fotos por color/talla.
* **Solución Técnica:**
  - **Portal de Compra QR:** Se eliminó el banner de dirección ("Enviar a Calle 17..."), quitando el padding superior extra (`pt-20`). Se eliminó el bloque de estrellas y rankings. Se configuró el label de color para omitir la renderización de texto de códigos hexadecimales que empiecen con `#`. Se rediseñaron los botones de color para que sean círculos perfectos (`rounded-full`) y borderless con efectos de escala y brillo en selección. Se inyectó autoselección por defecto de la primera variante con stock.
  - **Galería Condicional en Administrador:** Se implementó `showSecondaryGallery` in `ProductFormModal.jsx` para evaluar reactivamente `hasActiveVariants`. Si el producto tiene configurada más de una variante, o si posee variantes con colores/tallas definidas, la sección de galería secundaria general se oculta automáticamente para simplificar la interfaz, mostrándose únicamente para productos simples.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-02] - Selección Automática de Variante por Defecto en Detalle de Producto

* **Tipo:** Mejora de UI/UX / Optimización de Conversión
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ProductDetailPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
* **Causa Raíz:**
  - Al ingresar a la ficha detallada de un producto con variantes, el sistema no preseleccionaba ninguna variante de color o talla de forma predeterminada, requiriendo clics del usuario y dejando la imagen principal (de portada) flotando en un estado neutro sin posibilidad de re-asociarse directamente mediante un botón.
* **Solución Técnica:**
  - Se modificó la inicialización del estado en `ProductDetailPage.jsx` dentro del efecto de cambio de producto para que, si existen variantes de talla (`t.length > 0`) o de color (`c.length > 0`), se preseleccione automáticamente el primer elemento disponible (`t[0]` y `c[0]`) que cuente con stock.
  - Esto provoca que la galería se desplace de inmediato a la imagen específica de la variante inicial (si tiene una configurada) o mantenga la portada de respaldo, garantizando un flujo fluido sin imágenes sueltas.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-02] - Estandarización de Toast de Guardado en Ajustes de Administración

* **Tipo:** Corrección de UI/UX / Sistema de Diseño / Consistencia
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Causa Raíz:**
  - El toast de guardado al actualizar configuraciones en el módulo de ajustes de administración (`AdminSettings.jsx`) carecía de las clases de fondo (`bg-surface`) y contorno (`border-app`), haciéndolo completamente transparente. Esto causaba problemas de legibilidad, contraste deficiente y visualización inconsistente con respecto a los otros componentes de notificaciones flotantes de la plataforma.
* **Solución Técnica:**
  - Se añadieron las clases CSS `bg-surface/95` y `border-app` en el elemento contenedor `<motion.div>` de `saveMessage` en `AdminSettings.jsx`. Esto elimina la transparencia y le otorga un estilo de tarjeta sólida de alta fidelidad, asegurando una integración estética óptima con el tema seleccionado (claro/oscuro) y alineación formal con el diseño unificado del Notification Center.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-02] - Enlace de Imagen por Variante y Enrutado Inteligente de Galería

* **Tipo:** Nueva Funcionalidad / UI/UX / Consistencia
* **Archivo(s) Modificado(s):**
  - [`src/components/admin/inventory/ProductFormModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]
  - [`src/pages/client/ProductDetailPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
* **Causa Raíz:**
  - El administrador requería asociar imágenes específicas a cada variante (color/talla) del inventario tanto al registrar un nuevo producto como al editar uno existente, de modo que al seleccionar el color en la ficha detallada, el carrusel de imágenes se desplace automáticamente a la imagen del color seleccionado.
* **Solución Técnica:**
  - **Exposición en Admin (ProductFormModal):** Se añadió el campo `URL Imagen Variante` en la sección común de renderizado de variantes (`renderVariantsSection`) de `ProductFormModal.jsx`, reestructurando los atributos de variantes en una cuadrícula responsiva de 3 columnas en PC (`grid-cols-1 md:grid-cols-3`), haciéndolo disponible de forma nativa e idéntica tanto en el wizard de creación rápida (paso 5) como en el formulario clásico de edición.
  - **Consolidación en Catálogo (ProductDetailPage):** Se modificó `ProductDetailPage.jsx` para recolectar y consolidar de manera dinámica todas las imágenes secundarias de variantes dentro del array general del carrusel (`allImages`), evitando que se queden fuera de la galería.
  - **Enrutado de Galería:** Al cambiar la variante seleccionada, si ésta posee una URL de imagen, el sistema calcula su índice en el carrusel y ejecuta síncronamente `setActiveImageIndex(index)`, permitiendo que el carrusel (bajo `advancedGalleryEnabled`) transicione e indique la página correspondiente de forma natural y sin alterar el orden original del array de imágenes.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-02] - Rediseño del Selector de Color en Detalle de Producto

* **Tipo:** UI/UX / Sistema de Diseño
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ProductDetailPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
* **Causa Raíz:**
  - El usuario solicitó remover por completo cualquier borde, anillo u outline en la selección de color del detalle del producto, mostrando únicamente el círculo de color plano disponible.
* **Solución Técnica:**
  - Se removieron todos los bordes, rings y sombras externas del botón en `ProductDetailPage.jsx` (`border-0 ring-0 p-0 shadow-xs`).
  - Se aplicó `focus:outline-none outline-none` para evitar el outline por defecto del navegador.
  - Para indicar la selección del color, se implementó un efecto de escala y brillo puro (`scale-115 shadow-md brightness-105`), dejando el círculo de color completamente libre de bordes o contornos en cualquier estado (activo o inactivo).
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-02] - Integración de Layout de Escritorio, Barra de Estado Unificada y Variantes de Color Desplazables

* **Tipo:** UI/UX / Navegación / Consistencia
* **Archivo(s) Modificado(s):**
  - [`src/routes/AppRoutes.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/routes/AppRoutes.jsx) [MODIFY]
  - [`src/components/client/catalog/ProductCard.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
  - [`src/pages/client/ClientCatalog.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
  - [`src/layouts/ClientLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
* **Causa Raíz:**
  - El usuario notó que al ingresar al detalle de producto en PC no se veía ningún cambio estructural de la grilla porque cargaba a pantalla completa fuera del layout del cliente (sin Sidebar).
  - Faltaba el botón de Perfil en la cabecera de la barra de estado de escritorio para ser idéntico al de celular.
  - Los pequeños círculos de variantes de color en las tarjetas de catálogo se amontonaban o truncaban a 5 elementos; el usuario solicitó listar todos y hacerlos desplazables en horizontal para evitar saturar o desbordar la tarjeta.
* **Solución Técnica:**
  - **Enrutamiento Tienda:** Se reubicó el path `/producto/:id` como ruta hija de `/tienda` (`/tienda/producto/:id`) en `AppRoutes.jsx`. Se adaptaron las llamadas `navigate` en `ProductCard.jsx` y `ClientCatalog.jsx`.
  - **Ocultamiento de Menús en Móvil:** En `ClientLayout.jsx`, se condicionaron el Header y la barra inferior de navegación móvil mediante `{!isProductDetail && ...}` usando el hook `useLocation`.
  - **Unificación de Botones:** Se inyectó el NavLink del botón de Perfil (`User` de Lucide) en el panel de botones del header del Sidebar de PC de `ClientLayout.jsx` con el mismo estilo y tamaño.
  - **Carrusel Horizontal de Colores:** En `ProductCard.jsx`, se removió la limitación `.slice(0, 5)` y el contador `+N`. El div contenedor se reestructuró con `overflow-x-auto scrollbar-none snap-x` para permitir scroll horizontal suave táctil y con mouse, deteniendo el click propagation con `onClick={(e) => e.stopPropagation()}` para no abrir la ficha accidentalmente.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-02] - Estandarización y Unificación de Diseño y Posicionamiento de Toasts

* **Tipo:** UI/UX / Sistema de Diseño / Consistencia
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminInventory.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]
  - [`src/components/client/catalog/ProductDetailModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]
  - [`src/pages/client/ProductDetailPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]
  - [`src/pages/admin/AdminClaims.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminClaims.jsx) [MODIFY]
* **Causa Raíz:**
  - Los toasts/alertas de éxito o validación de la aplicación aparecían en el fondo cubriendo botones esenciales de la barra de navegación del cliente en móvil. Adicionalmente, tenían estilos visuales inconsistentes y fondos con transparencias excesivas (`backdrop-blur-xl bg-surface/85`).
* **Solución Técnica:**
  - **Reposicionamiento de Toasts:** Se modificaron todos los contenedores de alertas temporales flotantes para posicionarse en el tope superior de la pantalla (`top-4 left-1/2 -translate-x-1/2 z-[10000]`).
  - **Estandarización de Estilos:** Se removieron los efectos translúcidos y los sombreados de colores. Se aplicó el estilo del Notification Center (`bg-surface border border-app shadow-2xl rounded-2xl p-4 flex items-center gap-3`) e iconos con fondos al 10% de opacidad del color temático correspondiente.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-02] - Corrección de Botón de Retroceso en Detalle de Producto

* **Tipo:** Bug Fix / Navegación
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ProductDetailPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
* **Causa Raíz:**
  - Al ingresar directamente a la ficha detallada de producto mediante un enlace externo, código QR o recargar la página, el historial del navegador no posee páginas previas dentro de la aplicación, por lo que el botón de retroceso (`BackButton`) quedaba inerte e inactivo.
* **Solución Técnica:**
  - Se implementó un manejador inteligente `onClick` que evalúa `window.history.state`. Si hay historial previo dentro de la aplicación, ejecuta `navigate(-1)` para conservar filtros y scroll; si no hay historial previo, redirige al usuario de forma segura a `/tienda`.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-02] - Rediseño Premium de la Vista Detallada de Producto - Fase 2 (Doble Botón y Sincronización de Filtros)

* **Tipo:** UI/UX / Optimización de Conversión / Soporte Dinámico de Configuración
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ProductDetailPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
* **Causa Raíz:**
  - El usuario solicitó reordenar el flujo de la vista de detalle de producto (título y categoría arriba, galería de imágenes abajo) e incorporar dos botones fijos en el footer ("Carrito" para agregar de forma estándar y "Comprar Ahora" para abrir síncronamente el modal de checkout directo). Adicionalmente, se retiró el panel flotante traslúcido del footer, integrando los botones y el contador de cantidad directamente en el flujo del cuerpo de información de la página sin fondos o bordes adicionales. El diseño se adapta a la configuración de filtros de tallas y colores de la tienda (`catalogFilters`).
* **Solución Técnica:**
  - **Reordenamiento Estructurado:** Se movieron el título del producto, categoría y tags ("Nuevo", "Vendidos") a una sección fija/superior arriba del carrusel de imágenes.
  - **Filtros Dinámicos:** Se importó `catalogFilters` de `useAppConfigStore()` para controlar de forma condicional la visibilidad de los selectores de tallas (`catalogFilters.sizes`) y colores (`catalogFilters.colors`).
  - **Doble Acción de Compra:** Se integró `CheckoutModal` en `ProductDetailPage.jsx`. El botón "Comprar Ahora" añade el producto y su variante seleccionada al carrito de forma atómica y activa síncronamente el estado `showCheckout` para abrir el Checkout de inmediato.
  - **Eliminación de Fondos y Paneles:** Se retiró el contenedor de pie de página flotante con clases de blur, bordes y sombras (`bg-surface/90 backdrop-blur-md border-t`). El selector de cantidad y los botones de compra ahora se dibujan transparentemente en el cuerpo de la página.
  - **Eliminación de Borde de Precios:** Se removió el recuadro gris con borde verde de la sección de precios e inventario, haciendo que los valores fluyan con transparencia directamente sobre el fondo del cuerpo de información, en sintonía con la maqueta de referencia.
  - **UX Premium (Skeletons):** Se reemplazó el spinner de carga clásico por una simulación en esqueleto (Skeleton Loader) con efecto shimmer de la cabecera, carrusel e info.
* **Estatus:** ✅ Completado, compilado con éxito y verificado.

---

### [2026-06-02] - Rediseño Premium de la Vista Detallada de Producto

* **Tipo:** UI/UX / Optimización de Layout
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ProductDetailPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
* **Causa Raíz:**
  - El cliente percibía que la página tenía un espaciado excesivo entre elementos, una línea verde de cabecera divisoria redundante, una tarjeta de descripción gris que afectaba la estética general y que la disponibilidad de unidades (stock) requería hacer scroll innecesario.
* **Solución Técnica:**
  - **Estructura y Spacing:** Se redujo el relleno global de la tarjeta contenedora solapada (`px-6 pt-6 pb-28`) y se eliminó la línea de borde divisoria horizontal inferior del título.
  - **Ubicación de Stock:** Se reubicó el indicador de stock en tiempo real directamente al lado del bloque de precios en la parte superior, utilizando un badge curvo interactivo con luz de estado pulsante (ej. "● 56 disponibles").
  - **Descripción Minimalista:** Se eliminó la caja contenedora de descripción con bordes negros duros, sustituyéndola por una etiqueta micro en mayúsculas `tracking-wider` y texto editorial fluido.
  - **Compactación:** Se compactaron los márgenes y alturas de los selectores de tallas y colores, logrando que toda la información relevante cargue en un solo pantallazo inicial (above the fold).
* **Estatus:** ✅ Completado, compilado con éxito y verificado.

---

### [2026-06-02] - Remoción de Reseñas Estáticas de Ficha de Producto

* **Tipo:** UI/UX / Limpieza Visual
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ProductDetailPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
* **Causa Raíz:**
  - El cliente indicó que el apartado de reseñas con la puntuación estática de `4.8` y las estrellas era meramente visual y ficticio, por lo que deseaba eliminarlo por completo del diseño.
* **Solución Técnica:**
  - Se removió el div contenedor de la puntuación en estrellas y el texto `(12 reseñas)` de la zona superior de metadatos de la página de detalle del producto.
* **Estatus:** ✅ Completado, compilado con éxito y verificado.

---

### [2026-06-02] - Módulo de Identidad de Marca Completo (Favicon, SEO, Datos de Contacto y Reportes PDF)

* **Tipo:** Nueva Funcionalidad / Ecosistema / Integración de Marca
* **Archivo(s) Modificado(s):**
  - [`src/store/appConfigStore.js`](file:///d:/Aplicaciones/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
  - [`src/App.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/App.jsx) [MODIFY]
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`src/layouts/ClientLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
  - [`src/pages/admin/AdminSalesDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]
  - [`src/services/pdfService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/pdfService.js) [MODIFY]
* **Causa Raíz:**
  - El cliente requería habilitar la personalización de favicon independiente del logo, meta description para buscadores/SEO, y propagar datos legales y de contacto (correo, dirección, ciudad, políticas) a pie de página y reportes PDF.
* **Solución Técnica:**
  - **Zustand & DB:** Se habilitaron 7 nuevos campos persistentes (`faviconUrl`, `seoDescription`, `contactEmail`, `businessAddress`, `businessCity`, `privacyPolicyUrl`, `termsUrl`) con hidratación síncrona y guardado en Firestore.
  - **App & SEO:** Se inyectó lógica reactiva en `App.jsx` para reescribir favicon dinámicamente en el DOM y actualizar tags de meta descripción y OpenGraph.
  - **Ajustes:** Se rediseñó el formulario "Identidad de Marca" en `AdminSettings.jsx` agregando campos descriptivos con validación de URL y previsualización.
  - **Client Footer:** Se inyectó un pie de página corporativo premium en `ClientLayout.jsx` con soporte condicional de enlaces externos y datos.
  - **PDFs:** Se adaptó `pdfService.js` para recibir `businessInfo` y renderizar una cabecera de reporte con metadatos del negocio.
* **Estatus:** ✅ Completado, compilado con éxito y verificado.

---

### [2026-06-02] - Unificación de Estilos de Encabezados Superiores (Cliente y Admin)

* **Tipo:** Refactorización de UI/UX / Consistencia Estética
* **Archivo(s) Modificado(s):**
  - [`src/layouts/ClientLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
  - [`src/layouts/AdminLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
* **Causa Raíz:**
  - El encabezado del cliente (Tienda Virtual) y el del administrador (Panel Admin) en móviles tenían discrepancias de altura, fondos, sombras, estilos de botones y alineación de logos.
* **Solución Técnica:**
  - Se homogeneizaron los contenedores móviles de ambos layouts con clase `fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-app shadow-sm`.
  - Se unificó el estilo y la estructura flex del logotipo y del bloque de títulos izquierdo.
  - Se estandarizaron todos los botones del lado derecho (notificaciones, carrito y avatar) bajo una misma clase premium de bordes curvos y sombras (`w-10 h-10 rounded-xl bg-surface hover:bg-surface-2 border border-app shadow-xs`), garantizando consistencia absoluta en el sistema de diseño.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-02] - Implementación de Encabezado Superior para el Panel de Administración en Móvil

* **Tipo:** Nueva Funcionalidad / UI/UX Premium / Diseño Responsivo
* **Archivo(s) Modificado(s):**
  - [`src/layouts/AdminLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
* **Causa Raíz:**
  - El panel administrativo en pantallas móviles/tablets carecía de una cabecera o navbar superior que diera contexto de la tienda seleccionada y el rol operativo activo, empleando en su lugar un botón flotante suelto para las notificaciones.
* **Solución Técnica:**
  - Se diseñó un encabezado superior fijo (`fixed top-0 left-0 right-0 h-16`) en `AdminLayout.jsx` con soporte de desenfoque de fondo (`backdrop-blur-md`), mostrando el logo de la aplicación, el nombre y el chip de rol administrativo.
  - Se reubicó e integró el botón de notificaciones dentro de esta barra en la esquina superior derecha con micro-animaciones de balanceo y badges adaptativos.
  - Se inyectó relleno superior (`pt-16 md:pt-0`) al contenedor `<main>` principal para corregir el desfase y evitar la superposición de contenido.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-02] - Estandarización de Botones de Retroceso y Rediseño de Cabeceras

* **Tipo:** Refactorización de UI/UX / Diseño Responsivo / Consistencia Visual
* **Archivo(s) Modificado(s):**
  - [`src/components/ui/BackButton.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/BackButton.jsx) [MODIFY]
  - [`src/pages/client/ProductDetailPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [`src/pages/client/ProductPublicDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
  - [`src/pages/admin/AdminStockAlerts.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminStockAlerts.jsx) [MODIFY]
  - [`src/pages/admin/AdminSalesDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]
* **Causa Raíz:**
  - Los botones de retroceso (`BackButton`) se deformaban/aplastaban en ciertos contenedores de diseño flexible (flex layouts). Adicionalmente, las cabeceras de subpáginas como "Reabastecer Inventario" no coincidían con el estándar visual premium y unificado del panel (ej. "Gestión de Pedidos").
* **Solución Técnica:**
  - Se agregó `shrink-0` a los estilos del componente base `<BackButton />` y a los botones manuales de retroceso para blindarlos contra deformación.
  - Se estandarizó `ProductDetailPage.jsx` reemplazando su botón manual por la importación de `<BackButton />`.
  - Se reorganizaron por completo las cabeceras de `AdminStockAlerts.jsx` y `AdminSalesDetail.jsx` inyectando un icono con fondo de color primario (`bg-primary`) junto al título y subtítulo, estructurado simétricamente y alineado al diseño premium de la pestaña de Pedidos.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

---

### [2026-06-02] - Documentación de Colecciones Firestore (Creación y Ubicación en la Raíz del Proyecto)

* **Tipo:** Documentación / Sincronización / Organización de Archivos
* **Archivo(s) Modificado(s):**
  - [`d:/Aplicaciones/App Ventas/Colecciones/colecciones.md`](file:///d:/Aplicaciones/App%20Ventas/Colecciones/colecciones.md) [NEW]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/Estandar de Desarrollo/mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_aplicacion.md) [MODIFY]
  - [`D:/PROTOTIPE/Documentacion PROTOTIPE/Estandar de Desarrollo/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_documentacion_ia.md) [MODIFY]
* **Causa Raíz:**
  - El usuario especificó que la documentación de las colecciones de Firestore necesarias para el funcionamiento del POS debe guardarse en la raíz del proyecto de código activo (`/App Ventas/Colecciones/colecciones.md`) en lugar del directorio de documentación general del proyecto.
* **Solución Técnica:**
  - Se creó la carpeta `Colecciones` y el archivo `colecciones.md` directamente en la raíz de la aplicación activa, excluyendo cualquier colección depurada u obsoleta.
  - Se eliminó el duplicado temporal y su subdirectorio en `D:\PROTOTIPE\Documentacion PROTOTIPE\Colecciones`.
  - Se sincronizó `mapa_aplicacion.md` para incluir el nuevo archivo en el árbol físico del código y se removió la referencia correspondiente del mapa semántico global de documentación (`mapa_documentacion_ia.md`).
* **Estatus:** ✅ Completado y verificado.

---

### [2026-06-02] - Integración de Historial de Facturación Mensual y Sincronización Contable del Dashboard

* **Tipo:** Corrección de Bug / Mejora de Negocio / UI/UX Premium / Sincronización Contable
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminHome.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Causa Raíz:**
  - 1. La tarjeta de Ventas del Dashboard principal de administrador computaba y mostraba el acumulado total histórico en lugar de las ventas netas diarias (caja total de hoy).
  - 2. El módulo de facturación del desarrollador carecía de una sección de consulta de periodos pasados, impidiendo que este rastreara el histórico de comisiones de meses anteriores una vez que el mes en curso se reinicia a cero al cambiar de período.
* **Solución Técnica:**
  - **`AdminHome.jsx`**: Se mapeó la variable `ventas` para retornar `cajaTotal` (suma diaria de métodos de pago de pedidos completados hoy) en lugar del histórico total, y se renombró el encabezado de la tarjeta a "Ventas de Hoy" para absoluta coherencia.
  - **`AdminSettings.jsx`**: Se diseñó e integró un componente visual premium que lista el histórico de comisiones y ventas mensuales de los últimos 6 meses (`desgloseMensual` consumido de `billingService.js`), desglosando ventas, pedidos y comisiones consolidadas por mes.
* **Estatus:** ✅ Completado, compilado con éxito y verificado.

---

### [2026-06-02] - Reorganización de Categorías de Tipografía en Acordeones (Apariencia)

* **Tipo:** Refactorización / Optimización Visual / UI/UX Premium
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Causa Raíz:**
  - El listado extendido de las 20 fuentes tipográficas separadas por categorías ocupaba excesivo espacio vertical en la pestaña de Apariencia del panel de administración, incrementando el scroll innecesariamente.
* **Solución Técnica:**
  - Se convirtió cada categoría de fuente (`Modernas`, `Elegantes`, `Cursivas`, etc.) en un acordeón individual colapsable (`Collapsible`).
  - Se configuró el estado inicial de React de modo que todas las categorías estén cerradas por defecto, exceptuando la categoría de la fuente activa/seleccionada en ese momento (`formData.appFont`).
  - Se integró un botón de cabecera con el Chevron de dirección que rota dinámicamente y se envolvió el grid de fuentes en un contenedor animado de Framer Motion (`motion.div` con transición de altura y opacidad).
* **Estatus:** ✅ Completado, compilado con éxito y verificado.

---

### [2026-06-02] - Corrección de Alineación Multilinea e Iconos en Botones de Configuración

* **Tipo:** Bug Fix / UI/UX / Diseño Responsivo
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Causa Raíz:**
  - Al saltar el texto de los botones de guardado a multilínea en pantallas angostas o contenedores compactos, el icono se desplazaba de manera asimétrica quedando pegado al borde izquierdo del botón.
* **Solución Técnica:**
  - Se envolvió el texto de todos los botones de guardado (`Save`) en `AdminSettings.jsx` dentro de un tag `<span>` con estilos `text-center leading-tight` y se agregó `shrink-0` a los iconos `<Save />` correspondientes.
* **Estatus:** ✅ Completado, compilado con éxito y verificado.

---

### [2026-06-02] - Corrección de Métrica de Ventas en el Dashboard (Ventas de Hoy)

* **Tipo:** Refactorización / Corrección de Visualización / UI/UX
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminHome.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]
* **Causa Raíz:**
  - El panel de inicio del administrador mostraba en la tarjeta "Ventas" el acumulado histórico total de ventas completadas sin filtros temporales, causando confusión y discrepancia contra los $50.000 del mes actual mostrados en la sección detallada de ventas y en la facturación del desarrollador.
* **Solución Técnica:**
  - Se modificó la computación de `metricas.ventas` para utilizar `todaySales` (calculado mediante la suma atómica de todos los pedidos completados con marca de fecha correspondiente al día actual).
  - Se renombró la tarjeta a "Ventas de Hoy" y se actualizó su descripción aclaratoria a "Ventas completadas el día de hoy."
* **Estatus:** ✅ Completado y verificado mediante compilación de producción.

---

### [2026-06-02] - Corrección de Ámbito (ReferenceError: currentSettings is not defined) en CheckoutModal.jsx

* **Tipo:** Bug Fix / Estabilidad de UI / Control de Ámbito de Variables
* **Archivo(s) Modificado(s):**
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
* **Causa Raíz:**
  - La variable `currentSettings` estaba definida dentro de la rama `else` del condicional `if (activeTable && tablesEnabled)`. Si un cliente abría el modal de pago teniendo una mesa de autoservicio activa en su sesión, el flujo tomaba la primera rama y omitía la definición de `currentSettings`. Al renderizar el mapa/instrucciones del local en el resumen de entrega se intentaba leer `currentSettings.pickup?.coords`, lanzando un ReferenceError en tiempo de ejecución.
* **Solución Técnica:**
  - Se movió la inicialización de `currentSettings` al ámbito principal de la función componente de React, asegurando que esté definida y accesible para todos los flujos de renderizado.
* **Estatus:** ✅ Completado, compilado con éxito y verificado.

### [2026-06-02] - Nueva Funcionalidad: Selección de Pedido en Mesa desde Checkout para Clientes No Sentados

* **Tipo:** Nueva Funcionalidad / Autoservicio QR / Checkout Integration / UI/UX Premium
* **Archivo(s) Modificado(s):**
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
* **Detalle:**
  - **Inyección de Opción "Pedido en Mesa"**: Se habilitó dinámicamente el método de entrega "Pedido en Mesa" en el listado de opciones de Step 1, incluso cuando el cliente no posee un `activeTable` en sesión, siempre que `tablesEnabled` esté activo.
  - **Selector de Mesas Disponibles en Tiempo Real**: En el Step 2 ("Tus Datos"), si el cliente eligió "Pedido en Mesa" pero no tiene mesa asignada, se renderiza un selector desplegable con las mesas cuyo estado actual en Firestore es `'disponible'`.
  - **Validación del Campo de Mesa**: Se modificó `handleNextStep` para exigir la selección de una mesa válida en caso de optar por pedido en mesa sin sesión de mesa previa.
  - **Autounión de Mesa y Alerta al Mesero al Comprar**: En el submit final, al crearse exitosamente la orden con `tipoEntrega: 'mesa'`, el sistema:
    1. Vincula el pedido activo a la mesa elegida en Firestore y cambia su estado a `'ocupada'`.
    2. Registra un ticket de tipo `'cliente_sentado'` en la colección `tableRequests` para notificar al mesero mediante timbres visuales y sonoros.
    3. Registra síncronamente la mesa en Zustand y `sessionStorage` para iniciar la sesión de autoservicio del cliente.
* **Estatus:** ✅ Completado. Build verificado y exitoso (`cmd /c npm run build` ✓).

---

### [2026-06-02] - Nueva Funcionalidad: Confirmación Interactiva de QR de Mesa, Redirección POS Directa con Autounión y Flujo de Salida/Cobro

* **Tipo:** Nueva Funcionalidad / Simplificación Arquitectónica / POS Integration / UI/UX Premium / Interacción Táctil
* **Archivo(s) Modificado(s):**
  - [`src/pages/portal/PortalMesero.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalMesero.jsx) [MODIFY]
  - [`src/pages/portal/PortalVendedor.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalVendedor.jsx) [MODIFY]
  - [`src/components/client/table/TableMenuBar.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/table/TableMenuBar.jsx) [MODIFY]
  - [`src/App.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/App.jsx) [MODIFY]
* **Detalle:**
  - **Confirmación Interactiva de Seating QR:** Se inyectó un modal translúcido premium con glassmorphism en `App.jsx` que intercepta la lectura de QR de mesas. En lugar de forzar la ocupación, le presenta al cliente la opción de "Aceptar" (se vincula a la mesa, ocupa la mesa en Firestore y notifica al mesero como `'cliente_sentado'`) o "Rechazar" (limpia síncronamente el query param `tableId` de la URL sin refrescar y continúa navegando libremente como cliente normal), brindando total autonomía.
  - **Redirección Directa a POS Venta Directa:** Se eliminaron por completo las más de 200 líneas de código duplicado del catálogo local interno de meseros y selector de variantes modales en `PortalMesero.jsx`. Al pulsar "Cargar Productos" o "Abrir Mesa", el mesero es redirigido al POS central de venta directa (`PortalVendedor.jsx?tableId=ID`).
  - **Contextualización de Mesa en POS y Fusión de Comandas:** En el POS, al leer `tableId`, se preconfigura dinámicamente el cliente como `"Mesa X"`, bloqueando los inputs convencionales de celular/nombre para evitar errores. En el checkout, el botón cambia su etiqueta a `"Cargar a Mesa X"`. Si la mesa ya posee un pedido activo en Firestore, los nuevos productos del carrito se fusionan y suman a los ítems y totales de la comanda existente de forma transparente en lugar de duplicarse. Tras finalizar, el mesero retorna automáticamente a su portal.
  - **Botón de Salida con Visualización de Cuenta Automática:** Se agregó un botón de "Salir" en el `TableMenuBar` del cliente. Si no se ordenó nada, la mesa se desocupa en Firestore y se desvincula instantáneamente en el cliente. Si tiene un pedido activo en la mesa, al presionar "Salir", se desvincula del cliente y se le dibuja automáticamente el desglose totalizado de su consumo directamente en su tarjeta de despedida (Cuenta automática) para su validación inmediata.
  - **Evasión de Captura QR en Portales Operativos (Bypass):** Se configuró una cláusula en `App.jsx` para que si la URL de navegación actual coincide con rutas operativas (`/portal/*` o `/admin/*`), se ignore por completo la captura de `tableId` en query params. Esto previene que meseros o cajeros vean el modal interactivo de "Registrarse en la mesa" al usar el POS Directo con el parámetro `tableId`.
  - **Limpieza Inmediata del Banner 'Mesero en Camino':** Se ajustó la lógica en `TableMenuBar.jsx` para que si la solicitud atendida es del tipo `'cliente_sentado'`, no se aplique el banner de retardo artificial de 45 segundos de "Mesero en camino". El banner se disuelve inmediatamente una vez que el mesero pulsa "Atender" o abre la mesa, restituyendo instantáneamente la interactividad y los botones de acción para el cliente.
  - **Botón "Enviar Cuenta" y Visualización de Recibo en Cliente:** Se renombró el botón de "Pedir Cuenta" en el modal de la mesa del mesero a **"Enviar Cuenta"**. Al pulsarse, la mesa transiciona a `'solicitando_cuenta'` y el cliente visualiza en tiempo real su cuenta desglosada y el total en una tarjeta flotante de revisión sin tener que hacer solicitudes manuales.
  - **Reacomodación de Botones en Mesa Vacía:** Se reestructuró la cuadrícula de botones para mesas vacías (`estado === 'disponible'`). Los botones `"Abrir y Cargar Pedido"` y `"Abrir Mesa Vacía"` ahora se muestran en paralelo en una fila simétrica (`grid grid-cols-2 gap-2`), eliminando la asimetría de ancho y los espacios vacíos en pantalla.
* **Estatus:** ✅ Completado. Build verificado y exitoso (`cmd /c npm run build` ✓).

---

### [2026-06-02] - Nueva Funcionalidad: Sincronización en Tiempo Real de Liberación de Mesa y Tarjeta de Despedida en el Cliente

* **Tipo:** Nueva Funcionalidad / Sincronización en Tiempo Real / UI/UX Premium / Fidelización
* **Archivo(s) Modificado(s):**
  - [`src/components/client/table/TableMenuBar.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/table/TableMenuBar.jsx) [MODIFY]
* **Detalle:**
  - **Suscripción en Tiempo Real al Estado de la Mesa:** Se integró un listener reactivo en tiempo real (`onSnapshot`) sobre el documento de la mesa actual en Firestore (`/tables/{tableId}`) directamente desde la barra flotante del cliente.
  - **Detección de Mesa Liberada por el Mesero:** El cliente detecta instantáneamente el cambio de estado cuando el mesero presiona "Liberar Mesa" o "Confirmar Pago" desde su Portal (transicionando la mesa a `'disponible'`).
  - **Tarjeta de Despedida Premium y Agradecimiento:** Al liberarse la mesa, se anula de forma automática cualquier estado minimizado y se despliega una hermosa tarjeta de agradecimiento en fondo verde esmeralda con un corazón animado y el copy solicitado: `"¡Gracias por tu compra! ✨ Esperamos verte pronto de nuevo. ¡Que tengas un excelente día!"`.
  - **Desvinculación Segura y Limpia:** Se incorporó un botón de `"Aceptar"` en la tarjeta que al ser presionado, limpia síncronamente el estado en Zustand, remueve las variables del `sessionStorage` y borra de forma limpia el parámetro `tableId` de la URL sin recargar el navegador, cerrando la sesión de autoservicio QR con una experiencia de usuario de primer nivel.
* **Estatus:** ✅ Completado. Build verificado y exitoso (`cmd /c npm run build` ✓).

---

### [2026-06-02] - Implementación Completa: Enrutamiento Inteligente, Disponibilidad de Meseros, Carga de Productos y Minimizado de Autoservicio

* **Tipo:** Nueva Funcionalidad / Optimización Operativa / Ecosistema / UI/UX Premium
* **Archivo(s) Modificado(s):**
  - [`src/components/client/table/TableMenuBar.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/table/TableMenuBar.jsx) [MODIFY]
  - [`src/pages/portal/PortalMesero.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalMesero.jsx) [MODIFY]
  - [`src/services/tableService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/tableService.js) [MODIFY]
  - [`src/services/orderService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/orderService.js) [MODIFY]
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [MODIFY]
* **Detalle:**
  - **Minimizado Persistente y Limpieza de UI en Cliente:** Se removió el botón destructivo de "Salir" y se implementó un control de "Minimizar" en `TableMenuBar.jsx`. Al minimizarse, persiste en `sessionStorage` y se colapsa a un elegante botón flotante tipo píldora (`🍽️ Mesa X`) que flota discretamente en la esquina de la pantalla sin obstruir las vistas de compra o botones del carrito del cliente, expandible con un solo toque.
  - **Validación de Pedido Activo al Solicitar Cuenta:** Se inyectó una verificación síncrona en la solicitud de cuenta. Si la mesa en Firestore no tiene un `pedidoActivoId` (comanda abierta o artículos ya ordenados), se bloquea la solicitud y se muestra un banner de advertencia elegante de auto-descarte, instruyendo al cliente a pedir productos primero.
  - **Disponibilidad de Meseros e Interruptor de Estado:** Se diseñó un interruptor de disponibilidad en el encabezado de `PortalMesero.jsx` (glowing switch "Disponible" / "Ocupado") que se sincroniza y persiste en la colección `employees` de Firestore. Se modificó `requestService` para enrutar llamados y asignarlos automáticamente al primer mesero activo y disponible.
  - **Mensaje de Espera Amigable por Meseros Ocupados:** Si todos los meseros se marcan como "Ocupados", la solicitud entra en la "Cola de Espera" del salón y se le visualiza inmediatamente al cliente en su menú flotante un banner amigable: `"🚶‍♂️ Danos un momento por favor, todos nuestros meseros están atendiendo a nuestros clientes. Te atenderemos lo antes posible."` en tiempo real.
  - **Catálogo Integrado para Meseros y Carga Directa a Mesa:** Se implementó una interfaz de consulta y carga de productos en `PortalMesero.jsx`. Al presionar una mesa ocupada, el mesero puede visualizar la comanda en tiempo real con su totalizador y presionar "Cargar Productos" para desplegar un catálogo interactivo con buscador y selectores de variantes, agregando ítems directamente a la orden de la mesa en Firestore.
  - **Sincronización en Notificaciones del Administrador:** Se corrigió la generación de la Notificación Central al administrador para que cuando se realice una orden de autoservicio para salón, se categorice como `"en Mesa (Mesa X)"` en lugar de `"Normal"`.
* **Estatus:** ✅ Completado. Build verificado y exitoso (`cmd /c npm run build` ✓).

---

### [2026-06-02] - Corrección de Flujo: Sincronización de Llamados y Mensaje de Mesero en Camino en la Mesa

* **Tipo:** Corrección de Bug de Lógica / Sincronización en Tiempo Real / UI/UX Premium
* **Archivo(s) Modificado(s):**
  - [`src/components/client/table/TableMenuBar.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/table/TableMenuBar.jsx) [MODIFY]
* **Detalle:**
  - **Escucha en Tiempo Real de tableRequests:** Se integró una suscripción reactiva en `TableMenuBar.jsx` que escucha la colección `tableRequests` en Firestore filtrando por la mesa del cliente y ordenando en memoria para evitar la creación de índices compuestos complejos.
  - **Banner de Estado Interactivo y Premium:** Si el cliente tiene una solicitud activa (`llamado`, `cuenta` o `cliente_sentado`) con estado `'pendiente'`, la barra flotante oculta los botones de acción y despliega un banner informativo elegante y animado con colores pastel adaptados a cada tipo de solicitud y loaders discretos.
  - **Mensaje de Mesero en Camino al Atender:** Cuando el mesero presiona "Atender" desde su Portal (transicionando la solicitud a `'atendido'`), el cliente ve de inmediato un mensaje amigable: `"🚶‍♂️ ¡Un mesero ya se dirige a tu mesa! Danos un momento, por favor."` en fondo esmeralda durante un período de cortesía de 45 segundos, eliminando la confusión visual.
* **Estatus:** ✅ Completado. Build verificado y exitoso (`cmd /c npm run build` ✓).

---

### [2026-06-02] - Corrección de Flujo: Ocupación Automática y Alerta de Cliente Sentado por QR

* **Tipo:** Corrección de Bug / Integridad / Experiencia del Mesero
* **Archivo(s) Modificado(s):**
  - [`src/App.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/App.jsx) [MODIFY]
* **Detalle:**
  - **Captura y Transición Automática de Estado de Mesa:** Se configuró un disparador automático en el hook de captura de QR de la mesa (`App.jsx`). Cuando un cliente escanea el QR (`?tableId=ID`), la mesa transiciona de forma inmediata y atómica en Firestore a `'ocupada'` si su estado anterior era `'disponible'`.
  - **Generación de Alerta de Cliente Sentado:** Se implementó la creación en tiempo real de una alerta con `type: 'cliente_sentado'` en la colección `tableRequests` al momento del escaneo del QR. Esto garantiza que el mesero reciba una notificación visual ("👥 Cliente en Mesa") y sonora en su Portal de inmediato.
  - **Prevención de Alertas Duplicadas:** Se incorporó validación basada en `sessionStorage` para registrar la clave `notified_occupation_{tableId}`. Esto evita la generación de múltiples alertas redundantes al mesero en caso de que el cliente recargue o refresque la página del navegador durante su estancia.
* **Estatus:** ✅ Completado. Build verificado y exitoso (`cmd /c npm run build` ✓).

---

### [2026-06-02] - Implementación Completa: Pedidos Dinámicos en Mesa y Autoservicio QR

* **Tipo:** Nueva Característica / Arquitectura / Ecosistema / Flujo de Compra
* **Archivo(s) Modificado(s):**
  - [`src/store/appConfigStore.js`](file:///d:/Aplicaciones/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
  - [`src/services/appConfigService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/appConfigService.js) [MODIFY]
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`src/App.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/App.jsx) [MODIFY]
  - [`src/components/client/table/TableMenuBar.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/table/TableMenuBar.jsx) [NEW]
  - [`src/layouts/ClientLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
  - [`src/services/tableService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/tableService.js) [MODIFY]
  - [`src/pages/portal/PortalMesero.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalMesero.jsx) [MODIFY]
  - [`src/pages/portal/PortalCocina.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalCocina.jsx) [MODIFY]
* **Detalle:**
  - **Feature Flag y Desactivación Absoluta:** Integración del control `tablesEnabled` y `activeTable` en Zustand y Firestore, aislando y ocultando por completo todas las referencias a mesas, botones de salón, parámetros URL y CRUDs de la aplicación si el módulo está inactivo.
  - **Generador de QR Stickers en Admin:** Adición de un botón de `QrCode` en cada fila de mesas del CRUD, abriendo el modal `TableQRModal` para generar enlaces `${window.location.origin}/?tableId=${table.id}` en un canvas, descargables en PNG e imprimibles directamente en formato sticker.
  - **Lobby y Barra Flotante de Autoservicio:** Listener reactivo en `App.jsx` que valida el `tableId` de la URL en caliente con la base de datos y lo vincula a la sesión. Creación del componente `TableMenuBar` que flota sobre toda la interfaz de compra ofreciendo atajos interactivos para llamar al mesero y pedir la cuenta de forma digital en tiempo real.
  - **Checkout Wizard Acoplado:** Modificación del wizard de compra en `CheckoutModal.jsx` para que al estar en mesa, autoseleccione el tipo `'mesa'`, oculte todas las entradas de dirección, barrio, ciudad y coordenadas GPS Leaflet, y fuerce el recargo por envío a `$0` atómicamente. Mapea `tableId` y `tableName` en la orden de Firestore e incluye detalles del salón en la plantilla WhatsApp de confirmación.
  - **Notificaciones Sonora y Táctil Operativas:** Creación de la colección `tableRequests` y la función `requestService`. Vinculación en tiempo real en `PortalMesero.jsx` de alertas de atención activas con reproducción de timbre sonoro y banner superior interactivo de resolución rápida. Adición de badges destacables en `PortalCocina.jsx` (ej: `🛎️ Mesa 3`) para las comandas en alistamiento.
* **Estatus:** ✅ Completado. Build verificado y exitoso (`npm run build` ✓ 807ms).

---

### [2026-06-02] - Corrección de Sintaxis JSX y Ternario en Ajustes de Personalización de Tienda

* **Tipo:** Bug Fix / Compilación / Estabilidad UI
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Detalle:**
  - Se identificó y resolvió una excepción de análisis de sintaxis JSX (`[PARSE_ERROR] Expected corresponding JSX closing tag for 'div'` y `Expected ',' or ')' but found '}'`) al cargar e importar de manera dinámica el módulo `AdminSettings.jsx`.
  - La excepción ocurría por la omisión del cierre de paréntesis en la rama final del operador ternario dinámico (`activeSubSection === null ? ... : ...`) correspondiente a la sección de "Personalizar Tienda" (Nivel 1).
  - Se completó la envoltura estructural del bloque, asegurando que la aplicación recompile fluidamente y la interfaz cargue limpiamente con cero errores.
* **Estatus:** ✅ Completado. Build verificado y exitoso (`npm run build` ✓).

---

### [2026-06-02] - Corrección Definitiva de FOUC Cromático: Sincronización Inmediata en HTML Head y AdminSettings Fallback

* **Tipo:** Optimización de Rendimiento / UI/UX / Ciclo de Vida
* **Archivo(s) Modificado(s):**
  - [`index.html`](file:///d:/Aplicaciones/App%20Ventas/index.html) [MODIFY]
  - [`src/App.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/App.jsx) [MODIFY]
  - [`src/store/appConfigStore.js`](file:///d:/Aplicaciones/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
  - [`src/index.css`](file:///d:/Aplicaciones/App%20Ventas/src/index.css) [MODIFY]
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Detalle:**
  - **Causa Raíz Principal Detectada**: Se descubrió que el parpadeo de color rosa intermedio al recargar ocurría específicamente en la pantalla de **Administrador (Personalizar Tienda)**. Esto se debía a que el estado local `formData` del componente `AdminSettings.jsx` se inicializaba con un fallback estático y cableado de `theme: 'rosa-elegante'`. Como la suscripción en tiempo real de Firestore tarda milisegundos en resolverse al cargar, la pantalla se renderizaba inicialmente con `theme: 'rosa-elegante'`. El efecto `useEffect` de previsualización en tiempo real inyectaba de inmediato la paleta rosa en `document.documentElement`, anulando la hidratación previa del store.
  - **`src/pages/admin/AdminSettings.jsx`**: Se refactorizó la inicialización del estado local de React `formData` usando un **inicializador de estado perezoso (lazy state initializer)** que consulta síncronamente el estado hidratado actual del store: `useAppConfigStore.getState()`. Esto asegura que el estado local del formulario de ajustes herede el tema real de la base de datos (por ejemplo, `'verde-oliva'`) desde el primer renderizado síncrono, anulando cualquier fallback a `'rosa-elegante'` y erradicando el flash de color rosa.
  - **`index.html`**: Se inyectó un **script síncrono bloqueante ultrarrápido** en la cabecera (`<head>`). Este script extrae inmediatamente la configuración de tema, modo oscuro, colores de fondo base y **eventos de temporada activos** desde `localStorage` (`app-config-storage`). Aplica de forma 100% síncrona el atributo `data-theme`, la clase `.dark` y el color de fondo exacto (`backgroundColor` y variable CSS `--color-bg`) sobre `document.documentElement` **antes de pintar la primera trama** de la pantalla, soportando tanto IDs de temas estáticos, **objetos de temas personalizados** de base de datos como **paletas dinámicas de eventos por temporada** (`navidad`, `halloween`, etc.).
  - **`src/App.jsx`**: Se configuró la sincronización bidireccional en el hook `ThemeApplier`, inyectando síncronamente `root.setAttribute('data-theme', theme.id || theme)` en cascada con el resto de configuraciones dinámicas.
  - **Impacto**: El parpadeo cromático intermedio ha quedado **definitivamente eliminado al 100%**, logrando una carga instantánea y pura sin FOUC cromático desde el primer fotograma del navegador sin importar el tema activo, el evento estacional activo o si se está inicializando el panel de administrador.
* **Estatus:** ✅ Completado. Build exitoso (`✓ built in 1.41s`).

---

### [2026-06-02] - Rediseño Premium de la Lista de Campañas en Publicidad y Promociones

* **Tipo:** Mejora de UI/UX / Consistencia Estética
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Detalle:**
  - Se removió por completo la clase `divide-y divide-app` y el contenedor unificado del listado, eliminando la línea negra divisoria que resultaba tosca y desalineada visualmente.
  - Cada campaña publicitaria/promoción ahora se renderiza dentro de su **propia tarjeta flotante individual e independiente** (`bg-surface rounded-3xl shadow-sm hover:shadow-md p-5 flex`), separadas limpiamente por un margen vertical (`space-y-4`), logrando una estética sumamente premium y moderna.
  - Se ampliaron las miniaturas a un tamaño de `w-14 h-14` con sombras suavizadas e interactividad táctil para destacar los banners de promoción.
  - Se implementaron badges de tipo y estado con bordes de color al 10% de opacidad y textos en negrita.
  - Se incorporó un indicador de vigencia con microicono de calendario (`Calendar`).
  - Se rediseñaron los botones de acción ("Activar/Desactivar") y los controles circulares redondeados para editar (`Paintbrush` con fondo de tono ámbar pastel) y eliminar (`Trash2` con fondo de tono rojo pastel) que cambian a color plano al hacer hover.
* **Estatus:** ✅ Completado. Build exitoso (`✓ built in 1.50s`).

---

### [2026-06-02] - Corrección de Flujo: Ocultado Dinámico de Garantías y Reclamos en Pedidos del Admin

* **Tipo:** Corrección de Bug de Lógica / Feature Flags / Consistencia
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]
* **Detalle:**
  - Se identificó que el botón de acceso rápido a "Garantías y Reclamos" en la cabecera del panel de pedidos (`AdminOrders.jsx`) permanecía visible permanentemente a pesar de que el módulo estuviese inactivo en la configuración global.
  - Se importó el feature flag `claimsEnabled` de `useAppConfigStore()` dentro del componente.
  - Se envolvió el botón de Garantías y Reclamos en una expresión condicional lógica (`{claimsEnabled && ...}`), ocultándolo por completo cuando la configuración de garantías y reclamos se encuentre deshabilitada en Personalizar Tienda.
* **Estatus:** ✅ Completado. Build exitoso (`✓ built in 1.42s`).

---

### [2026-06-02] - Rediseño Premium de Selector de Subcategorías en Personalizar Tienda

* **Tipo:** Mejora de UI/UX / Consistencia Estética
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Detalle:**
  - Se eliminaron por completo las tarjetas de subcategorías con cuadrícula verde sobredimensionada que resultaban toscas y desalineadas visualmente en pantallas de administración.
  - Se eliminaron por completo las clases `border border-app` y `divide-y divide-app` del contenedor de subcategorías, removiendo los bordes externos negros y las líneas divisorias oscuras que no formaban parte del diseño original.
  - Ahora la lista se dibuja directamente sobre la tarjeta contenedora utilizando solo el sombreado suave de elevación (`shadow-sm`) y las esquinas suavizadas (`rounded-3xl`), garantizando consistencia total de píxeles y simetría al 100% con la estética minimalista del menú de ajustes principal.
  - Cada categoría (Gestión de Personal, Métodos de Entrega, Ventas al por Mayor, Eventos por Temporada, Garantías y Reclamos, Seguimiento de Pedidos, Módulos Activos y Configuración de Mesas) ahora cuenta con su respectivo icono en formato pastel (fondo al 10% de opacidad del color del módulo), títulos limpios en negrita, descripciones cortas de una línea y guías de dirección por ChevronRight.
* **Estatus:** ✅ Completado. Build exitoso (`✓ built in 1.41s`).

---

### [2026-06-02] - Revert: Auth Anónima para Clientes + Reglas Firestore

* **Tipo:** Reversión de Cambios
* **Archivo(s) Modificado(s):**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [REVERT] — Desplegado a producción
  - [`src/pages/LoginPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/LoginPage.jsx) [REVERT]
* **Detalle:** Se revirtieron los cambios de autenticación anónima y los ajustes de reglas de Firestore asociados al UID anónimo, regresando la lógica al flujo de celular + nombre directo sin Firebase Auth en el lado del cliente, según lo solicitado.

---

### [2026-06-02] - Fix Crítico (Obsoleto/Revertido): Auth Anónima para Clientes + Reglas Firestore

* **Tipo:** Corrección de Bug Crítico / Seguridad / Arquitectura
* **Archivo(s) Modificado(s):**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [MODIFY] — Desplegado a producción
  - [`src/pages/LoginPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
* **Error:**
  - `Missing or insufficient permissions` en `favoritesStore.js` al suscribirse a `users/{userId}/favorites`.
* **Causa Raíz:**
  - El cliente se autenticaba solo con celular + nombre, sin sesión de Firebase Auth (`request.auth == null`). Las reglas de Firestore bloqueaban todo acceso a `users/{userId}` porque requerían `request.auth.uid == userId`, pero el userId era el número de celular, no un UID de Firebase Auth.
* **Solución Técnica:**
  - **`firestore.rules`:** Se reemplazó la condición `auth.uid == userId` por `resource.data.uid == request.auth.uid`. El acceso a `favorites` usa `get()` para leer el campo `uid` del doc padre. Se agregó `allow create: if request.auth != null` para el primer login.
  - **`LoginPage.jsx`:** Se agrega `signInAnonymously(auth)` en ambas ramas del flujo cliente (existente y nuevo). En clientes existentes sin campo `uid`, se migra con `updateDoc`. En clientes nuevos, el `uid` anónimo se persiste en el `setDoc` inicial.
* **Impacto:** Los favoritos, el perfil del cliente y sus subcolecciones ahora funcionan correctamente bajo las reglas de Firestore en producción.
* **Estatus:** ✅ Completado, reglas desplegadas y compiladas en Firebase.

---

### [2026-06-02] - Refactorización de Arquitectura: Capa de Servicios (8 archivos)

* **Tipo:** Refactorización Técnica / Arquitectura / Deuda Técnica
* **Archivos Creados:**
  - [`src/services/favoritesService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/favoritesService.js) [NEW]
  - [`src/services/notificationService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/notificationService.js) [NEW]
  - [`src/services/authService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/authService.js) [NEW]
* **Funciones Añadidas a Servicios Existentes:**
  - `orderService.js` → `updateOrderDeliveryCost`, `subscribeToOrderByToken`
  - `wholesaleService.js` → `createWholesaleOrder`
  - `claimsService.js` → `createClaim`
  - `userService.js` → `updateClientProfile`
  - `appConfigService.js` → `resetAppData`
* **Componentes/Páginas Limpiados (eliminados imports directos de Firebase):**
  - `AdminOrders.jsx`, `AdminSettings.jsx`, `WholesaleRequestModal.jsx`, `ClaimRequestModal.jsx`, `ClientProfile.jsx`, `OrderTracking.jsx`, `AdminNotificationAnalytics.jsx`, `favoritesStore.js`
* **Causa Raíz:** 8 archivos violaban la regla de arquitectura: ningún componente o página puede llamar directamente a Firebase.
* **Estatus:** ✅ Completado. Build exitoso (`✓ built in 1.03s`).

---

### [2026-06-02] - Optimización de Rendimiento y Accesibilidad WCAG (index.html & ProductCard.jsx)


* **Tipo:** Refactorización Técnica / Accesibilidad / SEO / Optimización de Carga
* **Archivo(s) Modificado(s):**
  - [`index.html`](file:///d:/Aplicaciones/App%20Ventas/index.html) [MODIFY]
  - [`src/components/client/catalog/ProductCard.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
* **Causa Raíz:**
  - El viewport forzaba `user-scalable=no`, impidiendo que usuarios con dificultades visuales realizaran zoom nativo en la aplicación. Además, las imágenes del catálogo carecían de carga diferida (lazy loading), impactando la velocidad de carga, y el contraste cromático de los precios tachados y badges verdes en el catálogo no cumplía con el estándar WCAG AA (ratio mínimo 4.5:1).
* **Solución Técnica:**
  - **index.html:** Se actualizó la etiqueta meta `viewport` a `width=device-width, initial-scale=1.0, maximum-scale=5.0`, habilitando de forma segura el zoom del usuario hasta en un 500% sin alterar el layout responsivo.
  - **ProductCard.jsx:**
    * Inyectado atributo `loading="lazy"` a la etiqueta `<img>` principal de cada tarjeta de producto para posponer la descarga de imágenes fuera de pantalla.
    * Asegurado el atributo `alt={product.nombre}` en la imagen de producto y agregado `aria-label` descriptivos a los botones interactivos sin texto ("Favorito" y "Ver Opciones").
    * Corregido el precio antiguo a una clase de mayor contraste `text-gray-600` (antes `text-gray-400`).
    * Refactorizado el badge de descuento a `bg-green-600/10 text-green-700` (antes `text-green-600`), aumentando el contraste cromático a niveles conformes a WCAG AA.
* **Estatus:** ✅ Completado, compilado con éxito y verificado.

### [2026-06-02] - Nueva Funcionalidad: Rediseño Premium de Cupones (Ticket Rasgable) e Integración Interactiva en el Checkout

* **Tipo:** Nueva Funcionalidad / UI-UX Premium / Optimización del Checkout / Incremento de Conversión
* **Archivo(s) Modificado(s):**
  - [`src/components/client/coupons/ClientCouponsModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/coupons/ClientCouponsModal.jsx) [MODIFY]
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
* **Causa Raíz:**
  - Los cupones se mostraban como tarjetas planas ordinarias sin identidad visual de cupón físico/rasgable. Además, el cliente no podía aplicar cupones de forma interactiva durante el flujo de pago, reduciendo la fricción del usuario al finalizar su compra.
* **Solución Técnica:**
  - **Rediseño del Cupón:** Se refactorizó la tarjeta en `ClientCouponsModal.jsx` incorporando círculos calados laterales (`absolute top-1/2 rounded-full border bg-surface`), un borde superior con troquelado de puntos radiales, y una línea dashed divisoria de ticket físico.
  - **Botón "Aplicar en Próxima Compra":** Se inyectó un botón primario de acción directa que copia síncronamente el código en el portapapeles y alerta amigablemente del éxito de copia al cerrar el modal.
  - **Módulo de Cupones en Checkout:** Se acopló una sección interactiva de cupones en el paso de pago del `CheckoutModal.jsx` que permite introducir códigos manualmente con validación instantánea de vigencia, mínimos de compra, y compatibilidad de métodos de pago.
  - **Selector de Cupones Disponibles:** Se inyectó un selector colapsable que lista los cupones elegibles en base al carrito del cliente para que con un solo clic se aplique el descuento en vivo, recalculando y visualizando el ahorro de forma inmediata en el desglose de subtotales.
* **Estatus:** ✅ Completado, compilado con éxito y verificado.

### [2026-06-02] - Corrección de UI/UX: Remover línea divisoria superior del botón de descargar factura en ClientOrders.jsx

* **Tipo:** Corrección de UI/UX / Diseño Visual / Remoción de Borde Redundante
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientOrders.jsx) [MODIFY]
* **Causa Raíz:**
  - El botón "Descargar Factura" en las tarjetas de pedidos completados del cliente presentaba una línea divisoria superior redundante debido a la clase `border-t border-app` en su contenedor padre, rompiendo la estética limpia e integrada de las tarjetas.
* **Solución Técnica:**
  - Se removió la clase `border-t border-app` del contenedor de botones de acción siempre visibles en `ClientOrders.jsx`, logrando que el botón se integre limpiamente con el resto de la tarjeta del pedido.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-02] - Nueva Funcionalidad: Paginación Estandarizada del Catálogo de Clientes

* **Tipo:** Nueva Funcionalidad / Optimización UI-UX / Paginación / Componente Reutilizable
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientCatalog.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
* **Causa Raíz:**
  - El catálogo de clientes renderizaba la grilla o lista de productos de forma ilimitada, lo cual degradaba el rendimiento en dispositivos móviles ante catálogos extensos y provocaba una experiencia de scroll fatigosa.
* **Solución Técnica:**
  - Se importó y acopló el componente de paginación modular unificado `<Pagination />` en `ClientCatalog.jsx`.
  - Se segmentó el renderizado final de la grilla de productos mediante `.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)` limitando los listados a un máximo de 10 elementos por página.
  - Se añadió la lógica para restaurar síncronamente `currentPage` a 1 cada vez que se detectan cambios de categorías, filtros avanzados o búsquedas activas por texto.
* **Estatus:** ✅ Completado, compilado con éxito y verificado.

### [2026-06-02] - Corrección de Importación (ReferenceError: where is not defined) en tableService.js

* **Tipo:** Bug Fix / Estabilidad de Producción / Firebase Firestore
* **Archivo(s) Modificado(s):**
  - [`src/services/tableService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/tableService.js) [MODIFY]
* **Causa Raíz:**
  - El método `subscribeToTableRequests` en `tableService.js` utilizaba la función `where` de Firestore para filtrar solicitudes pendientes, pero la palabra clave `where` no estaba declarada ni importada de `'firebase/firestore'` en el archivo, provocando un ReferenceError que rompía el renderizado de `<PortalMesero>`.
* **Solución Técnica:**
  - Se importó formalmente `where` en los módulos nombrados de `'firebase/firestore'` al inicio del archivo.
* **Estatus:** ✅ Completado, compilado con éxito y verificado.

### [2026-06-02] - Corrección de Interactividad de Clic en el Banner de Promociones

* **Tipo:** Bug Fix / Interactividad UX
* **Archivo(s) Modificado(s):**
  - [`src/components/client/catalog/CatalogBanner.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/CatalogBanner.jsx) [MODIFY]
* **Causa Raíz:**
  - El manejador de clics del banner promocional utilizaba `e.preventDefault()`, lo cual puede cancelar la propagación de eventos táctiles sintéticos en dispositivos móviles y envolturas PWA. Además, si el anuncio de tipo `inventory` no encontraba su `linkedProduct` debido a diferencias menores de carga asíncrona, el click fallaba silenciosamente y no ejecutaba ninguna acción.
* **Solución Técnica:**
  - Se eliminó `e.preventDefault()` de `handleBannerClick` y se sustituyó por `e.stopPropagation()` para detener de forma segura la propagación a manejadores externos sin anular la ejecución del evento de clic principal.
  - Se introdujo un fallback robusto para anuncios de tipo `inventory`: si `linkedProduct` no se encuentra cargado localmente, en lugar de no hacer nada, la acción del anuncio se redirige inmediatamente a la apertura del modal promocional (`type: 'modal'`), garantizando que la interacción del usuario siempre tenga una respuesta visual fluida.
* **Estatus:** ✅ Completado, compilado con éxito y listo.

### [2026-06-02] - Rediseño Premium y Animado del Botón Central de la Barra de Navegación Móvil

* **Tipo:** UX / UI Premium / Animación y Microinteracciones / Optimización Mobile
* **Archivo(s) Modificado(s):**
  - [`src/layouts/ClientLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
  - [`src/index.css`](file:///d:/Aplicaciones/App%20Ventas/src/index.css) [MODIFY]
* **Causa Raíz:**
  - El botón central original de Ofertas/Cupones requería un rediseño de impacto con microinteracciones avanzadas de balanceo, pulsación y reflejos de brillo diagonal constantes para aumentar la tracción y conversión de clientes en dispositivos móviles.
* **Solución Técnica:**
  - **Botón Principal:** Se redimensionó a `w-16 h-16` (64x64px), se configuró con `overflow-visible` absoluto (para evitar cortes en el badge), se removió el texto inferior y se inyectó una traslación vertical `translate-y-1` para integrarlo armoniosamente a la barra inferior.
  - **Icono:** Se incrementó el tamaño del icono a `28px` y se le acopló una animación infinita de balanceo suave (`animate-wiggle-infinite` con balanceo alternado de 10º cada 2 segundos).
  - **Contador (Badge):** Se duplicó su tamaño a `w-7 h-7` y el tamaño de la fuente a `14px` con peso extra negro (`font-black`), posicionándolo exactamente superpuesto en `top-[-6px]` y `right-[-6px]`.
  - **Efectos y Atracción:** Se inyectaron animaciones CSS fluidas de pulso infinito de escala (`animate-pulse-soft` / Framer Motion escala 1.04) y un efecto shimmer metálico diagonal que barre el botón horizontalmente cada 4 segundos (`animate-shimmer-infinite`).
* **Estatus:** ✅ Completado, compilado con éxito y desplegado en vivo a Firebase Hosting.

### [2026-06-02] - Simplificación Visual y Unificación de Módulos en Optimización Comercial

* **Tipo:** UX / UI Premium / Refactorización visual / Estructura Limpia
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Descripción:**
  - Se eliminó la doble tarjeta contenedora y el acordeón expandible externo ("Capa de Optimización Comercial") que agrupaba de forma redundante las opciones de optimización comercial.
  - Se unificó la UI renderizando los 4 módulos de conversión directamente como una única lista plana (`divide-y divide-app`) dentro de una tarjeta con bordes curvos suavizados premium (`bg-surface rounded-3xl border border-app overflow-hidden`).
  - Se eliminó y saneó un bloque de código JSX duplicado y roto que quedaba al final de la subsección como remanente de fusiones anteriores, solucionando preventivamente errores de renderizado.
* **Resultado:** Interfaz 100% limpia, responsive, intuitiva y alineada visualmente a un estándar premium de configuración (estilo iOS/Android).
* **Build:** ✓ Sin errores.

---

### [2026-06-02] - Simplificación y Condicionamiento de Campos Avanzados en ProductFormModal

* **Tipo:** Feature / UX / Refactorización de Visibilidad Condicional
* **Archivo(s) Modificado(s):**
  - [`src/components/admin/inventory/ProductFormModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]
* **Descripción:**
  - Se extraen `commercialOptimization` y `claimsEnabled` del `useAppConfigStore()` en el componente.
  - Se calculan banderas reactivas: `optEnabled`, `advancedGalleryEnabled`, `visualVariationsEnabled`, `recommendationsEnabled`, `seoEnabled`, `showAdvancedSection`.
  - **Campos de variante** (Nombre, Precio Propio, SKU, URL Foto): ahora solo aparecen si `visualVariationsEnabled === true`. Stock siempre visible.
  - **Acordeón "Configuración Avanzada de Producto"**: oculto por completo si ningún módulo está activo (`showAdvancedSection === false`).
  - Dentro del acordeón: Galería e imágenes secundarias condicionadas a `advancedGalleryEnabled`; Descripción larga, Beneficios y SEO condicionados a `seoEnabled`; Garantía condicionada a `claimsEnabled`; Relacionados/Complementarios condicionados a `recommendationsEnabled`.
* **Resultado:** Formulario limpio y simple cuando la optimización comercial está apagada. Solo aparece complejidad si el admin activa los módulos que la requieren.
* **Build:** ✓ Sin errores.

---

### [2026-06-02] - Corrección Crítica de Sincronización y Race Condition en Carga de Configuración Comercial (Opción 6)

* **Tipo:** Bug Fix Crítico / Estabilidad del Store / Control de Flujo Asíncrono
* **Archivo(s) Modificado(s):**
  - [`src/store/appConfigStore.js`](file:///d:/Aplicaciones/App%20Ventas/src/store/appConfigStore.js) [MODIFY]
  - [`src/hooks/useAppConfigSync.js`](file:///d:/Aplicaciones/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
* **Causa Raíz:**
  - Al desactivar la **Opción 6 (Sugerencias basadas en el historial del cliente / historyRecommendations)** y guardar, el switch volvía a activarse solo en la UI.
  - Esto ocurría por una condición de carrera (race condition) extremadamente sutil en `useAppConfigSync.js`. Al montar la app o actualizar, el listener de filtros del catálogo (`subscribeToCatalogFilters`) resolvía antes que el de configuración general (`subscribeToAppConfig`) y llamaba a `setConfig({ catalogFilters: filters })`.
  - El método genérico `setConfig` realizaba un shallow merge y forzaba `isLoaded: true`. En `AdminSettings.jsx`, esto causaba que el formulario se inicializara usando los datos de `commercialOptimization` del estado por defecto/LocalStorage (donde la Opción 6 era `true` o `undefined` resolviéndose a `true`), bloqueando la posterior actualización de la configuración real cuando `subscribeToAppConfig` finalmente retornaba los datos reales de la base de datos (con la Opción 6 en `false`).
  - Al guardar la configuración general, el formulario enviaba el valor erróneo de la Opción 6 (`true`) re-escribiendo la base de datos de manera involuntaria.
* **Solución Técnica:**
  - Se creó una nueva acción específica `setCatalogFilters` en `appConfigStore.js` que actualiza exclusivamente el estado de los filtros sin activar la bandera global de carga `isLoaded`.
  - Se modificó `useAppConfigSync.js` para que la suscripción a los filtros de catálogo llame a `setCatalogFilters(filters)` de forma aislada.
  - Esto garantiza que `isLoaded: true` se active exclusivamente cuando los ajustes generales de la tienda (incluyendo la capa comercial real) hayan sido completamente cargados de Firestore, logrando una inicialización perfecta y libre de race conditions.
* **Estatus:** ✅ Completado, compilado con éxito y listo para despliegue.

### [2026-06-02] - Eliminación Completa de Módulos Comerciales Excedentes (Financiamiento, Banners Premium y Sellos de Confianza)

* **Tipo:** Depuración de Alcance / Limpieza de Código / Simplificación de UX
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`src/components/client/catalog/ProductDetailModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]
  - [`src/pages/client/ProductPublicDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
* **Causa Raíz:**
  - El usuario indicó expresamente que no le interesaba mantener las funciones comerciales relativas a: (7) Cuotas sin interés dinámicas, (8) Banner de beneficios premium de gradiente violeta para suscripción/cuotas extras, ni (9) Sellos visuales de confianza (Envío Full / Devolución 30 días gratis), por ser excedentes innecesarios para el modelo operativo actual de la aplicación.
* **Solución Técnica:**
  - Se removió por completo la sección visual que configuraba y contenía las **Herramientas 7, 8 y 9** del acordeón de optimización comercial en `AdminSettings.jsx`.
  - Se eliminaron las claves de inicialización correspondientes (`installments`, `premiumBanner`, `trustBadges`) del inicializador de estados del formulario `buildFormData`.
  - Se eliminaron del renderizado de `ProductDetailModal.jsx` y `ProductPublicDetail.jsx` todos los bloques JSX correspondientes a cuotas dinámicas, banner de beneficios premium y sellos de envío/devolución gratis para el cliente.
  - El flujo del catálogo y la lógica de variantes del cliente continúan operando limpiamente a través de precios base y promocionales unificados de la tienda.
* **Estatus:** ✅ Completado, compilado con éxito y desplegado a producción en Firebase Hosting.

### [2026-06-02] - Corrección de Lógica: Control Estricto de Etiquetas Inteligentes según Configuración de Habilitación en el Cliente

* **Tipo:** Bug Fix / Consistencia de Lógica Comercial / Optimización UI
* **Archivo(s) Modificado(s):**
  - [`src/components/client/catalog/ProductDetailModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]
  - [`src/pages/client/ProductPublicDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
* **Causa Raíz:**
  - Las etiquetas inteligentes en el detalle del producto (modal detallado y ficha pública) se seguían mostrando en la interfaz (como "Nuevo" o "+N vendidos") a pesar de que el administrador había desactivado por completo el módulo general "1. Etiquetas Inteligentes de Conversión" (marcando `tools.smartTags.enabled = false`).
  - Esto ocurría porque las variables `newProductTagEnabled` y `bestSellerTagEnabled` en el cliente validaban únicamente los switches de etiquetas individuales de forma directa, omitiendo la verificación de la variable de habilitación general `tools.smartTags.enabled`.
* **Solución Técnica:**
  - Se condicionó el cálculo de `newProductTagEnabled` y `bestSellerTagEnabled` en `ProductDetailModal.jsx` y `ProductPublicDetail.jsx` para que verifiquen de forma estricta el estado unificado de `smartTagsEnabled` (`optEnabled && tools.smartTags.enabled !== false`).
  - Esto garantiza que si la opción general de etiquetas inteligentes está desactivada en la base de datos (o si todas las individuales están apagadas), ninguna etiqueta se dibuje en las fichas del catálogo o en los modales detallados de la tienda, logrando una perfecta consistencia.
* **Estatus:** ✅ Completado, compilado con éxito y verificado.

### [2026-06-02] - Rediseño Premium de Capa de Optimización Comercial y Solución a Bug de Guardado Masivo

* **Tipo:** Refactorización de UI/UX / Corrección de Bug Crítico / Robustez de Persistencia
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Causa Raíz:**
  - El switch general de la "Capa de Optimización Comercial" en el encabezado resultaba redundante y confuso para los usuarios.
  - Al presionar el botón "Guardar Configuración Comercial", todas las opciones individuales (de la 1 a la 9) se activaban al mismo tiempo en la base de datos debido a que los campos no definidos en Firestore se cargaban como `undefined` en `formData` y eran interpretados como activos (`true`) por defecto con el operador `?? true` o `|| true`.
* **Solución Técnica:**
  - Se eliminó el switch general de habilitación en el encabezado. La tarjeta se transformó en un panel colapsable y expandible premium de tipo **acordeón**, cliqueable en toda su extensión con una flecha `ChevronDown` animada que rota dinámicamente (`rotate-180`) al cambiar el estado local `isCommercialSectionExpanded`.
  - Se implementó un mapeador de merge profundo `mergeCommercialOptimization` que inyecta y sincroniza todos los campos individuales del estándar del desarrollo con sus booleanos explícitos (`true`/`false`) en `formData`. Esto erradica los valores `undefined` de raíz.
  - Al presionar guardar, se persiste en Firestore exactamente la estructura con los booleanos explícitos que el usuario seleccionó, logrando un control granular impecable sin activaciones masivas involuntarias.
* **Estatus:** ✅ Completado, compilado con éxito y verificado.

### [2026-06-02] - Resolución de Advertencia de Accesibilidad en DevTools: Atributos de Identificación en Input de Búsqueda

* **Tipo:** Mejora de SEO y Accesibilidad / Estructura HTML Semántica / Silenciar Warnings
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientCatalog.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
* **Causa Raíz:**
  - El input de búsqueda principal en el catálogo del cliente carecía de los atributos `id` y `name`, provocando que navegadores modernos y Chrome DevTools emitieran una advertencia de accesibilidad relativa al autocompletado y mapeo semántico de campos de formulario.
* **Solución Técnica:**
  - Se añadieron explícitamente los atributos `id="search-input"` y `name="search"` al elemento `<input>` de búsqueda.
  - Esto soluciona la advertencia en consola y mejora la compatibilidad SEO y de autocompletado para agentes de usuario.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-02] - Corrección de UI/UX: Control Estricto de Elementos de Optimización Comercial según Configuración

* **Tipo:** Bug Fix / Consistencia de Lógica Comercial / Ajustes del Administrador
* **Archivo(s) Modificado(s):**
  - [`src/components/client/catalog/ProductDetailModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]
  - [`src/pages/client/ProductPublicDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [MODIFY]
* **Causa Raíz:**
  - Los elementos de la Capa de Optimización Comercial (tales como las estrellas de calificación, cuotas sin interés, banner de suscripción a cuotas extras y detalles de envío/devolución gratis) se renderizaban de forma incondicional en el detalle del producto, ignorando si el administrador había desactivado el módulo general en Herramientas de Desarrollador.
* **Solución Técnica:**
  - Se condicionaron todos los bloques de UI de Optimización Comercial (calificación con estrellas, cálculo dinámico de cuotas sin interés, banner de beneficios premium y detalles de envío/devolución) bajo el selector estricto de `{optEnabled && ...}` en `ProductDetailModal.jsx` y `ProductPublicDetail.jsx`.
  - Ahora se respeta el interruptor general del panel de control de administración de forma precisa en tiempo real.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-02] - Rediseño Premium del Botón Flotante "+" en Tarjeta de Producto

* **Tipo:** Mejora de UI/UX / Consistencia Cromática / Animaciones Fluidas
* **Archivo(s) Modificado(s):**
  - [`src/components/client/catalog/ProductCard.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
* **Causa Raíz:**
  - El botón flotante de agregar/ver opciones en la tarjeta de producto era un círculo blanco plano con un borde tosco y un signo `+` verde puro genérico. Carecía de profundidad, no respetaba los tokens cromáticos de la marca y tenía animaciones poco llamativas.
* **Solución Técnica:**
  - Se rediseñó el botón flotante aplicando el fondo del color primario activo (`bg-primary`) y el icono de `Plus` en color blanco con trazo grueso (`strokeWidth={3}`).
  - Se inyectó una sombra suave premium dinámica basada en el color de marca (`shadow-lg shadow-primary/30`) que se magnifica al pasar el mouse (`hover:shadow-xl hover:scale-110`).
  - Se añadieron transiciones fluidas de micro-animación (`duration-300 active:scale-90`) para una sensación háptica interactiva moderna y premium.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-02] - Integración Permanente del Botón y Badge de Carrito de Compras en ClientLayout

* **Tipo:** Mejora de UI/UX / Accesibilidad / Navegación Premium
* **Archivo(s) Modificado(s):**
  - [`src/layouts/ClientLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
* **Causa Raíz:**
  - El acceso al cajón del Carrito de Compras (`CartDrawer`) dependía de un indicador de inactividad flotante (`SmartHint`) que se ocultaba completamente cuando el conteo del carrito era cero (`cartCount === 0`).
  - Esto impedía que los usuarios visualizaran o accedieran al carrito vacío de forma directa e intuitiva al navegar por la tienda.
* **Solución Técnica:**
  - Se integró un botón del Carrito de Compras (`ShoppingCart`) 100% permanente en la barra lateral de escritorio (Desktop Sidebar) al lado de la campana de notificaciones.
  - Se integró el mismo botón permanente en la cabecera superior móvil (Mobile Header) al lado de la campana de notificaciones y el avatar del perfil.
  - Cada botón cuenta con un badge dinámico que muestra el total de ítems en el carrito (`cartCount > 0`) con animación de pulsación (`animate-pulse`) usando los colores temáticos del sistema de marca (`bg-primary text-white`).
  - **Corrección de Espaciado del Sidebar de PC (2026-06-02):** Se redujo el tamaño del logo del negocio a `w-10 h-10 rounded-xl` (antes `w-[54px]`) e incorporó la clase `flex-1 min-w-0 truncate` en el nombre de la tienda para evitar que los elementos colisionen o queden amontonados en pantallas de PC, logrando una estética sumamente premium, elegante y limpia en escritorio.
  - Esto garantiza accesibilidad universal al carrito en cualquier momento sin alterar el límite estricto de 5 botones de la barra de navegación inferior móvil.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-02] - Corrección de UI/UX: Invocación Síncrona del Prompt de Instalación PWA y Fallback Informativo

* **Tipo:** Corrección de UI/UX / Optimización PWA / Compatibilidad Móvil y Navegadores
* **Archivo(s) Modificado(s):**
  - [`src/hooks/usePWAInstall.js`](file:///d:/Aplicaciones/App%20Ventas/src/hooks/usePWAInstall.js) [MODIFY]
* **Causa Raíz:**
  - El botón "Instalar Aplicación" en la página de seguimiento de pedidos en vivo y el perfil del cliente no realizaba ninguna acción al hacer clic en ciertos navegadores (como Vivaldi/Chrome en escritorio o iOS).
  - Esto ocurría porque la función `handleInstall` estaba declarada como `async` y contenía un `await` antes de invocar a `installPrompt.prompt()`. Los navegadores modernos bloquean cualquier llamado asíncrono a prompts de instalación por políticas de seguridad estrictas que exigen que la interacción sea un resultado directo y 100% síncrono del evento del clic del usuario.
* **Solución Técnica:**
  - Se refactorizó la función `handleInstall` en `usePWAInstall.js` eliminando la declaración `async` y el `await` inicial.
  - Se configuró la llamada a `installPrompt.prompt()` para ejecutarse de forma **estrictamente síncrona** en el mismo hilo de ejecución del clic del usuario, resolviendo la promesa de la elección del usuario (`userChoice`) de forma asíncrona postergada en un bloque `.then()`.
  - Se inyectó un **fallback informativo inteligente**: si el objeto `installPrompt` es nulo o falla por restricciones del entorno, se despliega inmediatamente un cuadro de diálogo (`alert()`) específico según el sistema operativo (iOS/Safari vs Android/Chrome) con instrucciones detalladas paso a paso para añadir el acceso directo manualmente.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-02] - Mitigación de Warnings Alarmantes por FCM en Entorno Local

* **Tipo:** Mitigación de Advertencias / Consola Limpia / Diagnóstico de Entorno
* **Archivo(s) Modificado(s):**
  - [`src/hooks/useFCMPermission.js`](file:///d:/Aplicaciones/App%20Ventas/src/hooks/useFCMPermission.js) [MODIFY]
* **Causa Raíz:**
  - El hook de permisos FCM (`useFCMPermission.js`) imprimía un error rojo alarmante (`console.error`) en la consola cada vez que el registro del Service Worker de notificaciones fallaba por tiempo de espera en entornos locales (`localhost`) o sin HTTPS (lo cual es un comportamiento estándar y esperado del navegador por restricciones de seguridad nativas de las APIs de Push).
* **Solución Técnica:**
  - Se modificó el bloque de captura de excepciones (`catch`) en el hook para comprobar si el error corresponde a un fallo en el Service Worker de mensajería (`failed-service-worker-registration`) o si la ejecución se realiza sobre `localhost`.
  - En esos casos, se sustituyó el `console.error` rojo por un mensaje informativo de advertencia (`console.warn`) limpio y explicativo que no interrumpe el flujo ni genera falsas alarmas de compilación.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-02] - Reestructuración de Interfaz y Correcciones de Seguridad en Clientes y Empleados

* **Tipo:** Reestructuración de Interfaz / Bugfix / Seguridad / Diseño Adaptativo
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientFavorites.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientFavorites.jsx) [MODIFY]
  - [`src/pages/client/ClientOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientOrders.jsx) [MODIFY]
  - [`src/services/employeeService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/employeeService.js) [MODIFY]
* **Causa Raíz:**
  - La sección de Favoritos renderizaba manualmente las tarjetas de producto con marcado duplicado e inconsistencias visuales en el desorden de elementos y altura.
  - La sección de Mis Pedidos limitaba excesivamente el ancho en dispositivos móviles y medianos con `max-w-lg` y `max-w-3xl`, provocando que los elementos no fluyeran hasta los bordes.
  - Al cerrar sesión (`signOut`), los observadores activos de Firestore (`onSnapshot`) de empleados intentaban leer datos sin credenciales válidas, lanzando errores de `permission-denied` no capturados.
* **Solución Técnica:**
  - Se unificó el catálogo de favoritos importando y utilizando el componente atómico `<ProductCard />`.
  - Se expandió el contenedor exterior de la vista de pedidos a `w-full max-w-7xl mx-auto` logrando consistencia visual con el Catálogo y Créditos.
  - Se agregaron manejadores de error `onError` personalizados a los escuchadores en `employeeService.js` para registrar warnings informativos silenciosos en consola en lugar de excepciones globales destructivas al desconectarse.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-02] - Corrección de UI/UX: Eliminación de Bordes Negros y Estandarización de Estilos en el Tip de QR de Administración

* **Tipo:** Corrección de UI/UX / Estandarización de Estilos / Sistema de Marca
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminQRPerformance.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminQRPerformance.jsx) [MODIFY]
* **Causa Raíz:**
  - El banner informativo (Tip) en la analítica de rendimiento QR presentaba un borde negro tosco y un fondo opaco que no se alineaba con la paleta de colores activa del sistema, rompiendo la consistencia del diseño premium de marca.
* **Solución Técnica:**
  - Se removieron los estilos ad-hoc `border-primary/10` y `bg-primary/5` del contenedor.
  - Se integraron las clases suaves nativas del sistema de marca: `bg-primary-soft` y `border-primary-soft` (que utilizan `color-mix` dinámico con `transparent`), adaptándose perfectamente al tema activo (como `verde-oliva`).
* **Estatus:** ✅ Completado y verificado.

### [2026-06-02] - Corrección de UI/UX: Cajón Responsivo de Historial de Notificaciones al 100% en Pantallas Móviles

* **Tipo:** Corrección de UI/UX / Diseño Adaptativo / Layout y Alineación / Z-Index
* **Archivo(s) Modificado(s):**
  - [`src/layouts/AdminLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
  - [`src/layouts/PortalLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/PortalLayout.jsx) [MODIFY]
* **Causa Raíz:**
  - En vistas móviles de administración y portales, la ventana lateral (drawer/tray) del Historial de Notificaciones no ocupaba el 100% del ancho de la pantalla, dejando un espacio/gap lateral vacío que exponía el contenido del fondo y rompeduras en la consistencia del diseño de marca. Asimismo, el botón flotante móvil competía por el mismo `z-index` (z-50), posicionándose de forma incorrecta por encima del drawer abierto.
* **Solución Técnica:**
  - Se modificaron los contenedores de animación en `AdminLayout.jsx` y `PortalLayout.jsx` reemplazando el ancho estático `w-80` por la clase responsiva `w-full md:w-80`.
  - Se cambió la animación de entrada inicial/salida `x: 300` a `x: '100%'` para garantizar un deslizamiento elástico y suave del ancho dinámico completo.
  - Se redujo el `z-index` del botón flotante móvil en `AdminLayout.jsx` de `z-50` a `z-40` para asegurar que el drawer (en `z-50`) cubra limpiamente el 100% de la pantalla sin solapamientos visuales del botón activo de la campana.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-02] - Nueva Funcionalidad: Ecosistema Unificado del Notification Center e Infraestructura Centralizada de Mensajería y FCM

* **Tipo:** Nueva Funcionalidad / Infraestructura de Notificaciones / Tiempo Real / Audio Sintetizado / PWA & Push Messaging
* **Archivos Creados (NEW):**
  - [`src/services/notificationCenterService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/notificationCenterService.js)
  - [`src/hooks/useNotificationCenter.js`](file:///d:/Aplicaciones/App%20Ventas/src/hooks/useNotificationCenter.js)
  - [`src/hooks/useFCMPermission.js`](file:///d:/Aplicaciones/App%20Ventas/src/hooks/useFCMPermission.js)
  - [`src/components/common/NotificationHistoryTray.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/common/NotificationHistoryTray.jsx)
  - [`src/components/common/NCToastContainer.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/common/NCToastContainer.jsx)
  - [`src/pages/admin/AdminNotificationAnalytics.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminNotificationAnalytics.jsx)
  - [`public/firebase-messaging-sw.js`](file:///d:/Aplicaciones/App%20Ventas/public/firebase-messaging-sw.js)
* **Archivos Modificados (MODIFY):**
  - [`src/config/firebaseConfig.js`](file:///d:/Aplicaciones/App%20Ventas/src/config/firebaseConfig.js)
  - [`src/utils/audio.js`](file:///d:/Aplicaciones/App%20Ventas/src/utils/audio.js)
  - [`src/layouts/AdminLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/AdminLayout.jsx)
  - [`src/layouts/ClientLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/ClientLayout.jsx)
  - [`src/layouts/PortalLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/PortalLayout.jsx)
  - [`src/services/orderService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/orderService.js)
  - [`src/services/creditService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/creditService.js)
  - [`src/services/claimsService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/claimsService.js)
  - [`src/services/inventoryService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/inventoryService.js)
  - [`src/routes/AppRoutes.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/routes/AppRoutes.jsx)
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules)
  - [`firestore.indexes.json`](file:///d:/Aplicaciones/App%20Ventas/firestore.indexes.json)
* **Detalle Técnico:**
  - **Servicio y Hook Maestro:** Creado `notificationCenterService.js` como único punto de entrada para emitir, leer, archivar y organizar notificaciones categorizadas. Hook `useNotificationCenter.js` encapsula el flujo en tiempo real diferenciando notificaciones nuevas de existentes con un sistema dinámico de control de IDs en caché local.
  - **Audio Sintetizado:** Reemplazada la lógica antigua de sonido por `playSynthesizedSound` en `audio.js` que genera melodías diferenciadas en caliente utilizando Web Audio API para: Pedido, Entrega, Inventario, Promociones, Alertas Críticas y Cuenta.
  - **Push FCM e Integración PWA:** Registrado Service Worker `firebase-messaging-sw.js` compatible con FCM y solicitudes de background. Hook `useFCMPermission.js` gestiona el consentimiento del navegador, adquiere de forma segura el token del dispositivo e indexa/refresca de forma atómica la colección de Firestore `fcmTokens` para todos los roles.
  - **UI / UX Premium:** Diseñada bandeja lateral interactiva en `NotificationHistoryTray.jsx` con filtrado dinámico por categoría y acciones masivas rápidas. Contenedor flotante `NCToastContainer.jsx` unifica Toasts elásticos con transiciones suaves en Framer Motion.
  - **Integración Nativa:** Removida por completo la dependencia del servicio obsoleto `clientNotificationService.js`. Todos los eventos de cambio de estado en Pedidos (`orderService`), Abonos (`creditService`), Reclamos (`claimsService`) y Stock Crítico (`inventoryService`) están canalizados de forma nativa e integrada en el Notification Center.
  - **Seguridad e Índices:** Configurada la seguridad de Firestore en `firestore.rules` limitando el acceso de lectura a dueños de notificaciones y actualizados índices compuestos ordenados en `firestore.indexes.json`.
* **Estatus:** ✅ Completado y verificado.

### [2026-06-02] - Corrección Crítica: Trigger de IA en Cloud Functions (`functions/index.js`)

* **Tipo:** Bug Fix / Integración IA / Cloud Functions
* **Archivos Modificados:**
  - [`functions/index.js`](file:///d:/Aplicaciones/App%20Ventas/functions/index.js)
* **Causa Raíz (3 bugs encadenados):**
  1. **Path incorrecto del trigger:** La función `processProductImage` filtraba por `artifacts/temp_uploads/` pero el frontend sube imágenes a `products_drafts/`. El trigger nunca se disparaba, la IA nunca analizaba ninguna imagen.
  2. **Extracción de `draftId` incorrecta:** El código usaba `fileName.split(".")[0]` para extraer el ID, pero el nombre del archivo tiene formato `draft_<UUID>_<nombreoriginal>.ext`. Ese split producía un ID basura con el nombre del archivo incluido, no encontrando ningún documento en Firestore.
  3. **Mismatch de campos en Firestore:** La función guardaba `nombre_sugerido` y `descripcion_comercial` en la raíz del documento, pero el frontend leía `docSnap.data().suggestions.nombre` y `docSnap.data().suggestions.descripcion`. El `onSnapshot` del frontend nunca recibía los datos de IA.
* **Solución Aplicada:**
  - Path corregido a `products_drafts/`.
  - Extracción de `draftId` reemplazada por regex robusta: `/^(draft_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i` que captura el UUID estándar ignorando el nombre del archivo original.
  - Los datos se guardan ahora anidados bajo `suggestions: { nombre, descripcion }` con `{ merge: true }` para no sobrescribir el `imageUrl` ya guardado por el frontend.
* **Impacto:** La generación automática de nombre y descripción comercial por Gemini 1.5 Flash quedó completamente funcional. Cero cambios en el frontend ni en la lógica de negocio.
* **Estatus:** ✅ Corregido

### [2026-06-02] - Nueva Funcionalidad: Implementación Completa del Módulo de Optimización Comercial y Conversión


* **Tipo:** Nueva Funcionalidad / Marketing & Conversión / Ecommerce / UI-UX Premium
* **Archivos Modificados (MODIFY):**
  - [`src/store/appConfigStore.js`](file:///d:/Aplicaciones/App%20Ventas/src/store/appConfigStore.js)
  - [`src/schemas/inventorySchemas.js`](file:///d:/Aplicaciones/App%20Ventas/src/schemas/inventorySchemas.js)
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
  - [`src/components/admin/inventory/ProductFormModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx)
  - [`src/services/orderService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/orderService.js)
  - [`src/components/client/catalog/ProductCard.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ProductCard.jsx)
  - [`src/components/client/catalog/ProductDetailModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx)
  - [`src/components/client/cart/CartDrawer.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/cart/CartDrawer.jsx)
  - [`src/pages/client/ProductPublicDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductPublicDetail.jsx)
* **Detalle Técnico:**
  - **Estrategia y Arquitectura:** Implementado un módulo comercial no intrusivo compuesto por 6 herramientas de conversión basadas en Mercado Libre/Amazon.
  - **Fiel Alineación con Capturas de Mercado Libre (Refinamiento Visual):**
    * **ProductPublicDetail.jsx (Re-maquetación de jerarquía):** Se reestructuró la página de modo que el título, los metadatos de ventas (`Nuevo | +50 vendidos`) y la valoración por estrellas estén **encima** del carrusel de imágenes, imitando fielmente la distribución de la ficha técnica en la app original.
    * **Ubicación Fija:** Añadido un subheader fijo de ubicación (`Calle 17 #11-51 >`) en la franja amarilla (`#fff159`) del tope.
    * **Pill Indicator y Acciones de la Foto:** El indicador de fotos ("1 / 3") ahora se muestra en un pill blanco redondeado con sombra sutil e indicador negro. Se inyectó un carrusel táctil con cheurons y un panel flotante de acciones a la derecha de la imagen principal con botones circulares blancos para Wishlist (Corazón elástico), Compartir y WhatsApp Directo.
    * **Variant Selector de Imagen Real:** Configurado un grid táctil de miniaturas de variantes con bordes redondeados y contorno azul dinámico de selección para conmutar imágenes reales en vivo en la galería.
    * **Financiero y Envíos:** Inyectado cálculo automático y dinámico de cuotas con 0% de interés (`en 6 cuotas de $ X.XXX con 0% de interés` en verde), fila de marcas de tarjetas asociadas, banner interactivo de membresía/beneficios y bloques verdes con logos para "Llega gratis mañana (FULL)" y "Devolución gratis de 30 días".
    * **ProductDetailModal.jsx (Alineación de Portal):** Portadas e indicadores sincronizados a la misma estética de carrusel táctil superior, pill blanco, selector de color visual en thumbnails, precios con cuotas dinámicas y logos de pago.
  - **appConfigStore.js:** Añadida persistencia y arranque de feature flags del módulo `commercialOptimization`.
  - **inventorySchemas.js & ProductFormModal.jsx:** Ampliación del esquema de variantes Zod para soportar `nombre`, `precio` e `imageUrl` y su wizard/formulario de edición clásica. trigger de Gemini limitado a la imagen principal.
  - **orderService.js:** Inyectado incremento atómico de `salesCount` en Firestore transactions al crear pedidos cliente/POS.
  - **ProductCard.jsx:** Implementadas etiquetas inteligentes visuales ("Más Vendido", "Última Unidad", "Oferta Imperdible", "Nuevo"), indicador de variantes, precio en promo inline con badge `X% OFF` y botón flotante Quick Buy en la esquina de la imagen.
  - **CartDrawer.jsx:** Recomendador cruzado inteligente (cross-selling) con puntuación ponderada para productos en base a categorías del carrito, historial de compras (`getClientOrders`), ventas reales (`salesCount`), promociones y destacados. Incluye modal visual embebido de opciones.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa (`npm run build` ✓ 1.07s, 0 errores).

### [2026-06-01] - Corrección de UI/UX: Rediseño Responsivo y Expansión de Contenedores de Cliente en Desktop (Pedidos, Créditos y Perfil)

* **Tipo:** Mejora de Experiencia de Cliente / UI/UX / Diseño Adaptativo / Layout y Alineación
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientOrders.jsx) [MODIFY]
  - [`src/pages/client/ClientCredits.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY]
  - [`src/pages/client/ClientProfile.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientProfile.jsx) [MODIFY]
* **Causa Raíz:**
  - En pantallas de escritorio (PC/Tablet), las vistas del Historial de Pedidos (`/tienda/pedidos`), el Estado de Cuenta de Créditos (`/tienda/creditos`) y el Perfil del Cliente (`/tienda/perfil`) presentaban contenedores desproporcionadamente estrechos y centrados (limitados a `max-w-3xl` o `max-w-xl` de forma fija). Esto provocaba que las tarjetas se vieran comprimidas y dejaran un gran espacio vacío en la parte derecha de la interfaz, rompiendo la alineación simétrica general y el estándar de maquetación del catálogo.
* **Solución Técnica:**
  - Se homogeneizó la propiedad de ancho máximo en las tres vistas del cliente mediante clases adaptativas de Tailwind CSS:
    * **`ClientOrders.jsx`**: Se expandió el contenedor principal en la línea 713 de `max-w-lg mx-auto md:max-w-3xl` a `max-w-lg mx-auto md:max-w-3xl lg:max-w-7xl lg:px-8`.
    * **`ClientCredits.jsx`**: Se modificaron los contenedores de las líneas 114 y 152 reemplazando la limitación rígida `max-w-4xl` por el estándar simétrico `max-w-7xl`.
    * **`ClientProfile.jsx`**: Se actualizaron las divisiones contenedoras del header y las opciones de personalización (líneas 66 y 127) de `max-w-xl` al estándar de ancho completo `max-w-7xl`.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 990ms) y despliegue del bundle actualizado a Firebase Hosting (`firebase deploy --only hosting` ✓).

### [2026-06-01] - Corrección de UI/UX: Rediseño Responsivo de Categorías en PC (Desktop Chips)

* **Tipo:** Mejora de Experiencia de Cliente / UI/UX / Diseño Adaptativo / CSS Grid & Flexbox
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientCatalog.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
* **Causa Raíz:**
  - En la vista de catálogo del cliente en pantallas de escritorio (PC/Tablet), las tarjetas de categorías se mostraban como bloques cuadrados gigantescos (`aspect-square w-full` en un `grid grid-cols-4`). Esto consumía un espacio desproporcionado en pantalla y rompía la elegancia visual en PC, aunque se viera correctamente en dispositivos móviles.
* **Solución Técnica:**
  - Se implementó una transformación CSS responsiva basada en clases nativas de Tailwind CSS:
    * **Contenedor**: Conmutado de grilla a flex elástico en desktop: `grid grid-cols-4 sm:flex sm:flex-wrap gap-2 sm:gap-3`.
    * **Botones/Tarjetas**: Transformados de bloques cuadrados gigantes a cápsulas (chips) horizontales estilizadas y compactas: `aspect-square sm:aspect-auto w-full sm:w-auto sm:h-11 sm:px-5 flex flex-col sm:flex-row`.
    * **Iconos**: Redimensionados de `w-7 h-7` (mobile) a un tamaño de `sm:w-4 sm:h-4` en desktop alineado horizontalmente a la izquierda del texto (`sm:mb-0`).
    * **Bypass de Límite**: Se eliminó la paginación a 3 categorías en PC, mostrando el catálogo completo de categorías de forma fluida. Se ocultó el botón *"Ver todas"* en PC (`sm:hidden`) y se inyectó una regla de visualización inteligente basada en el índice para ocultar excedentes únicamente en mobile: `idx >= 3 && !isCategoriesExpanded ? 'hidden sm:flex' : 'flex'`.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 937ms) sin provocar regresiones visuales en el flujo móvil.

### [2026-06-01] - Corrección de UI/UX: Reubicación de Botón "Volver a la tienda" en Seguimiento de Pedido

* **Tipo:** Mejora de Experiencia de Cliente / UI/UX / Navegación y Usabilidad
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/OrderTracking.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/OrderTracking.jsx) [MODIFY]
* **Causa Raíz:**
  - Al abrir el seguimiento de pedido en tiempo real, el botón *"Volver a la tienda"* se renderizaba en el pie de página inferior (footer). Esta ubicación dificultaba la visualización inmediata del usuario, obligándolo a hacer scroll hasta el final del contenido para regresar al catálogo principal de compras.
* **Solución Técnica:**
  - Se importó el icono `<ChevronLeft>` desde el paquete `lucide-react`.
  - Se removió el link de retorno del footer en la parte inferior de la vista.
  - Se inyectó una barra de navegación superior limpia (`div className="flex items-center justify-between px-2 shrink-0"`) al inicio del contenedor del layout, posicionando el botón *"Volver a la tienda"* de forma visible en la esquina superior izquierda con un estilo premium, consistente y accesible.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 870ms).

### [2026-06-01] - Corrección de Seguridad: Error de Lectura en Listado de Pedidos del Cliente ("Mis Pedidos")

* **Tipo:** Corrección de Seguridad / Reglas de Acceso / Base de Datos
* **Archivo(s) Modificado(s):**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [MODIFY]
* **Causa Raíz:**
  - Al abrir la sección *"Mis Pedidos"* en el perfil de cliente, la consola arrojaba un error crítico de snapshot listener `FirebaseError: [code=permission-denied]: Missing or insufficient permissions.`. Esto se debía a que la regla de lectura en la colección `/orders` exigía un límite de consulta estricto de máximo 20 registros (`request.query.limit <= 20`). Dado que la consulta de suscripción en tiempo real efectuada por el hook de cliente (`subscribeToClientOrders`) en `orderService.js` no especificaba un límite forzado, la petición no cumplía con el límite de la regla y Firebase rechazaba la suscripción completa.
* **Solución Técnica:**
  - Se eliminó el parámetro de límite `&& request.query.limit <= 20` de la regla de lectura (`allow read`) en la colección `/orders`.
  - La regla ahora permite de forma segura la lectura a cualquier cliente siempre que su consulta contenga la restricción de filtro en base a su propio número telefónico (`cliente.celular != null`), lo cual Firestore valida eficientemente.
  - Verificado mediante compilación exitosa (`npm run build` ✓ 988ms) y despliegue de las reglas a producción (`firebase deploy` ✓).

### [2026-06-01] - Corrección de UI y Transacciones: Error de Hidratación en Checkout y Permisos de Inventario

* **Tipo:** Corrección de UI/UX / Reglas de Acceso / Transacciones de Venta / Hydration Fix
* **Archivo(s) Modificado(s):**
  - [`src/components/common/ModalTemplate.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/common/ModalTemplate.jsx) [MODIFY]
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [MODIFY]
* **Causa Raíz:**
  - **Error de Hidratación:** El modal de checkout (`CheckoutModal`) arrojaba un error de hidratación de React indicando que un elemento `<div>` no puede ser descendiente de un `<p>` (`In HTML, <div> cannot be a descendant of <p>.`). Esto ocurría porque el contenedor del subtítulo en `ModalTemplate.jsx` estaba maquetado usando la etiqueta `<p>`, pero al inyectar elementos de bloque dinámicos (como el stepper indicador de pasos del checkout que contiene barras div) se violaban las especificaciones estándar de anidación del HTML.
  - **Permisos Denegados en Checkout:** Al finalizar una orden, el cliente intentaba ejecutar una transacción atómica para descontar el stock en caliente de la colección `/products`. Sin embargo, la regla general para productos bloqueaba las actualizaciones a usuarios no administrativos (`allow write, update, delete: if isAdmin();`), denegando la transacción con un error 403 Forbidden (`Error al crear pedido: FirebaseError: Missing or insufficient permissions.`).
* **Solución Técnica:**
  - **`ModalTemplate.jsx`**: Se refactorizó la etiqueta del subtítulo de `<p>` a `<div>` en la línea 85, eliminando la colisión del validador DOM y el error de hidratación.
  - **`firestore.rules`**: Se actualizó la regla de actualización (`allow update`) en la colección `/products` permitiendo de forma segura que clientes públicos actualicen productos exclusivamente si los únicos campos modificados en la petición son `variantes` (stock) y `updatedAt`. Se logró aplicando la validación de claves afectadas: `request.resource.data.diff(resource.data).affectedKeys().hasOnly(['variantes', 'updatedAt'])`.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 1.03s) y despliegue inmediato de reglas de base de datos a producción (`firebase deploy` ✓).

### [2026-06-01] - Corrección de UI y Lógica: Stepper de Seguimiento en Tiempo Real 100% Dinámico sin Cookies ni Fallbacks Rígidos

* **Tipo:** Corrección de Lógica de Negocio / UI/UX / Omnicanalidad / Seguimiento de Pedidos
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/OrderTracking.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/OrderTracking.jsx) [MODIFY]
* **Causa Raíz:**
  - En la vista pública de seguimiento de pedido (`OrderTracking.jsx`), al ingresar un cliente invitado/anónimo (sin sesión activa de Administrador), el sistema no contaba con permisos de lectura para consultar la colección de Firestore `/employees` (bloqueada por seguridad de PINs y salarios). Como medida temporal, el stepper recurría a un fallback forzado que asumía `hasCocinero = true` y `hasMensajero = true` para todas las sesiones de clientes invitados, lo que provocaba que se mostraran estados inexistentes (como el paso de "En Preparación en Cocina" o "En Camino") incluso si la empresa no poseía empleados cocineros ni mensajeros registrados.
* **Solución Técnica:**
  - Se eliminó la consulta forzada a base de datos de Firestore en las sesiones de invitados.
  - Se aprovechó la hidratación de datos global y reactiva del store de configuración (`useAppConfigStore`), el cual ya carga públicamente el array de `employees` y la bandera `hasMultipleEmployees`.
  - Se inyectó una verificación dinámica que evalúa si el módulo de múltiples empleados está activo. De estarlo, filtra el array localmente para corroborar la existencia de perfiles con roles `'cocinero'` y `'mensajero'`.
  - Se actualizó el generador de la línea de tiempo (`buildStepKeys`) para que muestre el paso de preparación (`alistamiento`) únicamente si hay cocineros activos, y los pasos de entrega (`listo` / `en_camino`) únicamente si hay mensajeros contratados o si la tienda maneja entregas externas con tarifa propia (`customDelivery.enabled === true`).
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓).

### [2026-06-01] - Corrección de UI: Recorte de Badge de Ofertas en Barra de Navegación Móvil

* **Tipo:** Corrección de UI/UX / Navegación Móvil / CSS Layout
* **Archivo(s) Modificado(s):**
  - [`src/layouts/ClientLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
* **Causa Raíz:**
  - El badge que muestra la cantidad de ofertas/cupones activos en el botón central circular de la barra de navegación móvil se mostraba recortado (solo visible como una pequeña pestaña blanca). Esto ocurría porque el contenedor del botón circular principal (`motion.div`) tenía la propiedad CSS `overflow-hidden` activa (necesaria para contener el efecto de barrido de brillo metálico), lo que recortaba cualquier elemento con posicionamiento absoluto que se ubicara fuera de sus bordes (como el badge en `-top-1 -right-1`).
* **Solución Técnica:**
  - Se extrajo el `span` del badge de cupones activos fuera del contenedor animado con `overflow-hidden`.
  - Se envolvió el botón y el badge en un contenedor común relativo (`div className="relative z-10"`), permitiendo que el badge se posicione de forma absoluta de manera exacta en la esquina superior derecha y se renderice de forma completa, legible y estética.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓).

### [2026-06-01] - Corrección de UI: Formato de Redirección de WhatsApp para Domiciliarios y Mensajeros

* **Tipo:** Corrección de UX / Enlaces de Contacto / WhatsApp Deep Linking
* **Archivo(s) Modificado(s):**
  - [`src/components/admin/orders/OrderDeliveryPanel.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/orders/OrderDeliveryPanel.jsx) [MODIFY]
  - [`src/pages/portal/PortalMensajero.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalMensajero.jsx) [MODIFY]
* **Causa Raíz:**
  - Al presionar el botón de WhatsApp para contactar al mensajero externo desde la tarjeta de pedido o para contactar al cliente desde el Portal de Domiciliarios, la plantilla de mensaje predefinida no se cargaba (solo abría el chat vacío). Esto se debía a un formateo rígido que anteponía el código de país de Colombia `57` sin validar si el número telefónico ya lo tenía (creando duplicaciones inválidas `5757...`). Además, el formato antiguo del enlace (`wa.me`) a veces presentaba problemas de compatibilidad para transferir la query string en ciertos clientes móviles.
* **Solución Técnica:**
  - Se saneó de forma dinámica el número limpiando caracteres no numéricos y anteponiendo el indicativo `57` únicamente si su longitud neta es de exactamente 10 dígitos.
  - Se cambió el enlace a la API oficial universal de WhatsApp (`https://api.whatsapp.com/send?phone={tel}&text={msg}`) garantizando total soporte de inyección del mensaje pre-cargado tanto en clientes web como móviles nativos.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓).

### [2026-06-01] - Corrección de Seguridad: Reglas de Firestore para Mensajeros Externos

* **Tipo:** Corrección de Seguridad / Reglas de Acceso / Base de Datos
* **Archivo(s) Modificado(s):**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [MODIFY]
* **Causa Raíz:**
  - El panel de configuración de mensajeros propios arrojaba un error de permisos denegados de Firestore (`FirebaseError: Missing or insufficient permissions.`) en la consola del navegador al intentar cargar o modificar el listado de domiciliarios externos. Esto ocurría porque la regla de seguridad para la subcolección `messengers` estaba anidada incorrectamente dentro de `/config/{document}`, resultando en una ruta inválida `/config/delivery/delivery/messengers/{messengerId}` en lugar de la ruta plana correcta `/config/delivery/messengers/{messengerId}`.
* **Solución Técnica:**
  - Se aplanó la regla de seguridad en `firestore.rules` extrayendo el bloque `match /config/delivery/messengers/{messengerId}` fuera de la coincidencia wildcard recursiva de configuración.
  - Se desplegaron las nuevas reglas compiladas y validadas con Firebase CLI exitosamente (`firebase deploy --only firestore:rules` ✓).

### [2026-06-02] - Nueva Funcionalidad: Sistema Integral de Mensajero Propio y Gestión de Domiciliarios

* **Tipo:** Nueva Funcionalidad / Logística / Gestión de Entregas / Analytics
* **Archivos Creados (NEW):**
  - [`src/components/admin/settings/DeliveryCustomMessengerPanel.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/settings/DeliveryCustomMessengerPanel.jsx)
  - [`src/components/admin/orders/OrderDeliveryPanel.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/orders/OrderDeliveryPanel.jsx)
  - [`src/pages/admin/AdminDeliveryPerformance.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminDeliveryPerformance.jsx)
* **Archivos Modificados (MODIFY):**
  - [`src/constants/index.js`](file:///d:/Aplicaciones/App%20Ventas/src/constants/index.js)
  - [`src/services/deliveryService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/deliveryService.js)
  - [`src/store/appConfigStore.js`](file:///d:/Aplicaciones/App%20Ventas/src/store/appConfigStore.js)
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx)
  - [`src/pages/portal/PortalMensajero.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalMensajero.jsx)
  - [`src/routes/AppRoutes.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/routes/AppRoutes.jsx)
* **Detalle Técnico:**
  - **constants/index.js:** Añadidas constantes `DELIVERY_STATES` (pendiente/asignado/listo/en_camino/entregado/fallido/reprogramado), `DELIVERY_STATE_LABELS`, `MESSENGER_STATUS`, `MESSENGER_STATUS_LABELS`, `DEFAULT_MESSENGER_TEMPLATE`. Añadida `COLLECTIONS.DELIVERY_ANALYTICS`. ORDER_STATE_META extendido con estados `fallido` y `reprogramado`.
  - **deliveryService.js:** Reescrito completamente desde 61 líneas hasta un servicio completo. CRUD de mensajeros externos en subcolección Firestore (`config/delivery/messengers`). Asignación/reasignación con historial (`assignDelivery`, `unassignDelivery`). Cambio de estado con trazabilidad (`updateDeliveryStatus`, `arrayUnion`). Sincronización bidireccional con colección `orders` (campo `deliveryInfo`). Analítica agregada en colección `deliveryAnalytics` mediante transacciones. Suscripciones RT optimizadas. Generador de mensaje de mensajero por plantilla con reemplazo de variables (`buildMessengerMessage`).
  - **appConfigStore.js:** Añadido `customDelivery` dentro de `deliverySettings` con: `enabled`, `serviceLabel`, `costType`, `fixedCost`, `allowCustomCost`, `estimatedTime`, `messengerTemplate`. Incluido en `partialize` para persistencia local.
  - **DeliveryCustomMessengerPanel.jsx (NEW):** Componente modular para AdminSettings. Toggle de activación, tipo de costo (fijo/personalizado), editor de plantilla con variables, CRUD completo de mensajeros externos (agregar, editar, eliminar, cambiar estado disponible/ocupado/fuera_servicio).
  - **AdminSettings.jsx:** Importado e integrado `DeliveryCustomMessengerPanel` en la sección de Métodos de Entrega (Nivel 3, subsección `entregas`).
  - **OrderDeliveryPanel.jsx (NEW):** Panel embebido en tarjeta de pedido expandida en AdminOrders. Carga en paralelo empleados con rol MENSAJERO y mensajeros externos. Permite asignar/retirar mensajero, cambiar estado logístico con flujo guiado, enviar mensaje WhatsApp con plantilla configurable, ver historial de eventos del domicilio.
  - **AdminOrders.jsx:** Integrado `OrderDeliveryPanel` condicionado a `tipoEntrega === 'domicilio' && deliverySettings.customDelivery.enabled`.
  - **PortalMensajero.jsx (v2):** Refactorizado completamente. Nuevos estados: `listo`, `reprogramado`. Stepper visual del flujo de entrega. Botones de contacto cliente (WhatsApp contextual + llamada). Modal sheet de nota obligatoria para estados negativos. Sección separada de entregas completadas del día. Sincronización con nuevo `updateDeliveryStatus` con actorName y historial.
  - **AdminDeliveryPerformance.jsx (NEW):** Panel de analítica. KPIs: total domicilios, tasa de éxito, fallidos, tiempo promedio. Ranking de domiciliarios con barra de eficiencia. Distribución diaria con barras proporcionales inline. Filtros de 7/14/30 días. Ruta: `/admin/rendimiento-entregas`.
  - **AppRoutes.jsx:** Añadida ruta `/admin/rendimiento-entregas` con lazy loading de `AdminDeliveryPerformance`.
* **Estatus:** ✅ Build exitoso — 1.03s, 0 errores.

### [2026-06-01] - Nueva Funcionalidad: Tarjeta de Instalación Nativa PWA en Ficha de Seguimiento y Ajustes Limpios en Admin

* **Tipo:** Mejora de Experiencia de Cliente / Integración PWA Autónoma / Eliminación de Tiendas Externas / Limpieza de UI Administrativa
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/OrderTracking.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/OrderTracking.jsx) [MODIFY]
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Causa Raíz:**
  - En la pantalla de seguimiento de pedido se promocionaban descargas desde Google Play y App Store externas. Al tratarse de una Aplicación Web Progresiva (PWA) pura y autocontenida de marca blanca, el cliente indicó que no es necesario promover estas descargas externas rígidas, sino inyectar el disparador nativo de instalación de PWA en caliente y los fallbacks de iOS Safari, de la misma manera que en la sección de ajustes de su perfil de cliente. Asimismo, al no requerirse enlaces externos de tiendas, los campos de "Enlace Google Play Store" y "Enlace Apple App Store" en la configuración del panel administrativo eran completamente obsoletos y causaban confusión.
* **Solución Técnica:**
  - **`AdminSettings.jsx`**: Se eliminaron los campos obsoletos de "Enlace Google Play Store (Android)" y "Enlace Apple App Store (iPhone)". Se renombró la categoría a *"Promoción de Aplicación PWA (Instalación Directa)"* y se adaptaron los placeholders del título y del mensaje comercial al contexto PWA.
  - **`OrderTracking.jsx`**: Se integró el hook de instalación `usePWAInstall` y las banderas de entorno `isIOS` e `isStandalone` en `OrderTracking.jsx`. Se inyectó el botón de acción **"Instalar Aplicación" siempre visible** dentro del banner. Si la app no es autodetectada directamente (`rawInstallable` es false), hacer clic en el botón lanza un alert descriptivo nativo adaptado con el paso a paso preciso según el sistema del dispositivo (iOS vs Android/Desktop) y proporciona las instrucciones precisas para agregar la PWA en 2 sencillos pasos en lugar de mostrar textos pasivos en pantalla.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 1.31s).

### [2026-06-01] - Nueva Funcionalidad: Plantilla de WhatsApp sin Enlace y con Instrucción de Tracking de App

* **Tipo:** Mejora de Experiencia de Cliente / WhatsApp Deep Linking
* **Archivo(s) Modificado(s):**
  - [`src/components/admin/orders/OrderShareModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/orders/OrderShareModal.jsx) [MODIFY]
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Causa Raíz:**
  - Los enlaces compartidos externamente por WhatsApp a clientes nuevos pueden verse bloqueados preventivamente como texto plano no accionable debido a las políticas anti-spam de Meta. Para eliminar esta fricción, el cliente prefiere no enviar la URL externa directa en el chat, sino enviar un mensaje con los datos del pedido que instruya de forma clara cómo realizar el seguimiento en vivo ingresando directamente a la App (en la sección "Mis Pedidos" pulsando el botón de seguimiento en la tarjeta del cliente).
* **Solución Técnica:**
  - Se modificó la plantilla de mensaje predeterminada (`defaultTemplate`) en `OrderShareModal.jsx` para remover el tag `{enlace}` y redactar un instructivo comercial detallado que guía al usuario a abrir la aplicación móvil, entrar a *'Mis Pedidos'* y presionar el botón *'🚀 Ver Seguimiento en Tiempo Real'*.
  - Se inyectó el reemplazo dinámico de la variable `{total}` (formateado en divisa local) en el parser del mensaje.
  - Se agregó el chip dinámico `{total}` en la cuadrícula de etiquetas del editor de ajustes de `AdminSettings.jsx`.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 1.40s).

### [2026-06-01] - Corrección de UI: Doble Barra de Scroll y Desborde en Ajustes de Seguimiento

* **Tipo:** Corrección de UI/UX / Optimización de Maquetación
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Causa Raíz:**
  - Al ingresar a la subsección de configuración de Seguimiento de Pedidos, el contenedor principal de la vista del formulario poseía las clases de utilidades CSS `max-h-[600px] overflow-y-auto pr-1` (las cuales fueron omitidas en las otras pestañas limpias de ajustes). Esto provocaba que se renderizara una barra de scroll secundaria e interna (doble scroll) que colisionaba con el scroll del panel maestro, afectando la correcta accesibilidad y recortando los botones de guardado inferiores en la barra inferior móvil.
* **Solución Técnica:**
  - Se removieron por completo las clases `max-h-[600px]` y `overflow-y-auto` en el contenedor del formulario del módulo en `AdminSettings.jsx`, permitiendo que el flujo de altura se expanda de manera natural y sea el contenedor de scroll principal del layout el que gestione el desplazamiento.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 1.14s).

### [2026-06-01] - Corrección de UI: Eliminación de Borde Rígido en Resumen de OrderShareModal

* **Tipo:** Corrección de UI/UX / Estilo Visual Premium
* **Archivo(s) Modificado(s):**
  - [`src/components/admin/orders/OrderShareModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/orders/OrderShareModal.jsx) [MODIFY]
* **Causa Raíz:**
  - De acuerdo con la preferencia estricta de evitar bordes rígidos oscuros o negros en la interfaz para mantener una estética sumamente premium, limpia y pulida, la tarjeta de resumen del pedido dentro del modal de compartición (`OrderShareModal`) presentaba un contorno visible (`border-app/60`) que afectaba negativamente el contraste y la limpieza visual.
* **Solución Técnica:**
  - Se eliminó la clase de borde `border border-app/60` en el contenedor del resumen del pedido, optimizando el padding e incrementándolo a `p-4` para mantener una caja con fondo plano elegante (`bg-surface-2`) 100% borderless.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 1.18s).

### [2026-06-01] - Corrección: Importación Faltante de MessageSquare en AdminSettings

* **Tipo:** Corrección de Bug / Consistencia de UI
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
* **Causa Raíz:**
  - Al ingresar a la subsección de Seguimiento de Pedidos (`activeSubSection === 'seguimiento'`), la consola arrojaba un error de referencia `ReferenceError: MessageSquare is not defined`. Esto ocurría porque se utilizó el componente de ícono `<MessageSquare>` en la sección de plantilla de WhatsApp sin haberlo importado previamente del paquete `lucide-react` en el encabezado.
* **Solución Técnica:**
  - Se añadió `MessageSquare` en la línea de desestructuración de importaciones de `lucide-react` al inicio de `AdminSettings.jsx`.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 1.24s).

### [2026-06-01] - Nueva Funcionalidad: Sistema de Compartición de Seguimiento de Pedidos (QR, Enlace Seguro y WhatsApp)

* **Tipo:** Nueva Funcionalidad / Marketing & Conversión / Telemetría y Analíticas
* **Archivo(s) Creado(s) o Modificado(s):**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [MODIFY]
  - [`src/services/trackingAnalyticsService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/trackingAnalyticsService.js) [NEW]
  - [`src/components/admin/orders/OrderShareModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/orders/OrderShareModal.jsx) [NEW]
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]
  - [`src/pages/client/OrderTracking.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/OrderTracking.jsx) [MODIFY]
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`src/pages/admin/AdminHome.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Tareas Pendientes\tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Tareas%20Pendientes/tareas_pendientes.md) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Estandar de Desarrollo\mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_aplicacion.md) [MODIFY]
* **Detalle Técnico:**
  - **Base de Datos y Seguridad:** Creada la colección `trackingAnalytics` para persistir eventos de escaneo de QR, accesos a enlaces seguros, descargas de app y recompras. Modificadas las reglas de seguridad de Firestore para permitir la creación pública y anónima de logs e interacciones analíticas, restringiendo lecturas exclusivamente a administradores autorizados.
  - **Servicio de Telemetría:** Implementado `trackingAnalyticsService.js` para registrar asíncronamente las interacciones (evitando conteos duplicados por re-renders con banderas de control local) y obtener agregaciones estadísticas consolidadas.
  - **Acceso Rápido y Roles en Admin:** Inyectado el disparador de compartición con el ícono `QrCode` en cada tarjeta de pedido de `AdminOrders.jsx`, validando activamente el rol PIN del empleado operativo para denegar el acceso a bodegueros/cocineros y restringirlo a meseros/vendedores y administradores.
  - **OrderShareModal Premium:** Creado componente modal premium con transiciones animadas que genera códigos QR de alto contraste en caliente usando `<canvas>`, permite descargas PNG, impresión escalada a 80mm, copiado rápido de enlace y envío a WhatsApp con reemplazo en vivo de variables (cliente, pedido, estado, tienda, enlace).
  - **Experiencia de Cliente Fidelizada:** Modificado `OrderTracking.jsx` para reportar telemetría e inyectar secciones comerciales: "Sigue explorando" (redirección al catálogo) y "Promoción de App Oficial" (badges de descarga). Si el pedido está entregado o cancelado, los widgets de conversión ganan prioridad visual superior para incentivar la recompra.
  - **Gestión y Editor de Fidelización:** Agregada subsección de Plantillas y Fidelización en `AdminSettings.jsx` para editar la plantilla del mensaje de WhatsApp y los enlaces promocionales de la app oficial.
  - **Dashboard de Conversión:** Integrada sección de analíticas "Conversión desde Seguimiento" en `AdminHome.jsx` con métricas y tasas de clics en tiempo real.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 1.15s).

### [2026-06-01] - Corrección: Permisos de Firestore en Consulta de Roles de Empleados en Seguimiento

* **Tipo:** Seguridad / Reglas de Acceso / Base de Datos / Optimización de Consultas
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/OrderTracking.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/OrderTracking.jsx) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
* **Causa Raíz:**
  - El componente `OrderTracking` intentaba consultar la lista de empleados activos por rol (`getEmployeesByRole`) al cargarse para ajustar dinámicamente el stepper. Sin embargo, dado que el catálogo y el seguimiento son consumidos de forma pública y anónima, y por estrictos motivos de seguridad del estándar Ecosistema no se permite listar el personal de forma pública (evitando filtraciones de PINs o números), Firestore arrojaba un error de permisos.
* **Solución Implementada:**
  - Se condicionó la consulta de roles de empleados únicamente para sesiones del administrador (`ROLES.ADMIN`) importando `useAuthStore`.
  - Para clientes invitados se asume habilitado por defecto para mostrar el stepper completo, eliminando de raíz las peticiones no autorizadas y los errores en la consola del navegador.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓).

### [2026-06-01] - Corrección: Permisos de Firestore para Suscripción de Seguimiento de Pedidos sin Auth

* **Tipo:** Seguridad / Reglas de Acceso / Base de Datos / Despliegue Firestore
* **Archivo(s) Modificado(s):**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [MODIFY] [DEPLOY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
* **Causa Raíz:**
  - Tras la última auditoría de seguridad que limitaba las fugas de información de `/orders` restringiendo las consultas masivas a usuarios sin sesión iniciada, las consultas públicas de seguimiento de pedido a través de `trackingToken` en `OrderTracking.jsx` (donde el cliente actúa como un invitado anónimo sin sesión activa en Firebase Auth) arrojaban un error `FirebaseError: Missing or insufficient permissions`.
* **Solución Implementada:**
  - Se modificó la regla de lectura (`allow read`) en la ruta `/orders/{document}` en `firestore.rules` para autorizar de forma segura cualquier lectura o consulta que se realice sobre un pedido siempre y cuando cuente con un token de seguimiento válido (`resource.data.trackingToken != null`).
  - Se desplegaron con éxito las reglas a producción mediante `firebase deploy --only firestore:rules`.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓).

### [2026-06-01] - Refactorización: Suavizado de Bordes Activos en Ficha de Seguimiento del Cliente (OrderTracking)

* **Tipo:** Refactorización de UI/UX / Diseño de Sistema / Bordes
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/OrderTracking.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/OrderTracking.jsx) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
* **Causa Raíz:**
  - El uso de la opacidad en el borde con Tailwind (`border-primary/15` y `border-primary/20`) no se resolvía correctamente en algunos motores de renderizado, haciendo que el navegador cayera en el color por defecto (negro sólido), lo que se percibía tosco y contrastante con respecto a la interfaz limpia de la marca.
* **Solución Implementada:**
  - Se eliminaron las clases de borde de color con opacidad de Tailwind y se sustituyeron por un estilo inline nativo con **`color-mix(in srgb, var(--color-primary) 15%, transparent)`** en los contenedores de recompra y en el botón "Explorar Tienda" de `OrderTracking.jsx`. Esto garantiza un borde difuminado semi-transparente que adopta armónicamente la identidad HSL de cada cliente.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓).

### [2026-06-01] - Corrección: ReferenceError de config en Ficha de Seguimiento del Cliente (OrderTracking)

* **Tipo:** Corrección de Bug / Consistencia de UI / Configuración
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/OrderTracking.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/OrderTracking.jsx) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
* **Causa Raíz:**
  - En la sección de promoción de app móvil dentro del componente de seguimiento (`OrderTracking.jsx`), se utilizaba la variable inexistente `config.appPromo` en lugar de la variable correspondiente del store `appPromo`, lo que provocaba un error `ReferenceError: config is not defined` al intentar renderizar.
* **Solución Implementada:**
  - Se desestructuró de forma explícita la variable `appPromo` desde `useAppConfigStore` en la cabecera del componente.
  - Se reemplazaron todas las referencias a `config.appPromo` por `appPromo` a lo largo del archivo.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓).

### [2026-06-01] - Corrección: Importación de Sparkles en Ficha de Seguimiento del Cliente (OrderTracking)

* **Tipo:** Corrección de Bug / Consistencia de UI / Importaciones
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/OrderTracking.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/OrderTracking.jsx) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
* **Causa Raíz:**
  - Al cargar la página de seguimiento en un estado terminal (completado/cancelado), se intentaba renderizar el componente `<Sparkles />` de lucide-react para la sección de fidelización, pero no estaba listado en los imports de Lucide en la cabecera del archivo, lo que provocaba un error `ReferenceError: Sparkles is not defined`.
* **Solución Implementada:**
  - Se importó de forma explícita el icono `Sparkles` en el módulo de imports de `lucide-react` en `OrderTracking.jsx`.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓).

### [2026-06-01] - Corrección: Despliegue de Reglas de Seguridad de Firestore para Telemetría de Seguimiento

* **Tipo:** Seguridad / Reglas de Acceso / Base de Datos / Despliegue Firestore
* **Archivo(s) Modificado(s):**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [DEPLOY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
* **Causa Raíz:**
  - El nuevo panel de telemetría de seguimiento de pedidos en `AdminHome` arrojaba un error `FirebaseError: Missing or insufficient permissions` al intentar invocar `getDocs` en la colección `trackingAnalytics`. Esto se debía a que las reglas del servidor de producción de Firebase no estaban actualizadas y no incluían los permisos de lectura de analíticas para el rol de administrador.
* **Solución Implementada:**
  - Tras la autorización explícita del usuario, se ejecutó con éxito el comando `firebase deploy --only firestore:rules` para sincronizar y aplicar la regla local en producción.
  - Sincronización exitosa y confirmación del cese del error en caliente.

### [2026-06-01] - Corrección: ReferenceError de config en Dashboard Admin (AdminHome)

* **Tipo:** Corrección de Bug / Consistencia de JavaScript / UI
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminHome.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Tareas Pendientes\tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Tareas%20Pendientes/tareas_pendientes.md) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
* **Causa Raíz:**
  - En la sección "Resumen de Caja (Hoy)", se hacía referencia a `config.creditsEnabled` para controlar de forma condicional las vistas e indicadores de créditos de hoy, sin embargo, `config` no estaba declarada ni definida dentro del componente, lo que provocaba un ReferenceError en la renderización inicial del componente `<AdminHome>`.
* **Solución Implementada:**
  - Se corrigió el uso de `config.creditsEnabled` reemplazándolo por `creditsEnabled` (el cual es el valor correcto y ya se encuentra destructurado desde `useAppConfigStore` en el encabezado del componente).
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓).

### [2026-06-01] - Nueva Funcionalidad: Ecosistema Completo de Venta mediante Códigos QR de Productos

* **Tipo:** Nueva Funcionalidad / Ecommerce / Automatización de Ventas / Telemetría y Analíticas
* **Archivo(s) Creado(s) o Modificado(s):**
  - [`src/schemas/inventorySchemas.js`](file:///d:/Aplicaciones/App%20Ventas/src/schemas/inventorySchemas.js) [MODIFY]
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [MODIFY]
  - [`src/services/qrAnalyticsService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/qrAnalyticsService.js) [NEW]
  - [`src/components/admin/inventory/ProductFormModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]
  - [`src/pages/admin/AdminInventory.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]
  - [`src/pages/admin/AdminQRPerformance.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminQRPerformance.jsx) [NEW]
  - [`src/pages/client/ProductPublicDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [NEW]
  - [`src/routes/AppRoutes.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/routes/AppRoutes.jsx) [MODIFY]
  - [`src/pages/admin/AdminHome.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Tareas Pendientes\tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Tareas%20Pendientes/tareas_pendientes.md) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Estandar de Desarrollo\mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_aplicacion.md) [MODIFY]
* **Detalle Técnico:**
  - **Ampliación de Modelo Comercial:** Agregados campos avanzados de marketing y metadatos SEO en `inventorySchemas.js` (galería secundaria, imágenes por variante de color, videos multimedia, beneficios, especificaciones técnicas, información de soporte/garantía y artículos recomendados).
  - **Servicios de Telemetría asíncrona:** Creada la colección `qrAnalytics` y el servicio `qrAnalyticsService.js` para registrar eventos de escaneo, agregado al carrito y transiciones de compra completadas de manera eficiente.
  - **Gestión Avanzada en Admin:** Implementación de sección de marketing avanzada en `ProductFormModal.jsx` y visor/controlador de códigos QR con renderización client-side mediante `<canvas>` en `AdminInventory.jsx` (descarga PNG, copia, impresión y métricas locales rápidas).
  - **Portal Público Autónomo (`ProductPublicDetail.jsx`):** Vista responsiva optimizada de conversión comercial con cambio dinámico de imágenes por variante de color, carrito Zustand integrado, checkout simplificado, fallback inteligente para estados como agotado o descontinuado y validación horaria.
  - **Dashboard de Analíticas (`AdminQRPerformance.jsx`):** Panel interactivo con estadísticas completas y ranking de conversión para el monitoreo de ventas de códigos QR.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 1.03s, 0 errores).

### [2026-06-01] - Nueva Funcionalidad: Configuración Completa de Mesas (CRUD) en el Panel de Administrador

* **Tipo:** Nueva Funcionalidad / Logística / UI/UX
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Tareas Pendientes\tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Tareas%20Pendientes/tareas_pendientes.md) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
* **Detalle Técnico:**
  - **CRUD de Mesas Completo:** Se diseñó e implementó la sección interactiva `AdminTablesCRUD` en el panel de administración (`activeSubSection === 'mesas'`).
  - **Formulario Premium:** Administra las mesas físicas agregando Nombre/Identificador, Capacidad de personas, Ubicación/Zona y Notas u Observaciones especiales.
  - **Conexión en Tiempo Real:** Enlazada a la colección de Firestore `tables` usando `tableService.js` (creación, edición y borrado) con suscripción activa en tiempo real (`subscribeToTables`) en el listado para reflejar de inmediato los cambios y estados de mesa en salón.
  - **UX Coherente:** El botón de acceso rápido se inyectó en la grilla principal de personalización visual de la tienda (`activeSubSection === null`), permitiendo al administrador ir directamente a configurar la distribución física de mesas para el portal táctil del mesero.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 836ms).

### [2026-06-01] - Corrección de Seguridad: Validación y Auto-Egreso en Tiempo Real por Cambio de Rol de Empleados

* **Tipo:** Mejora de Seguridad / Sincronización en Tiempo Real / Firebase Firestore & Guards
* **Archivo(s) Modificado(s):**
  - [`src/components/portal/RequirePortalAuth.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/portal/RequirePortalAuth.jsx) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Tareas Pendientes\tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Tareas%20Pendientes/tareas_pendientes.md) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
* **Causa Raíz:**
  - Si un administrador editaba el perfil de un empleado activo en la base de datos para cambiar su rol de trabajo (por ejemplo, ascenderlo de "vendedor" a "cocinero"), la sesión local del portal operativo no detectaba este cambio dinámicamente y el empleado podía seguir operando el portal original sin restricciones. El cambio de rol del personal equivale a un cambio de funciones inmediatas, por lo cual debían ser bloqueados y expulsados instantáneamente del portal anterior para forzar una re-autenticación limpia bajo su nuevo perfil.
* **Solución Implementada:**
  - Se extendió el callback de suscripción en tiempo real (`onSnapshot`) sobre el documento del empleado en `RequirePortalAuth.jsx`.
  - Se implementó la verificación comparativa `empData.rol !== portalEmployee.rol`.
  - Si el rol de base de datos difiere del rol activo de la sesión local, el guard invalida la sesión de inmediato llamando a `clearPortalEmployee()`, destruye el estado local y redirige al empleado a la pantalla de autenticación `/portal/auth`.
  - **Corrección de Feature Flag:** Se corrigió un bug en los guards del portal (`RequirePortalAuth.jsx` y `PortalAuth.jsx`) que evaluaban la variable `rolesOperativosEnabled` (un toggle inactivo en la base de datos) en lugar de `hasMultipleEmployees` (el switch real de "Múltiples Empleados" configurado en el panel administrativo). Al cambiar al flag unificado, el portal operativo ya detecta correctamente el estado activo sin levantar la vista de bloqueo.
  - **Sincronización Inmediata de Stock en Bodega (`PortalBodega.jsx`):** Se corrigió un problema de inconsistencia en la UI del bodeguero donde, tras registrar con éxito un movimiento de stock (entrada, salida o ajuste) en Firestore, la vista mantenía las cantidades cacheadas desactualizadas. Se inyectó la sincronización reactiva local actualizando los estados `selectedProduct` y `selectedVariant` con los nuevos valores de stock en la fase de éxito de la mutación.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 785ms).

### [2026-06-01] - Refactorización: Alineación de Portales con Temas HSL, Filtración de Roles Activos y Centrado de Grillas

* **Tipo:** Refactorización de UI/UX / Diseño de Sistema / Optimización Responsiva
* **Archivo(s) Modificado(s):**
  - [`src/index.css`](file:///d:/Aplicaciones/App%20Ventas/src/index.css) [MODIFY]
  - [`src/layouts/PortalLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/PortalLayout.jsx) [MODIFY]
  - [`src/pages/portal/PortalAuth.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalAuth.jsx) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
* **Causa Raíz:**
  - Las pantallas de portales de empleados no estaban heredando las variables CSS de marca del tema corporativo configurado en la app (como el morado, esmeralda, etc.). Además, en la pantalla de inicio de sesión de empleados se listaban todos los roles operativos de la aplicación por defecto (incluso si no había ningún empleado registrado para esos portales). Y al filtrar o haber pocos portales habilitados, las tarjetas se alineaban de forma asimétrica hacia la izquierda.
* **Detalle Técnico:**
  - **Alineación de Temas HSL:** Modifiqué `PortalLayout.jsx` para extraer de forma reactiva y limpia los colores de la marca usando la constante `PORTAL_CONFIG` conectada al store. Migré el background y los botones de los portales en `index.css` para consumir las variables de la app (`var(--color-bg)`, `var(--color-surface)`, `var(--color-border)`, etc.), logrando que adopten perfectamente la paleta activa en modo claro o oscuro.
  - **Filtrado Dinámico de Portales:** Modifiqué `PortalAuth.jsx` para suscribirse en tiempo real a todo el listado de personal (`allDbEmployees`). En la pantalla de selección de portal (`role-select`), se filtran los botones de los roles y **únicamente se muestran aquellos portales que tienen al menos un empleado activo registrado**, previniendo pantallas de selección vacías.
  - **Centrado Dinámico de Tarjetas:** Refactoricé `.portal-auth-roles-grid` en `index.css` de CSS Grid a Flexbox responsivo con `justify-content: center` y un ancho fijo de botón (`width: 130px`). Esto garantiza que los botones de portal activos se ubiquen perfectamente alineados y equilibrados en el centro de la pantalla sin importar si es uno, dos o más roles.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 1.47s) y despliegue a hosting.s-smartfix.web.app`).

### [2026-06-01] - Corrección de Seguridad: Permisos de Consulta (List) de Cupones en Checkout

* **Tipo:** Corrección de Seguridad / Reglas de Acceso a Base de Datos / Firestore Rules
* **Archivo(s) Modificado(s):**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
* **Causa Raíz:**
  - Al abrir el carrito/drawer o intentar realizar la validación de cupones en el Checkout del cliente, la consola arrojaba un error de Firebase de tipo `[code=permission-denied]: Missing or insufficient permissions.` en el snapshot listener de `useCoupons`. Esto ocurría porque la regla `/coupons/{document}` únicamente permitía lecturas individuales (`allow read: if true;`) pero restringía las consultas de lista o listados (`allow list`) a administradores, impidiendo que el cliente público obtuviera los cupones activos.
* **Solución Implementada:**
  - Se expandió la regla de seguridad del catálogo de cupones para autorizar de forma explícita y segura las lecturas y listados públicos: `allow read, list: if true;`, manteniendo bloqueadas las mutaciones y borrados exclusivamente para administradores (`allow write, delete: if isAdmin();`).
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 1.37s).

### [2026-06-01] - Nueva Funcionalidad: Gestión de Empleados Completa (CRUD) y Nómina en AdminSettings

* **Tipo:** Nueva Funcionalidad / Logística / UI/UX / Seguridad Ecosistema
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Tareas Pendientes\tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Tareas%20Pendientes/tareas_pendientes.md) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
* **Detalle Técnico:**
  - **CRUD Completo:** Se reemplazó el obsoleto listado de nombres y la cuadrícula estática basada en cantidad por un panel completo de administración de personal con listado interactivo a doble columna (7/5 grid).
  - **Formulario Premium (`EmployeeFormCard`):** Formulario robusto con campos obligatorios validados (Nombre, Rol Operativo, PIN de 4-6 dígitos numéricos, WhatsApp, Salario, Frecuencia y Próxima Fecha de Pago con `CustomDatePicker`).
  - **Acciones y Persistencia:** Conectadas las acciones en caliente al `employeeService` de Firestore (`saveEmployee`, `deleteEmployee`, `toggleEmployeeStatus`). Se sincroniza en tiempo real al cambiar estados, crear o actualizar perfiles de empleado, y se limpian los estados locales/globales al concluir.
  - **Visualización Condicional de QRs:** El listado y descarga de códigos QR operativos se renderizan reactivamente únicamente cuando el switch global de "Múltiples Empleados" está habilitado y hay personal activo.
  - Verificado mediante compilación de producción exitosa (`npm run build` ✓ 801ms).

### [2026-06-01] - Nueva Funcionalidad: Sistema de Acceso mediante Códigos QR para Empleados (Fase 3)

* **Tipo:** Nueva Funcionalidad / Logística / Autenticación / Seguridad Ecosistema
* **Archivos Creados (NEW):**
  - [`src/services/accessLogService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/accessLogService.js)
  - [`src/pages/admin/AdminPortalQR.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminPortalQR.jsx)
* **Archivos Modificados (MODIFY):**
  - [`src/constants/index.js`](file:///d:/Aplicaciones/App%20Ventas/src/constants/index.js)
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules)
  - [`src/store/portalStore.js`](file:///d:/Aplicaciones/App%20Ventas/src/store/portalStore.js)
  - [`src/pages/portal/PortalAuth.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalAuth.jsx)
  - [`src/layouts/PortalLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/PortalLayout.jsx)
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
  - [`src/layouts/AdminLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/AdminLayout.jsx)
  - [`src/index.css`](file:///d:/Aplicaciones/App%20Ventas/src/index.css)
* **Detalle Técnico:**
  - **Firestore Rules:** Se agregó la colección `/accessLogs/{logId}` con reglas de lectura exclusiva para administradores y creación/actualización pública para registrar entradas y salidas de turnos.
  - **Soporte de Logs de Acceso:** Se creó `accessLogService.js` para persistir inicios y cierres de sesión de empleados con control de desconexión implícita (cierre de sesión del portal).
  - **Flujo de Lobby Portales (QR Entrypoint):** Se rediseñó `PortalAuth.jsx` para admitir el parámetro URL `?rol=`. Si se decteta un rol pre-filtrado por QR, se omite el listado de roles y se presenta directamente la pre-selección de empleados aptos para dicho rol junto con el teclado PIN táctil seguro de 4 a 6 dígitos.
  - **Integración de QR en Ajustes de Personal:** Se insertó la generación client-side interactiva de códigos QR por rol (usando la librería `qrcode` sobre `<canvas>` con descargas PNG, copiado e impresión) **exclusivamente dentro de la subsección Gestión de Personal de AdminSettings.jsx bajo la condición de que el switch "Múltiples Empleados" esté activo**. Si se desactiva, el panel QR no se renderiza. Se removió el menú redundante del sidebar en `AdminLayout.jsx`.
* **Estatus:** ✅ Build exitoso — 737ms, 0 errores.us:** ✅ Build exitoso — 1.20s, 0 errores.

### [2026-06-01] - Nueva Funcionalidad: Sistema de Roles Operativos y Portales de Empleados (Fases 1 y 2)

* **Tipo:** Nueva Funcionalidad / Arquitectura Ecosistema / Autenticación por PIN / Portales Operativos
* **Archivos Creados (NEW):**
  - [`src/services/tableService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/tableService.js)
  - [`src/services/deliveryService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/deliveryService.js)
  - [`src/services/stockMovementService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/stockMovementService.js)
  - [`src/store/portalStore.js`](file:///d:/Aplicaciones/App%20Ventas/src/store/portalStore.js)
  - [`src/layouts/PortalLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/PortalLayout.jsx)
  - [`src/pages/portal/PortalAuth.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalAuth.jsx)
  - [`src/components/portal/RequirePortalAuth.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/portal/RequirePortalAuth.jsx)
  - [`src/pages/portal/PortalVendedor.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalVendedor.jsx)
  - [`src/pages/portal/PortalCocina.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalCocina.jsx)
  - [`src/pages/portal/PortalBodega.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalBodega.jsx)
  - [`src/pages/portal/PortalMesero.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalMesero.jsx)
  - [`src/pages/portal/PortalMensajero.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalMensajero.jsx)
* **Archivos Modificados (MODIFY):**
  - [`src/constants/index.js`](file:///d:/Aplicaciones/App%20Ventas/src/constants/index.js)
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules)
  - [`src/store/appConfigStore.js`](file:///d:/Aplicaciones/App%20Ventas/src/store/appConfigStore.js)
  - [`src/services/employeeService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/employeeService.js)
  - [`src/services/productionService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/productionService.js)
  - [`src/routes/AppRoutes.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/routes/AppRoutes.jsx)
  - [`src/index.css`](file:///d:/Aplicaciones/App%20Ventas/src/index.css)
* **Detalle Técnico:**
  - **Infraestructura (Fase 1):** Se extendió el esquema de datos con 5 nuevas colecciones Firestore (`employees`, `tables`, `production`, `deliveries`, `stockMovements`). Se añadieron roles operativos a `constants/index.js`. Se crearon servicios atómicos con suscripciones en tiempo real para mesas, domicilios, producción y movimientos de stock. Se añadió el flag `rolesOperativosEnabled` con persistencia en Zustand.
  - **Portales (Fase 2):** Sistema de autenticación dual independiente. `portalStore.js` gestiona la sesión de empleado por PIN sin interferir con Firebase Auth. `PortalAuth.jsx` implementa un teclado PIN táctil premium (glassmorphism oscuro). `RequirePortalAuth.jsx` actúa como guard que valida rol y sesión activa.
  - **Portal Vendedor:** POS completo con búsqueda de catálogo, filtro por categorías, carrito con cantidades, búsqueda de cliente por teléfono, registro de cliente nuevo, selección de método de pago (efectivo/transferencia/crédito/cortesía) y finalización con registro en Firestore.
  - **Portal Cocina:** Kanban de dos columnas (pendiente → preparando → listo) con suscripción RT. Actualización de estado con un toque. Timer visual por orden.
  - **Portal Bodega:** Selector de productos con buscador, formulario de movimiento (entrada/salida/ajuste/descarte), variantes, observaciones y registro en `stockMovements`.
  - **Portal Mesero:** Mapa de mesas en tiempo real con indicadores de color por estado (disponible/ocupada/solicitando_cuenta). Bottom sheet de acciones por mesa.
  - **Portal Mensajero:** Lista de domicilios asignados con avance de estado, llamada directa al cliente y reporte de fallo de entrega.
  - **Rutas:** `/portal/auth` (pública) y `/portal/:rol` (protegidas por `RequirePortalAuth` con verificación de rol).
  - **CSS:** Añadidas ~750 líneas de estilos para el ecosistema de portales en `index.css` (layout, auth, vendedor, cocina, bodega, mesero, mensajero).
* **Estatus:** ✅ Build exitoso — 1.22s, 0 errores.

### [2026-06-01] - Sincronización y Reubicación de Módulos sin Pérdida de Funcionalidad


* **Tipo:** Reorganización de UI / Refactorización de Arquitectura / Sincronización Documental (Reglas Integridad)
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Tareas Pendientes\tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Tareas%20Pendientes/tareas_pendientes.md) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
* **Detalle Técnico:**
  - **Recuperación y Reubicación Completa:** Se restauraron al 100% de su capacidad operativa y visual los formularios de **Gestión de Personal (`empleados`)** y **Eventos por Temporada (`temporada`)**, los cuales habían sido omitidos accidentalmente al reestructurar la interfaz.
  - **Ubicación en Nivel 2 (Herramientas Administrativas):** Se configuraron `empleados` y `temporada` como vistas directas de primer nivel dentro del menú jerárquico de Nivel 2, permitiendo que sus formularios se rendericen directamente al seleccionar su categoría en la cuadrícula superior.
  - **Ubicación en Nivel 3 (Herramientas de Desarrollador):** Se trasladaron exitosamente los formularios de **Métodos de Entrega (`entregas`)**, **Ventas al por Mayor (`mayorista`)**, **Garantías y Reclamos (`garantias`)** y **Seguimiento de Pedidos (`seguimiento`)** como subsecciones protegidas bajo la contraseña maestra del desarrollador en el Nivel 3, garantizando que no se elimine ninguna funcionalidad original de la aplicación.
  - Verificado mediante compilación local con éxito completo (`npm run build` ✓ 1.14s, 0 errores).
* **Estatus:** ✅ Completado, compilado y sincronizado documentalmente.

### [2026-06-01] - Auditoría y Reorganización del Panel Administrativo en 5 Niveles (Fase de Código y Limpieza)

* **Tipo:** Reorganización de UI / Limpieza de Código / Refactorización de Arquitectura / Seguridad Ecosistema
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Tareas Pendientes\tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Tareas%20Pendientes/tareas_pendientes.md) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Estandar de Desarrollo\mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_documentacion_ia.md) [MODIFY]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Especificaciones y Auditoria de Producto\bitacora_cambios.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Especificaciones%20y%20Auditoria%20de%20Producto/bitacora_cambios.md) [MODIFY]
* **Detalle Técnico:**
  - Se reestructuró por completo la interfaz del panel de configuraciones en `AdminSettings.jsx` utilizando una navegación de 5 niveles jerárquicos de tarjetas.
  - **Bug Fix 1 (Laboratorio):** Se corrigió la redirección fallida al panel de órdenes cuando se hacía clic en la sección Nivel 4: Laboratorio, implementando un submenú modular interactivo.
  - **Refactorización de Protección de Desarrollo (Nivel 3):**
    - Se retiraron del apartado Nivel 1 (Personalizar Tienda) las secciones: **Métodos de Entrega**, **Ventas al por Mayor**, **Garantías y Reclamos** y **Seguimiento de Pedidos**.
    - Estas 4 secciones se trasladaron en su totalidad bajo control de contraseña de desarrollador a la sección Nivel 3: Panel Maestro como subsecciones protegidas.
    - Se ajustaron dinámicamente el listado visual del menú de desarrollador y las condiciones de resolución de los títulos y descripciones de cabecera en el componente settings para evitar inconsistencias visuales.
  - **Limpieza de Código:** Se eliminó por completo el bloque render redundante de `activeSubSection === 'modulos'` en la sección de Nivel 1 para evitar duplicidad de estados y lógica muerta.
  - Verificado mediante compilación local con éxito completo (`npm run build` ✓ 1.19s, 0 errores).
* **Estatus:** ✅ Completado, compilado y sincronizado documentalmente.

### [2026-06-01] - Fix: Banner deslizable de confirmación al guardar costo de domicilio + Detalle de entrega en tarjeta del cliente

* **Tipo:** Fix Funcional + Mejora UI/UX
* **Archivos Modificados:**
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]
  - [`src/pages/client/ClientOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientOrders.jsx) [MODIFY]
* **Causa Raíz:**
  1. El botón "Guardar" del costo de domicilio en `AdminOrders` no mostraba ninguna confirmación visual al guardarse, porque el estado `savedPriceModal` estaba declarado pero nunca renderizado en el JSX.
  2. La tarjeta del cliente en `ClientOrders` no mostraba el tipo de entrega (domicilio/retiro) en la vista colapsada, ni el detalle de dirección/costo en el panel expandido.
* **Detalle Técnico:**
  - **AdminOrders.jsx:** Se añadió el banner `savedPriceModal` usando `AnimatePresence + motion.div` con animación `spring` desde `y: 120` (entrada desde abajo). El banner muestra ícono `CheckCircle`, número de pedido y costo formateado. Se auto-cierra a los 2.8s mediante `setTimeout` disparado en `onAnimationComplete`. El usuario también puede cerrarlo manualmente con el botón `X`.
  - **ClientOrders.jsx (tarjeta colapsada):** Se añadieron dos píldoras de estado bajo el conteo de productos: método de pago y tipo de entrega (`🛵 Domicilio · +$X.XXX` / `🏪 Retiro en tienda`). El costo de envío solo aparece en la píldora si ya fue asignado (`costoEnvio > 0`).
  - **ClientOrders.jsx (panel expandido):** Se insertó un bloque `Detalle de Entrega` con tarjeta propia (`rounded-2xl border border-app`) que muestra la dirección, barrio/ciudad y costo de envío. Si el domicilio no tiene costo asignado aún, muestra texto informativo en cursiva. Se ubica antes de la sección de Productos para máxima visibilidad.
* **Estatus:** ✅ Build exitoso (`npm run build` — 875ms, 0 errores).

### [2026-06-01] - Nueva Funcionalidad: Valor del Domicilio Editable en Tarjeta de Pedidos del Admin

* **Tipo:** Nueva Funcionalidad / Logística / Base de Datos
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]
* **Causa Raíz:**
  - El administrador necesitaba asignar y actualizar de forma flexible el costo de envío (`costoEnvio`) de los domicilios de manera individual en cada pedido, ya que las tarifas varían según la distancia.
* **Detalle Técnico:**
  - Se implementó un panel interactivo dentro de la tarjeta expandida de pedidos (`AdminOrders.jsx`) que renderiza un campo de entrada numérico (`input type="number"`) para modificar el valor del domicilio.
  - Este panel es condicional: solo se muestra si el pedido es de tipo `domicilio` y el método de entrega de domicilio está habilitado globalmente en la configuración del negocio (`deliverySettings.shipping.enabled`).
  - Al perder el foco (`onBlur`), se actualiza de manera atómica en Firestore el campo `costoEnvio` del pedido y se recalcula el `total` general de la orden basándose en la diferencia de costos.
  - Soportado por las importaciones de base de datos (`db`), referencias de documentos (`doc`, `updateDoc`) y marcas de tiempo del servidor (`serverTimestamp`).
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓).

### [2026-06-01] - Fix UI: Corrección de Ícono y Diseño del Botón WhatsApp en CheckoutModal
* **Tipo:** Corrección UI/UX
* **Archivo(s) Modificado(s):**
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
* **Causa Raíz:**
  - El botón "Avisar por WhatsApp" del paso 4 (confirmación de pedido) usaba un SVG de tipo `stroke` (bocadillo de chat de Heroicons) en lugar del logo oficial de WhatsApp. Además, la altura era insuficiente (`h-11`), el texto pequeño (`text-xs`) y el botón "Cerrar" usaba colores hardcoded no temáticos (`bg-white`, `text-neutral-800`, `border-neutral-300`) incompatibles con el modo oscuro.
* **Detalle Técnico:**
  - Reemplazado el SVG del bocadillo de chat por el **logo oficial de WhatsApp** (viewBox 32×32, path de fill único).
  - Animación del ícono cambiada de `rotate` (oscilación) a `translateY` (bounce suave) para mayor sutileza visual.
  - Altura de ambos botones elevada a `h-14` para mayor área de toque en mobile, texto a `text-sm`.
  - Botón "Cerrar" migrado a tokens de diseño temáticos (`bg-surface-2`, `text-app`, `border-app`), compatibles con modo oscuro y claro.
  - Ambos botones usan `flex-1` (en lugar de `w-1/2`) para distribución uniforme, y `rounded-2xl` para coherencia visual con el resto del modal.
  - Clases de animación renombradas a `.wa-btn` / `.wa-icon` para evitar conflictos CSS globales.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓ 949ms).

### [2026-06-01] - Nueva Funcionalidad: Gestión Inteligente de Direcciones y Mapas Gratuitos con Leaflet y OpenStreetMap (Nominatim)
* **Tipo:** Nueva Funcionalidad / Logística / UI/UX
* **Archivo(s) Modificado(s) / Creado(s):**
  - [`src/components/ui/LeafletMapPicker.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/LeafletMapPicker.jsx) [NEW]
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [MODIFY]
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]
* **Detalle Técnico:**
  - **Componente LeafletMapPicker:** Se desarrolló un visor y selector de ubicación interactivo utilizando la librería Open-Source **Leaflet** y tiles de **OpenStreetMap**, lo que elimina por completo cualquier costo de API comercial (Google Maps).
  - **Geocodificación Nominatim:** Se integró Nominatim API para resolver en tiempo real texto a coordenadas (Forward Geocoding) y coordenadas a dirección exacta, barrio y ciudad al hacer clic o arrastrar el marcador (Reverse Geocoding) en caliente.
  - **Autocompletado en Checkout:** En el proceso de compra multipaso, al elegir entrega a domicilio, se inyecta el mapa en el paso 2, autocompletando instantáneamente los campos de Dirección, Barrio y Ciudad. El payload del pedido en Firebase ahora almacena atómicamente el objeto `coords: { lat, lng }`.
  - **Visor en AdminOrders:** En el panel administrativo, las tarjetas de pedidos a domicilio muestran de forma inline el mapa en modo de solo lectura (`readOnly={true}`) con el pin en la ubicación física exacta ingresada por el cliente, junto con acciones rápidas para abrir la ruta en la app externa de Google Maps.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓ 854ms).

### [2026-06-01] - Restauración Crítica: Sección de Empleados Completa + Toggle Ajustes de Inventario en AdminSettings
* **Tipo:** Corrección Crítica / Restauración de Módulo / Regresión tras reversión de Git
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Causa Raíz:**
  - Tras una reversión accidental del repositorio a una versión antigua de GitHub, la sección de configuración de empleados quedó con un modelo de datos obsoleto (`string[]` solo con nombres), incompatible con el modelo de objetos estructurados (`object[]` con `{id, name, pin, role, salario, frecuenciaPago, fechaPago}`) que consume `EmployeePortal.jsx`. Adicionalmente, faltaba la sección de `pagosFijos` (historial de nómina) y el toggle de `inventoryAdjustmentsEnabled`.
* **Detalle Técnico:**
  - **Sección Empleados refactorizada (IIFE):** La sección `activeSubSection === 'empleados'` se convirtió a una función auto-ejecutada (`IIFE`) que declara helpers locales (`structuredEmps`, `updateEmp`, `addEmp`, `removeEmp`, `pagosFijos`, `addPago`, `updatePago`, `removePago`) para operar sobre el estado sin contaminar el scope del componente.
  - **Modelo de objeto estructurado:** Cada empleado ahora se edita con los campos `name` (obligatorio), `pin` (4 dígitos, solo numérico), `role` (`vendedor` / `cocina` / `domiciliario`), `salario`, `frecuenciaPago` (`dia`/`semana`/`mes`) y `fechaPago`. La migración transparente de strings legacy a objetos ocurre via el helper `structuredEmps`.
  - **Sección pagosFijos:** Se añadió un panel completo de Historial de Pagos (Nómina) dentro de la misma sección de empleados, permitiendo crear, vincular (via `employeeId`), editar y eliminar registros de pago que los empleados pueden descargar en PDF desde su Portal.
  - **Toggle inventoryAdjustmentsEnabled:** Se agregó el switch "Módulo de Ajustes de Inventario" en `activeSubSection === 'modulos'`, con su campo en el `formData` inicial, en el `useEffect` de sincronización, en el array de dependencias y en el payload del botón Guardar.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓ 1.22s).

### [2026-06-01] - Corrección: Botón de descarga de PWA en Perfil de Cliente
* **Tipo:** Corrección de UI/UX / PWA
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientProfile.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientProfile.jsx)
* **Detalle Técnico:**
  - **Fallback de Instalación:** Se acopló el disparador de fallback con alertas nativas personalizadas cuando `beforeinstallprompt` no ha disparado (debido a limitaciones de navegadores de escritorio, Safari/iOS, o bloqueo de heurística). Si `rawInstallable` es falso, el botón ofrece un diálogo interactivo guiado explicando cómo realizar la instalación manual según el dispositivo del usuario.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓).

### [2026-06-01] - Corrección: Persistencia de Efecto Glow en Promociones Customizadas
* **Tipo:** Corrección de Lógica / Base de Datos
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Detalle Técnico:**
  - **Inyección en Payload Custom:** Se inyectó la propiedad `glowEffect` en la rama del `else` (promociones de tipo `custom`) en la función `handleSaveAd`. Esto corrige el bug por el cual el efecto visual de brillo no se persistía en Firestore y se mostraba desactivado al intentar editar promociones personalizadas.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓).

### [2026-06-01] - Implementación: Paginación de Historial de Compras en Ficha del Cliente
* **Tipo:** Nueva Característica / UI/UX / Paginación
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Detalle Técnico:**
  - **Paginación en Drawer:** Se limitó el historial de compras visible en la ficha de expediente del cliente a un máximo de 10 pedidos por página.
  - **Componente Reutilizable:** Se integró el componente unificado `<Pagination />` en la parte inferior del historial en el Drawer deslizante del cliente, permitiendo navegar de forma paginada sobre todas sus compras históricas. Se inicializa el índice de página a 1 cada vez que se selecciona un nuevo cliente de la tabla.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓).

### [2026-06-01] - Corrección: Optimización de Botones de Guardado en Configuración (AdminSettings)
* **Tipo:** Corrección de UI/UX / Optimización Responsiva
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Detalle Técnico:**
  - **Simplificación de Etiquetas:** Se abreviaron las etiquetas excesivamente largas de los botones de guardado en los formularios de configuración administrativa para evitar el desborde y saltos de línea innecesarios en pantallas móviles estrechas.
  - **Alineación de Iconos:** Se inyectó la clase `shrink-0` a los iconos SVG `<Save />` en los botones modificados. Esto asegura que permanezcan agrupados y correctamente centrados junto al texto descriptivo, impidiendo que el motor de flexbox los desplace hacia los bordes de la tarjeta del botón al producirse un salto de línea.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓).

### [2026-06-01] - Corrección: Centrado de DatePicker y Backdrop en Pantallas de Dispositivos Móviles y Escritorio
* **Tipo:** Corrección de UI/UX / Portales de React
* **Archivo(s) Modificado(s):**
  - [`src/components/ui/DatePicker.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/DatePicker.jsx)
* **Detalle Técnico:**
  - **Uso de Portales de React:** Se refactorizó la visualización del dropdown del calendario en `DatePicker.jsx` para utilizar `ReactDOM.createPortal` inyectándolo directamente en `document.body`.
  - **Diseño de Modal Centrado:** Se le incorporó un fondo oscuro translúcido con desenfoque (`backdrop-blur-[2px]`) que cubre toda la pantalla y captura eventos de click para el cierre automático. El contenedor del calendario se reestructuró con posicionamiento `fixed` centrado en el medio de la pantalla del dispositivo, eliminando los recortes de layout (clipping) y asegurando consistencia visual con los demás calendarios de la aplicación.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓).

### [2026-06-01] - Implementación: Fichas de Expedientes, Segmentación de Clientes y Recibos de Nómina en PDF
* **Tipo:** Nueva Característica / Finanzas / Personal y Clientes
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
  - [`src/pages/EmployeePortal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/EmployeePortal.jsx)
  - [`src/components/client/coupons/ClientCouponsModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/coupons/ClientCouponsModal.jsx)
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx)
  - [`src/services/couponService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/couponService.js)
* **Detalle Técnico:**
  - **Fichas/Drawers Deslizantes:** Se crearon Drawers deslizantes responsivos animados con Framer Motion para los expedientes del Cliente y del Empleado. La ficha de cliente incluye métricas de ticket promedio, frecuencia de compra, días desde la última compra, direcciones geográficas en mapa e historial detallado de pedidos. La ficha de empleado expone sus salarios, PIN, frecuencia de pago y el listado histórico de nóminas pagadas y pedidos procesados.
  - **Segmentación de Clientes:** Añadido filtrado rápido de comportamiento por chips (Todos, VIP - top 5, Inactivos > 30 días, Nuevos <= 15 días).
  - **Cruce de Nómina y Egresos:** Al registrar un pago de tipo nómina en egresos, se asocia y guarda de forma permanente el `employeeId` seleccionado para cruzar los datos del empleado.
  - **Colillas de Pago en PDF:** En `EmployeePortal.jsx`, se implementó un centro de descarga de colillas de nómina que genera y descarga archivos PDF profesionales usando `jsPDF` con desglose de conceptos del mes actual o históricos por mes/año.
  - **Personalización de Cupones:** Soportados los campos `celularCliente` y `motivo` en la base de datos Firestore y modales del cliente para mostrar ofertas exclusivas personalizadas con dedicatorias individuales.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓).

### [2026-06-01] - Corrección: Advertencia de React por Spread Key en AdminSettings
* **Tipo:** Corrección de Bug / Consistencia de React
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Detalle Técnico:**
  - Se eliminó el warning en consola: *"React keys must be passed directly to JSX without using spread"*. Se removió la propiedad `key` de `containerProps` (que se esparcía en el componente dinámico `<ContainerComponent>`) y se pasó directamente como `key={isMobile ? (activeSection ?? 'menu') : undefined}`.
* **Estatus:** ✅ Completado y validado.

### [2026-05-31] - Optimización: Selector de Regalos por Portal y Gestión de Clientes Estrella
* **Tipo:** Corrección de Interfaz / Optimización de UI/UX / Paginación y Filtrado
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Detalle Técnico:**
  - **CustomSelect con Portal:** Se refactorizó la lógica del componente `<CustomSelect>` para calcular la posición física del elemento disparador mediante `getBoundingClientRect` y proyectar la lista desplegable de opciones de productos/variantes usando `ReactDOM.createPortal` directamente sobre el cuerpo del documento (`document.body`). Esto previene que contenedores con `overflow-y-auto` y `overflow-hidden` del modal de fidelización recorten y oculten el menú de opciones desplegable. Adicionalmente, cuenta con soporte contra opciones vacías y un listener para cerrar el dropdown en caso de scroll.
  - **Cálculo de Stock para Productos Simples:** Corregido un bug crítico de filtrado donde los productos simples se omitían por completo (quedando la lista de opciones vacía) debido a la ausencia de la propiedad `tieneVariantes` y de stock en la raíz de su documento en Firestore. Ahora el stock total se computa de manera robusta sumando el stock en el array `variantes` para todo tipo de producto, y si es un producto sin variaciones talla/color, el sistema selecciona automáticamente la variante única por defecto al elegir el producto.
  - **Buscador de Clientes:** Se integró un buscador interactivo que filtra de manera reactiva por coincidencia parcial de nombre o número telefónico, reiniciando la página actual a 1 para asegurar la consistencia del listado.
  - **Paginación y Compactación:** Se incrementó la paginación a un total de 30 elementos por página para optimizar lecturas e interacciones. Adicionalmente, se rediseñaron los espaciados, paddings y tamaños de los avatares en la tabla de ranking de compras para lograr una visualización extremadamente compacta, ordenada y legible en pantallas de cualquier tamaño.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓).

### [2026-05-31] - Implementación: Selector de Fecha CustomDatePicker (Gestión de Nóminas y Gastos)
* **Tipo:** Mejora de UI/UX / Componente Atómico / Estandarización de Marca
* **Archivo(s) Modificado(s):**
  - [`src/components/ui/DatePicker.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/DatePicker.jsx) [NEW]
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Detalle Técnico:**
  - **Componente DatePicker:** Se desarrolló desde cero un selector de fecha interactivo (`DatePicker.jsx`) con un diseño alineado a la marca. Reemplaza el selector nativo de HTML que presentaba problemas estéticos en distintos navegadores.
  - **Navegación e Interactividad:** Incorpora controles de cambio de mes rápido, atajos para restablecer a "Borrar" u "Hoy" y animaciones fluidas con `Framer Motion`. Cuenta con listener en fase de captura para cierre al clicar fuera.
  - **Integración:** Se acopló en `AdminSettings.jsx` reemplazando los inputs nativos tipo `date` para el campo "Próximo Pago" de nómina de empleados y "Fecha de Vencimiento" de los Pagos Fijos.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓).

### [2026-05-31] - Rediseño Responsivo: Layout de Categorías en PC y Móvil
* **Tipo:** Refactorización de UI/UX / Optimización Responsiva
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientCatalog.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCatalog.jsx)
* **Detalle Técnico:**
  - **Categorías Adaptativas:** Se refactorizó la visualización de las categorías del catálogo del cliente. En dispositivos móviles, mantiene la visualización clásica y compacta de cuadrícula (`grid grid-cols-4 gap-2`) con tarjetas de proporción `aspect-square`.
  - **Diseño Desktop Premium:** En pantallas medianas y grandes (PC/Escritorio), la cuadrícula se transforma dinámicamente en una fila de botones tipo chips horizontales autogestionados (`sm:flex sm:flex-wrap sm:gap-3`), desactivando el `aspect-square` y alineando el icono a la izquierda del texto en un contenedor estilizado de altura y ancho dinámicos.
  - **Optimización de Espacio:** Se eliminó la paginación/truncamiento de categorías en PC, mostrando la totalidad de categorías creadas por el administrador al lado de la tarjeta "Todos" mediante clases condicionales CSS combinadas con el estado de expansión de móvil.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓).

### [2026-05-31] - Refactorización de Diseño: Estandarización de Temas HSL y Tokenización de Modales
* **Tipo:** Refactorización de UI/UX / Diseño de Sistema / Corrección de Contraste
* **Archivo(s) Modificado(s):**
  - [`src/index.css`](file:///d:/Aplicaciones/App%20Ventas/src/index.css)
  - [`src/components/common/ModalTemplate.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/common/ModalTemplate.jsx)
  - [`src/components/client/catalog/ProductDetailModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx)
* **Detalle Técnico:**
  - **Corrección de Selectores del Tema:** Se corrigió un error de sintaxis en `index.css` donde los selectores `.dark [data-theme="..."]` contenían un espacio de descendencia, lo que impedía que las variables CSS oscuras se aplicaran al nodo raíz `<html>` (que contiene ambas clases al mismo tiempo). Se unificó eliminando el espacio (`.dark[data-theme="..."]`).
  - **Soporte de Variante Dark en Tailwind v4:** Se inyectó la regla `@variant dark (&:where(.dark, .dark *))` al inicio de `index.css` para forzar a Tailwind v4 a resolver las clases con prefijo `dark:` usando selectores de clase CSS de la aplicación en lugar de guiarse únicamente por la configuración multimedia del sistema operativo.
  - **Refactorización de Modales a Tokens:** Se reemplazaron todas las clases de colores hardcodeados de Tailwind (ej. `bg-white`, `dark:bg-gray-900`, `text-gray-500`, `text-gray-900`) en `ModalTemplate.jsx` y `ProductDetailModal.jsx` por tokens semánticos del sistema (ej. `bg-surface`, `bg-surface-2`, `text-app`, `text-muted`, `border-app`). Esto asegura que los elementos como descripciones, selectores de cantidad, bordes y botones hereden perfectamente y con máximo contraste el color de la paleta activa (sea Verde, Morado, Azul, Rosa, etc.) tanto en modo claro como oscuro.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓).

### [2026-05-31] - Nueva Característica: Métricas de Rendimiento Diario por Empleado en Lobby y Paneles
* **Tipo:** Nueva Funcionalidad / Personal y Análisis de Rendimiento
* **Archivo(s) Modificado(s):**
  - [`src/pages/EmployeePortal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/EmployeePortal.jsx)
  - [`src/pages/KitchenPanel.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/KitchenPanel.jsx)
  - [`src/pages/admin/AdminSales.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSales.jsx)
* **Detalle Técnico:**
  - **Métricas en Lobby de Ingreso:** Se inyectó la lógica de consulta agrupada en `EmployeePortal.jsx` (Paso 3) para calcular las estadísticas diarias del empleado antes de redireccionar. Dependiendo del rol, muestra la cantidad de pedidos y los montos vendidos/recaudados (para ventas y repartidores).
  - **Indicador en Tiempo Real de Cocina:** Se creó una consulta y escucha en tiempo real (`onSnapshot`) de los pedidos marcados como listos hoy, desplegándose en una píldora dentro de la cabecera de `KitchenPanel.jsx` (*"Hoy: X listos"*).
  - **Widget de Ventas POS:** Se enlazaron las transacciones de ventas de hoy para el vendedor autenticado en `AdminSales.jsx` mediante un listener dedicado, mostrando un badge en tiempo real de sus ventas totales (*"Tus Ventas de Hoy: X ($Y)"*).
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓).

### [2026-05-31] - Nueva Característica: Configuración de Salarios de Empleados, Portal Informativo e Integración con Pagos Fijos
* **Tipo:** Nueva Funcionalidad / Personal y Finanzas
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
  - [`src/pages/EmployeePortal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/EmployeePortal.jsx)
* **Detalle Técnico:**
  - **Configuración de Empleados:** Se agregaron tres nuevos campos opcionales (`salario`, `frecuenciaPago` y `fechaPago`) a cada objeto de empleado gestionado en `AdminSettings.jsx`.
  - **Lobby Informativo del Empleado:** Se modificó `EmployeePortal.jsx` agregando una pantalla intermedia (Lobby de Bienvenida `step === 3`) que se muestra tras una validación exitosa de PIN. Allí el empleado visualiza el monto de su pago, la frecuencia ("Por Día", "Por Semana", "Por Mes") y la próxima fecha de pago programada antes de acceder al panel de operaciones.
  - **Autocompletado en Pagos Fijos:** En el formulario de registro de Gastos y Pagos Fijos, al seleccionar el tipo de gasto "Pago de Nómina" y contar con empleados configurados, se habilita una barra de autocompletado rápido para cargar automáticamente el concepto, monto y fecha basándose en la configuración salarial del empleado.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓).

### [2026-05-31] - Nueva Característica: Módulo de Gestión de Pagos Fijos y Conciliación de Balance Real
* **Tipo:** Nueva Funcionalidad / Finanzas y Contabilidad
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
  - [`src/pages/admin/AdminSalesDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx)
  - [`src/store/appConfigStore.js`](file:///d:/Aplicaciones/App%20Ventas/src/store/appConfigStore.js)
  - [`src/services/appConfigService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/appConfigService.js)
* **Detalle Técnico:**
  - **Estructura Intermedia de Ajustes:** Se reestructuró la sección de "Herramientas de Administrador" para actuar como un selector intermedio con dos tarjetas en lugar de desplegarse directamente.
  - **Módulo de Pagos Fijos:** Se creó la interfaz interactiva para listar, registrar, togglear estado de pago y eliminar gastos fijos del mes.
  - **Concepto Condicional de Nómina:** La opción "Pago de Nómina" se expone en la lista de tipos únicamente si el administrador tiene habilitada la opción de múltiples empleados (`formData.hasMultipleEmployees`).
  - **Deducción de Gastos Fijos (Caja Neta Real):** En `AdminSalesDetail.jsx` se leen los egresos guardados en la configuración, filtrándolos dinámicamente por el rango de fechas de consulta y restándolos del total comercial facturado para calcular e informar la **Caja Neta Real (Ganancia Neta)**.
  - **Protección Comisional:** Los egresos operativos fijos y nóminas no alteran la sumatoria de las ventas brutas completadas del mes, blindando la base del cálculo del comisionamiento del desarrollador.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build` ✓).

### [2026-05-31] - Nueva Característica: Módulo de Gestión de Clientes en Panel de Administración
* **Tipo:** Nueva Funcionalidad / Fidelización y Clientes
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
  - [`src/pages/admin/AdminSales.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSales.jsx)
* **Detalle Técnico:**
  - **Estructura y Pestañas:** Se añadió una nueva tarjeta de entrada **Gestión de Clientes** en la sección de "Personalizar Tienda" (`activeSubSection === 'clientes'`).
  - **Agrupamiento de Datos:** El módulo agrupa en tiempo real en memoria los pedidos en estado `COMPLETED` agrupados por el celular del cliente. Esto evita lecturas costosas de base de datos y calcula el total de compras concretadas y número de pedidos.
  - **Ranking de Compras:** Lista de clientes ordenada de forma descendente por dinero acumulado.
  - **Paginación Premium:** Incorpora paginado local de 20 clientes por página mediante el componente unificado `<Pagination />`.
  - **Fidelización (Obsequios):** Añade un modal popup que lista el inventario disponible de productos y variantes (tallas/colores). Al seleccionar uno, genera una transacción atómica mediante `createPhysicalOrder` con `isAjuste: true` y `subtipoAjuste: 'regalo'` a nombre del cliente seleccionado a costo `$0`.
  - **Acceso WhatsApp:** Botón que linkea automáticamente con mensaje dinámico y predeterminado de agradecimiento por fidelización.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build`).

### [2026-05-31] - Corrección de Ejecución: Corrección de ReferenceError en Catálogo del Cliente
* **Tipo:** Corrección de Bug / Sintaxis
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientCatalog.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCatalog.jsx)
* **Causa Raíz:**
  - Se gatillaba un error fatal en tiempo de ejecución (`ReferenceError: X is not defined`) al intentar presionar o renderizar el botón de "Limpiar" filtro de categorías. Esto ocurría porque se utilizaba el componente de icono `<X size={11} />` de `lucide-react` sin haber sido importado en la desestructuración de la línea 4.
* **Solución Implementada:**
  - Se agregó `X` a la lista de importación de `lucide-react` en `ClientCatalog.jsx`.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build`).

### [2026-05-31] - Nueva Característica: Módulo de Ajustes de Inventario y Descartes en POS
* **Tipo:** Nueva Funcionalidad / Lógica de Estado / Reportes
* **Archivo(s) Modificado(s):**
  - [`src/store/appConfigStore.js`](file:///d:/Aplicaciones/App%20Ventas/src/store/appConfigStore.js)
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
  - [`src/pages/admin/AdminSales.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSales.jsx)
  - [`src/services/orderService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/orderService.js)
  - [`src/pages/admin/AdminSalesDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx)
  - [`src/services/pdfService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/pdfService.js)
* **Detalle Técnico:**
  - **Feature Flag & Configuración:** Se añadió `inventoryAdjustmentsEnabled` en el store global y en la sección de "Módulos Activos" de `AdminSettings.jsx` para encender/apagar de forma reactiva la opción.
  - **POS Toggles & Checkout:** En `AdminSales.jsx` se lee la configuración. Si está activa, muestra el Tipo de Operación: Venta Comercial vs Ajuste (Descarte). Al seleccionar Ajuste, se ocultan los campos de clientes y se muestra el selector especial de Descartes (Regalo, Avería, Consumo Interno). Se omiten las búsquedas de cliente completando automáticamente identidades de sistema (ej. `Descarte por Avería`) y el turnero se desactiva.
  - **Stock & Accounting:** La transacción descuenta stock en Firestore de forma atómica a través de `createPhysicalOrder`, pero guarda el pedido con `total: 0` e `isAjuste: true`. El panel de análisis `AdminSalesDetail.jsx` y el generador `pdfService.js` filtran estas deudas/ingresos del balance de ventas comercial, manteniendo la contabilidad limpia, pero mostrando desgloses específicos. El reporte PDF de rotación cuenta la salida física pero con ingresos `$0`.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa (`npm run build`).

### [2026-05-31] - Corrección de Seguridad: Permisos en Reglas de Firestore para Calificación de Empleados
* **Tipo:** Seguridad / Reglas de Acceso a Base de Datos
* **Archivo(s) Modificado(s):**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules)
* **Causa Raíz:**
  - Al calificar la atención de un empleado/vendedor desde el historial del cliente, el valor de las estrellas se reiniciaba de forma inmediata debido a que `firestore.rules` denegaba los permisos de actualización (`update`) en `/orders` para usuarios no autenticados en los campos de calificación. Esto causaba el fallo de la mutación de React Query y la restauración del estado local anterior.
* **Solución Implementada:**
  - Se modificó la regla `allow update` de la colección `/orders` para permitir que el cliente modifique de forma controlada y segura los campos `calificacionVendedor` y `updatedAt`. Se usó `request.resource.data.diff(resource.data).affectedKeys().hasOnly(['calificacionVendedor', 'updatedAt'])` para validar que ningún otro parámetro sea alterado.
* **Estatus:** ✅ Completado y validado.

### [2026-05-31] - Optimización de UI/UX: Mensaje Personalizado al Intentar Repetir Pedido con Producto Especial/Libre
* **Tipo:** UI/UX / Mejora en Validaciones de Cliente
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientOrders.jsx)
* **Causa Raíz:**
  - Al presionar el botón "Repetir" en un pedido que contenía un producto personalizado (es decir, una venta física POS directa sin stock del catálogo, cuyo `productId` inicia con `custom-`), el sistema intentaba buscarlo en el catálogo activo. Al no encontrarlo, arrojaba la alerta estándar de inventario agotado: "Algunos productos ya no están disponibles...", lo cual resultaba confuso y poco representativo de la naturaleza del pedido.
* **Solución Implementada:**
  - Se implementó una validación previa en la función `handleRepeatOrder`. Si el pedido contiene al menos un ítem con un identificador que comience con `custom-`, la operación se aborta de inmediato mostrando la alerta explícita solicitada: *"El producto que adquiriste es personalizado por favor haz la compra directamente en la tienda"*.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa.

### [2026-05-31] - Optimización de UI/UX: Borrado por Defecto del Valor 0 en Costo de Envío del Administrador
* **Tipo:** UI/UX / Corrección de Entrada de Datos
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx)
* **Causa Raíz:**
  - En la tarjeta del pedido del panel de administración, el campo de entrada del costo de envío de tipo domicilio mostraba por defecto el valor `0` (derivado del valor por defecto en la base de datos). Al intentar borrar este número o cambiarlo, el valor persistía mostrando el `0`, lo que imposibilitaba una limpieza limpia y cómoda para que el administrador pudiera ingresar una nueva cifra directamente.
* **Solución Implementada:**
  - Se modificó la vinculación del valor (`value`) del input numérico. Si el costo de envío guardado en el pedido o en el estado local temporal es `0` o no está definido, se evalúa como una cadena vacía (`''`). Esto permite que el input muestre su respectivo placeholder y se mantenga vacío por defecto, pudiendo ser borrado por completo sin dejar residuos numéricos incómodos.
* **Estatus:** ✅ Completado y validado mediante compilación exitosa.

### [2026-05-31] - Optimización de Usabilidad en Mapa: Bloqueo de Interacción Táctil y Paneo en Vista de Solo Lectura
* **Tipo:** UI/UX / Mejora de Usabilidad Móvil
* **Archivo(s) Modificado(s):**
  - [`src/components/ui/LeafletMapPicker.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/LeafletMapPicker.jsx)
* **Causa Raíz:**
  - En el checkout, al visualizar la ubicación del local en el mapa para "Retiro en Tienda", el componente de Leaflet interceptaba por defecto los gestos táctiles de arrastre y desplazamiento del navegador. Esto provocaba que, al intentar deslizar la pantalla hacia abajo para finalizar la compra, el usuario quedara atrapado interactuando con el mapa sin poder hacer scroll.
* **Solución Implementada:**
  - Se configuró el constructor de mapa de Leaflet (`L.map`) de manera dinámica: cuando la propiedad `readOnly` está activa, se deshabilitan por completo los manejadores de interacción del mapa (`dragging: false`, `scrollWheelZoom: false`, `touchZoom: false`, `doubleClickZoom: false`, `boxZoom: false`, `keyboard: false`, `tap: false`).
  - Esto convierte el mapa en un render estático e inerte ante interacciones involuntarias, permitiendo que cualquier gesto de scroll sobre su recuadro se propague de forma natural al scroll del navegador o del modal.
* **Estatus:** ✅ Completado y verificado con build exitoso.

### [2026-05-31] - Corrección de Permisos Firestore en Consulta de Pedido por Token (Seguimiento Público)
* **Tipo:** Seguridad y Permisos / Corrección de Bug en BD
* **Archivo(s) Modificado(s):**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules)
* **Causa Raíz:**
  - La regla anterior agrupaba toda la lectura bajo `allow read`. Al intentar consultar un pedido por su token de seguimiento desde la vista pública sin estar autenticado, la consulta arrojaba un error de permisos insuficientes. Esto ocurría porque Firestore evalúa las consultas de colección (`list`) exigiendo que se garantice que se cumplan las reglas, pero el acceso anidado inseguro a campos del cliente (como `resource.data.cliente.celular != null`) fallaba a nivel de motor si no existía el objeto, además de no mapearse correctamente como restricción de la consulta por token.
* **Solución Implementada:**
  - Se dividió la regla `read` en `get` (para lecturas de documentos individuales por ID) y `list` (para consultas/queries de colección).
  - Se protegieron los accesos anidados en `get` usando el operador de existencia de propiedades `'celular' in resource.data.cliente`.
  - Se simplificó la regla `list` permitiendo consultas públicas seguras que filtren específicamente por `trackingToken` o por `cliente.celular`, eliminando el fallo de evaluación del motor de reglas de Firestore.
* **Estatus:** ✅ Corregido y validado.

### [2026-05-31] - Rediseño Responsivo de Configuración de Administrador (Split Screen en PC)
* **Tipo:** UI/UX / Rediseño de Layout Responsivo
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Detalle Técnico:**
  - Se implementó un layout responsivo condicional mediante el estado `isMobile` y un listener de eventos de redimensionamiento (`resize`).
  - **Modo Móvil:** Mantiene intacto el flujo lineal anterior (menú principal basado en tarjetas agrupadas por categorías, navegación a secciones específicas con transición animada mediante Framer Motion y botón de retorno atrás).
  - **Modo Escritorio (PC):** Se reestructuró la interfaz a un layout de pantalla dividida (`grid-cols-[290px_1fr]`) con un sidebar fijo a la izquierda (con todas las categorías agrupadas con iconos y textos estilizados, operando como pestañas interactivas) y un panel principal a la derecha para renderizar el contenido activo de forma inmediata y persistente.
  - Se configuró la sección "Identidad de Marca" (`marca`) como pestaña seleccionada por defecto en PC cuando no hay una sección activa seleccionada explícitamente (`activeSection === null`), eliminando pantallas vacías.
  - Se optimizó la cuadrícula del submenú de "Personalización de Tienda" (`personalizar`) en PC para usar una disposición responsiva adaptable y fluida (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3`), evitando que el texto de las subsecciones se comprima.
  - Se mantuvieron 100% íntegros todos los estados de datos (`formData`), llamadas a base de datos (Firestore), listeners PWA, métricas financieras y helpers.
* **Estatus:** ✅ Completado y verificado mediante compilación exitosa (`npm run build`).

### [2026-05-31] - Corrección de Visualización de Notas del Cliente en Panel Admin
* **Tipo:** Corrección de Bug / UI
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx)
* **Causa Raíz:**
  - En la tarjeta del pedido del administrador, la sección de notas evaluaba la propiedad `order.notes` en lugar de la clave del esquema de la base de datos `order.notas`, lo que impedía el renderizado del mensaje ingresado por el cliente en el checkout.
* **Solución Implementada:**
  - Se corrigió la condición de render a `{order.notas && ...}` para alinearse con la estructura de datos real de la orden.
* **Estatus:** ✅ Corregido y compilación local verificada.

### [2026-05-31] - Extracción y Documentación del Módulo de Compra Rápida por Código QR
* **Tipo:** Biblioteca de Componentes / Documentación de Arquitectura
* **Archivo(s) Modificado(s):**
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Ecommerce_y_Ventas\Compra_Rapida_por_QR\compra_rapida_qr.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Ecommerce_y_Ventas/Compra_Rapida_por_QR/compra_rapida_qr.md) [NUEVO]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Manuales\Ecommerce_y_QR\Modulo_Compra_Rapida_QR\manual_compra_qr.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Manuales/Ecommerce_y_QR/Modulo_Compra_Rapida_QR/manual_compra_qr.md) [NUEVO]
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/README.md)
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Estandar de Desarrollo\mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_documentacion_ia.md)
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Tareas Pendientes\tareas_pendientes.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Tareas%20Pendientes/tareas_pendientes.md)
* **Detalle Técnico:**
  - **Extracción de Componente Agnóstico (`compra_rapida_qr.md`)**: Se abstrayeron y modularizaron las capacidades de la página pública `/producto/:id` (`ProductPublicDetail.jsx`), el gestor de códigos QR del admin (`AdminInventory.jsx`) y el interceptor de catálogo del cliente (`ClientCatalog.jsx`). Se definió una API paramétrica limpia con props inyectables, resolviendo dependencias rígidas de Zustand y Firebase, y estandarizando colores HSL configurables para CTA de WhatsApp.
  - **Creación de Manual de Arquitectura (`manual_compra_qr.md`)**: Se redactó un manual completo que detalla la topología de la compra con QR, diagramas Mermaid de secuencias y ciclos de vida del producto en sus distintos estados de stock.
* **Estatus:** ✅ Completado y documentado.

### [2026-05-31] - Checkout: Celular primero con búsqueda automática de cliente en BD
* **Tipo:** Mejora UX / Funcionalidad
* **Archivo(s) Modificado(s):**
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx)
* **Detalle Técnico:**
  - Se invirtió el orden de los campos en el Paso 2 del checkout: **Celular va primero**, luego Nombre.
  - Al digitar el celular (mín. 7 dígitos), se dispara un debounce de 600ms que consulta Firestore vía `getClientByPhone`. Si el cliente existe, el campo Nombre se auto-completa y se bloquea (read-only) con estilo verde y badge "Cliente registrado". Si no existe, el campo Nombre queda editable.
  - Se añade botón "No soy yo, cambiar nombre" para que el cliente pueda corregir si el número pertenece a otro.
  - Al abrir el modal si el usuario ya tiene sesión con nombre y celular, se marca como `foundClientData` automáticamente sin disparar la búsqueda.
* **Estatus:** ✅ Completado y desplegado.

### [2026-05-31] - Fix: Intercepción QR → Apertura de Modal de Detalle del Producto
* **Tipo:** Corrección de Bug / Arquitectura React
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientCatalog.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCatalog.jsx)
* **Causa Raíz:**
  - El código QR anterior había sido eliminado del archivo en refactorizaciones previas. El `ClientCatalog.jsx` no tenía lógica de lectura del query param `?qrProduct=<id>`.
* **Solución Implementada:**
  - Se añadió `useSearchParams` de `react-router-dom` y `useRef` de React.
  - **Efecto 1** (se ejecuta solo al montar): Lee y elimina el query param `qrProduct` de la URL (`replace: true` para no contaminar el historial), guardando el `productId` en un `useRef`.
  - **Efecto 2** (depende de `isLoadingProducts` + `processedProducts`): Espera a que los datos estén listos, luego busca el producto en `processedProducts` (con precios y promos ya aplicados) y llama `setSelectedProduct(prod)` para abrir el `ProductDetailModal`.
  - Patrón `useRef` como bridge evita condiciones de carrera entre `setSearchParams` y la dependencia del efecto.
* **Estatus:** ✅ Completado y desplegado.

### [2026-05-31] - Vista Pública Dinámica para QR e Higienización de Residuos
* **Tipo:** Nueva Característica / Reestructuración / Limpieza de Código
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientCatalog.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCatalog.jsx)
  - [`src/pages/client/ProductPublicDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ProductPublicDetail.jsx) [NUEVO]
  - [`src/routes/AppRoutes.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/routes/AppRoutes.jsx)
  - [`src/pages/admin/AdminInventory.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminInventory.jsx)
* **Detalle Técnico:**
  - **Nueva Vista Pública Dinámica (`ProductPublicDetail.jsx`)**: Se diseñó e implementó una interfaz premium e independiente accesible bajo la ruta `/producto/:id`. Carga de manera instantánea el producto de Firestore utilizando React Query sin requerir autenticación ni el catálogo completo. Permite seleccionar variantes (talla/color) con validación de stock y agregar al carrito. Si el usuario está registrado, retorna al catálogo; si no tiene sesión, abre el Drawer del carrito y le permite continuar al Login/Checkout tradicional.
  - **Actualización de QRs**: Se configuró la generación de códigos QR en `AdminInventory.jsx` para que el código apunte a la ruta pública `/producto/:id`.
  - **Higienización de Código**: Se removieron todos los residuos del antiguo flujo de registro express en `ClientCatalog.jsx` (estados de login express, formulario submit, modales de ingreso de nombre/teléfono e imports de Firebase y React desactualizados).
* **Estatus:** ✅ Completado y verificado.

### [2026-05-31] - Corrección Bug: Modal de Detalle no Abría al Escanear QR
* **Tipo:** Corrección de Bug / Arquitectura React
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientCatalog.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCatalog.jsx)
* **Causa Raíz:**
  - El `useEffect` que interceptaba el `qrProduct` query param tenía `searchParams` en su array de dependencias. Al llamar `setSearchParams` para limpiar la URL dentro del mismo efecto, React re-ejecutaba el efecto en el mismo ciclo de render, destruyendo el estado transitorio antes de que el componente pudiera re-renderizarse con `selectedProduct` establecido.
  - Adicionalmente, el efecto referenciaba `processedProducts` (declarado más abajo con `const processedProducts = useMemo(...)`) causando una **Temporal Dead Zone (TDZ)** que generaba `ReferenceError: Cannot access 'processedProducts' before initialization`.
* **Solución Aplicada:**
  - Se separó la lógica en **dos efectos independientes**:
    1. **Efecto 1**: Solo lee y limpia el query param, guardando el `productId` en un `useRef` (`pendingQrProductId`) como puente entre renders.
    2. **Efecto 2**: Observa `processedProducts` e `isLoadingProducts`. Cuando los datos están listos, consume el ref y actúa (abre modal o agrega al carrito).
  - Los efectos se movieron **después** de la declaración de `processedProducts` en el árbol de hooks para respetar la TDZ de `const`.
  - Se agregó `useRef` al import de React.
* **Estatus:** ✅ Corregido — dev server sin errores de runtime.

### [2026-05-30] - Redirección de Compra QR Diferenciada y Ajuste de Borde en Login
* **Tipo:** Ajuste de Flujo / UI/UX / Optimización
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientCatalog.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCatalog.jsx)
  - [`src/pages/LoginPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/LoginPage.jsx)
* **Detalle Técnico:**
  - Se modificó la redirección al escanear códigos QR de productos con lógica diferenciada:\n    - Si el cliente está **registrado** (sesión activa), se abre directamente el **modal de detalle del producto** (`selectedProduct`) para que pueda elegir variantes (tallas/colores) y cantidades.\n    - Si el cliente **no está registrado** (sesión inactiva), el producto se agrega **automáticamente al carrito** y se abre el drawer de compras con una notificación toast de confirmación, simplificando la compra como usuario invitado.
  - Se corrigió el diseño del mensaje informativo de bienvenida para clientes nuevos en `LoginPage.jsx`, reemplazando el fondo y borde rígido `border-primary/10` por la clase estilizada `border-app` de color suave y el fondo `bg-primary/[0.04]`, alineándolo al 100% con los estándares visuales de la aplicación.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.


### [2026-05-30] - Módulo de Domiciliarios y Panel de Entregas (/domicilio)
* **Tipo:** Nueva Característica / Lógica de Estado / Seguridad / UI/UX
* **Archivo(s) Modificado(s):**
  - [`src/pages/DeliveryPanel.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/DeliveryPanel.jsx) [NUEVO]
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
  - [`src/pages/EmployeePortal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/EmployeePortal.jsx)
  - [`src/layouts/AdminLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/AdminLayout.jsx)
  - [`src/routes/AppRoutes.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/routes/AppRoutes.jsx)
  - [`src/services/orderService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/orderService.js)
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx)
  - [`src/pages/client/OrderTracking.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/OrderTracking.jsx)
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules)
* **Detalle Técnico:**
  - Se implementó un flujo completo para repartidores/domiciliarios propios de la tienda. Se agregó el rol `"domiciliario"` en la creación y edición de empleados en `AdminSettings.jsx`, incluyendo datos como vehículo, placa y teléfono.
  - Se diseñó e implementó la página `/domicilio` (`DeliveryPanel.jsx`) que actúa como panel de control exclusivo para domiciliarios que entran mediante PIN, mostrando pedidos listos para tomar y pedidos asignados activos, geolocalización mediante el componente interactivo `MapToggle` y visualizadores GPS externos, además de contabilidad de efectivo recaudado en el día.
  - Se modificaron las reglas de `firestore.rules` para permitir lecturas y actualizaciones públicas de las órdenes cuando se asocian a entregas (`en_camino` y `completado`).
  - Se adaptó `AdminOrders.jsx` para permitir al admin asignar o liberar domiciliarios manualmente sobre las tarjetas de pedidos, y `OrderTracking.jsx` para mostrar el estado `en_camino` y la información del repartidor al cliente final.
  - Se resolvió un error de compilación local inlineando componentes `CustomSelect` en `AdminOrders.jsx` y `MapToggle` en `DeliveryPanel.jsx`.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Permisos de Firestore para Seguimiento Público de Pedidos y Panel de Cocina
* **Tipo:** Bugfix de Seguridad / Firestore Rules / Panel de Cocina
* **Archivo(s) Modificado(s):**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules)
* **Detalle Técnico:**
  - Se adicionó la condición `|| (resource.data.trackingToken != null)` a las reglas de lectura de la colección `/orders` para permitir que el portal de seguimiento público (`OrderTracking.jsx`) recupere de forma anónima los datos del pedido mediante el token único y cifrado del pedido, solucionando el error visual de "Atención: Ocurrió un error al consultar el estado del pedido".
  - Se habilitaron permisos de lectura (`allow read`) en la colección `/orders` para pedidos en preparación o listos (`resource.data.estado in ['alistamiento', 'listo']`), permitiendo que el panel de cocina (`KitchenPanel.jsx`) —el cual opera de manera cliente-side sin sesión de Firebase Auth (a través de PIN)— pueda suscribirse en tiempo real a la cola de preparación sin gatillar excepciones de `Permission Denied`.
  - Se habilitaron permisos de actualización (`allow update`) en la colección `/orders` exclusivamente para las transiciones de estado entre `'alistamiento'` y `'listo'`, permitiendo al panel de cocina desmarcar y marcar los platos como listos de forma pública y segura.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Restricción de Cupones en Checkout según Configuración del Administrador
* **Tipo:** Bugfix de Seguridad / Consistencia de Negocio
* **Archivo(s) Modificado(s):**
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx)
* **Detalle Técnico:** Se subsanó un fallo de seguridad por el cual los clientes podían aplicar cupones de descuento e invocar el selector de cupones activos en el checkout aun cuando el módulo de cupones estaba desactivado en la configuración administrativa (`couponsEnabled === false`). Se recuperó el flag `couponsEnabled` desde el store global de configuración de marca y se condicionó en el renderizado JSX del paso de pagos en el checkout, ocultando el campo de entrada y los activadores de cupones si el módulo está deshabilitado.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Reestructuración de Instalación PWA y Reordenamiento de Perfil de Cliente
* **Tipo:** UI/UX / Optimización de Layout / PWA
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientProfile.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientProfile.jsx)
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Detalle Técnico:**
  - En la página de perfil del cliente (`ClientProfile.jsx`), se reordenaron las tarjetas de la sección inferior de modo que el banner de referido/cotización del desarrollador ("¿Quieres una app para tu negocio?") se ubique prioritariamente por encima de la tarjeta de instalación PWA, mejorando la exposición comercial.
  - En la tarjeta de instalación PWA (tanto en el perfil del cliente como en los ajustes del administrador), se habilitó de manera global un botón principal "Instalar en este Dispositivo" que ejecuta la descarga/instalación directa.
  - Se ocultaron las detalladas instrucciones de instalación manual tras un botón colapsable/acordeón animado "Ver instructivo de instalación manual" en ambas interfaces, previniendo la contaminación visual del layout por defecto.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Depuración de Módulos Duplicados en Ajustes del Administrador
* **Tipo:** Refactorización de Interfaz / UX / Limpieza de Código
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Detalle Técnico:** Se eliminó la redundancia detectada en los paneles de configuración administrativa. Las secciones "Ventas al por Mayor" (`mayorista`) y "Garantías y Reclamos" (`garantias`) solo contenían controles de activación de switch idénticos a los ya provistos por la pestaña centralizada de "Módulos Activos" (`modulos`). Se removieron ambas tarjetas de subsección en la navegación de "Personalizar Tienda" y se purgaron sus correspondientes bloques de renderizado e interfaces redundantes en el JSX, unificando la administración de estos flags únicamente en el panel de control de Módulos Activos.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Reporte PDF de Respaldo de Facturación del Desarrollador
* **Tipo:** Nueva Característica / Herramienta Administrativa / PDF
* **Archivo(s) Modificado(s):**
  - [`src/services/pdfService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/pdfService.js) [Función exportDeveloperBillingDetailPDF]
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [Botón y enlace a la función de exportación]
* **Detalle Técnico:** Se diseñó y codificó el reporte de respaldo `exportDeveloperBillingDetailPDF` en el motor de reportes. Este genera un desglose financiero estructurado del mes que detalla: Ventas Brutas Totales (suma de subtotales), Descuentos Aplicados, Costos de Envío/Domicilios Facturados, Valor Neto de Ventas (total recibido) y la Comisión Correspondiente del Desarrollador según la tasa configurada. Además, incluye un listado atómico e histórico ordenado de todas las transacciones completadas del periodo con su respectiva comisión individual calculada, sirviendo como un documento de respaldo formal inalterable. Se integró el botón "Exportar Detalle de Respaldo" en el panel de facturación del desarrollador de los ajustes de administración.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Migración Global a Endpoint Directo de WhatsApp (WhatsApp API Direct Link)
* **Tipo:** Bugfix / Codificación / Compatibilidad
* **Archivo(s) Modificado(s):**
  - [`src/services/whatsappService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/whatsappService.js)
  - [`src/pages/admin/AdminClaims.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminClaims.jsx)
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx)
  - [`src/pages/client/ClientCatalog.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCatalog.jsx)
  - [`src/pages/client/ClientCredits.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCredits.jsx)
* **Detalle Técnico:** Se detectó un fallo recurrente de codificación UTF-8 debido al acortador/redireccionador nativo `https://wa.me/` de Meta. Bajo ciertos navegadores y sistemas operativos, el servidor de redirección de `wa.me` no decodifica los parámetros URL en UTF-8 antes de redirigir, lo que corrompe los emojis y acentos convirtiéndolos en caracteres de reemplazo (rombo con signo de interrogación ``). Se resolvió migrando de forma global todos los enlaces de redirección a WhatsApp al endpoint de API directa `https://api.whatsapp.com/send?phone=...&text=...`. Al conectarse sin intermediarios de redirección, el navegador procesa la URL codificada por `encodeURIComponent` de forma directa y los emojis/tildes se renderizan con total fidelidad en la aplicación nativa de WhatsApp.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Contadores de Solicitudes Especiales y Paginación
* **Tipo:** Lógica de Presentación / Base de Datos / Optimización
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [Pestañas y paginación en solicitudes especiales]
* **Detalle Técnico:** Se agregaron contadores de solicitudes por categoría en los encabezados de las pestañas ("Ventas al por mayor" y "Pedidos por encargo") dentro del modal de solicitudes especiales, cargados dinámicamente en tiempo real al abrir el modal. Se reemplazó el botón de paginación infinita "Cargar más solicitudes" por el componente de paginación estándar `Pagination`, limitado a 10 elementos por página, optimizando las consultas a Firestore mediante el uso de filtros y slices basados en páginas específicas para evitar la carga innecesaria de documentos.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Sanitización y Secuencias Unicode en Notificaciones de WhatsApp
* **Tipo:** Bugfix / Codificación / Compatibilidad
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [Mensajes preestablecidos de cambio de estado]
* **Detalle Técnico:** Se detectó un error por el cual algunos emojis literales se enviaban de forma corrupta (mostrándose en el destinatario como un rombo con un signo de interrogación) debido a diferencias en el juego de caracteres e interpretaciones del archivo fuente compilado. Se reemplazaron todos los emojis literales en las plantillas de mensajes automatizados de WhatsApp por sus respectivas secuencias de escape unicode (por ejemplo: `\u{1F50D}` para la lupa, `\u{2705}` para el check verde, y `\u{274C}` para la cruz de rechazo), garantizando compatibilidad absoluta y decodificación nativa sin corrupción en cualquier navegador o sistema operativo.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Desactivación de Selección de Texto Global
* **Tipo:** Lógica de Presentación / UI/UX / Optimización Móvil
* **Archivo(s) Modificado(s):**
  - [`src/index.css`](file:///d:/Aplicaciones/App%20Ventas/src/index.css) [Estilos globales de la app]
* **Detalle Técnico:** Se configuraron reglas CSS globales en la etiqueta `body` (`user-select: none` y prefijos para navegadores `-webkit-`, `-moz-`, `-ms-`) para impedir que clics/taps accidentales en textos informativos, iconos, botones o tarjetas resalten texto o despierten asistentes de búsqueda en dispositivos móviles (ej: panel de búsqueda rápida en Google). Se mantuvieron excepcionalmente habilitados los campos de entrada nativos (`input`, `textarea`), elementos editables (`[contenteditable="true"]`) y elementos con clase `.selectable-text`.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Modal de Instrucciones de Instalación PWA en Ajustes Admin
* **Tipo:** UI/UX / Optimización
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [Sección PWA e instrucciones manuales]
* **Detalle Técnico:** Se erradicó el uso de diálogos `alert(...)` del navegador nativo cuando el navegador no soporta el evento directo de instalación de PWA. Se creó un estado `showInstallInstructions` y se inyectó una ventana modal animada (`AnimatePresence` + `motion.div`) con instrucciones paso a paso detalladas según el sistema operativo detectado (Safari para iOS, Chrome para Android/Escritorio) acoplado perfectamente al tema visual de la aplicación.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Límite Dinámico de Cantidad en Carrito según Stock Real
* **Tipo:** Bugfix / UI/UX
* **Archivo(s) Modificado(s):**
  - [`src/components/client/cart/CartDrawer.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/cart/CartDrawer.jsx) [Botón incrementar cantidad]
* **Detalle Técnico:** Se eliminó la restricción cableada de 10 unidades máximas (`item.cantidad >= 10`) en el botón de adición rápida ("+") del carrito de compras. En su lugar, se inyectó una condición dinámica que restringe la adición únicamente si se supera el stock disponible real de la variante (`item.maxStock`).
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Restricción y Cierre de Sesiones de Módulos Inactivos
* **Tipo:** Lógica de Estado / Seguridad
* **Archivo(s) Modificado(s):**
  - [`src/routes/AppRoutes.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/routes/AppRoutes.jsx) [Guarda de rutas RequireAuth]
  - [`src/pages/EmployeePortal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/EmployeePortal.jsx) [Portal de empleados]
  - [`src/pages/KitchenPanel.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/KitchenPanel.jsx) [Panel de preparación]
* **Detalle Técnico:** Se subsanó una fuga de acceso donde empleados logueados podían seguir operando en el panel POS y cocina tras desactivarse los módulos correspondientes en ajustes.
  - En `AppRoutes.jsx` (`RequireAuth`), si `hasMultipleEmployees` es falso, se limpian incondicionalmente las llaves de `sessionStorage` y se bloquea el bypass al rol de admin.
  - En `EmployeePortal.jsx` y `KitchenPanel.jsx`, se implementaron limpiezas reactivas de `sessionStorage` en el ciclo `useEffect` vinculados a los flags `hasMultipleEmployees` y `kitchenModeEnabled`, bloqueando accesos automáticos o redirecciones previas si los módulos están inactivos.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Paginación del Rendimiento por Personal/Empleados en Análisis de Ventas
* **Tipo:** UI/UX / Optimización
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSalesDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [Paginación y estado de empleados]
* **Detalle Técnico:** Se limitó la lista "Rendimiento por Personal / Empleados" a un máximo de 10 vendedores por vista. Se integró el componente unificado `Pagination` y se adaptó el cálculo del índice absoluto para mantener los badges del podio (🥇, 🥈, 🥉) correctos según la posición global del empleado sin importar la página.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Paginación del Rendimiento de Productos en Análisis de Ventas
* **Tipo:** UI/UX / Optimización
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSalesDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [Paginación y estado]
* **Detalle Técnico:** Se limitó la lista "Rendimiento General de Productos" a un máximo de 10 productos por vista. Se importó e integró el componente de diseño unificado `Pagination`, manteniendo el cálculo correcto del índice absoluto para conservar las insignias (🥇, 🥈, 🥉) en los elementos de mayor rotación sin importar la página activa.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Botón de Descarga de Informe de Empleados en Análisis de Ventas
* **Tipo:** Nueva Característica / UI/UX
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSalesDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [Botón y lógica de exportación]
  - [`src/services/pdfService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/pdfService.js) [Función exportEmployeeReportPDF]
* **Detalle Técnico:** Se implementó una nueva función `exportEmployeeReportPDF` que extrae las ventas completadas por empleado, su promedio de calificación de cliente, y genera un PDF estructurado con jsPDF y jspdf-autotable. Se integró el botón correspondiente en la sección "Reportes y Exportación" de la vista de análisis de ventas admin, visualizándose únicamente cuando `hasMultipleEmployees` está activo.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores localmente.

### [2026-05-30] - Visualización de Vendedor en Tarjetas de Pedido de Admin y Cliente
* **Tipo:** Nueva Característica / UI/UX
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [Tarjeta admin]
  - [`src/pages/client/ClientOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientOrders.jsx) [Tarjeta cliente]
* **Detalle Técnico:** Se habilitó la visualización del empleado/vendedor que atendió o registró el pedido en las tarjetas de venta/pedido. En el panel del Administrador, se muestra "Vendido por: [Nombre]" debajo de los datos del cliente. En la vista del Cliente, se muestra "Te atendió: [Nombre]" al lado del método de pago. Ambas visualizaciones se activan condicionalmente si la gestión de múltiples empleados está encendida y la orden cuenta con el campo `vendedor`.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores.

### [2026-05-30] - Persistencia del Vendedor Activo en Venta Directa POS
* **Tipo:** Bugfix / Lógica de Estado
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSales.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSales.jsx)
* **Detalle Técnico:** Se corrigió un bug donde al procesarse una venta en el POS, el estado del vendedor (`selectedEmployee`) se vaciaba incondicionalmente. Al modificar la función `handleFinalizeSale`, ahora se realiza una comprobación en `sessionStorage` para verificar si existe un empleado activo logueado. En caso afirmativo, se restaura su nombre en el estado del componente tras el reset del carrito, evitando que se pierda su identificación al realizar subsecuentes ventas personalizadas o de inventario.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores.

### [2026-05-30] - Flexibilidad en Input de Número de Empleados en Ajustes
* **Tipo:** Ajuste de Lógica / UI/UX
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Detalle Técnico:** Se eliminó la restricción `Math.max(1, ...)` en caliente del manejador `onChange` para el campo `employeeCount`. Esto permite que el usuario limpie la casilla de entrada (dejando un valor vacío `''`), pudiendo escribir o corregir el número sin que el sistema bloquee el borrado o fuerce automáticamente el valor a `1` en caliente.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores.

### [2026-05-30] - Reemplazo de Select Nativo por CustomSelect en Roles de Empleado
* **Tipo:** Ajuste de Interfaz / Consistencia Visual / UI/UX
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Detalle Técnico:** Se sustituyó la lista desplegable nativa HTML `<select>` del rol del empleado (Vendedor POS / Cocina) por el componente de selección animado premium CustomSelect del estándar de diseño del proyecto.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores.

### [2026-05-30] - Rediseño Compacto de Pestañas de Filtro de Pedidos y Contadores Circulares
* **Tipo:** Refactorización Visual / UI/UX / Optimización de Espacio
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientOrders.jsx)
* **Detalle Técnico:** Se optimizó el selector de pestañas (Pedidos Comunes y Pedidos Especiales) reduciendo la altura general, el padding de los botones y acortando los textos a "Comunes" y "Especiales". Se reemplazó el contador textual clásico entre paréntesis por un contador circular inline dinámico (`bg-primary text-white` para la pestaña activa y `bg-primary/10 text-primary` para la inactiva), mejorando drásticamente el espacio útil en dispositivos móviles.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores.

### [2026-05-30] - Adición de Índice Compuesto en Firestore para Estado y Fecha Ascendente
* **Tipo:** Configuración de Base de Datos / Rendimiento
* **Archivo(s) Modificado(s):**
  - [`firestore.indexes.json`](file:///d:/Aplicaciones/App%20Ventas/firestore.indexes.json) [Configuración de índices locales]
* **Detalle Técnico:** Se configuró localmente el nuevo índice compuesto requerido por la consulta de orders en `KitchenPanel.jsx` (filtrando por `estado` y ordenando por `createdAt` en sentido ascendente, FIFO).
* **Estatus de Despliegue:** ✅ Modificado localmente (pendiente de despliegue a Firebase).

### [2026-05-30] - Sincronización e Identificación Dinámica de Múltiples Turnos Propios en el Turnero
* **Tipo:** Ajuste de Lógica / UX del Cliente / Turnero
* **Archivo(s) Modificado(s):**
  - [`src/pages/client/ClientOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientOrders.jsx) [Cálculo de turnos activos]
  - [`src/components/client/orders/QueueBoard.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/orders/QueueBoard.jsx) [Resaltado de turnos listos propios]
* **Detalle Técnico:**
  - Se corrigió la lógica del cálculo de `clientActiveTurns` para que incluya todos los estados activos de la orden (como "alistamiento" o "listo") y no únicamente "pendiente" o "credito_aprobado", resolviendo el problema donde turnos secundarios propios dejaban de marcarse como "(Tuyo)" al avanzar en preparación.
  - Se adaptó `QueueBoard.jsx` para que resalte con un pulso de éxito y el badge "(Tuyo)" aquellos turnos del cliente que han pasado a la lista de "Listos", facilitando una identificación inmediata para el reclamo físico del pedido.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores.

### [2026-05-30] - Rediseño Completo y Premium del Panel de Preparación (KitchenPanel)
* **Tipo:** Refactorización Visual / UI/UX / Optimización de Espacio
* **Archivo(s) Modificado(s):**
  - [`src/pages/KitchenPanel.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/KitchenPanel.jsx)
* **Detalle Técnico:**
  - Se rediseñó por completo el Panel de Preparación (Cocina/Bodega). Se implementó un encabezado premium con blur de cristal (`backdrop-blur-xl`), animaciones elásticas de cambio de pestaña mediante Framer Motion (`layoutId="activeKitchenTab"`) y tarjetas de pedidos de preparación pulidas con sombras suaves y esquinas redondeadas.
  - Se incorporó un sistema interactivo de checklist local para las listas de productos de cada pedido. Los operarios pueden presionar sobre cada producto para tacharlo/marcarlo físicamente como preparado antes de marcar el pedido completo como "Listo", mejorando el control y la experiencia del usuario (UX) en cocina/bodega.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores.

### [2026-05-30] - Reemplazo de Select Nativo por CustomSelect Premium en Ajustes de Cocina
* **Tipo:** Ajuste de Interfaz / Consistencia Visual / UI/UX
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Detalle Técnico:** Se sustituyó el elemento `<select>` nativo de HTML de la opción "Etiqueta del Módulo" (Cocina/Bodega/Preparación) por el componente de selección animado premium `CustomSelect` del estándar del proyecto, garantizando consistencia visual con el resto de los selectores de marca blanca de la aplicación.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores.

### [2026-05-30] - Panel de Preparación (Cocina/Bodega) y Portal de Empleados con PIN y QR
* **Tipo:** Nueva Funcionalidad / Seguridad / Integración Transaccional
* **Archivo(s) Modificado(s):**
  - [`src/layouts/AdminLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/AdminLayout.jsx) [Navegación restringida para empleados]
  - [`src/pages/admin/AdminSales.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSales.jsx) [Bloqueo de vendedor en POS]
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [Flujo adaptativo de preparación]
* **Detalle Técnico:**
  - Se implementó el panel de control de preparación (`/cocina`) y el portal de inicio de sesión de empleados (`/empleado`) con keypad táctil de seguridad por PIN.
  - Se configuraron flags en `AdminSettings.jsx` para activar la visualización del panel de preparación y perfiles de empleados.
  - Se restringió `AdminLayout.jsx` de modo que si hay una sesión activa de empleado, este solo pueda ver y acceder a la sección de Ventas directas (POS).
  - Se adaptó `AdminSales.jsx` POS para cargar y bloquear el vendedor de la venta directa automáticamente a partir de la sesión activa del empleado.
  - Se modificó `AdminOrders.jsx` para desviar los pedidos normales a preparación (`alistamiento`) en lugar de completarlos directamente cuando el modo cocina está encendido, permitiendo al cocinero marcarlos como listos y al administrador completarlos al final.
* **Estatus de Despliegue:** ✅ Completado y compilado sin errores.

### [2026-05-30] - Sincronización de Componente Turnero en Biblioteca
* **Tipo:** Biblioteca de Componentes / Sincronización
* **Archivo(s) Modificado(s):**
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Pedidos_y_Gestion\Tablero_Cola_Turnos\tablero_cola_turnos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Pedidos_y_Gestion/Tablero_Cola_Turnos/tablero_cola_turnos.md)
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Estandar de Desarrollo\mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_documentacion_ia.md)
* **Detalle Técnico:** Se actualizó la documentación del componente `QueueBoard` (`tablero_cola_turnos.md`) en la biblioteca de componentes del proyecto. El código React de referencia y las especificaciones visuales se reestructuraron por completo a la versión 2.0 (cintillo horizontal compacto y sin bordes sólidos) para coincidir exactamente con el diseño actual de producción de `QueueBoard.jsx`. Adicionalmente, se actualizó la descripción del componente en el mapa semántico `mapa_documentacion_ia.md`.
* **Estatus:** ✅ Completado y documentado.

### [2026-05-30] - Rediseño de Tablero de Turnos del Cliente (QueueBoard Compacto y Sin Bordes Rígidos)
* **Tipo:** Refactorización Visual / UI/UX / Optimización de Espacio
* **Archivo(s) Modificado(s):**
  - [`src/components/client/orders/QueueBoard.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/orders/QueueBoard.jsx)
* **Causa Raíz:** El tablero de turnos del cliente ("Tablero de Turnos de Hoy") utilizaba una estructura vertical de tarjetas anidadas con bordes oscuros marcados (`border-app/60` y layouts pesados) que tomaban demasiado espacio vertical en la pantalla del smartphone y se veían toscos.
* **Solución Técnica:** Se rehizo la estructura del componente convirtiéndola en un cintillo horizontal declarativo. Se removieron los bordes oscuros rígidos y se reemplazaron por líneas muy suaves y traslúcidas (`border-app/30`), paddings internos de `p-4`, fondo sutil `bg-surface-2/40` con degradado radial `bg-primary/5` difuminado con desenfoque de 40px (`blur-3xl`). Los bloques de "Preparando" y "Listos" ahora se alinean horizontalmente en pantallas medianas/grandes y se apilan de forma compacta en celulares, utilizando tags/chips pequeños que no saturan el área útil del viewport del cliente.
* **Estatus de Despliegue:** Compilado y desplegado con éxito.

### [2026-05-30] - Reordenamiento de Botones en la Tarjeta de Pedidos (Mover a Completado debajo de Espera)
* **Tipo:** Ajuste de Interfaz / UI/UX / Simetría
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx)
* **Causa Raíz:** El botón "Mover a Completado" se renderizaba ocupando el ancho completo (`col-span-2`), quedando por debajo del botón "Cancelar" (que quedaba a la izquierda con `col-span-1` y un espacio vacío a su derecha), lo que rompía la simetría y armonía visual de las acciones rápidas de la tarjeta cuando el módulo del turnero estaba habilitado.
* **Solución Técnica:** Se modificó la estructura condicional de clases del botón para que, si `turneroEnabled` está activo, el botón adquiera la clase `col-span-1 h-11`, ordenándose simétricamente dentro de una cuadrícula 2x2. De esta forma, el botón "Mover a Completado" se posiciona en la segunda columna de la segunda fila, quedando perfectamente centrado y ordenado justo debajo del botón "Espera", mientras que "Cancelar" se ubica en la primera columna, debajo de "WhatsApp".
* **Estatus de Despliegue:** Compilado con build exitoso.

### [2026-05-30] - Solución a Excepción de Transacciones en Firestore y Optimización de Lag en Modales Slide-up
* **Tipo:** Bugfix Crítico / Optimización de Rendimiento
* **Archivo(s) Modificado(s):**
  - [`src/services/orderService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/orderService.js)
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx)
  - [`src/components/client/catalog/ClientFilterModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ClientFilterModal.jsx)
* **Problema 1 (FirebaseError):** Al finalizar compras en el checkout, se arrojaba la excepción `FirebaseError: Firestore transactions require all reads to be executed before all writes.`, abortando la creación del pedido. Esto ocurría porque la transacción en `createOrder` y `createPhysicalOrder` intercalaba lecturas (`transaction.get`) condicionales con escrituras de stock o turnos, violando la regla estricta de la base de datos que exige realizar todas las consultas de lectura antes de cualquier escritura.
* **Problema 2 (Lag de Animación):** Los modales con deslizamiento ascendente (`slide-up`) sufrían de stuttering y pérdida de fotogramas al abrirse debido al uso del early return `if (!isOpen) return null`. Esto provocaba que React montara de golpe toda la jerarquía compleja de componentes e inicializara sus hooks de consulta exactamente en el mismo hilo de animación, congelando la transición. Además, al desmontar inmediatamente, se eliminaba el ciclo de salida de Framer Motion.
* **Solución Técnica:**
  - **Transacciones de Firestore:** Se refactorizaron por completo `createOrder` y `createPhysicalOrder` en `orderService.js` agrupando y ejecutando de forma paralela todas las operaciones de lectura (`settingsRef`, `turnoRef`, y `productRefs`) usando `Promise.all` al inicio absoluto del callback de la transacción. Las lógicas de negocio, descuento de stock y todas las escrituras (`update`/`set`) se desplazaron en bloque hacia el final, eliminando de raíz la excepción.
  - **Desempeño Visual en Modales:** Se removió el early return `if (!isOpen) return null` de `CheckoutModal.jsx` y `ClientFilterModal.jsx` para mantener el árbol React montado de fondo. Adicionalmente, en `ClientFilterModal`, se corrigió la ubicación de `AnimatePresence` condicionando la visualización dentro del bloque para permitir que Framer Motion intercepte los ciclos de renderizado y ejecute transiciones fluidas de entrada y salida a 60 FPS sin lag de montaje.

### [2026-05-30] - Optimización de Rendimiento: Montado Diferido de Mapas en CheckoutModal
* **Tipo:** Optimización de Rendimiento / UI/UX
* **Archivo(s) Modificado(s):**
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx)
* **Causa Raíz:** Al presionar "Ir a pagar", el modal se deslizaba con notable lag y retraso. Esto sucedía porque el componente de mapas Leaflet (`LeafletMapPicker`) es sumamente pesado de inicializar en el DOM (creación de canvases, cálculo de posiciones, binding de eventos táctiles y descargas de assets). Al montarse simultáneamente con la animación de entrada del modal de Framer Motion, saturaba el hilo principal de renderizado y causaba una caída brusca de FPS.
* **Solución Técnica:** Se implementó una lógica de **montado diferido** mediante el estado `mountMap` controlado por un temporizador (`setTimeout` de 400ms) que se activa cuando `isOpen` pasa a `true`. De esta forma, el mapa solo se monta y renderiza una vez que la animación de deslizamiento y entrada del modal se ha completado en su totalidad, permitiendo transiciones fluidas de 60fps. Durante el retardo, se muestra un esqueleto de carga visual animado (`shimmer skeleton`).
* **Estatus de Despliegue:** Build de producción exitoso.

### [2026-05-30] - Corrección de Seguridad: Permisos de Firestore para turnosDiarios
* **Tipo:** Corrección de Seguridad / Reglas de Firestore
* **Archivo(s) Modificado(s):**
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules)
* **Causa Raíz:** Se generaba un error `403 Forbidden` al crear un pedido por la falta de permisos de escritura/lectura en la colección `/turnosDiarios/{document}`, bloqueando las solicitudes de guardado y lectura del turnero en vivo del cliente.
* **Solución Técnica:** Se añadieron las reglas para la colección `/turnosDiarios/{document}` en `firestore.rules` con acceso público para lectura y escritura, y se ejecutó la actualización y despliegue exitoso de las reglas de base de datos a producción en Firebase (`firebase deploy --only firestore:rules` ✓).
* **Estatus de Despliegue:** Despliegue de reglas Firestore completado y verificado.

### [2026-05-30] - Extracción y Documentación del Tablero de Cola de Turnos
* **Tipo:** Biblioteca de Componentes
* **Archivo(s) Modificado(s):**
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Pedidos_y_Gestion\Tablero_Cola_Turnos\tablero_cola_turnos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Pedidos_y_Gestion/Tablero_Cola_Turnos/tablero_cola_turnos.md)
  - [`D:\PROTOTIPE\Documentacion PROTOTIPE\Manuales\Pedidos_y_Gestion\Sistema_Turnos\manual_sistema_turnos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Manuales/Pedidos_y_Gestion/Sistema_Turnos/manual_sistema_turnos.md)
* **Causa Raíz:** Se solicitó extraer la funcionalidad de turnero a la biblioteca de componentes reutilizables como un componente marca blanca stateless (`QueueBoard.jsx`) y documentar su arquitectura técnica e integraciones con manuales dedicados para otros desarrolladores.
* **Solución Técnica:**
  - Se creó el archivo de especificación del componente reutilizable `tablero_cola_turnos.md` en español estructurado, y el código React de `QueueBoard` totalmente desacoplado de dependencias rígidas de iconos (Lucide React) o colores de base (Tailwind CSS).
  - Se redactó el manual técnico de arquitectura transaccional de turneros `manual_sistema_turnos.md` explicando el modelo de datos, reglas de Firestore y diagramas de flujo.
  - Se indexó en la biblioteca (`README.md`) y en el mapa semántico (`mapa_documentacion_ia.md`).
* **Estatus de Despliegue:** Biblioteca y manuales actualizados y registrados.

### [2026-05-30] - Integración de Cupones en Checkout y Rediseño a Dientes de Sierra SVG (Zigzag)
* **Tipo:** Nueva Funcionalidad / UI/UX / Optimización de Flujo
* **Archivo(s) Modificado(s):**
  - [`src/components/client/coupons/ClientCouponsModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/coupons/ClientCouponsModal.jsx)
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx)
* **Causa Raíz:**
  - El diseño inicial de los cupones con bolitas o puntos de corte no se asimilaba visualmente a un ticket/cupón tradicional, resultando poco profesional para el cliente.
  - Al estar en el paso final del checkout, si el cliente olvidaba el código de descuento, se veía obligado a salir del checkout para copiar el código desde el catálogo o modal de ofertas.
* **Solución Técnica:**
  - **Dientes de Sierra SVG Reales:** Se implementó un diseño de ticket prémium en `ClientCouponsModal.jsx` mediante dos polígonos SVG idénticos que definen un borde en zigzag continuo (dientes de sierra) sin brechas visuales, complementado con una línea de perforación punteada. Se mejoró la distribución para evitar recortes del valor del cupón.
  - **Botón de Cupones en Checkout:** Se integró el botón "🏷 Ver cupones disponibles" en el paso de método de pago de `CheckoutModal.jsx` que levanta el modal de cupones anidado.
  - **Aplicación Automática:** Al pulsar "Usar en mi próxima compra", se autocompleta el campo de entrada del checkout y se ejecuta automáticamente `handleApplyCoupon(code)`, cerrando el modal de cupones y recalculando la orden al instante.
  - **Arreglo de Sintaxis JSX:** Se envolvió el retorno principal de `CheckoutModal.jsx` en un fragment React (`<>...</>`) para contener de manera válida el modal anidado y el `ModalTemplate`.
* **Estatus de Despliegue:** Compilación local exitosa (`npm run build` ✓).

### [2026-05-30] - Corrección: glowEffect no se Persistía en Anuncios de Tipo 'custom'
* **Tipo:** Corrección de Bug / Módulo de Publicidad
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Causa Raíz:** En la función `handleSaveAd`, al construir el `payload` para anuncios de tipo `custom`, el campo `glowEffect` nunca se incluía en el objeto enviado a Firestore. Solo se persistía para anuncios de tipo `inventory`. Como consecuencia: (1) el efecto de brillo visual nunca se activaba en el catálogo aunque el admin lo habilitara en el formulario, y (2) al reabrir el formulario de edición, el campo `glowEffect` se leía como `undefined` y caía al valor por defecto `false`, mostrando el toggle desactivado aunque el admin recordara haberlo habilitado.
* **Solución Técnica:** Se añadió `payload.glowEffect = adFormData.glowEffect || false` dentro del bloque `else` (tipo `custom`) de `handleSaveAd`, alineándolo con el mismo patrón ya existente para el bloque `inventory`.
* **Estatus de Despliegue:** Build local validado ✅.

### [2026-05-30] - Resolución de Destellos y Reinicios de Pasos en Checkout
* **Tipo:** Corrección de Bugs / UI/UX / Flujo de Compra
* **Archivo(s) Modificado(s):**
  - [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx)
* **Causa Raíz:** Al finalizar una compra, se actualizaba el perfil del cliente en el store de autenticación (`useAuthStore`). Dado que el `user` estaba en el array de dependencias del `useEffect` de reinicio del modal, este cambio reactivo forzaba que el paso (`step`) se reseteara momentáneamente al paso 1 antes de saltar al paso 4 (Éxito), produciendo un destello visual del selector de entrega en el fondo.
* **Solución Técnica:** Se inyectó una referencia mutable `lastIsOpenRef` para rastrear las transiciones de apertura del modal. La lógica de reinicio ahora se ejecuta de forma segura exclusivamente cuando el modal pasa de cerrado a abierto (`isOpen && !lastIsOpenRef.current`), bloqueando cualquier reinicio de paso durante la persistencia de datos.
* **Estatus de Despliegue:** Validado localmente.

### [2026-05-30] - Refinamiento de Espaciado y Márgenes en Botones de Domicilio
* **Tipo:** UI/UX / Diseño Responsivo
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx)
* **Causa Raíz:** El texto e iconos de los botones "Llamar Domicilio" y "WhatsApp Domicilio" se encontraban demasiado pegados a los laterales de los botones en pantallas estrechas o contenedores reducidos debido al tamaño de fuente (`text-xs`) y espaciado de margen.
* **Solución Técnica:** Se refinaron las clases utilitarias de Tailwind CSS asignando `text-[11px]`, un interletrado más denso (`tracking-tight`), padding horizontal (`px-2`), un gap reducido (`gap-1.5`) y un tamaño de icono unificado de `size={14}`, garantizando un área de respiración visual óptima.
* **Estatus de Despliegue:** Validado localmente.

### [2026-05-30] - Carga y Persistencia Automática del Perfil de Dirección del Cliente
* **Tipo:** Corrección de Bugs / UI/UX / Flujo de Compra
* **Archivo(s) Modificado(s):**
  - [`src/pages/LoginPage.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/LoginPage.jsx)
* **Causa Raíz:** Al iniciar sesión un cliente recurrente, el store local de autenticación solo recibía el nombre, celular y emoji del usuario desde Firestore, perdiendo la dirección, el barrio, la ciudad y las coordenadas geográficas almacenadas. Como resultado, el cliente se veía obligado a ingresar su dirección de entrega en cada compra.
* **Solución Técnica:** Se modificó el callback de autenticación en `LoginPage.jsx` para estructurar la inyección completa del perfil (`direccion`, `barrio`, `ciudad` y `coords`), mapeándolos al store `useAuthStore` durante el inicio de sesión para que el checkout los recupere y preconfigure de forma transparente.
* **Estatus de Despliegue:** Validado localmente.

### [2026-05-30] - Configuración y Contacto Rápido con Domiciliario (Llamada y WhatsApp)
* **Tipo:** Nueva Funcionalidad / UI/UX / Admin Workflow
* **Archivo(s) Modificado(s):**
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)
  - [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx)
* **Causa Raíz:** Necesidad de facilitar al administrador el contacto y coordinación de entregas con el domiciliario configurado desde el detalle del pedido, manteniendo un diseño simétrico, limpio y profesional sin inconsistencias de alineación visual.
* **Solución Técnica:**
  - Se agregó el campo `deliveryManPhone` en Ajustes de Entrega y Firestore.
  - Se implementaron botones de acción rápida lado a lado en `AdminOrders.jsx` con redirección directa por llamada y WhatsApp.
  - Se corrigió el cierre incorrecto de etiquetas JSX que descuadraba el contenedor grid y se unificó la estética visual mediante paletas de colores suaves (`bg-blue-500/10` y `bg-indigo-500/10` con bordes semi-transparentes de `20%` de opacidad) y el uso de los iconos nativos de Lucide (`Phone` y `MessageCircle`).
* **Estatus de Despliegue:** Validado localmente.

### [2026-05-30] - Actualización de Costos de Envío por el Administrador y Desglose Financiero
* **Tipo:** Nueva Funcionalidad / Lógica de Negocio / UI/UX
* **Archivos Modificados:**
  1. [`src/services/orderService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/orderService.js) [Nueva función transaccional updateOrderShippingCost]
  2. [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) [Integración de desglose e input de edición de envíos]
  3. [`src/pages/admin/AdminSalesDetail.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [Cálculo y render de Total Envíos]
  4. [`src/services/pdfService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/pdfService.js) [Inclusión de Total Envíos y columna de envíos en reporte de ventas]
* **Detalle Técnico:**
  - Se implementó `updateOrderShippingCost(orderId, newCost)` en `orderService.js` ejecutado mediante `runTransaction` para recalcular de forma atómica el `total` del pedido en base al nuevo costo de envío. Adicionalmente, busca y actualiza automáticamente los saldos (`montoTotal`, `saldoPendiente`) en la colección `/credits` si el pedido fue fiado a crédito. Se integró una sanitización exhaustiva mediante `parseFloat` para evitar concatenaciones accidentales de texto en JavaScript al procesar totales.
  - En `AdminOrders.jsx`, se agregó el renderizado de desglose de costos (Subtotal, Descuento, Envío, Total) en la columna derecha de productos. Si el pedido es a domicilio, se presenta un campo interactivo (`input type="number"`) y un botón "Guardar" para que el administrador pueda registrar el costo final de envío del pedido, refrescando la UI reactivamente tras la persistencia en Firestore.
  - Se sumaron los costos de envío a la contabilidad del negocio: agregando la métrica "Total Envíos" al dashboard de análisis de ventas (`AdminSalesDetail.jsx`) y una columna + métrica ejecutiva dedicada en el reporte financiero exportado en PDF (`pdfService.js`).
* **Estado:** ✅ Completado y validado mediante compilación local.

### [2026-05-30] - Tolerancia a Fallos Tipográficos en Buscador de Direcciones (Fuzzy Fallback)
* **Tipo:** Mejora de UX / Robustez de Búsqueda
* **Archivos Modificados:**
  1. [`src/components/ui/LeafletMapPicker.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/LeafletMapPicker.jsx) [Lógica de búsqueda geocodificada]
* **Documentación Modificada:**
  1. [`Biblioteca de Componentes/Formularios_y_UI/Mapa_Interactivo/mapa_interactivo.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Mapa_Interactivo/mapa_interactivo.md) [Bache de versión a 1.1 con código fuente sincronizado]
* **Detalle Técnico:**
  - Se modificó `handleSearch` en `LeafletMapPicker.jsx` para que si la consulta inicial de Nominatim retorna 0 resultados, y contiene espacios, se aplique un algoritmo recursivo de descarte de palabras de derecha a izquierda.
  - Al remover progresivamente la última palabra del string (ej: "Barbosa antioaui" -> "Barbosa"), el motor de geocodificación recupera exitosamente la ubicación coincidente más cercana, mejorando sustancialmente la tolerancia a errores de escritura del usuario.
* **Estado:** ✅ Completado, compilado y documentado.

### [2026-05-30] - Persistencia de Ubicación y Extracción a Biblioteca: useSavedLocation Hook
* **Tipo:** Nueva Funcionalidad / Biblioteca de Componentes / Refactorización de Portabilidad
* **Archivos Modificados:**
  1. [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [Uso de datos e inicio de dirección]
  2. [`src/services/userService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/userService.js) [Guardado de perfil completo en Firestore]
* **Documentación Creada:**
  1. [`Biblioteca de Componentes/Logica_y_Hooks/useSavedLocation/use_saved_location.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Logica_y_Hooks/useSavedLocation/use_saved_location.md) [Nueva Documentación]
  2. [`Biblioteca de Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/README.md) [Actualizado con el hook]
  3. [`Estandar de Desarrollo/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_documentacion_ia.md) [Actualizado con el hook]
* **Detalle Técnico:**
  - Se modificó `saveClientProfile` para admitir y mergear campos de entrega física como `direccion`, `barrio`, `ciudad` y `coords`.
  - Se adaptó el arranque de `CheckoutModal.jsx` para evaluar los campos de dirección guardados del cliente y pre-inicializar el stepper, formularios y las coordenadas en el Leaflet Map Picker.
  - Se abstrajo el motor lógico en el hook portable `useSavedLocation` para facilitar la migración y reusabilidad en otros proyectos sin dependencias Firebase duras.
* **Estado:** ✅ Completado y documentado.

### [2026-05-30] - Optimización de Rendimiento PWA: Precarga Proactiva (Preloading) de Bundles Lazy
* **Tipo:** Optimización de Rendimiento / Mobile UX
* **Archivos Modificados:**
  1. [`src/layouts/ClientLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/ClientLayout.jsx) [Layout Cliente]
  2. [`src/layouts/AdminLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/AdminLayout.jsx) [Layout Administrador]
* **Causa Raíz:** Al alternar entre pestañas y rutas del cliente/admin, se experimentaba un ligero retraso o lag visual en dispositivos móviles. Esto ocurría porque los componentes se cargan dinámicamente (`lazy` + `Suspense`) en `AppRoutes.jsx`, requiriendo descargar y evaluar el bundle del JS en tiempo de navegación.
* **Solución Técnica:**
  - Se implementó precarga proactiva de recursos (Prefetching) vinculando listeners `onMouseEnter` (escritorio) y `onTouchStart` (dispositivos móviles/táctil) a cada NavLink en las barras de navegación.
  - Al realizarse la acción táctil de click/tap o pasar el cursor, el navegador descarga proactivamente el bundle JS en segundo plano milisegundos antes del cambio de ruta.
  - Aplicado a todas las rutas principales del cliente (Catálogo, Favoritos, Pedidos, Créditos, Garantías y Perfil en sidebar y nav bottom) y a todas las rutas del administrador (Inicio, Inventario, POS, Pedidos y Configuración).
* **Estado:** ✅ Completado y optimizado.

### [2026-05-29] - Extracción a Biblioteca: MapToggle y OrderCard (Tarjeta de Pedido Admin)
* **Tipo:** Biblioteca de Componentes / Refactorización de Portabilidad
* **Protocolo:** `@extraer-componente` — Antigravity AI
* **Archivos Fuente Auditados:**
  1. [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx) — Función `MapToggle` (líneas 25–58) y función `renderOrderCard` (líneas 597–820)
* **Documentación Creada:**
  1. [`Biblioteca de Componentes/Formularios_y_UI/Mapa_Desplegable/mapa_desplegable.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Mapa_Desplegable/mapa_desplegable.md) — Nuevo componente documentado
  2. [`Biblioteca de Componentes/Pedidos_y_Gestion/Tarjeta_Pedido_Admin/tarjeta_pedido_admin.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Pedidos_y_Gestion/Tarjeta_Pedido_Admin/tarjeta_pedido_admin.md) — Nuevo componente documentado
  3. [`Biblioteca de Componentes/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/README.md) — Actualizado (nueva sección `Pedidos_y_Gestion` + entrada `MapToggle`)
  4. [`Estandar de Desarrollo/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_documentacion_ia.md) — Actualizado (nuevas entradas en tablas)
* **Detalle Técnico:**
  - **`MapToggle`:** Componente autocontenido de 40 líneas que encapsula el estado `open` para mostrar/ocultar un `LeafletMapPicker` en `readOnly`. Usa `AnimatePresence` + `motion.div` con `height: 0→auto`. Ícono de pin SVG inline sin lucide. Documentado con 9 secciones estándar incluyendo diagrama Mermaid de secuencia.
  - **`OrderCard`:** Refactorización de la función `renderOrderCard` (interna al componente padre) a un componente autónomo con props explícitas. Conserva toda la lógica de visualización: acordeón Framer Motion, chip de estado dinámico, 2 columnas de detalle, bifurcación crédito vs. pago estándar en acciones, mapa desplegable condicional, lista de productos. Documentado con esquema completo del objeto `order` y diagrama de flujo Mermaid.
  - **Verificación de Unicidad:** Confirmado que no existían componentes con propósito idéntico en el catálogo previo de la biblioteca.
* **Estado:** ✅ Extracción y documentación completadas. Sin modificaciones al código fuente de producción.

### [2026-05-30] - Corrección definitiva del flash de color rosa al borrar caché

* **Tipo:** Corrección de Bug / UX / Inicialización de Estado
* **Archivos Modificados:**
  1. [`src/store/appConfigStore.js`](file:///d:/Aplicaciones/App%20Ventas/src/store/appConfigStore.js)
  2. [`src/constants/palettes.js`](file:///d:/Aplicaciones/App%20Ventas/src/constants/palettes.js)
* **Causa Raíz:** El valor `theme: 'rosa-elegante'` en el estado inicial de Zustand causaba un flash de color de marca antes de que el store `persist` pudiera rehidratarse desde `localStorage` o Firestore. Adicionalmente, los fallbacks `|| '#e91e8c'` en `getActiveColors()` del motor de paletas propagaban el color rosa como último recurso de seguridad en caso de que `baseColors` fuera incompleto.
* **Solución Técnica:**
  - Se cambió `theme` a `'neutral'` en el estado inicial del store, garantizando que en primera carga (sin caché) la app use la paleta gris/blanca neutral en lugar de rosa.
  - Se reemplazaron todos los fallbacks `|| '#e91e8c'`, `|| '#f48fb1'`, `|| '#ff4081'` y `|| '#f8bbd9'` en `getActiveColors()` por los colores slate neutros (`#1e293b`, `#64748b`, `#0f172a`, `#e2e8f0`, `#3b82f6`) que corresponden a la paleta `neutral`.
* **Estado:** ✅ Build compilado sin errores.


* **Tipo:** Biblioteca de Componentes / Refactorización de Código / Nueva Funcionalidad / Bugfix / UI/UX
* **Archivos Modificados:**
  1. [`src/pages/admin/AdminClaims.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminClaims.jsx) [Lógica Admin]
  2. [`src/pages/client/ClientClaims.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientClaims.jsx) [Paginación y Vista Cliente]
  3. [`src/pages/client/ClientOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientOrders.jsx) [Paginación Pedidos y Estilos Tarjeta]
  4. [`src/pages/client/ClientCredits.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientCredits.jsx) [Paginación Créditos]
  5. [`src/pages/admin/AdminCredits.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminCredits.jsx) [Paginación Créditos Admin]
  6. [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [Ajustes de Local y Mapa]
  7. [`src/components/client/checkout/CheckoutModal.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) [Checkout de Clientes y Mapa]
  8. [`src/components/ui/LeafletMapPicker.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/LeafletMapPicker.jsx) [Nuevo Componente de Mapa Leaflet]
  9. [`D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Formularios_y_UI\Paginacion\pagination.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Paginacion/pagination.md) [Actualización Documentación Biblioteca]
* **Detalle Técnico:**
  - **AdminClaims:** Se inyectó la lógica de bloqueo de cambio de estado. Si un reclamo es aprobado o rechazado, ambos botones de cambio de estado y el área de texto se deshabilitan permanentemente para evitar doble marcación. Al aprobar o rechazar, se abre automáticamente la ventana de contacto de WhatsApp del cliente con la plantilla de respuesta construida con el estado y notas actualizados.
  - **Paginación Client-Side (ClientClaims, ClientOrders, ClientCredits):** Se implementó e integró la paginación de **10 elementos por página** utilizando el componente `Pagination` en las vistas de Garantías y Reclamos del cliente, Pedidos Comunes y Pedidos Especiales, y Créditos Activos/Pagados.
  - **Corrección de Visualización Condicional (Regla de 10 elementos):** Se envolvieron todos los renderizados de `<Pagination />` en condicionales explícitas de longitud de elementos (`length > 10`), garantizando que la barra de paginación aparezca única y estrictamente cuando la lista supera los 10 ítems. También se aplicó esta lógica condicional a los botones en `AdminCredits.jsx`.
  - **Corrección de Transición del Filtro (ClientClaims):** Se corrigió la doble preselección visual (lag de interpolación de bordes/sombras causado por `transition-all` al alternar clases) mediante la implementación de un pill de fondo animado y deslizable con Framer Motion (`layoutId="activeClaimTab"`). Esto provee un deslizamiento suave e instantáneo entre pestañas eliminando el retraso.
  - **Corrección Estética en Tarjetas de Pedidos (ClientOrders):** Se solucionó la colisión del borde superior (`border-t`) de la sección de acciones de la tarjeta con el botón "Descargar Factura". Se eliminó el padding superior nulo (`pt-0`), estableciendo un padding simétrico estándar `p-5` y organizando el flujo interior con la clase flex/grid correspondiente (`space-y-4`), devolviendo una separación aireada de 20px entre el borde y el botón.
  - **Selector y Buscador Interactivo de Dirección en Mapa:** Se creó e implementó el componente reutilizable `LeafletMapPicker.jsx` que carga Leaflet y OpenStreetMap de forma asíncrona mediante CDN para mantener el bundle inicial liviano.
    1. **Buscador en Mapa:** Añade un campo de búsqueda geocodificada hacia adelante que procesa búsquedas mediante Nominatim API para desplazar el mapa y pin directamente a la dirección especificada.
    2. **Pin Arrastrable / Clic en Mapa:** Permite mover el pin de localización de forma manual; al soltar el pin o hacer clic en una coordenada del mapa, realiza geocodificación inversa con Nominatim para autocompletar la dirección de texto física del local.
    3. **Integración:** En `AdminSettings.jsx` opera en modo completo (edición, búsqueda y guardado de coordenadas `{ lat, lng }`), mientras que en `CheckoutModal.jsx` se muestra al cliente en modo protegido (`readOnly`) centrado exactamente en las coordenadas físicas del local.
  - **Extracción de Biblioteca:** Se actualizó de manera rigurosa la documentación del componente `Pagination` a la versión 1.2 siguiendo los estándares de la biblioteca de componentes (Props API, secuencia Mermaid, props stateless, inyección HSL y SVGs nativos).

### [2026-05-30] - Corrección de Visualización Condicional y Layout de Garantías en Pedidos y Solución a Errores de Consola
* **Tipo:** Bugfix / Seguridad / UI/UX
* **Archivos Modificados:**
  1. [`src/pages/admin/AdminOrders.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminOrders.jsx)
  2. [`src/components/common/ModalTemplate.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/common/ModalTemplate.jsx)
  3. [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules)
* **Causa Raíz:**
  - **AdminOrders:** Al desactivar el módulo de garantías en ajustes, el botón no desaparecía correctamente o dejaba el layout descuadrado.
  - **ModalTemplate / Hydration Error**: Se pasaba un contenedor `div` con los pasos a la prop `subtitle` del modal template, el cual se renderizaba dentro de un elemento `<p>`, violando el estándar HTML.
  - **Firestore / Permission Denied**: La transacción de creación de pedidos en el cliente intentaba actualizar la propiedad `variantes` de los documentos de productos directamente sin estar autenticado como administrador, lo que provocaba que las reglas de seguridad de Firestore rechazaran la compra.
* **Solución Técnica:**
  - Se condicionó el botón de garantías y se usó `flex-1` en el botón de encargos con un ancho responsivo fijo en pantallas grandes (`sm:w-[420px]`). Esto hace que ocupe el 100% de la pantalla cuando está deshabilitado y 50% cuando está habilitado.
  - Se cambió el contenedor del subtítulo en [ModalTemplate.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/common/ModalTemplate.jsx) de un `<p>` a un `<div>`.
  - Se modificaron las reglas en [firestore.rules](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) para autorizar la actualización de productos por usuarios públicos siempre y cuando solo se alteren los campos `variantes` y `updatedAt`.
* **Estatus de Despliegue:** Validado localmente con build y desplegado exitosamente a Firebase Hosting y Cloud Firestore Rules.

### [2026-05-30] - Extracción y Documentación del Componente Desplegable Premium (CustomSelect)
* **Tipo:** Biblioteca de Componentes / Refactorización de Portabilidad
* **Archivos Afectados:**
  1. [`src/pages/admin/AdminSales.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/pages/admin/AdminSales.jsx) [Uso Práctico]
  2. [`D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Formularios_y_UI\Selector_Desplegable\custom_select.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Selector_Desplegable/custom_select.md) [Nueva Documentación]
  3. [`D:\PROTOTIPE\Documentacion PROTOTIPE\Estandar de Desarrollo\mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_documentacion_ia.md) [Registro del GPS de IA]
  4. [`D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/README.md) [Registro del Catálogo]
* **Detalle Técnico:**
  - Se diseñó y documentó la lista desplegable interactiva (`CustomSelect`) de marca blanca bajo el estándar atómico y de portabilidad integral de la biblioteca (reemplazando Lucide con SVGs nativos optimizados para chevron y check, y abstrayéndolo 100% de dependencias e interfaces rígidas).
  - Incorpora la lógica de ciclo de vida con un tap-shield overlay `fixed inset-0 bg-transparent` que intercepta clics exteriores y previene el burbujeo táctil accidental, control síncrono del z-index elevado a 50 al desplegarse, y diagramación de secuencia Mermaid del flujo operativo.
* **Estado:** ✅ Completado e indexado sin errores.

### [2026-05-29] - Corrección Bug: Feature Múltiples Empleados no funcional en POS y Reportes
* **Tipo:** Corrección de Bug / Lógica de Negocio
* **Archivos Modificados:**
  1. [`src/pages/admin/AdminSales.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/pages/admin/AdminSales.jsx)
  2. [`src/pages/admin/AdminSalesDetail.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx)
* **Detalle Técnico:**
  - **POS (AdminSales):** La condición `hasMultipleEmployees && employees.length > 0` ocultaba el selector completo cuando el array de empleados era vacío (race condition en carga o mala configuración). Se separó la condición: el bloque se muestra siempre que `hasMultipleEmployees` sea true, y se renderiza el selector si hay empleados configurados, o un mensaje de advertencia de configuración incompleta si el array está vacío. Además, la validación de finalización de venta ahora solo bloquea si `employees.length > 0 && !selectedEmployee`, evitando bloquear ventas cuando el sistema aún no tiene empleados registrados.
  - **AdminSalesDetail:** El cálculo del ranking de empleados usaba `order.vendedor || 'Sin asignar'`, agrupando TODAS las órdenes (incluyendo compras de clientes en línea sin vendedor) bajo "Sin asignar", contaminando el ranking. Se corrigió para solo incluir órdenes que tengan `order.vendedor` explícitamente asignado.
* **Estado:** ✅ Build compilado sin errores.

### [2026-05-29] - Integración de Gestión de Múltiples Empleados en POS y Reportes
* **Tipo:** Nueva Funcionalidad Ecosistema / Feature Flag
* **Archivos Modificados:**
  1. [`src/pages/admin/AdminSales.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/pages/admin/AdminSales.jsx)
  2. [`src/pages/admin/AdminSalesDetail.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx)
* **Detalle Técnico:**
  - **POS (AdminSales):** Se integró el flag `hasMultipleEmployees` para renderizar condicionalmente un panel con un listado desplegable (`<select>`) de los empleados configurados. Se bloquea la finalización de la venta con un prompt si el flag está activo y no se ha seleccionado un vendedor. El vendedor seleccionado es propagado en la orden bajo el campo `vendedor` en la base de datos Firestore y en el comprobante de pago impreso.
  - **Detalle de Ventas (AdminSalesDetail):** Se importó el store y se calculó el consolidado acumulativo de ventas y cantidad de transacciones completadas por cada empleado en el rango de fechas seleccionado. Se añadió un panel condicional premium con barras de progreso que detalla el ranking y aporte porcentual de cada vendedor.
* **Estado:** ✅ Completado y validado en compilación de producción.


---

### [2026-05-29] - Inclusión de Descripción en Productos Personalizados (POS)
* **Tipo:** Nueva Funcionalidad de UI/UX
* **Archivos Modificados:**
  1. [`src/pages/admin/AdminSales.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/pages/admin/AdminSales.jsx)
* **Detalle Técnico:**
  - Se añadió la variable `descripcion` en el objeto y estado de inicialización/limpieza de `customItem`.
  - Se agregó el campo visual de entrada de texto "Descripción (Opcional)" en el formulario de la sección de productos personalizados (`saleMode === 'custom'`).
  - Se adaptó la función `addCustomItemToCart` para propagar el valor de la descripción al carrito POS.
  - Se mapeó e inyectó la descripción en el renderizado del carrito del panel derecho y en la plantilla del comprobante de impresión de recibo.
* **Estado:** ✅ Completado y validado en compilación de producción.

---

### [2026-05-29] - Ajuste de Separación: Precio y Acciones en Tarjetas de Favoritos
* **Tipo:** Ajuste UI / UX / Layout Responsivo
* **Archivos Modificados:**
  1. [`src/pages/client/ClientFavorites.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/pages/client/ClientFavorites.jsx)
* **Detalle Técnico:**
  - Se añadió la clase `gap-3` al contenedor flex inferior de la tarjeta de favoritos. Esto asegura una separación mínima física controlada entre el precio (`precioBase`) y la botonera de acciones (`Quitar de favoritos` y `Agregar al carrito`), evitando la colisión o encabalgamiento en pantallas con anchos reducidos.
* **Estado:** ✅ Completado y validado en compilación de producción.

---

### [2026-05-29] - Corrección de Desempeño y Sincronización de Color en ModalTemplate
* **Tipo:** Refactorización de UI/UX / Optimización de Rendimiento y Consistencia de Marca
* **Archivos Modificados:**
  1. [`src/components/common/ModalTemplate.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/components/common/ModalTemplate.jsx)
* **Detalle Técnico:**
  - **Eliminación de Lag de Animación:** Se retiró el estilo estático `transform: 'translate3d(0,0,0)'` que colisionaba directamente con las animaciones de traslación (`y`) inyectadas por Framer Motion en el modal de deslizamiento (`slide-up`), dejando únicamente `willChange: 'transform'` para delegar correctamente la aceleración por hardware al motor de animación de Framer Motion.
  - **Estandarización HSL del Icono de Cabecera:** Se reemplazaron las clases de opacidad Tailwind estáticas (`bg-primary/10` y `border-primary/20`) por clases de utilidad dinámica en el CSS (`bg-primary-soft` y `border-primary-soft`), garantizando que el color e intensidad del contenedor del icono se actualicen instantáneamente en el navegador con cualquier combinación de temas HSL de la marca cliente, solucionando el bug del icono azul residual.
* **Estado:** ✅ Completado y validado en compilación de producción.

---

### [2026-05-29] - Corrección de Estilo: Icono de Cabecera en ModalTemplate
* **Tipo:** Refactorización de UI/UX / Unificación Estética
* **Archivos Modificados:**
  1. [`src/components/common/ModalTemplate.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/components/common/ModalTemplate.jsx)
* **Detalle Técnico:**
  - Se reemplazaron las clases de estilo hardcodeadas (`bg-blue-50`, `text-blue-600`) del icono superior izquierdo por variables del tema dinámico (`bg-primary/10`, `text-primary`, `border-primary/20`) para asegurar la consistencia del color de marca en todos los modales.
* **Estado:** ✅ Completado.

---

### [2026-05-29] - Integración HSL en Detalle y Optimización de Modales Slide-Up Móvil
* **Tipo:** Refactorización de UI/UX / Rendimiento Móvil
* **Archivos Modificados:**
  1. [`src/components/client/catalog/ProductDetailModal.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx)
  2. [`src/components/common/ModalTemplate.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/components/common/ModalTemplate.jsx)
* **Detalle Técnico:**
  - Se eliminaron las clases de color rígidas (`blue-600`) y sombras hardcodeadas del modal de detalle de producto, adaptándolos a variables HSL dinámicas (`bg-primary`, `text-primary`, `border-primary`, `ring-primary`, `shadow-primary/20`).
  - Se optimizó la animación de deslizamiento hacia arriba (`slide-up`) en `ModalTemplate.jsx` usando una transición tween `easeOut` acelerada por hardware de `0.25s` en lugar del spring físico (lento y pesado en dispositivos móviles).
  - Se desactivó el filtro de desenfoque de fondo en móviles (`sm:backdrop-blur-sm`) para evitar caídas bruscas de FPS durante el ciclo de renderizado, eliminando el lag.
* **Estado:** ✅ Completado.

---

### [2026-05-29] - Micro-animaciones y Glow Dinámico en Botón de Carrito (Header Móvil)
* **Tipo:** Mejora de UX / Animación / Micro-interacciones
* **Archivos Modificados:**
  1. [`src/layouts/ClientLayout.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/layouts/ClientLayout.jsx)
* **Detalle Técnico:**
  - Rediseñado el botón del carrito móvil inyectando un indicador con rebote (`spring` stiffness 400) y un punto de luz sutil en estado vacío.
  - Implementada una animación infinita de balanceo rotacional (`rotate: [0, -10, 10, -10, 0]`) en el icono interno de carrito.
  - Añadido efecto concéntrico de ondas CSS-glow (`box-shadow`) que expande pulsaciones elásticas visuales hacia afuera únicamente si el carrito tiene productos agregados.
* **Estado:** ✅ Completado.

---

### [2026-05-29] - Actualización de Icono de Navegación: Catálogo de Clientes
* **Tipo:** Mejora de UX / Interfaz de Usuario
* **Archivos Modificados:**
  1. [`src/layouts/ClientLayout.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/layouts/ClientLayout.jsx)
* **Detalle Técnico:**
  - Se modificó el icono alusivo al catálogo en los menús lateral de escritorio (`NAV_ITEMS_LEFT`) e inferior móvil (`ALL_NAV_ITEMS`).
  - Se cambió `ShoppingCart` por `Store` para evitar redundancia y confusión con el botón de carrito de compras del encabezado.
* **Estado:** ✅ Completado.

---

### [2026-05-29] - Extracción a la Biblioteca de Componentes: Alertas y Confirmaciones Globales (useAlertConfirm)
* **Tipo:** Biblioteca de Componentes / Refactorización de Portabilidad
* **Archivos Afectados:**
  1. [`src/components/common/AlertConfirmContext.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/components/common/AlertConfirmContext.jsx) [Código Base]
  2. [`D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Logica_y_Hooks\Alertas_Confirmaciones_Globales\alert_confirm_context.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Logica_y_Hooks/Alertas_Confirmaciones_Globales/alert_confirm_context.md) [Nueva Documentación]
* **Detalle de Portabilidad:**
  - Extraído el módulo unificado de modales de confirmación reactivos y promesificados asíncronos (`showAlert`, `showConfirm`).
  - Documentado con la especificación de 9 puntos exigida por el estándar de desarrollo de marca blanca: Propósito, Estilos HSL y variables CSS custom, Props API tipada, Código React completo, Lógica de Promesas asíncronas, Aislamiento de servicios Firebase, Diagrama de secuencia Mermaid, Caso de consumo y Metadatos de Origen.
* **Estado:** ✅ Completado, sincronizado en el mapa de documentación general.

---

### [2026-05-29] - Paginación del Catálogo de Clientes e Introducción de Componente Reutilizable
* **Tipo:** Nueva Característica / Optimización de Rendimiento
* **Archivos Modificados:**
  1. [`src/pages/client/ClientCatalog.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/pages/client/ClientCatalog.jsx)
  2. [`src/components/ui/Pagination.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/components/ui/Pagination.jsx) [NUEVO]
  3. [`D:\PROTOTIPE\Documentacion PROTOTIPE\Biblioteca de Componentes\Formularios_y_UI\Paginacion\pagination.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Paginacion/pagination.md) [NUEVA DOCUMENTACIÓN]
* **Detalle Técnico:**
  - Se creó el componente `Pagination.jsx` en la biblioteca atómica `/src/components/ui/`, 100% portable y desacoplado, libre de librerías externas de iconos (usando SVGs nativos para las flechas de navegación).
  - Se configuró la paginación client-side de **20 productos por página** en `ClientCatalog.jsx`.
  - Se implementó un `useEffect` que detecta cambios de categorías o filtros avanzados y restablece de forma segura el cursor a la página 1 (`setCurrentPage(1)`).
  - Se programó la desactivación inteligente de la paginación cuando existe texto en el buscador (`searchTerm`), garantizando la descarga instantánea y render de todas las coincidencias del catálogo guardado en la caché de TanStack Query.
  - Al cambiar de página, se realiza un scroll fluido al inicio del catálogo (`window.scrollTo({ top: 0, behavior: 'smooth' })`).
* **Estado:** ✅ Completado.

---

### [2026-05-29] - Corrección Definitiva v3: Cierre Popover Notificaciones en Mobile (Capture Phase)
* **Tipo:** Corrección de Bug / Mobile UX / Event Handling
* **Archivos Modificados:**
  1. [`src/layouts/ClientLayout.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/layouts/ClientLayout.jsx)
  2. [`src/layouts/AdminLayout.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/layouts/AdminLayout.jsx)
* **Causa Raíz Final:** Framer Motion instala handlers de `touchstart` en sus `motion.div` que llaman `stopPropagation()` durante la fase de bubble. Los intentos anteriores (overlay `onClick`, overlay `onMouseDown`, `useRef + touchstart` en bubble phase) fallaban en mobile porque el evento nunca llegaba al listener en `document` ya que era interceptado por Framer Motion antes.
* **Solución Definitiva:**
  - Se migró a `document.addEventListener('touchstart', handler, { capture: true, passive: true })`. La fase de **captura** fluye de `document → target`, por lo que nuestro handler se ejecuta *antes* que cualquier elemento hijo, incluyendo los handlers de Framer Motion. Nadie puede interceptarlo.
  - Se usa `useRef` (`notifDesktopRef`, `notifMobileRef`) en los contenedores de campana. El handler verifica `ref.contains(e.target)` para decidir si cerrar.
  - `mousedown` también usa `{ capture: true }` para consistencia en desktop.
  - El `useEffect` se activa/desactiva reactivamente solo cuando el panel está abierto, y hace cleanup en el return.
  - Se eliminaron todos los overlays transparentes y `onMouseDown` del JSX — código 100% limpio.
  - Se agregó `useRef` al import de React en `AdminLayout.jsx`.
* **Estado:** ✅ Completado, build exitoso (`npm run build`, 1.01s).

---

### [2026-05-29] - Corrección Definitiva de Cierre por Clic Exterior en Popovers de Notificaciones
* **Tipo:** Corrección de Bug / UX / Event Handling
* **Archivos Modificados:**
  1. [`src/layouts/ClientLayout.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/layouts/ClientLayout.jsx)
  2. [`src/layouts/AdminLayout.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/layouts/AdminLayout.jsx)
* **Causa Raíz:** El overlay usaba `onClick` para cerrar el popover. En el ciclo de eventos touch/mouse (`mousedown → mouseup → click`), el `click` del overlay cerraba el panel pero ese mismo evento burbujeaba hasta el botón campana (que tenía un `onClick` con `!state` toggle), re-abriéndolo inmediatamente. El usuario percibía que el panel nunca cerraba.
* **Solución Aplicada:**
  - Se reemplazó `onClick` por `onMouseDown` con `e.stopPropagation()` en ambos overlays de cierre. Esto intercepta la cadena de eventos en el primer disparo, antes de que se genere el `click` sintético.
  - Se añadió `onMouseDown={(e) => e.stopPropagation()}` en los `motion.div` del popup para que los clics internos no escalen al overlay y cierren el panel accidentalmente.
  - Aplicado simétricamente en **ClientLayout** (sidebar desktop + header mobile) y **AdminLayout** (sidebar desktop + botón flotante mobile).
* **Estado:** ✅ Completado, build exitoso (`npm run build`).

---

### [2026-05-29] - Corrección de Parpadeo en Carga Inicial (Introducción de Paleta Neutral)
* **Tipo:** Corrección de Bug / UX
* **Archivos Modificados:**
  1. [`src/store/appConfigStore.js`](file:///D:/PROTOTIPE/App%20Ventas/src/store/appConfigStore.js)
  2. [`src/constants/palettes.js`](file:///D:/PROTOTIPE/App%20Ventas/src/constants/palettes.js)
  3. [`index.html`](file:///D:/PROTOTIPE/App%20Ventas/index.html)
* **Mejoras Aplicadas:**
  - **Nueva Paleta Neutral de Carga:** Se creó y registró la paleta de colores `'neutral'` (fondo claro `#f8fafc` y superficies blancas) en `palettes.js`.
  - **Tema de Fallback Inicial:** Se configuró el tema `'neutral'` como el valor por defecto de `theme` en `appConfigStore.js` y como el fallback principal del motor de estilos (`getActiveColors`). Esto previene destellos oscuros (carbon-oscuro) o de marcas específicas (rosa-elegante) en el primer render antes de la suscripción Firestore.
  - **Ajuste de Meta Tag theme-color Base:** Se actualizó la metaetiqueta `theme-color` en `index.html` de `#000000` a `#ffffff` para que el navegador mantenga una barra e interfaz de carga clara de forma nativa desde el primer segundo.
* **Estado:** ✅ Completado y validado en local de forma definitiva.

---

### [2026-05-29] - Cierre por Clic Exterior en Popover de Notificaciones del Cliente
* **Tipo:** UX / Corrección de Interfaz
* **Archivos Modificados:**
  1. [`src/layouts/ClientLayout.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/layouts/ClientLayout.jsx)
* **Mejoras Aplicadas:**
  - **Alineación con Estándar Admin:** Se inyectó una capa de fondo invisible (`fixed inset-0 bg-transparent z-40`) dentro del renderizado condicional de `AnimatePresence` de notificaciones en `ClientLayout.jsx` (tanto para la vista de escritorio como para el header móvil). Al hacer clic en cualquier lugar de la pantalla exterior a la ventana de notificaciones, se cierra la bandeja de forma automática e inmediata, unificando la experiencia con el panel de administración.
* **Estado:** ✅ Completado y validado.

---

### [2026-05-29] - Sincronización Dinámica de color temático (theme-color) de Navegador y PWA
* **Tipo:** UX / Integridad PWA
* **Archivos Modificados:**
  1. [`src/App.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/App.jsx)
  2. [`src/utils/dynamicManifest.js`](file:///D:/PROTOTIPE/App%20Ventas/src/utils/dynamicManifest.js)
* **Mejoras Aplicadas:**
  - **Meta-tag Dinámico:** Implementación de inyección dinámica para el elemento `<meta name="theme-color">` dentro de `ThemeApplier` para leer y sincronizar en tiempo real el valor de fondo `--color-bg` activo de la paleta.
  - **Sincronización PWA:** Se adaptó `updateDynamicManifest` para recibir el color de fondo y aplicarlo a `background_color` y `theme_color` en el JSON del manifiesto PWA. Esto hace que la barra de herramientas del explorador móvil y la pantalla de inicio (splash screen) al instalar la app se mimeticen 100% con el color del fondo de la aplicación.
* **Estado:** ✅ Sincronización de color terminada y probada.

---

### [2026-05-29] - Corrección de Estado Inicial del Modo Oscuro al Limpiar Caché
* **Tipo:** Corrección de Bug, UX / Inicialización de Estado
* **Archivos Modificados:**
  1. [`src/store/appConfigStore.js`](file:///D:/PROTOTIPE/App%20Ventas/src/store/appConfigStore.js)
* **Mejoras Aplicadas:**
  - **Desactivación de Modo Oscuro Inicial:** Se modificó la inicialización del flag `isDarkMode` de `true` a `false` en el store persistido de Zustand. Esto previene que la aplicación se renderice forzadamente en modo oscuro por defecto al ingresar por primera vez o limpiar la memoria caché del navegador (tanto para clientes como administradores), respetando el flujo de luz natural inicial.
* **Estado:** ✅ Cambiado e integrado en local.

---

### [2026-05-29] - Refactorización y Extracción de CategoryManager a Componente UI Stateless y Portable
* **Tipo:** Refactorización, Modularidad Ecosistema y Biblioteca de Componentes
* **Archivos Creados/Modificados:**
  1. [`src/components/ui/CategoryManager.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/components/ui/CategoryManager.jsx) (Nuevo componente de UI)
  2. [`src/components/admin/inventory/CategoryManager.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/components/admin/inventory/CategoryManager.jsx) (Modificado a wrapper/contenedor)
  3. [`Biblioteca de Componentes/Formularios_y_UI/Gestor_Categorias/gestor_categorias.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Gestor_Categorias/gestor_categorias.md) (Nueva Documentación)
  4. [`Estandar de Desarrollo/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_documentacion_ia.md) (Modificado para registrar la entrada)
* **Mejoras Aplicadas:**
  - **Arquitectura de Presentación y Contenedor:** Se separó la lógica de estado de Firestore y mutations (provenientes de `hooks/useInventory`) de la interfaz de usuario. El archivo original se convirtió en un Container Component que maneja datos y estados de carga, delegando el renderizado al nuevo componente UI stateless.
  - **Portabilidad Absoluta:** Se eliminó la dependencia rígida de `lucide-react` en el componente de UI mediante la inyección de un set de íconos SVG nativos e interactivos en línea.
  - **Selector de Íconos Enriquecido:** Se portó la rejilla de selección de íconos con soporte de búsqueda en tiempo real por tags de categorías de negocio (moda, comida, tecnología, hogar, etc.).
* **Estado:** ✅ Refactorización finalizada y documentada en la biblioteca.

---

### [2026-05-29] - Optimización del Toast de Confirmación en Ajustes de Administrador
* **Tipo:** UI/UX, Estabilidad y Portalización de Componentes
* **Archivos Modificados:**
  1. [`src/pages/admin/AdminSettings.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/pages/admin/AdminSettings.jsx)
* **Mejoras Aplicadas:**
  - **Uso de Portales (ReactDOM.createPortal):** Se encapsuló el renderizado del toast `saveMessage` usando un Portal hacia el `document.body` de manera que se mantenga en el DOM global sin importar que cambien las secciones internas (`key={activeSection ?? 'menu'}`) dentro del componente principal de Ajustes. Esto eliminó por completo los saltos/brincos bruscos y los cortes de animación.
  - **Reposicionamiento Táctico en Mobile:** Se modificaron las clases de posicionamiento para renderizar el Toast en `top-4 left-1/2 -translate-x-1/2` (centrado arriba) en pantallas móviles, y arriba a la derecha (`top-4 md:right-4 md:translate-x-0 md:left-auto`) en escritorio. Esto previno la superposición de notificaciones de confirmación sobre la barra de navegación inferior móvil (`fixed bottom-0`), eliminando cualquier bloqueo de interacción de botones de navegación del usuario.
  - **Suavizado de Transiciones:** Se configuró una física de resorte más elástica y reactiva (`stiffness: 380`, `damping: 28`) con un desplazamiento inicial desde `y: -40` para mayor fluidez.
* **Estado:** ✅ Toast fluido y optimizado en local.

---

### [2026-05-29] - Estandarización Visual de Ventanas de Notificaciones
* **Tipo:** UI/UX y Consistencia Visual
* **Archivos Modificados:**
  1. [`src/layouts/AdminLayout.jsx`](file:///D:/PROTOTIPE/App%20Ventas/src/layouts/AdminLayout.jsx)
* **Mejoras Aplicadas:**
  - **Unificación de Fondos:** Se removieron las clases `bg-surface/95` y `backdrop-blur-xl` del popover de notificaciones del Administrador en Mobile. Se reemplazó por la clase `bg-surface` plana, de modo que comparta la estética clara, limpia y consistente que tiene el popover del cliente.
* **Estado:** ✅ Estilos estandarizados en local.

---

### [2026-05-29] - Auditoría y Parche Crítico de Seguridad en Firestore Rules
* **Tipo:** Seguridad y Calidad del Código (Auditoría Técnica)
* **Archivos Modificados:**
  1. [`firestore.rules`](file:///D:/PROTOTIPE/App%20Ventas/firestore.rules)
* **Mejoras Aplicadas:**
  - **Mitigación de Fugas en /users:** Se bloqueó la lectura pública masiva (`allow read, write: if true;`) en perfiles y listas de números de celular/nombres de clientes. Ahora se valida `isAdmin()` o coincidencia estricta de ID (`userId`).
  - **Aseguramiento de Pedidos y Reclamos:** Se restringió `allow read` en `/orders`, `/claims` y `/clientNotifications` para requerir que la consulta provenga del Administrador o del celular correspondiente al documento, impidiendo lecturas masivas no autorizadas.
  - **Helpers Reutilizables:** Implementación de la función `isAdmin()` para estandarizar accesos de administrador y reducir duplicidad.
* **Estado:** ✅ Reglas locales securizadas y listas para despliegue.

---

### [2026-05-29] - Mapa Semántico Global de Documentación para la IA
* **Tipo:** Estándar de Desarrollo y Productividad IA
* **Archivos Creados/Modificados:**
  1. [`Estandar de Desarrollo/mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_documentacion_ia.md) (Nuevo — GPS Global de Documentación)
  2. [`Estandar de Desarrollo/inicializacion_nuevos_proyectos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/inicializacion_nuevos_proyectos.md) (Modificado — Paso 4 y 5 renovados)
  3. [`Estandar de Desarrollo/mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_aplicacion.md) (Modificado)
* **Mejoras Aplicadas:**
  - **mapa_documentacion_ia.md:** Creado el índice semántico global de 5 secciones del directorio de documentación, con tablas de acceso directo a cada archivo de control (tareas, bitácora), cada estándar de desarrollo, todos los manuales técnicos y el catálogo completo de los 25+ componentes de la biblioteca organizados por categoría con sus rutas absolutas clicables. Incluye directivas de comportamiento obligatorio para la IA.
  - **inicializacion_nuevos_proyectos.md:** Actualizado con los nuevos Pasos 4 y 5 que incorporan el mapa de documentación y el Prompt de Inicialización de Doble Mapa (código + documentación) para onboarding de IA en turno cero.
* **Estado:** ✅ Sistema de mapas duales de navegación para IA completado y operativo.

---

### [2026-05-29] - Protocolo y Blueprint de Inicialización para Nuevos Proyectos
* **Tipo:** Estándar de Desarrollo y Garantía de Consistencia
* **Archivos Creados/Modificados:**
  1. [`Estandar de Desarrollo/inicializacion_nuevos_proyectos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/inicializacion_nuevos_proyectos.md) (Nuevo Estándar)
  2. [`Estandar de Desarrollo/mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_aplicacion.md) (Modificado)
* **Mejoras y Refactorizaciones Aplicadas:**
  - **inicializacion_nuevos_proyectos.md (Estándar):** Se creó el manual maestro que establece el protocolo técnico para nuevos proyectos. Detalla el checklist paso a paso para copiar utilidades (`generate_ia_map.js` y `seed_brand.js`), configurar y automatizar `package.json` mediante npm, y proporciona el Prompt de Inicialización optimizado que el desarrollador debe pasar a cualquier IA al arrancar el proyecto para un onboarding inmediato.
* **Estado:** ✅ Estándar y blueprint de inicialización integrado exitosamente.

---

### [2026-05-29] - Mapeo de Arquitectura Portable: Robustecimiento de generate_ia_map.js y manual_ia_maps.md para Nuevos Proyectos
* **Tipo:** Utilidades, Automatización y Manuales Técnicos
* **Archivos Modificados:**
  1. [`scratch/generate_ia_map.js`](file:///D:/PROTOTIPE/App%20Ventas/scratch/generate_ia_map.js) (Modificado)
  2. [`package.json`](file:///D:/PROTOTIPE/App%20Ventas/package.json) (Modificado)
  3. [`Manuales/Arquitectura_SaaS/Mapas_IA/manual_ia_maps.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Manuales/Arquitectura_SaaS/Mapas_IA/manual_ia_maps.md) (Modificado)
* **Mejoras y Refactorizaciones Aplicadas:**
  - **generate_ia_map.js (Script):** Se refactorizó el script de mapeo semántico para permitir argumentos dinámicos desde la terminal de comandos (`--src` para configurar el directorio origen y `--output` para el archivo Markdown de salida). Esto garantiza portabilidad total y reutilización instantánea en cualquier estructura de nuevo proyecto (Next.js, Vite, React Native, etc.).
  - **Automatización de Actualización (package.json):** Se agregó el script `"map": "node scratch/generate_ia_map.js"` y se vinculó directamente a la fase de construcción `"build": "npm run map && vite build"`. Con esto, cualquier cambio que se realice al proyecto regenera y actualiza el mapa para la IA de forma 100% transparente y automatizada al compilar.
  - **manual_ia_maps.md (Manual):** Se actualizó y enriqueció la documentación para explicar detalladamente cómo copiarlo, ejecutarlo y presentárselo a la IA para un onboarding instantáneo.
* **Build de Verificación:** `cmd /c npm run build` -> Exitoso (2579 módulos transformados en 614ms incluyendo la autogeneración del mapa) ✅.
* **Estado:** ✅ Utilidades de mapeo de IA y manual técnico finalizados con éxito.

---

### [2026-05-29] - Extracción de Infraestructura Ecosistema: Motores de Documentación PDF, Omnicanalidad WhatsApp y Créditos Transaccionales — Ruta 2
* **Tipo:** Biblioteca de Componentes y Manuales Técnicos (Fase Completa)
* **Archivos Creados:**
  1. [`Biblioteca/Servicios_y_Firebase/Generacion_PDF/generacion_pdf.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Servicios_y_Firebase/Generacion_PDF/generacion_pdf.md)
  2. [`Biblioteca/Servicios_y_Firebase/Omnicanalidad_WhatsApp/omnicanalidad.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Servicios_y_Firebase/Omnicanalidad_WhatsApp/omnicanalidad.md)
  3. [`Biblioteca/Servicios_y_Firebase/Creditos_y_Saldos/creditos_saldos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Servicios_y_Firebase/Creditos_y_Saldos/creditos_saldos.md)
  4. [`Manuales/Servicios_y_Firebase/Generacion_PDF/manual_generacion_pdf.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Manuales/Servicios_y_Firebase/Generacion_PDF/manual_generacion_pdf.md) (Nuevo Manual)
  5. [`Manuales/Servicios_y_Firebase/Omnicanalidad_WhatsApp/manual_whatsapp_notifications.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Manuales/Servicios_y_Firebase/Omnicanalidad_WhatsApp/manual_whatsapp_notifications.md) (Nuevo Manual)
  6. [`Manuales/Servicios_y_Firebase/Creditos_y_Saldos/manual_credits_and_balances.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Manuales/Servicios_y_Firebase/Creditos_y_Saldos/manual_credits_and_balances.md) (Nuevo Manual)
* **Mejoras y Refactorizaciones Aplicadas:**
  - **pdfService (Motor PDF):** Portabilizado desacoplando constantes rígidas e inyectando un formateador de moneda (`formatFn`) parametrizado para soportar múltiples divisas e inyectar colores RGB de marca corporativa.
  - **whatsappService & clientNotificationService (Omnicanalidad):** Desacoplados del store global de Zustand, incorporando formateador de números con prefijos dinámicos multi-país y un procesador dinámico de plantillas de texto en tiempo real (`parseNotificationTemplate`).
  - **creditService (Motor Créditos):** Aislada la capa transaccional financiera (`runTransaction`) para evitar race conditions multi-vendedor en Firestore. Desacoplada la persistencia en Firebase mediante `ServiceConfig` e implementado callback `onPaymentApplied` para triggers de omnicanalidad.
* **Build de Verificación:** `cmd /c npm run build` -> Exitoso (2579 módulos transformados en 606ms) ✅.
* **Estado:** ✅ Los 3 motores clave de infraestructura 100% integrados en la biblioteca y manuales.

---

### [2026-05-29] - Extracción y Arquitectura Ecosistema: Seeding Firestore, Estandarización e Integración de Biblioteca y Manuales — Tareas 33 y 34
* **Tipo:** Refactorización Ecosistema, Biblioteca de Componentes y Manuales Técnicos (Integración Completa)
* **Archivos Afectados/Creados:**
  1. [`scratch/seed_brand.js`](file:///D:/PROTOTIPE/App%20Ventas/scratch/seed_brand.js) (Nuevo Script)
  2. [`Manuales/README.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Manuales/README.md) (Nueva Estructura Visual)
  3. [`Manuales/Arquitectura_SaaS/Configuracion_Marca/manual_brand_config.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Manuales/Arquitectura_SaaS/Configuracion_Marca/manual_brand_config.md) (Nuevo Manual)
  4. [`Manuales/Paginas/Seguimiento_Pedido/manual_order_tracking.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Manuales/Paginas/Seguimiento_Pedido/manual_order_tracking.md) (Nuevo Manual)
  5. [`Manuales/Visualizacion/Alertas_Stock/manual_admin_stock_alerts.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Manuales/Visualizacion/Alertas_Stock/manual_admin_stock_alerts.md) (Nuevo Manual)
  6. [`Biblioteca de Componentes/Formularios_y_UI/Seguimiento_Pedido/seguimiento_pedido.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Seguimiento_Pedido/seguimiento_pedido.md) (Biblioteca)
  7. [`Biblioteca de Componentes/Visualizacion/Alertas_Stock_Critico/admin_stock_alerts.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Visualizacion/Alertas_Stock_Critico/admin_stock_alerts.md) (Biblioteca)
* **Correcciones y Mejoras Aplicadas:**
  - **Script de Siembra (`seed_brand.js`):** Script automatizado robusto mediante Firebase Admin SDK que inicializa una base de datos en blanco con parámetros de configuración global de marca, productos de catálogo iniciales de muestra y cupones de descuento.
  - **Componentes Portables en Biblioteca:**
    - `OrderTracking`: Desacoplado del enrutador React Router (Link/searchParams), de dependencias de Lucide y Firebase Firestore. Ahora es declarativo mediante props/callbacks, inyectando un formulario manual si no hay token.
    - `AdminStockAlerts`: Desacoplado de React Router, subcomponentes no declarados, Lucide-React e inventario directo. Maneja aplanamiento de variantes y sumas transaccionales de forma aislada.
  - **Estandarización de Manuales Técnicos:** Creación de la carpeta `/Manuales/` y un índice de Consola de Control Visual de Rápido Entendimiento. Redacción de 4 manuales interactivos detallando flujos lógicos con diagramas secuenciales y algoritmos de inventario.
* **Build de Verificación:** `cmd /c npm run build` -> Exitoso (2579 módulos transformados en 727ms) ✅.
* **Estado:** ✅ Ecosistema Multi-Cliente y Biblioteca 100% completados con sus respectivos manuales de desarrollo.

---

---

### [2026-05-29] - Refactorización: Portabilidad Integral Biblioteca de Componentes UI — Tarea 32
* **Tipo:** Corrección de documentación — Biblioteca de Componentes (5 archivos afectados)
* **Alcance:** `carrito_completo.md`, `checkout_modal.md`, `tarjeta_producto.md`, `stepper_pedidos.md`, `rejilla_catalogo.md`
* **Problema detectado:** Todos los componentes UI dependían de `lucide-react` con imports hardcodeados y usaban clases Tailwind extendidas (`bg-primary`, `bg-action`, `bg-neutral-850`, `animate-spin-slow`) sin documentar los prerrequisitos de configuración.
* **Correcciones aplicadas en todos los archivos:**
  1. **SVG fallbacks nativos:** Cada ícono de lucide reemplazado por su equivalente SVG inline con props `size`. No requieren `npm install lucide-react` en el proyecto destino.
  2. **Prop `icons = {}`:** Todos los componentes visuales ahora aceptan íconos inyectables — compatible con cualquier librería (lucide, heroicons, tabler, etc.).
  3. **Sección "Variables CSS y Extensiones Tailwind":** Documentados todos los tokens custom: `--color-primary-hsl`, `--color-action-hsl`, extensiones `neutral.850`, `neutral.450`, `animate-spin-slow`.
* **Correcciones específicas:**
  - `stepper_pedidos.md`: Bug crítico corregido — `<X />` de lucide usado sin importar → reemplazado por `_IconX` SVG + prop `cancelIcon`.
  - `checkout_modal.md`: Integración completa del `Motor_Cupones` — prop `onValidateCoupon` inyectable (desacoplado de couponService), estado `isCouponLoading`, función `handleApplyCoupon`, campo de cupón en paso 3, descuento reflejado en resumen de factura.
  - `rejilla_catalogo.md`: Documentada la animación `animate-spin-slow` (custom `tailwind.config.js`) que faltaba.
* **Estado:** ✅ Biblioteca 100% portable — `lucide-react` = cero imports hardcodeados en 5 componentes.

---

### [2026-05-29] - Extracción: Motor Dinámico de Cupones (`Motor_Cupones`) — Tarea 31
* **Tipo:** Biblioteca de Componentes — Servicios y Firebase (nueva extracción modular)
* **Archivo creado:** [`Servicios_y_Firebase/Motor_Cupones/motor_cupones.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Servicios_y_Firebase/Motor_Cupones/motor_cupones.md)
* **Fuentes originales auditadas:** `couponService.js` (CRUD Firestore) + lógica inline en `CheckoutModal.jsx` (validateCoupon)
* **Mejoras incorporadas en v1.1:**
  - `ServiceConfig` inyectable: `db` y `couponsCollection` como parámetros — sin hardcoding.
  - `normalizeDoc()` extraída como función privada reutilizable (elimina duplicación en `getCoupons`).
  - `validateCoupon()` extraída de `CheckoutModal.jsx` como función standalone con jerarquía completa de validaciones: código nulo → no encontrado → inactivo → expirado (día completo) → monto mínimo → cálculo de descuento porcentual/fijo con protección `Math.min(valor, cartTotal)`.

### [2026-05-29] - Extracción: Hook de Control de Inactividad (`Control_Inactividad`) — Tarea 30
* **Tipo:** Biblioteca de Componentes — Lógica y Hooks (nueva extracción modular)
* **Archivo creado:** [`Logica_y_Hooks/Control_Inactividad/use_inactivity_timer.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Logica_y_Hooks/Control_Inactividad/use_inactivity_timer.md)
* **Fuente original auditada:** `src/hooks/useInactivityTimer.js` (52 líneas)
* **Mejoras incorporadas en v1.1:**
  - `useRef(null)` para almacenar el `timerID` — elimina anti-patrón de re-closure con `let timer`.
  - Parámetro `events[]` configurable (útil para quioscos solo táctiles).
  - `{ passive: true }` en `addEventListener` para scroll/touchstart — mejora rendimiento nativo.
  - Cleanup correcto al `isActive = false`: limpia timer activo y resetea `isInactive` a `false`.

### [2026-05-29] - Extracción: Transacciones Atómicas de Inventario (`Transacciones_Atomicas_Inventario`) — Tarea 29
* **Tipo:** Biblioteca de Componentes — Servicios y Firebase (nueva extracción modular)
* **Archivo creado:** [`Servicios_y_Firebase/Transacciones_Atomicas_Inventario/transacciones_atomicas_inventario.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Servicios_y_Firebase/Transacciones_Atomicas_Inventario/transacciones_atomicas_inventario.md)
* **Fuente original auditada:** `src/services/orderService.js` (451 líneas, 3 flujos de `runTransaction`)
* **Mejoras incorporadas en v1.0 portátil:**
  - `ServiceConfig` inyectable: `db`, `collections` (orders/products/credits) y `orderStates` parametrizables.
  - 3 helpers internos privados consolidados (`_deductStock`, `_restoreStock`, `_applyStockUpdates`) — elimina ~120 líneas de código duplicado entre `createOrder`, `updateOrderStatus` y `createPhysicalOrder`.
  - `callback onNotifyClient` configurable como parte del `ServiceConfig`.
  - `isCustomItem()` como guard centralizado para productos `custom-*`.

### [2026-05-29] - Extracción y Optimización: Stepper de Seguimiento de Pedidos (`Stepper_Pedidos`)
* **Tipo:** Biblioteca de Componentes — Formularios y UI (nueva extracción modular)
* **Archivo creado:** [`Formularios_y_UI/Stepper_Pedidos/stepper_pedidos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Stepper_Pedidos/stepper_pedidos.md)
* **Fuente original auditada:** `ClientOrders.jsx` (líneas 1-120 aprox) y `CheckoutModal.jsx` (líneas 806-875)
* **Mejoras premium incorporadas:**
  - **Línea de Tiempo Reactiva Dinámica:** Conmutación fluida de colores e íconos vectoriales en base a los estados dinámicos del ciclo del pedido (`pendiente` -> `aceptado` -> `en_ruta` -> `entregado`).
  - **Barra de Conexión Animada:** Transiciones fluidas en la altura de la barra activa verde esmeralda acopladas a la aceleración física del estado.
  - **Visualización Excepcional de Cancelación:** Estructura condicional que oculta el stepper general y despliega una alerta destructiva atenuada y pulida explicando motivos concretos en caso de cancelaciones.

### [2026-05-29] - Extracción y Optimización: Rejilla de Catálogo Inteligente (`Rejilla_Catalogo`)
* **Tipo:** Biblioteca de Componentes — Formularios y UI (nueva extracción modular)
* **Archivo creado:** [`Formularios_y_UI/Rejilla_Catalogo/rejilla_catalogo.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Rejilla_Catalogo/rejilla_catalogo.md)
* **Fuente original auditada:** `ClientCatalog.jsx` (líneas 366-395)
* **Mejoras premium incorporadas:**
  - **Aceleración por Hardware en Conmutación:** Clases dinámicas preventivas (`will-change-transform`) para que la transición entre 2 col, 3 col o lista fluya a 60 FPS.
  - **Empty State Comercial Reactivo:** Módulo interactivo de cero-resultados de búsqueda que inyecta guías directas y un botón elástico para reiniciar filtros mediante callbacks.
  - **Layout AnimatePresence:** Uso de `AnimatePresence` en modo `popLayout` para un reordenamiento posicional spring y suave de productos al filtrarse.

### [2026-05-29] - Extracción y Optimización: Tarjeta de Producto Adaptativa (`Tarjeta_Producto`)
* **Tipo:** Biblioteca de Componentes — Formularios y UI (nueva extracción modular)
* **Archivo creado:** [`Formularios_y_UI/Tarjeta_Producto/tarjeta_producto.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Tarjeta_Producto/tarjeta_producto.md)
* **Fuente original auditada:** `ProductCard.jsx` (líneas 1-161) y `ClientCatalog.jsx` (líneas 366-377)
* **Mejoras premium incorporadas:**
  - **Soporte de Layouts Dinámicos (Grid / List):** Programación paramétrica y conmutación estructural suave entre cuadrícula (grid) y fila (list) sin duplicar lógica en el padre.
  - **Efecto Neon Glow de Promoción:** Bordes con sombras difusas basados en HSL color-mix acoplados a feature flags promocionales.
  - **Shimmer Skeleton idéntico:** Creación de `ProductCardSkeleton` que emula las dimensiones y proporciones exactas del maquetado del catálogo, eliminando saltos estructurales (CLS).
  - **Grayscale y Desactivación de Agotados:** Tratamiento visual atenuado automático de imágenes y botones de interacción al vaciarse el stock consolidado de variantes.

### [2026-05-29] - Extracción y Optimización: Sincronización en Tiempo Real (`Firebase_Sync_Hook`)
* **Tipo:** Biblioteca de Componentes — Servicios y Firebase (nueva extracción modular)
* **Archivo creado:** [`Servicios_y_Firebase/Sincronizacion_Firebase/sincronizacion_firebase.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Servicios_y_Firebase/Sincronizacion_Firebase/sincronizacion_firebase.md)
* **Fuente original auditada:** `useAppConfigSync.js` (líneas 1-30) y `appConfigService.js` (líneas 110-136)
* **Mejoras premium incorporadas:**
  - **Caché Local Offline (Optimistic UI Startup):** Lectura e inicialización del estado reactivo directamente de `localStorage` para un arranque de catálogo instantáneo sin bloqueos.
  - **Soporte de Filtros y Ordenamiento Dinámicos:** Query builders reactivos integrados que aceptan arrays de filtros compuestos (`where`) y ordenamientos (`orderBy`) en tiempo real.
  - **Metadata Detección de Red:** Detección de red offline del navegador acoplada a la metadata de `snapshot.metadata.fromCache` para inyectar feedback visual de desconexión.
  - **Cleanup Proactivo deListeners:** Eliminación de escuchadores nativos al desmontarse el componente para optimizar cuotas de lectura de Google Firestore.

### [2026-05-29] - Extracción y Optimización: Modal de Checkout Multipaso (`Checkout_Modal`)
* **Tipo:** Biblioteca de Componentes — Formularios y UI (nueva extracción modular)
* **Archivo creado:** [`Formularios_y_UI/Checkout_Modal/checkout_modal.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Checkout_Modal/checkout_modal.md)
* **Fuente original auditada:** `CheckoutModal.jsx` (líneas 1-946)
* **Mejoras premium incorporadas:**
  - **Stepper Superior de Progreso:** Indicador animado interactivo en la cabecera que responde al progreso del wizard (`1 -> 2 -> 3 -> 4`).
  - **Validaciones Avanzadas en Tiempo Real:** Validación reactiva del campo celular (largo de caracteres) y dirección (obligatoria solo en despachos a domicilio) marcando errores con bordes y tipografía alerta.
  - **Cálculo de Cupones Integrado:** Lógica matemática aislada para sumar subtotales, envíos y restar cupones promocionales en tiempo real.
  - **Omnicanalidad por WhatsApp:** Formulación y codificación de una plantilla de mensaje comercial premium para aviso por chat de WhatsApp al confirmar el pedido.

### [2026-05-29] - Extracción y Optimización: Carrito de Compras Completo (`Cart_Completo`)
* **Tipo:** Biblioteca de Componentes — Formularios y UI (nueva extracción modular)
* **Archivo creado:** [`Formularios_y_UI/Carrito_Completo/carrito_completo.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Carrito_Completo/carrito_completo.md)
* **Fuente original auditada:** `cartStore.js` (líneas 1-100) y `CartDrawer.jsx` (líneas 1-201)
* **Mejoras premium incorporadas:**
  - **Detección y Agrupación de Variantes:** Clave compuesta `${productId}-${variantId}` que maneja múltiples variaciones del mismo producto en paralelo sin colisionar identificadores.
  - **Control estricto de Stock Máximo:** Comprobación automática contra `maxStock` por variante inhabilitando interacciones incrementales para evitar sobreventa local.
  - **Empty State Premium Animado:** Micro-badge de pulso comercial con fallback e interactividad directa (botón de exploración del catálogo y chip de atención con shimmer).
  - **Framer Motion Acelerado:** Animaciones de backdrop y drawer lateral con físicas de resorte (spring animations) y transiciones elásticas.

### [2026-05-29] - Complemento v2.0: SettingsNavRow al Sistema de Monetización del Desarrollador
* **Tipo:** Biblioteca de Componentes — Monetización del Desarrollador (actualización)
* **Archivo actualizado:** [`Monetizacion_Desarrollador/Banner_Referido_Desarrollador/developer_promo_card.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Monetizacion_Desarrollador/Banner_Referido_Desarrollador/developer_promo_card.md)
* **Fuente original auditada:** `AdminSettings.jsx` (líneas 4290-4346) · `appConfigStore.js` (líneas 27, 144) · `ClientProfile.jsx` (líneas 18, 56-57, 228)
* **Tercer módulo agregado:** `SettingsNavRow` — fila de navegación genérica con ícono + título + descripción + flecha chevron. Es la entrada visual que el admin clicó en el screenshot para llegar a `DeveloperContactConfig`.
* **Refactorizaciones aplicadas:**
  - Dos variantes: `useMotion=true` (framer-motion) y `useMotion=false` (CSS puro, fallback portable).
  - Icono ChevronRight inline SVG eliminando dependencia de `lucide-react`.
  - Subcomponente puro `SettingsNavRowInner` reutilizable por ambas variantes sin duplicar markup.
* **Documentación enriquecida:**
  - Nueva tabla de props del `SettingsNavRow`.
  - Tabla de capas del store (Zustand + Firestore) con responsabilidades por capa.
  - Sección 6 de integración Firestore con snippet de `updateDoc`.
  - Diagrama Mermaid actualizado de 2 a 4 participantes (Nav + Config + Store + Promo).
  - Sección 8 con ejemplo de uso integrado de los 3 módulos.
  - Sección 9 de Origen con enlaces directos a fuentes.
* **Build verificado:** `npm run build` — compilación exitosa (advertencias de chunk size, no errores de código).

---

### [2026-05-29] - Extracción de Componente a la Biblioteca (Restaurador de Aplicación a Fábrica / AppResetTool)
* **Tipo:** Biblioteca de Componentes — Utilidades
* **Archivo nuevo:** [`Utilidades/Restauracion_Aplicacion/restauracion_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Utilidades/Restauracion_Aplicacion/restauracion_aplicacion.md)
* **Fuente original auditada:** `src/pages/admin/AdminSettings.jsx` (líneas 1048-1128 y 4691-4737)
* **Propósito estratégico:** Portar la herramienta destructiva administrativa para limpiar la base de datos de negocio a cero. Es crucial para el reset de QA/producción o despliegue inicial en Ecosistema (marca blanca).
* **Refactorizaciones aplicadas:**
  - `lucide-react` → SVGs inline.
  - Componente 100% stateless desacoplado que propaga las órdenes de limpieza mediante callbacks controlados.
  - Lógica atómica de borrado por lotes de 500 para evitar desbordes y fugas de memoria en Firestore.
* **Guards añadidos:** Doble prompt nativo (`window.confirm`), bloqueo del botón mediante palabra clave obligatoria `RESTAURAR` en mayúsculas y loader circular de no-concurrencia.
* **Seguridad:** Aislamiento absoluto de escrituras Firebase mediante inyección de callbacks; resguardo estricto del usuario administrativo actual basado en roles y correos.
* **README actualizado:** Sí — Sección `5. Utilidades`.

---

### [2026-05-29] - Extracción de Componente a la Biblioteca (Creador de Filtros de Catálogo / CatalogFiltersCreator)
* **Tipo:** Biblioteca de Componentes — Formularios y UI
* **Archivo nuevo:** [`Formularios_y_UI/Creador_Filtros_Catalogo/creador_filtros.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Creador_Filtros_Catalogo/creador_filtros.md)
* **Fuente original auditada:** `src/pages/admin/AdminSettings.jsx` (líneas 1008-1040 y 4205-4260)
* **Propósito estratégico:** Portar el configurador administrativo de dimensiones del catálogo (categorías, tallas, colores) y creador dinámico de atributos personalizados de productos (tipo texto/select) para marcas blancas y Ecosistema.
* **Refactorizaciones aplicadas:**
  - `lucide-react` → SVGs inline.
  - Componente 100% stateless controlado que propaga cambios mediante el callback reactivo `onChange` de forma limpia.
  - Auto-limpieza de espacios e inyección controlada de arrays separados por comas mediante regex y manipulación de strings en tiempo real.
* **Guards añadidos:** Manejo seguro de arrays de atributos indefinidos o vacíos, y limpiador automático del array `options` si el atributo es reconfigurado a tipo texto.
* **Seguridad:** Aislamiento de las mutaciones de base de datos directas en el frontend mediante inyección de callbacks.
* **README actualizado:** Sí — Sección `2. Formularios y UI`.

---

### [2026-05-29] - Extracción de Componente a la Biblioteca (Sistema de Temas Dinámicos / ThemeManager)
* **Tipo:** Biblioteca de Componentes — Utilidades
* **Archivo nuevo:** [`Utilidades/Sistema_Temas_Dinamicos/sistema_temas.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Utilidades/Sistema_Temas_Dinamicos/sistema_temas.md)
* **Fuente original auditada:** `src/constants/palettes.js` y `src/store/appConfigStore.js` (líneas 105–115)
* **Propósito estratégico:** Portar el motor de marca blanca de inyección de estilos reactivos por variables CSS nativas, soportando modo oscuro/claro y eventos estacionales (Navidad, Halloween, etc.).
* **Refactorizaciones aplicadas:**
  - Desacoplado del store global de Zustand → se modela como un servicio puro (`themeService`) y un hook reactivo independiente (`useTheme`).
  - Coexistencia simultánea con Tailwind CSS y Vanilla CSS.
  - Soporte de inyección nativa via `document.documentElement.style.setProperty` previniendo parpadeos de color durante el renderizado (FOUC).
* **Guards añadidos:** Fallback de seguridad final a la paleta base de la aplicación ante paletas corruptas, nulas o indefinidas.
* **Seguridad:** Aislamiento de variables de entorno CSS de la lógica del negocio.
* **README actualizado:** Sí — Sección `5. Utilidades`.

---

### [2026-05-29] - Extracción de Componente a la Biblioteca (DeveloperBillingPanel / Facturación Comisional)
* **Tipo:** Biblioteca de Componentes — Monetización del Desarrollador
* **Archivo nuevo:** [`Monetizacion_Desarrollador/Facturacion_Comisional/facturacion_comisional.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Monetizacion_Desarrollador/Facturacion_Comisional/facturacion_comisional.md)
* **Fuente original auditada:** `src/pages/admin/AdminSettings.jsx` (línea 4437 en adelante), `src/hooks/useBilling.js` y `src/services/billingService.js`
* **Propósito estratégico:** Portar el sistema de facturación mensual comisional del desarrollador para cobrar comisiones sobre ventas. Habilita cálculo en tiempo real, cambio de tasas de comisión, firmas con Canvas táctil y exportación en PDF.
* **Refactorizaciones aplicadas:**
  - `lucide-react` → SVGs inline.
  - Componente desacoplado del SDK de Firebase → se divide en Hook React (`useBilling`) y Servicio (`billingService`) que se pueden usar con cualquier base de datos.
  - Gestión optimizada del canvas con `touch-action: none` para evitar la navegación por scroll y distorsiones táctiles en pantallas móviles.
  - Captura y rasterización dinámica del canvas en base64 para su inserción limpia en PDF.
* **Guards añadidos:** Validación de porcentaje en rango `[0, 100]`, guards frente a pedidos vacíos o nulos en los cálculos y control del canvas ante renders incompletos.
* **Seguridad:** Aislamiento de las credenciales de base de datos en el frontend mediante props reactivas inyectadas por el parent.
* **README actualizado:** Sí — Sección `7. Monetización del Desarrollador`.

---

### [2026-05-29] - Extracción de Componente a la Biblioteca (Sistema de Referidos del Desarrollador / DeveloperPromoCard + DeveloperContactConfig)
* **Tipo:** Biblioteca de Componentes — Monetización del Desarrollador
* **Archivo nuevo:** [`Monetizacion_Desarrollador/Banner_Referido_Desarrollador/developer_promo_card.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Monetizacion_Desarrollador/Banner_Referido_Desarrollador/developer_promo_card.md)
* **Fuente original auditada:** `src/pages/client/ClientProfile.jsx` (líneas 55–60 y 227–251) y `src/pages/admin/AdminSettings.jsx` (líneas 4740-4767)
* **Propósito estratégico:** Portar el sistema integral de monetización y referidos compuesto por el panel de configuración administrativa de WhatsApp (`DeveloperContactConfig`) y el banner publicitario cliente de referido (`DeveloperPromoCard`). Habilita la captura dinámica del contacto y la redirección automatizada de leads.
* **Refactorizaciones aplicadas:**
  - `lucide-react` (Sparkles, Smartphone, Save) → SVGs inline.
  - Formateador y limpiador reactivo de números telefónicos (`replace(/[^+0-9]/g, '')`) en tiempo real para evitar distorsiones en inputs.
  - Componente de visualización cliente completamente agnóstico y controlado por variables CSS con filtro blur decorativo.
* **Guards añadidos:** Validación de teléfono con .trim() y eliminación atómica de caracteres no numéricos al disparar WhatsApp; guard nativo de ocultación (return null) si no hay número de referido configurado.
* **Seguridad:** Aislamiento total de lecturas/escrituras Firestore del UI mediante callbacks.
* **README actualizado:** Sí — Sección `7. Monetización del Desarrollador`.

---

### [2026-05-29] - Extracción de Componente a la Biblioteca (CatalogBanner)
* **Tipo:** Biblioteca de Componentes
* **Archivo nuevo:** [`Visualizacion/Carrusel_Anuncios_Promocionales/catalog_banner.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Visualizacion/Carrusel_Anuncios_Promocionales/catalog_banner.md)
* **Fuente original auditada:** `src/components/client/catalog/CatalogBanner.jsx` (247 líneas)
* **Refactorizaciones aplicadas:**
  - `framer-motion` (wrapper opacity) → `@keyframes cb-fade-in` CSS puro.
  - `lucide-react` (ChevronLeft/Right) → SVGs inline.
  - `useAppConfigStore` → prop `bannerConfig`.
  - `useAds` + `useProducts` hooks → props `ads` y `products`.
  - `autoRotateMs` configurable como prop (default 6000ms).
* **Bugs corregidos durante extracción:**
  - **Out-of-bounds latente:** `currentIndex` podía quedar fuera del rango cuando `activeAds` cambiaba (ej. carga asíncrona inicial). Solucionado con `useEffect` de reset y constante `safeIndex`.
  - **Null reference:** `discountValue.toLocaleString()` crasheaba si `discountValue` era `undefined`. Solucionado con operador `?? 0`.
* **Unicidad verificada:** Sin duplicados en el índice.
* **README actualizado:** Sí.

---

### [2026-05-29] - Extracción de Componentes a la Biblioteca (OrderTracking + FilterPanel)
* **Tipo:** Biblioteca de Componentes
* **Archivos Nuevos en Biblioteca:**
  - [`Paginas/Seguimiento_Pedido/order_tracking.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Paginas/Seguimiento_Pedido/order_tracking.md)
  - [`Formularios_y_UI/Panel_Filtros_Catalogo/filter_panel.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Panel_Filtros_Catalogo/filter_panel.md)
* **Fuentes originales auditadas:**
  - `src/pages/client/OrderTracking.jsx` (367 líneas)
  - `src/components/client/catalog/ClientFilterModal.jsx` (218 líneas)
* **Refactorizaciones aplicadas:**
  - `OrderTracking`: Desacoplado Firebase (→ prop `fetchOrderFn`), `react-router-dom` Link (→ prop `onNavigateHome`), `lucide-react` (→ SVGs inline), `AppLoader` (→ prop `loaderComponent`). Stepper con CSS puro. Race condition eliminada con flag `cancelled`. `statusMap` y `steps` inyectables para otros dominios.
  - `FilterPanel`: Eliminada dependencia de `framer-motion` (→ `@keyframes fp-slide-up/fp-fade-in`), `lucide-react` (→ SVGs inline), `useAppConfigStore` (→ prop `config`). Subcomponentes atómicos `FilterSection` y `FilterChip` extraídos. Estado optimista local preservado.
* **Unicidad verificada:** Sin duplicados en el índice de la biblioteca.
* **README actualizado:** Sí — ambas entradas añadidas al índice oficial.

---

### [2026-05-29] - Corrección de Seguridad de Base de Datos
* **Tipo:** Seguridad (Crítico)
* **Archivo Modificado:** [firestore.rules](file:///d:/Aplicaciones/App%20Ventas/firestore.rules)
* **Causa Raíz:** La colección `/products/{document}` permitía permisos de escritura (`write`, `update`, `delete`) globales públicos (`if true;`), exponiendo el catálogo entero del negocio a modificaciones no autorizadas por terceros.
* **Solución Técnica:** Se modificó la regla de seguridad del catálogo para validar la presencia de credenciales administrativas válidas:
  ```javascript
  match /products/{document} {
    allow read: if true;
    allow write, update, delete: if request.auth != null; 
  }
  ```
* **Estatus de Despliegue:** Modificado en local. Pendiente de ejecución de despliegue a Firebase.

### [2026-05-29] - Refactorización de ProductDetailModal.jsx (UI/UX)
* **Tipo:** Interfaz y Accesibilidad (UI/UX)
* **Archivo Modificado:** [ProductDetailModal.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx)
* **Causa Raíz:** Inconsistencia en la animación de modales y falta de bloqueo de scroll en el body, lo que creaba una interacción tosca y colisiones potenciales de `z-index`.
* **Solución Técnica:** Se refactorizó el componente utilizando la plantilla unificada `ModalTemplate.jsx`. Se eliminaron las envolturas manuales de Framer Motion, logrando que el modal se monte en la raíz del DOM mediante Portales y bloquee correctamente el scroll trasero de la página al abrirse.
* **Estatus de Despliegue:** Modificado en local. Pendiente de despliegue de hosting.

### [2026-05-29] - Refactorización de CheckoutModal.jsx (UI/UX)
* **Tipo:** Interfaz y Navegación (UI/UX)
* **Archivo Modificado:** [CheckoutModal.jsx](file:///D:/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx)
* **Causa Raíz:** Inconsistencia de animación, falta de Portal de React que causaba colisiones visuales de z-index y scroll trasero activo en el body de la aplicación durante la compra.
* **Solución Técnica:** Se refactorizó la estructura del modal migrándola a `ModalTemplate.jsx`. Se resolvió la navegación multi-paso inyectando el callback `onBack` en la cabecera dinámica del componente y se inyectó el stepper de puntos como subtítulo. Se configuró para ocultar el header en el paso final (éxito) pasando el título como `null`.
* **Estatus de Despliegue:** Modificado en local. Pendiente de despliegue de hosting.

### [2026-05-29] - Refactorización de ProductFormModal.jsx (UI/UX)
* **Tipo:** Interfaz y Administración (UI/UX)
* **Archivo Modificado:** [ProductFormModal.jsx](file:///D:/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx)
* **Causa Raíz:** Inconsistencia de animación modal y maquetado de envolturas redundantes en el módulo de inventario.
* **Solución Técnica:** Se refactorizó la estructura del modal migrándola a `ModalTemplate.jsx`. Se conectó el wizard de creación y la edición clásica de productos, enlazando el callback `onClose` con la lógica de limpieza de borradores temporales de Gemini (`handleClose`) y el retroceso del wizard mediante `onBack`.
* **Estatus de Despliegue:** Modificado en local. Pendiente de despliegue de hosting.

### [2026-05-29] - Refactorización de ClaimRequestModal.jsx y ClientCouponsModal.jsx
* **Tipo:** Interfaz (UI/UX)
* **Archivos Modificados:** [ClaimRequestModal.jsx](file:///D:/PROTOTIPE/App%20Ventas/src/components/client/claims/ClaimRequestModal.jsx), [ClientCouponsModal.jsx](file:///D:/PROTOTIPE/App%20Ventas/src/components/client/coupons/ClientCouponsModal.jsx)
* **Causa Raíz:** Animaciones e interfaces personalizadas e inconsistentes que duplicaban lógica de portales y cierres de modal.
* **Solución Técnica:** Migrados a `ModalTemplate.jsx`. Se redujo el peso del código eliminando hooks manuales de eventos de escape y clics fuera del contenedor, y se delegaron las transiciones a Framer Motion dentro de la plantilla unificada.
* **Estatus de Despliegue:** Desplegado en producción.

### [2026-05-29] - Creación de pdfService.js y useCopyToClipboard.js
* **Tipo:** Arquitectura y Utilidades
* **Archivos Creados:** [pdfService.js](file:///D:/PROTOTIPE/App%20Ventas/src/services/pdfService.js), [useCopyToClipboard.js](file:///D:/PROTOTIPE/App%20Ventas/src/hooks/useCopyToClipboard.js)
* **Causa Raíz:** Lógica inline para generar documentos PDF y gestión del portapapeles dispersa y duplicada en múltiples vistas.
* **Solución Técnica:** Se implementó una abstracción de `jsPDF` con `jspdf-autotable` para centralizar la descarga de reportes financieros y de inventario, y un hook de estado con temporizador auto-limpiable para la interacción de copiado del portapapeles.
* **Estatus de Despliegue:** Desplegado en producción.

### [2026-05-29] - Estructuración del Modelo de Negocio Ecosistema
* **Tipo:** Documentación de Estrategia
* **Archivo Creado:** [estrategia_negocio.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estrategia%20de%20Negocio/estrategia_negocio.md)
* **Causa Raíz:** Ausencia de guías y flujos para recibir especificaciones funcionales y adaptarlas al catálogo de componentes reutilizables.
* **Solución Técnica:** Definición de fases de captación de requerimientos, plantilla de briefing de clientes y el protocolo técnico de evaluación de viabilidad para feature flags o extensiones de componentes atómicos.
* **Estatus de Despliegue:** N/A (Exclusivo de Documentación).

### [2026-05-29] - Modularización reactiva de la Administración y el Checkout
* **Tipo:** Modularidad Ecosistema
* **Archivos Modificados:** [AdminHome.jsx](file:///D:/PROTOTIPE/App%20Ventas/src/pages/admin/AdminHome.jsx), [CheckoutModal.jsx](file:///D:/PROTOTIPE/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx)
* **Causa Raíz:** Necesidad de ocultar la opción de pago por créditos en la tienda y remover las métricas y accesos rápidos a créditos del panel del vendedor cuando la funcionalidad está inactiva globalmente.
* **Solución Técnica:** Se enlazaron ambos componentes al estado de `creditsEnabled` de `useAppConfigStore`. `AdminHome` oculta la métrica de cobros, adapta el grid simétricamente, remueve el acceso rápido y recalcula la distribución de ingresos diarios. `CheckoutModal` filtra dinámicamente las opciones del formulario usando la función auxiliar `getPaymentMethodsOptions(creditsEnabled)`.
* **Estatus de Despliegue:** Validado localmente con un build exitoso. Pendiente de despliegue a hosting.

### [2026-05-29] - Corrección de Botones de Mayoreo y Encargos (ClientCatalog.jsx)
* **Tipo:** Bugfix / Modularidad Ecosistema
* **Archivo Modificado:** [ClientCatalog.jsx](file:///D:/PROTOTIPE/App%20Ventas/src/pages/client/ClientCatalog.jsx)
* **Causa Raíz:** El botón "Pedir por encargo" se mostraba permanentemente en productos sin stock incluso cuando el módulo de mayoreo estaba deshabilitado globalmente (`wholesaleSettings.enabled = false`), ignorando la configuración de feature flags del administrador.
* **Solución Técnica:** Se extrajo la lógica a un subcomponente funcional puro `WholesaleButton`. Se inyectó prop drilling limpio y se estructuró la validación lógica para que oculte ambos flujos (mayoreo y por encargo) si el flag de mayoreo es falso.
* **Estatus de Despliegue:** Compilación local exitosa.

### [2026-05-29] - Corrección de Excepciones Críticas y Null Checks en Modales
* **Tipo:** Estabilidad (Bugfix)
* **Archivos Modificados:** [ProductDetailModal.jsx](file:///D:/PROTOTIPE/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx), [AdminHome.jsx](file:///D:/PROTOTIPE/App%20Ventas/src/pages/admin/AdminHome.jsx)
* **Solución Técnica:** 
  1. En `ProductDetailModal.jsx`, se reubicó el guard de nulidad inmediatamente debajo de la inicialización de los hooks de React (garantizando consistencia con las *Rules of Hooks*).
  2. En `AdminHome.jsx`, se desestructuró la variable reactiva `creditsEnabled` directamente del store unificado `useAppConfigStore` y se reemplazaron todas las referencias huérfanas de `config` por la variable local reactiva.
* **Estatus de Despliegue:** Validado localmente con compilación de producción exitosa (`npm run build` ✓).

### [2026-05-29] - Extracción y Registro del Switch de Modo Oscuro (DarkModeToggle)
* **Tipo:** Biblioteca de Componentes
* **Archivo Creado:** [dark_mode_toggle.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/dark_mode_toggle.md)
* **Causa Raíz:** Solicitud de prueba de la habilidad `component-extractor` para auditar de forma autónoma la base de código, extraer la funcionalidad de modo oscuro en una interfaz reutilizable 100% portable y documentarla bajo estándares rígidos.
* **Solución Técnica:** Se identificaron las referencias al estado del tema en `App.jsx`, `AdminSettings.jsx` y `appConfigStore.js`. Se diseñó el componente `DarkModeToggle` como un control funcional puro libre de dependencias del negocio, implementando props configurables para tamaño, etiquetas descriptivas y estado activo. Se documentaron props, especificaciones visuales, código listo para producción y diagramas de flujo operativo en la biblioteca.
* **Estatus de Despliegue:** Documentado y registrado exitosamente en el índice del catálogo.

### [2026-05-29] - Extracción Masiva de Componentes Esenciales (Toast, PWA, Carrito)
* **Tipo:** Biblioteca de Componentes
* **Archivos Creados:**
  * [guided_toast.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Notificacion_Toast/guided_toast.md)
  * [pwa_install_banner.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Biblioteca%20de%20Componentes/Formularios_y_UI/Banner_Instalacion_PWA/pwa_install_banner.md)
### [2026-06-07] - Restricción y Enrutamiento Inteligente en Navegación Offline y Rediseño de Indicador de Red
* **Tipo:** UI/UX / Robustez Offline / Navegación
* **Archivos Modificados:**
  - [`src/layouts/AdminLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
  - [`src/layouts/PortalLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/PortalLayout.jsx) [MODIFY]
* **Causa Raíz:**
  - En modo offline, el panel administrativo intentaba permitir la navegación a páginas que dependen de Firestore en tiempo real (Inicio, Inventario, Pedidos, Configuración), lo cual causaba errores en cascada. Se solicitó restringir la navegación al POS únicamente al estar sin conexión.
* **Solución Técnica:**
  - **AdminLayout (Redirección y Filtro):** Se importó el store de conectividad `useConnectivityStore`. Si la aplicación pierde la conexión (`isOnline` = false) y el usuario se encuentra en otra pestaña, se ejecuta una redirección automática forzada hacia el POS (`/admin/ventas`). Además, se filtró reactivamente el arreglo de navegación `filteredNavItems` para renderizar únicamente el ícono del POS en la barra lateral de PC y barra inferior de móvil al estar offline.
  - **PortalLayout (Indicador de Estado Dinámico):** Se reemplazó el indicador estático "En línea" por un chip condicional que detecta `isOnline`. Al estar offline, se renderiza con un estilo premium en color ámbar (`#f59e0b`), bordes suaves y el icono `WifiOff` con pulsaciones micro-animadas.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.
### [2026-06-07] - Corrección de Fallo de Importación Dinámica (X Button POS) Offline
* **Tipo:** Corrección de Bug / Robustez Offline / Navegación
* **Archivos Modificados:**
  - [`src/pages/admin/AdminSales.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSales.jsx) [MODIFY]
* **Causa Raíz:**
  - Al estar offline y presionar el botón `X` de salida en el selector de tipo de venta del POS, se ejecutaba `navigate(-1)`. Esto causaba una navegación hacia atrás (generalmente a `/admin/inventario`), gatillando la descarga del chunk correspondiente desde Vite, lo cual fallaba runtime por falta de conexión a internet y bloqueaba la aplicación con la pantalla de error.
* **Solución Técnica:**
  - Se interceptó el handler de clic de la `X` en el selector de `AdminSales.jsx`. Si `isOnline` es falso, la acción ahora establece por defecto el modo de venta en `'inventory'` sin salir del POS ni intentar navegar, previniendo crashes y manteniendo al usuario en el flujo de ventas seguras localmente.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

### [2026-06-07] - Prevención de Errores de Permisos en Observadores Firestore al Cerrar Sesión (Signout Cleanups)
* **Tipo:** Corrección de Bug / Seguridad / Estabilidad
* **Archivos Modificados:**
  - [`src/hooks/useBilling.js`](file:///d:/Aplicaciones/App%20Ventas/src/hooks/useBilling.js) [MODIFY]
  - [`src/pages/admin/AdminSettings.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [`src/layouts/AdminLayout.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
  - [`src/hooks/useAppConfigSync.js`](file:///d:/Aplicaciones/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`src/hooks/useNotificationCenter.js`](file:///d:/Aplicaciones/App%20Ventas/src/hooks/useNotificationCenter.js) [MODIFY]
  - [`firestore.rules`](file:///d:/Aplicaciones/App%20Ventas/firestore.rules) [MODIFY]
* **Causa Raíz:**
  - **Error en Cierre de Sesión:** Al hacer clic en "Cerrar sesión", Firebase Auth destruye la sesión del usuario inmediatamente. Sin embargo, los observadores de Firestore (`onSnapshot`) de facturación comisional y de lista de empleados seguían activos por unos instantes mientras React desmontaba los componentes, gatillando en la consola del navegador múltiples excepciones `FirebaseError: Missing or insufficient permissions` al consultar colecciones restringidas sin una sesión autorizada. Debido a que el logout de Firebase es asíncrono, si se llama a `signOut(auth)` antes de limpiar el estado local reactivo, los observables capturan la pérdida del token y fallan.
  - **Error en Landing Page Pública / Clientes:** Al entrar a la tienda virtual (catálogo de clientes) sin loguearse como admin, el hook global de sincronización `useAppConfigSync.js` intentaba suscribirse al cálculo de telemetría y facturación de la base de datos comisional (`orders`), y el layout de clientes `ClientLayout.jsx` intentaba inicializar el Centro de Notificaciones con el valor por defecto `'client'`. Al no haber una sesión de administrador activa, estas consultas fallaban inmediatamente con error de permisos insuficientes.
* **Solución Técnica:**
  - **Inversión del Flujo de Logout:** En `AdminLayout.jsx` y `AdminSettings.jsx` se modificaron las llamadas de cierre de sesión para ejecutar `logout()` (Zustand) *antes* del deslogueo en Firebase Auth (`signOut(auth)` / `signOutAdmin()`). Al limpiar primero el estado local, todos los componentes dependientes de `user` (como `useBilling.js` y el listener de empleados de `AdminSettings.jsx`) destruyen síncronamente sus observables de Firestore mientras el token de sesión aún es válido.
  - **Alineación con Guía de Listeners & Telemetría:**
    - En `useAppConfigSync.js` se condicionó la suscripción de telemetría y facturación a la existencia de un administrador autenticado (`user` de `useAuthStore`), previniendo consultas de facturación no autorizadas desde la vista pública del cliente.
    - En `useNotificationCenter.js` se bloqueó el registro de observadores para clientes con IDs de sesión por defecto o anónimos (`'client'` o `'anonimo'`), evitando llamadas innecesarias a la base de datos de notificaciones si no hay un cliente real logueado con celular.
    - En `firestore.rules` se actualizaron las reglas de seguridad de `/notifications/{document}` para permitir que el rol cliente (`recipientRole == 'client'`) pueda consultar y actualizar sus propias notificaciones si cuenta con sesión de celular activa.
    - En `AdminSettings.jsx` se actualizó el efecto de carga de empleados para depender de `user`. Además, se inyectó una variable protectora `active = true` que previene el registro de observadores huérfanos si la importación asíncrona tardía se completa tras desmontar.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa.

### [2026-06-08] - Historiales de Movimientos Contextuales por Portal Operativo
* **Tipo:** Nueva Característica / UI/UX / Base de Datos
* **Archivos Modificados:**
  - [`src/services/productionService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/productionService.js) [MODIFY]
  - [`src/pages/portal/PortalCocina.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalCocina.jsx) [MODIFY]
  - [`src/services/tableService.js`](file:///d:/Aplicaciones/App%20Ventas/src/services/tableService.js) [MODIFY]
  - [`src/pages/portal/PortalMesero.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/portal/PortalMesero.jsx) [MODIFY]
  - [`templates/template-ventas/src/services/productionService.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/productionService.js) [MODIFY]
  - [`templates/template-ventas/src/pages/portal/PortalCocina.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalCocina.jsx) [MODIFY]
  - [`templates/template-ventas/src/services/tableService.js`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/tableService.js) [MODIFY]
  - [`templates/template-ventas/src/pages/portal/PortalMesero.jsx`](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/portal/PortalMesero.jsx) [MODIFY]
* **Detalle Técnico:**
  - Se implementó un historial de movimientos personalizado y contextual para cada uno de los portales operativos (Vendedor, Cocina, Mesero, Bodega, Mensajero).
  - En **Cocina/Preparación**, se añadió una pestaña de "Historial" con la suscripción a los últimos 30 pedidos marcados como `'entregado'` (despachados) hoy.
  - En **Meseros**, se agregó una pestaña de "Atendidos" con la suscripción a los últimos 30 llamados/solicitudes de mesa atendidas por el mesero activo hoy.
  - Se estructuraron los listeners en `productionService.js` y `tableService.js` para ordenar los registros en el cliente reduciendo la necesidad de índices compuestos adicionales.
  - Se replicaron todos los servicios y portales correspondientes dentro de la carpeta del template del CLI (`Prototipe-CLI`) para conservar consistencia.
  - Se corrigió un problema de visualización duplicada de botones de pestaña en el Portal del Vendedor (`PortalVendedor.jsx`) en dispositivos móviles al ocultar el selector interno del panel derecho en viewports pequeños (`md:grid hidden`).
* **Estatus:** ✅ Completado y compilado sin errores localmente.

### [2026-06-09] - Automatización del Ciclo de Vida de Cores y Panel CoreManagerPanel en dev-dashboard
* **Tipo:** Nueva Funcionalidad / Automatización del Ecosistema / Backend API / UI/UX
* **Archivos Creados/Modificados:**
  - [`Prototipe-CLI/server.js`](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Prototipe-CLI/generator.js`](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreManagerPanel.jsx) [NEW]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Causa Raíz:**
  - Facilitar el ciclo de vida de desarrollo de las plantillas base del ecosistema, permitiendo registrar cores, clonar plantillas de referencia, sincronizar cambios a templates de producción y activar/desactivar cores de manera netamente visual sin intervención en el sistema de archivos local.
* **Solución Técnica:**
  - **APIs de Backend (server.js):**
    - `POST /api/register-core`: Inicializa físicamente un core nuevo, inyecta por defecto los 12 archivos de documentación estándar requeridos y lo registra inactivo en `plantillas_registro.json`.
    - `GET /api/cores`: Retorna la lista unificada y estado actual de todas las plantillas registradas.
    - `POST /api/cores/:clave/scaffold`: Clona el código de un core base (ej. `ventas`) en el nuevo core y reescribe dinámicamente referencias de texto y nombres del proyecto.
    - `POST /api/cores/:clave/activate`: Sincroniza el código de desarrollo del core hacia el directorio del CLI `templates/`, incrementa la versión SemVer menor y cambia el estado a `activo: true`.
    - `POST /api/cores/:clave/deactivate`: Modifica el estado en el registro central a `activo: false` para deshabilitarlo del wizard.
  - **CoreManagerPanel (Componente React):**
    - Grid interactivo con badges de estado del ciclo de vida (Inactivo, Scaffold Requerido, Sincronizado y Activo).
    - Asistente inline para creación de cores nuevos con previsualización dinámica del filesystem.
    - Acciones contextuales con flujo de logs interactivo en tiempo real integrado por cada llamada.
  - **Navegación e Integración:**
    - Integrado el nuevo tab en la sección de navegación lateral `NAV_TABS` de `App.jsx`.
    - Modificado `generator.js` para asegurar que el aprovisionamiento de clientes nuevos herede los 12 archivos de documentación actualizados.
* **Estatus:** ✅ Completado y verificado mediante compilación de producción exitosa (`npm run build`).


