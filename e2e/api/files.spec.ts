import { test, expect } from '@playwright/test';
import { createProject } from '../helpers';

test.describe('Files API', () => {
  let projectPath: string;

  test.beforeAll(async ({ request }) => {
    const project = await createProject(request, 'Files Test');
    projectPath = project.path;
  });

  test('GET /api/files returns files list for valid path', async ({ request }) => {
    const response = await request.get(`/api/files?path=${encodeURIComponent(projectPath)}`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/files/search returns search results', async ({ request }) => {
    const response = await request.get(`/api/files/search?basePath=${encodeURIComponent(projectPath)}&query=test`);
    expect(response.ok()).toBe(true);
  });

  test('GET /api/filesystem returns filesystem data', async ({ request }) => {
    const response = await request.get('/api/filesystem?path=/tmp');
    expect(response.status()).toBe(200);
  });

  test('GET /api/files without path returns 400', async ({ request }) => {
    const response = await request.get('/api/files');
    expect(response.status()).toBe(400);
  });

  test('GET /api/files/content requires path parameter', async ({ request }) => {
    const response = await request.get('/api/files/content');
    expect(response.ok()).toBe(false);
  });
});

test.describe('Uploads API', () => {
  test('GET /api/uploads/[fileId] returns 404 for non-existent', async ({ request }) => {
    const response = await request.get('/api/uploads/non-existent-file-id');
    expect(response.status()).toBe(404);
  });
});
