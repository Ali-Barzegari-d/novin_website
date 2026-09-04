'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { productPillars } from '@/lib/content';

const layerColors = ['blue', 'gold', 'teal', 'navy', 'burgundy'] as const;

const layerPaths = [
  'M805 240 C775 240 775 72 755 72 M245 72 C225 72 225 240 195 240',
  'M805 240 C775 240 775 156 755 156 M245 156 C225 156 225 240 195 240',
  'M805 240 H755 M245 240 H195',
  'M805 240 C775 240 775 324 755 324 M245 324 C225 324 225 240 195 240',
  'M805 240 C775 240 775 408 755 408 M245 408 C225 408 225 240 195 240',
] as const;

export function TransformationDiagram() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
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
