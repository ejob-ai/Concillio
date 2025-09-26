import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: __dirname,
  timeout: 30_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  reporter: [['list'], ['junit', { outputFile: 'junit/junit-e2e.xml' }]],
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
