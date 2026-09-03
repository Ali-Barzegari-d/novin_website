const steps = [
  ['۰۱', 'مسئله', 'مرز، ذی‌نفع و نتیجهٔ مورد انتظار'],
  ['۰۲', 'اجرا', 'مدل، فرایند و اتصال متناسب با سازمان'],
  ['۰۳', 'پذیرش', 'معیارهای روشن برای راهبری و تحویل']
] as const;

/**
 * Three-step collaboration summary in semantic HTML. It is deliberately a
 * concise method list, not an illustration or a graph.
 */
export function HeroPathArt() {
  return (
    <ol className="hero-path" aria-label="سه گام روش همکاری: مسئله، اجرا، پذیرش">
      {steps.map(([no, title, detail]) => (
        <li key={no}>
          <span className="hero-path-body">
            <strong className="hero-path-title"><span className="hero-path-no">{no}</span>{title}</strong>
            <small className="hero-path-detail">{detail}</small>
          </span>
        </li>
      ))}
    </ol>
  );
}
