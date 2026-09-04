'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ApiError, persianDate } from '@/lib/api';
import { Icon } from './Icon';

type Account = { profile?: { firstName?: string; lastName?: string; email?: string; mobile: string; jobTitle?: string }; organization?: { displayName: string; type: string }; requests: { reference: string; title: string; submittedAt: string }[] };

export function AccountView() {
  const [state, setState] = useState<{ kind: 'loading' | 'ready' | 'error' | 'unauthorized'; data?: Account; message?: string }>({ kind: 'loading' });
  const router = useRouter();
  useEffect(() => { api<Account>('/api/v1/account').then((data) => setState({ kind: 'ready', data })).catch((error) => setState({ kind: error instanceof ApiError && error.status === 401 ? 'unauthorized' : 'error', message: error.message })); }, []);
  async function logout() { await api('/api/v1/auth/logout', { method: 'POST', body: '{}' }); router.push('/'); router.refresh(); }
  if (state.kind === 'loading') return <div className="loading-state" role="status"><span/>در حال دریافت حساب…</div>;
  if (state.kind === 'unauthorized') return <div className="result-state"><Icon name="lock"/><h2>نشست فعالی وجود ندارد</h2><Link className="button" href="/login?next=/account">ورود به حساب</Link></div>;
  if (state.kind === 'error' || !state.data) return <div className="result-state error"><Icon name="warning"/><h2>حساب دریافت نشد</h2><p>{state.message}</p><button className="button" onClick={() => location.reload()}>تلاش دوباره</button></div>;
  const { profile, organization, requests } = state.data;
  return <div className="account-grid"><section className="account-profile"><div className="profile-head"><span><Icon name="person"/></span><div><h2>{profile?.firstName} {profile?.lastName}</h2><p>{profile?.jobTitle} در {organization?.displayName}</p></div></div><dl><div><dt>شماره همراه</dt><dd dir="ltr">{profile?.mobile}</dd></div><div><dt>ایمیل</dt><dd>{profile?.email}</dd></div><div><dt>نوع سازمان</dt><dd>{{ PRIVATE: 'خصوصی', PUBLIC: 'عمومی', GOVERNMENT: 'دولتی' }[organization?.type ?? ''] ?? '—'}</dd></div></dl><button className="secondary-button danger-text" onClick={logout}>خروج امن</button></section><section className="account-requests"><div className="list-head"><div><h2>درخواست‌های شما</h2><p>فقط شماره، عنوان و تاریخ نمایش داده می‌شود؛ وضعیت و یادداشت داخلی محرمانه است.</p></div><Link className="button" href="/request">درخواست جدید</Link></div>{requests.length ? <ul>{requests.map((request) => <li key={request.reference}><span><Icon name="document"/></span><div><strong>{request.title}</strong><small>{persianDate(request.submittedAt)}</small></div><b dir="ltr">{request.reference}</b></li>)}</ul> : <div className="empty-state"><Icon name="document"/><h3>هنوز درخواستی ثبت نشده است</h3><p>مسئله را بدون انتخاب خدمت تخصصی تعریف کنید.</p><Link className="button" href="/request">ثبت نخستین درخواست</Link></div>}</section></div>;
}
