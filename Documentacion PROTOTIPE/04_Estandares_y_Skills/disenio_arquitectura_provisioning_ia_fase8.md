# Diseño y Arquitectura: Fase 8 — Product Intelligence + AI Provisioning + Experience Composer

Este documento presenta la especificación de diseño arquitectónico final y definitiva para la **Fase 8**. Define la transición de Prototype a una plataforma generadora desacoplada basada en un modelo de 3 capas, gobernada por capacidades y un contrato de Blueprint intermedio.

---

## 1. El Flujo de Generación Estricto

Para garantizar la predictibilidad y la trazabilidad de la toma de decisiones, la generación física en el disco nunca ocurre de forma directa. Debe atravesar secuencialmente este pipeline:

```
[ Briefing Studio ] (Entrada Cualitativa)
        │
        ▼
  [ BiResolver ] (Extrae términos de negocio)
        │
        ▼
[ CapabilityResolver ] (Mapea necesidades a capacidades técnicas)
        │
        ▼
[ FeatureRecommender ] (Resuelve dependencias y restricciones)
        │
        ▼
[ ExperienceComposer ] (Configura Layout, Densidad, Branding y Widgets)
        │
        ▼
[ Application Blueprint ] (Contrato Central Intermedio)
        │
        ▼
[ ProvisioningValidator ] (Audita compatibilidades y dependencias)
        │
        ▼
[ Blueprint Simulation ] (Preflight Check: bundle, roles, componentes)
        │
        ▼
   [ generator.js ] (Ejecutor Físico Plano - Ignorante de Negocio)
```

---

## 2. Capa de Conocimiento Granular Extensible (Knowledge Layer)

La Knowledge Layer se organiza en subcarpetas físicas modulares bajo `Prototipe-CLI/knowledge/`. La unidad fundamental de deducción es la **Capacidad**, no la industria.

```
Prototipe-CLI/knowledge/
├── features/
│   ├── appointments.json
│   ├── inventory.json
│   └── crm.json
│
├── components/
│   ├── premium-calendar.json
│   └── lead-table.json
│
├── patterns/
│   ├── calendar-workspace.json
│   └── search-details.json
│
├── industries/
│   ├── healthcare.json
│   └── retail.json
│
└── capabilities/
    └── capability-map.json
```

### 📄 Ejemplo de Feature (`knowledge/features/appointments.json`)
```json
{
  "id": "appointments",
  "displayName": "Agenda de Citas",
  "capabilities": ["calendar-management", "reservations", "sms-reminders"],
  "compatibleIndustries": ["healthcare", "wellness", "education", "services"],
  "dependencies": ["patients"],
  "npmDependencies": {
    "framer-motion": "^11.0.0"
  }
}
```

### 📄 Ejemplo de Mapa de Capacidades (`knowledge/capabilities/capability-map.json`)
Define qué features y componentes satisfacen cada capacidad técnica unificada:
```json
{
  "capabilities": {
    "calendar-management": {
      "resolvesFeatures": ["appointments"],
      "resolvesComponents": ["PremiumCalendar"],
      "resolvesPatterns": ["pattern-calendar-workspace"]
    },
    "customer-tracking": {
      "resolvesFeatures": ["crm"],
      "resolvesComponents": ["LeadKanban"],
      "resolvesPatterns": ["pattern-kanban-workspace"]
    }
  }
}
```

---

## 3. CapabilityResolver (`core/experience/CapabilityResolver.js`)

Módulo encargado de mapear la especificación de requerimientos de negocio a capacidades técnicas compartidas entre industrias.
* Traduce conceptos cualitativos (ej. `"reservas de turnos de peluquería"` o `"agenda médica"`) a una firma técnica unificada: `"calendar-management"`.
* Esto permite al sistema reutilizar la misma lógica de agenda y calendarios premium entre industrias totalmente disímiles sin acoplar el código.

---

