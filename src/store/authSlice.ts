/**
 * Authentication Slice
 * Manages user authentication state and tokens with async thunks
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {setStorageItem, removeStorageItem, STORAGE_KEYS} from '../utils/storageHelpers';
import {authApi} from '../api/endpoints/auth';

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
 * Login with phone and OTP
 */
export const loginWithOtp = createAsyncThunk(
  'auth/loginWithOtp',
  async (
    {phone, otp}: {phone: string; otp: string},
    {rejectWithValue}
  ) => {
    try {
      // Simulate API call - replace with real API in later tasks
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Demo: Accept OTP 123456, reject others
      if (otp !== '123456') {
        throw new Error('Invalid OTP. Please try again.');
      }

      const user: User = {
        id: `user_${Date.now()}`,
        phone,
        name: 'Demo User',
        email: 'demo@solarium.com',
      };

      const token = `demo_token_${Date.now()}`;
      
      // Store in encrypted storage
      await setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await setStorageItem(STORAGE_KEYS.USER_DATA, user);

      return {token, user};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

/**
 * Logout and clear storage
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, {}) => {
    try {
      // Clear encrypted storage
      await removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      await removeStorageItem(STORAGE_KEYS.USER_DATA);
      
      // In real app, call logout API to invalidate token
      // await authService.logout();
      
      console.log('[Auth] Logout successful');
      return true;
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      // Still dispatch logout even if storage clear fails
      return true;
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

/**
 * Enhanced login with RTK Query integration
 */
export const loginWithOtpEnhanced = createAsyncThunk(
  'auth/loginWithOtpEnhanced',
  async (
    {phone, otp}: {phone: string; otp: string},
    {dispatch, rejectWithValue}
  ) => {
    try {
      // Use RTK Query mutation
      const result = await dispatch(
        authApi.endpoints.verifyOtp.initiate({phone, otp})
      ).unwrap();

      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

/**
 * Enhanced logout with API call
 */
export const logoutUserEnhanced = createAsyncThunk(
  'auth/logoutUserEnhanced',
  async (_, {dispatch}) => {
    try {
      // Call logout API (optional - for server-side session cleanup)
      try {
        await dispatch(authApi.endpoints.logoutUser.initiate()).unwrap();
      } catch (error) {
        // Continue with logout even if API call fails
        console.warn('[Auth] Logout API call failed, continuing with local logout:', error);
      }

      // Clear local storage
      await removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      await removeStorageItem(STORAGE_KEYS.USER_DATA);
      
      // Reset API cache
      dispatch(authApi.util.resetApiState());
      
      return true;
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      // Still return success for local logout
      return true;
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
      .addCase(loginWithOtp.pending, state => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(loginWithOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.token = action.payload.token;
        // state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.lastLoginTime = Date.now();
        state.error = undefined;
      })
      .addCase(loginWithOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.token = undefined;
        state.refreshToken = undefined;
        state.user = undefined;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logoutUser.pending, state => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.token = undefined;
        state.refreshToken = undefined;
        state.user = undefined;
        state.lastLoginTime = undefined;
        state.error = undefined;
      })
      .addCase(logoutUser.rejected, (state, action) => {
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
      .addCase(loginWithOtpEnhanced.pending, state => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(loginWithOtpEnhanced.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.lastLoginTime = Date.now();
        state.error = undefined;
      })
      .addCase(loginWithOtpEnhanced.rejected, (state, action) => {
        state.isLoggedIn = false;
        state.isLoading = false;
        state.token = undefined;
        state.refreshToken = undefined;
        state.user = undefined;
        state.error = action.payload as string;
      })
      .addCase(logoutUserEnhanced.fulfilled, state => {
        state.isLoggedIn = false;
        state.isLoading = false;
        state.token = undefined;
        state.refreshToken = undefined;
        state.user = undefined;
        state.lastLoginTime = undefined;
        state.error = undefined;
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
