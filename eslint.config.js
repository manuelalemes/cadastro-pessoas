// Configuração "flat" do ESLint (sem dependências extras além do próprio eslint).
const globaisNode = {
  console: 'readonly',
  process: 'readonly',
  Buffer: 'readonly',
  URL: 'readonly',
  fetch: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
};

const globaisNavegador = {
  window: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  console: 'readonly',
  confirm: 'readonly',
  FormData: 'readonly',
};

const regras = {
  'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  'no-undef': 'error',
  'no-var': 'error',
  'prefer-const': 'error',
  eqeqeq: ['error', 'always'],
  curly: ['error', 'all'],
  'no-shadow': 'error',
  'no-console': 'off',
  'no-duplicate-imports': 'error',
  'no-throw-literal': 'error',
  'no-return-await': 'error',
  'require-await': 'error',
  'consistent-return': 'error',
};

export default [
  { ignores: ['node_modules/**', 'coverage/**', 'evidencias/**'] },
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: globaisNode },
    rules: regras,
  },
  {
    files: ['public/**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: globaisNavegador,
    },
  },
];
