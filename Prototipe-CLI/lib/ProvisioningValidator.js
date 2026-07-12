import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { PackageMerger } from './PackageMerger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');

export class ProvisioningValidator {
  /**
   * Valida la coherencia lógica de un Application Blueprint contra la Knowledge Layer.
   * @param {Object} blueprint
   * @param {Object} basePackageJson Plantilla de dependencias base
   * @returns {Promise<Object>} Resultado de la validación
   */
  static async validate(blueprint, basePackageJson = { dependencies: {} }) {
    console.log(`🛡️  [ProvisioningValidator] Validando Blueprint para: ${blueprint ? (blueprint.clientId || blueprint.instanceId || 'unknown') : 'unknown'}...`);
    const errors = [];
    const warnings = [];

    // Validar esquema básico del blueprint para evitar fallos de ejecución
    if (!blueprint || typeof blueprint !== 'object') {
      errors.push('El Application Blueprint no está definido o no es un objeto válido.');
      return {
        isValid: false,
        errors,
        warnings,
        featuresMetadatas: [],
        componentsMetadatas: [],
        patternsMetadatas: []
      };
    }

    if (!blueprint.clientId && !blueprint.instanceId) {
      errors.push('El Blueprint debe definir "clientId" o "instanceId" con un identificador válido.');
    }

    if (!Array.isArray(blueprint.features)) {
      errors.push('La propiedad "features" del Blueprint debe ser un array válido.');
    }

    if (!Array.isArray(blueprint.components)) {
      errors.push('La propiedad "components" del Blueprint debe ser un array válido.');
    }

    if (!Array.isArray(blueprint.patterns)) {
      errors.push('La propiedad "patterns" del Blueprint debe ser un array válido.');
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
        warnings,
        featuresMetadatas: [],
        componentsMetadatas: [],
        patternsMetadatas: []
      };
    }


    const featuresMetadatas = [];
    const componentsMetadatas = [];
    const patternsMetadatas = [];

    // 1. Validar existencia y cargar metadatos de Features
    for (const featId of blueprint.features) {
      const featPath = path.join(CLI_ROOT, 'knowledge', 'features', `${featId}.json`);
      if (!await fs.pathExists(featPath)) {
        errors.push(`La Feature "${featId}" declarada en el Blueprint no existe en la Knowledge Layer.`);
        continue;
      }
      const meta = await fs.readJson(featPath);
      featuresMetadatas.push(meta);
    }

    // 2. Validar existencia y cargar metadatos de Componentes
    for (const compId of blueprint.components) {
      // Buscar el archivo JSON del componente (convertir de camelCase a kebab-case si es necesario o por coincidencia directa)
      const compFileName = compId.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      const compPath = path.join(CLI_ROOT, 'knowledge', 'components', `${compFileName}.json`);
      if (!await fs.pathExists(compPath)) {
        errors.push(`El Componente "${compId}" (archivo ${compFileName}.json) no existe en la Knowledge Layer.`);
        continue;
      }
      const meta = await fs.readJson(compPath);
      componentsMetadatas.push(meta);
    }

    // 3. Validar existencia y cargar metadatos de Patrones
    for (const patId of blueprint.patterns) {
      const patPath = path.join(CLI_ROOT, 'knowledge', 'patterns', `${patId.replace('pattern-', '')}.json`);
      if (!await fs.pathExists(patPath)) {
        errors.push(`El Patrón "${patId}" no existe en la Knowledge Layer.`);
        continue;
      }
      const meta = await fs.readJson(patPath);
      patternsMetadatas.push(meta);
    }

    // 4. Validar dependencias de Features requeridas
    featuresMetadatas.forEach(feat => {
      if (feat.dependencies) {
        feat.dependencies.forEach(dep => {
          if (!blueprint.features.includes(dep)) {
            errors.push(`La Feature "${feat.id}" requiere la Feature "${dep}", pero esta no se encuentra instalada en el Blueprint.`);
          }
        });
      }
    });

    // 5. Validar compatibilidad Feature / Componente
    componentsMetadatas.forEach(comp => {
      if (comp.requiredFeatures) {
        comp.requiredFeatures.forEach(reqFeat => {
          if (!blueprint.features.includes(reqFeat)) {
            errors.push(`El Componente "${comp.id}" requiere la Feature "${reqFeat}" instalada.`);
          }
        });
      }
    });

    // 6. Validar compatibilidad Feature / Patrón
    patternsMetadatas.forEach(pat => {
      if (pat.requiredFeatures) {
        pat.requiredFeatures.forEach(reqFeat => {
          if (!blueprint.features.includes(reqFeat)) {
            errors.push(`El Patrón "${pat.displayName}" requiere la Feature "${reqFeat}" instalada.`);
          }
        });
      }
    });

    // 7. Validar dependencias NPM y detectar conflictos cruzados
    try {
      PackageMerger.merge(featuresMetadatas, componentsMetadatas, basePackageJson);
    } catch (err) {
      errors.push(`Conflicto de Dependencias NPM: ${err.message}`);
    }

    const isValid = errors.length === 0;
    return {
      isValid,
      errors,
      warnings,
      featuresMetadatas,
      componentsMetadatas,
      patternsMetadatas
    };
  }
}
