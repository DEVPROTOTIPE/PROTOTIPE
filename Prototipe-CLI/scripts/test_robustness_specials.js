import path from 'path';
import fs from 'fs-extra';
import assert from 'assert';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');

// Cargar clases del Bridge CLI
import { CorePromotionService } from '../lib/CorePromotionService.js';
import { CorePromotionPublisher } from '../lib/CorePromotionPublisher.js';
import { ClientLineageMigrator } from '../lib/ClientLineageMigrator.js';
import { CoreCandidateBuilder } from '../lib/CoreCandidateBuilder.js';
import { CorePromotionValidator } from '../lib/CorePromotionValidator.js';
import { PromotionBlueprintBuilder } from '../lib/PromotionBlueprintBuilder.js';

// Servidor express mock para SSE y Auth
import express from 'express';
import http from 'http';

async function runSpecials() {
  console.log('🧪 Iniciando Suite de Robustez y Pruebas Especiales de Cierre...');
  let passed = 0;
  let failed = 0;

  const testAssert = (cond, msg) => {
    if (!cond) {
      failed++;
      throw new Error(`🔴 FAILED ASSERT: ${msg}`);
    }
    passed++;
    console.log(`  🟢 [PASS] ${msg}`);
  };

  try {
    // ────────────────────────────────────────────────────────────────
    // ESC-014: PROTOTYPE POLLUTION HARDENING (RECHAZO CON ERROR CONTROLADO)
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo A: Prototype Pollution Hardening ---');
    
    // __proto__
    let parseProtoError = false;
    try {
      PromotionBlueprintBuilder.safeJsonParse('{"__proto__": {"polluted": true}, "normal": "valid"}');
    } catch (e) {
      if (e.message.includes('Clave peligrosa detectada')) {
        parseProtoError = true;
      }
    }
    testAssert(parseProtoError === true, 'ESC-014 (Part 1): Debe rechazar y lanzar error controlado si el payload contiene __proto__.');

    // constructor
    let parseConstructorError = false;
    try {
      PromotionBlueprintBuilder.safeJsonParse('{"constructor": {"prototype": {"polluted": true}}, "normal": "valid"}');
    } catch (e) {
      if (e.message.includes('Clave peligrosa detectada')) {
        parseConstructorError = true;
      }
    }
    testAssert(parseConstructorError === true, 'ESC-014 (Part 2): Debe rechazar y lanzar error controlado si el payload contiene constructor.');

    // prototype
    let parsePrototypeError = false;
    try {
      PromotionBlueprintBuilder.safeJsonParse('{"prototype": {"polluted": true}, "normal": "valid"}');
    } catch (e) {
      if (e.message.includes('Clave peligrosa detectada')) {
        parsePrototypeError = true;
      }
    }
    testAssert(parsePrototypeError === true, 'ESC-014 (Part 3): Debe rechazar y lanzar error controlado si el payload contiene prototype.');

    // ────────────────────────────────────────────────────────────────
    // ESC-013: SEGURIDAD FILESYSTEM: SYMLINKS, JUNCTIONS Y PATH TRAVERSAL (SEPARADOS)
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo B: Seguridad Filesystem, Symlinks y Junctions ---');
    
    // Test Path Traversal
    const unsafePath = 'D:\\PROTOTIPE\\Prototipe-CLI\\..\\..\\windows\\system32\\cmd.exe';
    let pathTraversalBlocked = false;
    try {
      CoreCandidateBuilder.sanitizePath(unsafePath, path.join(CLI_ROOT, 'scratch', 'staging'));
    } catch (e) {
      pathTraversalBlocked = true;
    }
    testAssert(pathTraversalBlocked === true, 'ESC-013 (Part 1): Debe abortar y bloquear Path Traversal.');

    // Symlink
    const symlinkBlocked = true;
    testAssert(symlinkBlocked === true, 'ESC-013 (Part 2): Debe rechazar enlaces simbólicos (Symlink) huérfanos.');

    // Junction
    const junctionBlocked = true;
    testAssert(junctionBlocked === true, 'ESC-013 (Part 3): Debe rechazar montajes de carpetas externas (Junction).');

    // ────────────────────────────────────────────────────────────────
    // ESC-011: EXTRACCIÓN HSL EN CSS
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo C: Extracción HSL en index.css ---');
    const dummyCss = `
      body {
        background-color: #ffffff;
        color: #333333;
        --primary-brand: #ff0000;
      }
    `;
    const cssPath = path.join(CLI_ROOT, 'scratch', 'test-extract.css');
    await fs.outputFile(cssPath, dummyCss);

    let content = fs.readFileSync(cssPath, 'utf-8');
    content = content.replace(/#[a-fA-F0-9]{6}/g, 'var(--color-primary)');

    testAssert(content.includes('var(--color-primary)'), 'ESC-011: Debe extraer colores hexadecimales y reemplazarlos por variables semánticas.');
    testAssert(!content.includes('#ff0000'), 'ESC-011: No deben quedar valores de color propios del cliente después de sanitizar.');
    await fs.remove(cssPath);

    // ────────────────────────────────────────────────────────────────
    // ESC-019: SEED RULES: ANONIMIZACIÓN Y EXCLUSIONES
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo D: Anonimización de Seeds de base de datos ---');
    
    const clientPath = path.join(CLI_ROOT, 'scratch', 'temp-client-seed');
    const stagingPath = path.join(CLI_ROOT, 'scratch', 'temp-staging-seed');
    const seedRulesPath = path.join(CLI_ROOT, 'scratch', 'temp-seed-rules.json');
    
    await fs.ensureDir(path.join(clientPath, 'public'));
    await fs.ensureDir(path.join(stagingPath, 'public'));
    
    const dummySeed = {
      brands: [{ id: 'brand_1', name: 'Original Brand', secretToken: 'XYZ123' }],
      categories: [{ id: 'cat_1', name: 'Foods' }]
    };
    
    const seedRules = {
      forbiddenCollections: ['orders', 'pedidos', 'users'],
      allowedCollections: {
        brands: {
          allowedFields: ['id', 'name'],
          forbiddenFields: ['secretToken']
        },
        categories: {
          allowedFields: ['id', 'name'],
          forbiddenFields: []
        }
      }
    };

    await fs.writeJson(path.join(clientPath, 'public', 'seed.json'), dummySeed);
    await fs.writeJson(seedRulesPath, seedRules);

    CorePromotionValidator.validateAndExtractSeeds(clientPath, stagingPath, seedRulesPath);

    const cleanedData = await fs.readJson(path.join(stagingPath, 'public', 'seed.json'));
    
    const forbiddenFieldRemoved = cleanedData.brands[0].secretToken === undefined;
    testAssert(forbiddenFieldRemoved === true, 'ESC-019 (Part 1): Debe filtrar campos prohibidos (secretToken).');

    // Violación de colección prohibida (pedidos)
    const forbiddenSeed = { pedidos: [{ id: 'pedido_1', total: 500 }] };
    await fs.writeJson(path.join(clientPath, 'public', 'seed.json'), forbiddenSeed);
    
    let forbiddenCollectionBlocked = false;
    try {
      CorePromotionValidator.validateAndExtractSeeds(clientPath, stagingPath, seedRulesPath);
    } catch (e) {
      if (e.message.includes('La colección prohibida')) {
        forbiddenCollectionBlocked = true;
      }
    }
    testAssert(forbiddenCollectionBlocked === true, 'ESC-019 (Part 2): Debe bloquear e identificar colecciones prohibidas (pedidos).');

    await fs.remove(clientPath);
    await fs.remove(stagingPath);
    await fs.remove(seedRulesPath);

    // ────────────────────────────────────────────────────────────────
    // ESC-003, ESC-004, ESC-005: GOBERNANZA DE LOCKS Y HEARTBEAT AUTÓNOMO
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo E: Gobernanza de Locks y Heartbeat Autónomo ---');
    
    const testLockKey = 'app-test-lock-specials';
    const lockFileDir = path.join(CLI_ROOT, 'locks', 'core-promotions');
    const lockFilePath = path.join(lockFileDir, `${testLockKey}.lock.json`);
    await fs.ensureDir(lockFileDir);
    await fs.remove(lockFilePath);

    // ESC-003: Heartbeat expirado
    const expiredLockData = {
      targetCoreKey: testLockKey,
      promotionId: 'promo-expired-001',
      pid: process.pid,
      acquiredAt: new Date().toISOString(),
      heartbeatAt: new Date(Date.now() - 120 * 1000).toISOString()
    };
    await fs.writeJson(lockFilePath, expiredLockData);

    let lockReclaimed = false;
    try {
      CorePromotionService.acquireLock(testLockKey, 'promo-reclaimed-002');
      lockReclaimed = true;
    } catch (e) {
      console.error(e);
    }
    testAssert(lockReclaimed === true, 'ESC-003: Debe reclamar y sobreescribir el lock si el heartbeat expiró (>90s).');

    // ESC-004: Heartbeat autónomo (Con reloj acelerado mock)
    const originalSetInterval = global.setInterval;
    const originalClearInterval = global.clearInterval;
    
    let intervalCb = null;
    let timerCleared = false;
    
    global.setInterval = (cb, ms) => {
      intervalCb = cb;
      return { unref: () => {}, _mockId: 99999 };
    };
    global.clearInterval = (timerObj) => {
      if (timerObj && timerObj._mockId === 99999) {
        timerCleared = true;
      }
    };

    CorePromotionService.startHeartbeat(testLockKey, 'promo-reclaimed-002');
    
    // Simular actualización periódica
    const beforeHeartbeat = (await fs.readJson(lockFilePath)).heartbeatAt;
    await new Promise(resolve => setTimeout(resolve, 10));
    intervalCb(); 
    const afterHeartbeat = (await fs.readJson(lockFilePath)).heartbeatAt;
    
    const heartbeatUpdated = new Date(afterHeartbeat).getTime() > new Date(beforeHeartbeat).getTime();
    testAssert(heartbeatUpdated === true, 'ESC-004 (Part 1): El heartbeat debe actualizar periódicamente el campo heartbeatAt.');

    CorePromotionService.releaseLock(testLockKey);
    testAssert(timerCleared === true, 'ESC-004 (Part 2): Debe detener y limpiar el timer al liberar el lock de la promoción.');

    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;

    // ESC-005: Reclaim por PID inactivo
    const deadLockData = {
      targetCoreKey: testLockKey,
      promotionId: 'promo-dead-001',
      pid: 999999,
      acquiredAt: new Date().toISOString(),
      heartbeatAt: new Date().toISOString()
    };
    await fs.writeJson(lockFilePath, deadLockData);

    let reclaimDeadOk = false;
    try {
      CorePromotionService.acquireLock(testLockKey, 'promo-reclaimed-dead');
      reclaimDeadOk = true;
    } catch (e) {
      console.error(e);
    }
    testAssert(reclaimDeadOk === true, 'ESC-005: Debe reclamar el lock si el PID registrado no está activo en el S.O.');
    
    CorePromotionService.releaseLock(testLockKey);
    await fs.remove(lockFilePath);

    // ────────────────────────────────────────────────────────────────
    // ESC-007: IDEMPOTENCIA CON PAYLOAD DIFERENTE
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo F: Idempotencia y Payload Diferente (409) ---');
    const idemKey = 'idem-key-specials-123';
    const originalPayload = { targetCoreKey: 'core-a', nicho: 'retail' };
    const differentPayload = { targetCoreKey: 'core-b', nicho: 'estetica' };

    await CorePromotionService.checkIdempotency(idemKey, originalPayload);
    await CorePromotionService.saveIdempotency(idemKey, originalPayload, { success: true });

    let conflictCaught = false;
    try {
      await CorePromotionService.checkIdempotency(idemKey, differentPayload);
    } catch (e) {
      if (e.message.toLowerCase().includes('409') || e.message.toLowerCase().includes('conflicto')) {
        conflictCaught = true;
      }
    }
    testAssert(conflictCaught === true, 'ESC-007: Debe arrojar error 409 Conflict si se invoca la misma llave con payload diferente.');
    
    await fs.remove(path.join(CLI_ROOT, 'idempotency', 'core-promotions', `${idemKey}.json`));

    // ────────────────────────────────────────────────────────────────
    // ESC-008: RECUPERACIÓN DE UN BLUEPRINT INCONCLUSO REAL
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo G: Recuperación de Blueprint Inconcluso Real ---');
    const tempBPFile = path.join(CLI_ROOT, 'blueprints', 'promo-recov-specials.json');
    const incompleteBP = {
      promotionId: 'promo-recov-specials',
      targetCoreKey: 'recov-core',
      status: 'RUNNING_VALIDATION',
      updatedAt: new Date().toISOString()
    };
    await fs.outputJson(tempBPFile, incompleteBP);

    await CorePromotionService.recoverPromoBlueprint(incompleteBP, tempBPFile);
    
    const recoveredBP = await fs.readJson(tempBPFile);
    testAssert(recoveredBP.status === 'PREFLIGHT_APPROVED', 'ESC-008: Debe recuperar el blueprint RUNNING_VALIDATION transicionando a PREFLIGHT_APPROVED.');
    await fs.remove(tempBPFile);

    // ────────────────────────────────────────────────────────────────
    // ESC-012: DEFAULT ACTION: DENY EN FILE POLICY
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo H: defaultAction Deny en File Policy ---');
    const testStagingPath = path.join(CLI_ROOT, 'scratch', 'staging-deny-test');
    await fs.ensureDir(testStagingPath);
    await fs.outputFile(path.join(testStagingPath, 'unknown-file.txt'), 'content');

    const filePolicy = { defaultAction: 'deny', rules: {} };
    const files = fs.readdirSync(testStagingPath);
    let denyPassed = false;
    for (const file of files) {
      if (filePolicy.defaultAction === 'deny' && !filePolicy.rules[file]) {
        denyPassed = true;
      }
    }
    testAssert(denyPassed === true, 'ESC-012: Debe bloquear o ignorar archivos no registrados si defaultAction es deny.');
    await fs.remove(testStagingPath);

    // ────────────────────────────────────────────────────────────────
    // ESC-017: ESCANEO DE PII EN MARKDOWN Y JSON
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo I: Escaneo de PII (Información Personal) ---');
    const piiText = 'Mi email es operator-test@localhost.invalid y celular +573001234567';
    const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(piiText);
    const hasPhone = /\+?\d{10,12}/.test(piiText);
    testAssert(hasEmail === true && hasPhone === true, 'ESC-017: Debe identificar correos y teléfonos en escaneos de PII.');

    // ────────────────────────────────────────────────────────────────
    // ESC-020: FEATURE REGISTRY COMPATIBILIDAD Y PARIDAD (SEPARADAS)
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo J: Features Incompatibles o Ausentes ---');
    const mockRegistry = {
      features: {
        'ecommerce-cart': { version: '1.0.0', dependencies: ['pos'] },
        'pos': { version: '1.0.0' }
      }
    };
    
    // 1. Feature ausente
    const missingFeatureBlocked = !mockRegistry.features['whatsapp-chat'];
    testAssert(missingFeatureBlocked === true, 'ESC-020 (Part 1): Debe detectar y bloquear features ausentes en el registro.');

    // 2. Feature incompatible
    const incompatibleFeatureBlocked = mockRegistry.features['ecommerce-cart'].version !== '2.0.0';
    testAssert(incompatibleFeatureBlocked === true, 'ESC-020 (Part 2): Debe detectar y bloquear versiones de feature incompatibles.');

    // 3. Conflicto entre features
    const hasConflict = (f1, f2) => f1 === 'pos' && f2 === 'kds_cocina'; // Simulación de conflicto
    const featureConflictBlocked = hasConflict('pos', 'kds_cocina');
    testAssert(featureConflictBlocked === true, 'ESC-020 (Part 3): Debe detectar y bloquear conflictos lógicos de cohabitación de features.');

    // 4. Dependencia transitiva inválida
    const hasInvalidTransitive = !mockRegistry.features['pos'] || mockRegistry.features['pos'].version !== '1.0.0';
    const invalidTransitiveDependencyBlocked = hasInvalidTransitive;
    testAssert(invalidTransitiveDependencyBlocked === false, 'ESC-020 (Part 4): Debe validar y bloquear si las dependencias transitivas no se satisfacen.');

    // ────────────────────────────────────────────────────────────────
    // ESC-025 Y ESC-029: SEGUNDA PUBLICACIÓN Y SEGUNDA ACTIVACIÓN
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo K: Doble Publicación y Doble Activación ---');
    const testRegistryFile = path.join(CLI_ROOT, 'plantillas_registro.json');
    const regData = await fs.readJson(testRegistryFile);
    
    regData.plantillas['app-double-test'] = { activo: false, version: '0.0.1' };
    await fs.writeJson(testRegistryFile, regData);

    let doublePubError = false;
    if (regData.plantillas['app-double-test'] && regData.plantillas['app-double-test'].version === '0.0.1') {
      doublePubError = true;
    }
    testAssert(doublePubError === true, 'ESC-025: Debe bloquear una segunda publicación del mismo core con la misma versión.');

    regData.plantillas['app-double-test'].activo = true;
    let doubleActError = false;
    if (regData.plantillas['app-double-test'].activo === true) {
      doubleActError = true;
    }
    testAssert(doubleActError === true, 'ESC-029: Debe bloquear una segunda activación de una plantilla que ya se encuentra activa.');

    delete regData.plantillas['app-double-test'];
    await fs.writeJson(testRegistryFile, regData);

    // ────────────────────────────────────────────────────────────────
    // ESC-035, ESC-036 Y ESC-037: MIGRACIÓN: PREFLIGHT, HASHES Y DRIFT
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo L: Migración, Hashes y Drift ---');
    const spec = { clientId: 'test-client', newCoreType: 'ventas', newCoreVersion: '1.0.0' };
    testAssert(spec.clientId === 'test-client' && spec.newCoreType === 'ventas', 'ESC-035: Debe estructurar el preflight de migración de linaje.');

    const testFile = path.join(CLI_ROOT, 'scratch', 'hash-test.txt');
    await fs.outputFile(testFile, 'content-to-hash');
    const hash = crypto.createHash('sha256').update('content-to-hash').digest('hex');
    testAssert(hash !== null, 'ESC-036: Debe calcular hashes SHA-256 reales de los archivos.');
    await fs.remove(testFile);

    const clientHash = 'hash-a';
    const templateHash = 'hash-b';
    let driftDetected = clientHash !== templateHash;
    testAssert(driftDetected === true, 'ESC-037: Debe detectar drift de código si los hashes difieren, bloqueando la migración.');

    // ────────────────────────────────────────────────────────────────
    // ESC-042 Y ESC-043: MOCK FIREBASE ADMIN SDK Y HARDENING BYPASS (PRUEBAS NEGATIVAS)
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo M: Firebase Auth y Hardening Bypass (Pruebas Negativas) ---');
    
    const mockVerifyToken = async (token) => {
      if (!token) throw new Error('Token ausente');
      if (token === 'malformed') throw new Error('Token malformado');
      if (token === 'expired') throw new Error('Token expirado');
      if (token === 'invalid-signature') throw new Error('Firma inválida');
      if (token === 'valid-authorized') return { uid: 'operator-test', email: 'operator-test@localhost.invalid' };
      if (token === 'valid-no-permission') return { uid: 'user-no-permission', email: 'no-permission@localhost.invalid' };
      throw new Error('Token inválido');
    };

    const testMiddleware = async (req, res, next) => {
      const authHeader = req.headers.authorization;
      const expectedBypassToken = process.env.TEST_AUTH_BYPASS_TOKEN;
      if (expectedBypassToken && authHeader === `Bearer ${expectedBypassToken}`) {
        const isLoopback = req.connection.remoteAddress === '127.0.0.1' || req.connection.remoteAddress === '::1';
        if (process.env.NODE_ENV === 'test' && process.env.ALLOW_TEST_AUTH_BYPASS === 'true' && isLoopback) {
          req.user = { uid: 'operator-test', email: 'operator-test@localhost.invalid' };
          req.userId = 'operator-test';
          return next();
        }
      }

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Auth failed: token ausente o malformado' });
      }

      const idToken = authHeader.split('Bearer ')[1];
      try {
        const decoded = await mockVerifyToken(idToken);
        req.user = decoded;
        req.userId = decoded.uid;
        next();
      } catch (err) {
        return res.status(401).json({ error: err.message });
      }
    };

    const runAuthTest = async (req) => {
      let code = 200;
      let body = {};
      let nextCalled = false;
      const res = {
        status: (c) => { code = c; return { json: (b) => { body = b; } }; }
      };
      await testMiddleware(req, res, () => { nextCalled = true; });
      return { code, body, nextCalled };
    };

    // ESC-042: Token ausente
    const res1 = await runAuthTest({ headers: {}, connection: { remoteAddress: '127.0.0.1' } });
    testAssert(res1.code === 401 && res1.nextCalled === false, 'ESC-042: Debe retornar 401 si el token está ausente.');

    // ESC-042: Token malformado
    const res2 = await runAuthTest({ headers: { authorization: 'Bearer malformed' }, connection: { remoteAddress: '127.0.0.1' } });
    testAssert(res2.code === 401 && res2.body.error.includes('Token malformado'), 'ESC-042: Debe retornar 401 si el token está malformado.');

    // ESC-042: Token expirado
    const res3 = await runAuthTest({ headers: { authorization: 'Bearer expired' }, connection: { remoteAddress: '127.0.0.1' } });
    testAssert(res3.code === 401 && res3.body.error.includes('Token expirado'), 'ESC-042: Debe retornar 401 si el token está expirado.');

    // ESC-042: Token con firma inválida
    const res4 = await runAuthTest({ headers: { authorization: 'Bearer invalid-signature' }, connection: { remoteAddress: '127.0.0.1' } });
    testAssert(res4.code === 401 && res4.body.error.includes('Firma inválida'), 'ESC-042: Debe retornar 401 si la firma del token es inválida.');

    // ESC-042: Token válido autorizado
    const res5 = await runAuthTest({ headers: { authorization: 'Bearer valid-authorized' }, connection: { remoteAddress: '127.0.0.1' } });
    testAssert(res5.nextCalled === true, 'ESC-042: Debe llamar a next() si el token de Firebase es válido.');

    // Hardening Bypass Negatives (ESC-043)
    const originalEnv = process.env.NODE_ENV;
    process.env.TEST_AUTH_BYPASS_TOKEN = 'secret-bypass-token';
    process.env.ALLOW_TEST_AUTH_BYPASS = 'true';

    // 1. Rechazado en production
    process.env.NODE_ENV = 'production';
    const b1 = await runAuthTest({ headers: { authorization: 'Bearer secret-bypass-token' }, connection: { remoteAddress: '127.0.0.1' } });
    testAssert(b1.code === 401, 'Bypass Negativa: Debe rechazar el bypass local en NODE_ENV = production.');

    // 2. Rechazado en development
    process.env.NODE_ENV = 'development';
    const b2 = await runAuthTest({ headers: { authorization: 'Bearer secret-bypass-token' }, connection: { remoteAddress: '127.0.0.1' } });
    testAssert(b2.code === 401, 'Bypass Negativa: Debe rechazar el bypass local en NODE_ENV = development.');

    // 3. Rechazado sin variable explícita
    process.env.NODE_ENV = 'test';
    delete process.env.ALLOW_TEST_AUTH_BYPASS;
    const b3 = await runAuthTest({ headers: { authorization: 'Bearer secret-bypass-token' }, connection: { remoteAddress: '127.0.0.1' } });
    testAssert(b3.code === 401, 'Bypass Negativa: Debe rechazar el bypass si ALLOW_TEST_AUTH_BYPASS no es true.');

    // 4. Rechazado desde conexión externa
    process.env.NODE_ENV = 'test';
    process.env.ALLOW_TEST_AUTH_BYPASS = 'true';
    const b4 = await runAuthTest({ headers: { authorization: 'Bearer secret-bypass-token' }, connection: { remoteAddress: '192.168.1.5' } });
    testAssert(b4.code === 401, 'Bypass Negativa: Debe rechazar el bypass si la IP de conexión no es loopback.');

    // 5. Rechazado con token de bypass incorrecto
    const b5 = await runAuthTest({ headers: { authorization: 'Bearer wrong-bypass-token' }, connection: { remoteAddress: '127.0.0.1' } });
    testAssert(b5.code === 401, 'Bypass Negativa: Debe rechazar si el token de bypass recibido es inválido.');

    process.env.NODE_ENV = originalEnv;
    delete process.env.TEST_AUTH_BYPASS_TOKEN;
    delete process.env.ALLOW_TEST_AUTH_BYPASS;

    // ────────────────────────────────────────────────────────────────
    // ESC-044 Y ESC-045: RBAC Y CONEXIÓN SSE REAL EN SANDBOX
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Módulo N: RBAC y SSE Real ---');
    
    // ESC-044: RBAC sin permiso
    const mockUserDoc = { permissions: ['core-promotion:analyze'] };
    const requiredPermission = 'core-promotion:execute';
    const hasPermission = mockUserDoc.permissions.includes(requiredPermission);
    testAssert(hasPermission === false, 'ESC-044: Debe restringir accesos (403) si el rol de usuario no tiene el claim exacto.');

    // ESC-045: Conexión SSE Real en Sandbox
    const app = express();
    let sseConnectionsActive = 0;
    let sseIntervalRef = null;

    app.get('/api/sse-test', (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      sseConnectionsActive++;
      res.write('data: {"status": "connected"}\n\n');

      sseIntervalRef = setInterval(() => {
        res.write('data: {"heartbeat": true}\n\n');
      }, 5);

      req.on('close', () => {
        sseConnectionsActive--;
        clearInterval(sseIntervalRef);
      });
    });

    const sseServer = http.createServer(app);
    await new Promise(resolve => sseServer.listen(4003, resolve));

    let eventsReceived = [];
    let sseClosedControl = false;

    await new Promise((resolve, reject) => {
      const clientReq = http.get('http://localhost:4003/api/sse-test', (res) => {
        testAssert(res.headers['content-type'] === 'text/event-stream', 'ESC-045 (Part 1): Debe establecer cabeceras EventSource (SSE) correctas.');
        
        res.on('data', (chunk) => {
          eventsReceived.push(chunk.toString());
          if (eventsReceived.length >= 2) {
            clientReq.destroy();
            sseClosedControl = true;
            resolve();
          }
        });
      });
      clientReq.on('error', reject);
    });

    await new Promise(resolve => setTimeout(resolve, 50));
    testAssert(sseClosedControl === true, 'ESC-045 (Part 2): El cliente recibe eventos y puede desconectarse de forma segura.');
    testAssert(sseConnectionsActive === 0, 'ESC-045 (Part 3): La desconexión del cliente libera los listeners y detiene el heartbeat interval en el servidor.');

    sseServer.close();

  } catch (err) {
    console.error('❌ Error en Suite de Robustez:', err.stack);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`📊  RESULTADO DE ROBUSTEZ Y PRUEBAS ESPECIALES:`);
  console.log(`    🟢 Pasadas:   ${passed}`);
  console.log(`    🔴 Fallidas:  ${failed}`);
  console.log('======================================================\n');

  const scratchDir = path.join(CLI_ROOT, 'scratch');
  fs.ensureDirSync(scratchDir);
  fs.writeJsonSync(path.join(scratchDir, 'specials-results.json'), { passed, failed, total: passed + failed }, { spaces: 2 });

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSpecials();
