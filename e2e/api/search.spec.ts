import { test, expect } from '@playwright/test';
import { createProject } from '../helpers';

test.describe('Search API', () => {
  let projectPath: string;

  test.beforeAll(async ({ request }) => {
    const project = await createProject(request, 'Search Test');
    projectPath = project.path;
  });

  test('GET /api/search/files returns results', async ({ request }) => {
    const response = await request.get(`/api/search/files?basePath=${encodeURIComponent(projectPath)}&q=test`);
    expect(response.ok()).toBe(true);
  });

  test('GET /api/search/content returns results', async ({ request }) => {
    const response = await request.get(`/api/search/content?basePath=${encodeURIComponent(projectPath)}&q=test`);
    expect(response.ok()).toBe(true);
  });

  test('GET /api/search/chat-history returns results', async ({ request }) => {
    const response = await request.get('/api/search/chat-history?query=test');
    expect(response.status()).toBe(200);
  });

  test('search with empty query handles gracefully', async ({ request }) => {
    const response = await request.get(`/api/search/files?basePath=${encodeURIComponent(projectPath)}&q=`);
    expect([200, 400]).toContain(response.status());
  });
});
