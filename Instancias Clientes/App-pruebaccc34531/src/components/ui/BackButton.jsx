import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/**
 * @typedef {Object} BackButtonProps
 * @property {string} [to] - Ruta de redirección específica (ej: '/catalogo') si no se desea el historial por defecto.
 * @property {() => void} [onClick] - Callback personalizado al presionar el botón (prevalece sobre 'to').
 * @property {string} [className] - Clases adicionales de Tailwind CSS para posicionamiento o overrides.
 */

/**
 * Componente atómico de navegación para ir atrás.
 * Garantiza consistencia visual y de comportamiento en toda la aplicación.
 * @param {BackButtonProps} props
 */
export default function BackButton({ to, onClick, className = '' }) {
  // Validación de props en modo de desarrollo para blindar ante fallas de integración
  if (process.env.NODE_ENV !== 'production') {
    if (to && typeof to !== 'string') {
      console.warn(`[BackButton Warn] La propiedad 'to' debe ser una cadena de texto (string). Recibido: ${typeof to}`);
    }
    if (onClick && typeof onClick !== 'function') {
      console.error(`[BackButton Error] La propiedad 'onClick' debe ser una función. Recibido: ${typeof onClick}`);
    }
  }

  const navigate = useNavigate()

  const handleBack = () => {
    if (onClick) {
      onClick()
    } else if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`w-10 h-10 rounded-2xl bg-surface hover:bg-surface-2 border border-app flex items-center justify-center text-app active:scale-95 transition-all shadow-sm ${className}`}
      aria-label="Regresar a la página anterior"
    >
      <ArrowLeft size={18} />
    </button>
  )
}
