# Bitácora de Cambios - dev-dashboard

Historial técnico de cambios realizados en el proyecto.

## [2026-06-13] Migración de Telemetría a Firebase Functions Gen 2 (Hotfix CORS & IAM)
- **Migración a Gen 2:** Se migró la Cloud Function `reportTelemetry` a Firebase Functions Gen 2 (`onRequest` con `cors: true`) para permitir el preflight de CORS de forma nativa.
- **Configuración de Seguridad en GCP:** Se concedieron los roles lectores y escritores de Artifact Registry a la cuenta de servicio de Cloud Functions y de Compute Engine para solventar errores de compilación de contenedores en Cloud Build.
- **Acceso Invocador Público:** Se configuró la política de IAM del servicio de Cloud Run (`reporttelemetry`) para otorgar `roles/run.invoker` al miembro `allUsers`, asegurando acceso público y previniendo el error 403 Forbidden previo al preflight de CORS.
- **Despliegue Exitoso:** Se realizó el despliegue del hosting y de la Cloud Function unificada.

## [2026-06-12] Reajustes de CRM de Clientes (Responsividad Móvil y Remoción de Modal DB)
- **Responsividad Móvil:** Se rediseñó el contenedor de botones de acción global del CRM (`Sincronización Global`, `Despliegue Global`, `Telemetría Global`, `Nuevo Cliente`) para usar una cuadrícula responsiva de 2 columnas en mobile (`grid grid-cols-2 md:flex md:flex-wrap`) con botones de ancho completo, evitando desbordamientos de texto.
- **Acciones del Directorio de Clientes:** Se reestructuraron los botones de acción del directorio de cada cliente (`Desplegar en Local`, `Instalar Deps`, `Obtener Telemetría`, `Gestionar`) con propiedades flex-wrap, anchos mínimos (`min-w`) y alineación central, permitiendo que se acomoden simétricamente en pantallas estrechas sin truncarse.
- **Remoción de Lógica de Base de Datos:** Se removió por completo el botón de "Base de Datos", los estados de control de colecciones (`dbManageModal`, `dbCollections`, etc.), los manejadores `handleLoadDbCollections`/`handleExecuteDbCleanup` y la maquetación del modal de confirmación de borrado en `App.jsx`.
- **Verificación de Compilación:** Compilación exitosa en producción (`npm run build`).

## [2026-06-12] Personalización Avanzada de Colores y Tokens HSL (Tarea 246)
- **Estados de Tokens de Diseño:** Declarados nuevos estados reactivos para gestionar el sistema completo de colores HSL del ecosistema (`surfaceColor`, `surface2Color`, `borderColor`, `textMutedColor` y `radiusBase`) en `App.jsx`.
- **Cálculo Inteligente de Inicialización:** Agregada función helper `handleBgColorChange` y lógica en la grilla de preestablecidos para autocalcular el luma del fondo y asignar valores por defecto óptimos para superficies y contrastes de bordes/textos atenuados, facilitando el onboarding del desarrollador.
- **Panel Colapsable de Personalización:** Diseñado y renderizado un panel colapsable interactivo `"Personalización de Colores Avanzada (Tokens HSL)"` que le permite al usuario modificar de manera granular los 9 variables principales del diseño y la escala de bordes redondeados (Radius).
- **Serialización en Payload de CLI:** Integrados los tokens avanzados en los objetos de payload `cliPayload` y `branding` enviados al backend del CLI y persistidos en la base de datos Firestore central.
- **Verificación de Compilación:** Compilación exitosa en producción (`npm run build`).

## [2026-06-11] Fijación de Mockup Smartphone en Scroll (Tarea 245)
- **Alineación Stretch del Grid:** Removimos la clase de alineación vertical rígida `items-start` del contenedor de cuadrícula del Wizard de Onboarding en `App.jsx`, permitiendo que las columnas de la cuadrícula se estiren (`stretch` por defecto) a lo largo de todo el alto del contenedor.
- **Alineación self-start en Panel Izquierdo:** Agregamos la clase `self-start` al panel izquierdo (formulario) para evitar que su fondo o bordes se estiren innecesariamente, manteniéndose compacto a la altura de su contenido dinámico.
- **Contenedor Wrapper Col-Span-5:** Envolvimos el panel del mockup del teléfono (columna derecha `lg:col-span-5`) en un div estructural que se extiende a lo largo del alto total de la fila.
- **Mockup Stickiness:** Aplicamos las propiedades `sticky top-24` directamente en el componente tarjeta del mockup. Esto habilita que la vista previa interactiva del teléfono flote y quede perfectamente fija y centrada en pantalla mientras el usuario hace scroll hacia abajo para interactuar con las opciones de Branding o Módulos.
- **Verificación de Compilación:** Compilación exitosa en producción (`npm run build`).

## [2026-06-11] Catálogo de Productos y Servicios en Mockup (Tarea 244)
- **Apartado de Catálogo en Mockup de Smartphone:** Implementamos una pestaña de "Catálogo" (representada por el icono 📦) en el mockup interactivo del asistente de onboarding.
- **Títulos y Botones Adaptados al Nicho:** Se cambia dinámicamente el título a "Servicios" o "Catálogo" según el nicho de negocio configurado.
- **Base de Datos Realista por Nicho (`MOCK_CATALOG`):** Definimos una base de datos con 3 productos/servicios específicos con emojis y costos realistas para cada uno de los 10 nichos de mercado activos del ecosistema.
- **Flujo de Interactividad Financiera:** Conectamos el botón "+ Registrar" de cada producto simulado para añadirlo a la lista de órdenes del mockup y actualizar el balance diario acumulado del Home en tiempo real.

## [2026-06-11] Branding Studio HSL, WCAG y Galería de 100 Paletas por Nicho (Tareas 242 y 243)
- **Estudio de Contraste WCAG 2.1 en Vivo:** Diseñamos un widget matemático e interactivo en la sección de Branding del Wizard de Onboarding para evaluar en tiempo real el contraste relativo (Luminancia) del botón primario (contra blanco) y la interfaz (Fondo vs Texto). Muestra badges dinámicos de conformidad (`AAA`, `AA`, `Fail`).
- **Galería de 100 Paletas Cromáticas por Nicho:** Estructuramos una base de datos de 100 combinaciones clasificada en 10 nichos comerciales.
- **Acordeón Desplegable Colapsable:** Diseñamos una interfaz interactiva de acordeones en React que colapsa de forma mutua las demás categorías de nicho al expandir una nueva, manteniendo el flujo limpio.

## [2026-06-11] Control de Servidores de Desarrollo en CRM (Tarea 241)
- **Endpoints `/api/project/dev/start`, `stop`, `status`:** Implementamos control de subprocesos en caliente para levantar y detener instancias locales `npm run dev` en puertos dinámicos.
- **Botones de Control Contextuales en CRM:** Añadimos botones premium interactivos "Desplegar en Local", "Ir a Local" (apuntando al puerto dev respectivo) y "Detener" directamente en el panel de CRM por cliente.

## [2026-06-11] Selectores Multicliente y Cola Secuencial de Despliegue (Tareas 239 y 240)
- **Modal de Selección Multicliente de Telemetría Global:** Refactorizamos el botón global para abrir un modal con checklists de selección por cliente.
- **Modales de Sincronización y Despliegue Globales:** Añadimos modales homólogos para elegir qué clientes procesar antes de iniciar operaciones en lote.
- **Cola Reactiva de Despliegues en Lote:** Diseñamos un despachador secuencial reactivo con esperas de 3 segundos entre instancias, con panel de control para detener la cola en vivo y contador de progreso.

## [2026-06-11] Sincronización de Drift y Terminal de Deploy SSE (Tarea 238)
- **Visor de Diffs y Sincronización Selectiva:** Integramos un visor de diferencias de código línea a línea (`/api/project/drift`) y sincronización downstream selectiva de archivos.
- **Consola de Despliegue de Hosting (`DeployTerminalModal`):** Diseñamos una terminal interactiva oscura UNIX conectada por Server-Sent Events (SSE) que visualiza el build, pre-deploy audit y despliegue a Firebase. Habilita bypass manual en caliente.

## [2026-06-11] Simulador de Fallos Multicliente Dirigido y Personalizado (Tarea 237)
- **Panel `SimulationFailureModal`:** Sustituimos el simulador de errores aleatorios por un panel donde se selecciona el cliente objetivo, tipo de excepción (TypeError, Firebase, etc.), severidad (FAIL/WARN/INFO) y origen (Manual/Automático) para inyectar diagnósticos precisos en Firestore.

## [2026-06-11] Estabilidad Visual, Idioma y Scrolling Confinado (Tareas 235 y 236)
- **Scroll Bar Confinado (`h-screen overflow-hidden`):** Bloqueamos el scroll del viewport completo en `App.jsx`, permitiéndolo únicamente dentro de `<main className="overflow-y-auto">` para fijar la cabecera y el sidebar sidebar.
- **Correcciones Generales:** Cambiamos la clase inválida `border-slate-850` por `border-slate-800` en el buscador de logs, y simplificamos el stream signal a `~/telemetria $ escuchando_eventos_en_vivo...`.
- **Verificación de Compilación:** Compilación exitosa en producción (`npm run build`).

## [2026-06-10] Centrado de Botones en Navegación Móvil (Tarea 234)
- **Centrado Perfecto mediante Grid:** Se modificó la barra de navegación inferior móvil en `App.jsx` de `flex justify-around` a un `grid grid-cols-5 items-center justify-items-center` de 5 columnas idénticas de 20% de ancho de pantalla cada una.
- **Homogeneización de Ancho de Botones:** Se eliminaron las restricciones de ancho mínimo `min-w-[64px]` y `min-w-[52px]` y paddings horizontales variables que causaban que etiquetas largas como "Biblioteca" y "Monitoreo" empujaran el botón central "NUEVO" hacia la izquierda, logrando que el botón central quede 100% centrado matemáticamente en todos los dispositivos móviles y los demás distribuidos de forma equitativa.
- **Verificación de Compilación:** Compilación exitosa mediante `npm run build` en 1.10s.

## [2026-06-09] Modularización del Panel E2E (Tarea 300 Rev.6)
- **Modularización del Panel de Pruebas:** Se extrajo el panel E2E de [`App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) a un componente independiente y modular [`E2EPanel.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/E2EPanel.jsx). Esto eliminó más de 200 líneas redundantes de código en el archivo principal y mejoró la mantenibilidad del dashboard.
- **Log dinámico por SSE y robustez en la cancelación:** Integrada la conexión fluida al CLI Bridge Server para streaming de logs en tiempo real por Server-Sent Events, con un control de timeout de seguridad de 120s y prevención de desconexión prematura de los procesos en Windows.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 1.16s sin fallos ni advertencias.

