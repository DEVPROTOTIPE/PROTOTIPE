import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn, fork } from 'child_process';
import { promisify } from 'util';
// createProject se ejecuta en un proceso hijo (worker_create_project.js)
// para no bloquear el Event Loop de Express con sus execSync internos.
import { getWorkspaceRoot, getDocumentationRoot } from './config.js';
import { logger } from './logger.js';

const execAsync = promisify(exec);

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

    console.log(`[API] Credenciales auto-detectadas para proyecto: ${pid}`);
    res.json({
      success: true,
      config: { apiKey, authDomain, projectId: pid, storageBucket, messagingSenderId, appId, measurementId: measurementId || null }
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

// Endpoint para crear el proyecto físicamente
app.post('/api/create-project', async (req, res) => {
  const answers = req.body;
  
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
      answers.firebaseVapidKey = answers.firebaseVapidKey || '';

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

  // ─── Aprovisionamiento en proceso hijo (no bloquea el Event Loop) ─────────────
  try {
    const result = await runCreateProjectWorker(answers);
    console.log(`[API Bridge] Proyecto '${answers.projectName}' creado con éxito en: ${result.targetDir}\n`);
    res.json({
      success: true,
      message: 'Proyecto creado físicamente con éxito.',
      data: result
    });
  } catch (err) {
    console.error(`[API Bridge] Error durante la creación: ${err.message}`);
    res.status(500).json({ error: `Error en el aprovisionamiento local: ${err.message}` });
  }
});

/**
 * Lanza worker_create_project.js como proceso hijo y espera su resultado.
 * Resuelve con el objeto `data` en caso de éxito o rechaza con el mensaje de error.
 * @param {Object} answers Payload completo de aprovisionamiento
 * @returns {Promise<Object>}
 */
function runCreateProjectWorker(answers) {
  return new Promise((resolve, reject) => {
    const child = fork(WORKER_PATH, [], {
      // El worker hereda el env del padre (incluye PROTOTIPE_WORKSPACE_ROOT, etc.)
      env: { ...process.env },
      // Silenciar stdio del hijo en el padre; el hijo imprime directamente a consola
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
        const isModule = folder.includes('10_Modulos_Completos') || catName.toLowerCase().includes('módulo') || catName.toLowerCase().includes('modulo') || line.includes('📦');
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
    const baseAppsDir = getWorkspaceRoot();
    if (!await fs.pathExists(baseAppsDir)) {
      return res.status(500).json({ error: 'El directorio de aplicaciones no existe.' });
    }

    const items = await fs.readdir(baseAppsDir);
    let targetProjectDir = null;

    // 1. Intentar buscar por nombre de carpeta o package.json
    for (const item of items) {
      const fullPath = path.join(baseAppsDir, item);
      const isDir = (await fs.stat(fullPath)).isDirectory();
      if (!isDir) continue;

      const pkgPath = path.join(fullPath, 'package.json');
      if (await fs.pathExists(pkgPath)) {
        try {
          const pkg = await fs.readJson(pkgPath);
          const pkgName = pkg.name || '';
          if (
            pkgName.toLowerCase() === clientId.toLowerCase() || 
            item.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clientId.toLowerCase()
          ) {
            targetProjectDir = fullPath;
            break;
          }
        } catch (pkgErr) {
          // Ignorar errores de package.json malformados
        }
      }
    }

    // 2. Fallbacks de mapeo directo — busca subcarpetas que contengan el clientId
    if (!targetProjectDir) {
      const knownMappings = [
        { keys: ['ventas', 'smartfix'],              folder: 'App Ventas' },
        { keys: ['dev-dashboard', 'control'],         folder: 'dev-dashboard' },
        { keys: ['servicios'],                        folder: 'App Servicios' },
        { keys: ['agendamiento', 'barberia'],         folder: 'App Agendamiento' },
        { keys: ['gastronomia', 'restaurante'],       folder: 'App Gastronomia' }
      ];
      for (const mapping of knownMappings) {
        if (mapping.keys.some(k => clientId.includes(k))) {
          // 1. Buscar en la raíz del Workspace
          let candidate = path.join(baseAppsDir, mapping.folder);
          if (fs.existsSync(candidate)) {
            targetProjectDir = candidate;
            break;
          }
          // 2. Buscar en Plantillas Core
          candidate = path.join(baseAppsDir, 'Plantillas Core', mapping.folder);
          if (fs.existsSync(candidate)) {
            targetProjectDir = candidate;
            break;
          }
          // 3. Buscar en legacy D:\Aplicaciones
          candidate = path.join('D:\\Aplicaciones', mapping.folder);
          if (fs.existsSync(candidate)) {
            targetProjectDir = candidate;
            break;
          }
          // Fallback por defecto
          targetProjectDir = path.join(baseAppsDir, mapping.folder);
          break;
        }
      }
    }

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

    const filePath = path.resolve(targetProjectDir, cleanRelativePath);

    // 4. Validación de seguridad contra directory traversal
    if (!filePath.toLowerCase().startsWith(targetProjectDir.toLowerCase() + path.sep)) {
      return res.status(403).json({ error: 'Acceso denegado. La ruta está fuera del proyecto.' });
    }

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: `El archivo no existe en la ruta física: ${filePath}` });
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
  const BASE_DIR = getWorkspaceRoot();
  try {
    const items = await fs.readdir(BASE_DIR);
    const projects = [];

    for (const item of items) {
      const fullPath = path.join(BASE_DIR, item);
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

        projects.push({ id, label: label.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), path: fullPath });
      } catch {}
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

  child.on('close', (code, signal) => {
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
    console.log(`[E2E] req.close. testFinished=${testFinished}, pid=${child.pid}, killed=${child.killed}`);
    // Si los tests ya terminaron, no hacer nada.
    // Si el cliente realmente se desconectó DESPUÉS de 30s sin resultado, entonces matar.
    if (!testFinished) {
      setTimeout(() => {
        if (!testFinished && !child.killed) {
          console.log(`[E2E] Timeout de seguridad: matando proceso hijo tras 120s sin resultado.`);
          child.kill('SIGTERM');
        }
      }, 120000); // 2 minutos de timeout de seguridad
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
  const corePath = path.join(WORKSPACE_ROOT, 'Plantillas Core', coreName);
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

    const geminiSource = path.join(WORKSPACE_ROOT, 'Documentacion PROTOTIPE', '04_Estandares_y_Skills', 'Copia_Seguridad_Reglas_y_Skills', 'GEMINI.md');
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
      { name: 'mapa_aplicacion.md',       content: `# 🗺️ Mapa de la Aplicación — ${coreName}\n\n> Actualiza este documento cuando definas módulos, rutas o vistas.\n\n## Rutas y Vistas\n*(Por definir)*\n\n## Módulos de Negocio\n*(Por definir)*\n` },
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
      fuente: `${WORKSPACE_ROOT.replace(/\\/g, '/')}/Plantillas Core/${coreName}`,
      destino: `${WORKSPACE_ROOT.replace(/\\/g, '/')}/Prototipe-CLI/templates/template-${safeClave}`,
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

app.listen(PORT, () => {
  console.log(`\n🚀 [Prototipe CLI Bridge] Servidor local escuchando en: http://localhost:${PORT}`);
  console.log(`Endpoints activos:`);
  console.log(` - GET  http://localhost:${PORT}/api/templates`);
  console.log(` - GET  http://localhost:${PORT}/api/firebase-config?projectId=[id]&projectName=[name]`);
  console.log(` - POST http://localhost:${PORT}/api/create-project`);
  console.log(` - GET  http://localhost:${PORT}/api/library`);
  console.log(` - GET  http://localhost:${PORT}/api/project/file`);
  console.log(` - POST http://localhost:${PORT}/api/e2e/run`);
  console.log(` - GET  http://localhost:${PORT}/api/e2e/last-result?projectId=[id]`);
  console.log(` `);
  console.log(` 🏗️  Gestión de Plantillas Core:`);
  console.log(` - POST http://localhost:${PORT}/api/register-core              → Registrar nueva plantilla`);
  console.log(` - GET  http://localhost:${PORT}/api/cores                      → Listar todas las plantillas`);
  console.log(` - POST http://localhost:${PORT}/api/cores/:clave/scaffold      → Copiar código base de otro core`);
  console.log(` - POST http://localhost:${PORT}/api/cores/:clave/activate      → Sincronizar y activar en wizard`);
  console.log(` - POST http://localhost:${PORT}/api/cores/:clave/deactivate    → Retirar del wizard\n`);
});



