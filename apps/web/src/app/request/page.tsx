import { RequestFlow } from '@/components/RequestFlow';
import { Suspense } from 'react';
export const metadata = { title: 'ثبت مسئله و درخواست بررسی', robots: { index: false, follow: false } };
export default function RequestPage() { return <section className="section intake-page"><div className="shell"><div className="intake-page-heading"><p className="eyebrow">نوین ایرانیان / شروع همکاری</p><h1>ثبت مسئله و درخواست بررسی</h1></div><Suspense fallback={<div className="card" role="status">در حال آماده‌سازی فرم…</div>}><RequestFlow/></Suspense></div></section>; }
