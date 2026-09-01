import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { loadConfig } from '@novin/config';
import { createDatabase } from '@novin/db';

const config = loadConfig();
const { pool } = createDatabase(config.DATABASE_URL);

async function retentionSweep() {
  const expired = await pool.query<{ id: string; storage_name: string }>("UPDATE attachments SET status = 'EXPIRED' WHERE status = 'CLEAN' AND expires_at IS NOT NULL AND expires_at < now() RETURNING id, storage_name");
  for (const attachment of expired.rows) await rm(join(process.cwd(), 'var/uploads/clean', attachment.storage_name), { force: true }).catch(() => undefined);
  const people = await pool.query<{ id: string }>("UPDATE users SET first_name = NULL, last_name = NULL, email = CONCAT('anonymized-', id, '@invalid.local'), mobile = CONCAT('anon', substring(replace(id::text, '-', '') from 1 for 12)), job_title = NULL, active = false, updated_at = now() WHERE anonymization_requested_at IS NOT NULL AND anonymization_requested_at < now() - interval '30 days' AND active = true RETURNING id");
  if (people.rows.length) await pool.query('UPDATE sessions SET revoked_at = now() WHERE revoked_at IS NULL AND user_id = ANY($1::uuid[])', [people.rows.map((person) => person.id)]);
  process.stdout.write(`retention sweep: ${expired.rows.length} attachments expired, ${people.rows.length} users anonymized\n`);
}

process.stdout.write('novin worker started\n');
for (;;) {
  await pool.query('SELECT 1');
  await retentionSweep();
  await wait(60 * 60_000);
}
