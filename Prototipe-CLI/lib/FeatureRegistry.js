import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_PATH = path.join(__dirname, '..', 'knowledge', 'feature-registry.json');

export class FeatureRegistry {
  /**
   * Carga el registro completo de features.
   * @returns {Promise<Object[]>}
   */
  static async getAll() {
    try {
      if (!(await fs.pathExists(REGISTRY_PATH))) {
        throw new Error(`Registro de features no encontrado en la ruta: ${REGISTRY_PATH}`);
      }
      const data = await fs.readJson(REGISTRY_PATH);
      return data.features || [];
    } catch (err) {
      console.error('❌ Error al cargar FeatureRegistry:', err);
      return [];
    }
  }

  /**
   * Resuelve una feature por su ID único.
   * @param {string} featureId 
   * @returns {Promise<Object|null>}
   */
  static async resolve(featureId) {
    const features = await this.getAll();
    return features.find(f => f.id === featureId) || null;
  }

  /**
   * Resuelve la ruta física local de una feature.
   * @param {string} featureId 
   * @returns {Promise<string|null>}
   */
  static async resolvePhysicalPath(featureId) {
    const feature = await this.resolve(featureId);
    if (!feature || !feature.physicalPaths || feature.physicalPaths.length === 0) {
      return null;
    }

    const cliRoot = path.join(__dirname, '..');
    
    // Iterar en orden prioritario sobre las rutas físicas locales declaradas
    for (const relativePath of feature.physicalPaths) {
      const absolutePath = path.join(cliRoot, relativePath);
      if (await fs.pathExists(absolutePath)) {
        return absolutePath;
      }
    }

    return null;
  }

  /**
   * Retorna las features correspondientes a una lista de capabilities.
   * @param {string[]} capabilities 
   * @returns {Promise<string[]>}
   */
  static async getByCapabilities(capabilities) {
    const features = await this.getAll();
    const resolvedIds = new Set();

    for (const feat of features) {
      const matches = feat.capabilities.some(cap => capabilities.includes(cap));
      if (matches) {
        resolvedIds.add(feat.id);
      }
    }

    return Array.from(resolvedIds);
  }
}
