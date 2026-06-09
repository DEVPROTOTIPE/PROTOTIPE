/**
 * Constantes globales de infraestructura del Core Seed.
 * Contiene únicamente los valores de soporte y roles genéricos.
 */

// ─── Roles Base del Sistema ──────────────────────────────────────────────────
export const ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
  EMPLOYEE: 'employee',
}

// ─── Colecciones Genéricas de Firestore ───────────────────────────────────────
export const COLLECTIONS = {
  CONFIG: 'config',
  USERS: 'users',
  NOTIFICATIONS: 'notifications',
  ACCESS_LOGS: 'accessLogs',
}

// ─── Soporte Técnico Centralizado ─────────────────────────────────────────────
export const SUPPORT_WHATSAPP = '+573242882751'
export const SUPPORT_MESSAGE = 'Hola, necesito soporte técnico con la aplicación.'

// ─── PIN del Desarrollador para Acceso a Consola Central ──────────────────────
export const DEV_PIN = '1609'
