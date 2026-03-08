import { test, expect } from '@playwright/test';
import { createProject, navigateToApp } from '../helpers';

test.describe('Keyboard Shortcuts', () => {
  test.beforeAll(async ({ request }) => {
    await createProject(request, 'Shortcuts Test');
  });

  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('Escape key does not crash the app', async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('Ctrl+B does not crash the app', async ({ page }) => {
    await page.keyboard.press('Control+b');
    await page.waitForTimeout(500);

    await page.keyboard.press('Control+b');
    await page.waitForTimeout(500);

    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });
});
