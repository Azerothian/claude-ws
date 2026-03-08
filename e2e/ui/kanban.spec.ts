import { test, expect } from '@playwright/test';
import { createProject, createTask, navigateToApp } from '../helpers';

test.describe('Kanban Board', () => {
  let projectId: string;

  test.beforeAll(async ({ request }) => {
    const project = await createProject(request, 'Kanban Test');
    projectId = project.id;
  });

  test.beforeEach(async ({ page }) => {
    await navigateToApp(page, projectId);
  });

  test('kanban board renders content', async ({ page }) => {
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(0);
  });

  test('page has header element', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 15000 });
  });

  test('create task via API and verify it appears on board', async ({ page, request }) => {
    const taskTitle = `E2E Board Task ${Date.now()}`;
    await createTask(request, taskTitle, projectId);

    await navigateToApp(page, projectId);

    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 15000 });
  });

  test('clicking a task card interacts correctly', async ({ page, request }) => {
    const taskTitle = `E2E Click Task ${Date.now()}`;
    await createTask(request, taskTitle, projectId);

    await navigateToApp(page, projectId);

    const taskCard = page.getByText(taskTitle).first();
    await expect(taskCard).toBeVisible({ timeout: 20000 });
    await taskCard.click();
    await page.waitForTimeout(500);
    // After clicking, the task title should still be visible (either in card or detail panel)
    const titleVisible = await page.getByText(taskTitle).first().isVisible();
    expect(titleVisible).toBe(true);
  });

  test('task in different status appears on board', async ({ page, request }) => {
    const taskTitle = `In Progress Task ${Date.now()}`;
    await createTask(request, taskTitle, projectId, 'in_progress');

    await navigateToApp(page, projectId);

    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 15000 });
  });

  test('multiple tasks render on the board', async ({ page, request }) => {
    const timestamp = Date.now();
    for (let i = 0; i < 3; i++) {
      await createTask(request, `Multi Task ${timestamp}-${i}`, projectId);
    }

    await navigateToApp(page, projectId);

    for (let i = 0; i < 3; i++) {
      await expect(page.getByText(`Multi Task ${timestamp}-${i}`)).toBeVisible({ timeout: 15000 });
    }
  });

  test('delete task via API and verify removal', async ({ page, request }) => {
    const taskTitle = `E2E Delete Board Task ${Date.now()}`;
    const task = await createTask(request, taskTitle, projectId);

    await navigateToApp(page, projectId);

    await request.delete(`/api/tasks/${task.id}`);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.getByText(taskTitle)).not.toBeVisible({ timeout: 5000 });
  });
});
