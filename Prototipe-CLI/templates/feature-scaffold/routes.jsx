import { lazy } from 'react';

const AdminView = lazy(() => import('./components/Admin{{pascalName}}'));
const ClientView = lazy(() => import('./components/Client{{pascalName}}'));

export const routes = [
  {
    path: '{{featureId}}',
    parent: 'admin',
    element: <AdminView />,
    permissionRequired: '{{featureId}}.read'
  },
  {
    path: '{{featureId}}',
    parent: 'client',
    element: <ClientView />,
    permissionRequired: '{{featureId}}.read'
  }
];
