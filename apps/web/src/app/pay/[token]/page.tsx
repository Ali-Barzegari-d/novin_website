import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaymentFlow } from '@/components/PaymentFlow';

export const metadata: Metadata = { title: 'پرداخت سفارش', robots: { index: false, follow: false } };
export default async function PayPage({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return <main id="main-content" className="workspace-page"><header className="workspace-head shell"><div><h1>پرداخت سفارش</h1><p>مبلغ و روش وصول را پیش از ادامه بررسی کنید.</p></div></header><section className="shell"><Suspense fallback={<div className="loading-state">در حال آماده‌سازی…</div>}><PaymentFlow token={token}/></Suspense></section></main>; }
