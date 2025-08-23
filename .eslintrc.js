module.exports = {
  env: {
    browser: true,
    es2021: true,
    worker: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // 代码质量
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off', // 允许console，因为这是调试友好的应用
    'no-debugger': 'warn',
    'no-alert': 'warn',
    
    // 代码风格
    'indent': ['error', 4, { SwitchCase: 1 }],
    'quotes': ['error', 'single', { allowTemplateLiterals: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    'keyword-spacing': ['error', { before: true, after: true }],
    'space-infix-ops': 'error',
    'eol-last': 'error',
    'no-trailing-spaces': 'error',
    
    // ES6+
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'no-var': 'error',
    
    // 最佳实践
    'eqeqeq': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-return-assign': 'error',
    'no-self-compare': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-expressions': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'prefer-promise-reject-errors': 'error',
    'require-await': 'error',
    
    // 可访问性
    'no-implicit-globals': 'error'
  },
  globals: {
    // Web APIs
    'AudioContext': 'readonly',
    'webkitAudioContext': 'readonly',
    'SpeechSynthesisUtterance': 'readonly',
    'Notification': 'readonly',
    'indexedDB': 'readonly',
    'Dexie': 'readonly'
  }
};