class CoreNavigationRegistry {
  constructor() {
    this.adminMenu = [];  // Elementos de navegación del panel administrativo
    this.clientMenu = []; // Elementos de navegación orientados al cliente final
  }

  /**
   * Registra elementos en el menú de administración bajo un módulo propietario.
   * @param {string} ownerFeatureId - El ID único de la feature propietaria
   * @param {Array<object>} items - Los items a registrar (con label, path, icon, permissionRequired)
   */
  registerAdminMenu(ownerFeatureId, items) {
    if (Array.isArray(items)) {
      const itemsWithOwner = items.map(item => ({ ...item, owner: ownerFeatureId }));
      this.adminMenu.push(...itemsWithOwner);
    }
  }

  /**
   * Registra elementos en el menú del cliente final bajo un módulo propietario.
   * @param {string} ownerFeatureId - El ID único de la feature propietaria
   * @param {Array<object>} items - Los items a registrar
   */
  registerClientMenu(ownerFeatureId, items) {
    if (Array.isArray(items)) {
      const itemsWithOwner = items.map(item => ({ ...item, owner: ownerFeatureId }));
      this.clientMenu.push(...itemsWithOwner);
    }
  }

  /**
   * Elimina todos los elementos de menú registrados por una feature específica.
   * @param {string} ownerFeatureId - El ID único de la feature
   */
  unregisterMenuByFeature(ownerFeatureId) {
    this.adminMenu = this.adminMenu.filter(item => item.owner !== ownerFeatureId);
    this.clientMenu = this.clientMenu.filter(item => item.owner !== ownerFeatureId);
  }

  /**
   * Retorna los elementos del menú administrativo filtrados por los permisos del rol del usuario.
   * @param {string} role - El rol del usuario actual
   * @param {object} permissionRegistry - Registro de permisos para chequear capacidades
   * @returns {Array<object>} Items de menú autorizados
   */
  getAdminMenuForRole(role, permissionRegistry) {
    return this.adminMenu.filter(item => {
      if (!item.permissionRequired) return true;
      return permissionRegistry.can(role, item.permissionRequired);
    });
  }

  /**
   * Retorna los elementos de menú del cliente.
   * @returns {Array<object>} Items de menú del cliente
   */
  getClientMenu() {
    return this.clientMenu;
  }
}

export const NavigationRegistry = new CoreNavigationRegistry();
