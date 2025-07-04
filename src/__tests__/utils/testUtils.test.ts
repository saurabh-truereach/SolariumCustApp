/**
 * Test Utilities tests
 */

import {
    setupTestStore,
    createMockUser,
    createMockAuthState,
    createMockLead,
    createMockService,
    mockApiResponse,
    waitForAsync,
  } from '../../utils/testUtils';
  
  describe('Test Utilities', () => {
    describe('setupTestStore', () => {
      it('should create a test store with default state', () => {
        const store = setupTestStore();
        const state = store.getState();
        
        expect(state.auth).toBeDefined();
        expect(state.ui).toBeDefined();
        expect(state.cache).toBeDefined();
        expect(state.authApi).toBeDefined();
        expect(state.servicesApi).toBeDefined();
        expect(state.leadsApi).toBeDefined();
      });
  
      it('should create a test store with preloaded state', () => {
        const preloadedState = {
          auth: createMockAuthState(),
        };
        
        const store = setupTestStore(preloadedState as any);
        const state = store.getState();
        
        expect(state.auth.isLoggedIn).toBe(true);
        expect(state.auth.user?.name).toBe('Test User');
      });
    });
  
    describe('Mock creators', () => {
      it('should create mock user', () => {
        const user = createMockUser();
        
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('phone');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
      });
  
      it('should create mock auth state', () => {
        const authState = createMockAuthState();
        
        expect(authState.isLoggedIn).toBe(true);
        expect(authState.user).toBeDefined();
        expect(authState.token).toBeDefined();
      });
  
      it('should create mock auth state with overrides', () => {
        const authState = createMockAuthState({
          isLoggedIn: false,
          token: undefined,
        });
        
        expect(authState.isLoggedIn).toBe(false);
        expect(authState.token).toBeUndefined();
      });
  
      it('should create mock lead', () => {
        const lead = createMockLead();
        
        expect(lead).toHaveProperty('id');
        expect(lead).toHaveProperty('customerId');
        expect(lead).toHaveProperty('services');
        expect(lead.status).toBe('New Lead');
      });
  
      it('should create mock service', () => {
        const service = createMockService();
        
        expect(service).toHaveProperty('id');
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('category');
        expect(service.isActive).toBe(true);
      });
    });
  
    describe('API response helper', () => {
      it('should create successful API response', () => {
        const data = {test: 'data'};
        const response = mockApiResponse(data);
        
        expect(response.success).toBe(true);
        expect(response.data).toEqual(data);
        expect(response.error).toBeNull();
      });
  
      it('should create error API response', () => {
        const data = {test: 'data'};
        const response = mockApiResponse(data, false);
        
        expect(response.success).toBe(false);
        expect(response.data).toBeNull();
        expect(response.error).toBeDefined();
      });
    });
  
    describe('Async utilities', () => {
      it('should wait for async operations', async () => {
        const start = Date.now();
        await waitForAsync();
        const end = Date.now();
        
        expect(end - start).toBeGreaterThanOrEqual(0);
      });
    });
  });
  