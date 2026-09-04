'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useId, useState } from 'react';
import { productPillars } from '@/lib/content';

export function TransformationDiagram({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const markerId = useId().replace(/:/g, '');
  return (
    <div className={compact ? 'system-map compact' : 'system-map'}>
      <p className="sr-only">چرخه مفهومی تبدیل مسئله سازمانی از تحلیل مالی، فرایند، داده و سامانه به محصول قابل اجرا.</p>
      <div className="map-canvas" aria-hidden="true">
        <svg viewBox="0 0 720 380">
          <defs><marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="currentColor"/></marker></defs>
          <motion.path className="map-loop" d="M620 110C690 210 625 318 490 326H183C65 326 27 207 95 121" fill="none" markerEnd={`url(#${markerId})`} initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: .45 }} transition={{ duration: reduce ? 0 : 1.4, ease: [0.16, 1, 0.3, 1] }}/>
          <motion.path className="map-link" d="M602 117H495L432 204H337L275 117H171L111 204" fill="none" initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: .45 }} transition={{ duration: reduce ? 0 : 1.1, delay: .18, ease: [0.16, 1, 0.3, 1] }}/>
          {[0,1,2,3,4,5].map((index) => {
            const positions = [[602,117],[495,117],[432,204],[337,204],[275,117],[171,117]];
            const [cx, cy] = positions[index]!;
            return <motion.circle key={index} cx={cx} cy={cy} r={active === index ? 13 : 8} className={`map-dot map-dot-${index}${active === index ? ' active' : ''}`} animate={{ r: active === index ? 13 : 8 }} transition={{ type: 'spring', stiffness: 420, damping: 26 }}/>;
          })}
          <g className="map-bars"><path d="M458 180v-35m14 35v-52m14 52v-70"/><path d="M205 90h54v38h-54zM216 105h32M216 116h22"/><circle cx="337" cy="204" r="25"/><path d="m327 204 8 8 14-18"/></g>
        </svg>
        <span className="map-tag tag-problem">مسئله</span><span className="map-tag tag-finance">مالی</span><span className="map-tag tag-process">فرایند</span><span className="map-tag tag-data">داده</span><span className="map-tag tag-system">سامانه</span><span className="map-tag tag-result">محصول قابل اجرا</span>
        <div className="map-mobile-legend">
          {['مسئله', 'مالی', 'فرایند', 'داده', 'سامانه', 'محصول قابل اجرا'].map((label) => <span key={label}>{label}</span>)}
        </div>
      </div>
      {!compact && <div className="map-controls" role="group" aria-label="لایه‌های تحلیل">
        {productPillars.map(([title, text], index) => <button key={title} type="button" aria-pressed={active === index} onClick={() => setActive(index)} onPointerEnter={() => setActive(index)}><span>{title}</span><small>{text}</small></button>)}
      </div>}
      {!compact && <p className="map-active-detail" aria-live="polite"><strong>{productPillars[active]?.[0]}</strong><span>{productPillars[active]?.[1]}</span></p>}
      {!compact && <p className="map-caption"><span className="status-dot"/>این نقشه یک نمایش مفهومی است؛ نه داده واقعی مشتری.</p>}
    </div>
  );
}
