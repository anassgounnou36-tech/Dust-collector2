module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended'
  ],
  env: {
    node: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  rules: {
    // Allow console.log statements for debugging and logging
    'no-console': 'off',
    // Disable some rules that are problematic with TypeScript
    'no-undef': 'off',
    'no-unused-vars': 'off'
  }
};