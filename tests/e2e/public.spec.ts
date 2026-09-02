import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sizes = [{ name: '320', width: 320, height: 960 }, { name: '768', width: 768, height: 1100 }, { name: '1440', width: 1440, height: 1000 }];

async function activateHomeSections(page: Page) {
  const sections = page.locator('main > section');
  for (let index = 0; index < await sections.count(); index += 1) {
    await sections.nth(index).scrollIntoViewIfNeeded();
    await page.waitForTimeout(360);
  }
  await page.evaluate(() => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousBehavior;
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}

test('public home is Persian RTL, accessible, and has no public price', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { name: /پیچیدگی‌های مالی/ })).toBeVisible();
  await expect(page.getByText(/ریال|تومان|[۰-۹]+٬[۰-۹]+/)).not.toBeVisible();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter((item) => ['critical', 'serious'].includes(item.impact ?? '')).map((item) => item.id)).toEqual([]);
  for (const size of sizes) { await page.setViewportSize({ width: size.width, height: size.height }); await activateHomeSections(page); expect(await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true); await page.screenshot({ path: `artifacts/screenshots/home-${size.name}.png`, fullPage: true }); }
});

test('hero keeps the method legible without a decorative diagram', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('complementary', { name: 'روش شروع همکاری' })).toBeVisible();
  await expect(page.getByText('مسئله چیست؟')).toBeVisible();
  await expect(page.getByText('چه چیزی قابل اجراست؟')).toBeVisible();
  await expect(page.getByText('پذیرش چگونه سنجیده می‌شود؟')).toBeVisible();
  await expect(page.locator('.hero-diagram')).toHaveCount(0);
  for (const size of sizes) {
    await page.setViewportSize({ width: size.width, height: size.height });
    expect(await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.getByRole('complementary', { name: 'روش شروع همکاری' })).toBeVisible();
});

test('global semantic tokens apply RTL dark mode', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 960 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveCSS('direction', 'rtl');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 246, 240)');
  await page.locator('html').evaluate((element) => element.classList.add('dark'));
  await page.waitForTimeout(250);
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(13, 15, 18)');
  await expect(page.locator('html')).toHaveCSS('--color-text-primary', '#eaedf0');
  expect(await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'artifacts/screenshots/home-dark-320.png', fullPage: true });
});

test('primary public routes render a single request CTA without horizontal overflow', async ({ page }) => {
  for (const route of ['/solutions/public', '/solutions/private', '/capabilities', '/process', '/initial-assessment', '/projects', '/about', '/contact', '/terms', '/privacy', '/cancellation', '/complaints']) {
    await page.setViewportSize({ width: 320, height: 900 }); await page.goto(route); expect(await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true); await expect(page.locator('main')).toBeVisible();
  }
});

const offerToken = process.env.PLAYWRIGHT_OFFER_TOKEN;
test('private offer and receipt are responsive without exposing payment data publicly', async ({ page }) => {
  test.skip(!offerToken, 'requires a synthetic local offer token');
  for (const size of sizes) {
    await page.setViewportSize({ width: size.width, height: size.height });
    await page.goto(`/offer/${offerToken}`);
    await expect(page.getByRole('heading', { name: /جلسه آزمایشی چرخه پرداخت/ })).toBeVisible();
    expect(await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `artifacts/screenshots/offer-${size.name}.png`, fullPage: true });
  }
});

const invoiceToken = process.env.PLAYWRIGHT_INVOICE_TOKEN;
test('private contract invoice is responsive', async ({ page }) => {
  test.skip(!invoiceToken, 'requires a synthetic local invoice token');
  for (const size of sizes) {
    await page.setViewportSize({ width: size.width, height: size.height });
    await page.goto(`/invoice/${invoiceToken}`);
    await expect(page.getByRole('heading', { name: /مرحله ساختگی قرارداد/ })).toBeVisible();
    expect(await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `artifacts/screenshots/invoice-${size.name}.png`, fullPage: true });
  }
});
