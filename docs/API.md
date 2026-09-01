# API contract

The machine-readable specification is available at `/api/v1/openapi.json`. Authentication uses the `novin_session` HttpOnly opaque cookie; mutating browser requests are origin-checked. The public offer and invoice routes use long random opaque tokens stored only as hashes.

Provider adapters are isolated in `apps/api/src/lib/payment.ts`: mock payment is deterministic and non-production only; the gateway adapter requires a merchant ID, callback HMAC secret, and approved gateway base URL. It verifies amount server-side before changing an order state. Secrets are intentionally never part of this API or the admin settings response.
