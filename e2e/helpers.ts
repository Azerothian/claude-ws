import { APIRequestContext, Page } from '@playwright/test';

/**
 * Create a project, handling 409 conflicts by fetching existing projects.
 */
export async function createProject(
  request: APIRequestContext,
  name: string,
  path?: string
): Promise<{ id: string; name: string; path: string }> {
  const uniquePath = path || `/tmp/e2e-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

  const res = await request.post('/api/projects', {
    data: { name, path: uniquePath },
  });

  if (res.status() === 201) {
    return await res.json();
  }

  // 409 conflict - project with same path exists, find it
  if (res.status() === 409) {
    const listRes = await request.get('/api/projects');
    const projects = await listRes.json();
    const existing = projects.find((p: any) => p.path === uniquePath);
    if (existing) return existing;
  }

  // Fallback: create with a more unique path
  const retryRes = await request.post('/api/projects', {
    data: { name, path: `${uniquePath}-${Math.random().toString(36).slice(2, 8)}` },
  });
  return await retryRes.json();
}

/**
 * Dismiss the setup dialog if it appears.
 * The app shows a "Set Up Your Workspace" modal on first load.
 */
export async function dismissSetupDialog(page: Page) {
  // Try multiple strategies to dismiss the setup wizard
  // Strategy 1: Click the Close button
  try {
    const closeBtn = page.locator('button:has-text("Close")');
    await closeBtn.waitFor({ state: 'visible', timeout: 8000 });
    await closeBtn.click();
    await page.waitForTimeout(500);
  } catch {
    // No close button found
  }

  // Strategy 2: Click the X button if dialog still showing
  try {
    const dialogTitle = page.getByText('Set Up Your Workspace');
    if (await dialogTitle.isVisible({ timeout: 1000 })) {
      // Press Escape to close the dialog
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  } catch {
    // Dialog not visible
  }
}

/**
 * Navigate to the app and dismiss the setup wizard if it appears.
 */
export async function navigateToApp(page: Page, projectId?: string) {
  // Pre-set localStorage to try to prevent wizard
  await page.addInitScript(() => {
    localStorage.setItem('setup_wizard_dismissed', 'true');
    localStorage.setItem('onboarding_completed', 'true');
  });

  const url = projectId ? `/?project=${projectId}` : '/';
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Dismiss setup dialog if it still appeared
  await dismissSetupDialog(page);
}

/**
 * Create a task for a given project.
 */
export async function createTask(
  request: APIRequestContext,
  title: string,
  projectId: string,
  status?: string
): Promise<any> {
  const res = await request.post('/api/tasks', {
    data: { title, projectId, ...(status ? { status } : {}) },
  });
  return await res.json();
}
