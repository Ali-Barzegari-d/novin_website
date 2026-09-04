'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/http';

export function AuthFlow({ mode, onAuthenticated }: { mode: 'login' | 'request'; onAuthenticated?: () => Promise<void> }) {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const codeInput = useRef<HTMLInputElement>(null);
  const pending = useRef(false);
  useEffect(() => { if (sent) codeInput.current?.focus(); }, [sent]);
  useEffect(() => { if (!countdown) return; const timer = window.setTimeout(() => setCountdown((value) => Math.max(0, value - 1)), 1000); return () => clearTimeout(timer); }, [countdown]);

  async function send(event?: FormEvent) {
    event?.preventDefault(); if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const data = await post<{ retryAfterSeconds: number }>('/api/v1/auth/otp', { mobile });
      setSent(true); setCode(''); setCountdown(data.retryAfterSeconds);
      window.dispatchEvent(new Event('novin:sms'));
    } catch (reason) { setError((reason as Error).message); }
    finally { pending.current = false; setBusy(false); }
  }
  async function verify(event: FormEvent) {
    event.preventDefault(); if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const data = await post<{ onboardingRequired: boolean }>('/api/v1/auth/verify', { mobile, code, idempotencyKey: crypto.randomUUID() });
      window.dispatchEvent(new Event('novin:sms-clear'));
      if (onAuthenticated) await onAuthenticated();
      else router.push(data.onboardingRequired ? '/request?onboarding=1' : mode === 'request' ? '/request' : '/account');
    } catch (reason) { setError((reason as Error).message); }
    finally { pending.current = false; setBusy(false); }
  }
  return <div className="card auth-card">
    <p className="eyebrow">ورود بدون رمز عبور</p>
    <h2>{sent ? 'شماره همراه را تأیید کنید.' : 'گفت‌وگو از اینجا شروع می‌شود.'}</h2>
    <p className="muted">{sent ? <>رمز به <bdi>{mobile}</bdi> ارسال شد و دو دقیقه اعتبار دارد.</> : 'شماره همراه نماینده سازمان را وارد کنید. اگر حساب ندارید، در همین مسیر ساخته می‌شود.'}</p>
    <form className="form" onSubmit={sent ? verify : send} aria-busy={busy}>
      {sent ? <label className="field">رمز ۶ رقمی<input className="otp-input" ref={codeInput} name="code" dir="ltr" value={code} onChange={(event) => setCode(event.target.value.replace(/[۰-۹]/g, (n) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(n))).replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required aria-describedby="otp-hint" /><span id="otp-hint" className="hint">می‌توانید رمز را یک‌جا جای‌گذاری کنید.</span></label> : <label className="field">شماره همراه ایران<input name="mobile" dir="ltr" type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} autoComplete="tel" required placeholder="۰۹۱۲۱۲۳۴۵۶۷" /></label>}
      {error && <p className="error" role="alert">{error}</p>}
      <button className="button button-primary" disabled={busy} type="submit">{busy ? 'لطفاً صبر کنید…' : sent ? 'تأیید و ادامه' : 'دریافت رمز یک‌بارمصرف'}</button>
      {sent && <div className="auth-options"><button className="text-button" type="button" disabled={busy} onClick={() => { setSent(false); setError(''); }}>ویرایش شماره</button><button className="text-button" type="button" disabled={busy || countdown > 0} onClick={() => void send()}>{countdown ? `ارسال مجدد تا ${countdown.toLocaleString('fa-IR')} ثانیه دیگر` : 'ارسال مجدد رمز'}</button></div>}
    </form>
  </div>;
}
