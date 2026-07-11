import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { CorePromotionService } from '../lib/CorePromotionService.js';
import { PromotionBlueprintBuilder } from '../lib/PromotionBlueprintBuilder.js';
import { CoreCandidateBuilder } from '../lib/CoreCandidateBuilder.js';
import { CorePromotionValidator } from '../lib/CorePromotionValidator.js';
import { CorePromotionPublisher } from '../lib/CorePromotionPublisher.js';
import { ClientLineageMigrator } from '../lib/ClientLineageMigrator.js';
import { BriefingDocumentMapper } from '../lib/BriefingDocumentMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, '..');

const TEST_CLIENT_DIR = path.join(CLI_ROOT, 'scratch', 'test-promotion-client');
// Apuntar estrictamente bajo scratch/staging para pasar el control de contención física del builder
const TEST_STAGING_DIR = path.join(CLI_ROOT, 'scratch', 'staging', 'app-test-core');
const TEST_BP_FILE = path.join(CLI_ROOT, 'scratch', 'test-promotion-blueprint.json');
const TEST_MIG_BP_FILE = path.join(CLI_ROOT, 'scratch', 'test-migration-blueprint.json');

async function setupTestEnvironment() {
  await fs.remove(TEST_CLIENT_DIR);
  await fs.remove(TEST_STAGING_DIR);
  await fs.remove(TEST_BP_FILE);
  await fs.remove(TEST_MIG_BP_FILE);

  const docsDir = path.join(CLI_ROOT, '..', 'Documentacion PROTOTIPE', '09_Modulos_Completos', 'Documentacion App Test Core App');
  await fs.remove(docsDir);

  const regPath = path.join(CLI_ROOT, 'plantillas_registro.json');
  if (fs.existsSync(regPath)) {
    const reg = await fs.readJson(regPath);
    if (reg.plantillas && reg.plantillas['app-test-core']) {
      delete reg.plantillas['app-test-core'];
      await fs.writeJson(regPath, reg, { spaces: 2 });
    }
  }

  await fs.ensureDir(TEST_CLIENT_DIR);
  await fs.ensureDir(path.join(TEST_CLIENT_DIR, 'src'));

  // Escribir manifiestos de cliente origen
  await fs.writeJson(path.join(TEST_CLIENT_DIR, '.prototipe.json'), {
    schemaVersion: '1.0.0',
    clientId: 'test-promotion-client',
    coreType: 'app-old-core',
    coreVersion: '0.9.5',
    features: ['pos', 'cart']
  }, { spaces: 2 });

  await fs.writeJson(path.join(TEST_CLIENT_DIR, 'prototipe.lock.json'), {
    schemaVersion: '1.0.0',
    coreType: 'app-old-core',
    coreVersion: '0.9.5',
    features: {
      pos: { version: '1.2.0' },
      cart: { version: '1.1.0' }
    }
  }, { spaces: 2 });

  await fs.writeJson(path.join(TEST_CLIENT_DIR, 'package.json'), {
    name: 'test-promotion-client',
    version: '0.9.5',
    scripts: {
      build: "vite build"
    },
    dependencies: {
      react: '^18.0.0',
      vite: '^5.0.0'
    }
  }, { spaces: 2 });

  // Escribir archivos de código con namespaces de cliente a reescribir
  await fs.outputFile(path.join(TEST_CLIENT_DIR, 'src', 'main.jsx'), `
    import React from 'react';
    console.log("Welcome to test-promotion-client application!");
  `);

  await fs.outputFile(path.join(TEST_CLIENT_DIR, 'src', 'vendedores.jsx'), `
    // Código específico de vendedores que debe copiarse
    const role = "vendedor";
  `);

  // Crear archivo index.html para la compilación de Vite
  await fs.outputFile(path.join(TEST_CLIENT_DIR, 'index.html'), `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Test Core App</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body>
    </html>
  `);

  // Crear archivo briefing.md
  await fs.outputFile(path.join(TEST_CLIENT_DIR, 'briefing.md'), `
    # Briefing de test
    Este es el briefing para la aplicación de test.
  `);

  // Crear reglas de archivo temporales en knowledge/core-promotion/file-policy.json
  const policyDir = path.join(CLI_ROOT, 'knowledge', 'core-promotion');
  await fs.ensureDir(policyDir);
  const policyPath = path.join(policyDir, 'file-policy.json');
  
  // Siempre sobreescribir para pruebas limpias
  await fs.writeJson(policyPath, {
    defaultAction: 'deny',
    policies: {
      'src/main.jsx': { action: 'copy' },
      'src/vendedores.jsx': { action: 'copy' },
      'index.html': { action: 'copy' },
      'briefing.md': { action: 'copy' },
      '.prototipe.json': { action: 'regenerate', strategy: 'none' },
      'prototipe.lock.json': { action: 'regenerate', strategy: 'none' },
      'package.json': { action: 'regenerate', strategy: 'none' }
    }
  }, { spaces: 2 });

  // Crear seed-rules.json si no existen
  const seedRulesPath = path.join(policyDir, 'seed-rules.json');
  if (!fs.existsSync(seedRulesPath)) {
    await fs.writeJson(seedRulesPath, {
      rules: [
        { collectionName: 'users', action: 'anonymize', piiFields: ['email', 'password'] },
        { collectionName: 'orders', action: 'exclude' }
      ]
    }, { spaces: 2 });
  }
}

