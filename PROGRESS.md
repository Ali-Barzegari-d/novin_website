# Implementation progress

Status: fresh owner-approved replacement frontend implemented and validated for dev/demo. Public production remains intentionally blocked by external identity, legal, evidence, provider, TLS and operations gates.

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
| R2 | Passed (dev/demo) | `c06e8b4` | `pnpm typecheck`, `pnpm lint`, `pnpm test` (9), production build; local Postgres/Redis request + idempotency + private DOCX upload smoke | ClamAV production socket and external provider credentials remain production-gated |
| R3 | Passed (dev/demo) | `83575ff` | `pnpm typecheck`, `pnpm lint`, `pnpm test` (10), production build, Chromium 3/3 including private-offer 320/768/1440, local offer-to-receipt lifecycle with duplicate callback | Approved gateway endpoint/merchant credentials and legal approval remain production-gated |
| R4 | Passed (dev/demo) | `7fc56c4` | migration `0001_service_settings.sql`; `pnpm typecheck`, `pnpm lint`, `pnpm test` (10), secrets scan, production build, Chromium 4/4 at 320/768/1440, synthetic contract invoice | Legal/company identity acceptance remains externally blocked; production preflight fails closed as designed |
| R5 | Passed (dev/demo); public production blocked | `97f9253` | final static/security gates, Docker image rehearsal, API/web health smoke, Chromium + Firefox E2E; see R5 evidence below | Legal/company/provider/TLS/backup/ClamAV gates and isolated restore drill remain open |
| R6 | Validated checkpoint; not a production release | `b45f147` | frozen install, lint, typecheck, 22 unit tests, production build, disposable PostgreSQL/Redis integration, Chromium/Firefox E2E, Docker production-like image smoke | WebKit runner failure; all existing launch gates plus security/commerce/CMS/operations backlog remain open |
| R7 | Visual-system, component, layout-shell and public-experience checkpoints validated; not a production release | `645c429`, `1ec7663`, `f8bf9cf`, `4671dbd`, `06e31db`, `b3ce320`, `eeda580`, `e22ef57`, `80e7bd4`, `a25350f`, `f61df0b`, `bd9115a`, `a474e50`, `6a9db1f` | frozen install, workspace typecheck, web production build, lint, 22 unit/integration tests and Chromium RTL/focus/axe checks | R6 and launch gates are unchanged |
| Frontend reset | Completed; intentionally not a release | `8fcb9ab` | Previous frontend, design system, visual assets/prompts/evidence and browser harness removed; backend QA re-run | Replacement UI/UX brief and implementation required before any public release |
| Replacement frontend | Passed for dev/demo; production intentionally gated | `12080ea` | web production build (23 routes), Chromium 7/7 at 320/768/1440, Axe, keyboard/focus, 19 unit/integration tests, lint/traceability, secret scan, Docker image + loopback health | Approved company identity, legal copy, real evidence/assets, providers, TLS, backup/restore and ClamAV remain open |

## Execution log

Add dated entries with commands, results, decisions, defects, and the next action. Never paste secrets or real personal data here.

### 2026-09-04 — Replacement frontend discovery and execution checklist

- [x] Re-read the complete mandatory product, architecture, security, acceptance, deployment, content, decision, and traceability sources after the owner supplied the replacement brief.
- [x] Audit the retained API routes, shared contracts, data model, seed data, RBAC boundary, production gates, and frontend-reset state.
- [x] Activate Ponytail `full` from retained commit `2ed6c52c9d7e5e56942508591085fd45dea277d3`; load the retained UI UX Pro Max guidance at `f23267105ad1f4ccd94af45d382584ad45b586f7`; follow the mandatory Impeccable redesign workflow without importing the discarded visual direction.
- [x] Confirm the two remaining product-truth inputs with the owner: all three decision-maker groups have equal priority; no approved trust assets are currently available.
- [x] Record confirmed durable product truth in a new `PRODUCT.md` before making visual decisions.
- [x] Establish and approve a fresh, non-derivative visual direction; then implement its design system and record the built result in a new `DESIGN.md`.
- [x] Rebuild the complete Persian RTL web application: public routes, OTP/onboarding, request/upload/review, account, opaque-token offer/payment/invoice flows, complaints, and role-aware internal workspaces.
- [x] Restore web deployment/runtime wiring and automated acceptance coverage; keep mocks, draft legal content, placeholder facts, and missing production providers fail-closed and visibly non-production.
- [x] Validate lint, typecheck, unit/integration suites, production build, traceability, security checks, WCAG 2.2 AA, reduced motion, keyboard/focus, and 320/768/1440 browser evidence before release commits.

Current boundary: `canon.png` is the only owner-approved visual reference for this pass. The previous frontend and deleted design direction were not reconstructed. Real company facts, logo, people, clients and case-study media are still missing and visibly/procedurally production-gated.

### 2026-09-04 — Owner-approved replacement frontend

- Owner selected `.impeccable/mocks/decision/canon.png` and restored the primary statement as «پیچیدگی‌های مالی و کسب‌وکاری را به فرایند، سامانه و محصول قابل‌اجرا تبدیل می‌کنیم.» Typography and punctuation were normalized without changing the statement's meaning.
- Built a new white/navy/teal visual system with a two-column RTL hero, interactive problem-to-product map, trust rail, equal entry paths for all three audiences, responsive public pages, secure OTP/onboarding, request/review/upload, account, offer, payment, invoice, complaints and role-aware internal workspace.
- Added Next.js standalone runtime, web Docker image, Compose service on loopback host port 3050, API rewrite, health check, release-gated robots metadata, and restored deployment wiring. Mocks, placeholder identity/evidence and draft legal content remain excluded from a production-ready claim.
- Fresh QA: `pnpm typecheck` passed; `pnpm lint` passed including the 137-row traceability contract; `pnpm test` passed 19 tests with one explicitly opted-out database suite; `pnpm security:secrets` passed; `pnpm --filter web build` passed with 23 routes; and `docker compose --env-file .env.example config --quiet` passed. The sandboxed build hit the known TypeScript `--showConfig` environment limitation; the approved production build outside that sandbox passed.
- Chromium acceptance passed 7/7: exact Persian headline, RTL, release noindex gate, keyboard skip link, trapped mobile-menu focus and Escape return, all primary public/intake route headings, complete representative public/customer/commerce/internal surfaces, Axe serious/critical scans, reduced-motion state and no horizontal overflow at 320/768/1440. The mobile map assertion additionally verifies every legend rectangle remains inside its visual container; the internal navigation assertion verifies every 320px tab remains visible. Evidence: `artifacts/screenshots/replacement-first-viewport-{320,768,1440}.png`, `replacement-home-{320,768,1440}.png`, and `replacement-{public-detail,login,request,account,offer,payment,invoice,complaints,admin}-{320,768,1440}.png`.
- The final Docker build produced `novin-financial-web:dev` (`sha256:3cc991185313ec7ca0c6df40749a3cee66e752a492166f6a9acd4595080debc7`). A disposable loopback container on port 3059 returned `{"status":"ok","service":"web"}` from `/health` and was then stopped and removed.
- Static detector reported one layout-transition warning, fixed by removing padding animation, and one advisory grid signature intentionally retained only inside the semantic technical-map canvas. The independent Impeccable finish review returned PASS after inspecting the corrected mobile map, complete public-detail rendering, wrapped admin navigation, desktop first viewport, semantics, reduced motion and representative screenshots.
- The fresh system is recorded in `DESIGN.md` and `.impeccable/design.json`; `canon.png` remains an internal approved direction reference and is not served by the application. No deploy, provider call, payment, publication or production-data operation was performed.
- Replacement implementation commit: `12080ea` (`feat(web): deliver replacement frontend`). This is a local dev/demo release checkpoint; it was not pushed, merged or deployed.

