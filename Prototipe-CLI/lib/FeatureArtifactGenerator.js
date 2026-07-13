import fs from 'fs-extra';
import path from 'path';

export class FeatureArtifactGenerator {
  /**
   * @param {string} registryPath - Ruta al feature-registry.json central
   */
  constructor(registryPath) {
    this.registryPath = registryPath;
    this.version = '1.0.0';
  }

  /**
   * Genera todos los artefactos de catálogo y manifiestos en el proyecto destino.
   * @param {string} targetProjectDir - Directorio raíz del proyecto React (ej. Plantillas Core/App Ventas)
   */
  async generate(targetProjectDir) {
    if (!(await fs.pathExists(this.registryPath))) {
      throw new Error(`[FeatureArtifactGenerator] No se encontró el registro central en: ${this.registryPath}`);
    }

    const registryData = await fs.readJson(this.registryPath);
    const generatedAt = new Date().toISOString();

    const manifest = {
      generatorVersion: this.version,
      registryVersion: registryData.version || '1.0.0',
      generatedAt,
      features: {}
    };

    const catalog = {
      generatorVersion: this.version,
      registryVersion: registryData.version || '1.0.0',
      generatedAt,
      features: []
    };

    const defaults = {
      generatorVersion: this.version,
      registryVersion: registryData.version || '1.0.0',
      generatedAt,
      defaults: {}
    };

    // Mapeo heredado de alias para la base tradicional
    const legacyAliases = {
      'credits': ['creditsEnabled'],
      'claims': ['claimsEnabled'],
      'coupons': ['couponsEnabled'],
      'delivery': ['rolesOperativosEnabled'],
      'orders': ['onlineOrdersEnabled']
    };

    // Fallbacks de navegación para módulos tradicionales de la base
    const legacyNavigationFallbacks = {
      'credits': {
        adminMenu: [
          { label: 'Crédito (Fiados)', path: '/admin/credito', icon: 'CreditCard' }
        ],
        clientMenu: [
          { label: 'Mis Créditos', path: '/tienda/creditos' }
        ]
      },
      'claims': {
        adminMenu: [
          { label: 'Garantías', path: '/admin/reclamos', icon: 'ShieldAlert' }
        ],
        clientMenu: []
      },
      'delivery': {
        adminMenu: [
          { label: 'Portales Operativos', path: '/admin/portales', icon: 'QrCode' }
        ],
        clientMenu: []
      },
      'orders': {
        adminMenu: [
          { label: 'Pedidos', path: '/admin/pedidos', icon: 'ListOrdered' }
        ],
        clientMenu: [
          { label: 'Mis Pedidos', path: '/tienda/pedidos' }
        ]
      },
      'inventory': {
        adminMenu: [
          { label: 'Inventario', path: '/admin/inventario', icon: 'Package' }
        ],
        clientMenu: []
      },
      'sales': {
        adminMenu: [
          { label: 'Vender (POS)', path: '/admin/ventas', icon: 'ShoppingCart' }
        ],
        clientMenu: []
      }
    };

    for (const feature of registryData.features || []) {
      const featureId = feature.id;
      const featureDir = path.join(targetProjectDir, 'src', 'features', featureId);

      // Si la feature no está instalada físicamente en la instancia cliente, omitirla de los manifiestos locales
      if (!(await fs.pathExists(featureDir))) {
        continue;
      }

      // 1. Construir core-manifest
      manifest.features[featureId] = {
        id: featureId,
        enabledByDefault: feature.status === 'stable',
        legacyRemoteKeys: legacyAliases[featureId] || []
      };

      // 2. Construir catálogo de navegación
      let navigation = legacyNavigationFallbacks[featureId] || { adminMenu: [], clientMenu: [] };
      const manifestLocalPath = path.join(featureDir, 'implementation.manifest.json');

      if (await fs.pathExists(manifestLocalPath)) {
        try {
          const localManifest = await fs.readJson(manifestLocalPath);
          if (localManifest.navigation) {
            navigation = localManifest.navigation;
          }
        } catch (err) {
          console.warn(`[FeatureArtifactGenerator] Advertencia al leer manifest local de ${featureId}:`, err.message);
        }
      }

      catalog.features.push({
        id: featureId,
        displayName: feature.displayName,
        description: feature.description,
        category: feature.category,
        tags: feature.tags || [],
        navigation
      });

      // 3. Construir defaults de parámetros
      defaults.defaults[featureId] = feature.defaultConfiguration || {};
    }

    // Escribir los artefactos en el target de forma determinista
    const generatedDir = path.join(targetProjectDir, 'src', 'core', 'generated');
    await fs.ensureDir(generatedDir);

    await fs.writeJson(
      path.join(generatedDir, 'core-manifest.generated.json'),
      manifest,
      { spaces: 2 }
    );

    await fs.writeJson(
      path.join(generatedDir, 'feature-catalog.generated.json'),
      catalog,
      { spaces: 2 }
    );

    await fs.writeJson(
      path.join(generatedDir, 'feature-defaults.generated.json'),
      defaults,
      { spaces: 2 }
    );

    console.log(`[FeatureArtifactGenerator] Artefactos generados exitosamente en: ${generatedDir}`);
  }
}
