'use client';

import { useState } from 'react';
import { Icon } from './Icon';

type State = { kind: 'idle' | 'loading' | 'success' | 'error'; message?: string; reference?: string };

export function ComplaintForm() {
  const [state, setState] = useState<State>({ kind: 'idle' });
  async function submit(formData: FormData) {
    setState({ kind: 'loading' });
    try {
      const response = await fetch('/api/v1/complaints', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: formData.get('name'), mobile: formData.get('mobile'), email: formData.get('email') || undefined, subject: formData.get('subject'), description: formData.get('description'), idempotencyKey: crypto.randomUUID() }) });
      const body = await response.json() as { reference?: string; error?: string };
      if (!response.ok) throw new Error(body.error ?? 'ثبت شکایت ناموفق بود.');
      setState({ kind: 'success', reference: body.reference ?? 'ثبت‌شده' });
    } catch (error) { setState({ kind: 'error', message: error instanceof Error ? error.message : 'خطای غیرمنتظره رخ داد.' }); }
  }
  if (state.kind === 'success') return <div className="result-state success" role="status"><Icon name="check"/><h2>شکایت ثبت شد</h2><p>شماره پیگیری: <b dir="ltr">{state.reference}</b></p></div>;
  return <form className="form-surface" action={submit}><div className="field-grid"><label>نام و نام خانوادگی<input name="name" minLength={2} maxLength={160} required autoComplete="name"/></label><label>شماره همراه<input name="mobile" inputMode="tel" required autoComplete="tel" placeholder="۰۹۱۲۱۲۳۴۵۶۷"/></label></div><label>ایمیل <span>(اختیاری)</span><input name="email" type="email" autoComplete="email"/></label><label>موضوع<input name="subject" minLength={5} maxLength={180} required/></label><label>شرح شکایت<textarea name="description" minLength={20} maxLength={3000} rows={7} required/></label>{state.kind === 'error' && <p className="form-error" role="alert">{state.message}</p>}<button className="button button-large" disabled={state.kind === 'loading'}>{state.kind === 'loading' ? 'در حال ثبت…' : 'ثبت و دریافت شماره پیگیری'}</button></form>;
}
