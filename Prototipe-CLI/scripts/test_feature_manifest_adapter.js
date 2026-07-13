/**
 * Unit Tests para FeatureManifestAdapter
 * Valida la correcta normalización del contrato de Feature Flags
 */

import { getNormalizedFeatures } from '../lib/featureManifestAdapter.js';
import assert from 'assert';

console.log('🧪 Iniciando pruebas unitarias de FeatureManifestAdapter...');

try {
  // Test 1: Manifest nuevo (formato features{})
  const manifestNuevo = {
    features: {
      sales: {
        id: 'sales',
        enabledByDefault: true,
        legacyRemoteKeys: ['salesEnabled']
      },
      inventory: {
        enabledByDefault: false
      }
    }
  };

  const resNuevo = getNormalizedFeatures(manifestNuevo);
  assert.strictEqual(resNuevo.length, 2, 'Debe normalizar 2 features');
  
  // Asertar estructura de sales
  const sales = resNuevo.find(f => f.id === 'sales');
  assert.ok(sales, 'Debe existir la feature sales');
  assert.strictEqual(sales.enabledByDefault, true, 'Sales debe estar enabledByDefault por defecto');
  assert.strictEqual(sales.remoteKey, 'sales', 'remoteKey debe ser el fallback id');
  assert.deepStrictEqual(sales.legacyRemoteKeys, ['salesEnabled'], 'Debe conservar legacyRemoteKeys');

  // Asertar estructura de inventory (resiliencia de llaves fallback)
  const inventory = resNuevo.find(f => f.id === 'inventory');
  assert.ok(inventory, 'Debe existir la feature inventory mediante llave fallback');
  assert.strictEqual(inventory.enabledByDefault, false, 'Inventory debe estar deshabilitada');
  assert.strictEqual(inventory.remoteKey, 'inventory', 'remoteKey de inventory debe ser la llave fallback');

  console.log('✅ Test 1: Manifest nuevo (features{}) pasó correctamente.');

  // Test 2: Manifest legacy (formato featureFlags[])
  const manifestLegacy = {
    featureFlags: [
      {
        id: 'sales',
        default: true,
        remoteKey: 'crm_sales',
        legacyRemoteKeys: ['salesOld']
      }
    ]
  };

  const resLegacy = getNormalizedFeatures(manifestLegacy);
  assert.strictEqual(resLegacy.length, 1, 'Debe normalizar 1 feature legacy');
  
  const salesLegacy = resLegacy[0];
  assert.strictEqual(salesLegacy.id, 'sales');
  assert.strictEqual(salesLegacy.enabledByDefault, true, 'Debe mapear default a enabledByDefault');
  assert.strictEqual(salesLegacy.remoteKey, 'crm_sales', 'Debe mapear remoteKey de forma segura');
  assert.deepStrictEqual(salesLegacy.legacyRemoteKeys, ['salesOld'], 'Debe mapear legacyRemoteKeys');

  console.log('✅ Test 2: Manifest legacy (featureFlags[]) pasó correctamente.');

  // Test 3: Manifest vacío o nulo
  const resVacio = getNormalizedFeatures({});
  assert.strictEqual(resVacio.length, 0, 'Manifest vacío debe retornar array vacío');

  const resNulo = getNormalizedFeatures(null);
  assert.strictEqual(resNulo.length, 0, 'Manifest nulo debe retornar array vacío');

  console.log('✅ Test 3: Manifest vacío y nulo pasó correctamente.');
  console.log('\n🎉 ¡Todas las pruebas de FeatureManifestAdapter han pasado con éxito!');

} catch (err) {
  console.error('❌ Fallo en las pruebas unitarias:', err.message);
  process.exit(1);
}
