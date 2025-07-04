/**
 * API Helpers tests
 */

import {
    buildApiUrl,
    buildQueryParams,
    getRequestHeaders,
    parseApiError,
    isNetworkError,
    isAuthError,
    isRetryableError,
    calculateRetryDelay,
    formatFileSize,
    validateFileUpload,
  } from '../../utils/apiHelpers';
  
  describe('API Helpers', () => {
    describe('buildApiUrl', () => {
      it('should build correct API URL', () => {
        const url = buildApiUrl('users');
        expect(url).toContain('/api/v1/users');
      });
  
      it('should handle leading slash in endpoint', () => {
        const url = buildApiUrl('/users');
        expect(url).toContain('/api/v1/users');
      });
  
      it('should handle trailing slash in base URL', () => {
        const url = buildApiUrl('users');
        expect(url).not.toMatch(/\/\/api/);
      });
    });
  
    describe('buildQueryParams', () => {
      it('should build query string from object', () => {
        const params = buildQueryParams({page: 1, limit: 20, search: 'test'});
        expect(params).toBe('?page=1&limit=20&search=test');
      });
  
      it('should filter out undefined values', () => {
        const params = buildQueryParams({page: 1, search: undefined});
        expect(params).toBe('?page=1');
      });
  
      it('should return empty string for empty object', () => {
        const params = buildQueryParams({});
        expect(params).toBe('');
      });
  
      it('should handle null and empty string values', () => {
        const params = buildQueryParams({page: 1, empty: '', nullValue: null});
        expect(params).toBe('?page=1');
      });
    });
  
    describe('getRequestHeaders', () => {
      it('should return default headers', () => {
        const headers = getRequestHeaders();
        
        expect(headers['Content-Type']).toBe('application/json');
        expect(headers['Accept']).toBe('application/json');
        expect(headers['X-App-Version']).toBeDefined();
        expect(headers['X-Platform']).toBe('mobile');
      });
  
      it('should add Authorization header when token provided', () => {
        const headers = getRequestHeaders('test-token');
        expect(headers['Authorization']).toBe('Bearer test-token');
      });
  
      it('should merge additional headers', () => {
        const headers = getRequestHeaders('token', {'Custom-Header': 'value'});
        expect(headers['Custom-Header']).toBe('value');
        expect(headers['Authorization']).toBe('Bearer token');
      });
    });
  
    describe('parseApiError', () => {
      it('should parse standard error format', () => {
        const error = {
          status: 400,
          data: {
            error: {
              message: 'Validation failed',
              details: {field: 'required'},
            },
          },
        };
  
        const parsed = parseApiError(error);
        expect(parsed.code).toBe(400);
        expect(parsed.message).toBe('Validation failed');
        expect(parsed.details).toEqual({field: 'required'});
      });
  
      it('should handle simple message format', () => {
        const error = {
          status: 500,
          data: {
            message: 'Internal server error',
          },
        };
  
        const parsed = parseApiError(error);
        expect(parsed.code).toBe(500);
        expect(parsed.message).toBe('Internal server error');
      });
  
      it('should handle unknown error format', () => {
        const error = {status: 404};
        const parsed = parseApiError(error);
        
        expect(parsed.code).toBe(404);
        expect(parsed.message).toBe('An unexpected error occurred');
      });
    });
  
    describe('isNetworkError', () => {
      it('should identify network errors', () => {
        expect(isNetworkError({name: 'NetworkError'})).toBe(true);
        expect(isNetworkError({code: 'NETWORK_ERROR'})).toBe(true);
        expect(isNetworkError({status: 0})).toBe(true);
      });
  
      it('should not identify non-network errors', () => {
        expect(isNetworkError({status: 400})).toBe(false);
        expect(isNetworkError({message: 'Bad request'})).toBe(false);
      });
    });
  
    describe('isAuthError', () => {
      it('should identify auth errors', () => {
        expect(isAuthError({status: 401})).toBe(true);
        expect(isAuthError({status: 403})).toBe(true);
      });
  
      it('should not identify non-auth errors', () => {
        expect(isAuthError({status: 400})).toBe(false);
        expect(isAuthError({status: 500})).toBe(false);
      });
    });
  
    describe('isRetryableError', () => {
      it('should identify retryable errors', () => {
        expect(isRetryableError({status: 500})).toBe(true);
        expect(isRetryableError({status: 502})).toBe(true);
        expect(isRetryableError({status: 429})).toBe(true);
        expect(isRetryableError({name: 'NetworkError'})).toBe(true);
      });
  
      it('should not identify non-retryable errors', () => {
        expect(isRetryableError({status: 400})).toBe(false);
        expect(isRetryableError({status: 401})).toBe(false);
        expect(isRetryableError({status: 404})).toBe(false);
      });
    });
  
    describe('calculateRetryDelay', () => {
      it('should calculate exponential backoff', () => {
        const delay1 = calculateRetryDelay(0, 1000);
        const delay2 = calculateRetryDelay(1, 1000);
        
        expect(delay1).toBeGreaterThanOrEqual(1000);
        expect(delay2).toBeGreaterThanOrEqual(2000);
        expect(delay2).toBeGreaterThan(delay1);
      });
  
      it('should cap at maximum delay', () => {
        const delay = calculateRetryDelay(10, 1000);
        expect(delay).toBeLessThanOrEqual(30000);
      });
    });
  
    describe('formatFileSize', () => {
      it('should format bytes correctly', () => {
        expect(formatFileSize(0)).toBe('0 Bytes');
        expect(formatFileSize(1024)).toBe('1 KB');
        expect(formatFileSize(1048576)).toBe('1 MB');
        expect(formatFileSize(1073741824)).toBe('1 GB');
      });
  
      it('should handle decimal places', () => {
        expect(formatFileSize(1536)).toBe('1.5 KB');
        expect(formatFileSize(2097152)).toBe('2 MB');
      });
    });
  
    describe('validateFileUpload', () => {
      const mockFile = {
        size: 1024 * 1024, // 1MB
        type: 'image/jpeg',
        name: 'test.jpg',
      };
  
      it('should validate correct file', () => {
        const result = validateFileUpload(mockFile);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
  
      it('should reject oversized file', () => {
        const largeFile = {...mockFile, size: 15 * 1024 * 1024}; // 15MB
        const result = validateFileUpload(largeFile);
        
        expect(result.valid).toBe(false);
        expect(result.error).toContain('File size must be less than');
      });
  
      it('should reject invalid file type', () => {
        const invalidFile = {...mockFile, type: 'text/plain'};
        const result = validateFileUpload(invalidFile);
        
        expect(result.valid).toBe(false);
        expect(result.error).toContain('File type');
      });
  
      it('should reject invalid file extension', () => {
        const invalidFile = {...mockFile, name: 'test.txt'};
        const result = validateFileUpload(invalidFile);
        
        expect(result.valid).toBe(false);
        expect(result.error).toContain('File extension');
      });
  
      it('should accept custom options', () => {
        const options = {
          maxSize: 500 * 1024, // 500KB
          allowedTypes: ['text/plain'],
          allowedExtensions: ['.txt'],
        };
        
        const file = {
          size: 400 * 1024,
          type: 'text/plain',
          name: 'test.txt',
        };
        
        const result = validateFileUpload(file, options);
        expect(result.valid).toBe(true);
      });
    });
  });
  