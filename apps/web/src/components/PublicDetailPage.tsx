import Link from 'next/link';
import { Icon } from './Icon';
import { Reveal } from './Motion';

export type DetailPageData = {
  title: string;
  summary: string;
  statement: string;
  points: readonly { title: string; text: string }[];
  note?: string;
};

export function PublicDetailPage({ data }: { data: DetailPageData }) {
  return (
    <main id="main-content" className="detail-page">
      <header className="detail-hero shell"><h1>{data.title}</h1><p>{data.summary}</p><div className="detail-rule"><span/><b>{data.statement}</b></div></header>
      <section className="detail-body shell"><div className="detail-index" aria-hidden="true"><span>مسئله</span><i/><span>تحلیل</span><i/><span>اجرا</span></div><div className="detail-points">{data.points.map((point, index) => <Reveal className="detail-point" key={point.title}><span>{new Intl.NumberFormat('fa-IR', { minimumIntegerDigits: 2 }).format(index + 1)}</span><div><h2>{point.title}</h2><p>{point.text}</p></div></Reveal>)}</div></section>
      {data.note && <aside className="detail-notice shell"><Icon name="warning"/><p>{data.note}</p></aside>}
      <section className="detail-cta"><div className="shell"><h2>اگر هنوز نام راه‌حل را نمی‌دانید، مسئله را تعریف کنید.</h2><p>بررسی اولیه رایگان است و ثبت درخواست هیچ تعهدی برای سفارش یا پذیرش پروژه ایجاد نمی‌کند.</p><Link className="button button-large" href="/request">شروع شرح مسئله <Icon name="arrow"/></Link></div></section>
    </main>
  );
}
