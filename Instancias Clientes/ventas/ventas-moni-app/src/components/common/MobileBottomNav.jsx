import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

/**
 * Barra de navegación inferior móvil compartida (cliente + admin).
 *
 * Diseño "vidrio flotante": la barra no toca los bordes de la pantalla
 * (margen + esquinas redondeadas completas), con blur real
 * (`backdrop-blur-xl`) y una línea de brillo superior sutil — dirección
 * de estilo validada con la skill ui-ux-pro-max (`--domain style
 * "glassmorphism"` → blur 10-20px, translúcido 15-30%; patrón "Liquid
 * Glass" → vidrio fluido, blur animado). La paleta de color NO se tocó:
 * sigue usando las variables de tema del tenant (--color-primary, etc.),
 * ya que cada tienda tiene su propia marca — la skill sugería una paleta
 * genérica de ejemplo que no aplica aquí.
 *
 * Interacciones (ver `references/quick-reference.md` de la skill):
 * - Burbuja activa: píldora centrada de forma confiable (transform
 *   top/left 50% + translate -50%/-50%), no el truco `inset-0` +
 *   ancho/alto fijo que se usaba antes — ese truco solo centra
 *   horizontalmente y ancla arriba verticalmente, por eso no cubría la
 *   etiqueta (bug real reportado y corregido).
 * - Slot central (Catálogo / Vender): mismo ritmo icono+etiqueta que los
 *   demás botones, sin caja/chip de fondo (un marco propio empujaba la
 *   etiqueta hacia abajo y desalineaba la fila con el resto de tabs) —
 *   se distingue por tamaño de ícono, color primario y una sombra/escala
 *   que se intensifica cuando la ruta está activa, sin elevación por
 *   encima de la barra.
 * - Botón de menú: el ícono de hamburguesa rota/cruza a una X al abrir la
 *   hoja de desborde (micro-interacción estándar, antes inexistente).
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
      <div className="flex md:hidden fixed bottom-0 left-0 right-0 z-30 px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] pointer-events-none">
        <nav
          className="pointer-events-auto flex items-center w-full min-h-[4rem] h-auto bg-surface/80 backdrop-blur-xl rounded-[28px] shadow-[0_10px_35px_rgba(0,0,0,0.15)] px-2 relative overflow-hidden"
          aria-label="Navegación inferior"
        >
          {/* Línea de brillo superior (borde de vidrio) — neutra, no el color primario del tema */}
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {items.map((item, idx) => {
            const Icon = item.icon
            const key = item.path || item.label || idx

            if (item.type === 'fab') {
              return (
                <div key={key} className="flex-1 flex flex-col items-center justify-center gap-1 relative">
                  <NavLink to={item.path} aria-label={item.label} className="group flex flex-col items-center justify-center gap-1 w-full">
                    {({ isActive }) => (
                      <>
                        {/* Sin marco/chip de fondo: mismo ritmo icono+etiqueta que los demás
                            botones (así no empuja la etiqueta hacia abajo ni desalinea la fila).
                            La distinción viene del tamaño/color/animación del ícono, no de una caja. */}
                        <motion.div
                          animate={{ y: isActive ? -2 : 0, scale: isActive ? 1.1 : 1 }}
                          whileTap={{ scale: 0.88 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          className="relative z-10"
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          {/* Halo — absoluto y decorativo, no ocupa espacio de layout ni desalinea la fila */}
                          <motion.div
                            aria-hidden="true"
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full pointer-events-none z-0 blur-[4px]"
                            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.65, 0.3] }}
                            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                              background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 55%, transparent) 0%, color-mix(in srgb, var(--color-primary) 15%, transparent) 65%, transparent 80%)'
                            }}
                          />
                          <Icon
                            size={24}
                            strokeWidth={isActive ? 2.6 : 2.2}
                            className="text-primary relative z-10 transition-[filter] duration-150 group-active:brightness-125 group-active:saturate-150"
                            style={{
                              filter: isActive
                                ? 'drop-shadow(0 3px 8px color-mix(in srgb, var(--color-primary) 55%, transparent))'
                                : 'drop-shadow(0 2px 5px color-mix(in srgb, var(--color-primary) 30%, transparent))'
                            }}
                          />
                          {item.badge > 0 && (
                            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center z-10">
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                        <span className={`text-[10px] font-medium relative z-10 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-muted'}`}>
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                </div>
              )
            }

            if (item.type === 'action') {
              return (
                <button
                  key={key}
                  onClick={item.onClick}
                  aria-label={item.label}
                  className="group flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 relative text-muted hover:text-app active:scale-95 active:text-primary"
                >
                  <div className="relative">
                    <motion.div
                      animate={item.badge > 0 ? { rotate: [0, -12, 12, -8, 8, 0], scale: [1, 1.12, 1] } : {}}
                      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
                    >
                      <Icon size={20} aria-hidden="true" className="transition-[filter] duration-150 group-active:brightness-125 group-active:saturate-150" />
                    </motion.div>
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
                  `group flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-300 relative active:scale-95 ${
                    isActive ? 'text-primary' : 'text-muted hover:text-app active:text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId={indicatorId}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-12 bg-primary/15 rounded-2xl"
                        transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
                      />
                    )}
                    <motion.div
                      animate={{ y: isActive ? -2 : 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="relative z-10"
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" className="transition-[filter] duration-150 group-active:brightness-125 group-active:saturate-150" />
                    </motion.div>
                    <span className="text-[10px] font-medium relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}

          {overflowItems.length > 0 && (
            <button
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label="Más opciones"
              aria-expanded={isMenuOpen}
              className={`group flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-300 relative active:scale-95 ${
                isMenuOpen ? 'text-primary' : 'text-muted hover:text-app active:text-primary'
              }`}
            >
              {isMenuOpen && (
                <motion.div
                  layoutId={indicatorId}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-12 bg-primary/15 rounded-2xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
                />
              )}
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="relative z-10 transition-[filter] duration-150 group-active:brightness-125 group-active:saturate-150"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMenuOpen ? (
                    <motion.div key="x" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
                      <X size={20} aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.15 }}>
                      <Menu size={20} aria-hidden="true" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <span className="text-[10px] font-medium relative z-10">Menú</span>
            </button>
          )}
        </nav>
      </div>

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
