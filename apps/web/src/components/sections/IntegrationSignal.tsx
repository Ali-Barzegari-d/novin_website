const stages = [
  ['ورودی', 'رویداد واقعی کسب‌وکار', 'فروش، دریافت، پرداخت و عملیات'],
  ['منطق', 'قواعد مالی و کنترل‌ها', 'مدل داده، گردش‌کار و نقاط بررسی'],
  ['اتصال', 'سامانه‌ها و ثبت‌ها', 'حسابداری، محصول و سامانه‌های قانونی'],
  ['خروجی', 'نتیجه قابل ارزیابی', 'ثبت قابل پیگیری و معیار پذیرش روشن']
] as const;

/**
 * A semantic, non-quantitative process summary. It deliberately avoids a
 * decorative visual or dashboard: every piece of the method is readable in
 * Persian HTML without JavaScript.
 */
export function IntegrationSignal() {
  return <aside
    className="integration-signal"
    aria-labelledby="integration-signal-title"
  >
    <h3 id="integration-signal-title" className="spec-title">
      یک جریان منسجم، از رویداد تا پذیرش
      <span aria-hidden="true">↙</span>
    </h3>
    <ol>
      {stages.map(([label, title, detail]) => <li key={label}>
        <span>{label}</span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </li>)}
    </ol>
    <p>طرح مفهومی · مسیر هر سازمان پس از بررسی تعیین می‌شود.</p>
  </aside>;
}
