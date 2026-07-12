/**
 * ProvisioningStateManager.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Coordinador de estado persistente y control de concurrencia para el
 * flujo de aprovisionamiento de instancias.
 *
 * Los estados se persisten en:
 *   artifacts/provisioning-state/{clientId}.json
 *
 * Los locks se persisten en:
 *   artifacts/provisioning-lock/{clientId}.lock
 * ─────────────────────────────────────────────────────────────────────────────
 */

import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const CLI_ROOT   = path.resolve(__dirname, '..');
const STATE_DIR  = path.join(CLI_ROOT, 'artifacts', 'provisioning-state');
const LOCK_DIR   = path.join(CLI_ROOT, 'artifacts', 'provisioning-lock');

// Constantes de configuración
const LOCK_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

export class ProvisioningStateManager {
  /**
   * Asegura que los directorios de estados y locks existan.
   */
  static async ensureStateDir() {
    await fs.ensureDir(STATE_DIR);
    await fs.ensureDir(LOCK_DIR);
  }

  /**
   * Obtiene la ruta del archivo de estado de un cliente.
   * @param {string} clientId
   */
  static getStatePath(clientId) {
    return path.join(STATE_DIR, `${clientId}.json`);
  }

  /**
   * Obtiene la ruta del archivo de lock de un cliente.
   * @param {string} clientId
   */
  static getLockPath(clientId) {
    return path.join(LOCK_DIR, `${clientId}.lock`);
  }

  /**
   * Verifica si un proceso está vivo en el sistema operativo.
   * @param {number} pid
   */
  static isProcessAlive(pid) {
    if (!pid) return false;
    try {
      // Envía señal 0 para comprobar existencia del proceso
      process.kill(pid, 0);
      return true;
    } catch (err) {
      // ESRCH significa que el proceso no existe
      return err.code !== 'ESRCH';
    }
  }

  // ─── LÓGICA DE CONTROL DE CONCURRENCIA (LOCKS) ──────────────────────────────

  /**
   * Intenta adquirir un bloqueo persistente de forma atómica para un cliente.
   * Si el bloqueo existe y está activo (proceso vivo y no expirado), rechaza.
   * @param {string} clientId
   * @param {string} taskId
   * @returns {Promise<boolean>} true si se adquirió con éxito
   */
  static async acquireLock(clientId, taskId) {
    await this.ensureStateDir();
    const lockPath = this.getLockPath(clientId);

    const checkAndVerify = async () => {
      if (await fs.pathExists(lockPath)) {
        try {
          const lock = await fs.readJson(lockPath);
          const elapsed = Date.now() - (lock.timestamp || 0);
          const processAlive = this.isProcessAlive(lock.pid);

          if (processAlive && elapsed < LOCK_TIMEOUT_MS) {
            throw new Error(
              `Ya hay una tarea de aprovisionamiento activa para el cliente "${clientId}" (PID: ${lock.pid}, Task: ${lock.taskId}).`
            );
          }
          // Si no está vivo o está expirado, limpiamos el lock viejo
          await fs.remove(lockPath);
        } catch (err) {
          if (err.message.includes('activa para el cliente')) {
            throw err;
          }
          // Si está corrupto, lo borramos
          await fs.remove(lockPath).catch(() => {});
        }
      }
    };

    await checkAndVerify();

    const lockData = {
      clientId,
      pid: process.pid,
      timestamp: Date.now(),
      taskId
    };

    try {
      // Guardar de forma atómica usando la bandera 'wx'
      await fs.writeFile(lockPath, JSON.stringify(lockData, null, 2), { flag: 'wx' });
      return true;
    } catch (err) {
      if (err.code === 'EEXIST') {
        // Re-verificar por si otra petición concurrente ganó en el intervalo
        await checkAndVerify();
        try {
          await fs.writeFile(lockPath, JSON.stringify(lockData, null, 2), { flag: 'wx' });
          return true;
        } catch (retryErr) {
          throw new Error(
            `Ya hay una tarea de aprovisionamiento activa para el cliente "${clientId}".`
          );
        }
      }
      throw err;
    }
  }

