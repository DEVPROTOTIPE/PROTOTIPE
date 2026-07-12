import { lazy } from 'react';
import { ROLES } from '../../constants';

const AdminInventory = lazy(() => import('../../pages/admin/AdminInventory'));
const AdminStockAlerts = lazy(() => import('../../pages/admin/AdminStockAlerts'));
const AdminPortalQR = lazy(() => import('../../pages/admin/AdminPortalQR'));
const AdminQRPerformance = lazy(() => import('../../pages/admin/AdminQRPerformance'));

const ClientCatalog = lazy(() => import('../../pages/client/ClientCatalog'));
const ClientFavorites = lazy(() => import('../../pages/client/ClientFavorites'));
const ProductDetailPage = lazy(() => import('../../pages/client/ProductDetailPage'));
const ProductPublicDetail = lazy(() => import('../../pages/client/ProductPublicDetail'));

const PortalBodega = lazy(() => import('../../pages/portal/PortalBodega'));

export const inventoryRoutes = [
  // Rutas administrativas
  {
    path: 'inventario',
    element: <AdminInventory />,
    parent: 'admin'
  },
  {
    path: 'inicio/alertas-stock',
    element: <AdminStockAlerts />,
    parent: 'admin'
  },
  {
    path: 'portales-qr',
    element: <AdminPortalQR />,
    parent: 'admin'
  },
  {
    path: 'rendimiento-qr',
    element: <AdminQRPerformance />,
    parent: 'admin'
  },

  // Rutas de cliente
  {
    path: 'catalogo',
    element: <ClientCatalog />,
    parent: 'client'
  },
  {
    path: 'favoritos',
    element: <ClientFavorites />,
    parent: 'client'
  },
  {
    path: 'producto/:id',
    element: <ProductDetailPage />,
    parent: 'client'
  },

  // Rutas de portales operativos
  {
    path: 'bodega',
    element: <PortalBodega />,
    parent: 'portal',
    roleRequired: ROLES.BODEGUERO
  },

  // Rutas de raíz / públicas
  {
    path: 'compra-qr/:productId',
    element: <ProductPublicDetail />,
    parent: 'root'
  }
];
