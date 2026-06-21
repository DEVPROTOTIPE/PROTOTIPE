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
  const numVal = parseInt(value, 10) || 0;

  const handleDecrement = () => {
    if (numVal > min) {
      onChange(numVal - 1);
    }
  };

  const handleIncrement = () => {
    if (numVal < max) {
      onChange(numVal + 1);
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
        disabled={numVal <= min}
        className={`${btnSize} rounded-full flex items-center justify-center text-[var(--color-text)] bg-[var(--color-surface)] shadow-sm hover:bg-[var(--color-surface-2)] transition-transform active:scale-90 disabled:opacity-40`}
        aria-label="Disminuir cantidad"
      >
        <Minus size={iconSize} />
      </button>
      
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          onChange(isNaN(val) ? '' : val);
        }}
        onBlur={() => {
          const val = parseInt(value, 10);
          if (isNaN(val) || val < min) {
            onChange(min);
          } else if (val > max) {
            onChange(max);
          }
        }}
        className={`w-10 text-center font-bold text-[var(--color-text)] bg-transparent outline-none focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${fontSize}`}
      />
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={numVal >= max}
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
