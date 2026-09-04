'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, money, persianDate } from '@/lib/api';
import { Icon } from './Icon';

type OfferResponse = { status: string; validUntil?: string; paymentProvider?: 'mock' | 'gateway'; offer?: { totalAmountIrr: number; title: string }; order?: { reference: string; state: string; totalAmountIrr: number } };
type Receipt = { reference: string; state: string; totalAmountIrr: number; collectedAt?: string; transactionReference?: string };

export function PaymentFlow({ token }: { token: string }) {
  const search = useSearchParams();
  const [offer, setOffer] = useState<OfferResponse | null>(null);
  const [method, setMethod] = useState<'online' | 'bank'>('online');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [transfer, setTransfer] = useState<{ id: string; status: string } | null>(null);
  const paymentId = search.get('payment');
  useEffect(() => { api<OfferResponse>(`/api/v1/offers/${token}`).then((data) => { setOffer(data); if (data.order?.state === 'PAID') api<Receipt>(`/api/v1/offers/${token}/receipt`).then(setReceipt); }).catch((error) => setMessage(error.message)); }, [token]);
  async function startOnline() {
    setBusy(true); setMessage('');
    try { const path = offer?.paymentProvider === 'gateway' ? 'gateway' : 'mock'; const result = await api<{ redirectUrl: string }>(`/api/v1/offers/${token}/payments/${path}`, { method: 'POST', body: JSON.stringify({ idempotencyKey: crypto.randomUUID() }) }); location.href = result.redirectUrl; }
    catch (error) { setMessage(error instanceof Error ? error.message : 'شروع پرداخت ناموفق بود.'); setBusy(false); }
  }
  async function finishMock(outcome: 'SUCCESS' | 'FAILED') {
    if (!paymentId) return; setBusy(true); setMessage('');
    try { const result = await api<{ status: string }>(`/api/v1/payments/mock/${paymentId}/callback`, { method: 'POST', body: JSON.stringify({ outcome }) }); if (result.status === 'VERIFIED') setReceipt(await api<Receipt>(`/api/v1/offers/${token}/receipt`)); else setMessage('پرداخت آزمایشی ناموفق ثبت شد؛ می‌توانید دوباره تلاش کنید.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'استعلام پرداخت ناموفق بود.'); }
    finally { setBusy(false); }
  }
  async function bank(formData: FormData) {
    setBusy(true); setMessage('');
    try { const result = await api<{ transferId: string; status: string }>(`/api/v1/offers/${token}/bank-transfer`, { method: 'POST', body: JSON.stringify({ reference: formData.get('reference'), transferredAt: new Date(String(formData.get('transferredAt'))).toISOString(), amountIrr: offer?.order?.totalAmountIrr, bankName: formData.get('bankName'), depositorName: formData.get('depositorName'), idempotencyKey: crypto.randomUUID() }) }); setTransfer({ id: result.transferId, status: result.status }); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'ثبت واریز ناموفق بود.'); }
    finally { setBusy(false); }
  }
  async function uploadReceipt(formData: FormData) {
    if (!transfer) return; setBusy(true); setMessage('');
    try { await api(`/api/v1/offers/${token}/bank-transfers/${transfer.id}/receipt`, { method: 'POST', body: formData }); setMessage('رسید به‌صورت خصوصی بارگذاری شد و در انتظار بررسی مالی است.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'بارگذاری رسید ناموفق بود.'); }
    finally { setBusy(false); }
  }
  if (!offer) return <div className="loading-state"><span/>{message || 'در حال دریافت سفارش…'}</div>;
  if (!offer.order) return <div className="result-state error"><Icon name="warning"/><h2>ابتدا پیشنهاد را بپذیرید</h2><p>سفارشی برای پرداخت ایجاد نشده است.</p></div>;
  if (receipt) return <div className="receipt"><div className="receipt-check"><Icon name="check"/></div><h2>پرداخت تأیید شد</h2><p>رسید روی صفحه ثبت شده و از طریق ایمیل نیز ارسال می‌شود.</p><dl><div><dt>شماره سفارش</dt><dd dir="ltr">{receipt.reference}</dd></div><div><dt>مبلغ</dt><dd>{money(receipt.totalAmountIrr)}</dd></div><div><dt>زمان وصول</dt><dd>{receipt.collectedAt ? persianDate(receipt.collectedAt) : '—'}</dd></div><div><dt>مرجع تراکنش</dt><dd dir="ltr">{receipt.transactionReference ?? '—'}</dd></div></dl></div>;
  if (paymentId) return <div className="gateway-simulator"><span className="placeholder-chip">درگاه آزمایشی توسعه</span><h2>شبیه‌ساز بازگشت درگاه</h2><p>در production این صفحه با درگاه موردتأیید جایگزین می‌شود و نتیجه فقط پس از استعلام سرور ثبت خواهد شد.</p><strong>{money(offer.order.totalAmountIrr)}</strong><div className="form-actions"><button className="secondary-button" disabled={busy} onClick={() => finishMock('FAILED')}>شبیه‌سازی شکست</button><button className="button" disabled={busy} onClick={() => finishMock('SUCCESS')}>شبیه‌سازی پرداخت موفق</button></div>{message && <p className="form-error">{message}</p>}</div>;
  return <div className="payment-layout"><article><span className="offer-private"><Icon name="lock"/> پرداخت امن سفارش خصوصی</span><h2>{offer.offer?.title}</h2><dl className="payment-summary"><div><dt>شماره سفارش</dt><dd dir="ltr">{offer.order.reference}</dd></div><div><dt>مبلغ نهایی</dt><dd>{money(offer.order.totalAmountIrr)}</dd></div><div><dt>اعتبار پیشنهاد</dt><dd>{offer.validUntil ? persianDate(offer.validUntil) : '—'}</dd></div></dl><div className="payment-tabs" role="group" aria-label="روش پرداخت"><button aria-pressed={method === 'online'} onClick={() => setMethod('online')}>پرداخت آنلاین</button><button aria-pressed={method === 'bank'} onClick={() => setMethod('bank')}>واریز بانکی</button></div>{method === 'online' ? <section><h3>پرداخت آنلاین</h3><p>پس از بازگشت، وضعیت تراکنش سمت سرور استعلام می‌شود. اطلاعات کارت در این سامانه ذخیره نمی‌شود.</p><button className="button button-large" disabled={busy} onClick={startOnline}>{busy ? 'در حال اتصال…' : 'ورود به درگاه'} <Icon name="arrow"/></button></section> : !transfer ? <form className="bank-form" action={bank}><h3>ثبت مشخصات واریز</h3><p>سفارش تا تأیید واحد مالی پرداخت‌شده محسوب نمی‌شود.</p><label>شماره پیگیری بانکی<input name="reference" required minLength={3}/></label><div className="field-grid"><label>بانک مبدأ<input name="bankName" required minLength={2}/></label><label>نام واریزکننده<input name="depositorName" required minLength={2}/></label></div><label>زمان واریز<input name="transferredAt" type="datetime-local" required/></label><button className="button" disabled={busy}>ثبت برای بررسی مالی</button></form> : <form className="bank-form" action={uploadReceipt}><h3>واریز در انتظار بررسی است</h3><p>در صورت نیاز، رسید غیرحساس را به‌صورت خصوصی بارگذاری کنید.</p><label className="upload-zone"><Icon name="upload"/><strong>انتخاب رسید</strong><input type="file" name="file" accept=".pdf,.png,.jpg,.jpeg" required/></label><button className="button" disabled={busy}>بارگذاری رسید</button></form>}{message && <p className="form-error" role="alert">{message}</p>}</article><aside><Icon name="lock"/><h3>مرز امنیت پرداخت</h3><p>شماره کارت، CVV2 یا رمز پویا در سرور نوین ایرانیان دریافت و ذخیره نمی‌شود.</p><p>نتیجه پرداخت فقط با مبلغ ثبت‌شده سفارش و پاسخ معتبر ارائه‌دهنده تطبیق داده می‌شود.</p></aside></div>;
}
