#!/usr/bin/env node

/**
 * firebase_account_manager.js
 * Utilidad interactiva para gestionar múltiples cuentas de Google/Firebase en el entorno local.
 * Permite listar, agregar, alternar, cerrar sesiones y verificar cuotas y conectividad.
 */

const { execSync } = require('child_process');
const readline = require('readline');

// Códigos ANSI para colores premium en consola
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function printHeader() {
  console.clear();
  console.log(`${COLORS.bright}${COLORS.cyan}================================================================${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.bgCyan}${COLORS.black}            GESTOR MULTI-CUENTA FIREBASE ECOSISTEMA             ${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.cyan}================================================================${COLORS.reset}`);
  console.log(`${COLORS.dim}Administración y rotación rápida de identidades de Google/Firebase${COLORS.reset}\n`);
}

function runCommand(command, description = '', silent = false) {
  if (description) {
    console.log(`${COLORS.cyan}⏳ ${description}...${COLORS.reset}`);
  }
  try {
    const output = execSync(command, { stdio: silent ? 'pipe' : 'inherit' });
    return { success: true, output: output ? output.toString() : '' };
  } catch (err) {
    if (!silent) {
      console.log(`\n${COLORS.red}❌ Error al ejecutar el comando: ${err.message}${COLORS.reset}`);
    }
    return { success: false, error: err.message };
  }
}

function getActiveAccount() {
  try {
    const res = execSync('firebase login:list --json', { stdio: 'pipe' }).toString();
    const data = JSON.parse(res);
    const accounts = data.result || [];
    const active = accounts.find(acc => acc.active);
    return active ? active.user.email : null;
  } catch (_) {
    // Si falla el json fallback, intentar parsear de texto plano
    try {
      const resText = execSync('firebase login', { stdio: 'pipe' }).toString();
      const match = resText.match(/Logged in as\s+([^\s]+)/i);
      return match ? match[1] : null;
    } catch (__) {
      return null;
    }
  }
}

function listAccounts() {
  printHeader();
  console.log(`${COLORS.bright}📋 Cuentas configuradas en la máquina local:${COLORS.reset}\n`);
  
  try {
    const res = execSync('firebase login:list --json', { stdio: 'pipe' }).toString();
    const data = JSON.parse(res);
    const accounts = data.result || [];
    
    if (accounts.length === 0) {
      console.log(`${COLORS.yellow}⚠️  No hay ninguna cuenta de Google vinculada en la CLI de Firebase.${COLORS.reset}`);
      console.log(`${COLORS.dim}Usa la opción 3 para iniciar sesión en tu primera cuenta.${COLORS.reset}\n`);
      return;
    }

    accounts.forEach((acc, index) => {
      const activeMarker = acc.active 
        ? `${COLORS.bright}${COLORS.green}● ACTIVA${COLORS.reset}` 
        : `${COLORS.dim}○ inactiva${COLORS.reset}`;
      console.log(`  [${index + 1}] ${COLORS.bright}${acc.user.email}${COLORS.reset} - [ ${activeMarker} ]`);
    });
    console.log();
    return accounts;
  } catch (err) {
    // Fallback si no soporta --json
    console.log(`${COLORS.cyan}Obteniendo lista de cuentas mediante salida estándar...${COLORS.reset}`);
    const res = runCommand('firebase login:list', '', true);
    if (res.success) {
      console.log(res.output);
    } else {
      console.log(`${COLORS.red}No se pudo obtener la lista de cuentas. Asegúrate de tener instalado firebase-tools.${COLORS.reset}\n`);
    }
    return null;
  }
}

function showMainMenu() {
  printHeader();
  
  const activeEmail = getActiveAccount();
  if (activeEmail) {
    console.log(`  ${COLORS.green}● Cuenta activa para aprovisionamiento:${COLORS.reset} ${COLORS.bright}${activeEmail}${COLORS.reset}`);
  } else {
    console.log(`  ${COLORS.red}○ Sin cuenta activa (Desconectado)${COLORS.reset}`);
  }
  console.log(`${COLORS.cyan}----------------------------------------------------------------${COLORS.reset}\n`);

  console.log(`${COLORS.bright}Selecciona una opción del menú:${COLORS.reset}`);
  console.log(`  [1] ${COLORS.bright}Ver estado y cuenta activa${COLORS.reset}`);
  console.log(`  [2] Listar todas las cuentas locales`);
  console.log(`  [3] ${COLORS.green}Agregar una nueva cuenta (login:add)${COLORS.reset}`);
  console.log(`  [4] ${COLORS.cyan}Alternar / Cambiar de cuenta (login:use)${COLORS.reset}`);
  console.log(`  [5] Cerrar sesión en cuenta específica (logout)`);
  console.log(`  [6] Probar conectividad y listar proyectos activos`);
  console.log(`  [7] ${COLORS.red}Salir${COLORS.reset}\n`);

  rl.question(`${COLORS.bright}Opción > ${COLORS.reset}`, (answer) => {
    handleMenuOption(answer.trim());
  });
}

