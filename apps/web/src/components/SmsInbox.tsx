'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/http';

type Message = { body: string; mobile: string; expiresAt: string };
export function SmsInbox() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    async function refresh() {
      try { const data = await api<{ messages: Message[] }>('/api/v1/dev/sms-inbox'); if (active) { setMessages(data.messages); setError(''); } }
      catch { if (active) setError('صندوق آزمایشی در دسترس نیست.'); }
    }
    const onSms = () => { setOpen(true); void refresh(); };
    const clear = () => { setMessages([]); setOpen(false); };
    window.addEventListener('novin:sms', onSms);
    window.addEventListener('novin:sms-clear', clear);
    if (open) void refresh();
    const timer = open ? window.setInterval(refresh, 5000) : undefined;
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('novin:sms', onSms); window.removeEventListener('novin:sms-clear', clear); };
  }, [open]);
  return <aside className={`sms-inbox ${open ? 'is-open' : ''}`} aria-label="صندوق پیامک آزمایشی">
    <button className="sms-toggle" aria-expanded={open} aria-controls="sms-messages" onClick={() => setOpen(!open)}>{open ? 'بستن صندوق آزمایشی' : 'پیامک آزمایشی'}</button>
    {open && <div id="sms-messages"><p className="hint">محیط آزمایشی · فقط پیام همین مرورگر</p><div aria-live="polite">{error ? <p className="error">{error}</p> : messages.length ? messages.map((message) => <div key={message.expiresAt}><bdi>{message.mobile}</bdi><p>{message.body}</p></div>) : <p>پیام فعالی ندارید. رمزهای منقضی نمایش داده نمی‌شوند.</p>}</div></div>}
  </aside>;
}
