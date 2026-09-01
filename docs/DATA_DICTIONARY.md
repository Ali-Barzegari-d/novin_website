# Data dictionary and lifecycle

| Domain | Core records | Lifecycle / invariant |
|---|---|---|
| Identity | `users`, `sessions`, `otp_challenges`, `mfa_factors` | OTP hashes expire; opaque session tokens are stored hashed; Superadmin sensitive operations require MFA. |
| Organization | `organizations`, `memberships` | A person is a representative; billing legal name, national ID and address are required before payment. |
| Intake | `requests`, `screenings`, `request_assignments`, `attachments` | Request idempotency is unique per owner; internal state and notes are never returned to customer account APIs. |
| Offers/orders | `offers`, `offer_versions`, `orders`, `consent_logs` | Offer versions are immutable; orders snapshot the accepted version; a paid offer cannot be destructively edited. |
| Money | `payments`, `bank_transfers`, `refund_records`, `contract_invoices` | Integer IRR only; a verified payment is idempotent; refund totals cannot exceed collected amount. No card data is stored. |
| Communications | `notification_templates`, `notifications`, `outbox_jobs` | Template versions are append-only; delivery status, attempts and provider reference are recorded. |
| Governance | `audit_logs`, `error_events`, `legal_documents`, `service_settings` | Consent and audit records are immutable in normal UI; service settings exclude credentials; errors are correlation-ID based. |

All database timestamps are UTC. UI renders Persian locale dates; no personal or financial content is sent to behavioral analytics.
