import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import useAuthStore from '../store/authStore'
import { ROLES } from '../constants'
import AppLoader from '../components/ui/AppLoader'
import RequirePortalAuth from '../components/portal/RequirePortalAuth'
import { ErrorBoundaryFallback } from '../components/ui/feedback/ErrorBoundaryFallback'
import { FeatureRegistry } from '../core/config/FeatureRegistry'

// ─── Lazy loading de layouts y páginas del Core ────────────────────────────
const WelcomePage = lazy(() => import('../pages/WelcomePage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const AdminLayout = lazy(() => import('../layouts/AdminLayout'))
const ClientLayout = lazy(() => import('../layouts/ClientLayout'))
const PortalLayout = lazy(() => import('../layouts/PortalLayout'))
const PortalAuth = lazy(() => import('../pages/portal/PortalAuth'))

const AdminHome = lazy(() => import('../pages/admin/AdminHome'))
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'))
const AdminClaims = lazy(() => import('../pages/admin/AdminClaims'))

const ClientProfile = lazy(() => import('../pages/client/ClientProfile'))

// Escaneo diferido de las rutas de todas las features
const featureRoutesLoaders = import.meta.glob('../features/*/routes.jsx');

// Guard de rutas por rol
function RequireAuth({ children, allowedRole }) {
  const { user, role, isLoading } = useAuthStore()

  if (isLoading) return <AppLoader />
  if (!user) return <Navigate to="/login" replace />
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function AppRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActiveRoutes() {
      try {
        const list = [];
        for (const path in featureRoutesLoaders) {
          // Extrae el ID de la feature (e.g. "../features/inventory/routes.jsx" -> "inventory")
          const featureId = path.split('/')[2];
          
          if (FeatureRegistry.isEnabled(featureId)) {
            const module = await featureRoutesLoaders[path]();
            const key = `${featureId}Routes`;
            if (module[key]) {
              list.push(...module[key]);
            }
          }
        }
        setRoutes(list);
      } catch (err) {
        console.error('❌ [AppRoutes] Error al cargar rutas dinámicas:', err);
      } finally {
        setLoading(false);
      }
    }
    loadActiveRoutes();
  }, []);

  if (loading) return <AppLoader />;

  // Filtrar rutas por su layout padre
  const adminRoutes = routes.filter(r => r.parent === 'admin');
  const clientRoutes = routes.filter(r => r.parent === 'client');
  const portalRoutes = routes.filter(r => r.parent === 'portal');
  const rootRoutes = routes.filter(r => r.parent === 'root' || !r.parent);

  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>
        {/* ─── Ruta pública: Login ─────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />

        {/* ─── Rutas del Administrador (Layout Dinámico) ───────────────── */}
        <Route
          path="/admin"
          element={
            <RequireAuth allowedRole={ROLES.ADMIN}>
              <ErrorBoundaryFallback fallbackTitle="Falla Crítica en Admin" fallbackDesc="El panel de control del administrador ha fallado.">
                <AdminLayout />
              </ErrorBoundaryFallback>
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<AdminHome />} />
          <Route path="configuracion" element={<AdminSettings />} />
          <Route path="reclamos" element={<AdminClaims />} />
          {adminRoutes.map(r => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Route>

        {/* ─── Rutas del Cliente (Layout Dinámico) ─────────────────────── */}
        <Route
          path="/tienda"
          element={
            <RequireAuth allowedRole={ROLES.CLIENT}>
              <ErrorBoundaryFallback fallbackTitle="Falla Crítica en Tienda" fallbackDesc="El portal del cliente ha fallado.">
                <ClientLayout />
              </ErrorBoundaryFallback>
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="catalogo" replace />} />
          <Route path="perfil" element={<ClientProfile />} />
          {clientRoutes.map(r => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Route>

        {/* ─── Portal Operativo: Autenticación por PIN ─────────────────── */}
        <Route path="/portal/auth" element={<PortalAuth />} />

        {/* ─── Portal Operativo: Portales de Trabajo (Layout Dinámico) ─── */}
        <Route
          path="/portal"
          element={
            <ErrorBoundaryFallback fallbackTitle="Falla Crítica en Portales" fallbackDesc="El portal operativo de trabajo ha fallado.">
              <PortalLayout />
            </ErrorBoundaryFallback>
          }
        >
          {portalRoutes.map(r => (
            <Route 
              key={r.path} 
              path={r.path} 
              element={
                r.roleRequired ? (
                  <RequirePortalAuth allowedRole={r.roleRequired}>
                    {r.element}
                  </RequirePortalAuth>
                ) : r.element
              } 
            />
          ))}
        </Route>

        {/* ─── Rutas de Raíz Inyectadas y Públicas ─────────────────────── */}
        {rootRoutes.map(r => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}

        <Route path="/" element={<WelcomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
