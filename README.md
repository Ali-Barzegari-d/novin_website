# Novin Iranian financial analysis platform

This repository seed turns the approved PRD and discovery answers into an autonomous implementation contract for Codex.

Human: read `START_HERE.md`.

Agent: read `AGENTS.md` and follow its mandatory document order.

The repository contains the Persian RTL public site, customer intake/account experience, private offer/payment/invoice flows, role-aware internal workspace, API, worker, PostgreSQL model and production operations scaffold.

The replacement frontend is served at `http://localhost:3050`; the API remains internal on port `4000` in Compose. Start development with `pnpm dev`, run the automated checks with `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, and run Chromium acceptance with `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/google-chrome pnpm exec playwright test --project=chromium`.

Production remains deliberately fail-closed until the company identity, legal text, public evidence, provider credentials, HTTPS and operations gates listed in `DECISIONS.md`, `ACCEPTANCE.md` and `PROGRESS.md` are approved. Do not set `NEXT_PUBLIC_RELEASE_READY=true` before those gates pass.
