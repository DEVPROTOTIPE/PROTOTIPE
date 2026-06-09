# 🗃️ Inventario Maestro del Ecosistema PROTOTIPE

Este documento contiene un inventario consolidado y técnico de todos los recursos (componentes, hooks, stores, servicios, utilidades, páginas y base de datos) que componen el ecosistema **PROTOTIPE**.

> [!NOTE]
> Este inventario ha sido generado a partir de la documentación existente del proyecto y actúa como la fuente de verdad del catálogo de recursos portables.

---

## 📊 Resumen Ejecutivo

| Tipo de Recurso | Cantidad Total | Estado General |
| :--- | :---: | :--- |
| **Componentes UI** | 53 | Productivo / Marca blanca HSL |
| **Hooks de React** | 8 | Desacoplados y atómicos |
| **Stores (Zustand)** | 3 | Persistidos y reactivos |
| **Servicios de Negocio** | 8 | Integrados con Firebase / APIs |
| **Utilidades y Helpers** | 9 | Helper functions y utilidades |
| **Páginas / Vistas** | 4 | Layouts y flujos completos |
| **Colecciones Firestore** | 17 | Optimizadas y securizadas |
| **Total Ecosistema** | 102 | **Activo e Integrado** |

---

## 🧩 Inventario de Componentes

