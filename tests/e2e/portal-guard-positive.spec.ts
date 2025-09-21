import { test, expect } from '../fixtures/console'
import { captureDebug } from '../helpers/on-fail'

test('Portal guard allows logged-in user', async ({ page }) => {
  try {
    // Logga in via dev-helpern (ej aktiv på prod-host)
    await page.goto('/api/test-login?email=test@example.com', { waitUntil: 'domcontentloaded' })

    // Gå till /app/billing och förvänta att vi stannar där
    await page.goto('/app/billing', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/app\/billing/)

    // UI: ska visa portal-knappen
    await expect(page.getByText(/Open Billing Portal/)).toBeVisible({ timeout: 7000 })
  } catch (err) {
    await captureDebug(page, 'portal-positive-fail')
    throw err
  }
})
