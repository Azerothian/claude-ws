import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('app loads and has title', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/.+/);
  });

  test('app renders main content area', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('GET /api/projects returns 200 and array', async ({ request }) => {
    const response = await request.get('/api/projects');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('GET /api/settings returns 200 and object', async ({ request }) => {
    const response = await request.get('/api/settings');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(typeof body).toBe('object');
  });

  test('GET /api/models returns 200', async ({ request }) => {
    const response = await request.get('/api/models');
    expect(response.status()).toBe(200);
  });

  test('GET /api/tunnel/status returns 200', async ({ request }) => {
    const response = await request.get('/api/tunnel/status');
    expect(response.status()).toBe(200);
  });

  test('GET /api/commands returns 200', async ({ request }) => {
    const response = await request.get('/api/commands');
    expect(response.status()).toBe(200);
  });

  test('health check - all critical endpoints respond', async ({ request }) => {
    const endpoints = [
      '/api/projects',
      '/api/settings',
      '/api/tunnel/status',
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      expect(response.status(), `${endpoint} should return 200`).toBe(200);
    }
  });
});
