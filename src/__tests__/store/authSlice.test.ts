/**
 * Auth Slice tests
 */

import authReducer, {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateUserProfile,
  loginWithOtp,
  logoutUser,
  type AuthState,
  type User,
} from '../../store/authSlice';
import {configureStore} from '@reduxjs/toolkit';

// Mock encrypted storage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

describe('authSlice', () => {
  const initialState: AuthState = {
    isSendingOtp: false,
    isLoggedIn: false,
    isLoading: false,
    token: undefined,
    refreshToken: undefined,
    user: undefined,
    lastLoginTime: undefined,
    error: undefined,
  };

  const mockUser: User = {
    id: 'user_1',
    phone: '1234567890',
    name: 'Test User',
    email: 'test@example.com',
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, {type: 'unknown'})).toEqual(initialState);
  });

  it('should handle loginRequest', () => {
    const actual = authReducer(initialState, loginRequest());
    expect(actual.isLoading).toBe(true);
    expect(actual.error).toBeUndefined();
  });

  it('should handle loginSuccess', () => {
    const loginData = {
      token: 'test_token',
      user: mockUser,
    };
    const actual = authReducer(initialState, loginSuccess(loginData));
    expect(actual.isLoggedIn).toBe(true);
    expect(actual.isLoading).toBe(false);
    expect(actual.token).toBe('test_token');
    expect(actual.user).toEqual(mockUser);
    expect(actual.error).toBeUndefined();
    expect(actual.lastLoginTime).toBeDefined();
  });

  it('should handle loginFailure', () => {
    const errorMessage = 'Login failed';
    const actual = authReducer(initialState, loginFailure(errorMessage));
    expect(actual.isLoggedIn).toBe(false);
    expect(actual.isLoading).toBe(false);
    expect(actual.token).toBeUndefined();
    expect(actual.user).toBeUndefined();
    expect(actual.error).toBe(errorMessage);
  });

  it('should handle logout', () => {
    const loggedInState: AuthState = {
      ...initialState,
      isLoggedIn: true,
      token: 'test_token',
      user: mockUser,
      lastLoginTime: Date.now(),
    };
    const actual = authReducer(loggedInState, logout());
    expect(actual).toEqual(initialState);
  });

  it('should handle clearError', () => {
    const stateWithError: AuthState = {
      ...initialState,
      error: 'Some error',
    };
    const actual = authReducer(stateWithError, clearError());
    expect(actual.error).toBeUndefined();
  });

  it('should handle updateUserProfile', () => {
    const loggedInState: AuthState = {
      ...initialState,
      isLoggedIn: true,
      user: mockUser,
    };
    const updates = {name: 'Updated Name', email: 'updated@example.com'};
    const actual = authReducer(loggedInState, updateUserProfile(updates));
    expect(actual.user).toEqual({...mockUser, ...updates});
  });

  describe('async thunks', () => {
    let store: any;

    beforeEach(() => {
      store = configureStore({
        reducer: {auth: authReducer},
      });
    });

    it('should handle loginWithOtp success', async () => {
      const loginData = {phone: '1234567890', otp: '123456'};
      await store.dispatch(loginWithOtp(loginData));
      
      const state = store.getState().auth;
      expect(state.isLoggedIn).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.user?.phone).toBe('1234567890');
      expect(state.error).toBeUndefined();
    });

    it('should handle loginWithOtp failure', async () => {
      const loginData = {phone: '1234567890', otp: '000000'};
      await store.dispatch(loginWithOtp(loginData));
      
      const state = store.getState().auth;
      expect(state.isLoggedIn).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeDefined();
    });

    it('should handle logoutUser', async () => {
      // First login
      await store.dispatch(loginWithOtp({phone: '1234567890', otp: '123456'}));
      expect(store.getState().auth.isLoggedIn).toBe(true);
      
      // Then logout
      await store.dispatch(logoutUser());
      const state = store.getState().auth;
      expect(state.isLoggedIn).toBe(false);
      expect(state.token).toBeUndefined();
      expect(state.user).toBeUndefined();
    });
  });
});