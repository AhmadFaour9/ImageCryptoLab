const { test, expect } = require('@playwright/test');

test.describe('Auth verification check', () => {
  test('check verification button hidden for anonymous users and prompts sign-in', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.click('#accountBtn');
    // Button should not be visible (no sign-in)
    const visible = await page.isVisible('#checkVerificationBtn');
    expect(visible).toBe(false);

    // Try clicking it (should be absent, clicking the DOM doesn't happen) - instead click via JS and expect a warning notification
    await page.evaluate(() => {
      const btn = document.getElementById('checkVerificationBtn');
      if (btn) btn.click();
    });

    // If no button exists, ensure the UI still informs sign-in flow via the modal content
    const notif = await page.waitForSelector('.notification', { timeout: 1000 });
    const text = await notif.textContent();
    expect(text.toLowerCase()).toContain('sign in');
  });
});
