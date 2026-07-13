import { FeatureRegistry } from '../config/FeatureRegistry';
import { EventBus } from '../eventbus/EventBus';
import { NavigationRegistry } from '../config/NavigationRegistry';
import { PermissionRegistry } from '../auth/PermissionRegistry';
import { LifecycleManager, LIFECYCLE_STATES } from './FeatureLifecycleManager';
import { FeatureHealthManager } from './FeatureHealthManager';
import { FeatureManifestSchema } from './FeatureManifestSchema';
import { createFeatureSandbox } from './FeatureSandboxContext';

// Registro de proveedores en contratos abstractos
import { registerDbProvider } from '../contracts/dbContract';
import { firestoreDbProvider } from '../providers/firestoreDbProvider';
import { registerNotificationsProvider } from '../contracts/notificationsContract';
import { firebaseNotificationsProvider } from '../providers/firebaseNotificationsProvider';
import { registerTelemetryProvider } from '../contracts/telemetryContract';
import { firebaseTelemetryProvider } from '../providers/firebaseTelemetryProvider';
import { registerPermissionsProvider } from '../contracts/permissionsContract';
import { firebasePermissionsProvider } from '../providers/firebasePermissionsProvider';

// Carga perezosa en tiempo de compilación de todos los manifiestos de features
const modulesGlob = import.meta.glob('../../features/*/module.js');

class ApplicationKernelClass {
  constructor() {
    this.modules = {};
    this.bootOrder = [];
    this.isBootstrapped = false;
    this.context = null;
    this.tenantContext = null;
  }

  /**
   * Ordena topológicamente los módulos activos basándose en sus dependencias.
   */
  resolveDependencies() {
    const visited = new Set();
    const temp = new Set();
    const order = [];

    const visit = (id) => {
      if (temp.has(id)) {
        throw new Error(`❌ [Kernel Error] Dependencia circular detectada en runtime: ${id}`);
      }
      if (!visited.has(id)) {
        temp.add(id);
        const mod = this.modules[id];
        const deps = mod?.dependencies || [];
        for (const dep of deps) {
          if (FeatureRegistry.isEnabled(dep)) {
            visit(dep);
          }
        }
        temp.delete(id);
        visited.add(id);
        order.push(id);
      }
    };

    Object.keys(this.modules).forEach(id => visit(id));
    this.bootOrder = order;
  }

  /**
   * Ejecuta un paso del ciclo de vida de forma secuencial y tolerante a fallos.
   */
  async executeLifecycleStep(stepName, nextState, methodCall) {
    for (const id of this.bootOrder) {
      const currentStatus = LifecycleManager.getFeatureStatus(id);
      if (currentStatus === LIFECYCLE_STATES.FAILED || currentStatus === LIFECYCLE_STATES.DISABLED) {
        continue;
      }

      try {
        const mod = this.modules[id];
        if (mod && typeof mod[methodCall] === 'function') {
          // Crear un sandbox proxy aislado para esta feature
          const sandbox = createFeatureSandbox(id, this.context);
          // Inyectar el TenantContext inmutable
          await mod[methodCall](sandbox, this.tenantContext);
        }
        LifecycleManager.setTransition(id, nextState);
      } catch (err) {
        console.error(`❌ [Kernel Bootstrap] Fallo en la feature "${id}" durante el paso "${stepName}":`, err);
        LifecycleManager.setTransition(id, LIFECYCLE_STATES.FAILED, err);
      }
    }
  }

