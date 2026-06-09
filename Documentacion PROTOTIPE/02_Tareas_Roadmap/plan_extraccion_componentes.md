# 🗺️ Plan de Extracción de Componentes Reutilizables a la Biblioteca Core

Este plan describe el proceso metodológico e informativo para extraer, desacoplar y catalogar los 8 componentes y servicios clave identificados en **App Ventas** hacia la biblioteca física de componentes de **PROTOTIPE** (`D:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\`).

---

## 🎯 Criterios de Selección y Prioridades

| Componente / Servicio | Ruta Origen en App Ventas | Carpeta Destino en Biblioteca | Complejidad |
| :--- | :--- | :--- | :--- |
| **1. CurrencyInput** | `src/components/ui/CurrencyInput.jsx` | `/Formularios_y_UI/Input_Moneda_COP/` | Baja |
| **2. ModalTemplate** | `src/components/common/ModalTemplate.jsx` | `/Modales/Modal_Base_Premium/` | Media |
| **3. DatePicker** | `src/components/ui/DatePicker.jsx` | `/Formularios_y_UI/Selector_Fecha/` | Alta |
| **4. ConnectivityToast** | `src/components/ui/ConnectivityToast.jsx` | `/Formularios_y_UI/Alerta_Conectividad_Red/` | Baja |
| **5. QuantitySelector** | `src/components/ui/QuantitySelector.jsx` | `/Formularios_y_UI/Selector_Cantidad/` | Baja |
| **6. pdfService** | `src/services/pdfService.js` | `/Utilidades/Exportador_PDF/` | Media-Alta |
| **7. LeafletMapPicker** | `src/components/ui/LeafletMapPicker.jsx` | `/Formularios_y_UI/Selector_Mapa_Geografico/` | Media-Alta |
| **8. deliveryService** | `src/services/deliveryService.js` | `/Servicios_y_Firebase/Cola_Entregas_Logistica/` | Alta |

---

## 🛠️ Procedimiento de Desacoplamiento (Pautas Técnicas)

### 1. `CurrencyInput.jsx`
*   **Decisión de Aislamiento:** Sin dependencias externas.
*   **Formato de Ficha Técnica:** Se extrae el código React 19 completo con soporte de Tailwind v4 y clases HSL de marca blanca.

### 2. `ModalTemplate.jsx`
*   **Decisión de Aislamiento:** Requiere que el bundle de destino cuente con `framer-motion` instalado.
*   **Scroll Lock:** El hook de bloqueo de scroll (`useEffect` sobre `document.body`) se integra de forma limpia dentro de la ficha técnica.

### 3. `DatePicker.jsx`
*   **Decisión de Aislamiento:** Sin librerías externas. La lógica de generación del grid mensual y cambio de idioma (español) queda autocontenida.

### 4. `ConnectivityToast.jsx`
*   **Decisión de Aislamiento:** Utiliza variables del sistema de notificaciones global. Se desacopla en un banner de advertencia autónomo.

### 5. `QuantitySelector.jsx`
*   **Decisión de Aislamiento:** Desacoplado 100% de la lógica de variantes de productos para operar como un contador agnóstico controlado por el padre.

### 6. `pdfService.js`
*   **Decisión de Aislamiento:** Carga diferida mediante `import('jspdf')` e `import('jspdf-autotable')`.
*   **Refactorización:** Reemplazar campos locales de venta de calzado ("Talla", "Color") y membretes de marca ("Smart Fix") por un payload dinámico (`invoiceData` e `invoiceHeaders`).

### 7. `LeafletMapPicker.jsx`
*   **Decisión de Aislamiento:** Carga de scripts de Leaflet y CSS dinámico en tiempo de ejecución.

### 8. `deliveryService.js`
*   **Decisión de Aislamiento:** Conexión con Firestore. Las rutas de la colección se parametrizan en constantes.

---

## 📈 Trazabilidad del Roadmap
Este plan documenta de forma informativa los pasos de extracción. Toda tarea futura de migración física utilizando la skill `@extraer-componente` o la portabilidad `@portar-componente` deberá seguir este mapa de referencias.
