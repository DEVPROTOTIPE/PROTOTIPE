import { lazy } from 'react';

const AdminView = lazy(() => import('./components/AdminView'));
const ClientView = lazy(() => import('./components/ClientView'));

export const routes = [
  {
    path: 'customer-loyalty',
    parent: 'admin',
    element: <AdminView />,
    permissionRequired: 'customer-loyalty.read'
  },
  {
    path: 'customer-loyalty',
    parent: 'client',
    element: <ClientView />,
    permissionRequired: 'customer-loyalty.read'
  }
];
