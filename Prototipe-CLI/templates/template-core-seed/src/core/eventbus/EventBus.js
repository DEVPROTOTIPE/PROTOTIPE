class CoreEventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * Suscribe un callback a un evento específico definido en los contratos.
   * @param {object} eventContract - El objeto de contrato del evento (contiene .name y .schema)
   * @param {function} callback - Función a ejecutar cuando ocurra el evento
   * @returns {function} Función de des-suscripción automática
   */
  subscribe(eventContract, callback) {
    const eventName = typeof eventContract === 'string' ? eventContract : eventContract.name;
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
    return () => {
      this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
    };
  }

  /**
   * Publica un evento en el bus global, validando su payload si está en desarrollo.
   * @param {object} eventContract - El objeto de contrato del evento
   * @param {object} payload - El payload de datos del evento
   */
  publish(eventContract, payload) {
    const eventName = typeof eventContract === 'string' ? eventContract : eventContract.name;
    
    // Validación estructural en desarrollo
    if (typeof eventContract === 'object' && eventContract.schema) {
      const result = eventContract.schema.safeParse(payload);
      if (!result.success) {
        console.error(
          `❌ [EventBus Payload Validation Error] El evento "${eventName}" no coincide con su contrato:`,
          result.error.format()
        );
        return;
      }
    }

    if (!this.listeners[eventName]) return;
    this.listeners[eventName].forEach(callback => {
      try {
        callback(payload);
      } catch (err) {
        console.error(`❌ [EventBus Callback Error] Error al procesar suscripción del evento "${eventName}":`, err);
      }
    });
  }
}

export const EventBus = new CoreEventBus();
