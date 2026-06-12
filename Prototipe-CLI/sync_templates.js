import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { execSync } from 'child_process';
import readline from 'readline';

// Cargar el registro central de plantillas
const REGISTRO_PATH = path.join(process.cwd(), 'plantillas_registro.json');

/**
 * Lee el .env.local y package.json del proyecto fuente y extrae los tokens
 * sensibles que deben ser sanitizados en la plantilla destino.
 * @param {string} fuente Ruta absoluta al directorio del proyecto fuente
 * @returns {Promise<{projectId: string, apiKey: string, measurementId: string, packageName: string}>}
 */
async function extractSanitizationTokens(fuente) {
  const tokens = {
    projectId: '',
    apiKey: '',
    measurementId: '',
    packageName: ''
  };

  // 1. Leer package.json para el nombre del proyecto
  const pkgPath = path.join(fuente, 'package.json');
  if (await fs.pathExists(pkgPath)) {
    try {
      const pkg = await fs.readJson(pkgPath);
      tokens.packageName = pkg.name || '';
    } catch { /* ignorar */ }
  }

  // 2. Leer .env.local para las credenciales Firebase reales
  const envPath = path.join(fuente, '.env.local');
  if (await fs.pathExists(envPath)) {
    try {
      const envContent = await fs.readFile(envPath, 'utf8');
      const parseEnvValue = (key) => {
        const match = envContent.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'\\n]+)["']?`, 'm'));
        return match ? match[1].trim() : '';
      };
      tokens.projectId     = parseEnvValue('VITE_FIREBASE_PROJECT_ID');
      tokens.apiKey        = parseEnvValue('VITE_FIREBASE_API_KEY');
      tokens.measurementId = parseEnvValue('VITE_FIREBASE_MEASUREMENT_ID');
    } catch { /* ignorar */ }
  }

  return tokens;
}

// Función auxiliar para verificar si dos archivos difieren
async function filesDiffer(fileA, fileB) {
  if (!await fs.pathExists(fileB)) return true;
  try {
    const statA = await fs.stat(fileA);
    const statB = await fs.stat(fileB);
    if (statA.size !== statB.size) return true;
    const contentA = await fs.readFile(fileA, 'utf8');
    const contentB = await fs.readFile(fileB, 'utf8');
    return contentA !== contentB;
  } catch (err) {
    return true; // Ante cualquier duda, asumir que difieren
  }
}

function validarRegistro(registro) {
  const errors = [];
  if (!registro || typeof registro !== 'object') {
    errors.push('El registro de plantillas debe ser un objeto JSON válido.');
    return errors;
  }
  if (!registro.plantillas || typeof registro.plantillas !== 'object') {
    errors.push('Falta el objeto central "plantillas" en el JSON de registro.');
    return errors;
  }
  const semverRegex = /^\d+\.\d+\.\d+$/;
  for (const [key, config] of Object.entries(registro.plantillas)) {
    if (!config || typeof config !== 'object') {
      errors.push(`La entrada "${key}" en el registro debe ser un objeto.`);
      continue;
    }
    const required = ['fuente', 'destino', 'nicho', 'activo', 'version'];
    required.forEach(f => {
      if (!(f in config)) {
        errors.push(`La plantilla "${key}" no contiene el campo requerido "${f}".`);
      }
    });
    if (config.fuente && (typeof config.fuente !== 'string' || !path.isAbsolute(config.fuente))) {
      errors.push(`El campo "fuente" de "${key}" ("${config.fuente}") debe ser una ruta absoluta.`);
    }
    if (config.destino && (typeof config.destino !== 'string' || !path.isAbsolute(config.destino))) {
      errors.push(`El campo "destino" de "${key}" ("${config.destino}") debe ser una ruta absoluta.`);
    }
    if (config.nicho && typeof config.nicho !== 'string') {
      errors.push(`El campo "nicho" de "${key}" debe ser un string.`);
    }
    if ('activo' in config && typeof config.activo !== 'boolean') {
      errors.push(`El campo "activo" de "${key}" debe ser un booleano.`);
    }
    if (config.version && (typeof config.version !== 'string' || !semverRegex.test(config.version))) {
      errors.push(`El campo "version" de "${key}" ("${config.version}") debe ser un string SemVer válido (ej. "1.0.0").`);
    }
  }
  return errors;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun      = args.includes('--dry-run')    || args.includes('-d');
  const autoApprove = args.includes('--yes')         || args.includes('-y');
  const runTests    = args.includes('--run-tests')   || args.includes('-T');

  // Filtrar los flags para extraer el nombre de la plantilla
  const FLAGS = ['--dry-run', '-d', '--yes', '-y', '--run-tests', '-T'];
  const positionalArgs = args.filter(arg => !FLAGS.includes(arg));
  const targetTemplateName = positionalArgs[0];

  if (!await fs.pathExists(REGISTRO_PATH)) {
    console.error(pc.red(`❌ No se encontró el registro central de plantillas en: ${REGISTRO_PATH}`));
    process.exit(1);
  }

  const registro = await fs.readJson(REGISTRO_PATH);
  
  // Validar el registro antes de procesar cualquier plantilla
  const validationErrors = validarRegistro(registro);
  if (validationErrors.length > 0) {
    console.error(pc.red('\n❌ ERROR: El archivo plantillas_registro.json contiene errores de esquema:'));
    validationErrors.forEach(err => console.error(pc.red(`   - ${err}`)));
    console.log();
    process.exit(1);
  }

  const plantillas = registro.plantillas;

  if (!targetTemplateName) {
    console.log(pc.yellow('\n⚠️ No se especificó el nombre de la plantilla a actualizar.'));
    console.log(pc.cyan('Plantillas registradas en el sistema:'));
    Object.keys(plantillas).forEach(key => {
      console.log(`- ${pc.bold(key)}: ${plantillas[key].nicho} (${plantillas[key].activo ? 'Activo' : 'Inactivo'})`);
    });
    console.log(pc.white('\nUso: node sync_templates.js [nombre] [opciones]\nOpciones:\n  -d, --dry-run   Simular la sincronización sin modificar archivos\n  -y, --yes       Aprobar automáticamente la escritura física\n\nEjemplo: node sync_templates.js ventas --dry-run\n'));
    process.exit(1);
  }

  const templateConfig = plantillas[targetTemplateName];

  if (!templateConfig) {
    console.error(pc.red(`❌ La plantilla "${targetTemplateName}" no existe en el registro central.`));
    process.exit(1);
  }

  const { fuente, destino, nicho, version } = templateConfig;

  console.log('\n' + pc.bold(pc.cyan('====================================================')));
  console.log(pc.bold(pc.cyan(`🔄 SINCRONIZANDO PLANTILLA: [${targetTemplateName.toUpperCase()}] v${version}`)));
  console.log(pc.cyan(`   Nicho: ${nicho}`));
  console.log(pc.white(`   Fuente:  ${fuente}`));
  console.log(pc.white(`   Destino: ${destino}`));
  if (dryRun) {
    console.log(pc.bold(pc.yellow('   ⚠️ MODO SIMULACIÓN ACTIVO (DRY-RUN)')));
  }
  console.log(pc.bold(pc.cyan('====================================================\n')));

  if (!await fs.pathExists(fuente)) {
    console.error(pc.red(`❌ La carpeta fuente de desarrollo no existe en el disco: ${fuente}`));
    process.exit(1);
  }

  // Detectar carpetas de documentación locales de la plantilla core
  const filesInFuente = await fs.readdir(fuente);
  const localDocFolders = filesInFuente.filter(file => file.startsWith('Documentacion') && file !== 'Documentacion PROTOTIPE');

  // Listas de archivos del estándar
  const SYNC_PATHS = [
    ...localDocFolders,
    'src/components',
    'src/hooks',
    'src/services',
    'src/store',
    'src/layouts',
    'src/pages',
    'src/routes',
    'src/utils',
    'src/constants',
    'src/schemas',
    'src/types',
    'src/providers',
    'src/App.jsx',
    'src/App.css',
    'src/index.css',
    'src/main.jsx',
    'firestore.indexes.json',
    'firestore.rules',
    'vite.config.js',
    'eslint.config.js',
    'GEMINI.md',
    'flujos_aplicacion.md',
    'mapa_arquitectura.md',
    'mapa_arquitectura_ia.md'
  ];

  const EXCLUDE_PATTERNS = [
    '.env.local',
    '.firebaserc',
    'firebase.json',
    'src/config/firebaseConfig.js',
    'index.html',
    'public',
    'package-lock.json',
    'node_modules'
  ];

  // Listas para previsualización
  const actionsToTake = [];
  const ignoredFiles = [];
  const sanitizationsToApply = [];

  // Extraer tokens sensibles del proyecto fuente para sanitización dinámica
  const srcTokens = await extractSanitizationTokens(fuente);
  if (srcTokens.projectId || srcTokens.packageName) {
    console.log(pc.gray(`   ℹ️  Tokens de sanitización detectados: projectId="${srcTokens.projectId || '(no encontrado)'}" | pkg="${srcTokens.packageName || '(no encontrado)'}"`));
  } else {
    console.log(pc.yellow('   ⚠️ No se encontró .env.local en el fuente. Se usarán patrones genéricos de sanitización.'));
  }

  // 1. Simular / Evaluar cambios en SYNC_PATHS
  for (const item of SYNC_PATHS) {
    const srcItemPath = path.join(fuente, item);
    const destItemPath = path.join(destino, item);

    if (await fs.pathExists(srcItemPath)) {
      const stat = await fs.stat(srcItemPath);

      if (stat.isDirectory()) {
        // Escanear recursivamente el directorio fuente
        const scanDir = async (srcSubDir) => {
          const files = await fs.readdir(srcSubDir);
          for (const file of files) {
            const fullSrcPath = path.join(srcSubDir, file);
            const relativeItem = path.relative(fuente, fullSrcPath).replace(/\\/g, '/');

            // Verificar exclusión (no excluimos carpetas de documentación local del core)
            const isExcluded = EXCLUDE_PATTERNS.some(exclude => {
              return relativeItem === exclude || relativeItem.startsWith(exclude + '/');
            });

            if (isExcluded) {
              ignoredFiles.push(relativeItem);
              continue;
            }

            const itemStat = await fs.stat(fullSrcPath);
            if (itemStat.isDirectory()) {
              await scanDir(fullSrcPath);
            } else {
              const fullDestPath = path.join(destino, relativeItem);
              const exists = await fs.pathExists(fullDestPath);
              if (!exists) {
                actionsToTake.push({ type: 'CREATE', relative: relativeItem, path: fullDestPath });
              } else if (await filesDiffer(fullSrcPath, fullDestPath)) {
                actionsToTake.push({ type: 'UPDATE', relative: relativeItem, path: fullDestPath });
              } else {
                actionsToTake.push({ type: 'EQUAL', relative: relativeItem, path: fullDestPath });
              }
            }
          }
        };
        await scanDir(srcItemPath);
      } else {
        // Archivo individual
        const exists = await fs.pathExists(destItemPath);
        if (!exists) {
          actionsToTake.push({ type: 'CREATE', relative: item, path: destItemPath });
        } else if (await filesDiffer(srcItemPath, destItemPath)) {
          actionsToTake.push({ type: 'UPDATE', relative: item, path: destItemPath });
        } else {
          actionsToTake.push({ type: 'EQUAL', relative: item, path: destItemPath });
        }
      }
    } else {
      ignoredFiles.push(`${item} (no existe en fuente)`);
    }
  }

  // 2. Simular escaneo de sanitización dinámica
  const testWalkSanitization = async (dir) => {
    if (!await fs.pathExists(dir)) return;
    const files = await fs.readdir(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.vite') continue;
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        await testWalkSanitization(fullPath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.json') || file.endsWith('.md')) {
        let content = await fs.readFile(fullPath, 'utf8');
        let needsSanitization = false;
        const matchedReasons = [];

        // Token dinámico: Project ID del fuente (fallback a patrón genérico)
        const srcProjectId = srcTokens.projectId || 'ventas-smartfix';
        if (srcProjectId && content.includes(srcProjectId)) {
          needsSanitization = true;
          matchedReasons.push(`Project ID de desarrollo "${srcProjectId}"`);
        }

        // Token dinámico: package name del fuente
        if (srcTokens.packageName && content.includes(srcTokens.packageName)) {
          needsSanitization = true;
          matchedReasons.push(`Nombre de paquete de desarrollo "${srcTokens.packageName}"`);
        }

        // Patrones fijos de credenciales Firebase
        if (/AIzaSy[A-Za-z0-9_-]{33}/g.test(content)) {
          needsSanitization = true;
          matchedReasons.push('Firebase API Key hardcodeada');
        }
        if (/G-[A-Za-z0-9]{10}/g.test(content)) {
          needsSanitization = true;
          matchedReasons.push('ID analítica (G-XXXXX)');
        }
        if (content.includes('VITE_FIREBASE_API_KEY') && !content.includes('import.meta.env')) {
          matchedReasons.push('⚠️ Advertencia: VITE_FIREBASE_API_KEY hardcodeada');
        }

        if (needsSanitization || matchedReasons.length > 0) {
          sanitizationsToApply.push({
            relative: path.relative(destino, fullPath).replace(/\\/g, '/'),
            fullPath,
            reasons: matchedReasons,
            needsWrite: needsSanitization
          });
        }
      }
    }
  };

  // Escanear el destino para previsualizar sanitizaciones
  await testWalkSanitization(destino);

  // Mostrar el reporte de previsualización
  console.log(pc.bold(pc.white('📋 PREVISUALIZACIÓN DE CAMBIOS:')));
  const createCount = actionsToTake.filter(a => a.type === 'CREATE').length;
  const updateCount = actionsToTake.filter(a => a.type === 'UPDATE').length;
  const equalCount = actionsToTake.filter(a => a.type === 'EQUAL').length;

  actionsToTake.forEach(action => {
    if (action.type === 'CREATE') {
      console.log(`   - ${pc.green('[NUEVO]     ')} ${action.relative}`);
    } else if (action.type === 'UPDATE') {
      console.log(`   - ${pc.yellow('[MODIFICADO]')} ${action.relative}`);
    }
  });

  if (createCount === 0 && updateCount === 0) {
    console.log(pc.gray('   (Ningún archivo requiere copia o actualización, todos están sincronizados)'));
  }

  if (sanitizationsToApply.length > 0) {
    console.log(pc.bold(pc.yellow('\n🔍 ALERTAS DE SANITIZACIÓN / SEGURIDAD DETECTADAS:')));
    sanitizationsToApply.forEach(s => {
      const prefix = s.needsWrite ? '[SANITIZAR]' : '[ADVERTENCIA]';
      const color = s.needsWrite ? pc.yellow : pc.red;
      console.log(`   - ${color(prefix)} ${s.relative} → ${s.reasons.join(', ')}`);
    });
  }

  console.log('\n' + pc.cyan('--- Resumen de la Simulación ---'));
  console.log(`- Archivos nuevos a copiar:       ${pc.green(createCount)}`);
  console.log(`- Archivos modificados a copiar:  ${pc.yellow(updateCount)}`);
  console.log(`- Archivos idénticos (omitidos):  ${pc.gray(equalCount)}`);
  console.log(`- Archivos excluidos estándar:    ${pc.gray(ignoredFiles.length)}`);
  console.log(`- Archivos a sanitizar/revisar:   ${pc.magenta(sanitizationsToApply.length)}`);

  if (dryRun) {
    console.log(pc.bold(pc.yellow('\n⚡ Simulación finalizada. No se realizaron cambios en el disco.\n')));
    return;
  }

  // Solicitar confirmación interactiva si no se especificó autoApprove
  if (!autoApprove && process.stdin.isTTY) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const confirmation = await new Promise(resolve => {
      rl.question(pc.bold(pc.cyan('\n❓ ¿Deseas proceder con la escritura física en el disco? (s/N): ')), (ans) => {
        rl.close();
        resolve(ans.trim().toLowerCase());
      });
    });

    if (confirmation !== 's' && confirmation !== 'si' && confirmation !== 'y' && confirmation !== 'yes') {
      console.log(pc.red('\n❌ Sincronización cancelada por el usuario. Ningún archivo fue modificado.\n'));
      process.exit(0);
    }
  }

  // --- EJECUCIÓN FÍSICA ---
  console.log('\n' + pc.yellow('🚀 Aplicando cambios físicos en el destino...'));

  // Asegurar carpetas y copiar archivos
  for (const action of actionsToTake) {
    if (action.type === 'CREATE' || action.type === 'UPDATE') {
      const srcItem = path.join(fuente, action.relative);
      await fs.ensureDir(path.dirname(action.path));
      await fs.copy(srcItem, action.path);
      console.log(pc.gray(`   - Escrito: ${action.relative}`));
    }
  }

  // Aplicar sanitización física con tokens dinámicos
  console.log(pc.yellow('🧹 Sanitizando referencias de clientes...'));
  const srcProjectId = srcTokens.projectId || 'ventas-smartfix';
  for (const s of sanitizationsToApply) {
    if (s.needsWrite) {
      let content = await fs.readFile(s.fullPath, 'utf8');

      // Reemplazar el Project ID real del fuente
      if (srcProjectId) {
        content = content.replace(new RegExp(srcProjectId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'proyecto-cliente-saas');
      }

      // Reemplazar nombre de paquete del fuente si existe
      if (srcTokens.packageName) {
        content = content.replace(new RegExp(srcTokens.packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'proyecto-cliente-saas');
      }

      // Limpiar API Keys y Measurement IDs de Firebase
      content = content.replace(/AIzaSy[A-Za-z0-9_-]{33}/g, 'AIzaSy[API_KEY_DE_CLIENTE_AUTOGENERADA]');
      content = content.replace(/G-[A-Za-z0-9]{10}/g, 'G-[ID_MEDICION_TEMPORAL]');

      await fs.writeFile(s.fullPath, content, 'utf8');
      console.log(pc.gray(`   - Higienizado físicamente: ${s.relative}`));
    }
  }

  console.log(pc.green('✅ Copia e higienización finalizada.'));

  // Validar compilación
  console.log(pc.yellow('\n⚙️ Validando compilación local en la plantilla...'));
  try {
    const pkgSrc = path.join(fuente, 'package.json');
    const pkgDest = path.join(destino, 'package.json');
    if (await fs.pathExists(pkgSrc)) {
      await fs.copy(pkgSrc, pkgDest);
    }

    if (!await fs.pathExists(pkgDest)) {
      console.log(pc.yellow('⚠️ No se encontró package.json en el destino. Omitiendo validación de build.'));
    } else {
      const pkg = await fs.readJson(pkgDest);
      if (pkg.scripts && pkg.scripts.build) {
        console.log(pc.gray('   - Instalando dependencias de prueba...'));
        execSync('npm install --no-audit --no-fund', { cwd: destino, stdio: 'ignore' });
        
        console.log(pc.gray('   - Compilando bundle de producción (Vite)...'));
        execSync('npm run build', { cwd: destino, stdio: 'ignore' });
        console.log(pc.green('🎉 ¡Validación exitosa! La plantilla compila de forma nativa sin errores.'));
      } else {
        console.log(pc.yellow('⚠️ La plantilla no tiene un script "build" definido. Omitiendo build.'));
      }
    }
  } catch (buildErr) {
    console.error(pc.red(`❌ Error de compilación en el destino: ${buildErr.message}`));
    process.exit(1);
  }

  console.log('\n' + pc.bold(pc.green('====================================================')));
  console.log(pc.bold(pc.green('🎉 ¡SINCRONIZACIÓN COMPLETADA CON ÉXITO!')));
  console.log(pc.bold(pc.green('====================================================\n')));

  // ── Post-sync: pruebas de integración automáticas ─────────────────────────
  if (runTests) {
    console.log(pc.bold(pc.cyan('\n🧪 Iniciando pruebas de integración post-sincronización...')));
    const testScript = path.join(process.cwd(), 'test_templates.js');
    try {
      execSync(
        `node "${testScript}" --template ${targetTemplateName}`,
        { cwd: process.cwd(), stdio: 'inherit', shell: true }
      );
    } catch (_) {
      // test_templates.js ya maneja su propio proceso de salida con exit(1)
      // El error ya fue impreso en la consola; propagamos el código de fallo.
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error(pc.red(`❌ Error en ejecución: ${err.message}`));
  process.exit(1);
});
