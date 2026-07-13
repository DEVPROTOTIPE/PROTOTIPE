import { lazy } from 'react';

const AdminView = lazy(() => import('./components/AdminCustomerLoyalty'));
const ClientView = lazy(() => import('./components/ClientCustomerLoyalty'));

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
