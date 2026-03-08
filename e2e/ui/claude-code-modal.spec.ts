import { test, expect } from '@playwright/test';
import { createProject, navigateToApp } from '../helpers';

test.describe('Claude Code Modal', () => {
  let projectId: string;
  const jsErrors: string[] = [];

  test.beforeAll(async ({ request }) => {
    const project = await createProject(request, `Claude Code Modal Test ${Date.now()}`);
    projectId = project.id;
  });

  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => jsErrors.push(err.message));
    await navigateToApp(page, projectId);
  });

  test('header has a Claude Code button', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 15000 });
    const claudeButton = page.locator('[data-testid="claude-code-button"]');
    await expect(claudeButton).toBeVisible({ timeout: 10000 });
  });

  test('clicking Claude Code button opens the modal dialog', async ({ page }) => {
    const claudeButton = page.locator('[data-testid="claude-code-button"]');
    await expect(claudeButton).toBeVisible({ timeout: 15000 });
    await claudeButton.click();

    // Modal should appear with the title
    const dialogTitle = page.getByRole('heading', { name: 'Claude Code CLI' });
    await expect(dialogTitle).toBeVisible({ timeout: 10000 });
  });

  test('Claude Code modal can be closed', async ({ page }) => {
    const claudeButton = page.locator('[data-testid="claude-code-button"]');
    await expect(claudeButton).toBeVisible({ timeout: 15000 });
    await claudeButton.click();

    const dialogTitle = page.getByRole('heading', { name: 'Claude Code CLI' });
    await expect(dialogTitle).toBeVisible({ timeout: 10000 });

    // Close via Escape
    await page.keyboard.press('Escape');
    await expect(dialogTitle).not.toBeVisible({ timeout: 5000 });
  });

  test('no JS errors during modal interactions', async () => {
    expect(jsErrors).toHaveLength(0);
  });
});
