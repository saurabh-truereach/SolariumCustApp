/**
 * Authentication Slice
 * Manages user authentication state and tokens with async thunks
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {setStorageItem, removeStorageItem, STORAGE_KEYS} from '../utils/storageHelpers';

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
  isSendingOtp: boolean;
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
  isSendingOtp: false,
  token: undefined,
  refreshToken: undefined,
  user: undefined,
  lastLoginTime: undefined,
  error: undefined,
};

// ===============================
// ASYNC THUNKS
// ===============================

/**
 * Send OTP Async Thunk
 */
export const sendOtpThunk = createAsyncThunk(
  'auth/sendOtp',
  async (phone: string, {rejectWithValue}) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app, this would call your OTP API
      // const response = await otpService.sendOtp(phone);
      
      // For demo, always succeed
      console.log(`[Auth] OTP sent to ${phone}`);
      return {phone};
    } catch (error: any) {
      console.error('[Auth] Send OTP error:', error);
      return rejectWithValue(error.message || 'Failed to send OTP');
    }
  }
);

/**
 * Login with OTP Async Thunk
 */
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({phone, otp}: {phone: string; otp: string}, {rejectWithValue}) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Demo validation
      if (otp !== '123456') {
        return rejectWithValue('Invalid OTP. Please try again.');
      }
      
      // In real app, this would call your login API
      // const response = await authService.login({phone, otp});
      
      const authData = {
        token: 'demo_token_' + Date.now(),
        refreshToken: 'demo_refresh_' + Date.now(),
        user: {
          id: 'user_1',
          phone: phone,
          name: 'Demo User',
          email: 'demo@example.com',
        },
      };
      
      // Store auth data
      await setStorageItem(STORAGE_KEYS.AUTH_TOKEN, authData.token);
      await setStorageItem(STORAGE_KEYS.USER_DATA, authData.user);
      
      console.log('[Auth] Login successful');
      return authData;
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

/**
 * Logout Async Thunk
 */
export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, {rejectWithValue}) => {
    try {
      // Remove stored auth data
      await removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      await removeStorageItem(STORAGE_KEYS.USER_DATA);
      
      // In real app, call logout API to invalidate token
      // await authService.logout();
      
      console.log('[Auth] Logout successful');
      return true;
    } catch (error: any) {
      console.error('[Auth] Logout error:', error);
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

/**
 * Refresh Token Async Thunk
 */
export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, {getState, rejectWithValue}) => {
    try {
      const state = getState() as {auth: AuthState};
      const {refreshToken} = state.auth;
      
      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, call refresh token API
      // const response = await authService.refreshToken(refreshToken);
      
      const newTokens = {
        token: 'refreshed_token_' + Date.now(),
        refreshToken: 'refreshed_refresh_' + Date.now(),
      };
      
      // Store new token
      await setStorageItem(STORAGE_KEYS.AUTH_TOKEN, newTokens.token);
      
      console.log('[Auth] Token refreshed successfully');
      return newTokens;
    } catch (error: any) {
      console.error('[Auth] Token refresh error:', error);
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);



// ===============================
// SLICE
// ===============================

/**
 * Auth slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Manual loading control
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
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

    // Legacy actions for compatibility (keeping them for now)
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
    logout: state => {
      state.isLoggedIn = false;
      state.isLoading = false;
      state.token = undefined;
      state.refreshToken = undefined;
      state.user = undefined;
      state.lastLoginTime = undefined;
      state.error = undefined;
    },
  },
  extraReducers: builder => {
    // Send OTP
    builder
      .addCase(sendOtpThunk.pending, state => {
        state.isSendingOtp = true;
        state.error = undefined;
      })
      .addCase(sendOtpThunk.fulfilled, state => {
        state.isSendingOtp = false;
        state.error = undefined;
      })
      .addCase(sendOtpThunk.rejected, (state, action) => {
        state.isSendingOtp = false;
        state.error = action.payload as string;
      })
      
      // Login
      .addCase(loginThunk.pending, state => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.lastLoginTime = Date.now();
        state.error = undefined;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.token = undefined;
        state.refreshToken = undefined;
        state.user = undefined;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logoutThunk.pending, state => {
        state.isLoading = true;
      })
      .addCase(logoutThunk.fulfilled, state => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.token = undefined;
        state.refreshToken = undefined;
        state.user = undefined;
        state.lastLoginTime = undefined;
        state.error = undefined;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Refresh Token
      .addCase(refreshTokenThunk.pending, state => {
        state.isLoading = true;
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
        state.error = undefined;
      })
      .addCase(refreshTokenThunk.rejected, (state, action) => {
        state.isLoading = false;
        // If refresh fails, consider logging out
        if (action.payload === 'No refresh token available') {
          state.isLoggedIn = false;
          state.token = undefined;
          state.refreshToken = undefined;
          state.user = undefined;
        }
        state.error = action.payload as string;
      })
      

  },
});

export const {
  setLoading,
  clearError,
  updateUserProfile,
  // Legacy actions (for compatibility)
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
} = authSlice.actions;

export default authSlice.reducer;

// ===============================
// SELECTORS
// ===============================

export const selectIsLoggedIn = (state: {auth: AuthState}) => state.auth.isLoggedIn;
export const selectIsLoading = (state: {auth: AuthState}) => state.auth.isLoading;
export const selectIsSendingOtp = (state: {auth: AuthState}) => state.auth.isSendingOtp;
export const selectUser = (state: {auth: AuthState}) => state.auth.user;
export const selectToken = (state: {auth: AuthState}) => state.auth.token;
export const selectAuthError = (state: {auth: AuthState}) => state.auth.error;
