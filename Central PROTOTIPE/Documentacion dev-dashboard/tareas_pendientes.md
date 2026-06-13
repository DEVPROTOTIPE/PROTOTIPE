# Tareas Pendientes - dev-dashboard

Roadmap y control de tareas del proyecto dev-dashboard.

## Siguiente Hito: Mejoras de Interfaz de Usuario (UI/UX)
- [x] **~~Tarea 247: Reajustes de CRM de Clientes (Responsividad Móvil y Remoción de Base de Datos)~~**
  - [x] Adaptar los botones globales del CRM a una grilla responsiva de 2 columnas en mobile.
  - [x] Reestructurar las opciones de acción de tarjetas de clientes con flex-wrap y min-w para evitar truncados.
  - [x] Remover modal, estados y manejadores de base de datos de App.jsx.
- [x] **~~Tarea 246: Personalización Avanzada de Colores y Tokens HSL (Estilo Studio completo)~~**
  - [x] Agregar variables avanzadas de tema (`surfaceColor`, `surface2Color`, `borderColor`, `textMutedColor`, `radiusBase`) en el flujo de Onboarding del Dashboard y pasarlas en los payloads hacia el CLI.
  - [x] Implementar panel colapsable interactivo `"Personalización de Colores Avanzada (Tokens HSL)"` con pickers cromáticos, inputs hexadecimales y selector de Radius.
  - [x] Incorporar lógica inteligente para autodetectar luminancia de fondos y asignar valores óptimos a los tokens de forma automática al seleccionar presets.
- [x] **~~Tarea 245: Fijación de la Vista Previa del Mockup de Smartphone al hacer Scroll~~**
  - [x] Refactorizar la estructura de rejilla CSS Grid en el Wizard de Onboarding de `items-start` a la alineación por defecto `stretch`.
  - [x] Agregar la clase `self-start` al panel izquierdo del Wizard para mantener su altura nativa basada en el contenido.
  - [x] Envolver el panel de la vista previa del mockup (col-span-5 de la derecha) en un contenedor estructural que permite el estiramiento de columna y aplicar `sticky top-24` directamente sobre la tarjeta del mockup para fijarla en pantalla al hacer scroll.
- [x] **~~Tarea 244: Vista Previa Interactiva de Productos/Servicios en Mockup de Smartphone~~**
  - [x] Diseñar e implementar un nuevo apartado de "Catálogo" (representado con el icono 📦) en el simulador interactivo de smartphone dentro del Wizard de Onboarding.
  - [x] Adaptar dinámicamente el botón y el título de la sección según el nicho de negocio seleccionado (titulándose "Servicios" o "Catálogo").
  - [x] Integrar base de datos realista `MOCK_CATALOG` con 3 ítems con nombre, emoji y costo para cada uno de los 10 nichos de mercado.
  - [x] Habilitar la interactividad para que al pulsar "+ Registrar", el valor financiero del ítem impacte el balance acumulado y se añada a la lista de órdenes del mockup en tiempo real.
- [x] **~~Tarea 243: Paletas de Colores de Marca por Categorías de Nicho (100 Paletas Premium)~~**
  - [x] Implementar base de datos de 100 paletas cromáticas premium distribuidas en 10 categorías de nicho específicas en la pestaña Branding del Onboarding.
  - [x] Sustituir la grilla estática de 8 paletas por un control interactivo de acordeones colapsables para las categorías de nicho con colapso mutuo automático.
- [x] **~~Tarea 242: Integración del Branding Studio HSL y Validador WCAG 2.1 en Onboarding Wizard~~**
  - [x] Desarrollar helpers matemáticos para calcular la luminancia relativa y el contraste relativo en tiempo real basado en el estándar WCAG 2.1.
  - [x] Diseñar un widget visual interactivo dentro de la pestaña de "Branding" del Wizard para validar el contraste del Botón Primario contra fondo blanco e interfaz general (Fondo vs Texto) con badges de cumplimiento (`AAA`, `AA`, `Fail`).
- [x] **~~Tarea 241: Control de Servidores de Desarrollo en CRM (npm run dev)~~**
  - [x] Integrar control de estado y botones contextuales individuales por cliente en el listado del CRM para Desplegar en Local, Detener e Ir a Local (redirección a puerto dinámico asignado por el CLI bridge).
- [x] **~~Tarea 240: Selector de Clientes para Solicitud de Telemetría Global~~**
  - [x] Refactorizar el botón global de obtención de telemetría en la cabecera del CRM para abrir un modal interactivo con checklist multicliente pre-seleccionada por defecto.
- [x] **~~Tarea 239: Selector de Clientes en Sincronización Global y Despliegue en Lote~~**
  - [x] Diseñar modales de configuración `isGlobalSyncConfigModalOpen` y `isGlobalDeployConfigModalOpen` con checklist multicliente antes de arrancar.
  - [x] Implementar cola reactiva de despliegues secuenciales asíncronos con tiempo de espera de 3 segundos e indicador de estado de cola en terminal.
- [x] **~~Tarea 238: Sincronización en Lote de Drift y Consola de Despliegue de Hosting en CRM~~**
  - [x] Desarrollar modal interactivo de sincronización inteligente por lotes (`BulkSyncModal`) agrupando y pre-marcando archivos core seguros por encima de branding sensible.
  - [x] Diseñar la terminal interactiva UNIX oscura (`DeployTerminalModal`) para ver logs en vivo mediante Server-Sent Events (SSE) con botón para forzar bypass de auditoría de calidad.
- [x] **~~Tarea 237: Simulador de Fallos Multicliente Dirigido y Personalizado~~**
  - [x] Implementar modal interactivo `SimulationFailureModal` reemplazando los errores aleatorios por un panel con selección de cliente, plantillas de error, severidad (FAIL/WARN/INFO) y origen (Manual/Automático).
- [x] **~~Tarea 236: Corrección Visual y de Idioma en Consola de Telemetría~~**
  - [x] Cambiar la clase incorrecta `border-slate-850` por `border-slate-800` en el input del buscador de logs.
  - [x] Traducir la señal técnica a `~/telemetria $ escuchando_eventos_en_vivo...`.
- [x] **~~Tarea 235: Fijación de Encabezado y Menú en Scroll (Layout Confinado)~~**
  - [x] Modificar clases del contenedor raíz a `h-screen overflow-hidden` y redirigir el scroll bar únicamente a la sección de contenidos `<main className="overflow-y-auto">`, manteniendo el encabezado y el sidebar fijos.
- [x] **~~Tarea 234: Centrado y Distribución Equitativa de Botones en Navegación Móvil~~**
  - [x] Cambiar el contenedor de flexbox a CSS Grid con 5 columnas de igual tamaño (`grid-cols-5`) en la barra de navegación móvil de `src/App.jsx`.
  - [x] Eliminar anchos mínimos (`min-w`) y márgenes asimétricos individuales en los botones de navegación, homogeneizándolos a `w-full` y `py-2` para garantizar un reparto perfectamente centrado del botón "NUEVO" y una distancia equivalente en los costados.
  - [x] Compilar y verificar el empaquetado del bundle de producción sin errores.
