import { AccountPanel } from '@/components/AccountPanel';
export const metadata = { title: 'درخواست‌های من', robots: { index: false, follow: false } };
export default function Account() { return <><section className="section page-intro"><div className="shell"><h1>درخواست‌های من</h1><p className="muted">در این بخش فقط اطلاعات پایه و فهرست درخواست‌ها نمایش داده می‌شود؛ وضعیت‌ها و یادداشت‌های داخلی محرمانه‌اند.</p></div></section><section className="section section-surface"><div className="shell"><AccountPanel/></div></section></>; }
