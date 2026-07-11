# Especificación Técnica de Experiencia y Aprovisionamiento (Fase 7)

Este documento detalla la especificación de diseño final para la **Fase 7 — Experience Framework + Provisioning Intelligence**, montada sobre la infraestructura de **Core v2.8**.

---

## 1. Desacoplamiento de Manifiestos de Configuración

Para evitar manifiestos monolíticos, separamos la especificación técnica en seis archivos JSON modulares que residirán bajo `src/config/`:

### 📄 1. `application.json` (Identidad y Versión)
Identifica unívocamente la aplicación, la vertical y la versión de compilación:
```json
{
  "instanceId": "clinica-veterinaria-sanitas",
  "clientName": "Clínica Veterinaria Sanitas",
  "vertical": "clinica",
  "schemaVersion": "1.0.0",
  "features": ["appointments", "patients", "billing"]
}
```

### 📄 2. `tenant.json` (Estatus y Plan SaaS)
Controla el estatus y límites operacionales del tenant:
```json
{
  "tenantId": "tenant-cvs-4819",
  "plan": "enterprise",
  "status": "active",
  "featuresEnabled": ["appointments", "patients", "billing"]
}
```

### 📄 3. `experience.json` (Composición Visual y Layout)
Estructura la experiencia e interacción de usuario en el shell principal:
```json
{
  "layout": "sidebar",
  "density": "compact",
  "themeMode": "dark-detect",
  "typography": "Outfit"
}
```

### 📄 4. `patterns.json` (Patrones de Interacción Habilitados)
Define qué experiencias completas y flujos de negocio de alto nivel están disponibles:
```json
{
  "activePatterns": [
    "pattern-calendar-workspace",
    "pattern-search-details",
    "pattern-dashboard-workspace"
  ]
}
```

### 📄 5. `branding.json` (Identidad y Paleta Cromática)
Define los tokens y valores del diseño de marca de forma aislada:
```json
{
  "paletteChoice": "violet",
  "colors": {
    "primary": "265 89% 45%",
    "secondary": "265 70% 60%",
    "surface": "0 0% 100%"
  },
  "initials": "CVS"
}
```

### 📄 6. `billing.json` (Facturación comisional y límites)
Consolida el modelo comisional y cuotas del negocio:
```json
{
  "billingMode": "percentage",
  "commissionPercent": 1.5,
  "flatMonthlyFee": 0
}
```

> [!IMPORTANT]
> **CERO SECRETOS:** Se eliminan `developerPin` y credenciales de todos los manifiestos JSON. Estos deben persistir exclusivamente en el archivo de entorno seguro `.env.local` y en variables privadas.

---

## 2. Experience Schemas (Zod Validation)
Se implementan esquemas de validación estrictos en `src/core/experience/ExperienceSchemas.js` para asegurar que las configuraciones de experiencia cumplan con los contratos definidos. Si un manifiesto es inválido, el bootstrapping del frontend aborta y reporta un error crítico de inicialización:

```javascript
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
```

---

## 3. ExperienceResolver (`core/experience/ExperienceResolver.js`)

Módulo encargado de mapear los objetivos comerciales y briefing del cliente a configuraciones técnicas de experiencia. **Desacoplado de servicios legacy:** depende únicamente de los esquemas Zod y configuraciones estáticas:

```javascript
import { ApplicationSchema, ExperienceSchema, BrandingSchema } from './ExperienceSchemas'

class ExperienceResolverClass {
  /**
   * Resuelve y valida la experiencia técnica basándose en las variables del briefing.
   * @param {object} briefing - { vertical, estiloVisual, initials, ... }
   * @returns {object} { experience, branding, patterns }
   */
  resolve(briefing = {}) {
    const vertical = briefing.vertical || 'general'
    const estiloVisual = briefing.estiloVisual || 'professional'
    
    let layout = 'sidebar'
    let density = 'compact'
    if (vertical === 'retail' || vertical === 'restaurant') {
      layout = 'topbar'
      density = 'comfortable'
    }

    let paletteChoice = 'slate'
    let typography = 'Roboto'
    if (estiloVisual === 'creative' || vertical === 'retail') {
      paletteChoice = 'emerald'
      typography = 'Inter'
    } else if (estiloVisual === 'soft' || vertical === 'clinica') {
      paletteChoice = 'violet'
      typography = 'Outfit'
    }

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

    // Validar en tiempo de resolución para fallar temprano ante inconsistencias
    ExperienceSchema.parse(resolved.experience)
    BrandingSchema.parse(resolved.branding)

    return resolved
  }
}
export const ExperienceResolver = new ExperienceResolverClass()
```

---

## 4. ComponentRegistry y PatternRegistry con Gobernanza Estricta

