import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, 'notification_config.json');

const logFilePath = path.join(__dirname, 'notification_server.log');
function writeToLogFile(level, args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => {
    if (arg instanceof Error) return arg.stack || arg.message;
    if (typeof arg === 'object') {
      try { return JSON.stringify(arg); } catch (_) { return String(arg); }
    }
    return String(arg);
  }).join(' ');
  const logLine = `[${timestamp}] [${level}] ${message}\n`;
  try {
    fs.appendFileSync(logFilePath, logLine, 'utf8');
  } catch (_) {}
}

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  originalLog(...args);
  writeToLogFile('INFO', args);
};
console.error = (...args) => {
  originalError(...args);
  writeToLogFile('ERROR', args);
};
console.warn = (...args) => {
  originalWarn(...args);
  writeToLogFile('WARN', args);
};

// Manejo global de excepciones para evitar caídas del proceso hijo
process.on('uncaughtException', (err) => {
  console.error('[Notify Service] Error no capturado (uncaughtException):', err.message || err);
  if (err.stack) console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Notify Service] Promesa rechazada no manejada (unhandledRejection):', reason?.message || reason);
  if (reason?.stack) console.error(reason.stack);
});

// Caché de configuración en memoria con valores por defecto
let systemConfig = {
  alertsEnabled: false,
  telegramToken: '',
  telegramChatId: '',
  discordWebhookUrl: ''
};

// Cargar configuración guardada localmente si existe
if (fs.existsSync(configPath)) {
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    systemConfig = JSON.parse(raw);
    console.log('[Notify Service] Configuración local cargada desde notification_config.json.');
  } catch (err) {
    console.warn('[Notify Service] Error al leer notification_config.json, se usarán valores por defecto:', err.message);
  }
}

// ─── Cargar variables de entorno de Firebase ───
const GIT_ROOT = path.resolve(__dirname, '..');
const devEnvPath = path.join(GIT_ROOT, 'Central PROTOTIPE', 'dev-dashboard', '.env.local');

if (fs.existsSync(devEnvPath)) {
  const content = fs.readFileSync(devEnvPath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  });
  console.log('[Notify Service] Variables de entorno de Firebase cargadas.');
} else {
  console.warn('[Notify Service] Archivo .env.local de dev-dashboard no encontrado.');
}

// ─── Escuchar Mensajes IPC del Proceso Padre ───
process.on('message', (msg) => {
  if (msg && msg.type === 'config') {
    systemConfig = { ...systemConfig, ...msg.data };
    try {
      fs.writeFileSync(configPath, JSON.stringify(systemConfig, null, 2), 'utf8');
      console.log('[Notify Service] Configuración sincronizada vía IPC y guardada localmente.');
    } catch (err) {
      console.error('[Notify Service] Fallo al escribir notification_config.json:', err.message);
    }
  }
});

// Escapa caracteres especiales HTML para textos de usuario antes de insertar en mensajes con parse_mode HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Helper para enviar alertas a Telegram (Raw)
// Si Telegram devuelve un error 400 de parseo HTML, reintenta en modo texto plano
async function sendTelegramMessage(token, chatId, text, replyMarkup = null) {
  if (!token || !chatId) return;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }
  let response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload)
  });

  // Fallback: si el HTML está mal formado (400), reenviar en texto plano sin parse_mode
  if (!response.ok) {
    const rawBody = await response.text().catch(() => '');
    let errData = {};
    try {
      errData = JSON.parse(rawBody);
    } catch (_) {
      errData = { description: rawBody || String(response.status) };
    }

    const isHtmlError = response.status === 400 &&
      (errData.description?.includes('parse') || errData.description?.includes('HTML') || errData.description?.includes('entities'));
    
    if (isHtmlError) {
      console.warn('[Telegram] HTML parse error — reintentando en modo texto plano:', errData.description?.slice(0, 120));
      // Limpiar etiquetas HTML del texto para el fallback
      const plainText = text
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
      const plainPayload = { chat_id: chatId, text: plainText };
      if (replyMarkup) plainPayload.reply_markup = replyMarkup;
      
      const retryResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(plainPayload)
      });

      if (!retryResponse.ok) {
        const retryBody = await retryResponse.text().catch(() => String(retryResponse.status));
        throw new Error(`Telegram (${retryResponse.status}): ${retryBody}`);
      }
    } else {
      throw new Error(`Telegram (${response.status}): ${rawBody}`);
    }
  }
}

// Helper para enviar alertas a Discord (Raw)
async function sendDiscordMessage(webhookUrl, content) {
  if (!webhookUrl) return;
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    throw new Error(`Discord (${response.status})`);
  }
}

let lastConfigReadTime = 0;
function getSystemConfig() {
  const now = Date.now();
  if (now - lastConfigReadTime > 2000) {
    if (fs.existsSync(configPath)) {
      try {
        const raw = fs.readFileSync(configPath, 'utf8');
        systemConfig = JSON.parse(raw);
        lastConfigReadTime = now;
      } catch (_) {}
    }
  }
  return systemConfig;
}

// Helper para obtener configuración específica de un canal con fallback general
function getChannelConfig(channelName) {
  const config = getSystemConfig();
  const channel = config.channels?.[channelName] || {};
  const hasChannelCreds = !!(channel.telegramToken || channel.discordWebhookUrl);
  
  return {
    telegramToken: (hasChannelCreds ? channel.telegramToken : config.telegramToken) || '',
    telegramChatId: (hasChannelCreds ? channel.telegramChatId : config.telegramChatId) || '',
    discordWebhookUrl: (hasChannelCreds ? channel.discordWebhookUrl : config.discordWebhookUrl) || '',
    enabled: config.alertsEnabled && (channel.enabled !== false)
  };
}

// ─── Control de Acceso: Whitelist de Chat IDs ───
// Si no hay allowedChatIds configurados → modo abierto (retrocompatible).
function isAuthorized(chatId, command) {
  const config = getSystemConfig();
  const auth = config.auth || {};
  const allowed = (auth.allowedChatIds || []).map(Number);
  const admins  = (auth.adminChatIds  || []).map(Number);
  const adminCmds = auth.requireAdminCommands || [
    '/deploy', '/maintenance_set', '/rules', '/integrity_autofix',
    '/devserver stop', '/git push', '/cores sync', '/fix'
  ];

  if (allowed.length === 0) return { ok: true };

  const numId = Number(chatId);

  // Admitir temporalmente deep-links privados si provienen de un grupo autorizado
  if (command && command.startsWith('/start ')) {
    const payload = command.split(' ')[1] || '';
    if (payload.startsWith('addtask_') || payload.startsWith('searchtasks_')) {
      const groupChatId = Number(payload.split('_')[1]);
      if (groupChatId && allowed.includes(groupChatId)) {
        return { ok: true };
      }
    }
  }

  // Permitir la interacción si el usuario se encuentra en un estado conversacional activo
  if (userStates[numId]) {
    return { ok: true };
  }

  if (!allowed.includes(numId)) return { ok: false, reason: 'not_allowed' };

  const needsAdmin = adminCmds.some(c => (command || '').startsWith(c));
  if (needsAdmin && !admins.includes(numId)) return { ok: false, reason: 'not_admin' };

  return { ok: true };
}

// ─── Funciones de Despacho de Notificaciones Formateadas ───

function dispatchCrashAlert(data) {
  const { clientId, componentName, errorMessage, errorMsg, stackTrace, stack, severity, errorLine } = data;
  const channelConfig = getChannelConfig('crashes');
  if (!channelConfig.enabled) return;

  const finalMessage = errorMsg || errorMessage || 'Sin mensaje de error';
  const finalStack = stack || stackTrace;
  const level = severity || data.type || 'error';

  let emoji = '🚨';
  if (level === 'warning') emoji = '⚠️';
  if (level === 'info') emoji = 'ℹ️';

  const tgText = `${emoji} <b>Fallo Crítico en Instancia</b>\n` +
                 `----------------------------------\n` +
                 `🏢 <b>Cliente:</b> <code>${clientId}</code>\n` +
                 `📄 <b>Ubicación:</b> <code>${componentName || 'General'}${errorLine ? ` : L${errorLine}` : ''}</code>\n` +
                 `💬 <b>Mensaje:</b> <code>${finalMessage}</code>\n` +
                 (finalStack ? `\n🔍 <b>Stack Trace:</b>\n<pre>${finalStack.slice(0, 300)}...</pre>\n` : '') +
                 `----------------------------------\n` +
                 `🔗 <a href="http://localhost:5174/admin/incidents">Abrir Consola de Errores</a>`;

  sendTelegramMessage(channelConfig.telegramToken, channelConfig.telegramChatId, tgText).catch(() => {});
  sendDiscordMessage(channelConfig.discordWebhookUrl, `${emoji} **Fallo Crítico en Instancia**\n**Cliente:** \`${clientId}\`\n**Ubicación:** \`${componentName || 'General'}${errorLine ? ` : L${errorLine}` : ''}\`\n**Mensaje:** \`${finalMessage}\``).catch(() => {});
}

function dispatchBriefingAlert(data) {
  const { nombreEmpresa, coreKey, form, analysisResult } = data;
  const channelConfig = getChannelConfig('briefings');
  if (!channelConfig.enabled) return;

  const niche = form?.seccion1?.nicho || form?.nicho || 'General';
  const score = analysisResult?.scoreComplejidad || analysisResult?.complejidadScore || analysisResult?.score || 'N/A';
  const components = analysisResult?.componentesRecomendados || analysisResult?.inyecciones || [];
  const pricing = analysisResult?.cotizacionSugerida || analysisResult?.cotizacion || analysisResult?.precioSugerido || 'Consultar Cotizador';

  const componentsText = Array.isArray(components) && components.length > 0
    ? components.slice(0, 4).map(c => `• ${c.nombre || c}`).join('\n')
    : 'Ninguno detectado';

  const tgText = `📝 <b>Registro de Preventa (Briefing Studio)</b>\n` +
                 `----------------------------------\n` +
                 `👤 <b>Empresa:</b> <code>${nombreEmpresa}</code>\n` +
                 `🛍️ <b>Nicho:</b> <code>${niche}</code> (Core: <code>${coreKey}</code>)\n` +
                 `📐 <b>Complejidad:</b> <code>${score} pts</code>\n` +
                 `💰 <b>Cotización Sugerida:</b> <code>${pricing}</code>\n` +
                 `📦 <b>Componentes Recomendados:</b>\n<pre>${componentsText}</pre>\n` +
                 `----------------------------------\n` +
                 `🔗 <a href="http://localhost:5174/admin/briefing">Ver Ficha de Preventa</a>`;

  sendTelegramMessage(channelConfig.telegramToken, channelConfig.telegramChatId, tgText).catch(() => {});
  sendDiscordMessage(channelConfig.discordWebhookUrl, `📝 **Registro de Preventa (Briefing Studio)**\n**Empresa:** \`${nombreEmpresa}\`\n**Nicho:** \`${niche}\` (Core: \`${coreKey}\`)\n**Complejidad:** \`${score} pts\`\n**Cotización:** \`${pricing}\``).catch(() => {});
}

function dispatchBillingReportAlert(data) {
  const { clientId, periodo, totalComisiones, totalFacturado, status } = data;
  const channelConfig = getChannelConfig('billing');
  if (!channelConfig.enabled) return;

  const tgText = `💵 <b>Cierre de Periodo (SaaS Billing)</b>\n` +
                 `----------------------------------\n` +
                 `🏢 <b>Cliente:</b> <code>${clientId}</code>\n` +
                 `📅 <b>Periodo:</b> <code>${periodo || 'Mensual'}</code>\n` +
                 `💰 <b>Total Comisiones:</b> <code>$ ${totalComisiones || totalFacturado || '0.00'}</code>\n` +
                 `📌 <b>Estado:</b> <code>${status || 'Pendiente'}</code>\n` +
                 `----------------------------------\n` +
                 `🔗 <a href="http://localhost:5174/admin/billing">Ver Facturación Central</a>`;

  sendTelegramMessage(channelConfig.telegramToken, channelConfig.telegramChatId, tgText).catch(() => {});
  sendDiscordMessage(channelConfig.discordWebhookUrl, `💵 **Cierre de Periodo (SaaS Billing)**\n**Cliente:** \`${clientId}\`\n**Periodo:** \`${periodo || 'Mensual'}\`\n**Total Comisiones:** \`$ ${totalComisiones || '0.00'}\`\n**Estado:** \`${status || 'Pendiente'}\``).catch(() => {});
}

function dispatchBillingMoraAlert(data) {
  const { clientId, periodo, totalComisiones, status } = data;
  const channelConfig = getChannelConfig('billing');
  if (!channelConfig.enabled) return;

  const tgText = `⚠️ <b>Mora de Pago Detectada</b>\n` +
                 `----------------------------------\n` +
                 `🏢 <b>Cliente:</b> <code>${clientId}</code>\n` +
                 `📅 <b>Periodo:</b> <code>${periodo}</code>\n` +
                 `💰 <b>Comisiones Pendientes:</b> <code>$ ${totalComisiones}</code>\n` +
                 `🚨 <b>Estado:</b> <code>${status === 'limite_suspension' ? 'Riesgo de Suspensión' : 'En Mora'}</code>\n` +
                 `----------------------------------\n` +
                 `🔗 <a href="http://localhost:5174/admin/billing">Abrir Facturación</a>`;

  sendTelegramMessage(channelConfig.telegramToken, channelConfig.telegramChatId, tgText).catch(() => {});
  sendDiscordMessage(channelConfig.discordWebhookUrl, `⚠️ **Mora de Pago Detectada**\n**Cliente:** \`${clientId}\`\n**Periodo:** \`${periodo}\`\n**Monto:** \`$ ${totalComisiones}\`\n**Estado:** \`${status === 'limite_suspension' ? 'Límite de Suspensión' : 'En Mora'}\``).catch(() => {});
}

// ─── MÓDULO DE ACCESO OAUTH2 FIREBASE CLI Y REST CLIENT ───

async function getFirebaseAccessToken() {
  const homedir = os.homedir();
  const possiblePaths = [
    path.join(homedir, '.config', 'configstore', 'firebase-tools.json'),
    path.join(process.env.APPDATA || '', 'configstore', 'firebase-tools.json')
  ];

  let configPath = null;
  let config = null;

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        configPath = p;
        config = JSON.parse(fs.readFileSync(p, 'utf8'));
        break;
      } catch (_) {}
    }
  }

  if (!config || !config.tokens) {
    throw new Error('No se encontró la sesión activa de Firebase CLI. Ejecuta "firebase login".');
  }

  const tokens = config.tokens;

  // Si el access_token no ha expirado, usarlo directamente
  if (tokens.access_token && tokens.expires_at && tokens.expires_at > Date.now()) {
    return tokens.access_token;
  }

  // Refrescar el token usando OAuth2
  const clientId = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
  const clientSecret = 'j9iVZfS8kkCEFUPaAeJV0sAi';
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokens.refresh_token
      })
    });
    const data = await res.json();
    if (data.access_token) {
      tokens.access_token = data.access_token;
      tokens.expires_at = Date.now() + (data.expires_in * 1000) - 60000;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
      return data.access_token;
    }
  } catch (err) {
    console.error('[Notify Service] Error al refrescar token de Firebase:', err.message);
  }

  if (tokens.access_token) {
    return tokens.access_token;
  }
  throw new Error('No se pudo refrescar el token de Firebase.');
}

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

function parseFirestoreValue(val) {
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('timestampValue' in val) {
    const ms = Date.parse(val.timestampValue);
    return {
      toMillis: () => ms,
      toDate: () => new Date(ms),
      seconds: Math.floor(ms / 1000)
    };
  }
  if ('arrayValue' in val) {
    const values = val.arrayValue.values || [];
    return values.map(v => parseFirestoreValue(v));
  }
  if ('mapValue' in val) {
    const fields = val.mapValue.fields || {};
    const obj = {};
    for (const key of Object.keys(fields)) {
      obj[key] = parseFirestoreValue(fields[key]);
    }
    return obj;
  }
  if ('nullValue' in val) return null;
  return undefined;
}

function parseFirestoreDocument(doc) {
  const fields = doc.fields || {};
  const data = {};
  const parts = doc.name.split('/');
  data.id = parts[parts.length - 1];

  for (const key of Object.keys(fields)) {
    data[key] = parseFirestoreValue(fields[key]);
  }
  return data;
}

async function queryCollectionREST(collectionName, orderByField, limitCount = 5) {
  try {
    const token = await getFirebaseAccessToken();
    const projectId = process.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID || 'prototipe-ecosistema-control';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: collectionName }],
          orderBy: [{ field: { fieldPath: orderByField }, direction: 'DESCENDING' }],
          limit: limitCount
        }
      })
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`REST Error (${response.status}): ${txt}`);
    }

    const results = await response.json();
    const parsedDocs = [];
    for (const r of results) {
      if (r.document) {
        parsedDocs.push(parseFirestoreDocument(r.document));
      }
    }
    return parsedDocs;
  } catch (err) {
    console.error(`[Notify Service] Error en queryCollectionREST para ${collectionName}:`, err.message);
    return [];
  }
}

async function writeDocumentREST(collectionName, documentId, jsObject) {
  try {
    const token = await getFirebaseAccessToken();
    const projectId = process.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID || 'prototipe-ecosistema-control';
    
    const fields = {};
    for (const [k, v] of Object.entries(jsObject)) {
      if (k === 'id') continue;
      if (v instanceof Date) {
        fields[k] = { timestampValue: v.toISOString() };
      } else {
        fields[k] = convertToFirestoreValue(v);
      }
    }

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${documentId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    });

    if (!response.ok) {
      const txt = await response.text();
      console.warn(`[Notify Service] Error al actualizar health check en Firestore REST (${documentId}):`, txt);
    }
  } catch (err) {
    console.error(`[Notify Service] Error al escribir documento REST:`, err.message);
  }
}

// ─── Motor de Polling de Firestore Central (Bypass de Reglas con CLI Session) ───

const startupTime = Date.now();
const processedDocIds = new Set();

