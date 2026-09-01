import Link from 'next/link';
import { ProcessArt } from '@/components/ProcessArt';

const problems = ['پراکندگی و ابهام در نیازهای ذی‌نفعان', 'رویدادهای مالی دستی، تکراری یا دیرهنگام', 'فاصله میان عملیات، حسابداری و سامانه‌های قانونی', 'نیاز به مدل، فرایند و محصول قابل پذیرش'];

export default function HomePage() {
  return <>
    <section className="hero">
      <div className="shell hero-grid">
        <div>
          <h1>پیچیدگی‌های مالی و کسب‌وکاری را به فرایند، سامانه و محصول قابل‌اجرا تبدیل می‌کنیم.</h1>
          <p className="hero-copy">از صورت‌بندی مسئله و طراحی مدل مالی تا اتوماسیون، توسعه نرم‌افزار، راهبری اجرا و پذیرش نهایی.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/request">ثبت مسئله و درخواست بررسی</Link>
            <Link className="button button-secondary" href="/projects">مشاهده پروژه‌ها</Link>
          </div>
        </div>
        <div className="hero-art"><ProcessArt/></div>
      </div>
    </section>

    <section className="trust">
      <div className="shell trust-inner">
        <strong>همکاری بر پایه مسئله، نه فهرست پکیج‌ها</strong>
        <span className="placeholder">نشان مشتریان پس از تأیید انتشار درج می‌شود</span>
        <span className="placeholder">آمار واقعی و قابل اثبات</span>
      </div>
    </section>

    <section className="section">
      <div className="shell">
        <div className="section-heading"><h2>همکاری متناسب با زمینه سازمان</h2></div>
        <div className="grid-2">
          <article className="card path-card path-card-public"><h3>برای نهادهای دولتی و عمومی</h3><p className="muted">از تبدیل سیاست و قانون به قواعد کسب‌وکار تا طراحی گردش‌کار، معیار پذیرش و راهبری مستقل اجرا.</p><Link href="/solutions/public">مشاهده مسیر دولتی و عمومی</Link></article>
          <article className="card path-card path-card-private"><h3>برای شرکت‌ها و کسب‌وکارهای خصوصی</h3><p className="muted">از انطباق مدل مالی با عملیات تا یکپارچه‌سازی، کنترل داخلی و محصول اختصاصی.</p><Link href="/solutions/private">مشاهده مسیر شرکت‌های خصوصی</Link></article>
        </div>
      </div>
    </section>

    <section className="section section-surface">
      <div className="shell">
        <div className="section-heading"><h2>به‌جای انتخاب خدمت، مسئله را روشن می‌کنیم.</h2></div>
        <div className="grid-2 problem-grid">
          {problems.map((problem, index) => <article className="card problem-card" key={problem}><span className="problem-index">{(index + 1).toLocaleString('fa-IR')}</span><h3>{problem}</h3><p className="muted">مسئله را صورت‌بندی می‌کنیم، گزینه‌های اجرایی را می‌سنجیم و مسیر قابل پیگیری پیشنهاد می‌دهیم.</p></article>)}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="shell grid-2">
        <div>
          <h2>وقتی منطق مالی باید در عملیات روزمره جریان پیدا کند.</h2>
          <p className="muted">قواعد مالی و مقرراتی را به مدل داده، گردش‌کار، اتصال سامانه‌ها و معیارهای پذیرش تبدیل می‌کنیم؛ نه صرفاً یک گزارش یا یک نرم‌افزار جدا.</p>
          <Link className="button button-secondary" href="/capabilities">شناخت توانمندی‌ها</Link>
        </div>
        <div className="card automation-art"><ProcessArt/></div>
      </div>
    </section>

    <section className="section section-tint">
      <div className="shell">
        <div className="section-heading"><h2>از مسئله تا پذیرش نهایی</h2></div>
        <div className="timeline">{[['ثبت مسئله', 'شرح نیاز سازمان را ثبت می‌کنید.'], ['بررسی رایگان', 'تماس و امکان‌سنجی اولیه انجام می‌شود.'], ['پیشنهاد اختصاصی', 'در صورت تناسب، جلسه کارشناسی با شرایط روشن ارائه می‌شود.'], ['جلسه و جمع‌بندی', 'خروجی مکتوب مقدماتی تحویل می‌شود.'], ['پروژه مستقل', 'در صورت توافق، پیشنهاد و قرارداد جداگانه شکل می‌گیرد.']].map(([title, copy]) => <div key={title}><h3>{title}</h3><p className="muted">{copy}</p></div>)}</div>
      </div>
    </section>

    <section className="section">
      <div className="shell">
        <div className="section-heading"><h2>شواهد همکاری، تنها با مجوز انتشار</h2></div>
        <div className="grid-2">
          <article className="card"><span className="placeholder">نمونه ساختگی — قابل انتشار نیست</span><h3>مطالعه موردی پس از تصویب داخلی</h3><p className="muted">هر مطالعه شامل مسئله، اقدام و نتیجه خواهد بود؛ نام و نشان کارفرما بدون تأیید منتشر نمی‌شود.</p></article>
          <article className="card"><span className="placeholder">پروفایل‌های تیم در انتظار تأیید</span><h3>تخصص‌هایی برای ترکیب مسئله و اجرا</h3><p className="muted">معرفی اعضای تیم، سوابق و تصویر فقط با اطلاعات واقعی و مجوز انتشار تکمیل می‌شود.</p></article>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="shell card final-cta">
        <h2>مسئله سازمان خود را برای بررسی اولیه ثبت کنید.</h2>
        <p className="muted">ثبت مسئله و تماس اولیه رایگان است. مبلغ جلسه کارشناسی فقط پس از بررسی و در پیشنهاد اختصاصی نمایش داده می‌شود.</p>
        <Link className="button button-primary" href="/request">ثبت مسئله و درخواست بررسی</Link>
      </div>
    </section>
  </>;
}
