'use client';
import { useState } from 'react';

export function ComplaintForm() {
  const [result, setResult] = useState<string>(); const [error, setError] = useState<string>();
  async function submit(form: FormData) { setError(undefined); const response = await fetch('/api/v1/complaints', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), mobile: form.get('mobile'), email: form.get('email') || undefined, subject: form.get('subject'), description: form.get('description'), idempotencyKey: crypto.randomUUID() }) }); const data = await response.json(); if (!response.ok) return setError(data.error ?? 'ثبت شکایت ناموفق بود.'); setResult(data.reference); }
  return <form className="form" action={submit}><label className="field">نام و نام خانوادگی<input name="name" required autoComplete="name" /></label><label className="field">شماره همراه<input name="mobile" required inputMode="tel" autoComplete="tel" /></label><label className="field">ایمیل (اختیاری)<input name="email" type="email" autoComplete="email" /></label><label className="field">موضوع<input name="subject" required /></label><label className="field">شرح شکایت<textarea name="description" required /><span className="hint">در این مرحله مدرک یا اطلاعات حساس ارسال نکنید.</span></label>{error ? <p className="error" role="alert">{error}</p> : null}{result ? <p className="success" role="status">شکایت ثبت شد. شماره پیگیری: <bdi>{result}</bdi></p> : <button className="button button-primary" type="submit">ثبت شکایت</button>}</form>;
}
