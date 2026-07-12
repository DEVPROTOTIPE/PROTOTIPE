/**
 * test_dashboard_payload_contract.js
 * 
 * Suite de pruebas para certificar el adapter de salida del Dashboard (provisioningPayload.js).
 * Valida la correcta normalizacion de payloads legacy, clasificacion de recomendaciones
 * y separacion de capas de infraestructura.
 */

import { buildProvisioningPayload } from '../../../../Central PROTOTIPE/dev-dashboard/src/utils/provisioningPayload.js';

export async function run(results) {
  const suiteName = 'P0.2 - Dashboard Payload Contract Tests';
  console.log(`\n⏳ Ejecutando ${suiteName}...`);

  // Caso 1: Payload legacy del Wizard
  try {
    const legacyPayload = {
      projectName: 'Tienda Demo',
      clientId: 'tienda-demo',
      template: 'template-core-seed',
      niche: 'retail_clothing',
      paletteChoice: 'emerald'
    };

    const envelope = buildProvisioningPayload(legacyPayload);

    const isMatch =
      envelope.blueprint.clientName === 'Tienda Demo' &&
      envelope.blueprint.instanceId === 'tienda-demo' &&
      envelope.blueprint.coreType === 'template-core-seed' &&
      envelope.blueprint.vertical === 'retail_clothing' &&
      envelope.blueprint.branding.paletteChoice === 'emerald';

    if (isMatch) {
      console.log('🟢 [PASSED] Caso 1: Payload legacy del Wizard normalizado correctamente.');
      results.push({
        suite: suiteName,
        name: 'Caso 1: Normalizacion de payload legacy del Wizard',
        status: 'PASSED'
      });
    } else {
      console.error('🔴 [FAILED] Caso 1: Estructura resultante invalida.', envelope);
      results.push({
        suite: suiteName,
        name: 'Caso 1: Normalizacion de payload legacy del Wizard',
        status: 'FAILED',
        error: 'El payload legacy normalizado no coincide con los campos esperados.'
      });
    }
  } catch (err) {
    console.error('🔴 [FAILED] Caso 1 arrojo error:', err.message);
    results.push({
      suite: suiteName,
      name: 'Caso 1: Normalizacion de payload legacy del Wizard',
      status: 'FAILED',
      error: err.message
    });
  }

  // Caso 2: Recommendations
  try {
    const recommendationsPayload = {
      projectName: 'Tienda Recs',
      clientId: 'tienda-recs',
      template: 'template-core-seed',
      niche: 'retail_clothing',
      paletteChoice: 'emerald',
      selectedRecomendations: [
        'sales',
        'OrderCard',
        'pattern-wizard-flow'
      ]
    };

    const envelope = buildProvisioningPayload(recommendationsPayload);

    const hasCorrectRecs =
      envelope.blueprint.features.includes('sales') &&
      envelope.blueprint.features.length === 1 &&
      envelope.blueprint.components.includes('OrderCard') &&
      envelope.blueprint.components.length === 1 &&
      envelope.blueprint.patterns.includes('pattern-wizard-flow') &&
      envelope.blueprint.patterns.length === 1;

    if (hasCorrectRecs) {
      console.log('🟢 [PASSED] Caso 2: Recomendaciones clasificadas correctamente.');
      results.push({
        suite: suiteName,
        name: 'Caso 2: Clasificacion de recomendaciones',
        status: 'PASSED'
      });
    } else {
      console.error('🔴 [FAILED] Caso 2: Clasificacion incorrecta de recomendaciones.', envelope.blueprint);
      results.push({
        suite: suiteName,
        name: 'Caso 2: Clasificacion de recomendaciones',
        status: 'FAILED',
        error: 'Las recomendaciones no fueron clasificadas en features/components/patterns de forma correcta.'
      });
    }
  } catch (err) {
    console.error('🔴 [FAILED] Caso 2 arrojo error:', err.message);
    results.push({
      suite: suiteName,
      name: 'Caso 2: Clasificacion de recomendaciones',
      status: 'FAILED',
      error: err.message
    });
  }

  // Caso 3: Separacion de capas de infraestructura
  try {
    const infraPayload = {
      projectName: 'Tienda Infra',
      clientId: 'tienda-infra',
      template: 'template-core-seed',
      niche: 'retail_clothing',
      paletteChoice: 'emerald',
      adminEmail: 'admin@infra.com',
      firebaseApiKey: 'key-123',
      telemetryToken: 'token-abc'
    };

    const envelope = buildProvisioningPayload(infraPayload);

    const isIsolated =
      envelope.adminEmail === 'admin@infra.com' &&
      envelope.firebaseApiKey === 'key-123' &&
      envelope.telemetryToken === 'token-abc' &&
      envelope.blueprint.adminEmail === undefined &&
      envelope.blueprint.firebaseApiKey === undefined &&
      envelope.blueprint.telemetryToken === undefined &&
      envelope.execution.adminEmail === undefined &&
      envelope.execution.firebaseApiKey === undefined &&
      envelope.execution.telemetryToken === undefined;

    if (isIsolated) {
      console.log('🟢 [PASSED] Caso 3: Variables de infraestructura aisladas del blueprint.');
      results.push({
        suite: suiteName,
        name: 'Caso 3: Aislamiento de infraestructura del blueprint',
        status: 'PASSED'
      });
    } else {
      console.error('🔴 [FAILED] Caso 3: Variables de infraestructura contaminaron el blueprint o execution.', envelope);
      results.push({
        suite: suiteName,
        name: 'Caso 3: Aislamiento de infraestructura del blueprint',
        status: 'FAILED',
        error: 'Variables de infraestructura encontradas dentro de blueprint o execution.'
      });
    }
  } catch (err) {
    console.error('🔴 [FAILED] Caso 3 arrojo error:', err.message);
    results.push({
      suite: suiteName,
      name: 'Caso 3: Aislamiento de infraestructura del blueprint',
      status: 'FAILED',
      error: err.message
    });
  }
}
