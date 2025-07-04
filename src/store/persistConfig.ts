/**
 * Redux Persist Configuration
 * Minimal but effective persistence setup with security
 */

import EncryptedStorage from 'react-native-encrypted-storage';

/**
 * Auth transform to filter sensitive data and handle token expiration
 */
const authTransform = {
  in: (inboundState: any) => {
    // Filter out sensitive data before persisting
    if (inboundState?.user?.password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {password, ...userWithoutPassword} = inboundState.user;
      return {
        ...inboundState,
        user: userWithoutPassword,
      };
    }
    return inboundState;
  },
  out: (outboundState: any) => {
    // Check token expiration on rehydration
    if (outboundState?.lastLoginTime) {
      const tokenAge = Date.now() - outboundState.lastLoginTime;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (tokenAge > maxAge) {
        console.log('[Persist] Token expired, clearing auth state');
        return {
          ...outboundState,
          isLoggedIn: false,
          token: undefined,
          refreshToken: undefined,
          user: undefined,
          lastLoginTime: undefined,
        };
      }
    }
    return outboundState;
  },
};

/**
 * Enhanced persist configuration
 */
export const persistConfig = {
  key: 'root',
  storage: EncryptedStorage,
  whitelist: ['auth'], // Only persist auth state
  blacklist: ['ui'], // Never persist UI state
  transforms: [
    {
      key: 'auth',
      ...authTransform,
    },
  ],
  timeout: 10000, // 10 second timeout
  version: 1,
  writeFailHandler: (err: Error) => {
    console.error('[Persist] Write failed:', err);
  },
};
