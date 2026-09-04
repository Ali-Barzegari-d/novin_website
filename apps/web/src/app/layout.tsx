import '@fontsource-variable/vazirmatn';
import '@fontsource-variable/noto-sans-arabic';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { ScrollProgress } from '@/components/Motion';
import { companyName } from '@/lib/content';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3050'),
  title: { default: `${companyName} | تبدیل پیچیدگی به راهکار قابل اجرا`, template: `%s | نوین ایرانیان` },
  description: 'طراحی و تحلیل یکپارچه مالی، فرایند، داده و سامانه برای سازمان‌های خصوصی، عمومی و دولتی.',
  robots: process.env.NEXT_PUBLIC_RELEASE_READY === 'true' ? { index: true, follow: true } : { index: false, follow: false },
  alternates: { canonical: '/' }
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ffffff', colorScheme: 'light' };

const designContract = `<!--
THESIS: پیچیدگی سازمان را به یک مسیر اجرایی قابل‌ردیابی تبدیل می‌کنیم؛ صفحه از هیروی مبهم و ادعاهای بی‌مدرک دور می‌ماند.
OWN-WORLD: آبی قابل اعتماد، جوهر سرمه‌ای، فیروزه‌ای زنده، کرمی آرام، طلایی محدود و عنابی بسیار کم؛ خطوط فنی یک‌پیکسلی و سطوح دقیق.
STORY: مخاطب مسئله را می‌شناسد، اتصال مالی/فرایند/داده/سامانه را می‌بیند، حدود همکاری را می‌فهمد و شرح مسئله را آغاز می‌کند.
FIRST VIEWPORT: ناوبری باریک، تیتر مرکزی مقتدر، CTA روشن، چهار مرحله اعتماد و نوار سه‌گانه اصول شروع.
FORM: مسیر «اطمینان هدایت‌شده» که مالک در ۱۴۰۵/۰۶/۱۳ انتخاب کرد؛ بدون بازسازی مسیر بصری کنارگذاشته‌شده.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <template data-design-contract dangerouslySetInnerHTML={{ __html: designContract }} />
        <a className="skip-link" href="#main-content">پرش به محتوای اصلی</a>
        <ScrollProgress />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
