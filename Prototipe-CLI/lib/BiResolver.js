import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');

export class BiResolver {
  /**
   * Resuelve los requerimientos cualitativos del briefing y los mapea a capacidades y contexto.
   * @param {Object} answers Respuestas del briefing
   * @returns {Promise<Object>} Definición resuelta con capacidades y explicaciones
   */
  static async resolve(answers) {
    console.log('🧠 [BiResolver] Analizando respuestas del briefing cualitativo...');
    const auditTrail = [];
    const requestedCapabilities = new Set();

    const textToAnalyze = [
      answers.projectName || '',
      answers.customRequirements || '',
      answers.processes || '',
      answers.industry || ''
    ].join(' ').toLowerCase();

    // Cargar mapa de capacidades de la Knowledge Layer
    const capabilityMapPath = path.join(CLI_ROOT, 'knowledge', 'capabilities', 'capability-map.json');
    if (!await fs.pathExists(capabilityMapPath)) {
      throw new Error(`Falta el archivo crítico del mapa de capacidades en: ${capabilityMapPath}`);
    }

    const { capabilities: catalog } = await fs.readJson(capabilityMapPath);

    // Mapear semánticamente basándose en keywords asociadas a tags de capacidades
    Object.entries(catalog).forEach(([capKey, capMeta]) => {
      const match = capMeta.tags.some(tag => textToAnalyze.includes(tag.toLowerCase()));
      if (match) {
        requestedCapabilities.add(capKey);
        auditTrail.push({
          decision: `Capacidad "${capKey}" deducida`,
          source: "knowledge/capabilities/capability-map.json",
          reason: `Match semántico de palabras clave asociadas a "${capMeta.displayName}".`,
          confidence: 0.85
        });
      }
    });

    // Deducción de vertical a partir del contexto comercial (como contexto descriptivo)
    let resolvedVertical = 'vacio';
    if (textToAnalyze.includes('clinic') || textToAnalyze.includes('médic') || textToAnalyze.includes('veterinari') || textToAnalyze.includes('citas')) {
      resolvedVertical = 'clinica';
    } else if (textToAnalyze.includes('ventas') || textToAnalyze.includes('caja') || textToAnalyze.includes('stock') || textToAnalyze.includes('tienda') || textToAnalyze.includes('retail')) {
      resolvedVertical = 'retail';
    } else if (textToAnalyze.includes('crm') || textToAnalyze.includes('lead') || textToAnalyze.includes('prospecto') || textToAnalyze.includes('inmobiliari')) {
      resolvedVertical = 'crm';
    } else if (textToAnalyze.includes('restauran') || textToAnalyze.includes('comida') || textToAnalyze.includes('mesa') || textToAnalyze.includes('bar')) {
      resolvedVertical = 'restaurante';
    }

    auditTrail.push({
      decision: `Contexto vertical deducido: "${resolvedVertical}"`,
      source: "BiResolver.js",
      reason: `Analizado el vocabulario comercial descriptivo del cliente.`,
      confidence: 0.90
    });

    return {
      vertical: resolvedVertical,
      capabilities: Array.from(requestedCapabilities),
      context: {
        device: answers.device || 'desktop',
        operationalContext: answers.operationalContext || 'desktop-office',
        visualStyle: answers.visualStyle || 'modern-clean'
      },
      auditTrail
    };
  }
}
