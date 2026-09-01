'use client';

import { useEffect, useState, type FormEvent } from 'react';

type InternalRequest = { id: string; reference: string; title: string; state: string; version: number; submittedAt: string; organization: string; mobile: string };
const states = [['SUBMITTED', 'ثبت‌شده'], ['UNDER_REVIEW', 'در حال بررسی'], ['CONTACT_PENDING', 'تماس در انتظار'], ['NEED_MORE_INFO', 'نیازمند اطلاعات'], ['QUALIFIED', 'واجد شرایط'], ['REJECTED', 'ردشده'], ['OFFER_SENT', 'پیشنهاد ارسال شد'], ['PAID', 'پرداخت‌شده'], ['SESSION_SCHEDULED', 'جلسه زمان‌بندی شد'], ['SESSION_COMPLETED', 'جلسه انجام شد'], ['PROJECT_PROPOSED', 'پروژه پیشنهاد شد'], ['ARCHIVED', 'بایگانی']] as const;
const nextStates: Record<string, string[]> = { SUBMITTED: ['UNDER_REVIEW'], UNDER_REVIEW: ['CONTACT_PENDING', 'NEED_MORE_INFO', 'REJECTED'], CONTACT_PENDING: ['QUALIFIED', 'REJECTED', 'NEED_MORE_INFO'], NEED_MORE_INFO: ['UNDER_REVIEW', 'REJECTED'], QUALIFIED: ['OFFER_SENT'], OFFER_SENT: ['PAID', 'ARCHIVED'], PAID: ['SESSION_SCHEDULED'], SESSION_SCHEDULED: ['SESSION_COMPLETED', 'ARCHIVED'], SESSION_COMPLETED: ['PROJECT_PROPOSED', 'ARCHIVED'], PROJECT_PROPOSED: ['ARCHIVED'], REJECTED: ['ARCHIVED'], ARCHIVED: [] };

export function RequestDesk() {
  const [items, setItems] = useState<InternalRequest[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [from, setFrom] = useState('');
  const [until, setUntil] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  async function reload(search = query) {
    setError('');
    const params = new URLSearchParams(); if (search) params.set('q', search); if (stateFilter) params.set('state', stateFilter); if (from) params.set('from', `${from}T00:00:00.000Z`); if (until) params.set('until', `${until}T23:59:59.999Z`); if (assigneeId) params.set('assigneeId', assigneeId);
    const response = await fetch(`/api/v1/admin/requests?${params.toString()}`);
    if (!response.ok) return setError((await response.json()).error ?? 'دریافت درخواست‌ها ممکن نیست.');
    setItems(await response.json());
  }

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/v1/admin/requests', { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error((await response.json()).error);
      setItems(await response.json());
    }).catch((reason: unknown) => {
      if (reason instanceof DOMException && reason.name === 'AbortError') return;
      setError(reason instanceof Error ? reason.message : 'دسترسی ممکن نیست.');
    });
    return () => controller.abort();
  }, []);

  async function filter(event: FormEvent<HTMLFormElement>) { event.preventDefault(); await reload(query); }
  async function transition(id: string, state: string, expectedVersion: number) {
    setNotice(''); setError('');
    const response = await fetch(`/api/v1/admin/requests/${id}/transition`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ state, expectedVersion, note: 'تغییر وضعیت از پنل داخلی' }) });
    if (!response.ok) return setError((await response.json()).error ?? 'تغییر وضعیت ناموفق بود.');
    setNotice('وضعیت داخلی ثبت شد.'); await reload();
  }

  function actions(item: InternalRequest) {
    const available = nextStates[item.state] ?? [];
    if (!available.length) return <span className="muted">اقدامی ندارد</span>;
    return <select aria-label={`تغییر وضعیت ${item.reference}`} defaultValue="" onChange={(event) => { if (event.target.value) transition(item.id, event.target.value, item.version); }}><option value="" disabled>انتخاب اقدام</option>{available.map((key) => <option value={key} key={key}>{states.find(([value]) => value === key)?.[1] ?? key}</option>)}</select>;
  }

  return <section className="card"><form className="admin-toolbar" onSubmit={filter}><label className="field">جست‌وجوی داخلی<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="شماره، عنوان، سازمان یا همراه" /></label><label className="field">وضعیت<select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}><option value="">همه</option>{states.map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label><label className="field">از تاریخ<input value={from} onChange={(event) => setFrom(event.target.value)} type="date" /></label><label className="field">تا تاریخ<input value={until} onChange={(event) => setUntil(event.target.value)} type="date" /></label><label className="field">شناسه کارشناس<input value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} placeholder="UUID داخلی" /></label><button className="button button-secondary" type="submit">جست‌وجو</button><a className="button button-secondary" href="/api/v1/admin/requests.csv">CSV</a></form>{error ? <p className="error" role="alert">{error}</p> : null}{notice ? <p className="success" role="status">{notice}</p> : null}<div className="table-wrap"><table><thead><tr><th>پیگیری</th><th>سازمان / همراه</th><th>عنوان</th><th>وضعیت داخلی</th><th>اقدام مجاز بعدی</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><bdi>{item.reference}</bdi></td><td>{item.organization}<br/><span className="muted"><bdi>{item.mobile}</bdi></span></td><td>{item.title}</td><td>{states.find(([key]) => key === item.state)?.[1] ?? item.state}</td><td>{actions(item)}</td></tr>)}{!items.length ? <tr><td colSpan={5} className="muted">درخواستی با این معیار یافت نشد.</td></tr> : null}</tbody></table></div></section>;
}
