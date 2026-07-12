import { lazy } from 'react';
import { ROLES } from '../../constants';

const AdminDeliveryPerformance = lazy(() => import('../../pages/admin/AdminDeliveryPerformance'));
const PortalMensajero = lazy(() => import('../../pages/portal/PortalMensajero'));

export const deliveryRoutes = [
  // Rutas administrativas
  {
    path: 'rendimiento-entregas',
    element: <AdminDeliveryPerformance />,
    parent: 'admin'
  },

  // Rutas de portales operativos
  {
    path: 'mensajero',
    element: <PortalMensajero />,
    parent: 'portal',
    roleRequired: ROLES.MENSAJERO
  }
];