### 2026-09-04 — Frontend and visual reset checklist

- [x] Read the mandatory project documents in the `AGENTS.md` order and inspect the repository state.
- [x] Activate Ponytail `full`, retained UI UX Pro Max guidance, and Impeccable context for the frontend boundary.
- [x] Remove the complete `apps/web` application, frontend-only tests/configuration, web container, and generated visual evidence.
- [x] Remove the incumbent design specification, image prompts, asset register, source artwork, and visual-only R6 notes while retaining non-visual reliability history.
- [x] Remove stale frontend dependencies and executable references while preserving API, database, security, content truth, and operations data.
- [x] Mark traceability rows that lost frontend evidence as awaiting the replacement frontend; run backend-focused validation and record the result.

Reset boundary: this is an explicit owner-requested destructive reset. Git history remains the recovery path for tracked files; ignored screenshots/build output are intentionally discarded. No replacement visual direction or UI is introduced in this step.

Reset evidence: clean offline install now has 250 dependency components (down from the stale 706-component tree) and no Next, React, Tailwind, Radix, Framer Motion, Playwright, or Axe package in the lockfile/SBOM. `pnpm lint` passed with 137 traceability rows; `pnpm typecheck` passed; `pnpm test` passed 19 tests with one explicitly opted-out database suite; `pnpm build` passed for contracts/config/db/API; `docker compose --env-file .env config --quiet` passed and lists only ClamAV, PostgreSQL, Redis, API, and worker. The production deploy command exits 2 before mutation with the explicit missing-frontend gate. A filesystem scan outside Git/vendor/dependencies found no image, font, or vector asset.

### 2026-09-03 — R7 owner hero collage integration and image prompts

- Reviewed the owner-supplied change: a 2 MB AI-generated conceptual collage PNG placed in `apps/web/public/images/` with no code reference. Per the owner's instruction it is used directly rather than redrawn in code; early-project chart references (`ProcessArt` flow art, `docs/ASSET_SOURCES.md` provenance register) were reviewed before choosing placement.
- Optimized the asset: a 4:3 WebP crop at 900px / 18 KB (`financial-process-collage-hero.webp`) now renders in the hero aside through `next/image` (priority, responsive `sizes`), framed with the shared 2px/20px corner language and a «تصویر مفهومی» caption tag so no real customer, project or data claim is implied. The 2 MB master PNG moved to `docs/assets-src/financial-process-collage-v1.png` (kept for provenance and future re-crops, not shipped). Provenance row added to `docs/ASSET_SOURCES.md` (source: owner-supplied generated artwork; company holds rights).
- Added `docs/IMAGE_PROMPTS.md`: the shared style DNA extracted from the owner's collage (deep teal-navy, ivory paper-craft, brushed gold, girih motifs, no text inside images) plus ready-to-use generation prompts for remaining image slots — solutions banners (public/private), closing background motif, and the projects badge-card placeholder. Labels stay in HTML; generated images never carry text or real-world claims.
- QA passed: `pnpm typecheck`; `pnpm lint` (137-row traceability contract). Verified with a Playwright/Chrome pass at 1440/768/320 on `/` (hero figure renders; `scrollWidth === clientWidth` at 320px checked programmatically, no horizontal overflow).
- Presentation-only checkpoint: no PRD behavior or traceability mapping changed. Production gates unchanged; no deploy performed.

### 2026-09-03 — R7 diagram craft and composition polish

- Root-caused the broken hero diagram: SVG `<text>` with an LTR writing mode anchored at the rail clipped Persian labels to unreadable tail fragments. Rewrote `HeroPathArt` as an HTML stepper (semantic `<ol>`) on a shared vertical rail with diamond nodes in the categorical turquoise/azure/rose set and a rail terminus; labels are real HTML text, RTL-safe, selectable and readable without JavaScript.
- Redrew `IntegrationSignal` so the flow runs right-to-left in step with the RTL stage list (ورودی on the right, خروجی on the left) instead of mirroring it. Replaced crude glyphs with documented metaphors — recorded-event document, branching rule, linked systems rings, measured rising outcome with arrowhead — and made node fills opaque panel mixes so the flow line connects edge-to-edge.
- Added `StationPath`, a reusable horizontal RTL station path (gradient rail through the validated ordinal ramp, arrow terminus, HTML labels) used where a small chart adds clarity: the مسئله/اقدام/نتیجه summary in the home proof aside, the case-study head (`/projects/[slug]`), and the five-step cooperation path on `/process` (same copy as the home journey; no new claims).
- Added `ConvergenceMark` (decorative no-text SVG under the problems heading: scattered categorical dots converge into one measured line) and `ClosingMark` (quiet original SVG arrow replacing the oversized "↙" glyph). Journey section on desktop now reads as one continuous path via a horizontal gradient rail with a directional arrowhead; mobile keeps the per-phase vertical rail. Hero columns are center-aligned so the brief no longer hangs at the bottom of the aqua field.
- Verified the whole surface with full Playwright/Chrome screenshot passes at 320/768/1440 on `/`, `/projects`, `/projects/sample-financial-flow`, `/solutions/public` and `/process`, plus 2× close-ups of every diagram; no horizontal overflow at 320px.
- QA passed: `pnpm typecheck`; `pnpm lint` (137-row traceability contract). Presentation-only change: no PRD behavior, copy claims or traceability mapping changed.

### 2026-09-04 — R7 visual-review correction

- Per owner review, inspected the actual home screenshots at 320, 768 and 1440px and compared the earlier `ProcessArt` concept. The correct information model is a restrained, non-quantitative transformation sequence (`مسئله → مدل → سامانه → پذیرش → نتیجه`), not a trading/finance chart and not a decorative object repeated across the page.
- Removed the served Hero collage after it proved too small and decorative on mobile, and removed the unhelpful convergence and closing SVG marks. The raw draft remains archived but is explicitly marked rejected in `docs/ASSET_SOURCES.md`; no generated raster image is currently shipped to the public surface.
- Simplified Hero, integration and process summaries into readable semantic HTML. The remaining ordered lists explain actual method/order; they are no longer presented as code-drawn illustrations. Removed the now-unused `framer-motion` runtime dependency and its lockfile entries.
- Replaced the earlier image guide with `docs/IMAGE_PROMPTS.md`: it records the rejection criteria, when no image should be used, and two reviewable prompts (conceptual transformation map and permissioned documentary photo). No image enters a public route before owner visual approval at all three reference widths.
- QA passed: `pnpm install --frozen-lockfile`; `pnpm test` (22 passed, 1 opted-out integration test skipped); `pnpm --filter web build` (25 routes); `pnpm typecheck`; `pnpm lint` (137 traceability rows); `git diff --check`; and Chromium public smoke (4 passed, 2 private-token cases skipped). Manually inspected the regenerated `artifacts/screenshots/home-{320,768,1440}.png` for visual hierarchy, RTL, text legibility and no horizontal overflow.
- Visual correction commit: `6a9db1f` (`fix(r7): remove ineffective visual charts`). `docs/TRACEABILITY.csv` is unchanged because neither a new PRD behavior nor acceptance mapping was introduced. No push, merge or deployment was performed; production gates remain unchanged.

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

