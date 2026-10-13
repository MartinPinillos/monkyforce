import { expect, test } from '@playwright/test';

test('loads MonkyForce home', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Gestión de producción textil' }),
  ).toBeVisible();
});
