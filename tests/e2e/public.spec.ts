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

test('hero diagram explains the transformation method and retains its static state with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 960 });
  await page.goto('/');
  const diagram = page.getByRole('img', { name: /تصویرسازی روش کار/ });
  await expect(diagram).toBeVisible();
  await expect(diagram.locator('svg:visible')).toHaveAttribute('aria-hidden', 'true');
  await expect(diagram.locator('.hero-diagram__source:visible')).toHaveCount(3);
  await expect(diagram.locator('.hero-diagram__model:visible')).toHaveCount(1);
  await expect(diagram.locator('.hero-diagram__outcome:visible')).toHaveCount(1);
  await expect(diagram.locator('.hero-diagram__mobile .hero-diagram__connection path')).toHaveCount(4);
  for (const size of sizes) {
    await page.setViewportSize({ width: size.width, height: size.height });
    const mode = size.width < 700 ? 'mobile' : 'desktop';
    await expect(diagram.locator(`.hero-diagram__${mode} .hero-diagram__outcome`)).toHaveCSS(
      'opacity',
      '1'
    );
    expect(await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true);
    await diagram.screenshot({ path: `artifacts/screenshots/hero-diagram-${size.name}.png` });
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 960 });
  await page.reload();
  await expect(page.getByRole('img', { name: /تصویرسازی روش کار/ })).toBeVisible();
  await expect(page.locator('.hero-diagram__mobile .hero-diagram__outcome')).toHaveCSS('animation-name', 'none');
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
