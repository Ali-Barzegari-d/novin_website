# Deployment and operations

> Production deployment is intentionally blocked after the owner-requested frontend reset on 2026-09-04. The retained API/domain stack can be built and tested, but the public web service and port 3050 must not be reported healthy until a replacement frontend is implemented.

## Target

- Ubuntu 24.04, AMD64, 4 GB RAM, 40 GB disk, sudo access
- Domain: `karafintech.ir`
- Host Nginx terminates TLS and proxies to `http://127.0.0.1:3050`
- Docker Engine + Compose v2
- Only host port 3050 is used by the application; bind to loopback, not `0.0.0.0`
- Outbound internet is available for providers, image pulls, updates, and certificate operations

## Persistent directories

All are explicit bind mounts rooted at the repository deployment directory:

```text
var/
  postgres/
  redis/
  uploads/quarantine/
  uploads/clean/
  backups/daily/
  backups/weekly/
  logs/
  clamav/
```

`make bootstrap` creates them with narrow ownership and modes. `.gitignore` excludes `var/` except documentation placeholders. Production deploy refuses symlinks, world-writable directories, insufficient free disk, or mounts outside the approved root.

## Compose services

- `web`: Next.js standalone, host `127.0.0.1:3050:3000`
- `api`: internal Fastify API on 4000
- `worker`: notification/retention jobs using the API image
- `postgres`: internal only, bind-mounted data, health check
- `redis`: internal only, AOF as selected, maxmemory policy that does not silently evict critical state
- `clamav`: internal only, signature/data bind mount, health/readiness

Use health-gated dependencies, restart policies, graceful termination, non-root users, dropped capabilities, read-only root filesystems where practical, tmpfs for temp paths, and resource budgets from `ARCHITECTURE.md`.

The Compose file tags application images with the Git SHA supplied by `deploy.sh`; external service images are pinned to reviewed content digests. The API and worker run as `APP_UID:APP_GID`, so their three writable mounts must be owned by that deployment identity. This prevents a root container workaround for host-owned private data.

## Host Nginx contract

- HTTP redirects to HTTPS; canonical host is `karafintech.ir`.
- TLS certificate and modern protocol/cipher policy are managed on the host.
- Proxy to `127.0.0.1:3050`; preserve host and trusted forwarding headers.
- Set upload request limit slightly above the application 10 MB limit (for multipart overhead), bounded timeouts, and rate limits for public auth/complaint endpoints where appropriate.
- HSTS only after HTTPS is proven; CSP is application-generated where nonces are needed.
- Never proxy internal Compose service ports directly.

Provide `infra/nginx/karafintech.ir.conf.example`; installation requires explicit sudo outside the deploy script unless the operator has approved it.

## Make target semantics

| Target | Required behavior |
|---|---|
| `help` | list safe targets and environment expectations |
| `bootstrap` | verify tools, create bind dirs, install hooks/config examples, no secrets |
| `install` | reproducible frozen pnpm install |
| `dev` | start local dependencies/apps with dev-only mocks |
| `lint` / `typecheck` | static quality gates |
| `test` | unit + integration |
| `test-e2e` | production-like Playwright/a11y journeys |
| `build` | reproducible app/container build |
| `up` / `down` / `restart` | Compose lifecycle; `down` never removes data |
| `logs` / `ps` / `health` | bounded diagnostics without secret leakage |
| `migrate` | advisory-locked forward migration with environment checks |
| `seed` | synthetic dev/test data only; production requires explicit safe seed mode |
| `admin-create` | one-time superadmin creation and TOTP enrollment handoff |
| `backup` | encrypted, checksummed backup with retention |
| `restore` | validated explicit backup restore with multi-step confirmation |
| `deploy` | sync policy, backup, build, migrate, restart, health/smoke, safe rollback |
| `rollback` | last known-good app image/version; no blind DB downgrade |
| `clean-safe` | remove build/test caches only, never persistent `var/` data |
| `preflight-production` | fail closed on every production gate |

Destructive DB reset/volume delete targets are absent in production. Dev-only reset requires `ENV=dev`, typed confirmation token, explicit absolute target validation, and a new backup when applicable.

## Deploy sequence

1. Acquire a deploy lock and verify branch/commit policy, clean config, disk/RAM, Docker, bind directories, backup recipient, and production preflight.
2. Pull/fetch only according to configured deployment mode; record current commit/image as last known good.
3. Create encrypted, checksummed pre-migration backup.
4. Build immutable images tagged with Git SHA; do not use mutable `latest` as the only reference.
5. Run migration once under advisory lock.
6. Start services and wait for Postgres/Redis/ClamAV/API/web readiness.
7. Run local health then public HTTPS smoke: homepage, legal page, login, API readiness; never execute a real payment in deploy.
8. On failure, restore prior application images. Restore the database only through the explicit restore runbook when migration compatibility requires it.
9. Record deploy SHA/time/result and release evidence.

## Backup and restore

- Daily `pg_dump` in a consistent custom format plus essential upload metadata/files according to policy.
- Compress, checksum, and encrypt with an `age` recipient/public key; private recovery key never resides in the repository.
- Keep 7 daily and 4 weekly copies. Do not delete the newest known-good backup. Alert on missing/zero/suspiciously small backup.
- A backup is not valid until decrypt/list/restore is tested. R5 requires a restore into an isolated temporary database, migration check, row-count/sentinel verification, and documented duration under the 8-hour RTO target.
- Backups and uploaded files must fit the 40 GB disk; `health` reports disk use and retention status.

## CI/CD

GitHub Actions on pull request/push:

1. lockfile/install cache and frozen install
2. lint, typecheck, unit
3. PostgreSQL/Redis integration tests and migrations from empty DB
4. build web/API and Docker images
5. Playwright critical E2E + axe in production-like services
6. secret/dependency/SAST/container scans and SBOM
7. traceability/preflight contract checks

Production deployment is not automatic from an unreviewed branch. Use an approved manual environment/release workflow or `make deploy` on the server with protected credentials.

`docs/OPERATIONS.md` is the executable handoff for backup pairing, restore drill, health evidence, and application-only rollback.

## Monitoring and incident response

Use structured logs, correlation IDs, `/health/live`, `/health/ready`, provider/queue/ClamAV/disk/backup status, persisted sanitized error events, and an authorized admin system-errors view. Avoid a heavyweight Sentry stack on this host. Add one resource-light external or host-level uptime probe only after the operator selects its destination.

Runbooks cover provider outage, ClamAV failure, callback backlog, disk pressure, DB recovery, compromised staff session, suspected data exposure, rollback, and customer notification escalation.
