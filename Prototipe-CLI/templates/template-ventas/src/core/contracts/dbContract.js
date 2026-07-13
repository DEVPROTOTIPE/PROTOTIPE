let dbProvider = {
  get: () => { throw new Error('DB Provider no registrado'); },
  save: () => { throw new Error('DB Provider no registrado'); },
  update: () => { throw new Error('DB Provider no registrado'); },
  delete: () => { throw new Error('DB Provider no registrado'); },
  runTransaction: () => { throw new Error('DB Provider no registrado'); }
};

export const registerDbProvider = (providerImpl) => {
  dbProvider = providerImpl;
};

export const DB = {
  get(featureId, collection, id) {
    return dbProvider.get(featureId, collection, id);
  },
  save(featureId, collection, id, data) {
    return dbProvider.save(featureId, collection, id, data);
  },
  update(featureId, collection, id, data) {
    return dbProvider.update(featureId, collection, id, data);
  },
  delete(featureId, collection, id) {
    return dbProvider.delete(featureId, collection, id);
  },
  runTransaction(featureId, callback) {
    return dbProvider.runTransaction(featureId, callback);
  }
};
