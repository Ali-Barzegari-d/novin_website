type BrandMarkProps = { className?: string };

export function BrandMark({ className = '' }: BrandMarkProps) {
  return (
    <span className={`brand-mark ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 34 34" focusable="false">
        <path d="M5 5h24v8H13v16H5z" fill="currentColor" />
        <path d="M21 21h8v8h-8z" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    </span>
  );
}
