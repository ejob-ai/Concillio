import type { BrowserContext } from '@playwright/test'

export async function applyTestLogin(context: BrowserContext, baseUrl: string) {
  const token = process.env.TEST_LOGIN_TOKEN
  if (!token || !baseUrl) return
  try {
    const u = new URL(baseUrl)
    await context.addCookies([
      {
        name: 'TEST_LOGIN_TOKEN',
        value: token,
        domain: u.hostname,
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'Lax'
      }
    ])
  } catch (e) {
    console.warn('[e2e] Failed to apply TEST_LOGIN_TOKEN cookie:', e)
  }
}
