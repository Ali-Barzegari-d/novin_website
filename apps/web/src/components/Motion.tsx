'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import type { ReactNode } from 'react';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.25 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string; delay?: number }) {
  return <div className={className}>{children}</div>;
}

export function Pressable({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const interaction = reduce ? {} : { whileHover: { y: -2 }, whileTap: { scale: 0.985 } };
  return <motion.span className={className} {...interaction} transition={{ type: 'spring', stiffness: 520, damping: 32 }}>{children}</motion.span>;
}
