/**
 * Enhanced Auth Slice tests
 */

import authReducer, {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateUserProfile,
  setLoading,
  loginWithOtp,
  loginWithOtpEnhanced,
  logoutUser,
  selectIsLoggedIn,
  selectIsLoading,
  selectUser,
  selectToken,
  selectAuthError,
  type AuthState,
  type User,
} from '../../store/authSlice';
import {setupTestStore, createMockUser, createMockAuthState} from '../../utils/testUtils';

// Mock encrypted storage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

describe('Enhanced Auth Slice', () => {
  const initialState: AuthState = {
    isLoggedIn: false,
    isLoading: false,
    token: undefined,
    refreshToken: undefined,
    user: undefined,
    lastLoginTime: undefined,
    error: undefined,
  };

  const mockUser: User = createMockUser();
  let store: ReturnType<typeof setupTestStore>;

  beforeEach(() => {
    store = setupTestStore();
  });

  describe('Initial State', () => {
    it('should return the initial state', () => {
      expect(authReducer(undefined, {type: undefined})).toEqual(initialState);
    });

    it('should have correct initial state structure', () => {
      const state = authReducer(undefined, {type: undefined});
      
      expect(state).toHaveProperty('isLoggedIn', false);
      expect(state).toHaveProperty('isLoading', false);
      expect(state).toHaveProperty('token', undefined);
      expect(state).toHaveProperty('user', undefined);
      expect(state).toHaveProperty('error', undefined);
    });
  });

  describe('Synchronous Actions', () => {
    it('should handle loginRequest', () => {
      const actual = authReducer(initialState, loginRequest());
      
      expect(actual.isLoading).toBe(true);
      expect(actual.error).toBeUndefined();
      expect(actual.isLoggedIn).toBe(false);
    });

    it('should handle loginSuccess', () => {
      const loginData = {
        token: 'test_token',
        user: mockUser,
        refreshToken: 'refresh_token',
      };
      
      const actual = authReducer(initialState, loginSuccess(loginData));
      
      expect(actual.isLoggedIn).toBe(true);
      expect(actual.isLoading).toBe(false);
      expect(actual.token).toBe('test_token');
      expect(actual.refreshToken).toBe('refresh_token');
      expect(actual.user).toEqual(mockUser);
      expect(actual.error).toBeUndefined();
      expect(actual.lastLoginTime).toBeDefined();
      expect(typeof actual.lastLoginTime).toBe('number');
    });

    it('should handle loginFailure', () => {
      const errorMessage = 'Login failed';
      const loggedInState = {...initialState, isLoading: true};
      
      const actual = authReducer(loggedInState, loginFailure(errorMessage));
      
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
      expect(actual.isLoggedIn).toBe(false);
    });

    it('should handle updateUserProfile', () => {
      const loggedInState: AuthState = {
        ...initialState,
        isLoggedIn: true,
        user: mockUser,
      };
      
      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };
      
      const actual = authReducer(loggedInState, updateUserProfile(updates));
      
      expect(actual.user).toEqual({...mockUser, ...updates});
      expect(actual.isLoggedIn).toBe(true);
    });

    it('should handle setLoading', () => {
      const actual = authReducer(initialState, setLoading(true));
      
      expect(actual.isLoading).toBe(true);
      expect(actual.error).toBeUndefined();
    });

    it('should not update profile when user is undefined', () => {
      const updates = {name: 'Updated Name'};
      const actual = authReducer(initialState, updateUserProfile(updates));
      
      expect(actual.user).toBeUndefined();
      expect(actual).toEqual(initialState);
    });
  });

  describe('Async Thunks', () => {
    describe('loginWithOtp', () => {
      it('should handle loginWithOtp success', async () => {
        const loginData = {phone: '1234567890', otp: '123456'};
        
        await store.dispatch(loginWithOtp(loginData));
        
        const state = store.getState().auth;
        expect(state.isLoggedIn).toBe(true);
        expect(state.isLoading).toBe(false);
        expect(state.user?.phone).toBe('1234567890');
        expect(state.token).toBeDefined();
        expect(state.error).toBeUndefined();
      });

      it('should handle loginWithOtp failure', async () => {
        const loginData = {phone: '1234567890', otp: '000000'};
        
        await store.dispatch(loginWithOtp(loginData));
        
        const state = store.getState().auth;
        expect(state.isLoggedIn).toBe(false);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeDefined();
        expect(state.token).toBeUndefined();
      });

      it('should handle loginWithOtp pending state', async () => {
        const loginData = {phone: '1234567890', otp: '123456'};
        const promise = store.dispatch(loginWithOtp(loginData));
        
        // Check pending state
        const pendingState = store.getState().auth;
        expect(pendingState.isLoading).toBe(true);
        expect(pendingState.error).toBeUndefined();
        
        await promise;
      });
    });

    describe('logoutUser', () => {
      it('should handle logoutUser success', async () => {
        // First login
        await store.dispatch(loginWithOtp({phone: '1234567890', otp: '123456'}));
        expect(store.getState().auth.isLoggedIn).toBe(true);
        
        // Then logout
        await store.dispatch(logoutUser());
        
        const state = store.getState().auth;
        expect(state.isLoggedIn).toBe(false);
        expect(state.token).toBeUndefined();
        expect(state.user).toBeUndefined();
        expect(state.lastLoginTime).toBeUndefined();
      });

      it('should handle logout even with storage errors', async () => {
        // Mock storage error
        const mockEncryptedStorage = require('react-native-encrypted-storage');
        mockEncryptedStorage.removeItem.mockRejectedValueOnce(new Error('Storage error'));
        
        // First login
        await store.dispatch(loginWithOtp({phone: '1234567890', otp: '123456'}));
        
        // Then logout (should succeed despite storage error)
        await store.dispatch(logoutUser());
        
        const state = store.getState().auth;
        expect(state.isLoggedIn).toBe(false);
      });
    });

    describe('loginWithOtpEnhanced', () => {
      it('should integrate with RTK Query', async () => {
        const loginData = {phone: '1234567890', otp: '123456'};
        
        const result = await store.dispatch(loginWithOtpEnhanced(loginData));
        
        expect(result.type).toContain('loginWithOtpEnhanced/fulfilled');
        expect(result.payload).toBeDefined();
      });
    });
  });

  describe('Selectors', () => {
    it('should select isLoggedIn correctly', () => {
      const state = {auth: createMockAuthState()};
      expect(selectIsLoggedIn(state as any)).toBe(true);
      
      const loggedOutState = {auth: initialState};
      expect(selectIsLoggedIn(loggedOutState as any)).toBe(false);
    });

    it('should select isLoading correctly', () => {
      const loadingState = {auth: {...initialState, isLoading: true}};
      expect(selectIsLoading(loadingState as any)).toBe(true);
      
      const notLoadingState = {auth: initialState};
      expect(selectIsLoading(notLoadingState as any)).toBe(false);
    });

    it('should select user correctly', () => {
      const state = {auth: createMockAuthState()};
      const user = selectUser(state as any);
      
      expect(user).toBeDefined();
      expect(user?.name).toBe('Test User');
      expect(user?.phone).toBe('1234567890');
    });

    it('should select token correctly', () => {
      const state = {auth: createMockAuthState()};
      const token = selectToken(state as any);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should select error correctly', () => {
      const errorState = {auth: {...initialState, error: 'Test error'}};
      expect(selectAuthError(errorState as any)).toBe('Test error');
      
      const noErrorState = {auth: initialState};
      expect(selectAuthError(noErrorState as any)).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid login requests', async () => {
      const loginData = {phone: '1234567890', otp: '123456'};
      
      // Dispatch multiple login requests rapidly
      const promises = [
        store.dispatch(loginWithOtp(loginData)),
        store.dispatch(loginWithOtp(loginData)),
        store.dispatch(loginWithOtp(loginData)),
      ];
      
      await Promise.all(promises);
      
      // Should end up in a consistent state
      const state = store.getState().auth;
      expect(state.isLoggedIn).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should handle login followed by immediate logout', async () => {
      const loginData = {phone: '1234567890', otp: '123456'};
      
      await store.dispatch(loginWithOtp(loginData));
      expect(store.getState().auth.isLoggedIn).toBe(true);
      
      await store.dispatch(logoutUser());
      expect(store.getState().auth.isLoggedIn).toBe(false);
    });

    it('should preserve other state properties during updates', () => {
      const customState: AuthState = {
        ...initialState,
        isLoggedIn: true,
        user: mockUser,
        token: 'existing_token',
        lastLoginTime: 1234567890,
      };
      
      const actual = authReducer(customState, clearError());
      
      // Should preserve all other properties
      expect(actual.isLoggedIn).toBe(true);
      expect(actual.user).toEqual(mockUser);
      expect(actual.token).toBe('existing_token');
      expect(actual.lastLoginTime).toBe(1234567890);
      expect(actual.error).toBeUndefined();
    });
  });

  describe('Token Management', () => {
    it('should handle refresh token updates', () => {
      const refreshData = {
        token: 'new_token',
        refreshToken: 'new_refresh_token',
      };
      
      const loggedInState: AuthState = {
        ...initialState,
        isLoggedIn: true,
        token: 'old_token',
        refreshToken: 'old_refresh_token',
        user: mockUser,
      };
      
      const actual = authReducer(loggedInState, {
        type: 'auth/refreshTokenSuccess',
        payload: refreshData,
      });
      
      expect(actual.token).toBe('new_token');
      expect(actual.refreshToken).toBe('new_refresh_token');
      expect(actual.isLoggedIn).toBe(true);
      expect(actual.user).toEqual(mockUser);
    });

    it('should track login time for token expiry', () => {
      const beforeLogin = Date.now();
      
      const actual = authReducer(initialState, loginSuccess({
        token: 'test_token',
        user: mockUser,
      }));
      
      const afterLogin = Date.now();
      
      expect(actual.lastLoginTime).toBeGreaterThanOrEqual(beforeLogin);
      expect(actual.lastLoginTime).toBeLessThanOrEqual(afterLogin);
    });
  });
});
