import { LifecycleManager, LIFECYCLE_STATES } from './FeatureLifecycleManager'
import { Telemetry } from '../contracts/telemetryContract'
import { NavigationRegistry } from '../config/NavigationRegistry'

// Escaneo en tiempo de compilación por Vite de todos los manifiestos de features
const FEATURE_GLOB = import.meta.glob('../../features/*/module.js')

class FeatureLoaderClass {
  constructor() {
    this.loadedFeatures = {}
    this.initializationOrder = []
  }

  /**
   * Carga y resuelve topológicamente las features indicadas.
   * @param {string[]} activeFeatures - Array de IDs de features activas
   */
  async load(activeFeatures) {
    console.log('[FeatureLoader] Inicializando carga de features:', activeFeatures)
    
    // 1. Cargar físicamente los manifiestos module.js
    const manifests = {}
    for (const id of activeFeatures) {
      const key = `../../features/${id}/module.js`
      const loadFn = FEATURE_GLOB[key]
      if (!loadFn) {
        console.warn(`[FeatureLoader] No se encontró el manifiesto para la feature: "${id}" en la ruta "${key}"`)
        continue
      }
      try {
        const mod = await loadFn()
        manifests[id] = mod.default
      } catch (err) {
        console.error(`[FeatureLoader] Error al importar la feature "${id}":`, err)
        Telemetry.logException(err, 'critical', { featureId: id, phase: 'load' })
      }
    }

    // 2. Ordenación topológica para resolver dependencias y ciclos
    try {
      this.initializationOrder = this.sortFeaturesTopologically(manifests)
      console.log('[FeatureLoader] Orden de inicialización resuelto:', this.initializationOrder)
    } catch (err) {
      console.error('[FeatureLoader] Fallo en la resolución de dependencias:', err.message)
      throw err
    }

    // 3. Ejecutar ciclo de vida secuencial sobre las features resueltas
    const context = {
      NavigationRegistry,
      registerSaaSUsageCollector: (collector) => {
        // Vinculación dinámica con SaaS Billing
        import('../../services/billingService').then(({ registerBillingAdapter }) => {
          registerBillingAdapter(collector)
        })
      }
    }

    for (const id of this.initializationOrder) {
      const manifest = manifests[id]
      this.loadedFeatures[id] = manifest

      // Omitir si la feature ya fue montada (prevención de StrictMode re-renders)
      if (LifecycleManager.getFeatureStatus(id) === LIFECYCLE_STATES.MOUNTED) {
        console.log(`[FeatureLoader] Feature "${id}" ya está montada. Omitiendo ciclo duplicado.`);
        continue
      }

      try {
        // FASE: install
        LifecycleManager.setTransition(id, LIFECYCLE_STATES.INSTALLED)
        if (typeof manifest.install === 'function') {
          await manifest.install(context)
        }

        // FASE: configure
        LifecycleManager.setTransition(id, LIFECYCLE_STATES.CONFIGURED)
        if (typeof manifest.configure === 'function') {
          await manifest.configure(context)
        }

        // FASE: initialize
        LifecycleManager.setTransition(id, LIFECYCLE_STATES.INITIALIZED)
        if (typeof manifest.initialize === 'function') {
          await manifest.initialize(context)
        }

        // Registrar rutas en el NavigationRegistry si las provee
        if (manifest.routes) {
          NavigationRegistry.registerRoutes(id, manifest.routes)
        }

        // FASE: mount
        LifecycleManager.setTransition(id, LIFECYCLE_STATES.MOUNTED)
        if (typeof manifest.mount === 'function') {
          await manifest.mount(context)
        }

        console.log(`[FeatureLoader] Feature "${id}" montada con éxito.`)
      } catch (err) {
        console.error(`[FeatureLoader] Fallo en el ciclo de vida de "${id}":`, err)
        LifecycleManager.setTransition(id, LIFECYCLE_STATES.FAILED, err)
        // Tolerancia a fallos: Continuar con los siguientes módulos sanos
      }
    }
  }

  /**
   * Ordena topológicamente las features basándose en sus dependencias declaradas.
   */
  sortFeaturesTopologically(manifests) {
    const sorted = []
    const visited = {}
    const temp = {}

    const visit = (id) => {
      if (temp[id]) {
        throw new Error(`CircularDependencyError: Se detectó una dependencia circular que involucra a la feature "${id}"`)
      }
      if (visited[id]) return

      temp[id] = true

      const manifest = manifests[id]
      const dependencies = manifest?.requires || []

      for (const dep of dependencies) {
        if (manifests[dep]) {
          visit(dep)
        } else {
          console.warn(`[FeatureLoader] La feature "${id}" requiere la dependencia "${dep}" pero no está activa o instalada.`)
        }
      }

      delete temp[id]
      visited[id] = true
      sorted.push(id)
    }

    Object.keys(manifests).forEach(id => {
      if (!visited[id]) visit(id)
    })

    return sorted
  }

  /**
   * Retorna las features cargadas.
   */
  getLoadedFeatures() {
    return this.loadedFeatures
  }
}

export const FeatureLoader = new FeatureLoaderClass()
