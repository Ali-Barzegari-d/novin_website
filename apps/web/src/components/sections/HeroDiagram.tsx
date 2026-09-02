interface SourceMarkProps {
  label: string;
  sublabel: string;
  y: number;
  delay: string;
}

const diagramLabel =
  'تصویرسازی روش کار: نیاز سازمان، قواعد مالی و داده‌های عملیاتی در یک مدل مشترک به فرایند قابل‌اجرا و قابل‌پذیرش تبدیل می‌شوند.';

const mobileSources = [
  ['نیاز سازمان', 'مسئله', 76, '0ms'],
  ['قواعد مالی', 'کنترل', 122, '45ms'],
  ['داده و عملیات', 'ثبت', 168, '90ms']
] as const satisfies readonly (readonly [string, string, number, string])[];

function DesktopSourceMark({ label, sublabel, y, delay }: SourceMarkProps) {
  return (
    <g className="hero-diagram__source" style={{ animationDelay: delay }}>
      <circle cx="385" cy={y} r="4" fill="var(--color-accent)" />
      <path d={`M377 ${y}H330`} fill="none" stroke="var(--color-border)" strokeWidth="1" />
      <text
        x="448"
        y={y - 5}
        textAnchor="middle"
        direction="rtl"
        className="hero-diagram__source-label"
      >
        {label}
      </text>
      <text
        x="448"
        y={y + 14}
        textAnchor="middle"
        direction="rtl"
        className="hero-diagram__source-detail"
      >
        {sublabel}
      </text>
    </g>
  );
}

function DesktopDiagram() {
  return (
    <svg
      className="hero-diagram__canvas hero-diagram__desktop"
      viewBox="0 0 520 480"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <g className="hero-diagram__frame" fill="none" stroke="var(--color-border)" strokeWidth="1">
        <path d="M28 72V28H72M448 28H492V72M492 408V452H448M72 452H28V408" />
        <path d="M28 96H38M28 120H34M482 360H492M486 384H492" />
      </g>

      <g
        className="hero-diagram__connection"
        fill="none"
        stroke="var(--color-accent)"
        strokeLinecap="round"
      >
        <path d="M377 115H332Q296 115 296 153V205" />
        <path d="M377 181H354Q329 181 329 205H314" />
        <path d="M377 247H360Q331 247 314 234" />
        <path d="M198 246H174Q140 246 140 280V306" strokeWidth="2" />
      </g>

      <DesktopSourceMark label="نیاز سازمان" sublabel="مسئله و ذی‌نفعان" y={115} delay="0ms" />
      <DesktopSourceMark label="قواعد مالی" sublabel="کنترل و انطباق" y={181} delay="45ms" />
      <DesktopSourceMark label="داده و عملیات" sublabel="رویداد و ثبت" y={247} delay="90ms" />

      <g className="hero-diagram__model" aria-hidden="true">
        <path
          d="m174 141 91-45 88 49-89 47z"
          fill="var(--color-surface-raised)"
          stroke="var(--color-border)"
        />
        <path
          d="m174 160 91-45 88 49-89 47z"
          fill="var(--color-surface)"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
        />
        <path d="M198 199H323V291H198z" fill="var(--color-primary)" />
        <path
          d="M218 219H303M218 231H273"
          stroke="var(--color-text-on-primary)"
          strokeOpacity="0.42"
        />
        <text x="260" y="267" textAnchor="middle" className="hero-diagram__model-label">
          مدل مشترک
        </text>
      </g>

      <g className="hero-diagram__outcome" aria-hidden="true">
        <path d="M54 330H260V434H54z" fill="var(--color-paper)" stroke="var(--color-border)" />
        <path
          d="M66 317H272V421H66z"
          fill="var(--color-surface)"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
        />
        <path d="M88 339H247M88 391H204M88 404H174" stroke="var(--color-border)" />
        <path
          d="m230 388 7 7 14-18"
          fill="none"
          stroke="var(--color-success)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="167" y="372" textAnchor="middle" className="hero-diagram__outcome-label">
          فرایند قابل اجرا
        </text>
      </g>

      <g className="hero-diagram__acceptance" aria-hidden="true">
        <path d="M347 352H425" stroke="var(--color-highlight)" strokeWidth="1.5" />
        <text x="386" y="374" textAnchor="middle" className="hero-diagram__acceptance-label">
          قابل آزمون
        </text>
        <text x="386" y="395" textAnchor="middle" className="hero-diagram__acceptance-detail">
          قابل پیگیری
        </text>
      </g>

      <text x="83" y="113" textAnchor="middle" className="hero-diagram__note">
        طرح روش
      </text>
      <path
        d="M83 128V165M78 157l5 8 5-8"
        fill="none"
        stroke="var(--color-text-muted)"
        strokeWidth="1"
      />
    </svg>
  );
}

