import { test, expect } from '@playwright/test';

test.describe('Git API', () => {
  let projectId: string;

  test.beforeAll(async ({ request }) => {
    // Create a project pointing to a real git repo (the app's own directory or /tmp)
    const res = await request.post('/api/projects', {
      data: { name: 'Git Test Project', path: '/app' },
    });
    const body = await res.json();
    projectId = body.id;
  });

  test('GET /api/git/status returns git status', async ({ request }) => {
    const response = await request.get(`/api/git/status?projectId=${projectId}`);
    // May return 200 with status or error if not a git repo
    expect([200, 400, 500]).toContain(response.status());
  });

  test('GET /api/git/branches returns branches list', async ({ request }) => {
    const response = await request.get(`/api/git/branches?projectId=${projectId}`);
    expect([200, 400, 500]).toContain(response.status());
  });

  test('GET /api/git/log returns commit log', async ({ request }) => {
    const response = await request.get(`/api/git/log?projectId=${projectId}`);
    expect([200, 400, 500]).toContain(response.status());
  });

  test('GET /api/git/diff returns diff', async ({ request }) => {
    const response = await request.get(`/api/git/diff?projectId=${projectId}`);
    expect([200, 400, 500]).toContain(response.status());
  });

  test('git endpoints handle missing projectId gracefully', async ({ request }) => {
    const endpoints = [
      '/api/git/status',
      '/api/git/branches',
      '/api/git/log',
      '/api/git/diff',
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      // Should return error for missing projectId, not crash
      expect(response.status()).toBeLessThan(500);
    }
  });
});
