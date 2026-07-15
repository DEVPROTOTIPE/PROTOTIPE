import React, { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import usePortalStore from '../../store/portalStore'
import useAppConfigStore from '../../store/appConfigStore'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, auth } from '../../config/firebaseConfig'

/**
 * Guard para rutas del portal operativo.
 * Si no hay empleado autenticado, o si está deshabilitado, redirige a /portal/auth.
 */
export default function RequirePortalAuth({ children, allowedRole }) {
  const { portalEmployee, clearPortalEmployee } = usePortalStore()
  const { hasMultipleEmployees } = useAppConfigStore()
  const [isValid, setIsValid] = useState(true)
  const [checking, setChecking] = useState(true)

  // SEC-015: además de limpiar el estado local, cierra la sesión real de
  // Firebase Auth del empleado.
  const clearPortalSession = useCallback(() => {
    clearPortalEmployee()
    auth.signOut().catch((err) => {
      console.error('[RequirePortalAuth] Error al cerrar sesión de Firebase:', err)
    })
  }, [clearPortalEmployee])

  // 1. Suscribirse al documento del empleado en Firestore en tiempo real para validar estado activo
  useEffect(() => {
    if (!hasMultipleEmployees || !portalEmployee?.id) {
      setChecking(false)
      return
    }

    // SEC-015: defensa en profundidad — si la sesión real de Firebase Auth
    // no coincide con el authUid vinculado al empleado local, la sesión
    // local es inválida (localStorage forjado o sesión de otro navegador).
    if (portalEmployee.authUid && auth.currentUser?.uid !== portalEmployee.authUid) {
      clearPortalSession()
      setIsValid(false)
      setChecking(false)
      return
    }

    const empRef = doc(db, 'employees', portalEmployee.id)
    const unsubscribe = onSnapshot(empRef, (snapshot) => {
      if (!snapshot.exists()) {
        // Empleado fue eliminado de la BD
        clearPortalSession()
        setIsValid(false)
      } else {
        const empData = snapshot.data()
        // Validamos tanto 'activo !== false' como 'estado === activo' si existe el campo
        const isNotActivoBool = empData.activo === false
        const isNotActivoString = empData.estado && empData.estado !== 'activo'
        
        // Validamos si el rol en Firestore cambió respecto a la sesión activa local
        const isRoleChanged = empData.rol && empData.rol !== portalEmployee.rol
        
        if (isNotActivoBool || isNotActivoString || isRoleChanged) {
          // Empleado deshabilitado o con rol modificado
          clearPortalSession()
          setIsValid(false)
        }
      }
      setChecking(false)
    }, (error) => {
      console.error("Error validando empleado:", error)
      clearPortalSession()
      setIsValid(false)
      setChecking(false)
    })

    return () => unsubscribe()
  }, [portalEmployee?.id, portalEmployee?.rol, portalEmployee?.authUid, hasMultipleEmployees, clearPortalSession])

  // 2. Validar switch global
  if (!hasMultipleEmployees) {
    if (portalEmployee) {
      clearPortalSession()
    }
    return <Navigate to="/portal/auth" replace />
  }

  // 3. Validar sesión local
  if (!portalEmployee) {
    return <Navigate to="/portal/auth" replace />
  }

  if (allowedRole && portalEmployee.rol !== allowedRole) {
    return <Navigate to="/portal/auth" replace />
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-app flex flex-col items-center justify-center p-4">
        <p className="text-sm font-bold text-muted animate-pulse">Verificando credenciales...</p>
      </div>
    )
  }

  if (!isValid) {
    return <Navigate to="/portal/auth" replace />
  }

  return children
}
