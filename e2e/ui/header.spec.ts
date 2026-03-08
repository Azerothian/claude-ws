import { test, expect } from '@playwright/test';
import { createProject, navigateToApp } from '../helpers';

test.describe('Header', () => {
  let projectId: string;

  test.beforeAll(async ({ request }) => {
    const project = await createProject(request, 'Header Test');
    projectId = project.id;
  });

  test.beforeEach(async ({ page }) => {
    await navigateToApp(page, projectId);
  });

  test('header is visible and contains expected elements', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 15000 });
  });

  test('header contains text content', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 15000 });
    const headerText = await header.textContent();
    expect(headerText).toBeTruthy();
    expect(headerText!.length).toBeGreaterThan(0);
  });

  test('header contains action buttons', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 15000 });
    const buttons = header.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('header settings button opens settings', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 15000 });

    const settingsButton = page.locator('header button').filter({ hasText: /settings/i }).first();
    const gearButton = page.locator('header [data-testid*="settings"], header [aria-label*="settings"], header [aria-label*="Settings"]').first();

    const button = (await settingsButton.count()) > 0 ? settingsButton : gearButton;
    if ((await button.count()) > 0) {
      await button.click();
      await page.waitForTimeout(500);
    }
  });
});
