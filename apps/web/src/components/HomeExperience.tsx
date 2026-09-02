import Link from 'next/link';

const problems = [
  ['اطلاعات هست؛ تصویر واحدی از مسئله نیست.', 'وقتی نیازهای ذی‌نفعان پراکنده یا متعارض‌اند، ابتدا مسئله مشترک، مرز تصمیم‌ها و معیار موفقیت را روشن می‌کنیم.', 'صورت‌بندی مسئله و نیازمندی‌ها'],
  ['کارها انجام می‌شوند؛ اما دستی و چندباره.', 'ثبت‌های تکراری، کنترل‌های ناهماهنگ و تأخیر در گزارش‌گیری را در بستر واقعی عملیات بررسی می‌کنیم؛ سپس جریان کار قابل اجرا طراحی می‌شود.', 'طراحی فرایند و کنترل داخلی'],
  ['سامانه‌ها به هم متصل نیستند.', 'فاصله میان محصول کسب‌وکار، حسابداری و سامانه‌های قانونی را با مدل داده، قواعد روشن و اتصال‌های قابل آزمون کاهش می‌دهیم.', 'اتوماسیون و یکپارچه‌سازی'],
  ['خروجی ساخته شده؛ پذیرش آن روشن نیست.', 'نیاز کارفرما را به معیارهای قابل ارزیابی تبدیل می‌کنیم تا راهبری اجرا و پذیرش خروجی بر مبنای توافق مشخص انجام شود.', 'راهبری اجرا و پذیرش']
];
const steps = [
  ['ثبت مسئله', 'از نیاز واقعی سازمان می‌گویید؛ بدون انتخاب یک پکیج.', 'رایگان'],
  ['بررسی و تماس', 'زمینه مسئله و امکان همکاری را در گفت‌وگو می‌سنجیم.', 'رایگان'],
  ['پیشنهاد جلسه', 'در صورت تناسب، دامنه، خروجی و مبلغ اختصاصی اعلام می‌شود.', 'پیش از پرداخت'],
  ['جلسه و جمع‌بندی', 'پس از وصول، جلسه هماهنگ و گزارش مقدماتی ارائه می‌شود.', 'خروجی مکتوب'],
  ['پروژه مستقل', 'ادامه کار در صورت توافق، با پیشنهاد و قرارداد جداگانه است.', 'توافق جدید']
];

