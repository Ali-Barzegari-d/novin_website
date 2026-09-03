import Link from 'next/link';
import { StationPath } from './sections/StationPath';

type PublicPageProps = {
  title: string;
  lead: string;
  sections: { title: string; items: string[] }[];
  cta?: boolean;
  /** Optional path diagram rendered under the intro on flow-heavy pages. */
  pathStations?: { title: string; note?: string }[];
  pathLabel?: string;
};

export function PublicPage({ title, lead, sections, cta = true, pathStations, pathLabel }: PublicPageProps) {
  return <>
    <section className="section page-intro"><div className="shell"><p className="eyebrow">نوین ایرانیان / زمینهٔ همکاری</p><h1>{title}</h1><p className="hero-copy">{lead}</p>{pathStations ? <div className="page-intro-path"><StationPath stations={pathStations} ariaLabel={pathLabel ?? 'مسیر همکاری'} /></div> : null}</div></section>
    <section className="section section-surface"><div className="shell public-chapters">{sections.map((section, index) => <article className="public-chapter" key={section.title}><div><p className="eyebrow">{(index + 1).toLocaleString('fa-IR').padStart(2, '۰')} / حوزه بررسی</p><h2>{section.title}</h2></div><ul>{section.items.map((item) => <li key={item}><span aria-hidden="true">—</span>{item}</li>)}</ul></article>)}</div></section>
    {cta ? <section className="section final-cta-wrap"><div className="shell final-cta"><p className="eyebrow">برای یک تصمیم روشن</p><h2>مسئله‌ای مشابه دارید؟</h2><p className="muted">ثبت مسئله و بررسی اولیه رایگان است. مسیر همکاری پس از بررسی روشن می‌شود.</p><Link className="button button-primary" href="/request">ثبت مسئله و درخواست بررسی <span aria-hidden="true">↙</span></Link></div></section> : null}
  </>;
}
