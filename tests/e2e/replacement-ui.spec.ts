import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

const expectedHeadline = 'پیچیدگی‌های مالی و کسب‌وکاری را به فرایند، سامانه و محصول قابل‌اجرا تبدیل می‌کنیم.';

test('canonical public experience is RTL, accessible and release-gated', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(expectedHeadline);
  await expect(page.getByRole('link', { name: /شرح مسئله‌تان را شروع کنید/ })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'پرش به محتوای اصلی' })).toBeFocused();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('approved guided-confidence hero uses Persian steps, bundled typography and reduced-motion fallback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const journey = page.locator('.trust-journey');
  await expect(journey).toBeVisible();
  await expect(journey.locator('li')).toHaveCount(4);
  await expect(journey.locator('li').first()).toContainText('۰۱');
  await expect(journey.locator('li').last()).toContainText('۰۴');
  const visualContract = await page.evaluate(() => ({
    font: getComputedStyle(document.body).fontFamily,
    blue: getComputedStyle(document.documentElement).getPropertyValue('--blue').trim(),
    direction: getComputedStyle(document.documentElement).direction,
  }));
  expect(visualContract.font).toContain('Vazirmatn Variable');
  expect(visualContract.blue).toBe('#0a66c2');
  expect(visualContract.direction).toBe('rtl');
});

test('transformation map connects one problem to five analysis layers and one executable outcome', async ({ page }) => {
  await page.goto('/');
  const map = page.locator('.system-map');
  await map.scrollIntoViewIfNeeded();
  await expect(map.getByText('مسئله سازمانی', { exact: true })).toBeVisible();
  await expect(map.getByText('تصمیم قابل اجرا', { exact: true })).toBeVisible();
  await expect(map.locator('.map-path')).toHaveCount(5);

  const layers = map.getByRole('group', { name: 'لایه‌های تحلیل مسئله' });
  await expect(layers.getByRole('button')).toHaveCount(5);
  const dataLayer = layers.getByRole('button', { name: /داده/ });
  await dataLayer.click();
  await expect(dataLayer).toHaveAttribute('aria-pressed', 'true');
  await expect(map.locator('.map-reading')).toContainText('کیفیت، یکپارچگی و قابلیت اتکا');
});

