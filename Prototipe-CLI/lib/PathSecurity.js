/**
 * PathSecurity.js
 * 
 * Clase de seguridad centralizada para validar y blindar accesos y escrituras físicas
 * en el filesystem contra ataques de Directory Traversal y TOCTOU.
 */

import path from 'node:path';
import fs from 'fs-extra';
import { getWorkspaceRoot } from '../config.js';

export class PathSecurity {
  /**
   * Valida que un path de destino esté estrictamente contenido dentro del directorio raíz permitido.
   * Mitiga inyecciones de null bytes, directory traversal relativo y absoluto.
   * 
   * Nota Windows: path.resolve() preserva la case de la letra de unidad del input (d: vs D:).
   * Se normaliza a lowercase antes de comparar para evitar falsos negativos de case-sensitivity.
   * 
   * @param {string} baseDir Directorio base permitido (ej: APPLICATIONS_DIR)
   * @param {string} targetPath Path de destino a evaluar
   * @returns {string} Path absoluto resuelto
   * @throws {Error} Si el path está fuera de la raíz permitida (PATH_OUTSIDE_ALLOWED_ROOT)
   */
  static validateContainedPath(baseDir, targetPath) {
    if (!baseDir || !targetPath) {
      throw new Error('PATH_OUTSIDE_ALLOWED_ROOT: baseDir o targetPath inválidos.');
    }

    // 1. Detectar e inhabilitar null bytes en la cadena
    if (targetPath.indexOf('\0') !== -1) {
      throw new Error('PATH_OUTSIDE_ALLOWED_ROOT: Null byte detectado.');
    }

    // 2. Resolver rutas absolutas y resolver traversals de forma canónica
    const resolvedBase   = path.resolve(baseDir);
    const resolvedTarget = path.resolve(targetPath);

    // 3. Normalizar a lowercase para comparación insensible a la case de la letra de unidad
    //    (Windows: path.resolve preserva la case del input, 'd:\' !== 'D:\')
    const normalizedBase   = resolvedBase.toLowerCase();
    const normalizedTarget = resolvedTarget.toLowerCase();

    // 4. Verificar contención física
    const isContained =
      normalizedTarget.startsWith(normalizedBase + path.sep.toLowerCase()) ||
      normalizedTarget === normalizedBase;

    if (!isContained) {
      throw new Error(`PATH_OUTSIDE_ALLOWED_ROOT: El path "${targetPath}" intenta acceder fuera de la raíz permitida.`);
    }

    return resolvedTarget;
  }

  /**
   * Retorna un booleano indicando si childPath está contenido en parentPath.
   * Case-insensitive en letra de unidad para compatibilidad Windows.
   */
  static isPathContained(parentPath, childPath) {
    if (!parentPath || !childPath) return false;
    const parentResolved = path.resolve(parentPath).toLowerCase();
    const childResolved  = path.resolve(childPath).toLowerCase();
    return childResolved.startsWith(parentResolved + path.sep.toLowerCase()) || childResolved === parentResolved;
  }
}
