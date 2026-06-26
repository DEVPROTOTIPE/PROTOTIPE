import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import ora from 'ora';
import { Jimp } from 'jimp';
import { getWorkspaceRoot } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = __dirname;
const TEMPLATES_DIR = path.join(CLI_ROOT, 'templates');

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

function hslToRgbaHex(hslStr, alpha = 255) {
  const parsed = parseHSL(hslStr);
  if (!parsed) return 0xffffffff;
  const h = parsed.h / 360;
  const s = parsed.s / 100;
  const l = parsed.l / 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const rRound = Math.round(r * 255);
  const gRound = Math.round(g * 255);
  const bRound = Math.round(b * 255);
  return (rRound * 0x1000000) + (gRound * 0x10000) + (bRound * 0x100) + alpha;
}

// Paletas HSL por defecto
export const PALETTES = {
  emerald: { primary: 'hsl(142, 70%, 45%)', accent: 'hsl(142, 76%, 36%)', theme: 'verde-esmeralda' },
  ruby: { primary: 'hsl(346, 84%, 61%)', accent: 'hsl(346, 84%, 49%)', theme: 'rosa-elegante' },
  violet: { primary: 'hsl(262, 83%, 58%)', accent: 'hsl(262, 83%, 45%)', theme: 'purpura-mora' },
  amber: { primary: 'hsl(38, 92%, 50%)', accent: 'hsl(38, 92%, 40%)', theme: 'dorado-premium' }
};

/**
 * Valida de forma remota las credenciales de Firebase enviadas por el usuario.
 * @param {string} apiKey API Key de Firebase
 * @param {string} projectId Project ID de Firebase
 */
