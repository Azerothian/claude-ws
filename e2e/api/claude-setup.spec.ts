import { test, expect } from '@playwright/test';

test.describe('Claude Setup API', () => {
  test('GET /api/settings/claude-setup returns 200 with configured boolean', async ({ request }) => {
    const response = await request.get('/api/settings/claude-setup');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(typeof body.configured).toBe('boolean');
  });

  test('GET /api/settings/claude-setup response has expected shape', async ({ request }) => {
    const response = await request.get('/api/settings/claude-setup');
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body).toHaveProperty('configured');
    expect(Object.keys(body)).toContain('configured');
  });
});
