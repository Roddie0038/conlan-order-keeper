import { test, expect } from '@playwright/test';

test.describe('New Order Form Diagnostics', () => {
  test('should capture diagnostics events during navigation', async ({ page }) => {
    // Start with diagnostics enabled
    await page.goto('/?debug=1', { 
      waitUntil: 'networkidle'
    });

    // Navigate to New Order page
    await page.goto('/new-order?debug=1', {
      waitUntil: 'networkidle'
    });

    // Wait for form to load and fill in some test data (non-PII)
    await page.waitForSelector('form');
    
    // Fill some basic form fields
    await page.fill('input[name="productNumber"]', 'TEST-123');
    await page.fill('input[name="quantity"]', '5');
    await page.fill('textarea[name="description"]', 'Test description');

    // Wait a bit for form state to be captured
    await page.waitForTimeout(1000);

    // Navigate away to Dashboard
    await page.goto('/dashboard', {
      waitUntil: 'networkidle'
    });

    // Navigate back to New Order
    await page.goto('/new-order', {
      waitUntil: 'networkidle'
    });

    // Wait for page to settle
    await page.waitForTimeout(1000);

    // Extract diagnostics data from sessionStorage
    const diagnosticsData = await page.evaluate(() => {
      const data = sessionStorage.getItem('diag:new-order-form');
      return data ? JSON.parse(data) : [];
    });

    // Verify we captured the expected events
    expect(diagnosticsData).toBeDefined();
    expect(Array.isArray(diagnosticsData)).toBe(true);
    expect(diagnosticsData.length).toBeGreaterThan(0);

    // Check for key event types
    const eventKinds = diagnosticsData.map((event: any) => event.kind);
    
    // Should have navigation events
    expect(eventKinds).toContain('ROUTE_CHANGE');
    
    // Should have form lifecycle events
    expect(eventKinds).toContain('FORM_MOUNT');
    
    // Should have navigation type detection
    expect(eventKinds).toContain('NAVIGATION_TYPE');

    // Verify no PII is captured in form state events
    const formStateEvents = diagnosticsData.filter((event: any) => event.kind === 'FORM_STATE');
    for (const event of formStateEvents) {
      // Should only have aggregate counts, no actual field values
      expect(event).toHaveProperty('fieldCount');
      expect(event).toHaveProperty('dirtyFieldsCount');
      expect(event).toHaveProperty('touchedFieldsCount');
      expect(event).not.toHaveProperty('values');
      expect(event).not.toHaveProperty('data');
      
      // Counts should be reasonable numbers
      expect(typeof event.fieldCount).toBe('number');
      expect(typeof event.dirtyFieldsCount).toBe('number');
      expect(typeof event.touchedFieldsCount).toBe('number');
    }

    console.log('Captured diagnostics events:', diagnosticsData.length);
    console.log('Event types:', [...new Set(eventKinds)]);
  });

  test('should not capture diagnostics when disabled', async ({ page }) => {
    // Navigate without the diagnostics flag
    await page.goto('/new-order', {
      waitUntil: 'networkidle'
    });

    // Fill form
    await page.fill('input[name="productNumber"]', 'TEST-456');
    await page.waitForTimeout(500);

    // Navigate away and back
    await page.goto('/dashboard');
    await page.goto('/new-order');

    // Check that no diagnostics data was captured
    const diagnosticsData = await page.evaluate(() => {
      return sessionStorage.getItem('diag:new-order-form');
    });

    expect(diagnosticsData).toBeNull();
  });
});