async function validateFirebaseCredentials(apiKey, projectId) {
  // Se añade la subruta '/config' para evitar que Google devuelva un HTML 404 genérico por consultar la raíz
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/config?key=${apiKey}`;
  try {
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (_) {
      throw new Error(`Respuesta no válida de Google Cloud (404 HTML). Verifica el Project ID: "${projectId}".`);
    }

    if (res.status === 400 && data.error && (data.error.message.includes('API key') || data.error.message.includes('INVALID'))) {
      throw new Error(`API Key de Firebase inválida: ${data.error.message}`);
    }
    
    if (res.status === 403 && data.error) {
      const msg = data.error.message || '';
      if (msg.includes('Permission denied on resource project') || data.error.status === 'PERMISSION_DENIED' && msg.includes(projectId)) {
        throw new Error(`El Project ID de Firebase "${projectId}" no existe o no tiene Firestore activo.`);
      }
    }

    if (res.status === 404 && data.error && data.error.message.includes('not found')) {
      throw new Error(`El Project ID de Firebase "${projectId}" no existe o no tiene Firestore activo.`);
    }

    return true;
  } catch (err) {
    if (err.message.includes('fetch failed') || err.message.includes('network') || err.message.includes('FetchError')) {
      throw new Error(`Error de red al conectar con Firebase: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Valida el entorno local asegurando que las dependencias CLI (firebase, gh si se requiere) estén
 * instaladas y con sesión iniciada.
 * @param {Object} answers Datos de configuración
 */
async function checkEnvironment(answers) {
  const spinner = ora('🔍 Ejecutando preflight check del entorno...').start();
  
  // 1. Validar Firebase CLI
  try {
    execSync('firebase --version', { stdio: 'ignore' });
  } catch (err) {
    spinner.fail();
    throw new Error('Firebase CLI no está instalado en el sistema global. Por favor instálalo (npm install -g firebase-tools).');
  }

  try {
    execSync('firebase projects:list', { stdio: 'ignore' });
  } catch (err) {
    spinner.fail();
    throw new Error('Firebase CLI no tiene sesión iniciada. Ejecuta: firebase login');
  }

  // 1.1 Validar credenciales de Firebase en la nube si no es aprovisionamiento automático
  if (!answers.autoProvisionFirebase && answers.firebaseApiKey && answers.firebaseProjectId) {
    spinner.text = '🔍 Validando credenciales de Firebase en la nube...';
    try {
      await validateFirebaseCredentials(answers.firebaseApiKey, answers.firebaseProjectId);
    } catch (err) {
      spinner.fail();
      throw new Error(`Fallo en preflight check de Firebase: ${err.message}`);
    }
  }

  // 2. Validar GitHub CLI si se requiere subir a GitHub
  if (answers.enableGithub) {
    try {
      execSync('gh --version', { stdio: 'ignore' });
    } catch (err) {
      spinner.fail();
      throw new Error('GitHub CLI (gh) no está instalado. Instálalo o desactiva la opción de subir a GitHub.');
    }

    try {
      execSync('gh auth status', { stdio: 'ignore' });
    } catch (err) {
      spinner.fail();
      throw new Error('GitHub CLI (gh) no tiene sesión iniciada. Ejecuta: gh auth login');
    }
  }

  spinner.succeed('Preflight check completado con éxito. Entorno verificado y credenciales validadas.');
}

/**
 * Lógica pura de aprovisionamiento de un nuevo proyecto con automatización extrema.
 * @param {Object} answers Datos recolectados del Briefing
 */
export async function createProject(answers) {
  // Validaciones de preflight
  await checkEnvironment(answers);

  // 0. Resolver coreType de la plantilla e inyectarlo en answers
  let coreType = 'seed';
  try {
    const { getRegistroPath } = await import('./config.js');
    const registro = await fs.readJson(getRegistroPath());
    const templateConfig = Object.values(registro.plantillas).find(p => path.basename(p.destino) === answers.template);
    if (templateConfig && templateConfig.coreType) {
      coreType = templateConfig.coreType;
    }
  } catch (e) {}
  answers.coreType = coreType;

  // Resolver targetDir automáticamente usando getInstancePath
  const { getInstancePath } = await import('./config.js');
  const folderName = answers.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const targetDir = getInstancePath(coreType, `App-${folderName}`);
  const srcTemplateDir = path.join(TEMPLATES_DIR, answers.template);

  // Resolver colores HSL y Tema de la paleta seleccionada (Auditoría)
  let primaryColor, accentColor, themeName;
  if (answers.paletteChoice === 'custom') {
    primaryColor = answers.customPrimary;
    accentColor = answers.customAccent;
    themeName = 'custom';
  } else {
    const selected = PALETTES[answers.paletteChoice] || PALETTES.ruby;
    primaryColor = selected.primary;
    accentColor = selected.accent;
    themeName = selected.theme;
  }

  console.log('\n' + pc.yellow(`⚡ Iniciando aprovisionamiento automatizado en: ${targetDir}`));

  // 1. Crear directorio de destino y copiar plantilla
  const step1 = ora('Copiar estructura base de plantilla').start();
  try {
    if (await fs.pathExists(targetDir)) {
      step1.info('La ruta de destino ya existe. Los archivos se sobrescribirán.');
      step1.start('Copiar estructura base de plantilla');
    }
    await fs.ensureDir(targetDir);
    await fs.copy(srcTemplateDir, targetDir);
    step1.succeed('Estructura base de plantilla copiada correctamente.');
  } catch (err) {
    step1.fail(`Fallo al copiar plantilla: ${err.message}`);
    throw err;
  }

  // 1.1 Configurar documentación local de la instancia/proyecto (Estándar v2 — 12 archivos)
  const stepDoc = ora('Configurar carpeta de documentación local (12 archivos estándar)').start();
  try {
    const docDirName = `Documentacion ${answers.projectName}`;
    const targetDocDir = path.join(targetDir, docDirName);

    // Si el template trae carpeta de documentación con otro nombre, renombrarla
    const files = await fs.readdir(targetDir);
    const tempDocFolder = files.find(f => f.startsWith('Documentacion') && f !== docDirName);
    if (tempDocFolder) {
      await fs.move(path.join(targetDir, tempDocFolder), targetDocDir, { overwrite: true });
    } else {
      await fs.ensureDir(targetDocDir);
    }

    const today = new Date().toISOString().split('T')[0];

    // Definición canónica de los 12 archivos estándar de documentación
    const docStandard = [
      {
        name: 'tareas_pendientes.md',
        content: `# 📋 Control de Tareas — ${answers.projectName}\n\nRoadmap de tareas específicas para esta instancia.\n\n- [ ] Configuración inicial completada\n- [ ] Revisar y completar \`contexto_negocio.md\` con el briefing del cliente\n- [ ] Completar \`esquema_colecciones.md\` con el modelo de datos real\n- [ ] Completar \`guia_estilos_ui.md\` con la paleta y tokens confirmados\n`
      },
      {
        name: 'bitacora_cambios.md',
        content: `# 📝 Bitácora de Cambios — ${answers.projectName}\n\n### [${today}] - Aprovisionamiento Inicial\n* **Tipo:** Sistema\n* **Plantilla:** \`${answers.template}\`\n* **Nicho:** ${answers.niche || 'general_custom'}\n* **Descripción:** Proyecto inicializado y documentación estándar provisionada automáticamente.\n`
      },
      {
        name: 'mapa_aplicacion.md',
        content: `# 🗺️ Mapa de la Aplicación — ${answers.projectName}\n\nEstructura física y lógica de los archivos de la instancia.\n\n> Actualiza este documento cuando agregues módulos, rutas o vistas nuevas.\n\n## Rutas y Vistas\n*(Por completar)*\n\n## Módulos de Negocio\n*(Por completar)*\n`
      },
      {
        name: 'esquema_colecciones.md',
        content: `# 🗄️ Esquema de Colecciones Firestore — ${answers.projectName}\n\nModelado de datos específico para esta instancia.\n\n> Copia la estructura de colecciones del core \`${answers.template}\` y adapta los campos al cliente.\n\n## Colecciones Principales\n*(Por completar — ver core fuente para referencia base)*\n`
      },
      {
        name: 'plan_implementacion_ia.md',
        content: `# 🤖 Plan de Implementación IA — ${answers.projectName}\n\nPropuestas de integraciones con inteligencia artificial para esta instancia.\n\n## Automatizaciones Prioritarias\n*(Por definir con el cliente)*\n`
      },
      {
        name: 'manual_migracion.md',
        content: `# 🚀 Manual de Despliegue — ${answers.projectName}\n\n## Proyecto Firebase\n- **Project ID:** ${answers.firebaseProjectId || '*(pendiente)*'}\n- **Plantilla base:** \`${answers.template}\`\n\n## Variables de Entorno\nVer \`.env.local\` en la raíz del proyecto.\n\n## Comandos de Despliegue\n\`\`\`bash\nnpm run build\nfirebase deploy --only hosting\n\`\`\`\n`
      },
      {
        name: 'flujos_aplicacion.md',
        content: `# 🔄 Flujos Operativos — ${answers.projectName}\n\nDiagramas de secuencia y flujos de datos críticos de esta instancia.\n\n> Adaptar los flujos del core \`${answers.template}\` a la lógica específica del cliente.\n\n## Flujo Principal\n*(Por documentar)*\n`
      },
      {
        name: 'mapa_arquitectura.md',
        content: `# 🏗️ Mapa de Arquitectura Física — ${answers.projectName}\n\nÁrbol de directorios y responsabilidades por capa.\n\n> Ejecutar \`node scratch/generate_ia_map.js\` para auto-generar este mapa.\n`
      },
      {
        name: 'mapa_arquitectura_ia.md',
        content: `# 🧠 Mapa Semántico para IA — ${answers.projectName}\n\nReferencia directa de archivos clave para que la IA navegue el proyecto sin búsquedas ciegas.\n\n> Ejecutar \`npm run map\` para regenerar este mapa con la estructura actual.\n\n## Archivos Críticos\n| Archivo | Propósito |\n|---|---|\n| \`src/App.jsx\` | Entrada principal, enrutador y providers |\n| \`src/store/\` | Stores de estado global (Zustand) |\n| \`src/hooks/\` | Hooks personalizados de lógica de negocio |\n| \`.env.local\` | Variables de entorno — NO editar en código |\n`
      },
      // ─── NUEVOS: CRÍTICOS PARA CONTEXTO DE IA ───────────────────────────────
      {
        name: 'contexto_negocio.md',
        content: `# 🏢 Contexto de Negocio — ${answers.projectName}\n\n> **CRÍTICO PARA LA IA:** Este archivo define la semántica del negocio. Sin él, la IA puede generar código técnicamente correcto pero operativamente incorrecto.\n\n## Cliente\n- **Nombre del negocio:** ${answers.projectName}\n- **Nicho / Vertical:** ${answers.niche || 'general_custom'}\n- **Requerimientos especiales:** ${answers.customRequirements || '*(Ninguno especificado)*'}\n\n## Usuario Final\n*(Describir: quién usa la app, nivel técnico, dispositivos principales)*\n\n## Flujos de Negocio en Lenguaje Natural\n*(Describir los procesos core del negocio paso a paso, sin términos técnicos)*\n\n## Reglas de Dominio Implícitas\n*(Reglas de negocio no obvias que la IA debe respetar. Ej: "Un pedido no puede cancelarse si ya fue despachado")*\n\n## KPIs y Métricas Importantes para el Cliente\n*(Qué mide el dueño del negocio para saber si le va bien)*\n`
      },
      {
        name: 'restricciones_tecnicas.md',
        content: `# 🚫 Restricciones Técnicas — ${answers.projectName}\n\n> La IA debe consultar este archivo antes de actualizar dependencias, cambiar patterns o sugerir librerías.\n\n## Stack Fijo (No Negociable)\n- **Framework:** React + Vite\n- **Estilos:** Tailwind CSS v4 con tokens HSL en \`@theme\`\n- **DB:** Firebase Firestore\n- **Estado:** Zustand\n- **Plantilla base:** \`${answers.template}\`\n\n## Dependencias con Versión Fijada\n| Dependencia | Versión | Razón del bloqueo |\n|---|---|---|\n| firebase | Ver package.json | Compatibilidad con reglas de seguridad existentes |\n\n## Patrones Prohibidos en Este Proyecto\n- ❌ Hardcodear Project IDs o credenciales en código fuente\n- ❌ \`onSnapshot\` sin validar Auth y sin retornar cleanup\n- ❌ Modificar stock/inventario sin \`runTransaction\`\n- ❌ Despliegues automáticos sin aprobación explícita\n- ❌ Bordes negros crudos — usar \`border-app\` o HSL bajos\n\n## Limitaciones Conocidas de Esta Instancia\n*(Ej: "El cliente usa solo dispositivos Android con conexión 4G inestable")*\n`
      },
      {
        name: 'guia_estilos_ui.md',
        content: `# 🎨 Guía de Estilos UI — ${answers.projectName}\n\n> La IA debe respetar estos tokens antes de agregar cualquier color, tipografía o espaciado.\n\n## Paleta de Colores (HSL)\n- **Primario:** \`${answers.branding?.primaryColor || answers.customPrimary || 'Ver .env.local → VITE_INITIAL_THEME'}\`\n- **Acento:** \`${answers.branding?.secondaryColor || answers.customAccent || '*(derivar del primario -10% lightness)*'}\`\n- **Fondo:** \`${answers.branding?.bgColor || 'hsl(224, 71%, 4%)'}\`\n- **Texto:** \`${answers.branding?.textColor || 'hsl(213, 31%, 91%)'}\`\n\n## Tipografía\n- **Google Font:** \`${answers.branding?.googleFont || 'Inter'}\`\n- **Escala:** base 14px (móvil) / 16px (escritorio)\n\n## Tokens de Diseño\n| Token | Valor |\n|---|---|\n| Radius | 0.75rem (cards), 0.5rem (botones) |\n| Shadow | \`0 4px 24px hsl(var(--primary)/0.15)\` |\n| Blur glassmorphism | \`backdrop-blur-xl\` |\n\n## Componentes Atómicos Disponibles\n- \`/src/components/ui/\` — Consultar antes de crear nuevos elementos base\n\n## Convenciones de IDs y Clases\n- IDs en kebab-case descriptivo: \`btn-confirm-sale\`, \`input-product-name\`\n- No usar IDs genéricos como \`btn1\`, \`div2\`\n`
      }
    ];

    // Generar cada archivo: respetar contenido existente (no sobreescribir)
    for (const doc of docStandard) {
      const filePath = path.join(targetDocDir, doc.name);
      if (!await fs.pathExists(filePath)) {
        await fs.writeFile(filePath, doc.content, 'utf-8');
      } else {
        // Si existe pero viene del core con contenido genérico de placeholder, adaptar el nombre del proyecto
        let existing = await fs.readFile(filePath, 'utf-8');
        if (existing.includes('Plantilla Core') || existing.includes('App Ventas')) {
          existing = existing.replace(/Plantilla Core/g, answers.projectName).replace(/App Ventas/g, answers.projectName);
          await fs.writeFile(filePath, existing, 'utf-8');
        }
      }
    }

    stepDoc.succeed(`Documentación estándar (12 archivos) provisionada en \`${docDirName}/\`.`);
  } catch (docErr) {
    stepDoc.warn(`No se pudo inicializar la documentación local: ${docErr.message}`);
  }

  // 2.1 Inyectar colores HSL en caliente en src/index.css
  const stepCSS = ora('Inyectando variables de tema HSL en src/index.css').start();
  try {
    const indexPathCSS = path.join(targetDir, 'src', 'index.css');
    if (await fs.pathExists(indexPathCSS)) {
      let cssContent = await fs.readFile(indexPathCSS, 'utf-8');
      
      const brand = answers.branding || {};
      const brandPrimary = brand.primaryColor || primaryColor || '#6366f1';
      const brandAccent = brand.secondaryColor || accentColor || '#a855f7';
      const brandBg = brand.bgColor || '#f8fafc';
      const brandText = brand.textColor || '#0f172a';
      const brandSurface = brand.surfaceColor || '#ffffff';
      const brandSurface2 = brand.surface2Color || '#f1f5f9';
      const brandBorder = brand.borderColor || '#cbd5e1';
      const brandTextMuted = brand.textMutedColor || '#475569';
      const brandRadius = brand.radiusBase || '0.75rem';
      const brandFont = brand.googleFont || 'Inter';

      const rootVarsBlock = `:root {
  --color-primary: ${brandPrimary};
  --color-primary-light: ${brandPrimary}dd;
  --color-primary-dark: ${brandPrimary};
  --color-secondary: ${brandSurface2};
  --color-accent: ${brandAccent};
  --color-bg: ${brandBg};
  --color-surface: ${brandSurface};
  --color-surface-2: ${brandSurface2};
  --color-text: ${brandText};
  --color-text-muted: ${brandTextMuted};
  --color-border: ${brandBorder};
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Variables de apariencia */
  --font-body: '${brandFont}', system-ui, sans-serif;
  --radius-base: ${brandRadius};
  --color-action: var(--color-primary);
}`;
      
      if (cssContent.includes(':root {')) {
        cssContent = cssContent.replace(/:root\s*\{[^}]*\}/g, rootVarsBlock);
      } else {
        cssContent = rootVarsBlock + '\n\n' + cssContent;
      }
      
      await fs.writeFile(indexPathCSS, cssContent, 'utf-8');
      stepCSS.succeed('Variables de marca completas inyectadas en src/index.css.');
    } else {
      stepCSS.info('No se encontró src/index.css para inyectar colores en caliente.');
    }
  } catch (cssErr) {
    stepCSS.warn(`Aviso al configurar variables en src/index.css: ${cssErr.message}`);
  }

  // 3. (Paso omitido: FCM desactivado)
  const step4 = ora('Generar variables de entorno (.env.local)').start();
  const clientId = answers.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const initials = (answers.projectName || 'P')
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3) || 'P';
  const uniqueToken = (answers.telemetryToken || `${clientId}-token-${Date.now()}`).trim();

  // Sanitizar todos los inputs eliminando espacios accidentales
  const fbApiKey = String(answers.firebaseApiKey || '').trim();
  const fbAuthDomain = String(answers.firebaseAuthDomain || '').trim();
  const fbProjectId = String(answers.firebaseProjectId || '').trim();
  const fbStorageBucket = String(answers.firebaseStorageBucket || '').trim();
  const fbAppId = String(answers.firebaseAppId || '').trim();

  const centralApiKey = String(answers.centralApiKey || '').trim();
  const centralAppId = String(answers.centralAppId || '').trim();

  const envContent = `VITE_FIREBASE_API_KEY=${fbApiKey}
VITE_FIREBASE_AUTH_DOMAIN=${fbAuthDomain}
VITE_FIREBASE_PROJECT_ID=${fbProjectId}
VITE_FIREBASE_STORAGE_BUCKET=${fbStorageBucket}
VITE_FIREBASE_APP_ID=${fbAppId}
VITE_INITIAL_THEME=${themeName}
VITE_DEVELOPER_EMAIL=${answers.developerEmail || ''}

# Credenciales del Administrador de la Instancia (Autogeneradas)
VITE_DEVELOPER_ADMIN_EMAIL=admin@${clientId}.com
VITE_DEVELOPER_ADMIN_PASSWORD=Admin2026!

# Telemetría de Comisiones del Desarrollador (Centralización Central - HTTPS Blaze)
VITE_DEVELOPER_TELEMETRY_ENDPOINT=https://reporttelemetry-bkwhzlbhlq-uc.a.run.app
VITE_DEVELOPER_TELEMETRY_TOKEN=${uniqueToken}
VITE_DEVELOPER_CLIENT_ID=${clientId}

# Configuración Local de Facturación de Instancias (Fallback)
VITE_DEVELOPER_BILLING_MODE=${answers.billingMode || 'percentage'}
VITE_DEVELOPER_COMMISSION_PERCENT=${answers.comisionPorcentaje ?? 1.5}
VITE_DEVELOPER_FIXED_SERVICE_FEE=${answers.montoFijoServicio ?? 0}
VITE_DEVELOPER_FLAT_MONTHLY_FEE=${answers.pagoMensualFijo ?? 0}
VITE_DEVELOPER_ENABLE_DIAN_BILLING=${answers.enableDianBilling ?? false}
VITE_DEVELOPER_COSTO_POR_FACTURA_DIAN=${answers.costoPorFacturaDian ?? 0}

# Nicho / Vertical de Negocio (usado por telemetría para contextualizar reportes de error)
VITE_NICHE=${answers.niche || 'general'}
`;

  await fs.writeFile(path.join(targetDir, '.env.local'), envContent, 'utf-8');
  step4.succeed('Variables de entorno (.env.local) generadas e inyectadas.');

  // 4.1. Crear archivo .gitignore de forma nativa para prevenir fugas de secretos (Auditoría)
  const gitignorePath = path.join(targetDir, '.gitignore');
  const gitignoreContent = `# Logs y Cachés
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Directorios de dependencias
node_modules/

# Build output - NUNCA subir al repositorio
dist/
dist-ssr/

# Variables de entorno - SECRETOS: NUNCA subir
.env
.env.*
!.env.example

# Firebase CLI cache y builds locales - NUNCA subir
.firebase/
firebase-debug.log
firebase-debug.*.log

# Vite cache
.vite/

# IDEs y Editores
.vscode/*
!.vscode/extensions.json
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Carpeta de pruebas y scratch local
scratch/
playwright-report/
test-results/
`;
  await fs.writeFile(gitignorePath, gitignoreContent, 'utf-8');

  // 5. Crear archivo .firebaserc de forma nativa
  const step5 = ora('Generar archivo de vinculación .firebaserc').start();
  const firebasercContent = JSON.stringify({
    projects: {
      default: answers.firebaseProjectId
    }
  }, null, 2);
  await fs.writeFile(path.join(targetDir, '.firebaserc'), firebasercContent, 'utf-8');
  step5.succeed('Archivo de vinculación .firebaserc generado automáticamente.');

  // 5.1 Crear archivo firebase.json de forma nativa para configurar Firestore y Storage
  const step5_1 = ora('Generar configuración firebase.json').start();
  const firebaseJsonPath = path.join(targetDir, 'firebase.json');
  if (!(await fs.pathExists(firebaseJsonPath))) {
    const firebaseJsonContent = JSON.stringify({
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
        rewrites: [
          {
            source: "**",
            destination: "/index.html"
          }
        ]
      }
    }, null, 2);
    await fs.writeFile(firebaseJsonPath, firebaseJsonContent, 'utf-8');
    step5_1.succeed('Configuración firebase.json generada correctamente (fallback).');
  } else {
    step5_1.succeed('Configuración firebase.json heredada de la plantilla.');
  }

  // Asegurar cabeceras estrictas de caché PWA a futuro en firebase.json (CORE-090)
  try {
    if (await fs.pathExists(firebaseJsonPath)) {
      const config = await fs.readJson(firebaseJsonPath);
      if (!config.hosting) config.hosting = {};
      const hostings = Array.isArray(config.hosting) ? config.hosting : [config.hosting];
      
      const requiredHeaders = [
        { source: '/index.html', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
        { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
        { source: '/firebase-messaging-sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
        { source: '/manifest.webmanifest', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
        { source: '/manifest.json', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
        { source: '/assets/**', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }
      ];
      
      let changed = false;
      for (const h of hostings) {
        if (!h.headers) h.headers = [];
        for (const req of requiredHeaders) {
          const idx = h.headers.findIndex(item => item.source === req.source);
          if (idx === -1) {
            h.headers.push(req);
            changed = true;
          } else {
            const existing = h.headers[idx];
            const hasCacheCtrl = existing.headers && existing.headers.some(x => x.key === 'Cache-Control' && x.value === req.headers[0].value);
            if (!hasCacheCtrl) {
              h.headers[idx] = req;
              changed = true;
            }
          }
        }
      }
      if (changed) {
        config.hosting = Array.isArray(config.hosting) ? hostings : hostings[0];
        await fs.writeJson(firebaseJsonPath, config, { spaces: 2 });
      }
    }
  } catch (err) {
    console.error('⚠️ Error al inyectar cabeceras estrictas de caché en firebase.json:', err.message);
  }

  const step5_2 = ora('Generar reglas de almacenamiento storage.rules').start();
  const storageRulesContent = `rules_version = '2';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    match /{allPaths=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}\n`;
  const storageRulesPath = path.join(targetDir, 'storage.rules');
  if (!(await fs.pathExists(storageRulesPath))) {
    await fs.writeFile(storageRulesPath, storageRulesContent, 'utf-8');
    step5_2.succeed('Reglas de almacenamiento (storage.rules) generadas correctamente.');
  } else {
    step5_2.succeed('Reglas de almacenamiento (storage.rules) heredadas de la plantilla.');
  }

  // 5.3 Crear reglas de Firestore firestore.rules por defecto
  const step5_3 = ora('Generar reglas de Firestore firestore.rules').start();
  const firestoreRulesContent = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}\n`;
  const firestoreRulesPath = path.join(targetDir, 'firestore.rules');
  if (!(await fs.pathExists(firestoreRulesPath))) {
    await fs.writeFile(firestoreRulesPath, firestoreRulesContent, 'utf-8');
    step5_3.succeed('Reglas de base de datos (firestore.rules) generadas correctamente.');
  } else {
    step5_3.succeed('Reglas de base de datos (firestore.rules) heredadas de la plantilla.');
  }

  // 5.5 Crear archivo src/config/niche.json con especificaciones del nicho
  const stepNiche = ora('Generar metadatos de nicho (niche.json)').start();
  const configDir = path.join(targetDir, 'src', 'config');
  await fs.ensureDir(configDir);
  
  let nicheData = {
    niche: answers.niche || 'general_custom',
    projectName: answers.projectName,
    theme: themeName,
    primaryColor,
    attributes: [],
    features: {
      showSizes: answers.flags?.showSizes ?? (answers.niche === 'retail_clothing'),
      showColors: answers.flags?.showColors ?? (answers.niche === 'retail_clothing'),
      enableKitchen: answers.flags?.enableKitchen ?? false,
      enableDelivery: answers.flags?.enableDelivery ?? false,
      enableCredits: answers.flags?.enableCredits ?? false
    }
  };

  if (answers.niche === 'retail_clothing') {
    nicheData.attributes = [
      { name: 'talla', label: 'Talla', type: 'select', options: ['S', 'M', 'L', 'XL', '38', '39', '40', '41', '42'] },
      { name: 'color', label: 'Color', type: 'text', placeholder: 'Ej. Negro, Blanco, Azul' }
    ];
  } else if (answers.niche === 'grocery_food') {
    nicheData.attributes = [
      { name: 'presentacion', label: 'Presentación', type: 'select', options: ['Libra', 'Kilo', 'Atado', 'Unidad'] }
    ];
  } else if (answers.niche === 'technical_services') {
    nicheData.attributes = [
      { name: 'material', label: 'Material', type: 'text', placeholder: 'Ej. Bronce SAE 64' },
      { name: 'especificaciones', label: 'Especificación Técnica', type: 'text', placeholder: 'Ej. Rosca NPT 1/2' }
    ];
  } else if (answers.niche === 'refrigeration_ac') {
    nicheData.attributes = [
      { name: 'marca_equipo', label: 'Marca del Equipo', type: 'text', placeholder: 'Ej. LG, Carrier' },
      { name: 'tipo_refrigerante', label: 'Tipo de Refrigerante', type: 'select', options: ['R-410A', 'R-22', 'R-134a', 'R-404A'] }
    ];
  } else if (answers.niche === 'contractors') {
    nicheData.attributes = [
      { name: 'unidad_medida', label: 'Unidad de Medida', type: 'select', options: ['Metro Lineal (m)', 'Metro Cuadrado (m2)', 'Metro Cúbico (m3)', 'Global (glb)', 'Día Operario'] }
    ];
  } else if (answers.niche === 'machinery_rental') {
    nicheData.attributes = [
      { name: 'numero_serial', label: 'Número Serial / Placa', type: 'text', placeholder: 'Ej. CAT-924G-01' },
      { name: 'tarifa_tiempo', label: 'Modo de Alquiler', type: 'select', options: ['Por Hora', 'Por Día', 'Por Semana', 'Por Mes'] }
    ];
  } else if (answers.niche === 'carpentry') {
    nicheData.attributes = [
      { name: 'tipo_madera', label: 'Tipo de Madera', type: 'select', options: ['Pino', 'Cedro', 'Roble', 'Teca', 'MDF / Melamina'] },
      { name: 'acabado', label: 'Acabado', type: 'select', options: ['Poliuretano', 'Laca Catalizada', 'Barniz', 'Aceite / Natural', 'Pintado'] }
    ];
  } else if (answers.niche === 'laundry') {
    nicheData.attributes = [
      { name: 'peso_estimado', label: 'Rango de Peso', type: 'select', options: ['1-5 kg', '6-10 kg', '11-15 kg', 'Más de 15 kg'] },
      { name: 'tipo_prenda', label: 'Tipo de Prenda / Servicio', type: 'text', placeholder: 'Ej. Plumón, Traje, Cortina' }
    ];
  } else if (answers.niche === 'furniture_repair') {
    nicheData.attributes = [
      { name: 'tipo_tela', label: 'Tipo de Tela / Tapizado', type: 'text', placeholder: 'Ej. Microfibra Antirrasguño, Cuero' },
      { name: 'estado_ingreso', label: 'Estado del Mueble', type: 'text', placeholder: 'Ej. Estructura rota / Solo espuma' }
    ];
  } else if (answers.niche === 'wellness_podology') {
    nicheData.attributes = [
      { name: 'duracion', label: 'Duración Estimada', type: 'select', options: ['30 min', '45 min', '1 hora', '1.5 horas', '2 horas'] },
      { name: 'profesional', label: 'Profesional / Especialista', type: 'text', placeholder: 'Ej. Podólogo Principal / Esteticista' }
    ];
  } else if (answers.niche === 'insumos-agricolas') {
    nicheData.attributes = [
      { name: 'marca', label: 'Marca / Fabricante', type: 'text', placeholder: 'Ej. Syngenta, Stihl, Bayer' },
      { name: 'compatibilidad', label: 'Compatibilidad de Repuesto', type: 'text', placeholder: 'Ej. Motor Stihl FS 160 / Universal' }
    ];
  } else if (answers.niche === 'alimentos-artesanales') {
    nicheData.attributes = [
      { name: 'presentacion', label: 'Presentación / Porciones', type: 'select', options: ['Unidad Individual', 'Caja x6', 'Caja x12', 'Media Libra', 'Una Libra'] },
      { name: 'requiere_anticipo', label: 'Anticipación Requerida', type: 'select', options: ['Entrega Inmediata', '24 Horas de Anticipación', '48 Horas de Anticipación'] }
    ];
  } else if (answers.niche === 'ferreteria-rural') {
    nicheData.attributes = [
      { name: 'unidad_medida', label: 'Unidad de Venta', type: 'select', options: ['Unidad', 'Bulto / S Saco', 'Kilo', 'Metro', 'Rollo'] }
    ];
  } else if (answers.niche === 'repuestos-motos') {
    nicheData.attributes = [
      { name: 'marca_moto', label: 'Marca de Moto Compatible', type: 'text', placeholder: 'Ej. Yamaha, Pulsar, Boxer, Suzuki' },
      { name: 'modelo_anio', label: 'Modelo / Año', type: 'text', placeholder: 'Ej. 2018 - 2022' }
    ];
  } else if (answers.niche === 'distribuidoras-beauty') {
    nicheData.attributes = [
      { name: 'tipo_presentacion', label: 'Presentación Profesional', type: 'select', options: ['Unidad Detal', 'Caja/Pack Mayorista', 'Litro / Galón (Granel)'] }
    ];
  } else if (answers.niche === 'petshops-locales') {
    nicheData.attributes = [
      { name: 'peso_concentrado', label: 'Peso del Empaque', type: 'select', options: ['1 kg', '2 kg', '8 kg', '15 kg', '22 kg', 'Suelto / Libra'] },
      { name: 'mascota', label: 'Tipo de Mascota', type: 'select', options: ['Perro Adulto', 'Cachorro', 'Gato Adulto', 'Gatito', 'Otras Mascotas'] }
    ];
  } else if (answers.niche === 'repuestos-lineablanca') {
    nicheData.attributes = [
      { name: 'marca_electrodomestico', label: 'Marca Compatible', type: 'text', placeholder: 'Ej. Whirlpool, Mabe, Haceb, LG' },
      { name: 'modelo_exacto', label: 'Modelo o Número de Parte', type: 'text', placeholder: 'Ej. W1023456 / Lavadora Haceb 13kg' }
    ];
  } else if (answers.niche === 'moda-local-calzado') {
    nicheData.attributes = [
      { name: 'talla', label: 'Talla', type: 'select', options: ['34', '35', '36', '37', '38', '39', '40', '41', '42', 'S', 'M', 'L', 'XL'] },
      { name: 'material', label: 'Material / Composición', type: 'text', placeholder: 'Ej. Cuero 100% natural, Sintético, Lona' }
    ];
  } else if (answers.niche === 'alimentacion-saludable') {
    nicheData.attributes = [
      { name: 'alergenos', label: 'Alérgenos / Restricción', type: 'select', options: ['Libre de Gluten (Gluten Free)', 'Sin Azúcar Añadida', 'Vegano / Plant-Based', 'Keto / Bajo en Carbohidratos', 'Sin Restricción / Natural'] },
      { name: 'presentacion', label: 'Presentación', type: 'text', placeholder: 'Ej. Frasco 250g, Bolsa de 500g, Cápsulas' }
    ];
  } else if (answers.niche === 'home-office-ergonomia') {
    nicheData.attributes = [
      { name: 'ajustable', label: 'Nivel de Ajuste', type: 'select', options: ['Totalmente Ajustable (Ergonómico)', 'Ajuste de Altura Únicamente', 'Fijo / Estático'] }
    ];
  } else if (answers.niche === 'licores-cocteleria') {
    nicheData.attributes = [
      { name: 'volumen_alcohol', label: 'Contenido / Volumen', type: 'select', options: ['Lata 330ml', 'Botella 375ml (Media)', 'Botella 750ml (Estándar)', 'Botella 1000ml (Litro)'] }
    ];
  } else if (answers.niche === 'coleccionismo-geek') {
    nicheData.attributes = [
      { name: 'estado_articulo', label: 'Estado / Edición', type: 'select', options: ['Nuevo en Caja (Mint in Box)', 'Edición Limitada', 'Edición Regular', 'Segunda Mano (Excelente Estado)'] }
    ];
  } else if (answers.niche === 'distribucion-horeca') {
    nicheData.attributes = [
      { name: 'empaque_volumen', label: 'Empaque de Venta', type: 'select', options: ['Paquete x50 Unidades', 'Caja x500 Unidades', 'Galón / Garrafa', 'Bulto Mayorista'] }
    ];
  }


  await fs.writeJson(path.join(configDir, 'niche.json'), nicheData, { spaces: 2 });
  stepNiche.succeed('Metadatos de nicho (niche.json) generados en src/config.');

  // 5.6 Crear archivo .prototipe.json de metadatos del proyecto para control de sincronización
  const stepMeta = ora('Generar metadatos de sincronización del proyecto (.prototipe.json)').start();
  const prototipeMeta = {
    clientId,
    projectName: answers.projectName,
    template: answers.template,
    coreType: answers.coreType || 'seed',
    niche: answers.niche || 'general_custom',
    version: '1.0.0',
    createdAt: new Date().toISOString()
  };
  await fs.writeJson(path.join(targetDir, '.prototipe.json'), prototipeMeta, { spaces: 2 });
  stepMeta.succeed('Metadatos de sincronización (.prototipe.json) generados en la raíz.');

  // 6. (Paso omitido: firebase-messaging-sw.js ya no se usa)

  // 6.1. Configurar manifest.json / site.webmanifest dinámicamente con los colores HSL convertidos a Hex
  const stepManifest = ora('Configurando manifest PWA con colores e identidad de marca').start();
  try {
    const manifestPath = path.join(targetDir, 'public', 'manifest.json');
    const webmanifestPath = path.join(targetDir, 'public', 'site.webmanifest');
    const targetManifest = await fs.pathExists(manifestPath) ? manifestPath : (await fs.pathExists(webmanifestPath) ? webmanifestPath : null);
    
    // Obtener colores Hex de marca en caliente para theme_color y background_color
    const primaryHex = '#' + hslToRgbaHex(primaryColor, 255).toString(16).slice(0, 6);
    const bgHex = '#' + hslToRgbaHex(answers.branding?.bgColor || 'hsl(224, 71%, 4%)', 255).toString(16).slice(0, 6);
    
    if (targetManifest) {
      const manifest = await fs.readJson(targetManifest);
      manifest.name = answers.projectName;
      manifest.short_name = initials;
      manifest.theme_color = primaryHex;
      manifest.background_color = bgHex;
      
      await fs.writeJson(targetManifest, manifest, { spaces: 2 });
      stepManifest.succeed(`Manifest PWA (${path.basename(targetManifest)}) actualizado con colores e identidad de marca.`);
    } else {
      // Si no existe, crear uno básico
      const basicManifest = {
        name: answers.projectName,
        short_name: initials,
        start_url: "/",
        display: "standalone",
        background_color: bgHex,
        theme_color: primaryHex,
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      };
      await fs.writeJson(manifestPath, basicManifest, { spaces: 2 });
      stepManifest.succeed('Manifest PWA (manifest.json) creado y configurado con éxito.');
    }
  } catch (manifestErr) {
    stepManifest.warn(`Aviso al configurar manifest PWA: ${manifestErr.message}`);
  }

  // 6.2. Reemplazar dinámicamente etiquetas SEO, título y descripción en index.html
  const indexPath = path.join(targetDir, 'index.html');
  if (await fs.pathExists(indexPath)) {
    let indexContent = await fs.readFile(indexPath, 'utf-8');
    
    const seoTitle = answers.seoTitle || answers.projectName || 'Prototipe App';
    const seoDescription = answers.seoDescription || `${seoTitle} - Plataforma a la medida para la gestión de ventas, inventario y servicios.`;
    const seoKeywords = answers.seoKeywords || `${seoTitle}, ventas, inventario, facturación, ecosistema, control`;
    
    // Reemplazar <title>
    if (indexContent.includes('<title>')) {
      indexContent = indexContent.replace(/<title>[^<]*<\/title>/, `<title>${seoTitle}</title>`);
    } else {
      indexContent = indexContent.replace('</head>', `    <title>${seoTitle}</title>\n  </head>`);
    }

    // Limpiar metatags SEO viejos si existen en el template (tolerancia HTML5)
    indexContent = indexContent.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, '');
    indexContent = indexContent.replace(/<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/gi, '');
    indexContent = indexContent.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/gi, '');
    indexContent = indexContent.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/gi, '');
    indexContent = indexContent.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/gi, '');
    indexContent = indexContent.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/gi, '');
    
    // Actualizar apple-mobile-web-app-title
    indexContent = indexContent.replace(/<meta\s+name="apple-mobile-web-app-title"\s+content="[^"]*"\s*\/?>/gi, `<meta name="apple-mobile-web-app-title" content="${seoTitle}" />`);

    const metaTags = `
    <meta name="description" content="${seoDescription}" />
    <meta name="keywords" content="${seoKeywords}" />
    <meta property="og:title" content="${seoTitle}" />
    <meta property="og:description" content="${seoDescription}" />
    <meta name="twitter:title" content="${seoTitle}" />
    <meta name="twitter:description" content="${seoDescription}" />`;

    // Insertar nuevos metatags antes de </head>
    indexContent = indexContent.replace('</head>', `${metaTags}\n  </head>`);
    
    await fs.writeFile(indexPath, indexContent, 'utf-8');
    console.log(pc.green('✅ Metatags SEO, título y descripción inyectados en index.html.'));
  }

  // 6.3. Generar SVG logo y favicon si no se suministra uno
  console.log(pc.cyan('🎨 Configurando logo y favicon de la marca...'));
  const publicFaviconPath = path.join(targetDir, 'public', 'favicon.svg');
  const assetsLogoPath = path.join(targetDir, 'src', 'assets', 'logo.svg');
  
  // Extraer iniciales (ya declaradas al inicio de la función)

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="24" fill="${primaryColor}"/>
  <text x="50" y="55" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="42" fill="#ffffff">${initials}</text>
</svg>`;

  const stepLogo = ora('Configurando logo y favicon de la marca...').start();
  let userProvidedLogo = false;
  if (answers.logoPath && await fs.pathExists(answers.logoPath)) {
    try {
      const ext = path.extname(answers.logoPath).toLowerCase();
      const validExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.webp'];
      
      if (validExtensions.includes(ext)) {
        await fs.ensureDir(path.dirname(assetsLogoPath));
        // Copiar logo a su ruta de assets con su extensión correspondiente
        const targetLogoPath = path.join(targetDir, 'src', 'assets', `logo${ext}`);
        await fs.copy(answers.logoPath, targetLogoPath, { overwrite: true });

        // Si es SVG, se usa de favicon. Si no es SVG, copiamos de todos modos como fallback pero mantenemos el favicon SVG autogenerado
        if (ext === '.svg') {
          await fs.copy(answers.logoPath, publicFaviconPath, { overwrite: true });
        } else {
          // Generar favicon a partir de iniciales como fallback
          await fs.ensureDir(path.dirname(publicFaviconPath));
          await fs.writeFile(publicFaviconPath, svgContent, 'utf-8');

          // Generar favicon e iconos PWA rasterizados usando Jimp
          const stepPwaIcons = ora('Generando iconos PWA (Jimp)...').start();
          try {
            const logoSrc = answers.logoPath;
            const bgHex = hslToRgbaHex(answers.branding?.bgColor || 'hsl(224, 71%, 4%)', 255);
            
            const createIcon = async (size, usePadding = false) => {
              const original = await Jimp.read(logoSrc);
              const w = original.width;
              const h = original.height;
              
              if (usePadding) {
                const maxDim = Math.round(size * 0.8);
                const ratio = Math.min(maxDim / w, maxDim / h);
                const newW = Math.round(w * ratio);
                const newH = Math.round(h * ratio);
                original.resize({ w: newW, h: newH });
                
                const canvas = new Jimp({ width: size, height: size, color: bgHex });
                const x = Math.round((size - newW) / 2);
                const y = Math.round((size - newH) / 2);
                canvas.composite(original, x, y);
                return canvas;
              } else {
                const ratio = Math.min(size / w, size / h);
                const newW = Math.round(w * ratio);
                const newH = Math.round(h * ratio);
                original.resize({ w: newW, h: newH });
                return original;
              }
            };

            const pwa192 = await createIcon(192, false);
            await pwa192.write(path.join(targetDir, 'public', 'pwa-192x192.png'));
            
            const appleIcon = await createIcon(192, true);
            await appleIcon.write(path.join(targetDir, 'public', 'apple-touch-icon.png'));

            const pwa512 = await createIcon(512, false);
            await pwa512.write(path.join(targetDir, 'public', 'pwa-512x512.png'));

            stepPwaIcons.succeed('Iconos PWA (192x192, 512x512, apple-touch-icon) redimensionados y generados con éxito.');
          } catch (jimpErr) {
            stepPwaIcons.fail(`Error al redimensionar iconos con Jimp: ${jimpErr.message}`);
          }
        }

        stepLogo.succeed(`Logo personalizado (${ext}) copiado desde: ${answers.logoPath}`);
        userProvidedLogo = true;
      } else {
        stepLogo.warn(`El logo suministrado no tiene una extensión compatible. Extensiones válidas: SVG, PNG, JPG, JPEG, WEBP.`);
      }
    } catch (err) {
      stepLogo.fail(`Error al copiar el logo suministrado: ${err.message}`);
    }
  }

  if (!userProvidedLogo) {
    await fs.ensureDir(path.dirname(publicFaviconPath));
    await fs.writeFile(publicFaviconPath, svgContent, 'utf-8');
    
    await fs.ensureDir(path.dirname(assetsLogoPath));
    await fs.writeFile(assetsLogoPath, svgContent, 'utf-8');
    stepLogo.succeed(`Logo y favicon de iniciales ("${initials}") autogenerados usando el color primario.`);
  }


  // 7. Inyectar carpeta /scratch/ y generar primer mapa de IA
  const stepScratch = ora('Inyectar scripts de automatización en /scratch/').start();
  const scratchDir = path.join(targetDir, 'scratch');
  await fs.ensureDir(scratchDir);

  const mapScriptContent = `import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const outputFile = path.join(projectRoot, 'mapa_arquitectura_ia.md');

function scanDirectory(dir, depth = 0) {
  let markdown = '';
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    if (['node_modules', '.git', 'dist', '.firebase', '.temp', 'tmp'].includes(file)) return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    const indent = '  '.repeat(depth);
    
    if (stat.isDirectory()) {
      markdown += \`\${indent}- 📁 **\${file}**/\\n\`;
      markdown += scanDirectory(fullPath, depth + 1);
    } else {
      markdown += \`\${indent}- 📄 [\${file}](file:///\${fullPath.replace(/\\\\/g, '/')})\\n\`;
    }
  });
  return markdown;
}

const map = \`# 🗺️ Mapa de Arquitectura Física del Código\\n\\nEste mapa se autogenera para orientar a la IA sobre la estructura de archivos.\\n\\n\${scanDirectory(projectRoot)}\`;
fs.writeFileSync(outputFile, map, 'utf-8');
console.log('✅ Mapa de arquitectura para la IA generado.');
`;

  await fs.writeFile(path.join(scratchDir, 'generate_ia_map.js'), mapScriptContent, 'utf-8');

  // Ejecutar de forma síncrona el mapa de IA inicial
  try {
    execSync('node scratch/generate_ia_map.js', { cwd: targetDir, stdio: 'ignore' });
  } catch (mapErr) {
    console.warn(`[Auto-Map] No se pudo autogenerar el mapa de IA inicial: ${mapErr.message}`);
  }

  // 7.1. Configurar package.json con el nombre del proyecto de marca blanca
  const stepPkg = ora('Configurando package.json con la marca del cliente').start();
  try {
    const targetPkgPath = path.join(targetDir, 'package.json');
    if (await fs.pathExists(targetPkgPath)) {
      const pkg = await fs.readJson(targetPkgPath);
      pkg.name = `app-${clientId}`;
      await fs.writeJson(targetPkgPath, pkg, { spaces: 2 });
      stepPkg.succeed(`package.json actualizado con la marca blanca: app-${clientId}`);
    } else {
      stepPkg.info('No se encontró package.json en la plantilla para personalizar el nombre.');
    }
  } catch (err) {
    stepPkg.warn(`Aviso al configurar package.json: ${err.message}`);
  }

  // 7.2. Configurar dinámicamente Playwright E2E si existe en la plantilla
  const stepE2E = ora('Configurando suite de pruebas Playwright E2E').start();
  try {
    const targetPkgPath = path.join(targetDir, 'package.json');
    const playwrightConfigPath = path.join(targetDir, 'playwright.config.js');
    if (await fs.pathExists(playwrightConfigPath)) {
      // 1. Configurar package.json agregando scripts E2E si no existen
      const pkg = await fs.readJson(targetPkgPath);
      pkg.scripts = pkg.scripts || {};
      pkg.scripts['test:ci'] = 'playwright test';
      pkg.scripts['test:ui'] = 'playwright test --ui';
      pkg.scripts['test:ui:show'] = 'playwright show-report';
      
      // Asegurar dependencias de testing
      pkg.devDependencies = pkg.devDependencies || {};
      if (!pkg.devDependencies['@playwright/test']) {
        pkg.devDependencies['@playwright/test'] = '^1.49.0';
      }
      await fs.writeJson(targetPkgPath, pkg, { spaces: 2 });

      // 2. Renombrar y adaptar tests/config/app-ventas.config.js a tests/config/[clientId].config.js
      const oldConfigPath = path.join(targetDir, 'tests', 'config', 'app-ventas.config.js');
      const newConfigPath = path.join(targetDir, 'tests', 'config', `${clientId}.config.js`);
      if (await fs.pathExists(oldConfigPath)) {
        let configContent = await fs.readFile(oldConfigPath, 'utf-8');
        
        // Reemplazar nombre, baseURL
        configContent = configContent.replace(/name:\s*['"`].*?['"`]/, `name: '${answers.projectName}'`);
        configContent = configContent.replace(/baseURL:\s*['"`].*?['"`]/, `baseURL: 'http://localhost:5173'`); // O puerto de Vite
        
        await fs.writeFile(newConfigPath, configContent, 'utf-8');
        await fs.remove(oldConfigPath);

        // 3. Modificar tests/checkout.spec.js para importar el archivo config correcto del cliente
        const specPath = path.join(targetDir, 'tests', 'checkout.spec.js');
        if (await fs.pathExists(specPath)) {
          let specContent = await fs.readFile(specPath, 'utf-8');
          specContent = specContent.replace(
            /import\s+\{\s*APP_CONFIG\s*\}\s+from\s+['"`]\.\/config\/app-ventas\.config\.js['"`]/,
            `import { APP_CONFIG } from './config/${clientId}.config.js'`
          );
          await fs.writeFile(specPath, specContent, 'utf-8');
        }
      }
      stepE2E.succeed('Suite de pruebas Playwright E2E configurada con éxito.');
    } else {
      stepE2E.info('Esta plantilla no incluye soporte Playwright E2E.');
    }
  } catch (err) {
    stepE2E.fail(`Error al configurar Playwright E2E: ${err.message}`);
  }

  stepScratch.succeed('Scripts de mapeo de arquitectura inyectados en /scratch/ y package.json.');

  // 7.5. Garantizar la existencia de GEMINI.md en la raíz del proyecto nuevo
  const stepGemini = ora('Aprovisionar archivo de reglas GEMINI.md').start();
  const backupGeminiPath = path.join(getWorkspaceRoot(), 'Documentacion PROTOTIPE', '04_Estandares_y_Skills', 'Copia_Seguridad_Reglas_y_Skills', 'GEMINI.md');
  const targetGeminiPath = path.join(targetDir, 'GEMINI.md');
  try {
    if (await fs.pathExists(backupGeminiPath)) {
      await fs.copy(backupGeminiPath, targetGeminiPath);
      
      // Adaptar las rutas absolutas del GEMINI.md del cliente para que sean locales
      let geminiContent = await fs.readFile(targetGeminiPath, 'utf-8');
      
      // Reemplazo robusto e insensible a mayúsculas/minúsculas y tipo de barra (\ o /)
      const absoluteDocsRegex = /[A-Z]:[\\/][^"'\n]*?Documentacion\s+PROTOTIPE/gi;
      geminiContent = geminiContent.replace(new RegExp(absoluteDocsRegex.source + '[\\\\/]02_Tareas_Roadmap[\\\\/]tareas_pendientes\\.md', 'gi'), './tareas_pendientes.md');
      geminiContent = geminiContent.replace(new RegExp(absoluteDocsRegex.source + '[\\\\/]03_Auditorias_y_Faro_Core[\\\\/]bitacora_cambios\\.md', 'gi'), './bitacora_cambios.md');
      geminiContent = geminiContent.replace(new RegExp(absoluteDocsRegex.source + '[\\\\/]04_Estandares_y_Skills[\\\\/]mapa_aplicacion\\.md', 'gi'), './mapa_arquitectura_ia.md');

      await fs.writeFile(targetGeminiPath, geminiContent, 'utf-8');
      stepGemini.succeed('Archivo GEMINI.md inyectado y adaptado localmente de forma robusta.');
    } else {
      stepGemini.warn('No se encontró GEMINI.md en el backup global. Se conservará la del template.');
    }
  } catch (err) {
    stepGemini.fail(`Aviso al copiar y adaptar GEMINI.md: ${err.message}`);
  }

  // 8. Crear archivo de Onboarding para Antigravity en la raíz
  const flagsList = Object.entries(answers.flags || {})
    .map(([key, val]) => `  - **${key}**: ${val ? '🟢 Habilitado' : '🔴 Deshabilitado'}`)
    .join('\n');

  const isSeed = answers.template === 'template-core-seed';

  const promptContent = `# 🚀 Prompt de Arranque para Google Antigravity (Proyecto: ${answers.projectName})

Copia y pega todo el contenido de este bloque en tu primer mensaje del chat de Antigravity en este proyecto:

---

Hola. Vamos a trabajar sobre este nuevo proyecto: **${answers.projectName}** (${clientId}). 
La carpeta física está creada en la ruta: \`${targetDir}\`

Por favor, lee e indiza obligatoriamente los siguientes archivos y carpetas de navegación e instrucciones antes de proponer tu plan de implementación. Son tu GPS de arquitectura y estándares:
1. **Mapa de Código de este Proyecto** → [mapa_arquitectura_ia.md](file:///${targetDir.replace(/\\/g, '/')}/mapa_arquitectura_ia.md): contiene la estructura física de todos los archivos y carpetas locales.
2. **Mapa de Documentación Global** → [mapa_documentacion_ia.md](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md): índice de navegación semántica de toda la documentación central.
3. **Instrucciones del Proyecto** → [GEMINI.md](file:///${targetDir.replace(/\\/g, '/')}/GEMINI.md): reglas de comportamiento, estándares del stack y disparadores locales.
4. **Documentación Obligatoria del Proyecto (Carpeta Local):**
   - 🏢 **[contexto_negocio.md](file:///${targetDir.replace(/\\/g, '/')}/Documentacion%20${encodeURIComponent(answers.projectName)}/contexto_negocio.md)**: Lee esto PRIMERO — define quién es el cliente, sus reglas de negocio y KPIs. Determina si el código que generas tiene sentido operativo.
   - 🚫 **[restricciones_tecnicas.md](file:///${targetDir.replace(/\\/g, '/')}/Documentacion%20${encodeURIComponent(answers.projectName)}/restricciones_tecnicas.md)**: Dependencias fijadas, patrones prohibidos y limitaciones conocidas de esta instancia. Consulta antes de instalar librerías o cambiar arquitectura.
   - 🎨 **[guia_estilos_ui.md](file:///${targetDir.replace(/\\/g, '/')}/Documentacion%20${encodeURIComponent(answers.projectName)}/guia_estilos_ui.md)**: Paleta HSL, tokens de diseño y convenciones de componentes. Obligatorio antes de tocar cualquier estilo.
   - 🗄️ **[esquema_colecciones.md](file:///${targetDir.replace(/\\/g, '/')}/Documentacion%20${encodeURIComponent(answers.projectName)}/esquema_colecciones.md)**: Modelo de datos Firestore de esta instancia.
5. **Directorios Clave de Estándares y Componentes (Auditoría Obligatoria):**
   - 📂 **[04_Estandares_y_Skills](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/)**: Lee \`inicializacion_nuevos_proyectos.md\` y \`Firebase_Listeners_Clean.md\` para entender el blindaje de base de datos y la PWA.
   - 📂 **[06_Biblioteca_Componentes](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/)**: Consulta el catálogo de componentes listos para portar y reutilizar sin reescribir código.
   - 📂 **[07_Manuales_Desarrollo](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/)**: Contiene la especificación de Sharding Multitenant y manuales de arquitectura.
   - 📂 **[09_Modulos_Completos](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/09_Modulos_Completos/)**: Consulta el catálogo de módulos completos (Features) listos para portar.
   - 📂 **[03_Auditorias_y_Faro_Core](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/)**: Revisa \`bitacora_cambios.md\` para entender el historial de desarrollo y parches.

### 📋 Contexto del Cliente (Briefing)
- **Nombre**: ${answers.projectName}
- **Client ID**: ${clientId}
- **Core al que pertenece**: ${answers.coreType || 'seed'}
- **Modo de Facturación de la Instancia**: ${answers.billingMode || 'percentage'}
- **Tasa de Comisión / Costo**: 
  - Porcentaje: ${answers.comisionPorcentaje ?? 1.5}%
  - Pago Mensual Fijo: $${answers.pagoMensualFijo ?? 0} COP
- **Facturación Electrónica (DIAN)**: ${answers.enableDianBilling ? '🟢 Activa' : '🔴 Inactiva'} (Costo por factura: $${answers.costoPorFacturaDian ?? 0} COP)
- **Token de Telemetría**: ${uniqueToken}
- **Colores de Marca**: Tema HSL ${themeName}
  - Primario: \`${primaryColor}\`
  - Secundario: \`${answers.branding?.secondaryColor || ''}\`
  - Fondo: \`${answers.branding?.bgColor || ''}\`
  - Texto: \`${answers.branding?.textColor || ''}\`
  - Tipografía (Google Font): \`${answers.branding?.googleFont || 'Inter'}\`

### ⚙️ Módulos y Capacidades Tecnológicas Seleccionadas:
${flagsList}

### 📝 Requerimientos Especiales del Cliente:
${answers.customRequirements || '*(Ninguno especificado)*'}

### 📦 Componentes y Módulos Recomendados de la Biblioteca (Preferentes):
${Array.isArray(answers.selectedRecomendations) && answers.selectedRecomendations.length > 0 
  ? answers.selectedRecomendations.map(r => `  - **${r.name}** [${r.technicalName || 'Helper/Servicio'}] (Ficha técnica y código listo en: [Ver Documentación](file:///${r.link.replace(/\\/g, '/')}))`).join('\n')
  : '  *(Ninguno sugerido preferentemente; utiliza libremente la biblioteca global)*'}

> [!NOTE]
> **Autonomía Creativa de la IA:** Las recomendaciones anteriores son sugerencias preferentes de reutilización. Si para cumplir con el briefing del negocio requieres interfaces, hooks o bases de datos ausentes en la biblioteca, tienes total autonomía de diseñarlas y programarlas desde cero, garantizando el stack de calidad de la plataforma.

---

${isSeed ? `### ⚠️ ATENCIÓN: ESTE PROYECTO SE INICIALIZA DESDE UN LIENZO LIMPIO (Core Seed)
Este proyecto no ha sido copiado de una plantilla vertical. Contiene únicamente el cascarón de infraestructura de Prototipe:
- Configuración de Firebase y PWA.
- Sincronización síncrona/asíncrona de Temas HSL y Modo Oscuro en index.html y App.jsx.
- Módulos contables de facturación/billing de comisiones locales y telemetría de cobros en tiempo real conectada a la Consola Central (Spark/Blaze).
- Stores base de Zustand y hooks de inicialización de Auth.
- Un enrutador de React Router vacío (AppRoutes.jsx) y un componente loader (AppLoader.jsx).

Queda bajo tu total responsabilidad el desarrollo de las pantallas, la base de datos de negocio y la navegación desde cero, adaptadas a los requerimientos específicos de este cliente.` : ''}

### 🛡️ DIRECTIVAS DE ROBUSTEZ Y CALIDAD (OBLIGATORIO)

Para asegurar que esta aplicación cumpla con los estándares premium del ecosistema de instancias y evitar código basura o inestable, debes seguir estrictamente estas reglas desde tu primer cambio:

1. **Aislamiento de Sharding (Portabilidad):**
   - Queda estrictamente prohibido hardcodear IDs de proyectos Firebase o credenciales. Consume todo dinámicamente desde el entorno local (\`.env.local\`).
2. **Robustez en Escuchas Firebase (Listeners Seguros):**
   - No te suscribas a oyentes en tiempo real (\`onSnapshot\`) de colecciones privadas/restringidas sin validar que el usuario de Firebase Auth esté inicializado y logueado.
   - Todo listener debe retornar su función de limpieza (\`cleanup\`) al desmontar.
3. **Consistencia Cromática y Tailwind v4:**
   - Adapta el archivo \`src/index.css\` aplicando la paleta de colores de marca bajo el bloque \`@theme\` de Tailwind CSS v4.
   - Evita el uso de bordes negros o colores crudos; utiliza contornos discretos (\`border-app\` o escalas HSL bajas) y acabados con glassmorphism.
4. **Seguridad y Transacciones:**
   - Toda deducción o adición de stock en base de datos debe ejecutarse mediante transacciones atómicas (\`runTransaction\`) para prevenir condiciones de carrera.
   - La visualización pública de datos sensibles o seguimiento de pedidos debe estar protegida bajo URLs parametrizadas por tokens UUID seguros.
5: **Reutilización e Integración de Estándares (Auditoría de Documentación):**
   - Antes de escribir cualquier línea de lógica, audita obligatoriamente:
     - El catálogo en [Biblioteca de Componentes](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/) para verificar si ya existe un componente que resuelva la interfaz.
     - La carpeta de [Módulos Completos](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/09_Modulos_Completos/) para portar módulos de negocio complejos (Features) ya estructurados.
     - La carpeta [04_Estandares_y_Skills](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/) para seguir las guías de inicialización y listeners sin romper las reglas de Firebase.
     - El [Informe de Investigación del Ecosistema 2026](file:///${getWorkspaceRoot().replace(/\\\\/g, '/').replace(/\\/g, '/')}/Documentacion%20PROTOTIPE/09_Plan_Escalabilidad_Negocio/informe_investigacion_ecosistema_2026.md) para emplear librerías Open Source aprobadas en lugar de codificar soluciones personalizadas desde cero.
${isSeed ? `6. **Desarrollo Modular (Component-First) - OBLIGATORIO:**
   - Para este proyecto limpio, debes construir la interfaz de forma estrictamente modular y componentizada.
   - Cada componente o pantalla debe vivir en su propio archivo exclusivo bajo \`src/components/\` o \`src/pages/\`. Queda prohibido agrupar múltiples elementos de lógica compleja en un solo archivo plano.
   - Extrae la lógica pesada a hooks personalizados en \`src/hooks/\` o a stores en \`src/store/\`, dejando los componentes puramente visuales y fáciles de mantener.` : `6. **Mantener estructura modular:**
   - Queda prohibido mezclar lógica de múltiples vistas en archivos monolíticos. Cada componente nuevo debe colocarse en su propio archivo descriptivo en la ruta correspondiente.`}
7. **Compilación de Integridad y Bitácora Obligatoria:**
   - **Antes de dar por completada cualquier tarea o hito, debes ejecutar localmente \`npm run build\`** en la consola del proyecto. Esta comprobación garantiza que no se introduzcan errores sintácticos o fallos de compilación.
   - Registra de forma obligatoria los cambios técnicos en \`bitacora_cambios.md\` y actualiza la lista de tareas en \`tareas_pendientes.md\` en el mismo paso que realizas los cambios de código.
8. **Despliegues controlados:**
   - NUNCA realices despliegues a producción o hosting de forma automática; solicita aprobación.
9. **Lectura de navegación:**
   - Usa las rutas de los mapas de navegación directamente para leer y editando archivos. Evita búsquedas ciegas (\`grep\` o \`list_dir\`).

Comencemos presentándote e indexando los archivos. ¿Estás listo?
`;
  await fs.writeFile(path.join(targetDir, 'antigravity_bootstrap_prompt.md'), promptContent, 'utf-8');
  console.log(pc.green('✅ Archivo antigravity_bootstrap_prompt.md creado con éxito en la raíz del proyecto.'));


  // 9. Ejecutar npm install y primera indexación
  await installDependencies(targetDir);

  // 10. Git e integración con GitHub
  await setupGitHub(answers, targetDir, clientId);

  // 11. Despliegue en Firebase del Cliente
  await deployFirebase(answers, targetDir);

  // 12. Auto-registro en la Consola Central (Developer Cockpit)
  await registerInCentralConsole(answers, clientId, uniqueToken);

  const vapidPublicKey = answers.firebaseVapidKey || answers.vapidPublicKey || '';

  return {
    clientId,
    uniqueToken,
    targetDir,
    themeName,
    primaryColor,
    vapidPublicKey,
    prompt: promptContent
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIONES PRIVADAS DE APROVISIONAMIENTO (no exportadas)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Paso 9: Instala dependencias npm y genera el mapa de arquitectura inicial.
 * @param {string} targetDir Ruta absoluta del proyecto generado
 */
async function installDependencies(targetDir) {
  console.log('\n' + pc.cyan('📦 Instalando dependencias en el nuevo proyecto. Por favor espera...'));
  try {
    execSync('npm install', { cwd: targetDir, stdio: 'inherit', shell: true });
    console.log(pc.green('✅ Dependencias de npm instaladas.'));

    console.log(pc.cyan('🔍 Generando mapa de arquitectura inicial...'));
    execSync('npm run map', { cwd: targetDir, stdio: 'inherit', shell: true });
    console.log(pc.green('✅ Mapa de arquitectura del nuevo proyecto indexado con éxito.'));
  } catch (err) {
    console.warn(pc.yellow(`⚠️  Aviso en instalación/mapeo de dependencias: ${err.message}`));
  }
}

/**
 * Paso 10: Inicializa Git e integra con GitHub si está habilitado.
 * @param {Object} answers Payload de aprovisionamiento
 * @param {string} targetDir Ruta absoluta del proyecto generado
 * @param {string} clientId ID normalizado del cliente
 */
async function setupGitHub(answers, targetDir, clientId) {
  if (!answers.enableGithub) return;

  console.log(pc.cyan('🐙 Inicializando repositorio Git y subiendo a GitHub...'));
  try {
    execSync('git init', { cwd: targetDir, stdio: 'ignore' });

    // Inyectar el Git Hook de validación de reglas
    const hookSource = path.join(process.cwd(), 'hooks', 'pre-commit');
    const hookDestDir = path.join(targetDir, '.git', 'hooks');
    const hookDestPath = path.join(hookDestDir, 'pre-commit');

    if (await fs.pathExists(hookSource)) {
      await fs.ensureDir(hookDestDir);
      await fs.copy(hookSource, hookDestPath);
      try {
        execSync(`chmod +x "${hookDestPath}"`, { stdio: 'ignore' });
      } catch (_) {}
      console.log(pc.gray('   - Git Hook de reglas inyectado con éxito.'));
    }

    execSync('git add .', { cwd: targetDir, stdio: 'ignore' });
    execSync('git commit -m "feat: scaffolding inicial del ecosistema"', { cwd: targetDir, stdio: 'ignore' });

    const repoName = `app-${clientId}`;
    execSync(`gh repo create ${repoName} --private --source=. --push`, { cwd: targetDir, stdio: 'ignore' });
    console.log(pc.green(`✅ Repositorio GitHub creado y subido con éxito: ${repoName}`));
  } catch (err) {
    console.warn(pc.yellow(`⚠️  No se pudo subir a GitHub automáticamente: ${err.message}. Asegúrate de tener gh CLI logueado.`));
  }
}

/**
 * Paso 11: Despliega reglas e índices en Firebase y siembra datos iniciales.
 * @param {Object} answers Payload de aprovisionamiento
 * @param {string} targetDir Ruta absoluta del proyecto generado
 */
async function deployFirebase(answers, targetDir) {
  if (!answers.enableFirebaseDeploy) return;

  console.log(pc.cyan('🔥 Compilando el proyecto (npm run build)...'));
  try {
    execSync('npm run build', { cwd: targetDir, stdio: 'ignore' });
    console.log(pc.green('✅ Compilación de producción generada con éxito.'));

    console.log(pc.cyan('🔥 Desplegando en Firebase (reglas, índices, storage y hosting)...'));
    execSync(
      `firebase deploy --only firestore:rules,firestore:indexes,storage,hosting -P ${answers.firebaseProjectId}`,
      { cwd: targetDir, stdio: 'ignore' }
    );
    console.log(pc.green('✅ Proyecto de Firebase (Reglas, Índices, Storage y Hosting) desplegado por completo de forma exitosa.'));

  } catch (err) {
    console.warn(pc.yellow(`⚠️  Fallo al desplegar en Firebase: ${err.message}. Asegúrate de tener firebase-cli logueado.`));
  }
}

/**
 * Paso 12: Auto-registra la instancia y el token de telemetría en la Consola Central.
 * @param {Object} answers Payload de aprovisionamiento
 * @param {string} clientId ID normalizado del cliente
 * @param {string} uniqueToken Token único de telemetría ya generado
 */
async function registerInCentralConsole(answers, clientId, uniqueToken) {
  const activeCentralApiKey = answers.centralApiKey || process.env.VITE_DEVELOPER_CENTRAL_API_KEY;
  if (!activeCentralApiKey) return;

  console.log(pc.cyan('📡 Auto-registrando la nueva instancia en la Consola Central...'));
  try {
    const centralUrl = 'https://firestore.googleapis.com/v1/projects/prototipe-ecosistema-control/databases/(default)/documents';

    const formatREST = (data) => {
      const fields = {};
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'string')  fields[k] = { stringValue: v };
        else if (typeof v === 'number')  fields[k] = { doubleValue: v };
        else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
      }
      return { fields };
    };

    await fetch(`${centralUrl}/clientes_control/${clientId}?key=${activeCentralApiKey}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatREST({
        nombre: answers.projectName,
        coreType: answers.coreType || 'seed',
        billingMode: answers.billingMode || 'percentage',
        comisionPorcentaje: Number(answers.comisionPorcentaje ?? 1.5),
        pagoMensualFijo: Number(answers.pagoMensualFijo ?? 0),
        active: true,
        createdAt: new Date().toISOString()
      }))
    });

    await fetch(`${centralUrl}/tokens/${uniqueToken}?key=${activeCentralApiKey}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatREST({
        active: true,
        clientId,
        createdAt: new Date().toISOString()
      }))
    });

    console.log(pc.green('✅ Instancia y Token auto-registrados correctamente en la Consola Central.'));
  } catch (err) {
    console.warn(pc.yellow(`⚠️  No se pudo realizar el auto-registro en la Consola Central: ${err.message}`));
  }
}
