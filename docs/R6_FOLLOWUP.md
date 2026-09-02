# R6 — Editorial experience and intake reliability

Baseline: `670ef4c` (2026-09-01). This is a follow-up slice, not a replacement
for the existing R0–R5 history and not approval for public production.

## Design direction

Persian editorial / working-paper aesthetic: warm ivory, navy typography,
teal process detail and restrained burgundy emphasis. Retain the existing
self-hosted OFL Estedad and Vazirmatn fonts. No proprietary font, synthetic
client, fabricated statistic, external tracking or stock image was added.

- A bespoke SVG drawing explains needs/rules/data → shared model → executable
  process. It is a method illustration, not evidence of delivered work.
- The homepage follows the PRD sequence but varies composition: asymmetric
  opening, editorial audience rows, native problem accordions, dark integration
  specification, numbered journey, honest evidence/team placeholders and closing CTA.
- Public content is server-rendered and visible without JavaScript. No opacity-zero
  entrance states or continuously animated ornament. Native controls and CSS states
  provide interaction, including a reduced-motion mode.
- Intake uses a focused single-column form with a contextual step guide, progressive
  identity collection, retained input, explicit retry, review and success states.
- Public interior pages use numbered content chapters instead of repeated cards.

Applied project-local Ponytail `full` and UI UX Pro Max guidance. No runtime
dependency was added. The previously installed Framer Motion package is retained
for compatibility, but the new public home does not import or hydrate it.

## Functional repairs in this slice

- OTP invokes the configured SMS adapter in production as well as development;
  plaintext login codes are no longer saved in the durable notification table.
- The development inbox uses a random HttpOnly browser capability and expiring
  Redis entry. No global inbox enumeration; no route when disabled or in production.
- Resend uses an atomic Redis claim; OTP verification locks and consumes a challenge
  once and commits failed-attempt counters.
- Onboarding locks the representative row and creates one organization/membership
  transactionally. Retries do not create another organization.
- Customer account includes a minimal organization summary, not internal workflow.
- Request review/edit preserves input; retries reuse an idempotency key. Concurrent
  duplicate insert returns the original ID/reference without another consent/notification.
- Internal transition saves a real note, writes only valid screening outcomes,
  checks optimistic-update results and keeps the audit write in the transaction.
  A dropdown cannot assert payment collection or offer issuance.
- Compose passes API destination and demo/public flags at web **build time**, matching
  Next standalone's serialized rewrites. Production builds disable the inbox.

## Verification contract

| Evidence | Scope |
|---|---|
| `tests/unit/intake-routes.test.ts` | Real Fastify handlers and schemas; DB/Redis/provider doubles |
| `tests/unit/http.test.ts` | JSON, upstream and network failures |
| `tests/integration/intake-postgres.test.ts` | Explicitly opted-in disposable PostgreSQL/Redis test; OTP replay, concurrent onboarding/submission, customer DTO and first screening transition |
| `tests/e2e/intake-ux.spec.ts` | Browser UX against mocked API contracts; 320px onboarding/review/retry, navigation, no-JS content and axe |
| `tests/e2e/public.spec.ts` | Public route/RTL/axe screenshots; existing private offer/invoice cases still need seed tokens |

The DB test requires `NOVIN_RUN_DATABASE_TESTS=true`, `APP_ENV=test` and a database
URL ending in `/novin_test`. CI opts in after migration. No production data is used.

## Observed validation — 2026-09-02

This draft was reconciled on a new local branch after a successful
`git apply --check`; it is now a **validated checkpoint**, not approval to publish.

- Node `v22.23.1` and pnpm `9.0.0` satisfied the repository engines.
  `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`
  (22 passed, 1 explicitly opted-out integration skipped) and `pnpm build` passed.
- An actual, throwaway PostgreSQL 17 database named `novin_test` plus Redis 7.4
  ran `tests/integration/intake-postgres.test.ts` under `APP_ENV=test` and
  `NOVIN_RUN_DATABASE_TESTS=true`. It verifies OTP failed-attempt/expiry/replay
  behavior, concurrent verify/onboarding/submission, private account data, and
  first screening plus audit note behavior. This is separate from mocked browser tests.
- Chromium and Firefox each passed 6 tests with 2 synthetic private-token cases
  skipped. The UI test covers the complete requested intake path, retry preservation,
  keyboard/mobile/no-JS behavior, axe severe/critical findings and screenshots at
  320/768/1440. WebKit was attempted but all runnable cases fail before assertions
  with `page.goto: WebKit encountered an internal error`; this remains an unresolved
  test-runner gate, not a passing result.
- Reviewed images are in `artifacts/screenshots/home-{320,768,1440}.png` and
  `artifacts/screenshots/request-{draft,review,success}-{320,768,1440}.png`.
  They are development evidence; the local browser-only SMS affordance is expected
  there and is excluded from the production-like Docker build.
- `docker compose --env-file .env config --quiet` and a production-like build of
  web/API images passed. A temporary loopback web container returned healthy and
  its server-rendered home had no development SMS inbox. This verifies serialized
  web rewrites/flags versus runtime API networking, not a production deployment.

No remote branch, PR, push, merge or deployment was created. The follow-up remains
outside the R0–R5 release ledger and must be reviewed as a checkpoint.

## Required next slices (do not equate old traceability status with acceptance)

1. **Security/commerce:** prevent MFA re-enrollment from an OTP-only session; enforce
   recent MFA on sensitive actions; lock refund/collection totals; reject expired
   bank-transfer offers; finish transfer/refund/offer administration and test races.
2. **Content/privacy:** connect public content and versioned legal consent to approved
   CMS data; make preflight verify actual published output; implement effective
   Turnstile validation and finish upload-abuse/redaction coverage.
3. **Operations:** isolate restore targets by actual configuration, not the `ENV`
   argument alone; first-install path, deploy lock, robust health/rollback, scheduled
   encrypted backups and an isolated restore drill. Do not run the current restore
   command against a production checkout based only on `ENV=dev`.
4. **Human UAT and launch gates:** approve real identity/legal/brand content; configure
   and verify providers, ClamAV, DNS/TLS; complete true customer-to-finance journeys.

## Final server document

After those slices and a successful clean-server rehearsal, produce a Persian
runbook for a midlevel operator: exact OS/prerequisites, DNS/TLS, non-secret env
reference, first install, migration, admin/MFA, smoke checks, restart/update,
encrypted backup and restore, rollback, monitoring, troubleshooting and Go/No-Go.
Use commands from the tested release. This document is a delivery checklist, not
a claim that the final server runbook is ready today.
