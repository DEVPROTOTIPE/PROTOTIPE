/**
 * run_p0_4_lifecycle_tests.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Runner de la suite RED — Fase P0.4: Lifecycle & Observability
 *
 * Resultado esperado en fase RED: todos los controles muestran
 * PRODUCT_BEHAVIOR_FAILURE salvo P04-03a que documenta el comportamiento correcto.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  testVolatileConcurrencyLock,
  testNoLifecyclePersistence,
  testRollbackNewDirectory,
  testRollbackExistingDirectory,
  testFirebaseCloudRollback,
  testTempUploadsNotCleaned,
  testUploadExtensionNotValidated,
  testAdminPasswordExposedInResult,
  testTaskIdNotPropagated,
  testTtlHardcoded,
} from './test_lifecycle_observability.js';

// ─── Configuración ────────────────────────────────────────────────────────────

const RED_PHASE = true; // Fase RED: se espera que los controles fallen
const results   = [];

// ─── Helper de ejecución ──────────────────────────────────────────────────────

async function run(testFn) {
  const start = Date.now();
  try {
    const result = await testFn();
    const elapsed = Date.now() - start;

    results.push({ ...result, elapsed });

    const icon   = result.passed ? '🟢' : '🔴';
    const label  = result.type;
    const timing = `(${elapsed}ms)`;

    console.log(`${icon} [${label}] ${result.id} — ${result.name} ${timing}`);

    if (!result.passed && result.message) {
      // Mostrar detalle indentado
      const lines = result.message.split('. ').filter(Boolean);
      lines.forEach(line => console.log(`       ↳ ${line.trim()}.`));
    }
  } catch (err) {
    const elapsed = Date.now() - start;
    console.log(`❌ [TEST_INFRA_FAILURE] ${testFn.name} — ${err.message} (${elapsed}ms)`);
    results.push({
      passed:  false,
      id:      '??',
      name:    testFn.name,
      message: err.message,
      type:    'TEST_INFRA_FAILURE',
      elapsed
    });
  }
}

// ─── Inicio de ejecución ──────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(70));
console.log('🧪  SUITE RED — P0.4: LIFECYCLE & OBSERVABILITY');
console.log('    Prototipe-CLI / Fecha: ' + new Date().toISOString());
console.log('═'.repeat(70));

// Bloque 1: Lock de concurrencia
console.log('\n📦  BLOQUE 1 — Lock de Concurrencia (P04-01)');
await run(testVolatileConcurrencyLock);

// Bloque 2: Lifecycle persistente
console.log('\n📦  BLOQUE 2 — Lifecycle Persistente (P04-02)');
await run(testNoLifecyclePersistence);

// Bloque 3: Rollback
console.log('\n📦  BLOQUE 3 — Rollback de Aprovisionamiento (P04-03a/b/c)');
await run(testRollbackNewDirectory);
await run(testRollbackExistingDirectory);
await run(testFirebaseCloudRollback);

// Bloque 4: Gestión de temporales y uploads
console.log('\n📦  BLOQUE 4 — Temporales y Upload (P04-05/06)');
await run(testTempUploadsNotCleaned);
await run(testUploadExtensionNotValidated);

// Bloque 5: Seguridad de respuesta
console.log('\n📦  BLOQUE 5 — Seguridad de Respuesta (P04-07)');
await run(testAdminPasswordExposedInResult);

// Bloque 6: Observabilidad
console.log('\n📦  BLOQUE 6 — Observabilidad / Trazabilidad (P04-08)');
await run(testTaskIdNotPropagated);

// Bloque 7: Configurabilidad
console.log('\n📦  BLOQUE 7 — Configurabilidad del TTL (P04-09)');
await run(testTtlHardcoded);

// ─── Consolidado ──────────────────────────────────────────────────────────────

const totalTests    = results.length;
const passed        = results.filter(r => r.passed).length;
const failures      = results.filter(r => !r.passed && r.type !== 'TEST_INFRA_FAILURE').length;
const infraFailures = results.filter(r => r.type === 'TEST_INFRA_FAILURE').length;
const totalElapsed  = results.reduce((acc, r) => acc + (r.elapsed || 0), 0);

// Separar comportamientos correctos de vulnerabilidades confirmadas
const correctBehaviors = results.filter(r => r.passed && r.type !== 'TEST_INFRA_FAILURE');
const confirmedVulns   = results.filter(r => !r.passed && r.type === 'PRODUCT_BEHAVIOR_FAILURE');

console.log('\n' + '═'.repeat(70));
console.log('📊  CONSOLIDADO DE RESULTADOS — P0.4 LIFECYCLE & OBSERVABILITY');
console.log('═'.repeat(70));
console.log(`   PASSED (comportamiento correcto):      ${String(passed).padStart(3)}`);
console.log(`   PRODUCT_BEHAVIOR_FAILURE:              ${String(failures).padStart(3)}`);
console.log(`   TEST_INFRA_FAILURE:                    ${String(infraFailures).padStart(3)}`);
console.log(`   ─────────────────────────────────────────────`);
console.log(`   TOTAL DE PRUEBAS:                      ${String(totalTests).padStart(3)}`);
console.log(`   TIEMPO TOTAL DE EJECUCIÓN:             ${totalElapsed}ms`);

if (confirmedVulns.length > 0) {
  console.log('\n🔴  HALLAZGOS CONFIRMADOS (PRODUCT_BEHAVIOR_FAILURE):');
  confirmedVulns.forEach(r => {
    console.log(`     • [${r.id}] ${r.name}`);
  });
}

if (correctBehaviors.length > 0) {
  console.log('\n🟢  COMPORTAMIENTOS CORRECTOS CONFIRMADOS:');
  correctBehaviors.forEach(r => {
    console.log(`     • [${r.id}] ${r.name}`);
  });
}

if (infraFailures > 0) {
  console.log('\n❌  FALLOS DE INFRAESTRUCTURA DE TESTS (requieren revisión):');
  results.filter(r => r.type === 'TEST_INFRA_FAILURE').forEach(r => {
    console.log(`     • ${r.name}: ${r.message}`);
  });
}

const redPhaseOk = RED_PHASE && failures > 0 && infraFailures === 0;
console.log('\n' + '═'.repeat(70));

if (infraFailures > 0) {
  console.log('⚠️   ESTADO: TEST_INFRA_FAILURE — Revisar setup de tests antes de continuar.');
} else if (redPhaseOk) {
  console.log(`✅  ESTADO: PRODUCT_BEHAVIOR_FAILURE CONFIRMADO`);
  console.log(`    Fase RED completada: ${failures} vulnerabilidad(es) documentada(s).`);
  console.log(`    Proceder con COMMIT A y luego solicitar COMMIT B para implementación.`);
} else if (failures === 0 && passed === totalTests) {
  console.log('✅  ESTADO: ALL PASSED — Todas las vulnerabilidades ya mitigadas.');
  console.log('    Las implementaciones de B→G ya están en producción.');
}

console.log('═'.repeat(70) + '\n');

// Exit code: 1 si hay fallos esperados RED (comportamiento correcto en esta fase)
// Exit code: 2 si hay fallos de infraestructura (hay que corregir los tests)
// Exit code: 0 solo si todos pasan (fase implementación completa)
if (infraFailures > 0) {
  process.exit(2);
} else if (failures > 0) {
  process.exit(1); // Esperado en fase RED
} else {
  process.exit(0);
}
