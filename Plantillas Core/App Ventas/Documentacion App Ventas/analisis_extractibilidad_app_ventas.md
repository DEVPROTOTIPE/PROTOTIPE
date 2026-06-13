# 📋 Reporte de Análisis de Extractibilidad — App Ventas a la Biblioteca Core PROTOTIPE

Este reporte evalúa la viabilidad y conveniencia técnica de extraer componentes, hooks y servicios de la base de código de **App Ventas** hacia la biblioteca compartida central de **PROTOTIPE**. El objetivo principal es consolidar un núcleo de utilidades portátiles, de marca blanca e inyectables en variables HSL, evitando que lógicas específicas del negocio de ventas de calzado/ropa contaminen el núcleo común.

---

## 🎯 Resumen Ejecutivo de la Auditoría

Tras auditar minuciosamente las rutas `/src/components`, `/src/hooks` y `/src/services` de App Ventas, se clasifica cada candidato según su nivel de acoplamiento al dominio del negocio.

*   **Mapeo General:** Se identificaron **14 componentes/servicios genéricos** aptos para extracción inmediata (con parametrización menor).
*   **Aislamiento de Negocio (Sharding Lógico):** Se catalogaron **6 componentes/hooks de extracción prohibida** debido a su alto acoplamiento con la estructura de variantes físicas (tallas de zapato, colores, y reglas de distribución de calzado).
*   **Enfoque de Biblioteca:** Todo componente extraído debe cumplir con el **Estándar de Diseño Premium** (soporte HSL, sin colores duros, layouts responsivos móviles y micro-animaciones elásticas).

---

## 🚀 Candidatos Priorizados para Extracción (Orden de Importancia)

A continuación se detallan los candidatos en orden de valor e importancia de cara al ecosistema multitenant (ej. POS para restaurantes, barberías, ferreterías, etc.):

| # | Nombre Técnico / Ruta del Archivo | Tipo | Score (1-10) | Rol e Impacto Arquitectónico |
|---|----------------------------------|------|--------------|------------------------------|
| 1 | `src/components/ui/CurrencyInput.jsx` | Componente | **10 / 10** | **Máscara monetaria reactiva:** Sanitiza caracteres no numéricos e inyecta formato COP/monetario local en caliente. Imprescindible para cualquier POS o formulario de transacciones. |
| 2 | `src/components/common/ModalTemplate.jsx` | Componente | **10 / 10** | **Modal Base Premium:** Resuelve de forma agnóstica la maquetación responsiva, el bloqueo de scroll del cuerpo (*scroll lock*), micro-animaciones con `framer-motion` y React Portals. |
| 3 | `src/components/ui/DatePicker.jsx` | Componente | **10 / 10** | **Calendario Premium:** Selector de fecha encapsulado en un portal que previene el desbordamiento de contenedores modal. |
| 4 | `src/components/ui/ConnectivityToast.jsx` | Componente | **10 / 10** | **Monitoreo de Red:** Avisa al usuario instantáneamente sobre la pérdida/recuperación de conexión a internet. Vital para el comportamiento PWA fuera de línea. |
| 5 | `src/components/ui/QuantitySelector.jsx` | Componente | **10 / 10** | **Selector Numérico:** Incrementa/decrementa cantidades controladas con límites mínimos y máximos. 100% libre de lógica de negocio. |
| 6 | `src/components/ui/CustomSelect.jsx` | Componente | **9.5 / 10** | **Dropdown Desplegable:** Selector premium alternativo que soporta `dropUp` para abrir hacia arriba en áreas inferiores del viewport. |
| 7 | `src/components/ui/EmptyState.jsx` | Componente | **9.5 / 10** | **Lienzo de Vacío:** Pantalla con animaciones elásticas para listas, tablas o carritos vacíos con Call To Action dinámico. |
| 8 | `src/services/pdfService.js` | Servicio | **9.0 / 10** | **Generación de Reportes PDF:** Abstracción de `jsPDF` con carga dinámica (lazy-load) para no inflar el bundle inicial. Requiere desacoplar el membrete del negocio y pasar campos dinámicos. |
| 9 | `src/components/ui/LeafletMapPicker.jsx` | Componente | **8.5 / 10** | **Selector Geográfico:** Renderiza un mapa interactivo cargando Leaflet y Nominatim de forma diferida en tiempo de ejecución. |
| 10 | `src/services/deliveryService.js` | Servicio | **8.5 / 10** | **Motor Logístico de Entregas:** Administra cola de despachos, asignaciones a motorizados (empleados o externos), historial de estados y analíticas. |
| 11 | `src/hooks/usePWAInstall.js` | Hook | **8.0 / 10** | **Prompt de Instalación:** Captura el evento nativo del navegador, expone el estado y persiste en local storage si el usuario rechaza. |
| 12 | `src/services/accessLogService.js` | Servicio | **8.0 / 10** | **Telemetría de Auditoría:** Historial de inicios/cierres de sesión de empleados y estadísticas de accesos activos. |
| 13 | `src/hooks/useAuthInit.js` | Hook | **7.5 / 10** | **Inicializador de Sesiones Híbridas:** Maneja la bifurcación de clientes en LocalStorage contra administradores en Firebase Auth. |
| 14 | `src/services/notificationCenterService.js` | Servicio | **7.0 / 10** | **Centro de Notificaciones:** Registro de tokens FCM (Cloud Messaging) y mapeo de subida de alertas. Requiere independizar variables de Firebase. |

