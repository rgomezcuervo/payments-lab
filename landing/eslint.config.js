import js from '@eslint/js';
import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';

/**
 * Calidad Fase 8: ESLint + reglas JSDoc centradas en sintaxis y bloques coherentes
 * (sin exigir descripciones en cada @param; typedefs viven en módulos dedicados).
 */
export default [
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    plugins: {
      jsdoc,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      jsdoc: {
        mode: 'typescript',
      },
    },
    rules: {
      'jsdoc/check-syntax': 'warn',
      'jsdoc/no-bad-blocks': 'error',
      'jsdoc/empty-tags': 'warn',
      'jsdoc/no-multi-asterisks': 'warn',
    },
  },
];
