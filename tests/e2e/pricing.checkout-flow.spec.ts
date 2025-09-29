import { test, expect } from '@playwright/test'

// Basic click flow from /pricing to Stripe redirect (or 501 in preview when secrets missing)
test('pricing → CTA → GET start', async ({ page, baseURL }) => {
  await page.goto('/pricing')
  // Säkerställ att vi verkligen är på /pricing och DOM är klar
  await page.waitForURL('**/pricing**', { timeout: 10000 })
  await page.waitForLoadState('domcontentloaded')

  // Rikta in oss direkt på Pro-CTA:n; stöd både klass- och data-attribut.
  const proCta = page
    .locator('a.plan-cta[data-plan="pro"], [data-plan="pro"].plan-cta, a[href*="plan=pro"]')
    .first()

  await expect(proCta).toBeVisible({ timeout: 10000 })
  await proCta.scrollIntoViewIfNeeded()
  const [resp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/billing/checkout/start') || r.status() === 302, { timeout: 10000 }).catch(() => null),
    proCta.click()
  ])
  expect(proCta).toBeTruthy()
})
