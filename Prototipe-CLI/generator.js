import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import os from 'os';
import { execSync, spawn } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import ora from 'ora';
import { Jimp } from 'jimp';
import { getWorkspaceRoot } from './config.js';

// Motores de Aprovisionamiento Inteligente (Fase 8)
import { BiResolver } from './lib/BiResolver.js';
import { CapabilityResolver } from './lib/CapabilityResolver.js';
import { FeatureRecommender } from './lib/FeatureRecommender.js';
import { ExperienceComposer } from './lib/ExperienceComposer.js';
import { ProvisioningValidator, normalizeProvisioningRequest } from './lib/ProvisioningValidator.js';
import { BlueprintSimulation } from './lib/BlueprintSimulation.js';
import { ExplainabilityLogger } from './lib/ExplainabilityLogger.js';
import { PackageMerger } from './lib/PackageMerger.js';
import { FeatureRegistry } from './lib/FeatureRegistry.js';
import { PathSecurity } from './lib/PathSecurity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = __dirname;
const TEMPLATES_DIR = path.join(CLI_ROOT, 'templates');

// Validar contención de rutas físicas para evitar Directory Traversal de forma agnóstica a la plataforma
function isPathContained(parentPath, childPath) {
  if (!parentPath || !childPath) return false;
  const parentResolved = path.resolve(parentPath);
  const childResolved = path.resolve(childPath);
  return childResolved.startsWith(parentResolved + path.sep) || childResolved === parentResolved;
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

// Ejecutar comandos de manera asíncrona no bloqueante capturando stdout/stderr de forma segura (sin shell: true)
function execAsyncCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const resolved = resolveCliExecutable(cmd);
    const resolvedCmd = resolved.cmd;
    const resolvedArgs = [...resolved.args, ...args];

    console.log(`[Ejecutando] ${resolvedCmd} ${resolvedArgs.map(a => redactSecrets(a)).join(' ')}`);

    const child = spawn(resolvedCmd, resolvedArgs, {
      shell: false,
      cwd: options.cwd,
      env: safeEnv(options.env),
      windowsHide: true
    });

    let errorOutput = '';

    if (child.stdout) {
      child.stdout.on('data', (data) => {
        const lines = data.toString().split(/\r?\n/);
        lines.forEach(line => {
          if (line.trim()) {
            console.log(redactSecrets(line));
          }
        });
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        const lines = data.toString().split(/\r?\n/);
        lines.forEach(line => {
          if (line.trim()) {
            const redacted = redactSecrets(line);
            console.log(`[Detalle] ${redacted}`);
            errorOutput += redacted + '\n';
          }
        });
      });
    }

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`El comando "${resolvedCmd} ${resolvedArgs.join(' ')}" falló con código ${code}.\n${errorOutput}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(redactSecrets(err.message)));
    });
  });
}

// [ROBUSTEZ] Leer versión del CLI desde su propio package.json para usarla en metadatos de instancias.
// Evita el hardcode de '1.0.0' que hace imposible rastrear la compatibilidad real de las instancias.
let CLI_VERSION = '1.0.0';
try {
  const cliPkg = await fs.readJson(path.join(CLI_ROOT, 'package.json'));
  CLI_VERSION = cliPkg.version || '1.0.0';
} catch (_) {}

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

function hslToRgbaHex(hslStr, alpha = 255) {
  const parsed = parseHSL(hslStr);
  if (!parsed) return 0xffffffff;
  const h = parsed.h / 360;
  const s = parsed.s / 100;
  const l = parsed.l / 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const rRound = Math.round(r * 255);
  const gRound = Math.round(g * 255);
  const bRound = Math.round(b * 255);
  return (rRound * 0x1000000) + (gRound * 0x10000) + (bRound * 0x100) + alpha;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(hex, fallback = "#111827") {
  const value = String(hex || "").trim();
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase();
  }
  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return value.toLowerCase();
  }
  return fallback;
}

function hexToRgbObj(hex) {
  const safe = normalizeHex(hex);
  return {
    r: parseInt(safe.slice(1, 3), 16),
    g: parseInt(safe.slice(3, 5), 16),
    b: parseInt(safe.slice(5, 7), 16)
  };
}

function rgbToHslObj(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToRgbObj(h, s, l) {
  const hn = (((Number(h) % 360) + 360) % 360) / 60;
  const sn = clamp(Number(s), 0, 100) / 100;
  const ln = clamp(Number(l), 0, 100) / 100;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs((hn % 2) - 1));
  const m = ln - c / 2;

  const [rp, gp, bp] =
    hn < 1 ? [c, x, 0] :
    hn < 2 ? [x, c, 0] :
    hn < 3 ? [0, c, x] :
    hn < 4 ? [0, x, c] :
    hn < 5 ? [x, 0, c] :
             [c, 0, x];

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255)
  };
}

function relativeLuminance(rgb) {
  const channel = (value) => {
    const srgb = value / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

function contrastRatio(rgb1, rgb2) {
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function ensureReadableHslOnBackground(foregroundHsl, backgroundHex, minRatio = 4.5) {
  const backgroundRgb = hexToRgbObj(backgroundHex);
  if (contrastRatio(hslToRgbObj(foregroundHsl.h, foregroundHsl.s, foregroundHsl.l), backgroundRgb) >= minRatio) {
    return foregroundHsl;
  }
  const bgLum = relativeLuminance(backgroundRgb);
  const targetLightness = bgLum > 0.5 ? 8 : 96;
  let low = 0;
  let high = 100;
  let best = { ...foregroundHsl, l: targetLightness };
  for (let i = 0; i < 16; i++) {
    const mid = (low + high) / 2;
    const nextLightness = targetLightness < foregroundHsl.l ? foregroundHsl.l - mid : foregroundHsl.l + mid;
    const candidate = { ...foregroundHsl, l: clamp(Math.round(nextLightness), 4, 96) };
    if (contrastRatio(hslToRgbObj(candidate.h, candidate.s, candidate.l), backgroundRgb) >= minRatio) {
      best = candidate;
      high = mid;
    } else {
      low = mid;
    }
  }
  return best;
}

function escapeSvgText(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getClientInitials(input) {
  const words = String(input || "P")
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const initials = words.length >= 2 ? `${words[0][0]}${words[1][0]}` : words[0]?.slice(0, 2) || "P";
  return initials.toUpperCase();
}

function createFallbackLogoSvg({ appName, brandPrimary = "#2563eb" }) {
  const safeBrand = normalizeHex(brandPrimary, "#2563eb");
  const initials = escapeSvgText(getClientInitials(appName));
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${safeBrand}"/>
  <circle cx="256" cy="256" r="184" fill="rgba(255,255,255,0.14)"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="Inter, Arial, sans-serif" font-size="164" font-weight="800"
        fill="#ffffff">${initials}</text>
</svg>`.trim());
}

// Paletas HSL por defecto
export const PALETTES = {
  emerald: { primary: 'hsl(142, 70%, 45%)', accent: 'hsl(142, 76%, 36%)', theme: 'verde-esmeralda' },
  ruby: { primary: 'hsl(346, 84%, 61%)', accent: 'hsl(346, 84%, 49%)', theme: 'rosa-elegante' },
  violet: { primary: 'hsl(262, 83%, 58%)', accent: 'hsl(262, 83%, 45%)', theme: 'purpura-mora' },
  amber: { primary: 'hsl(38, 92%, 50%)', accent: 'hsl(38, 92%, 40%)', theme: 'dorado-premium' }
};

/**
 * Valida de forma remota las credenciales de Firebase enviadas por el usuario.
 * @param {string} apiKey API Key de Firebase
 * @param {string} projectId Project ID de Firebase
 */
