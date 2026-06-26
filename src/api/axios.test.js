import api, { getApiBaseUrl, getApiVersion } from './axios';

describe('axios configuration', () => {
  describe('getApiBaseUrl', () => {
    it('returns the configured base URL', () => {
      const baseUrl = getApiBaseUrl();
      expect(baseUrl).toBeDefined();
      expect(typeof baseUrl).toBe('string');
    });
  });

  describe('getApiVersion', () => {
    it('returns /api/v1', () => {
      expect(getApiVersion()).toBe('/api/v1');
    });
  });

  describe('axios instance', () => {
    it('has Content-Type header set to application/json', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('has timeout configured', () => {
      expect(api.defaults.timeout).toBe(30000);
    });

    it('has baseURL configured with api version', () => {
      expect(api.defaults.baseURL).toContain('/api/v1');
    });
  });

  describe('interceptors', () => {
    it('has request interceptor configured', () => {
      expect(api.interceptors.request.handlers.length).toBeGreaterThan(0);
    });

    it('has response interceptor configured', () => {
      expect(api.interceptors.response.handlers.length).toBeGreaterThan(0);
    });
  });
});
