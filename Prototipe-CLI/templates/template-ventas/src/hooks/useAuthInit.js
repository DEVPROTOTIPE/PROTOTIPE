import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../config/firebaseConfig'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import useAuthStore from '../store/authStore'
import useAppConfigStore from '../store/appConfigStore'
import { ROLES, COLLECTIONS } from '../constants'

/**
 * Hook para inicializar la autenticación de la aplicación.
 * Maneja la lógica híbrida:
 * 1. Clientes: Viven en LocalStorage (hidratación de Zustand).
 * 2. Administradores: Viven en Firebase Auth.
 */
export default function useAuthInit() {
  const { role, setAdmin, setLoading, logout } = useAuthStore()

  useEffect(() => {
    // 1. Si el LocalStorage ya hidrató un Cliente, apagamos el spinner de inmediato
    // salvo que estemos intentando entrar al panel de administración (esperamos a Firebase Auth).
    if (role === ROLES.CLIENT && !window.location.pathname.startsWith('/admin')) {
      setLoading(false)
    }

    // 2. Escuchamos cambios en Firebase Auth (para el Administrador)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Hay un administrador autenticado en Firebase
        setAdmin(firebaseUser) // setAdmin pone isLoading en false automáticamente

        // Auto-recrear el perfil del administrador en Firestore si se eliminó de la colección de users
        const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid)
        getDoc(userRef)
          .then((userSnap) => {
            if (!userSnap.exists()) {
              const configState = useAppConfigStore.getState()
              const finalName = configState.sellerName || 'Administrador'
              const finalWhatsapp = configState.whatsappAdmin || ''

              const adminData = {
                email: firebaseUser.email,
                role: 'admin',
                nombre: finalName,
                whatsapp: finalWhatsapp,
                updatedAt: serverTimestamp()
              }
              setDoc(userRef, adminData, { merge: true })
                .then(() => {
                  console.log('[useAuthInit] Admin profile recreated successfully in Firestore.')
                })
                .catch((err) => {
                  console.error('[useAuthInit] Error auto-recreating admin profile in Firestore:', err)
                })
            }
          })
          .catch((err) => {
            console.error('[useAuthInit] Error checking admin profile in Firestore:', err)
          })
      } else {
        // Firebase dice que no hay nadie autenticado.
        // Si nuestro rol era ADMIN, cerramos su sesión local.
        const currentRole = useAuthStore.getState().role
        if (currentRole === ROLES.ADMIN) {
          logout()
        }
        // En cualquier caso, si no hay firebaseUser, apagamos el spinner
        // para que la app fluya (redirija al login o deje pasar al cliente).
        useAuthStore.getState().setLoading(false)
      }
    })

    return () => {
      unsubscribe()
    }
  }, []) // Solo se ejecuta una vez al montar la App
}

