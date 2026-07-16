import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');

function testBridgeHealth() {
  console.log('🧪 Iniciando Test de Arranque y Health Check del Bridge CLI...');
  
  let isCleanExit = false;

  // Levantar el servidor Express (server.js) de forma asíncrona
  const child = spawn('node', ['server.js'], {
    cwd: CLI_ROOT,
    env: { ...process.env, PORT: '3001', NODE_ENV: 'test' }
  });

  let output = '';
  child.stdout.on('data', (data) => {
    output += data.toString();
  });
  child.stderr.on('data', (data) => {
    output += data.toString();
  });

  // Intentar consultar el puerto 3001
  let attempts = 0;
  const maxAttempts = 60;
  const interval = 500;

  const checkHealth = () => {
    http.get('http://localhost:3001/api/templates', (res) => {
      console.log(`  🟢 [PASS] Health check completado. Status HTTP: ${res.statusCode}`);
      if (res.statusCode === 200) {
        // Enviar kill controlado SIGTERM
        isCleanExit = true;
        child.kill('SIGTERM');
      } else {
        console.error(`🔴 FAILED Health check: Status HTTP ${res.statusCode}`);
        child.kill('SIGKILL');
        process.exit(1);
      }
    }).on('error', (err) => {
      attempts++;
      if (attempts >= maxAttempts) {
        console.error('🔴 FAILED: Servidor Bridge no respondió en el puerto 3001 en el tiempo límite.');
        console.error('Logs del servidor:\n', output);
        child.kill('SIGKILL');
        process.exit(1);
      } else {
        setTimeout(checkHealth, interval);
      }
    });
  };

  // Iniciar sondeo tras 1s
  setTimeout(checkHealth, 1000);

  child.on('close', (code, signal) => {
    if (!isCleanExit) {
      console.error(`🔴 FAILED: El servidor de Bridge se cerró inesperadamente. Code: ${code}, Signal: ${signal}`);
      console.error('Logs del servidor:\n', output);
      process.exit(1);
    }
    console.log(`  🟢 [PASS] Servidor cerrado de forma controlada. Signal: ${signal}, Code: ${code}`);
    console.log('======================================================');
    console.log('📊  TEST DE ARRANQUE COMPILADO CON ÉXITO (Código de salida: 0)');
    console.log('======================================================\n');
    process.exit(0);
  });
}

testBridgeHealth();
