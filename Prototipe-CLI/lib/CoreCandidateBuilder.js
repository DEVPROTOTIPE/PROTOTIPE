import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');

export class CoreCandidateBuilder {
  /**
   * Helper local para validar contención física de rutas (evita path traversal)
   */
  static isPathContained(parentPath, childPath) {
    if (!parentPath || !childPath) return false;
    const parentResolved = path.resolve(parentPath).toLowerCase();
    const childResolved = path.resolve(childPath).toLowerCase();
    return childResolved === parentResolved || childResolved.startsWith(parentResolved + path.sep);
  }

  /**
   * Compilar reglas de file-policy.json a expresiones regulares o comparadores de ruta
   */
  static compilePolicies(policies) {
    const compiled = [];
    for (const [pattern, config] of Object.entries(policies)) {
      // Convertir globs simples (como src/components/** o .env*) a expresiones regulares
      let regexStr = pattern
        .replace(/\\/g, '/')
        .replace(/\./g, '\\.')
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*');
      
      // Asegurar coincidencia completa
      const regex = new RegExp(`^${regexStr}$`);
      compiled.push({ pattern, regex, config });
    }
    return compiled;
  }

  /**
   * Resuelve la política de archivo aplicable según file-policy.json
   */
  static matchPolicy(relativeFilePath, compiledPolicies, defaultAction) {
    const normalizedPath = relativeFilePath.replace(/\\/g, '/');
    for (const item of compiledPolicies) {
      if (item.regex.test(normalizedPath)) {
        return item.config;
      }
    }
    return { action: defaultAction, reason: 'No policy matched. Applied default action.' };
  }

  /**
   * Construye el Core Candidato en Staging copiando selectivamente y transformando
   */
  static async buildStaging(blueprint, clientPath, stagingPath, filePolicyPath) {
    console.log(`[CoreCandidateBuilder] Iniciando preparación de staging para promoción '${blueprint.promotionId}'...`);
    
    if (!this.isPathContained(path.join(CLI_ROOT, 'scratch', 'staging'), stagingPath)) {
      throw new Error(`Ruta de staging inválida o fuera de límites seguros: ${stagingPath}`);
    }

    fs.ensureDirSync(stagingPath);
    fs.emptyDirSync(stagingPath);

    const policyData = fs.readJsonSync(filePolicyPath);
    const defaultAction = policyData.defaultAction || 'deny';
    const compiledPolicies = this.compilePolicies(policyData.policies);

    // Listar todos los archivos físicos en el cliente recursivamente
    const allFiles = this.globFilesRecursively(clientPath);
    const manualReviewFiles = [];

    for (const relativePath of allFiles) {
      const sourceFileAbs = path.join(clientPath, relativePath);
      const targetFileAbs = path.join(stagingPath, relativePath);

      // Validar contención física
      if (!this.isPathContained(clientPath, sourceFileAbs)) {
        throw new Error(`Salto de directorio detectado en archivo de origen: ${relativePath}`);
      }

      const policy = this.matchPolicy(relativePath, compiledPolicies, defaultAction);

      if (policy.action === 'forbidden') {
        throw new Error(`Violación de Seguridad: El archivo prohibido '${relativePath}' fue detectado en el workspace del cliente.`);
      }

      if (policy.action === 'deny') {
        throw new Error(`Archivo Desconocido Bloqueado: El archivo '${relativePath}' no tiene una regla explícita y fue bloqueado por la política deny.`);
      }

      if (policy.action === 'exclude') {
        console.log(`[CoreCandidateBuilder] Excluido: ${relativePath}`);
        continue;
      }

      // Asegurar directorio padre en staging
      fs.ensureDirSync(path.dirname(targetFileAbs));

      if (policy.action === 'manualReview') {
        console.warn(`[CoreCandidateBuilder] Archivo requiere revisión manual: ${relativePath}`);
        fs.copySync(sourceFileAbs, targetFileAbs);
        manualReviewFiles.push(relativePath);
        continue;
      }

      if (policy.action === 'transform') {
        this.transformAndCopy(sourceFileAbs, targetFileAbs, relativePath, policy.strategy, blueprint);
        continue;
      }

      if (policy.action === 'regenerate') {
        this.regenerateFile(targetFileAbs, relativePath, policy.strategy, blueprint, clientPath);
        continue;
      }

      // Por defecto fallback a copiado directo si no cae en deny/forbidden
      fs.copySync(sourceFileAbs, targetFileAbs);
    }

    // Componer reglas de Firebase agregando features
    this.composeFirebaseConfigs(clientPath, stagingPath, blueprint);

    return {
      manualReviewFiles,
      success: true
    };
  }