### 2026-09-01 — R3 evidence

- Implemented versioned, revocable, expiring opaque-token offers with an exclusive offer page that shows complete scope, timing, expert mix, fee deduction term, legal versions, and base/tax/final IRR amounts only to the secure offer link.
- Added mandatory pre-payment email verification and organization billing completion, immutable terms consent, server-calculated money, online payment adapter boundary (deterministic mock and fail-closed REST-gateway adapter), server-side verification/idempotency, private receipt, bank-transfer review/rejection, refund records, notification templates, resend throttling, and delivery-status persistence.
- Local lifecycle evidence: created a fully synthetic qualified-request offer, verified customer email, completed synthetic billing, accepted the terms version, started a mock transaction, verified its callback, replayed the callback (`duplicate: true`), and retrieved a PAID receipt with the independently stored transaction reference and amount.
- QA passed: `pnpm typecheck`; `pnpm lint`; `pnpm test` (10); `pnpm build`; `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/google-chrome PLAYWRIGHT_OFFER_TOKEN=<synthetic> pnpm exec playwright test --project=chromium` (3 passed). Screenshots at `artifacts/screenshots/offer-{320,768,1440}.png` were manually inspected at 320 and 1440.
- Fixed standalone client assets by copying `.next/static` into the Next standalone application tree during `postbuild`; this is now used by both the Playwright server and the production Docker image.
- Next action: complete R3 traceability/commit, then implement R4 evaluator, retention/deletion, legal/operations documentation and full acceptance controls.

### 2026-09-01 — R4 evidence

- Applied and tested forward-only migration `0001_service_settings.sql` against local PostgreSQL. It adds non-secret service settings and separate opaque-token contract invoice records; the finance role successfully issued and read a synthetic invoice link.
- Added an MFA-protected Superadmin settings view for auditable upload policy (service secrets remain deployment-only), internal request filters, account anonymization request, retention worker for expired private attachments and deferred identity anonymization, machine-readable OpenAPI, evaluator walkthrough, data dictionary, authorization matrix, retention policy, and API adapter documentation.
- QA passed: `pnpm typecheck`; `pnpm lint`; `pnpm test` (10); `pnpm security:secrets`; `pnpm build`; Chromium Playwright (4 passed) including offer/invoice screenshots at 320/768/1440. The 320px invoice screenshot was manually inspected.
- Production preflight was corrected to resolve workspace modules, load `.env` via its wrapper, validate config/database release conditions, and fail only while gates are open. It currently fails as expected because the development configuration has invalid/missing production provider values, legal approval, and company facts.
- Next action: commit R4, then complete R5 container/CI/operations validation and final Go/No-Go report.

### 2026-09-01 — R5 evidence

- Hardened Compose with loopback-only web exposure, Git-SHA application image tags, reviewed PostgreSQL/Redis/ClamAV digests, non-root `APP_UID:APP_GID`, read-only application roots, dropped Linux capabilities, no-new-privileges, graceful API/worker shutdown, resource limits, correct private upload mounts, and a `.dockerignore` that excludes credentials, runtime data, artifacts, and build outputs.
- Corrected host-vs-Compose database/Redis resolution for development scripts; `make migrate ENV=dev` completed safely against the local Compose database. Production migration/seed/admin paths run inside the API image. The API runtime image was rehearsed with `GET /health/ready` injection under the Compose user/mount policy, returning 200; the web image was smoke-tested at `127.0.0.1:3051/health` under read-only, non-root, no-capability settings and returned `{ "status": "ok" }`.
- Added paired encrypted database and upload backup artifacts with checksums, daily/weekly retention, explicit dev restore staging, isolated restore-drill command, application-only Git-SHA rollback guard, backup-aware health checks, an operations runbook, HTTPS/HSTS proxy guidance, production preflight in the runtime image, and pinned CI actions. CI now runs migrations/build before Playwright and uses a deterministic CycloneDX 1.6 SBOM generator for the pnpm store.
- QA passed: `pnpm lint`; `pnpm typecheck`; `pnpm test` (11); `pnpm security:secrets`; `pnpm security:sast`; `pnpm security:sbom` (657 components); `pnpm audit --audit-level high` (no high/critical findings; one low finding remains); `pnpm build` (25 routes); `docker compose --env-file .env config --quiet`; `docker compose ... build web/api`; API image readiness injection; Chromium Playwright 2 passed/2 synthetic-token skips; Firefox Playwright 2 passed/2 synthetic-token skips.
- Production preflight deliberately fails inside the final API image and now names the required remediation: HTTPS public URL, real Kavenegar/SMTP/payment/Turnstile configuration, disabled demo facilities, a non-default session secret, company identity, legal approval, and age backup recipient.
- R5 constraints observed without bypass: ClamAV is unhealthy because its upstream signature CDN returned rate-limit/cool-down responses, so Compose correctly refuses API startup and uploads remain fail-closed. `age` is not installed and no recovery identity/recipient exists, so encrypted backup and isolated restore drill cannot be evidenced. WebKit smoke requires missing system libraries; its official dependency installer requires unavailable sudo, while CI performs `playwright install --with-deps chromium firefox webkit`. No final company/legal/provider/TLS/brand approvals have been supplied.
- R5 named release commit: `97f9253` (`feat(r5): deliver production operations`). Final Go/No-Go: development/demo is runnable; public production is No-Go until every gate below is closed with evidence.

### 2026-09-01 — UI refresh evidence

- Applied Ponytail in `full` mode and the retained UI UX Pro Max design-system/UI-styling guidance to the public web surface. `DESIGN.md` remained authoritative: the refresh uses the approved navy, teal, gold, burgundy, and accessible surface shades rather than neon or generic dashboard styling.
- Reworked the shared semantic token layer, typography rhythm, buttons, fields, cards, notices, footer, offers, and responsive layouts. The public home now has a more expressive original process diagram, two distinct audience-path treatments, an accessible mobile navigation menu, a stronger final CTA, and a compact mobile timeline; public route templates now share the same page-intro and CTA language.
- Fixed an independent Next 16.3.4 build-environment defect: its default TypeScript CLI subprocess returned an empty `--showConfig` stream under this environment. `experimental.useTypeScriptCli: false` preserves type checking through TypeScript's supported programmatic API; the production build now completes.
- QA passed: `pnpm --filter web typecheck`; `pnpm --filter web build` (25 routes); `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/google-chrome pnpm exec playwright test tests/e2e/public.spec.ts --project=chromium` (2 passed, 2 synthetic-token skips); `pnpm lint`; and `pnpm test` (11 passed).
- Visually inspected the production-built homepage at 320, 768, and 1440 px: `artifacts/screenshots/home-{320,768,1440}.png`. The in-app browser runtime had no available browser binding, so the repository's established Playwright browser QA supplied the screenshots and route/accessibility evidence.
- Production gates are unchanged: this refresh does not make placeholders, mocks, draft legal copy, or unlicensed brand assets production-ready.
- UI commit: `8c752d2` (`feat(ui): refresh public experience`).