## [2026-06-07] Corrección de Bordes en Facturación Comisional Sandbox (Tarea 229)
- **Eliminación de Clases No Estándar (slate-850):** Removidas todas las ocurrencias del color de borde y división no estándar `slate-850` en el archivo [`FacturacionComisionalSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/FacturacionComisionalSandbox.jsx).
- **Homologación Estética:** Sustituido por el color de borde estándar de la aplicación `slate-800` en las tarjetas *"Modelo de Facturación de Instancias"*, *"Resumen de comisiones"* y *"Generar Recibo"*.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 630ms.

## [2026-06-07] Corrección de Mapeo del Sandbox para Facturación y Firma Digital (Tarea 228)
- **Corrección de Coincidencia Difusa:** Modificada la lógica de la función `getSandboxKey()` en [`ComponentSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/ComponentSandbox.jsx) para reemplazar la comparación genérica `.includes('pan')` (que erróneamente tomaba el término `"panel"` de `DeveloperBillingPanel` y lo abría como si fuera un Breadcrumb) por `.split(' ').includes('pan')` para aislar la palabra exacta en español.
- **Mapeos Explícitos:** Agregadas las claves explícitas `'facturación y firma digital'`, `'facturacion y firma digital'` y `'developerbillingpanel'` en el mapeador global `COMPONENT_SANDBOX_MAP` apuntando a `'facturacion_comisional'`.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 603ms.

## [2026-06-07] Rediseño Estético del Selector de Clientes en Consola de Errores (Tarea 227)
- **Componente CustomSelect:** Reemplazado el selector nativo HTML `<select>` de filtrado por el componente unificado `<CustomSelect>` en el panel de incidentes.
- **Consistencia Visual HSL:** Implementados los bordes interactivos HSL de marca, animaciones de despliegue suaves con Framer Motion, tap-shield protector ante clics exteriores y estados activos de color de marca unificado.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 628ms.

## [2026-06-07] Botón Vaciar Historial de Incidentes (Tarea 226)
- **Importación de Icono Trash2:** Importado el icono `Trash2` de `lucide-react` para la cabecera.
- **Función handleClearAllFailures:** Desarrollada la función para ejecutar el borrado permanente del historial. Si está activo el modo real conectado, elimina los documentos físicamente de Firestore mediante `deleteDoc` de forma concurrente; si está en Sandbox, simplemente limpia el estado local de `failures`.
- **Mensaje de Confirmación:** Integrado el diálogo de confirmación asíncrono `showAlert` (diseño premium HSL de advertencia) para proteger la información contra borrados accidentales.
- **Botón en Interfaz de Errores:** Añadido el botón *"Vaciar Historial"* en la cabecera de la Consola de Errores con estados deshabilitados cuando no hay datos.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 915ms.

## [2026-06-07] Paginación y Límite de 10 Elementos en Consola de Errores (Tarea 225)
- **Estado de Paginación errorsPage:** Se implementó el estado `errorsPage` en `App.jsx` para controlar la página de incidentes activa en el historial de Consola de Errores.
- **Cálculo de Rebanada paginatedFailures:** Se crearon las variables globales `filteredFailures` y `paginatedFailures` para filtrar los incidentes según el cliente y rebanarlos en lotes de 10 por página (`FAILURES_ITEMS_PER_PAGE = 10`).
- **Componente Pagination Integrado:** Se integró el componente `<Pagination>` (reutilizable y estilizado HSL) al final del listado de incidentes.
- **Reinicio de Página:** Se configuró el dropdown de filtro de cliente para reiniciar `errorsPage` a 1 en el evento `onChange`.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 687ms.

## [2026-06-07] Conexión de ErrorBoundaryFallback con Telemetría Central (Tarea 224)
- **Firma de Callback onReport:** Actualizada la clase `ErrorBoundaryFallback` tanto en el sandbox como en el markdown de la biblioteca para pasar el objeto `error` junto al trace `errorInfo` en el callback de reporte.
- **Inserción en app_failures Central:** Implementada la lógica en `handleReport` dentro del sandbox [`ErrorBoundaryFallbackSandbox.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/admin/sandboxes/ErrorBoundaryFallbackSandbox.jsx) para inicializar dinámicamente la base de datos central de Firestore mediante variables de entorno `VITE_DEVELOPER_CENTRAL_...` y persistir los reportes de fallo de forma estructurada en la colección `app_failures`.
- **Registro en Mapa Semántico:** Actualizada la descripción técnica de `error_boundary_fallback.md` en el mapa semántico de documentación de la IA [`mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md).
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build`.

## [2026-06-07] Historial de Aprovisionamientos con Archivador y Paginación Fluida en Onboarding (Tarea 179)
- **Componente de Paginación modular:** Creado el archivo [`src/components/ui/Pagination.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/components/ui/Pagination.jsx) basado en el catálogo de componentes de la biblioteca de control, agregando soporte para que no se oculte automáticamente (`showAlways={true}`).
- **Historial e Inserción:** Inyectada una tabla detallando las instancias registradas no archivadas en la pestaña de Onboarding. Muestra el ID de cliente, su nicho/vertical con badge e iconografía HSL, el modo y comisiones activas, y la facturación electrónica.
- **Acción de Archivado:** Desarrollada la función `handleArchiveClient(clientId)` para actualizar Firestore Central configurando `archived: true` y sincronizando el estado local.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 714ms.

## [2026-06-07] Rediseño de Navegación Móvil y Reubicación de CRM y Ajustes (Tarea 178)
- **Navegación Móvil a 5 Botones:** Se modificó la constante `NAV_TABS` en `src/App.jsx` para reducirla a exactamente 5 botones, situando a 'onboarding' (Nuevo) en el centro exacto.
- **Botón Central Flotante y Neon:** Se le dotó al botón central de un posicionamiento de -mt-3.5, gradiente HSL de Prototipe, animaciones de flotado continuo elástico (`animate-center-float`), pulso con resplandor neón (`animate-pulse-glow`) al activarse, y efecto de aceleración y rotación premium de escala 1.15x al hacer hover (`onboarding-center-btn`).
- **Acceso a CRM:** Se reconfiguró el click de la tarjeta de "Clientes Activos" en el Dashboard principal para alternar `activeTab` a `'crm'`.
- **Reubicación de Ajustes:** Se insertó un botón de "Ajustes del Sistema" en el Modal de Perfil para abrir el panel de Ajustes.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 649ms.

