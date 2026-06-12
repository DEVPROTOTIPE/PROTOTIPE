import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn, fork } from 'child_process';
import { promisify } from 'util';
import * as Diff from 'diff';
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
  // Remover caracteres de redirección, operadores lógicos y secuencias de control shell, manteniendo solo lo básico
  return arg.replace(/["'`$\\;&|<>!*?()\[\]{}]/g, '').trim();
}

function killProcessTree(pid) {
  return new Promise((resolve) => {
    exec(`taskkill /PID ${pid} /T /F`, () => resolve());
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = __dirname;
const TEMPLATES_DIR = path.join(CLI_ROOT, 'templates');
const WORKER_PATH  = path.join(CLI_ROOT, 'worker_create_project.js');

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
    const { apiKey, authDomain, projectId: pid, storageBucket, messagingSenderId, appId, measurementId } = config;

    if (!apiKey || !appId) {
      return res.status(500).json({
        error: 'No se pudieron extraer las credenciales del SDK. Verifica que tienes permisos sobre el proyecto.'
      });
    }

    let vapidKey = '';
    try {
      const keys = webpush.generateVAPIDKeys();
      vapidKey = keys.publicKey;
    } catch (e) {
      console.warn('[VAPID] Falló la generación de clave VAPID:', e.message);
    }

    console.log(`[API] Credenciales auto-detectadas para proyecto: ${pid}`);
    res.json({
      success: true,
      config: { apiKey, authDomain, projectId: pid, storageBucket, messagingSenderId, appId, measurementId: measurementId || null },
      vapidKey
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

// Función para expandir los requerimientos usando la API REST de Gemini de forma nativa
async function expandRequirementsWithAI(customRequirements, projectName, libraryReadme) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    console.log('[Gemini] GEMINI_API_KEY no configurada en el CLI (.env). Omitiendo expansión cognitiva.');
    return customRequirements;
  }

  console.log('[Gemini] Iniciando expansión de requerimientos usando Gemini 2.5 Flash...');
  const systemInstruction = `Eres el Arquitecto de Soluciones Senior del ecosistema PROTOTIPE. Tu trabajo es tomar los requerimientos sencillos en bruto de un cliente y expandirlos en una especificación técnica de desarrollo sumamente detallada en formato Markdown.
Esta especificación se le pasará a otra Inteligencia Artificial (Antigravity) que se encargará de construir la aplicación cliente a la medida sobre un lienzo limpio o plantilla.
Debes diseñar:
1. El flujo de estados (Workflow) adecuado para el nicho de mercado del cliente (ej. para tornerías, aires acondicionados, etc. no utilices flujos de venta de ropa).
2. Un esquema de datos preciso para el objeto 'atributos' en Firestore (ej. material, tolerancia, PSI) evitando campos rígidos de ropa (tallas/colores).
3. Recomendaciones exactas de qué componentes de la Biblioteca Core portar mediante su ruta absoluta 'file:///${getDocumentationRoot().replace(/\\/g, '/')}/06_Biblioteca_Componentes/...'.
4. Identificación de nuevos componentes, hooks o stores a crear de manera estrictamente modular (component-first), prohibiendo código inline duplicado.
5. Pautas de UI, interacciones táctiles (active:scale-95) y animaciones de resorte de Framer Motion con clases variables HSL de marca blanca.

Tienes a tu disposición el siguiente catálogo de componentes listos en la Biblioteca Core de PROTOTIPE:
${libraryReadme}`;

  const prompt = `Expande detalladamente las especificaciones para el nuevo proyecto a la medida: "${projectName}"
Requerimiento en bruto del cliente:
"${customRequirements}"

Genera el blueprint técnico estructurado en Markdown para la IA desarrolladora.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { temperature: 0.2 }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error('Respuesta de API vacía o no estructurada.');

    console.log('[Gemini] Expansión cognitiva completada.');
    return resultText;
  } catch (error) {
    console.error('[Gemini] Error en llamada REST:', error.message);
    return `${customRequirements}\n\n*(Fallo de expansión por IA: ${error.message}. Por favor procesa el requerimiento básico)*`;
  }
}

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
    'centralMessagingSenderId',
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
      answers.firebaseMessagingSenderId = config.messagingSenderId;
      answers.firebaseAppId = config.appId;
      if (!answers.firebaseVapidKey) {
        try {
          const keys = webpush.generateVAPIDKeys();
          answers.firebaseVapidKey = keys.publicKey;
        } catch (e) {
          console.warn('[VAPID] Falló la generación de clave VAPID durante el aprovisionamiento automático:', e.message);
          answers.firebaseVapidKey = '';
        }
      }

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
      'firebaseMessagingSenderId',
      'firebaseAppId'
    ];
    for (const field of manualFields) {
      if (!answers[field]) {
        return res.status(400).json({ error: `El campo '${field}' es obligatorio para el aprovisionamiento manual.` });
      }
    }
  }
  
  // ─── Expansión cognitiva con Gemini (async, no bloquea) ──────────────────────
  try {
    if (answers.customRequirements && answers.customRequirements.trim().length > 0) {
      const readme = await getLibraryReadmeText();
      answers.customRequirements = await expandRequirementsWithAI(
        answers.customRequirements,
        answers.projectName,
        readme
      );
    }
  } catch (aiErr) {
    // No fatal: si falla la expansión, se continúa con el requerimiento en bruto
    console.warn(`[API Bridge] Fallo en expansión cognitiva (no crítico): ${aiErr.message}`);
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
    if (!filePath.toLowerCase().startsWith(baseDocDir.toLowerCase() + path.sep)) {
      if (filePath.toLowerCase() !== baseDocDir.toLowerCase()) {
        return res.status(403).json({ error: 'Acceso denegado. La ruta está fuera del directorio de documentación del proyecto.' });
      }
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
  const workspaceRoot = path.resolve(getWorkspaceRoot());
  const relative = path.relative(workspaceRoot, sourceFile);
  const isContained = !relative.startsWith('..') && !path.isAbsolute(relative);
  if (!isContained) {
    return res.status(403).json({ error: 'Acceso denegado: El archivo de origen debe estar dentro del espacio de trabajo del proyecto.' });
  }

  // Ruta destino de la biblioteca
  const baseDocDir = path.resolve(getDocumentationRoot());
  const categoryFolder = path.join(baseDocDir, '06_Biblioteca_Componentes', category);
  const componentFolder = path.join(categoryFolder, targetName);
  const targetDocFile = path.join(componentFolder, `${targetName.toLowerCase()}.md`);

  try {
    await fs.ensureDir(componentFolder);

    // Copiar el archivo o leer su contenido para documentar
    const codeContent = await fs.readFile(sourceFile, 'utf-8');

    // Generar el Markdown de documentación estándar
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
      
      // Encontrar la categoría correspondiente e insertar
      const escapedCategory = category.replace(/_/g, ' ');
      const categoryRegex = new RegExp(`(###\\s+\\d+\\.\\s+[📂📦]\\s+${escapedCategory}.*?\\n)([\\s\\S]*?)(?=\\n###\\s+\\d+\\.\\s+[📂📦]|\\n---|\\n$)`, 'i');
      
      const match = readme.match(categoryRegex);
      if (match) {
        const categoryHeader = match[1];
        let categoryContent = match[2];
        
        // Agregar el componente al listado si no existe ya
        const componentRef = `* [${targetName.replace(/_/g, ' ')} (${targetName})](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/${category}/${targetName}/${targetName.toLowerCase()}.md): ${description || 'Componente extraído.'}`;
        
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
          const newRow = `\n| **${targetName.toLowerCase()}.md** | Ficha del componente ${targetName} | Componente extraído de la aplicación local. | [Ver Componente](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/${category}/${targetName}/${targetName.toLowerCase()}.md) |`;
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

function buildTags(name, technicalName, description, category) {
  const text = `${name} ${technicalName} ${description} ${category}`.toLowerCase();
  const tags = [];
  if (text.includes('firebase') || text.includes('firestore')) tags.push('firebase');
  if (text.includes('hook') || text.includes('use')) tags.push('hook');
  if (text.includes('modal')) tags.push('modal');
  if (text.includes('pwa') || text.includes('install')) tags.push('pwa');
  if (text.includes('pdf') || text.includes('exporta')) tags.push('pdf');
  if (text.includes('toast') || text.includes('notifica')) tags.push('notificacion');
  if (text.includes('carrito') || text.includes('cart')) tags.push('ecommerce');
  if (text.includes('whatsapp')) tags.push('whatsapp');
  if (text.includes('mapa') || text.includes('leaflet')) tags.push('mapa');
  if (text.includes('zustand') || text.includes('store')) tags.push('estado');
  if (text.includes('dark') || text.includes('tema') || text.includes('theme')) tags.push('tema');
  if (text.includes('checkout') || text.includes('pago')) tags.push('pago');
  if (text.includes('qr')) tags.push('qr');
  if (text.includes('animac') || text.includes('framer')) tags.push('animacion');
  return tags;
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
    if (!filePath.toLowerCase().startsWith(targetProjectDir.toLowerCase() + path.sep)) {
      if (filePath.toLowerCase() !== targetProjectDir.toLowerCase()) {
        return res.status(403).json({ error: 'Acceso denegado. La ruta está fuera del proyecto.' });
      }
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
        archivosCreados: docStandard.map(d => d.name)
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

    const baseConfig = registro.plantillas[baseCore];
    if (!baseConfig) return res.status(404).json({ error: `El core base "${baseCore}" no existe en el registro.` });

    const targetCorePath = targetConfig.fuente.replace(/\//g, path.sep);
    const baseCorePath   = baseConfig.fuente.replace(/\//g, path.sep);

    // Rutas y nombres para reemplazo de texto
    const baseName   = path.basename(baseCorePath);   // ej. "App Ventas"
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

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/cores/:clave/activate
// Sincroniza el código del core al templates/ del CLI y marca activo: true.
// Equivale a correr sync_templates.js [clave] --yes y actualizar el registro.
// Body: {} (sin parámetros obligatorios)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/cores/:clave/activate', async (req, res) => {
  const { clave } = req.params;
  const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json');

  try {
    const registro = await fs.readJson(registroPath);
    const config = registro.plantillas[clave];
    if (!config) return res.status(404).json({ error: `La clave "${clave}" no existe en el registro.` });

    const corePath     = config.fuente.replace(/\//g, path.sep);
    const templatePath = config.destino.replace(/\//g, path.sep);

    // 1. Validar que el core tiene código real (más que solo docs y .gitkeep)
    const hasCode = await fs.pathExists(path.join(corePath, 'src'));
    if (!hasCode) {
      return res.status(422).json({
        error: `El core "${clave}" no tiene código en /src/ todavía. Completa el scaffold o el desarrollo antes de activar.`
      });
    }

    // 2. Sincronizar código core → templates/ usando la misma lógica que sync_templates.js
    const SYNC_PATHS = [
      'src/components', 'src/hooks', 'src/services', 'src/store',
      'src/layouts', 'src/pages', 'src/routes', 'src/utils',
      'src/constants', 'src/schemas', 'src/types', 'src/providers',
      'src/App.jsx', 'src/App.css', 'src/index.css', 'src/main.jsx',
      'firestore.indexes.json', 'firestore.rules', 'storage.rules',
      'vite.config.js', 'eslint.config.js', 'GEMINI.md',
      'index.html', 'public'
    ];

    const EXCLUDE_FROM_TEMPLATE = new Set([
      '.env.local', '.env', '.firebaserc', 'firebase.json',
      'dist', 'node_modules', '.git', '.firebase',
      'scratch', 'playwright-report', 'test-results', '.gitkeep'
    ]);

    await fs.ensureDir(templatePath);
    const synced = [];

    for (const relPath of SYNC_PATHS) {
      const src  = path.join(corePath, relPath);
      const dest = path.join(templatePath, relPath);
      if (!await fs.pathExists(src)) continue;
      await fs.copy(src, dest, {
        overwrite: true,
        filter: (s) => !EXCLUDE_FROM_TEMPLATE.has(path.basename(s))
      });
      synced.push(relPath);
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
    const coreDocs   = path.join(corePath, Object.keys(await fs.readdir(corePath)
      .then(files => files.filter(f => f.startsWith('Documentacion')))
      .then(arr => arr.reduce((acc, f) => { acc[f] = true; return acc; }, {})))[0] || docDirName);

    if (await fs.pathExists(coreDocs)) {
      const templateDocs = path.join(templatePath, path.basename(coreDocs));
      await fs.copy(coreDocs, templateDocs, { overwrite: true });
      synced.push(path.basename(coreDocs));
    }

    // 3. Incrementar versión (patch) y marcar activo: true
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
// POST /api/cores/:clave/deactivate
// Marca activo: false sin borrar nada (para retirar temporalmente del wizard)
// ─────────────────────────────────────────────────────────────────────────────
// Helper para resolver el ID de proyecto de Firebase de forma robusta y 100% automatizada
async function resolveFirebaseProjectId(projectDir, clientId) {
  const metaPath = path.join(projectDir, '.prototipe.json');
  let projectId = null;
  if (await fs.pathExists(metaPath)) {
    try {
      const meta = await fs.readJson(metaPath);
      projectId = meta.firebaseProjectId || meta.clientId;
    } catch (_) {}
  }
  
  const rcPath = path.join(projectDir, '.firebaserc');
  if (!projectId && await fs.pathExists(rcPath)) {
    try {
      const rc = await fs.readJson(rcPath);
      projectId = rc.projects?.default;
    } catch (_) {}
  }

  // Si ya tenemos un proyecto válido, lo retornamos
  if (projectId) return projectId;

  // AUTO-DETECCIÓN Y AUTO-CREACIÓN DE PROYECTO (CERO PASOS MANUALES)
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
      return match.projectId;
    }

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

    return uniqueId;
  } catch (err) {
    console.warn(`[Firebase Auto Warning] Falló la auto-resolución/creación: ${err.message}. Usando fallback.`);
  }

  return clientId;
}

// Helper para buscar el directorio del proyecto del cliente
async function findProjectDir(clientId) {
  const baseAppsDir = getWorkspaceRoot();
  if (!await fs.pathExists(baseAppsDir)) return null;

  try {
    const items = await fs.readdir(baseAppsDir);
    for (const item of items) {
      const fullPath = path.join(baseAppsDir, item);
      try {
        const stat = await fs.stat(fullPath);
        if (!stat.isDirectory()) continue;

        const pkgPath = path.join(fullPath, 'package.json');
        if (await fs.pathExists(pkgPath)) {
          const pkg = await fs.readJson(pkgPath);
          const pkgName = pkg.name || '';
          if (
            pkgName.toLowerCase() === clientId.toLowerCase() || 
            item.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clientId.toLowerCase()
          ) {
            return fullPath;
          }
        }
      } catch (_) {}
    }
  } catch (_) {}

  const knownMappings = [
    { keys: ['ventas', 'smartfix'],              folder: 'App Ventas' },
    { keys: ['dev-dashboard', 'control'],         folder: 'dev-dashboard' },
    { keys: ['servicios'],                        folder: 'App Servicios' },
    { keys: ['agendamiento', 'barberia'],         folder: 'App Agendamiento' },
    { keys: ['gastronomia', 'restaurante'],       folder: 'App Gastronomia' }
  ];
  for (const mapping of knownMappings) {
    if (mapping.keys.some(k => clientId.includes(k))) {
      let candidate = path.join(baseAppsDir, mapping.folder);
      if (fs.existsSync(candidate)) return candidate;
      candidate = path.join(path.dirname(baseAppsDir), 'Plantillas Core', mapping.folder);
      if (fs.existsSync(candidate)) return candidate;
      candidate = path.join('D:\\Aplicaciones', mapping.folder);
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
    let content = '';
    Object.entries(variables).forEach(([key, val]) => {
      content += `${key}=${val}\n`;
    });
    await fs.writeFile(envPath, content, 'utf-8');
    res.json({ success: true, message: 'Variables de entorno actualizadas en .env.local con éxito.' });
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
  const { clientId } = req.body;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: 'Proyecto no encontrado.' });

  const rulesDest = path.join(projectDir, 'firestore.rules');
  const rulesSrc = path.join(path.dirname(projectDir), 'App Ventas', 'firestore.rules');

  try {
    let sourcePath = rulesSrc;
    if (!await fs.pathExists(sourcePath)) {
      sourcePath = path.join(getWorkspaceRoot(), 'Prototipe-CLI', 'templates', 'template-ventas', 'firestore.rules');
    }

    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, rulesDest);
      return res.json({ success: true, message: 'Se ha restablecido firestore.rules con la plantilla segura del estándar.' });
    } else {
      return res.status(404).json({ error: 'No se encontró la plantilla de reglas origen para copiar.' });
    }
  } catch (err) {
    res.status(500).json({ error: `Fallo al restaurar reglas de seguridad: ${err.message}` });
  }
});

// Helper para escanear directorios recursivamente para el Drift Detector
async function getFilesRecursively(dir, ignorePaths = [], baseDir = dir) {
  let results = [];
  if (!await fs.pathExists(dir)) return results;
  const list = await fs.readdir(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    const relative = path.relative(baseDir, filePath);
    
    // Omitir directorios y archivos excluidos
    if (
      file === 'node_modules' || 
      file === '.git' || 
      file === 'dist' || 
      file === '.env.local' || 
      file === '.vite' || 
      file === '.firebase' || 
      file === '.prototipe.json' ||
      file === 'cli_bridge.log' ||
      file.endsWith('.bak')
    ) {
      continue;
    }
    
    if (stat.isDirectory()) {
      results = results.concat(await getFilesRecursively(filePath, ignorePaths, baseDir));
    } else {
      results.push({
        absolutePath: filePath,
        relativePath: relative.replace(/\\/g, '/'),
        size: stat.size
      });
    }
  }
  return results;
}

// Endpoint para calcular desviaciones físicas (Drift Detector) respecto al Core
app.get('/api/project/drift', async (req, res) => {
  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });

  try {
    const metaPath = path.join(projectDir, '.prototipe.json');
    const meta = await fs.pathExists(metaPath) ? await fs.readJson(metaPath) : {};
    let coreId = meta.templateId || meta.coreClave || meta.coreId;

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
        const coreContent = await fs.readFile(coreFile.absolutePath, 'utf-8');
        const clientContent = await fs.readFile(clientFile.absolutePath, 'utf-8');
        
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

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });

  try {
    const metaPath = path.join(projectDir, '.prototipe.json');
    const meta = await fs.pathExists(metaPath) ? await fs.readJson(metaPath) : {};
    let coreId = meta.templateId || meta.coreClave || meta.coreId;

    if (!coreId) {
      if (clientId.toLowerCase().includes('venta')) coreId = 'ventas';
      else if (clientId.toLowerCase().includes('servicio')) coreId = 'servicios';
      else if (clientId.toLowerCase().includes('agendamiento') || clientId.toLowerCase().includes('barber')) coreId = 'agendamiento';
      else if (clientId.toLowerCase().includes('gastronomia') || clientId.toLowerCase().includes('restaurante')) coreId = 'gastronomia';
    }

    const coreDir = await findProjectDir(coreId);
    if (!coreDir) {
      return res.status(404).json({ error: 'Core de referencia no encontrado.' });
    }

    const srcPath = path.join(coreDir, file);
    const destPath = path.join(projectDir, file);

    if (!await fs.pathExists(srcPath)) {
      return res.status(404).json({ error: `El archivo de origen no existe en el Core: ${file}` });
    }

    await fs.ensureDir(path.dirname(destPath));
    await fs.copy(srcPath, destPath);

    res.json({ success: true, message: `Archivo ${file} sincronizado exitosamente con el Core.` });
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
    let coreId = meta.templateId || meta.coreClave || meta.coreId;

    if (!coreId) {
      if (clientId.toLowerCase().includes('venta')) coreId = 'ventas';
      else if (clientId.toLowerCase().includes('servicio')) coreId = 'servicios';
      else if (clientId.toLowerCase().includes('agendamiento') || clientId.toLowerCase().includes('barber')) coreId = 'agendamiento';
      else if (clientId.toLowerCase().includes('gastronomia') || clientId.toLowerCase().includes('restaurante')) coreId = 'gastronomia';
    }

    const coreDir = await findProjectDir(coreId);
    if (!coreDir) {
      return res.status(404).json({ error: 'Core de referencia no encontrado.' });
    }

    const results = [];
    for (const file of files) {
      const srcPath = path.join(coreDir, file);
      const destPath = path.join(projectDir, file);

      if (await fs.pathExists(srcPath)) {
        await fs.ensureDir(path.dirname(destPath));
        await fs.copy(srcPath, destPath);
        results.push({ file, success: true });
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
    const dirs = await fs.readdir(GIT_INSTANCES_DIR);
    const results = [];

    await Promise.all(dirs.map(async (dir) => {
      const fullPath = path.join(GIT_INSTANCES_DIR, dir);
      const stat = await fs.stat(fullPath).catch(() => null);
      if (!stat || !stat.isDirectory()) return;

      const clientId = dir.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const metaPath = path.join(fullPath, '.prototipe.json');
      const meta = await fs.pathExists(metaPath) ? await fs.readJson(metaPath) : {};
      let coreId = meta.templateId || meta.coreClave || meta.coreId;

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
          projectName: dir,
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
  const { clientId, file, all } = req.body;
  if (!clientId) return res.status(400).json({ error: 'El parámetro "clientId" es obligatorio.' });

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });

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
  const { clientId, file } = req.query;
  if (!clientId || !file) {
    return res.status(400).json({ error: 'Los parámetros "clientId" y "file" son obligatorios.' });
  }

  const projectDir = await findProjectDir(clientId);
  if (!projectDir) return res.status(404).json({ error: `No se encontró el proyecto para: ${clientId}` });

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
const GIT_ROOT         = 'D:\\PROTOTIPE';
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
  const gitFolder = await getGitDirName(dir);
  const env = { ...process.env };
  if (gitFolder) {
    env.GIT_DIR = path.join(dir, gitFolder);
    env.GIT_WORK_TREE = dir;
  }
  return execAsync(cmd, { cwd: dir, env, timeout: 10000 });
}

async function getGitBranch(dir) {
  try {
    const { stdout } = await execGitCommand('git rev-parse --abbrev-ref HEAD', dir);
    return stdout.trim();
  } catch (_) { return null; }
}

// Detecta si un directorio tiene o está dentro de un repo git aislado
async function isInsideGitRepo(dir) {
  try {
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
        const hasGit = await isInsideGitRepo(fullPath);
        const branch = hasGit ? await getGitBranch(fullPath) : null;
        const hasChanges = hasGit ? await hasGitChanges(fullPath) : false;
        if (hasChanges) instancesChanges = true;
        targets.instances.push({ name: dir, path: fullPath, hasGit, branch, hasChanges });
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
  const resolvedPath = path.resolve(targetPath);
  if (resolvedPath !== GIT_ROOT && !resolvedPath.startsWith(GIT_ROOT + path.sep)) {
    return res.status(403).json({ error: 'Ruta fuera del ecosistema PROTOTIPE. Acceso denegado.' });
  }
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

    res.json({ success: true, branch, changes, envLeak, envLeakFiles });
  } catch (err) {
    console.error('[API /git/status] Error:', err.message);
    res.status(500).json({ error: `Error al leer estado Git: ${err.message}` });
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
  const resolvedPath = path.resolve(targetPath);
  if (resolvedPath !== GIT_ROOT && !resolvedPath.startsWith(GIT_ROOT + path.sep)) {
    return res.status(403).json({ error: 'Ruta fuera del ecosistema PROTOTIPE. Acceso denegado.' });
  }
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
    if (!ps.killed) ps.kill();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 [Prototipe CLI Bridge] Servidor local escuchando en: http://127.0.0.1:${PORT}`);
  console.log(`Endpoints activos:`);
  console.log(` - GET  http://localhost:${PORT}/api/templates`);
  console.log(` - GET  http://localhost:${PORT}/api/firebase-config?projectId=[id]&projectName=[name]`);
  console.log(` - POST http://localhost:${PORT}/api/create-project                 → Aprovisionamiento (SSE Logs)`);
  console.log(` - GET  http://localhost:${PORT}/api/library`);
  console.log(` - POST http://localhost:${PORT}/api/library/extract                 → Extracción de componentes`);
  console.log(` - GET  http://localhost:${PORT}/api/project/file`);
  console.log(` - POST http://localhost:${PORT}/api/project/deploy                  → Compilar y desplegar (SSE Logs)`);
  console.log(` - GET  http://localhost:${PORT}/api/project/env                     → Leer variables .env.local`);
  console.log(` - POST http://localhost:${PORT}/api/project/env                     → Escribir variables .env.local`);
  console.log(` - GET  http://localhost:${PORT}/api/project/audit                   → Auditoría física y PWA`);
  console.log(` - POST http://localhost:${PORT}/api/e2e/run                         → Ejecutar tests (SSE Logs)`);
  console.log(` - GET  http://localhost:${PORT}/api/e2e/last-result?projectId=[id]`);
  console.log(` `);
  console.log(` 🔒 Control de Versiones Git:`);
  console.log(` - GET  http://localhost:${PORT}/api/git/targets                     → Auto-detectar repositorios`);
  console.log(` - GET  http://localhost:${PORT}/api/git/status?path=[ruta]          → Estado de cambios`);
  console.log(` - GET  http://localhost:${PORT}/api/git/backup-stream?path=[ruta]   → Backup SSE en vivo`);
  console.log(` `);
  console.log(` 🏗️  Gestión de Plantillas Core:`);
  console.log(` - POST http://localhost:${PORT}/api/register-core              → Registrar nueva plantilla`);
  console.log(` - GET  http://localhost:${PORT}/api/cores                      → Listar todas las plantillas`);
  console.log(` - POST http://localhost:${PORT}/api/cores/:clave/scaffold      → Copiar código base de otro core`);
  console.log(` - POST http://localhost:${PORT}/api/cores/:clave/activate      → Sincronizar y activar en wizard`);
  console.log(` - POST http://localhost:${PORT}/api/cores/:clave/deactivate    → Retirar del wizard\n`);
});



