// tests/thank-you.spec.ts
import { expect, test } from '@playwright/test';

function buildTarget(): string {
  const base = process.env.PREVIEW_URL || process.env.BASE_URL || '';
  if (!base) return '';
  const u = new URL('/thank-you', base);
  // (behåll/ta bort parametrar efter behov – ofarligt)
  u.searchParams.set('plan', 'starter');
  u.searchParams.set('session_id', 'test');
  return u.toString();
}

test('thank-you SSR + X-Robots-Tag (preview/main)', async ({ page, request }) => {
  const target = buildTarget();
  if (!target) test.skip(true, 'Ogiltig PREVIEW_URL/BASE_URL – skippar testet.');

  // 1) Sanity: sidan ska kunna laddas (utan att krascha)
  const resp = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 15_000 }).catch(() => null);
  expect(resp, 'page.goto() ska ge ett svar').toBeTruthy();

  // 2) HEAD utan redirect-följning: acceptera 200/204 eller Access-redirect
  const head = await request.fetch(target, { method: 'HEAD', maxRedirects: 0 });
  const hStatus = head.status();
  const headRedirectOK =
    hStatus >= 300 && hStatus < 400 &&
    (head.headers().location || '').includes('/cdn-cgi/access/login');
  expect([200, 204].includes(hStatus) || headRedirectOK)
    .toBeTruthy();

  // 3) GET (utan att följa redirects) – om 200: kontrollera X-Robots-Tag
  const getResp = await request.fetch(target, { method: 'GET', maxRedirects: 0 });
  const gStatus = getResp.status();
  if (gStatus >= 200 && gStatus < 300) {
    const robots = (getResp.headers()['x-robots-tag'] || '').toString().toLowerCase();
    // thank-you ska inte indexeras
    expect(robots).toContain('noindex');
  } else {
    // Vid Access-redirect saknas ofta innehålls-headers → inga robots-krav här
    const loc = (getResp.headers().location || '').toString();
    expect(gStatus).toBeGreaterThanOrEqual(300);
    expect(gStatus).toBeLessThan(400);
    expect(loc.includes('/cdn-cgi/access/login')).toBeTruthy();
  }
});
