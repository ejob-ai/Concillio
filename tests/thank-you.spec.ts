// tests/thank-you.spec.ts
import { expect, test } from '@playwright/test'

function buildTarget(): string {
  const base = (process.env.PREVIEW_URL || process.env.BASE_URL || '').trim()
  if (!base) return ''
  const u = new URL('/thank-you', base)
  u.searchParams.set('plan', 'starter')
  u.searchParams.set('session_id', 'test')
  return u.toString()
}

// Do not swallow navigation errors; assert HEAD semantics and robots header when applicable
test('thank-you SSR: Access preflight + robots headers', async ({ page, request }) => {
  const target = buildTarget()
  if (!target) test.skip(true, 'Missing PREVIEW_URL/BASE_URL – skipping test.')

  // HEAD without following redirects: must be 200/204 OR 30x to /cdn-cgi/access/login
  const head = await request.fetch(target, { method: 'HEAD', maxRedirects: 0 })
  const headStatus = head.status()
  const headLoc = (head.headerValue('location') || '').toString()
  const headIsAccessRedirect = headStatus >= 300 && headStatus < 400 && headLoc.includes('/cdn-cgi/access/login')
  expect([200, 204].includes(headStatus) || headIsAccessRedirect).toBeTruthy()

  // GET navigation: do not catch errors; if we reach 2xx, assert X-Robots-Tag contains noindex
  const resp = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 15000 })
  expect(resp, 'navigation returned a response').toBeTruthy()
  if (resp && resp.ok()) {
    const xrobots = (resp.headers()['x-robots-tag'] || resp.headerValue?.('x-robots-tag') || '').toString().toLowerCase()
    expect(xrobots).toContain('noindex')
  }
})
