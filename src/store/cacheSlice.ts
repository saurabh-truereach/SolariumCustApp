/**
 * Cache Slice
 * Manages offline data cache
 */

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

/**
 * Cache State
 */
export interface CacheState {
  lastSyncTime?: number;
  cachedData: Record<string, any>;
  syncInProgress: boolean;
}

/**
 * Initial state
 */
const initialState: CacheState = {
  lastSyncTime: undefined,
  cachedData: {},
  syncInProgress: false,
};

/**
 * Cache slice
 */
const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    setCachedData: (
      state,
      action: PayloadAction<{key: string; data: any}>
    ) => {
      state.cachedData[action.payload.key] = action.payload.data;
    },
    clearCache: state => {
      state.cachedData = {};
      state.lastSyncTime = undefined;
    },
    setSyncTime: (state, action: PayloadAction<number>) => {
      state.lastSyncTime = action.payload;
    },
    setSyncInProgress: (state, action: PayloadAction<boolean>) => {
      state.syncInProgress = action.payload;
    },
  },
});

export const {setCachedData, clearCache, setSyncTime, setSyncInProgress} =
  cacheSlice.actions;

export default cacheSlice.reducer;

// Selectors
export const selectCachedData = (state: {cache: CacheState}) => state.cache.cachedData;
export const selectLastSyncTime = (state: {cache: CacheState}) => state.cache.lastSyncTime;
export const selectSyncInProgress = (state: {cache: CacheState}) => state.cache.syncInProgress;
