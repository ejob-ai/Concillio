import { test, expect } from '@playwright/test';

test.describe('[smoke] Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ==== HOTFIX(TEST_CONTEXT): Kör bara i smoke (main), skippa i PR-previews ====
  const __CTX = process.env.TEST_CONTEXT;
  test.skip(__CTX === 'preview', 'smoke-only test (skippas på PR-previews).');
  // ==== HOTFIX END ====

  test('[smoke] Home renderar <main>', async ({ page }) => {
    // Välj första "main" (undviker strict-mode kollision om fler finns)
    const main = page.getByRole('main').first();
    await main.scrollIntoViewIfNeeded();
    await expect(main).toBeVisible({ timeout: 15000 });
  });
});
