import { test, expect } from '../fixtures/console'
import { captureDebug } from '../helpers/on-fail'

test('Portal guard: authenticated user can open /app/billing and see portal button', async ({ page }) => {
  try {
    // Logga in testuser och få stripe_customer_id + aktiv subscription (dev/preview only)
    await page.goto('/api/test-login?email=e2e-billing@example.com&customerId=cus_e2e_123&plan=starter&status=active&seats=1', { waitUntil: 'domcontentloaded' })

    // Besök billing-sidan
    await page.goto('/app/billing', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/app\/billing/)

    // Verifiera att knappen finns
    await expect(page.getByRole('link', { name: /open billing portal/i })).toBeVisible({ timeout: 7000 })
  } catch (err) {
    await captureDebug(page, 'portal-positive-fail')
    throw err
  }
})
