const { test, expect } = require('@playwright/test');

test.describe('Purchase button visibility', () => {
  test('purchase button is disabled when functions/stripe not configured', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.click('#accountBtn');
    // If you are not signed in, button should be disabled
    const isDisabled = await page.getAttribute('#purchaseBtn', 'disabled');
    expect(isDisabled).not.toBeNull();
  });
});
