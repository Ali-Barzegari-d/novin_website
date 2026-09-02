import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Browser UX contract tests intentionally mock API responses. PostgreSQL coverage
// is separate in tests/integration/intake-postgres.test.ts.
const viewports = [{ name: '320', width: 320, height: 960 }, { name: '768', width: 768, height: 1100 }, { name: '1440', width: 1440, height: 1000 }];

async function captureState(page: Page, name: string) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  expect(await page.locator('.skip-link').evaluate((el) => el.getBoundingClientRect().bottom < 0)).toBe(true);
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    expect(await page.locator('body').evaluate((el) => el.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `artifacts/screenshots/request-${name}-${viewport.name}.png`, fullPage: true });
  }
}

test('new representative can onboard, revise, retry and submit at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 960 });
  let authenticated = false; let onboarded = false; let attempts = 0;
  const keys: string[] = [];
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    let status = 200; let json: unknown = {};
    if (path === '/api/v1/account') { status = authenticated ? 200 : 401; json = onboarded ? { profile: { firstName: 'علی', lastName: 'آزمایشی' }, organization: { displayName: 'شرکت نمونه آزمون', type: 'PRIVATE' }, requests: [] } : { profile: {}, organization: null, requests: [] }; }
    else if (path === '/api/v1/auth/otp') json = { accepted: true, retryAfterSeconds: 60 };
    else if (path === '/api/v1/dev/sms-inbox') json = { messages: [{ body: 'رمز آزمایشی 123456', mobile: '+989121234567', expiresAt: new Date(Date.now() + 120000).toISOString() }] };
    else if (path === '/api/v1/auth/verify') { authenticated = true; json = { authenticated: true, onboardingRequired: true }; }
    else if (path === '/api/v1/account/onboarding') { onboarded = true; json = { ok: true }; }
    else if (path === '/api/v1/requests') { keys.push(route.request().postDataJSON().idempotencyKey); attempts += 1; status = attempts === 1 ? 503 : 200; json = attempts === 1 ? { error: 'سرویس موقتاً در دسترس نیست. دوباره تلاش کنید.' } : { id: 'request-id', reference: 'REQ-TEST-EXAMPLE' }; }
    await route.fulfill({ status, json });
  });
  await page.goto('/request?onboarding=1');
  await page.getByLabel('شماره همراه ایران').fill('۰۹۱۲۱۲۳۴۵۶۷');
  await page.getByRole('button', { name: 'دریافت رمز یک‌بارمصرف' }).click();
  await expect(page.getByRole('button', { name: /ارسال مجدد تا/ })).toBeDisabled();
  await expect(page.getByText('رمز آزمایشی 123456')).toBeVisible();
  await page.getByRole('button', { name: 'بستن صندوق آزمایشی' }).click();
  await page.getByRole('textbox', { name: 'رمز ۶ رقمی' }).fill('۱۲۳۴۵۶');
  await page.getByRole('button', { name: 'تأیید و ادامه' }).click();
  await page.getByLabel('نام', { exact: true }).fill('علی');
  await page.getByLabel('نام خانوادگی', { exact: true }).fill('آزمایشی');
  await page.getByLabel('ایمیل', { exact: true }).fill('demo@example.test');
  await page.getByLabel('سمت شما در سازمان').fill('مدیر');
  await page.getByLabel('نام رایج سازمان').fill('شرکت نمونه آزمون');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'ادامه به شرح مسئله' }).click();
  await expect(page.getByRole('heading', { name: 'چه مسئله‌ای پیش روی شماست؟' })).toBeVisible();
  await expect(page.getByText('شرکت نمونه آزمون', { exact: true })).toBeVisible();
  const description = 'در شرکت نمونه، رویدادهای مالی میان چند سامانه به صورت دستی و تکراری ثبت می‌شوند.';
  await page.getByLabel('عنوان کوتاه درخواست').fill('یکپارچه‌سازی اطلاعات مالی');
  await page.locator('textarea[name="description"]').fill(description);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /بازبینی درخواست/ }).click();
  await page.getByRole('button', { name: 'ویرایش اطلاعات' }).click();
  await expect(page.locator('textarea[name="description"]')).toHaveValue(description);
  await expect(page.getByRole('checkbox')).toBeChecked();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter((item) => ['critical', 'serious'].includes(item.impact ?? '')).map((item) => item.id)).toEqual([]);
  await captureState(page, 'draft');
  await page.setViewportSize(viewports[0]!);
  await page.getByRole('button', { name: /بازبینی درخواست/ }).click();
  await captureState(page, 'review');
  await page.setViewportSize(viewports[0]!);
  await page.getByRole('button', { name: 'ثبت نهایی درخواست' }).click();
  await expect(page.locator('.error[role="alert"]')).toContainText('دوباره تلاش کنید');
  await page.getByRole('button', { name: 'ثبت نهایی درخواست' }).click();
  await expect(page.locator('.success[role="status"]')).toContainText('REQ-TEST-EXAMPLE');
  await captureState(page, 'success');
  expect(keys).toHaveLength(2); expect(keys[0]).toBe(keys[1]);
});

test('account-loading failure provides a usable retry state', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/v1/account', async (route) => {
    attempts += 1;
    await route.fulfill(attempts === 1
      ? { status: 503, json: { error: 'سرویس موقتاً در دسترس نیست. دوباره تلاش کنید.' } }
      : { status: 401, json: { error: 'ورود لازم است.' } });
  });
  await page.goto('/request');
  await expect(page.getByRole('heading', { name: 'دریافت اطلاعات ممکن نشد.' })).toBeVisible();
  await page.getByRole('button', { name: 'تلاش مجدد' }).click();
  await expect(page.getByRole('heading', { name: 'گفت‌وگو از اینجا شروع می‌شود.' })).toBeVisible();
  expect(attempts).toBe(2);
});

test('mobile navigation includes both audiences and login, closes with Escape and navigation', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 }); await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await expect(page.locator('.skip-link')).toBeVisible();
  const trigger = page.getByRole('button', { name: 'باز کردن منوی اصلی' });
  await trigger.click();
  const menu = page.getByRole('dialog', { name: 'منوی اصلی' });
  await expect(menu.getByRole('link', { name: 'راهکارهای دولتی و عمومی', exact: true })).toBeVisible();
  await expect(menu.getByRole('link', { name: 'راهکارهای شرکت‌های خصوصی', exact: true })).toBeVisible();
  await expect(menu.getByRole('link', { name: 'ورود / درخواست‌های من' })).toBeVisible();
  await page.keyboard.press('Escape'); await expect(menu).not.toBeVisible();
  await trigger.click(); await menu.getByRole('link', { name: 'توانمندی‌ها' }).click();
  await expect(page).toHaveURL(/capabilities/); await expect(menu).not.toBeVisible();
});

test('home content is visible without JavaScript and accordion works natively', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 768, height: 1100 } });
  const page = await context.newPage(); await page.goto('http://127.0.0.1:3050/');
  await expect(page.getByRole('heading', { name: /پیچیدگی‌های مالی/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'قدم بعدی، همیشه روشن.' })).toBeVisible();
  const entry = page.locator('.problem-entry').nth(1); await entry.locator('summary').click();
  await expect(entry.locator('.problem-answer')).toBeVisible();
  await context.close();
});
