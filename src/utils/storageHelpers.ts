/**
 * Storage Helper Utilities
 * Wrapper functions for encrypted storage operations with error handling
 */

import EncryptedStorage from 'react-native-encrypted-storage';

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  NAVIGATION_STATE: 'navigation_state',
  CACHE_DATA: 'cache_data',
} as const;

/**
 * Set item in encrypted storage
 */
export const setStorageItem = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await EncryptedStorage.setItem(key, jsonValue);
    console.log(`[Storage] Successfully set ${key}`);
  } catch (error) {
    console.error(`[Storage] Error setting ${key}:`, error);
    throw new Error(`Failed to save ${key} to storage`);
  }
};

/**
 * Get item from encrypted storage
 */
export const getStorageItem = async <T = any>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await EncryptedStorage.getItem(key);
    if (jsonValue === null) {
      console.log(`[Storage] No value found for ${key}`);
      return null;
    }
    const parsedValue = JSON.parse(jsonValue);
    console.log(`[Storage] Successfully retrieved ${key}`);
    return parsedValue;
  } catch (error) {
    console.error(`[Storage] Error getting ${key}:`, error);
    return null; // Return null instead of throwing to prevent app crashes
  }
};

/**
 * Remove item from encrypted storage
 */
export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    await EncryptedStorage.removeItem(key);
    console.log(`[Storage] Successfully removed ${key}`);
  } catch (error) {
    console.error(`[Storage] Error removing ${key}:`, error);
    throw new Error(`Failed to remove ${key} from storage`);
  }
};

/**
 * Clear all storage
 */
export const clearStorage = async (): Promise<void> => {
  try {
    await EncryptedStorage.clear();
    console.log('[Storage] Successfully cleared all storage');
  } catch (error) {
    console.error('[Storage] Error clearing storage:', error);
    throw new Error('Failed to clear storage');
  }
};

/**
 * Check if storage item exists
 */
export const hasStorageItem = async (key: string): Promise<boolean> => {
  try {
    const value = await EncryptedStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`[Storage] Error checking ${key}:`, error);
    return false;
  }
};

/**
 * Get multiple storage items at once
 */
export const getMultipleStorageItems = async <T = any>(keys: string[]): Promise<Record<string, T | null>> => {
  const result: Record<string, T | null> = {};
  
  await Promise.all(
    keys.map(async (key) => {
      result[key] = await getStorageItem<T>(key);
    })
  );
  
  return result;
};

/**
 * Set multiple storage items at once
 */
export const setMultipleStorageItems = async (items: Record<string, any>): Promise<void> => {
  const promises = Object.entries(items).map(([key, value]) => 
    setStorageItem(key, value)
  );
  
  await Promise.all(promises);
};