import path from 'path';
import fs from 'fs-extra';
import pc from 'picocolors';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import crypto from 'crypto';
import { getWorkspaceRoot, getTemplatesDir, getRegistroPath } from './config.js';
import { logger } from './logger.js';
import * as Diff from 'diff';

// Argumentos CLI
const isParallel = process.argv.includes('--parallel');
const autoAccept = process.argv.includes('--yes') || process.argv.includes('-y');

// Expresión regular para ignorar archivos del cliente al comparar/copiar
const EXCLUDED_PATHS = [
  '.env.local',
  '.firebaserc',
  'src/config/firebaseConfig.js',
  'src/config/niche.json',
  'index.html',
  'public',
  'package-lock.json',
  'node_modules',
  '.git',
  '.vite',
  'dist',
  'playwright-report',
  'test-results',
  '.prototipe.json'
];

/**
 * Retorna el MD5 hash de un archivo para comparaciones rápidas
 */
function getFileHash(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (err) {
    return null;
  }
}

/**
 * Escanea de forma recursiva un directorio y retorna la lista de archivos relativos
 */
function getFilesRecursive(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    // Verificar si la ruta o sus ancestros están excluidos
    const isExcluded = EXCLUDED_PATHS.some(excluded => {
      return relativePath === excluded || relativePath.startsWith(excluded + '/');
    }) || relativePath.startsWith('Documentacion ') || relativePath.split('/').some(part => part.startsWith('Documentacion '));

    if (isExcluded) return;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getFilesRecursive(fullPath, baseDir));
    } else {
      results.push(relativePath);
    }
  });
  return results;
}

