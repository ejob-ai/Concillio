import { test, expect } from '../fixtures/console'
import { captureDebug } from '../helpers/on-fail'

test('Portal guard: unauthenticated user is redirected to /login?next=/app/billing', async ({ page }, testInfo) => {
  if (process.env.ENVIRONMENT === 'preview' && ['firefox', 'webkit'].includes(testInfo.project.name)) {
    test.fixme(true, 'Flaky on FF/WebKit in preview')
  }
  try {
    // Ingen auth/cookies behövs – varje test körs i egen BrowserContext (tomt läge).
    await page.goto('/app/billing', { waitUntil: 'domcontentloaded' })

    const url = page.url()
    const u = new URL(url)

    // Verifiera redirect-mål
    expect(u.pathname).toBe('/login')
    expect(u.searchParams.get('next')).toBe('/app/billing')
  } catch (err) {
    await captureDebug(page, 'portal-guard-fail') // PNG + HTML vid fail
    throw err
  }
})
