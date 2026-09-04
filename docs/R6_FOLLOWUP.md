# R6 — Intake reliability checkpoint

Baseline: `670ef4c` (2026-09-01). This is a follow-up slice, not a replacement
for the existing R0–R5 history and not approval for public production.

The frontend and its visual direction were intentionally removed on 2026-09-04
at the owner's request. This document now retains only the backend reliability,
security, commerce and operations evidence from that checkpoint.

## Functional repairs in this slice

- OTP invokes the configured SMS adapter in production as well as development;
  plaintext login codes are no longer saved in the durable notification table.
- The development inbox uses a random HttpOnly browser capability and expiring
  Redis entry. No global inbox enumeration; no route when disabled or in production.
- Resend uses an atomic Redis claim; OTP verification locks and consumes a challenge
  once and commits failed-attempt counters.
- Onboarding locks the representative row and creates one organization/membership
  transactionally. Retries do not create another organization.
- Request review/edit preserves input; retries reuse an idempotency key. Concurrent
  duplicate insert returns the original ID/reference without another consent/notification.
- Internal transition saves a real note, writes only valid screening outcomes,
  checks optimistic-update results and keeps the audit write in the transaction.
  A dropdown cannot assert payment collection or offer issuance.

## Verification contract

| Evidence | Scope |
|---|---|
| `tests/unit/intake-routes.test.ts` | Real Fastify handlers and schemas; DB/Redis/provider doubles |
| `tests/unit/http.test.ts` | JSON, upstream and network failures |
| `tests/integration/intake-postgres.test.ts` | Explicitly opted-in disposable PostgreSQL/Redis test; OTP replay, concurrent onboarding/submission, customer DTO and first screening transition |

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
- Historical browser and visual evidence from this checkpoint was invalidated and
  removed with the frontend reset. It must not be used to claim current acceptance.

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