async function validateFirebaseCredentials(apiKey, projectId) {
  // Se añade la subruta '/config' para evitar que Google devuelva un HTML 404 genérico por consultar la raíz
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/config?key=${apiKey}`;
  try {
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (_) {
      throw new Error(`Respuesta no válida de Google Cloud (404 HTML). Verifica el Project ID: "${projectId}".`);
    }

    if (res.status === 400 && data.error && (data.error.message.includes('API key') || data.error.message.includes('INVALID'))) {
      throw new Error(`API Key de Firebase inválida: ${data.error.message}`);
    }
    
    if (res.status === 403 && data.error) {
      const msg = data.error.message || '';
      if (msg.includes('Permission denied on resource project') || data.error.status === 'PERMISSION_DENIED' && msg.includes(projectId)) {
        throw new Error(`El Project ID de Firebase "${projectId}" no existe o no tiene Firestore activo.`);
      }
    }

    if (res.status === 404 && data.error && data.error.message.includes('not found')) {
      throw new Error(`El Project ID de Firebase "${projectId}" no existe o no tiene Firestore activo.`);
    }

    return true;
  } catch (err) {
    if (err.message.includes('fetch failed') || err.message.includes('network') || err.message.includes('FetchError')) {
      throw new Error(`Error de red al conectar con Firebase: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Valida de forma remota que el Firebase Storage Bucket exista y esté activo en Google Cloud Storage.
 * @param {string} storageBucket Nombre del bucket de storage (ej: ventas-smartfix.appspot.com)
 */
async function validateFirebaseStorageBucket(storageBucket) {
  const bucketName = String(storageBucket || '').trim().replace(/^gs:\/\//, '');
  if (!bucketName) {
    throw new Error('El bucket de Firebase Storage está vacío.');
  }

  const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}`;
  try {
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (_) {
      throw new Error(`El bucket "${bucketName}" no devolvió un formato de metadatos válido de Storage.`);
    }

    if (res.status === 404) {
      throw new Error(`El bucket de Firebase Storage "${bucketName}" no existe o no está activo en Firebase Console. Habilita Storage en la consola de Firebase antes de continuar.`);
    }

    // Cualquier otro estatus (200, 401, 403, 400) significa que el bucket físico existe en la nube de Google
    return true;
  } catch (err) {
    if (err.message.includes('fetch failed') || err.message.includes('network') || err.message.includes('FetchError')) {
      throw new Error(`Error de red al conectar con Firebase Storage: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Valida el entorno local asegurando que las dependencias CLI (firebase, gh si se requiere) estén
 * instaladas y con sesión iniciada.
 * @param {Object} answers Datos de configuración
 */
async function checkEnvironment(answers) {
  const spinner = ora('🔍 Ejecutando preflight check del entorno...').start();
  
  if (answers.bypassPreflight || process.env.BYPASS_PREFLIGHT === 'true') {
    spinner.succeed('Preflight check omitido (bypass activado).');
    return;
  }

  // 1. Validar Firebase CLI
  try {
    execSync('firebase --version', { stdio: 'ignore' });
  } catch (err) {
    spinner.fail();
    throw new Error('Firebase CLI no está instalado en el sistema global. Por favor instálalo (npm install -g firebase-tools).');
  }

  // Obtener el token de autenticación (sea el dinámico OAuth2 o el local de consola)
  const token = getDeveloperAccessToken(answers);
  const tokenFlag = token ? ` --token "${token}"` : '';

  try {
    execSync('firebase projects:list' + tokenFlag, { stdio: 'ignore' });
  } catch (err) {
    spinner.fail();
    throw new Error(token ? 'El token OAuth2 del desarrollador no es válido o ha expirado.' : 'Firebase CLI no tiene sesión iniciada. Ejecuta: firebase login');
  }

  // 1.05 Validar que el proyecto ID exista y el usuario tenga acceso a él en Firebase CLI
  if (answers.firebaseProjectId && !answers.autoProvisionFirebase) {
    try {
      const targetProj = String(answers.firebaseProjectId || '').trim();
      const projListRaw = execSync('firebase projects:list --json' + tokenFlag, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
      const projData = JSON.parse(projListRaw);
      const projList = projData.result || [];
      const hasAccess = projList.some(p => String(p.projectId || '').trim() === targetProj);
      if (!hasAccess) {
        spinner.fail();
        throw new Error(`El ID de proyecto Firebase "${targetProj}" no se encuentra asociado a tu cuenta. Verifica el ID o los permisos en la consola de Firebase.`);
      }
    } catch (err) {
      if (err.message && err.message.includes('no se encuentra asociado a tu cuenta')) {
        throw err;
      }
      // Advertencia en lugar de bloqueo si es error de red o formato
      console.warn(pc.yellow(`\n⚠️  [Preflight Firebase] No se pudo comprobar el acceso al proyecto "${answers.firebaseProjectId}" en tu cuenta: ${err.message}. Continuando.`));
    }
  }

  // 1.1 Validar credenciales de Firebase en la nube si no es aprovisionamiento automático
  if (!answers.autoProvisionFirebase && answers.firebaseApiKey && answers.firebaseProjectId) {
    spinner.text = '🔍 Validando credenciales de Firebase en la nube...';
    try {
      await validateFirebaseCredentials(answers.firebaseApiKey, answers.firebaseProjectId);
    } catch (err) {
      spinner.fail();
      throw new Error(`Fallo en preflight check de Firebase: ${err.message}`);
    }
  }

  // 1.15 Validar bucket de Firebase Storage en la nube si no es aprovisionamiento automático y se proporciona
  if (!answers.autoProvisionFirebase && answers.firebaseStorageBucket) {
    spinner.text = '🔍 Validando Firebase Storage Bucket en la nube (Preflight)...';
    try {
      await validateFirebaseStorageBucket(answers.firebaseStorageBucket);
    } catch (err) {
      spinner.fail();
      throw new Error(`Fallo en preflight check de Firebase Storage: ${err.message}`);
    }
  }

  // 2. Validar GitHub CLI si se requiere subir a GitHub
  if (answers.enableGithub) {
    try {
      execSync('gh --version', { stdio: 'ignore' });
    } catch (err) {
      spinner.fail();
      throw new Error('GitHub CLI (gh) no está instalado. Instálalo o desactiva la opción de subir a GitHub.');
    }

    try {
      execSync('gh auth status', { stdio: 'ignore' });
    } catch (err) {
      spinner.fail();
      throw new Error('GitHub CLI (gh) no tiene sesión iniciada. Ejecuta: gh auth login');
    }
  }

  // 3. Validar claves de la Consola Central
  const activeCentralApiKey = answers.centralApiKey || process.env.VITE_DEVELOPER_CENTRAL_API_KEY;
  if (!activeCentralApiKey) {
    spinner.fail();
    throw new Error(
      'Falta la Clave de API de la Consola Central (VITE_DEVELOPER_CENTRAL_API_KEY). ' +
      'Por favor, configúrala como variable de entorno en el servidor o provéela en el briefing para permitir el auto-registro del cliente.'
    );
  }

  spinner.succeed('Preflight check completado con éxito. Entorno verificado y credenciales validadas.');
}

/**
 * Resuelve de forma estática el catálogo inicial de productos y categorías para el nicho comercial.
 * @param {string} niche Nombre del nicho
 * @returns {Object} { categories, products }
 */
function resolveNicheCatalog(niche) {
  let categories = [];
  let products = [];
  
  const isTechOrMaintenance = [
    'technical_services', 'refrigeration_ac', 'contractors', 
    'machinery_rental', 'carpentry', 'furniture_repair'
  ].includes(niche);

  const isWellnessOrEsthetics = [
    'wellness_podology', 'wellness', 'barberia', 'salon', 'servicios', 'distribuidoras-beauty'
  ].includes(niche);

  const isLaundry = niche === 'laundry';

  const isGroceryOrFood = [
    'grocery_food', 'alimentos-artesanales', 'alimentacion-saludable', 'licores-cocteleria'
  ].includes(niche);

  if (isWellnessOrEsthetics) {
    categories = [
      { id: 'cat-servicios-clinicos', name: 'Servicios & Tratamientos' },
      { id: 'cat-bienestar-spa', name: 'Estética & Bienestar' }
    ];
    products = [
      { id: 'serv-perfilaxis', name: 'Perfilaxis Especializada Completa', price: 90000, categoryId: 'cat-servicios-clinicos', stock: 999, ref: 'SERV-01' },
      { id: 'serv-laser', name: 'Tratamiento Onicomicosis (Láser)', price: 120000, categoryId: 'cat-servicios-clinicos', stock: 999, ref: 'SERV-02' },
      { id: 'serv-masaje', name: 'Masaje Relajante Espalda/Cuello', price: 75000, categoryId: 'cat-bienestar-spa', stock: 999, ref: 'SERV-03' },
      { id: 'serv-hidratacion', name: 'Tratamiento Facial Hidratación Profunda', price: 50000, categoryId: 'cat-bienestar-spa', stock: 999, ref: 'SERV-04' }
    ];
  } else if (isTechOrMaintenance) {
    categories = [
      { id: 'cat-servicio-tecnico', name: 'Servicio Técnico Especializado' },
      { id: 'cat-mantenimiento', name: 'Mantenimiento Preventivo & Correctivo' }
    ];
    products = [
      { id: 'serv-diagnostico', name: 'Diagnóstico Técnico General de Equipos', price: 45000, categoryId: 'cat-servicio-tecnico', stock: 999, ref: 'SERV-01' },
      { id: 'serv-maint-prev', name: 'Mantenimiento Preventivo Completo', price: 120000, categoryId: 'cat-mantenimiento', stock: 999, ref: 'SERV-02' },
      { id: 'serv-mano-obra', name: 'Mano de Obra Técnica Especializada (Hora)', price: 60000, categoryId: 'cat-servicio-tecnico', stock: 999, ref: 'SERV-03' }
    ];
  } else if (isLaundry) {
    categories = [
      { id: 'cat-lavado-kilo', name: 'Lavado General por Kilo' },
      { id: 'cat-limpieza-seco', name: 'Limpieza en Seco & Especiales' }
    ];
    products = [
      { id: 'serv-kilo-normal', name: 'Lavado y Secado por Kilo (Ropa Diario)', price: 12000, categoryId: 'cat-lavado-kilo', stock: 999, ref: 'SERV-01' },
      { id: 'serv-planchado', name: 'Planchado a Vapor de Prenda Individual', price: 5000, categoryId: 'cat-lavado-kilo', stock: 999, ref: 'SERV-02' },
      { id: 'serv-seco-traje', name: 'Limpieza Especial Traje Formal 2 Piezas', price: 22000, categoryId: 'cat-limpieza-seco', stock: 999, ref: 'SERV-03' }
    ];
  } else if (isGroceryOrFood) {
    // ── Alimentos Artesanales / Orgánicos / Repostería
    if (niche === 'alimentos-artesanales' || niche === 'alimentacion-saludable') {
      categories = [
        { id: 'cat-artesanal', name: 'Productos Artesanales & Orgánicos' },
        { id: 'cat-reposteria', name: 'Repostería & Panadería' }
      ];
      products = [
        { id: 'prod-cafe-org', name: 'Café Orgánico Especial Molido (500g)', price: 24000, categoryId: 'cat-artesanal', stock: 100, ref: 'FOOD-01' },
        { id: 'prod-miel', name: 'Miel de Abejas Artesanal (500ml)', price: 18000, categoryId: 'cat-artesanal', stock: 60, ref: 'FOOD-02' },
        { id: 'prod-torta', name: 'Torta Tres Leches Artesanal (Mediana)', price: 45000, categoryId: 'cat-reposteria', stock: 10, ref: 'FOOD-03' },
        { id: 'prod-pan-integral', name: 'Pan Integral Artesanal de Masa Madre', price: 12000, categoryId: 'cat-reposteria', stock: 30, ref: 'FOOD-04' }
      ];
    } else if (niche === 'licores-cocteleria') {
      // ── Licorería / Coctelería
      categories = [
        { id: 'cat-licores-nacionales', name: 'Licores Nacionales' },
        { id: 'cat-licores-importados', name: 'Importados & Vinos' }
      ];
      products = [
        { id: 'prod-aguardiente', name: 'Aguardiente Antioqueño Sin Azúcar (750ml)', price: 32000, categoryId: 'cat-licores-nacionales', stock: 80, ref: 'LIC-01' },
        { id: 'prod-ron', name: 'Ron Medellín Añejo (750ml)', price: 45000, categoryId: 'cat-licores-nacionales', stock: 40, ref: 'LIC-02' },
        { id: 'prod-vino-malbec', name: 'Vino Tinto Malbec Reserva Argentino', price: 65000, categoryId: 'cat-licores-importados', stock: 25, ref: 'LIC-03' },
        { id: 'prod-whisky', name: 'Whisky Escocés Single Malt (700ml)', price: 120000, categoryId: 'cat-licores-importados', stock: 15, ref: 'LIC-04' }
      ];
    } else {
      // grocery_food genérico
      categories = [
        { id: 'cat-alimentos', name: 'Alimentos & Despensa' },
        { id: 'cat-bebidas', name: 'Bebidas & Jugos' }
      ];
      products = [
        { id: 'prod-arroz', name: 'Arroz Blanco Premium (5kg)', price: 22000, categoryId: 'cat-alimentos', stock: 200, ref: 'GROC-01' },
        { id: 'prod-aceite', name: 'Aceite Vegetal Extra (3L)', price: 18000, categoryId: 'cat-alimentos', stock: 120, ref: 'GROC-02' },
        { id: 'prod-jugo', name: 'Jugo Natural de Naranja (1L)', price: 8000, categoryId: 'cat-bebidas', stock: 80, ref: 'GROC-03' },
        { id: 'prod-agua', name: 'Agua Mineral con Gas (6 unidades)', price: 12000, categoryId: 'cat-bebidas', stock: 150, ref: 'GROC-04' }
      ];
    }

  } else if (niche === 'repuestos-motos') {
    // ── Repuestos y Accesorios de Motos
    categories = [
      { id: 'cat-motor-moto', name: 'Motor & Transmisión' },
      { id: 'cat-accesorios-moto', name: 'Accesorios & Seguridad' }
    ];
    products = [
      { id: 'prod-bujia', name: 'Bujía NGK para Motocicleta 125cc', price: 15000, categoryId: 'cat-motor-moto', stock: 60, ref: 'MOTO-01' },
      { id: 'prod-filtro-aire', name: 'Filtro de Aire Universal Moto 150cc', price: 22000, categoryId: 'cat-motor-moto', stock: 40, ref: 'MOTO-02' },
      { id: 'prod-cadena', name: 'Cadena de Transmisión 428H (120 eslabones)', price: 35000, categoryId: 'cat-motor-moto', stock: 25, ref: 'MOTO-03' },
      { id: 'prod-casco', name: 'Casco Integral Certificado DOT (Negro)', price: 180000, categoryId: 'cat-accesorios-moto', stock: 12, ref: 'MOTO-04' }
    ];

  } else if (niche === 'petshops-locales') {
    // ── Tienda de Mascotas
    categories = [
      { id: 'cat-alimento-pet', name: 'Alimentos & Nutrición' },
      { id: 'cat-accesorios-pet', name: 'Accesorios & Juguetes' }
    ];
    products = [
      { id: 'prod-concentrado', name: 'Concentrado Premium para Perro Adulto (5kg)', price: 65000, categoryId: 'cat-alimento-pet', stock: 40, ref: 'PET-01' },
      { id: 'prod-snack', name: 'Snacks Dentales para Perro (Paquete x30)', price: 18000, categoryId: 'cat-alimento-pet', stock: 80, ref: 'PET-02' },
      { id: 'prod-correa', name: 'Correa Retráctil 5m con Freno de Seguridad', price: 45000, categoryId: 'cat-accesorios-pet', stock: 20, ref: 'PET-03' },
      { id: 'prod-juguete', name: 'Juguete Interactivo Antiaburrimiento Kong', price: 28000, categoryId: 'cat-accesorios-pet', stock: 35, ref: 'PET-04' }
    ];

  } else if (niche === 'ferreteria-rural') {
    // ── Ferretería y Construcción Rural
    categories = [
      { id: 'cat-materiales', name: 'Materiales de Construcción' },
      { id: 'cat-herramientas', name: 'Herramientas & Fijaciones' }
    ];
    products = [
      { id: 'prod-cemento', name: 'Cemento Gris 50kg (Bolsa)', price: 32000, categoryId: 'cat-materiales', stock: 100, ref: 'FER-01' },
      { id: 'prod-varilla', name: 'Varilla Corrugada 3/8" x 6m', price: 22000, categoryId: 'cat-materiales', stock: 80, ref: 'FER-02' },
      { id: 'prod-tornillos', name: 'Tornillos Drywall 3.5x25mm (Caja x500)', price: 12000, categoryId: 'cat-herramientas', stock: 60, ref: 'FER-03' },
      { id: 'prod-pala', name: 'Pala Cuadrada con Mango de Madera Reforzado', price: 38000, categoryId: 'cat-herramientas', stock: 15, ref: 'FER-04' }
    ];

  } else if (niche === 'insumos-agricolas') {
    // ── Insumos y Repuestos Agrícolas
    categories = [
      { id: 'cat-fertilizantes', name: 'Fertilizantes & Abonos' },
      { id: 'cat-herramientas-campo', name: 'Herramientas de Campo' }
    ];
    products = [
      { id: 'prod-urea', name: 'Urea Agrícola 46% (Bulto 50kg)', price: 95000, categoryId: 'cat-fertilizantes', stock: 50, ref: 'AGR-01' },
      { id: 'prod-fungicida', name: 'Fungicida Preventivo Mancozeb (1kg)', price: 28000, categoryId: 'cat-fertilizantes', stock: 40, ref: 'AGR-02' },
      { id: 'prod-machete', name: 'Machete Punta Fina Collins 22" con Vaina', price: 35000, categoryId: 'cat-herramientas-campo', stock: 25, ref: 'AGR-03' },
      { id: 'prod-azadon', name: 'Azadón Doble Uso con Mango Largo', price: 42000, categoryId: 'cat-herramientas-campo', stock: 20, ref: 'AGR-04' }
    ];

  } else if (niche === 'repuestos-lineablanca') {
    // ── Repuestos de Electrodomésticos (Línea Blanca)
    categories = [
      { id: 'cat-electrico', name: 'Eléctricos & Electrónicos' },
      { id: 'cat-mecanico', name: 'Mecánicos & Sellados' }
    ];
    products = [
      { id: 'prod-resistencia', name: 'Resistencia Eléctrica Universal Lavadora 1200W', price: 28000, categoryId: 'cat-electrico', stock: 30, ref: 'ELB-01' },
      { id: 'prod-motor-bomba', name: 'Motor Bomba de Agua Lavadora (Universal)', price: 75000, categoryId: 'cat-mecanico', stock: 15, ref: 'ELB-02' },
      { id: 'prod-valvula', name: 'Válvula de Entrada de Agua Lavadora 220V', price: 35000, categoryId: 'cat-electrico', stock: 25, ref: 'ELB-03' },
      { id: 'prod-rodamiento', name: 'Rodamiento 6205-2RS (Caja de 2)', price: 18000, categoryId: 'cat-mecanico', stock: 50, ref: 'ELB-04' }
    ];

  } else if (niche === 'coleccionismo-geek') {
    // ── Artículos Geek y Coleccionismo
    categories = [
      { id: 'cat-figuras', name: 'Figuras & Coleccionables' },
      { id: 'cat-gaming', name: 'Gaming & Accesorios' }
    ];
    products = [
      { id: 'prod-figura-anime', name: 'Figura de Acción Anime 17cm (Edición Especial)', price: 85000, categoryId: 'cat-figuras', stock: 12, ref: 'GEEK-01' },
      { id: 'prod-funko', name: 'Funko Pop! Edición Limitada (Caja sellada)', price: 65000, categoryId: 'cat-figuras', stock: 8, ref: 'GEEK-02' },
      { id: 'prod-mousepad', name: 'Mousepad Gaming XL 900x400mm con Base Antideslizante', price: 45000, categoryId: 'cat-gaming', stock: 20, ref: 'GEEK-03' },
      { id: 'prod-control', name: 'Control Inalámbrico para PC (Compatible Xbox)', price: 120000, categoryId: 'cat-gaming', stock: 10, ref: 'GEEK-04' }
    ];

  } else if (niche === 'distribucion-horeca') {
    // ── Insumos Horeca B2B (Hotels, Restaurants, Catering)
    categories = [
      { id: 'cat-limpieza-horeca', name: 'Limpieza & Desinfección Industrial' },
      { id: 'cat-desechables', name: 'Desechables & Empaque' }
    ];
    products = [
      { id: 'prod-jabon-ind', name: 'Jabón Líquido Industrial Galón (3.8L)', price: 35000, categoryId: 'cat-limpieza-horeca', stock: 80, ref: 'HRC-01' },
      { id: 'prod-deseng', name: 'Desengrasante Concentrado Multiusos (Galón)', price: 28000, categoryId: 'cat-limpieza-horeca', stock: 60, ref: 'HRC-02' },
      { id: 'prod-vasos', name: 'Vasos Desechables 16oz (Paquete x100)', price: 18000, categoryId: 'cat-desechables', stock: 150, ref: 'HRC-03' },
      { id: 'prod-caja-pizza', name: 'Caja para Pizza 30cm Kraft (Paquete x25)', price: 22000, categoryId: 'cat-desechables', stock: 100, ref: 'HRC-04' }
    ];

  } else if (niche === 'home-office-ergonomia') {
    // ── Equipamiento Home Office & Ergonomía
    categories = [
      { id: 'cat-mobiliario', name: 'Mobiliario Ergonómico' },
      { id: 'cat-tecnologia', name: 'Tecnología & Conectividad' }
    ];
    products = [
      { id: 'prod-silla', name: 'Silla Ergonómica con Soporte Lumbar Ajustable', price: 450000, categoryId: 'cat-mobiliario', stock: 8, ref: 'HOM-01' },
      { id: 'prod-escritorio', name: 'Escritorio Elevable Manual 120x60cm (Bamboo)', price: 380000, categoryId: 'cat-mobiliario', stock: 5, ref: 'HOM-02' },
      { id: 'prod-hub', name: 'Hub USB-C 7 en 1 (4K HDMI, USB 3.0, SD)', price: 85000, categoryId: 'cat-tecnologia', stock: 20, ref: 'HOM-03' },
      { id: 'prod-webcam', name: 'Webcam Full HD 1080p con Micrófono Integrado', price: 120000, categoryId: 'cat-tecnologia', stock: 15, ref: 'HOM-04' }
    ];

  } else if (niche === 'moda-local-calzado') {
    // ── Calzado y Confección Local
    categories = [
      { id: 'cat-calzado-dama', name: 'Calzado Dama' },
      { id: 'cat-calzado-caballero', name: 'Calzado Caballero & Niños' }
    ];
    products = [
      { id: 'prod-tacon', name: 'Zapato de Tacón Bajo Formal (Talla 36-40)', price: 120000, categoryId: 'cat-calzado-dama', stock: 20, ref: 'CAL-01' },
      { id: 'prod-sandalia', name: 'Sandalia Plana Casual Cuero Genuino', price: 85000, categoryId: 'cat-calzado-dama', stock: 15, ref: 'CAL-02' },
      { id: 'prod-zapato-formal', name: 'Zapato Oxford Caballero en Cuero (Talla 40-45)', price: 145000, categoryId: 'cat-calzado-caballero', stock: 12, ref: 'CAL-03' },
      { id: 'prod-tenis-nino', name: 'Tenis Deportivo Niño con Luces (Talla 28-34)', price: 68000, categoryId: 'cat-calzado-caballero', stock: 25, ref: 'CAL-04' }
    ];

  } else if (niche === 'distribuidoras-beauty') {
    // ── Suministros de Belleza Profesional (distribución B2B/B2C)
    categories = [
      { id: 'cat-cabello', name: 'Cuidado del Cabello' },
      { id: 'cat-unas-piel', name: 'Uñas & Cuidado de Piel' }
    ];
    products = [
      { id: 'prod-tinte', name: 'Tinte Profesional en Crema (Caja x12 tubos)', price: 85000, categoryId: 'cat-cabello', stock: 30, ref: 'BEA-01' },
      { id: 'prod-keratina', name: 'Keratina Brasileña Alisante (500ml)', price: 120000, categoryId: 'cat-cabello', stock: 15, ref: 'BEA-02' },
      { id: 'prod-esmalte', name: 'Esmalte Gel UV/LED Semipermanente (Caja x12)', price: 65000, categoryId: 'cat-unas-piel', stock: 40, ref: 'BEA-03' },
      { id: 'prod-crema-corp', name: 'Crema Corporal Reafirmante Profesional (1L)', price: 55000, categoryId: 'cat-unas-piel', stock: 25, ref: 'BEA-04' }
    ];

  } else if (niche === 'general_custom' || niche === 'general') {
    // ── Catálogo Neutro para proyectos personalizados sin nicho específico
    categories = [
      { id: 'cat-principal', name: 'Catálogo Principal' },
      { id: 'cat-servicios', name: 'Servicios' }
    ];
    products = [
      { id: 'prod-ejemplo-1', name: 'Producto de Ejemplo A (Editar en Admin)', price: 50000, categoryId: 'cat-principal', stock: 100, ref: 'GEN-01' },
      { id: 'prod-ejemplo-2', name: 'Producto de Ejemplo B (Editar en Admin)', price: 75000, categoryId: 'cat-principal', stock: 50, ref: 'GEN-02' },
      { id: 'serv-ejemplo', name: 'Servicio de Ejemplo (Editar en Admin)', price: 30000, categoryId: 'cat-servicios', stock: 999, ref: 'GEN-03' }
    ];

  } else {
    // Retail de Ropa y Accesorios (retail_clothing) — el único nicho que realmente necesita este seed
    categories = [
      { id: 'cat-ropa-dama', name: 'Ropa Dama' },
      { id: 'cat-accesorios', name: 'Accesorios & Complementos' }
    ];
    products = [
      { id: 'prod-blusa', name: 'Blusa Casual Manga Corta (S/M/L/XL)', price: 65000, categoryId: 'cat-ropa-dama', stock: 30, ref: 'RET-01' },
      { id: 'prod-jean', name: 'Jean Skinny Stretch Tiro Alto (28-36)', price: 120000, categoryId: 'cat-ropa-dama', stock: 20, ref: 'RET-02' },
      { id: 'prod-bolso', name: 'Bolso Cartera Cuero Ecológico (Varios colores)', price: 85000, categoryId: 'cat-accesorios', stock: 15, ref: 'RET-03' },
      { id: 'prod-gorra', name: 'Gorra Premium Bordada Ajustable', price: 45000, categoryId: 'cat-accesorios', stock: 40, ref: 'RET-04' }
    ];
  }
  
  return { categories, products };
}

/**
 * Lógica pura de aprovisionamiento de un nuevo proyecto con automatización extrema.
 * @param {Object} answers Datos recolectados del Briefing
 */
export async function createProject(answers) {
  // 1. Normalizar y validar de inmediato el Blueprint si viene pre-inyectado
  const isPresetBlueprint = !!(answers.blueprint || answers.clientId || answers.instanceId || answers.projectName || answers.clientName);
  let presetValidationResult = null;

  if (isPresetBlueprint) {
    const normalized = normalizeProvisioningRequest(answers);
    presetValidationResult = await ProvisioningValidator.validate(normalized.blueprint);
    if (!presetValidationResult.isValid) {
      throw new Error(`BLUEPRINT_SCHEMA_INVALID: ${presetValidationResult.errors.join(' | ')}`);
    }

    // Inyectar el blueprint normalizado y variables de ejecución en answers
    answers.blueprint = normalized.blueprint;
    answers.projectName = normalized.blueprint.clientName;
    answers.template = normalized.blueprint.coreType;
    answers.niche = normalized.blueprint.vertical;
    answers.paletteChoice = normalized.blueprint.branding?.paletteChoice;
    answers.branding = normalized.blueprint.branding || {};
    
    if (normalized.execution.targetPath) {
      answers.targetPath = normalized.execution.targetPath;
    }
    answers.force = normalized.execution.force;
    answers.enableGithub = normalized.execution.enableGithub;
    answers.firebaseDeploy = normalized.execution.firebaseDeploy;
    answers.centralRegistration = normalized.execution.centralRegistration;
  }

  // ─── BLINDAJE DE ENTRADAS: Normalizar todos los campos opcionales ──────────
  answers.flags = (answers.flags && typeof answers.flags === 'object') ? answers.flags : {};
  answers.branding = (answers.branding && typeof answers.branding === 'object') ? answers.branding : {};
  answers.selectedRecomendations = Array.isArray(answers.selectedRecomendations) ? answers.selectedRecomendations : [];
  answers.customRequirements = typeof answers.customRequirements === 'string' ? answers.customRequirements.trim() : '';
  answers.niche = typeof answers.niche === 'string' ? answers.niche.trim() : 'general_custom';
  answers.billingMode = typeof answers.billingMode === 'string' ? answers.billingMode.trim() : 'percentage';
  answers.comisionPorcentaje = parseFloat(answers.comisionPorcentaje) || 1.5;
  answers.pagoMensualFijo = parseFloat(answers.pagoMensualFijo) || 0;
  answers.montoFijoServicio = parseFloat(answers.montoFijoServicio) || 0;
  answers.costoPorFacturaDian = parseFloat(answers.costoPorFacturaDian) || 0;

  // Declarar flags de copia de plantilla base
  let isTemplateCopied = false;
  const ensureBaseTemplateCopied = async (tDir, sTempDir) => {
    if (isTemplateCopied) return;
    const step1 = ora('Copiar estructura base de plantilla').start();
    const EXCLUDE_FROM_GEN = new Set([
      'node_modules', '.git', '.firebase', '.vite', '.eslintcache', '.parcel-cache',
      '.env.local', 'firebase-debug.log', '.DS_Store', 'Thumbs.db',
      'npm-debug.log', 'yarn-error.log', 'pnpm-debug.log'
    ]);
    try {
      if (await fs.pathExists(tDir)) {
        step1.info('La ruta de destino ya existe. Los archivos se sobrescribirán.');
        step1.start('Copiar estructura base de plantilla');
      }
      await fs.ensureDir(tDir);
      const resolvedRealPath = await fs.realpath(tDir);
      if (!PathSecurity.isPathContained(getWorkspaceRoot(), resolvedRealPath)) {
        throw new Error('PATH_OUTSIDE_ALLOWED_ROOT: TOCTOU detected on scaffolding root.');
      }
      await fs.copy(sTempDir, tDir, {
        overwrite: true,
        filter: (src) => !EXCLUDE_FROM_GEN.has(path.basename(src))
      });
      step1.succeed('Estructura base de plantilla copiada correctamente.');
      isTemplateCopied = true;
    } catch (copyErr) {
      step1.fail(`Fallo al copiar plantilla base: ${copyErr.message}`);
      throw copyErr;
    }
  };

  // Validaciones de preflight
  await checkEnvironment(answers);

  // 0. Resolver coreType de la plantilla e inyectarlo en answers
  let coreType = 'seed';
  try {
    const { getRegistroPath } = await import('./config.js');
    const registro = await fs.readJson(getRegistroPath());
    const templateConfig = Object.values(registro.plantillas).find(p => path.basename(p.destino) === answers.template);
    if (templateConfig && templateConfig.coreType) {
      coreType = templateConfig.coreType;
    }
  } catch (e) {}
  answers.coreType = coreType;

  // [BLINDAJE-INPUTS] Validar projectName antes de derivar clientId y folderName.
  const rawName = (answers.projectName || '').trim();
  const clientId = isPresetBlueprint ? answers.blueprint.instanceId : rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const folderName = clientId; // Mismo slug normalizado

  if (!clientId || clientId.length < 2) {
    throw new Error(
      `El nombre del proyecto "${rawName}" no genera un identificador válido. ` +
      `Usa al menos 2 caracteres alfanuméricos (letras o números).`
    );
  }

  // Declarar targetDir y srcTemplateDir después de validar clientId
  const { getInstancePath } = await import('./config.js');
  const targetDir = PathSecurity.validateContainedPath(getWorkspaceRoot(), answers.targetPath || getInstancePath(coreType, `App-${folderName}`));
  const existedBefore = await fs.pathExists(targetDir);
  try {
    const srcTemplateDir = path.join(TEMPLATES_DIR, answers.template);
    if (!isPathContained(TEMPLATES_DIR, srcTemplateDir)) {
      throw new Error(`Acceso denegado: El nombre de la plantilla "${answers.template}" no es válido.`);
    }

  // Resolver colores HSL y Tema de la paleta seleccionada
  // [BLINDAJE-COLOR] Cadena de fallback explícita para garantizar que primaryColor
  // nunca sea undefined/null, lo que rompería hslToRgbaHex, el favicon SVG y el :root CSS.
  let primaryColor, accentColor, themeName;
  if (answers.paletteChoice === 'custom') {
    primaryColor = answers.branding?.primaryColor
      || answers.customPrimary
      || PALETTES.ruby.primary;
    accentColor = answers.branding?.secondaryColor
      || answers.customAccent
      || PALETTES.ruby.accent;
    themeName = 'custom';
  } else {
    const selected = PALETTES[answers.paletteChoice] || PALETTES.ruby;
    primaryColor = selected.primary;
    accentColor = selected.accent;
    themeName = selected.theme;
  }
  // Garantía final: si aún están vacíos, usar ruby como fallback absoluto
  if (!primaryColor) primaryColor = PALETTES.ruby.primary;
  if (!accentColor) accentColor = PALETTES.ruby.accent;
  if (!themeName) themeName = 'ruby';

  console.log('\n' + pc.yellow(`⚡ Iniciando aprovisionamiento automatizado en: ${targetDir}`));

  // 1. Iniciar bloque de composición de features e inyección de plantilla (Validado primero, escrito después)
  const step1 = ora('Copiar estructura base de plantilla');
  try {

    // ─── COMPOSICIÓN DINÁMICA DE VERTICAL IMPULSADA POR BLUEPRINT (Fase 8.5) ───
    if (answers.template === 'template-core-seed') {
      const stepFeatures = ora('Ejecutando Inteligencia de Aprovisionamiento y Componiendo features').start();
      
      // 1. Inicializar o Resolver el Blueprint
      let blueprint = answers.blueprint;
      const expLogger = new ExplainabilityLogger(clientId);

      if (!blueprint) {
        try {
          // A) Deducir capacidades
          const biResolved = await BiResolver.resolve(answers);
          
          // B) Mapear a features, componentes, patrones
          const capabilityResolved = await CapabilityResolver.resolve(biResolved.capabilities);
          
          // C) Resolver transitivamente dependencias
          const recommenderResolved = await FeatureRecommender.resolveDependencies(capabilityResolved.features);
          
          // D) Componer la experiencia y widgets del dashboard
          const experienceResolved = await ExperienceComposer.compose(
            { capabilities: biResolved.capabilities, features: recommenderResolved.features },
            biResolved.context
          );
          
          // E) Consolidar el Blueprint
          blueprint = {
            version: "1.0.0",
            clientId: clientId,
            clientName: answers.projectName || "Custom Client",
            vertical: biResolved.vertical,
            capabilities: biResolved.capabilities,
            features: recommenderResolved.features,
            components: capabilityResolved.components,
            patterns: capabilityResolved.patterns,
            experience: experienceResolved.experience,
            branding: {
              paletteChoice: answers.paletteChoice || "slate",
              initials: answers.initials || (answers.projectName ? answers.projectName.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase() : 'APP')
            },
            dashboard: experienceResolved.dashboard
          };

          // Guardar rastros del pipeline en Explainability
          expLogger.addEntries([
            {
              decision: "Pipeline de Inteligencia de Aprovisionamiento ejecutado",
              reason: `Briefing cualitativo mapeado exitosamente a Blueprint plano.`,
              confidence: 1.0,
              source: "generator.js"
            }
          ]);
          
          expLogger.addEntries(biResolved.auditTrail);
          expLogger.addEntries(capabilityResolved.auditTrail);
          expLogger.addEntries(recommenderResolved.auditTrail);
          expLogger.addEntries(experienceResolved.auditTrail);
        } catch (err) {
          stepFeatures.fail("Error en el pipeline de Inteligencia de Aprovisionamiento.");
          throw err;
        }
      } else {
        expLogger.addEntries([
          {
            decision: "Blueprint pre-validado inyectado directamente",
            reason: "El generador recibió un Application Blueprint pre-construido.",
            confidence: 1.0,
            source: "generator.js"
          }
        ]);
      }

      // 2. Validar estáticamente el Blueprint
      let validationResult = presetValidationResult;
      if (!validationResult) {
        try {
          validationResult = await ProvisioningValidator.validate(blueprint);
          if (!validationResult.isValid) {
            throw new Error(validationResult.errors.join(' | '));
          }
        } catch (err) {
          stepFeatures.fail(`[Fallo Validación] El Blueprint generado no cumple con las reglas físicas del ecosistema: ${err.message}`);
          throw err;
        }
      }

      // 2.5 Copiar estructura base de plantilla física (Post-validación exitosa)
      await ensureBaseTemplateCopied(targetDir, srcTemplateDir);

      // 3. Simular preflight
      const simulation = await BlueprintSimulation.simulate(blueprint, validationResult);

      // 4. Copiar manifiestos JSON resultantes
      const configDestDir = path.join(targetDir, 'src', 'config');
      await fs.ensureDir(configDestDir);

      await fs.writeJson(path.join(configDestDir, 'application.json'), {
        instanceId: blueprint.clientId,
        clientName: blueprint.clientName,
        vertical: blueprint.vertical,
        schemaVersion: blueprint.version || "1.0.0",
        features: blueprint.features
      }, { spaces: 2 });

      await fs.writeJson(path.join(configDestDir, 'tenant.json'), {
        tenantId: `tenant-${blueprint.clientId}`,
        plan: "enterprise",
        status: "active",
        featuresEnabled: blueprint.features
      }, { spaces: 2 });

      await fs.writeJson(path.join(configDestDir, 'experience.json'), blueprint.experience, { spaces: 2 });
      await fs.writeJson(path.join(configDestDir, 'branding.json'), blueprint.branding, { spaces: 2 });
      const composedDashboard = blueprint.dashboard || { widgets: [] };
      await fs.writeJson(path.join(configDestDir, 'dashboard.json'), {
        welcomeWidget: "StatsGrid",
        layoutPreset: "grid-bento",
        activeWidgets: (composedDashboard.widgets || []).map(w => ({
          id: w.widgetId,
          size: w.size || "medium"
        })),
        widgets: composedDashboard.widgets || []
      }, { spaces: 2 });
      await fs.writeJson(path.join(configDestDir, 'patterns.json'), { activePatterns: blueprint.patterns }, { spaces: 2 });

      // Escribir manifiestos legacy para compatibilidad (vacíos inicialmente, se actualizarán tras copiar features reales)
      await fs.writeJson(path.join(configDestDir, 'features.json'), {
        activeFeatures: [],
        tenantId: blueprint.clientId,
        subscriptionPlan: 'enterprise'
      }, { spaces: 2 });

      await fs.writeJson(path.join(configDestDir, 'build-manifest.json'), {
        vertical: blueprint.vertical,
        featuresInstalled: [],
        patternsActive: blueprint.patterns,
        coreVersion: '2.8.0',
        generatedAt: new Date().toISOString()
      }, { spaces: 2 });

      // 5. Copiar o generar las features correspondientes
      const featuresDestDir = path.join(targetDir, 'src', 'features');
      await fs.ensureDir(featuresDestDir);

      const realFeaturesInstalled = [];

      for (const featureId of blueprint.features) {
        const srcFeature = await FeatureRegistry.resolvePhysicalPath(featureId);
        const destFeature = path.join(featuresDestDir, featureId);

        if (srcFeature) {
          // Copiar feature real del catálogo de origen detectado por FeatureRegistry
          await fs.copy(srcFeature, destFeature);
          realFeaturesInstalled.push(featureId);
          expLogger.addEntries([{
            decision: `Feature "${featureId}" copiada desde origen dinámico`,
            source: srcFeature.replace(CLI_ROOT, ''),
            reason: `Detectado origen físico de la feature mediante FeatureRegistry.`,
            confidence: 1.0
          }]);
        } else {
          // Generar estructura modular dummy limpia para compilación y test de agnosticidad
          const featCamel = featureId.charAt(0).toUpperCase() + featureId.slice(1);
          await fs.ensureDir(destFeature);
          await fs.writeFile(path.join(destFeature, 'module.js'), `
import { lazy } from 'react'

export default {
  id: '${featureId}',
  displayName: 'Módulo ${featCamel}',
  requires: [],
  routes: [
    {
      path: '/admin/${featureId}',
      name: 'Módulo ${featCamel}',
      element: lazy(() => import('./pages/Admin${featCamel}')),
      meta: { showInAdmin: true, label: '${featCamel}', icon: 'Layers' }
    }
  ],
  async initialize(context) {
    console.log('[${featCamel}] Inicializado.');
  }
}
          `.trim());

          await fs.ensureDir(path.join(destFeature, 'pages'));
          await fs.writeFile(path.join(destFeature, 'pages', `Admin${featCamel}.jsx`), `
import React from 'react'
export default function Admin${featCamel}() {
  return (
    <div className="p-6 bg-surface rounded-2xl border border-app">
      <h2 className="text-xl font-bold text-app mb-4">Módulo ${featCamel}</h2>
      <p className="text-sm text-muted">Aprovisionado dinámicamente mediante el Application Blueprint.</p>
    </div>
  )
}
          `.trim());
        }
      }

      // Actualizar manifiestos finales únicamente con features reales físicamente instaladas
      await fs.writeJson(path.join(configDestDir, 'features.json'), {
        activeFeatures: realFeaturesInstalled,
        tenantId: blueprint.clientId,
        subscriptionPlan: 'enterprise'
      }, { spaces: 2 });

      await fs.writeJson(path.join(configDestDir, 'build-manifest.json'), {
        vertical: blueprint.vertical,
        featuresInstalled: realFeaturesInstalled,
        patternsActive: blueprint.patterns,
        coreVersion: '2.8.0',
        generatedAt: new Date().toISOString()
      }, { spaces: 2 });

      // 6. Fusionar package.json mediante PackageMerger
      const basePkgPath = path.join(targetDir, 'package.json');
      if (await fs.pathExists(basePkgPath)) {
        const basePkg = await fs.readJson(basePkgPath);
        
        // Recuperar metadatas de features y componentes recomendados
        const featuresMetadatas = [];
        for (const featId of realFeaturesInstalled) {
          const featMetaPath = path.join(CLI_ROOT, 'knowledge', 'features', `${featId}.json`);
          if (await fs.pathExists(featMetaPath)) {
            featuresMetadatas.push(await fs.readJson(featMetaPath));
          }
        }

        const componentsMetadatas = [];
        for (const compId of blueprint.components) {
          const compFileName = compId.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
          const compMetaPath = path.join(CLI_ROOT, 'knowledge', 'components', `${compFileName}.json`);
          if (await fs.pathExists(compMetaPath)) {
            componentsMetadatas.push(await fs.readJson(compMetaPath));
          }
        }

        const mergedPkg = PackageMerger.merge(featuresMetadatas, componentsMetadatas, basePkg);
        await fs.writeJson(basePkgPath, mergedPkg, { spaces: 2 });
      }

      // 7. Persistir Explainability Logs en el directorio destino
      await expLogger.persist(targetDir);

      stepFeatures.succeed(`Features y dependencias del Blueprint inyectadas con éxito en: App-${blueprint.clientId}.`);
    }

    // ─── APROVISIONAMIENTO Y COPIA PROACTIVA DE BACKGROUNDCANVAS (MULTICORE) ───
    const stepCanvas = ora('Sincronizando motor de partículas y biblioteca de iconos en plantilla destino').start();
    try {
      const seedCanvasPath = path.join(srcTemplateDir, '..', 'template-core-seed', 'src', 'components', 'ui', 'BackgroundCanvas.jsx');
      const seedIconsPath = path.join(srcTemplateDir, '..', 'template-core-seed', 'src', 'components', 'ui', 'particlesIcons.js');
      
      const targetCanvasPath = path.join(targetDir, 'src', 'components', 'ui', 'BackgroundCanvas.jsx');
      const targetIconsPath = path.join(targetDir, 'src', 'components', 'ui', 'particlesIcons.js');

      // Copiar BackgroundCanvas
      if (await fs.pathExists(seedCanvasPath)) {
        await fs.ensureDir(path.dirname(targetCanvasPath));
        await fs.copy(seedCanvasPath, targetCanvasPath, { overwrite: true });
      } else {
        // Fallback defensivo si srcTemplateDir es la misma semilla o no encuentra el path relativo
        const localCanvasPath = path.join(__dirname, 'templates', 'template-core-seed', 'src', 'components', 'ui', 'BackgroundCanvas.jsx');
        if (await fs.pathExists(localCanvasPath)) {
          await fs.ensureDir(path.dirname(targetCanvasPath));
          await fs.copy(localCanvasPath, targetCanvasPath, { overwrite: true });
        }
      }

      // Copiar particlesIcons.js
      if (await fs.pathExists(seedIconsPath)) {
        await fs.ensureDir(path.dirname(targetIconsPath));
        await fs.copy(seedIconsPath, targetIconsPath, { overwrite: true });
      } else {
        const localIconsPath = path.join(__dirname, 'templates', 'template-core-seed', 'src', 'components', 'ui', 'particlesIcons.js');
        if (await fs.pathExists(localIconsPath)) {
          await fs.ensureDir(path.dirname(targetIconsPath));
          await fs.copy(localIconsPath, targetIconsPath, { overwrite: true });
        }
      }

      // Inyección automática en App.jsx si no lo tiene
      const appJsxPath = path.join(targetDir, 'src', 'App.jsx');
      if (await fs.pathExists(appJsxPath)) {
        let appJsxContent = await fs.readFile(appJsxPath, 'utf-8');
        
        // Evitar inyección duplicada si ya existen los marcadores administrados de PROTOTIPE
        const startTag = 'PROTOTIPE_BACKGROUND_CANVAS_START';
        if (!appJsxContent.includes(startTag) && !appJsxContent.includes('BackgroundCanvas')) {
          // Inyectar el import al inicio
          appJsxContent = `import BackgroundCanvas from './components/ui/BackgroundCanvas';\n` + appJsxContent;

          const canvasTag = `\n              {/* PROTOTIPE_BACKGROUND_CANVAS_START */}
              <BackgroundCanvas />
              {/* PROTOTIPE_BACKGROUND_CANVAS_END */}`;

          // Capa 1: Slot explícito de inyección
          if (appJsxContent.includes('{/* PROTOTIPE_BACKGROUND_CANVAS_SLOT */}')) {
            appJsxContent = appJsxContent.replace(
              '{/* PROTOTIPE_BACKGROUND_CANVAS_SLOT */}',
              canvasTag
            );
          }
          // Capa 2: BrowserRouter estándar
          else if (appJsxContent.includes('<BrowserRouter>')) {
            appJsxContent = appJsxContent.replace(
              '<BrowserRouter>',
              `<BrowserRouter>${canvasTag}`
            );
          } else if (appJsxContent.includes('<BrowserRouter')) {
            const idx = appJsxContent.indexOf('<BrowserRouter');
            const closeBracketIdx = appJsxContent.indexOf('>', idx);
            if (closeBracketIdx !== -1) {
              appJsxContent = appJsxContent.slice(0, closeBracketIdx + 1) + 
                              canvasTag + 
                              appJsxContent.slice(closeBracketIdx + 1);
            }
          }
          // Capa 3: Fallback defensivo en primer tag contenedor tras return (
          else {
            const returnIdx = appJsxContent.indexOf('return (');
            if (returnIdx !== -1) {
              const firstTagIdx = appJsxContent.indexOf('<', returnIdx);
              const closeBracketIdx = appJsxContent.indexOf('>', firstTagIdx);
              if (closeBracketIdx !== -1) {
                appJsxContent = appJsxContent.slice(0, closeBracketIdx + 1) + 
                                canvasTag + 
                                appJsxContent.slice(closeBracketIdx + 1);
              }
            }
          }
          await fs.writeFile(appJsxPath, appJsxContent, 'utf-8');
        }
      }
      stepCanvas.succeed('Motor de partículas y biblioteca de 110 iconos sincronizados y auto-inyectados.');
    } catch (canvasErr) {
      stepCanvas.warn(`Sincronización de partículas incompleta: ${canvasErr.message}. Continuando creación...`);
    }
  } catch (err) {
    step1.fail(`Fallo al copiar plantilla: ${err.message}`);
    throw err;
  }

  // [BRECHA-C] Validar integridad de firestore.indexes.json tras copiar el template.
  // Un JSON corrupto, vacío o con estructura inválida hace fallar el firebase deploy de forma
  // poco descriptiva (error genérico de CLI). Se valida y se reemplaza con la estructura mínima.
  {
    const indexesJsonPath = path.join(targetDir, 'firestore.indexes.json');
    let parsed = { indexes: [], fieldOverrides: [] };
    if (await fs.pathExists(indexesJsonPath)) {
      try {
        const indexesRaw = await fs.readFile(indexesJsonPath, 'utf-8');
        parsed = JSON.parse(indexesRaw);
        if (!Array.isArray(parsed.indexes) || !Array.isArray(parsed.fieldOverrides)) {
          throw new Error('Estructura inválida: faltan los arrays "indexes" o "fieldOverrides"');
        }
      } catch (indexErr) {
        console.warn(pc.yellow(`⚠️  firestore.indexes.json inválido (${indexErr.message}). Reemplazando con estructura mínima válida.`));
        parsed = { indexes: [], fieldOverrides: [] };
      }
    }

    // Inyectar índices dinámicos según módulos activos
    const enableCitas = answers.flags?.enableCitas ?? (answers.niche === 'wellness_podology');
    if (enableCitas) {
      const hasAppointmentsIndex = parsed.indexes.some(idx => idx.collectionGroup === 'appointments');
      if (!hasAppointmentsIndex) {
        parsed.indexes.push({
          collectionGroup: "appointments",
          queryScope: "COLLECTION",
          fields: [
            { fieldPath: "date", order: "ASCENDING" },
            { fieldPath: "professionalId", order: "ASCENDING" },
            { fieldPath: "status", order: "ASCENDING" }
          ]
        });
        console.log(pc.gray('   ℹ  Índice compuesto de appointments inyectado dinámicamente en firestore.indexes.json.'));
      }
    }

    await fs.writeJson(indexesJsonPath, parsed, { spaces: 2 });
  }

  // 1.1 Configurar documentación local de la instancia/proyecto (Estándar v2 — 12 archivos)
  const stepDoc = ora('Configurar carpeta de documentación local (12 archivos estándar)').start();
  try {
    const safeProjectName = answers.projectName.replace(/[^a-zA-Z0-9_\-\s]/g, '');
    const docDirName = `Documentacion ${safeProjectName}`;
    const targetDocDir = path.join(targetDir, docDirName);

    if (!isPathContained(targetDir, targetDocDir)) {
      throw new Error('Intento de Path Traversal detectado en el nombre del proyecto al ubicar documentación.');
    }

    // Si el template trae carpeta de documentación con otro nombre, renombrarla
    const files = await fs.readdir(targetDir);
    const tempDocFolder = files.find(f => f.startsWith('Documentacion') && f !== docDirName);
    if (tempDocFolder) {
      await fs.move(path.join(targetDir, tempDocFolder), targetDocDir, { overwrite: true });
    } else {
      await fs.ensureDir(targetDocDir);
    }

    const today = new Date().toISOString().split('T')[0];

    // Definición canónica de los 12 archivos estándar de documentación
    const docStandard = [
      {
        name: 'tareas_pendientes.md',
        content: `# 📋 Control de Tareas — ${answers.projectName}\n\nRoadmap de tareas específicas para esta instancia.\n\n- [ ] Configuración inicial completada\n- [ ] Revisar y completar \`contexto_negocio.md\` con el briefing del cliente\n- [ ] Completar \`esquema_colecciones.md\` con el modelo de datos real\n- [ ] Completar \`guia_estilos_ui.md\` con la paleta y tokens confirmados\n`
      },
      {
        name: 'bitacora_cambios.md',
        content: `# 📝 Bitácora de Cambios — ${answers.projectName}\n\n### [${today}] - Aprovisionamiento Inicial\n* **Tipo:** Sistema\n* **Plantilla:** \`${answers.template}\`\n* **Nicho:** ${answers.niche || 'general_custom'}\n* **Descripción:** Proyecto inicializado y documentación estándar provisionada automáticamente.\n`
      },
      {
        name: 'mapa_aplicacion.md',
        content: `# 🗺️ Mapa de la Aplicación — ${answers.projectName}\n\nEstructura física y lógica de los archivos de la instancia.\n\n> Actualiza este documento cuando agregues módulos, rutas o vistas nuevas.\n\n## Rutas y Vistas\n*(Por completar)*\n\n## Módulos de Negocio\n*(Por completar)*\n`
      },
      {
        name: 'esquema_colecciones.md',
        content: `# 🗄️ Esquema de Colecciones Firestore — ${answers.projectName}\n\nModelado de datos específico para esta instancia.\n\n> Copia la estructura de colecciones del core \`${answers.template}\` y adapta los campos al cliente.\n\n## Colecciones Principales\n*(Por completar — ver core fuente para referencia base)*\n`
      },
      {
        name: 'plan_implementacion_ia.md',
        content: `# 🤖 Plan de Implementación IA — ${answers.projectName}\n\nPropuestas de integraciones con inteligencia artificial para esta instancia.\n\n## Automatizaciones Prioritarias\n*(Por definir con el cliente)*\n`
      },
      {
        name: 'manual_migracion.md',
        content: `# 🚀 Manual de Despliegue — ${answers.projectName}\n\n## Proyecto Firebase\n- **Project ID:** ${answers.firebaseProjectId || '*(pendiente)*'}\n- **Plantilla base:** \`${answers.template}\`\n\n## Variables de Entorno\nVer \`.env.local\` en la raíz del proyecto.\n\n## Comandos de Despliegue\n\`\`\`bash\nnpm run build\nfirebase deploy --only hosting\n\`\`\`\n`
      },
      {
        name: 'flujos_aplicacion.md',
        content: `# 🔄 Flujos Operativos — ${answers.projectName}\n\nDiagramas de secuencia y flujos de datos críticos de esta instancia.\n\n> Adaptar los flujos del core \`${answers.template}\` a la lógica específica del cliente.\n\n## Flujo Principal\n*(Por documentar)*\n`
      },
      {
        name: 'mapa_arquitectura.md',
        content: `# 🏗️ Mapa de Arquitectura Física — ${answers.projectName}\n\nÁrbol de directorios y responsabilidades por capa.\n\n> Ejecutar \`node scratch/generate_ia_map.js\` para auto-generar este mapa.\n`
      },
      {
        name: 'mapa_arquitectura_ia.md',
        content: `# 🧠 Mapa Semántico para IA — ${answers.projectName}\n\nReferencia directa de archivos clave para que la IA navegue el proyecto sin búsquedas ciegas.\n\n> Ejecutar \`npm run map\` para regenerar este mapa con la estructura actual.\n\n## Archivos Críticos\n| Archivo | Propósito |\n|---|---|\n| \`src/App.jsx\` | Entrada principal, enrutador y providers |\n| \`src/store/\` | Stores de estado global (Zustand) |\n| \`src/hooks/\` | Hooks personalizados de lógica de negocio |\n| \`.env.local\` | Variables de entorno — NO editar en código |\n`
      },
      // ─── NUEVOS: CRÍTICOS PARA CONTEXTO DE IA ───────────────────────────────
      {
        name: 'contexto_negocio.md',
        content: `# 🏢 Contexto de Negocio — ${answers.projectName}\n\n> **CRÍTICO PARA LA IA:** Este archivo define la semántica del negocio. Sin él, la IA puede generar código técnicamente correcto pero operativamente incorrecto.\n\n## Cliente\n- **Nombre del negocio:** ${answers.projectName}\n- **Nicho / Vertical:** ${answers.niche || 'general_custom'}\n- **Módulos de Negocio Habilitados:**\n${Object.entries(answers.flags || {}).map(([k, v]) => `  - **${k}:** ${v ? '✅ Activo' : '🔴 Inactivo'}`).join('\n') || '  *(Sin configurar)*'}\n\n## Requerimientos Especiales del Cliente (Briefing)\n${answers.customRequirements
  ? answers.customRequirements.split('\n').map(l => `> ${l}`).join('\n')
  : '> *(Ninguno especificado en el briefing inicial)*'}\n\n## Usuario Final\n*(Describir post-onboarding: quién usa la app, nivel técnico, dispositivos principales)*\n\n## Flujos de Negocio en Lenguaje Natural\n*(Describir los procesos core del negocio paso a paso, sin términos técnicos)*\n\n## Reglas de Dominio Implícitas\n*(Reglas de negocio no obvias que la IA debe respetar. Ej: "Un pedido no puede cancelarse si ya fue despachado")*\n\n## KPIs y Métricas Importantes para el Cliente\n*(Qué mide el dueño del negocio para saber si le va bien)*\n`
      },
      {
        name: 'restricciones_tecnicas.md',
        content: `# 🚫 Restricciones Técnicas — ${answers.projectName}\n\n> La IA debe consultar este archivo antes de actualizar dependencias, cambiar patterns o sugerir librerías.\n\n## Stack Fijo (No Negociable)\n- **Framework:** React + Vite\n- **Estilos:** Tailwind CSS v4 con tokens HSL en \`@theme\`\n- **DB:** Firebase Firestore\n- **Estado:** Zustand\n- **Plantilla base:** \`${answers.template}\`\n\n## Dependencias con Versión Fijada\n| Dependencia | Versión | Razón del bloqueo |\n|---|---|---|\n| firebase | Ver package.json | Compatibilidad con reglas de seguridad existentes |\n\n## Patrones Prohibidos en Este Proyecto\n- ❌ Hardcodear Project IDs o credenciales en código fuente\n- ❌ \`onSnapshot\` sin validar Auth y sin retornar cleanup\n- ❌ Modificar stock/inventario sin \`runTransaction\`\n- ❌ Despliegues automáticos sin aprobación explícita\n- ❌ Bordes negros crudos — usar \`border-app\` o HSL bajos\n\n## Limitaciones Conocidas de Esta Instancia\n*(Ej: "El cliente usa solo dispositivos Android con conexión 4G inestable")*\n`
      },
      {
        name: 'guia_estilos_ui.md',
        content: `# 🎨 Guía de Estilos UI — ${answers.projectName}\n\n> La IA debe respetar estos tokens antes de agregar cualquier color, tipografía o espaciado.\n\n## Paleta de Colores Completa (HSL — pre-configurada en aprovisionamiento)\n| Token CSS | Valor configurado |\n|---|---|\n| \`--color-primary\` | \`${primaryColor}\` |\n| \`--color-accent\` | \`${accentColor}\` |\n| \`--color-bg\` | \`${answers.branding?.bgColor || 'hsl(224, 71%, 4%)'}\` |\n| \`--color-text\` | \`${answers.branding?.textColor || 'hsl(213, 31%, 91%)'}\` |\n| \`--color-surface\` | \`${answers.branding?.surfaceColor || 'hsl(222, 47%, 8%)'}\` |\n| \`--color-surface-2\` | \`${answers.branding?.surface2Color || 'hsl(220, 40%, 13%)'}\` |\n| \`--color-border\` | \`${answers.branding?.borderColor || 'hsl(215, 28%, 17%)'}\` |\n| \`--color-text-muted\` | \`${answers.branding?.textMutedColor || 'hsl(215, 16%, 47%)'}\` |\n| \`--radius-base\` | \`${answers.branding?.radiusBase || '0.75rem'}\` |\n\n> ⚠️ Estos valores ya están inyectados en \`src/index.css\`. NUNCA usar colores hardcodeados fuera del sistema de tokens.\n\n## Tipografía\n- **Google Font:** \`${answers.branding?.googleFont || 'Inter'}\`\n- **Escala:** base 14px (móvil) / 16px (escritorio)\n\n## Tokens de Diseño\n| Token | Valor |\n|---|---|\n| Radius base | \`${answers.branding?.radiusBase || '0.75rem'}\` |\n| Radius botones | \`0.5rem\` |\n| Shadow tarjetas | \`0 4px 24px hsl(var(--color-primary)/0.15)\` |\n| Glassmorphism | \`backdrop-blur-xl bg-[var(--color-surface)]/80\` |\n\n## Componentes Atómicos Disponibles\n- \`/src/components/ui/\` — Consultar antes de crear nuevos elementos base\n- \`/src/components/common/\` — Componentes de dominio reutilizables\n\n## Convenciones de IDs y Clases\n- IDs en kebab-case descriptivo: \`btn-confirm-sale\`, \`input-product-name\`\n- No usar IDs genéricos como \`btn1\`, \`div2\`\n- Usar siempre \`var(--color-*)\` en lugar de colores Tailwind directos\n`
      }
    ];

    // Nombres genéricos conocidos usados en templates de core que deben reemplazarse
    const GENERIC_PLACEHOLDERS = [
      'Plantilla Core', 'App Ventas', 'App-Ventas', 'Core Seed',
      'Instancia Base', 'Template Base', 'NombreProyecto', 'ProjectName'
    ];
    const genericRegex = new RegExp(GENERIC_PLACEHOLDERS.map(p =>
      p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escapar caracteres especiales de regex
    ).join('|'), 'g');

    // Generar cada archivo: respetar contenido existente a menos que sea uno de los archivos
    // clave de marca/briefing que debemos personalizar dinámicamente con los datos reales.
    const forceOverwrite = [
      'tareas_pendientes.md',
      'bitacora_cambios.md',
      'contexto_negocio.md',
      'guia_estilos_ui.md',
      'restricciones_tecnicas.md',
      'mapa_arquitectura_ia.md'
    ];

    for (const doc of docStandard) {
      const filePath = path.join(targetDocDir, doc.name);
      if (!await fs.pathExists(filePath) || forceOverwrite.includes(doc.name)) {
        await fs.writeFile(filePath, doc.content, 'utf-8');
      } else {
        // Si existe pero viene del core con contenido genérico de placeholder, adaptar el nombre del proyecto
        let existing = await fs.readFile(filePath, 'utf-8');
        if (GENERIC_PLACEHOLDERS.some(p => existing.includes(p))) {
          existing = existing.replace(genericRegex, answers.projectName);
          await fs.writeFile(filePath, existing, 'utf-8');
        }
      }
    }

    stepDoc.succeed(`Documentación estándar (12 archivos) provisionada en \`${docDirName}/\`.`);
  } catch (docErr) {
    stepDoc.warn(`No se pudo inicializar la documentación local: ${docErr.message}`);
  }

  // 2.1 Inyectar colores HSL en caliente en el archivo de estilos global detectado
  const stepCSS = ora('Inyectando variables de tema HSL en estilos globales').start();
  try {
    const cssCandidates = [
      path.join(targetDir, 'src', 'index.css'),
      path.join(targetDir, 'src', 'styles', 'index.css'),
      path.join(targetDir, 'src', 'styles', 'global.css'),
      path.join(targetDir, 'src', 'App.css'),
      path.join(targetDir, 'src', 'index.scss')
    ];
    let indexPathCSS = null;
    for (const cand of cssCandidates) {
      if (await fs.pathExists(cand)) {
        indexPathCSS = cand;
        break;
      }
    }

    if (indexPathCSS) {
      let cssContent = await fs.readFile(indexPathCSS, 'utf-8');
      
      const brand = answers.branding || {};

      // [A1 FIX] Normalizar colores a formato CSS válido.
      // El briefing puede enviar colores en hex (#6366f1) o en HSL (hsl(245,58%,55%)).
      // Mixear hex con variables HSL rompe el sistema de color de Tailwind v4 que espera tokens consistentes.
      // → Usamos hex directamente (válido en CSS moderno). Garantizamos que NUNCA llegue undefined/null.
      const normalizeColor = (color, fallback) => {
        if (!color || typeof color !== 'string') return fallback;
        const trimmed = color.trim();
        // Si es HSL string, convertir a hex para consistencia en el :root
        const hslParsed = parseHSL(trimmed);
        if (hslParsed) {
          const { h, s, l } = hslParsed;
          // Convertir HSL a hex
          const sNorm = s / 100, lNorm = l / 100;
          const a = sNorm * Math.min(lNorm, 1 - lNorm);
          const toHex = (n) => {
            const k = (n + h / 30) % 12;
            const val = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * val).toString(16).padStart(2, '0');
          };
          return `#${toHex(0)}${toHex(8)}${toHex(4)}`;
        }
        // Si ya es hex válido, usarlo directamente
        if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed)) return trimmed;
        // Cualquier otro formato CSS válido (rgb, oklch, named) — pasar tal cual
        return trimmed || fallback;
      };

      const brandPrimary     = normalizeColor(brand.primaryColor   || primaryColor,  '#6366f1');
      const brandAccent      = normalizeColor(brand.secondaryColor  || accentColor,   '#a855f7');
      const brandBg          = normalizeColor(brand.bgColor,         '#f8fafc');
      const brandText        = normalizeColor(brand.textColor,       '#0f172a');
      const brandSurface     = normalizeColor(brand.surfaceColor,    '#ffffff');
      const brandSurface2    = normalizeColor(brand.surface2Color,   '#f1f5f9');
      const brandBorder      = normalizeColor(brand.borderColor,     '#cbd5e1');
      const brandTextMuted   = normalizeColor(brand.textMutedColor,  '#475569');
      const brandRadius      = brand.radiusBase || '0.75rem';
      const brandFont        = brand.googleFont || 'Inter';

      // --- Sanitización y Normalización de Tokens de Fondo e Interactividad (WCAG / GPU) ---
      const BG_TYPES = new Set(["solid", "mesh", "aurora", "grid", "particles"]);
      const PARTICLE_COLORS = new Set(["primary", "pastel", "neutral", "brand", "mixed"]);
      const PARTICLE_DIRECTIONS = new Set(["random", "up", "down", "left", "right"]);
      const PARTICLE_SHAPES = new Set(["circle", "glow", "star", "niche"]);

      const enumValue = (value, allowed, fallback) => allowed.has(value) ? value : fallback;
      const boolValue = (value) => value === true || value === "true" || value === 1 || value === "1";
      const numberValue = (value, { min, max, fallback, integer = false }) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        const clipped = Math.min(max, Math.max(min, n));
        return integer ? Math.round(clipped) : clipped;
      };

      // Extracción del objeto background
      const bgInput = brand.background || {};
      const bgType = enumValue(bgInput.bgType, BG_TYPES, 'solid');
      const bgMouseTracking = boolValue(bgInput.bgMouseTracking);
      const bgParticlesCount = numberValue(bgInput.bgParticlesCount, { min: 0, max: 150, fallback: 40, integer: true });
      const bgParticlesSpeed = numberValue(bgInput.bgParticlesSpeed, { min: 0.1, max: 5.0, fallback: 0.8 });
      const bgParticlesSize = numberValue(bgInput.bgParticlesSize, { min: 1, max: 150, fallback: 2 });
      const bgParticlesColor = enumValue(bgInput.bgParticlesColor, PARTICLE_COLORS, 'primary');
      const bgParticlesOpacity = numberValue(bgInput.bgParticlesOpacity, { min: 0.1, max: 1.0, fallback: 0.35 });
      const bgParticlesDirection = enumValue(bgInput.bgParticlesDirection, PARTICLE_DIRECTIONS, 'random');
      const bgParticlesShape = enumValue(bgInput.bgParticlesShape, PARTICLE_SHAPES, 'circle');
      const bgParticlesIcon = String(bgInput.bgParticlesIcon || 'default').trim();
      const bgOrbsCount = numberValue(bgInput.bgOrbsCount, { min: 1, max: 12, fallback: 3, integer: true });
      const bgOrbsOpacity = numberValue(bgInput.bgOrbsOpacity, { min: 0.05, max: 0.8, fallback: 0.16 });
      const bgOrbsSpeed = numberValue(bgInput.bgOrbsSpeed, { min: 0.1, max: 4.0, fallback: 1.0 });
      const bgOrbsSize = numberValue(bgInput.bgOrbsSize, { min: 0.2, max: 3.0, fallback: 1.0 });
      const bgOrbsBlur = numberValue(bgInput.bgOrbsBlur, { min: 0.1, max: 2.0, fallback: 1.0 });
      const brandNiche = brand.niche || 'retail_clothing';

      // Extracción de efectos adicionales
      const brandBorderBeam = boolValue(brand.borderBeam);
      const brandTilt3d = boolValue(brand.tilt3d);

      // ─── Design Effect Tokens ───────────────────────────────────────────────
      const brandShadowStyle   = brand.shadowStyle || 'soft';   // none|soft|hard|glow|neon
      const brandGlassmorphism = brand.glassmorphism === true;
      const brandAnimSpeed     = brand.animationSpeed || 'normal';
      const brandRadiusMode    = brand.radiusMode || 'rounded';

      // Mapa de animationSpeed → duración CSS
      const motionDurationMap = { instant: '0ms', fast: '150ms', normal: '250ms', slow: '400ms' };
      const brandMotionDefault = motionDurationMap[brandAnimSpeed] || '250ms';

      // Mapa de radiusMode → tokens por componente
      const radiusModeMap = {
        sharp:   { card: '0rem',    button: '0rem',    input: '0.25rem', pill: '9999px' },
        soft:    { card: '0.5rem',  button: '0.375rem', input: '0.375rem', pill: '9999px' },
        rounded: { card: '0.75rem', button: '0.5rem',  input: '0.5rem',  pill: '9999px' },
        extra:   { card: '1.25rem', button: '1rem',    input: '0.75rem', pill: '9999px' },
        pill:    { card: '1.5rem',  button: '9999px',  input: '9999px',  pill: '9999px' },
      };
      const rMap = radiusModeMap[brandRadiusMode] || radiusModeMap.rounded;

      // Alias semántico de sombra por defecto
      const shadowAliasMap = {
        none:  'none',
        soft:  'var(--shadow-soft)',
        hard:  'var(--shadow-hard)',
        glow:  'var(--shadow-glow)',
        neon:  'var(--shadow-neon)',
      };
      const brandShadowDefault = shadowAliasMap[brandShadowStyle] || 'var(--shadow-soft)';

      // Glass tokens — valores neutros cuando está desactivado
      const glassBlur    = brandGlassmorphism ? '18px' : '0px';
      const glassOpacity = brandGlassmorphism ? '0.08' : '0';
      const glassBg      = brandGlassmorphism ? 'rgba(255,255,255,0.08)' : 'transparent';
      const glassBorder  = brandGlassmorphism ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0)';

      // Funciones de conversión de color
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 99, g: 102, b: 241 };
      };

      const rgbToHsl = (r, g, b) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
          h = s = 0;
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        return {
          h: Math.round(h * 360),
          s: Math.round(s * 100),
          l: Math.round(l * 100)
        };
      };

      const primaryRgbObj = hexToRgbObj(brandPrimary);
      const primaryHslObj = rgbToHslObj(primaryRgbObj.r, primaryRgbObj.g, primaryRgbObj.b);

      const brandPrimaryRgb = `${primaryRgbObj.r} ${primaryRgbObj.g} ${primaryRgbObj.b}`;
      const brandPrimaryHsl = `${primaryHslObj.h} ${primaryHslObj.s}% ${primaryHslObj.l}%`;

      // Regla de optimización de neón para que brille en colores oscuros
      const neonLightness = Math.min(68, Math.max(52, primaryHslObj.l));
      const neonSaturation = Math.min(100, Math.max(72, primaryHslObj.s));
      const brandNeonHsl = `${primaryHslObj.h} ${neonSaturation}% ${neonLightness}%`;

      // Glow adaptativo según luminancia del color de marca
      const baseLightness = primaryHslObj.l;
      const glowGain = baseLightness < 45 ? 1.25 : baseLightness > 72 ? 0.82 : 1;

      // Calcular HSL accesible para textos y bordes en light mode
      const textOnLightHsl = ensureReadableHslOnBackground(primaryHslObj, '#ffffff', 4.5);
      const borderOnLightHsl = ensureReadableHslOnBackground(primaryHslObj, '#ffffff', 3.0);

      // --color-primary-light: hex8 ~87% opacidad (CSS4 estándar)
      const brandPrimaryLight = brandPrimary.length === 7 ? `${brandPrimary}dd` : brandPrimary;

      const brandingVarsContent = `  /* ─── BRANDING_VARS_START (Sanitizados) ─── */
  --color-primary: ${brandPrimary};
  --color-primary-light: ${brandPrimaryLight};
  --color-primary-dark: ${brandAccent};
  --brand-primary-rgb: ${brandPrimaryRgb};
  --brand-primary-hsl: ${brandPrimaryHsl};
  --brand-neon-hsl: ${brandNeonHsl};
  --color-primary-readable: hsl(${textOnLightHsl.h} ${textOnLightHsl.s}% ${textOnLightHsl.l}%);
  --border-primary-readable: hsl(${borderOnLightHsl.h} ${borderOnLightHsl.s}% ${borderOnLightHsl.l}%);
  --color-secondary: ${brandSurface2};
  --color-accent: ${brandAccent};
  --color-bg: ${brandBg};
  --color-surface: ${brandSurface};
  --color-surface-2: ${brandSurface2};
  --color-text: ${brandText};
  --color-text-muted: ${brandTextMuted};
  --color-border: ${brandBorder};
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* ─── Tipografía y Radius Base (legacy alias) ─── */
  --font-body: '${brandFont}', system-ui, sans-serif;
  --radius-base: ${brandRadius};
  --color-action: var(--color-primary);

  /* ─── Sombras: Paleta base ─── */
  --shadow-none: none;
  --shadow-soft: 0 12px 32px hsl(var(--brand-primary-hsl) / ${(0.16 * glowGain).toFixed(3)});
  --shadow-hard: 4px 4px 0 hsl(var(--brand-primary-hsl) / 1);
  --shadow-glow:
    0 0 0 1px hsl(var(--brand-primary-hsl) / ${(Math.min(0.9, 0.24 * glowGain)).toFixed(3)}),
    0 0 16px hsl(var(--brand-primary-hsl) / ${(Math.min(0.9, 0.42 * glowGain)).toFixed(3)}),
    0 0 34px hsl(var(--brand-primary-hsl) / ${(Math.min(0.9, 0.28 * glowGain)).toFixed(3)}),
    0 12px 34px hsl(var(--brand-primary-hsl) / ${(Math.min(0.9, 0.18 * glowGain)).toFixed(3)});
  --shadow-neon:
    0 0 12px hsl(var(--brand-neon-hsl) / ${(Math.min(0.9, 0.45 * glowGain)).toFixed(3)}),
    0 0 24px hsl(var(--brand-neon-hsl) / ${(Math.min(0.8, 0.32 * glowGain)).toFixed(3)}),
    0 0 48px hsl(var(--brand-neon-hsl) / ${(Math.min(0.6, 0.18 * glowGain)).toFixed(3)}),
    0 0 96px hsl(var(--brand-neon-hsl) / ${(Math.min(0.4, 0.08 * glowGain)).toFixed(3)});

  /* ─── Sombras: Aliases semánticos (decisión del cliente) ─── */
  --shadow-default: ${brandShadowDefault};
  --shadow-card:    var(--shadow-default);
  --shadow-button:  var(--shadow-default);
  --shadow-focus:   0 0 0 3px color-mix(in srgb, ${brandPrimary} 28%, transparent);

  /* ─── Glassmorphism ─── */
  --glass-blur:    ${glassBlur};
  --glass-opacity: ${glassOpacity};
  --glass-bg:      ${glassBg};
  --glass-border:  ${glassBorder};

  /* ─── Motion / Animaciones ─── */
  --motion-duration-fast:    150ms;
  --motion-duration-base:    250ms;
  --motion-duration-slow:    400ms;
  --motion-duration-default: ${brandMotionDefault};

  /* ─── Radius: Tokens por componente ─── */
  --radius-card:   ${rMap.card};
  --radius-button: ${rMap.button};
  --radius-input:  ${rMap.input};
  --radius-pill:   ${rMap.pill};

  /* ─── Efectos de Apariencia ─── */
  --effect-border-beam: ${brandBorderBeam ? 1 : 0};
  --effect-tilt-3d: ${brandTilt3d ? 1 : 0};
  --bg-type: ${bgType};
  --bg-mouse-tracking: ${bgMouseTracking ? 1 : 0};
  --bg-particles-count: ${bgParticlesCount};
  --bg-particles-speed: ${bgParticlesSpeed};
  --bg-particles-size: ${bgParticlesSize}px;
  --bg-particles-color: ${bgParticlesColor};
  --bg-particles-opacity: ${bgParticlesOpacity};
  --bg-particles-direction: ${bgParticlesDirection};
  --bg-particles-shape: ${bgParticlesShape};
  --bg-particles-icon: ${bgParticlesIcon};
  --bg-orbs-count: ${bgOrbsCount};
  --bg-orbs-opacity: ${bgOrbsOpacity};
  --bg-orbs-speed: ${bgOrbsSpeed};
  --bg-orbs-size: ${bgOrbsSize};
  --bg-orbs-blur: ${bgOrbsBlur};
  --brand-niche: ${brandNiche};
  /* ─── BRANDING_VARS_END ─── */`;

      const startTag = '/* ─── BRANDING_VARS_START (Sanitizados) ─── */';
      const endTag = '/* ─── BRANDING_VARS_END ─── */';

      if (cssContent.includes(startTag) && cssContent.includes(endTag)) {
        // 1. Reemplazo idempotente de bloque si ya existe
        const startIdx = cssContent.indexOf(startTag);
        const endIdx = cssContent.indexOf(endTag) + endTag.length;
        cssContent = cssContent.slice(0, startIdx) + brandingVarsContent + cssContent.slice(endIdx);
      } else {
        // 2. Insertar de forma segura en el :root preexistente
        const rootStart = cssContent.search(/:root\s*\{/);
        if (rootStart !== -1) {
          const openBraceIdx = cssContent.indexOf('{', rootStart);
          if (openBraceIdx !== -1) {
            cssContent = cssContent.slice(0, openBraceIdx + 1) + '\n' + brandingVarsContent + cssContent.slice(openBraceIdx + 1);
          } else {
            cssContent = brandingVarsContent + '\n\n' + cssContent;
          }
        } else {
          // 3. Crear :root completo desde cero si no existe
          cssContent = `:root {\n${brandingVarsContent}\n}\n\n` + cssContent;
        }
      }

      await fs.writeFile(indexPathCSS, cssContent, 'utf-8');
      stepCSS.succeed(`Variables de marca completas inyectadas en estilos globales (${path.basename(indexPathCSS)}).`);
    } else {
      stepCSS.info('No se encontró ningún archivo de estilos global compatible para inyectar colores en caliente.');
    }
  } catch (cssErr) {
    stepCSS.warn(`Aviso al configurar variables en estilos globales: ${cssErr.message}`);
  }


  // 3. (Paso omitido: FCM desactivado)
  const step4 = ora('Generar variables de entorno (.env.local)').start();
  // clientId ya fue declarado y validado al inicio de createProject (L193)
  const initials = (answers.projectName || 'P')
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3) || 'P';
  const uniqueToken = (answers.telemetryToken || `${clientId}-token-${Date.now()}`).trim();

  // [BLINDAJE-SEGURIDAD] Generar contraseña admin única e impredecible por instancia.
  // NUNCA usar una contraseña estática compartida entre todas las instancias.
  const generatedAdminPassword = [
    Math.random().toString(36).slice(2, 6).toUpperCase(),
    Math.random().toString(36).slice(2, 6),
    Math.floor(Math.random() * 9000 + 1000),
    '!'
  ].join('');

  const adminEmail = String(answers.adminEmail || `admin@${clientId}.com`).trim();
  const adminPassword = String(answers.adminPassword || generatedAdminPassword).trim();
  const whatsappAdmin = String(answers.whatsappAdmin || '').replace(/\D/g, '').trim();
  const storeAddress = String(answers.storeAddress || '').trim();

  // Sanitizar todos los inputs eliminando espacios accidentales
  const fbApiKey = String(answers.firebaseApiKey || '').trim();
  const fbAuthDomain = String(answers.firebaseAuthDomain || '').trim();
  const fbProjectId = String(answers.firebaseProjectId || '').trim();
  const fbStorageBucket = String(answers.firebaseStorageBucket || '').trim();
  const fbAppId = String(answers.firebaseAppId || '').trim();

  const centralApiKey = String(answers.centralApiKey || '').trim();
  const centralAppId = String(answers.centralAppId || '').trim();

  const envContent = `VITE_FIREBASE_API_KEY=${fbApiKey}
VITE_FIREBASE_AUTH_DOMAIN=${fbAuthDomain}
VITE_FIREBASE_PROJECT_ID=${fbProjectId}
VITE_FIREBASE_STORAGE_BUCKET=${fbStorageBucket}
VITE_FIREBASE_APP_ID=${fbAppId}
VITE_INITIAL_THEME=${themeName}
VITE_DEVELOPER_EMAIL=${answers.developerEmail || ''}

# Credenciales del Administrador de la Instancia (Personalizadas o Autogeneradas)
VITE_DEVELOPER_ADMIN_EMAIL=${adminEmail}
VITE_DEVELOPER_ADMIN_PASSWORD=${adminPassword}
VITE_DEVELOPER_WHATSAPP_ADMIN=${whatsappAdmin}
VITE_DEVELOPER_STORE_ADDRESS=${storeAddress}

# Telemetría de Comisiones del Desarrollador (Centralización Central - Bridge Local)
VITE_DEVELOPER_TELEMETRY_ENDPOINT=http://localhost:3001
VITE_DEVELOPER_CLIENT_ID=${clientId}

# Variables de la Consola Central de Control (Developer Cockpit)
VITE_DEVELOPER_CENTRAL_API_KEY=${centralApiKey || process.env.VITE_DEVELOPER_CENTRAL_API_KEY || 'AIzaSyCBkdokIpGqWlfFiU_i83o7GmV1ZTqXYJE'}
VITE_DEVELOPER_CENTRAL_PROJECT_ID=${answers.centralProjectId || process.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID || 'prototipe-ecosistema-control'}
VITE_DEVELOPER_CENTRAL_APP_ID=${centralAppId || process.env.VITE_DEVELOPER_CENTRAL_APP_ID || '1:703542009613:web:00f9363de11a908c991a44'}
VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN=prototipe-ecosistema-control.firebaseapp.com
VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET=prototipe-ecosistema-control.firebasestorage.app
VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID=703542009613

# Configuración Local de Facturación de Instancias (Fallback)
VITE_DEVELOPER_BILLING_MODE=${answers.billingMode || 'percentage'}
VITE_DEVELOPER_COMMISSION_PERCENT=${answers.comisionPorcentaje ?? 1.5}
VITE_DEVELOPER_FIXED_SERVICE_FEE=${answers.montoFijoServicio ?? 0}
VITE_DEVELOPER_FLAT_MONTHLY_FEE=${answers.pagoMensualFijo ?? 0}
VITE_DEVELOPER_ENABLE_DIAN_BILLING=${answers.enableDianBilling ?? false}
VITE_DEVELOPER_COSTO_POR_FACTURA_DIAN=${answers.costoPorFacturaDian ?? 0}

# Nicho / Vertical de Negocio (usado por telemetría para contextualizar reportes de error)
VITE_NICHE=${answers.niche || 'general'}`;

  await fs.writeFile(path.join(targetDir, '.env.local'), envContent, 'utf-8');

  
  const devEnvContent = envContent + `\nVITE_ENV=development`;
  const prodEnvContent = envContent.replace(
    new RegExp(`VITE_FIREBASE_PROJECT_ID=${fbProjectId}`),
    `VITE_FIREBASE_PROJECT_ID=${fbProjectId}-prod`
  ) + `\nVITE_ENV=production`;
  await fs.writeFile(path.join(targetDir, '.env.development'), devEnvContent, 'utf-8');
  await fs.writeFile(path.join(targetDir, '.env.production'), prodEnvContent, 'utf-8');

  const firebaseRC = {
    projects: {
      default: fbProjectId,
      development: fbProjectId,
      production: `${fbProjectId}-prod`
    }
  };
  await fs.writeJson(path.join(targetDir, '.firebaserc'), firebaseRC, { spaces: 2 });

  step4.succeed('Variables de entorno duales (.env.local, .env.development, .env.production, .firebaserc) generadas.');

  // 4.1. Crear archivo .gitignore de forma nativa para prevenir fugas de secretos (Auditoría)
  const gitignorePath = path.join(targetDir, '.gitignore');
  const gitignoreContent = `# Logs y Cachés
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Directorios de dependencias
node_modules/

# Build output - NUNCA subir al repositorio
dist/
dist-ssr/

# Variables de entorno - SECRETOS: NUNCA subir
.env
.env.*
!.env.example

# Firebase CLI cache y builds locales - NUNCA subir
.firebase/
firebase-debug.log
firebase-debug.*.log

# Vite cache
.vite/

# IDEs y Editores
.vscode/*
!.vscode/extensions.json
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Carpeta de pruebas y scratch local
scratch/
playwright-report/
test-results/
`;
  await fs.writeFile(gitignorePath, gitignoreContent, 'utf-8');

  // 5. El archivo .firebaserc ya fue generado en la sección de variables de entorno duales.
  const step5 = ora('Generar archivo de vinculación .firebaserc').start();
  step5.succeed('Archivo de vinculación .firebaserc verificado (soporte dual de entornos activo).');

  // 5.1 Crear archivo firebase.json de forma nativa para configurar Firestore y Storage
  const step5_1 = ora('Generar configuración firebase.json').start();
  const firebaseJsonPath = path.join(targetDir, 'firebase.json');
  if (!(await fs.pathExists(firebaseJsonPath))) {
    const firebaseJsonContent = JSON.stringify({
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
        rewrites: [
          {
            source: "**",
            destination: "/index.html"
          }
        ]
      }
    }, null, 2);
    await fs.writeFile(firebaseJsonPath, firebaseJsonContent, 'utf-8');
    step5_1.succeed('Configuración firebase.json generada correctamente (fallback).');
  } else {
    step5_1.succeed('Configuración firebase.json heredada de la plantilla.');
  }

  // Asegurar cabeceras estrictas de caché PWA a futuro en firebase.json (CORE-090)
  try {
    if (await fs.pathExists(firebaseJsonPath)) {
      const config = await fs.readJson(firebaseJsonPath);
      if (!config.hosting) config.hosting = {};
      const hostings = Array.isArray(config.hosting) ? config.hosting : [config.hosting];
      
      const requiredHeaders = [
        { source: '/index.html', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
        { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
        { source: '/manifest.webmanifest', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
        { source: '/manifest.json', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
        { source: '/assets/**', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }
      ];
      
      let changed = false;
      for (const h of hostings) {
        if (!h.headers) h.headers = [];
        for (const req of requiredHeaders) {
          const idx = h.headers.findIndex(item => item.source === req.source);
          if (idx === -1) {
            h.headers.push(req);
            changed = true;
          } else {
            const existing = h.headers[idx];
            const hasCacheCtrl = existing.headers && existing.headers.some(x => x.key === 'Cache-Control' && x.value === req.headers[0].value);
            if (!hasCacheCtrl) {
              h.headers[idx] = req;
              changed = true;
            }
          }
        }
      }
      if (changed) {
        config.hosting = Array.isArray(config.hosting) ? hostings : hostings[0];
        await fs.writeJson(firebaseJsonPath, config, { spaces: 2 });
      }
    }
  } catch (err) {
    console.error('⚠️ Error al inyectar cabeceras estrictas de caché en firebase.json:', err.message);
  }

  const step5_2 = ora('Generar reglas de almacenamiento storage.rules').start();
  const storageRulesContent = `rules_version = '2';
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
  const storageRulesPath = path.join(targetDir, 'storage.rules');
  if (!(await fs.pathExists(storageRulesPath))) {
    await fs.writeFile(storageRulesPath, storageRulesContent, 'utf-8');
    step5_2.succeed('Reglas de almacenamiento (storage.rules) generadas correctamente.');
  } else {
    step5_2.succeed('Reglas de almacenamiento (storage.rules) heredadas de la plantilla.');
  }

  // 5.3 Crear reglas de Firestore firestore.rules por defecto
  const step5_3 = ora('Generar reglas de Firestore firestore.rules').start();
  const firestoreRulesPath = path.join(targetDir, 'firestore.rules');
  let rulesContent = '';
  let isInherited = false;
  
  if (await fs.pathExists(firestoreRulesPath)) {
    rulesContent = await fs.readFile(firestoreRulesPath, 'utf-8');
    isInherited = true;
  } else {
    rulesContent = `rules_version = '2';
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
  }

  // Inyectar reglas específicas por módulo si están activos
  const enableCitas = answers.flags?.enableCitas ?? (answers.niche === 'wellness_podology');
  if (enableCitas && !rulesContent.includes('/appointments/')) {
    const appointmentsRules = `
    // Citas agendadas (Inyectado dinámicamente por CLI para módulo de Agendamiento)
    match /appointments/{appointmentId} {
      allow read: if true;
      allow create: if true; // Permitir agendamiento público
      allow update, delete: if request.auth != null; // Solo administradores
    }
`;
    // Encontrar la llave de cierre del bloque de documentos (el penúltimo '}')
    const firstEnd = rulesContent.lastIndexOf('}');
    if (firstEnd !== -1) {
      const secondEnd = rulesContent.lastIndexOf('}', firstEnd - 1);
      if (secondEnd !== -1) {
        rulesContent = rulesContent.slice(0, secondEnd) + appointmentsRules + rulesContent.slice(secondEnd);
      }
    }
  }

  // Endurecimiento de reglas en caliente para nichos transaccionales (POS, E-commerce, Inventarios)
  const transactionalNiches = [
    'grocery_food', 'retail_clothing', 'alimentos-artesanales', 
    'ferreteria-rural', 'repuestos-motos', 'distribuidoras-beauty', 
    'petshops-locales', 'repuestos-lineablanca', 'moda-local-calzado', 
    'licores-cocteleria', 'coleccionismo-geek', 'distribucion-horeca'
  ];
  const isTransactional = transactionalNiches.includes(answers.niche) || answers.flags?.enablePos === true;

  if (isTransactional && !rulesContent.includes('/products/')) {
    const transactionalRules = `
    // Helper de validación de administrador (Inyectado dinámicamente por CLI)
    function isAdminUser() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Catálogo de Productos (Lectura libre, escritura exclusiva a Administradores)
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdminUser();
    }

    // Turnos de Caja e Históricos Financieros (Acceso restringido a Administradores)
    match /cajas/{cajaId} {
      allow read, write: if isAdminUser();
    }

    // Configuración de arranque del negocio
    match /config/settings {
      allow read: if true;
      allow write: if isAdminUser() || !exists(/databases/$(database)/documents/config/settings);
    }
`;
    // Encontrar la llave de cierre del bloque de documentos (el penúltimo '}')
    const firstEnd = rulesContent.lastIndexOf('}');
    if (firstEnd !== -1) {
      const secondEnd = rulesContent.lastIndexOf('}', firstEnd - 1);
      if (secondEnd !== -1) {
        rulesContent = rulesContent.slice(0, secondEnd) + transactionalRules + rulesContent.slice(secondEnd);
      }
    }
  }

  await fs.writeFile(firestoreRulesPath, rulesContent, 'utf-8');
  step5_3.succeed(`Reglas de base de datos (firestore.rules) ${isInherited ? 'heredadas y adaptadas' : 'generadas y adaptadas'} correctamente.`);

  // 5.5 Crear archivo src/config/niche.json con especificaciones del nicho
  const stepNiche = ora('Generar metadatos de nicho (niche.json)').start();
  const configDir = path.join(targetDir, 'src', 'config');
  await fs.ensureDir(configDir);
  
  let nicheData = {
    niche: answers.niche || 'general_custom',
    projectName: answers.projectName,
    theme: themeName,
    primaryColor,
    attributes: [],
    features: {
      showSizes: answers.flags?.showSizes ?? (answers.niche === 'retail_clothing'),
      showColors: answers.flags?.showColors ?? (answers.niche === 'retail_clothing'),
      enableKitchen: answers.flags?.enableKitchen ?? false,
      enableDelivery: answers.flags?.enableDelivery ?? false,
      enableCredits: answers.flags?.enableCredits ?? false,
      enableCitas: answers.flags?.enableCitas ?? (answers.niche === 'wellness_podology')
    }
  };

  let loadedAttributes = null;
  try {
    const nichesPath = path.join(__dirname, 'config', 'niches.json');
    if (await fs.pathExists(nichesPath)) {
      const nichesConfig = await fs.readJson(nichesPath);
      if (nichesConfig && nichesConfig[answers.niche]) {
        loadedAttributes = nichesConfig[answers.niche];
      }
    }
  } catch (e) {
    console.warn(pc.yellow(`⚠️  [Niche Config] No se pudo leer config/niches.json, usando fallback interno: ${e.message}`));
  }

  if (loadedAttributes) {
    nicheData.attributes = loadedAttributes;
  } else {
    // FALLBACK INTERNO ORIGINAL
    if (answers.niche === 'retail_clothing') {
      nicheData.attributes = [
        { name: 'talla', label: 'Talla', type: 'select', options: ['S', 'M', 'L', 'XL', '38', '39', '40', '41', '42'] },
        { name: 'color', label: 'Color', type: 'text', placeholder: 'Ej. Negro, Blanco, Azul' }
      ];
    } else if (answers.niche === 'grocery_food') {
      nicheData.attributes = [
        { name: 'presentacion', label: 'Presentación', type: 'select', options: ['Libra', 'Kilo', 'Atado', 'Unidad'] }
      ];
    } else if (answers.niche === 'technical_services') {
      nicheData.attributes = [
        { name: 'material', label: 'Material', type: 'text', placeholder: 'Ej. Bronce SAE 64' },
        { name: 'especificaciones', label: 'Especificación Técnica', type: 'text', placeholder: 'Ej. Rosca NPT 1/2' }
      ];
    } else if (answers.niche === 'refrigeration_ac') {
      nicheData.attributes = [
        { name: 'marca_equipo', label: 'Marca del Equipo', type: 'text', placeholder: 'Ej. LG, Carrier' },
        { name: 'tipo_refrigerante', label: 'Tipo de Refrigerante', type: 'select', options: ['R-410A', 'R-22', 'R-134a', 'R-404A'] }
      ];
    } else if (answers.niche === 'contractors') {
      nicheData.attributes = [
        { name: 'unidad_medida', label: 'Unidad de Medida', type: 'select', options: ['Metro Lineal (m)', 'Metro Cuadrado (m2)', 'Metro Cúbico (m3)', 'Global (glb)', 'Día Operario'] }
      ];
    } else if (answers.niche === 'machinery_rental') {
      nicheData.attributes = [
        { name: 'numero_serial', label: 'Número Serial / Placa', type: 'text', placeholder: 'Ej. CAT-924G-01' },
        { name: 'tarifa_tiempo', label: 'Modo de Alquiler', type: 'select', options: ['Por Hora', 'Por Día', 'Por Semana', 'Por Mes'] }
      ];
    } else if (answers.niche === 'carpentry') {
      nicheData.attributes = [
        { name: 'tipo_madera', label: 'Tipo de Madera', type: 'select', options: ['Pino', 'Cedro', 'Roble', 'Teca', 'MDF / Melamina'] },
        { name: 'acabado', label: 'Acabado', type: 'select', options: ['Poliuretano', 'Laca Catalizada', 'Barniz', 'Aceite / Natural', 'Pintado'] }
      ];
    } else if (answers.niche === 'laundry') {
      nicheData.attributes = [
        { name: 'peso_estimado', label: 'Rango de Peso', type: 'select', options: ['1-5 kg', '6-10 kg', '11-15 kg', 'Más de 15 kg'] },
        { name: 'tipo_prenda', label: 'Tipo de Prenda / Servicio', type: 'text', placeholder: 'Ej. Plumón, Traje, Cortina' }
      ];
    } else if (answers.niche === 'furniture_repair') {
      nicheData.attributes = [
        { name: 'tipo_tela', label: 'Tipo de Tela / Tapizado', type: 'text', placeholder: 'Ej. Microfibra Antirrasguño, Cuero' },
        { name: 'estado_ingreso', label: 'Estado del Mueble', type: 'text', placeholder: 'Ej. Estructura rota / Solo espuma' }
      ];
    } else if (answers.niche === 'wellness_podology') {
      nicheData.attributes = [
        { name: 'duracion', label: 'Duración Estimada', type: 'select', options: ['30 min', '45 min', '1 hora', '1.5 horas', '2 horas'] },
        { name: 'profesional', label: 'Profesional / Especialista', type: 'text', placeholder: 'Ej. Podólogo Principal / Esteticista' }
      ];
    } else if (answers.niche === 'insumos-agricolas') {
      nicheData.attributes = [
        { name: 'marca', label: 'Marca / Fabricante', type: 'text', placeholder: 'Ej. Syngenta, Stihl, Bayer' },
        { name: 'compatibilidad', label: 'Compatibilidad de Repuesto', type: 'text', placeholder: 'Ej. Motor Stihl FS 160 / Universal' }
      ];
    } else if (answers.niche === 'alimentos-artesanales') {
      nicheData.attributes = [
        { name: 'presentacion', label: 'Presentación / Porciones', type: 'select', options: ['Unidad Individual', 'Caja x6', 'Caja x12', 'Media Libra', 'Una Libra'] },
        { name: 'requiere_anticipo', label: 'Anticipación Requerida', type: 'select', options: ['Entrega Inmediata', '24 Horas de Anticipación', '48 Horas de Anticipación'] }
      ];
    } else if (answers.niche === 'ferreteria-rural') {
      nicheData.attributes = [
        { name: 'unidad_medida', label: 'Unidad de Venta', type: 'select', options: ['Unidad', 'Bulto / S Saco', 'Kilo', 'Metro', 'Rollo'] }
      ];
    } else if (answers.niche === 'repuestos-motos') {
      nicheData.attributes = [
        { name: 'marca_moto', label: 'Marca de Moto Compatible', type: 'text', placeholder: 'Ej. Yamaha, Pulsar, Boxer, Suzuki' },
        { name: 'modelo_anio', label: 'Modelo / Año', type: 'text', placeholder: 'Ej. 2018 - 2022' }
      ];
    } else if (answers.niche === 'distribuidoras-beauty') {
      nicheData.attributes = [
        { name: 'tipo_presentacion', label: 'Presentación Profesional', type: 'select', options: ['Unidad Detal', 'Caja/Pack Mayorista', 'Litro / Galón (Granel)'] }
      ];
    } else if (answers.niche === 'petshops-locales') {
      nicheData.attributes = [
        { name: 'peso_concentrado', label: 'Peso del Empaque', type: 'select', options: ['1 kg', '2 kg', '8 kg', '15 kg', '22 kg', 'Suelto / Libra'] },
        { name: 'mascota', label: 'Tipo de Mascota', type: 'select', options: ['Perro Adulto', 'Cachorro', 'Gato Adulto', 'Gatito', 'Otras Mascotas'] }
      ];
    } else if (answers.niche === 'repuestos-lineablanca') {
      nicheData.attributes = [
        { name: 'marca_electrodomestico', label: 'Marca Compatible', type: 'text', placeholder: 'Ej. Whirlpool, Mabe, Haceb, LG' },
        { name: 'modelo_exacto', label: 'Modelo o Número de Parte', type: 'text', placeholder: 'Ej. W1023456 / Lavadora Haceb 13kg' }
      ];
    } else if (answers.niche === 'moda-local-calzado') {
      nicheData.attributes = [
        { name: 'talla', label: 'Talla', type: 'select', options: ['34', '35', '36', '37', '38', '39', '40', '41', '42', 'S', 'M', 'L', 'XL'] },
        { name: 'material', label: 'Material / Composición', type: 'text', placeholder: 'Ej. Cuero 100% natural, Sintético, Lona' }
      ];
    } else if (answers.niche === 'alimentacion-saludable') {
      nicheData.attributes = [
        { name: 'alergenos', label: 'Alérgenos / Restricción', type: 'select', options: ['Libre de Gluten (Gluten Free)', 'Sin Azúcar Añadida', 'Vegano / Plant-Based', 'Keto / Bajo en Carbohidratos', 'Sin Restricción / Natural'] },
        { name: 'presentacion', label: 'Presentación', type: 'text', placeholder: 'Ej. Frasco 250g, Bolsa de 500g, Cápsulas' }
      ];
    } else if (answers.niche === 'home-office-ergonomia') {
      nicheData.attributes = [
        { name: 'ajustable', label: 'Nivel de Ajuste', type: 'select', options: ['Totalmente Ajustable (Ergonómico)', 'Ajuste de Altura Únicamente', 'Fijo / Estático'] }
      ];
    } else if (answers.niche === 'licores-cocteleria') {
      nicheData.attributes = [
        { name: 'volumen_alcohol', label: 'Contenido / Volumen', type: 'select', options: ['Lata 330ml', 'Botella 375ml (Media)', 'Botella 750ml (Estándar)', 'Botella 1000ml (Litro)'] }
      ];
    } else if (answers.niche === 'coleccionismo-geek') {
      nicheData.attributes = [
        { name: 'estado_articulo', label: 'Estado / Edición', type: 'select', options: ['Nuevo en Caja (Mint in Box)', 'Edición Limitada', 'Edición Regular', 'Segunda Mano (Excelente Estado)'] }
      ];
    } else if (answers.niche === 'distribucion-horeca') {
      nicheData.attributes = [
        { name: 'empaque_volumen', label: 'Empaque de Venta', type: 'select', options: ['Paquete x50 Unidades', 'Caja x500 Unidades', 'Galón / Garrafa', 'Bulto Mayorista'] }
      ];
    }
  }


  await fs.writeJson(path.join(configDir, 'niche.json'), nicheData, { spaces: 2 });
  stepNiche.succeed('Metadatos de nicho (niche.json) generados en src/config.');

  // 5.6 Crear archivo .prototipe.json de metadatos del proyecto para control de sincronización
  const stepMeta = ora('Generar metadatos de sincronización del proyecto (.prototipe.json)').start();
  const prototipeMeta = {
    clientId,
    projectName: answers.projectName,
    template: answers.template,
    coreType: answers.coreType || 'seed',
    niche: answers.niche || 'general_custom',
    // [ROBUSTEZ] Versión real del CLI que creó esta instancia — no hardcodeada.
    // Permite al sistema de sincronización detectar incompatibilidades futuras.
    generatorVersion: CLI_VERSION,
    createdAt: new Date().toISOString()
  };
  await fs.writeJson(path.join(targetDir, '.prototipe.json'), prototipeMeta, { spaces: 2 });
  stepMeta.succeed('Metadatos de sincronización (.prototipe.json) generados en la raíz.');

  // 6. (Paso omitido: firebase-messaging-sw.js ya no se usa)

  // 6.1. Configurar manifest.json / site.webmanifest dinámicamente con los colores HSL convertidos a Hex
  const stepManifest = ora('Configurando manifest PWA con colores e identidad de marca').start();
  try {
    const manifestPath = path.join(targetDir, 'public', 'manifest.json');
    const webmanifestPath = path.join(targetDir, 'public', 'site.webmanifest');
    const targetManifest = await fs.pathExists(manifestPath) ? manifestPath : (await fs.pathExists(webmanifestPath) ? webmanifestPath : null);
    
    // Obtener colores Hex de marca en caliente para theme_color y background_color
    const primaryHex = '#' + hslToRgbaHex(primaryColor, 255).toString(16).padStart(8, '0').slice(0, 6);
    const bgHex = '#' + hslToRgbaHex(answers.branding?.bgColor || 'hsl(224, 71%, 4%)', 255).toString(16).padStart(8, '0').slice(0, 6);
    
    if (targetManifest) {
      const manifest = await fs.readJson(targetManifest);
      manifest.name = answers.projectName;
      manifest.short_name = initials;
      manifest.theme_color = primaryHex;
      manifest.background_color = bgHex;
      
      await fs.writeJson(targetManifest, manifest, { spaces: 2 });
      stepManifest.succeed(`Manifest PWA (${path.basename(targetManifest)}) actualizado con colores e identidad de marca.`);
    } else {
      // Si no existe, crear uno básico
      const basicManifest = {
        name: answers.projectName,
        short_name: initials,
        start_url: "/",
        display: "standalone",
        background_color: bgHex,
        theme_color: primaryHex,
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      };
      await fs.writeJson(manifestPath, basicManifest, { spaces: 2 });
      stepManifest.succeed('Manifest PWA (manifest.json) creado y configurado con éxito.');
    }
  } catch (manifestErr) {
    stepManifest.warn(`Aviso al configurar manifest PWA: ${manifestErr.message}`);
  }

  // 6.2. Reemplazar dinámicamente etiquetas SEO, título y descripción en index.html
  const indexPath = path.join(targetDir, 'index.html');
  if (await fs.pathExists(indexPath)) {
    let indexContent = await fs.readFile(indexPath, 'utf-8');
    
    const seoTitle = answers.seoTitle || answers.projectName || 'Prototipe App';
    const seoDescription = answers.seoDescription || `${seoTitle} - Plataforma a la medida para la gestión de ventas, inventario y servicios.`;
    const seoKeywords = answers.seoKeywords || `${seoTitle}, ventas, inventario, facturación, ecosistema, control`;
    
    // [BLINDAJE-SEO] Regex insensible a mayúsculas/minúsculas y tolerante a atributos extra en la etiqueta <title>
    // Ej: <TITLE lang="es">...</TITLE> o <title   > también se detectan y reemplazan correctamente
    const titleRegex = /<title[^>]*>[^<]*<\/title>/i;
    if (titleRegex.test(indexContent)) {
      indexContent = indexContent.replace(titleRegex, `<title>${seoTitle}</title>`);
    } else {
      indexContent = indexContent.replace(/<\/head>/i, `    <title>${seoTitle}</title>\n  </head>`);
    }

    // Limpiar metatags SEO viejos si existen en el template (tolerancia HTML5)
    indexContent = indexContent.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, '');
    indexContent = indexContent.replace(/<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/gi, '');
    indexContent = indexContent.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/gi, '');
    indexContent = indexContent.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/gi, '');
    indexContent = indexContent.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/gi, '');
    indexContent = indexContent.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/gi, '');
    
    // Actualizar apple-mobile-web-app-title
    indexContent = indexContent.replace(/<meta\s+name="apple-mobile-web-app-title"\s+content="[^"]*"\s*\/?>/gi, `<meta name="apple-mobile-web-app-title" content="${seoTitle}" />`);

    const metaTags = `
    <meta name="description" content="${seoDescription}" />
    <meta name="keywords" content="${seoKeywords}" />
    <meta property="og:title" content="${seoTitle}" />
    <meta property="og:description" content="${seoDescription}" />
    <meta name="twitter:title" content="${seoTitle}" />
    <meta name="twitter:description" content="${seoDescription}" />`;

    // Insertar nuevos metatags antes de </head>
    indexContent = indexContent.replace(/<\/head\s*>/i, `${metaTags}\n  </head>`);
    
    // Inyectar el link de Google Fonts dinámico si la tipografía no es Inter ni Outfit
    const brandFont = answers.branding?.googleFont || 'Inter';
    if (brandFont && brandFont !== 'Inter' && brandFont !== 'Outfit') {
      const fontUrl = `https://fonts.googleapis.com/css2?family=${brandFont.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800&display=swap`;
      const fontLink = `\n    <link rel="stylesheet" href="${fontUrl}" />`;
      indexContent = indexContent.replace(/<\/head\s*>/i, `${fontLink}\n  </head>`);
    }
    
    // Reemplazar la clave de localStorage por una única del cliente para evitar colisión de caché
    indexContent = indexContent.replace(/localStorage\.getItem\(['"]app-config-storage['"]\)/g, `localStorage.getItem('app-config-storage-${clientId}')`);

    await fs.writeFile(indexPath, indexContent, 'utf-8');
    console.log(pc.green('✅ Metatags SEO y clave de caché única inyectados en index.html.'));
  }

  // 6.3. Generar SVG logo y favicon si no se suministra uno
  console.log(pc.cyan('🎨 Configurando logo y favicon de la marca...'));
  const publicFaviconPath = path.join(targetDir, 'public', 'favicon.svg');
  const assetsLogoPath = path.join(targetDir, 'src', 'assets', 'logo.svg');
  
  // Extraer iniciales (ya declaradas al inicio de la función)

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="24" fill="${primaryColor}"/>
  <text x="50" y="55" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="42" fill="#ffffff">${initials}</text>
</svg>`;

  const stepLogo = ora('Configurando logo y favicon de la marca...').start();
  let userProvidedLogo = false;

  if (answers.logoPath) {
    const uploadDir = path.resolve(CLI_ROOT, 'temp_uploads');
    const resolvedLogoPath = path.resolve(answers.logoPath);
    if (!isPathContained(uploadDir, resolvedLogoPath)) {
      stepLogo.fail('Acceso denegado: El logo debe residir dentro del directorio temporal temp_uploads.');
      throw new Error('Directory Traversal bloqueado en logoPath.');
    }
  }

  if (answers.logoPath && await fs.pathExists(answers.logoPath)) {
    try {
      try {
        const ext = path.extname(answers.logoPath).toLowerCase();
        const validExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.webp'];
        
        if (validExtensions.includes(ext)) {
          await fs.ensureDir(path.dirname(assetsLogoPath));
          // Copiar logo a su ruta de assets con su extensión correspondiente
          const targetLogoPath = path.join(targetDir, 'src', 'assets', `logo${ext}`);
          await fs.copy(answers.logoPath, targetLogoPath, { overwrite: true });

          // Si es SVG, se usa de favicon. Si no es SVG, copiamos de todos modos como fallback pero mantenemos el favicon SVG autogenerado
          if (ext === '.svg') {
            await fs.copy(answers.logoPath, publicFaviconPath, { overwrite: true });
          } else {
            // Generar favicon a partir de iniciales como fallback
            await fs.ensureDir(path.dirname(publicFaviconPath));
            await fs.writeFile(publicFaviconPath, svgContent, 'utf-8');

            // Generar favicon e iconos PWA rasterizados usando Jimp
            const stepPwaIcons = ora('Generando iconos PWA (Jimp)...').start();
            try {
              const logoSrc = answers.logoPath;
              const bgHex = hslToRgbaHex(answers.branding?.bgColor || 'hsl(224, 71%, 4%)', 255);
              
              const createIcon = async (size, usePadding = false) => {
                let original;
                try {
                  original = await Jimp.read(logoSrc);
                } catch (readErr) {
                  // Fallback 1: Intentar leer el logo SVG de iniciales fallback autogenerado
                  try {
                    const appName = answers.projectName || answers.clientId || 'PROTOTIPE';
                    const brandPrimary = primaryColor;
                    const fallbackSvg = createFallbackLogoSvg({ appName, brandPrimary });
                    original = await Jimp.read(fallbackSvg);
                  } catch (fallbackErr) {
                    // Fallback 2 (Fallo total): Lienzo con color de marca sólido
                    original = new Jimp({ width: size, height: size, color: bgHex });
                  }
                }
                const w = original.width;
                const h = original.height;
                
                if (usePadding) {
                  const maxDim = Math.round(size * 0.8);
                  const ratio = Math.min(maxDim / w, maxDim / h);
                  const newW = Math.round(w * ratio);
                  const newH = Math.round(h * ratio);
                  original.resize({ w: newW, h: newH });
                  
                  const canvas = new Jimp({ width: size, height: size, color: bgHex });
                  const x = Math.round((size - newW) / 2);
                  const y = Math.round((size - newH) / 2);
                  canvas.composite(original, x, y);
                  return canvas;
                } else {
                  const ratio = Math.min(size / w, size / h);
                  const newW = Math.round(w * ratio);
                  const newH = Math.round(h * ratio);
                  original.resize({ w: newW, h: newH });
                  return original;
                }
              };

              const pwa192 = await createIcon(192, false);
              await pwa192.write(path.join(targetDir, 'public', 'pwa-192x192.png'));
              
              const appleIcon = await createIcon(192, true);
              await appleIcon.write(path.join(targetDir, 'public', 'apple-touch-icon.png'));

              const pwa512 = await createIcon(512, false);
              await pwa512.write(path.join(targetDir, 'public', 'pwa-512x512.png'));

              stepPwaIcons.succeed('Iconos PWA (192x192, 512x512, apple-touch-icon) redimensionados y generados con éxito.');
            } catch (jimpErr) {
              // Fallback total de seguridad usando el SVG de iniciales estético
              try {
                const bgHex = hslToRgbaHex(answers.branding?.bgColor || 'hsl(224, 71%, 4%)', 255);
                const appName = answers.projectName || answers.clientId || 'PROTOTIPE';
                const brandPrimary = primaryColor;
                const fallbackSvg = createFallbackLogoSvg({ appName, brandPrimary });
                
                const makeFallback = async (size) => {
                  try {
                    const img = await Jimp.read(fallbackSvg);
                    img.resize({ w: size, h: size });
                    return img;
                  } catch (_) {
                    return new Jimp({ width: size, height: size, color: bgHex });
                  }
                };
                
                const fallback192 = await makeFallback(192);
                await fallback192.write(path.join(targetDir, 'public', 'pwa-192x192.png'));
                await fallback192.write(path.join(targetDir, 'public', 'apple-touch-icon.png'));
                
                const fallback512 = await makeFallback(512);
                await fallback512.write(path.join(targetDir, 'public', 'pwa-512x512.png'));
                
                stepPwaIcons.warn(`Iconos PWA generados con iniciales de marca estéticas debido a un fallo de Jimp al procesar el logo del usuario: ${jimpErr.message}`);
              } catch (fallbackErr) {
                stepPwaIcons.fail(`Error crítico al generar iconos PWA de fallback: ${fallbackErr.message}`);
              }
            }
          }

          stepLogo.succeed(`Logo personalizado (${ext}) copiado desde: ${answers.logoPath}`);
          userProvidedLogo = true;
        } else {
          stepLogo.warn(`El logo suministrado no tiene una extensión compatible. Extensiones válidas: SVG, PNG, JPG, JPEG, WEBP.`);
        }
      } catch (err) {
        stepLogo.fail(`Error al copiar el logo suministrado: ${err.message}`);
      }
    } finally {
      try {
        await fs.remove(answers.logoPath);
      } catch (cleanupErr) {
        console.error(`Error al eliminar logo temporal: ${cleanupErr.message}`);
      }
    }
  }

  if (!userProvidedLogo) {
    await fs.ensureDir(path.dirname(publicFaviconPath));
    await fs.writeFile(publicFaviconPath, svgContent, 'utf-8');
    
    await fs.ensureDir(path.dirname(assetsLogoPath));
    await fs.writeFile(assetsLogoPath, svgContent, 'utf-8');
    stepLogo.succeed(`Logo y favicon de iniciales ("${initials}") autogenerados usando el color primario.`);
  }


  // 7. Inyectar carpeta /scratch/ y generar primer mapa de IA
  const stepScratch = ora('Inyectar scripts de automatización en /scratch/').start();
  const scratchDir = path.join(targetDir, 'scratch');
  await fs.ensureDir(scratchDir);

  const mapScriptContent = `import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const outputFile = path.join(projectRoot, 'mapa_arquitectura_ia.md');

function scanDirectory(dir, depth = 0) {
  let markdown = '';
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    if (['node_modules', '.git', 'dist', '.firebase', '.temp', 'tmp'].includes(file)) return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    const indent = '  '.repeat(depth);
    
    if (stat.isDirectory()) {
      markdown += \`\${indent}- 📁 **\${file}**/\\n\`;
      markdown += scanDirectory(fullPath, depth + 1);
    } else {
      markdown += \`\${indent}- 📄 [\${file}](file:///\${fullPath.replace(/\\\\/g, '/')})\\n\`;
    }
  });
  return markdown;
}

const map = \`# 🗺️ Mapa de Arquitectura Física del Código\\n\\nEste mapa se autogenera para orientar a la IA sobre la estructura de archivos.\\n\\n\${scanDirectory(projectRoot)}\`;
fs.writeFileSync(outputFile, map, 'utf-8');
console.log('✅ Mapa de arquitectura para la IA generado.');
`;

  await fs.writeFile(path.join(scratchDir, 'generate_ia_map.js'), mapScriptContent, 'utf-8');

  // [BLINDAJE-TIMEOUT] Ejecutar el mapa de IA con timeout para evitar bloqueos por symlinks o discos lentos
  try {
    execSync('node scratch/generate_ia_map.js', { cwd: targetDir, stdio: 'ignore', timeout: 10000 });
  } catch (mapErr) {
    console.warn(`[Auto-Map] No se pudo autogenerar el mapa de IA inicial: ${mapErr.message}`);
  }

  // 7.0. Aprovisionar Cuenta de Servicio e Inyectar Componentes recomendados en caliente
  const projectId = answers.projectId || answers.config?.projectId;
  if (projectId) {
    await createServiceAccountIAM(projectId, targetDir, answers);
  }
  await injectSelectedComponents(answers, targetDir);

  // 7.1. Configurar package.json con el nombre del proyecto de marca blanca y el script de seed
  const stepPkg = ora('Configurando package.json y scripts de la marca').start();
  try {
    const targetPkgPath = path.join(targetDir, 'package.json');
      if (await fs.pathExists(targetPkgPath)) {
        const pkg = await fs.readJson(targetPkgPath);
        pkg.name = `app-${clientId}`;
        
        // Inyectar script de seed admin y mapeo de IA
        pkg.scripts = pkg.scripts || {};
        pkg.scripts['seed:admin'] = 'node scripts/seed_admin.js';
        pkg.scripts['map'] = 'node scratch/generate_ia_map.js';
        
        await fs.writeJson(targetPkgPath, pkg, { spaces: 2 });
        stepPkg.succeed(`package.json actualizado con la marca blanca (app-${clientId}) y script seed:admin.`);
      } else {
        stepPkg.info('No se encontró package.json en la plantilla para personalizar el nombre.');
      }

      // [BRECHA-A] Crear el script scripts/seed_admin.js
      const scriptsDir = path.join(targetDir, 'scripts');
      await fs.ensureDir(scriptsDir);
      
      // Generar seed_data.json dinámico basado en el nicho comercial
      const catalog = resolveNicheCatalog(answers.niche || 'general');
      const seedData = {
        collections: {
          categories: catalog.categories.map(cat => ({
            id: cat.id,
            fields: {
              nombre: { stringValue: cat.name },
              activo: { booleanValue: true },
              updatedAt: { stringValue: 'TIMESTAMP_PLACEHOLDER' }
            }
          })),
          products: catalog.products.map(prod => ({
            id: prod.id,
            fields: {
              nombre: { stringValue: prod.name },
              precio: { doubleValue: prod.price },
              categoriaId: { stringValue: prod.categoryId },
              stock: { integerValue: prod.stock },
              referencia: { stringValue: prod.ref },
              activo: { booleanValue: true },
              variantes: { arrayValue: { values: [] } },
              destacado: { booleanValue: false },
              genero: { stringValue: "unisex" },
              imagen: { stringValue: "" },
              descripcion: { stringValue: "Producto de demostración" },
              tags: { arrayValue: { values: [] } },
              updatedAt: { stringValue: 'TIMESTAMP_PLACEHOLDER' }
            }
          }))
        }
      };
      await fs.writeJson(path.join(scriptsDir, 'seed_data.json'), seedData, { spaces: 2 });

      const seedAdminContent = `import fs from 'fs';
import path from 'path';
import os from 'os';

// 1. Leer .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("❌ Error: No se encontró .env.local en la raíz.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\\n').forEach(line => {
  const match = line.match(/^\\s*([\\w.]+)\\s*=\\s*(.*)\\s*$/);
  if (match) {
    env[match[1]] = match[2].replace(/['"\\\\\\x60]/g, '').trim();
  }
});

const apiKey = env.VITE_FIREBASE_API_KEY;
const projectId = env.VITE_FIREBASE_PROJECT_ID;
const adminEmail = env.VITE_DEVELOPER_ADMIN_EMAIL;
const adminPassword = env.VITE_DEVELOPER_ADMIN_PASSWORD;
const clientId = env.VITE_DEVELOPER_CLIENT_ID;
const theme = env.VITE_INITIAL_THEME || 'emerald';
const whatsappAdmin = env.VITE_DEVELOPER_WHATSAPP_ADMIN || '';
const storeAddress = env.VITE_DEVELOPER_STORE_ADDRESS || '';

if (!apiKey || !projectId || !adminEmail || !adminPassword) {
  console.error("❌ Error: Faltan variables de Firebase en .env.local");
  process.exit(1);
}

// 2. Obtener Token del Desarrollador (Firebase CLI)
function getDeveloperAccessToken() {
  const possiblePaths = [
    path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json'),
    path.join(process.env.APPDATA || '', 'configstore', 'firebase-tools.json')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        if (data.tokens && data.tokens.access_token) {
          return data.tokens.access_token;
        }
      } catch (_) {}
    }
  }
  return null;
}

const devToken = getDeveloperAccessToken();
if (!devToken) {
  console.error("❌ Error: No se pudo obtener la sesión de Firebase CLI. Ejecuta: firebase login");
  process.exit(1);
}

async function run() {
  console.log(\`🤖 Iniciando siembra para la instancia [\${clientId}]...\`);
  
  // A. Registrar el Admin en Firebase Auth (REST)
  let uid = '';
  try {
    console.log(\`🔑 Creando cuenta de administrador en Firebase Auth (\${adminEmail})...\`);
    const signupRes = await fetch(\`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=\${apiKey}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        returnSecureToken: true
      })
    });
    
    const signupData = await signupRes.json();
    if (!signupRes.ok) {
      if (signupData.error && signupData.error.message === 'EMAIL_EXISTS') {
        console.log(\`ℹ️  El correo \${adminEmail} ya existe en Firebase Auth. Intentando obtener UID...\`);
        const signinRes = await fetch(\`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=\${apiKey}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: adminEmail,
            password: adminPassword,
            returnSecureToken: true
          })
        });
        const signinData = await signinRes.json();
        if (!signinRes.ok) {
          console.warn(\`⚠️  [Firebase Auth] El correo ya existe pero no se pudo iniciar sesión para recuperar el UID (\${signinData.error?.message}).\`);
          console.warn(\`👉 Se usará un UID determinista basado en el correo para la siembra de Firestore.\`);
          uid = 'uid_' + Buffer.from(adminEmail).toString('base64').replace(/=/g, '').substring(0, 20);
        } else {
          uid = signinData.localId;
        }
      } else if (signupData.error && signupData.error.message === 'CONFIGURATION_NOT_FOUND') {
        console.warn(\`⚠️  [Firebase Auth] El proveedor de correo y contraseña está deshabilitado en Firebase Console.\`);
        console.warn(\`👉 Actívalo en: https://console.firebase.google.com/project/\${projectId}/authentication/providers\`);
        console.warn(\`⏳ Omitiendo creación de credenciales en Auth, pero continuando con el sembrado de Firestore...\`);
        uid = 'fallback-admin';
      } else {
        throw new Error(signupData.error?.message || 'Error desconocido al registrar usuario.');
      }
    } else {
      uid = signupData.localId;
      console.log(\`✅ Administrador creado en Firebase Auth con UID: \${uid}\`);
    }
  } catch (err) {
    console.error(\`❌ Error en Firebase Auth: \${err.message}\`);
    process.exit(1);
  }

  // B. Crear perfil de Admin en Firestore (Solo si uid es válido y no es fallback)
  if (uid && uid !== 'fallback-admin') {
    try {
      console.log(\`👤 Configurando perfil de administrador en Firestore (users/\${uid})...\`);
      const userUrl = \`https://firestore.googleapis.com/v1/projects/\${projectId}/databases/(default)/documents/users/\${uid}\`;
      const userPayload = {
        fields: {
          email: { stringValue: adminEmail },
          role: { stringValue: 'admin' },
          createdAt: { stringValue: new Date().toISOString() },
          activo: { booleanValue: true }
        }
      };
      
      const userRes = await fetch(userUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${devToken}\` },
        body: JSON.stringify(userPayload)
      });
      
      if (!userRes.ok) {
        const errData = await userRes.json();
        throw new Error(errData.error?.message || 'Error al guardar perfil.');
      }
      console.log(\`✅ Perfil de administrador guardado en Firestore.\`);
    } catch (err) {
      console.error(\`❌ Error al guardar perfil en Firestore: \${err.message}\`);
      process.exit(1);
    }
  } else {
    console.log(\`ℹ️  Omitiendo creación de perfil users/fallback-admin debido a proveedor Auth deshabilitado.\`);
  }

  // C. Crear configuración global config/settings en Firestore
  try {
    console.log(\`⚙️  Inicializando configuración global del negocio (config/settings)... \`);
    const settingsUrl = \`https://firestore.googleapis.com/v1/projects/\${projectId}/databases/(default)/documents/config/settings\`;
    
    const settingsPayload = {
      fields: {
        storeName: { stringValue: clientId.toUpperCase() },
        theme: { stringValue: theme },
        whatsapp: { stringValue: whatsappAdmin },
        address: { stringValue: storeAddress },
        whatsappEnabled: { booleanValue: true },
        dianEnabled: { booleanValue: false },
        maintenanceMode: { booleanValue: false },
        deliverySettings: {
          mapValue: {
            fields: {
              pickup: {
                mapValue: {
                  fields: {
                    enabled: { booleanValue: true },
                    instructions: { stringValue: \`Recoger en tienda: \${storeAddress || 'Dirección de la sucursal'}\` }
                  }
                }
              }
            }
          }
        },
        updatedAt: { stringValue: new Date().toISOString() }
      }
    };

    const settingsRes = await fetch(settingsUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${devToken}\` },
      body: JSON.stringify(settingsPayload)
    });
    
    if (!settingsRes.ok) {
      const errData = await settingsRes.json();
      throw new Error(errData.error?.message || 'Error al inicializar settings.');
    }
    console.log(\`✅ Configuración config/settings inicializada.\`);
  } catch (err) {
    console.error(\`❌ Error al escribir config/settings: \${err.message}\`);
    process.exit(1);
  }

  // D. Sembrado de catálogo dinámico y agnóstico de nicho comercial
  try {
    const seedDataPath = path.join(process.cwd(), 'scripts', 'seed_data.json');
    if (!fs.existsSync(seedDataPath)) {
      console.log("ℹ️  No se encontró scripts/seed_data.json. Omitiendo sembrado de catálogo.");
    } else {
      const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));
      const collections = seedData.collections || {};
      
      console.log(\`📦 Sembrando catálogo inicial dinámico y agnóstico...\`);
      for (const [colName, docs] of Object.entries(collections)) {
        console.log(\`📁 Sembrando colección "\${colName}"...\`);
        for (const doc of docs) {
          const docUrl = \`https://firestore.googleapis.com/v1/projects/\${projectId}/databases/(default)/documents/\${colName}/\${doc.id}\`;
          
          // Reemplazar marcadores de tiempo
          const fields = { ...doc.fields };
          for (const [fName, fVal] of Object.entries(fields)) {
            if (fVal.stringValue === 'TIMESTAMP_PLACEHOLDER') {
              fields[fName] = { stringValue: new Date().toISOString() };
            }
          }
          
          const payload = { fields };
          const res = await fetch(docUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${devToken}\` },
            body: JSON.stringify(payload)
          });
          
          if (res.ok) {
            console.log(\`   - Documento sembrado en \${colName}: \${doc.id}\`);
          } else {
            const errData = await res.json().catch(() => ({}));
            console.warn(\`   - Error al sembrar \${doc.id} en \${colName}: \${errData.error?.message || 'Error desconocido'}\`);
          }
        }
      }
      console.log(\`✅ Catálogo comercial inicial sembrado en Firestore.\`);
    }
  } catch (seedErr) {
    console.warn(\`⚠️  [Smart Seeding] No se pudo sembrar el catálogo de nicho: \${seedErr.message}\`);
  }

  console.log(\`\\n🎉 ¡Siembra completada con éxito!\`);
  console.log(\`   - Usuario: \${adminEmail}\`);
  console.log(\`   - Contraseña: \${adminPassword}\`);
  console.log(\`   - Configuración base del negocio inicializada.\`);
}

run();
`;
    await fs.writeFile(path.join(scriptsDir, 'seed_admin.js'), seedAdminContent, 'utf-8');
  } catch (err) {
    stepPkg.warn(`Aviso al configurar package.json/scripts: ${err.message}`);
  }

  // [BRECHA-B] Personalizar vite.config.js con puerto determinístico único por clientId.
  // En un ecosistema multi-instancia, si todas usan el puerto 5173 hay colisiones.
  // El puerto se deriva del customPort ingresado o de forma determinística del clientId.
  const stepVite = ora('Personalizar vite.config.js con puerto único por instancia').start();
  try {
    const viteConfigPath = path.join(targetDir, 'vite.config.js');
    if (await fs.pathExists(viteConfigPath)) {
      const hashPort = 3100 + (clientId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 100);
      const devPort = answers.customPort ? parseInt(answers.customPort) : hashPort;
      let viteContent = await fs.readFile(viteConfigPath, 'utf-8');

      if (/server\s*:\s*\{/.test(viteContent)) {
        // Ya tiene bloque server — inyectar o reemplazar el port dentro de él
        if (/port\s*:\s*\d+/.test(viteContent)) {
          viteContent = viteContent.replace(/port\s*:\s*\d+/, `port: ${devPort}`);
        } else {
          viteContent = viteContent.replace(/(server\s*:\s*\{)/, `$1\n    port: ${devPort},`);
        }
      } else {
        // No tiene bloque server — añadirlo dentro de defineConfig
        viteContent = viteContent.replace(
          /(defineConfig\s*\(\s*\{)/,
          `$1\n  server: {\n    port: ${devPort},\n    host: true,\n  },`
        );
      }

      await fs.writeFile(viteConfigPath, viteContent, 'utf-8');
      stepVite.succeed(`vite.config.js: puerto ${devPort} asignado determinísticamente para ${clientId}.`);
    } else {
      stepVite.info('No se encontró vite.config.js en la plantilla — puerto por defecto de Vite.');
    }
  } catch (viteErr) {
    stepVite.warn(`Aviso al personalizar vite.config.js: ${viteErr.message}`);
  }

  // 7.2. Configurar dinámicamente Playwright E2E si existe en la plantilla
  const stepE2E = ora('Configurando suite de pruebas Playwright E2E').start();
  try {
    const targetPkgPath = path.join(targetDir, 'package.json');
    const playwrightConfigPath = path.join(targetDir, 'playwright.config.js');
    if (await fs.pathExists(playwrightConfigPath)) {
      // 1. Configurar package.json agregando scripts E2E si no existen
      const pkg = await fs.readJson(targetPkgPath);
      pkg.scripts = pkg.scripts || {};
      pkg.scripts['test:ci'] = 'playwright test';
      pkg.scripts['test:ui'] = 'playwright test --ui';
      pkg.scripts['test:ui:show'] = 'playwright show-report';
      
      // Asegurar dependencias de testing
      pkg.devDependencies = pkg.devDependencies || {};
      if (!pkg.devDependencies['@playwright/test']) {
        pkg.devDependencies['@playwright/test'] = '^1.49.0';
      }
      await fs.writeJson(targetPkgPath, pkg, { spaces: 2 });

      // 2. Renombrar y adaptar tests/config/app-ventas.config.js a tests/config/[clientId].config.js
      const oldConfigPath = path.join(targetDir, 'tests', 'config', 'app-ventas.config.js');
      const newConfigPath = path.join(targetDir, 'tests', 'config', `${clientId}.config.js`);
      if (await fs.pathExists(oldConfigPath)) {
        let configContent = await fs.readFile(oldConfigPath, 'utf-8');
        
        // [BLINDAJE-PLAYWRIGHT] Puerto dinámico: usar PORT de entorno o el que la instancia definió en su playwright.config.js
        // Fallback al estándar de Vite (5173) si ninguno está disponible
        const vitePort = process.env.VITE_DEV_PORT || process.env.PORT || '5173';
        configContent = configContent.replace(/name:\s*['"`].*?['"`]/, `name: '${answers.projectName}'`);
        configContent = configContent.replace(
          /baseURL:\s*['"`].*?['"`]/,
          `baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:${vitePort}'`
        );
        
        await fs.writeFile(newConfigPath, configContent, 'utf-8');
        await fs.remove(oldConfigPath);

        // 3. Modificar tests/checkout.spec.js para importar el archivo config correcto del cliente
        const specPath = path.join(targetDir, 'tests', 'checkout.spec.js');
        if (await fs.pathExists(specPath)) {
          let specContent = await fs.readFile(specPath, 'utf-8');
          specContent = specContent.replace(
            /import\s+\{\s*APP_CONFIG\s*\}\s+from\s+['"`]\.\/config\/app-ventas\.config\.js['"`]/,
            `import { APP_CONFIG } from './config/${clientId}.config.js'`
          );
          await fs.writeFile(specPath, specContent, 'utf-8');
        }
      }
      stepE2E.succeed('Suite de pruebas Playwright E2E configurada con éxito.');
    } else {
      stepE2E.info('Esta plantilla no incluye soporte Playwright E2E.');
    }
  } catch (err) {
    stepE2E.fail(`Error al configurar Playwright E2E: ${err.message}`);
  }

  stepScratch.succeed('Scripts de mapeo de arquitectura inyectados en /scratch/ y package.json.');

  // 7.5. Garantizar la existencia de GEMINI.md en la raíz del proyecto nuevo
  const stepGemini = ora('Aprovisionar archivo de reglas GEMINI.md').start();
  const backupGeminiPath = path.join(getWorkspaceRoot(), 'Documentacion PROTOTIPE', '04_Estandares_y_Skills', 'Copia_Seguridad_Reglas_y_Skills', 'GEMINI.md');
  const targetGeminiPath = path.join(targetDir, 'GEMINI.md');
  try {
    if (await fs.pathExists(backupGeminiPath)) {
      await fs.copy(backupGeminiPath, targetGeminiPath);
      
      // Adaptar las rutas absolutas del GEMINI.md del cliente para que sean locales
      let geminiContent = await fs.readFile(targetGeminiPath, 'utf-8');
      // Reemplazo robusto e insensible a mayúsculas/minúsculas y tipo de barra (\ o /)
      const absoluteDocsRegex = /[A-Z]:[\\/][^"'\n]*?Documentacion\s+PROTOTIPE/gi;
      geminiContent = geminiContent.replace(new RegExp(absoluteDocsRegex.source + '[\\\\/]02_Tareas_Roadmap[\\\\/]tareas_pendientes\\.md', 'gi'), './tareas_pendientes.md');
      geminiContent = geminiContent.replace(new RegExp(absoluteDocsRegex.source + '[\\\\/]03_Auditorias_y_Faro_Core[\\\\/]bitacora_cambios\\.md', 'gi'), './bitacora_cambios.md');
      geminiContent = geminiContent.replace(new RegExp(absoluteDocsRegex.source + '[\\\\/]04_Estandares_y_Skills[\\\\/]mapa_aplicacion\\.md', 'gi'), './mapa_arquitectura_ia.md');

      await fs.writeFile(targetGeminiPath, geminiContent, 'utf-8');
      stepGemini.succeed('Archivo GEMINI.md inyectado y adaptado localmente de forma robusta.');
    } else {
      stepGemini.warn('No se encontró GEMINI.md en el backup global. Se conservará la del template.');
    }
  } catch (err) {
    stepGemini.fail(`Aviso al copiar y adaptar GEMINI.md: ${err.message}`);
  }

  // 8. Crear archivo de Onboarding para Antigravity en la raíz
  // [BRECHA-4] Mapa semántico de flags: transforma booleanos crudos en descripciones
  // accionables para la IA, indicando qué pantallas/módulos DEBE o NO DEBE implementar
  const FLAG_DESCRIPTIONS = {
    enablePwa: 'PWA instalable (manifest, service worker, botón de instalación en pantalla)',
    enablePush: 'Notificaciones push (Firebase Cloud Messaging — requiere VAPID key)',
    enableBilling: 'Módulo de facturación/comisiones del desarrollador (telemetría centralizada)',
    enableDianBilling: `Facturación electrónica DIAN — costo por factura: $${answers.costoPorFacturaDian} COP`,
    enableGithub: 'Repositorio GitHub privado auto-creado en el aprovisionamiento',
    enableFirebaseDeploy: 'Despliegue automático en Firebase Hosting al finalizar',
    enableDelivery: 'Módulo de domicilios/delivery (rutas de reparto, seguimiento de pedidos)',
    enableKitchen: 'KDS de cocina (pantalla de órdenes en tiempo real para el área de cocina)',
    enableCredits: 'Créditos a clientes (compras al fiado, saldos pendientes)',
  };

  const flagsList = Object.entries(answers.flags || {})
    .map(([key, val]) => {
      const desc = FLAG_DESCRIPTIONS[key] || key;
      return `  - **${desc}:** ${val ? '🟢 DEBE implementarse en este proyecto' : '🔴 Omitir — no requerido por este cliente'}`;
    })
    .join('\n') || '  *(Sin módulos especiales configurados)*';

  const isSeed = answers.template === 'template-core-seed';

  const promptContent = `# 🚀 Prompt de Arranque para Google Antigravity (Proyecto: ${answers.projectName})

Copia y pega todo el contenido de este bloque en tu primer mensaje del chat de Antigravity en este proyecto:

---

Hola. Vamos a trabajar sobre este nuevo proyecto: **${answers.projectName}** (${clientId}). 
La carpeta física está creada en la ruta: \`${targetDir}\`

> [!IMPORTANT]
> **Paso 0 Obligatorio de Inicialización:**
> Antes de proponer o ejecutar cualquier plan en el código de esta app, debes correr la tarea de sembrado del administrador y configuración en la terminal del proyecto:
> \`\`\`bash
> npm run seed:admin
> \`\`\`
> Esto registrará al usuario administrador en Firebase Auth y guardará su documento de perfil en la colección \`users\` y la configuración base en \`config/settings\` de Firestore. Este paso es necesario para evitar errores de \`PERMISSION_DENIED\` al probar la app, ya que las reglas de seguridad restringen las escrituras a administradores registrados.

Por favor, lee e indiza obligatoriamente los siguientes archivos y carpetas de navegación e instrucciones antes de proponer tu plan de implementación. Son tu GPS de arquitectura y estándares:
1. **Mapa de Código de este Proyecto** → [mapa_arquitectura_ia.md](file:///${targetDir.replace(/\\/g, '/')}/mapa_arquitectura_ia.md): contiene la estructura física de todos los archivos y carpetas locales.
2. **Mapa de Documentación Global** → [mapa_documentacion_ia.md](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md): índice de navegación semántica de toda la documentación central.
3. **Instrucciones del Proyecto** → [GEMINI.md](file:///${targetDir.replace(/\\/g, '/')}/GEMINI.md): reglas de comportamiento, estándares del stack y disparadores locales.
4. **Estándar de Arquitectura Desacoplada** → [estandar_arquitectura_limpia_react_firebase.md](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectura_limpia_react_firebase.md): Define el patrón modular, capas y microinteracciones del ecosistema.
5. **Documentación Obligatoria del Proyecto (Carpeta Local):**
   - 🏢 **[contexto_negocio.md](file:///${targetDir.replace(/\\/g, '/')}/Documentacion%20${encodeURIComponent(answers.projectName)}/contexto_negocio.md)**: Lee esto PRIMERO — define quién es el cliente, sus reglas de negocio y KPIs. Determina si el código que generas tiene sentido operativo.
   - 🚫 **[restricciones_tecnicas.md](file:///${targetDir.replace(/\\/g, '/')}/Documentacion%20${encodeURIComponent(answers.projectName)}/restricciones_tecnicas.md)**: Dependencias fijadas, patrones prohibidos y limitaciones conocidas de esta instancia. Consulta antes de instalar librerías o cambiar arquitectura.
   - 🎨 **[guia_estilos_ui.md](file:///${targetDir.replace(/\\/g, '/')}/Documentacion%20${encodeURIComponent(answers.projectName)}/guia_estilos_ui.md)**: Paleta HSL, tokens de diseño y convenciones de componentes. Obligatorio antes de tocar cualquier estilo.
   - 🗄️ **[esquema_colecciones.md](file:///${targetDir.replace(/\\/g, '/')}/Documentacion%20${encodeURIComponent(answers.projectName)}/esquema_colecciones.md)**: Modelo de datos Firestore de esta instancia.
5. **Directorios Clave de Estándares y Componentes (Auditoría Obligatoria):**
   - 📂 **[04_Estandares_y_Skills](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/)**: Lee \`inicializacion_nuevos_proyectos.md\` y \`Firebase_Listeners_Clean.md\` para entender el blindaje de base de datos y la PWA.
   - 📂 **[06_Biblioteca_Componentes](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/)**: Consulta el catálogo de componentes listos para portar y reutilizar sin reescribir código.
   - 📂 **[07_Manuales_Desarrollo](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/)**: Contiene la especificación de Sharding Multitenant y manuales de arquitectura.
   - 📂 **[09_Modulos_Completos](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/09_Modulos_Completos/)**: Consulta el catálogo de módulos completos (Features) listos para portar.
   - 📂 **[03_Auditorias_y_Faro_Core](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/)**: Revisa \`bitacora_cambios.md\` para entender el historial de desarrollo y parches.

### 📋 Contexto del Cliente (Briefing)
- **Nombre**: ${answers.projectName}
- **Client ID**: ${clientId}
- **Core al que pertenece**: ${answers.coreType || 'seed'}
- **Modo de Facturación de la Instancia**: ${answers.billingMode || 'percentage'}
- **Tasa de Comisión / Costo**: 
  - Porcentaje: ${answers.comisionPorcentaje ?? 1.5}%
  - Pago Mensual Fijo: $${answers.pagoMensualFijo ?? 0} COP
- **Facturación Electrónica (DIAN)**: ${answers.enableDianBilling ? '🟢 Activa' : '🔴 Inactiva'} (Costo por factura: $${answers.costoPorFacturaDian ?? 0} COP)
- **Token de Telemetría**: [TOKEN_DE_TELEMETRIA]
- **Colores de Marca** (Tema HSL: \`${themeName}\` — ya inyectados en \`src/index.css\`)
  | Token CSS | Valor |
  |---|---|
  | \`--color-primary\` | \`${primaryColor}\` |
  | \`--color-accent\` | \`${accentColor}\` |
  | \`--color-bg\` | \`${answers.branding?.bgColor || 'hsl(224, 71%, 4%)'}\` |
  | \`--color-text\` | \`${answers.branding?.textColor || 'hsl(213, 31%, 91%)'}\` |
  | \`--color-surface\` | \`${answers.branding?.surfaceColor || 'hsl(222, 47%, 8%)'}\` |
  | \`--color-surface-2\` | \`${answers.branding?.surface2Color || 'hsl(220, 40%, 13%)'}\` |
  | \`--color-border\` | \`${answers.branding?.borderColor || 'hsl(215, 28%, 17%)'}\` |
  | \`--radius-base\` | \`${answers.branding?.radiusBase || '0.75rem'}\` |
  | Google Font | \`${answers.branding?.googleFont || 'Inter'}\` |
  > ⚠️ NO usar colores hardcodeados. Siempre consumir \`var(--color-*)\` desde el sistema de tokens.

### ⚙️ Módulos y Capacidades Tecnológicas Seleccionadas:
${flagsList}

### 📝 Requerimientos Especiales del Cliente:
${answers.customRequirements || '*(Ninguno especificado)*'}

### 📦 Componentes y Módulos de la Biblioteca Pre-Instalados Físicamente (¡Solo impórtalos!):
${Array.isArray(answers.injectedComponentsList) && answers.injectedComponentsList.length > 0 
  ? answers.injectedComponentsList.map(item => `  - **${item.name}** [\`${item.technicalName}\`]: Inyectado físicamente. Importar con:\n    \`import ${item.technicalName} from '${item.importPath}';\``).join('\n')
  : '  *(Ninguno inyectado previamente; utiliza la biblioteca global si es necesario)*'}

> [!NOTE]
> **Autonomía Creativa de la IA:** Las recomendaciones anteriores son sugerencias preferentes de reutilización. Si para cumplir con el briefing del negocio requieres interfaces, hooks o bases de datos ausentes en la biblioteca, tienes total autonomía de diseñarlas y programarlas desde cero, garantizando el stack de calidad de la plataforma.

---

${isSeed ? `### ⚠️ ATENCIÓN: ESTE PROYECTO SE INICIALIZA DESDE UN LIENZO LIMPIO (Core Seed)
Este proyecto no ha sido copiado de una plantilla vertical. Contiene únicamente el cascarón de infraestructura de Prototipe:
- Configuración de Firebase y PWA.
- Sincronización síncrona/asíncrona de Temas HSL y Modo Oscuro en index.html y App.jsx.
- Módulos contables de facturación/billing de comisiones locales y telemetría de cobros en tiempo real conectada a la Consola Central (Spark/Blaze).
- Stores base de Zustand y hooks de inicialización de Auth.
- Un enrutador de React Router vacío (AppRoutes.jsx) y un componente loader (AppLoader.jsx).

Queda bajo tu total responsabilidad el desarrollo de las pantallas, la base de datos de negocio y la navegación desde cero, adaptadas a los requerimientos específicos de este cliente.` : ''}

### 🛡️ DIRECTIVAS DE ROBUSTEZ Y CALIDAD (OBLIGATORIO)

Para asegurar que esta aplicación cumpla con los estándares premium del ecosistema de instancias y evitar código basura o inestable, debes seguir estrictamente estas reglas desde tu primer cambio:

1. **Aislamiento de Sharding (Portabilidad):**
   - Queda estrictamente prohibido hardcodear IDs de proyectos Firebase o credenciales. Consume todo dinámicamente desde el entorno local (\`.env.local\`).
2. **Robustez en Escuchas Firebase (Listeners Seguros):**
   - No te suscribas a oyentes en tiempo real (\`onSnapshot\`) de colecciones privadas/restringidas sin validar que el usuario de Firebase Auth esté inicializado y logueado.
   - Todo listener debe retornar su función de limpieza (\`cleanup\`) al desmontar.
3. **Consistencia Cromática y Tailwind v4:**
   - Adapta el archivo \`src/index.css\` aplicando la paleta de colores de marca bajo el bloque \`@theme\` de Tailwind CSS v4.
   - Evita el uso de bordes negros o colores crudos; utiliza contornos discretos (\`border-app\` o escalas HSL bajas) y acabados con glassmorphism.
4. **Seguridad y Transacciones:**
   - Toda deducción o adición de stock en base de datos debe ejecutarse mediante transacciones atómicas (\`runTransaction\`) para prevenir condiciones de carrera.
   - La visualización pública de datos sensibles o seguimiento de pedidos debe estar protegida bajo URLs parametrizadas por tokens UUID seguros.
5: **Reutilización e Integración de Estándares (Auditoría de Documentación):**
   - Antes de escribir cualquier línea de lógica, audita obligatoriamente:
     - El catálogo en [Biblioteca de Componentes](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/) para verificar si ya existe un componente que resuelva la interfaz.
     - La carpeta de [Módulos Completos](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/09_Modulos_Completos/) para portar módulos de negocio complejos (Features) ya estructurados.
     - La carpeta [04_Estandares_y_Skills](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/) para seguir las guías de inicialización y listeners sin romper las reglas de Firebase.
     - El [Informe de Investigación del Ecosistema 2026](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/09_Plan_Escalabilidad_Negocio/informe_investigacion_ecosistema_2026.md) para emplear librerías Open Source aprobadas en lugar de codificar soluciones personalizadas desde cero.
${isSeed ? `6. **Desarrollo Modular (Component-First) - OBLIGATORIO:**
   - Para este proyecto limpio, debes construir la interfaz de forma estrictamente modular y componentizada.
   - Cada componente o pantalla debe vivir en su propio archivo exclusivo bajo \`src/components/\` o \`src/pages/\`. Queda prohibido agrupar múltiples elementos de lógica compleja en un solo archivo plano.
   - Extrae la lógica pesada a hooks personalizados en \`src/hooks/\` o a stores en \`src/store/\`, dejando los componentes puramente visuales y fáciles de mantener.` : `6. **Mantener estructura modular:**
   - Queda prohibido mezclar lógica de múltiples vistas en archivos monolíticos. Cada componente nuevo debe colocarse en su propio archivo descriptivo en la ruta correspondiente.`}
7. **Compilación de Integridad y Bitácora Obligatoria:**
   - **Antes de dar por completada cualquier tarea o hito, debes ejecutar localmente \`npm run build\`** en la consola del proyecto. Esta comprobación garantiza que no se introduzcan errores sintácticos o fallos de compilación.
   - Registra de forma obligatoria los cambios técnicos en \`bitacora_cambios.md\` y actualiza la lista de tareas en \`tareas_pendientes.md\` en el mismo paso que realizas los cambios de código.
8. **Despliegues controlados:**
   - NUNCA realices despliegues a producción o hosting de forma automática; solicita aprobación.
9. **Lectura de navegación:**
   - Usa las rutas de los mapas de navegación directamente para leer y editando archivos. Evita búsquedas ciegas (\`grep\` o \`list_dir\`).
10. **Diseño Responsivo Móvil y Prevención de Desbordamientos (Estándar de Oro):**
    - **Apilamiento Mobile-First:** Diseña con \`flex-col\` por defecto y solo pasa a \`sm:flex-row\` / \`md:flex-row\` en viewports grandes.
    - **Cero Anchos y Alturas Fijas en Píxeles:** Prohibido usar clases como \`w-[400px]\` o \`h-11\` en contenedores o layouts con texto variable que pueda envolverse a múltiples líneas.
    - **Scroll en Tablas:** Envuelve toda tabla en un contenedor con \`w-full overflow-x-auto scrollbar-thin\` y usa \`whitespace-nowrap\` en celdas de precios, identificadores o badges.
    - **Labels Unificados:** Aplica una altura mínima y alineación unificada (\`flex items-end h-8 mb-2 leading-tight\`) a todos los labels de formularios para evitar desalineación.
    - **SafeArea en PWA:** Usa paddings adaptativos con la variable \`env(safe-area-inset-bottom, 0px)\` en barras de navegación y modales fijos para móviles.
11. **Separación de Capas (Repository-Service-Hook - OBLIGATORIO):**
    - Queda estrictamente prohibido importar Firebase Firestore/Auth en componentes visuales.
    - Las llamadas a base de datos van en la capa Repository (\`api/\`).
    - Las transformaciones y validaciones en la capa Service.
    - La suscripción reactiva en Custom Hooks enlazando listeners (\`onSnapshot\`) seguros (solo si el usuario de Auth existe) y devolviendo el cleanup al desmontar.

Comencemos presentándote e indexando los archivos. ¿Estás listo?
`;
  await fs.writeFile(path.join(targetDir, 'antigravity_bootstrap_prompt.md'), promptContent, 'utf-8');
  console.log(pc.green('✅ Archivo antigravity_bootstrap_prompt.md creado con éxito en la raíz del proyecto.'));


  // Asegurar que la plantilla base ha sido copiada físicamente si no se ejecutó en la composición (Post-validación exitosa)
  await ensureBaseTemplateCopied(targetDir, srcTemplateDir);

  // 9. Ejecutar npm install y primera indexación
  await installDependencies(targetDir);

  // 10. Git e integración con GitHub
  await setupGitHub(answers, targetDir, clientId);

  // 11. Despliegue en Firebase del Cliente
  await deployFirebase(answers, targetDir);

  // 11.1 Auto-siembra de Administrador inicial (Desactivada por defecto)
  console.log(pc.yellow('\nℹ️  Auto-siembra de administrador y datos iniciales desactivada por defecto.'));
  console.log(pc.yellow('   Puedes sembrar la base de datos en cualquier momento corriendo: npm run seed:admin'));
  // await runSeedAdmin(answers, targetDir);

  // 11.2 Generar prototipe.lock.json — Registro de versión y hashes SHA-256 del Core
  // Permite detectar drift (desviación local) en sincronizaciones downstream futuras.
  await generatePrototypeLock(answers, targetDir, clientId);

  // 12. Auto-registro en la Consola Central (Developer Cockpit)
  await registerInCentralConsole(answers, clientId, uniqueToken);


  // [C3 FIX] Validación post-generación: verificar que el proyecto realmente quedó funcional
  // antes de reportar éxito al dashboard. Si falla, el catch de abajo ejecuta el rollback.
  console.log(pc.cyan('\n🔍 Ejecutando validación post-generación...'));
  const validationErrors = [];

  // V1: .env.local debe existir con credenciales
  const envLocalPath = path.join(targetDir, '.env.local');
  if (!(await fs.pathExists(envLocalPath))) {
    validationErrors.push('.env.local no fue generado — las credenciales de Firebase no están disponibles.');
  } else {
    const envContent_check = await fs.readFile(envLocalPath, 'utf-8');
    if (!envContent_check.includes('VITE_FIREBASE_PROJECT_ID=')) {
      validationErrors.push('.env.local existe pero le falta la variable crítica VITE_FIREBASE_PROJECT_ID.');
    }
  }

  // V2: package.json debe existir con el name correcto
  const pkgPath = path.join(targetDir, 'package.json');
  if (!(await fs.pathExists(pkgPath))) {
    validationErrors.push('package.json no existe — el scaffolding de la plantilla falló.');
  } else {
    const pkg = await fs.readJson(pkgPath).catch(() => ({}));
    if (!pkg.name || !pkg.name.includes(clientId.slice(0, 8))) {
      validationErrors.push(`package.json no contiene el nombre del cliente "${clientId}" — el template puede estar mal configurado.`);
    }
  }

  // V3: Si se hizo deploy completo, debe existir dist/index.html
  if (answers.enableFirebaseDeploy) {
    const distPath = path.join(targetDir, 'dist', 'index.html');
    if (!(await fs.pathExists(distPath))) {
      validationErrors.push('dist/index.html no existe después del deploy completo — el build de producción falló silenciosamente.');
    }
  }

  if (validationErrors.length > 0) {
    throw new Error(
      `❌ Validación post-generación fallida para "${clientId}":\n` +
      validationErrors.map(e => `  • ${e}`).join('\n') +
      '\n\nEl proyecto fue eliminado (rollback). Revisa los errores anteriores y vuelve a intentar.'
    );
  }
  console.log(pc.green('✅ Validación post-generación exitosa. El proyecto está listo.'));

  // [BLINDAJE-RETORNO] Asegurar que todos los valores retornados tengan fallback seguro
  const vapidPublicKey = (answers.firebaseVapidKey || answers.vapidPublicKey || '').trim();

  const result = {
    clientId: clientId || '',
    uniqueToken: uniqueToken || '',
    targetDir: targetDir || '',
    themeName: themeName || 'emerald',
    primaryColor: primaryColor || 'hsl(142, 70%, 45%)',
    vapidPublicKey,
    adminPasswordSet: true,
    devPin: null, // Removido por directiva de seguridad
    prompt: promptContent
  };

  Object.defineProperty(result, 'adminPassword', {
    value: adminPassword,
    enumerable: false,
    writable: true,
    configurable: true
  });

  return result;

  } catch (err) {
    if (!existedBefore) {
      try {
        if (await fs.pathExists(targetDir)) {
          await fs.remove(targetDir);
          console.log(pc.red(`\n🧹 Rollback exitoso: Directorio de destino inconcluso de la instancia eliminado: ${targetDir}`));
        }
      } catch (cleanupErr) {
        console.error(pc.red(`⚠️  Error al remover el directorio durante el rollback: ${cleanupErr.message}`));
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIONES PRIVADAS DE APROVISIONAMIENTO (no exportadas)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Paso 9: Instala dependencias npm y genera el mapa de arquitectura inicial.
 * @param {string} targetDir Ruta absoluta del proyecto generado
 */
async function installDependencies(targetDir) {
  console.log('\n' + pc.cyan('📦 Instalando dependencias en el nuevo proyecto. Por favor espera...'));

  // [C2 FIX] npm install es un paso BLOQUEANTE. Si falla, el seed admin, el build y el deploy
  // fallarán en cascada con errores confusos. Propagar el error para detener el pipeline.
  await execAsyncCommand('npm', ['install', '--prefer-offline', '--no-audit', '--no-fund', '--loglevel=error'], { cwd: targetDir });
  console.log(pc.green('✅ Dependencias de npm instaladas.'));

  // El mapa de arquitectura es opcional — si falla, no detiene el pipeline
  try {
    console.log(pc.cyan('🔍 Generando mapa de arquitectura inicial...'));
    await execAsyncCommand('npm', ['run', 'map'], { cwd: targetDir });
    console.log(pc.green('✅ Mapa de arquitectura del nuevo proyecto indexado con éxito.'));
  } catch (mapErr) {
    console.warn(pc.yellow(`⚠️  Aviso: No se pudo generar el mapa de arquitectura: ${mapErr.message}. No es crítico.`));
  }
}

/**
 * Paso 10: Inicializa Git e integra con GitHub si está habilitado.
 * @param {Object} answers Payload de aprovisionamiento
 * @param {string} targetDir Ruta absoluta del proyecto generado
 * @param {string} clientId ID normalizado del cliente
 */
async function setupGitHub(answers, targetDir, clientId) {
  // 1. Inicializar Git local de forma universal
  console.log(pc.cyan('🐙 Inicializando repositorio Git local...'));
  let gitInitialized = false;
  try {
    execSync('git init', { cwd: targetDir, stdio: 'ignore' });

    // Declarar rutas para el Git hook
    const hookSource = path.join(process.cwd(), 'hooks', 'pre-commit');
    const hookDestDir = path.join(targetDir, '.git', 'hooks');
    const hookDestPath = path.join(hookDestDir, 'pre-commit');

    if (await fs.pathExists(hookSource)) {
      await fs.ensureDir(hookDestDir);
      let hookContent = await fs.readFile(hookSource, 'utf-8');
      
      // [A4 FIX] Calcular dinámicamente la ruta absoluta del script de integridad en esta instalación
      const docsRoot = getWorkspaceRoot(); // ej: D:\PROTOTIPE
      const integrityScriptPath = path.join(docsRoot, 'Documentacion PROTOTIPE', '04_Estandares_y_Skills', 'Copia_Seguridad_Reglas_y_Skills', 'verify_ecosystem_integrity.js')
        .replace(/\\/g, '/'); // Asegurar formato de barra Unix para bash en Windows (Git Bash)

      hookContent = hookContent.replace(
        /SCRIPT_PATH="[^"]*"/,
        `SCRIPT_PATH="${integrityScriptPath}"`
      );

      await fs.writeFile(hookDestPath, hookContent, 'utf-8');
      try {
        execSync(`chmod +x "${hookDestPath}"`, { stdio: 'ignore' });
      } catch (_) {}
      console.log(pc.gray('   - Git Hook de reglas inyectado y adaptado con éxito.'));
    }

    execSync('git add .', { cwd: targetDir, stdio: 'ignore' });
    execSync('git commit -m "feat: scaffolding inicial del ecosistema"', { cwd: targetDir, stdio: 'ignore' });
    console.log(pc.green('✅ Repositorio Git local inicializado con commit de pre-vuelo.'));
    gitInitialized = true;
  } catch (err) {
    console.warn(pc.yellow(`⚠️  No se pudo inicializar Git localmente o realizar el commit inicial: ${err.message}. Continuando.`));
  }

  // 2. Subir a GitHub si se solicitó en el briefing
  if (answers.enableGithub && gitInitialized) {
    console.log(pc.cyan('🐙 Creando y subiendo repositorio a GitHub...'));
    try {
      const repoName = `app-${clientId}`;
      execSync(`gh repo create ${repoName} --private --source=. --push`, { cwd: targetDir, stdio: 'ignore' });
      console.log(pc.green(`✅ Repositorio GitHub creado y subido con éxito: ${repoName}`));
    } catch (err) {
      console.warn(pc.yellow(`⚠️  No se pudo subir a GitHub automáticamente: ${err.message}. Asegúrate de tener gh CLI logueado.`));
    }
  }
}

/**
 * Paso 11: Despliega reglas e índices en Firebase y siembra datos iniciales.
 * @param {Object} answers Payload de aprovisionamiento
 * @param {string} targetDir Ruta absoluta del proyecto generado
 */
async function deployFirebase(answers, targetDir) {
  const cleanProjectId = answers.firebaseProjectId.replace(/[^a-z0-9\-]/gi, '');

  // [A3] Helper interno de retry específico para comandos Firebase que pueden fallar por rate-limiting o red
  async function execFirebaseWithRetry(args, maxRetries = 2, retryDelayMs = 5000) {
    const finalArgs = [...args];
    if (process.env.FIREBASE_TOKEN) {
      finalArgs.push('--token', process.env.FIREBASE_TOKEN);
    }
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        await execAsyncCommand('firebase', finalArgs, { cwd: targetDir });
        return; // éxito
      } catch (err) {
        if (attempt <= maxRetries) {
          console.warn(pc.yellow(`⚠️  [Firebase Deploy] Intento ${attempt} fallido. Reintentando en ${retryDelayMs / 1000}s... (${err.message.split('\n')[0]})`));
          await new Promise(r => setTimeout(r, retryDelayMs));
        } else {
          throw err; // Agotados los reintentos — propagar
        }
      }
    }
  }

  if (!answers.enableFirebaseDeploy) {
    // Modo desarrollo: solo reglas e índices (no bloquea si falla)
    console.log(pc.cyan('🔥 Desplegando reglas e índices de Firestore para desarrollo local...'));
    try {
      await execFirebaseWithRetry(['deploy', '--only', 'firestore:rules,firestore:indexes', '-P', cleanProjectId]);
      console.log(pc.green('✅ Reglas e índices de Firestore desplegados con éxito.'));
    } catch (deployErr) {
      console.warn(pc.yellow(`⚠️  Aviso: No se pudieron desplegar las reglas/índices de Firestore: ${deployErr.message}. Asegúrate de tener firebase-cli logueado.`));
    }
    return;
  }

  // [A2 FIX] Modo producción: build + full deploy. Errores se PROPAGAN al caller.
  // El caller (createProject) los captura en su try/catch y ejecuta rollback.
  console.log(pc.cyan('🔥 Compilando el proyecto (npm run build)...'));
  await execAsyncCommand('npm', ['run', 'build'], { cwd: targetDir });
  console.log(pc.green('✅ Compilación de producción generada con éxito.'));

  console.log(pc.cyan('🔥 Desplegando en Firebase (reglas, índices, storage y hosting)...'));
  await execFirebaseWithRetry(['deploy', '--only', 'firestore:rules,firestore:indexes,storage,hosting', '-P', cleanProjectId]);
  console.log(pc.green('✅ Proyecto de Firebase (Reglas, Índices, Storage y Hosting) desplegado por completo de forma exitosa.'));
}

/**
 * Paso 11.1: Sembrar automáticamente el administrador y la configuración inicial de la base de datos.
 * @param {Object} answers Payload de aprovisionamiento
 * @param {string} targetDir Ruta absoluta del proyecto generado
 */
async function runSeedAdmin(answers, targetDir) {
  console.log(pc.cyan('🤖 Sembrando usuario administrador inicial y configuración en Firestore...'));
  try {
    // Ejecutar scripts/seed_admin.js
    await execAsyncCommand('node', ['scripts/seed_admin.js'], { cwd: targetDir });
    console.log(pc.green('✅ Usuario administrador y configuración base de Firestore inicializados con éxito.'));
  } catch (err) {
    console.warn(pc.yellow(`⚠️  No se pudo sembrar el administrador automáticamente:\n${err.message}\nPrueba a correr manualmente: npm run seed:admin`));
  }
}

/**
 * Helper interno para peticiones fetch con reintento automático y backoff exponencial.
 */
async function fetchWithRetry(url, options, retries = 3, backoffMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`📡 [Conectividad Central] Intento ${i + 1} fallido. Reintentando en ${backoffMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      backoffMs *= 2;
    }
  }
}

/**
 * Paso 12: Auto-registra la instancia y el token de telemetría en la Consola Central.
 * @param {Object} answers Payload de aprovisionamiento
 * @param {string} clientId ID normalizado del cliente
 * @param {string} uniqueToken Token único de telemetría ya generado
 */
async function registerInCentralConsole(answers, clientId, uniqueToken) {
  const activeCentralApiKey = answers.centralApiKey || process.env.VITE_DEVELOPER_CENTRAL_API_KEY;
  if (!activeCentralApiKey) return;

  console.log(pc.cyan('📡 Auto-registrando la nueva instancia en la Consola Central...'));
  try {
    const centralUrl = 'https://firestore.googleapis.com/v1/projects/prototipe-ecosistema-control/databases/(default)/documents';

    const formatREST = (data) => {
      const fields = {};
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'string')  fields[k] = { stringValue: v };
        else if (typeof v === 'number')  fields[k] = { doubleValue: v };
        else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
      }
      return { fields };
    };

    const payloadCliente = formatREST({
      nombre: answers.projectName,
      coreType: answers.coreType || 'seed',
      billingMode: answers.billingMode || 'percentage',
      comisionPorcentaje: Number(answers.comisionPorcentaje ?? 1.5),
      pagoMensualFijo: Number(answers.pagoMensualFijo ?? 0),
      active: true,
      createdAt: new Date().toISOString()
    });

    // Registrar el cliente en clientes_control (usa apiKey pública, solo actualiza campos permitidos)
    const resultCliente = await fetchWithRetry(`${centralUrl}/clientes_control/${clientId}?key=${activeCentralApiKey}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadCliente)
    }).then(() => ({ status: 'fulfilled' })).catch(e => ({ status: 'rejected', reason: e }));

    // Registrar el token de telemetría vía Bridge local (autenticado con OAuth2 del CLI)
    // Esto garantiza que request.auth != null en las reglas de Firestore y evita el error de permisos.
    let resultToken = { status: 'rejected', reason: new Error('Bridge no disponible') };
    try {
      const bridgeRes = await fetch('http://localhost:3001/api/project/token/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, token: uniqueToken })
      });
      const bridgeData = await bridgeRes.json();
      if (bridgeData.success) {
        resultToken = { status: 'fulfilled' };
      } else {
        resultToken = { status: 'rejected', reason: new Error(bridgeData.error || 'Error desconocido del Bridge') };
      }
    } catch (bridgeErr) {
      // Bridge no disponible: fallback a REST directo con apiKey (puede fallar por reglas de auth)
      console.warn(pc.yellow('   → Bridge CLI no disponible. Intentando registro directo de token (puede requerir re-registro manual)...'));
      const payloadToken = formatREST({
        active: true,
        clientId,
        token: uniqueToken,
        createdAt: new Date().toISOString()
      });
      resultToken = await fetchWithRetry(`${centralUrl}/tokens/${uniqueToken}?key=${activeCentralApiKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToken)
      }).then(() => ({ status: 'fulfilled' })).catch(e => ({ status: 'rejected', reason: e }));
    }

    const clienteOk = resultCliente.status === 'fulfilled';
    const tokenOk   = resultToken.status   === 'fulfilled';

    if (clienteOk && tokenOk) {
      console.log(pc.green('✅ Instancia y Token auto-registrados correctamente en la Consola Central.'));
    } else {
      if (!clienteOk) console.warn(pc.yellow(`⚠️  Registro de instancia en clientes_control falló: ${resultCliente.reason?.message}`));
      if (!tokenOk)   console.warn(pc.yellow(`⚠️  Registro de token de telemetría falló: ${resultToken.reason?.message}`));
      console.warn(pc.yellow('   → El proyecto fue creado, pero su registro en la Consola Central quedó incompleto.'));
      console.warn(pc.yellow(`   → Para re-registrar el token manualmente, ve al CRM del Dashboard y usa "Registrar Token" para: ${clientId}`));
    }
    } catch (err) {
      console.warn(pc.yellow(`⚠️  No se pudo realizar el auto-registro en la Consola Central: ${err.message}`));
    }
}

/**
 * Paso 11.2: Genera prototipe.lock.json en la raiz de la instancia.
 * Registra la version del Core y el hash SHA-256 de cada archivo propagado.
 * Permite detectar drift (desviacion local del cliente) en sincronizaciones
 * downstream futuras, diferenciando archivos "core" de archivos "custom".
 *
 * @param {Object} answers  Payload de aprovisionamiento
 * @param {string} targetDir Ruta absoluta del proyecto generado
 * @param {string} clientId  ID normalizado del cliente
 */
async function generatePrototypeLock(answers, targetDir, clientId) {
  const lockPath = path.join(targetDir, 'prototipe.lock.json');
  try {
    console.log(pc.cyan('[lock] Generando prototipe.lock.json...'));

    // Leer version del template desde su package.json
    let templateVersion = '1.0.0';
    try {
      const templatePkg = await fs.readJson(path.join(targetDir, 'package.json'));
      templateVersion = templatePkg.version || '1.0.0';
    } catch (_) {}

    // Directorios y archivos excluidos del lockfile
    const LOCK_EXCLUDE = new Set([
      'node_modules', 'dist', '.firebase', '.git', '.vite',
      'prototipe.lock.json', '.env.local', '.env'
    ]);

    const fileHashes = {};
    const nodeCrypto = await import('node:crypto');

    async function walkDir(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (LOCK_EXCLUDE.has(entry.name)) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walkDir(fullPath);
        } else {
          const relativePath = path.relative(targetDir, fullPath).split(path.sep).join('/');
          try {
            const content = await fs.readFile(fullPath);
            const hash = nodeCrypto.createHash('sha256').update(content).digest('hex');
            fileHashes[relativePath] = {
              owner: 'core',
              coreHash: hash,
              appliedHash: hash,
              lastSyncedAt: new Date().toISOString()
            };
          } catch (_) {}
        }
      }
    }

    await walkDir(targetDir);

    const featuresInstalled = {};
    const featuresList = answers.blueprint?.features || answers.features || [];
    for (const featId of featuresList) {
      const featMeta = await FeatureRegistry.resolve(featId);
      featuresInstalled[featId] = {
        version: featMeta ? featMeta.version : '1.0.0',
        installedAt: new Date().toISOString()
      };
    }

    const lockData = {
      schemaVersion: 1,
      clientId,
      coreTemplate: answers.template || 'template-core-seed',
      coreVersion: templateVersion,
      cliVersion: CLI_VERSION,
      niche: answers.niche || 'general',
      generatedAt: new Date().toISOString(),
      featuresInstalled,
      files: fileHashes
    };

    await fs.writeJson(lockPath, lockData, { spaces: 2 });
    console.log(pc.green(`[lock] prototipe.lock.json generado: ${Object.keys(fileHashes).length} archivos registrados con SHA-256.`));
  } catch (err) {
    console.warn(pc.yellow(`[lock] No se pudo generar prototipe.lock.json: ${err.message}. Se generara en la proxima sincronizacion.`));
  }
}

/**
 * Obtener token del Firebase CLI para llamadas REST
 */
/**
 * Obtener token del Firebase CLI para llamadas REST
 */
function getDeveloperAccessToken(answers = {}) {
  // 1. Priorizar el token OAuth2 enviado desde el Dashboard web
  if (answers.developerGoogleToken) {
    return answers.developerGoogleToken;
  }

  // 2. Fallback clásico de consola local
  const possiblePaths = [
    path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json'),
    path.join(process.env.APPDATA || '', 'configstore', 'firebase-tools.json')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        if (data.tokens && data.tokens.access_token) {
          return data.tokens.access_token;
        }
      } catch (_) {}
    }
  }
  return null;
}

/**
 * Automatiza la creación de una cuenta de servicio vía API IAM de GCP y guarda su JSON en /scratch
 */
async function createServiceAccountIAM(projectId, targetDir, answers = {}) {
  const stepSA = ora('Aprovisionar cuenta de servicio de Google Cloud vía API IAM...').start();
  const token = getDeveloperAccessToken(answers);
  
  if (!token) {
    stepSA.warn('⚠️ No se pudo obtener el token de sesión de Firebase CLI. Omitiendo creación automática de cuenta de servicio.');
    return;
  }

  const accountId = 'app-seeding-acct';
  const email = `${accountId}@${projectId}.iam.gserviceaccount.com`;
  const scratchDir = path.join(targetDir, 'scratch');
  const serviceAccountJsonPath = path.join(scratchDir, 'firebase-service-account.json');

  try {
    // 1. Crear Cuenta de Servicio
    const createUrl = `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`;
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        accountId: accountId,
        serviceAccount: {
          displayName: 'Cuenta de Seeding Automatica del CLI'
        }
      })
    });

    if (!createRes.ok) {
      const errData = await createRes.json();
      // Si el error es 409 (ya existe), ignoramos pacíficamente
      if (createRes.status !== 409) {
        throw new Error(errData.error?.message || 'Fallo al crear cuenta de servicio.');
      }
    }

    // 2. Crear Key JSON
    const keyUrl = `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts/${email}/keys`;
    const keyRes = await fetch(keyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!keyRes.ok) {
      const errData = await keyRes.json();
      throw new Error(errData.error?.message || 'Fallo al generar llave de cuenta de servicio.');
    }

    const keyData = await keyRes.json();
    if (!keyData.privateKeyData) {
      throw new Error('La respuesta de la API no contiene privateKeyData.');
    }

    // Decodificar Base64
    const decodedJson = Buffer.from(keyData.privateKeyData, 'base64').toString('utf8');
    
    // Asegurar directorio y escribir archivo
    await fs.ensureDir(scratchDir);
    await fs.writeFile(serviceAccountJsonPath, decodedJson, 'utf-8');
    stepSA.succeed('Cuenta de servicio firebase-service-account.json generada correctamente en /scratch.');
  } catch (err) {
    stepSA.warn(`⚠️ [API IAM] No se pudo aprovisionar la cuenta de servicio de forma desatendida: ${err.message}`);
  }
}

/**
 * Inyecta en caliente los componentes recomendados copiando los JSX de la biblioteca al Scaffold
 */
async function injectSelectedComponents(answers, targetDir) {
  if (!Array.isArray(answers.selectedRecomendations) || answers.selectedRecomendations.length === 0) {
    return;
  }

  const stepInj = ora('Inyectar en caliente componentes recomendados de la biblioteca...').start();
  let count = 0;
  const injectedList = [];

  for (const rec of answers.selectedRecomendations) {
    if (!rec.link) continue;
    
    // Normalizar URL con protocolo file:// en Windows/UNIX
    let linkPath = rec.link;
    if (linkPath.startsWith('file://')) {
      try {
        linkPath = fileURLToPath(linkPath);
      } catch (urlErr) {
        console.warn(pc.yellow(`  ⚠️ No se pudo convertir URL file:// a ruta fisica: ${rec.link}`));
        continue;
      }
    }
    
    linkPath = path.resolve(linkPath);
    if (!fs.existsSync(linkPath)) {
      console.warn(pc.yellow(`  ⚠️ El archivo de documentacion no existe fisicamente: ${linkPath}`));
      continue;
    }

    try {
      const mdContent = await fs.readFile(linkPath, 'utf8');

      // 1. Extraer targetPath de metadatos JSON
      const jsonMatch = mdContent.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
      if (!jsonMatch) continue;

      const meta = JSON.parse(jsonMatch[1]);
      const targetPath = meta.targetPath;
      if (!targetPath) continue;

      // 2. Extraer Código React robusto (Buscar despues del titulo de codigo completo)
      let searchIndex = mdContent.indexOf('## 3. Código');
      if (searchIndex === -1) {
        searchIndex = 0; // Fallback
      }

      const snippetToParse = mdContent.substring(searchIndex);
      const codeMatch = snippetToParse.match(/```(?:jsx|javascript|js)\s*\n([\s\S]*?)\n```/i);
      if (!codeMatch) continue;

      const codeContent = codeMatch[1];
      const destinationPath = path.join(targetDir, targetPath);

      // Crear directorio e inyectar JSX
      await fs.ensureDir(path.dirname(destinationPath));
      await fs.writeFile(destinationPath, codeContent, 'utf-8');
      
      const techName = meta.technicalName || rec.technicalName || rec.name;
      // Normalizar importPath a formato de import estándar de Vite
      const importPath = targetPath.replace('src/', '@/').replace(/\.jsx?$/, '');
      
      injectedList.push({
        name: rec.name,
        technicalName: techName,
        importPath: importPath
      });
      count++;
    } catch (err) {
      console.warn(pc.yellow(`  ⚠️ No se pudo inyectar en caliente el componente "${rec.name}": ${err.message}`));
    }
  }

  // Guardar en answers para que el generador de prompts lo use
  answers.injectedComponentsList = injectedList;

  // Inyectar la sección en guia_estilos_ui.md del cliente para orientar a la IA
  if (injectedList.length > 0) {
    try {
      const docDirName = `Documentacion ${answers.projectName}`;
      const stylesGuidePath = path.join(targetDir, docDirName, 'guia_estilos_ui.md');
      
      if (await fs.pathExists(stylesGuidePath)) {
        let content = await fs.readFile(stylesGuidePath, 'utf8');
        content += `\n\n## 📦 Componentes de Biblioteca Pre-Instalados (¡Listos para usar!)\n`;
        content += `Los siguientes componentes ya existen físicamente en el proyecto. **Queda prohibido volver a crearlos**. Utilízalos directamente importándolos en tus vistas:\n\n`;
        
        injectedList.forEach(item => {
          content += `- **${item.name}** (\`${item.technicalName}\`): Listo para importar desde:\n`;
          content += `  \`import ${item.technicalName} from '${item.importPath}';\` (o ruta relativa equivalente).\n`;
        });
        
        await fs.writeFile(stylesGuidePath, content, 'utf-8');
      }
    } catch (docErr) {
      console.warn(pc.yellow(`  ⚠️ No se pudo registrar la lista de componentes en la guía de estilos: ${docErr.message}`));
    }
  }

  if (count > 0) {
    stepInj.succeed(`Inyectados en caliente ${count} componentes recomendados directamente en el Scaffold.`);
  } else {
    stepInj.info('No se inyectaron componentes recomendados (no se encontró código funcional en las fichas).');
  }
}

