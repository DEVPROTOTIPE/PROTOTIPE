// Mocks controlados para APIs externas y SDKs

export const mocks = {
  centralConsole: {
    registerToken: async (token) => {
      console.log(`[MOCK_CENTRAL] Registrando token de telemetría: ${token}`);
      return { success: true, status: 200 };
    },
    syncStatus: async (clientId) => {
      console.log(`[MOCK_CENTRAL] Sincronizando estado de la instancia: ${clientId}`);
      return { success: true, status: 200, vertical: 'retail' };
    }
  },
  firebaseSdk: {
    // Simuladores de Firebase Firestore y Auth
    firestore: {
      collection: (name) => {
        console.log(`[MOCK_FIREBASE] collection: ${name}`);
        return {
          doc: (id) => ({
            set: async (data) => console.log(`[MOCK_FIREBASE] set /${name}/${id}`),
            get: async () => ({ exists: true, data: () => ({}) })
          })
        };
      }
    }
  }
};

global.__service_mocks__ = mocks;
console.log('📡 [ServiceMocks] Simuladores cargados en global.');
