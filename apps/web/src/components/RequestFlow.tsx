'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthFlow } from './AuthFlow';

type Account = { profile: { firstName?: string; lastName?: string; email?: string; jobTitle?: string }; requests: unknown[] };
type RequestDraft = { title: string; description: string; organizationType: string; privacyVersion: string; idempotencyKey: string };

export function RequestFlow() {
  const search = useSearchParams();
  const [account, setAccount] = useState<Account>();
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [createdId, setCreatedId] = useState('');
  const [file, setFile] = useState<File>();
  const [uploading, setUploading] = useState(false);
  const [draft, setDraft] = useState<RequestDraft>();

  useEffect(() => { fetch('/api/v1/account').then(async (res) => res.ok ? setAccount(await res.json()) : undefined).catch(() => undefined); }, []);

  async function onboard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/v1/account/onboarding', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ firstName: form.get('firstName'), lastName: form.get('lastName'), email: form.get('email'), jobTitle: form.get('jobTitle'), organizationName: form.get('organizationName'), organizationType: form.get('organizationType'), representationConfirmed: form.get('representationConfirmed') === 'on', privacyVersion: 'draft-0.1' }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? 'تکمیل اطلاعات ناموفق بود.');
    setAccount({ profile: {}, requests: [] });
  }

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    setDraft({ title: String(form.get('title')), description: String(form.get('description')), organizationType: String(form.get('organizationType')), privacyVersion: 'draft-0.1', idempotencyKey: crypto.randomUUID() });
  }

  async function submit() {
    if (!draft) return; setError('');
    const response = await fetch('/api/v1/requests', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...draft, confidentialityAccepted: true, source: 'website' }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? 'ثبت درخواست ناموفق بود.');
    setReference(data.reference); setCreatedId(data.id); setDraft(undefined);
  }

  async function upload() {
    if (!file || !createdId) return;
    setUploading(true); setError('');
    const form = new FormData(); form.set('file', file);
    const response = await fetch(`/api/v1/requests/${createdId}/attachment`, { method: 'POST', headers: { 'x-confidentiality-accepted': 'true' }, body: form });
    setUploading(false);
    if (!response.ok) setError((await response.json()).error ?? 'بارگذاری فایل ناموفق بود.'); else setFile(undefined);
  }

  if (!account) return <><p className="legal-draft">برای ثبت مسئله، ابتدا شماره همراه خود را تأیید کنید.</p><AuthFlow mode="request" /></>;
  if (search.get('onboarding') || !account.profile.firstName) return <form className="form card" onSubmit={onboard}><h2>اطلاعات پایه نماینده و سازمان</h2><div className="grid-2"><label className="field">نام<input name="firstName" required /></label><label className="field">نام خانوادگی<input name="lastName" required /></label></div><label className="field">ایمیل<input name="email" type="email" required /></label><label className="field">سمت<input name="jobTitle" required /></label><label className="field">نام رایج سازمان<input name="organizationName" required /></label><label className="field">نوع سازمان<select name="organizationType" defaultValue="PRIVATE"><option value="PRIVATE">خصوصی</option><option value="PUBLIC">عمومی</option><option value="GOVERNMENT">دولتی</option></select></label><label><input name="representationConfirmed" type="checkbox" required /> تأیید می‌کنم رابط یا نماینده این سازمان هستم.</label>{error ? <p className="error" role="alert">{error}</p> : null}<button className="button button-primary" type="submit">ادامه ثبت مسئله</button></form>;
  if (reference) return <div className="card"><h2>درخواست ثبت شد.</h2><p className="success">شماره پیگیری: <bdi>{reference}</bdi></p><p className="muted">تأیید ثبت از طریق پیامک و ایمیل ارسال می‌شود. بررسی اولیه رایگان است و وضعیت داخلی در حساب نمایش داده نمی‌شود.</p><label className="field">پیوست اختیاری و غیرمحرمانه<input type="file" accept=".pdf,.docx,.xlsx,.png,.jpeg,.jpg" onChange={(event) => setFile(event.target.files?.[0])} /><span className="hint">حداکثر ۱۰ مگابایت؛ سند محرمانه، اطلاعات هویتی یا داده حساس بارگذاری نکنید.</span></label>{file ? <button className="button button-secondary" type="button" disabled={uploading} onClick={upload}>{uploading ? 'در حال بررسی امنیتی…' : 'بارگذاری پیوست'}</button> : null}{error ? <p className="error" role="alert">{error}</p> : null}<p><Link href="/account">مشاهده درخواست‌های من</Link></p></div>;
  if (draft) return <div className="card"><span className="eyebrow">بازبینی پیش از ارسال</span><h2>{draft.title}</h2><p className="muted">نوع سازمان: {draft.organizationType === 'GOVERNMENT' ? 'دولتی' : draft.organizationType === 'PUBLIC' ? 'عمومی' : 'خصوصی'}</p><p className="preline">{draft.description}</p><p className="notice">با ثبت نهایی، تنها شماره پیگیری و مراحل عمومی برای شما نمایش داده می‌شود؛ ثبت درخواست سفارش قطعی نیست.</p>{error ? <p className="error" role="alert">{error}</p> : null}<div className="actions"><button className="button button-secondary" type="button" onClick={() => setDraft(undefined)}>ویرایش</button><button className="button button-primary" type="button" onClick={submit}>ثبت نهایی درخواست</button></div></div>;
  return <form className="form card" onSubmit={review}><h2>شرح مسئله</h2><p className="muted">نیازی به انتخاب خدمت تخصصی نیست. مسئله و زمینه آن را به زبان خودتان توضیح دهید.</p><label className="field">عنوان کوتاه درخواست<input name="title" minLength={5} maxLength={180} required /></label><label className="field">نوع سازمان<select name="organizationType" defaultValue="PRIVATE"><option value="PRIVATE">خصوصی</option><option value="PUBLIC">عمومی</option><option value="GOVERNMENT">دولتی</option></select></label><label className="field">شرح مسئله<textarea name="description" minLength={30} maxLength={8000} required /><span className="hint">از ارسال اطلاعات محرمانه، هویتی، حقوق و دستمزد یا کارت بانکی خودداری کنید.</span></label><label><input name="confidentialityAccepted" type="checkbox" required /> هشدار محرمانگی و حریم خصوصی را خوانده‌ام و می‌پذیرم.</label>{error ? <p className="error" role="alert">{error}</p> : null}<button className="button button-primary" type="submit">بازبینی درخواست</button></form>;
}
