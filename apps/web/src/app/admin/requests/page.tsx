import { RequestDesk } from '@/components/RequestDesk';

export const metadata = { title: 'مدیریت درخواست‌ها', robots: { index: false, follow: false } };

export default function AdminRequestsPage() {
  return <section className="section"><div className="shell"><span className="eyebrow">مدیریت داخلی</span><h1>صندوق بررسی درخواست‌ها</h1><p className="muted">این داده‌ها فقط برای نقش‌های مجاز داخلی است و وضعیت یا یادداشت داخلی به مشتری نشان داده نمی‌شود.</p><RequestDesk/></div></section>;
}
