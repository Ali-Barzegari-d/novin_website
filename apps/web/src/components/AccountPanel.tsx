'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';

type Data = { profile: { firstName?: string; lastName?: string; mobile: string; email?: string; emailVerifiedAt?: string; jobTitle?: string }; requests: { reference: string; title: string; submittedAt: string }[] };

export function AccountPanel() {
  const [data, setData] = useState<Data>();
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [emailToken, setEmailToken] = useState('');
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);

  useEffect(() => { fetch('/api/v1/account').then(async (res) => { if (!res.ok) return setFailed(true); setData(await res.json()); }).catch(() => setFailed(true)); }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/v1/account', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ firstName: form.get('firstName'), lastName: form.get('lastName'), email: form.get('email'), jobTitle: form.get('jobTitle') }) });
    if (!response.ok) return setError((await response.json()).error ?? 'ذخیره اطلاعات ناموفق بود.');
    setData((current) => current ? { ...current, profile: { ...current.profile, firstName: String(form.get('firstName')), lastName: String(form.get('lastName')), email: String(form.get('email')), jobTitle: String(form.get('jobTitle')) } } : current);
    setEditing(false); setNotice('اطلاعات پایه به‌روزرسانی شد.');
  }

  async function requestEmailVerification() {
    setError(''); const response = await fetch('/api/v1/account/email-verification/request', { method: 'POST' });
    if (!response.ok) return setError((await response.json()).error ?? 'ارسال تأیید ایمیل ناموفق بود.');
    setEmailVerificationOpen(true); setNotice('کد یا لینک تأیید به ایمیل ثبت‌شده ارسال شد.');
  }

  async function confirmEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const response = await fetch('/api/v1/account/email-verification/confirm', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: emailToken }) });
    if (!response.ok) return setError((await response.json()).error ?? 'تأیید ایمیل ناموفق بود.');
    setData((current) => current ? { ...current, profile: { ...current.profile, emailVerifiedAt: new Date().toISOString() } } : current); setEmailVerificationOpen(false); setEmailToken(''); setNotice('ایمیل برای پرداخت تأیید شد.');
  }

  async function requestDeletion() {
    if (!window.confirm('درخواست حذف/ناشناس‌سازی ثبت شود؟ سوابق مالی، رضایت و ممیزی طبق قانون نگهداری خواهند شد.')) return;
    setError(''); const response = await fetch('/api/v1/account/deletion-request', { method: 'POST' }); const result = await response.json();
    if (!response.ok) return setError(result.error ?? 'ثبت درخواست ناموفق بود.');
    setDeletionRequested(true); setNotice(result.retention);
  }

  if (failed) return <div className="card"><p>برای مشاهده حساب وارد شوید.</p><Link className="button button-primary" href="/login">ورود</Link></div>;
  if (!data) return <div className="card">در حال بارگذاری…</div>;

  return <div className="grid-2"><section className="card"><h2>اطلاعات پایه</h2>{editing ? <form className="form" onSubmit={save}><label className="field">نام<input name="firstName" defaultValue={data.profile.firstName} required minLength={2} /></label><label className="field">نام خانوادگی<input name="lastName" defaultValue={data.profile.lastName} required minLength={2} /></label><label className="field">ایمیل<input name="email" type="email" defaultValue={data.profile.email} required /></label><label className="field">سمت<input name="jobTitle" defaultValue={data.profile.jobTitle} required minLength={2} /></label>{error ? <p className="error" role="alert">{error}</p> : null}<div className="actions"><button className="button button-secondary" type="button" onClick={() => setEditing(false)}>انصراف</button><button className="button button-primary" type="submit">ذخیره</button></div></form> : <><p>{data.profile.firstName} {data.profile.lastName}</p><p><bdi>{data.profile.mobile}</bdi></p><p>{data.profile.email}</p><p>{data.profile.jobTitle}</p><button className="button button-secondary" type="button" onClick={() => setEditing(true)}>ویرایش اطلاعات</button><p className="hint">برای تغییر شماره همراه، تأیید رمز یک‌بارمصرف مجدد لازم است.</p></>}{!data.profile.emailVerifiedAt ? <section className="email-verification"><p className="notice">برای پرداخت نخستین سفارش، تأیید ایمیل لازم است.</p>{emailVerificationOpen ? <form className="form" onSubmit={confirmEmail}><label className="field">کد یا توکن ایمیل<input value={emailToken} onChange={(event) => setEmailToken(event.target.value)} minLength={20} required /></label><button className="button button-primary" type="submit">تأیید ایمیل</button></form> : <button className="button button-secondary" type="button" onClick={requestEmailVerification}>ارسال تأیید ایمیل</button>}</section> : <p className="success">ایمیل برای پرداخت تأیید شده است.</p>}{error ? <p className="error" role="alert">{error}</p> : null}{notice ? <p className="success" role="status">{notice}</p> : null}</section><section className="card"><h2>درخواست‌های من</h2>{data.requests.length ? <ul>{data.requests.map((item) => <li key={item.reference}><bdi>{item.reference}</bdi> — {item.title} — {new Date(item.submittedAt).toLocaleDateString('fa-IR')}</li>)}</ul> : <p className="muted">هنوز درخواستی ثبت نشده است.</p>}<Link className="button button-primary" href="/request">درخواست جدید</Link><hr/><h3>حریم خصوصی و حذف داده</h3><p className="hint">درخواست حذف فیزیکی سوابق مالی یا رضایت ممکن نیست؛ داده هویتی پس از دوره نگهداری مصوب ناشناس‌سازی می‌شود.</p><button className="button button-danger" type="button" disabled={deletionRequested} onClick={requestDeletion}>{deletionRequested ? 'درخواست ثبت شد' : 'درخواست ناشناس‌سازی داده'}</button></section></div>;
}
