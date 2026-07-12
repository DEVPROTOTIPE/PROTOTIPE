import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';
import dns from 'node:dns';
import child_process from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

// Estado de la interceptación
const stats = {
  allowedControlProcesses: 0,
  unexpectedExternalProcesses: 0,
  unexpectedNetworkCalls: 0,
  firebaseCliInvocations: 0,
  githubApiInvocations: 0,
  centralApiInvocations: 0
};

global.__network_guard_stats__ = stats;

// --- CONFIGURACIÓN DE PROXY PARA PROCESS.ENV (Aislamiento de Rutas) ---
const HISTORICAL_SANDBOX_DIR = process.env.PROTOTIPE_SANDBOX_DIR || path.join(os.tmpdir(), 'PROTOTIPE_CHARACTERIZATION_SANDBOX');
const sandboxWorkspace = path.join(HISTORICAL_SANDBOX_DIR, 'Instancias Clientes');
const sandboxDocs = path.join(HISTORICAL_SANDBOX_DIR, 'Documentacion PROTOTIPE');

const originalEnv = { ...process.env };
const envProxy = new Proxy(originalEnv, {
  get(target, prop) {
    if (prop === 'PROTOTIPE_WORKSPACE_ROOT' || prop === 'APPLICATIONS_DIR') {
      return sandboxWorkspace;
    }
    if (prop === 'PROTOTIPE_DOCS_ROOT') {
      return sandboxDocs;
    }
    return target[prop];
  },
  set(target, prop, value) {
    if (prop === 'PROTOTIPE_WORKSPACE_ROOT' || prop === 'APPLICATIONS_DIR' || prop === 'PROTOTIPE_DOCS_ROOT') {
      // Ignorar escritura de configuración en caliente para evitar romper el sandbox
      return true;
    }
    target[prop] = value;
    return true;
  },
  has(target, prop) {
    if (prop === 'PROTOTIPE_WORKSPACE_ROOT' || prop === 'APPLICATIONS_DIR' || prop === 'PROTOTIPE_DOCS_ROOT') {
      return true;
    }
    return prop in target;
  }
});

Object.defineProperty(process, 'env', {
  value: envProxy,
  writable: true,
  configurable: true,
  enumerable: true
});

const ALLOWED_EXECUTABLES = ['node', 'npm', 'git', 'node.exe', 'npm.cmd', 'git.exe', 'cmd.exe', 'cmd'];
const ALLOWED_GIT_SUBCOMMANDS = ['rev-parse', 'status', 'init', 'add', 'commit'];
const BLOCKED_GIT_SUBCOMMANDS = ['push', 'fetch', 'pull', 'clone', 'remote'];

function checkNetwork(host, port) {
  stats.unexpectedNetworkCalls++;
  const errMsg = `[VIOLACION_RED] Acceso de red bloqueado a: ${host}:${port || 'any'}`;
  console.error(`❌ ${errMsg}`);
  throw new Error(errMsg);
}

// 1. Interceptar HTTP / HTTPS
const origHttpRequest = http.request;
http.request = function(options, ...args) {
  const host = options?.host || options?.hostname || 'unknown';
  checkNetwork(host, options?.port);
  return origHttpRequest.call(this, options, ...args);
};

const origHttpsRequest = https.request;
https.request = function(options, ...args) {
  const host = options?.host || options?.hostname || 'unknown';
  checkNetwork(host, options?.port);
  return origHttpsRequest.call(this, options, ...args);
};

// 2. Interceptar Fetch global
if (global.fetch) {
  const origFetch = global.fetch;
  global.fetch = function(input, init) {
    let urlStr = 'unknown';
    if (typeof input === 'string') {
      urlStr = input;
    } else if (input && typeof input === 'object' && input.url) {
      urlStr = input.url;
    }
    stats.unexpectedNetworkCalls++;
    const errMsg = `[VIOLACION_RED] Fetch bloqueado a: ${urlStr}`;
    console.error(`❌ ${errMsg}`);
    return Promise.reject(new Error(errMsg));
  };
}

// 3. Interceptar net.connect / createConnection / Socket.prototype.connect
const origNetConnect = net.connect;
net.connect = function(options, ...args) {
  const host = options?.host || 'unknown';
  checkNetwork(host, options?.port);
  return origNetConnect.call(this, options, ...args);
};

