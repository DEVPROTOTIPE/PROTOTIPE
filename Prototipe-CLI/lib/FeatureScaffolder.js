import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates', 'feature-scaffold');

export class FeatureScaffolder {
  /**
   * Convierte una cadena kebab-case a PascalCase.
   * @param {string} str 
   * @returns {string}
   */
  static kebabToPascal(str) {
    return str
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  /**
   * Convierte una cadena kebab-case a UPPER_SNAKE_CASE.
   * @param {string} str 
   * @returns {string}
   */
  static kebabToUpperSnake(str) {
    return str.replace(/-/g, '_').toUpperCase();
  }

  /**
   * Ejecuta el scaffolding de la feature en el directorio destino.
   * @param {string} targetDir - Directorio raíz donde se inyectará la feature (ej. /src/features/customer-loyalty)
   * @param {Object} payload - Metadatos de la feature (featureId, displayName, version, dependencies, icon, etc.)
   */
  static async scaffold(targetDir, payload) {
    if (!(await fs.pathExists(TEMPLATE_DIR))) {
      throw new Error(`[FeatureScaffolder] No se encontró el directorio de plantillas en: ${TEMPLATE_DIR}`);
    }

    const { featureId, displayName, version = '1.0.0', dependencies = [], icon = 'HelpCircle' } = payload;
    const pascalName = this.kebabToPascal(featureId);
    const upperName = this.kebabToUpperSnake(featureId);

    // Limpiar directorio destino si existiese en staging
    await fs.remove(targetDir);
    await fs.ensureDir(targetDir);

    // Mapeo de renombrado dinámico de archivos
    const renameMap = {
      'components/AdminView.jsx': `components/Admin${pascalName}.jsx`,
      'components/ClientView.jsx': `components/Client${pascalName}.jsx`,
      'hooks/useFeature.js': `hooks/use${pascalName}.js`,
      'services/service.js': `services/${pascalName}Service.js`,
      'api/repository.js': `api/${pascalName}Repository.js`,
      'schemas/schemas.js': `schemas/${pascalName}Schemas.js`
    };

    // Escanear recursivamente la carpeta de plantillas y procesar cada archivo
    const scanDir = async (currentDir, relativePath = '') => {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const entryRelative = path.join(relativePath, entry.name);
        const entryAbsolute = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          await scanDir(entryAbsolute, entryRelative);
        } else if (entry.isFile()) {
          // Leer plantilla
          let content = await fs.readFile(entryAbsolute, 'utf8');

          // Reemplazar tokens
          content = content
            .split('{{featureId}}').join(featureId)
            .split('{{displayName}}').join(displayName)
            .split('{{version}}').join(version)
            .split('{{dependencies}}').join(JSON.stringify(dependencies))
            .split('{{icon}}').join(icon)
            .split('{{pascalName}}').join(pascalName)
            .split('{{upperName}}').join(upperName);

          // Determinar ruta destino final resolviendo el renombrado
          let destRelativePath = entryRelative;
          const normalizedRelative = entryRelative.replace(/\\/g, '/');

          if (renameMap[normalizedRelative]) {
            destRelativePath = renameMap[normalizedRelative];
          }

          const destAbsolute = path.join(targetDir, destRelativePath);
          await fs.ensureDir(path.dirname(destAbsolute));
          await fs.writeFile(destAbsolute, content, 'utf8');
        }
      }
    };

    await scanDir(TEMPLATE_DIR);
    console.log(`[FeatureScaffolder] Scaffolding de "${featureId}" completado exitosamente en: ${targetDir}`);
  }
}
