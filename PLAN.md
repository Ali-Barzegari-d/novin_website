# Autonomous implementation plan

## Outcome

Produce the complete MVP defined by PRD v1.0, with a polished Persian RTL public website and real end-to-end product flows. Development and demo must work without external credentials. Production must fail closed until the listed legal, identity, provider, and infrastructure gates are satisfied.

## R0 — Baseline and decisions

Deliver:

- Initialize Git and make the baseline commit.
- Install/activate Ponytail `full` and UI UX Pro Max; record provenance.
- Create pnpm workspace, strict TypeScript, lint/format/typecheck, dependency policy, `.gitignore`, `.editorconfig`, runtime pinning, and initial ADRs.
- Pin the web/API/database/test stack after checking current official support.
- Scaffold `apps/web`, `apps/api`, shared contract/db packages, Compose, Dockerfiles, scripts, and GitHub Actions.
- Convert every PRD Must/Should and AC/NFR into `docs/TRACEABILITY.csv` rows with planned test IDs.
- Implement typed configuration with environment validation and provider mode restrictions.
- Create database schema/migrations and synthetic Persian seed factories.
- Establish design tokens and render a static `/design-preview` route in dev only.
- Implement health/readiness endpoints and structured logging baseline.

Gate:

- `make bootstrap`, `make lint`, `make typecheck`, and a minimal test suite pass.
- Compose config validates; no public service except 3050.
- No secret or proprietary asset is committed.

Commit: `chore(repo): establish product baseline`

## R1 — Corporate website

Deliver:

- Public routes from PRD section 7: home, public/private solutions, capabilities, process, initial assessment, projects, case study, about, contact, terms, privacy, cancellation, and complaints.
- Header/footer, mobile navigation, global request CTA, organization structured data, metadata, canonical URLs, sitemap, robots, social cards, and 404/500 states.
- Internal CMS for pages, case studies, clients, team, legal pages, publication approval, revisions, preview, and ordering.
- Homepage composition exactly follows PRD 8.1. Public/private problem pages follow 8.2/8.3. No public session price.
- Formal modern design system from `DESIGN.md`; original abstract workflow/geometric visual language.
- Dev-only Kavenegar mock inbox fixed bottom-left and clearly labeled.
- Public complaint form with anti-abuse controls and tracking reference.
- Company/legal placeholders remain conspicuous and block production preflight.

QA:

- Route/content contract tests, CMS authorization tests, metadata/SEO checks.
- Axe and keyboard pass; no horizontal scroll at 320 px.
- Playwright screenshots for all primary public routes at 320/768/1440.
- Lighthouse CI targets from `ACCEPTANCE.md`; LCP budget checked on the home page.
- Verify all client/team/case-study content is synthetic/unpublished unless approved.

Commit: `feat(r1): deliver corporate website`

## R2 — Identity, profile, request intake, and screening

Deliver:

- Iranian mobile normalization, 6-digit OTP, resend/attempt/rate rules, generic responses, secure sessions, logout, consent versioning.
- Customer onboarding fields, one active organization UI, representation attestation, profile edit, and verified-number change flow.
- Single-column request wizard: profile prefill, title, free problem description, organization type, confidentiality warning/consent, optional file, review, submit.
- Idempotent request submission and non-sequential public tracking reference.
- Private upload quarantine, MIME sniffing, safe filename, 10 MB/allowlist config, ClamAV scan, authorized download, and retention metadata.
- Customer account with profile and request number/title/date only. Never expose internal status or notes.
- Internal request list/search/filter, detail, notes, screening outcomes, state transitions, assignment, audit, and permission-aware CSV export.
- All required roles/RBAC; seed only the first superadmin. TOTP enrollment and sensitive-operation re-authentication.
- SMS/email outbox events for request submission; mocks for dev.

QA:

- Unit tests for normalization, OTP expiry/attempts, state transitions, and public reference generation.
- Integration tests for tenant/ownership isolation, RBAC matrix, idempotency, consent immutability, upload quarantine, ClamAV failure, and session revocation.
- E2E J-01, J-02, J-05 on mobile/desktop, including offline/double-click and all UI states.
- Upload abuse suite: double extension, forged MIME, macro/archive/executable, oversized, EICAR, path traversal, auth bypass.

Commit: `feat(r2): deliver request intake`

## R3 — Offers, orders, payments, receipts, and notifications

Deliver:

- Create offers only from QUALIFIED requests; title, scope, deliverable, duration, timing, expert mix, base/tax/total, 7-day default expiry, cancellation terms, and session-fee deduction rule.
- Version offers; immutable history; secure hashed tokens; view, revoke, expire, accept, and replace unpaid offers.
- Organization legal/billing completion before payment.
- Versioned consent with offer/terms/IP/time; no marketing clutter on offer/payment pages.
- Order creation and payment-attempt ledger.
- Dev-only online payment provider with redirect/callback/verify semantics identical to the future real adapter; replay-safe callback handling.
- Manual bank transfer form, optional scanned receipt, financial review, confirm/reject, and audit.
- Simple receipt view/download and mock email delivery.
- Full/partial refund records with reason/reference/audit; no automatic provider refund in this version.
- Admin notification templates, versioning, delivery status, bounded retry, and manual resend.
- Optional invoice links for later project milestones (PRD Should) using the same order/payment model.

QA:

- Money/property tests in integer IRR; server ignores client-supplied totals.
- Offer token entropy/storage/expiry/revocation tests.
- Payment success, failure, cancel, unknown, repeated callback, invalid signature, amount mismatch, verify failure, and concurrent callback tests.
- Bank transfer submit/reject/confirm and authorization tests.
- E2E J-03 plus receipt and notification flows.

Commit: `feat(r3): deliver offers and payments`

## R4 — Licensing and production-preflight readiness

Deliver:

- Evaluator demo scenario with synthetic account, request, valid/expired/revoked offers, successful/failed mock payment, bank transfer, roles, and complaint.
- Versioned draft legal content, explicit draft banners, acceptance records, company identity placeholders, and license-badge slots hidden until approved.
- Production preflight command that checks every gate in `DECISIONS.md` and exits nonzero with owner/remediation.
- Privacy-safe internal funnel events and admin operational reporting; no external analytics.
- Account deletion/anonymization request workflow and configurable retention jobs with dry-run/report mode.
- Complete OpenAPI, admin/operator runbook, data dictionary, authorization matrix, and evaluator guide.
- Security headers/CSP, dependency/secret scan, threat model review, and abuse testing.

QA:

- Full PRD acceptance suite AC-01..AC-15.
- Legal/identity/preflight tests prove placeholder/mock configurations cannot pass production.
- End-to-end evaluator journey without exposing another customer's data.
- Accessibility, content language, RTL, SEO, and browser matrix regression.

Commit: `feat(r4): deliver licensing readiness`

## R5 — Production operations and release

Deliver:

- Production multi-stage images running as non-root with health checks and resource limits.
- Bind-mount initialization/ownership, migration discipline, startup order, graceful shutdown, log rotation, and disk monitoring.
- Host Nginx configuration for `karafintech.ir`, HTTPS-only, proxy to `127.0.0.1:3050`, request limits, secure headers, and canonical redirects.
- `make deploy`: fetch/pull policy, encrypted pre-migration backup, build, migrate, restart, health/smoke verification, and automatic application rollback where safe.
- `make rollback`: select last known-good app image/version; never reverse an irreversible DB migration blindly.
- Daily encrypted backups, 7 daily/4 weekly retention, restore command, and documented restore drill.
- Self-hosted structured error monitoring/admin error view, readiness and liveness, bounded alert integration, incident/rollback runbooks.
- GitHub Actions required checks and protected-release documentation.
- 30-minute resource/health soak on the 4 GB budget.

QA:

- Clean server rehearsal from documented prerequisites.
- Docker health, public smoke, provider config validation, migration, backup/restore checksum, and rollback rehearsal.
- Final Playwright/a11y/visual/security suites against production-like Compose.
- Go/No-Go review and traceability coverage report.

Commit: `feat(r5): deliver production operations`

If external gates remain, make this commit only for the completed operational implementation and label the final report `R5 BLOCKED FOR PUBLIC PRODUCTION`. Never deploy mock providers to the public domain.

## Required synthetic seed

- Superadmin pending TOTP enrollment; separate test-only role accounts for expert, operations, finance, and content.
- One synthetic customer and one synthetic organization.
- Requests in submitted, under-review, qualified, rejected, and archived states.
- Valid, expired, revoked, and paid offers.
- Mock payment success/failure and bank transfer pending/confirmed/rejected.
- Draft/published legal content, placeholder company facts, synthetic projects/clients/team with publication flags.
- Complaint and audit/error/product events.

## Continuous discipline

- Update traceability and `PROGRESS.md` in the same commit as implementation.
- Prefer one direct implementation over speculative abstractions.
- Keep migrations reversible where feasible and always forward-fix safely.
- No TODO without owner, gate, and verification command.
- No hidden placeholder, swallowed exception, catch-all authorization, or disabled test.
