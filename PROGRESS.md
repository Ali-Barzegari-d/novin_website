# Implementation progress

Status: R2 passed; R3 in progress

## Environment

- Agent/model: Codex / GPT-5.6 terra
- OS/architecture: Ubuntu 24.04 kernel 6.14, x86_64
- Node / pnpm / Docker versions: Node v22.23.1, pnpm 9.0.0, Docker 29.4.1, Compose v5.1.3
- Ponytail source/version/mode: official MIT source, `2ed6c52c9d7e5e56942508591085fd45dea277d3`, `full`
- UI skill source/version: UI UX Pro Max official MIT source, `f23267105ad1f4ccd94af45d382584ad45b586f7`

## Release ledger

| Release | Status | Commit | QA evidence | Open gates |
|---|---|---|---|---|
| R0 | Passed | `13e2d50` | `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `make bootstrap`, `docker compose --env-file .env config --quiet` | Production gates intentionally open; see below |
| R1 | Passed (dev/demo) | `c43affa` | Chromium Playwright: 2 public/a11y/RTL tests passed; screenshots in ignored `artifacts/screenshots/` | Final company data, legal approval, and publication permissions remain open |
| R2 | Passed (dev/demo) | `fbde9df` | `pnpm typecheck`, `pnpm lint`, `pnpm test` (9), production build; local Postgres/Redis request + idempotency + private DOCX upload smoke | ClamAV production socket and external provider credentials remain production-gated |
| R3 | Pending | — | — | — |
| R4 | Pending | — | — | — |
| R5 | Pending | — | — | — |

## Execution log

Add dated entries with commands, results, decisions, defects, and the next action. Never paste secrets or real personal data here.

### 2026-09-01 — Startup and execution checklist

- Read the mandatory documents in the exact `AGENTS.md` order, including PRD, discovery, decisions, architecture, security, acceptance, deployment, and traceability matrix.
- Inspected available skills/plugins. Ponytail was not installed; verified its official MIT source and activated `full`. Verified the official MIT UI UX Pro Max source and selected its design-system and UI-styling guidance; `DESIGN.md` remains authoritative.
- Initialized Git and committed every initial planning/infrastructure file as `edddaa6` (`chore(repo): establish product baseline`).
- R0 checklist: vendor required skill guidance; pin toolchain/dependencies; create strict pnpm workspace; implement typed configuration, contracts, schema/migrations, health and logs; validate Compose and baseline tests.
- R1 checklist: public RTL routes, CMS, legal drafts, complaint flow, SEO/a11y/visual evidence.
- R2 checklist: OTP/session/RBAC, customer request wizard, private scanning pipeline, screening/admin QA.
- R3 checklist: versioned offers, payments/bank review/refunds, notifications/receipts, financial QA.
- R4 checklist: evaluator scenario, preflight, retention/deletion, documentation/security/full acceptance.
- R5 checklist: production operations, backup/restore/rollback, deployment rehearsal/soak and final Go/No-Go report.

### 2026-09-01 — R0 evidence

- Pinned workspace: Next 16.3.4, Fastify 5.12.1, Drizzle 0.45.2, PostgreSQL 17, Redis 7.4 and the R0 QA stack in `package.json`/`pnpm-lock.yaml`.
- Implemented strict TypeScript workspace boundaries, shared contracts/config, Drizzle schema plus forward-only SQL migration, secure configuration validation, API health/logging baseline, original design-token preview, Compose bind mounts, and Make/operations scripts.
- QA passed: `pnpm lint`; `pnpm typecheck`; `pnpm test` (6 checks); `pnpm build` using Webpack (Turbopack is not used because its CSS worker cannot bind a local port in this environment); `make bootstrap`; `docker compose --env-file .env config --quiet`.
- Next action: complete R1 CMS screens and public-route visual/a11y evidence. The preflight command is intentionally failing until external production gates are closed.

### 2026-09-01 — R1 evidence

- Added the public Persian RTL corporate experience: all planned public routes, canonical/robots/sitemap metadata, legal draft banners, original SVG process language, 404/500 states, mobile header, public complaint flow, and dev-only accessible SMS inbox.
- Added CMS data models/APIs for pages, revisions, clients, case studies, team and legal versions; content-admin interface is permissioned for the content role.
- QA passed: `pnpm typecheck`; `pnpm lint`; `pnpm build`; `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/google-chrome pnpm exec playwright test --project=chromium` (2 passed). Home screenshots: `artifacts/screenshots/home-{320,768,1440}.png`; manually inspected 320/1440 render.
- Next action: R2 identity, intake, upload, internal screening and RBAC acceptance tests.

### 2026-09-01 — R2 evidence

- Implemented passwordless Iranian-mobile OTP with hashed challenges, expiry/attempt/rate limits, opaque hashed sessions, logout, account/profile/mobile-change/email-verification endpoints, least-privilege RBAC, encrypted TOTP enrolment and immutable audit events.
- Implemented onboarding as a representative of an organization, idempotent request intake, an editable final-review step, private attachment quarantine/type scan/production ClamAV gate, internal-only download, request search/assignment/screening/state transitions/CSV export, and a Persian internal request desk.
- Local integration evidence: the Compose PostgreSQL and Redis services were healthy; the forward-only SQL migration applied; synthetic seed completed; OTP authentication, onboarding, request creation, duplicate idempotency response, and a DOCX private upload were exercised. The stored attachment was `CLEAN`, server-detected as DOCX, and remained in the private clean location.
- QA passed: `pnpm typecheck`; `pnpm lint`; `pnpm test` (9); `pnpm build` (Webpack). The sandboxed Next build could not parse TypeScript `--showConfig`; the identical production build passed outside that sandbox. `UPLOAD_ALLOWED_TYPES` was corrected to match the documented PDF/DOCX/XLSX/image allowlist and the root build now rebuilds the config package before API/Web.
- Next action: update R2 traceability and commit the passing vertical slice, then implement R3 versioned offers and payment lifecycle.

## Production gates

Copy unresolved gates from `DECISIONS.md` and close them only with evidence.