for (const width of [320, 768, 1440]) {
  test(`home remains composed without horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 760 : 900 });
    await page.goto('/');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const transformationMap = page.locator('.system-map');
    await transformationMap.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1100);
    await page.locator('.site-header, .skip-link, .scroll-progress').evaluateAll((elements) => elements.forEach((element) => {
      (element as HTMLElement).style.display = 'none';
    }));
    await page.evaluate(() => new Promise(requestAnimationFrame));
    await transformationMap.screenshot({ path: `artifacts/screenshots/replacement-diagram-${width}.png` });
    await page.locator('.site-header, .skip-link, .scroll-progress').evaluateAll((elements) => elements.forEach((element) => {
      (element as HTMLElement).style.display = '';
    }));
    for (const section of await page.locator('main section').all()) await section.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `artifacts/screenshots/replacement-home-${width}.png`, fullPage: true });
    await page.screenshot({ path: `artifacts/screenshots/replacement-first-viewport-${width}.png` });
  });
}

test('mobile navigation opens and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'بازکردن فهرست' });
  await trigger.click();
  const navigation = page.getByRole('navigation', { name: 'ناوبری موبایل' });
  await expect(navigation).toBeVisible();
  const firstLink = navigation.getByRole('link').first();
  const lastLink = navigation.getByRole('link').last();
  await expect(firstLink).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(lastLink).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(firstLink).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('primary public and intake routes render meaningful Persian headings', async ({ page }) => {
  for (const route of ['/solutions/private', '/solutions/public', '/capabilities', '/process', '/initial-assessment', '/projects', '/about', '/contact', '/complaints', '/request', '/login']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  }
});

const evidenceRoutes = [
  ['public-detail', '/solutions/private', 'راهکار برای سازمان‌های خصوصی'],
  ['login', '/login', 'ورود بدون رمز عبور'],
  ['request', '/request', 'چه مسئله‌ای باید روشن شود؟'],
  ['account', '/account', 'درخواست‌های شما'],
  ['offer', '/offer/demo', 'خلاصه مبلغ'],
  ['payment', '/pay/demo', 'پرداخت امن سفارش خصوصی'],
  ['invoice', '/invoice/demo', 'سند خصوصی'],
  ['complaints', '/complaints', 'ثبت شکایت'],
  ['admin', '/admin', 'نمای کلی']
] as const;

test('representative public, customer, commerce and internal states pass visual evidence', async ({ page }) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 320 ? 760 : 900 });
    for (const [name, path, readyText] of evidenceRoutes) {
      await mockApi(page, name);
      await page.goto(path);
      await expect(page.getByText(readyText, { exact: false }).first()).toBeVisible();
      await page.waitForTimeout(500);
      const overflow = await page.evaluate(() => ({
        delta: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        offenders: Array.from(document.querySelectorAll<HTMLElement>('body *')).map((element) => ({ tag: element.tagName, className: element.className, text: element.innerText?.slice(0, 40), rect: element.getBoundingClientRect().toJSON() })).filter(({ rect }) => rect.left < -1 || rect.right > document.documentElement.clientWidth + 1).slice(0, 8)
      }));
      expect(overflow.delta, `${name}: ${JSON.stringify(overflow.offenders)}`).toBeLessThanOrEqual(1);
      if (name === 'public-detail') await expect(page.locator('.detail-point')).toHaveCount(3);
      if (name === 'admin' && width === 320) {
        const clippedTabs = await page.locator('.admin-nav nav button').evaluateAll((buttons) => buttons.filter((button) => { const rect = button.getBoundingClientRect(); return rect.left < 0 || rect.right > document.documentElement.clientWidth; }).length);
        expect(clippedTabs).toBe(0);
      }
      if (width === 320) {
        const axe = await new AxeBuilder({ page }).analyze();
        expect(axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')), `${name} axe violations`).toEqual([]);
      }
      await page.screenshot({ path: `artifacts/screenshots/replacement-${name}-${width}.png`, fullPage: true });
      await page.unrouteAll({ behavior: 'wait' });
    }
  }
});

async function mockApi(page: Page, surface: string) {
  await page.route('**/api/v1/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const account = { profile: { firstName: 'کاربر', lastName: 'نمونه', email: 'demo@example.test', emailVerifiedAt: '2026-09-04T08:00:00Z', mobile: '09120000000', jobTitle: 'مدیر تحول' }, organization: { displayName: 'سازمان ساختگی نمونه', type: 'PRIVATE' }, requests: [{ reference: 'NVR-1405-0001', title: 'یکپارچه‌سازی جریان تصمیم مالی', submittedAt: '2026-09-04T08:00:00Z' }] };
    const offer = { status: 'ACTIVE', validUntil: '2027-01-01T08:00:00Z', paymentProvider: 'mock', offer: { title: 'ارزیابی اولیه جریان مالی و فرایندی', description: 'نسخه ساختگی برای نمایش شفاف دامنه، خروجی و مرز تعهد.', scope: 'بررسی وضعیت موجود و صورت‌بندی مسئله', deliverable: 'یادداشت مکتوب مقدماتی', durationMinutes: 90, timing: 'با هماهنگی طرفین', expertMix: 'مالی، فرایند و سامانه', baseAmountIrr: 100000000, taxAmountIrr: 10000000, totalAmountIrr: 110000000, feeDeductionTerms: 'کسر مبلغ فقط مطابق قرارداد مستقل پروژه اصلی ممکن است.', termsVersion: 'draft-0.1', cancellationVersion: 'draft-0.1' }, ...(surface === 'payment' ? { order: { reference: 'ORD-DEMO-001', state: 'AWAITING_PAYMENT', totalAmountIrr: 110000000 } } : {}) };
    if (pathname === '/api/v1/account') return route.fulfill({ json: account });
    if (pathname === '/api/v1/session') return route.fulfill({ json: { role: 'SUPERADMIN', authLevel: 2 } });
    if (pathname === '/api/v1/admin/dashboard') return route.fulfill({ json: { requests: 12, newRequests: 3, pendingTransfers: 1, contentDrafts: 4 } });
    if (pathname === '/api/v1/admin/requests' || pathname === '/api/v1/admin/bank-transfers' || pathname === '/api/v1/admin/content' || pathname === '/api/v1/admin/staff') return route.fulfill({ json: [] });
    if (pathname.startsWith('/api/v1/offers/')) return route.fulfill({ json: offer });
    if (pathname.startsWith('/api/v1/invoices/')) return route.fulfill({ json: { status: 'ISSUED', reference: 'INV-DEMO-001', title: 'صورتحساب مرحله قراردادی ساختگی', description: 'نمونه نمایشی و فاقد اعتبار مالی.', totalAmountIrr: 110000000, validUntil: '2027-01-01T08:00:00Z' } });
    return route.fulfill({ status: 404, json: { error: 'not mocked' } });
  });
}
