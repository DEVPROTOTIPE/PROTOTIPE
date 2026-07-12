import { 
  ApplicationSchema, 
  TenantSchema, 
  ExperienceSchema, 
  BrandingSchema, 
  BillingSchema, 
  PatternsSchema,
  DashboardSchema
} from './ExperienceSchemas'

class ExperienceRegistryClass {
  constructor() {
    this.configs = {
      application: null,
      tenant: null,
      experience: null,
      branding: null,
      billing: null,
      patterns: null,
      dashboard: null
    }
    this.isBootstrapCompleted = false
  }

  /**
   * Ejecuta el bootstrap y la validación de todos los manifiestos de experiencia.
   * Si alguna validación de Zod falla, detiene la aplicación.
   */
  async bootstrap() {
    if (this.isBootstrapCompleted) return

    try {
      console.log('[ExperienceRegistry] Iniciando validación de manifiestos...')

      // 1. Cargar físicamente los archivos de configuración
      const applicationJson = await import('../../config/application.json')
      const tenantJson = await import('../../config/tenant.json')
      const experienceJson = await import('../../config/experience.json')
      const brandingJson = await import('../../config/branding.json')
      const billingJson = await import('../../config/billing.json')
      const patternsJson = await import('../../config/patterns.json')
      const dashboardJson = await import('../../config/dashboard.json')

      // 2. Validar mediante esquemas Zod
      this.configs.application = ApplicationSchema.parse(applicationJson.default)
      this.configs.tenant = TenantSchema.parse(tenantJson.default)
      this.configs.experience = ExperienceSchema.parse(experienceJson.default)
      this.configs.branding = BrandingSchema.parse(brandingJson.default)
      this.configs.billing = BillingSchema.parse(billingJson.default)
      this.configs.patterns = PatternsSchema.parse(patternsJson.default)
      this.configs.dashboard = DashboardSchema.parse(dashboardJson.default)

      console.log('✅ [ExperienceRegistry] Bootstrap de experiencia completado exitosamente.')
      this.isBootstrapCompleted = true

      // 3. Aplicar Branding al DOM
      this.applyBrandingToDOM()
    } catch (err) {
      console.error('❌ [ExperienceRegistry] Error crítico en bootstrap de experiencia:', err.message)
      throw err
    }
  }

  /**
   * Aplica dinámicamente las variables HSL de branding y tipografía al DOM HTML.
   */
  applyBrandingToDOM() {
    const branding = this.configs.branding
    if (!branding) return

    const root = document.documentElement

    // Aplicar paleta de colores si existe en branding
    if (branding.colors) {
      root.style.setProperty('--color-primary', branding.colors.primary)
      root.style.setProperty('--color-secondary', branding.colors.secondary)
      root.style.setProperty('--color-surface', branding.colors.surface)
    }

    // Inyectar Google Fonts dinámicamente según la tipografía de experience
    const typography = this.configs.experience?.typography
    if (typography) {
      root.style.setProperty('--font-family', typography)
      
      const linkId = 'google-font-experience'
      let linkElement = document.getElementById(linkId)
      if (!linkElement) {
        linkElement = document.createElement('link')
        linkElement.id = linkId
        linkElement.rel = 'stylesheet'
        document.head.appendChild(linkElement)
      }
      linkElement.href = `https://fonts.googleapis.com/css2?family=${typography.replace(/\s+/g, '+')}:wght@300;400;500;700;900&display=swap`
    }
  }

  getConfig(key) {
    return this.configs[key]
  }

  get activeFeatures() {
    return this.configs.application?.features || []
  }

  get activePatterns() {
    return this.configs.patterns?.activePatterns || []
  }

  get layoutType() {
    return this.configs.experience?.layout || 'sidebar'
  }

  get density() {
    return this.configs.experience?.density || 'comfortable'
  }
}
export const ExperienceRegistry = new ExperienceRegistryClass()
