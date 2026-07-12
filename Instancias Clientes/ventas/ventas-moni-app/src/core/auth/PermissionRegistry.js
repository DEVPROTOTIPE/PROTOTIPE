class PermissionRegistryClass {
  constructor() {
    // Definición por defecto de los roles y capacidades en la plataforma
    this.roleCapabilities = {
      admin: ['*'], // Super Admin wildcard total
      vendedor: [
        'sales.*', 
        'inventory.read', 
        'orders.read', 
        'orders.update'
      ],
      bodeguero: [
        'inventory.*', 
        'orders.read'
      ],
      mensajero: [
        'delivery.*', 
        'orders.read'
      ],
      client: [
        'orders.create', 
        'orders.read'
      ]
    };
  }

  /**
   * Registra permisos personalizados para un rol.
   * @param {string} role - El nombre del rol
   * @param {Array<string>} permissions - Permisos a añadir
   */
  registerPermissions(role, permissions) {
    if (!this.roleCapabilities[role]) {
      this.roleCapabilities[role] = [];
    }
    this.roleCapabilities[role].push(...permissions);
  }

  /**
   * Comprueba si un rol posee una capacidad o permiso específico.
   * Admite coincidencia exacta y comodines (e.g. "sales.*" autoriza "sales.pos").
   * @param {string} role - El rol del usuario
   * @param {string} capability - La capacidad técnica a evaluar
   * @returns {boolean} True si está autorizado
   */
  can(role, capability) {
    if (!role) return false;
    const caps = this.roleCapabilities[role] || [];
    
    // Super Administrador
    if (caps.includes('*')) return true;

    // Coincidencia exacta
    if (caps.includes(capability)) return true;

    // Validación por comodines (wildcards) e.g. "sales.*"
    return caps.some(cap => {
      if (cap.endsWith('.*')) {
        const prefix = cap.slice(0, -2); // Remueve ".*"
        return capability.startsWith(prefix + '.');
      }
      return false;
    });
  }
}

export const PermissionRegistry = new PermissionRegistryClass();
