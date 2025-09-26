import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const junitFile = process.env.JUNIT_FILE || 'junit/junit-e2e.xml';
const htmlReportDir = process.env.PLAYWRIGHT_HTML_REPORT || process.env.PW_HTML_REPORT || 'playwright-report';

export default defineConfig({
  testDir: __dirname,
  timeout: 30_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  reporter: [
    ['list'],
    ['junit', { outputFile: junitFile }],
    ['html', { outputFolder: htmlReportDir, open: 'never' }],
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
