import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolver la raíz del monorepo de forma multiplataforma
const MONOREPO_ROOT = process.env.PROTOTIPE_WORKSPACE_ROOT || path.resolve(__dirname, '../..');

const KNOWLEDGE_FIRESTORE_DIR = path.join(MONOREPO_ROOT, 'Prototipe-CLI', 'knowledge', 'firestore');
const CORE_RULES_PATH = path.join(KNOWLEDGE_FIRESTORE_DIR, 'core.rules');
const FEATURES_DIR = path.join(KNOWLEDGE_FIRESTORE_DIR, 'features');

// Definir destinos y qué features requiere cada uno
const DEPLOYMENTS = [
  {
    name: 'template-core-seed',
    path: path.join(MONOREPO_ROOT, 'Prototipe-CLI', 'templates', 'template-core-seed', 'firestore.rules'),
    features: [] // Core agnóstico puro
  },
  {
    name: 'App Ventas (Core Plantilla)',
    path: path.join(MONOREPO_ROOT, 'Plantillas Core', 'App Ventas', 'firestore.rules'),
    features: ['orders', 'credits', 'inventory', 'notifications']
  },
  {
    name: 'template-ventas',
    path: path.join(MONOREPO_ROOT, 'Prototipe-CLI', 'templates', 'template-ventas', 'firestore.rules'),
    features: ['orders', 'credits', 'inventory', 'notifications']
  },
  {
    name: 'ventas-moni-app (Instancia Cliente)',
    path: path.join(MONOREPO_ROOT, 'Instancias Clientes', 'ventas', 'ventas-moni-app', 'firestore.rules'),
    features: ['orders', 'credits', 'inventory', 'notifications']
  }
];

function calculateSHA256(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

async function composeRules(features) {
  if (!fs.existsSync(CORE_RULES_PATH)) {
    throw new Error(`Archivo core.rules no encontrado en: ${CORE_RULES_PATH}`);
  }

  let coreRules = await fs.readFile(CORE_RULES_PATH, 'utf8');

  // Si no hay features, devolvemos el core.rules directamente
  if (features.length === 0) {
    return coreRules;
  }

  // Componer reglas concatenando las features antes de la última llave de match de databases
  const lastBracketIndex = coreRules.lastIndexOf('}');
  if (lastBracketIndex === -1) {
    throw new Error('Estructura de core.rules malformada (falta llave de cierre).');
  }

  let featuresContent = '\n';
  for (const feature of features) {
    const featurePath = path.join(FEATURES_DIR, `${feature}.rules`);
    if (!fs.existsSync(featurePath)) {
      throw new Error(`Regla de feature no encontrada: ${featurePath}`);
    }
    const content = await fs.readFile(featurePath, 'utf8');
    featuresContent += `\n${content}\n`;
  }

  // Insertar las reglas de features antes del último cierre
  const composed = coreRules.substring(0, lastBracketIndex) + featuresContent + coreRules.substring(lastBracketIndex);
  return composed;
}

async function run() {
  console.log('🤖 Iniciando distribución y validación de reglas Firestore...');
  let hasErrors = false;

  for (const dep of DEPLOYMENTS) {
    try {
      console.log(`\n📦 Componiendo reglas para: ${dep.name}`);
      const composedContent = await composeRules(dep.features);
      const generatedHash = calculateSHA256(composedContent);

      // Si no existe el destino, o si se corre con --write, guardarlo
      const shouldWrite = process.argv.includes('--write');
      if (shouldWrite || !fs.existsSync(dep.path)) {
        await fs.ensureDir(path.dirname(dep.path));
        await fs.writeFile(dep.path, composedContent, 'utf8');
        console.log(`  💾 Archivo escrito físicamente en: ${dep.path}`);
      }

      // Validar paridad
      const actualContent = await fs.readFile(dep.path, 'utf8');
      const actualHash = calculateSHA256(actualContent);

      if (generatedHash !== actualHash) {
        console.error(`  🔴 FAIL: Desviación de paridad en ${dep.name}`);
        console.error(`    Esperado (SHA256): ${generatedHash}`);
        console.error(`    Físico   (SHA256): ${actualHash}`);
        hasErrors = true;
      } else {
        console.log(`  🟢 Paridad certificada (SHA256: ${generatedHash})`);
      }
    } catch (err) {
      console.error(`  🔴 Error procesando ${dep.name}:`, err.message);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error('\n❌ Distribución finalizada con errores de consistencia.');
    process.exit(1);
  } else {
    console.log('\n✅ Distribución y paridad de reglas Firestore completada con éxito.');
    process.exit(0);
  }
}

run();
