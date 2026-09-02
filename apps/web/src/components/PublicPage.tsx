import Link from 'next/link';

type PublicPageProps = {
  title: string;
  lead: string;
  sections: { title: string; items: string[] }[];
  cta?: boolean;
};

export function PublicPage({ title, lead, sections, cta = true }: PublicPageProps) {
  return <>
    <section className="section page-intro"><div className="shell"><h1>{title}</h1><p className="hero-copy">{lead}</p></div></section>
    <section className="section section-surface"><div className="shell public-chapters">{sections.map((section, index) => <article className="public-chapter" key={section.title}><div><p className="eyebrow">{(index + 1).toLocaleString('fa-IR').padStart(2, '۰')} / حوزه بررسی</p><h2>{section.title}</h2></div><ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div></section>
    {cta ? <section className="section"><div className="shell card final-cta"><h2>مسئله‌ای مشابه دارید؟</h2><p className="muted">ثبت مسئله و بررسی اولیه رایگان است. مسیر همکاری پس از بررسی روشن می‌شود.</p><Link className="button button-primary" href="/request">ثبت مسئله و درخواست بررسی</Link></div></section> : null}
  </>;
}
