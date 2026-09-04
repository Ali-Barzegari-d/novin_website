import type { Metadata } from 'next';
import { OfferFlow } from '@/components/OfferFlow';

export const metadata: Metadata = { title: 'پیشنهاد اختصاصی', robots: { index: false, follow: false } };
export default async function OfferPage({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return <main id="main-content" className="workspace-page"><header className="workspace-head shell"><div><h1>پیشنهاد اختصاصی ارزیابی</h1><p>جزئیات، مبلغ و شرایط را پیش از پذیرش بررسی کنید.</p></div></header><section className="shell"><OfferFlow token={token}/></section></main>; }
