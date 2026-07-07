import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Rutas base
const CLI_ROOT = __dirname
const BASE_APPS_DIR = 'D:/PROTOTIPE/Instancias Clientes'
const PLANTILLAS_CORE_DIR = 'D:/PROTOTIPE/Plantillas Core'
const TEMPLATES_DIR = path.join(CLI_ROOT, 'templates')

/**
 * Imprime el uso del script en consola.
 */
function printUsage() {
  console.log('\n❌ Uso incorrecto del script.')
  console.log('Uso requerido:')
  console.log('  node save_as_core.js <clientId> <templateName> <nicho> <humanName>')
  console.log('\nEjemplo:')
  console.log('  node save_as_core.js moni-app template-torneria retail_clothing "App Torneria"\n')
  process.exit(1)
}

/**
 * Busca de forma recursiva la carpeta física del cliente.
 */
async function locateClientDir(clientId) {
  const lowerId = clientId.toLowerCase()
  if (!await fs.pathExists(BASE_APPS_DIR)) {
    throw new Error(`El directorio base de clientes no existe en: ${BASE_APPS_DIR}`)
  }

  const items = await fs.readdir(BASE_APPS_DIR)
  for (const item of items) {
    const fullPath = path.join(BASE_APPS_DIR, item)
    const stat = await fs.stat(fullPath).catch(() => null)
    if (!stat || !stat.isDirectory()) continue

    // Verificar nivel 1
    const metaPath = path.join(fullPath, '.prototipe.json')
    if (await fs.pathExists(metaPath)) {
      const meta = await fs.readJson(metaPath).catch(() => ({}))
      if (meta.clientId?.toLowerCase() === lowerId || meta.projectName?.toLowerCase() === lowerId || item.toLowerCase() === lowerId) {
        return fullPath
      }
    }

    // Verificar nivel 2 (dentro del nicho)
    const subItems = await fs.readdir(fullPath).catch(() => [])
    for (const subItem of subItems) {
      const subPath = path.join(fullPath, subItem)
      const subStat = await fs.stat(subPath).catch(() => null)
      if (!subStat || !subStat.isDirectory()) continue

      const subMetaPath = path.join(subPath, '.prototipe.json')
      if (await fs.pathExists(subMetaPath)) {
        const subMeta = await fs.readJson(subMetaPath).catch(() => ({}))
        if (subMeta.clientId?.toLowerCase() === lowerId || subMeta.projectName?.toLowerCase() === lowerId || subItem.toLowerCase() === lowerId) {
          return subPath
        }
      }
    }
  }
  return null
}