// Pool de concurrencia de promesas para limitar ejecuciones paralelas
async function runWithPool(concurrencyLimit, array, fn) {
  const executing = new Set();
  const results = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= concurrencyLimit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

/**
 * Función principal
 */
async function main() {
  logger.info('🚀 Iniciando Sincronizador de Clientes (Downstream Patching)...');
  if (isParallel) logger.info('⚡ Modo Paralelo Activado (Pool de concurrencia: 4)');
  if (autoAccept) logger.info('🤖 Auto-Aceptar (Omitiendo prompts interactivos)');

  const workspaceRoot = getWorkspaceRoot();
  if (!fs.existsSync(workspaceRoot)) {
    logger.error(`El directorio de instancias no existe: ${workspaceRoot}`);
    process.exit(1);
  }

  // 1. Escanear clientes en subcarpetas por core
  const clientDirs = [];
  try {
    const coreDirs = fs.readdirSync(workspaceRoot).filter(file => {
      const fullPath = path.join(workspaceRoot, file);
      return fs.statSync(fullPath).isDirectory() && file !== 'Documentacion PROTOTIPE';
    });

    for (const coreDir of coreDirs) {
      const corePath = path.join(workspaceRoot, coreDir);
      const subDirs = fs.readdirSync(corePath).filter(file => {
        const fullPath = path.join(corePath, file);
        return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, 'package.json'));
      });
      for (const subDir of subDirs) {
        clientDirs.push(path.join(coreDir, subDir).replace(/\\/g, '/'));
      }
    }
  } catch (err) {
    logger.error(`Error al escanear directorios de clientes: ${err.message}`);
  }

  if (clientDirs.length === 0) {
    logger.warn('⚠️ No se encontraron instancias de clientes en el directorio de trabajo.');
    process.exit(0);
  }

  const clients = [];

  // 2. Cargar o curar metadatos .prototipe.json
  for (const dirName of clientDirs) {
    const clientPath = path.join(workspaceRoot, dirName);
    const metaPath = path.join(clientPath, '.prototipe.json');
    let meta = {};

    if (fs.existsSync(metaPath)) {
      try {
        meta = fs.readJsonSync(metaPath);
      } catch (err) {
        logger.warn(`Error al leer .prototipe.json en ${dirName}: ${err.message}`);
      }
    }

    // Curar metadatos faltantes
    if (!meta.template) {
      logger.info(`🔍 Detectada instancia sin metadatos: ${pc.cyan(dirName)}`);
      
      // Intentar inferir template
      let inferredTemplate = 'ventas';
      if (fs.existsSync(path.join(clientPath, 'src/pages/admin/AdminSales.jsx'))) {
        inferredTemplate = 'ventas';
      } else {
        // Preguntar al usuario
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'template',
            message: `¿Cuál es el template de origen para la instancia ${dirName}?`,
            choices: ['ventas', 'servicios', 'agendamiento', 'gastronomia']
          }
        ]);
        inferredTemplate = answers.template;
      }

      const baseName = path.basename(dirName);
      meta = {
        clientId: baseName.replace(/^app-/, ''),
        projectName: baseName,
        template: inferredTemplate,
        coreType: dirName.split('/')[0] || 'seed',
        niche: 'general_custom',
        version: '1.0.0',
        createdAt: new Date().toISOString()
      };

      try {
        fs.writeJsonSync(metaPath, meta, { spaces: 2 });
        logger.success(`✅ Metadatos auto-curados y guardados para: ${dirName}`);
      } catch (err) {
        logger.warn(`No se pudieron guardar los metadatos en ${dirName}: ${err.message}`);
      }
    }

    clients.push({
      dirName,
      path: clientPath,
      meta
    });
  }

  // 3. Menú de selección de cliente
  const choices = clients.map(c => ({
    name: `${c.meta.projectName} [ID: ${c.meta.clientId}] (Template: ${c.meta.template} v${c.meta.version})`,
    value: c
  }));

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedClients',
      message: 'Selecciona las instancias de clientes que deseas actualizar:',
      choices,
      validate: (input) => input.length > 0 ? true : 'Debes seleccionar al menos un cliente.'
    }
  ]);

  const selected = answers.selectedClients;

  // 4. Comparar archivos en paralelo (comparación ligera de hashes MD5)
  logger.info(`🔍 Analizando diferencias para ${selected.length} clientes...`);
  const clientsWithChanges = [];

  for (const client of selected) {
    const templatesDir = getTemplatesDir();
    const templatePath = path.join(templatesDir, `template-${client.meta.template}`);

    if (!fs.existsSync(templatePath)) {
      logger.error(`El template correspondiente no existe: ${templatePath}. Omitiendo cliente ${client.meta.projectName}.`);
      continue;
    }

    let templateVersion = '1.0.0';
    try {
      const templatePkg = fs.readJsonSync(path.join(templatePath, 'package.json'));
      templateVersion = templatePkg.version || '1.0.0';
    } catch (_) {}

    const templateFiles = getFilesRecursive(templatePath);
    const changes = [];

    templateFiles.forEach(file => {
      const templateFilePath = path.join(templatePath, file);
      const clientFilePath = path.join(client.path, file);

      if (!fs.existsSync(clientFilePath)) {
        changes.push({ file, type: 'NUEVO' });
      } else {
        const hashTemplate = getFileHash(templateFilePath);
        const hashClient = getFileHash(clientFilePath);
        if (hashTemplate !== hashClient) {
          changes.push({ file, type: 'MODIFICADO' });
        }
      }
    });

    if (changes.length > 0) {
      clientsWithChanges.push({
        client,
        templatePath,
        templateVersion,
        changes
      });
    }
  }

  if (clientsWithChanges.length === 0) {
    logger.success(`✨ Todas las instancias seleccionadas están al día con sus plantillas core.`);
    process.exit(0);
  }

  // Mostrar resumen de cambios detectados
  console.log('\n' + pc.cyan('─────────────────────────────────────────────────────────────────────────────'));
  logger.info(`Resumen de actualizaciones detectadas:`);
  clientsWithChanges.forEach(({ client, changes }) => {
    console.log(`\n📦 ${pc.green(client.meta.projectName)} [ID: ${client.meta.clientId}] (${changes.length} cambios):`);
    changes.forEach(c => {
      const color = c.type === 'NUEVO' ? pc.green : pc.yellow;
      console.log(`  ${color(`[${c.type}]`)} ${c.file}`);
    });
  });
  console.log('\n' + pc.cyan('─────────────────────────────────────────────────────────────────────────────'));

  // Confirmación global
  let shouldProceed = autoAccept;
  if (!shouldProceed) {
    const { confirmAll } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmAll',
        message: isParallel
          ? `¿Deseas aplicar las actualizaciones en PARALELO para los ${clientsWithChanges.length} clientes?`
          : `¿Deseas proceder con la actualización de los ${clientsWithChanges.length} clientes secuencialmente?`,
        default: true
      }
    ]);
    shouldProceed = confirmAll;
  }

  if (!shouldProceed) {
    logger.info('Operación cancelada por el usuario.');
    process.exit(0);
  }

  // 5. Aplicar actualizaciones
  if (isParallel) {
    logger.info(`⚡ Iniciando sincronización paralela (Pool de concurrencia: 4)...`);
    const results = await runWithPool(4, clientsWithChanges, async (clientData) => {
      return syncClientInstance(clientData, true);
    });

    const successCount = results.filter(Boolean).length;
    console.log('\n' + pc.cyan('─────────────────────────────────────────────────────────────────────────────'));
    if (successCount === clientsWithChanges.length) {
      logger.success(`🎉 Sincronización masiva paralela completada con éxito (${successCount}/${clientsWithChanges.length} clientes actualizados).`);
    } else {
      logger.warn(`⚠️ Sincronización paralela completada con algunas advertencias (${successCount}/${clientsWithChanges.length} aprobados).`);
    }
  } else {
    // Sincronización secuencial estándar
    logger.info(`⏳ Iniciando sincronización secuencial...`);
    for (const clientData of clientsWithChanges) {
      console.log('\n' + pc.cyan(`─────────────────────────────────────────────────────────────────────────────`));
      await syncClientInstance(clientData, false);
    }
    logger.success(' Sincronización secuencial de clientes completada.');
  }
}

