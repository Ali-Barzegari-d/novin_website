'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const links = [['دولتی و عمومی', '/solutions/public'], ['شرکت‌های خصوصی', '/solutions/private'], ['توانمندی‌ها', '/capabilities'], ['نحوه همکاری', '/process'], ['پروژه‌ها', '/projects'], ['درباره ما', '/about'], ['تماس', '/contact']] as const;
export function Header() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (menu.current) menu.current.open = false; }, [pathname]);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false; };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  return <header className="nav"><div className="shell nav-inner"><Link className="brand" href="/" aria-label="نوین ایرانیان، صفحه اصلی"><span className="brand-mark" aria-hidden="true">ن</span><span>نوین ایرانیان<small>طراحی و تحلیل مالی</small></span></Link><nav className="links desktop-links" aria-label="ناوبری اصلی">{links.filter(([, href]) => !['/solutions/public', '/solutions/private', '/contact'].includes(href)).map(([label, href]) => <Link href={href} key={href} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>)}</nav><div className="nav-actions"><Link className="button button-secondary" href="/login">ورود</Link><Link className="button button-primary" href="/request">ثبت مسئله <span aria-hidden="true">↙</span></Link><details ref={menu} className="mobile-menu" onKeyDown={(event) => { if (event.key === 'Escape' && menu.current) { menu.current.open = false; menu.current.querySelector('summary')?.focus(); } }}><summary aria-label="فهرست ناوبری">فهرست</summary><nav className="mobile-links" aria-label="ناوبری همراه">{links.map(([label, href]) => <Link href={href} key={href} aria-current={pathname === href ? 'page' : undefined} onClick={() => { if (menu.current) menu.current.open = false; }}>{label}</Link>)}<Link href="/login">ورود / درخواست‌های من</Link><Link href="/request">ثبت مسئله و درخواست بررسی</Link></nav></details></div></div></header>;
}
