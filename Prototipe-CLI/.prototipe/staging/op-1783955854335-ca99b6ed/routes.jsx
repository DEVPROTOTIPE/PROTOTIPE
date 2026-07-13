import { lazy } from 'react';

const AdminView = lazy(() => import('./components/AdminView'));
const ClientView = lazy(() => import('./components/ClientView'));

export const routes = [
  {
    path: 'hello-module',
    parent: 'admin',
    element: <AdminView />,
    permissionRequired: 'hello-module.read'
  },
  {
    path: 'hello-module',
    parent: 'client',
    element: <ClientView />,
    permissionRequired: 'hello-module.read'
  }
];
