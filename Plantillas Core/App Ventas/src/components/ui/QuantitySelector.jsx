import { Minus, Plus } from 'lucide-react'

/**
 * @typedef {Object} QuantitySelectorProps
 * @property {number} value - Cantidad numérica actual seleccionada.
 * @property {(value: number) => void} onChange - Callback que recibe el nuevo valor numérico al cambiar.
 * @property {number} [min] - Límite mínimo de cantidad seleccionable. Por defecto 1.
 * @property {number} [max] - Límite máximo de cantidad seleccionable. Por defecto 10.
 * @property {'sm' | 'md'} [size] - Escala de tamaño visual del componente. Por defecto 'md'.
 * @property {string} [className] - Clases de Tailwind adicionales.
 */

/**
 * Componente atómico para la selección y ajuste de cantidades.
 * Garantiza consistencia en comportamiento, bordes, estados deshabilitados y transiciones.
 * @param {QuantitySelectorProps} props
 */
export default function QuantitySelector({ 
  value, 
  onChange, 
  min = 1, 
  max = 10, 
  size = 'md',
  className = '' 
}) {
  // Validación de tipos y sanidad en tiempo de desarrollo para evitar datos corruptos
  if (process.env.NODE_ENV !== 'production') {
    if (typeof value !== 'number') {
      console.error(`[QuantitySelector Error] 'value' debe ser un número. Recibido: ${typeof value}`);
    }
    if (typeof onChange !== 'function') {
      console.error(`[QuantitySelector Error] 'onChange' debe ser una función. Recibido: ${typeof onChange}`);
    }
    if (value < min || value > max) {
      console.warn(`[QuantitySelector Warn] 'value' (${value}) se encuentra fuera del rango establecido [${min}, ${max}].`);
    }
  }
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const isSm = size === 'sm'
  const containerHeight = isSm ? 'h-11' : 'h-14'
  const btnSize = isSm ? 'w-8 h-8' : 'w-11 h-11'
  const fontSize = isSm ? 'text-sm' : 'text-base'
  const iconSize = isSm ? 13 : 16

  return (
    <div className={`flex items-center bg-surface-2 rounded-full p-1 border border-app shrink-0 ${containerHeight} ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={`${btnSize} rounded-full flex items-center justify-center text-app bg-surface shadow-sm hover:bg-surface-2 transition-transform active:scale-90 disabled:opacity-40`}
        aria-label="Disminuir cantidad"
      >
        <Minus size={iconSize} />
      </button>
      
      <span className={`w-8 text-center font-bold text-app select-none ${fontSize}`}>
        {value}
      </span>
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={`${btnSize} rounded-full flex items-center justify-center text-app bg-surface shadow-sm hover:bg-surface-2 transition-transform active:scale-90 disabled:opacity-40`}
        aria-label="Aumentar cantidad"
      >
        <Plus size={iconSize} />
      </button>
    </div>
  )
}