| Nombre | Categoría | Ubicación | Estado | Descripción | Dependencias | Documentación |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Facturación Comisional** | 00_Core_Ecosistema_Obligatorios | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/00_Core_Ecosistema_Obligatorios/Facturacion_y_Firma_Digital` | `Estable` | Panel de comisiones de desarrollo con firma táctil Canvas. | de `jspdf` y `jspdf-autotable`. | [Facturacion_y_Firma_Digital](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/00_Core_Ecosistema_Obligatorios/Facturacion_y_Firma_Digital/facturacion_y_firma_digital.md) |
| **ModalTemplate** | Modales | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Modales/ModalTemplate` | `Estable` | Plantilla de modal estructural agnóstico con Framer Motion. | Ninguna | [ModalTemplate](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Modales/ModalTemplate/modal_template.md) |
| **Modal de Confirmación Emergente** | Modales | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Modales/Modal_Confirmacion` | `Estable` | Diálogo emergente especializado para confirmaciones críticas o destructivas. | Ninguna | [Modal_Confirmacion](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Modales/Modal_Confirmacion/modal_confirmacion.md) |
| **Compra Rápida desde QR (Cliente Público)** | Ecommerce_y_Ventas | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Compra_Rapida_por_QR` | `Estable` | Detalle de producto e interactividad desde QR para compras sin login. | Ninguna | [Compra_Rapida_por_QR](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Compra_Rapida_por_QR/compra_rapida_qr.md) |
| **Selector de Números de Rifa** | Ecommerce_y_Ventas | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Selector_Boletas_Rifas` | `Estable` | Cuadrícula interactiva responsiva con ruleta y CRM lateral. | Ninguna | [Selector_Boletas_Rifas](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Selector_Boletas_Rifas/selector_boletas_rifas.md) |
| **Stock Heatmap** | Ecommerce_y_Ventas | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Stock_Heatmap` | `Estable` | Chips de semáforo HSL para abundancia/escasez de stock. | Ninguna | [Stock_Heatmap](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Stock_Heatmap/stock_heatmap.md) |
| **Botón Regreso** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Boton_Regreso` | `Estable` | Botón atómico de retorno que gestiona el historial de rutas. | Ninguna | [Boton_Regreso](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Boton_Regreso/back_button.md) |
| **Cabecera Contextual Responsiva con Migas de Pan (BreadcrumbHeader)** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Breadcrumb_Header` | `Estable` | Navegación e indicador contextual con soporte de colapso móvil. | Ninguna | [Breadcrumb_Header](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Breadcrumb_Header/breadcrumb_header.md) |
| **Calendario / DatePicker Premium** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Calendario_Premium` | `Estable` | Calendario para selección de fechas y rangos con presets rápidos. | Ninguna | [Calendario_Premium](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Calendario_Premium/calendario_premium.md) |
| **Carrito Completo** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Carrito_Completo` | `Estable` | Módulo de compras reactivo con persistencia y reglas de stock. | Ninguna | [Carrito_Completo](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Carrito_Completo/carrito_completo.md) |
| **Carrito Lateral** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Carrito_Lateral` | `Estable` | Cajón lateral del carrito de compras interactivo con recomendaciones. | Ninguna | [Carrito_Lateral](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Carrito_Lateral/cart_drawer.md) |
| **CheckoutModal** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Checkout_Modal` | `Estable` | Wizard multipaso de formalización de pedido para WhatsApp. | Ninguna | [Checkout_Modal](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Checkout_Modal/checkout_modal.md) |
| **Paleta de Comandos Flotante (CommandPalette - KBar)** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Command_Palette_KBar` | `Estable` | Barra flotante de atajos rápidos de teclado para desarrollo. | Ninguna | [Command_Palette_KBar](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Command_Palette_KBar/command_palette_kbar.md) |
| **Toast de Conectividad a Red (ConnectivityToast)** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/ConnectivityToast` | `Estable` | Banner flotante de monitoreo de red y fallback offline. | Ninguna | [ConnectivityToast](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/ConnectivityToast/connectivity_toast.md) |
| **Creador de Filtros del Catálogo** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Creador_Filtros_Catalogo` | `Estable` | Panel del admin para crear dimensiones de filtros del catálogo. | Ninguna | [Creador_Filtros_Catalogo](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Creador_Filtros_Catalogo/creador_filtros.md) |
| **Máscara en Caliente para Entrada de Monedas (CurrencyInput)** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/CurrencyInput` | `Estable` | Input de moneda formateada a COP ($ XX.XXX) con sanitización. | Ninguna | [CurrencyInput](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/CurrencyInput/currency_input.md) |
| **Cursor Personalizado con Aro de Seguimiento (GPU Acelerado)** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Cursor_Personalizado` | `Estable` | Aro de seguimiento visual y puntero GPU optimizado. | Ninguna | [Cursor_Personalizado](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Cursor_Personalizado/cursor_personalizado.md) |
| **Selector de Fecha Premium (DatePicker)** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/DatePicker` | `Estable` | Selector de fecha en portal centered modal. | Ninguna | [DatePicker](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/DatePicker/date_picker.md) |
| **Formulario de Registro de Inventario Asistido por IA** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Formulario_Producto_IA` | `Estable` | Auto-descripción de imágenes utilizando Gemini Vertex AI. | Ninguna | [Formulario_Producto_IA](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Formulario_Producto_IA/formulario_producto_ia.md) |
| **Gestor de Categorías** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Gestor_Categorias` | `Estable` | ABM stateless de categorías con buscador e iconos vectoriales. | Ninguna | [Gestor_Categorias](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Gestor_Categorias/gestor_categorias.md) |
| **Badge e Input de Cupones Interactivo (CouponBadge)** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Interactive_Coupon_Badge` | `Estable` | Input de cupones con confeti animado e indicador de descuento. | Ninguna | [Interactive_Coupon_Badge](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Interactive_Coupon_Badge/interactive_coupon_badge.md) |
| **Guía de Tutorial Paso a Paso Interactiva (TutorialTour)** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Interactive_Tutorial_Tour` | `Estable` | Guiado interactivo con máscara de recorte y scroll automático. | Ninguna | [Interactive_Tutorial_Tour](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Interactive_Tutorial_Tour/interactive_tutorial_tour.md) |
| **Mapa Desplegable** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Mapa_Desplegable` | `Estable` | Acordeón con LeafletMapPicker en modo de solo lectura. | Ninguna | [Mapa_Desplegable](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Mapa_Desplegable/mapa_desplegable.md) |
| **Selector de Ubicación con Mapa Interactivo (LeafletMapPicker)** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Mapa_Interactivo` | `Estable` | Mapa interactivo basado en OSM/Nominatim sin APIs de pago. | Ninguna | [Mapa_Interactivo](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Mapa_Interactivo/mapa_interactivo.md) |
| **Menú Radial / Acción Flotante** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Menu_Radial` | `Estable` | Menú en abanico circular con cálculos trigonométricos. | Ninguna | [Menu_Radial](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Menu_Radial/menu_radial.md) |
| **Notificacion_Toast** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Notificacion_Toast` | `Estable` | Banners interactivos en base a experiencia del comprador. | Ninguna | [Notificacion_Toast](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Notificacion_Toast/guided_toast.md) |
| **Campo de Entrada OTP (One-Time Password) con Salto de Foco** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/OTP_Input_Field` | `Estable` | Entrada de código OTP con manejo de portapapeles y focos. | Ninguna | [OTP_Input_Field](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/OTP_Input_Field/otp_input_field.md) |
| **Paginación** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Paginacion` | `Estable` | Paginación adaptativa con elipsis y marca blanca HSL. | Ninguna | [Paginacion](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Paginacion/pagination.md) |
| **Panel de Filtros del Catálogo** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Panel_Filtros_Catalogo` | `Estable` | Sidebar para filtrar por categorías, precios y stock. | Ninguna | [Panel_Filtros_Catalogo](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Panel_Filtros_Catalogo/filter_panel.md) |
| **ProductFormModal_IA** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/ProductFormModal_IA` | `Estable` | Modal de formulario de producto integrado con Vertex AI. | Ninguna | [ProductFormModal_IA](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/ProductFormModal_IA/analisis_viabilidad_ia.md) |
| **Selector de Cantidad (QuantitySelector)** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/QuantitySelector` | `Estable` | Control numérico táctil con topes de stock e inyección HSL. | Ninguna | [QuantitySelector](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/QuantitySelector/quantity_selector.md) |
| **Rejilla del Catálogo** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Rejilla_Catalogo` | `Estable` | Grilla de catálogo responsiva con transiciones fluidas de layout. | Ninguna | [Rejilla_Catalogo](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Rejilla_Catalogo/rejilla_catalogo.md) |
| **Seguimiento del Pedido** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Seguimiento_Pedido` | `Estable` | Timeline responsiva del progreso de un pedido de cliente. | Ninguna | [Seguimiento_Pedido](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Seguimiento_Pedido/seguimiento_pedido.md) |
| **CustomSelect** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Selector_Desplegable` | `Estable` | Selector desplegable animado con tap-shield exterior. | Ninguna | [Selector_Desplegable](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Selector_Desplegable/custom_select.md) |
| **Selector de Fecha (DatePickerModal)** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Selector_Fecha` | `Estable` | Atómico selector de fechas con cierre en backdrop. | Ninguna | [Selector_Fecha](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Selector_Fecha/selector_fecha.md) |
| **Selector de Variantes** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Selector_Variantes` | `Estable` | Selector visual de atributos de productos con estados de stock. | Ninguna | [Selector_Variantes](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Selector_Variantes/variant_selector.md) |
| **Sistema de Notificaciones Premium** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Sistema_Notificaciones_Premium` | `Estable` | Tray de notificaciones, stack de toasts y badge en campana. | Ninguna | [Sistema_Notificaciones_Premium](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Sistema_Notificaciones_Premium/sistema_notificaciones_premium.md) |
| **Stepper de Seguimiento de Pedido (OrderTrackingTimeline)** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Stepper_Pedidos` | `Estable` | Stepper responsivo con estados de rechazo o cancelación. | Ninguna | [Stepper_Pedidos](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Stepper_Pedidos/stepper_pedidos.md) |
| **SwipeableBottomSheet** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Swipeable_Bottom_Sheet` | `Estable` | Modal inferior táctil con soporte de gestos de arrastre nativos. | Ninguna | [Swipeable_Bottom_Sheet](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Swipeable_Bottom_Sheet/swipeable_bottom_sheet.md) |
| **Switch Modo Oscuro** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Switch_Modo_Oscuro` | `Estable` | Botón toggle elástico de modo oscuro inyectando clase dark. | Ninguna | [Switch_Modo_Oscuro](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Switch_Modo_Oscuro/dark_mode_toggle.md) |
| **Tarjeta de Producto** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Tarjeta_Producto` | `Estable` | Tarjeta premium con shimmer y efectos hover de escala. | Ninguna | [Tarjeta_Producto](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Tarjeta_Producto/tarjeta_producto.md) |
| **Botón de Efecto Magnético (MagneticButton)** | Formularios_y_UI | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Boton_Magnetico` | `Estable` | Botón con atracción magnética interactiva y paralaje. | Ninguna | [Boton_Magnetico](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Boton_Magnetico/boton_magnetico.md) |
| **Tarjeta de Pedido (Admin)** | Pedidos_y_Gestion | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Pedidos_y_Gestion/Tarjeta_Pedido_Admin` | `Estable` | Tarjeta con estados, asignaciones y resúmenes para el panel. | Ninguna | [Tarjeta_Pedido_Admin](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Pedidos_y_Gestion/Tarjeta_Pedido_Admin/tarjeta_pedido_admin.md) |
| **AdminStockAlerts** | Visualizacion | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Alertas_Stock_Critico` | `Estable` | Listado e indicadores de productos con stock bajo el mínimo. | Ninguna | [Alertas_Stock_Critico](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Alertas_Stock_Critico/admin_stock_alerts.md) |
| **Cuadrícula Bento Responsiva (BentoGrid)** | Visualizacion | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Bento_Grid` | `Estable` | Layout responsivo asimétrico con hover gloss. | Ninguna | [Bento_Grid](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Bento_Grid/bento_grid.md) |
| **Carrusel de Anuncios Promocionales (CatalogBanner)** | Visualizacion | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Carrusel_Anuncios_Promocionales` | `Estable` | Carrusel promocional auto-scroll filtrado por vigencia de fechas. | Ninguna | [Carrusel_Anuncios_Promocionales](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Carrusel_Anuncios_Promocionales/catalog_banner.md) |
| **Empty State Premium Interactivo (EmptyState)** | Visualizacion | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Empty_State_Premium` | `Estable` | Ilustraciones vectoriales e interactividad para listas vacías. | Ninguna | [Empty_State_Premium](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Empty_State_Premium/empty_state.md) |
| **Fondo de Luces Orgánicas Interactivas (InteractiveAmbientGlow)** | Visualizacion | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Fondo_Luces_Organicas` | `Estable` | Fondo ambient de gradientes HSL que siguen al cursor. | Ninguna | [Fondo_Luces_Organicas](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Fondo_Luces_Organicas/fondo_luces_organicas.md) |
| **Skeleton Loader Premium Global (GlobalSkeletonLoader)** | Visualizacion | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Global_Skeleton_Loader` | `Estable` | Placeholders shimmer modulares para mitigar CLS. | Ninguna | [Global_Skeleton_Loader](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Global_Skeleton_Loader/global_skeleton_loader.md) |
| **Marquesina de Marcas Infinita (InfiniteLogoMarquee)** | Visualizacion | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Marquesina_Marcas` | `Estable` | Cinta horizontal infinita de logos con desaceleración elástica. | Ninguna | [Marquesina_Marcas](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Marquesina_Marcas/marquesina_marcas.md) |
| **Mazo de Tarjetas Deslizables (SwipeableCardStack)** | Visualizacion | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Mazo_Tarjetas_Deslizables` | `Estable` | Tarjetas apiladas 3D con gestos de descarte táctil (swipe). | Ninguna | [Mazo_Tarjetas_Deslizables](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Mazo_Tarjetas_Deslizables/mazo_tarjetas_deslizables.md) |
| **Tarjeta 3D Holográfica (HolographicTiltCard)** | Visualizacion | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Tarjeta_3D_Holografica` | `Estable` | Efecto de inclinación 3D y destello de luz holográfico. | Ninguna | [Tarjeta_3D_Holografica](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Tarjeta_3D_Holografica/tarjeta_3d_holografica.md) |
| **Banner Promocional de Referido del Desarrollador (DeveloperPromoCard)** | Monetizacion_Desarrollador | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Monetizacion_Desarrollador/Banner_Referido_Desarrollador` | `Estable` | Widget publicitario de marca blanca inyectable para el panel. | Ninguna | [Banner_Referido_Desarrollador](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Monetizacion_Desarrollador/Banner_Referido_Desarrollador/developer_promo_card.md) |
| **Ruleta de la Fortuna Interactiva con SVG y Física de Inercia** | Fidelizacion_y_Gamificacion | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Fidelizacion_y_Gamificacion/Ruleta_Fortuna_Premios` | `Estable` | Ruleta SVG para fidelización con confeti y generación de cupones. | Ninguna | [Ruleta_Fortuna_Premios](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Fidelizacion_y_Gamificacion/Ruleta_Fortuna_Premios/ruleta_fortuna_premios.md) |
| **Calendario de Reservas Semanal y Citas (WeeklyReservationAgenda)** | Reservas_y_Citas | `Documentacion PROTOTIPE/06_Biblioteca_Componentes/Reservas_y_Citas/Selector_Reservas_Agenda` | `Estable` | Calendario responsivo y grid para reservas de franjas horarias. | Ninguna | [Selector_Reservas_Agenda](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Reservas_y_Citas/Selector_Reservas_Agenda/selector_reservas_agenda.md) |