function handleMenuOption(option) {
  switch (option) {
    case '1': {
      printHeader();
      const active = getActiveAccount();
      if (active) {
        console.log(`${COLORS.green}🟢 CLI de Firebase autenticada con éxito.${COLORS.reset}`);
        console.log(`Cuenta activa actual: ${COLORS.bright}${active}${COLORS.reset}\n`);
      } else {
        console.log(`${COLORS.red}🔴 CLI de Firebase desconectada o sin cuenta activa.${COLORS.reset}`);
        console.log(`${COLORS.dim}Ejecuta la opción 3 para vincular una cuenta.${COLORS.reset}\n`);
      }
      pauseAndReturn();
      break;
    }
    case '2': {
      listAccounts();
      pauseAndReturn();
      break;
    }
    case '3': {
      printHeader();
      console.log(`${COLORS.bright}🔗 Vinculando nueva cuenta de Google...${COLORS.reset}`);
      console.log(`${COLORS.dim}Se abrirá una ventana en tu navegador web para autorizar la CLI.${COLORS.reset}\n`);
      
      const res = runCommand('firebase login:add');
      if (res.success) {
        console.log(`\n${COLORS.green}✅ Cuenta agregada con éxito.${COLORS.reset}\n`);
      }
      pauseAndReturn();
      break;
    }
    case '4': {
      const accounts = listAccounts();
      if (!accounts || accounts.length === 0) {
        pauseAndReturn();
        break;
      }

      rl.question(`${COLORS.bright}Selecciona el número de la cuenta a activar (o enter para cancelar): ${COLORS.reset}`, (numStr) => {
        const index = parseInt(numStr.trim(), 10) - 1;
        if (isNaN(index) || index < 0 || index >= accounts.length) {
          console.log(`\n${COLORS.yellow}Operación cancelada o número inválido.${COLORS.reset}\n`);
          pauseAndReturn();
        } else {
          const selectedEmail = accounts[index].user.email;
          printHeader();
          const res = runCommand(`firebase login:use ${selectedEmail}`, `Alternando cuenta activa a ${selectedEmail}`);
          if (res.success) {
            console.log(`\n${COLORS.green}✅ Cuenta activa alternada exitosamente a: ${selectedEmail}${COLORS.reset}\n`);
          }
          pauseAndReturn();
        }
      });
      break;
    }
    case '5': {
      const accounts = listAccounts();
      if (!accounts || accounts.length === 0) {
        pauseAndReturn();
        break;
      }

      rl.question(`${COLORS.bright}Selecciona el número de la cuenta para cerrar sesión (o enter para cancelar): ${COLORS.reset}`, (numStr) => {
        const index = parseInt(numStr.trim(), 10) - 1;
        if (isNaN(index) || index < 0 || index >= accounts.length) {
          console.log(`\n${COLORS.yellow}Operación cancelada o número inválido.${COLORS.reset}\n`);
          pauseAndReturn();
        } else {
          const selectedEmail = accounts[index].user.email;
          printHeader();
          rl.question(`${COLORS.red}${COLORS.bright}⚠️ ¿Confirmas cerrar la sesión de la cuenta ${selectedEmail}? (s/n): ${COLORS.reset}`, (confirm) => {
            if (confirm.toLowerCase().trim() === 's') {
              const res = runCommand(`firebase logout ${selectedEmail}`, `Cerrando sesión para ${selectedEmail}`);
              if (res.success) {
                console.log(`\n${COLORS.green}✅ Sesión de ${selectedEmail} cerrada con éxito.${COLORS.reset}\n`);
              }
            } else {
              console.log(`\n${COLORS.yellow}Operación cancelada.${COLORS.reset}\n`);
            }
            pauseAndReturn();
          });
        }
      });
      break;
    }
    case '6': {
      printHeader();
      console.log(`${COLORS.bright}🔍 Probando conectividad con Firebase y listando proyectos...${COLORS.reset}\n`);
      const res = runCommand('firebase projects:list');
      if (res.success) {
        console.log(`\n${COLORS.green}✅ Conexión probada con éxito. Credenciales vigentes.${COLORS.reset}\n`);
      } else {
        console.log(`\n${COLORS.red}❌ Falló la conexión. Las credenciales de la cuenta activa podrían estar expiradas.${COLORS.reset}`);
        console.log(`${COLORS.dim}Prueba a iniciar sesión de nuevo con la opción 3 o alternar de cuenta con la opción 4.${COLORS.reset}\n`);
      }
      pauseAndReturn();
      break;
    }
    case '7': {
      console.log(`\n${COLORS.cyan}👋 ¡Hasta luego! Saliendo del gestor de cuentas Firebase.${COLORS.reset}\n`);
      rl.close();
      process.exit(0);
      break;
    }
    default: {
      console.log(`\n${COLORS.red}Opción no reconocida. Intenta de nuevo.${COLORS.reset}\n`);
      setTimeout(showMainMenu, 1500);
      break;
    }
  }
}

function pauseAndReturn() {
  rl.question(`${COLORS.dim}Presiona enter para volver al menú principal...${COLORS.reset}`, () => {
    showMainMenu();
  });
}

// Inicialización de la aplicación
showMainMenu();
