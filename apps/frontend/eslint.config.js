import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
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
    plugins: {
      react,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Count JSX identifiers (<Icon />) as variable usages — without this,
      // core no-unused-vars false-positives on JSX-only components.
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Hydrating state from localStorage / fetching on mount is a valid, intentional
      // pattern here; the experimental `set-state-in-effect` rule flags it as a false
      // positive across AuthContext, CartContext, admin pages etc.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // shadcn/ui components and React contexts legitimately co-export helpers
    // (buttonVariants, useAuth, useCart, useTheme...) alongside components.
    files: ['src/components/ui/**', 'src/context/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
