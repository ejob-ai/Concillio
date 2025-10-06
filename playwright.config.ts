// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const BROWSER = process.env.MATRIX_BROWSER || process.env.PLAYWRIGHT_BROWSER || 'all'

// Report paths – support both new and legacy env names
const HTML_DIR = (process.env.HTML_DIR || process.env.PLAYWRIGHT_HTML_REPORT || `playwright-report-${BROWSER}`).trim()
const JUNIT_FILE = (process.env.JUNIT_FILE || `junit/junit-${BROWSER}.xml`).trim()

// CF Access (whitespace-safe)
const cfId = (process.env.CF_ACCESS_CLIENT_ID || '').trim()
const cfSecret = (process.env.CF_ACCESS_CLIENT_SECRET || '').trim()
const extraHeaders = cfId && cfSecret
  ? {
      'CF-Access-Client-Id': cfId,
      'CF-Access-Client-Secret': cfSecret,
    }
  : undefined

export default defineConfig({
  // Discover tests under ./tests
  testDir: 'tests',

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  expect: { timeout: 15_000 },

  reporter: isCI
    ? [
        ['list'],
        ['junit', { outputFile: JUNIT_FILE }],
        ['html', { outputFolder: HTML_DIR, open: 'never' }],
      ]
    : [
        ['list'],
        ['html', { outputFolder: HTML_DIR, open: 'never' }],
      ],

  use: {
    baseURL: (process.env.PREVIEW_URL || process.env.BASE_URL || '').trim(),
    trace: 'retain-on-failure',
    // Only include headers when both CF Access secrets are present
    extraHTTPHeaders: extraHeaders,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
