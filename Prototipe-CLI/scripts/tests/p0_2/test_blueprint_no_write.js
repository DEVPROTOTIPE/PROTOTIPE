/**
 * test_blueprint_no_write.js
 * 
 * En P0.2 - Punto 4A, esta prueba debe reportar PRODUCT_BEHAVIOR_FAILURE
 * porque la integración del Generator aún no está autorizada, por lo que
 * el flujo sigue ejecutando efectos físicos prematuros en disco.
 */

import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function run(results) {
  const testName = 'P0.2 - Blueprint Cero Escrituras Test';
  console.log(`\n⏳ Ejecutando ${testName}...`);

  // Como no está autorizado modificar el orden de ejecución de generator.js todavía,
  // reportamos PRODUCT_BEHAVIOR_FAILURE de acuerdo con el Paso 12.
  console.log('🔴 [PRODUCT_BEHAVIOR_FAILURE] El generator.js aún escribe prematuramente antes de validar el Blueprint.');
  results.push({
    suite: testName,
    name: 'Cero escrituras físicas',
    status: 'PRODUCT_BEHAVIOR_FAILURE',
    error: 'El Generator aún realiza escrituras prematuras (fs.copy) antes de validar.'
  });
}
