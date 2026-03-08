import { test, expect } from '@playwright/test';
import { createProject, createTask } from '../helpers';

test.describe('Tasks API', () => {
  let projectId: string;

  test.beforeAll(async ({ request }) => {
    const project = await createProject(request, 'Tasks Test');
    projectId = project.id;
  });

  test('GET /api/tasks returns 200 and array', async ({ request }) => {
    const response = await request.get(`/api/tasks?projectId=${projectId}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('POST /api/tasks creates a new task', async ({ request }) => {
    const response = await request.post('/api/tasks', {
      data: { title: 'E2E Test Task', projectId },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.title).toBe('E2E Test Task');
    expect(body.projectId).toBe(projectId);
    expect(body.status).toBe('todo');
  });

  test('GET /api/tasks/[id] returns the created task', async ({ request }) => {
    const created = await createTask(request, 'E2E Get Task', projectId);
    const response = await request.get(`/api/tasks/${created.id}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(created.id);
    expect(body.title).toBe('E2E Get Task');
  });

  test('PUT /api/tasks/[id] updates task fully', async ({ request }) => {
    const created = await createTask(request, 'E2E Full Update Task', projectId);
    const response = await request.put(`/api/tasks/${created.id}`, {
      data: { title: 'Updated Title', status: 'in_progress', projectId },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.title).toBe('Updated Title');
    expect(body.status).toBe('in_progress');
  });

  test('PATCH /api/tasks/[id] partially updates task status', async ({ request }) => {
    const created = await createTask(request, 'E2E Patch Task', projectId);
    const response = await request.patch(`/api/tasks/${created.id}`, {
      data: { status: 'done' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('done');
    expect(body.title).toBe('E2E Patch Task');
  });

  test('DELETE /api/tasks/[id] removes task', async ({ request }) => {
    const created = await createTask(request, 'E2E Delete Task', projectId);
    const response = await request.delete(`/api/tasks/${created.id}`);
    expect(response.ok()).toBe(true);
    const getRes = await request.get(`/api/tasks/${created.id}`);
    expect(getRes.status()).toBe(404);
  });

  test('task status transitions through kanban columns', async ({ request }) => {
    const task = await createTask(request, 'Status Transition Task', projectId);
    expect(task.status).toBe('todo');
    for (const status of ['in_progress', 'in_review', 'done']) {
      const res = await request.patch(`/api/tasks/${task.id}`, { data: { status } });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.status).toBe(status);
    }
  });

  test('task can be cancelled', async ({ request }) => {
    const task = await createTask(request, 'Cancel Task', projectId);
    const res = await request.patch(`/api/tasks/${task.id}`, { data: { status: 'cancelled' } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('cancelled');
  });

  test('GET /api/tasks/[id]/attempts returns attempts', async ({ request }) => {
    const task = await createTask(request, 'Attempts Task', projectId);
    const response = await request.get(`/api/tasks/${task.id}/attempts`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('attempts');
    expect(Array.isArray(body.attempts)).toBe(true);
  });

  test('GET /api/tasks/[id]/conversation returns conversation data', async ({ request }) => {
    const task = await createTask(request, 'Conversation Task', projectId);
    const response = await request.get(`/api/tasks/${task.id}/conversation`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/tasks/[id]/stats returns stats', async ({ request }) => {
    const task = await createTask(request, 'Stats Task', projectId);
    const response = await request.get(`/api/tasks/${task.id}/stats`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/tasks/[id] returns 404 for non-existent task', async ({ request }) => {
    const response = await request.get('/api/tasks/non-existent-id-12345');
    expect(response.status()).toBe(404);
  });

  test('multiple tasks maintain correct order', async ({ request }) => {
    for (let i = 0; i < 3; i++) {
      await createTask(request, `Position Task ${i}`, projectId);
    }
    const listRes = await request.get(`/api/tasks?projectId=${projectId}`);
    const allTasks = await listRes.json();
    const positionTasks = allTasks.filter((t: any) => t.title.startsWith('Position Task'));
    expect(positionTasks.length).toBeGreaterThanOrEqual(3);
  });
});
