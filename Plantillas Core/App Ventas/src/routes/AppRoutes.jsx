import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import useAuthStore from '../store/authStore'
import { ROLES } from '../constants'
import AppLoader from '../components/ui/AppLoader'
import RequirePortalAuth from '../components/portal/RequirePortalAuth'
import { ErrorBoundaryFallback } from '../components/ui/feedback/ErrorBoundaryFallback'
import useAppConfigStore from '../store/appConfigStore'
import { getAvailableFeatureModules } from '../core/features/featureModuleLoader'

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

// Redirección de ruta no encontrada — va directo al destino correcto sin
// pasar por WelcomePage, evitando el loop: * → / → /tienda/catalogo → * → …
function NotFoundRedirect() {
  const { user, role, isLoading } = useAuthStore()
  if (isLoading) return <AppLoader />
  // Mismo criterio que RequireAuth: sin `user` no hay sesión real, sin
  // importar lo que diga `role` (defensa en profundidad, mismo patrón).
  if (user && role === ROLES.ADMIN) return <Navigate to="/admin/inicio" replace />
  if (user && role === ROLES.CLIENT) return <Navigate to="/tienda/catalogo" replace />
  return <Navigate to="/login" replace />
}

export default function AppRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActiveRoutes() {
      try {
        const list = [];
        const isFeatureEnabled = useAppConfigStore.getState().isFeatureEnabled;
        const availableModules = getAvailableFeatureModules();

        for (const featureId in availableModules) {
          if (isFeatureEnabled(featureId)) {
            const loader = availableModules[featureId];
            const featureModule = await loader();

            // Validar contrato de ID físico
            if (featureModule?.id && featureModule.id !== featureId) {
              console.warn(`[AppRoutes] Colisión técnica: El ID del manifiesto físico "${featureModule.id}" no coincide con el featureId del path "${featureId}"`);
            }

            if (featureModule?.routes && Array.isArray(featureModule.routes)) {
              list.push(...featureModule.routes);
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
        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
    </Suspense>
  )
}
