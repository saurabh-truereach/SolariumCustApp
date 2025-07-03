/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';
import {AppConfig} from '../config/environments';
import renderer from 'react-test-renderer';

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const RealModule = jest.requireActual('react-native-paper');
  const MockedModule = {
    ...RealModule,
    PaperProvider: ({children}: {children: React.ReactNode}) => children,
    Card: {
      ...RealModule.Card,
      Content: ({children}: {children: React.ReactNode}) => children,
    },
    Button: ({children, onPress}: {children: React.ReactNode; onPress: () => void}) => (
      <div onClick={onPress}>{children}</div>
    ),
  };
  return MockedModule;
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

describe('App Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('loads environment configuration correctly', () => {
    expect(AppConfig.BASE_API_URL).toBeDefined();
    expect(AppConfig.APP_ENV).toBeDefined();
    expect(AppConfig.API_TIMEOUT).toBeGreaterThan(0);
    expect(typeof AppConfig.DEBUG_MODE).toBe('boolean');
  });

  it('has correct development environment in test', () => {
    expect(AppConfig.APP_ENV).toBe('development');
    expect(AppConfig.BASE_API_URL).toBe('https://api.dev.solarium.in');
    expect(AppConfig.DEBUG_MODE).toBe(true);
  });

  it('has valid API URL format', () => {
    expect(AppConfig.BASE_API_URL).toMatch(/^https:\/\//);
    expect(AppConfig.BASE_API_URL).not.toContain('undefined');
  });
});