## [2026-06-07] Renombrado de Colección de Control de Clientes (Tarea 223)
- **Base de Datos y Reglas de Seguridad:** Se modificaron las reglas de seguridad en [`firestore.rules`](file:///d:/Aplicaciones/dev-dashboard/firestore.rules) para reemplazar el match `/clientes_control/{clientId}` por `/clientes_control/{clientId}`, y se desplegaron exitosamente las nuevas reglas a Firestore Central.
- **Remoción de Nomenclatura SaaS:** Se reemplazaron todas las referencias a la colección comisional de `clientes_control` por `clientes_control` en [`src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx) (consultas, listeners en tiempo real y mutaciones locales).
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 1.10s.

## [2026-06-07] Consola de Errores y Diagnóstico de Clientes en Tiempo Real (Tarea 222)
- **Base de Datos y Reglas de Seguridad:** Se añadieron permisos de escritura públicos (`allow create: if true`) sobre la nueva colección `app_failures` en [`firestore.rules`](file:///d:/Aplicaciones/dev-dashboard/firestore.rules) para posibilitar el reporte asíncrono de excepciones y crashes desde las instancias frontend de los clientes.
- **Integración con Clientes del Ecosistema (App Ventas):** Desarrollada la función `reportAppFailureToDeveloper` en `telemetryService.js` del cliente. Configurado un listener reactivo en `App.jsx` para interceptar errores no controlados y rechazos de promesas, además de inyectar el reporte en el callback `onError` de React `ErrorBoundary`. Esto envía asíncronamente excepciones reales a la colección `app_failures` en Firestore Central con el respectivo `clientId` y stack trace.
- **Topbar Diagnostic Card (Navbar):** Se reemplazó el indicador de estado estático `Live` / `Sandbox` del topbar por una tarjeta de consola interactiva. Muestra en tiempo real el estado global: `[ 🟢 Sistemas OK ]` en verde estático o `[ ⚠️ X Fallos ]` con parpadeo dinámico (`animate-pulse`) en rojo. Al hacer clic, redirige a la pestaña de errores.
- **Consola de Gestión de Errores e Incidentes (`errors` Tab):**
  - Implementada una nueva pestaña de diagnóstico con métricas de fallos activos, clientes afectados e indicador de Uptime del motor.
  - Filtro dropdown para aislar fallos por cliente individual o vista conjunta.
  - Renderizado de tarjetas de error detallando la hora, dispositivo, mensaje de excepción y caja terminal colapsable para visualización de *Stack Traces*.
  - Botón de "Resolver" individual y "Resolver Todos" en bloque que marcan el estado `resolved: true` in Firestore (o mutan el array local en Sandbox).
- **Corrección de Sincronización de Listeners (Sandbox vs Conectado):** Se solucionó la colisión del estado `failures` agregando `isSimulated` a la lista de dependencias del `useEffect` de conexión a Firestore Central. Esto asegura que al alternar a modo Sandbox se limpien síncronamente los listeners de Firebase reales y se carguen los datos locales mock, mientras que al reconectar se vuelvan a activar los snapshots dinámicos, garantizando el funcionamiento completo de los botones en ambos entornos sin interferencias.
- **Herramientas de Sandbox:** Inyectado un botón para simular fallos aleatorios y poblar la consola diagnóstica en caliente.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 968ms.

## [2026-06-07] Restauración del Nombre de Marca a 'PROTOTIPE' (Tarea 221)
- **Nomenclatura Tradicional:** Se restauró el nombre de marca "PROTOTIPE" (añadiendo la letra P de vuelta) en el sidebar colapsado, expandido y en el header horizontal del login.
- **Ajuste de Distancia:** Se reconfiguró la separación de la marca a `gap-3` en todos los bloques visuales para brindar espacio y armonía visual con la palabra completa.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 974ms.

## [2026-06-07] Refactorización de Perfil y Modal de Sesión en Barra de Estado (Tarea 220)
- **Eliminación de Elementos Redundantes:** Se removieron por completo el selector de Modo Oscuro (`DarkModeToggle`), la información textual de perfil y el botón de salida ("Salir") de la barra de estado superior.
- **Modal de Detalles de Perfil Premium:** Se implementó el estado `isProfileModalOpen` y un botón interactivo **Perfil** (con el icono `User` de Lucide) en el topbar. Al pulsarlo, se despliega un modal con efecto glassmorphism, avatar con iniciales, rol, estado de la base de datos (Firestore Online vs Sandbox) y el botón de cierre de sesión integrado ("Cerrar Sesión").
- **Alineación de Distancias:** Se redujo el espacio entre el logotipo y el texto de marca (`ROTOTIPE`) de `gap-3` a `gap-1.5` en todas las variantes del sidebar y login para fusionar la identidad visual del isotipo.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 955ms.


## [2026-06-07] Ajuste de Nomenclatura de Marca a 'ROTOTIPE' (Tarea 219)
- **Concepto de Isotipo Integrado:** Se reemplazó el texto estático "PROTOTIPE" por "ROTOTIPE" en el sidebar (tanto en estado colapsado como expandido), permitiendo que el logotipo circular (que representa la letra "P") funcione conceptualmente como la letra inicial y se lea de corrido como "PROTOTIPE".
- **Rediseño del Header del Login:** Se refactorizó la estructura del logo y título del formulario de acceso en [`src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx#L1240) para pasar de un layout vertical apilado a un layout horizontal integrado con `ROTOTIPE` y el isotipo con borde y gradiente translúcido.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 1.04s.

## [2026-06-07] Eliminación de Subtítulo en Topbar (Tarea 218)
- **Reducción de Ruido Visual:** Se eliminó el subtítulo "Motor de Aplicaciones a la Medida" del bloque de marca visible cuando la barra lateral está colapsada en [`src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx#L2579).
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 896ms.

## [2026-06-07] Sincronización del Estilo de Logo en Login (Tarea 217)
- **Consistencia Visual Sin Sombras:** Se actualizó el contenedor del logotipo en el formulario de inicio de sesión ([`src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx#L1240)) para igualar el diseño del menú lateral:
  - Se removió el fondo degradado sólido brillante y la sombra difusa color violeta (`shadow-[0_0_25px...]`).
  - Se implementó el contenedor translúcido con gradiente suave `bg-gradient-to-tr from-violet-500/20 to-cyan-500/20` y borde HSL `border border-violet-500/30`.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 910ms.

## [2026-06-07] Corrección de Sombra Cuadrada (Overflow) en Logo (Tarea 216)
- **Restauración de Imagen & Evitación de Render Bugs:** Se restauró la imagen original [`logo.png`](file:///d:/Aplicaciones/dev-dashboard/public/logo.png) (con los colores originales cian, violeta y gris correctos). Para evitar fallos de renderizado del navegador (donde la mezcla de `border-radius`, `box-shadow` e interpolaciones del gradiente animado en modo claro causaban que el navegador creara capas de renderizado cuadradas y expusiera una sombra cuadrada a las esquinas), se simplificó el estilo del contenedor:
  - Removido el box-shadow difuso `shadow-[0_0_15px...]` y la animación `.animate-gradient-shift` sobre el contenedor de 32x32px.
  - Añadido un sombreado estándar de Tailwind `shadow-sm` (que es nativamente redondeado y seguro).
  - Agregadas las clases `rounded-full` a la etiqueta `<img>` y `overflow-hidden` al contenedor para recortar y redondear cualquier pixel en cualquier nivel de anidamiento.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 971ms sin errores.

## [2026-06-07] Actualización de Identidad Visual con Nuevo Logo y Favicon (Tarea 215)
- **Integración de Assets:** Creada la carpeta `/public` e incorporada la nueva imagen del logo (`logo.png`) en formato PNG con fondo transparente de alta resolución (1024x1024 px).
- **Favicon de la Aplicación:** Modificado el archivo [`index.html`](file:///d:/Aplicaciones/dev-dashboard/index.html) para remover el favicon en SVG inline y apuntar dinámicamente a `/logo.png`.
- **Logotipo del Sidebar:** Actualizado [`src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx#L2558) en ambos estados (colapsado y expandido del menú lateral), reemplazando los SVGs vectoriales inline antiguos por el elemento `<img src="/logo.png" />` adaptado dentro del contenedor original con borde HSL y gradiente animado.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 1.10s sin errores.

## [2026-06-07] Corrección de Contraste del Logo en Sidebar (Tarea 198)
- **Ajuste de Color de Texto:** Cambiado el color de texto estático `text-slate-800 dark:text-slate-100` del texto "PROTOTIPE" en el sidebar a la variable de tema dinámico `text-[var(--color-text)]` en [`src/App.jsx`](file:///d:/Aplicaciones/dev-dashboard/src/App.jsx#L2560). Esto soluciona el problema de visibilidad oscura y hace el logo perfectamente legible tanto en el modo claro como oscuro de la plataforma.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 892ms sin errores.

## [2026-06-07] Selector de Nicho y Panel de Gestión CRM en Consola Central
- **Selector de Nicho de Mercado:** Añadida una lista desplegable en la pestaña `Módulos` del Onboarding Wizard que permite elegir visualmente el nicho de negocio (vertical) del cliente (Ropa, Tornería, Refrigeración, Carpintería, Lavandería, Podología, Minimarkets, etc.).
- **Aprovisionamiento y Firestore:** Sincronizado el valor del nicho seleccionado en el payload de creación local `cliPayload` y guardado en el documento Firestore de `clientes_control`.
- **Panel de Gestión de Clientes (CRM Modal):** Desarrollado el modal interactivo de gestión del CRM (`activeMetricModal === 'clientes'`) que permite visualizar los detalles de aprovisionamiento de un cliente y editar en caliente su vertical (nicho), su modelo de facturación (comisiones, tarifas fijas) y la facturación DIAN, guardándolos directamente en Firestore central.
- **Compilación Exitosa:** Ejecutada compilación local (`npm run build`) verificando que Vite empaquete la aplicación sin errores.

## [2026-06-07] Extracción y Sandbox del Componente CustomCursor
- **Extracción de Biblioteca:** Refactorizado el componente [`CustomCursor`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Cursor_Personalizado/cursor_personalizado.md) para ser 100% reusable y de marca blanca, permitiendo personalizar el color principal, tamaño del aro y opacidades vía props. Catalogado en la biblioteca y registrado en `README.md` y `mapa_documentacion_ia.md`.
- **Detección e Inicialización Inteligente (First Move):** Optimizado el sistema de arranque para laptops táctiles y Windows. El componente permanece inactivo y no inyecta estilos globales ni activa el requestAnimationFrame hasta detectar el primer movimiento de ratón (`mousemove`), evitando aros colgados en `(0,0)` y pantallas táctiles falsas.
- **Creación de Sandbox Independiente:** Creado [`CustomCursorSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CustomCursorSandbox.jsx) con controles en caliente de tamaño, color del puntero y activación local aislada para demostraciones seguras.
- **Registro de Sandbox:** Registrado en la consola central [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) bajo importación dinámica y resolución por búsqueda fuzzy.

## [2026-06-07] Rediseño Premium de la pestaña de Nuevo Cliente con Fondo Ambient Glow Interactivo
- **Fondo Ambient Glow:** Implementado el componente interactivo `InteractiveAmbientGlow` de forma local en `App.jsx`, el cual genera luces y destellos orgánicos basados en el movimiento del cursor o en giroscopios móviles para máxima respuesta visual.
- **Rediseño del Tab Onboarding:** Rediseñado por completo el contenedor de Nuevo Cliente (`activeTab === 'onboarding'`) cuando el wizard no está activo (`isOnboardingActive === false`). Se creó una tarjeta con glassmorphism (`backdrop-blur-xl`, fondos HSL con opacidad), sombras difuminadas, micro-animaciones en hover y un botón de acción premium centrado con un gradiente animado y resplandor de neón en hover.
- **Validación del Entorno:** Ejecutada compilación local exitosa (`cmd /c npm run build`) para verificar la correcta integración de todas las dependencias.

## [2026-06-06] Implementación e Integración de CajaDiariaPOS (Tarea 210)
- **Ficha Técnica Catalogada:** Creado el documento técnico [`caja_diaria_pos.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Caja_Diaria_POS/caja_diaria_pos.md) detallando el control de flujo de efectivo, arqueo y firma. Sincronizado en el índice `README.md` de la biblioteca y en `mapa_documentacion_ia.md`.
- **Sandbox Independiente:** Diseñado el simulador interactivo [`CajaDiariaPOSSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CajaDiariaPOSSandbox.jsx) para emular el flujo completo (Apertura de turno, movimientos auxiliares, lienzo Canvas de firma táctil y arqueo conciliado HSL).
- **Integración Dinámica:** Registrada la carga perezosa y los aliases en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) con soporte de búsqueda difusa.
- **Verificación de Compilación:** Compilación a producción ejecutada con éxito con Vite (`npm run build`).

## [2026-06-06] Modularización Absoluta de la Consola Central (40 Sandboxes Independientes y Carga Perezosa) (Tarea 209)
- **Modularización Completa del Sandbox:** Desacoplados y extraídos los 40 sandboxes y playgrounds interactivos a archivos independientes y autocontenidos bajo `src/components/admin/sandboxes/`.
- **Carga Perezosa e Importación Dinámica:** Reconfigurada la consola central [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) para cargar todos los 40 sandboxes mediante `React.lazy` + `React.Suspense` con un spinner común. Esto reduce el tamaño del archivo de ~5,600 líneas a menos de 550 líneas, optimizando significativamente la velocidad de carga de la app y reduciendo drásticamente el consumo de tokens en turnos de IA.
- **Sincronización de Directivas y Skills:** Modificada la directiva `@sandbox` en `GEMINI.md` y el flujo de trabajo en la skill `sandbox-integrator` y `component-creator` para obligar de manera estricta a crear archivos de sandbox independientes planos directamente en `src/components/admin/sandboxes/`.
- **Verificación de Compilación:** Compilación a producción ejecutada con éxito con Vite (`npm run build`) en 912ms, dividiendo la aplicación en 40 chunks pequeños dinámicos de sandbox independientes.

## [2026-06-06] Refactorización de Sandbox a Modularización Dinámica (Lazy Loading) (Tarea 208)
- **Modularización del Sandbox:** Extraídos los 4 nuevos playgrounds a ficheros autocontenidos en `src/components/admin/sandboxes/`.
- **Carga Dinámica (React.lazy & Suspense):** Sustituidos los componentes monolíticos por importaciones dinámicas `React.lazy()` en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx). El orquestador ahora es ligero, consumiendo mínimos tokens de contexto en edición.
- **Creación de Layout Compartido:** Creado [`SandboxLayout.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SandboxLayout.jsx) para centralizar la estructura de los controles y previsualización de todos los sandboxes dinámicos, eliminando la duplicación de código.
- **Verificación de Compilación:** Compilación a producción ejecutada con éxito con Vite (`npm run build`) en 558ms, generando chunks individuales para cada playground.

## [2026-06-06] Sandbox e Integración de los 4 Componentes Premium (Tarea 207)
- **Playgrounds Sandbox:** Desarrollados e inyectados los 4 playgrounds interactivos (`auth_guard_userprofile`, `global_skeleton_loader`, `breadcrumb_header`, `error_boundary_fallback`) en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) con controles en caliente.
- **Fallo y Recuperación (Boundary):** El playground de `error_boundary_fallback` simula de forma interactiva un crash en caliente y expone el flujo de reintento/aislamiento visual sin congelar el dashboard.
- **Simulador de Carga (Skeleton):** El loader de skeletons incluye un disparador de simulación diferido de 2 segundos para ver la transición shimmer y mitigación de CLS.
- **Mapeo de Claves y Búsqueda Difusa:** Mapeadas las llaves en `COMPONENT_SANDBOX_MAP` de `ComponentSandbox.jsx` y ampliada la búsqueda difusa de la consola para forzar la resolución de los playgrounds.
- **Registro Semántico:** Indexados los 4 archivos markdown con sus correspondientes Criterios de Decisión IA en [`mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md).
- **Verificación de Compilación:** Compilación a producción ejecutada con éxito con Vite (`npm run build`) en 599ms sin fallos ni advertencias.

## [2026-06-06] Categorías Colapsables Premium en el Explorador de Biblioteca
- **Diseño de Acordeón Desplegable:** Reemplazado el listado estático y expandido de categorías en la barra lateral de [`ComponentLibraryView.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) por botones de tipo selector desplegable premium (acordeón).
- **Animaciones Elásticas (Framer Motion):** Implementada la envoltura `AnimatePresence` y animaciones de `motion.div` con físicas de tipo *spring* para colapsar y expandir la lista de componentes de forma fluida. Se agregó una rotación elástica en el chevron indicador del estado de despliegue.
- **Auto-Expansión Inteligente:** Integrado un efecto reactivo (`useEffect`) que expande automáticamente la categoría correspondiente si el componente activo pertenece a ella, y fuerza la apertura de todas las categorías activas que tengan coincidencias de búsqueda cuando el usuario escribe en el input de filtrado.
- **Verificación de Compilación:** Compilación a producción ejecutada con éxito con Vite (`npm run build`).

## [2026-06-06] Muestras de Color Circulares en el Selector de Atributos (Playground)
- **Visualización Premium de Colores:** Modificado el playground `'selector_atributos'` en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) para mapear los nombres de colores a códigos hexadecimales reales (`#1e293b`, `#ffffff`, `#3b82f6`, `#ef4444`, `#10b981`).
- **Rediseño Concéntrico de Selección:** Se implementó un diseño de muestras de color concéntricas y minimalistas inspiradas en Apple/Shopify. Cada swatch consta de un contenedor circular externo con bordes responsivos y un punto de color flotante interno. Al seleccionarse, el contenedor externo se tiñe de color índigo y se expande con transiciones fluidas de `framer-motion` (`motion.span` con interpolación spring), eliminando el checkmark tosco para una apariencia limpia y profesional.
- **Corrección de Referencia (Bugfix):** Añadido el componente `Check` a las importaciones de `lucide-react` en `ComponentSandbox.jsx` para solucionar el error `ReferenceError: Check is not defined` que provocaba pantallazos en blanco al renderizar los indicadores de checkmark sobre las muestras.
- **Verificación de Compilación:** Compilación a producción ejecutada con éxito con Vite (`npm run build`) en 634ms.

## [2026-06-06] Desvinculación de CategoryManager e Independencia del Sandbox de Categorías (Tarea 206)
- **Playground Gestor de Categorías:** Diseñado e inyectado el nuevo playground interactivo `'gestor_categorias'` en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) para emular de forma 100% interactiva el componente `CategoryManager` de la biblioteca, permitiendo crear, editar, eliminar y filtrar su catálogo de iconos nativos mediante tags de búsqueda.
- **Corrección de Mapeo de Sandbox:** Modificado el mapa `COMPONENT_SANDBOX_MAP` en `ComponentSandbox.jsx` para que las claves de búsqueda de la categoría (`'selector de categorías (categorymanager)'`, `'selector de categorías'`, `'selector_categorias'`) se dirijan al playground `'gestor_categorias'` y no colisionen con el playground `'selector_atributos'` (reservado exclusivamente para el selector de variantes de producto / CustomSelect).
- **Verificación de Compilación:** Compilación a producción ejecutada con éxito con Vite (`npm run build`) en 622ms libre de errores.

## [2026-06-06] Rediseño Premium de la Ruleta y Selector Custom en Reservas (Tareas 204 y 205)
- **Ruleta de la Fortuna Premium:** Rediseñado por completo el SVG de la ruleta (`'ruleta_suerte'`) en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx). Se implementó un aro exterior metálico dorado de alta fidelidad, bombillos LED animados que parpadean secuencialmente mediante animaciones de fotogramas CSS (`@keyframes bulbGlow`), una flecha/puntero vectorial premium con gema rubí integrada, y se reubicó el texto de los premios de forma radial orientados hacia afuera (`textAnchor="end"`) para evitar cualquier superposición con el botón central de giro.
- **Selector Desplegable Premium en Reservas:** Reemplazado el selector nativo HTML `<select>` en el playground de la agenda de citas (`'reservas_agenda'`) por un dropdown interactivo controlado por estado (`isSelectOpen`) y animado con Framer Motion, que incluye flechas Chevron rotativas, fondos adaptativos HSL, y un tap-shield overlay para cerrar el menú en clics exteriores.
- **Verificación de Compilación:** Compilación a producción generada exitosamente con Vite (`npm run build`) en 553ms sin fallos ni advertencias.

## [2026-06-06] Solución de Dropdowns Nativa en Selector Desplegable y Habilitación de Sandboxes (Tarea 203)
- **Selector Desplegable Custom (Premium):** Reemplazada la etiqueta nativa HTML `<select>` en el playground `'selector_atributos'` de [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) por una lista desplegable animada premium utilizando Framer Motion (`motion.div` y `AnimatePresence`), un tap-shield overlay para cerrar con clicks exteriores, y bordes interactivos basados en el estándar HSL de marca blanca.
- **Habilitación de Sandboxes en la Biblioteca:** Definida la función helper `getSandboxKey` en `ComponentSandbox.jsx` y exportada para ser consumida en [`ComponentLibraryView.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx). Esta función resuelve de forma robusta la visualización de los playgrounds de la "Ruleta de la Fortuna de Premios" (`RaffleWheelOfFortune`) y del "Selector de Reservas tipo Agenda" (`AgendaReservationCalendar`), asociándolos a sus respectivas simulaciones `'ruleta_suerte'` y `'reservas_agenda'` mediante concordancia exacta y fuzzy search.
- **Verificación de Compilación:** Proyecto compilado exitosamente para producción (`npm run build`) en 518ms libre de errores.

## [2026-06-06] Integración y Sandbox de Empty State Premium Interactivo (Tarea 202)
- **Playground Sandbox:** Implementada la visualización interactiva para `EmptyState` (`empty_state`) en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) para solucionar el error "Playground No Configurado".
- **Animaciones Elásticas:** Integrada la biblioteca `framer-motion` para imitar las animaciones de escala y retroceso elástico del botón de llamada a la acción original de la aplicación.
- **Mapeo de Claves y Fuzzy Search:** Añadidos los alias de mapeo de nombres (`emptystate`, `empty state`, etc.) en `COMPONENT_SANDBOX_MAP` y ampliada la búsqueda difusa de la consola para forzar la resolución del playground cuando se consulta.
- **Corrección de Contraste en Botón:** Reemplazada la clase no estándar `bg-indigo-650` por `bg-indigo-600` (y hover de `bg-indigo-500`) en el botón elástico del `SandboxEmptyState` para solucionar la baja visibilidad y asegurar un contraste de interfaz óptimo en temas claros/oscuros.
- **Corrección de Seguimiento de Cursor (Fondo de Luces):** Corregido un bug crítico de React en `SandboxInteractiveAmbientGlow` donde el loop de animación `requestAnimationFrame` se cancelaba en cada evento `mousemove` debido a la recreación del efecto al cambiar la dependencia `mousePos`. Se migró el almacenamiento de la coordenada del ratón a un `useRef` para mantener el ciclo activo sin interrupciones, permitiendo un seguimiento del puntero extremadamente fluido.
- **Redimensionado del Menú Radial:** Se modificaron las dimensiones de los botones del abanico del `RadialInteractiveMenu` de `w-12 h-12` a `w-9 h-9` (centrándolos con `left-1.5 top-1.5` y dándoles bordes `rounded-xl`). Esto evita el solapamiento de los botones y genera una jerarquía visual clara respecto al disparador central de `w-12 h-12`.
- **Verificación de Compilación:** Compilado a producción exitosamente (`npm run build`) en 760ms libre de errores.

## [2026-06-06] Diseño e Integración del Segundo Trío de Componentes VIP (Tarea 201)
- **Playground Sandbox:** Inyectados los componentes `SandboxMagneticButton`, `SandboxSwipeableCardStack`, y `SandboxInteractiveAmbientGlow` en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx).
- **Playgrounds Interactivos:** Creados playgrounds interactivos configurables para los tres componentes, permitiendo cambiar sensibilidades, colores, umbrales de descarte y radios magnéticos de atracción.
- **Mapeo de Claves:** Registrados los alias de búsqueda en `COMPONENT_SANDBOX_MAP` y habilitado soporte de búsqueda difusa para evitar playgrounds vacíos.
- **Verificación de Compilación:** Compilado exitosamente para producción (`npm run build`) en 586ms libre de errores.

## [2026-06-06] Corrección de Borde de Marquesina de Marcas (InfiniteLogoMarquee)
- **Eliminación de Recorte de Bordes en Hover:** Se solucionó el problema en el que las tarjetas dentro del componente de la marquesina infinita horizontal (`InfiniteLogoMarquee`) perdían sus bordes superior e inferior (se recortaban) al pasar el cursor por encima (hover:scale-105).
- **Remoción de overflow-hidden redundante:** Se eliminó la clase `overflow-hidden` del div interno `.marquee-container` y se reubicó el padding vertical al contenedor exterior (ampliando a `py-4`), garantizando que la transformación de escala en 3D (`scale-105`) tenga espacio de dibujo suficiente y no sufra recortes.
- **Sincronización con Biblioteca:** Se modificó en paralelo la especificación técnica en la biblioteca de componentes ([`marquesina_marcas.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Marquesina_Marcas/marquesina_marcas.md)).

## [2026-06-06] Diseño e Integración de Trío de Componentes Premium (Tarea 199)
- **Fichas Técnicas de Biblioteca:** Creadas y catalogadas las especificaciones técnicas detalladas en markdown para [`marquesina_marcas.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Marquesina_Marcas/marquesina_marcas.md), [`menu_radial.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Menu_Radial/menu_radial.md) y [`tarjeta_3d_holografica.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Tarjeta_3D_Holografica/tarjeta_3d_holografica.md).
- **Sincronización:** Mapeados e indexados los tres nuevos componentes en `README.md` de la biblioteca y en `mapa_documentacion_ia.md`.
- **Playground Sandbox:** Implementados los componentes e integrados sus playgrounds interactivos correspondientes (`'infinite_logo_marquee'`, `'radial_interactive_menu'`, y `'holographic_tilt_card'`) con controles de velocidad, ángulos, radio y efectos 3D en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx).
- **Mapeo de Sandbox:** Agregadas las claves en `COMPONENT_SANDBOX_MAP` de `ComponentSandbox.jsx` para resolver la visualización interactiva de los tres.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 644ms sin advertencias ni errores.

## [2026-06-06] Diseño e Integración de Calendario/DatePicker Premium (Tarea 198)
- **Ficha Técnica:** Creada y guardada la ficha técnica de [`calendario_premium.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Calendario_Premium/calendario_premium.md) en la biblioteca de componentes.
- **Sincronización:** Registrada la entrada en `README.md` de la biblioteca y en `mapa_documentacion_ia.md`.
- **Playground Sandbox:** Implementado el playground interactivo reactivo de fecha única y rango de fechas con presets rápidos en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) y registrado en `COMPONENT_SANDBOX_MAP` para soportar búsqueda y simulación visual.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 822ms sin advertencias ni errores.

