module.exports = {
  root: true,
  extends: ['@react-native', 'prettier'],
  plugins: ['prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // React Native specific rules
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'off',
    'react-native/no-single-element-style-arrays': 'error',

    // General rules
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'prefer-template': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'build/',
    'dist/',
    '*.config.js',
    'metro.config.js',
    'babel.config.js',
  ],
};