### 2026-09-01 — Typography, expressive color, and motion pass

- Applied Ponytail in `full` mode together with UI UX Pro Max and Framer Motion Animator guidance. The refinement keeps `DESIGN.md`'s calm, professional product constraints while making the visual language substantially more distinct.
- Added self-hosted, redistributable `Vazirmatn` 5.3.0 (body/UI) and `Estedad` 5.3.0 (display) through Fontsource. Both are SIL OFL 1.1 and are documented in `docs/ASSET_SOURCES.md`. IranYekan was deliberately not bundled because a licensed distribution was not supplied.
- Rebuilt the token system around measured LinkedIn blue, teal, green, and burgundy accents; added distinct audience paths, varied problem surfaces, a stronger final CTA, and original updated process artwork. The palette intentionally avoids random rainbow or neon treatment.
- Audited interaction sizing: public text has a 16px base; normal primary controls are 16px/48px minimum; compact navigation controls retain a 44px minimum target; fields are 48px minimum; keyboard focus is high-contrast and visible. Forms, disabled, focus, hover, and active states retain explicit feedback.
- Added a client-only Framer Motion home experience: staged hero arrival, section entrances, restrained card hover depth, and an accessible reduced-motion path with no looping, parallax, or scroll hijacking. Section-level clipping prevents offscreen entrance transforms from creating horizontal mobile overflow.
- Improved screenshot evidence to scroll each once-only entrance into view before full-page capture, so the evidence records the finished interface rather than temporarily hidden pre-entrance content.
- QA passed: `pnpm typecheck`; `pnpm --filter web build` (25 routes); `pnpm lint`; `pnpm test` (11 passed); `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/google-chrome pnpm exec playwright test tests/e2e/public.spec.ts --project=chromium` (2 passed, 2 synthetic-token skips); and `git diff --check`. Manually inspected `artifacts/screenshots/home-{320,768,1440}.png`.
- Production gates are unchanged. This work does not approve real company data, legal copy, providers, customer proof, or IranYekan licensing.
- UI commit: `9c33cd1` (`feat(ui): elevate Persian visual system`).

## Production gates

### 2026-09-02 — R6 execution checklist

- [x] Read the mandatory product/security/acceptance documents, activate Ponytail `full` and apply retained UI UX Pro Max guidance.
- [x] Preserve `master` at `670ef4c`, create `codex/r6-ux-intake-checkpoint`, inspect the supplied draft patch, and confirm `git apply --check` succeeds.
- [x] Reconcile the draft with the current implementation: browser-scoped OTP inbox, retry-safe onboarding/request intake, screening/audit constraints, build-time web/API routing, responsive editorial UI and focus handling.
- [x] Run frozen install, lint, typecheck, unit tests, production build, disposable PostgreSQL/Redis tests, browser matrix, visual review, and Docker configuration/image checks.
- [x] Record observed R6 evidence in traceability/progress, add the prioritized non-R6 backlog, and prepare reviewable checkpoint commits without push/merge/deploy.

### 2026-09-02 — R6 validation evidence

- Preserved `master` at `670ef4c`; created isolated branch `codex/r6-ux-intake-checkpoint`. Read the supplied patch before applying it; `git apply --check ../0001-feat-ux-checkpoint-editorial-experience-and-intake-r.patch` passed. No reset, forced apply, push, merge or deploy was used.
- Reconciled the editorial/intake patch using Ponytail `full` and the retained UI UX Pro Max design-system/UI-styling guidance. Kept self-hosted OFL Vazirmatn and Estedad; no IranYekan, stock image, fabricated company fact, client, metric, team member or project was added.
- Functional coverage in this checkpoint includes: browser-capability, expiring dev OTP inbox; OTP expiry/attempt/replay rejection; transactional onboarding retry; preserved form state on review/edit/network retry; request idempotency; customer DTO minimization; first screening transition without a constraint conflict; and transactional internal note/audit. The web build receives the API rewrite and public inbox flag at build time; runtime API routing stays `http://api:4000` in Compose.
- Toolchain evidence: Node `v22.23.1`, pnpm `9.0.0`; `pnpm install --frozen-lockfile`, `pnpm lint` (including 137-row traceability contract), `pnpm typecheck`, `pnpm test` (22 passed, 1 opted-out integration skipped), and `pnpm build` all passed.
- Real integration evidence (separate from browser mocks): migrated an ephemeral PostgreSQL 17 database named `novin_test` and an ephemeral Redis 7.4 instance, both loopback-only/tmpfs. With `APP_ENV=test` and `NOVIN_RUN_DATABASE_TESTS=true`, `tests/integration/intake-postgres.test.ts` passed: failed/expired/replayed OTP, concurrent OTP verify, concurrent onboarding, concurrent duplicate submission, customer-data minimization, screening and audit note behavior. No project Compose database or production data was used.
- Browser evidence: Chromium 6 passed / 2 synthetic private-token cases skipped; Firefox 6 passed / 2 skipped. The intake browser test uses mocked API responses by design and is not reported as the database integration. It checks account-load retry, login → onboarding → problem → review/edit → transient error/retry → successful submit, keyboard skip-link focus, mobile navigation Escape close, no-JS home content, axe serious/critical issues, and 320/768/1440 no-horizontal-overflow captures. The attempted WebKit cases failed before assertions with `page.goto: WebKit encountered an internal error`; retain the failure and reproduce in a provisioned CI/WebKit runner before considering browser-matrix acceptance complete.
- Manually reviewed current screenshots: `artifacts/screenshots/home-{320,768,1440}.png` and `artifacts/screenshots/request-{draft,review,success}-{320,768,1440}.png`. They show a coherent RTL editorial hierarchy, readable 16px-base body copy, 44px+ compact navigation targets/48px main controls, warm/natural surface contrast, and no observed horizontal overflow in the tested flows. The browser-only development SMS toggle may appear only in development screenshots; the production-like image check below confirms it is absent from production SSR.
- Docker evidence: `docker compose --env-file .env config --quiet` passed with production-like, non-secret overrides. `docker compose ... build web api` built `novin-financial-web:r6-checkpoint` and `novin-financial-api:r6-checkpoint`; the temporary loopback web container returned `{\"status\":\"ok\"}` from `/health`, and its SSR HTML contained no development SMS inbox. It was stopped immediately. This is image/route validation, not a production deployment or a complete API/provider lifecycle rehearsal.
- No external provider, real customer data, payment, migration on a persistent environment, publish action or production preflight approval was performed. See `docs/R6_FOLLOWUP.md` and `docs/R6_BACKLOG.md` for remaining R6 and launch work.
- Checkpoint implementation commit: `b45f147` (`feat(r6): improve editorial intake checkpoint`). The next documentation commit records this SHA only; neither commit was pushed, merged or deployed.

