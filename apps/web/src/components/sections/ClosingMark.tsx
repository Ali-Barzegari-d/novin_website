/**
 * Closing mark: a long, quiet diagonal arrow (reading direction) with a
 * diamond tail echoing the principle diamonds in the hero. Replaces the
 * oversized "↙" text glyph. Decorative only.
 */
export function ClosingMark() {
  return (
    <svg className="closing-mark-art" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      <path className="closing-mark-line" d="M84 12L22 74" />
      <path className="closing-mark-head" d="M20 52v24h24" />
      <rect className="closing-mark-tail" x="78" y="6" width="9" height="9" transform="rotate(45 82.5 10.5)" />
    </svg>
  );
}
