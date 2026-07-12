import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { MotionConfig, AnimatePresence, motion } from 'framer-motion'
import AppRoutes from './routes/AppRoutes'
import BackgroundCanvas from './components/ui/BackgroundCanvas'
import SparkQuotaBanner from './components/common/SparkQuotaBanner'
import useAppConfigStore from './store/appConfigStore'
import useAppConfigSync from './hooks/useAppConfigSync'
import useAuthInit from './hooks/useAuthInit'
import { getActiveColors } from './constants/palettes'
import { FONTS } from './constants/fonts'
import { ToastProvider } from './components/common/ToastProvider'
import { AlertConfirmProvider } from './components/common/AlertConfirmContext'
import { reportAppFailureToDeveloper } from './services/telemetryService'

// ─── Cliente de TanStack Query (caché global, reintentos automáticos) ─────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutos de caché
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

// ─── Fallback de error global ────────────────────────────────────────────────
function AppErrorFallback({ error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app p-6">
      <div className="bg-surface rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-app">
        <p className="text-4xl mb-4">⚠️</p>
        <h2 className="text-xl font-bold text-app mb-2">Algo salió mal</h2>
        <p className="text-muted text-sm mb-6">{error?.message || 'Error inesperado'}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 active:scale-95 hover:opacity-90"
          aria-label="Recargar página"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}

// ─── Componente que aplica el tema y modo oscuro desde el store ───────────────
function ThemeApplier() {
  const { theme, activeSeasonalEvent, isDarkMode, appFont, appRadius, actionColor, animationsEnabled } = useAppConfigStore()

  useEffect(() => {
    const root = document.documentElement
    
    // Aplicar atributo data-theme y clase dark para utilidades Tailwind
    if (typeof theme === 'string') {
      root.setAttribute('data-theme', theme)
    } else if (theme && theme.id) {
      root.setAttribute('data-theme', theme.id)
    }
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Calcular e inyectar colores dinámicos base incluyendo el evento estacional activo
    const activeColors = getActiveColors(theme, isDarkMode, activeSeasonalEvent)
    
    Object.entries(activeColors).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // ─── 1. Aplicar Fuente ───────────────────────────────────────────────
    const fontConfig = FONTS[appFont] || FONTS.inter
    // Cargar la fuente dinámicamente inyectando link en el head
    let fontLink = document.getElementById('dynamic-font')
    if (!fontLink) {
      fontLink = document.createElement('link')
      fontLink.id = 'dynamic-font'
      fontLink.rel = 'stylesheet'
      document.head.appendChild(fontLink)
    }
    if (fontLink.href !== fontConfig.url) {
      fontLink.href = fontConfig.url
    }
    // Establecer variable CSS global
    root.style.setProperty('--font-body', `"${fontConfig.name}", system-ui, sans-serif`)

    // ─── 2. Aplicar Radio de Bordes ──────────────────────────────────────
    const radiusMap = {
      squared: '0.25rem', // 4px
      rounded: '0.75rem', // 12px
      pill: '2rem'        // 32px
    }
    root.style.setProperty('--radius-base', radiusMap[appRadius] || radiusMap.rounded)

    // ─── 3. Aplicar Color de Acción ──────────────────────────────────────
    if (actionColor) {
      root.style.setProperty('--color-action', actionColor)
    } else {
      root.style.setProperty('--color-action', activeColors['--color-primary'])
    }

    // ─── 4. Aplicar Animaciones ──────────────────────────────────────────
    if (animationsEnabled) {
      root.classList.remove('no-animations')
    } else {
      root.classList.add('no-animations')
    }

    // ─── 5. Sincronizar theme-color meta tag del Navegador Móvil y PWA ───
    const themeBgColor = activeColors['--color-bg'] || (isDarkMode ? '#0f0f0f' : '#ffffff')
    let themeMetaTag = document.querySelector('meta[name="theme-color"]')
    if (!themeMetaTag) {
      themeMetaTag = document.createElement('meta')
      themeMetaTag.name = 'theme-color'
      document.head.appendChild(themeMetaTag)
    }
    themeMetaTag.setAttribute('content', themeBgColor)
    
  }, [theme, activeSeasonalEvent, isDarkMode, appFont, appRadius, actionColor, animationsEnabled])

  return null
}

import { updateDynamicManifest } from './utils/dynamicManifest'
import AppLoader from './components/ui/AppLoader'

export default function App() {
  const [experienceLoaded, setExperienceLoaded] = useState(false)
  const [featuresLoaded, setFeaturesLoaded] = useState(false)

  // Carga asíncrona, registro de features en runtime y Bootstrap de Experiencia
  useEffect(() => {
    async function bootstrapApp() {
      try {
        // 1. Bootstrap y validación estricta de manifiestos (Zod)
        const { ExperienceRegistry } = await import('./core/experience/ExperienceRegistry')
        await ExperienceRegistry.bootstrap()
        setExperienceLoaded(true)

        // 2. Cargar features resueltas
        const activeFeatures = ExperienceRegistry.activeFeatures
        const { FeatureLoader } = await import('./core/kernel/FeatureLoader')
        await FeatureLoader.load(activeFeatures)
      } catch (err) {
        console.error('[App Bootstrap] Fallo crítico al inicializar la aplicación:', err)
      } finally {
        setFeaturesLoaded(true)
      }
    }
    bootstrapApp()
  }, [])

  // Inicialización de la sesión global híbrida (LocalStorage + Firebase)
  useAuthInit()
  
  // Sincronización global Firestore <-> Zustand en tiempo real
  useAppConfigSync()

  const [activePingRequest, setActivePingRequest] = useState(null)
  const pingTimeoutRef = useRef(null)

  // Escuchar solicitudes de ping test interactivo (telemetría central)
  useEffect(() => {
    const handlePingRequest = (e) => {
      if (e.detail?.respond) {
        if (pingTimeoutRef.current) {
          clearTimeout(pingTimeoutRef.current)
        }
        setActivePingRequest({ respond: e.detail.respond })
        
        // Autocierre en 30s por inactividad
        pingTimeoutRef.current = setTimeout(() => {
          setActivePingRequest(null)
          console.debug('[App] La prueba de conexión ha expirado por inactividad.')
        }, 30000)
      }
    }
    window.addEventListener('ping-test-requested', handlePingRequest)
    return () => {
      window.removeEventListener('ping-test-requested', handlePingRequest)
      if (pingTimeoutRef.current) {
        clearTimeout(pingTimeoutRef.current)
      }
    }
  }, [])

  const { 
    isLoaded, 
    appName, 
    appIcon, 
    pwaAppName, 
    pwaAppIcon, 
    pwaUseBrandIcon, 
    theme, 
    activeSeasonalEvent, 
    isDarkMode, 
    animationsEnabled,
    maintenanceMode,
    deactivated,
    deactivationReason
  } = useAppConfigStore()

  // Activar transiciones de fondo únicamente después de la hidratación y pintado inicial (evita FOUC cromático)
  useEffect(() => {
    const timer = setTimeout(() => {
      document.documentElement.classList.add('with-transitions')
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Monitoreo de Errores Globales (Reporte a Consola Central)
  useEffect(() => {
    const handleGlobalError = (event) => {
      const error = event.error || {};
      reportAppFailureToDeveloper(
        error.message || event.message || "Error Desconocido",
        error.stack || `${event.filename}:${event.lineno}:${event.colno}`
      );
    };

    const handleUnhandledRejection = (event) => {
      const reason = event.reason || {};
      reportAppFailureToDeveloper(
        reason.message || (typeof reason === 'string' ? reason : "Rechazo de promesa no controlado"),
        reason.stack || "Promise Unhandled Rejection Stack Unavailable"
      );
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Determinar si es la primera carga absoluta (sin caché local) y aún no se ha descargado de Firestore
  const isFirstLoad = !isLoaded && !localStorage.getItem('app-config-storage')

  // Actualizar el manifest PWA y el favicon en tiempo real cuando cambie el nombre o logo
  useEffect(() => {
    const titleToUse = pwaAppName || appName
    if (titleToUse) {
      document.title = titleToUse
      const activeColors = getActiveColors(theme, isDarkMode, activeSeasonalEvent)
      const primaryColor = activeColors['--color-primary']
      const bgColor = activeColors['--color-bg']
      updateDynamicManifest(appName, appIcon, pwaAppName, pwaAppIcon, pwaUseBrandIcon, primaryColor, bgColor)
    }

    // Actualizar el favicon con la imagen de marca o el favicon por defecto
    const faviconToUse = appIcon || '/favicon.svg'
    const link = document.querySelector("link[rel~='icon']")
    if (link) {
      link.href = faviconToUse
      if (appIcon) {
        link.type = 'image/png'
      } else {
        link.type = 'image/svg+xml'
      }
    }
  }, [appName, appIcon, pwaAppName, pwaAppIcon, pwaUseBrandIcon, theme, activeSeasonalEvent, isDarkMode])

  if (isFirstLoad || !experienceLoaded || !featuresLoaded) {
    return (
      <div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdfbfb]"
        style={{
          background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div className="relative w-20 h-20 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 border-t-gray-600 animate-spin" />
          <span className="text-3xl animate-pulse" role="img" aria-label="Cargando">🚀</span>
        </div>
        <div className="space-y-1 text-center animate-pulse">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">
            Iniciando App
          </h2>
          <p className="text-xs text-gray-400 font-semibold">
            Sincronizando diseño y servicios...
          </p>
        </div>
      </div>
    )
  }

  if (deactivated) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-6 bg-app"
        style={{
          background: 'linear-gradient(135deg, var(--color-bg) 0%, var(--color-surface) 100%)',
          fontFamily: 'var(--font-body), system-ui, sans-serif'
        }}
      >
        <div className="relative overflow-hidden bg-[var(--color-surface-2)]/40 backdrop-blur-xl border border-[var(--color-border)] rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-2xl flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-alert">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M12 8v4"/>
              <path d="M12 16h.01"/>
            </svg>
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight">Servicio Suspendido</h1>
            <p className="text-sm text-[var(--color-text-muted)] font-semibold leading-relaxed">
              {deactivationReason || 'Esta aplicación ha sido desactivada temporalmente por la administración. Comunícate con soporte técnico para resolver el estado de tu cuenta.'}
            </p>
          </div>
          <div className="w-full h-px bg-[var(--color-border)]" />
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <a
              href="https://wa.me/573000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-6 h-11 bg-red-650 hover:opacity-90 text-white !text-white text-sm font-black uppercase tracking-wider rounded-2xl active:scale-95 transition-all cursor-pointer shadow-md border-none flex items-center justify-center gap-2"
            >
              Contactar Soporte
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (maintenanceMode) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-6 bg-app"
        style={{
          background: 'linear-gradient(135deg, var(--color-bg) 0%, var(--color-surface) 100%)',
          fontFamily: 'var(--font-body), system-ui, sans-serif'
        }}
      >
        <div className="relative overflow-hidden bg-[var(--color-surface-2)]/40 backdrop-blur-xl border border-[var(--color-border)] rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-2xl flex flex-col items-center gap-6">
          {/* Círculo con Icono en Animación de Rotación */}
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] border border-[var(--color-primary)]/20 animate-[spin_10s_linear_infinite]">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wrench"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight">Mejorando tu Experiencia</h1>
            <p className="text-sm text-[var(--color-text-muted)] font-semibold leading-relaxed">
              Estamos realizando labores de mantenimiento programadas para optimizar el rendimiento y la seguridad de la tienda. Volveremos muy pronto.
            </p>
          </div>
          <div className="w-full h-px bg-[var(--color-border)]" />
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
              onClick={() => window.location.reload()}
              className="py-3 px-6 h-11 bg-[var(--color-primary)] hover:opacity-90 text-white !text-white text-sm font-black uppercase tracking-wider rounded-2xl active:scale-95 transition-all cursor-pointer shadow-md border-none flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
              Verificar Estado
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary 
      FallbackComponent={AppErrorFallback}
      onError={(error, info) => {
        reportAppFailureToDeveloper(
          error?.message || error?.toString(),
          error?.stack || info?.componentStack
        );
      }}
    >
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion={animationsEnabled ? "user" : "always"}>
          <BrowserRouter>
            <ToastProvider>
              <AlertConfirmProvider>
                <ThemeApplier />
                <BackgroundCanvas />
                <SparkQuotaBanner />
                <AppRoutes />

            {/* Modal de Prueba de Conexión (Ping Test) — Reutiliza diseño premium y contrastes */}
            <AnimatePresence>
              {activePingRequest && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActivePingRequest(null)}
                    style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(5, 8, 16, 0.82)', backdropFilter: 'blur(8px)' }}
                  />
                  
                  {/* Contenedor Alerta — theme-aware */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.85, opacity: 0, y: 30 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                    className="relative rounded-3xl shadow-2xl p-7 max-w-md w-full flex flex-col items-center text-center gap-5 z-10 font-sans"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid rgba(99, 102, 241, 0.25)'
                    }}
                  >
                    {/* Icono de Telemetría */}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border bg-indigo-500/15 text-indigo-500 border-indigo-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2Z"/>
                        <path d="M12 6a6 6 0 0 1 6 6c0 3.314-2.686 6-6 6s-6-2.686-6-6a6 6 0 0 1 6-6Z"/>
                        <circle cx="12" cy="12" r="2"/>
                      </svg>
                    </div>

                    {/* Textos */}
                    <div className="space-y-2">
                      <p className="text-base font-black uppercase tracking-wide text-indigo-500">Prueba de Conexión</p>
                      <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        Se ha iniciado una prueba de conectividad desde la Consola Central del desarrollador. Por favor, confirme para verificar la conexión.
                      </p>
                    </div>

                    {/* Botón de Confirmar y Descartar */}
                    <div className="w-full flex flex-col gap-3">
                      <button
                        onClick={() => {
                          if (activePingRequest.respond) {
                            activePingRequest.respond()
                              .then(() => {
                                console.log('[App] Ping respondido correctamente al dashboard.')
                              })
                              .catch((err) => {
                                      console.warn('[App] Error al responder al ping:', err)
                              })
                          }
                          setActivePingRequest(null)
                        }}
                        className="w-full h-11 rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-sm border-none cursor-pointer"
                        style={{
                          background: 'var(--color-primary)',
                          color: '#ffffff',
                          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)'
                        }}
                      >
                        Confirmar Conexión
                      </button>
                      
                      <button
                        onClick={() => setActivePingRequest(null)}
                        className="w-full bg-transparent hover:bg-neutral-500/5 h-9 rounded-xl font-semibold text-xs active:scale-95 transition-all border-none cursor-pointer"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Descartar prueba
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
              </AlertConfirmProvider>
            </ToastProvider>
          </BrowserRouter>
        </MotionConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