### 2026-09-02 — R7 Tailwind design-token foundation

- Created local branch `r7` from the final R6 checkpoint (`eae73bd`) with a clean worktree.
- Added `apps/web/tailwind.config.ts` and explicitly loaded it from `globals.css`. Tailwind 4 does not auto-detect legacy JavaScript/TypeScript configuration, so `@config` makes the new utility tokens available to the actual web build.
- Reconciled malformed prompt values with project constraints: corrected the duplicate/broken neutral/spacing entries and invalid primary hex, used `DESIGN.md` navy values (`#0B2545`/`#153A63`), and retained licensed self-hosted Vazirmatn/Estedad rather than adding unlicensed IranYekan or undeclared mono fonts.
- QA passed: `pnpm --filter web typecheck`; `pnpm --filter web build` (25 routes); `pnpm lint` (including the 137-row traceability contract); `git diff --check`.
- Token implementation commit: `645c429` (`feat(r7): add Tailwind design tokens`). No remote action was taken.

### 2026-09-02 — R7 global semantic styles

- Reconciled `~/amir/prompt-02.md` with the existing R6 stylesheet instead of replacing the working component rules with its malformed draft. Added primitive-to-semantic CSS aliases, a `dark` variable set, RTL/base defaults, theme-aware body/focus/selection behavior, and dark-safe shared heading, brand, field, status, table and development-inbox styles.
- `DESIGN.md` remains authoritative: warm ivory/navy/teal/burgundy is the default visual system, while the dark values use high-contrast semantic aliases. The prompt's broken values were not copied. IranYekanX was not added because no licensed redistributable font files were supplied; existing self-hosted OFL Vazirmatn and Estedad remain the font stack.
- QA passed: `pnpm --filter web typecheck`; `pnpm --filter web build` (25 routes); `pnpm lint` (137-row traceability contract); `git diff --check`; Chromium dark-token test at 320px; Chromium 320px public-route no-horizontal-overflow test.
- Visually inspected dark-mode evidence at `artifacts/screenshots/home-dark-320.png`: RTL hierarchy, dark surface/text contrast, native focus treatment and the existing page composition remain intact.
- Global-style implementation commit: `1ec7663` (`feat(r7): add semantic global styles`). No remote action was taken.

### 2026-09-02 — R7 reusable Button primitive

- Applied Ponytail `full` and the retained UI UX Pro Max design-system guidance to `~/amir/prompt-03.md`. Added `Button` plus the `cn` utility, using the pinned runtime dependencies `class-variance-authority` 0.7.1, `clsx` 2.1.1 and `tailwind-merge` 3.6.0. The component provides the approved primary/secondary/ghost/accent/danger/danger-ghost/link variants; xs–xl and square icon sizes; width/rounding options; native disabled behavior; loading spinner/status; RTL-leading/trailing icons; and visible semantic focus rings. `asChild` is intentionally not exposed because the prompt's final requirement removes it.
- Updated semantic foreground tokens so primary, accent and danger Button variants retain contrast in the existing dark variable set. The development-only `/design-preview` now renders each Button state. It continues to return no public content when `NODE_ENV=production`; no internal preview is exposed through the production build.
- QA passed: `pnpm install --frozen-lockfile`; `pnpm typecheck`; `pnpm --filter web build` (25 routes); `pnpm lint` (including 137-row traceability contract); `pnpm test` (22 passed, 1 opted-out integration skipped); and `git diff --check`.
- Chromium local-development smoke passed at 320px: all preview variants present exactly once, loading/disabled semantics, RTL icon order, 40×40px `icon-md`, focus-visible ring in light/dark modes, dark primary tokens and no horizontal overflow. Screenshots were manually inspected at `artifacts/screenshots/button-preview-light-320.png` and `artifacts/screenshots/button-preview-dark-320.png`.
- Next development logs two non-production warnings: TypeScript `tailwind.config.ts` is reparsed as ESM without an app-level module type, and a direct `127.0.0.1` smoke URL is not an allowed HMR origin. Adding `type: module` was tested and reverted because it breaks the existing web TypeScript module-resolution contract. The optimized production build and workspace typecheck pass; retain the warnings as follow-up engineering work rather than weakening type safety.
- Button implementation commit: `f8bf9cf` (`feat(r7): add reusable Button primitive`). No remote action was taken.

### 2026-09-02 — R7 accessible Input primitive

- Applied Ponytail `full` plus the retained UI UX Pro Max design-system/UI-styling guidance to `~/amir/prompt-04.md`. Reconciled its malformed utility snippets with the R7 token system and added a reusable native `Input`: persistent label, generated unique ID, required marker, helper/error association, default/error/success/warning/disabled states, sm/md/lg sizing, and decorative leading/trailing RTL addons.
- Preserved native form semantics: `aria-describedby` supplied by a consumer is combined with the helper ID; error state adds `aria-invalid`, `role="alert"` and polite live notification; `state="disabled"` as well as `disabled` produces a genuinely disabled native input. The input now fills the control's internal height (`h-full`), after browser QA found that the original text-height-only element did not cover the expected field surface.
- Expanded the development-only `/design-preview` with all Input states and addons. It continues to return no public content in `NODE_ENV=production`. Existing semantic success/warning tokens were already present, so no raw colour or new dependency was added.
- QA passed: `pnpm typecheck`; `pnpm --filter web build` (25 routes); `pnpm lint` (137-row traceability contract); `pnpm test` (22 passed, 1 opted-out integration skipped); `git diff --check`; and a focused local Chromium + axe smoke. The browser check covers unique generated IDs, label click-to-focus, `required`, `aria-invalid`, helper alert/description, disabled behavior, 44px large-field geometry, RTL addon ordering, keyboard Tab focus, light/dark focus tokens, no 320px overflow and no serious/critical axe findings.
- Manually inspected `artifacts/screenshots/input-preview-light-320.png` and `artifacts/screenshots/input-preview-dark-320.png`. The known non-production Tailwind config module-type warning remains unchanged and is recorded in the preceding R7 Button entry; no type-safety control was relaxed to silence it.
- Input implementation commit: `4671dbd` (`feat(r7): add accessible Input primitive`). No remote action was taken.

### 2026-09-02 — R7 status, card and checkbox primitives

