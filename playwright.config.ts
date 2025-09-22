import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  timeout: 30_000,
  retries: 2,
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
})
