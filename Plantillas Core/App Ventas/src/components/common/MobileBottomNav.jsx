import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

/**
 * Barra de navegación inferior móvil compartida (cliente + admin).
 *
 * Patrón basado en el componente ya validado de la biblioteca de
 * componentes (AnimatedNavbarMobileSandbox.jsx en dev-dashboard): burbuja
 * elástica con spring physics para el tab activo, feedback de presión
 * (active:scale-95), ícono + etiqueta siempre visibles. Extendido aquí con
 * un slot central elevado (FAB) opcional y un menú de desborde (hamburguesa)
 * para cuando hay más funciones activas de las que caben — siguiendo la
 * pauta `overflow-menu`/`bottom-nav-limit` (máx. 5 ítems visibles) en vez de
 * amontonar todas las features activas en la misma barra.
 *
 * @param {Array} items - Hasta 4 ítems fijos. Cada uno:
 *   { type: 'link', path, icon, label } — NavLink normal.
 *   { type: 'action', onClick, icon, label, badge? } — botón (ej. abrir modal).
 *   { type: 'fab', path, icon, label, badge? } — elevado, centro visual.
 * @param {Array} overflowItems - Ítems adicionales { path, icon, label } que
 *   aparecen en la hoja del menú hamburguesa (features activas que no
 *   tienen un slot fijo asignado).
 * @param {string} indicatorId - layoutId único de framer-motion para la
 *   burbuja activa (debe diferir entre instancias cliente/admin en la misma
 *   página si alguna vez coexistieran).
 */
export default function MobileBottomNav({ items = [], overflowItems = [], indicatorId = 'mobile-nav-bubble' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleOverflowClick = (path) => {
    setIsMenuOpen(false)
    navigate(path)
  }

  return (
    <>
      <nav
        className="flex md:hidden fixed bottom-0 left-0 right-0 min-h-[4rem] h-auto bg-surface border-t border-app z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 safe-area-bottom"
        aria-label="Navegación inferior"
      >
        {items.map((item, idx) => {
          const Icon = item.icon
          const key = item.path || item.label || idx

          if (item.type === 'fab') {
            return (
              <div key={key} className="flex-1 flex flex-col items-center justify-start relative">
                <div className="flex flex-col items-center justify-center -translate-y-3 relative">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute w-16 h-16 rounded-full pointer-events-none z-0 blur-[2px]"
                    style={{
                      background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 55%, transparent) 0%, color-mix(in srgb, var(--color-primary) 20%, transparent) 60%, transparent 80%)'
                    }}
                  />
                  <NavLink to={item.path} aria-label={item.label} className="z-10">
                    <motion.div
                      whileTap={{ scale: 0.94 }}
                      className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center border-4 border-surface relative overflow-visible select-none shadow-[0_6px_16px_rgba(0,0,0,0.15)]"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <Icon size={28} className="text-white" />
                      {item.badge > 0 && (
                        <span className="absolute -top-[6px] -right-[6px] bg-red-500 text-white text-[14px] font-black rounded-full w-7 h-7 flex items-center justify-center border-2 border-surface shadow-md z-20">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  </NavLink>
                </div>
              </div>
            )
          }

          if (item.type === 'action') {
            return (
              <button
                key={key}
                onClick={item.onClick}
                aria-label={item.label}
                className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 relative text-muted hover:text-app active:scale-95"
              >
                <div className="relative">
                  <Icon size={20} aria-hidden="true" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            )
          }

          return (
            <NavLink
              key={key}
              to={item.path}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 relative active:scale-95 ${
                  isActive ? 'text-primary' : 'text-muted hover:text-app'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId={indicatorId}
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
                    />
                  )}
                  <Icon size={20} aria-hidden="true" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}

        {overflowItems.length > 0 && (
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Más opciones"
            aria-expanded={isMenuOpen}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 text-muted hover:text-app active:scale-95"
          >
            <Menu size={20} aria-hidden="true" />
            <span className="text-[10px] font-medium">Menú</span>
          </button>
        )}
      </nav>

      {/* Hoja de desborde (overflow-menu): features activas sin slot fijo */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex items-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-surface rounded-t-3xl border-t border-app shadow-2xl pb-safe-bottom max-h-[70vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-app sticky top-0 bg-surface">
                <h3 className="text-sm font-bold text-app">Más opciones</h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full bg-surface-2 hover:bg-surface-3 text-muted"
                  aria-label="Cerrar menú"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 p-4">
                {overflowItems.map(({ path, icon: Icon, label }) => (
                  <button
                    key={path}
                    onClick={() => handleOverflowClick(path)}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-2 hover:bg-surface-3 active:scale-95 transition-all text-app"
                  >
                    <Icon size={22} />
                    <span className="text-[11px] font-semibold text-center leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
