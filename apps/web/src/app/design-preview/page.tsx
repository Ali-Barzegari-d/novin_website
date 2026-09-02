import { Button } from '@/components/ui/Button';

export const metadata = { title: 'پیش‌نمایش طراحی', robots: { index: false, follow: false } };

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 8h11M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Preview() {
  if (process.env.NODE_ENV === 'production') return null;
  return (
    <section className="section">
      <div className="shell">
        <span className="eyebrow">پیش‌نمایش توسعه</span>
        <h1>سیستم طراحی نوین</h1>
        <div className="grid-3">
          <article className="card">
            <h2 style={{ fontSize: '1.2rem' }}>رنگ و تایپوگرافی</h2>
            <p>سرمه‌ای، فیروزه‌ای، سبز، زرشکی و طلایی در یک سطح روشن.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <i
                style={{ width: 30, height: 30, background: 'var(--navy-900)', borderRadius: 6 }}
              />
              <i
                style={{ width: 30, height: 30, background: 'var(--teal-700)', borderRadius: 6 }}
              />
              <i
                style={{
                  width: 30,
                  height: 30,
                  background: 'var(--burgundy-700)',
                  borderRadius: 6
                }}
              />
            </div>
          </article>
          <article className="card">
            <h2 style={{ fontSize: '1.2rem' }}>Button</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Button>اصلی</Button>
              <Button variant="secondary">ثانویه</Button>
              <Button variant="ghost">شفاف</Button>
              <Button variant="accent" leadingIcon={<ArrowIcon />}>
                فیروزه‌ای
              </Button>
              <Button variant="danger">حذف</Button>
              <Button variant="danger-ghost">لغو</Button>
              <Button variant="link">جزئیات</Button>
              <Button isLoading loadingText="در حال ثبت…">
                ثبت
              </Button>
              <Button disabled>غیرفعال</Button>
              <Button variant="ghost" size="icon-md" aria-label="حرکت به صفحه بعد">
                <ArrowIcon />
              </Button>
            </div>
          </article>
          <article className="card">
            <h2 style={{ fontSize: '1.2rem' }}>وضعیت</h2>
            <p className="success">تأیید موفق</p>
            <p className="error">خطای قابل اقدام</p>
          </article>
        </div>
      </div>
    </section>
  );
}
