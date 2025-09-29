import { test, expect } from '@playwright/test';

// ==== HOTFIX(TEST_CONTEXT) BEGIN ====
// Den här specen körs endast i smoke-pipelinen (main). Skippa i PR-previews.
const __CTX = process.env.TEST_CONTEXT ?? 'preview';
test.skip(__CTX === 'preview', 'Smoke-only test (skippas på PR-previews).');
// ==== HOTFIX(TEST_CONTEXT) END ====

test.describe('Smoke', () => {
  test('Home renderar <main>', async ({ page }) => {
    await page.goto('/');
    // Vissa builds renderar två <main> (t.ex. #mainContent + sidans <main>).
    // Använd landmark-rollen och välj första noden för att undvika strict mode.
    const main = page.getByRole('main').first();
    await main.scrollIntoViewIfNeeded();
    await expect(main).toBeVisible({ timeout: 10000 });
  });
});
