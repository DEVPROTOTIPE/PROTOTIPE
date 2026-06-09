# Selector de Cantidad (QuantitySelector)

Componente atómico para el ajuste e incremento/decremento de cantidades de artículos con soporte de límites mínimos y máximos, estados deshabilitados y consumo de variables HSL.

---

## 1. Propósito y Casos de Uso
* **Control Fino:** Evita que el usuario seleccione una cantidad menor que el mínimo o mayor que el stock límite/máximo.
* **Consistencia Visual:** Diseño en píldora con botones redondos flotantes y feedback visual de escala activa (`active:scale-90`).
* **Casos de Uso:**
  * Selector de cantidad en carritos de compra y drawers.
  * Ajustes de stock en paneles de administración.

---

## 2. Especificación Visual (Tailwind CSS HSL)
* **Diseño en Píldora:** Contenedor redondeado (`rounded-full`) con bordes sutiles y botones concéntricos.
* **Tamaños Parametrizados:** Soporta variante pequeña (`size="sm"`) e intermedia (`size="md"`).

---

## 3. Props y API del Componente
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `value` | `number` | - | Cantidad numérica actual. |
| `onChange` | `function` | - | Callback invocado al cambiar la cantidad. |
| `min` | `number` | `1` | Límite mínimo de selección. |
| `max` | `number` | `10` | Límite máximo de selección. |
| `size` | `string` | `"md"` | Tamaño de presentación: `"sm" \| "md"`. |
| `className` | `string` | `""` | Clases Tailwind adicionales. |

---

## 4. Código React Fuente Completo (`QuantitySelector.jsx`)
```jsx
import React from 'react';
import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({ 
  value, 
  onChange, 
  min = 1, 
  max = 10, 
  size = 'md',
  className = '' 
}) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const isSm = size === 'sm';
  const containerHeight = isSm ? 'h-11' : 'h-14';
  const btnSize = isSm ? 'w-8 h-8' : 'w-11 h-11';
  const fontSize = isSm ? 'text-sm' : 'text-base';
  const iconSize = isSm ? 13 : 16;

  return (
    <div className={`flex items-center bg-[var(--color-surface-2)] rounded-full p-1 border border-[var(--color-border)] shrink-0 ${containerHeight} ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={`${btnSize} rounded-full flex items-center justify-center text-[var(--color-text)] bg-[var(--color-surface)] shadow-sm hover:bg-[var(--color-surface-2)] transition-transform active:scale-90 disabled:opacity-40`}
        aria-label="Disminuir cantidad"
      >
        <Minus size={iconSize} />
      </button>
      
      <span className={`w-8 text-center font-bold text-[var(--color-text)] select-none ${fontSize}`}>
        {value}
      </span>
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={`${btnSize} rounded-full flex items-center justify-center text-[var(--color-text)] bg-[var(--color-surface)] shadow-sm hover:bg-[var(--color-surface-2)] transition-transform active:scale-90 disabled:opacity-40`}
        aria-label="Aumentar cantidad"
      >
        <Plus size={iconSize} />
      </button>
    </div>
  );
}
```

---

## 5. Origen
* **Extraído de:** `src/components/ui/QuantitySelector.jsx`
* **Fecha de extracción:** 2026-06-06
* **Versión:** 1.0 (Refactorizado con HSL variables).
