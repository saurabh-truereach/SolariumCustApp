/**
 * Redux Store Configuration
 * Enhanced with RTK Query APIs
 */

import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {persistReducer, persistStore} from 'redux-persist';
import {FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER} from 'redux-persist';
import {setupListeners} from '@reduxjs/toolkit/query';

// Existing reducers
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import cacheReducer from './cacheSlice';
import {persistConfig} from './persistConfig';
import {validatePersistedState} from './migrations';

// API reducers
import {authApi, servicesApi, leadsApi} from '../api/endpoints';

/**
 * Root reducer with API slices
 */
const rootReducer = combineReducers({
  // Data slices
  auth: authReducer,
  ui: uiReducer,
  cache: cacheReducer,
  
  // API slices
  [authApi.reducerPath]: authApi.reducer,
  [servicesApi.reducerPath]: servicesApi.reducer,
  [leadsApi.reducerPath]: leadsApi.reducer,
});

/**
 * Enhanced persist configuration
 */
const enhancedPersistConfig = {
  ...persistConfig,
  // Don't persist API cache - it should be fresh on app start
  blacklist: [
    'ui',
    authApi.reducerPath,
    servicesApi.reducerPath,
    leadsApi.reducerPath,
  ],
};

/**
 * Enhanced persistor with validation
 * Persisted reducer
 */
const createPersistedReducer = () => {
  return persistReducer(
    {
      ...enhancedPersistConfig,
      stateReconciler: (inboundState: any, originalState: any) => {
        // Validate inbound state before reconciling
        if (!validatePersistedState(inboundState)) {
          console.warn('[Store] Invalid persisted state, using original state');
          return originalState;
        }
        
        // Custom reconciliation logic
        return {
          ...originalState,
          ...inboundState,
        };
      },
    },
    rootReducer
  );
};

/**
 * Configure store with API middleware
 */
export const store = configureStore({
  reducer: createPersistedReducer(),
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          // RTK Query actions
          'authApi/executeQuery/pending',
          'authApi/executeQuery/fulfilled',
          'authApi/executeQuery/rejected',
          'authApi/executeMutation/pending',
          'authApi/executeMutation/fulfilled',
          'authApi/executeMutation/rejected',
          'servicesApi/executeQuery/pending',
          'servicesApi/executeQuery/fulfilled',
          'servicesApi/executeQuery/rejected',
          'leadsApi/executeQuery/pending',
          'leadsApi/executeQuery/fulfilled',
          'leadsApi/executeQuery/rejected',
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: [
          'meta.arg',
          'payload.timestamp',
          'meta.baseQueryMeta',
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'items.dates',
          `${authApi.reducerPath}.queries`,
          `${authApi.reducerPath}.mutations`,
          `${servicesApi.reducerPath}.queries`,
          `${servicesApi.reducerPath}.mutations`,
          `${leadsApi.reducerPath}.queries`,
          `${leadsApi.reducerPath}.mutations`,
        ],
      },
      thunk: {
        extraArgument: {
          // Add any extra arguments for thunks here
        },
      },
    })
    // Add RTK Query middleware
    .concat(authApi.middleware)
    .concat(servicesApi.middleware)
    .concat(leadsApi.middleware),
  devTools: __DEV__ && {
    name: 'Solarium Customer App',
    trace: true,
    traceLimit: 25,
    // Add RTK Query devtools support
    actionSanitizer: (action) => {
      if (action.type?.includes('executeQuery') || action.type?.includes('executeMutation')) {
        return {
          ...action,
          // Sanitize large payloads for devtools
          payload: action.payload ? '[API Payload]' : action.payload,
        };
      }
      return action;
    },
  },
  enhancers: (getDefaultEnhancers) => {
    return getDefaultEnhancers({
      autoBatch: true,
    });
  },
});

/**
 * Create persistor with enhanced error handling
 */
export const persistor = persistStore(store, {
  manualPersist: false,
}, () => {
  console.log('[Store] Persistence initialization complete');
  
  // Debug info in development
  if (__DEV__) {
    console.log('[Store] Initial state:', store.getState());
  }
});

/**
 * Setup RTK Query listeners for refetch on focus/reconnect
 */
setupListeners(store.dispatch);

/**
 * Error handling for persistor
 */
persistor.subscribe(() => {
  const state = persistor.getState();
  
  if (state.bootstrapped) {
    console.log('[Store] Rehydration complete');
  }
  
  if (state.registry.length > 0) {
    console.log('[Store] Registered persistors:', state.registry);
  }
});

/**
 * Types
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Store utilities
 */
export const storeUtils = {
  /**
   * Get current state
   */
  getState: () => store.getState(),
  
  /**
   * Check if store is rehydrated
   */
  isRehydrated: () => persistor.getState().bootstrapped,
  
  /**
   * Wait for rehydration to complete
   */
  waitForRehydration: (): Promise<void> => {
    return new Promise((resolve) => {
      if (persistor.getState().bootstrapped) {
        resolve();
        return;
      }
      
      const unsubscribe = persistor.subscribe(() => {
        if (persistor.getState().bootstrapped) {
          unsubscribe();
          resolve();
        }
      });
    });
  },
  
  /**
   * Reset store to initial state
   */
  reset: async () => {
    await persistor.purge();
    
    // Reset RTK Query cache
    store.dispatch(authApi.util.resetApiState());
    store.dispatch(servicesApi.util.resetApiState());
    store.dispatch(leadsApi.util.resetApiState());
    
    persistor.persist();
  },
  
  /**
   * Invalidate all API caches
   */
  invalidateAPIs: () => {
    store.dispatch(authApi.util.invalidateTags(['User', 'Auth']));
    store.dispatch(servicesApi.util.invalidateTags(['Service', 'ServiceCategory']));
    store.dispatch(leadsApi.util.invalidateTags(['Lead', 'Quotation', 'Document']));
  },
  
  /**
   * Purge all persisted state
   */
  purge: async () => {
    await persistor.purge();
  },
  
  /**
   * Flush pending persistence operations
   */
  flush: async () => {
    await persistor.flush();
  },
};
