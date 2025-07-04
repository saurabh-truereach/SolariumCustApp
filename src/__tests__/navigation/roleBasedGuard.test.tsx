/**
 * Role-Based Guard tests
 */

import {configureStore} from '@reduxjs/toolkit';
import React from 'react';
import {Text} from 'react-native';
import {Provider} from 'react-redux';
import renderer from 'react-test-renderer';
import RoleBasedGuard from '../../navigation/roleBasedGuard';
import authReducer from '../../store/authSlice';
import cacheReducer from '../../store/cacheSlice';
import uiReducer from '../../store/uiSlice';

const createTestStore = (initialState = {}) =>
  configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      cache: cacheReducer,
    },
    preloadedState: initialState,
  });

const TestComponent = () => <Text>Protected Content</Text>;
const FallbackComponent = () => <Text>Fallback Content</Text>;

const renderWithStore = (component: React.ReactElement, initialState = {}) => {
  const store = createTestStore(initialState);
  return renderer.create(<Provider store={store}>{component}</Provider>);
};

describe('RoleBasedGuard', () => {
  it('shows children when user is logged in and auth is required', () => {
    const tree = renderWithStore(
      <RoleBasedGuard requireAuth={true}>
        <TestComponent />
      </RoleBasedGuard>,
      {
        auth: {
          isLoggedIn: true,
          isLoading: false,
        },
      }
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('shows fallback when user is not logged in and auth is required', () => {
    const tree = renderWithStore(
      <RoleBasedGuard requireAuth={true} fallback={<FallbackComponent />}>
        <TestComponent />
      </RoleBasedGuard>,
      {
        auth: {
          isLoggedIn: false,
          isLoading: false,
        },
      }
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('shows loading overlay when auth is loading', () => {
    const tree = renderWithStore(
      <RoleBasedGuard requireAuth={true}>
        <TestComponent />
      </RoleBasedGuard>,
      {
        auth: {
          isLoggedIn: false,
          isLoading: true,
        },
      }
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
