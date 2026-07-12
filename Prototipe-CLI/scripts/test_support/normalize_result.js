import path from 'node:path';

/**
 * Normaliza objetos y salidas de caracterización para eliminar datos dinámicos o dependientes del host.
 */
export function normalizeResult(data) {
  if (!data || typeof data !== 'object') return data;

  const clone = JSON.parse(JSON.stringify(data));

  // 1. Reemplazar timestamps dinámicos
  if (clone.metadata) {
    if (clone.metadata.capturedAt) {
      clone.metadata.capturedAt = '2026-07-11T00:00:00.000Z';
    }
    if (clone.metadata.lastUpdatedAt) {
      clone.metadata.lastUpdatedAt = '2026-07-11T00:00:00.000Z';
    }
  }

  // 2. Normalizar rutas de archivos absolutas a relativas
  const normalizePathValue = (val) => {
    if (typeof val === 'string') {
      // Reemplazar rutas del host a un formato relativo universal
      let normalized = val.replace(/\\\\/g, '/').replace(/\\/g, '/');
      // Buscar patrones de rutas absolutas comunes del sistema de Sergio
      normalized = normalized.replace(/C:\/Users\/Sergio\/\.gemini\/antigravity\/brain\/[^/]+/g, 'WORKSPACE_ARTIFACT_DIR');
      normalized = normalized.replace(/D:\/PROTOTIPE_CHARACTERIZATION_SANDBOX/ig, 'SANDBOX_ROOT');
      normalized = normalized.replace(/D:\/PROTOTIPE/ig, 'MONOREPO_ROOT');
      normalized = normalized.replace(/C:\/[^/]+/g, 'SYSTEM_ROOT');
      return normalized;
    }
    return val;
  };

  const walk = (obj) => {
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        walk(obj[key]);
      } else {
        obj[key] = normalizePathValue(obj[key]);
      }
    }
  };

  walk(clone);
  return clone;
}
