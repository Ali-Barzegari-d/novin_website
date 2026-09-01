'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ProcessArt } from './ProcessArt';

const problems = ['پراکندگی و ابهام در نیازهای ذی‌نفعان', 'رویدادهای مالی دستی، تکراری یا دیرهنگام', 'فاصله میان عملیات، حسابداری و سامانه‌های قانونی', 'نیاز به مدل، فرایند و محصول قابل پذیرش'];
const steps = [['ثبت مسئله', 'شرح نیاز سازمان را ثبت می‌کنید.'], ['بررسی رایگان', 'تماس و امکان‌سنجی اولیه انجام می‌شود.'], ['پیشنهاد اختصاصی', 'در صورت تناسب، جلسه کارشناسی با شرایط روشن ارائه می‌شود.'], ['جلسه و جمع‌بندی', 'خروجی مکتوب مقدماتی تحویل می‌شود.'], ['پروژه مستقل', 'در صورت توافق، پیشنهاد و قرارداد جداگانه شکل می‌گیرد.']];

export function HomeExperience() {
  const reduceMotion = useReducedMotion();
  const view = { once: true, amount: 0.22 };

  return <>
    <section className="hero">
      <div className="shell hero-grid">
        <motion.div initial={reduceMotion ? false : { opacity: 0, x: 28 }} animate={reduceMotion ? false : { opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 28 }}>
          <h1>پیچیدگی‌های مالی و کسب‌وکاری را به فرایند، سامانه و محصول قابل‌اجرا تبدیل می‌کنیم.</h1>
          <p className="hero-copy">از صورت‌بندی مسئله و طراحی مدل مالی تا اتوماسیون، توسعه نرم‌افزار، راهبری اجرا و پذیرش نهایی.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/request">ثبت مسئله و درخواست بررسی</Link>
            <Link className="button button-secondary" href="/projects">مشاهده پروژه‌ها</Link>
          </div>
        </motion.div>
        <motion.div className="hero-art" initial={reduceMotion ? false : { opacity: 0, scale: .92, rotate: -2 }} animate={reduceMotion ? false : { opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 150, damping: 22, delay: .08 }}><ProcessArt/></motion.div>
      </div>
    </section>

    <motion.section className="trust" initial={reduceMotion ? false : { opacity: 0, y: 16 }} whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }} viewport={view} transition={{ duration: .32 }}>
      <div className="shell trust-inner"><strong>همکاری بر پایه مسئله، نه فهرست پکیج‌ها</strong><span className="placeholder">نشان مشتریان پس از تأیید انتشار درج می‌شود</span><span className="placeholder">آمار واقعی و قابل اثبات</span></div>
    </motion.section>

    <section className="section audience-section">
      <div className="shell">
        <motion.div className="section-heading" initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }} viewport={view} transition={{ type: 'spring', stiffness: 200, damping: 26 }}><h2>همکاری متناسب با زمینه سازمان</h2></motion.div>
        <div className="grid-2 audience-grid">
          <motion.article className="card path-card path-card-public" initial={reduceMotion ? false : { opacity: 0, x: 28 }} whileInView={reduceMotion ? {} : { opacity: 1, x: 0 }} whileHover={reduceMotion ? {} : { y: -6, rotate: -.5 }} viewport={view} transition={{ type: 'spring', stiffness: 230, damping: 24 }}><h3>برای نهادهای دولتی و عمومی</h3><p className="muted">از تبدیل سیاست و قانون به قواعد کسب‌وکار تا طراحی گردش‌کار، معیار پذیرش و راهبری مستقل اجرا.</p><Link href="/solutions/public">مشاهده مسیر دولتی و عمومی</Link></motion.article>
          <motion.article className="card path-card path-card-private" initial={reduceMotion ? false : { opacity: 0, x: -28 }} whileInView={reduceMotion ? {} : { opacity: 1, x: 0 }} whileHover={reduceMotion ? {} : { y: -6, rotate: .5 }} viewport={view} transition={{ type: 'spring', stiffness: 230, damping: 24, delay: .06 }}><h3>برای شرکت‌ها و کسب‌وکارهای خصوصی</h3><p className="muted">از انطباق مدل مالی با عملیات تا یکپارچه‌سازی، کنترل داخلی و محصول اختصاصی.</p><Link href="/solutions/private">مشاهده مسیر شرکت‌های خصوصی</Link></motion.article>
        </div>
      </div>
    </section>

    <section className="section section-surface signal-section">
      <div className="shell">
        <motion.div className="section-heading" initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }} viewport={view} transition={{ duration: .35 }}><h2>به‌جای انتخاب خدمت، مسئله را روشن می‌کنیم.</h2></motion.div>
        <div className="grid-2 problem-grid">
          {problems.map((problem, index) => <motion.article className="card problem-card" key={problem} initial={reduceMotion ? false : { opacity: 0, y: 24, rotateX: 4 }} whileInView={reduceMotion ? {} : { opacity: 1, y: 0, rotateX: 0 }} whileHover={reduceMotion ? {} : { y: -5 }} viewport={view} transition={{ type: 'spring', stiffness: 220, damping: 26, delay: index * .06 }}><span className="problem-index">{(index + 1).toLocaleString('fa-IR')}</span><h3>{problem}</h3><p className="muted">مسئله را صورت‌بندی می‌کنیم، گزینه‌های اجرایی را می‌سنجیم و مسیر قابل پیگیری پیشنهاد می‌دهیم.</p></motion.article>)}
        </div>
      </div>
    </section>

    <section className="section integration-section">
      <div className="shell grid-2 integration-grid">
        <motion.div initial={reduceMotion ? false : { opacity: 0, x: 24 }} whileInView={reduceMotion ? {} : { opacity: 1, x: 0 }} viewport={view} transition={{ type: 'spring', stiffness: 180, damping: 28 }}><h2>وقتی منطق مالی باید در عملیات روزمره جریان پیدا کند.</h2><p className="muted">قواعد مالی و مقرراتی را به مدل داده، گردش‌کار، اتصال سامانه‌ها و معیارهای پذیرش تبدیل می‌کنیم؛ نه صرفاً یک گزارش یا یک نرم‌افزار جدا.</p><Link className="button button-secondary" href="/capabilities">شناخت توانمندی‌ها</Link></motion.div>
        <motion.div className="card automation-art" initial={reduceMotion ? false : { opacity: 0, scale: .94 }} whileInView={reduceMotion ? {} : { opacity: 1, scale: 1 }} whileHover={reduceMotion ? {} : { scale: 1.015 }} viewport={view} transition={{ type: 'spring', stiffness: 160, damping: 22 }}><ProcessArt/></motion.div>
      </div>
    </section>

    <section className="section section-tint journey-section">
      <div className="shell">
        <motion.div className="section-heading" initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }} viewport={view} transition={{ duration: .35 }}><h2>از مسئله تا پذیرش نهایی</h2></motion.div>
        <div className="timeline">{steps.map(([title, copy], index) => <motion.div key={title} initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }} viewport={view} transition={{ type: 'spring', stiffness: 210, damping: 26, delay: index * .05 }}><h3>{title}</h3><p className="muted">{copy}</p></motion.div>)}</div>
      </div>
    </section>

    <section className="section proof-section">
      <div className="shell">
        <motion.div className="section-heading" initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }} viewport={view} transition={{ duration: .35 }}><h2>شواهد همکاری، تنها با مجوز انتشار</h2></motion.div>
        <div className="grid-2">
          <motion.article className="card proof-card proof-card-burgundy" initial={reduceMotion ? false : { opacity: 0, x: 20 }} whileInView={reduceMotion ? {} : { opacity: 1, x: 0 }} viewport={view} transition={{ duration: .38 }}><span className="placeholder">نمونه ساختگی — قابل انتشار نیست</span><h3>مطالعه موردی پس از تصویب داخلی</h3><p className="muted">هر مطالعه شامل مسئله، اقدام و نتیجه خواهد بود؛ نام و نشان کارفرما بدون تأیید منتشر نمی‌شود.</p></motion.article>
          <motion.article className="card proof-card proof-card-blue" initial={reduceMotion ? false : { opacity: 0, x: -20 }} whileInView={reduceMotion ? {} : { opacity: 1, x: 0 }} viewport={view} transition={{ duration: .38, delay: .06 }}><span className="placeholder">پروفایل‌های تیم در انتظار تأیید</span><h3>تخصص‌هایی برای ترکیب مسئله و اجرا</h3><p className="muted">معرفی اعضای تیم، سوابق و تصویر فقط با اطلاعات واقعی و مجوز انتشار تکمیل می‌شود.</p></motion.article>
        </div>
      </div>
    </section>

    <section className="section">
      <motion.div className="shell card final-cta" initial={reduceMotion ? false : { opacity: 0, scale: .97 }} whileInView={reduceMotion ? {} : { opacity: 1, scale: 1 }} viewport={view} transition={{ type: 'spring', stiffness: 170, damping: 22 }}><h2>مسئله سازمان خود را برای بررسی اولیه ثبت کنید.</h2><p className="muted">ثبت مسئله و تماس اولیه رایگان است. مبلغ جلسه کارشناسی فقط پس از بررسی و در پیشنهاد اختصاصی نمایش داده می‌شود.</p><Link className="button button-primary" href="/request">ثبت مسئله و درخواست بررسی</Link></motion.div>
    </section>
  </>;
}
