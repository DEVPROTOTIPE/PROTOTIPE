import { inventoryRoutes } from './routes';

export default {
  id: 'inventory',
  displayName: 'Gestión de Inventario y Catálogo',
  version: '1.0.0',
  dependencies: [],

  providesContracts: {
    'inventoryContract': '1.0.0'
  },
  requiresContracts: {},

  routes: inventoryRoutes,
  permissions: ['inventory.read', 'inventory.write', 'inventory.delete'],

  navigation: {
    adminMenu: [
      {
        label: 'Inventario',
        path: '/admin/inventario',
        icon: 'Package',
        permissionRequired: 'inventory.read'
      },
      {
        label: 'Portales QR',
        path: '/admin/portales-qr',
        icon: 'QrCode',
        permissionRequired: 'inventory.read'
      }
    ],
    clientMenu: [
      {
        label: 'Catálogo',
        path: '/tienda/catalogo'
      }
    ]
  },

  install(context, tenantContext) {
    // Registrar rutas y menus dinámicos en el Core
    context.router.registerRoutes(this.routes);
    context.navigation.registerAdminMenu(this.navigation.adminMenu);
    context.navigation.registerClientMenu(this.navigation.clientMenu);
  },

  configure(context, tenantContext) {
    console.log(`[Module inventory] Configurando para tenant: ${tenantContext.brandName}`);
  },

  initialize(context, tenantContext) {
    // Registrar permisos asociados a roles en el PermissionRegistry
    context.permissions.registerPermissions('admin', ['inventory.*']);
    context.permissions.registerPermissions('vendedor', ['inventory.read']);
    context.permissions.registerPermissions('bodeguero', ['inventory.*']);
  },

  mount(context, tenantContext) {
    console.log('[Module inventory] Montado y listo.');
  },

  destroy() {
    console.log('[Module inventory] Deteniendo listeners y destruyendo.');
  },

  async healthCheck() {
    // Healthcheck simulado para IndexedDB y conectividad
    return {
      database: 'connected',
      localCacheSize: 'OK'
    };
  }
};