## [2026-06-06] Extracción y Sandbox de Facturación Comisional y Telemetría Centralizada (Tarea 197)
- **Especificaciones de Biblioteca:** Creadas y catalogadas las especificaciones técnicas markdown de [`facturacion_comisional.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Monetizacion_Desarrollador/Facturacion_Comisional/facturacion_comisional.md) y [`telemetria_centralizada.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Servicios_y_Firebase/Telemetria_Centralizada/telemetria_centralizada.md) en la biblioteca reutilizable de componentes de marca blanca.
- **Sincronización de Catálogo:** Registrada la entrada y el Criterio de Decisión IA para ambos componentes en `README.md` de la biblioteca y en `mapa_documentacion_ia.md`.
- **Playground Sandbox:** Implementados los playgrounds reactivos simulados en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) para `'facturacion_comisional'` (que integra el widget `DeveloperBillingPanel` con firma digital HTML5 Canvas, descarga de PDF y desglose comisional) y para `'telemetria_centralizada'` (con simulador interactivo de consola de terminal de logs de telemetría y disparador de eventos COP).
- **Mapeo de Sandbox:** Registradas las claves en `COMPONENT_SANDBOX_MAP` de `ComponentSandbox.jsx` para resolver la visualización interactiva de ambos.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 719ms sin advertencias ni errores.

