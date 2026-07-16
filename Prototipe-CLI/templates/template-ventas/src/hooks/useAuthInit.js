import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../config/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import useAuthStore from '../store/authStore'
import { ROLES, COLLECTIONS } from '../constants'

/**
 * Hook para inicializar la autenticación de la aplicación.
 * Maneja la lógica híbrida de sesión y valida privilegios del administrador.
 */
export default function useAuthInit() {
  const { role, setAdmin, setLoading, logout } = useAuthStore()

  useEffect(() => {
    // 1. Si el LocalStorage ya hidrató un Cliente, apagamos el spinner de inmediato
    // salvo que estemos intentando entrar al panel de administración.
    if (role === ROLES.CLIENT && !window.location.pathname.startsWith('/admin')) {
      setLoading(false)
    }

    // 2. Escuchamos cambios en Firebase Auth (para el Administrador)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Hay un usuario autenticado en Firebase. Verificamos que sea un administrador en Firestore.
        const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid)
        getDoc(userRef)
          .then((userSnap) => {
            const isAdminRole = userSnap.exists() && userSnap.data().role === 'admin'

            if (isAdminRole) {
              const userData = userSnap.data()
              setAdmin({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: userData.nombre || 'Administrador',
                photoURL: firebaseUser.photoURL || null
              })
            } else if (window.location.pathname.startsWith('/admin')) {
              // SEC-015: este forzado de cierre de sesión solo debe aplicar
              // en el panel admin. onAuthStateChanged es global — también
              // dispara para las sesiones anónimas de clientes (SEC-014) y
              // de empleados (SEC-015), que nunca tendrán un doc users/{uid}
              // con role:'admin'. Sin este guard, este listener las
              // desloguearía a los pocos milisegundos de crearse en
              // cualquier ruta fuera de /admin.
              console.warn('[useAuthInit] Intento de acceso no autorizado. Cerrando sesión.')
              // Establecemos el mensaje de error en el store global para que LoginPage lo capture
              useAuthStore.setState({ error: 'Acceso denegado. Este usuario no tiene permisos de administrador.' })
              // Limpiamos el estado local sincrónicamente para apagar el spinner e impedir bloqueos
              logout()
              auth.signOut().catch((err) => {
                console.error('[useAuthInit] Error al cerrar sesión en Firebase:', err)
              })
            }
          })
          .catch((err) => {
            console.error('[useAuthInit] Error al verificar rol en Firestore:', err)
            logout()
          })
      } else {
        // Firebase dice que no hay nadie autenticado.
        const currentRole = useAuthStore.getState().role
        if (currentRole === ROLES.ADMIN) {
          logout()
        } else {
          setLoading(false)
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [role, setAdmin, setLoading, logout])
}
