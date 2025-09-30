import { test, expect } from '@playwright/test';

// ==== HOTFIX(TEST_CONTEXT) ================================================
// Kör ENDAST denna spec i smoke-pipelinen (main). Defaulta till "preview"
// om TEST_CONTEXT saknas → skippa i PR-previews och övriga okända miljöer.
const __CTX = (process.env.TEST_CONTEXT ?? 'preview').toLowerCase();
test.skip(__CTX !== 'smoke', 'Smoke-only spec – körs bara när TEST_CONTEXT=smoke.');
// ==== HOTFIX END ==========================================================

test.describe('[smoke] Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('[smoke] Home renderar <main>', async ({ page }) => {
    // Välj första "main" (undvik strict-mode-kollision om flera finns)
    const main = page.getByRole('main').first();
    await main.scrollIntoViewIfNeeded();
    await expect(main).toBeVisible({ timeout: 15000 });
  });
});
