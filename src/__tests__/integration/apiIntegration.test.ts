/**
 * API Integration Tests
 */

import {authApi, servicesApi, leadsApi} from '../../api';
import {setupTestStore} from '../../utils/testUtils';

describe('API Integration', () => {
  let store: ReturnType<typeof setupTestStore>;

  beforeEach(() => {
    store = setupTestStore();
  });

  describe('Auth API Integration', () => {
    it('should dispatch sendOtp mutation', async () => {
      const promise = store.dispatch(
        authApi.endpoints.sendOtp.initiate({phone: '1234567890'})
      );

      expect(promise).toBeDefined();

      // Clean up
      promise.abort();
    });

    it('should handle verifyOtp success', async () => {
      const result = await store.dispatch(
        authApi.endpoints.verifyOtp.initiate({
          phone: '1234567890',
          otp: '123456',
        })
      );

      expect(result.data).toBeDefined();
      expect(result.data?.user).toBeDefined();
      expect(result.data?.token).toBeDefined();
    });

    it('should handle verifyOtp failure', async () => {
      const result = await store.dispatch(
        authApi.endpoints.verifyOtp.initiate({
          phone: '1234567890',
          otp: '000000',
        })
      );

      expect(result.error).toBeDefined();
    });
  });

  describe('Services API Integration', () => {
    it('should fetch services successfully', async () => {
      const result = await store.dispatch(
        servicesApi.endpoints.getServices.initiate({})
      );

      expect(result.data).toBeDefined();
      expect(result.data?.data).toBeInstanceOf(Array);
      expect(result.data?.pagination).toBeDefined();
    });

    it('should fetch service categories', async () => {
      const result = await store.dispatch(
        servicesApi.endpoints.getServiceCategories.initiate()
      );

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle services with filters', async () => {
      const result = await store.dispatch(
        servicesApi.endpoints.getServices.initiate({
          category: 'Installation',
          search: 'solar',
        })
      );

      expect(result.data).toBeDefined();
      expect(result.data?.data).toBeInstanceOf(Array);
    });
  });

  describe('Leads API Integration', () => {
    it('should create lead successfully', async () => {
      const leadData = {
        services: ['service-1'],
        description: 'Test lead',
        address: '123 Test St',
        state: 'Test State',
        pinCode: '123456',
      };

      const result = await store.dispatch(
        leadsApi.endpoints.createLead.initiate(leadData)
      );

      expect(result.data).toBeDefined();
      expect(result.data?.id).toBeDefined();
      expect(result.data?.status).toBe('New Lead');
    });

    it('should fetch leads with pagination', async () => {
      const result = await store.dispatch(
        leadsApi.endpoints.getLeads.initiate({page: 1, limit: 10})
      );

      expect(result.data).toBeDefined();
    });
  });

  describe('RTK Query Cache Management', () => {
    it('should handle cache invalidation', () => {
      // Invalidate auth cache
      store.dispatch(authApi.util.invalidateTags(['User']));

      // Invalidate services cache
      store.dispatch(servicesApi.util.invalidateTags(['Service']));

      // Invalidate leads cache
      store.dispatch(leadsApi.util.invalidateTags(['Lead']));

      // Should not throw errors
      expect(true).toBe(true);
    });

    it('should reset API state', () => {
      store.dispatch(authApi.util.resetApiState());
      store.dispatch(servicesApi.util.resetApiState());
      store.dispatch(leadsApi.util.resetApiState());

      const state = store.getState();
      expect(state.authApi.queries).toStrictEqual({});
      expect(state.servicesApi.queries).toStrictEqual({});
      expect(state.leadsApi.queries).toStrictEqual({});
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));

      const result = await store.dispatch(
        authApi.endpoints.sendOtp.initiate({phone: '1234567890'})
      );

      expect(result.error).toBeDefined();
    });

    it('should handle API errors with proper format', async () => {
      // This test relies on the demo implementation returning errors for invalid OTP
      const result = await store.dispatch(
        authApi.endpoints.verifyOtp.initiate({
          phone: '1234567890',
          otp: 'invalid',
        })
      );

      expect(result.error).toBeDefined();
      expect(result.error?.data?.error?.message).toBeDefined();
    });
  });
});