- [x] **~~Tarea 179: Historial de Aprovisionamientos con Archivador y Paginación Fluida en Onboarding~~**
  - [x] Crear el componente modular `Pagination.jsx` en `src/components/ui/` basado en la biblioteca.
  - [x] Añadir una tabla de historial y botón para archivar provisionamientos (sincronizando con Firestore central).
  - [x] Integrar la paginación de 10 elementos por página con visibilidad permanente (`showAlways=true`).
- [x] **~~Tarea 178: Rediseño de Navegación Móvil a 5 Botones y Reubicación de CRM y Ajustes~~**
  - [x] Reducir `NAV_TABS` en `src/App.jsx` a exactamente 5 botones en el orden solicitado (Inicio, Cobros, Biblioteca, Nuevo, Monitoreo).
  - [x] Reconfigurar el clic de la tarjeta "Clientes Activos" en el Dashboard principal para navegar a la pestaña del CRM (`activeTab = 'crm'`).
  - [x] Agregar un botón de "Ajustes del Sistema" en el Modal de Perfil de usuario para abrir el panel de Ajustes.
  - [x] Rediseñar el botón central "Nuevo" con altura de -mt-3.5, gradiente HSL de Prototipe, flotado continuo elástico, y animación de rotación y escala 1.15x al hacer hover.
- [x] **~~Tarea 223: Renombrado de Colección de Control Central a clientes_control (Sin "SaaS")~~**
  - [x] Reemplazar todas las referencias en el código a `clientes_control` con `clientes_control`.
  - [x] Actualizar las reglas de seguridad de Firestore (`firestore.rules`) y desplegarlas exitosamente en el proyecto central.
- [x] **~~Tarea 160: Mejoras en Tarjetas y Soporte de Modo Claro/Oscuro~~**
  - [x] Eliminar bordes blancos/brillantes de todas las tarjetas del dashboard.
  - [x] Implementar soporte completo de Modo Claro y Modo Oscuro en `index.css` y `App.jsx`.
  - [x] Añadir botón selector de tema en la barra de navegación.
  - [x] Guardar preferencia de tema en `localStorage`.

- [x] **~~Tarea 161: Rediseño de Tarjeta de Reparto de Comisiones por Cliente~~**
  - [x] Agrupar datos consolidando ventas, reportes y deudas de cada cliente de forma dinámica.
  - [x] Reemplazar barra gráfica básica por tarjetas estructuradas premium con avatars, progresos y chips de estado.
  - [x] Validar consistencia y contrastes en temas claro y oscuro.

- [x] **~~Tarea 162: Tarjetas de Métricas Interactivas y Funciones Contextuales~~**
  - [x] Agregar eventos de clic y efectos interactivos a las 4 tarjetas de métricas.
  - [x] Desarrollar modal dinámico de desgloses de métricas.
  - [x] Conectar flujos de exportación de PDFs, recordatorios de cobro y directorio/simulación de clientes.

- [x] **~~Tarea 163: Integración del Módulo CRM de Clientes en el Dashboard~~**
  - [x] Implementar Vista General Analítica del CRM con métricas globales consolidadas.
  - [x] Diseñar el Portal del Cliente con ficha técnica, ajustes Ecosistema de comisiones y token de telemetría.
  - [x] Integrar recordatorio de cobros consolidado por WhatsApp e historial de reportes.

- [x] **~~Tarea 164: Corrección de Contraste y Clases de Tailwind en Botones CRM~~**
  - [x] Corregir la clase errónea `bg-indigo-655` por `bg-indigo-600` en el botón "Gestionar en CRM" para evitar textos blancos sobre fondos blancos en modo claro.
  - [x] Reemplazar todas las clases de color hardcodeadas erróneas (`650`/`655`) de Tailwind en botones, textos y cards por clases estándar `600` adaptativas.
  - [x] Validar que la compilación de producción compile sin errores.

- [x] **~~Tarea 165: Sincronización en Tiempo Real de Tasas Comisionales con Firestore~~**
  - [x] Eliminar el diccionario estático `clientRates` en memoria local de `App.jsx`.
  - [x] Implementar el estado `clientesSaas` y un listener en tiempo real (`onSnapshot`) sobre la colección `clientes_control`.
  - [x] Crear una función de resolución de tasas dinámicas `getClientRate(clientId)` con fallback predeterminado.
  - [x] Actualizar `handleSaveRate` para persistir cambios en la nube (`setDoc`) e integrar fallback en memoria para Sandbox.
  - [x] Actualizar referencias de tasas en interfaces y telemetría de prueba.

- [x] **~~Tarea 166: Conexión de Telemetría Dirigida del CRM con Firestore Central~~**
  - [x] Modificar `handleTriggerTelemetry` para soportar escrituras asíncronas en Firestore (`setDoc`) sobre `reportesBilling` cuando se opera en entorno real.
  - [x] Mantener soporte de inserción local para simulaciones en Sandbox.
  - [x] Validar que compile sin errores.

- [x] **~~Tarea 167: Rediseño Visual y Widget de Estatus para la Consola de Telemetría~~**
  - [x] Diseñar un sistema de salud (Health widgets) a nivel visual mediante LEDs y badges para la Base de Datos y el último estatus.
  - [x] Convertir los logs de texto plano en tarjetas visuales de diagnóstico con bordes, colores semánticos (Verde, Amarillo, Rojo, Gris) y etiquetas de estado (ÉXITO, ALERTA, ERROR, INFO).
  - [x] Validar que compile sin errores.

- [x] **~~Tarea 168: Identificador de Cliente en Widget de Último Estatus~~**
  - [x] Agregar parámetro de cliente a la función `addLog` para almacenar metadatos del cliente emisor.
  - [x] Modificar disparadores de telemetría de prueba para inyectar el `clientId` en la firma de `addLog`.
  - [x] Renderizar dinámicamente el tag `[clientId]` en el widget de `Último Estatus` de la consola diagnóstica.
  - [x] Validar que compile sin errores.

- [x] **~~Tarea 170: Formulario de Briefing y Aprovisionamiento Centralizado de Clientes/Tokens~~**
  - [x] Implementar Formulario de Briefing y Registro completo (Nombre, slug autogenerado de Client ID, tasa de comisión con default 1.5% y Telemetry Token autogenerado único).
  - [x] Conectar con Firestore central para escribir atómicamente en `clientes_control` y `tokens` al guardar.
  - [x] Mostrar modal/tarjeta de Onboarding con el token generado, botón para copiar y checklist de aprovisionamiento manual.
  - [x] Resolver y mostrar dinámicamente el token de telemetría desde Firestore en la Ficha CRM del cliente.
  - [x] Validar que compile sin errores.

