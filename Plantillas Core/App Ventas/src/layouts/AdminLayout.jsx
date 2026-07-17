import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut,
  Bell,
  X,
  ShieldAlert,
  Store,
  QrCode,
  LayoutDashboard,
  Settings,
  HelpCircle,
  CreditCard,
  Truck,
  Package,
  ListOrdered,
  ShoppingCart,
  ShoppingBag,
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  DollarSign
} from 'lucide-react'

const LucideIcons = {
  LogOut,
  Bell,
  X,
  ShieldAlert,
  Store,
  QrCode,
  LayoutDashboard,
  Settings,
  HelpCircle,
  CreditCard,
  Truck,
  Package,
  ListOrdered,
  ShoppingCart
}

import catalog from '../core/generated/feature-catalog.generated.json'
import { signOut } from 'firebase/auth'
import { auth } from '../config/firebaseConfig'
import useAppConfigStore from '../store/appConfigStore'
import useAuthStore from '../store/authStore'
import { useEffect, useState, useMemo, useRef } from 'react'

import useNotificationCenter from '../hooks/useNotificationCenter'
import NotificationHistoryTray from '../components/common/NotificationHistoryTray'
import NCToastContainer from '../components/common/NCToastContainer'
import MobileBottomNav from '../components/common/MobileBottomNav'
import HeaderBackground from '../components/common/HeaderBackground'
import { updateClientProfile } from '../services/userService'

import { useConnectivityStore } from '../store/connectivityStore'
import { useAlertConfirm } from '../components/common/AlertConfirmContext'
import { useAdminHomeStatsStore } from '../store/adminHomeStatsStore'
import { formatCurrency } from '../utils/formatters'

const getIconComponent = (iconName) => {
  return LucideIcons[iconName] || LucideIcons.HelpCircle;
};

// Orden fijo del nav móvil (ver mobileFixedItems más abajo)
const MOBILE_FIXED_PATHS = ['/admin/inicio', '/admin/inventario', '/admin/ventas', '/admin/pedidos']

