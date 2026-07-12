import { salesRoutes } from './routes';
import { EventRegistry } from '../../core/eventbus/EventRegistry';

export default {
  id: 'sales',
  displayName: 'Punto de Venta (POS) y Ventas',
  version: '1.0.0',
  dependencies: ['inventory'],

  providesContracts: {
    'salesContract': '1.0.0'
  },
  requiresContracts: {
    'inventoryContract': '^1.0.0'
  },

  routes: salesRoutes,
  permissions: ['sales.read', 'sales.pos', 'sales.refund'],

  navigation: {
    adminMenu: [
      {
        label: 'Ventas',
        path: '/admin/ventas',
        icon: 'ShoppingCart',
        permissionRequired: 'sales.read'
      }
    ]
  },

  install(context, tenantContext) {
    context.router.registerRoutes(this.routes);
    context.navigation.registerAdminMenu(this.navigation.adminMenu);
  },

  configure(context, tenantContext) {
    console.log(`[Module sales] Configurando para tenant: ${tenantContext.brandName}`);
  },

  initialize(context, tenantContext) {
    context.permissions.registerPermissions('admin', ['sales.*']);
    context.permissions.registerPermissions('vendedor', ['sales.pos', 'sales.read']);

    // Suscribirse al evento de orden completada desde el canal centralizado de eventos
    const orderCompletedContract = EventRegistry.resolve('ORDER_COMPLETED', 1);
    this.unsubscribeOrderCompleted = context.eventBus.subscribe(orderCompletedContract, (orderData) => {
      console.log(`[Module sales] Procesando venta de pedido PWA finalizado: ${orderData.id}`);
    });
  },

  mount(context, tenantContext) {
    console.log('[Module sales] POS listo para operaciones locales/offline.');
  },

  destroy() {
    if (this.unsubscribeOrderCompleted) {
      this.unsubscribeOrderCompleted();
    }
  },

  async healthCheck() {
    return {
      indexedDB: 'active',
      syncQueueStatus: 'idle'
    };
  }
};
