const { test, expect } = require('@playwright/test');

test.describe('Email signup UI', () => {
  test('email form appears and can request verification', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.click('#showEmailFormBtn');
    const visible = await page.isVisible('#emailAuthForm');
    expect(visible).toBe(true);
    // ensure buttons present
    expect(await page.isVisible('#authEmailSignUp')).toBe(true);
    expect(await page.isVisible('#authEmailSignIn')).toBe(true);
  });
});
