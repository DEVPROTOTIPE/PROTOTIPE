import { PermissionRegistry } from '../permissions/PermissionRegistry'

class PatternRegistryClass {
  constructor() {
    this.patterns = new Map()
  }

  /**
   * Registra un patrón de interacción de alto nivel (experiencia de producto).
   * @param {string} patternId 
   * @param {object} config - { owner, version, requiredFeatures, permissions, component }
   */
  registerPattern(patternId, config) {
    this.patterns.set(patternId, {
      owner: config.owner || 'core',
      version: config.version || '1.0.0',
      requiredFeatures: config.requiredFeatures || [],
      permissions: config.permissions || [],
      component: config.component
    })
    console.log(`[PatternRegistry] Patrón registrado: ${patternId} (Owner: ${config.owner}, RequiredFeatures: [${config.requiredFeatures}])`)
  }

  /**
   * Obtiene el componente del patrón si se satisfacen las dependencias de features y permisos.
   * @param {string} patternId 
   * @param {string[]} activeFeatures 
   * @param {string} userRole 
   * @returns {any} Componente React o null si no se cumplen las condiciones
   */
  getPatternWithGovernance(patternId, activeFeatures = [], userRole) {
    const pattern = this.patterns.get(patternId)
    if (!pattern) return null

    // 1. Validar dependencia de features obligatorias
    const hasRequiredFeatures = pattern.requiredFeatures.every(f => activeFeatures.includes(f))
    if (!hasRequiredFeatures) {
      console.warn(`[PatternRegistry] Patrón ${patternId} no disponible. Requiere features: [${pattern.requiredFeatures}]`)
      return null
    }

    // 2. Validar permisos de acceso
    if (pattern.permissions.length > 0 && typeof PermissionRegistry !== 'undefined') {
      const hasAccess = pattern.permissions.every(p => PermissionRegistry.hasPermission(userRole, p))
      if (!hasAccess) {
        console.warn(`[PatternRegistry] Acceso denegado a patrón ${patternId} para el rol ${userRole}`)
        return null
      }
    }

    return pattern.component
  }

  unregisterAllByOwner(owner) {
    for (const [id, pattern] of this.patterns.entries()) {
      if (pattern.owner === owner) {
        this.patterns.delete(id)
        console.log(`[PatternRegistry] Removido automáticamente: ${id} (Owner: ${owner})`)
      }
    }
  }
}
export const PatternRegistry = new PatternRegistryClass()
