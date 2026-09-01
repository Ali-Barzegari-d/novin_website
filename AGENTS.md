# Autonomous implementation contract

## Mission

Build and validate the complete MVP described by the PRD for «شرکت طراحی و تحلیل مالی نوین ایرانیان». Work autonomously from R0 through R5. Implement every PRD `Must` and `Should`. Never silently weaken a requirement because credentials, legal copy, brand assets, or production providers are missing; use adapters, safe mocks in non-production, and explicit production gates.

Target agent/model: Codex in an IDE using `GPT-5.6 terra`.

## Mandatory read order

Before editing code, read these files completely:

1. `START_HERE.md`
2. `docs/PRD.md` (the DOCX in `docs/PRD.docx` is the source artifact)
3. `docs/PRODUCT_DISCOVERY.md`
4. `DECISIONS.md`
5. `PLAN.md`
6. `ARCHITECTURE.md`
7. `DESIGN.md`
8. `CONTENT.md`
9. `SECURITY.md`
10. `ACCEPTANCE.md`
11. `DEPLOYMENT.md`
12. `docs/TRACEABILITY.csv`

Then write a concise execution checklist into `PROGRESS.md` and begin. Do not ask questions already answered in these documents.

## Repository bootstrap

If `.git` does not exist, run `git init -b main`. Create the pnpm workspace and scaffold only what is needed by the approved architecture. Preserve all planning documents. The first commit is:

`chore(repo): establish product baseline`

Use conventional commits. Do not rewrite published history. Never commit credentials, production data, generated backups, uploads, build output, or licensed font files without confirmed redistribution rights.

## Required skills

Use Ponytail in `full` mode for all implementation and review work. Ponytail controls complexity, not scope: it may remove needless abstractions, but it may never cut validation, security, accessibility, auditability, tests required by this plan, or a PRD Must/Should.

1. Inspect the available skills/plugins first.
2. If Ponytail is installed, activate `full` and record the detected version/commit in `PROGRESS.md`.
3. If unavailable, install from the official source using Codex plugin support when available:
   - `codex plugin marketplace add DietrichGebert/ponytail`
   - `codex plugin add ponytail@ponytail`
4. If plugin installation is unavailable, clone `https://github.com/DietrichGebert/ponytail` into a temporary directory, verify the MIT license, record the resolved commit in `docs/SKILL_PROVENANCE.md`, and vendor only the project-local files needed for Codex. Read `skills/ponytail/SKILL.md` fully and apply it in `full` mode.

For frontend work, use UI UX Pro Max. Prefer an already-installed skill. Otherwise run the official `ui-ux-pro-max-cli` Codex initialization or use the official repository `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`. Record source, version/commit, license, and files retained in `docs/SKILL_PROVENANCE.md`. Generate a project design system, then reconcile it with `DESIGN.md`; `DESIGN.md` wins on brand and product constraints.

Do not download code or assets from lookalike repositories. Never overwrite this repository's `AGENTS.md` when installing a skill. Merge only the relevant skill guidance.

## Operating rules

- Continue without waiting for confirmation unless an external permission boundary blocks the work.
- For missing business facts, use conspicuous placeholders defined in `CONTENT.md` and add a production preflight failure.
- For missing provider credentials, implement the interface, real adapter, deterministic mock, contract tests, and fail-closed production configuration.
- Never claim production readiness while any blocker in `DECISIONS.md` or `ACCEPTANCE.md` remains open.
- Keep `docs/TRACEABILITY.csv` current: every PRD ID must map to code, tests, release, and status.
- Keep `PROGRESS.md` current: commands run, test evidence, screenshots, commit SHA, open gates, and next action.
- Prefer existing/native features and small dependencies. Justify every runtime dependency in the PR description or commit body.
- Use database constraints and transactions for invariants involving money, idempotency, ownership, status transitions, and immutable consent/audit records.
- All public copy is Persian and RTL. Code, identifiers, commit messages, and technical docs may be English.
- Search the web for inspiration or factual updates only when needed. Never copy a design or unlicensed asset. Store asset source/license metadata.
- Do not expose internal request status, internal notes, exact analytics data, private uploads, secrets, or provider diagnostics to customers.

## Release loop and commits

Each release is a vertical slice. For R1 through R5:

1. Update the traceability matrix and execution checklist.
2. Implement the smallest complete slice.
3. Run the release's automated and manual QA in `ACCEPTANCE.md`.
4. Capture screenshots at 320, 768, and 1440 px for affected primary routes.
5. Fix every blocking defect; do not waive failing security, authorization, money, data-loss, or accessibility tests.
6. Update `PROGRESS.md` with evidence and remaining production gates.
7. Commit only when the gate passes:
   - `feat(r1): deliver corporate website`
   - `feat(r2): deliver request intake`
   - `feat(r3): deliver offers and payments`
   - `feat(r4): deliver licensing readiness`
   - `feat(r5): deliver production operations`

Additional focused commits are allowed. The named release commit must still exist and point to the passing state.

## Definition of stop

Stop only when one of these is true:

- R5 passes and all evidence is recorded; or
- work is blocked by an external permission/credential/legal approval that cannot be simulated safely.

In the blocked case, finish every unblocked item, leave the repository runnable in dev/demo, make a checkpoint commit, and report the exact gate, owner, required input, and verification command. Do not ask a broad question.

## Final response contract

Report:

- release status and final commit SHA;
- commands for dev, test, deploy, health, backup, restore, and rollback;
- QA summary with links/paths to reports;
- remaining production gates, if any;
- exact URL/port expectations.

Do not call mocks, placeholders, draft legal text, or unlicensed brand assets production-ready.
