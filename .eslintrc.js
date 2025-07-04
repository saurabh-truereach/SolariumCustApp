/**
 * ESLint Configuration for Solarium Customer App
 * Enhanced with comprehensive accessibility rules
 */

module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:jsx-a11y/recommended', // Add JSX accessibility rules
    // 'plugin:react-native-a11y/recommended', // React Native specific accessibility rules
    'prettier', // Must be last to override other configs
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-native',
    'jsx-a11y', // Add jsx-a11y plugin
    'react-native-a11y', // React Native specific a11y plugin
    'prettier',
    'import',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  env: {
    'jest/globals': true,
    'react-native/react-native': true,
    node: true,
    es6: true,
  },
  // ADD: Override for test files
  overrides: [
    {
      files: [
        '**/__tests__/**/*.{js,jsx,ts,tsx}',
        '**/*.{test,spec}.{js,jsx,ts,tsx}',
        '**/jest.setup.js',
        '**/jest.config.js',
      ],
      env: {
        jest: true,
        'jest/globals': true,
      },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        // Test-specific rule overrides
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
        'jest/expect-expect': 'warn',
        'jest/no-standalone-expect': 'error',
        'jest/no-test-return-statement': 'error',
        'jest/prefer-strict-equal': 'warn',
        'jest/prefer-to-be': 'warn',
        'jest/prefer-to-contain': 'warn',

        // Allow console in tests
        'no-console': 'off',

        // Allow any type in test mocks
        '@typescript-eslint/no-explicit-any': 'off',

        // Allow non-null assertions in tests
        '@typescript-eslint/no-non-null-assertion': 'off',

        // Allow empty functions in mocks
        '@typescript-eslint/no-empty-function': 'off',

        // Allow require in tests
        '@typescript-eslint/no-var-requires': 'off',

        // Allow unused expressions in tests (for expect statements)
        '@typescript-eslint/no-unused-expressions': 'off',

        // Relax some rules for test files
        'react-native/no-inline-styles': 'off',
        'react-native/no-color-literals': 'off',

        // Relax accessibility rules in tests
        'jsx-a11y/no-noninteractive-element-interactions': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
      },
    },
  ],
  rules: {
    // Prettier integration
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        semi: true,
        trailingComma: 'es5',
        tabWidth: 2,
        useTabs: false,
      },
    ],

    // React Native specific rules
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'off', // Allow raw text for now

    // React Rules
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // TypeScript Rules
    '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',

    // ACCESSIBILITY RULES
    // JSX-A11Y Rules (adapted for React Native)
    'jsx-a11y/accessible-emoji': 'off', // Not applicable to React Native
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'off', // No anchors in React Native
    'jsx-a11y/anchor-is-valid': 'off', // No anchors in React Native
    'jsx-a11y/aria-activedescendant-has-tabindex': 'off', // Limited ARIA support
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/click-events-have-key-events': 'off', // Touch events in React Native
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/html-has-lang': 'off', // No HTML in React Native
    'jsx-a11y/iframe-has-title': 'off', // No iframes in React Native
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/interactive-supports-focus': 'warn',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/media-has-caption': 'off', // Handle case by case
    'jsx-a11y/mouse-events-have-key-events': 'off', // Touch events in React Native
    'jsx-a11y/no-access-key': 'warn',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/no-distracting-elements': 'error',
    'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
    'jsx-a11y/no-noninteractive-tabindex': 'error',
    'jsx-a11y/no-onchange': 'off', // onChange is standard in React Native
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/scope': 'off', // No tables typically in React Native
    'jsx-a11y/tabindex-no-positive': 'error',

    // CUSTOM ACCESSIBILITY RULES
    // These would be custom rules for React Native accessibility
    // 'react-native-a11y/has-accessibility-label': 'error',
    // 'react-native-a11y/has-accessibility-role': 'error',
    'react-native-a11y/no-nested-touchables': 'error',
    // 'react-native-a11y/accessibility-label-no-generic': 'warn',

    // General JavaScript Rules
    'no-console': 'off', // Allow console logs for now (development phase)
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-unused-vars': 'off', // Use TypeScript version instead
    // 'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',

    // Import Rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'never',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    // 'import/no-duplicate-imports': 'error',

    // Code Style Rules
    curly: ['error', 'all'],
    eqeqeq: ['error', 'always'],
    'no-trailing-spaces': 'error',
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
    quotes: ['error', 'single', {avoidEscape: true}],
    semi: ['error', 'always'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'coverage/',
    '*.config.js',
    '.eslintrc.js',
  ],
};

// Note: Some custom rules like 'react-native-a11y/has-accessibility-label'
// would need to be implemented as custom ESLint rules or use existing plugins
// that provide React Native specific accessibility checking