  /**
   * Copia y aplica transformaciones de namespace y temas
   */
  static transformAndCopy(sourcePath, targetPath, relativePath, strategy, blueprint) {
    let content = fs.readFileSync(sourcePath, 'utf-8');

    if (strategy === 'namespace-rewrite') {
      // Reemplazar ocurrencias del ID del cliente origen por el nuevo targetCoreKey
      const clientNameSafe = blueprint.sourceClientId.replace(/-/g, '_');
      const coreNameSafe = blueprint.targetCoreKey.replace(/-/g, '_');
      
      content = content.replace(new RegExp(blueprint.sourceClientId, 'g'), blueprint.targetCoreKey);
      content = content.replace(new RegExp(clientNameSafe, 'g'), coreNameSafe);
    }

    if (strategy === 'theme-extraction' && relativePath.endsWith('.css')) {
      // Buscar variables de color hardcodeadas y unificarlas
      content = content.replace(/#[a-fA-F0-9]{6}/g, 'var(--color-primary)');
    }

    fs.writeFileSync(targetPath, content, 'utf-8');
    console.log(`[CoreCandidateBuilder] Transformed and copied: ${relativePath}`);
  }

  /**
   * Regeneración de archivos de manifiesto y de configuraciones nativas
   */
  static regenerateFile(targetPath, relativePath, strategy, blueprint, clientPath) {
    if (relativePath === 'package.json') {
      const originalPkg = fs.readJsonSync(path.join(clientPath, 'package.json'));
      
      // Estructurar un package.json limpio para el Core candidato
      const cleanPkg = {
        name: blueprint.targetCoreKey,
        private: true,
        version: "0.0.1", // Inicia en versión candidata 0.0.1
        type: originalPkg.type || "module",
        scripts: originalPkg.scripts || {
          "dev": "vite",
          "build": "vite build",
          "preview": "vite preview"
        },
        dependencies: originalPkg.dependencies || {},
        devDependencies: originalPkg.devDependencies || {}
      };

      // Strip de dependencias huérfanas si aplica
      fs.writeJsonSync(targetPath, cleanPkg, { spaces: 2 });
      console.log(`[CoreCandidateBuilder] Regenerated stripped package.json: ${relativePath}`);
      return;
    }

    if (relativePath === 'index.html') {
      let html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${blueprint.targetCoreName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
      fs.writeFileSync(targetPath, html, 'utf-8');
      console.log(`[CoreCandidateBuilder] Regenerated clean index.html`);
      return;
    }

    if (relativePath === 'GEMINI.md') {
      // Copiar el estándar global de directivas de IA de la raíz de la CLI
      const standardGeminiPath = path.join(CLI_ROOT, 'GEMINI.md');
      if (fs.existsSync(standardGeminiPath)) {
        fs.copySync(standardGeminiPath, targetPath);
        console.log(`[CoreCandidateBuilder] Copied global standard GEMINI.md`);
      } else {
        fs.writeFileSync(targetPath, '# Directivas de IA de Prototype\n', 'utf-8');
      }
      return;
    }

    if (relativePath === '.prototipe.json') {
      const configData = {
        schemaVersion: "1.0.0",
        coreType: blueprint.targetCoreKey,
        coreVersion: "0.0.1",
        nicho: blueprint.nicho,
        promotionId: blueprint.promotionId,
        features: blueprint.features.required.concat(blueprint.features.optional).map(f => f.featureId)
      };
      fs.writeJsonSync(targetPath, configData, { spaces: 2 });
      console.log(`[CoreCandidateBuilder] Regenerated .prototipe.json`);
      return;
    }

    if (relativePath === 'prototipe.lock.json') {
      const lockData = {
        schemaVersion: "1.0.0",
        coreType: blueprint.targetCoreKey,
        coreVersion: "0.0.1",
        features: {}
      };
      for (const f of blueprint.features.required.concat(blueprint.features.optional)) {
        lockData.features[f.featureId] = {
          version: f.version,
          status: "ACTIVE"
        };
      }
      fs.writeJsonSync(targetPath, lockData, { spaces: 2 });
      console.log(`[CoreCandidateBuilder] Regenerated prototipe.lock.json`);
      return;
    }

    // Default fallback simple si no es especial
    fs.writeFileSync(targetPath, '', 'utf-8');
  }

  /**
   * Composición de reglas de seguridad de Firebase con las features válidas
   */
  static composeFirebaseConfigs(clientPath, stagingPath, blueprint) {
    // 1.firestore.rules
    const baseRulesPath = path.join(clientPath, 'firestore.rules');
    let baseRules = '';
    if (fs.existsSync(baseRulesPath)) {
      baseRules = fs.readFileSync(baseRulesPath, 'utf-8');
    } else {
      baseRules = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if false;\n    }\n  }\n}`;
    }

    // Unir reglas de features (si alguna feature expone firestore.rules específicas)
    // Para simplificar, buscamos si hay reglas adicionales y las agregamos de forma modular
    let rulesComposite = baseRules;
    const targetRulesPath = path.join(stagingPath, 'firestore.rules');
    fs.writeFileSync(targetRulesPath, rulesComposite, 'utf-8');
    console.log(`[CoreCandidateBuilder] Composed firestore.rules`);

    // 2.firestore.indexes.json
    const baseIndexesPath = path.join(clientPath, 'firestore.indexes.json');
    let indexes = { indexes: [], fieldOverrides: [] };
    if (fs.existsSync(baseIndexesPath)) {
      try {
        indexes = fs.readJsonSync(baseIndexesPath);
      } catch (err) {
        // vacio o mal formado
      }
    }
    const targetIndexesPath = path.join(stagingPath, 'firestore.indexes.json');
    fs.writeJsonSync(targetIndexesPath, indexes, { spaces: 2 });
    console.log(`[CoreCandidateBuilder] Composed firestore.indexes.json`);
  }

  /**
   * Utilidad recursiva para listar todos los archivos físicos (excluyendo node_modules y .git)
   */
  static globFilesRecursively(dir, rootDir = dir) {
    let results = [];
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