---

## 🪝 Inventario de Hooks (React Hooks)

| Nombre | Responsabilidad / Descripción | Dependencias | Componentes que lo usan | Documentación |
| :--- | :--- | :--- | :--- | :--- |
| **Contexto y Hook de Alertas / Confirmaciones Globales (useAlertConfirm)** | Interfaz unificada de modales HSL que sustituye alertas nativas. | Ninguna | Vistas del cliente / POS | [Alertas_Confirmaciones_Globales](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/Alertas_Confirmaciones_Globales/alert_confirm_context.md) |
| **Hook de Inactividad de Pantalla (useInactivityTimer)** | Monitorea actividad y ejecuta callback de cierre de sesión. | Ninguna | Vistas del cliente / POS | [Control_Inactividad](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/Control_Inactividad/use_inactivity_timer.md) |
| **Custom Hook para Retrasar Valores Reactivos (useDebounceValue)** | De-bounce de valores reactivos para optimización de búsquedas. | Ninguna | Vistas del cliente / POS | [useDebounceValue](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/useDebounceValue/use_debounce_value.md) |
| **Hook Reactivo para Persistencia en localStorage (useLocalStorageState)** | Encapsula persistencia en localStorage con manejo de cuota y sync multitab. | Ninguna | Vistas del cliente / POS | [useLocalStorageState](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/useLocalStorageState/use_local_storage_state.md) |
| **Hook de Ubicación Guardada (useSavedLocation)** | Autocompletado y persistencia de la ubicación de entrega física. | Ninguna | Vistas del cliente / POS | [useSavedLocation](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/useSavedLocation/use_saved_location.md) |
| **Guard de Seguridad y Perfil de Usuario con Roles (AuthGuard & UserProfile)** | Control de acceso por roles, guards y dropdown de avatar. | Ninguna | Vistas del cliente / POS | [Auth_Guard_UserProfile](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/Auth_Guard_UserProfile/auth_guard_userprofile.md) |
| **use_cart_store** | Hook atómico del estado del carrito. | Ninguna | Cliente / POS | [Control_Carrito](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/Control_Carrito/use_cart_store.md) |
| **use_guided_store** | Hook atómico de guiado de compra. | Ninguna | Cliente / POS | [Asistente_Guiado](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/Asistente_Guiado/use_guided_store.md) |

