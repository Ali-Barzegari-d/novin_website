# Security, privacy, and data handling

## Threat model priorities

Protect against account/OTP enumeration, credential/session theft, insecure direct object references, internal-note/status leakage, malicious uploads, offer-token guessing, callback replay/forgery, amount tampering, privilege escalation, audit deletion, secret leakage, and mock-provider activation in production.

## Authentication and sessions

- Normalize Iranian mobiles to one canonical E.164 representation.
- OTP is 6 random digits from a cryptographic RNG, expires after 2 minutes, can resend after 60 seconds, and allows at most 5 verify attempts.
- Store only a keyed hash of the OTP with challenge metadata; never log or persist plaintext outside the explicit dev mock inbox.
- Rate limits combine trusted client IP, mobile, challenge, user/session, and route. Use generic success/error responses to resist enumeration.
- Apply progressive cooldown after repeated requests and Turnstile on suspicious/public abuse thresholds. Dev bypass is impossible in production.
- Opaque, random, secure, HttpOnly, SameSite cookies; 8-hour absolute session lifetime; rotate on login/MFA; revoke on logout, staff disablement, role change, mobile change, and security event.
- CSRF protection for cookie-authenticated mutations; strict origin validation; do not rely on SameSite alone.
- Superadmin creation is a one-time CLI flow. Superadmin TOTP MFA is mandatory; recovery codes are one-time hashed values. Sensitive actions require recent re-authentication.

## Authorization

Server-side deny-by-default RBAC for customer, expert, operations, finance, content, and superadmin. Enforce object ownership separately from role permission. Build an executable authorization matrix covering list, read, create, update, transition, export, download, financial approval/refund, content publication, user/role administration, and audit/error access.

Never reuse internal DTOs for customer APIs. Customer request responses omit internal state, assignment, notes, screening, offer history not addressed to them, file paths, and audit metadata.

## Files

- Default allowlist: PDF, DOCX, XLSX, PNG, JPEG; max 10 MB; configurable by authorized admin.
- Reject archives, executables, scripts, macro-enabled Office formats, password-protected/encrypted files that cannot be scanned, polyglots, double extensions, malformed images, and MIME/extension mismatch.
- Generate server-side filenames; retain original name only as escaped metadata.
- Write to a quarantine bind mount outside any public web root. Stream with size limits; never buffer an unbounded upload.
- Scan via internal ClamAV. An unavailable/outdated scanner produces a quarantined failure, never a clean result.
- Move only clean files to private storage. Downloads require explicit authorization and use short-lived application-mediated access; add no-sniff and safe content-disposition.
- Log security events without logging file contents or sensitive descriptions. Apply retention and secure deletion jobs.

## Offers and payments

- Offer tokens use >=128 bits cryptographic randomness; store hashes only; compare safely; revoke and expire server-side.
- Compute prices/tax/total on the server in integer IRR. Protect updates with versioning, authorization, re-authentication, audit, and transaction constraints.
- Callback never trusts query/body status. Verify with provider server-to-server, validate reference/amount/order, and use idempotency + unique constraints.
- Store no card data. Keep only provider references/status/timestamps permitted by policy.
- Bank-transfer receipts follow the same private upload pipeline. Only finance can confirm/reject; confirmation is idempotent and audited.
- Paid offers/orders are immutable in place; corrections create a new document/record.

## Audit and logs

- Append-only audit entries for auth/security events, request transitions, assignment, amount/offer change, consent, bank confirmation/rejection, refund, content/legal publication, staff role/status, settings, and provider configuration changes.
- Include actor, role, action, target, timestamp UTC, request/correlation ID, reason, and redacted before/after. Do not log secrets, OTP, token values, problem description, or file contents.
- Restrict audit/error views. Export is permissioned and itself audited.
- Structured JSON app logs rotate on the host bind mount; timestamps are UTC. Sanitize headers/cookies/body fields.

## Privacy and retention

Collect only PRD fields. No real production data in dev/test. External analytics are disabled. Internal product events use non-PII identifiers and approved enums/buckets only.

Implement configurable retention from `DECISIONS.md`, legal hold, dry-run reports, and auditable execution. Account deletion is a verified request workflow: revoke access, remove/pseudonymize optional profile/content, delete eligible attachments, and preserve legally required payment/consent/audit records with minimized identity.

Use HTTPS, encrypted host disk/backup, least-privilege DB roles, private networks, and secrets outside Git. Bind mounts must have narrow ownership/mode. Backups are encrypted before leaving the database container/host and are restore-tested.

## Application and platform hardening

- Validate environment at startup; production rejects mock/bypass providers, default secrets, debug routes, dev inbox, seed users, draft-required legal pages, missing HTTPS proxy trust config, and permissive CORS.
- Explicit trusted proxy count/range for host Nginx; never trust arbitrary `X-Forwarded-*`.
- CSP with nonces/hashes as needed, HSTS at the host, frame-ancestors, nosniff, referrer policy, permissions policy, secure cache headers.
- Same-origin API by default. No wildcard CORS.
- Containers run non-root, read-only root FS where practical, drop capabilities, have health checks/resource limits, and use internal networks.
- Pin dependencies/images; run lockfile integrity, audit, SBOM, secret scan, and container scan in CI. Block critical/high exploitable findings unless documented with owner and expiry.
- Database migrations run once with advisory locking. Back up before production migration. Never auto-downgrade an irreversible schema.

## Required security tests

- RBAC/ownership matrix and staff-disable immediate revocation
- OTP enumeration, expiry, resend, attempt, IP/mobile/user rate limits, replay, and race
- CSRF/origin, session fixation/rotation/revocation, cookie flags, TOTP/recovery
- IDOR across users/organizations/requests/offers/files/admin exports
- Upload abuse including EICAR and ClamAV unavailable/outdated
- Offer token entropy/hash/expiry/revocation and link leakage/caching
- Payment amount mismatch, fake/replayed/concurrent callbacks, verify failure, idempotency
- Audit/consent immutability and redaction
- Production-config negative tests proving mocks/bypasses/dev inbox/default secrets cannot start
- Dependency, secret, SAST, container, and security-header smoke checks

Security defects affecting trust boundaries, authorization, money, data loss, secret exposure, or audit integrity block the release.
