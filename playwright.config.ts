import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',                            // only E2E dir
  testMatch: /.*\.spec\.(ts|tsx|js)$/,         // *.spec.* only
  testIgnore: ['src/**', '**/__tests__/**'],   // belt & suspenders
  retries: 0,
  timeout: 30_000,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // enable others later if you want:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});