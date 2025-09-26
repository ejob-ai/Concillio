import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL!;

test.describe('Preview validation', () => {
  test('visar preview-markören i <main>', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const marker = page.locator('main[data-preview-validation="2025-09-26"]');
    await expect(marker).toBeVisible();
  });
});