async function pollCollections() {
  try {
    // 1. Telemetría de Crashes
    const failures = await queryCollectionREST('app_failures', 'timestamp', 5);
    for (const f of failures) {
      if (!processedDocIds.has(f.id)) {
        processedDocIds.add(f.id);
        const timestamp = f.timestamp ? Date.parse(f.timestamp) : Date.now();
        if (timestamp > startupTime - 15000) {
          dispatchCrashAlert(f);
        }
      }
    }

    // 2. Briefing Studio (Preventa)
    const briefings = await queryCollectionREST('briefings', 'fecha', 5);
    for (const b of briefings) {
      if (!processedDocIds.has(b.id)) {
        processedDocIds.add(b.id);
        const timestamp = b.fecha?.toMillis() || (b.fecha ? Date.parse(b.fecha) : Date.now());
        if (timestamp > startupTime - 15000) {
          if (b.status === 'completed' || b.finalizado || b.progreso === 100) {
            dispatchBriefingAlert(b);
          }
        }
      }
    }

    // 3. Billing SaaS (Comisiones)
    const bills = await queryCollectionREST('reportesBilling', 'updatedAt', 5);
    for (const bill of bills) {
      const timestamp = bill.updatedAt?.toMillis() || (bill.updatedAt ? Date.parse(bill.updatedAt) : Date.now());
      const updatedTimestamp = timestamp;
      
      const comisionValor = bill.comisionValor || bill.totalComisiones || 0;
      const statusPago = bill.estadoPago || bill.status || 'pendiente';

      if (!processedDocIds.has(bill.id)) {
        processedDocIds.add(bill.id);
        if (timestamp > startupTime - 15000) {
          dispatchBillingReportAlert({
            ...bill,
            totalComisiones: comisionValor,
            status: statusPago
          });
        }
      }
      
      const stateKey = `${bill.id}_${statusPago}`;
      if (!processedDocIds.has(stateKey)) {
        processedDocIds.add(stateKey);
        if (updatedTimestamp > startupTime - 15000) {
          if (statusPago === 'mora' || statusPago === 'limite_suspension') {
            dispatchBillingMoraAlert({
              ...bill,
              totalComisiones: comisionValor,
              status: statusPago
            });
          }
        }
      }
    }
  } catch (err) {
    // Graceful
  }
}

// ─── Bucle de Pings en Segundo Plano para Monitoreo de Sitios (Health Monitor) ───

async function checkClientHealthREST() {
  if (!systemConfig.alertsEnabled) return;
  try {
    const clients = await queryCollectionREST('clientes_control', 'nombre', 100);
    if (clients.length === 0) return;

    const currentHealthChecks = await queryCollectionREST('health_checks', 'lastCheck', 100);
    const healthMap = new Map();
    for (const hc of currentHealthChecks) {
      healthMap.set(hc.id, hc);
    }

    for (const client of clients) {
      const url = client.url;
      if (!url) continue;

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

          try {
            const pwaController = new AbortController();
            const pwaTimeoutId = setTimeout(() => pwaController.abort(), 2000);
            const manifestUrl = url.endsWith('/') ? `${url}manifest.webmanifest` : `${url}/manifest.webmanifest`;
            const pwaResponse = await fetch(manifestUrl, { signal: pwaController.signal });
            clearTimeout(pwaTimeoutId);

            if (pwaResponse.ok) {
              hasPwa = true;
            } else {
              const altManifestUrl = url.endsWith('/') ? `${url}manifest.json` : `${url}/manifest.json`;
              const altPwaController = new AbortController();
              const altPwaTimeoutId = setTimeout(() => altPwaController.abort(), 2000);
              const altPwaResponse = await fetch(altManifestUrl, { signal: altPwaController.signal });
              clearTimeout(altPwaTimeoutId);
              if (altPwaResponse.ok) {
                hasPwa = true;
              }
            }
          } catch (_) {}
        }
      } catch (_) {
        responseTimeMs = Date.now() - startTime;
      }

      const prevData = healthMap.get(client.id);
      const prevStatus = prevData?.status;

      let alertType = null;
      let alertDetails = '';

      if (status === 'red' && prevStatus !== 'red' && prevStatus !== undefined) {
        alertType = 'down';
        alertDetails = `HTTP Status: ${httpStatus || 'N/A'}. Latencia: ${responseTimeMs}ms.`;
      } else if ((status === 'green' || status === 'yellow') && prevStatus === 'red') {
        alertType = 'up';
        alertDetails = `Latencia actual: ${responseTimeMs}ms.`;
      }

      const currentHistory = prevData?.history || [];
      const now = new Date().toISOString();
      const newEntry = { responseTimeMs, timestamp: now };
      const updatedHistory = [newEntry, ...currentHistory].slice(0, 10);

      const fullData = {
        status,
        httpStatus,
        responseTimeMs,
        hasPwa,
        lastCheck: now,
        history: updatedHistory,
        actualizadoEn: new Date()
      };

      // Guardar resultados en Firestore central para visualización en el dashboard
      await writeDocumentREST('health_checks', client.id, fullData);

      if (alertType) {
        const channelConfig = getChannelConfig('crashes');
        if (channelConfig.enabled) {
          const clientName = client.nombre || client.id;
          let emoji = alertType === 'down' ? '🔴' : '🟢';
          let title = alertType === 'down' ? 'SaaS Down' : 'SaaS Up';
          let detailText = alertType === 'down' ? 'está caído' : 'se ha recuperado';

          const tgMessage = `${emoji} <b>${title}: ${clientName}</b> (${url}) ${detailText}.\n\n<b>Detalles:</b> ${alertDetails}`;
          const dsMessage = `${emoji} **${title}: ${clientName}** (${url}) ${detailText}.\n\n**Detalles:** ${alertDetails}`;

          sendTelegramMessage(channelConfig.telegramToken, channelConfig.telegramChatId, tgMessage).catch(() => {});
          sendDiscordMessage(channelConfig.discordWebhookUrl, dsMessage).catch(() => {});
        }
      }
    }
  } catch (err) {
    // Silencioso
  }
}

// Iniciar polling activo
console.log('[Notify Service] Motor de Polling de Firestore Central activo (Bypass vía Firebase CLI).');
pollCollections();
setInterval(pollCollections, 15000);

// Iniciar pings automáticos en segundo plano cada 5 minutos
console.log('[Notify Service] Monitor de Salud en segundo plano activo (pings cada 5 minutos).');
checkClientHealthREST();
setInterval(checkClientHealthREST, 5 * 60 * 1000);

// ─── Inicializar Servidor Express ───
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5050;

