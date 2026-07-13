/**
 * Crea un Sandbox / Proxy restrictivo sobre el contexto del Kernel provisto a las features.
 * Evita mutaciones sobre el Kernel y accesos no autorizados a servicios internos.
 * Obliga a las features a interactuar con Firebase exclusivamente a través de los contratos Core.
 * 
 * @param {string} featureId - El ID técnico de la feature
 * @param {object} coreContext - El contexto global y privado del Core
 * @returns {object} Un sandbox seguro congelado y protegido por Proxy
 */
export const createFeatureSandbox = (featureId, coreContext) => {
  const sandbox = {
    // 1. Bus de eventos global
    eventBus: {
      subscribe: (eventContract, cb) => coreContext.eventBus.subscribe(eventContract, cb),
      publish: (eventContract, payload) => coreContext.eventBus.publish(eventContract, payload)
    },
    
    // 2. Registro de navegación dinámica
    navigation: {
      registerAdminMenu: (items) => coreContext.navigation.registerAdminMenu(featureId, items),
      registerClientMenu: (items) => coreContext.navigation.registerClientMenu(featureId, items)
    },
    
    // 3. Router dinámico
    router: {
      registerRoutes: (routes) => coreContext.router.registerRoutes(featureId, routes)
    },
    
    // 4. Contratos de Persistencia Controlada (NUNCA Firebase direct API)
    database: {
      get: (collection, id) => coreContext.database.get(featureId, collection, id),
      save: (collection, id, data) => coreContext.database.save(featureId, collection, id, data),
      update: (collection, id, data) => coreContext.database.update(featureId, collection, id, data),
      delete: (collection, id) => coreContext.database.delete(featureId, collection, id),
      runTransaction: (callback) => coreContext.database.runTransaction(featureId, callback)
    },

    // 5. Registro de Permisos de Seguridad
    permissions: {
      registerPermissions: (role, perms) => coreContext.permissions.registerPermissions(role, perms)
    }
  };

  // Congelar primer nivel del objeto
  Object.freeze(sandbox.eventBus);
  Object.freeze(sandbox.navigation);
  Object.freeze(sandbox.router);
  Object.freeze(sandbox.database);
  Object.freeze(sandbox.permissions);
  Object.freeze(sandbox);

  // Envolver en Proxy para atrapar e impedir cualquier lectura/escritura a propiedades no declaradas
  return new Proxy(sandbox, {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      throw new Error(
        `🚨 [FeatureSandbox Violation] El módulo "${featureId}" intentó acceder a la propiedad no autorizada "${String(prop)}" del Kernel.`
      );
    },
    set() {
      throw new Error(`🚨 [FeatureSandbox Violation] Está prohibido modificar propiedades del Sandbox de la feature "${featureId}".`);
    },
    defineProperty() {
      throw new Error(`🚨 [FeatureSandbox Violation] Operación defineProperty bloqueada por seguridad.`);
    },
    deleteProperty() {
      throw new Error(`🚨 [FeatureSandbox Violation] Operación deleteProperty bloqueada por seguridad.`);
    }
  });
};
