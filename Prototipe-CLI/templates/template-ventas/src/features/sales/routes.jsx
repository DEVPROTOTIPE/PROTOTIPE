import { lazy } from 'react';
import { ROLES } from '../../constants';

const AdminSales = lazy(() => import('../../pages/admin/AdminSales'));
const AdminSalesDetail = lazy(() => import('../../pages/admin/AdminSalesDetail'));
const PortalVendedor = lazy(() => import('../../pages/portal/PortalVendedor'));

export const salesRoutes = [
  // Rutas administrativas
  {
    path: 'ventas',
    element: <AdminSales />,
    parent: 'admin'
  },
  {
    path: 'inicio/detalle-ventas',
    element: <AdminSalesDetail />,
    parent: 'admin'
  },

  // Rutas de portales operativos
  {
    path: 'vendedor',
    element: <PortalVendedor />,
    parent: 'portal',
    roleRequired: ROLES.VENDEDOR
  }
];
