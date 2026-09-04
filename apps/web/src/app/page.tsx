import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { Pressable, Reveal } from '@/components/Motion';
import { TransformationDiagram } from '@/components/TransformationDiagram';
import { TrustJourney } from '@/components/TrustJourney';
import { audiences, placeholderNotice, processSteps, productPillars } from '@/lib/content';

export default function HomePage() {
  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'شرکت طراحی و تحلیل مالی نوین ایرانیان', url: process.env.NEXT_PUBLIC_BASE_URL ?? 'https://karafintech.ir', description: 'طراحی و تحلیل یکپارچه مالی، فرایند، داده و سامانه برای اشخاص حقوقی' }).replace(/</g, '\\u003c') }} />
      <section className="hero home-hero shell" aria-labelledby="home-title">
        <div className="hero-copy home-hero-copy">
          <Reveal className="hero-kicker">تحلیل یکپارچه برای تصمیم قابل اجرا</Reveal>
          <Reveal delay={0.08}><h1 id="home-title">پیچیدگی‌های مالی و کسب‌وکاری را به <span>فرایند، سامانه و محصول قابل‌اجرا</span> تبدیل می‌کنیم.</h1></Reveal>
          <Reveal delay={0.16}><p>مسئله را پیش از راه‌حل می‌فهمیم و مالی، فرایند، داده و سامانه را در یک مسیر قابل‌ردیابی کنار هم می‌گذاریم.</p></Reveal>
          <Reveal delay={0.23} className="hero-actions"><Pressable><Link className="button button-large" href="/request">شرح مسئله‌تان را شروع کنید <Icon name="arrow" /></Link></Pressable><Link className="secondary-action" href="/process">فرایند همکاری را ببینید</Link></Reveal>
          <Reveal delay={0.3}><p className="hero-note"><Icon name="check" /> ثبت درخواست رایگان است و به معنی سفارش یا تشکیل قرارداد نیست.</p></Reveal>
        </div>
        <TrustJourney />
        <div className="trust-rail" aria-label="اصول شروع همکاری">
          <div><Icon name="search"/><span><strong>بررسی اولیه رایگان</strong><small>برای تشخیص امکان همکاری</small></span></div>
          <div><Icon name="lock"/><span><strong>محرمانگی از ابتدا</strong><small>بدون دریافت داده حساس در فرم</small></span></div>
          <div><Icon name="document"/><span><strong>پیشنهاد اختصاصی</strong><small>دامنه و مبلغ فقط در لینک خصوصی</small></span></div>
        </div>
      </section>

      <section className="confidence-band" aria-label="مرزهای اعتماد">
        <div className="shell confidence-grid"><p>اعتماد از ادعا ساخته نمی‌شود؛ از مرز روشن، فرایند قابل‌ردیابی و تصمیم مستند ساخته می‌شود.</p><ul><li>بدون وعده نتیجه</li><li>بدون قیمت عمومی</li><li>بدون دریافت سند محرمانه در شروع</li></ul></div>
      </section>

      <section className="section shell audience-section" aria-labelledby="audience-title">
        <Reveal className="section-heading"><h2 id="audience-title">سه نقطه شروع، یک زبان مشترک</h2><p>هر نقش از مسئله خودش وارد می‌شود؛ تحلیل در یک مسیر یکپارچه به هم می‌رسد.</p></Reveal>
        <div className="audience-lines">
          {audiences.map((audience, index) => <Reveal key={audience.title} delay={index * .08} className="audience-row"><span className="audience-symbol"><Icon name={index === 0 ? 'person' : index === 1 ? 'network' : 'building'} /></span><div><h3>{audience.title}</h3><p>{audience.text}</p></div><Link href={audience.href} aria-label={`مشاهده مسیر ${audience.title}`}><Icon name="arrow" /></Link></Reveal>)}
        </div>
      </section>

      <section className="section problem-field" aria-labelledby="problem-title">
        <div className="shell problem-layout"><Reveal><h2 id="problem-title">مسئله‌ها معمولاً در مرز واحدها پنهان می‌شوند.</h2><p>عدد درست است اما تصمیم روشن نیست؛ فرایند وجود دارد اما قابل‌کنترل نیست؛ داده جمع می‌شود اما به اقدام وصل نمی‌شود؛ سامانه خریده شده اما مسئله را حل نمی‌کند.</p></Reveal><div className="problem-register"><span>گزارش و کنترل مالی</span><span>طراحی و اصلاح فرایند</span><span>مدل داده و یکپارچگی</span><span>انتخاب و طراحی سامانه</span><span>تعریف محصول و مسیر اجرا</span></div></div>
      </section>

      <section className="section shell integration-section" aria-labelledby="integration-title">
        <Reveal className="section-heading"><h2 id="integration-title">از تشخیص پراکنده تا یک تصمیم یکپارچه</h2><p>نقشه را لمس کنید؛ هر لایه بخشی از مسئله را توضیح می‌دهد، اما نتیجه فقط از اتصال آن‌ها ساخته می‌شود.</p></Reveal>
        <TransformationDiagram />
      </section>

      <section className="section process-section" aria-labelledby="process-title">
        <div className="shell"><Reveal className="section-heading light"><h2 id="process-title">همکاری از یک تعهد کوچک و روشن آغاز می‌شود.</h2><p>تا قبل از بررسی، نه شما مجبور به انتخاب راه‌حل هستید و نه ما وعده‌ای درباره نتیجه می‌دهیم.</p></Reveal><ol className="process-track">{processSteps.map(([title, text], index) => <li key={title}><span>{new Intl.NumberFormat('fa-IR', { minimumIntegerDigits: 2 }).format(index + 1)}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol><Link className="button button-invert" href="/initial-assessment">جزئیات ارزیابی اولیه <Icon name="arrow" /></Link></div>
      </section>

      <section className="section shell proof-section" aria-labelledby="proof-title">
        <Reveal className="proof-intro"><h2 id="proof-title">نتیجه باید قابل توضیح، قابل تحویل و قابل پیگیری باشد.</h2><p>تا زمان دریافت مجوز انتشار، نمونه‌کار واقعی یا نام مشتری نمایش نمی‌دهیم.</p></Reveal>
        <div className="case-placeholder"><span className="placeholder-chip">نمونه ساختگی</span><div className="case-flow"><b>مسئله مبهم</b><Icon name="arrow"/><b>مدل تصمیم</b><Icon name="arrow"/><b>مسیر اجرا</b></div><h3>نمونه ساختگی یکپارچه‌سازی جریان مالی</h3><p>{placeholderNotice}</p><Link href="/projects/sample-financial-flow">مشاهده نحوه ارائه مطالعه موردی <Icon name="arrow"/></Link></div>
      </section>

      <section className="section team-section" aria-labelledby="team-title"><div className="shell team-layout"><Reveal><h2 id="team-title">ترکیب تخصص، متناسب با مسئله</h2><p>در پیشنهاد اختصاصی، نقش و تخصص کارشناسان موردنیاز روشن می‌شود. اطلاعات اعضای واقعی پس از تأیید انتشار جایگزین این نمای ساختگی خواهد شد.</p><span className="placeholder-chip">پروفایل‌های واقعی در انتظار تأیید</span></Reveal><div className="expert-orbit" aria-hidden="true">{productPillars.slice(0, 4).map(([title], index) => <span key={title} style={{ '--i': index } as React.CSSProperties}>{title}</span>)}<b>مسئله</b></div></div></section>

      <section className="closing-section" aria-labelledby="closing-title"><div className="shell closing-layout"><h2 id="closing-title">لازم نیست نام راه‌حل را بدانید؛ مسئله را همان‌طور که می‌بینید تعریف کنید.</h2><div><p>ثبت درخواست رایگان است. پس از بررسی، درباره امکان همکاری و قدم بعدی با شما تماس می‌گیریم.</p><Link className="button button-large" href="/request">شروع شرح مسئله <Icon name="arrow"/></Link></div></div></section>
    </main>
  );
}
