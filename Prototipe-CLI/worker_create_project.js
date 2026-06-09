/**
 * worker_create_project.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Proceso hijo dedicado al aprovisionamiento de proyectos.
 *
 * Protocolo IPC con el proceso padre (server.js):
 *   ← { type: 'START', answers: Object }   — inicia el aprovisionamiento
 *   → { type: 'SUCCESS', data: Object }    — aprovisionamiento exitoso
 *   → { type: 'ERROR', message: string }   — error controlado
 *
 * El worker termina automáticamente al emitir SUCCESS o ERROR.
 * Si el padre desconecta el canal IPC antes de que termine, el worker
 * captura SIGHUP/disconnect y cierra limpiamente.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createProject } from './generator.js';

// Guard de seguridad: este script DEBE ejecutarse como proceso hijo (fork),
// no directamente por el usuario.
if (!process.send) {
  console.error('[Worker] Este script debe ejecutarse como proceso hijo (fork). No lo ejecutes directamente.');
  process.exit(1);
}

// Notificar al padre que el worker está listo para recibir mensajes
process.send({ type: 'READY' });

process.on('message', async (msg) => {
  if (msg?.type !== 'START') return;

  const { answers } = msg;

  try {
    const result = await createProject(answers);
    process.send({ type: 'SUCCESS', data: result });
  } catch (err) {
    process.send({ type: 'ERROR', message: err.message || String(err) });
  } finally {
    // Cierre limpio: dar tiempo al padre de leer el último mensaje IPC
    setImmediate(() => process.exit(0));
  }
});

// Si el canal IPC se desconecta antes de que terminemos (padre crashea o mata el proceso)
process.on('disconnect', () => {
  process.exit(0);
});
