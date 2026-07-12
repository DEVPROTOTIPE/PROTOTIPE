export const HEALTH_STATES = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
  DISABLED: 'disabled'
};

class FeatureHealthManagerClass {
  constructor() {
    this.modules = [];
  }

  registerModules(modulesList) {
    this.modules = modulesList;
  }

  /**
   * Ejecuta diagnósticos periódicos sobre todas las features cargadas.
   * @returns {object} Reporte de salud de todos los módulos
   */
  async runDiagnostics() {
    const report = {};
    for (const mod of this.modules) {
      if (mod.healthCheck && typeof mod.healthCheck === 'function') {
        try {
          const health = await mod.healthCheck();
          report[mod.id] = { status: HEALTH_STATES.HEALTHY, ...health };
        } catch (err) {
          report[mod.id] = { status: HEALTH_STATES.UNHEALTHY, error: err.message };
        }
      } else {
        report[mod.id] = { status: HEALTH_STATES.HEALTHY, info: 'Health check no administrado' };
      }
    }
    return report;
  }
}

export const FeatureHealthManager = new FeatureHealthManagerClass();
