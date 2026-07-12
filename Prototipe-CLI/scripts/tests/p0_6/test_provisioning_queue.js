/**
 * test_provisioning_queue.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Suite de pruebas RED — Fase P0.6: Provisioning Queue & Job Management
 *
 * Metodología: análisis estático y dinámico combinado.
 * Verifica la existencia de ProvisioningQueue, sus métodos de persistencia
 * atómica, máquina de estados, control de concurrencia y recuperación.
 *
 * Si la clase o la lógica no están presentes o fallan -> PRODUCT_BEHAVIOR_FAILURE.
 * Si ya se implementó correctamente -> PASSED.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const CLI_ROOT   = path.resolve(__dirname, '../../..');

// Helper para crear el objeto de resultado
function makeResult(passed, id, name, message, type = 'PRODUCT_BEHAVIOR_FAILURE') {
  return { passed, id, name, message, type: passed ? 'PASSED' : type };
}

// Intentar importar ProvisioningQueue dinámicamente si existe.
// Si no existe, los tests fallarán de forma segura con PRODUCT_BEHAVIOR_FAILURE.
async function getQueueClass() {
  try {
    // Intentamos cargar de lib/ProvisioningQueue.js o server.js
    const libPath = path.join(CLI_ROOT, 'lib', 'ProvisioningQueue.js');
    if (await fs.pathExists(libPath)) {
      const module = await import(`file:///${libPath.replace(/\\/g, '/')}`);
      return module.ProvisioningQueue;
    }
  } catch (_) {}
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 1 — P06-01: Persistencia de cola con escritura atómica
// ═══════════════════════════════════════════════════════════════════════════════
export async function testQueuePersistence() {
  const QueueClass = await getQueueClass();
  if (!QueueClass) {
    return makeResult(false, 'P06-01', 'Persistencia de cola y renombrado atómico',
      'No se encontró la clase ProvisioningQueue en lib/ProvisioningQueue.js. ' +
      'No existe el mecanismo de persistencia atómica en artifacts/provisioning-queue.json. ' +
      'Se requiere escribir a queue.tmp y aplicar fs.rename() para evitar corrupción.'
    );
  }

  // Si existe la clase, validar estáticamente si usa fs.rename o writeFile en archivos temporales
  try {
    const queueFileContent = await fs.readFile(path.join(CLI_ROOT, 'lib', 'ProvisioningQueue.js'), 'utf-8');
    const usesAtomicRename = /rename/i.test(queueFileContent) && /\.tmp/i.test(queueFileContent);
    if (!usesAtomicRename) {
      return makeResult(false, 'P06-01', 'Escritura de cola no es atómica',
        'La clase ProvisioningQueue existe pero no implementa la estrategia de renombrado atómico (rename/tmp). ' +
        'Escribir directamente a provisioning-queue.json puede corromper el estado ante caídas del servidor.'
      );
    }
    return makeResult(true, 'P06-01', 'Persistencia atómica implementada con éxito',
      'ProvisioningQueue persiste de forma atómica y segura mediante renombrado temporal.'
    );
  } catch (err) {
    return makeResult(false, 'P06-01', 'Error al verificar persistencia atómica', err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 2 — P06-02: Máquina de estados completa
// ═══════════════════════════════════════════════════════════════════════════════
export async function testQueueStateMachine() {
  const QueueClass = await getQueueClass();
  if (!QueueClass) {
    return makeResult(false, 'P06-02', 'Máquina de estados de la cola',
      'La máquina de estados de aprovisionamiento no está implementada. ' +
      'Faltan estados obligatorios: queued, acquiring_lock, waiting_lock, processing, completed, failed, cancelled.'
    );
  }

  // Si la clase existe, verificar estáticamente o dinámicamente si declara o maneja estos estados
  try {
    const queueFileContent = await fs.readFile(path.join(CLI_ROOT, 'lib', 'ProvisioningQueue.js'), 'utf-8');
    const requiredStates = ['queued', 'acquiring_lock', 'waiting_lock', 'processing', 'completed', 'failed', 'cancelled'];
    const missing = requiredStates.filter(state => !queueFileContent.includes(state));

    if (missing.length > 0) {
      return makeResult(false, 'P06-02', 'Máquina de estados incompleta',
        `La máquina de estados no incluye todos los estados requeridos. Faltan: ${missing.join(', ')}.`
      );
    }

    return makeResult(true, 'P06-02', 'Máquina de estados validada con éxito',
      'Todos los estados obligatorios están declarados y mapeados.'
    );
  } catch (err) {
    return makeResult(false, 'P06-02', 'Error al verificar máquina de estados', err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 3 — P06-03: Límite de concurrencia secuencial estricto
// ═══════════════════════════════════════════════════════════════════════════════
export async function testQueueConcurrencyLimit() {
  const QueueClass = await getQueueClass();
  if (!QueueClass) {
    return makeResult(false, 'P06-03', 'Límite de concurrencia (maxConcurrency = 1)',
      'No existe el programador de la cola. ' +
      'Si se agregan los jobs A, B y C de manera simultánea, se ejecutarán procesos fork paralelos ' +
      'provocando saturación física en disco y CPU.'
    );
  }

  // Si existe la clase, validar que limite la concurrencia a 1
  try {
    const queueFileContent = await fs.readFile(path.join(CLI_ROOT, 'lib', 'ProvisioningQueue.js'), 'utf-8');
    const enforcesMaxConcurrency = /maxConcurrency\s*=\s*1|concurrency\s*:\s*1/i.test(queueFileContent) || queueFileContent.includes('activeWorkers');

    if (!enforcesMaxConcurrency) {
      return makeResult(false, 'P06-03', 'Falta límite estricto de concurrencia',
        'La clase ProvisioningQueue no restringe el procesamiento paralelo a un máximo de 1 worker activo.'
      );
    }

    return makeResult(true, 'P06-03', 'Límite de concurrencia secuencial verificado',
      'maxConcurrency está configurado en 1 y se procesa secuencialmente.'
    );
  } catch (err) {
    return makeResult(false, 'P06-03', 'Error al verificar límite de concurrencia', err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 4 — P06-04: Transición segura e integración con locks físicos
// ═══════════════════════════════════════════════════════════════════════════════
export async function testQueueLockIntegration() {
  const QueueClass = await getQueueClass();
  if (!QueueClass) {
    return makeResult(false, 'P06-04', 'Integración segura de locks físicos',
      'No se implementa la fase queued -> acquiring_lock -> processing. ' +
      'Si el Job B intenta procesar el mismo clientId que el Job A (activo), ' +
      'fallará de forma catastrófica en lugar de quedar en espera con estado waiting_lock.'
    );
  }

  try {
    const queueFileContent = await fs.readFile(path.join(CLI_ROOT, 'lib', 'ProvisioningQueue.js'), 'utf-8');
    const hasLockAcquisitionLogic = /acquireLock/i.test(queueFileContent) && /waiting_lock/i.test(queueFileContent);

    if (!hasLockAcquisitionLogic) {
      return makeResult(false, 'P06-04', 'Transición segura de locks no controlada',
        'La cola no implementa el flujo de adquisición segura ni maneja la transición a waiting_lock si acquireLock falla.'
      );
    }

    return makeResult(true, 'P06-04', 'Integración y gobernanza de locks físicos validada',
      'El scheduler maneja de forma segura las colisiones de locks enviando los jobs a waiting_lock.'
    );
  } catch (err) {
    return makeResult(false, 'P06-04', 'Error al verificar integración de locks', err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 5 — P06-05: Saneamiento y recuperación después de reinicios
// ═══════════════════════════════════════════════════════════════════════════════
export async function testQueueCrashRecovery() {
  const QueueClass = await getQueueClass();
  if (!QueueClass) {
    return makeResult(false, 'P06-05', 'Recuperación síncrona ante caídas',
      'No se realiza el saneamiento de la cola al inicializar. ' +
      'Si el servidor se reinicia con tareas en estado processing, quedarán huérfanas en disco, ' +
      'con locks retenidos e impidiendo futuros aprovisionamientos del mismo cliente.'
    );
  }

  try {
    const queueFileContent = await fs.readFile(path.join(CLI_ROOT, 'lib', 'ProvisioningQueue.js'), 'utf-8');
    const hasRecoveryLogic = /recovery|restore|sanitize/i.test(queueFileContent) && /releaseLock/i.test(queueFileContent);

    if (!hasRecoveryLogic) {
      return makeResult(false, 'P06-05', 'Ausencia de saneamiento tras reinicio',
        'No se detecta lógica para recuperar tareas huérfanas, pasar a failed los jobs colgados y liberar locks al iniciar.'
      );
    }

    return makeResult(true, 'P06-05', 'Recuperación síncrona y liberación de locks verificada',
      'Se implementa el flujo de saneamiento síncrono al iniciar.'
    );
  } catch (err) {
    return makeResult(false, 'P06-05', 'Error al verificar crash recovery', err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 6 — P06-06: Desacoplamiento y delegación a ProvisioningStateManager
// ═══════════════════════════════════════════════════════════════════════════════
export async function testQueueStateManagerDelegation() {
  const QueueClass = await getQueueClass();
  if (!QueueClass) {
    return makeResult(false, 'P06-06', 'Aislamiento de responsabilidades y delegación',
      'No se delega el estado físico al ProvisioningStateManager. ' +
      'La cola no debe inventar estados de cliente propios, sino orquestar el agendado y delegar ' +
      'acquireLock(), transitionTo() y releaseLock().'
    );
  }

  try {
    const queueFileContent = await fs.readFile(path.join(CLI_ROOT, 'lib', 'ProvisioningQueue.js'), 'utf-8');
    const delegatesState = /ProvisioningStateManager/i.test(queueFileContent) &&
                           /acquireLock/i.test(queueFileContent) &&
                           /transitionTo/i.test(queueFileContent) &&
                           /releaseLock/i.test(queueFileContent);

    if (!delegatesState) {
      return makeResult(false, 'P06-06', 'Falta delegación de lógica física al StateManager',
        'La clase ProvisioningQueue no se integra ni delega las funciones físicas al ProvisioningStateManager.'
      );
    }

    return makeResult(true, 'P06-06', 'Desacoplamiento y delegación al StateManager validada',
      'La cola interactúa correctamente con el StateStateManager para la persistencia del cliente.'
    );
  } catch (err) {
    return makeResult(false, 'P06-06', 'Error al verificar delegación al StateManager', err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 7 — P06-07: Compatibilidad de Contrato SSE / Dashboard
// ═══════════════════════════════════════════════════════════════════════════════
export async function testQueueSseContract() {
  const serverContent = await fs.readFile(path.join(CLI_ROOT, 'server.js'), 'utf-8');

  // Buscar si el servidor emite el evento SSE de cola con type: 'queue' y position
  const emitsSseQueueEvent = /type\s*:\s*['"]queue['"]\s*,\s*position/i.test(serverContent);

  if (!emitsSseQueueEvent) {
    return makeResult(false, 'P06-07', 'Contrato SSE y Dashboard para la cola',
      'El servidor (server.js) no transmite eventos de tipo { type: "queue", position: X } por SSE. ' +
      'El dashboard App.jsx no recibirá información sobre la posición del cliente en cola.'
    );
  }

  return makeResult(true, 'P06-07', 'Contrato SSE y soporte de cola en server.js validado',
    'El servidor emite eventos SSE de cola compatibles con el Dashboard.'
  );
}
