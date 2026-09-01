'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';

type Data = { profile: { firstName?: string; lastName?: string; mobile: string; email?: string; jobTitle?: string }; requests: { reference: string; title: string; submittedAt: string }[] };

export function AccountPanel() {
  const [data, setData] = useState<Data>();
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetch('/api/v1/account').then(async (res) => { if (!res.ok) return setFailed(true); setData(await res.json()); }).catch(() => setFailed(true)); }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/v1/account', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ firstName: form.get('firstName'), lastName: form.get('lastName'), email: form.get('email'), jobTitle: form.get('jobTitle') }) });
    if (!response.ok) return setError((await response.json()).error ?? 'ذخیره اطلاعات ناموفق بود.');
    setData((current) => current ? { ...current, profile: { ...current.profile, firstName: String(form.get('firstName')), lastName: String(form.get('lastName')), email: String(form.get('email')), jobTitle: String(form.get('jobTitle')) } } : current);
    setEditing(false); setNotice('اطلاعات پایه به‌روزرسانی شد.');
  }

  if (failed) return <div className="card"><p>برای مشاهده حساب وارد شوید.</p><Link className="button button-primary" href="/login">ورود</Link></div>;
  if (!data) return <div className="card">در حال بارگذاری…</div>;

  return <div className="grid-2"><section className="card"><h2>اطلاعات پایه</h2>{editing ? <form className="form" onSubmit={save}><label className="field">نام<input name="firstName" defaultValue={data.profile.firstName} required minLength={2} /></label><label className="field">نام خانوادگی<input name="lastName" defaultValue={data.profile.lastName} required minLength={2} /></label><label className="field">ایمیل<input name="email" type="email" defaultValue={data.profile.email} required /></label><label className="field">سمت<input name="jobTitle" defaultValue={data.profile.jobTitle} required minLength={2} /></label>{error ? <p className="error" role="alert">{error}</p> : null}<div className="actions"><button className="button button-secondary" type="button" onClick={() => setEditing(false)}>انصراف</button><button className="button button-primary" type="submit">ذخیره</button></div></form> : <><p>{data.profile.firstName} {data.profile.lastName}</p><p><bdi>{data.profile.mobile}</bdi></p><p>{data.profile.email}</p><p>{data.profile.jobTitle}</p><button className="button button-secondary" type="button" onClick={() => setEditing(true)}>ویرایش اطلاعات</button><p className="hint">برای تغییر شماره همراه، تأیید رمز یک‌بارمصرف مجدد لازم است.</p></>}{notice ? <p className="success" role="status">{notice}</p> : null}</section><section className="card"><h2>درخواست‌های من</h2>{data.requests.length ? <ul>{data.requests.map((item) => <li key={item.reference}><bdi>{item.reference}</bdi> — {item.title} — {new Date(item.submittedAt).toLocaleDateString('fa-IR')}</li>)}</ul> : <p className="muted">هنوز درخواستی ثبت نشده است.</p>}<Link className="button button-primary" href="/request">درخواست جدید</Link></section></div>;
}