## [2026-06-06] Eliminación de Borde de Enfoque en Buscador de Biblioteca (Tarea 196)
- **Corrección de Borde de Enfoque (`focus`):** Se identificó que las directivas globales con `!important` del tema claro (`:root.light`) en [`index.css`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/index.css#L205-L221) forzaban bordes e iluminación (`box-shadow`) en todos los campos de texto `input[type="text"]`, anulando los estilos Tailwind `border-0` y `outline-none` del buscador. Se modificó el archivo CSS para agregar la pseudoclase `:not(.bg-transparent)` a las directivas de inputs y textareas de modo claro, permitiendo que las barras de búsqueda y elementos transparentes hereden el diseño limpio original de marca blanca.
- **Verificación de Compilación:** Compilado exitosamente en local para producción (`npm run build`) libre de errores en 725ms.

## [2026-06-06] Implementación e Integración de useDebounceValue y StockHeatmap (Tarea 195)
- **Especificaciones de Biblioteca:** Creadas y catalogadas las fichas técnicas y código funcional para el hook [`use_debounce_value.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/useDebounceValue/use_debounce_value.md) y el componente [`stock_heatmap.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Stock_Heatmap/stock_heatmap.md). Sincronizados ambos en el `README.md` del catálogo y en el `mapa_documentacion_ia.md`.
- **Integración en Playground Sandbox:** Implementado el código embebido y el playground interactivo para `'use_debounce_value'` (que simula retraso en inputs de búsqueda) y `'stock_heatmap'` (que simula variaciones de inventario por semáforo HSL) en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx). Mapeadas sus llaves en `COMPONENT_SANDBOX_MAP`.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 722ms sin advertencias ni errores.

## [2026-06-06] Registro y Playground del Trío Final de Componentes Premium (Tarea 194)
- **Registro del Trío Final de Componentes:** Mapeadas las claves de búsqueda en `COMPONENT_SANDBOX_MAP` dentro de [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) para los componentes `CommandPaletteKBar`, `InteractiveCouponBadge` e `InteractiveTutorialTour`, permitiendo que el selector reactivo del panel de sandbox local interactúe con sus respectivos playgrounds simulados.
- **Resolución de Errores de Sintaxis y Referencias:**
  - Corregido un fallo crítico de JSX y parseo en `ComponentSandbox.jsx` en el componente `SandboxOTPInputField`, donde faltaban las etiquetas de cierre de contenedor (`</div>`), retorno (`);`) y cierre de función (`}`), previniendo que la consola de desarrollo de Vite levantara y dejando la pantalla del dashboard en negro. Se restauró el handler de pegado `onPaste={handlePaste}`.
  - Corregido un error de referencia runtime `Uncaught ReferenceError: ReactDOM is not defined` en `SandboxInteractiveTutorialTour` importando `createPortal` directamente de `'react-dom'` y sustituyendo `ReactDOM.createPortal` por `createPortal`.
- **Integración de Alertas Premium:** Eliminados los `alert(...)` nativos del navegador dentro de los playgrounds de Sandbox (`guided_toast`, `command_palette_kbar`, `interactive_tutorial_tour`) y reemplazados por el hook `useAlertConfirm` (`showAlert`) de la aplicación, el cual renderiza modales HSL estilizados con gradientes, iconos de vector animados y soporte completo para el modo oscuro/claro del dashboard.
- **Verificación de Compilación:** Compilación e integración exitosas con `npm run build` en 521ms sin advertencias ni errores.

