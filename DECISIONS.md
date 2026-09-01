# Product and engineering decisions

This file resolves the discovery answers and their conflicts with PRD v1.0. These are implementation defaults, not invented legal or financial approvals.

## Locked decisions

| ID | Decision |
|---|---|
| D-01 | Deliver the complete MVP through R5. R1–R5 each require QA and a named commit. |
| D-02 | Implement every PRD Must and Should. Could items remain out unless necessary for a Must/Should. |
| D-03 | The agent works autonomously and stops only on an unsimulatable external boundary. |
| D-04 | Repository starts empty. Initialize Git, preserve the planning pack, and use GitHub + GitHub Actions. |
| D-05 | Use Ponytail `full`; safety, accessibility, auditability, tests, Musts, and Shoulds are never reduced. |
| D-06 | Use UI UX Pro Max plus the local `DESIGN.md`. Official sources only; record skill provenance. |
| D-07 | Use a pnpm TypeScript monorepo with separate `apps/web` and `apps/api`; do not collapse them into a full-stack Next.js app. |
| D-08 | Stack: Next.js web, Fastify API, PostgreSQL, Redis, Drizzle ORM/migrations, Tailwind CSS, Playwright, Vitest, Docker Compose. Pin supported stable versions at R0 and record them. |
| D-09 | Redis is required for OTP state, rate limiting, session state/deny-list, short jobs, and bounded notification retries. Do not add a second queue/cache system. |
| D-10 | CMS is internal and PostgreSQL-backed. Draft/published content, revisions, publication approval, case studies, clients, team, legal pages, and message templates are managed in the admin UI. |
| D-11 | Expected load is 1,000 visits/day and 50 concurrent users. Favor a simple single-host deployment with clean horizontal escape hatches, not premature distributed architecture. |
| D-12 | Target server: Ubuntu 24.04 AMD64, sudoer, 4 GB RAM, 40 GB disk. Resource budgets are enforced in Compose and checked during soak tests. |
| D-13 | Host Nginx terminates HTTPS for `karafintech.ir` and proxies to `127.0.0.1:3050`. Only 3050 is published; database, Redis, API, worker, and ClamAV remain internal. |
| D-14 | All persistent Docker data uses explicit bind mounts below `./var/`; no Docker named volumes. |
| D-15 | Environments are `dev` and `production`; tests use ephemeral CI services/config but not a separately administered environment. |
| D-16 | Backups are encrypted daily, with 7 daily and 4 weekly generations, RPO <=24h and target RTO <=8h. A restore drill is required before R5. |
| D-17 | SMS has a Kavenegar adapter plus a deterministic mock. In dev/demo, a bottom-left SMS inbox appears on the homepage. It must not render or operate in production. |
| D-18 | No production email service is currently selected. Still implement the email outbox, templates, SMTP adapter, mock mailbox, and contract tests because email is a PRD Must. Production preflight fails until SMTP and domain authentication are verified. |
| D-19 | No real online payment gateway is currently selected. Implement a payment-provider contract, a deterministic dev-only gateway, server-side verify/idempotency, and manual bank transfer. Production preflight fails until an approved real gateway is configured and certified. |
| D-20 | Currency is IRR. Store integer rials only. Tax is configurable in basis points; seed 0 and label it pending finance/legal approval. Never hard-code a guessed tax rate. |
| D-21 | Offer validity defaults to 7 days and is editable per offer. Expired/revoked links are read-only and cannot accept payment. |
| D-22 | Initial bank-transfer fields: tracking/reference number, transfer date/time, amount, bank, depositor name, and optional receipt image. The receipt is private and malware-scanned. Financial staff must confirm or reject it. |
| D-23 | The system issues a simple payment receipt, not a statutory tax invoice, until finance confirms invoicing requirements. |
| D-24 | Refund execution is recorded and audited in MVP; it is not automatically pushed to a gateway until a provider supports it. |
| D-25 | OTP: 6 digits, 2-minute expiry, 60-second resend delay, max 5 verification attempts. Responses resist account enumeration. Iranian mobile numbers only. |
| D-26 | Customer and admin sessions have an 8-hour absolute lifetime. Use secure opaque sessions, rotation after authentication/MFA, revocation on role/status change, and re-authentication for sensitive operations. |
| D-27 | Superadmin is created only through an idempotent one-time CLI/Make target and must enroll TOTP MFA on first use. No public staff registration. |
| D-28 | Schema keeps the PRD Membership relation, but the MVP UI allows one active organization per customer. Internal roles required by PRD are implemented; initial production seed creates only a superadmin. |
| D-29 | Company legal name is «شرکت طراحی و تحلیل مالی نوین ایرانیان». Domain is `karafintech.ir`. Registration ID, national ID, address, phone, email, final trade name, logo, team, clients, and case studies are not yet supplied. |
| D-30 | Missing company/content facts use visibly marked, CMS-managed placeholders. They are never presented as real claims and production preflight blocks publication where required. |
| D-31 | Draft legal pages are generated with the label «پیش‌نویس — نیازمند تأیید حقوقی». Legal approval and effective version are production gates. |
| D-32 | Complaints use a public, rate-limited form with a tracking code. Authentication is optional; sensitive evidence is not accepted in the initial form. |
| D-33 | Persian RTL only for MVP, with locale-ready code boundaries. No English pages and no dark mode. UI numerals are Persian; stored values and machine APIs remain canonical ASCII/UTC. |
| D-34 | Visual direction: formal, modern, premium, culturally grounded, and attractive. Use navy/teal/green with restrained burgundy and Persian-gold accents. Avoid generic banking charts, stock imagery, flag motifs, and copied layouts. |
| D-35 | Typography roles: Estedad for display headings, IranYekan for body only if licensed files are supplied, and Vazirmatn as open fallback/body default. Do not bundle proprietary fonts without rights. |
| D-36 | Motion is subtle/moderate and respects `prefers-reduced-motion`. WCAG 2.2 AA is the target. |
| D-37 | Web research and image search are allowed. Use only assets with verified license/permission and store attribution metadata. Prefer original abstract geometry and typography until real company photos exist. |
| D-38 | No third-party analytics in this phase. Keep only privacy-safe internal operational/funnel events required by the PRD; never include problem text or PII in analytics properties. |
| D-39 | Error monitoring is self-hosted inside the product: structured JSON logs, persisted error events, health checks, an admin error view, log rotation, and optional resource-light uptime checks. Do not deploy Sentry self-hosted on a 4 GB host. |
| D-40 | Host disk/volume encryption plus TLS is sufficient unless legal review changes it. Secrets still require secret files/environment controls and never enter Git. |
| D-41 | ClamAV is mandatory. Use the official container, internal network only, signature health check, resource limits, quarantine, and fail-closed behavior for unscanned files. |
| D-42 | Account deletion is an authenticated deletion/anonymization request. Preserve legally/audit-required finance, consent, and security records; remove or pseudonymize other personal data after review. |
| D-43 | Seed data is fully synthetic Persian data and includes all critical states from the PRD. Never use real production data in dev/test. |
| D-44 | Destructive maintenance commands require multi-step confirmation and explicit environment checks. No production target may delete the database, uploads, or backups. |

