import { test, expect } from '../fixtures/console'
import { captureDebug } from '../helpers/on-fail'

const hdrs = { 'x-test-auth': process.env.TEST_LOGIN_TOKEN || '' }

test('Portal guard: authenticated user sees portal button', async ({ page }) => {
  try {
    // 1) Sätt session via CI-säkrad helper (POST + token)
    const resp = await page.request.post('/api/test/login', {
      headers: hdrs,
      data: { email: 'e2e-billing@example.com', customerId: 'cus_e2e_123', plan: 'starter', status: 'active', seats: 1 },
    })
    expect(resp.ok()).toBeTruthy()

    // 2) Öppna sidan
    await page.goto('/app/billing', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/app\/billing/)
    await expect(page.getByRole('link', { name: /Open Billing Portal/i })).toBeVisible({ timeout: 7000 })
  } catch (err) {
    await captureDebug(page, 'portal-positive-fail')
    throw err
  }
})
