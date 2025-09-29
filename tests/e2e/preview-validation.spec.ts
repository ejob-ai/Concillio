import { test, expect } from '@playwright/test';
import { applyTestLogin } from './utils/auth';

// Preview-only: körs bara i PR-preview. Skippas på smoke/main.
const isPreview = process.env.TEST_CONTEXT === 'preview';
test.skip(!isPreview, 'Preview-only test (skippas på smoke/main)');

const baseUrl = process.env.BASE_URL!;

test.beforeEach(async ({ context }) => {
  await applyTestLogin(context, baseUrl);
});

test('visar preview-markören i <main>', async ({ page }) => {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main[data-preview-validation="2025-09-26"]')).toBeVisible();
});
