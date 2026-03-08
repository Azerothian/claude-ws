import { test, expect } from '@playwright/test';
import { createProject, createTask } from './helpers';

test.describe('Error Handling', () => {
  test('404 API endpoints return appropriate status', async ({ request }) => {
    const response = await request.get('/api/nonexistent-endpoint');
    expect(response.status()).toBe(404);
  });

  test('invalid project ID returns 404', async ({ request }) => {
    const response = await request.get('/api/projects/invalid-id-that-does-not-exist');
    expect(response.status()).toBe(404);
  });

  test('invalid task ID returns 404', async ({ request }) => {
    const response = await request.get('/api/tasks/invalid-id-that-does-not-exist');
    expect(response.status()).toBe(404);
  });

  test('POST /api/tasks with missing projectId returns error', async ({ request }) => {
    const response = await request.post('/api/tasks', {
      data: { title: 'No Project Task' },
    });
    expect(response.ok()).toBe(false);
  });

  test('POST /api/projects with empty body returns error', async ({ request }) => {
    const response = await request.post('/api/projects', {
      data: {},
    });
    expect(response.ok()).toBe(false);
  });

  test('DELETE non-existent project handles gracefully', async ({ request }) => {
    const response = await request.delete('/api/projects/non-existent-id-xyz');
    expect([200, 404]).toContain(response.status());
  });

  test('DELETE non-existent task handles gracefully', async ({ request }) => {
    const response = await request.delete('/api/tasks/non-existent-id-xyz');
    expect([200, 404]).toContain(response.status());
  });

  test('PUT /api/tasks/[id] with invalid data handles gracefully', async ({ request }) => {
    const project = await createProject(request, 'Error Test');
    const task = await createTask(request, 'Error Task', project.id);

    const response = await request.put(`/api/tasks/${task.id}`, {
      data: { status: 'invalid_status_value' },
    });
    expect([200, 400, 422]).toContain(response.status());
  });

  test('large payload is handled gracefully', async ({ request }) => {
    const largeTitle = 'A'.repeat(5000);
    const project = await createProject(request, 'Large Payload');
    const response = await request.post('/api/tasks', {
      data: { title: largeTitle, projectId: project.id },
    });
    expect([201, 400, 413, 422]).toContain(response.status());
  });
});
