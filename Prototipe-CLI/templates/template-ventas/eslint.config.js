import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

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
])

