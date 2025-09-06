module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    // Allow console usage for logging as done throughout the codebase
    'no-console': 'off',
    // TypeScript handles these
    'no-undef': 'off',
    'no-unused-vars': 'off',
    // Disable TypeScript ESLint rules for minimal changes
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // Allow escape characters in strings
    'no-useless-escape': 'off',
  },
  ignorePatterns: [
    'dist/**/*',
    'node_modules/**/*',
    '*.js',
  ],
};