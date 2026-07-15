import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// ─── ARQUITECTURA (CORE-345 / ADR-0001): regla local, sin paquete npm ──────
// Detecta imports del SDK de Firebase. Es una regla NUEVA e independiente
// (no reutiliza no-restricted-imports ni no-restricted-syntax), por lo que
// puede tener severidades distintas (warn/error) en distintos bloques de
// `files` sin colisionar ni degradar ninguna regla ya existente: en el flat
// config de ESLint, dos bloques que coinciden sobre el mismo archivo y
// declaran la MISMA clave de regla se reemplazan entre sí (no se fusionan);
// como esta clave (`prototipe/no-firebase-outside-repository`) no la usa
// ningún otro bloque, ese riesgo no aplica aquí.
const noFirebaseOutsideRepository = {
  meta: { type: 'problem' },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (/^firebase(\/.*)?$/.test(node.source.value)) {
          context.report({
            node,
            message:
              'Esta capa no puede importar el SDK de Firebase (ADR-0001). Solo el Repository (api/) puede tocar Firebase; mueve la lectura/escritura/transacción/suscripción allí.',
          })
        }
      },
    }
  },
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // ─── ARQUITECTURA: Imports Públicos de Features ───────────────────────
      // Prohibir imports profundos que salten el index público de cada feature.
      // Correcto: import { X } from '@/features/products'
      // Incorrecto: import X from '@/features/products/components/ProductCard'
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['*/features/*/*', '!*/features/*/index'],
              message:
                'Importa features solo desde su index público (src/features/[name]/index.js). No uses imports profundos.',
            },
          ],
        },
      ],

      // ─── ARQUITECTURA: Restricciones de Sintaxis JSX ─────────────────────
      'no-restricted-syntax': [
        'error',
        // 1. Prohibir <select> nativo — usar CustomSelect.jsx del design system
        {
          selector: "JSXOpeningElement[name.name='select']",
          message:
            'No usar <select> nativo. Usar el componente CustomSelect del design system (src/components/ui/CustomSelect.jsx).',
        },
        // 2. Prohibir className con template literals dinámicos
        {
          selector: "JSXAttribute[name.name='className'] TemplateLiteral:has(TemplateElement[value.cooked=/-\\$/])",
          message:
            'No construir clases Tailwind con template literals dinámicos (ej: `bg-${color}-500`). Tailwind no puede empaquetar clases interpoladas. Usa un objeto de mapeo estático o clases completas preconstruidas.',
        },
      ],
    },
  },
  {
    // Restricciones de Firebase CRUD aplicadas a vistas/hooks, excluyendo servicios/repositorios legítimos
    files: ['**/*.{js,jsx}'],
    ignores: ['src/services/**/*', 'src/repositories/**/*'],
    rules: {
      'no-restricted-syntax': [
        'error',
        // 1. Prohibir <select> nativo
        {
          selector: "JSXOpeningElement[name.name='select']",
          message:
            'No usar <select> nativo. Usar el componente CustomSelect del design system (src/components/ui/CustomSelect.jsx).',
        },
        // 2. Prohibir className con template literals dinámicos
        {
          selector: "JSXAttribute[name.name='className'] TemplateLiteral:has(TemplateElement[value.cooked=/-\\$/])",
          message:
            'No construir clases Tailwind con template literals dinámicos (ej: `bg-${color}-500`). Tailwind no puede empaquetar clases interpoladas. Usa un objeto de mapeo estático o clases completas preconstruidas.',
        },
        // 3. Prohibir setDoc directo
        {
          selector: "CallExpression[callee.name='setDoc']",
          message:
            'setDoc() directo está prohibido en vistas y hooks. Encapsúlalo en un servicio en src/services/ o src/repositories/.',
        },
        // 4. Prohibir updateDoc directo
        {
          selector: "CallExpression[callee.name='updateDoc']",
          message:
            'updateDoc() directo está prohibido en vistas y hooks. Encapsúlalo en un servicio en src/services/ o src/repositories/.',
        },
        // 5. Prohibir deleteDoc directo
        {
          selector: "CallExpression[callee.name='deleteDoc']",
          message:
            'deleteDoc() directo está prohibido en vistas y hooks. Encapsúlalo en un servicio en src/services/ o src/repositories/.',
        },
      ],
    },
  },
  {
    // ─── ARQUITECTURA (CORE-344 / ADR-0001): selectores heredados en las
    // features ya alineadas — replicados (sin cambios) desde el bloque
    // anterior porque el flat config de ESLint reemplaza, no fusiona, el
    // valor de una misma regla entre bloques que coinciden sobre el mismo
    // archivo. La frontera de Firebase (antes selector 6 aquí) se movió al
    // mecanismo nuevo de abajo (CORE-345), que cubre las 8 features en vez
    // de solo estas 2 — se retira de aquí para no duplicar el chequeo.
    files: [
      'src/features/hello-module/components/**/*.{js,jsx}',
      'src/features/hello-module/hooks/**/*.{js,jsx}',
      'src/features/hello-module/services/**/*.{js,jsx}',
      'src/features/customer-loyalty/components/**/*.{js,jsx}',
      'src/features/customer-loyalty/hooks/**/*.{js,jsx}',
      'src/features/customer-loyalty/services/**/*.{js,jsx}',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='select']",
          message:
            'No usar <select> nativo. Usar el componente CustomSelect del design system (src/components/ui/CustomSelect.jsx).',
        },
        {
          selector: "JSXAttribute[name.name='className'] TemplateLiteral:has(TemplateElement[value.cooked=/-\\$/])",
          message:
            'No construir clases Tailwind con template literals dinámicos (ej: `bg-${color}-500`). Tailwind no puede empaquetar clases interpoladas. Usa un objeto de mapeo estático o clases completas preconstruidas.',
        },
        {
          selector: "CallExpression[callee.name='setDoc']",
          message:
            'setDoc() directo está prohibido en vistas y hooks. Encapsúlalo en un servicio en src/services/ o src/repositories/.',
        },
        {
          selector: "CallExpression[callee.name='updateDoc']",
          message:
            'updateDoc() directo está prohibido en vistas y hooks. Encapsúlalo en un servicio en src/services/ o src/repositories/.',
        },
        {
          selector: "CallExpression[callee.name='deleteDoc']",
          message:
            'deleteDoc() directo está prohibido en vistas y hooks. Encapsúlalo en un servicio en src/services/ o src/repositories/.',
        },
      ],
    },
  },

  // ─── ARQUITECTURA (CORE-345 / ADR-0001): frontera de Firebase — doctrina
  // permanente, las 8 features desde el inicio (no solo las migradas). Ver
  // Documentacion PROTOTIPE/00_Continuidad/canonical/ADR-0001-arquitectura-canonica-por-capas.md

  // 1. Legado: `warn` no bloqueante en todas las features. El glob `*` cubre
  //    automáticamente cualquier feature nueva que se cree después, sin
  //    tener que tocar este archivo de nuevo.
  {
    files: [
      'src/features/*/components/**/*.{js,jsx}',
      'src/features/*/hooks/**/*.{js,jsx}',
      'src/features/*/services/**/*.{js,jsx}',
    ],
    ignores: [
      '**/api/**',
      // inventory/services/inventoryInterface.js (CORE-345): EXCEPCIÓN
      // EXPLÍCITA, no pendiente de migrar (ADR-0001 §9 — lista pequeña,
      // explícita, temporal y revisable). Es un "contrato de dominio"
      // deliberado que participa en transacciones iniciadas por otras
      // features ya migradas (orders/api/OrderRepository.js,
      // sales/api/SalesRepository.js le pasan su `transaction` activa) y
      // llama a `auditProductStock` (lógica de negocio, no infraestructura).
      // Moverlo a api/ rompería esa dirección (Repository -> Service) o
      // forzaría rediseñar el contrato transaccional de 2 features ya
      // migradas. Revisar si esta excepción sigue siendo necesaria cuando se
      // rediseñe el contrato de `deductInventoryStock`.
      'src/features/inventory/services/inventoryInterface.js',
    ],
    plugins: {
      prototipe: { rules: { 'no-firebase-outside-repository': noFirebaseOutsideRepository } },
    },
    rules: {
      'prototipe/no-firebase-outside-repository': 'warn',
    },
  },

  // 2. Migradas: `error` bloqueante. Único mantenimiento recurrente de esta
  //    regla: agregar aquí el nombre de cada feature al terminar su
  //    migración (ver skill migrate-feature-to-layers).
  {
    files: [
      'src/features/hello-module/components/**/*.{js,jsx}',
      'src/features/hello-module/hooks/**/*.{js,jsx}',
      'src/features/hello-module/services/**/*.{js,jsx}',
      'src/features/customer-loyalty/components/**/*.{js,jsx}',
      'src/features/customer-loyalty/hooks/**/*.{js,jsx}',
      'src/features/customer-loyalty/services/**/*.{js,jsx}',
      // delivery (CORE-345): módulo sin services/hooks/components propios —
      // solo enruta a páginas fuera de features/ (ver bitácora). Nada que
      // migrar; se sube aquí por consistencia del guard.
      'src/features/delivery/components/**/*.{js,jsx}',
      'src/features/delivery/hooks/**/*.{js,jsx}',
      'src/features/delivery/services/**/*.{js,jsx}',
      // credits (CORE-345): migrada — CreditRepository.js nuevo en api/.
      'src/features/credits/components/**/*.{js,jsx}',
      'src/features/credits/hooks/**/*.{js,jsx}',
      'src/features/credits/services/**/*.{js,jsx}',
      // billing (CORE-345): migrada — BillingRepository.js nuevo en api/.
      'src/features/billing/components/**/*.{js,jsx}',
      'src/features/billing/hooks/**/*.{js,jsx}',
      'src/features/billing/services/**/*.{js,jsx}',
      // orders (CORE-345): migrada — OrderRepository.js nuevo en api/.
      'src/features/orders/components/**/*.{js,jsx}',
      'src/features/orders/hooks/**/*.{js,jsx}',
      'src/features/orders/services/**/*.{js,jsx}',
      // sales (CORE-345): migrada — SalesRepository.js nuevo en api/.
      'src/features/sales/components/**/*.{js,jsx}',
      'src/features/sales/hooks/**/*.{js,jsx}',
      'src/features/sales/services/**/*.{js,jsx}',
      // inventory (CORE-345): PARCIAL — solo los archivos migrados. NO se
      // incluye `components/**` completo: ProductFormModal.jsx (2399
      // líneas, Storage + Firestore embebidos en callbacks de progreso de
      // subida) queda deliberadamente en el nivel `warn` — sin arnés de
      // pruebas de componentes (no hay @testing-library/react ni entorno
      // jsdom en este proyecto) refactorizarlo sin red de seguridad es un
      // riesgo desproporcionado para esta sesión. `inventoryInterface.js`
      // tiene su propia excepción explícita arriba (no es "pendiente").
      'src/features/inventory/services/inventoryService.js',
      'src/features/inventory/hooks/**/*.{js,jsx}',
      'src/features/inventory/components/CategoryManager.jsx',
    ],
    // No se redeclara `plugins` aquí: ESLint no permite redefinir el mismo
    // namespace de plugin en dos bloques ("Cannot redefine plugin"), aunque
    // el contenido sea idéntico. El registro (bloque anterior) es válido
    // para todo el config array; aquí solo se sube la severidad.
    rules: {
      'prototipe/no-firebase-outside-repository': 'error',
    },
  },
])

