'use client';
import { useState } from 'react';

export function SmsInbox() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return <aside className="sms-inbox" aria-label="صندوق پیامک آزمایشی"><button type="button" aria-label="بستن صندوق پیامک آزمایشی" onClick={() => setOpen(false)}>×</button><span className="placeholder">محیط آزمایشی</span><strong style={{ display: 'block', marginTop: 8 }}>صندوق پیامک نمایشی</strong><p style={{ margin: '4px 0 0' }}>پیام‌های OTP، ثبت درخواست و پیشنهاد در توسعه اینجا نمایش داده می‌شوند.</p></aside>;
}