---

## 💾 Inventario de Stores (Zustand Stores)

| Nombre | Responsabilidad / Descripción | Datos Gestionados | Dependencias | Documentación |
| :--- | :--- | :--- | :--- | :--- |
| **Store de Carrito de Compras Persistido (useCartStore)** | Orquesta variantes y cantidades persistiendo offline. | Datos del carrito (variantes, cantidades) | Ninguna | [Control_Carrito](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/Control_Carrito/use_cart_store.md) |
| **Store de Compra Guiada Inteligente (useGuidedStore)** | Preferencias de guiado según el nivel de experiencia del usuario. | Preferencias de guiado de compra | Ninguna | [Asistente_Guiado](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Logica_y_Hooks/Asistente_Guiado/use_guided_store.md) |

---

## ⚙️ Inventario de Servicios

| Nombre | Responsabilidad / Descripción | Integraciones | Dependencias | Documentación |
| :--- | :--- | :--- | :--- | :--- |
| **Servicio de Crédito y Saldos (creditos_saldos)** | Contabilidad de fiados con transacciones atómicas. | Firebase / APIs | Ninguna | [Creditos_y_Saldos](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Servicios_y_Firebase/Creditos_y_Saldos/creditos_saldos.md) |
| **Servicio de Generación de PDF Vectorial** | Abstracción de jsPDF y AutoTable para reportes en A4. | Firebase / APIs | Ninguna | [Generacion_PDF](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Servicios_y_Firebase/Generacion_PDF/generacion_pdf.md) |
| **Servicio de Gestión de Domicilios y Enrutamiento** | Administración logísticas de mensajeros y estados. | Firebase / APIs | Ninguna | [Gestion_Domicilios](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Servicios_y_Firebase/Gestion_Domicilios/gestion_domicilios.md) |
| **Motor de Cupones y Descuentos** | CRUD de cupones y validador de expiración y montos. | Firebase / APIs | Ninguna | [Motor_Cupones](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Servicios_y_Firebase/Motor_Cupones/motor_cupones.md) |
| **Servicio de Omnicanalidad y WhatsApp Direct Link** | Envío de mensajes sanitizados con parseo de templates. | Firebase / APIs | Ninguna | [Omnicanalidad_WhatsApp](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Servicios_y_Firebase/Omnicanalidad_WhatsApp/omnicanalidad.md) |
| **Hook de Sincronización en Tiempo Real de Firestore (useFirestoreCollection)** | oyenteFirestore en tiempo real con persistencia en localStorage. | Firebase / APIs | Ninguna | [Sincronizacion_Firebase](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Servicios_y_Firebase/Sincronizacion_Firebase/sincronizacion_firebase.md) |
| **Servicio de Telemetría Centralizada** | Inicialización secundaria y reporte contable (Spark/Blaze). | Firebase / APIs | Ninguna | [Telemetria_Centralizada](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Servicios_y_Firebase/Telemetria_Centralizada/telemetria_centralizada.md) |
| **Servicio de Transacciones Atómicas para Inventario** | Deducción transaccional de stock con reintentos. | Firebase / APIs | Ninguna | [Transacciones_Atomicas_Inventario](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Servicios_y_Firebase/Transacciones_Atomicas_Inventario/transacciones_atomicas_inventario.md) |

