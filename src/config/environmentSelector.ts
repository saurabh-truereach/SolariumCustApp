/**
 * Environment Selector
 * Provides manual environment switching for development/testing
 * This is useful for testing different environments without rebuilding
 */

import {Environment} from './environments';

let selectedEnvironment: Environment | null = null;

/**
 * Manually set environment (for development/testing only)
 * This overrides the automatic environment detection
 */
export const setEnvironment = (env: Environment): void => {
  if (__DEV__) {
    selectedEnvironment = env;
    console.log(`[Environment] Manually set to: ${env}`);
  } else {
    console.warn('[Environment] Manual environment setting disabled in production');
  }
};

/**
 * Get manually selected environment
 */
export const getSelectedEnvironment = (): Environment | null => {
  return selectedEnvironment;
};

/**
 * Reset to automatic environment detection
 */
export const resetEnvironment = (): void => {
  selectedEnvironment = null;
  console.log('[Environment] Reset to automatic detection');
};

/**
 * Get current effective environment (manual override or automatic)
 */
export const getEffectiveEnvironment = (): Environment => {
  if (__DEV__ && selectedEnvironment) {
    return selectedEnvironment;
  }
  
  // Fallback to automatic detection
  return __DEV__ ? 'development' : 'production';
};
