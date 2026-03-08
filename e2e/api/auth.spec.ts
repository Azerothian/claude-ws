import { test, expect } from '@playwright/test';

test.describe('Auth API', () => {
  test('GET /api/auth/verify returns 200 when no API key set', async ({ request }) => {
    const response = await request.get('/api/auth/verify');
    expect(response.status()).toBe(200);
  });

  test('POST /api/auth/verify accepts verification request', async ({ request }) => {
    const response = await request.post('/api/auth/verify', {
      data: { key: 'test-key' },
    });
    expect([200, 401]).toContain(response.status());
  });

  test('API endpoints work without auth when no key configured', async ({ request }) => {
    const endpoints = [
      '/api/projects',
      '/api/settings',
      '/api/models',
      '/api/tunnel/status',
      '/api/commands',
      '/api/cache-stats',
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      expect(response.status(), `${endpoint} should be accessible`).toBe(200);
    }
  });
});
