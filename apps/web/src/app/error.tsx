'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="section"><div className="shell card"><h1>خطایی رخ داد.</h1><p className="muted">اطلاعات واردشده حفظ شده است؛ دوباره تلاش کنید.</p><button className="button button-primary" onClick={reset}>تلاش مجدد</button></div></section>; }
