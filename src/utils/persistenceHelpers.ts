/**
 * Persistence Helper Utilities
 * Utilities for managing Redux persistence
 */

import {persistor} from '../store';
import {clearStorage} from './storageHelpers';

/**
 * Persistence operations
 */
export const persistenceHelpers = {
  /**
   * Purge all persisted state
   */
  purgeAll: async (): Promise<void> => {
    try {
      console.log('[Persistence] Purging all persisted state');
      await persistor.purge();
      await clearStorage();
    } catch (error) {
      console.error('[Persistence] Error purging state:', error);
      throw error;
    }
  },

  /**
   * Flush pending persistence operations
   */
  flush: async (): Promise<void> => {
    try {
      console.log('[Persistence] Flushing pending operations');
      await persistor.flush();
    } catch (error) {
      console.error('[Persistence] Error flushing:', error);
      throw error;
    }
  },

  /**
   * Pause persistence
   */
  pause: (): void => {
    console.log('[Persistence] Pausing persistence');
    persistor.pause();
  },

  /**
   * Resume persistence
   */
  persist: (): void => {
    console.log('[Persistence] Resuming persistence');
    persistor.persist();
  },

  /**
   * Get persistence state
   */
  getState: () => {
    return {
      isRehydrated: persistor.getState().bootstrapped,
      registry: persistor.getState().registry,
    };
  },

  /**
   * Reset persistence to initial state
   */
  reset: async (): Promise<void> => {
    try {
      console.log('[Persistence] Resetting to initial state');
      await persistor.purge();
      persistor.persist();
    } catch (error) {
      console.error('[Persistence] Error resetting:', error);
      throw error;
    }
  },

  /**
   * Check if persistence is working
   */
  healthCheck: async (): Promise<boolean> => {
    try {
      const testKey = 'persistence_health_check';
      const testValue = {timestamp: Date.now()};

      // Try to write and read a test value
      await persistor.flush();

      // Check if we can access the underlying storage
      const storage = require('react-native-encrypted-storage').default;
      await storage.setItem(testKey, JSON.stringify(testValue));
      const retrieved = await storage.getItem(testKey);
      await storage.removeItem(testKey);

      return retrieved !== null;
    } catch (error) {
      console.error('[Persistence] Health check failed:', error);
      return false;
    }
  },
};

/**
 * Persistence event listeners
 */
export const createPersistenceListeners = () => {
  const listeners = {
    onRehydrate: (key: string) => {
      console.log(`[Persistence] Rehydrating ${key}`);
    },

    onPause: () => {
      console.log('[Persistence] Persistence paused');
    },

    onPersist: () => {
      console.log('[Persistence] State persisted');
    },

    onError: (error: Error) => {
      console.error('[Persistence] Persistence error:', error);
    },
  };

  return listeners;
};

/**
 * Debug persistence state
 */
export const debugPersistence = () => {
  if (__DEV__) {
    console.group('[Persistence Debug]');
    console.log('Persistor state:', persistor.getState());
    console.log('Is rehydrated:', persistor.getState().bootstrapped);
    console.log('Registry:', persistor.getState().registry);
    console.groupEnd();
  }
};
