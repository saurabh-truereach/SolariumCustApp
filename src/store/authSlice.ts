/**
 * Authentication Slice
 * Manages user authentication state and tokens
 */

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

/**
 * User interface
 */
export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  address?: string;
  state?: string;
  pinCode?: string;
}

/**
 * Authentication State
 */
export interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  lastLoginTime?: number;
  error?: string;
}

/**
 * Initial state
 */
const initialState: AuthState = {
  isLoggedIn: false,
  isLoading: false,
  token: undefined,
  refreshToken: undefined,
  user: undefined,
  lastLoginTime: undefined,
  error: undefined,
};

/**
 * Auth slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginRequest: state => {
      state.isLoading = true;
      state.error = undefined;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        token: string;
        refreshToken?: string;
        user: User;
      }>
    ) => {
      state.isLoggedIn = true;
      state.isLoading = false;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.lastLoginTime = Date.now();
      state.error = undefined;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoggedIn = false;
      state.isLoading = false;
      state.token = undefined;
      state.refreshToken = undefined;
      state.user = undefined;
      state.error = action.payload;
    },

    // Logout action
    logout: state => {
      state.isLoggedIn = false;
      state.isLoading = false;
      state.token = undefined;
      state.refreshToken = undefined;
      state.user = undefined;
      state.lastLoginTime = undefined;
      state.error = undefined;
    },

    // Token refresh
    refreshTokenSuccess: (
      state,
      action: PayloadAction<{token: string; refreshToken?: string}>
    ) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },

    // Clear error
    clearError: state => {
      state.error = undefined;
    },

    // Update user profile
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = {...state.user, ...action.payload};
      }
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  refreshTokenSuccess,
  clearError,
  updateUserProfile,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectIsLoggedIn = (state: {auth: AuthState}) => state.auth.isLoggedIn;
export const selectIsLoading = (state: {auth: AuthState}) => state.auth.isLoading;
export const selectUser = (state: {auth: AuthState}) => state.auth.user;
export const selectToken = (state: {auth: AuthState}) => state.auth.token;
export const selectAuthError = (state: {auth: AuthState}) => state.auth.error;
