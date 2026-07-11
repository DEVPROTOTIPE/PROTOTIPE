import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { FeatureRegistry } from './FeatureRegistry.js';
import { PackageMerger } from './PackageMerger.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLI_ROOT = path.join(__dirname, '..');
const INSTANCES_DIR = path.join(CLI_ROOT, '..', 'Instancias Clientes');
const SEED_DIR = path.join(CLI_ROOT, 'templates', 'template-core-seed');
const BACKUPS_DIR = path.join(CLI_ROOT, 'scratch', 'backups');

export class VersionManager {
  /**
   * Resuelve la ruta física de la carpeta de un cliente.
   */
  static getClientPath(clientId) {
    // Buscar en Instancias Clientes tanto con nombre exacto como en minúsculas
    // o bajo carpetas de seed/
    const directPath = path.join(INSTANCES_DIR, clientId);
    if (fs.existsSync(directPath)) return directPath;
    
    const seedPath = path.join(INSTANCES_DIR, 'seed', clientId);
    if (fs.existsSync(seedPath)) return seedPath;

    // Buscar recursivo simple de primer nivel
    const subdirs = fs.readdirSync(INSTANCES_DIR);
    for (const sub of subdirs) {
      const fullSub = path.join(INSTANCES_DIR, sub);
      if (fs.statSync(fullSub).isDirectory()) {
        const target = path.join(fullSub, clientId);
        if (fs.existsSync(target)) return target;
      }
    }
    return directPath;
  }

  /**
   * Resuelve la ruta física de la plantilla del Core (App Ventas, App Servicios, etc.)
   * asociada al cliente. Si no se puede determinar, hace fallback a SEED_DIR.
   */
  static getCorePathForClient(clientPath) {
    let coreId = 'ventas'; // Fallback por defecto
    const metaPath = path.join(clientPath, '.prototipe.json');
    if (fs.existsSync(metaPath)) {
      try {
        const meta = fs.readJsonSync(metaPath);
        coreId = meta.templateId || meta.coreClave || meta.coreId || meta.template || meta.coreType || coreId;
      } catch (err) {
        console.error('[VersionManager] Error al leer metadatos del cliente para resolver plantilla core:', err);
      }
    }

    const plantillasCoreDir = path.join(CLI_ROOT, '..', 'Plantillas Core');
    if (fs.existsSync(plantillasCoreDir)) {
      try {
        const folders = fs.readdirSync(plantillasCoreDir);
        const targetLower = coreId.toLowerCase().trim();
        
        // 1. Buscar coincidencia exacta o normalizada (ej: 'App Ventas' -> targetLower 'ventas')
        for (const folder of folders) {
          const folderLower = folder.toLowerCase();
          const cleanFolder = folderLower.replace(/^app\s+/, '').trim();
          if (cleanFolder === targetLower || folderLower === targetLower) {
            return path.join(plantillasCoreDir, folder);
          }
        }

        // 2. Coincidencia difusa (ej: que contenga la palabra coreId)
        for (const folder of folders) {
          if (folder.toLowerCase().includes(targetLower)) {
            return path.join(plantillasCoreDir, folder);
          }
        }
      } catch (err) {
        console.error('[VersionManager] Error al recorrer el directorio de Plantillas Core:', err);
      }
    }
    
    // Mapear los nombres de core a sus respectivas carpetas físicas en el monorepo (Fallback manual)
    const knownCores = {
      'ventas': 'App Ventas',
      'servicios': 'App Servicios',
      'agendamiento': 'App Agendamiento',
      'gastronomia': 'App Gastronomia'
    };
    
    const folderName = knownCores[coreId.toLowerCase()] || 'App Ventas';
    const candidatePath = path.join(CLI_ROOT, '..', 'Plantillas Core', folderName);
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
    
    return SEED_DIR;
  }