---

## 📌 Categorización de Componentes y Reglas de Decisión

### 🟢 MANDATORY EXTRACTION (Sí o sí, SÍ se deben extraer)

Componentes puramente atómicos o lógicos, sin dependencias con el modelo de negocio, diseñados para inyectar consistencia visual y de experiencia de usuario en todos los desarrollos.

#### 1. `CurrencyInput.jsx` (Componente UI)
*   **Funcionalidad:** Entrada controlada que fuerza formato de pesos en vivo e inyecta números limpios al state del padre.
*   **Justificación Técnica:** Complejidad baja. No tiene dependencias externas más allá de los helpers de React. Evita que los usuarios ingresen texto o símbolos extraños, previniendo crashes en esquemas Zod o en base de datos.
*   **Pauta de Portabilidad:** Exportar directo a `/Formularios_y_UI/Input_Moneda_COP/`.

#### 2. `ModalTemplate.jsx` (Componente de Maquetación)
*   **Funcionalidad:** Ventana modal premium con cabecera opcional, pies adhesivos (*sticky footer*) y zona central scrolleable.
*   **Justificación Técnica:** Complejidad media. Resuelve el *clipping* del DOM local montándose sobre el `body` a través de un Portal de React. Bloquea el scroll de fondo y gestiona la animación de salida con `AnimatePresence`.
*   **Pauta de Portabilidad:** Exportar directo a `/Modales/Modal_Base/`.

#### 3. `DatePicker.jsx` (Componente UI)
*   **Funcionalidad:** Calendario interactivo en español. Viene en dos sabores: modal puro (`DatePickerPortal`) e input autocontenido (`DatePicker`).
*   **Justificación Técnica:** Complejidad alta. Controla la lógica de días de la semana y cálculo de celdas en JS sin utilizar librerías pesadas como Moment o date-fns. Totalmente desacoplado.
*   **Pauta de Portabilidad:** Exportar directo a `/Formularios_y_UI/Selector_Fecha/`.

#### 4. `ConnectivityToast.jsx` (Componente UI)
*   **Funcionalidad:** Monitorea de forma reactiva la red mediante listeners `online`/`offline` expuestos por el navegador.
*   **Justificación Técnica:** Complejidad baja. Ayuda a alertar sobre caídas de red en PWAs.
*   **Pauta de Portabilidad:** Exportar directo a `/Formularios_y_UI/Alerta_Conectividad_Red/`.

#### 5. `pdfService.js` (Servicio de Sistema)
*   **Funcionalidad:** Crea recibos, comprobantes o listados en PDF y los descarga en el cliente.
*   **Justificación Técnica:** Complejidad media-alta. Usa importaciones dinámicas (`await import('jspdf')`) para mitigar el impacto en el bundle inicial de Vite.
*   **Refactorización Obligatoria:** Quitar referencias estáticas al negocio (ej. "Smart Fix", "Régimen simplificado", o columnas de "Talla/Color") y reemplazarlas por un objeto de configuración inyectable en la llamada.
*   **Pauta de Portabilidad:** Exportar a `/Utilidades/Exportador_PDF/`.

