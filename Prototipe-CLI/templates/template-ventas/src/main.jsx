import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'
import { Kernel } from './core/kernel/ApplicationKernel'

// Registrar Service Worker para PWA (estrategia auto-update transparente de Workbox)
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true)
  },
  onOfflineReady() {
    console.log('[PWA] Catálogo listo para uso sin conexión.')
  }
})

// Escuchar la activación del nuevo Service Worker para refrescar la vista en runtime
if ('serviceWorker' in navigator) {
  let refreshing = false
  const hasController = !!navigator.serviceWorker.controller
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing && hasController) {
      refreshing = true
      console.log('[PWA] Nueva versión activada. Recargando para aplicar cambios...')
      window.location.reload()
    }
  })
}

// Inicializar el Kernel y luego arrancar la aplicación React
Kernel.bootstrap()
  .then(() => {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  })
  .catch(err => {
    console.error('❌ [Main Bootstrap Failure] El Kernel de la plataforma falló al arrancar:', err);
    // Render de contingencia ante falla crítica de bootstrap
    createRoot(document.getElementById('root')).render(
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-500">Error de Inicialización</h1>
          <p className="text-slate-400">Hubo un problema al inicializar los servicios centrales de la aplicación. Por favor contacta soporte técnico.</p>
          <pre className="text-xs bg-slate-800 p-3 rounded text-left overflow-auto max-h-40">{err.message || String(err)}</pre>
        </div>
      </div>
    )
  });
