import { Suspense } from 'react';
import { MockPayment } from '@/components/MockPayment';

export const metadata = { title: 'پرداخت سفارش', robots: { index: false, follow: false } };

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <section className="section"><div className="shell"><Suspense fallback={<div className="card">در حال آماده‌سازی پرداخت…</div>}><MockPayment token={token}/></Suspense></div></section>;
}