export function HomeExperience() {
  return <>
    <section className="editorial-hero">
      <div className="shell">
        <div className="hero-masthead"><span>طراحی و تحلیل مالی نوین ایرانیان</span><span>از شناخت مسئله تا پذیرش نتیجه</span></div>
        <div className="hero-composition">
          <div className="hero-statement">
            <p className="eyebrow">برای مسائل واقعی سازمان‌ها</p>
            <h1>پیچیدگی‌های مالی و کسب‌وکاری را به <em>فرایند، سامانه و محصول</em> قابل‌اجرا تبدیل می‌کنیم.</h1>
            <p className="hero-copy">از صورت‌بندی مسئله و طراحی مدل مالی تا اتوماسیون، توسعه نرم‌افزار، راهبری اجرا و پذیرش نهایی.</p>
            <div className="hero-actions"><Link className="button button-primary" href="/request">ثبت مسئله و درخواست بررسی <span aria-hidden="true">↙</span></Link><Link className="text-link" href="/projects">مشاهده پروژه‌ها <span aria-hidden="true">←</span></Link></div>
            <p className="hero-footnote">ثبت مسئله و تماس اولیه رایگان است؛ بدون تعهد به خرید.</p>
          </div>
          <aside className="hero-brief" aria-label="روش شروع همکاری">
            <p className="hero-brief-label">خط روشن همکاری</p>
            <p className="hero-brief-copy">به‌جای نمایش یک نمودار تزئینی، از همان ابتدا روی سه تصمیم مهم توافق می‌کنیم.</p>
            <ol>
              <li><span>۰۱</span><strong>مسئله چیست؟</strong><small>مرز، ذی‌نفع و نتیجهٔ مورد انتظار</small></li>
              <li><span>۰۲</span><strong>چه چیزی قابل اجراست؟</strong><small>مدل، فرایند و اتصال متناسب با سازمان</small></li>
              <li><span>۰۳</span><strong>پذیرش چگونه سنجیده می‌شود؟</strong><small>معیارهای روشن برای راهبری و تحویل</small></li>
            </ol>
          </aside>
        </div>
        <ul className="hero-principles" aria-label="اصول شروع همکاری"><li>شروع از مسئله</li><li>پیشنهاد متناسب</li><li>معیار پذیرش روشن</li></ul>
      </div>
    </section>
    <section className="evidence-strip"><div className="shell"><strong>اعتبار، با شواهد واقعی.</strong><p>نشان مشتریان و سوابق پروژه‌ها پس از تأیید مجوز انتشار در این بخش قرار می‌گیرند.</p><Link href="/projects" className="text-link">پروژه‌ها و شواهد ←</Link></div></section>
    <section className="section audience-editorial"><div className="shell section-spread"><div className="section-aside"><p className="eyebrow">۰۱ / زمینه همکاری</p><h2>یک رویکرد.<br/>دو بستر متفاوت.</h2><p className="muted">مسئله در خلأ اتفاق نمی‌افتد. نوع سازمان، ذی‌نفعان و الزامات آن، مسیر همکاری را شکل می‌دهند.</p></div><div className="audience-paths"><article className="audience-path"><span className="path-identifier" aria-hidden="true">الف</span><div><h3>نهادهای دولتی و عمومی</h3><p>از تبدیل سیاست و قانون به قواعد کسب‌وکار تا طراحی نیازمندی، راهبری پیمانکار و پذیرش مستقل خروجی.</p><Link href="/solutions/public" className="text-link">شناخت مسیر دولتی و عمومی ←</Link></div></article><article className="audience-path"><span className="path-identifier" aria-hidden="true">ب</span><div><h3>شرکت‌ها و کسب‌وکارهای خصوصی</h3><p>از هماهنگی مدل مالی با عملیات تا کنترل داخلی، اتصال سامانه‌ها و توسعه محصول اختصاصی.</p><Link href="/solutions/private" className="text-link">شناخت مسیر شرکت‌های خصوصی ←</Link></div></article></div></div></section>
    <section className="section problem-editorial"><div className="shell section-spread"><div className="section-aside"><p className="eyebrow">۰۲ / نقطه آغاز</p><h2>کدام فاصله را<br/>در سازمان می‌بینید؟</h2><p className="muted">با مسئله شروع می‌کنیم، نه با پیشنهاد یک راه‌حل از پیش تعیین‌شده.</p></div><div className="problem-index-list">{problems.map(([title, text, output], index) => <details key={title} className="problem-entry" open={index === 0}><summary><span className="entry-number">{(index + 1).toLocaleString('fa-IR').padStart(2, '۰')}</span><h3>{title}</h3><span className="entry-toggle" aria-hidden="true">+</span></summary><div className="problem-answer"><p>{text}</p><p className="problem-output"><span>مسیر بررسی</span>{output}</p></div></details>)}</div></div></section>
    <section className="section integration-editorial"><div className="shell integration-layout"><div><p className="eyebrow">۰۳ / از طراحی تا اجرا</p><h2>منطق مالی،<br/>در جریان عملیات.</h2><p>گزارش، فرایند و نرم‌افزار نباید جزیره‌های جدا باشند. قواعد مالی و مقرراتی را به مدل داده، گردش‌کار و اتصال‌های قابل آزمون تبدیل می‌کنیم.</p><Link href="/capabilities" className="text-link">شناخت توانمندی‌های اجرایی ←</Link></div><div className="system-spec" aria-label="اجزای یکپارچه‌سازی فرایند مالی"><div className="spec-title">یک جریان منسجم، از رویداد تا پذیرش<span aria-hidden="true">↙</span></div><ol><li><span>ورودی</span><strong>رویداد واقعی کسب‌وکار</strong><small>فروش، دریافت، پرداخت و عملیات</small></li><li><span>منطق</span><strong>قواعد مالی و کنترل‌ها</strong><small>مدل داده، گردش‌کار و نقاط بررسی</small></li><li><span>اتصال</span><strong>سامانه‌ها و ثبت‌ها</strong><small>حسابداری، محصول و سامانه‌های قانونی</small></li><li><span>خروجی</span><strong>نتیجه قابل ارزیابی</strong><small>ثبت قابل پیگیری و معیار پذیرش روشن</small></li></ol><p>طرح مفهومی · مسیر هر سازمان پس از بررسی تعیین می‌شود.</p></div></div></section>
    <section className="section journey-editorial"><div className="shell"><div className="section-heading-row"><div><p className="eyebrow">۰۴ / روش همکاری</p><h2>قدم بعدی، همیشه روشن.</h2></div><Link href="/process" className="text-link">جزئیات نحوه همکاری ←</Link></div><ol className="journey-track">{steps.map(([title, text, stage], index) => <li key={title}><div className="journey-number">{(index + 1).toLocaleString('fa-IR').padStart(2, '۰')}</div><span className="journey-stage">{stage}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></div></section>
    <section className="section proof-editorial"><div className="shell"><div className="section-spread"><div className="section-aside"><p className="eyebrow">۰۵ / شواهد همکاری</p><h2>مسئله. اقدام. نتیجه.</h2></div><div className="proof-placeholder"><span className="document-label">در انتظار تأیید انتشار</span><h3>سوابق را با جزئیات قابل اتکا روایت می‌کنیم.</h3><p>مطالعات موردی این بخش پس از تأیید داخلی و دریافت مجوز کارفرما منتشر می‌شوند. تا آن زمان، نام، نشان یا آمار تأییدنشده‌ای نمایش نمی‌دهیم.</p><Link href="/projects" className="text-link">درباره مطالعات موردی ←</Link></div></div><div className="team-editorial"><div><p className="eyebrow">۰۶ / افراد پشت راه‌حل</p><h2>پیوند شناخت مالی و توان اجرا.</h2></div><div><p className="muted">معرفی اعضای تیم، نقش‌ها و سوابق، پس از دریافت اطلاعات واقعی و تأیید انتشار تکمیل می‌شود.</p><Link href="/about" className="text-link">درباره نوین ایرانیان ←</Link></div></div></div></section>
    <section className="closing-editorial"><div className="shell"><span className="closing-mark" aria-hidden="true">↙</span><div><p className="eyebrow">از یک گفت‌وگوی روشن شروع کنیم.</p><h2>مسئله را شما می‌شناسید.<br/>مسیر را با هم روشن می‌کنیم.</h2><p>بررسی اولیه رایگان است. جلسه کارشناسی، تنها پس از بررسی و با پیشنهاد اختصاصی ارائه می‌شود.</p><Link className="button button-primary" href="/request">ثبت مسئله و درخواست بررسی ←</Link></div></div></section>
  </>;
}
