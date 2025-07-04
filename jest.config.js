/**
 * Jest Configuration for Solarium Customer App
 * Comprehensive test setup with coverage reporting
 */

module.exports = {
  preset: 'react-native',
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFiles: [
    '<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '@testing-library/jest-native/extend-expect',
  ],
  // Custom test environment for accessibility tests
  projects: [
    {
      displayName: 'unit',
      testMatch: [
        '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      ],
      testPathIgnorePatterns: [
        '<rootDir>/src/**/*Accessibility*.{test,spec}.{js,jsx,ts,tsx}',
      ],
    },
    {
      displayName: 'accessibility',
      testMatch: [
        '<rootDir>/src/**/*Accessibility*.{test,spec}.{js,jsx,ts,tsx}',
      ],
      setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js',
        '@testing-library/jest-native/extend-expect',
      ],
    },
  ],
  
  // Module paths and aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'identity-obj-proxy',
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['module:metro-react-native-babel-preset'],
        ],
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vector-icons|react-native-paper|react-native-encrypted-storage|react-native-config|@react-navigation|react-redux)/)',
  ],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*Accessibility*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  
  // Files to ignore
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/index.js',
    '!src/App.tsx', // Covered by integration tests
    'src/utils/accessibilityHelpers.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Higher thresholds for critical modules
    './src/store/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/api/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/utils/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/utils/accessibilityHelpers.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // Reporting
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Solarium Customer App Test Report',
        outputPath: 'coverage/test-report.html',
        includeFailureMsg: true,
        includeSuiteFailure: true,
      },
    ],
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        uniqueOutputName: 'false',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: 'true',
      },
    ],
  ],
  
  // Performance and debugging
  verbose: true,
  testTimeout: 10000,
  maxWorkers: '50%',
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Mock modules
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Global variables
  globals: {
    __DEV__: true,
  },
};