---

## 🛠️ Inventario de Utilidades (Helpers)

| Nombre | Responsabilidad / Descripción | Dependencias | Documentación |
| :--- | :--- | :--- | :--- |
| **Caja Diaria POS y Control de Flujo Contable (CajaDiariaPOS)** | Arqueo físico, firma de auditoría y flujo auxiliar. | Ninguna | [Caja_Diaria_POS](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Caja_Diaria_POS/caja_diaria_pos.md) |
| **Consola de Diagnóstico para Desarrolladores (DeveloperDiagnosticsModal)** | Pings de Firebase local/central y test de llaves push VAPID. | Ninguna | [Consola_Diagnostico_Desarrollador](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Consola_Diagnostico_Desarrollador/diagnostico_desarrollador.md) |
| **useCopyToClipboard** | Copiado de tokens y credenciales con temporizador de reset. | Ninguna | [Copiador_Portapapeles](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Copiador_Portapapeles/use_copy_to_clipboard.md) |
| **ErrorBoundaryFallback** | Envoltura de layouts ante crashes runtime y reporte. | Ninguna | [Error_Boundary_Fallback](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Error_Boundary_Fallback/error_boundary_fallback.md) |
| **Servicio de Exportación PDF (pdfService)** | Helper de jsPDF con formateadores y tablas. | de `jspdf` y `jspdf-autotable`. | [Exportador_PDF](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Exportador_PDF/pdf_service.md) |
| **Restaurador de Aplicación a Fábrica (AppResetTool)** | Restablece el estado local y limpia caché a valores de fábrica | Ninguna | [Restauracion_Aplicacion](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Restauracion_Aplicacion/restauracion_aplicacion.md) |
| **Servicio de WhatsApp (WhatsApp Service Utility)** | Formateo celular y escape URL. | Ninguna | [Servicio_WhatsApp](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Servicio_WhatsApp/whatsapp_service.md) |
| **Sistema de Temas Dinámicos y Modo Oscuro (ThemeManager)** | Carga síncrona cromática e inyección de clases dark. | Ninguna | [Sistema_Temas_Dinamicos](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Utilidades/Sistema_Temas_Dinamicos/sistema_temas.md) |

