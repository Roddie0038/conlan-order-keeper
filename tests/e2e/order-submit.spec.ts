// tests/e2e/order-submit.spec.ts
import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_TEST_EMAIL || '';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || '';
const TEST_STORE = process.env.E2E_TEST_STORE || 'Grand Prairie 027'; // normalized
const TEST_DESC = process.env.E2E_TEST_DESC || 'E2E order submit sanity';
const TEST_QTY = Number(process.env.E2E_TEST_QTY || 2);

async function maybeSignIn(page) {
  // If a login flow exists, attempt it; otherwise continue.
  const loginHint = page.locator('text=/sign in|log in/i').first();
  if (await loginHint.count()) {
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    const pwdInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i));
    await emailInput.fill(TEST_EMAIL);
    await pwdInput.fill(TEST_PASSWORD);
    const submitBtn = page.getByRole('button', { name: /sign in|log in|submit/i });
    await Promise.all([page.waitForLoadState('networkidle'), submitBtn.click()]);
  }
}

async function gotoOrderForm(page) {
  await page.goto('/orders/new').catch(() => {});
  const newOrderBtn = page.getByRole('button', { name: /new order|create order/i });
  if (await newOrderBtn.count()) await newOrderBtn.first().click();
}

test('Order submit returns normalized store + plant', async ({ page }) => {
  await page.goto('/');
  await maybeSignIn(page);
  await gotoOrderForm(page);

  const storeInput =
    page.getByLabel(/store/i)
      .or(page.getByPlaceholder(/store/i))
      .or(page.locator('[name="store"]'))
      .or(page.locator('select[name="store"]'));
  await storeInput.first().fill(TEST_STORE);
  try { await storeInput.first().press('Enter'); } catch {}

  const descInput =
    page.getByLabel(/description/i)
      .or(page.getByPlaceholder(/description/i))
      .or(page.locator('[name="description"]'));
  if (await descInput.count()) await descInput.first().fill(TEST_DESC);

  const qtyInput =
    page.getByLabel(/quantity|qty/i)
      .or(page.getByPlaceholder(/quantity|qty/i))
      .or(page.locator('[name="quantity"]'));
  if (await qtyInput.count()) await qtyInput.first().fill(String(TEST_QTY));

  // Wait for the Supabase PostgREST insert to /rest/v1/orders
  const insertRespPromise = page.waitForResponse((resp) => {
    try {
      const url = new URL(resp.url());
      return resp.request().method() === 'POST' &&
             /\/rest\/v1\/orders(?:\?|$)/.test(url.pathname + url.search);
    } catch { return false; }
  }, { timeout: 15000 });

  const submitBtn =
    page.getByRole('button', { name: /submit|place order|create|save/i })
      .or(page.locator('button[type="submit"]'));
  await submitBtn.first().click();

  const resp = await insertRespPromise;
  expect(resp.ok()).toBeTruthy();

  const data = await resp.json();
  const row = Array.isArray(data) ? data[0] : data;

  expect(typeof row.id === 'number' || /^\d+$/.test(String(row.id))).toBeTruthy();
  expect(typeof row.store).toBe('string');
  expect(typeof row.plant).toBe('string');
  expect(row.store).toMatch(/^[A-Za-z ]+ 0\d{2}$/);
  expect(row.plant).toMatch(/^[A-Za-z ]+ 0\d{2}$/);
});