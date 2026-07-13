import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import manifest from '../core/generated/core-manifest.generated.json'
import { getNormalizedFeatures } from '../utils/featureManifestAdapter'

const clientId = import.meta.env.VITE_DEVELOPER_CLIENT_ID || 'general'
const storageKey = `app-config-storage-${clientId}`

const normalizedFeatures = getNormalizedFeatures(manifest)

// Helper para crear flags con sus defaults
const createDefaultFeatureFlags = () => {
  const flags = {
    couponsEnabled: true
  };
  normalizedFeatures.forEach(feature => {
    const val = Boolean(feature.enabledByDefault);
    flags[feature.id] = val;
    if (Array.isArray(feature.legacyRemoteKeys)) {
      feature.legacyRemoteKeys.forEach(legacyKey => {
        flags[legacyKey] = val;
      });
    }
  });
  return flags;
};

const knownFeatureIds = new Set(['couponsEnabled']);
normalizedFeatures.forEach(feature => {
  knownFeatureIds.add(feature.id);
  if (Array.isArray(feature.legacyRemoteKeys)) {
    feature.legacyRemoteKeys.forEach(legacyKey => {
      knownFeatureIds.add(legacyKey);
    });
  }
});

// Sanitización de flags obsoletas
const sanitizePersistedFeatureFlags = (persistedFlags = {}) => {
  const defaults = createDefaultFeatureFlags();
  for (const [featureId, value] of Object.entries(persistedFlags)) {
    if (knownFeatureIds.has(featureId)) {
      defaults[featureId] = Boolean(value);
    }
  }
  return defaults;
};

// Obtener estado inicial persistido síncronamente
const getPersistedValue = (key, defaultValue) => {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.state && parsed.state[key] !== undefined) {
        return parsed.state[key]
      }
    }
  } catch (e) {}
  return defaultValue
}

// Inicialización de flags persistidas
const defaultFlags = createDefaultFeatureFlags();
const initialFlags = {};
Object.keys(defaultFlags).forEach(key => {
  initialFlags[key] = getPersistedValue(key, defaultFlags[key]);
});

