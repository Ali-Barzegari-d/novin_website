import { SettingsPanel } from '@/components/SettingsPanel';

export const metadata = { title: 'تنظیمات امن', robots: { index: false, follow: false } };

export default function SettingsPage() { return <section className="section"><div className="shell"><span className="eyebrow">تنظیمات داخلی</span><h1>سیاست فایل و وضعیت سرویس‌ها</h1><p className="muted">تغییر این بخش برای سوپرادمین با MFA است. رازهای پرداخت، پیامک و ایمیل فقط از محیط استقرار خوانده می‌شوند.</p><SettingsPanel/></div></section>; }
