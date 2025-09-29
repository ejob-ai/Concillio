// tests/e2e/billing-link.spec.ts
import { test, expect } from '@playwright/test'

const CI_ENV = process.env.CI_ENV || ''
const IS_PROD = CI_ENV.toLowerCase() === 'production'

test.skip(
  IS_PROD,
  'Billing-linken är dold för oinloggade i production; körs endast i preview med hjälpinloggning.'
)

test('Billing-linken syns', async ({ page }) => {
  // Om test-login-token finns (preview), sätt cookie så att headern visar billing-länken.
  const token = process.env.TEST_LOGIN_TOKEN
  const base = process.env.BASE_URL ? new URL(process.env.BASE_URL) : null

  if (token && base) {
    await page.context().addCookies([
      {
        name: 'test_login_token',
        value: token,
        domain: base.hostname,
        path: '/',
        httpOnly: false,
        secure: true,
        sameSite: 'Lax'
      }
    ])
  }

  await page.goto('/')
  // Förhindra strict-mode violation: välj själva länken i menyn och ta .first()
  const billing = page
    .locator('#site-menu [data-billing-link="true"], a.menu-link[data-billing-link="true"]')
    .first()
  await billing.scrollIntoViewIfNeeded()
  await expect(billing).toBeVisible({ timeout: 10000 })
})
