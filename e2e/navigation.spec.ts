import { test, expect } from '@playwright/test';
import { createProject, navigateToApp } from './helpers';

test.describe('Navigation', () => {
  test.beforeAll(async ({ request }) => {
    await createProject(request, 'Navigation Test');
  });

  test('page renders without JS console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });

  test('header element is visible', async ({ page }) => {
    await navigateToApp(page);
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 15000 });
  });
});
