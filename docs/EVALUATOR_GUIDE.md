# MVP evaluator guide

This guide uses only synthetic development data. Never run the seed command in production.

## Start

1. `make bootstrap ENV=dev`
2. `make install`
3. `make dev`
4. In a second terminal: `make migrate ENV=dev`, then `make seed ENV=dev`.

Expected local URLs are web `http://127.0.0.1:3050`, API `http://127.0.0.1:4000`, and readiness `http://127.0.0.1:4000/health/ready`.

## Acceptance walkthrough

1. Open `/request`, authenticate with a synthetic mobile number, complete the representative and organization fields, describe a problem without choosing a service, review it, and submit. Repeat with the same idempotency key through the API; the second response must be `duplicate: true`.
2. Upload a PDF, DOCX, XLSX, PNG, or JPEG only after accepting the confidentiality warning. Check that it is `CLEAN` in the private attachment table. Try an executable, a double extension, a macro-enabled Office file, or EICAR content; it must fail with a usable Persian error.
3. As Operations, qualify a request and create a private offer. Open `/offer/<token>` at 320, 768, and 1440 px. No price is visible on public marketing routes; the offer shows base, tax, and final IRR only on its secret link.
4. As the customer, verify email in `/account`, complete billing fields, accept the displayed terms version, and choose mock payment in development. Replay the callback: the second response must be `duplicate: true`; the receipt remains exactly one PAID order.
5. Create a bank transfer for another synthetic offer. Verify it remains `REVIEW_PENDING` until Finance confirms it; reject and refund actions must produce audit rows.
6. As Superadmin with TOTP, inspect `/admin/settings`; update only the non-secret upload policy. Service credentials must never be returned from this route.
7. Run `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and Chromium E2E. Run `make preflight-production`; it must fail until the documented external gates are closed.

## Expected production gates

Legal identity/contact details, approved legal/retention copy, an approved payment-gateway endpoint and credentials, Kavenegar/SMTP credentials and mail DNS, CAPTCHA keys, licensed brand assets, TLS, an age backup recipient, and an evidenced restore drill are external gates. A failing production preflight is correct until those inputs are supplied.