- Applied Ponytail `full` plus retained UI UX Pro Max design-system/UI-styling guidance to `~/amir/prompt-05.md`. Added token-driven `Badge` (seven semantic variants, size, dot and decorative icon), composable `Card` (outlined/elevated/interactive/offer variants and header/title/description/content/footer), and native `Checkbox` (label, description, error and disabled states).
- Reconciled malformed prompt values with existing semantic aliases: info/accent badges use the existing primary/accent subtle surfaces, solid uses the semantic primary foreground pair, and no package or raw colour was introduced into a component. `Card` is a minimal Client Component only because its `asButton`/interactive mode implements the required Enter/Space activation as well as focus behavior; other rendering remains native and stateless.
- Browser accessibility QA found a genuine 3.44:1 small-text contrast failure in the light warning Badge. Added primitive `--gold-700` and mapped `--color-warning` to it in the light semantic layer, raising the shared warning foreground to a compliant value for Badge and Input helper text. A separate dark-theme check found the previous `--color-text-muted` value insufficient on raised surfaces, so it now reuses the contrast-safe secondary text value (`#aeb7c2`).
- Expanded the development-only `/design-preview` to show every new variant and state; it remains empty in production. QA passed: `pnpm typecheck`; `pnpm --filter web build` (25 routes); `pnpm lint` (137-row traceability contract); `pnpm test` (22 passed, 1 opted-out integration skipped); `git diff --check`; and focused Chromium + axe smoke. The browser test verifies Badge RTL dot order; Card outlined/elevated/offer rendering and Enter/Space activation; Checkbox label toggle, native checked visual, error/described-by/alert semantics, disabled state and keyboard focus; light/dark tokens, no 320px overflow, and no axe violations after the theme transition settled.
- Manually inspected `artifacts/screenshots/badge-card-checkbox-preview-light-320.png` and `artifacts/screenshots/badge-card-checkbox-preview-dark-320.png`. The known non-production Tailwind config module-type warning is unchanged; no type-safety setting was weakened to suppress it.
- Primitive implementation commit: `06e31db` (`feat(r7): add status and form primitives`). Dark contrast correction: `b3ce320` (`fix(r7): strengthen dark muted contrast`). No remote action was taken.

### 2026-09-02 — R7 Select, Textarea and Toast primitives

- Applied Ponytail `full` and retained UI UX Pro Max design-system/UI-styling guidance to `~/amir/prompt-06.md`; no replacement visual world, product claims, font or raw component colour was introduced.
- Added pinned Radix Select `2.3.7` and Toast `1.2.23` to the web workspace for their accessible keyboard, focus-management and announcement primitives. Added token-driven `Select` (RTL, grouped/disabled options, labels, helper/error association and native form contribution), controlled/uncontrolled `Textarea` (error/success/disabled states and Persian character counter), and a bounded three-item global Toast store/provider with close button, keyboard close, swipe and semantic success/warning/error icons.
- Placed the global `Toaster` in the root layout. Replaced the RequestFlow organization native select and problem textarea with the new components: the former retains `FormData` submission under `organizationType`; the latter retains controlled text through review/edit/retry and exposes the ۸٬۰۰۰-character limit. A successful final request creates a customer-safe success Toast without exposing an internal status or note. The development-only preview demonstrates all new states and still returns no preview content in a production build.
- Browser QA found the existing `Input` outer wrapper could force 40px of horizontal overflow in the three-column preview at 768px. Added `min-w-0` at that shared wrapper, then verified 320/768/1440 page widths again; no layout workaround or overflow hiding was used.
- QA passed: `pnpm install --frozen-lockfile`; `pnpm typecheck`; `pnpm lint` (137-row traceability contract); `pnpm test` (22 passed, 1 opted-out integration skipped); `pnpm --filter web build` (25 routes); and `git diff --check`. Focused Chromium browser coverage at 320/768/1440 verifies RTL, Select opening/selection and physical-left check indicator, native `FormData` value, Textarea maxLength/counter, Toast success/error rendering and keyboard close, no horizontal overflow, and zero axe violations in settled light and dark themes.
- Manually inspected `artifacts/screenshots/select-textarea-toast-preview-light-{320,768,1440}.png` and `artifacts/screenshots/select-textarea-toast-preview-dark-320.png`; mobile and desktop show readable tokens, no clipped controls and no fixed-toast overlap. The pre-existing non-production Tailwind config module-type warning remains; no type-safety setting was changed to suppress it.
- Implementation commit: `eeda580` (`feat(r7): add Select Textarea and Toast primitives`). No remote action was taken.

### 2026-09-02 — R7 Header and Footer layout shell

- Applied Ponytail `full` and the retained UI UX Pro Max guidance to `~/amir/prompt-07.md`; this was a constrained extension of the existing visual system, not a replacement of its product claims, fonts or colour tokens.
- Added the pinned Radix Navigation Menu `1.2.22` and Dialog `1.1.23` dependencies. The new client Header provides a keyboard-accessible desktop solutions menu for the two existing solution routes, active-route state, a 44px mobile trigger, scroll shadow, and an RTL Dialog drawer that closes through Escape, overlay click and link selection. The root layout retains the skip link, main landmark, global toaster and strictly development-only SMS inbox condition.
- Replaced the duplicate legacy `Header`/`SiteChrome` shell with the new layout components. The responsive Footer uses only implemented routes and the confirmed legal name. Missing national ID, registration number, legal address, contact details and trust approvals remain visibly marked as publication blockers; no invented company fact, contact method, trust logo or unavailable route was added.
- QA passed: `pnpm install --frozen-lockfile`; `pnpm typecheck`; `pnpm lint` (137-row traceability contract); `pnpm test` (22 passed, 1 opted-out integration skipped); `pnpm --filter web build` (25 routes); and `git diff --check`. The existing non-production Tailwind config module-type warning remains during Next commands; the build/typecheck pass without relaxing the TypeScript configuration.
- Focused Chromium coverage at 320/768/1440 verified no horizontal overflow, RTL physical-right mobile drawer, focus return after Escape, overlay/link close, desktop Navigation Menu, active-link `aria-current`, scroll state and zero axe violations in settled light/dark themes. Manually inspected `artifacts/screenshots/layout-shell-home-{320,768,1440}.png`. A production-built, JavaScript-disabled 320px home page still exposed the heading, legal identity placeholder and footer without horizontal overflow.
- Implementation commit: `e22ef57` (`feat(r7): add accessible layout shell`). No push, merge or deployment was performed; no traceability mapping changed because this is a shared presentation shell rather than a new PRD requirement.

### 2026-09-02 — R7 responsive HeroDiagram

- Applied Ponytail `full` and retained UI UX Pro Max guidance to `~/amir/prompt-08.md`. Replaced the legacy `ProcessArt` with a token-driven, accessible visual instead of copying the supplied malformed SVG draft. It uses only existing semantic CSS variables; no dependency, external asset, unapproved brand fact or raw production colour was added.
- The diagram preserves the homepage's RTL visual logic: public/private organization inputs on the right converge on the primary analysis node and continue to a success-marked analytical/executable output on the left. At 320px it switches to an intentionally vertical composition, keeping labels readable rather than shrinking the desktop layout or permitting overflow. SVG marker IDs use `useId`, so multiple instances do not collide.
- Motion is a single 970ms-or-shorter process reveal: inputs, core, output and dashed flow paths arrive in causal order once. There is no loop. The static SVG needs no JavaScript state, and `prefers-reduced-motion` removes the enhancement while retaining the final diagram. The figure exposes one Persian process label and its SVG drawing is hidden from the accessibility tree.
- QA passed: `pnpm typecheck`; `pnpm lint` (137-row traceability contract); `pnpm test` (22 passed, 1 opted-out integration skipped); `pnpm --filter web build` (25 routes); `git diff --check`; full public Chromium smoke (4 passed, 2 synthetic-token skips); and a Chromium no-JavaScript home smoke. The focused browser test covers the process label, four visible nodes, three flows, 320/768/1440 no-overflow screenshots and reduced-motion final state; the public smoke includes axe serious/critical checks and dark RTL tokens.
- Manually inspected `artifacts/screenshots/hero-diagram-{320,768,1440}.png`; the mobile vertical visual and desktop RTL flow had no clipped labels or horizontal page scroll. The existing non-production Tailwind config module-type warning remains; build/typecheck pass without weakening configuration.
- Implementation commit: `80e7bd4` (`feat(r7): add responsive hero process diagram`). No push, merge or deployment was performed; no traceability mapping changed because this is a shared presentation illustration, not a new PRD requirement.

