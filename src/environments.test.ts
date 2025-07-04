/**
 * Environment configuration tests
 */

import {
  getAppConfig,
  AppConfig,
  isDevelopment,
  isProduction,
  getApiBaseUrl,
} from './config/environments';

describe('Environment Configuration', () => {
  it('should load configuration without errors', () => {
    const config = getAppConfig();
    expect(config).toBeDefined();
    expect(config.BASE_API_URL).toBeDefined();
    expect(config.APP_ENV).toBeDefined();
  });

  it('should have consistent static and dynamic config', () => {
    const dynamicConfig = getAppConfig();
    expect(AppConfig.BASE_API_URL).toBe(dynamicConfig.BASE_API_URL);
    expect(AppConfig.APP_ENV).toBe(dynamicConfig.APP_ENV);
  });

  it('should provide utility functions', () => {
    expect(typeof isDevelopment()).toBe('boolean');
    expect(typeof isProduction()).toBe('boolean');
    expect(getApiBaseUrl()).toBe(AppConfig.BASE_API_URL);
  });

  it('should have valid timeout values', () => {
    expect(AppConfig.API_TIMEOUT).toBeGreaterThan(0);
    expect(AppConfig.API_TIMEOUT).toBeLessThan(30000); // Less than 30 seconds
  });
});
