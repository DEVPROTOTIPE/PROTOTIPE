import { {{pascalName}}Repository } from '../api/{{pascalName}}Repository';
import { {{pascalName}}Schema } from '../schemas/{{pascalName}}Schemas';

export const {{pascalName}}Service = {
  /**
   * Crea un registro validando el esquema.
   * @param {string} tenantId 
   * @param {Object} rawData 
   * @returns {Promise<string>}
   */
  async createRecord(tenantId, rawData) {
    const validated = {{pascalName}}Schema.parse({
      ...rawData,
      tenantId
    });
    
    return await {{pascalName}}Repository.create(tenantId, validated);
  },

  /**
   * Obtiene todos los registros.
   * @param {string} tenantId 
   * @returns {Promise<Object[]>}
   */
  async getRecords(tenantId) {
    if (!tenantId) throw new Error('[{{pascalName}}Service] tenantId es requerido');
    return await {{pascalName}}Repository.getAll(tenantId);
  }
};
