import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { CorePromotionService } from './CorePromotionService.js';
import { PromotionBlueprintBuilder } from './PromotionBlueprintBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, '..');

const REGISTRO_PATH = path.join(CLI_ROOT, 'plantillas_registro.json');
const JOURNALS_PROMO_DIR = path.join(CLI_ROOT, 'journals', 'core-promotions');
const JOURNALS_ACT_DIR = path.join(CLI_ROOT, 'journals', 'core-activations');

export class CorePromotionPublisher {
  /**
   * Helper para calcular el hash SHA-256 de un archivo
   */
  static getFileHash(filePath) {
    if (!fs.existsSync(filePath)) return null;
    try {
      const buffer = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(buffer).digest('hex');
    } catch (err) {
      console.error(`[CorePromotionPublisher] Error calculando hash para ${filePath}:`, err.message);
      return null;
    }
  }

  /**
   * Publica de Staging a Plantillas Core/App [Nombre] del CLI de forma atómica y auditable
   */
  static async publish(blueprint, blueprintFilePath) {
    if (blueprint.status !== 'CANDIDATE_READY') {
      throw new Error(`Publicación denegada: El blueprint debe estar en estado CANDIDATE_READY. Estado actual: ${blueprint.status}`);
    }

    // Cambiar estado a PUBLISHING
    CorePromotionService.transitionTo(blueprint, 'PUBLISHING', blueprintFilePath);

    fs.ensureDirSync(JOURNALS_PROMO_DIR);
    const journalFilePath = path.join(JOURNALS_PROMO_DIR, `promo-${blueprint.promotionId}.json`);

    const journal = {
      schemaVersion: '1.0.0',
      operationId: blueprint.promotionId,
      operationType: 'CORE_PUBLICATION',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        {
          id: 'COPY_STAGING_TO_PLANTILLAS_CORE',
          status: 'PENDING',
          startedAt: new Date().toISOString(),
          completedAt: null,
          artifacts: []
        },
        {
          id: 'REGISTER_INACTIVE_TEMPLATE',
          status: 'PENDING',
          startedAt: new Date().toISOString(),
          completedAt: null,
          artifacts: []
        }
      ]
    };

    // Guardar journal inicial
    PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

