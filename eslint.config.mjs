import { withNuxt } from './.nuxt/eslint.config.mjs';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default withNuxt(
  // Ignore patterns
  {
    ignores: ['node_modules/**', 'dist/**', '.nuxt/**', 'public/**', '**/*.min.js'],
  },

  // Base configurations
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended, // Non-type-checked TypeScript config
  ...pluginVue.configs['flat/recommended'], // Vue config
  prettierConfig,

  // Global language options
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      sourceType: 'module',
    },
  },

  // Type-aware linting for TypeScript files (.ts)
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      // Add more type-aware rules as needed
    },
  },

  // Type-aware linting for Vue files (.vue)
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser', // For <script lang="ts">
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      // Add more type-aware rules as needed
    },
  },

  // Custom plugins and rules
  {
    plugins: {
      '@stylistic': stylistic,
      prettier: prettier,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': [
        'error',
        {
          printWidth: 100,
          semi: true,
          singleQuote: true,
          trailingComma: 'all',
          bracketSpacing: true,
        },
      ],
      // Stylistic rules
      '@stylistic/no-extra-semi': 'error',
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      // Vue-specific rules
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'error',
    },
  },
);
