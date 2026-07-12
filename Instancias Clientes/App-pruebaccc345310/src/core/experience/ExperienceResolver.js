import { ExperienceSchema, BrandingSchema, PatternsSchema } from './ExperienceSchemas'

class ExperienceResolverClass {
  /**
   * Resuelve y valida la experiencia técnica basándose en las variables del briefing.
   * @param {object} briefing - { vertical, estiloVisual, initials, ... }
   * @returns {object} { experience, branding, patterns }
   */
  resolve(briefing = {}) {
    const vertical = briefing.vertical || 'general'
    const estiloVisual = briefing.estiloVisual || 'professional'
    
    // 1. Deducir Layout y Densidad
    let layout = 'sidebar'
    let density = 'compact'
    if (vertical === 'retail' || vertical === 'restaurant') {
      layout = 'topbar'
      density = 'comfortable'
    }

    // 2. Deducir Paleta de Colores
    let paletteChoice = 'slate'
    let typography = 'Roboto'
    if (estiloVisual === 'creative' || vertical === 'retail') {
      paletteChoice = 'emerald'
      typography = 'Inter'
    } else if (estiloVisual === 'soft' || vertical === 'clinica') {
      paletteChoice = 'violet'
      typography = 'Outfit'
    }

    // 3. Deducir Patrones de Producto Habilitados
    let activePatterns = ['pattern-dashboard-workspace', 'pattern-search-details']
    if (vertical === 'clinica') {
      activePatterns.push('pattern-calendar-workspace')
    } else if (vertical === 'crm') {
      activePatterns.push('pattern-kanban-workspace')
    } else if (vertical === 'retail') {
      activePatterns.push('pattern-wizard-flow')
    }

    const resolved = {
      experience: {
        layout,
        density,
        themeMode: 'dark-detect',
        typography
      },
      branding: {
        paletteChoice,
        initials: briefing.initials || 'APP'
      },
      patterns: {
        activePatterns
      }
    }

    // Validar mediante esquemas Zod
    ExperienceSchema.parse(resolved.experience)
    BrandingSchema.parse(resolved.branding)
    PatternsSchema.parse(resolved.patterns)

    return resolved
  }
}
export const ExperienceResolver = new ExperienceResolverClass()
