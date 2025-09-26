import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const browserName = process.env.MATRIX_BROWSER ?? 'all'
const reporters = isCI
  ? [
      ['list'],
      ['junit', {
        outputFile: `junit/junit-${browserName}.xml`,
        embedAnnotationsAsProperties: true,
      }],
    ]
  : [ ['html', { outputFolder: 'playwright-report', open: 'never' }] ]

// Sanitize CF Access env (remove stray CR/LF/whitespace)
const CF_ACCESS_CLIENT_ID = process.env.CF_ACCESS_CLIENT_ID?.trim()
const CF_ACCESS_CLIENT_SECRET = process.env.CF_ACCESS_CLIENT_SECRET?.trim()

// Only attach headers when both are present post-trim
const extraHeaders: Record<string, string> | undefined =
  CF_ACCESS_CLIENT_ID && CF_ACCESS_CLIENT_SECRET
    ? {
        'CF-Access-Client-Id': CF_ACCESS_CLIENT_ID,
        'CF-Access-Client-Secret': CF_ACCESS_CLIENT_SECRET,
      }
    : undefined

// Log whether CF Access headers are enabled for this run (visible in Actions logs)
if (CF_ACCESS_CLIENT_ID && CF_ACCESS_CLIENT_SECRET) {
  console.info('[e2e] CF Access headers ENABLED')
} else {
  console.info('[e2e] CF Access headers DISABLED (no ID/SECRET)')
}

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL: process.env.BASE_URL,
    extraHTTPHeaders: extraHeaders,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
  reporter: reporters,
})
