export default {
  id: 'billing',
  displayName: 'Facturación y Liquidaciones contables',
  version: '1.0.0',
  dependencies: [],

  providesContracts: {
    'billingContract': '1.0.0'
  },
  requiresContracts: {},

  routes: [],
  permissions: ['billing.read', 'billing.invoice'],

  navigation: {
    adminMenu: []
  },

  install(context, tenantContext) {
    console.log('[Module billing] Registrando módulo.');
  },

  configure(context, tenantContext) {
    console.log(`[Module billing] Configurando para tenant: ${tenantContext.brandName}`);
  },

  initialize(context, tenantContext) {
    context.permissions.registerPermissions('admin', ['billing.*']);
  },

  mount(context, tenantContext) {
    console.log('[Module billing] Listo.');
  },

  destroy() {
    console.log('[Module billing] Limpiando.');
  },

  async healthCheck() {
    return {
      pdfEngine: 'active'
    };
  }
};
