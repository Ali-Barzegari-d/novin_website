import type { Metadata } from 'next';
import './globals.css';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SmsInbox } from '@/components/SmsInbox';
import { Toaster } from '@/components/ui/Toaster';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3050'),
  title: { default: 'نوین ایرانیان | طراحی و تحلیل مالی', template: '%s | نوین ایرانیان' },
  description: 'طراحی و راهبری تحول خدمات، فرایندها و محصولات مالی سازمان‌ها.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const demoInboxEnabled = process.env.NEXT_PUBLIC_DEV_SMS_INBOX_ENABLED === 'true';

  return (
    <html lang="fa" dir="rtl" data-scroll-behavior="smooth">
      <body className={demoInboxEnabled ? 'has-dev-inbox' : undefined}>
        <a className="skip-link" href="#main">
          پرش به محتوای اصلی
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Toaster />
        {demoInboxEnabled ? <SmsInbox /> : null}
      </body>
    </html>
  );
}
