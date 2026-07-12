/**
 * Contrato de Telemetría del Core.
 * Define la interfaz abstracta que consume el framework y las features.
 */

class TelemetryContract {
  constructor() {
    this.provider = null;
  }

  /**
   * Registra un proveedor de telemetría real en runtime.
   */
  registerProvider(provider) {
    this.provider = provider;
  }

  /**
   * Registra un evento de telemetría.
   */
  logEvent(eventName, params = {}) {
    if (this.provider && typeof this.provider.logEvent === 'function') {
      this.provider.logEvent(eventName, params);
    } else {
      console.log(`[Telemetry Event] ${eventName}`, params);
    }
  }

  /**
   * Registra una excepción o fallo del sistema.
   */
  logException(error, severity = 'error', context = {}) {
    if (this.provider && typeof this.provider.logException === 'function') {
      this.provider.logException(error, severity, context);
    } else {
      console.error(`[Telemetry Exception] [${severity}] ${error?.message || error}`, context);
    }
  }
}

export const Telemetry = new TelemetryContract();