    try {
      // 1. Paso: COPY_STAGING_TO_PLANTILLAS_CORE
      const step1 = journal.steps.find(s => s.id === 'COPY_STAGING_TO_PLANTILLAS_CORE');
      step1.status = 'IN_PROGRESS';
      step1.startedAt = new Date().toISOString();
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      const targetTemplatesCoreDir = path.join(CLI_ROOT, '..', 'Plantillas Core', `App ${blueprint.targetCoreName}`);
      let backupDir = null;

      // Si ya existía el directorio, hacemos backup para poder recuperarlo en rollback
      if (fs.existsSync(targetTemplatesCoreDir)) {
        backupDir = path.join(CLI_ROOT, 'scratch', 'backups', `${blueprint.targetCoreKey}-${Date.now()}`);
        fs.ensureDirSync(path.dirname(backupDir));
        fs.moveSync(targetTemplatesCoreDir, backupDir);
        step1.artifacts.push({
          path: targetTemplatesCoreDir.replace(/\\/g, '/'),
          artifactType: 'DIRECTORY',
          ownership: 'MODIFIED_BY_OPERATION',
          action: 'RENAME',
          beforeHash: null,
          afterHash: null,
          rollbackAction: 'RENAME_BACK',
          backupPath: backupDir.replace(/\\/g, '/')
        });
      } else {
        step1.artifacts.push({
          path: targetTemplatesCoreDir.replace(/\\/g, '/'),
          artifactType: 'DIRECTORY',
          ownership: 'CREATED_BY_OPERATION',
          action: 'CREATE',
          beforeHash: null,
          afterHash: null,
          rollbackAction: 'DELETE_IF_HASH_MATCHES'
        });
      }

      // Copiar staging a Plantillas Core/App [Nombre]
      fs.copySync(blueprint.stagingPath, targetTemplatesCoreDir);

      step1.status = 'COMPLETED';
      step1.completedAt = new Date().toISOString();
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      // 2. Paso: REGISTER_INACTIVE_TEMPLATE
      const step2 = journal.steps.find(s => s.id === 'REGISTER_INACTIVE_TEMPLATE');
      step2.status = 'IN_PROGRESS';
      step2.startedAt = new Date().toISOString();
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      const registro = fs.readJsonSync(REGISTRO_PATH);
      const originalEntry = registro.plantillas[blueprint.targetCoreKey] ? JSON.parse(JSON.stringify(registro.plantillas[blueprint.targetCoreKey])) : null;

      // Guardar el registro anterior en el journal (antes de la modificación)
      const registroBackupPath = path.join(CLI_ROOT, 'scratch', 'backups', `registro-${blueprint.promotionId}-${Date.now()}.json`);
      fs.ensureDirSync(path.dirname(registroBackupPath));
      fs.writeJsonSync(registroBackupPath, registro, { spaces: 2 });

      const targetTemplateDir = path.join(CLI_ROOT, 'templates', 'template-' + blueprint.targetCoreKey);

      // Registrar como inactivo v0.0.1
      registro.plantillas[blueprint.targetCoreKey] = {
        coreType: blueprint.targetCoreKey,
        fuente: targetTemplatesCoreDir.replace(/\\/g, '/'),
        destino: targetTemplateDir.replace(/\\/g, '/'),
        nicho: blueprint.nicho,
        activo: false,
        version: '0.0.1',
        activationCount: 0,
        firstActivatedAt: null
      };

      step2.artifacts.push({
        path: REGISTRO_PATH.replace(/\\/g, '/'),
        artifactType: 'FILE',
        ownership: originalEntry ? 'MODIFIED_BY_OPERATION' : 'CREATED_BY_OPERATION',
        action: originalEntry ? 'MODIFY' : 'CREATE',
        beforeHash: this.getFileHash(REGISTRO_PATH),
        afterHash: null,
        rollbackAction: 'RESTORE_BACKUP_IF_HASH_MATCHES',
        backupPath: registroBackupPath.replace(/\\/g, '/'),
        originalEntryData: originalEntry
      });

      // Escribir registro de plantillas de forma segura
      PromotionBlueprintBuilder.safeWriteJson(REGISTRO_PATH, registro);
      step2.artifacts[0].afterHash = this.getFileHash(REGISTRO_PATH);

      step2.status = 'COMPLETED';
      step2.completedAt = new Date().toISOString();
      journal.status = 'COMPLETED';
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      // Transición final a PUBLISHED_INACTIVE
      CorePromotionService.transitionTo(blueprint, 'PUBLISHED_INACTIVE', blueprintFilePath);
      console.log(`[CorePromotionPublisher] Core '${blueprint.targetCoreKey}' publicado como inactivo con éxito.`);

    } catch (err) {
      console.error(`[CorePromotionPublisher] Error en publicación: ${err.message}. Iniciando rollback compensatorio...`);
      journal.status = 'FAILED';
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      // Ejecutar Rollback
      await this.rollbackPublish(blueprint, blueprintFilePath, journalFilePath);
      throw err;
    }
  }

  /**
   * Revierte la publicación física restaurando el estado anterior según el journal
   */
  static async rollbackPublish(blueprint, blueprintFilePath, journalFilePath) {
    CorePromotionService.transitionTo(blueprint, 'ROLLING_BACK_PUBLICATION', blueprintFilePath);

    if (!fs.existsSync(journalFilePath)) {
      console.warn(`[CorePromotionPublisher] No se encontró el journal de publicación en ${journalFilePath}. Rollback incompleto.`);
      CorePromotionService.transitionTo(blueprint, 'ROLLED_BACK', blueprintFilePath);
      return;
    }

    const journal = PromotionBlueprintBuilder.loadJournal(journalFilePath);
    journal.status = 'ROLLING_BACK';
    journal.updatedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

    // Reversión de pasos en orden inverso
    const stepsToRevert = [...journal.steps].reverse();

    for (const step of stepsToRevert) {
      if (step.status === 'COMPLETED' || step.status === 'IN_PROGRESS') {
        step.status = 'PENDING'; // marcar en reversión
        for (const artifact of step.artifacts) {
          try {
            if (artifact.rollbackAction === 'DELETE_IF_HASH_MATCHES') {
              if (fs.existsSync(artifact.path)) {
                fs.removeSync(artifact.path);
                console.log(`[CorePromotionPublisher Rollback] Eliminado artefacto: ${artifact.path}`);
              }
            } else if (artifact.rollbackAction === 'RENAME_BACK' && artifact.backupPath) {
              if (fs.existsSync(artifact.backupPath)) {
                if (fs.existsSync(artifact.path)) {
                  fs.removeSync(artifact.path);
                }
                fs.moveSync(artifact.backupPath, artifact.path);
                console.log(`[CorePromotionPublisher Rollback] Restaurada carpeta original desde backup: ${artifact.path}`);
              }
            } else if (artifact.rollbackAction === 'RESTORE_BACKUP_IF_HASH_MATCHES') {
              // Restaurar plantillas_registro.json
              const registro = fs.readJsonSync(REGISTRO_PATH);
              if (artifact.originalEntryData) {
                registro.plantillas[blueprint.targetCoreKey] = artifact.originalEntryData;
              } else {
                delete registro.plantillas[blueprint.targetCoreKey];
              }
              PromotionBlueprintBuilder.safeWriteJson(REGISTRO_PATH, registro);
              console.log(`[CorePromotionPublisher Rollback] Restaurada entrada en registro para: ${blueprint.targetCoreKey}`);
            }
          } catch (artErr) {
            console.error(`[CorePromotionPublisher Rollback] Error revirtiendo artefacto ${artifact.path}:`, artErr.message);
          }
        }
        step.status = 'ROLLED_BACK';
        PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);
      }
    }

    journal.status = 'ROLLED_BACK';
    journal.updatedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

    CorePromotionService.transitionTo(blueprint, 'ROLLED_BACK', blueprintFilePath);
    console.log(`[CorePromotionPublisher] Rollback de publicación para '${blueprint.targetCoreKey}' finalizado.`);
  }

  /**
   * Activa la plantilla core, estableciendo SemVer 1.0.0, copiando de Plantillas Core a templates/ del CLI y reusando la lógica de dominio
   */
  static async activate(blueprint, blueprintFilePath) {
    if (blueprint.status !== 'PUBLISHED_INACTIVE') {
      throw new Error(`Activación denegada: El blueprint debe estar en estado PUBLISHED_INACTIVE. Estado actual: ${blueprint.status}`);
    }

    // Cambiar estado a ACTIVATING
    CorePromotionService.transitionTo(blueprint, 'ACTIVATING', blueprintFilePath);

    fs.ensureDirSync(JOURNALS_ACT_DIR);
    const journalFilePath = path.join(JOURNALS_ACT_DIR, `act-${blueprint.promotionId}.json`);

    const journal = {
      schemaVersion: '1.0.0',
      operationId: blueprint.promotionId,
      operationType: 'CORE_ACTIVATION',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        {
          id: 'CREATE_CLI_TEMPLATE_DIR',
          status: 'PENDING',
          startedAt: new Date().toISOString(),
          completedAt: null,
          artifacts: []
        },
        {
          id: 'ACTIVATE_IN_REGISTRY',
          status: 'PENDING',
          startedAt: new Date().toISOString(),
          completedAt: null,
          artifacts: []
        }
      ]
    };

    // Guardar journal inicial
    PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

    try {
      const registro = fs.readJsonSync(REGISTRO_PATH);
      const config = registro.plantillas[blueprint.targetCoreKey];
      if (!config) {
        throw new Error(`La plantilla '${blueprint.targetCoreKey}' no se encuentra registrada en plantillas_registro.json.`);
      }

      const sourceTemplatesCoreDir = config.fuente.replace(/\//g, path.sep); // p. ej. D:/PROTOTIPE/Plantillas Core/App [CoreName]
      const targetTemplateDir = config.destino.replace(/\//g, path.sep); // p. ej. D:/PROTOTIPE/Prototipe-CLI/templates/[targetCoreKey]

      // 1. Paso: CREATE_CLI_TEMPLATE_DIR
      const step1 = journal.steps.find(s => s.id === 'CREATE_CLI_TEMPLATE_DIR');
      step1.status = 'IN_PROGRESS';
      step1.startedAt = new Date().toISOString();
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      let backupTemplateDir = null;
      if (fs.existsSync(targetTemplateDir)) {
        backupTemplateDir = path.join(CLI_ROOT, 'scratch', 'backups', `cli-temp-${blueprint.targetCoreKey}-${Date.now()}`);
        fs.ensureDirSync(path.dirname(backupTemplateDir));
        fs.moveSync(targetTemplateDir, backupTemplateDir);
        step1.artifacts.push({
          path: targetTemplateDir.replace(/\\/g, '/'),
          artifactType: 'DIRECTORY',
          ownership: 'MODIFIED_BY_OPERATION',
          action: 'RENAME',
          beforeHash: null,
          afterHash: null,
          rollbackAction: 'RENAME_BACK',
          backupPath: backupTemplateDir.replace(/\\/g, '/')
        });
      } else {
        step1.artifacts.push({
          path: targetTemplateDir.replace(/\\/g, '/'),
          artifactType: 'DIRECTORY',
          ownership: 'CREATED_BY_OPERATION',
          action: 'CREATE',
          beforeHash: null,
          afterHash: null,
          rollbackAction: 'DELETE_IF_HASH_MATCHES'
        });
      }

      // Copiar la plantilla de la fuente a la carpeta templates/ del CLI (destino)
      fs.copySync(sourceTemplatesCoreDir, targetTemplateDir);

      step1.status = 'COMPLETED';
      step1.completedAt = new Date().toISOString();
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      // 2. Paso: ACTIVATE_IN_REGISTRY
      const step2 = journal.steps.find(s => s.id === 'ACTIVATE_IN_REGISTRY');
      step2.status = 'IN_PROGRESS';
      step2.startedAt = new Date().toISOString();
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      // Primera activación especial: establecer versión a 1.0.0
      const nextVersion = '1.0.0';
      const originalRegistryEntry = JSON.parse(JSON.stringify(config));

      config.activo = true;
      config.version = nextVersion;
      config.activationCount = (originalRegistryEntry.activationCount || 0) + 1;
      config.firstActivatedAt = originalRegistryEntry.firstActivatedAt || new Date().toISOString();

      // Registro en el journal para restauración
      const registryBackupPath = path.join(CLI_ROOT, 'scratch', 'backups', `registry-act-${blueprint.promotionId}-${Date.now()}.json`);
      fs.ensureDirSync(path.dirname(registryBackupPath));
      fs.writeJsonSync(registryBackupPath, registro, { spaces: 2 });

      step2.artifacts.push({
        path: REGISTRO_PATH.replace(/\\/g, '/'),
        artifactType: 'FILE',
        ownership: 'MODIFIED_BY_OPERATION',
        action: 'MODIFY',
        beforeHash: this.getFileHash(REGISTRO_PATH),
        afterHash: null,
        rollbackAction: 'RESTORE_BACKUP_IF_HASH_MATCHES',
        backupPath: registryBackupPath.replace(/\\/g, '/'),
        originalEntryData: originalRegistryEntry
      });

      // Actualizar package.json en templates y en Plantillas Core
      const pgsToUpdate = [
        path.join(targetTemplateDir, 'package.json'),
        path.join(sourceTemplatesCoreDir, 'package.json')
      ];

      for (const pkgFilePath of pgsToUpdate) {
        if (fs.existsSync(pkgFilePath)) {
          const originalPkgData = fs.readJsonSync(pkgFilePath);
          const pkgBackupPath = path.join(CLI_ROOT, 'scratch', 'backups', `pkg-${path.basename(path.dirname(pkgFilePath))}-${blueprint.promotionId}-${Date.now()}.json`);
          fs.ensureDirSync(path.dirname(pkgBackupPath));
          fs.writeJsonSync(pkgBackupPath, originalPkgData, { spaces: 2 });

          step2.artifacts.push({
            path: pkgFilePath.replace(/\\/g, '/'),
            artifactType: 'FILE',
            ownership: 'MODIFIED_BY_OPERATION',
            action: 'MODIFY',
            beforeHash: this.getFileHash(pkgFilePath),
            afterHash: null,
            rollbackAction: 'RESTORE_BACKUP_IF_HASH_MATCHES',
            backupPath: pkgBackupPath.replace(/\\/g, '/'),
            originalEntryData: originalPkgData
          });

          originalPkgData.version = nextVersion;
          PromotionBlueprintBuilder.safeWriteJson(pkgFilePath, originalPkgData);
        }
      }

      // Escribir registro de plantillas modificado
      PromotionBlueprintBuilder.safeWriteJson(REGISTRO_PATH, registro);

      // Actualizar afterHashes
      for (const artifact of step2.artifacts) {
        artifact.afterHash = this.getFileHash(artifact.path);
      }

      step2.status = 'COMPLETED';
      step2.completedAt = new Date().toISOString();
      journal.status = 'COMPLETED';
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      // Transición final a ACTIVE
      CorePromotionService.transitionTo(blueprint, 'ACTIVE', blueprintFilePath);

      // Liberar el lock de promoción
      CorePromotionService.releaseLock(blueprint.targetCoreKey);

      console.log(`[CorePromotionPublisher] Core '${blueprint.targetCoreKey}' activado v${nextVersion} con éxito.`);

    } catch (err) {
      console.error(`[CorePromotionPublisher] Error en activación: ${err.message}. Iniciando rollback de activación...`);
      journal.status = 'FAILED';
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      await this.rollbackActivate(blueprint, blueprintFilePath, journalFilePath);
      throw err;
    }
  }

  /**
   * Revierte la activación física restaurando el estado anterior según el journal de activación
   */
  static async rollbackActivate(blueprint, blueprintFilePath, journalFilePath) {
    CorePromotionService.transitionTo(blueprint, 'ROLLING_BACK_ACTIVATION', blueprintFilePath);

    if (!fs.existsSync(journalFilePath)) {
      console.warn(`[CorePromotionPublisher] No se encontró el journal de activación en ${journalFilePath}. Rollback incompleto.`);
      CorePromotionService.transitionTo(blueprint, 'PUBLISHED_INACTIVE', blueprintFilePath);
      return;
    }

    const journal = PromotionBlueprintBuilder.loadJournal(journalFilePath);
    journal.status = 'ROLLING_BACK';
    journal.updatedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

    // Reversión de pasos en orden inverso
    const stepsToRevert = [...journal.steps].reverse();

    for (const step of stepsToRevert) {
      if (step.status === 'COMPLETED' || step.status === 'IN_PROGRESS') {
        step.status = 'PENDING';
        for (const artifact of step.artifacts) {
          try {
            if (artifact.rollbackAction === 'DELETE_IF_HASH_MATCHES') {
              if (fs.existsSync(artifact.path)) {
                fs.removeSync(artifact.path);
                console.log(`[CorePromotionPublisher Rollback] Eliminado artefacto: ${artifact.path}`);
              }
            } else if (artifact.rollbackAction === 'RENAME_BACK' && artifact.backupPath) {
              if (fs.existsSync(artifact.backupPath)) {
                if (fs.existsSync(artifact.path)) {
                  fs.removeSync(artifact.path);
                }
                fs.moveSync(artifact.backupPath, artifact.path);
                console.log(`[CorePromotionPublisher Rollback] Restaurada carpeta original desde backup: ${artifact.path}`);
              }
            } else if (artifact.rollbackAction === 'RESTORE_BACKUP_IF_HASH_MATCHES' && artifact.backupPath) {
              if (fs.existsSync(artifact.backupPath)) {
                // Si es el registro
                if (artifact.path === REGISTRO_PATH.replace(/\\/g, '/')) {
                  const registro = fs.readJsonSync(REGISTRO_PATH);
                  if (artifact.originalEntryData) {
                    registro.plantillas[blueprint.targetCoreKey] = artifact.originalEntryData;
                  } else {
                    delete registro.plantillas[blueprint.targetCoreKey];
                  }
                  PromotionBlueprintBuilder.safeWriteJson(REGISTRO_PATH, registro);
                } else {
                  // Si es un package.json
                  const originalPkg = fs.readJsonSync(artifact.backupPath);
                  PromotionBlueprintBuilder.safeWriteJson(artifact.path, originalPkg);
                }
                console.log(`[CorePromotionPublisher Rollback] Restaurado archivo original: ${artifact.path}`);
              }
            }
          } catch (artErr) {
            console.error(`[CorePromotionPublisher Rollback] Error revirtiendo artefacto ${artifact.path}:`, artErr.message);
          }
        }
        step.status = 'ROLLED_BACK';
        PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);
      }
    }

    journal.status = 'ROLLED_BACK';
    journal.updatedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

    // Mover de vuelta a PUBLISHED_INACTIVE tras rollback de activación exitoso
    CorePromotionService.transitionTo(blueprint, 'PUBLISHED_INACTIVE', blueprintFilePath);
    console.log(`[CorePromotionPublisher] Rollback de activación para '${blueprint.targetCoreKey}' finalizado.`);
  }
}
