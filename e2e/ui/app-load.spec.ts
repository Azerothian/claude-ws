import { test, expect } from '@playwright/test';

test.describe('App Loading', () => {
  test('app loads within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(30000);
  });

  test('app has correct meta tags', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();
  });

  test('app loads CSS and styles are applied', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    expect(bgColor).toBeTruthy();
  });

  test('no uncaught exceptions during initial load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });

  test('no failed network requests for core resources', async ({ page }) => {
    const failedRequests: string[] = [];
    page.on('requestfailed', (req) => {
      const url = req.url();
      if (!url.includes('localhost') && !url.includes('127.0.0.1')) return;
      failedRequests.push(`${req.method()} ${url}: ${req.failure()?.errorText}`);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(failedRequests).toEqual([]);
  });

  test('app serves HTML at root', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    const url = page.url();
    expect(url).toContain('http');
  });

  test('Socket.io connection is attempted', async ({ page }) => {
    let socketRequested = false;
    page.on('request', (req) => {
      if (req.url().includes('socket.io')) {
        socketRequested = true;
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    expect(socketRequested).toBe(true);
  });
});
