# Retention, deletion and anonymization

Customer may submit a deletion/anonymization request from `/account`. The request is audit logged immediately. After the configured MVP review window of 30 days, the worker revokes sessions, disables the account, and removes direct identity/profile fields while preserving money, consent, and audit references that must remain for legal/accounting purposes.

Private attachments have a per-record expiry. The worker marks expired clean files `EXPIRED` and removes the private stored object. Attachments, requests, offers, orders, payments, bank records, refunds, consent, and audit records are not physically deletable through ordinary interfaces.

Before production launch, Legal/privacy must approve the exact legal basis, retention periods, subject-access process, and approved copy. This is enforced as a production preflight gate.
