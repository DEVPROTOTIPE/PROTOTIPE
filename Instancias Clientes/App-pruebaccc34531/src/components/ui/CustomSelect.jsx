import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * CustomSelect - Componente atómico y stateless para listas desplegables animadas premium.
 * 
 * @param {string|number} value - Valor seleccionado actualmente
 * @param {function} onChange - Callback invocado al seleccionar una opción: (val) => void
 * @param {Array<{value: any, label: string}>} options - Lista de opciones a desplegar
 * @param {string} placeholder - Texto a mostrar cuando no hay selección activa
 * @param {string} className - Clases de estilo Tailwind CSS adicionales para el botón disparador
 */
export default function CustomSelect({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Selecciona una opción...',
  className = ''
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div className="relative w-full" style={{ zIndex: open ? 50 : 'auto' }}>
      {/* Botón Disparador */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full h-11 pl-4 pr-10 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer flex items-center justify-between relative ${className}`}
        style={{ borderColor: open ? 'var(--color-primary)' : undefined }}
      >
        <span className={selected ? 'text-app font-medium' : 'text-muted'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`absolute right-3 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          {/* Ícono Chevron Down SVG Nativo (Evita dependencias rígidas de iconos externos) */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </span>
      </button>

      {/* Menú Animado Flotante */}
      <AnimatePresence>
        {open && (
          <>
            {/* Tap-shield para capturar clics exteriores y cerrar */}
            <div 
              className="fixed inset-0 bg-transparent cursor-default" 
              style={{ zIndex: 48 }} 
              onClick={() => setOpen(false)} 
            />
            
            {/* Lista Desplegable */}
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="absolute left-0 right-0 mt-1.5 rounded-xl border border-app overflow-hidden shadow-xl"
              style={{ zIndex: 49, background: 'var(--color-surface)' }}
            >
              {/* Opción vacía por defecto si se requiere deseleccionar */}
              {placeholder && (
                <button
                  type="button"
                  onClick={() => { onChange(''); setOpen(false) }}
                  className="w-full px-4 py-2.5 text-left text-sm text-muted hover:bg-surface-2 transition-colors border-b border-app/5"
                >
                  {placeholder}
                </button>
              )}
              
              {/* Opciones mapeadas */}
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between
                    ${opt.value === value
                      ? 'bg-primary text-[var(--color-text)] font-bold'
                      : 'text-app hover:bg-surface-2'
                    }
                  `}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && (
                    /* Check SVG Nativo */
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-[var(--color-text)]"
                    >
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}