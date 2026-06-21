import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Store de configuración de la aplicación.
 * Refleja en tiempo real los datos cargados desde Firestore /config/settings.
 * Controla: nombre de la app, tema, modo oscuro, paleta de colores.
 */
// Obtener estado inicial persistido síncronamente para evitar FOUC de color (destello rosa inicial) en hidratación asíncrona de Zustand
const getPersistedValue = (key, defaultValue) => {
  try {
    const raw = localStorage.getItem('app-config-storage')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.state && parsed.state[key] !== undefined) {
        return parsed.state[key]
      }
    }
  } catch (e) {}
  return defaultValue
}

const useAppConfigStore = create(
  persist(
    (set) => ({
      // ─── Estado ───────────────────────────────────────────────────────────
      appName: getPersistedValue('appName', 'Mi Aplicación'),
      sellerName: getPersistedValue('sellerName', 'Administrador'),
      appIcon: null,
      welcomeWavesEnabled: getPersistedValue('welcomeWavesEnabled', true),
      theme: getPersistedValue('theme', 'rosa-elegante'),    // Paleta activa por defecto
      isDarkMode: getPersistedValue('isDarkMode', false),
      adminRegistered: false,    // Bandera para Auth Admin
      pwaAppName: '',            // Nombre al instalarse como app móvil
      pwaAppIcon: null,          // Icono personalizado de instalación PWA
      pwaUseBrandIcon: false,    // Usar logo de la app como ícono PWA
      activeSeasonalEvent: getPersistedValue('activeSeasonalEvent', 'none'),
      whatsappAdmin: '',
      developerPhone: '',
      bankInfo: {
        numeroCuenta: '',
        banco: '',
        tipoCuenta: 'ahorros',   // 'ahorros' | 'corriente'
        titular: '',
        cedulaNit: '',
        qrUrl: '',
      },
      bankInfo2: {
        activa: false,           // segunda cuenta habilitada
        numeroCuenta: '',
        banco: '',
        tipoCuenta: 'ahorros',
        focus: false,
        titular: '',
        cedulaNit: '',
        qrUrl: '',
      },
      // ─── Apariencia avanzada ───────────────────────────────────────────
      appFont: getPersistedValue('appFont', 'inter'),
      appRadius: getPersistedValue('appRadius', 'rounded'),
      catalogBanner: { type: 'none', value: '' },
      catalogLayout: 'grid2',
      animationsEnabled: getPersistedValue('animationsEnabled', true),
      actionColor: getPersistedValue('actionColor', ''),
      catalogFilters: {
        categories: true,
        sizes: false,
        colors: false,
        customAttributes: []
      },
      loginTrustMessage: '',  // Mensaje de confianza personalizable
      slogan: '',             // Eslogan de la app
      sistemaAlerta: null,    // Alerta bloqueante remota
      isLoaded: false,

      // ─── Acciones ─────────────────────────────────────────────────────────
      setConfig: (config) => set({ ...config, isLoaded: true }),
      setCatalogFilters: (catalogFilters) => set({ catalogFilters }),

      toggleDarkMode: () => set((state) => {
        const newDark = !state.isDarkMode
        if (newDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        return { isDarkMode: newDark }
      }),

      setTheme: (theme) => set({ theme }),
      setAppName: (name) => set({ appName: name }),
    }),
    {
      name: 'app-config-storage',
      partialize: (state) => ({
        appName: state.appName,
        appIcon: state.appIcon,
        pwaAppName: state.pwaAppName,
        pwaAppIcon: state.pwaAppIcon,
        pwaUseBrandIcon: state.pwaUseBrandIcon,
        welcomeWavesEnabled: state.welcomeWavesEnabled,
        sellerName: state.sellerName,
        isDarkMode: state.isDarkMode,
        theme: state.theme,
        activeSeasonalEvent: state.activeSeasonalEvent,
        appFont: state.appFont,
        appRadius: state.appRadius,
        actionColor: state.actionColor,
        animationsEnabled: state.animationsEnabled,
        loginTrustMessage: state.loginTrustMessage,
        whatsappAdmin: state.whatsappAdmin,
        developerPhone: state.developerPhone,
        slogan: state.slogan,
      }),
    }
  )
)

export default useAppConfigStore
