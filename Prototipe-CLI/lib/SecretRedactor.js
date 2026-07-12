/**
 * SecretRedactor.js
 *
 * Módulo centralizado para censurar secretos en strings, objetos y arrays
 * antes de que salgan por logs IPC, consola o mensajes de error.
 *
 * Soporta:
 *   - Valores directos de process.env con claves sensibles
 *   - Valores del objeto answers pasado al worker
 *   - Objetos anidados de forma recursiva
 *   - Arrays
 *   - Valores nulos / no-string (no lanzan error)
 */

/** Claves cuyo valor se considera secreto (case-insensitive match) */
const SECRET_KEY_PATTERN = /KEY|TOKEN|SECRET|PASSWORD|PASSWD|CREDENTIAL|API|FIREBASE|VITE_FIREBASE|AUTH|PRIVATE|CERT|ADMIN/i;

/** Longitud mínima de un valor para considerarlo secreto (evita redactar "on", "true", etc.) */
const MIN_SECRET_LENGTH = 8;

/**
 * Extrae un mapa de { valor → clave } de secretos conocidos combinando:
 *   1. Variables de entorno con claves sensibles.
 *   2. El objeto answers (y sus objetos anidados).
 *
 * @param {Object} [answers={}] Objeto answers del worker
 * @returns {Map<string, string>} Mapa valor→clave para sustitución
 */
function buildSecretMap(answers = {}) {
  const map = new Map();

  // 1. process.env
  for (const [key, value] of Object.entries(process.env)) {
    if (!value || value.length < MIN_SECRET_LENGTH) continue;
    if (SECRET_KEY_PATTERN.test(key)) {
      map.set(value, key);
    }
  }

  // 2. answers (recursivo)
  collectSecretsFromObject(answers, map);

  return map;
}

/**
 * Recorre recursivamente un objeto y agrega al mapa los valores sensibles.
 * @param {*} obj
 * @param {Map<string, string>} map
 * @param {string} [parentKey='']
 */
function collectSecretsFromObject(obj, map, parentKey = '') {
  if (!obj || typeof obj !== 'object') return;

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (typeof value === 'string') {
      if (value.length >= MIN_SECRET_LENGTH && SECRET_KEY_PATTERN.test(key)) {
        map.set(value, fullKey);
      }
    } else if (Array.isArray(value)) {
      // Arrays: no procesamos individualmente (no son secretos escalares)
    } else if (value && typeof value === 'object') {
      collectSecretsFromObject(value, map, fullKey);
    }
  }
}

/**
 * Censura secretos en un valor de texto dado un mapa de secretos.
 *
 * @param {*} value - El valor a limpiar (string, number, object, etc.)
 * @param {Map<string, string>} secretMap - Mapa de secretos generado por buildSecretMap
 * @returns {string} El texto con los secretos reemplazados por [REDACTED:clave]
 */
function redactWithMap(value, secretMap) {
  let output = typeof value === 'string' ? value : String(value ?? '');

  for (const [secret, keyName] of secretMap) {
    if (output.includes(secret)) {
      // Usar split/join para evitar problemas de caracteres especiales en regex
      output = output.split(secret).join(`[REDACTED:${keyName}]`);
    }
  }

  return output;
}

/**
 * Función principal de redacción.
 * Censura un valor (string, objeto serializable o cualquier tipo) usando
 * las claves de process.env más el objeto answers proporcionado.
 *
 * @param {*} value - El valor a limpiar
 * @param {Object} [answers={}] - Objeto answers del worker para detectar secretos adicionales
 * @returns {string} Texto saneado
 */
export function redactSecrets(value, answers = {}) {
  const secretMap = buildSecretMap(answers);

  if (value === null || value === undefined) return '';

  if (typeof value === 'string') {
    return redactWithMap(value, secretMap);
  }

  // Serializar objetos y arrays de forma segura antes de limpiar
  try {
    const serialized = JSON.stringify(value);
    return redactWithMap(serialized, secretMap);
  } catch {
    return '[UNSERIALIZABLE_OBJECT]';
  }
}

/**
 * Retorna true si el string contiene algún secreto conocido.
 * Útil para unit tests.
 *
 * @param {string} text
 * @param {Object} [answers={}]
 * @returns {boolean}
 */
export function containsSecret(text, answers = {}) {
  const secretMap = buildSecretMap(answers);
  for (const [secret] of secretMap) {
    if (text.includes(secret)) return true;
  }
  return false;
}
