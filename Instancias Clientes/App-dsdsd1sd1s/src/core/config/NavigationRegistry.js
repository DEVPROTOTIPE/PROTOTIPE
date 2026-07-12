/**
 * Registro dinámico de navegación y rutas de features.
 * Permite a las features inyectar sus elementos de menú sin hardcodes en layouts.
 */

class NavigationRegistryClass {
  constructor() {
    this.routes = {};
    this.adminMenu = [];
    this.clientMenu = [];
  }

  /**
   * Registra las rutas asociadas a una feature y deduce los ítems de menú.
   * @param {string} featureId - ID de la feature que registra las rutas
   * @param {Array} routes - Array de rutas con formato react-router
   */
  registerRoutes(featureId, routes) {
    this.routes[featureId] = routes;

    routes.forEach((route) => {
      // Registrar en el menú administrativo si aplica
      if (route.meta?.showInAdmin) {
        this.adminMenu.push({
          label: route.meta.label || route.name || route.path,
          path: route.path,
          icon: route.meta.icon || 'LayoutGrid',
          featureId
        });
      }

      // Registrar en el menú cliente si aplica
      if (route.meta?.showInClient) {
        this.clientMenu.push({
          label: route.meta.label || route.name || route.path,
          path: route.path,
          icon: route.meta.icon || 'LayoutGrid',
          featureId
        });
      }
    });
  }

  /**
   * Obtiene la lista de elementos para el menú de administración.
   */
  getAdminMenu() {
    return [...this.adminMenu];
  }

  /**
   * Obtiene la lista de elementos para el menú de clientes.
   */
  getClientMenu() {
    return [...this.clientMenu];
  }

  /**
   * Obtiene todas las rutas inyectadas de forma plana.
   */
  getAllRoutes() {
    return Object.values(this.routes).flat();
  }
}

export const NavigationRegistry = new NavigationRegistryClass();