// Endpoint 1: Envío directo/crudo de mensajes a Telegram
app.post('/api/notify/telegram', async (req, res) => {
  try {
    const { text, chatId, token, channel } = req.body;
    let activeToken = token;
    let activeChatId = chatId;

    if (!activeToken || !activeChatId) {
      const channelConfig = getChannelConfig(channel || 'devops');
      activeToken = activeToken || channelConfig.telegramToken;
      activeChatId = activeChatId || channelConfig.telegramChatId;
    }

    if (!activeToken || !activeChatId) {
      return res.status(400).json({ error: 'Falta Token o Chat ID de Telegram.' });
    }

    await sendTelegramMessage(activeToken, activeChatId, text);
    res.json({ success: true, message: 'Notificación de Telegram despachada.' });
  } catch (err) {
    console.error('[Notify Service] Error Telegram:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint 2: Envío directo a Discord
app.post('/api/notify/discord', async (req, res) => {
  try {
    const { content, webhookUrl, channel } = req.body;
    let activeWebhook = webhookUrl;

    if (!activeWebhook) {
      const channelConfig = getChannelConfig(channel || 'devops');
      activeWebhook = channelConfig.discordWebhookUrl;
    }

    if (!activeWebhook) {
      return res.status(400).json({ error: 'Falta Webhook URL de Discord.' });
    }

    await sendDiscordMessage(activeWebhook, content);
    res.json({ success: true, message: 'Notificación de Discord despachada.' });
  } catch (err) {
    console.error('[Notify Service] Error Discord:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint 3: Despacho inteligente de fallos
app.post('/api/notify/error', async (req, res) => {
  try {
    const { clientId, componentName, errorMessage, stackTrace, severity, errorLine } = req.body;
    const channelConfig = getChannelConfig('crashes');
    if (!channelConfig.enabled) {
      return res.json({ success: false, message: 'Alertas de crashes inactivas.' });
    }
    dispatchCrashAlert({ clientId, componentName, errorMessage, stackTrace, severity, errorLine });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint 4: Sincronización de configuración directa
app.post('/api/notify/config', (req, res) => {
  try {
    systemConfig = { ...systemConfig, ...req.body };
    fs.writeFileSync(configPath, JSON.stringify(systemConfig, null, 2), 'utf8');
    res.json({ success: true, config: systemConfig });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper para formatear fechas de Firestore (soporta objetos y strings ISO)
function formatFirestoreDate(dateVal) {
  if (!dateVal) return 'N/A';
  if (typeof dateVal.toDate === 'function') {
    return dateVal.toDate().toLocaleString('es-ES');
  }
  if (typeof dateVal.toMillis === 'function') {
    return new Date(dateVal.toMillis()).toLocaleString('es-ES');
  }
  const parsed = new Date(dateVal);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleString('es-ES');
  }
  return String(dateVal);
}

// ─── helpers de base de datos para reportes de telegram ───

async function getHealthStatusReport() {
  try {
    const token = await getFirebaseAccessToken();
    const projectId = process.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID || 'prototipe-ecosistema-control';
    
    // 1. Obtener clientes_control activos
    const clientsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/clientes_control`;
    const clientsRes = await fetch(clientsUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const clientsData = clientsRes.ok ? await clientsRes.json() : {};
    const activeClientIds = new Set((clientsData.documents || []).map(doc => doc.name.split('/').pop()));

    // 2. Obtener reportes de salud
    const healthUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/health_checks`;
    const healthRes = await fetch(healthUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!healthRes.ok) return '❌ Error al obtener el estado de salud desde Firestore REST.';
    
    const healthData = await healthRes.json();
    const documents = healthData.documents || [];
    
    // Filtrar reportes para solo mostrar los de clientes registrados en clientes_control
    const activeHealths = documents.filter(doc => activeClientIds.has(doc.name.split('/').pop()));
    
    if (activeHealths.length === 0) return 'ℹ️ No hay reportes de salud registrados para clientes activos.';
    
    let report = '🩺 <b>Estado de Salud de Instancias:</b>\n\n';
    for (const doc of activeHealths) {
      const parsed = parseFirestoreDocument(doc);
      const emoji = parsed.status === 'up' || parsed.status === 'green' ? '🟢' : '🔴';
      const clientName = parsed.id;
      const timeDiff = parsed.responseTimeMs ? `${parsed.responseTimeMs} ms` : 'N/A';
      report += `${emoji} <b>${clientName.toUpperCase()}</b>\n` +
                `• HTTP: <code>${parsed.httpStatus || 'N/A'}</code>\n` +
                `• Latencia: <code>${timeDiff}</code>\n` +
                `• PWA: <code>${parsed.hasPwa ? 'Sí ✓' : 'No ✗'}</code>\n\n`;
    }
    return report;
  } catch (err) {
    console.error('[Notify Service] Error en getHealthStatusReport:', err.message);
    return `❌ Error al generar reporte de salud: ${err.message}`;
  }
}

async function getRecentCrashesReport() {
  try {
    const failures = await queryCollectionREST('app_failures', 'timestamp', 5);
    if (failures.length === 0) return '✅ No se han registrado incidentes recientes.';
    
    let report = '🚨 <b>Últimos 5 Incidentes Críticos:</b>\n\n';
    for (const f of failures) {
      const dateStr = formatFirestoreDate(f.timestamp);
      report += `🏢 <b>Cliente:</b> <code>${f.clientId}</code>\n` +
                `📄 <b>Fallo en:</b> <code>${f.componentName || 'General'}</code>\n` +
                `💬 <b>Mensaje:</b> <code>${f.errorMessage || f.errorMsg || 'Sin detalles'}</code>\n` +
                `📅 <b>Fecha:</b> <code>${dateStr}</code>\n` +
                `----------------------------------\n`;
    }
    return report;
  } catch (err) {
    return `❌ Error: ${err.message}`;
  }
}

async function getRecentBriefingsReport() {
  try {
    const briefings = await queryCollectionREST('briefings', 'fecha', 5);
    
    // Filtrar solo las preventas finalizadas/completadas
    const finishedBriefings = briefings.filter(b => b.finalizado === true || b.status === 'completed' || b.progreso === 100);
    
    if (finishedBriefings.length === 0) return '📝 No hay preventas finalizadas registradas en Firestore.';
    
    let report = '📝 <b>Últimos 5 Registros de Preventa:</b>\n\n';
    for (const b of finishedBriefings) {
      const dateStr = formatFirestoreDate(b.fecha);
      const niche = b.form?.seccion1?.nicho || b.form?.nicho || 'General';
      const score = b.analysisResult?.scoreComplejidad || b.analysisResult?.complejidadScore || 'N/A';
      const pricing = b.analysisResult?.cotizacionSugerida || b.analysisResult?.cotizacion || 'Consultar';
      
      report += `👤 <b>Empresa:</b> <code>${b.nombreEmpresa || b.id}</code>\n` +
                `🛍️ <b>Nicho:</b> <code>${niche}</code>\n` +
                `📐 <b>Complejidad:</b> <code>${score} pts</code>\n` +
                `💰 <b>Cotización:</b> <code>${pricing}</code>\n` +
                `📅 <b>Fecha:</b> <code>${dateStr}</code>\n` +
                `----------------------------------\n`;
    }
    return report;
  } catch (err) {
    return `❌ Error: ${err.message}`;
  }
}

async function getBillingSummaryReport() {
  try {
    const bills = await queryCollectionREST('reportesBilling', 'updatedAt', 5);
    if (bills.length === 0) return '💵 No hay reportes de facturación disponibles.';
    
    let report = '💵 <b>Resumen Financiero (Últimos 5 Billing):</b>\n\n';
    for (const b of bills) {
      const dateStr = formatFirestoreDate(b.updatedAt);
      report += `🏢 <b>Cliente:</b> <code>${b.clientId}</code>\n` +
                `📅 <b>Periodo:</b> <code>${b.periodo || 'Mensual'}</code>\n` +
                `💰 <b>Comisiones:</b> <code>$ ${b.totalComisiones || b.comisionValor || '0.00'}</code>\n` +
                `📌 <b>Estado:</b> <code>${b.status || b.estadoPago || 'Pendiente'}</code>\n` +
                `📅 <b>Actualizado:</b> <code>${dateStr}</code>\n` +
                `----------------------------------\n`;
    }
    return report;
  } catch (err) {
    return `❌ Error: ${err.message}`;
  }
}

async function getLatestTaskLog() {
  try {
    const brainDir = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain';
    const subdirs = await fs.promises.readdir(brainDir);
    let latestDir = null;
    let latestTime = 0;
    for (const s of subdirs) {
      const fullPath = path.join(brainDir, s);
      const stat = await fs.promises.stat(fullPath);
      if (stat.isDirectory() && stat.mtimeMs > latestTime) {
        latestTime = stat.mtimeMs;
        latestDir = fullPath;
      }
    }
    if (!latestDir) return null;
    const tasksDir = path.join(latestDir, '.system_generated', 'tasks');
    const tasksExist = await fs.promises.access(tasksDir).then(() => true).catch(() => false);
    if (!tasksExist) return null;
    
    const files = await fs.promises.readdir(tasksDir);
    const logFiles = files.filter(f => f.startsWith('task-') && f.endsWith('.log'));
    let latestLog = null;
    let latestLogTime = 0;
    for (const f of logFiles) {
      const logPath = path.join(tasksDir, f);
      const stat = await fs.promises.stat(logPath);
      if (stat.mtimeMs > latestLogTime) {
        latestLogTime = stat.mtimeMs;
        latestLog = logPath;
      }
    }
    return latestLog;
  } catch (err) {
    return null;
  }
}

async function getClientInstancesList() {
  try {
    const response = await fetch('http://localhost:3001/api/instancias/list');
    if (!response.ok) return [];
    const data = await response.json();
    const templates = data.templates || [];
    const clientIds = [];
    for (const t of templates) {
      if (t.clients && Array.isArray(t.clients)) {
        for (const c of t.clients) {
          if (c.clientId) {
            clientIds.push(c.clientId);
          }
        }
      }
    }
    return clientIds;
  } catch (err) {
    console.error('[Notify Service] Error en getClientInstancesList:', err.message);
    return [];
  }
}

// ─── Helpers de Telemetría (Facturación / Billing mensual) ───

async function getTelemetryReport(clientId, periodStr = null) {
  try {
    const token = await getFirebaseAccessToken();
    const projectId = process.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID || 'prototipe-ecosistema-control';
    
    // Si se pasa 'any', buscaremos el más reciente sin importar periodo
    const isAny = periodStr === 'any';
    const now = new Date();
    const period = periodStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const docId = `${clientId}_${period}`;
    
    if (!isAny) {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/reportesBilling/${docId}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const docData = await response.json();
        return parseFirestoreDocument(docData);
      }
      
      if (response.status !== 404) {
        throw new Error(`REST Error (${response.status})`);
      }
    }

    // Intentar buscar el reporte más reciente de este cliente mediante query
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'reportesBilling' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'clientId' },
            op: 'EQUAL',
            value: { stringValue: clientId }
          }
        },
        orderBy: [{ field: { fieldPath: 'updatedAt' }, direction: 'DESCENDING' }],
        limit: 1
      }
    };
    const queryRes = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody)
    });
    
    if (queryRes.ok) {
      const queryData = await queryRes.json();
      const docs = Array.isArray(queryData) ? queryData.filter(d => d.document) : [];
      if (docs.length > 0) {
        return parseFirestoreDocument(docs[0].document);
      }
    }
    return null;
  } catch (err) {
    console.error(`[Notify Service] Error en getTelemetryReport para ${clientId}:`, err.message);
    throw err;
  }
}

async function getTelemetryStatusMsg(clientId) {
  try {
    const report = await getTelemetryReport(clientId);
    if (!report) {
      return {
        text: `📊 <b>Telemetría — ${clientId}</b>\n\n` +
              `❌ <b>No hay reportes de telemetría de facturación (Billing) registrados.</b>\n` +
              `<i>El sistema no ha recibido ninguna transmisión para este cliente en el periodo actual o anterior.</i>`,
        success: false
      };
    }

    const updatedAtStr = formatFirestoreDate(report.updatedAt);
    
    // Calcular tiempo transcurrido desde el último envío
    let ageStr = 'desconocida';
    if (report.updatedAt) {
      const updatedMs = typeof report.updatedAt.toMillis === 'function' 
        ? report.updatedAt.toMillis() 
        : new Date(report.updatedAt).getTime();
      if (!isNaN(updatedMs)) {
        const diffMs = Date.now() - updatedMs;
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours < 1) {
          const diffMins = Math.floor(diffMs / (1000 * 60));
          ageStr = `hace ${diffMins} minutos`;
        } else if (diffHours < 24) {
          ageStr = `hace ${Math.floor(diffHours)} horas`;
        } else {
          ageStr = `hace ${Math.floor(diffHours / 24)} días`;
        }
      }
    }

    const formatCurrency = (val) => {
      if (val === undefined || val === null) return '$ 0.00';
      return `$ ${Number(val).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const text = `📊 <b>Telemetría — ${clientId}</b>\n` +
                 `📅 Periodo: <code>${report.periodo || 'N/A'}</code>\n` +
                 `⏱️ Último envío: <b>${updatedAtStr}</b> (<code>${ageStr}</code>)\n\n` +
                 `💰 <b>Facturación & Volumen:</b>\n` +
                 `• Total Ventas: <b>${formatCurrency(report.totalVentas)}</b>\n` +
                 `• Ventas Netas: <b>${formatCurrency(report.totalVentasNetas)}</b>\n` +
                 `• Impuestos: <b>${formatCurrency(report.totalImpuestos)}</b>\n` +
                 `• Cantidad Pedidos: <code>${report.orderCount || 0} pedidos</code>\n` +
                 `• Facturas DIAN: <code>${report.facturasDianCount || 0}</code>\n\n` +
                 `⚙️ <b>Configuración:</b>\n` +
                 `• Modo de Cobro: <code>${report.billingMode || 'percentage'}</code>\n` +
                 `• Facturación Electrónica: <code>${report.enableDianBilling ? 'Activada ✓' : 'Desactivada ✗'}</code>\n` +
                 `• Schema Version: <code>v${report.schemaVersion || 1}</code>`;

    return { text, success: true, report };
  } catch (err) {
    return {
      text: `❌ <b>Error al consultar telemetría para <code>${clientId}</code>:</b>\n<code>${err.message}</code>`,
      success: false
    };
  }
}

async function getTelemetryCheckReport() {
  try {
    const clients = await getClientInstancesList();
    if (clients.length === 0) {
      return '⚠️ No se encontraron clientes registrados en el CLI local.';
    }

    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let reportText = `🩺 <b>Auditoría del Sistema de Telemetría (Mes: ${currentPeriod})</b>\n\n` +
                     `Verificación de recepción de telemetría de facturación (Billing) mensual:\n\n`;

    let activeCount = 0;
    let inactiveCount = 0;

    for (const clientId of clients) {
      try {
        const telemetry = await getTelemetryReport(clientId, currentPeriod);
        if (telemetry) {
          const updatedMs = typeof telemetry.updatedAt.toMillis === 'function' 
            ? telemetry.updatedAt.toMillis() 
            : new Date(telemetry.updatedAt).getTime();
          let ageStr = 'hace poco';
          if (!isNaN(updatedMs)) {
            const diffMs = Date.now() - updatedMs;
            const diffHours = diffMs / (1000 * 60 * 60);
            if (diffHours < 24) {
              ageStr = `hoy`;
            } else {
              ageStr = `hace ${Math.floor(diffHours / 24)}d`;
            }
          }
          const orders = telemetry.orderCount || 0;
          reportText += `✅ <code>${clientId}</code>: **Recibido** (<code>${ageStr}</code>, <code>${orders} ped</code>)\n`;
          activeCount++;
        } else {
          // Intentar ver si tiene algún reporte de meses anteriores
          const oldTelemetry = await getTelemetryReport(clientId, 'any');
          if (oldTelemetry) {
            reportText += `⚠️ <code>${clientId}</code>: **Desactualizado** (Periodo anterior: <code>${oldTelemetry.periodo}</code>)\n`;
          } else {
            reportText += `❌ <code>${clientId}</code>: **Sin datos** (Nunca ha transmitido)\n`;
          }
          inactiveCount++;
        }
      } catch (err) {
        reportText += `⚠️ <code>${clientId}</code>: **Error de conexión** (<code>${err.message}</code>)\n`;
        inactiveCount++;
      }
    }

    reportText += `\n📊 <b>Resumen de Cobertura:</b>\n` +
                  `• Transmitiendo este mes: <b>${activeCount}/${clients.length}</b>\n` +
                  `• Pendientes o sin datos: <b>${inactiveCount}/${clients.length}</b>\n\n` +
                  `<i>Para enviar telemetría manualmente, ingresa a la pestaña "Desarrollador" en el CRM del cliente y presiona "Enviar Telemetría".</i>`;

    return reportText;
  } catch (err) {
    return `❌ <b>Error al realizar la auditoría de telemetría:</b>\n<code>${err.message}</code>`;
  }
}

// ─── Formatters de Git (Sprint 1) ───

async function getGitTargetsList() {
  const res = await fetch('http://localhost:3001/api/git/targets').catch(() => null);
  if (!res?.ok) return null;
  const data = await res.json();
  const t = data.targets || {};
  const repos = [];
  if (t.master?.hasGit)    repos.push({ name: t.master.name,   path: t.master.path,   branch: t.master.branch,   hasChanges: t.master.hasChanges,   type: 'master'   });
  if (t.dashboard?.hasGit) repos.push({ name: 'dev-dashboard',  path: t.dashboard.path, branch: t.dashboard.branch, hasChanges: t.dashboard.hasChanges, type: 'dashboard' });
  for (const c of (t.cores     || []).filter(x => x.hasGit))              repos.push({ name: `Core: ${c.name}`, path: c.path, branch: c.branch, hasChanges: c.hasChanges, type: 'core'     });
  for (const i of (t.instances || []).filter(x => x.hasGit).slice(0, 6)) repos.push({ name: i.name,            path: i.path, branch: i.branch, hasChanges: i.hasChanges, type: 'instance' });
  return repos;
}

async function getGitStatusReport(repoPath) {
  const res = await fetch(`http://localhost:3001/api/git/status?path=${encodeURIComponent(repoPath)}`).catch(() => null);
  if (!res?.ok) return '❌ Error al obtener el estado de Git.';
  const data = await res.json();
  if (!data.success) return `❌ Git Status Error: ${data.error || 'desconocido'}`;
  const changes  = data.changes || [];
  const typeMap  = { M: '📝', A: '➕', D: '🗑️', R: '🔄', '?': '❓' };
  if (changes.length === 0) return `✅ <b>Git Status</b> — <code>${data.branch || '?'}</code>\n\n🟢 Sin cambios pendientes.`;
  const envWarn  = data.envLeak ? `\n\n⚠️ <b>ALERTA .env detectado:</b>\n${(data.envLeakFiles || []).map(f => `<code>${f}</code>`).join('\n')}` : '';
  const syncIcon = { sync: '🔄', ahead: '⬆️', behind: '⬇️', diverged: '⚡', local: '🏠', unknown: '❓' }[data.syncState] || '❓';
  const fileList = changes.slice(0, 20).map(c => `${typeMap[c.type] || c.type} <code>${c.file.length > 50 ? '...' + c.file.slice(-47) : c.file}</code>`).join('\n');
  const moreMsg  = changes.length > 20 ? `\n<i>...y ${changes.length - 20} más</i>` : '';
  return `📋 <b>Git Status — ${data.branch || '?'}</b>\n` +
         `${syncIcon} ${data.syncState || ''} ${data.aheadCount ? `↑${data.aheadCount}` : ''} ${data.behindCount ? `↓${data.behindCount}` : ''}\n\n` +
         `<b>${changes.length} archivo(s) modificado(s):</b>\n${fileList}${moreMsg}${envWarn}`;
}

async function getGitLogReport(repoPath) {
  const res = await fetch(`http://localhost:3001/api/git/log?path=${encodeURIComponent(repoPath)}`).catch(() => null);
  if (!res?.ok) return '❌ Error al obtener el log de Git.';
  const data = await res.json();
  if (!data.success) return `❌ Git Log Error: ${data.error || 'desconocido'}`;
  const commits = data.commits || [];
  if (commits.length === 0) return '📜 <b>Git Log</b>\n\nSin commits registrados.';
  const list = commits.map(c => `🔹 <code>${c.hash}</code> <i>${c.date}</i>\n   ${c.message.slice(0, 80)}`).join('\n\n');
  return `📜 <b>Commits Recientes</b>\n\n${list}`;
}

async function getGitUnpushedReport(repoPath) {
  const res = await fetch(`http://localhost:3001/api/git/unpushed-commits?path=${encodeURIComponent(repoPath)}`).catch(() => null);
  if (!res?.ok) return '❌ Error al consultar commits sin publicar.';
  const data = await res.json();
  if (!data.success) return `❌ Error: ${data.error || 'desconocido'}`;
  const commits = data.commits || [];
  if (commits.length === 0) return `✅ <b>Sin Publicar</b>\n\n🟢 Todos los commits están publicados.`;
  const noUpstream = !data.hasUpstream ? '\n⚠️ <i>Sin branch upstream configurado.</i>' : '';
  const list = commits.map(c => {
    const v = c.isValid ? '✅' : '⚠️'; const t = c.hasTaskId ? '🔖' : '';
    return `${v}${t} <code>${c.hash}</code> <i>${c.date}</i>\n   ${c.message.slice(0, 70)}`;
  }).join('\n\n');
  return `📤 <b>${commits.length} Commit(s) Sin Publicar</b>${noUpstream}\n\n${list}`;
}

async function generateAutoCommitMessage(repoPath) {
  try {
    const resStatus = await fetch(`http://localhost:3001/api/git/status?path=${encodeURIComponent(repoPath)}`).catch(() => null);
    if (!resStatus?.ok) return '';
    const statusData = await resStatus.json();
    if (!statusData.success || !statusData.changes?.length) return '';
    
    const changes = statusData.changes;
    const modified = changes.filter(c => c.type === 'M').map(c => c.file.split('/').pop()).slice(0, 3);
    const added = changes.filter(c => c.type === 'A').map(c => c.file.split('/').pop()).slice(0, 2);
    const deleted = changes.filter(c => c.type === 'D').map(c => c.file.split('/').pop()).slice(0, 2);
    
    const parts = [];
    if (modified.length) parts.push(`Mod: ${modified.join(', ')}`);
    if (added.length)    parts.push(`Add: ${added.join(', ')}`);
    if (deleted.length)  parts.push(`Del: ${deleted.join(', ')}`);
    
    const branch = statusData.branch || 'develop';
    const date = new Date().toISOString().split('T')[0];
    
    let prefix = '';
    const resRoadmap = await fetch('http://localhost:3001/api/roadmap').catch(() => null);
    if (resRoadmap?.ok) {
      const roadmapData = await resRoadmap.json();
      if (roadmapData.success && roadmapData.tasks?.length > 0) {
        const activeTask = roadmapData.tasks.find(t => !t.completed) || roadmapData.tasks[0];
        if (activeTask && activeTask.id) {
          prefix = `${activeTask.id}: `;
        }
      }
    }
    
    return `${prefix}[${branch}] ${date} — ${parts.join(' | ')}`;
  } catch (err) {
    console.warn('[Telegram AutoMessage] Error al auto-generar mensaje:', err.message);
    return '';
  }
}

async function getTaskDetailReport(taskId) {
  const res = await fetch('http://localhost:3001/api/roadmap').catch(() => null);
  if (!res?.ok) return '❌ Error al consultar el Roadmap.';
  const data = await res.json();
  const tasks = data.tasks || [];
  const t = tasks.find(x => x.id?.toLowerCase() === taskId.trim().toLowerCase());
  if (!t) return `⚠️ No se encontró ninguna tarea con el ID <code>${taskId}</code> en el Roadmap.`;

  // Los detalles están en t.detail (estructura real de la API /api/roadmap)
  const det = t.detail || {};
  const fecha      = det.fecha      || t.fecha || t.date || '';
  const fechaFin   = det.fechaFin   || t.fechaFin || '';
  const descripcion = det.descripcion || t.descripcion || [];
  const archivos   = det.archivos   || t.archivos || [];

  const statusLabel    = t.completed ? '✅ Completada' : '⏳ Pendiente';
  const registeredDate = fecha    ? `\n📅 Registrada: <code>${escapeHtml(fecha)}</code>`    : '';
  const completedDate  = fechaFin ? `\n📅 Finalizada: <code>${escapeHtml(fechaFin)}</code>` : '';

  let descLabel = '';
  if (descripcion.length > 0) {
    descLabel = `\n💬 <b>Descripción:</b>\n${descripcion.map(d => `• ${escapeHtml(d)}`).join('\n')}`;
  } else if (t.text) {
    // Fallback: mostrar el texto del título como descripción
    const cleanText = t.text.replace(/^Tarea\s+[\w-]+:\s*/i, '').trim();
    descLabel = `\n💬 <b>Descripción:</b>\n• ${escapeHtml(cleanText)}`;
  }

  let filesLabel = '';
  if (archivos.length > 0) {
    const actionIcons = { MODIFY: '📝', NEW: '➕', DELETE: '🗑️' };
    filesLabel = `\n\n📁 <b>Archivos afectados:</b>\n${archivos.map(f => `${actionIcons[f.action] || '📝'} <code>${escapeHtml(f.name)}</code>`).join('\n')}`;
  }

  return `ℹ️ <b>Detalle de Tarea — ${escapeHtml(t.id)}</b>\n\n` +
         `🔹 <b>Estado:</b> ${statusLabel}${registeredDate}${completedDate}` +
         `${descLabel}${filesLabel}`;
}


function normalizeText(str) {
  if (!str) return '';
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function searchTasksInRoadmap(query) {
  const res = await fetch('http://localhost:3001/api/roadmap').catch(() => null);
  if (!res?.ok) return '❌ Error al consultar el Roadmap.';
  const data = await res.json();
  const tasks = data.tasks || [];
  
  const qClean = normalizeText(query);
  const words = qClean.split(/\s+/).filter(w => w.length > 1);

  if (words.length === 0 && qClean.length > 0) {
    words.push(qClean);
  }

  const matches = tasks.filter(t => {
    const fieldsToSearch = [
      t.id,
      t.text,
      t.rawText,
      t.rawLine,
      ...(t.descripcion || [])
    ].map(f => normalizeText(f)).join(' ');

    return words.every(word => fieldsToSearch.includes(word));
  });

  if (matches.length === 0) {
    return `🔍 <b>Búsqueda de Tareas</b>\n\n❌ No se encontraron coincidencias para: "<i>${query}</i>"\n<i>Intenta con palabras clave más simples (ej. pdf, backup, deploy).</i>`;
  }

  let text = `🔍 <b>Coincidencias encontradas (${matches.length}):</b>\n\n`;
  const displayLimit = 12;
  matches.slice(0, displayLimit).forEach(t => {
    const icon = t.completed ? '✅' : '⏳';
    const safeText = escapeHtml(t.text || t.id);
    const statusLabel = t.completed ? `<s>${safeText}</s>` : `<b>${safeText}</b>`;
    text += `${icon} <b>${t.id}</b>: ${statusLabel}\n`;
  });

  if (matches.length > displayLimit) {
    text += `\n<i>... y ${matches.length - displayLimit} coincidencias más. Escribe algo más específico.</i>`;
  }
  return text;
}


async function executeGitPush(token, chatId, repoPath) {
  const msgId = await sendJobMessage(token, chatId,
    `⏳ <b>Generando mensaje de commit y publicando...</b>\n<i>Por favor espera...</i>`);
  (async () => {
    const backMarkup = { inline_keyboard: [[{ text: '🏠 Menú Principal', callback_data: '/start' }]] };
    try {
      const autoMessage = await generateAutoCommitMessage(repoPath);
      
      // Auto-Merge habilitado por defecto si no es instancia de cliente (paridad con el dashboard React)
      const isInstance = repoPath.includes('Instancias Clientes');
      const doAutoMerge = !isInstance;
      
      const url = `http://localhost:3001/api/git/backup-stream?path=${encodeURIComponent(repoPath)}` + 
                  `&push=true` +
                  `&autoMerge=${doAutoMerge}` +
                  (autoMessage ? `&message=${encodeURIComponent(autoMessage)}` : '');
      
      const res     = await fetch(url, { signal: AbortSignal.timeout(180000) });
      const rawText = await res.text();
      const lines   = rawText.split('\n').filter(l => l.startsWith('data:'));
      const last    = (lines.length > 0 ? lines[lines.length - 1].replace('data:', '').trim() : 'Proceso finalizado').slice(0, 300);
      const ok      = res.ok && !rawText.toLowerCase().includes('error');
      
      let finalMsg = ok
        ? `✅ <b>Cambios Publicados</b>\n\n🚀 GitHub / Hosting actualizado con éxito.`
        : `❌ <b>Push Fallido</b>\n\n<code>${last}</code>`;
      
      if (ok) {
        if (autoMessage) {
          finalMsg += `\n\n💬 <b>Mensaje de Commit:</b>\n<code>${autoMessage}</code>`;
        }
        if (doAutoMerge) {
          finalMsg += `\n\n🔄 <b>Fusión Automática:</b>\nFusionado a producción (main/master) en GitHub.`;
        }
      }
      
      await editJobMessage(token, chatId, msgId, finalMsg, backMarkup);
    } catch (err) {
      await editJobMessage(token, chatId, msgId, `❌ <b>Push — Error:</b>\n<code>${err.message}</code>`, backMarkup);
    }
  })();
}

// ─── Formatters de DevServer (Sprint 1) ───

async function getDevServerStatusMsg(clientId) {
  const res  = await fetch(`http://localhost:3001/api/project/dev/status?clientId=${encodeURIComponent(clientId)}`).catch(() => null);
  if (!res?.ok) return { text: '❌ Error al consultar el estado del dev server.', running: false };
  const data  = await res.json();
  const running = data.running || false;
  const text  = `🖥️ <b>Dev Server — ${clientId}</b>\n\n` +
    `${running ? '🟢' : '🔴'} Estado: <b>${running ? 'ACTIVO' : 'DETENIDO'}</b>\n` +
    (running ? `🌐 URL: <code>${data.url || 'desconocida'}</code>` : '<i>El servidor no está corriendo.</i>');
  return { text, running };
}

async function executeDevServerStart(token, chatId, clientId) {
  const msgId = await sendJobMessage(token, chatId,
    `⏳ <b>Arrancando Dev Server:</b> <code>${clientId}</code>\n<i>Iniciando npm run dev... (~10 segundos)</i>`);
  (async () => {
    try {
      const res  = await fetch('http://localhost:3001/api/project/dev/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }), signal: AbortSignal.timeout(25000)
      });
      const data = res.ok ? await res.json().catch(() => ({})) : {};
      await editJobMessage(token, chatId, msgId,
        res.ok && data.success
          ? `✅ <b>Dev Server Iniciado:</b> <code>${clientId}</code>\n🌐 <code>${data.url || ''}</code>`
          : `❌ <b>No se pudo arrancar:</b> <code>${clientId}</code>\n<code>${data.error || 'Error desconocido'}</code>`);
    } catch (err) {
      await editJobMessage(token, chatId, msgId, `❌ <b>Timeout — Dev Server:</b>\n<code>${err.message}</code>`);
    }
  })();
}

async function executeDevServerStop(token, chatId, clientId) {
  const msgId = await sendJobMessage(token, chatId,
    `⏳ <b>Deteniendo Dev Server:</b> <code>${clientId}</code>...`);
  (async () => {
    try {
      const res  = await fetch('http://localhost:3001/api/project/dev/stop', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }), signal: AbortSignal.timeout(15000)
      });
      const data = res.ok ? await res.json().catch(() => ({})) : {};
      await editJobMessage(token, chatId, msgId,
        res.ok
          ? `⏹ <b>Dev Server Detenido:</b> <code>${clientId}</code>\n${data.message || ''}`
          : `❌ <b>Error al detener:</b> <code>${data.error || 'desconocido'}</code>`);
    } catch (err) {
      await editJobMessage(token, chatId, msgId, `❌ <b>Error:</b> <code>${err.message}</code>`);
    }
  })();
}

// ─── Formatters de Autocuración (Sprint 2) ───

async function executeFixChunks(token, chatId, clientId) {
  const msgId = await sendJobMessage(token, chatId,
    `⏳ <b>Optimizando chunks...</b>\n<i>Modificando vite.config.js para dividir el bundle de <code>${clientId}</code>.</i>`);
  (async () => {
    try {
      const res = await fetch('http://localhost:3001/api/project/fix/chunks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      });
      const data = res.ok ? await res.json().catch(() => ({})) : {};
      await editJobMessage(token, chatId, msgId,
        res.ok && data.success
          ? `✅ <b>Optimización Aplicada</b>\n\n<code>${data.message || 'Chunck splitting configurado.'}</code>`
          : `❌ <b>Fallo al optimizar chunks:</b>\n<code>${data.error || 'Error de procesamiento'}</code>`);
    } catch (err) {
      await editJobMessage(token, chatId, msgId, `❌ <b>Error:</b> <code>${err.message}</code>`);
    }
  })();
}

async function executeFixPwa(token, chatId, clientId) {
  const msgId = await sendJobMessage(token, chatId,
    `⏳ <b>Corrigiendo recursos PWA...</b>\n<i>Restableciendo favicon e íconos en <code>${clientId}</code>.</i>`);
  (async () => {
    try {
      const res = await fetch('http://localhost:3001/api/project/fix/pwa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      });
      const data = res.ok ? await res.json().catch(() => ({})) : {};
      await editJobMessage(token, chatId, msgId,
        res.ok && data.success
          ? `✅ <b>Recursos PWA Restablecidos</b>\n\n<code>${data.message || 'Se forzará la reconstrucción en el siguiente deploy.'}</code>`
          : `❌ <b>Fallo al corregir PWA:</b>\n<code>${data.error || 'Error de procesamiento'}</code>`);
    } catch (err) {
      await editJobMessage(token, chatId, msgId, `❌ <b>Error:</b> <code>${err.message}</code>`);
    }
  })();
}

async function getFirebaseRulesDriftReport() {
  const res = await fetch('http://localhost:3001/api/project/firebase-rules/drift-global').catch(() => null);
  if (!res?.ok) return { report: '❌ Error al consultar la matriz de desviación de reglas.', hasAnyDrift: false, matrix: [] };
  const data = await res.json();
  if (!data.success) return { report: `❌ Error: ${data.error || 'desconocido'}`, hasAnyDrift: false, matrix: [] };
  const matrix = data.driftMatrix || [];
  if (matrix.length === 0) return { report: '🟢 <b>Reglas de Firebase</b>\n\nNo se encontraron instancias de clientes con Firebase configurado.', hasAnyDrift: false, matrix: [] };
  
  let report = '🔥 <b>Matriz de Desviación de Reglas (Drift)</b>\n\n';
  let hasAnyDrift = false;
  
  for (const item of matrix) {
    const fsDrift = item.firestore?.drift ? '🔴 DESVIADO' : '🟢 Al día';
    const stDrift = item.storage?.drift ? '🔴 DESVIADO' : '🟢 Al día';
    if (item.firestore?.drift || item.storage?.drift) hasAnyDrift = true;
    
    report += `🏢 <b>Instancia:</b> <code>${item.clientId}</code>\n` +
              `🔥 Proyecto: <code>${item.firebaseProjectId || 'N/A'}</code>\n` +
              `└ 🔥 Firestore Rules: <b>${fsDrift}</b>\n` +
              `└ 📦 Storage Rules: <b>${stDrift}</b>\n\n`;
  }
  
  return { report, hasAnyDrift, matrix };
}

async function executeFirebaseRulesDeploy(token, chatId, clientId, type = 'all') {
  const msgId = await sendJobMessage(token, chatId,
    `⏳ <b>Desplegando reglas...</b>\n<i>Subiendo reglas de ${type} para <code>${clientId}</code> a Firebase.</i>`);
  (async () => {
    try {
      const res = await fetch('http://localhost:3001/api/project/firebase-rules/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, type })
      });
      const data = res.ok ? await res.json().catch(() => ({})) : {};
      await editJobMessage(token, chatId, msgId,
        res.ok
          ? `✅ <b>Reglas Desplegadas con Éxito</b>\n\nInstancia: <code>${clientId}</code>\nTipo: <code>${type}</code>`
          : `❌ <b>Fallo al desplegar reglas:</b>\n<code>${data.error || 'Error de procesamiento'}</code>`);
    } catch (err) {
      await editJobMessage(token, chatId, msgId, `❌ <b>Error:</b> <code>${err.message}</code>`);
    }
  })();
}

// ─── Formatters de Diagnóstico y Cores (Sprint 3) ───

async function getE2EProjectsList() {
  const res = await fetch('http://localhost:3001/api/e2e/projects').catch(() => null);
  if (!res?.ok) return [];
  const data = await res.json();
  return data.projects || [];
}

async function getE2ELastResultMsg(projectId) {
  const res = await fetch(`http://localhost:3001/api/e2e/last-result?projectId=${encodeURIComponent(projectId)}`).catch(() => null);
  if (!res?.ok) return '❌ Error al consultar el resultado de las pruebas E2E.';
  const data = await res.json();
  if (!data.success) return `❌ Error: ${data.error || 'desconocido'}`;
  const result = data.result;
  if (!result) return `🧪 <b>Playwright E2E — ${projectId}</b>\n\n⚠️ Sin resultados previos de ejecución.`;
  
  const statusEmoji = result.passed ? '✅' : '❌';
  return `🧪 <b>Playwright E2E — ${projectId}</b>\n\n` +
         `${statusEmoji} Resultado: <b>${result.passed ? 'PASÓ' : 'FALLÓ'}</b>\n` +
         `⏱ Duración: <code>${result.duration || 'desconocida'}</code>\n` +
         `📊 Resumen: <code>${result.summary || ''}</code>`;
}

async function getCoresReport() {
  const res = await fetch('http://localhost:3001/api/cores').catch(() => null);
  if (!res?.ok) return '❌ Error al obtener la lista de plantillas Core.';
  const data = await res.json();
  if (!data.success) return `❌ Error: ${data.error || 'desconocido'}`;
  const cores = data.cores || [];
  if (cores.length === 0) return '📦 <b>Plantillas Core</b>\n\nNo hay plantillas core registradas.';
  
  let report = '📦 <b>Plantillas Core Registradas</b>\n\n';
  for (const c of cores) {
    const statusEmoji = c.activo ? '🟢' : '⚫';
    report += `${statusEmoji} <b>Core:</b> <code>${c.clave}</code> (${c.nombre || 'Sin nombre'})\n` +
              `🌾 Nicho: <code>${c.nicho || 'N/A'}</code>\n` +
              `📂 Ruta: <code>${c.fuente || ''}</code>\n\n`;
  }
  return report;
}

// ─── Helpers de Job Tracker (mensajes editables para operaciones largas) ───



// Permiten enviar un mensaje "⏳ En progreso" y editarlo con el resultado final
// sin bloquear el loop de polling.

async function sendJobMessage(token, chatId, text, replyMarkup = null) {
  try {
    const payload = { chat_id: chatId, text, parse_mode: 'HTML' };
    if (replyMarkup) payload.reply_markup = replyMarkup;
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.result?.message_id || null;
  } catch (_) { return null; }
}

async function editJobMessage(token, chatId, messageId, text, replyMarkup = null) {
  if (!messageId) return;
  try {
    const payload = { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML' };
    if (replyMarkup) payload.reply_markup = replyMarkup;
    await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (_) {}
}

// ─── Polling Activo de Comandos de Telegram ───

const botOffsets  = {};
const userStates  = {};
const activeJobs  = new Map(); // jobId → { token, chatId, messageId } para edición posterior
const gitRepoCache = {};       // chatId → [{ name, path, branch, hasChanges }] renovado en cada /git
let   botUsername = '';        // Se resuelve al arrancar vía getMe


async function startTelegramCommandPolling() {
  const tokens = new Set();
  if (systemConfig.telegramToken) tokens.add(systemConfig.telegramToken);
  
  if (systemConfig.channels) {
    for (const key of Object.keys(systemConfig.channels)) {
      const ch = systemConfig.channels[key];
      if (ch.telegramToken) tokens.add(ch.telegramToken);
    }
  }

  for (const token of tokens) {
    if (!token) continue;
    try {
      const offset = botOffsets[token] || 0;
      const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&limit=5&timeout=1`;
      const res = await fetch(url).catch(() => null);
      if (!res || !res.ok) continue;

      const data = await res.json();
      if (!data.ok || !data.result || data.result.length === 0) continue;

      for (const update of data.result) {
        botOffsets[token] = update.update_id + 1;
        try {
          let text = '';
        let chatId = null;
        let queryId = null;

        if (update.message && update.message.text) {
          text = update.message.text.trim();
          chatId = update.message.chat.id;
        } else if (update.callback_query) {
          queryId = update.callback_query.id;
          text = update.callback_query.data;
          chatId = update.callback_query.message.chat.id;

          // Responder callback_query para quitar el spinner de carga en Telegram
          fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: queryId })
          }).catch(() => {});
        }

        if (text) {
          console.log(`[Telegram Polling] Update recibido | Token: ${token.slice(0, 8)}... | Chat: ${chatId} | Text: ${text}`);
        }
        if (!text) continue;

        // ─── Verificación de Autorización ───
        const authResult = isAuthorized(chatId, text);
        if (!authResult.ok) {
          console.warn(`[Telegram Access Denied] Intento no autorizado del Chat ID: ${chatId} (Causa: ${authResult.reason}) | Comando: ${text}`);
          // Solo informar si es usuario conocido sin nivel admin suficiente
          if (authResult.reason === 'not_admin') {
            await sendTelegramMessage(token, chatId,
              '🔒 <b>Acceso Denegado</b>\n\nEste comando requiere permisos de administrador.');
          }
          // Silencio total para IDs desconocidos
          continue;
        }

        // Interceptación de estados conversacionales (Máquina de Estados)
        if (userStates[chatId] && userStates[chatId].step === 'AWAITING_TEXT' && !queryId) {
          if (text.toLowerCase() === 'cancelar' || text.toLowerCase() === '/cancelar') {
            delete userStates[chatId];
            await sendTelegramMessage(token, chatId, '❌ <b>Búsqueda Finalizada:</b> Has salido del modo búsqueda.');
            continue;
          }

          const { context, domain, groupChatId } = userStates[chatId];

          if (context === 'search_task') {
            const report = await searchTasksInRoadmap(text);
            const textResponse = `${report}\n\n<i>✍️ Escribe otro término para seguir buscando en el Roadmap, o presiona <b>Finalizar Búsqueda</b> para salir.</i>`;
            const backMarkup = {
              inline_keyboard: [
                [{ text: '❌ Finalizar Búsqueda', callback_data: '/tasks' }],
                [{ text: '🏠 Menú Principal', callback_data: '/start' }]
              ]
            };
            await sendTelegramMessage(token, chatId, textResponse, backMarkup);
            if (groupChatId && groupChatId !== chatId) {
              await sendTelegramMessage(token, groupChatId, `🔍 <b>Búsqueda realizada en chat privado por operador (Término: "${text}"):</b>\n\n${report}`, backMarkup).catch(() => {});
            }
          } else {
            // Flujo de creación de tarea
            delete userStates[chatId]; // Limpiar estado al procesar la entrada
            const res = await fetch(`http://localhost:3001/api/roadmap/add`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text, domain: domain || 'CORE' })
            }).catch(() => null);
            
            if (!res || !res.ok) {
              const errData = res ? await res.json().catch(() => ({})) : {};
              await sendTelegramMessage(token, chatId, `❌ Error al agregar la tarea: ${errData.error || 'Fallo de red'}`);
            } else {
              const data = await res.json();
              const taskId = data.id || domain;
              await sendTelegramMessage(token, chatId,
                `🆕 <b>Tarea Creada con Éxito</b>\n\nID: <code>${taskId}</code> registrado en <code>tareas_pendientes.md</code>.`);
              // Si fue iniciado desde un grupo via deep-link, confirmar allí también
              if (groupChatId && groupChatId !== chatId) {
                await sendTelegramMessage(token, groupChatId,
                  `🆕 <b>Tarea Creada desde Chat Privado</b>\n\nID: <code>${taskId}</code> \u2014 <i>${text.slice(0, 80)}${text.length > 80 ? '...' : ''}</i>`
                ).catch(() => {});
              }
            }
          }
          continue;
        }

        // ─── Interceptor AWAITING_CONFIRM (confirmación de acciones destructivas) ───
        if (userStates[chatId]?.step === 'AWAITING_CONFIRM' && queryId) {
          const { action, actionArg } = userStates[chatId];
          delete userStates[chatId];
          if (text === '/confirm_yes') {
            if      (action === 'git_push')         await executeGitPush(token, chatId, actionArg);
            else if (action === 'devserver_stop')   await executeDevServerStop(token, chatId, actionArg);
            else if (action === 'devserver_restart') {
              // Encadenar stop + start con un pequeño delay
              await executeDevServerStop(token, chatId, actionArg);
              setTimeout(() => executeDevServerStart(token, chatId, actionArg), 4000);
            }
            else if (action === 'fix_chunks')       await executeFixChunks(token, chatId, actionArg);
            else if (action === 'fix_pwa')          await executeFixPwa(token, chatId, actionArg);
            else if (action === 'rules_deploy') {
              const [cId, rType] = actionArg.split('|');
              await executeFirebaseRulesDeploy(token, chatId, cId, rType || 'all');
            }
          } else {
            await sendTelegramMessage(token, chatId, '❌ Operación cancelada.');
          }
          continue;
        }

        if (text.startsWith('/')) {
          if (userStates[chatId]?.context === 'search_task') {
            delete userStates[chatId];
          }

          const parts = text.split(' ');
          const rawCmd = parts[0].toLowerCase().split('@')[0];
          const arg = parts.slice(1).join(' ').trim();

          console.log(`[Telegram Commands] Comando recibido: ${rawCmd} en chat ${chatId} (callback: ${!!queryId})`);

          if (rawCmd === '/start' && arg && arg.startsWith('addtask_')) {
            // Deep-link desde grupo: addtask_{groupChatId}_{domain}
            const parts = arg.split('_');
            const groupChatId = parts[1] ? Number(parts[1]) : null;
            const domain = (parts[2] || 'CORE').toUpperCase();
            userStates[chatId] = { step: 'AWAITING_TEXT', domain, groupChatId };
            await sendTelegramMessage(token, chatId,
              `✍️ <b>Escribe tu Tarea (${domain})</b>\n\n` +
              `Describe la tarea que deseas agregar al roadmap y la registraré automáticamente.\n\n` +
              `<i>(Escribe "cancelar" para abortar)</i>`
            );
            continue;
          }

          if (rawCmd === '/start' && arg && arg.startsWith('searchtasks_')) {
            // Deep-link desde grupo: searchtasks_{groupChatId}
            const parts = arg.split('_');
            const groupChatId = parts[1] ? Number(parts[1]) : null;
            userStates[chatId] = { step: 'AWAITING_TEXT', context: 'search_task', groupChatId };
            await sendTelegramMessage(token, chatId,
              `🔍 <b>Búsqueda de Tareas en el Roadmap</b>\n\n` +
              `Escribe la palabra clave o término que deseas buscar en <code>tareas_pendientes.md</code>:\n\n` +
              `<i>(Escribe "cancelar" para abortar)</i>`
            );
            continue;
          }

          if (rawCmd === '/start' || rawCmd === '/help' || rawCmd === '/ayuda') {
            const helpText = `👋 <b>Asistente de Control de PROTOTIPE</b>\n\n` +
                             `Toca los botones o envía comandos para controlar la consola CLI remotamente:\n\n` +
                             `🩺 <b>Salud &amp; Estado:</b>\n` +
                             `• <code>/status</code> - Latencia y estado PWA de clientes.\n` +
                             `• <code>/crashes</code> - Últimos 5 fallos críticos.\n\n` +
                             `📝 <b>Briefing &amp; Preventas:</b>\n` +
                             `• <code>/leads</code> - Preventas completadas.\n\n` +
                             `💰 <b>Facturación &amp; Telemetría:</b>\n` +
                             `• <code>/billing</code> - Resumen financiero global.\n` +
                             `• <code>/telemetria [cliente]</code> - Estado de recepción y reporte de telemetría mensual.\n` +
                             `• <code>/telemetria_check</code> - Auditoría de cobertura de telemetría.\n\n` +
                             `⚙️ <b>DevOps &amp; Hosting:</b>\n` +
                             `• <code>/clientes</code> - Lista de clientes en el CLI.\n` +
                             `• <code>/deploy [cliente]</code> - Compilar y desplegar.\n` +
                             `• <code>/logs</code> - Últimos logs del servidor.\n\n` +
                             `🛠️ <b>Git — Versiones:</b>\n` +
                             `• <code>/git</code> - Status, log, commits sin push, publicar.\n\n` +
                             `🖥️ <b>Dev Server Vite:</b>\n` +
                             `• <code>/devserver [cliente]</code> - Estado, arrancar, detener.\n\n` +
                             `⚡ <b>Optimización &amp; Parches:</b>\n` +
                             `• <code>/fix [cliente]</code> - Dividir chunks, restablecer PWA.\n` +
                             `• <code>/rules</code> - Matriz de desviación y deploy de reglas Firebase.\n\n` +
                             `🧪 <b>Verificación E2E:</b>\n` +
                             `• <code>/tests</code> - Resultados de pruebas Playwright.\n\n` +
                             `📦 <b>Semillas Cores:</b>\n` +
                             `• <code>/cores</code> - Inventario y rutas de cores registrados.\n\n` +
                             `📋 <b>Roadmap &amp; Tareas:</b>\n` +
                             `• <code>/tasks</code> - Tareas pendientes.\n` +
                             `• <code>/addtask</code> - Agregar tarea con asistente.\n\n` +
                             `🔧 <b>Configuración:</b>\n` +
                             `• <code>/maintenance</code> - Modo mantenimiento.\n\n` +
                             `🔍 <b>Diagnóstico &amp; Salud:</b>\n` +
                             `• <code>/integrity</code> - Diagnóstico completo de consistencia y drifts.\n` +
                             `• <code>/integrity_autofix</code> - Reparar automáticamente todos los drifts fixables.\n` +
                             `• <code>/health</code> - Ping de salud a todos los clientes en producción.`;
            
            const replyMarkup = {
              inline_keyboard: [
                [
                  { text: '🩺 Salud / Status', callback_data: '/status' },
                  { text: '🚨 Ver Errores',   callback_data: '/crashes' }
                ],
                [
                  { text: '📝 Ver Preventas', callback_data: '/leads'   },
                  { text: '📊 Telemetría',    callback_data: '/telemetria' }
                ],
                [
                  { text: '🛠️ Git',           callback_data: '/git'      },
                  { text: '🖥️ Dev Server',  callback_data: '/devserver'}
                ],
                [
                  { text: '⚡ Optimizar (Fix)', callback_data: '/fix'      },
                  { text: '🔥 Reglas (Rules)',  callback_data: '/rules'    }
                ],
                [
                  { text: '🧪 Pruebas E2E',   callback_data: '/tests'    },
                  { text: '📦 Cores Semilla', callback_data: '/cores'    }
                ],
                [
                  { text: '📦 Clientes CLI', callback_data: '/clientes'    },
                  { text: '🔧 Mantenimiento', callback_data: '/maintenance' }
                ],
                [
                  { text: '📋 Tareas Roadmap', callback_data: '/tasks'     },
                  { text: '🔍 Diagnóstico',    callback_data: '/integrity' }
                ],
                [
                  { text: '🩺 Salud Clientes', callback_data: '/health'    },
                  { text: '🪵 Ver Logs',        callback_data: '/logs'      }
                ]
              ]
            };
            await sendTelegramMessage(token, chatId, helpText, replyMarkup);
            continue;
          } 
          else if (rawCmd === '/status' || rawCmd === '/salud') {
            const report = await getHealthStatusReport();
            const backMarkup = { inline_keyboard: [[{ text: '🏠 Menú Principal', callback_data: '/start' }]] };
            await sendTelegramMessage(token, chatId, report, backMarkup);
          } 
          else if (rawCmd === '/crashes' || rawCmd === '/errores') {
            const report = await getRecentCrashesReport();
            const backMarkup = { inline_keyboard: [[{ text: '🏠 Menú Principal', callback_data: '/start' }]] };
            await sendTelegramMessage(token, chatId, report, backMarkup);
          } 
          else if (rawCmd === '/leads' || rawCmd === '/briefings') {
            const report = await getRecentBriefingsReport();
            const backMarkup = { inline_keyboard: [[{ text: '🏠 Menú Principal', callback_data: '/start' }]] };
            await sendTelegramMessage(token, chatId, report, backMarkup);
          } 
          else if (rawCmd === '/billing' || rawCmd === '/comisiones') {
            const report = await getBillingSummaryReport();
            const backMarkup = { inline_keyboard: [[{ text: '🏠 Menú Principal', callback_data: '/start' }]] };
            await sendTelegramMessage(token, chatId, report, backMarkup);
          } 
          else if (rawCmd === '/telemetria') {
            if (!arg) {
              const list = await getClientInstancesList();
              if (list.length === 0) {
                const backMarkup = { inline_keyboard: [[{ text: '🏠 Menú Principal', callback_data: '/start' }]] };
                await sendTelegramMessage(token, chatId, '⚠️ No se encontraron clientes registrados para verificar telemetría.', backMarkup);
              } else {
                const textMsg = `📊 <b>Auditoría de Telemetría</b>\n\nSelecciona el cliente del cual deseas obtener su último reporte de facturación transmitido:\n\n` +
                                `<i>También puedes realizar una auditoría general de cobertura de todos los clientes.</i>`;
                const replyMarkup = {
                  inline_keyboard: [
                    ...list.map(c => [{ text: `📊 ${c}`, callback_data: `/telemetria ${c}` }]),
                    [{ text: '🩺 Auditoría de Cobertura', callback_data: '/telemetria_check' }],
                    [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                  ]
                };
                await sendTelegramMessage(token, chatId, textMsg, replyMarkup);
              }
            } else {
              const status = await getTelemetryStatusMsg(arg);
              const replyMarkup = {
                inline_keyboard: [
                  [
                    { text: '🔄 Refrescar', callback_data: `/telemetria ${arg}` },
                    { text: '↩️ Volver', callback_data: '/telemetria' }
                  ],
                  [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                ]
              };
              await sendTelegramMessage(token, chatId, status.text, replyMarkup);
            }
          }
          else if (rawCmd === '/telemetria_check') {
            const report = await getTelemetryCheckReport();
            const replyMarkup = {
              inline_keyboard: [
                [
                  { text: '🔄 Re-auditar', callback_data: '/telemetria_check' },
                  { text: '↩️ Volver', callback_data: '/telemetria' }
                ],
                [{ text: '🏠 Menú Principal', callback_data: '/start' }]
              ]
            };
            await sendTelegramMessage(token, chatId, report, replyMarkup);
          } 
          else if (rawCmd === '/clientes') {
            const list = await getClientInstancesList();
            if (list.length === 0) {
              const backMarkup = { inline_keyboard: [[{ text: '🏠 Menú Principal', callback_data: '/start' }]] };
              await sendTelegramMessage(token, chatId, '⚠️ No se encontraron clientes registrados en el CLI local.', backMarkup);
            } else {
              const textList = `📦 <b>Clientes Registrados en el CLI:</b>\n\n` + list.map(c => `• <code>${c}</code>`).join('\n');
              const replyMarkup = {
                inline_keyboard: [
                  ...list.map(c => [{ text: `🚀 Desplegar ${c}`, callback_data: `/deploy ${c}` }]),
                  [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                ]
              };
              await sendTelegramMessage(token, chatId, textList, replyMarkup);
            }
          } 
          else if (rawCmd === '/deploy') {
            if (!arg) {
              const list = await getClientInstancesList();
              const textList = `⚙️ <b>DevOps \u2014 Despliegues de Hosting:</b>\n\nSelecciona qué aplicación cliente deseas compilar y desplegar a Firebase Hosting:`;
              const replyMarkup = {
                inline_keyboard: list.length > 0
                  ? [
                      ...list.map(c => [{ text: `🚀 Desplegar ${c}`, callback_data: `/deploy ${c}` }]),
                      [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                    ]
                  : [
                      [{ text: '⚠️ No hay clientes registrados', callback_data: '/clientes' }],
                      [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                    ]
              };
              await sendTelegramMessage(token, chatId, textList, replyMarkup);
            } else {
              const list = await getClientInstancesList();
              if (!list.includes(arg)) {
                await sendTelegramMessage(token, chatId, `❌ El cliente <code>${arg}</code> no existe o no está registrado en el CLI.`);
              } else {
                // Job tracker: enviar mensaje "⏳" y guardar messageId para editarlo al terminar
                const msgId = await sendJobMessage(token, chatId,
                  `⏳ <b>Compilando y desplegando:</b> <code>${arg}</code>\n` +
                  `<i>Esto puede tardar 2\u20134 minutos. Por favor espera...</i>`
                );
                // Background IIFE \u2014 no bloquea el polling
                (async () => {
                  try {
                    const deployRes = await fetch(`http://localhost:3001/api/project/deploy`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ clientId: arg }),
                      signal: AbortSignal.timeout(600000) // 10 min máx
                    });
                    const deployData = deployRes.ok ? await deployRes.json().catch(() => ({})) : {};
                    const success = deployRes.ok && !deployData.error;
                    await editJobMessage(token, chatId, msgId,
                      success
                        ? `✅ <b>Deploy Completado:</b> <code>${arg}</code>\n\n🚀 Firebase Hosting actualizado exitosamente.`
                        : `❌ <b>Deploy Fallido:</b> <code>${arg}</code>\n\n<code>${deployData.error || 'Error desconocido en el servidor'}</code>`
                    );
                  } catch (err) {
                    await editJobMessage(token, chatId, msgId,
                      `❌ <b>Deploy \u2014 Error:</b> <code>${arg}</code>\n\n<code>${err.message}</code>`);
                  }
                })();
              }
            }
          }
          else if (rawCmd === '/maintenance') {
            const list = await getClientInstancesList();
            if (list.length === 0) {
              const backMarkup = { inline_keyboard: [[{ text: '🏠 Menú Principal', callback_data: '/start' }]] };
              await sendTelegramMessage(token, chatId, '⚠️ No se encontraron clientes registrados en el CLI local.', backMarkup);
            } else {
              const textList = `🛠️ <b>Gestión de Modo Mantenimiento:</b>\n\nSelecciona el cliente para consultar o cambiar su estado:`;
              const replyMarkup = {
                inline_keyboard: [
                  ...list.map(c => [{ text: `🛠️ Mantenimiento: ${c}`, callback_data: `/maintenance_select ${c}` }]),
                  [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                ]
              };
              await sendTelegramMessage(token, chatId, textList, replyMarkup);
            }
          }
          else if (rawCmd === '/maintenance_select') {
            if (!arg) {
              await sendTelegramMessage(token, chatId, '❌ Parámetro de cliente faltante.');
            } else {
              const res = await fetch(`http://localhost:3001/api/project/maintenance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: arg })
              }).catch(() => null);
              
              if (!res || !res.ok) {
                await sendTelegramMessage(token, chatId, `❌ Error al consultar el modo mantenimiento para <code>${arg}</code>.`);
              } else {
                const data = await res.json();
                const isMaintenance = data.maintenanceMode;
                const statusEmoji = isMaintenance ? '🔴 Modo Mantenimiento ACTIVO' : '🟢 Modo Producción ACTIVO (Normal)';
                
                const textMsg = `⚙️ <b>Modo Mantenimiento - ${arg.toUpperCase()}</b>\n` +
                                `----------------------------------\n` +
                                `🔥 <b>Proyecto Firebase:</b> <code>${data.projectId}</code>\n` +
                                `📌 <b>Estado Actual:</b> ${statusEmoji}\n` +
                                `----------------------------------\n` +
                                `Selecciona una acción para cambiar el estado de la aplicación:`;
                
                const replyMarkup = {
                  inline_keyboard: [
                    [
                      { text: '🟢 Activar Mantenimiento', callback_data: `/maintenance_set ${arg} true` },
                      { text: '🔴 Desactivar Mantenimiento', callback_data: `/maintenance_set ${arg} false` }
                    ],
                    [
                      { text: '↩️ Volver a Mantenimiento', callback_data: '/maintenance' },
                      { text: '🏠 Menú Principal', callback_data: '/start' }
                    ]
                  ]
                };
                await sendTelegramMessage(token, chatId, textMsg, replyMarkup);
              }
            }
          }
          else if (rawCmd === '/maintenance_set') {
            const argParts = arg.split(' ');
            const targetClient = argParts[0];
            const nextStatusStr = argParts[1];
            if (!targetClient || !nextStatusStr) {
              await sendTelegramMessage(token, chatId, '❌ Parámetros inválidos.');
            } else {
              const statusVal = nextStatusStr === 'true';
              const res = await fetch(`http://localhost:3001/api/project/maintenance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: targetClient, status: statusVal })
              }).catch(() => null);
              
              if (!res || !res.ok) {
                await sendTelegramMessage(token, chatId, `❌ Error al cambiar el estado de mantenimiento para <code>${targetClient}</code>.`);
              } else {
                const stateEmoji = statusVal ? '🔴 ACTIVADO' : '🟢 DESACTIVADO';
                const backMarkup = {
                  inline_keyboard: [
                    [{ text: '↩️ Volver a Mantenimiento', callback_data: '/maintenance' }],
                    [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                  ]
                };
                await sendTelegramMessage(token, chatId, `✅ <b>Mantenimiento Actualizado</b>\n\nEl modo mantenimiento para <code>${targetClient}</code> ha sido ${stateEmoji} exitosamente.`, backMarkup);
              }
            }
          }
          else if (rawCmd === '/tasks' || rawCmd === '/tareas') {
            const res = await fetch('http://localhost:3001/api/roadmap').catch(() => null);
            if (!res || !res.ok) {
              await sendTelegramMessage(token, chatId, '❌ Error al consultar la lista de tareas pendientes del Roadmap.');
            } else {
              const data = await res.json();
              let allTasks = data.tasks || [];
              let filterDomain = arg ? arg.toUpperCase() : null;

              if (filterDomain) {
                allTasks = allTasks.filter(t => 
                  t.id?.toUpperCase().startsWith(filterDomain) || 
                  (t.domains && t.domains.includes(filterDomain))
                );
              }

              const pending = allTasks.filter(t => !t.completed);
              const filterTitle = filterDomain ? ` [Filtro: ${filterDomain}]` : '';

              if (pending.length === 0) {
                const backMarkup = {
                  inline_keyboard: [
                    [
                      { text: '🆕 Crear Tarea', callback_data: '/addtask' },
                      { text: '🔍 Limpiar Filtro', callback_data: '/tasks' }
                    ],
                    [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                  ]
                };
                await sendTelegramMessage(token, chatId, `📋 <b>Roadmap de Tareas${filterTitle}:</b>\n\n✅ ¡No hay tareas pendientes! Todo al día.`, backMarkup);
              } else {
                let text = `📋 <b>Tareas Pendientes${filterTitle} (${pending.length}):</b>\n\n`;
                const displayList = pending.slice(0, 6);
                displayList.forEach(t => {
                  text += `• <b>${t.id}</b>: ${escapeHtml(t.text || t.rawLine)}\n`;
                });
                if (pending.length > 6) {
                  text += `\n<i>... y ${pending.length - 6} tareas más.</i>`;
                }

                const replyMarkup = {
                  inline_keyboard: [
                    ...displayList.map(t => [
                      { text: `ℹ️ Detalle ${t.id}`, callback_data: `/task_detail ${t.id}` },
                      { text: `✅ Completar`, callback_data: `/completetask ${t.lineIndex} ${t.id}` }
                    ]),
                    [
                      { text: '🆕 Crear Tarea', callback_data: '/addtask' },
                      { text: '✅ Ver Hechas', callback_data: '/tasks_completed' }
                    ],
                    [
                      { text: '🔍 Filtrar', callback_data: '/tasks_filter' },
                      { text: '🔎 Buscar', callback_data: '/tasks_search' }
                    ],
                    [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                  ]
                };
                await sendTelegramMessage(token, chatId, text, replyMarkup);
              }
            }
          }
          else if (rawCmd === '/tasks_completed') {
            const res = await fetch('http://localhost:3001/api/roadmap').catch(() => null);
            if (!res || !res.ok) {
              await sendTelegramMessage(token, chatId, '❌ Error al consultar las tareas completadas.');
            } else {
              const data = await res.json();
              const completed = (data.tasks || []).filter(t => t.completed);

              if (completed.length === 0) {
                const backMarkup = {
                  inline_keyboard: [
                    [{ text: '📋 Ver Pendientes', callback_data: '/tasks' }],
                    [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                  ]
                };
                await sendTelegramMessage(token, chatId, '📋 <b>Historial de Tareas Hechas:</b>\n\nNo hay tareas completadas registradas en el Roadmap.', backMarkup);
              } else {
                let text = `✅ <b>Historial de Tareas Hechas (${completed.length}):</b>\n\n`;
                const displayList = completed.slice(0, 6);
                displayList.forEach(t => {
                  text += `• <b>${t.id}</b>: <s>${escapeHtml(t.text || t.id)}</s>\n`;
                });
                if (completed.length > 6) {
                  text += `\n<i>... y ${completed.length - 6} tareas completadas más.</i>`;
                }

                const replyMarkup = {
                  inline_keyboard: [
                    ...displayList.map(t => [
                      { text: `ℹ️ Detalle ${t.id}`, callback_data: `/task_detail ${t.id}` },
                      { text: `↩️ Reabrir`, callback_data: `/completetask ${t.lineIndex} ${t.id}` }
                    ]),
                    [
                      { text: '📋 Ver Pendientes', callback_data: '/tasks' },
                      { text: '📄 Exportar Historial', callback_data: '/tasks_export' }
                    ],
                    [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                  ]
                };
                await sendTelegramMessage(token, chatId, text, replyMarkup);
              }
            }
          }
          else if (rawCmd === '/tasks_export') {
            const text = '📄 <b>Exportación de Historial de Tareas Hechas</b>\n\n' +
                         'Selecciona el rango de tareas completadas que deseas exportar en un archivo Markdown (.md):\n\n' +
                         '<i>El bot generará el archivo en caliente y te lo enviará como un adjunto descargable.</i>';
            const replyMarkup = {
              inline_keyboard: [
                [
                  { text: '⏱️ Últimas 10', callback_data: '/tasks_export_run 10' },
                  { text: '📊 Últimas 50', callback_data: '/tasks_export_run 50' }
                ],
                [
                  { text: '📈 Últimas 100', callback_data: '/tasks_export_run 100' },
                  { text: '📚 Todas las Hechas', callback_data: '/tasks_export_run all' }
                ],
                [
                  { text: '📋 Volver a Tareas', callback_data: '/tasks' },
                  { text: '🏠 Menú Principal', callback_data: '/start' }
                ]
              ]
            };
            await sendTelegramMessage(token, chatId, text, replyMarkup);
          }
          else if (rawCmd === '/tasks_export_run') {
            if (!arg) {
              await sendTelegramMessage(token, chatId, '❌ Rango de exportación inválido.');
            } else {
              const res = await fetch('http://localhost:3001/api/roadmap').catch(() => null);
              if (!res || !res.ok) {
                await sendTelegramMessage(token, chatId, '❌ Error al consultar las tareas del Roadmap para exportación.');
              } else {
                const data = await res.json();
                const completed = (data.tasks || []).filter(t => t.completed);

                if (completed.length === 0) {
                  await sendTelegramMessage(token, chatId, '📋 <b>Exportación Cancelada:</b> No hay tareas completadas en tu Roadmap.');
                } else {
                  let limit = arg === 'all' ? completed.length : parseInt(arg, 10);
                  if (isNaN(limit)) limit = completed.length;

                  const tasksToExport = completed.slice(0, limit);
                  const rangeLabel = arg === 'all' ? 'Todas' : `Últimas ${limit}`;

                  let md = `# 📄 Reporte de Tareas Completadas - PROTOTIPE\n`;
                  md += `Generado automáticamente vía Telegram el: ${new Date().toLocaleDateString('es-ES')}\n`;
                  md += `Rango de exportación: ${rangeLabel} (Total: ${tasksToExport.length} tareas)\n`;
                  md += `========================================================================\n\n`;

                  tasksToExport.forEach((t, index) => {
                    // Los detalles de tarea están en t.detail (estructura de la API /api/roadmap)
                    const d = t.detail || {};
                    const fecha      = d.fecha      || t.fecha || t.date || '';
                    const fechaFin   = d.fechaFin   || t.fechaFin || '';
                    const estatus    = d.estatus    || (t.completed ? 'Completada' : 'Pendiente');
                    const descripcion = d.descripcion || t.descripcion || [];
                    const archivos   = d.archivos   || t.archivos || [];

                    // Extraer solo el título limpio sin el prefijo "Tarea ID: "
                    const cleanTitle = (t.text || t.rawLine || t.id)
                      .replace(/^Tarea\s+[\w-]+:\s*/i, '')
                      .replace(/~~|\*\*/g, '')
                      .trim();

                    md += `## [${index + 1}] ${t.id} — ${cleanTitle}\n`;
                    md += `- **Estatus:** ${estatus}\n`;
                    if (fecha)    md += `- **Fecha de Registro:** ${fecha}\n`;
                    if (fechaFin) md += `- **Fecha de Finalización:** ${fechaFin}\n`;
                    if (descripcion.length > 0) {
                      md += `- **Descripción:**\n`;
                      descripcion.forEach(line => {
                        md += `  * ${line}\n`;
                      });
                    }
                    if (archivos.length > 0) {
                      md += `- **Archivos Afectados:**\n`;
                      archivos.forEach(f => {
                        md += `  * [${f.action || 'MODIFY'}] ${f.name}\n`;
                      });
                    }
                    md += `\n------------------------------------------------------------------------\n\n`;
                  });


                  try {
                    const formData = new FormData();
                    formData.append('chat_id', chatId.toString());
                    formData.append('caption', `📄 **Reporte de Tareas Hechas (${rangeLabel})**\n\nSe han exportado ${tasksToExport.length} tareas completadas en formato Markdown.`);
                    
                    const blob = new Blob([md], { type: 'text/markdown' });
                    formData.append('document', blob, `tareas_completadas_${arg}.md`);

                    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
                      method: 'POST',
                      body: formData
                    });

                    if (!tgRes.ok) {
                      const tgErr = await tgRes.json().catch(() => ({}));
                      console.error('[Telegram Export Error] Telegram API respondió con error:', tgErr);
                      await sendTelegramMessage(token, chatId, `❌ Error al enviar el reporte por Telegram: ${tgErr.description || 'Fallo de red'}`);
                    } else {
                      const backMarkup = {
                        inline_keyboard: [
                          [
                            { text: '📋 Ver Roadmap', callback_data: '/tasks' },
                            { text: '🏠 Menú Principal', callback_data: '/start' }
                          ]
                        ]
                      };
                      await sendTelegramMessage(token, chatId, `✅ **Exportación Finalizada**\n\nTu archivo de reporte para el rango <code>${rangeLabel}</code> ha sido generado y enviado con éxito.`, backMarkup);
                    }
                  } catch (err) {
                    console.error('[Telegram Export Exception]:', err.message);
                    await sendTelegramMessage(token, chatId, `❌ Error interno al generar el documento: ${err.message}`);
                  }
                }
              }
            }
          }
          else if (rawCmd === '/tasks_filter') {
            const text = '🔍 <b>Filtrar Tareas por Dominio</b>\n\nSelecciona el dominio de tareas que deseas ver:';
            const replyMarkup = {
              inline_keyboard: [
                [
                  { text: '🌐 CORE', callback_data: '/tasks CORE' },
                  { text: '🛠️ CLI', callback_data: '/tasks CLI' }
                ],
                [
                  { text: '🎨 DASH', callback_data: '/tasks DASH' },
                  { text: '📐 TPL', callback_data: '/tasks TPL' }
                ],
                [
                  { text: '🔥 INST', callback_data: '/tasks INST' },
                  { text: '📝 DOC', callback_data: '/tasks DOC' }
                ],
                [
                  { text: '💼 BIZ', callback_data: '/tasks BIZ' },
                  { text: '📋 Ver Todas', callback_data: '/tasks' }
                ],
                [{ text: '🏠 Menú Principal', callback_data: '/start' }]
              ]
            };
            await sendTelegramMessage(token, chatId, text, replyMarkup);
          }
          else if (rawCmd === '/tasks_search') {
            if (botUsername) {
              const payload = `searchtasks_${chatId}`;
              const customText = 
                `🔎 <b>Búsqueda de Tareas</b>\n\n` +
                `Presiona el botón de abajo para iniciar la búsqueda en chat privado con el bot.\n\n` +
                `El resultado se enviará y confirmará aquí en el grupo.`;
              const replyMarkup = {
                inline_keyboard: [
                  [{ text: '🔍 Buscar Tareas', url: `https://t.me/${botUsername}?start=${payload}` }],
                  [{ text: '↩️ Volver', callback_data: '/tasks' }]
                ]
              };
              await sendTelegramMessage(token, chatId, customText, replyMarkup);
            } else {
              userStates[chatId] = { step: 'AWAITING_TEXT', context: 'search_task', groupChatId: null };
              await sendTelegramMessage(token, chatId, `🔎 <b>Escribe tu búsqueda:</b>\n\nEscribe el término a buscar en este chat.\n\n<i>(Escribe "cancelar" para abortar)</i>`);
            }
          }
          else if (rawCmd === '/task_detail') {
            if (!arg) {
              await sendTelegramMessage(token, chatId, '❌ ID de tarea faltante para la vista de detalle.');
            } else {
              const report = await getTaskDetailReport(arg);
              const res = await fetch('http://localhost:3001/api/roadmap').catch(() => null);
              let taskBtn = [];
              if (res?.ok) {
                const data = await res.json();
                const t = (data.tasks || []).find(x => x.id?.toLowerCase() === arg.trim().toLowerCase());
                if (t) {
                  if (t.completed) {
                    taskBtn = [{ text: `↩️ Reabrir Tarea`, callback_data: `/completetask ${t.lineIndex} ${t.id}` }];
                  } else {
                    taskBtn = [{ text: `✅ Completar Tarea`, callback_data: `/completetask ${t.lineIndex} ${t.id}` }];
                  }
                }
              }

              const replyMarkup = {
                inline_keyboard: [
                  taskBtn.length > 0 ? taskBtn : [],
                  [
                    { text: '📋 Ver Roadmap', callback_data: '/tasks' },
                    { text: '🏠 Menú Principal', callback_data: '/start' }
                  ]
                ].filter(arr => arr.length > 0)
              };
              await sendTelegramMessage(token, chatId, report, replyMarkup);
            }
          }
          else if (rawCmd === '/completetask') {
            const argParts = arg.split(' ');
            const lineIndex = argParts[0];
            const taskId = argParts[1];
            if (!lineIndex || !taskId) {
              await sendTelegramMessage(token, chatId, '❌ Parámetros de tarea inválidos.');
            } else {
              const res = await fetch(`http://localhost:3001/api/roadmap/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lineIndex: parseInt(lineIndex, 10) })
              }).catch(() => null);
              
              if (!res || !res.ok) {
                await sendTelegramMessage(token, chatId, `❌ Error al cambiar el estado de la tarea <code>${taskId}</code>.`);
              } else {
                const resRoad = await fetch('http://localhost:3001/api/roadmap').catch(() => null);
                let isDoneNow = false;
                if (resRoad?.ok) {
                  const roadData = await resRoad.json();
                  const t = (roadData.tasks || []).find(x => x.id === taskId);
                  if (t) isDoneNow = t.completed;
                }

                const backMarkup = {
                  inline_keyboard: [
                    [
                      { text: '📋 Ver Roadmap', callback_data: '/tasks' },
                      { text: '🏠 Menú Principal', callback_data: '/start' }
                    ]
                  ]
                };
                
                const actionLabel = isDoneNow ? 'Completada' : 'Reabierta';
                const emoji = isDoneNow ? '✅' : '⏳';
                await sendTelegramMessage(token, chatId, `${emoji} <b>Estado de Tarea Actualizado</b>\n\nLa tarea <code>${taskId}</code> fue marcada como <b>${actionLabel}</b> exitosamente en <code>tareas_pendientes.md</code>.`, backMarkup);
              }
            }
          }
          else if (rawCmd === '/addtask') {
            if (arg) {
              const allowed = ['CORE', 'CLI', 'DASH', 'TPL', 'PLT', 'INST', 'DOC', 'LND', 'BIZ'];
              const words = arg.split(' ');
              let domain = 'CORE';
              let taskText = arg;
              if (allowed.includes(words[0].toUpperCase())) {
                domain = words[0].toUpperCase();
                taskText = words.slice(1).join(' ');
              }
              
              const res = await fetch(`http://localhost:3001/api/roadmap/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: taskText, domain })
              }).catch(() => null);
              
              if (!res || !res.ok) {
                const errData = res ? await res.json().catch(() => ({})) : {};
                await sendTelegramMessage(token, chatId, `❌ Error al agregar la tarea: ${errData.error || 'Fallo de red'}`);
              } else {
                const data = await res.json();
                const taskId = data.id || domain;
                await sendTelegramMessage(token, chatId, `🆕 <b>Tarea Creada con Éxito (Directo)</b>\n\nLa tarea se agregó bajo el ID <code>${taskId}</code> en tu <code>tareas_pendientes.md</code>.`);
              }
            } else {
              const helpText = `🆕 <b>Creación de Tarea (Paso 1/3)</b>\n\n` +
                               `Selecciona el **Dominio** técnico de la tarea que deseas agregar:`;
              
              const replyMarkup = {
                inline_keyboard: [
                  [
                    { text: '🌐 CORE (Núcleo)', callback_data: '/addtask_dom CORE' },
                    { text: '🛠️ CLI (Herramientas)', callback_data: '/addtask_dom CLI' }
                  ],
                  [
                    { text: '🎨 DASH (Dashboard)', callback_data: '/addtask_dom DASH' },
                    { text: '📐 TPL (Plantillas)', callback_data: '/addtask_dom TPL' }
                  ],
                  [
                    { text: '🔥 INST (Instancias)', callback_data: '/addtask_dom INST' },
                    { text: '📝 DOC (Documentación)', callback_data: '/addtask_dom DOC' }
                  ],
                  [
                    { text: '💼 BIZ (Negocio/CRM)', callback_data: '/addtask_dom BIZ' },
                    { text: '❌ Cancelar', callback_data: '/addtask_cancel' }
                  ]
                ]
              };
              await sendTelegramMessage(token, chatId, helpText, replyMarkup);
            }
          }
          else if (rawCmd === '/addtask_dom') {
            const domain = arg.toUpperCase();
            const catText = `🆕 <b>Creación de Tarea (Paso 2/3) — Dominio: ${domain}</b>\n\n` +
                            `Selecciona la **Categoría** de la tarea:`;
            
            const replyMarkup = {
              inline_keyboard: [
                [
                  { text: '🐛 Bug / Error', callback_data: `/addtask_cat ${domain} BUG` },
                  { text: '✨ Feature / Mejora', callback_data: `/addtask_cat ${domain} FEAT` }
                ],
                [
                  { text: '📝 Documentación', callback_data: `/addtask_cat ${domain} DOC` },
                  { text: '✍️ Texto Libre', callback_data: `/addtask_cat ${domain} CUSTOM` }
                ],
                [
                  { text: '↩️ Volver a Dominios', callback_data: '/addtask' }
                ]
              ]
            };
            await sendTelegramMessage(token, chatId, catText, replyMarkup);
          }
          else if (rawCmd === '/addtask_cat') {
            const argParts = arg.split(' ');
            const domain = argParts[0];
            const cat = argParts[1];
            
            if (!domain || !cat) {
              await sendTelegramMessage(token, chatId, '❌ Parámetros del asistente inválidos.');
            } else if (cat === 'CUSTOM') {
              if (botUsername) {
                // Deep-link al DM del bot — única forma confiable de capturar texto libre en grupos
                // (Telegram Privacy Mode bloquea texto libre de bots en grupos por defecto)
                const payload = `addtask_${chatId}_${domain}`;
                const customText =
                  `✍️ <b>Escribe tu Tarea (${domain})</b>\n\n` +
                  `Presiona el botón para abrir el chat privado con el bot y escribe tu descripción allí.\n` +
                  `El bot la registrará y confirmará aquí en el grupo.`;
                const replyMarkup = {
                  inline_keyboard: [
                    [{ text: '🗒️ Escribir Descripción', url: `https://t.me/${botUsername}?start=${payload}` }],
                    [{ text: '↩️ Cancelar', callback_data: '/addtask_cancel' }]
                  ]
                };
                await sendTelegramMessage(token, chatId, customText, replyMarkup);
              } else {
                // Fallback sin botUsername (chat privado o username no disponible)
                userStates[chatId] = { step: 'AWAITING_TEXT', domain, groupChatId: null };
                const customText =
                  `✍️ <b>Escribe tu Tarea (${domain})</b>\n\n` +
                  `Escribe la descripción de tu tarea como mensaje en este chat.\n\n` +
                  `<i>(Escribe "cancelar" para abortar)</i>`;
                await sendTelegramMessage(token, chatId, customText);
              }
            } else {
              let templates = [];
              let catTitle = '';
              
              if (cat === 'BUG') {
                catTitle = '🐛 Bug / Error';
                templates = [
                  'Corregir advertencias de Linter y prebuild',
                  'Depurar reglas de seguridad de Firebase',
                  'Resolver desbordamiento responsivo en UI móvil',
                  'Solucionar error de cache / persistencia offline'
                ];
              } else if (cat === 'FEAT') {
                catTitle = '✨ Feature / Mejora';
                templates = [
                  'Implementar componente atómico reusable',
                  'Crear sandbox interactivo en dev-dashboard',
                  'Optimizar renders y rendimiento de componentes',
                  'Añadir validación de esquemas Zod en formularios'
                ];
              } else if (cat === 'DOC') {
                catTitle = '📝 Documentación';
                templates = [
                  'Crear manual técnico de integración',
                  'Registrar cambios recientes en bitácora',
                  'Sincronizar y actualizar mapa de aplicación',
                  'Indexar documentos en mapa_documentacion_ia.md'
                ];
              }
              
              const tmplText = `🆕 <b>Creación de Tarea (Paso 3/3) — ${catTitle} (${domain})</b>\n\n` +
                               `Selecciona una de las plantillas predefinidas para crear la tarea de inmediato:`;
              
              const replyMarkup = {
                inline_keyboard: [
                  ...templates.map(t => [
                    { text: `• ${t.slice(0, 36)}...`, callback_data: `/addtask_submit ${domain} ${t}` }
                  ]),
                  [
                    { text: `↩️ Volver`, callback_data: `/addtask_dom ${domain}` }
                  ]
                ]
              };
              await sendTelegramMessage(token, chatId, tmplText, replyMarkup);
            }
          }
          else if (rawCmd === '/addtask_submit') {
            const argParts = arg.split(' ');
            const domain = argParts[0];
            const taskText = argParts.slice(1).join(' ');
            
            if (!domain || !taskText) {
              await sendTelegramMessage(token, chatId, '❌ Parámetros de envío inválidos.');
            } else {
              const res = await fetch(`http://localhost:3001/api/roadmap/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: taskText, domain })
              }).catch(() => null);
              
              if (!res || !res.ok) {
                const errData = res ? await res.json().catch(() => ({})) : {};
                await sendTelegramMessage(token, chatId, `❌ Error al agregar la tarea: ${errData.error || 'Fallo de red'}`);
              } else {
                const data = await res.json();
                const taskId = data.id || domain;
                await sendTelegramMessage(token, chatId, `🆕 <b>Tarea Creada con Éxito (Plantilla)</b>\n\nSe ha registrado la tarea bajo el ID <code>${taskId}</code> en <code>tareas_pendientes.md</code>.`);
              }
            }
          }
          else if (rawCmd === '/addtask_cancel') {
            delete userStates[chatId];
            await sendTelegramMessage(token, chatId, '❌ Creación de tarea cancelada.');
          }
          else if (rawCmd === '/integrity' || rawCmd === '/diagnostico') {
            const jobMsgId = await sendJobMessage(token, chatId, '🔍 <b>Ejecutando diagnóstico...</b>\n<i>Analizando consistencia del ecosistema.</i>');
            (async () => {
              const res = await fetch('http://localhost:3001/api/integrity/status').catch(() => null);
              if (!res || !res.ok) {
                await editJobMessage(token, chatId, jobMsgId, '❌ Error al consultar la integridad física del ecosistema.');
                return;
              }
              const data = await res.json();

              const codeDrifts     = data.codeDrifts     || [];
              const roadmapDrifts  = data.roadmapDrifts  || [];
              const sandboxDrifts  = data.sandboxDrifts  || [];
              const commitDrifts   = data.commitDrifts   || [];
              const mapMissing     = codeDrifts.filter(d => d.type === 'MAP_MISSING');
              const fileMissing    = codeDrifts.filter(d => d.type === 'FILE_NOT_FOUND');
              const hasFixable     = mapMissing.length + fileMissing.length + sandboxDrifts.length + roadmapDrifts.length > 0;

              // Extraer advertencias de linter del stderr
              const linterLines    = (data.stderr || '').split('\n').filter(l => l.trim().startsWith('- [Fallo'));
              const libraryOk      = data.stdout?.includes('INTEGRIDAD DE LA BIBLIOTECA AL 100%');

              let text = `🔍 <b>Diagnóstico del Ecosistema PROTOTIPE</b>\n`;
              text += `📅 ${new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}\n\n`;

              // Sección Biblioteca
              text += libraryOk
                ? `✅ <b>Biblioteca:</b> Integridad al 100%\n`
                : `⚠️ <b>Biblioteca:</b> Revisar integridad\n`;

              // Drifts críticos y medios
              if (!hasFixable && commitDrifts.length === 0) {
                text += `✅ <b>Drifts:</b> Ninguno detectado — sistema limpio\n`;
              } else {
                text += `\n📊 <b>Drifts detectados:</b>\n`;
                if (roadmapDrifts.length > 0)  text += `  🔴 ${roadmapDrifts.length} tarea(s) sin entrada en bitácora <i>(HIGH)</i>\n`;
                if (mapMissing.length > 0)      text += `  🟡 ${mapMissing.length} archivo(s) sin registrar en mapa <i>(MEDIUM)</i>\n`;
                if (fileMissing.length > 0)     text += `  🟡 ${fileMissing.length} referencia(s) rotas en roadmap <i>(MEDIUM)</i>\n`;
                if (sandboxDrifts.length > 0)   text += `  🟡 ${sandboxDrifts.length} sandbox(es) faltante(s) <i>(MEDIUM)</i>\n`;
                if (commitDrifts.length > 0)    text += `  🔵 ${commitDrifts.length} tarea(s) sin commit Git asociado <i>(INFO)</i>\n`;
              }

              // Advertencias de linter
              if (linterLines.length > 0) {
                text += `\n⚠️ <b>Linter (${linterLines.length} advertencias):</b>\n`;
                linterLines.slice(0, 2).forEach(l => {
                  text += `  • ${escapeHtml(l.replace(/^\s*-\s+\[Fallo[^\]]*\]\s*/,'').trim())}\n`;
                });
                if (linterLines.length > 2) text += `  <i>... y ${linterLines.length - 2} más.</i>\n`;
              }

              // Detalles de drifts (máx 3 por categoría)
              if (hasFixable) {
                text += `\n<b>📋 Detalle:</b>\n`;
                [...roadmapDrifts.slice(0,2), ...mapMissing.slice(0,2), ...fileMissing.slice(0,1), ...sandboxDrifts.slice(0,1)]
                  .forEach(d => { text += `  • <code>${escapeHtml(d.id || '')}</code> — ${escapeHtml(d.message || '').slice(0,80)}\n`; });
              }

              // Botones
              const keyboard = [];
              if (hasFixable) keyboard.push([{ text: '🔧 Reparar Todo Automáticamente', callback_data: '/integrity_autofix' }]);
              keyboard.push([{ text: '📄 Exportar Reporte Completo', callback_data: '/integrity_report' }]);
              keyboard.push([{ text: '🔄 Re-ejecutar', callback_data: '/integrity' }, { text: '🏠 Menú', callback_data: '/start' }]);

              await editJobMessage(token, chatId, jobMsgId, text, { inline_keyboard: keyboard });
            })();
          }
          else if (rawCmd === '/integrity_autofix') {
            const msgId = await sendJobMessage(token, chatId,
              '⚡ <b>Reparación automática en curso...</b>\n<i>Ejecutando los 4 fixers de integridad en secuencia.</i>'
            );
            (async () => {
              const backMarkup = {
                inline_keyboard: [
                  [{ text: '🔍 Ver Diagnóstico', callback_data: '/integrity' },
                   { text: '🏠 Menú', callback_data: '/start' }]
                ]
              };
              try {
                // 1. Obtener estado actual
                const resStatus = await fetch('http://localhost:3001/api/integrity/status').catch(() => null);
                if (!resStatus || !resStatus.ok) throw new Error('No se pudo obtener el estado de integridad.');
                const st = await resStatus.json();

                const codeDrifts    = st.codeDrifts    || [];
                const roadmapDrifts = st.roadmapDrifts || [];
                const sandboxDrifts = st.sandboxDrifts || [];
                const mapMissing    = codeDrifts.filter(d => d.type === 'MAP_MISSING');
                const fileMissing   = codeDrifts.filter(d => d.type === 'FILE_NOT_FOUND');

                const results = [];

                // Fixer 1: autocureLibrary
                await fetch('http://localhost:3001/api/integrity/autofix', { method: 'POST' }).catch(() => {});
                results.push(`✅ <b>Fixer 1 — Auto-cure catálogo</b>: ejecutado`);

                // Fixer 2: fix-map-bulk (MAP_MISSING)
                if (mapMissing.length > 0) {
                  const fmRes = await fetch('http://localhost:3001/api/integrity/fix-map-bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ files: mapMissing.map(d => ({ file: d.file, id: d.id })) })
                  }).catch(() => null);
                  const fmData = fmRes && fmRes.ok ? await fmRes.json() : null;
                  results.push(`✅ <b>Fixer 2 — Registro en mapa:</b> ${fmData?.message || `${mapMissing.length} archivo(s) procesado(s)`}`);
                } else {
                  results.push(`⏭️ <b>Fixer 2 — Registro en mapa:</b> sin drifts pendientes`);
                }

                // Fixer 3: prune-drifts (FILE_NOT_FOUND)
                if (fileMissing.length > 0) {
                  const prRes = await fetch('http://localhost:3001/api/integrity/prune-drifts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ files: fileMissing.map(d => ({ file: d.file, id: d.id })) })
                  }).catch(() => null);
                  const prData = prRes && prRes.ok ? await prRes.json() : null;
                  results.push(`✅ <b>Fixer 3 — Purga de referencias rotas:</b> ${prData?.message || `${fileMissing.length} referencia(s) purgada(s)`}`);
                } else {
                  results.push(`⏭️ <b>Fixer 3 — Purga de referencias:</b> sin referencias rotas`);
                }

                // Fixer 4: scaffold-sandbox-bulk
                if (sandboxDrifts.length > 0) {
                  const sbRes = await fetch('http://localhost:3001/api/integrity/scaffold-sandbox-bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sandboxes: sandboxDrifts.map(d => ({ technicalName: d.technicalName || d.id, fullName: d.fullName || d.id })) })
                  }).catch(() => null);
                  const sbData = sbRes && sbRes.ok ? await sbRes.json() : null;
                  results.push(`✅ <b>Fixer 4 — Scaffolds de sandbox:</b> ${sbData?.message || `${sandboxDrifts.length} sandbox(es) creado(s)`}`);
                } else {
                  results.push(`⏭️ <b>Fixer 4 — Scaffolds de sandbox:</b> sin sandboxes faltantes`);
                }

                // Verificación post-fix
                const resPost = await fetch('http://localhost:3001/api/integrity/status').catch(() => null);
                const postSt  = resPost && resPost.ok ? await resPost.json() : null;
                const remaining = postSt
                  ? (postSt.codeDrifts?.length || 0) + (postSt.roadmapDrifts?.length || 0) + (postSt.sandboxDrifts?.length || 0)
                  : null;

                let finalText = `⚡ <b>Reparación Automática Completada</b>\n\n`;
                finalText += results.join('\n') + '\n\n';
                finalText += remaining === 0
                  ? `✅ <b>Verificación post-fix:</b> ¡Sistema al 100% de integridad!`
                  : remaining !== null
                    ? `⚠️ <b>Verificación post-fix:</b> ${remaining} drift(s) requieren atención manual. Ejecuta /integrity para el detalle.`
                    : `ℹ️ No se pudo verificar el estado post-fix.`;

                await editJobMessage(token, chatId, msgId, finalText, backMarkup);

              } catch (err) {
                await editJobMessage(token, chatId, msgId,
                  `❌ <b>Error en Reparación Automática:</b>\n<code>${escapeHtml(err.message)}</code>`,
                  backMarkup
                );
              }
            })();
          }
          else if (rawCmd === '/integrity_report') {
            // Exporta el reporte completo como documento .txt
            const res = await fetch('http://localhost:3001/api/integrity/status').catch(() => null);
            if (!res || !res.ok) {
              await sendTelegramMessage(token, chatId, '❌ Error al obtener el reporte de integridad.');
            } else {
              const data = await res.json();
              const lines = [
                '=== REPORTE DE INTEGRIDAD PROTOTIPE ===',
                `Fecha: ${new Date().toLocaleString('es-CO')}`,
                '',
                '--- STDOUT (Verificación Biblioteca) ---',
                data.stdout || '(vacío)',
                '',
                '--- STDERR (Linter & Advertencias) ---',
                data.stderr || '(ninguna)',
                '',
                '--- ROADMAP DRIFTS ---',
                (data.roadmapDrifts || []).length === 0 ? '(ninguno)' : (data.roadmapDrifts || []).map(d => `[${d.severity}] ${d.id}: ${d.message}`).join('\n'),
                '',
                '--- CODE DRIFTS ---',
                (data.codeDrifts || []).length === 0 ? '(ninguno)' : (data.codeDrifts || []).map(d => `[${d.severity}] [${d.type}] ${d.id}: ${d.message}`).join('\n'),
                '',
                '--- SANDBOX DRIFTS ---',
                (data.sandboxDrifts || []).length === 0 ? '(ninguno)' : (data.sandboxDrifts || []).map(d => `${d.id}: ${d.message || ''}`).join('\n'),
                '',
                '--- COMMIT DRIFTS ---',
                (data.commitDrifts || []).length === 0 ? '(ninguno)' : (data.commitDrifts || []).map(d => `[${d.severity}] ${d.id}: ${d.message}`).join('\n'),
              ].join('\n');
              try {
                const formData = new FormData();
                formData.append('chat_id', chatId.toString());
                formData.append('caption', `📄 Reporte de Integridad — ${new Date().toLocaleDateString('es-CO')}`);
                formData.append('document', new Blob([lines], { type: 'text/plain' }), `integridad_${new Date().toISOString().split('T')[0]}.txt`);
                await fetch(`https://api.telegram.org/bot${token}/sendDocument`, { method: 'POST', body: formData });
              } catch (err) {
                await sendTelegramMessage(token, chatId, `❌ Error al enviar el reporte: ${escapeHtml(err.message)}`);
              }
            }
          }
          else if (rawCmd === '/health') {
            const jobMsgId = await sendJobMessage(token, chatId, '🩺 <b>Verificando salud de clientes en producción...</b>\n<i>Enviando ping a todas las instancias registradas.</i>');
            (async () => {
              try {
                // Obtener lista de clientes registrados en la colección central clientes_control
                const clients = await queryCollectionREST('clientes_control', 'nombre', 100);
                if (!Array.isArray(clients) || clients.length === 0) {
                  await editJobMessage(token, chatId, jobMsgId, '⚠️ No se encontraron clientes registrados en el panel de control central.\nUsa <code>/clientes</code> para ver el inventario.');
                  return;
                }

                // Hacer ping a cada cliente en paralelo
                const pingResults = await Promise.allSettled(
                  clients.map(async (c) => {
                    const url  = c.url || c.domain || c.firebase?.appUrl || '';
                    const name = c.nombre || c.name || c.clientId || c.id || 'Sin nombre';
                    if (!url) return { name, status: 'sin_url', latency: null };
                    const start = Date.now();
                    try {
                      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
                      const latency = Date.now() - start;
                      return { name, url, status: r.ok ? 'online' : `error_${r.status}`, latency };
                    } catch (e) {
                      return { name, url, status: e.name === 'TimeoutError' ? 'timeout' : 'offline', latency: null };
                    }
                  })
                );

                const rows = pingResults.map(r => {
                  const { name, url, status, latency } = r.value || { name: '?', status: 'error', latency: null };
                  const icon = status === 'online' ? '🟢' : status === 'timeout' ? '🟡' : status === 'sin_url' ? '⚪' : '🔴';
                  const lat  = latency !== null ? ` <i>(${latency}ms)</i>` : '';
                  return `${icon} <b>${escapeHtml(name)}</b>${lat}\n   <code>${escapeHtml(url || 'URL no configurada')}</code>`;
                });

                const online  = pingResults.filter(r => r.value?.status === 'online').length;
                const total   = pingResults.length;
                let text = `🩺 <b>Estado de Salud — Clientes en Producción</b>\n`;
                text += `📅 ${new Date().toLocaleString('es-CO')}\n\n`;
                text += `<b>Online:</b> ${online}/${total} instancias\n\n`;
                text += rows.join('\n\n');

                const backMarkup = { inline_keyboard: [
                  [{ text: '🔄 Re-verificar', callback_data: '/health' }, { text: '🏠 Menú', callback_data: '/start' }]
                ]};
                await editJobMessage(token, chatId, jobMsgId, text, backMarkup);

              } catch (err) {
                await editJobMessage(token, chatId, jobMsgId, `❌ Error al verificar salud: <code>${escapeHtml(err.message)}</code>`);
              }
            })();
          }
          else if (rawCmd === '/logs') {
            const latestLogPath = await getLatestTaskLog();
            if (!latestLogPath) {
              const backMarkup = { inline_keyboard: [[{ text: '🏠 Menú Principal', callback_data: '/start' }]] };
              await sendTelegramMessage(token, chatId, '⚠️ No se encontró ningún archivo de log activo en el servidor.', backMarkup);
            } else {
              try {
                const content = await fs.promises.readFile(latestLogPath, 'utf8');
                const lines = content.split(/\r?\n/).filter(Boolean);
                const lastLines = lines.slice(-20).join('\n');
                
                const cleanLogs = lastLines
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
                
                const text = `🪵 <b>Últimas 20 Líneas del Servidor CLI:</b>\n` +
                             `📂 <code>${path.basename(latestLogPath)}</code>\n\n` +
                             `<pre><code>${cleanLogs}</code></pre>`;
                const backMarkup = { inline_keyboard: [[{ text: '🏠 Menú Principal', callback_data: '/start' }]] };
                await sendTelegramMessage(token, chatId, text, backMarkup);
              } catch (readErr) {
                const backMarkup = { inline_keyboard: [[{ text: '🏠 Menú Principal', callback_data: '/start' }]] };
                await sendTelegramMessage(token, chatId, `❌ Error al leer el archivo de log: ${readErr.message}`, backMarkup);
              }
            }
          }

          // ─── Módulo /git — Control de Versiones (Sprint 1) ───
          else if (rawCmd === '/git') {
            const repos = await getGitTargetsList();
            if (!repos || repos.length === 0) {
              await sendTelegramMessage(token, chatId, '❌ No se encontraron repositorios Git o el Bridge no responde.');
            } else {
              gitRepoCache[chatId] = repos;
              const changed = repos.filter(r => r.hasChanges).length;
              const menuText = `🔍 <b>Git — Control de Versiones</b>\n\n` +
                `<b>${changed}</b> de <b>${repos.length}</b> repositorios tienen cambios.\n\nSelecciona un repositorio:`;
              const buttons = repos.map((r, i) => [{
                text: `${r.hasChanges ? '🔴' : '🟢'} ${r.name.slice(0, 28)}`,
                callback_data: `/git_repo ${i}`
              }]);
              buttons.push([{ text: '🏠 Menú Principal', callback_data: '/start' }]);
              await sendTelegramMessage(token, chatId, menuText, { inline_keyboard: buttons });
            }
          }

          else if (rawCmd === '/git_repo') {
            const idx  = parseInt(arg, 10);
            const repos = gitRepoCache[chatId] || [];
            if (isNaN(idx) || idx < 0 || idx >= repos.length) {
              await sendTelegramMessage(token, chatId, '❌ Selección inválida. Ejecuta <code>/git</code> de nuevo.');
            } else {
              const repo = repos[idx];
              userStates[chatId] = { ...userStates[chatId], gitPath: repo.path, gitName: repo.name, gitIdx: idx };
              const infoText = `🛠️ <b>${repo.name}</b>\n` +
                `📌 Rama: <code>${repo.branch || 'desconocida'}</code>\n` +
                `${repo.hasChanges ? '🔴 Tiene cambios sin confirmar' : '🟢 Limpio, sin cambios'}\n\nAcciones:`;
              const actions = {
                inline_keyboard: [
                  [{ text: '📋 Ver Cambios',        callback_data: '/git_status'      }, { text: '📜 Commits',          callback_data: '/git_log'         }],
                  [{ text: '📤 Sin Publicar',       callback_data: '/git_unpushed'    }, { text: '🚀 Publicar',          callback_data: '/git_push_confirm'}],
                  [{ text: '↩️ Repositorios',       callback_data: '/git'             }, { text: '🏠 Menú',             callback_data: '/start'          }]
                ]
              };
              await sendTelegramMessage(token, chatId, infoText, actions);
            }
          }

          else if (rawCmd === '/git_status') {
            const gitPath = userStates[chatId]?.gitPath;
            if (!gitPath) {
              await sendTelegramMessage(token, chatId, '❌ Primero selecciona un repositorio con <code>/git</code>');
            } else {
              const report = await getGitStatusReport(gitPath);
              const backMarkup = { inline_keyboard: [[{ text: '↩️ Volver', callback_data: `/git_repo ${userStates[chatId]?.gitIdx || 0}` }, { text: '🏠 Menú', callback_data: '/start' }]] };
              await sendTelegramMessage(token, chatId, report, backMarkup);
            }
          }

          else if (rawCmd === '/git_log') {
            const gitPath = userStates[chatId]?.gitPath;
            if (!gitPath) {
              await sendTelegramMessage(token, chatId, '❌ Primero selecciona un repositorio con <code>/git</code>');
            } else {
              const report = await getGitLogReport(gitPath);
              const backMarkup = { inline_keyboard: [[{ text: '↩️ Volver', callback_data: `/git_repo ${userStates[chatId]?.gitIdx || 0}` }, { text: '🏠 Menú', callback_data: '/start' }]] };
              await sendTelegramMessage(token, chatId, report, backMarkup);
            }
          }

          else if (rawCmd === '/git_unpushed') {
            const gitPath = userStates[chatId]?.gitPath;
            if (!gitPath) {
              await sendTelegramMessage(token, chatId, '❌ Primero selecciona un repositorio con <code>/git</code>');
            } else {
              const report = await getGitUnpushedReport(gitPath);
              const backMarkup = { inline_keyboard: [[{ text: '↩️ Volver', callback_data: `/git_repo ${userStates[chatId]?.gitIdx || 0}` }, { text: '🏠 Menú', callback_data: '/start' }]] };
              await sendTelegramMessage(token, chatId, report, backMarkup);
            }
          }

          else if (rawCmd === '/git_push_confirm') {
            const gitPath = userStates[chatId]?.gitPath;
            const gitName = userStates[chatId]?.gitName || 'repo';
            if (!gitPath) {
              await sendTelegramMessage(token, chatId, '❌ Primero selecciona un repositorio con <code>/git</code>');
            } else {
              const autoMsg = await generateAutoCommitMessage(gitPath);
              
              const resStatus = await fetch(`http://localhost:3001/api/git/status?path=${encodeURIComponent(gitPath)}`).catch(() => null);
              let changes = [];
              let branch = 'unknown';
              let envLeak = false;
              let envLeakFiles = [];
              
              if (resStatus?.ok) {
                const data = await resStatus.json();
                if (data.success) {
                  changes = data.changes || [];
                  branch = data.branch || 'unknown';
                  envLeak = data.envLeak || false;
                  envLeakFiles = data.envLeakFiles || [];
                }
              }
              
              let activeTaskTitle = '⚠️ Ninguna tarea activa encontrada (se usará fallback)';
              const resRoadmap = await fetch('http://localhost:3001/api/roadmap').catch(() => null);
              if (resRoadmap?.ok) {
                const roadmapData = await resRoadmap.json();
                if (roadmapData.success && roadmapData.tasks?.length > 0) {
                  const activeTask = roadmapData.tasks.find(t => !t.completed) || roadmapData.tasks[0];
                  if (activeTask) {
                    activeTaskTitle = `<b>${activeTask.id}</b>: ${activeTask.text} (Estatus: ${activeTask.completed ? 'Completada' : 'En Progreso'})`;
                  }
                }
              }
              
              const typeMap = { M: '📝', A: '➕', D: '🗑️', R: '🔄', '?': '❓' };
              const filesPreview = changes.length > 0
                ? changes.slice(0, 10).map(c => `${typeMap[c.type] || c.type} <code>${path.basename(c.file)}</code>`).join('\n')
                : '🟢 Ningún cambio detectado en la carpeta de trabajo';
              
              const moreFiles = changes.length > 10 ? `\n<i>... y ${changes.length - 10} archivos más</i>` : '';
              
              let text = `📦 <b>Pre-flight de Publicación — Git Push</b>\n\n` +
                         `📂 Repositorio: <code>${gitName}</code>\n` +
                         `🌿 Rama: <code>${branch}</code>\n\n` +
                         
                         `💬 <b>Mensaje de Commit Previsto:</b>\n` +
                         `<code>${autoMsg || 'Sin mensaje auto-generado'}</code>\n\n` +
                         
                         `📋 <b>Vinculado a Tarea Roadmap:</b>\n` +
                         `${activeTaskTitle}\n\n` +
                         
                         `📁 <b>Cambios a Respaldar (${changes.length}):</b>\n` +
                         `${filesPreview}${moreFiles}\n`;
              
              if (envLeak) {
                text += `\n🚨 <b>PELIGRO: Archivos .env expuestos detectados!</b>\n` +
                        `• ${envLeakFiles.map(f => `<code>${f}</code>`).join('\n• ')}\n` +
                        `<i>Por favor, resuelve la exposición de secretos antes de publicar.</i>\n`;
              }
              
              text += `\n⚠️ <b>¿Deseas proceder con el commit y push remoto?</b>`;
              
              userStates[chatId] = { ...userStates[chatId], step: 'AWAITING_CONFIRM', action: 'git_push', actionArg: gitPath };
              const confirmMarkup = {
                inline_keyboard: [
                  [{ text: '✅ Sí, publicar cambios', callback_data: '/confirm_yes' }],
                  [{ text: '❌ Cancelar',             callback_data: '/confirm_no'  }]
                ]
              };
              
              await sendTelegramMessage(token, chatId, text, confirmMarkup);
            }
          }

          // ─── Módulo /devserver — Dev Server Vite (Sprint 1) ───
          else if (rawCmd === '/devserver') {
            const list = await getClientInstancesList();
            if (!list || list.length === 0) {
              await sendTelegramMessage(token, chatId, '❌ No se encontraron instancias de clientes registradas.');
            } else if (list.length === 1) {
              // Si solo hay un cliente, ir directo al estado
              const clientId = arg || list[0];
              const { text: statusText, running } = await getDevServerStatusMsg(clientId);
              userStates[chatId] = { ...userStates[chatId], devClientId: clientId };
              const buttons = running
                ? [[{ text: '⏹ Detener',   callback_data: '/devserver_stop_confirm' }, { text: '🔄 Reiniciar', callback_data: '/devserver_restart' }]]
                : [[{ text: '▶️ Arrancar', callback_data: '/devserver_start' }]];
              buttons.push([{ text: '🏠 Menú Principal', callback_data: '/start' }]);
              await sendTelegramMessage(token, chatId, statusText, { inline_keyboard: buttons });
            } else if (arg && list.includes(arg)) {
              // Cliente específico pasado como argumento
              const clientId = arg;
              const { text: statusText, running } = await getDevServerStatusMsg(clientId);
              userStates[chatId] = { ...userStates[chatId], devClientId: clientId };
              const buttons = running
                ? [[{ text: '⏹ Detener',   callback_data: '/devserver_stop_confirm' }, { text: '🔄 Reiniciar', callback_data: '/devserver_restart' }]]
                : [[{ text: '▶️ Arrancar', callback_data: '/devserver_start' }]];
              buttons.push([{ text: '↩️ Clientes', callback_data: '/devserver' }, { text: '🏠 Menú', callback_data: '/start' }]);
              await sendTelegramMessage(token, chatId, statusText, { inline_keyboard: buttons });
            } else {
              // Selector de cliente
              const selectorText = `🖥️ <b>Dev Server</b>\n\nSelecciona qué instancia de cliente deseas controlar:`;
              const buttons = list.map(c => [{ text: `🖥️ ${c}`, callback_data: `/devserver ${c}` }]);
              buttons.push([{ text: '🏠 Menú Principal', callback_data: '/start' }]);
              await sendTelegramMessage(token, chatId, selectorText, { inline_keyboard: buttons });
            }
          }

          else if (rawCmd === '/devserver_start') {
            const clientId = userStates[chatId]?.devClientId;
            if (!clientId) {
              await sendTelegramMessage(token, chatId, '❌ Primero selecciona un cliente con <code>/devserver</code>');
            } else {
              await executeDevServerStart(token, chatId, clientId);
            }
          }

          else if (rawCmd === '/devserver_stop_confirm') {
            const clientId = userStates[chatId]?.devClientId;
            if (!clientId) {
              await sendTelegramMessage(token, chatId, '❌ Primero selecciona un cliente con <code>/devserver</code>');
            } else {
              userStates[chatId] = { ...userStates[chatId], step: 'AWAITING_CONFIRM', action: 'devserver_stop', actionArg: clientId };
              await sendTelegramMessage(token, chatId,
                `⚠️ <b>¿Detener el Dev Server de <code>${clientId}</code>?</b>\n\n` +
                `Esto matará el proceso Vite en el servidor.`,
                { inline_keyboard: [[{ text: '✅ Sí, detener', callback_data: '/confirm_yes' }, { text: '❌ Cancelar', callback_data: '/confirm_no' }]] });
            }
          }

          else if (rawCmd === '/devserver_restart') {
            const clientId = userStates[chatId]?.devClientId;
            if (!clientId) {
              await sendTelegramMessage(token, chatId, '❌ Primero selecciona un cliente con <code>/devserver</code>');
            } else {
              userStates[chatId] = { ...userStates[chatId], step: 'AWAITING_CONFIRM', action: 'devserver_restart', actionArg: clientId };
              await sendTelegramMessage(token, chatId,
                `🔄 <b>¿Reiniciar el Dev Server de <code>${clientId}</code>?</b>\n\n` +
                `Se detendrá el proceso actual y se arrancará de nuevo (stop + start).`,
                { inline_keyboard: [[{ text: '✅ Sí, reiniciar', callback_data: '/confirm_yes' }, { text: '❌ Cancelar', callback_data: '/confirm_no' }]] });
            }
          }

          // ─── Módulo /fix — Optimización y Autocuración de Instancias (Sprint 2) ───
          else if (rawCmd === '/fix') {
            const list = await getClientInstancesList();
            if (!list || list.length === 0) {
              await sendTelegramMessage(token, chatId, '❌ No se encontraron instancias de clientes registradas.');
            } else if (list.length === 1 || (arg && list.includes(arg))) {
              const clientId = arg || list[0];
              userStates[chatId] = { ...userStates[chatId], fixClientId: clientId };
              const fixText = `⚡ <b>Menú de Reparación — ${clientId}</b>\n\n` +
                `Selecciona la optimización a aplicar en el proyecto:`;
              const buttons = [
                [{ text: '⚡ Dividir Chunks (Vite)', callback_data: '/fix_chunks_action' }],
                [{ text: '📱 Corregir Recursos PWA', callback_data: '/fix_pwa_action' }],
                [{ text: '🏠 Menú Principal', callback_data: '/start' }]
              ];
              await sendTelegramMessage(token, chatId, fixText, { inline_keyboard: buttons });
            } else {
              // Selector de cliente para fix
              const selectorText = `⚡ <b>Optimización de Clientes</b>\n\nSelecciona el cliente a optimizar:`;
              const buttons = list.map(c => [{ text: `🏢 ${c}`, callback_data: `/fix ${c}` }]);
              buttons.push([{ text: '🏠 Menú Principal', callback_data: '/start' }]);
              await sendTelegramMessage(token, chatId, selectorText, { inline_keyboard: buttons });
            }
          }

          else if (rawCmd === '/fix_chunks_action') {
            const clientId = userStates[chatId]?.fixClientId;
            if (!clientId) {
              await sendTelegramMessage(token, chatId, '❌ Primero selecciona un cliente con <code>/fix</code>');
            } else {
              userStates[chatId] = { ...userStates[chatId], step: 'AWAITING_CONFIRM', action: 'fix_chunks', actionArg: clientId };
              await sendTelegramMessage(token, chatId,
                `⚠️ <b>¿Optimizar chunks de <code>${clientId}</code>?</b>\n\n` +
                `Esto modificará su <code>vite.config.js</code> inyectando división manual de Firebase y dependencias pesadas.`,
                { inline_keyboard: [[{ text: '✅ Sí, optimizar', callback_data: '/confirm_yes' }, { text: '❌ Cancelar', callback_data: '/confirm_no' }]] });
            }
          }

          else if (rawCmd === '/fix_pwa_action') {
            const clientId = userStates[chatId]?.fixClientId;
            if (!clientId) {
              await sendTelegramMessage(token, chatId, '❌ Primero selecciona un cliente con <code>/fix</code>');
            } else {
              userStates[chatId] = { ...userStates[chatId], step: 'AWAITING_CONFIRM', action: 'fix_pwa', actionArg: clientId };
              await sendTelegramMessage(token, chatId,
                `⚠️ <b>¿Corregir recursos PWA de <code>${clientId}</code>?</b>\n\n` +
                `Esto copiará favicon e íconos PWA faltantes desde la plantilla base.`,
                { inline_keyboard: [[{ text: '✅ Sí, corregir', callback_data: '/confirm_yes' }, { text: '❌ Cancelar', callback_data: '/confirm_no' }]] });
            }
          }

          // ─── Módulo /rules — Monitoreo de Desviación de Reglas (Sprint 2) ───
          else if (rawCmd === '/rules') {
            const msgId = await sendJobMessage(token, chatId, '⏳ <b>Escaneando reglas en la nube...</b>\n<i>Esto puede tardar un momento.</i>');
            const { report, hasAnyDrift, matrix } = await getFirebaseRulesDriftReport();
            
            if (!hasAnyDrift) {
              await editJobMessage(token, chatId, msgId, report + '\n\n🟢 <b>Consistencia perfecta en todas las reglas de Firebase.</b>');
            } else {
              const buttons = [];
              const driftedClients = matrix.filter(m => m.firestore?.drift || m.storage?.drift);
              
              for (const dc of driftedClients) {
                buttons.push([{
                  text: `🩹 Desplegar: ${dc.clientId}`,
                  callback_data: `/rules_deploy_action ${dc.clientId}`
                }]);
              }
              buttons.push([{ text: '🏠 Menú Principal', callback_data: '/start' }]);
              await editJobMessage(token, chatId, msgId, report + `⚠️ Se detectaron desviaciones. Selecciona una instancia para desplegar reglas actualizadas:`, { inline_keyboard: buttons });
            }
          }

          else if (rawCmd === '/rules_deploy_action') {
            const clientId = arg;
            if (!clientId) {
              await sendTelegramMessage(token, chatId, '❌ Especifica un clientId para desplegar reglas.');
            } else {
              userStates[chatId] = { ...userStates[chatId], step: 'AWAITING_CONFIRM', action: 'rules_deploy', actionArg: `${clientId}|all` };
              await sendTelegramMessage(token, chatId,
                `⚠️ <b>¿Desplegar reglas para <code>${clientId}</code>?</b>\n\n` +
                `Esto sobrescribirá las reglas activas de Firestore y Storage en Cloud con el código local actual del Core.`,
                { inline_keyboard: [[{ text: '✅ Sí, desplegar', callback_data: '/confirm_yes' }, { text: '❌ Cancelar', callback_data: '/confirm_no' }]] });
            }
          }

          // ─── Módulo /tests — Ejecución y Resultados de Pruebas E2E (Sprint 3) ───
          else if (rawCmd === '/tests') {
            const projects = await getE2EProjectsList();
            if (!projects || projects.length === 0) {
              await sendTelegramMessage(token, chatId, '⚠️ No se encontraron proyectos con pruebas Playwright configuradas.');
            } else if (arg && projects.some(p => p.id === arg)) {
              const projectId = arg;
              const msg = await getE2ELastResultMsg(projectId);
              const buttons = [[{ text: '↩️ Volver a Pruebas', callback_data: '/tests' }, { text: '🏠 Menú', callback_data: '/start' }]];
              await sendTelegramMessage(token, chatId, msg, { inline_keyboard: buttons });
            } else {
              const menuText = `🧪 <b>Pruebas E2E (Playwright)</b>\n\nSelecciona un proyecto para ver su último resultado de pruebas:`;
              const buttons = projects.map(p => [{ text: `🧪 ${p.label}`, callback_data: `/tests ${p.id}` }]);
              buttons.push([{ text: '🏠 Menú Principal', callback_data: '/start' }]);
              await sendTelegramMessage(token, chatId, menuText, { inline_keyboard: buttons });
            }
          }

          // ─── Módulo /cores — Inventario de Semillas Core (Sprint 3) ───
          else if (rawCmd === '/cores') {
            const report = await getCoresReport();
            const backMarkup = { inline_keyboard: [[{ text: '🏠 Menú Principal', callback_data: '/start' }]] };
            await sendTelegramMessage(token, chatId, report, backMarkup);
          }

          else if (rawCmd === '/confirm_no') {
            if (userStates[chatId]?.step === 'AWAITING_CONFIRM') delete userStates[chatId];
            await sendTelegramMessage(token, chatId, '❌ Operación cancelada.');
          }
        }
      } catch (updateErr) {
        console.error(`[Telegram Update Error] Error al procesar update ${update.update_id}:`, updateErr.message || updateErr);
        if (updateErr.stack) console.error(updateErr.stack);
      }
    }
    } catch (err) {
      console.error(`[Telegram Polling Error] token ${token.slice(0, 8)}...:`, err.message);
    }
  }
}

// ─── Endpoint: Callback de Finalización de Jobs Largos ───
// server.js (u otros procesos) pueden llamar aquí al terminar un job,
// y el bot editará el mensaje "⏳ En progreso" con el resultado final.
app.post('/api/notify/job-complete', (req, res) => {
  const { jobId, success, message, token: jobToken, chatId: jobChatId, messageId } = req.body;
  const result = `${success ? '✅' : '❌'} <b>${success ? 'Operación Completada' : 'Operación Fallida'}</b>\n\n${message || ''}`;
  // Soporte dual: jobId en Map (jobs internos) o token+chatId+messageId explícitos (externos)
  if (jobId && activeJobs.has(jobId)) {
    const job = activeJobs.get(jobId);
    editJobMessage(job.token, job.chatId, job.messageId, result);
    activeJobs.delete(jobId);
  } else if (jobToken && jobChatId && messageId) {
    editJobMessage(jobToken, jobChatId, messageId, result);
  }
  res.json({ ok: true });
});

// Arranque
app.listen(PORT, async () => {
  console.log(`[Notify Service] Servidor de Notificaciones activo en el puerto ${PORT}`);

  // Resolver username del bot para generar deep-links en addtask CUSTOM
  const mainToken = systemConfig.telegramToken;
  if (mainToken) {
    try {
      const meRes = await fetch(`https://api.telegram.org/bot${mainToken}/getMe`);
      const meData = await meRes.json();
      if (meData.ok && meData.result?.username) {
        botUsername = meData.result.username;
        console.log(`[Notify Service] Bot username resuelto: @${botUsername}`);
      }
    } catch (_) {
      console.warn('[Notify Service] No se pudo resolver el username del bot (getMe falló).');
    }
  }

  // Inicializar Polling de Comandos cada 3 segundos
  console.log('[Notify Service] Escuchador de comandos interactivos de Telegram activo (polling de 3s).');
  setInterval(startTelegramCommandPolling, 3000);
});