  /**
   * Libera el bloqueo de un cliente.
   * @param {string} clientId
   */
  static async releaseLock(clientId) {
    const lockPath = this.getLockPath(clientId);
    await fs.remove(lockPath);
  }

  /**
   * Comprueba si un cliente está actualmente bloqueado.
   * @param {string} clientId
   * @returns {Promise<boolean>}
   */
  static async isLocked(clientId) {
    const lockPath = this.getLockPath(clientId);
    if (!await fs.pathExists(lockPath)) return false;

    try {
      const lock = await fs.readJson(lockPath);
      const elapsed = Date.now() - (lock.timestamp || 0);
      const processAlive = this.isProcessAlive(lock.pid);
      return processAlive && elapsed < LOCK_TIMEOUT_MS;
    } catch (_) {
      return false;
    }
  }

  // ─── LÓGICA DE GESTIÓN DE ESTADO (LIFECYCLE) ────────────────────────────────

  /**
   * Registra una transición de estado en el ciclo de vida de aprovisionamiento.
   * @param {string} clientId
   * @param {string} state Estado a registrar (pending|provisioning|completed|failed|rollback)
   * @param {Object} dataOrMetadata Datos adicionales o metadatos
   */
  static async transitionTo(clientId, state, dataOrMetadata = {}) {
    const validStates = new Set(['pending', 'provisioning', 'completed', 'failed', 'rollback']);
    if (!validStates.has(state)) {
      throw new Error(`Estado de aprovisionamiento no válido: ${state}`);
    }

    await this.ensureStateDir();
    const statePath = this.getStatePath(clientId);
    const now = new Date().toISOString();

    let stateRecord = {
      clientId,
      state,
      taskId: dataOrMetadata.taskId || null,
      pid: process.pid,
      createdAt: now,
      updatedAt: now,
      timestamps: {
        pending: null,
        provisioning: null,
        completed: null,
        failed: null,
        rollback: null
      },
      metadata: {}
    };

    // Si ya existe el registro, leer y fundir
    if (await fs.pathExists(statePath)) {
      try {
        const existing = await fs.readJson(statePath);
        stateRecord = {
          ...stateRecord,
          ...existing,
          state,
          updatedAt: now,
          pid: process.pid
        };
        if (dataOrMetadata.taskId) {
          stateRecord.taskId = dataOrMetadata.taskId;
        }
      } catch (err) {
        // En caso de JSON corrupto, ignorar y sobreescribir
      }
    }

    // Actualizar el timestamp del estado específico
    stateRecord.timestamps[state] = now;

    // Mezclar metadatos opcionales
    const metadata = dataOrMetadata.metadata || (dataOrMetadata.taskId ? dataOrMetadata.metadata : dataOrMetadata);
    if (metadata && typeof metadata === 'object') {
      stateRecord.metadata = {
        ...stateRecord.metadata,
        ...metadata
      };
      // Evitar propagación de campos de control interno en metadata
      delete stateRecord.metadata.taskId;
      delete stateRecord.metadata.metadata;
    }

    await fs.writeJson(statePath, stateRecord, { spaces: 2 });
    return stateRecord;
  }

  /**
   * Obtiene el estado actual registrado de un cliente.
   * @param {string} clientId
   * @returns {Promise<Object|null>}
   */
  static async getState(clientId) {
    const statePath = this.getStatePath(clientId);
    if (!await fs.pathExists(statePath)) return null;

    try {
      return await fs.readJson(statePath);
    } catch (_) {
      return null;
    }
  }

  /**
   * Obtiene todos los estados registrados.
   * @returns {Promise<Array<Object>>}
   */
  static async getAllStates() {
    await this.ensureStateDir();
    const files = await fs.readdir(STATE_DIR);
    const stateFiles = files.filter(f => f.endsWith('.json'));
    const records = [];

    for (const file of stateFiles) {
      try {
        const record = await fs.readJson(path.join(STATE_DIR, file));
        records.push(record);
      } catch (_) {
        // ignorar archivos corruptos
      }
    }

    return records;
  }
}
