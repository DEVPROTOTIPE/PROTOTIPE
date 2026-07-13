import { z } from 'zod';

// Esquema Zod de validación estricta para el manifiesto de features
export const FeatureManifestSchema = z.object({
  id: z.string().min(2),
  displayName: z.string().min(2),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  dependencies: z.array(z.string()).default([]),
  
  // Contratos provistos y requeridos en semver
  providesContracts: z.record(z.string()).default({}),
  requiresContracts: z.record(z.string()).default({}),
  
  routes: z.array(z.object({
    path: z.string(),
    element: z.any(),
    roleRequired: z.string().optional()
  })).default([]),
  
  permissions: z.array(z.string()).default([]),
  
  navigation: z.object({
    adminMenu: z.array(z.object({
      label: z.string(),
      path: z.string(),
      icon: z.string().optional(),
      permissionRequired: z.string().optional()
    })).optional(),
    clientMenu: z.array(z.object({
      label: z.string(),
      path: z.string(),
      icon: z.string().optional()
    })).optional()
  }).optional(),
  
  publishedEvents: z.array(z.string()).default([]),
  listenedEvents: z.array(z.string()).default([]),
  configSchema: z.any().optional(),
  
  // Ganchos de ciclo de vida del módulo
  install: z.function().optional(),
  configure: z.function().optional(),
  initialize: z.function().optional(),
  mount: z.function().optional(),
  destroy: z.function().optional(),
  healthCheck: z.function().optional()
});
