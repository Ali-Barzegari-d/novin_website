# R6 follow-up backlog

This is a prioritized checkpoint backlog, not a statement of production readiness.
The final Persian server runbook remains a whole-project deliverable and must be
written only from a successful, clean-server deployment rehearsal.

| Priority | Item | Owner / required input | Acceptance evidence |
|---|---|---|---|
| P0 | Require recent MFA for factor recovery/enrollment and every sensitive administrator/finance action; prevent OTP-only MFA re-enrollment. | Security + product owner | Authorization tests for session age, MFA challenge and factor lifecycle; security review. |
| P0 | Make financial lifecycle authoritative: concurrent collection/refund totals, expired bank-transfer offers, offer issuance, refund/transfer administration and race tests. | Finance + engineering + approved gateway contract | Real disposable database tests plus approved provider sandbox verification. |
| P0 | Close launch facts: approved company identity/contact data, final legal/privacy/refund/retention copy and version IDs, licensed brand assets. | Company/legal owner | Published CMS output reviewed and production preflight passes without placeholders/drafts. |
| P0 | Configure and verify production providers: Kavenegar, SMTP/DNS, Turnstile, gateway, ClamAV signature source, TLS/DNS and secrets. | Operations + provider owners | Fail-closed production preflight, provider sandbox evidence and a no-demo/no-mock configuration audit. |
| P1 | Complete CMS-backed public content and consent versioning; effective Turnstile validation; upload-abuse/redaction coverage. | Content + engineering | Versioned publication/consent tests and abuse-case test suite. |
| P1 | Harden operations: isolate restore target by real configuration, deploy lock, first-install/migration path, backup monitoring, encrypted backup and clean isolated restore drill. | Operations | Recorded restore drill and tested rollback from the deployed artifact. |
| P1 | Reproduce WebKit browser smoke on a provisioned Playwright/CI runner and resolve the current `page.goto` internal error or document the runner defect. | QA infrastructure | Passing WebKit suite retained as CI artifact. |
| P2 | After P0/P1 deployment rehearsal, author and validate the Persian midlevel server runbook: prerequisites, DNS/TLS, initial install, migration, admin/MFA, health, backup/restore, rollback and troubleshooting. | Operations + engineering | Commands demonstrated on the clean-server rehearsal; no untested deployment command presented as authoritative. |
