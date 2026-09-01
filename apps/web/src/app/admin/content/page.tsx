import { ContentManager } from '@/components/ContentManager';
export const metadata = { title: 'مدیریت محتوا', robots: { index: false, follow: false } };
export default function ContentPage() { return <section className="section"><div className="shell"><span className="eyebrow">مدیریت داخلی</span><h1>محتوا و نسخه‌ها</h1><p className="muted">انتشار محتوای حساس باید با مجوز داخلی انجام شود. placeholderها در production از preflight عبور نمی‌کنند.</p><ContentManager/></div></section>; }
