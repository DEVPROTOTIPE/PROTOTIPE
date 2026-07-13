import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOURNAL_DIR = path.join(__dirname, '..', '.prototipe', 'journal');
const JOURNAL_FILE = path.join(JOURNAL_DIR, 'journal.json');

export const JOURNAL_STATES = {
  QUEUED: 'QUEUED',
  VALIDATING: 'VALIDATING',
  CREATING_WORKSPACE: 'CREATING_WORKSPACE',
  STAGING: 'STAGING',
  GENERATING_ARTIFACTS: 'GENERATING_ARTIFACTS',
  VERIFYING_CONTRACTS: 'VERIFYING_CONTRACTS',
  TESTING: 'TESTING',
  BUILDING: 'BUILDING',
  READY_TO_COMMIT: 'READY_TO_COMMIT',
  COMMITTING: 'COMMITTING',
  COMMITTED: 'COMMITTED',
  ROLLING_BACK: 'ROLLING_BACK',
  FAILED_NEEDS_MANUAL_REVIEW: 'FAILED_NEEDS_MANUAL_REVIEW'
};

export class OperationJournalRepository {
  /**
   * Guarda o actualiza el estado actual de la transacción en el journal físico.
   * @param {string} operationId 
   * @param {string} state - Uno de los valores de JOURNAL_STATES
   * @param {Object} metadata - Información adicional (payload, backups, hashes)
   */
  static async save(operationId, state, metadata = {}) {
    await fs.ensureDir(JOURNAL_DIR);

    const journal = {
      operationId,
      state,
      updatedAt: new Date().toISOString(),
      metadata: {
        ...(await this.getCurrentMetadata()),
        ...metadata
      }
    };

    await fs.writeJson(JOURNAL_FILE, journal, { spaces: 2 });
    console.log(`[Journal] Transición de estado de la operación "${operationId}": ──> ${state}`);
  }

  /**
   * Retorna el journal actual en disco, si existe.
   * @returns {Promise<Object|null>}
   */
  static async get() {
    if (!(await fs.pathExists(JOURNAL_FILE))) return null;
    try {
      return await fs.readJson(JOURNAL_FILE);
    } catch (err) {
      console.error(`[Journal] Error al leer el archivo journal.json:`, err.message);
      return null;
    }
  }

  /**
   * Retorna únicamente los metadatos de la operación en curso.
   * @returns {Promise<Object>}
   */
  static async getCurrentMetadata() {
    const current = await this.get();
    return current ? current.metadata || {} : {};
  }

  /**
   * Limpia el archivo journal al finalizar la transacción con éxito (transiciona a COMMITTED o limpia).
   * Para dar trazabilidad histórica de auditoría (Mejora B del usuario), guardaremos una copia histórica
   * de la operación en `.prototipe/audit/features/{operationId}.json` antes de limpiar el journal activo.
   */
  static async finalize(operationId, resultStatus) {
    const current = await this.get();
    if (!current) return;

    // 1. Guardar log histórico de auditoría
    const auditDir = path.join(__dirname, '..', '.prototipe', 'audit', 'features');
    await fs.ensureDir(auditDir);
    
    const auditPayload = {
      operationId,
      action: 'FEATURE_CREATED',
      featureId: current.metadata?.payload?.featureId || 'unknown',
      user: 'developer',
      timestamp: new Date().toISOString(),
      result: resultStatus,
      metadata: current.metadata
    };

    await fs.writeJson(path.join(auditDir, `${operationId}.json`), auditPayload, { spaces: 2 });
    console.log(`[Journal] Operación de auditoría guardada en: .prototipe/audit/features/${operationId}.json`);

    // 2. Limpiar el journal activo
    if (await fs.pathExists(JOURNAL_FILE)) {
      await fs.remove(JOURNAL_FILE);
    }
  }
}