## 4. Metadata del Component Marketplace
Cada componente UI indexado en el Marketplace debe declarar obligatoriamente metadatos de calidad del producto:
```json
{
  "id": "PremiumCalendar",
  "version": "1.2.0",
  "category": "Visualizacion",
  "capabilities": ["calendar-view", "slot-picker"],
  "requiredFeatures": ["appointments"],
  "compatibleIndustries": ["healthcare", "wellness", "education"],
  "dependencies": {
    "npm": ["lucide-react", "framer-motion"],
    "internal": []
  },
  "permissions": ["appointments.view"],
  "maturityLevel": "stable",
  "responsiveSupport": "mobile-first",
  "accessibilityScore": 95,
  "performanceScore": 98
}
```

---

## 5. El Application Blueprint Contract
El Blueprint unifica la arquitectura de la app y posee versión explícita para control de retrocompatibilidad:
```json
{
  "blueprintVersion": "1.0.0",
  "instanceId": "clinica-veterinaria-sanitas",
  "clientName": "Clínica Veterinaria Sanitas",
  "vertical": "clinica",
  "features": ["appointments", "patients", "billing"],
  "patterns": ["pattern-calendar-workspace", "pattern-search-details"],
  "components": ["PremiumCalendar", "PatientTable"],
  "experience": {
    "layout": "sidebar",
    "density": "compact",
    "themeMode": "dark-detect",
    "typography": "Outfit"
  },
  "branding": {
    "paletteChoice": "violet",
    "initials": "CVS"
  }
}
```

---

## 6. Explainability System (Bitácora de Decisiones)
Cada resolución inteligente del motor emite un rastro de auditoría que documenta el motivo, la confianza y la justificación técnica de la decisión:
* **`.prototipe-audit-trail.jsonl`:** Archivo JSONL estructurado de auditoría en la raíz de la instancia.
  ```json
  {"timestamp":"2026-07-11T01:50:00Z","decision":"appointments added","reason":"El briefing indicó gestión de reservas y calendario","confidence":0.94}
  ```
* **`historial_<clientId>.md`:** Informe Markdown amigable para el desarrollador/cliente detallando las justificaciones operativas del ensamblaje.

---

## 7. Blueprint Simulation
Paso intermedio que realiza un Preflight Check completo antes de alterar el disco físico:
* **Dependencias:** Calcula y valida todas las dependencias NPM y de features requeridas.
* **Impacto de Rendimiento:** Estima el peso final del bundle y advierte sobre dependencias NPM conflictivas.
* **Visualización:** Emite un resumen de la composición (ej. *"Esta app tendrá 5 features, 14 componentes, Bento dashboard, 3 roles"*).

---

## 8. Roadmap de Implementación Ajustado

* **Fase 8.1: Knowledge Layer + Metadata Biblioteca (Hito Inicial)**
  * Estructurar el directorio `knowledge/` con subcarpetas para `features/`, `components/`, `patterns/`, `industries/` y `capabilities/`.
  * Indexar y documentar las fichas técnicas `.md` de la biblioteca con sus metadatos de gobernanza y scores de calidad.
* **Fase 8.2: Application Blueprint + Validator**
  * Definir el contrato JSON con versión y estructurar `ProvisioningValidator.js` y el simulador de bundle `BlueprintSimulation.js`.
  * Crear el fusionador dinámico de dependencias `PackageMerger.js`.
* **Fase 8.3: Capability & Feature Recommendation Engine**
  * Crear `CapabilityResolver.js` y `FeatureRecommender.js` para mapear de capacidades semánticas a features sin código condicional.
* **Fase 8.4: Experience Composer**
  * Crear el resolvedor dinámico de layouts, tipografías y Bento widgets analíticos.
* **Fase 8.5: AI/LLM Integration Futura**
  * Preparar el canal de inyección del Blueprint generado por IA en el motor físico.
* **Fase 8.6: Validación y Simulación Multivertical**
  * Certificar la generación y paridad de 6 instancias: Clínica Veterinaria, Restaurantes, CRM Inmobiliarios, Academias, Gimnasios y la app base Vacía.
