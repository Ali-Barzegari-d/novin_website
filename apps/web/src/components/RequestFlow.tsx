'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AuthFlow } from './AuthFlow';
import { api, ApiError, post } from '@/lib/http';

type Account = { profile: { firstName?: string; lastName?: string; email?: string; jobTitle?: string }; organization: { displayName: string; type: string } | null };
const organizationLabels: Record<string, string> = { PRIVATE: 'خصوصی', PUBLIC: 'عمومی', GOVERNMENT: 'دولتی' };

export function RequestFlow() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [consent, setConsent] = useState(false);
  const [created, setCreated] = useState<{ id: string; reference: string }>();
  const [file, setFile] = useState<File>();
  const [uploadConsent, setUploadConsent] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');
  const pending = useRef(false);
  const key = useRef('');
  const heading = useRef<HTMLHeadingElement>(null);
  const stage = created ? 4 : !account ? 0 : !account.profile.firstName || !account.organization ? 1 : reviewing ? 3 : 2;

  async function loadAccount() {
    const data = await api<Account>('/api/v1/account');
    setAccount(data); setLoadError('');
  }
  useEffect(() => {
    let active = true;
    api<Account>('/api/v1/account').then((data) => { if (active) setAccount(data); }).catch((reason) => {
      if (active && (!(reason instanceof ApiError) || reason.status !== 401)) setLoadError((reason as Error).message);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (!loading) heading.current?.focus(); }, [stage, loading]);

  async function retryLoad() {
    setLoading(true);
    try { await loadAccount(); }
    catch (reason) { if (reason instanceof ApiError && reason.status === 401) { setAccount(null); setLoadError(''); } else setLoadError((reason as Error).message); }
    finally { setLoading(false); }
  }
  async function onboard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending.current) return;
    const form = new FormData(event.currentTarget);
    pending.current = true; setBusy(true); setError('');
    try {
      await post('/api/v1/account/onboarding', { firstName: form.get('firstName'), lastName: form.get('lastName'), email: form.get('email'), jobTitle: form.get('jobTitle'), organizationName: form.get('organizationName'), organizationType: form.get('organizationType'), representationConfirmed: form.get('representationConfirmed') === 'on', privacyVersion: 'draft-0.1' });
      await loadAccount();
    } catch (reason) { setError((reason as Error).message); }
    finally { pending.current = false; setBusy(false); }
  }
  function review(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!key.current) key.current = crypto.randomUUID();
    setReviewing(true);
  }
  async function submit() {
    if (pending.current || !consent || !account?.organization) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const result = await post<{ id: string; reference: string }>('/api/v1/requests', { title, description, organizationType: account.organization.type, privacyVersion: 'draft-0.1', idempotencyKey: key.current, confidentialityAccepted: consent, source: 'website' });
      setCreated(result); setReviewing(false);
    } catch (reason) { setError((reason as Error).message); }
    finally { pending.current = false; setBusy(false); }
  }
  async function upload() {
    if (!file || !created?.id || !uploadConsent || pending.current) return;
    pending.current = true; setBusy(true); setError(''); setUploadNotice('');
    try {
      const body = new FormData(); body.set('file', file);
      await api('/api/v1/requests/' + created.id + '/attachment', { method: 'POST', headers: { 'x-confidentiality-accepted': 'true' }, body });
      setFile(undefined); setUploadNotice('پیوست پس از بررسی امنیتی با موفقیت دریافت شد.');
    } catch (reason) { setError((reason as Error).message); }
    finally { pending.current = false; setBusy(false); }
  }
  if (loading) return <div className="card loading-state" role="status">در حال آماده‌سازی مسیر ثبت درخواست…</div>;
  if (loadError) return <div className="card"><h2>دریافت اطلاعات ممکن نشد.</h2><p role="alert" className="error">{loadError}</p><button className="button button-primary" onClick={() => void retryLoad()}>تلاش مجدد</button></div>;
  const errorMessage = error && <p className="error" role="alert">{error}</p>;
  return <div className="intake-layout">
    <aside className="intake-guide"><p className="eyebrow">نقطه آغاز همکاری</p><h2>اول، مسئله را بشناسیم.</h2><p className="muted">هنوز لازم نیست راه‌حل یا خدمت موردنیازتان را بدانید. از آنچه در سازمان شما اتفاق می‌افتد بگویید.</p>
      <ol className="intake-steps" aria-label="مراحل ثبت درخواست">{['تأیید شماره همراه', 'معرفی نماینده و سازمان', 'شرح مسئله', 'بازبینی و ثبت'].map((label, index) => <li key={label} aria-current={stage === index ? 'step' : undefined} className={stage > index ? 'is-complete' : ''}><span aria-hidden="true">{(index + 1).toLocaleString('fa-IR')}</span>{label}</li>)}</ol>
      <div className="intake-note"><strong>این مرحله رایگان است.</strong><p>ثبت مسئله تعهد خرید یا پذیرش پروژه ایجاد نمی‌کند. اطلاعات ثبتی و صورتحساب، در صورت نیاز، بعداً دریافت می‌شود.</p><Link href="/process">آشنایی با نحوه همکاری ←</Link></div>
    </aside>
    <div className="intake-content">
      {stage === 0 && <AuthFlow mode="request" onAuthenticated={loadAccount} />}
      {stage === 1 && <form className="form card" onSubmit={onboard} aria-busy={busy}><p className="eyebrow">نماینده یک شخص حقوقی</p><h2 tabIndex={-1} ref={heading}>با شما و سازمانتان آشنا شویم.</h2><p className="muted">نام رایج سازمان کافی است؛ شناسه ملی در این مرحله لازم نیست.</p><div className="grid-2"><label className="field">نام<input name="firstName" minLength={2} maxLength={80} autoComplete="given-name" defaultValue={account?.profile.firstName} required /></label><label className="field">نام خانوادگی<input name="lastName" minLength={2} maxLength={80} autoComplete="family-name" defaultValue={account?.profile.lastName} required /></label></div><label className="field">ایمیل<input dir="ltr" name="email" type="email" autoComplete="email" defaultValue={account?.profile.email} required /></label><label className="field">سمت شما در سازمان<input name="jobTitle" autoComplete="organization-title" minLength={2} maxLength={120} defaultValue={account?.profile.jobTitle} required /></label><label className="field">نام رایج سازمان<input name="organizationName" autoComplete="organization" minLength={2} maxLength={180} required /></label><label className="field">نوع سازمان<select name="organizationType" defaultValue="PRIVATE">{Object.entries(organizationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="check-field"><input name="representationConfirmed" type="checkbox" required /><span>تأیید می‌کنم رابط یا نماینده این سازمان هستم و <Link href="/privacy">حریم خصوصی</Link> را خوانده‌ام.</span></label>{errorMessage}<button className="button button-primary" disabled={busy} type="submit">{busy ? 'در حال ثبت اطلاعات…' : 'ادامه به شرح مسئله'}</button></form>}
      {stage === 2 && <form className="form card" onSubmit={review}><p className="eyebrow">به زبان خودتان بنویسید</p><h2 tabIndex={-1} ref={heading}>چه مسئله‌ای پیش روی شماست؟</h2><div className="organization-summary"><strong>{account?.organization?.displayName}</strong><span>{organizationLabels[account?.organization?.type ?? 'PRIVATE']} · {account?.profile.firstName} {account?.profile.lastName}</span></div><label className="field">عنوان کوتاه درخواست<input name="title" value={title} onChange={(event) => setTitle(event.target.value)} minLength={5} maxLength={180} placeholder="مثلاً: ثبت‌های تکراری بین فروش و حسابداری" required /></label><label className="field">شرح مسئله<textarea name="description" value={description} onChange={(event) => setDescription(event.target.value)} minLength={30} maxLength={8000} aria-describedby="description-hint" placeholder="چه اتفاقی می‌افتد؟ کدام بخش‌ها درگیرند؟ چه تغییری انتظار دارید؟" required /><span className="hint" id="description-hint">حداقل ۳۰ نویسه؛ فقط زمینه و مسئله، بدون داده محرمانه یا اطلاعات اشخاص.</span></label><label className="check-field"><input checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" required /><span>هشدار منع اطلاعات محرمانه را خوانده‌ام و <Link href="/privacy">حریم خصوصی</Link> را می‌پذیرم.</span></label><p className="hint">پیوست غیرمحرمانه اختیاری را پس از ثبت شماره پیگیری می‌توانید اضافه کنید.</p>{errorMessage}<button className="button button-primary" type="submit">بازبینی درخواست ←</button></form>}
      {stage === 3 && <div className="card form" aria-busy={busy}><p className="eyebrow">یک نگاه پیش از ارسال</p><h2 tabIndex={-1} ref={heading}>اطلاعات درست است؟</h2><dl className="review-summary"><div><dt>سازمان</dt><dd>{account?.organization?.displayName}</dd></div><div><dt>عنوان درخواست</dt><dd>{title}</dd></div><div><dt>شرح مسئله</dt><dd className="preline">{description}</dd></div></dl><p className="notice">ثبت درخواست به معنی سفارش قطعی نیست. پس از بررسی، برای ادامه گفت‌وگو با شما تماس گرفته می‌شود.</p>{errorMessage}<div className="actions"><button className="button button-primary" disabled={busy} onClick={() => void submit()}>{busy ? 'در حال ثبت درخواست…' : 'ثبت نهایی درخواست'}</button><button className="text-button" disabled={busy} onClick={() => { setReviewing(false); setError(''); }}>ویرایش اطلاعات</button></div></div>}
      {stage === 4 && created && <div className="card form"><p className="eyebrow">مسئله شما دریافت شد</p><h2 tabIndex={-1} ref={heading}>گفت‌وگو را ادامه می‌دهیم.</h2><p className="success" role="status">شماره پیگیری: <bdi>{created.reference}</bdi></p><p className="muted">شماره پیگیری را نگه دارید. ادامه بررسی از طریق تماس انجام می‌شود؛ فهرست درخواست‌ها نیز در حساب شما باقی می‌ماند.</p><details className="attachment-panel"><summary>افزودن پیوست غیرمحرمانه (اختیاری)</summary><p className="hint">PDF، Word، Excel یا تصویر؛ حداکثر ۱۰ مگابایت. اسناد محرمانه، مدارک هویتی، حقوق و دستمزد یا اطلاعات بانکی ارسال نکنید.</p><label className="check-field"><input type="checkbox" checked={uploadConsent} onChange={(event) => setUploadConsent(event.target.checked)} /><span>تأیید می‌کنم فایل حاوی داده حساس یا محرمانه نیست.</span></label><label className="field">انتخاب فایل<input type="file" disabled={!uploadConsent || busy} accept=".pdf,.docx,.xlsx,.png,.jpeg,.jpg" onChange={(event) => { const candidate = event.target.files?.[0]; setError(''); setUploadNotice(''); if (candidate && candidate.size > 10 * 1024 * 1024) { setFile(undefined); setError('حجم فایل باید حداکثر ۱۰ مگابایت باشد.'); event.target.value = ''; } else setFile(candidate); }} /></label>{file && <button className="button button-secondary" disabled={busy || !uploadConsent} onClick={() => void upload()}>{busy ? 'در حال بررسی امنیتی…' : 'بارگذاری پیوست'}</button>}{uploadNotice && <p className="success" role="status">{uploadNotice}</p>}</details>{errorMessage}<Link className="button button-primary" href="/account">مشاهده درخواست‌های من</Link></div>}
    </div>
  </div>;
}
