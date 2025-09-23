import { defineConfig, devices } from '@playwright/test'

const extraHeaders: Record<string, string> = {}
if (process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET) {
  // Cloudflare Access expects these headers; header names are case-insensitive.
  extraHeaders['CF-Access-Client-Id'] = process.env.CF_ACCESS_CLIENT_ID
  extraHeaders['CF-Access-Client-Secret'] = process.env.CF_ACCESS_CLIENT_SECRET
}

export default defineConfig({
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    extraHTTPHeaders: Object.keys(extraHeaders).length ? extraHeaders : undefined,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }]
  ],
})
