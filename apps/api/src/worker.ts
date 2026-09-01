import { setTimeout as wait } from 'node:timers/promises';
import { loadConfig } from '@novin/config';
import { createDatabase } from '@novin/db';

const config = loadConfig();
const { pool } = createDatabase(config.DATABASE_URL);
process.stdout.write('novin worker started\n');
for (;;) {
  await pool.query('SELECT 1');
  await wait(30_000);
}
