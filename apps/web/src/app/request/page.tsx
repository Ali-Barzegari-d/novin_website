import { RequestFlow } from '@/components/RequestFlow';
import { Suspense } from 'react';
export const metadata = { title: 'ثبت مسئله و درخواست بررسی' };
export default function RequestPage() { return <section className="section"><div className="shell"><span className="eyebrow">ثبت مسئله و درخواست بررسی</span><h1>مسئله سازمان را بدون انتخاب پکیج ثبت کنید.</h1><p className="hero-copy">ثبت درخواست و تماس غربالگری اولیه رایگان است. این ثبت به معنای سفارش قطعی یا پذیرش پروژه نیست.</p><Suspense fallback={<div className="card">در حال آماده‌سازی فرم…</div>}><RequestFlow/></Suspense></div></section>; }
