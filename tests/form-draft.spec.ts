import { test, expect } from '@playwright/test';

const ORIGIN = 'https://<STAGING_ORIGIN>';
const FORM_URL = `${ORIGIN}/order-form`; // TODO: set actual route
const DASHBOARD_URL = `${ORIGIN}/dashboard`; // TODO: set actual route

test.describe('Autosave click-away persistence', () => {
  test('draft persists across internal navigation', async ({ page }) => {
    await page.goto(FORM_URL);
    await page.fill('[name="customer_name"]', 'Jane Doe');
    // simulate user clicking away quickly (internal route)
    await Promise.all([
      page.waitForURL('**/dashboard'),
      page.click('a[href="/dashboard"]'),
    ]);
    await Promise.all([
      page.waitForURL('**/order-form'),
      page.click('a[href="/order-form"]'),
    ]);
    await expect(page.locator('[name="customer_name"]')).toHaveValue('Jane Doe');
  });

  test('draft survives sub-1s click-away (debounce bypass)', async ({ page }) => {
    await page.goto(FORM_URL);
    await page.fill('[name="po_number"]', 'PO-12345');
    // leave in under a second; flush must bypass debounce
    await Promise.all([
      page.waitForURL('**/dashboard'),
      page.click('a[href="/dashboard"]'),
    ]);
    await Promise.all([
      page.waitForURL('**/order-form'),
      page.click('a[href="/order-form"]'),
    ]);
    await expect(page.locator('[name="po_number"]')).toHaveValue('PO-12345');
  });
});
