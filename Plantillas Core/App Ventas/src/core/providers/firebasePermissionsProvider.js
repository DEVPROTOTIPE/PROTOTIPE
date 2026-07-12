import { PermissionRegistry } from '../auth/PermissionRegistry';

export const firebasePermissionsProvider = {
  /**
   * Valida si un rol tiene permisos para una capacidad específica utilizando el PermissionRegistry.
   */
  can(role, capability) {
    return PermissionRegistry.can(role, capability);
  }
};
