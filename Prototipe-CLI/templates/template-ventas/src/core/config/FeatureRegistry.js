import activeFeaturesConfig from '../../config/features.json';

const CURRENT_SCHEMA_VERSION = 1;

export const FeatureRegistry = {
  activeFeatures: new Set(activeFeaturesConfig.activeFeatures || []),
  schemaVersion: activeFeaturesConfig.schemaVersion || 1,

  init() {
    if (this.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      console.warn(
        `⚠️ [FeatureRegistry] Advertencia: Versión de esquema incompatible ` +
        `(${this.schemaVersion} vs esperada ${CURRENT_SCHEMA_VERSION}). ` +
        `Se activará el modo de fallback de compatibilidad.`
      );
    }
  },

  /**
   * Comprueba si una feature está activa en el sistema.
   * @param {string} featureName - Nombre identificador de la feature
   * @returns {boolean} True si está activa
   */
  isEnabled(featureName) {
    return this.activeFeatures.has(featureName);
  },

  /**
   * Retorna una lista con todas las features activas en el sistema.
   * @returns {Array<string>} Nombres de features
   */
  getActiveFeatures() {
    return Array.from(this.activeFeatures);
  }
};

FeatureRegistry.init();
