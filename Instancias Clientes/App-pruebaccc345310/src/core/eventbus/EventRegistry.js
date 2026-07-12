import { ORDER_COMPLETED_V1 } from '../events/orderCompleted/v1';
import { SALE_COMPLETED_V1 } from '../events/saleCompleted/v1';

const registry = {
  ORDER_COMPLETED: {
    1: ORDER_COMPLETED_V1
  },
  SALE_COMPLETED: {
    1: SALE_COMPLETED_V1
  }
};

export const EventRegistry = {
  /**
   * Resuelve el contrato del evento por nombre y versión.
   * @param {string} eventName - Nombre técnico del evento
   * @param {number} version - Versión del contrato
   * @returns {object} Contrato del evento
   */
  resolve(eventName, version = 1) {
    const eventVersions = registry[eventName];
    if (!eventVersions || !eventVersions[version]) {
      throw new Error(`❌ [EventRegistry] Evento "${eventName}" v${version} no registrado.`);
    }
    return eventVersions[version];
  }
};
