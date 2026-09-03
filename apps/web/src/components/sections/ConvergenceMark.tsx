/**
 * Decorative convergence mark for the "problems we solve" aside: scattered
 * signals on the right gather into one measured line on the left — the
 * section's promise (از پراکندگی تا یک تصویر واحد) without any text inside
 * SVG. Hairline trajectories, 4px dots in the categorical diagram colors.
 * Purely supplementary; the adjacent copy carries the meaning.
 */
export function ConvergenceMark() {
  return (
    <svg className="convergence-mark" viewBox="0 0 360 96" aria-hidden="true" focusable="false">
      {/* Converging trajectories: scattered (right) → one line (left). */}
      <path className="convergence-thread" d="M352 14C280 14 232 26 170 46" />
      <path className="convergence-thread" d="M352 34C292 34 244 38 176 48" />
      <path className="convergence-thread" d="M352 62C300 62 250 58 182 50" />
      <path className="convergence-thread" d="M352 82C286 82 236 70 176 52" />
      {/* One measured line to the terminus. */}
      <path className="convergence-main" d="M170 48H36" />
      <path className="convergence-cap" d="M36 48l8-5v10z" />
      {/* Scattered source dots. */}
      <circle className="convergence-dot" cx="352" cy="14" r="4" fill="#12a094" />
      <circle className="convergence-dot" cx="352" cy="34" r="4" fill="#0a66c2" />
      <circle className="convergence-dot" cx="352" cy="62" r="4" fill="#a0325c" />
      <circle className="convergence-dot" cx="352" cy="82" r="4" fill="#b7791f" />
      {/* Shared-problem node where the threads meet. */}
      <circle className="convergence-joint" cx="170" cy="48" r="6" />
    </svg>
  );
}
