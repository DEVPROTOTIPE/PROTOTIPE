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
  ShoppingCart 
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
import { updateClientProfile } from '../services/userService'

import { useConnectivityStore } from '../store/connectivityStore'

const getIconComponent = (iconName) => {
  return LucideIcons[iconName] || LucideIcons.HelpCircle;
};

export default function AdminLayout() {
  const { appName, appIcon } = useAppConfigStore()
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isOnline = useConnectivityStore((state) => state.isOnline)

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

  const handleLogout = async () => {
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
        className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen w-full max-w-[100vw] md:max-w-none overflow-x-hidden"
        id="main-content"
      >
        <Outlet />
      </main>

      {/* ─── NAVBOTTOM MOBILE (hidden en desktop) ───────────────────────── */}
      <nav
        className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-app z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2"
        aria-label="Navegación inferior administrador"
      >
        {filteredNavItems.map(({ path, icon: Icon, label }) => {
          const isVentas = path === '/admin/ventas'
          const isConfig = path === '/admin/configuracion'

          const handleNavClick = (e, isActive) => {
            if (isConfig && isActive) {
              window.dispatchEvent(new CustomEvent('reset-settings-menu'))
            }
          }

          if (isVentas) {
            return (
              <NavLink
                key={path}
                to={path}
                onClick={(e) => handleNavClick(e, window.location.pathname === path)}
                className="flex-1 flex flex-col items-center justify-start relative group"
                aria-label={label}
              >
                {({ isActive }) => (
                  <div className="flex flex-col items-center justify-center -translate-y-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 border-4 border-surface bg-primary ${
                      isActive 
                        ? 'text-white scale-105' 
                        : 'text-white/80 hover:scale-105'
                    }`}>
                      <Icon size={26} aria-hidden="true" />
                    </div>
                  </div>
                )}
              </NavLink>
            )
          }

          return (
            <NavLink
              key={path}
              to={path}
              onClick={(e) => handleNavClick(e, window.location.pathname === path)}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 relative ${
                  isActive ? 'text-primary' : 'text-muted'
                }`
              }
              aria-label={label}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="admin-nav-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                    />
                  )}
                  <Icon size={20} aria-hidden="true" />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Botón Flotante de Notificaciones en Mobile (esquina superior derecha, hidden en desktop) */}
      <div className="md:hidden fixed top-4 right-4 z-40">
        <motion.button
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className={`w-11 h-11 rounded-2xl text-white shadow-xl flex items-center justify-center relative active:scale-90 transition-all ${
            isBellAttentive
              ? 'bg-primary shadow-[0_0_18px_4px_hsl(var(--primary)/0.50)]'
              : unreadCount > 0
              ? 'bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.4)]'
              : 'bg-primary hover:opacity-90'
          }`}
          aria-label="Notificaciones Mobile"
        >
          <motion.div
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
            <Bell size={18} />
          </motion.div>
          {unreadCount > 0 && (
            <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-surface ${
              isBellAttentive ? 'animate-bounce' : 'animate-pulse'
            }`}>
              {unreadCount}
            </span>
          )}
        </motion.button>
      </div>
    </div>
  )
}
