import { test, expect } from '@playwright/test';

test.describe('Projects API', () => {
  test('GET /api/projects returns 200 and array', async ({ request }) => {
    const response = await request.get('/api/projects');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('POST /api/projects creates a new project', async ({ request }) => {
    const response = await request.post('/api/projects', {
      data: { name: 'E2E Test Project', path: `/tmp/e2e-test-project-${Date.now()}` },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.name).toBe('E2E Test Project');
  });

  test('GET /api/projects/[id] returns the created project', async ({ request }) => {
    const createRes = await request.post('/api/projects', {
      data: { name: 'E2E Get Project', path: `/tmp/e2e-get-project-${Date.now()}` },
    });
    const created = await createRes.json();

    const response = await request.get(`/api/projects/${created.id}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(created.id);
    expect(body.name).toBe('E2E Get Project');
  });

  test('PUT /api/projects/[id] updates project', async ({ request }) => {
    const createRes = await request.post('/api/projects', {
      data: { name: 'E2E Update Project', path: `/tmp/e2e-update-project-${Date.now()}` },
    });
    const created = await createRes.json();

    const response = await request.put(`/api/projects/${created.id}`, {
      data: { name: 'E2E Updated Name' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe('E2E Updated Name');
  });

  test('DELETE /api/projects/[id] removes project', async ({ request }) => {
    const createRes = await request.post('/api/projects', {
      data: { name: 'E2E Delete Project', path: `/tmp/e2e-delete-project-${Date.now()}` },
    });
    const created = await createRes.json();

    const response = await request.delete(`/api/projects/${created.id}`);
    expect(response.ok()).toBe(true);

    const getRes = await request.get(`/api/projects/${created.id}`);
    expect(getRes.status()).toBe(404);
  });

  test('GET /api/projects/[id] returns 404 for non-existent project', async ({ request }) => {
    const response = await request.get('/api/projects/non-existent-id-12345');
    expect(response.status()).toBe(404);
  });

  test('POST /api/projects with missing name returns error', async ({ request }) => {
    const response = await request.post('/api/projects', {
      data: { path: `/tmp/no-name-${Date.now()}` },
    });
    expect(response.ok()).toBe(false);
  });
});
