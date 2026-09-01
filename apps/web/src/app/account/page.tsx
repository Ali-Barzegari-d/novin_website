import { AccountPanel } from '@/components/AccountPanel';
export const metadata = { title: 'درخواست‌های من', robots: { index: false, follow: false } };
export default function Account() { return <section className="section"><div className="shell"><span className="eyebrow">حساب کاربری</span><h1>درخواست‌های من</h1><p className="muted">در این بخش فقط اطلاعات پایه و فهرست درخواست‌ها نمایش داده می‌شود؛ وضعیت‌ها و یادداشت‌های داخلی محرمانه‌اند.</p><AccountPanel/></div></section>; }
