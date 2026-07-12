import { ordersRoutes } from './routes';
import { EventRegistry } from '../../core/eventbus/EventRegistry';

export default {
  id: 'orders',
  displayName: 'Gestión de Pedidos y Checkout',
  version: '1.0.0',
  dependencies: ['inventory'],

  providesContracts: {
    'ordersContract': '1.0.0'
  },
  requiresContracts: {
    'inventoryContract': '^1.0.0'
  },

  routes: ordersRoutes,
  permissions: ['orders.read', 'orders.create', 'orders.update'],

  navigation: {
    adminMenu: [
      {
        label: 'Pedidos',
        path: '/admin/pedidos',
        icon: 'ListOrdered',
        permissionRequired: 'orders.read'
      }
    ],
    clientMenu: [
      {
        label: 'Mis Pedidos',
        path: '/tienda/pedidos'
      }
    ]
  },

  install(context, tenantContext) {
    context.router.registerRoutes(this.routes);
    context.navigation.registerAdminMenu(this.navigation.adminMenu);
    context.navigation.registerClientMenu(this.navigation.clientMenu);
  },

  configure(context, tenantContext) {
    console.log(`[Module orders] Configurando para tenant: ${tenantContext.brandName}`);
  },

  initialize(context, tenantContext) {
    context.permissions.registerPermissions('admin', ['orders.*']);
    context.permissions.registerPermissions('vendedor', ['orders.read', 'orders.update']);
    context.permissions.registerPermissions('bodeguero', ['orders.read']);
    context.permissions.registerPermissions('mensajero', ['orders.read']);
  },

  mount(context, tenantContext) {
    console.log('[Module orders] Montado y listo.');
  },

  destroy() {
    console.log('[Module orders] Destruyendo listeners.');
  },

  async healthCheck() {
    return {
      orderService: 'healthy'
    };
  }
};
