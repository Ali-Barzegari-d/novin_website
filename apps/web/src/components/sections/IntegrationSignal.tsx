'use client';

import { motion, useReducedMotion } from 'framer-motion';

const stages = [
  ['ورودی', 'رویداد واقعی کسب‌وکار', 'فروش، دریافت، پرداخت و عملیات'],
  ['منطق', 'قواعد مالی و کنترل‌ها', 'مدل داده، گردش‌کار و نقاط بررسی'],
  ['اتصال', 'سامانه‌ها و ثبت‌ها', 'حسابداری، محصول و سامانه‌های قانونی'],
  ['خروجی', 'نتیجه قابل ارزیابی', 'ثبت قابل پیگیری و معیار پذیرش روشن']
] as const;

/**
 * Original, intentionally non-quantitative process illustration.
 * Flow runs right-to-left to match the RTL stage list below it: ورودی on the
 * right, خروجی on the left. The list is the semantic, no-JavaScript
 * equivalent; SVG is supplementary. All text stays in HTML — never inside SVG.
 * Colors are diagram slots validated against the turquoise-900 panel:
 * line/anchors turquoise-100, logic gold-tint, output rose-tint.
 * Node fills are pre-mixed opaque against the panel so the flow line reads
 * as connecting edge-to-edge instead of showing through.
 */
export function IntegrationSignal() {
  const shouldReduceMotion = useReducedMotion();
  const interactionMotion = shouldReduceMotion ? {} : {
    whileHover: { y: -4 },
    whileTap: { scale: 0.995 }
  };

  return <motion.figure
    className="integration-signal"
    {...interactionMotion}
    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    aria-labelledby="integration-signal-title"
  >
    <figcaption id="integration-signal-title" className="spec-title">
      یک جریان منسجم، از رویداد تا پذیرش
      <span aria-hidden="true">↙</span>
    </figcaption>
    <svg className="integration-signal-art" viewBox="0 0 520 168" aria-hidden="true" focusable="false">
      {/* Hairline value guides — solid, one step off the panel (never dashed). */}
      <path className="integration-signal-guide" d="M66 140H454" />
      {/* Main flow line: right (ورودی) to left (خروجی), 2px, round caps. */}
      <path className="integration-signal-line" d="M454 86H366L318 44H218L170 118H66" />
      <g className="integration-signal-node integration-signal-node-input">
        <rect x="426" y="58" width="56" height="56" rx="8" />
        {/* Document glyph: a real event recorded. */}
        <path d="M440 74h28M440 86h20M440 98h12" />
      </g>
      <g className="integration-signal-node integration-signal-node-logic">
        <rect x="290" y="16" width="56" height="56" rx="8" />
        {/* Branch glyph: one rule splitting into checked paths. */}
        <path d="M302 44h10M312 44l11-9M312 44l11 9" />
        <circle cx="328" cy="33" r="2.5" />
        <circle cx="328" cy="55" r="2.5" />
      </g>
      <g className="integration-signal-node integration-signal-node-connection">
        <rect x="142" y="90" width="56" height="56" rx="8" />
        {/* Linked rings glyph: systems joined. */}
        <circle cx="161" cy="118" r="6.5" />
        <circle cx="179" cy="118" r="6.5" />
      </g>
      <g className="integration-signal-node integration-signal-node-output">
        <rect x="38" y="58" width="56" height="56" rx="8" />
        {/* Measured outcome glyph: rising line with arrowhead. */}
        <path d="M46 104l12-10 8 6 12-14" />
        <path d="M87 87L78 86l1 9" />
      </g>
      {/* Junction anchors: 8px marks with the panel-colored 2px ring. */}
      <circle className="integration-signal-anchor" cx="366" cy="86" r="4" />
      <circle className="integration-signal-anchor" cx="318" cy="44" r="4" />
      <circle className="integration-signal-anchor" cx="218" cy="44" r="4" />
      <circle className="integration-signal-anchor" cx="170" cy="118" r="4" />
    </svg>
    <ol>
      {stages.map(([label, title, detail]) => <li key={label}>
        <span>{label}</span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </li>)}
    </ol>
    <p>طرح مفهومی · مسیر هر سازمان پس از بررسی تعیین می‌شود.</p>
  </motion.figure>;
}
