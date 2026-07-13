import { routes } from './routes';
import manifest from './implementation.manifest.json';

export default {
  id: manifest.featureId,
  displayName: manifest.displayName,
  version: manifest.version,
  dependencies: manifest.dependencies || [],

  routes,
  permissions: [
    `${manifest.featureId}.read`,
    `${manifest.featureId}.write`
  ],

  navigation: manifest.navigation,

  install(context, tenantContext) {
    context.router.registerRoutes(this.routes);
    if (this.navigation.adminMenu) {
      context.navigation.registerAdminMenu(this.navigation.adminMenu);
    }
    if (this.navigation.clientMenu) {
      context.navigation.registerClientMenu(this.navigation.clientMenu);
    }
  },

  configure(context, tenantContext) {
    console.log(`[Module ${manifest.featureId}] Configurando para tenant: ${tenantContext.brandName}`);
  },

  initialize(context, tenantContext) {
    context.permissions.registerPermissions('admin', [`${manifest.featureId}.*`]);
  },

  mount(context, tenantContext) {
    console.log(`[Module ${manifest.featureId}] Montado y listo.`);
  },

  destroy() {
    console.log(`[Module ${manifest.featureId}] Deteniendo listeners.`);
  },

  async healthCheck() {
    return {
      status: 'healthy'
    };
  }
};