### 2026-09-02 — R7 HeroDiagram design correction

- Revisited the home illustration after review identified that `80e7bd4` had turned the value proposition into a compact customer-flow chart. Re-read the original PRD, `DESIGN.md`, product discovery and the pre-R7 artwork. The illustrated message must be the documented transformation of organizational need, financial rules and operational data into an executable, testable process; audience segmentation belongs to its dedicated homepage section, and an unearned proposal/contract edge does not belong in the Hero.
- Rebuilt `HeroDiagram` as original geometric document-flow artwork: three source marks feed layered model sheets and a shared model, which resolves into a verifiable process document. It retains the warm paper, navy, teal, green and restrained burgundy system; has no generic cards, stock/financial-chart motif, external asset or unsupported product claim. The narrow layout remains a coherent adaptation of the same drawing, with readable source labels and no horizontal overflow.
- Replaced client-only state with static server-rendered SVG plus CSS-only progressive reveal. The complete drawing renders without JavaScript; motion is a single <=320ms sequence and reduced motion retains the final state. The figure has one Persian accessible name and its vector drawing is presentational.
- QA passed: `pnpm --filter web typecheck`; `pnpm --filter web build` (25 routes); `pnpm typecheck`; `pnpm lint` (137-row traceability contract); `pnpm test` (22 passed, 1 opted-out integration skipped); Chromium public smoke (4 passed, 2 synthetic-token skips); and Chromium no-JavaScript home smoke. The focused screenshot test verifies the three source marks, shared model, executable outcome, 320/768/1440 no-overflow capture and reduced-motion final state; the public smoke includes axe serious/critical and dark RTL checks.
- Manually inspected the refreshed `artifacts/screenshots/hero-diagram-{320,768,1440}.png`; source labels are inside the SVG bounds at every recorded width and the mobile composition is readable. The known non-production Tailwind config module-type warning remains unchanged; no configuration safety control was weakened to hide it.
- Corrective implementation commit: `a25350f` (`fix(r7): align hero art with product method`). The preceding `80e7bd4` remains in local review history but its flow-chart implementation is superseded. No push, merge or deployment was performed.

### 2026-09-02 — R7 reference-led visual refinement

- Applied Ponytail `full` and the retained UI UX Pro Max guidance to the user-supplied visual reference. The reference was treated as a quality benchmark only: no name, copy, logo, code, image asset, layout reproduction, company fact, customer proof or metric was copied into Novin.
- Strengthened the existing editorial identity rather than replacing it: the warm page surface now carries a single restrained teal/burgundy atmospheric treatment; the hero has clearer type hierarchy, a readable original method board, explicit collaboration principles and stronger primary action; audience, problem, process, integration, journey and closing sections have distinct but related visual treatments. The documented financial-method illustration remains the content-bearing hero artwork.
- Refined the shared accessible palette to deep navy, compliant teal, green and limited burgundy. A real CSS cascade defect was corrected by removing the late global `a { color: inherit }` override that made token-based CTA text inherit its navy background. The mobile header now exposes a 44px `ثبت مسئله` CTA alongside the accessible Dialog navigation.
- Regression tests now reflect the current Radix Dialog mobile navigation and scope the request-success status to its semantic result, avoiding a false collision with Radix Toast's live announcer. Browser QA also identified two near-threshold teal instances; the accent and problem-output foreground were darkened until Axe reported no serious or critical contrast violation.
- QA passed: `pnpm lint` (including 137-row traceability contract); `pnpm typecheck`; `pnpm test` (22 passed, 1 opted-out integration skipped); `pnpm --filter web build` (25 routes); `git diff --check`; and `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/google-chrome pnpm exec playwright test --project=chromium` (8 passed, 2 synthetic private-token cases skipped). The browser test covers RTL, no-JS home readability, Axe serious/critical violations, the 320/768/1440 overflow checks, reduced-motion hero final state, mocked intake retry/success flow, and the mobile Dialog menu.
- Manually inspected the finished home evidence at `artifacts/screenshots/home-{320,768,1440}.png`, plus the request flow screenshots generated by the browser suite. The 320px header CTA measured 83.7×44px and no horizontal page overflow was observed. `docs/TRACEABILITY.csv` did not change because this commit introduces no new PRD behavior.
- Visual implementation commit: `d0ed60b` (`feat(r7): refine reference-led visual experience`). No push, merge or deployment was performed; production gates remain open.

### 2026-09-02 — R7 public-experience redesign

- Removed the ineffective homepage SVG illustration and its implementation file. The Hero now communicates the method through a readable, server-rendered editorial note and three explicit decisions; it has no decorative chart, external image or unverified product claim.
- Reworked the shared presentation system around self-hosted Estedad/Vazirmatn, warm ivory, deep navy, restrained turquoise, professional blue, green-for-success and limited burgundy. Public page templates, Header/Footer, request intake, controls, CTA hierarchy and responsive spacing now use the same language. The new geometric brand mark is original vector markup, not a borrowed logo or external asset.
- Reviewed UI UX Pro Max and Framer Motion Animator guidance for typography, targets, focus and motion discipline. Main controls remain at least 48px; compact navigation remains at least 44px; transitions are limited to color/transform and the existing reduced-motion override removes non-essential movement. Content remains readable without JavaScript.
- Corrected the request-flow screenshot harness to return to the document start before capture, so full-page evidence does not record a sticky header in a misleading scroll position. `docs/TRACEABILITY.csv` was reviewed: no PRD behavior, status or test mapping changed in this presentation-only checkpoint.
- QA passed: `pnpm typecheck`; `pnpm test` (22 passed, 1 opted-out integration test skipped); `pnpm lint` (137 traceability rows); `pnpm --filter web build` (25 routes); `git diff --check`; Chromium public/intake suite (8 passed, 2 private-token cases skipped); and focused intake flow (4 passed). Manually inspected `artifacts/screenshots/home-{320,768,1440}.png` and `artifacts/screenshots/request-{draft,review,success}-{320,768,1440}.png` for RTL, contrast, focus-visible treatment, long text, form states and horizontal overflow.
- Verified with a repository-wide text search that no reference to the removed frontend-design skill remains in tracked project files. Production gates are unchanged; this is not a deploy or production approval.
- Implementation commit: `f61df0b` (`feat(r7): redesign Persian public experience`). No push, merge or deployment was performed.

