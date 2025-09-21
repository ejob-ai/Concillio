import { test as base, expect } from '../fixtures/console'
import { captureDebug } from '../helpers/on-fail'

const hasToken = !!process.env.TEST_LOGIN_TOKEN
// Skippa testet om vi inte har token (t.ex. på main/prod)
const test = hasToken ? base : (base.skip as typeof base)

test('Portal guard: authenticated user sees portal button', async ({ page }) => {
  try {
    // 1) Sätt session via CI-säkrad helper
    const r = await page.request.post('/api/test/login', {
      headers: { 'x-test-auth': process.env.TEST_LOGIN_TOKEN || '' },
      data: { email: 'e2e-billing@example.com', customerId: 'cus_e2e_123', plan: 'starter', status: 'active' },
    })

    // Om helpern är avstängd i miljön: skippa snyggt
    if (r.status() === 403) test.skip(true, 'test-login helper disabled in this environment')

    expect(r.status()).toBe(200)

    // 2) Öppna sidan
    await page.goto('/app/billing', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/app\/billing/)
    await expect(page.getByRole('link', { name: /Open Billing Portal/i })).toBeVisible({ timeout: 7000 })
  } catch (err) {
    await captureDebug(page, 'portal-positive-fail')
    throw err
  }
})