- [x] **~~Tarea 171: Rediseño de Sección de Onboarding Wizard, Auto-detección y Sistema de Reintentos~~**
  - [x] Reemplazar modal de registro por página a pantalla completa de Onboarding Wizard con layout en 2 columnas.
  - [x] Diseñar panel izquierdo con 3 pestañas: Servidor (Firebase auto-detectar y plantillas), Branding (colores hexadecimales y tipografía) y Módulos (feature flags).
  - [x] Diseñar panel derecho con mockup interactivo de smartphone que previsualiza los cambios de branding y fuentes en tiempo real.
  - [x] Integrar botón de auto-detección de credenciales de Firebase llamando al endpoint `GET /api/firebase-config` del CLI local.
  - [x] Inyectar campo VAPID Key manual y checkboxes para confirmación manual de activaciones en Firebase Console.
  - [x] Desarrollar persistencia offline mediante `pendingCliProvisioning` en `LocalStorage` con banner persistente para reintento manual.
  - [x] Validar que compile de forma exitosa sin errores.

- [x] **~~Tarea 172: Personalización de Branding, Fuentes Google Fonts y Estilizado Global de Listas Desplegables~~**
  - [x] Crear paletas de colores preestablecidas coordinadas (Royal Indigo, Esmeralda Tech, Cyberpunk, Sunset Glow, Crimson Rose, Amber Warm, Ocean Wave, Slate Clean) para facilitar la selección.
  - [x] Añadir círculos de selección de color rápidos para Primary, Secondary, Background y Text Color que evitan la dependencia única del selector del navegador.
  - [x] Eliminar el selector de fuentes tipo dropdown y diseñar una interfaz interactiva de Selección de Fuentes.
  - [x] Crear un Modal de Fuentes (`isFontModalOpen`) con buscador reactivo integrado y previsualización de espécimenes en vivo de cada una de las 17 tipografías de Google Fonts cargadas dinámicamente en el DOM.
  - [x] Estilizar de forma global todas las listas desplegables (`select`) del dashboard en un solo paso en `index.css` con flecha customizada (SVG), colores de fondo que respetan el tema de la aplicación, bordes redondeados y efectos focus.
  - [x] Ejecutar la compilación de control (`npm run build`) de forma exitosa sin errores.

- [x] **~~Tarea 173: Uso dinámico del token de telemetría en simulaciones de reporte y telemetría CRM~~**
  - [x] Modificar la función `handleCreateTestReport` para resolver el token activo desde la colección `telemetryTokens` según el cliente seleccionado (`targetClient`), usando `DEV_TOKEN` como fallback.
  - [x] Modificar la función `handleTriggerTelemetry` en el módulo CRM para resolver el token activo desde `telemetryTokens` según el cliente seleccionado (`selectedCrmClientId`), usando `DEV_TOKEN` como fallback.
  - [x] Ejecutar la compilación de control (`npm run build`) de forma exitosa.

- [x] **~~Tarea 174: Identificador de clientes en logs de sincronización de reportes~~**
  - [x] Modificar el callback `onSnapshot` de `reportesBilling` en `App.jsx` para extraer y desduplicar los IDs de los clientes con datos activos en el consolidado.
  - [x] Imprimir la lista de IDs de clientes sincronizados `Clientes: [id1, id2, ...]` en el mensaje de éxito de la Consola de Telemetría para facilitar el diagnóstico de errores.
  - [x] Ejecutar la compilación de control (`npm run build`) de forma exitosa.

- [x] **~~Tarea 175: Corrección de error de referencia clientReports en Portal CRM~~**
  - [x] Declarar la constante `clientReports` filtrando los reportes globales por el cliente seleccionado (`selectedCrmClientId`) dentro de la vista de Ficha del Cliente en el CRM.
  - [x] Solventar el fallo de renderizado runtime `ReferenceError: clientReports is not defined` al abrir el CRM de cualquier cliente.
  - [x] Validar que compile sin advertencias ni errores.

- [x] **~~Tarea 176: Forzar color-scheme en controles nativos del navegador~~**
  - [x] Añadir directivas `color-scheme: dark` y `color-scheme: light` en `:root` e `:root.light` en `index.css`.
  - [x] Corregir la apariencia de los menús desplegables expandidos y controles de formulario del navegador para que se muestren oscuros/claros de forma nativa e integrada en un solo paso global.
  - [x] Ejecutar compilación de integridad `npm run build` con éxito.

- [x] **~~Tarea 177: Reubicación del modal de fuentes y solución a falta de respuesta del botón~~**
  - [x] Identificar la fuga de ámbito del modal de selección de fuentes (renderizado por error en el bloque del dashboard inactivo durante el Onboarding).
  - [x] Reubicar el modal `{isFontModalOpen && ...}` dentro del bloque de retorno temprano (`if (isOnboardingActive)`) del Onboarding Wizard.
  - [x] Corregir el balanceo de etiquetas `div` para evitar errores de sintaxis del renderizador de React.
  - [x] Ejecutar compilación de integridad `npm run build` con éxito.

- [x] **~~Tarea 178: Integración de Facturación Electrónica DIAN y Desglose de Comisiones en CRM~~**
  - [x] Agregar switches/inputs para `enableDianBilling` y `costoPorFacturaDian` en el panel de Ajustes Ecosistema dentro de la Ficha CRM del cliente.
  - [x] Integrar guardado y actualización en caliente con `handleSaveCrmConfig` (persiste en Firestore `clientes_control`).
  - [x] Diseñar desglose visual en el Reporte Lateral/Ficha de Telemetría separando Comisión Base Ecosistema y Documentos DIAN de la Comisión Total.
  - [x] Actualizar el simulador de telemetría `handleTriggerTelemetry` para generar conteos de documentos mock y calcular el cargo correspondiente.
  - [x] Ejecutar compilación de integridad `npm run build` con éxito.

- [x] **~~Tarea 179: Alinear Botones de Cabecera en Horizontal~~**
  - [x] Cambiar la disposición del contenedor de botones principales en `src/App.jsx` para evitar que el tercer botón salte a la siguiente fila.
  - [x] Ajustar responsive design con `flex-wrap sm:flex-nowrap` y `shrink-0`.
  - [x] Validar compilación satisfactoria con `npm run build`.

- [x] **~~Tarea 180: Soportar Filtros de Estado en Historial de Reportes CRM~~**
  - [x] Crear el estado reactivo `crmStatusFilter` para controlar el filtrado en la Ficha CRM del cliente.
  - [x] Declarar la variable `filteredClientReports` aplicando el filtro sobre el historial específico del cliente.
  - [x] Diseñar e integrar la barra de botones de filtrado rápido (Todos, Pendientes, Pagados) en la cabecera del historial de reportes.
  - [x] Validar que compile sin fallos mediante `npm run build`.

