import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { FeatureRegistry } from './FeatureRegistry.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');

export class CorePromotionValidator {
  /**
   * Escanea el workspace de staging buscando secretos y APIs críticas, redactándolos en logs
   */
  static async scanSecrets(stagingPath) {
    console.log('[CorePromotionValidator] Iniciando escaneo de secretos y credenciales...');
    const files = this.globFilesRecursively(stagingPath);
    
    // Regex estándar para detectar Firebase API keys y tokens OAuth
    const apiKeyRegex = /AIzaSy[A-Za-z0-9-_]{35}/g;
    const genericTokenRegex = /token_?[a-zA-Z0-9]{16,}/g;

    for (const file of files) {
      const fileAbs = path.join(stagingPath, file);
      let content = fs.readFileSync(fileAbs, 'utf-8');

      const matchesApiKey = content.match(apiKeyRegex);
      if (matchesApiKey) {
        // Redactar el secreto en logs de error para prevenir fugas
        const redactedMsg = `Fallo de Seguridad: API Key de Firebase detectada en ${file}.`;
        throw new Error(this.redactText(redactedMsg, matchesApiKey));
      }
    }
    console.log('[CorePromotionValidator] Escaneo de secretos completado: Limpio.');
  }

  /**
   * Utilidad para redactar texto de logs reemplazando credenciales por REDACTED
   */
  static redactText(text, secretsList) {
    let result = text;
    for (const secret of secretsList) {
      result = result.replace(secret, '[REDACTED]');
    }
    return result;
  }

