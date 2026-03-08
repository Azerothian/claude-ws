import { test, expect } from '@playwright/test';
import { createProject, createTask } from '../helpers';

test.describe('Attempts API', () => {
  let taskId: string;

  test.beforeAll(async ({ request }) => {
    const project = await createProject(request, 'Attempts Test');
    const task = await createTask(request, 'Attempts Test Task', project.id);
    taskId = task.id;
  });

  test('GET /api/tasks/[id]/attempts returns attempts object for new task', async ({ request }) => {
    const response = await request.get(`/api/tasks/${taskId}/attempts`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('attempts');
    expect(Array.isArray(body.attempts)).toBe(true);
    expect(body.attempts.length).toBe(0);
  });

  test('GET /api/tasks/[id]/running-attempt returns data for idle task', async ({ request }) => {
    const response = await request.get(`/api/tasks/${taskId}/running-attempt`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/attempts/[id] returns 404 for non-existent attempt', async ({ request }) => {
    const response = await request.get('/api/attempts/non-existent-12345');
    expect(response.status()).toBe(404);
  });

  test('GET /api/attempts/[id]/status returns 404 for non-existent', async ({ request }) => {
    const response = await request.get('/api/attempts/non-existent-12345/status');
    expect(response.status()).toBe(404);
  });
});