async function runTests() {
  console.log('🧪 Iniciando Suite de 45 Puntos de Integración del Pipeline de Promoción y Migración...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      passed++;
      console.log(`  🟢 [PASS] ${message}`);
    } else {
      failed++;
      console.error(`  🔴 [FAIL] ${message}`);
    }
  };

  try {
    // Inicializar entorno
    await setupTestEnvironment();

    // ────────────────────────────────────────────────────────────────
    // 1. LOCKS FÍSICOS Y LÓGICOS
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo 1: Gobernanza de Concurrencia (Locks) ---');
    
    // Adquirir lock primario
    let firstAcquisitionOk = false;
    try {
      CorePromotionService.acquireLock('app-test-core', 'promo-test-001');
      firstAcquisitionOk = true;
    } catch (e) {
      console.error(e);
    }
    assert(firstAcquisitionOk === true, 'Debe adquirir un lock primario libre.');

    // Intentar adquirir lock colisionado con un promoId diferente
    let collisionDetected = false;
    try {
      CorePromotionService.acquireLock('app-test-core', 'promo-test-002');
    } catch (err) {
      collisionDetected = err.message.includes('Colisión de Lock');
    }
    assert(collisionDetected === true, 'Debe arrojar excepción de colisión al intentar tomar un lock ocupado por otro ID.');

    // Liberación de lock
    CorePromotionService.releaseLock('app-test-core');
    
    let acquireAfterReleaseOk = false;
    try {
      CorePromotionService.acquireLock('app-test-core', 'promo-test-002');
      acquireAfterReleaseOk = true;
    } catch (e) {
      console.error(e);
    }
    assert(acquireAfterReleaseOk === true, 'Debe liberar el lock correctamente permitiendo que otro lo tome.');
    CorePromotionService.releaseLock('app-test-core');

    // ────────────────────────────────────────────────────────────────
    // 2. BLUEPRINTS E IDEMPOTENCIA
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo 2: Cargas, Validaciones y Sanitización ---');

    // Clave de idempotencia única para este test
    const idemKey = 'idem-key-' + Date.now();

    // Crear blueprint inicial de promoción válido contra el schema
    const blueprint = {
      schemaVersion: '1.0.0',
      promotionId: 'promo-test-001',
      sourceClientId: 'test-promotion-client',
      sourceCoreType: 'app-old-core',
      sourceCoreVersion: '0.9.5',
      targetCoreKey: 'app-test-core',
      targetCoreName: 'Test Core App',
      nicho: 'retail_clothing',
      status: 'PENDING_PREFLIGHT',
      stagingPath: TEST_STAGING_DIR.replace(/\\/g, '/'),
      idempotency: {
        preflight: idemKey,
        execute: null,
        publish: null,
        activate: null,
        migrationApply: null
      },
      features: {
        required: [
          { featureId: 'pos', version: '1.2.0', registryStatus: 'REGISTERED' },
          { featureId: 'cart', version: '1.1.0', registryStatus: 'REGISTERED' }
        ],
        optional: [],
        unregistered: []
      },
      diagnostics: {
        piiScan: { status: 'NOT_RUN', startedAt: null, completedAt: null, errorCode: null },
        secretsScan: { status: 'NOT_RUN', startedAt: null, completedAt: null, errorCode: null },
        architecture: { status: 'NOT_RUN', startedAt: null, completedAt: null, errorCode: null },
        dependencies: { status: 'NOT_RUN', startedAt: null, completedAt: null, errorCode: null },
        build: { status: 'NOT_RUN', startedAt: null, completedAt: null, errorCode: null },
        smokeTest: { status: 'NOT_RUN', startedAt: null, completedAt: null, errorCode: null },
        templateParity: { status: 'NOT_RUN', startedAt: null, completedAt: null, errorCode: null },
        errors: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    PromotionBlueprintBuilder.safeWriteJson(TEST_BP_FILE, blueprint);
    const loadedBP = PromotionBlueprintBuilder.loadPromotionBlueprint(TEST_BP_FILE);
    assert(loadedBP.promotionId === 'promo-test-001', 'Debe escribir y cargar el blueprint JSON de forma segura.');

    // Preflight idempotency
    const idemCheck = CorePromotionService.checkIdempotency(idemKey, { clientId: 'test-promotion-client' });
    assert(idemCheck === null, 'Debe retornar null si la clave no tiene respuesta guardada.');

    CorePromotionService.saveIdempotency(idemKey, { clientId: 'test-promotion-client' }, { success: true });
    const idemCheckCached = CorePromotionService.checkIdempotency(idemKey, { clientId: 'test-promotion-client' });
    assert(idemCheckCached.success === true, 'Debe cachear y retornar la respuesta idempotente.');

    // ────────────────────────────────────────────────────────────────
    // 3. EXTRACCIÓN Y SANITIZACIÓN A STAGING
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo 3: Staging y Validadores de Seguridad ---');

    const filePolicyPath = path.join(CLI_ROOT, 'knowledge', 'core-promotion', 'file-policy.json');
    const stagingResult = await CoreCandidateBuilder.buildStaging(loadedBP, TEST_CLIENT_DIR, TEST_STAGING_DIR, filePolicyPath);
    
    assert(fs.existsSync(path.join(TEST_STAGING_DIR, 'src', 'main.jsx')), 'Debe copiar los archivos válidos a Staging.');
    assert(fs.existsSync(path.join(TEST_STAGING_DIR, 'src', 'vendedores.jsx')), 'Debe copiar archivos adicionales de código.');

    // Validar Secrets Scan (Sin secretos)
    let secretsScanPassed = false;
    try {
      await CorePromotionValidator.scanSecrets(TEST_STAGING_DIR);
      secretsScanPassed = true;
    } catch (e) {
      secretsScanPassed = false;
    }
    assert(secretsScanPassed === true, 'El escaneo de secretos debe pasar en staging limpio.');

    // Inyectar un secreto en main.jsx y verificar bloqueo
    // Generar un token con la longitud de regex exacta (AIzaSy + 35 caracteres)
    const fakeSecret = "AIzaSy" + "A".repeat(35);
    await fs.outputFile(path.join(TEST_STAGING_DIR, 'src', 'main.jsx'), `const API_KEY = "${fakeSecret}";`);
    try {
      await CorePromotionValidator.scanSecrets(TEST_STAGING_DIR);
      assert(false, 'Debe fallar si detecta una clave de API de Firebase.');
    } catch (e) {
      assert(e.message.includes('API Key de Firebase'), 'Debe arrojar excepción de API Keys confidenciales.');
    }

    // Inyectar PII en briefing.md (ya que scanPII sólo busca en .md y .json) y verificar
    await fs.outputFile(path.join(TEST_STAGING_DIR, 'briefing.md'), 'El correo de contacto es test@example.com y celular +573001234567.');
    const hasPII = await CorePromotionValidator.scanPII(TEST_STAGING_DIR);
    assert(hasPII === true, 'Debe detectar PII cuando hay datos personales en el código.');

    // ESC-021: Compilación real del candidato en Staging
    console.log('\n--- ESC-021: Smoke Test de Compilación de Candidato Real ---');
    // Limpiar staging para el build
    await fs.outputFile(path.join(TEST_STAGING_DIR, 'src', 'main.jsx'), 'console.log("Welcome clean!");');
    await fs.outputFile(path.join(TEST_STAGING_DIR, 'briefing.md'), '# Briefing de test limpio');
    let buildStagingOk = false;
    try {
      await CorePromotionValidator.runBuildAndSmokeTest(TEST_STAGING_DIR);
      buildStagingOk = true;
    } catch (e) {
      console.error('❌ Error de compilación en staging:', e.message);
    }
    assert(buildStagingOk === true, 'ESC-021: El core candidato producido debe compilar en staging y generar dist/index.html.');

    // ────────────────────────────────────────────────────────────────
    // 4. DOCUMENTOS DE GOBERNANZA
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo 4: Gobernanza Temática y Briefing ---');

    const createdDocs = BriefingDocumentMapper.generateCoreGovernance(loadedBP);
    assert(createdDocs.length === 12, 'Debe generar exactamente 12 documentos de gobernanza Markdown.');
    assert(fs.existsSync(createdDocs[0]), 'Los documentos deben guardarse en la carpeta de documentación oficial.');

    // ────────────────────────────────────────────────────────────────
    // 5. PUBLICACIÓN Y ACTIVACIÓN
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo 5: Transaccionalidad de Publicación y Activación ---');

    // Restaurar staging limpio
    await fs.outputFile(path.join(TEST_STAGING_DIR, 'src', 'main.jsx'), 'console.log("Welcome clean!");');
    await fs.outputFile(path.join(TEST_STAGING_DIR, 'briefing.md'), '# Briefing de test limpio');

    // Publicación
    const templatesDir = path.join(CLI_ROOT, 'templates', 'template-app-test-core');
    const coreTargetDir = path.join(CLI_ROOT, '..', 'Plantillas Core', 'App Test Core App');
    await fs.remove(coreTargetDir);

    loadedBP.status = 'CANDIDATE_READY';
    await CorePromotionPublisher.publish(loadedBP, TEST_BP_FILE);
    
    assert(loadedBP.status === 'PUBLISHED_INACTIVE', 'Blueprint debe transicionar al estado PUBLISHED_INACTIVE.');
    assert(fs.existsSync(coreTargetDir), 'Debe mover físicamente la carpeta de staging a Plantillas Core (fuente maestra).');
    
    const registro = await fs.readJson(path.join(CLI_ROOT, 'plantillas_registro.json'));
    assert(registro.plantillas['app-test-core'] !== undefined, 'Debe registrar la plantilla en plantillas_registro.json.');
    assert(registro.plantillas['app-test-core'].activo === false, 'La plantilla publicada debe estar inactiva inicialmente.');

    // Activación
    await fs.remove(templatesDir);

    await CorePromotionPublisher.activate(loadedBP, TEST_BP_FILE);
    
    assert(loadedBP.status === 'ACTIVE', 'Blueprint debe transicionar al estado ACTIVE.');
    assert(fs.existsSync(templatesDir), 'Debe crear el espejo de templates/template-[clave].');
    assert(fs.existsSync(coreTargetDir), 'Debe conservar la carpeta fuente en Plantillas Core/App [CoreName].');
    
    const registroActive = await fs.readJson(path.join(CLI_ROOT, 'plantillas_registro.json'));
    assert(registroActive.plantillas['app-test-core'].activo === true, 'La plantilla activada debe marcarse como activo: true.');
    assert(registroActive.plantillas['app-test-core'].version === '1.0.0', 'El core debe inicializarse en la versión 1.0.0.');

    // ────────────────────────────────────────────────────────────────
    // 6. ROLLBACK COMPENSATORIO
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo 6: Rollback y Journal Transaccional ---');

    // Rollback de Activación
    const actJournalFile = path.join(CLI_ROOT, 'journals', 'core-activations', 'act-promo-test-001.json');
    await CorePromotionPublisher.rollbackActivate(loadedBP, TEST_BP_FILE, actJournalFile);
    assert(loadedBP.status === 'PUBLISHED_INACTIVE', 'Rollback de activación debe revertir al estado PUBLISHED_INACTIVE.');
    assert(fs.existsSync(coreTargetDir), 'Debe conservar la carpeta en Plantillas Core.');
    assert(!fs.existsSync(templatesDir), 'Debe remover el espejo parcial de templates.');

    const registroRollbackAct = await fs.readJson(path.join(CLI_ROOT, 'plantillas_registro.json'));
    assert(registroRollbackAct.plantillas['app-test-core'].activo === false, 'Debe desmarcar como activo en el registro.');
    assert(registroRollbackAct.plantillas['app-test-core'].version === '0.0.1', 'Debe restaurar la versión inactiva.');

    // Para poder probar el rollback de publicación, el blueprint debe estar en PUBLISHED_INACTIVE
    // Rollback de Publicación
    const promoJournalFile = path.join(CLI_ROOT, 'journals', 'core-promotions', 'promo-promo-test-001.json');
    await CorePromotionPublisher.rollbackPublish(loadedBP, TEST_BP_FILE, promoJournalFile);
    assert(loadedBP.status === 'ROLLED_BACK', 'Rollback de publicación debe revertir al estado ROLLED_BACK.');
    assert(!fs.existsSync(coreTargetDir), 'Debe remover la carpeta en Plantillas Core (fuente maestra).');

    const registroRollbackPub = await fs.readJson(path.join(CLI_ROOT, 'plantillas_registro.json'));
    assert(registroRollbackPub.plantillas['app-test-core'] === undefined, 'Debe remover la plantilla del registro JSON.');

    // ────────────────────────────────────────────────────────────────
    // 7. MIGRACIÓN DE LINAJE Y POST-VALIDACIÓN DRIFT
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo 7: Migración de Linaje y Drift ---');

    // Volver a publicar/activar para simular core destino válido
    loadedBP.status = 'CANDIDATE_READY';
    await CorePromotionPublisher.publish(loadedBP, TEST_BP_FILE);
    await CorePromotionPublisher.activate(loadedBP, TEST_BP_FILE);

    const migrationBlueprint = {
      schemaVersion: '1.0.0',
      migrationId: 'mig-test-001',
      promotionId: 'promo-test-001',
      status: 'PENDING_PREFLIGHT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      spec: {
        clientId: 'test-promotion-client',
        previousCoreType: 'app-old-core',
        newCoreType: 'app-test-core',
        previousCoreVersion: '0.9.5',
        newCoreVersion: '1.0.0',
        hashAlgorithm: 'sha256',
        previousFilesHashes: {},
        previousFeatures: ['pos', 'cart']
      },
      results: {
        backup: null,
        write: null,
        postValidation: null,
        rollback: null,
        errors: []
      }
    };

    PromotionBlueprintBuilder.safeWriteJson(TEST_MIG_BP_FILE, migrationBlueprint);

    // Alinear archivos del cliente origen para evitar drifts simulando una sincronización exitosa
    await fs.outputFile(path.join(TEST_CLIENT_DIR, 'src', 'main.jsx'), 'console.log("Welcome clean!");');
    await fs.outputFile(path.join(TEST_CLIENT_DIR, 'briefing.md'), '# Briefing de test limpio');

    // Ejecutar migración de linaje
    await ClientLineageMigrator.migrate(migrationBlueprint, TEST_MIG_BP_FILE, TEST_CLIENT_DIR);

    assert(migrationBlueprint.status === 'COMPLETED', 'La migración debe finalizar en estado COMPLETED.');
    
    const clientProto = await fs.readJson(path.join(TEST_CLIENT_DIR, '.prototipe.json'));
    assert(clientProto.coreType === 'app-test-core', 'Debe actualizar el coreType en .prototipe.json.');
    assert(clientProto.coreVersion === '1.0.0', 'Debe actualizar la versión del core a 1.0.0.');

    // ────────────────────────────────────────────────────────────────
    // 8. ROLLBACK MIGRACIÓN Y CONSISTENCIA SHA-256
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo 8: Rollback de Migración y Consistencia ---');

    const migrationJournalFile = path.join(CLI_ROOT, 'journals', 'lineage-migrations', 'mig-mig-test-001.json');
    await ClientLineageMigrator.rollback(migrationBlueprint, TEST_MIG_BP_FILE, migrationJournalFile, TEST_CLIENT_DIR);

    assert(migrationBlueprint.status === 'ROLLED_BACK', 'Rollback de migración debe terminar en ROLLED_BACK.');

    const revertedProto = await fs.readJson(path.join(TEST_CLIENT_DIR, '.prototipe.json'));
    assert(revertedProto.coreType === 'app-old-core', 'Debe restaurar el coreType original del cliente.');
    assert(revertedProto.coreVersion === '0.9.5', 'Debe restaurar la versión original del cliente.');
    assert(migrationBlueprint.results.rollback.hashesMatch === true, 'Los hashes SHA-256 deben coincidir al 100% post-rollback.');

    // Limpieza final
    await fs.remove(TEST_CLIENT_DIR);
    await fs.remove(TEST_STAGING_DIR);
    await fs.remove(TEST_BP_FILE);
    await fs.remove(TEST_MIG_BP_FILE);
    await fs.remove(templatesDir);
    await fs.remove(coreTargetDir);

    const docsDir = path.join(CLI_ROOT, '..', 'Documentacion PROTOTIPE', '09_Modulos_Completos', 'Documentacion App Test Core App');
    await fs.remove(docsDir);

    // Remover del registro oficial
    const finalReg = await fs.readJson(path.join(CLI_ROOT, 'plantillas_registro.json'));
    delete finalReg.plantillas['app-test-core'];
    await fs.writeJson(path.join(CLI_ROOT, 'plantillas_registro.json'), finalReg, { spaces: 2 });

  } catch (err) {
    console.error('\n❌ ERROR INESPERADO DURANTE LA SUITE DE PRUEBAS:', err.stack);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`📊  RESULTADO FINAL DE INTEGRACIÓN:`);
  console.log(`    🟢 Pasadas:   ${passed}`);
  console.log(`    🔴 Fallidas:  ${failed}`);
  console.log('======================================================\n');

  const scratchDir = path.join(CLI_ROOT, 'scratch');
  fs.ensureDirSync(scratchDir);
  fs.writeJsonSync(path.join(scratchDir, 'integration-results.json'), { passed, failed, total: passed + failed }, { spaces: 2 });

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
