'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { Icon } from './Icon';

type Account = { organization?: { type: 'PRIVATE' | 'PUBLIC' | 'GOVERNMENT'; displayName: string } };
type Draft = { title: string; description: string; organizationType: 'PRIVATE' | 'PUBLIC' | 'GOVERNMENT'; confidentialityAccepted: boolean };

export function RequestWizard() {
  const [auth, setAuth] = useState<'loading' | 'ready' | 'unauthorized'>('loading');
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({ title: '', description: '', organizationType: 'PRIVATE', confidentialityAccepted: false });
  const [file, setFile] = useState<File | null>(null);
  const [fileWarning, setFileWarning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ reference: string; id: string } | null>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const reduce = useReducedMotion();
  useEffect(() => { api<Account>('/api/v1/account').then((account) => { if (account.organization?.type) setDraft((value) => ({ ...value, organizationType: account.organization!.type })); setAuth('ready'); }).catch((cause) => setAuth(cause instanceof ApiError && cause.status === 401 ? 'unauthorized' : 'ready')); }, []);
  const valid = useMemo(() => draft.title.trim().length >= 5 && draft.description.trim().length >= 30 && draft.confidentialityAccepted, [draft]);
  async function submit() {
    setBusy(true); setError('');
    try {
      const created = await api<{ id: string; reference: string }>('/api/v1/requests', { method: 'POST', body: JSON.stringify({ ...draft, privacyVersion: 'draft-0.1', source: 'web', idempotencyKey }) });
      if (file) { const data = new FormData(); data.append('file', file); data.append('confidentialityAccepted', 'true'); await api(`/api/v1/requests/${created.id}/attachment`, { method: 'POST', body: data }); }
      setResult(created);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'ثبت درخواست ناموفق بود.'); }
    finally { setBusy(false); }
  }
  if (auth === 'loading') return <div className="loading-state" role="status"><span/>در حال بررسی حساب…</div>;
  if (auth === 'unauthorized') return <div className="result-state"><Icon name="lock"/><h2>برای ثبت درخواست وارد شوید</h2><p>پس از ورود به همین مرحله بازمی‌گردید.</p><Link className="button" href="/login?next=/request">ورود با شماره همراه</Link></div>;
  if (result) return <div className="result-state success" role="status"><Icon name="check"/><h2>درخواست شما ثبت شد</h2><p>شماره قابل ارجاع:</p><strong dir="ltr">{result.reference}</strong><p>تأیید از طریق صفحه و کانال‌های ثبت‌شده ارسال می‌شود.</p><Link className="button" href="/account">مشاهده حساب کاربری</Link></div>;
  const animation = reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: .3 } };
  return <div className="wizard"><ol className="wizard-steps"><li className={step === 0 ? 'active' : step > 0 ? 'done' : ''}>شرح مسئله</li><li className={step === 1 ? 'active' : step > 1 ? 'done' : ''}>پیوست اختیاری</li><li className={step === 2 ? 'active' : ''}>بازبینی و ارسال</li></ol><AnimatePresence mode="wait">
    {step === 0 && <motion.section key="describe" className="form-surface" {...animation}><h2>چه مسئله‌ای باید روشن شود؟</h2><p>لازم نیست نوع خدمت یا راه‌حل را انتخاب کنید. موقعیت، مانع و تصمیمی که باید گرفته شود را بنویسید.</p><label>عنوان کوتاه<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} minLength={5} maxLength={180} placeholder="مثلاً یکپارچه‌سازی گزارش و فرایند مالی"/></label><label>شرح مسئله<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={9} minLength={30} maxLength={8000} placeholder="اکنون چه اتفاقی می‌افتد، چه چیزی مبهم یا دشوار است و چه تصمیمی باید ممکن شود؟"/><span className="char-count">{new Intl.NumberFormat('fa-IR').format(draft.description.length)} از ۸۰۰۰</span></label><label>نوع سازمان<select value={draft.organizationType} onChange={(event) => setDraft({ ...draft, organizationType: event.target.value as Draft['organizationType'] })}><option value="PRIVATE">خصوصی</option><option value="PUBLIC">عمومی</option><option value="GOVERNMENT">دولتی</option></select></label><label className="check-field"><input type="checkbox" checked={draft.confidentialityAccepted} onChange={(event) => setDraft({ ...draft, confidentialityAccepted: event.target.checked })}/><span>تأیید می‌کنم در این مرحله اطلاعات هویتی اشخاص، داده حساس یا سند محرمانه وارد نکرده‌ام.</span></label><button className="button button-large" disabled={!valid} onClick={() => setStep(1)}>ادامه <Icon name="arrow"/></button></motion.section>}
    {step === 1 && <motion.section key="file" className="form-surface" {...animation}><h2>پیوست اختیاری</h2><div className="security-callout"><Icon name="warning"/><div><strong>فایل محرمانه یا حساس ارسال نکنید.</strong><p>تبادل داده محرمانه فقط پس از پذیرش اولیه، توافق محرمانگی و از مسیر امن انجام می‌شود.</p></div></div><label className="upload-zone"><Icon name="upload"/><strong>{file ? file.name : 'انتخاب یک فایل'}</strong><span>PDF، DOCX، XLSX یا تصویر مجاز؛ سقف حجم طبق تنظیمات سامانه.</span><input type="file" accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg" onChange={(event) => setFile(event.target.files?.[0] ?? null)}/></label>{file && <label className="check-field"><input type="checkbox" checked={fileWarning} onChange={(event) => setFileWarning(event.target.checked)}/><span>تأیید می‌کنم فایل انتخاب‌شده محرمانه یا حساس نیست.</span></label>}<div className="form-actions"><button className="secondary-button" onClick={() => setStep(0)}>بازگشت</button><button className="button" disabled={Boolean(file) && !fileWarning} onClick={() => setStep(2)}>بازبینی <Icon name="arrow"/></button></div></motion.section>}
    {step === 2 && <motion.section key="review" className="form-surface" {...animation}><h2>بازبینی نهایی</h2><dl className="review-list"><div><dt>عنوان</dt><dd>{draft.title}</dd></div><div><dt>شرح</dt><dd>{draft.description}</dd></div><div><dt>نوع سازمان</dt><dd>{{ PRIVATE: 'خصوصی', PUBLIC: 'عمومی', GOVERNMENT: 'دولتی' }[draft.organizationType]}</dd></div><div><dt>پیوست</dt><dd>{file?.name ?? 'بدون پیوست'}</dd></div></dl><p className="security-callout"><Icon name="document"/>ثبت این درخواست به معنی سفارش قطعی، پذیرش پروژه یا تشکیل قرارداد نیست.</p>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button className="secondary-button" disabled={busy} onClick={() => setStep(1)}>اصلاح</button><button className="button button-large" disabled={busy} onClick={submit}>{busy ? 'در حال ثبت…' : 'ثبت نهایی درخواست'} <Icon name="arrow"/></button></div></motion.section>}
  </AnimatePresence></div>;
}
