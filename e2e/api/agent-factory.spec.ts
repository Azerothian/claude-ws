import { test, expect } from '@playwright/test';
import { createProject } from '../helpers';

test.describe('Agent Factory API', () => {
  test('GET /api/agent-factory/plugins returns 200 with plugins', async ({ request }) => {
    const response = await request.get('/api/agent-factory/plugins');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('plugins');
    expect(Array.isArray(body.plugins)).toBe(true);
  });

  test('POST /api/agent-factory/plugins creates a plugin', async ({ request }) => {
    const response = await request.post('/api/agent-factory/plugins', {
      data: {
        name: `e2e-test-plugin-${Date.now()}`,
        type: 'skill',
        description: 'E2E test plugin',
      },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('plugin');
    expect(body.plugin).toHaveProperty('id');
  });

  test('GET /api/agent-factory/plugins/[id] returns plugin', async ({ request }) => {
    const createRes = await request.post('/api/agent-factory/plugins', {
      data: {
        name: `e2e-get-plugin-${Date.now()}`,
        type: 'command',
        description: 'E2E get test',
      },
    });
    const created = await createRes.json();

    const response = await request.get(`/api/agent-factory/plugins/${created.plugin.id}`);
    expect(response.status()).toBe(200);
  });

  test('DELETE /api/agent-factory/plugins/[id] removes plugin', async ({ request }) => {
    const createRes = await request.post('/api/agent-factory/plugins', {
      data: {
        name: `e2e-delete-plugin-${Date.now()}`,
        type: 'skill',
        description: 'To be deleted',
      },
    });
    const created = await createRes.json();

    const response = await request.delete(`/api/agent-factory/plugins/${created.plugin.id}`);
    expect(response.ok()).toBe(true);
  });

  test('GET /api/agent-factory/plugins/[id] returns 404 for non-existent', async ({ request }) => {
    const response = await request.get('/api/agent-factory/plugins/non-existent-12345');
    expect(response.status()).toBe(404);
  });
});

test.describe('Agent Factory Project Plugins', () => {
  let projectId: string;

  test.beforeAll(async ({ request }) => {
    const project = await createProject(request, 'AF Project');
    projectId = project.id;
  });

  test('GET /api/agent-factory/projects/[projectId]/plugins returns 200', async ({ request }) => {
    const response = await request.get(`/api/agent-factory/projects/${projectId}/plugins`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/agent-factory/projects/[projectId]/installed returns 200', async ({ request }) => {
    const response = await request.get(`/api/agent-factory/projects/${projectId}/installed`);
    expect(response.ok()).toBe(true);
  });

  test('GET /api/agent-factory/projects/[projectId]/components returns 200', async ({ request }) => {
    const response = await request.get(`/api/agent-factory/projects/${projectId}/components`);
    expect(response.status()).toBe(200);
  });
});
