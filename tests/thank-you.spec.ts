import { test, expect } from '@playwright/test';

function buildTarget(): string {
  const base = process.env.PREVIEW_URL || process.env.BASE_URL || '';
  if (!base) return '';
  return new URL('/thank-you', base).toString();
}

test('thank-you SSR + X-Robots-Tag (preview/main)', async ({ page, request }) => {
  const target = buildTarget();
  test.skip(!target, 'Ogiltig PREVIEW_URL/BASE_URL – skippar testet.');

  // 1) Navigera stabilt
  const resp = await page.goto(target, { waitUntil: 'domcontentloaded' });
  expect(resp, 'page.goto() gav inget svar').toBeTruthy();

  // 2) Status-regler: OK (200/204) ELLER Access-redirect (3xx -> /cdn-cgi/access/login)
  const status = resp!.status();
  const loc = resp!.headers()['location'] || '';
  const isAccessRedirect = status >= 300 && status < 400 && loc.includes('/cdn-cgi/access/login');
  expect(
    status === 200 || status === 204 || isAccessRedirect,
    `Oväntad status: ${status} (location=${loc || '-'})`
  ).toBeTruthy();

  // 3) HEAD utan redirect – kontrollera X-Robots-Tag: noindex
  const head = await request.fetch(target, { method: 'HEAD', maxRedirects: 0 });
  // tillåt 200/204 eller access-redirect även här
  const hStatus = head.status();
  const hLoc = head.headers()['location'] || '';
  const headRedirectOK =
    hStatus >= 300 && hStatus < 400 && hLoc.includes('/cdn-cgi/access/login');
  expect([200, 204].includes(hStatus) || headRedirectOK).toBeTruthy();

  const robots = (head.headers()['x-robots-tag'] || '').toString().toLowerCase();
  expect(robots).toContain('noindex');
});
