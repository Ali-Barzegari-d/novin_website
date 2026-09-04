'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import type { ReactNode } from 'react';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.25 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: reduce ? 0 : 0.62, delay: reduce ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Pressable({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const interaction = reduce ? {} : { whileHover: { y: -2 }, whileTap: { scale: 0.985 } };
  return <motion.span className={className} {...interaction} transition={{ type: 'spring', stiffness: 520, damping: 32 }}>{children}</motion.span>;
}
