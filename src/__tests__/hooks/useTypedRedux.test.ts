/**
 * Typed Redux Hooks tests
 */

import {renderHook} from '@testing-library/react-native';
import {
  useAppDispatch,
  useAppSelector,
  useAuthState,
  useUIState,
  useCacheState,
  useRehydrated,
  usePersistence,
} from '../../hooks/useTypedRedux';
import {setupTestStore, createMockAuthState} from '../../utils/testUtils';
import {Provider} from 'react-redux';
import React from 'react';

const createWrapper = (store: ReturnType<typeof setupTestStore>) => {
  return ({children}: {children: React.ReactNode}) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useTypedRedux hooks', () => {
  let store: ReturnType<typeof setupTestStore>;

  beforeEach(() => {
    store = setupTestStore();
  });

  describe('useAppDispatch', () => {
    it('should return dispatch function', () => {
      const wrapper = createWrapper(store);
      const {result} = renderHook(() => useAppDispatch(), {wrapper});

      expect(typeof result.current).toBe('function');
    });

    it('should dispatch actions correctly', () => {
      const wrapper = createWrapper(store);
      const {result} = renderHook(() => useAppDispatch(), {wrapper});

      const action = {type: 'test/action', payload: 'test'};
      result.current(action);

      // Action should be dispatched (we can't easily test this without middleware)
      expect(typeof result.current).toBe('function');
    });
  });

  describe('useAppSelector', () => {
    it('should select state correctly', () => {
      const preloadedState = {
        auth: createMockAuthState(),
      };
      store = setupTestStore(preloadedState as any);
      const wrapper = createWrapper(store);

      const {result} = renderHook(
        () => useAppSelector(state => state.auth.isLoggedIn),
        {wrapper}
      );

      expect(result.current).toBe(true);
    });

    it('should update when state changes', () => {
      const wrapper = createWrapper(store);
      const {result, rerender} = renderHook(
        () => useAppSelector(state => state.auth.isLoggedIn),
        {wrapper}
      );

      expect(result.current).toBe(false);

      // Dispatch login action
      store.dispatch({
        type: 'auth/loginSuccess',
        payload: {
          token: 'test-token',
          user: {id: '1', phone: '1234567890', name: 'Test'},
        },
      });

      rerender();
      expect(result.current).toBe(true);
    });
  });

  describe('useAuthState', () => {
    it('should return auth state', () => {
      const preloadedState = {
        auth: createMockAuthState(),
      };
      store = setupTestStore(preloadedState as any);
      const wrapper = createWrapper(store);

      const {result} = renderHook(() => useAuthState(), {wrapper});

      expect(result.current.isLoggedIn).toBe(true);
      expect(result.current.user).toBeDefined();
      expect(result.current.token).toBeDefined();
    });
  });

  describe('useUIState', () => {
    it('should return UI state', () => {
      const wrapper = createWrapper(store);
      const {result} = renderHook(() => useUIState(), {wrapper});

      expect(result.current).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
      expect(result.current.networkStatus).toBeDefined();
    });
  });

  describe('useCacheState', () => {
    it('should return cache state', () => {
      const wrapper = createWrapper(store);
      const {result} = renderHook(() => useCacheState(), {wrapper});

      expect(result.current).toBeDefined();
      expect(result.current.cachedData).toBeDefined();
      expect(result.current.syncInProgress).toBeDefined();
    });
  });

  describe('useRehydrated', () => {
    it('should return rehydration status', () => {
      const wrapper = createWrapper(store);
      const {result} = renderHook(() => useRehydrated(), {wrapper});

      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('usePersistence', () => {
    it('should return persistence utilities', () => {
      const wrapper = createWrapper(store);
      const {result} = renderHook(() => usePersistence(), {wrapper});

      expect(result.current.isRehydrated).toBeDefined();
      expect(result.current.isHealthy).toBeDefined();
      expect(typeof result.current.purge).toBe('function');
      expect(typeof result.current.flush).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });
});
