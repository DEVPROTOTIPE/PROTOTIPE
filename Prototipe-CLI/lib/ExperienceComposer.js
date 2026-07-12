import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');

export class ExperienceComposer {
  /**
   * Resuelve y compone la experiencia visual y estructural (layouts, widgets, etc.) a partir del catálogo.
   * @param {Object} blueprint
   * @param {Object} briefingContext Contexto cualitativo del briefing
   * @returns {Promise<Object>} Resultado de la composición con explicaciones
   */
  static async compose(blueprint, briefingContext = {}) {
    console.log('🎨 [ExperienceComposer] Componiendo interfaz de experiencia con ranking ponderado y fallbacks...');
    const auditTrail = [];

    // Fallbacks por defecto en caso de briefing vacío o inválido
    const { 
      device = 'desktop', 
      operationalContext = 'desktop-office', 
      visualStyle = 'modern-clean' 
    } = briefingContext;

    // Cargar catálogos con tolerancia a fallos
    let layoutsData = { layouts: [] };
    let densitiesData = { densities: [] };
    let typographiesData = { typography: [] };
    let widgetsData = { widgets: [] };

    try {
      layoutsData = await fs.readJson(path.join(CLI_ROOT, 'knowledge', 'experience', 'layouts.json'));
      densitiesData = await fs.readJson(path.join(CLI_ROOT, 'knowledge', 'experience', 'densities.json'));
      typographiesData = await fs.readJson(path.join(CLI_ROOT, 'knowledge', 'experience', 'typography.json'));
      widgetsData = await fs.readJson(path.join(CLI_ROOT, 'knowledge', 'experience', 'dashboard-widgets.json'));
    } catch (err) {
      console.warn('⚠️  [ExperienceComposer] Error cargando catálogos de experiencia. Usando fallbacks de emergencia.');
    }

    // 1. Resolver Layout (Fallback: sidebar)
    let resolvedLayout = 'sidebar';
    const layoutMatch = layoutsData.layouts.find(l => 
      l.devices.includes(device) && l.operationalContexts.includes(operationalContext)
    );
    if (layoutMatch) {
      resolvedLayout = layoutMatch.id;
      auditTrail.push({
        decision: `Layout "${resolvedLayout}" seleccionado`,
        source: "knowledge/experience/layouts.json",
        reason: `Compatible con dispositivo "${device}" y contexto operativo "${operationalContext}".`,
        confidence: 0.95
      });
    } else {
      auditTrail.push({
        decision: `Layout de fallback "sidebar" aplicado`,
        source: "ExperienceComposer.js",
        reason: `No se encontró coincidencia para dispositivo "${device}" y contexto "${operationalContext}". Usando fallback estándar.`,
        confidence: 0.70
      });
    }

    // 2. Resolver Densidad (Fallback: comfortable)
    let resolvedDensity = 'comfortable';
    const densityMatch = densitiesData.densities.find(d => d.contexts.includes(operationalContext));
    if (densityMatch) {
      resolvedDensity = densityMatch.id;
      auditTrail.push({
        decision: `Densidad "${resolvedDensity}" seleccionada`,
        source: "knowledge/experience/densities.json",
        reason: `Recomendada para el contexto operativo "${operationalContext}".`,
        confidence: 0.92
      });
    } else {
      auditTrail.push({
        decision: `Densidad de fallback "comfortable" aplicada`,
        source: "ExperienceComposer.js",
        reason: `Contexto operativo "${operationalContext}" no configurado en densidad. Usando fallback.`,
        confidence: 0.70
      });
    }

    // 3. Resolver Tipografía (Fallback: Outfit)
    let resolvedTypography = 'Outfit';
    const typoMatch = typographiesData.typography.find(t => t.visualStyles.includes(visualStyle));
    if (typoMatch) {
      resolvedTypography = typoMatch.id;
      auditTrail.push({
        decision: `Tipografía "${resolvedTypography}" seleccionada`,
        source: "knowledge/experience/typography.json",
        reason: `Combina con la vibra visual buscada: "${visualStyle}".`,
        confidence: 0.90
      });
    } else {
      auditTrail.push({
        decision: `Tipografía de fallback "Outfit" aplicada`,
        source: "ExperienceComposer.js",
        reason: `Vibra visual "${visualStyle}" no indexada. Usando fallback tipográfico Outfit.`,
        confidence: 0.70
      });
    }

    // 4. Resolver y Organizar Widgets del Bento Dashboard con Match de Capacidades y Calidad
    const resolvedWidgets = [];
    const blueprintCapabilities = blueprint.capabilities || [];
    
    for (const widget of widgetsData.widgets) {
      // Un widget es compatible si sus capacidades requeridas están en el blueprint (o no requiere ninguna)
      const hasCap = widget.requiredCapabilities.length === 0 || 
                     widget.requiredCapabilities.every(c => blueprintCapabilities.includes(c));

      if (hasCap) {
        let bestComponent = null;
        let bestScore = -1;
        const candidates = [];

        for (const compId of widget.recommendedComponents) {
          const compFileName = compId.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
          const compPath = path.join(CLI_ROOT, 'knowledge', 'components', `${compFileName}.json`);
          
          if (await fs.pathExists(compPath)) {
            const compMeta = await fs.readJson(compPath);
            
            // A) Calcular superposición de capabilities (Bono de Capability Match)
            const matchedCaps = compMeta.capabilities.filter(c => blueprintCapabilities.includes(c));
            const capabilityMatchFactor = 1.0 + (matchedCaps.length * 0.2); // +20% por cada capacidad resuelta en común

            // B) Calcular base score por calidad
            let baseScore = (compMeta.qualityScore * 0.4) + 
                            (compMeta.performanceScore * 0.4) + 
                            (compMeta.accessibilityScore * 0.2);

            // Penalización por estabilidad
            if (compMeta.maturityLevel !== 'stable') {
              baseScore -= 20;
            }

            // Score Final Ponderado
            const finalScore = baseScore * capabilityMatchFactor;

            candidates.push({
              compId,
              finalScore,
              matchedCaps,
              baseScore,
              reason: `Matched capabilities: [${matchedCaps.join(', ')}]. Base Quality: ${baseScore.toFixed(0)}.`
            });

            if (finalScore > bestScore) {
              bestScore = finalScore;
              bestComponent = compId;
            }
          }
        }

        // Ordenar candidatos por score final para el registro de descartados
        candidates.sort((a, b) => b.finalScore - a.finalScore);
        const chosen = candidates.find(c => c.compId === bestComponent);
        const discarded = candidates.filter(c => c.compId !== bestComponent);

        resolvedWidgets.push({
          widgetId: widget.id,
          size: widget.size,
          component: bestComponent,
          decisionLog: {
            chosen: bestComponent,
            capabilityOrigin: widget.requiredCapabilities,
            score: bestScore > 0 ? parseFloat(bestScore.toFixed(1)) : 'N/A',
            alternativesDiscarded: discarded.map(d => ({
              compId: d.compId,
              score: parseFloat(d.finalScore.toFixed(1)),
              reason: `Rechazado por menor puntuación de match o calidad.`
            }))
          }
        });

        auditTrail.push({
          decision: `Widget "${widget.id}" inyectado en el Bento Dashboard`,
          source: "knowledge/experience/dashboard-widgets.json",
          reason: `Satisface la capacidad operativa. Componente elegido: "${bestComponent || 'Ninguno'}" (Score: ${bestScore > 0 ? bestScore.toFixed(1) : 'N/A'}). Alternativas descartadas: ${discarded.length}.`,
          confidence: 0.88
        });
      }
    }

    return {
      experience: {
        layout: resolvedLayout,
        density: resolvedDensity,
        themeMode: device === 'mobile' ? 'light' : 'dark-detect',
        typography: resolvedTypography
      },
      dashboard: {
        widgets: resolvedWidgets
      },
      auditTrail
    };
  }
}
