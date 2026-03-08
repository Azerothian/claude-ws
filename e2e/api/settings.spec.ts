import { test, expect } from '@playwright/test';
import { createProject } from '../helpers';

test.describe('Settings API', () => {
  test('GET /api/settings returns 200', async ({ request }) => {
    const response = await request.get('/api/settings');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(typeof body).toBe('object');
  });

  test('POST /api/settings saves a setting', async ({ request }) => {
    const key = `e2e_test_setting_${Date.now()}`;
    const response = await request.post('/api/settings', {
      data: { key, value: 'test_value' },
    });
    expect(response.status()).toBe(200);

    const getRes = await request.get('/api/settings');
    const settings = await getRes.json();
    expect(settings[key]).toBe('test_value');
  });

  test('POST /api/settings can update existing setting', async ({ request }) => {
    const key = `e2e_update_setting_${Date.now()}`;
    await request.post('/api/settings', { data: { key, value: 'original' } });
    await request.post('/api/settings', { data: { key, value: 'updated' } });

    const getRes = await request.get('/api/settings');
    const settings = await getRes.json();
    expect(settings[key]).toBe('updated');
  });

  test('DELETE /api/settings removes a setting', async ({ request }) => {
    const key = `e2e_delete_setting_${Date.now()}`;
    await request.post('/api/settings', { data: { key, value: 'to_delete' } });

    const response = await request.delete(`/api/settings?keys=${key}`);
    expect(response.ok()).toBe(true);

    const getRes = await request.get('/api/settings');
    const settings = await getRes.json();
    expect(settings[key]).toBeUndefined();
  });
});

test.describe('Provider API', () => {
  test('GET /api/settings/provider returns 200', async ({ request }) => {
    const response = await request.get('/api/settings/provider');
    expect(response.status()).toBe(200);
  });
});

test.describe('API Access Key', () => {
  test('GET /api/settings/api-access-key returns 200', async ({ request }) => {
    const response = await request.get('/api/settings/api-access-key');
    expect(response.status()).toBe(200);
  });
});

test.describe('Models API', () => {
  test('GET /api/models returns 200', async ({ request }) => {
    const response = await request.get('/api/models');
    expect(response.status()).toBe(200);
  });
});

test.describe('Misc API endpoints', () => {
  test('GET /api/shells returns 200 with projectId', async ({ request }) => {
    const project = await createProject(request, 'Shells Test');
    const response = await request.get(`/api/shells?projectId=${project.id}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('GET /api/tunnel/status returns 200', async ({ request }) => {
    const response = await request.get('/api/tunnel/status');
    expect(response.status()).toBe(200);
  });

  test('GET /api/commands returns 200', async ({ request }) => {
    const response = await request.get('/api/commands');
    expect(response.status()).toBe(200);
  });

  test('GET /api/questions returns 200', async ({ request }) => {
    const response = await request.get('/api/questions');
    expect(response.status()).toBe(200);
  });
});
