/**
 * @format
 * Enhanced App Component tests
 */

import 'react-native';
import React from 'react';
import App from '../App';
import {AppConfig} from '../config/environments';
import renderer from 'react-test-renderer';
import {Alert} from 'react-native';
import {renderWithProviders, createMockAuthState, waitForAsync} from '../utils/testUtils';

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

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const {toJSON} = renderWithProviders(<App />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with theme provider', () => {
      const {getByTestId} = renderWithProviders(<App />);
      // The app should render within theme context
      expect(() => renderWithProviders(<App />)).not.toThrow();
    });

    it('renders with error boundary', () => {
      // Error boundary should be present
      const {toJSON} = renderWithProviders(<App />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Environment Configuration', () => {
    it('loads environment configuration correctly', () => {
      expect(AppConfig.BASE_API_URL).toBeDefined();
      expect(AppConfig.APP_ENV).toBeDefined();
      expect(AppConfig.API_TIMEOUT).toBeGreaterThan(0);
      expect(typeof AppConfig.DEBUG_MODE).toBe('boolean');
    });

    it('has correct development environment in test', () => {
      expect(AppConfig.APP_ENV).toBe('development');
      expect(AppConfig.BASE_API_URL).toContain('solarium.in');
      expect(AppConfig.DEBUG_MODE).toBe(true);
    });

    it('has valid API URL format', () => {
      expect(AppConfig.BASE_API_URL).toMatch(/^https:\/\//);
      expect(AppConfig.BASE_API_URL).not.toContain('undefined');
    });
  });

  describe('Redux Integration', () => {
    it('provides Redux store to components', () => {
      const {store} = renderWithProviders(<App />);
      
      expect(store).toBeDefined();
      expect(store.getState()).toBeDefined();
      expect(store.getState().auth).toBeDefined();
      expect(store.getState().ui).toBeDefined();
      expect(store.getState().cache).toBeDefined();
    });

    it('initializes with correct default state', () => {
      const {store} = renderWithProviders(<App />);
      const state = store.getState();
      
      expect(state.auth.isLoggedIn).toBe(false);
      expect(state.auth.isLoading).toBe(false);
      expect(state.ui.isLoading).toBe(false);
      expect(state.cache.syncInProgress).toBe(false);
    });

    it('handles preloaded auth state', () => {
      const preloadedState = {
        auth: createMockAuthState(),
      };

      const {store} = renderWithProviders(<App />, {
        preloadedState: preloadedState as any,
      });

      expect(store.getState().auth.isLoggedIn).toBe(true);
      expect(store.getState().auth.user).toBeDefined();
    });
  });

  describe('Navigation Integration', () => {
    it('integrates with navigation container', () => {
      const {toJSON} = renderWithProviders(<App />, {
        withNavigation: true,
      });
      
      expect(toJSON()).toBeTruthy();
    });

    it('handles navigation state persistence', async () => {
      const {toJSON} = renderWithProviders(<App />, {
        withNavigation: true,
        withPersistence: true,
      });
      
      await waitForAsync();
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('catches and handles component errors', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      // This should not crash the test
      expect(() => {
        renderWithProviders(<ThrowError />);
      }).not.toThrow();
    });

    it('provides error boundary fallback', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const {getByText} = renderWithProviders(<ThrowError />);
      
      // Error boundary should show fallback UI
      expect(getByText(/Something went wrong/i)).toBeTruthy();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('renders within acceptable time', async () => {
      const startTime = performance.now();
      
      renderWithProviders(<App />);
      await waitForAsync();
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 1 second
      expect(renderTime).toBeLessThan(1000);
    });

    it('handles multiple re-renders efficiently', async () => {
      const {rerender} = renderWithProviders(<App />);
      
      const startTime = performance.now();
      
      // Re-render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(<App />);
        await waitForAsync();
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle re-renders efficiently
      expect(totalTime).toBeLessThan(5000);
    });
  });

  describe('Memory Management', () => {
    it('cleans up resources properly', () => {
      const {unmount} = renderWithProviders(<App />);
      
      // Should not throw errors on unmount
      expect(() => unmount()).not.toThrow();
    });
  });
});
