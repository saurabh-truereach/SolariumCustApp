/**
 * Typed Redux Hooks
 * Provides typed versions of useDispatch and useSelector with additional utilities
 */

import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {useCallback} from 'react';
import type {RootState, AppDispatch} from '../store';

/**
 * Typed useDispatch hook
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed useSelector hook
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Hook for dispatching actions with automatic type inference
 */
export const useAppAction = () => {
  const dispatch = useAppDispatch();
  
  return useCallback(
    <T extends Parameters<AppDispatch>[0]>(action: T) => {
      return dispatch(action);
    },
    [dispatch]
  );
};

/**
 * Hook for selecting auth state
 */
export const useAuthState = () => {
  return useAppSelector(state => state.auth);
};

/**
 * Hook for selecting UI state
 */
export const useUIState = () => {
  return useAppSelector(state => state.ui);
};

/**
 * Hook for selecting cache state
 */
export const useCacheState = () => {
  return useAppSelector(state => state.cache);
};
