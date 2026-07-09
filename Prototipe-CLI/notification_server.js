import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, 'notification_config.json');

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

// Helper para enviar alertas a Telegram (Raw)
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
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Telegram (${response.status}): ${errText}`);
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

// Helper para obtener configuración específica de un canal con fallback general
function getChannelConfig(channelName) {
  const channel = systemConfig.channels?.[channelName] || {};
  const hasChannelCreds = !!(channel.telegramToken || channel.discordWebhookUrl);
  
  return {
    telegramToken: (hasChannelCreds ? channel.telegramToken : systemConfig.telegramToken) || '',
    telegramChatId: (hasChannelCreds ? channel.telegramChatId : systemConfig.telegramChatId) || '',
    discordWebhookUrl: (hasChannelCreds ? channel.discordWebhookUrl : systemConfig.discordWebhookUrl) || '',
    enabled: systemConfig.alertsEnabled && (channel.enabled !== false)
  };
}

// ─── Control de Acceso: Whitelist de Chat IDs ───
// Si no hay allowedChatIds configurados → modo abierto (retrocompatible).
function isAuthorized(chatId, command) {
  const auth = systemConfig.auth || {};
  const allowed = (auth.allowedChatIds || []).map(Number);
  const admins  = (auth.adminChatIds  || []).map(Number);
  const adminCmds = auth.requireAdminCommands || [
    '/deploy', '/maintenance_set', '/rules', '/integrity_autofix',
    '/devserver stop', '/git push', '/cores sync', '/fix'
  ];

  if (allowed.length === 0) return { ok: true };

  const numId = Number(chatId);
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

async function executeGitPush(token, chatId, repoPath) {
  const msgId = await sendJobMessage(token, chatId,
    `⏳ <b>Generando mensaje de commit y publicando...</b>\n<i>Por favor espera...</i>`);
  (async () => {
    const backMarkup = { inline_keyboard: [[{ text: '🏠 Menú Principal', callback_data: '/start' }]] };
    try {
      const autoMessage = await generateAutoCommitMessage(repoPath);
      const url = `http://localhost:3001/api/git/backup-stream?path=${encodeURIComponent(repoPath)}` + 
                  (autoMessage ? `&message=${encodeURIComponent(autoMessage)}` : '');
      
      const res     = await fetch(url, { signal: AbortSignal.timeout(180000) });
      const rawText = await res.text();
      const lines   = rawText.split('\n').filter(l => l.startsWith('data:'));
      const last    = (lines.length > 0 ? lines[lines.length - 1].replace('data:', '').trim() : 'Proceso finalizado').slice(0, 300);
      const ok      = res.ok && !rawText.toLowerCase().includes('error');
      
      let finalMsg = ok
        ? `✅ <b>Cambios Publicados</b>\n\n🚀 GitHub / Hosting actualizado con éxito.`
        : `❌ <b>Push Fallido</b>\n\n<code>${last}</code>`;
      
      if (ok && autoMessage) {
        finalMsg += `\n\n💬 <b>Mensaje de Commit:</b>\n<code>${autoMessage}</code>`;
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

        if (!text) continue;

        // ─── Verificación de Autorización ───
        const authResult = isAuthorized(chatId, text);
        if (!authResult.ok) {
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
          // Si el mensaje es una cancelación explícita
          if (text.toLowerCase() === 'cancelar' || text.toLowerCase() === '/cancelar') {
            delete userStates[chatId];
            await sendTelegramMessage(token, chatId, '❌ <b>Creación Cancelada:</b> Se ha cancelado el asistente de tareas.');
            continue;
          }

          const { domain, groupChatId } = userStates[chatId];
          // Guardar en el Bridge local
          const res = await fetch(`http://localhost:3001/api/roadmap/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, domain })
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

          if (rawCmd === '/start' || rawCmd === '/help' || rawCmd === '/ayuda') {
            const helpText = `👋 <b>Asistente de Control de PROTOTIPE</b>\n\n` +
                             `Toca los botones o envía comandos para controlar la consola CLI remotamente:\n\n` +
                             `🩺 <b>Salud & Estado:</b>\n` +
                             `• <code>/status</code> - Latencia y estado PWA de clientes.\n` +
                             `• <code>/crashes</code> - Últimos 5 fallos críticos.\n\n` +
                             `📝 <b>Briefing & Preventas:</b>\n` +
                             `• <code>/leads</code> - Preventas completadas.\n\n` +
                             `💰 <b>Facturación:</b>\n` +
                             `• <code>/billing</code> - Resumen financiero.\n\n` +
                             `⚙️ <b>DevOps & Hosting:</b>\n` +
                             `• <code>/clientes</code> - Lista de clientes en el CLI.\n` +
                             `• <code>/deploy [cliente]</code> - Compilar y desplegar.\n` +
                             `• <code>/logs</code> - Últimos logs del servidor.\n\n` +
                             `🛠️ <b>Git — Versiones:</b>\n` +
                             `• <code>/git</code> - Status, log, commits sin push, publicar.\n\n` +
                             `🖥️ <b>Dev Server Vite:</b>\n` +
                             `• <code>/devserver [cliente]</code> - Estado, arrancar, detener.\n\n` +
                             `⚡ <b>Optimización & Parches:</b>\n` +
                             `• <code>/fix [cliente]</code> - Dividir chunks, restablecer PWA.\n` +
                             `• <code>/rules</code> - Matriz de desviación y deploy de reglas Firebase.\n\n` +
                             `🧪 <b>Verificación E2E:</b>\n` +
                             `• <code>/tests</code> - Resultados de pruebas Playwright.\n\n` +
                             `📦 <b>Semillas Cores:</b>\n` +
                             `• <code>/cores</code> - Inventario y rutas de cores registrados.\n\n` +
                             `📋 <b>Roadmap & Tareas:</b>\n` +
                             `• <code>/tasks</code> - Tareas pendientes.\n` +
                             `• <code>/addtask</code> - Agregar tarea con asistente.\n\n` +
                             `🔧 <b>Configuración:</b>\n` +
                             `• <code>/maintenance</code> - Modo mantenimiento.\n` +
                             `• <code>/integrity</code> - Diagnóstico de consistencia y drifts.`;
            
            const replyMarkup = {
              inline_keyboard: [
                [
                  { text: '🩺 Salud / Status', callback_data: '/status' },
                  { text: '🚨 Ver Errores',   callback_data: '/crashes' }
                ],
                [
                  { text: '📝 Ver Preventas', callback_data: '/leads'   },
                  { text: '💰 Facturación',  callback_data: '/billing'  }
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
                  { text: '🪵 Ver Logs', callback_data: '/logs' }
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
              const pending = (data.tasks || []).filter(t => !t.completed);
              if (pending.length === 0) {
                const backMarkup = {
                  inline_keyboard: [
                    [{ text: '🆕 Crear Tarea', callback_data: '/addtask' }],
                    [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                  ]
                };
                await sendTelegramMessage(token, chatId, '📋 <b>Roadmap de Tareas:</b>\n\n✅ ¡No hay tareas pendientes en <code>tareas_pendientes.md</code>! Todo al día.', backMarkup);
              } else {
                let text = `📋 <b>Tareas Pendientes (${pending.length}):</b>\n\n`;
                const displayList = pending.slice(0, 8);
                displayList.forEach(t => {
                  text += `• <b>${t.id}</b>: ${t.text || t.rawLine}\n`;
                });
                if (pending.length > 8) {
                  text += `\n<i>... y ${pending.length - 8} tareas más.</i>`;
                }
                
                const replyMarkup = {
                  inline_keyboard: [
                    ...displayList.map(t => [
                      { text: `✅ Completar ${t.id}`, callback_data: `/completetask ${t.lineIndex} ${t.id}` }
                    ]),
                    [
                      { text: '🆕 Crear Tarea', callback_data: '/addtask' },
                      { text: '🏠 Menú', callback_data: '/start' }
                    ]
                  ]
                };
                await sendTelegramMessage(token, chatId, text, replyMarkup);
              }
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
                await sendTelegramMessage(token, chatId, `❌ Error al intentar marcar la tarea <code>${taskId}</code> como completada.`);
              } else {
                const backMarkup = {
                  inline_keyboard: [
                    [
                      { text: '📋 Ver Roadmap', callback_data: '/tasks' },
                      { text: '🏠 Menú Principal', callback_data: '/start' }
                    ]
                  ]
                };
                await sendTelegramMessage(token, chatId, `✅ <b>Tarea Completada</b>\n\nLa tarea <code>${taskId}</code> fue marcada exitosamente como completada en <code>tareas_pendientes.md</code>.`, backMarkup);
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
            const res = await fetch('http://localhost:3001/api/integrity/status').catch(() => null);
            if (!res || !res.ok) {
              await sendTelegramMessage(token, chatId, '❌ Error al consultar la integridad física del ecosistema.');
            } else {
              const data = await res.json();
              let text = `🔍 <b>Diagnóstico de Consistencia Física (Pre-flight):</b>\n\n`;
              
              const hasDrifts = (data.codeDrifts?.length > 0) || (data.roadmapDrifts?.length > 0) || (data.sandboxDrifts?.length > 0);
              
              if (!hasDrifts) {
                text += `✅ <b>¡Consistencia Perfecta!</b>\n` +
                        `• Código, documentación y sandbox 100% alineados.\n` +
                        `• Reglas de proyecto cumplidas al 100%.\n\n`;
              } else {
                text += `⚠️ <b>Inconsistencias Detectadas:</b>\n\n`;
                if (data.codeDrifts?.length > 0) {
                  text += `📁 <b>Code Drifts (${data.codeDrifts.length}):</b>\n`;
                  data.codeDrifts.slice(0, 3).forEach(d => {
                    text += `• <code>${d.id}</code>: ${d.message}\n`;
                  });
                  if (data.codeDrifts.length > 3) text += `<i>... y ${data.codeDrifts.length - 3} desvíos más.</i>\n`;
                  text += `\n`;
                }
                if (data.roadmapDrifts?.length > 0) {
                  text += `📋 <b>Roadmap Drifts (${data.roadmapDrifts.length}):</b>\n`;
                  data.roadmapDrifts.slice(0, 3).forEach(d => {
                    text += `• <code>${d.id}</code>: ${d.message}\n`;
                  });
                  if (data.roadmapDrifts.length > 3) text += `<i>... y ${data.roadmapDrifts.length - 3} desvíos más.</i>\n`;
                  text += `\n`;
                }
              }
              
              text += `📊 <b>Métricas de Control:</b>\n` +
                      `• Tareas Completadas: <code>${data.metrics?.taskCount || 0}</code>\n` +
                      `• Entradas de Bitácora: <code>${data.metrics?.bitacoraCount || 0}</code>\n`;
                      
              const replyMarkup = {
                inline_keyboard: hasDrifts ? [
                  [{ text: '⚡ Auto-healer (Fix-Map)', callback_data: '/integrity_autofix' }],
                  [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                ] : [
                  [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                ]
              };
              
              await sendTelegramMessage(token, chatId, text, replyMarkup);
            }
          }
          else if (rawCmd === '/integrity_autofix') {
            const msgId = await sendJobMessage(token, chatId,
              '⚡ <b>Auto-curación en progreso...</b>\n<i>Analizando y corrigiendo drifts del mapa de aplicación.</i>'
            );
            (async () => {
              const backMarkup = {
                inline_keyboard: [
                  [{ text: '🔍 Volver a Diagnóstico', callback_data: '/integrity' }],
                  [{ text: '🏠 Menú Principal', callback_data: '/start' }]
                ]
              };
              try {
                await fetch('http://localhost:3001/api/integrity/autofix', { method: 'POST' }).catch(() => {});
                
                const resStatus = await fetch('http://localhost:3001/api/integrity/status').catch(() => null);
                if (resStatus && resStatus.ok) {
                  const dataStatus = await resStatus.json();
                  if (dataStatus.codeDrifts && dataStatus.codeDrifts.length > 0) {
                    for (const d of dataStatus.codeDrifts) {
                      if (d.type === 'MAP_MISSING' && d.file) {
                        await fetch('http://localhost:3001/api/integrity/fix-map', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ file: d.file, id: d.id })
                        }).catch(() => {});
                      }
                    }
                  }
                  const remaining = (dataStatus.codeDrifts?.length || 0) + (dataStatus.roadmapDrifts?.length || 0);
                  await editJobMessage(token, chatId, msgId,
                    remaining === 0
                      ? `✅ <b>Auto-curación Completada</b>\n\n¡Consistencia perfecta! Todos los drifts fueron resueltos.`
                      : `⚠️ <b>Auto-curación Parcial</b>\n\n${remaining} desvío(s) restantes requieren revisión manual.\nEjecuta <code>/integrity</code> para ver el detalle.`,
                    backMarkup
                  );
                } else {
                  await editJobMessage(token, chatId, msgId,
                    '✅ <b>Pipeline de Auto-curación Terminado</b>\n\nEjecuta <code>/integrity</code> para verificar el estado.',
                    backMarkup
                  );
                }
              } catch (err) {
                await editJobMessage(token, chatId, msgId,
                  `❌ <b>Error en Auto-curación:</b>\n<code>${err.message}</code>`,
                  backMarkup
                );
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
