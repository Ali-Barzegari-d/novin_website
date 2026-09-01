'use client';

import { useEffect, useState } from 'react';

type Invoice = { status: string; reference?: string; title?: string; description?: string; totalAmountIrr?: number; validUntil?: string };

export function InvoiceView({ token }: { token: string }) {
  const [invoice, setInvoice] = useState<Invoice>(); const [error, setError] = useState('');
  useEffect(() => { const controller = new AbortController(); void fetch(`/api/v1/invoices/${token}`, { signal: controller.signal }).then(async (response) => { if (!response.ok) throw new Error((await response.json()).error); setInvoice(await response.json()); }).catch((reason: unknown) => { if (reason instanceof DOMException && reason.name === 'AbortError') return; setError(reason instanceof Error ? reason.message : 'دریافت صورتحساب ناموفق بود.'); }); return () => controller.abort(); }, [token]);
  if (error) return <div className="card"><h1>صورتحساب در دسترس نیست</h1><p className="error">{error}</p></div>;
  if (!invoice) return <div className="card">در حال دریافت صورتحساب…</div>;
  if (invoice.status === 'EXPIRED') return <div className="card"><h1>این لینک صورتحساب منقضی است.</h1><p>برای دریافت نسخه جدید با شرکت تماس بگیرید.</p></div>;
  return <div className="card invoice"><span className="eyebrow">صورتحساب اختصاصی مرحله قرارداد</span><h1>{invoice.title}</h1><p>{invoice.description}</p><p className="invoice-amount">{invoice.totalAmountIrr?.toLocaleString('fa-IR')} ریال</p><p>شماره صورتحساب: <bdi>{invoice.reference}</bdi></p><p className="muted">اعتبار تا {new Date(invoice.validUntil ?? '').toLocaleString('fa-IR')}</p><p className="notice">این لینک فقط صورتحساب اختصاصی را نمایش می‌دهد. روش واریز یا درگاه طبق دستورالعمل و قرارداد تأییدشده ارائه می‌شود.</p></div>;
}
