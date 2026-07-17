import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import { isValidCanonicalBlueprintSemver, isValidCanonicalHsl } from '../lib/BlueprintFormats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');

const ajv = new Ajv({ allErrors: true });
ajv.addFormat('blueprint-semver', {
  type: 'string',
  validate: isValidCanonicalBlueprintSemver
});
ajv.addFormat('hsl-color', {
  type: 'string',
  validate: isValidCanonicalHsl
});

async function loadSchema(schemaName) {
  const schemaPath = path.join(CLI_ROOT, 'knowledge', 'schema', schemaName);
  return fs.readJson(schemaPath);
}

async function validateFolder(folderName, schemaName) {
  const folderPath = path.join(CLI_ROOT, 'knowledge', folderName);
  if (!await fs.pathExists(folderPath)) {
    console.log(`⚠️  Directorio no encontrado: ${folderName}. Omitiendo.`);
    return true;
  }

  const schema = await loadSchema(schemaName);
  const validate = ajv.compile(schema);
  const files = await fs.readdir(folderPath);
  let hasErrors = false;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const filePath = path.join(folderPath, file);
    try {
      const data = await fs.readJson(filePath);
      const valid = validate(data);

      if (!valid) {
        console.error(`❌ [ERROR DE ESQUEMA] Archivo: ${folderName}/${file}`);
        console.error(validate.errors);
        hasErrors = true;
      } else {
        console.log(`✅ [VÁLIDO] ${folderName}/${file}`);
      }
    } catch (err) {
      console.error(`❌ [ERROR DE LECTURA] Archivo: ${folderName}/${file}. Detalle: ${err.message}`);
      hasErrors = true;
    }
  }

  return !hasErrors;
}

async function main() {
  console.log('🔍 [VALIDACIÓN DE KNOWLEDGE LAYER] Iniciando escaneo de esquemas...');
  try {
    let success = true;

    // 1. Validar Features
    const featuresOk = await validateFolder('features', 'feature.schema.json');
    if (!featuresOk) success = false;

    // 2. Validar Componentes
    const componentsOk = await validateFolder('components', 'component.schema.json');
    if (!componentsOk) success = false;

    // 3. Validar Patrones
    const patternsOk = await validateFolder('patterns', 'pattern.schema.json');
    if (!patternsOk) success = false;

    // 4. Validar Mapa de Capacidades
    const capabilitiesOk = await validateFolder('capabilities', 'capability.schema.json');
    if (!capabilitiesOk) success = false;

    // 5. Validar Industrias
    const industriesOk = await validateFolder('industries', 'industry.schema.json');
    if (!industriesOk) success = false;

    // 6. Validar Ejemplos de Blueprint
    const examplesOk = await validateFolder('examples', 'blueprint.schema.json');
    if (!examplesOk) success = false;

    if (!success) {
      console.error('\n❌ [FALLO DE VALIDACIÓN] La Knowledge Layer contiene inconsistencias de esquema.');
      process.exit(1);
    } else {
      console.log('\n🎉 [ÉXITO] Todos los archivos de la Knowledge Layer cumplen con los esquemas de gobernanza.');
    }
  } catch (err) {
    console.error('❌ Error crítico en validador:', err);
    process.exit(1);
  }
}
main();
