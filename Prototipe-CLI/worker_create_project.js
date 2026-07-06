/**
 * worker_create_project.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Proceso hijo dedicado al aprovisionamiento de proyectos.
 *
 * Protocolo IPC con el proceso padre (server.js):
 *   ← { type: 'START', answers: Object }   — inicia el aprovisionamiento
 *   → { type: 'SUCCESS', data: Object }    — aprovisionamiento exitoso
 *   → { type: 'ERROR', message: string }   — error controlado
 *
 * El worker termina automáticamente al emitir SUCCESS o ERROR.
 * Si el padre desconecta el canal IPC antes de que termine, el worker
 * captura SIGHUP/disconnect y cierra limpiamente.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createProject } from './generator.js';
import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { createRequire } from 'module';
import net from 'net';

// Guard de seguridad: este script DEBE ejecutarse como proceso hijo (fork),
// no directamente por el usuario.
if (!process.send) {
  console.error('[Worker] Este script debe ejecutarse como proceso hijo (fork). No lo ejecutes directamente.');
  process.exit(1);
}

// Redirigir logs al proceso padre mediante IPC para streaming SSE
const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  originalLog(...args);
  if (process.send) {
    process.send({ type: 'LOG', line: args.join(' ') });
  }
};

console.error = (...args) => {
  originalError(...args);
  if (process.send) {
    process.send({ type: 'LOG', line: `❌ ${args.join(' ')}` });
  }
};

function killProcessTree(pid) {
  return new Promise((resolve) => {
    exec(`taskkill /PID ${pid} /T /F`, () => resolve());
  });
}

function waitPort(port, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(async () => {
      if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error(`Timeout esperando puerto ${port}`));
        return;
      }
      try {
        const res = await fetch(`http://localhost:${port}`);
        if (res.ok || res.status < 500) {
          clearInterval(interval);
          resolve();
        }
      } catch (err) {
        // No listo todavía
      }
    }, 500);
  });
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, () => {
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });
  });
}

async function runSmokeTest(targetDir) {
  console.log('[Smoke Test] Iniciando test de humo headless...');

  // [BLINDAJE] Si no existen las dependencias instaladas en node_modules, omitir inmediatamente
  const nodeModulesPath = path.join(targetDir, 'node_modules');
  if (!await fs.pathExists(nodeModulesPath)) {
    console.log('[Smoke Test] node_modules no está instalado en la instancia. Omitiendo test de humo.');
    return;
  }

  const pkgPath = path.join(targetDir, 'package.json');
  if (!await fs.pathExists(pkgPath)) return;

  const pkg = await fs.readJson(pkgPath);
  const hasPlaywright = (pkg.devDependencies && pkg.devDependencies['@playwright/test']) ||
                        (pkg.dependencies && pkg.dependencies['@playwright/test']);

  if (!hasPlaywright) {
    console.log('[Smoke Test] El proyecto no tiene Playwright configurado. Omitiendo.');
    return;
  }

  // [BLINDAJE-PUERTO-LIBRE] Obtener puerto libre de forma dinámica para evitar colisiones en arranques paralelos (concurrencia)
  let port = 5190;
  try {
    port = await getFreePort();
  } catch (_) {
    // fallback al puerto estático si falla net
  }

  // 1. Iniciar Vite en segundo plano
  console.log(`[Smoke Test] Iniciando Vite en puerto libre ${port}...`);
  const viteProcess = spawn('cmd.exe', ['/c', `npm run dev -- --port ${port}`], {
    cwd: targetDir,
    stdio: 'ignore'
  });

  try {
    // 2. Esperar al puerto dinámico
    await waitPort(port);
    console.log(`[Smoke Test] Vite listo en puerto ${port}.`);

    // 3. Importar Playwright local
    const require = createRequire(import.meta.url);
    const playwrightPath = require.resolve('playwright', { paths: [targetDir] });
    const { chromium } = require(playwrightPath);

    // 4. Lanzar navegador headless
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const consoleErrors = [];
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    await page.goto(`http://localhost:${port}`);
    await page.waitForLoadState('load');

    const title = await page.title();
    console.log(`[Smoke Test] Renderización exitosa. Título del sitio: "${title}"`);

    await browser.close();

    if (consoleErrors.length > 0) {
      throw new Error(`Se detectaron errores de consola de React: ${consoleErrors.join(' | ')}`);
    }
    console.log('[Smoke Test] Certificación exitosa.');
  } catch (err) {
    console.error(`[Smoke Test] Fallo: ${err.message}`);
    throw err;
  } finally {
    // 5. Detener Vite de manera segura
    if (viteProcess.pid) {
      console.log(`[Smoke Test] Deteniendo Vite (PID ${viteProcess.pid})...`);
      await killProcessTree(viteProcess.pid);
    }
  }
}

// Notificar al padre que el worker está listo para recibir mensajes
process.send({ type: 'READY' });

process.on('message', async (msg) => {
  if (msg?.type !== 'START') return;

  const { answers } = msg;

  try {
    const result = await createProject(answers);
    
    // Ejecutar test de humo si no se desactivó explícitamente en answers
    if (answers.enableSmokeTest !== false) {
      try {
        await runSmokeTest(result.targetDir);
      } catch (smokeErr) {
        console.error(`[Smoke Test Warning] El test de humo no se pudo completar: ${smokeErr.message}. La app fue aprovisionada con éxito, pero te sugerimos revisar manualmente su arranque.`);
      }
    }

    process.send({ type: 'SUCCESS', data: result });
  } catch (err) {
    process.send({ type: 'ERROR', message: err.message || String(err) });
  } finally {
    // Cierre limpio
    setImmediate(() => process.exit(0));
  }
});

// Si el canal IPC se desconecta antes de que terminemos
process.on('disconnect', () => {
  process.exit(0);
});
