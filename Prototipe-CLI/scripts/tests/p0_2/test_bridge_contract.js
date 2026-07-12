/**
 * test_bridge_contract.js
 * 
 * Suite de pruebas para certificar la frontera contractual del Bridge (server.js).
 * Valida la correcta normalizacion de payloads legacy, mixtos y canonicos
 * a traves de ProvisioningEnvelopeAdapter.js.
 */

import { normalizeProvisioningEnvelope } from '../../../lib/ProvisioningEnvelopeAdapter.js';

export async function run(results) {
  const suiteName = 'P0.2 - Bridge Envelope Contract Tests';
  console.log(`\n⏳ Ejecutando ${suiteName}...`);

  // Caso 1: Payload actual Dashboard (legacy plano)
  try {
    const legacyPayload = {
      projectName: 'Tienda Moda XYZ',
      clientId: 'tienda-moda-xyz',
      template: 'template-core-seed',
      niche: 'retail_clothing',
      paletteChoice: 'ruby',
      adminEmail: 'admin@tienda.com',
      firebaseApiKey: 'api-key-123',
      centralApiKey: 'central-key',
      centralAppId: 'central-app-id',
      targetPath: 'd:/PROTOTIPE/Instancias Clientes/seed/App-tienda-moda-xyz'
    };

    const envelope = normalizeProvisioningEnvelope(legacyPayload);

    const isMatch = 
      envelope.blueprint.clientName === 'Tienda Moda XYZ' &&
      envelope.blueprint.instanceId === 'tienda-moda-xyz' &&
      envelope.blueprint.coreType === 'template-core-seed' &&
      envelope.blueprint.vertical === 'retail_clothing' &&
      envelope.blueprint.branding.paletteChoice === 'ruby' &&
      envelope.execution.targetPath === 'd:/PROTOTIPE/Instancias Clientes/seed/App-tienda-moda-xyz' &&
      envelope.adminEmail === 'admin@tienda.com' &&
      envelope.firebaseApiKey === 'api-key-123';

    if (isMatch) {
      console.log('🟢 [PASSED] Caso 1: Payload actual Dashboard normalizado correctamente.');
      results.push({
        suite: suiteName,
        name: 'Caso 1: Normalizacion de payload legacy plano',
        status: 'PASSED'
      });
    } else {
      console.error('🔴 [FAILED] Caso 1: Estructura resultante invalida.', envelope);
      results.push({
        suite: suiteName,
        name: 'Caso 1: Normalizacion de payload legacy plano',
        status: 'FAILED',
        error: 'El payload legacy normalizado no coincide con los campos esperados.'
      });
    }
  } catch (err) {
    console.error('🔴 [FAILED] Caso 1 arrojo error:', err.message);
    results.push({
      suite: suiteName,
      name: 'Caso 1: Normalizacion de payload legacy plano',
      status: 'FAILED',
      error: err.message
    });
  }

  // Caso 2: Payload ya canonico pasa sin transformaciones destructivas
  try {
    const canonicalPayload = {
      blueprint: {
        blueprintVersion: '1.0.0',
        instanceId: 'tienda-canonico',
        clientName: 'Tienda Canonico',
        coreType: 'template-core-seed',
        vertical: 'retail_clothing',
        branding: {
          paletteChoice: 'emerald'
        },
        features: ['sales'],
        components: [],
        patterns: []
      },
      execution: {
        targetPath: 'd:/PROTOTIPE/Instancias Clientes/seed/App-tienda-canonico',
        force: true,
        enableGithub: false,
        firebaseDeploy: false,
        centralRegistration: true
      },
      adminEmail: 'admin@tiendacanonica.com',
      centralApiKey: 'central-key',
      centralAppId: 'central-app-id'
    };

    const envelope = normalizeProvisioningEnvelope(canonicalPayload);

    const isMatch =
      envelope.blueprint.blueprintVersion === '1.0.0' &&
      envelope.blueprint.instanceId === 'tienda-canonico' &&
      envelope.blueprint.clientName === 'Tienda Canonico' &&
      envelope.blueprint.vertical === 'retail_clothing' &&
      envelope.blueprint.branding.paletteChoice === 'emerald' &&
      envelope.blueprint.features.includes('sales') &&
      envelope.execution.targetPath === 'd:/PROTOTIPE/Instancias Clientes/seed/App-tienda-canonico' &&
      envelope.execution.force === true &&
      envelope.adminEmail === 'admin@tiendacanonica.com';

    if (isMatch) {
      console.log('🟢 [PASSED] Caso 2: Payload ya canonico transmitido intacto.');
      results.push({
        suite: suiteName,
        name: 'Caso 2: Payload canonico sin mutar',
        status: 'PASSED'
      });
    } else {
      console.error('🔴 [FAILED] Caso 2: El payload canonico fue mutado incorrectamente.', envelope);
      results.push({
        suite: suiteName,
        name: 'Caso 2: Payload canonico sin mutar',
        status: 'FAILED',
        error: 'El payload canonico resulto alterado.'
      });
    }
  } catch (err) {
    console.error('🔴 [FAILED] Caso 2 arrojo error:', err.message);
    results.push({
      suite: suiteName,
      name: 'Caso 2: Payload canonico sin mutar',
      status: 'FAILED',
      error: err.message
    });
  }

  // Caso 3: Conflicto de aliases (ej: clientId vs instanceId inconsistentes)
  try {
    const conflictPayload = {
      blueprint: {
        clientName: 'Conflicto',
        instanceId: 'tienda-a'
      },
      clientId: 'tienda-b', // Conflicto directo
      template: 'template-core-seed',
      paletteChoice: 'ruby'
    };

    let errorThrown = null;
    try {
      normalizeProvisioningEnvelope(conflictPayload);
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown && errorThrown.message.includes('Conflicto')) {
      console.log('🟢 [PASSED] Caso 3: Conflicto de identificadores rechazado preventivamente.');
      results.push({
        suite: suiteName,
        name: 'Caso 3: Deteccion de conflicto de identificadores',
        status: 'PASSED'
      });
    } else {
      console.error('🔴 [FAILED] Caso 3: Se permitio un payload con identificadores en conflicto.', errorThrown);
      results.push({
        suite: suiteName,
        name: 'Caso 3: Deteccion de conflicto de identificadores',
        status: 'FAILED',
        error: 'No se arrojo error o el mensaje de error no indico conflicto.'
      });
    }
  } catch (err) {
    console.error('🔴 [FAILED] Caso 3 arrojo error inesperado:', err.message);
    results.push({
      suite: suiteName,
      name: 'Caso 3: Deteccion de conflicto de identificadores',
      status: 'FAILED',
      error: err.message
    });
  }
}
