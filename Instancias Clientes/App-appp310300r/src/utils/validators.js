/**
 * Validadores comunes de datos.
 */

export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
export const isValidPhone = (v) => /^[0-9]{10}$/.test(v?.replace(/\s/g, ''))
export const isRequired   = (v) => v !== null && v !== undefined && String(v).trim() !== ''
