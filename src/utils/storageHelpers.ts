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

export const API_CACHE_KEYS = {
  SERVICES: 'api_cache_services',
  SERVICE_CATEGORIES: 'api_cache_service_categories',
  USER_LEADS: 'api_cache_user_leads',
  OFFLINE_QUEUE: 'api_offline_queue',
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

/**
 * Persistence-specific storage operations
 */

/**
 * Check storage quota and usage
 */
export const getStorageInfo = async (): Promise<{
  available: boolean;
  quota?: number;
  usage?: number;
}> => {
  try {
    // Test if storage is available
    const testKey = 'storage_test';
    const testValue = 'test';
    
    await setStorageItem(testKey, testValue);
    const retrieved = await getStorageItem(testKey);
    await removeStorageItem(testKey);
    
    return {
      available: retrieved === testValue,
      // Note: React Native doesn't provide quota info
      quota: undefined,
      usage: undefined,
    };
  } catch (error) {
    console.error('[Storage] Storage info check failed:', error);
    return {available: false};
  }
};

/**
 * Backup current storage to a JSON object
 */
export const backupStorage = async (): Promise<Record<string, any>> => {
  try {
    const backup: Record<string, any> = {};
    
    // Get all known keys
    const keys = Object.values(STORAGE_KEYS);
    
    for (const key of keys) {
      const value = await getStorageItem(key);
      if (value !== null) {
        backup[key] = value;
      }
    }
    
    return backup;
  } catch (error) {
    console.error('[Storage] Backup failed:', error);
    throw error;
  }
};

/**
 * Restore storage from backup
 */
export const restoreStorage = async (backup: Record<string, any>): Promise<void> => {
  try {
    for (const [key, value] of Object.entries(backup)) {
      if (value !== null) {
        await setStorageItem(key, value);
      }
    }
  } catch (error) {
    console.error('[Storage] Restore failed:', error);
    throw error;
  }
};

/**
 * Migrate storage data
 */
export const migrateStorage = async (
  fromVersion: number,
  toVersion: number,
  migrationFn: (data: any) => any
): Promise<void> => {
  try {
    console.log(`[Storage] Migrating from version ${fromVersion} to ${toVersion}`);
    
    // Backup current data
    const backup = await backupStorage();
    
    // Apply migration
    const migratedData = migrationFn(backup);
    
    // Clear current storage
    await clearStorage();
    
    // Restore migrated data
    await restoreStorage(migratedData);
    
    console.log('[Storage] Migration completed successfully');
  } catch (error) {
    console.error('[Storage] Migration failed:', error);
    throw error;
  }
};

/**
 * Store API cache data
 */
export const setApiCache = async (key: string, data: any, ttl?: number): Promise<void> => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      ttl: ttl || 5 * 60 * 1000, // Default 5 minutes
    };
    
    await setStorageItem(key, cacheItem);
  } catch (error) {
    console.error(`[Storage] Error setting API cache ${key}:`, error);
  }
};

/**
 * Get API cache data
 */
export const getApiCache = async <T = any>(key: string): Promise<T | null> => {
  try {
    const cacheItem = await getStorageItem<{
      data: T;
      timestamp: number;
      ttl: number;
    }>(key);
    
    if (!cacheItem) {
      return null;
    }
    
    // Check if cache is expired
    const now = Date.now();
    if (now - cacheItem.timestamp > cacheItem.ttl) {
      console.log(`[Storage] Cache expired for ${key}`);
      await removeStorageItem(key);
      return null;
    }
    
    return cacheItem.data;
  } catch (error) {
    console.error(`[Storage] Error getting API cache ${key}:`, error);
    return null;
  }
};

/**
 * Clear expired API cache
 */
export const clearExpiredApiCache = async (): Promise<void> => {
  try {
    const cacheKeys = Object.values(API_CACHE_KEYS);
    const now = Date.now();
    
    for (const key of cacheKeys) {
      const cacheItem = await getStorageItem<{
        timestamp: number;
        ttl: number;
      }>(key);
      
      if (cacheItem && now - cacheItem.timestamp > cacheItem.ttl) {
        await removeStorageItem(key);
        console.log(`[Storage] Cleared expired cache: ${key}`);
      }
    }
  } catch (error) {
    console.error('[Storage] Error clearing expired cache:', error);
  }
};

/**
 * Clear all API cache
 */
export const clearAllApiCache = async (): Promise<void> => {
  try {
    const cacheKeys = Object.values(API_CACHE_KEYS);
    await Promise.all(cacheKeys.map(key => removeStorageItem(key)));
    console.log('[Storage] Cleared all API cache');
  } catch (error) {
    console.error('[Storage] Error clearing API cache:', error);
  }
};

/**
 * Store offline API request
 */
export const storeOfflineRequest = async (request: {
  endpoint: string;
  method: string;
  body?: any;
  timestamp: number;
}): Promise<void> => {
  try {
    const queue = await getStorageItem<typeof request[]>(API_CACHE_KEYS.OFFLINE_QUEUE) || [];
    queue.push(request);
    await setStorageItem(API_CACHE_KEYS.OFFLINE_QUEUE, queue);
  } catch (error) {
    console.error('[Storage] Error storing offline request:', error);
  }
};

/**
 * Get offline requests queue
 */
export const getOfflineRequestsQueue = async (): Promise<any[]> => {
  try {
    return await getStorageItem<any[]>(API_CACHE_KEYS.OFFLINE_QUEUE) || [];
  } catch (error) {
    console.error('[Storage] Error getting offline queue:', error);
    return [];
  }
};

/**
 * Clear offline requests queue
 */
export const clearOfflineRequestsQueue = async (): Promise<void> => {
  try {
    await removeStorageItem(API_CACHE_KEYS.OFFLINE_QUEUE);
  } catch (error) {
    console.error('[Storage] Error clearing offline queue:', error);
  }
};
