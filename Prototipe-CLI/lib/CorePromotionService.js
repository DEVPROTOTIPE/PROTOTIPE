import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { PromotionBlueprintBuilder } from './PromotionBlueprintBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');

const BLUEPRINTS_DIR = path.join(CLI_ROOT, 'blueprints');
const PROMO_DIR = path.join(BLUEPRINTS_DIR, 'promotions');
const MIGRATE_DIR = path.join(BLUEPRINTS_DIR, 'migrations');

const LOCKS_DIR = path.join(CLI_ROOT, 'locks', 'core-promotions');
const IDEMPOTENCY_DIR = path.join(CLI_ROOT, 'idempotency', 'core-promotions');

// Registro en memoria de timers de heartbeat activos { targetCoreKey: timerRef }
const activeHeartbeats = {};

export class CorePromotionService {
  /**
   * Rutina de recuperación determinista de estados inconclusos tras reiniciar el Bridge CLI
   */
  static async recoverInterruptedOperations() {
    console.log('[CorePromotionService] Iniciando escaneo de recuperación de blueprints inconclusos...');
    
    // Asegurar directorios físicos
    fs.ensureDirSync(PROMO_DIR);
    fs.ensureDirSync(MIGRATE_DIR);
    fs.ensureDirSync(LOCKS_DIR);
    fs.ensureDirSync(IDEMPOTENCY_DIR);

    // Recuperar promociones
    const promoFiles = fs.readdirSync(PROMO_DIR).filter(file => file.endsWith('.json'));
    for (const file of promoFiles) {
      try {
        const filePath = path.join(PROMO_DIR, file);
        const blueprint = PromotionBlueprintBuilder.loadPromotionBlueprint(filePath);
        
        const unfinishedStates = [
          'PENDING_PREFLIGHT',
          'RUNNING_SANITIZATION',
          'RUNNING_VALIDATION',
          'RUNNING_BUILD_SMOKE',
          'PUBLISHING',
          'ACTIVATING',
          'ROLLING_BACK_ACTIVATION',
          'ROLLING_BACK_PUBLICATION'
        ];

        if (unfinishedStates.includes(blueprint.status)) {
          console.warn(`[CorePromotionService] Encontrada promoción ${blueprint.promotionId} interrumpida en estado ${blueprint.status}. Iniciando recuperación...`);
          await this.recoverPromoBlueprint(blueprint, filePath);
        }
      } catch (err) {
        console.error(`[CorePromotionService] Error recuperando archivo de promoción ${file}:`, err.message);
      }
    }

    // Recuperar migraciones
    const migrateFiles = fs.readdirSync(MIGRATE_DIR).filter(file => file.endsWith('.json'));
    for (const file of migrateFiles) {
      try {
        const filePath = path.join(MIGRATE_DIR, file);
        const blueprint = PromotionBlueprintBuilder.loadMigrationBlueprint(filePath);

        const unfinishedStates = [
          'PENDING_PREFLIGHT',
          'PENDING_BACKUP',
          'BACKUP_CREATED',
          'RUNNING_MIGRATION',
          'RUNNING_POST_VALIDATION',
          'ROLLING_BACK'
        ];

        if (unfinishedStates.includes(blueprint.status)) {
          console.warn(`[CorePromotionService] Encontrada migración ${blueprint.migrationId} interrumpida en estado ${blueprint.status}. Iniciando recuperación...`);
          await this.recoverMigrateBlueprint(blueprint, filePath);
        }
      } catch (err) {
        console.error(`[CorePromotionService] Error recuperando archivo de migración ${file}:`, err.message);
      }
    }
  }

  /**
   * Conciliador transaccional de estados de Promoción
   */
  static async recoverPromoBlueprint(blueprint, filePath) {
    const status = blueprint.status;

    if (status === 'PENDING_PREFLIGHT') {
      return;
    }

    if (status === 'RUNNING_SANITIZATION') {
      blueprint.status = 'FAILED_SANITIZATION';
      this.purgarStaging(blueprint.stagingPath);
      PromotionBlueprintBuilder.safeWriteJson(filePath, blueprint);
      return;
    }

    if (status === 'RUNNING_VALIDATION') {
      blueprint.status = 'PREFLIGHT_APPROVED';
      PromotionBlueprintBuilder.safeWriteJson(filePath, blueprint);
      return;
    }

    if (status === 'RUNNING_BUILD_SMOKE') {
      blueprint.status = 'FAILED_BUILD';
      PromotionBlueprintBuilder.safeWriteJson(filePath, blueprint);
      return;
    }

    if (status === 'PUBLISHING') {
      blueprint.status = 'FAILED';
      PromotionBlueprintBuilder.safeWriteJson(filePath, blueprint);
      return;
    }

    if (status === 'ACTIVATING') {
      blueprint.status = 'FAILED_ACTIVATION';
      PromotionBlueprintBuilder.safeWriteJson(filePath, blueprint);
      return;
    }

    if (status === 'ROLLING_BACK_ACTIVATION' || status === 'ROLLING_BACK_PUBLICATION') {
      blueprint.status = 'ROLLED_BACK';
      PromotionBlueprintBuilder.safeWriteJson(filePath, blueprint);
      return;
    }
  }

