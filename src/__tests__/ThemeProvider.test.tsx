/**
 * Enhanced Theme Provider tests
 */

import React from 'react';
import {Text, View} from 'react-native';
import {renderWithProviders} from '../utils/testUtils';
import ThemeProvider, {useAppTheme} from '../theme/ThemeProvider';
import {colors, spacing, typography} from '../theme/palette';

// Mock react-native-paper
jest.mock('react-native-paper', () => ({
  PaperProvider: ({children}: {children: React.ReactNode}) => children,
  MD3LightTheme: {
    colors: {},
    fonts: {},
  },
  configureFonts: jest.fn(() => ({})),
}));

const TestComponent = () => {
  const theme = useAppTheme();
  return (
    <View testID="theme-test">
      <Text testID="primary-color">{theme.colors.primary}</Text>
      <Text testID="spacing-md">{theme.spacing.md}</Text>
      <Text testID="font-size-lg">{theme.typography.fontSize.lg}</Text>
    </View>
  );
};

const TestComponentWithThemeUsage = () => {
  const theme = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
      }}
      testID="styled-component"
    >
      <Text
        style={{
          color: theme.colors.primary,
          fontSize: theme.typography.fontSize.lg,
        }}
        testID="styled-text"
      >
        Themed Text
      </Text>
    </View>
  );
};

describe('Enhanced ThemeProvider', () => {
  describe('Basic Functionality', () => {
    it('renders without crashing', () => {
      const {toJSON} = renderWithProviders(
        <ThemeProvider>
          <Text>Test</Text>
        </ThemeProvider>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('provides theme context to children', () => {
      const {getByTestId} = renderWithProviders(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const testElement = getByTestId('theme-test');
      expect(testElement).toBeTruthy();

      const primaryColor = getByTestId('primary-color');
      expect(primaryColor.children[0]).toBe(colors.primary);
    });

    it('throws error when useAppTheme is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderWithProviders(<TestComponent />);
      }).toThrow('useAppTheme must be used within ThemeProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Theme Values', () => {
    it('provides correct color values', () => {
      const {getByTestId} = renderWithProviders(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const primaryColor = getByTestId('primary-color');
      expect(primaryColor.children[0]).toBe('#2E7D32');
    });

    it('provides correct spacing values', () => {
      const {getByTestId} = renderWithProviders(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const spacingMd = getByTestId('spacing-md');
      expect(spacingMd.children[0]).toBe('16');
    });

    it('provides correct typography values', () => {
      const {getByTestId} = renderWithProviders(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const fontSizeLg = getByTestId('font-size-lg');
      expect(fontSizeLg.children[0]).toBe('18');
    });

    it('includes all required theme properties', () => {
      const TestAllProperties = () => {
        const theme = useAppTheme();

        // Test that all expected properties exist
        expect(theme.colors).toBeDefined();
        expect(theme.spacing).toBeDefined();
        expect(theme.typography).toBeDefined();
        expect(theme.shadows).toBeDefined();
        expect(theme.borderRadius).toBeDefined();

        // Test specific color properties
        expect(theme.colors.primary).toBeDefined();
        expect(theme.colors.secondary).toBeDefined();
        expect(theme.colors.background).toBeDefined();
        expect(theme.colors.surface).toBeDefined();
        expect(theme.colors.error).toBeDefined();

        return <Text testID="all-props-test">All props available</Text>;
      };

      const {getByTestId} = renderWithProviders(
        <ThemeProvider>
          <TestAllProperties />
        </ThemeProvider>
      );

      expect(getByTestId('all-props-test')).toBeTruthy();
    });
  });

  describe('Theme Usage', () => {
    it('applies theme values to component styles', () => {
      const {getByTestId} = renderWithProviders(
        <ThemeProvider>
          <TestComponentWithThemeUsage />
        </ThemeProvider>
      );

      const styledComponent = getByTestId('styled-component');
      const styledText = getByTestId('styled-text');

      expect(styledComponent).toBeTruthy();
      expect(styledText).toBeTruthy();
      expect(styledText.children[0]).toBe('Themed Text');
    });

    it('supports nested components with theme access', () => {
      const NestedComponent = () => {
        const theme = useAppTheme();
        return (
          <View testID="nested">
            <Text testID="nested-color">{theme.colors.secondary}</Text>
          </View>
        );
      };

      const ParentComponent = () => {
        const theme = useAppTheme();
        return (
          <View testID="parent">
            <Text testID="parent-color">{theme.colors.primary}</Text>
            <NestedComponent />
          </View>
        );
      };

      const {getByTestId} = renderWithProviders(
        <ThemeProvider>
          <ParentComponent />
        </ThemeProvider>
      );

      expect(getByTestId('parent-color').children[0]).toBe(colors.primary);
      expect(getByTestId('nested-color').children[0]).toBe(colors.secondary);
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      let renderCount = 0;

      const CountingComponent = () => {
        renderCount++;
        const theme = useAppTheme();
        return <Text testID="counting">{theme.colors.primary}</Text>;
      };

      const {rerender} = renderWithProviders(
        <ThemeProvider>
          <CountingComponent />
        </ThemeProvider>
      );

      const initialRenderCount = renderCount;

      // Re-render with same props
      rerender(
        <ThemeProvider>
          <CountingComponent />
        </ThemeProvider>
      );

      // Should only render twice (initial + rerender)
      expect(renderCount).toBe(initialRenderCount + 1);
    });

    it('memoizes theme object', () => {
      let themeObjects: any[] = [];

      const ThemeCollector = () => {
        const theme = useAppTheme();
        themeObjects.push(theme);
        return <Text>Collecting</Text>;
      };

      const {rerender} = renderWithProviders(
        <ThemeProvider>
          <ThemeCollector />
        </ThemeProvider>
      );

      rerender(
        <ThemeProvider>
          <ThemeCollector />
        </ThemeProvider>
      );

      // Theme objects should be the same reference
      expect(themeObjects[0]).toBe(themeObjects[1]);
    });
  });

  describe('Error Handling', () => {
    it('handles invalid theme values gracefully', () => {
      const ComponentWithInvalidAccess = () => {
        const theme = useAppTheme();

        // Try to access non-existent property
        const invalidValue = (theme as any).invalidProperty;

        return (
          <Text testID="invalid-access">{invalidValue || 'fallback'}</Text>
        );
      };

      const {getByTestId} = renderWithProviders(
        <ThemeProvider>
          <ComponentWithInvalidAccess />
        </ThemeProvider>
      );

      expect(getByTestId('invalid-access').children[0]).toBe('fallback');
    });
  });

  describe('Integration with React Native Paper', () => {
    it('integrates with Paper components', () => {
      const PaperIntegrationTest = () => {
        const theme = useAppTheme();

        // Verify that Paper theme is available
        expect(theme.fonts).toBeDefined();
        expect(theme.colors.primary).toBe(colors.primary);

        return <Text testID="paper-integration">Paper integration works</Text>;
      };

      const {getByTestId} = renderWithProviders(
        <ThemeProvider>
          <PaperIntegrationTest />
        </ThemeProvider>
      );

      expect(getByTestId('paper-integration')).toBeTruthy();
    });
  });
});
