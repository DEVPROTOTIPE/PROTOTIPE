import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { execSync } from 'child_process';
import { createProject, PALETTES } from './generator.js';
import { getWorkspaceRoot, getTemplatesDir, getRegistroPath, getInstancePath } from './config.js';

const CLI_ROOT = process.cwd();
const TEMPLATES_DIR = getTemplatesDir();


// Función helper para convertir HEX a HSL
export function hexToHsl(hex) {
  hex = hex.replace(/#/g, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // acromático
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

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Helper para oscurecer/aclarar HSL para generar acentos/complementarios
export function shiftHslLightness(hslStr, amount) {
  const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hslStr;
  const h = parseInt(match[1]);
  const s = parseInt(match[2]);
  let l = parseInt(match[3]) + amount;
  l = Math.max(0, Math.min(100, l));
  return `hsl(${h}, ${s}%, ${l}%)`;
}

async function main() {
  console.log('\n' + pc.bold(pc.cyan('====================================================')));
  console.log(pc.bold(pc.cyan('       🚀 PROTOTIPE - GENERADOR DE PROYECTOS CLI      ')));
  console.log(pc.bold(pc.cyan('====================================================\n')));

  // 1. Obtener plantillas disponibles
  if (!await fs.pathExists(TEMPLATES_DIR)) {
    console.error(pc.red(`❌ La carpeta de plantillas no existe en: ${TEMPLATES_DIR}`));
    process.exit(1);
  }

  const templates = await fs.readdir(TEMPLATES_DIR);
  if (templates.length === 0) {
    console.error(pc.red('❌ No se encontraron plantillas en la carpeta /templates/'));
    process.exit(1);
  }

  // 2. Formulario Interactivo
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Selecciona la plantilla base para el nuevo proyecto:',
      choices: templates
    },
    {
      type: 'input',
      name: 'projectName',
      message: 'Nombre del nuevo proyecto (ej. App Veterinaria Husky, Moni):',
      validate: input => input.trim().length > 0 ? true : 'El nombre es obligatorio.'
    },
    {
      type: 'input',
      name: 'targetPath',
      message: 'Ruta absoluta donde se creará el proyecto:',
      default: async (ans) => {
        const folderName = ans.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let coreType = 'seed';
        try {
          const registro = await fs.readJson(getRegistroPath());
          const templateConfig = Object.values(registro.plantillas).find(p => path.basename(p.destino) === ans.template);
          if (templateConfig && templateConfig.coreType) {
            coreType = templateConfig.coreType;
          }
        } catch (e) {}
        return getInstancePath(coreType, `App-${folderName}`);
      }
    },
    {
      type: 'list',
      name: 'paletteChoice',
      message: 'Elige una paleta de color de marca inicial (puedes cambiarla después):',
      choices: [
        { name: '🟢 Verde Esmeralda (Ideal restaurantes, abarrotes)', value: 'emerald' },
        { name: '🔴 Rosa Elegante / Rubí (Ideal ropa, accesorios)', value: 'ruby' },
        { name: '🟣 Púrpura Mora / Violeta (Ideal barberías, estéticas)', value: 'violet' },
        { name: '🟡 Dorado Premium / Ámbar (Ideal joyería, café bar)', value: 'amber' },
        { name: '🌈 Ingresar color en HEX (#RRGGBB)', value: 'hex' },
        { name: '🎨 Personalizada en HSL (Configurar manualmente)', value: 'custom' }
      ]
    },
    {
      type: 'input',
      name: 'hexColor',
      message: 'Introduce el color corporativo en formato HEX (ej. #7c4dff):',
      when: (ans) => ans.paletteChoice === 'hex',
      validate: (input) => {
        const reg = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
        return reg.test(input) ? true : 'Formato HEX incorrecto. Debe ser como #7c4dff o 7c4dff';
      }
    },
    {
      type: 'input',
      name: 'customPrimary',
      message: 'Introduce tu color primario en formato HSL (ej. hsl(210, 100%, 50%)):',
      when: (ans) => ans.paletteChoice === 'custom',
      validate: (input) => input.startsWith('hsl(') && input.endsWith(')') ? true : 'Formato incorrecto. Debe empezar con "hsl(" y terminar con ")"'
    },
    {
      type: 'input',
      name: 'customAccent',
      message: 'Introduce tu color de acción/acentuación en formato HSL (ej. hsl(210, 100%, 40%)):',
      when: (ans) => ans.paletteChoice === 'custom',
      validate: (input) => input.startsWith('hsl(') && input.endsWith(')') ? true : 'Formato incorrecto. Debe empezar con "hsl(" y terminar con ")"'
    },
    {
      type: 'input',
      name: 'firebaseApiKey',
      message: 'Firebase API Key (.env.local):',
      validate: input => input.trim().length > 0 ? true : 'El API Key es obligatorio.'
    },
    {
      type: 'input',
      name: 'firebaseAuthDomain',
      message: 'Firebase Auth Domain (.env.local):',
      validate: input => input.trim().length > 0 ? true : 'El Auth Domain es obligatorio.'
    },
    {
      type: 'input',
      name: 'firebaseProjectId',
      message: 'Firebase Project ID (.env.local):',
      validate: input => input.trim().length > 0 ? true : 'El Project ID es obligatorio.'
    },
    {
      type: 'input',
      name: 'firebaseStorageBucket',
      message: 'Firebase Storage Bucket (.env.local):',
      validate: input => input.trim().length > 0 ? true : 'El Storage Bucket es obligatorio.'
    },
    {
      type: 'input',
      name: 'firebaseAppId',
      message: 'Firebase App ID (.env.local):',
      validate: input => input.trim().length > 0 ? true : 'El App ID es obligatorio.'
    },
    {
      type: 'input',
      name: 'centralApiKey',
      message: 'API Key de prototipe-ecosistema-control (consola central):',
      default: () => process.env.VITE_DEVELOPER_CENTRAL_API_KEY || 'AIzaSyCBkdokIpGqWlfFiU_i83o7GmV1ZTqXYJE'
    },
    {
      type: 'input',
      name: 'centralAppId',
      message: 'App ID de prototipe-ecosistema-control:',
      default: () => process.env.VITE_DEVELOPER_CENTRAL_APP_ID || '1:703542009613:web:00f9363de11a908c991a44'
    },
    {
      type: 'confirm',
      name: 'enableFirebaseDeploy',
      message: '¿Deseas desplegar reglas e índices en Firebase en este paso?',
      default: true
    }
  ]);

  try {
    // Si eligió HEX, convertirlo a HSL y asignarlo como customPrimary/customAccent
    if (answers.paletteChoice === 'hex') {
      const primaryHsl = hexToHsl(answers.hexColor);
      answers.customPrimary = primaryHsl;
      answers.customAccent = shiftHslLightness(primaryHsl, -10); // 10% más oscuro para el color de acción
      answers.paletteChoice = 'custom';
    }

    const result = await createProject(answers);

    console.log('\n' + pc.bold(pc.green('====================================================')));
    console.log(pc.bold(pc.green(`🎉 ¡PROYECTO [${answers.projectName}] CREADO CON ÉXITO!`)));
    console.log(pc.bold(pc.green('====================================================')));
    console.log(pc.white(`Ruta física: ${pc.cyan(result.targetDir)}`));
    console.log(pc.white(`Tema HSL inyectado: ${pc.cyan(result.themeName)} (${result.primaryColor})`));
    console.log(pc.white(`\nInstrucciones para iniciar el desarrollo:`));
    console.log(pc.yellow(`1. Abre el nuevo proyecto en tu editor`));
    console.log(pc.yellow(`2. Ejecuta: npm run dev`));
    console.log(pc.bold(pc.yellow('\n📋 CHECKLIST DE APROVISIONAMIENTO OBLIGATORIO:')));
    console.log(pc.white(`Token generado para este cliente: ${pc.cyan(result.uniqueToken)}`));
    // [BLINDAJE-SEGURIDAD] Mostrar la contraseña admin única generada para este cliente.
    // Guardarla en un lugar seguro — no se puede recuperar después.
    if (result.adminPassword) {
      console.log(pc.bold(pc.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')));
      console.log(pc.bold(pc.yellow('🔑 CREDENCIALES ADMIN (únicas, guárdalas ahora):')));
      console.log(pc.white(`   Email:    ${pc.cyan(`admin@${answers.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.com`)}`));
      console.log(pc.white(`   Password: ${pc.cyan(result.adminPassword)}`));
      console.log(pc.bold(pc.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')));
    }
    console.log(pc.green('✓ Instancia y token auto-registrados en Consola Central (Firestore).'));
    console.log(pc.green('✓ Service Worker de notificaciones y .firebaserc pre-vinculados.'));
    console.log(pc.bold(pc.green('====================================================\n')));
  } catch (err) {
    console.error(pc.red(`❌ Error al crear el proyecto: ${err.message}`));
  }
}

main().catch(err => {
  console.error(pc.red(`❌ Error crítico de ejecución en CLI: ${err.message}`));
});
