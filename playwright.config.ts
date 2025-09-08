import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',                            // Only E2E directory
  testMatch: /.*\.spec\.(ts|tsx|js)$/,         // Only *.spec.* files
  testIgnore: ['src/**', '**/__tests__/**'],   // Ignore unit test directories
  retries: 0,
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { 
      name: 'chromium', 
      use: { ...devices['Desktop Chrome'] } 
    },
    // Additional browsers can be enabled later:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});