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
    packageName: '',
    appId: '',
    telemetryToken: ''
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
        const match = envContent.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'#\\n]+)["']?`, 'm'));
        return match ? match[1].trim() : '';
      };
      tokens.projectId         = parseEnvValue('VITE_FIREBASE_PROJECT_ID');
      tokens.apiKey            = parseEnvValue('VITE_FIREBASE_API_KEY');
      tokens.measurementId     = parseEnvValue('VITE_FIREBASE_MEASUREMENT_ID');
      tokens.appId             = parseEnvValue('VITE_FIREBASE_APP_ID');
      tokens.telemetryToken    = '';
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
    const required = ['fuente', 'destino', 'nicho', 'activo', 'version', 'coreType'];
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
    if (config.coreType && typeof config.coreType !== 'string') {
      errors.push(`El campo "coreType" de "${key}" debe ser un string.`);
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

/**
 * Audita de manera estática el hook useAppConfigSync.js para asegurar el blindaje de telemetría.
 * @param {string} hookPath Ruta absoluta al hook
 * @param {string} name Nombre descriptivo de la plantilla
 * @returns {Promise<string[]>} Lista de errores de blindaje
 */
async function auditarIntegridadHook(hookPath, name) {
  const errors = [];
  try {
    const content = await fs.readFile(hookPath, 'utf8');
    
    // 1. Validar que procesa triggerTelemetryReport
    if (!content.includes('triggerTelemetryReport')) {
      errors.push(`useAppConfigSync.js en "${name}" no contiene referencias a "triggerTelemetryReport". El canal de telemetría remota está ausente.`);
    }
    
    // 2. Validar que NO usa el patrón vulnerable
    if (content.includes('if (metrics && metrics.totalMes)')) {
      errors.push(`useAppConfigSync.js en "${name}" contiene el patrón vulnerable "if (metrics && metrics.totalMes)". Bloquea el reporte si las ventas son $0.`);
    }
    
    // 3. Validar que implementa la comprobación de tipo estricta
    if (content.includes('triggerTelemetryReport') && !content.includes("typeof metrics.totalMes === 'number'")) {
      errors.push(`useAppConfigSync.js en "${name}" procesa telemetría pero no tiene la comprobación de tipo estricta "typeof metrics.totalMes === 'number'". Riesgo de fallo con $0 en ventas.`);
    }
    
    // 4. Validar control de re-gatillado/expiración (<60s)
    if (!content.includes('60000') && !content.includes('isExpired')) {
      errors.push(`useAppConfigSync.js en "${name}" no contiene un mecanismo de antigüedad/expiración (isExpired / 60000ms). Riesgo de reportes duplicados infinitos en page load.`);
    }

    // 5. Validar soporte híbrido (Timestamp y Number) para triggers
    if (content.includes('triggerTelemetryReport') && !content.includes('toMillis')) {
      errors.push(`useAppConfigSync.js en "${name}" procesa telemetría pero carece de soporte híbrido (toMillis / fallback de Number) para triggerTelemetryReport.`);
    }
    if (content.includes('triggerPing') && !content.includes('toMillis')) {
      errors.push(`useAppConfigSync.js en "${name}" procesa ping pero carece de soporte híbrido (toMillis / fallback de Number) para triggerPing.`);
    }
  } catch (err) {
    errors.push(`Error leyendo useAppConfigSync.js en "${name}": ${err.message}`);
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

  // ── Paso 0.5: Auditar integridad del hook de telemetría en el origen ─────
  const hookSourcePath = path.join(fuente, 'src', 'hooks', 'useAppConfigSync.js');
  if (await fs.pathExists(hookSourcePath)) {
    const hookErrors = await auditarIntegridadHook(hookSourcePath, targetTemplateName);
    if (hookErrors.length > 0) {
      console.error(pc.red('\n❌ ERROR DE SINCRONIZACIÓN (VULNERABILIDAD DE TELEMETRÍA DETECTADA):'));
      hookErrors.forEach(err => console.error(pc.red(`   - ${err}`)));
      console.log(pc.yellow('\n💡 La sincronización ha sido abortada para proteger el canal de telemetría downstream.'));
      console.log(pc.yellow('   Por favor, corrige useAppConfigSync.js en el core antes de sincronizar.\n'));
      process.exit(1);
    }
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
    'src/config',
    'src/App.jsx',
    'src/App.css',
    'src/index.css',
    'src/main.jsx',
    'index.html',
    'public',
    'firestore.indexes.json',
    'firestore.rules',
    'storage.rules',
    'vite.config.js',
    'vitest.config.js',
    'playwright.config.js',
    '.gitignore',
    '.github',
    'tests',
    'eslint.config.js',
    'template.json',
    'GEMINI.md',
    'flujos_aplicacion.md',
    'mapa_arquitectura.md',
    'mapa_arquitectura_ia.md',
    'package.json',
    'scripts',
    'scratch'
  ];

  const EXCLUDE_PATTERNS = [
    '.env.local',
    '.firebaserc',
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

  // 2. Simular/Evaluar escaneo de sanitización dinámica sobre todos los archivos que estarán en destino
  for (const action of actionsToTake) {
    const relative = action.relative;
    if (relative.endsWith('.js') || relative.endsWith('.jsx') || relative.endsWith('.json') || relative.endsWith('.md') || relative.endsWith('.html')) {
      const srcPath = path.join(fuente, relative);
      if (await fs.pathExists(srcPath)) {
        let content = await fs.readFile(srcPath, 'utf8');
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

        // Patrones de credenciales Firebase y tokens sensibles
        if (srcTokens.apiKey && content.includes(srcTokens.apiKey)) {
          needsSanitization = true;
          matchedReasons.push('Firebase API Key de desarrollo');
        } else if (/AIzaSy[A-Za-z0-9_-]{33}/g.test(content)) {
          needsSanitization = true;
          matchedReasons.push('Firebase API Key hardcodeada');
        }



        if (srcTokens.appId && content.includes(srcTokens.appId)) {
          needsSanitization = true;
          matchedReasons.push('Firebase App ID de desarrollo');
        }

        if (srcTokens.telemetryToken && content.includes(srcTokens.telemetryToken)) {
          needsSanitization = true;
          matchedReasons.push('Telemetry Token de desarrollo');
        }



        if (path.basename(relative) === 'index.html') {
          if (/<title>[^<]*<\/title>/i.test(content) || /<meta\s+name="apple-mobile-web-app-title"\s+content="[^"]*"\s*\/?>/gi.test(content)) {
            needsSanitization = true;
            matchedReasons.push('Metadata de título/SEO a marca blanca');
          }
        }

        if (/G-[A-Za-z0-9]{10}/g.test(content)) {
          needsSanitization = true;
          matchedReasons.push('ID analítica (G-XXXXX)');
        }
        if (content.includes('VITE_FIREBASE_API_KEY') && !content.includes('import.meta.env') && !content.includes('process.env')) {
          matchedReasons.push('⚠️ Advertencia: VITE_FIREBASE_API_KEY hardcodeada');
        }

        if (needsSanitization || matchedReasons.length > 0) {
          sanitizationsToApply.push({
            relative,
            fullPath: action.path,
            reasons: matchedReasons,
            needsWrite: needsSanitization
          });
        }
      }
    }
  }

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

      // 1. Reemplazar el Project ID real del fuente
      if (srcProjectId) {
        content = content.replace(new RegExp(srcProjectId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'proyecto-cliente-saas');
      }

      // 2. Reemplazar nombre de paquete del fuente si existe
      if (srcTokens.packageName) {
        content = content.replace(new RegExp(srcTokens.packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'proyecto-cliente-saas');
      }

      // 3. Reemplazar API Keys reales
      if (srcTokens.apiKey) {
        content = content.replace(new RegExp(srcTokens.apiKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'AIzaSy[API_KEY_DE_CLIENTE_AUTOGENERADA]');
      }
      content = content.replace(/AIzaSy[A-Za-z0-9_-]{33}/g, 'AIzaSy[API_KEY_DE_CLIENTE_AUTOGENERADA]');



      // 5. Reemplazar App ID
      if (srcTokens.appId) {
        content = content.replace(new RegExp(srcTokens.appId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'APP_ID_MUTABLE');
      }

      // 6. Reemplazar Telemetry Token
      if (srcTokens.telemetryToken) {
        content = content.replace(new RegExp(srcTokens.telemetryToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'TELEMETRIA_TOKEN_MUTABLE');
      }



      // 8. Reemplazar index.html titles/metas
      if (path.basename(s.fullPath) === 'index.html') {
        content = content.replace(/<title>[^<]*<\/title>/gi, '<title>Prototipe App Base</title>');
        content = content.replace(/<meta\s+name="apple-mobile-web-app-title"\s+content="[^"]*"\s*\/?>/gi, '<meta name="apple-mobile-web-app-title" content="Prototipe App Base" />');
      }

      // 9. Reemplazar IDs de medición fijos
      content = content.replace(/G-[A-Za-z0-9]{10}/g, 'G-[ID_MEDICION_TEMPORAL]');

      await fs.writeFile(s.fullPath, content, 'utf8');
      console.log(pc.gray(`   - Higienizado físicamente: ${s.relative}`));
    }
  }

  console.log(pc.green('✅ Copia e higienización finalizada.'));

  // --- VALIDACIÓN POST-SYNC (Infraestructura obligatoria) ---
  console.log(pc.yellow('\n🔍 Realizando validación post-sincronización...'));
  const criticalFiles = [
    'package.json',
    'firestore.rules',
    'firestore.indexes.json',
    'vitest.config.js',
    'playwright.config.js',
    '.github/workflows/ci.yml',
    'template.json',
    'tests'
  ];
  const missingFiles = [];
  for (const f of criticalFiles) {
    if (!await fs.pathExists(path.join(destino, f))) {
      missingFiles.push(f);
    }
  }
  if (missingFiles.length > 0) {
    console.error(pc.red(`❌ FALLO DE SINCRONIZACIÓN: Falta infraestructura obligatoria de testing/CI/CD en el destino: ${missingFiles.join(', ')}`));
    process.exit(1);
  }
  console.log(pc.green('   ✅ Toda la infraestructura obligatoria de testing/CI/CD está presente en el destino.'));


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
