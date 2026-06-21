import { useState, useCallback } from 'react'

/**
 * useFCMPermission.js (Versión Simplificada/Desactivada)
 * ─────────────────────────────────────────────────────────────────
 * Las notificaciones push en segundo plano por FCM están inactivas
 * debido a que la arquitectura no utiliza Cloud Functions en esta versión.
 * Este hook provee una interfaz dummy limpia para compatibilidad sin warnings.
 * ─────────────────────────────────────────────────────────────────
 */
export default function useFCMPermission(userId, role) {
  const [fcmToken] = useState(null)
  const [permissionStatus] = useState('unsupported')

  const refreshPermissionStatus = useCallback(() => {
    return 'unsupported'
  }, [])

  const requestPermission = useCallback(async () => {
    return 'unsupported'
  }, [])

  return {
    fcmToken,
    permissionStatus,
    requestPermission,
    refreshPermissionStatus,
    isSupported: false
  }
}
