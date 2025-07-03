/**
 * Root Navigator tests
 */

import React from 'react';
// import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import renderer from 'react-test-renderer';
import RootNavigator from '../../navigation/RootNavigator';
import authReducer from '../../store/authSlice';
import uiReducer from '../../store/uiSlice';
import cacheReducer from '../../store/cacheSlice';

// Mock encrypted storage
jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(true)),
  removeItem: jest.fn(() => Promise.resolve(true)),
  clear: jest.fn(() => Promise.resolve(true)),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({children}: {children: React.ReactNode}) => children,
}));

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const RealModule = jest.requireActual('react-native-paper');
  return {
    ...RealModule,
    PaperProvider: ({children}: {children: React.ReactNode}) => children,
  };
});

const createTestStore = (initialState = {}) =>
  configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      cache: cacheReducer,
    },
    preloadedState: initialState,
  });

const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const store = createTestStore(initialState);
  return renderer.create(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('RootNavigator', () => {
  it('renders auth stack when user is not logged in', () => {
    const tree = renderWithProviders(<RootNavigator />, {
      auth: {
        isLoggedIn: false,
        isLoading: false,
      },
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders main stack when user is logged in', () => {
    const tree = renderWithProviders(<RootNavigator />, {
      auth: {
        isLoggedIn: true,
        isLoading: false,
        user: {
          id: '1',
          phone: '1234567890',
          name: 'Test User',
        },
      },
    });
    expect(tree).toMatchSnapshot();
  });
});
