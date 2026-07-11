import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
ajv.addFormat('uuid', /^[a-zA-Z0-9-]+$/); // Formato flexible para IDs y UUIDs
ajv.addFormat('date-time', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/);
ajv.addFormat('uri', /^\S+$/); // Permitir cualquier uri sin espacios para mayor flexibilidad

// Rutas absolutas a los schemas
const PROMO_SCHEMA_PATH = path.join(CLI_ROOT, 'knowledge', 'core-promotion', 'promotion-blueprint.schema.json');
const MIGRATE_SCHEMA_PATH = path.join(CLI_ROOT, 'knowledge', 'core-promotion', 'lineage-migration.schema.json');
const JOURNAL_SCHEMA_PATH = path.join(CLI_ROOT, 'knowledge', 'core-promotion', 'journal.schema.json');

export class PromotionBlueprintBuilder {
  /**
   * Parser JSON seguro con mitigación recursiva contra Prototype Pollution
   */
  static safeJsonParse(jsonString) {
    const obj = JSON.parse(jsonString);
    this.sanitizeObject(obj);
    return obj;
  }

  /**
   * Limpieza recursiva de llaves de Prototype Pollution
   */
  static sanitizeObject(obj) {
    if (obj === null || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        this.sanitizeObject(item);
      }
      return;
    }

    const forbiddenKeys = ['__proto__', 'prototype', 'constructor'];
    for (const key of Object.getOwnPropertyNames(obj)) {
      if (forbiddenKeys.includes(key)) {
        throw new Error(`Violación de Seguridad: Clave peligrosa detectada '${key}' en el payload.`);
      }
      this.sanitizeObject(obj[key]);
    }
  }

  /**
   * Cargar y validar un blueprint de promoción
   */
  static loadPromotionBlueprint(filePath) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const blueprint = this.safeJsonParse(raw);

    const schema = fs.readJsonSync(PROMO_SCHEMA_PATH);
    const validate = ajv.compile(schema);
    const valid = validate(blueprint);

    if (!valid) {
      throw new Error(`Esquema de Blueprint de Promoción inválido: ${ajv.errorsText(validate.errors)}`);
    }

    return blueprint;
  }

  /**
   * Cargar y validar un blueprint de migración de linaje
   */
  static loadMigrationBlueprint(filePath) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const blueprint = this.safeJsonParse(raw);

    const schema = fs.readJsonSync(MIGRATE_SCHEMA_PATH);
    const validate = ajv.compile(schema);
    const valid = validate(blueprint);

    if (!valid) {
      throw new Error(`Esquema de Blueprint de Migración inválido: ${ajv.errorsText(validate.errors)}`);
    }

    return blueprint;
  }

  /**
   * Cargar y validar un journal transaccional
   */
  static loadJournal(filePath) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const journal = this.safeJsonParse(raw);

    const schema = fs.readJsonSync(JOURNAL_SCHEMA_PATH);
    const validate = ajv.compile(schema);
    const valid = validate(journal);

    if (!valid) {
      throw new Error(`Esquema de Journal inválido: ${ajv.errorsText(validate.errors)}`);
    }

    return journal;
  }

  /**
   * Escritura segura con rename atómico de JSON
   */
  static safeWriteJson(filePath, data) {
    // Sanitizar antes de escribir para evitar contaminar con prototype pollution
    this.sanitizeObject(data);
    
    const tempPath = `${filePath}.tmp`;
    fs.writeJsonSync(tempPath, data, { spaces: 2 });
    fs.renameSync(tempPath, filePath);
  }
}
