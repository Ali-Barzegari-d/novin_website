'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useId, useState } from 'react';
import { productPillars } from '@/lib/content';

const layerColors = ['blue', 'gold', 'teal', 'navy', 'burgundy'] as const;

const layerPaths = [
  'M805 240 C755 240 750 72 690 72 H310 C260 72 255 240 220 240',
  'M805 240 C755 240 750 156 690 156 H310 C260 156 255 240 220 240',
  'M805 240 H220',
  'M805 240 C755 240 750 324 690 324 H310 C260 324 255 240 220 240',
  'M805 240 C755 240 750 408 690 408 H310 C260 408 255 240 220 240',
] as const;

export function TransformationDiagram() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const arrowId = useId().replace(/:/g, '');
  const activeLayer = productPillars[active];

  return (
    <div className="system-map">
      <p className="sr-only">
        نقشه مفهومی تبدیل مسئله سازمانی با بررسی هم‌زمان پنج لایه مالی، فرایند، داده، سامانه و محصول به یک تصمیم قابل اجرا.
      </p>

      <header className="map-head">
        <div>
          <span>مدل تصمیم</span>
          <h3>پنج زاویه تحلیل، یک مسیر روشن برای اجرا</h3>
        </div>
        <p><i />نمایش مفهومی؛ بدون داده واقعی مشتری</p>
      </header>

      <div className="map-stage">
        <svg className="map-flow" viewBox="0 0 1000 480" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <marker id={arrowId} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto">
              <path d="M1 1 11 6 1 11Z" />
            </marker>
          </defs>
          {layerPaths.map((path, index) => (
            <motion.path
              key={path}
              d={path}
              className={`map-path map-path-${layerColors[index]}${active === index ? ' is-active' : ''}`}
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: active === index ? 1 : 0.3 }}
              animate={{ opacity: active === index ? 1 : 0.3 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: reduceMotion ? 0 : 0.9, delay: reduceMotion ? 0 : index * 0.07, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
          <motion.path
            d="M220 240 H176"
            className="map-exit"
            markerEnd={`url(#${arrowId})`}
            initial={reduceMotion ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.65 }}
          />
        </svg>

        <div className="map-origin">
          <span>ورودی</span>
          <strong>مسئله سازمانی</strong>
          <p>ابهام در عدد، فرایند، داده یا سامانه</p>
        </div>

        <div className="map-layers" role="group" aria-label="لایه‌های تحلیل مسئله">
          {productPillars.map(([title, text], index) => (
            <motion.button
              key={title}
              type="button"
              className={`map-layer map-layer-${layerColors[index]}`}
              aria-pressed={active === index}
              onClick={() => setActive(index)}
              onPointerEnter={() => setActive(index)}
              whileHover={reduceMotion ? {} : { x: -4 }}
              whileTap={reduceMotion ? {} : { scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            >
              <span>{new Intl.NumberFormat('fa-IR', { minimumIntegerDigits: 2 }).format(index + 1)}</span>
              <strong>{title}</strong>
              <small>{text}</small>
              <i aria-hidden="true" />
            </motion.button>
          ))}
        </div>

        <div className="map-outcome">
          <span>خروجی</span>
          <strong>تصمیم قابل اجرا</strong>
          <ul>
            <li>مرز روشن</li>
            <li>مالک مشخص</li>
            <li>معیار قابل سنجش</li>
          </ul>
        </div>
      </div>

      <div className="map-reading" aria-live="polite">
        <span>لایه فعال</span>
        <strong>{activeLayer?.[0]}</strong>
        <p>{activeLayer?.[1]}</p>
      </div>
    </div>
  );
}
