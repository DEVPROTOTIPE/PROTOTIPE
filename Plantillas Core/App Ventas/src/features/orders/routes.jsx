import { lazy } from 'react';

const AdminOrders = lazy(() => import('../../pages/admin/AdminOrders'));
const ClientOrders = lazy(() => import('../../pages/client/ClientOrders'));
const OrderTracking = lazy(() => import('../../pages/client/OrderTracking'));

export const ordersRoutes = [
  // Rutas administrativas
  {
    path: 'pedidos',
    element: <AdminOrders />,
    parent: 'admin'
  },

  // Rutas de cliente
  {
    path: 'pedidos',
    element: <ClientOrders />,
    parent: 'client'
  },

  // Rutas de raíz / públicas
  {
    path: 'pedido/status',
    element: <OrderTracking />,
    parent: 'root'
  }
];