/**
 * Sincroniza una instancia de cliente individual
 */
async function syncClientInstance(clientData, isParallelMode) {
  const { client, templatePath, templateVersion, changes } = clientData;
  const clientId = client.meta.clientId;
  const prefix = isParallelMode ? `[${clientId}] ` : '';

  const logBuffer = [];
  const logInfo = (msg) => {
    if (isParallelMode) logBuffer.push(pc.cyan(`${prefix}${msg}`));
    else logger.info(msg);
  };
  const logSuccess = (msg) => {
    if (isParallelMode) logBuffer.push(pc.green(`${prefix}${msg}`));
    else logger.success(msg);
  };
  const logWarn = (msg) => {
    if (isParallelMode) logBuffer.push(pc.yellow(`${prefix}${msg}`));
    else logger.warn(msg);
  };
  const logError = (msg) => {
    if (isParallelMode) logBuffer.push(pc.red(`${prefix}${msg}`));
    else logger.error(msg);
  };
  const flushLogs = () => {
    if (isParallelMode && logBuffer.length > 0) {
      console.log(logBuffer.join('\n'));
    }
  };

  logInfo(`Versión del cliente: v${client.meta.version} | Versión del template: v${templateVersion}`);
  logInfo(`Aplicando ${changes.length} cambios...`);

  // 1. Crear backup temporal
  const backupDir = path.join(client.path, '.temp_backup_sync');
  try {
    fs.ensureDirSync(backupDir);
    changes.forEach(c => {
      const clientFilePath = path.join(client.path, c.file);
      if (fs.existsSync(clientFilePath)) {
        const backupFilePath = path.join(backupDir, c.file);
        fs.ensureDirSync(path.dirname(backupFilePath));
        fs.copySync(clientFilePath, backupFilePath);
      }
    });
    logSuccess('Copia de seguridad temporal creada.');
  } catch (err) {
    logError(`Fallo al crear backup: ${err.message}. Abortando.`);
    fs.removeSync(backupDir);
    flushLogs();
    return false;
  }

  // 2. Copiar archivos de plantilla a cliente
  try {
    changes.forEach(c => {
      const templateFilePath = path.join(templatePath, c.file);
      const clientFilePath = path.join(client.path, c.file);
      fs.ensureDirSync(path.dirname(clientFilePath));
      fs.copySync(templateFilePath, clientFilePath, { overwrite: true });
    });
    logSuccess('Archivos copiados desde la plantilla core.');
  } catch (err) {
    logError(`Fallo al copiar archivos: ${err.message}. Iniciando rollback...`);
    rollbackBackupLocal(client.path, backupDir, changes, logError, logSuccess);
    flushLogs();
    return false;
  }

  // 3. Validación de compilación (npm run build)
  logInfo(`Ejecutando validación de compilación (npm run build)...`);
  try {
    const execOptions = { cwd: client.path, shell: true };
    if (isParallelMode) {
      execOptions.stdio = 'pipe';
    } else {
      execOptions.stdio = 'inherit';
    }

    execSync('npm run build', execOptions);
    logSuccess('🎉 Compilación de integridad aprobada con éxito.');

    // Limpiar backup temporal
    fs.removeSync(backupDir);

    // Actualizar metadatos
    client.meta.version = templateVersion;
    fs.writeJsonSync(path.join(client.path, '.prototipe.json'), client.meta, { spaces: 2 });
    logSuccess(`✅ Versión actualizada a v${templateVersion} en metadatos.`);
    flushLogs();
    return true;
  } catch (err) {
    logError(`❌ La compilación falló tras actualizar los archivos.`);
    if (isParallelMode && err.stdout) {
      logError(`Detalle del error de build:\n${err.stdout.toString() || ''}\n${err.stderr?.toString() || ''}`);
    }
    logWarn('Iniciando rollback seguro de los archivos del cliente...');
    rollbackBackupLocal(client.path, backupDir, changes, logError, logSuccess);
    flushLogs();
    return false;
  }
}

