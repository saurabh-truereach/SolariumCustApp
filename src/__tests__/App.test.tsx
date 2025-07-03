/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';
import {AppConfig} from '../config/environments';
import renderer from 'react-test-renderer';

// Mock all the dependencies
jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(true)),
  removeItem: jest.fn(() => Promise.resolve(true)),
  clear: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');

jest.mock('react-native-paper', () => {
  const RealModule = jest.requireActual('react-native-paper');
  return {
    ...RealModule,
    PaperProvider: ({children}: {children: React.ReactNode}) => children,
  };
});

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
  useNavigationContainerRef: () => ({current: null}),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: ({children}: {children: React.ReactNode}) => children,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: ({children}: {children: React.ReactNode}) => children,
  }),
}));

describe('App Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<App />);
    expect(tree).toMatchSnapshot();
  });

  it('loads environment configuration correctly', () => {
    expect(AppConfig.BASE_API_URL).toBeDefined();
    expect(AppConfig.APP_ENV).toBeDefined();
    expect(AppConfig.API_TIMEOUT).toBeGreaterThan(0);
    expect(typeof AppConfig.DEBUG_MODE).toBe('boolean');
  });
});
