import { test, expect } from '@playwright/test'

// ==== HOTFIX(TEST_CONTEXT) BEGIN ====
const __HOTFIX_ctx = process.env.TEST_CONTEXT
test.skip(__HOTFIX_ctx === 'preview', 'Smoke körs endast på main (TEST_CONTEXT=smoke)')
// ==== HOTFIX(TEST_CONTEXT) END ====

test.describe('[smoke] Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('[smoke] Home renderar <main>', async ({ page }) => {
    // Robust "main" (för SSR/Pages-lager som ibland lägger flera wrappers)
    const main = page.getByRole('main').first()
    await main.scrollIntoViewIfNeeded()
    await expect(main).toBeVisible({ timeout: 15000 })
  })
})
