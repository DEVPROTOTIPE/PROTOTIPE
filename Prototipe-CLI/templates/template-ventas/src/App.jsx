import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { useEffect, useState, useLayoutEffect, useRef } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { MotionConfig, motion, AnimatePresence } from 'framer-motion'
import AppRoutes from './routes/AppRoutes'
import ScrollToTop from './components/common/ScrollToTop'
import CartDrawer from './components/client/cart/CartDrawer'
import GuidedToast from './components/ui/GuidedToast'
import PWAInstallBanner from './components/ui/PWAInstallBanner'
import ConnectivityToast from './components/ui/ConnectivityToast'
import useAppConfigStore from './store/appConfigStore'
import useAppConfigSync from './hooks/useAppConfigSync'
import useAuthInit from './hooks/useAuthInit'
import { getActiveColors } from './constants/palettes'
import { FONTS } from './constants/fonts'
import { AlertConfirmProvider } from './components/common/AlertConfirmContext'

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

// ─── FONTS se importa desde constants/fonts.js ────────────────────────────────

// ─── Componente que aplica el tema y modo oscuro desde el store ───────────────
function ThemeApplier() {
  const { theme, activeSeasonalEvent, isDarkMode, appFont, appRadius, actionColor, animationsEnabled } = useAppConfigStore()

  useLayoutEffect(() => {
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
import { useConnectivityStore } from './store/connectivityStore'

export default function App() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (useAppConfigStore.persist.hasHydrated()) {
      setHydrated(true)
    } else {
      const unsub = useAppConfigStore.persist.onFinishHydration(() => {
        setHydrated(true)
      })
      return unsub
    }
  }, [])

  // Inicialización de la sesión global híbrida (LocalStorage + Firebase)
  useAuthInit()
  
  // Sincronización global Firestore <-> Zustand en tiempo real
  useAppConfigSync()


  const isOnline = useConnectivityStore((state) => state.isOnline)
  const [syncNotification, setSyncNotification] = useState(null)
  const [telemetryReportedPeriod, setTelemetryReportedPeriod] = useState(null)
  const [localDismissedAlert, setLocalDismissedAlert] = useState(false)
  const [activePingRequest, setActivePingRequest] = useState(null)
  const pingTimeoutRef = useRef(null)

  const getAlertDismissKey = (alert) => {
    if (!alert) return ''
    return alert.alertId || `${alert.title}-${alert.message}-${alert.type}`
  }

  const handleDismissAlert = () => {
    setLocalDismissedAlert(true)
    if (sistemaAlerta) {
      localStorage.setItem('dismissed_remote_alert', getAlertDismissKey(sistemaAlerta))
    }
  }

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

  // Escuchar confirmación de telemetría de facturación mensual reportada
  useEffect(() => {
    const handleTelemetryReported = (e) => {
      if (e.detail?.period) {
        setTelemetryReportedPeriod(e.detail.period)
      }
    }
    window.addEventListener('telemetry-billing-reported', handleTelemetryReported)
    return () => window.removeEventListener('telemetry-billing-reported', handleTelemetryReported)
  }, [])

  // Escuchar evento de ventas offline sincronizadas con éxito para mostrar modal premium
  useEffect(() => {
    const handleSyncEvent = (e) => {
      if (e.detail?.count > 0) {
        setSyncNotification({ count: e.detail.count })
      }
    }
    window.addEventListener('offline-sales-synced', handleSyncEvent)
    return () => window.removeEventListener('offline-sales-synced', handleSyncEvent)
  }, [])

  // Disparar sincronización de ventas offline al recuperar la conexión a internet
  useEffect(() => {
    if (isOnline) {
      // Retrasar la primera sincronización 1500ms para permitir que Firestore se reconecte
      const timer = setTimeout(() => {
        import('./services/orderService').then(({ syncOfflineSales }) => {
          syncOfflineSales().catch(err => {
            console.error('[App Offline Sync] Error al sincronizar:', err);
          });
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOnline])

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
    sistemaAlerta
  } = useAppConfigStore()

  const isAlertDismissed = localDismissedAlert || (sistemaAlerta ? localStorage.getItem('dismissed_remote_alert') === getAlertDismissKey(sistemaAlerta) : false)

  const lastAlertRef = useRef(null)

  // Resetear cierre local de alertas únicamente al recibir una alerta con contenido nuevo/diferente
  useEffect(() => {
    if (!sistemaAlerta) {
      lastAlertRef.current = null
      setLocalDismissedAlert(false)
      return
    }
    const alertKey = `${sistemaAlerta.active}-${sistemaAlerta.title}-${sistemaAlerta.message}-${sistemaAlerta.type}-${sistemaAlerta.dismissible}-${sistemaAlerta.alertId || ''}`
    if (lastAlertRef.current !== alertKey) {
      lastAlertRef.current = alertKey
      
      // Comprobar si ya fue cerrada previamente en localStorage
      const wasDismissed = localStorage.getItem('dismissed_remote_alert') === getAlertDismissKey(sistemaAlerta)
      setLocalDismissedAlert(wasDismissed)
    }
  }, [sistemaAlerta])

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
      import('./services/telemetryService').then(({ reportAppFailureToDeveloper }) => {
        reportAppFailureToDeveloper(
          error.message || event.message || "Error Desconocido",
          error.stack || `${event.filename}:${event.lineno}:${event.colno}`
        );
      }).catch(err => console.error('Error al cargar telemetryService:', err));
    };

    const handleUnhandledRejection = (event) => {
      const reason = event.reason || {};
      import('./services/telemetryService').then(({ reportAppFailureToDeveloper }) => {
        reportAppFailureToDeveloper(
          reason.message || (typeof reason === 'string' ? reason : "Rechazo de promesa no controlado"),
          reason.stack || "Promise Unhandled Rejection Stack Unavailable"
        );
      }).catch(err => console.error('Error al cargar telemetryService:', err));
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Determinar si es la primera carga absoluta (sin caché local) y aún no se ha descargado de Firestore
  const hasCachedConfig = appName && appName !== 'Mi Tienda'
  const isFirstLoad = !isLoaded && !hasCachedConfig && !localStorage.getItem('app_config_loaded')

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

  if (!hydrated) return null

  if (isFirstLoad) {
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
          <span className="text-3xl animate-pulse" role="img" aria-label="Cargando">🛍️</span>
        </div>
        <div className="space-y-1 text-center animate-pulse">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">
            Preparando Tienda
          </h2>
          <p className="text-xs text-gray-400 font-semibold">
            Sincronizando diseño y catálogo...
          </p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary 
      FallbackComponent={AppErrorFallback}
      onError={(error, info) => {
        import('./services/telemetryService').then(({ reportAppFailureToDeveloper }) => {
          reportAppFailureToDeveloper(
            error?.message || error?.toString(),
            error?.stack || info?.componentStack
          );
        }).catch(err => console.error('Error reporting failure:', err));
      }}
    >
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion={animationsEnabled ? "user" : "always"}>
          <AlertConfirmProvider>
            <BrowserRouter>
              <ScrollToTop />
              <ThemeApplier />
              <AppRoutes />
              <CartDrawer />
              <GuidedToast />
              <ConnectivityToast />
              <PWAInstallBanner />
              
              {/* Modal de Confirmación de Sincronización Mensual de Telemetría */}
              <AnimatePresence>
                {telemetryReportedPeriod && (
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setTelemetryReportedPeriod(null)}
                      style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}
                    />
                    <motion.div
                      initial={{ scale: 0.88, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.88, opacity: 0, y: 20 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      className="relative bg-surface rounded-3xl border border-app shadow-2xl p-6 max-w-sm w-full flex flex-col items-center text-center gap-4.5 z-10 font-sans"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-sm font-black text-app">¡Reporte Mensual Transmitido!</p>
                        <p className="text-xs text-muted leading-relaxed">
                          La telemetría de facturación y comisiones del periodo <span className="font-extrabold text-indigo-500">{telemetryReportedPeriod}</span> se ha enviado con éxito a la Consola de Control Central.
                        </p>
                      </div>
                      <button
                        onClick={() => setTelemetryReportedPeriod(null)}
                        className="w-full h-11 rounded-2xl font-bold text-sm text-white active:scale-95 transition-all shadow-sm bg-indigo-600 hover:bg-indigo-500 border-none cursor-pointer"
                      >
                        Aceptar
                      </button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Modal de Alerta Remota / Bloqueo (Spam de Pago) */}
              <AnimatePresence>
                {sistemaAlerta && sistemaAlerta.active === true && !isAlertDismissed && (
                  <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={sistemaAlerta.dismissible ? handleDismissAlert : undefined}
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
                        border: `1px solid ${
                          sistemaAlerta.type === 'error' ? 'rgba(239,68,68,0.35)' :
                          sistemaAlerta.type === 'warning' ? 'rgba(245,158,11,0.35)' :
                          'rgba(99,102,241,0.25)'
                        }`
                      }}
                    >
                      {/* Icono */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                        sistemaAlerta.type === 'error' ? 'bg-red-500/15 text-red-500 border-red-500/20' :
                        sistemaAlerta.type === 'warning' ? 'bg-amber-500/15 text-amber-500 border-amber-500/20' :
                        'bg-indigo-500/15 text-indigo-500 border-indigo-500/20'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      </div>

                      {/* Textos */}
                      <div className="space-y-2">
                        <p className={`text-base font-black uppercase tracking-wide ${
                          sistemaAlerta.type === 'error' ? 'text-red-500' :
                          sistemaAlerta.type === 'warning' ? 'text-amber-500' :
                          'text-indigo-500'
                        }`}>{sistemaAlerta.title || 'Aviso de Sistema'}</p>
                        <p className="text-xs leading-relaxed font-medium whitespace-pre-wrap" style={{ color: 'var(--color-text-muted)' }}>
                          {sistemaAlerta.message || 'Se requiere una acción administrativa en el sistema.'}
                        </p>
                      </div>

                      {/* Botón de Cierre — siempre con contraste garantizado */}
                      {sistemaAlerta.dismissible ? (
                        <button
                          onClick={handleDismissAlert}
                          className="w-full h-11 rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-sm border-none cursor-pointer"
                          style={{
                            background:
                              sistemaAlerta.type === 'error' ? '#dc2626' :
                              sistemaAlerta.type === 'warning' ? '#d97706' :
                              'var(--color-primary)',
                            color: '#ffffff',
                            boxShadow:
                              sistemaAlerta.type === 'error' ? '0 4px 15px rgba(220,38,38,0.35)' :
                              sistemaAlerta.type === 'warning' ? '0 4px 15px rgba(217,119,6,0.35)' :
                              '0 4px 15px rgba(99,102,241,0.35)'
                          }}
                        >
                          Entendido / Aceptar
                        </button>
                      ) : (
                        <div className="text-[10px] font-semibold select-none flex items-center gap-1.5 animate-pulse" style={{ color: 'var(--color-text-muted)' }}>
                          <span>🔒 Bloqueo Administrativo Activo</span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

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
              
              {/* Modal Premium de Sincronización de Ventas Offline */}
              <AnimatePresence>
                {syncNotification && (
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSyncNotification(null)}
                      style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                    />
                    {/* Card */}
                    <motion.div
                      initial={{ scale: 0.88, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.88, opacity: 0, y: 20 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      className="relative bg-surface rounded-3xl border border-app shadow-2xl p-6 max-w-xs w-full flex flex-col items-center text-center gap-4 z-10"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wifi"><path d="M12 20h.01"/><path d="M8.5 16.5c3-3 4-3 7 0"/><path d="M5 13a10 9 0 0 1 14 0"/><path d="M2 9.5a15.75 15.75 0 0 1 20 0"/></svg>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-app">¡Ventas Sincronizadas!</p>
                        <p className="text-xs text-muted leading-relaxed">
                          Se han subido exitosamente <span className="font-extrabold text-emerald-500">{syncNotification.count}</span> venta(s) que habías registrado de forma local (offline).
                        </p>
                      </div>
                      <button
                        onClick={() => setSyncNotification(null)}
                        className="w-full h-11 rounded-2xl font-bold text-sm text-white active:scale-95 transition-all shadow-sm bg-emerald-500 hover:bg-emerald-600"
                      >
                        Entendido
                      </button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </BrowserRouter>
          </AlertConfirmProvider>
        </MotionConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