  /**
   * Inicializa el bootstrap de toda la plataforma SaaS.
   */
  async bootstrap() {
    if (this.isBootstrapped) return;
    const startTime = performance.now();

    console.log('🚀 [Kernel] Iniciando bootstrap de la plataforma...');

    // 1. Vincular proveedores concretos a contratos abstractos
    registerDbProvider(firestoreDbProvider);
    registerNotificationsProvider(firebaseNotificationsProvider);
    registerTelemetryProvider(firebaseTelemetryProvider);
    registerPermissionsProvider(firebasePermissionsProvider);

    // 2. Resolver y crear TenantContext inmutable
    const rawTenantContext = {
      tenantId: import.meta.env.VITE_DEVELOPER_CLIENT_ID || 'default_tenant',
      brandName: import.meta.env.VITE_BRAND_NAME || 'Mi Tienda',
      theme: import.meta.env.VITE_BRAND_THEME || 'zafiro-moderno',
      subscription: {
        plan: 'premium',
        status: 'active',
        featuresAllowed: FeatureRegistry.getActiveFeatures()
      }
    };
    
    // Congelación profunda recursiva para garantizar inmutabilidad absoluta
    const deepFreeze = (obj) => {
      Object.freeze(obj);
      Object.getOwnPropertyNames(obj).forEach(prop => {
        if (
          obj.hasOwnProperty(prop) &&
          obj[prop] !== null &&
          (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') &&
          !Object.isFrozen(obj[prop])
        ) {
          deepFreeze(obj[prop]);
        }
      });
      return obj;
    };
    this.tenantContext = deepFreeze(rawTenantContext);

    // 3. Cargar y validar manifiestos en disco de las features activas
    for (const path in modulesGlob) {
      const parts = path.split('/');
      const featureId = parts[parts.length - 2] || 'unknown';
      if (FeatureRegistry.isEnabled(featureId)) {
        try {
          const modDefinition = (await modulesGlob[path]()).default;
          
          // Validar el manifiesto contra el schema obligatorio
          const validation = FeatureManifestSchema.safeParse(modDefinition);
          if (!validation.success) {
            throw new Error(`Manifiesto de feature malformado: ${validation.error.message}`);
          }

          this.modules[featureId] = modDefinition;
          LifecycleManager.setTransition(featureId, LIFECYCLE_STATES.INSTALLED);
        } catch (err) {
          console.error(`❌ [Kernel] No se pudo instalar la feature "${featureId}":`, err);
          LifecycleManager.setTransition(featureId, LIFECYCLE_STATES.FAILED, err);
        }
      }
    }

    // 4. Ordenar features topológicamente para ejecutar dependencias primero
    this.resolveDependencies();

    // 5. Configurar los registros y contextos del bus
    // (Utilizado por el router dinámico de features)
    const routerMock = {
      registerRoutes: (featureId, routes) => {
        if (!this.context.routes) this.context.routes = [];
        this.context.routes.push(...routes.map(r => ({ ...r, featureId })));
      }
    };

    this.context = {
      eventBus: EventBus,
      navigation: NavigationRegistry,
      permissions: PermissionRegistry,
      router: routerMock,
      database: {
        get: (featureId, coll, id) => firestoreDbProvider.get(featureId, coll, id),
        save: (featureId, coll, id, data) => firestoreDbProvider.save(featureId, coll, id, data),
        update: (featureId, coll, id, data) => firestoreDbProvider.update(featureId, coll, id, data),
        delete: (featureId, coll, id) => firestoreDbProvider.delete(featureId, coll, id),
        runTransaction: (featureId, cb) => firestoreDbProvider.runTransaction(featureId, cb)
      }
    };

    // Registrar módulos en el FeatureHealthManager
    FeatureHealthManager.registerModules(Object.values(this.modules));

    // 6. Ejecución del ciclo de vida unificado en orden topológico
    await this.executeLifecycleStep('install', LIFECYCLE_STATES.CONFIGURED, 'install');
    await this.executeLifecycleStep('configure', LIFECYCLE_STATES.INITIALIZED, 'configure');
    await this.executeLifecycleStep('initialize', LIFECYCLE_STATES.MOUNTED, 'initialize');
    await this.executeLifecycleStep('mount', LIFECYCLE_STATES.MOUNTED, 'mount');

    this.isBootstrapped = true;
    const duration = performance.now() - startTime;
    console.log(`🏁 [Kernel] Bootstrap finalizado con éxito en ${duration.toFixed(2)}ms.`);
  }

  /**
   * Apaga y des-registra ordenadamente todos los módulos activos.
   */
  shutdown() {
    Object.values(this.modules).forEach(m => {
      try {
        m.destroy?.();
      } catch (err) {
        console.error(`❌ [Kernel] Error al destruir módulo "${m.id}":`, err);
      }
    });
    this.modules = {};
    this.bootOrder = [];
    this.isBootstrapped = false;
  }
}

export const Kernel = new ApplicationKernelClass();
export default Kernel;