async function run() {
  const args = process.argv.slice(2)
  if (args.length < 4) {
    printUsage()
  }

  const [clientId, templateName, nicho, humanName] = args
  console.log(`\n🚀 Iniciando exportación de instancia "${clientId}" a plantilla Core "${templateName}"...`)

  try {
    // 1. Localizar directorio del cliente
    const clientDir = await locateClientDir(clientId)
    if (!clientDir) {
      console.error(`❌ Error: No se pudo localizar la carpeta del cliente para: ${clientId}`)
      process.exit(1)
    }
    console.log(`✅ Instancia origen localizada en: ${clientDir}`)

    // Definir rutas destino
    const refCoreDir = path.join(PLANTILLAS_CORE_DIR, humanName)
    const templateCoreDir = path.join(TEMPLATES_DIR, templateName)

    // 2. Copiar instancia al directorio de Plantillas Core (referencia del desarrollador)
    console.log(`📂 Copiando archivos a referencia de desarrollo en: ${refCoreDir}`)
    if (await fs.pathExists(refCoreDir)) {
      await fs.remove(refCoreDir)
    }
    await fs.ensureDir(refCoreDir)
    await fs.copy(clientDir, refCoreDir, {
      filter: (src) => {
        const basename = path.basename(src)
        return basename !== 'node_modules' && basename !== 'dist' && basename !== '.git' && basename !== '.git-backup-temp'
      }
    })

    // 3. Ejecutar Deshidratación en el Core de Referencia
    console.log('🧼 Deshidratando credenciales, marcas y configuraciones específicas...')
    
    // 3.1 Limpiar .env.local
    const envPath = path.join(refCoreDir, '.env.local')
    if (await fs.pathExists(envPath)) {
      const defaultEnv = `VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
VITE_FIREBASE_VAPID_KEY=""
VITE_DEVELOPER_CENTRAL_APP_ID="prototipe-saas-control"
VITE_DEVELOPER_CLIENT_ID=""
VITE_INITIAL_THEME="rosa-elegante"
`
      await fs.writeFile(envPath, defaultEnv, 'utf-8')
    }

    // 3.2 Resetear .firebaserc
    const firebasercPath = path.join(refCoreDir, '.firebaserc')
    if (await fs.pathExists(firebasercPath)) {
      await fs.writeJson(firebasercPath, { projects: { default: "" } }, { spaces: 2 })
    }

    // 3.3 Normalizar .prototipe.json
    const prototipeJsonPath = path.join(refCoreDir, '.prototipe.json')
    if (await fs.pathExists(prototipeJsonPath)) {
      const meta = {
        clientId: "",
        projectName: "",
        coreType: templateName.replace('template-', ''),
        version: "1.0.0",
        updatedAt: new Date().toISOString()
      }
      await fs.writeJson(prototipeJsonPath, meta, { spaces: 2 })
    }

    // 3.4 Modificar package.json
    const pkgPath = path.join(refCoreDir, 'package.json')
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath)
      pkg.name = templateName
      pkg.version = "1.0.0"
      await fs.writeJson(pkgPath, pkg, { spaces: 2 })
    }

    // 3.5 Normalizar estilos de marca en index.css
    const cssPath = path.join(refCoreDir, 'src', 'index.css')
    if (await fs.pathExists(cssPath)) {
      let cssContent = await fs.readFile(cssPath, 'utf-8')
      const startTag = '/* ─── BRANDING_VARS_START (Sanitizados) ─── */'
      const endTag = '/* ─── BRANDING_VARS_END ─── */'

      if (cssContent.includes(startTag) && cssContent.includes(endTag)) {
        const defaultVars = `  /* ─── BRANDING_VARS_START (Sanitizados) ─── */
  --color-primary: #1e293b;
  --color-primary-light: #64748b;
  --color-primary-dark: #0f172a;
  --brand-primary-rgb: 30 41 59;
  --brand-primary-hsl: 215 25% 17%;
  --brand-neon-hsl: 215 25% 60%;
  --color-primary-readable: #1e293b;
  --border-primary-readable: #cbd5e1;
  --color-secondary: #e2e8f0;
  --color-accent: #3b82f6;
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-2: #f1f5f9;
  --color-text: #0f172a;
  --color-text-muted: #475569;
  --color-border: #cbd5e1;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  --font-body: 'Inter', system-ui, sans-serif;
  --radius-base: 0.75rem;
  --color-action: var(--color-primary);
  --shadow-default: var(--shadow-soft);
  --shadow-card: var(--shadow-default);
  --shadow-button: var(--shadow-default);
  --shadow-focus: 0 0 0 3px rgba(30, 41, 59, 0.28);
  --glass-blur: 18px;
  --glass-opacity: 0.08;
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.18);
  --effect-border-beam: 0;
  --effect-tilt-3d: 0;
  --bg-type: solid;
  --bg-mouse-tracking: 0;
  --bg-particles-count: 40;
  --bg-particles-speed: 0.8;
  --bg-particles-size: 2px;
  --bg-particles-color: primary;
  --bg-particles-opacity: 0.35;
  --bg-particles-direction: random;
  --bg-particles-shape: circle;
  --bg-particles-icon: default;
  --bg-orbs-count: 3;
  --bg-orbs-opacity: 0.16;
  --bg-orbs-speed: 1.0;
  --bg-orbs-size: 1.0;
  --bg-orbs-blur: 1.0;
  --brand-niche: ${nicho};
  /* ─── BRANDING_VARS_END ─── */`

        const startIdx = cssContent.indexOf(startTag)
        const endIdx = cssContent.indexOf(endTag) + endTag.length
        cssContent = cssContent.slice(0, startIdx) + defaultVars + cssContent.slice(endIdx)
        await fs.writeFile(cssPath, cssContent, 'utf-8')
      }
    }

    // 3.6 Reemplazar assets específicos del cliente por placeholders genéricos
    const publicDir = path.join(refCoreDir, 'public')
    const seedPublicDir = path.join(CLI_ROOT, 'templates', 'template-core-seed', 'public')
    if (await fs.pathExists(seedPublicDir) && await fs.pathExists(publicDir)) {
      const assetFiles = ['pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png', 'favicon.svg']
      for (const asset of assetFiles) {
        const srcAsset = path.join(seedPublicDir, asset)
        const destAsset = path.join(publicDir, asset)
        if (await fs.pathExists(srcAsset)) {
          await fs.copy(srcAsset, destAsset, { overwrite: true })
        }
      }
    }

    // 4. Clonar el Core de Referencia limpio al directorio de plantillas de la CLI
    console.log(`📦 Guardando la plantilla Core limpia en: ${templateCoreDir}`)
    if (await fs.pathExists(templateCoreDir)) {
      await fs.remove(templateCoreDir)
    }
    await fs.copy(refCoreDir, templateCoreDir)

    // 5. Registrar el nuevo Core en plantillas_registro.json
    console.log('✍️ Registrando la nueva plantilla en el inventario central...')
    const registroPath = path.join(CLI_ROOT, 'plantillas_registro.json')
    if (await fs.pathExists(registroPath)) {
      const registro = await fs.readJson(registroPath)
      const coreKey = templateName.replace('template-', '')
      
      registro.plantillas = registro.plantillas || {}
      registro.plantillas[coreKey] = {
        coreType: coreKey,
        fuente: refCoreDir.replace(/\\/g, '/'),
        destino: templateCoreDir.replace(/\\/g, '/'),
        nicho: nicho,
        activo: true,
        version: "1.0.0"
      }
      await fs.writeJson(registroPath, registro, { spaces: 2 })
      console.log(`🎉 ¡Plantilla "${coreKey}" registrada exitosamente en plantillas_registro.json!`)
    }

    console.log('\n🏁 Proceso finalizado con éxito. El nuevo Core está listo para usarse.')
  } catch (err) {
    console.error(`\n❌ Error durante el proceso: ${err.message}`)
    process.exit(1)
  }
}

run()
