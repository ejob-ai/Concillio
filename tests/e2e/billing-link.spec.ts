import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'https://concillio.pages.dev'

test('Billing-linken syns när body dataset har aktiv plan', async ({ page }) => {
  await page.goto(`${BASE}/account`, { waitUntil: 'domcontentloaded' })

  // Injicera datasets (som om SSR satt dem)
  await page.evaluate(() => {
    document.body.dataset.subscriptionActive = 'true'
    document.body.dataset.stripeCustomerId = 'cus_test_123'
    // Om init redan har körts, kalla explicit uppdatering
    if (typeof (window as any).__refreshBillingLinks === 'function') {
      (window as any).__refreshBillingLinks()
    } else {
      document.dispatchEvent(new Event('DOMContentLoaded'))
    }
  })

  // Billing-länken ska visas (desktop-nav först)
  const billingDesktop = page.locator('nav .nav-link[href="/app/billing"]').first()
  const billingAny = page.locator('[data-billing-link]').first()

  await expect(billingDesktop.or(billingAny)).toBeVisible({ timeout: 7000 })

  // och ska peka rätt
  const hrefAttr = await billingAny.getAttribute('href')
  expect(hrefAttr).toBe('/app/billing')
})
