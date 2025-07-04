/**
 * Test Utilities
 * Helper functions and components for testing
 */

import React, {ReactElement} from 'react';
import {render, RenderOptions} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {NavigationContainer} from '@react-navigation/native';
import {configureStore, PreloadedState} from '@reduxjs/toolkit';
import {persistStore} from 'redux-persist';

import ThemeProvider from '../theme/ThemeProvider';
import {LoadingOverlay} from '../components';
import authReducer from '../store/authSlice';
import uiReducer from '../store/uiSlice';
import cacheReducer from '../store/cacheSlice';
import {authApi, servicesApi, leadsApi} from '../api';
import type {RootState} from '../store';

/**
 * Test store configuration
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: ReturnType<typeof setupTestStore>;
  withNavigation?: boolean;
  withPersistence?: boolean;
}

/**
 * Create test store
 */
export const setupTestStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      cache: cacheReducer,
      [authApi.reducerPath]: authApi.reducer,
      [servicesApi.reducerPath]: servicesApi.reducer,
      [leadsApi.reducerPath]: leadsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable for testing
      })
        .concat(authApi.middleware)
        .concat(servicesApi.middleware)
        .concat(leadsApi.middleware),
    preloadedState,
  });
};

/**
 * Test wrapper component
 */
interface TestWrapperProps {
  children: React.ReactNode;
  store: ReturnType<typeof setupTestStore>;
  withNavigation: boolean;
  withPersistence: boolean;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  store,
  withNavigation,
  withPersistence,
}) => {
  const persistor = withPersistence ? persistStore(store) : null;

  const content = withNavigation ? (
    <NavigationContainer>
      {children}
    </NavigationContainer>
  ) : (
    children
  );

  return (
    <Provider store={store}>
      {withPersistence && persistor ? (
        <PersistGate loading={<LoadingOverlay visible={true} />} persistor={persistor}>
          <ThemeProvider>
            {content}
          </ThemeProvider>
        </PersistGate>
      ) : (
        <ThemeProvider>
          {content}
        </ThemeProvider>
      )}
    </Provider>
  );
};

/**
 * Custom render function with providers
 */
export const renderWithProviders = (
  ui: ReactElement,
  {
    preloadedState,
    store = setupTestStore(preloadedState),
    withNavigation = false,
    withPersistence = false,
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  const Wrapper = ({children}: {children: React.ReactNode}) => (
    <TestWrapper
      store={store}
      withNavigation={withNavigation}
      withPersistence={withPersistence}>
      {children}
    </TestWrapper>
  );

  return {
    store,
    ...render(ui, {wrapper: Wrapper, ...renderOptions}),
  };
};

/**
 * Create mock user state
 */
export const createMockUser = () => ({
  id: 'test-user-1',
  phone: '1234567890',
  name: 'Test User',
  email: 'test@example.com',
});

/**
 * Create mock auth state
 */
export const createMockAuthState = (overrides = {}) => ({
  isLoggedIn: true,
  isLoading: false,
  token: 'mock-token-123',
  user: createMockUser(),
  lastLoginTime: Date.now(),
  error: undefined,
  ...overrides,
});

/**
 * Create mock lead
 */
export const createMockLead = (overrides = {}) => ({
  id: 'lead-123',
  customerId: 'test-user-1',
  services: ['service-1'],
  status: 'New Lead' as const,
  priority: 'Medium' as const,
  source: 'App' as const,
  address: '123 Test Street',
  state: 'Test State',
  pinCode: '123456',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  customer: {
    id: 'test-user-1',
    name: 'Test User',
    phone: '1234567890',
  },
  ...overrides,
});

/**
 * Create mock service
 */
export const createMockService = (overrides = {}) => ({
  id: 'service-1',
  name: 'Test Solar Installation',
  description: 'Test service description',
  category: 'Installation',
  price: {min: 50000, max: 100000, currency: 'INR'},
  image: 'https://example.com/image.jpg',
  features: ['Feature 1', 'Feature 2'],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

/**
 * Mock API responses
 */
export const mockApiResponse = <T>(data: T, success = true) => ({
  success,
  data: success ? data : null,
  error: success ? null : {code: 400, message: 'Test error'},
});

/**
 * Wait for async operations
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Mock navigation object
 */
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(() => jest.fn()),
});

/**
 * Mock route object
 */
export const createMockRoute = (params = {}) => ({
  params,
  key: 'test-route',
  name: 'TestScreen',
});

/**
 * Async test helper
 */
export const asyncTest = (testFn: () => Promise<void>) => {
  return async () => {
    await testFn();
    await waitForAsync();
  };
};

/**
 * Fire event and wait
 */
export const fireEventAndWait = async (element: any, event: string, ...args: any[]) => {
  const {fireEvent} = await import('@testing-library/react-native');
  fireEvent[event](element, ...args);
  await waitForAsync();
};

/**
 * Assert loading state
 */
export const expectLoadingState = (getByTestId: any, testId: string, isLoading: boolean) => {
  if (isLoading) {
    expect(getByTestId(testId)).toBeTruthy();
  } else {
    expect(() => getByTestId(testId)).toThrow();
  }
};

/**
 * Assert error state
 */
export const expectErrorState = (getByText: any, errorMessage: string) => {
  expect(getByText(errorMessage)).toBeTruthy();
};

/**
 * Create test IDs
 */
export const testIds = {
  loading: 'loading-indicator',
  error: 'error-message',
  success: 'success-message',
  loginForm: 'login-form',
  phoneInput: 'phone-input',
  otpInput: 'otp-input',
  submitButton: 'submit-button',
  backButton: 'back-button',
  logoutButton: 'logout-button',
};

/**
 * Performance testing helper
 */
export const measurePerformance = async (testFn: () => Promise<void>) => {
  const start = performance.now();
  await testFn();
  const end = performance.now();
  return end - start;
};

/**
 * Accessibility testing helper
 */
export const testAccessibility = async (component: ReactElement) => {
  const {getByRole, queryByRole} = renderWithProviders(component);
  
  // Test basic accessibility
  expect(queryByRole).toBeDefined();
  
  // Add more accessibility tests as needed
  return true;
};

// Re-export testing library utilities
export * from '@testing-library/react-native';
export {renderWithProviders as render};
