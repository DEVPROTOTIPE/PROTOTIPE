/**
 * alertService — singleton imperativo para disparar alertas/confirms
 * desde fuera del árbol de React (hooks puros, servicios, utilidades).
 *
 * El AlertConfirmProvider lo registra al montar usando `register()`.
 * Cualquier módulo JS que necesite mostrar una alerta importa este archivo
 * y llama directamente showAlert / showConfirm.
 */

let _showAlert = null
let _showConfirm = null

/** Registra las implementaciones del contexto. Llamado por AlertConfirmProvider. */
export function register(showAlert, showConfirm) {
  _showAlert = showAlert
  _showConfirm = showConfirm
}

/** Muestra una alerta informativa. Retorna Promise<void>. */
export function showAlert(opts) {
  if (_showAlert) return _showAlert(opts)
  // Fallback mínimo si el provider aún no montó (no debería ocurrir en producción)
  console.warn('[alertService] showAlert llamado antes del registro del Provider:', opts)
  return Promise.resolve()
}

/** Muestra una confirmación. Retorna Promise<boolean>. */
export function showConfirm(opts) {
  if (_showConfirm) return _showConfirm(opts)
  console.warn('[alertService] showConfirm llamado antes del registro del Provider:', opts)
  return Promise.resolve(false)
}
