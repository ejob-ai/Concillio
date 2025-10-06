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

// Context (preview/smoke)
const ctx = (process.env.TEST_CONTEXT || 'preview').trim().toLowerCase()

export default defineConfig({
  testDir: 'tests',

  // Kör endast våra e2e-filer:
  // - allt som slutar på .e2e.spec.ts
  // - vår befintliga thank-you.spec.ts
  // (smoke filtreras bort i preview nedan)
  testMatch: ['**/*.e2e.spec.ts', 'thank-you.spec.ts', 'smoke*.spec.ts'],

  // I preview-läge: ignorera smoke* så att de inte körs av misstag
  // I smoke-läge: tillåt smoke*
  testIgnore: ctx === 'smoke' ? [] : ['**/smoke*.spec.ts'],

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
    extraHTTPHeaders: extraHeaders,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
