// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import stylistic from '@stylistic/eslint-plugin'; // For code style rules

export default withNuxt(
  // General rules for all files (JavaScript, TypeScript, Vue)
  {
    files: ['**/*.js', '**/*.ts', '**/*.vue'],
    rules: {
      'no-unused-vars': 'error', // Catch unused variables
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow warn/error logs
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off', // Disallow debugger in production
    },
  },
  // Vue-specific rules
  {
    files: ['**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off', // Disable if you prefer single-word components
      'vue/no-v-html': 'warn', // Warn against v-html to prevent XSS
      'vue/require-default-prop': 'error', // Enforce default values for props
    },
  },
  // TypeScript-specific rules
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off', // Optional: enforce return types
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Ignore unused args prefixed with _
    },
  },
  // Stylistic rules (optional, using @stylistic/eslint-plugin)
  stylistic.configs.customize({
    indent: 2, // 2-space indentation
    quotes: 'single', // Single quotes
    semi: false, // No semicolons
    commaDangle: 'always-multiline', // Trailing commas in multiline objects/arrays
    braceStyle: '1tbs', // One true brace style
  })
)
  // Optional: Add global ignores
  .prepend({
    ignores: [
      'node_modules/**',
      'dist/**',
      '.nuxt/**',
      'public/**',
      '**/*.min.js', // Ignore minified files
    ],
  });