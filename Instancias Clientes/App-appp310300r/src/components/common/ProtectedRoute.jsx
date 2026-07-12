import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AppLoader from '../ui/AppLoader'

/**
 * ProtectedRoute — Guard de autenticación para proteger páginas privadas
 * del administrador. Redirige a /login si no hay una sesión activa de admin.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return <AppLoader />
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />
  }

  return children
}
