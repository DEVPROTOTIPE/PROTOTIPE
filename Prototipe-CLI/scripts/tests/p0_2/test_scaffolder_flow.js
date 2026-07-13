import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { FeatureDependencyGraph } from '../../../lib/FeatureDependencyGraph.js';
import { FeatureRequestValidator } from '../../../lib/FeatureRequestValidator.js';
import { FeatureScaffolder } from '../../../lib/FeatureScaffolder.js';
import { FeatureVerificationRunner } from '../../../lib/FeatureVerificationRunner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLI_ROOT = path.resolve(__dirname, '..', '..', '..');

async function runTests() {
  console.log('==================================================');
  console.log('  EJECUTANDO PRUEBAS AUTOMATIZADAS DE SCAFFOLDER');
  console.log('==================================================\n');

  let failed = false;

  const assert = (condition, message) => {
    if (!condition) {
      console.error(`  ❌ FALLÓ: ${message}`);
      failed = true;
    } else {
      console.log(`  ✅ PASÓ: ${message}`);
    }
  };

  // --- PRUEBA 1: Grafo de Dependencias y Ciclos ---
  console.log('📁 Prueba 1: Validando dependencias y ciclos...');
  try {
    const mockFeatures = [
      { id: 'sales', dependencies: [] },
      { id: 'inventory', dependencies: ['sales'] }
    ];

    const graph = new FeatureDependencyGraph(mockFeatures);
    
    // Validar dependencias no resueltas
    const unresolved = graph.getUnresolvedDependencies(['sales', 'billing']);
    assert(unresolved.includes('billing') && !unresolved.includes('sales'), 'Detección correcta de dependencias no resueltas.');

    // Validar si la adición de una dependencia inversa introduce ciclo (inventory depende de sales, si sales depende de inventory -> ciclo)
    const cycle = graph.wouldIntroduceCycle('sales', 'inventory');
    assert(cycle === true, 'Detección de ciclo directo entre sales e inventory.');

    const noCycle = graph.wouldIntroduceCycle('sales', 'billing'); // billing no existe, pero simular no debería causar ciclos
    assert(noCycle === false, 'No hay ciclo si no hay caminos de retorno.');
  } catch (err) {
    assert(false, `Error en Prueba 1: ${err.message}`);
  }

  // --- PRUEBA 2: Validación de Request y Colisiones ---
  console.log('\n📁 Prueba 2: Validando colisiones y Zod schemas...');
  try {
    const mockFeatures = [
      { id: 'sales', dependencies: [] }
    ];

    // Colisión de ID canónico
    const colisionRequest = {
      featureId: 'sales',
      displayName: 'Ventas Premium',
      version: '1.0.0',
      description: 'Módulo de ventas',
      category: 'commerce'
    };

    const resColision = FeatureRequestValidator.validateCreateRequest(colisionRequest, mockFeatures);
    assert(resColision.valid === false && resColision.code === 'CONFLICT', 'Detección de colisión de ID canónico sales.');

    // ID no kebab-case
    const badIdRequest = {
      featureId: 'sales_premium', // debe ser kebab-case con guión medio
      displayName: 'Ventas Premium',
      version: '1.0.0',
      description: 'Módulo de ventas',
      category: 'commerce'
    };

    const resBadId = FeatureRequestValidator.validateCreateRequest(badIdRequest, mockFeatures);
    assert(resBadId.valid === false, 'Rechazo correcto de ID con guiones bajos o caracteres especiales.');
  } catch (err) {
    assert(false, `Error en Prueba 2: ${err.message}`);
  }

  // --- PRUEBA 3: Simulación de Scaffolding y Estructura Decoupled ---
  console.log('\n📁 Prueba 3: Simulación de Scaffolding y verificación de estructura...');
  const stagingTestDir = path.join(CLI_ROOT, '.prototipe', 'staging', `test-op-${Date.now()}`);
  try {
    const payload = {
      featureId: 'test-loyalty',
      displayName: 'Fidelización de Prueba',
      version: '1.0.0',
      category: 'marketing',
      dependencies: []
    };

    // Correr scaffolding
    await FeatureScaffolder.scaffold(stagingTestDir, payload);

    // Verificar que los 12 archivos clave existan con sus respectivos renombrados
    const filesToCheck = [
      'index.js',
      'module.js',
      'implementation.manifest.json',
      'routes.jsx',
      'security/feature-security.json',
      'constants/index.js',
      'schemas/TestLoyaltySchemas.js',
      'api/TestLoyaltyRepository.js',
      'services/TestLoyaltyService.js',
      'hooks/useTestLoyalty.js',
      'components/AdminTestLoyalty.jsx',
      'components/ClientTestLoyalty.jsx'
    ];

    for (const file of filesToCheck) {
      const exists = await fs.pathExists(path.join(stagingTestDir, file));
      assert(exists, `Verificada la existencia física de: ${file}`);
    }
  } catch (err) {
    assert(false, `Error en Prueba 3: ${err.message}`);
  } finally {
    // Limpieza de staging de prueba
    await fs.remove(stagingTestDir);
  }

  console.log('\n==================================================');
  if (failed) {
    console.error(' ❌ ALGUNAS PRUEBAS FALLARON.');
    process.exit(1);
  } else {
    console.log(' 🎉 TODAS LAS PRUEBAS PASARON DE FORMA EXITOSA.');
    process.exit(0);
  }
}

runTests();
