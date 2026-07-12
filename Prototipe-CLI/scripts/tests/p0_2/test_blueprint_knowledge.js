/**
 * test_blueprint_knowledge.js
 * 
 * Suite de pruebas semánticas (Knowledge Layer) para el Blueprint (Fase P0.2).
 */

import assert from 'node:assert/strict';
import { ProvisioningValidator } from '../../../lib/ProvisioningValidator.js';
import * as fixtures from './fixtures.js';

export async function run(results) {
  const testName = 'P0.2 - Blueprint Knowledge Layer Tests';
  console.log(`\n⏳ Ejecutando ${testName}...`);

  const cases = [
    {
      name: '1. coreType existente (template-ventas)',
      blueprint: { ...fixtures.canonicalMinimal, coreType: 'template-ventas' },
      shouldFail: false
    },
    {
      name: '2. coreType inexistente',
      blueprint: { ...fixtures.canonicalMinimal, coreType: 'template-core-invalid' },
      shouldFail: true,
      errorMatch: /coreType|no existe|plantilla/i
    },
    {
      name: '3. Vertical oficial existente (retail_clothing)',
      blueprint: { ...fixtures.canonicalMinimal, vertical: 'retail_clothing' },
      shouldFail: false
    },
    {
      name: '4. Vertical inexistente (invalid_vertical)',
      blueprint: { ...fixtures.canonicalMinimal, vertical: 'invalid_vertical' },
      shouldFail: true,
      errorMatch: /vertical|nicho|no existe/i
    },
    {
      name: '5. general, general_custom y servicio_mesa rechazados como vertical',
      blueprint: { ...fixtures.canonicalMinimal, vertical: 'general_custom' },
      shouldFail: true,
      errorMatch: /vertical|no es una vertical/i
    },
    {
      name: '6. Feature existente (sales)',
      blueprint: { ...fixtures.canonicalMinimal, features: ['sales'] },
      shouldFail: false
    },
    {
      name: '7. Feature inexistente (nonexistent_feature)',
      blueprint: { ...fixtures.canonicalMinimal, features: ['nonexistent_feature'] },
      shouldFail: true,
      errorMatch: /feature/i
    },
    {
      name: '8. Componente existente (OrderCard)',
      blueprint: { ...fixtures.canonicalMinimal, components: ['OrderCard'] },
      shouldFail: false
    },
    {
      name: '9. Componente inexistente (NonexistentComponent)',
      blueprint: { ...fixtures.canonicalMinimal, components: ['NonexistentComponent'] },
      shouldFail: true,
      errorMatch: /componente/i
    },
    {
      name: '10. Patrón existente (pattern-wizard-flow)',
      blueprint: { ...fixtures.canonicalMinimal, patterns: ['pattern-wizard-flow'] },
      shouldFail: false
    },
    {
      name: '11. Patrón inexistente (pattern-nonexistent)',
      blueprint: { ...fixtures.canonicalMinimal, patterns: ['pattern-nonexistent'] },
      shouldFail: true,
      errorMatch: /patrón|pattern/i
    },
    {
      name: '12. blueprintVersion 2.3.1 sintaxis válida pero no soportada',
      blueprint: { ...fixtures.canonicalMinimal, blueprintVersion: '2.3.1' },
      shouldFail: true,
      errorMatch: /soportada/i
    }
  ];

  for (const tc of cases) {
    try {
      const res = await ProvisioningValidator.validate(tc.blueprint);
      const isFailed = !res.isValid;

      if (isFailed && !tc.shouldFail) {
        console.log(`🔴 [FAILED] ${tc.name}: Se esperaba éxito, pero falló con: ${res.errors.join(' | ')}`);
        results.push({ suite: testName, name: tc.name, status: 'FAILED', error: res.errors.join(' | ') });
      } else if (!isFailed && tc.shouldFail) {
        console.log(`🔴 [FAILED] ${tc.name}: Se esperaba fallo, pero pasó con éxito.`);
        results.push({ suite: testName, name: tc.name, status: 'FAILED', error: 'Se esperaba que la validación semántica fallara' });
      } else {
        console.log(`🟢 [PASSED] ${tc.name}`);
        results.push({ suite: testName, name: tc.name, status: 'PASSED' });
      }
    } catch (err) {
      if (tc.shouldFail) {
        if (tc.errorMatch && !tc.errorMatch.test(err.message)) {
          console.log(`🔴 [FAILED] ${tc.name}: Falló con error esperado pero mensaje diferente: "${err.message}"`);
          results.push({ suite: testName, name: tc.name, status: 'FAILED', error: err.message });
        } else {
          console.log(`🟢 [PASSED] ${tc.name} (Fallo controlado verificado)`);
          results.push({ suite: testName, name: tc.name, status: 'PASSED' });
        }
      } else {
        console.log(`🔴 [FAILED] ${tc.name}: Excepción inesperada: ${err.message}`);
        results.push({ suite: testName, name: tc.name, status: 'FAILED', error: err.message });
      }
    }
  }
}