  /**
   * Escanea el código buscando PII (Información Personal Identificable)
   * Devuelve true si encuentra datos sensibles (requiere cuarentena)
   */
  static async scanPII(stagingPath) {
    console.log('[CorePromotionValidator] Iniciando escaneo de PII en Markdown y JSON...');
    const files = this.globFilesRecursively(stagingPath);

    // Regex para PII común (correos y teléfonos móviles)
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /\+?[0-9]{2,3}?[ -]?[0-9]{3,4}?[ -]?[0-9]{4,}/g;

    for (const file of files) {
      const fileAbs = path.join(stagingPath, file);
      
      // Solo escanear archivos de documentación Markdown y datos JSON para PII
      if (file.endsWith('.md') || file.endsWith('.json')) {
        const content = fs.readFileSync(fileAbs, 'utf-8');

        if (content.match(emailRegex) || content.match(phoneRegex)) {
          console.warn(`[CorePromotionValidator] Detectada posible información personal (PII) en ${file}. Reorientando a CUARENTENA.`);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Valida dependencias e integridad contra el Feature Registry
   */
  static async validateFeatures(blueprint) {
    console.log('[CorePromotionValidator] Validando features contra Feature Registry...');
    
    // Resolver todas las features de la promoción
    for (const group of ['required', 'optional']) {
      const list = blueprint.features[group] || [];
      for (const feature of list) {
        const resolved = await FeatureRegistry.resolve(feature.featureId);

        if (!resolved) {
          feature.registryStatus = 'MISSING';
          blueprint.diagnostics.errors.push({
            code: 'FEATURE_MISSING',
            step: 'RUNNING_VALIDATION',
            message: `La feature '${feature.featureId}' no está registrada en el Feature Registry local.`,
            path: `features/${group}`
          });
          continue;
        }

        // Validar paridad de versiones
        if (resolved.version !== feature.version) {
          feature.registryStatus = 'INCOMPATIBLE';
          blueprint.diagnostics.errors.push({
            code: 'FEATURE_INCOMPATIBLE',
            step: 'RUNNING_VALIDATION',
            message: `Versión incompatible para la feature '${feature.featureId}': Requerida: ${feature.version}, Registrada: ${resolved.version}.`,
            path: `features/${group}`
          });
        } else {
          feature.registryStatus = 'REGISTERED';
        }
      }
    }
  }

  /**
   * Anonimiza y extrae seeds de forma segura aplicando seed-rules.json
   */
  static validateAndExtractSeeds(clientPath, stagingPath, seedRulesPath) {
    console.log('[CorePromotionValidator] Extrayendo y anonimizando seeds...');
    const seedRules = fs.readJsonSync(seedRulesPath);
    
    const sourceSeedFile = path.join(clientPath, 'public', 'seed.json');
    const targetSeedFile = path.join(stagingPath, 'public', 'seed.json');

    if (!fs.existsSync(sourceSeedFile)) {
      console.log('[CorePromotionValidator] Archivo seed.json ausente en el origen. Omitiendo.');
      return;
    }

    let seedData;
    try {
      seedData = fs.readJsonSync(sourceSeedFile);
    } catch (err) {
      throw new Error(`Archivo seed.json corrupto o mal formado en origen: ${err.message}`);
    }

    // Anonimización rigurosa basada en seed-rules.json
    const cleanedSeed = {};

    for (const [collection, dataItems] of Object.entries(seedData)) {
      // Validar colecciones prohibidas
      if (seedRules.forbiddenCollections.includes(collection)) {
        throw new Error(`Violación de Semillas: La colección prohibida '${collection}' fue detectada en el seed.json del cliente.`);
      }

      const rule = seedRules.allowedCollections[collection];
      if (!rule) {
        console.warn(`[CorePromotionValidator] Colección '${collection}' omitida: No declarada en allowedCollections.`);
        continue;
      }

      cleanedSeed[collection] = dataItems.map(item => {
        const cleanedItem = {};
        for (const [field, value] of Object.entries(item)) {
          // Filtrar campos prohibidos
          if (rule.forbiddenFields.includes(field)) {
            continue;
          }
          if (rule.allowedFields.includes(field)) {
            cleanedItem[field] = value;
          }
        }
        return cleanedItem;
      });
    }

    fs.ensureDirSync(path.dirname(targetSeedFile));
    fs.writeJsonSync(targetSeedFile, cleanedSeed, { spaces: 2 });
    console.log('[CorePromotionValidator] Extracción de seed.json anonimizada completada.');
  }

  /**
   * Compila staging en producción local para smoke testing
   */
  static async runBuildAndSmokeTest(stagingPath) {
    console.log('[CorePromotionValidator] Ejecutando compilación en staging (npm run build)...');
    
    // Validar existencia de package.json
    const pkgPath = path.join(stagingPath, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      throw new Error('Archivo package.json no encontrado en staging.');
    }

    try {
      // Instalar dependencias necesarias para compilar el core
      console.log('[CorePromotionValidator] Ejecutando npm install local para build...');
      await execAsync('npm install', { cwd: stagingPath, env: this.safeEnv() });

      // Correr compilación de Vite
      const { stdout, stderr } = await execAsync('npm run build', { cwd: stagingPath, env: this.safeEnv() });
      console.log(stdout);
      
      // Smoke Test: Verificar que se haya creado el directorio dist/ y contenga un index.html compilado
      const distIndex = path.join(stagingPath, 'dist', 'index.html');
      if (!fs.existsSync(distIndex)) {
        throw new Error('Smoke Test Fallido: El directorio dist/ o dist/index.html no fue generado tras la compilación.');
      }
      
      console.log('[CorePromotionValidator] Compilación y Smoke Test exitosos.');
    } catch (err) {
      throw new Error(`Fallo de compilación o linter en Staging: ${err.message}`);
    }
  }

  static safeEnv() {
    const env = { ...process.env };
    const sensitiveKeys = [
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN',
      'GOOGLE_APPLICATION_CREDENTIALS',
      'TEST_AUTH_BYPASS_TOKEN',
      'SECRET_TOKEN',
      'DATABASE_PASSWORD',
      'SECRET',
      'API_KEY'
    ];
    sensitiveKeys.forEach(key => {
      delete env[key];
    });
    return env;
  }

  static globFilesRecursively(dir, rootDir = dir) {
    let results = [];
    if (!fs.existsSync(dir)) return [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const absPath = path.join(dir, file);
      const stat = fs.statSync(absPath);
      const relative = path.relative(rootDir, absPath);

      if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.obsidian') {
        continue;
      }

      if (stat.isDirectory()) {
        results = results.concat(this.globFilesRecursively(absPath, rootDir));
      } else {
        results.push(relative.replace(/\\/g, '/'));
      }
    }
    return results;
  }
}
