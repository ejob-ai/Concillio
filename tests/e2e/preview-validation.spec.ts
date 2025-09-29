import { test, expect } from '@playwright/test';
import { applyTestLogin } from './utils/auth';

// ==== HOTFIX(TEST_CONTEXT) BEGIN ====
// Detta är ett preview-endast test. Skippa i alla andra sammanhang (t.ex. main/smoke).
// Revert: ta bort blocket mellan HOTFIX-kommentarerna.
const __HOTFIX_isPreview = process.env.TEST_CONTEXT === 'preview';
test.skip(!__HOTFIX_isPreview, 'Preview-only test (skippas på main/smoke).');
// ==== HOTFIX(TEST_CONTEXT) END ====

const baseUrl = process.env.BASE_URL!;

test.beforeEach(async ({ context }) => {
  await applyTestLogin(context, baseUrl);
});

test('visar preview-markören i <main>', async ({ page }) => {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main[data-preview-validation="2025-09-26"]')).toBeVisible();
});
