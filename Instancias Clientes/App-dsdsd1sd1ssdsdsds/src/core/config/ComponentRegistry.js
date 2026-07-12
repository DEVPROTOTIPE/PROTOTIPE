import { PermissionRegistry } from '../permissions/PermissionRegistry'

class ComponentRegistryClass {
  constructor() {
    this.registry = {
      widgets: new Map(),
      layouts: new Map(),
      pages: new Map(),
      forms: new Map(),
      blocks: new Map()
    }
  }

  /**
   * Registra un componente con metadatos de gobernanza, ciclo de vida y permisos.
   * @param {'widgets'|'layouts'|'pages'|'forms'|'blocks'} type 
   * @param {string} id 
   * @param {Function} importPromise 
   * @param {object} meta - { owner: string, version: string, permission: string, lifecycle: string }
   */
  register(type, id, importPromise, meta = {}) {
    if (!this.registry[type]) throw new Error(`Tipo de componente inválido: ${type}`)
    
    this.registry[type].set(id, {
      importPromise,
      owner: meta.owner || 'unknown',
      version: meta.version || '1.0.0',
      permission: meta.permission || null,
      lifecycle: meta.lifecycle || 'installed',
      status: 'registered'
    })
    console.log(`[ComponentRegistry] Registrado: [${type}] ${id} (Owner: ${meta.owner}, Permission: ${meta.permission})`)
  }

  /**
   * Obtiene la promesa de importación si se satisfacen los permisos.
   * @param {string} type 
   * @param {string} id 
   * @param {string} userRole 
   * @returns {Function|null}
   */
  getWithPermission(type, id, userRole) {
    const comp = this.registry[type]?.get(id)
    if (!comp) return null

    if (comp.permission && typeof PermissionRegistry !== 'undefined') {
      const hasPermission = PermissionRegistry.hasPermission(userRole, comp.permission)
      if (!hasPermission) {
        console.warn(`[ComponentRegistry] Acceso denegado a [${type}] ${id} para el rol ${userRole}`)
        return null
      }
    }

    return comp.importPromise
  }

  /**
   * Limpia y desregistra todos los componentes asociados a una feature específica.
   * @param {string} owner - ID de la feature
   */
  unregisterAllByOwner(owner) {
    for (const type of Object.keys(this.registry)) {
      for (const [id, comp] of this.registry[type].entries()) {
        if (comp.owner === owner) {
          this.registry[type].delete(id)
          console.log(`[ComponentRegistry] Removido automáticamente: [${type}] ${id} (Owner: ${owner})`)
        }
      }
    }
  }

  /**
   * Obtiene todos los componentes de un tipo específico.
   * @param {string} type 
   */
  getAll(type) {
    return this.registry[type] || new Map()
  }
}
export const ComponentRegistry = new ComponentRegistryClass()
