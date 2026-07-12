import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  {
    ignores: ['dist', 'node_modules', '.firebase'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // ─── ARQUITECTURA: Imports Públicos de Features ───────────────────────
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

      // ─── ARQUITECTURA: Restricciones de Sintaxis JSX y Firebase ──────────
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
          selector: "JSXAttribute[name.name='className'] TemplateLiteral",
          message:
            'No construir clases Tailwind con template literals dinámicos (ej: `bg-${color}-500`). Tailwind no puede empaquetar clases interpoladas. Usa un objeto de mapeo estático o clases completas preconstruidas.',
        },

        // 3. Prohibir setDoc directo fuera de la capa de services/repositories
        {
          selector: "CallExpression[callee.name='setDoc']",
          message:
            'setDoc() directo está prohibido en vistas y hooks. Encapsúlalo en un servicio en src/services/ o src/repositories/.',
        },

        // 4. Prohibir updateDoc directo fuera de la capa de services/repositories
        {
          selector: "CallExpression[callee.name='updateDoc']",
          message:
            'updateDoc() directo está prohibido en vistas y hooks. Encapsúlalo en un servicio en src/services/ o src/repositories/.',
        },

        // 5. Prohibir deleteDoc directo fuera de la capa de services/repositories
        {
          selector: "CallExpression[callee.name='deleteDoc']",
          message:
            'deleteDoc() directo está prohibido en vistas y hooks. Encapsúlalo en un servicio en src/services/ o src/repositories/.',
        },
      ],
    },
  },
]

