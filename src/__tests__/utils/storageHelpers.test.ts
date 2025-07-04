/**
 * Storage Helpers tests
 */

import EncryptedStorage from 'react-native-encrypted-storage';
import {
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  clearStorage,
  hasStorageItem,
  getStorageInfo,
  setApiCache,
  getApiCache,
  clearExpiredApiCache,
} from '../../utils/storageHelpers';

// Mock EncryptedStorage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const mockEncryptedStorage = EncryptedStorage as jest.Mocked<
  typeof EncryptedStorage
>;

describe('Storage Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setStorageItem', () => {
    it('should store item successfully', async () => {
      const data = {test: 'value'};
      mockEncryptedStorage.setItem.mockResolvedValue();

      await setStorageItem('test-key', data);

      expect(mockEncryptedStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(data)
      );
    });

    it('should handle storage errors', async () => {
      const error = new Error('Storage failed');
      mockEncryptedStorage.setItem.mockRejectedValue(error);

      await expect(setStorageItem('test-key', 'data')).rejects.toThrow(
        'Storage failed'
      );
    });
  });

  describe('getStorageItem', () => {
    it('should retrieve item successfully', async () => {
      const data = {test: 'value'};
      mockEncryptedStorage.getItem.mockResolvedValue(JSON.stringify(data));

      const result = await getStorageItem('test-key');

      expect(result).toStrictEqual(data);
      expect(mockEncryptedStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('should return null for non-existent item', async () => {
      mockEncryptedStorage.getItem.mockResolvedValue(null);

      const result = await getStorageItem('non-existent');

      expect(result).toBeNull();
    });

    it('should handle parsing errors', async () => {
      mockEncryptedStorage.getItem.mockResolvedValue('invalid-json');

      const result = await getStorageItem('test-key');

      expect(result).toBeNull();
    });
  });

  describe('removeStorageItem', () => {
    it('should remove item successfully', async () => {
      mockEncryptedStorage.removeItem.mockResolvedValue();

      await removeStorageItem('test-key');

      expect(mockEncryptedStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should handle removal errors', async () => {
      const error = new Error('Remove failed');
      mockEncryptedStorage.removeItem.mockRejectedValue(error);

      await expect(removeStorageItem('test-key')).rejects.toThrow(
        'Remove failed'
      );
    });
  });

  describe('clearStorage', () => {
    it('should clear all storage', async () => {
      mockEncryptedStorage.clear.mockResolvedValue();

      await clearStorage();

      expect(mockEncryptedStorage.clear).toHaveBeenCalled();
    });
  });

  describe('hasStorageItem', () => {
    it('should return true for existing item', async () => {
      mockEncryptedStorage.getItem.mockResolvedValue('some-value');

      const result = await hasStorageItem('test-key');

      expect(result).toBe(true);
    });

    it('should return false for non-existent item', async () => {
      mockEncryptedStorage.getItem.mockResolvedValue(null);

      const result = await hasStorageItem('test-key');

      expect(result).toBe(false);
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage availability', async () => {
      mockEncryptedStorage.setItem.mockResolvedValue();
      mockEncryptedStorage.getItem.mockResolvedValue('test');
      mockEncryptedStorage.removeItem.mockResolvedValue();

      const info = await getStorageInfo();

      expect(info.available).toBe(true);
    });

    it('should handle storage unavailability', async () => {
      mockEncryptedStorage.setItem.mockRejectedValue(
        new Error('Storage failed')
      );

      const info = await getStorageInfo();

      expect(info.available).toBe(false);
    });
  });

  describe('API Cache', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe('setApiCache', () => {
      it('should store cache with TTL', async () => {
        const data = {test: 'cache'};
        mockEncryptedStorage.setItem.mockResolvedValue();

        await setApiCache('cache-key', data, 5000);

        expect(mockEncryptedStorage.setItem).toHaveBeenCalledWith(
          'cache-key',
          JSON.stringify({
            data,
            timestamp: Date.now(),
            ttl: 5000,
          })
        );
      });

      it('should use default TTL', async () => {
        const data = {test: 'cache'};
        mockEncryptedStorage.setItem.mockResolvedValue();

        await setApiCache('cache-key', data);

        expect(mockEncryptedStorage.setItem).toHaveBeenCalledWith(
          'cache-key',
          JSON.stringify({
            data,
            timestamp: Date.now(),
            ttl: 5 * 60 * 1000, // Default 5 minutes
          })
        );
      });
    });

    describe('getApiCache', () => {
      it('should return cached data when not expired', async () => {
        const cacheData = {
          data: {test: 'cache'},
          timestamp: Date.now(),
          ttl: 10 * 60 * 1000, // 10 minutes
        };
        mockEncryptedStorage.getItem.mockResolvedValue(
          JSON.stringify(cacheData)
        );

        const result = await getApiCache('cache-key');

        expect(result).toStrictEqual({test: 'cache'});
      });

      it('should return null for expired cache', async () => {
        const cacheData = {
          data: {test: 'cache'},
          timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
          ttl: 5 * 60 * 1000, // 5 minute TTL
        };
        mockEncryptedStorage.getItem.mockResolvedValue(
          JSON.stringify(cacheData)
        );
        mockEncryptedStorage.removeItem.mockResolvedValue();

        const result = await getApiCache('cache-key');

        expect(result).toBeNull();
        expect(mockEncryptedStorage.removeItem).toHaveBeenCalledWith(
          'cache-key'
        );
      });

      it('should return null for non-existent cache', async () => {
        mockEncryptedStorage.getItem.mockResolvedValue(null);

        const result = await getApiCache('cache-key');

        expect(result).toBeNull();
      });
    });

    describe('clearExpiredApiCache', () => {
      it('should remove expired cache entries', async () => {
        // Mock multiple cache entries
        const expiredCache = JSON.stringify({
          data: 'expired',
          timestamp: Date.now() - 10 * 60 * 1000,
          ttl: 5 * 60 * 1000,
        });

        const validCache = JSON.stringify({
          data: 'valid',
          timestamp: Date.now(),
          ttl: 10 * 60 * 1000,
        });

        mockEncryptedStorage.getItem
          .mockResolvedValueOnce(expiredCache) // First key - expired
          .mockResolvedValueOnce(validCache) // Second key - valid
          .mockResolvedValueOnce(null); // Third key - doesn't exist

        mockEncryptedStorage.removeItem.mockResolvedValue();

        await clearExpiredApiCache();

        expect(mockEncryptedStorage.removeItem).toHaveBeenCalledTimes(1);
      });
    });
  });
});
