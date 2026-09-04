'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return <motion.div initial={reduce ? false : { opacity: 0.001, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>;
}
