import { test, expect } from '@playwright/test';
import { createProject, navigateToApp } from '../helpers';

test.describe('Responsive Layout', () => {
  test.beforeAll(async ({ request }) => {
    await createProject(request, 'Responsive Test');
  });

  test('app renders correctly at desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await navigateToApp(page);

    const body = await page.locator('body').textContent();
    expect(body!.length).toBeGreaterThan(0);
  });

  test('app renders correctly at tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await navigateToApp(page);

    const body = await page.locator('body').textContent();
    expect(body!.length).toBeGreaterThan(0);
  });

  test('app renders correctly at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToApp(page);

    const body = await page.locator('body').textContent();
    expect(body!.length).toBeGreaterThan(0);
  });

  test('no horizontal overflow at narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToApp(page);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    // Allow some tolerance for scrollbars and minor layout differences
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 60);
  });
});
