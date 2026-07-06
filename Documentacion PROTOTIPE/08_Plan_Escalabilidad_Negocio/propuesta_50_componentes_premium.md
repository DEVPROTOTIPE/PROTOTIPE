# 🎨 Propuesta de 50 Componentes Premium Reutilizables — Prototipe Ecosistema

Este documento contiene un catálogo exhaustivo de 50 componentes y utilidades premium diseñados para acelerar el desarrollo del ecosistema **Prototipe** y sus marcas/clientes. Todos los componentes siguen los estándares estrictos de desarrollo: **Marca blanca modular, inyección HSL, accesibilidad, animaciones fluidas y compatibilidad total con React 19, Tailwind CSS v4, Zustand v5 y Firebase SDK v12**.

---

## 🗂️ ÍNDICE POR CATEGORÍA

1. [Diseño y Experiencia Visual Premium (Layouts & Visuals)](#-1-diseño-y-experiencia-visual-premium)
2. [E-commerce, Conversión y Checkouts](#-2-e-commerce-conversión-y-checkouts)
3. [Interacción de Usuario y Controles UX](#-3-interacción-de-usuario-y-controles-ux)
4. [Lógica, Hooks y Utilidades del Sistema](#-4-lógica-hooks-y-utilidades-del-sistema)
5. [Panel Administrativo y Gestión Multitenant](#-5-panel-administrativo-y-gestión-multitenant)
6. [Servicios y Conectividad Firebase](#-6-servicios-y-conectividad-firebase)
7. [Engagement, Onboarding y Gamificación](#-7-engagement-onboarding-y-gamificación)

---

## 🎨 1. Diseño y Experiencia Visual Premium

### 1. BentoGrid (Dashboard Dinámico)
- **Propósito:** Layout tipo mosaico responsivo (Bento Grid) para mostrar estadísticas, productos destacados o métricas operativas de forma jerárquica y moderna.
- **Visual & Estilos:** Cajas con fondos de cristal (`backdrop-blur-xl bg-slate-900/40 border border-slate-800`), sombras sutiles y micro-interacciones de escala al hacer hover.
- **Lógica:** Recibe un array de widgets con tamaños configurables (`cols-span`, `rows-span`).

### 2. MasonryCatalog (Catálogo Fluido)
- **Propósito:** Grilla asíncrona de tipo Masonry para catálogos con productos que tienen imágenes de diferentes alturas, optimizando el espacio sin huecos.
- **Visual & Estilos:** Columnas balanceadas dinámicamente con transiciones CSS suaves al redimensionar.
- **Lógica:** Distribución de items por columnas basada en el ancho del contenedor en tiempo de ejecución.

### 3. GlassmorphicSidebar (Menú Lateral de Cristal)
- **Propósito:** Barra de navegación lateral fija para escritorio que se funde con el fondo usando filtros avanzados de desenfoque.
- **Visual & Estilos:** `backdrop-blur-md bg-slate-950/60 border-r border-slate-900/60`, indicadores activos con efecto glow de color HSL de marca.
- **Lógica:** Zustand para colapsar/expandir el sidebar con atajos de teclado (`Esc`, `B`).

### 4. AnimatedNavbarMobile (Menú Inferior Táctil)
- **Propósito:** Barra de navegación inferior elástica diseñada para dispositivos móviles que sigue el pulgar del usuario.
- **Visual & Estilos:** Burbuja elástica (`Framer Motion`) que se desplaza horizontalmente detrás del ícono seleccionado.
- **Lógica:** Hook de detección de ruta activa y transiciones fluidas de `layoutId` en Framer Motion.

### 5. FloatingActionHub (Centro de Acciones Rápidas)
- **Propósito:** Botón flotante persistente (FAB) en la esquina inferior derecha que, al tocarlo, despliega un abanico radial de accesos directos (WhatsApp, Carrito, Soporte).
- **Visual & Estilos:** Animación radial elástica de salida en los botones secundarios con opacidad escalonada.
- **Lógica:** Estado toggle con control de clics fuera de la interfaz para auto-cerrado.

### 6. ShimmerSkeleton (Placeholder Premium de Carga)
- **Propósito:** Layout temporal animado que simula la estructura de tarjetas de producto o tablas de datos para evitar saltos de pantalla (CLS).
- **Visual & Estilos:** Degradado animado (`bg-gradient-to-r via-slate-800 to-slate-900 animate-shimmer`).
- **Lógica:** Componente abstracto que recibe propiedades de forma (`avatar`, `text-lines`, `grid-cards`).

### 7. HorizontalPromoCarousel (Banners con Swipe)
- **Propósito:** Slider horizontal táctil de banners promocionales con arrastre nativo y soporte móvil optimizado.
- **Visual & Estilos:** Paginación de dots activos elástica con transiciones de color.
- **Lógica:** Eventos `onTouchStart`, `onTouchMove`, `onTouchEnd` nativos (sin dependencias externas pesadas) y auto-rotación pausada al hacer hover.

### 8. ParallaxHeroBanner (Banner 3D Interactivo)
- **Propósito:** Banner inicial en catálogo o landing page que reacciona levemente al movimiento del cursor del ratón o giroscopio del móvil.
- **Visual & Estilos:** Imagen de fondo, textos y elementos decorativos flotando en diferentes planos de profundidad (`translate-x`, `translate-y`).
- **Lógica:** Hook para capturar coordenadas del mouse y aplicar rotaciones 3D sutiles mediante estilos inline reactivos.

---

## 🛒 2. E-commerce, Conversión y Checkouts

### 9. StickyAddToCartBar (Barra de Compra Móvil)
- **Propósito:** Barra fija inferior en la vista de producto móvil que aparece cuando el botón principal de añadir al carrito sale del viewport.
- **Visual & Estilos:** `fixed bottom-0 bg-slate-950/90 border-t border-slate-900 shadow-2xl`, botones grandes y área táctil cómoda.
- **Lógica:** Intersection Observer sobre el botón principal para alternar visibilidad de la barra flotante.

### 10. MultiStepCheckoutWizard (Asistente Multipaso)
- **Propósito:** Checkout interactivo dividido en 3 pasos lógicos (Datos de entrega → Métodos de Pago → Resumen y Confirmación).
- **Visual & Estilos:** Indicador superior de progreso tipo timeline y animaciones de slide lateral para cada paso.
- **Lógica:** Zustand para almacenar los datos temporales de compra y validación individual de campos por paso mediante esquemas reactivos.

### 11. ElasticCartDrawer (Cajón de Carrito con Resorte)
- **Propósito:** Cajón lateral deslizante que gestiona el carrito de compras con animaciones de física de resorte.
- **Visual & Estilos:** Panel deslizable con desenfoque de fondo y scroll inercial en la lista de productos.
- **Lógica:** Zustand persistido, animaciones elásticas de entrada/salida y scroll lock en el body al abrirse.

### 12. InteractiveCouponBadge (Badge de Cupones)
- **Propósito:** Campo interactivo para digitar y validar cupones de descuento en el checkout con efectos de micro-animación.
- **Visual & Estilos:** Efecto de confeti interior al aplicarse con éxito; bordes parpadeantes de advertencia si el cupón expiró.
- **Lógica:** Validación contra Firestore, guardado de tasa de descuento en el checkout y feedback temporal.

### 13. StockHeatmap (Indicador de Stock Crítico)
- **Propósito:** Badge visual en la ficha de producto que indica de forma sutil cuán escaso es un artículo.
- **Visual & Estilos:** Píldora animada con colores suaves (`bg-red-500/10 text-red-400` para unidades escasas; `bg-emerald-500/10 text-emerald-400` para stock amplio).
- **Lógica:** Lee el inventario actual y el umbral crítico configurado en Firestore para cambiar el estado visual.

### 14. UpsellCrossSellDrawer (Sugeridor Complementario)
- **Propósito:** Cajón o sección en el checkout que sugiere productos relacionados de bajo costo basados en el carrito actual para aumentar el ticket medio.
- **Visual & Estilos:** Lista de mini-tarjetas horizontales compactas con botones de adición directa de un solo clic.
- **Lógica:** Cruce de categorías en base a las tags del carrito para seleccionar 3 artículos recomendados.

### 15. OrderTimelineTracker (Seguimiento de Pedidos)
- **Propósito:** Vista interactiva pública para que el cliente final siga el estado de entrega de su pedido en tiempo real.
- **Visual & Estilos:** Timeline vertical con hitos que cambian de color HSL y muestran animaciones de ondas de pulso (`animate-ping`).
- **Lógica:** Suscripción por WebSocket/onSnapshot a un pedido específico usando su token UUID.

### 16. QuickQRDownloadCard (Ficha de Descarga QR)
- **Propósito:** Widget administrativo para que el tendero descargue, imprima o configure el código QR de acceso rápido a su catálogo.
- **Visual & Estilos:** Ficha en formato tarjeta física, elegante, con mockup del código QR centrado y botones táctiles de descarga rápida.
- **Lógica:** Conversión del elemento SVG/Canvas del código QR a formato imagen PNG utilizando librerías locales diferidas.

---

## 🖱️ 3. Interacción de Usuario y Controles UX

### 17. CommandPaletteKBar (Paleta de Comandos CMD+K)
- **Propósito:** Buscador global flotante de comandos rápidos que permite navegar por la app mediante el teclado.
- **Visual & Estilos:** Modal centrado con fondo traslúcido y lista filtrada con atajos de teclado a la derecha.
- **Lógica:** Hook global para interceptar combinaciones de teclas (`Ctrl+K` o `Cmd+K`) y buscar sobre un mapa indexado de rutas y acciones admin.

### 18. SwipeableBottomSheet (Panel Deslizable Inferior)
- **Propósito:** Cajón inferior que se abre hacia arriba con soporte para arrastre táctil (pull-to-dismiss) en dispositivos móviles.
- **Visual & Estilos:** Pestaña superior táctil redondeada (`drag bar`), bordes curvados superiores y fondo traslúcido con blur.
- **Lógica:** Utiliza coordenadas táctiles nativas (`onTouchMove`) o interpolación física de Framer Motion para deslizar y cerrar el panel al arrastrar hacia abajo.

### 19. OTPInputField (Entrada de Código OTP)
- **Propósito:** Grupo de inputs individuales para ingresar códigos de verificación numérica de 4 o 6 dígitos enviados por SMS o correo.
- **Visual & Estilos:** Cuadros numéricos individuales enfocados secuencialmente con bordes brillantes HSL.
- **Lógica:** Gestión del portapapeles (copiar/pegar código completo distribuyéndolo en inputs), salto automático al siguiente input y retroceso por tecla `Backspace`.

### 20. DoubleRangePriceSlider (Slider de Rango Doble)
- **Propósito:** Barra interactiva con dos tiradores para filtrar productos en base a un rango de precio mínimo y máximo.
- **Visual & Estilos:** Tiradores circulares de HSL con sombras profundas y línea de progreso con gradiente.
- **Lógica:** Cálculo matemático de porcentajes sobre la barra física del DOM y debounce en el callback de filtrado.

### 21. InteractiveRatingStar (Calificación de Estrellas)
- **Propósito:** Selector y visor interactivo de puntuación de 1 a 5 estrellas para productos o calidad de servicio del negocio.
- **Visual & Estilos:** Estrellas que reaccionan con escala al pasar el mouse por encima y cambian a relleno dorado dinámico.
- **Lógica:** Maneja estados intermedios y de hover locales, devolviendo el número exacto en el evento de clic.

### 22. CircularProgressStepper (Progreso Circular)
- **Propósito:** Indicador de progreso compacto para optimizar espacio en móviles en flujos como cargas de imágenes o pasos de checkout.
- **Visual & Estilos:** Círculo SVG animado con la propiedad `stroke-dashoffset` calculada dinámicamente y porcentaje centrado en texto.
- **Lógica:** Recibe el porcentaje actual (0 a 100) y lo renderiza de manera elástica usando transiciones CSS.

### 23. TagInputAutocomplete (Input de Etiquetas)
- **Propósito:** Campo de texto interactivo para que el administrador asigne tags de productos con autocompletado en base a tags existentes.
- **Visual & Estilos:** Chips de texto eliminables (`tag badges`) que flotan dentro del input y caja desplegable de sugerencias.
- **Lógica:** Captura teclas `Enter` o `,` para convertir el texto en chip, control de duplicados y filtrado de diccionario local.

### 24. PasswordStrengthMeter (Medidor de Contraseñas)
- **Propósito:** Barra visual animada y descriptiva que evalúa en tiempo real la robustez de la contraseña del usuario en el registro.
- **Visual & Estilos:** Segmentos de color que cambian progresivamente de rojo (débil), amarillo (media) a verde (fuerte).
- **Lógica:** Algoritmo de chequeo de patrones (números, caracteres especiales, mayúsculas y longitud mínima).

---

## 🧠 4. Lógica, Hooks y Utilidades del Sistema

### 25. useLocalStorageState (Hook de Persistencia)
- **Propósito:** Hook reactivo idéntico a `useState` pero que sincroniza automáticamente su estado con `localStorage`.
- **Lógica:** Serialización JSON, try/catch para evitar fallos por almacenamiento lleno y soporte para sincronización entre múltiples pestañas del navegador en tiempo real.

### 26. useDebounceValue (Hook de Búsqueda Optimizada)
- **Propósito:** Retrasa la propagación de una variable cambiante (por ejemplo, el texto del buscador) para evitar llamadas excesivas a Firestore.
- **Lógica:** Implementa un temporizador interno (`setTimeout`) que se limpia y reinicia ante cada cambio del valor de entrada.

### 27. useNetworkSpeedMonitor (Detector de Latencia de Red)
- **Propósito:** Hook de monitoreo que mide el tiempo de respuesta contra un servidor central para advertir al usuario si su conexión móvil es lenta.
- **Lógica:** Pings controlados por HTTP asíncronos y retorno de latencia calculada en milisegundos (`ms`), categorizándola en buena, regular o crítica.

### 28. useSpeechToTextSearch (Buscador por Voz)
- **Propósito:** Hook para interactuar con la API nativa de reconocimiento de voz del navegador, permitiendo buscar productos dictándolos por micrófono.
- **Lógica:** Orquesta la API `webkitSpeechRecognition`, maneja estados de escucha, error y setea el resultado final en el input del buscador.

### 29. useIdleTimeoutGuard (Bloqueador por Inactividad)
- **Propósito:** Cierra la sesión activa de un vendedor en la tableta del POS si no se detecta actividad en un periodo determinado de minutos.
- **Lógica:** Escucha activa de eventos globales de usuario (`mousemove`, `keypress`, `touchstart`, `scroll`) con temporizadores auto-limpiables.

### 30. useIntersectionObserverLazyLoad (Cargador Diferido)
- **Propósito:** Hook para cargar de forma diferida imágenes grandes de productos o componentes pesados solo cuando entran en la pantalla activa.
- **Lógica:** Wrapper de la API `IntersectionObserver` que retorna un estado booleano para inyectar recursos en caliente.

---

## ⚙️ 5. Panel Administrativo y Gestión Multitenant

### 31. TenantFeatureFlagSwitcher (Gestor visual de Flags)
- **Propósito:** Interfaz administrativa interna para activar o apagar módulos comerciales (DIAN, Créditos, Cupones) de forma remota por cliente.
- **Visual & Estilos:** Tabla con toggles de color semántico, resúmenes descriptivos de costos asociados por módulo y alertas de impacto de cambio.
- **Lógica:** Escritura directa en Firestore bajo el documento central del cliente y propagación del cambio.

### 32. MultiShardSyncMonitor (Monitor de Base de Datos)
- **Propósito:** Panel centralizado de desarrollador para verificar la sincronía y estados de réplicas de datos entre Shards de base de datos Firebase.
- **Visual & Estilos:** Gráfico de conexiones radiales con nodos de color verde (activo), amarillo (desincronizado) o rojo (caído).
- **Lógica:** Consulta API REST local hacia el CLI y llamadas de lectura de metadatos de configuración en Shards activos.

### 33. DiagnosticConsolePing (Consola de Ping Técnico)
- **Propósito:** Módulo para comprobar la comunicación en caliente entre el POS local y el servidor central de hosting.
- **Visual & Estilos:** Terminal de texto mono-espaciado simulado con logs interactivos en tiempo real y velocidad de latencia.
- **Lógica:** Ejecución de peticiones HTTP en bucle corto con cálculo de diferencia de tiempos.

### 34. TelemetryPulseIndicator (Indicador de Actividad)
- **Propósito:** Badge de estado técnico en el panel que muestra cuándo se envió la última telemetría operativa al servidor central.
- **Visual & Estilos:** Icono de antena que emite pulsos de ondas circulares animadas (`scale-pulse`) en intervalos controlados.
- **Lógica:** Escucha cambios en el storage local y dispara la microinteracción al guardarse un reporte de caja.

### 35. CommissionCalculatorCanvas (Calculadora de Comisiones)
- **Propósito:** Herramienta interactiva para proyectar los cobros del desarrollador en base a diferentes modos de renta comisional (fijo, variable, mensual).
- **Visual & Estilos:** Panel financiero interactivo con sliders que calculan resultados dinámicos y renderizan una gráfica de proyección.
- **Lógica:** Cálculos de simulación en base a variables reactivas locales independientes de Firestore.

### 36. DigitalSignatureCanvas (Firma Digital)
- **Propósito:** Panel táctil para capturar la firma manuscrita de un cliente al aceptar un crédito ("fiado") o al recibir un reporte de pago.
- **Visual & Estilos:** Caja de dibujo blanca con bordes definidos HSL y botones atómicos de limpiar y confirmar.
- **Lógica:** Maneja la API `HTML5 Canvas`, captura trazos táctiles/mouse y exporta el resultado como string Base64 para guardarlo en la transacción.

---

## 🔥 6. Servicios y Conectividad Firebase

### 37. useFirestoreCollectionSync (Hook con Caché Local)
- **Propósito:** Servicio unificado que combina listeners en tiempo real (`onSnapshot`) con persistencia selectiva en LocalStorage para garantizar operatividad offline inmediata.
- **Lógica:** Carga inicial desde caché del navegador para respuesta CLS zero, actualización silenciosa desde red, y guardado automático al cambiar datos.

### 38. FirestoreAtomicTransaction (Transacción de Stock)
- **Propósito:** Utilidad JS pura que encapsula las operaciones de resta y adición de inventario en Firestore controlando accesos concurrentes (concurrencia de caja).
- **Lógica:** Implementa `runTransaction` de Firebase, verifica disponibilidad previa de stock, bloquea el registro en el servidor y reduce de forma atómica.

### 39. FirebaseCloudMessagingPrompt (Tokenizador Push)
- **Propósito:** Modal o banner interactivo que solicita permiso de notificaciones push al usuario final y registra el token FCM en la base de datos.
- **Visual & Estilos:** Píldora flotante animada con textos persuasivos e iconos de campana brillantes.
- **Lógica:** Llama al SDK de Firebase Messaging (`getToken`), maneja la denegación de permisos del navegador y guarda el token asociado al ID del dispositivo.

### 40. CloudPdfServiceExporter (Generador PDF Dinámico)
- **Propósito:** Servicio asíncrono diferido para generar PDFs pesados en el cliente sin bloquear la interfaz.
- **Lógica:** Importación dinámica de `jsPDF` y `jspdf-autotable` al momento de hacer clic en exportar, reduciendo el bundle inicial en más de 400KB.

### 41. WhatsAppServiceDeepLink (Sanitizador de Chats)
- **Propósito:** Utilidad que sanitiza números telefónicos (código de país, remover espacios/guiones) y formatea plantillas para abrir chats interactivos de WhatsApp.
- **Lógica:** Sanitización Regex y redirección limpia vía `window.open` usando esquemas `https://wa.me/` o `https://api.whatsapp.com/`.

### 42. LocalOfflineSyncAlert (Alerta de Cola Offline)
- **Propósito:** Indicador flotante persistente que le avisa al administrador cuántas transacciones o pedidos pendientes por sincronizar tiene acumulados en su dispositivo por falta de internet.
- **Visual & Estilos:** Píldora de advertencia en color ámbar elástica con icono de nube tachada.
- **Lógica:** Monitorea la cola de sincronización de datos locales y se auto-oculta cuando la red vuelve y el buffer se limpia.

---

## 🔔 7. Engagement, Onboarding y Gamificación

### 43. InteractiveTutorialTour (Pasos de Onboarding)
- **Propósito:** Tutorial guiado paso a paso para enseñar a un nuevo tendero o vendedor a usar las herramientas clave del POS.
- **Visual & Estilos:** Máscara oscura superpuesta sobre la pantalla que destaca elementos clave (`highlighter`) con tooltips contextuales.
- **Lógica:** Utiliza coordenadas físicas del DOM para posicionar diálogos y avanza al pulsar "Siguiente" o interactuar con el elemento destacado.

### 44. DailyGoalsProgress (Metas Diarias de Venta)
- **Propósito:** Widget motivacional para el vendedor que muestra el porcentaje de avance hacia la meta diaria de ventas del negocio.
- **Visual & Estilos:** Barra de progreso con gradiente arcoíris elástica y efectos de brillo al alcanzar hitos (50%, 80%, 100%).
- **Lógica:** Suma dinámicamente las ventas concretadas del día en curso y las compara con la cuota establecida en la configuración de la app.

### 45. GamifiedRankBadge (Insignias de Rango)
- **Propósito:** Muestra un rango o nivel de ventas del vendedor (ej: "Vendedor Bronce", "Vendedor Oro") basado en su rendimiento mensual.
- **Visual & Estilos:** Badge circular en el perfil con colores metálicos e iconos brillantes, con Tooltip explicativo de recompensas.
- **Lógica:** Clasificación por condicionales en base al acumulado facturado que reporta la base de datos de comisiones.

### 46. InteractiveConfettiTrigger (Efecto Confeti)
- **Propósito:** Dispara una lluvia de papel picado digital de colores en la pantalla para celebrar una acción de éxito del usuario (pago completado, registro exitoso).
- **Visual & Estilos:** Animación física de gravedad y dispersión de partículas de colores HSL.
- **Lógica:** Carga diferida de `canvas-confetti` al dispararse el evento de éxito, garantizando cero impacto en el rendimiento general de carga de la página.

### 47. SoundFeedbackService (Notificaciones Sonoras)
- **Propósito:** Emisión de señales auditivas de bajo peso en el POS para confirmar acciones rápidas (ej. pitido corto de escaneo exitoso de producto, sonido de caja registradora al pagar).
- **Lógica:** Helper nativo de AudioContext (sin cargar archivos `.mp3` pesados) que sintetiza ondas sonoras de frecuencia específica al instante.

### 48. InAppUpdateBanner (Banner de Actualización)
- **Propósito:** Avisa al usuario de forma no intrusiva que hay una nueva versión del software disponible y lo invita a recargar el sitio para actualizar.
- **Visual & Estilos:** Banner horizontal elástico en la cabecera con botón atómico de "Actualizar ahora".
- **Lógica:** Registra cambios en el Service Worker de la PWA y captura el evento `onNeedRefresh` para alertar al cliente en caliente.

### 49. CustomerSatisfactionNPS (Modal NPS)
- **Propósito:** Modal sencillo y rápido de valoración para capturar la métrica NPS (Net Promoter Score) del cliente final tras recibir su compra.
- **Visual & Estilos:** Escala numérica del 1 al 10 con colores semánticos (rojo para detractores, verde para promotores) y selector elástico.
- **Lógica:** Captura la respuesta, la envía a la colección de telemetría de soporte de Firestore y se auto-cierra registrando fecha para evitar repetir la encuesta.

### 50. MultiThemeCustomizer (Personalizador HSL)
- **Propósito:** Panel visual interactivo para que el desarrollador o el cliente previsualicen y cambien la paleta de colores y tipografía de su marca en caliente.
- **Visual & Estilos:** Grid interactivo de círculos cromáticos con los colores primarios y sliders para ajustar matiz/saturación/luminosidad.
- **Lógica:** Inyecta directamente variables CSS en el elemento `:root` del DOM en tiempo real, permitiendo previsualizar el cambio de branding al instante antes de guardarlo en Firestore.
