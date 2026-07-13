/**
 * FeatureManifestAdapter - Capa de normalización de contrato de Feature Flags
 * Permite soportar tanto manifiestos modernos (features{}) como legacy (featureFlags[])
 */

export function getNormalizedFeatures(manifest) {
  if (!manifest) return [];

  // Caso 1: Estructura moderna (manifest.features como diccionario)
  if (manifest.features && typeof manifest.features === 'object') {
    return Object.entries(manifest.features).map(([key, feature]) => {
      const id = feature.id ?? key;
      return {
        id,
        enabledByDefault: feature.enabledByDefault ?? false,
        remoteKey: feature.remoteKey ?? id,
        legacyRemoteKeys: Array.isArray(feature.legacyRemoteKeys) ? feature.legacyRemoteKeys : []
      };
    });
  }

  // Caso 2: Estructura legacy (manifest.featureFlags como array)
  if (Array.isArray(manifest.featureFlags)) {
    return manifest.featureFlags.map(flag => {
      return {
        id: flag.id,
        enabledByDefault: flag.default ?? false,
        remoteKey: flag.remoteKey ?? flag.id,
        legacyRemoteKeys: Array.isArray(flag.legacyRemoteKeys) ? flag.legacyRemoteKeys : []
      };
    });
  }

  return [];
}
