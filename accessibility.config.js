/**
 * Accessibility Configuration
 * Configuration for React Native Accessibility Engine and other a11y tools
 */

module.exports = {
  // React Native Accessibility Engine configuration
  accessibilityEngine: {
    // Rules to check
    rules: {
      // Critical rules that must pass
      critical: [
        'accessible-name',
        'button-name',
        'link-name',
        'image-alt',
        'label',
        'color-contrast',
      ],
      
      // Warning rules that should pass but won't fail the build
      warnings: [
        'focus-order-semantics',
        'keyboard-navigation',
        'touch-target-size',
        'heading-order',
      ],
      
      // Best practice rules
      bestPractices: [
        'aria-usage',
        'semantic-markup',
        'screen-reader-support',
      ],
    },
    
    // Thresholds for pass/fail
    thresholds: {
      critical: 0,        // Zero critical issues allowed
      warnings: 5,        // Maximum 5 warnings allowed
      bestPractices: 10,  // Maximum 10 best practice violations
    },
    
    // Components to test
    testTargets: [
      'src/screens/**/*.tsx',
      'src/components/**/*.tsx',
    ],
    
    // Components to exclude from testing
    exclude: [
      'src/**/*.test.tsx',
      'src/**/*.stories.tsx',
      'src/**/__tests__/**',
    ],
    
    // Output configuration
    output: {
      format: ['json', 'html'],
      destination: './accessibility-report',
    },
  },
  
  // Color contrast checking
  colorContrast: {
    // WCAG level to check against
    level: 'AA',  // 'AA' or 'AAA'
    
    // Text size considerations
    largeText: {
      fontSize: 18,      // px
      fontWeight: 'bold',
    },
    
    // Colors to check from theme
    colorPairs: [
      // Primary combinations
      {
        foreground: '#2E7D32', // primary
        background: '#FFFFFF', // background
        context: 'Primary on background',
      },
      {
        foreground: '#FFFFFF', // onPrimary
        background: '#2E7D32', // primary
        context: 'Text on primary',
      },
      
      // Secondary combinations
      {
        foreground: '#1976D2', // secondary
        background: '#FFFFFF', // background
        context: 'Secondary on background',
      },
      
      // Text combinations
      {
        foreground: '#212121', // text primary
        background: '#FFFFFF', // background
        context: 'Primary text',
      },
      {
        foreground: '#757575', // text secondary
        background: '#FFFFFF', // background
        context: 'Secondary text',
      },
      
      // Error combinations
      {
        foreground: '#F44336', // error
        background: '#FFFFFF', // background
        context: 'Error text',
      },
      
      // Surface combinations
      {
        foreground: '#212121', // text primary
        background: '#F8F9FA', // surface
        context: 'Text on surface',
      },
    ],
  },
  
  // Touch target size checking
  touchTargets: {
    minimumSize: {
      width: 44,   // iOS minimum
      height: 44,  // iOS minimum
    },
    recommendedSize: {
      width: 48,   // Material Design recommendation
      height: 48,  // Material Design recommendation
    },
  },
  
  // Screen reader testing
  screenReader: {
    // Test announcements
    testAnnouncements: true,
    
    // Test reading order
    testReadingOrder: true,
    
    // Test focus management
    testFocusManagement: true,
    
    // Languages to test (if applicable)
    languages: ['en-US'],
  },
  
  // Keyboard navigation
  keyboardNavigation: {
    // Test tab order
    testTabOrder: true,
    
    // Test keyboard shortcuts
    testShortcuts: false, // Not applicable for mobile
    
    // Test focus indicators
    testFocusIndicators: true,
  },
  
  // Reporting configuration
  reporting: {
    // Include screenshots in reports
    includeScreenshots: true,
    
    // Include code snippets
    includeCodeSnippets: true,
    
    // Severity levels to report
    severityLevels: ['critical', 'warning', 'info'],
    
    // Group issues by type
    groupByType: true,
    
    // Include fix suggestions
    includeSuggestions: true,
  },
  
  // CI/CD integration
  cicd: {
    // Fail build on critical issues
    failOnCritical: true,
    
    // Fail build on too many warnings
    failOnWarningThreshold: true,
    
    // Export results for CI systems
    exportFormats: ['json', 'junit'],
    
    // Comment on PRs
    commentOnPR: true,
  },
};
