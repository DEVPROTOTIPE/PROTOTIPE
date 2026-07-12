/**
 * BlueprintCatalogResolver.js
 * 
 * Consulta y valida la existencia de recursos contra las fuentes de verdad físicas.
 * Implementa un modelo fail-closed: ante cualquier fallo de archivo ausente o
 * estructura corrupta, aborta de inmediato.
 */

import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, '..');

// Las 23 verticales de negocio canónicas oficiales
const CANONICAL_VERTICALS = new Set([
  'retail_clothing', 'grocery_food', 'technical_services', 'refrigeration_ac',
  'contractors', 'machinery_rental', 'carpentry', 'laundry', 'furniture_repair',
  'wellness_podology', 'insumos-agricolas', 'alimentos-artesanales',
  'ferreteria-rural', 'repuestos-motos', 'distribuidoras-beauty',
  'petshops-locales', 'repuestos-lineablanca', 'moda-local-calzado',
  'alimentacion-saludable', 'home-office-ergonomia', 'licores-cocteleria',
  'coleccionismo-geek', 'distribucion-horeca'
]);

export class BlueprintCatalogResolver {
  /**
   * Valida un coreType contra el archivo de registro y la carpeta templates/.
   * @param {string} coreType
   * @param {Object} [ctx] Contexto para inyectar rutas personalizadas en pruebas
   */
  static async validateCoreType(coreType, ctx = {}) {
    const registroPath = ctx.registroPath || path.join(CLI_ROOT, 'plantillas_registro.json');
    const templatesDir = ctx.templatesDir || path.join(CLI_ROOT, 'templates');

    // 1. Validar lectura del registro central
    if (!await fs.pathExists(registroPath)) {
      throw new Error(`El archivo de registro de plantillas no existe: ${registroPath}`);
    }
    
    let registro;
    try {
      registro = await fs.readJson(registroPath);
    } catch (err) {
      throw new Error(`El archivo de registro de plantillas contiene JSON inválido: ${err.message}`);
    }

    if (!registro || typeof registro.plantillas !== 'object') {
      throw new Error('El formato de plantillas_registro.json es incorrecto o inválido.');
    }

    // 2. Aceptar únicamente los IDs oficiales de origen
    if (coreType !== 'template-core-seed' && coreType !== 'template-ventas') {
      throw new Error(`El coreType "${coreType}" no es una plantilla oficial soportada.`);
    }

    // 3. Comprobar existencia del directorio físico
    const templatePhysDir = path.join(templatesDir, coreType);
    if (!await fs.pathExists(templatePhysDir)) {
      throw new Error(`El directorio físico de la plantilla no existe: ${templatePhysDir}`);
    }

    return true;
  }

  /**
   * Valida una vertical contra niches.json y la lista blanca de 23 verticales canónicas.
   * @param {string} vertical
   * @param {Object} [ctx]
   */
  static async validateVertical(vertical, ctx = {}) {
    const nichesPath = ctx.nichesPath || path.join(CLI_ROOT, 'config', 'niches.json');

    if (!await fs.pathExists(nichesPath)) {
      throw new Error(`El catálogo de nichos no existe: ${nichesPath}`);
    }

    let niches;
    try {
      niches = await fs.readJson(nichesPath);
    } catch (err) {
      throw new Error(`El catálogo de nichos contiene JSON inválido: ${err.message}`);
    }

    // Validar pertenencia a las 23 canónicas (excluyendo general, general_custom y servicio_mesa)
    if (!CANONICAL_VERTICALS.has(vertical)) {
      throw new Error(`La vertical "${vertical}" no es una vertical canónica válida de negocio.`);
    }

    if (!niches[vertical]) {
      throw new Error(`La vertical "${vertical}" no se encuentra registrada en config/niches.json.`);
    }

    return true;
  }

  /**
   * Valida la existencia física de metadatos de Features.
   * @param {string} featureId
   * @param {Object} [ctx]
   */
  static async validateFeature(featureId, ctx = {}) {
    const dir = ctx.featuresDir || path.join(CLI_ROOT, 'knowledge', 'features');
    const filePath = path.join(dir, `${featureId}.json`);

    if (!await fs.pathExists(filePath)) {
      throw new Error(`La feature "${featureId}" no existe en el catálogo.`);
    }
    return fs.readJson(filePath);
  }

  /**
   * Valida la existencia física de metadatos de Componentes.
   * @param {string} componentId
   * @param {Object} [ctx]
   */
  static async validateComponent(componentId, ctx = {}) {
    const dir = ctx.componentsDir || path.join(CLI_ROOT, 'knowledge', 'components');
    // Convertir a kebab-case para el archivo físico si es necesario
    const kebab = componentId.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    const filePath = path.join(dir, `${kebab}.json`);

    if (!await fs.pathExists(filePath)) {
      throw new Error(`El componente "${componentId}" (archivo ${kebab}.json) no existe en el catálogo.`);
    }
    return fs.readJson(filePath);
  }

  /**
   * Valida la existencia física de metadatos de Patrones.
   * @param {string} patternId
   * @param {Object} [ctx]
   */
  static async validatePattern(patternId, ctx = {}) {
    const dir = ctx.patternsDir || path.join(CLI_ROOT, 'knowledge', 'patterns');
    // Quitar prefijo "pattern-" si se busca el archivo
    const fileBase = patternId.replace(/^pattern-/, '');
    const filePath = path.join(dir, `${fileBase}.json`);

    if (!await fs.pathExists(filePath)) {
      throw new Error(`El patrón "${patternId}" (archivo ${fileBase}.json) no existe en el catálogo.`);
    }
    return fs.readJson(filePath);
  }
}
