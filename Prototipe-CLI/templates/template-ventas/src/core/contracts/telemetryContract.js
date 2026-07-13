let telemetryProvider = {
  logException: () => { console.warn('Telemetry Provider no registrado'); },
  trackEvent: () => { console.warn('Telemetry Provider no registrado'); }
};

export const registerTelemetryProvider = (providerImpl) => {
  telemetryProvider = providerImpl;
};

export const Telemetry = {
  logException(error, severity = 'medium', context = {}) {
    telemetryProvider.logException(error, severity, context);
  },
  trackEvent(eventName, eventData = {}) {
    telemetryProvider.trackEvent(eventName, eventData);
  }
};
