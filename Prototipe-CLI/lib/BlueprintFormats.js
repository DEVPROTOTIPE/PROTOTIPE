/**
 * BlueprintFormats.js
 * 
 * Funciones puras de validación de formato para blueprintVersion (SemVer)
 * y colores HSL.
 */

import semver from 'semver';

/**
 * Valida sintácticamente un SemVer canónico estricto para Blueprints.
 * Debe ser de la forma exacta x.y.z sin prefijo 'v', prerelease ni build metadata.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidCanonicalBlueprintSemver(value) {
  if (typeof value !== 'string') return false;
  
  const parsed = semver.parse(value, { loose: false });
  return Boolean(
    parsed &&
    parsed.version === value &&
    (!parsed.prerelease || parsed.prerelease.length === 0) &&
    (!parsed.build || parsed.build.length === 0)
  );
}

/**
 * Valida un formato de color HSL canónico estricto de CSS.
 * Formato admitido: hsl(H, S%, L%)
 * Se permiten espacios opcionales después de las comas.
 * No se permiten decimales, alpha, HEX, RGB ni nombres CSS.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidCanonicalHsl(value) {
  if (typeof value !== 'string') return false;

  // Regex estricto con comas, enteros y porcentajes
  const match = value.match(/^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/);
  if (!match) return false;

  const h = parseInt(match[1], 10);
  const s = parseInt(match[2], 10);
  const l = parseInt(match[3], 10);

  return (
    h >= 0 && h <= 360 &&
    s >= 0 && s <= 100 &&
    l >= 0 && l <= 100
  );
}
