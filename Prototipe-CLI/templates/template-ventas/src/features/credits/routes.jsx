import { lazy } from 'react';

const AdminCredits = lazy(() => import('../../pages/admin/AdminCredits'));
const ClientCredits = lazy(() => import('../../pages/client/ClientCredits'));

export const creditsRoutes = [
  // Rutas administrativas
  {
    path: 'credito',
    element: <AdminCredits />,
    parent: 'admin'
  },

  // Rutas de cliente
  {
    path: 'creditos',
    element: <ClientCredits />,
    parent: 'client'
  }
];
