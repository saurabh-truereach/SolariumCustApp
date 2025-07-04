/**
 * API Helper Utilities
 * Common utilities for API operations
 */

import {AppConfig} from '../config/environments';

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  message?: string;
}

export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

/**
 * API Request Types
 */
export interface PaginatedRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request configuration
 */
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Build API URL with base URL
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = AppConfig.BASE_API_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  return `${baseUrl}/api/v1/${cleanEndpoint}`;
};

/**
 * Build query parameters string
 */
export const buildQueryParams = (params: Record<string, any>): string => {
  const cleanParams = Object.entries(params)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== ''
    )
    .map(([key, value]) => [key, String(value)]);

  if (cleanParams.length === 0) {
    return '';
  }

  const searchParams = new URLSearchParams(cleanParams);
  return `?${searchParams.toString()}`;
};

/**
 * Get request headers with common defaults
 */
export const getRequestHeaders = (
  token?: string,
  additionalHeaders?: Record<string, string>
): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-App-Version': '1.0.0',
    'X-Platform': 'mobile',
    ...additionalHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Parse API error response
 */
export const parseApiError = (error: any): ApiError => {
  // Handle different error formats
  if (error?.data?.error) {
    return {
      code: error.status || 500,
      message: error.data.error.message || 'An error occurred',
      details: error.data.error.details,
    };
  }

  if (error?.data?.message) {
    return {
      code: error.status || 500,
      message: error.data.message,
      details: error.data,
    };
  }

  if (error?.message) {
    return {
      code: error.status || 500,
      message: error.message,
      details: error,
    };
  }

  return {
    code: error?.status || 500,
    message: 'An unexpected error occurred',
    details: error,
  };
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error?.name === 'NetworkError' ||
    error?.code === 'NETWORK_ERROR' ||
    error?.status === 0 ||
    !navigator.onLine
  );
};

/**
 * Check if error requires authentication
 */
export const isAuthError = (error: any): boolean => {
  return error?.status === 401 || error?.status === 403;
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: any): boolean => {
  if (isNetworkError(error)) {
    return true;
  }

  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(error?.status);
};

/**
 * Calculate retry delay with exponential backoff
 */
export const calculateRetryDelay = (
  attempt: number,
  baseDelay: number = 1000
): number => {
  // Exponential backoff: baseDelay * 2^attempt + random jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Add up to 1 second of jitter
  return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
};

/**
 * Format file size for uploads
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Validate file for upload
 */
export const validateFileUpload = (
  file: {size: number; type: string; name: string},
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): {valid: boolean; error?: string} => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${formatFileSize(maxSize)}`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  const extension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension ${extension} is not allowed`,
    };
  }

  return {valid: true};
};

/**
 * Debug API request/response
 */
export const debugApiCall = (
  method: string,
  url: string,
  request?: any,
  response?: any,
  error?: any
) => {
  if (!__DEV__) {
    return;
  }

  console.group(`[API] ${method} ${url}`);

  if (request) {
    console.log('Request:', request);
  }

  if (response) {
    console.log('Response:', response);
  }

  if (error) {
    console.error('Error:', error);
  }

  console.groupEnd();
};