  /**
   * Conciliador transaccional de estados de Migración
   */
  static async recoverMigrateBlueprint(blueprint, filePath) {
    const status = blueprint.status;

    if (status === 'PENDING_PREFLIGHT') {
      return;
    }

    if (status === 'PENDING_BACKUP' || status === 'BACKUP_CREATED') {
      blueprint.status = 'FAILED';
      PromotionBlueprintBuilder.safeWriteJson(filePath, blueprint);
      return;
    }

    if (status === 'RUNNING_MIGRATION' || status === 'RUNNING_POST_VALIDATION') {
      blueprint.status = 'ROLLING_BACK';
      PromotionBlueprintBuilder.safeWriteJson(filePath, blueprint);
      return;
    }

    if (status === 'ROLLING_BACK') {
      blueprint.status = 'ROLLED_BACK';
      PromotionBlueprintBuilder.safeWriteJson(filePath, blueprint);
      return;
    }
  }

  static purgarStaging(stagingPath) {
    if (stagingPath && fs.existsSync(stagingPath)) {
      try {
        fs.removeSync(stagingPath);
        console.log(`[CorePromotionService] Purgado staging parcial en: ${stagingPath}`);
      } catch (err) {
        console.error(`[CorePromotionService] Error al purgar staging: ${err.message}`);
      }
    }
  }

  // ==========================================
  // GOBERNANZA DE LOCKS PERSISTENTES EN DISCO
  // ==========================================

  /**
   * Adquiere un lockfile persistente para el targetCoreKey
   */
  static acquireLock(targetCoreKey, promotionId) {
    fs.ensureDirSync(LOCKS_DIR);
    const lockFilePath = path.join(LOCKS_DIR, `${targetCoreKey}.lock.json`);

    if (fs.existsSync(lockFilePath)) {
      let activeLock;
      try {
        activeLock = fs.readJsonSync(lockFilePath);
      } catch (err) {
        console.warn(`[CorePromotionService] Falló lectura de lock corrupto para ${targetCoreKey}. Se procederá a sobreescribir.`);
      }

      if (activeLock) {
        // Verificar si el PID registrado sigue corriendo
        let processExists = false;
        try {
          process.kill(activeLock.pid, 0);
          processExists = true;
        } catch (e) {
          // PID no existe
        }

        const heartbeatAge = Date.now() - new Date(activeLock.heartbeatAt).getTime();
        const heartbeatExpired = heartbeatAge > 90 * 1000;

        if (processExists && !heartbeatExpired) {
          throw new Error(`Colisión de Lock: El core candidato '${targetCoreKey}' ya está siendo procesado por la promoción '${activeLock.promotionId}' (PID: ${activeLock.pid}).`);
        } else {
          console.warn(`[CorePromotionService] Reclamando stale lock para ${targetCoreKey}. Proceso existente: ${processExists}, Heartbeat expirado: ${heartbeatExpired}`);
        }
      }
    }

    // Crear el nuevo lock
    const lockData = {
      targetCoreKey,
      promotionId,
      pid: process.pid,
      acquiredAt: new Date().toISOString(),
      heartbeatAt: new Date().toISOString()
    };

    fs.writeJsonSync(lockFilePath, lockData, { spaces: 2 });
    this.startHeartbeat(targetCoreKey, promotionId);
    console.log(`[CorePromotionService] Lock adquirido para ${targetCoreKey} (Promoción: ${promotionId})`);
  }

  /**
   * Inicia temporizador de actualización de heartbeat
   */
  static startHeartbeat(targetCoreKey, promotionId) {
    this.stopHeartbeat(targetCoreKey);

    const timer = setInterval(() => {
      const lockFilePath = path.join(LOCKS_DIR, `${targetCoreKey}.lock.json`);
      if (fs.existsSync(lockFilePath)) {
        try {
          const lockData = fs.readJsonSync(lockFilePath);
          if (lockData.promotionId === promotionId) {
            lockData.heartbeatAt = new Date().toISOString();
            fs.writeJsonSync(lockFilePath, lockData, { spaces: 2 });
          } else {
            // Ya no somos los dueños del lock
            this.stopHeartbeat(targetCoreKey);
          }
        } catch (err) {
          console.error(`[CorePromotionService] Error actualizando heartbeat de lock para ${targetCoreKey}:`, err.message);
        }
      } else {
        this.stopHeartbeat(targetCoreKey);
      }
    }, 30 * 1000);

    // Evitar que el temporizador impida que Node se cierre
    timer.unref();
    activeHeartbeats[targetCoreKey] = timer;
  }

  /**
   * Detiene temporizador de heartbeat
   */
  static stopHeartbeat(targetCoreKey) {
    if (activeHeartbeats[targetCoreKey]) {
      clearInterval(activeHeartbeats[targetCoreKey]);
      delete activeHeartbeats[targetCoreKey];
    }
  }

