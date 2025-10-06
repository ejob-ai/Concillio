// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

const BROWSER = process.env.MATRIX_BROWSER || 'all';
const isCI = !!process.env.CI;

// Per-browser sökvägar (kan overrides via env i CI)
const JUNIT_FILE =
  process.env.JUNIT_FILE || `junit/junit-${BROWSER}.xml`;
const HTML_DIR =
  process.env.HTML_DIR || `playwright-report-${BROWSER}`;

export default defineConfig({
  testDir: 'tests',               // kör allt under tests/
  testMatch: [
    'e2e/**/*.spec.ts',           // våra e2e-tester
    'thank-you.spec.ts',          // fristående fil
  ],
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  expect: {
    timeout: 15_000,
  },
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
    baseURL: process.env.PREVIEW_URL || process.env.BASE_URL,
    trace: 'retain-on-failure',
    extraHTTPHeaders: {
      ...(() => {
        const cfId = (process.env.CF_ACCESS_CLIENT_ID || '').trim();
        const cfSecret = (process.env.CF_ACCESS_CLIENT_SECRET || '').trim();
        return cfId && cfSecret
          ? {
              'CF-Access-Client-Id': cfId,
              'CF-Access-Client-Secret': cfSecret,
            }
          : {};
      })(),
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
