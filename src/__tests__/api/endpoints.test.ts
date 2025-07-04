/**
 * API Endpoints tests
 */

import {authApi, servicesApi, leadsApi} from '../../api/endpoints';
import {configureStore} from '@reduxjs/toolkit';

describe('API Endpoints', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        authApi: authApi.reducer,
        servicesApi: servicesApi.reducer,
        leadsApi: leadsApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
          .concat(authApi.middleware)
          .concat(servicesApi.middleware)
          .concat(leadsApi.middleware),
    });
  });

  describe('Auth API', () => {
    it('should have correct endpoint definitions', () => {
      expect(authApi.endpoints.sendOtp).toBeDefined();
      expect(authApi.endpoints.verifyOtp).toBeDefined();
      expect(authApi.endpoints.getCurrentUser).toBeDefined();
      expect(authApi.endpoints.updateProfile).toBeDefined();
      expect(authApi.endpoints.logoutUser).toBeDefined();
    });

    it('should generate correct hooks', () => {
      expect(authApi.useSendOtpMutation).toBeDefined();
      expect(authApi.useVerifyOtpMutation).toBeDefined();
      expect(authApi.useGetCurrentUserQuery).toBeDefined();
      expect(authApi.useUpdateProfileMutation).toBeDefined();
      expect(authApi.useLogoutUserMutation).toBeDefined();
    });
  });

  describe('Services API', () => {
    it('should have correct endpoint definitions', () => {
      expect(servicesApi.endpoints.getServices).toBeDefined();
      expect(servicesApi.endpoints.getServiceDetails).toBeDefined();
      expect(servicesApi.endpoints.getServiceCategories).toBeDefined();
      expect(servicesApi.endpoints.searchServices).toBeDefined();
    });

    it('should generate correct hooks', () => {
      expect(servicesApi.useGetServicesQuery).toBeDefined();
      expect(servicesApi.useGetServiceDetailsQuery).toBeDefined();
      expect(servicesApi.useGetServiceCategoriesQuery).toBeDefined();
      expect(servicesApi.useSearchServicesQuery).toBeDefined();
    });
  });

  describe('Leads API', () => {
    it('should have correct endpoint definitions', () => {
      expect(leadsApi.endpoints.getLeads).toBeDefined();
      expect(leadsApi.endpoints.getLeadById).toBeDefined();
      expect(leadsApi.endpoints.createLead).toBeDefined();
      expect(leadsApi.endpoints.updateLead).toBeDefined();
      expect(leadsApi.endpoints.getLeadQuotations).toBeDefined();
      expect(leadsApi.endpoints.acceptQuotation).toBeDefined();
      expect(leadsApi.endpoints.uploadDocument).toBeDefined();
    });

    it('should generate correct hooks', () => {
      expect(leadsApi.useGetLeadsQuery).toBeDefined();
      expect(leadsApi.useGetLeadByIdQuery).toBeDefined();
      expect(leadsApi.useCreateLeadMutation).toBeDefined();
      expect(leadsApi.useUpdateLeadMutation).toBeDefined();
      expect(leadsApi.useAcceptQuotationMutation).toBeDefined();
      expect(leadsApi.useUploadDocumentMutation).toBeDefined();
    });
  });

  describe('Store Integration', () => {
    it('should add API reducers to store', () => {
      const state = store.getState();
      expect(state.authApi).toBeDefined();
      expect(state.servicesApi).toBeDefined();
      expect(state.leadsApi).toBeDefined();
    });

    it('should handle API actions', async () => {
      // Test that the store can handle API actions without errors
      const promise = store.dispatch(authApi.endpoints.sendOtp.initiate({phone: '1234567890'}));
      expect(promise).toBeDefined();
      
      // Clean up
      promise.abort();
    });
  });
});
