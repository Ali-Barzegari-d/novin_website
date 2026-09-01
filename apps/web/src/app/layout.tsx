import type { Metadata } from 'next';
import './globals.css';
import { SiteChrome } from '@/components/SiteChrome';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3050'),
  title: { default: 'نوین ایرانیان | طراحی و تحلیل مالی', template: '%s | نوین ایرانیان' },
  description: 'طراحی و راهبری تحول خدمات، فرایندها و محصولات مالی سازمان‌ها.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" dir="rtl"><body><SiteChrome>{children}</SiteChrome></body></html>;
}
