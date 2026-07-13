import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Heart, Package, CreditCard, User, Tag, X, Bell } from 'lucide-react'
import useAppConfigStore from '../store/appConfigStore'
import catalog from '../core/generated/feature-catalog.generated.json'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import useFavoritesStore from '../store/favoritesStore'
import { useEffect, useState, useRef, useMemo } from 'react'
import useInactivityTimer from '../hooks/useInactivityTimer'
import SmartHint from '../components/client/guided/SmartHint'
import ClientCouponsModal from '../components/client/coupons/ClientCouponsModal'
import { useCoupons } from '../hooks/useCoupons'

import useNotificationCenter from '../hooks/useNotificationCenter'
import NotificationHistoryTray from '../components/common/NotificationHistoryTray'
import NCToastContainer from '../components/common/NCToastContainer'


const NAV_ITEMS_LEFT = [
  { path: '/tienda/catalogo', icon: ShoppingCart, label: 'Catálogo' },
  { path: '/tienda/favoritos', icon: Heart, label: 'Favoritos' },
]

export default function ClientLayout() {
  const location = useLocation()
  const isProductDetail = location.pathname.includes('/producto/')
  const { appName, appIcon, isFeatureEnabled } = useAppConfigStore()
  const { getCount, openCart, isOpen: isCartOpen } = useCartStore()
  const { user } = useAuthStore()
  const { subscribe, unsubscribe } = useFavoritesStore()
  const navigate = useNavigate()

  const dynamicClientMenu = useMemo(() => {
    const list = [];
    catalog.features.forEach(feature => {
      if (isFeatureEnabled(feature.id) && feature.navigation?.clientMenu) {
        feature.navigation.clientMenu.forEach(item => {
          let icon = Package;
          if (item.path.includes('credito') || item.path.includes('credits')) icon = CreditCard;
          list.push({
            path: item.path,
            icon,
            label: item.label
          });
        });
      }
    });
    return list;
  }, [isFeatureEnabled]);

  const navItemsRight = useMemo(() => {
    return dynamicClientMenu;
  }, [dynamicClientMenu])

  const allNavItems = useMemo(() => {
    return [
      { path: '/tienda/catalogo', icon: ShoppingCart, label: 'Catálogo' },
      { path: '/tienda/favoritos', icon: Heart, label: 'Favoritos' },
      ...dynamicClientMenu,
      { path: '/tienda/perfil', icon: User, label: 'Perfil' },
    ];
  }, [dynamicClientMenu])

  const [isCouponsOpen, setIsCouponsOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  // Guard de carga inicial: evita disparar toasts con notificaciones pre-existentes al entrar
  const toastReadyRef = useRef(false)
  // Animación de llamada de atención en la campana (cuando hay no leídas al entrar)
  const [isBellAttentive, setIsBellAttentive] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const cartCount = getCount()
  const userId = user?.celular || user?.uid

  // Hook central del Notification Center para Clientes
  const [soundEnabled, setSoundEnabled] = useState(true)
  const {
    notifications,
    unreadCount,
    isRinging,
    hasMore,
    isLoadingMore,
    markRead,
    markAllRead,
    clearAll,
    loadMore,
  } = useNotificationCenter({
    recipientId: user?.celular || 'client',
    recipientRole: 'client',
    soundEnabled
  })

  // Toasts: SOLO para notificaciones que llegan EN VIVO después de la carga inicial
  useEffect(() => {
    if (notifications.length === 0) return

    if (!toastReadyRef.current) {
      // Primera snapshot de Firestore: registrar como listo SIN disparar toasts
      toastReadyRef.current = true
      return
    }

    const unread = notifications.filter(n => n.status === 'unread')
    if (unread.length > 0) {
      setToasts(prev => {
        let updated = [...prev]
        unread.forEach(item => {
          if (updated.some(t => t.id === item.id)) return

          const createdTime = item.createdAt?.toDate 
            ? item.createdAt.toDate().getTime() 
            : (item.createdAt ? new Date(item.createdAt).getTime() : Date.now())

          if (Date.now() - createdTime > 20000) return

          updated.push({
            id: item.id,
            title: item.title,
            body: item.body,
            clickAction: item.clickAction
          })

          setTimeout(() => {
            setToasts(current => current.filter(t => t.id !== item.id))
          }, 5000)
        })
        return updated
      })
    }
  }, [notifications])

  // Desvanecimiento del encabezado al hacer scroll
  const [showHeader, setShowHeader] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY <= 15) {
        setShowHeader(true)
      } else if (currentScrollY > lastScrollY.current) {
        // Hacia abajo: desvanecer
        setShowHeader(false)
      } else {
        // Hacia arriba: aparecer
        setShowHeader(true)
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Conteo de cupones activos
  const { data: allCoupons = [] } = useCoupons()
  const activeCouponsCount = useMemo(() => {
    const now = new Date()
    return allCoupons.filter(c => {
      if (!c.activo && !c.active) return false
      const expDate = c.fechaExpiracion || c.endDate
      if (expDate) {
        const d = new Date(expDate)
        if (!isNaN(d) && d < now) return false
      }
      return true
    }).length
  }, [allCoupons])

  // Inactividad: 10s si hay items pero el carrito está cerrado
  const { isInactive: isCartInactive } = useInactivityTimer(10000, cartCount > 0 && !isCartOpen)

  useEffect(() => {
    if (userId) {
      subscribe(userId)
    } else {
      unsubscribe()
    }
  }, [userId, subscribe, unsubscribe])

  const handleToastClick = (toast) => {
    setToasts(prev => prev.filter(t => t.id !== toast.id))
    if (toast.clickAction) {
      navigate(toast.clickAction)
    }
  }

  return (
    <div className="min-h-screen bg-app flex w-full max-w-[100vw] overflow-x-hidden">
      {/* Contenedor de Toasts Unificado del NC */}
      <NCToastContainer
        toasts={toasts}
        onCloseToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
        onToastClick={handleToastClick}
      />

      {/* ─── SIDEBAR DESKTOP ────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-surface border-r border-app z-30 shadow-sm"
        aria-label="Navegación del cliente"
      >
        {/* Header del sidebar */}
        <div className="flex flex-col p-4 border-b border-app gap-3">
          <div className="flex items-center gap-3 min-w-0 w-full">
            {appIcon ? (
              <img
                src={appIcon}
                alt={`Logo ${appName}`}
                className="w-11 h-11 rounded-xl object-contain bg-white p-1 border border-app shadow-sm shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <ShoppingCart size={20} className="text-white" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-black text-[15px] text-app truncate leading-tight">{appName}</p>
              <p className="text-[10px] text-muted truncate">Tienda Virtual</p>
            </div>
          </div>

          {/* Fila 2: Centro de Control / Panel Rápido (columnas uniformes adaptativas) */}
          <div className={`grid gap-2 w-full mt-1 ${onlineOrdersEnabled ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {/* Carrito de Compras Permanente */}
            {onlineOrdersEnabled && (
              <button
                onClick={openCart}
                className={`relative h-10 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs w-full ${
                  cartCount > 0
                    ? 'bg-primary/5 border-primary text-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.15)]'
                    : 'bg-surface hover:bg-surface-2 border-app text-muted hover:text-app'
                }`}
                aria-label="Carrito de compras"
              >
                <motion.div
                  animate={
                    cartCount > 0
                      ? {
                          scale: [1, 1.15, 1, 1.15, 1],
                          rotate: [0, -8, 8, -8, 0],
                        }
                      : {}
                  }
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 2.5,
                    ease: "easeInOut",
                    repeatDelay: 3
                  }}
                >
                  <ShoppingCart size={18} />
                </motion.div>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-surface animate-bounce [animation-duration:3s]">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Campana de notificaciones */}
            <div className="relative w-full">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative h-10 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs w-full ${
                  isBellAttentive
                    ? 'bg-primary/10 border-primary text-primary shadow-[0_0_14px_3px_hsl(var(--primary)/0.30)]'
                    : unreadCount > 0
                    ? 'bg-red-500/5 border-red-500/40 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                    : 'bg-surface hover:bg-surface-2 border-app text-muted hover:text-app'
                }`}
                aria-label="Notificaciones"
              >
                <motion.div
                  animate={
                    isBellAttentive
                      ? { rotate: [0, -22, 18, -14, 10, -6, 4, -2, 0, -20, 16, -10, 6, -3, 0], scale: [1, 1.28, 1.1, 1.22, 1.05, 1.18, 1, 1.05, 1, 1.22, 1.1, 1.18, 1, 1.05, 1] }
                      : isRinging
                      ? { rotate: [0, -20, 18, -14, 10, -6, 4, 0] }
                      : unreadCount > 0
                      ? {
                          rotate: [0, -12, 12, -12, 12, 0],
                        }
                      : {}
                  }
                  transition={
                    isBellAttentive
                      ? { duration: 2.8, ease: 'easeInOut' }
                      : unreadCount > 0
                      ? {
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 1.8,
                          ease: "easeInOut",
                          repeatDelay: 4
                        }
                      : { duration: 0.6, ease: 'easeInOut' }
                  }
                >
                  <Bell size={18} />
                </motion.div>
                {unreadCount > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-surface ${
                    isBellAttentive ? 'animate-bounce' : 'animate-pulse'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Avatar de Perfil */}
            <NavLink
              to="/tienda/perfil"
              className={({ isActive }) =>
                `h-10 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs w-full ${
                  isActive 
                    ? 'bg-primary text-white border-primary shadow-sm ring-1 ring-white/20 ring-inset' 
                    : 'bg-surface border-app text-muted hover:bg-surface-2 hover:text-app'
                }`
              }
              aria-label="Mi Perfil"
            >
              <User size={18} />
            </NavLink>
          </div>
        </div>

        {/* Navegación Sidebar */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {allNavItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive ? 'bg-primary text-white shadow-sm' : 'text-app hover:bg-surface-2'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} />
                  <span>{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="client-active-pill"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Modal Flotante de Notificaciones */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
              onClick={() => setIsNotificationsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-lg h-[80vh] max-h-[600px] z-[101] shadow-2xl rounded-3xl overflow-hidden pointer-events-auto border border-app"
            >
              <NotificationHistoryTray
                notifications={notifications}
                unreadCount={unreadCount}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
                onMarkRead={markRead}
                onMarkAllRead={markAllRead}
                onClearAll={clearAll}
                onClose={() => setIsNotificationsOpen(false)}
                onNavigate={(path) => {
                  setIsNotificationsOpen(false)
                  navigate(path)
                }}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={loadMore}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CONTENIDO PRINCIPAL ────────────────────────────────────────── */}
      <main className={`flex-1 md:ml-64 min-h-screen w-full max-w-[100vw] md:max-w-none overflow-x-hidden relative flex flex-col ${isProductDetail ? 'pb-0' : 'pb-20 md:pb-0'}`}>
        {/* Cabecera superior móvil premium translúcida con curva asimétrica en S (efecto frosted glass) */}
        {!isProductDetail && (
          <motion.header 
            animate={{ 
              opacity: showHeader ? 1 : 0,
              pointerEvents: showHeader ? 'auto' : 'none'
            }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex md:hidden flex-col px-4 pt-4 pb-8 text-white z-30 sticky top-0 shrink-0 relative overflow-hidden backdrop-blur-lg"
            style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 75%, transparent), color-mix(in srgb, color-mix(in srgb, var(--color-primary) 85%, #000000) 80%, transparent))',
              clipPath: 'url(#header-s-curve)',
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))'
            }}
          >
            {/* Orbes de luz ambientales GPU-accelerated dinámicos (adaptados a la paleta activa) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
              {/* Orbe 1: Mezcla Luminosa con Luz Primaria */}
              <motion.div 
                className="absolute -left-20 -top-20 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-40"
                style={{
                  background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary-light) 50%, white) 0%, transparent 70%)',
                  willChange: 'transform'
                }}
                animate={{
                  x: [0, 30, 0],
                  y: [0, -20, 0]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              {/* Orbe 2: Mezcla Viva con Acento del Tema */}
              <motion.div 
                className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-45"
                style={{
                  background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 30%, var(--color-accent)) 0%, transparent 75%)',
                  willChange: 'transform'
                }}
                animate={{
                  x: [0, -25, 0],
                  y: [0, 20, 0]
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            {/* Borde de Cristal Neón S-Curve (Trazo SVG de alta visibilidad adaptado al tema) */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="edge-neon-glow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                    <stop offset="35%" stopColor="var(--color-accent)" stopOpacity="0.4" />
                    <stop offset="70%" stopColor="white" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 100,72 C 65,72 35,100 0,100" 
                  fill="none" 
                  stroke="url(#edge-neon-glow)" 
                  strokeWidth="2"
                  className="opacity-90"
                />
              </svg>
            </div>

            {/* Fila principal centrada verticalmente */}
            <div className="w-full flex items-center justify-between h-12 relative z-10">
              {/* Lado izquierdo: Identidad de Marca */}
              <div className="flex items-center gap-2.5 h-full">
                {appIcon ? (
                  <img
                    src={appIcon}
                    alt={`Logo ${appName}`}
                    className="w-13 h-13 rounded-2xl object-contain bg-white p-1 border border-white/30 shadow-md ring-2 ring-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
                  />
                ) : (
                  <div className="w-13 h-13 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/10">
                    <ShoppingCart size={23} className="text-white" />
                  </div>
                )}
                <span className="font-black text-[16.5px] text-white tracking-tight leading-none">{appName}</span>
              </div>
              
              {/* Lado derecho: Botones de Acción (Grandes, centrados y alineados) */}
              <div className="flex items-center gap-2.5 h-full">
                {/* Carrito de Compras */}
                {onlineOrdersEnabled && (
                  <button
                    onClick={openCart}
                    className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer ${
                      cartCount > 0
                        ? 'bg-white/20 border-white text-white shadow-sm'
                        : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/15'
                    }`}
                    aria-label="Carrito de compras"
                  >
                    <motion.div
                      className="flex items-center justify-center"
                      animate={
                        cartCount > 0
                          ? {
                              scale: [1, 1.12, 1, 1.12, 1],
                              rotate: [0, -6, 6, -6, 0],
                            }
                          : {}
                      }
                      transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 2.5,
                        ease: "easeInOut",
                        repeatDelay: 3
                      }}
                    >
                      <ShoppingCart size={19} />
                    </motion.div>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-primary animate-bounce [animation-duration:3s]">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Campana de Notificaciones */}
                <motion.button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer ${
                    isBellAttentive
                      ? 'bg-white/25 border-white text-white shadow-sm'
                      : unreadCount > 0
                      ? 'bg-red-500/20 border-red-500/50 text-white'
                      : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/15'
                  }`}
                  aria-label="Campana de Notificaciones"
                >
                  <motion.div
                    className="flex items-center justify-center"
                    animate={
                      isBellAttentive
                        ? { rotate: [0, -22, 18, -14, 10, -6, 4, -2, 0, -20, 16, -10, 6, -3, 0], scale: [1, 1.28, 1.1, 1.22, 1.05, 1.18, 1, 1.05, 1, 1.22, 1.1, 1.18, 1, 1.05, 1] }
                        : isRinging
                        ? { rotate: [0, -20, 18, -14, 10, -6, 4, 0] }
                        : unreadCount > 0
                        ? {
                            rotate: [0, -12, 12, -12, 12, 0],
                          }
                        : {}
                    }
                    transition={
                      isBellAttentive
                        ? { duration: 2.8, ease: 'easeInOut' }
                        : unreadCount > 0
                        ? {
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 1.8,
                            ease: "easeInOut",
                            repeatDelay: 4
                          }
                        : { duration: 0.6, ease: 'easeInOut' }
                    }
                  >
                    <Bell size={19} />
                  </motion.div>
                  {unreadCount > 0 && (
                    <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-primary ${
                      isBellAttentive ? 'animate-bounce' : 'animate-pulse'
                    }`}>
                      {unreadCount}
                    </span>
                  )}
                </motion.button>

                {/* Avatar de Perfil */}
                <NavLink
                  to="/tienda/perfil"
                  className={({ isActive }) =>
                    `w-10 h-10 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs ${
                      isActive 
                        ? 'bg-white text-primary border-white shadow-sm ring-1 ring-white/10 ring-inset' 
                        : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/15'
                    }`
                  }
                  aria-label="Mi Perfil"
                >
                  <User size={19} />
                </NavLink>
              </div>
            </div>
          </motion.header>
        )}

        <div className="flex-1 w-full relative pt-2 md:pt-0">
          <Outlet />
        </div>
      </main>

      {/* ─── BARRA DE NAVEGACIÓN INFERIOR (MOBILE) ───────────────────────── */}
      {!isProductDetail && (
        <nav className="flex md:hidden fixed bottom-0 left-0 right-0 min-h-[4rem] h-auto bg-surface border-t border-app z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 safe-area-bottom">
          {NAV_ITEMS_LEFT.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 relative ${
                  isActive ? 'text-primary' : 'text-muted hover:text-app'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="client-nav-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                    />
                  )}
                  <Icon size={20} aria-hidden="true" />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Botón Central Ofertas / Cupones Rediseñado */}
          {couponsEnabled && (
            <div className="flex-1 flex flex-col items-center justify-start relative">
              <div className="flex flex-col items-center justify-center -translate-y-3 relative">
                {/* Halo de resplandor pulsante suave de ida y vuelta (efecto respiración optimizado para GPU sin cortes bruscos) */}
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute w-16 h-16 rounded-full pointer-events-none z-0 blur-[2px]"
                  style={{
                    background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 55%, transparent) 0%, color-mix(in srgb, var(--color-primary) 20%, transparent) 60%, transparent 80%)'
                  }}
                />

                <motion.button
                  onClick={() => setIsCouponsOpen(true)}
                  animate={{
                    scale: [1, 1.04, 1]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileTap={{ scale: 0.94 }}
                  className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center border-4 border-surface relative overflow-visible select-none shrink-0 z-10"
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                  }}
                  aria-label="Ofertas y Cupones"
                >

                  {/* Icono de Tag a 28px con animación de wiggle infinito */}
                  <div className="animate-wiggle-infinite flex items-center justify-center pointer-events-none z-10">
                    <Tag size={28} className="text-white" />
                  </div>

                  {/* Badge de contador duplicado (w-7 h-7) con fuente 14px posicionado en top-[-6px] y right-[-6px] */}
                  {activeCouponsCount > 0 && (
                    <span className="absolute -top-[6px] -right-[6px] bg-red-500 text-white text-[14px] font-black rounded-full w-7 h-7 flex items-center justify-center border-2 border-surface animate-bounce shadow-md z-20">
                      {activeCouponsCount}
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          )}

          {navItemsRight.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 relative ${
                  isActive ? 'text-primary' : 'text-muted hover:text-app'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="client-nav-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                    />
                  )}
                  <Icon size={20} aria-hidden="true" />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}

      {/* Modal de Cupones */}
      {couponsEnabled && (
        <ClientCouponsModal isOpen={isCouponsOpen} onClose={() => setIsCouponsOpen(false)} />
      )}

      {/* Insinuación Inteligente del Carrito Flotante (Inactividad) */}
      {onlineOrdersEnabled && cartCount > 0 && (
        <SmartHint
          isInactive={isCartInactive}
          cartCount={cartCount}
          onOpenCart={openCart}
        />
      )}

      {/* SVG para el clipPath de la curva asimétrica en S de la cabecera */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <clipPath id="header-s-curve" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L1,0 L1,0.72 C0.65,0.72 0.35,1 0,1 Z" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}