function rollbackBackupLocal(clientPath, backupDir, changes, logError, logSuccess) {
  try {
    changes.forEach(c => {
      const backupFilePath = path.join(backupDir, c.file);
      const clientFilePath = path.join(clientPath, c.file);

      if (fs.existsSync(backupFilePath)) {
        fs.copySync(backupFilePath, clientFilePath, { overwrite: true });
      } else {
        fs.removeSync(clientFilePath);
      }
    });
    fs.removeSync(backupDir);
    logSuccess('🔄 Rollback completado. La instancia del cliente ha sido restaurada a su estado original.');
  } catch (err) {
    logError(`Fallo crítico durante el rollback: ${err.message}. Los archivos pueden estar en un estado inconsistente.`);
  }
}

/**
 * Calcula y muestra los diffs de los archivos comparándolos línea por línea
 */
async function showDiffs(templatePath, clientPath, changes) {
  logger.info(`🔍 Mostrando simulación de diferencias (Dry Run) para el cliente...`);
  
  for (const c of changes) {
    const templateFilePath = path.join(templatePath, c.file);
    const clientFilePath = path.join(clientPath, c.file);
    
    console.log('\n' + pc.bold(pc.cyan(`--- Archivo: ${c.file} [${c.type}] ---`)));
    
    if (c.type === 'NUEVO') {
      try {
        const content = fs.readFileSync(templateFilePath, 'utf8');
        const lines = content.split('\n');
        lines.forEach(line => {
          console.log(pc.green(`+ ${line}`));
        });
      } catch (err) {
        console.log(pc.red(`Error al leer archivo nuevo: ${err.message}`));
      }
    } else if (c.type === 'MODIFICADO') {
      try {
        const clientContent = fs.readFileSync(clientFilePath, 'utf8');
        const templateContent = fs.readFileSync(templateFilePath, 'utf8');
        
        const diffResult = Diff.diffLines(clientContent, templateContent);
        
        diffResult.forEach(part => {
          const color = part.added ? pc.green : part.removed ? pc.red : pc.gray;
          const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
          
          const lines = part.value.split('\n');
          
          if (!part.added && !part.removed && lines.length > 8) {
            console.log(pc.gray(`  ... (${lines.length - 2} líneas sin cambios omitidas por legibilidad) ...`));
            if (lines[0]) console.log(pc.gray(`  ${lines[0]}`));
            if (lines[lines.length - 1]) console.log(pc.gray(`  ${lines[lines.length - 1]}`));
          } else {
            lines.forEach(line => {
              if (line || part.added || part.removed) {
                console.log(color(`${prefix}${line}`));
              }
            });
          }
        });
      } catch (err) {
        console.log(pc.red(`Error al comparar archivo: ${err.message}`));
      }
    }
  }
  console.log('\n' + pc.cyan('─────────────────────────────────────────────────────────────────────────────'));
}

// Ejecutar
main().catch(err => {
  logger.error(`Fallo en el proceso principal: ${err.message}`);
  process.exit(1);
});
