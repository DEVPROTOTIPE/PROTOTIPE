import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';

const CLI_ROOT = process.cwd();
const LOG_FILE = path.join(CLI_ROOT, 'cli_bridge.log');

/**
 * Escribe una línea formateada en cli_bridge.log y en la consola
 * @param {string} category Categoría (INFO, SUCCESS, WARNING, ERROR)
 * @param {string} message Mensaje a loguear
 */
function logMessage(category, message) {
  const timestamp = new Date().toISOString();
  const rawLine = `[${timestamp}] [${category.toUpperCase()}] ${message}\n`;

  // Asegurar que exista el archivo de log y escribir
  try {
    fs.appendFileSync(LOG_FILE, rawLine, 'utf-8');
  } catch (err) {
    console.error(pc.red(`[LOGGER ERROR] No se pudo escribir en ${LOG_FILE}: ${err.message}`));
  }

  // Imprimir en consola con colores estilizados
  switch (category.toUpperCase()) {
    case 'SUCCESS':
      console.log(pc.green(`✓ ${message}`));
      break;
    case 'WARNING':
      console.log(pc.yellow(`⚠️ ${message}`));
      break;
    case 'ERROR':
      console.error(pc.red(`❌ ${message}`));
      break;
    case 'INFO':
    default:
      console.log(pc.cyan(`i ${message}`));
      break;
  }
}

export const logger = {
  info: (msg) => logMessage('INFO', msg),
  success: (msg) => logMessage('SUCCESS', msg),
  warn: (msg) => logMessage('WARNING', msg),
  error: (msg) => logMessage('ERROR', msg)
};
