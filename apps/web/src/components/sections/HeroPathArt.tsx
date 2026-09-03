const steps = [
  ['۰۱', 'مسئله', 'مرز، ذی‌نفع و نتیجهٔ مورد انتظار', 'var(--path-step-1)'],
  ['۰۲', 'اجرا', 'مدل، فرایند و اتصال متناسب با سازمان', 'var(--path-step-2)'],
  ['۰۳', 'پذیرش', 'معیارهای روشن برای راهبری و تحویل', 'var(--path-step-3)']
] as const;

/**
 * Three-step cooperation path as an HTML stepper on a shared vertical rail.
 * All labels live in HTML (SVG text broke Persian shaping/bidi when clipped),
 * so the diagram stays crisp, selectable and RTL-correct at any width.
 * The rail runs down the inline-start edge and the terminus marks acceptance.
 * Node colors are the validated categorical set: turquoise / azure / rose.
 */
export function HeroPathArt() {
  return (
    <ol className="hero-path" aria-label="سه گام روش همکاری: مسئله، اجرا، پذیرش">
      {steps.map(([no, title, detail, color]) => (
        <li key={no} style={{ '--path-step': color } as React.CSSProperties}>
          <span className="hero-path-node" aria-hidden="true" />
          <span className="hero-path-body">
            <strong className="hero-path-title"><span className="hero-path-no">{no}</span>{title}</strong>
            <small className="hero-path-detail">{detail}</small>
          </span>
        </li>
      ))}
    </ol>
  );
}
