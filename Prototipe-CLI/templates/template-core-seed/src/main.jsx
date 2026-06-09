import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Registrar Service Worker para PWA (auto-update instantáneo)
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA Update] Nueva versión detectada, recargando aplicación...')
    updateSW(true).then(() => {
      window.location.reload()
    })
  },
  onOfflineReady() {
    console.log('[PWA] Aplicación lista para funcionar offline.')
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