  /**
   * Detecta desviaciones y actualizaciones disponibles en un cliente.
   */
  static async detectDrift(clientId) {
    const clientPath = this.getClientPath(clientId);
    const lockPath = path.join(clientPath, 'prototipe.lock.json');
    
    if (!(await fs.pathExists(lockPath))) {
      return {
        status: 'PENDING_PROVISIONING',
        drifts: [],
        message: 'La instancia no posee un manifiesto prototipe.lock.json o no está aprovisionada.'
      };
    }

    const lock = await fs.readJson(lockPath);
    const drifts = [];

    // 1. Validar CORE_DRIFT (versión de Core en package.json de la plantilla real vs lock)
    const coreReferenceDir = this.getCorePathForClient(clientPath);
    const seedPackagePath = path.join(coreReferenceDir, 'package.json');
    let coreTargetVersion = '1.0.6';
    if (await fs.pathExists(seedPackagePath)) {
      const seedPkg = await fs.readJson(seedPackagePath);
      coreTargetVersion = seedPkg.version || coreTargetVersion;
    }

    let currentCoreVersion = lock.coreVersion || lock.appVersion || '1.0.0';
    const clientPkgPath = path.join(clientPath, 'package.json');
    if (await fs.pathExists(clientPkgPath)) {
      try {
        const clientPkg = await fs.readJson(clientPkgPath);
        if (clientPkg.version) {
          currentCoreVersion = clientPkg.version;
          // Actualizar el lockfile en caliente para que refleje la versión real de la app física
          if (lock.coreVersion !== currentCoreVersion) {
            lock.coreVersion = currentCoreVersion;
            await fs.writeJson(lockPath, lock, { spaces: 2 });
          }
        }
      } catch (err) {
        console.error('[VersionManager] Error al sincronizar versión de lockfile con package.json:', err);
      }
    }

    if (currentCoreVersion !== coreTargetVersion) {
      drifts.push({
        type: 'CORE_DRIFT',
        severity: 'high',
        message: `Actualización de Core disponible: ${currentCoreVersion} ➔ ${coreTargetVersion}`,
        current: currentCoreVersion,
        target: coreTargetVersion
      });
    }

    // 2. Validar FEATURE_UPDATE_AVAILABLE
    const registryFeatures = await FeatureRegistry.getAll();
    const installedFeatures = lock.featuresInstalled || {};

    for (const [featId, featInfo] of Object.entries(installedFeatures)) {
      const regFeat = registryFeatures.find(f => f.id === featId);
      if (regFeat) {
        const currentVersion = featInfo.version || '1.0.0';
        const targetVersion = regFeat.version || '1.0.0';
        if (currentVersion !== targetVersion) {
          drifts.push({
            type: 'FEATURE_UPDATE_AVAILABLE',
            severity: 'medium',
            message: `Actualización del módulo "${regFeat.displayName || featId}" disponible: ${currentVersion} ➔ ${targetVersion}`,
            featureId: featId,
            current: currentVersion,
            target: targetVersion
          });
        }
      }
    }

    // 3. Validar CONFIG_DRIFT (comparar variables .env.local física vs Firestore/lock si aplica)
    const envPath = path.join(clientPath, '.env.local');
    if (await fs.pathExists(envPath)) {
      const envContent = await fs.readFile(envPath, 'utf8');
      // Buscar si el lock difiere de la configuración física
      if (lock.brandingConfig && lock.brandingConfig.primaryColor) {
        const primaryHex = lock.brandingConfig.primaryColor;
        if (!envContent.includes(primaryHex) && !envContent.toLowerCase().includes(primaryHex.toLowerCase())) {
          drifts.push({
            type: 'CONFIG_DRIFT',
            severity: 'low',
            message: 'Desviación en variables de branding HSL locales contra la base de datos.',
            detail: 'Frecuencias de color HSL locales no coinciden con las registradas'
          });
        }
      }
    }

    let status = 'UP_TO_DATE';
    if (drifts.some(d => d.type === 'CORE_DRIFT')) {
      status = 'CORE_DRIFT';
    } else if (drifts.some(d => d.type === 'FEATURE_UPDATE_AVAILABLE')) {
      status = 'FEATURE_UPDATE_AVAILABLE';
    } else if (drifts.some(d => d.type === 'CONFIG_DRIFT')) {
      status = 'CONFIG_DRIFT';
    }

    return {
      status,
      currentCoreVersion,
      targetCoreVersion: coreTargetVersion,
      drifts,
      lastUpdate: lock.lastUpdate || null
    };
  }

