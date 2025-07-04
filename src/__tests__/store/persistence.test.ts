/**
 * Essential Persistence Tests
 * Tests for core persistence functionality
 */

import {store, persistor, storeUtils} from '../../store';
import {loginSuccess} from '../../store/authSlice';

// Mock encrypted storage
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

jest.mock('react-native-encrypted-storage', () => mockStorage);

describe('Essential Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getItem.mockResolvedValue(null);
    mockStorage.setItem.mockResolvedValue(undefined);
    mockStorage.removeItem.mockResolvedValue(undefined);
    mockStorage.clear.mockResolvedValue(undefined);
  });

  it('should have persistence configured', () => {
    expect(persistor).toBeDefined();
    expect(typeof persistor.flush).toBe('function');
    expect(typeof persistor.purge).toBe('function');
  });

  it('should persist auth state when user logs in', async () => {
    const mockUser = {
      id: 'user_1',
      phone: '1234567890',
      name: 'Test User',
    };

    // Dispatch login action
    store.dispatch(
      loginSuccess({
        token: 'test_token',
        user: mockUser,
      })
    );

    // Flush persistence
    await persistor.flush();

    // Verify storage was called
    expect(mockStorage.setItem).toHaveBeenCalled();
  });

  it('should provide store utilities', () => {
    expect(storeUtils.isRehydrated).toBeDefined();
    expect(storeUtils.waitForRehydration).toBeDefined();
    expect(storeUtils.purge).toBeDefined();
    expect(storeUtils.flush).toBeDefined();
  });

  it('should handle purge operation', async () => {
    await storeUtils.purge();
    // Should not throw an error
  });

  it('should handle flush operation', async () => {
    await storeUtils.flush();
    // Should not throw an error
  });
});
