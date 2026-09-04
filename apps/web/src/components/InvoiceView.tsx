'use client';

import { useEffect, useState } from 'react';
import { api, money, persianDate } from '@/lib/api';
import { Icon } from './Icon';

type Invoice = { status: string; reference?: string; title?: string; description?: string; totalAmountIrr?: number; validUntil?: string };
export function InvoiceView({ token }: { token: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null); const [error, setError] = useState('');
  useEffect(() => { api<Invoice>(`/api/v1/invoices/${token}`).then(setInvoice).catch((cause) => setError(cause.message)); }, [token]);
  if (!invoice) return <div className="loading-state"><span/>{error || 'در حال اعتبارسنجی صورتحساب…'}</div>;
  if (invoice.status === 'EXPIRED') return <div className="result-state error"><Icon name="warning"/><h2>صورتحساب منقضی یا باطل شده است</h2><p>برای دریافت لینک جدید با واحد عملیات یا مالی تماس بگیرید.</p></div>;
  return <article className="invoice"><header><span className="offer-private"><Icon name="lock"/> سند خصوصی</span><b dir="ltr">{invoice.reference}</b></header><h2>{invoice.title}</h2><p>{invoice.description}</p><dl><div><dt>مبلغ کل</dt><dd>{money(invoice.totalAmountIrr ?? 0)}</dd></div><div><dt>اعتبار تا</dt><dd>{invoice.validUntil ? persianDate(invoice.validUntil) : '—'}</dd></div><div><dt>وضعیت</dt><dd>{invoice.status === 'ISSUED' ? 'صادرشده' : invoice.status}</dd></div></dl><p className="security-callout"><Icon name="document"/>این صورتحساب مربوط به مرحله قراردادی ثبت‌شده است و جزئیات توافق در سند مستقل نگهداری می‌شود.</p></article>;
}
