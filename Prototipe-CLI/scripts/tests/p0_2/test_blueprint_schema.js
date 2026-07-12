/**
 * test_blueprint_schema.js
 * 
 * Suite de pruebas estructurales de AJV y SemVer para el Blueprint (Fase P0.2).
 */

import assert from 'node:assert/strict';
import { ProvisioningValidator } from '../../../lib/ProvisioningValidator.js';
import * as fixtures from './fixtures.js';

export async function run(results) {
  const testName = 'P0.2 - Blueprint Structural Schema Tests';
  console.log(`\n⏳ Ejecutando ${testName}...`);

  const cases = [
    {
      name: '1. Blueprint vacío',
      blueprint: {},
      shouldFail: true
    },
    {
      name: '2. Sin blueprintVersion',
      blueprint: { ...fixtures.canonicalMinimal, blueprintVersion: undefined },
      shouldFail: true
    },
    {
      name: '3. Sin instanceId',
      blueprint: { ...fixtures.canonicalMinimal, instanceId: undefined },
      shouldFail: true
    },
    {
      name: '4. Sin clientName',
      blueprint: { ...fixtures.canonicalMinimal, clientName: undefined },
      shouldFail: true
    },
    {
      name: '5. Sin coreType',
      blueprint: { ...fixtures.canonicalMinimal, coreType: undefined },
      shouldFail: true
    },
    {
      name: '6. Sin vertical',
      blueprint: { ...fixtures.canonicalMinimal, vertical: undefined },
      shouldFail: true
    },
    {
      name: '7. SemVer 1.0 (inválido)',
      blueprint: { ...fixtures.canonicalMinimal, blueprintVersion: '1.0' },
      shouldFail: true
    },
    {
      name: '8. SemVer v1.0.0 (inválido)',
      blueprint: { ...fixtures.canonicalMinimal, blueprintVersion: 'v1.0.0' },
      shouldFail: true
    },
    {
      name: '9. SemVer prerelease (inválido)',
      blueprint: { ...fixtures.canonicalMinimal, blueprintVersion: '1.0.0-beta.1' },
      shouldFail: true
    },
    {
      name: '10. SemVer build metadata (inválido)',
      blueprint: { ...fixtures.canonicalMinimal, blueprintVersion: '1.0.0+build.1' },
      shouldFail: true
    },
    {
      name: '11. instanceId con guion inicial',
      blueprint: { ...fixtures.canonicalMinimal, instanceId: '-tienda' },
      shouldFail: true
    },
    {
      name: '12. instanceId con guion final',
      blueprint: { ...fixtures.canonicalMinimal, instanceId: 'tienda-' },
      shouldFail: true
    },
    {
      name: '13. instanceId con doble guion',
      blueprint: { ...fixtures.canonicalMinimal, instanceId: 'tienda--principal' },
      shouldFail: true
    },
    {
      name: '14. instanceId con mayúsculas',
      blueprint: { ...fixtures.canonicalMinimal, instanceId: 'TiendaModa' },
      shouldFail: true
    },
    {
      name: '15. clientName solo espacios',
      blueprint: { ...fixtures.canonicalMinimal, clientName: '   ' },
      shouldFail: true
    },
    {
      name: '16. clientName con saltos de línea',
      blueprint: { ...fixtures.canonicalMinimal, clientName: 'Tienda\nModa' },
      shouldFail: true
    },
    {
      name: '17. Campo adicional top-level',
      blueprint: { ...fixtures.canonicalMinimal, extraField: true },
      shouldFail: true
    },
    {
      name: '18. Campo initials dentro de branding (debe ser rechazado en P0.2)',
      blueprint: {
        ...fixtures.canonicalMinimal,
        branding: { paletteChoice: 'emerald', initials: 'TRX' }
      },
      shouldFail: true
    },
    {
      name: '19. paletteChoice slate (rechazado)',
      blueprint: {
        ...fixtures.canonicalMinimal,
        branding: { paletteChoice: 'slate' }
      },
      shouldFail: true
    },
    {
      name: '20. paletteChoice custom sin colores',
      blueprint: {
        ...fixtures.canonicalMinimal,
        branding: { paletteChoice: 'custom' }
      },
      shouldFail: true
    },
    {
      name: '21. custom con solo primaryColor',
      blueprint: {
        ...fixtures.canonicalMinimal,
        branding: { paletteChoice: 'custom', primaryColor: 'hsl(142, 70%, 45%)' }
      },
      shouldFail: true
    },
    {
      name: '22. custom con solo secondaryColor',
      blueprint: {
        ...fixtures.canonicalMinimal,
        branding: { paletteChoice: 'custom', secondaryColor: 'hsl(262, 83%, 58%)' }
      },
      shouldFail: true
    },
    {
      name: '23. paletteChoice emerald con colores de custom',
      blueprint: fixtures.brandingNonCustomWithColors,
      shouldFail: true
    },
    {
      name: '24. features con duplicados',
      blueprint: { ...fixtures.canonicalMinimal, features: ['sales', 'sales'] },
      shouldFail: true
    },
    {
      name: '25. features con traversal',
      blueprint: { ...fixtures.canonicalMinimal, features: ['../sales'] },
      shouldFail: true
    },
    {
      name: '26. components con separador \\',
      blueprint: { ...fixtures.canonicalMinimal, components: ['Caja\\POS'] },
      shouldFail: true
    },
    {
      name: '27. Rechazo de experience',
      blueprint: { ...fixtures.canonicalMinimal, experience: { layout: 'sidebar' } },
      shouldFail: true
    },
    {
      name: '28. Rechazo de campos execution (targetPath)',
      blueprint: { ...fixtures.canonicalMinimal, targetPath: 'ventas/test' },
      shouldFail: true
    },
    {
      name: '29. Blueprint canónico mínimo válido',
      blueprint: fixtures.canonicalMinimal,
      shouldFail: false
    },
    {
      name: '30. Branding custom válido',
      blueprint: fixtures.brandingCustomValid,
      shouldFail: false
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
        results.push({ suite: testName, name: tc.name, status: 'FAILED', error: 'Se esperaba que la validación fallara' });
      } else {
        console.log(`🟢 [PASSED] ${tc.name}`);
        results.push({ suite: testName, name: tc.name, status: 'PASSED' });
      }
    } catch (err) {
      if (tc.shouldFail) {
        console.log(`🟢 [PASSED] ${tc.name} (Fallo controlado: ${err.message})`);
        results.push({ suite: testName, name: tc.name, status: 'PASSED' });
      } else {
        console.log(`🔴 [FAILED] ${tc.name}: Excepción inesperada: ${err.message}`);
        results.push({ suite: testName, name: tc.name, status: 'FAILED', error: err.message });
      }
    }
  }
}