function MobileDiagram() {
  return (
    <svg
      className="hero-diagram__canvas hero-diagram__mobile"
      viewBox="0 0 360 420"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <g className="hero-diagram__frame" fill="none" stroke="var(--color-border)" strokeWidth="1">
        <path d="M18 42V18H42M318 18H342V42M342 378V402H318M42 402H18V378" />
      </g>

      <g
        className="hero-diagram__connection"
        fill="none"
        stroke="var(--color-accent)"
        strokeLinecap="round"
      >
        <path d="M225 76H205Q197 76 197 112V149" />
        <path d="M225 122H205Q202 122 202 149" />
        <path d="M225 168H224Q207 168 202 158" />
        <path d="M117 181H95Q72 181 72 211V258" strokeWidth="2" />
      </g>

      {mobileSources.map(([label, sublabel, y, delay]) => (
        <g key={label} className="hero-diagram__source" style={{ animationDelay: delay }}>
          <circle cx="225" cy={y} r="3.5" fill="var(--color-accent)" />
          <text
            x="290"
            y={y - 4}
            textAnchor="middle"
            direction="rtl"
            className="hero-diagram__source-label"
          >
            {label}
          </text>
          <text
            x="290"
            y={y + 12}
            textAnchor="middle"
            direction="rtl"
            className="hero-diagram__source-detail"
          >
            {sublabel}
          </text>
        </g>
      ))}

      <g className="hero-diagram__model" aria-hidden="true">
        <path
          d="m94 94 70-35 67 37-68 36z"
          fill="var(--color-surface-raised)"
          stroke="var(--color-border)"
        />
        <path
          d="m94 108 70-35 67 37-68 36z"
          fill="var(--color-surface)"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
        />
        <path d="M117 145H211V213H117z" fill="var(--color-primary)" />
        <path
          d="M134 162H194M134 173H176"
          stroke="var(--color-text-on-primary)"
          strokeOpacity="0.42"
        />
        <text x="164" y="193" textAnchor="middle" className="hero-diagram__model-label">
          مدل مشترک
        </text>
      </g>

      <g className="hero-diagram__outcome" aria-hidden="true">
        <path d="M39 282H206V369H39z" fill="var(--color-paper)" stroke="var(--color-border)" />
        <path
          d="M50 270H217V357H50z"
          fill="var(--color-surface)"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
        />
        <path d="M68 289H199M68 328H163M68 339H142" stroke="var(--color-border)" />
        <path
          d="m177 325 6 6 12-15"
          fill="none"
          stroke="var(--color-success)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="133" y="314" textAnchor="middle" className="hero-diagram__outcome-label">
          فرایند قابل اجرا
        </text>
      </g>

      <g className="hero-diagram__acceptance" aria-hidden="true">
        <path d="M246 298H312" stroke="var(--color-highlight)" strokeWidth="1.5" />
        <text x="279" y="320" textAnchor="middle" className="hero-diagram__acceptance-label">
          پذیرش روشن
        </text>
        <text x="279" y="339" textAnchor="middle" className="hero-diagram__acceptance-detail">
          قابل پیگیری
        </text>
      </g>
    </svg>
  );
}

export function HeroDiagram({ className }: { className?: string }) {
  return (
    <figure
      role="img"
      aria-label={diagramLabel}
      className={['hero-diagram', className].filter(Boolean).join(' ')}
    >
      <style>{`
        .hero-diagram { display: block; margin: 0; color: var(--color-text-primary); }
        .hero-diagram__canvas { display: block; width: 100%; height: auto; font-family: var(--font-body); }
        .hero-diagram__mobile { display: none; }
        .hero-diagram__source-label { fill: var(--color-text-primary); font-size: 15px; font-weight: 650; }
        .hero-diagram__source-detail, .hero-diagram__note { fill: var(--color-text-muted); font-size: 11px; }
        .hero-diagram__model-label { fill: var(--color-text-on-primary); font-size: 17px; font-weight: 700; }
        .hero-diagram__outcome-label { fill: var(--color-text-primary); font-size: 20px; font-weight: 700; }
        .hero-diagram__acceptance-label { fill: var(--color-highlight); font-size: 12px; font-weight: 650; }
        .hero-diagram__acceptance-detail { fill: var(--color-text-muted); font-size: 12px; }
        .hero-diagram__source, .hero-diagram__model, .hero-diagram__outcome, .hero-diagram__acceptance { transform-box: fill-box; transform-origin: center; }
        @media (max-width: 699px) {
          .hero-diagram__desktop { display: none; }
          .hero-diagram__mobile { display: block; }
          .hero-diagram__source-label { font-size: 14px; }
          .hero-diagram__source-detail, .hero-diagram__note { font-size: 10px; }
          .hero-diagram__model-label { font-size: 17px; }
          .hero-diagram__outcome-label { font-size: 18px; }
          .hero-diagram__acceptance-label, .hero-diagram__acceptance-detail { font-size: 11px; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .hero-diagram__connection path { stroke-dasharray: 1; stroke-dashoffset: 1; animation: hero-diagram-draw 200ms cubic-bezier(0.16, 1, 0.3, 1) both; }
          .hero-diagram__source { animation: hero-diagram-enter 180ms cubic-bezier(0.16, 1, 0.3, 1) both; }
          .hero-diagram__model { animation: hero-diagram-enter 220ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both; }
          .hero-diagram__outcome { animation: hero-diagram-enter 200ms cubic-bezier(0.16, 1, 0.3, 1) 120ms both; }
          .hero-diagram__acceptance { animation: hero-diagram-enter 180ms cubic-bezier(0.16, 1, 0.3, 1) 140ms both; }
          @keyframes hero-diagram-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
          @keyframes hero-diagram-enter { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        }
      `}</style>
      <DesktopDiagram />
      <MobileDiagram />
      <figcaption className="sr-only">{diagramLabel}</figcaption>
    </figure>
  );
}