### 2026-09-02 — R7 turquoise process refinement

- Rebalanced the public palette so navy remains the authority color for headings and primary actions rather than a dominant full-width surface. The trust strip and the automation/integration section now use a deep green-turquoise surface; the Hero field, path identifiers, focus-adjacent accents and subtle surfaces carry the same family. Professional blue remains reserved for links and burgundy for sparse editorial emphasis.
- Added `IntegrationSignal`, an original and explicitly non-quantitative SVG illustration for the PRD-required automation/integration feature. It depicts only the documented conceptual sequence—business event, financial controls, connected systems and verifiable outcome—and retains a complete Persian list as the semantic, no-JavaScript equivalent. It neither resembles a market chart nor presents invented customers, financial figures or performance claims.
- Used the Framer Motion Animator guidance only for a small transform-based hover/tap response on that supplementary visual. `useReducedMotion` removes the interaction, and the global reduced-motion rule preserves the final readable state. No looping, parallax, scroll hijacking, external image or unlicensed asset was introduced.
- QA passed: `pnpm typecheck`; `pnpm lint` (137-row traceability contract); `pnpm test` (22 passed, 1 opted-out integration test skipped); `pnpm --filter web build` (25 routes); `git diff --check`; and focused Chromium public smoke (4 passed, 2 private-token cases skipped). The full Chromium suite was also launched after the production build and regenerated visual evidence; the focused run records the complete result. Manually inspected `artifacts/screenshots/home-{320,768,1440}.png` for teal prominence, RTL, contrast, 320px overflow and legible process artwork.
- Implementation commit: `bd9115a` (`feat(r7): shift public palette to turquoise`). No push, merge or deployment was performed. Production gates and `docs/TRACEABILITY.csv` are unchanged because this is a presentation refinement, not a new PRD behavior.

### 2026-09-04 — Approved guided-confidence frontend and motion

- Owner selected concept `۰۱ — اطمینان هدایت‌شده`. Replaced the superseded design specification with the approved blue-led system: trustworthy blue is dominant, turquoise and cream create calm operational surfaces, gold marks decisions, and burgundy is a sparse accent.
- Rebuilt the real homepage first viewport around a centered Persian statement, explicit free/non-contractual boundary, an RTL four-stage collaboration journey, and three start-of-engagement trust principles. The rest of the public experience now shares the expanded semantic palette without fabricated claims or statistics.
- Activated the existing Framer Motion layer: staged hero arrival, once-only viewport reveals, spring press/hover feedback, staggered journey cards, scroll progress, and progressive SVG paths. Motion uses opacity/transform and respects `prefers-reduced-motion`.
- Added self-hosted `@fontsource-variable/vazirmatn@5.2.8` under SIL OFL 1.1. The IranYekan display slot is documented but remains gated until the owner supplies licensed webfont files and redistribution evidence.
- Researched five image candidates for owner review only; the owner rejected all of them. No third-party image was added to the product, and the approved direction now explicitly remains stock-image-free.
- QA passed: full `pnpm typecheck`; full production `pnpm build` (۲۳ generated web pages); `pnpm lint` (۱۳۷ traceability rows); `pnpm test` (۱۹ passed, ۱ integration skipped); `git diff --check`; full Chromium E2E (۸ passed) including RTL, Axe serious/critical checks across representative surfaces, Vazirmatn, Persian journey numbers, reduced motion, mobile menu and no overflow at ۳۲۰/۷۶۸/۱۴۴۰px. The full browser pass found a ۴٫۱۲:۱ small-text contrast regression from the new turquoise; small detail indices now use the darker semantic turquoise and the repeated full run passed.
- Visual evidence was manually inspected at `artifacts/screenshots/replacement-first-viewport-{320,768,1440}.png` and `artifacts/screenshots/replacement-home-1440.png`. Production gates remain unchanged; no deployment or image publication was performed.
- Rejected concept drafts were moved without deletion to `/tmp/novin-design-drafts-20260904`; the retained internal `canon.png` was not changed. The delivery commit excludes those drafts.
- Implementation commit: `856debe` (`feat(web): deliver guided confidence experience`).

### 2026-09-04 — Transformation map correction

- Replaced the ambiguous zigzag/loop illustration after owner review. The new RTL convergence map has one explicit organizational-problem input, five correctly matched interactive analysis layers, and one executable-decision output. It no longer maps five controls onto six unlabeled SVG points or relies on absolutely positioned tags.
- Desktop draws five independent semantic paths from right to left and emphasizes the selected layer. Tablet and mobile use a readable vertical flow instead of shrinking the desktop artwork; every layer remains a native button with Persian numbering, `aria-pressed`, click support and a live textual explanation. Reduced-motion keeps the complete static result.
- Added a focused browser contract for the input/layer/output count and layer interaction, plus dedicated visual evidence at `artifacts/screenshots/replacement-diagram-{320,768,1440}.png`.
- QA passed: `pnpm typecheck`; `pnpm lint` (137 traceability rows); `pnpm --filter web build` (23 generated pages); `git diff --check`; and the complete Chromium E2E suite (9 passed), including Axe serious/critical checks and no horizontal overflow at 320/768/1440px. All three diagram screenshots were manually inspected after the final tablet-header adjustment.
- This correction changes no PRD behavior or traceability mapping. No third-party image or fabricated metric was added, and production gates remain unchanged.
- Implementation commit: `b77a253` (`fix(web): replace ambiguous transformation map`).

### 2026-09-04 — Transformation map arrow refinement

- Replaced the five curved desktop convergence strokes at the organizational-problem input with one straight left-pointing blue arrow matching the executable-output arrow. The five analysis layers remain explicit interactive controls; only the connector shape changed. The vertical tablet/mobile flow remains unchanged.
- QA passed: full `pnpm typecheck`; `pnpm lint` (137 traceability rows); `pnpm --filter web build` (23 generated pages); focused Chromium map/responsive checks; and `git diff --check`. Manually inspected the final 1440px rendering at `artifacts/screenshots/replacement-diagram-1440.png` and adjusted the endpoint until the arrowhead was fully visible outside the analysis card.

Copy unresolved gates from `DECISIONS.md` and close them only with evidence.

- Legal/privacy owner: approve and publish final terms, privacy, cancellation/refund, retention copy, and version identifiers; remove all drafts only after approval.
- Company owner: supply approved registered name, national/registration IDs, address, phone, public email, and contact escalation details.
- Finance/Technical: provide the approved payment-gateway contract, merchant identity, callback secret, and successful server-verification evidence.
- Operations/Technical: provide Kavenegar, SMTP/DNS, Turnstile, and licensed brand-asset approvals; disable every development inbox/seed/mock setting.
- Infrastructure: install approved TLS/Nginx configuration and certificate for `karafintech.ir`, provide the encrypted `age` recipient and separately held recovery identity, perform/record an isolated restore drill, and select/maintain an approved ClamAV signature feed or private mirror. The current upstream ClamAV CDN cool-down is a fail-closed release blocker.
- QA infrastructure: install WebKit system libraries (or run the supplied CI job) and retain its successful smoke evidence. This does not change production application behavior.
