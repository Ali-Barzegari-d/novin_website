'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, ApiError, money, persianDate } from '@/lib/api';
import { Icon } from './Icon';

type Role = 'EXPERT' | 'OPERATIONS' | 'FINANCE' | 'CONTENT' | 'SUPERADMIN';
type Session = { role: Role; authLevel: number };
type RequestRow = { id: string; reference: string; title: string; state: string; version: number; submittedAt: string; organization: string; mobile: string; assigneeId?: string };
type Transfer = { id: string; state: string; reference: string; amountIrr: number; bankName: string; depositorName: string; transferredAt: string; orderReference: string };
type ContentRow = { slug: string; title: string; state: string; version: number; isPlaceholder: boolean; body: Record<string, unknown> };
type Staff = { id: string; mobile: string; firstName?: string; lastName?: string; role: Role; active: boolean; mfaEnrolledAt?: string };

const roleLabels: Record<Role, string> = { EXPERT: 'کارشناس', OPERATIONS: 'عملیات', FINANCE: 'مالی', CONTENT: 'محتوا', SUPERADMIN: 'سوپرادمین' };
const stateLabels: Record<string, string> = { SUBMITTED: 'جدید', UNDER_REVIEW: 'در بررسی', CONTACT_PENDING: 'در انتظار تماس', NEED_MORE_INFO: 'نیازمند اطلاعات', QUALIFIED: 'واجد همکاری', REJECTED: 'فاقد امکان همکاری', OFFER_SENT: 'پیشنهاد ارسال‌شده', PAID: 'وصول‌شده', SESSION_SCHEDULED: 'جلسه برنامه‌ریزی‌شده', SESSION_COMPLETED: 'جلسه انجام‌شده', PROJECT_PROPOSED: 'پروژه پیشنهادشده', ARCHIVED: 'بایگانی' };
const nextStates: Record<string, string[]> = { SUBMITTED: ['UNDER_REVIEW'], UNDER_REVIEW: ['CONTACT_PENDING', 'NEED_MORE_INFO', 'REJECTED'], CONTACT_PENDING: ['QUALIFIED', 'REJECTED', 'NEED_MORE_INFO'], NEED_MORE_INFO: ['UNDER_REVIEW', 'REJECTED'], REJECTED: ['ARCHIVED'], PAID: ['SESSION_SCHEDULED'], SESSION_SCHEDULED: ['SESSION_COMPLETED', 'ARCHIVED'], SESSION_COMPLETED: ['PROJECT_PROPOSED', 'ARCHIVED'], PROJECT_PROPOSED: ['ARCHIVED'] };

