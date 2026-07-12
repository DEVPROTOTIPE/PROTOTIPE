import { useState, useEffect } from 'react'
import { showAlert } from '../services/alertService'

export default function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isDismissed, setIsDismissed] = useState(() => {
    // 1. Verificar si está descartado permanentemente
    const permanentDismiss = localStorage.getItem('pwa-install-dismissed') === 'true'
    if (permanentDismiss) return true

    // 2. Verificar si se pospuso temporalmente (Recordar más tarde)
    const remindLaterTime = localStorage.getItem('pwa-install-remind-later')
    if (remindLaterTime) {
      const hoursPassed = (Date.now() - Number(remindLaterTime)) / (1000 * 60 * 60)
      if (hoursPassed < 24) {
        return true // Aún en periodo de gracia de 24h
      }
    }
    return false
  })

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = () => {
    if (!installPrompt) {
      const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
      if (isIOS) {
        showAlert({
          title: 'Instalar en iOS',
          message: '1. Pulsa el botón "Compartir" (↑) en la barra inferior de Safari.\n2. Desliza y selecciona "Agregar a la pantalla de inicio".\n3. Confirma pulsando "Agregar".',
          variant: 'info'
        })
      } else {
        showAlert({
          title: 'Instalar en Android/Chrome',
          message: '1. Abre el menú del navegador (⋮ o ≡ en la esquina superior derecha).\n2. Selecciona "Instalar aplicación" o "Agregar a la pantalla de inicio".',
          variant: 'info'
        })
      }
      return
    }
    
    try {
      // Invocar prompt() de forma 100% síncrona dentro del click handler para cumplir reglas de seguridad
      installPrompt.prompt()
      
      installPrompt.userChoice.then(({ outcome }) => {
        if (outcome === 'accepted') {
          setInstallPrompt(null)
          setIsInstallable(false)
        }
      }).catch(err => {
        console.warn('[PWA Install] Error en userChoice:', err)
      })
    } catch (err) {
      console.warn('[PWA Install] El prompt nativo falló, mostrando instrucciones manuales:', err)
      showAlert({
        title: 'Instalar aplicación',
        message: '1. Abre el menú del navegador (⋮ o ≡ en la esquina superior derecha).\n2. Selecciona "Instalar aplicación" o "Agregar a la pantalla de inicio".',
        variant: 'info'
      })
    }
  }

  const dismissPrompt = (remindLater = false) => {
    if (remindLater) {
      // Recordar más tarde: guardar fecha actual
      localStorage.setItem('pwa-install-remind-later', Date.now().toString())
    } else {
      // Cerrar permanentemente
      localStorage.setItem('pwa-install-dismissed', 'true')
    }
    setIsDismissed(true)
  }

  return { 
    isInstallable: isInstallable && !isDismissed, 
    rawInstallable: isInstallable,
    handleInstall, 
    dismissPrompt 
  }
}
