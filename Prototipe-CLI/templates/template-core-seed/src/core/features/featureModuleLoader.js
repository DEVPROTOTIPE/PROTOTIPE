// Cargador Dinámico de Módulos (Feature Loader) de la Aplicación
// Escanea mediante import.meta.glob de Vite los entrypoints en src/features/*/module.js

const modules = import.meta.glob('../../features/*/module.js');

export class FeatureModuleLoader {
  /**
   * Resuelve y carga asíncronamente todos los módulos de features activas en el sistema.
   * @param {string[]} enabledFeatureIds - Lista de IDs de features activas
   * @returns {Promise<Array<{ id: string, routes: Array, adminMenu?: Object, clientMenu?: Object }>>}
   */
  static async loadActiveFeatures(enabledFeatureIds) {
    const loadedFeatures = [];
    const activeSet = new Set(enabledFeatureIds);

    for (const [path, resolver] of Object.entries(modules)) {
      // Extraer el nombre físico del directorio (ej: ../../features/customer-loyalty/module.js -> customer-loyalty)
      const pathParts = path.split('/');
      const physicalId = pathParts[pathParts.length - 2];

      if (activeSet.has(physicalId)) {
        try {
          const moduleWrapper = await resolver();
          const featureModule = moduleWrapper.default || moduleWrapper;

          // Validación de Contrato Estricta: El ID físico del directorio debe coincidir con el manifest
          const manifest = featureModule.manifest || {};
          const manifestId = manifest.featureId || manifest.id;

          if (manifestId !== physicalId) {
            console.error(`[FeatureLoader] Fallo de paridad de contrato: El directorio físico "${physicalId}" no coincide con el featureId del manifiesto "${manifestId}" en ${path}`);
            continue;
          }

          loadedFeatures.push({
            id: physicalId,
            routes: featureModule.routes || [],
            adminMenu: manifest.navigation?.adminMenu || null,
            clientMenu: manifest.navigation?.clientMenu || null,
            module: featureModule
          });
        } catch (err) {
          console.error(`[FeatureLoader] Error al inicializar el módulo de feature en ${path}:`, err);
        }
      }
    }

    return loadedFeatures;
  }
}