const useAppConfigStore = create(
  persist(
    (set, get) => ({
      // ─── Estado ───────────────────────────────────────────────────────────
      appName: getPersistedValue('appName', 'Mi Tienda'),
      sellerName: getPersistedValue('sellerName', 'Vendedor'),
      appIcon: null,
      welcomeWavesEnabled: getPersistedValue('welcomeWavesEnabled', true),
      theme: getPersistedValue('theme', import.meta.env.VITE_INITIAL_THEME || 'zafiro-moderno'),
      isDarkMode: getPersistedValue('isDarkMode', false),
      adminRegistered: getPersistedValue('adminRegistered', false),
      pwaAppName: '',
      pwaAppIcon: null,
      pwaUseBrandIcon: false,
      activeSeasonalEvent: getPersistedValue('activeSeasonalEvent', 'none'),
      whatsappAdmin: '',
      claimsEnabled: false,
      orderTrackingEnabled: true,
      trackingWaTemplate: '',
      appPromo: {
        enabled: false,
        title: '',
        message: '',
        androidUrl: '',
        iosUrl: '',
        promoImageUrl: ''
      },
      developerPhone: '',
      bankInfo: {
        numeroCuenta: '',
        banco: '',
        tipoCuenta: 'ahorros',
        titular: '',
        cedulaNit: '',
        qrUrl: '',
      },
      bankInfo2: {
        activa: false,
        numeroCuenta: '',
        banco: '',
        tipoCuenta: 'ahorros',
        focus: false,
        titular: '',
        cedulaNit: '',
        qrUrl: '',
      },
      // ─── Apariencia avanzada ───────────────────────────────────────────
      appFont: getPersistedValue('appFont', 'inter'),
      appRadius: getPersistedValue('appRadius', 'rounded'),
      catalogBanner: { type: 'none', value: '' },
      catalogLayout: 'grid2',
      animationsEnabled: getPersistedValue('animationsEnabled', true),
      actionColor: getPersistedValue('actionColor', ''),
      catalogFilters: {
        categories: true,
        sizes: true,
        colors: true,
        customAttributes: [
          { id: 'attr-marca', name: 'Marca', type: 'text' },
          { id: 'attr-genero', name: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex'] }
        ]
      },
      guidedModeEnabled: true,
      loginTrustMessage: '',
      slogan: '',

      // Namespace estructurado de Feature Flags
      featureFlags: initialFlags,

      // Propiedades Planas en la Raíz para compatibilidad hacia atrás
      ...initialFlags,

      deliverySettings: {
        pickup: {
          enabled: true,
          address: '',
          instructions: 'Recoge tu pedido directamente en nuestro local.'
        },
        shipping: {
          enabled: true,
          cost: 0,
          estimatedTime: '30 a 60 min',
          instructions: 'Recibe tu pedido en la comodidad de tu casa.'
        },
        digital: {
          enabled: false,
          instructions: 'Entrega digital o prestación de servicio presencial.'
        },
        customDelivery: {
          enabled: false,
          serviceLabel: 'Domicilio Propio',
          costType: 'fijo',
          fixedCost: 0,
          allowCustomCost: false,
          estimatedTime: '20 a 40 min',
          messengerTemplate: '',
        }
      },
      hasMultipleEmployees: false,
      employeeCount: 0,
      employees: [],
      wholesaleSettings: {
        enabled: true,
        minQuantity: 12,
        discountType: 'percentage',
        discountValue: 15
      },
      commercialOptimization: {
        enabled: true,
        tools: {
          smartTags: {
            enabled: true,
            bestSeller: { enabled: true, text: 'Más Vendido', bg: '#ef4444', textCol: '#ffffff', style: 'pill', minSales: 5 },
            unmissableOffer: { enabled: true, text: 'Oferta Imperdible', bg: '#f59e0b', textCol: '#ffffff', style: 'pill' },
            lastUnit: { enabled: true, text: 'Última Unidad', bg: '#3b82f6', textCol: '#ffffff', style: 'pill', threshold: 3 },
            newProduct: { enabled: true, text: 'Nuevo', bg: '#10b981', textCol: '#ffffff', style: 'pill', daysLimit: 7 }
          },
          advancedGallery: { enabled: true },
          visualVariations: { enabled: true },
          variationIndicators: { enabled: true },
          cartRecommendations: { enabled: true, title: 'Recomendado para ti' },
          historyRecommendations: { enabled: true }
        }
      },
      sistemaAlerta: null,
      deactivated: false,
      deactivationReason: '',
      maintenanceMode: getPersistedValue('maintenanceMode', false),
      degradedMode: false,
      isLoaded: false,

      // ─── Acciones ─────────────────────────────────────────────────────────
      setConfig: (newConfig) => {
        try {
          localStorage.setItem('app_config_loaded', 'true')
        } catch (e) {}
        
        // Si newConfig contiene featureFlags en formato de sub-objeto, resolver
        const configFlags = newConfig.featureFlags || {};
        const flattenedFlags = {};
        normalizedFeatures.forEach(feature => {
          let val = feature.enabledByDefault;
          if (configFlags[feature.id] !== undefined) {
            val = Boolean(configFlags[feature.id]);
          } else if (newConfig[feature.id] !== undefined) {
            val = Boolean(newConfig[feature.id]);
          }
          
          flattenedFlags[feature.id] = val;
          if (Array.isArray(feature.legacyRemoteKeys)) {
            feature.legacyRemoteKeys.forEach(legacyKey => {
              flattenedFlags[legacyKey] = val;
            });
          }
        });

        set((state) => ({
          ...state,
          ...newConfig,
          featureFlags: {
            ...state.featureFlags,
            ...flattenedFlags
          },
          // Sincronizar propiedades planas en la raíz para compatibilidad hacia atrás
          ...flattenedFlags,
          isLoaded: true
        }))
      },
      setCatalogFilters: (catalogFilters) => set({ catalogFilters }),
      setMaintenanceMode: (status) => set({ maintenanceMode: status }),
      setDegradedMode: (status) => set({ degradedMode: status }),

      toggleDarkMode: () => set((state) => {
        const newDark = !state.isDarkMode
        if (newDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        return { isDarkMode: newDark }
      }),

      setTheme: (theme) => set({ theme }),
      setAppName: (name) => set({ appName: name }),

      setFeatureFlag: (featureId, enabled) => {
        set((state) => {
          const nextFlags = {
            ...state.featureFlags,
            [featureId]: Boolean(enabled)
          };
          return {
            featureFlags: nextFlags,
            [featureId]: Boolean(enabled)
          };
        });
      },

      replaceFeatureFlags: (featureFlagsMap) => {
        const defaults = createDefaultFeatureFlags();
        const merged = { ...defaults, ...featureFlagsMap };
        set({
          featureFlags: merged,
          ...merged
        });
      },

      isFeatureEnabled: (featureId) => {
        let key = featureId;
        if (featureId === 'credits') key = 'creditsEnabled';
        if (featureId === 'claims') key = 'claimsEnabled';
        if (featureId === 'coupons') key = 'couponsEnabled';
        if (featureId === 'delivery') key = 'rolesOperativosEnabled';
        if (featureId === 'onlineOrdersEnabled') key = 'orders';
        return Boolean(get().featureFlags[key] || get().featureFlags[featureId]);
      }
    }),
    {
      name: storageKey,
      version: 3,
      migrate: (persistedState, version) => {
        if (version < 2) {
          delete persistedState.commercialOptimization
        }
        // Migración a versión 3: Estructuración de featureFlags en namespace
        if (version < 3) {
          const defaults = createDefaultFeatureFlags();
          const extractedFlags = {};
          normalizedFeatures.forEach(feature => {
            if (persistedState[feature.id] !== undefined) {
              extractedFlags[feature.id] = Boolean(persistedState[feature.id]);
              delete persistedState[feature.id];
            } else {
              extractedFlags[feature.id] = Boolean(feature.enabledByDefault);
            }
          });
          persistedState.featureFlags = extractedFlags;
        }
        return persistedState
      },
      merge: (persistedState, currentState) => {
        const mergedFlags = sanitizePersistedFeatureFlags(persistedState?.featureFlags);
        return {
          ...currentState,
          ...persistedState,
          featureFlags: mergedFlags,
          ...mergedFlags // Propagar a propiedades planas de la raíz
        };
      },
      partialize: (state) => ({
        appName: state.appName,
        appIcon: state.appIcon,
        pwaAppName: state.pwaAppName,
        pwaAppIcon: state.pwaAppIcon,
        pwaUseBrandIcon: state.pwaUseBrandIcon,
        welcomeWavesEnabled: state.welcomeWavesEnabled,
        sellerName: state.sellerName,
        isDarkMode: state.isDarkMode,
        theme: state.theme,
        activeSeasonalEvent: state.activeSeasonalEvent,
        appFont: state.appFont,
        appRadius: state.appRadius,
        actionColor: state.actionColor,
        animationsEnabled: state.animationsEnabled,
        loginTrustMessage: state.loginTrustMessage,
        hasMultipleEmployees: state.hasMultipleEmployees,
        employeeCount: state.employeeCount,
        employees: state.employees,
        deliverySettings: state.deliverySettings,
        wholesaleSettings: state.wholesaleSettings,
        whatsappAdmin: state.whatsappAdmin,
        claimsEnabled: state.claimsEnabled,
        orderTrackingEnabled: state.orderTrackingEnabled,
        trackingWaTemplate: state.trackingWaTemplate,
        appPromo: state.appPromo,
        developerPhone: state.developerPhone,
        adminRegistered: state.adminRegistered,
        maintenanceMode: state.maintenanceMode,
        commercialOptimization: state.commercialOptimization,
        featureFlags: state.featureFlags,
      }),
    }
  )
);

export default useAppConfigStore
