'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { processSteps } from '@/lib/content';

export function TrustJourney() {
  const reduce = useReducedMotion();
  const steps = processSteps.slice(0, 4);
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : 0.11, delayChildren: reduce ? 0 : 0.12 } }
  };
  const item = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.985 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 270, damping: 25 } }
  };

  return (
    <motion.section
      className="trust-journey"
      aria-labelledby="trust-journey-title"
      initial={reduce ? false : { opacity: 0, y: 34 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.72, delay: reduce ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      <header>
        <div>
          <span className="eyebrow">مسیر همکاری قابل پیش‌بینی</span>
          <h2 id="trust-journey-title">از نخستین تماس تا تصمیم برای ادامه</h2>
        </div>
        <p><i /> هیچ داده محرمانه‌ای در شروع لازم نیست.</p>
      </header>
      <motion.ol variants={container} initial="hidden" animate="visible">
        {steps.map(([title, text], index) => (
          <motion.li key={title} variants={item} {...(reduce ? {} : { whileHover: { y: -5 } })} transition={{ type: 'spring', stiffness: 360, damping: 25 }}>
            <span>{new Intl.NumberFormat('fa-IR', { minimumIntegerDigits: 2 }).format(index + 1)}</span>
            <div><strong>{title}</strong><small>{text}</small></div>
          </motion.li>
        ))}
      </motion.ol>
    </motion.section>
  );
}