---

## 📄 Inventario de Páginas (Vistas Principales)

| Nombre | Responsabilidad / Descripción | Dependencias | Documentación |
| :--- | :--- | :--- | :--- |
| **Página de Login Híbrido** | Login dual (PIN para clientes / Auth para administradores). | Ninguna | [Pagina_Login](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Paginas/Pagina_Login/login_page.md) |
| **Panel de Trabajo Domiciliario (DeliveryPanel)** | Panel de mensajeros, checklists y geolocalizaciones. | Ninguna | [Panel_Domicilio](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Paginas/Panel_Domicilio/panel_domicilio.md) |
| **Pantalla de Bienvenida / Onboarding** | Landing de bienvenida y derivador de sesión. | Ninguna | [Pantalla_Bienvenida](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Paginas/Pantalla_Bienvenida/welcome_page.md) |
| **Vista Pública de Seguimiento de Pedidos** | Live tracking con UUID y mapas sin login. | Ninguna | [Seguimiento_Pedido](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Paginas/Seguimiento_Pedido/order_tracking.md) |

---

## 🔥 Inventario de Firebase (Infraestructura Backend)

### 📊 Cloud Firestore (17 Colecciones Activas)
El modelado de datos de PROTOTIPE cuenta con 17 colecciones estructuradas para garantizar una operación multitenant optimizada y sin latencia:

