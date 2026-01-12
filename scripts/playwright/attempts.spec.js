// Playwright test skeleton: validate decrypt attempt limiter behavior
// Requires: npm i -D @playwright/test

const { test, expect } = require('@playwright/test');

test.describe('Decrypt attempt limiter', () => {
  test('anonymous users are limited after 5 attempts and prompted to sign in', async ({ page }) => {
    await page.goto('http://localhost:8000');

    // Ensure decrypt panel visible
    await page.click('button[data-tab="decrypt"]');

    // Paste an invalid ciphertext and attempt 6 times
    for (let i = 0; i < 6; i++) {
      await page.fill('#decIn', 'invalid:invalid:deadbeef');
      await page.fill('#decPass', 'wrongpass');
      await page.click('#decryptBtn');
    }

    // On 6th attempt, the button should be disabled or auth modal shown
    const isDisabled = await page.getAttribute('#decryptBtn', 'disabled');
    expect(isDisabled).not.toBeNull();

    // Auth modal should be visible
    const modalVisible = await page.isVisible('#authModal');
    expect(modalVisible).toBe(true);
  });
});
