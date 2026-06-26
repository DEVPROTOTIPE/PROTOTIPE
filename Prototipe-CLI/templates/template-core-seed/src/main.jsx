import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Registrar Service Worker para PWA (estrategia auto-update transparente de Workbox)
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true)
  },
  onOfflineReady() {
    console.log('[PWA] Aplicación lista para funcionar offline.')
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
