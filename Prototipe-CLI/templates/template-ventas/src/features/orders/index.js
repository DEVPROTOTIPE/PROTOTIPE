// Barrel export for the orders feature

export {
  hashCelular,
  buildTrackingDoc,
  createOrder,
  getOrders,
  subscribeToOrders,
  getArchivedOrders,
  getClientOrders,
  subscribeToClientOrders,
  subscribeToVendedorOrders,
  clearClientOrderHistory,
  archiveOrders,
  updateOrderStatus,
  updateOrderDeliveryCost,
  subscribeToOrderByToken,
  migrateOrdersToTracking
} from './services/orderService'

export {
  useOrders,
  useUpdateOrderStatus,
  useClientOrders,
  useCreateOrder
} from './hooks/useOrders'

export { default as OrderCard } from './components/OrderCard'
