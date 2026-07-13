import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCK_DIR = path.join(__dirname, '..', '.prototipe', 'locks');
const LOCK_FILE = path.join(LOCK_DIR, 'monorepo.lock');

export class WorkspaceLockManager {
  /**
   * Intenta adquirir el bloqueo exclusivo del monorepo.
   * Si ya hay un bloqueo activo de menos de 10 minutos (protección contra locks huérfanos), lanza un error.
   * @param {string} operationId - ID único de la operación de scaffolding
   * @returns {Promise<boolean>} True si se adquirió con éxito
   */
  static async acquire(operationId) {
    await fs.ensureDir(LOCK_DIR);

    if (await fs.pathExists(LOCK_FILE)) {
      try {
        const lockData = await fs.readJson(LOCK_FILE);
        const lockTime = new Date(lockData.acquiredAt).getTime();
        const duration = Date.now() - lockTime;

        // Si el lock lleva menos de 10 minutos, denegar el acceso
        if (duration < 10 * 60 * 1000) {
          throw new Error(`[WorkspaceLockManager] El monorepo está bloqueado por la operación "${lockData.operationId}" iniciada hace ${Math.round(duration / 1000)}s.`);
        }

        console.warn(`[WorkspaceLockManager] Rompiendo lock obsoleto (stale) de la operación: ${lockData.operationId}`);
      } catch (err) {
        if (!err.message.includes('El monorepo está bloqueado')) {
          // El archivo JSON estaba dañado o vacío, podemos sobreescribirlo de forma segura
          await fs.remove(LOCK_FILE);
        } else {
          throw err;
        }
      }
    }

    const lockPayload = {
      operationId,
      acquiredAt: new Date().toISOString()
    };

    await fs.writeJson(LOCK_FILE, lockPayload, { spaces: 2 });
    console.log(`[WorkspaceLockManager] Bloqueo adquirido para la operación: ${operationId}`);
    return true;
  }

  /**
   * Libera el bloqueo del monorepo si el ID de la operación coincide.
   * @param {string} operationId 
   * @returns {Promise<boolean>} True si se liberó con éxito
   */
  static async release(operationId) {
    if (!(await fs.pathExists(LOCK_FILE))) return true;

    try {
      const lockData = await fs.readJson(LOCK_FILE);
      if (lockData.operationId !== operationId) {
        console.warn(`[WorkspaceLockManager] Intento de liberación no autorizado: ${operationId} no es dueño del lock (${lockData.operationId})`);
        return false;
      }

      await fs.remove(LOCK_FILE);
      console.log(`[WorkspaceLockManager] Bloqueo liberado para la operación: ${operationId}`);
      return true;
    } catch (err) {
      console.error(`[WorkspaceLockManager] Error al liberar el bloqueo:`, err);
      return false;
    }
  }

  /**
   * Fuerza la liberación de cualquier bloqueo existente (usar solo en recovery).
   */
  static async forceRelease() {
    if (await fs.pathExists(LOCK_FILE)) {
      await fs.remove(LOCK_FILE);
      console.log(`[WorkspaceLockManager] Bloqueo forzado a liberarse.`);
    }
  }
}
