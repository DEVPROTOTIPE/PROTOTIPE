/**
 * test_scaffolding_security.js
 * 
 * Suite de pruebas normativas RED para evaluar la seguridad del scaffolding físico en P0.3.
 * Comprueba:
 * 1. Directory Traversal en targetPath.
 * 2. Validación temprana de logoPath fuera del directorio temporal.
 * 3. Ventana vulnerable de TOCTOU / verificación de enlaces simbólicos.
 * 4. Fuga de secretos en el canal IPC del worker.
 */

import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';
import { normalizeProvisioningEnvelope } from '../../../lib/ProvisioningEnvelopeAdapter.js';
import { ProvisioningValidator } from '../../../lib/ProvisioningValidator.js';
import { redactSecrets, containsSecret } from '../../../lib/SecretRedactor.js';
import { createProject } from '../../../generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function run(results) {
  const suiteName = 'P0.3 - Scaffolding Security';
  console.log(`\n⏳ Ejecutando ${suiteName}...`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. DIRECTORY TRAVERSAL EN targetPath
  // ─────────────────────────────────────────────────────────────────────────────
  const traversalPaths = [
    '../../outside-target',
    'C:\\Windows\\System32\\malicious-app',
    '/etc/malicious-config'
  ];

  for (const maliciousPath of traversalPaths) {
    const payload = {
      blueprint: {
        blueprintVersion: '1.0.0',
        instanceId: 'tienda-test-traversal',
        clientName: 'Tienda Test Traversal',
        coreType: 'template-ventas',
        vertical: 'retail_clothing',
        features: [],
        components: [],
        patterns: [],
        branding: { paletteChoice: 'emerald' }
      },
      template: 'template-ventas',
      execution: {
        targetPath: maliciousPath
      }
    };

    let adapterError = null;
    let validatorError = null;

    // A. Comprobar si el adaptador de la frontera (Bridge) bloquea la ruta maliciosa
    try {
      normalizeProvisioningEnvelope(payload);
    } catch (err) {
      adapterError = err;
    }

    // B. Comprobar si el validador estructural rechaza la ruta maliciosa
    try {
      const valResult = await ProvisioningValidator.validate(payload.blueprint);
      if (!valResult.isValid) {
        validatorError = new Error(valResult.errors.join(' | '));
      }
    } catch (err) {
      validatorError = err;
    }

    const pathIsAllowed = !adapterError && !validatorError;

    if (pathIsAllowed) {
      console.log(`🔴 [PRODUCT_BEHAVIOR_FAILURE] targetPath malicioso permitido: "${maliciousPath}"`);
      results.push({
        suite: suiteName,
        name: `Directory Traversal en targetPath: ${maliciousPath}`,
        status: 'PRODUCT_BEHAVIOR_FAILURE',
        error: `El sistema permite el flujo de ejecución para targetPath malicioso "${maliciousPath}". Falta validación de contención.`
      });
    } else {
      console.log(`🟢 [PASSED] targetPath malicioso bloqueado: "${maliciousPath}"`);
      results.push({
        suite: suiteName,
        name: `Directory Traversal en targetPath: ${maliciousPath}`,
        status: 'PASSED'
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. LOGO PATH ESCAPE (Falta de barrera temprana)
  // ─────────────────────────────────────────────────────────────────────────────
  const escapeLogoPayload = {
    blueprint: {
      blueprintVersion: '1.0.0',
      instanceId: 'tienda-test-logo',
      clientName: 'Tienda Test Logo',
      coreType: 'template-core-seed',
      vertical: 'retail_clothing',
      branding: { paletteChoice: 'emerald' }
    },
    logoPath: 'C:\\Users\\Sergio\\.ssh\\id_rsa' // Fuera de temp_uploads
  };

  let logoAdapterError = null;
  try {
    normalizeProvisioningEnvelope(escapeLogoPayload);
  } catch (err) {
    logoAdapterError = err;
  }

  // Actualmente, el adaptador del Bridge no valida logoPath, por lo que este payload pasa.
  if (!logoAdapterError) {
    console.log('🔴 [PRODUCT_BEHAVIOR_FAILURE] logoPath fuera de temp_uploads permitido en adaptador del Bridge.');
    results.push({
      suite: suiteName,
      name: 'Validación temprana de logoPath en el adaptador',
      status: 'PRODUCT_BEHAVIOR_FAILURE',
      error: 'El adaptador del Bridge permite procesar un logoPath fuera del directorio temporal temp_uploads. Falta barrera temprana.'
    });
  } else {
    console.log('🟢 [PASSED] logoPath fuera de temp_uploads bloqueado tempranamente.');
    results.push({
      suite: suiteName,
      name: 'Validación temprana de logoPath en el adaptador',
      status: 'PASSED'
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. TOCTOU (Verificación de contención física final y enlaces simbólicos)
  // ─────────────────────────────────────────────────────────────────────────────
  // En este test RED documentamos que no existe ninguna llamada a fs.realpath ni validación de enlaces
  // simbólicos en generator.js antes de escribir o copiar los templates.
  const generatorCodePath = path.resolve(__dirname, '..', '..', '..', 'generator.js');
  let hasRealpathValidation = false;
  try {
    const generatorContent = await fs.readFile(generatorCodePath, 'utf-8');
    // Si no contiene validaciones de realpath o lstat combinadas con APPLICATIONS_DIR
    hasRealpathValidation = generatorContent.includes('fs.realpath') && generatorContent.includes('isPathContained');
  } catch (e) {
    hasRealpathValidation = false;
  }

  if (!hasRealpathValidation) {
    console.log('🔴 [PRODUCT_BEHAVIOR_FAILURE] Ventana TOCTOU activa: generator.js no resuelve fs.realpath tras ensureDir.');
    results.push({
      suite: suiteName,
      name: 'Hardening TOCTOU y Enlaces Simbólicos',
      status: 'PRODUCT_BEHAVIOR_FAILURE',
      error: 'generator.js no realiza validación física final con fs.realpath del tDir creado, permitiendo ataques de carrera por enlaces simbólicos.'
    });
  } else {
    console.log('🟢 [PASSED] Hardening TOCTOU y Enlaces Simbólicos implementado.');
    results.push({
      suite: suiteName,
      name: 'Hardening TOCTOU y Enlaces Simbólicos',
      status: 'PASSED'
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. AISLAMIENTO DE SECRETOS — 4 sub-casos usando SecretRedactor
  // ─────────────────────────────────────────────────────────────────────────────

  // 4.1 firebaseApiKey en answers (root-level)
  {
    const answers = {
      firebaseApiKey: 'AIza-test-secret-key-12345678',
      clientName: 'Tienda Prueba'
    };
    const rawLog = `Configurando Firebase con apiKey: ${answers.firebaseApiKey}`;
    const redacted = redactSecrets(rawLog, answers);
    const leaked = redacted.includes(answers.firebaseApiKey);

    if (leaked) {
      console.log('\uD83D\uDD34 [PRODUCT_BEHAVIOR_FAILURE] firebaseApiKey en answers filtrado en log.');
      results.push({
        suite: suiteName,
        name: 'Redacci\u00f3n de secretos: firebaseApiKey en answers',
        status: 'PRODUCT_BEHAVIOR_FAILURE',
        error: `El valor "${answers.firebaseApiKey}" apareci\u00f3 sin censurar en: "${redacted}"`
      });
    } else {
      console.log('\uD83D\uDFE2 [PASSED] firebaseApiKey en answers correctamente redactado.');
      results.push({
        suite: suiteName,
        name: 'Redacci\u00f3n de secretos: firebaseApiKey en answers',
        status: 'PASSED'
      });
    }
  }

  // 4.2 adminPassword en objeto anidado
  {
    const answers = {
      auth: {
        adminPassword: 'super-secret-pass-nested-9876'
      }
    };
    const rawLog = `Inicializando admin con password: ${answers.auth.adminPassword}`;
    const redacted = redactSecrets(rawLog, answers);
    const leaked = redacted.includes(answers.auth.adminPassword);

    if (leaked) {
      console.log('\uD83D\uDD34 [PRODUCT_BEHAVIOR_FAILURE] adminPassword anidado filtrado en log.');
      results.push({
        suite: suiteName,
        name: 'Redacci\u00f3n de secretos: adminPassword en objeto anidado',
        status: 'PRODUCT_BEHAVIOR_FAILURE',
        error: `El valor anidado "${answers.auth.adminPassword}" apareci\u00f3 sin censurar en: "${redacted}"`
      });
    } else {
      console.log('\uD83D\uDFE2 [PASSED] adminPassword en objeto anidado correctamente redactado.');
      results.push({
        suite: suiteName,
        name: 'Redacci\u00f3n de secretos: adminPassword en objeto anidado',
        status: 'PASSED'
      });
    }
  }

  // 4.3 Token en process.env
  {
    const testTokenValue = 'env-token-test-secret-abcdef9876';
    const testTokenKey = 'TEST_PROTOTIPE_SECRET_TOKEN';
    const originalEnvVal = process.env[testTokenKey];
    process.env[testTokenKey] = testTokenValue;

    const rawLog = `Ejecutando con token: ${testTokenValue}`;
    const redacted = redactSecrets(rawLog);
    const leaked = redacted.includes(testTokenValue);

    // Limpiar variable de entorno de prueba
    if (originalEnvVal === undefined) {
      delete process.env[testTokenKey];
    } else {
      process.env[testTokenKey] = originalEnvVal;
    }

    if (leaked) {
      console.log('\uD83D\uDD34 [PRODUCT_BEHAVIOR_FAILURE] Token de process.env filtrado en log.');
      results.push({
        suite: suiteName,
        name: 'Redacci\u00f3n de secretos: token en process.env',
        status: 'PRODUCT_BEHAVIOR_FAILURE',
        error: `El token de env "${testTokenValue}" apareci\u00f3 sin censurar en: "${redacted}"`
      });
    } else {
      console.log('\uD83D\uDFE2 [PASSED] Token de process.env correctamente redactado.');
      results.push({
        suite: suiteName,
        name: 'Redacci\u00f3n de secretos: token en process.env',
        status: 'PASSED'
      });
    }
  }

  // 4.4 Error simulado de Firebase con secreto
  {
    const answers = {
      firebaseApiKey: 'AIza-firebase-error-secret-xyz99'
    };
    const simulatedFirebaseError = new Error(
      `Firebase: Error (auth/invalid-api-key) [apiKey=${answers.firebaseApiKey}]`
    );
    const redactedErrorMsg = redactSecrets(simulatedFirebaseError.message, answers);
    const leaked = redactedErrorMsg.includes(answers.firebaseApiKey);

    if (leaked) {
      console.log('\uD83D\uDD34 [PRODUCT_BEHAVIOR_FAILURE] Mensaje de error Firebase con secreto no fue censurado.');
      results.push({
        suite: suiteName,
        name: 'Redacci\u00f3n de secretos: error de Firebase con secreto',
        status: 'PRODUCT_BEHAVIOR_FAILURE',
        error: `El mensaje de error "${redactedErrorMsg}" contiene el secreto sin censurar.`
      });
    } else {
      console.log('\uD83D\uDFE2 [PASSED] Error de Firebase con secreto correctamente censurado.');
      results.push({
        suite: suiteName,
        name: 'Redacci\u00f3n de secretos: error de Firebase con secreto',
        status: 'PASSED'
      });
    }
  }
}
