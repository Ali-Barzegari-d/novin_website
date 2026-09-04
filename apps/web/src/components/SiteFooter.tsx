import Link from 'next/link';
import { companyName } from '@/lib/content';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main shell">
        <div className="footer-statement"><strong>{companyName}</strong><p>مسئله‌های مالی و کسب‌وکاری را به مسیرهای قابل اجرا تبدیل می‌کنیم.</p><span className="placeholder-chip">اطلاعات ثبتی و تماس در انتظار تأیید مالک</span></div>
        <div><strong>شناخت</strong><Link href="/about">درباره ما</Link><Link href="/capabilities">توانمندی‌ها</Link><Link href="/projects">پروژه‌ها</Link></div>
        <div><strong>همکاری</strong><Link href="/process">فرایند همکاری</Link><Link href="/initial-assessment">ارزیابی اولیه</Link><Link href="/request">ثبت درخواست</Link></div>
        <div><strong>حقوق و ارتباط</strong><Link href="/contact">تماس</Link><Link href="/complaints">شکایت</Link><Link href="/privacy">حریم خصوصی</Link><Link href="/terms">شرایط استفاده</Link></div>
      </div>
      <div className="footer-meta shell"><span>© {new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date())} نوین ایرانیان</span><span>نسخه توسعه و ارزیابی — آماده انتشار عمومی نیست</span></div>
    </footer>
  );
}
