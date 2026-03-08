import { test, expect } from '@playwright/test';
import { createProject, createTask } from '../helpers';

test.describe('Task Reorder API', () => {
  let projectId: string;

  test.beforeAll(async ({ request }) => {
    const project = await createProject(request, 'Reorder Test');
    projectId = project.id;
  });

  test('PUT /api/tasks/reorder moves task to new position', async ({ request }) => {
    const tasks = [];
    for (let i = 0; i < 3; i++) {
      tasks.push(await createTask(request, `Reorder Task ${i}`, projectId));
    }

    const response = await request.put('/api/tasks/reorder', {
      data: { taskId: tasks[0].id, status: 'todo', position: 2 },
    });
    expect(response.ok()).toBe(true);
  });

  test('reorder task to different column changes status', async ({ request }) => {
    const task = await createTask(request, 'Cross-Column Task', projectId);
    expect(task.status).toBe('todo');

    const response = await request.put('/api/tasks/reorder', {
      data: { taskId: task.id, status: 'in_progress', position: 0 },
    });
    expect(response.ok()).toBe(true);

    const getRes = await request.get(`/api/tasks/${task.id}`);
    const updated = await getRes.json();
    expect(updated.status).toBe('in_progress');
  });
});
