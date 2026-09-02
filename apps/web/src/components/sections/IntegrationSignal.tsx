'use client';

import { motion, useReducedMotion } from 'framer-motion';

const stages = [
  ['ورودی', 'رویداد واقعی کسب‌وکار', 'فروش، دریافت، پرداخت و عملیات'],
  ['منطق', 'قواعد مالی و کنترل‌ها', 'مدل داده، گردش‌کار و نقاط بررسی'],
  ['اتصال', 'سامانه‌ها و ثبت‌ها', 'حسابداری، محصول و سامانه‌های قانونی'],
  ['خروجی', 'نتیجه قابل ارزیابی', 'ثبت قابل پیگیری و معیار پذیرش روشن']
];

/**
 * Original, intentionally non-quantitative process illustration.
 * The list is the semantic, no-JavaScript equivalent; SVG is supplementary.
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
    <svg className="integration-signal-art" viewBox="0 0 520 148" aria-hidden="true" focusable="false">
      <path className="integration-signal-line" d="M66 75H154L202 37H302L350 111H454" />
      <path className="integration-signal-guide" d="M66 112H154M202 112H302M350 112H454" />
      <g className="integration-signal-node integration-signal-node-input"><rect x="38" y="48" width="56" height="56" rx="8" /><path d="M54 76h24M66 64v24" /></g>
      <g className="integration-signal-node integration-signal-node-logic"><rect x="174" y="9" width="56" height="56" rx="8" /><path d="M190 37h24M190 47h16" /></g>
      <g className="integration-signal-node integration-signal-node-connection"><rect x="322" y="83" width="56" height="56" rx="8" /><circle cx="340" cy="111" r="4" /><circle cx="360" cy="111" r="4" /></g>
      <g className="integration-signal-node integration-signal-node-output"><rect x="426" y="48" width="56" height="56" rx="8" /><path d="M442 88l12-12 8 8 14-18" /></g>
      <circle className="integration-signal-anchor" cx="154" cy="75" r="4" /><circle className="integration-signal-anchor" cx="202" cy="37" r="4" /><circle className="integration-signal-anchor" cx="302" cy="37" r="4" /><circle className="integration-signal-anchor" cx="350" cy="111" r="4" />
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
