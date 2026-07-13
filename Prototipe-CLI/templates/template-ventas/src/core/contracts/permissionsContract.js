let permissionsProvider = {
  can: () => { throw new Error('Permissions Provider no registrado'); }
};

export const registerPermissionsProvider = (providerImpl) => {
  permissionsProvider = providerImpl;
};

export const Permissions = {
  can(role, capability) {
    return permissionsProvider.can(role, capability);
  }
};
