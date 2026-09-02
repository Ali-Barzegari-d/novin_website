'use client';

import { useId } from 'react';

type NodeVariant = 'input' | 'core' | 'output';
type DiagramNode = readonly [
  id: string,
  label: string,
  sublabel: string,
  x: number,
  y: number,
  width: number,
  height: number,
  variant: NodeVariant,
  delay: number
];
type DiagramEdge = readonly [
  id: string,
  d: string,
  variant: Extract<NodeVariant, 'input' | 'output'>,
  delay: number,
  label?: string,
  labelX?: number,
  labelY?: number
];

const desktopNodes = [
  ['public', 'نهادهای دولتی', 'و عمومی', 450, 50, 170, 66, 'input', 40],
  ['private', 'کسب‌وکارهای', 'خصوصی', 450, 224, 170, 66, 'input', 120],
  ['core', 'تحلیل مالی', 'نوین ایرانیان', 220, 116, 190, 108, 'core', 260],
  ['output', 'گزارش تحلیلی', 'و راه‌حل اجرایی', 20, 137, 165, 66, 'output', 510]
] as const satisfies readonly DiagramNode[];

const desktopEdges = [
  ['public-core', 'M450 83C431 83 429 138 410 151', 'input', 150],
  ['private-core', 'M450 257C431 257 429 202 410 189', 'input', 230],
  ['core-output', 'M220 170C207 170 198 170 185 170', 'output', 410, 'پیشنهاد + قرارداد', 202, 150]
] as const satisfies readonly DiagramEdge[];

const mobileNodes = [
  ['public', 'نهادهای دولتی', 'و عمومی', 195, 28, 145, 66, 'input', 40],
  ['private', 'کسب‌وکارهای', 'خصوصی', 20, 28, 145, 66, 'input', 120],
  ['core', 'تحلیل مالی', 'نوین ایرانیان', 85, 145, 190, 96, 'core', 260],
  ['output', 'گزارش تحلیلی', 'و راه‌حل اجرایی', 96, 306, 168, 66, 'output', 510]
] as const satisfies readonly DiagramNode[];

const mobileEdges = [
  ['public-core', 'M268 94C268 116 244 125 225 145', 'input', 150],
  ['private-core', 'M92 94C92 116 116 125 135 145', 'input', 230],
  ['core-output', 'M180 241C180 264 180 283 180 306', 'output', 410]
] as const satisfies readonly DiagramEdge[];

const diagramLabel =
  'نمودار فرایند همکاری: نهادهای دولتی و عمومی و کسب‌وکارهای خصوصی، از طریق تحلیل مالی نوین ایرانیان، به گزارش تحلیلی و راه‌حل اجرایی می‌رسند.';