  /**
   * Determina si el contenido de dos archivos difiere.
   */
  static async filesDiffer(fileA, fileB) {
    try {
      const contentA = await fs.readFile(fileA, 'utf8');
      const contentB = await fs.readFile(fileB, 'utf8');
      return contentA !== contentB;
    } catch {
      return true;
    }
  }

  /**
   * Genera el Update Blueprint Plan con el listado preciso de cambios de archivos.
   */
  static async buildUpdatePlan(clientId, operator = 'admin') {
    const clientPath = this.getClientPath(clientId);
    const driftInfo = await this.detectDrift(clientId);
    const updateId = `up_${Date.now()}`;

    if (driftInfo.status === 'PENDING_PROVISIONING') {
      throw new Error(`El cliente ${clientId} no está aprovisionado. No se puede generar update plan.`);
    }

    const fileChanges = [];
    const npmChanges = {};

    // Si hay CORE_DRIFT, identificar archivos del core que deben actualizarse
    if (driftInfo.drifts.some(d => d.type === 'CORE_DRIFT')) {
      const coreReferenceDir = this.getCorePathForClient(clientPath);
      // Archivos del core base (index.html, tailwind.config, configs comunes, etc.)
      const coreFiles = [
        'tailwind.config.js',
        'postcss.config.js',
        'src/config/brand_theme.js',
        'src/components/common/AlertConfirmContext.jsx',
        'src/components/ui/CustomSelect.jsx'
      ];

      for (const relFile of coreFiles) {
        const seedFile = path.join(coreReferenceDir, relFile);
        const clientFile = path.join(clientPath, relFile);
        
        if (await fs.pathExists(seedFile)) {
          let action = 'MODIFY';
          if (!(await fs.pathExists(clientFile))) {
            action = 'NEW';
            fileChanges.push({
              file: relFile,
              action,
              source: 'core-seed',
              description: `Alinear archivo de configuración central del core`
            });
          } else {
            // Solo proponer actualización si hay diferencias reales en el contenido físico
            const differ = await this.filesDiffer(seedFile, clientFile);
            if (differ) {
              fileChanges.push({
                file: relFile,
                action,
                source: 'core-seed',
                description: `Alinear archivo de configuración central del core`
              });
            }
          }
        }
      }
    }

    // Si hay FEATURE_UPDATE_AVAILABLE, mapear archivos de esas features
    for (const drift of driftInfo.drifts) {
      if (drift.type === 'FEATURE_UPDATE_AVAILABLE') {
        const featId = drift.featureId;
        const physicalPath = await FeatureRegistry.resolvePhysicalPath(featId);
        
        if (physicalPath && await fs.pathExists(physicalPath)) {
          // Leer recursivamente todos los archivos de la feature física
          const featureFiles = await this.listRelativeFiles(physicalPath);
          for (const relFile of featureFiles) {
            const clientTargetFile = path.join(clientPath, 'src', 'features', featId, relFile);
            let action = 'MODIFY';
            if (!(await fs.pathExists(clientTargetFile))) {
              action = 'NEW';
              fileChanges.push({
                file: `src/features/${featId}/${relFile}`,
                action,
                source: `feature-${featId}`,
                description: `Actualizar código del módulo ${featId} a versión ${drift.target}`
              });
            } else {
              const sourceFile = path.join(physicalPath, relFile);
              const differ = await this.filesDiffer(sourceFile, clientTargetFile);
              if (differ) {
                fileChanges.push({
                  file: `src/features/${featId}/${relFile}`,
                  action,
                  source: `feature-${featId}`,
                  description: `Actualizar código del módulo ${featId} a versión ${drift.target}`
                });
              }
            }
          }

          // Fusiones de dependencias NPM declaradas en la feature
          const regFeat = await FeatureRegistry.resolve(featId);
          if (regFeat && regFeat.npmDependencies) {
            Object.assign(npmChanges, regFeat.npmDependencies);
          }
        }
      }
    }

    return {
      updateId,
      clientId,
      operator,
      coreVersion: driftInfo.targetCoreVersion,
      driftsDetected: driftInfo.drifts,
      fileChanges,
      npmChanges,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Aplica un Blueprint Plan de actualización de forma segura y controlada con SSE.
   */
  static async applyUpdatePlan(clientId, plan, operator = 'admin', logCallback = () => {}) {
    const clientPath = this.getClientPath(clientId);
    const lockPath = path.join(clientPath, 'prototipe.lock.json');
    const updateId = plan.updateId;

    logCallback(`[Info] Iniciando pipeline de actualización para el cliente "${clientId.toUpperCase()}" (ID de Actualización: ${updateId}).`);

    // 1. Crear backup físico de resguardo versionado antes de modificar archivos
    const clientBackupDir = path.join(BACKUPS_DIR, clientId, updateId);
    await fs.ensureDir(clientBackupDir);
    logCallback(`[Info] Creando punto de restauración físico en: scratch/backups/${clientId}/${updateId}`);

    for (const change of plan.fileChanges) {
      const clientFilePath = path.join(clientPath, change.file);
      if (await fs.pathExists(clientFilePath)) {
        const backupFilePath = path.join(clientBackupDir, change.file);
        await fs.ensureDir(path.dirname(backupFilePath));
        await fs.copy(clientFilePath, backupFilePath);
      }
    }
    // Respaldar lockfile anterior
    if (await fs.pathExists(lockPath)) {
      await fs.copy(lockPath, path.join(clientBackupDir, 'prototipe.lock.json'));
    }
    logCallback(`[Éxito] Punto de restauración físico completado con éxito.`);

    // 2. Inyectar archivos del core y features
    logCallback(`[Info] Inyectando archivos actualizados desde las plantillas base y el registro...`);
    try {
      const coreReferenceDir = this.getCorePathForClient(clientPath);
      for (const change of plan.fileChanges) {
        let sourcePath = '';
        if (change.source === 'core-seed') {
          sourcePath = path.join(coreReferenceDir, change.file);
        } else if (change.source.startsWith('feature-')) {
          const featId = change.source.replace('feature-', '');
          const physicalPath = await FeatureRegistry.resolvePhysicalPath(featId);
          // La ruta relativa dentro del features/
          const relInFeat = change.file.substring(`src/features/${featId}/`.length);
          sourcePath = path.join(physicalPath, relInFeat);
        }

        if (sourcePath && await fs.pathExists(sourcePath)) {
          const clientTargetFile = path.join(clientPath, change.file);
          await fs.ensureDir(path.dirname(clientTargetFile));
          await fs.copy(sourcePath, clientTargetFile);
          logCallback(`  ➔ Sincronizado: ${change.file} [${change.action}]`);
        }
      }

      // 3. Fusionar package.json si hay dependencias NPM nuevas
      if (Object.keys(plan.npmChanges).length > 0) {
        logCallback(`[Info] Fusionando dependencias de librerías NPM en el package.json de la instancia...`);
        const clientPkgPath = path.join(clientPath, 'package.json');
        if (await fs.pathExists(clientPkgPath)) {
          const clientPkg = await fs.readJson(clientPkgPath);
          clientPkg.dependencies = clientPkg.dependencies || {};
          
          for (const [dep, version] of Object.entries(plan.npmChanges)) {
            clientPkg.dependencies[dep] = version;
            logCallback(`  ➔ Añadida dependencia: ${dep}@${version}`);
          }
          await fs.writeJson(clientPkgPath, clientPkg, { spaces: 2 });
          
          // Ejecutar npm install
          logCallback(`[Info] Ejecutando "npm install" en el cliente para resolver dependencias...`);
          await execAsync('npm install', { cwd: clientPath });
          logCallback(`[Éxito] Dependencias instaladas.`);
        }
      }

      // 4. Actualizar prototipe.lock.json de la instancia
      logCallback(`[Info] Sincronizando metadatos en prototipe.lock.json...`);
      if (await fs.pathExists(lockPath)) {
        const lock = await fs.readJson(lockPath);
        lock.coreVersion = plan.coreVersion;
        lock.schemaVersion = lock.schemaVersion || '1.0.0';
        lock.lastUpdate = {
          date: new Date().toISOString(),
          operator,
          updateId
        };
        
        // Actualizar versiones de features instaladas
        lock.featuresInstalled = lock.featuresInstalled || {};
        for (const drift of plan.driftsDetected) {
          if (drift.type === 'FEATURE_UPDATE_AVAILABLE') {
            lock.featuresInstalled[drift.featureId] = {
              version: drift.target,
              installedAt: new Date().toISOString()
            };
          }
        }

        await fs.writeJson(lockPath, lock, { spaces: 2 });
        logCallback(`[Éxito] Lockfile actualizado.`);
      }

      // 5. Correr compilación de prueba (Post-flight check)
      logCallback(`[Info] Ejecutando compilación de prueba (npm run build) de la instancia para certificar compatibilidad...`);
      try {
        const { stdout } = await execAsync('npm run build', { cwd: clientPath });
        logCallback(`[Éxito] Compilación de prueba completada con éxito. La instancia no presenta regresiones.`);
        return {
          status: 'success',
          updateId,
          message: 'Actualización aplicada y verificada con éxito.'
        };
      } catch (buildErr) {
        logCallback(`[Fallo] La compilación falló tras la inyección del código: ${buildErr.message}`);
        // Lanzar rollback automático
        await this.runRollback(clientId, updateId, logCallback);
        return {
          status: 'rolled_back',
          updateId,
          message: 'La compilación de prueba falló. Los cambios fueron revertidos automáticamente al punto de restauración.'
        };
      }

    } catch (err) {
      logCallback(`[Fallo] Excepción crítica durante el pipeline: ${err.message}`);
      await this.runRollback(clientId, updateId, logCallback);
      return {
        status: 'rolled_back',
        updateId,
        message: `Excepción crítica detectada. Se aplicó rollback automático. Detalle: ${err.message}`
      };
    }
  }

  /**
   * Ejecuta el rollback físico restaurando los archivos respaldados.
   */
  static async runRollback(clientId, updateId, logCallback = () => {}) {
    const clientPath = this.getClientPath(clientId);
    const backupDir = path.join(BACKUPS_DIR, clientId, updateId);

    logCallback(`[Advertencia] Iniciando rollback físico para restaurar el cliente a la versión de respaldo ${updateId}...`);

    if (!(await fs.pathExists(backupDir))) {
      logCallback(`[Fallo Crítico] No existe el directorio de restauración para ${updateId} en scratch/backups. Abortando.`);
      throw new Error(`Punto de restauración no encontrado: ${backupDir}`);
    }

    try {
      // Leer recursivamente todos los archivos respaldados
      const backupFiles = await this.listRelativeFiles(backupDir);
      for (const relFile of backupFiles) {
        const clientTargetFile = path.join(clientPath, relFile);
        const sourceBackupFile = path.join(backupDir, relFile);
        
        await fs.ensureDir(path.dirname(clientTargetFile));
        await fs.copy(sourceBackupFile, clientTargetFile);
        logCallback(`  ➔ Restaurado: ${relFile}`);
      }

      // Si había dependencias instaladas, forzar npm install tras revertir package.json
      const pkgBacked = path.join(backupDir, 'package.json');
      if (await fs.pathExists(pkgBacked)) {
        logCallback(`[Info] Re-ejecutando "npm install" tras restaurar el package.json original...`);
        await execAsync('npm install', { cwd: clientPath });
      }

      logCallback(`[Éxito] Rollback físico completado con éxito. Cliente restaurado al estado operacional anterior.`);
      return {
        status: 'success',
        message: 'Rollback aplicado con éxito.'
      };
    } catch (err) {
      logCallback(`[Fallo Crítico] Falló la restauración física: ${err.message}`);
      throw err;
    }
  }

  /**
   * Lista recursivamente todos los archivos de un directorio de forma relativa.
   */
  static async listRelativeFiles(dirPath, baseDir = dirPath) {
    let results = [];
    const list = await fs.readdir(dirPath);
    for (const file of list) {
      const fullPath = path.join(dirPath, file);
      const stat = await fs.stat(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(await this.listRelativeFiles(fullPath, baseDir));
      } else {
        results.push(path.relative(baseDir, fullPath));
      }
    }
    return results;
  }
}
export default VersionManager;
