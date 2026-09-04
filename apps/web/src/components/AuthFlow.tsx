'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Icon } from './Icon';

type Stage = 'mobile' | 'code' | 'profile';

export function AuthFlow({ next = '/account' }: { next?: string }) {
  const [stage, setStage] = useState<Stage>('mobile');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const router = useRouter();
  const reduce = useReducedMotion();

  async function send(formData: FormData) {
    setBusy(true); setError('');
    const value = String(formData.get('mobile') ?? '');
    try { const result = await api<{ retryAfterSeconds: number }>('/api/v1/auth/otp', { method: 'POST', body: JSON.stringify({ mobile: value }) }); setMobile(value); setRetryAfter(result.retryAfterSeconds); setStage('code'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'ارسال رمز ناموفق بود.'); }
    finally { setBusy(false); }
  }
  async function verify(formData: FormData) {
    setBusy(true); setError('');
    try { const result = await api<{ onboardingRequired: boolean }>('/api/v1/auth/verify', { method: 'POST', body: JSON.stringify({ mobile, code: formData.get('code'), idempotencyKey: crypto.randomUUID() }) }); if (result.onboardingRequired) setStage('profile'); else { router.push(next); router.refresh(); } }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'تأیید رمز ناموفق بود.'); }
    finally { setBusy(false); }
  }
  async function profile(formData: FormData) {
    setBusy(true); setError('');
    try { await api('/api/v1/account/onboarding', { method: 'POST', body: JSON.stringify({ firstName: formData.get('firstName'), lastName: formData.get('lastName'), email: formData.get('email'), jobTitle: formData.get('jobTitle'), organizationName: formData.get('organizationName'), organizationType: formData.get('organizationType'), representationConfirmed: formData.get('representationConfirmed') === 'on', privacyVersion: 'draft-0.1' }) }); router.push(next); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'تکمیل حساب ناموفق بود.'); }
    finally { setBusy(false); }
  }
  const transitions = reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: .3 } };
  return <div className="auth-flow"><div className="form-progress" aria-label="مراحل ورود"><span className={stage === 'mobile' ? 'active' : 'done'}>شماره همراه</span><span className={stage === 'code' ? 'active' : stage === 'profile' ? 'done' : ''}>تأیید</span><span className={stage === 'profile' ? 'active' : ''}>مشخصات سازمانی</span></div><AnimatePresence mode="wait">
    {stage === 'mobile' && <motion.form key="mobile" className="form-surface" action={send} {...transitions}><h2>ورود بدون رمز عبور</h2><p>شماره همراه ایرانی خود را وارد کنید. وجود یا نبود حساب در پاسخ این مرحله افشا نمی‌شود.</p><label>شماره همراه<input name="mobile" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="09121234567" required/></label><button className="button button-large" disabled={busy}>{busy ? 'در حال ارسال…' : 'دریافت رمز یک‌بارمصرف'} <Icon name="arrow"/></button></motion.form>}
    {stage === 'code' && <motion.form key="code" className="form-surface" action={verify} {...transitions}><button className="back-action" type="button" onClick={() => setStage('mobile')}>اصلاح شماره</button><h2>رمز تأیید را وارد کنید</h2><p>رمز شش‌رقمی به <b dir="ltr">{mobile}</b> ارسال شد. اعتبار و تعداد تلاش محدود است.</p><label>رمز یک‌بارمصرف<input name="code" className="otp-input" dir="ltr" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9۰-۹]{6}" maxLength={6} required/></label><button className="button button-large" disabled={busy}>{busy ? 'در حال بررسی…' : 'تأیید و ورود'} <Icon name="arrow"/></button><small>ارسال مجدد پس از {new Intl.NumberFormat('fa-IR').format(retryAfter)} ثانیه امکان‌پذیر است.</small></motion.form>}
    {stage === 'profile' && <motion.form key="profile" className="form-surface" action={profile} {...transitions}><h2>شما نماینده کدام سازمان هستید؟</h2><p>این حساب متعلق به رابط یک شخص حقوقی است. نام ثبتی و شناسه ملی فقط پیش از پرداخت لازم می‌شوند.</p><div className="field-grid"><label>نام<input name="firstName" minLength={2} required/></label><label>نام خانوادگی<input name="lastName" minLength={2} required/></label></div><div className="field-grid"><label>سمت سازمانی<input name="jobTitle" minLength={2} required/></label><label>ایمیل سازمانی<input name="email" type="email" required/></label></div><label>نام رایج سازمان<input name="organizationName" minLength={2} required/></label><label>نوع سازمان<select name="organizationType" defaultValue="PRIVATE"><option value="PRIVATE">خصوصی</option><option value="PUBLIC">عمومی</option><option value="GOVERNMENT">دولتی</option></select></label><label className="check-field"><input name="representationConfirmed" type="checkbox" required/><span>تأیید می‌کنم رابط یا نماینده این سازمان هستم و پیش‌نویس حریم خصوصی را دیده‌ام.</span></label><button className="button button-large" disabled={busy}>{busy ? 'در حال ثبت…' : 'تکمیل حساب'} <Icon name="arrow"/></button></motion.form>}
  </AnimatePresence>{error && <p className="form-error" role="alert">{error}</p>}</div>;
}
