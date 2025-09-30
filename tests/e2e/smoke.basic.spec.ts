import { test, expect } from '@playwright/test';

test.describe('[smoke] Smoke', () => {
  // Kör bara i smoke (main), skippas i PR-previews
  const __CTX = process.env.TEST_CONTEXT ?? 'preview';
  test.skip(__CTX === 'preview', 'smoke-only test (skippas på PR-previews).');

  test.beforeEach(async ({ page }) => {
    // Navigera och säkerställ 2xx innan DOM-asserts
    const res = await page.goto('/');
    expect(res, 'navigation returned a response').toBeTruthy();
    expect(res!.ok(), `expected 2xx from ${res!.url()} got ${res!.status()}`).toBeTruthy();
  });

  test('[smoke] Home renderar', async ({ page }) => {
    // Var tolerant mellan motorer: hitta “main”-kandidat, annars fall back till <body>
    const candidates = [
      page.locator('main'),
      page.locator('[role="main"]'),
      page.locator('#mainContent'),
      page.locator('#root'),
      page.locator('#app'),
    ];

    let target = page.locator('body'); // sista fallback
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
