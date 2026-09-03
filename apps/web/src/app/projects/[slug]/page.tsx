import Link from 'next/link';
import { StationPath } from '@/components/sections/StationPath';

const chapters = [
  ['مسئله', 'این مسیر برای بیان دقیق مسئله سازمان، بدون افشای داده محرمانه، طراحی شده است.'],
  ['اقدام', 'مجموعه‌ای از تحلیل، طراحی قواعد، فرایند، مدل داده و راهبری اجرا.'],
  ['نتیجه', 'نتیجه واقعی تنها پس از تأیید کارفرما و مدیریت منتشر می‌شود.']
] as const;

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <section className="section">
      <article className="shell card case-study">
        <div className="case-study-head">
          <div>
            <span className="placeholder">نمونه ساختگی — قابل انتشار نیست</span>
            <h1>ساختار مطالعه موردی</h1>
            <p className="muted">شناسه نمونه: <bdi>{slug}</bdi></p>
          </div>
          <div className="case-study-path" aria-hidden="false">
            <StationPath ariaLabel="فصل‌های روایت: مسئله، اقدام، نتیجه" stations={[{ title: 'مسئله' }, { title: 'اقدام' }, { title: 'نتیجه' }]} />
          </div>
        </div>
        <ol className="case-chapters">
          {chapters.map(([title, text], index) => (
            <li key={title}>
              <span className="case-chapter-no">{(index + 1).toLocaleString('fa-IR')}</span>
              <div>
                <h2>{title}</h2>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="case-study-actions">
          <Link className="button button-primary" href="/request">طرح مسئله مشابه <span aria-hidden="true">↙</span></Link>
          <Link className="text-link" href="/projects">بازگشت به پروژه‌ها ←</Link>
        </div>
      </article>
    </section>
  );
}
