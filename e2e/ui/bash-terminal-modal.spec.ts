import { test, expect } from '@playwright/test';
import { createProject, navigateToApp } from '../helpers';

test.describe('Bash Terminal Modal', () => {
  let projectId: string;
  const jsErrors: string[] = [];

  test.beforeAll(async ({ request }) => {
    const project = await createProject(request, `Bash Terminal Modal Test ${Date.now()}`);
    projectId = project.id;
  });

  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => jsErrors.push(err.message));
    await navigateToApp(page, projectId);
  });

  test('header has a Bash Console button', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 15000 });
    const bashButton = page.locator('[data-testid="bash-terminal-button"]');
    await expect(bashButton).toBeVisible({ timeout: 10000 });
  });

  test('clicking Bash Console button opens the modal dialog', async ({ page }) => {
    const bashButton = page.locator('[data-testid="bash-terminal-button"]');
    await expect(bashButton).toBeVisible({ timeout: 15000 });
    await bashButton.click();

    const dialogTitle = page.getByText('Bash Console');
    await expect(dialogTitle).toBeVisible({ timeout: 10000 });
  });

  test('Bash Console modal can be closed', async ({ page }) => {
    const bashButton = page.locator('[data-testid="bash-terminal-button"]');
    await expect(bashButton).toBeVisible({ timeout: 15000 });
    await bashButton.click();

    const dialogTitle = page.getByText('Bash Console');
    await expect(dialogTitle).toBeVisible({ timeout: 10000 });

    await page.keyboard.press('Escape');
    await expect(dialogTitle).not.toBeVisible({ timeout: 5000 });
  });

  test('no JS errors during modal interactions', async () => {
    expect(jsErrors).toHaveLength(0);
  });
});
