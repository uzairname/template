import reactPlugin from 'eslint-plugin-react'
import hooksPlugin from 'eslint-plugin-react-hooks'
import baseConfig from './base.js'

export default [
  ...baseConfig,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': hooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React specific
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js
      'react/prop-types': 'off', // Using TypeScript
      'react/jsx-key': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/no-unescaped-entities': 'warn',
      
      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]
