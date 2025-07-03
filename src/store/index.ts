/**
 * Redux Store Configuration
 * Configures the app's Redux store with persistence
 */

import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {persistReducer, persistStore} from 'redux-persist';
import EncryptedStorage from 'react-native-encrypted-storage';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import cacheReducer from './cacheSlice';

/**
 * Root reducer
 */
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  cache: cacheReducer,
});

/**
 * Persist configuration
 */
const persistConfig = {
  key: 'root',
  storage: EncryptedStorage,
  whitelist: ['auth'], // Only persist auth state
  version: 1,
};

/**
 * Persisted reducer
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configure store
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__,
});

/**
 * Persistor
 */
export const persistor = persistStore(store);

/**
 * Types
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
