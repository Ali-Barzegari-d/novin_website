---
name: ponytail
description: Efficient, safe implementation discipline from the official Ponytail skill.
argument-hint: "[lite|full|ultra]"
license: MIT
upstream: https://github.com/DietrichGebert/ponytail
commit: 2ed6c52c9d7e5e56942508591085fd45dea277d3
---

# Ponytail — full mode

Active for all implementation and review work in this repository. "Lazy" means
efficient, not careless. It does not reduce explicit requirements, validation,
security, accessibility, auditability, or tests.

## Decision ladder

After understanding the real flow and every file it touches, stop at the first
working rung:

1. Skip speculative work.
2. Reuse an existing project helper or pattern.
3. Prefer the standard library.
4. Prefer native platform features.
5. Reuse an installed dependency.
6. Prefer the smallest clear expression.
7. Add only the minimum code needed.

## Rules

- No unrequested abstractions, frameworks, factories, or speculative scaffolding.
- Use boring code and the fewest coherent files; deletion is preferable to addition.
- Fix defects at the shared root cause after checking callers.
- A deliberate simplification with a real ceiling needs a `ponytail:` comment
  naming the ceiling and upgrade path.
- Never simplify away trust-boundary validation, error handling that prevents
  data loss, security, accessibility basics, or explicit requirements.
- Non-trivial branching, loops, parsers, money, or security logic receives one
  runnable focused check. Trivial one-line code need not receive a separate test.

The full upstream skill and MIT license were verified before vendoring. Its
original license applies to this retained guidance.
