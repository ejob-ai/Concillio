import { test, expect } from '@playwright/test';

test.describe('Thank-you page (preview)', () => {
  test('SSR marker + X-Robots-Tag header', async ({ page }, testInfo) => {
    // 1) Hitta mål-URL
    const baseURL = (testInfo.project.use as any)?.baseURL as string | undefined;
    const envURL =
      process.env.PREVIEW_URL ||
      process.env.BASE_URL ||
      process.env.PLAYWRIGHT_BASE_URL ||
      '';

    // Om baseURL finns i config använder vi relativ path (bästa vägen).
    // Annars försöker vi bygga absolut URL från env.
    let target = '/thank-you';
    if (!baseURL) {
      if (!envURL) test.skip(true, 'Ingen baseURL/PREVIEW_URL satt i CI – skippar testet.');
      try {
        target = new URL('/thank-you', envURL).toString();
      } catch {
        test.skip(true, 'Ogiltig PREVIEW_URL/BASE_URL – skippar testet.');
      }
    }

    // 2) Navigera och fånga response + headers
    const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    expect(response, 'Kunde inte ladda sidan').toBeTruthy();
    const status = response!.status();
    const headers = response!.headers();
    const location = (headers['location'] || headers['Location'] || '').toString();

    // 3) Om Access-login-redirect → skippa (preflighten har redan verifierat det)
    if ((status >= 300 && status < 400) && location.includes('/cdn-cgi/access/login')) {
      test.skip(true, 'Preview kräver Access och saknar creds i denna körning – skippar SSR-asserts.');
    }

    // 4) Annars: asserta lyckad laddning + robots-header + SSR-markör
    expect(status, `Oväntad HTTP-status: ${status}`).toBeLessThan(400);

    const robots = (headers['x-robots-tag'] || headers['X-Robots-Tag'] || '').toString().toLowerCase();
    expect(robots, 'X-Robots-Tag ska innehålla noindex,nofollow')
      .toContain('noindex');
    expect(robots).toContain('nofollow');

    const main = page.locator('main.thankyou-page');
    await expect(main, 'Hittar inte <main.thankyou-page>').toBeVisible();
    // data-preview-validation ska finnas och likna YYYY-MM-DD
    await expect(main).toHaveAttribute('data-preview-validation', /20\d{2}-\d{2}-\d{2}/);
  });
});
