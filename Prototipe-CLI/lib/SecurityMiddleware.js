import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SECURITY_DIR = path.join(__dirname, '..', '.prototipe');
const TOKEN_FILE = path.join(SECURITY_DIR, 'cli-token.json');

/**
 * Inicializa el token rotativo de seguridad loopback al arrancar el servidor.
 * Genera un token aleatorio y restringe los permisos del archivo.
 */
export async function initializeCliSecurityToken() {
  await fs.ensureDir(SECURITY_DIR);

  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 Horas de validez

  const payload = {
    token,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };

  await fs.writeJson(TOKEN_FILE, payload, { spaces: 2 });

  // Restringir permisos en UNIX a 600 (chmod 600)
  if (process.platform !== 'win32') {
    try {
      await fs.chmod(TOKEN_FILE, 0o600);
    } catch (err) {
      console.warn(`[Security] No se pudieron aplicar permisos chmod 600 al token: ${err.message}`);
    }
  }

  console.log(`[Security] Token loopback inicializado de forma exitosa y segura.`);
  return token;
}

/**
 * Middleware para asegurar loopback exclusivo (127.0.0.1 / ::1).
 */
export function loopbackOnlyMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  
  const isLoopback = 
    ip === '127.0.0.1' || 
    ip === '::1' || 
    ip === '::ffff:127.0.0.1';

  if (!isLoopback) {
    console.warn(`[Security] Bloqueada petición de origen no autorizado (externo): ${ip}`);
    return res.status(403).json({ error: 'Acceso no autorizado: Solo se permiten conexiones locales (loopback).' });
  }

  next();
}

/**
 * Middleware para verificar la cabecera X-Prototipe-CLI-Token.
 */
export async function authenticateCliToken(req, res, next) {
  const requestToken = req.headers['x-prototipe-cli-token'];

  if (!requestToken) {
    return res.status(401).json({ error: 'Falta cabecera de autenticación X-Prototipe-CLI-Token.' });
  }

  if (!(await fs.pathExists(TOKEN_FILE))) {
    return res.status(500).json({ error: 'Error interno: Token de loopback no inicializado en el servidor.' });
  }

  try {
    const tokenData = await fs.readJson(TOKEN_FILE);
    
    // Verificar expiración
    if (new Date(tokenData.expiresAt).getTime() < Date.now()) {
      return res.status(401).json({ error: 'El token de seguridad ha expirado. Por favor reinicia la CLI.' });
    }

    // Verificar hash constante para evitar ataques de temporización (timing attacks)
    const secureCompare = (a, b) => {
      if (typeof a !== 'string' || typeof b !== 'string') return false;
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    };

    if (!secureCompare(requestToken, tokenData.token)) {
      return res.status(401).json({ error: 'Token de seguridad inválido.' });
    }

    next();
  } catch (err) {
    console.error('[Security] Error durante la autenticación de token:', err);
    return res.status(500).json({ error: 'Error interno en la autenticación.' });
  }
}
