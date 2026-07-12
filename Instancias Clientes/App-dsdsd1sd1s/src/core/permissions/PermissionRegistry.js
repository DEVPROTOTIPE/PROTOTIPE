class PermissionRegistryClass {
  constructor() {
    this.rolePermissions = {
      admin: ['*'], // Superusuario: Acceso a todo
      vendedor: [
        'appointments.view',
        'appointments.create',
        'sales.view',
        'sales.create'
      ],
      client: [
        'appointments.view',
        'appointments.create'
      ]
    }
  }

  /**
   * Comprueba si un rol posee un permiso específico.
   * Soporta wildcards de tipo 'sales.*' o '*'.
   * @param {string} role 
   * @param {string} permission 
   * @returns {boolean}
   */
  hasPermission(role, permission) {
    if (!role) return false
    const permissions = this.rolePermissions[role] || []
    
    if (permissions.includes('*')) return true
    if (permissions.includes(permission)) return true

    // Comprobar wildcards de tipo 'namespace.*'
    return permissions.some(p => {
      if (p.endsWith('.*')) {
        const namespace = p.slice(0, -2)
        return permission.startsWith(namespace + '.')
      }
      return false
    })
  }

  /**
   * Registra dinámicamente un permiso para un rol.
   * @param {string} role 
   * @param {string} permission 
   */
  grantPermission(role, permission) {
    if (!this.rolePermissions[role]) {
      this.rolePermissions[role] = []
    }
    if (!this.rolePermissions[role].includes(permission)) {
      this.rolePermissions[role].push(permission)
    }
  }
}
export const PermissionRegistry = new PermissionRegistryClass()
