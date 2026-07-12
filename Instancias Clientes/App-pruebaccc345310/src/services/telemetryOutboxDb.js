/**
 * telemetryOutboxDb.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Base de datos IndexedDB para la cola offline de telemetría de PROTOTIPE.
 *
 * Reemplaza la implementación anterior basada en localStorage, que tenía
 * un límite de ~5MB y no era transaccional (susceptible a corrupción ante
 * cierres abruptos del navegador).
 *
 * Ventajas de IndexedDB + Dexie:
 *  - Capacidad ilimitada (sujeta al disco del dispositivo)
 *  - Transaccional: no se corrompe ante cierres abruptos
 *  - Soporte de backoff exponencial real con campo `nextAttemptAt`
 *  - Consultas eficientes por índice
 *
 * La interfaz pública de telemetryService.js NO cambia.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Dexie from 'dexie';

export const telemetryDb = new Dexie('prototipeTelemetry');

telemetryDb.version(1).stores({
  // Tabla de cola offline:
  //   eventId       — Clave primaria (garantiza idempotencia por eventId)
  //   type          — 'billing' | 'failure'
  //   status        — 'pending' | 'failed'
  //   nextAttemptAt — Timestamp del próximo intento (backoff exponencial)
  //   attempts      — Número de intentos fallidos acumulados
  //   createdAt     — Timestamp de creación para ordenamiento FIFO
  outbox: 'eventId, type, status, nextAttemptAt, attempts, createdAt',
});

/**
 * Migra items de la cola legacy de localStorage a IndexedDB.
 * Se llama automáticamente al iniciar la app para no perder reportes pendientes.
 *
 * Claves legacy soportadas:
 *  - 'telemetry_offline_queue' (App Ventas v1)
 */
export async function migrateLegacyTelemetryQueue() {
  const LEGACY_KEY = 'telemetry_offline_queue';
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return;

  try {
    const legacyItems = JSON.parse(raw);
    if (!Array.isArray(legacyItems) || legacyItems.length === 0) {
      localStorage.removeItem(LEGACY_KEY);
      return;
    }

    let migrated = 0;
    for (const item of legacyItems) {
      // Generar un eventId derivado del tipo + timestamp si no existe
      const eventId = item.eventId
        || `legacy-${item.type || 'unknown'}-${item.timestamp || Date.now()}-${Math.random().toString(36).slice(2)}`;

      const payload = item.payload ?? item;

      // Verificar si ya existe en la nueva DB (idempotencia)
      const existing = await telemetryDb.outbox.get(eventId);
      if (existing) continue;

      await telemetryDb.outbox.put({
        eventId,
        type: item.type || 'billing',
        payload,
        status: 'pending',
        attempts: item.retries || 0,
        createdAt: new Date(item.timestamp || Date.now()).getTime(),
        nextAttemptAt: Date.now(),
      });
      migrated++;
    }

    // Limpiar la cola legacy solo si la migración fue exitosa
    localStorage.removeItem(LEGACY_KEY);
    if (migrated > 0) {
      console.log(`[Telemetry] Migrados ${migrated} reportes de localStorage → IndexedDB.`);
    }
  } catch (err) {
    console.warn('[Telemetry] Error al migrar cola legacy de telemetría:', err);
  }
}
