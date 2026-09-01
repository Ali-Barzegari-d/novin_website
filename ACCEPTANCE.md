# Acceptance and QA contract

## Global quality gates

Every release requires clean install/build, lint, typecheck, unit/integration tests, relevant Playwright journeys, accessibility checks, visual review, security checks, traceability update, and a healthy production-like Compose run.

No release may waive failures involving authorization, privacy, payment correctness, data loss, upload safety, audit integrity, or WCAG keyboard/form completion.

## Automated targets

| Area | Gate |
|---|---|
| Type/lint | zero errors; warnings are reviewed and bounded |
| Unit/integration | all pass; critical domain branches have direct tests |
| E2E | all critical journeys pass on Chromium; smoke on Firefox and WebKit |
| Accessibility | no serious/critical axe violations; keyboard/screen-reader manual checklist passes |
| Responsive | primary journeys complete at 320, 768, 1440 px with no page-level horizontal scroll |
| Lighthouse CI | public pages: accessibility >=95, SEO >=90, best practices >=90; mobile performance target >=85 |
| Web vitals | LCP p75 target <2.5s for public pages; track CLS and INP budgets |
| API | ordinary p95 target <500ms under expected-load rehearsal, excluding external-provider latency |
| Security | no committed secrets; no unresolved critical/high exploitable finding; production-negative config tests pass |
| Reliability | duplicate submission/callback tests create exactly one request/collection outcome |
| Operations | health, migration, backup, restore, rollback and disk/resource checks pass before R5 |

Numeric quality targets do not excuse obvious visual defects or unusable Persian text.

## Critical E2E journeys

- J-01 first request: CTA → OTP → profile/org → problem → optional safe file → review → consent → submit → page/SMS/email preview reference.
- J-02 internal screening: locate/search → read/scan file → note/contact result → qualified/rejected/need info → audit.
- J-03 offer/payment: qualified request → offer → SMS/email link → legal/billing fields → terms → mock online or bank transfer → verify/confirm → receipt.
- J-04 operational completion: session schedule/completion internal transitions → report delivered out-of-band marker → project proposed/archive; customer sees no internal workflow.
- J-05 returning user: OTP login → profile/request list only → new request with prefill.
- Complaints: public submit → tracking reference → admin review/update, without sensitive evidence leakage.
- Account deletion: verified request → session revoke → eligible data anonymized/deleted → retained records remain protected.

## PRD acceptance coverage

The executable test suite must map these product acceptance IDs in `docs/TRACEABILITY.csv`:

| ID | Required proof |
|---|---|
| AC-01 | Iranian mobile, correct OTP/account/login; expiry and attempt ceiling reject |
| AC-02 | no service selection; unique request; page/SMS/email event |
| AC-03 | clean allowed file accepted; invalid/infected rejected with useful Persian error |
| AC-04 | profile/request list only; cross-user access denied |
| AC-05 | admin search/note/contact result and audit |
| AC-06 | private offer with scope/amount/terms/expiry delivered by two channels |
| AC-07 | no public session price; valid offer-only visibility |
| AC-08 | server verify; exactly-once paid transition and receipt |
| AC-09 | bank transfer pending until finance confirmation |
| AC-10 | expired/revoked offer cannot accept/pay |
| AC-11 | legal documents visible and versioned consent before payment |
| AC-12 | approved legal identity/contact in footer/contact; preflight blocks placeholders |
| AC-13 | expert/operations/finance/content/superadmin least privilege and immediate disable |
| AC-14 | complete primary flows at 320 px, correct RTL, no horizontal scroll |
| AC-15 | amount, bank confirmation, refund, and role changes log actor/time/before/after |

## Release-specific exit gates

### R1

- All public routes, Persian copy, CMS preview/publication, SEO/schema/sitemap and required legal routes exist.
- One primary CTA per page; no price on public pages; placeholder/demo content cannot masquerade as real.
- Visual/a11y review at 320/768/1440 and public Lighthouse targets.

### R2

- AUTH, ORG, REQ, FILE, ACC and SCR rows in traceability are implemented/tested.
- All internal roles exist even if only superadmin is seeded.
- Upload/authorization abuse suite and customer-data isolation pass.

### R3

- ORD, PAY and NOT rows are implemented/tested, including Should items.
- Money, consent, offer versioning, bank review, refund recording and callback replay tests pass.
- Real providers may remain gated; mocks are dev-only and contract-equivalent.

### R4

- AC-01..AC-15 pass in production-like demo.
- Evaluator seed/scenario, legal drafts, internal events, retention/deletion, docs and production preflight exist.
- Preflight deliberately fails for each missing external approval/config and explains remediation.

### R5

- Clean Ubuntu-like deployment rehearsal, HTTPS proxy config review, health/smoke, backup/restore checksum, rollback and 30-minute resource soak pass.
- Provider/legal/company/brand gates are either closed with evidence or final status explicitly says blocked for public production.

## Visual review checklist

- Persian glyphs/fonts load; no tofu, bidi reversal, clipped digits or broken identifiers.
- No overlap, hidden focus, sticky obstruction, layout shift, accidental LTR alignment or page scroll.
- Heading ladder, spacing, card density and CTA hierarchy feel deliberate and consistent.
- Form labels persist; errors identify action; entered data survives retry.
- Loading, success, error, empty, expired, unauthorized, retry, OTP, upload and payment states are all designed.
- CMS long copy, missing image, long organization name and maximum reference values reflow safely.
- Reduced motion, zoom 200%, text spacing and keyboard-only completion pass.
- Dev SMS inbox is accessible in dev and absent from production output/DOM.

## Evidence

Store generated reports under ignored `artifacts/` during work and summarize durable evidence in `PROGRESS.md`: command, timestamp, result, environment, screenshot/report path, and release commit. Do not commit large binary reports unless explicitly needed for review.
