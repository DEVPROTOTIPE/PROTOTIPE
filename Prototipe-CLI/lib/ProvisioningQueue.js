/**
 * lib/ProvisioningQueue.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Gestor de colas persistente y control de concurrencia secuencial para el
 * motor de aprovisionamiento de PROTOTIPE.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';
import { ProvisioningStateManager } from './ProvisioningStateManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const CLI_ROOT   = path.resolve(__dirname, '..');
const QUEUE_PATH = path.join(CLI_ROOT, 'artifacts', 'provisioning-queue.json');
const QUEUE_TMP  = path.join(CLI_ROOT, 'artifacts', 'provisioning-queue.tmp');

export class ProvisioningQueue {
  static queue = [];
  static activeWorkers = 0;
  static maxConcurrency = 1;
  static executor = null;
  static retryTimer = null;
  static sseBroadcaster = null;

  /**
   * Inicializa la cola de aprovisionamiento y ejecuta crash recovery.
   * @param {Function} executorFn Callback de ejecución física (run worker)
   * @param {Function} sseBroadcasterFn Callback para emitir actualizaciones de posición por SSE
   */
  static async initialize(executorFn, sseBroadcasterFn) {
    this.executor = executorFn;
    this.sseBroadcaster = sseBroadcasterFn;
    this.activeWorkers = 0;

    await fs.ensureDir(path.dirname(QUEUE_PATH));

    if (await fs.pathExists(QUEUE_PATH)) {
      try {
        const data = await fs.readJson(QUEUE_PATH);
        this.queue = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error(`[ProvisioningQueue] Error al leer cola persistente: ${err.message}. Reconfigurando cola vacía.`);
        this.queue = [];
      }
    } else {
      this.queue = [];
    }

    // Ejecutar crash recovery
    await this.runCrashRecovery();

    // Iniciar procesamiento en background
    this.processQueue();
  }

  /**
   * Crash Recovery: Recupera el estado de jobs caídos por reinicio de instancia.
   */
  static async runCrashRecovery() {
    let changed = false;

    for (const job of this.queue) {
      if (job.status === 'processing' || job.status === 'acquiring_lock') {
        job.status = 'failed';
        job.updatedAt = new Date().toISOString();
        job.error = 'system_restart_recovery';
        changed = true;

        // Liberar lock y registrar estado fallido en StateManager
        try {
          await ProvisioningStateManager.transitionTo(job.clientId, 'failed', {
            taskId: job.taskId,
            metadata: { error: 'system_restart_recovery' }
          });
          await ProvisioningStateManager.releaseLock(job.clientId);
        } catch (err) {
          console.error(`[ProvisioningQueue Recovery Warning] Error al liberar recursos para ${job.clientId}: ${err.message}`);
        }
      } else if (job.status === 'waiting_lock') {
        // Regresar a queued para reintentar automáticamente al reiniciar
        job.status = 'queued';
        job.updatedAt = new Date().toISOString();
        changed = true;
      }
    }

    if (changed) {
      await this.saveQueue();
    }
  }

  /**
   * Registra un nuevo Job de aprovisionamiento en la cola.
   * @param {string} taskId
   * @param {string} clientId
   * @param {Object} answers
   */
  static async enqueue(taskId, clientId, answers) {
    // Si ya existe un job activo para el mismo clientId,
    // se encola igual, pero el scheduler lo mandará a waiting_lock
    const job = {
      taskId,
      clientId,
      answers,
      status: 'queued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      error: null
    };

    this.queue.push(job);
    await this.saveQueue();

    // Emitir eventos de posición actualizados
    this.broadcastPositions();

    // Disparar procesamiento
    this.processQueue();
    return job;
  }

  /**
   * Obtiene la posición de un job activo/esperando en la cola.
   * @param {string} taskId
   * @returns {number} 1-indexed posición en cola de espera
   */
  static getQueuePosition(taskId) {
    const waitingJobs = this.queue.filter(j => ['queued', 'acquiring_lock', 'waiting_lock'].includes(j.status));
    const index = waitingJobs.findIndex(j => j.taskId === taskId);
    return index !== -1 ? index + 1 : 0;
  }

  /**
   * Notifica a todos los clientes SSE sobre su posición actual en la cola.
   */
  static broadcastPositions() {
    if (this.sseBroadcaster) {
      const activeJobs = this.queue.filter(j => ['queued', 'acquiring_lock', 'waiting_lock', 'processing'].includes(j.status));
      for (const job of activeJobs) {
        const position = this.getQueuePosition(job.taskId);
        this.sseBroadcaster(job.taskId, {
          type: 'queue',
          position
        });
      }
    }
  }

  /**
   * Procesa las tareas pendientes en la cola respetando maxConcurrency = 1.
   */
  static async processQueue() {
    if (this.activeWorkers >= this.maxConcurrency) {
      return;
    }

    // Encontrar la siguiente tarea encolada
    const nextJob = this.queue.find(j => j.status === 'queued');
    if (!nextJob) {
      // Si hay jobs en waiting_lock y no hay timer activo, programamos un reintento
      const hasWaiting = this.queue.some(j => j.status === 'waiting_lock');
      if (hasWaiting && !this.retryTimer) {
        this.retryTimer = setTimeout(() => {
          this.retryTimer = null;
          this.retryWaitingJobs();
        }, 5000);
      }
      return;
    }

    // Transicionar a acquiring_lock
    nextJob.status = 'acquiring_lock';
    nextJob.updatedAt = new Date().toISOString();
    await this.saveQueue();
    this.broadcastPositions();

    try {
      // Intentar adquirir el bloqueo físico de ProvisioningStateManager
      await ProvisioningStateManager.acquireLock(nextJob.clientId, nextJob.taskId);

      // Lock adquirido -> Transicionar a processing e iniciar ejecución física
      nextJob.status = 'processing';
      nextJob.updatedAt = new Date().toISOString();
      await this.saveQueue();
      this.broadcastPositions();

      this.activeWorkers++;

      // Disparar ejecución asíncrona
      if (this.executor) {
        this.executor(nextJob.taskId, nextJob.answers).catch(err => {
          this.failJob(nextJob.taskId, err.message);
        });
      }
    } catch (err) {
      // Fallo al adquirir lock -> Job pasa a waiting_lock (no ejecuta worker)
      nextJob.status = 'waiting_lock';
      nextJob.updatedAt = new Date().toISOString();
      nextJob.error = err.message;
      await this.saveQueue();
      this.broadcastPositions();

      // Intentar procesar otros jobs en cola
      this.processQueue();
    }
  }

  /**
   * Pasa los jobs waiting_lock de nuevo a queued para intentar procesarlos.
   */
  static async retryWaitingJobs() {
    let changed = false;
    for (const job of this.queue) {
      if (job.status === 'waiting_lock') {
        job.status = 'queued';
        job.updatedAt = new Date().toISOString();
        changed = true;
      }
    }
    if (changed) {
      await this.saveQueue();
      this.broadcastPositions();
      this.processQueue();
    }
  }

  /**
   * Completa un job de aprovisionamiento.
   * @param {string} taskId
   */
  static async completeJob(taskId) {
    const job = this.queue.find(j => j.taskId === taskId);
    if (job) {
      job.status = 'completed';
      job.updatedAt = new Date().toISOString();
      await this.saveQueue();
      if (this.activeWorkers > 0) this.activeWorkers--;
      this.broadcastPositions();
      this.processQueue();
    }
  }

  /**
   * Falla un job de aprovisionamiento con registro de error.
   * @param {string} taskId
   * @param {string} error
   */
  static async failJob(taskId, error) {
    const job = this.queue.find(j => j.taskId === taskId);
    if (job) {
      job.status = 'failed';
      job.error = error;
      job.updatedAt = new Date().toISOString();
      await this.saveQueue();
      if (this.activeWorkers > 0) this.activeWorkers--;
      this.broadcastPositions();
      this.processQueue();
    }
  }

  /**
   * Cancela un job de aprovisionamiento manualmente.
   * @param {string} taskId
   */
  static async cancelJob(taskId) {
    const job = this.queue.find(j => j.taskId === taskId);
    if (job) {
      const originalStatus = job.status;
      job.status = 'cancelled';
      job.updatedAt = new Date().toISOString();
      await this.saveQueue();

      if (originalStatus === 'processing') {
        if (this.activeWorkers > 0) this.activeWorkers--;
        // Liberar recursos físicos
        try {
          await ProvisioningStateManager.transitionTo(job.clientId, 'failed', {
            taskId,
            metadata: { error: 'cancelled' }
          });
          await ProvisioningStateManager.releaseLock(job.clientId);
        } catch (_) {}
      }

      this.broadcastPositions();
      this.processQueue();
    }
  }

  /**
   * Persistencia Atómica: Escribe provisioning-queue.tmp y renombra a provisioning-queue.json.
   */
  static async saveQueue() {
    try {
      await fs.ensureDir(path.dirname(QUEUE_PATH));
      // Escribir archivo temporal
      await fs.writeJson(QUEUE_TMP, this.queue, { spaces: 2 });
      // Renombrado atómico
      await fs.rename(QUEUE_TMP, QUEUE_PATH);
    } catch (err) {
      console.error(`[ProvisioningQueue] Falló persistencia atómica: ${err.message}`);
      // Fallback secundario si rename es bloqueado por antivirus/OS
      try {
        await fs.writeJson(QUEUE_PATH, this.queue, { spaces: 2 });
      } catch (fallbackErr) {
        console.error(`[ProvisioningQueue] Fallback de escritura falló: ${fallbackErr.message}`);
      }
    }
  }
}
