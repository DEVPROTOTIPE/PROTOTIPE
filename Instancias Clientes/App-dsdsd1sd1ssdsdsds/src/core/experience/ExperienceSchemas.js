import { z } from 'zod'

export const ApplicationSchema = z.object({
  instanceId: z.string().min(2),
  clientName: z.string().min(2),
  vertical: z.string().min(2), // Flexible: Acepta cualquier string
  schemaVersion: z.string(),
  features: z.array(z.string())
})

export const TenantSchema = z.object({
  tenantId: z.string(),
  plan: z.enum(['free', 'standard', 'enterprise']),
  status: z.enum(['active', 'suspended', 'deactivated']),
  featuresEnabled: z.array(z.string())
})

export const ExperienceSchema = z.object({
  layout: z.enum(['sidebar', 'topbar', 'dual-panel', 'tabs-mobile']),
  density: z.enum(['compact', 'comfortable', 'spacious']),
  themeMode: z.enum(['dark', 'light', 'dark-detect']),
  typography: z.string()
})

export const BrandingSchema = z.object({
  paletteChoice: z.string(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    surface: z.string()
  }).optional(),
  initials: z.string().max(5)
})

export const BillingSchema = z.object({
  billingMode: z.enum(['flat', 'percentage', 'hybrid']),
  commissionPercent: z.number().min(0),
  flatMonthlyFee: z.number().min(0)
})

export const PatternsSchema = z.object({
  activePatterns: z.array(z.string())
})

export const DashboardSchema = z.object({
  welcomeWidget: z.string().optional(),
  layoutPreset: z.string(),
  activeWidgets: z.array(z.object({
    id: z.string(),
    size: z.string().optional()
  }))
})
