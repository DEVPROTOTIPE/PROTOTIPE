import { creditsRoutes } from './routes';

export default {
  id: 'credits',
  displayName: 'Gestión de Créditos y Cuentas por Cobrar',
  version: '1.0.0',
  dependencies: [],

  providesContracts: {
    'creditsContract': '1.0.0'
  },
  requiresContracts: {},

  routes: creditsRoutes,
  permissions: ['credits.read', 'credits.write'],

  navigation: {
    adminMenu: [
      {
        label: 'Crédito (Fiados)',
        path: '/admin/credito',
        icon: 'CreditCard',
        permissionRequired: 'credits.read'
      }
    ],
    clientMenu: [
      {
        label: 'Mis Créditos',
        path: '/tienda/creditos'
      }
    ]
  },

  install(context, tenantContext) {
    context.router.registerRoutes(this.routes);
    context.navigation.registerAdminMenu(this.navigation.adminMenu);
    context.navigation.registerClientMenu(this.navigation.clientMenu);
  },

  configure(context, tenantContext) {
    console.log(`[Module credits] Configurando para tenant: ${tenantContext.brandName}`);
  },

  initialize(context, tenantContext) {
    context.permissions.registerPermissions('admin', ['credits.*']);
  },

  mount(context, tenantContext) {
    console.log('[Module credits] Montado y listo.');
  },

  destroy() {
    console.log('[Module credits] Deteniendo listeners.');
  },

  async healthCheck() {
    return {
      creditsService: 'healthy'
    };
  }
};
