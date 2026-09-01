'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function MockPayment({ token }: { token: string }) {
  const search = useSearchParams();
  const paymentId = search.get('payment');
  const [result, setResult] = useState<{ status: string; orderReference: string }>();
  const [error, setError] = useState('');
  async function finish(outcome: 'SUCCESS' | 'FAILED') {
    if (!paymentId) return setError('شناسه تراکنش آزمایشی معتبر نیست.');
    const response = await fetch(`/api/v1/payments/mock/${paymentId}/callback`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ outcome }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? 'بازگشت پرداخت ناموفق بود.');
    setResult(data);
  }
  if (result) return <div className="card"><h1>{result.status === 'VERIFIED' ? 'پرداخت تأیید شد.' : 'پرداخت ناموفق بود.'}</h1><p>شماره سفارش: <bdi>{result.orderReference}</bdi></p><a className="button button-primary" href={`/offer/${token}`}>مشاهده رسید</a></div>;
  return <div className="card payment-mock"><span className="eyebrow">محیط آزمایشی</span><h1>درگاه آزمایشی پرداخت</h1><p>هیچ اطلاعات کارت بانکی در سامانه نوین دریافت یا ذخیره نمی‌شود. این صفحه فقط برای آزمایش چرخه تأیید سمت سرور است.</p>{error ? <p className="error" role="alert">{error}</p> : null}<div className="actions"><button className="button button-primary" onClick={() => finish('SUCCESS')}>شبیه‌سازی پرداخت موفق</button><button className="button button-secondary" onClick={() => finish('FAILED')}>شبیه‌سازی پرداخت ناموفق</button></div></div>;
}
