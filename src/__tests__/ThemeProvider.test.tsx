/**
 * Theme Provider tests
 */

import React from 'react';
import {Text} from 'react-native';
import renderer from 'react-test-renderer';
import ThemeProvider, {useAppTheme} from '../theme/ThemeProvider';

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
  return <Text testID="theme-test">{theme.colors.primary}</Text>;
};

describe('ThemeProvider', () => {
  it('renders without crashing', () => {
    const tree = renderer.create(
      <ThemeProvider>
        <Text>Test</Text>
      </ThemeProvider>
    );
    expect(tree).toMatchSnapshot();
  });

  it('provides theme context to children', () => {
    const tree = renderer.create(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const testInstance = tree.root.findByProps({testID: 'theme-test'});
    expect(testInstance.children[0]).toBe('#2E7D32');
  });

  it('throws error when useAppTheme is used outside provider', () => {
    // This test would need to be wrapped in error boundary in real testing
    expect(() => {
      renderer.create(<TestComponent />);
    }).toThrow();
  });
});
