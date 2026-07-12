/**
 * test_blueprint_adapter.js
 * 
 * Suite de pruebas normativas del Blueprint Adapter (Fase P0.2).
 */

import assert from 'node:assert/strict';
import * as fixtures from './fixtures.js';

export async function run(results) {
  const testName = 'P0.2 - Blueprint Adapter Tests';
  console.log(`\n⏳ Ejecutando ${testName}...`);

  // Intentar cargar la interfaz futura. Como no se permite crear BlueprintAdapter.js todavía,
  // esto debe resultar en MISSING_IMPLEMENTATION.
  let normalizeProvisioningRequest;
  try {
    const mod = await import('../../../lib/ProvisioningValidator.js');
    normalizeProvisioningRequest = mod.normalizeProvisioningRequest;
    if (typeof normalizeProvisioningRequest !== 'function') {
      throw new Error('normalizeProvisioningRequest no está definido como función');
    }
  } catch (err) {
    console.log(`🔴 [MISSING_IMPLEMENTATION] La interfaz normalizeProvisioningRequest no está implementada.`);
    results.push({
      suite: testName,
      name: 'normalizeProvisioningRequest interface availability',
      status: 'MISSING_IMPLEMENTATION',
      error: err.message
    });
    return;
  }

  const cases = [
    {
      name: '1. Payload canónico sin aliases',
      input: {
        blueprint: fixtures.canonicalMinimal,
        execution: { targetPath: 'ventas/test', force: false }
      },
      assert(output) {
        assert.deepEqual(output.blueprint, fixtures.canonicalMinimal);
        assert.equal(output.blueprint.clientId, undefined);
      }
    },
    {
      name: '2. clientId -> instanceId',
      input: {
        blueprint: { ...fixtures.canonicalMinimal, instanceId: undefined, clientId: 'tienda-ropa-xyz' },
        execution: { targetPath: 'ventas/test', force: false }
      },
      assert(output) {
        assert.equal(output.blueprint.instanceId, 'tienda-ropa-xyz');
        assert.equal(output.blueprint.clientId, undefined);
      }
    },
    {
      name: '3. projectName -> clientName con trim()',
      input: {
        blueprint: { ...fixtures.canonicalMinimal, clientName: undefined, projectName: '  Tienda Ropa XYZ  ' },
        execution: { targetPath: 'ventas/test', force: false }
      },
      assert(output) {
        assert.equal(output.blueprint.clientName, 'Tienda Ropa XYZ');
        assert.equal(output.blueprint.projectName, undefined);
      }
    },
    {
      name: '4. version -> blueprintVersion',
      input: {
        blueprint: { ...fixtures.canonicalMinimal, blueprintVersion: undefined, version: '1.0.0' },
        execution: { targetPath: 'ventas/test', force: false }
      },
      assert(output) {
        assert.equal(output.blueprint.blueprintVersion, '1.0.0');
        assert.equal(output.blueprint.version, undefined);
      }
    },
    {
      name: '5. niche oficial -> vertical',
      input: {
        blueprint: { ...fixtures.canonicalMinimal, vertical: undefined, niche: 'retail_clothing' },
        execution: { targetPath: 'ventas/test', force: false }
      },
      assert(output) {
        assert.equal(output.blueprint.vertical, 'retail_clothing');
        assert.equal(output.blueprint.niche, undefined);
      }
    },
    {
      name: '6. paletteChoice raíz -> branding.paletteChoice',
      input: {
        blueprint: { ...fixtures.canonicalMinimal, branding: { initials: 'TRX' }, paletteChoice: 'emerald' },
        execution: { targetPath: 'ventas/test', force: false }
      },
      assert(output) {
        assert.equal(output.blueprint.branding.paletteChoice, 'emerald');
        assert.equal(output.blueprint.paletteChoice, undefined);
      }
    },
    {
      name: '7. Aliases y campos canónicos iguales',
      input: {
        blueprint: fixtures.mixedPayloadEqual,
        execution: { targetPath: 'ventas/test', force: false }
      },
      assert(output) {
        assert.equal(output.blueprint.instanceId, 'tienda-ropa-xyz');
        assert.equal(output.blueprint.blueprintVersion, '1.0.0');
        assert.equal(output.blueprint.clientId, undefined);
      }
    },
    {
      name: '8. clientId e instanceId diferentes (Conflicto)',
      input: {
        blueprint: fixtures.mixedPayloadConflictingIds,
        execution: { targetPath: 'ventas/test', force: false }
      },
      shouldFail: true,
      errorMatch: /conflicto|diferente/i
    },
    {
      name: '9. projectName y clientName diferentes después de trim() (Conflicto)',
      input: {
        blueprint: fixtures.mixedPayloadConflictingNames,
        execution: { targetPath: 'ventas/test', force: false }
      },
      shouldFail: true,
      errorMatch: /conflicto|diferente/i
    },
    {
      name: '10. version y blueprintVersion diferentes (Conflicto)',
      input: {
        blueprint: { ...fixtures.canonicalMinimal, blueprintVersion: '1.0.0', version: '2.0.0' },
        execution: { targetPath: 'ventas/test', force: false }
      },
      shouldFail: true,
      errorMatch: /conflicto|diferente/i
    },
    {
      name: '11. niche y vertical diferentes (Conflicto)',
      input: {
        blueprint: { ...fixtures.canonicalMinimal, vertical: 'retail_clothing', niche: 'grocery_food' },
        execution: { targetPath: 'ventas/test', force: false }
      },
      shouldFail: true,
      errorMatch: /conflicto|diferente/i
    },
    {
      name: '12. paletteChoice raíz y anidado diferentes (Conflicto)',
      input: {
        blueprint: { ...fixtures.canonicalMinimal, branding: { paletteChoice: 'emerald' }, paletteChoice: 'ruby' },
        execution: { targetPath: 'ventas/test', force: false }
      },
      shouldFail: true,
      errorMatch: /conflicto|diferente/i
    },
    {
      name: '13. Campos legacy ausentes del resultado normalizado',
      input: {
        blueprint: fixtures.legacyPayload,
        execution: { targetPath: 'ventas/test', force: false }
      },
      assert(output) {
        const keys = Object.keys(output.blueprint);
        assert(!keys.includes('clientId'));
        assert(!keys.includes('projectName'));
        assert(!keys.includes('version'));
        assert(!keys.includes('niche'));
        assert(!keys.includes('paletteChoice'));
      }
    },
    {
      name: '14. instanceId no fabricado desde projectName',
      input: {
        blueprint: { ...fixtures.canonicalMinimal, instanceId: undefined, clientId: undefined },
        execution: { targetPath: 'ventas/test', force: false }
      },
      assert(output) {
        assert.equal(output.blueprint.instanceId, undefined);
      }
    },
    {
      name: '15. blueprintVersion no fabricada',
      input: {
        blueprint: { ...fixtures.canonicalMinimal, blueprintVersion: undefined, version: undefined },
        execution: { targetPath: 'ventas/test', force: false }
      },
      assert(output) {
        assert.equal(output.blueprint.blueprintVersion, undefined);
      }
    },
    {
      name: '16. general, general_custom y servicio_mesa rechazados como vertical',
      input: {
        blueprint: fixtures.legacyPayloadWithNicheState,
        execution: { targetPath: 'ventas/test', force: false }
      },
      shouldFail: true,
      errorMatch: /wizard|estado|no es una vertical/i
    },
    {
      name: '17. initials ausente del Blueprint normalizado',
      input: {
        blueprint: { ...fixtures.canonicalMinimal, branding: { paletteChoice: 'emerald', initials: 'TRX' } },
        execution: { targetPath: 'ventas/test', force: false }
      },
      assert(output) {
        assert.equal(output.blueprint.branding.initials, undefined);
      }
    },
    {
      name: '18. Campo desconocido en Blueprint canónico',
      input: {
        blueprint: { ...fixtures.canonicalMinimal, unexpectedPrivilege: true },
        execution: { targetPath: 'ventas/test', force: false }
      },
      assert(output) {
        assert.equal(output.blueprint.unexpectedPrivilege, true);
      }
    },
    {
      name: '19. Campo desconocido en payload legacy plano',
      input: {
        ...fixtures.legacyPayload,
        unexpectedPrivilege: true
      },
      assert(output) {
        assert.equal(output.blueprint.unexpectedPrivilege, true);
      }
    },
    {
      name: '20. Campo desconocido en execution',
      input: {
        blueprint: fixtures.canonicalMinimal,
        execution: { targetPath: 'ventas/test', force: false, runArbitraryCommand: true }
      },
      shouldFail: true,
      errorMatch: /REJECTED|desconocido/i
    }
  ];

  for (const tc of cases) {
    try {
      const output = normalizeProvisioningRequest(tc.input);
      if (tc.shouldFail) {
        console.log(`🔴 [FAILED] ${tc.name}: Se esperaba fallo, pero pasó.`);
        results.push({ suite: testName, name: tc.name, status: 'FAILED', error: 'Se esperaba una excepción' });
      } else {
        tc.assert(output);
        console.log(`🟢 [PASSED] ${tc.name}`);
        results.push({ suite: testName, name: tc.name, status: 'PASSED' });
      }
    } catch (err) {
      if (tc.shouldFail) {
        if (tc.errorMatch && !tc.errorMatch.test(err.message)) {
          console.log(`🔴 [FAILED] ${tc.name}: Error esperado pero con mensaje distinto. Recibido: "${err.message}"`);
          results.push({ suite: testName, name: tc.name, status: 'FAILED', error: err.message });
        } else {
          console.log(`🟢 [PASSED] ${tc.name} (Fallo esperado verificado)`);
          results.push({ suite: testName, name: tc.name, status: 'PASSED' });
        }
      } else {
        console.log(`🔴 [FAILED] ${tc.name}: Error inesperado: ${err.message}`);
        results.push({ suite: testName, name: tc.name, status: 'FAILED', error: err.message });
      }
    }
  }
}
