/**
 * ProvisioningValidator.js
 * 
 * Cooridinador central de validación estructural y semántica de Blueprints.
 * Compila el schema AJV y coordina las reglas de negocio físicas de la Knowledge Layer.
 */

import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import { normalizeProvisioningRequest } from './BlueprintAdapter.js';
import { isValidCanonicalBlueprintSemver, isValidCanonicalHsl } from './BlueprintFormats.js';
import { BlueprintCatalogResolver } from './BlueprintCatalogResolver.js';
import { PackageMerger } from './PackageMerger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, '..');

// Exportar normalizeProvisioningRequest para compatibilidad de interfaz
export { normalizeProvisioningRequest };

// 1. Cargar el esquema JSON de forma síncrona al inicializar el módulo
const schemaPath = path.join(CLI_ROOT, 'knowledge', 'schema', 'blueprint.schema.json');
const blueprintSchema = fs.readJsonSync(schemaPath);

// 2. Compilar AJV una sola vez
const ajv = new Ajv({
  strict: true,
  allErrors: true,
  coerceTypes: false,
  removeAdditional: false,
  useDefaults: false
});

// Registrar formatos personalizados
ajv.addFormat('blueprint-semver', {
  type: 'string',
  validate: isValidCanonicalBlueprintSemver
});

ajv.addFormat('hsl-color', {
  type: 'string',
  validate: isValidCanonicalHsl
});

const validateSchema = ajv.compile(blueprintSchema);

// Versiones operativas de Blueprint oficialmente soportadas
const SUPPORTED_BLUEPRINT_VERSIONS = Object.freeze(['1.0.0']);

export class ProvisioningValidator {
  /**
   * Valida la estructura AJV y la coherencia lógica de un Blueprint contra la Knowledge Layer.
   * @param {Object} blueprint Blueprint canónico a validar
   * @param {Object} [basePackageJson] Dependencias base
   * @param {Object} [ctx] Opciones de contexto para pruebas de catálogos ausentes/inválidos
   * @returns {Promise<Object>} Resultado de la validación
   */
  static async validate(blueprint, basePackageJson = { dependencies: {} }, ctx = {}) {
    const errors = [];
    const warnings = [];
    const featuresMetadatas = [];
    const componentsMetadatas = [];
    const patternsMetadatas = [];

    // Validar esquema básico para evitar fallas
    if (!blueprint || typeof blueprint !== 'object') {
      errors.push('El Application Blueprint no está definido o no es un objeto válido.');
      return {
        isValid: false,
        errors,
        warnings,
        featuresMetadatas,
        componentsMetadatas,
        patternsMetadatas
      };
    }

    const instanceLogName = blueprint.instanceId || 'unknown';
    console.log(`🛡️  [ProvisioningValidator] Validando Blueprint para: ${instanceLogName}...`);

    // 3. Validar Estructura con AJV
    const valid = validateSchema(blueprint);
    if (!valid) {
      const issues = validateSchema.errors.map(err => ({
        path: err.instancePath,
        keyword: err.keyword,
        message: err.message
      }));
      
      // Normalizar mensajes para consumo plano compatible con tests
      issues.forEach(issue => {
        errors.push(`[schema] ${issue.path || '/'}: ${issue.keyword} - ${issue.message}`);
      });

      return {
        isValid: false,
        errors,
        warnings,
        issues,
        code: 'BLUEPRINT_SCHEMA_INVALID',
        featuresMetadatas,
        componentsMetadatas,
        patternsMetadatas
      };
    }

    // 4. Validar versión de Blueprint soportada
    if (!SUPPORTED_BLUEPRINT_VERSIONS.includes(blueprint.blueprintVersion)) {
      errors.push(`La versión de Blueprint "${blueprint.blueprintVersion}" no está soportada. Versiones soportadas: [${SUPPORTED_BLUEPRINT_VERSIONS.join(', ')}]`);
    }

    // 5. Validar coreType semántico
    try {
      await BlueprintCatalogResolver.validateCoreType(blueprint.coreType, ctx);
    } catch (err) {
      errors.push(err.message);
    }

    // 6. Validar vertical semántica
    try {
      await BlueprintCatalogResolver.validateVertical(blueprint.vertical, ctx);
    } catch (err) {
      errors.push(err.message);
    }

    // 7. Cargar y validar Features de la Knowledge Layer
    for (const featId of blueprint.features) {
      try {
        const meta = await BlueprintCatalogResolver.validateFeature(featId, ctx);
        featuresMetadatas.push(meta);
      } catch (err) {
        errors.push(err.message);
      }
    }

    // 8. Cargar y validar Componentes de la Knowledge Layer
    for (const compId of blueprint.components) {
      try {
        const meta = await BlueprintCatalogResolver.validateComponent(compId, ctx);
        componentsMetadatas.push(meta);
      } catch (err) {
        errors.push(err.message);
      }
    }

    // 9. Cargar y validar Patrones de la Knowledge Layer
    for (const patId of blueprint.patterns) {
      try {
        const meta = await BlueprintCatalogResolver.validatePattern(patId, ctx);
        patternsMetadatas.push(meta);
      } catch (err) {
        errors.push(err.message);
      }
    }

    // Si hubo errores resolviendo la existencia física, abortamos validación de dependencias cruzadas
    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
        warnings,
        featuresMetadatas,
        componentsMetadatas,
        patternsMetadatas
      };
    }

    // 10. Validar dependencias de Features requeridas
    featuresMetadatas.forEach(feat => {
      if (feat.dependencies) {
        feat.dependencies.forEach(dep => {
          if (!blueprint.features.includes(dep)) {
            errors.push(`La Feature "${feat.id}" requiere la Feature "${dep}", pero esta no se encuentra instalada en el Blueprint.`);
          }
        });
      }
    });

    // 11. Validar compatibilidad Feature / Componente
    componentsMetadatas.forEach(comp => {
      if (comp.requiredFeatures) {
        comp.requiredFeatures.forEach(reqFeat => {
          if (!blueprint.features.includes(reqFeat)) {
            errors.push(`El Componente "${comp.id}" requiere la Feature "${reqFeat}" instalada.`);
          }
        });
      }
    });

    // 12. Validar compatibilidad Feature / Patrón
    patternsMetadatas.forEach(pat => {
      if (pat.requiredFeatures) {
        pat.requiredFeatures.forEach(reqFeat => {
          if (!blueprint.features.includes(reqFeat)) {
            errors.push(`El Patrón "${pat.displayName}" requiere la Feature "${reqFeat}" instalada.`);
          }
        });
      }
    });

    // 13. Validar dependencias NPM y detectar conflictos cruzados
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
