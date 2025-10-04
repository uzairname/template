import baseConfig from './base.js'

export default [
  ...baseConfig,
  {
    rules: {
      // Node.js/Server specific rules
      'no-console': 'off', // Allow console in Node.js environments
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
]
