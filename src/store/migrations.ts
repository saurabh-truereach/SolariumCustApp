/**
 * Redux Persist Migrations
 * Handles state migrations between app versions
 */

import {PersistedState} from 'redux-persist';

/**
 * Migration type definition
 */
export interface MigrationManifest {
  [key: string]: (state: PersistedState) => PersistedState;
}

/**
 * Migration from version 0 to 1
 * Initial migration - adds version field
 */
const migration0to1 = (state: PersistedState): PersistedState => {
  console.log('[Migration] Running migration 0 -> 1');

  return {
    ...state,
    _persist: {
      ...state._persist,
      version: 1,
    },
  };
};

/**
 * Migration from version 1 to 2
 * Example: Restructure auth state
 */
const migration1to2 = (state: PersistedState): PersistedState => {
  console.log('[Migration] Running migration 1 -> 2');

  // Example migration logic
  const typedState = state as any;

  if (typedState.auth) {
    // Example: Move phone to user object if it exists separately
    if (typedState.auth.phone && !typedState.auth.user?.phone) {
      typedState.auth.user = {
        ...typedState.auth.user,
        phone: typedState.auth.phone,
      };
      delete typedState.auth.phone;
    }
  }

  return {
    ...typedState,
    _persist: {
      ...state._persist,
      version: 2,
    },
  };
};

/**
 * Migration manifest
 * Maps version numbers to migration functions
 */
export const migrations: MigrationManifest = {
  0: migration0to1,
  1: migration1to2,
  // Add more migrations as needed
  // 2: migration2to3,
  // 3: migration3to4,
};

/**
 * Get current migration version
 */
export const getCurrentVersion = (): number => {
  return Math.max(...Object.keys(migrations).map(Number)) + 1;
};

/**
 * Validate persisted state
 */
export const validatePersistedState = (state: any): boolean => {
  try {
    // Basic validation
    if (!state || typeof state !== 'object') {
      return false;
    }

    // Check for required structure
    if (state.auth && typeof state.auth !== 'object') {
      return false;
    }

    // Validate auth state structure
    if (state.auth?.user) {
      const user = state.auth.user;
      if (!user.id || !user.phone) {
        console.warn('[Persist] Invalid user structure, will reset');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('[Persist] State validation error:', error);
    return false;
  }
};