const origNetCreateConnection = net.createConnection;
net.createConnection = function(options, ...args) {
  const host = options?.host || 'unknown';
  checkNetwork(host, options?.port);
  return origNetCreateConnection.call(this, options, ...args);
};

const origSocketConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function(options, ...args) {
  let host = 'unknown';
  let port = 'any';
  if (options && typeof options === 'object') {
    host = options.host || 'unknown';
    port = options.port || 'any';
  } else if (typeof options === 'number') {
    port = options;
    if (typeof args[0] === 'string') {
      host = args[0];
    }
  }
  checkNetwork(host, port);
  return origSocketConnect.apply(this, arguments);
};

// 4. Interceptar TLS connect
const origTlsConnect = tls.connect;
tls.connect = function(options, ...args) {
  const host = options?.host || 'unknown';
  checkNetwork(host, options?.port);
  return origTlsConnect.call(this, options, ...args);
};

// 5. Interceptar DNS lookup / resolve
const origDnsLookup = dns.lookup;
dns.lookup = function(hostname, ...args) {
  stats.unexpectedNetworkCalls++;
  const errMsg = `[VIOLACION_RED] DNS lookup bloqueado para: ${hostname}`;
  console.error(`❌ ${errMsg}`);
  const callback = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
  if (callback) {
    callback(new Error(errMsg));
  } else {
    throw new Error(errMsg);
  }
};

// 6. Interceptar child_process
function validateProcessSpawn(file, args = []) {
  const basename = path.basename(file).toLowerCase();
  const argsStr = args.join(' ');

  if (argsStr.includes('firebase') && (argsStr.includes('deploy') || argsStr.includes('login') || argsStr.includes('projects:list'))) {
    stats.firebaseCliInvocations++;
    throw new Error(`[MOCK_FIREBASE] Invocación bloqueada de Firebase CLI: ${file} ${argsStr}`);
  }

  if (argsStr.includes('github') || argsStr.includes('gh ')) {
    stats.githubApiInvocations++;
    throw new Error(`[MOCK_GITHUB] Invocación bloqueada de GitHub CLI: ${file} ${argsStr}`);
  }

  const isAllowed = ALLOWED_EXECUTABLES.some(allowed => basename.includes(allowed.toLowerCase()));
  if (!isAllowed) {
    stats.unexpectedExternalProcesses++;
    throw new Error(`[VIOLACION_PROCESO] Proceso no autorizado bloqueado: ${file} ${argsStr}`);
  }

  if (basename.includes('git')) {
    const sub = args[0];
    if (sub) {
      if (BLOCKED_GIT_SUBCOMMANDS.includes(sub.toLowerCase())) {
        stats.unexpectedExternalProcesses++;
        throw new Error(`[VIOLACION_GIT] Subcomando Git prohibido bloqueado: git ${argsStr}`);
      }
      if (!ALLOWED_GIT_SUBCOMMANDS.includes(sub.toLowerCase())) {
        stats.unexpectedExternalProcesses++;
        throw new Error(`[VIOLACION_GIT] Subcomando Git no autorizado bloqueado: git ${argsStr}`);
      }
    }
  }

  stats.allowedControlProcesses++;
}

const origSpawn = child_process.spawn;
child_process.spawn = function(file, args, options, ...rest) {
  validateProcessSpawn(file, args);
  return origSpawn.call(this, file, args, options, ...rest);
};

const origExecFile = child_process.execFile;
child_process.execFile = function(file, args, options, callback, ...rest) {
  let actualArgs = Array.isArray(args) ? args : [];
  validateProcessSpawn(file, actualArgs);
  return origExecFile.call(this, file, args, options, callback, ...rest);
};

const origExec = child_process.exec;
child_process.exec = function(cmd, options, callback) {
  const parts = cmd.trim().split(/\s+/);
  validateProcessSpawn(parts[0], parts.slice(1));
  return origExec.call(this, cmd, options, callback);
};

const origFork = child_process.fork;
child_process.fork = function(modulePath, args, options, ...rest) {
  validateProcessSpawn(process.execPath, [modulePath].concat(args || []));
  return origFork.call(this, modulePath, args, options, ...rest);
};

console.log('🛡️  [NetworkGuard] Aislamiento estricto de red y procesos activos cargado.');
