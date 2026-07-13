import { Telemetry } from '../contracts/telemetryContract';

export const LIFECYCLE_STATES = {
  INSTALLED: 'installed',
  CONFIGURED: 'configured',
  INITIALIZED: 'initialized',
  MOUNTED: 'mounted',
  FAILED: 'failed',
  DISABLED: 'disabled'
};

const VALID_TRANSITIONS = {
  [LIFECYCLE_STATES.INSTALLED]: [LIFECYCLE_STATES.CONFIGURED, LIFECYCLE_STATES.FAILED],
  [LIFECYCLE_STATES.CONFIGURED]: [LIFECYCLE_STATES.INITIALIZED, LIFECYCLE_STATES.FAILED],
  [LIFECYCLE_STATES.INITIALIZED]: [LIFECYCLE_STATES.MOUNTED, LIFECYCLE_STATES.FAILED],
  [LIFECYCLE_STATES.MOUNTED]: [LIFECYCLE_STATES.DISABLED, LIFECYCLE_STATES.FAILED],
  [LIFECYCLE_STATES.FAILED]: [LIFECYCLE_STATES.INSTALLED],
  [LIFECYCLE_STATES.DISABLED]: [LIFECYCLE_STATES.INSTALLED]
};

class FeatureLifecycleManagerClass {
  constructor() {
    this.states = {};
    this.errors = {};
  }

  /**
   * Valida si una transición de estado es válida según la máquina de estados.
   */
  validateTransition(current, target) {
    if (!current) return true; // Primera transición
    if (current === target) return true; // Transición al mismo estado (tolerante a re-entradas)
    const allowed = VALID_TRANSITIONS[current] || [];
    return allowed.includes(target);
  }

  /**
   * Realiza la transición de estado para una feature, validándola y reportando fallos.
   */
  setTransition(featureId, state, errorObj = null) {
    const current = this.states[featureId] || null;
    
    if (!this.validateTransition(current, state)) {
      const msg = `❌ [LifecycleManager] Transición inválida para "${featureId}" de "${current}" a "${state}".`;
      console.error(msg);
      this.states[featureId] = LIFECYCLE_STATES.FAILED;
      return;
    }

    this.states[featureId] = state;
    
    if (state === LIFECYCLE_STATES.FAILED && errorObj) {
      this.errors[featureId] = errorObj;
      Telemetry.logException(errorObj, 'critical', { feature: featureId, targetState: state });
    }
  }

  /**
   * Obtiene el estado actual de una feature.
   */
  getFeatureStatus(featureId) {
    return this.states[featureId] || null;
  }

  /**
   * Obtiene un reporte de todos los estados actuales de los módulos.
   */
  getStatusReport() {
    return { ...this.states };
  }
}

export const LifecycleManager = new FeatureLifecycleManagerClass();
