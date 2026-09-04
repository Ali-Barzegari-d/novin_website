import type { Metadata } from 'next';
import { InvoiceView } from '@/components/InvoiceView';

export const metadata: Metadata = { title: 'صورتحساب اختصاصی', robots: { index: false, follow: false } };
export default async function InvoicePage({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return <main id="main-content" className="workspace-page"><header className="workspace-head shell"><div><h1>صورتحساب اختصاصی</h1><p>این صفحه فقط با لینک امن و مدت‌دار قابل مشاهده است.</p></div></header><section className="shell narrow-workspace"><InvoiceView token={token}/></section></main>; }
