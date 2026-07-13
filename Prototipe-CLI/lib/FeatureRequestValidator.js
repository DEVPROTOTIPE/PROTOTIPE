import { z } from 'zod';
import { FeatureDependencyGraph } from './FeatureDependencyGraph.js';

const kebabCaseRegex = /^[a-z0-9-]+$/;
const semverRegex = /^\d+\.\d+\.\d+$/;

const createFeatureRequestSchema = z.object({
  featureId: z.string().regex(kebabCaseRegex, {
    message: 'El featureId debe estar en minúsculas y formato kebab-case estricto.'
  }),
  displayName: z.string().min(1, 'El displayName no puede estar vacío.'),
  version: z.string().regex(semverRegex, {
    message: 'La versión debe ser de tipo semver X.Y.Z.'
  }),
  description: z.string().min(1, 'La descripción es requerida.'),
  category: z.string().min(1, 'La categoría es requerida.'),
  dependencies: z.array(z.string().regex(kebabCaseRegex)).default([]),
  compatibleIndustries: z.array(z.string()).default([]),
  npmDependencies: z.record(z.string()).default({}),
  defaultConfiguration: z.record(z.any()).default({}),
  tags: z.array(z.string()).default([]),
  navigation: z.object({
    adminMenu: z.array(z.object({
      label: z.string(),
      path: z.string().startsWith('/admin/'),
      icon: z.string()
    })).optional(),
    clientMenu: z.array(z.object({
      label: z.string(),
      path: z.string().startsWith('/tienda/')
    })).optional()
  }).optional(),
  currentRegistryHash: z.string().optional() // Hash enviado para control de planes stale
});

export class FeatureRequestValidator {
  /**
   * Valida la solicitud de creación de una nueva feature.
   * @param {Object} payload 
   * @param {Object[]} existingFeatures - Features actuales del registry
   * @returns {Object} { valid: boolean, error?: string, data?: Object }
   */
  static validateCreateRequest(payload, existingFeatures) {
    const parseResult = createFeatureRequestSchema.safeParse(payload);
    if (!parseResult.success) {
      return {
        valid: false,
        error: `Error de validación del esquema: ${parseResult.error.issues.map(i => i.message).join(', ')}`
      };
    }

    const data = parseResult.data;

    // 1. Validar colisión de ID canónico
    const colision = existingFeatures.some(f => f.id === data.featureId);
    if (colision) {
      return {
        valid: false,
        code: 'CONFLICT',
        error: `Conflicto técnico: El featureId "${data.featureId}" ya existe en el registro central.`
      };
    }

    // 2. Validar dependencias y ciclos
    const graph = new FeatureDependencyGraph(existingFeatures);
    
    const unresolved = graph.getUnresolvedDependencies(data.dependencies);
    if (unresolved.length > 0) {
      return {
        valid: false,
        error: `Dependencias no resueltas: Las siguientes dependencias no están registradas en el ecosistema: ${unresolved.join(', ')}`
      };
    }

    // Comprobar si al registrar esta feature e interconectarla se genera un ciclo
    // (Dado que es nueva, simular que existe en el grafo y validar)
    const simulatedFeatures = [...existingFeatures, { id: data.featureId, dependencies: data.dependencies }];
    try {
      const simulatedGraph = new FeatureDependencyGraph(simulatedFeatures);
      simulatedGraph.getInstallationOrder(); // Si lanza error de ciclo, hay ciclo
    } catch (err) {
      return {
        valid: false,
        error: `Ciclo de dependencias detectado: ${err.message}`
      };
    }

    return {
      valid: true,
      data
    };
  }
}