- [x] **~~Tarea 181: Normalizar estadoPago con Valor por Defecto 'pendiente' en Filtros~~**
  - [x] Identificar la ausencia del campo `estadoPago` en registros existentes de Firestore central.
  - [x] Implementar fallback `(r.estadoPago || 'pendiente')` y estandarizar a minúsculas `.toLowerCase()` para evitar exclusiones en el motor de filtrado del listado general y del CRM.
  - [x] Normalizar cálculos agregados de comisiones pendientes y totales globales para usar este fallback.
  - [x] Validar compilación exitosa con `npm run build`.

- [x] **~~Tarea 182: Borrado Físico de Documentos al Descartar Aprovisionamiento Pendiente~~**
  - [x] Implementar la función `handleDiscardPendingProvisioning` para ejecutar la eliminación física de documentos en Firestore central.
  - [x] Utilizar `writeBatch` de Firebase para eliminar los documentos `clientes_control/{clientId}` y `tokens/{telemetryToken}` de forma atómica.
  - [x] Limpiar el estado reactivo local `pendingCliProvisioning` y notificar mediante un toast de éxito.
  - [x] Validar que compile sin fallos mediante `npm run build`.

- [x] **~~Tarea 183: Corrección de Desbordamiento Horizontal en Manual Provisioning Cards~~**
  - [x] Agregar la propiedad `min-w-0` a las tarjetas y contenedores flex en el asistente de aprovisionamiento manual para permitir el encogimiento correcto.
  - [x] Agregar `overflow-x-auto` y `whitespace-pre-wrap break-all` a los elementos `<pre>` de código para forzar barras de scroll horizontales locales o saltos de línea automáticos.
  - [x] Asegurar la correcta truncación (`truncate`) de la llave VAPID sin empujar el ancho de la tarjeta.
  - [x] Validar que el build de Vite se genere exitosamente.

- [x] **~~Tarea 184: Opción 'Crear desde cero' (template-core-seed) en Selector de Plantillas~~**
  - [x] Agregar la opción 'Crear desde cero' con el ID del sistema `template-core-seed` al selector de plantillas del asistente de onboarding.
  - [x] Sincronizar el payload `cliPayload` y la persistencia en Firestore para registrar la plantilla seleccionada.
  - [x] Ajustar el cargador de plantillas asíncrono para asegurar la inyección de la opción como predeterminada y evitar fallos por respuestas vacías de la API.
  - [x] Validar que compile sin fallos mediante `npm run build`.

- [x] **~~Tarea 185: Reemplazar select nativos por componente reactivo CustomSelect~~**
  - [x] Diseñar el componente reactivo `CustomSelect` con soporte de click-outside, estilos oscuros HSL, chevron con animación interactiva y buscador/opciones estilizadas.
  - [x] Reemplazar el select de Modelo de Facturación en el formulario de creación de clientes.
  - [x] Reemplazar el select de Plantilla Base en el panel de aprovisionamiento del asistente.
  - [x] Reemplazar el select de Modelo de Facturación en la sección de Ajustes Ecosistema dentro de la Ficha CRM del cliente.
  - [x] Confirmar compilación correcta con `npm run build`.

- [x] **~~Tarea 186: Importación de StickyNote en App.jsx~~**
  - [x] Importar el icono `StickyNote` de `lucide-react` en `src/App.jsx`.
  - [x] Solventar el error de referencia en tiempo de ejecución `Uncaught ReferenceError: StickyNote is not defined` en el bottom navigation móvil.
  - [x] Validar que el build se genere exitosamente con `npm run build`.

- [x] **~~Tarea 187: Adaptabilidad de Botones y Colores en Modo Claro y Oscuro~~**
  - [x] Reemplazar colores no estándar de Tailwind (terminaciones 550, 650, 450, etc.) por clases estándar compatibles.
  - [x] Cambiar fondos oscuros fijos de botones ("Enviar Telemetría Prueba" y "Generar Reporte de Prueba") por variables de tema adaptativas `bg-[var(--color-surface-2)]` y colores de borde/texto integrados para asegurar legibilidad en modo claro y oscuro.
  - [x] Actualizar la cabecera móvil a texto adaptativo con `text-[var(--color-text)]` para evitar degradados de bajo contraste.
  - [x] Validar que el build se genere de manera satisfactoria con `npm run build`.

- [x] **~~Tarea 188: Limpieza Cromática, Simulación Avanzada y Widget de Notas Flotante~~**
  - [x] Higienización del término "Ecosistema" (sustituido por "Ecosistema", "Aplicaciones a la Medida" e "Instancias de Clientes" a nivel visual y de logs).
  - [x] Refactorizar la función `handleCreateTestReport` para aceptar `clientId` opcional, integrando la lógica masiva concurrente con `Promise.all` y el soporte de cobros DIAN/modos de cobro avanzados.
  - [x] Añadir botones de simulación individual en la lista del CRM y en la ficha del cliente, llamando a la unificada `handleCreateTestReport` y eliminando `handleTriggerTelemetry`.
  - [x] Declarar los estados reactivos ausentes (`notes`, `noteTitle`, `noteContent`, `noteType`, `noteSearch`, `editingNoteId`, `isNotesOpen`).
  - [x] Diseñar un botón flotante de notas en el Home con neón hover, badge con la longitud de notas, y un Drawer lateral interactivo con buscador fuzzy, filtros y CRUD en caliente.
  - [x] Persistir las notas localmente en `localStorage` con la clave `dev_notes` y mantener sincronización mediante listener Firebase Firestore en `/developer_notes`.
  - [x] Confirmar compilación correcta con `npm run build`.

- [x] **~~Tarea 189: Optimización de Rendimiento para Alta Tasa de Refresco (144Hz) y Dispositivos Móviles~~**
  - [x] Memoizar el procesamiento de datos históricos `trendData` y `salesTrendData` a nivel de componente principal con `useMemo` para evitar recalculaciones costosas en renderizados de log/telemetría en tiempo real.
  - [x] Agregar soporte de aceleración por hardware por GPU (`willChange: "transform, opacity"`) en las transiciones de pestañas de Framer Motion.
  - [x] Desactivar las animaciones de trazado en gráficos de Recharts (`isAnimationActive={false}` en componentes `Bar`, `Line`, y `Area`) para mitigar el consumo de CPU y asegurar transiciones suaves y estables a 144 FPS.
  - [x] Validar compilación exitosa mediante compilación de producción con Vite.

- [x] **~~Tarea 190: Corregir Visibilidad de Botones y Elementos en Modo Claro~~**
  - [x] Identificar clases de color no estándar de Tailwind en los modales y componentes (`indigo-650`).
  - [x] Reemplazar `indigo-650` por `indigo-600` en los botones y fondos para prevenir que se rendericen transparentes/blancos con texto blanco en Modo Claro.
  - [x] Realizar compilación de producción (`npm run build`) para verificar la consistencia.

