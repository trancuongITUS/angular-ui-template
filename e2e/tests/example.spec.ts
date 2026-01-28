import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Sakai/);
});

test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
});
