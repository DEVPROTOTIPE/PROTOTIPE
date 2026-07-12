/**
 * fixtures.js
 * 
 * Payloads de prueba para validación estructural y semántica de Blueprints (Fase P0.2).
 */

export const canonicalMinimal = {
  blueprintVersion: "1.0.0",
  instanceId: "tienda-ropa-xyz",
  clientName: "Tienda Ropa XYZ",
  coreType: "template-core-seed",
  vertical: "retail_clothing",
  branding: {
    paletteChoice: "emerald"
  },
  features: [],
  components: [],
  patterns: []
};

export const canonicalFull = {
  blueprintVersion: "1.0.0",
  instanceId: "tienda-ropa-xyz",
  clientName: "Tienda Ropa XYZ",
  coreType: "template-ventas",
  vertical: "retail_clothing",
  branding: {
    paletteChoice: "emerald"
  },
  features: ["inventory", "sales", "orders", "billing"],
  components: ["CajaDiariaPOS", "OrderCard"],
  patterns: ["pattern-wizard-flow", "pattern-search-details"]
};

export const legacyPayload = {
  version: "1.0.0",
  clientId: "tienda-ropa-xyz",
  projectName: "Tienda Ropa XYZ",
  template: "template-core-seed",
  niche: "retail_clothing",
  paletteChoice: "emerald",
  features: [],
  components: [],
  patterns: []
};

export const legacyPayloadWithNicheState = {
  version: "1.0.0",
  clientId: "tienda-ropa-xyz",
  projectName: "Tienda Ropa XYZ",
  template: "template-core-seed",
  niche: "general_custom",
  paletteChoice: "emerald",
  features: [],
  components: [],
  patterns: []
};

export const mixedPayloadEqual = {
  blueprintVersion: "1.0.0",
  version: "1.0.0",
  instanceId: "tienda-ropa-xyz",
  clientId: "tienda-ropa-xyz",
  clientName: "Tienda Ropa XYZ",
  projectName: "Tienda Ropa XYZ",
  coreType: "template-core-seed",
  template: "template-core-seed",
  vertical: "retail_clothing",
  niche: "retail_clothing",
  branding: {
    paletteChoice: "emerald"
  },
  paletteChoice: "emerald",
  features: [],
  components: [],
  patterns: []
};

export const mixedPayloadConflictingIds = {
  instanceId: "tienda-ropa-a",
  clientId: "tienda-ropa-b",
  clientName: "Tienda Ropa A",
  projectName: "Tienda Ropa A",
  blueprintVersion: "1.0.0",
  coreType: "template-core-seed",
  vertical: "retail_clothing",
  branding: {
    paletteChoice: "emerald"
  },
  features: [],
  components: [],
  patterns: []
};

export const mixedPayloadConflictingNames = {
  instanceId: "tienda-ropa-xyz",
  clientName: "Tienda Ropa Canónica",
  projectName: "  Tienda Ropa Legacy Distinta  ",
  blueprintVersion: "1.0.0",
  coreType: "template-core-seed",
  vertical: "retail_clothing",
  branding: {
    paletteChoice: "emerald"
  },
  features: [],
  components: [],
  patterns: []
};

export const brandingCustomValid = {
  blueprintVersion: "1.0.0",
  instanceId: "tienda-ropa-xyz",
  clientName: "Tienda Ropa XYZ",
  coreType: "template-core-seed",
  vertical: "retail_clothing",
  branding: {
    paletteChoice: "custom",
    primaryColor: "hsl(142, 70%, 45%)",
    secondaryColor: "hsl(262, 83%, 58%)"
  },
  features: [],
  components: [],
  patterns: []
};

export const brandingCustomInvalidMissingSecondary = {
  blueprintVersion: "1.0.0",
  instanceId: "tienda-ropa-xyz",
  clientName: "Tienda Ropa XYZ",
  coreType: "template-core-seed",
  vertical: "retail_clothing",
  branding: {
    paletteChoice: "custom",
    primaryColor: "hsl(142, 70%, 45%)"
  },
  features: [],
  components: [],
  patterns: []
};

export const brandingNonCustomWithColors = {
  blueprintVersion: "1.0.0",
  instanceId: "tienda-ropa-xyz",
  clientName: "Tienda Ropa XYZ",
  coreType: "template-core-seed",
  vertical: "retail_clothing",
  branding: {
    paletteChoice: "emerald",
    primaryColor: "hsl(142, 70%, 45%)",
    secondaryColor: "hsl(262, 83%, 58%)"
  },
  features: [],
  components: [],
  patterns: []
};
