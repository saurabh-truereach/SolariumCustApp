/**
 * RTK Query Base Query Configuration
 * Handles JWT token injection, idempotent logout, and error handling
 */

import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query';
import type {RootState} from '../store';
import {logout} from '../store/authSlice';
import {setLoading} from '../store/uiSlice';
import {
  buildApiUrl,
  getRequestHeaders,
  parseApiError,
  isAuthError,
  isRetryableError,
  calculateRetryDelay,
  debugApiCall,
} from '../utils/apiHelpers';
import {AppConfig} from '../config/environments';

/**
 * Enhanced base query result
 */
interface EnhancedBaseQueryResult<T = unknown> {
  data?: T;
  error?: FetchBaseQueryError;
  meta?: {
    request: FetchArgs;
    response?: Response;
    cached?: boolean;
  };
}

/**
 * Idempotent logout state management
 * Prevents multiple logout dispatches for concurrent 401/403 responses
 */
class LogoutManager {
  private isLoggingOut = false;
  private logoutPromise: Promise<void> | null = null;

  async handleLogout(dispatch: any): Promise<void> {
    if (this.isLoggingOut) {
      // If logout is already in progress, wait for it to complete
      return this.logoutPromise || Promise.resolve();
    }

    this.isLoggingOut = true;
    console.log('[API] Initiating idempotent logout');

    this.logoutPromise = new Promise<void>(resolve => {
      setTimeout(() => {
        dispatch(logout());
        console.log('[API] Logout dispatched');
        resolve();
      }, 100); // Small delay to batch concurrent requests
    });

    try {
      await this.logoutPromise;
    } finally {
      // Reset state after a delay to allow for navigation
      setTimeout(() => {
        this.isLoggingOut = false;
        this.logoutPromise = null;
        console.log('[API] Logout manager reset');
      }, 1000);
    }
  }

  isInProgress(): boolean {
    return this.isLoggingOut;
  }
}

// Global logout manager instance
const logoutManager = new LogoutManager();

/**
 * Create the base fetch query
 */
const baseFetchQuery = fetchBaseQuery({
  baseUrl: buildApiUrl(''),
  timeout: AppConfig.API_TIMEOUT,
  prepareHeaders: (headers, {getState}) => {
    const state = getState() as RootState;
    const token = state.auth.token;

    // Add common headers
    const requestHeaders = getRequestHeaders(token);
    Object.entries(requestHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return headers;
  },
});

/**
 * Enhanced base query with retry logic and error handling
 */
const baseQueryWithRetry: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const {dispatch, getState} = api;
  const maxRetries = 3;
  let attempt = 0;

  // Set loading state for non-background requests
  const isBackgroundRequest = typeof args === 'object' && args.background;
  if (!isBackgroundRequest) {
    dispatch(setLoading({isLoading: true}));
  }

  while (attempt <= maxRetries) {
    try {
      const result = await baseFetchQuery(args, api, extraOptions);

      // Debug logging
      if (__DEV__) {
        const url = typeof args === 'string' ? args : args.url;
        const method = typeof args === 'string' ? 'GET' : args.method || 'GET';
        debugApiCall(method, url, args, result.data, result.error);
      }

      // Handle successful response
      if (!result.error) {
        if (!isBackgroundRequest) {
          dispatch(setLoading({isLoading: false}));
        }
        return result;
      }

      // Handle authentication errors with idempotent logout
      if (isAuthError(result.error) && !logoutManager.isInProgress()) {
        console.warn('[API] Authentication error detected:', result.error);
        await logoutManager.handleLogout(dispatch);

        if (!isBackgroundRequest) {
          dispatch(setLoading({isLoading: false}));
        }

        return result; // Return the auth error without retry
      }

      // Handle retryable errors
      if (isRetryableError(result.error) && attempt < maxRetries) {
        const delay = calculateRetryDelay(attempt);
        console.log(
          `[API] Retrying request in ${delay}ms (attempt ${
            attempt + 1
          }/${maxRetries})`
        );

        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
        continue;
      }

      // Non-retryable error or max retries reached
      if (!isBackgroundRequest) {
        dispatch(setLoading({isLoading: false}));
      }

      return result;
    } catch (error) {
      console.error('[API] Unexpected error in baseQuery:', error);

      if (!isBackgroundRequest) {
        dispatch(setLoading({isLoading: false}));
      }

      return {
        error: {
          status: 'FETCH_ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
        } as FetchBaseQueryError,
      };
    }
  }

  // This should never be reached, but TypeScript requires it
  if (!isBackgroundRequest) {
    dispatch(setLoading({isLoading: false}));
  }

  return {
    error: {
      status: 'FETCH_ERROR',
      error: 'Max retries exceeded',
    } as FetchBaseQueryError,
  };
};

/**
 * Base query with additional features
 */
export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQueryWithRetry(args, api, extraOptions);

  // Add request metadata
  const enhancedResult: EnhancedBaseQueryResult = {
    ...result,
    meta: {
      request: typeof args === 'string' ? {url: args} : args,
      cached: false,
    },
  };

  return enhancedResult;
};

/**
 * Transform response to standard format
 */
export const transformResponse = <T>(response: any): T => {
  // Handle different response formats from backend
  if (response?.success !== undefined) {
    // Backend returns {success: boolean, data: T, error?: string}
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'API request failed');
    }
  }

  // Direct data response
  return response;
};

/**
 * Transform error to standard format
 */
export const transformError = (error: FetchBaseQueryError) => {
  return parseApiError(error);
};

/**
 * Create tag for cache invalidation
 */
export const createTag = (type: string, id?: string | number) => {
  return id ? {type, id} : {type, id: 'LIST'};
};

/**
 * Provide tags for cache invalidation
 */
export const provideTags = <T extends {id: string | number}>(
  type: string,
  result?: T[]
) => {
  if (!result) {
    return [{type, id: 'LIST'}];
  }

  return [...result.map(item => createTag(type, item.id)), {type, id: 'LIST'}];
};

/**
 * Invalidate tags for cache updates
 */
export const invalidateTags = (type: string, ids?: (string | number)[]) => {
  if (!ids || ids.length === 0) {
    return [{type, id: 'LIST'}];
  }

  return [...ids.map(id => createTag(type, id)), {type, id: 'LIST'}];
};

export default baseQuery;
