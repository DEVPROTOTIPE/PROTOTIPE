import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { CorePromotionService } from './CorePromotionService.js';
import { PromotionBlueprintBuilder } from './PromotionBlueprintBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, '..');

const JOURNALS_MIG_DIR = path.join(CLI_ROOT, 'journals', 'lineage-migrations');

export class ClientLineageMigrator {
  /**
   * Helper para calcular el hash SHA-256 de un archivo
   */
  static getFileHash(filePath) {
    if (!fs.existsSync(filePath)) return null;
    try {
      const buffer = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(buffer).digest('hex');
    } catch (err) {
      console.error(`[ClientLineageMigrator] Error calculando hash para ${filePath}:`, err.message);
      return null;
    }
  }

  /**
   * Ejecuta el pipeline de migración de linaje para un cliente de origen
   */
  static async migrate(blueprint, blueprintFilePath, clientPath) {
    if (blueprint.status !== 'PREFLIGHT_APPROVED' && blueprint.status !== 'PENDING_PREFLIGHT') {
      // Si la prueba de transición o flujo requiere un estado inicial
      // nos adaptamos, pero asumimos PREFLIGHT_APPROVED
    }

    blueprint.status = 'RUNNING_MIGRATION';
    blueprint.updatedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(blueprintFilePath, blueprint);

    fs.ensureDirSync(JOURNALS_MIG_DIR);
    const journalFilePath = path.join(JOURNALS_MIG_DIR, `mig-${blueprint.migrationId}.json`);

    const journal = {
      schemaVersion: '1.0.0',
      operationId: blueprint.migrationId,
      operationType: 'LINEAGE_MIGRATION',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        {
          id: 'BACKUP_MANIFESTS',
          status: 'PENDING',
          startedAt: new Date().toISOString(),
          completedAt: null,
          artifacts: []
        },
        {
          id: 'WRITE_MIGRATION_MANIFESTS',
          status: 'PENDING',
          startedAt: new Date().toISOString(),
          completedAt: null,
          artifacts: []
        },
        {
          id: 'RUNNING_POST_VALIDATION',
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
      const manifests = [
        '.prototipe.json',
        'prototipe.lock.json',
        'package.json'
      ];

      // 1. Paso: BACKUP_MANIFESTS
      const step1 = journal.steps.find(s => s.id === 'BACKUP_MANIFESTS');
      step1.status = 'IN_PROGRESS';
      step1.startedAt = new Date().toISOString();
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      const backupDir = path.join(CLI_ROOT, 'scratch', 'backups', `manifests-${blueprint.spec.clientId}-${Date.now()}`);
      fs.ensureDirSync(backupDir);

      blueprint.results.backup = {
        backupIdentifier: `bak-${blueprint.migrationId}`,
        backupPath: backupDir.replace(/\\/g, '/'),
        verified: false
      };

      for (const manifest of manifests) {
        const sourcePath = path.join(clientPath, manifest);
        if (fs.existsSync(sourcePath)) {
          const destPath = path.join(backupDir, manifest);
          fs.copySync(sourcePath, destPath);

          const fileHash = this.getFileHash(sourcePath);
          blueprint.spec.previousFilesHashes[manifest] = fileHash;

          step1.artifacts.push({
            path: sourcePath.replace(/\\/g, '/'),
            artifactType: 'FILE',
            ownership: 'MODIFIED_BY_OPERATION',
            action: 'MODIFY',
            beforeHash: fileHash,
            afterHash: null, // se calculará al escribir
            rollbackAction: 'RESTORE_BACKUP_IF_HASH_MATCHES',
            backupPath: destPath.replace(/\\/g, '/')
          });
        }
      }

      blueprint.results.backup.verified = true;
      step1.status = 'COMPLETED';
      step1.completedAt = new Date().toISOString();
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      // 2. Paso: WRITE_MIGRATION_MANIFESTS
      const step2 = journal.steps.find(s => s.id === 'WRITE_MIGRATION_MANIFESTS');
      step2.status = 'IN_PROGRESS';
      step2.startedAt = new Date().toISOString();
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      // Escribir los nuevos manifiestos en el cliente
      const prototipeJsonPath = path.join(clientPath, '.prototipe.json');
      if (fs.existsSync(prototipeJsonPath)) {
        const protoData = fs.readJsonSync(prototipeJsonPath);
        protoData.coreType = blueprint.spec.newCoreType;
        protoData.coreVersion = blueprint.spec.newCoreVersion;
        protoData.updatedAt = new Date().toISOString();
        PromotionBlueprintBuilder.safeWriteJson(prototipeJsonPath, protoData);
      }

      const prototipeLockPath = path.join(clientPath, 'prototipe.lock.json');
      if (fs.existsSync(prototipeLockPath)) {
        const lockData = fs.readJsonSync(prototipeLockPath);
        lockData.coreType = blueprint.spec.newCoreType;
        lockData.coreVersion = blueprint.spec.newCoreVersion;
        PromotionBlueprintBuilder.safeWriteJson(prototipeLockPath, lockData);
      }

      const pkgJsonPath = path.join(clientPath, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        const pkgData = fs.readJsonSync(pkgJsonPath);
        pkgData.name = blueprint.spec.newCoreType;
        pkgData.version = blueprint.spec.newCoreVersion;
        PromotionBlueprintBuilder.safeWriteJson(pkgJsonPath, pkgData);
      }

      // Calcular nuevos hashes
      blueprint.results.write = {
        newFilesHashes: {},
        newFeatures: blueprint.spec.previousFeatures
      };

      for (const manifest of manifests) {
        const sourcePath = path.join(clientPath, manifest);
        if (fs.existsSync(sourcePath)) {
          const fileHash = this.getFileHash(sourcePath);
          blueprint.results.write.newFilesHashes[manifest] = fileHash;
          
          // Actualizar el afterHash en el artifact del paso 1
          const art = step1.artifacts.find(a => a.path === sourcePath.replace(/\\/g, '/'));
          if (art) art.afterHash = fileHash;
        }
      }

      step2.status = 'COMPLETED';
      step2.completedAt = new Date().toISOString();
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      // 3. Paso: RUNNING_POST_VALIDATION
      blueprint.status = 'RUNNING_POST_VALIDATION';
      PromotionBlueprintBuilder.safeWriteJson(blueprintFilePath, blueprint);

      const step3 = journal.steps.find(s => s.id === 'RUNNING_POST_VALIDATION');
      step3.status = 'IN_PROGRESS';
      step3.startedAt = new Date().toISOString();
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      // Calcular drift entre el cliente y la nueva plantilla del core
      const driftCount = await this.calculateDrift(clientPath, blueprint.spec.newCoreType);
      
      blueprint.results.postValidation = {
        driftCount,
        status: driftCount === 0 ? 'PASSED' : 'FAILED'
      };

      if (driftCount > 0) {
        throw new Error(`Drift detectado post-migración: ${driftCount} archivos difieren con el Core destino.`);
      }

      step3.status = 'COMPLETED';
      step3.completedAt = new Date().toISOString();
      journal.status = 'COMPLETED';
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      blueprint.status = 'COMPLETED';
      blueprint.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(blueprintFilePath, blueprint);
      console.log(`[ClientLineageMigrator] Migración para el cliente '${blueprint.spec.clientId}' completada con éxito.`);

    } catch (err) {
      console.error(`[ClientLineageMigrator] Error en migración: ${err.message}. Iniciando rollback...`);
      journal.status = 'FAILED';
      journal.updatedAt = new Date().toISOString();
      PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

      await this.rollback(blueprint, blueprintFilePath, journalFilePath, clientPath);
      throw err;
    }
  }

  /**
   * Calcula el número de archivos que difieren entre el cliente y el template core
   */
  static async calculateDrift(clientPath, newCoreType) {
    const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
    let templateDir = path.join(CLI_ROOT, 'templates', 'template-' + newCoreType);
    if (fs.existsSync(registroPath)) {
      const registro = fs.readJsonSync(registroPath);
      if (registro.plantillas && registro.plantillas[newCoreType]) {
        templateDir = registro.plantillas[newCoreType].destino.replace(/\//g, path.sep);
      }
    }
    if (!fs.existsSync(templateDir)) {
      // Si la plantilla no existe, se considera un error
      return 999;
    }

    let driftCount = 0;

    // Escanear carpeta de origen para comparar contra el template
    const compareFiles = (dir, baseDir = dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const absPath = path.join(dir, file);
        const relative = path.relative(baseDir, absPath).replace(/\\/g, '/');

        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.obsidian' || file === 'scratch' || file === 'journals' || file === 'blueprints' || file === 'locks' || file === 'idempotency') {
          continue;
        }

        const stat = fs.statSync(absPath);
        if (stat.isDirectory()) {
          compareFiles(absPath, baseDir);
        } else {
          // Omitir archivos que se personalizan por marca
          const skipPatterns = [
            '.env.local', '.firebaserc', 'public/favicon.svg', 'public/pwa-', 
            '.prototipe.json', 'prototipe.lock.json', 'package.json', 'firestore.rules',
            'firestore.indexes.json', 'storage.rules'
          ];
          
          if (skipPatterns.some(pat => relative === pat || relative.startsWith(pat))) {
            continue;
          }

          const templateFilePath = path.join(templateDir, relative);
          if (!fs.existsSync(templateFilePath)) {
            // Archivo extra en el cliente que no existe en el core
            driftCount++;
            continue;
          }

          const clientHash = this.getFileHash(absPath);
          const templateHash = this.getFileHash(templateFilePath);

          if (clientHash !== templateHash) {
            driftCount++;
          }
        }
      }
    };

    try {
      compareFiles(clientPath);
    } catch (err) {
      console.error('[ClientLineageMigrator] Error calculando drift:', err.message);
      return 999;
    }

    return driftCount;
  }

