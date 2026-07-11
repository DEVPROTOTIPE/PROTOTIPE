import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');

export class CapabilityResolver {
  /**
   * Traduce una lista de capacidades en features, componentes y patrones iniciales.
   * @param {Array<string>} requestedCapabilities
   * @returns {Promise<Object>} Resultado de la resolución con explicaciones
   */
  static async resolve(requestedCapabilities) {
    console.log('🧠 [CapabilityResolver] Iniciando resolución de capacidades...');
    const capabilityMapPath = path.join(CLI_ROOT, 'knowledge', 'capabilities', 'capability-map.json');
    
    if (!await fs.pathExists(capabilityMapPath)) {
      throw new Error(`Falta el archivo crítico del mapa de capacidades en: ${capabilityMapPath}`);
    }

    const { capabilities: catalog } = await fs.readJson(capabilityMapPath);
    
    const features = new Set();
    const components = new Set();
    const patterns = new Set();
    const auditTrail = [];

    requestedCapabilities.forEach(cap => {
      const entry = catalog[cap];
      if (entry) {
        // Registrar features
        entry.resolvesFeatures.forEach(feat => {
          if (!features.has(feat)) {
            features.add(feat);
            auditTrail.push({
              decision: `Feature "${feat}" recomendada`,
              source: "knowledge/capabilities/capability-map.json",
              reason: `Capacidad "${cap}" (${entry.displayName}) requerida por el negocio.`,
              confidence: 0.95
            });
          }
        });

        // Registrar componentes
        entry.resolvesComponents.forEach(comp => {
          if (!components.has(comp)) {
            components.add(comp);
            auditTrail.push({
              decision: `Componente "${comp}" recomendado`,
              source: "knowledge/capabilities/capability-map.json",
              reason: `Capacidad "${cap}" provee el componente de interfaz adecuado.`,
              confidence: 0.90
            });
          }
        });

        // Registrar patrones UX
        entry.resolvesPatterns.forEach(pat => {
          if (!patterns.has(pat)) {
            patterns.add(pat);
            auditTrail.push({
              decision: `Patrón UX "${pat}" recomendado`,
              source: "knowledge/capabilities/capability-map.json",
              reason: `Capacidad "${cap}" requiere el patrón de interacción correspondiente.`,
              confidence: 0.92
            });
          }
        });
      } else {
        console.warn(`⚠️  Capacidad solicitada no encontrada en el catálogo: "${cap}"`);
      }
    });

    return {
      features: Array.from(features),
      components: Array.from(components),
      patterns: Array.from(patterns),
      auditTrail
    };
  }
}
