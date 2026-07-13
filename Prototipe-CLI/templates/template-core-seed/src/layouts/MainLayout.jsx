import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import * as LucideIcons from 'lucide-react'
import { Menu, LogOut, Settings } from 'lucide-react'
import useUiStore from '../store/uiStore'
import { signOutAdmin } from '../services/authService'
import useAuthStore from '../store/authStore'
import useAppConfigStore from '../store/appConfigStore'
import featureCatalog from '../core/generated/feature-catalog.generated.json'
import { FeatureAvailabilityResolver } from '../core/features/featureAvailability'

/**
 * MainLayout — Layout de administración central.
 * Orquesta la barra lateral colapsable, la cabecera superior y el área de contenido principal.
 */
export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useUiStore()
  const { user, logout } = useAuthStore()
  const { appName, appIcon } = useAppConfigStore()

  const handleLogout = async () => {
    try {
      await signOutAdmin()
      logout()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  // Menú dinámico inyectado por catálogo de features + sección de Ajustes del Core
  const isFeatureEnabled = useAppConfigStore((state) => state.isFeatureEnabled)
  const featureFlags = useAppConfigStore((state) => state.featureFlags || {})

  const dynamicItems = []
  if (featureCatalog && Array.isArray(featureCatalog)) {
    featureCatalog.forEach(feat => {
      // Filtrar disponibilidades mediante el resolvedor centralizado
      const isAvailable = isFeatureEnabled(feat.id) && FeatureAvailabilityResolver.canUseFeature(feat.id, {
        featureFlags,
        userPermissions: [],
        tenantEntitlements: []
      })

      if (isAvailable && feat.navigation?.adminMenu) {
        dynamicItems.push({
          label: feat.navigation.adminMenu.label,
          path: feat.navigation.adminMenu.path,
          icon: feat.navigation.adminMenu.icon
        })
      }
    })
  }

  const menuItems = [
    ...dynamicItems,
    { label: 'Ajustes', path: '/admin', icon: 'Settings' }
  ]

  const activeItem = menuItems.find(item => item.path === location.pathname) || { label: 'Administración', path: '/admin' }

  return (
    <div className="min-h-screen bg-app flex" style={{ color: 'var(--color-text)' }}>
      {/* Sidebar Backdrop (móvil) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-surface border-r border-app transition-transform duration-300 lg:translate-x-0 lg:static shrink-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header del Sidebar */}
          <div className="h-16 px-6 border-b border-app flex items-center gap-3 bg-surface-2">
            {appIcon ? (
              <img src={appIcon} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black">P</div>
            )}
            <span className="font-black text-sm truncate">{appName || 'Prototype CLI'}</span>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = LucideIcons[item.icon] || LucideIcons.LayoutGrid
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    setSidebarOpen(false)
                  }}
                  className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 font-semibold text-xs transition-all active:scale-98 border-none cursor-pointer ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/15'
                      : 'bg-transparent text-muted hover:bg-surface-2 hover:text-app'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer del Sidebar (Sesión del Usuario) */}
          <div className="p-4 border-t border-app bg-surface-2/40">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-surface border border-app mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-app truncate">{user?.email || 'Administrador'}</p>
                <p className="text-[9px] text-muted">admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full h-11 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-500 font-bold text-xs flex items-center justify-center gap-2 transition-colors border-none cursor-pointer"
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar */}
        <header className="h-16 px-6 bg-surface border-b border-app flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden w-10 h-10 rounded-xl bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-muted border-none cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-black text-sm md:text-base text-app capitalize">{activeItem.label}</h1>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-1 overflow-y-auto p-6 bg-surface-3">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
