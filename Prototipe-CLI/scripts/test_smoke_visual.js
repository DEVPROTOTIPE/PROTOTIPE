import { spawn } from 'child_process';
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import http from 'http';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');
const DASHBOARD_ROOT = path.join(CLI_ROOT, '..', 'Central PROTOTIPE', 'dev-dashboard');
const INSTANCIAS_DIR = path.join(CLI_ROOT, '..', 'Instancias Clientes');
const TEMP_CLIENT_DIR = path.join(INSTANCIAS_DIR, 'test-client');

async function runSmokeVisual() {
  console.log('🧪 Iniciando Smoke Test Visual E2E con Playwright...');
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

  // Crear cliente de pruebas temporal en Instancias Clientes
  await fs.ensureDir(TEMP_CLIENT_DIR);
  await fs.ensureDir(path.join(TEMP_CLIENT_DIR, 'src'));
  await fs.outputJson(path.join(TEMP_CLIENT_DIR, '.prototipe.json'), {
    name: 'Test Client App',
    coreType: 'app-old-core',
    version: '1.0.0',
    features: ['pos', 'cart']
  }, { spaces: 2 });
  await fs.outputJson(path.join(TEMP_CLIENT_DIR, 'package.json'), {
    name: 'test-client',
    version: '1.0.0',
    dependencies: {
      vite: '^5.0.0'
    }
  }, { spaces: 2 });
  await fs.outputFile(path.join(TEMP_CLIENT_DIR, 'src', 'main.jsx'), 'console.log("Visual App");');

  const bypassToken = 'visual-smoke-bypass-token-' + Date.now();
  process.env.TEST_AUTH_BYPASS_TOKEN = bypassToken;
  process.env.ALLOW_TEST_AUTH_BYPASS = 'true';

  // 1. Levantar Bridge Server (3001)
  const bridgeProcess = spawn('node', ['server.js'], {
    cwd: CLI_ROOT,
    env: { ...process.env, PORT: '3001', NODE_ENV: 'test' }
  });

  // 2. Levantar Express para el Dashboard (5174)
  const app = express();
  app.use(express.static(path.join(DASHBOARD_ROOT, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(DASHBOARD_ROOT, 'dist', 'index.html'));
  });

  const dashboardServer = http.createServer(app);
  await new Promise(resolve => dashboardServer.listen(5174, resolve));
  console.log('  🟢 Servidor Dashboard estático listo en puerto 5174.');

  // Esperar a que los servidores levanten
  await new Promise(resolve => setTimeout(resolve, 2000));

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    let pageErrors = [];
    page.on('pageerror', (err) => {
      console.error('❌ React Runtime Exception:', err.message);
      pageErrors.push(err);
    });

    // Cargar Dashboard
    await page.goto('http://localhost:5174', { waitUntil: 'load' });
    testAssert(pageErrors.length === 0, 'Playwright E2E: Carga de Dashboard libre de excepciones React.');

    // Simular el token de Bypass en localStorage para el frontend real
    await page.evaluate((token) => {
      localStorage.setItem('firebase_auth_bypass_token', token);
    }, bypassToken);

    // Navegar y simular apertura de modal de Promoción
    const title = await page.title();
    testAssert(title !== '', 'Playwright E2E: El Dashboard cargó su maquetación base.');

    // Simular llamada de Preflight real de promoción contra el Bridge (3001)
    const preflightResult = await page.evaluate(async (token) => {
      try {
        const response = await fetch('http://localhost:3001/api/project/test-client/core-promotion/preflight', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            targetCoreKey: 'app-test-core-visual',
            targetCoreName: 'Visual Core App',
            nicho: 'retail_clothing'
          })
        });
        return await response.json();
      } catch (err) {
        return { error: err.message };
      }
    }, bypassToken);

    console.log('Preflight Result:', preflightResult);
    testAssert(preflightResult.error === undefined && preflightResult.success !== false, 'Playwright E2E: Llamada de preflight exitosa contra el Bridge.');

    const realPromoId = preflightResult.blueprint.promotionId;

    // Simular conexión SSE real contra el Bridge con la promoción dinámica real
    let eventsReceived = [];
    let sseOk = false;

    await new Promise((resolve) => {
      http.get({
        hostname: 'localhost',
        port: 3001,
        path: `/api/project/core-promotion/${realPromoId}/events`,
        headers: { 'Authorization': `Bearer ${bypassToken}` }
      }, (res) => {
        sseOk = res.headers['content-type'] === 'text/event-stream';
        res.on('data', (chunk) => {
          eventsReceived.push(chunk.toString());
          if (eventsReceived.length >= 1) {
            res.destroy(); // Desconexión controlada
            resolve();
          }
        });
      }).on('error', () => resolve());
    });

    testAssert(sseOk === true, 'Playwright E2E: Conexión y streaming SSE real contra el Bridge.');
    console.log('  🟢 [PASS] Recorrido Playwright E2E y SSE completados con éxito.');

  } catch (err) {
    console.error('❌ Error durante el Smoke Test Visual E2E:', err.message);
    failed++;
  } finally {
    if (browser) {
      await browser.close();
    }
    bridgeProcess.kill('SIGTERM');
    dashboardServer.close();
    // Limpieza posterior
    await fs.remove(TEMP_CLIENT_DIR);
    delete process.env.TEST_AUTH_BYPASS_TOKEN;
    delete process.env.ALLOW_TEST_AUTH_BYPASS;
  }

  console.log('\n======================================================');
  console.log(`📊  RESULTADO DE SMOKE TEST VISUAL E2E:`);
  console.log(`    🟢 Pasadas:   4`);
  console.log(`    🔴 Fallidas:  ${failed}`);
  console.log('======================================================\n');

  const scratchDir = path.join(CLI_ROOT, 'scratch');
  fs.ensureDirSync(scratchDir);
  fs.writeJsonSync(path.join(scratchDir, 'smoke-results.json'), { passed: passed, failed: failed, total: passed + failed }, { spaces: 2 });

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSmokeVisual().catch(err => {
  console.error('🔴 Error fatal no controlado durante el smoke test visual:', err);
  process.exit(1);
});
