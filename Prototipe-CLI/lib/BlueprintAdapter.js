/**
 * BlueprintAdapter.js
 * 
 * Adapta y normaliza payloads legacy y canónicos de aprovisionamiento
 * a la estructura de contrato unificada (blueprint + execution).
 */

/**
 * Normaliza una petición de aprovisionamiento (payload) en un envelope canónico.
 * @param {Object} payload Petición de entrada (canónica o legacy plana)
 * @returns {{ blueprint: Object, execution: Object, warnings: Array }}
 */
export function normalizeProvisioningRequest(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('El payload de aprovisionamiento no es un objeto válido.');
  }

  const warnings = [];

  // 1. Determinar si viene en formato anidado { blueprint, execution } o plano legacy
  let rawBlueprint = {};
  let rawExecution = {};

  if (payload.blueprint && typeof payload.blueprint === 'object') {
    rawBlueprint = { ...payload.blueprint };
    rawExecution = { ...payload.execution };
  } else {
    // Si viene plano legacy, separamos las propiedades de ejecución de las de blueprint
    rawBlueprint = { ...payload };
    rawExecution = {
      targetPath: payload.targetPath,
      force: payload.force,
      enableGithub: payload.enableGithub,
      firebaseDeploy: payload.firebaseDeploy,
      centralRegistration: payload.centralRegistration
    };
  }

  // 2. Extraer y estructurar branding de forma limpia
  const branding = rawBlueprint.branding ? { ...rawBlueprint.branding } : {};

  // 3. Resolver alias: paletteChoice (raíz) -> branding.paletteChoice
  if (rawBlueprint.paletteChoice !== undefined) {
    if (branding.paletteChoice !== undefined) {
      if (rawBlueprint.paletteChoice !== branding.paletteChoice) {
        throw new Error('Conflicto: Se especificaron valores diferentes para "paletteChoice" (raíz) y "branding.paletteChoice".');
      }
      warnings.push({
        code: 'DEPRECATED_FIELD',
        field: 'paletteChoice',
        replacement: 'branding.paletteChoice'
      });
    } else {
      branding.paletteChoice = rawBlueprint.paletteChoice;
      warnings.push({
        code: 'DEPRECATED_FIELD',
        field: 'paletteChoice',
        replacement: 'branding.paletteChoice'
      });
    }
  }

  // 4. Resolver aliases legacy principales
  const resolveAlias = (canonicalKey, legacyKey) => {
    let canonicalVal = rawBlueprint[canonicalKey];
    let legacyVal = rawBlueprint[legacyKey];

    // Tratar casos de trim enprojectName/clientName antes de comparar
    if (canonicalKey === 'clientName' || legacyKey === 'projectName') {
      if (typeof canonicalVal === 'string') canonicalVal = canonicalVal.trim();
      if (typeof legacyVal === 'string') legacyVal = legacyVal.trim();
    }

    if (legacyVal !== undefined) {
      if (canonicalVal !== undefined) {
        if (canonicalVal !== legacyVal) {
          throw new Error(`Conflicto: Valores inconsistentes entre campo canónico "${canonicalKey}" y alias legacy "${legacyKey}".`);
        }
        warnings.push({
          code: 'DEPRECATED_FIELD',
          field: legacyKey,
          replacement: canonicalKey
        });
      } else {
        canonicalVal = legacyVal;
        warnings.push({
          code: 'DEPRECATED_FIELD',
          field: legacyKey,
          replacement: canonicalKey
        });
      }
    }
    return canonicalVal;
  };

  const instanceId = resolveAlias('instanceId', 'clientId');
  const clientName = resolveAlias('clientName', 'projectName');
  const blueprintVersion = resolveAlias('blueprintVersion', 'version');
  const vertical = resolveAlias('vertical', 'niche');

  // Si niche/vertical contiene estados del wizard, se rechaza
  const forbiddenVerticals = ['general', 'general_custom', 'servicio_mesa', 'vacio'];
  if (forbiddenVerticals.includes(vertical)) {
    throw new Error(`La vertical o nicho legacy contiene un estado del wizard "${vertical}", el cual no es una vertical canónica válida.`);
  }

  const coreType = rawBlueprint.coreType !== undefined ? rawBlueprint.coreType : rawBlueprint.template;
  if (rawBlueprint.template !== undefined && rawBlueprint.coreType !== undefined && rawBlueprint.template !== rawBlueprint.coreType) {
    throw new Error('Conflicto: Valores inconsistentes entre "coreType" y "template".');
  }
  if (rawBlueprint.template !== undefined) {
    warnings.push({
      code: 'DEPRECATED_FIELD',
      field: 'template',
      replacement: 'coreType'
    });
  }

  // 5. Construir el Blueprint canónico limpio
  const blueprint = {};

  if (blueprintVersion !== undefined) blueprint.blueprintVersion = blueprintVersion;
  if (instanceId !== undefined) blueprint.instanceId = instanceId;
  if (clientName !== undefined) blueprint.clientName = clientName;
  if (coreType !== undefined) blueprint.coreType = coreType;
  if (vertical !== undefined) blueprint.vertical = vertical;

  // Solo inyectar branding si tiene propiedades definidas (excluyendo initials que no pertenece)
  if (Object.keys(branding).length > 0) {
    // initials no debe ser copiado ni insertado en el blueprint canónico
    const { initials, ...cleanBranding } = branding;
    blueprint.branding = cleanBranding;
  }

  // Features, componentes y patrones
  blueprint.features = Array.isArray(rawBlueprint.features) ? [...rawBlueprint.features] : [];
  blueprint.components = Array.isArray(rawBlueprint.components) ? [...rawBlueprint.components] : [];
  blueprint.patterns = Array.isArray(rawBlueprint.patterns) ? [...rawBlueprint.patterns] : [];

  // 6. Construir objeto de Execution canónico
  const execution = {
    targetPath: rawExecution.targetPath,
    force: !!rawExecution.force,
    enableGithub: !!rawExecution.enableGithub,
    firebaseDeploy: !!rawExecution.firebaseDeploy,
    centralRegistration: !!rawExecution.centralRegistration
  };

  return {
    blueprint,
    execution,
    warnings
  };
}
