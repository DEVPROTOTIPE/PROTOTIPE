import { HelloModuleRepository } from '../api/HelloModuleRepository';
import { HelloModuleSchema } from '../schemas/HelloModuleSchemas';

export const HelloModuleService = {
  /**
   * Crea un registro validando el esquema.
   * @param {string} tenantId 
   * @param {Object} rawData 
   * @returns {Promise<string>}
   */
  async createRecord(tenantId, rawData) {
    const validated = HelloModuleSchema.parse({
      ...rawData,
      tenantId
    });
    
    return await HelloModuleRepository.create(tenantId, validated);
  },

  /**
   * Obtiene todos los registros.
   * @param {string} tenantId 
   * @returns {Promise<Object[]>}
   */
  async getRecords(tenantId) {
    if (!tenantId) throw new Error('[HelloModuleService] tenantId es requerido');
    return await HelloModuleRepository.getAll(tenantId);
  }
};
