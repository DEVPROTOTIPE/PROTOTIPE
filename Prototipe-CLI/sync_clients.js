import path from 'path';
import fs from 'fs-extra';
import pc from 'picocolors';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import crypto from 'crypto';
import { getWorkspaceRoot, getTemplatesDir, getRegistroPath } from './config.js';
import { logger } from './logger.js';
import * as Diff from 'diff';

// Expresión regular para ignorar archivos del cliente al comparar/copiar
const EXCLUDED_PATHS = [
  '.env.local',
  '.firebaserc',
  'firebase.json',
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

/**
 * Función principal
 */
async function main() {
  logger.info('🚀 Iniciando Sincronizador de Clientes (Downstream Patching)...');

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

  for (const client of selected) {
    console.log('\n' + pc.cyan(`─────────────────────────────────────────────────────────────────────────────`));
    logger.info(`Analizando actualizaciones para: ${pc.green(client.meta.projectName)}`);

    const templatesDir = getTemplatesDir();
    const templatePath = path.join(templatesDir, `template-${client.meta.template}`);

    if (!fs.existsSync(templatePath)) {
      logger.error(`El template correspondiente no existe: ${templatePath}. Omitiendo cliente.`);
      continue;
    }

    // Leer versión del template desde package.json del template
    let templateVersion = '1.0.0';
    try {
      const templatePkg = fs.readJsonSync(path.join(templatePath, 'package.json'));
      templateVersion = templatePkg.version || '1.0.0';
    } catch (_) {}

    logger.info(`Versión del cliente: v${client.meta.version} | Versión del template: v${templateVersion}`);

    // 4. Comparar archivos
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

    if (changes.length === 0) {
      logger.success(`✨ La instancia ya está al día con la plantilla core.`);
      continue;
    }

    // Listar cambios detectados
    console.log(pc.yellow(`\nCambios detectados (excluyendo archivos personalizados de marca):`));
    changes.forEach(c => {
      const color = c.type === 'NUEVO' ? pc.green : pc.yellow;
      console.log(`  ${color(`[${c.type}]`)} ${c.file}`);
    });

    // 5. Confirmar sincronización
    let action = '';
    while (true) {
      const { choice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: `¿Qué deseas hacer con los cambios detectados en ${client.meta.projectName}?`,
          choices: [
            { name: `${pc.green('✅')} Aplicar Cambios (Sincronización Física)`, value: 'aplicar' },
            { name: `${pc.cyan('🔍')} Ver Diffs de Cambios (Simulación/Dry Run)`, value: 'diff' },
            { name: `${pc.red('❌')} Omitir Cliente / Siguiente`, value: 'omitir' }
          ]
        }
      ]);

      if (choice === 'omitir') {
        action = 'omitir';
        break;
      } else if (choice === 'aplicar') {
        action = 'aplicar';
        break;
      } else if (choice === 'diff') {
        await showDiffs(templatePath, client.path, changes);
      }
    }

    if (action === 'omitir') {
      logger.info('Sincronización omitida para este cliente.');
      continue;
    }

    // 6. Hacer copia de seguridad de los archivos antes de escribir (Rollback Seguro)
    const backupDir = path.join(client.path, '.temp_backup_sync');
    fs.ensureDirSync(backupDir);

    const stepBackup = logger.info('Creando copia de seguridad temporal...');
    try {
      changes.forEach(c => {
        const clientFilePath = path.join(client.path, c.file);
        if (fs.existsSync(clientFilePath)) {
          const backupFilePath = path.join(backupDir, c.file);
          fs.ensureDirSync(path.dirname(backupFilePath));
          fs.copySync(clientFilePath, backupFilePath);
        }
      });
      logger.success('Copia de seguridad temporal creada con éxito.');
    } catch (err) {
      logger.error(`Fallo al crear backup: ${err.message}. Abortando sincronización.`);
      fs.removeSync(backupDir);
      continue;
    }

    // 7. Copiar archivos genéricos de plantilla a cliente
    let success = true;
    try {
      changes.forEach(c => {
        const templateFilePath = path.join(templatePath, c.file);
        const clientFilePath = path.join(client.path, c.file);
        fs.ensureDirSync(path.dirname(clientFilePath));
        fs.copySync(templateFilePath, clientFilePath, { overwrite: true });
      });
      logger.success('Archivos copiados del template core a la instancia cliente.');
    } catch (err) {
      logger.error(`Fallo al aplicar cambios: ${err.message}. Revirtiendo cambios...`);
      rollbackBackup(client.path, backupDir, changes);
      success = false;
    }

    if (!success) continue;

    // 8. Validación de Integridad (Build Vite)
    logger.info('🛠️ Ejecutando validación de compilación (npm run build) en el cliente...');
    try {
      execSync('npm run build', { cwd: client.path, stdio: 'inherit', shell: true });
      logger.success('🎉 Compilación de integridad aprobada con éxito.');

      // Limpiar backup temporal
      fs.removeSync(backupDir);

      // Actualizar metadatos
      client.meta.version = templateVersion;
      fs.writeJsonSync(path.join(client.path, '.prototipe.json'), client.meta, { spaces: 2 });
      logger.success(`✅ Versión del cliente actualizada a v${templateVersion} en metadatos.`);
    } catch (err) {
      logger.error(`❌ La compilación falló tras actualizar los archivos.`);
      logger.warn('Iniciando rollback seguro de los archivos del cliente...');
      rollbackBackup(client.path, backupDir, changes);
    }
  }

  logger.info(' Sincronización de clientes completada.');
}

/**
 * Restaura los archivos originales a partir del backup temporal
 */
function rollbackBackup(clientPath, backupDir, changes) {
  try {
    changes.forEach(c => {
      const backupFilePath = path.join(backupDir, c.file);
      const clientFilePath = path.join(clientPath, c.file);

      if (fs.existsSync(backupFilePath)) {
        fs.copySync(backupFilePath, clientFilePath, { overwrite: true });
      } else {
        // Si era nuevo, se elimina del cliente
        fs.removeSync(clientFilePath);
      }
    });
    fs.removeSync(backupDir);
    logger.success('🔄 Rollback completado. La instancia del cliente ha sido restaurada a su estado original.');
  } catch (err) {
    logger.error(`Fallo crítico durante el rollback: ${err.message}. Los archivos pueden estar en un estado inconsistente.`);
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
          
          // Omitir bloques de más de 8 líneas sin cambios para evitar saturar la terminal
          if (!part.added && !part.removed && lines.length > 8) {
            console.log(pc.gray(`  ... (${lines.length - 2} líneas sin cambios omitidas por legibilidad) ...`));
            // Mostrar al menos un par de líneas como contexto
            if (lines[0]) console.log(pc.gray(`  ${lines[0]}`));
            if (lines[lines.length - 1]) console.log(pc.gray(`  ${lines[lines.length - 1]}`));
          } else {
            lines.forEach(line => {
              // Si la línea no es vacía o es una línea añadida/removida, mostrarla
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
