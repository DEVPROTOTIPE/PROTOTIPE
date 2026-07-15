import path from 'path';
import fs from 'fs-extra';
import pc from 'picocolors';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import crypto from 'crypto';
import * as Diff from 'diff';
import { logger } from './logger.js';

// ─── CORE-345 (mecanismo 4 / ADR-0001 §20) ─────────────────────────────────
// Espejo deliberado de sync_clients.js, en sentido inverso: en vez de
// template → cliente, publica Plantilla Core → template. Reutiliza el mismo
// patrón probado (diff por hash, backup, copia, validación con `npm run
// build`, rollback automático si falla) en vez de inventar un mecanismo
// nuevo. Alcance intencionalmente acotado a `src/features/<name>/` — no
// copia branding, `.firebaserc`, `firestore.rules` (ya gobernadas por
// distribute_rules.js) ni manifests generados por instancia.
//
// Uso:
//   node publish_core_to_template.js <feature-id> [--nicho=ventas] [--dry-run] [--yes]
//
// Ejemplo:
//   node publish_core_to_template.js customer-loyalty --dry-run

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = __dirname;
const GIT_ROOT = path.resolve(CLI_ROOT, '..');
const TEMPLATES_DIR = path.join(CLI_ROOT, 'templates');

// Mapeo nicho -> nombre de carpeta en Plantillas Core (hoy solo existe 'ventas').
const NICHO_TO_CORE_DIR = {
  ventas: 'App Ventas',
};

const args = process.argv.slice(2);
const featureId = args.find((a) => !a.startsWith('--'));
const isDryRun = args.includes('--dry-run');
const autoAccept = args.includes('--yes') || args.includes('-y');
const nichoArg = args.find((a) => a.startsWith('--nicho='));
const nicho = nichoArg ? nichoArg.split('=')[1] : 'ventas';

function getFileHash(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(buffer).digest('hex');
  } catch (err) {
    return null;
  }
}

function getFilesRecursive(dir, baseDir = dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((entry) => {
    const fullPath = path.join(dir, entry);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getFilesRecursive(fullPath, baseDir));
    } else {
      results.push(relativePath);
    }
  });
  return results;
}

function showDiff(sourceFilePath, destFilePath, relFile, type) {
  console.log('\n' + pc.bold(pc.cyan(`--- Archivo: ${relFile} [${type}] ---`)));
  if (type === 'NUEVO') {
    const content = fs.readFileSync(sourceFilePath, 'utf8');
    content.split('\n').forEach((line) => console.log(pc.green(`+ ${line}`)));
    return;
  }
  const destContent = fs.readFileSync(destFilePath, 'utf8');
  const sourceContent = fs.readFileSync(sourceFilePath, 'utf8');
  const diffResult = Diff.diffLines(destContent, sourceContent);
  diffResult.forEach((part) => {
    const color = part.added ? pc.green : part.removed ? pc.red : pc.gray;
    const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
    const lines = part.value.split('\n');
    if (!part.added && !part.removed && lines.length > 8) {
      console.log(pc.gray(`  ... (${lines.length - 2} líneas sin cambios omitidas) ...`));
    } else {
      lines.forEach((line) => {
        if (line || part.added || part.removed) console.log(color(`${prefix}${line}`));
      });
    }
  });
}

