import { InvoiceView } from '@/components/InvoiceView';

export const metadata = { title: 'صورتحساب اختصاصی', robots: { index: false, follow: false } };

export default async function InvoicePage({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return <section className="section"><div className="shell"><InvoiceView token={token}/></div></section>; }
