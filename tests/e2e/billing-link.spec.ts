import { test, expect } from '@playwright/test'
import { promises as fs } from 'node:fs'

test('Billing-linken syns', async ({ page }) => {
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
    if (process.env.CI) {
      try { await fs.mkdir('test-results', { recursive: true }) } catch {}
      await page.screenshot({ path: 'test-results/billing-fail.png', fullPage: true })
      const html = await page.content()
      await fs.writeFile('test-results/billing-fail.html', html)
    }
    throw err
  }
})
