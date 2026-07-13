import { reportAppFailureToDeveloper } from '../../services/telemetryService';

export const firebaseTelemetryProvider = {
  /**
   * Registra una excepción en la telemetría central.
   */
  logException(error, severity = 'medium', context = {}) {
    const errorMsg = error.message || String(error);
    const stack = error.stack || '';
    reportAppFailureToDeveloper(
      `[${severity.toUpperCase()}] ${errorMsg} | Context: ${JSON.stringify(context)}`,
      stack,
      'automatic'
    ).catch(err => {
      console.error('[TelemetryProvider] Falló al reportar excepción:', err);
    });
  },

  /**
   * Registra un evento de analítica / telemetría en la consola.
   */
  trackEvent(eventName, eventData = {}) {
    console.log(`📊 [Telemetry Event] ${eventName}:`, eventData);
  }
};
