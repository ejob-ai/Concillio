import { test, expect } from '../fixtures/console'
import { captureDebug } from '../helpers/on-fail'
import { helperLogin } from '../helpers/test-login'

// Skip i produktion (helpers avstängda)
test.skip(process.env.ENVIRONMENT === 'production', 'helpers disabled in prod')

test('Portal guard: authenticated user sees portal button', async ({ page, request }) => {
  try {
    // Försök logga in via test-helper (endast aktiv i preview)
    const base = process.env.BASE_URL || ''
    const token = process.env.TEST_LOGIN_TOKEN
    const login = await helperLogin(request, base, token)

    // Om helpern inte är tillgänglig (saknas token, OFF, 403 etc) → skippa snyggt
    test.skip(!login.ok, `test-login helper not available (${login.status ?? 'no token'})`)

    // 2) Öppna sidan
    await page.goto('/app/billing', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/app\/billing/)
    await expect(page.getByRole('link', { name: /Open Billing Portal/i })).toBeVisible({ timeout: 7000 })
  } catch (err) {
    await captureDebug(page, 'portal-positive-fail')
    throw err
  }
})
