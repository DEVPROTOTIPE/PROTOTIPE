/**
 * run_p0_6_queue_tests.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Runner de la suite de pruebas RED — Fase P0.6: Provisioning Queue
 *
 * Resultado esperado en fase RED: todos los controles muestran
 * PRODUCT_BEHAVIOR_FAILURE ya que no se ha implementado la solución.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  testQueuePersistence,
  testQueueStateMachine,
  testQueueConcurrencyLimit,
  testQueueLockIntegration,
  testQueueCrashRecovery,
  testQueueStateManagerDelegation,
  testQueueSseContract
} from './test_provisioning_queue.js';

const RED_PHASE = true; // Fase RED: esperamos fallos de comportamiento en el producto
const results   = [];

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
console.log('🧪  SUITE RED — P0.6: PROVISIONING QUEUE & JOB MANAGEMENT');
console.log('    Prototipe-CLI / Fecha: ' + new Date().toISOString());
console.log('═'.repeat(70));

console.log('\n📦  BLOQUE 1 — Persistencia Atómica y Estados');
await run(testQueuePersistence);
await run(testQueueStateMachine);

console.log('\n📦  BLOQUE 2 — Concurrencia y Locks');
await run(testQueueConcurrencyLimit);
await run(testQueueLockIntegration);

console.log('\n📦  BLOQUE 3 — Recuperación y Desacoplamiento');
await run(testQueueCrashRecovery);
await run(testQueueStateManagerDelegation);

console.log('\n📦  BLOQUE 4 — SSE & Dashboard Contract');
await run(testQueueSseContract);

// ─── Consolidado ──────────────────────────────────────────────────────────────

const totalTests    = results.length;
const passed        = results.filter(r => r.passed).length;
const failures      = results.filter(r => !r.passed && r.type !== 'TEST_INFRA_FAILURE').length;
const infraFailures = results.filter(r => r.type === 'TEST_INFRA_FAILURE').length;
const totalElapsed  = results.reduce((acc, r) => acc + (r.elapsed || 0), 0);

const correctBehaviors = results.filter(r => r.passed && r.type !== 'TEST_INFRA_FAILURE');
const confirmedVulns   = results.filter(r => !r.passed && r.type === 'PRODUCT_BEHAVIOR_FAILURE');

console.log('\n' + '═'.repeat(70));
console.log('📊  CONSOLIDADO DE RESULTADOS — P0.6 PROVISIONING QUEUE');
console.log('═'.repeat(70));
console.log(`   PASSED (comportamiento correcto):      ${String(passed).padStart(3)}`);
console.log(`   PRODUCT_BEHAVIOR_FAILURE:              ${String(failures).padStart(3)}`);
console.log(`   TEST_INFRA_FAILURE:                    ${String(infraFailures).padStart(3)}`);
console.log(`   ─────────────────────────────────────────────`);
console.log(`   TOTAL DE PRUEBAS:                      ${String(totalTests).padStart(3)}`);
console.log(`   TIEMPO TOTAL DE EJECUCIÓN:             ${totalElapsed}ms`);

if (confirmedVulns.length > 0) {
  console.log('\n🔴  COMPORTAMIENTOS NO IMPLEMENTADOS (Fase RED):');
  confirmedVulns.forEach(r => {
    console.log(`     • [${r.id}] ${r.name}`);
  });
}

if (correctBehaviors.length > 0) {
  console.log('\n🟢  COMPORTAMIENTOS CORRECTOS YA DETECTADOS:');
  correctBehaviors.forEach(r => {
    console.log(`     • [${r.id}] ${r.name}`);
  });
}

if (infraFailures > 0) {
  console.log('\n❌  FALLOS DE INFRAESTRUCTURA DE TESTS:');
  results.filter(r => r.type === 'TEST_INFRA_FAILURE').forEach(r => {
    console.log(`     • ${r.name}: ${r.message}`);
  });
}

const redPhaseOk = RED_PHASE && failures > 0 && infraFailures === 0;
console.log('\n' + '═'.repeat(70));

if (infraFailures > 0) {
  console.log('⚠️   ESTADO: TEST_INFRA_FAILURE — Revisar setup de tests antes de continuar.');
  process.exit(2);
} else if (redPhaseOk) {
  console.log(`✅  ESTADO: PRODUCT_BEHAVIOR_FAILURE CONFIRMADO (RED PHASE SUCCESS)`);
  console.log(`    Fase RED completada: ${failures} comportamientos pendientes de implementación.`);
  console.log(`    Proceder con COMMIT A y luego solicitar COMMIT B para implementación.`);
  process.exit(1); // Exit 1 es esperado y correcto en la fase RED de certificación
} else if (failures === 0 && passed === totalTests) {
  console.log('✅  ESTADO: ALL PASSED — Cola de aprovisionamiento completada y certificada.');
  process.exit(0);
} else {
  process.exit(1);
}