### ComponentRegistry con Validación de Permisos (`src/core/config/ComponentRegistry.js`)
El registro convalida capacidades antes de resolver la promesa de importación:
```javascript
import { PermissionRegistry } from '../permissions/PermissionRegistry'

class ComponentRegistryClass {
  constructor() {
    this.registry = {
      widgets: new Map(),
      layouts: new Map(),
      pages: new Map(),
      forms: new Map(),
      blocks: new Map()
    }
  }

  register(type, id, importPromise, meta = {}) {
    if (!this.registry[type]) throw new Error(`Tipo inválido: ${type}`)
    this.registry[type].set(id, {
      importPromise,
      owner: meta.owner || 'unknown',
      version: meta.version || '1.0.0',
      permission: meta.permission || null,
      status: 'registered'
    })
  }

  getWithPermission(type, id, userRole) {
    const comp = this.registry[type]?.get(id)
    if (!comp) return null

    if (comp.permission && typeof PermissionRegistry !== 'undefined') {
      const hasPermission = PermissionRegistry.hasPermission(userRole, comp.permission)
      if (!hasPermission) {
        console.warn(`[ComponentRegistry] Acceso denegado a [${type}] ${id} para el rol ${userRole}`)
        return null
      }
    }
    return comp.importPromise
  }

  unregisterAllByOwner(owner) {
    for (const type of Object.keys(this.registry)) {
      for (const [id, comp] of this.registry[type].entries()) {
        if (comp.owner === owner) {
          this.registry[type].delete(id)
        }
      }
    }
  }
}
export const ComponentRegistry = new ComponentRegistryClass()
```

### PatternRegistry con Gobernanza y Metadatos (`src/core/config/PatternRegistry.js`)
Cada patrón de interacción declara sus metadatos y dependencias funcionales:
```javascript
import { PermissionRegistry } from '../permissions/PermissionRegistry'

class PatternRegistryClass {
  constructor() {
    this.patterns = new Map()
  }

  /**
   * Registra un patrón de interacción.
   * @param {string} patternId 
   * @param {object} config - { owner, version, requiredFeatures, permissions, component }
   */
  registerPattern(patternId, config) {
    this.patterns.set(patternId, {
      owner: config.owner || 'core',
      version: config.version || '1.0.0',
      requiredFeatures: config.requiredFeatures || [],
      permissions: config.permissions || [],
      component: config.component
    })
  }

  /**
   * Obtiene el componente del patrón si se satisfacen las dependencias de features y permisos.
   * @param {string} patternId 
   * @param {string[]} activeFeatures 
   * @param {string} userRole 
   */
  getPatternWithGovernance(patternId, activeFeatures, userRole) {
    const pattern = this.patterns.get(patternId)
    if (!pattern) return null

    // 1. Validar dependencia de features
    const hasRequiredFeatures = pattern.requiredFeatures.every(f => activeFeatures.includes(f))
    if (!hasRequiredFeatures) {
      console.warn(`[PatternRegistry] Patrón ${patternId} requiere features [${pattern.requiredFeatures}] inactivas.`)
      return null
    }

    // 2. Validar permisos
    if (pattern.permissions.length > 0 && typeof PermissionRegistry !== 'undefined') {
      const hasAccess = pattern.permissions.every(p => PermissionRegistry.hasPermission(userRole, p))
      if (!hasAccess) {
        console.warn(`[PatternRegistry] Acceso denegado a patrón ${patternId} para el rol ${userRole}`)
        return null
      }
    }

    return pattern.component
  }
}
export const PatternRegistry = new PatternRegistryClass()
```

---

## 5. DashboardComposer (`core/dashboard/DashboardComposer.js`)

Módulo del Core encargado de orquestar la composición de la rejilla de control leyendo `dashboard.json` y coordinando con `ComponentRegistry`:

```javascript
import { ComponentRegistry } from '../config/ComponentRegistry'

class DashboardComposerClass {
  /**
   * Compone el dashboard combinando los widgets activos habilitados por permisos.
   * @param {object} dashboardConfig - { activeWidgets } de dashboard.json
   * @param {string} userRole - Rol del usuario logueado
   * @returns {Array<{id, size, componentPromise}>} Lista de widgets resueltos
   */
  compose(dashboardConfig = {}, userRole) {
    const activeWidgets = dashboardConfig.activeWidgets || []
    const composed = []

    for (const widget of activeWidgets) {
      const componentPromise = ComponentRegistry.getWithPermission('widgets', widget.id, userRole)
      if (componentPromise) {
        composed.push({
          id: widget.id,
          size: widget.size || 'col-span-12',
          componentPromise
        })
      }
    }

    return composed
  }
}
export const DashboardComposer = new DashboardComposerClass()
```

---

## 6. Build Manifest (`build-manifest.json`)
Escrito dinámicamente por la CLI (`generator.js`) durante la creación del proyecto en `src/config/build-manifest.json` para auditoría estática de la instancia:
```json
{
  "vertical": "clinica",
  "featuresInstalled": ["appointments", "patients", "billing"],
  "patternsActive": ["pattern-calendar-workspace", "pattern-search-details"],
  "coreVersion": "2.8.0",
  "generatedAt": "2026-07-11T01:10:00Z"
}
```
