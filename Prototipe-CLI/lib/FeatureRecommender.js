import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');

export class FeatureRecommender {
  /**
   * Resuelve de forma transitiva y recursiva todas las dependencias de features.
   * @param {Array<string>} initialFeatures
   * @returns {Promise<Object>} Resultado de la recomendación con dependencias agregadas y auditoría
   */
  static async resolveDependencies(initialFeatures) {
    console.log('📦 [FeatureRecommender] Resolviendo árbol de dependencias transitivas...');
    const resolvedFeatures = new Set(initialFeatures);
    const auditTrail = [];

    // Cola de features para evaluar recursivamente
    const queue = [...initialFeatures];

    while (queue.length > 0) {
      const featId = queue.shift();
      const featPath = path.join(CLI_ROOT, 'knowledge', 'features', `${featId}.json`);
      
      if (!await fs.pathExists(featPath)) {
        console.warn(`⚠️  Feature no encontrada en catálogo para resolución transitiva: "${featId}"`);
        continue;
      }

      const meta = await fs.readJson(featPath);
      
      if (meta.dependencies) {
        for (const dep of meta.dependencies) {
          if (!resolvedFeatures.has(dep)) {
            resolvedFeatures.add(dep);
            queue.push(dep); // Evaluar recursivamente las dependencias del hijo

            auditTrail.push({
              decision: `Feature "${dep}" auto-agregada`,
              source: `knowledge/features/${featId}.json`,
              reason: `Requerida como dependencia transitiva obligatoria por la Feature "${featId}".`,
              confidence: 1.0
            });
          }
        }
      }
    }

    return {
      features: Array.from(resolvedFeatures),
      auditTrail
    };
  }
}
