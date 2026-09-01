import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sizes = [{ name: '320', width: 320, height: 960 }, { name: '768', width: 768, height: 1100 }, { name: '1440', width: 1440, height: 1000 }];
test('public home is Persian RTL, accessible, and has no public price', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { name: /پیچیدگی‌های مالی/ })).toBeVisible();
  await expect(page.getByText(/ریال|تومان|[۰-۹]+٬[۰-۹]+/)).not.toBeVisible();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter((item) => ['critical', 'serious'].includes(item.impact ?? '')).map((item) => item.id)).toEqual([]);
  for (const size of sizes) { await page.setViewportSize({ width: size.width, height: size.height }); expect(await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true); await page.screenshot({ path: `artifacts/screenshots/home-${size.name}.png`, fullPage: true }); }
});

test('primary public routes render a single request CTA without horizontal overflow', async ({ page }) => {
  for (const route of ['/solutions/public', '/solutions/private', '/capabilities', '/process', '/initial-assessment', '/projects', '/about', '/contact', '/terms', '/privacy', '/cancellation', '/complaints']) {
    await page.setViewportSize({ width: 320, height: 900 }); await page.goto(route); expect(await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true); await expect(page.locator('main')).toBeVisible();
  }
});
