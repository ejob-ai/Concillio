import { test, expect } from '@playwright/test';

test('thank-you SSR + X-Robots-Tag (preview)', async ({ page }) => {
  const base = process.env.PREVIEW_URL ?? process.env.BASE_URL ?? '';
  if (!base) test.skip(true, 'Ogiltig PREVIEW_URL/BASE_URL – skippar testet.');

  const target = new URL('/thank-you', base).toString();

  // 1) Sanity: sidan laddas och <main.thankyou-page> finns
  const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 15_000 });
  expect(response, 'kunde inte ladda sidan').toBeTruthy();

  // 2) SSR-markör
  const hasMain = await page.locator('main.thankyou-page').count();
  expect(hasMain, 'main.thankyou-page ska finnas').toBeGreaterThan(0);

  // 3) Hämta head via request (ingen -L)
  const head = await page.request.fetch(target, { method: 'HEAD', maxRedirects: 0 });
  expect(head.ok(), 'HEAD ska vara OK eller Access-redirect (hanteras i smoke)').toBeTruthy();

  const xRobots = head.headers().get('x-robots-tag') ?? head.headers().get('X-Robots-Tag');
  expect(xRobots, 'X-Robots-Tag saknas').toBeTruthy();
  expect(xRobots!).toMatch(/noindex/i);
  expect(xRobots!).toMatch(/nofollow/i);
});
