import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const junitFile = process.env.JUNIT_FILE || 'junit/junit-e2e.xml';
const htmlDir   = process.env.PLAYWRIGHT_HTML_REPORT || 'playwright-report';

// Optional Cloudflare Access headers for protected environments
const cfId = (process.env.CF_ACCESS_CLIENT_ID || '').trim();
const cfSecret = (process.env.CF_ACCESS_CLIENT_SECRET || '').trim();
const extraHTTPHeaders = (cfId && cfSecret)
  ? { 'CF-Access-Client-Id': cfId, 'CF-Access-Client-Secret': cfSecret }
  : undefined;

export default defineConfig({
  testDir: './',
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : undefined,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    extraHTTPHeaders,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
  reporter: [
    ['list'],
    ['junit', { outputFile: junitFile }],
    ['html',  { outputFolder: htmlDir, open: 'never' }],
  ],
});