#### 6. `deliveryService.js` (Servicio Logístico)
*   **Funcionalidad:** API del cliente Firebase para la gestión de envíos y domiciliarios.
*   **Justificación Técnica:** Complejidad media-alta. Provee una estructura general de base de datos para registrar transacciones y bitácoras de cambios de estado logístico. Se adapta a cualquier tipo de despacho local (comida, abarrotes, ropa).
*   **Pauta de Portabilidad:** Crear subcarpeta `/Servicios_y_Firebase/Cola_Entregas_Logistica/`.

---

### 🔴 FORBIDDEN EXTRACTION (Sí o sí, NO se deben extraer)

Componentes, hooks o layouts altamente acoplados al modelo comercial minorista de ropa y calzado, cuyas reglas de datos inflarían el núcleo común de forma innecesaria o tosca.

#### 1. `ProductFormModal.jsx` (Componente Admin)
*   **Razón del Rechazo:** Este wizard en 5 pasos contiene variables restrictivas específicas de prendas físicas:
    *   **Catálogo de tallas:** `XS, S, M, L, XL` para ropa y `35, 36, 37, 38` para calzado.
    *   **Selector de Colores:** Mapea una paleta de colores predefinidos con códigos hexadecimales concretos.
    *   **Matriz de Variantes:** Genera combinaciones bidimensionales (Talla - Color - SKU - Foto - Stock).
    *   *Alternativa:* Mantenerlo local en la vertical de retail. En verticales de servicios o comida, se debe implementar un formulario agnóstico simplificado basado en el objeto dinámico `atributos`.

#### 2. `useInventory.js` (Hook de Datos)
*   **Razón del Rechazo:** Administra el estado y suscripciones de la colección `products` filtrando específicamente por variantes, disponibilidad física de tallas y pre-carga el carrusel de imágenes del catálogo de ropa.

#### 3. `useWholesale.js` (Hook de Negocio)
*   **Razón del Rechazo:** Computa el precio al por mayor (B2B) si el total de ítems supera el mínimo configurado por el minorista. Esta lógica es muy de distribución de inventarios físicos y no aplica a nichos de servicios (ej. barberías, talleres).

#### 4. `ClientFilterModal.jsx` (Componente Cliente)
*   **Razón del Rechazo:** Contiene chips visuales y deslizadores para filtrar específicamente por Tallas de calzado, Tallas de ropa, Género (Hombre, Mujer, Unisex, Infantil) y marcas de distribución.

#### 5. `CheckoutModal.jsx` (Componente Cliente)
*   **Razón del Rechazo:** El flujo está condicionado por el sistema de abonos a deudas físicas de clientes fijos (créditos fiados de zapatería), envío de coordenadas a WhatsApp de despachador y validación de combos.
*   *Alternativa:* Extraer únicamente la lógica en un custom hook sin interfaz (`useCheckout.js`), pero la UI debe permanecer local en la aplicación cliente.

---

## 🛠️ Plan de Refactorización y Portabilidad Recomendado

Para realizar la migración sin romper la compilación de **App Ventas**, se propone el siguiente flujo paso a paso:

1.  **Aislamiento en Biblioteca:** Documentar formalmente cada componente mandatory en `/06_Biblioteca_Componentes/` usando el estándar visual HSL (marca blanca pura).
2.  **Preparación de Parámetros:** Refactorizar servicios pesados como `pdfService.js` en la biblioteca para que acepte variables parametrizadas (`title`, `headers`, `rows`, `themeColor`).
3.  **Portabilidad síncrona:** Inyectar los componentes desde la biblioteca hacia la carpeta `/src/components/ui/` o `/src/components/common/` usando el script `@portar-componente`, validando la compatibilidad de iconos (Lucide React) y estilos de Tailwind CSS.
4.  **Pruebas de Compilación:** Ejecutar `npm run build` en cada paso para asegurar que el reempaquetado de Vite no rompa la aplicación principal.
