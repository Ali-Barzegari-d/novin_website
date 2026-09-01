'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';

type Offer = { id: string; title: string; description: string; scope: string; deliverable: string; durationMinutes: number; timing: string; expertMix: string; baseAmountIrr: number; taxAmountIrr: number; totalAmountIrr: number; termsVersion: string; cancellationVersion: string; feeDeductionTerms: string };
type OfferData = { status: string; validUntil?: string; paymentProvider?: 'mock' | 'gateway'; offer?: Offer; order?: { reference: string; state: string; totalAmountIrr: number } };

const money = (value: number) => `${value.toLocaleString('fa-IR')} ریال`;

export function OfferFlow({ token }: { token: string }) {
  const [data, setData] = useState<OfferData>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [order, setOrder] = useState<OfferData['order']>();
  const [banking, setBanking] = useState(false);
  const [receipt, setReceipt] = useState<{ reference: string; state: string; totalAmountIrr: number; collectedAt?: string; transactionReference?: string }>();

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/v1/offers/${token}`, { signal: controller.signal }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'دریافت پیشنهاد ناموفق بود.');
      setData(result); setOrder(result.order);
      if (result.order?.state === 'PAID' || result.order?.state === 'REFUNDED') {
        const receiptResponse = await fetch(`/api/v1/offers/${token}/receipt`, { signal: controller.signal });
        if (receiptResponse.ok) setReceipt(await receiptResponse.json());
      }
    }).catch((reason: unknown) => {
      if (reason instanceof DOMException && reason.name === 'AbortError') return;
      setError(reason instanceof Error ? reason.message : 'دریافت پیشنهاد ناموفق بود.');
    });
    return () => controller.abort();
  }, [token]);

  async function accept(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!data?.offer) return;
    setError(''); const form = new FormData(event.currentTarget);
    const billing = await fetch(`/api/v1/offers/${token}/billing`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ legalName: form.get('legalName'), nationalId: form.get('nationalId'), billingAddress: form.get('billingAddress'), postalCode: form.get('postalCode') || undefined }) });
    const billingResult = await billing.json();
    if (!billing.ok) return setError(billingResult.error ?? 'ذخیره اطلاعات صورتحساب ناموفق بود.');
    const response = await fetch(`/api/v1/offers/${token}/accept`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ termsVersion: data.offer.termsVersion, idempotencyKey: crypto.randomUUID() }) });
    const result = await response.json();
    if (!response.ok) return setError(result.error ?? 'پذیرش پیشنهاد ناموفق بود.');
    setOrder({ reference: result.orderReference, state: 'PAYMENT_PENDING', totalAmountIrr: data.offer.totalAmountIrr }); setNotice('پیشنهاد با ثبت نسخه شرایط پذیرفته شد. اکنون روش پرداخت را انتخاب کنید.');
  }

  async function startMockPayment() {
    setError('');
    const response = await fetch(`/api/v1/offers/${token}/payments/mock`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idempotencyKey: crypto.randomUUID() }) });
    const result = await response.json();
    if (!response.ok) return setError(result.error ?? 'ایجاد تراکنش ناموفق بود.');
    window.location.assign(result.redirectUrl);
  }

  async function startGatewayPayment() {
    setError('');
    const response = await fetch(`/api/v1/offers/${token}/payments/gateway`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idempotencyKey: crypto.randomUUID() }) });
    const result = await response.json();
    if (!response.ok) return setError(result.error ?? 'اتصال به درگاه ناموفق بود.');
    window.location.assign(result.redirectUrl);
  }

  async function bankTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/v1/offers/${token}/bank-transfer`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reference: form.get('reference'), transferredAt: new Date(String(form.get('transferredAt'))).toISOString(), amountIrr: data?.offer?.totalAmountIrr, bankName: form.get('bankName'), depositorName: form.get('depositorName'), idempotencyKey: crypto.randomUUID() }) });
    const result = await response.json();
    if (!response.ok) return setError(result.error ?? 'ثبت واریز ناموفق بود.');
    setNotice('واریز ثبت شد و تا تأیید مالی، سفارش پرداخت‌شده تلقی نمی‌شود.'); setBanking(false);
  }

  if (error && !data) return <div className="card"><h1>پیشنهاد در دسترس نیست</h1><p className="error">{error}</p></div>;
  if (!data) return <div className="card">در حال دریافت پیشنهاد اختصاصی…</div>;
  if (data.status === 'EXPIRED' || !data.offer) return <div className="card"><span className="eyebrow">لینک نامعتبر</span><h1>این پیشنهاد منقضی یا باطل شده است.</h1><p>برای دریافت پیشنهاد جدید، با شرکت تماس بگیرید یا درخواست تازه ثبت کنید.</p><Link className="button button-primary" href="/request">ثبت درخواست</Link></div>;
  const offer = data.offer;

  return <div className="offer-layout"><section className="card offer-main"><span className="eyebrow">پیشنهاد اختصاصی جلسه کارشناسی</span><h1>{offer.title}</h1><p>{offer.description}</p><div className="offer-sections"><section><h2>دامنه و خروجی</h2><p className="preline">{offer.scope}</p><p className="preline">خروجی: {offer.deliverable}</p></section><section><h2>زمان و ترکیب کارشناسی</h2><p>مدت جلسه: {offer.durationMinutes.toLocaleString('fa-IR')} دقیقه</p><p>{offer.timing}</p><p>{offer.expertMix}</p></section><section><h2>شرایط</h2><p>{offer.feeDeductionTerms}</p><p>نسخه شرایط: <bdi>{offer.termsVersion}</bdi> — نسخه لغو و استرداد: <bdi>{offer.cancellationVersion}</bdi></p><p><Link href="/terms">شرایط استفاده</Link> و <Link href="/cancellation">لغو و استرداد</Link> را پیش از پذیرش بخوانید.</p></section></div></section><aside className="card offer-total"><p className="muted">اعتبار تا {new Date(data.validUntil ?? '').toLocaleString('fa-IR')}</p><h2>جمع شفاف هزینه‌ها</h2><dl><div><dt>مبلغ پایه</dt><dd>{money(offer.baseAmountIrr)}</dd></div><div><dt>مالیات و عوارض</dt><dd>{money(offer.taxAmountIrr)}</dd></div><div className="total-line"><dt>مبلغ نهایی</dt><dd>{money(offer.totalAmountIrr)}</dd></div></dl>{notice ? <p className="success" role="status">{notice}</p> : null}{error ? <p className="error" role="alert">{error}</p> : null}{receipt ? <section><h3>رسید سفارش</h3><p><bdi>{receipt.reference}</bdi> — {receipt.state === 'REFUNDED' ? 'استردادشده' : 'پرداخت تأییدشده'}</p><p>{money(receipt.totalAmountIrr)}</p>{receipt.transactionReference ? <p className="muted">شماره تراکنش: <bdi>{receipt.transactionReference}</bdi></p> : null}</section> : order?.state === 'PAYMENT_PENDING' ? <><button className="button button-primary" type="button" onClick={data.paymentProvider === 'gateway' ? startGatewayPayment : startMockPayment}>{data.paymentProvider === 'gateway' ? 'ادامه به درگاه پرداخت' : 'پرداخت آنلاین آزمایشی'}</button><button className="button button-secondary" type="button" onClick={() => setBanking((value) => !value)}>ثبت واریز بانکی</button>{banking ? <form className="form compact-form" onSubmit={bankTransfer}><label className="field">شماره پیگیری واریز<input name="reference" required /></label><label className="field">تاریخ و زمان واریز<input name="transferredAt" type="datetime-local" required /></label><label className="field">نام بانک<input name="bankName" required /></label><label className="field">نام واریزکننده<input name="depositorName" required /></label><button className="button button-primary" type="submit">ثبت برای تأیید مالی</button></form> : null}</> : <form className="form compact-form" onSubmit={accept}><h2>پذیرش و صورتحساب</h2><label className="field">نام ثبتی سازمان<input name="legalName" required /></label><label className="field">شناسه ملی ۱۱ رقمی<input name="nationalId" inputMode="numeric" pattern="[0-9]{11}" required /></label><label className="field">نشانی صورتحساب<textarea name="billingAddress" minLength={10} required /></label><label className="field">کدپستی (در صورت وجود)<input name="postalCode" inputMode="numeric" pattern="[0-9]{10}" /></label><label><input type="checkbox" required /> شرایط و سیاست لغو/استرداد نسخه فوق را می‌پذیرم.</label><button className="button button-primary" type="submit">پذیرش و ادامه پرداخت</button><p className="hint">ایمیل نماینده باید از حساب کاربری تأیید شده باشد.</p></form>}</aside></div>;
}
