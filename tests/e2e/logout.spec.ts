import { test, expect } from '../fixtures/console'
import { captureDebug } from '../helpers/on-fail'

const hdrs = { 'x-test-auth': process.env.TEST_LOGIN_TOKEN || '' }

// Skip the suite if helper is not enabled/token not configured
// Playwright supports conditional skip at runtime
// @ts-ignore
if (!process.env.TEST_LOGIN_TOKEN) test.skip(true, 'test-login helper not enabled')

test('Logout clears session and guard redirects', async ({ page }) => {
  try {
    // 1) Log in via helper
    const r = await page.request.post('/api/test/login', { headers: hdrs, data: { email: 'e2e-logout@example.com' } })
    if (r.status() === 403) test.skip(true, 'test-login helper disabled in this environment')

    // 2) Confirm access to /app/billing
    await page.goto('/app/billing', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/app\/billing/)

    // 3) Logout via helper
    const r2 = await page.request.post('/api/test/logout', { headers: hdrs })
    expect(r2.status()).toBe(200)

    // 4) Attempt to access again → should redirect to /login
    await page.goto('/app/billing', { waitUntil: 'domcontentloaded' })
    const url = new URL(page.url())
    expect(url.pathname).toBe('/login')
  } catch (err) {
    await captureDebug(page, 'logout-fail')
    throw err
  }
})