async function main() {
  if (!featureId) {
    logger.error('Uso: node publish_core_to_template.js <feature-id> [--nicho=ventas] [--dry-run] [--yes]');
    process.exit(1);
  }

  const coreDirName = NICHO_TO_CORE_DIR[nicho];
  if (!coreDirName) {
    logger.error(`Nicho desconocido: "${nicho}". Nichos soportados: ${Object.keys(NICHO_TO_CORE_DIR).join(', ')}`);
    process.exit(1);
  }

  const sourceDir = path.join(GIT_ROOT, 'Plantillas Core', coreDirName, 'src', 'features', featureId);
  const templateAppDir = path.join(TEMPLATES_DIR, `template-${nicho}`);
  const destDir = path.join(templateAppDir, 'src', 'features', featureId);

  if (!fs.existsSync(sourceDir)) {
    logger.error(`No existe la feature de origen: ${sourceDir}`);
    process.exit(1);
  }
  if (!fs.existsSync(templateAppDir)) {
    logger.error(`No existe el template destino: ${templateAppDir}`);
    process.exit(1);
  }

  logger.info(`🚀 Publicando "${featureId}" — Plantillas Core/${coreDirName} → templates/template-${nicho}`);
  if (isDryRun) logger.info('🔍 Modo dry-run: solo se muestra el diff, no se escribe nada.');

  const sourceFiles = getFilesRecursive(sourceDir);
  if (sourceFiles.length === 0) {
    logger.warn(`La feature "${featureId}" no tiene archivos en el origen. Nada que publicar.`);
    process.exit(0);
  }

  const changes = [];
  sourceFiles.forEach((relFile) => {
    const sourceFilePath = path.join(sourceDir, relFile);
    const destFilePath = path.join(destDir, relFile);
    if (!fs.existsSync(destFilePath)) {
      changes.push({ relFile, type: 'NUEVO' });
    } else if (getFileHash(sourceFilePath) !== getFileHash(destFilePath)) {
      changes.push({ relFile, type: 'MODIFICADO' });
    }
  });

  if (changes.length === 0) {
    logger.success(`✨ "${featureId}" ya está al día en templates/template-${nicho}. Nada que publicar.`);
    process.exit(0);
  }

  console.log('\n' + pc.cyan('─'.repeat(70)));
  logger.info(`${changes.length} archivo(s) con diferencias:`);
  changes.forEach((c) => {
    const color = c.type === 'NUEVO' ? pc.green : pc.yellow;
    console.log(`  ${color(`[${c.type}]`)} ${c.relFile}`);
  });
  console.log(pc.cyan('─'.repeat(70)));

  changes.forEach((c) => {
    showDiff(path.join(sourceDir, c.relFile), path.join(destDir, c.relFile), c.relFile, c.type);
  });

  if (isDryRun) {
    logger.info('Dry-run completado. No se modificó ningún archivo.');
    process.exit(0);
  }

  if (!autoAccept) {
    logger.warn('Ejecuta con --yes para aplicar estos cambios (o revisa el diff de arriba primero).');
    process.exit(0);
  }

  // Backup de destino antes de escribir
  const backupDir = path.join(templateAppDir, `.temp_backup_publish_${featureId}`);
  try {
    fs.ensureDirSync(backupDir);
    changes.forEach((c) => {
      const destFilePath = path.join(destDir, c.relFile);
      if (fs.existsSync(destFilePath)) {
        const backupFilePath = path.join(backupDir, c.relFile);
        fs.ensureDirSync(path.dirname(backupFilePath));
        fs.copySync(destFilePath, backupFilePath);
      }
    });
    logger.success('Copia de seguridad temporal creada.');
  } catch (err) {
    logger.error(`Fallo al crear backup: ${err.message}. Abortando sin escribir.`);
    fs.removeSync(backupDir);
    process.exit(1);
  }

  // Copiar
  try {
    changes.forEach((c) => {
      const sourceFilePath = path.join(sourceDir, c.relFile);
      const destFilePath = path.join(destDir, c.relFile);
      fs.ensureDirSync(path.dirname(destFilePath));
      fs.copySync(sourceFilePath, destFilePath, { overwrite: true });
    });
    logger.success('Archivos copiados desde la Plantilla Core.');
  } catch (err) {
    logger.error(`Fallo al copiar archivos: ${err.message}. Iniciando rollback...`);
    rollback(destDir, backupDir, changes);
    process.exit(1);
  }

  // Validar con build real del template
  logger.info('Ejecutando validación de compilación (npm run build) en el template...');
  try {
    execSync('npm run build', { cwd: templateAppDir, shell: true, stdio: 'inherit' });
    logger.success('🎉 Compilación del template aprobada.');
    fs.removeSync(backupDir);
    logger.success(`✅ "${featureId}" publicada exitosamente en templates/template-${nicho}.`);
  } catch (err) {
    logger.error('❌ La compilación del template falló tras publicar. Iniciando rollback...');
    rollback(destDir, backupDir, changes);
    process.exit(1);
  }
}

function rollback(destDir, backupDir, changes) {
  try {
    changes.forEach((c) => {
      const backupFilePath = path.join(backupDir, c.relFile);
      const destFilePath = path.join(destDir, c.relFile);
      if (fs.existsSync(backupFilePath)) {
        fs.copySync(backupFilePath, destFilePath, { overwrite: true });
      } else {
        // Era NUEVO — no existía antes en destino, se retira.
        fs.removeSync(destFilePath);
      }
    });
    fs.removeSync(backupDir);
    logger.success('🔄 Rollback completado. El template quedó en su estado original.');
  } catch (err) {
    logger.error(`Fallo crítico durante el rollback: ${err.message}. El template puede quedar inconsistente — revisar manualmente.`);
  }
}

main().catch((err) => {
  logger.error(`Fallo en el proceso principal: ${err.message}`);
  process.exit(1);
});