  /**
   * Libera y remueve el lockfile persistente
   */
  static releaseLock(targetCoreKey) {
    this.stopHeartbeat(targetCoreKey);
    const lockFilePath = path.join(LOCKS_DIR, `${targetCoreKey}.lock.json`);
    if (fs.existsSync(lockFilePath)) {
      try {
        fs.unlinkSync(lockFilePath);
        console.log(`[CorePromotionService] Lock liberado para ${targetCoreKey}`);
      } catch (err) {
        console.error(`[CorePromotionService] Falló eliminación de lockfile para ${targetCoreKey}:`, err.message);
      }
    }
  }

  // ==========================================
  // MOTOR DE IDEMPOTENCIA BASADO EN DISCO
  // ==========================================

  /**
   * Compara e identifica llamadas de peticiones idempotentes
   */
  static checkIdempotency(idempotencyKey, payload) {
    fs.ensureDirSync(IDEMPOTENCY_DIR);
    const filePath = path.join(IDEMPOTENCY_DIR, `${idempotencyKey}.json`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const cached = fs.readJsonSync(filePath);
    const currentHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');

    if (cached.payloadHash !== currentHash) {
      const err = new Error('Conflicto de Idempotencia: La llave de idempotencia ya fue usada con un payload diferente.');
      err.statusCode = 409;
      throw err;
    }

    return cached.response;
  }

  /**
   * Guarda y cachea el resultado del endpoint en disco
   */
  static saveIdempotency(idempotencyKey, payload, response) {
    fs.ensureDirSync(IDEMPOTENCY_DIR);
    const filePath = path.join(IDEMPOTENCY_DIR, `${idempotencyKey}.json`);
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');

    const data = {
      idempotencyKey,
      payloadHash,
      schemaVersion: "1.0.0",
      createdAt: new Date().toISOString(),
      response
    };

    fs.writeJsonSync(filePath, data, { spaces: 2 });
  }

  // ==========================================
  // VALIDADOR DE MÁQUINA DE ESTADOS
  // ==========================================

  /**
   * Transición de estados controlada del pipeline
   */
  static transitionTo(blueprint, nextStatus, filePath) {
    const currentStatus = blueprint.status;

    const allowedTransitions = {
      'PENDING_PREFLIGHT': ['PREFLIGHT_APPROVED', 'FAILED_SANITIZATION', 'DISCARDED'],
      'PREFLIGHT_APPROVED': ['RUNNING_SANITIZATION', 'PENDING_MANUAL_REVIEW', 'DISCARDED'],
      'RUNNING_SANITIZATION': ['PENDING_MANUAL_REVIEW', 'RUNNING_VALIDATION', 'FAILED_SANITIZATION'],
      'PENDING_MANUAL_REVIEW': ['RUNNING_VALIDATION', 'DISCARDED'],
      'RUNNING_VALIDATION': ['RUNNING_BUILD_SMOKE', 'QUARANTINED', 'FAILED_SANITIZATION'],
      'QUARANTINED': ['RUNNING_VALIDATION', 'DISCARDED'],
      'RUNNING_BUILD_SMOKE': ['CANDIDATE_READY', 'FAILED_BUILD'],
      'FAILED_BUILD': ['RUNNING_BUILD_SMOKE', 'DISCARDED'],
      'FAILED_SANITIZATION': ['RUNNING_SANITIZATION', 'DISCARDED'],
      'CANDIDATE_READY': ['PUBLISHING', 'DISCARDED'],
      'PUBLISHING': ['PUBLISHED_INACTIVE', 'ROLLING_BACK_PUBLICATION'],
      'ROLLING_BACK_PUBLICATION': ['ROLLED_BACK'],
      'PUBLISHED_INACTIVE': ['ACTIVATING', 'DISCARDED', 'ROLLING_BACK_PUBLICATION'],
      'ACTIVATING': ['ACTIVE', 'FAILED_ACTIVATION', 'ROLLING_BACK_ACTIVATION'],
      'FAILED_ACTIVATION': ['ROLLING_BACK_ACTIVATION'],
      'ROLLING_BACK_ACTIVATION': ['ROLLED_BACK', 'PUBLISHED_INACTIVE'],
      'ROLLED_BACK': ['PENDING_PREFLIGHT', 'DISCARDED', 'ROLLING_BACK_PUBLICATION'],
      'ACTIVE': ['ROLLING_BACK_ACTIVATION']
    };

    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`Transición de estado inválida: No se permite cambiar de ${currentStatus} a ${nextStatus}.`);
    }

    blueprint.status = nextStatus;
    blueprint.updatedAt = new Date().toISOString();

    if (filePath) {
      PromotionBlueprintBuilder.safeWriteJson(filePath, blueprint);
    }

    console.log(`[CorePromotionService] Transicionando blueprint ${blueprint.promotionId}: ${currentStatus} -> ${nextStatus}`);
  }
}
