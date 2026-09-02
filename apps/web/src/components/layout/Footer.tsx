import Link from 'next/link';
import { BrandMark } from './BrandMark';

const footerColumns = [
  {
    title: 'مسیرهای همکاری',
    links: [
      { label: 'نهادهای دولتی و عمومی', href: '/solutions/public' },
      { label: 'شرکت‌ها و کسب‌وکارهای خصوصی', href: '/solutions/private' },
      { label: 'توانمندی‌ها', href: '/capabilities' },
      { label: 'نحوه همکاری', href: '/process' }
    ]
  },
  {
    title: 'دسترسی و پیگیری',
    links: [
      { label: 'ثبت مسئله و درخواست', href: '/request' },
      { label: 'ورود و درخواست‌های من', href: '/login' },
      { label: 'پروژه‌ها و مطالعات موردی', href: '/projects' },
      { label: 'صفحه تماس', href: '/contact' }
    ]
  },
  {
    title: 'قوانین و شفافیت',
    links: [
      { label: 'شرایط استفاده', href: '/terms' },
      { label: 'حریم خصوصی', href: '/privacy' },
      { label: 'لغو و استرداد', href: '/cancellation' },
      { label: 'ثبت و پیگیری شکایت', href: '/complaints' }
    ]
  }
] as const;

function Footer() {
  return (
    <footer className="border-t border-(--color-border) bg-(--color-paper) text-(--color-text-secondary)">
      <div className="shell py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <section className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <BrandMark />
              <h2 className="m-0 font-(family-name:--font-display) text-base font-bold text-(--color-text-primary)">
                شرکت طراحی و تحلیل مالی نوین ایرانیان
              </h2>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-(--color-text-secondary)">
              طراحی و راهبری تحول خدمات، فرایندها و محصولات مالی سازمان‌ها؛ از صورت‌بندی مسئله تا
              پذیرش نهایی.
            </p>
            <dl className="mt-5 grid gap-2 text-xs leading-relaxed text-(--color-text-muted)">
              <div>
                <dt className="inline font-semibold text-(--color-text-secondary)">شناسه ملی: </dt>
                <dd className="inline">[نیازمند درج شناسه ملی شرکت]</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-(--color-text-secondary)">شماره ثبت: </dt>
                <dd className="inline">[نیازمند درج شماره ثبت]</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-(--color-text-secondary)">
                  نشانی قانونی:{' '}
                </dt>
                <dd className="inline">[نیازمند درج نشانی قانونی]</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-(--color-text-secondary)">
                  ارتباط رسمی:{' '}
                </dt>
                <dd className="inline">
                  <Link
                    href="/contact"
                    className="underline decoration-(--color-border) underline-offset-4 hover:text-(--color-primary)"
                  >
                    [نیازمند درج تلفن و ایمیل]
                  </Link>
                </dd>
              </div>
            </dl>
          </section>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:col-span-3">
            {footerColumns.map((column) => (
              <section key={column.title}>
                <h2 className="m-0 text-sm font-semibold text-(--color-text-primary)">
                  {column.title}
                </h2>
                <ul className="mt-3 grid gap-2" role="list">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm leading-relaxed text-(--color-text-secondary) transition-colors duration-(--duration-fast) hover:text-(--color-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-(--color-border) pt-7 md:mt-12 md:flex-row md:items-center md:justify-between">
          <p className="m-0 max-w-2xl text-xs leading-relaxed text-(--color-text-muted)">
            اطلاعات هویتی، راه‌های تماس و اسناد حقوقی این نسخه تا زمان تأیید مالک محصول، برای انتشار
            عمومی آماده نیستند.
          </p>
          <div className="flex flex-wrap gap-2" aria-label="وضعیت مجوزها و نمادهای اعتماد">
            <span className="inline-flex min-h-11 items-center rounded-(--radius-sm) border border-dashed border-(--color-border) px-3 text-xs text-(--color-text-muted)">
              نماد اعتماد: نیازمند مجوز و تأیید انتشار
            </span>
            <span className="inline-flex min-h-11 items-center rounded-(--radius-sm) border border-dashed border-(--color-border) px-3 text-xs text-(--color-text-muted)">
              مجوز صنفی: نیازمند تأیید انتشار
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
