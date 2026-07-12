/**
 * ProvisioningEnvelopeAdapter.js
 * 
 * Modulo encargado de normalizar las peticiones HTTP del Bridge
 * al envelope canonico de aprovisionamiento (blueprint + execution + root params).
 */

import { normalizeProvisioningRequest } from './BlueprintAdapter.js';

const CANONICAL_BLUEPRINT_KEYS = new Set([
  'blueprintVersion', 'instanceId', 'clientName', 'coreType', 'vertical',
  'branding', 'features', 'components', 'patterns'
]);

const INFRASTRUCTURE_KEYS = new Set([
  'telemetryToken', 'logoPath', 'adminEmail', 'adminPassword', 'customPort',
  'whatsappAdmin', 'storeAddress', 'autoProvisionFirebase', 'customPrimary',
  'customAccent', 'firebaseApiKey', 'firebaseAuthDomain', 'firebaseProjectId',
  'firebaseStorageBucket', 'firebaseMessagingSenderId', 'firebaseAppId',
  'centralApiKey', 'centralMessagingSenderId', 'centralAppId', 'customRequirements',
  'seoTitle', 'seoDescription', 'seoKeywords', 'billingMode', 'comisionPorcentaje',
  'montoFijoServicio', 'pagoMensualFijo', 'setupFee', 'enableDianBilling',
  'costoPorFacturaDian', 'selectedRecomendations', 'flags', 'developerGoogleToken'
]);

/**
 * Normaliza el body de la peticion HTTP a la estructura canonica.
 * @param {Object} body Cuerpo de la peticion HTTP
 * @returns {Object} Envelope normalizado
 */
export function normalizeProvisioningEnvelope(body) {
  if (!body || typeof body !== 'object') {
    throw new Error('El cuerpo de la peticion no es un objeto valido.');
  }

  const isNested = !!(body.blueprint && typeof body.blueprint === 'object');

  if (isNested) {
    const { blueprint, execution, ...rest } = body;
    
    // Validar conflictos de aliases legacy en la raiz contra el blueprint canonico
    const checkConflict = (legacyKey, canonicalValue) => {
      let legacyValue = body[legacyKey];
      if (legacyValue !== undefined && canonicalValue !== undefined) {
        if (legacyKey === 'projectName' || legacyKey === 'clientId') {
          let legacyValStr = typeof legacyValue === 'string' ? legacyValue.trim() : legacyValue;
          let canonicalValStr = typeof canonicalValue === 'string' ? canonicalValue.trim() : canonicalValue;
          if (legacyValStr !== canonicalValStr) {
            throw new Error(`Conflicto: Valores inconsistentes entre "${legacyKey}" legacy y campo canonico.`);
          }
        } else if (legacyValue !== canonicalValue) {
          throw new Error(`Conflicto: Valores inconsistentes entre alias legacy "${legacyKey}" y campo canonico.`);
        }
      }
    };

    if (blueprint) {
      checkConflict('clientId', blueprint.instanceId);
      checkConflict('projectName', blueprint.clientName);
      checkConflict('version', blueprint.blueprintVersion);
      checkConflict('niche', blueprint.vertical);
      checkConflict('template', blueprint.coreType);
      
      const legacyPalette = body.paletteChoice;
      const canonicalPalette = blueprint.branding?.paletteChoice || blueprint.paletteChoice;
      if (legacyPalette !== undefined && canonicalPalette !== undefined && legacyPalette !== canonicalPalette) {
        throw new Error('Conflicto: Valores inconsistentes para "paletteChoice".');
      }
    }

    // Validar execution
    const allowedExecutionKeys = new Set([
      'targetPath', 'force', 'enableGithub', 'firebaseDeploy', 'centralRegistration'
    ]);
    for (const key of Object.keys(execution || {})) {
      if (execution[key] !== undefined && !allowedExecutionKeys.has(key)) {
        throw new Error(`REJECTED: Campo desconocido en ejecucion: "${key}".`);
      }
    }

    return {
      blueprint: blueprint ? { ...blueprint } : {},
      execution: execution ? { ...execution } : {},
      ...rest
    };
  } else {
    const { blueprint: normalizedBlueprint, execution, warnings } = normalizeProvisioningRequest(body);

    const blueprint = {};
    const rootParams = {};

    // Extraer campos de infraestructura conocidos del body original
    for (const key of Object.keys(body)) {
      if (INFRASTRUCTURE_KEYS.has(key)) {
        rootParams[key] = body[key];
      }
    }

    // Clasificar campos del blueprint normalizado
    for (const key of Object.keys(normalizedBlueprint)) {
      if (INFRASTRUCTURE_KEYS.has(key)) {
        rootParams[key] = normalizedBlueprint[key];
      } else {
        blueprint[key] = normalizedBlueprint[key];
      }
    }

    return {
      blueprint,
      execution,
      warnings,
      ...rootParams
    };
  }
}
