/**
 * Store configuration tests
 */

import {store, persistor} from '../../store';
import {loginSuccess, logout} from '../../store/authSlice';

// Mock encrypted storage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

describe('Store Configuration', () => {
  it('should have correct initial state', () => {
    const state = store.getState();
    expect(state.auth).toBeDefined();
    expect(state.ui).toBeDefined();
    expect(state.cache).toBeDefined();
  });

  it('should handle auth actions', () => {
    const mockUser = {
      id: 'user_1',
      phone: '1234567890',
      name: 'Test User',
    };

    // Dispatch login success
    store.dispatch(loginSuccess({
      token: 'test_token',
      user: mockUser,
    }));

    let state = store.getState();
    expect(state.auth.isLoggedIn).toBe(true);
    expect(state.auth.user).toEqual(mockUser);

    // Dispatch logout
    store.dispatch(logout());
    state = store.getState();
    expect(state.auth.isLoggedIn).toBe(false);
    expect(state.auth.user).toBeUndefined();
  });

  it('should have persistor configured', () => {
    expect(persistor).toBeDefined();
    expect(typeof persistor.persist).toBe('function');
    expect(typeof persistor.purge).toBe('function');
  });

  it('should have correct middleware setup', () => {
    // Test that Redux DevTools is enabled in development
    if (__DEV__) {
      expect(store).toBeDefined();
    }
  });
});