import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AppLoader from '../components/ui/AppLoader'
import ProtectedRoute from '../components/common/ProtectedRoute'
import MainLayout from '../layouts/MainLayout'
import { NavigationRegistry } from '../core/config/NavigationRegistry'

// ─── Lazy loading de páginas Core ───────────────────────────────────────────
const WelcomePage = lazy(() => import('../pages/WelcomePage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

/**
 * AppRoutes — Orquestador central de rutas y guards del Core Seed.
 * Inyecta dinámicamente las rutas registradas por las features activas en runtime.
 */
export default function AppRoutes() {
  const allRoutes = NavigationRegistry.getAllRoutes()

  // Separar las rutas de administración de las rutas del portal de cliente/públicas
  const adminRoutes = allRoutes.filter(r => r.path && r.path.startsWith('/admin/'))
  const clientRoutes = allRoutes.filter(r => r.path && !r.path.startsWith('/admin/'))

  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>
        {/* Rutas Públicas de Core */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas dinámicas de Cliente / Públicas aportadas por features */}
        {clientRoutes.map((route) => {
          const Element = route.element
          return (
            <Route 
              key={route.path} 
              path={route.path} 
              element={<Element />} 
            />
          )
        })}

        {/* Rutas Protegidas de Administración */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminSettings />} />
          
          {/* Rutas dinámicas administrativas aportadas por features */}
          {adminRoutes.map((route) => {
            const Element = route.element
            // Convertimos la ruta absoluta /admin/path a relativa para que sea hija del MainLayout
            const relativePath = route.path.replace(/^\/admin\/?/, '')
            return (
              <Route 
                key={route.path} 
                path={relativePath} 
                element={<Element />} 
              />
            )
          })}
        </Route>

        {/* Ruta 404 */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  )
}
