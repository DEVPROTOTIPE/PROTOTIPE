import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn, fork } from 'child_process';
import { promisify } from 'util';
import * as Diff from 'diff';
import crypto from 'crypto';
import { Jimp } from 'jimp';
import webpush from 'web-push';
// createProject se ejecuta en un proceso hijo (worker_create_project.js)
// para no bloquear el Event Loop de Express con sus execSync internos.
import { getWorkspaceRoot, getDocumentationRoot } from './config.js';
import { logger } from './logger.js';
import { FeatureRegistry } from './lib/FeatureRegistry.js';
import { FeatureArtifactGenerator } from './lib/FeatureArtifactGenerator.js';
import { initializeCliSecurityToken, loopbackOnlyMiddleware, authenticateCliToken } from './lib/SecurityMiddleware.js';
import { FeatureDependencyGraph } from './lib/FeatureDependencyGraph.js';
import { FeatureRequestValidator } from './lib/FeatureRequestValidator.js';
import { WorkspaceLockManager } from './lib/WorkspaceLockManager.js';
import { OperationJournalRepository, JOURNAL_STATES } from './lib/OperationJournalRepository.js';
import { FeatureScaffolder } from './lib/FeatureScaffolder.js';
import { FeatureVerificationRunner } from './lib/FeatureVerificationRunner.js';
import { VersionManager } from './lib/VersionManager.js';
import admin from 'firebase-admin';
import { CorePromotionService } from './lib/CorePromotionService.js';
import { CorePromotionPublisher } from './lib/CorePromotionPublisher.js';
import { ClientLineageMigrator } from './lib/ClientLineageMigrator.js';
import { PromotionBlueprintBuilder } from './lib/PromotionBlueprintBuilder.js';
import { CoreCandidateBuilder } from './lib/CoreCandidateBuilder.js';
import { CorePromotionValidator } from './lib/CorePromotionValidator.js';
import { BriefingDocumentMapper } from './lib/BriefingDocumentMapper.js';
import { normalizeProvisioningEnvelope } from './lib/ProvisioningEnvelopeAdapter.js';
import { ProvisioningStateManager } from './lib/ProvisioningStateManager.js';
import { ProvisioningQueue } from './lib/ProvisioningQueue.js';

const execAsync = promisify(exec);

// Diccionario global en memoria para rastrear tareas asíncronas de creación de proyectos (Mejora 1 - Aprovisionamiento Asíncrono)
const activeCreationTasks = {};

// Helper de sanitización secundaria para evitar variables de shell y caracteres especiales en cadenas pasadas a consolas
function sanitizeShellArgument(arg) {
  if (typeof arg !== 'string') return '';
  // Remover comillas, variables shell, redirecciones, operadores lógicos, variables locales de Windows y newlines
  return arg.replace(/["'<>|;&$%!^()]/g, '').replace(/[\r\n]/g, '').trim();
}

// Validar ruta relativa segura para evitar Directory Traversal y caracteres extraños de consola
function assertSafeRelativePath(input) {
  if (typeof input !== 'string') throw new Error('Path inválido: debe ser una cadena');
  if (input.includes('\0')) throw new Error('Path inválido: contiene carácter nulo');
  if (/[\r\n\t]/.test(input)) throw new Error('Path inválido: contiene caracteres de control');

  const normalized = input.replace(/\\/g, '/');

  if (path.isAbsolute(normalized)) throw new Error('Rutas absolutas no permitidas');
  if (normalized.split('/').includes('..')) throw new Error('Salto de directorio (path traversal) no permitido');

  // Solo permitir caracteres estándar de ruta para evitar inyecciones en argumentos de Git
  if (!/^[a-zA-Z0-9._/ -]+$/.test(normalized)) {
    throw new Error('Ruta contiene caracteres no soportados para ejecución');
  }

  return normalized;
}

// Redactar secretos de variables de entorno críticas en mensajes de logs o errores
function redactSecrets(text = '') {
  let output = String(text);
  for (const [key, value] of Object.entries(process.env)) {
    if (!value || value.length < 8) continue;
    if (/KEY|TOKEN|SECRET|PASSWORD|FIREBASE|VITE/i.test(key)) {
      output = output.split(value).join(`[REDACTED:${key}]`);
    }
  }
  return output;
}

// Obtener entorno de ejecución seguro y mínimo para subprocesos
function safeEnv(extra = {}) {
  const env = {
    PATH: process.env.PATH,
    SystemRoot: process.env.SystemRoot,
    ComSpec: process.env.ComSpec,
    APPDATA: process.env.APPDATA,
    LOCALAPPDATA: process.env.LOCALAPPDATA,
    USERPROFILE: process.env.USERPROFILE,
    HOMEDRIVE: process.env.HOMEDRIVE,
    HOMEPATH: process.env.HOMEPATH,
    ...extra
  };
  // Prevenir inyección de librerías/comandos antes del script ejecutado por Node
  delete env.NODE_OPTIONS;
  delete env.NODE_PATH;
  return env;
}

// Resolver ejecutables de Node CLI a sus scripts JS directos para evitar wrappers .cmd (Zero Shell real en Windows)
function resolveCliExecutable(cmd) {
  if (cmd === 'node') {
    return { cmd: process.execPath, args: [] };
  }
  
  if (cmd === 'npm' || cmd === 'npx') {
    const cliFilename = cmd === 'npm' ? 'npm-cli.js' : 'npx-cli.js';
    const nodeDir = path.dirname(process.execPath);
    const localPath = path.join(nodeDir, 'node_modules', 'npm', 'bin', cliFilename);
    if (fs.existsSync(localPath)) {
      return { cmd: process.execPath, args: [localPath] };
    }
  }
  
  if (cmd === 'firebase' && process.env.APPDATA) {
    const globalFirebase = path.join(process.env.APPDATA, 'npm', 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js');
    if (fs.existsSync(globalFirebase)) {
      return { cmd: process.execPath, args: [globalFirebase] };
    }
  }
  
  // Si no se encuentra el script directo, solo permitir el fallback .cmd si se declara explícitamente la bandera de compatibilidad
  if (process.env.ALLOW_CMD_COMPAT_FALLBACK === 'true') {
    let resolvedCmd = cmd;
    if (process.platform === 'win32') {
      if (cmd === 'npm') resolvedCmd = 'npm.cmd';
      else if (cmd === 'npx') resolvedCmd = 'npx.cmd';
      else if (cmd === 'firebase') resolvedCmd = 'firebase.cmd';
    }
    return { cmd: resolvedCmd, args: [] };
  }

  throw new Error(`No se pudo resolver el entrypoint JS directo para ${cmd} (Zero Shell) y el fallback de compatibilidad .cmd está desactivado.`);
}

// Validar contención de rutas físicas para evitar Directory Traversal de forma agnóstica a la plataforma
function isPathContained(parentPath, childPath) {
  if (!parentPath || !childPath) return false;
  const parentResolved = path.resolve(parentPath).toLowerCase();
  const childResolved = path.resolve(childPath).toLowerCase();
  return childResolved === parentResolved || childResolved.startsWith(parentResolved + path.sep);
}

// Redirigir consola de forma global a logger.js para auditoría persistente con guardián contra recursión
let inConsoleLogger = false;

function setupConsoleLogger() {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (...args) => {
    originalLog(...args);
    if (!inConsoleLogger) {
      inConsoleLogger = true;
      try {
        logger.info(args.join(' '));
      } finally {
        inConsoleLogger = false;
      }
    }
  };

  console.warn = (...args) => {
    originalWarn(...args);
    if (!inConsoleLogger) {
      inConsoleLogger = true;
      try {
        logger.warn(args.join(' '));
      } finally {
        inConsoleLogger = false;
      }
    }
  };

  console.error = (...args) => {
    originalError(...args);
    if (!inConsoleLogger) {
      inConsoleLogger = true;
      try {
        logger.error(args.join(' '));
      } finally {
        inConsoleLogger = false;
      }
    }
  };
}

// Inicializar el logger global inmediatamente
setupConsoleLogger();

// Validar y sanear el archivo de metadatos .prototipe.json de los clientes
function validatePrototipeMetadata(meta, folderName) {
  const safeMeta = { ...meta };
  if (!safeMeta.template) {
    safeMeta.template = 'ventas';
  }
  if (!safeMeta.version) {
    safeMeta.version = '0.0.0';
  }
  if (!safeMeta.clientId) {
    safeMeta.clientId = folderName;
  }
  if (!safeMeta.projectName) {
    safeMeta.projectName = folderName;
  }
  return safeMeta;
}

// Ejecutar diagnósticos rápidos del PATH
async function runPreflightChecks() {
  console.log('\n🔍 [Preflight] Comprobando dependencias del ecosistema...');
  
  try {
    await execAsync('git --version');
    console.log('   ✅ Git: Detectado en PATH.');
  } catch (_) {
    console.warn('   ⚠️  Git: No detectado en PATH. Las funciones de control de versiones y drift estarán limitadas.');
  }

  try {
    await execAsync('firebase --version');
    console.log('   ✅ Firebase CLI: Detectado en PATH.');
  } catch (_) {
    console.warn('   ⚠️  Firebase CLI: No detectado en PATH. Las operaciones y despliegues en la nube de Firebase no estarán operativos.');
  }
  console.log('──────────────────────────────────────────────────\n');
}

function killProcessTree(pid) {
  return new Promise((resolve) => {
    exec(`taskkill /PID ${pid} /T /F`, () => resolve());
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = __dirname;
// GIT_ROOT se resuelve dinámicamente a partir de CLI_ROOT para portabilidad total
// sin importar la unidad de disco (D:, C:, E:, etc.) o la ruta de carpetas del usuario.
const GIT_ROOT = path.resolve(CLI_ROOT, '..');
const TEMPLATES_DIR = path.join(CLI_ROOT, 'templates');
const INSTANCES_DIR = getWorkspaceRoot();
const SEED_DIR = path.join(CLI_ROOT, 'templates', 'template-core-seed');
const WORKER_PATH  = path.join(CLI_ROOT, 'worker_create_project.js');

// ─── Levantar Servidor de Notificaciones (Proceso Hijo / Opción A) ───
const notificationServerPath = path.join(CLI_ROOT, 'notification_server.js');
let notificationProcess = null;

function startNotificationServer() {
  if (fs.existsSync(notificationServerPath)) {
    console.log(`[CLI Server] Levantando Servidor de Notificaciones desde: ${notificationServerPath}`);
    notificationProcess = fork(notificationServerPath);

    notificationProcess.on('error', (err) => {
      console.error('[CLI Server] Error en el Servidor de Notificaciones hijo:', err);
    });

    notificationProcess.on('exit', (code, signal) => {
      // Si finalizó por señal SIGTERM o código 0, no reiniciar (cierre intencionado)
      if (code === 0 || signal === 'SIGTERM' || signal === 'SIGINT') {
        console.log('[CLI Server] Servidor de Notificaciones hijo finalizado de forma intencionada.');
        return;
      }
      console.warn(`[CLI Server] Servidor de Notificaciones hijo finalizó inesperadamente (código ${code}, señal ${signal}). Reiniciando en 5 segundos...`);
      setTimeout(startNotificationServer, 5000);
    });
  } else {
    console.error(`[CLI Server] No se encontró el archivo del servidor de notificaciones en: ${notificationServerPath}`);
  }
}

startNotificationServer();

// ─────────────────────────────────────────────────────────────────────────────
// writeFileWithRetry — Escritura resiliente con reintentos exponenciales
// Previene errores EBUSY/EPERM causados por bloqueos temporales del sistema
// operativo (editores externos, antivirus, indexadores como Windows Search).
// ─────────────────────────────────────────────────────────────────────────────
async function writeFileWithRetry(filePath, content, options = 'utf8', retries = 5, delay = 100) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await fs.writeFile(filePath, content, options);
      return; // Escritura exitosa
    } catch (err) {
      const isLockError = ['EBUSY', 'EPERM', 'EACCES'].includes(err.code);
      if (isLockError && attempt < retries) {
        const wait = delay * Math.pow(2, attempt - 1); // Backoff exponencial: 100ms, 200ms, 400ms...
        console.warn(`[writeFileWithRetry] Intento ${attempt}/${retries} fallido (${err.code}). Reintentando en ${wait}ms...`);
        await new Promise(resolve => setTimeout(resolve, wait));
      } else {
        throw err; // Re-lanzar si no es error de bloqueo o se agotaron los reintentos
      }
    }
  }
}

// Locks globales de sincronización para prevenir condiciones de carrera (Race Conditions)
const syncLocks = {};
const projectSyncLocks = {};

// Tiempo máximo de aprovisionamiento antes de considerar el proceso como colgado
// [BLIND-2] Cambiado de 10 a 20 min: npm install en red lenta o proyectos grandes
// puede consumir fácilmente 10+ minutos antes del primer despliegue Firebase.
const WORKER_TIMEOUT_MS = 20 * 60 * 1000;

// Carga del .env centralizada en config.js — no se duplica aquí.

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar Firebase Admin SDK de forma local
admin.initializeApp({
  projectId: 'prototipe-ecosistema-control'
});

// Rutina de recuperación determinista de estados inconclusos tras reiniciar el Bridge CLI
CorePromotionService.recoverInterruptedOperations().catch(err => {
  console.error('[CorePromotionService] Error en la rutina de recuperación inicial:', err.message);
});

// CORS restrictivo: solo permite el dev-dashboard y peticiones server-to-server (sin Origin header)
// Bloquea cualquier sitio web externo que intente consumir el Bridge desde el browser del usuario
const CORS_ALLOWED_ORIGINS = [
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5173', // puerto fallback de Vite
  'http://127.0.0.1:5173',
];
app.use(cors({
  origin: function (origin, callback) {
    // Sin Origin = petición server-to-server (PowerShell, Node, curl) → permitir
    if (!origin) return callback(null, true);
    if (CORS_ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Permitir cualquier puerto local en desarrollo (localhost/127.0.0.1)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error(`[CORS] Origen no autorizado: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
// Middleware para interceptar errores de parseo de JSON mal formado y evitar caídas del Bridge CLI
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.warn('[Express Parser Warning] Payload JSON mal formado o caracteres no escapados recibidos. Ignorado de forma segura.');
    return res.status(400).json({ error: 'Payload JSON mal formado.' });
  }
  next();
});

// Middleware de autenticación basado en Firebase Auth ID Token
async function authenticateFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const expectedBypassToken = process.env.TEST_AUTH_BYPASS_TOKEN;
  if (expectedBypassToken && authHeader === `Bearer ${expectedBypassToken}`) {
    const isLoopback = req.connection.remoteAddress === '127.0.0.1' || req.connection.remoteAddress === '::1' || req.ip === '127.0.0.1';
    if (process.env.NODE_ENV === 'test' && process.env.ALLOW_TEST_AUTH_BYPASS === 'true' && isLoopback) {
      req.user = { uid: 'operator-test', email: 'operator-test@localhost.invalid' };
      req.userId = 'operator-test';
      return next();
    }
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado: Token Bearer faltante o mal formado.' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    req.userId = decodedToken.uid;
    next();
  } catch (err) {
    console.error('[Auth Error] Error validando token de Firebase:', err.message);
    return res.status(401).json({ error: 'Token de acceso inválido o expirado.' });
  }
}

// Middleware de verificación de Firebase App Check con traducción a Tenant
async function verifyAppCheck(req, res, next) {
  // Bypass de desarrollo local en el Bridge API (si NODE_ENV !== 'production' o el request es de localhost)
  const ip = req.ip || req.connection.remoteAddress || '';
  const isLoopback = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip.includes('127.0.0.1') || ip === 'localhost';

  if (process.env.NODE_ENV !== 'production' && isLoopback) {
    req.appCheck = { appId: 'local-dev-app-id', verified: true };
    const bodyClientId = req.body && req.body.clientId;
    req.tenant = {
      appId: 'local-dev-app-id',
      clientId: bodyClientId || 'test-client',
      niche: (req.body && req.body.niche) || 'general',
      status: 'active'
    };
    return next();
  }

  // 1. Bypass estricto de pruebas locales (solo si NODE_ENV === 'test' y ALLOW_TEST_APPCHECK_BYPASS === 'true')
  if (process.env.NODE_ENV === 'test' && process.env.ALLOW_TEST_APPCHECK_BYPASS === 'true') {
    const ip = req.ip || req.connection.remoteAddress;
    const isLoopback = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
    const bypassHeader = req.headers['x-bypass-token'] || req.headers['x-firebase-appcheck'];
    const expectedBypassToken = process.env.TEST_AUTH_BYPASS_TOKEN;

    if (isLoopback && bypassHeader === expectedBypassToken) {
      req.appCheck = { appId: '1:703542009613:web:00f9363de11a908c991a44', verified: true };
      return next();
    }
  }

  // 2. Extraer cabecera App Check
  const appCheckToken = req.headers['x-firebase-appcheck'];
  if (!appCheckToken) {
    return res.status(401).json({ error: '🔒 App Check: Cabecera X-Firebase-AppCheck requerida.' });
  }

  try {
    // 3. Validar token contra Firebase Admin SDK
    const decodedToken = await admin.appCheck().verifyToken(appCheckToken);
    req.appCheck = decodedToken;

    // 4. Traducir App ID verificado a Tenant/ClientID
    const registryPath = path.join(CLI_ROOT, 'knowledge', 'telemetry', 'app-registry.json');
    if (!(await fs.pathExists(registryPath))) {
      return res.status(500).json({ error: 'Registro de aplicaciones no configurado en el servidor.' });
    }

    const registry = await fs.readJson(registryPath);
    const appMapping = registry.apps.find(a => a.appId === decodedToken.appId);

    if (!appMapping) {
      return res.status(403).json({ error: '🔒 App Check: Aplicación no autorizada en el ecosistema.' });
    }
    if (appMapping.status !== 'active') {
      return res.status(403).json({ error: '🔒 App Check: Aplicación suspendida o revocada.' });
    }

    // Guardar el tenant y metadata mapeada
    req.tenant = appMapping;
    next();
  } catch (err) {
    console.error('[App Check Error] Fallo de validación:', err.message);
    return res.status(403).json({ error: '🔒 App Check: Token de App Check inválido o expirado.' });
  }
}

// Middleware de autorización RBAC granular por claims/permisos de rol en Firestore
function authorizePermission(permission) {
  return async (req, res, next) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    try {
      // Bypasses de desarrollo local para desarrollo ágil y offline con el Emulador
      const isEmulator = process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.NODE_ENV !== 'production';
      if (isEmulator && (req.user.email === 'operator-test@localhost.invalid' || req.user.email === 'developer-test@localhost.invalid')) {
        // Otorgar permisos completos al desarrollador local por defecto
        return next();
      }

      const userDoc = await admin.firestore().collection('users').doc(req.userId).get();
      if (!userDoc.exists) {
        return res.status(403).json({ error: 'Acceso denegado: El perfil de usuario no existe en la base de datos de control.' });
      }

      const userData = userDoc.data();
      const permissions = userData.permissions || [];
      const role = userData.role;

      // Administrador global del ecosistema posee todos los privilegios
      if (role === 'admin' || permissions.includes(permission) || permissions.includes('*')) {
        return next();
      }

      return res.status(403).json({ error: `Acceso denegado: Permiso requerido '${permission}' ausente para el operador.` });
    } catch (err) {
      console.error('[Auth Error] Error de verificación de permisos en Firestore:', err.message);
      return res.status(500).json({ error: 'Error interno de autorización.' });
    }
  };
}

function hexToHsl(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `hsl(${h}, ${s}%, ${l}%)`;
}

function ensureHsl(colorStr) {
  if (!colorStr || typeof colorStr !== 'string') return colorStr;
  const trimmed = colorStr.trim();
  if (trimmed.toLowerCase().startsWith('hsl')) {
    return trimmed;
  }
  if (/^#?[0-9a-fA-F]{6}$/.test(trimmed) || /^#?[0-9a-fA-F]{3}$/.test(trimmed)) {
    return hexToHsl(trimmed);
  }
  return trimmed;
}

function parseHSL(hslStr) {
  if (!hslStr || typeof hslStr !== 'string') return null;
  const match = hslStr.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
  if (!match) return null;
  return {
    h: parseInt(match[1]),
    s: parseInt(match[2]),
    l: parseInt(match[3])
  };
}

function validateHSLColors(primaryHslStr, bgHslStr) {
  const primary = parseHSL(primaryHslStr);
  const bg = parseHSL(bgHslStr);

  if (!primary) return { valid: false, error: `El color primario "${primaryHslStr}" no tiene un formato HSL válido (ej: hsl(262, 83%, 58%))` };
  
  const bgL = bg ? bg.l : 6; // 6% de luminosidad por defecto en modo oscuro

  const diff = Math.abs(primary.l - bgL);
  if (diff < 30) {
    return {
      valid: false,
      error: `Contraste HSL insuficiente (${diff}% de diferencia). La diferencia de luminosidad (Lightness) entre el primario (${primary.l}%) y el fondo (${bgL}%) debe ser de al menos 30% para garantizar la legibilidad de la interfaz.`
    };
  }

  return { valid: true };
}

// Endpoint para obtener la lista de plantillas disponibles
app.get('/api/templates', async (req, res) => {
  try {
    if (!await fs.pathExists(TEMPLATES_DIR)) {
      return res.status(404).json({ error: 'La carpeta de plantillas no existe.' });
    }
    const templates = await fs.readdir(TEMPLATES_DIR);
    res.json({ templates });
  } catch (err) {
    res.status(500).json({ error: `Error al leer las plantillas: ${err.message}` });
  }
});

// Endpoint para obtener la lista de features registradas
app.get('/api/feature-registry', async (req, res) => {
  try {
    const features = await FeatureRegistry.getAll();
    res.json({ success: true, features });
  } catch (err) {
    res.status(500).json({ error: `Error al leer el registro de features: ${err.message}` });
  }
});

// Endpoint para obtener los detalles de una feature registrada por ID
app.get('/api/feature-registry/:featureId', async (req, res) => {
  try {
    const feature = await FeatureRegistry.resolve(req.params.featureId);
    if (!feature) {
      return res.status(404).json({ error: `Feature "${req.params.featureId}" no encontrada en el registro.` });
    }
    res.json({ success: true, feature });
  } catch (err) {
    res.status(500).json({ error: `Error al resolver la feature: ${err.message}` });
  }
});

// Endpoint para auto-detectar la configuración SDK de Firebase de un proyecto
app.get('/api/firebase-config', async (req, res) => {
  const { projectId, projectName } = req.query;

  if (!projectId || !projectId.trim()) {
    return res.status(400).json({ error: 'El parámetro "projectId" es obligatorio.' });
  }

  // Sanitizar: solo permitir caracteres válidos en un Project ID de Firebase
  const safeProjectId = projectId.trim().replace(/[^a-z0-9\-]/gi, '');
  if (!safeProjectId) {
    return res.status(400).json({ error: 'El projectId contiene caracteres no válidos.' });
  }

  const runSdkConfig = async () => {
    const { stdout } = await execAsync(
      `firebase apps:sdkconfig web --project ${safeProjectId} --json`,
      { timeout: 30000 }
    );
    // La salida puede tener prefijo de texto antes del JSON
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Respuesta inesperada del CLI de Firebase (sin JSON válido en stdout).');
    return JSON.parse(jsonMatch[0]);
  };

  try {
    let sdkData;

    try {
      sdkData = await runSdkConfig();
    } catch (firstErr) {
      // execAsync rechaza con un Error que tiene .stderr como propiedad propia del objeto
      const errText = `${firstErr.message} ${firstErr.stderr || ''}`.toLowerCase();
      const noWebApp = errText.includes('no web apps') || errText.includes('not found');

      if (noWebApp) {
        const appDisplayName = (projectName || safeProjectId).trim().replace(/[^a-zA-Z0-9\s\-_]/g, '');
        console.log(`[API] No se encontró Web App en ${safeProjectId}. Creando "${appDisplayName}"...`);
        await execAsync(
          `firebase apps:create web "${appDisplayName}" --project ${safeProjectId}`,
          { timeout: 60000 }
        );
        // Reintentar tras crear la app
        sdkData = await runSdkConfig();
      } else {
        throw firstErr;
      }
    }

    // Extraer las variables clave del SDK
    const config = sdkData?.result?.sdkConfig || sdkData?.sdkConfig || sdkData;
    const { apiKey, authDomain, projectId: pid, storageBucket, appId, measurementId } = config;

    if (!apiKey || !appId) {
      return res.status(500).json({
        error: 'No se pudieron extraer las credenciales del SDK. Verifica que tienes permisos sobre el proyecto.'
      });
    }

    console.log(`[API] Credenciales auto-detectadas para proyecto: ${pid}`);
    res.json({
      success: true,
      config: { apiKey, authDomain, projectId: pid, storageBucket, appId, measurementId: measurementId || null }
    });
  } catch (err) {
    console.error(`[API] Error al obtener sdkconfig de Firebase: ${err.message}`);
    res.status(500).json({ error: classifyFirebaseError(err) });
  }
});

/**
 * Clasifica errores de la Firebase CLI en mensajes legibles para el usuario.
 * @param {Error} err Objeto de error capturado de execAsync
 * @returns {string} Mensaje de error amigable
 */
function classifyFirebaseError(err) {
  const text = `${err.message} ${err.stderr || ''}`.toLowerCase();
  if (text.includes('not logged') || text.includes('authentication') || text.includes('unauthenticated')) {
    return 'No estás autenticado en la Firebase CLI. Ejecuta "firebase login" y vuelve a intentarlo.';
  }
  if (text.includes('permission denied') || text.includes('403') || text.includes('iam')) {
    return 'Sin permisos sobre este proyecto de Firebase. Verifica tu rol en la consola de Google Cloud.';
  }
  if (text.includes('quota') || text.includes('429') || text.includes('resource exhausted')) {
    return 'Cuota de la API de Firebase agotada temporalmente. Intenta de nuevo en unos minutos.';
  }
  if (text.includes('not found') || text.includes('404') || text.includes('does not exist')) {
    return 'Proyecto de Firebase no encontrado. Verifica que el Project ID sea correcto.';
  }
  if (text.includes('enotfound') || text.includes('network') || text.includes('econnrefused')) {
    return 'Error de red al contactar Firebase. Verifica tu conexión a Internet.';
  }
  return `Error al consultar Firebase CLI: ${err.message}`;
}



// Helper para obtener el texto del catálogo de la biblioteca
async function getLibraryReadmeText() {
  const libraryReadme = path.join(getDocumentationRoot(), '06_Biblioteca_Componentes', 'README.md');
  if (await fs.pathExists(libraryReadme)) {
    return await fs.readFile(libraryReadme, 'utf-8');
  }
  return '';
}

// Expansión cognitiva de requerimientos con IA removida por solicitud.

// Endpoint para validar credenciales de Firebase en caliente (Mejora 1)
app.post('/api/firebase/validate', async (req, res) => {
  const { apiKey, projectId } = req.body;
  if (!apiKey || !projectId) {
    return res.status(400).json({ valid: false, error: 'apiKey y projectId son requeridos.' });
  }
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/config?key=${apiKey}`;
    const response = await fetch(url, { method: 'GET' });
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (_) {
      return res.json({ valid: false, error: `Respuesta no válida de Google Cloud. Verifica el Project ID: "${projectId}".` });
    }

    if (response.status === 400 && data.error && (data.error.message.includes('API key') || data.error.message.includes('INVALID'))) {
      return res.json({ valid: false, error: 'La Firebase API Key suministrada no es válida.' });
    }
    
    if (response.status === 403 && data.error) {
      const msg = data.error.message || '';
      if (msg.includes('Permission denied on resource project') || (data.error.status === 'PERMISSION_DENIED' && msg.includes(projectId))) {
        return res.json({ valid: false, error: `El Project ID "${projectId}" no existe, no está autorizado o no tiene Firestore activo.` });
      }
    }

    if (response.status === 404 && data.error && data.error.message.includes('not found')) {
      return res.json({ valid: false, error: `El Project ID "${projectId}" no existe o no tiene Firestore activo.` });
    }

    res.json({ valid: true });
  } catch (err) {
    res.json({ valid: false, error: `Error de red al validar credenciales: ${err.message}` });
  }
});

// Endpoints para gestión de cuentas de Firebase (Rotación de identidades)
app.get('/api/firebase/accounts', async (req, res) => {
  try {
    const { stdout } = await execAsync('firebase login:list --json');
    const data = JSON.parse(stdout);
    const accounts = data.result || [];

    // Obtener la cuenta activa actual (sin --json para que muestre solo el email)
    let activeEmail = null;
    try {
      const { stdout: activeOut } = await execAsync('firebase login:list');
      const match = activeOut.match(/Logged in as\s+([^\s\r\n]+)/i);
      if (match) activeEmail = match[1].trim();
    } catch (_) {}

    // Marcar la cuenta activa
    const enriched = accounts.map(acc => ({
      ...acc,
      active: acc.user?.email === activeEmail
    }));

    res.json({ success: true, accounts: enriched });
  } catch (err) {
    try {
      const { stdout: textStdout } = await execAsync('firebase login:list');
      res.json({ success: true, accounts: [], warning: 'No se pudieron parsear las cuentas en formato JSON.', raw: textStdout });
    } catch (innerErr) {
      res.json({ success: true, accounts: [], error: innerErr.message });
    }
  }
});

app.post('/api/firebase/accounts/use', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'El email es requerido.' });
  }
  const sanitizedEmail = email.replace(/[^a-zA-Z0-9@._+-]/g, '');
  try {
    const { stdout, stderr } = await execAsync(`firebase login:use ${sanitizedEmail}`);
    res.json({ success: true, output: stdout || stderr });
  } catch (err) {
    const fullMsg = `${err.message || ''} ${err.stderr || ''}`;
    // Cuenta ya estaba activa — no es un error real
    if (fullMsg.includes('Already using account')) {
      return res.json({ success: true, output: `Ya estás usando la cuenta ${sanitizedEmail} como activa.` });
    }
    // La cuenta no tiene contexto de 'login:use' válido — aún así responder con éxito
    // si el error es solo de contexto global (la cuenta puede usarse con --account flag)
    if (fullMsg.includes('Command failed') && !fullMsg.includes('not found') && !fullMsg.includes('unknown')) {
      // Intentar verificar si la cuenta existe en la lista
      try {
        const { stdout: listOut } = await execAsync('firebase login:list --json');
        const parsed = JSON.parse(listOut);
        const exists = (parsed.users || parsed || []).some(u => {
          const userEmail = typeof u === 'string' ? u : (u.email || u.user?.email || '');
          return userEmail === sanitizedEmail;
        });
        if (exists) {
          return res.json({ success: true, output: `La cuenta ${sanitizedEmail} está vinculada. Puede necesitar re-autenticación para ser usada como activa predeterminada.` });
        }
      } catch (_) {}
    }
    res.status(500).json({ success: false, error: `Fallo al cambiar a la cuenta ${sanitizedEmail}: ${err.stderr || err.message}` });
  }
});

app.post('/api/firebase/accounts/add', async (req, res) => {
  try {
    let command = '';
    const platform = process.platform;
    if (platform === 'win32') {
      command = 'start cmd.exe /k "firebase login:add"';
    } else if (platform === 'darwin') {
      command = `osascript -e 'tell app "Terminal" to do script "firebase login:add"'`;
    } else {
      command = 'x-terminal-emulator -e firebase login:add || gnome-terminal -e "firebase login:add" || konsole -e "firebase login:add"';
    }

    exec(command, (err, stdout, stderr) => {
      if (err) {
        logger.error(`Error al iniciar terminal interactiva de Firebase login:add: ${err.message}`);
      }
    });
    res.json({ success: true, message: 'Se ha abierto una ventana de terminal interactiva para la vinculación.' });
  } catch (err) {
    res.status(500).json({ success: false, error: `Fallo al iniciar el login: ${err.message}` });
  }
});

app.post('/api/firebase/accounts/logout', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'El email es requerido.' });
  }
  const sanitizedEmail = email.replace(/[^a-zA-Z0-9@._+-]/g, '');
  try {
    const { stdout } = await execAsync(`firebase logout ${sanitizedEmail}`);
    res.json({ success: true, output: stdout });
  } catch (err) {
    res.status(500).json({ success: false, error: `Fallo al cerrar sesión en ${sanitizedEmail}: ${err.message}` });
  }
});

app.get('/api/firebase/accounts/status', async (req, res) => {
  try {
    const { stdout } = await execAsync('firebase projects:list --json');
    const data = JSON.parse(stdout);
    res.json({ success: true, projects: data.result || [] });
  } catch (err) {
    res.json({ success: false, error: `No se pudieron listar los proyectos de Firebase: ${err.message}` });
  }
});

// Endpoint para generar un par de claves VAPID en caliente (Mejora de Pulido)
app.get('/api/vapid/generate', (req, res) => {
  try {
    const keys = webpush.generateVAPIDKeys();
    res.json({ success: true, publicKey: keys.publicKey });
  } catch (err) {
    res.status(500).json({ error: `Fallo al generar VAPID: ${err.message}` });
  }
});

// Endpoint para subir logo en base64 y auto-optimizarlo si es pesado (Mejora 2)
app.post('/api/upload-logo', async (req, res) => {
  const { filename, base64 } = req.body;
  if (!filename || !base64) {
    return res.status(400).json({ error: 'filename y base64 son requeridos.' });
  }
  const safeFilename = path.basename(filename);
  const ext = path.extname(safeFilename).toLowerCase();
  const allowedExt = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'];
  if (!allowedExt.includes(ext)) {
    return res.status(400).json({ error: `La extensión del archivo '${ext}' no está permitida.` });
  }

  try {
    const buffer = Buffer.from(base64, 'base64');
    const uploadDir = path.join(CLI_ROOT, 'temp_uploads');
    await fs.ensureDir(uploadDir);
    const targetPath = path.join(uploadDir, safeFilename);

    // Guardar temporalmente
    await fs.writeFile(targetPath, buffer);

    const stats = await fs.stat(targetPath);
    const sizeInMB = stats.size / (1024 * 1024);
    let optimized = false;

    if (sizeInMB > 2) {
      console.log(`[API /upload-logo] Imagen de logo pesada (${sizeInMB.toFixed(2)} MB). Redimensionando con Jimp...`);
      const original = await Jimp.read(targetPath);
      const w = original.width;
      const h = original.height;
      if (w > 512 || h > 512) {
        const maxDim = 512;
        const ratio = Math.min(maxDim / w, maxDim / h);
        const newW = Math.round(w * ratio);
        const newH = Math.round(h * ratio);
        original.resize({ w: newW, h: newH });
        await original.write(targetPath);
        optimized = true;
      }
    }

    res.json({
      success: true,
      filePath: targetPath,
      optimized,
      message: optimized ? 'El logo superaba los 2MB y ha sido optimizado automáticamente.' : 'Logo guardado correctamente.'
    });
  } catch (err) {
    console.error(`[API /upload-logo] Error al procesar carga de logo: ${err.message}`);
    res.status(500).json({ error: `Error al procesar el logo: ${err.message}` });
  }
});

// Clean up task after dynamic TTL or 30 minutes
function registerTaskCleanup(taskId) {
  const TASK_CLEANUP_TTL_MS = Number(process.env.TASK_CLEANUP_TTL_MS || 1800000);
  setTimeout(() => {
    delete activeCreationTasks[taskId];
    console.log(`[Task Monitor] Tarea de aprovisionamiento '${taskId}' purgada de memoria.`);
  }, TASK_CLEANUP_TTL_MS);
}

// Auxiliar para habilitar APIs de GCP de forma programática usando Service Usage API
async function enableGcpService(projectId, serviceName, accessToken) {
  try {
    const url = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/${serviceName}:enable`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP Error ${res.status}: ${errText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`[GCP Service Enable Error] ${serviceName}:`, err.message);
    throw err;
  }
}

// Lógica de ejecución en segundo plano para el aprovisionamiento
async function executeCreationTaskInBackground(taskId, answers) {
  const task = activeCreationTasks[taskId];
  if (!task) return;

  answers.__taskId = taskId;

  const log = (line) => {
    console.log(`[Creation Task ${taskId}] ${line}`);
    task.logs.push(line);
    task.listeners.forEach(res => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ type: 'log', line })}\n\n`);
      }
    });
  };
  
  const clientId = answers.blueprint?.instanceId || (answers.blueprint?.clientName || answers.projectName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  let cloudResourcesCreated = [];
  try {
    const finalProjectId = answers.firebaseProjectId;

    await ProvisioningStateManager.transitionTo(clientId, 'pending', { taskId });

    // Flujo de Aprovisionamiento Automático en Firebase Cloud
    if (answers.autoProvisionFirebase) {
      // Registrar estado inicial antes de crear recursos
      await ProvisioningStateManager.transitionTo(clientId, 'provisioning', {
        taskId,
        metadata: { cloudResourcesCreated }
      });

      log(`[Firebase Automate] Iniciando automatización Firebase para: ${finalProjectId}`);
      
      const safeProjectId = finalProjectId.replace(/[^a-z0-9\-]/gi, '');
      const safeProjectName = answers.projectName.replace(/[^a-zA-Z0-9\s\-_]/g, '');

      // 1. Verificar si el proyecto ya existe en la cuenta de Firebase
      let exists = false;
      try {
        log(`[Firebase Automate] Comprobando si el proyecto "${safeProjectId}" ya existe en tu cuenta...`);
        const listRaw = await execAsync('firebase projects:list --json', { timeout: 30000 });
        const listData = JSON.parse(listRaw.stdout || listRaw);
        const list = listData.result || [];
        exists = list.some(p => String(p.projectId || '').trim() === safeProjectId);
      } catch (listErr) {
        log(`[Firebase Automate Warning] No se pudo obtener la lista de proyectos: ${listErr.message}`);
      }

      if (exists) {
        log(`[Firebase Automate] El proyecto "${safeProjectId}" ya existe en tu cuenta de Firebase. Continuando con recursos...`);
      } else {
        try {
          log(`[Firebase Automate] Creando proyecto Firebase "${safeProjectName}" con ID "${safeProjectId}"...`);
          await execAsync(`firebase projects:create ${safeProjectId} --display-name "${safeProjectName}"`, { timeout: 180000 });
          log(`[Firebase Automate] Proyecto Firebase creado exitosamente.`);
          cloudResourcesCreated.push({
            type: 'firebaseProject',
            id: safeProjectId,
            createdAt: new Date().toISOString()
          });
          await ProvisioningStateManager.transitionTo(clientId, 'provisioning', {
            taskId,
            metadata: { cloudResourcesCreated }
          });
        } catch (createErr) {
          log(`[Firebase Automate Warning] projects:create falló. Comprobando si el proyecto ya tiene recursos Firebase habilitados...`);
          try {
            await execAsync(`firebase apps:list --project ${safeProjectId}`, { timeout: 20000 });
            log(`[Firebase Automate] El proyecto "${safeProjectId}" ya existe y tiene recursos Firebase habilitados. Continuando...`);
          } catch (_) {
            const errText = (createErr.message || '') + (createErr.stderr || '') + (createErr.stdout || '');
            if (errText.includes('already exists') || errText.includes('Conflict') || errText.includes('409') || errText.includes('already in use') || errText.includes('already')) {
              log(`[Firebase Automate] El proyecto "${safeProjectId}" ya existe. Continuando con recursos...`);
            } else {
              throw createErr;
            }
          }
        }
      }

      // Habilitar APIs de GCP de forma proactiva (Firestore, Storage y Auth)
      try {
        log(`[Firebase Automate] Habilitando APIs críticas de Google Cloud (Firestore, Storage, Identity Toolkit)...`);
        const token = await getFirebaseAccessToken();
        await Promise.all([
          enableGcpService(safeProjectId, 'firestore.googleapis.com', token),
          enableGcpService(safeProjectId, 'firebasestorage.googleapis.com', token),
          enableGcpService(safeProjectId, 'storage.googleapis.com', token),
          enableGcpService(safeProjectId, 'identitytoolkit.googleapis.com', token)
        ]);
        log(`[Firebase Automate] APIs de Google Cloud habilitadas con éxito. Esperando propagación...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (apiErr) {
        log(`[Firebase Automate Warning] No se pudieron habilitar algunas APIs de Google Cloud: ${apiErr.message}. Continuando de todos modos...`);
      }

      // 2. Crear base de datos Firestore default (nam5)
      try {
        log(`[Firebase Automate] Inicializando Firestore (default) en nam5...`);
        await execAsync(`firebase firestore:databases:create "(default)" --project ${safeProjectId} --location nam5`, { timeout: 120000 });
        log(`[Firebase Automate] Firestore (default) creado con éxito.`);
        cloudResourcesCreated.push({
          type: 'firestoreDatabase',
          id: '(default)',
          createdAt: new Date().toISOString()
        });
        await ProvisioningStateManager.transitionTo(clientId, 'provisioning', {
          taskId,
          metadata: { cloudResourcesCreated }
        });
      } catch (dbErr) {
        const errorText = (dbErr.message || '') + (dbErr.stderr || '');
        if (
          errorText.includes('already exists') ||
          errorText.includes('Conflict') ||
          errorText.includes('409') ||
          errorText.includes('ALREADY_EXISTS')
        ) {
          log(`[Firebase Automate] Firestore ya está inicializado.`);
        } else {
          log(`[Firebase Automate Warning] No se pudo inicializar la BD default: ${dbErr.message}`);
        }
      }

      // 3. Registrar aplicación Web
      try {
        log(`[Firebase Automate] Registrando Web App "${safeProjectName}"...`);
        await execAsync(`firebase apps:create web "${safeProjectName}" --project ${safeProjectId}`, { timeout: 90000 });
        log(`[Firebase Automate] Web App registrada con éxito.`);
        cloudResourcesCreated.push({
          type: 'webApp',
          id: safeProjectName,
          createdAt: new Date().toISOString()
        });
        await ProvisioningStateManager.transitionTo(clientId, 'provisioning', {
          taskId,
          metadata: { cloudResourcesCreated }
        });
      } catch (appErr) {
        if (appErr.message.includes('already exists') || appErr.stderr?.includes('already exists')) {
          log(`[Firebase Automate] La Web App ya está registrada.`);
        } else {
          throw appErr;
        }
      }

      // 4. Extraer credenciales SDK
      log(`[Firebase Automate] Extrayendo SDK Config...`);
      let sdkConfigRaw;
      try {
        const res = await execAsync(`firebase apps:sdkconfig web --project ${safeProjectId} --json`, { timeout: 60000 });
        sdkConfigRaw = res.stdout || res;
      } catch (sdkErr) {
        const sdkErrText = (sdkErr.message || '') + (sdkErr.stderr || '') + (sdkErr.stdout || '');
        if (sdkErrText.includes('multiple apps')) {
          log(`[Firebase Automate] Múltiples aplicaciones detectadas. Obteniendo lista de apps para especificar ID...`);
          const appsListRaw = await execAsync(`firebase apps:list --project ${safeProjectId} --json`, { timeout: 30000 });
          const appsData = JSON.parse(appsListRaw.stdout || appsListRaw);
          const apps = appsData.result || [];
          const webApps = apps.filter(a => a.platform === 'WEB');
          if (webApps.length > 0) {
            const firstAppId = webApps[0].appId;
            log(`[Firebase Automate] Usando App ID específico: ${firstAppId}`);
            const res = await execAsync(`firebase apps:sdkconfig web ${firstAppId} --project ${safeProjectId} --json`, { timeout: 60000 });
            sdkConfigRaw = res.stdout || res;
          } else {
            throw sdkErr;
          }
        } else {
          throw sdkErr;
        }
      }

      const jsonMatch = sdkConfigRaw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Respuesta inesperada al obtener sdkconfig.');
      const sdkData = JSON.parse(jsonMatch[0]);
      const config = sdkData?.result?.sdkConfig || sdkData?.sdkConfig || sdkData;

      // Asignar parámetros detectados al payload answers
      answers.firebaseApiKey = config.apiKey;
      answers.firebaseAuthDomain = config.authDomain;
      answers.firebaseStorageBucket = config.storageBucket;
      answers.firebaseAppId = config.appId;

      log(`[Firebase Automate] Credenciales de Firebase integradas con éxito.`);

      // Habilitar el proveedor de Email/Password en Firebase Auth e inyectar el usuario admin de forma 100% aislada
      const adminEmail = answers.adminEmail || answers.blueprint?.adminEmail || `admin@${clientId}.com`;
      const adminPassword = answers.adminPassword || answers.blueprint?.adminPassword || 'Admin2026!';

      try {
        const token = await getFirebaseAccessToken();
        let authActivated = false;
        
        // FASE 1: Inicializar configuración por defecto de Identity Platform en GCP
        log(`[Firebase Automate] FASE 1/3: Inicializando Identity Platform (Firebase Auth)...`);
        const initUrl = `https://identitytoolkit.googleapis.com/v2/projects/${safeProjectId}/identityPlatform:initializeAuth`;
        try {
          const initRes = await fetch(initUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
          });
          if (initRes.ok) {
            log(`[Firebase Automate] Identity Platform inicializado con éxito en GCP.`);
            authActivated = true;
          } else {
            const initErr = await initRes.text();
            log(`[Firebase Automate Info] Nota de inicialización: ${initErr}. Continuando...`);
            if (initErr.includes('BILLING_NOT_ENABLED')) {
              log(`[Firebase Automate] ℹ️  Identity Platform completo requiere facturación (Blaze). Se requerirá activación manual de Auth básico gratuito.`);
            }
          }
        } catch (initErr) {
          log(`[Firebase Automate Warning] FASE 1 falló (no crítico): ${initErr.message}. Continuando...`);
        }

        // FASE 2: Activar proveedor de Email/Password (SignIn Config)
        log(`[Firebase Automate] FASE 2/3: Activando proveedor de Email/Password en Firebase Auth...`);
        let configSuccess = false;
        try {
          const configUrl = `https://identitytoolkit.googleapis.com/admin/v2/projects/${safeProjectId}/config?updateMask=signIn`;
          const configRes = await fetch(configUrl, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              signIn: {
                email: {
                  enabled: true,
                  passwordRequired: true
                }
              }
            })
          });
          if (configRes.ok) {
            log(`[Firebase Automate] Proveedor de Email/Password activado con éxito.`);
            configSuccess = true;
          } else {
            const configErr = await configRes.text();
            if (configErr.includes('CONFIGURATION_NOT_FOUND')) {
              log(`[Firebase Automate Warning] ⚠️  Firebase Auth no inicializado en la nube (Plan Spark).`);
            } else {
              log(`[Firebase Automate Warning] FASE 2 falló: ${configErr}`);
            }
          }
        } catch (configErr) {
          log(`[Firebase Automate Warning] FASE 2 falló por error de red/fetch: ${configErr.message}`);
        }

        // FASE DE PAUSA INTERACTIVA (Si no se ha activado Auth en la nube por falta de billing)
        if (!configSuccess) {
          log(`[Firebase Automate] ⏸️  APROVISIONAMIENTO PAUSADO.`);
          log(`👉  Por favor, abre la consola de Firebase: https://console.firebase.google.com/project/${safeProjectId}/authentication`);
          log(`👉  Presiona el botón "Comenzar" (Get Started) para activar la Autenticación Gratuita.`);
          log(`👉  Una vez activado en tu navegador, regresa aquí y presiona "YA LO HE HABILITADO, CONTINUAR".`);
          
          const task = activeCreationTasks[taskId];
          if (task) {
            task.status = 'paused';
            task.pausedReason = 'auth_activation_required';
            
            // Notificar a los listeners del stream SSE que estamos esperando activación de Auth
            task.listeners.forEach(res => {
              if (!res.writableEnded) {
                res.write(`data: ${JSON.stringify({ 
                  type: 'auth_activation_required', 
                  projectId: safeProjectId,
                  taskId
                })}\n\n`);
              }
            });

            // Esperar a que el desarrollador haga clic en "Continuar" y reanude la tarea
            await new Promise((resolveResume) => {
              task.resume = () => {
                task.status = 'running';
                delete task.pausedReason;
                resolveResume();
              };
            });

            log(`[Firebase Automate] ▶️  Reanudando flujo de aprovisionamiento de Auth...`);
            log(`[Firebase Automate] Reintentando FASE 2/3: Activando proveedor de Email/Password...`);
            try {
              const configUrl = `https://identitytoolkit.googleapis.com/admin/v2/projects/${safeProjectId}/config?updateMask=signIn`;
              const configRes = await fetch(configUrl, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  signIn: {
                    email: {
                      enabled: true,
                      passwordRequired: true
                    }
                  }
                })
              });
              if (configRes.ok) {
                log(`[Firebase Automate] Proveedor de Email/Password activado con éxito ✓.`);
              } else {
                const configErr = await configRes.text();
                log(`[Firebase Automate Warning] FASE 2 falló incluso tras reanudación manual: ${configErr}`);
              }
            } catch (retryConfigErr) {
              log(`[Firebase Automate Warning] FASE 2 falló por error de red en reintento: ${retryConfigErr.message}`);
            }
          }
        }

        // FASE 3: Crear usuario administrador en Firebase Auth
        log(`[Firebase Automate] FASE 3/3: Creando cuenta de usuario administrador (${adminEmail}) en Firebase Auth...`);
        try {
          const userUrl = `https://identitytoolkit.googleapis.com/v1/projects/${safeProjectId}/accounts`;
          const userRes = await fetch(userUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              email: adminEmail,
              password: adminPassword,
              emailVerified: true
            })
          });
          
          if (userRes.ok) {
            log(`[Firebase Automate] Cuenta de usuario administrador creada de forma exitosa en Firebase Auth ✓.`);
          } else {
            const userErrTxt = await userRes.text();
            if (userErrTxt.includes('EMAIL_EXISTS')) {
              log(`[Firebase Automate] La cuenta de usuario administrador ya se encuentra registrada.`);
            } else {
              log(`[Firebase Automate Warning] FASE 3 falló: ${userErrTxt}`);
            }
          }
        } catch (userErr) {
          log(`[Firebase Automate Warning] FASE 3 falló por error de red/fetch: ${userErr.message}`);
        }

      } catch (tokenErr) {
        log(`[Firebase Automate Warning] No se pudo obtener el token de acceso de Firebase para configurar la autenticación: ${tokenErr.message}`);
      }
    }

    await ProvisioningStateManager.transitionTo(clientId, 'provisioning', { taskId });
    log(`[API Bridge] Iniciando creación física del proyecto con plantilla: ${answers.template || answers.blueprint?.coreType}`);
    const result = await runCreateProjectWorker(answers, (line) => {
      log(`[Worker] ${line}`);
    });
    
    log(`[API Bridge] Proyecto '${answers.projectName}' creado con éxito en: ${result.targetDir}`);
    
    // Desplegar de forma proactiva reglas e índices de Firebase
    const finalFirebaseProjectId = answers.firebaseProjectId || (typeof safeProjectId !== 'undefined' ? safeProjectId : '');
    const shouldDeployFirebase = answers.enableFirebaseDeploy !== false && answers.execution?.firebaseDeploy !== false;

    if (finalFirebaseProjectId && shouldDeployFirebase) {
      log(`[Firebase Automate] Desplegando reglas e índices de Firebase (Firestore y Storage) en la nube...`);
      try {
        const tokenSuffix = process.env.FIREBASE_TOKEN ? ` --token "${process.env.FIREBASE_TOKEN}"` : '';
        try {
          await execAsync(
            `firebase deploy --only firestore:rules,firestore:indexes,storage -P ${finalFirebaseProjectId}${tokenSuffix}`,
            { cwd: result.targetDir, timeout: 120000 }
          );
          log(`[Firebase Automate] Reglas e índices de seguridad (Firestore y Storage) desplegados con éxito ✓.`);
        } catch (innerErr) {
          const errTxt = innerErr.message || '';
          if (errTxt.includes('Storage has not been set up') || errTxt.includes('storage') || errTxt.includes('Get Started')) {
            log(`[Firebase Automate Warning] ⚠️  Firebase Storage no inicializado. Reintentando despliegue de reglas e índices omitiendo Storage...`);
            await execAsync(
              `firebase deploy --only firestore:rules,firestore:indexes -P ${finalFirebaseProjectId}${tokenSuffix}`,
              { cwd: result.targetDir, timeout: 120000 }
            );
            log(`[Firebase Automate] Reglas e índices de Firestore desplegados con éxito ✓ (Storage omitido).`);
          } else {
            throw innerErr;
          }
        }
      } catch (deployErr) {
        log(`[Firebase Automate Warning] No se pudieron desplegar las reglas/índices de Firebase: ${deployErr.message}. Continuando...`);
      }
    } else if (finalFirebaseProjectId && !shouldDeployFirebase) {
      log(`[Firebase Automate] ℹ️  Despliegue de reglas/índices en Firebase omitido por el desarrollador.`);
    }

    if (answers.seedDatabase !== false) {
      log(`[API Bridge] Iniciando sembrado automático de base de datos para la nueva instancia...`);
      try {
        const seedRes = await seedProjectDatabase(clientId);
        log(`[API Bridge] Sembrado automático de base de datos completado ✓: ${seedRes.message}`);
      } catch (seedErr) {
        log(`[API Bridge Warning] No se pudo realizar el sembrado automático de datos de prueba: ${seedErr.message}`);
      }
    } else {
      log(`[API Bridge] ℹ️  Sembrado de base de datos omitido a petición del desarrollador.`);
    }

    task.status = 'success';
    task.data = result;
    task.listeners.forEach(res => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ type: 'success', data: result })}\n\n`);
        res.end();
      }
    });
    task.listeners = [];

    await ProvisioningStateManager.transitionTo(clientId, 'completed', { taskId });
    await ProvisioningQueue.completeJob(taskId);
  } catch (err) {
    console.error(`[API Bridge] Error durante la creación en segundo plano: ${err.message}`);
    task.status = 'error';
    task.error = err.message;
    task.listeners.forEach(res => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
        res.end();
      }
    });
    task.listeners = [];

    // [P04-03c] Conservar los recursos creados en la nube, IDs, timestamp y error en la metadata.
    // No eliminar recursos automáticamente sin una función explícita de rollback segura.
    try {
      await ProvisioningStateManager.transitionTo(clientId, 'failed', {
        taskId,
        metadata: {
          error: err.message,
          cloudResourcesCreated,
          rollbackStatus: 'pending',
          rollbackErrors: []
        }
      });
      // Mantenemos este comentario técnico dentro de la función para el diseño del rollback en la nube:
      // Si el usuario invoca explícitamente rollbackCloud o la purga de recursos huérfanos:
      // await rollbackCloud(clientId, cloudResourcesCreated); // firebase projects:delete
    } catch (stateErr) {
      console.error(`[API Bridge Error] No se pudo actualizar estado fallido: ${stateErr.message}`);
    }
    await ProvisioningQueue.failJob(taskId, err.message);
  } finally {
    try {
      await ProvisioningStateManager.releaseLock(clientId);
    } catch (lockErr) {
      console.error(`[API Bridge Error] No se pudo liberar lock persistente: ${lockErr.message}`);
    }
    delete projectSyncLocks[clientId];
  }
}

// GET /api/project/instances-categories
// Escanea dinámicamente las carpetas dentro de "D:\PROTOTIPE\Instancias Clientes"
app.get('/api/project/instances-categories', async (req, res) => {
  try {
    const instancesDir = 'D:\\PROTOTIPE\\Instancias Clientes';
    if (!fs.existsSync(instancesDir)) {
      fs.mkdirSync(instancesDir, { recursive: true });
    }
    const files = fs.readdirSync(instancesDir, { withFileTypes: true });
    const categories = files
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    res.json({ categories });
  } catch (err) {
    console.error('[API Bridge Error] Al listar categorías de instancias:', err);
    res.status(500).json({ error: `Error al escanear directorio de instancias: ${err.message}` });
  }
});

// POST /api/project/instances-categories
// Crea una nueva subcarpeta (categoría) dentro de "D:\PROTOTIPE\Instancias Clientes"
app.post('/api/project/instances-categories', async (req, res) => {
  try {
    const { categoryName } = req.body;
    if (!categoryName || typeof categoryName !== 'string') {
      return res.status(400).json({ error: 'Nombre de categoría inválido.' });
    }
    const sanitizedName = categoryName.trim().replace(/[^a-zA-Z0-9-_]/g, '');
    if (!sanitizedName) {
      return res.status(400).json({ error: 'El nombre de categoría contiene caracteres no permitidos.' });
    }
    
    const instancesDir = 'D:\\PROTOTIPE\\Instancias Clientes';
    const targetDir = path.join(instancesDir, sanitizedName);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Devolver lista de categorías actualizada
    const files = fs.readdirSync(instancesDir, { withFileTypes: true });
    const categories = files
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
      
    res.json({ success: true, categories });
  } catch (err) {
    console.error('[API Bridge Error] Al crear categoría de instancias:', err);
    res.status(500).json({ error: `Error al crear categoría de instancia: ${err.message}` });
  }
});

// Endpoint para iniciar el aprovisionamiento de manera asíncrona
app.post('/api/create-project', async (req, res) => {
  projectDirCache.clear();
  
  let answers;
  try {
    answers = normalizeProvisioningEnvelope(req.body);
  } catch (err) {
    return res.status(400).json({ error: `Formato de petición inválido: ${err.message}` });
  }
  
  // Capturar token OAuth enviado desde la sesión web del dashboard
  const devToken = req.headers['x-developer-google-token'];
  if (devToken) {
    answers.developerGoogleToken = devToken;
  }

  if (answers.blueprint.clientName) {
    answers.blueprint.clientName = answers.blueprint.clientName.trim().replace(/[^a-zA-Z0-9\s\-_]/g, '');
  }
  // Coerción y compatibilidad para propiedades planas
  if (!answers.projectName && answers.blueprint?.clientName) {
    answers.projectName = answers.blueprint.clientName;
  }
  if (!answers.clientId && answers.blueprint?.instanceId) {
    answers.clientId = answers.blueprint.instanceId;
  }
  if (answers.firebaseProjectId) {
    answers.firebaseProjectId = answers.firebaseProjectId.trim().replace(/[^a-z0-9\-]/g, '');
  }
  if (answers.blueprint.coreType) {
    answers.blueprint.coreType = answers.blueprint.coreType.trim().replace(/[^a-zA-Z0-9\-_]/g, '');
  }
  
  // [BLIND-1] Coerción defensiva de tipos antes de cualquier validación.
  const numericFields = ['comisionPorcentaje', 'pagoMensualFijo', 'montoFijoServicio', 'costoPorFacturaDian', 'setupFee'];
  for (const field of numericFields) {
    if (answers[field] !== undefined) {
      answers[field] = parseFloat(answers[field]) || 0;
    }
  }
  const booleanFields = ['enableGithub', 'enableFirebaseDeploy', 'enablePwa', 'enablePush',
    'enableBilling', 'enableDianBilling', 'autoProvisionFirebase', 'enableSmokeTest'];
  for (const field of booleanFields) {
    if (answers[field] !== undefined && typeof answers[field] !== 'boolean') {
      answers[field] = answers[field] === 'true' || answers[field] === true || answers[field] === 1;
    }
  }
  if (answers.blueprint.branding && typeof answers.blueprint.branding !== 'object') {
    answers.blueprint.branding = {};
  }
  if (answers.flags && typeof answers.flags !== 'object') {
    answers.flags = {};
  }

  // Validaciones básicas de campos requeridos
  if (!answers.blueprint.coreType) {
    return res.status(400).json({ error: "El campo 'coreType' (template) es obligatorio." });
  }
  if (!answers.blueprint.clientName) {
    return res.status(400).json({ error: "El campo 'clientName' (projectName) es obligatorio." });
  }
  if (!answers.execution.targetPath) {
    return res.status(400).json({ error: "El campo 'targetPath' es obligatorio." });
  }
  if (!answers.blueprint.branding?.paletteChoice) {
    return res.status(400).json({ error: "El campo 'paletteChoice' es obligatorio." });
  }
  if (!answers.centralApiKey) {
    return res.status(400).json({ error: "El campo 'centralApiKey' es obligatorio." });
  }
  if (!answers.centralAppId) {
    return res.status(400).json({ error: "El campo 'centralAppId' es obligatorio." });
  }

  // [BLIND-2] Normalización de colores Hex a HSL antes de la validación y aprovisionamiento
  if (answers.customPrimary) answers.customPrimary = ensureHsl(answers.customPrimary);
  if (answers.customBg) answers.customBg = ensureHsl(answers.customBg);
  if (answers.blueprint.branding) {
    const colorFields = [
      'primaryColor', 'secondaryColor', 'bgColor', 'textColor', 
      'surfaceColor', 'surface2Color', 'borderColor', 'textMutedColor'
    ];
    for (const field of colorFields) {
      if (answers.blueprint.branding[field]) {
        answers.blueprint.branding[field] = ensureHsl(answers.blueprint.branding[field]);
      }
    }
  }

  // Validar contraste de colores HSL si la paleta elegida es custom
  if (answers.blueprint.branding?.paletteChoice === 'custom') {
    const primaryColor = answers.blueprint.branding.primaryColor || answers.customPrimary;
    const bgColor = answers.blueprint.branding.bgColor || answers.customBg || 'hsl(224, 71%, 6%)';
    if (primaryColor) {
      const validation = validateHSLColors(primaryColor, bgColor);
      if (!validation.valid) {
        console.warn(`[API Bridge Warning] Contraste HSL bajo detectado: ${validation.error}`);
      }
    }
  }

  const clientId = answers.blueprint.instanceId || answers.blueprint.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!answers.blueprint.instanceId) {
    answers.blueprint.instanceId = clientId;
  }

  // Generamos un ID de tarea único
  const taskId = `task-create-${clientId}-${Date.now()}`;

  const finalProjectId = answers.firebaseProjectId ? answers.firebaseProjectId.trim() : clientId;
  answers.firebaseProjectId = finalProjectId;

  if (!answers.autoProvisionFirebase) {
    // Si no es automático, validamos que existan las credenciales manuales
    const manualFields = [
      'firebaseApiKey',
      'firebaseAuthDomain',
      'firebaseProjectId',
      'firebaseStorageBucket',
      'firebaseAppId'
    ];
    for (const field of manualFields) {
      if (!answers[field]) {
        return res.status(400).json({ error: `El campo '${field}' es obligatorio para el aprovisionamiento manual.` });
      }
    }
  }

  activeCreationTasks[taskId] = {
    status: 'running',
    logs: [],
    listeners: [],
    data: null,
    error: null
  };

  // Encolar en el gestor de colas de aprovisionamiento (delega ProvisioningStateManager.acquireLock)
  await ProvisioningQueue.enqueue(taskId, clientId, answers);
  registerTaskCleanup(taskId);

  res.json({
    success: true,
    message: 'Aprovisionamiento iniciado en segundo plano y encolado.',
    taskId
  });
});

// Endpoint SSE para el streaming de logs de creación en vivo
app.get('/api/create-project/stream', (req, res) => {
  const { taskId } = req.query;
  if (!taskId || !activeCreationTasks[taskId]) {
    return res.status(404).json({ error: 'ID de tarea de creación no encontrado o expirado.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const task = activeCreationTasks[taskId];

  // Enviar historial acumulado
  task.logs.forEach(line => {
    res.write(`data: ${JSON.stringify({ type: 'log', line })}\n\n`);
  });

  // Si está encolada/procesándose/esperando lock, enviar posición actual en la cola
  const currentPos = ProvisioningQueue.getQueuePosition(taskId);
  if (currentPos > 0) {
    res.write(`data: ${JSON.stringify({ type: 'queue', position: currentPos })}\n\n`);
  }

  if (task.status === 'success') {
    res.write(`data: ${JSON.stringify({ type: 'success', data: task.data })}\n\n`);
    return res.end();
  }

  if (task.status === 'error') {
    res.write(`data: ${JSON.stringify({ type: 'error', message: task.error })}\n\n`);
    return res.end();
  }

  // Registrar respuesta activa en listeners
  task.listeners.push(res);

  const keepAliveInterval = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch (_) {
      clearInterval(keepAliveInterval);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
    task.listeners = task.listeners.filter(l => l !== res);
  });
});

// GET /api/create-project/status
// Permite consultar si un aprovisionamiento está en ejecución, pausado o finalizado, y obtener su historial de logs
app.get('/api/create-project/status', (req, res) => {
  const { taskId } = req.query;
  if (!taskId || !activeCreationTasks[taskId]) {
    return res.json({ active: false });
  }

  const task = activeCreationTasks[taskId];
  res.json({
    active: true,
    status: task.status,
    logs: task.logs,
    pausedForAuth: task.status === 'paused' || task.pausedReason === 'auth_activation_required',
    error: task.error
  });
});

// Endpoint para reanudar el aprovisionamiento pausado por activación manual de Auth
app.post('/api/create-project/resume', (req, res) => {
  const { taskId } = req.body;
  if (!taskId) {
    return res.status(400).json({ error: 'El parámetro "taskId" es obligatorio.' });
  }
  
  const task = activeCreationTasks[taskId];
  if (!task) {
    return res.status(404).json({ error: 'Tarea de creación no encontrada o ya expirada.' });
  }

  if (task.status !== 'paused') {
    return res.json({ success: true, message: 'La tarea no se encuentra en estado pausado.' });
  }

  if (typeof task.resume === 'function') {
    console.log(`[API Bridge] Petición de reanudación recibida para taskId: ${taskId}. Desbloqueando hilo...`);
    task.logs.push(`[API Bridge] Petición de reanudación recibida. Continuando...`);
    task.resume();
    res.json({ success: true, message: 'Aprovisionamiento reanudado exitosamente.' });
  } else {
    res.status(500).json({ error: 'La tarea no tiene registrada una función de reanudación.' });
  }
});

// Endpoint para obtener el estado del ciclo de vida y los bloqueos persistentes de aprovisionamiento
app.get('/api/provisioning/status', async (req, res) => {
  const { clientId } = req.query;
  if (!clientId) {
    return res.status(400).json({ error: "El parámetro 'clientId' es obligatorio." });
  }
  try {
    const stateRecord = await ProvisioningStateManager.getState(clientId);
    const isLocked = await ProvisioningStateManager.isLocked(clientId);
    return res.json({
      state: stateRecord ? stateRecord.state : null,
      isLocked,
      timestamps: stateRecord ? stateRecord.timestamps : null
    });
  } catch (err) {
    res.status(500).json({ error: `Error al consultar estado: ${err.message}` });
  }
});

// GET /api/provisioning/queue — Obtener la cola completa persistente
app.get('/api/provisioning/queue', (req, res) => {
  try {
    const sortedQueue = [...ProvisioningQueue.queue].reverse();
    res.json({ success: true, queue: sortedQueue });
  } catch (err) {
    res.status(500).json({ error: `Error al obtener cola: ${err.message}` });
  }
});

// POST /api/provisioning/queue/cancel — Cancelar un trabajo en cola o en ejecución
app.post('/api/provisioning/queue/cancel', async (req, res) => {
  const { taskId } = req.body;
  if (!taskId) {
    return res.status(400).json({ error: "El parámetro 'taskId' es obligatorio." });
  }
  try {
    const job = ProvisioningQueue.queue.find(j => j.taskId === taskId);
    if (!job) {
      return res.status(404).json({ error: "No se encontró el trabajo especificado en la cola." });
    }
    await ProvisioningQueue.cancelJob(taskId);
    res.json({ success: true, message: `Trabajo ${taskId} cancelado exitosamente.` });
  } catch (err) {
    res.status(500).json({ error: `Error al cancelar trabajo: ${err.message}` });
  }
});

/**
 * Lanza worker_create_project.js como proceso hijo y espera su resultado.
 * Resuelve con el objeto `data` en caso de éxito o rechaza con el mensaje de error.
 * @param {Object} answers Payload completo de aprovisionamiento
 * @param {Function} onLog Callback opcional para capturar logs por IPC
 * @returns {Promise<Object>}
 */
function runCreateProjectWorker(answers, onLog) {
  return new Promise((resolve, reject) => {
    // Aislamiento del fork: no heredar variables innecesarias del proceso padre.
    const SAFE_ENV_ALLOWLIST = new Set([
      'PATH', 'Path', 'PATHEXT',
      'SYSTEMROOT', 'SystemRoot', 'SYSTEMDRIVE', 'SystemDrive',
      'COMSPEC', 'ComSpec',
      'TEMP', 'TMP',
      'APPDATA', 'LOCALAPPDATA',
      'USERPROFILE', 'HOMEDRIVE', 'HOMEPATH', 'USERNAME', 'USER',
      'OS', 'PROCESSOR_ARCHITECTURE', 'ALLUSERSPROFILE', 'PUBLIC',
      'PROGRAMDATA', 'ProgramData',
      'PROGRAMFILES', 'ProgramFiles', 'PROGRAMFILES(X86)', 'ProgramFiles(x86)',
      'COMMONPROGRAMFILES', 'CommonProgramFiles', 'COMMONPROGRAMFILES(X86)', 'CommonProgramFiles(x86)',
      'PROTOTIPE_WORKSPACE_ROOT', 'PROTOTIPE_DOCS_ROOT',
      'ALLOW_CMD_COMPAT_FALLBACK', 'BYPASS_PREFLIGHT',
      'VITE_DEVELOPER_CENTRAL_API_KEY', 'VITE_DEVELOPER_CENTRAL_PROJECT_ID', 'VITE_DEVELOPER_CENTRAL_APP_ID',
      'PORT', 'NODE_ENV', 'FIREBASE_TOKEN', 'ALLOW_TEST_AUTH_BYPASS', 'TEST_AUTH_BYPASS_TOKEN',
      'TASK_CLEANUP_TTL_MS'
    ]);

    const childEnv = {};
    for (const [key, value] of Object.entries(process.env)) {
      const matchedKey = Array.from(SAFE_ENV_ALLOWLIST).find(
        k => k.toLowerCase() === key.toLowerCase()
      );
      if (matchedKey) {
        childEnv[key] = value;
      }
    }

    const child = fork(WORKER_PATH, [], {
      env: childEnv,
      // Silenciar stdio del hijo en el padre; el hijo imprime directamente a consola y manda LOG por IPC
      silent: false
    });

    let settled = false;
    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      fn(value);
    };

    // Timeout de seguridad anti-cuelgue
    const timeoutId = setTimeout(() => {
      if (!child.killed) child.kill('SIGTERM');
      settle(reject, new Error(`Timeout de aprovisionamiento (${WORKER_TIMEOUT_MS / 60000} min) excedido.`));
    }, WORKER_TIMEOUT_MS);

    child.on('message', (msg) => {
      switch (msg?.type) {
        case 'READY':
          // El worker está listo: enviamos el payload
          child.send({ type: 'START', answers });
          break;
        case 'LOG':
          if (onLog) onLog(msg.line);
          break;
        case 'SUCCESS':
          settle(resolve, msg.data);
          break;
        case 'ERROR':
          settle(reject, new Error(msg.message || 'Error desconocido en el worker de aprovisionamiento.'));
          break;
        default:
          break;
      }
    });

    child.on('error', (err) => {
      settle(reject, new Error(`Error al iniciar el worker de aprovisionamiento: ${err.message}`));
    });

    child.on('exit', (code, signal) => {
      if (!settled) {
        // El proceso terminó sin enviar SUCCESS/ERROR (crash inesperado)
        settle(reject, new Error(`El worker de aprovisionamiento terminó inesperadamente (código=${code}, señal=${signal}).`));
      }
    });
  });
}

// Caché en memoria para metadatos de manifiestos de componentes
let componentManifestsCache = {};

// Función auxiliar para extraer el manifiesto JSON de un archivo markdown
async function getComponentManifest(link) {
  try {
    let filePath = link;
    if (filePath.startsWith('file://')) {
      filePath = fileURLToPath(filePath);
    }
    
    if (await fs.pathExists(filePath)) {
      const content = await fs.readFile(filePath, 'utf-8');
      const match = content.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
      if (match) {
        return JSON.parse(match[1]);
      }
    }
  } catch (e) {
    console.warn(`[getComponentManifest] Error parseando manifiesto de ${link}:`, e.message);
  }
  return null;
}

// Endpoint para exponer el catálogo de la Biblioteca de Componentes
app.get('/api/library', async (req, res) => {
  const LIBRARY_README = path.join(getDocumentationRoot(), '06_Biblioteca_Componentes', 'README.md');

  try {
    let content = '';
    if (await fs.pathExists(LIBRARY_README)) {
      content = await fs.readFile(LIBRARY_README, 'utf-8');
    } else {
      return res.status(404).json({ error: 'No se encontró el README.md de la biblioteca.' });
    }

    const categories = [];
    let currentCategory = null;

    const lines = content.split('\n');
    const componentPromises = [];

    for (const line of lines) {
      // Detectar categoría: ### 0. 📂 Nombre...
      const catMatch = line.match(/^###\s+\d+\.\s+\S+\s+(.+?)\s+\(`([^)]+)`\)/u);
      if (catMatch) {
        const catName = catMatch[1].trim();
        const folder = catMatch[2].trim();
        const isModule = folder.includes('09_Modulos_Completos') || catName.toLowerCase().includes('módulo') || catName.toLowerCase().includes('modulo') || line.includes('📦');
        currentCategory = { name: catName, folder, isModule, components: [] };
        categories.push(currentCategory);
        continue;
      }

      // Detectar categoría sin paréntesis: ### 0. 📂 Nombre
      const catMatchSimple = line.match(/^###\s+\d+\.\s+\S+\s+(.+)/u);
      if (catMatchSimple && !catMatch) {
        // Extraer la parte antes del `(`
        const cleanName = catMatchSimple[1].replace(/\s*\(.*/, '').trim();
        const isModule = cleanName.toLowerCase().includes('módulo') || cleanName.toLowerCase().includes('modulo') || line.includes('📦');
        currentCategory = { name: cleanName, folder: '', isModule, components: [] };
        categories.push(currentCategory);
        continue;
      }

      // Detectar componente: * [Nombre (ComponentName)](link): descripción
      const compMatch = line.match(/^\*\s+\[(.+?)\]\(([^)]+)\):\s*(.+)/);
      if (compMatch && currentCategory) {
        // Extraer nombre display y technical name entre paréntesis si existe
        const fullName = compMatch[1].trim();
        const link = compMatch[2].trim();
        const description = compMatch[3].trim();
        // Extraer el nombre técnico entre paréntesis al final del nombre display
        const techMatch = fullName.match(/^(.+?)\s*\(([^)]+)\)$/);
        const displayName = techMatch ? techMatch[1].trim() : fullName;
        const technicalName = techMatch ? techMatch[2].trim() : '';

        const componentObj = {
          name: displayName,
          technicalName,
          description,
          link,
          category: currentCategory.name,
          resourceType: currentCategory.isModule
            ? 'module'
            : (currentCategory.name.toLowerCase().includes('atómico') || link.toLowerCase().includes('componentes_atomicos')
              ? 'atom'
              : 'component'),
          tags: []
        };
        currentCategory.components.push(componentObj);

        componentPromises.push((async () => {
          let manifest = null;
          try {
            let filePath = link;
            if (filePath.startsWith('file://')) {
              filePath = fileURLToPath(filePath);
            }
            if (await fs.pathExists(filePath)) {
              const stats = await fs.stat(filePath);
              const mtime = stats.mtimeMs;
              const cached = componentManifestsCache[link];
              if (cached && cached.mtime === mtime) {
                manifest = cached.manifest;
              } else {
                manifest = await getComponentManifest(link);
                componentManifestsCache[link] = { manifest, mtime };
              }
            }
          } catch (e) {
            console.warn(`[API /library] Error leyendo mtime de ${link}:`, e.message);
          }

          if (manifest) {
            if (manifest.technicalName) {
              componentObj.technicalName = manifest.technicalName;
            }
            if (Array.isArray(manifest.niches)) {
              componentObj.niches = manifest.niches;
              manifest.niches.forEach(n => {
                if (n) componentObj.tags.push(n);
              });
            }
            if (manifest.type) {
              componentObj.resourceType = manifest.type;
              componentObj.tags.push(manifest.type);
            }
          }

          const baseTags = buildTags(displayName, componentObj.technicalName || technicalName, description, componentObj.category);
          componentObj.tags = [...new Set([...componentObj.tags, ...baseTags])];
        })());
        continue;
      }

      // Detectar "pendiente" markers para notar el estado
      if (line.includes('*Pendiente por registrar:*') && currentCategory) {
        const pendingMatch = line.match(/\*Pendiente por registrar:\*\s*(.+)/);
        if (pendingMatch) {
          currentCategory.pendingItems = pendingMatch[1].trim().replace(/\.$/, '');
        }
      }
    }

    await Promise.all(componentPromises);

    // ── Reagrupar por tipo (UI / Módulos / Hooks / Servicios) ──────────────────
    // Aplana todos los componentes de todos los nichos y los redistribuye en
    // 5 buckets semánticos según su resourceType. Los nichos quedan como tags.
    const TYPE_GROUPS = [
      { typeKey: 'atom',      label: 'Componentes Atómicos', icon: '⚛️', description: 'Elementos visuales y de interfaz mínimos e indivisibles' },
      { typeKey: 'component', label: 'Componentes UI',  icon: '🧩', description: 'Elementos visuales y de interfaz reutilizables' },
      { typeKey: 'module',    label: 'Módulos',         icon: '📦', description: 'Flujos completos de negocio listos para inyectar' },
      { typeKey: 'hook',      label: 'Hooks',           icon: '⚡', description: 'Lógica de estado y efectos reutilizables' },
      { typeKey: 'service',   label: 'Servicios',       icon: '🔌', description: 'Conectores, Firebase, APIs y utilidades de backend' },
    ];

    const allComponents = categories.flatMap(cat => cat.components);
    const totalComponents = allComponents.length;

    const regrouped = TYPE_GROUPS.map(group => ({
      name: group.label,
      icon: group.icon,
      description: group.description,
      typeKey: group.typeKey,
      folder: group.typeKey,
      isModule: group.typeKey === 'module',
      components: allComponents
        .filter(comp => comp.resourceType === group.typeKey)
        .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })),
    }));

    res.json({
      success: true,
      totalComponents,
      categories: regrouped,
    });
  } catch (err) {
    console.error(`[API /library] Error al parsear catálogo: ${err.message}`);
    res.status(500).json({ error: `Error al procesar la biblioteca: ${err.message}` });
  }
});

// Endpoint para exponer el archivo crudo de un componente de la biblioteca
app.get('/api/library/file', async (req, res) => {
  const { fileUri } = req.query;

  if (!fileUri) {
    return res.status(400).json({ error: 'El parámetro "fileUri" es obligatorio.' });
  }

  try {
    // Decodificar y resolver la ruta absoluta canónica real
    let rawPath = fileUri.replace(/^file:\/\/\//, '');
    rawPath = decodeURIComponent(rawPath);

    // Dar soporte a rutas que usan "Biblioteca de Componentes" (del README) mapeándolas a la carpeta física "06_Biblioteca_Componentes"
    if (rawPath.toLowerCase().includes('biblioteca de componentes')) {
      rawPath = rawPath.replace(/biblioteca de componentes/i, '06_Biblioteca_Componentes');
    }

    const baseDocDir = path.resolve(getDocumentationRoot());
    const filePath = path.resolve(rawPath);

    // Validación estricta canónica para evitar directory traversal
    if (!isPathContained(baseDocDir, filePath)) {
      return res.status(403).json({ error: 'Acceso denegado. La ruta está fuera del directorio de documentación del proyecto.' });
    }

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: `El archivo solicitado no existe en la ruta física: ${filePath}` });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    res.json({
      success: true,
      content
    });
  } catch (err) {
    console.error(`[API /library/file] Error al leer archivo: ${err.message}`);
    res.status(500).json({ error: `Error al leer el archivo: ${err.message}` });
  }
});

// Endpoint para extraer un componente de código hacia la biblioteca compartida
app.post('/api/library/extract', async (req, res) => {
  const { sourceFilePath, targetName, category, description } = req.body;
  if (!sourceFilePath || !targetName || !category) {
    return res.status(400).json({ error: 'Los campos "sourceFilePath", "targetName" y "category" son obligatorios.' });
  }

  // Resolver la ruta física del archivo
  let cleanSourcePath = sourceFilePath.replace(/^file:\/\/\//, '');
  cleanSourcePath = decodeURIComponent(cleanSourcePath);
  const sourceFile = path.resolve(cleanSourcePath);

  if (!await fs.pathExists(sourceFile)) {
    return res.status(404).json({ error: `El archivo de origen no existe: ${sourceFile}` });
  }

  // Prevención de Path Traversal: validar contención en el workspace root
  if (!isPathContained(getWorkspaceRoot(), sourceFile)) {
    return res.status(403).json({ error: 'Acceso denegado: El archivo de origen debe estar dentro del espacio de trabajo del proyecto.' });
  }

  // Ruta destino de la biblioteca (soporte dinámico para Módulos Completos)
  const baseDocDir = path.resolve(getDocumentationRoot());
  const cleanCategory = category.replace(/^\//, '');
  const isModuleCategory = cleanCategory.includes('09_Modulos_Completos');
  const categoryFolder = isModuleCategory 
    ? path.join(baseDocDir, cleanCategory)
    : path.join(baseDocDir, '06_Biblioteca_Componentes', cleanCategory);
  const componentFolder = path.join(categoryFolder, targetName);
  const targetDocFile = path.join(componentFolder, `${targetName.toLowerCase()}.md`);

  try {
    await fs.ensureDir(componentFolder);

    // Copiar el archivo o leer su contenido para documentar
    const codeContent = await fs.readFile(sourceFile, 'utf-8');

    // Generar el Markdown de documentación estándar (Formato estricto de 5 puntos)
    const mdContent = `# ${targetName.replace(/_/g, ' ')}
    
## 1. Propósito y Casos de Uso
${description || 'Componente reutilizable extraído automáticamente.'}

---

## 2. Especificación Visual y Estilos
* Estilos basados en Tailwind CSS y variables de tema HSL corporativas.
* Diseño responsivo con soporte premium para micro-interacciones (hover, active, transition).

---

## 3. Código React Completo y 100% Funcional
\`\`\`jsx
${codeContent}
\`\`\`

---

## 4. Lógica de Estado y Ciclo de Vida
* Hook/Zustand State Management integrado (si aplica).
* Propagación de eventos limpia mediante callbacks (\`onClick\`, \`onChange\`, etc.).

---

## 5. Secuencia de Interacción
\`\`\`mermaid
graph TD
    User([Usuario]) -->|Interacción| Comp[${targetName}]
    Comp -->|Evento / Callback| App([Aplicación])
\`\`\`
`;

    // Escribir el markdown
    await fs.writeFile(targetDocFile, mdContent, 'utf-8');

    // Actualizar el README.md de 06_Biblioteca_Componentes para catalogarlo
    const readmePath = path.join(baseDocDir, '06_Biblioteca_Componentes', 'README.md');
    if (await fs.pathExists(readmePath)) {
      let readme = await fs.readFile(readmePath, 'utf-8');
      
      // Encontrar la categoría correspondiente e insertar buscando por el nombre técnico de la carpeta entre paréntesis
      const escapedFolder = cleanCategory.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const categoryRegex = new RegExp(`(###\\s+\\d+\\.\\s+\\S+.*?\\(\`?\\/?${escapedFolder}\`?\\).*?\\n)([\\s\\S]*?)(?=\\n###\\s+\\d+\\.\\s+\\S+|\\n---|\\n$)`, 'i');
      
      const match = readme.match(categoryRegex);
      if (match) {
        const categoryHeader = match[1];
        let categoryContent = match[2];
        
        // Construir la URL relativa del componente/módulo para evitar enlaces rotos
        const relativeUrlPath = isModuleCategory ? cleanCategory : `06_Biblioteca_Componentes/${cleanCategory}`;
        const docRootUrl = `file:///${baseDocDir.replace(/\\/g, '/')}`;
        const componentRef = `* [${targetName.replace(/_/g, ' ')} (${targetName})](${docRootUrl}/${relativeUrlPath}/${targetName}/${targetName.toLowerCase()}.md): ${description || 'Componente/Módulo extraído.'}`;
        
        if (!categoryContent.includes(`(${targetName})`)) {
          // Agregar debajo del header de la categoría
          categoryContent = `\n${componentRef}\n${categoryContent}`;
          const newCategoryBlock = categoryHeader + categoryContent;
          readme = readme.replace(match[0], newCategoryBlock);
          await fs.writeFile(readmePath, readme, 'utf-8');
        }
      }
    }

    // Actualizar el mapa_documentacion_ia.md para sincronizar la documentación
    const mapaDocPath = path.join(baseDocDir, '04_Estandares_y_Skills', 'mapa_documentacion_ia.md');
    if (await fs.pathExists(mapaDocPath)) {
      let mapaDoc = await fs.readFile(mapaDocPath, 'utf-8');
      if (!mapaDoc.includes(`${targetName.toLowerCase()}.md`)) {
        const insertRegex = /(\|\\s+\\*\\*README\\.md\\*\\*\\s+\\|[\\s\\S]*?\\|)/i;
        const matchTable = mapaDoc.match(insertRegex) || mapaDoc.match(/(\| \*\*README\.md\*\* \|[\s\S]*?\|)/i);
        if (matchTable) {
          const relativeUrlPath = isModuleCategory ? cleanCategory : `06_Biblioteca_Componentes/${cleanCategory}`;
          const docRootUrl = `file:///${baseDocDir.replace(/\\/g, '/')}`;
          const newRow = `\n| **${targetName.toLowerCase()}.md** | Ficha del componente ${targetName} | Componente extraído de la aplicación local. | [Ver Componente](${docRootUrl}/${relativeUrlPath}/${targetName}/${targetName.toLowerCase()}.md) |`;
          mapaDoc = mapaDoc.replace(matchTable[1], matchTable[1] + newRow);
          await fs.writeFile(mapaDocPath, mapaDoc, 'utf-8');
        }
      }
    }

    res.json({
      success: true,
      message: `Componente "${targetName}" extraído y documentado con éxito.`,
      docPath: targetDocFile
    });
  } catch (err) {
    console.error(`[API /library/extract] Error al extraer componente: ${err.message}`);
    res.status(500).json({ error: `Error en la extracción: ${err.message}` });
  }
});

// ─── Extractor de código robusto con 4 estrategias en cascada ───────────────
// Estrategia 1: heading numerado con "Código" o "Codigo"
// Estrategia 2: heading "## Código React Completo" sin número
// Estrategia 3: primer bloque de código jsx/js/ts del archivo
// Si ninguna funciona, devuelve null
function extractCodeFromMarkdown(md) {
  if (!md || typeof md !== 'string') return null;
  let match;
  // E1: ## 3. Código React Completo ...
  match = md.match(/##\s+\d+\..*?C[óo]digo[^\r\n]*\r?\n[\s\S]*?```(?:javascript|jsx|js|tsx|ts)\r?\n([\s\S]*?)```/i);
  if (match) return match[1].trim();
  // E2: ## Código React Completo (sin número)
  match = md.match(/##\s+C[óo]digo[^\r\n]*\r?\n[\s\S]*?```(?:javascript|jsx|js|tsx|ts)\r?\n([\s\S]*?)```/i);
  if (match) return match[1].trim();
  // E3: primer bloque jsx/js del archivo (fallback liberal)
  match = md.match(/```(?:javascript|jsx|js|tsx|ts)\r?\n([\s\S]*?)```/);
  if (match) return match[1].trim();
  return null;
}

// Helper to recursively find if a file named cleanName (without extension) exists in projectDir/src
async function findInternalFile(projectDir, name, type) {
  const commonPaths = [];
  const nameClean = name.replace(/\.(jsx|js|tsx|ts)$/, '');
  
  if (type === 'hook') {
    commonPaths.push(
      path.join(projectDir, 'src/hooks', `${nameClean}.js`),
      path.join(projectDir, 'src/hooks', `${nameClean}.jsx`)
    );
  } else if (type === 'service') {
    commonPaths.push(
      path.join(projectDir, 'src/services', `${nameClean}.js`),
      path.join(projectDir, 'src/services', `${nameClean}.jsx`)
    );
  } else if (type === 'ui' || type === 'common' || type === 'component') {
    commonPaths.push(
      path.join(projectDir, 'src/components/ui', `${nameClean}.jsx`),
      path.join(projectDir, 'src/components/common', `${nameClean}.jsx`),
      path.join(projectDir, 'src/components', `${nameClean}.jsx`),
      path.join(projectDir, 'src/components/ui', `${nameClean}.js`),
      path.join(projectDir, 'src/components/common', `${nameClean}.js`),
      path.join(projectDir, 'src/components', `${nameClean}.js`)
    );
  } else {
    commonPaths.push(
      path.join(projectDir, 'src/hooks', `${nameClean}.js`),
      path.join(projectDir, 'src/hooks', `${nameClean}.jsx`),
      path.join(projectDir, 'src/components/ui', `${nameClean}.jsx`),
      path.join(projectDir, 'src/components/common', `${nameClean}.jsx`),
      path.join(projectDir, 'src/services', `${nameClean}.js`),
      path.join(projectDir, 'src/utils', `${nameClean}.js`)
    );
  }

  for (const p of commonPaths) {
    if (await fs.pathExists(p)) {
      return p;
    }
  }
  
  const srcDir = path.join(projectDir, 'src');
  if (await fs.pathExists(srcDir)) {
    try {
      const foundPath = await searchFileRecursive(srcDir, nameClean);
      if (foundPath) return foundPath;
    } catch (err) {
      console.error(`[findInternalFile] Error en búsqueda recursiva: ${err.message}`);
    }
  }

  return null;
}

async function searchFileRecursive(dir, nameClean, depth = 0, maxDepth = 5) {
  if (depth >= maxDepth) return null;
  const items = await fs.readdir(dir).catch(() => []);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath).catch(() => null);
    if (!stat) continue;
    if (stat.isDirectory()) {
      const res = await searchFileRecursive(fullPath, nameClean, depth + 1, maxDepth);
      if (res) return res;
    } else {
      const ext = path.extname(item);
      const base = path.basename(item, ext);
      if (base === nameClean && ['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        return fullPath;
      }
    }
  }
  return null;
}

async function findClientCSSFile(projectDir) {
  const commonPaths = [
    'src/index.css',
    'src/global.css',
    'src/styles/global.css',
    'src/styles.css',
    'src/App.css'
  ];
  for (const relPath of commonPaths) {
    const full = path.join(projectDir, relPath);
    if (await fs.pathExists(full)) {
      return relPath;
    }
  }

  const srcDir = path.join(projectDir, 'src');
  if (!await fs.pathExists(srcDir)) return null;

  async function scanDir(dir) {
    const entries = await fs.readdir(dir).catch(() => []);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = await fs.stat(fullPath).catch(() => null);
      if (stat && stat.isDirectory()) {
        const found = await scanDir(fullPath);
        if (found) return found;
      } else if (stat && stat.isFile() && entry.endsWith('.css')) {
        return path.relative(projectDir, fullPath);
      }
    }
    return null;
  }

  return await scanDir(srcDir);
}

function extractCSSVarsFromCode(code) {
  const regex = /var\((--[a-zA-Z0-9_-]+)\)/g;
  const vars = new Set();
  let match;
  while ((match = regex.exec(code)) !== null) {
    vars.add(match[1]);
  }
  return Array.from(vars);
}

function getResourceTypeFromPath(filePath) {
  const p = filePath.toLowerCase();
  if (p.includes('logica_y_hooks') || p.includes('hooks')) return 'hook';
  if (p.includes('servicios') || p.includes('services')) return 'service';
  if (p.includes('componentes_atomicos') || p.includes('atomicos') || p.includes('atom')) return 'atom';
  return 'ui';
}

function getDefaultRelativePath(name, type, mdFilePath = '', manifest = null) {
  const cleanName = name.replace(/\.(js|jsx|ts|tsx)$/, '');

  // CORE-124 — NIVEL 1: targetPath declarativo en el manifest (máxima precisión)
  if (manifest?.targetPath) {
    return manifest.targetPath.replace(/{technicalName}/g, cleanName);
  }

  // NIVEL 2: type explícito del manifest/dependencia interna
  if (type === 'hook') return `src/hooks/${cleanName}.js`;
  if (type === 'service') return `src/services/${cleanName}.js`;
  if (type === 'util' || type === 'utility') return `src/utils/${cleanName}.js`;
  if (type === 'page') return `src/pages/${cleanName}.jsx`;
  if (type === 'atom') return `src/components/ui/${cleanName}.jsx`;

  // NIVEL 3: Heurística por subcarpeta física de la biblioteca (fallback robusto)
  const p = mdFilePath.toLowerCase();
  if (p.includes('logica_y_hooks') || p.includes('/hooks/')) return `src/hooks/${cleanName}.js`;
  if (p.includes('servicios_y_firebase') || p.includes('/servicios/')) return `src/services/${cleanName}.js`;
  if (p.includes('utilidades') || p.includes('/utils/')) return `src/utils/${cleanName}.js`;
  if (p.includes('paginas') || p.includes('/pages/')) return `src/pages/${cleanName}.jsx`;
  if (p.includes('modulos_completos') || type === 'module') return `src/components/modules/${cleanName}.jsx`;
  if (p.includes('componentes_atomicos') || p.includes('/componentes_atomicos/') || type === 'atom') return `src/components/ui/${cleanName}.jsx`;

  // NIVEL 3b: Componentes de negocio de verticales sectoriales → common/
  const SECTOR_VERTICALS = [
    '/contractors/', '/carpentry/', '/machinery_rental/',
    '/refrigeration_ac/', '/technical_services/', '/wellness_podology/',
    '/grocery_food/', '/laundry/', '/furniture_repair/',
    '/insumos-agricolas/', '/alimentos-artesanales/', '/ferreteria-rural/',
    '/repuestos-motos/', '/distribuidoras-beauty/', '/petshops-locales/',
    '/repuestos-lineablanca/', '/moda-local-calzado/', '/alimentacion-saludable/',
    '/licores-cocteleria/', '/coleccionismo-geek/', '/distribucion-horeca/',
    '/home-office-ergonomia/',
  ];
  if (SECTOR_VERTICALS.some(v => p.includes(v))) return `src/components/common/${cleanName}.jsx`;

  // Retrocompatibilidad ecommerce/pedidos/reservas/fidelización → common
  if (p.includes('pedidos') || p.includes('reservas') || p.includes('ecommerce') || p.includes('fideliza')) return `src/components/common/${cleanName}.jsx`;

  // NIVEL 4: Fallback universal — componentes UI / átomos
  return `src/components/ui/${cleanName}.jsx`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE-123 HELPERS — Sistema de Instalación Inteligente de Componentes
// Todas las funciones son puras (sin efectos secundarios externos directos)
// y utilizan los mismos patterns de seguridad del resto del servidor.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analiza el código de un componente para auto-detectar sus dependencias
 * cuando no existe un bloque manifest <!-- {} -->.
 * @param {string} code — Código JSX/JS extraído del .md
 * @returns {{ npm: string[], envVars: string[], firebaseImports: boolean, relativeImports: string[], cssVars: string[] }}
 */
function analyzeCodeDependencies(code) {
  const result = { npm: [], envVars: [], firebaseImports: false, relativeImports: [], cssVars: [] };
  if (!code) return result;

  // A) Paquetes NPM externos (no empiezan con . o / — son paquetes de node_modules)
  const npmSet = new Set();
  const npmPattern = /^import\s+(?:[\s\S]*?)\s+from\s+['"]([^./'\"][^'"]*)['"]/gm;
  let m;
  while ((m = npmPattern.exec(code)) !== null) {
    const pkg = m[1].split('/')[0]; // Solo el nombre raíz del paquete (ej. 'framer-motion')
    if (!pkg.startsWith('@types')) npmSet.add(pkg);
  }
  result.npm = [...npmSet];

  // B) Variables de entorno Vite
  const envSet = new Set();
  const envPattern = /import\.meta\.env\.(VITE_[A-Z_0-9]+)/g;
  while ((m = envPattern.exec(code)) !== null) envSet.add(m[1]);
  result.envVars = [...envSet];

  // C) Detectar si el componente importa Firebase
  result.firebaseImports = /from\s+['"](?:firebase\/|\.+\/.*(?:firebase|firebaseConfig|config\/firebase))['"]/i.test(code);

  // D) Imports relativos internos del proyecto (empiezan con ./ o ../)
  const relSet = new Set();
  const relPattern = /^import\s+(?:[\s\S]*?)\s+from\s+['"](\.[^'"]+)['"]/gm;
  while ((m = relPattern.exec(code)) !== null) relSet.add(m[1]);
  result.relativeImports = [...relSet];

  // E) CSS Custom Properties usadas (var(--nombre))
  const cssSet = new Set();
  const cssPattern = /var\(--([a-zA-Z0-9-]+)\)/g;
  while ((m = cssPattern.exec(code)) !== null) cssSet.add(m[1]);
  result.cssVars = [...cssSet];

  return result;
}

/**
 * Escanea recursivamente todo el árbol de dependencias del componente para extraer
 * el conjunto unificado de variables de entorno VITE_* requeridas.
 */
async function extractAllEnvVarsRecursively(componentLink, baseDocDir, visited = new Set()) {
  if (visited.has(componentLink)) return [];
  visited.add(componentLink);

  let rawPath = componentLink.replace(/^file:\/\/\//, '');
  rawPath = decodeURIComponent(rawPath);
  if (rawPath.toLowerCase().includes('biblioteca de componentes')) {
    rawPath = rawPath.replace(/biblioteca de componentes/i, '06_Biblioteca_Componentes');
  }
  const filePath = path.resolve(rawPath);
  if (!isPathContained(baseDocDir, filePath) || !await fs.pathExists(filePath)) return [];

  const md = await fs.readFile(filePath, 'utf-8');
  const code = extractCodeFromMarkdown(md);
  const localVars = code ? analyzeCodeDependencies(code).envVars : [];

  // Buscar manifest y dependencias internas recursivamente
  const manifestMatch = md.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
  let internalVars = [];
  if (manifestMatch) {
    try {
      const manifest = JSON.parse(manifestMatch[1]);
      if (manifest.dependencies?.internal) {
        for (const dep of manifest.dependencies.internal) {
          if (dep.link) {
            const nestedVars = await extractAllEnvVarsRecursively(dep.link, baseDocDir, visited);
            internalVars = internalVars.concat(nestedVars);
          }
        }
      }
    } catch {}
  }

  return [...new Set([...localVars, ...internalVars])];
}

async function extractAllCSSVarsRecursively(componentLink, baseDocDir, visited = new Set()) {
  if (visited.has(componentLink)) return [];
  visited.add(componentLink);

  let rawPath = componentLink.replace(/^file:\/\/\//, '');
  rawPath = decodeURIComponent(rawPath);
  if (rawPath.toLowerCase().includes('biblioteca de componentes')) {
    rawPath = rawPath.replace(/biblioteca de componentes/i, '06_Biblioteca_Componentes');
  }
  const filePath = path.resolve(rawPath);
  if (!isPathContained(baseDocDir, filePath) || !await fs.pathExists(filePath)) return [];

  const md = await fs.readFile(filePath, 'utf-8');
  const code = extractCodeFromMarkdown(md);
  
  // 1. Extraer variables CSS del código
  const localVars = code ? extractCSSVarsFromCode(code) : [];

  // 2. Extraer del manifest del .md y buscar subdependencias
  const manifestMatch = md.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
  let manifestVars = [];
  let internalVars = [];

  if (manifestMatch) {
    try {
      const manifest = JSON.parse(manifestMatch[1]);
      if (manifest.cssVariables && Array.isArray(manifest.cssVariables)) {
        manifestVars = manifest.cssVariables;
      }
      if (manifest.dependencies?.internal) {
        for (const dep of manifest.dependencies.internal) {
          if (dep.link) {
            const nestedVars = await extractAllCSSVarsRecursively(dep.link, baseDocDir, visited);
            internalVars = internalVars.concat(nestedVars);
          }
        }
      }
    } catch {}
  }

  return [...new Set([...localVars, ...manifestVars, ...internalVars])];
}

/**
 * Escribe las variables de entorno configuradas/faltantes en el .env.local del cliente,
 * evitando duplicación y sobrescribiendo placeholders de forma inteligente.
 */
async function writeEnvVarsToClient(projectDir, envVars, envValues = {}, primaryCompName = 'Componente') {
  if (!envVars || envVars.length === 0) return;
  const envPath = path.join(projectDir, '.env.local');
  let envContent = '';
  if (await fs.pathExists(envPath)) {
    envContent = await fs.readFile(envPath, 'utf-8');
  }

  const newLines = [];
  let modified = false;

  for (const v of envVars) {
    const rawVal = envValues[v];
    const hasUserValue = rawVal !== undefined && rawVal.trim() !== '';
    let finalVal = hasUserValue ? rawVal.trim() : `TU_VALOR_AQUI_${v}`;
    // Escapar comillas dobles internas para no romper dotenv
    finalVal = finalVal.replace(/"/g, '\\"');
    
    // Si contiene espacios o caracteres especiales, los protegemos
    const formattedLine = `${v}="${finalVal}"`;
    const regex = new RegExp('^' + v + '\\s*=.*$', 'm');

    if (regex.test(envContent)) {
      // Si ya existe en el archivo
      const existingLine = envContent.match(regex)[0];
      const isPlaceholder = existingLine.includes('TU_VALOR_AQUI');
      
      // Sobrescribimos el valor si el usuario ingresó un valor real o si la línea actual es un placeholder
      if (hasUserValue || isPlaceholder) {
        envContent = envContent.replace(regex, formattedLine);
        modified = true;
      }
    } else {
      // No existe, la agregamos al bloque nuevo
      newLines.push(formattedLine);
    }
  }

  if (newLines.length > 0) {
    if (envContent && !envContent.endsWith('\n')) envContent += '\n';
    envContent += `\n# Variables requeridas por ${primaryCompName} (agregadas por Prototipe)\n` + newLines.join('\n') + '\n';
    modified = true;
  }

  if (modified || newLines.length > 0) {
    await fs.writeFile(envPath, envContent, 'utf-8');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE-127: Sistema de Auditoría Inmutable — Helpers de escritura
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cola de escritura asíncrona para append-only JSONL.
 * Garantiza escrituras serializadas sin race conditions.
 */
class WriteQueue {
  constructor() { this._queue = Promise.resolve(); }
  push(fn) {
    this._queue = this._queue.then(() => fn().catch(e => console.error('[WriteQueue]', e.message)));
    return this._queue;
  }
}
const _auditWriteQueues = new Map(); // keyed by file path (jsonl OR markdown)

function getAuditQueue(filePath) {
  if (!_auditWriteQueues.has(filePath)) _auditWriteQueues.set(filePath, new WriteQueue());
  return _auditWriteQueues.get(filePath);
}

/**
 * Escribe una entrada inmutable al JSONL de auditoría del cliente.
 * Escritura append-only, atómica via cola serializada.
 * @param {string} clientId
 * @param {object} entry - Datos de la operación a auditar
 */
async function appendAuditTrailEntry(clientId, entry) {
  try {
    const projectDir = await findProjectDir(clientId);
    if (!projectDir) return;
    const jsonlPath = path.join(projectDir, '.prototipe-audit-trail.jsonl');
    const line = JSON.stringify({
      ...entry,
      clientId,
      schemaVersion: 1,
      _immutable: true
    }) + '\n';
    getAuditQueue(jsonlPath).push(() => fs.appendFile(jsonlPath, line, 'utf-8'));
    // También escribir en Documentación de forma asíncrona
    writeAuditMarkdown(clientId, entry).catch(e => console.warn('[CORE-127] Markdown audit error:', e.message));
  } catch (e) {
    console.warn('[CORE-127] appendAuditTrailEntry error:', e.message);
  }
}

/**
 * Escribe/actualiza el archivo Markdown de historial en 10_Historial_Inyecciones/
 * Mantiene un índice + secciones cronológicas. Escritura atómica (tmp → rename).
 */
async function writeAuditMarkdown(clientId, entry) {
  try {
    const docRoot = path.resolve(getDocumentationRoot());
    const histDir = path.join(docRoot, '10_Historial_Inyecciones');
    await fs.ensureDir(histDir);

    const mdPath = path.join(histDir, `historial_${clientId}.md`);
    const indexPath = path.join(histDir, 'INDEX.md');

    // ── Construir sección nueva ──
    const ts = entry.timestamp || new Date().toISOString();
    const icon = entry.operation === 'inject' ? '📦' : entry.operation === 'rollback' ? '↩️' : entry.operation === 'auto-rollback' ? '🛡️' : '🔧';
    const statusBadge = entry.status === 'success' ? '✅' : entry.status === 'error' ? '❌' : '⚠️';
    const compName = entry.primaryComponent?.name || entry.componentId || 'desconocido';
    const targetPath = entry.primaryComponent?.targetPath || entry.targetPath || '-';
    const buildStatus = entry.buildLog?.status || 'N/A';
    const buildIcon = buildStatus === 'success' ? '✅' : buildStatus === 'error' ? '❌' : '⚠️';

    const depsSection = Array.isArray(entry.dependencies) && entry.dependencies.length > 0
      ? '\n**Dependencias inyectadas:**\n' + entry.dependencies.map(d => `- \`${d.name}\` → \`${d.targetPath}\``).join('\n')
      : '';
    const npmSection = Array.isArray(entry.npmPackages) && entry.npmPackages.length > 0
      ? '\n**Paquetes NPM instalados:**\n' + entry.npmPackages.map(p => `- \`${p.name}@${p.version}\` (${p.status})`).join('\n')
      : '';
    const envSection = Array.isArray(entry.envVarsConfigured) && entry.envVarsConfigured.length > 0
      ? '\n**Variables de entorno configuradas:**\n' + entry.envVarsConfigured.map(v => `- \`${v}\``).join('\n')
      : '';
    const checksumSection = entry.primaryComponent?.checksum
      ? `\n**SHA-256 (12 chars):** \`${entry.primaryComponent.checksum}\``
      : '';

    const newSection = `\n---\n\n## ${icon} ${ts.slice(0, 19).replace('T', ' ')} — ${statusBadge} ${entry.operation.toUpperCase()}: ${compName}\n\n| Campo | Valor |\n|---|---|\n| **Cliente** | \`${clientId}\` |\n| **Operación** | \`${entry.operation}\` |\n| **Estado** | ${statusBadge} \`${entry.status}\` |\n| **Ruta destino** | \`${targetPath}\` |\n| **Build** | ${buildIcon} \`${buildStatus}\` |\n| **ID de entrada** | \`${entry.id}\` |\n| **Timestamp** | \`${ts}\` |\n${depsSection}${npmSection}${envSection}${checksumSection}\n`;

    // ── Leer o crear el archivo Markdown del cliente ──
    let mdContent = '';
    if (await fs.pathExists(mdPath)) {
      mdContent = await fs.readFile(mdPath, 'utf-8');
    } else {
      mdContent = `# 📋 Historial de Inyecciones — Cliente: \`${clientId}\`\n\n> Archivo generado automáticamente por Prototipe CLI — CORE-127\n> **NO modificar manualmente.** Es un registro de auditoría inmutable.\n`;
    }
    mdContent += newSection;

    // ── Escritura atómica del historial de cliente (serializada por WriteQueue) ──
    await getAuditQueue(mdPath).push(async () => {
      const tmpMd = mdPath + '.tmp';
      await fs.writeFile(tmpMd, mdContent, 'utf-8');
      await fs.rename(tmpMd, mdPath);
    });

    // ── Actualizar índice global (serializado por su propia WriteQueue) ──
    await getAuditQueue(indexPath).push(async () => {
      let indexContent = '';
      if (await fs.pathExists(indexPath)) {
        indexContent = await fs.readFile(indexPath, 'utf-8');
      } else {
        indexContent = `# 🗂️ Índice de Historiales de Inyección — Prototipe\n\n> Generado automáticamente por CORE-127\n\n| Cliente | Última Operación | Timestamp | Estado |\n|---|---|---|---|\n`;
      }
      const rowRegex = new RegExp(`\\| \`${clientId}\` \\|.*`);
      const newRow = `| \`${clientId}\` | \`${entry.operation}\` | \`${ts.slice(0, 19).replace('T', ' ')}\` | ${statusBadge} |`;
      if (rowRegex.test(indexContent)) {
        indexContent = indexContent.replace(rowRegex, newRow);
      } else {
        indexContent += newRow + '\n';
      }
      const tmpIdx = indexPath + '.tmp';
      await fs.writeFile(tmpIdx, indexContent, 'utf-8');
      await fs.rename(tmpIdx, indexPath);
    });
  } catch (e) {
    console.warn('[CORE-127] writeAuditMarkdown error:', e.message);
  }
}

/**
 * Prueba el stack tecnológico del proyecto cliente destino.
 * Lee: vite.config.js (alias @/), package.json (deps), .env.local (vars definidas),
 * y busca el archivo de configuración de Firebase.
 * @param {string} projectDir — Ruta absoluta del directorio del proyecto cliente
 * @returns {Promise<{hasAtAlias, hasTailwind, hasTypeScript, firebaseConfigRelPath, installedPackages, envVarsDefined}>}
 */
async function probeTargetStack(projectDir) {
  const result = {
    hasAtAlias: false,
    hasTailwind: false,
    hasTypeScript: false,
    firebaseConfigRelPath: null, // ruta relativa desde src/ al firebase config
    installedPackages: {},       // { packageName: version }
    envVarsDefined: []           // nombres de vars definidas en .env.local
  };

  try {
    // 1. Leer package.json para dependencias y TypeScript
    const pkgPath = path.join(projectDir, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      result.installedPackages = allDeps;
      result.hasTailwind = 'tailwindcss' in allDeps || '@tailwindcss/vite' in allDeps;
      result.hasTypeScript = 'typescript' in allDeps;
    }

    // 2. Leer vite.config.js para alias @/
    const viteConfigPath = path.join(projectDir, 'vite.config.js');
    if (await fs.pathExists(viteConfigPath)) {
      const viteContent = await fs.readFile(viteConfigPath, 'utf-8');
      result.hasAtAlias = /'@'\s*:|"@"\s*:|alias.*@.*fileURLToPath|@.*import\.meta\.url/.test(viteContent);
    }

    // 3. Leer .env.local para variables de entorno definidas
    const envPath = path.join(projectDir, '.env.local');
    if (await fs.pathExists(envPath)) {
      const envContent = await fs.readFile(envPath, 'utf-8');
      const definedVars = envContent.match(/^(VITE_[A-Z_0-9]+)\s*=/gm) || [];
      result.envVarsDefined = definedVars.map(v => v.replace(/\s*=.*/, '').trim());
    }

    // 4. Buscar archivo de configuración de Firebase en 6 ubicaciones canónicas
    const firebaseSearchPaths = [
      'src/config/firebaseConfig.js',
      'src/config/firebase.js',
      'src/firebase.js',
      'src/services/firebase.js',
      'src/lib/firebase.js',
      'src/firebaseConfig.js'
    ];
    for (const relFbPath of firebaseSearchPaths) {
      if (await fs.pathExists(path.join(projectDir, relFbPath))) {
        result.firebaseConfigRelPath = relFbPath;
        break;
      }
    }
  } catch (probeErr) {
    console.warn(`[probeTargetStack] Error leyendo stack de ${path.basename(projectDir)}: ${probeErr.message}`);
  }

  return result;
}

/**
 * Reescribe los imports relativos (../ y ./) en el código inyectado para
 * adaptarlos al proyecto destino. Si el target tiene alias @/, convierte
 * todos los imports relativos a @/ (más robusto y portable).
 * Si el firebase path fue detectado, lo usa para reescribir imports de Firebase.
 * @param {string} code
 * @param {string} targetRelPath — Ruta relativa del archivo en el proyecto destino
 * @param {{ hasAtAlias: boolean, firebaseConfigRelPath: string|null }} targetStack
 * @returns {{ code: string, warnings: string[], rewriteCount: number }}
 */
function rewriteImports(code, targetRelPath, targetStack) {
  const warnings = [];
  let rewritten = code;
  let rewriteCount = 0;

  // Solo reescribir si el target tiene alias @/ — es la estrategia más segura
  if (!targetStack.hasAtAlias) {
    warnings.push('El proyecto destino no tiene alias @/ detectado en vite.config.js. Los imports relativos se dejan como están — verifica manualmente si los paths son correctos.');
    return { code, warnings, rewriteCount: 0 };
  }

  // Estrategia: Convertir '../../../algo' y './algo' → '@/algo'
  // Para imports de Firebase con ruta detectada: usar la ruta real del proyecto
  rewritten = rewritten.replace(
    /(from\s+)(['"])(\.{1,2}\/[^'"]+)(['"])/g,
    (match, fromKw, q1, relPath, q2) => {
      // Extraer el "canonical path" eliminando todos los ../ y ./
      const canonicalPath = relPath.replace(/^(\.\.\/|\.\/)+/, '');

      // Caso especial: imports de Firebase — usar el path real detectado
      if (targetStack.firebaseConfigRelPath) {
        const firebasePatterns = ['config/firebaseconfig', 'config/firebase', 'firebase', 'firebaseconfig'];
        const cleanLower = canonicalPath.toLowerCase().replace('.js', '');
        if (firebasePatterns.some(p => cleanLower.endsWith(p))) {
          // Convertir la ruta relativa del firebase al formato @/
          const fbRelFromSrc = targetStack.firebaseConfigRelPath.replace(/^src\//, '');
          rewriteCount++;
          return `${fromKw}${q1}@/${fbRelFromSrc}${q2}`;
        }
      }

      // Caso general: convertir ../../../algo → @/algo
      rewriteCount++;
      return `${fromKw}${q1}@/${canonicalPath}${q2}`;
    }
  );

  if (rewriteCount > 0) {
    console.log(`[rewriteImports] ${rewriteCount} import(s) reescritos en ${targetRelPath}`);
  }

  return { code: rewritten, warnings, rewriteCount };
}

/**
 * Crea un backup del archivo antes de sobrescribirlo.
 * Los backups se guardan en .prototipe-backup/{ISO-timestamp}/{relPath relativo al proyecto}
 * @param {string} projectDir
 * @param {string} filePath — Ruta absoluta del archivo a respaldar
 * @returns {Promise<string|null>} — Ruta absoluta del backup, o null si el archivo no existía
 */
async function createBackupBeforeWrite(projectDir, filePath, currentTs = null) {
  if (!await fs.pathExists(filePath)) return null;
  try {
    const ts = currentTs || new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const relativePath = path.relative(projectDir, filePath);
    const backupDir = path.join(projectDir, '.prototipe-backup', ts);
    const backupPath = path.join(backupDir, relativePath);

    // Validación de contención estricta
    if (!isPathContained(projectDir, backupPath)) {
      console.warn(`[createBackupBeforeWrite] Intento de backup fuera del proyecto abortado: ${backupPath}`);
      return null;
    }

    await fs.ensureDir(path.dirname(backupPath));
    await fs.copy(filePath, backupPath);

    // Asegurar que .prototipe-backup esté en .gitignore del proyecto
    const gitignorePath = path.join(projectDir, '.gitignore');
    if (await fs.pathExists(gitignorePath)) {
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
      if (!gitignoreContent.includes('.prototipe-backup')) {
        await fs.appendFile(gitignorePath, '\n# Prototipe injection backups\n.prototipe-backup/\n');
      }
    }

    return path.relative(projectDir, backupPath);
  } catch (backupErr) {
    console.warn(`[createBackupBeforeWrite] No se pudo crear backup de ${filePath}: ${backupErr.message}`);
    return null;
  }
}

/**
 * Limita el historial de backups conservando solo las últimas N sesiones.
 * @param {string} projectDir
 * @param {number} maxVersions
 */
async function pruneBackups(projectDir, maxVersions = 5) {
  const backupDir = path.join(projectDir, '.prototipe-backup');
  if (!await fs.pathExists(backupDir)) return;
  try {
    const items = await fs.readdir(backupDir);
    const sessions = [];
    for (const item of items) {
      const fullPath = path.join(backupDir, item);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        sessions.push({ name: item, path: fullPath, mtime: stat.mtimeMs });
      }
    }
    // Ordenar de más viejo a más nuevo
    sessions.sort((a, b) => a.mtime - b.mtime);

    if (sessions.length > maxVersions) {
      const toRemove = sessions.slice(0, sessions.length - maxVersions);
      for (const sess of toRemove) {
        await fs.remove(sess.path);
        console.log(`[pruneBackups] Purgado backup antiguo: ${sess.name}`);
      }
    }
  } catch (err) {
    console.warn(`[pruneBackups] Error al podar backups en ${projectDir}: ${err.message}`);
  }
}


/**
 * Actualiza el archivo .prototipe-injected.json en el proyecto cliente.
 * Este archivo actúa como registro de todos los componentes instalados.
 * Si el componente ya existe en el registro, actualiza su entry.
 * @param {string} projectDir
 * @param {{ id, name, sourceLink, category, targetPath, npmInstalled, backupPath, envVarsRequired, checksum }} entry
 */
async function updateComponentRegistry(projectDir, entry) {
  const registryPath = path.join(projectDir, '.prototipe-injected.json');
  let registry = { version: 1, lastUpdated: null, components: [] };

  try {
    if (await fs.pathExists(registryPath)) {
      registry = await fs.readJson(registryPath);
    }

    // Calcular checksum SHA256 del archivo inyectado
    const crypto = await import('crypto');
    let checksum = null;
    if (await fs.pathExists(path.join(projectDir, entry.targetPath))) {
      const content = await fs.readFile(path.join(projectDir, entry.targetPath));
      checksum = crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
    }

    const newEntry = {
      id: entry.id,
      name: entry.name,
      sourceLink: entry.sourceLink,
      category: entry.category || 'unknown',
      targetPath: entry.targetPath,
      installedAt: new Date().toISOString(),
      installedBy: 'wizard-sse-v2',
      npmInstalled: entry.npmInstalled || [],
      dependenciesInjected: entry.dependenciesInjected || [],
      backupPath: entry.backupPath || null,
      envVarsRequired: entry.envVarsRequired || [],
      checksum,
      status: 'active'
    };

    // Reemplazar o agregar
    const idx = registry.components.findIndex(c => c.id === entry.id);
    if (idx >= 0) registry.components[idx] = newEntry;
    else registry.components.push(newEntry);

    registry.lastUpdated = new Date().toISOString();
    await fs.writeJson(registryPath, registry, { spaces: 2 });
  } catch (regErr) {
    console.warn(`[updateComponentRegistry] No se pudo actualizar el registry: ${regErr.message}`);
  }
}

/**
 * Auto-genera un snippet de uso del componente a partir de su código.
 * Extrae el nombre del export default y los parámetros del componente.
 * @param {string} code
 * @param {boolean} hasAtAlias
 * @param {string} targetRelPath
 * @returns {string} — Snippet JSX listo para mostrar al usuario
 */
function generateIntegrationSnippet(code, hasAtAlias, targetRelPath) {
  try {
    // Extraer nombre del export default function
    const nameMatch = code.match(/export\s+default\s+function\s+(\w+)/);
    if (!nameMatch) return null;
    const componentName = nameMatch[1];

    // Extraer parámetros del componente (destructuring del primer parámetro)
    const propsMatch = code.match(/function\s+\w+\s*\(\s*\{([^}]+)\}/);
    let propsSnippet = '';
    if (propsMatch) {
      const rawProps = propsMatch[1].split(',').map(p => p.trim().split('=')[0].trim()).filter(Boolean);
      propsSnippet = rawProps.slice(0, 4).map(p => `  ${p}={/* ... */}`).join('\n');
    }

    // Calcular la ruta de import
    const cleanPath = targetRelPath.replace(/\.(jsx?|tsx?)$/, '');
    const importPath = hasAtAlias ? `@/${cleanPath}` : `./${path.basename(cleanPath)}`;

    return [
      `// 📋 Cómo usar este componente:`,
      `import ${componentName} from '${importPath}';`,
      ``,
      `// En tu JSX:`,
      propsSnippet
        ? `<${componentName}\n${propsSnippet}\n/>`
        : `<${componentName} />`
    ].join('\n');
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/library/inject/preflight — Pre-validación sin efectos secundarios
// Verifica que el componente es inyectable ANTES de mostrar el diagnóstico.
// No escribe nada, no instala nada. Solo valida.
app.post('/api/library/inject/preflight', async (req, res) => {
  const { componentLink, targetRelativePath, clientId } = req.body;
  if (!componentLink) return res.status(400).json({ error: 'El campo "componentLink" es obligatorio.' });

  const blockers = [];
  const warnings = [];
  let codeExtractable = false;
  let manifestFound = false;
  let destinationExists = false;
  let destinationPath = null;
  let autoDetectedDeps = null;   // CORE-123: deps auto-detectadas del código
  let targetStack = null;         // CORE-123: stack del proyecto destino
  let envVarsMissing = [];        // CORE-123: vars de entorno usadas pero no definidas
  let integrationSnippet = null; // CORE-123: snippet de uso auto-generado

  try {
    // 1. Resolver ruta del .md
    let rawPath = componentLink.replace(/^file:\/\/\//, '');
    rawPath = decodeURIComponent(rawPath);
    if (rawPath.toLowerCase().includes('biblioteca de componentes')) {
      rawPath = rawPath.replace(/biblioteca de componentes/i, '06_Biblioteca_Componentes');
    }
    const baseDocDir = path.resolve(getDocumentationRoot());
    const filePath = path.resolve(rawPath);

    if (!isPathContained(baseDocDir, filePath)) {
      return res.status(403).json({ error: 'Acceso denegado. La ruta está fuera del directorio de documentación.' });
    }
    if (!await fs.pathExists(filePath)) {
      blockers.push(`El archivo de documentación no existe: ${path.basename(filePath)}`);
      return res.json({ canInject: false, blockers, warnings, codeExtractable, manifestFound, destinationExists, destinationPath });
    }

    // 2. Leer markdown y validar
    const md = await fs.readFile(filePath, 'utf-8');

    // 2a. Verificar manifest JSON
    const manifestMatch = md.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
    if (manifestMatch) {
      try { JSON.parse(manifestMatch[1]); manifestFound = true; }
      catch { warnings.push('El bloque manifest JSON del componente tiene sintaxis inválida. Las dependencias no se instalarán automáticamente.'); }
    } else {
      warnings.push('Este componente no tiene manifest de dependencias (<!-- {} -->). Las dependencias NPM se detectarán automáticamente del código.');
    }

    // 2b. Verificar extraíble el código
    const code = extractCodeFromMarkdown(md);
    if (!code) {
      blockers.push('No se pudo extraer el código del componente. Verifica que el archivo .md tenga un bloque de código válido (```jsx o ```js).');
    } else {
      codeExtractable = true;

      // CORE-123: Analizar dependencias del código automáticamente
      autoDetectedDeps = analyzeCodeDependencies(code);

      // CORE-123: Generar snippet de uso
      if (targetRelativePath) {
        integrationSnippet = generateIntegrationSnippet(code, true, targetRelativePath);
      }
    }

    // 3. Verificar si el archivo destino ya existe + probeTargetStack
    if (clientId && targetRelativePath) {
      const targetProjectDir = await findProjectDir(clientId);
      if (targetProjectDir) {
        let relPath = targetRelativePath.startsWith('/') ? targetRelativePath.slice(1) : targetRelativePath;
        const fullDest = path.resolve(targetProjectDir, relPath);
        if (isPathContained(targetProjectDir, fullDest)) {
          destinationPath = relPath;
          destinationExists = await fs.pathExists(fullDest);
          if (destinationExists) {
            warnings.push(`El archivo destino ya existe: ${relPath}. Se creará un backup automático antes de sobrescribir.`);
          }
        }

        // CORE-123: Probe del stack del cliente destino
        targetStack = await probeTargetStack(targetProjectDir);

        // CORE-126: Detectar variables de entorno faltantes de forma recursiva en el árbol de dependencias
        const allEnvVars = await extractAllEnvVarsRecursively(componentLink, baseDocDir);
        if (allEnvVars.length > 0) {
          envVarsMissing = allEnvVars.filter(v => !targetStack.envVarsDefined.includes(v));
          if (envVarsMissing.length > 0) {
            warnings.push(`Este componente y sus dependencias usan ${envVarsMissing.length} variable(s) de entorno no definidas en el cliente: ${envVarsMissing.join(', ')}.`);
          }
        }

        // CSS Variables: Detectar variables CSS requeridas de forma recursiva
        let componentCSSVars = await extractAllCSSVarsRecursively(componentLink, baseDocDir);
        let clientCSSFilePath = await findClientCSSFile(targetProjectDir);
        let cssVarsMissing = [];
        let cssVarsDefined = [];

        if (clientCSSFilePath) {
          const fullCSSPath = path.join(targetProjectDir, clientCSSFilePath);
          if (await fs.pathExists(fullCSSPath)) {
            const cssContent = await fs.readFile(fullCSSPath, 'utf-8');
            for (const cssVar of componentCSSVars) {
              const escapedVar = cssVar.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
              const hasVar = new RegExp(`${escapedVar}\\s*:`, 'i').test(cssContent);
              if (hasVar) {
                cssVarsDefined.push(cssVar);
              } else {
                cssVarsMissing.push(cssVar);
              }
            }
          } else {
            cssVarsMissing = [...componentCSSVars];
          }
        } else if (componentCSSVars.length > 0) {
          cssVarsMissing = [...componentCSSVars];
        }

        if (cssVarsMissing.length > 0) {
          warnings.push(`Este componente y sus dependencias usan ${cssVarsMissing.length} variable(s) CSS no definidas en el cliente: ${cssVarsMissing.join(', ')}.`);
        }

        // CORE-123: Regenerar snippet con info de alias real del target
        if (code && targetRelativePath) {
          integrationSnippet = generateIntegrationSnippet(code, targetStack.hasAtAlias, targetRelativePath);
        }

        // CORE-123: Advertencia si el componente usa Firebase pero no hay config detectada
        if (autoDetectedDeps?.firebaseImports && !targetStack.firebaseConfigRelPath) {
          warnings.push('Este componente importa Firebase pero no se detectó el archivo de configuración (firebaseConfig.js) en el proyecto cliente. Los imports de Firebase se dejarán como están.');
        }

        // CORE-123: Advertencia si no hay alias @/ y hay imports relativos
        if (autoDetectedDeps?.relativeImports.length > 0 && !targetStack.hasAtAlias) {
          warnings.push(`El componente tiene ${autoDetectedDeps.relativeImports.length} import(s) relativo(s). El proyecto destino no tiene alias @/ configurado — verifica los paths manualmente tras la inyección.`);
        }

        // Añadir propiedades CSS al targetStack para el Paso 2
        targetStack.clientCSSFilePath = clientCSSFilePath;
        targetStack.cssVarsMissing = cssVarsMissing;
        targetStack.cssVarsDefined = cssVarsDefined;
        targetStack.componentCSSVars = componentCSSVars;
      }
    }

    // CORE-124: calcular ruta sugerida declarativa o heurística
    let suggestedPath = null;
    if (codeExtractable) {
      let parsedManifest = null;
      try {
        const mMatch = md.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
        if (mMatch) parsedManifest = JSON.parse(mMatch[1]);
      } catch {}
      const compName = parsedManifest?.technicalName ||
        path.basename(componentLink.replace(/^file:\/\/\//, '').split('?')[0], '.md');
      const fPath = componentLink.replace(/^file:\/\/\//, '');
      suggestedPath = getDefaultRelativePath(compName, getResourceTypeFromPath(fPath), decodeURIComponent(fPath), parsedManifest);
    }

    res.json({
      canInject: blockers.length === 0,
      codeExtractable,
      manifestFound,
      destinationExists,
      destinationPath,
      blockers,
      warnings,
      // CORE-123: campos enriquecidos
      autoDetectedDeps,
      targetStack,
      envVarsMissing,
      integrationSnippet,
      // CORE-124: ruta sugerida (declarativa > heurística)
      suggestedPath
    });
  } catch (err) {
    console.error(`[API /library/inject/preflight] Error: ${err.message}`);
    res.status(500).json({ error: `Error en preflight: ${err.message}` });
  }
});

function getCSSVariableFallback(varName) {
  const name = varName.toLowerCase();
  if (name.includes('primary')) return '#6366f1'; // Indigo premium
  if (name.includes('secondary')) return '#475569'; // Slate
  if (name.includes('accent')) return '#f59e0b'; // Amber
  if (name.includes('background') || name.includes('bg')) return '#0f172a'; // Dark slate slate-900
  if (name.includes('surface')) return '#1e293b'; // Slate-800
  if (name.includes('border')) return '#334155'; // Slate-700
  if (name.includes('text-muted')) return '#94a3b8'; // Slate-400
  if (name.includes('text')) return '#f8fafc'; // Slate-50
  if (name.includes('radius') || name.includes('rounded')) {
    if (name.includes('xl')) return '1rem';
    if (name.includes('lg')) return '0.75rem';
    if (name.includes('md')) return '0.5rem';
    return '0.375rem';
  }
  if (name.includes('shadow')) return '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
  return '#cccccc'; // Fallback neutral grey
}

app.post('/api/library/inject/css-doctor', async (req, res) => {
  const { clientId, cssVarsMissing } = req.body;
  if (!clientId || !Array.isArray(cssVarsMissing) || cssVarsMissing.length === 0) {
    return res.json({ success: true, message: 'No hay variables CSS faltantes que inyectar.' });
  }

  try {
    const targetProjectDir = await findProjectDir(clientId);
    if (!targetProjectDir) {
      return res.status(404).json({ error: `No se encontró el directorio del proyecto para el cliente: ${clientId}` });
    }

    let clientCSSFilePath = await findClientCSSFile(targetProjectDir);
    if (!clientCSSFilePath) {
      clientCSSFilePath = 'src/index.css';
    }

    const fullCSSPath = path.join(targetProjectDir, clientCSSFilePath);
    await fs.ensureDir(path.dirname(fullCSSPath));

    let cssContent = '';
    if (await fs.pathExists(fullCSSPath)) {
      cssContent = await fs.readFile(fullCSSPath, 'utf-8');
      
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      await createBackupBeforeWrite(targetProjectDir, fullCSSPath, `css-doctor-${ts}`);
    }

    let cleanBaseContent = cssContent;
    let existingVars = {};

    const startIdx = cssContent.indexOf('/* === CSS DOCTOR START === */');
    const endIdx = cssContent.indexOf('/* === CSS DOCTOR END === */');

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const doctorBlock = cssContent.slice(startIdx, endIdx + '/* === CSS DOCTOR END === */'.length);
      const varRegex = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
      let match;
      while ((match = varRegex.exec(doctorBlock)) !== null) {
        existingVars[match[1]] = match[2].trim();
      }
      cleanBaseContent = cssContent.slice(0, startIdx).trimEnd() + '\n\n' + cssContent.slice(endIdx + '/* === CSS DOCTOR END === */'.length).trimStart();
    }

    const mergedVars = { ...existingVars };
    for (const cssVar of cssVarsMissing) {
      if (!mergedVars[cssVar]) {
        mergedVars[cssVar] = getCSSVariableFallback(cssVar);
      }
    }

    let injectionBlock = '\n\n/* === CSS DOCTOR START === */\n';
    injectionBlock += '/* Las variables inyectadas automáticamente por CSS Doctor se guardan en este bloque */\n';
    injectionBlock += ':root {\n';
    for (const [v, val] of Object.entries(mergedVars)) {
      injectionBlock += `  ${v}: ${val};\n`;
    }
    injectionBlock += '}\n';
    injectionBlock += '/* === CSS DOCTOR END === */\n';

    await fs.writeFile(fullCSSPath, cleanBaseContent.trimEnd() + injectionBlock, 'utf-8');

    res.json({
      success: true,
      message: `Variables CSS inyectadas de forma segura en ${clientCSSFilePath}`,
      injectedVars: cssVarsMissing,
      filePath: clientCSSFilePath
    });
  } catch (err) {
    console.error(`[API /library/inject/css-doctor] Error: ${err.message}`);
    res.status(500).json({ error: `Error al inyectar variables CSS: ${err.message}` });
  }
});

app.post('/api/library/sandbox/scaffold', async (req, res) => {
  const { componentLink, technicalName } = req.body;
  if (!componentLink || !technicalName) {
    return res.status(400).json({ error: 'Los campos "componentLink" y "technicalName" son obligatorios.' });
  }

  try {
    let rawPath = componentLink.replace(/^file:\/\/\//, '');
    rawPath = decodeURIComponent(rawPath);
    if (rawPath.toLowerCase().includes('biblioteca de componentes')) {
      rawPath = rawPath.replace(/biblioteca de componentes/i, '06_Biblioteca_Componentes');
    }
    const baseDocDir = path.resolve(getDocumentationRoot());
    const filePath = path.resolve(rawPath);

    if (!isPathContained(baseDocDir, filePath) || !await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'El archivo de documentación del componente no existe.' });
    }

    const md = await fs.readFile(filePath, 'utf-8');
    const code = extractCodeFromMarkdown(md);
    if (!code) {
      return res.status(400).json({ error: 'No se pudo extraer código del componente para crear el sandbox.' });
    }

    let processedCode = code;
    
    const exportDefaultRegex = new RegExp(`export\\s+default\\s+function\\s+${technicalName}`, 'g');
    if (exportDefaultRegex.test(processedCode)) {
      processedCode = processedCode.replace(exportDefaultRegex, `function ${technicalName}`);
    } else {
      processedCode = processedCode.replace(/export\s+default\s+function/g, 'function');
      processedCode = processedCode.replace(/export\s+default/g, '/* export default */');
    }

    let finalCode = '';
    if (!processedCode.includes("import { SandboxLayout }")) {
      finalCode += `import { SandboxLayout } from './SandboxLayout';\n`;
    }
    finalCode += processedCode;

    finalCode += `\n\nexport default function ${technicalName}Sandbox() {\n`;
    finalCode += `  return (\n`;
    finalCode += `    <SandboxLayout\n`;
    finalCode += `      title="${technicalName}"\n`;
    finalCode += `      description="Playground autogenerado por Scaffold Sandbox. Visualización del componente en aislamiento."\n`;
    finalCode += `      controls={[]}\n`;
    finalCode += `    >\n`;
    finalCode += `      <div className="w-full flex items-center justify-center p-6 bg-slate-900/50 border border-slate-800 rounded-3xl min-h-[160px]">\n`;
    finalCode += `        <${technicalName} />\n`;
    finalCode += `      </div>\n`;
    finalCode += `    </SandboxLayout>\n`;
    finalCode += `  );\n`;
    finalCode += `}\n`;

    const sandboxFilePath = path.join(
      getWorkspaceRoot(),
      'Central PROTOTIPE',
      'dev-dashboard',
      'src',
      'components',
      'admin',
      'sandboxes',
      `${technicalName}Sandbox.jsx`
    );

    await fs.ensureDir(path.dirname(sandboxFilePath));
    await fs.writeFile(sandboxFilePath, finalCode, 'utf-8');

    res.json({
      success: true,
      message: `Sandbox creado con éxito en ${path.basename(sandboxFilePath)}`,
      sandboxPath: sandboxFilePath
    });
  } catch (err) {
    console.error(`[API /library/sandbox/scaffold] Error: ${err.message}`);
    res.status(500).json({ error: `Error al crear el scaffold del sandbox: ${err.message}` });
  }
});


// POST /api/library/inject/diagnose — Obtiene dependencias NPM faltantes y subdependencias locales faltantes
app.post('/api/library/inject/diagnose', async (req, res) => {
  const { clientId, componentLink } = req.body;
  if (!clientId || !componentLink) {
    return res.status(400).json({ error: 'Los campos "clientId" y "componentLink" son obligatorios.' });
  }

  try {
    let rawPath = componentLink.replace(/^file:\/\/\//, '');
    rawPath = decodeURIComponent(rawPath);

    if (rawPath.toLowerCase().includes('biblioteca de componentes')) {
      rawPath = rawPath.replace(/biblioteca de componentes/i, '06_Biblioteca_Componentes');
    }

    const baseDocDir = path.resolve(getDocumentationRoot());
    const filePath = path.resolve(rawPath);

    if (!isPathContained(baseDocDir, filePath)) {
      return res.status(403).json({ error: 'Acceso denegado. La ruta está fuera del directorio de documentación.' });
    }

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: `El archivo de documentación no existe: ${filePath}` });
    }

    const targetProjectDir = await findProjectDir(clientId);
    if (!targetProjectDir) {
      return res.status(404).json({ error: `No se pudo encontrar el directorio del proyecto local para el cliente: ${clientId}` });
    }

    const markdownContent = await fs.readFile(filePath, 'utf-8');
    
    // Parsear manifest JSON en comentarios HTML
    const manifestMatch = markdownContent.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
    let manifest = {};
    if (manifestMatch) {
      try {
        manifest = JSON.parse(manifestMatch[1]);
      } catch (err) {
        console.warn(`[Diagnose] Error al parsear manifest JSON: ${err.message}`);
      }
    }

    const npmMissing = {};
    if (manifest.dependencies && manifest.dependencies.npm) {
      const packageJsonPath = path.join(targetProjectDir, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        const clientDeps = {
          ...(packageJson.dependencies || {}),
          ...(packageJson.devDependencies || {})
        };
        for (const [pkgName, pkgVer] of Object.entries(manifest.dependencies.npm)) {
          if (!clientDeps[pkgName]) {
            npmMissing[pkgName] = pkgVer;
          }
        }
      }
    }

    const internalDependencies = [];
    const internalMissing = [];
    if (manifest.dependencies && manifest.dependencies.internal) {
      for (const dep of manifest.dependencies.internal) {
        const existingPath = await findInternalFile(targetProjectDir, dep.name, dep.type);
        const depInfo = {
          name: dep.name,
          type: dep.type,
          link: dep.link,
          exists: !!existingPath,
          path: existingPath ? path.relative(targetProjectDir, existingPath) : null
        };
        internalDependencies.push(depInfo);
        if (!existingPath) {
          internalMissing.push(depInfo);
        }
      }
    }

    res.json({
      success: true,
      npmMissing,
      internalDependencies,
      internalMissing,
      manifest
    });
  } catch (err) {
    console.error(`[API /library/inject/diagnose] Error: ${err.message}`);
    res.status(500).json({ error: `Error en diagnóstico: ${err.message}` });
  }
});

// POST /api/library/inject — Inyecta el código de un componente/módulo y todas sus dependencias en cascada
app.post('/api/library/inject', async (req, res) => {
  const { clientId, componentLink, targetRelativePath, overwrite } = req.body;
  if (!clientId || !componentLink || !targetRelativePath) {
    return res.status(400).json({ error: 'Los campos "clientId", "componentLink" y "targetRelativePath" son obligatorios.' });
  }

  if (projectSyncLocks[clientId]) {
    return res.status(409).json({ error: 'Ya existe una operación de aprovisionamiento, inyección o sincronización en curso para este cliente.' });
  }
  projectSyncLocks[clientId] = true;

  try {
    const targetProjectDir = await findProjectDir(clientId);
    if (!targetProjectDir) {
      return res.status(404).json({ error: `No se pudo encontrar el directorio del proyecto local para el cliente: ${clientId}` });
    }

    const visited = new Set();
    const results = [];

    // Helper recursivo interno
    async function recurseInject(currentLink, isPrimary = false, destRelPath = null) {
      if (visited.has(currentLink)) return;
      visited.add(currentLink);

      let rawPath = currentLink.replace(/^file:\/\/\//, '');
      rawPath = decodeURIComponent(rawPath);

      if (rawPath.toLowerCase().includes('biblioteca de componentes')) {
        rawPath = rawPath.replace(/biblioteca de componentes/i, '06_Biblioteca_Componentes');
      }

      const baseDocDir = path.resolve(getDocumentationRoot());
      const filePath = path.resolve(rawPath);

      if (!isPathContained(baseDocDir, filePath)) {
        throw new Error(`Acceso denegado. La ruta ${filePath} está fuera de límites.`);
      }

      if (!await fs.pathExists(filePath)) {
        throw new Error(`El archivo de documentación no existe: ${filePath}`);
      }

      const markdownContent = await fs.readFile(filePath, 'utf-8');

      // 1. Parsear manifest
      const manifestMatch = markdownContent.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
      let manifest = {};
      if (manifestMatch) {
        try {
          manifest = JSON.parse(manifestMatch[1]);
        } catch (err) {
          console.warn(`[Inject] Error al parsear manifest JSON en ${filePath}: ${err.message}`);
        }
      }

      // 2. Resolver dependencias NPM
      if (manifest.dependencies && manifest.dependencies.npm) {
        const packageJsonPath = path.join(targetProjectDir, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath);
          const clientDeps = {
            ...(packageJson.dependencies || {}),
            ...(packageJson.devDependencies || {})
          };
          for (const [pkgName, pkgVer] of Object.entries(manifest.dependencies.npm)) {
            if (!clientDeps[pkgName]) {
              console.log(`[Inject] Instalando librería NPM faltante: ${pkgName}@${pkgVer} en ${clientId}`);
              try {
                // Ejecución no bloqueante con execAsync
                await execAsync(`npm install ${pkgName}@${pkgVer} --no-audit --no-fund`, {
                  cwd: targetProjectDir,
                  timeout: 60000
                });
                results.push({ type: 'npm', name: pkgName, status: 'installed', version: pkgVer });
              } catch (installErr) {
                console.error(`[Inject] Error al instalar ${pkgName}: ${installErr.message}`);
                results.push({ type: 'npm', name: pkgName, status: 'failed', error: installErr.message });
              }
            } else {
              results.push({ type: 'npm', name: pkgName, status: 'already_present' });
            }
          }
        }
      }

      // 3. Procesar dependencias internas recursivamente
      if (manifest.dependencies && manifest.dependencies.internal) {
        for (const dep of manifest.dependencies.internal) {
          if (dep.link) {
            const existingPath = await findInternalFile(targetProjectDir, dep.name, dep.type);
            if (!existingPath) {
              const defaultPath = getDefaultRelativePath(dep.name, dep.type, filePath, dep.targetPath ? { targetPath: dep.targetPath } : null);
              await recurseInject(dep.link, false, defaultPath);
            } else {
              results.push({ type: 'internal', name: dep.name, status: 'already_present', path: path.relative(targetProjectDir, existingPath) });
            }
          }
        }
      }

      // 4. Inyectar el archivo de código (usando helper robusto con 4 estrategias)
      const codeToInject = extractCodeFromMarkdown(markdownContent);
      if (!codeToInject) {
        throw new Error(`No se pudo extraer código válido de ${path.basename(filePath)}. Verifica que el archivo .md tenga un bloque de código (\`\`\`jsx o \`\`\`js).`);
      }

      // Determinar ruta destino física
      let relativeFilePath = manifest.targetPath || destRelPath;
      if (!relativeFilePath) {
        const type = getResourceTypeFromPath(filePath);
        relativeFilePath = getDefaultRelativePath(manifest.technicalName || path.basename(filePath, '.md'), type, filePath, manifest);
      }

      if (relativeFilePath.startsWith('/')) {
        relativeFilePath = relativeFilePath.slice(1);
      }
      const finalTargetFilePath = path.resolve(targetProjectDir, relativeFilePath);

      if (!isPathContained(targetProjectDir, finalTargetFilePath)) {
        throw new Error(`Acceso denegado. La ruta de destino ${finalTargetFilePath} está fuera del proyecto.`);
      }

      if (await fs.pathExists(finalTargetFilePath)) {
        if (!overwrite) {
          const currentContent = await fs.readFile(finalTargetFilePath, 'utf-8');
          if (currentContent.trim() === codeToInject.trim()) {
            results.push({
              type: isPrimary ? 'primary' : 'dependency',
              name: manifest.technicalName || path.basename(filePath, '.md'),
              status: 'already_present',
              path: relativeFilePath
            });
            return;
          } else {
            results.push({
              type: isPrimary ? 'primary' : 'dependency',
              name: manifest.technicalName || path.basename(filePath, '.md'),
              status: 'skipped_exists',
              path: relativeFilePath,
              warning: 'El componente ya existe en destino con cambios personalizados. Inyección omitida para proteger personalizaciones.'
            });
            return;
          }
        }
      }

      await fs.ensureDir(path.dirname(finalTargetFilePath));
      await fs.writeFile(finalTargetFilePath, codeToInject, 'utf-8');
      
      results.push({
        type: isPrimary ? 'primary' : 'dependency',
        name: manifest.technicalName || path.basename(filePath, '.md'),
        status: 'injected',
        path: relativeFilePath
      });
    }

    // Ejecutar recursión partiendo del componente principal
    await recurseInject(componentLink, true, targetRelativePath);

    res.json({
      success: true,
      message: `Proceso de inyección inteligente completado en ${clientId}.`,
      results
    });
  } catch (err) {
    console.error(`[API /library/inject] Error en inyección inteligente: ${err.message}`);
    res.status(500).json({ error: `Error en inyección inteligente: ${err.message}` });
  } finally {
    delete projectSyncLocks[clientId];
  }
});

// POST /api/library/inject/stream — Inyección con progreso en vivo via Server-Sent Events (SSE)
// Body: { clientId, componentLink, targetRelativePath, overwrite? }
app.post('/api/library/inject/stream', async (req, res) => {
  const { clientId, componentLink, targetRelativePath, overwrite = false } = req.body;
  if (!clientId || !componentLink || !targetRelativePath) {
    return res.status(400).json({ error: 'Los campos "clientId", "componentLink" y "targetRelativePath" son obligatorios.' });
  }

  if (projectSyncLocks[clientId]) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    res.write(`data: ${JSON.stringify({ event: 'error', message: 'Ya existe una operación de aprovisionamiento, inyección o sincronización en curso para este cliente.' })}\n\n`);
    return res.end();
  }
  projectSyncLocks[clientId] = true;

  // Configurar SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let isAborted = false;
  req.on('close', () => {
    if (!isAborted) {
      isAborted = true;
      delete projectSyncLocks[clientId];
      console.warn(`[API /api/library/inject/stream] Cliente ${clientId} cerró la conexión SSE de forma repentina.`);
    }
  });

  const emit = (event, data) => {
    if (isAborted) return;
    res.write(`data: ${JSON.stringify({ event, ...data })}\n\n`);
  };

  const results = [];
  let targetProjectDir = null;

  try {
    targetProjectDir = await findProjectDir(clientId);
    if (!targetProjectDir) {
      emit('error', { message: `No se pudo encontrar el directorio del proyecto: ${clientId}` });
      return res.end();
    }

    // CORE-123: Probe del stack del proyecto destino (una sola vez, compartido en toda la sesión)
    const targetStack = await probeTargetStack(targetProjectDir);
    emit('step', { phase: 'init', status: 'info', message: `Stack detectado: alias @/${targetStack.hasAtAlias ? '✓' : '✗'} | Firebase: ${targetStack.firebaseConfigRelPath || 'no detectado'} | Tailwind: ${targetStack.hasTailwind ? '✓' : '✗'}` });

    const visited = new Set();
    const primaryCompName = path.basename(targetRelativePath, path.extname(targetRelativePath));
    const sessionInjections = [];
    const sessionTs = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    async function recurseInjectSSE(currentLink, isPrimary = false, destRelPath = null) {
      if (isAborted) throw new Error('Inyección abortada por desconexión del cliente.');
      if (visited.has(currentLink)) return;
      visited.add(currentLink);

      let rawPath = currentLink.replace(/^file:\/\/\//, '');
      rawPath = decodeURIComponent(rawPath);
      if (rawPath.toLowerCase().includes('biblioteca de componentes')) {
        rawPath = rawPath.replace(/biblioteca de componentes/i, '06_Biblioteca_Componentes');
      }
      const baseDocDir = path.resolve(getDocumentationRoot());
      const filePath = path.resolve(rawPath);

      if (!isPathContained(baseDocDir, filePath)) throw new Error(`Acceso denegado: ${filePath}`);
      if (!await fs.pathExists(filePath)) throw new Error(`Archivo no encontrado: ${filePath}`);

      const md = await fs.readFile(filePath, 'utf-8');

      // Parsear manifest
      const manifestMatch = md.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
      let manifest = {};
      if (manifestMatch) { try { manifest = JSON.parse(manifestMatch[1]); } catch {} }

      const compName = manifest.technicalName || path.basename(filePath, '.md');

      // NPM dependencies
      if (manifest.dependencies?.npm) {
        const packageJsonPath = path.join(targetProjectDir, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
          const pkg = await fs.readJson(packageJsonPath);
          const clientDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
          const missingPkgs = Object.entries(manifest.dependencies.npm).filter(([n]) => !clientDeps[n]);
          for (const [pkgName, pkgVer] of missingPkgs) {
            emit('step', { phase: 'npm', pkg: pkgName, status: 'installing', message: `Instalando ${pkgName}@${pkgVer}...` });
            try {
              await execAsync(`npm install ${pkgName}@${pkgVer} --no-audit --no-fund`, { cwd: targetProjectDir, timeout: 90000 });
              emit('step', { phase: 'npm', pkg: pkgName, status: 'done', message: `${pkgName} instalado correctamente.` });
              results.push({ type: 'npm', name: pkgName, status: 'installed', version: pkgVer });
            } catch (installErr) {
              emit('step', { phase: 'npm', pkg: pkgName, status: 'error', message: `Error al instalar ${pkgName}: ${installErr.message}` });
              results.push({ type: 'npm', name: pkgName, status: 'failed', error: installErr.message });
            }
          }
        }
      }

      // Internal dependencies (recursivo)
      if (manifest.dependencies?.internal) {
        for (const dep of manifest.dependencies.internal) {
          if (!dep.link) continue;
          const existingPath = await findInternalFile(targetProjectDir, dep.name, dep.type);
          if (!existingPath) {
            const defaultPath = getDefaultRelativePath(dep.name, dep.type, filePath, dep.targetPath ? { targetPath: dep.targetPath } : null);
            emit('step', { phase: 'dependency', name: dep.name, status: 'injecting', message: `Inyectando dependencia: ${dep.name}` });
            await recurseInjectSSE(dep.link, false, defaultPath);
          } else {
            results.push({ type: 'internal', name: dep.name, status: 'already_present', path: path.relative(targetProjectDir, existingPath) });
          }
        }
      }

      // Extraer código con helper robusto
      let codeToInject = extractCodeFromMarkdown(md);
      if (!codeToInject) throw new Error(`No se pudo extraer código de ${path.basename(filePath)}`);

      let relativeFilePath = destRelPath;
      if (!relativeFilePath) {
        const type = getResourceTypeFromPath(filePath);
        relativeFilePath = getDefaultRelativePath(compName, type, filePath, manifest);
      }
      if (relativeFilePath.startsWith('/')) relativeFilePath = relativeFilePath.slice(1);

      const finalTargetFilePath = path.resolve(targetProjectDir, relativeFilePath);
      if (!isPathContained(targetProjectDir, finalTargetFilePath)) {
        throw new Error(`Ruta de destino fuera del proyecto: ${finalTargetFilePath}`);
      }

      // CORE-123: Reescribir imports relativos → @/ usando el stack del target
      const { code: rewrittenCode, warnings: rewriteWarnings, rewriteCount } = rewriteImports(codeToInject, relativeFilePath, targetStack);
      codeToInject = rewrittenCode;
      if (rewriteCount > 0) {
        emit('step', { phase: 'transform', name: compName, status: 'info', message: `✎ ${rewriteCount} import(s) reescritos para el proyecto destino.` });
      }
      for (const w of rewriteWarnings) {
        emit('step', { phase: 'transform', name: compName, status: 'warn', message: `⚠ ${w}` });
      }

      // CORE-123: Fix bug isPrimary — verificar sobrescritura para TODOS los archivos (primary y deps)
      const fileExists = await fs.pathExists(finalTargetFilePath);
      if (fileExists && !overwrite) {
        if (isPrimary) {
          throw new Error(`El archivo ya existe: ${relativeFilePath}. Activa "Sobrescribir" para reemplazarlo.`);
        } else {
          // Para dependencias: advertir y saltar en lugar de sobrescribir silenciosamente
          emit('step', { phase: 'file', name: compName, path: relativeFilePath, status: 'skipped', message: `⏭ Dependencia ${relativeFilePath} ya existe — saltando para no sobreescribir código personalizado.` });
          results.push({ type: 'dependency', name: compName, status: 'skipped', path: relativeFilePath });
          return;
        }
      }

      // CORE-123: Backup antes de sobrescribir (agrupados por timestamp único de sesión)
      let backupPath = null;
      if (fileExists && overwrite) {
        backupPath = await createBackupBeforeWrite(targetProjectDir, finalTargetFilePath, sessionTs);
        if (backupPath) {
          emit('step', { phase: 'backup', name: compName, status: 'done', message: `🗄 Backup creado: ${backupPath}` });
        }
      }

      emit('step', { phase: 'file', name: compName, path: relativeFilePath, status: 'writing', message: `Escribiendo ${relativeFilePath}...` });
      await fs.ensureDir(path.dirname(finalTargetFilePath));
      await fs.writeFile(finalTargetFilePath, codeToInject, 'utf-8');

      // Calcular checksum SHA256 para el registro de auditoría
      const crypto = await import('crypto');
      const checksum = crypto.createHash('sha256').update(codeToInject).digest('hex').slice(0, 12);

      sessionInjections.push({
        id: compName,
        name: manifest.name || compName,
        type: isPrimary ? 'primary' : 'dependency',
        targetPath: relativeFilePath,
        backupPath: backupPath,
        checksum: checksum,
        isNew: !fileExists
      });

      const resultItem = { type: isPrimary ? 'primary' : 'dependency', name: compName, status: 'injected', path: relativeFilePath };
      results.push(resultItem);
      emit('step', { phase: 'file', name: compName, path: relativeFilePath, status: 'done', message: `✓ ${relativeFilePath} creado.` });

      // CORE-123/CORE-125: Registrar componente inyectado en .prototipe-injected.json
      if (isPrimary) {
        const primaryEntry = sessionInjections.find(inj => inj.type === 'primary');
        const depsEntries = sessionInjections.filter(inj => inj.type === 'dependency');
        const autoDetected = analyzeCodeDependencies(codeToInject);

        await updateComponentRegistry(targetProjectDir, {
          id: compName,
          name: manifest.name || compName,
          sourceLink: currentLink,
          category: path.basename(path.dirname(path.dirname(filePath))),
          targetPath: relativeFilePath,
          npmInstalled: Object.keys(manifest.dependencies?.npm || {}),
          dependenciesInjected: depsEntries.map(d => ({
            id: d.id,
            name: d.name,
            targetPath: d.targetPath,
            backupPath: d.backupPath,
            checksum: d.checksum,
            isNew: d.isNew
          })),
          backupPath: primaryEntry ? primaryEntry.backupPath : null,
          envVarsRequired: autoDetected.envVars
        });
      }
    }

    emit('start', { message: `Iniciando instalación de componente en ${clientId}...` });
    await recurseInjectSSE(componentLink, true, targetRelativePath);

    // CORE-125: Purgar copias redundantes de backups
    await pruneBackups(targetProjectDir, 5);

    // CORE-126: Inyectar variables de entorno recursivas y configurar valores reales ingresados por el usuario
    try {
      const baseDocDir = path.resolve(getDocumentationRoot());
      const allEnvVars = await extractAllEnvVarsRecursively(componentLink, baseDocDir);
      if (allEnvVars.length > 0) {
        await writeEnvVarsToClient(targetProjectDir, allEnvVars, req.body.envValues || {}, primaryCompName);
        emit('step', { phase: 'env', status: 'done', message: `📋 Configuración de variables de entorno procesada en .env.local: ${allEnvVars.join(', ')}` });
      }
    } catch (envErr) {
      console.warn(`[inject/stream] No se pudieron inyectar env vars: ${envErr.message}`);
    }

    // CORE-123: Generar snippet de integración del componente principal
    let snippet = null;
    try {
      const primaryMdRaw = await fs.readFile(
        path.resolve(decodeURIComponent(componentLink.replace(/^file:\/\/\//, '')).replace(/biblioteca de componentes/i, '06_Biblioteca_Componentes')),
        'utf-8'
      );
      const primaryCode = extractCodeFromMarkdown(primaryMdRaw);
      snippet = generateIntegrationSnippet(primaryCode, targetStack.hasAtAlias, targetRelativePath);
    } catch {}

    emit('complete', { message: 'Instalación completada exitosamente.', results, integrationSnippet: snippet });

    // CORE-123: Build automático post-inyección via SSE
    // CORE-127: La auditoría se escribe DESPUÉS del build para capturar el resultado real
    emit('step', { phase: 'build', status: 'starting', message: '🔨 Verificando compilación del proyecto...' });
    let _buildStatus = 'unknown';
    let _buildLines = [];
    try {
      await new Promise((resolve) => {
        const buildProc = require('child_process').spawn('npm', ['run', 'build', '--', '--logLevel=warn'], {
          cwd: targetProjectDir,
          shell: true,
          env: { ...process.env, FORCE_COLOR: '0' }
        });
        buildProc.stdout.on('data', d => {
          const line = d.toString().trim();
          if (line) { _buildLines.push(line); emit('step', { phase: 'build', status: 'progress', message: line }); }
        });
        buildProc.stderr.on('data', d => {
          const line = d.toString().trim();
          if (line) { _buildLines.push('ERR: ' + line); emit('step', { phase: 'build', status: 'progress', message: line }); }
        });
        buildProc.on('close', code => {
          if (code === 0) {
            _buildStatus = 'success';
            emit('step', { phase: 'build', status: 'success', message: '✅ Compilación exitosa. El componente está correctamente integrado.' });
          } else {
            _buildStatus = 'error';
            emit('step', { phase: 'build', status: 'error', message: `❌ La compilación falló (código ${code}). Revisa los errores anteriores.` });
          }
          resolve();
        });
        buildProc.on('error', err => {
          _buildStatus = 'warn';
          _buildLines.push(`spawn error: ${err.message}`);
          emit('step', { phase: 'build', status: 'warn', message: `⚠ No se pudo ejecutar npm run build: ${err.message}` });
          resolve();
        });
      });
    } catch (buildErr) {
      _buildStatus = 'warn';
      _buildLines.push(buildErr.message);
      emit('step', { phase: 'build', status: 'warn', message: `⚠ Error al verificar compilación: ${buildErr.message}` });
    }

    // CORE-127: Registrar entrada de auditoría con build result real — asíncrono, no bloquea SSE
    {
      const primaryResult = results.find(r => r.type === 'primary');
      const depsResult = results.filter(r => r.type === 'dependency');
      const npmResult = results.filter(r => r.type === 'npm');
      const envVarsUsed = req.body.envValues ? Object.keys(req.body.envValues) : [];
      appendAuditTrailEntry(clientId, {
        id: `inj-${sessionTs}-${clientId}`,
        operation: 'inject',
        status: 'success',
        timestamp: new Date().toISOString(),
        primaryComponent: primaryResult ? {
          name: primaryCompName,
          targetPath: primaryResult.path,
          sourceLink: componentLink,
          checksum: primaryResult.checksum || null
        } : { name: primaryCompName, targetPath: targetRelativePath, sourceLink: componentLink },
        dependencies: depsResult.map(d => ({ name: d.name, targetPath: d.path || d.targetPath || '-', checksum: d.checksum || null })),
        npmPackages: npmResult.map(n => ({ name: n.name, version: n.version || '?', status: n.status })),
        envVarsConfigured: envVarsUsed,
        buildLog: { status: _buildStatus, lines: _buildLines.slice(-20) }, // últimas 20 líneas máx
        stack: { hasAtAlias: targetStack.hasAtAlias, hasTailwind: targetStack.hasTailwind, firebaseConfig: targetStack.firebaseConfigRelPath }
      });
    }
  } catch (err) {
    // CORE-127: Registrar entrada de auditoría (error/auto-rollback)
    appendAuditTrailEntry(clientId, {
      id: `inj-err-${Date.now()}-${clientId}`,
      operation: 'auto-rollback',
      status: 'error',
      timestamp: new Date().toISOString(),
      primaryComponent: { name: primaryCompName || 'desconocido', targetPath: targetRelativePath, sourceLink: componentLink },
      dependencies: [],
      npmPackages: [],
      envVarsConfigured: [],
      buildLog: { status: 'error', lines: [err.message] },
      errorMessage: err.message
    }).catch(() => {});
    console.error(`[API /library/inject/stream] Error: ${err.message}`);
    
    // CORE-125: Auto-rollback transaccional si falla la inyección a mitad de camino
    if (targetProjectDir && typeof sessionInjections !== 'undefined' && sessionInjections.length > 0) {
      emit('step', { phase: 'rollback', status: 'starting', message: `⚠️ Fallo en la instalación. Ejecutando auto-rollback de seguridad...` });
      for (const inj of sessionInjections) {
        try {
          const targetFilePath = path.resolve(targetProjectDir, inj.targetPath);
          if (inj.isNew) {
            if (await fs.pathExists(targetFilePath)) {
              await fs.remove(targetFilePath);
              emit('step', { phase: 'rollback', name: inj.name, status: 'progress', message: `🗑️ Removido archivo huérfano: ${inj.targetPath}` });
            }
          } else if (inj.backupPath) {
            const absoluteBackupPath = path.resolve(
              targetProjectDir,
              path.isAbsolute(inj.backupPath) ? inj.backupPath : path.join(targetProjectDir, inj.backupPath)
            );
            if (await fs.pathExists(absoluteBackupPath)) {
              await fs.copy(absoluteBackupPath, targetFilePath, { overwrite: true });
              emit('step', { phase: 'rollback', name: inj.name, status: 'progress', message: `🗄️ Restaurado desde backup: ${inj.targetPath}` });
            }
          }
        } catch (rollbackErr) {
          console.error(`[inject/stream] Error en auto-rollback de ${inj.targetPath}:`, rollbackErr.message);
        }
      }
      emit('step', { phase: 'rollback', status: 'done', message: `✅ Auto-rollback completado. Workspace restaurado a su estado original.` });
    }
    emit('error', { message: err.message });
  } finally {
    delete projectSyncLocks[clientId];
    res.end();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CORE-123: Endpoints de Registro e Inventario de Componentes Instalados
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/library/inject/registry — Retorna los componentes instalados en un cliente
// Query: ?clientId=ventas
app.get('/api/library/inject/registry', async (req, res) => {
  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  try {
    const targetProjectDir = await findProjectDir(clientId);
    if (!targetProjectDir) return res.status(404).json({ error: `Cliente no encontrado: ${clientId}` });

    const registryPath = path.join(targetProjectDir, '.prototipe-injected.json');
    if (!await fs.pathExists(registryPath)) {
      return res.json({ version: 1, lastUpdated: null, components: [] });
    }

    const registry = await fs.readJson(registryPath);

    // Verificar si los archivos inyectados y sus dependencias siguen existiendo y si fueron modificados externamente
    for (const comp of registry.components) {
      const filePath = path.join(targetProjectDir, comp.targetPath);
      let globalStatus = 'active';

      if (!await fs.pathExists(filePath)) {
        globalStatus = 'missing';
      } else if (comp.checksum) {
        const crypto = await import('crypto');
        const content = await fs.readFile(filePath);
        const currentChecksum = crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
        if (currentChecksum !== comp.checksum) globalStatus = 'modified';
      }

      // Si el archivo principal está intacto, validamos sus dependencias inyectadas en cascada
      if (globalStatus === 'active' && Array.isArray(comp.dependenciesInjected)) {
        const crypto = await import('crypto');
        for (const dep of comp.dependenciesInjected) {
          const depFilePath = path.join(targetProjectDir, dep.targetPath);
          if (!await fs.pathExists(depFilePath)) {
            globalStatus = 'modified'; // Marcamos modificado si falta alguna dependencia interna inyectada
            dep.status = 'missing';
          } else if (dep.checksum) {
            const depContent = await fs.readFile(depFilePath);
            const depChecksum = crypto.createHash('sha256').update(depContent).digest('hex').slice(0, 12);
            if (depChecksum !== dep.checksum) {
              globalStatus = 'modified';
              dep.status = 'modified';
            } else {
              dep.status = 'active';
            }
          }
        }
      }

      comp.status = globalStatus;
    }

    res.json(registry);
  } catch (err) {
    console.error(`[API /library/inject/registry] Error: ${err.message}`);
    res.status(500).json({ error: `Error al leer el registro: ${err.message}` });
  }
});

// POST /api/library/inject/rollback — Restaura un componente desde su backup
// Body: { clientId, componentId }
app.post('/api/library/inject/rollback', async (req, res) => {
  const { clientId, componentId } = req.body;
  if (!clientId || !componentId) {
    return res.status(400).json({ error: 'Los campos "clientId" y "componentId" son obligatorios.' });
  }

  try {
    const targetProjectDir = await findProjectDir(clientId);
    if (!targetProjectDir) return res.status(404).json({ error: `Cliente no encontrado: ${clientId}` });

    const registryPath = path.join(targetProjectDir, '.prototipe-injected.json');
    if (!await fs.pathExists(registryPath)) {
      return res.status(404).json({ error: 'No existe registro de componentes instalados en este cliente.' });
    }

    const registry = await fs.readJson(registryPath);
    const comp = registry.components.find(c => c.id === componentId);
    if (!comp) return res.status(404).json({ error: `Componente "${componentId}" no encontrado en el registro.` });

    // 1. Reversión de dependencias inyectadas en cascada
    const revertedDeps = [];
    if (Array.isArray(comp.dependenciesInjected)) {
      for (const dep of comp.dependenciesInjected) {
        const depTargetFilePath = path.resolve(targetProjectDir, dep.targetPath);
        if (!isPathContained(targetProjectDir, depTargetFilePath)) continue;

        if (dep.isNew) {
          if (await fs.pathExists(depTargetFilePath)) {
            await fs.remove(depTargetFilePath);
            revertedDeps.push({ name: dep.name, action: 'deleted', path: dep.targetPath });
          }
        } else if (dep.backupPath) {
          const depAbsoluteBackupPath = path.resolve(
            targetProjectDir,
            path.isAbsolute(dep.backupPath) ? dep.backupPath : path.join(targetProjectDir, dep.backupPath)
          );
          if (!isPathContained(targetProjectDir, depAbsoluteBackupPath)) continue;

          if (await fs.pathExists(depAbsoluteBackupPath)) {
            await fs.ensureDir(path.dirname(depTargetFilePath));
            await fs.copy(depAbsoluteBackupPath, depTargetFilePath, { overwrite: true });
            revertedDeps.push({ name: dep.name, action: 'restored', path: dep.targetPath });
          }
        }
      }
    }

    // 2. Restauración/Eliminación del componente primario
    const targetFilePath = path.resolve(targetProjectDir, comp.targetPath);
    if (!isPathContained(targetProjectDir, targetFilePath)) {
      return res.status(403).json({ error: 'Ruta destino de restauración fuera del proyecto. Operación denegada.' });
    }

    let primaryAction = 'none';
    if (!comp.backupPath) {
      // Si no hay backupPath, el archivo no existía previamente, por ende se elimina físicamente
      if (await fs.pathExists(targetFilePath)) {
        await fs.remove(targetFilePath);
        primaryAction = 'deleted';
      }
    } else {
      // Restauración de backup
      const absoluteBackupPath = path.resolve(
        targetProjectDir,
        path.isAbsolute(comp.backupPath) ? comp.backupPath : path.join(targetProjectDir, comp.backupPath)
      );

      if (!isPathContained(targetProjectDir, absoluteBackupPath)) {
        return res.status(403).json({ error: 'Ruta de backup fuera del proyecto. Operación denegada.' });
      }

      if (!await fs.pathExists(absoluteBackupPath)) {
        return res.status(404).json({ error: `El archivo de backup no existe: ${comp.backupPath}` });
      }

      await fs.ensureDir(path.dirname(targetFilePath));
      await fs.copy(absoluteBackupPath, targetFilePath, { overwrite: true });
      primaryAction = 'restored';
    }

    // Actualizar estado en el registry
    comp.status = 'rolledback';
    comp.rolledbackAt = new Date().toISOString();
    registry.lastUpdated = new Date().toISOString();
    await fs.writeJson(registryPath, registry, { spaces: 2 });

    // CORE-127: Registrar rollback en auditoría
    appendAuditTrailEntry(clientId, {
      id: `rbk-${Date.now()}-${clientId}`,
      operation: 'rollback',
      status: 'success',
      timestamp: new Date().toISOString(),
      componentId,
      primaryComponent: { name: comp.name || componentId, targetPath: comp.targetPath, action: primaryAction },
      dependencies: revertedDeps.map(d => ({ name: d.name, targetPath: d.path, action: d.action })),
      npmPackages: [],
      envVarsConfigured: [],
      buildLog: { status: 'N/A', lines: [] }
    }).catch(() => {});

    res.json({
      success: true,
      message: `Componente "${componentId}" revertido exitosamente.`,
      primaryAction,
      revertedDependencies: revertedDeps,
      restoredTo: comp.targetPath
    });
  } catch (err) {
    console.error(`[API /library/inject/rollback] Error: ${err.message}`);
    res.status(500).json({ error: `Error en rollback: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CORE-127: Endpoints de Auditoría — Historial de Inyecciones
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/library/inject/audit-trail
 * Query: ?clientId=ventas&page=1&limit=20&operation=inject&status=success&search=
 * Retorna el historial paginado del cliente en orden cronológico inverso.
 */
app.get('/api/library/inject/audit-trail', async (req, res) => {
  const { clientId, page = '1', limit = '20', operation, status, search } = req.query;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  try {
    const projectDir = await findProjectDir(clientId);
    if (!projectDir) return res.status(404).json({ error: `Cliente no encontrado: ${clientId}` });

    const jsonlPath = path.join(projectDir, '.prototipe-audit-trail.jsonl');
    if (!await fs.pathExists(jsonlPath)) {
      return res.json({ total: 0, page: 1, limit: parseInt(limit), entries: [] });
    }

    const raw = await fs.readFile(jsonlPath, 'utf-8');
    const MAX_ENTRIES = 2000; // Cap anti-OOM: máximo 2000 entradas en memoria
    const allLines = raw.trim().split('\n').filter(Boolean);
    // Solo procesar las últimas MAX_ENTRIES líneas (las más recientes al final del JSONL)
    const linesToParse = allLines.length > MAX_ENTRIES ? allLines.slice(-MAX_ENTRIES) : allLines;
    let entries = linesToParse.map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);

    // Orden cronológico inverso
    entries.reverse();

    // Filtros
    if (operation) entries = entries.filter(e => e.operation === operation);
    if (status) entries = entries.filter(e => e.status === status);
    if (search) {
      const sq = search.toLowerCase();
      entries = entries.filter(e =>
        JSON.stringify(e).toLowerCase().includes(sq)
      );
    }

    // Paginación
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const total = entries.length;
    const paginated = entries.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      entries: paginated
    });
  } catch (err) {
    console.error(`[API /audit-trail] Error: ${err.message}`);
    res.status(500).json({ error: `Error al leer el historial: ${err.message}` });
  }
});

/**
 * GET /api/library/inject/audit-diff
 * Query: ?clientId=ventas&componentId=MiComponente
 * Retorna el diff de texto entre la versión de backup y la versión actual del componente.
 */
app.get('/api/library/inject/audit-diff', async (req, res) => {
  const { clientId, componentId } = req.query;
  if (!clientId || !componentId) return res.status(400).json({ error: 'Los parámetros "clientId" y "componentId" son obligatorios.' });

  try {
    const projectDir = await findProjectDir(clientId);
    if (!projectDir) return res.status(404).json({ error: `Cliente no encontrado: ${clientId}` });

    const registryPath = path.join(projectDir, '.prototipe-injected.json');
    if (!await fs.pathExists(registryPath)) return res.status(404).json({ error: 'No hay registro de componentes.' });

    const registry = await fs.readJson(registryPath);
    const comp = registry.components.find(c => c.id === componentId);
    if (!comp) return res.status(404).json({ error: `Componente "${componentId}" no encontrado.` });

    const currentPath = path.resolve(projectDir, comp.targetPath);
    const backupPath = comp.backupPath
      ? path.resolve(projectDir, path.isAbsolute(comp.backupPath) ? comp.backupPath : path.join(projectDir, comp.backupPath))
      : null;

    if (!isPathContained(projectDir, currentPath)) return res.status(403).json({ error: 'Acceso denegado.' });

    const currentContent = await fs.pathExists(currentPath) ? await fs.readFile(currentPath, 'utf-8') : '';
    const backupContent = (backupPath && await fs.pathExists(backupPath)) ? await fs.readFile(backupPath, 'utf-8') : '';

    const diff = Diff.createTwoFilesPatch(
      `${componentId} (backup/original)`,
      `${componentId} (actual)`,
      backupContent,
      currentContent
    );

    res.json({
      componentId,
      targetPath: comp.targetPath,
      backupPath: comp.backupPath || null,
      hasBackup: !!backupContent,
      hasCurrent: !!currentContent,
      diff
    });
  } catch (err) {
    console.error(`[API /audit-diff] Error: ${err.message}`);
    res.status(500).json({ error: `Error al generar diff: ${err.message}` });
  }
});

function buildTags(name, technicalName, description, category) {
  const text = `${name} ${technicalName} ${description} ${category}`.toLowerCase();
  const tags = new Set();

  // ── Tag de categoría (siempre presente) ──
  // Remueve prefijo numérico (ej. "02_") y normaliza
  const catSlug = category
    .replace(/^\d+_/, '')
    .replace(/\s+/g, '_')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quitar tildes
  if (catSlug) tags.add(catSlug);

  // ── Tag de tipo de recurso ──
  // Permite filtrar por "modulo" o "componente" desde la nube de tags también
  if (category.toLowerCase().includes('módulo') || category.toLowerCase().includes('modulo')) {
    tags.add('modulo');
  }

  // ── Firebase / Backend ──
  if (text.includes('firebase') || text.includes('firestore') || text.includes('auth')) tags.add('firebase');

  // ── Hooks / Estado ──
  if (/\buse[a-z]/.test(text) || text.includes('hook')) tags.add('hook');
  if (text.includes('zustand') || text.includes('store') || text.includes('estado') || text.includes('contexto')) tags.add('estado');

  // ── UI / Interacción ──
  if (text.includes('modal') || text.includes('dialog')) tags.add('modal');
  if (text.includes('toast') || text.includes('notifica') || text.includes('alert')) tags.add('notificacion');
  if (text.includes('animac') || text.includes('framer') || text.includes('motion') || text.includes('tilt') || text.includes('glow') || text.includes('magnetic') || text.includes('marquee') || text.includes('parallax')) tags.add('animacion');
  if (text.includes('cursor') || text.includes('ambient')) tags.add('efecto');
  if (text.includes('skeleton') || text.includes('loader') || text.includes('loading') || text.includes('carga')) tags.add('loading');
  if (text.includes('swipe') || text.includes('sheet') || text.includes('bottom')) tags.add('mobile');
  if (text.includes('dark') || text.includes('tema') || text.includes('theme') || text.includes('modo')) tags.add('tema');
  if (text.includes('card') || text.includes('tarjeta') || text.includes('bento') || text.includes('carrusel')) tags.add('card');
  if (text.includes('form') || text.includes('input') || text.includes('campo') || text.includes('selector') || text.includes('picker') || text.includes('otp') || text.includes('currency') || text.includes('date')) tags.add('formulario');
  if (text.includes('table') || text.includes('tabla') || text.includes('grid') || text.includes('heatmap')) tags.add('tabla');
  if (text.includes('button') || text.includes('boton') || text.includes('btn')) tags.add('boton');
  if (text.includes('breadcrumb') || text.includes('header') || text.includes('nav') || text.includes('menu') || text.includes('radial')) tags.add('navegacion');
  if (text.includes('stepper') || text.includes('wizard') || text.includes('paso') || text.includes('tour') || text.includes('tutorial') || text.includes('onboard')) tags.add('flujo');
  if (text.includes('coupon') || text.includes('cupon') || text.includes('badge') || text.includes('descuento') || text.includes('ruleta') || text.includes('rifa') || text.includes('boleta') || text.includes('suerte')) tags.add('gamificacion');
  if (text.includes('logo') || text.includes('brand') || text.includes('marca')) tags.add('branding');

  // ── E-commerce / Negocio ──
  if (text.includes('carrito') || text.includes('cart') || text.includes('producto') || text.includes('catalog') || text.includes('tienda') || text.includes('shop')) tags.add('ecommerce');
  if (text.includes('checkout') || text.includes('pago') || text.includes('payment')) tags.add('pago');
  if (text.includes('pos') || text.includes('caja') || text.includes('scanner') || text.includes('scan') || text.includes('barcode') || text.includes('qr')) tags.add('pos');
  if (text.includes('qr')) tags.add('qr');
  if (text.includes('pedido') || text.includes('order') || text.includes('tracking') || text.includes('seguimiento')) tags.add('pedidos');
  if (text.includes('factura') || text.includes('invoice') || text.includes('comision') || text.includes('billing')) tags.add('facturacion');
  if (text.includes('inventari') || text.includes('stock') || text.includes('bodega') || text.includes('almac')) tags.add('inventario');
  if (text.includes('cocina') || text.includes('kds') || text.includes('kitchen')) tags.add('kds');
  if (text.includes('domicili') || text.includes('delivery') || text.includes('reparto') || text.includes('repartidor')) tags.add('domicilios');

  // ── Servicios / Agenda ──
  if (text.includes('agenda') || text.includes('reserva') || text.includes('cita') || text.includes('calendar') || text.includes('fecha')) tags.add('agenda');
  if (text.includes('whatsapp') || text.includes('omnicanal') || text.includes('chat') || text.includes('mensaje')) tags.add('whatsapp');
  if (text.includes('mapa') || text.includes('leaflet') || text.includes('geo') || text.includes('ubicac')) tags.add('mapa');

  // ── Auth / Seguridad ──
  if (text.includes('auth') || text.includes('login') || text.includes('sesion') || text.includes('guard') || text.includes('perfil') || text.includes('profile') || text.includes('user')) tags.add('auth');
  if (text.includes('error') || text.includes('boundary') || text.includes('fallback') || text.includes('empty') || text.includes('estado vacio') || text.includes('empty state')) tags.add('error');

  // ── PWA / Técnico ──
  if (text.includes('pwa') || text.includes('install') || text.includes('offline') || text.includes('manifest')) tags.add('pwa');
  if (text.includes('pdf') || text.includes('exporta') || text.includes('report') || text.includes('report')) tags.add('pdf');
  if (text.includes('telemetria') || text.includes('analytics') || text.includes('monitoreo') || text.includes('log')) tags.add('telemetria');
  if (text.includes('kbar') || text.includes('command') || text.includes('palette') || text.includes('spotlight')) tags.add('command');
  if (text.includes('connectivity') || text.includes('red') || text.includes('offline') || text.includes('network')) tags.add('conectividad');
  if (text.includes('local storage') || text.includes('localstorage') || text.includes('persist') || text.includes('cache')) tags.add('storage');
  if (text.includes('debounce') || text.includes('throttle') || text.includes('timeout')) tags.add('performance');
  if (text.includes('pagina') || text.includes('paginac') || text.includes('pagination')) tags.add('paginacion');
  if (text.includes('contador') || text.includes('quantity') || text.includes('cantidad')) tags.add('cantidad');
  if (text.includes('portafolio') || text.includes('galeria') || text.includes('media')) tags.add('media');
  if (text.includes('sistema de notificaciones') || text.includes('notification system') || text.includes('notif center')) tags.add('sistema_notif');

  return [...tags];
}

// Endpoint para leer un archivo de código fuente de un proyecto local
app.get('/api/project/file', async (req, res) => {
  const { clientId, relativePath } = req.query;

  if (!clientId || !relativePath) {
    return res.status(400).json({ error: 'Los parámetros "clientId" y "relativePath" son obligatorios.' });
  }

  try {
    const targetProjectDir = await findProjectDir(clientId);
    if (!targetProjectDir) {
      return res.status(404).json({ error: `No se pudo encontrar el directorio del proyecto local para el cliente: ${clientId}` });
    }

    // 3. Normalizar la ruta relativa del archivo
    let cleanRelativePath = relativePath;
    // Si viene como N/A, cancelamos de inmediato
    if (cleanRelativePath === 'N/A') {
      return res.status(400).json({ error: 'La ruta de archivo especificada es N/A.' });
    }
    
    // Si tiene un formato /src/ o src/ al inicio
    if (cleanRelativePath.startsWith('/')) {
      cleanRelativePath = cleanRelativePath.slice(1);
    }

    let filePath = path.resolve(targetProjectDir, cleanRelativePath);

    // 4. Validación de seguridad contra directory traversal
    if (!isPathContained(targetProjectDir, filePath)) {
      return res.status(403).json({ error: 'Acceso denegado. La ruta está fuera del proyecto.' });
    }

    if (!await fs.pathExists(filePath)) {
      // Intentar búsqueda recursiva por nombre de archivo y mapear alias comunes
      const fileName = path.basename(cleanRelativePath);
      const candidates = [fileName];
      
      if (fileName.toLowerCase() === 'categoriasview.jsx') {
        candidates.push('CategoryManager.jsx');
      } else if (fileName.toLowerCase() === 'categorymanager.jsx') {
        candidates.push('CategoriasView.jsx');
      }

      let foundPath = null;
      const searchFileRecursively = async (dir) => {
        if (foundPath) return;
        const items = await fs.readdir(dir).catch(() => []);
        for (const item of items) {
          const full = path.join(dir, item);
          const stat = await fs.stat(full).catch(() => null);
          if (stat?.isDirectory()) {
            const lowerItem = item.toLowerCase();
            if (
              lowerItem === 'node_modules' ||
              lowerItem === 'dist' ||
              lowerItem === 'build' ||
              lowerItem === '.git' ||
              lowerItem === '.vite' ||
              item.startsWith('.')
            ) {
              continue;
            }
            await searchFileRecursively(full);
          } else if (stat?.isFile()) {
            if (candidates.some(c => item.toLowerCase() === c.toLowerCase())) {
              foundPath = full;
              break;
            }
          }
        }
      };

      await searchFileRecursively(targetProjectDir);
      if (foundPath) {
        filePath = foundPath;
      } else {
        return res.status(404).json({ error: `El archivo no existe en la ruta física: ${filePath}` });
      }
    }

    const content = await fs.readFile(filePath, 'utf-8');
    res.json({
      success: true,
      content,
      filePath
    });
  } catch (err) {
    console.error(`[API /project/file] Error al leer archivo de proyecto: ${err.message}`);
    res.status(500).json({ error: `Error al leer el archivo de proyecto: ${err.message}` });
  }
});

/**
 * GET /api/e2e/projects
 * Escanea el Workspace Root en busca de proyectos que tengan playwright.config.js
 * y devuelve la lista automáticamente — sin configuración manual.
 */
app.get('/api/e2e/projects', async (req, res) => {
  const baseAppsDir = getWorkspaceRoot();
  const plantillasCoreDir = path.join(path.dirname(baseAppsDir), 'Plantillas Core');
  
  const directoriesToScan = [
    { path: baseAppsDir, suffix: '' }
  ];
  
  if (await fs.pathExists(plantillasCoreDir)) {
    directoriesToScan.push({ path: plantillasCoreDir, suffix: ' (Core)' });
  }

  try {
    const projects = [];

    for (const scanDir of directoriesToScan) {
      if (!await fs.pathExists(scanDir.path)) continue;
      const items = await fs.readdir(scanDir.path);

      for (const item of items) {
        const fullPath = path.join(scanDir.path, item);
        try {
          const stat = await fs.stat(fullPath);
          if (!stat.isDirectory()) continue;

          // Detectar si tiene playwright instalado
          const hasPlaywright = await fs.pathExists(path.join(fullPath, 'playwright.config.js'))
                             || await fs.pathExists(path.join(fullPath, 'playwright.config.ts'));
          if (!hasPlaywright) continue;

          // Leer el nombre del package.json si existe
          let label = item;
          const pkgPath = path.join(fullPath, 'package.json');
          if (await fs.pathExists(pkgPath)) {
            try {
              const pkg = await fs.readJson(pkgPath);
              if (pkg.name) label = pkg.name;
            } catch {}
          }

          // ID normalizado a kebab-case
          const id = item.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const finalLabel = label.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + scanDir.suffix;

          projects.push({ 
            id: scanDir.suffix ? `${id}-core` : id, 
            label: finalLabel, 
            path: fullPath 
          });
        } catch {}
      }
    }

    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ error: `Error al escanear proyectos: ${err.message}` });
  }
});


const e2eLastResults = {};

/**
 * POST /api/e2e/run
 * Lanza los tests E2E de un proyecto y devuelve los logs en streaming (Server-Sent Events).
 * Body: { projectPath: string, projectId: string }
 *
 * El cliente (dashboard) consume los eventos:
 *   - data: { type: 'log', line: string }
 *   - data: { type: 'result', passed: boolean, duration: string, summary: string }
 */
app.post('/api/e2e/run', (req, res) => {
  const { projectPath, projectId } = req.body;

  if (!projectPath || !projectId) {
    return res.status(400).json({ error: 'Los campos "projectPath" y "projectId" son obligatorios.' });
  }

  // Cabeceras SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  console.log(`[E2E] Iniciando Playwright en: ${projectPath}`);
  send({ type: 'log', line: `🎭 Iniciando tests E2E para: ${projectId}` });
  send({ type: 'log', line: `📂 Directorio: ${projectPath}` });
  send({ type: 'log', line: '─────────────────────────────────────────' });

  const startTime = Date.now();
  let testFinished = false;
  let clientDisconnected = false;

  // Spawn con shell:true. Usamos detached:false (default) para que el proceso sea hijo directo.
  // NO usamos windowsHide para evitar que Windows le envíe señales de control de consola.
  const child = spawn('npm', ['run', 'test:ci'], {
    cwd: projectPath,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '0', CI: '1' }
  });

  console.log(`[E2E] PID del proceso hijo: ${child.pid}`);

  child.on('error', (err) => {
    console.error(`[E2E] Error en proceso hijo: ${err.message}`);
    send({ type: 'log', line: `❌ Error de proceso: ${err.message}` });
  });

  const collectLines = (chunk) => {
    return chunk.toString()
      .split(/\r?\n/)
      .filter(l => l.trim().length > 0);
  };

  child.stdout.on('data', (chunk) => {
    for (const line of collectLines(chunk)) {
      send({ type: 'log', line });
    }
  });

  child.stderr.on('data', (chunk) => {
    for (const line of collectLines(chunk)) {
      send({ type: 'log', line: `⚠ ${line}` });
    }
  });

  // Hard Timeout de seguridad incondicional (180 segundos)
  const hardTimeout = setTimeout(async () => {
    if (!testFinished) {
      console.log(`[E2E] Hard Timeout de seguridad (180s): deteniendo suite Playwright (PID ${child.pid}).`);
      send({ type: 'log', line: '❌ Timeout de ejecución superado (180s). Proceso interrumpido.' });
      testFinished = true;
      if (child.pid) {
        await killProcessTree(child.pid);
      }
      if (!res.writableEnded) {
        send({ type: 'result', passed: false, duration: '180s', summary: '❌ Timeout superado' });
        res.end();
      }
    }
  }, 180000);

  child.on('close', (code, signal) => {
    clearTimeout(hardTimeout);
    testFinished = true;
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const passed = code === 0;
    const summary = passed
      ? `✅ Tests pasaron en ${duration}s`
      : signal
        ? `❌ Tests interrumpidos (señal ${signal}) en ${duration}s`
        : `❌ Tests fallaron (código ${code}) en ${duration}s`;

    console.log(`[E2E] ${summary} | clientDisconnected=${clientDisconnected}`);

    send({ type: 'log', line: '─────────────────────────────────────────' });
    send({ type: 'result', passed, duration: `${duration}s`, summary, exitCode: code, signal });

    e2eLastResults[projectId] = {
      passed,
      duration: `${duration}s`,
      summary,
      exitCode: code,
      signal,
      timestamp: new Date().toISOString()
    };

    if (!res.writableEnded) res.end();
  });

  // IMPORTANTE: req.on('close') se dispara inmediatamente con fetch()+SSE porque el browser
  // cierra el request-side de la conexión al recibir los headers. NO matar el hijo aquí.
  // Solo registrar para diagnóstico.
  req.on('close', () => {
    clientDisconnected = true;
    console.log(`[E2E] req.close. testFinished=${testFinished}, pid=${child.pid}`);
    // Si los tests ya terminaron, no hacer nada.
    // Si el cliente realmente se desconectó DESPUÉS de 120s sin resultado, entonces matar.
    if (!testFinished) {
      setTimeout(async () => {
        if (!testFinished) {
          console.log(`[E2E] Timeout de seguridad tras desconexión: matando proceso hijo (PID ${child.pid}).`);
          testFinished = true;
          if (child.pid) {
            await killProcessTree(child.pid);
          }
        }
      }, 120000); // 2 minutos de timeout de seguridad tras desconexión
    }
  });
});

/**
 * GET /api/e2e/last-result?projectId=xxx
 * Devuelve el último resultado de tests E2E para un proyecto dado.
 * Útil para que el dashboard muestre el estado sin re-ejecutar.
 */
app.get('/api/e2e/last-result', (req, res) => {
  const { projectId } = req.query;
  if (!projectId) {
    return res.status(400).json({ error: 'El parámetro "projectId" es obligatorio.' });
  }
  const result = e2eLastResults[projectId] || null;
  res.json({ success: true, result });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/register-core
// Registra una nueva Plantilla Core en el ecosistema:
//   1. Crea D:\PROTOTIPE\Plantillas Core\App [nombre]\
//   2. Provisiona los 12 archivos de documentación estándar
//   3. Crea la carpeta vacía en templates/template-[clave]/
//   4. Registra la entrada en plantillas_registro.json
// Body: { nombre: string, clave: string, nicho: string }
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/register-core', async (req, res) => {
  const { nombre, clave, nicho } = req.body;

  if (!nombre || !clave || !nicho) {
    return res.status(400).json({ error: 'Los campos "nombre", "clave" y "nicho" son obligatorios.' });
  }

  // Sanitizar clave: solo minúsculas, guiones, sin espacios
  const safeClave = clave.toLowerCase().replace(/[^a-z0-9\-]/g, '-').replace(/(^-|-$)/g, '');
  const safeNombre = nombre.trim();
  const coreName = safeNombre.startsWith('App ') ? safeNombre : `App ${safeNombre}`;

  const WORKSPACE_ROOT = getWorkspaceRoot();
  const parentWorkspace = path.dirname(WORKSPACE_ROOT);
  const corePath = path.join(parentWorkspace, 'Plantillas Core', coreName);
  const docDirName = `Documentacion ${coreName}`;
  const docPath = path.join(corePath, docDirName);
  const templatePath = path.join(CLI_ROOT, 'templates', `template-${safeClave}`);
  const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');

  try {
    // 1. Validar que no exista ya un core con ese nombre o clave
    if (await fs.pathExists(corePath)) {
      return res.status(409).json({ error: `Ya existe una plantilla core en: ${corePath}` });
    }

    const registro = await fs.readJson(registroPath);
    if (registro.plantillas[safeClave]) {
      return res.status(409).json({ error: `La clave "${safeClave}" ya está registrada en plantillas_registro.json.` });
    }

    // 2. Crear carpeta del core con GEMINI.md, README.md y package.json mínimo
    await fs.ensureDir(corePath);

    const geminiSource = path.join(parentWorkspace, 'Documentacion PROTOTIPE', '04_Estandares_y_Skills', 'Copia_Seguridad_Reglas_y_Skills', 'GEMINI.md');
    if (await fs.pathExists(geminiSource)) {
      await fs.copy(geminiSource, path.join(corePath, 'GEMINI.md'));
    }

    await fs.writeFile(path.join(corePath, 'README.md'),
      `# ${coreName}\n\nPlantilla core para el nicho: **${nicho}**.\n\n> Desarrollar el core antes de activarla en \`plantillas_registro.json\`.\n`, 'utf-8');

    await fs.writeJson(path.join(corePath, 'package.json'), {
      name: `template-${safeClave}`,
      version: '0.0.1',
      description: `Plantilla core PROTOTIPE — ${nicho}`,
      private: true
    }, { spaces: 2 });

    // 3. Provisionar los 12 archivos de documentación estándar
    await fs.ensureDir(docPath);
    const today = new Date().toISOString().split('T')[0];

    const docStandard = [
      { name: 'tareas_pendientes.md',     content: `# 📋 Control de Tareas — ${coreName}\n\n- [ ] Diseñar arquitectura de rutas y vistas\n- [ ] Definir esquema de colecciones Firestore\n- [ ] Completar \`contexto_negocio.md\` con descripción del nicho\n- [ ] Completar \`guia_estilos_ui.md\` con paleta HSL del core\n- [ ] Desarrollar módulos principales\n- [ ] Marcar como \`activo: true\` en plantillas_registro.json cuando esté lista\n` },
      { name: 'bitacora_cambios.md',      content: `# 📝 Bitácora de Cambios — ${coreName}\n\n### [${today}] - Creación del Core\n* **Tipo:** Sistema\n* **Nicho:** ${nicho}\n* **Descripción:** Plantilla core registrada y documentación estándar provisionada automáticamente.\n` },
      { name: 'mapa_aplicacion.md',       content: `# 🗺️ Mapa de la Aplicación — ${coreName}\n\n> Actualiza este documento when definas módulos, rutas o vistas.\n\n## Rutas y Vistas\n*(Por definir)*\n\n## Módulos de Negocio\n*(Por definir)*\n` },
      { name: 'esquema_colecciones.md',   content: `# 🗄️ Esquema de Colecciones Firestore — ${coreName}\n\n> Define aquí las colecciones principales de este core.\n\n## Colecciones\n*(Por definir)*\n` },
      { name: 'plan_implementacion_ia.md',content: `# 🤖 Plan de Implementación IA — ${coreName}\n\nPropuestas de automatización con IA para este core.\n\n## Automatizaciones\n*(Por definir)*\n` },
      { name: 'manual_migracion.md',      content: `# 🚀 Manual de Despliegue — ${coreName}\n\n## Stack\n- React + Vite\n- Firebase Firestore\n- Tailwind CSS v4\n\n## Comandos\n\`\`\`bash\nnpm run build\nfirebase deploy --only hosting\n\`\`\`\n` },
      { name: 'flujos_aplicacion.md',     content: `# 🔄 Flujos Operativos — ${coreName}\n\n## Flujo Principal del Negocio\n*(Documentar el flujo core del nicho: ${nicho})*\n` },
      { name: 'mapa_arquitectura.md',     content: `# 🏗️ Mapa de Arquitectura Física — ${coreName}\n\n> Ejecutar \`node scratch/generate_ia_map.js\` para auto-generar este mapa.\n\n*(Por completar al desarrollar el core)*\n` },
      { name: 'mapa_arquitectura_ia.md',  content: `# 🧠 Mapa Semántico para IA — ${coreName}\n\n## Archivos Críticos\n| Archivo | Propósito |\n|---|---|\n| \`src/App.jsx\` | Entrada principal |\n| \`src/store/\` | Stores Zustand |\n| \`src/hooks/\` | Hooks de negocio |\n\n*(Actualizar conforme se desarrolle el core)*\n` },
      { name: 'contexto_negocio.md',      content: `# 🏢 Contexto de Negocio — ${coreName}\n\n> **CRÍTICO PARA LA IA:** Sin este archivo completo, la IA generará código técnicamente correcto pero semánticamente incorrecto para el nicho.\n\n## Nicho\n**${nicho}**\n\n## Usuario Final\n*(Describir: quién usa la app, nivel técnico, dispositivos principales)*\n\n## Flujos de Negocio en Lenguaje Natural\n*(Describir los procesos core paso a paso, sin términos técnicos)*\n\n## Reglas de Dominio Implícitas\n*(Reglas no obvias que la IA debe respetar)*\n\n## KPIs del Negocio\n*(Qué métricas le importan al dueño del negocio)*\n` },
      { name: 'restricciones_tecnicas.md',content: `# 🚫 Restricciones Técnicas — ${coreName}\n\n## Stack Fijo (No Negociable)\n- React + Vite\n- Tailwind CSS v4 con tokens HSL en \`@theme\`\n- Firebase Firestore + Auth\n- Zustand\n\n## Patrones Prohibidos\n- ❌ Hardcodear credenciales\n- ❌ \`onSnapshot\` sin Auth ni cleanup\n- ❌ Modificar inventario sin \`runTransaction\`\n- ❌ Bordes negros crudos\n- ❌ Despliegues automáticos sin aprobación\n\n## Dependencias con Versión Fijada\n| Dependencia | Versión | Razón |\n|---|---|---|\n| firebase | Ver package.json | Compatibilidad con reglas Firestore |\n` },
      { name: 'guia_estilos_ui.md',       content: `# 🎨 Guía de Estilos UI — ${coreName}\n\n> Definir la paleta HSL antes de desarrollar el core.\n\n## Paleta de Colores\n- **Primario:** \`hsl(?, ?, ?)\` — *Por definir*\n- **Acento:** \`hsl(?, ?, ?)\`\n- **Fondo:** \`hsl(224, 71%, 4%)\`\n- **Texto:** \`hsl(213, 31%, 91%)\`\n\n## Tipografía\n- **Google Font:** Inter (default)\n\n## Tokens de Diseño\n| Token | Valor |\n|---|---|\n| Radius | 0.75rem (cards) / 0.5rem (botones) |\n| Shadow | \`0 4px 24px hsl(var(--primary)/0.15)\` |\n| Glassmorphism | \`backdrop-blur-xl\` |\n\n## Componentes Atómicos en \`/src/components/ui/\`\n*(Listar al desarrollar el core)*\n` }
    ];

    for (const doc of docStandard) {
      await fs.writeFile(path.join(docPath, doc.name), doc.content, 'utf-8');
    }

    // 4. Crear carpeta vacía de template en CLI
    await fs.ensureDir(templatePath);
    await fs.writeFile(path.join(templatePath, '.gitkeep'), '', 'utf-8');

    // 4.1 Proporcionar archivos Firebase base en el Core
    const firestoreRulesDefault = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper de validación de administrador global
    function isAdmin() {
      return request.auth != null && 
        exists(/databases/\$(database)/documents/users/\$(request.auth.uid)) &&
        get(/databases/\$(database)/documents/users/\$(request.auth.uid)).data.role == 'admin';
    }

    // Aislamiento multitenant de la telemetría del cliente
    match /clientes_control/{clientId} {
      allow read: if request.auth != null && (clientId == request.auth.token.clientId || isAdmin());
      allow write: if isAdmin();
    }

    // Colección de usuarios
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && (request.auth.uid == userId || isAdmin());
    }

    // Telemetría y errores
    match /app_failures/{failureId} {
      allow create: if request.auth != null;
      allow read, update, delete: if isAdmin();
    }
    match /reportesBilling/{reportId} {
      allow create: if request.auth != null;
      allow read, update, delete: if isAdmin();
    }

    // Regla de fallback
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
`;
    const storageRulesDefault = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper de validación de administrador cruzando con Firestore
    function isAdminUser() {
      return request.auth != null &&
        firestore.exists(/databases/(default)/documents/users/\$(request.auth.uid)) &&
        firestore.get(/databases/(default)/documents/users/\$(request.auth.uid)).data.role == 'admin';
    }

    // Escrituras a recursos generales de marca o core requieren rol admin
    match /brand/{allPaths=**} {
      allow read: if true;
      allow write: if isAdminUser();
    }
    match /core/{allPaths=**} {
      allow read: if true;
      allow write: if isAdminUser();
    }

    // El resto de los directorios de usuario
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
`;
    const firestoreIndexesDefault = JSON.stringify({ indexes: [], fieldOverrides: [] }, null, 2) + '\n';
    const firebaseJsonDefault = JSON.stringify({
      firestore: {
        rules: "firestore.rules",
        indexes: "firestore.indexes.json"
      },
      storage: {
        rules: "storage.rules"
      },
      hosting: {
        public: "dist",
        ignore: [
          "firebase.json",
          "**/.*",
          "**/node_modules/**"
        ],
        headers: [
          {
            source: "/index.html",
            headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }]
          },
          {
            source: "/sw.js",
            headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }]
          },
          {
            source: "/firebase-messaging-sw.js",
            headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }]
          },
          {
            source: "/manifest.webmanifest",
            headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }]
          },
          {
            source: "/manifest.json",
            headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }]
          },
          {
            source: "/assets/**",
            headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
          }
        ],
        rewrites: [
          {
            source: "**",
            destination: "/index.html"
          }
        ]
      }
    }, null, 2) + '\n';

    await fs.writeFile(path.join(corePath, 'firestore.rules'), firestoreRulesDefault, 'utf-8');
    await fs.writeFile(path.join(corePath, 'storage.rules'), storageRulesDefault, 'utf-8');
    await fs.writeFile(path.join(corePath, 'firestore.indexes.json'), firestoreIndexesDefault, 'utf-8');
    await fs.writeFile(path.join(corePath, 'firebase.json'), firebaseJsonDefault, 'utf-8');

    // 5. Registrar en plantillas_registro.json
    registro.plantillas[safeClave] = {
      fuente: corePath.replace(/\\/g, '/'),
      destino: templatePath.replace(/\\/g, '/'),
      nicho,
      activo: false,
      version: '0.0.1'
    };
    await fs.writeJson(registroPath, registro, { spaces: 2 });

    console.log(`[API] Nueva plantilla core registrada: ${coreName} (clave: ${safeClave})`);
    res.json({
      success: true,
      message: `Plantilla core "${coreName}" registrada con éxito.`,
      data: {
        coreName,
        clave: safeClave,
        nicho,
        corePath,
        docPath,
        templatePath,
        archivosCreados: [...docStandard.map(d => d.name), 'firestore.rules', 'storage.rules', 'firestore.indexes.json', 'firebase.json']
      }
    });

  } catch (err) {
    console.error(`[API /register-core] Error: ${err.message}`);
    res.status(500).json({ error: `Error al registrar la plantilla core: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cores
// Lista todas las plantillas core registradas con su estado
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/cores', async (req, res) => {
  const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
  try {
    const registro = await fs.readJson(registroPath);
    const cores = Object.entries(registro.plantillas).map(([clave, data]) => ({
      clave,
      ...data,
      docPath: `${data.fuente}/Documentacion ${data.fuente.split('/').pop()}`
    }));
    res.json({ success: true, cores });
  } catch (err) {
    res.status(500).json({ error: `Error al leer el registro de plantillas: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cores/metadata
// Carga y consolida los manifiestos core-manifest.json de todas las plantillas cores
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/cores/metadata', async (req, res) => {
  const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
  try {
    const registro = await fs.readJson(registroPath);
    const metadata = {};

    for (const [clave, data] of Object.entries(registro.plantillas)) {
      const manifestPath = path.join(data.fuente, 'core-manifest.json');
      if (await fs.pathExists(manifestPath)) {
        try {
          const manifest = await fs.readJson(manifestPath);
          metadata[clave] = {
            ...data,
            manifest
          };
        } catch (jsonErr) {
          metadata[clave] = {
            ...data,
            manifest: null,
            error: `Error al parsear core-manifest.json: ${jsonErr.message}`
          };
        }
      } else {
        metadata[clave] = {
          ...data,
          manifest: null
        };
      }
    }

    res.json({ success: true, metadata });
  } catch (err) {
    res.status(500).json({ error: `Error al cargar metadatos de cores: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/cores/:clave/scaffold
// Copia la estructura de código de un core existente como punto de partida.
// Reemplaza referencias del nombre base por el nombre del nuevo core.
// Body: { baseCore: string }  — clave del core fuente (ej. "ventas")
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/cores/:clave/scaffold', async (req, res) => {
  const { clave } = req.params;
  const { baseCore } = req.body;

  if (!baseCore) {
    return res.status(400).json({ error: 'El campo "baseCore" es obligatorio (clave del core fuente, ej: "ventas").' });
  }

  const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
  try {
    const registro = await fs.readJson(registroPath);

    const targetConfig = registro.plantillas[clave];
    if (!targetConfig) return res.status(404).json({ error: `La clave "${clave}" no existe en el registro.` });

    const targetCorePath = targetConfig.fuente.replace(/\//g, path.sep);
    let baseCorePath;

    if (baseCore === 'core-seed' || baseCore === 'template-core-seed') {
      baseCorePath = path.join(CLI_ROOT, 'templates', 'template-core-seed');
    } else {
      const baseConfig = registro.plantillas[baseCore];
      if (!baseConfig) return res.status(404).json({ error: `El core base "${baseCore}" no existe en el registro.` });
      baseCorePath = baseConfig.fuente.replace(/\//g, path.sep);
    }

    // Rutas y nombres para reemplazo de texto
    const baseName   = path.basename(baseCorePath);   // ej. "App Ventas" o "template-core-seed"
    const targetName = path.basename(targetCorePath); // ej. "App Contabilidad"

    // Archivos de código que se copian (excluye docs, secrets y configs de cliente)
    const SCAFFOLD_PATHS = [
      'src/components', 'src/hooks', 'src/services', 'src/store',
      'src/layouts', 'src/pages', 'src/routes', 'src/utils',
      'src/constants', 'src/schemas', 'src/providers',
      'src/App.jsx', 'src/App.css', 'src/index.css', 'src/main.jsx',
      'firestore.indexes.json', 'firestore.rules', 'storage.rules',
      'vite.config.js', 'eslint.config.js', 'index.html',
      'public'
    ];

    const EXCLUDE_EXACT = new Set([
      '.env.local', '.env', '.firebaserc', 'firebase.json',
      'package-lock.json', '.firebase', 'dist', 'node_modules',
      '.git', 'scratch', 'playwright-report', 'test-results'
    ]);

    const copied = [];
    const skipped = [];

    for (const relPath of SCAFFOLD_PATHS) {
      const srcPath  = path.join(baseCorePath, relPath);
      const destPath = path.join(targetCorePath, relPath);

      if (EXCLUDE_EXACT.has(path.basename(relPath))) { skipped.push(relPath); continue; }
      if (!await fs.pathExists(srcPath)) { skipped.push(relPath + ' (no existe en base)'); continue; }

      await fs.copy(srcPath, destPath, {
        overwrite: true,
        filter: (src) => {
          const name = path.basename(src);
          return !EXCLUDE_EXACT.has(name);
        }
      });
      copied.push(relPath);
    }

    // Copiar package.json adaptado (sin credenciales)
    const basePkg = path.join(baseCorePath, 'package.json');
    if (await fs.pathExists(basePkg)) {
      const pkg = await fs.readJson(basePkg);
      pkg.name = `template-${clave}`;
      pkg.version = '0.1.0';
      pkg.description = `Plantilla core PROTOTIPE — ${targetConfig.nicho}`;
      // Limpiar scripts de despliegue cliente
      delete pkg.scripts?.deploy;
      await fs.writeJson(path.join(targetCorePath, 'package.json'), pkg, { spaces: 2 });
      copied.push('package.json');
    }

    // Reemplazar texto de referencias al nombre del core base en archivos copiados
    const textExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.md']);

    async function replaceInDir(dirPath) {
      if (!await fs.pathExists(dirPath)) return;
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          if (!EXCLUDE_EXACT.has(entry.name)) await replaceInDir(fullPath);
        } else if (entry.isFile() && textExtensions.has(path.extname(entry.name).toLowerCase())) {
          try {
            let content = await fs.readFile(fullPath, 'utf-8');
            const modified = content
              .replace(new RegExp(baseName, 'g'), targetName)
              .replace(new RegExp(baseName.toLowerCase().replace(/\s+/g, '-'), 'g'), clave)
              .replace(new RegExp(baseName.toLowerCase().replace(/\s+/g, '_'), 'g'), clave.replace(/-/g, '_'));
            if (modified !== content) {
              await fs.writeFile(fullPath, modified, 'utf-8');
            }
          } catch { /* ignorar archivos no-texto */ }
        }
      }
    }

    for (const relPath of copied) {
      const fullDest = path.join(targetCorePath, relPath);
      const stat = await fs.stat(fullDest).catch(() => null);
      if (stat?.isDirectory()) await replaceInDir(fullDest);
    }

    console.log(`[API] Scaffold del core "${clave}" completado desde base "${baseCore}".`);
    res.json({
      success: true,
      message: `Scaffold de "${targetName}" completado a partir de "${baseName}".`,
      data: { copied, skipped, targetCorePath }
    });

  } catch (err) {
    console.error(`[API /cores/${clave}/scaffold] Error: ${err.message}`);
    res.status(500).json({ error: `Error en scaffold: ${err.message}` });
  }
});
// Helper para sincronizar archivos del core a la plantilla del CLI (sanitizado) con opción de poda (prune)
// ─────────────────────────────────────────────────────────────────────────────
async function performCoreSync(clave, CLI_ROOT, options = {}) {
  const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
  const registro = await fs.readJson(registroPath);
  const config = registro.plantillas[clave];
  if (!config) throw new Error(`La clave "${clave}" no existe en el registro.`);

  const corePath     = config.fuente.replace(/\//g, path.sep);
  const templatePath = config.destino.replace(/\//g, path.sep);
  const prune = options.prune === true;

  // 0. Failsafes físicos y de seguridad contra borrados catastróficos
  if (!corePath || !templatePath) {
    throw new Error('Las rutas de origen (corePath) o destino (templatePath) no pueden estar vacías.');
  }

  const resolvedCore = path.resolve(corePath);
  const resolvedTemplate = path.resolve(templatePath);

  // Evitar directorios raíz
  const rootCore = path.parse(resolvedCore).root;
  const rootTemplate = path.parse(resolvedTemplate).root;
  if (resolvedCore === rootCore || resolvedTemplate === rootTemplate) {
    throw new Error('No se permite sincronizar directamente desde o hacia la raíz del sistema de archivos.');
  }

  // Asegurar que no sean la misma ruta
  if (resolvedCore === resolvedTemplate) {
    throw new Error('La ruta de origen y destino no pueden ser idénticas.');
  }

  // Asegurar que el destino está contenido dentro del directorio de plantillas del CLI
  if (!isPathContained(TEMPLATES_DIR, resolvedTemplate)) {
    throw new Error('La ruta de destino de la plantilla debe estar dentro del directorio de plantillas del CLI.');
  }

  // 1. Validar que el core tiene código real
  const hasCode = await fs.pathExists(path.join(corePath, 'src'));
  if (!hasCode) {
    throw new Error(`El core "${clave}" no tiene código en /src/ todavía. Sincronización omitida.`);
  }

  // 2. Sincronizar código core → templates/
  const SYNC_PATHS = [
    // Directorios estándar de código y recursos React
    'src/components', 'src/hooks', 'src/services', 'src/store',
    'src/layouts', 'src/pages', 'src/routes', 'src/utils',
    'src/constants', 'src/schemas', 'src/types', 'src/providers',
    'src/config', 'src/context', 'src/theme', 'src/styles',
    'src/locales', 'src/features', 'src/state', 'src/assets',
    
    // Archivos de entrada y hojas de estilo base
    'src/App.jsx', 'src/App.tsx', 'src/App.css', 'src/index.css',
    'src/main.jsx', 'src/main.tsx',
    
    // Archivos de configuración de Firebase, PWA y Bundlers
    'firestore.indexes.json', 'firestore.rules', 'storage.rules',
    'vite.config.js', 'vite.config.ts', 'eslint.config.js',
    'tailwind.config.js', 'tailwind.config.ts',
    'postcss.config.js', 'postcss.config.cjs', 'postcss.config.ts',
    'tsconfig.json', 'jsconfig.json',
    
    // Documentación central y punto de entrada HTML
    'GEMINI.md', '.env.example', '.cursorrules',
    'index.html', 'public'
  ];

  const EXCLUDE_FROM_TEMPLATE = new Set([
    // Archivos locales secretos o de configuración de hosting específicos (en minúsculas para coincidencia case-insensitive)
    '.env.local', '.env', '.firebaserc', 'firebase.json',
    
    // Entornos de compilación y dependencias
    'dist', 'node_modules', '.git', '.firebase', '.vite', '.eslintcache', '.parcel-cache',
    
    // Carpetas de desarrollo y pruebas locales
    'scratch', 'playwright-report', 'test-results', '.gitkeep',
    
    // Archivos temporales y metadatos de sistema operativo
    '.ds_store', 'thumbs.db', 'npm-debug.log', 'yarn-error.log', 'pnpm-debug.log', 'firebase-debug.log',

    // Exclusiones de seguridad adicionales del Core para evitar fugas de credenciales locales o configuraciones
    '.npmrc', '.gitattributes', '.github', '.gitignore', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'
  ]);

  await fs.ensureDir(templatePath);
  const synced = [];

  // Copiar directorios controlados concurrentemente con filtro insensible a mayúsculas
  await Promise.all(SYNC_PATHS.map(async (relPath) => {
    const src  = path.join(corePath, relPath);
    const dest = path.join(templatePath, relPath);
    if (!await fs.pathExists(src)) return;
    await fs.copy(src, dest, {
      overwrite: true,
      filter: (s) => !EXCLUDE_FROM_TEMPLATE.has(path.basename(s).toLowerCase())
    });
    synced.push(relPath);
  }));

  // Purgar archivos obsoletos en el template (poda) si está activo
  if (prune) {
    const collectFilesLocal = async (baseDir, relPath, resultList = []) => {
      const fullPath = path.join(baseDir, relPath);
      if (!await fs.pathExists(fullPath)) return resultList;
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        const files = await fs.readdir(fullPath);
        await Promise.all(files.map(file => {
          if (EXCLUDE_FROM_TEMPLATE.has(file.toLowerCase())) return;
          return collectFilesLocal(baseDir, path.join(relPath, file), resultList);
        }));
      } else {
        resultList.push(relPath.replace(/\\/g, '/'));
      }
      return resultList;
    };

    const coreFiles = [];
    const templateFiles = [];
    await Promise.all(SYNC_PATHS.map(p => collectFilesLocal(corePath, p, coreFiles)));
    await Promise.all(SYNC_PATHS.map(p => collectFilesLocal(templatePath, p, templateFiles)));

    // Sincronizar también la purga en la carpeta Documentacion del Core/Template
    const filesInCore = await fs.readdir(corePath).catch(() => []);
    const docDirInCore = filesInCore.find(f => f.startsWith('Documentacion'));
    if (docDirInCore && await fs.pathExists(path.join(corePath, docDirInCore))) {
      await collectFilesLocal(corePath, docDirInCore, coreFiles);
    }
    const filesInTemplate = await fs.readdir(templatePath).catch(() => []);
    const docDirInTemplate = filesInTemplate.find(f => f.startsWith('Documentacion'));
    if (docDirInTemplate && await fs.pathExists(path.join(templatePath, docDirInTemplate))) {
      await collectFilesLocal(templatePath, docDirInTemplate, templateFiles);
    }

    const coreFilesSet = new Set(coreFiles);
    for (const tempFile of templateFiles) {
      if (!coreFilesSet.has(tempFile)) {
        const fileToDelete = path.join(templatePath, tempFile);
        try {
          // Failsafe redundante por archivo antes de eliminar
          if (isPathContained(templatePath, fileToDelete)) {
            await fs.remove(fileToDelete);
            console.log(`[Sync Prune] Eliminado archivo huérfano del template: ${tempFile}`);
          }
        } catch (err) {
          console.warn(`[Sync Prune] No se pudo eliminar ${tempFile}:`, err.message);
        }
      }
    }
  }
  // Copiar package.json sanitizado (sin credenciales de cliente)
  const srcPkg = path.join(corePath, 'package.json');
  if (await fs.pathExists(srcPkg)) {
    const pkg = await fs.readJson(srcPkg);
    delete pkg.scripts?.deploy;
    await fs.writeJson(path.join(templatePath, 'package.json'), pkg, { spaces: 2 });
    synced.push('package.json');
  }

  // Copiar carpeta Documentacion del core al template (como referencia base)
  const docDirName = `Documentacion App ${clave.charAt(0).toUpperCase() + clave.slice(1)}`;
  const files = await fs.readdir(corePath);
  const docDir = files.find(f => f.startsWith('Documentacion'));

  if (docDir && await fs.pathExists(path.join(corePath, docDir))) {
    const templateDocs = path.join(templatePath, docDir);
    await fs.copy(path.join(corePath, docDir), templateDocs, { overwrite: true });
    synced.push(docDir);
  }

  // 2.1. Sanitización de referencias de clientes en la plantilla copiada
  const tokens = {
    projectId: '',
    apiKey: '',
    measurementId: '',
    packageName: '',
    appId: '',
    telemetryToken: ''
  };

  // Extraer tokens de package.json
  if (await fs.pathExists(srcPkg)) {
    try {
      const pkg = await fs.readJson(srcPkg);
      tokens.packageName = pkg.name || '';
    } catch (_) {}
  }

  // Extraer tokens de .env.local
  const envPath = path.join(corePath, '.env.local');
  if (await fs.pathExists(envPath)) {
    try {
      const envContent = await fs.readFile(envPath, 'utf8');
      const parseEnvValue = (key) => {
        const match = envContent.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'\\n]+)["']?`, 'm'));
        return match ? match[1].trim() : '';
      };
      tokens.projectId         = parseEnvValue('VITE_FIREBASE_PROJECT_ID');
      tokens.apiKey            = parseEnvValue('VITE_FIREBASE_API_KEY');
      tokens.measurementId     = parseEnvValue('VITE_FIREBASE_MEASUREMENT_ID');
      tokens.appId             = parseEnvValue('VITE_FIREBASE_APP_ID');
      tokens.telemetryToken    = '';
    } catch (_) {}
  }

  const srcProjectId = tokens.projectId || 'ventas-smartfix';

  const sanitizeFile = async (filePath) => {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      const dirFiles = await fs.readdir(filePath);
      await Promise.all(dirFiles.map(async (file) => {
        if ([
          'node_modules', '.git', 'dist', '.vite', '.firebase', 
          'playwright-report', 'test-results', 'scratch', 'scripts'
        ].includes(file)) return;
        await sanitizeFile(path.join(filePath, file));
      }));
    } else {
      const ext = path.extname(filePath);
      if (['.js', '.jsx', '.json', '.md', '.html', '.rules'].includes(ext)) {
        let content = await fs.readFile(filePath, 'utf8');
        let changed = false;

        // Replace Project ID
        if (srcProjectId && content.includes(srcProjectId)) {
          content = content.replace(new RegExp(srcProjectId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'proyecto-cliente-saas');
          changed = true;
        }

        // Replace Package Name EXCLUSIVAMENTE en package.json
        if (path.basename(filePath) === 'package.json' && tokens.packageName && content.includes(tokens.packageName)) {
          content = content.replace(new RegExp(tokens.packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'proyecto-cliente-saas');
          changed = true;
        }

        // Replace API Key
        if (tokens.apiKey && content.includes(tokens.apiKey)) {
          content = content.replace(new RegExp(tokens.apiKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'AIzaSy[API_KEY_DE_CLIENTE_AUTOGENERADA]');
          changed = true;
        }
        if (/AIzaSy[A-Za-z0-9_-]{33}/g.test(content)) {
          content = content.replace(/AIzaSy[A-Za-z0-9_-]{33}/g, 'AIzaSy[API_KEY_DE_CLIENTE_AUTOGENERADA]');
          changed = true;
        }

        // Replace App ID
        if (tokens.appId && content.includes(tokens.appId)) {
          content = content.replace(new RegExp(tokens.appId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'APP_ID_MUTABLE');
          changed = true;
        }

        // Replace Telemetry Token
        if (tokens.telemetryToken && content.includes(tokens.telemetryToken)) {
          content = content.replace(new RegExp(tokens.telemetryToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'TELEMETRIA_TOKEN_MUTABLE');
          changed = true;
        }

        // Replace index.html title/metas
        if (path.basename(filePath) === 'index.html') {
          content = content.replace(/<title>[^<]*<\/title>/gi, '<title>Prototipe App Base</title>');
          content = content.replace(/<meta\s+name="apple-mobile-web-app-title"\s+content="[^"]*"\s*\/?>/gi, '<meta name="apple-mobile-web-app-title" content="Prototipe App Base" />');
          changed = true;
        }

        // Replace generic measurement ID
        if (/G-[A-Za-z0-9]{10}/g.test(content)) {
          content = content.replace(/G-[A-Za-z0-9]{10}/g, 'G-[ID_MEDICION_TEMPORAL]');
          changed = true;
        }

        if (changed) {
          await fs.writeFile(filePath, content, 'utf8');
        }
      }
    }
  };

  await sanitizeFile(templatePath);
  return { synced, templatePath };
}


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/cores/:clave/activate
// Sincroniza el código del core al templates/ del CLI y marca activo: true.
// Equivale a correr sync_templates.js [clave] --yes y actualizar el registro.
// Body: {}
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/cores/:clave/activate', async (req, res) => {
  const { clave } = req.params;
  const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
  const prune = req.body.prune === true;

  if (syncLocks[clave]) {
    return res.status(429).json({ 
      error: `Ya existe un proceso de sincronización o activación activo para el Core "${clave}". Por favor, espera a que termine.` 
    });
  }

  syncLocks[clave] = true;
  try {
    const registro = await fs.readJson(registroPath);
    const config = registro.plantillas[clave];
    if (!config) return res.status(404).json({ error: `La clave "${clave}" no existe en el registro.` });

    // Sincronizar código usando el helper común
    const { synced, templatePath } = await performCoreSync(clave, CLI_ROOT, { prune });

    // Incrementar versión (patch) y marcar activo: true
    const [major, minor, patch] = (config.version || '0.1.0').split('.').map(Number);
    const newVersion = `${major}.${minor}.${patch + 1}`;
    registro.plantillas[clave].activo  = true;
    registro.plantillas[clave].version = newVersion;
    await fs.writeJson(registroPath, registro, { spaces: 2 });

    // Actualizar también el package.json del core fuente
    try {
      const corePkgPath = path.join(config.fuente.replace(/\//g, path.sep), 'package.json');
      if (await fs.pathExists(corePkgPath)) {
        const corePkg = await fs.readJson(corePkgPath);
        corePkg.version = newVersion;
        await fs.writeJson(corePkgPath, corePkg, { spaces: 2 });
        console.log(`[API] package.json del core fuente actualizado a v${newVersion}.`);
      }
    } catch (pkgErr) {
      console.warn(`[API] No se pudo actualizar package.json del core fuente: ${pkgErr.message}`);
    }

    console.log(`[API] Plantilla core "${clave}" activada v${newVersion}.`);
    res.json({
      success: true,
      message: `Plantilla "${clave}" activada correctamente (v${newVersion}). Ya aparece en el wizard de creación de clientes.`,
      data: { clave, version: newVersion, synced, templatePath }
    });

  } catch (err) {
    console.error(`[API /cores/${clave}/activate] Error: ${err.message}`);
    res.status(500).json({ error: `Error al activar la plantilla: ${err.message}` });
  } finally {
    delete syncLocks[clave];
  }
});


// POST /api/cores/:clave/bump-version
// Incrementa la versión SemVer patch del core, actualiza package.json en disco y sincroniza al CLI.
// No requiere body. Responde con la nueva versión asignada y el resultado de la sincronización.
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/cores/:clave/bump-version', async (req, res) => {
  const { clave } = req.params;
  const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');

  if (syncLocks[clave]) {
    return res.status(429).json({
      error: `Ya existe un proceso activo para el Core "${clave}". Espera a que termine.`
    });
  }

  syncLocks[clave] = true;
  try {
    const registro = await fs.readJson(registroPath);
    const config = registro.plantillas[clave];
    if (!config) {
      return res.status(404).json({ error: `La clave "${clave}" no existe en el registro.` });
    }

    // Calcular nueva versión patch
    const currentVersion = config.version || '1.0.0';
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    const newVersion = `${major}.${minor}.${(isNaN(patch) ? 0 : patch) + 1}`;

    // 1. Actualizar plantillas_registro.json
    registro.plantillas[clave].version = newVersion;
    await fs.writeJson(registroPath, registro, { spaces: 2 });

    // 2. Actualizar package.json del core fuente
    const coreSrcPath = config.fuente.replace(/\//g, path.sep);
    const corePkgPath = path.join(coreSrcPath, 'package.json');
    if (await fs.pathExists(corePkgPath)) {
      const corePkg = await fs.readJson(corePkgPath);
      corePkg.version = newVersion;
      await fs.writeJson(corePkgPath, corePkg, { spaces: 2 });
    }

    // 3. Re-sincronizar archivos del core fuente al directorio templates/ del CLI
    let synced = 0;
    let templatePath = '';
    try {
      const result = await performCoreSync(clave, CLI_ROOT, { prune: false });
      synced = result.synced;
      templatePath = result.templatePath;
    } catch (syncErr) {
      console.warn(`[bump-version] Sync al template falló (no crítico): ${syncErr.message}`);
    }

    console.log(`[API] Core "${clave}" bumped a v${newVersion} (${synced} archivos sincronizados).`);
    res.json({
      success: true,
      message: `Versión del core "${clave}" actualizada a v${newVersion}.`,
      data: { clave, previousVersion: currentVersion, newVersion, synced, templatePath }
    });

  } catch (err) {
    console.error(`[API /cores/${clave}/bump-version] Error: ${err.message}`);
    res.status(500).json({ error: `Error al actualizar la versión del core: ${err.message}` });
  } finally {
    delete syncLocks[clave];
  }
});


// POST /api/cores/:clave/sync
// Sincroniza el código del core al templates/ del CLI sin cambiar el estado activo ni la versión.
// Body: {}
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/cores/:clave/sync', async (req, res) => {
  const { clave } = req.params;
  const prune = req.body.prune === true;

  if (syncLocks[clave]) {
    return res.status(429).json({ 
      error: `Ya existe un proceso de sincronización activo para el Core "${clave}". Por favor, espera a que termine.` 
    });
  }

  syncLocks[clave] = true;
  try {
    const { synced, templatePath } = await performCoreSync(clave, CLI_ROOT, { prune });
    res.json({
      success: true,
      message: `Plantilla "${clave}" sincronizada correctamente con el CLI sin alterar su estado en el wizard.`,
      data: { clave, synced, templatePath }
    });
  } catch (err) {
    console.error(`[API /cores/${clave}/sync] Error: ${err.message}`);
    res.status(500).json({ error: `Error al sincronizar la plantilla: ${err.message}` });
  } finally {
    delete syncLocks[clave];
  }
});


// Helper para sanitizar el contenido del core en memoria antes de la comparación física para evitar falsos drifts
function sanitizeCoreContentForDrift(filePath, content, tokens, srcProjectId) {
  let changedContent = content;
  const ext = path.extname(filePath);
  const base = path.basename(filePath);

  if (['.js', '.jsx', '.json', '.md', '.html', '.rules'].includes(ext)) {
    // Replace Project ID
    if (srcProjectId && changedContent.includes(srcProjectId)) {
      changedContent = changedContent.replace(new RegExp(srcProjectId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'proyecto-cliente-saas');
    }

    // Replace Package Name EXCLUSIVAMENTE en package.json
    if (base === 'package.json' && tokens.packageName && changedContent.includes(tokens.packageName)) {
      changedContent = changedContent.replace(new RegExp(tokens.packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'proyecto-cliente-saas');
    }

    // Replace API Key
    if (tokens.apiKey && changedContent.includes(tokens.apiKey)) {
      changedContent = changedContent.replace(new RegExp(tokens.apiKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'AIzaSy[API_KEY_DE_CLIENTE_AUTOGENERADA]');
    }
    if (/AIzaSy[A-Za-z0-9_-]{33}/g.test(changedContent)) {
      changedContent = changedContent.replace(/AIzaSy[A-Za-z0-9_-]{33}/g, 'AIzaSy[API_KEY_DE_CLIENTE_AUTOGENERADA]');
    }

    // Replace App ID
    if (tokens.appId && changedContent.includes(tokens.appId)) {
      changedContent = changedContent.replace(new RegExp(tokens.appId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'APP_ID_MUTABLE');
    }

    // Replace Telemetry Token
    if (tokens.telemetryToken && changedContent.includes(tokens.telemetryToken)) {
      changedContent = changedContent.replace(new RegExp(tokens.telemetryToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'TELEMETRIA_TOKEN_MUTABLE');
    }

    // Replace index.html title/metas
    if (base === 'index.html') {
      changedContent = changedContent.replace(/<title>[^<]*<\/title>/gi, '<title>Prototipe App Base</title>');
      changedContent = changedContent.replace(/<meta\s+name="apple-mobile-web-app-title"\s+content="[^"]*"\s*\/?>/gi, '<meta name="apple-mobile-web-app-title" content="Prototipe App Base" />');
    }

    // Replace generic measurement ID
    if (/G-[A-Za-z0-9]{10}/g.test(changedContent)) {
      changedContent = changedContent.replace(/G-[A-Za-z0-9]{10}/g, 'G-[ID_MEDICION_TEMPORAL]');
    }
  }

  // Si es package.json, remover también el script deploy para simular la sanitización del destino
  if (base === 'package.json') {
    try {
      const pkgObj = JSON.parse(changedContent);
      if (pkgObj.scripts && pkgObj.scripts.deploy) {
        delete pkgObj.scripts.deploy;
      }
      changedContent = JSON.stringify(pkgObj, null, 2);
    } catch (_) {}
  }

  return changedContent;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cores/:clave/drift
// Calcula las diferencias físicas (drift) entre el Core de desarrollo y la plantilla empaquetada
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/cores/:clave/drift', async (req, res) => {
  const { clave } = req.params;
  const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
  try {
    const registro = await fs.readJson(registroPath);
    const config = registro.plantillas[clave];
    if (!config) {
      return res.status(404).json({ error: `La plantilla core con clave "${clave}" no existe.` });
    }

    const corePath     = config.fuente.replace(/\//g, path.sep);
    const templatePath = config.destino.replace(/\//g, path.sep);

    const hasCode = await fs.pathExists(path.join(corePath, 'src'));
    if (!hasCode) {
      return res.json({
        success: true,
        parityPercent: 0,
        syncedCount: 0,
        totalCount: 0,
        differences: [],
        message: 'El Core no contiene código de desarrollo todavía.'
      });
    }

    const SYNC_PATHS = [
      // Directorios estándar de código y recursos React
      'src/components', 'src/hooks', 'src/services', 'src/store',
      'src/layouts', 'src/pages', 'src/routes', 'src/utils',
      'src/constants', 'src/schemas', 'src/types', 'src/providers',
      'src/config', 'src/context', 'src/theme', 'src/styles',
      'src/locales', 'src/features', 'src/state', 'src/assets',
      
      // Archivos de entrada y hojas de estilo base
      'src/App.jsx', 'src/App.tsx', 'src/App.css', 'src/index.css',
      'src/main.jsx', 'src/main.tsx',
      
      // Archivos de configuración de Firebase, PWA y Bundlers
      'firestore.indexes.json', 'firestore.rules', 'storage.rules',
      'vite.config.js', 'vite.config.ts', 'eslint.config.js',
      'tailwind.config.js', 'tailwind.config.ts',
      'postcss.config.js', 'postcss.config.cjs', 'postcss.config.ts',
      'tsconfig.json', 'jsconfig.json',
      
      // Documentación central y punto de entrada HTML
      'GEMINI.md', '.env.example', '.cursorrules',
      'index.html', 'public'
    ];

    const EXCLUDE_FROM_TEMPLATE = new Set([
      // Archivos locales secretos o de configuración de hosting específicos
      '.env.local', '.env', '.firebaserc', 'firebase.json',
      
      // Entornos de compilación y dependencias
      'dist', 'node_modules', '.git', '.firebase', '.vite', '.eslintcache', '.parcel-cache',
      
      // Carpetas de desarrollo y pruebas locales
      'scratch', 'playwright-report', 'test-results', '.gitkeep',
      
      // Archivos temporales y metadatos de sistema operativo
      '.DS_Store', 'Thumbs.db', 'npm-debug.log', 'yarn-error.log', 'pnpm-debug.log', 'firebase-debug.log'
    ]);

    const collectFilesLocal = async (baseDir, relPath, resultList = []) => {
      const fullPath = path.join(baseDir, relPath);
      if (!await fs.pathExists(fullPath)) return resultList;
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        const files = await fs.readdir(fullPath);
        await Promise.all(files.map(file => {
          if (EXCLUDE_FROM_TEMPLATE.has(file)) return;
          return collectFilesLocal(baseDir, path.join(relPath, file), resultList);
        }));
      } else {
        resultList.push(relPath.replace(/\\/g, '/'));
      }
      return resultList;
    };

    const coreFiles = [];
    const templateFiles = [];
    await Promise.all(SYNC_PATHS.map(p => collectFilesLocal(corePath, p, coreFiles)));
    await Promise.all(SYNC_PATHS.map(p => collectFilesLocal(templatePath, p, templateFiles)));

    if (await fs.pathExists(path.join(corePath, 'package.json'))) {
      coreFiles.push('package.json');
    }
    if (await fs.pathExists(path.join(templatePath, 'package.json'))) {
      templateFiles.push('package.json');
    }

    const filesInCore = await fs.readdir(corePath).catch(() => []);
    const docDirInCore = filesInCore.find(f => f.startsWith('Documentacion'));
    if (docDirInCore && await fs.pathExists(path.join(corePath, docDirInCore))) {
      await collectFilesLocal(corePath, docDirInCore, coreFiles);
    }
    const filesInTemplate = await fs.readdir(templatePath).catch(() => []);
    const docDirInTemplate = filesInTemplate.find(f => f.startsWith('Documentacion'));
    if (docDirInTemplate && await fs.pathExists(path.join(templatePath, docDirInTemplate))) {
      await collectFilesLocal(templatePath, docDirInTemplate, templateFiles);
    }

    const coreFilesSet = new Set(coreFiles);
    const templateFilesSet = new Set(templateFiles);
    const allFiles = new Set([...coreFiles, ...templateFiles]);

    const tokens = {
      projectId: '',
      apiKey: '',
      measurementId: '',
      packageName: '',
      appId: '',
      telemetryToken: ''
    };
    
    const srcPkg = path.join(corePath, 'package.json');
    if (await fs.pathExists(srcPkg)) {
      try {
        const pkg = await fs.readJson(srcPkg);
        tokens.packageName = pkg.name || '';
      } catch (_) {}
    }

    const envPath = path.join(corePath, '.env.local');
    if (await fs.pathExists(envPath)) {
      try {
        const envContent = await fs.readFile(envPath, 'utf8');
        const parseEnvValue = (key) => {
          const match = envContent.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'\\n]+)["']?`, 'm'));
          return match ? match[1].trim() : '';
        };
        tokens.projectId         = parseEnvValue('VITE_FIREBASE_PROJECT_ID');
        tokens.apiKey            = parseEnvValue('VITE_FIREBASE_API_KEY');
        tokens.measurementId     = parseEnvValue('VITE_FIREBASE_MEASUREMENT_ID');
        tokens.appId             = parseEnvValue('VITE_FIREBASE_APP_ID');
        tokens.telemetryToken    = '';
      } catch (_) {}
    }
    const srcProjectId = tokens.projectId || 'ventas-smartfix';

    const differences = [];
    let huerfanosCount = 0;

    const isBinaryExt = (file) => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.pdf', '.zip', '.woff', '.woff2', '.ttf', '.eot'].includes(ext);
    };

    for (const file of allFiles) {
      const isCore = coreFilesSet.has(file);
      const isTemplate = templateFilesSet.has(file);

      if (isCore && !isTemplate) {
        differences.push({
          file,
          status: 'missing_in_template',
          message: 'Pendiente de sincronizar (no existe en la plantilla CLI).',
          isBinary: isBinaryExt(file)
        });
      } else if (!isCore && isTemplate) {
        huerfanosCount++;
        differences.push({
          file,
          status: 'orphan_in_template',
          message: 'Archivo obsoleto en la plantilla (no existe en el Core).',
          isBinary: isBinaryExt(file)
        });
      } else {
        const srcPath = path.join(corePath, file);
        const destPath = path.join(templatePath, file);

        const isBin = isBinaryExt(file);
        if (isBin) {
          const statSrc = await fs.stat(srcPath).catch(() => null);
          const statDest = await fs.stat(destPath).catch(() => null);
          if (statSrc?.size !== statDest?.size) {
            differences.push({
              file,
              status: 'modified',
              message: 'Archivo binario difiere en tamaño.',
              isBinary: true
            });
          }
        } else {
          const coreRaw = await fs.readFile(srcPath, 'utf8').catch(() => '');
          const templateRaw = await fs.readFile(destPath, 'utf8').catch(() => '');

          const coreSanitized = sanitizeCoreContentForDrift(file, coreRaw, tokens, srcProjectId);

          const coreClean = coreSanitized.replace(/\r\n/g, '\n').trim();
          const templateClean = templateRaw.replace(/\r\n/g, '\n').trim();

          if (coreClean !== templateClean) {
            differences.push({
              file,
              status: 'modified',
              message: 'El contenido difiere de la plantilla del Core.',
              isBinary: false
            });
          }
        }
      }
    }

    const totalCount = coreFiles.length + huerfanosCount;
    const syncedCount = totalCount - differences.length;
    const parityPercent = totalCount > 0 ? Math.round((syncedCount / totalCount) * 100) : 100;

    res.json({
      success: true,
      parityPercent,
      syncedCount,
      totalCount,
      differences
    });

  } catch (err) {
    console.error(`[API /cores/${clave}/drift] Error: ${err.message}`);
    res.status(500).json({ error: `Error al calcular diferencias: ${err.message}` });
  }
});

// GET /api/cores/:clave/diff
// Devuelve las diferencias línea por línea para un archivo específico bajo demanda (lazy-loading)
app.get('/api/cores/:clave/diff', async (req, res) => {
  const { clave } = req.params;
  const { file } = req.query;

  if (!file) {
    return res.status(400).json({ error: 'El parámetro "file" es obligatorio.' });
  }

  const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
  try {
    const registro = await fs.readJson(registroPath);
    const config = registro.plantillas[clave];
    if (!config) {
      return res.status(404).json({ error: `La plantilla core con clave "${clave}" no existe.` });
    }

    const corePath     = config.fuente.replace(/\//g, path.sep);
    const templatePath = config.destino.replace(/\//g, path.sep);

    const resolvedCoreFile = path.resolve(corePath, file);
    const resolvedTemplateFile = path.resolve(templatePath, file);

    if (!isPathContained(corePath, resolvedCoreFile) || !isPathContained(templatePath, resolvedTemplateFile)) {
      return res.status(403).json({ error: 'Acceso denegado: ruta de archivo fuera de los límites del proyecto.' });
    }

    if (!await fs.pathExists(resolvedCoreFile) || !await fs.pathExists(resolvedTemplateFile)) {
      return res.status(404).json({ error: `El archivo "${file}" no existe en ambas ubicaciones.` });
    }

    const ext = path.extname(file).toLowerCase();
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.pdf', '.zip', '.woff', '.woff2', '.ttf', '.eot'];
    if (binaryExtensions.includes(ext)) {
      return res.status(400).json({ error: 'No se pueden generar diffs de archivos binarios.' });
    }

    const tokens = {
      projectId: '',
      apiKey: '',
      measurementId: '',
      packageName: '',
      appId: '',
      telemetryToken: ''
    };
    
    const srcPkg = path.join(corePath, 'package.json');
    if (await fs.pathExists(srcPkg)) {
      try {
        const pkg = await fs.readJson(srcPkg);
        tokens.packageName = pkg.name || '';
      } catch (_) {}
    }

    const envPath = path.join(corePath, '.env.local');
    if (await fs.pathExists(envPath)) {
      try {
        const envContent = await fs.readFile(envPath, 'utf8');
        const parseEnvValue = (key) => {
          const match = envContent.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'\\n]+)["']?`, 'm'));
          return match ? match[1].trim() : '';
        };
        tokens.projectId         = parseEnvValue('VITE_FIREBASE_PROJECT_ID');
        tokens.apiKey            = parseEnvValue('VITE_FIREBASE_API_KEY');
        tokens.measurementId     = parseEnvValue('VITE_FIREBASE_MEASUREMENT_ID');
        tokens.appId             = parseEnvValue('VITE_FIREBASE_APP_ID');
        tokens.telemetryToken    = '';
      } catch (_) {}
    }
    const srcProjectId = tokens.projectId || 'ventas-smartfix';

    const coreRaw = await fs.readFile(resolvedCoreFile, 'utf8');
    const templateRaw = await fs.readFile(resolvedTemplateFile, 'utf8');

    const coreSanitized = sanitizeCoreContentForDrift(file, coreRaw, tokens, srcProjectId);

    const coreClean = coreSanitized.replace(/\r\n/g, '\n').trim();
    const templateClean = templateRaw.replace(/\r\n/g, '\n').trim();

    const diff = Diff.diffLines(templateClean, coreClean);

    res.json({
      success: true,
      file,
      diff
    });

  } catch (err) {
    console.error(`[API /cores/${clave}/diff] Error: ${err.message}`);
    res.status(500).json({ error: `Error al calcular diff de archivo: ${err.message}` });
  }
});

// Helper para resolver el ID de proyecto de Firebase de forma robusta y 100% automatizada
async function resolveFirebaseProjectId(projectDir, clientId) {
  let projectId = null;

  // 1. Intentar leer desde .firebaserc (Fuente de verdad oficial de Firebase CLI)
  const rcPath = path.join(projectDir, '.firebaserc');
  if (await fs.pathExists(rcPath)) {
    try {
      const rc = await fs.readJson(rcPath);
      projectId = rc.projects?.default;
    } catch (_) {}
  }

  // 2. Intentar leer desde .env.local (Configuración de entorno del cliente)
  if (!projectId) {
    const envPath = path.join(projectDir, '.env.local');
    if (await fs.pathExists(envPath)) {
      try {
        const envContent = await fs.readFile(envPath, 'utf8');
        const match = envContent.match(/VITE_FIREBASE_PROJECT_ID\s*=\s*(.+)/);
        if (match && match[1]) {
          projectId = match[1].trim().replace(/['"]/g, '');
        }
      } catch (_) {}
    }
  }

  // 3. Intentar leer desde .prototipe.json (Metadatos de la instancia)
  const metaPath = path.join(projectDir, '.prototipe.json');
  let meta = null;
  if (!projectId && await fs.pathExists(metaPath)) {
    try {
      meta = await fs.readJson(metaPath);
      projectId = meta.firebaseProjectId;
    } catch (_) {}
  }


  // AUTO-DETECCIÓN Y AUTO-CREACIÓN DE PROYECTO (CERO PASOS MANUALES)
  if (!projectId) {
    try {
      console.log(`[Firebase Auto] Buscando proyectos activos para asociar con "${clientId}"...`);
      const { stdout } = await execAsync('firebase projects:list --json', { timeout: 30000 });
      const listResult = JSON.parse(stdout);
      const activeProjects = listResult.result || [];
      
      // 1. Intentar buscar un proyecto existente que coincida o contenga el clientId
      const match = activeProjects.find(p => 
        p.projectId.toLowerCase() === clientId.toLowerCase() ||
        p.projectId.toLowerCase().startsWith(clientId.toLowerCase() + '-') ||
        p.projectId.toLowerCase().includes(clientId.toLowerCase())
      );

      if (match) {
        console.log(`[Firebase Auto] Auto-asociando con proyecto existente encontrado: ${match.projectId}`);
        // Escribir el .firebaserc de forma automática para persistir la selección
        await fs.writeJson(rcPath, { projects: { default: match.projectId } }, { spaces: 2 });
        projectId = match.projectId;
      } else {
        // 2. Si no hay coincidencia, auto-creamos un nuevo proyecto Firebase con ID único para este cliente/core
        const uniqueId = `${clientId}-app-${Math.floor(1000 + Math.random() * 9000)}`;
        const displayName = `App ${clientId.charAt(0).toUpperCase() + clientId.slice(1)}`;
        console.log(`[Firebase Auto] No se encontró proyecto para "${clientId}". Auto-creando: ${uniqueId}...`);
        
        await execAsync(`firebase projects:create ${uniqueId} --display-name "${displayName}"`, { timeout: 180000 });
        console.log(`[Firebase Auto] Proyecto Firebase "${uniqueId}" creado automáticamente.`);
        
        // Escribir el .firebaserc de forma automática
        await fs.writeJson(rcPath, { projects: { default: uniqueId } }, { spaces: 2 });
        
        // Generar un firebase.json básico si no existe para que el deploy de hosting funcione
        const fbJsonPath = path.join(projectDir, 'firebase.json');
        if (!await fs.pathExists(fbJsonPath)) {
          await fs.writeJson(fbJsonPath, {
            hosting: {
              public: "dist",
              ignore: ["firebase.json", "**/.*", "**/node_modules/**"],
              rewrites: [{ source: "**", destination: "/index.html" }]
            }
          }, { spaces: 2 });
        }
        projectId = uniqueId;
      }
    } catch (err) {
      console.warn(`[Firebase Auto Warning] Falló la auto-resolución/creación: ${err.message}. Usando fallback.`);
      projectId = clientId;
    }
  }

  // Sanitización estricta para evitar inyección de comandos o caracteres no válidos
  const safeId = (projectId || clientId).trim().toLowerCase().replace(/[^a-z0-9\-]/g, '');
  if (!safeId) {
    throw new Error(`El Firebase Project ID resolved "${projectId || clientId}" no es válido.`);
  }
  return safeId;
}

// Helper para buscar el directorio del proyecto del cliente.
// Fuente de verdad: .prototipe.json (clientId / projectName).
// Soporta 3 niveles: directo, nicho/instancia, fallback por nombre de carpeta y package.json.
const projectDirCache = new Map();
const CACHE_TTL_MS = 10000; // 10 segundos

async function findProjectDir(clientId) {
  if (!clientId) return null;

  // Sanitización de seguridad temprana contra Path Traversal
  const sanitizedId = clientId.replace(/\\/g, '/');
  if (sanitizedId.includes('..') || sanitizedId.includes('/') || sanitizedId.includes(':')) {
    return null;
  }

  const baseAppsDir = getWorkspaceRoot(); // D:\PROTOTIPE\Instancias Clientes
  const lowerClientId = sanitizedId.toLowerCase();

  // 1. Intentar recuperación desde el caché en memoria para evitar ráfagas de E/S
  const cached = projectDirCache.get(lowerClientId);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    if (await fs.pathExists(cached.path)) {
      return cached.path;
    }
  }

  // 2. Buscar coincidencia dinámica en el registro central de plantillas (plantillas_registro.json)
  try {
    const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
    if (await fs.pathExists(registroPath)) {
      const registro = await fs.readJson(registroPath);
      if (registro && registro.plantillas) {
        for (const [key, config] of Object.entries(registro.plantillas)) {
          if (key.toLowerCase() === lowerClientId || (config.coreType && config.coreType.toLowerCase() === lowerClientId)) {
            if (config.fuente && await fs.pathExists(config.fuente)) {
              projectDirCache.set(lowerClientId, { path: config.fuente, timestamp: Date.now() });
              return config.fuente;
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[findProjectDir] Error al consultar plantillas_registro.json:', err);
  }

  // Helper interno optimizado
  const matchesClientId = async (dirPath, folderName) => {
    const normFolderName = folderName.toLowerCase();
    
    // Cortocircuito rápido: evitar E/S si el nombre físico de la carpeta coincide exactamente
    if (
      normFolderName === lowerClientId ||
      normFolderName.replace(/[^a-z0-9]+/g, '-') === lowerClientId
    ) {
      return true;
    }

    // 1. .prototipe.json — fuente de verdad (clientId y projectName)
    const metaPath = path.join(dirPath, '.prototipe.json');
    if (await fs.pathExists(metaPath)) {
      const meta = await fs.readJson(metaPath).catch(() => ({}));
      if (
        (meta.clientId   && meta.clientId.toLowerCase()   === lowerClientId) ||
        (meta.projectName && meta.projectName.toLowerCase() === lowerClientId)
      ) return true;
    }

    // 2. package.json — nombre de paquete npm (E/S optimizada: 1 sola llamada a pathExists)
    const pkgPath = path.join(dirPath, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath).catch(() => ({}));
      if ((pkg.name || '').toLowerCase() === lowerClientId) return true;
    }

    return false;
  };

  let resolvedPath = null;
  if (await fs.pathExists(baseAppsDir)) {
    try {
      const items = await fs.readdir(baseAppsDir);
      for (const item of items) {
        const fullPath = path.join(baseAppsDir, item);
        const stat = await fs.stat(fullPath).catch(() => null);
        if (!stat || !stat.isDirectory()) continue;

        // Nivel 1: directorio inmediato (ej: Instancias Clientes/ventas-moni-app)
        if (await matchesClientId(fullPath, item)) {
          resolvedPath = fullPath;
          break;
        }

        // Nivel 2: un nivel dentro del nicho (ej: Instancias Clientes/ventas/ventas-moni-app)
        const subItems = await fs.readdir(fullPath).catch(() => []);
        let foundSub = false;
        for (const subItem of subItems) {
          const subPath = path.join(fullPath, subItem);
          const subStat = await fs.stat(subPath).catch(() => null);
          if (!subStat || !subStat.isDirectory()) continue;
          if (await matchesClientId(subPath, subItem)) {
            resolvedPath = subPath;
            foundSub = true;
            break;
          }
        }
        if (foundSub) break;
      }
    } catch (err) {
      console.error('[findProjectDir] Error recorriendo carpetas:', err);
    }
  }

  // Fallback: mappings conocidos de cores (para comandos que buscan el core directamente)
  if (!resolvedPath) {
    const knownMappings = [
      { keys: ['ventas', 'smartfix'],              folder: 'App Ventas' },
      { keys: ['dev-dashboard', 'control'],         folder: 'dev-dashboard' },
      { keys: ['servicios'],                        folder: 'App Servicios' },
      { keys: ['agendamiento', 'barberia'],         folder: 'App Agendamiento' },
      { keys: ['gastronomia', 'restaurante'],       folder: 'App Gastronomia' }
    ];
    for (const mapping of knownMappings) {
      if (mapping.keys.some(k => lowerClientId.includes(k))) {
        let candidate = path.join(baseAppsDir, mapping.folder);
        if (fs.existsSync(candidate)) {
          resolvedPath = candidate;
          break;
        }
        candidate = path.join(path.dirname(baseAppsDir), 'Plantillas Core', mapping.folder);
        if (fs.existsSync(candidate)) {
          resolvedPath = candidate;
          break;
        }
      }
    }
  }

  if (resolvedPath) {
    projectDirCache.set(lowerClientId, { path: resolvedPath, timestamp: Date.now() });
  }
  return resolvedPath;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/project/sync-database
// Compara y sincroniza las reglas e índices de Firestore/Storage del cliente
// contra la plantilla original definida en su archivo de metadatos (.prototipe.json).
// Body: { clientId: string, sync: boolean }
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/project/sync-database', async (req, res) => {
  const { clientId, sync } = req.body;

  if (!clientId) {
    return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });
  }

  if (projectSyncLocks[clientId]) {
    return res.status(429).json({ error: `Ya existe un proceso de sincronización activo para el cliente "${clientId}". Por favor, espera a que termine.` });
  }

  projectSyncLocks[clientId] = true;
  try {
    const projectDir = await findProjectDir(clientId);
    if (!projectDir) {
      return res.status(404).json({ error: `No se encontró el directorio del proyecto local para el cliente: ${clientId}` });
    }

    const metaPath = path.join(projectDir, '.prototipe.json');
    if (!await fs.pathExists(metaPath)) {
      return res.status(404).json({ error: `El proyecto no tiene metadatos (.prototipe.json).` });
    }

    const meta = await fs.readJson(metaPath);
    const templateName = meta.templateId || meta.coreClave || meta.coreId || meta.template || meta.coreType;
    if (!templateName) {
      return res.status(400).json({ error: 'No se pudo determinar la plantilla base (templateId) en los metadatos.' });
    }

    const templateDir = path.join(TEMPLATES_DIR, templateName);
    if (!await fs.pathExists(templateDir)) {
      return res.status(404).json({ error: `La plantilla base "${templateName}" no existe en el CLI.` });
    }

    const fileMappings = [
      { src: 'firestore.rules', dest: 'firestore.rules' },
      { src: 'firestore.indexes.json', dest: 'firestore.indexes.json' },
      { src: 'storage.rules', dest: 'storage.rules' }
    ];

    const auditResults = [];
    let differencesCount = 0;

    for (const mapping of fileMappings) {
      const srcFile = path.join(templateDir, mapping.src);
      const destFile = path.join(projectDir, mapping.dest);
      
      const srcExists = await fs.pathExists(srcFile);
      const destExists = await fs.pathExists(destFile);

      if (!srcExists) continue;

      let srcContent = await fs.readFile(srcFile, 'utf-8');
      let destContent = destExists ? await fs.readFile(destFile, 'utf-8') : '';

      // Sanitizar ID de proyecto para comparación limpia
      const firebaseProjectId = meta.firebase?.projectId || '';
      if (firebaseProjectId) {
        srcContent = srcContent.replace(/proyecto-cliente-saas/g, firebaseProjectId);
      }

      const hasDiff = srcContent.trim() !== destContent.trim();
      if (hasDiff) differencesCount++;

      auditResults.push({
        file: mapping.src,
        status: hasDiff ? 'drifted' : 'synced',
        existsInClient: destExists
      });

      if (sync && hasDiff) {
        await fs.writeFile(destFile, srcContent, 'utf-8');
        console.log(`[Database Sync] Sincronizado archivo: ${mapping.dest}`);
      }
    }

    let deployed = false;
    let deployOutput = '';
    const firebaseProjectId = meta.firebase?.projectId || '';

    if (sync && differencesCount > 0 && firebaseProjectId) {
      try {
        const tokenSuffix = process.env.FIREBASE_TOKEN ? ` --token "${process.env.FIREBASE_TOKEN}"` : '';
        const { stdout } = await execAsync(
          `firebase deploy --only firestore:rules,firestore:indexes,storage -P ${firebaseProjectId}${tokenSuffix}`,
          { cwd: projectDir, timeout: 120000 }
        );
        deployed = true;
        deployOutput = stdout;
      } catch (deployErr) {
        console.warn(`[Database Sync Warning] Falló el despliegue automático: ${deployErr.message}`);
        deployOutput = deployErr.message;
      }
    }

    res.json({
      success: true,
      clientId,
      template: templateName,
      firebaseProjectId,
      differencesCount,
      synced: !!sync,
      deployed,
      deployOutput,
      audit: auditResults
    });

  } catch (err) {
    console.error(`[API /project/sync-database] Error: ${err.message}`);
    res.status(500).json({ error: `Error en auditoría/sincronización de base de datos: ${err.message}` });
  } finally {
    delete projectSyncLocks[clientId];
  }
});


app.post('/api/cores/:clave/deactivate', async (req, res) => {
  const { clave } = req.params;
  const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
  try {
    const registro = await fs.readJson(registroPath);
    if (!registro.plantillas[clave]) return res.status(404).json({ error: `La clave "${clave}" no existe.` });
    registro.plantillas[clave].activo = false;
    await fs.writeJson(registroPath, registro, { spaces: 2 });
    res.json({ success: true, message: `Plantilla "${clave}" desactivada del wizard.` });
  } catch (err) {
    res.status(500).json({ error: `Error al desactivar: ${err.message}` });
  }
});

app.delete('/api/cores/:clave', async (req, res) => {
  const { clave } = req.params;
  const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
  try {
    const registro = await fs.readJson(registroPath);
    const config = registro.plantillas[clave];
    if (!config) {
      return res.status(404).json({ error: `La plantilla core con clave "${clave}" no existe.` });
    }

    const corePath     = config.fuente.replace(/\//g, path.sep);
    const templatePath = config.destino.replace(/\//g, path.sep);

    // Eliminar físicamente las carpetas si existen
    if (await fs.pathExists(corePath)) {
      await fs.remove(corePath);
    }
    if (await fs.pathExists(templatePath)) {
      await fs.remove(templatePath);
    }

    // Remover del registro JSON
    delete registro.plantillas[clave];
    await fs.writeJson(registroPath, registro, { spaces: 2 });

    console.log(`[API] Plantilla core "${clave}" eliminada físicamente y desregistrada.`);
    res.json({
      success: true,
      message: `Plantilla "${clave}" eliminada por completo del registro y del disco.`
    });
  } catch (err) {
    console.error(`[API DELETE /api/cores/${clave}] Error: ${err.message}`);
    res.status(500).json({ error: `Error al eliminar la plantilla core: ${err.message}` });
  }
});

// ==========================================
// PIPELINE DE PROMOCIÓN DE CORES Y MIGRACIÓN
// ==========================================

const promotionSseClients = {};
const promotionLogs = {};

function broadcastPromotionEvent(promotionId, event) {
  const clients = promotionSseClients[promotionId] || [];
  clients.forEach(res => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  });
}

function logPromotionEvent(promotionId, message) {
  const timestamp = new Date().toISOString();
  const formattedLine = `[${timestamp}] ${message}`;
  if (!promotionLogs[promotionId]) {
    promotionLogs[promotionId] = [];
  }
  promotionLogs[promotionId].push(formattedLine);
  broadcastPromotionEvent(promotionId, { type: 'log', line: formattedLine });
  console.log(`[Promo SSE Log][${promotionId}] ${message}`);
}

async function runPromotionPipelineInBackground(blueprint, blueprintFilePath) {
  const promotionId = blueprint.promotionId;
  logPromotionEvent(promotionId, `Iniciando pipeline de promoción en segundo plano para: ${blueprint.targetCoreKey}`);

  try {
    const projectDir = await findProjectDir(blueprint.sourceClientId);
    if (!projectDir) {
      throw new Error(`No se pudo encontrar el directorio de origen para ${blueprint.sourceClientId}`);
    }

    // --- Paso 1: Sanitización y Copia a Staging ---
    logPromotionEvent(promotionId, 'Paso 1: Copiando archivos del cliente a Staging con reescritura de namespaces...');
    const filePolicyPath = path.join(CLI_ROOT, 'knowledge', 'core-promotion', 'file-policy.json');
    const builderResult = await CoreCandidateBuilder.buildStaging(blueprint, projectDir, blueprint.stagingPath, filePolicyPath);

    if (builderResult.manualReviewFiles.length > 0) {
      logPromotionEvent(promotionId, `Advertencia: Se encontraron ${builderResult.manualReviewFiles.length} archivos que requieren revisión del operador.`);
      CorePromotionService.transitionTo(blueprint, 'PENDING_MANUAL_REVIEW', blueprintFilePath);
      CorePromotionService.releaseLock(blueprint.targetCoreKey);
      return;
    }

    // --- Paso 2: Validación de compliance (PII, Secretos, Features, Seeds) ---
    logPromotionEvent(promotionId, 'Paso 2: Iniciando validaciones de seguridad y Feature Registry...');
    CorePromotionService.transitionTo(blueprint, 'RUNNING_VALIDATION', blueprintFilePath);

    // Escaneo de secretos
    blueprint.diagnostics.secretsScan.status = 'RUNNING';
    blueprint.diagnostics.secretsScan.startedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(blueprintFilePath, blueprint);
    await CorePromotionValidator.scanSecrets(blueprint.stagingPath);
    blueprint.diagnostics.secretsScan.status = 'PASSED';
    blueprint.diagnostics.secretsScan.completedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(blueprintFilePath, blueprint);
    logPromotionEvent(promotionId, '  ✅ Escaneo de secretos aprobado.');

    // Escaneo de PII
    blueprint.diagnostics.piiScan.status = 'RUNNING';
    blueprint.diagnostics.piiScan.startedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(blueprintFilePath, blueprint);
    const hasPII = await CorePromotionValidator.scanPII(blueprint.stagingPath);
    if (hasPII) {
      blueprint.diagnostics.piiScan.status = 'FAILED';
      blueprint.diagnostics.piiScan.completedAt = new Date().toISOString();
      CorePromotionService.transitionTo(blueprint, 'QUARANTINED', blueprintFilePath);
      CorePromotionService.releaseLock(blueprint.targetCoreKey);
      logPromotionEvent(promotionId, '  ❌ Escaneo de PII fallido. Blueprint redirigido a CUARENTENA.');
      return;
    }
    blueprint.diagnostics.piiScan.status = 'PASSED';
    blueprint.diagnostics.piiScan.completedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(blueprintFilePath, blueprint);
    logPromotionEvent(promotionId, '  ✅ Escaneo de PII aprobado.');

    // Validar Features
    blueprint.diagnostics.dependencies.status = 'RUNNING';
    blueprint.diagnostics.dependencies.startedAt = new Date().toISOString();
    await CorePromotionValidator.validateFeatures(blueprint);
    const hasFeatureErrors = blueprint.diagnostics.errors.some(e => e.code.startsWith('FEATURE_'));
    blueprint.diagnostics.dependencies.status = hasFeatureErrors ? 'FAILED' : 'PASSED';
    blueprint.diagnostics.dependencies.completedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(blueprintFilePath, blueprint);
    if (hasFeatureErrors) {
      throw new Error('Validación de features fallida. Revisa los errores del blueprint.');
    }
    logPromotionEvent(promotionId, '  ✅ Features validadas con éxito.');

    // Validar y Extraer Seeds
    const seedRulesPath = path.join(CLI_ROOT, 'knowledge', 'core-promotion', 'seed-rules.json');
    CorePromotionValidator.validateAndExtractSeeds(projectDir, blueprint.stagingPath, seedRulesPath);
    logPromotionEvent(promotionId, '  ✅ Extracción de semillas anonimizadas completada.');

    // Generar documentos de gobernanza del Core
    logPromotionEvent(promotionId, 'Generando 12 documentos de gobernanza del Core...');
    BriefingDocumentMapper.generateCoreGovernance(blueprint);
    logPromotionEvent(promotionId, '  ✅ 12 documentos de gobernanza autogenerados en carpeta temática.');

    // --- Paso 3: Build & Smoke Test ---
    logPromotionEvent(promotionId, 'Paso 3: Ejecutando compilación en staging y Smoke Test...');
    CorePromotionService.transitionTo(blueprint, 'RUNNING_BUILD_SMOKE', blueprintFilePath);

    blueprint.diagnostics.build.status = 'RUNNING';
    blueprint.diagnostics.build.startedAt = new Date().toISOString();
    blueprint.diagnostics.smokeTest.status = 'RUNNING';
    blueprint.diagnostics.smokeTest.startedAt = new Date().toISOString();
    PromotionBlueprintBuilder.safeWriteJson(blueprintFilePath, blueprint);

    await CorePromotionValidator.runBuildAndSmokeTest(blueprint.stagingPath);

    blueprint.diagnostics.build.status = 'PASSED';
    blueprint.diagnostics.build.completedAt = new Date().toISOString();
    blueprint.diagnostics.smokeTest.status = 'PASSED';
    blueprint.diagnostics.smokeTest.completedAt = new Date().toISOString();

    CorePromotionService.transitionTo(blueprint, 'CANDIDATE_READY', blueprintFilePath);
    logPromotionEvent(promotionId, '🎉 ¡Pipeline completado con éxito! Core candidato listo para publicación.');

  } catch (err) {
    logPromotionEvent(promotionId, `❌ Error en el pipeline: ${err.message}`);
    blueprint.diagnostics.errors.push({
      code: 'PIPELINE_ERROR',
      step: blueprint.status,
      message: err.message
    });

    if (blueprint.status === 'RUNNING_BUILD_SMOKE') {
      blueprint.diagnostics.build.status = 'FAILED';
      blueprint.diagnostics.build.completedAt = new Date().toISOString();
      blueprint.diagnostics.smokeTest.status = 'FAILED';
      blueprint.diagnostics.smokeTest.completedAt = new Date().toISOString();
      CorePromotionService.transitionTo(blueprint, 'FAILED_BUILD', blueprintFilePath);
    } else {
      CorePromotionService.transitionTo(blueprint, 'FAILED_SANITIZATION', blueprintFilePath);
    }
    
    CorePromotionService.releaseLock(blueprint.targetCoreKey);
  }
}

// 1. POST /api/project/:clientId/core-promotion/preflight
app.post('/api/project/:clientId/core-promotion/preflight', authenticateFirebaseToken, authorizePermission('core-promotion:analyze'), async (req, res) => {
  const { clientId } = req.params;
  const { targetCoreKey, targetCoreName, nicho } = req.body;
  const idempotencyKey = req.headers['idempotency-key'];

  try {
    const projectDir = await findProjectDir(clientId);
    if (!projectDir) {
      return res.status(404).json({ error: `No se encontró el directorio para el cliente: ${clientId}` });
    }

    if (idempotencyKey) {
      const cached = CorePromotionService.checkIdempotency(idempotencyKey, { clientId, targetCoreKey, targetCoreName, nicho });
      if (cached) return res.json(cached);
    }

    // Validar colisión de clave en registro
    const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
    const registro = await fs.readJson(registroPath);
    if (registro.plantillas[targetCoreKey] && registro.plantillas[targetCoreKey].activo) {
      return res.status(409).json({ error: `Colisión de Clave: El core '${targetCoreKey}' ya está registrado y activo.` });
    }

    const promotionId = `promo-${Date.now()}`;
    const stagingPath = path.join(CLI_ROOT, 'scratch', 'staging', targetCoreKey).replace(/\\/g, '/');

    // Cargar manifiesto del cliente para extraer features
    const clientProtoPath = path.join(projectDir, '.prototipe.json');
    const clientLockPath = path.join(projectDir, 'prototipe.lock.json');
    let clientProto = {};
    let clientLock = {};
    if (fs.existsSync(clientProtoPath)) clientProto = fs.readJsonSync(clientProtoPath);
    if (fs.existsSync(clientLockPath)) clientLock = fs.readJsonSync(clientLockPath);

    const featuresList = [];
    const clientFeatures = clientProto.features || (clientLock.features ? Object.keys(clientLock.features) : []);
    for (const featId of clientFeatures) {
      const version = clientLock.features?.[featId]?.version || '1.0.0';
      featuresList.push({
        featureId: featId,
        version,
        registryStatus: 'REGISTERED'
      });
    }

    const blueprint = {
      schemaVersion: '1.0.0',
      promotionId,
      sourceClientId: clientId,
      sourceCoreType: clientProto.coreType || 'unknown',
      sourceCoreVersion: clientProto.coreVersion || '0.0.1',
      targetCoreKey,
      targetCoreName,
      nicho,
      status: 'PENDING_PREFLIGHT',
      stagingPath,
      idempotency: {
        preflight: idempotencyKey || null,
        execute: null,
        publish: null,
        activate: null,
        migrationApply: null
      },
      features: {
        required: featuresList,
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

    const promoDir = path.join(CLI_ROOT, 'blueprints', 'promotions');
    fs.ensureDirSync(promoDir);
    const blueprintFilePath = path.join(promoDir, `promo-${promotionId}.json`);
    PromotionBlueprintBuilder.safeWriteJson(blueprintFilePath, blueprint);

    const responseData = { success: true, promotionId, blueprint };
    if (idempotencyKey) {
      CorePromotionService.saveIdempotency(idempotencyKey, { clientId, targetCoreKey, targetCoreName, nicho }, responseData);
    }

    res.json(responseData);
  } catch (err) {
    console.error(`[API preflight] Error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /api/project/core-promotion/:promotionId/execute
app.post('/api/project/core-promotion/:promotionId/execute', authenticateFirebaseToken, authorizePermission('core-promotion:execute'), async (req, res) => {
  const { promotionId } = req.params;
  const idempotencyKey = req.headers['idempotency-key'];

  const promoDir = path.join(CLI_ROOT, 'blueprints', 'promotions');
  const blueprintFilePath = path.join(promoDir, `promo-${promotionId}.json`);

  if (!fs.existsSync(blueprintFilePath)) {
    return res.status(404).json({ error: `No se encontró el blueprint de promoción '${promotionId}'.` });
  }

  try {
    const blueprint = PromotionBlueprintBuilder.loadPromotionBlueprint(blueprintFilePath);

    if (idempotencyKey) {
      const cached = CorePromotionService.checkIdempotency(idempotencyKey, { promotionId });
      if (cached) return res.json(cached);
    }

    // Adquirir Lock físico
    CorePromotionService.acquireLock(blueprint.targetCoreKey, promotionId);

    // Transición a RUNNING_SANITIZATION
    CorePromotionService.transitionTo(blueprint, 'RUNNING_SANITIZATION', blueprintFilePath);
    blueprint.idempotency.execute = idempotencyKey || null;
    PromotionBlueprintBuilder.safeWriteJson(blueprintFilePath, blueprint);

    // Iniciar ejecución en segundo plano
    runPromotionPipelineInBackground(blueprint, blueprintFilePath);

    const responseData = { success: true, message: 'Pipeline de promoción iniciado en Staging.', status: 'RUNNING_SANITIZATION', promotionId };
    if (idempotencyKey) {
      CorePromotionService.saveIdempotency(idempotencyKey, { promotionId }, responseData);
    }

    res.status(202).json(responseData);
  } catch (err) {
    console.error(`[API execute] Error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /api/project/core-promotion/:promotionId
app.get('/api/project/core-promotion/:promotionId', authenticateFirebaseToken, authorizePermission('core-promotion:analyze'), async (req, res) => {
  const { promotionId } = req.params;
  const promoDir = path.join(CLI_ROOT, 'blueprints', 'promotions');
  const blueprintFilePath = path.join(promoDir, `promo-${promotionId}.json`);

  if (!fs.existsSync(blueprintFilePath)) {
    return res.status(404).json({ error: `No se encontró el blueprint de promoción '${promotionId}'.` });
  }

  try {
    const blueprint = PromotionBlueprintBuilder.loadPromotionBlueprint(blueprintFilePath);
    res.json(blueprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET /api/project/core-promotion/:promotionId/events (SSE Stream)
app.get('/api/project/core-promotion/:promotionId/events', async (req, res) => {
  const { promotionId } = req.params;

  const token = req.query.token || req.headers.authorization?.split('Bearer ')[1];
  const expectedBypass = process.env.TEST_AUTH_BYPASS_TOKEN;
  if (expectedBypass && token === expectedBypass && process.env.NODE_ENV === 'test' && process.env.ALLOW_TEST_AUTH_BYPASS === 'true') {
    // Bypass autorizado en tests
  } else if (!token) {
    const isEmulator = process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.NODE_ENV !== 'production';
    if (!isEmulator) {
      return res.status(401).json({ error: 'SSE No autorizado: Token faltante.' });
    }
  } else {
    try {
      await admin.auth().verifyIdToken(token);
    } catch (err) {
      return res.status(401).json({ error: 'SSE Token inválido.' });
    }
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!promotionSseClients[promotionId]) {
    promotionSseClients[promotionId] = [];
  }
  promotionSseClients[promotionId].push(res);

  res.write(`data: ${JSON.stringify({ type: 'connection', status: 'connected' })}\n\n`);

  const history = promotionLogs[promotionId] || [];
  history.forEach(line => {
    res.write(`data: ${JSON.stringify({ type: 'log', line })}\n\n`);
  });

  req.on('close', () => {
    promotionSseClients[promotionId] = promotionSseClients[promotionId].filter(client => client !== res);
  });
});

// 5. POST /api/project/core-promotion/:promotionId/publish
app.post('/api/project/core-promotion/:promotionId/publish', authenticateFirebaseToken, authorizePermission('core-promotion:publish'), async (req, res) => {
  const { promotionId } = req.params;
  const idempotencyKey = req.headers['idempotency-key'];

  const promoDir = path.join(CLI_ROOT, 'blueprints', 'promotions');
  const blueprintFilePath = path.join(promoDir, `promo-${promotionId}.json`);

  if (!fs.existsSync(blueprintFilePath)) {
    return res.status(404).json({ error: `No se encontró el blueprint de promoción '${promotionId}'.` });
  }

  try {
    const blueprint = PromotionBlueprintBuilder.loadPromotionBlueprint(blueprintFilePath);

    if (idempotencyKey) {
      const cached = CorePromotionService.checkIdempotency(idempotencyKey, { promotionId, action: 'publish' });
      if (cached) return res.json(cached);
    }

    await CorePromotionPublisher.publish(blueprint, blueprintFilePath);

    const responseData = { success: true, blueprint };
    if (idempotencyKey) {
      CorePromotionService.saveIdempotency(idempotencyKey, { promotionId, action: 'publish' }, responseData);
    }

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. POST /api/project/core-promotion/:promotionId/activate
app.post('/api/project/core-promotion/:promotionId/activate', authenticateFirebaseToken, authorizePermission('core-promotion:activate'), async (req, res) => {
  const { promotionId } = req.params;
  const idempotencyKey = req.headers['idempotency-key'];

  const promoDir = path.join(CLI_ROOT, 'blueprints', 'promotions');
  const blueprintFilePath = path.join(promoDir, `promo-${promotionId}.json`);

  if (!fs.existsSync(blueprintFilePath)) {
    return res.status(404).json({ error: `No se encontró el blueprint de promoción '${promotionId}'.` });
  }

  try {
    const blueprint = PromotionBlueprintBuilder.loadPromotionBlueprint(blueprintFilePath);

    if (idempotencyKey) {
      const cached = CorePromotionService.checkIdempotency(idempotencyKey, { promotionId, action: 'activate' });
      if (cached) return res.json(cached);
    }

    await CorePromotionPublisher.activate(blueprint, blueprintFilePath);

    const responseData = { success: true, blueprint };
    if (idempotencyKey) {
      CorePromotionService.saveIdempotency(idempotencyKey, { promotionId, action: 'activate' }, responseData);
    }

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. POST /api/project/core-promotion/:promotionId/migration/preflight
app.post('/api/project/core-promotion/:promotionId/migration/preflight', authenticateFirebaseToken, authorizePermission('core-promotion:migrate'), async (req, res) => {
  const { promotionId } = req.params;
  const { clientId } = req.body;
  const idempotencyKey = req.headers['idempotency-key'];

  const promoDir = path.join(CLI_ROOT, 'blueprints', 'promotions');
  const promoFilePath = path.join(promoDir, `promo-${promotionId}.json`);

  if (!fs.existsSync(promoFilePath)) {
    return res.status(404).json({ error: `No se encontró el blueprint de promoción '${promotionId}'.` });
  }

  try {
    const promoBlueprint = PromotionBlueprintBuilder.loadPromotionBlueprint(promoFilePath);

    if (idempotencyKey) {
      const cached = CorePromotionService.checkIdempotency(idempotencyKey, { promotionId, clientId, action: 'migration-preflight' });
      if (cached) return res.json(cached);
    }

    const migrationId = `mig-${Date.now()}`;
    const projectDir = await findProjectDir(clientId);
    if (!projectDir) {
      return res.status(404).json({ error: `No se encontró el directorio del proyecto para el cliente: ${clientId}` });
    }

    const clientProtoPath = path.join(projectDir, '.prototipe.json');
    const clientLockPath = path.join(projectDir, 'prototipe.lock.json');
    let clientProto = {};
    let clientLock = {};
    if (fs.existsSync(clientProtoPath)) clientProto = fs.readJsonSync(clientProtoPath);
    if (fs.existsSync(clientLockPath)) clientLock = fs.readJsonSync(clientLockPath);

    const migrationBlueprint = {
      schemaVersion: '1.0.0',
      migrationId,
      promotionId,
      status: 'PENDING_PREFLIGHT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      spec: {
        clientId,
        previousCoreType: clientProto.coreType || 'unknown',
        newCoreType: promoBlueprint.targetCoreKey,
        previousCoreVersion: clientProto.coreVersion || '0.0.1',
        newCoreVersion: '1.0.0',
        hashAlgorithm: 'sha256',
        previousFilesHashes: {},
        previousFeatures: clientProto.features || (clientLock.features ? Object.keys(clientLock.features) : [])
      },
      results: {
        backup: null,
        write: null,
        postValidation: null,
        rollback: null,
        errors: []
      }
    };

    const migrateDir = path.join(CLI_ROOT, 'blueprints', 'migrations');
    fs.ensureDirSync(migrateDir);
    const migrationFilePath = path.join(migrateDir, `mig-${migrationId}.json`);
    PromotionBlueprintBuilder.safeWriteJson(migrationFilePath, migrationBlueprint);

    const responseData = { success: true, migrationId, blueprint: migrationBlueprint };
    if (idempotencyKey) {
      CorePromotionService.saveIdempotency(idempotencyKey, { promotionId, clientId, action: 'migration-preflight' }, responseData);
    }

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. POST /api/project/core-promotion/migration/:migrationId/apply
app.post('/api/project/core-promotion/migration/:migrationId/apply', authenticateFirebaseToken, authorizePermission('core-promotion:migrate'), async (req, res) => {
  const { migrationId } = req.params;
  const idempotencyKey = req.headers['idempotency-key'];

  const migrateDir = path.join(CLI_ROOT, 'blueprints', 'migrations');
  const migrationFilePath = path.join(migrateDir, `mig-${migrationId}.json`);

  if (!fs.existsSync(migrationFilePath)) {
    return res.status(404).json({ error: `No se encontró el blueprint de migración '${migrationId}'.` });
  }

  try {
    const migrationBlueprint = PromotionBlueprintBuilder.loadMigrationBlueprint(migrationFilePath);

    if (idempotencyKey) {
      const cached = CorePromotionService.checkIdempotency(idempotencyKey, { migrationId, action: 'migration-apply' });
      if (cached) return res.json(cached);
    }

    const clientPath = await findProjectDir(migrationBlueprint.spec.clientId);
    if (!clientPath) {
      return res.status(404).json({ error: `No se encontró la carpeta del cliente '${migrationBlueprint.spec.clientId}'.` });
    }

    await ClientLineageMigrator.migrate(migrationBlueprint, migrationFilePath, clientPath);

    const responseData = { success: true, blueprint: migrationBlueprint };
    if (idempotencyKey) {
      CorePromotionService.saveIdempotency(idempotencyKey, { migrationId, action: 'migration-apply' }, responseData);
    }

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. POST /api/project/core-promotion/:promotionId/publication/rollback
app.post('/api/project/core-promotion/:promotionId/publication/rollback', authenticateFirebaseToken, authorizePermission('core-promotion:rollback'), async (req, res) => {
  const { promotionId } = req.params;
  const promoDir = path.join(CLI_ROOT, 'blueprints', 'promotions');
  const blueprintFilePath = path.join(promoDir, `promo-${promotionId}.json`);
  const journalFilePath = path.join(CLI_ROOT, 'journals', 'core-promotions', `promo-${promotionId}.json`);

  if (!fs.existsSync(blueprintFilePath)) {
    return res.status(404).json({ error: `No se encontró el blueprint de promoción '${promotionId}'.` });
  }

  try {
    const blueprint = PromotionBlueprintBuilder.loadPromotionBlueprint(blueprintFilePath);
    await CorePromotionPublisher.rollbackPublish(blueprint, blueprintFilePath, journalFilePath);
    res.json({ success: true, blueprint });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. POST /api/project/core-promotion/:promotionId/activation/rollback
app.post('/api/project/core-promotion/:promotionId/activation/rollback', authenticateFirebaseToken, authorizePermission('core-promotion:rollback'), async (req, res) => {
  const { promotionId } = req.params;
  const promoDir = path.join(CLI_ROOT, 'blueprints', 'promotions');
  const blueprintFilePath = path.join(promoDir, `promo-${promotionId}.json`);
  const journalFilePath = path.join(CLI_ROOT, 'journals', 'core-activations', `act-${promotionId}.json`);

  if (!fs.existsSync(blueprintFilePath)) {
    return res.status(404).json({ error: `No se encontró el blueprint de promoción '${promotionId}'.` });
  }

  try {
    const blueprint = PromotionBlueprintBuilder.loadPromotionBlueprint(blueprintFilePath);
    await CorePromotionPublisher.rollbackActivate(blueprint, blueprintFilePath, journalFilePath);
    res.json({ success: true, blueprint });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. POST /api/project/core-promotion/migration/:migrationId/rollback
app.post('/api/project/core-promotion/migration/:migrationId/rollback', authenticateFirebaseToken, authorizePermission('core-promotion:rollback'), async (req, res) => {
  const { migrationId } = req.params;
  const migrateDir = path.join(CLI_ROOT, 'blueprints', 'migrations');
  const migrationFilePath = path.join(migrateDir, `mig-${migrationId}.json`);
  const journalFilePath = path.join(CLI_ROOT, 'journals', 'lineage-migrations', `mig-${migrationId}.json`);

  if (!fs.existsSync(migrationFilePath)) {
    return res.status(404).json({ error: `No se encontró el blueprint de migración '${migrationId}'.` });
  }

  try {
    const blueprint = PromotionBlueprintBuilder.loadMigrationBlueprint(migrationFilePath);
    const clientPath = await findProjectDir(blueprint.spec.clientId);
    if (!clientPath) {
      return res.status(404).json({ error: `No se encontró la carpeta del cliente '${blueprint.spec.clientId}'.` });
    }
    await ClientLineageMigrator.rollback(blueprint, migrationFilePath, journalFilePath, clientPath);
    res.json({ success: true, blueprint });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para compilar y desplegar a Firebase Hosting (SSE Stream)
app.all('/api/project/deploy', async (req, res) => {
  const clientId = req.method === 'POST' ? req.body.clientId : (req.query.clientId || req.body?.clientId);
  const force = req.query.force === 'true';
  if (!clientId) {
    return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });
  }

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) {
    return res.status(404).json({ error: `No se encontró el directorio del proyecto local para el cliente: ${clientId}` });
  }

  const metaPath = path.join(projectDir, '.prototipe.json');
  const meta = await fs.pathExists(metaPath) ? await fs.readJson(metaPath) : {};
  const firebaseProjectId = await resolveFirebaseProjectId(projectDir, clientId);

  // Configurar cabeceras SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  send({ type: 'log', line: `🚀 Iniciando despliegue de hosting para: ${clientId} (${firebaseProjectId})` });
  send({ type: 'log', line: `📂 Carpeta: ${projectDir}` });
  send({ type: 'log', line: '----------------------------------------' });

  // Función helper para spawnear y capturar output
  const runCommand = (cmd, args) => {
    return new Promise((resolve, reject) => {
      send({ type: 'log', line: `Running: ${cmd} ${args.join(' ')}` });
      const proc = spawn(cmd, args, {
        cwd: projectDir,
        shell: true,
        env: { ...process.env, FORCE_COLOR: '0' }
      });

      proc.stdout.on('data', (data) => {
        data.toString().split('\n').filter(Boolean).forEach(l => {
          send({ type: 'log', line: l.trim() });
        });
      });

      proc.stderr.on('data', (data) => {
        const text = data.toString();
        text.split('\n').filter(Boolean).forEach(l => {
          send({ type: 'log', line: `⚠ ${l.trim()}` });
        });
        if (text.includes('Failed to get Firebase project') || text.includes('does not exist')) {
          send({ type: 'log', line: `💡 CONSEJO: Para nuevas plantillas o proyectos, asocia el ID de proyecto Firebase ejecutando 'firebase use --add' en la carpeta, o edítalo en .firebaserc / .prototipe.json` });
        }
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`El comando falló con código ${code}`));
        }
      });
    });
  };

  try {
    send({ type: 'log', line: '🧹 Purgando cachés y temporales obsoletos automáticamente (Preflight Cleanup)...' });
    try {
      const allowedSubpaths = [
        path.join(projectDir, 'node_modules', '.vite'),
        path.join(projectDir, 'node_modules', '.vite-temp'),
        path.join(projectDir, 'dist'),
        path.join(projectDir, 'build'),
        path.join(GIT_ROOT, 'Documentacion PROTOTIPE', '02_Tareas_Roadmap', '.tmp')
      ];
      let cleaned = 0;
      for (const folder of allowedSubpaths) {
        if (await fs.pathExists(folder)) {
          await fs.remove(folder);
          cleaned++;
        }
      }
      send({ type: 'log', line: `🧹 Preflight Cleanup: Se purgaron ${cleaned} carpetas de forma segura.` });
    } catch (cleanErr) {
      send({ type: 'log', line: `⚠ Advertencia en Preflight Cleanup: ${cleanErr.message}` });
    }

    send({ type: 'log', line: '📦 Compilando aplicación local...' });
    await runCommand('npm', ['run', 'build']);
    send({ type: 'log', line: '✅ Compilación exitosa.' });

    // Ejecutar auditoría de calidad física y PWA
    send({ type: 'log', line: '🔍 Iniciando auditoría física de calidad y PWA...' });
    const audit = await runAuditInternal(projectDir, clientId);

    if (audit.compiled && audit.score < 90 && !force) {
      send({ type: 'log', line: `❌ AUDITORÍA FALLIDA (Puntaje: ${audit.score}/100)` });
      audit.report.warnings.forEach(warn => {
        send({ type: 'log', line: `   ⚠ ${warn}` });
      });
      send({ type: 'log', line: '----------------------------------------' });
      send({ type: 'log', line: '✋ Despliegue cancelado. Se requiere resolución de problemas o forzar el deploy.' });
      
      send({
        type: 'audit_failed',
        score: audit.score,
        warnings: audit.report.warnings,
        fixes: {
          chunks: true,
          pwa: !audit.report.hasManifest || !audit.report.hasServiceWorker,
          rules: true
        }
      });
      if (!res.writableEnded) res.end();
      return;
    } else if (audit.compiled && audit.score < 90 && force) {
      send({ type: 'log', line: `⚠ Despliegue forzado. Ignorando auditoría fallida (Score: ${audit.score}/100)...` });
    } else {
      send({ type: 'log', line: `✅ Auditoría aprobada con éxito (Puntaje: ${audit.score}/100).` });
    }

    send({ type: 'log', line: '🚀 Subiendo a Firebase Hosting...' });
    await runCommand('firebase', ['deploy', '--only', 'hosting', '-P', firebaseProjectId]);
    send({ type: 'log', line: '🎉 Despliegue completado con éxito!' });
    send({ type: 'result', success: true, url: `https://${firebaseProjectId}.web.app` });
    
    // Notificación DevOps de Despliegue Exitoso
    fetch('http://localhost:5050/api/notify/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚀 <b>DevOps: Despliegue de Hosting Exitoso</b>\n` +
              `----------------------------------\n` +
              `🏢 <b>Cliente:</b> <code>${clientId}</code>\n` +
              `🔥 <b>Proyecto:</b> <code>${firebaseProjectId}</code>\n` +
              `🔗 <b>URL:</b> <a href="https://${firebaseProjectId}.web.app">https://${firebaseProjectId}.web.app</a>\n` +
              `----------------------------------`
      })
    }).catch(() => {});

    fetch('http://localhost:5050/api/notify/discord', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🚀 **DevOps: Despliegue de Hosting Exitoso**\n🏢 **Cliente:** \`${clientId}\`\n🔥 **Proyecto:** \`${firebaseProjectId}\`\n🔗 **URL:** https://${firebaseProjectId}.web.app`
      })
    }).catch(() => {});

    if (!res.writableEnded) res.end();
  } catch (err) {
    send({ type: 'log', line: `❌ Error durante el despliegue: ${err.message}` });
    send({ type: 'result', success: false, error: err.message });

    // Notificación DevOps de Despliegue Fallido
    fetch('http://localhost:5050/api/notify/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `❌ <b>DevOps: Fallo de Despliegue (Firebase deploy)</b>\n` +
              `----------------------------------\n` +
              `🏢 <b>Cliente:</b> <code>${clientId}</code>\n` +
              `🔥 <b>Proyecto:</b> <code>${firebaseProjectId || clientId}</code>\n` +
              `💬 <b>Error:</b> <code>${err.message}</code>\n` +
              `----------------------------------`
      })
    }).catch(() => {});

    fetch('http://localhost:5050/api/notify/discord', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `❌ **DevOps: Fallo de Despliegue (Firebase deploy)**\n🏢 **Cliente:** \`${clientId}\`\n💬 **Error:** \`${err.message}\``
      })
    }).catch(() => {});

    if (!res.writableEnded) res.end();
  }
});



// Endpoint para leer variables de entorno local
app.get('/api/project/env', async (req, res) => {
  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });

  const envPath = path.join(projectDir, '.env.local');
  try {
    let variables = {};
    if (await fs.pathExists(envPath)) {
      const content = await fs.readFile(envPath, 'utf-8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const index = trimmed.indexOf('=');
          const key = trimmed.slice(0, index).trim();
          const val = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');
          variables[key] = val;
        }
      });
    }
    res.json({ success: true, variables });
  } catch (err) {
    res.status(500).json({ error: `Error al leer variables .env.local: ${err.message}` });
  }
});

// Endpoint para consultar/cambiar Modo Mantenimiento de un cliente inquilino en Firestore
app.post('/api/project/maintenance', async (req, res) => {
  const { clientId, status } = req.body;
  if (!clientId) {
    return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });
  }

  try {
    const projectDir = await findProjectDir(clientId);
    if (!projectDir) {
      return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });
    }

    const envPath = path.join(projectDir, '.env.local');
    if (!await fs.pathExists(envPath)) {
      return res.status(404).json({ error: `No se encontró el archivo de entorno .env.local del cliente.` });
    }

    const envContent = await fs.readFile(envPath, 'utf-8');
    const projectIdMatch = envContent.match(/VITE_FIREBASE_PROJECT_ID\s*=\s*(.*)/) || envContent.match(/VITE_DEVELOPER_FIREBASE_PROJECT_ID\s*=\s*(.*)/);
    const projectId = projectIdMatch ? projectIdMatch[1].trim().replace(/['"]/g, '') : null;

    if (!projectId) {
      return res.status(400).json({ error: 'No se pudo determinar el Firebase Project ID del cliente.' });
    }

    // Obtener token de Firebase CLI
    const possiblePaths = [
      path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json'),
      path.join(process.env.APPDATA || '', 'configstore', 'firebase-tools.json')
    ];
    let token = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
          if (data.tokens && data.tokens.access_token) {
            token = data.tokens.access_token;
            break;
          }
        } catch (_) {}
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Sesión de Firebase CLI no activa en el servidor local. Corre "firebase login" en el servidor.' });
    }

    const settingsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/config/settings`;

    if (status === undefined) {
      // Consultar estado actual
      const response = await fetch(settingsUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        return res.status(response.status).json({ error: `Error de Firestore: ${response.statusText}` });
      }
      const data = await response.json();
      const currentMode = data.fields?.maintenanceMode?.booleanValue ?? false;
      return res.json({ success: true, clientId, projectId, maintenanceMode: currentMode });
    } else {
      // Actualizar estado
      const nextStatus = status === 'true' || status === true;
      const patchUrl = `${settingsUrl}?updateMask.fieldPaths=maintenanceMode`;
      const payload = {
        fields: {
          maintenanceMode: { booleanValue: nextStatus }
        }
      };
      const response = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        return res.status(response.status).json({ error: errData.error?.message || `Fallo al actualizar Firestore: ${response.statusText}` });
      }

      return res.json({ success: true, clientId, projectId, maintenanceMode: nextStatus });
    }
  } catch (err) {
    res.status(500).json({ error: `Error en Modo Mantenimiento: ${err.message}` });
  }
});

// Endpoint para registrar o regenerar el token de telemetría de un cliente en Firestore Central
// Resuelve el error: "Missing or insufficient permissions" al procesar la cola de telemetría
app.post('/api/project/token/register', async (req, res) => {
  const { clientId, token: customToken, forceRegenerate } = req.body;
  if (!clientId) {
    return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });
  }

  try {
    let accessToken = await getFirebaseAccessToken();
    if (!accessToken) {
      return res.status(401).json({ error: 'Sesión de Firebase CLI no activa. Corre "firebase login" en el servidor.' });
    }

    const centralProjectId = 'prototipe-ecosistema-control';

    // Helper para realizar peticiones tolerantes a expiración de tokens (401)
    async function fetchWithRetry(url, options) {
      let response = await fetch(url, options);
      if (response.status === 401) {
        console.log('[Token Register] Token de Firebase CLI devuelto 401 (No Autorizado). Forzando refresco de sesión...');
        const freshToken = await getFirebaseAccessToken(true);
        options.headers['Authorization'] = `Bearer ${freshToken}`;
        response = await fetch(url, options);
      }
      return response;
    }

    // Verificar si ya existe un token activo para este clientId (evitar duplicados)
    if (!forceRegenerate) {
      const queryUrl = `https://firestore.googleapis.com/v1/projects/${centralProjectId}/databases/(default)/documents:runQuery`;
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId: 'tokens' }],
          where: {
            compositeFilter: {
              op: 'AND',
              filters: [
                { fieldFilter: { field: { fieldPath: 'clientId' }, op: 'EQUAL', value: { stringValue: clientId } } },
                { fieldFilter: { field: { fieldPath: 'active' }, op: 'EQUAL', value: { booleanValue: true } } }
              ]
            }
          }
        }
      };
      const queryRes = await fetchWithRetry(queryUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(queryBody)
      });
      const queryData = await queryRes.json();
      const existing = Array.isArray(queryData) ? queryData.filter(d => d.document) : [];
      if (existing.length > 0) {
        const existingToken = existing[0].document.fields?.token?.stringValue;
        return res.json({ success: true, clientId, token: existingToken, message: 'Token activo ya existente en Firestore Central. No se requiere acción.' });
      }
    }

    // Generar o usar token provisto
    const telemetryToken = customToken || `${clientId}-token-${Date.now()}`;
    const docId = telemetryToken; // Usar el token como ID del documento para lookups O(1)

    const docUrl = `https://firestore.googleapis.com/v1/projects/${centralProjectId}/databases/(default)/documents/tokens/${docId}`;
    const docPayload = {
      fields: {
        clientId: { stringValue: clientId },
        token: { stringValue: telemetryToken },
        active: { booleanValue: true },
        createdAt: { stringValue: new Date().toISOString() },
        description: { stringValue: `Token de telemetría auto-registrado desde Bridge CLI para ${clientId}` }
      }
    };

    const writeRes = await fetchWithRetry(docUrl, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(docPayload)
    });

    if (!writeRes.ok) {
      const errData = await writeRes.json();
      return res.status(writeRes.status).json({ error: errData.error?.message || 'Fallo al registrar token en Firestore Central.' });
    }

    console.log(`[Token Register] Token registrado en Firestore Central para: ${clientId}`);

    // Sincronizar también en el .env.local del proyecto si existe
    try {
      const projectDir = await findProjectDir(clientId);
      if (projectDir) {
        const envPath = path.join(projectDir, '.env.local');
        if (await fs.pathExists(envPath)) {
          let envContent = await fs.readFile(envPath, 'utf-8');
          if (envContent.includes('VITE_DEVELOPER_TELEMETRY_TOKEN=')) {
            envContent = envContent.replace(/VITE_DEVELOPER_TELEMETRY_TOKEN=.*/g, '');
          }
          await fs.writeFile(envPath, envContent, 'utf-8');
          console.log(`[Token Register] Token sincronizado en .env.local de ${clientId}`);
        }
      }
    } catch (syncErr) {
      console.warn(`[Token Register] No se pudo sincronizar en .env.local: ${syncErr.message}`);
    }

    return res.json({ success: true, clientId, token: telemetryToken, message: 'Token registrado exitosamente en Firestore Central.' });
  } catch (err) {
    res.status(500).json({ error: `Error al registrar token: ${err.message}` });
  }
});

// Endpoint para actualizar variables de entorno local
app.post('/api/project/env', async (req, res) => {
  const { clientId, variables } = req.body;
  if (!clientId || !variables) {
    return res.status(400).json({ error: 'Los parámetros "clientId" y "variables" son obligatorios.' });
  }

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });

  const envPath = path.join(projectDir, '.env.local');
  try {
    let existingVariables = {};
    if (await fs.pathExists(envPath)) {
      const existingContent = await fs.readFile(envPath, 'utf-8');
      existingContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const index = trimmed.indexOf('=');
          const key = trimmed.slice(0, index).trim();
          const val = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');
          existingVariables[key] = val;
        }
      });
    }

    const invalidKeys = [];
    const envKeyRegex = /^[A-Z_][A-Z0-9_]*$/;

    // Fusionar variables del body con las existentes, validando que las nuevas claves sean sintácticamente correctas
    Object.entries(variables).forEach(([key, val]) => {
      const cleanKey = key.trim().toUpperCase();
      if (!envKeyRegex.test(cleanKey)) {
        invalidKeys.push(key);
      }
      existingVariables[cleanKey] = val;
    });

    if (invalidKeys.length > 0) {
      return res.status(400).json({ error: `Nombres de variable inválidos: ${invalidKeys.join(', ')}. Deben ser letras mayúsculas, números y guiones bajos solamente.` });
    }

    // Reconstruir el contenido ordenado
    let content = '';
    Object.entries(existingVariables).forEach(([key, val]) => {
      content += `${key}=${val}\n`;
    });

    await fs.writeFile(envPath, content, 'utf-8');
    res.json({ success: true, message: 'Variables de entorno actualizadas en .env.local con éxito (fusión realizada).' });
  } catch (err) {
    res.status(500).json({ error: `Error al escribir variables .env.local: ${err.message}` });
  }
});

// Endpoint para actualizar el estado administrativo de una instancia
app.post('/api/project/status/update', async (req, res) => {
  const { clientId, status } = req.body;
  if (!clientId || !status) {
    return res.status(400).json({ error: 'Los parámetros "clientId" y "status" son obligatorios.' });
  }

  try {
    const projectDir = await findProjectDir(clientId);
    if (!projectDir) {
      return res.status(404).json({ error: `No se encontró la instancia para: ${clientId}` });
    }

    const lockPath = path.join(projectDir, 'prototipe.lock.json');
    if (await fs.pathExists(lockPath)) {
      const lockData = await fs.readJson(lockPath);
      lockData.status = status;
      lockData.statusUpdatedAt = new Date().toISOString();
      await fs.writeJson(lockPath, lockData, { spaces: 2 });
    }

    // Actualizar también en .env.local el estado (ej: VITE_APP_STATUS)
    const envPath = path.join(projectDir, '.env.local');
    if (await fs.pathExists(envPath)) {
      let envContent = await fs.readFile(envPath, 'utf-8');
      const lines = envContent.split('\n');
      let found = false;
      const newLines = lines.map(line => {
        if (line.trim().startsWith('VITE_APP_STATUS=')) {
          found = true;
          return `VITE_APP_STATUS=${status}`;
        }
        return line;
      });
      if (!found) {
        newLines.push(`VITE_APP_STATUS=${status}`);
      }
      await fs.writeFile(envPath, newLines.join('\n'), 'utf-8');
    }

    res.json({ success: true, message: `Estado de la instancia de "${clientId}" actualizado a "${status}" con éxito.` });
  } catch (err) {
    res.status(500).json({ error: `Error al actualizar el estado de la instancia: ${err.message}` });
  }
});

// Endpoint para actualizar branding/HSL de la instancia en caliente
app.post('/api/project/branding', async (req, res) => {
  const { clientId, colors } = req.body; // colors: { primaryH, primaryS, primaryL, secondaryH... }
  if (!clientId || !colors) {
    return res.status(400).json({ error: 'Los parámetros "clientId" y "colors" son obligatorios.' });
  }

  try {
    const projectDir = await findProjectDir(clientId);
    if (!projectDir) {
      return res.status(404).json({ error: `No se encontró la instancia para: ${clientId}` });
    }

    const envPath = path.join(projectDir, '.env.local');
    let existingVariables = {};
    if (await fs.pathExists(envPath)) {
      const existingContent = await fs.readFile(envPath, 'utf-8');
      existingContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const index = trimmed.indexOf('=');
          const key = trimmed.slice(0, index).trim();
          const val = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');
          existingVariables[key] = val;
        }
      });
    }

    // Inyectar variables HSL
    Object.entries(colors).forEach(([key, val]) => {
      const cleanKey = `VITE_COLOR_${key.toUpperCase()}`;
      existingVariables[cleanKey] = val;
    });

    let content = '';
    Object.entries(existingVariables).forEach(([key, val]) => {
      content += `${key}=${val}\n`;
    });

    await fs.writeFile(envPath, content, 'utf-8');
    res.json({ success: true, message: 'Paleta de colores HSL actualizada con éxito en la instancia.' });
  } catch (err) {
    res.status(500).json({ error: `Error al actualizar branding: ${err.message}` });
  }
});

// Endpoint para inyectar/agregar una feature a la instancia
app.post('/api/project/features/add', async (req, res) => {
  const { clientId, featureId } = req.body;
  if (!clientId || !featureId) {
    return res.status(400).json({ error: 'Los parámetros "clientId" y "featureId" son obligatorios.' });
  }

  try {
    const projectDir = await findProjectDir(clientId);
    if (!projectDir) {
      return res.status(404).json({ error: `No se encontró la instancia para: ${clientId}` });
    }

    // 1. Resolver ruta origen usando FeatureRegistry
    const srcFeature = await FeatureRegistry.resolvePhysicalPath(featureId);
    if (!srcFeature) {
      return res.status(404).json({ error: `No se encontró origen físico para la feature "${featureId}" en el registro.` });
    }

    const destFeature = path.join(projectDir, 'src', 'features', featureId);
    
    // 2. Copiar carpeta del módulo
    await fs.ensureDir(path.dirname(destFeature));
    await fs.copy(srcFeature, destFeature);

    // 3. Actualizar prototipe.lock.json (Instance Manifest)
    const lockPath = path.join(projectDir, 'prototipe.lock.json');
    if (await fs.pathExists(lockPath)) {
      const lockData = await fs.readJson(lockPath);
      if (!lockData.featuresInstalled) {
        lockData.featuresInstalled = {};
      }
      const featMeta = await FeatureRegistry.resolve(featureId);
      lockData.featuresInstalled[featureId] = {
        version: featMeta ? featMeta.version : '1.0.0',
        installedAt: new Date().toISOString()
      };
      await fs.writeJson(lockPath, lockData, { spaces: 2 });
    }

    // 4. Regenerar artefactos de catálogo y manifiestos en la instancia
    const registryPath = path.join(__dirname, 'knowledge', 'feature-registry.json');
    const generator = new FeatureArtifactGenerator(registryPath);
    await generator.generate(projectDir);

    res.json({ success: true, message: `Feature "${featureId}" inyectada, registrada y artefactos regenerados con éxito en la instancia.` });
  } catch (err) {
    res.status(500).json({ error: `Error al agregar feature: ${err.message}` });
  }
});

// Endpoint para remover una feature de la instancia
app.post('/api/project/features/remove', async (req, res) => {
  const { clientId, featureId } = req.body;
  if (!clientId || !featureId) {
    return res.status(400).json({ error: 'Los parámetros "clientId" y "featureId" son obligatorios.' });
  }

  try {
    const projectDir = await findProjectDir(clientId);
    if (!projectDir) {
      return res.status(404).json({ error: `No se encontró la instancia para: ${clientId}` });
    }

    const featurePath = path.join(projectDir, 'src', 'features', featureId);
    
    // 1. Eliminar carpeta física
    if (await fs.pathExists(featurePath)) {
      await fs.remove(featurePath);
    }

    // 2. Actualizar prototipe.lock.json
    const lockPath = path.join(projectDir, 'prototipe.lock.json');
    if (await fs.pathExists(lockPath)) {
      const lockData = await fs.readJson(lockPath);
      if (lockData.featuresInstalled && lockData.featuresInstalled[featureId]) {
        delete lockData.featuresInstalled[featureId];
        await fs.writeJson(lockPath, lockData, { spaces: 2 });
      }
    }

    // 3. Regenerar artefactos de catálogo y manifiestos en la instancia
    const registryPath = path.join(__dirname, 'knowledge', 'feature-registry.json');
    const generator = new FeatureArtifactGenerator(registryPath);
    await generator.generate(projectDir);

    res.json({ success: true, message: `Feature "${featureId}" removida y artefactos regenerados con éxito de la instancia.` });
  } catch (err) {
    res.status(500).json({ error: `Error al remover feature: ${err.message}` });
  }
});

// ==========================================
// PORTAL DE FEATURES - ENDPOINTS TRANSACCIONALES
// ==========================================

// Helper para calcular hash del registry
async function calculateRegistryHash() {
  const regPath = path.join(__dirname, 'knowledge', 'feature-registry.json');
  if (!(await fs.pathExists(regPath))) return '';
  const data = await fs.readJson(regPath);
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// 1. GET /api/project/features/token - Obtener token activo (Protegido por IP Loopback únicamente)
app.get('/api/project/features/token', loopbackOnlyMiddleware, async (req, res) => {
  try {
    const tokenPath = path.join(__dirname, '.prototipe', 'cli-token.json');
    if (!(await fs.pathExists(tokenPath))) {
      return res.status(500).json({ error: 'Token de loopback no inicializado en el servidor.' });
    }
    const tokenData = await fs.readJson(tokenPath);
    res.json({ token: tokenData.token, expiresAt: tokenData.expiresAt });
  } catch (err) {
    res.status(500).json({ error: `Error al obtener token de seguridad: ${err.message}` });
  }
});

// 2. POST /api/project/features/plan - Planificación y pre-validación de scaffolding
app.post('/api/project/features/plan', loopbackOnlyMiddleware, authenticateCliToken, async (req, res) => {
  try {
    const payload = req.body;
    const regPath = path.join(__dirname, 'knowledge', 'feature-registry.json');
    const registry = await fs.readJson(regPath);
    
    // Validar el payload de creación
    const validation = FeatureRequestValidator.validateCreateRequest(payload, registry.features);
    if (!validation.valid) {
      return res.status(validation.code === 'CONFLICT' ? 409 : 400).json({ error: validation.error });
    }

    const currentHash = await calculateRegistryHash();
    const operationId = `op-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    // Plan detallado de cambios físicos
    const plan = [
      { action: 'CREATE_DIR', path: `src/features/${payload.featureId}/` },
      { action: 'CREATE_FILE', path: `src/features/${payload.featureId}/index.js` },
      { action: 'CREATE_FILE', path: `src/features/${payload.featureId}/module.js` },
      { action: 'CREATE_FILE', path: `src/features/${payload.featureId}/implementation.manifest.json` },
      { action: 'CREATE_FILE', path: `src/features/${payload.featureId}/routes.jsx` },
      { action: 'CREATE_FILE', path: `src/features/${payload.featureId}/security/feature-security.json` },
      { action: 'CREATE_FILE', path: `src/features/${payload.featureId}/constants/index.js` },
      { action: 'CREATE_FILE', path: `src/features/${payload.featureId}/schemas/schemas.js` },
      { action: 'CREATE_FILE', path: `src/features/${payload.featureId}/api/repository.js` },
      { action: 'CREATE_FILE', path: `src/features/${payload.featureId}/services/service.js` },
      { action: 'CREATE_FILE', path: `src/features/${payload.featureId}/hooks/useFeature.js` },
      { action: 'CREATE_FILE', path: `src/features/${payload.featureId}/components/AdminView.jsx` },
      { action: 'CREATE_FILE', path: `src/features/${payload.featureId}/components/ClientView.jsx` },
      { action: 'MODIFY_FILE', path: 'knowledge/feature-registry.json' },
      { action: 'REGENERATE_ARTIFACTS', path: 'src/core/generated/' }
    ];

    // Registrar en el Journal la planificación en estado VALIDATING
    await OperationJournalRepository.save(operationId, JOURNAL_STATES.VALIDATING, {
      payload,
      currentRegistryHash: currentHash,
      plan
    });

    res.json({
      success: true,
      operationId,
      currentRegistryHash: currentHash,
      plan
    });
  } catch (err) {
    res.status(500).json({ error: `Error al planificar feature: ${err.message}` });
  }
});

// 3. POST /api/project/features/commit - Inyección transaccional y certificación en Workspace Candidato
app.post('/api/project/features/commit', loopbackOnlyMiddleware, authenticateCliToken, async (req, res) => {
  const { operationId, currentRegistryHash } = req.body;

  if (!operationId || !currentRegistryHash) {
    return res.status(400).json({ error: 'Parámetros operationId y currentRegistryHash son obligatorios.' });
  }

  // Cargar estado de la transacción del Journal
  const journal = await OperationJournalRepository.get();
  if (!journal || journal.operationId !== operationId) {
    return res.status(404).json({ error: `No se encontró planificación activa para la operación "${operationId}".` });
  }

  // 1. Control de Concurrencia (Registry Hash Lock)
  const freshHash = await calculateRegistryHash();
  if (freshHash !== currentRegistryHash) {
    await OperationJournalRepository.finalize(operationId, 'STALE_PLAN');
    return res.status(409).json({
      error: 'STALE_PLAN: El catálogo central de features ha cambiado desde la planificación de esta operación. Por favor re-genera el plan.'
    });
  }

  try {
    // 2. Adquirir bloqueo exclusivo físico del Monorepo
    await WorkspaceLockManager.acquire(operationId);

    // 3. Transicionar a STAGING y crear la estructura física en staging temporal
    await OperationJournalRepository.save(operationId, JOURNAL_STATES.STAGING);
    const stagingDir = path.join(__dirname, '.prototipe', 'staging', operationId);
    
    // Generar scaffold local de feature en staging
    const payload = journal.metadata.payload;
    await FeatureScaffolder.scaffold(stagingDir, payload);

    // 4. Transicionar a VERIFYING_CONTRACTS y certificar build en el Workspace Candidato
    await OperationJournalRepository.save(operationId, JOURNAL_STATES.VERIFYING_CONTRACTS);
    
    const verification = await FeatureVerificationRunner.verify(
      operationId,
      payload.featureId,
      stagingDir,
      payload
    );

    if (!verification.success) {
      // Registrar el fallo de la compilación en el Journal (FAILED_NEEDS_MANUAL_REVIEW)
      await OperationJournalRepository.save(operationId, JOURNAL_STATES.FAILED_NEEDS_MANUAL_REVIEW, {
        error: verification.error,
        buildOutput: verification.buildOutput
      });
      
      // Liberar el lock
      await WorkspaceLockManager.release(operationId);
      
      return res.status(422).json({
        success: false,
        error: 'Verificación de compilación fallida en el workspace candidato. Cambios revertidos.',
        details: verification.error
      });
    }

    // 5. Build exitoso -> Transicionar a COMMITTING e inyectar cambios reales en el monorepo
    await OperationJournalRepository.save(operationId, JOURNAL_STATES.COMMITTING);

    // Copiar la carpeta física de la feature al Core base y a la plantilla de CLI
    const realAppVentasFeaturePath = path.join(__dirname, '..', 'Plantillas Core', 'App Ventas', 'src', 'features', payload.featureId);
    const templateCliFeaturePath = path.join(__dirname, 'templates', 'template-ventas', 'src', 'features', payload.featureId);

    await fs.copy(stagingDir, realAppVentasFeaturePath);
    await fs.copy(stagingDir, templateCliFeaturePath);

    // Registrar en el feature-registry.json central
    const regPath = path.join(__dirname, 'knowledge', 'feature-registry.json');
    const registry = await fs.readJson(regPath);
    registry.features.push({
      id: payload.featureId,
      displayName: payload.displayName,
      version: payload.version || '1.0.0',
      category: payload.category || 'commerce',
      description: payload.description || '',
      dependencies: payload.dependencies || [],
      tags: payload.tags || [],
      status: 'stable'
    });
    await fs.writeJson(regPath, registry, { spaces: 2 });

    // 6. Regenerar artefactos locales reales (Manifiesto, Catálogo y Defaults)
    const generator = new FeatureArtifactGenerator(regPath);
    
    const realAppVentasRoot = path.join(__dirname, '..', 'Plantillas Core', 'App Ventas');
    const templateCliRoot = path.join(__dirname, 'templates', 'template-ventas');
    
    await generator.generate(realAppVentasRoot);
    await generator.generate(templateCliRoot);

    // Limpiar staging temporal
    await fs.remove(stagingDir);

    // 7. Liberar el lock y finalizar transacción
    await WorkspaceLockManager.release(operationId);
    await OperationJournalRepository.finalize(operationId, 'SUCCESS');

    res.json({
      success: true,
      message: `Feature "${payload.featureId}" creada, inyectada y compilada con éxito en el monorepo.`
    });

  } catch (err) {
    console.error(`[Commit] Error en la operación ${operationId}:`, err);
    await OperationJournalRepository.save(operationId, JOURNAL_STATES.FAILED_NEEDS_MANUAL_REVIEW, {
      error: err.message
    });
    await WorkspaceLockManager.release(operationId);
    res.status(500).json({ error: `Error transaccional al inyectar feature: ${err.message}` });
  }
});

// Diccionario en memoria de planes de actualización generados (Previsor para pull-based agent remoto)
const activeUpdatePlans = {};

// GET /api/project/versions - Obtiene estado de versiones y drifts de todas las instancias
app.get('/api/project/versions', async (req, res) => {
  try {
    const subdirs = await fs.readdir(INSTANCES_DIR);
    const clients = [];

    // Buscar clientes en la raíz, en seed/ y subcarpetas de categorías
    const addClientVersion = async (folder, name) => {
      const lockPath = path.join(folder, 'prototipe.lock.json');
      if (await fs.pathExists(lockPath)) {
        try {
          const driftResult = await VersionManager.detectDrift(name);
          clients.push({
            clientId: name,
            ...driftResult
          });
        } catch (err) {
          console.error(`[versions API] Error detectando drift para ${name}:`, err);
        }
      }
    };

    for (const sub of subdirs) {
      const fullSub = path.join(INSTANCES_DIR, sub);
      const stat = await fs.stat(fullSub).catch(() => null);
      if (!stat || !stat.isDirectory()) continue;

      const lockPath = path.join(fullSub, 'prototipe.lock.json');
      if (await fs.pathExists(lockPath)) {
        await addClientVersion(fullSub, sub);
      } else {
        const subItems = await fs.readdir(fullSub).catch(() => []);
        for (const subItem of subItems) {
          const subPath = path.join(fullSub, subItem);
          const subStat = await fs.stat(subPath).catch(() => null);
          if (!subStat || !subStat.isDirectory()) continue;
          await addClientVersion(subPath, subItem);
        }
      }
    }

    // Obtener la versión de referencia del Core desde la plantilla real (App Ventas)
    const plantillasCoreDir = path.join(path.dirname(getWorkspaceRoot()), 'Plantillas Core');
    const mainCorePkgPath = path.join(plantillasCoreDir, 'App Ventas', 'package.json');
    let coreReferenceVersion = '1.0.6';
    if (await fs.pathExists(mainCorePkgPath)) {
      const seedPkg = await fs.readJson(mainCorePkgPath);
      coreReferenceVersion = seedPkg.version || coreReferenceVersion;
    } else {
      const seedPkgPath = path.join(SEED_DIR, 'package.json');
      if (await fs.pathExists(seedPkgPath)) {
        const seedPkg = await fs.readJson(seedPkgPath);
        coreReferenceVersion = seedPkg.version || coreReferenceVersion;
      }
    }

    res.json({
      success: true,
      coreReferenceVersion,
      clients
    });
  } catch (err) {
    res.status(500).json({ error: `Error al obtener reporte de versiones: ${err.message}` });
  }
});

// POST /api/project/update/preflight - Genera el Update Blueprint Plan
app.post('/api/project/update/preflight', async (req, res) => {
  const { clientId, operator } = req.body;
  if (!clientId) {
    return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });
  }

  try {
    const plan = await VersionManager.buildUpdatePlan(clientId, operator || 'admin');
    activeUpdatePlans[plan.updateId] = plan; // Guardar en cache en memoria
    res.json({
      success: true,
      plan
    });
  } catch (err) {
    res.status(500).json({ error: `Error al generar preflight update plan: ${err.message}` });
  }
});

// GET /api/project/update/plan/:updateId - Permite a un agente pull-based remoto consultar el plan
app.get('/api/project/update/plan/:updateId', (req, res) => {
  const { updateId } = req.params;
  const plan = activeUpdatePlans[updateId];
  if (!plan) {
    return res.status(404).json({ error: 'Update plan no encontrado o expirado.' });
  }
  res.json({ success: true, plan });
});

// POST /api/project/update/apply - SSE Stream que ejecuta la actualización de un cliente usando el plan
app.get('/api/project/update/apply', (req, res) => {
  const { clientId, updateId, operator } = req.query;

  if (!clientId || !updateId) {
    return res.status(400).json({ error: 'Los parámetros "clientId" y "updateId" son obligatorios.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendSSE = (status, text, data = {}) => {
    res.write(`data: ${JSON.stringify({ status, text, ...data })}\n\n`);
  };

  (async () => {
    try {
      const plan = activeUpdatePlans[updateId];
      if (!plan) {
        sendSSE('error', 'El plan de actualización especificado ha expirado o es inválido.');
        return res.end();
      }

      const result = await VersionManager.applyUpdatePlan(clientId, plan, operator || 'admin', (logMsg) => {
        sendSSE('progress', logMsg);
      });

      if (result.status === 'success') {
        sendSSE('done', 'Actualización completada y verificada exitosamente sin regresiones.');
      } else {
        sendSSE('rolled_back', 'Fallo en compilación de post-flight. Se aplicó rollback automático al estado original.');
      }
    } catch (err) {
      sendSSE('error', `Pipeline falló con excepción: ${err.message}`);
    } finally {
      res.end();
    }
  })();
});

// POST /api/project/update/rollback - Revierte manualmente a un backup físico versionado
app.post('/api/project/update/rollback', async (req, res) => {
  const { clientId, updateId } = req.body;
  if (!clientId || !updateId) {
    return res.status(400).json({ error: 'Los parámetros "clientId" y "updateId" son obligatorios.' });
  }

  try {
    const result = await VersionManager.runRollback(clientId, updateId, (logMsg) => {
      console.log(`[Rollback Manual] ${logMsg}`);
    });
    res.json({
      success: true,
      message: `Rollback a la versión ${updateId} aplicado con éxito en el cliente ${clientId}.`
    });
  } catch (err) {
    res.status(500).json({ error: `Fallo al aplicar rollback manual: ${err.message}` });
  }
});

// ==========================================
// TELEMETRÍA Y GOBERNANZA DE EVENTOS (FASE 9.4)
// ==========================================

const EVENT_TYPES_PATH = path.join(__dirname, 'knowledge', 'telemetry', 'event-types.json');

// Mapas en memoria para rate limiting
const telemetryRateLimit = {};

// GET /api/project/telemetry/adoption - Adopción de features basada en prototipe.lock.json
app.get('/api/project/telemetry/adoption', async (req, res) => {
  try {
    const subdirs = await fs.readdir(INSTANCES_DIR);
    const registryFeatures = await FeatureRegistry.getAll();
    const stats = {};

    // Inicializar contadores
    for (const feat of registryFeatures) {
      stats[feat.id] = {
        id: feat.id,
        name: feat.displayName || feat.id,
        category: feat.category || 'General',
        installCount: 0,
        totalTenants: 0,
        adoptionRate: 0
      };
    }

    let activeTenantsCount = 0;

    for (const sub of subdirs) {
      const fullSub = path.join(INSTANCES_DIR, sub);
      const stat = await fs.stat(fullSub);
      if (stat.isDirectory() && sub !== 'seed') {
        const lockPath = path.join(fullSub, 'prototipe.lock.json');
        if (await fs.pathExists(lockPath)) {
          activeTenantsCount++;
          const lock = await fs.readJson(lockPath);
          const installed = lock.featuresInstalled || {};
          
          for (const featId of Object.keys(installed)) {
            if (stats[featId]) {
              stats[featId].installCount++;
            }
          }
        }
      }
    }

    // Calcular tasas
    for (const featId of Object.keys(stats)) {
      stats[featId].totalTenants = activeTenantsCount;
      stats[featId].adoptionRate = activeTenantsCount > 0 
        ? Math.round((stats[featId].installCount / activeTenantsCount) * 100) 
        : 0;
    }

    res.json({
      success: true,
      stats: Object.values(stats),
      totalActiveTenants: activeTenantsCount
    });
  } catch (err) {
    res.status(500).json({ error: `Error al calcular adopción: ${err.message}` });
  }
});

// GET /api/project/telemetry/pings - Ping HTTP no bloqueante y latencia de instancias
app.get('/api/project/telemetry/pings', async (req, res) => {
  try {
    const subdirs = await fs.readdir(INSTANCES_DIR);
    const pingResults = [];

    for (const sub of subdirs) {
      const fullSub = path.join(INSTANCES_DIR, sub);
      const stat = await fs.stat(fullSub);
      if (stat.isDirectory() && sub !== 'seed') {
        const lockPath = path.join(fullSub, 'prototipe.lock.json');
        if (await fs.pathExists(lockPath)) {
          // Obtener puerto asignado (por convención o simulación de host)
          // Si no está corriendo, medimos la salud del filesystem o respondemos ping simulado
          const start = Date.now();
          let status = 'success';
          let latency = 0;
          
          try {
            // Intentar verificar existencia de index.html como indicador de salud local
            const htmlExists = await fs.pathExists(path.join(fullSub, 'index.html'));
            latency = Date.now() - start;
            if (!htmlExists) {
              status = 'error';
            }
          } catch (e) {
            status = 'error';
            latency = 999;
          }

          pingResults.push({
            clientId: sub,
            status,
            latency: latency || 12, // Latencia mínima simulada de disco local
            lastPing: new Date().toISOString()
          });
        }
      }
    }

    res.json({
      success: true,
      pings: pingResults
    });
  } catch (err) {
    res.status(500).json({ error: `Error en escaneo de salud: ${err.message}` });
  }
});

// POST /api/project/telemetry/report - Registro protegido de eventos con rate limit
app.post('/api/project/telemetry/report', verifyAppCheck, async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const { clientId, type, source, environment, severity, message, details } = req.body;

  // 1. Rate Limiting (Máximo 60 peticiones por minuto por cliente/IP)
  const limitKey = `${ip}_${clientId || 'global'}`;
  const now = Date.now();
  if (!telemetryRateLimit[limitKey]) {
    telemetryRateLimit[limitKey] = [];
  }
  // Filtrar peticiones de más de 60s
  telemetryRateLimit[limitKey] = telemetryRateLimit[limitKey].filter(t => now - t < 60000);
  if (telemetryRateLimit[limitKey].length >= 60) {
    return res.status(429).json({ error: 'DevOps Guard: Rate limit excedido. Máximo 60 peticiones/min.' });
  }
  telemetryRateLimit[limitKey].push(now);

  // 2. Validación de Campos Básicos
  if (!clientId || !type || !source || !environment || !severity || !message) {
    return res.status(400).json({ error: 'Esquema incompleto. Los campos clientId, type, source, environment, severity y message son obligatorios.' });
  }

  try {
    // 3. Autenticación de Tenant mediante App Check
    // Validar que el clientId enviado en el payload coincida exactamente con el tenant verificado por App Check
    const verifiedClientId = req.tenant ? req.tenant.clientId : 'test-client'; // Fallback seguro para bypass de test
    if (clientId !== verifiedClientId) {
      return res.status(403).json({ error: '🔒 App Check: El ClientID enviado no coincide con la aplicación autorizada.' });
    }

    // 4. Validación contra Catálogo de Eventos Gobernados (event-types.json)
    if (!(await fs.pathExists(EVENT_TYPES_PATH))) {
      return res.status(500).json({ error: 'Catálogo de eventos gobernados no encontrado en el servidor.' });
    }
    const catalog = await fs.readJson(EVENT_TYPES_PATH);
    const rules = catalog.eventTypes.find(e => e.type === type);

    if (!rules) {
      return res.status(400).json({ error: `Tipo de evento "${type}" no registrado en el catálogo gobernado.` });
    }
    if (!rules.allowedSources.includes(source)) {
      return res.status(400).json({ error: `El origen "${source}" no es válido para el tipo de evento "${type}". Permitidos: ${rules.allowedSources.join(', ')}` });
    }
    if (!rules.allowedSeverities.includes(severity)) {
      return res.status(400).json({ error: `La severidad "${severity}" no es válida para el tipo de evento "${type}". Permitidas: ${rules.allowedSeverities.join(', ')}` });
    }

    // 5. Todo válido -> Guardar el evento en Firestore si estuviera bindeado,
    // o en un log local en scratch/logs/telemetry.json si corre offline
    const event = {
      eventId: `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      clientId,
      type,
      source,
      environment,
      severity,
      message,
      details: details || {},
      timestamp: new Date().toISOString()
    };

    // Sincronizar en log local
    const logFile = path.join(CLI_ROOT, 'scratch', 'logs', 'telemetry.json');
    await fs.ensureDir(path.dirname(logFile));
    let logs = [];
    if (await fs.pathExists(logFile)) {
      logs = await fs.readJson(logFile);
    }
    logs.push(event);
    // Limitar log a los últimos 1000 eventos
    if (logs.length > 1000) logs.shift();
    await fs.writeJson(logFile, logs, { spaces: 2 });

    res.json({
      success: true,
      eventId: event.eventId,
      message: 'Evento registrado y validado con éxito.'
    });
  } catch (err) {
    res.status(500).json({ error: `Fallo en el pipeline de telemetría: ${err.message}` });
  }
});

// GET /api/project/telemetry/logs - Recupera logs locales de telemetría para el dashboard
app.get('/api/project/telemetry/logs', async (req, res) => {
  try {
    const logFile = path.join(CLI_ROOT, 'scratch', 'logs', 'telemetry.json');
    if (await fs.pathExists(logFile)) {
      const logs = await fs.readJson(logFile);
      res.json({ success: true, logs });
    } else {
      res.json({ success: true, logs: [] });
    }
  } catch (err) {
    res.status(500).json({ error: `Error al leer logs de telemetría: ${err.message}` });
  }
});


// Función interna para realizar la auditoría física y PWA de un proyecto
async function runAuditInternal(projectDir, clientId) {
  const distDir = path.join(projectDir, 'dist');
  if (!await fs.pathExists(distDir)) {
    return {
      compiled: false,
      score: 0,
      report: {
        status: 'error',
        message: "La carpeta 'dist' no existe. Debes compilar la aplicación (npm run build) primero para realizar la auditoría."
      }
    };
  }

  let jsTotalSize = 0;
  let cssTotalSize = 0;
  let otherTotalSize = 0;
  const largeChunks = [];
  const warnings = [];

  const manifestPath = path.join(distDir, '.vite', 'manifest.json');
  let manifest = null;
  const staticFiles = new Set();

  if (await fs.pathExists(manifestPath)) {
    try {
      manifest = await fs.readJson(manifestPath);
      const entryKey = Object.keys(manifest).find(k => manifest[k].isEntry);
      if (entryKey) {
        const addStatic = (key) => {
          const entry = manifest[key];
          if (entry && entry.file) {
            const basename = path.basename(entry.file);
            if (!staticFiles.has(basename)) {
              staticFiles.add(basename);
              if (entry.imports) {
                entry.imports.forEach(impKey => {
                  if (manifest[impKey]) {
                    addStatic(impKey);
                  } else {
                    const foundKey = Object.keys(manifest).find(k => manifest[k].file === impKey || k === impKey);
                    if (foundKey) addStatic(foundKey);
                    else staticFiles.add(path.basename(impKey));
                  }
                });
              }
            }
          }
        };
        addStatic(entryKey);
      }
    } catch (e) {
      console.warn(`[Auditor PWA] No se pudo leer o procesar manifest.json: ${e.message}`);
    }
  }

  const assetsDir = path.join(distDir, 'assets');
  if (await fs.pathExists(assetsDir)) {
    const files = await fs.readdir(assetsDir);
    for (const file of files) {
      const fullPath = path.join(assetsDir, file);
      const stat = await fs.stat(fullPath);
      if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        const sizeKb = stat.size / 1024;

        if (ext === '.js') {
          jsTotalSize += stat.size;
          if (sizeKb > 500) {
            const isStatic = manifest ? staticFiles.has(file) : true;
            if (isStatic) {
              largeChunks.push({ file, size: `${sizeKb.toFixed(1)} KB` });
            } else {
              warnings.push(`[Optimización] El chunk dinámico "${file}" es pesado (${sizeKb.toFixed(1)} KB), pero se carga bajo demanda (Lazy Load).`);
            }
          }
        } else if (ext === '.css') {
          cssTotalSize += stat.size;
        } else {
          otherTotalSize += stat.size;
        }
      }
    }
  }

  const hasSW = await fs.pathExists(path.join(distDir, 'sw.js'));
  let manifestExists = false;
  let manifestValid = false;
  let hasStartUrl = false;
  let hasIcons = false;

  const manifestPathJson = path.join(distDir, 'manifest.json');
  const manifestPathWeb = path.join(distDir, 'manifest.webmanifest');

  const checkManifestFile = async (filePath) => {
    if (await fs.pathExists(filePath)) {
      manifestExists = true;
      try {
        const parsed = await fs.readJson(filePath);
        manifestValid = true;
        if (parsed.start_url) hasStartUrl = true;
        if (parsed.icons && Array.isArray(parsed.icons) && parsed.icons.length > 0) hasIcons = true;
      } catch (err) {
        warnings.push(`[PWA] El manifiesto "${path.basename(filePath)}" existe pero no es un JSON válido: ${err.message}`);
      }
    }
  };

  await checkManifestFile(manifestPathJson);
  if (!manifestExists) {
    await checkManifestFile(manifestPathWeb);
  }

  let score = 30; // 30 pts base
  
  if (manifestExists) {
    score += 10;
    if (manifestValid) {
      score += 5;
      if (hasStartUrl && hasIcons) {
        score += 5;
      } else {
        warnings.push('[PWA] El manifiesto PWA no contiene las propiedades requeridas de instalación (start_url o iconos).');
      }
    } else {
      warnings.push('[PWA] El manifiesto PWA no es un JSON válido y el navegador lo rechazará.');
    }
  } else {
    warnings.push('No se encontró manifiesto de PWA (manifest.webmanifest o manifest.json).');
  }

  if (hasSW) {
    score += 20;
  } else {
    warnings.push('No se encontró Service Worker (sw.js) registrado para soporte offline.');
  }

  const maxJsChunkPenalty = Math.min(30, largeChunks.length * 10);
  score += (30 - maxJsChunkPenalty);

  largeChunks.forEach(chunk => {
    warnings.push(`El chunk JavaScript "${chunk.file}" es muy pesado (${chunk.size}). Considera usar Code Splitting o importación dinámica.`);
  });

  return {
    compiled: true,
    score,
    report: {
      jsTotalSize: `${(jsTotalSize / 1024 / 1024).toFixed(2)} MB`,
      cssTotalSize: `${(cssTotalSize / 1024).toFixed(1)} KB`,
      otherTotalSize: `${(otherTotalSize / 1024).toFixed(1)} KB`,
      hasServiceWorker: hasSW,
      hasManifest: manifestExists,
      warnings,
      status: score >= 90 ? 'excelente' : score >= 70 ? 'bueno' : 'optimizacion_requerida'
    }
  };
}

// Endpoint para auditar la calidad física y PWA de un proyecto local
app.get('/api/project/audit', async (req, res) => {
  const { clientId } = req.query;
  if (!clientId) {
    return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });
  }

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) {
    return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });
  }

  try {
    const result = await runAuditInternal(projectDir, clientId);
    res.json({ success: true, clientId, ...result });
  } catch (err) {
    console.error(`[API /project/audit] Error: ${err.message}`);
    res.status(500).json({ error: `Error durante la auditoría: ${err.message}` });
  }
});

// Endpoints de Auto-Resolución (Quick Fixes) de Calidad y PWA

app.post('/api/project/fix/chunks', async (req, res) => {
  const { clientId } = req.body;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: 'Proyecto no encontrado.' });

  const configPath = path.join(projectDir, 'vite.config.js');
  if (!await fs.pathExists(configPath)) {
    return res.status(404).json({ error: 'No se encontró el archivo vite.config.js en el proyecto.' });
  }

  try {
    let content = await fs.readFile(configPath, 'utf-8');
    if (content.includes('firebase-firestore') && content.includes('react-core') && content.includes('manifest: true')) {
      return res.json({ success: true, message: 'La optimización de chunks ya está aplicada en vite.config.js.' });
    }

    if (content.includes('build: {') && !content.includes('manifest:')) {
      content = content.replace('build: {', 'build: {\n    manifest: true,');
    }

    const target = "return 'vendor';";
    const replacement = `// Fragmentar Firebase SDK
            if (id.includes('firebase/auth') || id.includes('@firebase/auth')) {
              return 'firebase-auth';
            }
            if (id.includes('firebase/firestore') || id.includes('@firebase/firestore')) {
              return 'firebase-firestore';
            }
            if (id.includes('firebase/storage') || id.includes('@firebase/storage')) {
              return 'firebase-storage';
            }
            if (id.includes('firebase/app') || id.includes('@firebase/app')) {
              return 'firebase-app';
            }
            if (id.includes('firebase')) {
              return 'firebase-misc';
            }
            // Fragmentar Utilidades Pesadas de Terceros
            if (id.includes('dexie')) {
              return 'dexie';
            }
            if (id.includes('qrcode')) {
              return 'qrcode';
            }
            if (id.includes('embla-carousel')) {
              return 'embla';
            }
            if (id.includes('canvas-confetti')) {
              return 'confetti';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('react-router-dom') || id.includes('react-router') || id.includes('@remix-run')) {
              return 'react-router';
            }
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'react-core';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }
            if (id.includes('zod')) {
              return 'zod';
            }
            return 'vendor-utils';`;

    if (content.includes(target)) {
      content = content.replace(target, replacement);
      await fs.writeFile(configPath, content, 'utf-8');
      return res.json({ success: true, message: 'Se ha optimizado vite.config.js dividiendo el bundle inicial.' });
    } else {
      return res.status(400).json({ error: 'No se pudo auto-detectar el patrón de manualChunks estándar.' });
    }
  } catch (err) {
    res.status(500).json({ error: `Fallo al optimizar chunks: ${err.message}` });
  }
});

app.post('/api/project/fix/pwa', async (req, res) => {
  const { clientId } = req.body;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: 'Proyecto no encontrado.' });

  try {
    const publicDir = path.join(projectDir, 'public');
    await fs.ensureDir(publicDir);

    const templatePublic = path.join(getWorkspaceRoot(), 'Prototipe-CLI', 'templates', 'template-ventas', 'public');
    const icons = ['pwa-192x192.png', 'pwa-512x512.png', 'favicon.svg'];
    
    for (const icon of icons) {
      const destPath = path.join(publicDir, icon);
      if (!await fs.pathExists(destPath) && await fs.pathExists(path.join(templatePublic, icon))) {
        await fs.copy(path.join(templatePublic, icon), destPath);
      }
    }

    res.json({ success: true, message: 'Se han restablecido los recursos PWA en public/ y se forzará la reconstrucción en el siguiente deploy.' });
  } catch (err) {
    res.status(500).json({ error: `Fallo al inyectar recursos PWA: ${err.message}` });
  }
});

app.post('/api/project/fix/rules', async (req, res) => {
  const { clientId, type = 'all' } = req.body;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: 'Proyecto no encontrado.' });

  try {
    // 1. Detectar el Core asignado al cliente
    const metaPath = path.join(projectDir, '.prototipe.json');
    let meta = await fs.pathExists(metaPath) ? await fs.readJson(metaPath) : {};
    meta = validatePrototipeMetadata(meta, path.basename(projectDir));
    let coreId = meta.templateId || meta.coreClave || meta.coreId || meta.template;

    if (!coreId) {
      if (clientId.toLowerCase().includes('venta')) coreId = 'ventas';
      else if (clientId.toLowerCase().includes('servicio')) coreId = 'servicios';
      else if (clientId.toLowerCase().includes('agendamiento') || clientId.toLowerCase().includes('barber')) coreId = 'agendamiento';
      else if (clientId.toLowerCase().includes('gastronomia') || clientId.toLowerCase().includes('restaurante')) coreId = 'gastronomia';
    }

    if (!coreId) {
      return res.status(400).json({ error: 'No se pudo detectar el Core de referencia para este cliente.' });
    }

    // 2. Resolver la ruta absoluta del Core origen
    const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
    const registro = await fs.readJson(registroPath);
    const coreConfig = registro.plantillas[coreId];
    
    let corePath = null;
    if (coreConfig?.fuente) {
      corePath = coreConfig.fuente.replace(/\//g, path.sep);
    } else {
      corePath = await findProjectDir(coreId);
    }

    if (!corePath || !await fs.pathExists(corePath)) {
      return res.status(404).json({ error: `No se encontró el directorio del Core de referencia: "${coreId}"` });
    }

    // 3. Determinar qué archivos restaurar
    const filesToCopy = [];
    if (type === 'firestore' || type === 'all') {
      filesToCopy.push('firestore.rules');
      filesToCopy.push('firestore.indexes.json');
    }
    if (type === 'storage' || type === 'all') {
      filesToCopy.push('storage.rules');
    }

    const restored = [];
    const errors = [];

    for (const fileName of filesToCopy) {
      const destPath = path.join(projectDir, fileName);
      let srcPath = path.join(corePath, fileName);

      // Fallback a templates de CLI si no existe en la carpeta fuente del Core
      if (!await fs.pathExists(srcPath)) {
        srcPath = path.join(CLI_ROOT, 'templates', `template-${coreId}`, fileName);
      }

      // Segundo fallback a plantilla seed por defecto
      if (!await fs.pathExists(srcPath)) {
        srcPath = path.join(CLI_ROOT, 'templates', 'template-core-seed', fileName);
      }

      if (await fs.pathExists(srcPath)) {
        await fs.copy(srcPath, destPath);
        restored.push(fileName);
      } else {
        errors.push(`${fileName} (no se encontró origen)`);
      }
    }

    if (restored.length > 0) {
      return res.json({
        success: true,
        message: `Se han restaurado los archivos: ${restored.join(', ')}.`,
        errors: errors.length > 0 ? errors : undefined
      });
    } else {
      return res.status(404).json({
        error: 'No se encontraron las plantillas de reglas/configuración origen para copiar.',
        details: errors
      });
    }
  } catch (err) {
    res.status(500).json({ error: `Fallo al restaurar reglas de seguridad: ${err.message}` });
  }
});

// Helper unificado para determinar si un archivo/ruta debe ser excluido de paridad y sincronización.
// Protege credenciales de Firebase, tokens de entorno, marca blanca y carpetas temporales/desarrollo.
function isPathExcludedFromSync(relativePath) {
  const rel = relativePath.replace(/\\/g, '/').toLowerCase();
  
  // 1. Carpetas del entorno, dependencias y temporales
  if (
    rel === 'node_modules' || rel.startsWith('node_modules/') ||
    rel === '.git' || rel.startsWith('.git/') ||
    rel === '.git-backup-temp' || rel.startsWith('.git-backup-temp/') ||
    rel === 'dist' || rel.startsWith('dist/') ||
    rel === '.vite' || rel.startsWith('.vite/') ||
    rel === '.firebase' || rel.startsWith('.firebase/') ||
    rel === 'playwright-report' || rel.startsWith('playwright-report/') ||
    rel === 'test-results' || rel.startsWith('test-results/') ||
    rel === 'scratch' || rel.startsWith('scratch/') ||
    rel === 'scripts' || rel.startsWith('scripts/')
  ) {
    return true;
  }

  // 2. Variables de entorno locales y backups
  if (
    rel === '.env.local' ||
    rel === '.env' ||
    rel.startsWith('.env.') ||
    rel === 'cli_bridge.log' ||
    rel.endsWith('.bak')
  ) {
    return true;
  }

  // 3. Archivos de vinculación de Firebase, metadatos locales y bloqueo de control
  if (
    rel === '.firebaserc' ||
    rel === 'firebase.json' ||
    rel === '.prototipe.json' ||
    rel === '.prototipe-injected.json' ||
    rel === 'prototipe.lock.json' ||
    rel === 'package-lock.json' ||
    rel === '.gitignore' ||
    rel === '.prototipe-backup' || rel.startsWith('.prototipe-backup/') ||
    rel === 'gemini.md' ||
    rel === 'core-manifest.json' ||
    rel === '.prettierrc' ||
    rel === 'eslint.config.js' ||
    rel === 'jsconfig.json' ||
    rel === 'nuevo documento de texto.txt'
  ) {
    return true;
  }

  // 4. Protección flexible de inicialización de Firebase en cualquier ruta de src/
  // (Ej. src/firebase.js, src/config/firebaseConfig.ts, src/lib/firebase.js)
  if (rel.startsWith('src/')) {
    const parts = rel.split('/');
    const fileName = parts[parts.length - 1];
    if (
      fileName.startsWith('firebase') ||
      fileName.startsWith('firebaseconfig')
    ) {
      return true;
    }
  }

  // 5. Service Worker de Firebase Messaging del cliente
  if (rel === 'public/firebase-messaging-sw.js') {
    return true;
  }

  // 6. Carpetas de documentación local
  const segments = rel.split('/');
  if (segments.some(segment => segment.startsWith('documentacion '))) {
    return true;
  }
  if (rel === 'mapa_arquitectura_ia.md' || rel === 'mapa_arquitectura.md') {
    return true;
  }

  // 7. Assets de marca y favicons del cliente
  if (
    rel === 'public/favicon.ico' ||
    rel === 'public/manifest.json' ||
    rel.startsWith('public/favicon-') ||
    rel.startsWith('public/apple-touch-icon') ||
    rel.startsWith('public/android-chrome-') ||
    rel.startsWith('public/mstile-') ||
    rel.startsWith('public/safari-pinned-tab') ||
    rel.startsWith('public/browserconfig.xml')
  ) {
    return true;
  }
  // Excluir logotipos de assets en cualquier extensión (SVG, PNG, etc.)
  if (rel.startsWith('src/assets/')) {
    const parts = rel.split('/');
    const fileName = parts[parts.length - 1];
    if (fileName.startsWith('logo.') || fileName.startsWith('logo-')) {
      return true;
    }
  }

  return false;
}

// Normaliza el contenido HTML limpiando tags de SEO y scripts de terceros del cliente para comparaciones limpias de paridad.
function normalizeIndexHtmlForDiff(content) {
  let normalized = content.replace(/<title>[\s\S]*?<\/title>/gi, '<title>__TITLE__</title>');
  normalized = normalized.replace(/<meta\s+name="apple-mobile-web-app-title"\s+content="[^"]*"\s*\/?>/gi, '');
  normalized = normalized.replace(/<!--\s*CLIENT_SCRIPTS_START\s*-->([\s\S]*?)<!--\s*CLIENT_SCRIPTS_END\s*-->/gi, '');
  
  const seoMetas = ['description', 'keywords', 'og:title', 'og:description', 'twitter:title', 'twitter:description'];
  seoMetas.forEach(name => {
    const isProp = name.startsWith('og:');
    const regexAttr = isProp ? 'property' : 'name';
    const cleanRegex = new RegExp(`<meta\\s+${regexAttr}="${name}"\\s+content="[^"]*"\\s*\/?>`, 'gi');
    normalized = normalized.replace(cleanRegex, '');
  });

  return normalized.replace(/\s+/g, ' ').trim();
}

// Normaliza el contenido de vite.config.js para comparaciones limpias de paridad.
// Enmascara el puerto del servidor local y los campos descriptivos de PWA manifest.
function normalizeViteConfigForDiff(content) {
  if (!content) return '';
  // 1. Normalizar puerto del servidor local
  let normalized = content.replace(/port:\s*\d+/g, 'port: __PORT__');
  // 2. Normalizar campos descriptivos del manifiesto PWA
  normalized = normalized.replace(/name:\s*['"`][^'"`]+['"`]/g, "name: '__PWA_NAME__'");
  normalized = normalized.replace(/short_name:\s*['"`][^'"`]+['"`]/g, "short_name: '__PWA_SHORT_NAME__'");
  normalized = normalized.replace(/description:\s*['"`][^'"`]+['"`]/g, "description: '__PWA_DESC__'");
  // 3. Compactar espacios en blanco para comparación estructural limpia
  return normalized.replace(/\s+/g, ' ').trim();
}

// Fusiona la configuración de vite.config.js del Core preservando el puerto local e inyectando metadatos PWA del cliente.
async function mergeViteConfig(coreContent, clientContent, destPublicDir) {
  let result = coreContent;

  // 1. Preservar puerto del servidor del cliente
  const portMatch = clientContent.match(/port:\s*(\d+)/);
  if (portMatch) {
    const clientPort = portMatch[1];
    result = result.replace(/port:\s*\d+/g, `port: ${clientPort}`);
  }

  // 2. Extraer datos de PWA del cliente si están hardcodeados y migrarlos a public/manifest.json
  const nameMatch = clientContent.match(/name:\s*['"`]([^'"`]+)['"`]/);
  const shortNameMatch = clientContent.match(/short_name:\s*['"`]([^'"`]+)['"`]/);
  const descMatch = clientContent.match(/description:\s*['"`]([^'"`]+)['"`]/);

  if (nameMatch || shortNameMatch || descMatch) {
    const pwaData = {
      name: nameMatch ? nameMatch[1] : 'Ventas SmartFix',
      short_name: shortNameMatch ? shortNameMatch[1] : 'SmartFix',
      description: descMatch ? descMatch[1] : 'Catálogo de compras inteligente',
      theme_color: '#000000',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      scope: '/'
    };

    const manifestPath = path.join(destPublicDir, 'manifest.json');
    await fs.ensureDir(destPublicDir);
    await fs.writeJson(manifestPath, pwaData, { spaces: 2 });
  }

  return result;
}

// Compara el package.json del Core con el del cliente de forma semántica.
// Retorna true si hay dependencias o scripts críticos desalineados o faltantes.
function hasPackageJsonDrift(coreContent, clientContent) {
  try {
    const corePkg = JSON.parse(coreContent);
    const clientPkg = JSON.parse(clientContent);

    const coreDeps = { ...(corePkg.dependencies || {}), ...(corePkg.devDependencies || {}) };
    const clientDeps = { ...(clientPkg.dependencies || {}), ...(clientPkg.devDependencies || {}) };
    const coreScripts = corePkg.scripts || {};
    const clientScripts = clientPkg.scripts || {};

    // 1. Validar dependencias faltantes o con desvíos de versión
    for (const dep in coreDeps) {
      if (!clientDeps[dep]) return true;
      if (clientDeps[dep] !== coreDeps[dep]) return true;
    }

    // 2. Validar scripts del Core faltantes o modificados
    for (const script in coreScripts) {
      if (!clientScripts[script]) return true;
      if (clientScripts[script] !== coreScripts[script]) return true;
    }

    return false;
  } catch (e) {
    return true; // JSON inválido cuenta como drift
  }
}

// Crea una copia de seguridad preventiva en el cliente antes de sobreescribir o fusionar un archivo.
async function createSafeSyncBackup(projectDir, relativeFilePath) {
  const destPath = path.resolve(projectDir, relativeFilePath);
  if (!await fs.pathExists(destPath)) return;

  try {
    const backupDir = path.join(projectDir, '.prototipe-backup', 'sync-backups');
    await fs.ensureDir(backupDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${timestamp}_${path.basename(relativeFilePath)}`);

    await fs.copy(destPath, backupPath);
    console.log(`[Backup] Respaldo preventivo exitoso para ${relativeFilePath} en: ${backupPath}`);
  } catch (err) {
    console.warn(`[Backup] No se pudo crear el respaldo preventivo para ${relativeFilePath}: ${err.message}`);
  }
}


// Inyecta el SEO, título y bloque seguro de scripts de la instancia cliente en el index.html base del Core.
function preserveClientSeoOnIndex(coreContent, clientContent, metadata = {}) {
  let result = coreContent;

  // 1. Extraer e inyectar <title> (con fallback a metadata)
  const titleMatch = clientContent.match(/<title>([\s\S]*?)<\/title>/i);
  const titleText = titleMatch ? titleMatch[1] : (metadata.projectName || 'Prototipe App');
  if (result.match(/<title>[\s\S]*?<\/title>/i)) {
    result = result.replace(/<title>[\s\S]*?<\/title>/i, `<title>${titleText}</title>`);
  } else {
    result = result.replace('</head>', `    <title>${titleText}</title>\n  </head>`);
  }

  // 2. Extraer apple-mobile-web-app-title
  const appleTitleMatch = clientContent.match(/<meta\s+name="apple-mobile-web-app-title"\s+content="([^"]*)"\s*\/?>/i);
  if (appleTitleMatch) {
    if (result.match(/<meta\s+name="apple-mobile-web-app-title"\s+content="[^"]*"\s*\/?>/gi)) {
      result = result.replace(/<meta\s+name="apple-mobile-web-app-title"\s+content="[^"]*"\s*\/?>/gi, 
        `<meta name="apple-mobile-web-app-title" content="${appleTitleMatch[1]}" />`);
    } else {
      result = result.replace('</head>', `    <meta name="apple-mobile-web-app-title" content="${appleTitleMatch[1]}" />\n  </head>`);
    }
  }

  // 3. Extraer y re-inyectar bloque seguro de scripts del cliente (Facebook Pixel, Analytics, etc.)
  const clientScriptsMatch = clientContent.match(/<!--\s*CLIENT_SCRIPTS_START\s*-->([\s\S]*?)<!--\s*CLIENT_SCRIPTS_END\s*-->/i);
  if (clientScriptsMatch && clientScriptsMatch[1].trim()) {
    const scriptsBlock = clientScriptsMatch[0];
    if (result.match(/<!--\s*CLIENT_SCRIPTS_START\s*-->([\s\S]*?)<!--\s*CLIENT_SCRIPTS_END\s*-->/i)) {
      result = result.replace(/<!--\s*CLIENT_SCRIPTS_START\s*-->([\s\S]*?)<!--\s*CLIENT_SCRIPTS_END\s*-->/i, scriptsBlock);
    } else {
      result = result.replace('</head>', `    ${scriptsBlock}\n  </head>`);
    }
  }

  // 4. Conservar metatags SEO comunes
  const seoMetas = ['description', 'keywords', 'og:title', 'og:description', 'twitter:title', 'twitter:description'];
  seoMetas.forEach(name => {
    const isProp = name.startsWith('og:');
    const regexAttr = isProp ? 'property' : 'name';
    const regex = new RegExp(`<meta\\s+${regexAttr}="${name}"\\s+content="([^"]*)"\\s*\/?>`, 'i');
    const match = clientContent.match(regex);
    if (match) {
      const cleanRegex = new RegExp(`<meta\\s+${regexAttr}="${name}"\\s+content="[^"]*"\\s*\/?>`, 'gi');
      result = result.replace(cleanRegex, '');
      result = result.replace('</head>', `    <meta ${regexAttr}="${name}" content="${match[1]}" />\n  </head>`);
    }
  });

  return result;
}

// Fusiona lógicamente dependencias y scripts de npm del Core en el package.json de la instancia cliente.
async function mergePackageJson(corePath, clientPath) {
  const corePkg = await fs.readJson(corePath);
  const clientPkg = await fs.readJson(clientPath);

  const combinedDeps = { ...(clientPkg.dependencies || {}), ...(corePkg.dependencies || {}) };
  const combinedDevDeps = { ...(clientPkg.devDependencies || {}), ...(corePkg.devDependencies || {}) };
  const combinedScripts = { ...(clientPkg.scripts || {}), ...(corePkg.scripts || {}) };

  const merged = {
    ...clientPkg, // Preserva name, version, author, private, etc.
    scripts: combinedScripts,
    dependencies: combinedDeps,
    devDependencies: combinedDevDeps
  };

  return merged;
}

// Helper para escanear directorios recursivamente para el Drift Detector
async function getFilesRecursively(dir, ignorePaths = [], baseDir = dir) {
  let results = [];
  if (!await fs.pathExists(dir)) return results;
  const list = await fs.readdir(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath).catch(() => null);
    if (!stat) continue;
    const relative = path.relative(baseDir, filePath).replace(/\\/g, '/');
    
    // Validar exclusiones con la función unificada
    if (isPathExcludedFromSync(relative)) {
      continue;
    }
    
    if (stat.isDirectory()) {
      results = results.concat(await getFilesRecursively(filePath, ignorePaths, baseDir));
    } else {
      results.push({
        absolutePath: filePath,
        relativePath: relative,
        size: stat.size
      });
    }
  }
  return results;
}

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.pdf', '.zip',
  '.woff', '.woff2', '.ttf', '.eot', '.mp3', '.wav', '.mp4', '.mov', '.svg'
]);

function isBinaryFile(filename) {
  return BINARY_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

// Endpoint para calcular desviaciones físicas (Drift Detector) respecto al Core
app.get('/api/project/drift', async (req, res) => {
  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });

  try {
    const metaPath = path.join(projectDir, '.prototipe.json');
    let meta = await fs.pathExists(metaPath) ? await fs.readJson(metaPath) : {};
    meta = validatePrototipeMetadata(meta, path.basename(projectDir));
    let coreId = meta.templateId || meta.coreClave || meta.coreId || meta.template;

    if (!coreId) {
      if (clientId.toLowerCase().includes('venta')) coreId = 'ventas';
      else if (clientId.toLowerCase().includes('servicio')) coreId = 'servicios';
      else if (clientId.toLowerCase().includes('agendamiento') || clientId.toLowerCase().includes('barber')) coreId = 'agendamiento';
      else if (clientId.toLowerCase().includes('gastronomia') || clientId.toLowerCase().includes('restaurante')) coreId = 'gastronomia';
    }

    if (!coreId) {
      return res.status(400).json({ error: 'No se pudo auto-detectar el Core de referencia para este cliente.' });
    }

    const coreDir = await findProjectDir(coreId);
    if (!coreDir) {
      return res.status(404).json({ error: `No se encontró el directorio del Core de referencia: ${coreId}` });
    }

    // Calcular diff individual bajo demanda para evitar congelar el event loop en el listado de drift
    const { filePath } = req.query;
    if (filePath) {
      const normalizedPath = filePath.replace(/\\/g, '/');
      const coreFileAbs = path.join(coreDir, normalizedPath);
      const clientFileAbs = path.join(projectDir, normalizedPath);

      if (!await fs.pathExists(coreFileAbs) || !await fs.pathExists(clientFileAbs)) {
        return res.status(404).json({ error: `El archivo ${normalizedPath} no existe en el Core o en el Cliente.` });
      }

      const coreContent = await fs.readFile(coreFileAbs, 'utf-8');
      const clientContent = await fs.readFile(clientFileAbs, 'utf-8');
      const diffResult = Diff.diffLines(clientContent, coreContent);

      return res.json({
        success: true,
        file: filePath,
        diff: diffResult.map(part => ({
          value: part.value,
          added: part.added,
          removed: part.removed
        }))
      });
    }

    const coreFiles = await getFilesRecursively(coreDir);
    const clientFiles = await getFilesRecursively(projectDir);

    const clientFileMap = new Map();
    clientFiles.forEach(f => clientFileMap.set(f.relativePath, f));

    const differences = [];
    let matchingCount = 0;

    for (const coreFile of coreFiles) {
      const clientFile = clientFileMap.get(coreFile.relativePath);
      if (!clientFile) {
        differences.push({
          file: coreFile.relativePath,
          status: 'missing_in_client',
          message: 'El archivo existe en el Core pero no en la instancia del Cliente.'
        });
      } else {
        const isBin = isBinaryFile(coreFile.relativePath);

        if (isBin) {
          try {
            const coreBuf = await fs.readFile(coreFile.absolutePath);
            const clientBuf = await fs.readFile(clientFile.absolutePath);
            if (!coreBuf.equals(clientBuf)) {
              differences.push({
                file: coreFile.relativePath,
                status: 'modified',
                isBinary: true,
                message: 'Archivo binario modificado.'
              });
            } else {
              matchingCount++;
            }
          } catch (err) {
            differences.push({
              file: coreFile.relativePath,
              status: 'modified',
              isBinary: true,
              message: `Error al leer archivo binario: ${err.message}`
            });
          }
        } else {
          const coreContent = await fs.readFile(coreFile.absolutePath, 'utf-8');
          const clientContent = await fs.readFile(clientFile.absolutePath, 'utf-8');
          if (coreFile.relativePath === 'index.html') {
            const normalizedCore = normalizeIndexHtmlForDiff(coreContent);
            const normalizedClient = normalizeIndexHtmlForDiff(clientContent);
            
            if (normalizedCore !== normalizedClient) {
              differences.push({
                file: coreFile.relativePath,
                status: 'modified',
                message: 'El archivo HTML difiere estructuralmente de la plantilla del Core (excluyendo SEO/branding y scripts de cliente).',
                diff: null
              });
            } else {
              matchingCount++;
            }
          } else if (coreFile.relativePath === 'vite.config.js') {
            const normalizedCore = normalizeViteConfigForDiff(coreContent);
            const normalizedClient = normalizeViteConfigForDiff(clientContent);

            if (normalizedCore !== normalizedClient) {
              differences.push({
                file: coreFile.relativePath,
                status: 'modified',
                message: 'El archivo de configuración de Vite difiere estructuralmente de la plantilla del Core (excluyendo puertos y nombres de PWA).',
                diff: null
              });
            } else {
              matchingCount++;
            }
          } else if (coreFile.relativePath === 'package.json') {
            if (hasPackageJsonDrift(coreContent, clientContent)) {
              differences.push({
                file: coreFile.relativePath,
                status: 'modified',
                message: 'El archivo package.json del cliente tiene dependencias o scripts desalineados con respecto al Core.',
                diff: []
              });
            } else {
              matchingCount++;
            }
          } else {
            if (coreContent !== clientContent) {
              differences.push({
                file: coreFile.relativePath,
                status: 'modified',
                message: 'El archivo local difiere de la plantilla del Core.',
                diff: null
              });
            } else {
              matchingCount++;
            }
          }
        }
      }
    }

    const totalFiles = coreFiles.length;
    const parityPercent = totalFiles > 0 ? Math.round((matchingCount / totalFiles) * 100) : 100;

    let dependenciesOutOfSync = false;
    let dependencyDetails = null;
    const corePkgPath = path.join(coreDir, 'package.json');
    const clientPkgPath = path.join(projectDir, 'package.json');
    if (await fs.pathExists(corePkgPath) && await fs.pathExists(clientPkgPath)) {
      try {
        const corePkg = await fs.readJson(corePkgPath);
        const clientPkg = await fs.readJson(clientPkgPath);
        const coreDeps = { ...(corePkg.dependencies || {}), ...(corePkg.devDependencies || {}) };
        const clientDeps = { ...(clientPkg.dependencies || {}), ...(clientPkg.devDependencies || {}) };
        
        const missingDeps = [];
        const mismatchDeps = [];
        const addedDeps = [];
        
        for (const dep in coreDeps) {
          if (!clientDeps[dep]) {
            missingDeps.push(dep);
          } else if (coreDeps[dep] !== clientDeps[dep]) {
            mismatchDeps.push({ name: dep, coreVersion: coreDeps[dep], clientVersion: clientDeps[dep] });
          }
        }

        for (const dep in clientDeps) {
          if (!coreDeps[dep]) {
            addedDeps.push(dep);
          }
        }
        
        if (missingDeps.length > 0 || mismatchDeps.length > 0 || addedDeps.length > 0) {
          dependenciesOutOfSync = true;
          dependencyDetails = { missingDeps, mismatchDeps, addedDeps };
        }
      } catch (e) {
        console.warn(`Error al comparar package.json para dependencias de ${clientId}:`, e.message);
      }
    }

    // Auditoría de compilación Vite bajo demanda
    let buildAuditStatus = 'skipped';
    let buildAuditOutput = '';
    const buildAuditRequested = req.query.buildAudit === 'true';

    if (buildAuditRequested) {
      try {
        const { stdout } = await execAsync('npm run build', { cwd: projectDir, timeout: 45000 });
        buildAuditStatus = 'success';
        buildAuditOutput = stdout ? stdout.trim().slice(-1000) : 'Build exitoso (sin salida).';
      } catch (buildErr) {
        buildAuditStatus = 'error';
        const rawOutput = (buildErr.stdout || '') + '\n' + (buildErr.stderr || '') + '\n' + buildErr.message;
        buildAuditOutput = rawOutput.trim().slice(-1000);
      }
    }

    const npmDriftCount = (dependencyDetails?.missingDeps?.length || 0) + 
                          (dependencyDetails?.mismatchDeps?.length || 0) + 
                          (dependencyDetails?.addedDeps?.length || 0);
    const fileDiffCount = differences.length;
    const consistencyScore = Math.max(0, 100 - (npmDriftCount * 5) - (fileDiffCount * 2));

    res.json({
      success: true,
      clientId,
      coreId,
      parityPercent,
      differences,
      dependenciesOutOfSync,
      dependencyDetails,
      buildAuditStatus,
      buildAuditOutput,
      consistencyScore
    });
  } catch (err) {
    console.error(`[API /project/drift] Error: ${err.message}`);
    res.status(500).json({ error: `Error al calcular desviación: ${err.message}` });
  }
});

/**
 * Helper para actualizar la entrada de prototipe.lock.json tras sincronizar un archivo.
 */
async function updateLockfileAfterSync(projectDir, file, srcPath, destPath, options = {}) {
  const lockPath = path.join(projectDir, 'prototipe.lock.json');
  try {
    const lockExists = await fs.pathExists(lockPath);
    let lock;
    if (lockExists) {
      lock = await fs.readJson(lockPath);
    } else {
      // Intentar leer la versión de la plantilla desde el package.json de la instancia
      let templateVersion = '1.0.0';
      try {
        const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
        templateVersion = pkg.version || '1.0.0';
      } catch (_) {}

      lock = {
        schemaVersion: 1,
        clientId: path.basename(projectDir).replace(/^App-/, ''),
        coreTemplate: 'template-core-seed',
        coreVersion: templateVersion,
        cliVersion: '1.0.0',
        niche: 'general',
        generatedAt: new Date().toISOString(),
        files: {}
      };
    }

    if (!lock.files) lock.files = {};

    const srcContent = await fs.readFile(srcPath);
    const destContent = await fs.readFile(destPath);
    const coreHash = crypto.createHash('sha256').update(srcContent).digest('hex');
    const appliedHash = crypto.createHash('sha256').update(destContent).digest('hex');

    lock.files[file] = {
      owner: options.owner || lock.files[file]?.owner || 'core',
      coreHash,
      appliedHash,
      lastSyncedAt: new Date().toISOString()
    };

    await fs.writeJson(lockPath, lock, { spaces: 2 });
    console.log(`[lock] prototipe.lock.json actualizado para archivo: ${file}`);
  } catch (err) {
    console.warn(`[lock] No se pudo actualizar prototipe.lock.json para ${file}: ${err.message}`);
  }
}

// Endpoint para sincronizar selectivamente un archivo desviado desde el Core al Cliente

app.post('/api/project/sync-file', async (req, res) => {
  const { clientId, file } = req.body;
  if (!clientId || !file) {
    return res.status(400).json({ error: 'Los parámetros "clientId" y "file" son obligatorios.' });
  }

  // 1. Validar si el archivo es una ruta protegida e inmutable de la instancia
  if (isPathExcludedFromSync(file)) {
    return res.status(403).json({ error: `El archivo ${file} contiene configuraciones o credenciales específicas de la instancia del cliente y está protegido contra sobrescritura.` });
  }

  if (projectSyncLocks[clientId]) {
    return res.status(429).json({ error: `Ya existe un proceso de sincronización activo para el cliente "${clientId}". Por favor, espera a que termine.` });
  }

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });

  projectSyncLocks[clientId] = true;
  try {
    const metaPath = path.join(projectDir, '.prototipe.json');
    const meta = await fs.pathExists(metaPath) ? await fs.readJson(metaPath) : {};
    let coreId = meta.templateId || meta.coreClave || meta.coreId || meta.template || meta.coreType;

    if (!coreId) {
      if (clientId.toLowerCase().includes('venta')) coreId = 'ventas';
      else if (clientId.toLowerCase().includes('servicio')) coreId = 'servicios';
      else if (clientId.toLowerCase().includes('agendamiento') || clientId.toLowerCase().includes('barber')) coreId = 'agendamiento';
      else if (clientId.toLowerCase().includes('gastronomia') || clientId.toLowerCase().includes('restaurante')) coreId = 'gastronomia';
    }

    if (!coreId) {
      return res.status(400).json({ error: 'No se pudo determinar el Core de referencia para este cliente en su .prototipe.json.' });
    }

    const coreDir = await findProjectDir(coreId);
    if (!coreDir) {
      return res.status(404).json({ error: `Core de referencia no encontrado: ${coreId}` });
    }

    const srcPath = path.resolve(coreDir, file);
    const destPath = path.resolve(projectDir, file);

    // Validar Directory Traversal
    if (!isPathContained(coreDir, srcPath)) {
      return res.status(403).json({ error: `Acceso denegado. El archivo de origen "${file}" está fuera del Core de referencia.` });
    }
    if (!isPathContained(projectDir, destPath)) {
      return res.status(403).json({ error: `Acceso denegado. El archivo de destino "${file}" está fuera del proyecto del cliente.` });
    }

    if (!await fs.pathExists(srcPath)) {
      return res.status(404).json({ error: `El archivo de origen no existe en el Core: ${file}` });
    }

    await fs.ensureDir(path.dirname(destPath));
    await createSafeSyncBackup(projectDir, file);

    // 2. Procesar fusiones inteligentes según el archivo
    if (file === 'index.html') {
      const coreContent = await fs.readFile(srcPath, 'utf-8');
      const clientContent = await fs.pathExists(destPath) ? await fs.readFile(destPath, 'utf-8') : '';
      const mergedHTML = preserveClientSeoOnIndex(coreContent, clientContent, meta);
      await fs.writeFile(destPath, mergedHTML, 'utf-8');
      await updateLockfileAfterSync(projectDir, file, srcPath, destPath);
      res.json({ success: true, message: `Archivo ${file} fusionado y sincronizado de forma inteligente, conservando branding y SEO.` });
    } else if (file === 'vite.config.js') {
      const coreContent = await fs.readFile(srcPath, 'utf-8');
      const clientContent = await fs.pathExists(destPath) ? await fs.readFile(destPath, 'utf-8') : '';
      const mergedVite = await mergeViteConfig(coreContent, clientContent, path.join(projectDir, 'public'));
      await fs.writeFile(destPath, mergedVite, 'utf-8');
      await updateLockfileAfterSync(projectDir, file, srcPath, destPath);
      res.json({ success: true, message: `Configuración de Vite sincronizada de forma inteligente, preservando puertos y migrando PWA manifest.` });
    } else if (file === 'package.json') {
      if (await fs.pathExists(destPath)) {
        const mergedPkg = await mergePackageJson(srcPath, destPath);
        await fs.writeJson(destPath, mergedPkg, { spaces: 2 });
        await updateLockfileAfterSync(projectDir, file, srcPath, destPath);
        res.json({ success: true, message: `Dependencias y scripts de package.json fusionados de forma lógica sin alterar la identidad del cliente.` });
      } else {
        await fs.copy(srcPath, destPath);
        await updateLockfileAfterSync(projectDir, file, srcPath, destPath);
        res.json({ success: true, message: `Archivo package.json copiado de forma limpia.` });
      }
    } else {
      await fs.copy(srcPath, destPath);
      await updateLockfileAfterSync(projectDir, file, srcPath, destPath);
      res.json({ success: true, message: `Archivo ${file} sincronizado exitosamente con el Core.` });
    }
  } catch (err) {
    res.status(500).json({ error: `Error al sincronizar archivo: ${err.message}` });
  } finally {
    delete projectSyncLocks[clientId];
  }
});


// Endpoint para sincronizar múltiples archivos desviados desde el Core al Cliente en lote
app.post('/api/project/sync-files', async (req, res) => {
  const { clientId, files } = req.body;
  if (!clientId || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'Los parámetros "clientId" y un array de "files" son obligatorios.' });
  }

  if (projectSyncLocks[clientId]) {
    return res.status(429).json({ error: `Ya existe un proceso de sincronización activo para el cliente "${clientId}". Por favor, espera a que termine.` });
  }

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });

  projectSyncLocks[clientId] = true;
  try {
    const metaPath = path.join(projectDir, '.prototipe.json');
    const meta = await fs.pathExists(metaPath) ? await fs.readJson(metaPath) : {};
    let coreId = meta.templateId || meta.coreClave || meta.coreId || meta.template || meta.coreType;

    if (!coreId) {
      if (clientId.toLowerCase().includes('venta')) coreId = 'ventas';
      else if (clientId.toLowerCase().includes('servicio')) coreId = 'servicios';
      else if (clientId.toLowerCase().includes('agendamiento') || clientId.toLowerCase().includes('barber')) coreId = 'agendamiento';
      else if (clientId.toLowerCase().includes('gastronomia') || clientId.toLowerCase().includes('restaurante')) coreId = 'gastronomia';
    }

    if (!coreId) {
      return res.status(400).json({ error: 'No se pudo determinar el Core de referencia para este cliente en su .prototipe.json.' });
    }

    const coreDir = await findProjectDir(coreId);
    if (!coreDir) {
      return res.status(404).json({ error: `Core de referencia no encontrado: ${coreId}` });
    }

    const results = [];
    for (const file of files) {
      // 1. Validar exclusiones
      if (isPathExcludedFromSync(file)) {
        results.push({ file, success: false, error: 'Protegido de sincronización (Contiene credenciales/branding de instancia)' });
        continue;
      }

      const srcPath = path.resolve(coreDir, file);
      const destPath = path.resolve(projectDir, file);

      // Validar Directory Traversal
      if (!isPathContained(coreDir, srcPath) || !isPathContained(projectDir, destPath)) {
        results.push({ file, success: false, error: 'Acceso denegado (Directory Traversal detectado)' });
        continue;
      }

      if (await fs.pathExists(srcPath)) {
        await fs.ensureDir(path.dirname(destPath));
        
        try {
          // 2. Procesar fusiones inteligentes
          if (file === 'index.html') {
            const coreContent = await fs.readFile(srcPath, 'utf-8');
            const clientContent = await fs.pathExists(destPath) ? await fs.readFile(destPath, 'utf-8') : '';
            const mergedHTML = preserveClientSeoOnIndex(coreContent, clientContent, meta);
            await fs.writeFile(destPath, mergedHTML, 'utf-8');
            await updateLockfileAfterSync(projectDir, file, srcPath, destPath);
            results.push({ file, success: true, note: 'Fusionado con SEO de cliente' });
          } else if (file === 'package.json') {
            if (await fs.pathExists(destPath)) {
              const mergedPkg = await mergePackageJson(srcPath, destPath);
              await fs.writeJson(destPath, mergedPkg, { spaces: 2 });
              await updateLockfileAfterSync(projectDir, file, srcPath, destPath);
              results.push({ file, success: true, note: 'Fusionado lógicamente con package de cliente' });
            } else {
              await fs.copy(srcPath, destPath);
              await updateLockfileAfterSync(projectDir, file, srcPath, destPath);
              results.push({ file, success: true });
            }
          } else {
            await fs.copy(srcPath, destPath);
            await updateLockfileAfterSync(projectDir, file, srcPath, destPath);
            results.push({ file, success: true });
          }
        } catch (copyErr) {
          results.push({ file, success: false, error: `Error al copiar/fusionar: ${copyErr.message}` });
        }
      } else {
        results.push({ file, success: false, error: 'No existe en Core' });
      }
    }

    res.json({ success: true, message: `${files.length} archivos procesados.`, results });
  } catch (err) {
    res.status(500).json({ error: `Error al sincronizar lote de archivos: ${err.message}` });
  } finally {
    delete projectSyncLocks[clientId];
  }
});


// --- GESTIÓN DE SERVIDORES DE DESARROLLO LOCAL POR CLIENTE ---
const devServers = new Map(); // clientId -> { child, url, status, logs }
const devServerLogListeners = new Map(); // clientId -> Set of Response objects

// Registrar hooks globales de salida para evitar procesos Vite zombis
function cleanupDevServers() {
  if (notificationProcess) {
    try {
      notificationProcess.kill('SIGTERM');
    } catch (_) {}
  }
  for (const [clientId, serverInfo] of devServers.entries()) {
    if (serverInfo && serverInfo.child) {
      try {
        serverInfo.child.kill('SIGTERM');
      } catch (_) {}
    }
  }
}
process.on('SIGINT', () => {
  cleanupDevServers();
  process.exit(0);
});
process.on('exit', () => {
  cleanupDevServers();
});

// ─── ENDPOINTS PARA MICROSERVICIO DE NOTIFICACIONES OMNICANAL ───
app.post('/api/project/notify/config', (req, res) => {
  if (notificationProcess && notificationProcess.connected) {
    notificationProcess.send({ type: 'config', data: req.body });
    return res.json({ success: true, message: 'Configuración sincronizada con el microservicio.' });
  }
  res.status(503).json({ error: 'El microservicio de notificaciones no está activo.' });
});

app.post('/api/project/notify/test', async (req, res) => {
  try {
    const { telegramToken, telegramChatId, discordWebhookUrl } = req.body;
    const promises = [];

    if (telegramToken && telegramChatId) {
      promises.push(
        fetch('http://localhost:5050/api/notify/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: '🔔 <b>Prueba de Conexión:</b> Notificaciones de Telegram de PROTOTIPE funcionando.',
            chatId: telegramChatId,
            token: telegramToken
          })
        }).then(async r => {
          if (!r.ok) {
            const txt = await r.text();
            throw new Error(`Telegram: ${txt}`);
          }
        })
      );
    }

    if (discordWebhookUrl) {
      promises.push(
        fetch('http://localhost:5050/api/notify/discord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: '🔔 **Prueba de Conexión:** Notificaciones de Discord de PROTOTIPE funcionando.',
            webhookUrl: discordWebhookUrl
          })
        }).then(async r => {
          if (!r.ok) {
            const txt = await r.text();
            throw new Error(`Discord: ${txt}`);
          }
        })
      );
    }

    if (promises.length === 0) {
      return res.status(400).json({ error: 'Debes proporcionar credenciales de Telegram o Discord.' });
    }

    await Promise.all(promises);
    res.json({ success: true, message: 'Alerta de prueba enviada.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/project/notify/error', async (req, res) => {
  try {
    const response = await fetch('http://localhost:5050/api/notify/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Fallo en microservicio: ${errText}`);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/project/dev/status', async (req, res) => {
  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });
  
  const serverInfo = devServers.get(clientId);
  if (serverInfo) {
    return res.json({ success: true, running: true, url: serverInfo.url });
  }
  res.json({ success: true, running: false });
});

// Endpoint SSE para streaming de logs de desarrollo en vivo
app.get('/api/project/dev/logs-stream', (req, res) => {
  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Enviar logs históricos si existen
  const serverInfo = devServers.get(clientId);
  if (serverInfo && Array.isArray(serverInfo.logs)) {
    serverInfo.logs.forEach(line => {
      res.write(`data: ${JSON.stringify({ type: 'log', log: line })}\n\n`);
    });
  }

  if (!devServerLogListeners.has(clientId)) {
    devServerLogListeners.set(clientId, new Set());
  }
  devServerLogListeners.get(clientId).add(res);

  const keepAliveInterval = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch (_) {
      clearInterval(keepAliveInterval);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
    const listeners = devServerLogListeners.get(clientId);
    if (listeners) {
      listeners.delete(res);
      if (listeners.size === 0) {
        devServerLogListeners.delete(clientId);
      }
    }
  });
});

app.post('/api/project/dev/start', async (req, res) => {
  const { clientId } = req.body;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  const existing = devServers.get(clientId);
  if (existing) {
    return res.json({ success: true, url: existing.url, message: 'El servidor de desarrollo ya está corriendo.' });
  }

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) {
    return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });
  }

  try {
    // Determinar el puerto único de forma dinámica y determinista para evitar colisiones (rango 3100-3199 para no colisionar con Vite 5173/5174)
    const forcedPort = 3100 + (clientId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 100);

    // Intentar leer el puerto configurado en el archivo vite.config.js del proyecto (físico local)
    let customPort = null;
    try {
      const viteConfigPath = path.join(projectDir, 'vite.config.js');
      if (await fs.pathExists(viteConfigPath)) {
        const content = await fs.readFile(viteConfigPath, 'utf8');
        const match = content.match(/port\s*:\s*(\d+)/);
        if (match) {
          customPort = parseInt(match[1], 10);
        }
      }
    } catch (err) {
      console.warn(`[API /project/dev/start] No se pudo leer el puerto de vite.config.js para ${clientId}:`, err.message);
    }
    const portToUse = customPort || forcedPort;

    const child = spawn('npm', ['run', 'dev', '--', '--port', portToUse.toString()], {
      cwd: projectDir,
      shell: true,
      env: { ...process.env, FORCE_COLOR: '0' }
    });

    const logsBuffer = [];
    const pushLog = (data) => {
      const text = data.toString();
      const lines = text.split(/\r?\n/);
      const serverInfo = devServers.get(clientId);
      const targetArray = serverInfo ? serverInfo.logs : logsBuffer;
      lines.forEach(line => {
        targetArray.push(line);
        if (targetArray.length > 100) {
          targetArray.shift();
        }
        const listeners = devServerLogListeners.get(clientId);
        if (listeners) {
          listeners.forEach(res => {
            res.write(`data: ${JSON.stringify({ type: 'log', log: line })}\n\n`);
          });
        }
      });
    };

    let urlResolved = false;
    let url = '';

    const urlPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!urlResolved) {
          urlResolved = true;
          resolve(`http://localhost:${portToUse}`);
        }
      }, 10000);

      child.stdout.on('data', (data) => {
        pushLog(data);
        const text = data.toString();
        // Limpiar códigos de escape ANSI antes de buscar la URL (ej: [1m3174[22m -> 3174)
        const cleanText = text.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '');
        const match = cleanText.match(/(https?:\/\/(localhost|127\.0\.0\.1):\d+)/i);
        if (match && !urlResolved) {
          url = match[1];
          urlResolved = true;
          clearTimeout(timeout);
          resolve(url);
        }
      });

      child.stderr.on('data', (data) => {
        pushLog(data);
        console.warn(`[Dev Server ${clientId} stderr]: ${data.toString()}`);
      });

      child.on('close', (code) => {
        if (!urlResolved) {
          urlResolved = true;
          clearTimeout(timeout);
          reject(new Error(`El servidor de desarrollo se cerró inesperadamente con código ${code}`));
        } else {
          // Notificar desconexión a oyentes y borrar del mapa
          const listeners = devServerLogListeners.get(clientId);
          if (listeners) {
            listeners.forEach(res => {
              res.write(`data: ${JSON.stringify({ type: 'status', status: 'stopped', code })}\n\n`);
            });
          }
          devServers.delete(clientId);
        }
      });
    });

    url = await urlPromise;
    devServers.set(clientId, { child, url, status: 'running', logs: logsBuffer });
    res.json({ success: true, url });

  } catch (err) {
    console.error(`[Dev Server Start Error]: ${err.message}`);
    res.status(500).json({ error: `Fallo al iniciar servidor local: ${err.message}` });
  }
});

app.post('/api/project/dev/stop', async (req, res) => {
  const { clientId } = req.body;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  const serverInfo = devServers.get(clientId);
  if (!serverInfo) {
    return res.json({ success: true, message: 'El servidor de desarrollo no está activo.' });
  }

  try {
    if (serverInfo.child && serverInfo.child.pid) {
      await killProcessTree(serverInfo.child.pid);
    }
    devServers.delete(clientId);
    res.json({ success: true, message: 'Servidor de desarrollo detenido con éxito.' });
  } catch (err) {
    res.status(500).json({ error: `Error al detener servidor: ${err.message}` });
  }
});

// --- DRIFT GLOBAL (MAPA DE CALOR Y MATRIZ DE PARIDAD) ---
app.get('/api/project/drift/global', async (req, res) => {
  if (!await fs.pathExists(GIT_INSTANCES_DIR)) {
    return res.json({ success: true, driftMatrix: [] });
  }

  try {
    const candidates = [];
    const topDirs = await fs.readdir(GIT_INSTANCES_DIR);
    for (const dir of topDirs) {
      const fullPath = path.join(GIT_INSTANCES_DIR, dir);
      const stat = await fs.stat(fullPath).catch(() => null);
      if (!stat || !stat.isDirectory()) continue;

      if (await fs.pathExists(path.join(fullPath, '.prototipe.json'))) {
        candidates.push({ folderName: dir, fullPath });
      } else {
        const subDirs = await fs.readdir(fullPath).catch(() => []);
        for (const subDir of subDirs) {
          const subFullPath = path.join(fullPath, subDir);
          const subStat = await fs.stat(subFullPath).catch(() => null);
          if (!subStat || !subStat.isDirectory()) continue;
          if (await fs.pathExists(path.join(subFullPath, '.prototipe.json'))) {
            candidates.push({ folderName: subDir, fullPath: subFullPath });
          }
        }
      }
    }

    const results = [];

    await Promise.all(candidates.map(async (candidate) => {
      const { folderName, fullPath } = candidate;
      const clientId = folderName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const metaPath = path.join(fullPath, '.prototipe.json');
      let meta = await fs.pathExists(metaPath) ? await fs.readJson(metaPath) : {};
      meta = validatePrototipeMetadata(meta, folderName);
      let coreId = meta.templateId || meta.coreClave || meta.coreId || meta.template;

      if (!coreId) {
        if (clientId.toLowerCase().includes('venta')) coreId = 'ventas';
        else if (clientId.toLowerCase().includes('servicio')) coreId = 'servicios';
        else if (clientId.toLowerCase().includes('agendamiento') || clientId.toLowerCase().includes('barber')) coreId = 'agendamiento';
        else if (clientId.toLowerCase().includes('gastronomia') || clientId.toLowerCase().includes('restaurante')) coreId = 'gastronomia';
      }

      if (!coreId) return;

      const coreDir = await findProjectDir(coreId);
      if (!coreDir) return;

      try {
        const coreFiles = await getFilesRecursively(coreDir);
        const clientFiles = await getFilesRecursively(fullPath);

        const clientFileMap = new Map();
        clientFiles.forEach(f => clientFileMap.set(f.relativePath, f));

        let matchingCount = 0;
        const modifiedFiles = [];
        const missingFiles = [];

        for (const coreFile of coreFiles) {
          if (coreFile.relativePath === 'package.json') {
            matchingCount++;
            continue;
          }
          const clientFile = clientFileMap.get(coreFile.relativePath);
          if (!clientFile) {
            missingFiles.push(coreFile.relativePath);
          } else {
            if (coreFile.size !== clientFile.size) {
              modifiedFiles.push(coreFile.relativePath);
            } else {
              const coreContent = await fs.readFile(coreFile.absolutePath, 'utf-8');
              const clientContent = await fs.readFile(clientFile.absolutePath, 'utf-8');
              if (coreContent !== clientContent) {
                modifiedFiles.push(coreFile.relativePath);
              } else {
                matchingCount++;
              }
            }
          }
        }

        const totalFiles = coreFiles.length;
        const parityPercent = totalFiles > 0 ? Math.round((matchingCount / totalFiles) * 100) : 100;

        let dependenciesOutOfSync = false;
        const corePkgPath = path.join(coreDir, 'package.json');
        const clientPkgPath = path.join(fullPath, 'package.json');
        if (await fs.pathExists(corePkgPath) && await fs.pathExists(clientPkgPath)) {
          try {
            const corePkg = await fs.readJson(corePkgPath);
            const clientPkg = await fs.readJson(clientPkgPath);
            const coreDeps = { ...(corePkg.dependencies || {}), ...(corePkg.devDependencies || {}) };
            const clientDeps = { ...(clientPkg.dependencies || {}), ...(clientPkg.devDependencies || {}) };
            for (const dep in coreDeps) {
              if (!clientDeps[dep] || coreDeps[dep] !== clientDeps[dep]) {
                dependenciesOutOfSync = true;
                break;
              }
            }
          } catch (_) {}
        }

        results.push({
          clientId,
          projectName: folderName,
          coreId,
          parityPercent,
          modifiedCount: modifiedFiles.length,
          missingCount: missingFiles.length,
          modifiedFiles,
          missingFiles,
          dependenciesOutOfSync
        });
      } catch (err) {
        console.warn(`Error al calcular drift global para ${clientId}:`, err.message);
      }
    }));

    res.json({ success: true, driftMatrix: results });
  } catch (err) {
    res.status(500).json({ error: `Error al generar matriz global de paridad: ${err.message}` });
  }
});

// --- CENTRO DE OPERACIONES GIT (DESHACER Y DIFF) ---
app.post('/api/git/discard', async (req, res) => {
  const { clientId, path: targetPath, file, all } = req.body;
  
  let projectDir = '';
  if (targetPath) {
    if (!isPathContained(GIT_ROOT, targetPath)) {
      return res.status(403).json({ error: 'Ruta fuera del ecosistema PROTOTIPE. Acceso denegado.' });
    }
    projectDir = path.resolve(targetPath);
  } else if (clientId) {
    projectDir = await findProjectDir(clientId);
  }

  if (!projectDir || !await fs.pathExists(projectDir)) {
    return res.status(404).json({ error: 'No se encontró el directorio del repositorio.' });
  }

  try {
    if (all) {
      await execGitCommand(['reset', '--hard', 'HEAD'], projectDir);
      await execGitCommand(['clean', '-fd'], projectDir);
      return res.json({ success: true, message: 'Todos los cambios locales fueron descartados con éxito.' });
    }

    if (!file) return res.status(400).json({ error: 'Debes especificar el archivo a descartar ("file") o "all".' });

    let safeFile;
    try {
      safeFile = assertSafeRelativePath(file);
    } catch (pathErr) {
      return res.status(400).json({ error: pathErr.message });
    }

    await execGitCommand(['checkout', 'HEAD', '--', safeFile], projectDir);
    res.json({ success: true, message: `Cambios en el archivo ${file} descartados con éxito.` });
  } catch (err) {
    console.error(`[API /api/git/discard] Error:`, err.message);
    res.status(500).json({ error: `Fallo al descartar cambios: ${err.message}` });
  }
});

app.get('/api/git/diff-file', async (req, res) => {
  const { clientId, path: targetPath, file } = req.query;
  if (!file) {
    return res.status(400).json({ error: 'El parámetro "file" es obligatorio.' });
  }

  let projectDir = '';
  if (targetPath) {
    if (!isPathContained(GIT_ROOT, targetPath)) {
      return res.status(403).json({ error: 'Ruta fuera del ecosistema PROTOTIPE. Acceso denegado.' });
    }
    projectDir = path.resolve(targetPath);
  } else if (clientId) {
    projectDir = await findProjectDir(clientId);
  }

  if (!projectDir || !await fs.pathExists(projectDir)) {
    return res.status(404).json({ error: 'No se encontró el directorio del repositorio.' });
  }

  try {
    let safeFile;
    try {
      safeFile = assertSafeRelativePath(file);
    } catch (pathErr) {
      return res.status(400).json({ error: pathErr.message });
    }

    const { stdout } = await execGitCommand(['diff', 'HEAD', '--', safeFile], projectDir);
    res.json({ success: true, diff: stdout || 'No hay cambios en este archivo respecto a HEAD.' });
  } catch (err) {
    console.error(`[API /api/git/diff-file] Error:`, err.message);
    res.status(500).json({ error: `Error al obtener diff: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/git/compare-drift
// Herramienta 1: Visualizador de Desviación Core-Cliente (Drift Map)
// Compara commits locales de un cliente contra la rama base del Core.
// Query: path (ruta del repositorio Core), clientBranch (ej: "cliente/tienda1"), baseBranch (ej: "main")
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/git/compare-drift', async (req, res) => {
  const { path: targetPath, clientBranch, baseBranch } = req.query;

  if (!targetPath || !clientBranch || !baseBranch) {
    return res.status(400).json({ error: 'Los parámetros "path", "clientBranch" y "baseBranch" son obligatorios.' });
  }
  if (!isPathContained(GIT_ROOT, targetPath)) {
    return res.status(403).json({ error: 'Ruta fuera del ecosistema PROTOTIPE. Acceso denegado.' });
  }
  const resolvedPath = path.resolve(targetPath);
  if (!await fs.pathExists(resolvedPath)) {
    return res.status(404).json({ error: 'La ruta especificada no existe.' });
  }

  try {
    // ── Validación previa: resolver referencias localmente o como remoto ──
    const resolveBranchRef = async (branch, repoPath) => {
      try {
        await execGitCommand(['rev-parse', '--verify', branch], repoPath);
        return branch;
      } catch {
        try {
          await execGitCommand(['rev-parse', '--verify', `origin/${branch}`], repoPath);
          return `origin/${branch}`;
        } catch {
          return null;
        }
      }
    };

    const baseRef = await resolveBranchRef(baseBranch, resolvedPath);
    const clientRef = await resolveBranchRef(clientBranch, resolvedPath);

    if (!baseRef) {
      const { stdout: branchListRaw } = await execGitCommand(['branch', '-a'], resolvedPath);
      const allBranches = branchListRaw.split(/\r?\n/)
        .map(b => b.trim().replace(/^\*\s*/, '').replace(/^remotes\/origin\//, '').trim())
        .filter(b => b && !b.includes(' -> '));
      return res.status(422).json({
        error: `La rama base "${baseBranch}" no se puede resolver en este repositorio. Ramas disponibles: ${[...new Set(allBranches)].filter(b => !b.startsWith('HEAD')).slice(0, 8).join(', ')}`
      });
    }

    if (!clientRef) {
      return res.status(422).json({
        error: `La rama de cliente "${clientBranch}" no se puede resolver en este repositorio.`
      });
    }

    // Commits que el cliente tiene que el Core no tiene (commits propios/locales del cliente)
    const { stdout: aheadRaw } = await execGitCommand(
      ['log', `${baseRef}..${clientRef}`, '--pretty=format:%h:::%s:::%ar:::%an', '--no-merges'],
      resolvedPath
    );
    // Commits que el Core tiene que el cliente no ha recibido aún (commits de Core pendientes)
    const { stdout: behindRaw } = await execGitCommand(
      ['log', `${clientRef}..${baseRef}`, '--pretty=format:%h:::%s:::%ar:::%an', '--no-merges'],
      resolvedPath
    );

    const parseCommits = (raw) =>
      raw.split('\n').filter(l => l.trim()).map(line => {
        const p = line.replace(/^"/, '').replace(/"$/, '').split(':::');
        return { hash: p[0], message: p[1], date: p[2], author: p[3] };
      });

    const aheadCommits = parseCommits(aheadRaw);
    const behindCommits = parseCommits(behindRaw);

    // Detectar archivos modificados en el cliente que también han cambiado en el Core (riesgo de colisión)
    let collisionFiles = [];
    try {
      const { stdout: clientFiles } = await execGitCommand(
        ['diff', '--name-only', baseRef, clientRef],
        resolvedPath
      );
      const { stdout: coreFiles } = await execGitCommand(
        ['diff', '--name-only', clientRef, baseRef],
        resolvedPath
      );
      const clientSet = new Set(clientFiles.split('\n').filter(Boolean));
      const coreSet = new Set(coreFiles.split('\n').filter(Boolean));
      collisionFiles = [...clientSet].filter(f => coreSet.has(f) && !isPathExcludedFromSync(f));
    } catch (_) { /* no colisiones detectables sin historial */ }

    // Calcular riesgo: Bajo < 3 colisiones, Medio < 8, Crítico >= 8
    const riskLevel = collisionFiles.length === 0 ? 'none'
      : collisionFiles.length < 3 ? 'low'
      : collisionFiles.length < 8 ? 'medium'
      : 'critical';

    res.json({
      success: true,
      clientBranch,
      baseBranch,
      aheadCount: aheadCommits.length,
      behindCount: behindCommits.length,
      aheadCommits,
      behindCommits,
      collisionFiles,
      riskLevel
    });
  } catch (err) {
    console.error('[API /api/git/compare-drift] Error:', err.message);
    res.status(500).json({ error: `Error al comparar ramas: ${err.message}` });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/git/unpushed-commits
// Herramienta 2 (parte de datos): Retorna los commits locales aún no empujados
// con un indicador de si cumplen el formato Conventional Commits.
// Query: path (ruta del repositorio)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/git/unpushed-commits', async (req, res) => {
  const { path: targetPath } = req.query;

  if (!targetPath) return res.status(400).json({ error: 'El parámetro "path" es obligatorio.' });
  if (!isPathContained(GIT_ROOT, targetPath)) {
    return res.status(403).json({ error: 'Ruta fuera del ecosistema PROTOTIPE. Acceso denegado.' });
  }
  const resolvedPath = path.resolve(targetPath);
  if (!await fs.pathExists(resolvedPath)) return res.status(404).json({ error: 'Ruta no existe.' });

  try {
    // Detectar remote tracking branch
    let remoteBranch = null;
    try {
      const { stdout: rbOut } = await execGitCommand(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], resolvedPath);
      remoteBranch = rbOut.trim();
    } catch (_) { /* rama sin upstream */ }

    let unpushedRaw = '';
    if (remoteBranch) {
      const { stdout } = await execGitCommand(
        ['log', `${remoteBranch}..HEAD`, '--pretty=format:%H:::%h:::%s:::%ar:::%an'],
        resolvedPath
      );
      unpushedRaw = stdout;
    } else {
      // Sin upstream: mostrar últimos 5 commits como "locales"
      const { stdout } = await execGitCommand(
        ['log', '-n', '5', '--pretty=format:%H:::%h:::%s:::%ar:::%an'],
        resolvedPath
      );
      unpushedRaw = stdout;
    }

    // Patrón básico de Conventional Commits: tipo(scope)?: descripción o [rama] fecha — descripción
    const conventionalPattern = /^(feat|fix|docs|style|refactor|test|chore|ci|perf|build|revert|Mod|Add|Del)[\s\(:]/i;
    const taskIdPattern = /(?:\[[A-Z0-9_-]+\]|(?:CORE|CLI|DASH|TPL|PLT|INST|DOC|LND|BIZ|HOTFIX|CLIENTE|E2E|LINE)-[A-Z0-9_-]+)/i;

    const commits = unpushedRaw.split('\n').filter(l => l.trim()).map(line => {
      const p = line.replace(/^"/, '').replace(/"$/, '').split(':::');
      const fullHash = p[0];
      const shortHash = p[1];
      const message = p[2];
      const date = p[3];
      const author = p[4];

      const isConventional = conventionalPattern.test(message);
      const hasTaskId = taskIdPattern.test(message);

      return {
        fullHash,
        hash: shortHash,
        message,
        date,
        author,
        isConventional,
        hasTaskId,
        isValid: isConventional || hasTaskId,
        hasUpstream: !!remoteBranch
      };
    });

    res.json({ success: true, commits, hasUpstream: !!remoteBranch });
  } catch (err) {
    if (err.message.includes('does not have any commits') || err.message.includes('fatal:')) {
      return res.json({ success: true, commits: [], hasUpstream: false });
    }
    console.error('[API /api/git/unpushed-commits] Error:', err.message);
    res.status(500).json({ error: `Error al obtener commits no pusheados: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/git/amend-commit
// Herramienta 2 (acción): Enmienda el mensaje del último commit local SOLO si
// no ha sido empujado al remoto. Seguridad anti-reescritura de historial público.
// Body: { path, newMessage }
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/git/amend-commit', async (req, res) => {
  const { path: targetPath, newMessage, commitHash } = req.body;

  if (!targetPath || !newMessage?.trim()) {
    return res.status(400).json({ error: 'Los parámetros "path" y "newMessage" son obligatorios.' });
  }
  if (!isPathContained(GIT_ROOT, targetPath)) {
    return res.status(403).json({ error: 'Ruta fuera del ecosistema PROTOTIPE. Acceso denegado.' });
  }
  const resolvedPath = path.resolve(targetPath);
  if (!await fs.pathExists(resolvedPath)) return res.status(404).json({ error: 'Ruta no existe.' });

  try {
    // Obtener hash del HEAD actual
    const { stdout: headHashRaw } = await execGitCommand(['rev-parse', 'HEAD'], resolvedPath);
    const headHash = headHashRaw.trim();

    // Determinar el hash a enmendar (si no se pasa, o es el head, enmendamos el HEAD)
    const targetHash = commitHash ? commitHash.trim() : headHash;
    const isHead = (targetHash === headHash || targetHash.substring(0, 7) === headHash.substring(0, 7));

    // BLINDAJE CRÍTICO: Verificar que el commit HEAD no esté en ninguna rama remota
    let isAlreadyPushed = false;
    try {
      const { stdout: remoteContains } = await execGitCommand(
        ['branch', '-r', '--contains', targetHash],
        resolvedPath
      );
      isAlreadyPushed = remoteContains.trim().length > 0;
    } catch (_) { /* sin remoto, es seguro */ }

    if (isAlreadyPushed) {
      return res.status(409).json({
        error: 'El commit seleccionado ya fue empujado al repositorio remoto. Enmendar reescribiría el historial público. Operación cancelada por seguridad.',
        alreadyPushed: true
      });
    }

    let resultHash = '';
    if (isHead) {
      // Caso 1: Enmendar el HEAD (simple y tradicional)
      await execGitCommand(['commit', '--amend', '-m', newMessage.trim(), '--no-verify'], resolvedPath);
      const { stdout: newHashRaw } = await execGitCommand(['rev-parse', '--short', 'HEAD'], resolvedPath);
      resultHash = newHashRaw.trim();
    } else {
      // Caso 2: Enmendar un commit intermedio usando git commit-tree y git rebase --onto
      // Verificar que el working tree está limpio (necesario para rebase)
      const { stdout: statusRaw } = await execGitCommand(['status', '--porcelain'], resolvedPath);
      if (statusRaw.trim().length > 0) {
        return res.status(422).json({
          error: 'El repositorio tiene cambios locales sin guardar. Por favor, realiza un commit o descarta los cambios antes de enmendar commits del historial.'
        });
      }

      // Obtener el tree hash del commit destino
      const { stdout: treeHashRaw } = await execGitCommand(['log', '-1', '--format=%T', targetHash], resolvedPath);
      const treeHash = treeHashRaw.trim();

      // Obtener el parent hash
      const { stdout: parentHashRaw } = await execGitCommand(['log', '-1', '--format=%P', targetHash], resolvedPath);
      const parentHash = parentHashRaw.trim();

      // Crear el nuevo objeto commit
      let newCommitHash = '';
      if (parentHash) {
        const { stdout: commitTreeRaw } = await execGitCommand(
          ['commit-tree', treeHash, '-p', parentHash, '-m', newMessage.trim()],
          resolvedPath
        );
        newCommitHash = commitTreeRaw.trim();
      } else {
        const { stdout: commitTreeRaw } = await execGitCommand(
          ['commit-tree', treeHash, '-m', newMessage.trim()],
          resolvedPath
        );
        newCommitHash = commitTreeRaw.trim();
      }

      // Rebasar la rama sobre el nuevo commit (garantizado libre de conflictos)
      await execGitCommand(['rebase', '--onto', newCommitHash, targetHash, 'HEAD'], resolvedPath);

      // Obtener el nuevo short hash
      resultHash = newCommitHash.substring(0, 7);
    }

    res.json({
      success: true,
      message: 'Commit enmendado con éxito.',
      newHash: resultHash,
      previousHash: targetHash.substring(0, 7)
    });
  } catch (err) {
    console.error('[API /api/git/amend-commit] Error:', err.message);
    res.status(500).json({ error: `Error al enmendar commit: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/git/link-tasks
// Permite vincular tareas completadas que carecen de commits mediante un commit vacío.
// Body: { path, taskIds }
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/git/link-tasks', async (req, res) => {
  const { path: targetPath, taskIds } = req.body;

  if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
    return res.status(400).json({ error: 'El parámetro "taskIds" debe ser un array no vacío.' });
  }

  const repoPath = targetPath ? path.resolve(targetPath) : GIT_ROOT;
  if (!isPathContained(GIT_ROOT, repoPath)) {
    return res.status(403).json({ error: 'Ruta fuera del ecosistema PROTOTIPE. Acceso denegado.' });
  }
  if (!await fs.pathExists(repoPath)) return res.status(404).json({ error: 'Ruta no existe.' });

  try {
    const message = `chore(git): link tasks ${taskIds.join(', ')} to Git history to satisfy traceability`;
    await execGitCommand(['commit', '--allow-empty', '-m', message], repoPath);
    res.json({ success: true, message: `Commit vacío creado con éxito vinculando: ${taskIds.join(', ')}` });
  } catch (err) {
    console.error('[API /api/git/link-tasks] Error:', err.message);
    res.status(500).json({ error: `Fallo al crear commit de vinculación: ${err.message}` });
  }
});

// --- GESTOR DE DEPENDENCIAS (NPM INSTALL SSE) ---
app.get('/api/project/dependencies/install', async (req, res) => {
  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'log', log: 'Iniciando instalación de dependencias (npm install)...' })}\n\n`);

  const child = spawn('npm', ['install', '--legacy-peer-deps'], {
    cwd: projectDir,
    shell: true,
    env: { ...process.env, FORCE_COLOR: '0' }
  });

  const sendProgress = (data) => {
    const lines = data.toString().split(/\r?\n/);
    lines.forEach(line => {
      if (line.trim()) {
        res.write(`data: ${JSON.stringify({ type: 'log', log: line })}\n\n`);
      }
    });
  };

  child.stdout.on('data', sendProgress);
  child.stderr.on('data', sendProgress);

  child.on('close', (code) => {
    if (code === 0) {
      res.write(`data: ${JSON.stringify({ type: 'status', status: 'success', message: 'Dependencias instaladas con éxito.' })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'status', status: 'error', message: `La instalación falló con código ${code}.` })}\n\n`);
    }
    res.end();
  });

  req.on('close', () => {
    if (!child.killed && child.pid) {
      killProcessTree(child.pid);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/git/targets
// Auto-detecta todos los repositorios Git del ecosistema PROTOTIPE.
// Retorna: maestro, consola central, plantillas core e instancias de clientes.
// ─────────────────────────────────────────────────────────────────────────────
// GIT_ROOT ya fue definido dinámicamente al inicio del archivo (línea ~130)
// Estas constantes lo referencian para auto-detectar repositorios del ecosistema.
const GIT_CORES_DIR    = path.join(GIT_ROOT, 'Plantillas Core');
const GIT_INSTANCES_DIR= path.join(GIT_ROOT, 'Instancias Clientes');
const GIT_DASHBOARD_DIR= path.join(GIT_ROOT, 'Central PROTOTIPE', 'dev-dashboard');

async function getGitDirName(dir) {
  if (await fs.pathExists(path.join(dir, '.git'))) return '.git';
  if (await fs.pathExists(path.join(dir, '.git-backup-temp'))) return '.git-backup-temp';
  return null;
}

async function hasGitFolder(dir) {
  return (await getGitDirName(dir)) !== null;
}

async function execGitCommand(args, dir) {
  let argsArray = [];
  if (Array.isArray(args)) {
    argsArray = args;
  } else if (typeof args === 'string') {
    // Para compatibilidad hacia atrás con comandos estáticos simples,
    // se permite pasar un string si no contiene caracteres peligrosos y se divide por espacios.
    if (/[|;&$`<>\r\n"%!^()]/g.test(args)) {
      throw new Error('Comando de Git en formato string contiene caracteres prohibidos o inseguros.');
    }
    // Dividir respetando comillas simples/dobles básicas
    const matched = args.match(/(?:[^\s"]+|"[^"]*")+/g);
    argsArray = matched ? matched.map(arg => {
      if (arg.startsWith('"') && arg.endsWith('"')) {
        return arg.slice(1, -1);
      }
      return arg;
    }) : [];
    // Si el primer elemento es 'git', lo removemos del array de argumentos para spawn
    if (argsArray[0] === 'git') {
      argsArray.shift();
    }
  } else {
    throw new Error('Argumentos de Git no válidos');
  }

  // Validar subcomando contra lista blanca
  const subcommandsWhitelist = new Set([
    'status', 'diff', 'checkout', 'restore', 'rev-parse', 'clean', 'reset',
    'rev-list', 'log', 'fetch', 'branch', 'stash', 'merge', 'push', 'commit',
    'commit-tree', 'rebase'
  ]);
  const subcmd = argsArray[0];
  if (!subcmd || !subcommandsWhitelist.has(subcmd)) {
    throw new Error(`Subcomando de Git no permitido en lista blanca: ${subcmd}`);
  }

  const gitFolder = await getGitDirName(dir);
  const env = safeEnv({ PAGER: 'cat' });
  if (gitFolder) {
    env.GIT_DIR = path.join(dir, gitFolder);
    env.GIT_WORK_TREE = dir;
  }

  return new Promise((resolve, reject) => {
    const child = spawn('git', argsArray, {
      shell: false,
      cwd: dir,
      env,
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    child.on('close', (code) => {
      const redactedStdout = redactSecrets(stdout);
      const redactedStderr = redactSecrets(stderr);
      if (code === 0) {
        resolve({ stdout: redactedStdout, stderr: redactedStderr });
      } else {
        reject(Object.assign(new Error(`Git command failed with code ${code}: ${redactedStderr}`), {
          stdout: redactedStdout,
          stderr: redactedStderr,
          code
        }));
      }
    });

    child.on('error', (err) => {
      reject(new Error(redactSecrets(err.message)));
    });
  });
}

async function getGitBranch(dir) {
  try {
    const headPath = path.join(dir, '.git', 'HEAD');
    const tempHeadPath = path.join(dir, '.git-backup-temp', 'HEAD');
    let headContent = '';
    
    if (await fs.pathExists(headPath)) {
      headContent = await fs.readFile(headPath, 'utf8');
    } else if (await fs.pathExists(tempHeadPath)) {
      headContent = await fs.readFile(tempHeadPath, 'utf8');
    } else {
      // Fallback a comando git tradicional
      const { stdout } = await execGitCommand('git rev-parse --abbrev-ref HEAD', dir);
      return stdout.trim();
    }
    
    headContent = headContent.trim();
    if (headContent.startsWith('ref: ')) {
      return headContent.replace(/^ref: refs\/heads\//, '');
    }
    return headContent.substring(0, 7); // Detached HEAD
  } catch (_) { return null; }
}

// Detecta si un directorio tiene o está dentro de un repo git aislado (soportando repositorios inactivos .git-backup-temp)
async function isInsideGitRepo(dir) {
  try {
    if (await fs.pathExists(path.join(dir, '.git')) || await fs.pathExists(path.join(dir, '.git-backup-temp'))) {
      return true;
    }
    const { stdout } = await execGitCommand('git rev-parse --is-inside-work-tree', dir);
    return stdout.trim() === 'true';
  } catch (_) { return false; }
}

async function hasGitChanges(dir) {
  try {
    const { stdout } = await execGitCommand('git status --porcelain .', dir);
    const lines = stdout.split('\n').filter(line => {
      if (!line.trim()) return false;
      const filePath = line.substring(3).trim().replace(/"/g, '');
      if (filePath.startsWith('.git-backup-temp') || filePath.includes('/.git-backup-temp') || filePath.includes('\\.git-backup-temp')) {
        return false;
      }
      return true;
    });
    return lines.length > 0;
  } catch (_) { return false; }
}

app.get('/api/git/targets', async (req, res) => {
  try {
    const targets = {
      master: null,
      dashboard: null,
      cores: [],
      instances: []
    };

    // 1. Consola central (dev-dashboard)
    let dashboardChanges = false;
    const dashboardHasGit = await isInsideGitRepo(GIT_DASHBOARD_DIR);
    if (dashboardHasGit) {
      const branch = await getGitBranch(GIT_DASHBOARD_DIR);
      dashboardChanges = await hasGitChanges(GIT_DASHBOARD_DIR);
      targets.dashboard = { name: 'Consola Central (dev-dashboard)', path: GIT_DASHBOARD_DIR, branch, hasChanges: dashboardChanges, hasGit: true };
    }

    // 2. Plantillas Core
    let coresChanges = false;
    if (await fs.pathExists(GIT_CORES_DIR)) {
      const dirs = await fs.readdir(GIT_CORES_DIR);
      for (const dir of dirs) {
        const fullPath = path.join(GIT_CORES_DIR, dir);
        const stat = await fs.stat(fullPath).catch(() => null);
        if (!stat || !stat.isDirectory()) continue;
        const hasGit = await isInsideGitRepo(fullPath);
        const branch = hasGit ? await getGitBranch(fullPath) : null;
        const hasChanges = hasGit ? await hasGitChanges(fullPath) : false;
        if (hasChanges) coresChanges = true;
        targets.cores.push({ name: dir, path: fullPath, hasGit, branch, hasChanges });
      }
    }

    // 3. Instancias de Clientes
    let instancesChanges = false;
    if (await fs.pathExists(GIT_INSTANCES_DIR)) {
      const dirs = await fs.readdir(GIT_INSTANCES_DIR);
      for (const dir of dirs) {
        const fullPath = path.join(GIT_INSTANCES_DIR, dir);
        const stat = await fs.stat(fullPath).catch(() => null);
        if (!stat || !stat.isDirectory()) continue;

        // Si contiene .prototipe.json, es un candidato directo (nivel 1)
        if (await fs.pathExists(path.join(fullPath, '.prototipe.json'))) {
          const hasGit = await isInsideGitRepo(fullPath);
          const branch = hasGit ? await getGitBranch(fullPath) : null;
          const hasChanges = hasGit ? await hasGitChanges(fullPath) : false;
          if (hasChanges) instancesChanges = true;
          targets.instances.push({ name: dir, path: fullPath, hasGit, branch, hasChanges });
        } else {
          // Si no, buscar en sus subcarpetas (nivel 2)
          const subDirs = await fs.readdir(fullPath).catch(() => []);
          for (const subDir of subDirs) {
            const subFullPath = path.join(fullPath, subDir);
            const subStat = await fs.stat(subFullPath).catch(() => null);
            if (!subStat || !subStat.isDirectory()) continue;
            
            if (await fs.pathExists(path.join(subFullPath, '.prototipe.json'))) {
              const hasGit = await isInsideGitRepo(subFullPath);
              const branch = hasGit ? await getGitBranch(subFullPath) : null;
              const hasChanges = hasGit ? await hasGitChanges(subFullPath) : false;
              if (hasChanges) instancesChanges = true;
              targets.instances.push({ name: `${dir}/${subDir}`, path: subFullPath, hasGit, branch, hasChanges });
            }
          }
        }
      }
    }

    // 4. Repositorio maestro (se calcula al final para englobar los cambios del ecosistema entero)
    const masterHasGit = await isInsideGitRepo(GIT_ROOT);
    if (masterHasGit) {
      const branch = await getGitBranch(GIT_ROOT);
      const rootChanges = await hasGitChanges(GIT_ROOT);
      const hasChanges = rootChanges || dashboardChanges || coresChanges || instancesChanges;
      targets.master = { name: 'PROTOTIPE Ecosistema (Maestro)', path: GIT_ROOT, branch, hasChanges, hasGit: true };
    }

    res.json({ success: true, targets });
  } catch (err) {
    console.error('[API /git/targets] Error:', err.message);
    res.status(500).json({ error: `Error al escanear repositorios: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/git/status?path=...
// Retorna: rama activa, lista de cambios por archivo y detección de fugas .env
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/git/status', async (req, res) => {
  const targetPath = req.query.path;
  if (!targetPath) return res.status(400).json({ error: 'El parámetro "path" es obligatorio.' });

  // Seguridad: evitar path traversal fuera del ecosistema
  if (!isPathContained(GIT_ROOT, targetPath)) {
    return res.status(403).json({ error: 'Ruta fuera del ecosistema PROTOTIPE. Acceso denegado.' });
  }
  const resolvedPath = path.resolve(targetPath);
  if (!await fs.pathExists(resolvedPath)) {
    return res.status(404).json({ error: 'La ruta especificada no existe.' });
  }

  try {
    const branch = await getGitBranch(resolvedPath);
    if (!branch) {
      return res.status(400).json({ error: 'El directorio no es un repositorio Git válido.' });
    }

    let changes = [];
    let envLeak = false;
    let envLeakFiles = [];

    // Función helper para procesar cambios en un directorio y acumularlos con prefijo
    const processDirChanges = async (dir, prefix = '') => {
      try {
        const { stdout: statusOutput } = await execGitCommand('git status --porcelain .', dir);
        for (const line of statusOutput.split('\n')) {
          if (!line.trim()) continue;
          const typeCode = line.substring(0, 2).trim();
          const filePath = line.substring(3).trim().replace(/"/g, '');

          // Ignorar archivos y carpetas temporales de respaldo (.git-backup-temp)
          if (filePath.startsWith('.git-backup-temp') || filePath.includes('/.git-backup-temp') || filePath.includes('\\.git-backup-temp')) {
            continue;
          }

          const fullRelPath = prefix ? path.join(prefix, filePath).replace(/\\/g, '/') : filePath;

          // Detectar fugas de .env (excluyendo .env.example)
          if (filePath.match(/\.env/) && !filePath.match(/\.env\.example/)) {
            envLeak = true;
            envLeakFiles.push(fullRelPath);
          }

          let type = 'M';
          if (typeCode === '??' || typeCode === 'A') type = 'A';
          else if (typeCode === 'D') type = 'D';
          else if (typeCode === 'R') type = 'R';
          changes.push({ file: fullRelPath, type });
        }
      } catch (e) {
        console.warn(`[API /git/status] Warning al leer cambios en ${dir}:`, e.message);
      }
    };

    // Si es el Maestro, consolidamos todos los cambios de todo el ecosistema
    const isMaster = resolvedPath.replace(/\\/g, '/').toLowerCase() === GIT_ROOT.replace(/\\/g, '/').toLowerCase();
    if (isMaster) {
      // 1. Cambios de la raíz
      await processDirChanges(GIT_ROOT);

      // 2. Cambios de la Consola Central (dev-dashboard)
      if (await hasGitFolder(GIT_DASHBOARD_DIR)) {
        const relPrefix = path.relative(GIT_ROOT, GIT_DASHBOARD_DIR);
        await processDirChanges(GIT_DASHBOARD_DIR, relPrefix);
      }

      // 3. Cambios de Plantillas Core
      if (await fs.pathExists(GIT_CORES_DIR)) {
        const dirs = await fs.readdir(GIT_CORES_DIR);
        for (const dir of dirs) {
          const fullPath = path.join(GIT_CORES_DIR, dir);
          const stat = await fs.stat(fullPath).catch(() => null);
          if (!stat || !stat.isDirectory()) continue;
          if (await hasGitFolder(fullPath)) {
            const relPrefix = path.relative(GIT_ROOT, fullPath);
            await processDirChanges(fullPath, relPrefix);
          } else {
            // Escaneo nivel 2 (subcarpetas del Core si aplica)
            const subDirs = await fs.readdir(fullPath).catch(() => []);
            for (const subDir of subDirs) {
              const subFullPath = path.join(fullPath, subDir);
              const subStat = await fs.stat(subFullPath).catch(() => null);
              if (!subStat || !subStat.isDirectory()) continue;
              if (await hasGitFolder(subFullPath)) {
                const relPrefix = path.relative(GIT_ROOT, subFullPath);
                await processDirChanges(subFullPath, relPrefix);
              }
            }
          }
        }
      }

      // 4. Cambios de Instancias de Clientes
      if (await fs.pathExists(GIT_INSTANCES_DIR)) {
        const dirs = await fs.readdir(GIT_INSTANCES_DIR);
        for (const dir of dirs) {
          const fullPath = path.join(GIT_INSTANCES_DIR, dir);
          const stat = await fs.stat(fullPath).catch(() => null);
          if (!stat || !stat.isDirectory()) continue;
          if (await hasGitFolder(fullPath)) {
            const relPrefix = path.relative(GIT_ROOT, fullPath);
            await processDirChanges(fullPath, relPrefix);
          } else {
            // Escaneo nivel 2 (subcarpetas de clientes como seed/app-name)
            const subDirs = await fs.readdir(fullPath).catch(() => []);
            for (const subDir of subDirs) {
              const subFullPath = path.join(fullPath, subDir);
              const subStat = await fs.stat(subFullPath).catch(() => null);
              if (!subStat || !subStat.isDirectory()) continue;
              if (await hasGitFolder(subFullPath)) {
                const relPrefix = path.relative(GIT_ROOT, subFullPath);
                await processDirChanges(subFullPath, relPrefix);
              }
            }
          }
        }
      }
    } else {
      // Si es un subproyecto individual, procesamos solo sus propios cambios
      await processDirChanges(resolvedPath);
    }

    // F3: Calcular sincronización con control remoto
    let syncState = 'unknown';
    let aheadCount = 0;
    let behindCount = 0;

    const doFetch = req.query.fetch === 'true';
    if (doFetch) {
      try {
        // Fetch real usando execGitCommand para soportar repositorios activos e inactivos (.git-backup-temp)
        await execGitCommand('git fetch', resolvedPath);
      } catch (fetchErr) {
        console.warn(`[API /git/status] Warning al hacer fetch en ${resolvedPath}:`, fetchErr.message);
      }
    }

    try {
      // Comparar rama actual contra origin/{branch}
      const { stdout: diffOutput } = await execGitCommand(['rev-list', '--left-right', '--count', `HEAD...origin/${branch}`], resolvedPath);
      // stdout suele ser: "ahead\tbehind" (ej. "2\t0")
      const parts = diffOutput.trim().split(/\s+/);
      if (parts.length === 2) {
        aheadCount = parseInt(parts[0], 10) || 0;
        behindCount = parseInt(parts[1], 10) || 0;
        if (aheadCount === 0 && behindCount === 0) {
          syncState = 'sync';
        } else if (aheadCount > 0 && behindCount === 0) {
          syncState = 'ahead';
        } else if (aheadCount === 0 && behindCount > 0) {
          syncState = 'behind';
        } else {
          syncState = 'diverged';
        }
      }
    } catch (_) {
      // Si falla es porque no hay tracking remoto configurado o no hay commits comunes
      syncState = 'local';
    }

    res.json({ success: true, branch, changes, envLeak, envLeakFiles, syncState, aheadCount, behindCount });
  } catch (err) {
    console.error('[API /git/status] Error:', err.message);
    res.status(500).json({ error: `Error al leer estado Git: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/git/log?path=...
// Retorna los últimos 5 commits locales de la rama activa.
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/git/log', async (req, res) => {
  const targetPath = req.query.path;
  if (!targetPath) return res.status(400).json({ error: 'El parámetro "path" es obligatorio.' });

  if (!isPathContained(GIT_ROOT, targetPath)) {
    return res.status(403).json({ error: 'Ruta fuera del ecosistema PROTOTIPE. Acceso denegado.' });
  }
  const resolvedPath = path.resolve(targetPath);
  if (!await fs.pathExists(resolvedPath)) {
    return res.status(404).json({ error: 'La ruta especificada no existe.' });
  }
  try {
    const { stdout } = await execGitCommand(['log', '-n', '5', '--pretty=format:%h:::%an:::%ar:::%s'], resolvedPath);
    const commits = stdout.split('\n').filter(l => l.trim()).map(line => {
      const parts = line.replace(/^"/, '').replace(/"$/, '').split(':::');
      return {
        hash: parts[0],
        author: parts[1],
        date: parts[2],
        message: parts[3]
      };
    });
    res.json({ success: true, commits });
  } catch (err) {
    // Si falla porque el repositorio no tiene commits aún, retornar array vacío de forma segura
    if (err.message.includes('does not have any commits yet') || err.message.includes('fatal:')) {
      return res.json({ success: true, commits: [] });
    }
    console.error('[API /api/git/log] Error:', err.message);
    res.status(500).json({ error: `Error al leer historial Git: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/git/backup-stream (SSE)
// Ejecuta subproject_backup.ps1 (o git_backup.ps1 para el maestro)
// y retransmite su stdout en tiempo real por Server-Sent Events.
// Query: path, message (opcional), push (true/false), isMaster (true/false)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/git/backup-stream', async (req, res) => {
  const targetPath = req.query.path;
  const commitMessage = req.query.message || '';
  const isMaster = req.query.isMaster === 'true';
  const doPush = req.query.push !== 'false';          // default true
  const doAutoMerge = req.query.autoMerge === 'true'; // default false

  if (!targetPath) {
    return res.status(400).json({ error: 'El parámetro "path" es obligatorio.' });
  }

  // Seguridad: evitar path traversal
  if (!isPathContained(GIT_ROOT, targetPath)) {
    return res.status(403).json({ error: 'Ruta fuera del ecosistema PROTOTIPE. Acceso denegado.' });
  }
  const resolvedPath = path.resolve(targetPath);
  if (!await fs.pathExists(resolvedPath)) {
    return res.status(404).json({ error: 'La ruta especificada no existe.' });
  }

  // Configurar cabeceras SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Enviar keepalive cada 5 segundos para evitar cierres prematuros de conexión
  const keepAlive = setInterval(() => {
    try {
      if (!res.writableEnded && !res.finished && res.socket && !res.socket.destroyed) {
        res.write(': keepalive\n\n');
      }
    } catch (_) {}
  }, 5000);

  const cleanUp = () => {
    clearInterval(keepAlive);
  };

  const send = (type, line) => {
    try {
      if (!res.writableEnded && !res.finished && res.socket && !res.socket.destroyed) {
        res.write(`event: ${type}\ndata: ${JSON.stringify({ line })}\n\n`);
      }
    } catch (err) {
      console.warn('[SSE Send Error]', err.message);
    }
  };

  // Seleccionar script: maestro usa git_backup.ps1, subproyectos usan subproject_backup.ps1
  const scriptFile = isMaster
    ? path.join(GIT_ROOT, 'git_backup.ps1')
    : path.join(GIT_ROOT, 'subproject_backup.ps1');

  const psArgs = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptFile];
  if (!isMaster) {
    psArgs.push('-SubprojectPath', resolvedPath);
  }
  if (!doPush)     psArgs.push('-Push:$false');
  if (doAutoMerge) psArgs.push('-AutoMerge');
  if (commitMessage) {
    psArgs.push('-CommitMessage', commitMessage);
  }

  send('log', `🔒 Iniciando respaldo Git: ${path.basename(resolvedPath)}`);
  send('log', `📜 Script: ${path.basename(scriptFile)}`);
  send('log', '─────────────────────────────────────');

  const ps = spawn('powershell.exe', psArgs, {
    cwd: resolvedPath,
    env: { ...process.env }
  });

  // Pipe stdout en tiempo real
  ps.stdout.on('data', (data) => {
    const lines = data.toString('utf8').split(/\r?\n/).filter(l => l.trim());
    lines.forEach(line => send('log', line));
  });

  // stderr como advertencias (no como errores fatales — PS usa stderr para info también)
  ps.stderr.on('data', (data) => {
    const lines = data.toString('utf8').split(/\r?\n/).filter(l => l.trim());
    lines.forEach(line => {
      const trimmed = line.trim();
      // Si la línea es información estándar de Git en stderr, la enviamos como log normal
      const isGitInfo = 
        trimmed.startsWith('To ') || 
        trimmed.startsWith('From ') ||
        trimmed.startsWith('Everything up-to-date') ||
        trimmed.includes('->') ||
        trimmed.startsWith('Counting objects:') ||
        trimmed.startsWith('Compressing objects:') ||
        trimmed.startsWith('Writing objects:') ||
        trimmed.startsWith('Total ') ||
        trimmed.startsWith('remote:') ||
        trimmed.match(/^[a-f0-9]+\.\.[a-f0-9]+\s+/i);

      if (isGitInfo) {
        send('log', line);
      } else {
        send('log', `⚠ ${line}`);
      }
    });
  });

  ps.on('close', (code) => {
    cleanUp();
    if (code === 0) {
      send('log', '─────────────────────────────────────');
      send('log', '✅ Respaldo completado con éxito.');
      // Metadata para trazabilidad Firestore en el frontend
      try {
        if (!res.writableEnded && !res.finished && res.socket && !res.socket.destroyed) {
          res.write(`event: metadata\ndata: ${JSON.stringify({
            path: resolvedPath,
            targetName: path.basename(resolvedPath),
            branch: 'auto',
            message: commitMessage,
            push: doPush,
            autoMerge: doAutoMerge,
            timestamp: new Date().toISOString()
          })}\n\n`);
        }
      } catch (_) {}
      send('complete', `Proceso finalizado con código ${code}.`);
    } else {
      send('log', `❌ El proceso finalizó con código de error: ${code}`);
      send('error', `Proceso finalizado con código ${code}.`);
    }
    try {
      if (!res.writableEnded && !res.finished) res.end();
    } catch (_) {}
  });

  ps.on('error', (err) => {
    cleanUp();
    send('log', `❌ No se pudo iniciar PowerShell: ${err.message}`);
    send('error', err.message);
    try {
      if (!res.writableEnded && !res.finished) res.end();
    } catch (_) {}
  });

  // Limpiar proceso si el cliente cierra la conexión
  req.on('close', () => {
    cleanUp();
    if (!ps.killed && ps.pid) {
      killProcessTree(ps.pid);
    }
  });
});

// --- OBTENER CORES Y SUS RAMAS CLIENTES ---
app.get('/api/git/cores-and-clients', async (req, res) => {
  try {
    const coresDir = path.join(GIT_ROOT, 'Plantillas Core');
    if (!await fs.pathExists(coresDir)) {
      return res.json({ success: true, cores: [] });
    }

    const items = await fs.readdir(coresDir);
    const cores = [];

    for (const item of items) {
      const itemPath = path.join(coresDir, item);
      const stat = await fs.stat(itemPath);
      if (stat.isDirectory()) {
        const isGit = await hasGitFolder(itemPath);
        if (isGit) {
          const currentBranch = await getGitBranch(itemPath);
          
          // Obtener todas las ramas locales y remotas
          const { stdout: branchesStdout } = await execGitCommand('git branch -a', itemPath);
          const rawBranches = branchesStdout.split(/\r?\n/).map(b => b.trim());
          
          const clients = [];
          const baseBranches = [];
          const seenClients = new Set();
          const seenBase = new Set();

          // Primer paso: recopilar todas las ramas base y clientes
          for (const rawB of rawBranches) {
            let cleanBranch = rawB.replace(/^\*\s+/, '').trim();
            if (cleanBranch.includes(' -> ')) continue;
            cleanBranch = cleanBranch.replace(/^remotes\/origin\//, '');
            
            if (cleanBranch.startsWith('cliente/')) {
              const clientName = cleanBranch.replace(/^cliente\//, '');
              if (!seenClients.has(clientName)) {
                seenClients.add(clientName);
                clients.push({ id: clientName, branch: `cliente/${clientName}` });
              }
            } else {
              if (cleanBranch && !seenBase.has(cleanBranch)) {
                seenBase.add(cleanBranch);
                baseBranches.push(cleanBranch);
              }
            }
          }

          // Determinar la mejor rama base para cálculo de desfase (main es la rama de producción canónica)
          const defaultBase = baseBranches.includes('main')
            ? 'main'
            : (baseBranches.includes('master') ? 'master' : (baseBranches.includes('develop') ? 'develop' : currentBranch));

          // Segundo paso: calcular commits behind/ahead para cada cliente de forma dinámica
          const clientsWithParity = [];
          for (const client of clients) {
            let commitsBehind = 0;
            let commitsAhead = 0;
            try {
              if (defaultBase) {
                const { stdout: behindOut } = await execGitCommand(['log', `cliente/${client.id}..${defaultBase}`, '--oneline'], itemPath);
                commitsBehind = behindOut.split(/\r?\n/).filter(Boolean).length;

                const { stdout: aheadOut } = await execGitCommand(['log', `${defaultBase}..cliente/${client.id}`, '--oneline'], itemPath);
                commitsAhead = aheadOut.split(/\r?\n/).filter(Boolean).length;
              }
            } catch (_) {}

            clientsWithParity.push({
              ...client,
              commitsBehind,
              commitsAhead
            });
          }

          cores.push({
            name: item,
            path: itemPath,
            currentBranch,
            availableBranches: baseBranches,
            defaultBaseBranch: defaultBase,
            clients: clientsWithParity
          });
        }
      }
    }

    res.json({ success: true, cores });
  } catch (err) {
    console.error('[API /api/git/cores-and-clients] Error:', err.message);
    res.status(500).json({ error: `Error al obtener cores y clientes: ${err.message}` });
  }
});


// --- STREAM SSE PARA SINCRONIZAR CORE A CLIENTES Y DESPLEGAR ---
app.get('/api/git/sync-core-to-clients-stream', async (req, res) => {
  const { corePath, sourceBranch, clientBranches } = req.query;

  if (!corePath || !sourceBranch || !clientBranches) {
    return res.status(400).json({ error: 'Faltan parámetros obligatorios: corePath, sourceBranch, clientBranches.' });
  }

  const branchesToSync = clientBranches.split(',').map(b => b.trim()).filter(Boolean);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (type, data) => {
    try {
      if (!res.writableEnded && !res.finished && res.socket && !res.socket.destroyed) {
        res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
      }
    } catch (err) {
      console.warn('[SSE Sync Core Send Error]', err.message);
    }
  };

  send('log', { text: `🚀 Iniciando sincronización del Core en: ${path.basename(corePath)}`, type: 'info' });
  send('log', { text: `📜 Rama origen (Core): ${sourceBranch}`, type: 'info' });
  send('log', { text: `👥 Ramas cliente a actualizar: ${branchesToSync.join(', ')}`, type: 'info' });
  send('log', { text: '──────────────────────────────────────────────────', type: 'info' });

  let originalBranch = 'main';
  try {
    originalBranch = await getGitBranch(corePath) || 'main';
  } catch (_) {}

  let isAborted = false;
  let activeChild = null;

  req.on('close', () => {
    if (!isAborted) {
      isAborted = true;
      if (activeChild) {
        try {
          activeChild.kill();
        } catch (_) {}
      }
      console.warn('[API /api/git/sync-core-to-clients-stream] Cliente cerró conexión SSE de forma repentina.');
    }
  });

  const runCommandStream = (cmdStr, args, cwd) => {
    return new Promise((resolve, reject) => {
      if (isAborted) {
        return reject(new Error('Sincronización abortada por desconexión del cliente.'));
      }
      send('log', { text: `👉 Ejecutando: ${cmdStr} ${args.join(' ')}`, type: 'command' });
      
      const child = spawn(cmdStr, args, {
        cwd,
        shell: true,
        env: { ...process.env, FORCE_COLOR: '0' }
      });
      activeChild = child;

      child.stdout.on('data', (data) => {
        const lines = data.toString('utf8').split(/\r?\n/).filter(l => l.trim());
        lines.forEach(line => send('log', { text: `   ${line}`, type: 'stdout' }));
      });

      child.stderr.on('data', (data) => {
        const lines = data.toString('utf8').split(/\r?\n/).filter(l => l.trim());
        lines.forEach(line => send('log', { text: `   ⚠ ${line}`, type: 'stderr' }));
      });

      child.on('close', (code) => {
        activeChild = null;
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Comando falló con código ${code}`));
        }
      });

      child.on('error', (err) => {
        activeChild = null;
        reject(err);
      });
    });
  };

  try {
    send('log', { text: '📦 Resguardando cambios locales en stash...', type: 'info' });
    try {
      await execGitCommand('git stash', corePath);
    } catch (_) {}

    for (const clientBranch of branchesToSync) {
      if (isAborted) {
        throw new Error('Sincronización abortada por desconexión del cliente.');
      }
      const clientName = clientBranch.replace(/^cliente\//, '');
      send('client-status', { client: clientName, status: 'running' });
      send('log', { text: `\n🔄 [Cliente: ${clientName}] Iniciando actualización...`, type: 'header' });

      try {
        send('log', { text: `   Checkout a rama: ${clientBranch}`, type: 'info' });
        await execGitCommand(['checkout', clientBranch], corePath);

        send('log', { text: `   Fusionando cambios de: ${sourceBranch}`, type: 'info' });
        try {
          await execGitCommand(['merge', sourceBranch, '--no-verify', '-m', 'merge: Core global update'], corePath);
        } catch (mergeErr) {
          send('log', { text: `❌ Conflicto de fusión detectado para ${clientName}. Abortando merge...`, type: 'error' });
          await execGitCommand(['merge', '--abort'], corePath);
          throw new Error('Conflicto de fusión en Git');
        }

        send('log', { text: '   Subiendo rama actualizada a GitHub...', type: 'info' });
        await execGitCommand(['push', 'origin', clientBranch, '--no-verify'], corePath);

        // Leer .env.local de la instancia física del cliente para obtener su Firebase Project ID
        const clientPhysicalPath = await findProjectDir(clientName);
        const clientEnvPath = clientPhysicalPath ? path.join(clientPhysicalPath, '.env.local') : '';
        let firebaseProjectId = '';

        if (clientEnvPath && await fs.pathExists(clientEnvPath)) {
          const envContent = await fs.readFile(clientEnvPath, 'utf8');
          const match = envContent.match(/VITE_FIREBASE_PROJECT_ID\s*=\s*(.+)/);
          if (match && match[1]) {
            firebaseProjectId = match[1].trim().replace(/['"]/g, '');
          }
        }

        if (!firebaseProjectId) {
          // Fallback: leer del .env.local del core si el cliente no tiene su propio project ID configurado
          const coreEnvPath = path.join(corePath, '.env.local');
          if (await fs.pathExists(coreEnvPath)) {
            const envContent = await fs.readFile(coreEnvPath, 'utf8');
            const match = envContent.match(/VITE_FIREBASE_PROJECT_ID\s*=\s*(.+)/);
            if (match && match[1]) {
              firebaseProjectId = match[1].trim().replace(/['"]/g, '');
              send('log', { text: `⚠ Usando Firebase Project ID del Core como fallback: ${firebaseProjectId}`, type: 'warn' });
            }
          }
        }

        if (firebaseProjectId) {
          firebaseProjectId = firebaseProjectId.trim().toLowerCase().replace(/[^a-z0-9\-]/g, '');
          send('log', { text: `🚀 Firebase Project detectado para ${clientName}: ${firebaseProjectId}`, type: 'info' });
          
          send('log', { text: '   Compilando assets de producción...', type: 'info' });
          await runCommandStream('npm', ['run', 'build'], clientPhysicalPath || corePath);

          send('log', { text: `   Desplegando a Firebase Hosting para proyecto: ${firebaseProjectId}...`, type: 'info' });
          await runCommandStream('firebase', ['deploy', '--only', 'hosting', '-P', firebaseProjectId], clientPhysicalPath || corePath);
          
          send('log', { text: `✅ Cliente ${clientName} actualizado y desplegado correctamente en producción.`, type: 'success' });
        } else {
          send('log', { text: `⚠ No se encontró VITE_FIREBASE_PROJECT_ID para ${clientName}. Sincronización Git realizada, deploy omitido.`, type: 'warn' });
        }

        send('client-status', { client: clientName, status: 'success' });
      } catch (err) {
        send('log', { text: `❌ Fallo en la sincronización de ${clientName}: ${err.message}`, type: 'error' });
        send('client-status', { client: clientName, status: 'error', error: err.message });
      }
    }

    send('log', { text: '\n🧹 Limpiando y regresando a la rama de origen...', type: 'info' });
    try {
      await execGitCommand(['checkout', originalBranch], corePath);
      await execGitCommand(['stash', 'pop'], corePath);
    } catch (_) {}

    send('log', { text: '──────────────────────────────────────────────────', type: 'info' });
    send('log', { text: '🎉 Sincronización global completada.', type: 'success' });
    send('complete', { success: true });
  } catch (err) {
    send('log', { text: `❌ Error global durante la sincronización: ${err.message}`, type: 'error' });
    send('complete', { success: false, error: err.message });
    // Si falló a mitad de camino o se canceló, restaurar la rama original del Core
    try {
      await execGitCommand(['checkout', originalBranch], corePath);
      await execGitCommand(['stash', 'pop'], corePath);
    } catch (_) {}
  } finally {
    try {
      if (!res.writableEnded && !res.finished) res.end();
    } catch (_) {}
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Archivos/carpetas excluidos de la sincronización física Core → Cliente.
// Preserva la identidad del cliente (Firebase, marca, configuración).
// ─────────────────────────────────────────────────────────────────────────────
// Helper: escanea recursivamente un directorio respetando isPathExcludedFromSync de forma asíncrona no bloqueante
async function getSyncFilesRecursiveAsync(dir, baseDir = dir) {
  let results = [];
  let list;
  try {
    list = await fs.readdir(dir);
  } catch (_) {
    return results;
  }
  await Promise.all(
    list.map(async (file) => {
      const fullPath = path.join(dir, file);
      const rel = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      
      // Delegar la validación al helper centralizado
      if (isPathExcludedFromSync(rel)) return;
      
      let stat;
      try {
        stat = await fs.stat(fullPath);
      } catch (_) {
        return;
      }
      if (stat.isDirectory()) {
        const subResults = await getSyncFilesRecursiveAsync(fullPath, baseDir);
        results = results.concat(subResults);
      } else {
        results.push(rel);
      }
    })
  );
  return results;
}

// Helper: hash MD5 asíncrono de un archivo para comparación rápida no bloqueante
async function getSyncFileHashAsync(filePath) {
  try {
    const buf = await fs.readFile(filePath);
    return crypto.createHash('md5').update(buf).digest('hex');
  } catch (_) {
    return null;
  }
}

// Helpers para versionado SemVer en la sincronización de Cores
function incrementPatchVersion(version) {
  if (!version) return '1.0.0';
  const parts = version.split('.').map(Number);
  if (parts.length < 3 || parts.some(isNaN)) {
    return '1.0.0';
  }
  parts[2]++;
  return parts.join('.');
}

function compareSemVer(v1, v2) {
  const p1 = (v1 || '0.0.0').split('.').map(Number);
  const p2 = (v2 || '0.0.0').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const num1 = isNaN(p1[i]) ? 0 : p1[i];
    const num2 = isNaN(p2[i]) ? 0 : p2[i];
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/instancias/list
// Lista todas las instancias de clientes físicas con delta REAL vs core (MD5 hash diff).
// Agrupa por plantilla usando .prototipe.json de cada instancia.
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/instancias/list', async (req, res) => {
  try {
    const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
    const registro = await fs.readJson(registroPath);
    const plantillas = registro.plantillas || {};

    // Leer versión real de cada core (registro es fuente de verdad; package.json solo como fallback)
    const coreInfo = {};
    for (const [key, config] of Object.entries(plantillas)) {
      let version = config.version;
      try {
        const pkg = await fs.readJson(path.join(config.fuente, 'package.json'));
        if (!version && pkg.version && pkg.version !== '0.0.0') version = pkg.version;
      } catch (_) {}
      coreInfo[key] = {
        version: version || '0.0.0',
        name: path.basename(config.fuente),
        path: config.fuente,
        nicho: config.nicho
      };
    }

    // Escanear Instancias Clientes (admite nivel 1 o nivel 2 como /ventas/ventas-moni-app)
    const templatesMap = {};
    if (await fs.pathExists(GIT_INSTANCES_DIR)) {
      const candidates = [];
      const topDirs = await fs.readdir(GIT_INSTANCES_DIR);
      
      for (const dir of topDirs) {
        const fullPath = path.join(GIT_INSTANCES_DIR, dir);
        const stat = await fs.stat(fullPath).catch(() => null);
        if (!stat || !stat.isDirectory()) continue;

        // Si contiene .prototipe.json, es un candidato directo (nivel 1)
        if (await fs.pathExists(path.join(fullPath, '.prototipe.json'))) {
          candidates.push({ folderName: dir, fullPath });
        } else {
          // Si no, buscar en sus subcarpetas (nivel 2)
          const subDirs = await fs.readdir(fullPath).catch(() => []);
          for (const subDir of subDirs) {
            const subFullPath = path.join(fullPath, subDir);
            const subStat = await fs.stat(subFullPath).catch(() => null);
            if (!subStat || !subStat.isDirectory()) continue;
            
            if (await fs.pathExists(path.join(subFullPath, '.prototipe.json'))) {
              candidates.push({ folderName: subDir, fullPath: subFullPath });
            }
          }
        }
      }

      const clientDataList = await Promise.all(candidates.map(async (candidate) => {
        const { folderName, fullPath } = candidate;
        const metaPath = path.join(fullPath, '.prototipe.json');
        let meta = {};
        try { 
          meta = await fs.readJson(metaPath); 
          meta = validatePrototipeMetadata(meta, folderName);
          
          // [AUTO-HEAL] Sincronizar clientId con el definido en .env.local para evitar desalineaciones si la carpeta es renombrada
          const envPath = path.join(fullPath, '.env.local');
          if (await fs.pathExists(envPath)) {
            const envContent = await fs.readFile(envPath, 'utf-8');
            const match = envContent.match(/VITE_DEVELOPER_CLIENT_ID\s*=\s*(.*)/);
            if (match) {
              const envClientId = match[1].trim().replace(/['"]/g, '');
              if (envClientId && meta.clientId !== envClientId) {
                meta.clientId = envClientId;
                await fs.writeJson(metaPath, meta, { spaces: 2 });
              }
            }
          }
        } catch (_) { 
          return null; 
        }

        const templateKey = meta.template;
        if (!templateKey || !coreInfo[templateKey]) return null;

        const core = coreInfo[templateKey];
        const clientVersion = meta.version || '0.0.0';

        // ── Detección REAL por hash MD5 ─────────────────────────────────
        let driftCount = 0;
        let dependenciesOutOfSync = false;
        try {
          const coreFiles = await getSyncFilesRecursiveAsync(core.path);
          for (const relFile of coreFiles) {
            if (relFile === 'package.json') continue;
            const coreHash   = await getSyncFileHashAsync(path.join(core.path, relFile));
            const clientHash = await getSyncFileHashAsync(path.join(fullPath, relFile));
            if (coreHash !== clientHash) driftCount++;
          }
        } catch (_) {
          driftCount = clientVersion !== core.version ? 1 : 0;
        }

        // Validar dependencias lógicas en package.json
        const corePkgPath = path.join(core.path, 'package.json');
        const clientPkgPath = path.join(fullPath, 'package.json');
        if (await fs.pathExists(corePkgPath) && await fs.pathExists(clientPkgPath)) {
          try {
            const corePkg = await fs.readJson(corePkgPath);
            const clientPkg = await fs.readJson(clientPkgPath);
            const coreDeps = { ...(corePkg.dependencies || {}), ...(corePkg.devDependencies || {}) };
            const clientDeps = { ...(clientPkg.dependencies || {}), ...(clientPkg.devDependencies || {}) };
            for (const dep in coreDeps) {
              if (!clientDeps[dep] || coreDeps[dep] !== clientDeps[dep]) {
                dependenciesOutOfSync = true;
                break;
              }
            }
          } catch (_) {}
        }

        // Marcar también como desactualizado cuando la versión del cliente es inferior a la del core
        const versionBehind = compareSemVer(clientVersion, core.version) < 0;
        const isOutdated = driftCount > 0 || dependenciesOutOfSync || versionBehind;
        if (isOutdated && driftCount === 0) {
          driftCount = 1; // Asegurar badge si sólo difieren versiones o dependencias
        }
        // ────────────────────────────────────────────────────────────────

        // Versión objetivo: si el cliente está al día en código pero detrás en versión → core.version
        // Si el cliente tiene versión >= core pero tiene archivos en drift → patch + 1
        let targetCoreVersion = core.version;
        if (isOutdated && !versionBehind && compareSemVer(clientVersion, core.version) >= 0) {
          targetCoreVersion = incrementPatchVersion(clientVersion);
        }

        return {
          templateKey,
          core,
          clientData: {
            clientId: meta.clientId || folderName,
            projectName: meta.projectName || folderName,
            folderName,
            path: fullPath,
            clientVersion,
            coreVersion: targetCoreVersion,
            isOutdated,
            driftCount,
            niche: meta.niche || 'general'
          }
        };
      }));

      // Población síncrona segura
      for (const item of clientDataList) {
        if (!item) continue;
        const { templateKey, core, clientData } = item;
        if (!templatesMap[templateKey]) {
          templatesMap[templateKey] = {
            key: templateKey,
            name: core.name,
            coreVersion: core.version,
            corePath: core.path,
            nicho: core.nicho,
            clients: []
          };
        }
        templatesMap[templateKey].clients.push(clientData);
      }
    }

    res.json({ success: true, templates: Object.values(templatesMap) });
  } catch (err) {
    console.error('[API /instancias/list] Error:', err.message);
    res.status(500).json({ error: `Error al listar instancias: ${err.message}` });
  }
});

// =============================================================================
// PRE-FLIGHT VALIDATION AND AUTO-HEALING PIPELINE (CORE-089)
// =============================================================================

async function fetchCentralClientConfig(clientId) {
  try {
    const accessToken = await getFirebaseAccessToken();
    const url = `https://firestore.googleapis.com/v1/projects/prototipe-ecosistema-control/databases/(default)/documents/clientes_control/${clientId}`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Error HTTP ${res.status} al consultar clientes_control`);
    }
    const doc = await res.json();
    const fields = doc.fields || {};
    return {
      billingMode: fields.billingMode?.stringValue || 'percentage',
      comisionPorcentaje: fields.comisionPorcentaje?.doubleValue ?? fields.comisionPorcentaje?.integerValue ?? 1.5,
      montoFijoServicio: fields.montoFijoServicio?.integerValue ?? fields.montoFijoServicio?.doubleValue ?? 500,
      pagoMensualFijo: fields.pagoMensualFijo?.integerValue ?? fields.pagoMensualFijo?.doubleValue ?? 0,
      enableDianBilling: fields.enableDianBilling?.booleanValue ?? false,
      costoPorFacturaDian: fields.costoPorFacturaDian?.integerValue ?? fields.costoPorFacturaDian?.doubleValue ?? 150,
      nombre: fields.nombre?.stringValue || clientId,
      projectId: fields.projectId?.stringValue || doc.name.split('/').pop()
    };
  } catch (err) {
    console.error(`[Preflight Central Config] Fallo al consultar Firestore central:`, err.message);
    return null;
  }
}

async function fetchCentralClientToken(clientId) {
  try {
    const accessToken = await getFirebaseAccessToken();
    const url = `https://firestore.googleapis.com/v1/projects/prototipe-ecosistema-control/databases/(default)/documents:runQuery`;
    const body = {
      structuredQuery: {
        from: [{ collectionId: 'tokens' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: 'clientId' },
                  op: 'EQUAL',
                  value: { stringValue: clientId }
                }
              },
              {
                fieldFilter: {
                  field: { fieldPath: 'active' },
                  op: 'EQUAL',
                  value: { booleanValue: true }
                }
              }
            ]
          }
        }
      }
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Query failed: ${res.status}`);
    const results = await res.json();
    if (Array.isArray(results) && results.length > 0 && results[0].document) {
      const doc = results[0].document;
      return doc.name.split('/').pop();
    }
    return null;
  } catch (err) {
    console.error(`[Preflight Token Check] Fallo al buscar token central:`, err.message);
    return null;
  }
}

async function fetchFirebaseSDKConfig(projectId) {
  try {
    const { stdout } = await execAsync(`firebase apps:sdkconfig web --project ${projectId} --json`, { timeout: 30000 });
    const parsed = JSON.parse(stdout);
    if (parsed && parsed.result) {
      return parsed.result.sdkConfig || parsed.result;
    }
    return parsed;
  } catch (err) {
    console.error(`[Preflight Firebase SDK] Error al obtener sdkconfig para ${projectId}:`, err.message);
    return null;
  }
}

async function auditAndPatchFirebaseConfig(filePath, log) {
  if (!await fs.pathExists(filePath)) {
    log(`   ⚠ No se encontró firebaseConfig.js en ${filePath}. Omitiendo patch.`, 'warn');
    return;
  }
  let content = await fs.readFile(filePath, 'utf8');
  if (content.includes('export { messaging }') || content.includes('export const messaging')) {
    return;
  }
  log(`   🔧 firebaseConfig.js no exporta 'messaging'. Aplicando auto-curación de interfaz...`, 'warn');
  if (!content.includes('firebase/messaging')) {
    content = `import { getMessaging, isSupported } from 'firebase/messaging'\n` + content;
  }
  const patchCode = `
// =============================================================================
// AUTO-INYECCIÓN PARA COMPATIBILIDAD CON CORE MESSAGING (CORE-089)
// =============================================================================
let messaging = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
}).catch((err) => {
  console.warn('[FCM Config] Messaging no soportado:', err);
});
export { messaging };
`;
  content = content.trim() + '\n' + patchCode;
  await fs.writeFile(filePath, content, 'utf8');
  log(`   ✅ firebaseConfig.js parcheado con éxito.`, 'success');
}

async function auditAndPatchServiceWorker(clientPath, corePath, firebaseConfig, log) {
  const swDestPath = path.join(clientPath, 'public', 'firebase-messaging-sw.js');
  const swSrcPath = path.join(corePath, 'public', 'firebase-messaging-sw.js');
  
  // Si el Core no tiene el service worker FCM, omitir en silencio ya que no está activo
  if (!await fs.pathExists(swSrcPath)) {
    return;
  }

  if (!await fs.pathExists(swDestPath)) {
    log(`   🔧 Service Worker FCM faltante. Copiando desde el Core...`, 'warn');
    await fs.ensureDir(path.dirname(swDestPath));
    await fs.copy(swSrcPath, swDestPath);
  }
  let swContent = await fs.readFile(swDestPath, 'utf8');
  const initRegex = /firebase\.initializeApp\(\{[\s\S]*?\}\)/;
  const clientInitBlock = `firebase.initializeApp({
  apiKey: "${firebaseConfig.apiKey}",
  authDomain: "${firebaseConfig.authDomain}",
  projectId: "${firebaseConfig.projectId}",
  storageBucket: "${firebaseConfig.storageBucket}",
  messagingSenderId: "${firebaseConfig.messagingSenderId}",
  appId: "${firebaseConfig.appId}"
})`;
  if (initRegex.test(swContent)) {
    swContent = swContent.replace(initRegex, clientInitBlock);
  } else {
    swContent = swContent + '\n\n' + clientInitBlock + '\nconst messaging = firebase.messaging();\n';
  }
  await fs.writeFile(swDestPath, swContent, 'utf8');
  log(`   ✅ public/firebase-messaging-sw.js actualizado con credenciales del cliente.`, 'success');
}

async function auditAndPatchScripts(clientPath, corePath, log) {
  const pkgPath = path.join(clientPath, 'package.json');
  if (!await fs.pathExists(pkgPath)) return;
  const pkg = await fs.readJson(pkgPath);
  const scripts = pkg.scripts || {};
  for (const [key, cmd] of Object.entries(scripts)) {
    const match = cmd.match(/node\s+scripts\/([a-zA-Z0-9_\-\.]+)/);
    if (match && match[1]) {
      const scriptFile = match[1];
      const clientScriptPath = path.join(clientPath, 'scripts', scriptFile);
      const coreScriptPath = path.join(corePath, 'scripts', scriptFile);
      if (!await fs.pathExists(clientScriptPath)) {
        if (await fs.pathExists(coreScriptPath)) {
          log(`   🔧 Utilidad de compilación faltante detectada: scripts/${scriptFile}. Copiando...`, 'warn');
          await fs.ensureDir(path.dirname(clientScriptPath));
          await fs.copy(coreScriptPath, clientScriptPath);
          log(`      + Copiado: scripts/${scriptFile}`, 'stdout');
        } else {
          log(`   ⚠ El script ${key} requiere scripts/${scriptFile} pero no existe en el Core.`, 'warn');
        }
      }
    }
  }
}

async function auditAndPatchFirebaseJson(clientPath, log) {
  const fbJsonPath = path.join(clientPath, 'firebase.json');
  if (!await fs.pathExists(fbJsonPath)) {
    log(`   🔧 firebase.json faltante en ${clientPath}. Omitiendo inyección de cabeceras.`, 'warn');
    return;
  }
  try {
    const config = await fs.readJson(fbJsonPath);
    if (!config.hosting) {
      config.hosting = {};
    }
    
    const hostings = Array.isArray(config.hosting) ? config.hosting : [config.hosting];
    let patched = false;
    
    const requiredHeaders = [
      { source: '/index.html', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
      { source: '/manifest.webmanifest', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
      { source: '/manifest.json', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
      { source: '/assets/**', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }
    ];
    
    for (const h of hostings) {
      if (!h.headers) {
        h.headers = [];
      }
      for (const req of requiredHeaders) {
        const existingIdx = h.headers.findIndex(item => item.source === req.source);
        if (existingIdx === -1) {
          h.headers.push(req);
          patched = true;
        } else {
          const existing = h.headers[existingIdx];
          const hasCacheCtrl = existing.headers && existing.headers.some(x => x.key === 'Cache-Control' && x.value === req.headers[0].value);
          if (!hasCacheCtrl) {
            h.headers[existingIdx] = req;
            patched = true;
          }
        }
      }
    }
    
    if (patched) {
      log(`   🔧 firebase.json no tiene configuradas las cabeceras estrictas de caché PWA. Auto-curando...`, 'warn');
      config.hosting = Array.isArray(config.hosting) ? hostings : hostings[0];
      await fs.writeJson(fbJsonPath, config, { spaces: 2 });
      log(`   ✅ firebase.json curado con éxito con cabeceras estrictas de caché (no-cache y assets inmutables).`, 'success');
    }
  } catch (err) {
    log(`   ❌ Error al auditar/parchear firebase.json: ${err.message}`, 'error');
  }
}

async function validateClientIntegrityBeforeSync(corePath, clientPath, folderName, log) {
  log(`🔍 Iniciando Pre-flight Validation Pipeline (CORE-089)...`, 'info');
  const metaPath = path.join(clientPath, '.prototipe.json');
  if (!await fs.pathExists(metaPath)) {
    throw new Error(`Falta el archivo de metadatos obligatorio .prototipe.json en ${clientPath}`);
  }
  const meta = await fs.readJson(metaPath);
  const clientId = meta.clientId;
  if (!clientId) {
    throw new Error(`.prototipe.json no contiene un clientId válido.`);
  }
  log(`   ID de Cliente identificado: "${clientId}"`, 'info');

  const firebaseProjectId = await resolveFirebaseProjectId(clientPath, clientId);
  log(`   Proyecto Firebase asociado: "${firebaseProjectId}"`, 'info');

  log(`   Firestore central: Consultando configuración y comisiones...`, 'info');
  const centralConfig = await fetchCentralClientConfig(clientId);
  const telemetryToken = await fetchCentralClientToken(clientId);

  if (centralConfig) {
    log(`      Facturación central: Modo ${centralConfig.billingMode}, Comisión: ${centralConfig.comisionPorcentaje}%`, 'info');
  } else {
    log(`   ⚠ No se encontró configuración central en clientes_control/${clientId}. Usando valores locales existentes.`, 'warn');
  }

  if (telemetryToken) {
    log(`      Token de Telemetría central recuperado: ${telemetryToken}`, 'info');
  } else {
    log(`   ⚠ No se encontró token activo en la colección tokens para clientId ${clientId}.`, 'warn');
  }

  log(`   Firebase CLI: Consultando SDK config de ${firebaseProjectId}...`, 'info');
  const sdkConfig = await fetchFirebaseSDKConfig(firebaseProjectId);
  if (!sdkConfig) {
    throw new Error(`No se pudo obtener la configuración del proyecto Firebase "${firebaseProjectId}". Verifica permisos.`);
  }

  const envPath = path.join(clientPath, '.env.local');
  let currentEnv = {};
  if (await fs.pathExists(envPath)) {
    const content = await fs.readFile(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2 && !line.trim().startsWith('#')) {
        currentEnv[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
  }

  const finalEnv = {
    ...currentEnv,
    VITE_FIREBASE_API_KEY: sdkConfig.apiKey || currentEnv.VITE_FIREBASE_API_KEY || '',
    VITE_FIREBASE_AUTH_DOMAIN: sdkConfig.authDomain || currentEnv.VITE_FIREBASE_AUTH_DOMAIN || '',
    VITE_FIREBASE_PROJECT_ID: firebaseProjectId,
    VITE_FIREBASE_STORAGE_BUCKET: sdkConfig.storageBucket || currentEnv.VITE_FIREBASE_STORAGE_BUCKET || '',
    VITE_FIREBASE_MESSAGING_SENDER_ID: sdkConfig.messagingSenderId || currentEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    VITE_FIREBASE_APP_ID: sdkConfig.appId || currentEnv.VITE_FIREBASE_APP_ID || '',

    VITE_DEVELOPER_TELEMETRY_ENDPOINT: 'http://localhost:3001',
    VITE_DEVELOPER_CLIENT_ID: clientId,

    VITE_DEVELOPER_CENTRAL_API_KEY: 'AIzaSyCBkdokIpGqWlfFiU_i83o7GmV1ZTqXYJE',
    VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN: 'prototipe-ecosistema-control.firebaseapp.com',
    VITE_DEVELOPER_CENTRAL_PROJECT_ID: 'prototipe-ecosistema-control',
    VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET: 'prototipe-ecosistema-control.firebasestorage.app',
    VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID: '703542009613',
    VITE_DEVELOPER_CENTRAL_APP_ID: '1:703542009613:web:00f9363de11a908c991a44',

    VITE_FIREBASE_VAPID_KEY: 'BBDourdsNRV6kqRLm52FcPagPlDo99IJ3VdUP8NTERFXwXdJ8Pt7e7zbw82xE4O3f5ImVvebprW9_lVZ--fmnac',

    VITE_DEVELOPER_BILLING_MODE: centralConfig?.billingMode || currentEnv.VITE_DEVELOPER_BILLING_MODE || 'percentage',
    VITE_DEVELOPER_COMMISSION_PERCENT: centralConfig?.comisionPorcentaje || currentEnv.VITE_DEVELOPER_COMMISSION_PERCENT || '1.5',
    VITE_DEVELOPER_FIXED_SERVICE_FEE: centralConfig?.montoFijoServicio || currentEnv.VITE_DEVELOPER_FIXED_SERVICE_FEE || '500',
    VITE_DEVELOPER_FLAT_MONTHLY_FEE: centralConfig?.pagoMensualFijo || currentEnv.VITE_DEVELOPER_FLAT_MONTHLY_FEE || '0',
    VITE_DEVELOPER_ENABLE_DIAN_BILLING: centralConfig?.enableDianBilling !== undefined ? String(centralConfig.enableDianBilling) : (currentEnv.VITE_DEVELOPER_ENABLE_DIAN_BILLING || 'false'),
    VITE_DEVELOPER_COSTO_POR_FACTURA_DIAN: centralConfig?.costoPorFacturaDian || currentEnv.VITE_DEVELOPER_COSTO_POR_FACTURA_DIAN || '150'
  };

  let envContent = `# Variables de entorno Firebase — Proyecto: ${firebaseProjectId}\n`;
  envContent += `# Generado automáticamente por el pre-flight validation pipeline (CORE-089)\n\n`;
  
  envContent += `# Firebase Config\n`;
  envContent += `VITE_FIREBASE_API_KEY=${finalEnv.VITE_FIREBASE_API_KEY}\n`;
  envContent += `VITE_FIREBASE_AUTH_DOMAIN=${finalEnv.VITE_FIREBASE_AUTH_DOMAIN}\n`;
  envContent += `VITE_FIREBASE_PROJECT_ID=${finalEnv.VITE_FIREBASE_PROJECT_ID}\n`;
  envContent += `VITE_FIREBASE_STORAGE_BUCKET=${finalEnv.VITE_FIREBASE_STORAGE_BUCKET}\n`;
  envContent += `VITE_FIREBASE_MESSAGING_SENDER_ID=${finalEnv.VITE_FIREBASE_MESSAGING_SENDER_ID}\n`;
  envContent += `VITE_FIREBASE_APP_ID=${finalEnv.VITE_FIREBASE_APP_ID}\n\n`;

  envContent += `# Telemetría de Comisiones\n`;
  envContent += `VITE_DEVELOPER_TELEMETRY_ENDPOINT=${finalEnv.VITE_DEVELOPER_TELEMETRY_ENDPOINT}\n`;
  envContent += `VITE_DEVELOPER_CLIENT_ID=${finalEnv.VITE_DEVELOPER_CLIENT_ID}\n\n`;

  envContent += `# Conexión Central de Control\n`;
  envContent += `VITE_DEVELOPER_CENTRAL_API_KEY=${finalEnv.VITE_DEVELOPER_CENTRAL_API_KEY}\n`;
  envContent += `VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN=${finalEnv.VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN}\n`;
  envContent += `VITE_DEVELOPER_CENTRAL_PROJECT_ID=${finalEnv.VITE_DEVELOPER_CENTRAL_PROJECT_ID}\n`;
  envContent += `VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET=${finalEnv.VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET}\n`;
  envContent += `VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID=${finalEnv.VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID}\n`;
  envContent += `VITE_DEVELOPER_CENTRAL_APP_ID=${finalEnv.VITE_DEVELOPER_CENTRAL_APP_ID}\n\n`;

  envContent += `# VAPID Key para Push Notifications\n`;
  envContent += `VITE_FIREBASE_VAPID_KEY=${finalEnv.VITE_FIREBASE_VAPID_KEY}\n\n`;

  envContent += `# Parámetros de Facturación Local\n`;
  envContent += `VITE_DEVELOPER_BILLING_MODE=${finalEnv.VITE_DEVELOPER_BILLING_MODE}\n`;
  envContent += `VITE_DEVELOPER_COMMISSION_PERCENT=${finalEnv.VITE_DEVELOPER_COMMISSION_PERCENT}\n`;
  envContent += `VITE_DEVELOPER_FIXED_SERVICE_FEE=${finalEnv.VITE_DEVELOPER_FIXED_SERVICE_FEE}\n`;
  envContent += `VITE_DEVELOPER_FLAT_MONTHLY_FEE=${finalEnv.VITE_DEVELOPER_FLAT_MONTHLY_FEE}\n`;
  envContent += `VITE_DEVELOPER_ENABLE_DIAN_BILLING=${finalEnv.VITE_DEVELOPER_ENABLE_DIAN_BILLING}\n`;
  envContent += `VITE_DEVELOPER_COSTO_POR_FACTURA_DIAN=${finalEnv.VITE_DEVELOPER_COSTO_POR_FACTURA_DIAN}\n`;

  await fs.writeFile(envPath, envContent, 'utf8');
  log(`   ✅ Archivo .env.local sincronizado y auto-curado.`, 'success');

  const configPath = path.join(clientPath, 'src', 'config', 'firebaseConfig.js');
  await auditAndPatchFirebaseConfig(configPath, log);

  await auditAndPatchServiceWorker(clientPath, corePath, {
    apiKey: finalEnv.VITE_FIREBASE_API_KEY,
    authDomain: finalEnv.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: finalEnv.VITE_FIREBASE_PROJECT_ID,
    storageBucket: finalEnv.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: finalEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: finalEnv.VITE_FIREBASE_APP_ID
  }, log);

  await auditAndPatchScripts(clientPath, corePath, log);
  await auditAndPatchFirebaseJson(clientPath, log);
  log(`✅ PRE-FLIGHT VALIDATION COMPLETADA SIN ERRORES CRÍTICOS.`, 'success');
}


async function checkCoreTemplateDrift(fuente, destino) {
  try {
    const filesInFuente = await fs.readdir(fuente);
    const localDocFolders = filesInFuente.filter(file => file.startsWith('Documentacion') && file !== 'Documentacion PROTOTIPE');

    const SYNC_PATHS = [
      ...localDocFolders,
      'src/components',
      'src/hooks',
      'src/services',
      'src/store',
      'src/layouts',
      'src/pages',
      'src/routes',
      'src/utils',
      'src/constants',
      'src/schemas',
      'src/types',
      'src/providers',
      'src/config',
      'src/App.jsx',
      'src/App.css',
      'src/index.css',
      'src/main.jsx',
      'index.html',
      'public',
      'firestore.indexes.json',
      'firestore.rules',
      'storage.rules',
      'vite.config.js',
      'eslint.config.js',
      'GEMINI.md',
      'flujos_aplicacion.md',
      'mapa_arquitectura.md',
      'mapa_arquitectura_ia.md',
      'package.json',
      'scripts',
      'scratch'
    ];

    const EXCLUDE_PATTERNS = [
      '.env.local',
      '.firebaserc',
      'package-lock.json',
      'node_modules'
    ];

    const getSyncFilesRecursive = async (dir, baseDir = dir) => {
      let results = [];
      if (!await fs.pathExists(dir)) return results;
      const list = await fs.readdir(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

        const isExcluded = EXCLUDE_PATTERNS.some(exclude => {
          return relativePath === exclude || relativePath.startsWith(exclude + '/');
        });

        if (isExcluded) continue;

        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
          const subFiles = await getSyncFilesRecursive(fullPath, baseDir);
          results = results.concat(subFiles);
        } else {
          results.push(relativePath);
        }
      }
      return results;
    };

    const getFileHash = async (filePath) => {
      try {
        const content = await fs.readFile(filePath);
        return crypto.createHash('md5').update(content).digest('hex');
      } catch (_) {
        return null;
      }
    };

    for (const item of SYNC_PATHS) {
      const srcItemPath = path.join(fuente, item);
      if (!await fs.pathExists(srcItemPath)) continue;

      const stat = await fs.stat(srcItemPath);
      if (stat.isDirectory()) {
        const relativeFiles = await getSyncFilesRecursive(srcItemPath, fuente);
        for (const relative of relativeFiles) {
          const destPath = path.join(destino, relative);
          if (!await fs.pathExists(destPath)) {
            return true; // Archivo nuevo
          }
          const srcPath = path.join(fuente, relative);
          const hashSrc = await getFileHash(srcPath);
          const hashDest = await getFileHash(destPath);
          if (hashSrc !== hashDest) {
            return true; // Contenido difiere
          }
        }
      } else {
        const destPath = path.join(destino, item);
        if (!await fs.pathExists(destPath)) {
          return true; // Archivo nuevo
        }
        const hashSrc = await getFileHash(srcItemPath);
        const hashDest = await getFileHash(destPath);
        if (hashSrc !== hashDest) {
          return true; // Contenido difiere
        }
      }
    }
  } catch (_) {
    return true; // Si hay error de lectura, asumimos que requiere sync
  }

  return false;
}

function incrementSemverPatch(version) {
  if (!version) return '1.0.0';
  const parts = version.split('.');
  if (parts.length === 3) {
    const patch = parseInt(parts[2], 10);
    if (!isNaN(patch)) {
      parts[2] = String(patch + 1);
      return parts.join('.');
    }
  }
  return version;
}


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/instancias/sync-and-deploy-stream (SSE)
// Sincroniza físicamente archivos Core → Instancias Cliente + build + deploy.
// Preserva .env.local, .firebaserc, firebase.json y otros archivos de marca.
// Query: templateKey (string), clientIds (CSV de folderNames), deploy (bool)
// Eventos SSE: log, client-status, complete
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/instancias/sync-and-deploy-stream', async (req, res) => {
  const { templateKey, clientIds, deploy } = req.query;
  const doDeploy = deploy === 'true';

  if (!templateKey || !clientIds) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos: templateKey, clientIds.' });
  }

  const folderNames = clientIds.split(',').map(s => s.trim()).filter(Boolean);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Keepalive para evitar timeouts en builds largos
  const keepAlive = setInterval(() => {
    try {
      if (!res.writableEnded && !res.finished && res.socket && !res.socket.destroyed) {
        res.write(': keepalive\n\n');
      }
    } catch (_) {}
  }, 15000);

  const send = (type, data) => {
    try {
      if (!res.writableEnded && !res.finished && res.socket && !res.socket.destroyed) {
        res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
      }
    } catch (_) {}
  };

  const log = (text, type = 'info') => send('log', { text, type });
  const clientStatus = (client, status, error) => send('client-status', { client, status, ...(error ? { error } : {}) });

  try {
    const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
    const registro = await fs.readJson(registroPath);
    const templateConfig = registro.plantillas?.[templateKey];

    if (!templateConfig) {
      log(`❌ Plantilla "${templateKey}" no registrada en plantillas_registro.json.`, 'error');
      send('complete', { success: false });
      clearInterval(keepAlive);
      return res.end();
    }

    const corePath = templateConfig.fuente;
    if (!await fs.pathExists(corePath)) {
      log(`❌ La ruta del core no existe en disco: ${corePath}`, 'error');
      send('complete', { success: false });
      clearInterval(keepAlive);
      return res.end();
    }

    // Leer versión real del core (registro es fuente de verdad)
    let coreVersion = templateConfig.version;
    try {
      const pkg = await fs.readJson(path.join(corePath, 'package.json'));
      // Solo usar package.json si el registro no tiene versión y el package tiene una válida
      if (!coreVersion && pkg.version && pkg.version !== '0.0.0') coreVersion = pkg.version;
    } catch (_) {}

    log(`🚀 Motor de Sincronización Física — Prototipe CLI`, 'header');
    log(`📦 Core: ${path.basename(corePath)} (v${coreVersion})`, 'info');
    log(`👥 Clientes: ${folderNames.join(', ')}`, 'info');
    log(`🚢 Deploy Firebase: ${doDeploy ? 'ACTIVADO' : 'DESACTIVADO'}`, doDeploy ? 'success' : 'warn');
    log('──────────────────────────────────────────────────', 'info');

    let allSuccess = true;

    for (const folderName of folderNames) {
      const clientPath = await findProjectDir(folderName);

      log(`\n🔄 [${folderName}] Iniciando sincronización...`, 'header');
      clientStatus(folderName, 'syncing');

      if (!clientPath || !await fs.pathExists(clientPath)) {
        log(`❌ Directorio de cliente no encontrado para: ${folderName}`, 'error');
        clientStatus(folderName, 'error', 'Directorio no encontrado');
        allSuccess = false;
        continue;
      }

      // Pre-flight Validation & Auto-Healing Pipeline (CORE-089)
      try {
        await validateClientIntegrityBeforeSync(corePath, clientPath, folderName, log);
      } catch (validationErr) {
        log(`❌ Fallo crítico en validación pre-flight: ${validationErr.message}`, 'error');
        clientStatus(folderName, 'error', validationErr.message);
        allSuccess = false;
        continue;
      }

      const backupDir = path.join(clientPath, '.temp_backup_sync');

      try {
        // ── Fase 1: Detectar diferencias (copia diferencial por hash) ──────
        log(`   📊 Comparando archivos core vs cliente...`, 'info');
        const coreFiles = await getSyncFilesRecursiveAsync(corePath);
        const changes = [];

        for (const file of coreFiles) {
          const coreFile = path.join(corePath, file);
          const clientFile = path.join(clientPath, file);
          if (!await fs.pathExists(clientFile)) {
            changes.push({ file, type: 'NUEVO' });
          } else {
            const hashCore = await getSyncFileHashAsync(coreFile);
            const hashClient = await getSyncFileHashAsync(clientFile);
            if (hashCore !== hashClient) changes.push({ file, type: 'MODIFICADO' });
          }
        }

        if (changes.length === 0) {
          log(`   ✨ [${folderName}] Ya está al día con la plantilla core. Sin cambios pendientes.`, 'success');
          clientStatus(folderName, 'success');
          continue;
        }

        const newCount = changes.filter(c => c.type === 'NUEVO').length;
        const modCount = changes.filter(c => c.type === 'MODIFICADO').length;
        log(`   📝 ${changes.length} cambio(s): ${newCount} nuevos, ${modCount} modificados`, 'info');

        // ── Fase 2: Backup temporal de seguridad ───────────────────────────
        log(`   💾 Creando backup temporal antes de modificar...`, 'info');
        await fs.ensureDir(backupDir);

        for (const change of changes) {
          const clientFile = path.join(clientPath, change.file);
          if (await fs.pathExists(clientFile)) {
            const backupFile = path.join(backupDir, change.file);
            await fs.ensureDir(path.dirname(backupFile));
            await fs.copy(clientFile, backupFile);
          }
        }

        // ── Fase 3: Copiar archivos del core al cliente ────────────────────
        log(`   📋 Aplicando cambios del core al cliente...`, 'info');
        for (const change of changes) {
          const coreFile = path.join(corePath, change.file);
          const clientFile = path.join(clientPath, change.file);
          await fs.ensureDir(path.dirname(clientFile));
          await fs.copy(coreFile, clientFile, { overwrite: true });
          const prefix = change.type === 'NUEVO' ? '+ [NUEVO]      ' : '~ [ACTUALIZADO]';
          log(`      ${prefix} ${change.file}`, 'stdout');
        }

        // ── Fase 4: Build de integridad ────────────────────────────────────
        log(`   🛠️  Compilando proyecto para validar integridad...`, 'info');
        clientStatus(folderName, 'building');

        await new Promise((resolve, reject) => {
          const buildProc = spawn('npm', ['run', 'build'], {
            cwd: clientPath,
            shell: true,
            env: { ...process.env, FORCE_COLOR: '0' }
          });
          buildProc.stdout.on('data', data => {
            data.toString().split(/\r?\n/).filter(l => l.trim())
              .forEach(l => log(`      ${l}`, 'stdout'));
          });
          buildProc.stderr.on('data', data => {
            data.toString().split(/\r?\n/).filter(l => l.trim())
              .forEach(l => log(`      ⚠ ${l}`, 'stderr'));
          });
          buildProc.on('close', code => code === 0 ? resolve() : reject(new Error(`Build falló con código ${code}`)));
          buildProc.on('error', reject);
        });

        log(`   ✅ Compilación aprobada sin errores.`, 'success');

        // ── Fase 5: Limpiar backup + actualizar versión en metadata ────────
        await fs.remove(backupDir);

        const metaPath = path.join(clientPath, '.prototipe.json');
        if (await fs.pathExists(metaPath)) {
          let meta = await fs.readJson(metaPath);
          meta = validatePrototipeMetadata(meta, folderName);
          meta.version = coreVersion;
          await fs.writeJson(metaPath, meta, { spaces: 2 });
          log(`   🏷️  Metadata actualizada: v${meta.version} → v${coreVersion} en .prototipe.json`, 'success');
        }

        // ── Fase 6: Deploy Firebase (opcional) ────────────────────────────
        if (doDeploy) {
          log(`   🚀 Desplegando a Firebase Hosting...`, 'info');
          clientStatus(folderName, 'deploying');

          await new Promise((resolve, reject) => {
            const deployProc = spawn('firebase', ['deploy', '--only', 'hosting'], {
              cwd: clientPath,
              shell: true,
              env: { ...process.env, FORCE_COLOR: '0' }
            });
            deployProc.stdout.on('data', data => {
              data.toString().split(/\r?\n/).filter(l => l.trim())
                .forEach(l => log(`      ${l}`, 'stdout'));
            });
            deployProc.stderr.on('data', data => {
              data.toString().split(/\r?\n/).filter(l => l.trim())
                .forEach(l => log(`      ${l}`, 'stderr'));
            });
            deployProc.on('close', code => code === 0 ? resolve() : reject(new Error(`Firebase deploy falló con código ${code}`)));
            deployProc.on('error', reject);
          });

          log(`   ✅ [${folderName}] Desplegado en Firebase Hosting exitosamente.`, 'success');
        }

        log(`   🎉 [${folderName}] Sincronización completada.`, 'success');
        clientStatus(folderName, 'success');

      } catch (err) {
        log(`   ❌ Error en [${folderName}]: ${err.message}`, 'error');

        // ── Rollback automático ────────────────────────────────────────────
        if (await fs.pathExists(backupDir)) {
          log(`   🔄 Ejecutando rollback de seguridad...`, 'warn');
          try {
            const backupFiles = await getSyncFilesRecursiveAsync(backupDir, backupDir);
            for (const file of backupFiles) {
              await fs.copy(path.join(backupDir, file), path.join(clientPath, file), { overwrite: true });
            }
            await fs.remove(backupDir);
            log(`   ✅ Rollback completado. Cliente restaurado a su estado original.`, 'warn');
          } catch (rollbackErr) {
            log(`   💀 Fallo crítico en rollback: ${rollbackErr.message}`, 'error');
          }
        }

        clientStatus(folderName, 'error', err.message);
        allSuccess = false;
      }
    }

    log('\n──────────────────────────────────────────────────', 'info');
    log(
      allSuccess
        ? '🎉 Sincronización global completada con éxito.'
        : '⚠ Sincronización finalizada con algunos errores. Revisar logs.',
      allSuccess ? 'success' : 'warn'
    );
    send('complete', { success: allSuccess });

  } catch (err) {
    log(`❌ Error crítico global: ${err.message}`, 'error');
    send('complete', { success: false, error: err.message });
  } finally {
    clearInterval(keepAlive);
    try { if (!res.writableEnded && !res.finished) res.end(); } catch (_) {}
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS Y ENDPOINTS PARA FIREBASE RULES DRIFT SCAN & DEPLOY (Propuesta 2)
// ─────────────────────────────────────────────────────────────────────────────
import os from 'os';

// Helper para obtener el Access Token activo de Firebase CLI
async function getFirebaseAccessToken(forceRefresh = false) {
  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  if (!await fs.pathExists(configPath)) {
    throw new Error('No se encontró la sesión activa de Firebase CLI. Ejecuta "firebase login".');
  }
  const config = await fs.readJson(configPath);
  const tokens = config.tokens;
  if (!tokens) {
    throw new Error('No hay tokens guardados en Firebase CLI. Ejecuta "firebase login".');
  }

  // Si el access_token no ha expirado y no se solicita refresco forzado, usarlo directamente
  if (!forceRefresh && tokens.access_token && tokens.expires_at && tokens.expires_at > Date.now()) {
    return tokens.access_token;
  }

  // Refrescar el token usando OAuth2
  const clientId = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        refresh_token: tokens.refresh_token
      })
    });
    const data = await res.json();
    if (data.access_token) {
      tokens.access_token = data.access_token;
      tokens.expires_at = Date.now() + (data.expires_in * 1000) - 60000;
      await fs.writeJson(configPath, config, { spaces: 2 });
      return data.access_token;
    }
  } catch (err) {
    console.error('[Firebase Token Refresh Error]:', err.message);
  }

  if (tokens.access_token) {
    return tokens.access_token;
  }
  throw new Error('No se pudo refrescar el token de Firebase.');
}

// Helper autocurativo para restaurar o inicializar reglas del Core si faltasen físicamente
async function autoHealCoreRules(corePath, type, cloudRules) {
  const fileName = type === 'firestore' ? 'firestore.rules' : 'storage.rules';
  const filePath = path.join(corePath, fileName);
  
  if (await fs.pathExists(filePath)) {
    return await fs.readFile(filePath, 'utf8');
  }

  console.log(`[Autocuración] El Core en "${corePath}" no tiene el archivo "${fileName}". Generándolo...`);
  
  let contentToSave = '';
  if (cloudRules && cloudRules.trim() && !cloudRules.includes('Error') && !cloudRules.includes('Permission denied')) {
    contentToSave = cloudRules;
    console.log(`[Autocuración] Poblado "${fileName}" con las reglas activas de la nube.`);
  } else {
    if (type === 'firestore') {
      contentToSave = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper de validación de administrador global
    function isAdmin() {
      return request.auth != null && 
        exists(/databases/\$(database)/documents/users/\$(request.auth.uid)) &&
        get(/databases/\$(database)/documents/users/\$(request.auth.uid)).data.role == 'admin';
    }

    // Aislamiento multitenant de la telemetría del cliente
    match /clientes_control/{clientId} {
      allow read: if request.auth != null && (clientId == request.auth.token.clientId || isAdmin());
      allow write: if isAdmin();
    }

    // Colección de usuarios
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && (request.auth.uid == userId || isAdmin());
    }

    // Telemetría y errores
    match /app_failures/{failureId} {
      allow create: if request.auth != null;
      allow read, update, delete: if isAdmin();
    }
    match /reportesBilling/{reportId} {
      allow create: if request.auth != null;
      allow read, update, delete: if isAdmin();
    }

    // Regla de fallback
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
`;
    } else {
      contentToSave = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper de validación de administrador cruzando con Firestore
    function isAdminUser() {
      return request.auth != null &&
        firestore.exists(/databases/(default)/documents/users/\$(request.auth.uid)) &&
        firestore.get(/databases/(default)/documents/users/\$(request.auth.uid)).data.role == 'admin';
    }

    // Escrituras a recursos generales de marca o core requieren rol admin
    match /brand/{allPaths=**} {
      allow read: if true;
      allow write: if isAdminUser();
    }
    match /core/{allPaths=**} {
      allow read: if true;
      allow write: if isAdminUser();
    }

    // El resto de los directorios de usuario
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
`;
    }
    console.log(`[Autocuración] Poblado "${fileName}" con plantilla restrictiva por defecto.`);
  }

  await fs.ensureDir(corePath);
  await fs.writeFile(filePath, contentToSave, 'utf-8');

  // Asegurar indexes.json
  if (type === 'firestore') {
    const indexesPath = path.join(corePath, 'firestore.indexes.json');
    if (!await fs.pathExists(indexesPath)) {
      await fs.writeFile(indexesPath, JSON.stringify({ indexes: [], fieldOverrides: [] }, null, 2) + '\n', 'utf-8');
    }
  }

  // Asegurar firebase.json
  const firebaseJsonPath = path.join(corePath, 'firebase.json');
  if (!await fs.pathExists(firebaseJsonPath)) {
    const firebaseJsonDefault = JSON.stringify({
      firestore: { rules: "firestore.rules", indexes: "firestore.indexes.json" },
      storage: { rules: "storage.rules" }
    }, null, 2) + '\n';
    await fs.writeFile(firebaseJsonPath, firebaseJsonDefault, 'utf-8');
  }

  return contentToSave;
}

// Helper para descargar las reglas vigentes en la nube
async function getCloudFirebaseRules(projectId, type, accessToken, storageBucket = '') {
  const releasesUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`;
  try {
    const resReleases = await fetch(releasesUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!resReleases.ok) {
      const errData = await resReleases.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP ${resReleases.status}`);
    }
    const dataReleases = await resReleases.json();
    const releases = dataReleases.releases || [];

    const targetRelease = releases.find(r => {
      const name = r.name || '';
      if (type === 'firestore') {
        return name.endsWith('/cloud.firestore');
      } else {
        if (storageBucket) {
          return name.endsWith(`/firebase.storage/${storageBucket}`);
        }
        return name.includes('/firebase.storage');
      }
    });

    if (!targetRelease || !targetRelease.rulesetName) {
      return null; // Sin reglas
    }

    const rulesetUrl = `https://firebaserules.googleapis.com/v1/${targetRelease.rulesetName}`;
    const resRuleset = await fetch(rulesetUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!resRuleset.ok) {
      const errData = await resRuleset.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP ${resRuleset.status}`);
    }
    const dataRuleset = await resRuleset.json();
    const files = dataRuleset.source?.files || [];
    if (files.length > 0) {
      return files[0].content || '';
    }
    return '';
  } catch (err) {
    console.warn(`[CloudRules] Error rules get (${type}) para ${projectId}:`, err.message);
    throw err;
  }
}

// Endpoint para el escaneo de drift global de reglas Firebase
app.get('/api/project/firebase-rules/drift-global', async (req, res) => {
  if (!await fs.pathExists(GIT_INSTANCES_DIR)) {
    return res.json({ success: true, driftMatrix: [] });
  }

  try {
    const accessToken = await getFirebaseAccessToken();
    const topDirs = await fs.readdir(GIT_INSTANCES_DIR);
    const candidates = [];
    for (const dir of topDirs) {
      const fullPath = path.join(GIT_INSTANCES_DIR, dir);
      const stat = await fs.stat(fullPath).catch(() => null);
      if (!stat || !stat.isDirectory()) continue;

      if (await fs.pathExists(path.join(fullPath, '.prototipe.json'))) {
        candidates.push({ folderName: dir, fullPath });
      } else {
        const subDirs = await fs.readdir(fullPath).catch(() => []);
        for (const subDir of subDirs) {
          const subFullPath = path.join(fullPath, subDir);
          const subStat = await fs.stat(subFullPath).catch(() => null);
          if (!subStat || !subStat.isDirectory()) continue;
          if (await fs.pathExists(path.join(subFullPath, '.prototipe.json'))) {
            candidates.push({ folderName: subDir, fullPath: subFullPath });
          }
        }
      }
    }

    const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
    const registro = await fs.readJson(registroPath);
    const plantillas = registro.plantillas || {};

    const results = [];

    await Promise.all(candidates.map(async (candidate) => {
      const { folderName, fullPath } = candidate;
      const metaPath = path.join(fullPath, '.prototipe.json');
      let meta = await fs.pathExists(metaPath) ? await fs.readJson(metaPath) : {};
      meta = validatePrototipeMetadata(meta, folderName);

      const clientId = meta.clientId || folderName;
      const projectName = meta.projectName || folderName;
      const templateKey = meta.template;
      if (!templateKey || !plantillas[templateKey]) return;

      const corePath = plantillas[templateKey].fuente;

      let firebaseProjectId = meta.firebaseProjectId || '';
      let storageBucket = '';

      const envPath = path.join(fullPath, '.env.local');
      if (await fs.pathExists(envPath)) {
        const envContent = await fs.readFile(envPath, 'utf8');
        const idMatch = envContent.match(/VITE_FIREBASE_PROJECT_ID\s*=\s*(.+)/);
        if (idMatch && idMatch[1]) {
          firebaseProjectId = idMatch[1].trim().replace(/['"]/g, '');
        }
        const bucketMatch = envContent.match(/VITE_FIREBASE_STORAGE_BUCKET\s*=\s*(.+)/);
        if (bucketMatch && bucketMatch[1]) {
          storageBucket = bucketMatch[1].trim().replace(/['"]/g, '');
        }
      }

      if (!firebaseProjectId) {
        const rcPath = path.join(fullPath, '.firebaserc');
        if (await fs.pathExists(rcPath)) {
          const rc = await fs.readJson(rcPath).catch(() => ({}));
          firebaseProjectId = rc.projects?.default || '';
        }
      }

      if (!firebaseProjectId) return;

      // 1. Obtener reglas de la nube primero
      let cloudFirestoreRules = null;
      let cloudStorageRules = null;
      let firestoreError = null;
      let storageError = null;

      try {
        cloudFirestoreRules = await getCloudFirebaseRules(firebaseProjectId, 'firestore', accessToken);
      } catch (err) {
        firestoreError = err.message;
      }

      try {
        cloudStorageRules = await getCloudFirebaseRules(firebaseProjectId, 'storage', accessToken, storageBucket);
      } catch (err) {
        storageError = err.message;
      }

      // 2. Reglas locales autocurativas
      let localFirestoreRules = '';
      try {
        localFirestoreRules = await autoHealCoreRules(corePath, 'firestore', cloudFirestoreRules);
      } catch (err) {
        console.error(`[Autocuración Error] Fallo en firestore.rules para el core "${templateKey}": ${err.message}`);
      }

      let localStorageRules = '';
      try {
        localStorageRules = await autoHealCoreRules(corePath, 'storage', cloudStorageRules);
      } catch (err) {
        console.error(`[Autocuración Error] Fallo en storage.rules para el core "${templateKey}": ${err.message}`);
      }

      const cleanRules = (rules) => (rules || '').replace(/\r\n/g, '\n').trim();

      const firestoreDrift = cleanRules(localFirestoreRules) !== cleanRules(cloudFirestoreRules);
      const storageDrift = cleanRules(localStorageRules) !== cleanRules(cloudStorageRules);

      results.push({
        clientId,
        projectName,
        firebaseProjectId,
        templateKey,
        firestore: {
          hasLocal: !!localFirestoreRules,
          hasCloud: cloudFirestoreRules !== null,
          drift: firestoreDrift,
          error: firestoreError,
          local: localFirestoreRules,
          cloud: cloudFirestoreRules || ''
        },
        storage: {
          hasLocal: !!localStorageRules,
          hasCloud: cloudStorageRules !== null,
          drift: storageDrift,
          error: storageError,
          local: localStorageRules,
          cloud: cloudStorageRules || ''
        }
      });
    }));

    res.json({ success: true, driftMatrix: results });
  } catch (err) {
    res.status(500).json({ error: `Error en drift global de Firebase: ${err.message}` });
  }
});

// Endpoint para desplegar reglas selectivamente a Firebase
app.post('/api/project/firebase-rules/deploy', async (req, res) => {
  const { clientId, type } = req.body;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });

  let firebaseProjectId = '';
  const envPath = path.join(projectDir, '.env.local');
  if (await fs.pathExists(envPath)) {
    const envContent = await fs.readFile(envPath, 'utf8');
    const idMatch = envContent.match(/VITE_FIREBASE_PROJECT_ID\s*=\s*(.+)/);
    if (idMatch && idMatch[1]) {
      firebaseProjectId = idMatch[1].trim().replace(/['"]/g, '');
    }
  }

  if (!firebaseProjectId) {
    const rcPath = path.join(projectDir, '.firebaserc');
    if (await fs.pathExists(rcPath)) {
      const rc = await fs.readJson(rcPath).catch(() => ({}));
      firebaseProjectId = rc.projects?.default || '';
    }
  }

  if (!firebaseProjectId) {
    return res.status(400).json({ error: `No se configuró un Firebase Project ID para la instancia "${clientId}".` });
  }

  let deployOnly = '';
  if (type === 'firestore') {
    deployOnly = 'firestore:rules';
  } else if (type === 'storage') {
    deployOnly = 'storage';
  } else {
    deployOnly = 'firestore:rules,storage';
  }

  try {
    const fbJsonPath = path.join(projectDir, 'firebase.json');
    if (!await fs.pathExists(fbJsonPath)) {
      const metaPath = path.join(projectDir, '.prototipe.json');
      if (await fs.pathExists(metaPath)) {
        const meta = await fs.readJson(metaPath);
        const templateKey = meta.template;
        const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
        if (await fs.pathExists(registroPath)) {
          const registro = await fs.readJson(registroPath);
          const corePath = registro.plantillas?.[templateKey]?.fuente;
          if (corePath) {
            const coreFbJson = path.join(corePath, 'firebase.json');
            if (await fs.pathExists(coreFbJson)) {
              await fs.copy(coreFbJson, fbJsonPath);
            }
          }
        }
      }
    }

    const tokenSuffix = process.env.FIREBASE_TOKEN ? ` --token "${process.env.FIREBASE_TOKEN}"` : '';
    const cmd = `firebase deploy --only ${deployOnly} -P ${firebaseProjectId}${tokenSuffix}`;
    const { stdout } = await execAsync(cmd, { cwd: projectDir });
    res.json({ success: true, message: `Reglas de Firebase desplegadas con éxito.`, output: stdout });
  } catch (err) {
    console.error(`[Firebase Rules Deploy Error]:`, err.message);
    res.status(500).json({ error: `Error al desplegar reglas Firebase: ${err.message}`, details: err.stderr || err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/roadmap
// Parsea y expone las tareas pendientes y completadas de tareas_pendientes.md
// ─────────────────────────────────────────────────────────────────────────────
// Helper común para parsear el contenido de tareas_pendientes.md con detalles completos
function parseRoadmapContent(content) {
  const lines = content.split(/\r?\n/);
  const tasks = [];
  
  // Regex tolerante: detecta [ ] y [x] con o sin negritas (**), tachados (~~),
  // guiones o asteriscos como viñeta, e identificadores en cualquier formato.
  const bulletRegex = /^\s*[-*]\s+(?:\*\*)?\[( |x)\]\s+(?:~~)?(.+?)(?:~~)?(?:\*\*)?\s*$/i;

  // ── inferDomains ──────────────────────────────────────────────────────────
  // Retorna un array de dominios reales para una tarea combinando 2 capas:
  //  Capa 1: Rutas físicas de los archivos en el bloque - Archivos:
  //  Capa 2: Palabras clave en el título (fallback si no hay archivos)
  // Permite multi-dominio: una tarea CLI + DASH aparece en ambos filtros.
  const inferDomains = (idDomain, archivos, titleText) => {
    const set = new Set();

    // Capa 1 — rutas de archivos (más confiable, orden importa: TPL antes que CLI)
    const PATH_MAP = [
      { pattern: /prototipe-cli[\\/]templates/i,                      domain: 'TPL'  },
      { pattern: /prototipe-cli/i,                                    domain: 'CLI'  },
      { pattern: /dev-dashboard/i,                                    domain: 'DASH' },
      { pattern: /instancias.clientes/i,                              domain: 'INST' },
      { pattern: /plantillas.core/i,                                  domain: 'PLT'  },
      { pattern: /documentacion.prototipe/i,                          domain: 'DOC'  },
      { pattern: /landing|portada|marketing|public|index\.html$/i,    domain: 'LND'  },
      { pattern: /05_Estrategia|08_Plan_Escalabilidad|negocio|commercial/i, domain: 'BIZ'  },
    ];
    for (const { url = '', name = '' } of archivos) {
      const str = url + '|' + name;
      for (const { pattern, domain } of PATH_MAP) {
        if (pattern.test(str)) { set.add(domain); break; }
      }
    }

    // Capa 2 — keywords del título (fallback cuando no hay archivos detectados)
    if (set.size === 0) {
      const t = titleText.toLowerCase();
      if (/server\.js|generator\.js|worker|cli.bridge|prototipe-cli/i.test(t))  set.add('CLI');
      if (/dashboard|panel|sandbox|roadmap|skills|componente|biblioteca/i.test(t)) set.add('DASH');
      if (/template|plantilla.base|seed\.json|template-ventas/i.test(t))         set.add('TPL');
      if (/plantilla.core|app.ventas/i.test(t))                                  set.add('PLT');
      if (/instancia|cliente|onboarding|marca/i.test(t))                         set.add('INST');
      if (/documentaci|bit[aá]cora|mapa_aplicacion|tareas_pendientes|agents\.md|gemini\.md/i.test(t)) set.add('DOC');
      if (/landing|web.publica|marketing|conversión|embudo|landing\.html|portada/i.test(t)) set.add('LND');
      if (/estrategia|negocio|precio|pricing|comercial|ventas.b2b|corporate|marca\.corporativa/i.test(t)) set.add('BIZ');
    }

    // Fallback final: si ninguna capa infirió nada → usar el prefijo del ID
    if (set.size === 0) set.add(idDomain);

    return [...set];
  };

  lines.forEach((line, index) => {
    const match = line.match(bulletRegex);
    if (match) {
      const completed = match[1].toLowerCase() === 'x';
      const rawText = match[2].trim();

      // Extraer ID — soporta todos los prefijos del ecosistema (CORE, CLI, DASH, etc.) 
      // y también prefijos especiales con guiones múltiples como HOTFIX-TELEMETRIA-002, CLIENTE-MONI-001, E2E-Hotfix
      const idRegex = /(?:(CORE|CLI|DASH|TPL|PLT|INST|DOC|LND|BIZ|HOTFIX|CLIENTE|E2E|COMP|LINE)-([A-Z0-9_-]+)|Tarea\s+([A-Z0-9_-]+)|([A-Z0-9_-]+)(?=\s*:))/i;
      const idMatch = rawText.match(idRegex);
      let id, domain;
      if (idMatch) {
        if (idMatch[1]) {
          domain = idMatch[1].toUpperCase();
          id = `${domain}-${idMatch[2].toUpperCase()}`;
        } else if (idMatch[3]) {
          id = idMatch[3].toUpperCase();
          const parts = id.split('-');
          domain = parts[0] || 'CORE';
        } else {
          id = idMatch[4].toUpperCase();
          const parts = id.split('-');
          domain = parts[0] || 'CORE';
        }
      } else {
        id = `LINE-${index}`;
        domain = 'CORE';
      }

      // --- Extraer bloque de detalle hasta próximo item o EOF ---
      const detail = { estatus: '', fecha: '', fechaFin: '', descripcion: [], archivos: [] };
      let inArchivos = false;
      let i = index + 1;
      while (i < lines.length) {
        const l = lines[i];
        if (l.match(/^\s*[-*]\s+(?:\*\*)?\[[ x]\]/i)) break;
        const trimmed = l.trim();
        if (!trimmed) { i++; continue; }

        if (trimmed.match(/^-\s*Estatus:/i)) {
          detail.estatus = trimmed.replace(/^-\s*Estatus:\s*/i, '').trim();
          inArchivos = false;

        } else if (trimmed.match(/^-\s*Descripci[oó]n:/i)) {
          const descText = trimmed.replace(/^-\s*Descripci[oó]n:\s*/i, '').trim();
          if (descText) detail.descripcion.push(descText);
          inArchivos = false;

        } else if (trimmed.match(/^-\s*Fecha(?:\s+de\s+registro)?:/i)) {
          detail.fecha = trimmed.replace(/^-\s*Fecha(?:\s+de\s+registro)?:\s*/i, '').trim();
          inArchivos = false;
        } else if (trimmed.match(/^-\s*Fecha\s+de\s+finalizaci[oó]n:/i)) {
          detail.fechaFin = trimmed.replace(/^-\s*Fecha\s+de\s+finalizaci[oó]n:\s*/i, '').trim();
          inArchivos = false;

        } else if (trimmed.match(/^-\s*Archivos:/i)) {
          const inlineRest = trimmed.replace(/^-\s*Archivos:\s*/i, '').trim();
          if (inlineRest) {
            const inlineFileRegex = /\[`?([^`\]]+)`?\]\(([^)]+)\)(?:\s*\[([A-Z/]+)\])?/g;
            let fm;
            while ((fm = inlineFileRegex.exec(inlineRest)) !== null) {
              detail.archivos.push({ name: fm[1], url: fm[2], action: fm[3] || 'MODIFY' });
            }
          }
          inArchivos = true;

        } else if (inArchivos) {
          const fileMatch = trimmed.match(/^-?\s*\[`?([^`\]]+)`?\]\(([^)]+)\)(?:\s*\[([A-Z/]+)\])?/);
          if (fileMatch) {
            detail.archivos.push({
              name: fileMatch[1],
              url: fileMatch[2],
              action: fileMatch[3] || 'MODIFY'
            });
          }
        } else if (trimmed.match(/^\d+\.\s/)) {
          const fileMatch = trimmed.replace(/^\d+\.\s/, '').match(/^\[`?([^`\]]+)`?\]\(([^)]+)\)(?:\s*\[([A-Z/]+)\])?/);
          if (fileMatch) {
            detail.archivos.push({
              name: fileMatch[1],
              url: fileMatch[2],
              action: fileMatch[3] || 'MODIFY'
            });
          } else {
            detail.descripcion.push(trimmed);
          }
        } else if (trimmed.startsWith('- ') && !inArchivos) {
          const fileMatch = trimmed.replace(/^-\s*/, '').match(/^\[`?([^`\]]+)`?\]\(([^)]+)\)(?:\s*\[([A-Z/]+)\])?/);
          if (fileMatch) {
            detail.archivos.push({
              name: fileMatch[1],
              url: fileMatch[2],
              action: fileMatch[3] || 'MODIFY'
            });
          } else {
            detail.descripcion.push(trimmed);
          }
        }
        i++;
      }

      const domains = inferDomains(domain, detail.archivos, rawText);
      tasks.push({ id, domain, domains, text: rawText, completed, lineIndex: index, rawLine: line, detail });
    }
  });

  return tasks;
}

app.get('/api/roadmap', async (req, res) => {
  try {
    const roadmapPath = path.join(GIT_ROOT, 'Documentacion PROTOTIPE', '02_Tareas_Roadmap', 'tareas_pendientes.md');
    
    // Autocreación del archivo si no existe (Graceful Degradation)
    if (!await fs.pathExists(roadmapPath)) {
      console.warn('[roadmap] tareas_pendientes.md no existe. Creando plantilla base automáticamente...');
      await fs.ensureDir(path.dirname(roadmapPath));
      const plantillaBase = `# Tareas Pendientes\n\n> Archivo generado automáticamente por el CLI de PROTOTIPE.\n> Agrega tareas en formato: \`- [ ] Tarea CORE-XXX: Descripción\`\n\n`;
      await writeFileWithRetry(roadmapPath, plantillaBase, 'utf8');
    }

    const content = await fs.readFile(roadmapPath, 'utf8');
    const tasks = parseRoadmapContent(content);

    // Ordenar: primero por número de tarea descendente (más reciente arriba),
    // usando el prefijo sólo como desempate cuando los números son idénticos.
    // Así CLI-341 aparece antes que CORE-340, sin importar el dominio.
    const PREFIX_ORDER = {
      'CORE': 1,
      'CLI':  2,
      'DASH': 3,
      'TPL':  4,
      'PLT':  5,
      'INST': 6,
      'DOC':  7,
      'LND':  8,
      'BIZ':  9
    };
    tasks.sort((a, b) => {
      const getParts = (id = '') => {
        const m = id.match(/^([A-Z]+)-(\d+)$/i);
        return m ? { prefix: m[1].toUpperCase(), num: parseInt(m[2], 10) } : { prefix: 'OTHER', num: 0 };
      };
      const pA = getParts(a.id);
      const pB = getParts(b.id);
      // 1º — número descendente (criterio principal)
      if (pA.num !== pB.num) return pB.num - pA.num;
      // 2º — prefijo como desempate (CORE < CLI < ... para iguales)
      const wA = PREFIX_ORDER[pA.prefix] || 99;
      const wB = PREFIX_ORDER[pB.prefix] || 99;
      if (wA !== wB) return wA - wB;
      // 3º — alfabético
      return pA.prefix.localeCompare(pB.prefix);
    });

    res.json({ success: true, tasks });
  } catch (err) {
    console.error('Error al obtener el roadmap:', err.message);
    res.status(500).json({ error: `Error de lectura del roadmap: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/roadmap/toggle
// Cambia el estado de una tarea entre pendiente y completada de forma atómica
// ─────────────────────────────────────────────────────────────────────────────
// Cola de escritura exclusiva del roadmap — serializa operaciones leer→modificar→escribir
// para prevenir race conditions (doble-clic, peticiones concurrentes, etc.)
const _roadmapQueue = new WriteQueue();

app.post('/api/roadmap/toggle', (req, res) => {
  const { lineIndex } = req.body;
  if (lineIndex === undefined) {
    return res.status(400).json({ error: 'Falta el parámetro requerido: lineIndex.' });
  }

  // Toda la lógica serializada en la cola: ninguna petición puede leer
  // el archivo mientras otra lo está modificando. Equivalente a un mutex.
  _roadmapQueue.push(async () => {
    try {
      const docRoot = path.join(GIT_ROOT, 'Documentacion PROTOTIPE');
      const roadmapPath = path.join(docRoot, '02_Tareas_Roadmap', 'tareas_pendientes.md');
    
      if (!await fs.pathExists(roadmapPath)) {
        return res.status(404).json({ error: 'No se encontró el archivo de tareas pendientes.' });
      }

      const content = await fs.readFile(roadmapPath, 'utf8');
      const isCrlf = content.includes('\r\n');
      const lines = content.split(/\r?\n/);

      if (lineIndex < 0 || lineIndex >= lines.length) {
        return res.status(400).json({ error: 'Índice de línea fuera de rango.' });
      }

      const targetLine = lines[lineIndex];
      // Regex tolerante: detecta [ ] y [x] con o sin negritas (**) y tachados (~~)
      const toggleMatch = targetLine.match(/^(\s*[-*]\s+)(?:\*\*)?\[( |x)\](\s+)(?:\*\*)?(?:~~)?(.+?)(?:~~)?(?:\*\*)?\s*$/i);
      if (!toggleMatch) {
        return res.status(400).json({ error: 'La línea especificada no es una tarea de Roadmap válida (formato no reconocido).' });
      }

      const isCompleted = toggleMatch[2].toLowerCase() === 'x';
      // Extraer texto limpio (sin ~~ residuales de marcados anteriores)
      const cleanText = toggleMatch[4].replace(/^~~|~~$/g, '').trim();

      let newLine;
      if (!isCompleted) {
        // Marcar completada: [ ] → [x] y envolver texto en ~~tachado~~
        newLine = targetLine
          .replace(/\[ \]/, '[x]')
          .replace(toggleMatch[4], `~~${cleanText}~~`);
      } else {
        // Desmarcar: [x] → [ ] y quitar tachado
        newLine = targetLine
          .replace(/\[x\]/i, '[ ]')
          .replace(`~~${cleanText}~~`, cleanText)
          .replace(/~~(.+?)~~/g, '$1'); // fallback si el texto no estaba tachado
      }

      lines[lineIndex] = newLine;

      // Buscar si las siguientes líneas son del detalle de esta tarea y contienen "- Estatus:"
      // para actualizarlo también de manera física en el archivo markdown.
      let i = lineIndex + 1;
      while (i < lines.length) {
        const nextLine = lines[i];
        // Si encontramos la viñeta de otra tarea o fin de sección de tareas, detenemos la búsqueda
        if (nextLine.match(/^\s*[-*]\s+(?:\*\*)?\[[ x]\]/i)) break;
        
        if (nextLine.trim().startsWith('- Estatus:')) {
          const indentMatch = nextLine.match(/^(\s*)/);
          const indent = indentMatch ? indentMatch[0] : '  ';
          if (!isCompleted) {
            lines[i] = `${indent}- Estatus: Completado.`;
          } else {
            lines[i] = `${indent}- Estatus: Pendiente.`;
          }
          break;
        }
        i++;
      }

      // Backup rotativo: conservar las últimas 5 versiones con timestamp
      const backupDir = path.join(docRoot, '02_Tareas_Roadmap', '.tmp');
      await fs.ensureDir(backupDir);
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupPath = path.join(backupDir, `tareas_pendientes.${ts}.md.bak`);
      await fs.copy(roadmapPath, backupPath);
      // Limpiar backups más antiguos manteniendo solo los últimos 5
      try {
        const backups = (await fs.readdir(backupDir))
          .filter(f => f.endsWith('.md.bak'))
          .sort()
          .reverse();
        for (const old of backups.slice(5)) {
          await fs.remove(path.join(backupDir, old));
        }
      } catch (_) { /* No bloquear si limpieza de backups falla */ }

      const separator = isCrlf ? '\r\n' : '\n';
      await writeFileWithRetry(roadmapPath, lines.join(separator), 'utf8');

      const tasks = parseRoadmapContent(lines.join(separator));
      res.json({ success: true, tasks });
    } catch (err) {
      console.error('Error al actualizar la tarea:', err.message);
      res.status(500).json({ error: `Error de escritura del roadmap: ${err.message}` });
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────────
// POST /api/roadmap/add
// Crea una nueva tarea con ID CORE autoincrementado y la inserta al inicio del archivo
// ───────────────────────────────────────────────────────────────────────────────
// POST /api/roadmap/add
// Crea una nueva tarea con ID autoincrementado basado en su dominio (CORE|CLI|DASH|TPL|PLT|INST|DOC|LND|BIZ)
// ───────────────────────────────────────────────────────────────────────────────
app.post('/api/roadmap/add', (req, res) => {
  const { text, domain } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'El parámetro "text" es obligatorio y no puede estar vacío.' });
  }

  // Validar y sanear el dominio deseado
  const allowedDomains = ['CORE', 'CLI', 'DASH', 'TPL', 'PLT', 'INST', 'DOC', 'LND', 'BIZ'];
  const targetDomain = (domain || 'CORE').toUpperCase();
  if (!allowedDomains.includes(targetDomain)) {
    return res.status(400).json({ error: `Dominio "${domain}" no válido. Valores permitidos: ${allowedDomains.join(', ')}` });
  }

  _roadmapQueue.push(async () => {
    try {
      const roadmapPath = path.join(GIT_ROOT, 'Documentacion PROTOTIPE', '02_Tareas_Roadmap', 'tareas_pendientes.md');
      if (!await fs.pathExists(roadmapPath)) {
        return res.status(404).json({ error: 'No se encontró el archivo de tareas pendientes.' });
      }

      const content = await fs.readFile(roadmapPath, 'utf8');
      const isCrlf = content.includes('\r\n');
      const lines = content.split(/\r?\n/);

      // Calcular el siguiente número disponible para el dominio específico
      let maxNum = 0;
      const domainRegex = new RegExp(`(?:${targetDomain})-(\\d+)`, 'gi');
      let m;
      while ((m = domainRegex.exec(content)) !== null) {
        const n = parseInt(m[1], 10);
        if (n > maxNum) maxNum = n;
      }
      const nextNum = maxNum + 1;
      const newId = `${targetDomain}-${nextNum}`;
      const cleanText = text.trim();
      const today = new Date().toISOString().slice(0, 10);

      // Nueva línea de tarea con su bloque de detalle base
      const newTaskBlock = [
        `* **[ ] Tarea ${newId}: ${cleanText}**`,
        `  - Estatus: Pendiente.`,
        `  - Fecha: ${today}`,
        `  - Descripción: (pendiente de completar)`,
        ``
      ].join(isCrlf ? '\r\n' : '\n');

      // Encontrar la primera línea tras el encabezado del archivo (# y > y blancos)
      let insertAt = 0;
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i].trim();
        if (l.startsWith('#') || l.startsWith('>') || l === '') {
          insertAt = i + 1;
        } else {
          break; // primera línea de contenido real
        }
      }

      // Insertar el bloque al inicio de las tareas
      const separator = isCrlf ? '\r\n' : '\n';
      const newLines = [
        ...lines.slice(0, insertAt),
        ...newTaskBlock.split(separator),
        ...lines.slice(insertAt)
      ];

      // Backup rotativo preventivo
      const backupDir = path.join(GIT_ROOT, 'Documentacion PROTOTIPE', '02_Tareas_Roadmap', '.tmp');
      await fs.ensureDir(backupDir);
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      await fs.copy(roadmapPath, path.join(backupDir, `tareas_pendientes.${ts}.md.bak`));
      try {
        const backups = (await fs.readdir(backupDir)).filter(f => f.endsWith('.md.bak')).sort().reverse();
        for (const old of backups.slice(5)) await fs.remove(path.join(backupDir, old));
      } catch (_) {}

      await writeFileWithRetry(roadmapPath, newLines.join(separator), 'utf8');

      // Parsear y retornar lista actualizada (reutilizando la misma lógica del GET pero con regex extendido)
      const bulletRegex = /^\s*[-*]\s+(?:\*\*)?\[( |x)\]\s+(?:~~)?(.+?)(?:~~)?(?:\*\*)?\s*$/i;
      const tasks = parseRoadmapContent(newLines.join(separator));
      res.json({ success: true, newId, tasks });
    } catch (err) {
      console.error('Error al crear nueva tarea:', err.message);
      res.status(500).json({ error: `Error al escribir nueva tarea: ${err.message}` });
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────────
// POST /api/roadmap/update
// Actualiza la descripción y los archivos de una tarea en su bloque de detalle físico
// ───────────────────────────────────────────────────────────────────────────────
app.post('/api/roadmap/update', async (req, res) => {
  const { lineIndex, descripcion, archivos } = req.body;
  if (lineIndex === undefined) {
    return res.status(400).json({ error: 'El parámetro "lineIndex" es obligatorio.' });
  }

  // Preflight Guard: Validar la existencia física de cada archivo declarado antes de proceder
  if (archivos && Array.isArray(archivos)) {
    for (const file of archivos) {
      if (!file || !file.name) continue;
      const cleanName = file.name.trim();
      let absPath = '';
      
      if (file.url && file.url.startsWith('file:///')) {
        let decoded = decodeURIComponent(file.url.replace(/^file:\/\/\/?/i, ''));
        decoded = decoded.replace(/\//g, path.sep);
        absPath = decoded;
      } else {
        absPath = path.isAbsolute(cleanName) ? cleanName : path.join(GIT_ROOT, cleanName);
      }

      let exists = await fs.pathExists(absPath);

      // Si no existe, intentar resolver en subcarpetas comunes
      if (!exists && !cleanName.includes('/') && !cleanName.includes('\\')) {
        const commonDirs = [
          'Documentacion PROTOTIPE/04_Estandares_y_Skills',
          'Documentacion PROTOTIPE/02_Tareas_Roadmap',
          'Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core',
          'Documentacion PROTOTIPE/06_Biblioteca_Componentes',
          'Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema',
          'Documentacion PROTOTIPE/09_Modulos_Completos',
          'Central PROTOTIPE/dev-dashboard/src/components/admin',
          'Prototipe-CLI'
        ];
        for (const dir of commonDirs) {
          const testPath = path.join(GIT_ROOT, dir, cleanName);
          if (await fs.pathExists(testPath)) {
            absPath = testPath;
            exists = true;
            break;
          }
        }
      }

      if (!exists) {
        return res.status(400).json({
          error: `Error de Integridad: El archivo "${cleanName}" no existe físicamente en el disco. Corrige la ruta para guardar.`
        });
      }
    }
  }

  _roadmapQueue.push(async () => {
    try {
      const docRoot = path.join(GIT_ROOT, 'Documentacion PROTOTIPE');
      const roadmapPath = path.join(docRoot, '02_Tareas_Roadmap', 'tareas_pendientes.md');
      if (!await fs.pathExists(roadmapPath)) {
        return res.status(404).json({ error: 'No se encontró el archivo de tareas pendientes.' });
      }

      const content = await fs.readFile(roadmapPath, 'utf8');
      const isCrlf = content.includes('\r\n');
      const lines = content.split(/\r?\n/);

      if (lineIndex < 0 || lineIndex >= lines.length) {
        return res.status(400).json({ error: 'Índice de línea fuera de rango.' });
      }

      const targetLine = lines[lineIndex];
      const bulletRegex = /^\s*[-*]\s+(?:\*\*)?\[([ x])\]\s+(?:~~)?(.+?)(?:~~)?(?:\*\*)?\s*$/i;
      if (!targetLine.match(bulletRegex)) {
        return res.status(400).json({ error: 'La línea especificada no es una tarea de Roadmap válida.' });
      }

      // Encontrar el rango de las líneas de detalle actuales
      let endIndex = lineIndex;
      let i = lineIndex + 1;
      let estatusActual = 'Pendiente.';
      let fechaActual = new Date().toISOString().slice(0, 10);
      let fechaFinActual = '';

      while (i < lines.length) {
        const l = lines[i];
        if (l.match(/^\s*[-*]\s+(?:\*\*)?\[[ x]\]/i)) break;
        
        const trimmed = l.trim();
        if (trimmed.match(/^-\s*Estatus:/i)) {
          estatusActual = trimmed.replace(/^-\s*Estatus:\s*/i, '').trim();
        } else if (trimmed.match(/^-\s*Fecha(?:\s+de\s+registro)?:/i)) {
          fechaActual = trimmed.replace(/^-\s*Fecha(?:\s+de\s+registro)?:\s*/i, '').trim();
        } else if (trimmed.match(/^-\s*Fecha\s+de\s+finalizaci[oó]n:/i)) {
          fechaFinActual = trimmed.replace(/^-\s*Fecha\s+de\s+finalizaci[oó]n:\s*/i, '').trim();
        }
        endIndex = i;
        i++;
      }

      // Formatear el nuevo bloque de detalle
      const newDetailLines = [];
      newDetailLines.push(`  - Estatus: ${estatusActual}`);
      newDetailLines.push(`  - Fecha: ${fechaActual}`);
      if (fechaFinActual) {
        newDetailLines.push(`  - Fecha de finalización: ${fechaFinActual}`);
      }

      // Agregar descripción
      if (descripcion !== undefined) {
        const descText = typeof descripcion === 'string' ? descripcion.trim() : (descripcion || []).join('\n').trim();
        if (descText) {
          const descLines = descText.split(/\r?\n/);
          newDetailLines.push(`  - Descripción: ${descLines[0]}`);
          for (let d = 1; d < descLines.length; d++) {
            newDetailLines.push(`    ${descLines[d]}`);
          }
        } else {
          newDetailLines.push(`  - Descripción: (pendiente de completar)`);
        }
      } else {
        newDetailLines.push(`  - Descripción: (pendiente de completar)`);
      }

      // Agregar archivos
      if (archivos && Array.isArray(archivos) && archivos.length > 0) {
        newDetailLines.push(`  - Archivos:`);
        archivos.forEach(file => {
          if (file && file.name) {
            const act = (file.action || 'MODIFY').toUpperCase();
            const gitRootUrl = `file:///${GIT_ROOT.replace(/\\/g, '/')}`;
            const url = file.url || `${gitRootUrl}/${file.name}`;
            newDetailLines.push(`    - [\`${file.name}\`](${url}) [${act}]`);
          }
        });
      }

      // Reemplazar el rango antiguo por el nuevo detalle
      const before = lines.slice(0, lineIndex + 1);
      const after = lines.slice(endIndex + 1);
      const newLines = [...before, ...newDetailLines, ...after];

      // Backup rotativo
      const backupDir = path.join(docRoot, '02_Tareas_Roadmap', '.tmp');
      await fs.ensureDir(backupDir);
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupPath = path.join(backupDir, `tareas_pendientes.${ts}.md.bak`);
      await fs.copy(roadmapPath, backupPath);
      try {
        const backups = (await fs.readdir(backupDir))
          .filter(f => f.endsWith('.md.bak'))
          .sort()
          .reverse();
        for (const old of backups.slice(5)) {
          await fs.remove(path.join(backupDir, old));
        }
      } catch (_) {}

      const separator = isCrlf ? '\r\n' : '\n';
      await writeFileWithRetry(roadmapPath, newLines.join(separator), 'utf8');

      const tasks = parseRoadmapContent(newLines.join(separator));
      res.json({ success: true, tasks });
    } catch (err) {
      console.error('Error al actualizar detalles de la tarea:', err.message);
      res.status(500).json({ error: `Error al escribir cambios en la tarea: ${err.message}` });
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/niches
// Retorna la configuración dinámica de nichos unificada con sus metadatos (con caché)
// ─────────────────────────────────────────────────────────────────────────────
let cachedNiches = null;

app.get('/api/niches', async (req, res) => {
  try {
    if (cachedNiches !== null) {
      return res.json(cachedNiches);
    }

    const nichesPath = path.join(__dirname, 'config', 'niches.json');
    const metaPath = path.join(__dirname, 'config', 'niches_metadata.json');
    
    if (await fs.pathExists(nichesPath)) {
      const nichesConfig = await fs.readJson(nichesPath);
      let metaConfig = {};
      if (await fs.pathExists(metaPath)) {
        metaConfig = await fs.readJson(metaPath);
      }
      
      const combined = {};
      for (const key of Object.keys(nichesConfig)) {
        combined[key] = {
          attributes: nichesConfig[key] || [],
          name: metaConfig[key]?.name || key.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          emoji: metaConfig[key]?.emoji || '💼'
        };
      }
      cachedNiches = combined;
      res.json(combined);
    } else {
      res.status(404).json({ error: 'No se encontró el archivo de configuración de nichos.' });
    }
  } catch (err) {
    console.error('Error al leer niches.json:', err.message);
    res.status(500).json({ error: `Fallo al leer configuración de nichos: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/niches
// Crea un nuevo nicho de negocio con sus atributos y metadatos
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/niches', async (req, res) => {
  try {
    const { id, name, emoji, attributes } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: 'ID y Nombre son obligatorios.' });
    }
    const cleanId = id.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    
    const nichesPath = path.join(__dirname, 'config', 'niches.json');
    const metaPath = path.join(__dirname, 'config', 'niches_metadata.json');
    
    const nichesConfig = (await fs.pathExists(nichesPath)) ? await fs.readJson(nichesPath) : {};
    const metaConfig = (await fs.pathExists(metaPath)) ? await fs.readJson(metaPath) : {};
    
    nichesConfig[cleanId] = attributes || [];
    metaConfig[cleanId] = { name, emoji: emoji || '💼' };
    
    await fs.writeJson(nichesPath, nichesConfig, { spaces: 2 });
    await fs.writeJson(metaPath, metaConfig, { spaces: 2 });
    
    cachedNiches = null; // Invalidar caché
    res.json({ success: true, id: cleanId });
  } catch (err) {
    console.error('Error al crear el nicho:', err.message);
    res.status(500).json({ error: `Error al crear el nicho: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/niches/:id
// Actualiza la configuración, nombre, emoji o atributos de un nicho existente
// ─────────────────────────────────────────────────────────────────────────────
app.put('/api/niches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, emoji, attributes } = req.body;
    
    const nichesPath = path.join(__dirname, 'config', 'niches.json');
    const metaPath = path.join(__dirname, 'config', 'niches_metadata.json');
    
    if (!await fs.pathExists(nichesPath)) {
      return res.status(404).json({ error: 'No se encontró la configuración de nichos.' });
    }
    
    const nichesConfig = await fs.readJson(nichesPath);
    const metaConfig = (await fs.pathExists(metaPath)) ? await fs.readJson(metaPath) : {};
    
    if (!nichesConfig[id]) {
      return res.status(404).json({ error: 'El nicho especificado no existe.' });
    }
    
    if (attributes !== undefined) nichesConfig[id] = attributes;
    if (name || emoji) {
      metaConfig[id] = {
        name: name || metaConfig[id]?.name || id,
        emoji: emoji || metaConfig[id]?.emoji || '💼'
      };
    }
    
    await fs.writeJson(nichesPath, nichesConfig, { spaces: 2 });
    await fs.writeJson(metaPath, metaConfig, { spaces: 2 });
    
    cachedNiches = null; // Invalidar caché
    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar el nicho:', err.message);
    res.status(500).json({ error: `Error al actualizar el nicho: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/niches/:id
// Elimina un nicho de la configuración y metadatos
// ─────────────────────────────────────────────────────────────────────────────
app.delete('/api/niches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const nichesPath = path.join(__dirname, 'config', 'niches.json');
    const metaPath = path.join(__dirname, 'config', 'niches_metadata.json');
    
    if (!await fs.pathExists(nichesPath)) {
      return res.status(404).json({ error: 'No se encontró la configuración de nichos.' });
    }
    
    const nichesConfig = await fs.readJson(nichesPath);
    const metaConfig = (await fs.pathExists(metaPath)) ? await fs.readJson(metaPath) : {};
    
    if (!nichesConfig[id]) {
      return res.status(404).json({ error: 'El nicho especificado no existe.' });
    }
    
    delete nichesConfig[id];
    delete metaConfig[id];
    
    await fs.writeJson(nichesPath, nichesConfig, { spaces: 2 });
    await fs.writeJson(metaPath, metaConfig, { spaces: 2 });
    
    cachedNiches = null; // Invalidar caché
    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar el nicho:', err.message);
    res.status(500).json({ error: `Error al eliminar el nicho: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Autocurar Biblioteca (CORE-258)
// ─────────────────────────────────────────────────────────────────────────────
async function autocureLibrary(gitRoot) {
  const docsRoot = path.join(gitRoot, 'Documentacion PROTOTIPE');
  const componentsDir = path.join(docsRoot, '06_Biblioteca_Componentes');
  const modulesDir = path.join(docsRoot, '09_Modulos_Completos');
  const devDashboardDir = path.join(gitRoot, 'Central PROTOTIPE', 'dev-dashboard');
  const sandboxesDir = path.join(devDashboardDir, 'src', 'components', 'admin', 'sandboxes');

  const nichesJsonPath = path.join(gitRoot, 'Prototipe-CLI', 'config', 'niches.json');
  let officialNicheKeys = [];
  if (await fs.pathExists(nichesJsonPath)) {
    try {
      const nichesData = await fs.readJson(nichesJsonPath);
      officialNicheKeys = Object.keys(nichesData);
    } catch (e) {
      console.warn('[Autocure] No se pudo leer niches.json:', e.message);
    }
  }

  // Carpeta de respaldos para autocuración
  const backupDir = path.join(docsRoot, '.prototipe-backup', 'autocure-backups');
  await fs.ensureDir(backupDir);

  // Helper para hacer copia de respaldo
  async function makeAutocureBackup(filePath) {
    const filename = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${timestamp}_${filename}`);
    await fs.copy(filePath, backupPath);
  }

  // Obtener archivos markdown recursivos
  async function getFilesRecursiveAsync(dir, fileList = []) {
    if (!await fs.pathExists(dir)) return fileList;
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        await getFilesRecursiveAsync(filePath, fileList);
      } else if (file.isFile() && filePath.endsWith('.md')) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  const compFiles = await getFilesRecursiveAsync(componentsDir);
  const modFiles = await getFilesRecursiveAsync(modulesDir);
  const mdFiles = [...compFiles, ...modFiles].filter(f => !f.toLowerCase().endsWith('readme.md') && !f.toLowerCase().endsWith('catalogo_componentes_atomicos.md'));

  const reports = [];

  // Procesar archivos markdown
  for (const file of mdFiles) {
    let content = await fs.readFile(file, 'utf8');
    let modified = false;
    const filename = path.basename(file);

    // A y B. Reemplazar puertos/paths locales únicamente dentro de bloques de código JSX
    if (/```jsx/i.test(content)) {
      content = content.replace(/```jsx([\s\S]*?)```/g, (match, code) => {
        let modifiedCode = code;

        // Reemplazar puertos e IPs locales quemados
        const localHostRegex = /(?:https?:\/\/)?(?:localhost|127\.0\.0\.1):\d+/gi;
        if (localHostRegex.test(modifiedCode)) {
          modifiedCode = modifiedCode.replace(localHostRegex, 'import.meta.env.VITE_API_URL');
          reports.push(`[${filename}] Puerto/host local quemado en bloque JSX reemplazado por VITE_API_URL.`);
          modified = true;
        }

        // Limpiar rutas locales absolutas
        const absolutePathRegex = /(?:[a-zA-Z]:[/\\]|\/)(?:PROTOTIPE|Users|home|Users\/[^\/]+)[/\\]/gi;
        if (absolutePathRegex.test(modifiedCode)) {
          modifiedCode = modifiedCode.replace(absolutePathRegex, 'src/');
          reports.push(`[${filename}] Ruta absoluta local en bloque JSX convertida a relativa.`);
          modified = true;
        }

        return `\`\`\`jsx${modifiedCode}\`\`\``;
      });
    }

    // C. Corregir tipo de componente en Componentes_Atomicos a "atom"
    const isAtomDir = file.includes(`${path.sep}Componentes_Atomicos${path.sep}`) || file.includes('/Componentes_Atomicos/');
    const manifestMatch = content.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
    if (manifestMatch) {
      try {
        const manifestObj = JSON.parse(manifestMatch[1]);
        let manifestModified = false;

        if (isAtomDir && manifestObj.type !== 'atom') {
          manifestObj.type = 'atom';
          manifestModified = true;
          reports.push(`[${filename}] Tipo de componente corregido a "atom" (directorio Componentes_Atomicos/).`);
        }

        // D. Autocompletar nicho si está en una carpeta de nicho
        const relPath = path.relative(componentsDir, file);
        const pathParts = relPath.split(path.sep);
        if (pathParts.length > 1) {
          const categoryFolder = pathParts[0];
          const normalizedFolder = categoryFolder.toLowerCase().replace(/_/g, '-');
          const normalizedFolderSnake = categoryFolder.toLowerCase().replace(/-/g, '_');
          const matchedNicheKey = officialNicheKeys.find(key => 
            key.toLowerCase().replace(/_/g, '-') === normalizedFolder ||
            key.toLowerCase().replace(/-/g, '_') === normalizedFolderSnake
          );

          if (matchedNicheKey) {
            if (!manifestObj.niches) {
              manifestObj.niches = [];
            }
            if (!manifestObj.niches.includes(matchedNicheKey)) {
              manifestObj.niches.push(matchedNicheKey);
              manifestModified = true;
              reports.push(`[${filename}] Nicho "${matchedNicheKey}" asignado automáticamente en base a su ubicación física.`);
            }
            if (!manifestObj.type) {
              manifestObj.type = 'component';
              manifestModified = true;
            }
          }
        }

        if (manifestModified) {
          const newManifestStr = `<!--\n${JSON.stringify(manifestObj, null, 2)}\n-->`;
          content = content.replace(manifestMatch[0], newManifestStr);
          modified = true;
        }
      } catch (err) {}
    }

    if (modified) {
      await makeAutocureBackup(file);
      await fs.writeFile(file, content, 'utf8');
    }
  }

  // E. Procesar archivos sandbox .jsx
  if (await fs.pathExists(sandboxesDir)) {
    const sFiles = await fs.readdir(sandboxesDir);
    for (const sFile of sFiles) {
      if (!sFile.endsWith('.jsx')) continue;
      const filePath = path.join(sandboxesDir, sFile);
      let content = await fs.readFile(filePath, 'utf8');
      let modified = false;

      // Reemplazar hostnames
      const localHostRegex = /(?:https?:\/\/)?(?:localhost|127\.0\.0\.1):\d+/gi;
      if (localHostRegex.test(content)) {
        content = content.replace(localHostRegex, 'import.meta.env.VITE_API_URL');
        reports.push(`[Sandbox: ${sFile}] Puerto/host local quemado reemplazado por VITE_API_URL.`);
        modified = true;
      }

      // Reemplazar rutas
      const absolutePathRegex = /(?:[a-zA-Z]:[/\\]|\/)(?:PROTOTIPE|Users|home|Users\/[^\/]+)[/\\]/gi;
      if (absolutePathRegex.test(content)) {
        content = content.replace(absolutePathRegex, 'src/');
        reports.push(`[Sandbox: ${sFile}] Ruta absoluta local convertida a ruta relativa (src/).`);
        modified = true;
      }

      if (modified) {
        await makeAutocureBackup(filePath);
        await fs.writeFile(filePath, content, 'utf8');
      }
    }
  }

  return reports;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/integrity/autofix
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/integrity/autofix', async (req, res) => {
  try {
    const reports = await autocureLibrary(GIT_ROOT);
    res.json({
      success: true,
      reports
    });
  } catch (err) {
    console.error('Error al ejecutar autocuración de catálogo:', err.message);
    res.status(500).json({ error: `Error en autocuración: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/integrity/status
// Ejecuta el validador físico en un subproceso hijo para no tirar el CLI
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/integrity/status', async (req, res) => {
  try {
    const devDashboardDir = path.join(GIT_ROOT, 'Central PROTOTIPE', 'dev-dashboard');
    const verifyScript = path.join(devDashboardDir, 'scripts', 'verify_library_integrity.cjs');
    
    // ── Auditores de consistencia documental ──
    const docRoot = path.join(GIT_ROOT, 'Documentacion PROTOTIPE');
    const roadmapPath = path.join(docRoot, '02_Tareas_Roadmap', 'tareas_pendientes.md');
    const bitacoraPath = path.join(docRoot, '03_Auditorias_y_Faro_Core', 'bitacora_cambios.md');
    const mapaAppPath = path.join(docRoot, '04_Estandares_y_Skills', 'mapa_aplicacion.md');
    const libraryReadme = path.join(docRoot, '06_Biblioteca_Componentes', 'README.md');

    const roadmapDrifts = [];
    const codeDrifts = [];
    const sandboxDrifts = [];
    let commitDrifts = [];
    let commitsList = [];
    let taskCount = 0;
    let bitacoraCount = 0;

    // A. Cargar datos base del Roadmap y Bitácora
    let roadmapContent = '';
    let completedTasks = [];
    if (await fs.pathExists(roadmapPath)) {
      roadmapContent = await fs.readFile(roadmapPath, 'utf8');
      
      // Parsear las tareas completadas del roadmap usando la helper común
      completedTasks = parseRoadmapContent(roadmapContent).filter(t => t.completed);
      taskCount = completedTasks.length;
    }

    let bitacoraContent = '';
    const bitacoraIds = new Set();
    const folderAuditorias = path.join(docRoot, '03_Auditorias_y_Faro_Core');
    if (await fs.pathExists(folderAuditorias)) {
      const files = await fs.readdir(folderAuditorias);
      const bitacoraFiles = files.filter(f => f.startsWith('bitacora_cambios') && f.endsWith('.md'));
      
      const contents = [];
      for (const file of bitacoraFiles) {
        const fullPath = path.join(folderAuditorias, file);
        try {
          const txt = await fs.readFile(fullPath, 'utf8');
          contents.push(txt);
        } catch (readErr) {
          console.warn(`[Integrity Multi-bitacora] No se pudo leer ${file}:`, readErr.message);
        }
      }
      bitacoraContent = contents.join('\n\n');
      
      // Captura IDs en cualquier formato de encabezado: ## ID:, ### [fecha] - ID, #### ID, etc.
      // Acepta cualquier prefijo alfanumérico (CORE, CLI, LINE, DASH, TPL, INST, DOC, etc.)
      const bitacoraRegex = /^#{1,4}\s+(?:\[[^\]]+\]\s*[-–]\s*)?((?:CORE|CLI|BUG|DASH|TPL|PLT|INST|DOC|LND|BIZ|HOTFIX|CLIENTE|E2E|LINE|COMP)-[A-Z0-9_-]+)/gim;
      let bm;
      while ((bm = bitacoraRegex.exec(bitacoraContent)) !== null) {
        bitacoraIds.add(bm[1].toUpperCase());
      }
      bitacoraCount = bitacoraIds.size;
    }

    // Capa de Consistencia Documental Básica (Bitácora vs Roadmap)
    completedTasks.forEach(task => {
      if (!bitacoraIds.has(task.id)) {
        roadmapDrifts.push({
          id: task.id,
          severity: 'HIGH',
          message: `La tarea ${task.id} está marcada como completada en el Roadmap, pero no tiene una entrada descriptiva en la bitácora de cambios.`
        });
      }
    });

    // Capa 1: Validación de Archivos Físicos y Registro en mapa_aplicacion.md
    let mapaContent = '';
    if (await fs.pathExists(mapaAppPath)) {
      mapaContent = await fs.readFile(mapaAppPath, 'utf8');
    }

    // Clave de deduplicación para evitar reportar el mismo drift dos veces (ej: tareas duplicadas en roadmap)
    const seenDrifts = new Set();

    for (const task of completedTasks) {
      const files = task.detail?.archivos || [];
      for (const file of files) {
        if (!file.name) continue;
        const cleanName = file.name.trim();

        // ── EXCLUSIÓN: archivos intencionalmente eliminados [DELETE] no son drifts ──
        const action = (file.action || '').toUpperCase();
        if (action === 'DELETE') continue;

        let absPath = '';

        if (file.url && file.url.startsWith('file:///')) {
          let decoded = decodeURIComponent(file.url.replace(/^file:\/\/\/?/i, ''));
          decoded = decoded.replace(/\//g, path.sep);
          absPath = decoded;
        } else {
          absPath = path.isAbsolute(cleanName) ? cleanName : path.join(GIT_ROOT, cleanName);
        }

        let exists = await fs.pathExists(absPath);

        if (!exists && !cleanName.includes('/') && !cleanName.includes('\\')) {
          const commonDirs = [
            'Documentacion PROTOTIPE/04_Estandares_y_Skills',
            'Documentacion PROTOTIPE/02_Tareas_Roadmap',
            'Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core',
            'Documentacion PROTOTIPE/06_Biblioteca_Componentes',
            'Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema',
            'Documentacion PROTOTIPE/09_Modulos_Completos',
            'Central PROTOTIPE/dev-dashboard/src/components/admin',
            'Prototipe-CLI'
          ];
          for (const dir of commonDirs) {
            const testPath = path.join(GIT_ROOT, dir, cleanName);
            if (await fs.pathExists(testPath)) {
              absPath = testPath;
              exists = true;
              break;
            }
          }
        }
        
        if (!exists) {
          // Deduplicar: mismo taskId + mismo nombre de archivo = mismo drift
          const driftKey = `${task.id}::${cleanName}`;
          if (seenDrifts.has(driftKey)) continue;
          seenDrifts.add(driftKey);

          codeDrifts.push({
            id: task.id,
            type: 'FILE_NOT_FOUND',
            file: cleanName,
            severity: 'HIGH',
            message: `El archivo "${cleanName}" declarado en la tarea ${task.id} no existe físicamente en el disco.`
          });
        } else if (mapaContent) {
          const relativePath = path.relative(GIT_ROOT, absPath).replace(/\\/g, '/');
          const cleanNameNormalized = cleanName.replace(/\\/g, '/');
          const cleanBase = path.basename(cleanName);
          const inMap = mapaContent.replace(/\\/g, '/').includes(relativePath) || 
                        mapaContent.replace(/\\/g, '/').includes(cleanNameNormalized) || 
                        mapaContent.includes(cleanBase);
          
          if (!inMap) {
            const mapKey = `MAP::${relativePath}`;
            if (!seenDrifts.has(mapKey)) {
              seenDrifts.add(mapKey);
              codeDrifts.push({
                id: task.id,
                type: 'MAP_MISSING',
                file: relativePath,
                severity: 'MEDIUM',
                message: `El archivo "${relativePath}" existe físicamente, pero no está registrado en mapa_aplicacion.md.`
              });
            }
          }
        }
      }
    }

    // Capa 2: Validación de Sandboxes para componentes catalogados
    if (await fs.pathExists(libraryReadme)) {
      const readmeContent = await fs.readFile(libraryReadme, 'utf8');
      const lines = readmeContent.split('\n');
      
      const libraryComponents = [];
      
      for (const line of lines) {
        // Detectar componente: * [Nombre (ComponentName)](link): descripción
        const compMatch = line.match(/^\*\s+\[(.+?)\]\(([^)]+)\):\s*(.+)/);
        if (compMatch) {
          const fullName = compMatch[1].trim();
          const techMatch = fullName.match(/^(.+?)\s*\(([^)]+)\)$/);
          const technicalName = techMatch ? techMatch[2].trim() : '';
          
          if (technicalName) {
            libraryComponents.push({ technicalName, fullName });
          }
        }
      }

      for (const comp of libraryComponents) {
        const sandboxPath = path.join(devDashboardDir, 'src', 'components', 'admin', 'sandboxes', `${comp.technicalName}Sandbox.jsx`);
        const sandboxExists = await fs.pathExists(sandboxPath);
        
        if (!sandboxExists) {
          // Omitir repositorios y servicios que no tienen UI simulable en sandboxes
          if (!comp.technicalName.toLowerCase().includes('repository') && !comp.technicalName.toLowerCase().includes('service')) {
            sandboxDrifts.push({
              technicalName: comp.technicalName,
              fullName: comp.fullName,
              severity: 'LOW',
              message: `El componente catalogado "${comp.technicalName}" no tiene su playground Sandbox en el dev-dashboard.`
            });
          }
        }
      }
    }

    // Capa 3: Validación de Commits de Git
    try {
      const gitLogOutput = await new Promise((resolve, reject) => {
        exec('git log -n 150 --pretty=format:%h%x09%s%x09%an%x09%ad --date=short', { cwd: GIT_ROOT }, (error, stdout, stderr) => {
          if (error) reject(error);
          else resolve(stdout || '');
        });
      });

      if (gitLogOutput) {
        const logLines = gitLogOutput.split('\n').filter(Boolean);
        const allCommittedTaskIds = new Set();
        
        commitsList = logLines.map(line => {
          const [hash, subject, author, date] = line.split('\t');
          const taskIdsFound = (subject || '').match(/((?:CORE|CLI|BUG|DASH|TPL|PLT|INST|DOC|LND|BIZ|HOTFIX|CLIENTE|E2E|LINE)-[A-Z0-9_-]+)/gi) || [];
          taskIdsFound.forEach(id => allCommittedTaskIds.add(id.toUpperCase()));
          const taskId = taskIdsFound[0] ? taskIdsFound[0].toUpperCase() : null;
          return {
            hash: hash || '',
            subject: subject || '',
            author: author || '',
            date: date || '',
            taskId
          };
        });

        // Blindar: Sólo validar tareas completadas en las últimas 24 horas (1 día) para coincidir con la sesión activa
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const limitDateStr = oneDayAgo.toISOString().split('T')[0];

        const recentCompletedTasks = completedTasks.filter(task => {
          const dateStr = task.detail.fechaFin || task.detail.fecha;
          if (!dateStr) return false;
          const trimmed = dateStr.trim();
          if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;
          return trimmed >= limitDateStr;
        });

        recentCompletedTasks.forEach(task => {
          if (!allCommittedTaskIds.has(task.id)) {
            commitDrifts.push({
              id: task.id,
              severity: 'INFO',
              message: `La tarea reciente ${task.id} (finalizada el ${task.detail.fechaFin || task.detail.fecha}) está completada en el Roadmap, pero no tiene commits asociados en el historial de Git inmediato.`
            });
          }
        });
      }
    } catch (gitErr) {
      console.warn('[API /integrity/status] Fallo al leer logs de Git:', gitErr.message);
    }

    // Ejecutar también el validador físico de componentes si existe
    if (await fs.pathExists(verifyScript)) {
      exec(`node "${verifyScript}"`, { cwd: devDashboardDir }, (error, stdout, stderr) => {
        const success = !error && roadmapDrifts.length === 0 && codeDrifts.length === 0;
        res.json({
          success,
          stdout: stdout || '',
          stderr: stderr || '',
          code: error ? error.code : 0,
          roadmapDrifts,
          codeDrifts,
          sandboxDrifts,
          commitDrifts,
          commitsList: commitsList.slice(0, 15),
          metrics: {
            completedTasksChecked: taskCount,
            bitacoraEntriesFound: bitacoraCount
          }
        });
      });
    } else {
      res.json({
        success: roadmapDrifts.length === 0 && codeDrifts.length === 0,
        stdout: 'No se encontró verify_library_integrity.cjs para auditar componentes.',
        stderr: '',
        code: 0,
        roadmapDrifts,
        codeDrifts,
        sandboxDrifts,
        commitDrifts,
        commitsList: commitsList.slice(0, 15),
        metrics: {
          completedTasksChecked: taskCount,
          bitacoraEntriesFound: bitacoraCount
        }
      });
    }
  } catch (err) {
    console.error('Error de ejecución en validador de integridad:', err.message);
    res.status(500).json({ error: `Fallo al inicializar validador: ${err.message}` });
  }
});

// GET /api/roadmap/git-status — Retorna listado de archivos modificados en el repositorio local
app.get('/api/roadmap/git-status', async (req, res) => {
  try {
    exec('git status --porcelain', { cwd: GIT_ROOT }, (error, stdout, stderr) => {
      if (error) {
        console.error('Error al ejecutar git status:', error.message);
        return res.status(500).json({ error: 'Fallo al obtener estado de Git.' });
      }

      const lines = (stdout || '').split('\n').filter(Boolean);
      const files = lines.map(line => {
        // Formato porcelain: XY path/to/file.ext
        const status = line.slice(0, 2);
        let filePath = line.slice(3).trim();
        
        if (filePath.startsWith('"') && filePath.endsWith('"')) {
          filePath = filePath.slice(1, -1);
        }

        // Determinar la acción semántica
        let action = 'MODIFY';
        if (status.includes('??') || status.includes('A')) {
          action = 'NEW';
        } else if (status.includes('D')) {
          action = 'DELETE';
        }

        return {
          path: filePath,
          action
        };
      });

      res.json({ files });
    });
  } catch (err) {
    console.error('Excepción en API /api/roadmap/git-status:', err.message);
    res.status(500).json({ error: `Fallo interno de Git: ${err.message}` });
  }
});

// POST /api/integrity/fix-map — Registra automáticamente un archivo faltante en mapa_aplicacion.md
app.post('/api/integrity/fix-map', async (req, res) => {
  const { file, id } = req.body;
  if (!file) return res.status(400).json({ error: 'El parámetro "file" es obligatorio.' });

  try {
    const docRoot = path.join(GIT_ROOT, 'Documentacion PROTOTIPE');
    const mapaAppPath = path.join(docRoot, '04_Estandares_y_Skills', 'mapa_aplicacion.md');

    if (!await fs.pathExists(mapaAppPath)) {
      return res.status(404).json({ error: 'No se encontró el archivo mapa_aplicacion.md.' });
    }

    let mapaContent = await fs.readFile(mapaAppPath, 'utf8');

    // Determinar la sección correcta para la inyección
    const header = file.includes('Documentacion PROTOTIPE')
      ? '## 📂 Estructura de Documentación y Negocio'
      : '## 📂 Estructura de Módulos y Archivos Clave';

    const insertIndex = mapaContent.indexOf(header);
    if (insertIndex === -1) {
      return res.status(400).json({ error: `No se encontró la sección "${header}" en el mapa.` });
    }

    // Normalizar la ruta con barra inclinada
    const cleanFilePath = file.replace(/\\/g, '/');
    const pathToCheck = cleanFilePath.startsWith('/') ? cleanFilePath : `/${cleanFilePath}`;

    // Validar si ya existe
    if (mapaContent.includes(pathToCheck)) {
      return res.json({ success: true, message: 'El archivo ya se encuentra registrado en el mapa.' });
    }

    const insertPoint = insertIndex + header.length;
    const newEntry = `\n* **\`${pathToCheck}\`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea ${id || 'N/A'}).`;
    
    const updatedContent = mapaContent.slice(0, insertPoint) + newEntry + mapaContent.slice(insertPoint);
    await fs.writeFile(mapaAppPath, updatedContent, 'utf8');

    res.json({ success: true, message: `Archivo "${cleanFilePath}" registrado exitosamente en el mapa.` });
  } catch (err) {
    console.error('Error al registrar en mapa_aplicacion.md:', err.message);
    res.status(500).json({ error: `Fallo al registrar en mapa: ${err.message}` });
  }
});

// POST /api/integrity/fix-map-bulk — Registra múltiples archivos faltantes en mapa_aplicacion.md en lote
app.post('/api/integrity/fix-map-bulk', async (req, res) => {
  const { files } = req.body;
  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: 'El parámetro "files" debe ser un array válido.' });
  }

  try {
    const docRoot = path.join(GIT_ROOT, 'Documentacion PROTOTIPE');
    const mapaAppPath = path.join(docRoot, '04_Estandares_y_Skills', 'mapa_aplicacion.md');

    if (!await fs.pathExists(mapaAppPath)) {
      return res.status(404).json({ error: 'No se encontró el archivo mapa_aplicacion.md.' });
    }

    let mapaContent = await fs.readFile(mapaAppPath, 'utf8');
    let updatedContent = mapaContent;
    let registeredCount = 0;

    for (const item of files) {
      if (!item.file) continue;

      const cleanFilePath = item.file.replace(/\\/g, '/');
      const pathToCheck = cleanFilePath.startsWith('/') ? cleanFilePath : `/${cleanFilePath}`;

      if (updatedContent.includes(pathToCheck)) continue;

      const header = cleanFilePath.includes('Documentacion PROTOTIPE')
        ? '## 📂 Estructura de Documentación y Negocio'
        : '## 📂 Estructura de Módulos y Archivos Clave';

      const insertIndex = updatedContent.indexOf(header);
      if (insertIndex !== -1) {
        const insertPoint = insertIndex + header.length;
        const newEntry = `\n* **\`${pathToCheck}\`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea ${item.id || 'N/A'}).`;
        updatedContent = updatedContent.slice(0, insertPoint) + newEntry + updatedContent.slice(insertPoint);
        registeredCount++;
      }
    }

    if (registeredCount > 0) {
      await fs.writeFile(mapaAppPath, updatedContent, 'utf8');
    }

    res.json({ success: true, message: `Se registraron exitosamente ${registeredCount} archivos en el mapa.` });
  } catch (err) {
    console.error('Error al registrar en lote en mapa_aplicacion.md:', err.message);
    res.status(500).json({ error: `Fallo al registrar en lote: ${err.message}` });
  }
});

// POST /api/integrity/prune-drifts — Purgar referencias a archivos inexistentes (FILE_NOT_FOUND) de tareas en tareas_pendientes.md
app.post('/api/integrity/prune-drifts', async (req, res) => {
  const { files } = req.body;
  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: 'El parámetro "files" debe ser un array válido.' });
  }

  try {
    const docRoot = path.join(GIT_ROOT, 'Documentacion PROTOTIPE');
    const roadmapPath = path.join(docRoot, '02_Tareas_Roadmap', 'tareas_pendientes.md');

    if (!await fs.pathExists(roadmapPath)) {
      return res.status(404).json({ error: 'No se encontró el archivo tareas_pendientes.md.' });
    }

    let roadmapContent = await fs.readFile(roadmapPath, 'utf8');
    let updatedRoadmap = roadmapContent;
    let prunedCount = 0;

    for (const item of files) {
      if (!item.id || !item.file) continue;

      const idRegex = /(?:[a-zA-Z]+)-(\d+)|Tarea[- ](\d+)/i;
      const match = item.id.match(idRegex);
      if (!match) continue;
      const taskNum = match[1] || match[2];

      // Expresión regular para buscar el bloque completo de la tarea por su número identificador
      const blockRegex = new RegExp(`(\\*\\s*\\*\\*\\[[ x]\\]\\s*(?:~~)?(?:Tarea\\s+)?(?:[a-zA-Z]+-)?${taskNum}:[\\s\\S]+?)(?=\\n\\*\\s*\\*\\*\\[[ x]\\]|$)`, 'i');
      const blockMatch = updatedRoadmap.match(blockRegex);
      if (blockMatch) {
        let taskBlock = blockMatch[1];
        const lines = taskBlock.split(/\r?\n/);
        const updatedLines = lines.map(line => {
          const trimmed = line.trim();

          // Caso A: Línea con formato "- Archivos: ..."
          if (trimmed.startsWith('- Archivos:')) {
            const inlineRest = line.replace(/^\s*-\s*Archivos:\s*/i, '').trim();
            const inlineFileRegex = /\[`?([^`\]]+)`?\]\(([^)]+)\)(?:\s*\[[A-Z/]+\])?/g;
            let fm;
            const remainingFiles = [];
            while ((fm = inlineFileRegex.exec(inlineRest)) !== null) {
              const fileName = fm[1];
              // Si el nombre del archivo de la tarea no coincide con el que no existe físicamente, se preserva
              if (fileName.trim() !== item.file.trim()) {
                remainingFiles.push(fm[0]);
              }
            }
            if (remainingFiles.length > 0) {
              // Reconstruir la línea con la sangría original
              const indent = line.match(/^\s*/)[0];
              return `${indent}- Archivos: ${remainingFiles.join(', ')}`;
            } else {
              return null; // Purgar la línea de archivos si no queda ninguno
            }
          }

          // Caso B: Línea que es una viñeta individual de archivo (ej. "    - [`ruta/archivo.ext`](url) [MODIFY]")
          const bulletFileMatch = line.match(/^\s*-\s*\[`?([^`\]]+)`?\]\(([^)]+)\)(?:\s*\[[A-Z/]+\])?/);
          if (bulletFileMatch) {
            const fileName = bulletFileMatch[1];
            // Si coincide con el archivo que queremos purgar, la eliminamos
            if (fileName.trim() === item.file.trim()) {
              return null;
            }
          }

          return line;
        }).filter(line => line !== null);

        const newTaskBlock = updatedLines.join('\n');
        // Reemplazar de forma atómica en el documento
        updatedRoadmap = updatedRoadmap.replace(taskBlock, newTaskBlock);
        prunedCount++;
      }
    }

    if (prunedCount > 0) {
      await fs.writeFile(roadmapPath, updatedRoadmap, 'utf8');
    }

    res.json({ success: true, message: `Se purgaron con éxito ${prunedCount} referencias de archivos obsoletos del Roadmap.` });
  } catch (err) {
    console.error('Error al purgar desvíos en tareas_pendientes.md:', err.message);
    res.status(500).json({ error: `Fallo al purgar desvíos: ${err.message}` });
  }
});

// POST /api/integrity/scaffold-sandbox — Crea el scaffold físico de un playground Sandbox para componente
app.post('/api/integrity/scaffold-sandbox', async (req, res) => {
  const { technicalName, fullName } = req.body;
  if (!technicalName || !fullName) {
    return res.status(400).json({ error: 'Los parámetros "technicalName" y "fullName" son obligatorios.' });
  }

  try {
    const devDashboardDir = path.join(GIT_ROOT, 'Central PROTOTIPE', 'dev-dashboard');
    const sandboxPath = path.join(devDashboardDir, 'src', 'components', 'admin', 'sandboxes', `${technicalName}Sandbox.jsx`);

    if (await fs.pathExists(sandboxPath)) {
      return res.json({ success: true, message: 'El Sandbox ya existe físicamente en el disco.' });
    }

    const componentName = technicalName.replace(/[^a-zA-Z0-9_]/g, '');
    const scaffoldContent = `import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';

export default function ${componentName}Sandbox() {
  const [theme, setTheme] = useState('dark');

  return (
    <SandboxLayout
      title="${fullName} (${technicalName})"
      description="Playground interactivo para simular el comportamiento del componente."
      controls={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Tema del Componente</label>
            <div className="flex gap-2">
              {['light', 'dark'].map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={\`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer \${
                    theme === t
                      ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)]'
                  }\`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className={\`p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center min-h-[220px]\`}>
        <div className="text-center space-y-2">
          <p className="text-xs text-[var(--color-text-muted)] font-mono">
            [ Componente ${technicalName} Scaffolded ]
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Personaliza este Sandbox importando tu componente y vinculando sus propiedades.
          </p>
        </div>
      </div>
    </SandboxLayout>
  );
}
`;

    await fs.outputFile(sandboxPath, scaffoldContent, 'utf8');
    res.json({ success: true, message: `Scaffold del Sandbox "${technicalName}Sandbox.jsx" creado con éxito.` });
  } catch (err) {
    console.error('Error al crear scaffold del Sandbox:', err.message);
    res.status(500).json({ error: `Fallo al crear scaffold: ${err.message}` });
  }
});

// POST /api/integrity/scaffold-sandbox-bulk — Crea TODOS los sandboxes pendientes en un solo disparo
app.post('/api/integrity/scaffold-sandbox-bulk', async (req, res) => {
  const { sandboxes } = req.body; // [{ technicalName, fullName }]
  if (!Array.isArray(sandboxes) || sandboxes.length === 0) {
    return res.status(400).json({ error: 'Se requiere el array "sandboxes" con al menos 1 elemento.' });
  }

  const devDashboardDir = path.join(GIT_ROOT, 'Central PROTOTIPE', 'dev-dashboard');
  const sandboxesDir = path.join(devDashboardDir, 'src', 'components', 'admin', 'sandboxes');

  let created = 0;
  let skipped = 0;
  const errors = [];

  for (const { technicalName, fullName } of sandboxes) {
    if (!technicalName || !fullName) { errors.push(`Entrada inválida: ${JSON.stringify({ technicalName, fullName })}`); continue; }
    const sandboxPath = path.join(sandboxesDir, `${technicalName}Sandbox.jsx`);
    try {
      if (await fs.pathExists(sandboxPath)) { skipped++; continue; }
      const componentName = technicalName.replace(/[^a-zA-Z0-9_]/g, '');
      const scaffoldContent = `import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';

export default function ${componentName}Sandbox() {
  const [theme, setTheme] = useState('dark');

  return (
    <SandboxLayout
      title="${fullName} (${technicalName})"
      description="Playground interactivo para simular el comportamiento del componente."
      controls={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Tema del Componente</label>
            <div className="flex gap-2">
              {['light', 'dark'].map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={\`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer \${
                    theme === t
                      ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)]'
                  }\`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className={\`p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center min-h-[220px]\`}>
        <div className="text-center space-y-2">
          <p className="text-xs text-[var(--color-text-muted)] font-mono">
            [ Componente ${technicalName} Scaffolded ]
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Personaliza este Sandbox importando tu componente y vinculando sus propiedades.
          </p>
        </div>
      </div>
    </SandboxLayout>
  );
}
`;
      await fs.outputFile(sandboxPath, scaffoldContent, 'utf8');
      created++;
    } catch (e) {
      errors.push(`${technicalName}: ${e.message}`);
    }
  }

  const summary = `Sandboxes creados: ${created} | Ya existían: ${skipped}${errors.length > 0 ? ` | Errores: ${errors.length}` : ''}.`;
  res.json({ success: true, message: summary, created, skipped, errors });
});

// Helpers de Auto-archivado e Integridad de Bitácora
async function syncArchiveInDocsMap(archivePath) {
  try {
    const mapPath = path.join(GIT_ROOT, 'Documentacion PROTOTIPE', '04_Estandares_y_Skills', 'mapa_documentacion_ia.md');
    if (!await fs.pathExists(mapPath)) return;
    
    const fileName = path.basename(archivePath);
    let content = await fs.readFile(mapPath, 'utf8');
    
    // Si ya existe la entrada de este archivo en el mapa, no la duplicamos
    if (content.includes(fileName)) return;
    
    const docRootUrl = `file:///${path.join(GIT_ROOT, 'Documentacion PROTOTIPE').replace(/\\/g, '/')}`;
    const targetLine = `| **bitacora_cambios.md** | Registro de Cambios Activos | **Obligatorio al finalizar:** Registrar cambios de la sesión activa de desarrollo y commits del Roadmap. | [Ver Bitácora Activa](${docRootUrl}/03_Auditorias_y_Faro_Core/bitacora_cambios.md) |`;
    
    const newLine = `| **${fileName}** | Histórico de Cambios | Registros históricos acumulados de cambios técnicos anteriores al 2026-07-07 compactados para NotebookLM. | [Ver Histórico](${docRootUrl}/03_Auditorias_y_Faro_Core/${fileName}) |`;
    
    if (content.includes(targetLine)) {
      content = content.replace(targetLine, `${targetLine}\n${newLine}`);
      await fs.writeFile(mapPath, content, 'utf8');
      console.log(`[Bitacora Auto-Archive] Registrada la entrada de ${fileName} en el mapa de documentación semántico.`);
    }
  } catch (err) {
    console.error('[Bitacora Auto-Archive] Error al registrar archivo en el mapa semántico:', err.message);
  }
}

async function checkAndArchiveBitacora(bitacoraPath) {
  try {
    const stats = await fs.stat(bitacoraPath);
    const sizeKb = stats.size / 1024;
    // Límite de 150 KB
    if (sizeKb > 150) {
      console.log(`[Bitacora Auto-Archive] El archivo activo supera los 150 KB (${sizeKb.toFixed(2)} KB). Iniciando auto-archivado...`);
      const today = new Date().toISOString().split('T')[0];
      const folder = path.dirname(bitacoraPath);
      
      let archivePath = path.join(folder, `bitacora_cambios_hasta_${today}.md`);
      let counter = 1;
      while (await fs.pathExists(archivePath)) {
        archivePath = path.join(folder, `bitacora_cambios_hasta_${today}_v${counter}.md`);
        counter++;
      }
      
      // Mover el archivo actual al histórico
      await fs.move(bitacoraPath, archivePath);
      
      // Crear nueva bitácora activa vacía con cabecera estándar
      const defaultHeader = `# 📝 Bitácora de Cambios e Historial de Commits\n\nEste es el log de cambios técnico activo para la sesión de desarrollo vigente del ecosistema PROTOTIPE. Los registros anteriores a esta fecha han sido auto-archivados en históricos compactos para optimizar la compatibilidad de NotebookLM.\n\n`;
      await fs.writeFile(bitacoraPath, defaultHeader, 'utf8');
      console.log(`[Bitacora Auto-Archive] Auto-archivado completado. Histórico en: ${path.basename(archivePath)}`);
      
      await syncArchiveInDocsMap(archivePath);
    }
  } catch (err) {
    console.error('[Bitacora Auto-Archive] Error en archivado automático:', err.message);
  }
}

// POST /api/integrity/batch-register-bitacora — Auto-registra entradas huérfanas de roadmap en bitacora_cambios.md
app.post('/api/integrity/batch-register-bitacora', async (req, res) => {
  const { drifts } = req.body; // [{ id, message }] — tareas completadas sin entrada en bitácora
  if (!Array.isArray(drifts) || drifts.length === 0) {
    return res.status(400).json({ error: 'Se requiere el array "drifts" con las entradas a registrar.' });
  }

  try {
    const roadmapPath = path.join(GIT_ROOT, 'Documentacion PROTOTIPE', '02_Tareas_Roadmap', 'tareas_pendientes.md');
    const bitacoraPath = path.join(GIT_ROOT, 'Documentacion PROTOTIPE', '03_Auditorias_y_Faro_Core', 'bitacora_cambios.md');

    const roadmapContent = await fs.readFile(roadmapPath, 'utf8');
    const bitacoraContent = await fs.readFile(bitacoraPath, 'utf8');

    const today = new Date().toISOString().split('T')[0];
    let newEntries = '';
    let registered = 0;

    for (const { id } of drifts) {
      // Extraer el bloque completo de la tarea del roadmap
      const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const taskBlockMatch = roadmapContent.match(
        new RegExp(`\\*\\s+\\*\\*\\[x\\].*?Tarea\\s+${escapedId}:[\\s\\S]*?(?=\\n\\*\\s+\\*\\*|$)`)
      );

      let taskText = id;
      let descripcion = 'Tarea completada — sin descripción detallada disponible en el roadmap.';
      let archivos = '';

      if (taskBlockMatch) {
        const block = taskBlockMatch[0];
        const titleMatch = block.match(/Tarea\s+[A-Z\-0-9]+:\s*(.+?)~~/);
        if (titleMatch) taskText = titleMatch[1].trim();
        const descMatch = block.match(/- Descripción:\s*(.+)/);
        if (descMatch) descripcion = descMatch[1].trim();
        const archMatch = block.match(/- Archivos:\s*(.+)/);
        if (archMatch) archivos = archMatch[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '`$1`').trim();
      }

      // Verificar que no exista ya en bitácora
      if (bitacoraContent.includes(id)) continue;

      newEntries += `\n## ${id}: ${taskText}\n- **Fecha:** ${today}\n- **Tipo:** Funcionalidad / Mejora\n- **Impacto:** Registro retroactivo auto-generado por el validador de integridad.\n- **Descripción:** ${descripcion}\n${archivos ? `- **Archivos afectados:** ${archivos}\n` : ''}`;
      registered++;
    }

    if (registered === 0) {
      return res.json({ success: true, message: 'Todas las entradas ya estaban registradas en la Bitácora. Nada que agregar.', registered: 0 });
    }

    // Insertar al inicio de la bitácora (después del header H1 si existe)
    let updatedBitacora;
    const h1Match = bitacoraContent.match(/^(#[^\n]+\n)/);
    if (h1Match) {
      updatedBitacora = h1Match[1] + newEntries + '\n' + bitacoraContent.slice(h1Match[1].length);
    } else {
      updatedBitacora = newEntries + '\n' + bitacoraContent;
    }

    await fs.writeFile(bitacoraPath, updatedBitacora, 'utf8');
    await checkAndArchiveBitacora(bitacoraPath);
    res.json({ success: true, message: `${registered} entrada(s) registrada(s) en la Bitácora de Cambios con éxito.`, registered });
  } catch (err) {
    console.error('Error al registrar en bitácora en lote:', err.message);
    res.status(500).json({ error: `Fallo al registrar en bitácora: ${err.message}` });
  }
});

// POST /api/roadmap/publish — 1-Click Commit: guarda edits + marca completada + escribe bitácora + git commit estructurado
app.post('/api/roadmap/publish', async (req, res) => {
  const { taskId, description, files, commitMessage } = req.body;
  if (!taskId) return res.status(400).json({ error: 'taskId es obligatorio.' });

  const roadmapPath = path.join(GIT_ROOT, 'Documentacion PROTOTIPE', '02_Tareas_Roadmap', 'tareas_pendientes.md');
  const bitacoraPath = path.join(GIT_ROOT, 'Documentacion PROTOTIPE', '03_Auditorias_y_Faro_Core', 'bitacora_cambios.md');

  try {
    const today = new Date().toISOString().split('T')[0];
    const log = [];

    // ── PASO 1: Marcar la tarea como [x] en tareas_pendientes.md ─────────────
    let roadmapContent = await fs.readFile(roadmapPath, 'utf8');
    const escapedId = taskId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const taskRegex = new RegExp(`(\\*\\s+\\*\\*\\[\\s\\]\\s+~~Tarea\\s+${escapedId}:[^~]+~~\\*\\*)`, 'g');
    let marked = false;
    roadmapContent = roadmapContent.replace(taskRegex, (match) => {
      marked = true;
      return match.replace('[ ]', '[x]');
    });
    // También actualizar "Estatus" si aún dice Pendiente
    const statusRegex = new RegExp(`(Tarea\\s+${escapedId}:[\\s\\S]{0,400}?- Estatus:\\s*)(Pendiente\\.?)`, '');
    roadmapContent = roadmapContent.replace(statusRegex, `$1Completado.`);
    await fs.writeFile(roadmapPath, roadmapContent, 'utf8');
    log.push(marked ? `✓ Tarea ${taskId} marcada como [x] en el Roadmap.` : `⚠ La tarea ${taskId} ya estaba completada o no se encontró.`);

    // ── PASO 2: Registrar en bitácora ─────────────────────────────────────────
    let bitacoraContent = await fs.readFile(bitacoraPath, 'utf8');
    if (!bitacoraContent.includes(taskId)) {
      const taskText = commitMessage || taskId;
      const filesLine = Array.isArray(files) && files.length > 0
        ? `- **Archivos afectados:** ${files.map(f => `\`${f.name}\` [${f.action || 'MODIFY'}]`).join(', ')}\n`
        : '';
      const entry = `\n## ${taskId}: ${taskText}\n- **Fecha:** ${today}\n- **Tipo:** Funcionalidad / Mejora\n- **Descripción:** ${description || 'Publicado mediante 1-Click Commit desde el dashboard.'}\n${filesLine}`;

      const h1Match = bitacoraContent.match(/^(#[^\n]+\n)/);
      if (h1Match) {
        bitacoraContent = h1Match[1] + entry + '\n' + bitacoraContent.slice(h1Match[1].length);
      } else {
        bitacoraContent = entry + '\n' + bitacoraContent;
      }
      await fs.writeFile(bitacoraPath, bitacoraContent, 'utf8');
      await checkAndArchiveBitacora(bitacoraPath);
      log.push(`✓ Entrada registrada en Bitácora de Cambios.`);
    } else {
      log.push(`⚠ La tarea ${taskId} ya tenía entrada en la Bitácora.`);
    }

    // ── PASO 3: Git add + commit estructurado ────────────────────────────────
    const { exec } = require('child_process');
    const execAsync = (cmd, cwd) => new Promise((resolve, reject) => {
      exec(cmd, { cwd }, (err, stdout, stderr) => {
        if (err) reject(new Error(stderr || err.message));
        else resolve(stdout.trim());
      });
    });

    const finalMessage = commitMessage
      ? `${taskId}: ${commitMessage}`
      : `${taskId}: Tarea completada y publicada desde el dashboard`;

    await execAsync(`git add -A`, GIT_ROOT);
    const commitOutput = await execAsync(`git commit -m "${finalMessage.replace(/"/g, "'")}"`, GIT_ROOT);
    log.push(`✓ Git commit ejecutado: "${finalMessage}"`);
    log.push(`  ${commitOutput.split('\n')[0]}`);

    res.json({ success: true, message: `🚀 Tarea ${taskId} publicada con éxito.`, log });
  } catch (err) {
    console.error('Error en 1-Click Publish:', err.message);
    // Si el error es que no hay nada que commitear, lo reportamos como éxito parcial
    if (err.message.includes('nothing to commit')) {
      res.json({ success: true, message: `✓ Roadmap y Bitácora actualizados. No había cambios de código pendientes en Git.`, log: ['ℹ Sin cambios de código adicionales en el working tree.'] });
    } else {
      res.status(500).json({ error: `Fallo en publicación: ${err.message}` });
    }
  }
});


// ─────────────────────────────────────────────────────────────────────────────
async function findClientPath(clientId) {
  if (!clientId) return null;
  const topDirs = await fs.readdir(GIT_INSTANCES_DIR).catch(() => []);
  for (const dir of topDirs) {
    const fullPath = path.join(GIT_INSTANCES_DIR, dir);
    const dirLower = dir.toLowerCase();
    const clientLower = clientId.toLowerCase();
    
    if (dirLower === clientLower || dirLower === `app-${clientLower}`) {
      if (await fs.pathExists(path.join(fullPath, '.prototipe.json'))) {
        return fullPath;
      }
    }
    const subDirs = await fs.readdir(fullPath).catch(() => []);
    for (const subDir of subDirs) {
      const subDirLower = subDir.toLowerCase();
      if (subDirLower === clientLower || subDirLower === `app-${clientLower}`) {
        const subFullPath = path.join(fullPath, subDir);
        if (await fs.pathExists(path.join(subFullPath, '.prototipe.json'))) {
          return subFullPath;
        }
      }
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cli/logs/stream
// SSE: Transmite logs en vivo de cli_bridge.log únicamente a localhost
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/cli/logs/stream', async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '';
  if (!clientIp.includes('127.0.0.1') && !clientIp.includes('::1') && !clientIp.includes('::ffff:127.0.0.1')) {
    return res.status(403).json({ error: 'Acceso denegado. Solo localhost está autorizado para ver los logs del Bridge.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const logPath = path.join(CLI_ROOT, 'cli_bridge.log');
  if (await fs.pathExists(logPath)) {
    try {
      const content = await fs.readFile(logPath, 'utf8');
      const lines = content.split(/\r?\n/).slice(-100);
      lines.forEach(line => {
        if (line.trim()) {
          res.write(`data: ${JSON.stringify({ type: 'log', log: line })}\n\n`);
        }
      });
    } catch (err) {}
  }

  let filePosition = 0;
  try {
    const stats = await fs.stat(logPath);
    filePosition = stats.size;
  } catch (_) {}

  const watcher = fs.watch(logPath, async (eventType) => {
    if (eventType === 'change') {
      try {
        const stats = await fs.stat(logPath);
        if (stats.size > filePosition) {
          let fd;
          try {
            fd = await fs.open(logPath, 'r');
            const buffer = Buffer.alloc(stats.size - filePosition);
            await fs.read(fd, buffer, 0, stats.size - filePosition, filePosition);
            filePosition = stats.size;

            const newContent = buffer.toString('utf8');
            const lines = newContent.split(/\r?\n/);
            lines.forEach(line => {
              if (line.trim()) {
                res.write(`data: ${JSON.stringify({ type: 'log', log: line })}\n\n`);
              }
            });
          } finally {
            if (fd !== undefined) {
              await fs.close(fd).catch(() => {});
            }
          }
        } else if (stats.size < filePosition) {
          filePosition = stats.size;
        }
      } catch (_) {}
    }
  });

  const keepAliveInterval = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch (_) {
      clearInterval(keepAliveInterval);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
    watcher.close();
    res.end();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/project/db/seed
// Sembrador seguro de datos de prueba en Firestore validando contra esquema
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/project/db/seed
// Sembrador seguro de datos de prueba en Firestore basado en seed.json del core
// ─────────────────────────────────────────────────────────────────────────────
async function seedProjectDatabase(clientId) {
  const projectPath = await findClientPath(clientId);
  if (!projectPath) {
    throw new Error(`No se encontró la ruta para el proyecto "${clientId}".`);
  }

  const metaPath = path.join(projectPath, '.prototipe.json');
  let meta = {};
  if (await fs.pathExists(metaPath)) {
    meta = await fs.readJson(metaPath);
  }

  const templateKey = meta.template;
  if (!templateKey) {
    throw new Error('La instancia no tiene configurada ninguna plantilla core.');
  }

  // Buscar la ruta fuente del core en el registro
  const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
  if (!await fs.pathExists(registroPath)) {
    throw new Error('No se encontró el registro de plantillas (plantillas_registro.json).');
  }

  const registro = await fs.readJson(registroPath);
  const coreConfig = (registro.plantillas || {})[templateKey];
  if (!coreConfig) {
    throw new Error(`No se encontró la configuración del core "${templateKey}" en el registro.`);
  }

  const seedJsonPath = path.join(coreConfig.fuente, 'seed.json');
  if (!await fs.pathExists(seedJsonPath)) {
    return { success: true, message: 'Esta plantilla no requiere sembrado de datos de prueba (seed.json no definido).' };
  }

  // Leer y parsear seed.json
  let seedRawText = await fs.readFile(seedJsonPath, 'utf8');

  // Reemplazar comodines/placeholders
  const primaryColor = meta.primaryColor || '#6366f1';
  const secondaryColor = meta.secondaryColor || '#a855f7';
  const bgColor = meta.bgColor || '#070a13';
  const currentIsoDate = new Date().toISOString();

  seedRawText = seedRawText
    .replace(/\{\{COLOR_PRIMARY\}\}/g, primaryColor)
    .replace(/\{\{COLOR_SECONDARY\}\}/g, secondaryColor)
    .replace(/\{\{COLOR_BG\}\}/g, bgColor)
    .replace(/\{\{CURRENT_ISO_DATE\}\}/g, currentIsoDate);

  const seedData = JSON.parse(seedRawText);
  const collections = seedData.collections || {};

  const envPath = path.join(projectPath, '.env.local');
  if (!await fs.pathExists(envPath)) {
    throw new Error('No se encontró el archivo .env.local en el cliente.');
  }

  const envContent = await fs.readFile(envPath, 'utf-8');
  const env = {};
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (match) {
      env[match[1]] = match[2].replace(/['"`]/g, '').trim();
    }
  });

  const apiKey = env.VITE_FIREBASE_API_KEY;
  const projectId = env.VITE_FIREBASE_PROJECT_ID;
  const adminEmail = env.VITE_DEVELOPER_ADMIN_EMAIL;
  const adminPassword = env.VITE_DEVELOPER_ADMIN_PASSWORD;

  if (!apiKey || !projectId || !adminEmail || !adminPassword) {
    throw new Error('Faltan variables Firebase o admin en .env.local.');
  }

  const homedir = process.env.USERPROFILE || process.env.HOME || '';
  const possiblePaths = [
    path.join(homedir, '.config', 'configstore', 'firebase-tools.json'),
    path.join(process.env.APPDATA || '', 'configstore', 'firebase-tools.json')
  ];
  let devToken = null;
  for (const p of possiblePaths) {
    if (await fs.pathExists(p)) {
      try {
        const data = await fs.readJson(p);
        if (data.tokens && data.tokens.access_token) {
          devToken = data.tokens.access_token;
          break;
        }
      } catch (_) {}
    }
  }

  if (!devToken) {
    throw new Error('No se pudo obtener la sesión de Firebase CLI. Corre: firebase login');
  }

  // Helper recursivo para convertir objetos JS a valores de Firestore REST API
  function convertToFirestoreValue(value) {
    if (value === null || value === undefined) {
      return { nullValue: null };
    }
    if (typeof value === 'boolean') {
      return { booleanValue: value };
    }
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return { integerValue: value.toString() };
      }
      return { doubleValue: value };
    }
    if (typeof value === 'string') {
      return { stringValue: value };
    }
    if (Array.isArray(value)) {
      return {
        arrayValue: {
          values: value.map(item => convertToFirestoreValue(item))
        }
      };
    }
    if (typeof value === 'object') {
      const fields = {};
      for (const [k, v] of Object.entries(value)) {
        fields[k] = convertToFirestoreValue(v);
      }
      return {
        mapValue: { fields }
      };
    }
    return { stringValue: String(value) };
  }

  let seededCount = 0;
  let collectionsCount = 0;

  // Procesar y subir cada colección declarada
  for (const [colName, docs] of Object.entries(collections)) {
    if (!Array.isArray(docs)) continue;
    collectionsCount++;

    for (const doc of docs) {
      if (!doc.id || !doc.fields) continue;

      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${colName}/${doc.id}`;
      const payload = {
        fields: {}
      };

      for (const [fieldName, val] of Object.entries(doc.fields)) {
        payload.fields[fieldName] = convertToFirestoreValue(val);
      }

      const resFetch = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${devToken}` },
        body: JSON.stringify(payload)
      });

      if (!resFetch.ok) {
        const errText = await resFetch.text();
        throw new Error(`Error en colección "${colName}", doc "${doc.id}": ${errText}`);
      }
      seededCount++;
    }
  }

  return {
    success: true,
    message: `Sembrado exitoso. Se inyectaron ${seededCount} documentos a través de ${collectionsCount} colecciones en Firestore.`
  };
}

app.post('/api/project/db/seed', async (req, res) => {
  const { clientId } = req.body;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  try {
    const result = await seedProjectDatabase(clientId);
    res.json(result);
  } catch (err) {
    console.error('Error en seeder:', err.message);
    res.status(500).json({ error: `Fallo durante el sembrado: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/git/sync-rules
// Llama al script sync_rules.js de forma segura para propagar reglas de IA
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/git/sync-rules', async (req, res) => {
  try {
    const syncRulesScript = path.join(GIT_ROOT, 'Documentacion PROTOTIPE', '04_Estandares_y_Skills', 'Copia_Seguridad_Reglas_y_Skills', 'sync_rules.js');
    if (!await fs.pathExists(syncRulesScript)) {
      return res.status(404).json({ error: 'No se encontró el archivo sync_rules.js.' });
    }

    exec(`node "${syncRulesScript}"`, { cwd: path.dirname(syncRulesScript) }, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: `Fallo al sincronizar reglas: ${stderr || error.message}` });
      }
      res.json({ success: true, output: stdout || 'Sincronización finalizada.' });
    });
  } catch (err) {
    console.error('Error al sincronizar reglas:', err.message);
    res.status(500).json({ error: `Fallo al inicializar sincronizador: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/library/manual
// Escribe el manual de desarrollo en 07_Manuales_Desarrollo/ y actualiza mapas
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/library/manual', async (req, res) => {
  const { componentName, category, content } = req.body;
  if (!componentName || !category || !content) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
  }

  try {
    const sanitizedCategory = sanitizeShellArgument(category);
    const sanitizedName = sanitizeShellArgument(componentName);

    const manualDir = path.join(GIT_ROOT, 'Documentacion PROTOTIPE', '07_Manuales_Desarrollo', sanitizedCategory, sanitizedName);
    await fs.ensureDir(manualDir);

    const manualFile = path.join(manualDir, `manual_${sanitizedName.toLowerCase()}.md`);
    await fs.writeFile(manualFile, content, 'utf8');

    const docMapFile = path.join(GIT_ROOT, 'Documentacion PROTOTIPE', '04_Estandares_y_Skills', 'mapa_documentacion_ia.md');
    if (await fs.pathExists(docMapFile)) {
      let docMapContent = await fs.readFile(docMapFile, 'utf8');
      const docRootUrl = `file:///${path.join(GIT_ROOT, 'Documentacion PROTOTIPE').replace(/\\/g, '/')}`;
      const entryText = `| **manual_${sanitizedName.toLowerCase()}.md** | Manual Técnico de Integración de ${sanitizedName} | Propósito: Guía de integración detallada. | [Ver Manual](${docRootUrl}/07_Manuales_Desarrollo/${sanitizedCategory}/${sanitizedName}/manual_${sanitizedName.toLowerCase()}.md) |`;
      if (!docMapContent.includes(`manual_${sanitizedName.toLowerCase()}.md`)) {
        docMapContent = docMapContent.trim() + '\n' + entryText + '\n';
        await fs.writeFile(docMapFile, docMapContent, 'utf8');
      }
    }

    res.json({ success: true, message: `Manual de desarrollo creado: ${manualFile}` });
  } catch (err) {
    console.error('Error al generar manual técnico:', err.message);
    res.status(500).json({ error: `Fallo al escribir manual: ${err.message}` });
  }
});

app.post('/api/project/cleanup', async (req, res) => {
  const { clientId, scanOnly } = req.body;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  try {
    const projectPath = await findClientPath(clientId);
    if (!projectPath) {
      return res.status(404).json({ error: `No se encontró la ruta para el proyecto "${clientId}".` });
    }

    const allowedSubpaths = [
      path.join(projectPath, 'node_modules', '.vite'),
      path.join(projectPath, 'node_modules', '.vite-temp'),
      path.join(projectPath, 'dist'),
      path.join(projectPath, 'build'),
      path.join(GIT_ROOT, 'Documentacion PROTOTIPE', '02_Tareas_Roadmap', '.tmp')
    ];

    if (scanOnly) {
      const scanResults = [];
      for (const folder of allowedSubpaths) {
        const exists = await fs.pathExists(folder);
        const basename = path.basename(folder);
        scanResults.push({
          path: folder,
          name: basename,
          exists,
          safe: true,
          type: basename === '.tmp' ? 'Temporal de Roadmap' : basename === 'dist' || basename === 'build' ? 'Compilación de Producción' : 'Caché de Vite'
        });
      }
      return res.json({ success: true, scan: scanResults });
    }

    let deletedFolders = [];
    for (const folder of allowedSubpaths) {
      if (await fs.pathExists(folder)) {
        if (isPathContained(projectPath, folder) || isPathContained(GIT_ROOT, folder)) {
          const basename = path.basename(folder);
          if (['.vite', '.vite-temp', 'dist', 'build', '.tmp'].includes(basename)) {
            await fs.remove(folder);
            deletedFolders.push(folder);
          }
        }
      }
    }

    res.json({ success: true, message: `Limpieza completada. Carpetas eliminadas: ${deletedFolders.length}`, deleted: deletedFolders });
  } catch (err) {
    console.error('Error durante la purga de temporales:', err.message);
    res.status(500).json({ error: `Fallo en el limpiador seguro: ${err.message}` });
  }
});
// ─────────────────────────────────────────────────────────────────────────────
// METRICAS COMERCIALES Y OPERATIVAS (Briefing, Cotización, Flags, Health Monitor)
// ─────────────────────────────────────────────────────────────────────────────

// Helper para sanitizar nombres de archivos
function sanitizeFileName(name) {
  if (typeof name !== 'string') return '';
  return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_').substring(0, 50);
}

let cachedPricingMatrix = null;
let pricingMatrixLastFetched = 0;
const MATRIX_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutos de caché en memoria

// POST /api/briefing/analyze
app.post('/api/briefing/analyze', async (req, res) => {
  const briefing = req.body;
  if (!briefing) {
    return res.status(400).json({ error: 'Faltan datos del briefing.' });
  }

  const coreKey = briefing.coreKey || 'ventas';

  try {
    let manifest = null;
    const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
    if (await fs.pathExists(registroPath)) {
      const registro = await fs.readJson(registroPath);
      const coreConfig = registro.plantillas[coreKey];
      if (coreConfig) {
        const manifestPath = path.join(coreConfig.fuente.replace(/\//g, path.sep), 'core-manifest.json');
        if (await fs.pathExists(manifestPath)) {
          manifest = await fs.readJson(manifestPath);
        }
      }
    }

    // 1. Calcular score de 5 pasos de cotización
    // Paso 1: Complejidad Funcional
    let scoreFuncional = 0;
    const reqFuncionales = briefing.seccion15?.obligatorios || [];
    if (manifest && manifest.scoringRules?.modules) {
      for (const req of reqFuncionales) {
        if (manifest.scoringRules.modules[req] !== undefined) {
          scoreFuncional += manifest.scoringRules.modules[req];
        }
      }
    } else {
      if (reqFuncionales.includes('pos')) scoreFuncional += 8;
      if (reqFuncionales.includes('inventario')) scoreFuncional += 6;
      if (reqFuncionales.includes('credito')) scoreFuncional += 5;
      if (reqFuncionales.includes('agenda')) scoreFuncional += 5;
      if (reqFuncionales.includes('dian')) scoreFuncional += 8;
    }

    // Paso 2: Complejidad Técnica
    let scoreTecnico = 0;
    const integraciones = briefing.seccion13?.integraciones || [];
    if (manifest && manifest.scoringRules?.integrations) {
      for (const integration of integraciones) {
        if (manifest.scoringRules.integrations[integration] !== undefined) {
          scoreTecnico += manifest.scoringRules.integrations[integration];
        }
      }
      if (briefing.seccion11?.offline === 'si' && manifest.scoringRules.offlinePoints !== undefined) {
        scoreTecnico += manifest.scoringRules.offlinePoints;
      }
    } else {
      if (integraciones.includes('whatsapp')) scoreTecnico += 3;
      if (integraciones.includes('pasarela')) scoreTecnico += 5;
      if (integraciones.includes('dian')) scoreTecnico += 6;
      if (integraciones.includes('impresora')) scoreTecnico += 3;
      if (briefing.seccion11?.offline === 'si') scoreTecnico += 5;
    }

    // Paso 3: Personalización (alineado con CotizadorView)
    let scorePersonalizacion = 4; // Baja por defecto
    const personalizacion = briefing.seccion18?.personalizacion || 'baja';
    if (personalizacion === 'media') scorePersonalizacion = 10;
    if (personalizacion === 'alta') scorePersonalizacion = 18;

    // Paso 4: Riesgos (alineado con CotizadorView)
    let scoreRiesgo = 10; // Medio por defecto
    const madurezTech = briefing.seccion18?.madurezTech || 'media';
    if (madurezTech === 'alta') scoreRiesgo = 4; // Bajo riesgo
    if (madurezTech === 'baja') scoreRiesgo = 18; // Alto riesgo

    // Paso 5: Valor Empresarial (alineado con CotizadorView)
    let scoreValor = 2; // Bajo por defecto
    const horasPerdidas = parseInt(briefing.seccion8?.horasPerdidas || '0', 10);
    const tieneDineroPerdido = briefing.seccion8?.dineroPerdido;
    if (horasPerdidas > 20) {
      scoreValor = 18; // Muy Alto
    } else if (horasPerdidas > 10 || tieneDineroPerdido) {
      scoreValor = 12; // Alto
    } else if (horasPerdidas > 5) {
      scoreValor = 6; // Medio
    }

    const totalScore = scoreFuncional + scoreTecnico + scorePersonalizacion + scoreRiesgo + scoreValor;

    // 2. Clasificación por nivel desde Firestore (Matriz de Precios)
    const DEFAULT_PRICING_MATRIX = [
      { nivel: '🔴 Micro', minPts: 0, maxPts: 20, setupMin: 500000, setupMax: 1500000, mensualidad: 50000, comision: 1.0 },
      { nivel: '🟡 Pequeño', minPts: 21, maxPts: 40, setupMin: 1500000, setupMax: 4000000, mensualidad: 100000, comision: 1.5 },
      { nivel: '🟢 Medio', minPts: 41, maxPts: 60, setupMin: 3500000, setupMax: 7000000, mensualidad: 180000, comision: 2.0 },
      { nivel: '🔵 Grande', minPts: 61, maxPts: 80, setupMin: 6000000, setupMax: 12000000, mensualidad: 300000, comision: 2.5 },
      { nivel: '⭐ Estratégico', minPts: 81, maxPts: 108, setupMin: 10000000, setupMax: 25000000, mensualidad: 500000, comision: 3.5 }
    ];

    let pricingMatrix = DEFAULT_PRICING_MATRIX;
    const now = Date.now();
    if (cachedPricingMatrix && (now - pricingMatrixLastFetched < MATRIX_CACHE_TTL_MS)) {
      pricingMatrix = cachedPricingMatrix;
    } else {
      try {
        const accessToken = await getFirebaseAccessToken();
        const url = `https://firestore.googleapis.com/v1/projects/prototipe-ecosistema-control/databases/(default)/documents/dashboard_config/pricing_matrix`;
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (res.ok) {
          const docRes = await res.json();
          const matrixValue = docRes.fields?.matrix?.arrayValue?.values;
          if (Array.isArray(matrixValue)) {
            const parsed = matrixValue.map(item => {
              const fields = item.mapValue?.fields || {};
              
              const parseVal = (f) => {
                if (!f) return 0;
                if (f.integerValue !== undefined) return parseInt(f.integerValue, 10);
                if (f.doubleValue !== undefined) return parseFloat(f.doubleValue);
                if (f.stringValue !== undefined) return parseFloat(f.stringValue) || 0;
                return 0;
              };

              return {
                nivel: fields.nivel?.stringValue || 'Nivel',
                minPts: parseVal(fields.minPts),
                maxPts: parseVal(fields.maxPts),
                setupMin: parseVal(fields.setupMin),
                setupMax: parseVal(fields.setupMax),
                mensualidad: parseVal(fields.mensualidad),
                comision: parseVal(fields.comision)
              };
            });
            if (parsed.length > 0) {
              pricingMatrix = parsed;
              cachedPricingMatrix = parsed;
              pricingMatrixLastFetched = now;
            }
          }
        }
      } catch (err) {
        console.warn(`[Briefing Analyze] Falló al consultar matriz de precios en Firestore central, usando valores por defecto:`, err.message);
      }
    }

    // Clasificación por nivel según el totalScore
    let matchedTier = pricingMatrix.find(tier => totalScore >= tier.minPts && totalScore <= tier.maxPts);
    if (!matchedTier) {
      matchedTier = pricingMatrix[pricingMatrix.length - 1];
    }

    const nivel = matchedTier.nivel;
    const minSetup = matchedTier.setupMin;
    const maxSetup = matchedTier.setupMax;
    const mensualidad = matchedTier.mensualidad;
    const comision = matchedTier.comision;

    // 3. Recomendar Feature Flags
    const recommendedFlags = {};
    if (manifest && manifest.featureFlags) {
      for (const flag of manifest.featureFlags) {
        recommendedFlags[flag.id] = false;
      }

      if (manifest.flagRecommendationRules) {
        for (const rule of manifest.flagRecommendationRules) {
          let match = false;
          if (rule.field === 'seccion15.obligatorios') {
            if (Array.isArray(rule.includes)) {
              match = rule.includes.some(inc => reqFuncionales.includes(inc));
            } else {
              match = reqFuncionales.includes(rule.includes);
            }
          } else if (rule.field === 'seccion4.canales') {
            const canales = briefing.seccion4?.canales || [];
            if (Array.isArray(rule.includes)) {
              match = rule.includes.some(inc => canales.includes(inc));
            } else {
              match = canales.includes(rule.includes);
            }
          } else if (rule.field === 'seccion6.roles.rol') {
            const roles = briefing.seccion6?.roles || [];
            match = roles.some(r => r.rol?.toLowerCase().includes(rule.matchSub));
          } else if (rule.field === 'seccion3.sector') {
            const sectorVal = briefing.seccion3?.sector || '';
            match = sectorVal.toLowerCase().includes(rule.matchSub);
          }

          if (match && rule.andIntegration) {
            match = integraciones.includes(rule.andIntegration);
          }

          if (match) {
            recommendedFlags[rule.flag] = true;
          }
        }
      }
    } else {
      recommendedFlags.creditsEnabled = reqFuncionales.includes('credito');
      recommendedFlags.couponsEnabled = reqFuncionales.includes('cupones') || reqFuncionales.includes('fidelizacion');
      recommendedFlags.claimsEnabled = reqFuncionales.includes('garantias') || reqFuncionales.includes('reclamaciones');
      recommendedFlags.wholesaleEnabled = reqFuncionales.includes('mayoreo') || briefing.seccion4?.canales?.includes('b2b');
      recommendedFlags.deliveryEnabled = reqFuncionales.includes('domicilio') || reqFuncionales.includes('delivery');
      recommendedFlags.commissionsEnabled = reqFuncionales.includes('comisiones') || briefing.seccion6?.roles?.some(r => r.rol?.toLowerCase().includes('vendedor'));
      recommendedFlags.enableDianBilling = reqFuncionales.includes('dian');
      recommendedFlags.reservasEnabled = reqFuncionales.includes('agenda') || reqFuncionales.includes('citas');
      recommendedFlags.posExpressScanner = reqFuncionales.includes('pos') && integraciones.includes('impresora');
      recommendedFlags.ordenesTrabajo = reqFuncionales.includes('ordenes') || briefing.seccion3?.sector?.toLowerCase().includes('servicio tecnico');
    }

    // 4. Recomendar Componentes de la biblioteca
    const suggestedComponents = [];
    if (manifest && manifest.componentMappings) {
      for (const mapping of manifest.componentMappings) {
        if (recommendedFlags[mapping.flag]) {
          suggestedComponents.push(...mapping.components);
        }
      }
    } else {
      if (recommendedFlags.creditsEnabled) {
        suggestedComponents.push({ name: 'Tarjeta de Pedido Admin', technicalName: 'OrderCard', link: 'Pedidos_y_Gestion/Tarjeta_Pedido_Admin/tarjeta_pedido_admin.md' });
        suggestedComponents.push({ name: 'Sistema de Transacciones Atómicas', technicalName: 'InventoryTransactionService', link: 'Servicios_y_Firebase/Transacciones_Atomicas_Inventario/transacciones_atomicas_inventario.md' });
      }
      if (recommendedFlags.couponsEnabled) {
        suggestedComponents.push({ name: 'Aplicador Animado de Cupones', technicalName: 'InteractiveCouponBadge', link: 'Formularios_y_UI/Interactive_Coupon_Badge/interactive_coupon_badge.md' });
        suggestedComponents.push({ name: 'Motor Dinámico de Cupones', technicalName: 'couponService', link: 'Servicios_y_Firebase/Motor_Cupones/motor_cupones.md' });
      }
      if (recommendedFlags.deliveryEnabled) {
        suggestedComponents.push({ name: 'Servicio de Gestión de Domicilios', technicalName: 'deliveryService', link: 'Servicios_y_Firebase/Gestion_Domicilios/gestion_domicilios.md' });
        suggestedComponents.push({ name: 'Panel de Reparto de Domicilios', technicalName: 'DeliveryPanel', link: 'Paginas/Panel_Domicilio/panel_domicilio.md' });
      }
      if (recommendedFlags.reservasEnabled) {
        suggestedComponents.push({ name: 'Selector de Fecha y Rangos', technicalName: 'DatePickerPremium', link: 'Formularios_y_UI/Calendario_Premium/calendario_premium.md' });
      }
      if (recommendedFlags.posExpressScanner) {
        suggestedComponents.push({ name: 'POS Express Scanner', technicalName: 'posExpressScanner', link: 'Pedidos_y_Gestion/pos_express_scanner.md' });
      }
    }

    if (briefing.seccion14?.colorPrimario) {
      suggestedComponents.push({ name: 'Sistema de Temas Dinámicos', technicalName: 'ThemeManager', link: 'Utilidades/Sistema_Temas_Dinamicos/sistema_temas.md' });
    }

    // 5. Enriquecer Componentes con metadatos de categoría y pistas de adaptación
    const getComponentMeta = (comp, brf) => {
      const link = comp.link || '';
      const parts = link.split('/');
      const category = parts[0] || 'Otros';
      
      let typeKey = 'component';
      if (category.toLowerCase().includes('servicio') || category.toLowerCase().includes('firebase') || link.toLowerCase().includes('service')) {
        typeKey = 'service';
      } else if (category.toLowerCase().includes('hook') || category.toLowerCase().includes('logica') || link.toLowerCase().includes('hook')) {
        typeKey = 'hook';
      } else if (category.toLowerCase().includes('pagina') || category.toLowerCase().includes('modulo') || link.toLowerCase().includes('paginas')) {
        typeKey = 'module';
      } else if (category.toLowerCase().includes('utilidades') || category.toLowerCase().includes('utils')) {
        typeKey = 'service';
      } else if (category.toLowerCase().includes('formulario') || category.toLowerCase().includes('ui')) {
        typeKey = 'component';
      }
      
      const categoryLabels = {
        'Pedidos_y_Gestion': 'Pedidos y Gestión',
        'Servicios_y_Firebase': 'Servicios & Backend',
        'Formularios_y_UI': 'Formularios y UI',
        'Paginas': 'Módulos y Páginas',
        'Utilidades': 'Utilidades de Sistema',
        'Logica_y_Hooks': 'Lógica & Hooks'
      };
      const categoryLabel = categoryLabels[category] || category.replace(/_/g, ' ');

      const hints = [];
      const primaryColor = brf.seccion14?.colorPrimario || '#6366f1';
      const secondaryColor = brf.seccion14?.colorSecundario || '#4f46e5';
      const sectorVal = brf.seccion3?.sector || 'comercial';
      const empresaVal = brf.seccion1?.nombre || 'la empresa';

      hints.push(`Branding: Usar variables CSS del tema del cliente (${primaryColor} como primario y ${secondaryColor} como secundario).`);
      
      if (comp.technicalName === 'OrderCard') {
        hints.push(`Firestore: Conectar con la colección de pedidos del cliente (ej: \`pedidos_${empresaVal.toLowerCase().replace(/[^a-z0-9]/g, '')}\`).`);
        hints.push(`UX: Adaptar estados de entrega específicos del sector ${sectorVal}.`);
      } else if (comp.technicalName === 'InventoryTransactionService') {
        hints.push(`Seguridad: Implementar transacciones atómicas de Firestore para proteger stocks.`);
        hints.push(`Log: Registrar operaciones en el historial de transacciones.`);
      } else if (comp.technicalName === 'InteractiveCouponBadge') {
        hints.push(`Visual: Utilizar micro-interacciones suaves al validar y aplicar cupones.`);
        hints.push(`Branding: Asegurar que el fondo HSL combine con el color de marca ${primaryColor}.`);
      } else if (comp.technicalName === 'couponService') {
        hints.push(`Firebase: Enlazar reglas de validación en la colección de Firestore \`cupones\`.`);
      } else if (comp.technicalName === 'deliveryService' || comp.technicalName === 'DeliveryPanel') {
        hints.push(`Integración: Configurar geolocalización o rutas en caliente basadas en coordenadas.`);
      } else if (comp.technicalName === 'DatePickerPremium') {
        hints.push(`Formatos: Usar calendarios con soporte de zonas horarias locales.`);
      } else if (comp.technicalName === 'posExpressScanner') {
        hints.push(`Hardware: Asegurar soporte para lector de código de barras físico o cámara del celular.`);
      } else if (comp.technicalName === 'ThemeManager') {
        hints.push(`Branding: Inyectar dinámicamente variables CSS en el elemento root de la app.`);
      } else {
        hints.push(`Adaptación: Validar imports y dependencias internas descritas en su manifiesto.`);
      }

      return {
        category,
        categoryLabel,
        typeKey,
        adaptationHints: hints
      };
    };

    const enrichedComponents = suggestedComponents.map(comp => {
      const meta = getComponentMeta(comp, briefing);
      return { ...comp, ...meta };
    });

    const appContext = {
      sector: briefing.seccion3?.sector || 'Comercial',
      primaryColor: briefing.seccion14?.colorPrimario || '#6366f1',
      secondaryColor: briefing.seccion14?.colorSecundario || '#4f46e5',
      googleFont: briefing.seccion14?.googleFont || 'Inter',
      enabledFlags: Object.entries(recommendedFlags).filter(([_, v]) => v).map(([k]) => k),
      firestorePrefix: (briefing.seccion1?.nombre || 'cliente').toLowerCase().replace(/[^a-z0-9]/g, ''),
      clientName: briefing.seccion1?.nombre || 'Cliente Nuevo'
    };

    // 6. Generar Resumen Ejecutivo
    const sector = briefing.seccion3?.sector || 'comercial';
    const nombreNegocio = briefing.seccion1?.nombre || 'la empresa';
    const dolores = briefing.seccion7?.doloresPrincipales || 'falta de control';
    const resumen = `El cliente opera en el sector ${sector} bajo la marca ${nombreNegocio}. Su principal dolor consiste en ${dolores}, lo cual impacta la eficiencia administrativa perdiendo aproximadamente ${horasPerdidas} horas semanales. Se recomienda implementar una solución de marca blanca nivel ${nivel} con el core base habilitando las feature flags de ${Object.entries(recommendedFlags).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'ninguna en particular'}.`;

    res.json({
      score: {
        funcional: scoreFuncional,
        tecnico: scoreTecnico,
        personalizacion: scorePersonalizacion,
        riesgo: scoreRiesgo,
        valor: scoreValor,
        total: totalScore,
        nivel
      },
      pricing: {
        minSetup,
        maxSetup,
        mensualidad,
        comision
      },
      recommendedFlags,
      suggestedComponents: enrichedComponents,
      appContext,
      resumenEjecutivo: resumen
    });
  } catch (err) {
    res.status(500).json({ error: `Fallo al procesar análisis cognitivo del briefing: ${err.message}` });
  }
});

// POST /api/briefing/export
app.post('/api/briefing/export', async (req, res) => {
  const { empresa, contacto, fecha, briefingData, analisisData, coreKey } = req.body;

  if (!empresa || !contacto || !fecha || !briefingData || !analisisData) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos: empresa, contacto, fecha, briefingData, analisisData.' });
  }

  const cleanEmpresa = sanitizeFileName(empresa);
  const cleanContacto = sanitizeFileName(contacto);
  const cleanFecha = sanitizeFileName(fecha);
  const targetCoreKey = coreKey || 'ventas';

  try {
    // Intentar leer la sección del mapa del manifiesto del core
    let docSectionHeader = '## 📂 Sección 5 — Estrategia Comercial y Levantamiento';
    const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');
    if (await fs.pathExists(registroPath)) {
      const registro = await fs.readJson(registroPath);
      const coreConfig = registro.plantillas[targetCoreKey];
      if (coreConfig) {
        const manifestPath = path.join(coreConfig.fuente.replace(/\//g, path.sep), 'core-manifest.json');
        if (await fs.pathExists(manifestPath)) {
          const manifest = await fs.readJson(manifestPath);
          if (manifest.categoryDocSection) {
            docSectionHeader = manifest.categoryDocSection;
          }
        }
      }
    }

    const docRoot = getDocumentationRoot();
    const levantamientoDir = path.join(docRoot, '05_Estrategia_Comercial_Ecosistema', 'Plantillas_de_Levantamiento');
    const clienteDir = path.join(levantamientoDir, cleanContacto);
    await fs.ensureDir(clienteDir);

    const briefingFileName = `briefing_${cleanEmpresa}_${cleanFecha}.md`;
    const analisisFileName = `analisis_${cleanEmpresa}_${cleanFecha}.md`;

    const briefingFilePath = path.join(clienteDir, briefingFileName);
    const analisisFilePath = path.join(clienteDir, analisisFileName);

    // Escribir archivos a disco
    await fs.writeFile(briefingFilePath, briefingData, 'utf-8');
    await fs.writeFile(analisisFilePath, analisisData, 'utf-8');

    // Sincronizar en el mapa de documentación
    const mapaPath = path.join(docRoot, '04_Estandares_y_Skills', 'mapa_documentacion_ia.md');
    if (await fs.pathExists(mapaPath)) {
      let mapaContent = await fs.readFile(mapaPath, 'utf-8');
      
      const docRootUrl = `file:///${docRoot.replace(/\\/g, '/')}`;
      const newBriefingRow = `| **${briefingFileName}** | Levantamiento de Requerimientos | Registro detallado de la entrevista de descubrimiento comercial para ${empresa} realizada el ${fecha}. | [Ver Briefing](${docRootUrl}/05_Estrategia_Comercial_Ecosistema/Plantillas_de_Levantamiento/${cleanContacto}/${briefingFileName}) |\n`;
      const newAnalisisRow = `| **${analisisFileName}** | Análisis Post-Descubrimiento | Diagnóstico técnico, estimación de complejidad y roadmap comercial para ${empresa}. | [Ver Análisis](${docRootUrl}/05_Estrategia_Comercial_Ecosistema/Plantillas_de_Levantamiento/${cleanContacto}/${analisisFileName}) |\n`;

      const sectionIndex = mapaContent.indexOf(docSectionHeader);
      
      if (sectionIndex !== -1) {
        const endTableIndex = mapaContent.indexOf('---', sectionIndex + docSectionHeader.length);
        if (endTableIndex !== -1) {
          mapaContent = mapaContent.substring(0, endTableIndex - 1) + '\n' + newBriefingRow + newAnalisisRow + mapaContent.substring(endTableIndex);
          await fs.writeFile(mapaPath, mapaContent, 'utf-8');
        }
      }
    }

    res.json({
      success: true,
      message: 'Briefing y Análisis exportados correctamente en la subcarpeta del contacto del cliente y mapa de documentación actualizado.',
      briefingPath: briefingFilePath,
      analisisPath: analisisFilePath
    });
  } catch (err) {
    res.status(500).json({ error: `Fallo al exportar briefing a Markdown: ${err.message}` });
  }
});

// GET /api/health/check
app.get('/api/health/check', async (req, res) => {
  const { clients } = req.query; // Espera CSV de URLS en formato: client1,url1;client2,url2;...
  if (!clients) {
    return res.status(400).json({ error: 'Falta el parámetro "clients". Formato esperado: id1,url1;id2,url2;...' });
  }

  const clientList = clients.split(';').map(c => {
    const [id, url] = c.split(',');
    return { id: id?.trim(), url: url?.trim() };
  }).filter(c => c.id && c.url);

  try {
    const results = await Promise.allSettled(
      clientList.map(async (client) => {
        const startTime = Date.now();
        let httpStatus = 0;
        let hasPwa = false;
        let responseTimeMs = 0;
        let status = 'red';

        try {
          // Realizar fetch al sitio web del cliente con timeout de 5 segundos
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(client.url, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          httpStatus = response.status;
          responseTimeMs = Date.now() - startTime;

          if (response.ok) {
            status = responseTimeMs < 2000 ? 'green' : 'yellow';

            // Intentar verificar PWA manifest
            const pwaController = new AbortController();
            const pwaTimeoutId = setTimeout(() => pwaController.abort(), 2000);
            
            // Intenta leer manifest.json o manifest.webmanifest en la raíz
            const manifestUrl = client.url.endsWith('/') ? `${client.url}manifest.webmanifest` : `${client.url}/manifest.webmanifest`;
            const pwaResponse = await fetch(manifestUrl, { signal: pwaController.signal });
            clearTimeout(pwaTimeoutId);

            if (pwaResponse.ok) {
              hasPwa = true;
            } else {
              // Intenta alternativo manifest.json
              const altManifestUrl = client.url.endsWith('/') ? `${client.url}manifest.json` : `${client.url}/manifest.json`;
              const altPwaController = new AbortController();
              const altPwaTimeoutId = setTimeout(() => altPwaController.abort(), 2000);
              const altPwaResponse = await fetch(altManifestUrl, { signal: altPwaController.signal });
              clearTimeout(altPwaTimeoutId);
              if (altPwaResponse.ok) {
                hasPwa = true;
              }
            }
          }
        } catch (fetchErr) {
          // Si falla, se queda en status 'red'
          responseTimeMs = Date.now() - startTime;
        }

        return {
          id: client.id,
          url: client.url,
          status,
          httpStatus,
          responseTimeMs,
          hasPwa,
          lastCheck: new Date().toISOString()
        };
      })
    );

    const formattedResults = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      return {
        id: clientList[i].id,
        url: clientList[i].url,
        status: 'red',
        httpStatus: 0,
        responseTimeMs: 0,
        hasPwa: false,
        lastCheck: new Date().toISOString(),
        error: r.reason?.message
      };
    });

    res.json(formattedResults);
  } catch (err) {
    res.status(500).json({ error: `Fallo en el Health Monitor global: ${err.message}` });
  }
});

// GET /api/health/:clientId
app.get('/api/health/:clientId', async (req, res) => {
  const { clientId } = req.params;
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Falta el parámetro "url".' });
  }

  const startTime = Date.now();
  let httpStatus = 0;
  let hasPwa = false;
  let responseTimeMs = 0;
  let status = 'red';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    httpStatus = response.status;
    responseTimeMs = Date.now() - startTime;

    if (response.ok) {
      status = responseTimeMs < 2000 ? 'green' : 'yellow';

      const pwaController = new AbortController();
      const pwaTimeoutId = setTimeout(() => pwaController.abort(), 2000);
      const manifestUrl = url.endsWith('/') ? `${url}manifest.webmanifest` : `${url}/manifest.webmanifest`;
      const pwaResponse = await fetch(manifestUrl, { signal: pwaController.signal });
      clearTimeout(pwaTimeoutId);

      if (pwaResponse.ok) {
        hasPwa = true;
      }
    }
  } catch (fetchErr) {
    responseTimeMs = Date.now() - startTime;
  }

  res.json({
    id: clientId,
    url,
    status,
    httpStatus,
    responseTimeMs,
    hasPwa,
    lastCheck: new Date().toISOString()
  });
});

// Caché en memoria para guardar el formato de bucket exitoso de cada cliente
const storageBucketCache = new Map(); // clientId -> bucketName

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/project/firebase/cors-setup
// Configuración automatizada de CORS en Google Cloud Storage para el bucket de Firebase
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/project/firebase/cors-setup', async (req, res) => {
  const { clientId, allowedOrigins } = req.body;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  try {
    const projectPath = await findProjectDir(clientId);
    if (!projectPath) return res.status(404).json({ error: `Proyecto no encontrado para el cliente: ${clientId}` });

    const firebaseRcPath = path.join(projectPath, '.firebaserc');
    if (!(await fs.pathExists(firebaseRcPath))) {
      return res.status(400).json({ error: 'No se encontró el archivo .firebaserc en la instancia del cliente.' });
    }

    const rc = await fs.readJson(firebaseRcPath);
    const projectId = rc.projects?.default;
    if (!projectId) {
      return res.status(400).json({ error: 'No se definió un proyecto default de Firebase en .firebaserc' });
    }

    const corsConfig = [
      {
        "origin": allowedOrigins || ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
        "method": ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
        "responseHeader": ["Content-Type", "Authorization", "x-goog-meta-custom-header"],
        "maxAgeSeconds": 3600
      }
    ];

    const tempCorsPath = path.join(projectPath, 'cors-temp.json');
    await fs.writeJson(tempCorsPath, corsConfig, { spaces: 2 });

    const bucketName1 = `${projectId}.appspot.com`.replace(/[^a-z0-9\-\.\_]/gi, '');
    const bucketName2 = `${projectId}.firebasestorage.app`.replace(/[^a-z0-9\-\.\_]/gi, '');

    let success = false;
    let lastError = null;
    let cmdOutput = '';

    const cachedBucket = storageBucketCache.get(clientId);

    if (cachedBucket) {
      try {
        const { stdout, stderr } = await execAsync(`gsutil cors set cors-temp.json gs://${cachedBucket}`, { cwd: projectPath, timeout: 30000 });
        cmdOutput = `[gsutil] (Caché) Configurando CORS en gs://${cachedBucket}...\n` + (stdout || '') + '\n' + (stderr || '') + '\n[Éxito] Reglas aplicadas correctamente.';
        success = true;
      } catch (errCache) {
        lastError = errCache;
        storageBucketCache.delete(clientId); // Si falla el caché (ej. se borró el bucket), lo limpiamos
      }
    }

    if (!success) {
      try {
        const { stdout, stderr } = await execAsync(`gsutil cors set cors-temp.json gs://${bucketName1}`, { cwd: projectPath, timeout: 30000 });
        cmdOutput = `[gsutil] Configurando CORS en gs://${bucketName1}...\n` + (stdout || '') + '\n' + (stderr || '') + '\n[Éxito] Reglas aplicadas correctamente.';
        storageBucketCache.set(clientId, bucketName1);
        success = true;
      } catch (err1) {
        lastError = err1;
        if (err1.message.includes('404') || err1.message.includes('not exist') || err1.message.includes('NotFoundException')) {
          console.log(`[cors-setup] Bucket ${bucketName1} no encontrado. Intentando fallback con ${bucketName2}...`);
          try {
            const { stdout, stderr } = await execAsync(`gsutil cors set cors-temp.json gs://${bucketName2}`, { cwd: projectPath, timeout: 30000 });
            cmdOutput = `[gsutil] Bucket ${bucketName1} no encontrado (404).\n[gsutil] Configurando CORS en gs://${bucketName2} (Fallback)...\n` + (stdout || '') + '\n' + (stderr || '') + '\n[Éxito] Reglas aplicadas correctamente.';
            storageBucketCache.set(clientId, bucketName2);
            success = true;
          } catch (err2) {
            lastError = err2;
          }
        }
      }
    }

    await fs.remove(tempCorsPath);

    if (!success) {
      throw lastError;
    }

    res.json({ success: true, message: `Políticas CORS aplicadas con éxito en el bucket.`, output: cmdOutput.trim() });
  } catch (err) {
    console.error(`[cors-setup] Error: ${err.message}`);
    let userFriendlyError = err.message;
    if (err.message.includes('gsutil') && (err.message.includes('no se reconoce') || err.message.includes('not found') || err.message.includes('ENOENT') || err.message.includes('is not recognized'))) {
      userFriendlyError = 'El comando "gsutil" de Google Cloud SDK no está instalado o no se encuentra en las Variables de Entorno (PATH) de tu sistema. Solución: 1) Instala "gcloud CLI" de Google Cloud, o 2) Agrega la ruta de instalación de gcloud/bin al PATH de tu Windows.';
    }
    res.status(500).json({ error: `Fallo al configurar CORS: ${userFriendlyError}` });
  }
});

async function startServer(port) {
  try {
    await initializeCliSecurityToken();
  } catch (err) {
    console.error('❌ Error crítico al inicializar el token de seguridad loopback:', err.message);
    process.exit(1);
  }

  const server = app.listen(port, '127.0.0.1', () => {
    // Paleta de colores ANSI
    const c = {
      cyan: '\x1b[36m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      magenta: '\x1b[35m',
      red: '\x1b[31m',
      white: '\x1b[37m',
      blue: '\x1b[34m',
      bold: '\x1b[1m',
      dim: '\x1b[2m',
      reset: '\x1b[0m'
    };

    // Diccionario estructurado de descripciones funcionales de la API (79 endpoints)
    const routeDescriptions = {
      'GET:/api/templates': 'Obtener plantillas registradas',
      'GET:/api/firebase-config': 'Obtener configuración de Firebase',
      'POST:/api/firebase/validate': 'Validar credenciales de Firebase',
      'GET:/api/vapid/generate': 'Generar claves VAPID para notificaciones',
      'POST:/api/upload-logo': 'Cargar logo de la instancia',
      'POST:/api/create-project': 'Aprovisionar nuevo proyecto cliente',
      'GET:/api/create-project/stream': 'SSE Stream logs de aprovisionamiento',
      'GET:/api/library': 'Listar componentes de la biblioteca',
      'GET:/api/library/file': 'Leer contenido markdown de componente',
      'POST:/api/library/extract': 'Extraer componente de código a biblioteca',
      'POST:/api/library/inject/preflight': 'Pre-verificación de dependencias y conflictos',
      'POST:/api/library/inject/css-doctor': 'Diagnosticar y parchar estilos CSS',
      'POST:/api/library/sandbox/scaffold': 'Crear playground Sandbox para componente',
      'POST:/api/library/inject/diagnose': 'Verificación de compilación de componente',
      'POST:/api/library/inject': 'Inyectar componente en instancia',
      'POST:/api/library/inject/stream': 'SSE Stream logs de inyección',
      'GET:/api/library/inject/registry': 'Listar componentes inyectados',
      'POST:/api/library/inject/rollback': 'Reversión y desinstalación de componente',
      'GET:/api/library/inject/audit-trail': 'Historial de inyecciones',
      'GET:/api/library/inject/audit-diff': 'Diff del estado del código',
      'GET:/api/project/file': 'Leer archivo físico de instancia',
      'GET:/api/e2e/projects': 'Listar casos de prueba',
      'POST:/api/e2e/run': 'Ejecutar suite de pruebas E2E',
      'GET:/api/e2e/last-result': 'Obtener reportes de la última prueba',
      'POST:/api/register-core': 'Registrar nuevo Core',
      'GET:/api/cores': 'Listar cores registrados en disco',
      'GET:/api/cores/metadata': 'Metadatos consolidados de cores',
      'POST:/api/cores/:clave/scaffold': 'Generar estructura base de otro core',
      'POST:/api/cores/:clave/activate': 'Activar core en el wizard',
      'POST:/api/cores/:clave/bump-version': 'Incrementar versión SemVer patch y sincronizar',
      'POST:/api/cores/:clave/sync': 'Sincronizar core manualmente',
      'GET:/api/cores/:clave/drift': 'Analizar desviación de core',
      'GET:/api/cores/:clave/diff': 'Ver diferencias de archivos',
      'POST:/api/project/sync-database': 'Forzar sincronización de esquemas',
      'POST:/api/cores/:clave/deactivate': 'Retirar core del wizard',
      'DELETE:/api/cores/:clave': 'Eliminar permanentemente plantilla',
      'GET:/api/project/env': 'Consultar variables .env.local',
      'POST:/api/project/env': 'Guardar variables .env.local',
      'GET:/api/project/audit': 'Diagnósticos PWA, SEO y rendimiento',
      'POST:/api/project/fix/chunks': 'Corregir empaquetado de assets',
      'POST:/api/project/fix/pwa': 'Regenerar manifest/iconos PWA',
      'POST:/api/project/fix/rules': 'Desplegar reglas de Firestore',
      'GET:/api/project/drift': 'Analizar desalineación NPM y archivos',
      'POST:/api/project/sync-file': 'Sincronizar archivo individual',
      'POST:/api/project/sync-files': 'Sincronizar lote de archivos',
      'GET:/api/project/deploy': 'SSE Stream de compilación y despliegue a Firebase Hosting',
      'POST:/api/project/deploy': 'Compilar y desplegar instancia a Firebase Hosting',
      'PUT:/api/project/deploy': 'Compilar y desplegar (reintento) a Firebase Hosting',
      'DELETE:/api/project/deploy': 'Compilar y desplegar (descartar/limpiar) a Firebase Hosting',
      'GET:/api/project/dev/status': 'Estado del servidor local',
      'GET:/api/project/dev/logs-stream': 'SSE Stream logs de consola de Vite',
      'POST:/api/project/dev/start': 'Iniciar servidor local',
      'POST:/api/project/dev/stop': 'Detener servidor local',
      'GET:/api/project/drift/global': 'Paridad global de marcas',
      'POST:/api/git/discard': 'Descarte de cambios locales',
      'POST:/api/git/link-tasks': 'Vincular tareas sin commits',
      'GET:/api/git/diff-file': 'Diff visual HTML de archivos',
      'GET:/api/project/dependencies/install': 'SSE Stream de npm install',
      'GET:/api/git/targets': 'Obtener repositorios activos',
      'GET:/api/git/status': 'Estado de cambios Git',
      'GET:/api/git/log': 'Historial de commits',
      'GET:/api/git/backup-stream': 'SSE Stream de backup en vivo',
      'GET:/api/git/cores-and-clients': 'Listar repositorios de cores e instancias',
      'GET:/api/git/sync-core-to-clients-stream': 'SSE Stream de propagación Git',
      'GET:/api/instancias/list': 'Listar carpetas físicas de clientes',
      'GET:/api/instancias/sync-and-deploy-stream': 'SSE Stream de despliegue en lote',
      'GET:/api/project/firebase-rules/drift-global': 'Comprobar desviación de reglas',
      'POST:/api/project/firebase-rules/deploy': 'Desplegar reglas en lote',
      'GET:/api/roadmap': 'Consultar roadmap del Bridge',
      'POST:/api/roadmap/toggle': 'Marcar estado de tarea',
      'POST:/api/roadmap/add': 'Crear nueva tarea en el roadmap',
      'GET:/api/niches': 'Listar todos los nichos y esquemas dinámicos',
      'POST:/api/niches': 'Registrar nueva vertical de negocio',
      'PUT:/api/niches/:id': 'Actualizar vertical de negocio',
      'DELETE:/api/niches/:id': 'Eliminar vertical de negocio',
      'GET:/api/integrity/status': 'Consistencia de base de datos local',
      'GET:/api/cli/logs/stream': 'SSE Stream de logs internos del Bridge',
      'POST:/api/project/db/seed': 'Sembrado de datos dinámicos (Smart Seeding)',
      'POST:/api/git/sync-rules': 'Propagar reglas del workspace',
      'POST:/api/library/manual': 'Registrar componente manual',
      'POST:/api/project/cleanup': 'Limpiar caché y temporales',
      'POST:/api/briefing/analyze': 'Analizar cuestionario de briefing',
      'POST:/api/briefing/export': 'Exportar propuesta de negocio',
      'GET:/api/health/check': 'Estado de salud del Bridge',
      'GET:/api/health/:clientId': 'Métricas de ping de cliente',
      'POST:/api/project/firebase/cors-setup': 'Configurar CORS en Firebase Storage'
    };

    // 1. Obtener todas las rutas registradas en Express dinámicamente
    const registeredRoutes = [];
    if (app._router && app._router.stack) {
      app._router.stack.forEach(layer => {
        if (layer.route) {
          const path = layer.route.path;
          const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
          methods.forEach(method => {
            registeredRoutes.push({ method, path });
          });
        }
      });
    }

    // 2. Definir categorías de ordenamiento
    const categories = [
      {
        id: 'niches',
        title: '🛍️  GESTIÓN DE NICHOS / VERTICALES DE NEGOCIO',
        pattern: /^\/api\/niches/i,
        items: []
      },
      {
        id: 'cores',
        title: '🏗️  GESTIÓN DE CORES Y PLANTILLAS BASE',
        pattern: /^\/api\/(templates|cores|register-core|project\/sync-database)/i,
        items: []
      },
      {
        id: 'instances',
        title: '⚙️  APROVISIONAMIENTO Y CONTROL DE INSTANCIAS (FIREBASE / PROYECTOS)',
        pattern: /^\/api\/(firebase|create-project|project\/file|project\/env|project\/audit|project\/fix|project\/drift|project\/sync-file|project\/sync-files|project\/db\/seed|project\/cleanup)/i,
        items: []
      },
      {
        id: 'library',
        title: '📦  INYECTOR DE COMPONENTES (LIBRARY INJECTOR)',
        pattern: /^\/api\/library/i,
        items: []
      },
      {
        id: 'dev_server',
        title: '📡  SERVIDORES DE DESARROLLO (VITE DAEMON)',
        pattern: /^\/api\/project\/(dev|dependencies)/i,
        items: []
      },
      {
        id: 'git',
        title: '🔒  CONTROL DE VERSIONES GIT & BACKUPS',
        pattern: /^\/api\/git/i,
        items: []
      },
      {
        id: 'testing',
        title: '🧪  TESTING AUTOMATIZADO (PLAYWRIGHT)',
        pattern: /^\/api\/e2e/i,
        items: []
      },
      {
        id: 'health_utils',
        title: '🩺  SALUD, DIAGNÓSTICOS, BRIEFING & UTILS',
        pattern: /^\/api\/(health|integrity|cli\/logs\/stream|roadmap|briefing|vapid|upload-logo|instancias)/i,
        items: []
      },
      {
        id: 'others',
        title: '⚡  OTROS ENDPOINTS DETECTADOS (AUTODETECT)',
        pattern: /.*/,
        items: []
      }
    ];

    // 3. Clasificar cada ruta
    registeredRoutes.forEach(r => {
      // Solo procesamos métodos HTTP estándar relevantes para la API REST
      const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
      if (!allowedMethods.includes(r.method)) return;

      // Ignorar wildcards globales de express, archivos estáticos o middlewares auxiliares
      if (r.path === '*' || r.path === '/*' || r.path.includes(':file') || !r.path.startsWith('/api')) return;

      const key = `${r.method}:${r.path}`;
      const desc = routeDescriptions[key] || 'Nueva ruta activa (autodetectada, sin descripción)';
      
      let matched = false;
      for (let i = 0; i < categories.length - 1; i++) {
        if (categories[i].pattern.test(r.path)) {
          categories[i].items.push({ method: r.method, route: r.path, desc });
          matched = true;
          break;
        }
      }
      if (!matched) {
        categories[categories.length - 1].items.push({ method: r.method, route: r.path, desc });
      }
    });

    // 4. Calcular total de rutas válidas mostradas
    const totalValidRoutes = categories.reduce((sum, cat) => sum + cat.items.length, 0);

    // 5. Imprimir la cabecera
    console.log(`\n${c.cyan}${c.bold}====================================================================================================${c.reset}`);
    console.log(`${c.cyan}${c.bold}  🚀  [Prototype CLI Bridge Server] Escuchando en: http://127.0.0.1:${port}${c.reset}`);
    console.log(`${c.cyan}${c.bold}  📡  Rutas REST detectadas: ${totalValidRoutes} endpoints activos y blindados.${c.reset}`);
    console.log(`${c.cyan}${c.bold}====================================================================================================${c.reset}`);

    // 6. Imprimir las categorías con items
    categories.forEach(cat => {
      if (cat.items.length === 0) return;
      
      console.log(`\n  ${c.bold}${c.white}─── ${cat.title} ───${c.reset}`);
      cat.items.forEach(item => {
        let methodStr = '';
        if (item.method === 'GET') methodStr = `${c.green}${c.bold}GET   ${c.reset}`;
        else if (item.method === 'POST') methodStr = `${c.yellow}${c.bold}POST  ${c.reset}`;
        else if (item.method === 'PUT') methodStr = `${c.magenta}${c.bold}PUT   ${c.reset}`;
        else if (item.method === 'DELETE') methodStr = `${c.red}${c.bold}DELETE${c.reset}`;
        else methodStr = `${c.blue}${c.bold}${item.method.padEnd(6)}${c.reset}`;

        const fullUrl = `http://localhost:${port}${item.route}`;
        const padding = ' '.repeat(Math.max(1, 65 - fullUrl.length));
        console.log(`   ${methodStr}  ${c.cyan}${fullUrl}${c.reset}${padding}${c.dim}→ ${item.desc}${c.reset}`);
      });
    });

    console.log(`\n${c.cyan}${c.bold}====================================================================================================${c.reset}\n`);
  });

  server.on('error', async (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`\n⚠️  [EADDRINUSE] El puerto ${port} está en uso por otro proceso.`);
      console.warn(`   Intentando identificar y liberar el proceso que bloquea el puerto ${port}...`);
      try {
        // Identificar el PID del proceso que ocupa el puerto
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        const pidMatch = stdout.match(/(\d+)\s*$/m);
        if (pidMatch && pidMatch[1]) {
          const pid = pidMatch[1].trim();
          console.warn(`   🔍 Proceso detectado en puerto ${port}: PID ${pid}. Intentando terminar...`);
          await execAsync(`taskkill /PID ${pid} /F`);
          console.log(`   ✅ Proceso ${pid} terminado exitosamente. Reiniciando servidor en puerto ${port}...`);
          setTimeout(() => startServer(port), 500);
        } else {
          throw new Error('No se pudo identificar el PID del proceso bloqueante.');
        }
      } catch (killErr) {
        console.error(`   ❌ No fue posible liberar el puerto ${port} automáticamente.`);
        console.error(`      Causa: ${killErr.message}`);
        console.error(`\n   📋 SOLUCIÓN MANUAL — Ejecuta en una terminal como Administrador:`);
        console.error(`      netstat -ano | findstr :${port}`);
        console.error(`      taskkill /PID [PID_ENCONTRADO] /F`);
        console.error(`\n   O reinicia el equipo si el problema persiste.\n`);
        process.exit(1);
      }
    } else {
      console.error('❌ Error crítico en servidor:', err.message);
    }
  });
}

// Blindaje de proceso global contra fallos asíncronos no controlados
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n⚠️  [Process Shield] Rechazo de promesa no manejado detectado:');
  console.error(reason);
});

process.on('uncaughtException', (err) => {
  console.error('\n⚠️  [Process Shield] Excepción no capturada detectada:');
  console.error(err.message, err.stack);
});

// Ejecutar diagnósticos de dependencias del PATH una sola vez al arranque
await runPreflightChecks();

// Inicializar la cola de aprovisionamiento con sus callbacks de ejecución y difusión SSE
await ProvisioningQueue.initialize(
  async (taskId, answers) => {
    await executeCreationTaskInBackground(taskId, answers);
  },
  (taskId, eventPayload) => {
    const task = activeCreationTasks[taskId];
    if (task && task.listeners) {
      task.listeners.forEach(res => {
        if (!res.writableEnded) {
          res.write(`data: ${JSON.stringify(eventPayload)}\n\n`);
        }
      });
    }
  }
);

startServer(PORT);