'use client';

import { Icon } from '@/components/Icon';
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main id="main-content" className="state-page shell"><Icon name="warning"/><h1>صفحه کامل نشد.</h1><p>ارتباط یا پردازش با خطا روبه‌رو شد. دوباره تلاش کنید؛ اگر خطا تکرار شد، کد پیگیری نمایش‌داده‌شده را اعلام کنید.</p><button className="button" onClick={reset}>تلاش دوباره</button></main>; }
