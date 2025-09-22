import { test, expect } from '../fixtures/console'
import { captureDebug } from '../helpers/on-fail'

test('Billing-linken syns', async ({ page }, testInfo) => {
  if (process.env.ENVIRONMENT === 'preview' && ['firefox', 'webkit'].includes(testInfo.project.name)) {
    test.fixme(true, 'Flaky on FF/WebKit in preview')
  }
  await page.goto('/account')

  // simulerar aktiv prenumeration
  await page.evaluate(() => {
    document.body.dataset.subscriptionActive = 'true'
    document.body.dataset.stripeCustomerId = 'cus_test_123'
    ;(window as any).__refreshBillingLinks?.()
  })

  const billing = page.locator('[data-billing-link]')
  try {
    await expect(billing).toBeVisible({ timeout: 7000 })
  } catch (err) {
    await captureDebug(page, 'billing-fail')
    throw err
  }
})