## [2026-06-06] Filtros de Visualización Sandbox e Iconos de Ojo en Biblioteca (Tarea 193)
- **Filtros Segmentados Premium:** Diseñados e implementados dos botones de filtrado rápido ("Sandbox" y "Solo Docs") debajo de la barra de búsqueda en el componente [`ComponentLibraryView.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx). El filtro "Sandbox" reduce la lista a los componentes simulables de forma reactiva, mientras que "Solo Docs" filtra los que solo tienen ficha markdown técnica.
- **Barra de Búsqueda Global:** Adaptado el buscador del sidebar para actuar de manera global e integrarse sobre la selección activa de filtros segmentados de Sandbox, respetando el total filtrado en el contador dinámico de resultados.
- **Icono de Ojo (`Eye`) en Componentes:** Integrado un icono visual de un ojo (`Eye` de Lucide, color indigo-400) al lado de las etiquetas de texto de cada componente en la lista de árbol que soporta previsualización en Sandbox (resuelto a través de las llaves declaradas en `COMPONENT_SANDBOX_MAP`), indicando de forma proactiva al desarrollador qué elementos tienen simulación interactiva.
- **Verificación de Compilación:** Compilado exitosamente en local para producción (`npm run build`) libre de errores en 699ms.

## [2026-06-05] Personalización de Identidad Visual PROTOTIPE y Animaciones Tecnológicas (Tarea 192)
- **Rebranding Completo PROTOTIPE:** Purgado por completo el término "Ecosistema" de la interfaz del dashboard (sidebar, login, títulos, logs y comentarios), reemplazándolo por el nombre oficial **PROTOTIPE — Motor de Aplicaciones a la Medida** y su respectivo cargador cromático en violeta y cian.
- **Favicon SVG de Marca:** Reemplazado el favicon de emoji `🛡️` en `index.html` por un logotipo de marca SVG en gradiente animado representando una "P" isométrica tecnológica de PROTOTIPE.
- **Sistema de Animaciones Avanzadas (CSS Keyframes):**
  - *Gradient Shift:* Rotación suave de colores en el borde del logotipo de la barra de navegación.
  - *Radar Pulse:* Efecto de pulso concéntrico para indicar la salud y conexión del monitor de telemetría y base de datos central.
  - *Interactive Hover Glow:* Efecto de traslación 3D y resplandor radial suave en las tarjetas de métricas del dashboard (`.hover-glow-card`).
- **Terminal de Telemetría Realista:** Rediseñado el panel de la consola de telemetría de logs con un acabado de ventana de línea de comandos real, incorporando los botones simulados de control (Rojo/Amarillo/Verde) y título monospaced en la cabecera.
- **Alineación del Menú Hamburguesa:** Reestructurado el botón de alternado del sidebar (`Menu`) dentro de un contenedor flex con ancho sincronizado dinámicamente (`w-[64px]` / `w-[220px]`) y borde derecho divisorio en el Topbar, logrando una alineación perfecta en el eje vertical con los iconos del sidebar colapsado y expandido.
- **Solución a SyntaxError en generator.js:** Corregido un fallo de sintaxis en `D:\PROTOTIPE\Prototipe-CLI\generator.js` (líneas 333 y 336) provocado por usar comillas invertidas (backticks) sin escapar dentro de un literal de plantilla, lo que causaba que Node.js arrojara `SyntaxError: Unexpected identifier 'inicializacion_nuevos_proyectos'` e impidiera el arranque del servidor.
- **Verificación de Compilación:** Compilado a producción con Vite (`npm run build`) de forma exitosa y libre de fallos.

## [2026-06-05] Auditoría de Robustez, Fugas de Memoria, Conexión CLI y Contraste de Inputs (Tarea 191)
- **Corrección de Fuga de Memoria (Firestore Listeners):** Movida la inicialización y des-suscripción de los listeners de telemetría, clientes y tokens (`onSnapshot`) al ámbito superior de `useEffect` principal. Se implementó una función `cleanUpListeners` para garantizar que todas las conexiones activas se liberen al desmontar la interfaz o al cambiar la sesión de autenticación del usuario.
- **Robustez del CLI Bridge (Manejo de Errores):** Mejorados los sumarios de logs y toasts de error en la API local (`/api/create-project`). Ahora se intenta parsear la respuesta HTTP del daemon local como JSON estructurado para extraer y mostrar de forma clara el error lógico interno, cayendo en texto plano ante fallos de conexión tradicionales.
- **UI/UX - Contraste de Inputs en Modo Claro:** Añadida una regla CSS global en `index.css` que redefine el estilo de inputs y textareas bajo el tema claro (`:root.light`). Eleva la opacidad de los bordes a un `16%` e inyecta un sombreado y color de fondo sutil que previene campos invisibles o planos.
- **Verificación de Compilación:** Compilado exitosamente para producción (`npm run build`).

## [2026-06-05] Corrección de Visibilidad en Modo Claro (Botones y Modal de Fuentes)
- **Normalización de Colores de Tailwind:** Reemplazados los usos residuales de `bg-indigo-650/15` por `bg-indigo-600/15` en el componente de selección del Modal de Fuentes en `App.jsx` (línea ~1908) para prevenir que se rendericen transparentes/blancos con texto blanco en el tema claro del dashboard.
- **Verificación de Compilación:** Compilación a producción generada exitosamente con Vite sin advertencias.

## [2026-06-04] Optimización de Rendimiento y Adaptabilidad de Pantalla (144Hz)
- **Memoización de Cálculos Pesados:** Extraídos y envueltos en `useMemo` a nivel de componente principal los cálculos y ordenaciones de `trendData` y `salesTrendData` que previamente se recalculaban en cada renderizado de la interfaz en los bloques condicionales de renderizado de pestañas.
- **Aceleración por Hardware (GPU):** Inyectada la directiva CSS de hint de renderizado `will-change: transform, opacity` a las vistas animadas principales por Framer Motion en el panel central de la consola para forzar al navegador a subir las capas a la GPU, estabilizando la fluidez a 144 FPS y eliminando tirones en pantallas de alta tasa de refresco.
- **Desactivación de Animaciones en Gráficos:** Desactivadas las animaciones internas de Recharts (`isAnimationActive={false}`) en `<Bar>`, `<Line>` y `<Area>` para suprimir picos de uso de CPU del hilo principal cuando se reciben logs o telemetría asíncrona constante, garantizando una fluidez impecable tanto en ordenadores de alto rendimiento como en smartphones.
- **Verificación de Compilación:** Compilación a producción generada exitosamente.

## [2026-06-04] Rebranding, Simulación Unificada Concurrente y Widget de Notas Flotante
- **Higienización de Terminología (Rebranding):** Sustituidas visualmente y en logs del monitor todas las referencias al término "Ecosistema" (ej. "clientes Ecosistema", "Consola Ecosistema", "Comisión Base Ecosistema", etc.) por "Aplicaciones a la Medida", "Ecosistema", "Instancias de Clientes" y "Configuración de la Aplicación", alineándolo con el modelo de negocio personalizado sin alterar nombres de colecciones en base de datos.
- **Simulación comisional concurrent / individual:**
  - Rediseñada la función `handleCreateTestReport` para aceptar un `clientId` opcional. Si es nulo, dispara concurrencia con `Promise.all` mapeando la simulación para todos los clientes registrados; si se provee, simula solo ese cliente.
  - Integrada la lógica de modos de facturación (porcentaje, tarifa fija, costo DIAN) dentro de la función de simulación.
  - Añadido botón "Simular Reporte" a las filas de la lista de CRM y botón "Simular Envío" a la ficha del cliente, y removida la función inline redundante `handleTriggerTelemetry`.
- **Widget de Notas Flotante y Drawer:**
  - Declarados e inicializados todos los estados reactivos que controlan el sistema de notas (`notes`, `noteTitle`, `noteContent`, `noteType`, `noteSearch`, `editingNoteId`, `isNotesOpen`).
  - Creado un botón flotante absoluto (`fixed bottom-6 right-6 z-45`) con degradado premium, sombra de neón y badge indicador circular con `notes.length` visibles al iniciar sesión.
  - Implementado Drawer lateral derecho (`isNotesOpen`) que expone el buscador fuzzy, filtros por tipo (Idea, Recordatorio, Tarea) y CRUD reactivo completo de notas.
  - Integrada persistencia local con `localStorage` (clave `dev_notes`) y sincronización en vivo mediante listener Firestore en la colección `/developer_notes`.
- **Verificación de Compilación:** Compilado exitosamente para producción a través de Vite (`npm run build`).

## [2026-06-04] Adaptabilidad de Botones y Colores en Modo Claro y Oscuro
- **Adaptabilidad en Botones del Dashboard (Bug Estético/Visual):** Corregido el problema de invisibilidad de los botones "Enviar Telemetría Prueba" y "Generar Reporte de Prueba" en modo claro, donde el fondo slate-800 fijo y el texto oscuro dificultaban o impedían la lectura.
- **Implementación de Clases de Tema Adaptativas:** Sustituidos los fondos y bordes oscuros fijos de los botones por clases que consumen las variables de CSS del tema (`bg-[var(--color-surface-2)]`, `hover:bg-[var(--color-border)]`, `border-[var(--color-border)]` y `text-[var(--color-text)]`), haciéndolos automáticamente legibles en cualquier modo.
- **Normalización de Colores de Tailwind (Integridad visual):** Corregidos todos los colores no estándar en `App.jsx` que terminaban en 550, 650, 450, etc., reemplazándolos por clases estándar de Tailwind CSS (como `bg-indigo-600`, `text-amber-600`, `bg-amber-500`, etc.) para asegurar el correcto renderizado y evitar colisiones visuales.
- **Optimización de Cabecera Móvil:** Cambiado el degradado de bajo contraste en la cabecera móvil a texto adaptativo directo `text-[var(--color-text)]`.
- **Compilación de Integridad:** Ejecutada compilación exitosa con `npm run build`.

## [2026-06-04] Solución a Excepción de Referencia StickyNote en App.jsx
- **Importación de Icono Faltante (Bug Correctivo):** Corregido el crash de ejecución en el renderizado móvil `Uncaught ReferenceError: StickyNote is not defined` provocado al intentar mapear los botones de navegación inferior en `App.jsx` (línea ~2349).
- **Importación del Componente:** Agregado `StickyNote` al listado de iconos desestructurados de la librería `'lucide-react'` en las cabeceras del archivo principal.
- **Compilación de Integridad:** Ejecutada compilación limpia con `npm run build` en 663ms.

## [2026-06-04] Reemplazo de Selects Nativos por Componente CustomSelect Reactivo
- **Eliminación de Elementos de Interfaz Nativos (Bugs Estéticos):** Los elementos `<select>` nativos del navegador llamaban a menús de opciones e interfaces de sistema operativo con bordes duros, colores claros por defecto y comportamientos no personalizables en CSS.
- **Creación de Componente CustomSelect:** Implementado el componente interactivo `CustomSelect` en React para suplantar selectores. Cuenta con:
  - Manejo de estado abierto/cerrado (`isOpen`).
  - Animación de rotación en el icono `ChevronDown`.
  - Soporte de detección de clicks exteriores (`handleClickOutside` con `useRef` y eventos de ratón) para cerrarse automáticamente al pulsar fuera.
  - Visualización y hover integrados en el tema estético oscuro de la plataforma.
- **Reemplazos Realizados:** Sustituidos quirúrgicamente los 3 selects del sistema: (1) Modelo de Facturación en Briefing, (2) Plantilla Base en el Wizard de Onboarding, y (3) Modelo de Facturación en Ajustes Ecosistema del CRM.
- **Compilación de Control:** Ejecutado el comando `npm run build` confirmando compilación a producción 100% exitosa.

## [2026-06-03] Opción 'Crear desde cero' (template-core-seed) en Asistente de Aprovisionamiento
- **Integración de Plantilla Semilla:** Agregada la opción 'Crear desde cero' con el ID del sistema `template-core-seed` al selector de plantillas del asistente de onboarding y aprovisionamiento de clientes.
- **Flujo de Envío de Payload:** Asegurado que al seleccionar esta opción, el valor `template-core-seed` se inyecte correctamente en el objeto `cliPayload` enviado a la API del daemon local (`POST http://localhost:3001/api/create-project`) y se registre de forma persistente en el campo `template` del documento del cliente en Firestore central.
- **Soporte de Carga Dinámica:** Modificada la inicialización del estado reactivo `templates` y la consulta asíncrona a `http://localhost:3001/api/templates` para que la opción "Crear desde cero" se inyecte y mantenga de forma proactiva al inicio de la lista de plantillas, sirviendo a su vez como opción por defecto del wizard.
- **Compilación de Integridad:** Ejecutada compilación limpia con `npm run build` en 739ms.

## [2026-06-03] BUG-017 — Campos `customPrimary` / `customAccent` faltantes en `cliPayload`
- **Causa raíz:** El objeto `cliPayload` en `src/App.jsx` (línea ~1416) enviaba `paletteChoice: 'custom'` al CLI pero omitía los campos `customPrimary` y `customAccent` que `generator.js` requiere para inyectar los colores reales en el `.env.local` del proyecto aprovisionado. Todos los proyectos creados recibían variables de color vacías.
- **Corrección aplicada (quirúrgica — 2 líneas):** Agregados los campos:
  ```js
  customPrimary: primaryColor,   // ← AÑADIDO
  customAccent: secondaryColor,  // ← AÑADIDO
  ```
  Inmediatamente después de `paletteChoice: 'custom'` en el bloque `cliPayload`.
- **Archivo afectado:** `src/App.jsx` — L1416-L1418.
- **Compilación de Integridad:** `npm run build` → ✓ 1964 modules transformed en 511ms, sin errores.

## [2026-06-03] Solución de Desbordamiento en Panel de Aprovisionamiento Manual
- **Prevención de Desbordamiento Horizontal (Overflow):** Solucionado el bug en el modal de Onboarding Wizard donde los bloques de código largo (ej. Tokens de telemetría o VAPID Keys) empujaban el ancho de las tarjetas, generando una barra de scroll horizontal en todo el modal.
- **Ajustes de Maquetación Responsiva:**
  - Añadida la clase `min-w-0` a los contenedores Flex principales de cada paso.
  - Implementado `flex-1 min-w-0` en los contenedores de texto secundarios para permitir la correcta contracción del contenido interno.
  - Agregado `overflow-x-auto` a los tags `<pre>` para que el código largo mantenga su scroll local horizontal.
  - Normalizada la truncación (`truncate min-w-0`) en la visualización de la clave VAPID de Firebase.
- **Verificación de Compilación:** Compilación de producción con Vite (`npm run build`) completada con éxito.

## [2026-06-03] Borrado Físico de Documentos al Descartar Aprovisionamiento Pendiente
- **Flujo de Descarte Mejorado:** Modificada la funcionalidad del botón "Descartar" en el banner de aprovisionamiento pendiente. Ahora ejecuta una eliminación física y explícita en Firestore central antes de limpiar el estado reactivo local.
- **Borrado Atómico mediante writeBatch:** Implementada la lógica que localiza y elimina de manera segura `clientes_control/{clientId}` y su respectivo `tokens/{telemetryToken}` usando la API `writeBatch` de Firebase Firestore.
- **Limpieza de Estado y Notificación:** Tras el borrado exitoso, limpia el estado `pendingCliProvisioning` y emite un toast informativo: *"Registro de cliente descartado y eliminado de Firestore central"*.
- **Compilación de Integridad:** Verificado mediante compilación de producción exitosa con `npm run build`.

## [2026-06-03] Normalización de estadoPago y Fallback 'pendiente' en Filtros
- **Resolución de Inconsistencia en Datos de Producción (Data Drift):** Identificado que los registros en Firestore central no poseen de manera explícita el campo `estadoPago`. En el renderizado de la tabla el sistema los presentaba visualmente como *"Pendiente"* por descarte de condición, pero el motor de filtrado del listado general y del CRM los omitía al no existir coincidencia literal con `'pendiente'`.
- **Implementación de Fallback Robusto:** Modificados todos los filtros, reducciones aritméticas y vistas del CRM/Dashboard para evaluar el estado a través de `(r.estadoPago || 'pendiente').toLowerCase()`.
- **Compilación de Control:** Ejecutado el comando `npm run build` confirmando compilación a producción 100% exitosa.

## [2026-06-03] Filtro de Estado de Pagos en Ficha CRM del Cliente
- **Implementación de Filtros en Historial de Cliente:** Agregada la capacidad de filtrar el historial individual de reportes de comisiones de un cliente específico por su estatus de pago ("Todos", "Pendientes", "Pagados") dentro del portal CRM de clientes.
- **Creación de Estado Reactivo:** Introducido el estado `crmStatusFilter` para controlar qué tipo de reportes se visualizan.
- **Renderizado de Barra de Filtros:** Incorporada una botonera en la sección "Historial de Reportes del Cliente" para cambiar interactivamente entre los estados de cobro.
- **Compilación de Control:** Ejecutado el comando `npm run build` confirmando compilación a producción 100% exitosa.

## [2026-06-03] Integración de Facturación Electrónica DIAN y Desglose de Comisiones en CRM
- **Configuración de Facturación DIAN en CRM:** Agregados los campos `enableDianBilling` (Checkbox) y `costoPorFacturaDian` (Input numérico, por defecto 150) dentro de la ficha de edición del cliente en el CRM.
- **Persistencia de Configuración:** Integrada la persistencia de estos parámetros en Firestore `clientes_control/[clientId]` a través de la función `handleSaveCrmConfig` (usando `setDoc` con `{ merge: true }`).
- **Desglose de Comisiones en Detalle:** Actualizado el panel lateral/drawer de telemetría y detalle de reporte (`selectedReport`) para mostrar de forma separada el desglose comisional: "Comisión Base Ecosistema" y "Costo Documentos DIAN" (calculado dinámicamente como `dianDocsCount * costoPorFacturaDian`), sumándolos a la comisión total cuando la facturación DIAN está activa para el cliente.
- **Actualización en Simulación de Telemetría:** Modificada la función `handleTriggerTelemetry` para generar un número aleatorio de documentos DIAN simulados (`dianDocsCount`) e inyectarlos en la telemetría enviada a Firestore.
- **Compilación de Integridad:** Ejecutada compilación limpia con `npm run build` en 580ms.

## [2026-06-03] Alineación Horizontal de Botones de Cabecera
- **Corrección de Disposición de Botones (Alignment):** Corregido el prematuro salto de línea y apilado vertical del botón "Alternar Entorno" en el panel de herramientas de la cabecera.
- **Ajuste de Clases Tailwind:** Se modificó el contenedor de los botones principales en `src/App.jsx` cambiando la clase `flex flex-wrap items-center gap-3` por `flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0`. Esto mantiene los tres botones alineados en una sola fila horizontal en pantallas medianas y grandes, previniendo el wrap involuntario y permitiendo fluidez responsiva en móviles.
- **Verificación de Compilación:** Compilación de producción limpia mediante `npm run build`.

## [2026-06-03] Reubicación de Modal de Fuentes en Onboarding Page
- **Corrección de Renderizado Temprano (Early Return):** Solucionado el bug en el que el botón "Seleccionar fuente" no abría el modal. El modal estaba renderizado por error al final del documento (dentro del dashboard), por lo que al retornar de manera temprana la pantalla de Onboarding (`if (isOnboardingActive) return ...`), el modal jamás se dibujaba en el DOM.
- **Reubicación de Componente:** Movido el código del modal `{isFontModalOpen && ...}` al interior del bloque de retorno de la pantalla de Onboarding.
- **Corrección en Árbol DOM:** Balanceadas las etiquetas `div` de cierre de la pantalla de Onboarding para solventar el fallo de compilación `Unexpected token`.
- **Compilación de Integridad:** Ejecutada compilación limpia con `npm run build` en 644ms.

## [2026-06-03] Forzado de color-scheme en Controles Nativos
- **Sincronización Temática del Motor Renderizador:** Se agregaron las propiedades `color-scheme: dark` en el selector `:root` y `color-scheme: light` en el selector `:root.light` en `src/index.css`.
- **Estilo de Dropdowns Nativos:** Esto fuerza al navegador a renderizar el menú desplegable expandido de las opciones (`option` dentro de `select`), barras de scroll nativas, datepickers e inputs de color en su modo oscuro y claro correspondientes, logrando que los dropdowns se acoplen al tema estético oscuro de la aplicación en un solo paso global sin requerir migraciones de elementos de React.
- **Compilación de Integridad:** Compilado a producción con éxito mediante `npm run build` en 967ms.

## [2026-06-03] Corrección de Error de Referencia clientReports en Portal CRM
- **Corrección de Runtime Exception:** Declarada la constante `clientReports` en la vista del Portal del Cliente del módulo CRM (`activeMetricModal === 'clientes'`) filtrando la lista de reportes por el `selectedCrmClientId` activo.
- **Solución a Fuga de Ámbito:** Resuelto el bug `ReferenceError: clientReports is not defined` que impedía renderizar la Ficha del Cliente y el listado de facturas asociadas a la marca consultada.
- **Compilación de Integridad:** Ejecutada compilación exitosa con `npm run build` en 745ms.

## [2026-06-03] Identificación de Clientes Sincronizados en Telemetría
- **Visualización Detallada de Clientes en Logs:** Modificado el listener en tiempo real de `reportesBilling` para extraer, agrupar y desduplicar los IDs de los clientes (`clientId`) cuyos reportes se han sincronizado con Firestore.
- **Detalle de Telemetría en Consola:** El mensaje de éxito impreso en la Consola de Telemetría ahora incluye la lista explícita de clientes sincronizados (ej. `Clientes: [ventas-smartfix, minimercado-central]`), facilitando el rastreo inmediato de datos y diagnóstico ágil ante telemetría errónea.
- **Compilación de Integridad:** Ejecutada compilación limpia con `npm run build` en 701ms.

## [2026-06-03] Uso de Token Activo Dinámico en Telemetría y Simulación de Reportes
- **Búsqueda Dinámica de Token Activo en Simulación General:** Modificada la función `handleCreateTestReport` para que consulte el token de telemetría activo desde el estado `telemetryTokens` correspondiente al cliente (`targetClient`). En caso de no existir o estar en modo Sandbox, aplica por defecto el `DEV_TOKEN`.
- **Búsqueda Dinámica de Token en CRM:** Modificada la función `handleTriggerTelemetry` para resolver y enviar el token activo correspondiente al cliente seleccionado (`selectedCrmClientId`) a Firestore al disparar la telemetría dirigida, eliminando el uso directo del valor fijo `DEV_TOKEN`.
- **Compilación de Integridad:** Compilado a producción de forma exitosa mediante `npm run build` en 662ms sin advertencias ni errores.

## [2026-06-03] Personalización de Branding, Fuentes Google Fonts y Estilizado Global de Listas Desplegables
- **Paletas de Colores de Marca Recomendadas:** Implementado un catálogo visual de 8 paletas de colores preestablecidas y coordinadas (Royal Indigo, Esmeralda Tech, Cyberpunk Neon, Sunset Glow, Crimson Rose, Amber Warm, Ocean Wave, Slate Clean) que se aplican con un solo clic.
- **Círculos de Selección de Color Rápido:** Integrados selectores rápidos para Primary, Secondary, Background y Text Color, permitiendo al usuario seleccionar colores armónicos al instante sin depender del modal nativo del navegador.
- **Modal Interactivo de Selección de Fuentes (Google Fonts):** Eliminada la lista desplegable clásica y reemplazada por un botón de acción "Seleccionar fuente". Abre un modal a pantalla completa con buscador y muestras tipográficas (*specimens*) renderizadas en tiempo real en cada una de las 17 tipografías admitidas.
- **Estilo Global Premium de Listas Desplegables (Selects):** Añadido en `index.css` una directiva global para todos los elementos `select` del dashboard para esconder la flecha nativa e inyectar un icono SVG estilizado personalizado, bordes redondeados `12px` (rounded-xl), fondos basados en variables del tema y transiciones de enfoque suaves.
- **Compilación de Producción:** Ejecutada verificación satisfactoria mediante `npm run build`.

## [2026-06-03] Onboarding Wizard a Pantalla Completa, Auto-detección Firebase, Reintentos y Captura de Requerimientos Custom
- **Sección Onboarding a Pantalla Completa:** Reemplazado el modal flotante de registro de clientes por un layout completo en dos columnas (`isOnboardingActive`).
  - *Columna Izquierda (Wizard de 3 Pestañas):*
    - **Servidor:** Selección de plantilla, entrada manual del Project ID, botón de auto-detección de credenciales y clave VAPID.
    - **Branding:** Inputs para elegir colores hexadecimales y Google Font.
    - **Módulos:** Configuración de feature flags y adición de un **Textarea de Requerimientos Especiales del Cliente (Briefing/Notas)** para capturar especificaciones de negocio a medida.
  - *Columna Derecha (Mockup Reactivo):* Simula en tiempo real una interfaz móvil aplicando los colores y fuentes.
- **Transmisión de Requerimientos Custom:** El campo `customRequirements` se inyecta en el payload enviado al backend (`POST /api/create-project`), se guarda persistentemente en la colección `clientes_control` del Firestore central, y se limpia al registrarse exitosamente.
- **Actualización del Scaffolder CLI (generator.js):** El motor ahora parsea `customRequirements` y lo renderiza de forma estructurada bajo la sección `### 📝 Requerimientos Especiales del Cliente` en el prompt final.
- **Directivas de Calidad Avanzadas:** Se agregó en el prompt final el paso obligatorio **6. Compilación de Integridad Obligatoria**, forzando al nuevo agente IA a ejecutar `npm run build` localmente y verificar la compilación al 100% libre de advertencias y fallos antes de terminar cualquier tarea.
- **Botón Auto-detectar Credenciales:** Llama de forma asíncrona a `GET /api/firebase-config` del daemon CLI local (`server.js`).
- **VAPID Key Manual y Checklist de Activación:** Añadidos controles para capturar la VAPID Key e inyectar un checklist de validación de base de datos.
- **Persistencia de Errores y Aprovisionamiento Offline:** Implementada resiliencia local guardando el payload en `LocalStorage` (`pendingCliProvisioning`).
- **Aprovisionamiento Asíncrono (Framer Overlay):** Inyección de un overlay con blur animado de carga completa (`isProvisioning`).
- **Prompt de Arranque de Antigravity:** Renderizado dinámico del prompt de bootstrap retornado.

## [2026-06-03] Optimización de Suscripción Firebase Central (Cero Warnings)
- **Alineación de Payload de Aprovisionamiento (Bug Fix):** Corregido el mapeo de campos enviados a la API del CLI (`/api/create-project`) para resolver la estructura plana requerida, evitando excepciones `400 Bad Request` en solicitudes de aprovisionamiento de nuevos entornos.
- **Listeners Condicionales en Auth:** Reestructurada la declaración de observadores `onSnapshot` de Firestore (`reportesBilling`, `clientes_control`, `tokens`) para que se ejecuten estrictamente tras la inicialización del usuario autenticado en `onAuthStateChanged`.
- **Despacho de Suscripciones (Cleanups):** Implementadas funciones limpiadoras para cada observador para evitar fugas de memoria al cerrar sesión.
- **Reglas de Seguridad Corregidas:** Desplegadas nuevas reglas a `prototipe-multi-instancia-control` para autorizar a desarrolladores autenticados (`request.auth != null`) a administrar tokens.
- **Compilación de Integridad:** Compilado a producción con `npm run build` en 426ms sin errores.

## [2026-06-03] Formulario de Briefing y Aprovisionamiento Centralizado de Clientes y Tokens
- **Formulario de Briefing Completo:** Sustituido el input básico por una sección que autogenera el Client ID slug, captura el nombre del cliente, comisionPorcentaje (por defecto 1.5%) y autogenera un Telemetry Token único basado en la marca de tiempo (`${clientId}-token-${Date.now()}`).
- **Integración Firestore Central:** Al guardar, escribe directamente los documentos `/clientes_control/{clientId}` y `/tokens/{token}` en Firestore central de `prototipe-multi-instancia-control` (con soporte en memoria local en modo Sandbox).
- **Checklist de Onboarding:** Añadido un modal que se muestra tras un registro exitoso con el token autogenerado, botón para copiar al portapapeles y los pasos de aprovisionamiento del entorno (`.env.local`, `.firebaserc`, `firebase-messaging-sw.js`).
- **Ficha CRM del Cliente:** El token de la ficha se obtiene de forma dinámica desde Firestore en lugar de mostrar variables fijas de desarrollo.
- **Compilación Exitosa:** Compilado a producción con `npm run build` sin advertencias ni errores.

## [2026-06-03] Mejoras de Interfaz de Usuario (UI/UX)
- **Eliminación de Bordes de Tarjetas:** Se removieron los bordes blancos y brillantes (`border border-slate-850`) de todas las tarjetas y paneles principales en `src/App.jsx` para lograr una estética limpia y premium.
- **Soporte de Tema Claro/Oscuro:**
  - Se definieron variables semánticas en `src/index.css` para fondos, textos y bordes bajo `:root` (tema oscuro por defecto) y `:root.light` (tema claro).
  - Se creó el componente reutilizable `src/components/ui/DarkModeToggle.jsx` para cambiar de tema.
  - Se integró el toggle de tema en la barra de navegación de `src/App.jsx`, con persistencia en `localStorage`.
- **Ajuste de Contrastes y Legibilidad (Modo Claro):**
  - Se eliminaron las clases de fondo oscuro y texto claro hardcodeadas (`bg-slate-950`, `text-slate-200`, `text-slate-300`, `text-slate-400`) en la barra de búsqueda, los filtros del listado, el gráfico de comisiones y el contenedor de telemetría de logs.
  - Se implementaron variables de CSS adaptativas y clases de colores de alto contraste de Tailwind (como `text-indigo-600 dark:text-indigo-400`, `bg-[var(--color-bg)]`, etc.) para garantizar una perfecta visualización y contraste en el modo claro.
  - Se adaptó la alerta de simulación de Sandbox local y el panel del inspector lateral (`Drawer Modal`) usando las variables semánticas de tema.
- **Rediseño de la Tarjeta de Reparto de Comisiones:**
  - Se sustituyó el gráfico de barra única y básica de los clientes por un listado de filas estructuradas de tipo tarjeta premium.
  - Cada cliente muestra ahora: sus iniciales estilizadas en un avatar circular con gradientes dinámicos, el conteo consolidado de reportes transmitidos, la sumatoria de ventas brutas del periodo, la comisión acumulada exacta y un chip inteligente de estatus de deuda (`[X] pendientes` en amarillo o `Al día` en verde).
  - Los datos se agrupan y calculan de forma síncrona en el frontend a partir del stream en tiempo real de Firestore.
- **Interactividad y Control Contextual en Tarjetas de Métricas:**
  - Se habilitó la interactividad (`onClick` con efectos hover/scale) en las 4 tarjetas de métricas superiores del Dashboard.
  - Se desarrolló el modal integrado `MetricsDetailModal` el cual renderiza dinámicamente según la tarjeta pulsada:
    - *Comisión Acumulada*: Desglose consolidado mes a mes.
    - *Cobrado Exitoso*: Historial de reportes cobrados con accesos para exportar PDFs individuales.
    - *Saldo por Recaudar*: Facturas pendientes con cobro rápido y generación/copiado automático de plantillas de recordatorio para WhatsApp.
    - *Clientes Registrados*: Directorio de clientes con estadísticas consolidadas, simulación de telemetría dirigida a un cliente específico y formulario de registro de nuevos identificadores.
- **Corrección de Reglas de Hooks de React:**
  - Se resolvió un error de violación de las reglas de Hooks (`Rendered more hooks than during the previous render`) provocado por declarar el hook `useState` de `newClientName` dentro de una IIFE condicional.
  - El hook fue extraído al nivel superior del componente principal `App` solucionando el error de ciclo de vida del renderizado de React.
- **Módulo CRM Integral de Clientes:**
  - Se extendió el directorio básico de clientes del Dashboard para crear un módulo CRM interactivo de dos niveles.
  - *Vista Analítica Global*: Proporciona métricas globales de ventas brutas consolidadas, comisiones recaudadas globales y saldo de comisiones pendientes.
  - *Vista Portal del Cliente (Ficha CRM)*: Permite ver estadísticas consolidadas del cliente, configurar su porcentaje Ecosistema comisional (almacenado en `clientRates`), ver su token, enviar un cobro consolidado por WhatsApp de todas sus deudas pendientes agrupadas y simular transmisiones de telemetría dirigidas.
  - Conectadas de forma síncrona todas las acciones con el listado principal de reportes del Dashboard.
- **Corrección de Contraste en Botones CRM y Clases de Tailwind:**
  - Se identificaron clases incorrectas hardcodeadas en Tailwind como `bg-indigo-655`, `bg-indigo-650`, `text-indigo-655`, `text-indigo-650`, `text-emerald-655`, `text-emerald-650` y `text-purple-655` que causaban bugs de renderizado (texto blanco sobre fondo blanco transparente/no existente en modo claro).
  - Se sustituyeron todas estas clases por sus homólogas estándar oficiales `600` de Tailwind (`bg-indigo-600`, `text-indigo-600`, etc.), solucionando por completo la legibilidad e invisibilidad del botón "Gestionar en CRM", botón "Registrar", tags de métricas y chips del directorio.
- **Sincronización en Tiempo Real de Tasas Comisionales con Firestore:**
  - Se removió el diccionario estático local `clientRates` y se introdujo el estado reactivo `clientesSaas`.
  - Se implementó un listener en tiempo real (`onSnapshot`) sobre la colección central `clientes_control` de Firestore para descargar los porcentajes de comisión guardados.
  - Se creó la función `getClientRate(clientId)` para resolver dinámicamente el porcentaje de cada cliente, con un fallback de `1.5%` para clientes no configurados o en modo Sandbox.
  - Se actualizó la acción `handleSaveRate` para realizar un guardado persistente en la nube mediante `setDoc(..., { merge: true })` en `clientes_control/[clientId]`, manteniendo soporte local temporal en el modo Sandbox.
  - Se re-enlazaron todos los flujos de cálculo del visor CRM y del inyector de telemetría de prueba para consumir esta configuración reactiva de la base de datos.
- **Conexión de Telemetría Dirigida de CRM con Firestore:**
  - Se modificó la función `handleTriggerTelemetry` para soportar tanto la inyección en memoria en modo Sandbox, como la escritura persistente en vivo mediante `setDoc` en `reportesBilling/[reportId]` de la base de datos central cuando se está operando con Firestore. Esto garantiza que pulsar "Simular Transmisión de Envío" desde el CRM de un cliente específico reporte la comisión de forma real a la nube central.
- **Rediseño Visual de la Consola de Telemetría:**
  - Se añadieron widgets analíticos de salud del sistema al inicio del panel de diagnóstico: un LED parpadeante para el estado del canal de base de datos (Firestore Online / Sandbox) y un LED indicador para el último estatus (Éxito / Alerta / Error).
  - Se transformaron los logs de texto plano en tarjetas de diagnóstico visuales con bordes y fondos HSL semánticos diferenciados según el tipo de log (Éxito, Alerta, Error, Info), incluyendo insignias y marcas de tiempo simplificadas.
- **Identificador de Cliente en Widget de Último Estatus:**
  - Se modificó la función `addLog` para capturar un parámetro opcional con el ID de cliente.
  - Se actualizaron las llamadas de inyección de telemetría de prueba (global y CRM individual) para inyectar este parámetro.
  - Se adaptó el widget de `Último Estatus` en la consola para mostrar de forma destacada el tag `[clientId]` (por ejemplo, `[ventas-smartfix] Éxito`) cada vez que se detecte actividad comisional, respondiendo a la necesidad de trazabilidad visual rápida.
- **Paginación de Logs y Corrección de Estiramiento de Grid:**
  - Se introdujo el estado `logPage` para delimitar y paginar los registros de la consola (mostrando 5 logs por página), con controles de avance y retroceso dinámicos en la barra inferior (ej. `◀ 1/3 ▶`).
  - Se añadió la alineación de elementos de rejilla `items-start` al contenedor de métricas y gráficos para prevenir que la tarjeta del gráfico de reparto comisional se estire artificialmente para igualar la altura de la Consola de Telemetría. Esto conserva la proporción estética natural de cada tarjeta de forma independiente.
- **Verificación exitosa:** Compilación e integración exitosas con `npm run build`.

## [2026-06-08] Armonización de Estilos y Ajuste de Bordes Sutiles en Facturación Comisional
- **Bordes Suaves y Sutiles (Bajo Contraste):** Reemplazadas todas las ocurrencias de clases de borde y divisores toscos de alto contraste (`border-slate-800` y `divide-slate-800`) por sus versiones con opacidad `border-slate-800/50` y `divide-slate-800/50` dentro de las tarjetas inferiores del módulo `FacturacionComisionalSandbox.jsx` (Modelo de Facturación, Resumen de Comisiones, Generador de Recibos y Firma de Conformidad).
- **Consistencia Visual:** Esto elimina los bordes blancos/grises toscos y alinea estéticamente todas las tarjetas del módulo de facturación con el diseño elegante y de bajo contraste de las tarjetas de métricas superiores.
- **Compilación de Integridad:** Se verificó la compilación de producción exitosa mediante `npm run build` en 634ms sin ningún tipo de error o advertencia.

## [2026-06-08] Rediseño de Botones de Filtro por Iconos y Etiquetas en Biblioteca
- **Estructura Vertical de Filtros (Icon + Label Segment Bars):** Reestructurados los botones de filtrado de recursos y de sandbox para albergar tanto un icono representativo de Lucide en la parte superior como una etiqueta de texto descriptiva debajo, mejorando la claridad cognitiva de los filtros sin perder elegancia.
  - *Filtro de Recurso:* Icono `Layers` + "Todos" | Icono `Code2` + "Componentes" | Icono `Package` + "Módulos".
  - *Filtro de Entorno:* Icono `List` + "Todos" | Icono `Eye` + "Sandbox" | Icono `FileText` + "Solo Docs".
- **Experiencia de Usuario Premium:** Se utilizó una disposición vertical flex (`flex-col items-center justify-center gap-1`), tamaños de icono de `13px` y textos compactos (`text-[8px] font-black uppercase tracking-wider`). Se mantuvieron las micro-interacciones interactivas de escala (`active:scale-95`), escala del botón seleccionado (`scale-[1.02]`) y tooltips descriptivos (`title`).
- **Solución Visual de Estados (Hover Bug Fix):** Se solventó el comportamiento indeseado por el cual los botones seleccionados cambiaban temporalmente a un color de fondo azul marino/oscuro al pasar el cursor sobre ellos. Esto se logró condicionando la clase `hover:bg-indigo-500/10` para que se aplique exclusivamente cuando el botón correspondiente esté inactivo, manteniendo los colores sólidos e intensos de selección activos de forma permanente durante el foco del ratón.
- **Compilación de Integridad:** Se verificó la compilación de producción exitosa mediante `npm run build` en 1.21s.

## [2026-06-08] Enriquecimiento Interactivo del Mockup de Smartphone de Onboarding
- **Mockup Interactivo de Smartphone:** Reemplazada la vista estática del teléfono de la derecha de la sección Onboarding Wizard por una aplicación mockup 100% funcional basada en estados reactivos locales.
  - *Navegación por Pestañas:* Habilitadas pestañas operativas en la parte inferior del teléfono.
    - **Inicio:** Muestra el Balance acumulado en tiempo real de las ventas registradas y las 3 ventas más recientes.
    - **Ventas:** Muestra un listado detallado de todas las ventas con botones individuales para remover ventas en caliente y un widget de gráficos interactivo (barras dinámicas representacionales).
    - **Ajustes:** Añadido un interruptor de tema del mockup (Claro/Oscuro) y tres toggles de configuración (PWA, Notificaciones Push y Facturación).
- **Integración Bidireccional de Formulario:** Los interruptores de ajustes del mockup están enlazados bidireccionalmente al estado del formulario Onboarding Wizard maestro (ej. encender PWA en el teléfono activa la casilla en el formulario y viceversa), proveyendo una respuesta inmersiva de configuración visual.
- **Formulario de Registro de Ventas:** Añadida una mini-interfaz modal para agregar transiciones de venta reales dentro del smartphone (captura de Título del Producto y Precio), actualizando las sumas monetarias, listas e histogramas reactivos al instante.
- **Compilación de Integridad:** El proyecto se compiló correctamente mediante `npm run build` en 990ms.

## [2026-06-08] Catálogo Ampliado de Fuentes y Filtrado por Categorías en Onboarding
- **Catálogo de 62 Google Fonts:** Expandida la lista de tipografías a un catálogo curado de 62 fuentes, organizadas semánticamente en las categorías: Sans-Serif, Serif, Display, Monospace y Script. Se añadió *Inconsolata* como alternativa premium al clásico *Consolas*.
- **Pre-carga Dinámica del DOM:** Refactorizado el preloader de fuentes en `App.jsx` para generar de manera dinámica la URL del archivo de estilos combinados de Google Fonts a partir de las familias registradas en la constante `AVAILABLE_FONTS`.
- **Filtros por Categoría (Tabs):** Diseñada e integrada una barra de pestañas deslizante en la parte superior del listado del modal para filtrar rápidamente las tipografías.
- **Insignias de Categoría (Badges):** Incorporados badges dinámicos en cada tarjeta de tipografía para identificar visualmente su estilo correspondiente.
- **Compilación de Integridad:** Se validó la compilación de producción exitosa al 100% mediante `npm run build` en 631ms.





