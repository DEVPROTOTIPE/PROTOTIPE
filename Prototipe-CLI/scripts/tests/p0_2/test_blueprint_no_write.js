/**
 * test_blueprint_no_write.js
 * 
 * En P0.2 - Punto 4B, esta prueba verifica dinámicamente que
 * ante un blueprint inválido, generator.js aborte inmediatamente
 * sin realizar ninguna escritura física en el disco.
 */

import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';
import { createProject } from '../../../generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function run(results) {
  const testName = 'P0.2 - Blueprint Cero Escrituras Test';
  console.log(`\n⏳ Ejecutando ${testName}...`);

  const tempDir = path.join(__dirname, 'temp-no-write-test');
  await fs.remove(tempDir);

  const invalidPayload = {
    template: 'template-core-seed',
    projectName: 'Test No Write',
    targetPath: tempDir,
    blueprint: {
      blueprintVersion: '2.0.0-invalid', // Versión inválida para forzar rechazo
      instanceId: 'test-no-write',
      clientName: 'Test No Write',
      coreType: 'template-core-seed',
      vertical: 'retail_clothing',
      features: [],
      components: [],
      patterns: [],
      branding: {
        paletteChoice: 'ruby'
      }
    }
  };

  let errorThrown = null;
  try {
    await createProject(invalidPayload);
  } catch (err) {
    errorThrown = err;
  }

  const dirCreated = await fs.pathExists(tempDir);
  await fs.remove(tempDir); // Limpieza de seguridad

  if (dirCreated) {
    console.log('🔴 [PRODUCT_BEHAVIOR_FAILURE] Se crearon carpetas o archivos antes de fallar la validación.');
    results.push({
      suite: testName,
      name: 'Cero escrituras físicas',
      status: 'PRODUCT_BEHAVIOR_FAILURE',
      error: 'El Generator realizó escrituras físicas (directorios o archivos) antes de que fallara la validación del Blueprint.'
    });
  } else if (!errorThrown) {
    console.log('🔴 [PRODUCT_BEHAVIOR_FAILURE] El generator no arrojó ningún error ante un Blueprint inválido.');
    results.push({
      suite: testName,
      name: 'Cero escrituras físicas',
      status: 'PRODUCT_BEHAVIOR_FAILURE',
      error: 'El Generator continuó sin arrojar errores ante una validación que debió fallar.'
    });
  } else {
    console.log('🟢 [PASSED] Contrato Zero-write verificado exitosamente. Cero escrituras físicas.');
    results.push({
      suite: testName,
      name: 'Cero escrituras físicas',
      status: 'PASSED'
    });
  }
}
