# Operations runbook

This runbook is for an approved Ubuntu 24.04 deployment account. It never treats the development `.env` or synthetic data as production input.

## Before a production deployment

1. Copy `.env.example` outside source control, set mode `0600`, and set `APP_UID`/`APP_GID` to the deployment account that owns `var/`.
2. Run `make bootstrap ENV=production`. It rejects a symlinked runtime directory and mismatched write-mount ownership.
3. Replace every provider, company, legal, backup-recipient, and HTTPS value. Then run `make preflight-production`; a non-zero exit is a release stop.
4. Verify the host Nginx configuration with its approved TLS certificate. Only the loopback port `127.0.0.1:3050` may be reachable from the host.

## Deployment and verification

Run `make deploy ENV=production` from a clean, approved Git checkout. It creates an encrypted database-and-upload backup, builds images tagged with the current Git SHA, applies only forward migrations, starts the service, and verifies `/health`.

The successful SHA is saved below ignored `var/releases/`. Deployment failure never attempts a database downgrade. Inspect logs with `make logs` and stop with `make down` only when the incident commander authorizes it.

## Backup and recovery

`make backup ENV=production` creates a matching pair of `*.dump.age` and `*.uploads.tar.age` files plus SHA-256 checksums. It retains 7 recent daily pairs and, on Sunday, 4 weekly pairs. The private age identity is not stored in the repository or server checkout.

The ClamAV service must have an approved, current signature feed (or a documented private mirror) before it can become healthy. A CDN rate-limit response is a fail-closed upload and deployment condition, not a reason to bypass malware scanning.

For a synthetic development recovery only:

```bash
CONFIRM_RESTORE=RESTORE_SYNTHETIC_DEV_DATA \
AGE_IDENTITY_FILE=/absolute/path/to/dev-recovery-key.txt \
make restore ENV=dev BACKUP=var/backups/daily/novin-<timestamp>.dump.age
```

The optional `RESTORE_UPLOADS=RESTORE_SYNTHETIC_UPLOADS` extracts attached files into an inactive, timestamped staging folder for review; it never silently replaces active uploads. Test the database backup in an isolated disposable database with:

```bash
CONFIRM_RESTORE_DRILL=RESTORE_SYNTHETIC_DEV_DATA \
AGE_IDENTITY_FILE=/absolute/path/to/dev-recovery-key.txt \
make restore-drill ENV=dev BACKUP=var/backups/daily/novin-<timestamp>.dump.age
```

Record its duration, table-count sentinel, migration result, and any recovery decisions in the release evidence. A successful isolated drill is required to claim the 8-hour RTO target.

## Application rollback

Rollback is application-only; it does not downgrade schema or alter customer data. First inspect `var/releases/last-known-good.sha`, then execute:

```bash
CONFIRM_ROLLBACK=ROLLBACK_APPLICATION_ONLY \
make rollback ENV=production ROLLBACK_SHA=<recorded-sha>
```

The command refuses an image that is not present locally and performs health verification after restart. If a forward migration is incompatible, use the explicitly approved database-recovery runbook and incident process instead.

## Incident minimums

- Provider outage: retain orders in their pending state; never mark a payment paid from a browser redirect.
- ClamAV/readiness failure: reject uploads and investigate only sanitized service logs.
- Disk pressure or missing backup: halt deployment, preserve evidence, and escalate before data cleanup.
- Suspected staff-session compromise: disable the user, revoke sessions, retain audit records, rotate relevant credentials, and follow the legal notification decision.
