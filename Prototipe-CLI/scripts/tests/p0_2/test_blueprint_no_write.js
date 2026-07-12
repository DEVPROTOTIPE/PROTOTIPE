/**
 * test_blueprint_no_write.js
 * 
 * Verifica que un Blueprint inválido produce CERO escrituras en el filesystem.
 * Si el flujo actual copia o crea directorios/archivos antes de validar,
 * esta prueba fallará demostrando el defecto.
 */

import path from 'node:path';
import fs from 'fs-extra';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createProject } from '../../../generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getDirHash(dirPath) {
  if (!await fs.pathExists(dirPath)) return 'NOT_EXIST';
  const files = await fs.readdir(dirPath);
  if (files.length === 0) return 'EMPTY';
  
  const hasher = crypto.createHash('sha256');
  for (const file of files.sort()) {
    const fullPath = path.join(dirPath, file);
    const stat = await fs.stat(fullPath);
    hasher.update(file);
    if (stat.isFile()) {
      const content = await fs.readFile(fullPath);
      hasher.update(content);
    }
  }
  return hasher.digest('hex');
}

export async function run(results) {
  const testName = 'P0.2 - Blueprint Cero Escrituras Test';
  console.log(`\n⏳ Ejecutando ${testName}...`);

  const tempDir = path.join(__dirname, 'temp_no_write_test');
  await fs.remove(tempDir).catch(() => {});
  await fs.ensureDir(tempDir);

  const initialHash = await getDirHash(tempDir);

  // Crear un payload inválido (blueprint versión incorrecta)
  const invalidPayload = {
    template: 'template-core-seed',
    projectName: 'Test No Write',
    targetPath: tempDir,
    paletteChoice: 'ruby',
    centralApiKey: 'test-key',
    centralAppId: 'test-app-id',
    blueprint: {
      blueprintVersion: '2.0.0-invalid', // Versión inválida
      instanceId: 'test-no-write',
      clientName: 'Test No Write',
      coreType: 'template-core-seed',
      vertical: 'retail_clothing',
      branding: {
        paletteChoice: 'ruby'
      },
      features: [],
      components: [],
      patterns: []
    }
  };

  try {
    // Invocamos el generador real. Se espera que lance un error por validación
    await createProject(invalidPayload);
    
    console.log('🔴 [FAILED] El generador aceptó un blueprint inválido sin arrojar error.');
    results.push({
      suite: testName,
      name: 'Rechazo de blueprint inválido',
      status: 'FAILED',
      error: 'El generador no lanzó excepción'
    });
  } catch (err) {
    // Se arrojó error, comprobamos si hubo escrituras físicas residuales
    const finalHash = await getDirHash(tempDir);
    const files = await fs.pathExists(tempDir) ? await fs.readdir(tempDir) : [];
    
    const isUnchanged = (initialHash === finalHash) && (files.length === 0);
    
    if (isUnchanged) {
      console.log('🟢 [PASSED] El blueprint inválido produjo cero escrituras físicas.');
      results.push({
        suite: testName,
        name: 'Cero escrituras físicas',
        status: 'PASSED'
      });
    } else {
      console.log(`🔴 [FAILED] Defecto detectado: el blueprint inválido realizó escrituras previas. Archivos en dir: [${files.join(', ')}]`);
      results.push({
        suite: testName,
        name: 'Cero escrituras físicas',
        status: 'FAILED',
        error: `Se escribieron archivos residuales: [${files.join(', ')}]`,
        extra: {
          validationFailed: true,
          filesBefore: 0,
          filesAfter: files.length,
          directoryHashUnchanged: false
        }
      });
    }
  } finally {
    await fs.remove(tempDir).catch(() => {});
  }
}
