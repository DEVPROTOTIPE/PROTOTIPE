# 📑 Guía de Estilos de UI y Sistema de Diseño — App Ventas

Este documento establece el sistema de diseño visual, variables de estilo y patrones de maquetación para la interfaz del Core **App Ventas**.

---

## 1. SISTEMA DE COLORES CROMÁTICOS (HSL / Tailwind CSS)
La aplicación utiliza variables semánticas HSL mapeadas dinámicamente según la marca del cliente. El stylesheet global (`index.css`) requiere las siguientes variables de referencia:

```css
:root {
  /* Paleta Primaria Cromática */
  --color-primary: 215 90% 50%;         /* Azul vibrante principal */
  --color-secondary: 160 84% 39%;       /* Verde semántico de éxito */
  --color-accent: 25 95% 53%;           /* Naranja de alerta / llamadas de acción */

  /* Neutros e Interfaz (Light Mode) */
  --color-bg: 0 0% 98%;
  --color-surface: 0 0% 100%;           /* Tarjetas y modales (blanco puro) */
  --color-surface-2: 210 20% 96%;
  --color-surface-3: 210 20% 90%;       /* Para estados deshabilitados (disabled) */
  --color-border: 210 16% 92%;          /* Bordes minimalistas claros */
  --color-text: 220 15% 10%;
  --color-text-muted: 220 10% 45%;
}

.dark {
  /* Neutros e Interfaz (Dark Mode) */
  --color-bg: 222 47% 6%;
  --color-surface: 223 47% 11%;
  --color-surface-2: 223 47% 16%;
  --color-surface-3: 223 47% 20%;       /* Estados deshabilitados oscuros */
  --color-border: 223 47% 18%;
  --color-text: 210 40% 98%;
  --color-text-muted: 215 20% 65%;
}
```

---

## 2. COMPONENTES ATÓMICOS OBLIGATORIOS (UI Library)
- **`CustomSelect.jsx` (`/src/components/ui/CustomSelect.jsx`):** Selector interactivo que sustituye el selector nativo de HTML. Recibe un array de opciones `{ value, label }` y retorna el valor seleccionado directo en el handler `onChange`.
- **Alertas de Confirmación (`useAlertConfirm`):** Hook global para solicitar confirmación del usuario en flujos críticos (eliminaciones, cancelaciones de turnos, cancelaciones de facturas) con variante de color semántica adecuada (warning / error).
- **Layout de 2 Columnas responsivo:**
  - Panel izquierdo (Sidebar - col-span-3 o col-span-4 en pantallas grandes, ocultable mediante toggler en móvil).
  - Panel derecho (Detalle/Área de trabajo - col-span-9 o col-span-8).

---

## 3. CONVENCIONES DE MAQUETACIÓN PREMIUM
- **Micro-animaciones:** Uso obligatorio de transiciones en hover (`transition-all duration-200 ease-in-out`) en botones y tarjetas de navegación rápida.
- **Glassmorphism:** Combinar fondos semi-transparentes (`bg-[var(--color-surface)]/80 backdrop-blur-md`) con bordes minimalistas de baja opacidad para paneles flotantes.
