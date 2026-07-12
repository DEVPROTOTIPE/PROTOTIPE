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
  const isNestedFormat = !!(payload.blueprint && typeof payload.blueprint === 'object');
  let rawBlueprint = {};
  let rawExecution = {};

  if (isNestedFormat) {
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

  // 2. Validar que execution no contenga campos desconocidos
  const allowedExecutionKeys = new Set([
    'targetPath', 'force', 'enableGithub', 'firebaseDeploy', 'centralRegistration'
  ]);
  for (const key of Object.keys(rawExecution)) {
    if (rawExecution[key] !== undefined && !allowedExecutionKeys.has(key)) {
      throw new Error(`REJECTED: Campo desconocido en ejecución: "${key}".`);
    }
  }

  // 3. Extraer branding de forma limpia
  const branding = rawBlueprint.branding ? { ...rawBlueprint.branding } : {};

  // 4. Resolver alias: paletteChoice (raíz) -> branding.paletteChoice
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

  // 5. Resolver aliases legacy principales
  const resolveAlias = (canonicalKey, legacyKey) => {
    let canonicalVal = rawBlueprint[canonicalKey];
    let legacyVal = rawBlueprint[legacyKey];

    // Tratar casos de trim en projectName/clientName antes de comparar
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

  // 6. Construir el Blueprint canónico preservando campos desconocidos (evitando lavado de propiedades)
  const blueprint = { ...rawBlueprint };

  // Eliminar únicamente las propiedades legacy y execution que han sido mapeadas/extraídas
  const keysToDelete = new Set([
    'clientId', 'projectName', 'version', 'niche', 'paletteChoice', 'template'
  ]);
  if (!isNestedFormat) {
    keysToDelete.add('targetPath');
    keysToDelete.add('force');
    keysToDelete.add('enableGithub');
    keysToDelete.add('firebaseDeploy');
    keysToDelete.add('centralRegistration');
  }

  for (const key of keysToDelete) {
    delete blueprint[key];
  }

  // Sobrescribir/establecer con los valores canónicos resueltos
  if (blueprintVersion !== undefined) blueprint.blueprintVersion = blueprintVersion;
  if (instanceId !== undefined) blueprint.instanceId = instanceId;
  if (clientName !== undefined) blueprint.clientName = clientName;
  if (coreType !== undefined) blueprint.coreType = coreType;
  if (vertical !== undefined) blueprint.vertical = vertical;

  // Manejar branding preservando cualquier otra propiedad interna (y eliminando initials)
  if (rawBlueprint.branding && typeof rawBlueprint.branding === 'object') {
    blueprint.branding = { ...rawBlueprint.branding };
    delete blueprint.branding.initials;
  }
  if (branding.paletteChoice !== undefined) {
    blueprint.branding = blueprint.branding || {};
    blueprint.branding.paletteChoice = branding.paletteChoice;
  }

  // Asegurar arrays de features, components y patterns
  blueprint.features = Array.isArray(rawBlueprint.features) ? [...rawBlueprint.features] : [];
  blueprint.components = Array.isArray(rawBlueprint.components) ? [...rawBlueprint.components] : [];
  blueprint.patterns = Array.isArray(rawBlueprint.patterns) ? [...rawBlueprint.patterns] : [];

  // 7. Construir objeto de Execution canónico
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
