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

  // ─── EJEMPLO (ADR-0001 §14): orquestar una transacción del Repository ──
  // Descomenta y adapta si esta feature necesita actualizar un registro de
  // forma atómica. El Service decide el nuevo estado (validaciones, reglas
  // de negocio) dentro del reducer; el Repository ejecuta la mecánica de
  // Firestore (ver api/{{pascalName}}Repository.js → runRecordTransaction).
  // El Service nunca importa el SDK de Firebase directamente. Patrón real:
  // features/customer-loyalty/services/CustomerLoyaltyService.js → earnPoints/redeemPoints.
  //
  // async updateRecordAtomically(tenantId, recordId, changes) {
  //   return {{pascalName}}Repository.runRecordTransaction(tenantId, recordId, (current) => {
  //     const updated = { ...current, ...changes, updatedAt: new Date().toISOString() };
  //     {{pascalName}}Schema.parse(updated);
  //     return updated;
  //   });
  // }
};