function DiagramCanvas({
  mode,
  viewBox,
  nodes,
  edges,
  instanceId
}: {
  mode: 'desktop' | 'mobile';
  viewBox: string;
  nodes: readonly DiagramNode[];
  edges: readonly DiagramEdge[];
  instanceId: string;
}) {
  const accentArrowId = `hero-diagram-accent-arrow-${mode}-${instanceId}`;
  const successArrowId = `hero-diagram-success-arrow-${mode}-${instanceId}`;

  return (
    <svg
      className={`hero-diagram__canvas hero-diagram__${mode}`}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <marker
          id={accentArrowId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0L10 5L0 10Z" fill="var(--color-accent)" />
        </marker>
        <marker
          id={successArrowId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0L10 5L0 10Z" fill="var(--color-success)" />
        </marker>
      </defs>

      {mode === 'desktop' ? (
        <g aria-hidden="true">
          <path
            d="M630 170H635"
            stroke="var(--color-border)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          <path d="M5 170H10" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 4" />
        </g>
      ) : null}

      <g aria-hidden="true">
        {edges.map(([id, d, variant, delay, label, labelX, labelY]) => {
          const isOutput = variant === 'output';
          const stroke = isOutput ? 'var(--color-success)' : 'var(--color-accent)';
          const markerEnd = `url(#${isOutput ? successArrowId : accentArrowId})`;
          return (
            <g key={id}>
              <path
                d={d}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d={d}
                fill="none"
                stroke={stroke}
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength="1"
                markerEnd={markerEnd}
                className="hero-diagram__flow"
                style={{ animationDelay: `${delay}ms` }}
              />
              {label ? (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fill="var(--color-text-muted)"
                  className="hero-diagram__edge-label"
                  style={{ animationDelay: `${delay + 170}ms` }}
                >
                  {label}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>

      <g aria-hidden="true">
        {nodes.map(([id, label, sublabel, x, y, width, height, variant, delay]) => {
          const centerX = x + width / 2;
          const centerY = y + height / 2;
          const isCore = variant === 'core';
          const isOutput = variant === 'output';
          const fill = isCore ? 'var(--color-primary)' : 'var(--color-surface-raised)';
          const stroke = isCore
            ? 'var(--color-accent)'
            : isOutput
              ? 'var(--color-success)'
              : 'var(--color-border)';
          const labelFill = isCore ? 'var(--color-text-on-primary)' : 'var(--color-text-primary)';
          const sublabelFill = isCore ? 'var(--color-text-on-primary)' : 'var(--color-text-muted)';
          return (
            <g
              key={id}
              className={`hero-diagram__node hero-diagram__node--${variant}`}
              style={{ animationDelay: `${delay}ms` }}
            >
              {isCore ? (
                <rect
                  x={x - 8}
                  y={y - 8}
                  width={width + 16}
                  height={height + 16}
                  rx="16"
                  fill="var(--color-primary-subtle)"
                  opacity="0.85"
                />
              ) : null}
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={isCore ? '16' : '12'}
                fill={fill}
                stroke={stroke}
                strokeWidth={isCore ? '2' : '1.5'}
              />
              {isCore ? (
                <path
                  d={`M${x + 20} ${y + 26}H${x + width - 20}`}
                  stroke="var(--color-text-on-primary)"
                  strokeOpacity="0.28"
                  strokeWidth="1"
                />
              ) : null}
              {isOutput ? (
                <circle cx={x + width - 18} cy={y + 18} r="4" fill="var(--color-success)" />
              ) : null}
              <text
                x={centerX}
                y={centerY - 5}
                textAnchor="middle"
                fill={labelFill}
                className="hero-diagram__node-label"
              >
                {label}
              </text>
              <text
                x={centerX}
                y={centerY + 16}
                textAnchor="middle"
                fill={sublabelFill}
                fillOpacity={isCore ? '0.74' : '1'}
                className="hero-diagram__node-sublabel"
              >
                {sublabel}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export function HeroDiagram({ className }: { className?: string }) {
  const instanceId = useId().replace(/:/g, '');
  return (
    <figure
      role="img"
      aria-label={diagramLabel}
      className={['hero-diagram', className].filter(Boolean).join(' ')}
    >
      <style>{`
        .hero-diagram { display: block; margin: 0; color: var(--color-text-primary); }
        .hero-diagram__canvas { display: block; width: 100%; height: auto; overflow: visible; font-family: var(--font-body); }
        .hero-diagram__mobile { display: none; }
        .hero-diagram__node { transform-box: fill-box; transform-origin: center; }
        .hero-diagram__node-label { font-size: 15px; font-weight: 650; }
        .hero-diagram__node-sublabel { font-size: 11px; font-weight: 400; }
        .hero-diagram__edge-label { font-size: 10px; font-weight: 500; }
        @media (max-width: 699px) {
          .hero-diagram__desktop { display: none; }
          .hero-diagram__mobile { display: block; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .hero-diagram__node { animation: hero-diagram-node-enter 420ms cubic-bezier(0.16, 1, 0.3, 1) both; }
          .hero-diagram__flow { stroke-dasharray: 1; stroke-dashoffset: 1; animation: hero-diagram-flow 560ms cubic-bezier(0.16, 1, 0.3, 1) both; }
          .hero-diagram__edge-label { animation: hero-diagram-label-enter 220ms ease-out both; }
          @keyframes hero-diagram-node-enter { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes hero-diagram-flow { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
          @keyframes hero-diagram-label-enter { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
        }
      `}</style>
      <DiagramCanvas
        mode="desktop"
        viewBox="0 0 640 340"
        nodes={desktopNodes}
        edges={desktopEdges}
        instanceId={instanceId}
      />
      <DiagramCanvas
        mode="mobile"
        viewBox="0 0 360 400"
        nodes={mobileNodes}
        edges={mobileEdges}
        instanceId={instanceId}
      />
      <figcaption className="sr-only">{diagramLabel}</figcaption>
    </figure>
  );
}
