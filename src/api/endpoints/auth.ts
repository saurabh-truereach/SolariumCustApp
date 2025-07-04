/**
 * Authentication API Endpoints
 * Handles user authentication, registration, and profile management
 */

import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery, transformResponse, transformError} from '../baseQuery';
import type {User} from '../../store/authSlice';

/**
 * Auth API Request Types
 */
export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface RegisterUserRequest {
  phone: string;
  otp: string;
  name: string;
  email?: string;
  address?: string;
  state?: string;
  pinCode?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  address?: string;
  state?: string;
  pinCode?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Auth API Response Types
 */
export interface SendOtpResponse {
  message: string;
  otpSent: boolean;
  expiresIn: number; // seconds
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * Auth API Definition
 */
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['User', 'Auth'],
  endpoints: (builder) => ({
    /**
     * Send OTP to phone number
     */
    sendOtp: builder.mutation<SendOtpResponse, SendOtpRequest>({
      // query: (data) => ({
      //   url: 'auth/send-otp',
      //   method: 'POST',
      //   body: data,
      // }),
      transformResponse: transformResponse<SendOtpResponse>,
      transformErrorResponse: transformError,
      // Demo implementation
      queryFn: async (arg, queryApi, extraOptions, baseQuery) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Demo: Always succeed for valid phone numbers
        if (!/^[0-9]{10}$/.test(arg.phone)) {
          return {
            error: {
              status: 400,
              data: {
                success: false,
                error: {
                  message: 'Invalid phone number format',
                  code: 400,
                },
              },
            },
          };
        }

        return {
          data: {
            message: `OTP sent to ${arg.phone}`,
            otpSent: true,
            expiresIn: 300, // 5 minutes
          },
        };
      },
    }),

    /**
     * Verify OTP and login
     */
    verifyOtp: builder.mutation<AuthResponse, VerifyOtpRequest>({
      // query: (data) => ({
      //   url: 'auth/verify-otp',
      //   method: 'POST',
      //   body: data,
      // }),
      transformResponse: transformResponse<AuthResponse>,
      transformErrorResponse: transformError,
      invalidatesTags: ['User', 'Auth'],
      // Demo implementation
      queryFn: async (arg, queryApi, extraOptions, baseQuery) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Demo: Only accept OTP 123456
        if (arg.otp !== '123456') {
          return {
            error: {
              status: 401,
              data: {
                success: false,
                error: {
                  message: 'Invalid OTP. Please try again.',
                  code: 401,
                },
              },
            },
          };
        }

        const user: User = {
          id: `user_${Date.now()}`,
          phone: arg.phone,
          name: 'Demo User',
          email: 'demo@solarium.com',
        };

        return {
          data: {
            user,
            token: `demo_token_${Date.now()}`,
            refreshToken: `demo_refresh_${Date.now()}`,
            expiresIn: 86400, // 24 hours
          },
        };
      },
    }),

    /**
     * Register new user
     */
    registerUser: builder.mutation<AuthResponse, RegisterUserRequest>({
      query: (data) => ({
        url: 'auth/register',
        method: 'POST',
        body: data,
      }),
      transformResponse: transformResponse<AuthResponse>,
      transformErrorResponse: transformError,
      invalidatesTags: ['User', 'Auth'],
    }),

    /**
     * Refresh access token
     */
    refreshToken: builder.mutation<RefreshTokenResponse, {refreshToken: string}>({
      query: (data) => ({
        url: 'auth/refresh-token',
        method: 'POST',
        body: data,
      }),
      transformResponse: transformResponse<RefreshTokenResponse>,
      transformErrorResponse: transformError,
    }),

    /**
     * Get current user profile
     */
    getCurrentUser: builder.query<User, void>({
      query: () => 'auth/me',
      transformResponse: transformResponse<User>,
      transformErrorResponse: transformError,
      providesTags: ['User'],
    }),

    /**
     * Update user profile
     */
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (data) => ({
        url: 'auth/profile',
        method: 'PUT',
        body: data,
      }),
      transformResponse: transformResponse<User>,
      transformErrorResponse: transformError,
      invalidatesTags: ['User'],
    }),

    /**
     * Change password
     */
    changePassword: builder.mutation<{message: string}, ChangePasswordRequest>({
      query: (data) => ({
        url: 'auth/change-password',
        method: 'POST',
        body: data,
      }),
      transformResponse: transformResponse<{message: string}>,
      transformErrorResponse: transformError,
    }),

    /**
     * Logout user
     */
    logoutUser: builder.mutation<{message: string}, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
      transformResponse: transformResponse<{message: string}>,
      transformErrorResponse: transformError,
      invalidatesTags: ['User', 'Auth'],
    }),

    /**
     * Delete user account
     */
    deleteAccount: builder.mutation<{message: string}, {password: string}>({
      query: (data) => ({
        url: 'auth/delete-account',
        method: 'DELETE',
        body: data,
      }),
      transformResponse: transformResponse<{message: string}>,
      transformErrorResponse: transformError,
      invalidatesTags: ['User', 'Auth'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRegisterUserMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useLogoutUserMutation,
  useDeleteAccountMutation,
} = authApi;

export default authApi;
