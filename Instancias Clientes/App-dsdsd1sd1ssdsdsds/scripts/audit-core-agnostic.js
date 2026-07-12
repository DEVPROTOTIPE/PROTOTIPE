import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

// Lista de directorios del Core que deben auditarse
const CORE_DIRS = [
  path.join(ROOT_DIR, 'src', 'core'),
  path.join(ROOT_DIR, 'src', 'layouts'),
  path.join(ROOT_DIR, 'src', 'pages'),
  path.join(ROOT_DIR, 'src', 'services'),
  path.join(ROOT_DIR, 'src', 'store'),
  path.join(ROOT_DIR, 'src', 'routes'),
  path.join(ROOT_DIR, 'src', 'hooks'),
  path.join(ROOT_DIR, 'src', 'components', 'ui'),
  path.join(ROOT_DIR, 'src', 'components', 'common'),
]

// Exclusiones de auditoría (por ejemplo, archivos de testing)
const EXCLUDE_FILES = [
  'audit-core-agnostic.js'
]

// Palabras prohibidas en el Core que sugieren acoplamiento comercial de Retail
const PROHIBITED_KEYWORDS = [
  'useCartStore',
  'useFavoritesStore',
  'useGuidedStore',
  'useProductVariants',
  'useWholesale',
  'ProductCardSkeleton',
  'wholesaleSettings',
  'creditsEnabled',
  'couponsEnabled',
  'catalogBanner',
  'catalogLayout',
  'catalogFilters'
]

let totalViolations = 0

function auditFile(filePath) {
  if (EXCLUDE_FILES.includes(path.basename(filePath))) return

  const content = fs.readFileSync(filePath, 'utf8')
  const relativePath = path.relative(ROOT_DIR, filePath)
  const lines = content.split('\n')

  lines.forEach((line, index) => {
    // 1. Validar imports prohibidos hacia features
    if (/from\s+['"].*\/features\//.test(line)) {
      console.error(`❌ [IMPORT VIOLATION] ${relativePath}:${index + 1} -> El Core no debe importar desde features.`)
      console.error(`   Línea: "${line.trim()}"\n`)
      totalViolations++
    }

    // 2. Validar palabras clave prohibidas de comercio
    for (const keyword of PROHIBITED_KEYWORDS) {
      if (line.includes(keyword)) {
        console.error(`❌ [KEYWORD VIOLATION] ${relativePath}:${index + 1} -> Referencia comercial prohibida "${keyword}".`)
        console.error(`   Línea: "${line.trim()}"\n`)
        totalViolations++
      }
    }
  })
}

function traverseDirectory(dir) {
  if (!fs.existsSync(dir)) return

  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      // Evitamos auditar la carpeta features misma desde este script
      if (file !== 'features') {
        traverseDirectory(fullPath)
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      auditFile(fullPath)
    }
  }
}

console.log('🔍 [AUDITORÍA DE AGNOSTICIDAD] Iniciando escaneo de Core contra conceptos comerciales...')

CORE_DIRS.forEach(dir => {
  traverseDirectory(dir)
})

if (totalViolations > 0) {
  console.error(`\n❌ [FALLÓ] Se encontraron ${totalViolations} violaciones de acoplamiento comercial en el Core.`)
  process.exit(1)
} else {
  console.log('\n✅ [ÉXITO] El Core es 100% agnóstico y libre de conceptos de negocio.')
  process.exit(0)
}
