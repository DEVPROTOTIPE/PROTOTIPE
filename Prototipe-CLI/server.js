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

const execAsync = promisify(exec);

// Helper de sanitización extrema para evitar inyecciones de comandos en cadenas pasadas a consolas
function sanitizeShellArgument(arg) {
  if (typeof arg !== 'string') return '';
  // Remover solo comillas dobles, comillas simples, variables shell, redirecciones y operadores lógicos,
  // permitiendo caracteres válidos de nombres de rutas dinámicas (como [], (), {})
  return arg.replace(/["'<>|;&$]/g, '').trim();
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
const WORKER_PATH  = path.join(CLI_ROOT, 'worker_create_project.js');

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

// Tiempo máximo de aprovisionamiento antes de considerar el proceso como colgado (10 min)
const WORKER_TIMEOUT_MS = 10 * 60 * 1000;

// Carga del .env centralizada en config.js — no se duplica aquí.

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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
        const appDisplayName = (projectName || safeProjectId).replace(/["\\]/g, '');
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
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true })
    });
    const data = await response.json();
    if (data.error) {
      const msg = data.error.message || '';
      if (msg === 'ADMIN_ONLY_OPERATION') {
        return res.json({ valid: true, warning: 'Credenciales de Firebase válidas (operación restringida de registro de usuarios).' });
      }
      const friendlyError = msg.includes('API key not valid') || msg.includes('INVALID_API_KEY')
        ? 'La Firebase API Key suministrada no es válida.'
        : msg;
      return res.json({ valid: false, error: friendlyError });
    }
    res.json({ valid: true });
  } catch (err) {
    res.json({ valid: false, error: `Error de red al validar credenciales: ${err.message}` });
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
  try {
    const buffer = Buffer.from(base64, 'base64');
    const uploadDir = path.join(CLI_ROOT, 'temp_uploads');
    await fs.ensureDir(uploadDir);
    const targetPath = path.join(uploadDir, filename);

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

// Endpoint para crear el proyecto físicamente
app.post('/api/create-project', async (req, res) => {
  const answers = req.body;
  if (answers.projectName) {
    answers.projectName = sanitizeShellArgument(answers.projectName);
  }
  
  // Validaciones básicas de campos requeridos
  const requiredFields = [
    'template',
    'projectName',
    'targetPath',
    'paletteChoice',
    'centralApiKey',
    'centralAppId'
  ];

  for (const field of requiredFields) {
    if (!answers[field]) {
      return res.status(400).json({ error: `El campo '${field}' es obligatorio para el aprovisionamiento.` });
    }
  }

  // Validar contraste de colores HSL si la paleta elegida es custom
  if (answers.paletteChoice === 'custom') {
    const primaryColor = answers.customPrimary || (answers.branding && answers.branding.primaryColor);
    const bgColor = answers.customBg || (answers.branding && answers.branding.bgColor) || 'hsl(224, 71%, 6%)';
    if (primaryColor) {
      const validation = validateHSLColors(primaryColor, bgColor);
      if (!validation.valid) {
        console.warn(`[API Bridge] Aprovisionamiento cancelado: ${validation.error}`);
        return res.status(400).json({ error: validation.error });
      }
    }
  }

  const clientId = answers.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const finalProjectId = answers.firebaseProjectId ? answers.firebaseProjectId.trim() : clientId;
  answers.firebaseProjectId = finalProjectId;

  console.log(`\n[API Bridge] Petición de creación recibida para el proyecto: ${answers.projectName}`);

  // Flujo de Aprovisionamiento Automático en Firebase Cloud
  if (answers.autoProvisionFirebase) {
    try {
      console.log(`[Firebase Automate] Iniciando automatización Firebase para: ${finalProjectId}`);
      
      // 1. Crear el proyecto Firebase si no existe
      try {
        console.log(`[Firebase Automate] Creando proyecto Firebase "${answers.projectName}" con ID "${finalProjectId}"...`);
        await execAsync(`firebase projects:create ${finalProjectId} --display-name "${answers.projectName}"`, { timeout: 180000 });
        console.log(`[Firebase Automate] Proyecto Firebase creado exitosamente.`);
      } catch (createErr) {
        if (createErr.message.includes('already exists') || createErr.stderr?.includes('already exists')) {
          console.log(`[Firebase Automate] El proyecto "${finalProjectId}" ya existe. Continuando con recursos...`);
        } else {
          throw createErr;
        }
      }

      // 2. Crear base de datos Firestore default (nam5)
      try {
        console.log(`[Firebase Automate] Inicializando Firestore (default) en nam5...`);
        await execAsync(`firebase firestore:databases:create "(default)" --project ${finalProjectId} --location nam5`, { timeout: 120000 });
        console.log(`[Firebase Automate] Firestore (default) creado con éxito.`);
      } catch (dbErr) {
        const errorText = (dbErr.message || '') + (dbErr.stderr || '');
        if (
          errorText.includes('already exists') ||
          errorText.includes('Conflict') ||
          errorText.includes('409') ||
          errorText.includes('ALREADY_EXISTS')
        ) {
          console.log(`[Firebase Automate] Firestore ya está inicializado o en proceso de aprovisionamiento.`);
        } else {
          console.warn(`[Firebase Automate Warning] No se pudo inicializar la BD default: ${dbErr.message}`);
        }
      }

      // 3. Crear aplicación Web
      try {
        console.log(`[Firebase Automate] Registrando Web App "${answers.projectName}"...`);
        await execAsync(`firebase apps:create web "${answers.projectName}" --project ${finalProjectId}`, { timeout: 90000 });
      } catch (appErr) {
        if (appErr.message.includes('already exists') || appErr.stderr?.includes('already exists')) {
          console.log(`[Firebase Automate] La Web App ya está registrada.`);
        } else {
          throw appErr;
        }
      }

      // 4. Extraer credenciales SDK
      console.log(`[Firebase Automate] Extrayendo SDK Config...`);
      const { stdout } = await execAsync(`firebase apps:sdkconfig web --project ${finalProjectId} --json`, { timeout: 60000 });
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Respuesta inesperada al obtener sdkconfig.');
      const sdkData = JSON.parse(jsonMatch[0]);
      const config = sdkData?.result?.sdkConfig || sdkData?.sdkConfig || sdkData;

      // Asignar parámetros detectados al payload answers
      answers.firebaseApiKey = config.apiKey;
      answers.firebaseAuthDomain = config.authDomain;
      answers.firebaseStorageBucket = config.storageBucket;
      answers.firebaseAppId = config.appId;

      console.log(`[Firebase Automate] Credenciales integradas con éxito para ${finalProjectId}.`);
    } catch (fbAutomateErr) {
      console.error(`[Firebase Automate Error] Falló el aprovisionamiento automatizado: ${fbAutomateErr.message}`);
      return res.status(500).json({ 
        error: `Fallo en automatización de Firebase: ${fbAutomateErr.message}. Verifica que estás logueado en firebase CLI y que el ID del proyecto está disponible.` 
      });
    }
  } else {
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
  

  // ─── Aprovisionamiento en proceso hijo (con Respuesta JSON) ───────────────────
  console.log(`[API Bridge] Iniciando creación de proyecto: ${answers.projectName}`);

  try {
    const result = await runCreateProjectWorker(answers, (line) => {
      console.log(`[Worker] ${line}`);
    });
    console.log(`[API Bridge] Proyecto '${answers.projectName}' creado con éxito en: ${result.targetDir}\n`);
    res.json({
      success: true,
      message: 'Proyecto creado físicamente con éxito.',
      prompt: result.prompt || '',
      data: result
    });
  } catch (err) {
    console.error(`[API Bridge] Error durante la creación: ${err.message}`);
    res.status(500).json({
      success: false,
      error: `Error en el aprovisionamiento local: ${err.message}`
    });
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
    const child = fork(WORKER_PATH, [], {
      // El worker hereda el env del padre (incluye PROTOTIPE_WORKSPACE_ROOT, etc.)
      env: { ...process.env },
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
    for (const line of lines) {
      // Detectar categoría: ### 0. 📂 Nombre...
      const catMatch = line.match(/^###\s+\d+\.\s+[📂📦]\s+(.+?)\s+\(`([^)]+)`\)/u);
      if (catMatch) {
        const catName = catMatch[1].trim();
        const folder = catMatch[2].trim();
        const isModule = folder.includes('09_Modulos_Completos') || catName.toLowerCase().includes('módulo') || catName.toLowerCase().includes('modulo') || line.includes('📦');
        currentCategory = { name: catName, folder, isModule, components: [] };
        categories.push(currentCategory);
        continue;
      }

      // Detectar categoría sin paréntesis: ### 0. 📂 Nombre
      const catMatchSimple = line.match(/^###\s+\d+\.\s+[📂📦]\s+(.+)/u);
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

        currentCategory.components.push({
          name: displayName,
          technicalName,
          description,
          link,
          category: currentCategory.name,
          resourceType: currentCategory.isModule ? 'module' : 'component',
          tags: buildTags(displayName, technicalName, description, currentCategory.name)
        });
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

    const totalComponents = categories.reduce((sum, c) => sum + c.components.length, 0);

    res.json({
      success: true,
      totalComponents,
      categories
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
      const categoryRegex = new RegExp(`(###\\s+\\d+\\.\\s+[📂📦].*?\\(\`?\\/?${escapedFolder}\`?\\).*?\\n)([\\s\\S]*?)(?=\\n###\\s+\\d+\\.\\s+[📂📦]|\\n---|\\n$)`, 'i');
      
      const match = readme.match(categoryRegex);
      if (match) {
        const categoryHeader = match[1];
        let categoryContent = match[2];
        
        // Construir la URL relativa del componente/módulo para evitar enlaces rotos
        const relativeUrlPath = isModuleCategory ? cleanCategory : `06_Biblioteca_Componentes/${cleanCategory}`;
        const componentRef = `* [${targetName.replace(/_/g, ' ')} (${targetName})](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/${relativeUrlPath}/${targetName}/${targetName.toLowerCase()}.md): ${description || 'Componente/Módulo extraído.'}`;
        
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
          const newRow = `\n| **${targetName.toLowerCase()}.md** | Ficha del componente ${targetName} | Componente extraído de la aplicación local. | [Ver Componente](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/${relativeUrlPath}/${targetName}/${targetName.toLowerCase()}.md) |`;
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

  // NIVEL 3: Heurística por subcarpeta física de la biblioteca (fallback robusto)
  const p = mdFilePath.toLowerCase();
  if (p.includes('logica_y_hooks') || p.includes('/hooks/')) return `src/hooks/${cleanName}.js`;
  if (p.includes('servicios_y_firebase') || p.includes('/servicios/')) return `src/services/${cleanName}.js`;
  if (p.includes('utilidades') || p.includes('/utils/')) return `src/utils/${cleanName}.js`;
  if (p.includes('paginas') || p.includes('/pages/')) return `src/pages/${cleanName}.jsx`;
  if (p.includes('modulos_completos') || type === 'module') return `src/components/modules/${cleanName}.jsx`;
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
  const { clientId, componentLink, targetRelativePath } = req.body;
  if (!clientId || !componentLink || !targetRelativePath) {
    return res.status(400).json({ error: 'Los campos "clientId", "componentLink" y "targetRelativePath" son obligatorios.' });
  }

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
      let relativeFilePath = destRelPath;
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
  }
});

// POST /api/library/inject/stream — Inyección con progreso en vivo via Server-Sent Events (SSE)
// Body: { clientId, componentLink, targetRelativePath, overwrite? }
app.post('/api/library/inject/stream', async (req, res) => {
  const { clientId, componentLink, targetRelativePath, overwrite = false } = req.body;
  if (!clientId || !componentLink || !targetRelativePath) {
    return res.status(400).json({ error: 'Los campos "clientId", "componentLink" y "targetRelativePath" son obligatorios.' });
  }

  // Configurar SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const emit = (event, data) => {
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
    const firestoreRulesDefault = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}\n`;
    const storageRulesDefault = `rules_version = '2';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    match /{allPaths=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}\n`;
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
    // Archivos locales secretos o de configuración de hosting específicos
    '.env.local', '.env', '.firebaserc', 'firebase.json',
    
    // Entornos de compilación y dependencias
    'dist', 'node_modules', '.git', '.firebase', '.vite', '.eslintcache', '.parcel-cache',
    
    // Carpetas de desarrollo y pruebas locales
    'scratch', 'playwright-report', 'test-results', '.gitkeep',
    
    // Archivos temporales y metadatos de sistema operativo
    '.DS_Store', 'Thumbs.db', 'npm-debug.log', 'yarn-error.log', 'pnpm-debug.log', 'firebase-debug.log'
  ]);

  await fs.ensureDir(templatePath);
  const synced = [];

  // Copiar directorios controlados concurrentemente
  await Promise.all(SYNC_PATHS.map(async (relPath) => {
    const src  = path.join(corePath, relPath);
    const dest = path.join(templatePath, relPath);
    if (!await fs.pathExists(src)) return;
    await fs.copy(src, dest, {
      overwrite: true,
      filter: (s) => !EXCLUDE_FROM_TEMPLATE.has(path.basename(s))
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

    const coreFilesSet = new Set(coreFiles);
    for (const tempFile of templateFiles) {
      if (!coreFilesSet.has(tempFile)) {
        const fileToDelete = path.join(templatePath, tempFile);
        try {
          await fs.remove(fileToDelete);
          console.log(`[Sync Prune] Eliminado archivo huérfano del template: ${tempFile}`);
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
      tokens.telemetryToken    = parseEnvValue('VITE_DEVELOPER_TELEMETRY_TOKEN');
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

    console.log(`[API] Plantilla core "${clave}" activada v${newVersion}.`);
    res.json({
      success: true,
      message: `Plantilla "${clave}" activada correctamente (v${newVersion}). Ya aparece en el wizard de creación de clientes.`,
      data: { clave, version: newVersion, synced, templatePath }
    });

  } catch (err) {
    console.error(`[API /cores/${clave}/activate] Error: ${err.message}`);
    res.status(500).json({ error: `Error al activar la plantilla: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
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
        tokens.telemetryToken    = parseEnvValue('VITE_DEVELOPER_TELEMETRY_TOKEN');
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
        tokens.telemetryToken    = parseEnvValue('VITE_DEVELOPER_TELEMETRY_TOKEN');
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
async function findProjectDir(clientId) {
  if (!clientId) return null;
  const baseAppsDir = getWorkspaceRoot(); // D:\PROTOTIPE\Instancias Clientes
  const lowerClientId = clientId.toLowerCase();

  // Helper interno: decide si un directorio corresponde al clientId buscado
  const matchesClientId = async (dirPath, folderName) => {
    // 1. .prototipe.json — fuente de verdad (clientId y projectName)
    const metaPath = path.join(dirPath, '.prototipe.json');
    if (await fs.pathExists(metaPath)) {
      const meta = await fs.readJson(metaPath).catch(() => ({}));
      if (
        (meta.clientId   && meta.clientId.toLowerCase()   === lowerClientId) ||
        (meta.projectName && meta.projectName.toLowerCase() === lowerClientId)
      ) return true;
    }
    // 2. package.json — nombre de paquete npm
    const pkgPath = path.join(dirPath, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath).catch(() => ({}));
      if ((pkg.name || '').toLowerCase() === lowerClientId) return true;
    }
    // 3. Nombre de carpeta normalizado (kebab-case) - Solo si contiene package.json
    if (await fs.pathExists(pkgPath)) {
      if (folderName.toLowerCase() === lowerClientId ||
          folderName.toLowerCase().replace(/[^a-z0-9]+/g, '-') === lowerClientId) return true;
    }
    return false;
  };

  if (await fs.pathExists(baseAppsDir)) {
    try {
      const items = await fs.readdir(baseAppsDir);
      for (const item of items) {
        const fullPath = path.join(baseAppsDir, item);
        const stat = await fs.stat(fullPath).catch(() => null);
        if (!stat || !stat.isDirectory()) continue;

        // Nivel 1: directorio inmediato (ej: Instancias Clientes/ventas-moni-app)
        if (await matchesClientId(fullPath, item)) return fullPath;

        // Nivel 2: un nivel dentro del nicho (ej: Instancias Clientes/ventas/ventas-moni-app)
        const subItems = await fs.readdir(fullPath).catch(() => []);
        for (const subItem of subItems) {
          const subPath = path.join(fullPath, subItem);
          const subStat = await fs.stat(subPath).catch(() => null);
          if (!subStat || !subStat.isDirectory()) continue;
          if (await matchesClientId(subPath, subItem)) return subPath;
        }
      }
    } catch (err) {
      console.error('[findProjectDir] Error recorriendo carpetas:', err);
    }
  }

  // Fallback: mappings conocidos de cores (para comandos que buscan el core directamente)
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
      if (fs.existsSync(candidate)) return candidate;
      candidate = path.join(path.dirname(baseAppsDir), 'Plantillas Core', mapping.folder);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
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
    const templateName = meta.template || 'template-core-seed';
    const firebaseProjectId = await resolveFirebaseProjectId(projectDir, clientId);

    const templateDir = path.join(TEMPLATES_DIR, templateName);
    const filesToSync = ['firestore.rules', 'firestore.indexes.json', 'storage.rules'];
    const auditResults = [];
    let differencesCount = 0;

    for (const fileName of filesToSync) {
      const srcPath = path.join(templateDir, fileName);
      const destPath = path.join(projectDir, fileName);

      const srcExists = await fs.pathExists(srcPath);
      const destExists = await fs.pathExists(destPath);

      let status = 'identical';
      let srcContent = '';
      let destContent = '';

      if (srcExists) srcContent = await fs.readFile(srcPath, 'utf-8');
      if (destExists) destContent = await fs.readFile(destPath, 'utf-8');

      if (!srcExists) {
        status = 'source_missing';
      } else if (!destExists) {
        status = 'destination_missing';
        differencesCount++;
      } else if (srcContent.trim() !== destContent.trim()) {
        status = 'different';
        differencesCount++;
      }

      auditResults.push({
        file: fileName,
        status,
        srcExists,
        destExists
      });

      // Si se solicita sincronización y hay diferencias/falta el archivo destino
      if (sync && srcExists && (status === 'different' || status === 'destination_missing')) {
        await fs.copy(srcPath, destPath, { overwrite: true });
        // Actualizar el estado en el reporte
        auditResults[auditResults.length - 1].status = 'synced';
      }
    }

    let deployed = false;
    let deployOutput = '';

    if (sync && differencesCount > 0) {
      console.log(`[Database Sync] Desplegando reglas e índices para: ${firebaseProjectId}`);
      try {
        const { stdout } = await execAsync(
          `firebase deploy --only firestore:rules,firestore:indexes,storage -P ${firebaseProjectId}`,
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
    if (!res.writableEnded) res.end();
  } catch (err) {
    send({ type: 'log', line: `❌ Error durante el despliegue: ${err.message}` });
    send({ type: 'result', success: false, error: err.message });
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
    if (content.includes('react-core') && content.includes('manifest: true')) {
      return res.json({ success: true, message: 'La optimización de chunks ya está aplicada en vite.config.js.' });
    }

    if (content.includes('build: {') && !content.includes('manifest:')) {
      content = content.replace('build: {', 'build: {\n    manifest: true,');
    }

    const target = "return 'vendor';";
    const replacement = `if (id.includes('react-router-dom') || id.includes('react-router') || id.includes('@remix-run')) {
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
    rel === 'package-lock.json' ||
    rel === '.gitignore' ||
    rel === '.prototipe-backup' || rel.startsWith('.prototipe-backup/')
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
              const diffResult = Diff.diffLines(clientContent, coreContent);
              differences.push({
                file: coreFile.relativePath,
                status: 'modified',
                message: 'El archivo HTML difiere estructuralmente de la plantilla del Core (excluyendo SEO/branding y scripts de cliente).',
                diff: diffResult.map(part => ({
                  value: part.value,
                  added: part.added,
                  removed: part.removed
                }))
              });
            } else {
              matchingCount++;
            }
          } else if (coreFile.relativePath === 'package.json') {
            // Se ignora de la lista física de diferencias para evitar sobrescrituras de texto plano destructivas.
            // Las discrepancias de dependencias se reportan lógicamente en dependencyDetails.
            matchingCount++;
          } else {
            if (coreContent !== clientContent) {
              const diffResult = Diff.diffLines(clientContent, coreContent);
              differences.push({
                file: coreFile.relativePath,
                status: 'modified',
                message: 'El archivo local difiere de la plantilla del Core.',
                diff: diffResult.map(part => ({
                  value: part.value,
                  added: part.added,
                  removed: part.removed
                }))
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
        
        for (const dep in coreDeps) {
          if (!clientDeps[dep]) {
            missingDeps.push(dep);
          } else if (coreDeps[dep] !== clientDeps[dep]) {
            mismatchDeps.push({ name: dep, coreVersion: coreDeps[dep], clientVersion: clientDeps[dep] });
          }
        }
        
        if (missingDeps.length > 0 || mismatchDeps.length > 0) {
          dependenciesOutOfSync = true;
          dependencyDetails = { missingDeps, mismatchDeps };
        }
      } catch (e) {
        console.warn(`Error al comparar package.json para dependencias de ${clientId}:`, e.message);
      }
    }

    res.json({
      success: true,
      clientId,
      coreId,
      parityPercent,
      differences,
      dependenciesOutOfSync,
      dependencyDetails
    });
  } catch (err) {
    console.error(`[API /project/drift] Error: ${err.message}`);
    res.status(500).json({ error: `Error al calcular desviación: ${err.message}` });
  }
});

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

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });

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

    const srcPath = path.join(coreDir, file);
    const destPath = path.join(projectDir, file);

    if (!await fs.pathExists(srcPath)) {
      return res.status(404).json({ error: `El archivo de origen no existe en el Core: ${file}` });
    }

    await fs.ensureDir(path.dirname(destPath));

    // 2. Procesar fusiones inteligentes según el archivo
    if (file === 'index.html') {
      const coreContent = await fs.readFile(srcPath, 'utf-8');
      const clientContent = await fs.pathExists(destPath) ? await fs.readFile(destPath, 'utf-8') : '';
      const mergedHTML = preserveClientSeoOnIndex(coreContent, clientContent, meta);
      await fs.writeFile(destPath, mergedHTML, 'utf-8');
      res.json({ success: true, message: `Archivo ${file} fusionado y sincronizado de forma inteligente, conservando branding y SEO.` });
    } else if (file === 'package.json') {
      if (await fs.pathExists(destPath)) {
        const mergedPkg = await mergePackageJson(srcPath, destPath);
        await fs.writeJson(destPath, mergedPkg, { spaces: 2 });
        res.json({ success: true, message: `Dependencias y scripts de package.json fusionados de forma lógica sin alterar la identidad del cliente.` });
      } else {
        await fs.copy(srcPath, destPath);
        res.json({ success: true, message: `Archivo package.json copiado de forma limpia.` });
      }
    } else {
      await fs.copy(srcPath, destPath);
      res.json({ success: true, message: `Archivo ${file} sincronizado exitosamente con el Core.` });
    }
  } catch (err) {
    res.status(500).json({ error: `Error al sincronizar archivo: ${err.message}` });
  }
});

// Endpoint para sincronizar múltiples archivos desviados desde el Core al Cliente en lote
app.post('/api/project/sync-files', async (req, res) => {
  const { clientId, files } = req.body;
  if (!clientId || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'Los parámetros "clientId" y un array de "files" son obligatorios.' });
  }

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });

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

      const srcPath = path.join(coreDir, file);
      const destPath = path.join(projectDir, file);

      if (await fs.pathExists(srcPath)) {
        await fs.ensureDir(path.dirname(destPath));
        
        try {
          // 2. Procesar fusiones inteligentes
          if (file === 'index.html') {
            const coreContent = await fs.readFile(srcPath, 'utf-8');
            const clientContent = await fs.pathExists(destPath) ? await fs.readFile(destPath, 'utf-8') : '';
            const mergedHTML = preserveClientSeoOnIndex(coreContent, clientContent, meta);
            await fs.writeFile(destPath, mergedHTML, 'utf-8');
            results.push({ file, success: true, note: 'Fusionado con SEO de cliente' });
          } else if (file === 'package.json') {
            if (await fs.pathExists(destPath)) {
              const mergedPkg = await mergePackageJson(srcPath, destPath);
              await fs.writeJson(destPath, mergedPkg, { spaces: 2 });
              results.push({ file, success: true, note: 'Fusionado lógicamente con package de cliente' });
            } else {
              await fs.copy(srcPath, destPath);
              results.push({ file, success: true });
            }
          } else {
            await fs.copy(srcPath, destPath);
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
  }
});

// --- GESTIÓN DE SERVIDORES DE DESARROLLO LOCAL POR CLIENTE ---
const devServers = new Map(); // clientId -> { child, url, status, logs }
const devServerLogListeners = new Map(); // clientId -> Set of Response objects

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

  req.on('close', () => {
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
    const child = spawn('npm', ['run', 'dev'], {
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
          resolve('http://localhost:5173'); 
        }
      }, 10000);

      child.stdout.on('data', (data) => {
        pushLog(data);
        const text = data.toString();
        const match = text.match(/(https?:\/\/(localhost|127\.0\.0\.1):\d+)/i);
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
      await execGitCommand('git reset --hard HEAD', projectDir);
      await execGitCommand('git clean -fd', projectDir);
      return res.json({ success: true, message: 'Todos los cambios locales fueron descartados con éxito.' });
    }

    if (!file) return res.status(400).json({ error: 'Debes especificar el archivo a descartar ("file") o "all".' });

    const safeFile = sanitizeShellArgument(file);
    if (!safeFile) return res.status(400).json({ error: 'Nombre de archivo no válido.' });

    await execGitCommand(`git checkout HEAD -- "${safeFile}"`, projectDir);
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
    const safeFile = sanitizeShellArgument(file);
    if (!safeFile) return res.status(400).json({ error: 'Nombre de archivo no válido.' });

    const { stdout } = await execGitCommand(`git diff HEAD -- "${safeFile}"`, projectDir);
    res.json({ success: true, diff: stdout || 'No hay cambios en este archivo respecto a HEAD.' });
  } catch (err) {
    console.error(`[API /api/git/diff-file] Error:`, err.message);
    res.status(500).json({ error: `Error al obtener diff: ${err.message}` });
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

  const child = spawn('npm', ['install'], {
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

async function execGitCommand(cmd, dir) {
  if (typeof cmd !== 'string' || /[|;&$`<>]/g.test(cmd)) {
    throw new Error('Comando de Git contiene caracteres prohibidos o inseguros.');
  }
  const gitFolder = await getGitDirName(dir);
  const env = { ...process.env, PAGER: 'cat' };
  if (gitFolder) {
    env.GIT_DIR = path.join(dir, gitFolder);
    env.GIT_WORK_TREE = dir;
  }
  return execAsync(cmd, { cwd: dir, env, timeout: 10000 });
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
    if (resolvedPath === GIT_ROOT) {
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
      const { stdout: diffOutput } = await execGitCommand(`git rev-list --left-right --count HEAD...origin/${branch}`, resolvedPath);
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
    const { stdout } = await execGitCommand('git log -n 5 --pretty=format:"%h:::%an:::%ar:::%s"', resolvedPath);
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
                const { stdout: behindOut } = await execGitCommand(`git log cliente/${client.id}..${defaultBase} --oneline`, itemPath);
                commitsBehind = behindOut.split(/\r?\n/).filter(Boolean).length;

                const { stdout: aheadOut } = await execGitCommand(`git log ${defaultBase}..cliente/${client.id} --oneline`, itemPath);
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

  const runCommandStream = (cmdStr, args, cwd) => {
    return new Promise((resolve, reject) => {
      send('log', { text: `👉 Ejecutando: ${cmdStr} ${args.join(' ')}`, type: 'command' });
      
      const child = spawn(cmdStr, args, {
        cwd,
        shell: true,
        env: { ...process.env, FORCE_COLOR: '0' }
      });

      child.stdout.on('data', (data) => {
        const lines = data.toString('utf8').split(/\r?\n/).filter(l => l.trim());
        lines.forEach(line => send('log', { text: `   ${line}`, type: 'stdout' }));
      });

      child.stderr.on('data', (data) => {
        const lines = data.toString('utf8').split(/\r?\n/).filter(l => l.trim());
        lines.forEach(line => send('log', { text: `   ⚠ ${line}`, type: 'stderr' }));
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Comando falló con código ${code}`));
        }
      });

      child.on('error', (err) => {
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
      const clientName = clientBranch.replace(/^cliente\//, '');
      send('client-status', { client: clientName, status: 'running' });
      send('log', { text: `\n🔄 [Cliente: ${clientName}] Iniciando actualización...`, type: 'header' });

      try {
        send('log', { text: `   Checkout a rama: ${clientBranch}`, type: 'info' });
        await execGitCommand(`git checkout ${clientBranch}`, corePath);

        send('log', { text: `   Fusionando cambios de: ${sourceBranch}`, type: 'info' });
        try {
          await execGitCommand(`git merge ${sourceBranch} --no-verify -m "merge: Core global update"`, corePath);
        } catch (mergeErr) {
          send('log', { text: `❌ Conflicto de fusión detectado para ${clientName}. Abortando merge...`, type: 'error' });
          await execGitCommand('git merge --abort', corePath);
          throw new Error('Conflicto de fusión en Git');
        }

        send('log', { text: '   Subiendo rama actualizada a GitHub...', type: 'info' });
        await execGitCommand(`git push origin ${clientBranch} --no-verify`, corePath);

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
      await execGitCommand(`git checkout ${originalBranch}`, corePath);
      await execGitCommand('git stash pop', corePath);
    } catch (_) {}

    send('log', { text: '──────────────────────────────────────────────────', type: 'info' });
    send('log', { text: '🎉 Sincronización global completada.', type: 'success' });
    send('complete', { success: true });
  } catch (err) {
    send('log', { text: `❌ Error global durante la sincronización: ${err.message}`, type: 'error' });
    send('complete', { success: false, error: err.message });
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
        } catch (_) { 
          return null; 
        }

        const templateKey = meta.template;
        if (!templateKey || !coreInfo[templateKey]) return null;

        const core = coreInfo[templateKey];
        const clientVersion = meta.version || '0.0.0';

        // ── Detección REAL por hash MD5 ─────────────────────────────────
        let driftCount = 0;
        try {
          const coreFiles = await getSyncFilesRecursiveAsync(core.path);
          for (const relFile of coreFiles) {
            const coreHash   = await getSyncFileHashAsync(path.join(core.path, relFile));
            const clientHash = await getSyncFileHashAsync(path.join(fullPath, relFile));
            if (coreHash !== clientHash) driftCount++;
          }
        } catch (_) {
          driftCount = clientVersion !== core.version ? 1 : 0;
        }
        const isOutdated = driftCount > 0;
        // ────────────────────────────────────────────────────────────────

        return {
          templateKey,
          core,
          clientData: {
            clientId: meta.clientId || folderName,
            projectName: meta.projectName || folderName,
            folderName,
            path: fullPath,
            clientVersion,
            coreVersion: core.version,
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

    VITE_DEVELOPER_TELEMETRY_ENDPOINT: 'https://reporttelemetry-bkwhzlbhlq-uc.a.run.app',
    VITE_DEVELOPER_TELEMETRY_TOKEN: telemetryToken || currentEnv.VITE_DEVELOPER_TELEMETRY_TOKEN || '',
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
  envContent += `VITE_DEVELOPER_TELEMETRY_TOKEN=${finalEnv.VITE_DEVELOPER_TELEMETRY_TOKEN}\n`;
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
async function getFirebaseAccessToken() {
  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  if (!await fs.pathExists(configPath)) {
    throw new Error('No se encontró la sesión activa de Firebase CLI. Ejecuta "firebase login".');
  }
  const config = await fs.readJson(configPath);
  const tokens = config.tokens;
  if (!tokens) {
    throw new Error('No hay tokens guardados en Firebase CLI. Ejecuta "firebase login".');
  }

  // Si el access_token no ha expirado, usarlo directamente
  if (tokens.access_token && tokens.expires_at && tokens.expires_at > Date.now()) {
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
      contentToSave = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}\n`;
    } else {
      contentToSave = `rules_version = '2';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    match /{allPaths=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}\n`;
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

    const cmd = `firebase deploy --only ${deployOnly} -P ${firebaseProjectId}`;
    const stdout = execSync(cmd, { cwd: projectDir, encoding: 'utf8' });
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
    const lines = content.split(/\r?\n/);
    const tasks = [];
    
    // Regex tolerante: detecta [ ] y [x] con o sin negritas (**), tachados (~~),
    // guiones o asteriscos como viñeta, e identificadores en cualquier formato.
    const bulletRegex = /^\s*[-*]\s+(?:\*\*)?\[( |x)\]\s+(?:~~)?(.+?)(?:~~)?(?:\*\*)?\s*$/i;

    lines.forEach((line, index) => {
      const match = line.match(bulletRegex);
      if (match) {
        const completed = match[1].toLowerCase() === 'x';
        const rawText = match[2].trim();
        // Extraer ID de la tarea en formatos: CORE-123, LINE-45, Tarea 3:
        const idMatch = rawText.match(/(?:CORE-\d+|Tarea\s+\d+)/i);
        const id = idMatch ? idMatch[0] : `LINE-${index}`;
        
        tasks.push({
          id,
          text: rawText,
          completed,
          lineIndex: index,
          rawLine: line
        });
      }
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

      // Parsear de nuevo para retornar el listado actualizado con regex tolerante
      const updatedTasks = [];
      const bulletRegex = /^\s*[-*]\s+(?:\*\*)?\[( |x)\]\s+(?:~~)?(.+?)(?:~~)?(?:\*\*)?\s*$/i;
      lines.forEach((line, index) => {
        const m = line.match(bulletRegex);
        if (m) {
          const completed = m[1].toLowerCase() === 'x';
          const rawText = m[2].trim();
          const idMatch = rawText.match(/(?:CORE-\d+|Tarea\s+\d+)/i);
          const taskId = idMatch ? idMatch[0] : `LINE-${index}`;
          updatedTasks.push({
            id: taskId,
            text: rawText,
            completed,
            lineIndex: index,
            rawLine: line
          });
        }
      });

      res.json({ success: true, tasks: updatedTasks });
    } catch (err) {
      console.error('Error al actualizar la tarea:', err.message);
      res.status(500).json({ error: `Error de escritura del roadmap: ${err.message}` });
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/integrity/status
// Ejecuta el validador físico en un subproceso hijo para no tirar el CLI
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/integrity/status', async (req, res) => {
  try {
    const devDashboardDir = path.join(GIT_ROOT, 'Central PROTOTIPE', 'dev-dashboard');
    const verifyScript = path.join(devDashboardDir, 'scripts', 'verify_library_integrity.cjs');
    
    if (!await fs.pathExists(verifyScript)) {
      return res.status(404).json({ error: 'No se encontró el validador verify_library_integrity.cjs.' });
    }

    // Usar exec ya importado al inicio del archivo (ESM — no existe require())
    exec(`node "${verifyScript}"`, { cwd: devDashboardDir }, (error, stdout, stderr) => {
      const success = !error;
      res.json({
        success,
        stdout: stdout || '',
        stderr: stderr || '',
        code: error ? error.code : 0
      });
    });
  } catch (err) {
    console.error('Error de ejecución en validador de integridad:', err.message);
    res.status(500).json({ error: `Fallo al inicializar validador: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Buscar ruta absoluta de un cliente/instancia Saas por ID
// ─────────────────────────────────────────────────────────────────────────────
async function findClientPath(clientId) {
  if (!clientId) return null;
  const topDirs = await fs.readdir(GIT_INSTANCES_DIR).catch(() => []);
  for (const dir of topDirs) {
    const fullPath = path.join(GIT_INSTANCES_DIR, dir);
    if (dir.toLowerCase() === clientId.toLowerCase()) {
      if (await fs.pathExists(path.join(fullPath, '.prototipe.json'))) {
        return fullPath;
      }
    }
    const subDirs = await fs.readdir(fullPath).catch(() => []);
    for (const subDir of subDirs) {
      if (subDir.toLowerCase() === clientId.toLowerCase()) {
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
          const fd = await fs.open(logPath, 'r');
          const buffer = Buffer.alloc(stats.size - filePosition);
          await fs.read(fd, buffer, 0, stats.size - filePosition, filePosition);
          await fs.close(fd);
          filePosition = stats.size;

          const newContent = buffer.toString('utf8');
          const lines = newContent.split(/\r?\n/);
          lines.forEach(line => {
            if (line.trim()) {
              res.write(`data: ${JSON.stringify({ type: 'log', log: line })}\n\n`);
            }
          });
        } else if (stats.size < filePosition) {
          filePosition = stats.size;
        }
      } catch (_) {}
    }
  });

  req.on('close', () => {
    watcher.close();
    res.end();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/project/db/seed
// Sembrador seguro de datos de prueba en Firestore validando contra esquema
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/project/db/seed', async (req, res) => {
  const { clientId } = req.body;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  try {
    const projectPath = await findClientPath(clientId);
    if (!projectPath) {
      return res.status(404).json({ error: `No se encontró la ruta para el proyecto "${clientId}".` });
    }

    // Validar contra esquema_colecciones.md si existe
    const coreSchemaPath = path.join(GIT_ROOT, 'Plantillas Core', 'App Ventas', 'Documentacion App Ventas', 'esquema_colecciones.md');
    let hasSchema = false;
    if (await fs.pathExists(coreSchemaPath)) {
      hasSchema = true;
      const schemaText = await fs.readFile(coreSchemaPath, 'utf8');
      if (!schemaText.includes('Colección:') && !schemaText.includes('colección:')) {
        return res.status(400).json({ error: 'El esquema de colecciones del Core está mal formateado.' });
      }
    }

    const envPath = path.join(projectPath, '.env.local');
    if (!await fs.pathExists(envPath)) {
      return res.status(400).json({ error: 'No se encontró el archivo .env.local en el cliente.' });
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
      return res.status(400).json({ error: 'Faltan variables Firebase o admin en .env.local.' });
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
      return res.status(401).json({ error: 'No se pudo obtener la sesión de Firebase CLI. Corre: firebase login' });
    }

    // Datos estructurados a sembrar
    const seedCategories = [
      { id: 'cat_calzado', nombre: 'Calzado Deportivo', descripcion: 'Tenis y zapatos para correr' },
      { id: 'cat_tecnologia', nombre: 'Tecnología', descripcion: 'Dispositivos electrónicos y accesorios' },
      { id: 'cat_hogar', nombre: 'Hogar y Cocina', descripcion: 'Artículos para decorar y cocinar' }
    ];

    const seedProducts = [
      { id: 'prod_tenis_run', categoria: 'Calzado Deportivo', destacado: true, nombre: 'Tenis Run Ultra', precio: 180000, stock: 15, imagen: '' },
      { id: 'prod_reloj_smart', categoria: 'Tecnología', destacado: true, nombre: 'Reloj Inteligente V2', precio: 320000, stock: 8, imagen: '' },
      { id: 'prod_cafetera_exp', categoria: 'Hogar y Cocina', destacado: false, nombre: 'Cafetera Espresso Premium', precio: 450000, stock: 5, imagen: '' }
    ];

    // Escribir categorías
    for (const cat of seedCategories) {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/categorias/${cat.id}`;
      const payload = {
        fields: {
          nombre: { stringValue: cat.nombre },
          descripcion: { stringValue: cat.descripcion },
          updatedAt: { stringValue: new Date().toISOString() }
        }
      };
      const resFetch = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${devToken}` },
        body: JSON.stringify(payload)
      });
      if (!resFetch.ok) {
        const errText = await resFetch.text();
        throw new Error(`Error en categoría: ${errText}`);
      }
    }

    // Escribir artículos
    for (const prod of seedProducts) {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/articulos/${prod.id}`;
      const payload = {
        fields: {
          nombre: { stringValue: prod.nombre },
          categoria: { stringValue: prod.categoria },
          destacado: { booleanValue: prod.destacado },
          precio: { integerValue: prod.precio.toString() },
          stock: { integerValue: prod.stock.toString() },
          imagen: { stringValue: prod.imagen },
          createdAt: { stringValue: new Date().toISOString() }
        }
      };
      const resFetch = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${devToken}` },
        body: JSON.stringify(payload)
      });
      if (!resFetch.ok) {
        const errText = await resFetch.text();
        throw new Error(`Error en artículo: ${errText}`);
      }
    }

    res.json({ success: true, message: `Sembrado exitoso. Se inyectaron 3 categorías y 3 artículos en Firestore.`, schemaChecked: hasSchema });
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
      const entryText = `| **manual_${sanitizedName.toLowerCase()}.md** | Manual Técnico de Integración de ${sanitizedName} | Propósito: Guía de integración detallada. | [Ver Manual](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/${sanitizedCategory}/${sanitizedName}/manual_${sanitizedName.toLowerCase()}.md) |`;
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

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/project/cleanup
// Limpiador seguro con lista blanca estricta para evitar borrados accidentales
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/project/cleanup', async (req, res) => {
  const { clientId } = req.body;
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

async function startServer(port) {
  const server = app.listen(port, '127.0.0.1', () => {
    console.log(`\n🚀 [Prototipe CLI Bridge] Servidor local escuchando en: http://127.0.0.1:${port}`);
    console.log(`Endpoints activos:`);
    console.log(` - GET  http://localhost:${port}/api/templates`);
    console.log(` - GET  http://localhost:${port}/api/firebase-config?projectId=[id]&projectName=[name]`);
    console.log(` - POST http://localhost:${port}/api/create-project                 → Aprovisionamiento (SSE Logs)`);
    console.log(` - GET  http://localhost:${port}/api/library`);
    console.log(` - POST http://localhost:${port}/api/library/extract                 → Extracción de componentes`);
    console.log(` - GET  http://localhost:${port}/api/project/file`);
    console.log(` - POST http://localhost:${port}/api/project/deploy                  → Compilar y desplegar (SSE Logs)`);
    console.log(` - GET  http://localhost:${port}/api/project/env                     → Leer variables .env.local`);
    console.log(` - POST http://localhost:${port}/api/project/env                     → Escribir variables .env.local`);
    console.log(` - GET  http://localhost:${port}/api/project/audit                   → Auditoría física y PWA`);
    console.log(` - POST http://localhost:${port}/api/e2e/run                         → Ejecutar tests (SSE Logs)`);
    console.log(` - GET  http://localhost:${port}/api/e2e/last-result?projectId=[id]`);
    console.log(` `);
    console.log(` 🔒 Control de Versiones Git:`);
    console.log(` - GET  http://localhost:${port}/api/git/targets                     → Auto-detectar repositorios`);
    console.log(` - GET  http://localhost:${port}/api/git/status?path=[ruta]          → Estado de cambios`);
    console.log(` - GET  http://localhost:${port}/api/git/backup-stream?path=[ruta]   → Backup SSE en vivo`);
    console.log(` `);
    console.log(` 🏗️  Gestión de Plantillas Core:`);
    console.log(` - POST http://localhost:${port}/api/register-core              → Registrar nueva plantilla`);
    console.log(` - GET  http://localhost:${port}/api/cores                      → Listar todas las plantillas`);
    console.log(` - POST http://localhost:${port}/api/cores/:clave/scaffold      → Copiar código base de otro core`);
    console.log(` - POST http://localhost:${port}/api/cores/:clave/activate      → Sincronizar y activar en wizard`);
    console.log(` - POST http://localhost:${port}/api/cores/:clave/deactivate    → Retirar del wizard\n`);
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

// Ejecutar diagnósticos de dependencias del PATH una sola vez al arranque
await runPreflightChecks();
startServer(PORT);