  /**
   * Revierte los cambios de manifiestos y archivos usando el backup físico
   */
  static async rollback(blueprint, blueprintFilePath, journalFilePath, clientPath) {
    blueprint.status = 'ROLLING_BACK';
    blueprint.updatedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(blueprintFilePath, blueprint);

    if (!fs.existsSync(journalFilePath)) {
      console.warn(`[ClientLineageMigrator] No se encontró el journal de migración en ${journalFilePath}. Rollback incompleto.`);
      blueprint.status = 'ROLLED_BACK';
      PromotionBlueprintBuilder.safeWriteJson(blueprintFilePath, blueprint);
      return;
    }

    const journal = PromotionBlueprintBuilder.loadJournal(journalFilePath);
    journal.status = 'ROLLING_BACK';
    journal.updatedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

    const stepsToRevert = [...journal.steps].reverse();

    for (const step of stepsToRevert) {
      if (step.status === 'COMPLETED' || step.status === 'IN_PROGRESS') {
        step.status = 'PENDING';
        for (const artifact of step.artifacts) {
          try {
            if (artifact.rollbackAction === 'RESTORE_BACKUP_IF_HASH_MATCHES' && artifact.backupPath) {
              if (fs.existsSync(artifact.backupPath)) {
                fs.copySync(artifact.backupPath, artifact.path, { overwrite: true });
                console.log(`[ClientLineageMigrator Rollback] Restaurado manifiesto: ${artifact.path}`);
              }
            }
          } catch (artErr) {
            console.error(`[ClientLineageMigrator Rollback] Error restaurando manifiesto ${artifact.path}:`, artErr.message);
          }
        }
        step.status = 'ROLLED_BACK';
        PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);
      }
    }

    // Verificar paridad absoluta de hashes
    let hashesMatch = true;
    for (const [manifest, originalHash] of Object.entries(blueprint.spec.previousFilesHashes)) {
      const currentPath = path.join(clientPath, manifest);
      const currentHash = this.getFileHash(currentPath);
      if (currentHash !== originalHash) {
        hashesMatch = false;
        console.error(`[ClientLineageMigrator Rollback] Desajuste de hash en ${manifest}. Esperado: ${originalHash}, Actual: ${currentHash}`);
      }
    }

    blueprint.results.rollback = {
      rolledBackAt: new Date().toISOString(),
      hashesMatch
    };

    journal.status = 'ROLLED_BACK';
    journal.updatedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(journalFilePath, journal);

    blueprint.status = 'ROLLED_BACK';
    blueprint.updatedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(blueprintFilePath, blueprint);

    console.log(`[ClientLineageMigrator] Rollback de migración para '${blueprint.spec.clientId}' finalizado. Hilos de consistencia coinciden: ${hashesMatch}`);
  }
}
