import { z } from 'zod'
import manifest from '../core/generated/core-manifest.generated.json'
import { getNormalizedFeatures } from '../utils/featureManifestAdapter'

// Construir la forma dinámica de feature flags a partir del catálogo modular generado y normalizado
const dynamicFeatureFlagsShape = {};
const normalizedFeatures = getNormalizedFeatures(manifest);

normalizedFeatures.forEach(feature => {
  dynamicFeatureFlagsShape[feature.id] = z.boolean().default(feature.enabledByDefault ?? false);
});

// Esquema de Feature Flags (Namespace estructurado)
export const featureFlagsSchema = z.object(dynamicFeatureFlagsShape).default({});
export const strictFeatureFlagsSchema = z.strictObject(dynamicFeatureFlagsShape);

// Helper para parsear de forma compatible runtime
export function parseRuntimeFeatureFlags(input) {
  return featureFlagsSchema.parse(input ?? {});
}

// Esquema base sin flags estáticas
const baseConfigShape = {
  appName: z.string().default('Mi Tienda'),
  sellerName: z.string().default('Vendedor'),
  appIcon: z.string().nullable().default(null),
  welcomeWavesEnabled: z.boolean().default(true),
  theme: z.string().default('zafiro-moderno'),
  isDarkMode: z.boolean().default(false),
  adminRegistered: z.boolean().default(false),
  pwaAppName: z.string().default(''),
  pwaAppIcon: z.string().nullable().default(null),
  pwaUseBrandIcon: z.boolean().default(false),
  activeSeasonalEvent: z.string().default('none'),
  whatsappAdmin: z.string().default(''),
  claimsEnabled: z.boolean().default(false),
  orderTrackingEnabled: z.boolean().default(true),
  trackingWaTemplate: z.string().default(''),
  
  appPromo: z.object({
    enabled: z.boolean().default(false),
    title: z.string().default(''),
    message: z.string().default(''),
    androidUrl: z.string().default(''),
    iosUrl: z.string().default(''),
    promoImageUrl: z.string().default('')
  }).default({}),

  developerPhone: z.string().default(''),

  bankInfo: z.object({
    numeroCuenta: z.string().default(''),
    banco: z.string().default(''),
    tipoCuenta: z.enum(['ahorros', 'corriente']).default('ahorros'),
    titular: z.string().default(''),
    cedulaNit: z.string().default(''),
    qrUrl: z.string().default('')
  }).default({}),

  bankInfo2: z.object({
    activa: z.boolean().default(false),
    numeroCuenta: z.string().default(''),
    banco: z.string().default(''),
    tipoCuenta: z.enum(['ahorros', 'corriente']).default('ahorros'),
    focus: z.boolean().default(false),
    titular: z.string().default(''),
    cedulaNit: z.string().default(''),
    qrUrl: z.string().default('')
  }).default({}),

  appFont: z.string().default('inter'),
  appRadius: z.string().default('rounded'),
  catalogBanner: z.object({
    type: z.string().default('none'),
    value: z.string().default('')
  }).default({}),
  catalogLayout: z.string().default('grid2'),
  animationsEnabled: z.boolean().default(true),
  actionColor: z.string().default(''),

  catalogFilters: z.object({
    categories: z.boolean().default(true),
    sizes: z.boolean().default(true),
    colors: z.boolean().default(true),
    customAttributes: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      options: z.array(z.string()).optional()
    })).default([
      { id: 'attr-marca', name: 'Marca', type: 'text' },
      { id: 'attr-genero', name: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex'] }
    ])
  }).default({}),

  guidedModeEnabled: z.boolean().default(true),
  loginTrustMessage: z.string().default(''),
  slogan: z.string().default(''),

  deliverySettings: z.object({
    pickup: z.object({
      enabled: z.boolean().default(true),
      address: z.string().default(''),
      instructions: z.string().default('Recoge tu pedido directamente en nuestro local.')
    }).default({}),
    shipping: z.object({
      enabled: z.boolean().default(true),
      cost: z.number().default(0),
      estimatedTime: z.string().default('30 a 60 min'),
      instructions: z.string().default('Recibe tu pedido en la comodidad de tu casa.')
    }).default({}),
    digital: z.object({
      enabled: z.boolean().default(false),
      instructions: z.string().default('Entrega digital o prestación de servicio presencial.')
    }).default({}),
    customDelivery: z.object({
      enabled: z.boolean().default(false),
      serviceLabel: z.string().default('Domicilio Propio'),
      costType: z.string().default('fijo'),
      fixedCost: z.number().default(0),
      allowCustomCost: z.boolean().default(false),
      estimatedTime: z.string().default('20 a 40 min'),
      messengerTemplate: z.string().default('')
    }).default({})
  }).default({}),

  hasMultipleEmployees: z.boolean().default(false),
  employeeCount: z.number().default(0),
  employees: z.array(z.any()).default([]),

  wholesaleSettings: z.object({
    enabled: z.boolean().default(true),
    minQuantity: z.number().default(12),
    discountType: z.enum(['percentage', 'fixed']).default('percentage'),
    discountValue: z.number().default(15)
  }).default({}),

  commercialOptimization: z.object({
    enabled: z.boolean().default(true),
    tools: z.object({
      smartTags: z.object({
        enabled: z.boolean().default(true),
        bestSeller: z.object({ enabled: z.boolean().default(true), text: z.string().default('Más Vendido'), bg: z.string().default('#ef4444'), textCol: z.string().default('#ffffff'), style: z.string().default('pill'), minSales: z.number().default(5) }).default({}),
        unmissableOffer: z.object({ enabled: z.boolean().default(true), text: z.string().default('Oferta Imperdible'), bg: z.string().default('#f59e0b'), textCol: z.string().default('#ffffff'), style: z.string().default('pill') }).default({}),
        lastUnit: z.object({ enabled: z.boolean().default(true), text: z.string().default('Última Unidad'), bg: z.string().default('#3b82f6'), textCol: z.string().default('#ffffff'), style: z.string().default('pill'), threshold: z.number().default(3) }).default({}),
        newProduct: z.object({ enabled: z.boolean().default(true), text: z.string().default('Nuevo'), bg: z.string().default('#10b981'), textCol: z.string().default('#ffffff'), style: z.string().default('pill'), daysLimit: z.number().default(7) }).default({})
      }).default({}),
      advancedGallery: z.object({ enabled: z.boolean().default(true) }).default({}),
      visualVariations: z.object({ enabled: z.boolean().default(true) }).default({}),
      variationIndicators: z.object({ enabled: z.boolean().default(true) }).default({}),
      cartRecommendations: z.object({ enabled: z.boolean().default(true), title: z.string().default('Recomendado para ti') }).default({}),
      historyRecommendations: z.object({ enabled: z.boolean().default(true) }).default({})
    }).default({})
  }).default({}),

  sistemaAlerta: z.any().nullable().default(null),
  deactivated: z.boolean().default(false),
  deactivationReason: z.string().default(''),
  maintenanceMode: z.boolean().default(false),
  degradedMode: z.boolean().default(false)
};

// Combinar la base con las flags en namespace y las flags planas en la raíz (para compatibilidad de formularios)
export const appConfigSchema = z.object({
  ...baseConfigShape,
  ...dynamicFeatureFlagsShape,
  featureFlags: featureFlagsSchema
});
