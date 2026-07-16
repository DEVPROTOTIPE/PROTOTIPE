import { useEffect } from 'react'
import { signInAnonymously } from 'firebase/auth'
import { auth } from '../config/firebaseConfig'

/**
 * SEC-014: da a cada visitante del área de cliente una sesión real de
 * Firebase Auth anónima, vinculada al navegador (persistencia por defecto
 * de la SDK). No verifica quién es la persona — solo permite que
 * firestore.rules distinga "el mismo dispositivo que reclamó este celular"
 * de cualquier otro. Separado de useAuthInit() a propósito: ese hook
 * desloguea a cualquier sesión de Firebase Auth que no resuelva a un admin
 * en Firestore, lo que entraría en conflicto directo con una sesión anónima.
 */
export default function useAnonAuthInit() {
  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) return
    if (auth.currentUser) return

    signInAnonymously(auth).catch((err) => {
      console.error('[useAnonAuthInit] No se pudo iniciar sesión anónima:', err)
    })
  }, [])
}