export default function AdminLayout() {
  const { appName, appIcon, sellerName, creditsEnabled } = useAppConfigStore()
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isOnline = useConnectivityStore((state) => state.isOnline)

  // El saludo (antes una tarjeta aparte debajo del header, que generaba
  // costuras y duplicaba el logo) ahora vive DENTRO del propio header, solo
  // en Inicio — un único elemento con curva, sin dos formas que sincronizar.
  const isHome = location.pathname === '/admin/inicio'
  const [isGreetingOpen, setIsGreetingOpen] = useState(true)
  const [isBursting, setIsBursting] = useState(false)
  const [showCommandCenter, setShowCommandCenter] = useState(false)

  // Cifras de un vistazo para los chips del encabezado — las calcula y
  // publica AdminHome.jsx (dueño real de los datos); aquí solo se leen,
  // sin abrir listeners de Firestore propios para esto.
  const { ventasHoy, pedidosPendientes, stockBajoCount, fiado } = useAdminHomeStatsStore()

  const openCommandCenter = () => {
    setIsBursting(true)
    setTimeout(() => setIsBursting(false), 600)
    setShowCommandCenter(true)
  }

  // Redirigir al POS si se pierde la conexión mientras se está en otra pestaña.
  // `navigate` excluido de las dependencias a propósito (ver fix de
  // WelcomePage.jsx/useAuthInit.js): su referencia puede cambiar entre
  // renders sin que eso deba re-disparar este efecto.
  useEffect(() => {
    if (!isOnline && location.pathname !== '/admin/ventas') {
      navigate('/admin/ventas', { replace: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, location.pathname])

  // Hook centralizado del Notification Center
  const [soundEnabled, setSoundEnabled] = useState(true)
  const {
    notifications,
    unreadCount,
    isRinging,
    markRead,
    markAllRead,
    clearAll
  } = useNotificationCenter({
    recipientId: 'admin',
    recipientRole: 'admin',
    soundEnabled
  })

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  // Guard de carga inicial: evita disparar toasts con notificaciones pre-existentes al entrar
  const toastReadyRef = useRef(false)
  // Animación de llamada de atención en la campana (cuando hay no leídas al entrar)
  const [isBellAttentive, setIsBellAttentive] = useState(false)

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

  // Navegación adaptativa según feature flags de módulos y estado de conexión
  const filteredNavItems = useMemo(() => {
    const dynamicItems = [];
    const isFeatureEnabled = useAppConfigStore.getState().isFeatureEnabled;

    catalog.features.forEach(feature => {
      if (isFeatureEnabled(feature.id) && feature.navigation?.adminMenu) {
        feature.navigation.adminMenu.forEach(item => {
          dynamicItems.push({
            path: item.path,
            icon: getIconComponent(item.icon),
            label: item.label
          });
        });
      }
    });

    const coreItems = [
      { path: '/admin/inicio', icon: LucideIcons.LayoutDashboard, label: 'Inicio' }
    ];

    const configItems = [
      { path: '/admin/configuracion', icon: LucideIcons.Settings, label: 'Config.' }
    ];

    const allItems = [...coreItems, ...dynamicItems, ...configItems];

    if (!isOnline) {
      return allItems.filter(item => item.path === '/admin/ventas')
    }
    return allItems;
  }, [isOnline])

  const getCurrentPageInfo = () => {
    // Buscar coincidencia exacta
    const matchedItem = filteredNavItems.find(i => i.path === location.pathname)
    if (matchedItem) {
      return { title: matchedItem.label, icon: matchedItem.icon }
    }

    // Buscar coincidencia parcial (sub-páginas)
    const partialMatch = filteredNavItems.find(i => location.pathname.startsWith(i.path) && i.path !== '/admin')
    if (partialMatch) {
      if (location.pathname === '/admin/inicio/detalle-ventas') {
        return { title: 'Detalle Ventas', icon: TrendingUp }
      }
      return { title: partialMatch.label, icon: partialMatch.icon }
    }

    // Fallbacks directos para subrutas
    if (location.pathname.includes('/admin/inventario')) return { title: 'Inventario', icon: Package }
    if (location.pathname.includes('/admin/pedidos')) return { title: 'Pedidos', icon: ListOrdered }
    if (location.pathname.includes('/admin/ventas')) return { title: 'Ventas Directas', icon: ShoppingCart }
    if (location.pathname.includes('/admin/credito')) return { title: 'Fiado / Créditos', icon: DollarSign }
    if (location.pathname.includes('/admin/configuracion')) return { title: 'Configuraciones', icon: Settings }
    if (location.pathname.includes('/admin/reclamos')) return { title: 'Garantías y Reclamos', icon: ShieldAlert }
    if (location.pathname.includes('/admin/inicio/detalle-ventas')) return { title: 'Detalle Ventas', icon: TrendingUp }
    if (location.pathname.includes('/admin/rendimiento-qr') || location.pathname.includes('/admin/qr')) return { title: 'Rendimiento QR', icon: QrCode }
    if (location.pathname.includes('/admin/rendimiento-delivery')) return { title: 'Rendimiento Delivery', icon: Truck }
    if (location.pathname.includes('/admin/alertas-stock')) return { title: 'Alertas de Stock', icon: AlertTriangle }

    return { title: appName || 'Mi Tienda', icon: Store }
  }

  // Nav móvil rediseñado: orden fijo pedido por el fundador (Inicio,
  // Inventario, Ventas POS al centro, Pedidos) + hamburguesa para el resto
  // de features realmente activas, en vez de amontonar todas las features
  // activas en la misma barra (regla `overflow-menu`).
  const mobileFixedItems = useMemo(() => {
    return MOBILE_FIXED_PATHS
      .map(path => filteredNavItems.find(i => i.path === path))
      .filter(Boolean)
      .map(item => ({
        ...item,
        type: item.path === '/admin/ventas' ? 'fab' : 'link',
        // Etiqueta corta y de acción para el slot central del nav móvil
        // (no el nombre de módulo "Ventas" que usa el sidebar de escritorio).
        label: item.path === '/admin/ventas' ? 'Vender' : item.label,
      }))
  }, [filteredNavItems])

  const mobileOverflowItems = useMemo(() => {
    return filteredNavItems.filter(i => !MOBILE_FIXED_PATHS.includes(i.path))
  }, [filteredNavItems])

  const { showConfirm } = useAlertConfirm()

  const handleLogout = async () => {
    // El botón vive ahora también en el encabezado móvil, a un toque de
    // distancia — confirmación obligatoria para evitar cierres de sesión
    // por un toque accidental (regla `component-library.md` §1).
    const confirmed = await showConfirm({
      title: '¿Cerrar sesión?',
      message: 'Vas a salir del panel de administración. ¿Estás seguro de que quieres continuar?',
      confirmText: 'Cerrar sesión',
      cancelText: 'Cancelar',
      variant: 'warning'
    })
    if (!confirmed) return

    try {
      logout()
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleToastClick = (toast) => {
    setToasts(prev => prev.filter(t => t.id !== toast.id))
    if (toast.clickAction) {
      navigate(toast.clickAction)
    }
  }

  return (
    <div className="min-h-screen bg-app flex w-full max-w-[100vw] overflow-x-hidden">
      {/* Container de Toasts Unificado del Notification Center */}
      <NCToastContainer
        toasts={toasts}
        onCloseToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
        onToastClick={handleToastClick}
      />

      {/* ─── SIDEBAR DESKTOP (hidden en mobile) ─────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-surface border-r border-app z-40 shadow-sm"
        aria-label="Navegación del administrador"
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-app relative">
          <div className="flex items-center gap-3">
            {appIcon ? (
              <img
                src={appIcon}
                alt={`Logo ${appName}`}
                className="w-9 h-9 rounded-xl object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Store size={18} className="text-white" aria-hidden="true" />
              </div>
            )}
            <div>
              <p className="font-bold text-sm text-app leading-tight">{appName}</p>
              <p className="text-xs text-muted">Panel Admin</p>
            </div>
          </div>

          {/* Campana de Notificaciones (Desktop) */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                isBellAttentive
                  ? 'bg-primary/10 border border-primary text-primary shadow-[0_0_14px_3px_hsl(var(--primary)/0.30)]'
                  : unreadCount > 0
                  ? 'bg-red-500/5 border border-red-500/30 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                  : 'bg-surface-2 border border-app text-muted hover:text-app'
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
                    ? { rotate: [0, -12, 12, -12, 12, 0] }
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
                <Bell size={14} />
              </motion.div>
              {unreadCount > 0 && (
                <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                  isBellAttentive ? 'animate-bounce' : 'animate-pulse'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Secciones">
          {filteredNavItems.map(({ path, icon: Icon, label }) => {
            const isConfig = path === '/admin/configuracion'
            return (
              <NavLink
                key={path}
                to={path}
                onClick={() => {
                  if (isConfig && window.location.pathname === path) {
                    window.dispatchEvent(new CustomEvent('reset-settings-menu'))
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-app hover:bg-surface-2'
                  }`
                }
                aria-label={`Ir a ${label}`}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} aria-hidden="true" />
                    <span>{label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="admin-active-pill"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                      />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-app">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:bg-surface-2 hover:text-app transition-all duration-300 active:scale-95"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </div>
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
                onAuthorizeDevice={(celular) => updateClientProfile(celular, { ownerUid: null })}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CONTENIDO PRINCIPAL ────────────────────────────────────────── */}
      <main
        className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen w-full max-w-[100vw] md:max-w-none overflow-x-hidden flex flex-col"
        id="main-content"
      >
        {/* Cabecera superior móvil — mismo patrón de curva en S + gradiente que
            ClientLayout.jsx (identidad de marca consistente entre cliente y
            admin). En Inicio, un único elemento con curva absorbe también el
            saludo (antes una tarjeta aparte debajo del header: dos curvas,
            dos logos, y una costura de sincronización entre dos animaciones
            independientes — todo eso desaparece al ser un solo elemento). */}
        <motion.header
          className={`flex md:hidden flex-col px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] ${(isHome && isGreetingOpen) ? 'pb-6' : 'pb-3'} text-white z-30 sticky top-0 shrink-0 relative overflow-hidden backdrop-blur-lg`}
          style={{
            background: '#0B111E',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))'
          }}
        >
          {/* Fondo aurora amorfo dinámico centralizado */}
          <HeaderBackground />

          <div className="w-full flex items-center justify-between min-h-12 py-1 relative z-10 shrink-0">
            {/* Lado izquierdo: Identidad de Marca (logo unificado — en Inicio,
                el mismo logo es también el acceso al Centro de Mando Express,
                sin duplicar un segundo logo aparte para eso). Sin altura fija:
                en Inicio son 2 líneas (nombre + saludo) y necesitan más alto
                que en el resto de páginas (solo el nombre) sin que se corten. */}
            <div
              className={`flex items-center gap-2.5 min-w-0 flex-1 ${isHome ? 'cursor-pointer select-none' : ''}`}
              role={isHome ? 'button' : undefined}
              tabIndex={isHome ? 0 : undefined}
              aria-label={isHome ? 'Abrir Centro de Mando Express: accesos rápidos de administración' : undefined}
              onClick={isHome ? openCommandCenter : undefined}
              onKeyDown={isHome ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openCommandCenter()
                }
              } : undefined}
            >
              {isHome ? (
                <>
                  <motion.div 
                    className="relative shrink-0"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Resplandor pulsante continuo de fondo */}
                    <span className="absolute -inset-1 rounded-2xl bg-amber-400/20 blur-xs opacity-75 animate-pulse pointer-events-none z-0" />
                    
                    {/* Anillo de onda expansiva */}
                    <span className="absolute -inset-0.5 rounded-2xl ring-2 ring-amber-400/30 animate-ping opacity-25 pointer-events-none z-0" style={{ animationDuration: '4s' }} />

                    {isHome && isBursting && (
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{ scale: 2.2, opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-2xl border-4 border-amber-400 pointer-events-none z-10"
                        style={{ boxShadow: '0 0 20px rgba(245,158,11,0.6), inset 0 0 20px rgba(245,158,11,0.6)' }}
                      />
                    )}
                    {appIcon ? (
                      <img
                        src={appIcon}
                        alt={`Logo ${appName}`}
                        className="relative w-13 h-13 rounded-2xl object-contain bg-white p-1 shadow-md z-10 transition-all duration-300 border-2 border-amber-400/40 hover:border-amber-400/85"
                      />
                    ) : (
                      <div className="relative w-13 h-13 rounded-2xl border flex items-center justify-center shrink-0 shadow-md z-10 transition-all bg-amber-500/10 border-amber-400/50 text-amber-300">
                        <Store size={23} />
                      </div>
                    )}
                    {/* Badge de Rayo Express en la esquina inferior del logo para denotar interactividad (solo en Inicio) */}
                    <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-white z-20 animate-pulse">
                      <span className="text-[10px] font-black leading-none">⚡</span>
                    </span>
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-[16.5px] text-white tracking-tight leading-none truncate block">
                      {appName}
                    </span>
                  </div>
                </>
              ) : (
                (() => {
                  const info = getCurrentPageInfo()
                  const PageIcon = info.icon
                  return (
                    <div className="flex items-center gap-2 min-w-0 flex-1 py-1 px-1">
                      {PageIcon && (
                        <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-xs animate-[fadeIn_0.35s_ease-out]">
                          <PageIcon size={18} className="text-white shrink-0" />
                        </div>
                      )}
                      <span className="font-black text-[18.5px] text-white tracking-tight leading-tight truncate block animate-[fadeIn_0.35s_ease-out]">
                        {info.title}
                      </span>
                    </div>
                  )
                })()
              )}
            </div>

            {/* Lado derecho: Campana + Cerrar sesión (antes solo en el sidebar de escritorio o enterrado en Config) */}
            <div className="flex items-center gap-2.5 h-full shrink-0">
              <motion.button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer ${
                  isBellAttentive
                    ? 'bg-white/25 border-white text-white shadow-sm'
                    : unreadCount > 0
                    ? 'bg-red-500/20 border-red-500/50 text-white'
                    : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/15'
                }`}
                aria-label="Notificaciones"
              >
                <motion.div
                  className="flex items-center justify-center"
                  animate={
                    isBellAttentive
                      ? { rotate: [0, -22, 18, -14, 10, -6, 4, -2, 0, -20, 16, -10, 6, -3, 0], scale: [1, 1.2, 1.05, 1.15, 1, 1.1, 1, 1.05, 1, 1.15, 1.05, 1.1, 1, 1.05, 1] }
                      : isRinging
                      ? { rotate: [0, -20, 18, -14, 10, -6, 4, 0] }
                      : unreadCount > 0
                      ? { rotate: [0, -12, 12, -12, 12, 0] }
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

              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs bg-white/10 border-white/20 text-white/90 hover:bg-white/15 cursor-pointer"
                aria-label="Cerrar sesión"
              >
                <LogOut size={19} />
              </button>

              {/* Colapsar/expandir el saludo — solo en Inicio */}
              {isHome && (
                <button
                  onClick={() => setIsGreetingOpen((open) => !open)}
                  className="w-10 h-10 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer"
                  aria-label={isGreetingOpen ? 'Ocultar saludo' : 'Mostrar saludo'}
                >
                  <motion.div
                    animate={{ rotate: isGreetingOpen ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>
              )}
            </div>
          </div>

          {/* Saludo + fecha — solo en Inicio, colapsable con la flechita.
              El saludo vive aquí (no junto al nombre de la tienda arriba):
              línea propia, encima de la fecha. */}
          {isHome && (
            <AnimatePresence initial={false}>
              {isGreetingOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                  className="overflow-hidden relative z-10"
                >
                  <p className="text-sm text-white font-bold tracking-tight pt-3 truncate">
                    {(() => {
                      const hour = new Date().getHours()
                      if (hour < 12) return 'Buenos días'
                      if (hour < 18) return 'Buenas tardes'
                      return 'Buenas noches'
                    })()}, {sellerName || appName}
                  </p>
                  <p className="text-xs text-white/80 font-medium tracking-wide uppercase pb-1 mt-0.5">
                    {new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                  </p>

                  {/* Chips de un vistazo — reutilizan cifras que AdminHome.jsx ya
                      calcula (no duplica el Centro de Mando Express: aquí es
                      información tocable, no una segunda lista de accesos). */}
                  {(() => {
                    const chips = [
                      { 
                        label: 'Ventas hoy', 
                        value: formatCurrency(ventasHoy), 
                        path: '/admin/inicio/detalle-ventas', 
                        icon: TrendingUp, 
                        iconColor: 'text-[#34d399]',
                        glowClass: 'border-emerald-500/20 shadow-[inset_0_0_10px_rgba(16,185,129,0.08)] bg-emerald-500/5 hover:bg-emerald-500/15',
                        glowVar: 'rgba(16,185,129,0.3)'
                      },
                      { 
                        label: 'Pendientes', 
                        value: pedidosPendientes, 
                        path: '/admin/pedidos', 
                        icon: Package, 
                        iconColor: 'text-[#a78bfa]',
                        glowClass: 'border-violet-500/20 shadow-[inset_0_0_10px_rgba(139,92,246,0.08)] bg-violet-500/5 hover:bg-violet-500/15',
                        glowVar: 'rgba(139,92,246,0.3)'
                      },
                      { 
                        label: 'Stock bajo', 
                        value: stockBajoCount, 
                        path: '/admin/inventario', 
                        icon: AlertTriangle, 
                        iconColor: 'text-[#f87171]',
                        glowClass: 'border-red-500/20 shadow-[inset_0_0_10px_rgba(239,68,68,0.08)] bg-red-500/5 hover:bg-red-500/15',
                        glowVar: 'rgba(239,68,68,0.3)'
                      },
                      creditsEnabled && { 
                        label: 'Fiado', 
                        value: formatCurrency(fiado), 
                        path: '/admin/credito', 
                        icon: DollarSign, 
                        iconColor: 'text-[#fbbf24]',
                        glowClass: 'border-amber-500/20 shadow-[inset_0_0_10px_rgba(245,158,11,0.08)] bg-amber-500/5 hover:bg-amber-500/15',
                        glowVar: 'rgba(245,158,11,0.3)'
                      }
                    ].filter(Boolean)

                    return (
                      <div className={`mt-2 pt-3 border-t border-white/15 grid gap-2 ${chips.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                        {chips.map((chip, idx) => {
                          const Icon = chip.icon
                          return (
                            <motion.button
                              key={chip.label}
                              type="button"
                              onClick={() => navigate(chip.path)}
                              className={`flex flex-col items-center gap-1 rounded-xl py-1.5 min-h-12 border transition-all cursor-pointer text-center relative overflow-hidden ${chip.glowClass}`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              animate={{
                                boxShadow: [
                                  `0 0 2px ${chip.glowVar}`,
                                  `0 0 12px ${chip.glowVar}`,
                                  `0 0 2px ${chip.glowVar}`
                                ]
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: idx * 0.4 // Desfasar las pulsaciones de cada chip
                              }}
                            >
                              <Icon size={15} className={`${chip.iconColor} shrink-0`} />
                              <span className="text-xs font-black text-white truncate max-w-full leading-none mt-0.5">{chip.value}</span>
                              <span className="text-[9px] uppercase tracking-wide text-white/70 truncate max-w-full leading-none">{chip.label}</span>
                            </motion.button>
                          )
                        })}
                      </div>
                    )
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.header>

        <div className="flex-1 w-full relative">
          <Outlet />
        </div>
      </main>

      {/* ─── NAVBOTTOM MOBILE (hidden en desktop) ───────────────────────── */}
      <MobileBottomNav
        items={mobileFixedItems}
        overflowItems={mobileOverflowItems}
        indicatorId="admin-nav-indicator"
      />



      {/* Centro de Mando Express (Glow Burst Menu) — se abre tocando el logo
          del header en Inicio. Vivía en AdminHome.jsx; se movió aquí junto
          con el logo que lo dispara, para no duplicar ese logo en dos sitios. */}
      <AnimatePresence>
        {showCommandCenter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'linear' }}
              onClick={() => setShowCommandCenter(false)}
              className="fixed inset-0 bg-black/60 z-40 cursor-pointer will-change-opacity"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-24 left-0 right-0 mx-auto z-50 w-[92%] max-w-sm bg-[var(--color-surface)]/95 border border-[var(--color-border)] rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-[var(--color-text)] will-change-transform"
            >
              <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--color-text)]">Centro de Mando Express</h4>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Atajos de administración rápidos</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCommandCenter(false)}
                  className="w-7 h-7 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {(() => {
                const activeAtajos = [
                  {
                    label: 'Registrar Pedido',
                    desc: 'Admin Pedidos',
                    icon: ShoppingBag,
                    path: '/admin/pedidos',
                    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20'
                  },
                  creditsEnabled && {
                    label: 'Ver Cartera',
                    desc: 'Créditos y Fiados',
                    icon: CreditCard,
                    path: '/admin/credito',
                    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                  },
                  {
                    label: 'Inventario / Stock',
                    desc: 'Control de Catálogo',
                    icon: Package,
                    path: '/admin/inventario',
                    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                  },
                  {
                    label: 'Ajustes Negocio',
                    desc: 'Configuración',
                    icon: Settings,
                    path: '/admin/configuracion',
                    color: 'text-sky-500 bg-sky-500/10 border-sky-500/20'
                  }
                ].filter(Boolean)

                return (
                  <div className={`grid gap-3 ${activeAtajos.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {activeAtajos.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setShowCommandCenter(false)
                          navigate(item.path)
                        }}
                        className="bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all active:scale-95 hover:border-[var(--color-primary-light)]/40 group"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.color} group-hover:scale-110 transition-transform`}>
                          <item.icon size={18} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold leading-tight text-[var(--color-text)]">
                            {item.label}
                          </span>
                          <span className="text-[8px] text-[var(--color-text-muted)] mt-0.5">
                            {item.desc}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              })()}

              <div className="border-t border-[var(--color-border)] pt-3 flex justify-between items-center text-[8px] text-[var(--color-text-muted)] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Firestore Online</span>
                </div>
                <span>Sync PWA Activa</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
