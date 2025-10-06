import { test, expect } from '@playwright/test';

// Duplicate of e2e smoke for root-level discovery
// Runs only on smoke (main) where TEST_CONTEXT=smoke
const __CTX = process.env.TEST_CONTEXT ?? 'preview';

test.describe('[smoke] Root discovery', () => {
  test.skip(__CTX === 'preview', 'smoke-only test (skippas på PR-previews).');

  test('[smoke] Home renders basic DOM', async ({ page }) => {
    const res = await page.goto('/');
    expect(res, 'navigation returned a response').toBeTruthy();
    const ok = !!res && res.ok();
    const status = res?.status();
    const url = res?.url();
    expect(ok, `expected 2xx from ${url ?? '(unknown URL)'} got ${status ?? '(no status)'}`).toBeTruthy();

    const candidates = [
      page.locator('main'),
      page.locator('[role="main"]'),
      page.locator('#mainContent'),
      page.locator('#root'),
      page.locator('#app'),
    ];

    let target = page.locator('body');
    for (const loc of candidates) {
      if ((await loc.count()) > 0) {
        target = loc.first();
        break;
      }
    }

    await target.waitFor({ state: 'attached', timeout: 10000 });
    await expect(target).toBeVisible({ timeout: 15000 });
  });
});
