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

test('thank-you SSR: Access preflight + robots headers', async ({ page, request }) => {
  const target = buildTarget()
  if (!target) test.skip(true, 'Missing PREVIEW_URL/BASE_URL – skipping test.')

  // HEAD utan att följa redirects: 200/204 ELLER 30x till Cloudflare Access-login
  const head = await request.fetch(target, { method: 'HEAD', maxRedirects: 0 })
  const headStatus = head.status()
  const headLoc = String((head.headers()['location'] ?? ''))
  const isAccessRedirect =
    headStatus >= 300 && headStatus < 400 && headLoc.includes('/cdn-cgi/access/login')
  expect([200, 204].includes(headStatus) || isAccessRedirect).toBeTruthy()

  // Navigera: om vi landar på 2xx (ej via redirect), kontrollera X-Robots-Tag
  const resp = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 15_000 })
  expect(resp, 'navigation returned a response').toBeTruthy()
  const wasRedirected = !!resp?.request()?.redirectedFrom()
  if (resp && resp.ok() && !wasRedirected) {
    const xrobots = String((resp.headers()['x-robots-tag'] ?? '')).toLowerCase()
    expect(xrobots).toContain('noindex')
  }
})
