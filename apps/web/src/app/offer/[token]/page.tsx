import { OfferFlow } from '@/components/OfferFlow';

export const metadata = { title: 'پیشنهاد اختصاصی', robots: { index: false, follow: false } };

export default async function OfferPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <section className="section"><div className="shell"><OfferFlow token={token}/></div></section>;
}
