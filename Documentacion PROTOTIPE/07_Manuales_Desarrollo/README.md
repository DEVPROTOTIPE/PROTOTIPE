# 🎛️ Consola de Control de Manuales Técnicos

Esta consola centraliza y clasifica visualmente los manuales de desarrollo del proyecto. Diseñada para una consulta e integración ultra-rápida en nuevos despliegues.

---

## 📂 Catálogo Activo de Manuales

### ⚙️ Arquitectura Ecosistema y Multi-Cliente

#### 📘 [Configuración de Marca y Variables de Entorno](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_brand_config.md)
* **¿Qué resuelve?**: Permite parametrizar el 100% de la identidad de la aplicación (colores, logos, favicon, límites) utilizando variables de entorno de Vite sin modificar código fuente.
* **Complejidad**: 🟢 **Baja** (Configuración e inyección).
* **Tecnologías**: `Vite`, `Tailwind CSS`, `CSS Custom Properties`.
* **Tiempo de Integración**: ~5 minutos en un proyecto nuevo.
* **Impacto**: Afecta la capa visual y el archivo de inicialización del DOM.

#### 📘 [Generación y Uso de Mapas Semánticos para IA](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Mapas_IA/manual_ia_maps.md)
* **¿Qué resuelve?**: Herramienta de indexación automática que crea un mapa físico de rutas absolutas optimizado para que cualquier IA entienda la arquitectura de código en segundos.
* **Complejidad**: 🟢 **Baja** (Instalación y ejecución de un comando node).
* **Tecnologías**: `Node.js FS`, `Regular Expressions`, `Markdown clickables`.
* **Tiempo de Integración**: ~3 minutos en cualquier proyecto nuevo.
* **Impacto**: Aislamiento y productividad en conversaciones de desarrollo con IAs.

---

### 📦 Biblioteca de Componentes Extraídos

#### 📘 [Portal de Seguimiento Público de Pedidos](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Paginas/Seguimiento_Pedido/manual_order_tracking.md)
* **¿Qué resuelve?**: Portal para que los clientes finales sigan su pedido en tiempo real mediante tokens UUID cifrados de un solo pedido sin requerir login.
* **Complejidad**: 🟡 **Media** (Requiere configuración de reglas Firestore).
* **Tecnologías**: `Firebase Firestore`, `UUIDv4`, `Mermaid Flowcharts`.
* **Tiempo de Integración**: ~15 minutos.
* **Impacto**: Afecta el checkout del cliente y las reglas de seguridad de Firestore.

#### 📘 [Monitor de Alertas de Stock Crítico y Reabastecimiento](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Visualizacion/Alertas_Stock/manual_admin_stock_alerts.md)
* **¿Qué resuelve?**: Consola de reabastecimiento rápido para el administrador que consolida y filtra variantes de productos bajo inventario crítico (Fórmula: Stock $\le$ Umbral).
* **Complejidad**: 🟡 **Media** (Lógica de aplanamiento de variantes y transacciones atómicas).
* **Tecnologías**: `React Framework`, `Framer Motion`, `Fórmulas de Umbral`.
* **Tiempo de Integración**: ~10 minutos.
* **Impacto**: Afecta la consola administrativa y la manipulación de stock en base de datos.

#### 📘 [Motor de Generación de Documentos PDF Premium](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Servicios_y_Firebase/Generacion_PDF/manual_generacion_pdf.md)
* **¿Qué resuelve?**: Servicio dinámico de marca blanca para exportar y descargar reportes de ventas, inventario y facturas de comisiones con firmas en base64.
* **Complejidad**: 🟡 **Media** (Coordenadas vectoriales cartesianas e integración AutoTable).
* **Tecnologías**: `jsPDF Library`, `jsPDF-AutoTable`, `Base64 Image Encoding`.
* **Tiempo de Integración**: ~10 minutos en cualquier app.
* **Impacto**: Afecta la descarga de comprobantes en el panel administrativo.

#### 📘 [Motor de Omnicanalidad y Plantillas Dinámicas de Mensajería](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Servicios_y_Firebase/Omnicanalidad_WhatsApp/manual_whatsapp_notifications.md)
* **¿Qué resuelve?**: Motor de comunicación conversional para WhatsApp y persistencia en tiempo real de notificaciones con parseo automático de variables.
* **Complejidad**: 🟡 **Media** (Deep linking de WhatsApp y sanitización celular internacional).
* **Tecnologías**: `Regex Templating`, `WhatsApp API`, `Firestore Batch updates`.
* **Tiempo de Integración**: ~5 minutos.
* **Impacto**: Afecta la confirmación de checkout y las notificaciones del cliente.

#### 📘 [Motor Financiero Transaccional de Créditos y Saldos](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Servicios_y_Firebase/Creditos_y_Saldos/manual_credits_and_balances.md)
* **¿Qué resuelve?**: Motor transaccional de cobros y abonos parciales blindado contra condiciones de carrera multi-vendedor en Firestore.
* **Complejidad**: 🟡 **Media** (Transacciones concurrentes de Firestore `runTransaction`).
* **Tecnologías**: `Firebase Transactions`, `Cascading state updates`, `Math Guarding`.
* **Tiempo de Integración**: ~15 minutos.
* **Impacto**: Afecta el flujo de cuentas por cobrar en el panel del vendedor.

#### 📘 [Compra Rápida de Productos por Código QR](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Paginas/Compra_por_QR/manual_compra_qr.md)
* **¿Qué resuelve?**: Flujo de redirección por URL parametrizada, inicio de sesión y registro express sin fricciones en el checkout, y generación del QR dinámico del producto en el admin.
* **Complejidad**: 🟡 **Media** (Lógica de autenticación express y paso de query params).
* **Tecnologías**: `React Framework`, `useSearchParams`, `Express User Creation`, `SVG QR Canvas`.
* **Tiempo de Integración**: ~12 minutos.
* **Impacto**: Afecta el catálogo del cliente, el login y la administración de productos en el inventario.

---

## 📐 Leyenda de Clasificación Rápida
* 🟢 **Baja**: Integración directa mediante copia/pega y ajustes de imports.
* 🟡 **Media**: Requiere configuración de stores locales (Zustand) o estados compartidos.
* 🔴 **Alta**: Requiere integraciones complejas con backend (Firebase Firestore, Functions) o flujos transaccionales.