- [x] **~~Tarea 191: Auditoría Técnica - Fugas de Memoria, Errores de CLI y Contraste de Inputs~~**
  - [x] Corregir la fuga de conexiones (memory leak) de Firestore moviendo la des-suscripción de listeners (`onSnapshot`) al ámbito superior de `useEffect` con limpieza automatizada.
  - [x] Mejorar la robustez en la API del CLI Bridge local implementando parseo de respuestas de error tipo JSON y formateo amigable.
  - [x] Diseñar estilos globales CSS en `index.css` para optimizar el contraste de fondos y bordes de inputs en Modo Claro.
  - [x] Validar la compilación de producción con Vite.

- [x] **~~Tarea 192: Personalización de Identidad Visual PROTOTIPE y Animaciones Tecnológicas~~**
  - [x] Reconfigurar la paleta de colores HSL en `index.css` a Violeta Eléctrico (`#7c3aed`) y Cian Tecnológico (`#06b6d4`).
  - [x] Purgar por completo el término "Ecosistema" de los títulos, textos de UI y logs de telemetría, reemplazándolo por la marca **PROTOTIPE** y "Motor de Aplicaciones a la Medida".
  - [x] Reemplazar el favicon emoji de `index.html` por un logotipo SVG animado y estilizado de la marca PROTOTIPE.
  - [x] Diseñar e integrar animaciones avanzadas: *Gradient Shift*, *Radar Pulse* para el daemon y *Interactive Hover Glow* en tarjetas.
  - [x] Refinar la consola de telemetría para simular una terminal de comandos real con marco de ventana y botones de control.
  - [x] Compilar el proyecto en local exitosamente con `npm run build`.

- [x] **~~Tarea 193: Filtros de Visualización Sandbox y Icono Ojo en Tarjetas (Visor Biblioteca)~~**
  - [x] Implementar dos botones de filtro avanzados ("Sandbox" y "Solo Docs") debajo de la barra de búsqueda, junto al botón de "Todos".
  - [x] Conservar la barra de búsqueda como filtro general y global sobre los componentes.
  - [x] Añadir un icono de Ojo (`Eye`) inline al lado del nombre de cada tarjeta/componente que soporte simulación interactiva.
  - [x] Validar que la compilación de producción compile con 100% de éxito en dev-dashboard.

- [x] **~~Tarea 194: Registro y Playgrounds del Trío Final de Componentes Premium~~**
  - [x] Mapear las llaves de visualización en `COMPONENT_SANDBOX_MAP` para `CommandPaletteKBar`, `InteractiveCouponBadge` e `InteractiveTutorialTour`.
  - [x] Corregir la sintaxis rota de JSX en `SandboxOTPInputField` (cierre de contenedor, retornos y llaves de función).
  - [x] Integrar `useAlertConfirm` (`showAlert`) en los playgrounds para reemplazar los `alert(...)` nativos del navegador por diálogos premium HSL adaptativos.
  - [x] Garantizar que `npm run build` compile con éxito sin errores.

- [x] **~~Tarea 195: Creación e Integración de useDebounceValue y StockHeatmap~~**
  - [x] Crear y catalogar las especificaciones técnicas markdown de `use_debounce_value.md` y `stock_heatmap.md` en la biblioteca reutilizable.
  - [x] Registrar la entrada y el Criterio de Decisión IA para ambos componentes en `README.md` de la biblioteca y en `mapa_documentacion_ia.md`.
  - [x] Implementar e integrar el código de lógica embebida de `useDebounceValue` y `SandboxStockHeatmap` en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx).
  - [x] Diseñar e integrar los playgrounds interactivos para `'use_debounce_value'` y `'stock_heatmap'` con controles y inputs de simulación.
  - [x] Mapear los disparadores semánticos en `COMPONENT_SANDBOX_MAP` en `ComponentSandbox.jsx`.
  - [x] Garantizar compilación exitosa libre de errores.

- [x] **~~Tarea 196: Corrección de Borde de Enfoque en Buscador de Biblioteca~~**
  - [x] Eliminar el cuadro rectangular del foco del navegador en el input del buscador de [`ComponentLibraryView.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx).
  - [x] Garantizar compilación exitosa libre de errores.

- [x] **~~Tarea 197: Extracción y Sandbox de Facturación Comisional y Telemetría Centralizada~~**
  - [x] Crear y catalogar las especificaciones técnicas markdown de `facturacion_comisional.md` y `telemetria_centralizada.md` en la biblioteca reutilizable.
  - [x] Registrar la entrada y el Criterio de Decisión IA para ambos componentes en `README.md` de la biblioteca y en `mapa_documentacion_ia.md`.
  - [x] Implementar e integrar el código de lógica embebida del panel de facturación `DeveloperBillingPanel` (con firma HTML5 Canvas y desglose) y del singleton de telemetría `telemetryService` en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx).
  - [x] Diseñar e integrar los playgrounds interactivos para `'facturacion_comisional'` y `'telemetria_centralizada'` con controles y simulación de logs de envío en caliente en Sandbox.
  - [x] Mapear las llaves en `COMPONENT_SANDBOX_MAP` dentro de `ComponentSandbox.jsx`.
  - [x] Ejecutar la compilación de control y verificar que todo compile libre de errores.

- [x] **~~Tarea 198: Diseño e Integración de Calendario/DatePicker Premium~~**
  - [x] Crear y catalogar la especificación técnica de `calendario_premium.md` en la biblioteca reutilizable.
  - [x] Registrar la entrada y el Criterio de Decisión IA en `README.md` de la biblioteca y en `mapa_documentacion_ia.md`.
  - [x] Implementar el componente reactivo `DatePickerPremium` y su sandbox interactivo en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx).
  - [x] Mapear las llaves en `COMPONENT_SANDBOX_MAP` dentro de `ComponentSandbox.jsx`.
  - [x] Garantizar compilación exitosa libre de errores.

- [x] **~~Tarea 199: Diseño e Integración de Trío de Componentes Premium (Marquesina, Menú Radial, Tarjeta 3D)~~**
  - [x] Crear y catalogar las especificaciones técnicas de `marquesina_marcas.md`, `menu_radial.md` y `tarjeta_3d_holografica.md` en la biblioteca.
  - [x] Registrar las entradas y Criterios de Decisión en `README.md` de la biblioteca y en `mapa_documentacion_ia.md`.
  - [x] Implementar e integrar los componentes y sus sandboxes interactivos en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx).
  - [x] Mapear las llaves en `COMPONENT_SANDBOX_MAP` de `ComponentSandbox.jsx`.
  - [x] Garantizar compilación de producción exitosa libre de errores.

- [x] **~~Tarea 200: Corrección de Borde de Marquesina de Marcas (InfiniteLogoMarquee)~~**
  - [x] Eliminar clase `overflow-hidden` del div interno `.marquee-container` para evitar recortes al escalar en hover.
  - [x] Reubicar padding vertical de la marquesina al contenedor externo (`py-4`) para dar espacio visual suficiente a las tarjetas en hover.
  - [x] Sincronizar código en la documentación de biblioteca ([`marquesina_marcas.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Marquesina_Marcas/marquesina_marcas.md)).
  - [x] Validar compilación exitosa libre de errores.