## Provisional policy defaults

These defaults are configurable and must be approved by the named owner before R5 is called production-ready.

| Policy | Default | Owner/gate |
|---|---|---|
| Rejected/archived requests | 2 years, then anonymize unless legal hold | Legal/privacy |
| Initial attachments | 180 days after closure/rejection | Legal/privacy |
| OTP security events | 90 days; never store plaintext OTP | Security |
| Notification delivery logs | 1 year | Operations/privacy |
| Payments, receipts, consent, immutable audit | 10 years | Finance/legal |
| Complaints | 5 years after closure | Legal |
| Internal funnel events | 90 days | Product/privacy |
| Cancellation | Draft: full refund >=48h before session; one reschedule >=24h; otherwise manual review | Legal/operations |
| File upload | 10 MB; PDF, DOCX, XLSX, PNG, JPEG; no macros/archives/executables | Security/operations |

## Non-negotiable production gates

- Final legal registration/contact data and authorized brand assets
- Approved privacy, terms, cancellation/refund, confidentiality, and complaint text
- Confirmed retention schedule and deletion procedure
- Kavenegar production credentials/templates and delivery test
- SMTP provider/configuration plus SPF/DKIM/DMARC verification
- Approved payment gateway credentials, callback allowlist/signature rules, sandbox certification, and live verification test
- Finance-approved tax/invoice rules and bank-transfer instructions
- Written publication approval for every client logo, case study, team profile, and photo
- Licensed IranYekan files if that font is enabled
- HTTPS certificate, final Nginx config, encrypted backup recipient, tested restore, and incident contacts

R1–R4 can pass in dev/demo with gates open. R5 may be operationally complete but must be reported as blocked for public production until every applicable gate is closed.
