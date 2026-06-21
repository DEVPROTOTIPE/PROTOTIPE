import path from 'path';
import fs from 'fs-extra';

const CLI_ROOT = process.cwd();
const REGISTRO_PATH = path.join(CLI_ROOT, 'plantillas_registro.json');

// Cargar variables de entorno del archivo .env local si existe
const envPath = path.join(CLI_ROOT, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  });
}

// Determinar el Workspace Root (APPLICATIONS_DIR)
const APPLICATIONS_DIR = process.env.PROTOTIPE_WORKSPACE_ROOT || process.env.APPLICATIONS_DIR || 'D:\\PROTOTIPE\\Instancias Clientes';
const TEMPLATES_DIR = path.join(CLI_ROOT, 'templates');

// Determinar la ruta al directorio de Documentación (puede sobreescribirse vía env)
const DOCUMENTATION_DIR = process.env.PROTOTIPE_DOCS_ROOT
  || path.join(APPLICATIONS_DIR, 'Documentacion PROTOTIPE');

/**
 * Retorna la ruta física del Workspace Root
 */
export function getWorkspaceRoot() {
  return APPLICATIONS_DIR;
}

/**
 * Retorna la ruta física del directorio de Documentación del Proyecto
 */
export function getDocumentationRoot() {
  return DOCUMENTATION_DIR;
}

/**
 * Retorna la ruta física de la carpeta de plantillas
 */
export function getTemplatesDir() {
  return TEMPLATES_DIR;
}

/**
 * Retorna la ruta física de plantillas_registro.json
 */
export function getRegistroPath() {
  return REGISTRO_PATH;
}

/**
 * Retorna la ruta física destino de una instancia de cliente basada en su coreType
 * @param {string} coreType Tipo de core de la plantilla (ej: 'ventas', 'reservas')
 * @param {string} projectName Nombre del proyecto/instancia
 * @returns {string} Ruta absoluta de destino
 */
export function getInstancePath(coreType, projectName) {
  if (coreType) {
    return path.join(APPLICATIONS_DIR, coreType, projectName);
  }
  return path.join(APPLICATIONS_DIR, projectName);
}

/**
 * Valida el esquema estructural de plantillas_registro.json
 * @param {Object} registro Objeto JSON leído del registro de plantillas
 * @returns {Array<string>} Lista de errores encontrados (vacía si es válido)
 */
export function validateRegistroSchema(registro) {
  const errors = [];
  if (!registro || typeof registro !== 'object') {
    errors.push('El registro de plantillas debe ser un objeto JSON válido.');
    return errors;
  }
  if (!registro.plantillas || typeof registro.plantillas !== 'object') {
    errors.push('Falta el objeto central "plantillas" en el JSON de registro.');
    return errors;
  }
  const semverRegex = /^\d+\.\d+\.\d+$/;
  for (const [key, config] of Object.entries(registro.plantillas)) {
    if (!config || typeof config !== 'object') {
      errors.push(`La entrada "${key}" en el registro debe ser un objeto.`);
      continue;
    }
    const required = ['fuente', 'destino', 'nicho', 'activo', 'version', 'coreType'];
    required.forEach(f => {
      if (!(f in config)) {
        errors.push(`La plantilla "${key}" no contiene el campo requerido "${f}".`);
      }
    });

    if (config.fuente && typeof config.fuente !== 'string') {
      errors.push(`El campo "fuente" de "${key}" debe ser un string.`);
    }
    if (config.destino && typeof config.destino !== 'string') {
      errors.push(`El campo "destino" de "${key}" debe ser un string.`);
    }
    if (config.nicho && typeof config.nicho !== 'string') {
      errors.push(`El campo "nicho" de "${key}" debe ser un string.`);
    }
    if (config.coreType && typeof config.coreType !== 'string') {
      errors.push(`El campo "coreType" de "${key}" debe ser un string.`);
    }
    if ('activo' in config && typeof config.activo !== 'boolean') {
      errors.push(`El campo "activo" de "${key}" debe ser un booleano.`);
    }
    if (config.version && (typeof config.version !== 'string' || !semverRegex.test(config.version))) {
      errors.push(`El campo "version" de "${key}" ("${config.version}") debe ser un string SemVer válido (ej. "1.0.0").`);
    }
  }
  return errors;
}
