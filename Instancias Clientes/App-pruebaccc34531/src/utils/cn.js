/**
 * cn — Utilidad simple para concatenar clases de CSS condicionales.
 * @param {...string} inputs - Clases a evaluar
 * @returns {string} Clases concatenadas limpias
 */
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ')
}
