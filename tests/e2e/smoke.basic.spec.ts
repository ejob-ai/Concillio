import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('[smoke] Home renderar <main>', async ({ page }) => {
    const resp = await page.goto('/');
    expect(resp && resp.ok(), 'GET / ska ge 2xx').toBeTruthy();

    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});