export function AdminWorkspace() {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unauthorized' | 'error'>('loading');
  const [tab, setTab] = useState('summary');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [content, setContent] = useState<ContentRow[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selected, setSelected] = useState<RequestRow | null>(null);
  const [message, setMessage] = useState('');
  const availableTabs = useMemo<[string, string][]>(() => session ? [
    ['summary', 'نمای کلی'],
    ...(['EXPERT','OPERATIONS','SUPERADMIN'].includes(session.role) ? [['requests', 'درخواست‌ها']] : []),
    ...(['FINANCE','SUPERADMIN'].includes(session.role) ? [['finance', 'مالی']] : []),
    ...(['CONTENT','SUPERADMIN'].includes(session.role) ? [['content', 'محتوا']] : []),
    ...(session.role === 'SUPERADMIN' ? [['access', 'دسترسی و تنظیمات']] : [])
  ] as [string, string][] : [], [session]);
  async function load() {
    try {
      const active = await api<Session>('/api/v1/session');
      if (active.role === 'CUSTOMER' as Role) { setStatus('unauthorized'); return; }
      setSession(active); setCounts(await api('/api/v1/admin/dashboard')); setStatus('ready');
      if (['EXPERT','OPERATIONS','SUPERADMIN'].includes(active.role)) setRequests(await api('/api/v1/admin/requests'));
      if (['FINANCE','SUPERADMIN'].includes(active.role)) setTransfers(await api('/api/v1/admin/bank-transfers'));
      if (['CONTENT','SUPERADMIN'].includes(active.role)) setContent(await api('/api/v1/admin/content'));
      if (active.role === 'SUPERADMIN' && active.authLevel >= 2) setStaff(await api('/api/v1/admin/staff'));
    } catch (error) { setStatus(error instanceof ApiError && error.status === 401 ? 'unauthorized' : 'error'); setMessage(error instanceof Error ? error.message : 'خطا'); }
  }
  useEffect(() => { void load(); }, []);
  async function transition(formData: FormData) {
    if (!selected) return; setMessage('');
    try { const state = String(formData.get('state')); await api(`/api/v1/admin/requests/${selected.id}/transition`, { method: 'POST', body: JSON.stringify({ state, expectedVersion: selected.version, outcome: ['QUALIFIED','REJECTED','NEED_MORE_INFO'].includes(state) ? state : undefined, note: formData.get('note'), contactedAt: formData.get('contactedAt') ? new Date(String(formData.get('contactedAt'))).toISOString() : undefined }) }); setSelected(null); setMessage('تغییر با ثبت ممیزی ذخیره شد.'); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'تغییر ثبت نشد.'); }
  }
  async function reviewTransfer(id: string, action: 'confirm' | 'reject') { const note = action === 'confirm' ? 'وصول با سند بانکی بررسی و تأیید شد.' : 'اطلاعات واریز نیازمند اصلاح است.'; try { await api(`/api/v1/admin/bank-transfers/${id}/${action}`, { method: 'POST', body: JSON.stringify({ note }) }); setMessage('نتیجه بررسی واریز ثبت شد.'); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : 'عملیات ناموفق بود.'); } }
  async function saveContent(formData: FormData) { try { const slug = String(formData.get('slug')); await api(`/api/v1/admin/content/${encodeURIComponent(slug)}`, { method: 'PUT', body: JSON.stringify({ title: formData.get('title'), body: { content: formData.get('body') }, state: formData.get('state'), isPlaceholder: formData.get('isPlaceholder') === 'on' }) }); setMessage('نسخه محتوا ذخیره شد.'); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : 'ذخیره محتوا ناموفق بود.'); } }
  async function updateStaff(id: string, formData: FormData) { try { await api(`/api/v1/admin/staff/${id}`, { method: 'PATCH', body: JSON.stringify({ role: formData.get('role'), active: formData.get('active') === 'on' }) }); setMessage('دسترسی تغییر کرد و نشست‌های قبلی در صورت نیاز باطل شدند.'); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : 'تغییر دسترسی ناموفق بود.'); } }
  if (status === 'loading') return <div className="loading-state"><span/>در حال آماده‌سازی فضای کاری…</div>;
  if (status === 'unauthorized') return <div className="result-state error"><Icon name="lock"/><h2>دسترسی داخلی لازم است</h2><p>با حساب مجاز وارد شوید. عملیات هر نقش به حداقل دسترسی لازم محدود است.</p></div>;
  if (status === 'error' || !session) return <div className="result-state error"><Icon name="warning"/><h2>فضای کاری دریافت نشد</h2><p>{message}</p></div>;
  return <div className="admin-shell"><aside className="admin-nav"><div><span className="role-badge">{roleLabels[session.role]}</span><strong>فضای کاری داخلی</strong></div><nav>{availableTabs.map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</nav><a href="/api/v1/admin/requests.csv">خروجی CSV مجاز</a></aside><section className="admin-content">{message && <p className="inline-status" role="status">{message}</p>}
    {tab === 'summary' && <div><header className="admin-title"><h2>نمای کلی</h2><p>فقط داده‌های لازم برای نقش {roleLabels[session.role]} نمایش داده می‌شوند.</p></header><div className="summary-ledger">{Object.entries(counts).map(([key, value]) => <div key={key}><span>{{ requests: 'همه درخواست‌ها', newRequests: 'درخواست جدید', pendingTransfers: 'واریز در انتظار', contentDrafts: 'پیش‌نویس محتوا' }[key] ?? key}</span><strong>{new Intl.NumberFormat('fa-IR').format(value)}</strong></div>)}</div></div>}
    {tab === 'requests' && <div><header className="admin-title"><h2>میز درخواست‌ها</h2><p>جست‌وجو، پالایش و ثبت نتیجه تماس؛ وضعیت داخلی برای مشتری نمایش داده نمی‌شود.</p></header><form className="filter-bar" onSubmit={async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const query = new URLSearchParams(); if (data.get('q')) query.set('q', String(data.get('q'))); if (data.get('state')) query.set('state', String(data.get('state'))); setRequests(await api(`/api/v1/admin/requests?${query}`)); }}><label>جست‌وجو<input name="q" placeholder="شماره، سازمان، همراه یا شناسه ملی"/></label><label>وضعیت<select name="state"><option value="">همه</option>{Object.entries(stateLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="button">اعمال</button></form><div className="data-table" role="table"><div className="table-head" role="row"><span>درخواست</span><span>سازمان</span><span>وضعیت</span><span>تاریخ</span></div>{requests.map((row) => <button key={row.id} className="table-row" onClick={() => setSelected(row)}><span><b dir="ltr">{row.reference}</b><small>{row.title}</small></span><span>{row.organization}</span><span><i className={`state state-${row.state.toLowerCase()}`}>{stateLabels[row.state] ?? row.state}</i></span><span>{persianDate(row.submittedAt)}</span></button>)}</div>{selected && <form className="admin-editor" action={transition}><button type="button" className="close-editor" onClick={() => setSelected(null)} aria-label="بستن"><Icon name="close"/></button><span className="role-badge" dir="ltr">{selected.reference}</span><h3>{selected.title}</h3><label>مرحله بعد<select name="state" required>{(nextStates[selected.state] ?? []).map((state) => <option key={state} value={state}>{stateLabels[state]}</option>)}</select></label><label>یادداشت داخلی<textarea name="note" minLength={3} rows={5} required/></label><label>زمان تماس <span>(اختیاری)</span><input type="datetime-local" name="contactedAt"/></label><button className="button" disabled={!nextStates[selected.state]?.length}>ثبت تغییر و ممیزی</button></form>}</div>}
    {tab === 'finance' && <div><header className="admin-title"><h2>کنترل وصول</h2><p>واریز بانکی تا تأیید مالی، وصول‌شده محسوب نمی‌شود.</p></header><div className="data-table"><div className="table-head"><span>سفارش</span><span>واریزکننده</span><span>مبلغ</span><span>اقدام</span></div>{transfers.map((row) => <div className="table-row" key={row.id}><span><b dir="ltr">{row.orderReference}</b><small>{row.bankName} · {row.reference}</small></span><span>{row.depositorName}</span><span>{money(row.amountIrr)}</span><span className="row-actions">{row.state === 'REVIEW_PENDING' ? <><button onClick={() => reviewTransfer(row.id, 'confirm')}>تأیید</button><button onClick={() => reviewTransfer(row.id, 'reject')}>رد</button></> : stateLabels[row.state] ?? row.state}</span></div>)}</div></div>}
    {tab === 'content' && <div><header className="admin-title"><h2>محتوا و انتشار</h2><p>محتوای placeholder از API عمومی منتشر نمی‌شود.</p></header><form className="admin-editor static" action={saveContent}><div className="field-grid"><label>شناسه مسیر<input name="slug" required placeholder="home-hero"/></label><label>عنوان<input name="title" required/></label></div><label>متن<textarea name="body" rows={7} required/></label><div className="field-grid"><label>وضعیت<select name="state"><option value="DRAFT">پیش‌نویس</option><option value="PUBLISHED">منتشرشده</option></select></label><label className="check-field"><input name="isPlaceholder" type="checkbox" defaultChecked/><span>محتوای نمونه و غیرقابل انتشار</span></label></div><button className="button">ذخیره نسخه جدید</button></form><div className="content-list">{content.map((row) => <div key={row.slug}><b>{row.title}</b><span dir="ltr">{row.slug}</span><i>{row.isPlaceholder ? 'نمونه' : row.state === 'PUBLISHED' ? 'منتشرشده' : 'پیش‌نویس'} · نسخه {new Intl.NumberFormat('fa-IR').format(row.version)}</i></div>)}</div></div>}
    {tab === 'access' && <div><header className="admin-title"><h2>دسترسی و تنظیمات</h2><p>عملیات حساس فقط با MFA اخیر ممکن است؛ رازهای سرویس هرگز در پنل خوانده یا ذخیره نمی‌شوند.</p></header>{session.authLevel < 2 ? <MfaPanel onVerified={load}/> : <div className="staff-list">{staff.map((person) => <form key={person.id} action={(data) => updateStaff(person.id, data)}><span><b>{person.firstName} {person.lastName}</b><small dir="ltr">{person.mobile}</small></span><select name="role" defaultValue={person.role}>{Object.entries(roleLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select><label className="check-field"><input name="active" type="checkbox" defaultChecked={person.active}/><span>فعال</span></label><button className="secondary-button">ذخیره</button></form>)}</div>}</div>}
  </section></div>;
}

function MfaPanel({ onVerified }: { onVerified: () => Promise<void> }) {
  const [setup, setSetup] = useState<{ otpauthUri: string; recoveryCodes: string[] } | null>(null); const [error, setError] = useState('');
  async function enroll() { try { setSetup(await api('/api/v1/admin/mfa/enroll', { method: 'POST', body: '{}' })); } catch (cause) { setError(cause instanceof Error ? cause.message : 'راه‌اندازی ناموفق بود.'); } }
  async function verify(formData: FormData) { try { await api('/api/v1/admin/mfa/verify', { method: 'POST', body: JSON.stringify({ code: formData.get('code') }) }); await onVerified(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'تأیید ناموفق بود.'); } }
  return <div className="mfa-panel"><Icon name="lock"/><h3>تأیید دومرحله‌ای لازم است</h3><p>برای تنظیمات و دسترسی کارکنان، نشست باید سطح MFA داشته باشد.</p>{!setup ? <button className="button" onClick={enroll}>راه‌اندازی عامل</button> : <><code dir="ltr">{setup.otpauthUri}</code><p>کدهای بازیابی را در محل امن نگهداری کنید؛ دوباره نمایش داده نمی‌شوند.</p><ul>{setup.recoveryCodes.map((code) => <li dir="ltr" key={code}>{code}</li>)}</ul><form action={verify}><label>کد برنامه تأییدکننده<input name="code" dir="ltr" inputMode="numeric" pattern="[0-9]{6}" required/></label><button className="button">تأیید MFA</button></form></>}{error && <p className="form-error">{error}</p>}</div>;
}
