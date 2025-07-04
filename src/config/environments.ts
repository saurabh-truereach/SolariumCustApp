/**
 * Environment Configuration
 * Manual environment loader with type safety and fallbacks
 */

export type Environment = 'development' | 'staging' | 'production';

export interface ApiConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
  enableLogging: boolean;
  enableOfflineCache: boolean;
}

export interface AppConfig {
  BASE_API_URL: string;
  APP_ENV: Environment;
  API_TIMEOUT: number;
  DEBUG_MODE: boolean;
  // Add new API configuration
  API_CONFIG: ApiConfig;
}

/**
 * Environment configurations
 * In a real app, these would come from build-time variables
 * For now, we'll determine environment based on __DEV__ flag
 */
const environments: Record<Environment, AppConfig> = {
  development: {
    BASE_API_URL: 'https://api.dev.solarium.in',
    APP_ENV: 'development',
    API_TIMEOUT: 10000,
    DEBUG_MODE: true,
    API_CONFIG: {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      enableLogging: true,
      enableOfflineCache: true,
    },
  },
  staging: {
    BASE_API_URL: 'https://api.staging.solarium.in',
    APP_ENV: 'staging',
    API_TIMEOUT: 10000,
    DEBUG_MODE: true,
    API_CONFIG: {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      enableLogging: true,
      enableOfflineCache: true,
    },
  },
  production: {
    BASE_API_URL: 'https://api.solarium.in',
    APP_ENV: 'production',
    API_TIMEOUT: 8000,
    DEBUG_MODE: false,
    API_CONFIG: {
      timeout: 8000,
      retries: 3,
      retryDelay: 2000,
      enableLogging: false,
      enableOfflineCache: false,
    },
  },
};

/**
 * Determine current environment
 * Uses __DEV__ flag to determine if we're in development
 * In the future, this can be enhanced with build-time environment detection
 */
const getCurrentEnvironment = (): Environment => {
  // For now, use __DEV__ to determine environment
  // In production builds, __DEV__ will be false
  if (__DEV__) {
    return 'development';
  }

  // In a real deployment, you might check other indicators
  // like bundle ID, build configuration, etc.
  return 'production';
};

/**
 * Get current app configuration
 */
export const getAppConfig = (): AppConfig => {
  const currentEnv = getCurrentEnvironment();
  const config = environments[currentEnv];

  // Log configuration for debugging (only in debug mode)
  if (config.DEBUG_MODE) {
    console.log(`[Environment] Current: ${currentEnv}`);
    console.log(`[Environment] Config:`, config);
  }

  return config;
};

/**
 * Export the current configuration
 */
export const AppConfig = getAppConfig();

/**
 * Utility function to check if we're in development
 */
export const isDevelopment = (): boolean => AppConfig.APP_ENV === 'development';

/**
 * Utility function to check if we're in production
 */
export const isProduction = (): boolean => AppConfig.APP_ENV === 'production';

/**
 * Utility function to get API base URL
 */
export const getApiBaseUrl = (): string => AppConfig.BASE_API_URL;

/**
 * Get API configuration
 */
export const getApiConfig = (): ApiConfig => AppConfig.API_CONFIG;

/**
 * Check if API logging is enabled
 */
export const isApiLoggingEnabled = (): boolean =>
  AppConfig.API_CONFIG.enableLogging;

/**
 * Check if offline cache is enabled
 */
export const isOfflineCacheEnabled = (): boolean =>
  AppConfig.API_CONFIG.enableOfflineCache;
