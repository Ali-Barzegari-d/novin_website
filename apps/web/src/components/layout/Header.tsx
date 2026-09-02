'use client';

import * as React from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: Route;
  exact?: boolean;
}

const primaryNavItems: NavItem[] = [
  { label: 'توانمندی‌ها', href: '/capabilities' },
  { label: 'نحوه همکاری', href: '/process' },
  { label: 'پروژه‌ها', href: '/projects' },
  { label: 'درباره ما', href: '/about' },
  { label: 'تماس با ما', href: '/contact' }
];

const mobileNavItems: NavItem[] = [
  { label: 'صفحه اصلی', href: '/', exact: true },
  { label: 'راهکارهای دولتی و عمومی', href: '/solutions/public' },
  { label: 'راهکارهای شرکت‌های خصوصی', href: '/solutions/private' },
  ...primaryNavItems
];

function isActive(pathname: string, item: NavItem) {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function ChevronDown() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      {open ? (
        <>
          <path d="m7 7 10 10" />
          <path d="M17 7 7 17" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

function navLinkClasses(active: boolean, className?: string) {
  return cn(
    'relative inline-flex min-h-11 items-center text-sm font-medium transition-colors duration-(--duration-fast) motion-reduce:transition-none',
    "after:absolute after:bottom-1 after:end-0 after:h-px after:w-0 after:bg-(--color-primary) after:content-[''] after:transition-[width] after:duration-(--duration-fast)",
    active
      ? 'text-(--color-primary) after:w-full'
      : 'text-(--color-text-secondary) hover:text-(--color-text-primary)',
    className
  );
}

function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const solutionsActive = pathname.startsWith('/solutions/');

  React.useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 8);
    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });
    return () => window.removeEventListener('scroll', updateScrolled);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-(--color-border) bg-(--color-page)/95 backdrop-blur-sm',
        'transition-shadow duration-(--duration-fast) motion-reduce:transition-none',
        scrolled && 'shadow-(--shadow-md)'
      )}
    >
      <div className="shell flex min-h-18 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-(--radius-sm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
          aria-label="نوین ایرانیان، صفحه اصلی"
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-(--radius-sm) border border-(--color-primary) font-(family-name:--font-display) text-base font-bold leading-none text-(--color-primary)"
            aria-hidden="true"
          >
            ن
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-(family-name:--font-display) text-sm font-bold text-(--color-text-primary)">
              نوین ایرانیان
            </span>
            <span className="mt-0.5 block text-[0.625rem] text-(--color-text-muted)">
              طراحی و تحلیل مالی
            </span>
          </span>
        </Link>

        <NavigationMenu.Root
          dir="rtl"
          delayDuration={80}
          className="relative hidden xl:block"
          aria-label="ناوبری اصلی"
        >
          <NavigationMenu.List className="flex items-center gap-5">
            <NavigationMenu.Item className="relative">
              <NavigationMenu.Trigger
                className={cn(
                  'inline-flex min-h-11 items-center gap-1 rounded-(--radius-sm) text-sm font-medium outline-none transition-colors duration-(--duration-fast)',
                  solutionsActive
                    ? 'text-(--color-primary)'
                    : 'text-(--color-text-secondary) hover:text-(--color-text-primary)',
                  'focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)'
                )}
              >
                راهکارها
                <ChevronDown />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="absolute top-[calc(100%+8px)] start-0 z-50 grid w-80 gap-1 rounded-(--radius) border border-(--color-border) bg-(--color-surface-raised) p-2 shadow-(--shadow-md)">
                <NavigationMenu.Link asChild active={pathname.startsWith('/solutions/public')}>
                  <Link
                    href="/solutions/public"
                    className="rounded-(--radius-sm) px-3 py-2.5 text-sm text-(--color-text-secondary) transition-colors duration-(--duration-fast) hover:bg-(--color-primary-subtle) hover:text-(--color-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
                  >
                    راهکارهای نهادهای دولتی و عمومی
                  </Link>
                </NavigationMenu.Link>
                <NavigationMenu.Link asChild active={pathname.startsWith('/solutions/private')}>
                  <Link
                    href="/solutions/private"
                    className="rounded-(--radius-sm) px-3 py-2.5 text-sm text-(--color-text-secondary) transition-colors duration-(--duration-fast) hover:bg-(--color-primary-subtle) hover:text-(--color-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
                  >
                    راهکارهای شرکت‌های خصوصی
                  </Link>
                </NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
            {primaryNavItems.map((item) => (
              <NavigationMenu.Item key={item.href}>
                <NavigationMenu.Link asChild active={isActive(pathname, item)}>
                  <Link
                    href={item.href}
                    aria-current={isActive(pathname, item) ? 'page' : undefined}
                    className={navLinkClasses(isActive(pathname, item))}
                  >
                    {item.label}
                  </Link>
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            ))}
          </NavigationMenu.List>
        </NavigationMenu.Root>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-(--radius-sm) px-2 text-sm text-(--color-text-secondary) transition-colors duration-(--duration-fast) hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
          >
            ورود
          </Link>
          <Link href="/request" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            ثبت مسئله
          </Link>
        </div>

        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-(--radius-sm) text-(--color-text-secondary) transition-colors duration-(--duration-fast) hover:bg-(--color-border-subtle) hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg) xl:hidden"
              aria-label={mobileOpen ? 'بستن منوی اصلی' : 'باز کردن منوی اصلی'}
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-(--color-primary)/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed inset-y-0 start-0 z-50 flex w-[min(20rem,88vw)] flex-col border-e border-(--color-border) bg-(--color-surface-raised) shadow-(--shadow-md) outline-none">
              <Dialog.Title className="sr-only">منوی اصلی</Dialog.Title>
              <Dialog.Description className="sr-only">
                لینک‌های ناوبری و شروع ثبت مسئله
              </Dialog.Description>
              <div className="flex min-h-18 items-center justify-between border-b border-(--color-border) px-5">
                <span className="font-(family-name:--font-display) text-sm font-bold text-(--color-text-primary)">
                  نوین ایرانیان
                </span>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-(--radius-sm) text-(--color-text-secondary) transition-colors duration-(--duration-fast) hover:bg-(--color-border-subtle) hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
                    aria-label="بستن منوی اصلی"
                  >
                    <MenuIcon open />
                  </button>
                </Dialog.Close>
              </div>
              <nav aria-label="منوی موبایل" className="flex-1 overflow-y-auto px-4 py-5">
                <ul className="grid gap-1" role="list">
                  {mobileNavItems.map((item) => {
                    const active = isActive(pathname, item);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'flex min-h-11 items-center rounded-(--radius-sm) px-3 text-base font-medium transition-colors duration-(--duration-fast)',
                            active
                              ? 'bg-(--color-primary-subtle) text-(--color-primary)'
                              : 'text-(--color-text-secondary) hover:bg-(--color-border-subtle) hover:text-(--color-text-primary)',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)'
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="grid gap-2 border-t border-(--color-border) p-5">
                <Link
                  href="/request"
                  onClick={() => setMobileOpen(false)}
                  className={buttonVariants({ variant: 'primary', size: 'lg', fullWidth: true })}
                >
                  ثبت مسئله و درخواست بررسی
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-(--radius-sm) text-sm text-(--color-text-secondary) transition-colors duration-(--duration-fast) hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
                >
                  ورود / درخواست‌های من
                </Link>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}

export { Header };
