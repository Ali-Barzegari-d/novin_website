'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { companyName, publicNavigation } from '@/lib/content';
import { Icon } from './Icon';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const menuButton = useRef<HTMLButtonElement>(null);
  const mobileNav = useRef<HTMLElement>(null);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(mobileNav.current?.querySelectorAll<HTMLElement>('a, button') ?? []);
    focusable()[0]?.focus();
    const containFocus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return; }
      if (event.key !== 'Tab') return;
      const items = focusable();
      const first = items[0]; const last = items.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', containFocus);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', containFocus); menuButton.current?.focus(); };
  }, [open]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="wordmark" href="/" aria-label={`${companyName}؛ صفحه اصلی`}>
          <i className="brand-mark" aria-hidden="true"><b /></i>
          <span>{companyName}</span>
        </Link>
        <nav className="desktop-nav" aria-label="ناوبری اصلی">
          {publicNavigation.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link className="text-link" href="/login">ورود</Link>
          <Link className="button button-small" href="/request">شرح مسئله</Link>
          <button ref={menuButton} className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'بستن فهرست' : 'بازکردن فهرست'}><Icon name={open ? 'close' : 'menu'} /></button>
        </div>
      </div>
      <AnimatePresence>
        {open && <motion.nav ref={mobileNav} id="mobile-navigation" className="mobile-nav" aria-label="ناوبری موبایل" initial={reduce ? false : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }} exit={reduce ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}>
          {publicNavigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          <Link href="/contact">تماس با ما</Link><Link href="/login">ورود به حساب</Link>
        </motion.nav>}
      </AnimatePresence>
    </header>
  );
}