1. **`config`**: Configuración general del negocio, pasarela de pagos (QR/bancos), feature flags de módulos activos (`creditsEnabled`, `couponsEnabled`, etc.), tema HSL y tasa de comisión del desarrollador.
2. **`products`**: Inventario consolidado con esquema de variantes (talla, color, SKU, precios de costo/venta, stock por combinación, imagen particular) y umbrales de alerta crítica de stock.
3. **`categories`**: Mapeo del árbol de navegación con identificador, nombre e icono SVG asociado.
4. **`orders`**: Historial de pedidos liquidados con detalles de variantes de artículos, estado logístico, tipo de entrega, método de pago y geolocalización.
5. **`users`**: Expediente de clientes registrados para fidelización, historial de compras y favoritos.
6. **`employees`**: Perfiles de personal con PINs encriptados de seguridad, roles asignados y contabilidad de nómina.
7. **`accessLogs`**: Auditoría de sesiones y control de tiempos (horas de entrada/salida de empleados, dispositivo, etc.).
8. **`ads`**: Campañas de marketing, banners temporales del catálogo y efectos visuales de neón.
9. **`coupons`**: Cupones de descuento, validación de expiración, montos mínimos y límites de uso.
10. **`deliveries`**: Asignación logística de pedidos a domiciliarios externos o internos, notas de entrega e incidencias.
11. **`stockMovements`**: Kardex y auditoría física del almacén (movimientos de entrada/salida de inventario y responsables).
12. **`wholesaleOrders`**: Gestión de solicitudes de compras mayoristas B2B sujetas a aprobación.
13. **`notifications`**: Centro de notificaciones administrativas (pedidos nuevos, alertas de stock, etc.).
14. **`clientNotifications`**: Centro de alertas push e internas para compradores en tiempo real.
15. **`fcmTokens`**: Tokens de registro de dispositivos para el envío de notificaciones push móviles (background).
16. **`qrAnalytics`**: Telemetría de escaneos y accesos a productos del catálogo físico a través de códigos QR.
17. **`trackingAnalytics`**: Telemetría de conversiones e interacciones en la pantalla pública de seguimiento de pedido.

### 🔐 Firebase Authentication
* **Roles y Scopes**: Autenticación híbrida. Los administradores/vendedores inician sesión mediante Firebase Auth con credenciales seguras. Los clientes públicos no requieren contraseña para flujos exprés y acceden a través de verificación de celular.
* **Control de Acceso**: La seguridad a nivel de base de datos se orquesta con variables de sesión como `request.auth`.

### 📂 Firebase Cloud Storage
* **Uso principal**: Almacenamiento optimizado de imágenes de productos principales, galería secundaria, logos de clientes y favicons.
* **Seguridad**: Reglas de almacenamiento que restringen la subida y eliminación de assets exclusivamente a administradores validados.

### ✉️ Firebase Cloud Messaging (FCM)
* **Notificaciones Push**: Envío de alertas en background a los dispositivos móviles de los empleados (vendedores, cocina, domiciliarios) y clientes. Consume los tokens registrados en la colección `fcmTokens`.

### ⚡ Cloud Functions
* **Reglas conocidas / Lógica en Servidor**: Las Cloud Functions se utilizan para flujos desacoplados como el envío automatizado de telemetría de facturación y logs de telemetría hacia la base de datos central sin bloquear la UI del cliente.

### 🛡️ Reglas de Seguridad (Firestore Rules)
* **Acceso de Administrador**: Función global `isAdmin()` que valida sesión activa (`request.auth != null`).
* **Acceso de Propietario (Cliente)**: Función global `isOwner()` que permite a clientes leer o escribir sus propios nodos utilizando su número celular como clave identificadora de documento.
* **Lectura Pública**: Colecciones de `products`, `categories` y `config` son públicas para permitir la renderización inmediata del catálogo del cliente.
* **Transaccionalidad**: El descuento de stock y la creación de órdenes de compra se ejecutan atómicamente mediante transacciones en el cliente.
