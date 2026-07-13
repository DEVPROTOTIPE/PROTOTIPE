import { CustomerLoyaltyRepository } from '../api/CustomerLoyaltyRepository';
import { CustomerLoyaltySchema } from '../schemas/CustomerLoyaltySchemas';

export const CustomerLoyaltyService = {
  /**
   * Crea un registro validando el esquema.
   * @param {string} tenantId 
   * @param {Object} rawData 
   * @returns {Promise<string>}
   */
  async createRecord(tenantId, rawData) {
    const validated = CustomerLoyaltySchema.parse({
      ...rawData,
      tenantId
    });
    
    return await CustomerLoyaltyRepository.create(tenantId, validated);
  },

  /**
   * Obtiene todos los registros.
   * @param {string} tenantId 
   * @returns {Promise<Object[]>}
   */
  async getRecords(tenantId) {
    if (!tenantId) throw new Error('[CustomerLoyaltyService] tenantId es requerido');
    return await CustomerLoyaltyRepository.getAll(tenantId);
  }
};
