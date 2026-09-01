'use client';

import { useEffect, useState, type FormEvent } from 'react';

type Settings = { uploadPolicy: { maxBytes: number; allowedTypes: string[] }; providers: { sms: string; email: string; payment: string; captcha: string }; secretManagement: string };

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>(); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  useEffect(() => { const controller = new AbortController(); void fetch('/api/v1/admin/settings', { signal: controller.signal }).then(async (response) => { if (!response.ok) throw new Error((await response.json()).error); setSettings(await response.json()); }).catch((reason: unknown) => { if (reason instanceof DOMException && reason.name === 'AbortError') return; setError(reason instanceof Error ? reason.message : 'دسترسی ممکن نیست.'); }); return () => controller.abort(); }, []);
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const allowedTypes = String(form.get('allowedTypes')).split(',').map((value) => value.trim()).filter(Boolean); const response = await fetch('/api/v1/admin/settings/upload-policy', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ maxBytes: Number(form.get('maxBytes')), allowedTypes }) }); if (!response.ok) return setError((await response.json()).error ?? 'ذخیره ناموفق بود.'); setNotice('سیاست بارگذاری با ثبت ممیزی به‌روزرسانی شد.'); }
  if (error && !settings) return <div className="card"><p className="error">{error}</p></div>;
  if (!settings) return <div className="card">در حال دریافت تنظیمات امن…</div>;
  return <div className="grid-2"><form className="card form" onSubmit={save}><h2>سیاست فایل</h2><label className="field">حداکثر حجم (بایت)<input name="maxBytes" type="number" min={1024} max={50 * 1024 * 1024} defaultValue={settings.uploadPolicy.maxBytes} required /></label><label className="field">MIMEهای مجاز (با ویرگول)<textarea name="allowedTypes" defaultValue={settings.uploadPolicy.allowedTypes.join(',')} required /></label><p className="hint">تغییر بر بارگذاری‌های آینده اعمال می‌شود و در لاگ ممیزی ثبت خواهد شد.</p>{error ? <p className="error" role="alert">{error}</p> : null}{notice ? <p className="success" role="status">{notice}</p> : null}<button className="button button-primary" type="submit">ذخیره سیاست</button></form><section className="card"><h2>وضعیت اتصال سرویس‌ها</h2><ul><li>پیامک: <bdi>{settings.providers.sms}</bdi></li><li>ایمیل: <bdi>{settings.providers.email}</bdi></li><li>پرداخت: <bdi>{settings.providers.payment}</bdi></li><li>ضدربات: <bdi>{settings.providers.captcha}</bdi></li></ul><p className="notice">{settings.secretManagement}</p></section></div>;
}