- [x] **~~Tarea 201: Diseño e Integración del Segundo Trío de Componentes VIP (MagneticButton, SwipeableCardStack, InteractiveAmbientGlow)~~**
  - [x] Inyectar los componentes `SandboxMagneticButton`, `SandboxSwipeableCardStack`, y `SandboxInteractiveAmbientGlow` en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx).
  - [x] Desarrollar playgrounds interactivos con controles deslizables, selectores y entradas numéricas en la Sandbox.
  - [x] Mapear las claves de acceso en `COMPONENT_SANDBOX_MAP` con tolerancia a búsquedas difusas.
  - [x] Validar compilación exitosa con `npm run build`.

- [x] **~~Tarea 202: Integración y Sandbox de Empty State Premium Interactivo~~**
  - [x] Diseñar e integrar el playground interactivo para `'empty_state'` en [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx).
  - [x] Importar la librería `framer-motion` para habilitar las animaciones de spring elástico de la ilustración y del botón de acción.
  - [x] Mapear las llaves de acceso en `COMPONENT_SANDBOX_MAP` (`emptystate`, `empty state`, etc.) y habilitar la resolución difusa del playground.
  - [x] Validar compilación exitosa del proyecto con `npm run build`.

- [x] **~~Tarea 203: Solución de Dropdowns Nativa en Selector Desplegable y Habilitación de Sandboxes~~**
  - [x] Reemplazar el elemento nativo HTML `<select>` en el playground `'selector_atributos'` de [`ComponentSandbox.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) por una lista desplegable animada premium utilizando Framer Motion, un tap-shield overlay para cerrar con clicks exteriores, y bordes interactivos basados en el estándar HSL de marca blanca.
  - [x] Diseñar e integrar la función helper `getSandboxKey` en `ComponentSandbox.jsx` y exportarla.
  - [x] Importar y utilizar `getSandboxKey` en [`ComponentLibraryView.jsx`](file:///D:/PROTOTIPE/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) para calcular `hasSandbox` y pasar el `technicalName` a `ComponentSandbox` para forzar la correcta resolución del playground de "Ruleta de la Fortuna" y "Selector de Reservas".
  - [x] Validar compilación de producción exitosa con `npm run build` en menos de 600ms.

- [x] **~~Tarea 204: Rediseño Premium de la Ruleta de la Fortuna (ruleta_suerte)~~**
  - [x] Cambiar alineación de textos de la ruleta a radial (hacia el exterior con `textAnchor="end"`) para evitar desbordes y que se tapen con el botón central de giro.
  - [x] Diseñar aro metálico exterior dorado de alta fidelidad con bombillos LED dorados animados integrados.
  - [x] Implementar puntero/flecha indicadora premium en diseño vectorial 3D con gema y soporte de degradado dorado.
  - [x] Mejorar contraste y diseño del botón central "GIRAR".
  - [x] Validar compilación de producción exitosa con `npm run build` en menos de 600ms.

- [x] **~~Tarea 205: Selector Premium en Reservas tipo Agenda (reservas_agenda)~~**
  - [x] Sustituir el elemento select nativo de HTML por una lista desplegable premium con estados de control (`isSelectOpen`), detector de clics exteriores con shield, animación de Chevron rotatorio e iconos adaptativos HSL.
  - [x] Validar compilación de producción exitosa con `npm run build` en menos de 600ms.

- [x] **~~Tarea 206: Separación e integración independiente del Sandbox para Gestor de Categorías (CategoryManager)~~**
  - [x] Desvincular el mapeo de `CategoryManager` del playground genérico de atributos (`selector_atributos`).
  - [x] Crear e inyectar el nuevo sandbox `'gestor_categorias'` con simulación de gestión de categorías interactiva (crear, editar, eliminar y búsqueda de iconos nativos) en `ComponentSandbox.jsx`.
  - [x] Mapear las claves de búsqueda del componente a la nueva llave `'gestor_categorias'`.
  - [x] Validar compilación exitosa sin errores de producción.
  - [x] Validar compilación de producción exitosa con `npm run build` en menos de 600ms.

- [x] **~~Tarea 207: Sandbox e Integración de los 4 Componentes Premium (AuthGuard, GlobalSkeletonLoader, BreadcrumbHeader, ErrorBoundaryFallback)~~**
  - [x] Diseñar e implementar los 4 playgrounds en `ComponentSandbox.jsx` (`auth_guard_userprofile`, `global_skeleton_loader`, `breadcrumb_header`, `error_boundary_fallback`).
  - [x] Conectar controles dinámicos para roles, simulación de retardos y simulación de crash con recuperación de interfaz.
  - [x] Mapear búsquedas difusas en `COMPONENT_SANDBOX_MAP` y en `getSandboxKey()`.
  - [x] Actualizar e indexar el mapa semántico `mapa_documentacion_ia.md` con las referencias físicas de las fichas técnicas.
  - [x] Confirmar compilación exitosa mediante `npm run build` (599ms).

- [x] **~~Tarea 208: Refactorización y Modularización de los 4 Playgrounds de Sandbox (Lazy Loading)~~**
  - [x] Extraer los componentes de presentación de los 4 nuevos playgrounds a `src/components/admin/sandboxes/`.
  - [x] Crear el componente común `SandboxLayout.jsx` para centralizar la estructura y controles.
  - [x] Modificar `ComponentSandbox.jsx` para importar de forma perezosa (`React.lazy` y `Suspense`) cada playground.
  - [x] Confirmar compilación exitosa (`npm run build`) en menos de 600ms, verificando que Vite cree chunks individuales para cada sandbox.

- [x] **~~Tarea 209: Modularización Absoluta de la Consola Central (40 Sandboxes Independientes y Carga Perezosa)~~**
  - [x] Desacoplar y extraer los 40 sandboxes y playgrounds interactivos a archivos independientes planos bajo `src/components/admin/sandboxes/`.
  - [x] Reconfigurar la consola central `ComponentSandbox.jsx` para usar importación dinámica `React.lazy` y cargadores `Suspense` con un loader común para los 40 componentes.
  - [x] Modificar la directiva de `@sandbox` en `GEMINI.md` y las skills de `sandbox-integrator` y `component-creator` para obligar al desarrollo y registro modularizado.
  - [x] Ejecutar la compilación local (`npm run build`) en `dev-dashboard` y verificar que Vite compile al 100% de manera exitosa y cree los chunks de los 40 sandboxes.

- [x] **~~Tarea 210: Diseño e Integración de CajaDiariaPOS (Control de Caja y Cierre de Turno)~~**
  - [x] Crear y catalogar la especificación técnica de `caja_diaria_pos.md` en la biblioteca reutilizable.
  - [x] Diseñar e implementar el Sandbox independiente `CajaDiariaPOSSandbox.jsx` con emulador y canvas de firma digital.
  - [x] Registrar la carga perezosa, alias y búsqueda difusa en `ComponentSandbox.jsx`.
  - [x] Registrar en el `README.md` del catálogo de la biblioteca y en `mapa_documentacion_ia.md`.
  - [x] Ejecutar la compilación local y verificar build exitoso.

- [x] **~~Tarea 211: Rediseño Premium de la pestaña de Nuevo Cliente con InteractiveAmbientGlow~~**
  - [x] Diseñar e implementar el componente `InteractiveAmbientGlow` localmente en `App.jsx`.
  - [x] Integrar `InteractiveAmbientGlow` de fondo absoluto con un overlay de glassmorphism sobre la vista de Nuevo Cliente inactiva (`isOnboardingActive === false`).
  - [x] Rediseñar el contenedor a una tarjeta de alto impacto con glassmorphism y micro-sombras.
  - [x] Crear un botón premium interactivo con gradientes, glowing radial y escalamiento responsivo para iniciar el wizard.
  - [x] Validar que el build de producción en `dev-dashboard` compile correctamente.

- [x] **~~Tarea 212: Extracción y Sandbox del Componente CustomCursor~~**
  - [x] Refactorizar la lógica de `CustomCursor` en `App.jsx` para soporte de props (color, size, opacity).
  - [x] Crear la especificación técnica en `D:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Formularios_y_UI\Cursor_Personalizado\cursor_personalizado.md`.
  - [x] Registrar la entrada en el catálogo `README.md` de la biblioteca y en el mapa semántico `mapa_documentacion_ia.md`.
  - [x] Crear el sandbox modular independiente `CustomCursorSandbox.jsx` in `src/components/admin/sandboxes/`.
  - [x] Registrar la carga perezosa y la resolución fuzzy en `ComponentSandbox.jsx`.
  - [x] Compilar el proyecto en local exitosamente con `npm run build`.

- [x] **~~Tarea 213: Selector de Nicho y Panel de Gestión CRM en Consola Central~~**
  - [x] Declarar los estados de `niche` y edición en caliente en `App.jsx`.
  - [x] Diseñar e integrar la lista desplegable de Nicho de Mercado en la pestaña `Módulos` del Onboarding Wizard.
  - [x] Propagar la variable `niche` en el payload de creación local `cliPayload` y en el documento de Firestore `clientes_control`.
  - [x] Desarrollar la interfaz del modal premium de Gestión de Cliente en el CRM para la visualización y edición en caliente de comisiones, cobros y vertical.
  - [x] Ejecutar la compilación local (`npm run build`) para verificar la integridad del build.

- [x] **~~Tarea 214: Corrección de Contraste del Logo en Sidebar~~**
  - [x] Cambiar el color de texto estático del logo "PROTOTIPE" en `App.jsx` a la variable de tema dinámica `text-[var(--color-text)]`.
  - [x] Validar legibilidad en modo claro y modo oscuro.
  - [x] Compilar el proyecto en local exitosamente con `npm run build`.

- [x] **~~Tarea 215: Actualización de Identidad Visual con Nuevo Logo y Favicon~~**
  - [x] Integrar la nueva imagen del logo en `/public/logo.png`.
  - [x] Actualizar el favicon en `index.html`.
  - [x] Reemplazar los logotipos del sidebar en `App.jsx` con el nuevo asset.
  - [x] Compilar el proyecto en local exitosamente con `npm run build`.

- [x] **~~Tarea 216: Corrección de Sombra Cuadrada (Overflow) en Logo~~**
  - [x] Restaurar la imagen original del logo con los colores correctos.
  - [x] Agregar la clase `overflow-hidden` a los contenedores del logo en `App.jsx` para recortar los bordes cuadrados por CSS.
  - [x] Comprobar compilación exitosa libre de errores.

- [x] **~~Tarea 217: Sincronización del Estilo del Logo en el Formulario de Login~~**
  - [x] Aplicar el contenedor redondeado `rounded-2xl` con borde HSL `border border-violet-500/30` y fondo con gradiente translúcido `bg-gradient-to-tr from-violet-500/20 to-cyan-500/20` sin sombras duras en el formulario de login.
  - [x] Eliminar el sombreado púrpura difuminado `shadow-[0_0_25px...]` y el fondo sólido del logo del login para garantizar consistencia absoluta con el diseño de marca del sidebar.
  - [x] Validar que la compilación local compile al 100% sin advertencias.

- [x] **~~Tarea 218: Eliminación del Subtítulo de la Consola en el Topbar~~**
  - [x] Remover el subtítulo "Motor de Aplicaciones a la Medida" en el header principal/topbar visible when the sidebar is collapsed.
  - [x] Comprobar compilación exitosa libre de errores.

- [x] **~~Tarea 219: Ajuste de Nomenclatura de Marca a 'ROTOTIPE'~~**
  - [x] Reemplazar el texto de marca estático "PROTOTIPE" por "ROTOTIPE" en el sidebar (expandido y colapsado) para integrar de manera inteligente el isotipo/logo (letra P) como la letra inicial.
  - [x] Refactorizar la sección de cabecera del Login para usar un layout horizontal integrado con el logo y el texto "ROTOTIPE".
  - [x] Ejecutar compilación exitosa sin errores.

- [x] **~~Tarea 220: Refactorización de Perfil y Tema en Barra de Estado~~**
  - [x] Eliminar el icono de modo oscuro (DarkModeToggle) del topbar/barra de navegación principal, centralizándolo únicamente dentro del panel de ajustes.
  - [x] Remover el correo, la información de rol ("Root Dev") y el botón de salida ("Salir") de la barra superior.
  - [x] Declarar el estado `isProfileModalOpen` e implementar un botón interactivo "Perfil" con icono de usuario (`User`) en el topbar que abre el modal.
  - [x] Diseñar un modal de perfil premium que muestra los detalles del perfil (iniciales, correo, rol) y el estado de la base de datos (Firestore Online vs Sandbox).
  - [x] Trasladar el botón de cierre de sesión ("Cerrar Sesión") al interior del modal de perfil.
  - [x] Validar que compile a producción de forma correcta.

- [x] **~~Tarea 221: Restauración del Nombre de Marca a 'PROTOTIPE'~~**
  - [x] Cambiar el texto de marca de "ROTOTIPE" a "PROTOTIPE" en el sidebar (colapsado y expandido) y en el formulario de inicio de sesión.
  - [x] Restaurar la separación a `gap-3` para adaptarla a la longitud completa de la palabra.
  - [x] Validar compilación local exitosa.

- [x] **~~Tarea 222: Consola de Errores y Diagnóstico de Clientes en Tiempo Real~~**
  - [x] Agregar reglas en `firestore.rules` para la colección `app_failures`.
  - [x] Añadir el tab `errors` a `NAV_TABS` y configurar los estados `failures` and `expandedErrorId` en `App.jsx`.
  - [x] Implementar el listener `onSnapshot` en tiempo real para `app_failures`.
  - [x] Reemplazar el indicator `Live/Sandbox` del topbar por un botón estilo consola diagnóstica interactiva que pulsa/parpadea si hay fallos y redirige a la Consola de Errores al hacer clic.
  - [x] Desarrollar la vista de Consola de Errores con tarjetas analíticas, filtro por cliente individual/conjunto, terminal de stack trace colapsable y botones de resolución en lote o individuales.
  - [x] Inyectar simuladores de fallos aleatorios tanto para Sandbox como para Firestore.
  - [x] Validar compilación exitosa.
  - [x] **Revisión de Sincronización:** Corregida la colisión de estados del listener en tiempo real de Firestore agregando `isSimulated` a la matriz de dependencias de `useEffect`. Esto garantiza que los listeners reales se destruyan síncronamente al activar el modo Sandbox y se activen nuevamente al reconectar a producción, asegurando que ambos entornos funcionen al 100% de forma independiente.

- [x] **~~Tarea 224: Conexión de ErrorBoundaryFallback con Telemetría Central (app_failures)~~**
  - [x] Actualizar la firma del callback `onReport` en `ErrorBoundaryFallback` para pasar tanto `error` como `errorInfo`.
  - [x] Implementar la función `handleReport` en el Sandbox `ErrorBoundaryFallbackSandbox.jsx` para estructurar y guardar reportes de fallo reales en la colección central `app_failures` en caliente.
  - [x] Sincronizar la documentación técnica del componente en la biblioteca (`error_boundary_fallback.md`) y actualizar la descripción en el mapa de documentación semántico (`mapa_documentacion_ia.md`).

- [x] **~~Tarea 225: Paginación y Límite de 10 Elementos en Consola de Errores~~**
  - [x] Crear el estado `errorsPage` en `App.jsx` para controlar el estado de paginación del listado de incidentes.
  - [x] Calcular dinámicamente `paginatedFailures` usando cortes de 10 elementos por página.
  - [x] Integrar el componente `Pagination` al final de la lista de incidentes.
  - [x] Restablecer `errorsPage` a 1 cuando el filtro de cliente cambie.

- [x] **~~Tarea 226: Botón Vaciar Historial de Incidentes~~**
  - [x] Importar el icono `Trash2` de `lucide-react`.
  - [x] Crear el handler `handleClearAllFailures` para borrar físicamente en Firestore (`deleteDoc`) o limpiar el estado reactivo local en Sandbox de todos los incidentes.
  - [x] Agregar el botón en la cabecera de la Consola de Errores con confirmación modal premium (`showAlert`).

- [x] **~~Tarea 227: Rediseño Estético del Selector de Clientes en Consola de Errores~~**
  - [x] Sustituir el dropdown select nativo HTML por el componente CustomSelect.
  - [x] Sincronizar las opciones de filtrado (Todos los Clientes y slugs dinámicos de clientes).

- [x] **~~Tarea 228: Corrección de Mapeo del Sandbox para Facturación y Firma Digital~~**
  - [x] Corregir la coincidencia difusa de la palabra `'pan'` en `getSandboxKey()` para evitar que coincida con `'panel'` (ej. `DeveloperBillingPanel`) y redirija a `BreadcrumbHeader`.
  - [x] Agregar mappings explícitos para `'facturación y firma digital'`, `'facturacion y firma digital'` y `'developerbillingpanel'` en `COMPONENT_SANDBOX_MAP` hacia `'facturacion_comisional'`.

- [x] **~~Tarea 229: Corrección de Bordes en Facturación Comisional Sandbox~~**
  - [x] Reemplazar todas las clases no estándares `border-slate-850`, `divide-slate-850` y `hover:bg-slate-850` por las estándar de la aplicación `border-slate-800`, `divide-slate-800` y `hover:bg-slate-800`.

- [x] **~~Tarea 230: Ajuste de Bordes Sutiles en Facturación Comisional~~**
  - [x] Reemplazar los bordes `border-slate-800` y `divide-slate-800` de las tarjetas inferiores por `border-slate-800/50` y `divide-slate-800/50` para armonizar la interfaz con las tarjetas de métricas superiores y eliminar los bordes toscos y contrastados.

- [x] **~~Tarea 231: Rediseño de Botones de Filtro por Iconos y Etiquetas en Biblioteca~~**
  - [x] Diseñar una estructura vertical flex (`flex-col items-center justify-center gap-1`) para los botones de filtros.
  - [x] Integrar los iconos premium correspondientes (`Layers`, `Code2`, `Package` y `List`, `Eye`, `FileText`).
  - [x] Añadir etiquetas descriptivas en formato compacto de texto de bajo tamaño (`text-[8px] font-black uppercase`) justo debajo de cada icono.
  - [x] Mantener tooltips descriptivos (`title`) y animaciones premium de transición de escala al estar activos.
  - [x] Corregir el bug visual de hover en botones seleccionados moviendo `hover:bg-indigo-500/10` para que aplique únicamente en los estados no activos.

- [x] **~~Tarea 232: Enriquecimiento Interactivo del Mockup de Onboarding~~**
  - [x] Implementar estados dinámicos del mockup del smartphone (`mockActiveTab`, `mockOrders`, `mockIsNewSaleOpen`, etc.).
  - [x] Habilitar cambio de pestañas interactivo (Inicio, Ventas, Ajustes) en la barra de navegación del teléfono mockup.
  - [x] Crear un formulario funcional para agregar nuevas ventas simuladas ("Registrar Nueva Venta"), recalculando dinámicamente el balance diario y el listado de ventas.
  - [x] Añadir botones para remover ventas simuladas de la lista con recuento en vivo y distribución de barras gráficas en la pestaña de Ventas.

- [x] **~~Tarea 233: Catálogo Ampliado de Fuentes y Filtrado por Categorías en Onboarding~~**
  - [x] Expandir el catálogo a 62 Google Fonts estructuradas por Sans-Serif, Serif, Display, Monospace y Script (incluyendo Inconsolata como equivalente a Consolas).
  - [x] Reemplazar el preloader estático en `App.jsx` por un generador dinámico de URL de Google Fonts a partir del arreglo de familias.
  - [x] Implementar barra de pestañas de categorías dentro del modal de tipografía (Todos, Sans-Serif, Serif, Display, Monospace, Script).
  - [x] Añadir insignias visuales (Badges) en cada tarjeta para identificar la categoría de cada fuente.
  - [x] Validar compilación local exitosa con `npm run build` (631ms).
