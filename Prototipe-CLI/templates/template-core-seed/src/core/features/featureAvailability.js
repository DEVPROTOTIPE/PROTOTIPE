/**
 * Resolvedor de Disponibilidad y Gobernanza de Features (Feature Availability Resolver)
 * Centraliza la verificación de si un cliente o usuario puede acceder a una feature.
 */
export class FeatureAvailabilityResolver {
  /**
   * Determina si una feature está disponible y puede ser consumida.
   * @param {string} featureId - ID único del módulo
   * @param {Object} context - Contexto del usuario y del tenant
   * @param {Object} context.featureFlags - Estado actual de flags en appConfigStore
   * @param {string[]} [context.userPermissions] - Permisos del usuario actual (opcional)
   * @param {string[]} [context.tenantEntitlements] - Licencias/Planes contratados por el tenant (opcional)
   * @param {Object} [context.featureMetadata] - Metadatos adicionales de gobernanza (opcional)
   * @returns {boolean}
   */
  static canUseFeature(featureId, context = {}) {
    const {
      featureFlags = {},
      userPermissions = [],
      tenantEntitlements = [],
      featureMetadata = {}
    } = context;

    // 1. Verificación básica de Feature Flag (Zustand / settings)
    const isFlagEnabled = featureFlags[featureId] === true;
    if (!isFlagEnabled) return false;

    // 2. Verificación de Licencia/Plan (SaaS Entitlements) - Si el tenant lo tiene contratado
    if (tenantEntitlements.length > 0 && !tenantEntitlements.includes(featureId)) {
      console.warn(`[Availability] Acceso denegado: El tenant no cuenta con licencia activa para la feature "${featureId}".`);
      return false;
    }

    // 3. Verificación de Permisos Operativos (RBAC Guard)
    // Si la feature requiere permisos específicos de lectura, validar que el usuario cuente con ellos
    if (userPermissions.length > 0) {
      const hasPermission = userPermissions.includes(`${featureId}.read`) || userPermissions.includes(`${featureId}.write`);
      if (!hasPermission) return false;
    }

    // 4. Verificación de Estados del Ciclo de Vida (SaaS Availability Model)
    if (featureMetadata && featureMetadata.availability) {
      const { beta, internalOnly, stable } = featureMetadata.availability;

      // Si es de uso exclusivo interno y no estamos en entorno de desarrollo/staff
      if (internalOnly && import.meta.env.PROD) {
        return false;
      }
    }

    return true;
  }
}
