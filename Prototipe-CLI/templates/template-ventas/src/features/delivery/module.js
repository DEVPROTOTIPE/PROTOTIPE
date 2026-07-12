import { deliveryRoutes } from './routes';

export default {
  id: 'delivery',
  displayName: 'Despacho de Pedidos y Seguimiento de Entregas',
  version: '1.0.0',
  dependencies: [],

  providesContracts: {
    'deliveryContract': '1.0.0'
  },
  requiresContracts: {},

  routes: deliveryRoutes,
  permissions: ['delivery.read', 'delivery.update'],

  navigation: {
    adminMenu: [
      {
        label: 'Rendimiento Entregas',
        path: '/admin/rendimiento-entregas',
        icon: 'Truck',
        permissionRequired: 'delivery.read'
      }
    ]
  },

  install(context, tenantContext) {
    context.router.registerRoutes(this.routes);
    context.navigation.registerAdminMenu(this.navigation.adminMenu);
  },

  configure(context, tenantContext) {
    console.log(`[Module delivery] Configurando para tenant: ${tenantContext.brandName}`);
  },

  initialize(context, tenantContext) {
    context.permissions.registerPermissions('admin', ['delivery.*']);
    context.permissions.registerPermissions('mensajero', ['delivery.read', 'delivery.update']);
  },

  mount(context, tenantContext) {
    console.log('[Module delivery] Montado y listo.');
  },

  destroy() {
    console.log('[Module delivery] Deteniendo listeners.');
  },

  async healthCheck() {
    return {
      deliveryService: 'healthy'
    };
  }
};
