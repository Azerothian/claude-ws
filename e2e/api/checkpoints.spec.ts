import { test, expect } from '@playwright/test';
import { createProject, createTask } from '../helpers';

test.describe('Checkpoints API', () => {
  let taskId: string;

  test.beforeAll(async ({ request }) => {
    const project = await createProject(request, 'Checkpoints Test');
    const task = await createTask(request, 'Checkpoints Test Task', project.id);
    taskId = task.id;
  });

  test('GET /api/checkpoints returns checkpoints for task', async ({ request }) => {
    const response = await request.get(`/api/checkpoints?taskId=${taskId}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('GET /api/checkpoints without taskId returns error or empty', async ({ request }) => {
    const response = await request.get('/api/checkpoints');
    expect([200, 400]).toContain(response.status());
  });
});
