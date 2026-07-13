const moduleLoaders = import.meta.glob('../../features/*/module.js', { import: 'default' });

/**
 * Retorna las features disponibles físicamente en el monorepo (build-time).
 * @returns {Record<string, () => Promise<any>>} Mapa de cargadores lazy por featureId
 */
export function getAvailableFeatureModules() {
  return Object.fromEntries(
    Object.entries(moduleLoaders)
      .map(([path, loader]) => {
        // Extrae el featureId del path: ../../features/{featureId}/module.js
        const parts = path.split('/');
        const featureId = parts[parts.length - 2] || null;
        return [featureId, loader];
      })
      .filter(([id]) => id !== null)
  );
}

/**
 * Carga de forma asíncrona un módulo de feature específico.
 * Valida el contrato físico de ID para evitar desvíos o manipulaciones.
 * @param {string} featureId - ID canónico de la feature en kebab-case
 * @returns {Promise<any>} Definición resuelta de la feature
 */
export async function loadFeatureModule(featureId) {
  const loaders = getAvailableFeatureModules();
  const loader = loaders[featureId];

  if (!loader) {
    throw new Error(`[FeatureModuleLoader] No se encontró el entrypoint module.js para la feature "${featureId}"`);
  }

  const featureModule = await loader();

  // Validar contrato de ID físico
  if (featureModule?.manifest?.featureId && featureModule.manifest.featureId !== featureId) {
    throw new Error(`[FeatureModuleLoader] Colisión técnica: El ID del manifiesto físico "${featureModule.manifest.featureId}" no coincide con el featureId del path "${featureId}"`);
  }

  return featureModule;
}
