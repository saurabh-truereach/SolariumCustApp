/**
 * Base Query tests
 */

import {baseQuery} from '../../api/baseQuery';
import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../../store/authSlice';

// Mock fetch
global.fetch = jest.fn();

// Mock encrypted storage
jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('baseQuery', () => {
  let store: any;
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should inject Authorization header when token exists', async () => {
    // Set up store with token
    store.dispatch({
      type: 'auth/loginSuccess',
      payload: {
        token: 'test_token',
        user: {id: '1', phone: '1234567890', name: 'Test'},
      },
    });

    // Mock successful response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({success: true, data: {}}),
      headers: new Headers(),
    });

    const result = await baseQuery(
      'test-endpoint',
      {
        getState: () => store.getState(),
        dispatch: store.dispatch,
      },
      {}
    );

    // Verify fetch was called with Authorization header
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('test-endpoint'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test_token',
        }),
      })
    );
  });

  it('should handle 401 error and dispatch logout', async () => {
    // Set up store with token
    store.dispatch({
      type: 'auth/loginSuccess',
      payload: {
        token: 'test_token',
        user: {id: '1', phone: '1234567890', name: 'Test'},
      },
    });

    // Mock 401 response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({success: false, error: 'Unauthorized'}),
      headers: new Headers(),
    });

    const dispatchSpy = jest.spyOn(store, 'dispatch');

    await baseQuery(
      'test-endpoint',
      {
        getState: () => store.getState(),
        dispatch: store.dispatch,
      },
      {}
    );

    // Verify logout was dispatched
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'auth/logout',
      })
    );
  });

  it('should retry on retryable errors', async () => {
    // Mock network error then success
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({success: true, data: {}}),
        headers: new Headers(),
      });

    const result = await baseQuery(
      'test-endpoint',
      {
        getState: () => store.getState(),
        dispatch: store.dispatch,
      },
      {}
    );

    // Verify it retried (2 calls total)
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(result.error).toBeUndefined();
  });

  it('should not retry on non-retryable errors', async () => {
    // Mock 400 error (non-retryable)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({success: false, error: 'Bad Request'}),
      headers: new Headers(),
    });

    const result = await baseQuery(
      'test-endpoint',
      {
        getState: () => store.getState(),
        dispatch: store.dispatch,
      },
      {}
    );

    // Verify it didn't retry (1 call only)
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.error).toBeDefined();
  });
});
