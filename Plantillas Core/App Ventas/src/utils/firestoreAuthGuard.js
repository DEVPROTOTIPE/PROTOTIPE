/**
 * firestoreAuthGuard.js
 * ─────────────────────────────────────────────────────────────────
 * Wrapper defensivo para llamadas a Firestore que requieren sesión
 * autenticada. Previene el error "Missing or insufficient permissions"
 * causado por ejecutar getDocs/addDoc/updateDoc antes de que
 * Firebase Auth haya establecido la sesión del usuario.
 *
 * PATRÓN DE USO:
 *   // En lugar de:
 *   const snap = await getDocs(q)                   // ❌ falla si no hay auth
 *
 *   // Usar:
 *   const snap = await withAuth(() => getDocs(q))   // ✅ espera auth o lanza AuthGuardError
 *
 * ─────────────────────────────────────────────────────────────────
 */

import { getAuth } from 'firebase/auth'

/**
 * Error tipado para distinguir rechazos por falta de auth
 * de errores reales de Firestore.
 */
export class AuthGuardError extends Error {
  constructor(message = 'Se intentó una operación de Firestore sin usuario autenticado.') {
    super(message)
    this.name = 'AuthGuardError'
  }
}

/**
 * Ejecuta una operación de Firestore solo si hay un usuario autenticado.
 *
 * @template T
 * @param {() => Promise<T>} operation - Función async con la operación de Firestore.
 * @param {{ silent?: boolean, fallback?: T }} options
 *   - silent: Si true, no lanza excepción — retorna el fallback en su lugar (default: false).
 *   - fallback: Valor de retorno cuando no hay auth y silent=true (default: null).
 * @returns {Promise<T>}
 * @throws {AuthGuardError} Si no hay usuario y silent=false.
 */
export async function withAuth(operation, { silent = false, fallback = null } = {}) {
  const auth = getAuth()
  const user = auth.currentUser

  if (!user) {
    if (silent) {
      return fallback
    }
    throw new AuthGuardError()
  }

  return operation()
}

/**
 * Versión silenciosa de withAuth que retorna null si no hay auth.
 * Equivalente a withAuth(op, { silent: true }).
 *
 * Útil para métricas opcionales que no deben bloquear la UI.
 * @template T
 * @param {() => Promise<T>} operation
 * @param {T} [fallback=null]
 * @returns {Promise<T | null>}
 */
export async function withAuthSilent(operation, fallback = null) {
  return withAuth(operation, { silent: true, fallback })
}

/**
 * Guard booleano — indica si hay sesión activa en este instante.
 * Usar en condicionales cuando NO se necesita await.
 *
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getAuth().currentUser
}
